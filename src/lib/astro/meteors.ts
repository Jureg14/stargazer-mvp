import { DefineStar, Body, Equator, Horizon, Observer } from 'astronomy-engine';
import { MeteorShower, MoonInfo } from '../types/astro';

interface AnnualShowerDef {
  id: string;
  name: string;
  parentBody: string;
  startMonth: number; // 1-12
  startDay: number;
  endMonth: number;
  endDay: number;
  peakMonth: number;
  peakDayStart: number;
  peakDayEnd: number;
  radiantConstellation: string;
  nominalZhr: number;
  raHours: number;
  decDeg: number;
  starBody: Body;
}

// Fixed slot mapping for radiants
DefineStar(Body.Star6, 3.07, 58.0, 1000);   // Perseids radiant
DefineStar(Body.Star7, 7.47, 33.0, 1000);   // Geminids radiant
DefineStar(Body.Star8, 15.33, 49.0, 1000);  // Quadrantids radiant

const ANNUAL_SHOWERS: AnnualShowerDef[] = [
  {
    id: 'quadrantids',
    name: 'Quadrantids',
    parentBody: 'Asteroid 2003 EH1',
    startMonth: 12,
    startDay: 28,
    endMonth: 1,
    endDay: 12,
    peakMonth: 1,
    peakDayStart: 3,
    peakDayEnd: 4,
    radiantConstellation: 'Boötes',
    nominalZhr: 110,
    raHours: 15.33,
    decDeg: 49.0,
    starBody: Body.Star8,
  },
  {
    id: 'lyrids',
    name: 'Lyrids',
    parentBody: 'Comet C/1861 G1 (Thatcher)',
    startMonth: 4,
    startDay: 14,
    endMonth: 4,
    endDay: 30,
    peakMonth: 4,
    peakDayStart: 22,
    peakDayEnd: 23,
    radiantConstellation: 'Lyra',
    nominalZhr: 18,
    raHours: 18.08,
    decDeg: 34.0,
    starBody: Body.Star6,
  },
  {
    id: 'eta-aquariids',
    name: 'Eta Aquariids',
    parentBody: '1P/Halley',
    startMonth: 4,
    startDay: 19,
    endMonth: 5,
    endDay: 28,
    peakMonth: 5,
    peakDayStart: 5,
    peakDayEnd: 6,
    radiantConstellation: 'Aquarius',
    nominalZhr: 50,
    raHours: 22.5,
    decDeg: -1.0,
    starBody: Body.Star6,
  },
  {
    id: 'delta-aquariids',
    name: 'Southern Delta Aquariids',
    parentBody: 'Comet 96P/Machholz',
    startMonth: 7,
    startDay: 12,
    endMonth: 8,
    endDay: 23,
    peakMonth: 7,
    peakDayStart: 29,
    peakDayEnd: 30,
    radiantConstellation: 'Aquarius',
    nominalZhr: 25,
    raHours: 22.67,
    decDeg: -16.0,
    starBody: Body.Star6,
  },
  {
    id: 'perseids',
    name: 'Perseids',
    parentBody: 'Comet 109P/Swift-Tuttle',
    startMonth: 7,
    startDay: 17,
    endMonth: 8,
    endDay: 24,
    peakMonth: 8,
    peakDayStart: 12,
    peakDayEnd: 13,
    radiantConstellation: 'Perseus',
    nominalZhr: 100,
    raHours: 3.07,
    decDeg: 58.0,
    starBody: Body.Star6,
  },
  {
    id: 'orionids',
    name: 'Orionids',
    parentBody: '1P/Halley',
    startMonth: 10,
    startDay: 2,
    endMonth: 11,
    endDay: 7,
    peakMonth: 10,
    peakDayStart: 21,
    peakDayEnd: 22,
    radiantConstellation: 'Orion',
    nominalZhr: 20,
    raHours: 6.33,
    decDeg: 16.0,
    starBody: Body.Star7,
  },
  {
    id: 'leonids',
    name: 'Leonids',
    parentBody: 'Comet 55P/Tempel-Tuttle',
    startMonth: 11,
    startDay: 6,
    endMonth: 11,
    endDay: 30,
    peakMonth: 11,
    peakDayStart: 17,
    peakDayEnd: 18,
    radiantConstellation: 'Leo',
    nominalZhr: 15,
    raHours: 10.13,
    decDeg: 22.0,
    starBody: Body.Star7,
  },
  {
    id: 'geminids',
    name: 'Geminids',
    parentBody: 'Asteroid 3200 Phaethon',
    startMonth: 12,
    startDay: 4,
    endMonth: 12,
    endDay: 17,
    peakMonth: 12,
    peakDayStart: 13,
    peakDayEnd: 14,
    radiantConstellation: 'Gemini',
    nominalZhr: 120,
    raHours: 7.47,
    decDeg: 33.0,
    starBody: Body.Star7,
  },
  {
    id: 'ursids',
    name: 'Ursids',
    parentBody: 'Comet 8P/Tuttle',
    startMonth: 12,
    startDay: 17,
    endMonth: 12,
    endDay: 26,
    peakMonth: 12,
    peakDayStart: 22,
    peakDayEnd: 23,
    radiantConstellation: 'Ursa Minor',
    nominalZhr: 10,
    raHours: 14.47,
    decDeg: 76.0,
    starBody: Body.Star8,
  },
];

