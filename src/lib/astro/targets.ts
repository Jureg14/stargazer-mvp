import {
  Body,
  DefineStar,
  Equator,
  Horizon,
  Observer,
} from 'astronomy-engine';
import { CelestialTarget } from '../types/astro';

// Initialize fixed astronomical reference targets using user-defined star slots
// 1. Milky Way Galactic Center (Sagittarius A* area: RA ~ 17h 45m, Dec ~ -29° 00')
DefineStar(Body.Star1, 17.761, -29.0078, 26000);

// 2. Andromeda Galaxy (M31: RA ~ 00h 42.7m, Dec ~ +41° 16')
DefineStar(Body.Star2, 0.712, 41.269, 2500000);

// 3. Orion Nebula (M42: RA ~ 05h 35.3m, Dec ~ -05° 23')
DefineStar(Body.Star3, 5.588, -5.391, 1344);

// 4. Pleiades Star Cluster (M45: RA ~ 03h 47.4m, Dec ~ +24° 07')
DefineStar(Body.Star4, 3.790, 24.117, 444);

// 5. Great Hercules Cluster (M13: RA ~ 16h 41.7m, Dec ~ +36° 27')
DefineStar(Body.Star5, 16.695, 36.46, 22200);

interface DSODef {
  id: string;
  name: string;
  type: 'milkyway' | 'dso';
  body: Body;
  magnitude: number;
  constellation: string;
  notes: string;
}

const DSO_TARGETS: DSODef[] = [
  {
    id: 'milkyway-core',
    name: 'Milky Way Core',
    type: 'milkyway',
    body: Body.Star1,
    magnitude: -1.0,
    constellation: 'Sagittarius',
    notes: 'Dense stellar core & dust lanes; requires zero moonlight and dark skies',
  },
  {
    id: 'm31-andromeda',
    name: 'Andromeda Galaxy (M31)',
    type: 'dso',
    body: Body.Star2,
    magnitude: 3.4,
    constellation: 'Andromeda',
    notes: 'Nearest major spiral galaxy; faint naked-eye oval in dark skies',
  },
  {
    id: 'm42-orion',
    name: 'Orion Nebula (M42)',
    type: 'dso',
    body: Body.Star3,
    magnitude: 4.0,
    constellation: 'Orion',
    notes: 'Stellar nursery glowing in Orion sword; spectacular in binoculars',
  },
  {
    id: 'm45-pleiades',
    name: 'Pleiades (Seven Sisters)',
    type: 'dso',
    body: Body.Star4,
    magnitude: 1.6,
    constellation: 'Taurus',
    notes: 'Iconic open cluster of young blue giant stars; naked-eye showpiece',
  },
  {
    id: 'm13-hercules',
    name: 'Hercules Globular Cluster (M13)',
    type: 'dso',
    body: Body.Star5,
    magnitude: 5.8,
    constellation: 'Hercules',
    notes: 'Dense spherical swarm of 300,000 ancient stars',
  },
];

/**
 * Calculates visibility metrics for prominent Deep-Sky Objects & Milky Way.
 */
export function calculateTargets(date: Date, observer: Observer): CelestialTarget[] {
  return DSO_TARGETS.map(({ id, name, type, body, magnitude, constellation, notes }) => {
    const eq = Equator(body, date, observer, true, true);
    const hor = Horizon(date, observer, eq.ra, eq.dec, 'normal');

    return {
      id,
      name,
      type,
      body,
      altitude: Math.round(hor.altitude * 10) / 10,
      azimuth: Math.round(hor.azimuth * 10) / 10,
      magnitude,
      constellation,
      isAboveHorizon: hor.altitude > 0,
      isOptimal: hor.altitude >= 30,
      notes,
    };
  });
}
