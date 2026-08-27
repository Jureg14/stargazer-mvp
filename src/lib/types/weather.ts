export interface HourlyWeatherRecord {
  time: Date;
  cloudCover: number;        // Total % (0-100)
  cloudLow: number;          // Low % (0-100)
  cloudMid: number;          // Mid % (0-100)
  cloudHigh: number;         // High % (0-100)
  visibilityMeters: number;  // e.g. 24140 m
  windSpeedKmh: number;      // km/h
  relativeHumidity: number;  // % (0-100)
  temperatureC: number;      // Celsius
  dewPointC: number;         // Celsius
  dewDepressionC: number;    // temperature - dewPoint
}

export interface RawOpenMeteoResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  hourly: {
    time: string[];
    cloudcover?: number[];
    cloudcover_low?: number[];
    cloudcover_mid?: number[];
    cloudcover_high?: number[];
    visibility?: number[];
    windspeed_10m?: number[];
    relative_humidity_2m?: number[];
    temperature_2m?: number[];
    dew_point_2m?: number[];
  };
}
