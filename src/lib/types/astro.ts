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

export type BortleClass = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface BortleInfo {
  classNumber: BortleClass;
  title: string;
  nelm: number; // Naked Eye Limiting Magnitude (e.g. 7.8 down to 4.0)
  description: string;
  penaltyScore: number;
}

export interface SatellitePass {
  satelliteName: string;
  noradId: number;
  startTime: string;
  peakTime: string;
  endTime: string;
  durationSeconds: number;
  maxAltitudeDeg: number;
  startAzimuthDeg: number;
  endAzimuthDeg: number;
  startDirection: string;
  endDirection: string;
  estimatedMagnitude: number;
  trajectory: string; // e.g. "NW to SE"
}

export interface MeteorShower {
  id: string;
  name: string;
  parentBody: string;
  peakDate: string; // e.g. "Aug 12–13"
  activeRange: string; // e.g. "Jul 17 – Aug 24"
  radiantConstellation: string;
  nominalZhr: number; // Zenithal Hourly Rate at zenith under pristine skies
  effectiveZhr: number; // Adjusted for radiant elevation & moonlight
  radiantAltitude: number; // Altitude at current/peak hour
  radiantAzimuth: number;
  isPeakNight: boolean;
  status: 'Peak Active' | 'Active' | 'Incoming' | 'Past Peak';
}

export interface AltitudePoint {
  time: string;
  altitude: number;
  isAboveHorizon: boolean;
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
  minBortleClass?: BortleClass; // Maximum light polluted Bortle in which it remains observable
  bestWindow?: string;
  notes?: string;
  altitudeHistory?: AltitudePoint[]; // Altitude progression across the night
}

export type CelestialBodyType = 'planet' | 'star' | 'constellation' | 'dso' | 'moon';

export interface CulminationWindow {
  riseTime: string | null;       // ISO string
  peakTime: string;              // ISO string (highest point in the sky)
  setTime: string | null;        // ISO string
  peakAltitudeDeg: number;
  peakAzimuthDeg: number;
  sunAltAtPeak: number;
  daytimeCategory: 'night' | 'twilight' | 'daytime';
  isDaytimeVisible: boolean;     // e.g. true for Moon, Sun, or exceptionally bright Venus
  azimuthDirection: string;      // e.g. 'N', 'S', 'NE', etc.
  dayLabel: string;              // e.g. 'Today', 'Tonight', 'Tomorrow Morning', 'Tomorrow Afternoon'
}

export type DSOSubtype =
  | 'galaxy'
  | 'diffuse_nebula'
  | 'planetary_nebula'
  | 'supernova_remnant'
  | 'open_cluster'
  | 'globular_cluster'
  | 'asterism'
  | 'dark_nebula';

export type TargetCatalog = 'messier' | 'caldwell' | 'solar' | 'star' | 'constellation';
export type OpticsRequirement = 'naked_eye' | 'binoculars' | 'small_telescope' | 'large_telescope';

export interface SearchableCelestialTarget {
  id: string;
  name: string;
  type: CelestialBodyType;
  catalog?: TargetCatalog;
  dsoType?: DSOSubtype;
  catalogNumber?: number;
  ngc?: string;
  opticsRequirement?: OpticsRequirement;
  magnitude: number;
  constellation: string;
  description: string;
  notes?: string;
  window: CulminationWindow;
  currentAltitude: number;
  currentAzimuth: number;
  isAboveHorizon: boolean;
  minBortleClass?: BortleClass;
}
