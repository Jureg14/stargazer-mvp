import test from 'node:test';
import assert from 'node:assert/strict';
import { Observer } from 'astronomy-engine';
import { MESSIER_CATALOG } from '../src/lib/astro/data/messier';
import { CALDWELL_CATALOG } from '../src/lib/astro/data/caldwell';
import { calculateSearchCatalog } from '../src/lib/astro/celestialSearch';

test('Messier Catalog integrity (110 objects)', () => {
  assert.strictEqual(MESSIER_CATALOG.length, 110, 'Must contain exactly 110 Messier objects');

  for (const m of MESSIER_CATALOG) {
    assert.ok(m.catalogNumber >= 1 && m.catalogNumber <= 110, `M${m.catalogNumber} must be between 1 and 110`);
    assert.ok(m.raHours >= 0 && m.raHours < 24, `M${m.catalogNumber} RA must be valid [0, 24)`);
    assert.ok(m.decDeg >= -90 && m.decDeg <= 90, `M${m.catalogNumber} Dec must be valid [-90, 90]`);
    assert.ok(typeof m.magnitude === 'number', `M${m.catalogNumber} magnitude must be a number`);
    assert.ok(m.constellation.length > 0, `M${m.catalogNumber} constellation must be non-empty`);
    assert.strictEqual(m.catalog, 'messier');
  }

  // Spot check key objects
  const m1 = MESSIER_CATALOG.find((m) => m.catalogNumber === 1);
  assert.ok(m1 && m1.name.includes('Crab Nebula'));

  const m31 = MESSIER_CATALOG.find((m) => m.catalogNumber === 31);
  assert.ok(m31 && m31.name.includes('Andromeda Galaxy'));

  const m42 = MESSIER_CATALOG.find((m) => m.catalogNumber === 42);
  assert.ok(m42 && m42.name.includes('Orion Nebula'));
});

test('Caldwell Catalog integrity (109 objects, including Cat\'s Eye Nebula C6)', () => {
  assert.strictEqual(CALDWELL_CATALOG.length, 109, 'Must contain exactly 109 Caldwell objects');

  for (const c of CALDWELL_CATALOG) {
    assert.ok(c.catalogNumber >= 1 && c.catalogNumber <= 109, `C${c.catalogNumber} must be between 1 and 109`);
    assert.ok(c.raHours >= 0 && c.raHours < 24, `C${c.catalogNumber} RA must be valid [0, 24)`);
    assert.ok(c.decDeg >= -90 && c.decDeg <= 90, `C${c.catalogNumber} Dec must be valid [-90, 90]`);
    assert.ok(typeof c.magnitude === 'number', `C${c.catalogNumber} magnitude must be a number`);
    assert.ok(c.constellation.length > 0, `C${c.catalogNumber} constellation must be non-empty`);
    assert.strictEqual(c.catalog, 'caldwell');
  }

  // Verify Cat's Eye Nebula (Caldwell 6 / NGC 6543)
  const c6 = CALDWELL_CATALOG.find((c) => c.catalogNumber === 6);
  assert.ok(c6, 'Caldwell 6 (Cat\'s Eye Nebula) must exist in the catalog');
  assert.ok(c6.name.includes("Cat's Eye Nebula"), 'C6 name must mention Cat\'s Eye Nebula');
  assert.strictEqual(c6.ngc, 'NGC 6543', 'C6 NGC cross-reference must be NGC 6543');
  assert.strictEqual(c6.constellation, 'Draco', 'C6 must be in Draco');
  assert.strictEqual(c6.dsoType, 'planetary_nebula', 'C6 must be a planetary nebula');
  assert.ok(Math.abs(c6.raHours - 17.977) < 0.1, 'C6 RA must match ~17.98h');
  assert.ok(Math.abs(c6.decDeg - 66.63) < 0.1, 'C6 Dec must match ~+66.63°');
});

test('calculateSearchCatalog contains Pluto and Cat\'s Eye Nebula', () => {
  const observer = new Observer(51.5074, -0.1278, 0); // London
  const date = new Date('2026-09-03T12:00:00Z');

  const catalog = calculateSearchCatalog(date, observer);

  // Verify Pluto is present
  const pluto = catalog.find((t) => t.id === 'planet-pluto');
  assert.ok(pluto, 'Pluto must be present in search catalog');
  assert.ok(pluto.name.includes('Pluto'), 'Pluto name must match');
  assert.strictEqual(pluto.type, 'planet');

  // Verify Cat's Eye Nebula is visible from London (+51.5°N, Draco is circumpolar/high in sky)
  const catsEye = catalog.find((t) => t.id === 'caldwell-c6');
  assert.ok(catsEye, 'Cat\'s Eye Nebula (C6) must be present in search catalog for London');
  assert.ok(catsEye.name.includes("Cat's Eye"), 'Cat\'s Eye name must match');
  assert.strictEqual(catsEye.ngc, 'NGC 6543');
  assert.ok(catsEye.window.peakAltitudeDeg > 50, 'Cat\'s Eye culmination altitude in London should be > 50°');
});

test('Latitude pre-filtering skips non-rising targets', () => {
  const northObserver = new Observer(51.5074, -0.1278, 0); // London (+51.5°N)
  const southObserver = new Observer(-33.8688, 151.2093, 0); // Sydney (-33.9°S)
  const date = new Date('2026-09-03T12:00:00Z');

  const northCatalog = calculateSearchCatalog(date, northObserver);
  const southCatalog = calculateSearchCatalog(date, southObserver);

  // C109 is at Dec -80.86° (far southern sky, near South Celestial Pole)
  // Must NOT be present in London (+51.5°N)
  const c109InLondon = northCatalog.find((t) => t.id === 'caldwell-c109');
  assert.strictEqual(c109InLondon, undefined, 'Far-southern target C109 must not appear in London search catalog');

  // But C109 MUST be present in Sydney (-33.9°S)
  const c109InSydney = southCatalog.find((t) => t.id === 'caldwell-c109');
  assert.ok(c109InSydney, 'Far-southern target C109 must appear in Sydney search catalog');

  // Conversely, C1 (Polarissima Cluster at Dec +85.33° near North Celestial Pole)
  // Must be in London (+51.5°N) but NOT in Sydney (-33.9°S)
  const c1InLondon = northCatalog.find((t) => t.id === 'caldwell-c1');
  const c1InSydney = southCatalog.find((t) => t.id === 'caldwell-c1');
  assert.ok(c1InLondon, 'Near-north-pole target C1 must appear in London search catalog');
  assert.strictEqual(c1InSydney, undefined, 'Near-north-pole target C1 must not appear in Sydney search catalog');
});
