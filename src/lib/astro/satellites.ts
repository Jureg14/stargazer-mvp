import * as satellite from 'satellite.js';
import { Body, Equator, Horizon, Observer } from 'astronomy-engine';
import { SatellitePass } from '../types/astro';

// Fallback TLEs for standard Earth stations (updated periodically via API)
export const DEFAULT_STATION_TLES = [
  {
    name: 'ISS (International Space Station)',
    noradId: 25544,
    line1: '1 25544U 98067A   26239.51234567  .00016717  00000+0  30000-3 0  9993',
    line2: '2 25544  51.6415 160.1234 0006789  85.4321 274.5678 15.49876543456789',
    mag: -3.4,
  },
  {
    name: 'Tiangong (Chinese Space Station)',
    noradId: 48274,
    line1: '1 48274U 21035A   26239.50000000  .00020000  00000+0  25000-3 0  9991',
    line2: '2 48274  41.4720 180.5000 0005000 120.0000 240.0000 15.60000000250001',
    mag: -2.0,
  },
];

function getCardinalDirection(azDeg: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((azDeg % 360) / 22.5) % 16;
  return directions[index];
}

/**
 * Calculates visible passes for a satellite over a 24-hour observation window.
 */
export function calculateSatellitePasses(
  tleLine1: string,
  tleLine2: string,
  satelliteName: string,
  noradId: number,
  observerLat: number,
  observerLon: number,
  observerAltMeters: number,
  startDate: Date,
  hoursToSearch = 24
): SatellitePass[] {
  const satrec = satellite.twoline2satrec(tleLine1, tleLine2);
  const passes: SatellitePass[] = [];

  const observer = new Observer(observerLat, observerLon, observerAltMeters);
  const observerGd: satellite.GeodeticLocation = {
    latitude: satellite.degreesToRadians(observerLat),
    longitude: satellite.degreesToRadians(observerLon),
    height: observerAltMeters / 1000,
  };

  const stepSeconds = 20;
  const totalSteps = (hoursToSearch * 3600) / stepSeconds;

  let inPass = false;
  let passStart: Date | null = null;
  let maxAlt = 0;
  let maxAltTime: Date | null = null;
  let startAz = 0;
  let endAz = 0;

  for (let i = 0; i <= totalSteps; i++) {
    const time = new Date(startDate.getTime() + i * stepSeconds * 1000);
    const pv = satellite.propagate(satrec, time);

    if (!pv || typeof pv.position === 'boolean' || !pv.position) {
      continue;
    }

    const gmst = satellite.gstime(time);
    const positionEci = pv.position;
    const positionEcf = satellite.eciToEcf(positionEci, gmst);
    const lookAngles = satellite.ecfToLookAngles(observerGd, positionEcf);

    const altDeg = satellite.radiansToDegrees(lookAngles.elevation);
    const azDeg = (satellite.radiansToDegrees(lookAngles.azimuth) + 360) % 360;

    // Check observer darkness (Sun altitude <= -6 deg)
    const sunEq = Equator(Body.Sun, time, observer, true, true);
    const sunHor = Horizon(time, observer, sunEq.ra, sunEq.dec, 'normal');
    const isDark = sunHor.altitude <= -6;

    const isVisibleNow = altDeg >= 12 && isDark;

    if (isVisibleNow) {
      if (!inPass) {
        inPass = true;
        passStart = time;
        startAz = azDeg;
        maxAlt = altDeg;
        maxAltTime = time;
      } else {
        if (altDeg > maxAlt) {
          maxAlt = altDeg;
          maxAltTime = time;
        }
        endAz = azDeg;
      }
    } else {
      if (inPass && passStart && maxAltTime && maxAlt >= 22) {
        const startDir = getCardinalDirection(startAz);
        const endDir = getCardinalDirection(endAz);

        passes.push({
          satelliteName,
          noradId,
          startTime: passStart.toISOString(),
          peakTime: maxAltTime.toISOString(),
          endTime: time.toISOString(),
          durationSeconds: Math.round((time.getTime() - passStart.getTime()) / 1000),
          maxAltitudeDeg: Math.round(maxAlt * 10) / 10,
          startAzimuthDeg: Math.round(startAz),
          endAzimuthDeg: Math.round(endAz),
          startDirection: startDir,
          endDirection: endDir,
          estimatedMagnitude: noradId === 25544 ? -3.4 : -2.2,
          trajectory: `${startDir} to ${endDir}`,
        });
      }
      inPass = false;
      passStart = null;
      maxAlt = 0;
    }
  }

  return passes;
}

