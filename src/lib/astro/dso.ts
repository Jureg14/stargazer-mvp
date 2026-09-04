import { Body, DefineStar, Equator, Horizon, Observer } from 'astronomy-engine';
import { AltitudePoint, BortleClass, CelestialTarget } from '../types/astro';
import { getNightSampleTimes } from './twilight';

export interface DSOSpec {
  id: string;
  name: string;
  type: 'dso' | 'milkyway';
  raHours: number;
  decDeg: number;
  distLy: number;
  magnitude: number;
  constellation: string;
  minBortleClass: BortleClass; // Max light pollution under which object is visible
  starBody: Body;
  notes: string;
}

// Fixed slot definitions for DSOs
DefineStar(Body.Star1, 17.761, -29.008, 26000);   // Milky Way Core (Sagittarius A*)
DefineStar(Body.Star2, 0.712, 41.269, 2500000);    // Andromeda Galaxy (M31)
DefineStar(Body.Star3, 5.588, -5.391, 1344);       // Orion Nebula (M42)
DefineStar(Body.Star4, 3.790, 24.117, 444);        // Pleiades (M45)
DefineStar(Body.Star5, 16.695, 36.460, 22200);     // Hercules Globular Cluster (M13)

export const DSO_CATALOG: DSOSpec[] = [
  {
    id: 'milkyway-core',
    name: 'Milky Way Galactic Core',
    type: 'milkyway',
    raHours: 17.761,
    decDeg: -29.008,
    distLy: 26000,
    magnitude: -1.0,
    constellation: 'Sagittarius',
    minBortleClass: 4, // Invisible in Bortle 5+
    starBody: Body.Star1,
    notes: 'Dense stellar nucleus & dust rifts; requires dark skies & zero moonlight',
  },
  {
    id: 'm31-andromeda',
    name: 'Andromeda Galaxy (M31)',
    type: 'dso',
    raHours: 0.712,
    decDeg: 41.269,
    distLy: 2500000,
    magnitude: 3.4,
    constellation: 'Andromeda',
    minBortleClass: 6, // Visible naked eye in dark skies, binoculars in suburban
    starBody: Body.Star2,
    notes: 'Majestic spiral galaxy; 2.5 million light-years away; naked-eye oval',
  },
  {
    id: 'm42-orion',
    name: 'Orion Nebula (M42)',
    type: 'dso',
    raHours: 5.588,
    decDeg: -5.391,
    distLy: 1344,
    magnitude: 4.0,
    constellation: 'Orion',
    minBortleClass: 7, // Bright emission nebula; visible in small optics
    starBody: Body.Star3,
    notes: 'Vibrant stellar nursery glowing in Orion sword; spectacular in binoculars',
  },
  {
    id: 'm45-pleiades',
    name: 'Pleiades Star Cluster (M45)',
    type: 'dso',
    raHours: 3.790,
    decDeg: 24.117,
    distLy: 444,
    magnitude: 1.6,
    constellation: 'Taurus',
    minBortleClass: 8, // Bright naked-eye cluster
    starBody: Body.Star4,
    notes: 'Iconic cluster of young sapphire-blue stars; naked-eye showpiece',
  },
  {
    id: 'm13-hercules',
    name: 'Great Hercules Cluster (M13)',
    type: 'dso',
    raHours: 16.695,
    decDeg: 36.460,
    distLy: 22200,
    magnitude: 5.8,
    constellation: 'Hercules',
    minBortleClass: 5,
    starBody: Body.Star5,
    notes: 'Dazzling spherical swarm of 300,000 ancient stars',
  },
];

/**
 * Evaluates DSO visibility and builds night altitude timeline history.
 */
export function calculateDSOVisibility(
  date: Date,
  observer: Observer,
  userBortle: BortleClass = 4
): CelestialTarget[] {
  const targets: CelestialTarget[] = [];
  const sampleTimes = getNightSampleTimes(date, observer);

  for (const dso of DSO_CATALOG) {
    // Check Bortle threshold: if site light pollution exceeds object threshold, mark invisible or skip
    const isLightPollutedOut = userBortle > dso.minBortleClass;

    DefineStar(dso.starBody, dso.raHours, dso.decDeg, dso.distLy);
    const eq = Equator(dso.starBody, date, observer, true, true);
    const hor = Horizon(date, observer, eq.ra, eq.dec, 'normal');

    // Build altitude progression curve across dusk-to-dawn night
    const altitudeHistory: AltitudePoint[] = sampleTimes.map((stepDate) => {
      const stepEq = Equator(dso.starBody, stepDate, observer, true, true);
      const stepHor = Horizon(stepDate, observer, stepEq.ra, stepEq.dec, 'normal');
      return {
        time: stepDate.toISOString(),
        altitude: Math.round(stepHor.altitude * 10) / 10,
        isAboveHorizon: stepHor.altitude > 0,
      };
    });

    const altitude = Math.round(hor.altitude * 10) / 10;
    const azimuth = Math.round(hor.azimuth * 10) / 10;

    targets.push({
      id: dso.id,
      name: dso.name,
      type: dso.type,
      body: dso.starBody,
      altitude,
      azimuth,
      magnitude: dso.magnitude,
      constellation: dso.constellation,
      minBortleClass: dso.minBortleClass,
      isAboveHorizon: altitude > 0 && !isLightPollutedOut,
      isOptimal: altitude >= 25 && !isLightPollutedOut,
      notes: isLightPollutedOut
        ? `Washed out in Bortle ${userBortle} (Requires Bortle ≤ ${dso.minBortleClass})`
        : dso.notes,
      altitudeHistory,
    });
  }

  return targets;
}
