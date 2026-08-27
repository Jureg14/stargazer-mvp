import {
  Body,
  Equator,
  Horizon,
  Illumination,
  Observer,
  SearchRiseSet,
  Direction,
} from 'astronomy-engine';

export interface PlanetVisibility {
  body: Body;
  name: string;
  altitude: number;
  azimuth: number;
  magnitude: number;
  isAboveHorizon: boolean;
  isOptimal: boolean; // altitude >= 25 deg
  riseTime?: Date;
  setTime?: Date;
}

const TRACKED_PLANETS = [
  { body: Body.Venus, name: 'Venus' },
  { body: Body.Mars, name: 'Mars' },
  { body: Body.Jupiter, name: 'Jupiter' },
  { body: Body.Saturn, name: 'Saturn' },
];

export function calculatePlanetaryPositions(
  date: Date,
  latitude: number,
  longitude: number,
  elevationMeters = 0
): PlanetVisibility[] {
  const observer = new Observer(latitude, longitude, elevationMeters);

  return TRACKED_PLANETS.map(({ body, name }) => {
    // 1. Apparent equatorial coordinates
    const eq = Equator(body, date, observer, true, true);

    // 2. Horizontal coordinates (Alt/Az)
    const hor = Horizon(date, observer, eq.ra, eq.dec, 'normal');

    // 3. Magnitude & illumination
    const illum = Illumination(body, date);

    // 4. Rise / Set times within 24 hours of target date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const rise = SearchRiseSet(body, observer, Direction.Rise, startOfDay, 1);
    const set = SearchRiseSet(body, observer, Direction.Set, startOfDay, 1);

    return {
      body,
      name,
      altitude: Math.round(hor.altitude * 10) / 10,
      azimuth: Math.round(hor.azimuth * 10) / 10,
      magnitude: Math.round(illum.mag * 10) / 10,
      isAboveHorizon: hor.altitude > 0,
      isOptimal: hor.altitude >= 25,
      riseTime: rise ? rise.date : undefined,
      setTime: set ? set.date : undefined,
    };
  });
}
