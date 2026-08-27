import { NextResponse } from 'next/server';
import { getStationPasses } from '@/lib/astro/satellites';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get('lat') ?? '');
  const lon = parseFloat(searchParams.get('lon') ?? '');
  const dateStr = searchParams.get('date');

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json({ error: 'Valid lat and lon query parameters required' }, { status: 400 });
  }

  const queryDate = dateStr ? new Date(`${dateStr}T12:00:00Z`) : new Date();

  try {
    const passes = await getStationPasses(lat, lon, 0, queryDate);
    return NextResponse.json({ passes });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to compute satellite passes';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
