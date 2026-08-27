<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Stargazer MVP — Agent Guidelines & Project Architecture

Welcome to the **Stargazer** project. This document serves as the master guide and behavioral rulebook for AI agents operating in this workspace.

---

## 🌌 1. Project Vision & Core Mission

Stargazer is an intelligent stargazing itinerary planner. Based on the user's geolocation and weather forecast, it calculates visible celestial events and generates an actionable, human-friendly itinerary of what can be observed and when.

### Example Itinerary Outputs
* *"Saturn visible after 22:00 (alt 47°, mag +0.4)"*
* *"ISS pass at 19:42–19:48 (max alt 68°, mag -3.2, NW to SE)"*
* *"Orion Nebula (M42) excellent tonight between 21:30 and 01:00"*
* *"Perseids Meteor Shower peak tomorrow with 60–80 ZHR"*
* *"Thursday 21:00–23:30 will have: 8% cloud cover, low moonlight (14% waxing crescent below horizon), Saturn at 47° altitude, Milky Way core visible, excellent seeing conditions"*

---

## 🗺️ 2. Phased Development Roadmap

### 🚀 Phase 1: v1 MVP (Current Baseline)
- **Geolocation**: Browser Geolocation API + Manual Lat/Lon/City search.
- **Weather API**: Open-Meteo forecast (cloud cover, visibility, wind speed, relative humidity).
- **Ephemeris Engine**: `astronomy-engine` for Moon phase/illumination, Sun twilight thresholds, planetary positions (Venus, Mars, Jupiter, Saturn).
- **Heuristic Scoring**: Hourly observational quality scoring (0–100) combining darkness, clouds, seeing, and lunar glare.
- **Time Block Clustering**: Merging contiguous optimal hours into viewing windows with narrative highlights.
- **Clean UI**: Premium dark-mode interface with timeline blocks, sky conditions summary, and object highlights.

### 🛰️ Phase 2: v2 Feature Expansion
- **Satellite Tracking**: ISS & Tiangong visible passes calculated via `satellite.js` using NORAD two-line element sets (TLEs) from CelesTrak.
- **Meteor Shower Engine**: Annual meteor shower calendar, active radiant coordinates, peak calculation, and Zenithal Hourly Rate (ZHR) estimates.
- **Light Pollution & Bortle Scale**: User-selectable Bortle class (1–9) with light pollution penalty adjusting DSO (Deep Sky Object) visibility.
- **Deep Sky Object (DSO) Catalog**: Messier catalog integration (Andromeda M31, Orion Nebula M42, Pleiades M45, Hercules Cluster M13, Ring Nebula M57, Milky Way Galactic Center).
- **Interactive Sky Timeline**: Visual altitude-vs-time charts for celestial targets across the night.

### ⚡ Phase 3: v3 Pro & Performance
- **High-Resolution Seeing**: Integration with Meteoblue Astronomical Seeing API (seeing index, jet stream, cloud layers).
- **Edge Caching**: Caching weather & ephemeris calculations per `geohash(lat, lon, precision=4) + date` using Redis / Upstash / Vercel KV.
- **Precomputation at Edge**: Next.js Edge runtime and ISR for popular geographic areas.
- **Push Notifications & Reminders**: Web Push alerts for upcoming prime observation windows.
- **PWA & Offline Sync**: Service Worker with offline caching of pre-calculated ephemeris data.
- **Astronomical Accuracy Checks**: Automated tests cross-referencing calculations against reference ephemerides (Stellarium Web, NASA Horizons, timeanddate.com).

---

## 🏗️ 3. Architecture & Code Organization

```text
src/
├── app/                        # Next.js App Router
│   ├── api/
│   │   ├── stargaze/           # Main itinerary endpoint: POST /api/stargaze
│   │   ├── weather/            # Open-Meteo / Meteoblue proxy & cache
│   │   └── satellites/         # TLE fetch & ISS pass endpoint
│   ├── layout.tsx              # Root HTML layout with Geist font & metadata
│   ├── globals.css             # Tailwind v4 theme & custom utilities
│   └── page.tsx                # Main client page (timeline, controls, itinerary)
├── components/                 # Modular React Components
│   ├── TimelineBlock.tsx       # Contiguous observation window card
│   ├── CelestialCard.tsx       # Target detail card (altitude, magnitude, best time)
│   ├── WeatherBadge.tsx        # Cloud cover, transparency, wind metrics
│   ├── SkyConditions.tsx       # Overall sky quality score & lunar status
│   └── LocationSelector.tsx    # Geolocation button & manual coordinate/city search
└── lib/                        # Core Domain Logic & Modules
    ├── astro/                  # Pure Astronomy Engine calculations
    │   ├── coordinates.ts      # Alt/Az, RA/Dec, Horizon conversions
    │   ├── twilight.ts         # Civil, Nautical, Astronomical twilight
    │   ├── planets.ts          # Planetary positions, magnitudes, ring tilt
    │   ├── moon.ts             # Moon phase, illumination, altitude, rise/set
    │   ├── dso.ts              # Deep sky objects catalog & visibility
    │   ├── meteors.ts          # Meteor shower calendar & radiant checks
    │   └── satellites.ts       # ISS / satellite pass propagation (satellite.js)
    ├── weather/                # Weather Forecast Integrations
    │   ├── open-meteo.ts       # Open-Meteo hourly weather client
    │   └── meteoblue.ts        # Meteoblue seeing API adapter (v3)
    ├── scoring/                # Stargazing Quality Heuristics
    │   ├── scoreEngine.ts      # Hourly observation scoring algorithm (0-100)
    │   └── weights.ts          # Scoring factors & penalties
    ├── itinerary/              # Itinerary Generator & Clustering
    │   ├── cluster.ts          # Contiguous hour grouping algorithm
    │   └── formatter.ts        # Human-readable sentence & summary builder
    ├── cache/                  # Caching layer (Redis/Vercel KV/Memory)
    └── types/                  # Shared TypeScript types
        ├── astro.ts
        ├── weather.ts
        ├── itinerary.ts
        └── api.ts
```

