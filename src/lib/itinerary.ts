import {
  Body,
  Equator,
  Horizon,
  Illumination,
  Observer,
} from 'astronomy-engine';

export interface HourlyWeatherData {
  time: string[];
  cloudcover: number[];
  visibility: number[];
  windspeed_10m: number[];
}

export interface StargazeSlot {
  time: Date;
  score: number;
  cloud: number;
  vis: number;
  wind: number;
  sunAlt: number;
  moonAlt: number;
  moonIllum: number;
  saturnAlt: number;
  jupiterAlt: number;
  objects: string[];
  conditions: string[];
}

export interface StargazeBlock {
  start: string;
  end: string;
  avgScore: number;
  avgCloud: number;
  objects: string[];
  conditions: string[];
  summary: string;
}

export function calculateStargazeItinerary(
  lat: number,
  lon: number,
  weatherHourly: HourlyWeatherData
): StargazeBlock[] {
  const observer = new Observer(lat, lon, 0);
  const slots: StargazeSlot[] = [];

  for (let i = 0; i < weatherHourly.time.length; i++) {
    const time = new Date(weatherHourly.time[i]);
    const cloud = weatherHourly.cloudcover[i] ?? 0;
    const vis = weatherHourly.visibility[i] ?? 10000;
    const wind = weatherHourly.windspeed_10m[i] ?? 0;

    // 1. Sun Position & Twilight
    const sunEq = Equator(Body.Sun, time, observer, true, true);
    const sunHor = Horizon(time, observer, sunEq.ra, sunEq.dec, 'normal');
    const sunAlt = sunHor.altitude;

    // 2. Moon Position & Illumination
    const moonEq = Equator(Body.Moon, time, observer, true, true);
    const moonHor = Horizon(time, observer, moonEq.ra, moonEq.dec, 'normal');
    const moonIllumInfo = Illumination(Body.Moon, time);
    const moonAlt = moonHor.altitude;
    const moonIllum = moonIllumInfo.phase_fraction;

    // 3. Planets
    const saturnEq = Equator(Body.Saturn, time, observer, true, true);
    const saturnHor = Horizon(time, observer, saturnEq.ra, saturnEq.dec, 'normal');
    const saturnAlt = Math.round(saturnHor.altitude);

    const jupiterEq = Equator(Body.Jupiter, time, observer, true, true);
    const jupiterHor = Horizon(time, observer, jupiterEq.ra, jupiterEq.dec, 'normal');
    const jupiterAlt = Math.round(jupiterHor.altitude);

    const objects: string[] = [];
    const conditions: string[] = [];

    // Target tracking
    if (saturnAlt > 20) {
      objects.push(`Saturn (${saturnAlt}°)`);
    }
    if (jupiterAlt > 20) {
      objects.push(`Jupiter (${jupiterAlt}°)`);
    }
    if (moonAlt > 10) {
      const pct = Math.round(moonIllum * 100);
      objects.push(`Moon (${pct}% lit)`);
    }

    // Atmospheric conditions check
    if (vis >= 15000 && wind < 15 && cloud < 20) {
      conditions.push('Excellent seeing');
    } else if (vis >= 10000 && cloud < 40) {
      conditions.push('Good transparency');
    }

    if (moonAlt <= 0 || moonIllum < 0.2) {
      conditions.push('Low moonlight');
      if (sunAlt <= -18 && cloud < 25) {
        objects.push('Milky Way core (dark sky)');
      }
    }

    // Scoring heuristic (0 to 100)
    let score = 50;

    // Darkness factor
    if (sunAlt > -6) {
      score = 0; // daylight or civil twilight
    } else if (sunAlt > -12) {
      score -= 20; // nautical twilight
    } else if (sunAlt <= -18) {
      score += 15; // astronomical night
    }

    // Cloud factor
    if (cloud <= 10) score += 25;
    else if (cloud <= 30) score += 10;
    else if (cloud <= 50) score -= 20;
    else score -= 50;

    // Lunar glare factor
    if (moonAlt > 0 && moonIllum > 0.6) {
      score -= 20;
    } else if (moonAlt <= 0 || moonIllum < 0.25) {
      score += 10;
    }

    // Seeing & Wind
    if (vis > 15000 && wind < 15) score += 10;
    if (wind > 30) score -= 15;

    // Objects bonus
    if (saturnAlt > 30 || jupiterAlt > 30) score += 10;

    const clampedScore = Math.max(0, Math.min(100, score));

    slots.push({
      time,
      score: clampedScore,
      cloud,
      vis,
      wind,
      sunAlt,
      moonAlt,
      moonIllum,
      saturnAlt,
      jupiterAlt,
      objects,
      conditions,
    });
  }

  // Window Clustering (Score >= 55 and Cloud <= 45% and Sun <= -6)
  const blocks: StargazeBlock[] = [];
  let currentGroup: StargazeSlot[] = [];

  for (const slot of slots) {
    const isEligible = slot.score >= 55 && slot.cloud <= 45 && slot.sunAlt <= -6;

    if (isEligible) {
      currentGroup.push(slot);
    } else {
      if (currentGroup.length > 0) {
        blocks.push(buildBlockFromGroup(currentGroup));
        currentGroup = [];
      }
    }
  }

  if (currentGroup.length > 0) {
    blocks.push(buildBlockFromGroup(currentGroup));
  }

  return blocks;
}

function buildBlockFromGroup(slots: StargazeSlot[]): StargazeBlock {
  const start = slots[0].time.toISOString();
  const end = slots[slots.length - 1].time.toISOString();

  const avgScore = Math.round(
    slots.reduce((acc, s) => acc + s.score, 0) / slots.length
  );
  const avgCloud = Math.round(
    slots.reduce((acc, s) => acc + s.cloud, 0) / slots.length
  );

  const objectsSet = new Set<string>();
  const conditionsSet = new Set<string>();

  for (const s of slots) {
    s.objects.forEach((o) => objectsSet.add(o));
    s.conditions.forEach((c) => conditionsSet.add(c));
  }

  const objects = Array.from(objectsSet);
  const conditions = Array.from(conditionsSet);

  const summary = `${avgCloud}% cloud cover, ${conditions.join(', ') || 'Fair sky'}. Visible: ${objects.join(', ') || 'Constellations'}`;

  return {
    start,
    end,
    avgScore,
    avgCloud,
    objects,
    conditions,
    summary,
  };
}
