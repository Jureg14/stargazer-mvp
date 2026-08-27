import { Body, Observer, SearchAltitude, SearchRiseSet } from 'astronomy-engine';
import { TwilightTimes } from '../types/astro';

/**
 * Calculates dusk and dawn twilight milestones for an observer on a given date.
 */
export function calculateTwilight(date: Date, observer: Observer): TwilightTimes {
  // Anchor search at noon of local observer date
  const noon = new Date(date);
  noon.setHours(12, 0, 0, 0);

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
