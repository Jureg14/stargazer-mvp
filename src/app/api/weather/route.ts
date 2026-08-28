import { NextResponse } from 'next/server';
import { fetchWeatherForecast } from '@/lib/weather/openMeteo';
import { cacheEngine } from '@/lib/cache/cacheEngine';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    if (!lat || !lon) {
      return NextResponse.json({ error: 'lat and lon are required parameters' }, { status: 400 });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json({ error: 'Invalid lat/lon values' }, { status: 400 });
    }

    const cacheKey = cacheEngine.generateKey('weather', latitude, longitude, date);
    const cached = cacheEngine.get(cacheKey);

    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'Cache-Control': 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400',
          'X-Cache': 'HIT',
        },
      });
    }

    const nextDate = new Date(new Date(date).getTime() + 24 * 3600 * 1000).toISOString().split('T')[0];
    const data = await fetchWeatherForecast(latitude, longitude, date, nextDate);

    cacheEngine.set(cacheKey, data, 3600_000);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400',
        'X-Cache': 'MISS',
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Weather fetch error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
