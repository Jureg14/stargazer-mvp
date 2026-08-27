import { Observer } from 'astronomy-engine';
import { calculateMoonInfo } from './astro/moon';
import { calculatePlanets } from './astro/planets';
import { calculateTargets } from './astro/targets';
import { calculateTwilight } from './astro/twilight';
import { clusterObservationWindows } from './itinerary/cluster';
import { generateNightSummary } from './itinerary/formatter';
import { evaluateHourlyQuality, EvaluatedHour } from './scoring/scoreEngine';
import { StargazeItineraryResponse } from './types/itinerary';
import { fetchWeatherForecast } from './weather/openMeteo';

export * from './types/astro';
export * from './types/weather';
export * from './types/itinerary';

/**
 * Master itinerary orchestrator for a given observer coordinates and date.
 */
export async function generateStargazingPlan(
  lat: number,
  lon: number,
  dateStr: string, // YYYY-MM-DD
  locationName?: string
): Promise<StargazeItineraryResponse> {
  const queryDate = new Date(`${dateStr}T12:00:00Z`);

  // 1. Fetch Open-Meteo weather forecast for target night (today through next morning)
  // End date is next day to cover the full astronomical night until dawn
  const nextDay = new Date(queryDate.getTime() + 24 * 3600 * 1000);
  const nextDateStr = nextDay.toISOString().split('T')[0];

  const weatherData = await fetchWeatherForecast(lat, lon, dateStr, nextDateStr);
  const observer = new Observer(lat, lon, weatherData.elevationMeters);

  // 2. Compute astronomical positions & twilight bounds
  const twilight = calculateTwilight(queryDate, observer);
  const moon = calculateMoonInfo(queryDate, observer);
  const planets = calculatePlanets(queryDate, observer);
  const dsoTargets = calculateTargets(queryDate, observer);

  // Combine all targets for list presentation
  const allTargets = [...planets, ...dsoTargets].sort((a, b) => b.altitude - a.altitude);

  // 3. Evaluate each hour across the night (filter for hours between sunset/civil dusk and dawn)
  const evaluatedHours: EvaluatedHour[] = [];

  for (const record of weatherData.records) {
    const evaluated = evaluateHourlyQuality(
      record.time,
      record,
      observer,
      moon,
      planets,
      dsoTargets
    );
    evaluatedHours.push(evaluated);
  }

  // Filter night hours for clustering (from sunset ~18:00 to sunrise ~06:00)
  const nightHours = evaluatedHours.filter((h) => h.sunAlt <= 0);

  // 4. Cluster into observation windows
  const windows = clusterObservationWindows(
    nightHours.length > 0 ? nightHours : evaluatedHours,
    moon
  );
  const bestWindow = windows.length > 0 ? windows[0] : null;

  // 5. Calculate overall night score & summary
  const darkHours = nightHours.filter((h) => h.sunAlt <= -12);
  const nightScores = nightHours.map((h) => h.score);
  const avgNightScore = nightScores.length > 0
    ? Math.round(nightScores.reduce((a, b) => a + b, 0) / nightScores.length)
    : 0;

  const nightSummary = generateNightSummary(avgNightScore, bestWindow, darkHours.length);

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
    twilight,
    moon,
    bestWindow,
    windows,
    targets: allTargets,
    hourlyTimeline: evaluatedHours.map((h) => h.breakdown),
  };
}
