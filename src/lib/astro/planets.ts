import {
  Body,
  Constellation,
  Equator,
  Horizon,
  Illumination,
  Observer,
} from 'astronomy-engine';
import { AltitudePoint, CelestialTarget } from '../types/astro';
import { getNightSampleTimes } from './twilight';

interface PlanetConfig {
  id: string;
  name: string;
  body: Body;
  notes: string;
}

const PLANETS: PlanetConfig[] = [
  { id: 'venus', name: 'Venus', body: Body.Venus, notes: 'Brilliant evening/morning beacon' },
  { id: 'mars', name: 'Mars', body: Body.Mars, notes: 'Red Planet with distinct reddish hue' },
  { id: 'jupiter', name: 'Jupiter', body: Body.Jupiter, notes: 'Gas Giant; 4 Galilean moons visible in binoculars' },
  { id: 'saturn', name: 'Saturn', body: Body.Saturn, notes: 'Ringed Wonder; majestic ring system visible in small telescope' },
];

/**
 * Calculates visibility metrics and altitude curve for major observable planets.
 */
export function calculatePlanets(date: Date, observer: Observer): CelestialTarget[] {
  return PLANETS.map(({ id, name, body, notes }) => {
    const eq = Equator(body, date, observer, true, true);
    const hor = Horizon(date, observer, eq.ra, eq.dec, 'normal');
    const illum = Illumination(body, date);
    const constellationInfo = Constellation(eq.ra, eq.dec);

    // Sample altitude progression across dusk-to-dawn night
    const sampleTimes = getNightSampleTimes(date, observer);
    const altitudeHistory: AltitudePoint[] = sampleTimes.map((stepDate) => {
      const stepEq = Equator(body, stepDate, observer, true, true);
      const stepHor = Horizon(stepDate, observer, stepEq.ra, stepEq.dec, 'normal');
      return {
        time: stepDate.toISOString(),
        altitude: Math.round(stepHor.altitude * 10) / 10,
        isAboveHorizon: stepHor.altitude > 0,
      };
    });

    return {
      id,
      name,
      type: 'planet',
      body,
      altitude: Math.round(hor.altitude * 10) / 10,
      azimuth: Math.round(hor.azimuth * 10) / 10,
      magnitude: Math.round(illum.mag * 10) / 10,
      constellation: constellationInfo.name,
      isAboveHorizon: hor.altitude > 0,
      isOptimal: hor.altitude >= 25,
      notes,
      altitudeHistory,
    };
  });
}
