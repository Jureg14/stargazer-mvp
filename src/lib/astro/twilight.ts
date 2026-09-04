import { Body, Observer, SearchAltitude, SearchRiseSet } from 'astronomy-engine';
import { TwilightTimes } from '../types/astro';

/**
 * Computes approximate local solar noon UTC for an observer on a given calendar date.
 */
export function getLocalSolarNoon(date: Date, observer: Observer): Date {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const localNoonUtcMs = Date.UTC(year, month, day, 0, 0, 0) + (12 - observer.longitude / 15) * 3600 * 1000;
  return new Date(localNoonUtcMs);
}

/**
 * Calculates hourly sampling timestamps spanning dusk to dawn for the observer on a given date.
 */
export function getNightSampleTimes(date: Date, observer: Observer): Date[] {
  const noon = getLocalSolarNoon(date, observer);
  const sunset = SearchRiseSet(Body.Sun, observer, -1, noon, 1);
  const sunrise = sunset ? SearchRiseSet(Body.Sun, observer, 1, sunset.date, 1) : null;

  let startTime: Date;
  let endTime: Date;

  if (sunset && sunrise) {
    // Start at top of the hour preceding sunset (capturing dusk transition)
    const sunsetMs = sunset.date.getTime();
    startTime = new Date(Math.floor((sunsetMs - 30 * 60 * 1000) / 3600000) * 3600000);
    // End at top of the hour following sunrise (capturing dawn transition)
    const sunriseMs = sunrise.date.getTime();
    endTime = new Date(Math.ceil((sunriseMs + 30 * 60 * 1000) / 3600000) * 3600000);
  } else {
    // Fallback for polar regions without standard rise/set: 18:00 to 06:00 local solar time
    startTime = new Date(noon.getTime() + 6 * 3600 * 1000);
    endTime = new Date(noon.getTime() + 18 * 3600 * 1000);
  }

  const sampleTimes: Date[] = [];
  let t = startTime.getTime();
  const endMs = endTime.getTime();
  while (t <= endMs) {
    sampleTimes.push(new Date(t));
    t += 3600 * 1000;
  }
  return sampleTimes;
}

/**
 * Calculates dusk and dawn twilight milestones for an observer on a given date.
 */
export function calculateTwilight(date: Date, observer: Observer): TwilightTimes {
  // Anchor search at local solar noon of observer date
  const noon = getLocalSolarNoon(date, observer);

  // Direction -1 = descending (sunset/dusk), Direction +1 = ascending (sunrise/dawn)
  const sunset = SearchRiseSet(Body.Sun, observer, -1, noon, 1);
  const civilDusk = SearchAltitude(Body.Sun, observer, -1, noon, 1, -6);
  const nauticalDusk = SearchAltitude(Body.Sun, observer, -1, noon, 1, -12);
  const astroDusk = SearchAltitude(Body.Sun, observer, -1, noon, 1, -18);

  // Search forward from midnight for morning twilight and sunrise
  const midnight = new Date(noon.getTime() + 12 * 3600 * 1000);
  const astroDawn = SearchAltitude(Body.Sun, observer, 1, midnight, 1, -18);
  const nauticalDawn = SearchAltitude(Body.Sun, observer, 1, midnight, 1, -12);
  const civilDawn = SearchAltitude(Body.Sun, observer, 1, midnight, 1, -6);
  const sunrise = SearchRiseSet(Body.Sun, observer, 1, midnight, 1);

  return {
    sunset: sunset ? sunset.date : null,
    civilDusk: civilDusk ? civilDusk.date : null,
    nauticalDusk: nauticalDusk ? nauticalDusk.date : null,
    astroDusk: astroDusk ? astroDusk.date : null,
    astroDawn: astroDawn ? astroDawn.date : null,
    nauticalDawn: nauticalDawn ? nauticalDawn.date : null,
    civilDawn: civilDawn ? civilDawn.date : null,
    sunrise: sunrise ? sunrise.date : null,
  };
}
