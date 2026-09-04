import test from 'node:test';
import assert from 'node:assert/strict';
import { deduplicatePasses, getStationPasses } from '../src/lib/astro/satellites';
import { SatellitePass } from '../src/lib/types/astro';

test('deduplicatePasses removes overlapping duplicate and triplicate passes', () => {
  const mockDuplicatePasses: SatellitePass[] = [
    // Duplicate 1 of ISS pass (e.g. from ISS Zarya)
    {
      satelliteName: 'ISS (International Space Station)',
      noradId: 25544,
      startTime: '2026-03-21T21:00:00.000Z',
      peakTime: '2026-03-21T21:03:00.000Z',
      endTime: '2026-03-21T21:06:00.000Z',
      durationSeconds: 360,
      maxAltitudeDeg: 45.2,
      startAzimuthDeg: 310,
      endAzimuthDeg: 120,
      startDirection: 'NW',
      endDirection: 'SE',
      estimatedMagnitude: -3.4,
      trajectory: 'NW to SE',
    },
    // Duplicate 2 of ISS pass (e.g. from docked module Nauka)
    {
      satelliteName: 'ISS (International Space Station)',
      noradId: 49044,
      startTime: '2026-03-21T21:00:05.000Z',
      peakTime: '2026-03-21T21:03:02.000Z',
      endTime: '2026-03-21T21:06:05.000Z',
      durationSeconds: 360,
      maxAltitudeDeg: 44.9,
      startAzimuthDeg: 310,
      endAzimuthDeg: 120,
      startDirection: 'NW',
      endDirection: 'SE',
      estimatedMagnitude: -3.4,
      trajectory: 'NW to SE',
    },
    // Tiangong pass 1 (Tianhe)
    {
      satelliteName: 'Tiangong (Chinese Space Station)',
      noradId: 48274,
      startTime: '2026-03-21T22:30:00.000Z',
      peakTime: '2026-03-21T22:33:00.000Z',
      endTime: '2026-03-21T22:36:00.000Z',
      durationSeconds: 360,
      maxAltitudeDeg: 62.0,
      startAzimuthDeg: 270,
      endAzimuthDeg: 90,
      startDirection: 'W',
      endDirection: 'E',
      estimatedMagnitude: -2.0,
      trajectory: 'W to E',
    },
    // Tiangong pass 2 (Wentian)
    {
      satelliteName: 'Tiangong (Chinese Space Station)',
      noradId: 53239,
      startTime: '2026-03-21T22:30:02.000Z',
      peakTime: '2026-03-21T22:33:01.000Z',
      endTime: '2026-03-21T22:36:02.000Z',
      durationSeconds: 360,
      maxAltitudeDeg: 61.8,
      startAzimuthDeg: 270,
      endAzimuthDeg: 90,
      startDirection: 'W',
      endDirection: 'E',
      estimatedMagnitude: -2.0,
      trajectory: 'W to E',
    },
    // Tiangong pass 3 (Mengtian)
    {
      satelliteName: 'Tiangong (Chinese Space Station)',
      noradId: 54216,
      startTime: '2026-03-21T22:30:01.000Z',
      peakTime: '2026-03-21T22:33:00.000Z',
      endTime: '2026-03-21T22:36:01.000Z',
      durationSeconds: 360,
      maxAltitudeDeg: 61.9,
      startAzimuthDeg: 270,
      endAzimuthDeg: 90,
      startDirection: 'W',
      endDirection: 'E',
      estimatedMagnitude: -2.0,
      trajectory: 'W to E',
    },
    // Next genuine orbit of ISS (~90 minutes later)
    {
      satelliteName: 'ISS (International Space Station)',
      noradId: 25544,
      startTime: '2026-03-21T22:35:00.000Z',
      peakTime: '2026-03-21T22:38:00.000Z',
      endTime: '2026-03-21T22:41:00.000Z',
      durationSeconds: 360,
      maxAltitudeDeg: 32.1,
      startAzimuthDeg: 290,
      endAzimuthDeg: 140,
      startDirection: 'WNW',
      endDirection: 'SE',
      estimatedMagnitude: -3.4,
      trajectory: 'WNW to SE',
    },
  ];

  const deduped = deduplicatePasses(mockDuplicatePasses);

  // Exactly 3 unique passes should remain: ISS orbit 1 (maxAlt 45.2), Tiangong orbit 1 (maxAlt 62.0), ISS orbit 2 (maxAlt 32.1)
  assert.strictEqual(deduped.length, 3, 'Overlapping duplicate and triplicate passes must be reduced to unique passes');

  const issPasses = deduped.filter((p) => p.satelliteName.startsWith('ISS'));
  assert.strictEqual(issPasses.length, 2, 'Two genuine distinct orbits for ISS should be retained');
  assert.strictEqual(issPasses[0].maxAltitudeDeg, 45.2, 'Retains higher peak altitude for first orbit');

  const tiangongPasses = deduped.filter((p) => p.satelliteName.startsWith('Tiangong'));
  assert.strictEqual(tiangongPasses.length, 1, 'Triplicate Tiangong passes must be reduced to exactly 1 pass');
  assert.strictEqual(tiangongPasses[0].maxAltitudeDeg, 62.0, 'Retains highest peak altitude among triplicates');
});

test('getStationPasses produces non-duplicated passes for observer', async () => {
  const lat = -23.5505;
  const lon = -46.6333;
  const date = new Date('2026-09-03T12:00:00Z');

  const passes = await getStationPasses(lat, lon, 760, date);

  // Check that every pass is at least 45 minutes apart from other passes of the same satellite
  for (let i = 0; i < passes.length; i++) {
    for (let j = i + 1; j < passes.length; j++) {
      const p1 = passes[i];
      const p2 = passes[j];
      if (p1.satelliteName === p2.satelliteName) {
        const diffMinutes = Math.abs(new Date(p1.peakTime).getTime() - new Date(p2.peakTime).getTime()) / (60 * 1000);
        assert.ok(
          diffMinutes >= 45,
          `Passes for ${p1.satelliteName} at ${p1.peakTime} and ${p2.peakTime} are too close (${diffMinutes.toFixed(1)} mins) - duplicate detected!`
        );
      }
    }
  }
});
