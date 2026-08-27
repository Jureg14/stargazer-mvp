# 🌌 Stargazer MVP

> **Intelligent Stargazing Itinerary Planner** — Automatically calculates visible celestial events, lunar glare, twilight phases, and real-time weather forecasts to generate actionable, human-friendly observing itineraries.

---

## 🚀 Quick Start: How to Start the Local Server

### 1. Install Dependencies
If you haven't installed dependencies yet:
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

> **Note for Windows PowerShell Users**: If PowerShell script execution is restricted on your machine, you can run:
> ```powershell
> npm.cmd run dev
> # or via cmd:
> cmd.exe /c "npm run dev"
> ```

### 3. Open in Browser
Visit **[http://localhost:3000](http://localhost:3000)** in your web browser.

---

## 📖 How to Use Stargazer

### 📍 Step 1: Set Your Observing Location
- **Automatic GPS**: Click the **"My Location"** button (🎯) to automatically detect your coordinates using the browser's Geolocation API.
- **City Search**: Type any city name (e.g. *Tokyo*, *Reykjavik*, *London*, *São Paulo*) in the search bar and select it from the autocomplete dropdown.

### 📅 Step 2: Choose Your Target Night
- Use the **Target Night** date picker in the top right to check conditions for tonight or future dates.

### 📊 Step 3: Review Sky Quality & Lunar Status
- **Sky Quality Index (0–100)**: A composite rating combining darkness, cloud cover, lunar interference, and atmospheric seeing.
- **Lunar Card**: Displays live Moon illumination percentage, phase name (e.g. *Full Moon*, *Waxing Crescent*), apparent magnitude, and moonrise/moonset times.
- **Astronomical Darkness**: Shows exact start and end times for true astronomical night (Sun depression $\le -18^\circ$).

### ⏱️ Step 4: Explore Prime Observation Windows
- View clustered time blocks (e.g., `21:00 – 23:30`) with average cloud cover, seeing stability rating, and clear natural-language narratives:
  > *"Thursday 21:00–23:30 will have: 8% cloud cover, low moonlight, Saturn at 47° altitude, and excellent seeing conditions."*

### 📈 Step 5: Inspect the Night Sky Spectrum
- An interactive hourly bar chart from dusk to dawn showing quality score bars and cloud indicators. Click any bar to inspect specific conditions and visible targets for that exact hour.

### 🔭 Step 6: Track Celestial Targets
- Explore real-time cards for visible planets (**Venus**, **Mars**, **Jupiter**, **Saturn**), the **Milky Way Galactic Center**, and prominent Deep-Sky Objects (**Andromeda Galaxy M31**, **Orion Nebula M42**, **Pleiades M45**, **Hercules Cluster M13**) with altitude, azimuth compass direction, and visual magnitude.

---

## 📡 API Endpoints

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/stargaze` | `POST` | Accepts `{ lat, lon, date, locationName }` and returns the complete ephemeris, weather forecast, score timeline, and observation windows. |
| `/api/geocode?q={city}` | `GET` | Autocomplete proxy querying Open-Meteo Geocoding API for city coordinates. |

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with cosmic dark theme & glassmorphism
- **Ephemeris Engine**: [`astronomy-engine`](https://github.com/cosinekitty/astronomy) (J2000 coordinates, topocentric horizons, twilight milestones, lunar illumination)
- **Weather Forecast**: [Open-Meteo API](https://open-meteo.com/) (hourly multi-layer cloud cover, visibility, wind speed, relative humidity, dew point)
- **Date Handling**: [`date-fns`](https://date-fns.org/)

---

## 📜 Available Scripts

- `npm run dev`: Starts the Next.js development server on `http://localhost:3000`.
- `npm run build`: Compiles the optimized production bundle.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint checks across the codebase.
