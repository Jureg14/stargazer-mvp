import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateTargetTonight, evaluateAllTargets } from '../src/lib/itinerary/targetEvaluator';
import { CelestialTarget, MoonInfo } from '../src/lib/types/astro';
import { EvaluatedHour } from '../src/lib/scoring/scoreEngine';

function createMockHour(overrides: Partial<EvaluatedHour> = {}): EvaluatedHour {
  const time = overrides.time ?? new Date('2026-03-21T22:00:00Z');
  return {
    time,
    score: 85,
    weather: {
      time,
      cloudCover: 5,
      cloudLow: 0,
      cloudMid: 0,
      cloudHigh: 5,
      visibilityMeters: 25000,
      windSpeedKmh: 8,
      relativeHumidity: 50,
      temperatureC: 18,
      dewPointC: 10,
      dewDepressionC: 8,
      seeingIndex: 5,
      seeingArcsec: 0.9,
    },
    sunAlt: -24,
    moonAlt: -15, // Moon below horizon
    moonIllumFraction: 0.1,
    seeingQuality: 'Excellent',
    transparencyQuality: 'Pristine',
    visibleTargets: [],
    breakdown: {
      time: time.toISOString(),
      totalScore: 85,
      cloudCover: 5,
      sunAlt: -24,
      moonAlt: -15,
      moonIllumPct: 10,
      seeingQuality: 'Excellent',
      transparencyQuality: 'Pristine',
      isNight: true,
      isAstronomicalDarkness: true,
      visibleTargetsCount: 4,
      targetNames: [],
    },
    ...overrides,
  };
}

const mockMoonInfo: MoonInfo = {
  altitude: -15,
  azimuth: 180,
  illuminationFraction: 0.1,
  phaseAngleDeg: 30,
  phaseName: 'Waxing Crescent',
  magnitude: -6.5,
  isAboveHorizon: false,
};

test('Planets display Seeing metric and are sensitive to atmospheric seeing', () => {
  const jupiter: CelestialTarget = {
    id: 'jupiter',
    name: 'Jupiter',
    type: 'planet',
    altitude: 52,
    azimuth: 180,
    magnitude: -2.4,
    isAboveHorizon: true,
    isOptimal: true,
    altitudeHistory: [
      { time: '2026-03-21T21:00:00Z', altitude: 48, isAboveHorizon: true },
      { time: '2026-03-21T22:00:00Z', altitude: 52, isAboveHorizon: true },
      { time: '2026-03-21T23:00:00Z', altitude: 45, isAboveHorizon: true },
    ],
  };

  // Case 1: Excellent seeing night
  const excellentHours = [
    createMockHour({ time: new Date('2026-03-21T21:00:00Z'), seeingQuality: 'Excellent' }),
    createMockHour({ time: new Date('2026-03-21T22:00:00Z'), seeingQuality: 'Excellent' }),
    createMockHour({ time: new Date('2026-03-21T23:00:00Z'), seeingQuality: 'Excellent' }),
  ];

  const evalExcellent = evaluateTargetTonight(jupiter, excellentHours, mockMoonInfo, 4);
  assert.strictEqual(evalExcellent.tier, 'excellent');
  assert.strictEqual(evalExcellent.tierLabel, 'Excellent');
  assert.strictEqual(evalExcellent.peakAltitude, 52);
  assert.strictEqual(evalExcellent.metricType, 'seeing');
  assert.strictEqual(evalExcellent.metricLabel, 'Seeing');
  assert.strictEqual(evalExcellent.metricValue, 'Excellent');
  assert.strictEqual(evalExcellent.conditionSummary, 'Seeing: Excellent');
  assert.ok(evalExcellent.bestWindow.includes('–'), 'Should produce a formatted interval');

  // Case 2: Poor atmospheric seeing degrades planets to Poor tonight
  const poorSeeingHours = [
    createMockHour({ time: new Date('2026-03-21T21:00:00Z'), seeingQuality: 'Poor' }),
    createMockHour({ time: new Date('2026-03-21T22:00:00Z'), seeingQuality: 'Poor' }),
    createMockHour({ time: new Date('2026-03-21T23:00:00Z'), seeingQuality: 'Poor' }),
  ];

  const evalPoor = evaluateTargetTonight(jupiter, poorSeeingHours, mockMoonInfo, 4);
  assert.strictEqual(evalPoor.tier, 'poor');
  assert.strictEqual(evalPoor.tierLabel, 'Poor tonight');
  assert.ok(evalPoor.poorReason?.toLowerCase().includes('seeing') || evalPoor.conditionSummary.toLowerCase().includes('seeing'));
});

