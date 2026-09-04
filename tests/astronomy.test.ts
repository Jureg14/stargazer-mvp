import test from 'node:test';
import assert from 'node:assert/strict';
import { Observer } from 'astronomy-engine';
import { calculateTwilight, getNightSampleTimes } from '../src/lib/astro/twilight';
import { calculateMoonInfo } from '../src/lib/astro/moon';
import { encodeGeohash, decodeGeohash } from '../src/lib/cache/geohash';
import { estimateSeeingFromMeteorology } from '../src/lib/weather/meteoblue';
import { clusterObservationWindows } from '../src/lib/itinerary/cluster';
import { EvaluatedHour } from '../src/lib/scoring/scoreEngine';
import { MoonInfo } from '../src/lib/types/astro';

test('Twilight Thresholds Calculation', () => {
  const date = new Date('2026-03-21T12:00:00Z');
  const observer = new Observer(51.5074, -0.1278, 0); // London

  const twilight = calculateTwilight(date, observer);

  assert.ok(twilight.sunset, 'Sunset should be calculated');
  assert.ok(twilight.civilDusk, 'Civil dusk should be calculated');
  assert.ok(twilight.nauticalDusk, 'Nautical dusk should be calculated');
  assert.ok(twilight.astroDusk, 'Astronomical dusk should be calculated');
  assert.ok(twilight.astroDawn, 'Astronomical dawn should be calculated');
  assert.ok(twilight.sunrise, 'Sunrise should be calculated');

  // Verify chronological progression: sunset <= civilDusk <= nauticalDusk <= astroDusk
  const tSunset = twilight.sunset ? new Date(twilight.sunset).getTime() : 0;
  const tCivil = twilight.civilDusk ? new Date(twilight.civilDusk).getTime() : 0;
  const tNaut = twilight.nauticalDusk ? new Date(twilight.nauticalDusk).getTime() : 0;
  const tAstro = twilight.astroDusk ? new Date(twilight.astroDusk).getTime() : 0;

  assert.ok(tSunset <= tCivil, 'Sunset must be before or equal to civil dusk');
  assert.ok(tCivil <= tNaut, 'Civil dusk must be before or equal to nautical dusk');
  assert.ok(tNaut <= tAstro, 'Nautical dusk must be before or equal to astronomical dusk');
});

test('Moon Phase and Illumination Accuracy', () => {
  const date = new Date('2026-03-21T12:00:00Z');
  const observer = new Observer(0, 0, 0); // Equator

  const moonInfo = calculateMoonInfo(date, observer);

  assert.ok(typeof moonInfo.phaseAngleDeg === 'number', 'Phase angle should be a number');
  assert.ok(moonInfo.illuminationFraction >= 0 && moonInfo.illuminationFraction <= 1.0, 'Illumination fraction should be between 0 and 1.0');
  assert.ok(typeof moonInfo.phaseName === 'string', 'Phase name should be a string');
});

test('Geohash Encoding & Decoding Precision (Precision 4)', () => {
  const lat = -23.5505;
  const lon = -46.6333;

  const geohash = encodeGeohash(lat, lon, 4);
  assert.strictEqual(geohash.length, 4, 'Geohash length should equal specified precision of 4');

  const decoded = decodeGeohash(geohash);
  assert.ok(Math.abs(decoded.latitude - lat) < 0.5, 'Decoded lat should be within precision bound');
  assert.ok(Math.abs(decoded.longitude - lon) < 0.5, 'Decoded lon should be within precision bound');
});

test('Atmospheric Seeing Estimation Logic', () => {
  // Pristine seeing conditions: low wind, moderate dew depression, clear skies
  const pristine = estimateSeeingFromMeteorology(5, 6.0, 45, 0, 25000);
  assert.ok(pristine.seeingIndex >= 4, 'Pristine conditions should yield seeing index >= 4');
  assert.ok(pristine.seeingArcsec <= 1.2, 'Pristine conditions should yield sub-1.2 arcsec seeing');

  // Poor seeing conditions: high wind, low dew depression, high humidity
  const poor = estimateSeeingFromMeteorology(35, 0.5, 92, 80, 5000);
  assert.ok(poor.seeingIndex <= 2, 'Poor conditions should yield seeing index <= 2');
  assert.ok(poor.seeingArcsec >= 2.5, 'Poor conditions should yield >= 2.5 arcsec seeing');
});

