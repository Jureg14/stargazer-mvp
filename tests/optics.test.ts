import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTargetOptics } from '../src/lib/astro/optics';
import { TelescopeProfile, DEFAULT_TELESCOPE_PROFILE } from '../src/lib/types/equipment';
import { CelestialTarget } from '../src/lib/types/astro';

const mockScope: TelescopeProfile = {
  enabled: true,
  name: '6" Dobsonian',
  apertureMm: 150,
  focalLengthMm: 1200,
  eyepieces: [
    { id: 'ep-25', focalLengthMm: 25, label: '25mm Plössl', apparentFovDeg: 52 },
    { id: 'ep-10', focalLengthMm: 10, label: '10mm Plössl', apparentFovDeg: 52 },
    { id: 'ep-6', focalLengthMm: 6, label: '6mm Goldline', apparentFovDeg: 66 },
  ],
};

function createMockTarget(overrides: Partial<CelestialTarget>): CelestialTarget {
  return {
    id: 'jupiter',
    name: 'Jupiter',
    type: 'planet',
    magnitude: -2.2,
    altitude: 55,
    azimuth: 180,
    isAboveHorizon: true,
    isOptimal: true,
    ...overrides,
  };
}

test('calculateTargetOptics computes correct optical formulas for all eyepieces', () => {
  const target = createMockTarget({ id: 'jupiter', type: 'planet' });
  const result = calculateTargetOptics(mockScope, target);

  assert.ok(result);
  assert.equal(result.allCalculations.length, 3);

  // 25mm eyepiece: 1200 / 25 = 48x, exit pupil = 150 / 48 = 3.125mm, TFOV = 52 / 48 = 1.08 deg
  const ep25 = result.allCalculations.find((c) => c.eyepiece.focalLengthMm === 25);
  assert.ok(ep25);
  assert.equal(ep25.magnification, 48);
  assert.equal(ep25.exitPupilMm, 3.13);
  assert.equal(Math.round(ep25.trueFovDeg * 100) / 100, 1.08);
  assert.equal(ep25.isOverMagnified, false);

  // 6mm eyepiece: 1200 / 6 = 200x, exit pupil = 150 / 200 = 0.75mm, TFOV = 66 / 200 = 0.33 deg
  const ep6 = result.allCalculations.find((c) => c.eyepiece.focalLengthMm === 6);
  assert.ok(ep6);
  assert.equal(ep6.magnification, 200);
  assert.equal(ep6.exitPupilMm, 0.75);
  assert.equal(Math.round(ep6.trueFovDeg * 100) / 100, 0.33);
  assert.equal(ep6.isOverMagnified, false);
});

test('calculateTargetOptics recommends high magnification (6mm) for Planets', () => {
  const jupiter = createMockTarget({ id: 'jupiter', name: 'Jupiter', type: 'planet' });
  const result = calculateTargetOptics(mockScope, jupiter);

  assert.ok(result);
  assert.equal(result.recommendedEyepiece.eyepiece.focalLengthMm, 6);
  assert.equal(result.recommendedEyepiece.magnification, 200);
  assert.ok(result.summaryText.toLowerCase().includes('planetary'));
});

test('calculateTargetOptics recommends wide field (25mm) for extended DSOs (Andromeda Galaxy)', () => {
  const m31 = createMockTarget({
    id: 'm31',
    name: 'Andromeda Galaxy (M31)',
    type: 'dso',
  });
  const result = calculateTargetOptics(mockScope, m31);

  assert.ok(result);
  assert.equal(result.recommendedEyepiece.eyepiece.focalLengthMm, 25);
  assert.equal(result.recommendedEyepiece.magnification, 48);
  assert.ok(result.summaryText.toLowerCase().includes('wide-field'));
});

test('calculateTargetOptics recommends wide field (25mm) for large emission nebulae (Orion Nebula M42)', () => {
  const m42 = createMockTarget({
    id: 'm42',
    name: 'Orion Nebula (M42)',
    type: 'dso',
  });
  const result = calculateTargetOptics(mockScope, m42);

  assert.ok(result);
  assert.equal(result.recommendedEyepiece.eyepiece.focalLengthMm, 25);
  assert.equal(result.recommendedEyepiece.magnification, 48);
});

