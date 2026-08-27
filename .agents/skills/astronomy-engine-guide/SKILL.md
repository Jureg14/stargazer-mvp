---
name: astronomy-engine-guide
description: >-
  Expert guide for computing celestial positions, altitudes, azimuths, twilight times,
  planetary visibility, and lunar illumination using the astronomy-engine npm package.
  Use this skill whenever working on astronomy calculations, celestial body tracking,
  equatorial/horizontal conversions, or rise/set times.
---

# Astronomy Engine Guide (`astronomy-engine`)

This skill provides step-by-step procedures and code patterns for using `astronomy-engine` (v2.1.x) accurately in TypeScript within the Stargazer project.

---

## 1. Core Concepts & Objects

### 1.1 Observer
Represents the geographical position of the user:
```typescript
import { Observer } from 'astronomy-engine';

// latitude (degrees north), longitude (degrees east), elevation in meters
const observer = new Observer(latitude, longitude, elevationMeters ?? 0);
```

### 1.2 Celestial Bodies
Supported enum values in `Body`:
- `Body.Sun`, `Body.Moon`
- `Body.Mercury`, `Body.Venus`, `Body.Mars`, `Body.Jupiter`, `Body.Saturn`, `Body.Uranus`, `Body.Neptune`, `Body.Pluto`
- Custom user-defined stars (`DefineStar(Body.Star1, raHours, decDegrees, distLy)`) for DSOs (e.g. M31, M42).

---

## 2. Standard Calculation Workflows

### 2.1 Calculating Altitude & Azimuth for a Body
To compute where an object appears in the sky for an observer at time `date`:

```typescript
import { Body, Equator, Horizon, Observer } from 'astronomy-engine';

export function getBodyHorizontalPosition(
  body: Body,
  date: Date,
  observer: Observer
) {
  // 1. Compute apparent equatorial coordinates (RA in hours, Dec in degrees)
  const eq = Equator(body, date, observer, true, true);

  // 2. Convert to horizontal coordinates (altitude & azimuth in degrees)
  const hor = Horizon(date, observer, eq.ra, eq.dec, 'normal');

  return {
    altitude: hor.altitude, // in degrees (-90 to +90)
    azimuth: hor.azimuth,   // in degrees (0 to 360 clockwise from North)
    distanceAu: eq.dist,    // distance in AU
  };
}
```

### 2.2 Twilight Calculation (Civil, Nautical, Astronomical)
To find when the Sun sinks below key depression angles:

```typescript
import { Body, Direction, SearchAltitude, SearchRiseSet, Observer } from 'astronomy-engine';

export function getTwilightTimes(date: Date, observer: Observer) {
  // Search forward from noon of target date
  const noon = new Date(date);
  noon.setHours(12, 0, 0, 0);

  // Direction -1 = descending (sunset/dusk), Direction +1 = ascending (sunrise/dawn)
  const sunset = SearchRiseSet(Body.Sun, observer, Direction.Set, noon, 1);
  const civilDusk = SearchAltitude(Body.Sun, observer, Direction.Down, noon, 1, -6);
  const nauticalDusk = SearchAltitude(Body.Sun, observer, Direction.Down, noon, 1, -12);
  const astroDusk = SearchAltitude(Body.Sun, observer, Direction.Down, noon, 1, -18);

  return {
    sunset: sunset?.date,
    civilDusk: civilDusk?.date,
    nauticalDusk: nauticalDusk?.date,
    astroDusk: astroDusk?.date,
  };
}
```

### 2.3 Moon Phase, Illumination & Magnitude
```typescript
import { Body, Illumination, MoonPhase } from 'astronomy-engine';

export function getMoonDetails(date: Date) {
  const phaseDeg = MoonPhase(date); // 0..360 (0=New, 90=1st Qtr, 180=Full, 270=3rd Qtr)
  const illum = Illumination(Body.Moon, date);

  let phaseName = 'New Moon';
  if (phaseDeg > 15 && phaseDeg < 75) phaseName = 'Waxing Crescent';
  else if (phaseDeg >= 75 && phaseDeg <= 105) phaseName = 'First Quarter';
  else if (phaseDeg > 105 && phaseDeg < 165) phaseName = 'Waxing Gibbous';
  else if (phaseDeg >= 165 && phaseDeg <= 195) phaseName = 'Full Moon';
  else if (phaseDeg > 195 && phaseDeg < 255) phaseName = 'Waning Gibbous';
  else if (phaseDeg >= 255 && phaseDeg <= 285) phaseName = 'Third Quarter';
  else if (phaseDeg > 285 && phaseDeg < 345) phaseName = 'Waning Crescent';

  return {
    phaseDegrees: phaseDeg,
    fractionIlluminated: illum.phase_fraction, // 0.0 to 1.0
    magnitude: illum.mag,
    phaseName,
  };
}
```

---

## 3. Reference Documentation & Examples

- Detailed API reference: [api-reference.md](./references/api-reference.md)
- Complete planetary visibility sample: [planet-visibility.ts](./examples/planet-visibility.ts)
