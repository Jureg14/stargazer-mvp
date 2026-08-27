import { EvaluatedHour } from '../scoring/scoreEngine';
import { CelestialTarget, MeteorShower, MoonInfo, SatellitePass } from '../types/astro';
import { ObservationWindow } from '../types/itinerary';
import { generateWindowNarrative } from './formatter';

/**
 * Clusters contiguous eligible observation hours into continuous viewing blocks.
 */
export function clusterObservationWindows(
  hours: EvaluatedHour[],
  moonInfo: MoonInfo,
  satellites: SatellitePass[] = [],
  meteors: MeteorShower[] = []
): ObservationWindow[] {
  const windows: ObservationWindow[] = [];
  let currentGroup: EvaluatedHour[] = [];

  for (const h of hours) {
    // Eligible if score >= 45, clouds <= 45%, and sun is below horizon
    const isEligible = h.score >= 45 && h.weather.cloudCover <= 45 && h.sunAlt <= -6;

    if (isEligible) {
      currentGroup.push(h);
    } else {
      if (currentGroup.length > 0) {
        windows.push(buildWindowFromGroup(currentGroup, moonInfo, windows.length + 1, satellites, meteors));
        currentGroup = [];
      }
    }
  }

  if (currentGroup.length > 0) {
    windows.push(buildWindowFromGroup(currentGroup, moonInfo, windows.length + 1, satellites, meteors));
  }

  // Sort windows by average score descending
  return windows.sort((a, b) => b.avgScore - a.avgScore);
}

function buildWindowFromGroup(
  group: EvaluatedHour[],
  moonInfo: MoonInfo,
  index: number,
  satellites: SatellitePass[],
  meteors: MeteorShower[]
): ObservationWindow {
  const startDate = group[0].time;
  const endDate = group[group.length - 1].time;

  // Add 1 hour to end date to represent interval coverage
  const intervalEnd = new Date(endDate.getTime() + 60 * 60 * 1000);

  const scores = group.map((h) => h.score);
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);

  const avgCloud = Math.round(
    group.reduce((a, b) => a + b.weather.cloudCover, 0) / group.length
  );

  // Seeing count
  const excellentCount = group.filter((h) => h.seeingQuality === 'Excellent').length;
  const goodCount = group.filter((h) => h.seeingQuality === 'Good').length;
  let seeing: 'Excellent' | 'Good' | 'Fair' = 'Fair';
  if (excellentCount >= group.length / 2) seeing = 'Excellent';
  else if (goodCount + excellentCount >= group.length / 2) seeing = 'Good';

  // Moon status in this window
  const avgMoonAlt = group.reduce((a, b) => a + b.moonAlt, 0) / group.length;
  let moonStatus = 'low moonlight';
  if (avgMoonAlt <= 0) {
    moonStatus = 'Moon below horizon (dark sky)';
  } else if (moonInfo.illuminationFraction < 0.25) {
    moonStatus = `Crescent Moon (${Math.round(moonInfo.illuminationFraction * 100)}% lit)`;
  } else {
    moonStatus = `Moonlit (${Math.round(moonInfo.illuminationFraction * 100)}% lit, alt ${Math.round(avgMoonAlt)}°)`;
  }

  // Aggregate highlights & targets
  const targetMap = new Map<string, CelestialTarget>();
  const highlightsSet = new Set<string>();

  for (const h of group) {
    for (const t of h.visibleTargets) {
      if (!targetMap.has(t.id) || (targetMap.get(t.id)?.altitude ?? 0) < t.altitude) {
        targetMap.set(t.id, t);
      }
    }
  }

  targetMap.forEach((t) => {
    if (t.isOptimal) {
      highlightsSet.add(`${t.name} at ${Math.round(t.altitude)}° altitude`);
    }
  });

  // Check matching satellite passes during this window
  const matchingSats = satellites.filter((s) => {
    const pTime = new Date(s.peakTime).getTime();
    return pTime >= startDate.getTime() && pTime <= intervalEnd.getTime();
  });

  matchingSats.forEach((s) => {
    highlightsSet.add(`${s.satelliteName.split(' ')[0]} pass (max alt ${s.maxAltitudeDeg}°)`);
  });

  const highlights = Array.from(highlightsSet);
  if (highlights.length === 0) {
    highlights.push('Constellations and bright stars');
  }

  const targets = Array.from(targetMap.values());
  const durationMinutes = Math.round((intervalEnd.getTime() - startDate.getTime()) / (60 * 1000));

  const partialWindow: Partial<ObservationWindow> = {
    id: `window-${index}`,
    start: startDate.toISOString(),
    end: intervalEnd.toISOString(),
    durationMinutes,
    avgScore,
    minScore,
    maxScore,
    avgCloud,
    seeing,
    transparency: 'High transparency',
    moonStatus,
    highlights,
    targets,
    satellites: matchingSats,
    meteors,
  };

  const narrative = generateWindowNarrative(partialWindow);

  return {
    id: `window-${index}`,
    start: startDate.toISOString(),
    end: intervalEnd.toISOString(),
    durationMinutes,
    avgScore,
    minScore,
    maxScore,
    avgCloud,
    seeing,
    transparency: 'High transparency',
    moonStatus,
    highlights,
    narrative,
    targets,
    satellites: matchingSats,
    meteors,
  };
}
