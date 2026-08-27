import { Body } from 'astronomy-engine';

export interface HorizontalPos {
  altitude: number; // in degrees (-90 to +90)
  azimuth: number;  // in degrees (0 to 360 clockwise from North)
  distanceAu: number;
}

export interface TwilightTimes {
  sunset: Date | null;
  civilDusk: Date | null;
  nauticalDusk: Date | null;
  astroDusk: Date | null;
  astroDawn: Date | null;
  nauticalDawn: Date | null;
  civilDawn: Date | null;
  sunrise: Date | null;
  isPolarDay?: boolean;
  isPolarNight?: boolean;
}

export interface MoonInfo {
  altitude: number;
  azimuth: number;
  illuminationFraction: number; // 0.0 to 1.0
  phaseAngleDeg: number;
  phaseName: string;
  magnitude: number;
  isAboveHorizon: boolean;
  riseTime?: Date;
  setTime?: Date;
}

export interface CelestialTarget {
  id: string;
  name: string;
  type: 'planet' | 'moon' | 'dso' | 'milkyway' | 'satellite';
  body?: Body;
  altitude: number;
  azimuth: number;
  magnitude: number;
  constellation?: string;
  isAboveHorizon: boolean;
  isOptimal: boolean; // altitude >= 25 deg
  bestWindow?: string;
  notes?: string;
}
