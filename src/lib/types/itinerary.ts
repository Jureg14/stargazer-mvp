import { CelestialTarget, MoonInfo, TwilightTimes } from './astro';
import { HourlyWeatherRecord } from './weather';

export interface HourlyScoreBreakdown {
  time: string;
  totalScore: number;
  cloudCover: number;
  sunAlt: number;
  moonAlt: number;
  moonIllumPct: number;
  seeingQuality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  transparencyQuality: 'Pristine' | 'Good' | 'Hazy' | 'Poor';
  isNight: boolean;
  isAstronomicalDarkness: boolean;
  visibleTargetsCount: number;
  targetNames: string[];
}

export interface ObservationWindow {
  id: string;
  start: string;
  end: string;
  durationMinutes: number;
  avgScore: number;
  minScore: number;
  maxScore: number;
  avgCloud: number;
  seeing: 'Excellent' | 'Good' | 'Fair';
  transparency: string;
  moonStatus: string;
  highlights: string[];
  narrative: string;
  targets: CelestialTarget[];
}

export interface StargazeItineraryResponse {
  location: {
    lat: number;
    lon: number;
    name?: string;
    timezone: string;
    elevationMeters: number;
  };
  queryDate: string;
  nightQualityScore: number; // 0-100 overall night rating
  nightSummary: string;
  twilight: TwilightTimes;
  moon: MoonInfo;
  bestWindow: ObservationWindow | null;
  windows: ObservationWindow[];
  targets: CelestialTarget[];
  hourlyTimeline: HourlyScoreBreakdown[];
  weatherRecords?: HourlyWeatherRecord[];
}
