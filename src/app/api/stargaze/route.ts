import { calculateStargazeItinerary, HourlyWeatherData } from '@/lib/itinerary';

export async function POST(req: Request) {
  try {
    const { lat, lon, date } = await req.json();

    if (!lat || !lon || !date) {
      return Response.json(
        { error: 'Missing required parameters: lat, lon, date' },
        { status: 400 }
      );
    }

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=cloudcover,visibility,windspeed_10m&timezone=auto&start_date=${date}&end_date=${date}`;
    const weatherRes = await fetch(weatherUrl);

    if (!weatherRes.ok) {
      return Response.json(
        { error: `Weather service error: ${weatherRes.statusText}` },
        { status: weatherRes.status }
      );
    }

    const weather = await weatherRes.json();
    const hourlyData: HourlyWeatherData = {
      time: weather.hourly?.time ?? [],
      cloudcover: weather.hourly?.cloudcover ?? [],
      visibility: weather.hourly?.visibility ?? [],
      windspeed_10m: weather.hourly?.windspeed_10m ?? [],
    };

    const blocks = calculateStargazeItinerary(lat, lon, hourlyData);

    return Response.json(blocks);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return Response.json({ error: message }, { status: 500 });
  }
}