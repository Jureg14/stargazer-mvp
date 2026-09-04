import { EvaluatedHour } from '../scoring/scoreEngine';
import { CelestialTarget, MeteorShower, MoonInfo, SatellitePass } from '../types/astro';
import { ObservationWindow, WindowScoreDetails, WindowScoreFactor } from '../types/itinerary';
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

  // Compute detailed score breakdown for breakdown popup modal
  const avgSunAlt = Math.round((group.reduce((a, b) => a + b.sunAlt, 0) / group.length) * 10) / 10;
  const factors: WindowScoreFactor[] = [];

  if (avgSunAlt <= -18) {
    factors.push({
      category: 'Solar Darkness',
      score: 20,
      description: `True Astronomical Darkness (Sun altitude ${avgSunAlt}°)`,
      status: 'positive',
    });
  } else if (avgSunAlt <= -12) {
    factors.push({
      category: 'Solar Darkness',
      score: 10,
      description: `Astronomical Twilight (Sun altitude ${avgSunAlt}°)`,
      status: 'positive',
    });
  } else {
    factors.push({
      category: 'Solar Darkness',
      score: -20,
      description: `Nautical Twilight Glow (Sun altitude ${avgSunAlt}°)`,
      status: 'negative',
    });
  }

  if (avgCloud <= 10) {
    factors.push({
      category: 'Cloud Cover',
      score: 25,
      description: `Pristine Clear Skies (${avgCloud}% cloud cover)`,
      status: 'positive',
    });
  } else if (avgCloud <= 25) {
    factors.push({
      category: 'Cloud Cover',
      score: 15,
      description: `Mostly Clear (${avgCloud}% cloud cover)`,
      status: 'positive',
    });
  } else if (avgCloud <= 40) {
    factors.push({
      category: 'Cloud Cover',
      score: 0,
      description: `Scattered Clouds (${avgCloud}% cloud cover)`,
      status: 'neutral',
    });
  } else {
    factors.push({
      category: 'Cloud Cover',
      score: -30,
      description: `Significant Cloud Cover (${avgCloud}% cloud cover)`,
      status: 'negative',
    });
  }

  if (avgMoonAlt <= 0) {
    factors.push({
      category: 'Lunar Illumination',
      score: 15,
      description: 'Moon below horizon (Dark natural sky)',
      status: 'positive',
    });
  } else if (moonInfo.illuminationFraction <= 0.15) {
    factors.push({
      category: 'Lunar Illumination',
      score: 10,
      description: `Minimal Moon Glare (${Math.round(moonInfo.illuminationFraction * 100)}% Crescent)`,
      status: 'positive',
    });
  } else if (moonInfo.illuminationFraction <= 0.40) {
    factors.push({
      category: 'Lunar Illumination',
      score: 0,
      description: `Moderate Moonlight (${Math.round(moonInfo.illuminationFraction * 100)}% illuminated)`,
      status: 'neutral',
    });
  } else {
    factors.push({
      category: 'Lunar Illumination',
      score: -25,
      description: `Bright Lunar Glare (${Math.round(moonInfo.illuminationFraction * 100)}% illuminated)`,
      status: 'negative',
    });
  }

  if (seeing === 'Excellent') {
    factors.push({
      category: 'Atmospheric Seeing',
      score: 10,
      description: 'Pristine sub-arcsecond seeing stability',
      status: 'positive',
    });
  } else if (seeing === 'Good') {
    factors.push({
      category: 'Atmospheric Seeing',
      score: 5,
      description: 'Good seeing conditions & steady air',
      status: 'positive',
    });
  } else {
    factors.push({
      category: 'Atmospheric Seeing',
      score: -15,
      description: 'Atmospheric turbulence & unsteady air',
      status: 'negative',
    });
  }

  const optimalTargetsCount = targets.filter((t) => t.isOptimal).length;
  const targetBonus = Math.min(15, optimalTargetsCount * 5);
  if (targetBonus > 0) {
    factors.push({
      category: 'Target Availability',
      score: targetBonus,
      description: `${optimalTargetsCount} prime target${optimalTargetsCount > 1 ? 's' : ''} visible above 25° horizon altitude`,
      status: 'positive',
    });
  }

  const scoreDetails: WindowScoreDetails = {
    baseScore: 50,
    factors,
    finalScore: avgScore,
  };

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
    scoreDetails,
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
    scoreDetails,
  };
}
