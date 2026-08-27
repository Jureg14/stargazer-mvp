---
name: weather-forecast-integration
description: >-
  Guide for fetching, parsing, and caching weather forecasts from Open-Meteo and Meteoblue APIs.
  Use this skill when implementing weather fetching, astronomical seeing models, cloud layer evaluation,
  or weather cache management.
---

# Weather Forecast Integration (`Open-Meteo` & `Meteoblue`)

This skill provides procedures and TypeScript patterns for fetching hourly weather forecasts and modeling atmospheric transparency and seeing conditions.

---

## 1. Open-Meteo Hourly Forecast

Open-Meteo provides free, high-accuracy hourly weather forecasts without requiring an API key.

### 1.1 Essential Parameters for Stargazing
```text
https://api.open-meteo.com/v1/forecast?
  latitude={lat}&
  longitude={lon}&
  hourly=cloudcover,cloudcover_low,cloudcover_mid,cloudcover_high,visibility,windspeed_10m,relative_humidity_2m,temperature_2m,dew_point_2m&
  timezone=auto&
  start_date={YYYY-MM-DD}&
  end_date={YYYY-MM-DD}
```

### 1.2 TypeScript Client Implementation

```typescript
export interface HourlyWeatherRecord {
  time: Date;
  cloudCover: number;     // 0-100%
  cloudLow: number;       // 0-100%
  cloudMid: number;       // 0-100%
  cloudHigh: number;      // 0-100%
  visibilityMeters: number; // e.g. 24140
  windSpeedKmh: number;   // km/h
  relativeHumidity: number; // %
  dewDepression: number;  // temp - dewpoint in Celsius
}

export async function fetchHourlyForecast(
  lat: number,
  lon: number,
  startDate: string, // 'YYYY-MM-DD'
  endDate: string    // 'YYYY-MM-DD'
): Promise<HourlyWeatherRecord[]> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=cloudcover,cloudcover_low,cloudcover_mid,cloudcover_high,visibility,windspeed_10m,relative_humidity_2m,temperature_2m,dew_point_2m&timezone=auto&start_date=${startDate}&end_date=${endDate}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Open-Meteo API failed with status ${res.status}: ${res.statusText}`);
  }

  const data = await res.json();
  const records: HourlyWeatherRecord[] = [];

  for (let i = 0; i < data.hourly.time.length; i++) {
    const temp = data.hourly.temperature_2m[i] ?? 15;
    const dew = data.hourly.dew_point_2m[i] ?? 10;

    records.push({
      time: new Date(data.hourly.time[i]),
      cloudCover: data.hourly.cloudcover[i] ?? 0,
      cloudLow: data.hourly.cloudcover_low[i] ?? 0,
      cloudMid: data.hourly.cloudcover_mid[i] ?? 0,
      cloudHigh: data.hourly.cloudcover_high[i] ?? 0,
      visibilityMeters: data.hourly.visibility[i] ?? 10000,
      windSpeedKmh: data.hourly.windspeed_10m[i] ?? 0,
      relativeHumidity: data.hourly.relative_humidity_2m[i] ?? 50,
      dewDepression: Math.max(0, temp - dew),
    });
  }

  return records;
}
```

---

## 2. Atmospheric Seeing Classification

When direct seeing sensors are unavailable (in v1/v2), estimate seeing conditions from standard meteorological variables:

| Seeing Rating | Criteria | Description |
| :--- | :--- | :--- |
| **Excellent** | Cloud $< 15\%$, Visibility $> 20\text{ km}$, Wind $< 12\text{ km/h}$, Dew Depression $> 3^\circ\text{C}$ | Crisp planetary disks, sharp lunar craters, steady star Airy discs. |
| **Good** | Cloud $< 30\%$, Visibility $> 15\text{ km}$, Wind $< 20\text{ km/h}$ | Minor atmospheric scintillation; good for general stargazing. |
| **Fair** | Cloud $30\% - 50\%$, Visibility $8 - 15\text{ km}$, Wind $20 - 30\text{ km/h}$ | Moderate turbulence; high-power planetary observing degraded. |
| **Poor** | Cloud $> 50\%$ or Visibility $< 8\text{ km}$ or Wind $> 30\text{ km/h}$ | Unsteady skies or heavy cloud interference. |

---

## 3. Meteoblue Seeing Integration (v3 Roadmap)

For v3, query Meteoblue's Astronomical Seeing package:
- Endpoint: `https://my.meteoblue.com/packages/seeing-1h`
- Fields: `seeing1`, `seeing2` (arcseconds arc-resolution), `badlayers` (count of turbulent air layers), and `jetstream` ($\text{m/s}$).

---

## 4. References

- Detailed Open-Meteo field definitions and response structures: [open-meteo-api.md](./references/open-meteo-api.md)
