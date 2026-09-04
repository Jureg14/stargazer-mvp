import { NextResponse } from 'next/server';
import { generateStargazingPlan, BortleClass } from '@/lib/itinerary';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { lat, lon, date, locationName, bortleClass } = body;

    if (lat === undefined || lon === undefined || !date) {
      return NextResponse.json(
        { error: 'Missing required parameters: lat, lon, date' },
        { status: 400 }
      );
    }

    const latitude = typeof lat === 'string' ? parseFloat(lat) : lat;
    const longitude = typeof lon === 'string' ? parseFloat(lon) : lon;

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: 'Invalid coordinates provided' },
        { status: 400 }
      );
    }

    const bortle: BortleClass = bortleClass ? (Math.max(1, Math.min(9, Number(bortleClass))) as BortleClass) : 4;

    const plan = await generateStargazingPlan(latitude, longitude, date, locationName, bortle);
    return NextResponse.json(plan, {
      headers: {
        'Cache-Control': 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err: unknown) {
    console.error('Stargaze API handler error:', err);
    const message = err instanceof Error ? err.message : 'Internal calculation error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}