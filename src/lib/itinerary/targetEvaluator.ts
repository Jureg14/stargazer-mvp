import { format } from 'date-fns';
import { BortleClass, CelestialTarget, MoonInfo, TargetEvaluation, TargetQualityTier } from '../types/astro';
import { EvaluatedHour } from '../scoring/scoreEngine';

interface HourlyTargetStatus {
  time: Date;
  altitude: number;
  cloudCover: number;
  seeing: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  transparency: 'Pristine' | 'Good' | 'Hazy' | 'Poor';
  moonAlt: number;
  moonIllum: number;
  sunAlt: number;
  suitabilityScore: number;
}

/**
 * Finds the closest altitude for a target at a given timestamp using its altitude history.
 */
function getTargetAltitudeAtTime(target: CelestialTarget, time: Date): number {
  if (!target.altitudeHistory || target.altitudeHistory.length === 0) {
    return target.altitude;
  }

  const targetTimeMs = time.getTime();
  let closest = target.altitudeHistory[0];
  let minDiff = Math.abs(new Date(closest.time).getTime() - targetTimeMs);

  for (let i = 1; i < target.altitudeHistory.length; i++) {
    const diff = Math.abs(new Date(target.altitudeHistory[i].time).getTime() - targetTimeMs);
    if (diff < minDiff) {
      minDiff = diff;
      closest = target.altitudeHistory[i];
    }
  }

  return closest.altitude;
}

/**
 * Evaluates observation suitability for a single hour based on physical domain rules:
 * - Planets / High magnification: Sensitive to atmospheric seeing and altitude; resilient to moonlight.
 * - Deep Sky Objects: Sensitive to solar darkness, transparency, moonlight glare, and Bortle light pollution.
 */