---

## 🔭 4. Astronomical Domain Rules

When writing astronomical and scoring code, you MUST adhere to the following physical principles:

1. **Twilight Thresholds**:
   - **Civil Twilight**: Sun altitude between $0^\circ$ and $-6^\circ$ (Sky bright; only Venus, Jupiter, Moon visible).
   - **Nautical Twilight**: Sun altitude between $-6^\circ$ and $-12^\circ$ (Horizon visible; bright stars and major planets observable).
   - **Astronomical Twilight / True Night**: Sun altitude between $-12^\circ$ and $-18^\circ$ (Astronomical twilight) and $<-18^\circ$ (True Astronomical Darkness). True stargazing and faint DSOs require Sun altitude $<-12^\circ$, ideally $<-18^\circ$.
2. **Atmospheric Extinction & Horizon Limits**:
   - Celestial objects below $15^\circ$ altitude suffer heavy atmospheric extinction, turbulence, and terrain blockage.
   - Objects between $15^\circ$ and $30^\circ$ are acceptable.
   - Objects $>30^\circ$ are optimal; zenith ($>60^\circ$) provides the thinnest atmospheric layer.
3. **Moon Interference & Glare**:
   - If Moon altitude $>0^\circ$:
     - Illumination $>50\%$ (Gibbous / Full): High sky glow. Faint DSOs and Milky Way invisible; planets and the Moon itself remain observable.
     - Illumination $10\%-50\%$: Moderate sky glow.
     - Illumination $<10\%$ (Crescent / New) or Moon below horizon: Dark skies; excellent for Milky Way and nebulae.
4. **Cloud Cover Weighting**:
   - Cloud cover $<15\%$: Pristine conditions.
   - Cloud cover $15\%-35\%$: Good conditions (partly clear patches).
   - Cloud cover $>40\%$: Severe penalty.
   - Cloud cover $>70\%$: Stargazing window invalid (score $= 0$).
5. **Atmospheric Seeing & Transparency**:
   - High visibility ($>15\text{ km}$), low wind ($<15\text{ km/h}$), and low humidity / moderate dew point depression correlate with stable seeing.

---

## 💻 5. Coding & Technology Standards

1. **TypeScript Strictness**:
   - Never use `any`. Always define explicit types in `src/lib/types/`.
   - Ensure all `astronomy-engine` function calls use standard named exports (`Observer`, `Body`, `Equator`, `Horizon`, `SearchRiseSet`, `SearchAltitude`, `MoonPhase`, `Illumination`).
2. **Next.js App Router Rules**:
   - API route handlers reside in `src/app/api/.../route.ts` and use standard `Response.json(...)` or `NextResponse.json(...)`.
   - Client components must declare `'use client';` at the top.
   - Keep computation in modular helper functions in `src/lib/` rather than inlining complex math inside React components or route handlers.
3. **UI / Styling Guidelines**:
   - Dark mode first: Use rich dark palettes (`slate-950`, `zinc-900`, `indigo-950`, `violet-950`, `cyan-400`, `amber-400`).
   - Use clean typography, micro-interactions, responsive flex/grid layouts, and semantic HTML.
   - Ensure high contrast and clear visual hierarchy for time windows, seeing badges, and celestial cards.

---

## 🧪 6. Verification & Accuracy Protocols

- **Ephemeris Cross-Validation**:
  - Compare calculated rise/set/culmination times with [Stellarium Web](https://stellarium-web.org) and [TimeAndDate Astronomy](https://www.timeanddate.com/astronomy/).
  - Ensure coordinate conversions (Alt/Az) match for observer coordinates within $\pm 0.5^\circ$.
- **Unit & Integration Tests**:
  - Test twilight calculation accuracy for high-latitude locations (midnight sun / polar night edge cases).
  - Test time block clustering with discontinuous clear weather intervals.
  - Run `npm run lint` and `npx tsc --noEmit` before committing changes.