test('Faint DSOs display Moon interference metric and penalize bright moonlight and high Bortle', () => {
  const m42Orion: CelestialTarget = {
    id: 'm42-orion',
    name: 'Orion Nebula (M42)',
    type: 'dso',
    altitude: 61,
    azimuth: 140,
    magnitude: 4.0,
    isAboveHorizon: true,
    isOptimal: true,
    minBortleClass: 7,
    altitudeHistory: [
      { time: '2026-03-21T22:00:00Z', altitude: 58, isAboveHorizon: true },
      { time: '2026-03-21T23:00:00Z', altitude: 61, isAboveHorizon: true },
      { time: '2026-03-22T00:00:00Z', altitude: 55, isAboveHorizon: true },
    ],
  };

  // Case 1: Dark sky with Moon below horizon
  const darkNightHours = [
    createMockHour({ time: new Date('2026-03-21T22:00:00Z'), moonAlt: -20, sunAlt: -22 }),
    createMockHour({ time: new Date('2026-03-21T23:00:00Z'), moonAlt: -25, sunAlt: -25 }),
    createMockHour({ time: new Date('2026-03-22T00:00:00Z'), moonAlt: -30, sunAlt: -25 }),
  ];

  const evalDark = evaluateTargetTonight(m42Orion, darkNightHours, mockMoonInfo, 4);
  assert.strictEqual(evalDark.tier, 'excellent');
  assert.strictEqual(evalDark.metricType, 'moon');
  assert.strictEqual(evalDark.metricLabel, 'Moon interference');
  assert.strictEqual(evalDark.metricValue, 'Low');
  assert.strictEqual(evalDark.conditionSummary, 'Moon interference: Low');

  // Case 2: Bright gibbous moon (85% lit) washes out faint DSOs
  const moonLitInfo: MoonInfo = {
    ...mockMoonInfo,
    altitude: 45,
    illuminationFraction: 0.85,
    isAboveHorizon: true,
  };
  const moonLitHours = [
    createMockHour({ time: new Date('2026-03-21T22:00:00Z'), moonAlt: 40, moonIllumFraction: 0.85 }),
    createMockHour({ time: new Date('2026-03-21T23:00:00Z'), moonAlt: 45, moonIllumFraction: 0.85 }),
    createMockHour({ time: new Date('2026-03-22T00:00:00Z'), moonAlt: 42, moonIllumFraction: 0.85 }),
  ];

  const evalMoonlit = evaluateTargetTonight(m42Orion, moonLitHours, moonLitInfo, 4);
  assert.strictEqual(evalMoonlit.tier, 'poor');
  assert.ok(evalMoonlit.poorReason?.toLowerCase().includes('moonlight') || evalMoonlit.conditionSummary.toLowerCase().includes('moonlight'));

  // Case 3: Milky Way Core in Bortle 6 (exceeds minBortleClass 4)
  const milkyWay: CelestialTarget = {
    id: 'milkyway-core',
    name: 'Milky Way Galactic Core',
    type: 'milkyway',
    altitude: 50,
    azimuth: 180,
    magnitude: -1.0,
    minBortleClass: 4,
    isAboveHorizon: true,
    isOptimal: true,
    altitudeHistory: [
      { time: '2026-03-21T22:00:00Z', altitude: 50, isAboveHorizon: true },
    ],
  };
  const evalMilkyWay = evaluateTargetTonight(milkyWay, darkNightHours, mockMoonInfo, 6);
  assert.strictEqual(evalMilkyWay.tier, 'poor');
  assert.ok(evalMilkyWay.poorReason?.includes('Bortle 6'));
});

