import { HourlyWeatherRecord, RawOpenMeteoResponse } from '../types/weather';

/**
 * Fetches hourly weather variables from Open-Meteo for stargazing evaluation.
 */
export async function fetchWeatherForecast(
  lat: number,
  lon: number,
  startDate: string, // YYYY-MM-DD
  endDate: string,   // YYYY-MM-DD
  timezone = 'auto'
): Promise<{
  records: HourlyWeatherRecord[];
  timezone: string;
  elevationMeters: number;
}> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    hourly: [
      'cloudcover',
      'cloudcover_low',
      'cloudcover_mid',
      'cloudcover_high',
      'visibility',
      'windspeed_10m',
      'relative_humidity_2m',
      'temperature_2m',
      'dew_point_2m',
    ].join(','),
    timezone,
    start_date: startDate,
    end_date: endDate,
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });

  if (!res.ok) {
    throw new Error(`Open-Meteo forecast failed with status ${res.status}: ${res.statusText}`);
  }

  const data: RawOpenMeteoResponse = await res.json();
  const times = data.hourly?.time ?? [];
  const records: HourlyWeatherRecord[] = [];

  for (let i = 0; i < times.length; i++) {
    const temp = data.hourly.temperature_2m?.[i] ?? 15;
    const dew = data.hourly.dew_point_2m?.[i] ?? 10;

    records.push({
      time: new Date(times[i]),
      cloudCover: data.hourly.cloudcover?.[i] ?? 0,
      cloudLow: data.hourly.cloudcover_low?.[i] ?? 0,
      cloudMid: data.hourly.cloudcover_mid?.[i] ?? 0,
      cloudHigh: data.hourly.cloudcover_high?.[i] ?? 0,
      visibilityMeters: data.hourly.visibility?.[i] ?? 10000,
      windSpeedKmh: data.hourly.windspeed_10m?.[i] ?? 0,
      relativeHumidity: data.hourly.relative_humidity_2m?.[i] ?? 50,
      temperatureC: temp,
      dewPointC: dew,
      dewDepressionC: Math.max(0, temp - dew),
    });
  }

  return {
    records,
    timezone: data.timezone || timezone,
    elevationMeters: data.elevation || 0,
  };
}
