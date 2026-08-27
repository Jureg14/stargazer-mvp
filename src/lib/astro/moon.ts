import {
  Body,
  Equator,
  Horizon,
  Illumination,
  MoonPhase,
  Observer,
  SearchRiseSet,
} from 'astronomy-engine';
import { MoonInfo } from '../types/astro';

/**
 * Calculates current Moon status, phase name, illumination, and rise/set times.
 */
export function calculateMoonInfo(date: Date, observer: Observer): MoonInfo {
  const eq = Equator(Body.Moon, date, observer, true, true);
  const hor = Horizon(date, observer, eq.ra, eq.dec, 'normal');
  const illum = Illumination(Body.Moon, date);
  const phaseDeg = MoonPhase(date);

  let phaseName = 'New Moon';
  if (phaseDeg > 15 && phaseDeg < 75) phaseName = 'Waxing Crescent';
  else if (phaseDeg >= 75 && phaseDeg <= 105) phaseName = 'First Quarter';
  else if (phaseDeg > 105 && phaseDeg < 165) phaseName = 'Waxing Gibbous';
  else if (phaseDeg >= 165 && phaseDeg <= 195) phaseName = 'Full Moon';
  else if (phaseDeg > 195 && phaseDeg < 255) phaseName = 'Waning Gibbous';
  else if (phaseDeg >= 255 && phaseDeg <= 285) phaseName = 'Third Quarter';
  else if (phaseDeg > 285 && phaseDeg < 345) phaseName = 'Waning Crescent';

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  // Direction +1 = Rise, -1 = Set
  const rise = SearchRiseSet(Body.Moon, observer, 1, startOfDay, 1);
  const set = SearchRiseSet(Body.Moon, observer, -1, startOfDay, 1);

  return {
    altitude: Math.round(hor.altitude * 10) / 10,
    azimuth: Math.round(hor.azimuth * 10) / 10,
    illuminationFraction: Math.round(illum.phase_fraction * 100) / 100,
    phaseAngleDeg: Math.round(phaseDeg),
    phaseName,
    magnitude: Math.round(illum.mag * 10) / 10,
    isAboveHorizon: hor.altitude > 0,
    riseTime: rise ? rise.date : undefined,
    setTime: set ? set.date : undefined,
  };
}