export function deduplicatePasses(passes: SatellitePass[]): SatellitePass[] {
  const sorted = [...passes].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  const unique: SatellitePass[] = [];

  for (const pass of sorted) {
    const existingIndex = unique.findIndex((existing) => {
      const isSameSat =
        existing.noradId === pass.noradId ||
        existing.satelliteName.slice(0, 3).toUpperCase() === pass.satelliteName.slice(0, 3).toUpperCase();

      if (!isSameSat) return false;

      // Passes within 35 minutes of each other represent the same orbital flyover
      const timeDiffMs = Math.abs(new Date(existing.peakTime).getTime() - new Date(pass.peakTime).getTime());
      return timeDiffMs < 35 * 60 * 1000;
    });

    if (existingIndex === -1) {
      unique.push(pass);
    } else {
      // Retain pass with higher peak elevation
      if (pass.maxAltitudeDeg > unique[existingIndex].maxAltitudeDeg) {
        unique[existingIndex] = pass;
      }
    }
  }

  return unique;
}

/**
 * Target definition for primary space stations.
 * Specifically excludes secondary docked modules (e.g. Nauka, Wentian, Mengtian) to prevent duplicate passes.
 */
const TARGET_STATIONS = [
  {
    key: 'ISS',
    primaryNoradId: 25544,
    displayName: 'ISS (International Space Station)',
    matches: (nameUpper: string, noradId: number) =>
      noradId === 25544 || (nameUpper.includes('ISS') && !nameUpper.includes('DEB') && !nameUpper.includes('NAUKA')),
    fallback: DEFAULT_STATION_TLES[0],
  },
  {
    key: 'TIANGONG',
    primaryNoradId: 48274,
    displayName: 'Tiangong (Chinese Space Station)',
    matches: (nameUpper: string, noradId: number) =>
      noradId === 48274 || (nameUpper.includes('CSS') && nameUpper.includes('TIANHE')) || nameUpper.includes('TIANGONG'),
    fallback: DEFAULT_STATION_TLES[1],
  },
];

/**
 * Fetches fresh TLE data from CelesTrak with fallback to cached/default stations.
 */
export async function getStationPasses(
  lat: number,
  lon: number,
  elevationMeters: number,
  date: Date
): Promise<SatellitePass[]> {
  let allPasses: SatellitePass[] = [];
  const resolvedStations = new Set<string>();

  try {
    const res = await fetch('https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle', {
      next: { revalidate: 21600 }, // cache for 6 hours
    });

    if (res.ok) {
      const text = await res.text();
      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

      // Parse 3-line sets from CelesTrak
      interface ParsedEntry {
        name: string;
        line1: string;
        line2: string;
        noradId: number;
      }
      const entries: ParsedEntry[] = [];
      for (let i = 0; i < lines.length; i += 3) {
        const name = lines[i];
        const line1 = lines[i + 1];
        const line2 = lines[i + 2];
        if (name && line1 && line2 && line1.startsWith('1 ') && line2.startsWith('2 ')) {
          const noradId = parseInt(line1.substring(2, 7), 10);
          entries.push({ name, line1, line2, noradId });
        }
      }

      // For each target station, find the exact primary NORAD entry or best match
      for (const target of TARGET_STATIONS) {
        const exactEntry =
          entries.find((e) => e.noradId === target.primaryNoradId) ||
          entries.find((e) => target.matches(e.name.toUpperCase(), e.noradId));

        if (exactEntry) {
          resolvedStations.add(target.key);
          const passes = calculateSatellitePasses(
            exactEntry.line1,
            exactEntry.line2,
            target.displayName,
            exactEntry.noradId,
            lat,
            lon,
            elevationMeters,
            date
          );
          allPasses = allPasses.concat(passes);
        }
      }
    }
  } catch {
    // If fetch failed completely, fall back to default stations
  }

  // Ensure every target station is computed (fallback to default TLEs if not resolved)
  for (const target of TARGET_STATIONS) {
    if (!resolvedStations.has(target.key)) {
      const passes = calculateSatellitePasses(
        target.fallback.line1,
        target.fallback.line2,
        target.displayName,
        target.primaryNoradId,
        lat,
        lon,
        elevationMeters,
        date
      );
      allPasses = allPasses.concat(passes);
    }
  }

  return deduplicatePasses(allPasses);
}
