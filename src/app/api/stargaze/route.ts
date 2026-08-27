import { NextResponse } from 'next/server';
import { generateStargazingPlan } from '@/lib/itinerary';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { lat, lon, date, locationName } = body;

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

    const plan = await generateStargazingPlan(latitude, longitude, date, locationName);
    return NextResponse.json(plan);
  } catch (err: unknown) {
    console.error('Stargaze API handler error:', err);
    const message = err instanceof Error ? err.message : 'Internal calculation error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}