test('Observation Window Clustering Engine', () => {
  const mockWeatherGood = {
    time: new Date('2026-03-21T20:00:00Z'),
    cloudCover: 5,
    cloudLow: 0,
    cloudMid: 0,
    cloudHigh: 5,
    visibilityMeters: 20000,
    windSpeedKmh: 10,
    relativeHumidity: 45,
    temperatureC: 15,
    dewPointC: 8,
    dewDepressionC: 7,
    seeingIndex: 5,
    seeingArcsec: 1.0,
  };

  const mockWeatherPoor = {
    ...mockWeatherGood,
    cloudCover: 80,
    seeingIndex: 1,
    seeingArcsec: 3.0,
  };

  const mockHours: EvaluatedHour[] = [
    {
      time: new Date('2026-03-21T20:00:00Z'),
      sunAlt: -15,
      moonAlt: -10,
      moonIllumFraction: 0.1,
      seeingQuality: 'Excellent',
      transparencyQuality: 'Pristine',
      visibleTargets: [],
      score: 85,
      weather: mockWeatherGood,
      breakdown: {
        time: '20:00',
        totalScore: 85,
        cloudCover: 5,
        sunAlt: -15,
        moonAlt: -10,
        moonIllumPct: 10,
        seeingQuality: 'Excellent',
        transparencyQuality: 'Pristine',
        isNight: true,
        isAstronomicalDarkness: true,
        visibleTargetsCount: 4,
        targetNames: ['Jupiter', 'Saturn'],
      },
    },
    {
      time: new Date('2026-03-21T21:00:00Z'),
      sunAlt: -22,
      moonAlt: -15,
      moonIllumFraction: 0.1,
      seeingQuality: 'Good',
      transparencyQuality: 'Good',
      visibleTargets: [],
      score: 90,
      weather: mockWeatherGood,
      breakdown: {
        time: '21:00',
        totalScore: 90,
        cloudCover: 10,
        sunAlt: -22,
        moonAlt: -15,
        moonIllumPct: 10,
        seeingQuality: 'Good',
        transparencyQuality: 'Good',
        isNight: true,
        isAstronomicalDarkness: true,
        visibleTargetsCount: 5,
        targetNames: ['Jupiter', 'Saturn', 'M42'],
      },
    },
    {
      time: new Date('2026-03-21T22:00:00Z'),
      sunAlt: -25,
      moonAlt: -20,
      moonIllumFraction: 0.1,
      seeingQuality: 'Poor',
      transparencyQuality: 'Poor',
      visibleTargets: [],
      score: 15,
      weather: mockWeatherPoor,
      breakdown: {
        time: '22:00',
        totalScore: 15,
        cloudCover: 80,
        sunAlt: -25,
        moonAlt: -20,
        moonIllumPct: 10,
        seeingQuality: 'Poor',
        transparencyQuality: 'Poor',
        isNight: true,
        isAstronomicalDarkness: true,
        visibleTargetsCount: 0,
        targetNames: [],
      },
    },
  ];

  const mockMoon: MoonInfo = {
    altitude: -10,
    azimuth: 180,
    illuminationFraction: 0.1,
    phaseAngleDeg: 45,
    phaseName: 'Waxing Crescent',
    magnitude: -5.0,
    isAboveHorizon: false,
  };

  const windows = clusterObservationWindows(mockHours, mockMoon, [], []);

  assert.ok(windows.length >= 1, 'Should cluster high-scoring hours into observation windows');
  assert.ok(windows[0].avgScore >= 70, 'Best window should have high average score');
});

test('getNightSampleTimes spans dusk to dawn across global longitudes', () => {
  const testLocations = [
    { name: 'London', lat: 51.5074, lon: -0.1278 },
    { name: 'São Paulo', lat: -23.5505, lon: -46.6333 },
    { name: 'Los Angeles', lat: 34.0522, lon: -118.2437 },
    { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
  ];

  const date = new Date('2026-09-03T12:00:00Z');

  for (const loc of testLocations) {
    const observer = new Observer(loc.lat, loc.lon, 0);
    const times = getNightSampleTimes(date, observer);

    assert.ok(times.length >= 10, `${loc.name} should have at least 10 hourly samples`);
    assert.ok(times.length <= 18, `${loc.name} should not exceed 18 samples`);

    // Verify chronological ordering with 1-hour intervals
    for (let i = 1; i < times.length; i++) {
      const diffMs = times[i].getTime() - times[i - 1].getTime();
      assert.strictEqual(diffMs, 3600 * 1000, `${loc.name}: each step should be exactly 1 hour apart`);
    }
  }
});