function isDateInRange(
  month: number,
  day: number,
  startMonth: number,
  startDay: number,
  endMonth: number,
  endDay: number
): boolean {
  if (startMonth <= endMonth) {
    if (month < startMonth || month > endMonth) return false;
    if (month === startMonth && day < startDay) return false;
    if (month === endMonth && day > endDay) return false;
    return true;
  } else {
    // Crosses year boundary (e.g. Dec 28 to Jan 12)
    return (
      (month === startMonth && day >= startDay) ||
      month > startMonth ||
      (month === endMonth && day <= endDay) ||
      month < endMonth
    );
  }
}

/**
 * Calculates active meteor showers, radiant altitude, and estimated visual rate.
 */
export function calculateMeteorShowers(
  date: Date,
  observer: Observer,
  moon: MoonInfo
): MeteorShower[] {
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  const activeShowers: MeteorShower[] = [];

  for (const shower of ANNUAL_SHOWERS) {
    const isActive = isDateInRange(
      month,
      day,
      shower.startMonth,
      shower.startDay,
      shower.endMonth,
      shower.endDay
    );

    if (isActive) {
      // Check if tonight is the peak
      const isPeak =
        month === shower.peakMonth &&
        day >= shower.peakDayStart &&
        day <= shower.peakDayEnd;

      // Radiant horizontal coordinates at midnight of target date
      const midnight = new Date(date);
      midnight.setUTCHours(2, 0, 0, 0);

      DefineStar(shower.starBody, shower.raHours, shower.decDeg, 1000);
      const eq = Equator(shower.starBody, midnight, observer, true, true);
      const hor = Horizon(midnight, observer, eq.ra, eq.dec, 'normal');

      const radiantAlt = Math.max(0, Math.round(hor.altitude * 10) / 10);
      const radiantAz = Math.round(hor.azimuth * 10) / 10;

      // Effective ZHR estimation: Nominal * sin(radiantAlt) * moonFactor * proximityFactor
      const altFactor = hor.altitude > 10 ? Math.sin((hor.altitude * Math.PI) / 180) : 0.1;
      const moonFactor = moon.altitude > 0 ? Math.max(0.2, 1.0 - moon.illuminationFraction * 0.7) : 1.0;
      const proximityFactor = isPeak ? 1.0 : 0.35;

      const effectiveZhr = Math.max(1, Math.round(shower.nominalZhr * altFactor * moonFactor * proximityFactor));

      let status: 'Peak Active' | 'Active' | 'Incoming' | 'Past Peak' = 'Active';
      if (isPeak) status = 'Peak Active';
      else if (month < shower.peakMonth || (month === shower.peakMonth && day < shower.peakDayStart)) {
        status = 'Incoming';
      } else {
        status = 'Past Peak';
      }

      activeShowers.push({
        id: shower.id,
        name: shower.name,
        parentBody: shower.parentBody,
        peakDate: `${getMonthName(shower.peakMonth)} ${shower.peakDayStart}–${shower.peakDayEnd}`,
        activeRange: `${getMonthName(shower.startMonth)} ${shower.startDay} – ${getMonthName(shower.endMonth)} ${shower.endDay}`,
        radiantConstellation: shower.radiantConstellation,
        nominalZhr: shower.nominalZhr,
        effectiveZhr,
        radiantAltitude: radiantAlt,
        radiantAzimuth: radiantAz,
        isPeakNight: isPeak,
        status,
      });
    }
  }

  return activeShowers.sort((a, b) => b.effectiveZhr - a.effectiveZhr);
}

function getMonthName(m: number): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[m - 1] ?? 'Jan';
}