test('Poor targets display concise reason matching example (e.g. Low altitude + poor seeing)', () => {
  const saturn: CelestialTarget = {
    id: 'saturn',
    name: 'Saturn',
    type: 'planet',
    altitude: 14,
    azimuth: 270,
    magnitude: 0.8,
    isAboveHorizon: true,
    isOptimal: false,
    altitudeHistory: [
      { time: '2026-03-21T20:00:00Z', altitude: 16, isAboveHorizon: true },
      { time: '2026-03-21T21:00:00Z', altitude: 10, isAboveHorizon: true },
    ],
  };

  const poorHours = [
    createMockHour({ time: new Date('2026-03-21T20:00:00Z'), seeingQuality: 'Poor' }),
    createMockHour({ time: new Date('2026-03-21T21:00:00Z'), seeingQuality: 'Poor' }),
  ];

  const evalSaturn = evaluateTargetTonight(saturn, poorHours, mockMoonInfo, 4);
  assert.strictEqual(evalSaturn.tier, 'poor');
  assert.strictEqual(evalSaturn.tierLabel, 'Poor tonight');
  assert.strictEqual(evalSaturn.conditionSummary, 'Low altitude + poor seeing');
  assert.notStrictEqual(evalSaturn.bestWindow, 'Not optimal tonight');
  assert.ok(evalSaturn.bestWindow.includes('–'), 'Poor target above horizon should get its best watching period');
});

test('evaluateAllTargets sorts targets in order: 🟢 Excellent > 🟡 Good > 🔴 Poor', () => {
  const targets: CelestialTarget[] = [
    {
      id: 'saturn',
      name: 'Saturn',
      type: 'planet',
      altitude: 12,
      azimuth: 260,
      magnitude: 0.8,
      isAboveHorizon: true,
      isOptimal: false,
      altitudeHistory: [{ time: '2026-03-21T21:00:00Z', altitude: 14, isAboveHorizon: true }],
    },
    {
      id: 'jupiter',
      name: 'Jupiter',
      type: 'planet',
      altitude: 55,
      azimuth: 180,
      magnitude: -2.5,
      isAboveHorizon: true,
      isOptimal: true,
      altitudeHistory: [{ time: '2026-03-21T21:00:00Z', altitude: 55, isAboveHorizon: true }],
    },
    {
      id: 'm31-andromeda',
      name: 'Andromeda Galaxy (M31)',
      type: 'dso',
      altitude: 32,
      azimuth: 45,
      magnitude: 3.4,
      isAboveHorizon: true,
      isOptimal: true,
      minBortleClass: 6,
      altitudeHistory: [{ time: '2026-03-21T21:00:00Z', altitude: 32, isAboveHorizon: true }],
    },
  ];

  const hours = [
    createMockHour({ time: new Date('2026-03-21T21:00:00Z'), seeingQuality: 'Excellent', sunAlt: -20, moonAlt: -10 }),
  ];

  const sorted = evaluateAllTargets(targets, hours, mockMoonInfo, 4);
  assert.strictEqual(sorted[0].id, 'jupiter');
  assert.strictEqual(sorted[0].statusTier, 'excellent');
  assert.strictEqual(sorted[1].id, 'm31-andromeda');
  assert.strictEqual(sorted[1].statusTier, 'good');
  assert.strictEqual(sorted[2].id, 'saturn');
  assert.strictEqual(sorted[2].statusTier, 'poor');
});
