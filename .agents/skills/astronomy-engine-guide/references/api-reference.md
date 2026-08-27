# Astronomy Engine (JavaScript/TypeScript) API Reference

Key functions in `astronomy-engine` used in the Stargazer project:

---

## 1. Class: `Observer`
```typescript
new Observer(latitude: number, longitude: number, height: number = 0)
```
- `latitude`: Observer's geographic latitude in degrees $[-90, +90]$.
- `longitude`: Observer's geographic longitude in degrees $[-180, +180]$ (positive East, negative West).
- `height`: Elevation above sea level in meters.

---

## 2. Function: `Equator`
```typescript
function Equator(
  body: Body,
  date: FlexibleDateTime,
  observer: Observer,
  equatorType: boolean, // true = ofdate (apparent), false = J2000
  aberration: boolean   // true = correct for aberration
): EquatorialCoordinates
```
Returns:
- `ra`: Right ascension in sidereal hours $[0, 24)$.
- `dec`: Declination in degrees $[-90, +90]$.
- `dist`: Distance from observer in AU.

---

## 3. Function: `Horizon`
```typescript
function Horizon(
  date: FlexibleDateTime,
  observer: Observer,
  ra: number,          // RA in sidereal hours
  dec: number,         // Dec in degrees
  refraction?: 'normal' | 'jplhor' | null
): HorizontalCoordinates
```
Returns:
- `altitude`: Altitude in degrees $[-90, +90]$ above horizon.
- `azimuth`: Azimuth in degrees $[0, 360)$ clockwise from True North.
- `ra`: Input right ascension.
- `dec`: Input declination.

---

## 4. Function: `SearchRiseSet`
```typescript
function SearchRiseSet(
  body: Body,
  observer: Observer,
  direction: Direction, // Direction.Rise (+1) or Direction.Set (-1)
  date: FlexibleDateTime,
  limitDays: number
): AstroTime | null
```

---

## 5. Function: `SearchAltitude`
```typescript
function SearchAltitude(
  body: Body,
  observer: Observer,
  direction: Direction, // Direction.Up (+1) or Direction.Down (-1)
  date: FlexibleDateTime,
  limitDays: number,
  targetAltitude: number // e.g. -6 (civil), -12 (nautical), -18 (astro)
): AstroTime | null
```

---

## 6. Function: `Illumination`
```typescript
function Illumination(body: Body, date: FlexibleDateTime): IlluminationInfo
```
Returns:
- `mag`: Apparent visual magnitude.
- `phase_angle`: Phase angle in degrees $[0, 180]$.
- `phase_fraction`: Fraction of sunlit disk $[0.0, 1.0]$.
- `ring_tilt`: For Saturn, angular tilt of rings in degrees away from Earth.