function evaluateTargetHour(
  target: CelestialTarget,
  hour: EvaluatedHour,
  altitude: number,
  userBortle: BortleClass
): number {
  // If below horizon or behind heavy clouds, unsuitable
  if (altitude <= 0 || hour.weather.cloudCover >= 70) {
    return 0;
  }

  let score = 50;

  // 1. Sun Darkness Threshold
  if (target.type === 'dso' || target.type === 'milkyway') {
    // DSOs strictly require nautical or astronomical darkness
    if (hour.sunAlt <= -18) {
      score += 20; // True astronomical darkness
    } else if (hour.sunAlt <= -12) {
      score += 10;
    } else {
      return 0; // Faint nebulae/galaxies are invisible during civil/nautical dusk
    }
  } else {
    // Planets & Moon can be observed as soon as Sun is below -6° (civil dusk)
    if (hour.sunAlt <= -12) {
      score += 15;
    } else if (hour.sunAlt <= -6) {
      score += 5;
    } else {
      score -= 25;
    }
  }

  // 2. Target Altitude (Atmospheric Column & Extinction)
  if (altitude >= 50) {
    score += 25; // Thin atmosphere near zenith
  } else if (altitude >= 35) {
    score += 18;
  } else if (altitude >= 20) {
    score += 8;
  } else if (altitude >= 15) {
    score -= 10; // High atmospheric dispersion & extinction
  } else {
    return Math.max(0, score - 35); // Poor horizon view
  }

  // 3. Cloud Cover
  if (hour.weather.cloudCover <= 10) {
    score += 20;
  } else if (hour.weather.cloudCover <= 25) {
    score += 10;
  } else if (hour.weather.cloudCover <= 45) {
    score -= 10;
  } else {
    score -= 30;
  }

  // 4. Seeing vs. Transparency & Moon Glare differentiation
  const isPlanetary = target.type === 'planet' || target.type === 'moon';
  const isDSO = target.type === 'dso' || target.type === 'milkyway';

  if (isPlanetary) {
    // Seeing is critical for high-magnification planetary discs and lunar craters
    switch (hour.seeingQuality) {
      case 'Excellent':
        score += 25;
        break;
      case 'Good':
        score += 15;
        break;
      case 'Fair':
        score -= 5;
        break;
      case 'Poor':
        score -= 30; // Turbulent air destroys planetary detail
        break;
    }
    // Moonlight has negligible impact on bright planets
  } else if (isDSO) {
    // Transparency & darkness are critical for low-surface-brightness DSOs
    switch (hour.transparencyQuality) {
      case 'Pristine':
        score += 20;
        break;
      case 'Good':
        score += 10;
        break;
      case 'Hazy':
      case 'Poor':
        score -= 25; // Haze washes out faint spiral arms & nebulosity
        break;
    }

    // Moonlight Interference
    const moonIsUp = hour.moonAlt > 0;
    const moonLit = hour.moonIllumFraction;

    if (!moonIsUp) {
      score += 25; // Pristine dark sky with Moon below horizon
    } else if (moonLit < 0.15) {
      score += 15; // Slim crescent, low glare
    } else if (moonLit < 0.35) {
      score -= 5;
    } else if (moonLit < 0.6) {
      score -= 20;
    } else {
      score -= 40; // Bright gibbous/full moon washes out DSOs
    }

    // Bortle light pollution penalty
    if (target.minBortleClass && userBortle > target.minBortleClass) {
      const bortleDiff = userBortle - target.minBortleClass;
      score -= bortleDiff * 25;
    }
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Evaluates a single target for the entire night.
 */
export function evaluateTargetTonight(
  target: CelestialTarget,
  nightHours: EvaluatedHour[],
  moonInfo: MoonInfo,
  userBortle: BortleClass
): TargetEvaluation {
  // Peak altitude calculation across all night sample points
  let peakAltitude = 0;
  if (target.altitudeHistory && target.altitudeHistory.length > 0) {
    peakAltitude = Math.max(...target.altitudeHistory.map((p) => p.altitude));
  } else {
    peakAltitude = target.altitude;
  }
  peakAltitude = Math.round(peakAltitude);

  // 1. Check if completely below horizon all night
  if (peakAltitude <= 0) {
    return {
      tier: 'poor',
      tierLabel: 'Poor tonight',
      bestWindow: 'Below horizon all night',
      peakAltitude: 0,
      conditionSummary: 'Below horizon all night',
      metricType: 'reason',
      metricLabel: 'Status',
      metricValue: 'Below horizon all night',
      poorReason: 'Below horizon all night',
      score: 0,
    };
  }

  // 2. Evaluate all dark hours for this target
  const darkHours = nightHours.filter((h) => h.sunAlt <= -6);
  const hourlyStatuses: HourlyTargetStatus[] = darkHours.map((h) => {
    const alt = getTargetAltitudeAtTime(target, h.time);
    const suitabilityScore = evaluateTargetHour(target, h, alt, userBortle);
    return {
      time: h.time,
      altitude: alt,
      cloudCover: h.weather.cloudCover,
      seeing: h.seeingQuality,
      transparency: h.transparencyQuality,
      moonAlt: h.moonAlt,
      moonIllum: h.moonIllumFraction,
      sunAlt: h.sunAlt,
      suitabilityScore,
    };
  });

  // Find continuous intervals where suitabilityScore >= 45 and altitude >= 18
  const eligibleHours = hourlyStatuses.filter((s) => s.suitabilityScore >= 45 && s.altitude >= 18);

  let bestWindowStr = '';
  let windowHours: HourlyTargetStatus[] = [];

  if (eligibleHours.length > 0) {
    // Find highest average contiguous cluster
    let bestCluster: HourlyTargetStatus[] = [];
    let currentCluster: HourlyTargetStatus[] = [];

    for (let i = 0; i < hourlyStatuses.length; i++) {
      const s = hourlyStatuses[i];
      const prev = currentCluster.length > 0 ? currentCluster[currentCluster.length - 1] : null;
      const isContiguous = !prev || Math.abs(s.time.getTime() - prev.time.getTime()) <= 3600000 * 1.5;

      if (s.suitabilityScore >= 45 && s.altitude >= 18 && isContiguous) {
        currentCluster.push(s);
      } else {
        if (currentCluster.length > bestCluster.length) {
          bestCluster = currentCluster;
        }
        currentCluster = s.suitabilityScore >= 45 && s.altitude >= 18 ? [s] : [];
      }
    }
    if (currentCluster.length > bestCluster.length) {
      bestCluster = currentCluster;
    }

    if (bestCluster.length === 0) {
      bestCluster = eligibleHours;
    }

    windowHours = bestCluster;
    const startHour = bestCluster[0].time;
    const lastHour = bestCluster[bestCluster.length - 1].time;
    // Window extends to top of the next hour
    const endHour = new Date(lastHour.getTime() + 60 * 60 * 1000);

    bestWindowStr = `${format(startHour, 'HH:mm')}–${format(endHour, 'HH:mm')}`;
  } else {
    // For poor targets or when no prime-score hours exist, determine the best watching period tonight
    // based on when the object is at its highest altitude (and relatively lowest clouds)
    const aboveHorizon = hourlyStatuses.filter((h) => h.altitude > 0);
    const pool = aboveHorizon.length > 0 ? aboveHorizon : hourlyStatuses;

    if (pool.length > 0 && peakAltitude > 0) {
      // Find the hour where altitude is highest (break ties with lowest cloud cover)
      let peakHour = pool[0];
      for (const h of pool) {
        if (
          h.altitude > peakHour.altitude ||
          (h.altitude === peakHour.altitude && h.cloudCover < peakHour.cloudCover)
        ) {
          peakHour = h;
        }
      }

      // Group contiguous hours around peakHour where target is in its highest elevated position
      const minWindowAlt = Math.max(1, peakHour.altitude * 0.65);
      const peakIdx = pool.indexOf(peakHour);
      let startIdx = peakIdx;
      let endIdx = peakIdx;

      while (
        startIdx > 0 &&
        pool[startIdx - 1].altitude >= minWindowAlt &&
        Math.abs(pool[startIdx].time.getTime() - pool[startIdx - 1].time.getTime()) <= 3600000 * 1.5
      ) {
        startIdx--;
      }
      while (
        endIdx < pool.length - 1 &&
        pool[endIdx + 1].altitude >= minWindowAlt &&
        Math.abs(pool[endIdx + 1].time.getTime() - pool[endIdx].time.getTime()) <= 3600000 * 1.5
      ) {
        endIdx++;
      }

      const cluster = pool.slice(startIdx, endIdx + 1);
      windowHours = cluster;
      const startHour = cluster[0].time;
      const lastHour = cluster[cluster.length - 1].time;
      const endHour = new Date(lastHour.getTime() + 60 * 60 * 1000);

      bestWindowStr = `${format(startHour, 'HH:mm')}–${format(endHour, 'HH:mm')}`;
    } else {
      bestWindowStr = 'Below horizon all night';
    }
  }

  // Determine prevailing conditions during the window or peak hour
  const representativeHours = windowHours.length > 0 ? windowHours : hourlyStatuses;
  const avgCloud = Math.round(
    representativeHours.reduce((acc, h) => acc + h.cloudCover, 0) / Math.max(1, representativeHours.length)
  );

  const seeingCounts = { Excellent: 0, Good: 0, Fair: 0, Poor: 0 };
  representativeHours.forEach((h) => {
    seeingCounts[h.seeing]++;
  });
  let windowSeeing: 'Excellent' | 'Good' | 'Fair' | 'Poor' = 'Fair';
  if (seeingCounts.Excellent >= representativeHours.length / 2) windowSeeing = 'Excellent';
  else if (seeingCounts.Good + seeingCounts.Excellent >= representativeHours.length / 2) windowSeeing = 'Good';
  else if (seeingCounts.Poor > representativeHours.length / 2) windowSeeing = 'Poor';

  // Moon interference assessment during window
  let windowMoonInterference: 'Low' | 'Moderate' | 'High' = 'Low';
  const avgMoonAlt = representativeHours.reduce((acc, h) => acc + h.moonAlt, 0) / Math.max(1, representativeHours.length);
  const moonIllum = moonInfo.illuminationFraction;

  if (avgMoonAlt <= 0 || moonIllum < 0.2) {
    windowMoonInterference = 'Low';
  } else if (moonIllum < 0.5) {
    windowMoonInterference = 'Moderate';
  } else {
    windowMoonInterference = 'High';
  }

  // Calculate composite score
  const avgSuitability = representativeHours.length > 0
    ? Math.round(representativeHours.reduce((acc, h) => acc + h.suitabilityScore, 0) / representativeHours.length)
    : 0;

  // 3. Determine Quality Tier (🟢 Excellent, 🟡 Good, 🔴 Poor tonight)
  let tier: TargetQualityTier = 'poor';
  let tierLabel = 'Poor tonight';
  let poorReason: string | undefined = undefined;

  const isDSO = target.type === 'dso' || target.type === 'milkyway';
  const isPlanetary = target.type === 'planet' || target.type === 'moon';
  const isLightPollutedOut = Boolean(target.minBortleClass && userBortle > target.minBortleClass);

  if (isLightPollutedOut) {
    tier = 'poor';
    tierLabel = 'Poor tonight';
    poorReason = `Washed out in Bortle ${userBortle} (requires ≤ ${target.minBortleClass})`;
  } else if (peakAltitude < 20 && (windowSeeing === 'Poor' || avgCloud > 35)) {
    tier = 'poor';
    tierLabel = 'Poor tonight';
    poorReason = 'Low altitude + poor seeing';
  } else if (peakAltitude < 18) {
    tier = 'poor';
    tierLabel = 'Poor tonight';
    poorReason = `Low altitude (peak ${peakAltitude}°)`;
  } else if (avgCloud >= 65) {
    tier = 'poor';
    tierLabel = 'Poor tonight';
    poorReason = `Overcast cloud cover (${avgCloud}%)`;
  } else if (isDSO && windowMoonInterference === 'High' && avgMoonAlt > 15) {
    tier = 'poor';
    tierLabel = 'Poor tonight';
    poorReason = 'Washed out by bright moonlight';
  } else if (isPlanetary && windowSeeing === 'Poor') {
    tier = 'poor';
    tierLabel = 'Poor tonight';
    poorReason = 'Poor atmospheric seeing';
  } else if (
    avgSuitability >= 68 &&
    peakAltitude >= 35 &&
    avgCloud <= 25 &&
    (!isDSO || windowMoonInterference === 'Low') &&
    (!isPlanetary || windowSeeing === 'Excellent' || windowSeeing === 'Good')
  ) {
    tier = 'excellent';
    tierLabel = 'Excellent';
  } else if (avgSuitability >= 45 && peakAltitude >= 20 && avgCloud <= 45) {
    tier = 'good';
    tierLabel = 'Good';
  } else {
    tier = 'poor';
    tierLabel = 'Poor tonight';
    poorReason = poorReason || (avgCloud > 45 ? `High clouds (${avgCloud}%)` : 'Low altitude + poor seeing');
  }

  // 4. Format primary condition metric exactly as requested in example
  let metricType: 'seeing' | 'moon' | 'reason' = 'seeing';
  let metricLabel = 'Seeing';
  let metricValue = '';
  let conditionSummary = '';

  if (tier === 'poor' && poorReason) {
    metricType = 'reason';
    metricLabel = 'Status';
    metricValue = poorReason;
    conditionSummary = poorReason;
  } else if (isPlanetary) {
    metricType = 'seeing';
    metricLabel = 'Seeing';
    metricValue = windowSeeing;
    conditionSummary = `Seeing: ${windowSeeing}`;
  } else {
    metricType = 'moon';
    metricLabel = 'Moon interference';
    metricValue = windowMoonInterference;
    conditionSummary = `Moon interference: ${windowMoonInterference}`;
  }

  return {
    tier,
    tierLabel,
    bestWindow: bestWindowStr,
    peakAltitude,
    conditionSummary,
    metricType,
    metricLabel,
    metricValue,
    poorReason,
    seeingQuality: windowSeeing,
    moonInterference: windowMoonInterference,
    cloudCover: avgCloud,
    score: avgSuitability,
  };
}

/**
 * Evaluates all celestial targets and sorts them:
 * 🟢 Excellent > 🟡 Good > 🔴 Poor tonight, sub-sorted by score and peak altitude.
 */
export function evaluateAllTargets(
  targets: CelestialTarget[],
  nightHours: EvaluatedHour[],
  moonInfo: MoonInfo,
  userBortle: BortleClass
): CelestialTarget[] {
  const evaluated = targets.map((target) => {
    const evaluation = evaluateTargetTonight(target, nightHours, moonInfo, userBortle);
    return {
      ...target,
      evaluation,
      statusTier: evaluation.tier,
      statusLabel: evaluation.tierLabel,
      bestWindow: evaluation.bestWindow,
      peakAltitude: evaluation.peakAltitude,
      conditionSummary: evaluation.conditionSummary,
      poorReason: evaluation.poorReason,
    };
  });

  const tierWeight: Record<TargetQualityTier, number> = {
    excellent: 3,
    good: 2,
    poor: 1,
  };

  return evaluated.sort((a, b) => {
    const tierA = a.statusTier ? tierWeight[a.statusTier] : 0;
    const tierB = b.statusTier ? tierWeight[b.statusTier] : 0;
    if (tierB !== tierA) {
      return tierB - tierA;
    }
    const scoreA = a.evaluation?.score ?? 0;
    const scoreB = b.evaluation?.score ?? 0;
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }
    return (b.peakAltitude ?? b.altitude) - (a.peakAltitude ?? a.altitude);
  });
}
