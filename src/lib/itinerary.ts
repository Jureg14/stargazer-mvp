import { Observer } from 'astronomy-engine';
import { getBortleInfo } from './astro/bortle';
import { calculateDSOVisibility } from './astro/dso';
import { calculateMeteorShowers } from './astro/meteors';
import { calculateMoonInfo } from './astro/moon';
import { calculatePlanets } from './astro/planets';
import { getStationPasses } from './astro/satellites';
import { calculateTwilight } from './astro/twilight';
import { calculateSearchCatalog } from './astro/celestialSearch';
import { clusterObservationWindows } from './itinerary/cluster';
import { generateNightSummary } from './itinerary/formatter';
import { evaluateHourlyQuality, EvaluatedHour } from './scoring/scoreEngine';
import { BortleClass } from './types/astro';
import { StargazeItineraryResponse } from './types/itinerary';
import { fetchWeatherForecast } from './weather/openMeteo';

export * from './types/astro';
export * from './types/weather';
export * from './types/itinerary';
export * from './astro/bortle';
export * from './astro/celestialSearch';

/**
 * Master itinerary orchestrator for a given observer coordinates, date, and Bortle class.
 */
export async function generateStargazingPlan(
  lat: number,
  lon: number,
  dateStr: string, // YYYY-MM-DD
  locationName?: string,
  userBortle: BortleClass = 4
): Promise<StargazeItineraryResponse> {
  const queryDate = new Date(`${dateStr}T12:00:00Z`);

  // 1. Fetch Open-Meteo weather forecast for target night (today through next morning)
  const nextDay = new Date(queryDate.getTime() + 24 * 3600 * 1000);
  const nextDateStr = nextDay.toISOString().split('T')[0];

  const weatherData = await fetchWeatherForecast(lat, lon, dateStr, nextDateStr);
  const observer = new Observer(lat, lon, weatherData.elevationMeters);

  // 2. Compute astronomical positions & twilight bounds
  const twilight = calculateTwilight(queryDate, observer);
  const moon = calculateMoonInfo(queryDate, observer);
  const planets = calculatePlanets(queryDate, observer);
  const dsoTargets = calculateDSOVisibility(queryDate, observer, userBortle);

  // 3. Compute satellite passes (ISS & Tiangong) and active meteor showers
  const satellites = await getStationPasses(lat, lon, weatherData.elevationMeters, queryDate);
  const meteorShowers = calculateMeteorShowers(queryDate, observer, moon);
  const searchCatalog = calculateSearchCatalog(queryDate, observer);

  // Combine targets for full catalog view
  const allTargets = [...planets, ...dsoTargets].sort((a, b) => b.altitude - a.altitude);

  // 4. Evaluate each hour across the night
  const evaluatedHours: EvaluatedHour[] = [];

  for (const record of weatherData.records) {
    const evaluated = evaluateHourlyQuality(
      record.time,
      record,
      observer,
      moon,
      planets,
      dsoTargets,
      userBortle
    );
    evaluatedHours.push(evaluated);
  }

  // Filter night hours for clustering (from sunset to sunrise)
  const nightHours = evaluatedHours.filter((h) => h.sunAlt <= 0);

  // 5. Cluster into observation windows
  const windows = clusterObservationWindows(
    nightHours.length > 0 ? nightHours : evaluatedHours,
    moon,
    satellites,
    meteorShowers
  );
  const bestWindow = windows.length > 0 ? windows[0] : null;

  // 6. Calculate overall night score & summary
  const darkHours = nightHours.filter((h) => h.sunAlt <= -12);
  const nightScores = nightHours.map((h) => h.score);
  const avgNightScore = nightScores.length > 0
    ? Math.round(nightScores.reduce((a, b) => a + b, 0) / nightScores.length)
    : 0;

  const peakShower = meteorShowers.find((m) => m.isPeakNight);
  const peakShowerName = peakShower ? `${peakShower.name} Meteor Shower (${peakShower.effectiveZhr} ZHR)` : undefined;

  const nightSummary = generateNightSummary(
    avgNightScore,
    bestWindow,
    darkHours.length,
    satellites.length,
    peakShowerName
  );

  const bortleInfo = getBortleInfo(userBortle);

  return {
    location: {
      lat,
      lon,
      name: locationName,
      timezone: weatherData.timezone,
      elevationMeters: weatherData.elevationMeters,
    },
    queryDate: dateStr,
    nightQualityScore: avgNightScore,
    nightSummary,
    bortle: bortleInfo,
    twilight,
    moon,
    bestWindow,
    windows,
    satellites,
    meteorShowers,
    targets: allTargets,
    searchCatalog,
    hourlyTimeline: evaluatedHours.map((h) => h.breakdown),
  };
}
