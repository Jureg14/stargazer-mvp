# Architecture & Code Style Rules

These rules define the software engineering conventions, directory structure, TypeScript standards, and performance guidelines for Stargazer.

---

## 1. Directory Structure & Separation of Concerns

All application logic must follow strict modular separation:

```text
src/
├── app/                  # Next.js App Router (UI routes & API endpoints only)
│   ├── api/stargaze/     # Endpoint controllers: validate request, call lib services
│   ├── layout.tsx        # HTML shell & font providers
│   └── page.tsx          # Client-side presentation & state management
├── components/           # Reusable UI presentation components
│   ├── timeline/         # Itinerary & timeline visualization
│   ├── sky/              # Sky condition dials, moon phase icons, target cards
│   └── weather/          # Atmospheric condition badges & tooltips
└── lib/                  # Pure TypeScript domain & business logic
    ├── astro/            # Pure astronomy calculations (astronomy-engine wrappers)
    ├── weather/          # Weather API clients (Open-Meteo, Meteoblue)
    ├── scoring/          # Observational heuristics & weights
    ├── itinerary/        # Window clustering & natural language generators
    ├── cache/            # Key-Value caching adapters (KV/Redis/Memory)
    └── types/            # Strict TypeScript interfaces & enums
```

> **Rule**: Keep `src/app/api/...` route handlers thin. Never write astronomy trigonometry or weather parsing directly inside a Next.js route handler or React component.

---

## 2. TypeScript Guidelines

- **No `any`**: Strict mode is enabled. All payloads, astronomical objects, weather records, and API responses must have explicit interfaces.
- **Type Location**:
  - Global domain interfaces go in `src/lib/types/`.
  - Component-specific props can be declared locally in the component file.
- **Astronomy Imports**:
  - Use named imports directly from `astronomy-engine`:
    ```typescript
    import {
      Observer,
      Body,
      Equator,
      Horizon,
      SearchRiseSet,
      SearchAltitude,
      Direction,
      MoonPhase,
      Illumination,
    } from 'astronomy-engine';
    ```

---

## 3. Caching & Performance Architecture

1. **Geohash-Based Caching**:
   - Astronomical and weather forecasts do not change meaningfully over sub-kilometer shifts.
   - Truncate coordinates or encode to Geohash (precision = 4, $\approx 20\text{ km} \times 20\text{ km}$ area).
   - Cache key format: `stargaze:${geohash4}:${date}`.
2. **TTL Strategy**:
   - **Weather Forecasts**: TTL $= 1 - 2\text{ hours}$ (weather updates frequently).
   - **Astronomical Ephemerides**: TTL $= 24\text{ hours}$ to $7\text{ days}$ (deterministic celestial orbits).
3. **Stateless API Handlers**:
   - Route handlers must be idempotent and fast ($< 300\text{ ms}$).

---

## 4. UI / UX Principles

1. **Rich Aesthetics**: Dark space theme with deep slates, purples, cyans, and warm celestial highlights (amber/gold for Saturn, silver for Moon, cyan for ISS).
2. **Instant Feedback**: Provide skeleton loaders and calculation spinners during geolocation and API fetch.
3. **Clarity**: Show both high-level summaries (*"Best window: 21:00–23:30"*) and granular technical telemetry (*Altitude: 47°, Cloud: 8%, Seeing: Excellent*).