test('calculateTargetOptics recommends medium magnification (10mm) for compact globular clusters (M13)', () => {
  const m13 = createMockTarget({
    id: 'm13',
    name: 'Hercules Cluster (M13)',
    type: 'dso',
  });
  const result = calculateTargetOptics(mockScope, m13);

  assert.ok(result);
  assert.equal(result.recommendedEyepiece.eyepiece.focalLengthMm, 10);
  assert.equal(result.recommendedEyepiece.magnification, 120);
});

test('calculateTargetOptics warns on over-magnification exceeding 2x aperture', () => {
  const smallScope: TelescopeProfile = {
    enabled: true,
    name: '70mm Refractor',
    apertureMm: 70,
    focalLengthMm: 900,
    eyepieces: [
      { id: 'ep-25', focalLengthMm: 25, label: '25mm' },
      { id: 'ep-4', focalLengthMm: 4, label: '4mm' }, // 900 / 4 = 225x, but 2 * 70 = 140x max!
    ],
  };

  const mars = createMockTarget({ id: 'mars', name: 'Mars', type: 'planet' });
  const result = calculateTargetOptics(smallScope, mars);

  assert.ok(result);
  const ep4 = result.allCalculations.find((c) => c.eyepiece.focalLengthMm === 4);
  assert.ok(ep4);
  assert.equal(ep4.isOverMagnified, true);
  // Recommends the 25mm because the 4mm is beyond the scope's physical limit
  assert.equal(result.recommendedEyepiece.eyepiece.focalLengthMm, 25);
});

test('calculateTargetOptics returns null when telescope has no eyepieces', () => {
  const emptyScope: TelescopeProfile = {
    ...DEFAULT_TELESCOPE_PROFILE,
    eyepieces: [],
  };
  const target = createMockTarget({ id: 'saturn', type: 'planet' });
  const result = calculateTargetOptics(emptyScope, target);
  assert.equal(result, null);
});

test('calculateTargetOptics generates Barlow combinations and recommends Barlow for planetary viewing', () => {
  // Scope with 150mm aperture, 1200mm focal length, 25mm & 10mm eyepieces + 2x Barlow
  const scopeWithBarlow: TelescopeProfile = {
    enabled: true,
    name: 'Dobsonian with Barlow',
    apertureMm: 150,
    focalLengthMm: 1200,
    eyepieces: [
      { id: 'ep-25', focalLengthMm: 25, label: '25mm Plössl' },
      { id: 'ep-10', focalLengthMm: 10, label: '10mm Plössl' },
      { id: 'barlow-2x', focalLengthMm: 0, isBarlow: true, barlowMultiplier: 2, label: '2× Barlow' },
    ],
  };

  const jupiter = createMockTarget({ id: 'jupiter', name: 'Jupiter', type: 'planet' });
  const result = calculateTargetOptics(scopeWithBarlow, jupiter);

  assert.ok(result);
  // Total calculations: 2 native (48x, 120x) + 2 barlowed (96x, 240x) = 4
  assert.equal(result.allCalculations.length, 4);

  // Check 10mm + 2x Barlow
  const barlowCombo = result.allCalculations.find(
    (c) => c.eyepiece.focalLengthMm === 10 && c.barlowMultiplier === 2
  );
  assert.ok(barlowCombo);
  assert.equal(barlowCombo.magnification, 240);
  assert.equal(barlowCombo.effectiveFocalLengthMm, 5);
  assert.equal(barlowCombo.displayName, '10mm + 2× Barlow');

  // Should recommend 10mm + 2x Barlow (240x) instead of native 10mm (120x) for maximum planetary detail
  assert.equal(result.recommendedEyepiece.magnification, 240);
  assert.equal(result.recommendedEyepiece.barlowMultiplier, 2);
  assert.equal(result.summaryText, 'Use 10mm + 2× Barlow for planetary detail');
});
