# Open-Meteo API Reference for Stargazer

This reference documents the API contracts, query parameters, and data interpretation for the Open-Meteo weather service.

---

## 1. Endpoint Overview
- **Base URL**: `https://api.open-meteo.com/v1/forecast`
- **Method**: `GET`
- **Authentication**: None required (Free tier supports 10,000 daily requests)

---

## 2. Key Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `latitude` | `number` | Yes | Decimal latitude (e.g. `37.7749`) |
| `longitude` | `number` | Yes | Decimal longitude (e.g. `-122.4194`) |
| `hourly` | `string` | Yes | Comma-separated list of hourly variables |
| `timezone` | `string` | No | Timezone identifier (`auto` or e.g. `America/Sao_Paulo`) |
| `start_date` | `string` | No | Date in `YYYY-MM-DD` ISO format |
| `end_date` | `string` | No | Date in `YYYY-MM-DD` ISO format |

---

## 3. Hourly Variable Dictionary

- **`cloudcover`** ($\%$): Total cloud cover as a percentage ($0 - 100$).
- **`cloudcover_low`** ($\%$): Low-altitude cloud cover ($0 - 3\text{ km}$ above ground level).
- **`cloudcover_mid`** ($\%$): Mid-altitude cloud cover ($3 - 8\text{ km}$ above ground level).
- **`cloudcover_high`** ($\%$): High-altitude cloud cover ($> 8\text{ km}$ above ground level).
- **`visibility`** ($\text{m}$): Horizontal visibility distance in meters. Capped at $24,140\text{ m}$ in some NWP models.
- **`windspeed_10m`** ($\text{km/h}$): Wind speed at 10 meters above surface.
- **`relative_humidity_2m`** ($\%$): Relative humidity at 2 meters.
- **`temperature_2m`** ($^\circ\text{C}$): Air temperature at 2 meters.
- **`dew_point_2m`** ($^\circ\text{C}$): Dew point temperature at 2 meters.

---

## 4. Sample JSON Response
```json
{
  "latitude": 37.75,
  "longitude": -122.4,
  "generationtime_ms": 0.42,
  "utc_offset_seconds": -25200,
  "timezone": "America/Los_Angeles",
  "timezone_abbreviation": "PDT",
  "elevation": 86.0,
  "hourly_units": {
    "time": "iso8601",
    "cloudcover": "%",
    "visibility": "m",
    "windspeed_10m": "km/h"
  },
  "hourly": {
    "time": ["2026-08-27T00:00", "2026-08-27T01:00"],
    "cloudcover": [12, 8],
    "visibility": [24140, 24140],
    "windspeed_10m": [11.2, 9.4]
  }
}
```
