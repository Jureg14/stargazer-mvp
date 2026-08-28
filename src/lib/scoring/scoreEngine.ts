import { Body, Equator, Horizon, Observer } from 'astronomy-engine';
import { BortleClass, CelestialTarget, MoonInfo } from '../types/astro';
import { HourlyScoreBreakdown } from '../types/itinerary';
import { HourlyWeatherRecord } from '../types/weather';
import { getBortleInfo } from '../astro/bortle';

export interface EvaluatedHour {
  time: Date;
  score: number;
  weather: HourlyWeatherRecord;
  sunAlt: number;
  moonAlt: number;
  moonIllumFraction: number;
  seeingQuality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  transparencyQuality: 'Pristine' | 'Good' | 'Hazy' | 'Poor';
  visibleTargets: CelestialTarget[];
  breakdown: HourlyScoreBreakdown;
}

/**
 * Evaluates observation quality for an individual hour including Bortle light pollution.
 */
export function evaluateHourlyQuality(
  time: Date,
  weather: HourlyWeatherRecord,
  observer: Observer,
  moonInfo: MoonInfo,
  planets: CelestialTarget[],
  dsoTargets: CelestialTarget[],
  userBortle: BortleClass = 4
): EvaluatedHour {
  // 1. Sun Altitude & Darkness
  const sunEq = Equator(Body.Sun, time, observer, true, true);
  const sunHor = Horizon(time, observer, sunEq.ra, sunEq.dec, 'normal');
  const sunAlt = Math.round(sunHor.altitude * 10) / 10;

  // 2. Moon Altitude at specific time
  const moonEq = Equator(Body.Moon, time, observer, true, true);
  const moonHor = Horizon(time, observer, moonEq.ra, moonEq.dec, 'normal');
  const moonAlt = Math.round(moonHor.altitude * 10) / 10;
  const moonIllum = moonInfo.illuminationFraction;

  // 3. Active visible celestial targets during this hour
  const activeTargets: CelestialTarget[] = [];
  const targetNames: string[] = [];

  // Evaluate Moon at this hour
  if (moonAlt > 0) {
    activeTargets.push({
      id: 'moon',
      name: `Moon (${moonInfo.phaseName})`,
      type: 'moon',
      body: Body.Moon,
      altitude: moonAlt,
      azimuth: Math.round(moonHor.azimuth * 10) / 10,
      magnitude: moonInfo.magnitude,
      isAboveHorizon: true,
      isOptimal: moonAlt >= 15,
      notes: `${Math.round(moonIllum * 100)}% illuminated; ${moonInfo.phaseName}`,
    });
    targetNames.push(`Moon (${Math.round(moonAlt)}°)`);
  }

  // Evaluate planets at this hour
  for (const p of planets) {
    const pEq = Equator(p.body ?? Body.Saturn, time, observer, true, true);
    const pHor = Horizon(time, observer, pEq.ra, pEq.dec, 'normal');
    if (pHor.altitude > 15) {
      activeTargets.push({
        ...p,
        altitude: Math.round(pHor.altitude * 10) / 10,
        azimuth: Math.round(pHor.azimuth * 10) / 10,
        isAboveHorizon: pHor.altitude > 0,
        isOptimal: pHor.altitude >= 25,
      });
      targetNames.push(`${p.name} (${Math.round(pHor.altitude)}°)`);
    }
  }

  // Evaluate DSOs & Milky Way at this hour (respecting user Bortle filter)
  for (const d of dsoTargets) {
    if (d.minBortleClass && userBortle > d.minBortleClass) {
      continue; // Skip if light pollution renders object invisible
    }

    const dEq = Equator(d.body ?? Body.Star1, time, observer, true, true);
    const dHor = Horizon(time, observer, dEq.ra, dEq.dec, 'normal');
    if (dHor.altitude > 20) {
      // DSOs require low moonlight (< 40% or moon below horizon) and dark sky (sun < -12)
      const isDSOObservable = (moonAlt <= 0 || moonIllum < 0.4) && sunAlt <= -12;
      if (isDSOObservable) {
        activeTargets.push({
          ...d,
          altitude: Math.round(dHor.altitude * 10) / 10,
          azimuth: Math.round(dHor.azimuth * 10) / 10,
          isAboveHorizon: dHor.altitude > 0,
          isOptimal: dHor.altitude >= 30,
        });
        targetNames.push(`${d.name} (${Math.round(dHor.altitude)}°)`);
      }
    }
  }

  // 4. Seeing & Transparency Classification
  let seeingQuality: 'Excellent' | 'Good' | 'Fair' | 'Poor' = 'Fair';
  if (weather.cloudCover < 15 && weather.visibilityMeters > 20000 && weather.windSpeedKmh < 15) {
    seeingQuality = 'Excellent';
  } else if (weather.cloudCover < 35 && weather.visibilityMeters > 14000 && weather.windSpeedKmh < 22) {
    seeingQuality = 'Good';
  } else if (weather.cloudCover > 60 || weather.visibilityMeters < 8000 || weather.windSpeedKmh > 30) {
    seeingQuality = 'Poor';
  }

  let transparencyQuality: 'Pristine' | 'Good' | 'Hazy' | 'Poor' = 'Good';
  if (weather.visibilityMeters >= 22000 && weather.cloudHigh < 10) {
    transparencyQuality = 'Pristine';
  } else if (weather.visibilityMeters < 10000 || weather.cloudHigh > 50) {
    transparencyQuality = 'Hazy';
  }

  // 5. Composite Heuristic Scoring
  let score = 50;

  // Solar depression factor
  if (sunAlt > -6) {
    score = 0; // daylight or civil twilight
  } else if (sunAlt > -12) {
    score -= 20; // nautical twilight
  } else if (sunAlt > -18) {
    score += 10; // astronomical twilight
  } else {
    score += 20; // true astronomical darkness
  }

  // Cloud cover factor
  if (sunAlt <= -6) {
    if (weather.cloudCover <= 10) score += 25;
    else if (weather.cloudCover <= 25) score += 15;
    else if (weather.cloudCover <= 40) score += 0;
    else if (weather.cloudCover <= 60) score -= 30;
    else score = 0; // heavy overcast
  }

  // Lunar glare & Bortle Light pollution (only applies when dark and cloud isn't overcast)
  if (score > 0) {
    // Lunar factor
    if (moonAlt <= 0) {
      score += 15; // Moon below horizon
    } else {
      if (moonIllum <= 0.15) score += 10;
      else if (moonIllum <= 0.40) score += 0;
      else if (moonIllum <= 0.70) score -= 15;
      else score -= 25; // bright moon glare
    }

    // Bortle light pollution penalty
    const bortleInfo = getBortleInfo(userBortle);
    score += Math.round(bortleInfo.penaltyScore * 0.4); // Scale penalty to score

    // Atmospheric conditions
    if (seeingQuality === 'Excellent') score += 10;
    if (seeingQuality === 'Poor') score -= 15;

    // Condensation/dew risk
    if (weather.dewDepressionC < 2.0 && weather.relativeHumidity > 85) {
      score -= 8;
    }

    // Active targets bonus
    const primeCount = activeTargets.filter((t) => t.isOptimal).length;
    score += Math.min(15, primeCount * 5);
  }

  const finalScore = Math.max(0, Math.min(100, Math.round(score)));

  const breakdown: HourlyScoreBreakdown = {
    time: time.toISOString(),
    totalScore: finalScore,
    cloudCover: Math.round(weather.cloudCover),
    sunAlt,
    moonAlt,
    moonIllumPct: Math.round(moonIllum * 100),
    seeingQuality,
    transparencyQuality,
    isNight: sunAlt <= -6,
    isAstronomicalDarkness: sunAlt <= -18,
    visibleTargetsCount: activeTargets.length,
    targetNames,
  };

  return {
    time,
    score: finalScore,
    weather,
    sunAlt,
    moonAlt,
    moonIllumFraction: moonIllum,
    seeingQuality,
    transparencyQuality,
    visibleTargets: activeTargets,
    breakdown,
  };
}
