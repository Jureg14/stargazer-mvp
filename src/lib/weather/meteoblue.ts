export interface MeteoblueSeeingResponse {
  seeing1: number[]; // arcseconds FWHM
  seeing2: number[]; // index 1-5
  badlayers: number[];
  jetstream: number[]; // m/s
}

/**
 * Calculates micro-meteorological astronomical seeing estimation
 * based on atmospheric boundary layer turbulence, dew depression, wind shear, and altitude.
 */
export function estimateSeeingFromMeteorology(
  windSpeedKmh: number,
  dewDepressionC: number,
  relativeHumidity: number,
  cloudCover: number,
  visibilityMeters: number
): { seeingIndex: number; seeingArcsec: number; jetStreamKmh: number; badLayers: number } {
  // Estimated base seeing arcsec (FWHM)
  let arcsec = 1.5; // Baseline good seeing

  // Wind turbulence penalty (boundary layer friction)
  if (windSpeedKmh > 30) {
    arcsec += 1.5;
  } else if (windSpeedKmh > 18) {
    arcsec += 0.7;
  } else if (windSpeedKmh < 8) {
    arcsec -= 0.3; // Low ground wind = steady air
  }

  // Dew point & humidity optical scatter penalty
  if (dewDepressionC < 1.5) {
    arcsec += 0.8;
  } else if (dewDepressionC > 5.0) {
    arcsec -= 0.2;
  }

  if (relativeHumidity > 85) {
    arcsec += 0.5;
  }

  // Low visibility penalty
  if (visibilityMeters < 10000) {
    arcsec += 1.0;
  }

  // Clamp estimated arcsec between 0.7" (pristine summit) and 4.5" (very bad turbulence)
  arcsec = Math.max(0.7, Math.min(4.5, Math.round(arcsec * 10) / 10));

  // Determine 1-5 Seeing Index (5 = Pristine, 1 = Very Poor)
  let seeingIndex = 3;
  if (arcsec <= 1.0) seeingIndex = 5;
  else if (arcsec <= 1.5) seeingIndex = 4;
  else if (arcsec <= 2.2) seeingIndex = 3;
  else if (arcsec <= 3.2) seeingIndex = 2;
  else seeingIndex = 1;

  // Estimate jet stream speed and turbulent bad layer count from wind speed heuristics
  const estimatedJetStreamKmh = Math.round(windSpeedKmh * 3.5 + 40);
  const badLayers = windSpeedKmh > 25 || relativeHumidity > 85 ? 3 : windSpeedKmh > 15 ? 2 : 1;

  return {
    seeingIndex,
    seeingArcsec: arcsec,
    jetStreamKmh: estimatedJetStreamKmh,
    badLayers,
  };
}

/**
 * Attempts to fetch high-resolution seeing data from Meteoblue API if key provided,
 * falling back to micro-meteorological seeing estimation.
 */
export async function fetchMeteoblueSeeing(
  lat: number,
  lon: number,
  apiKey?: string
): Promise<MeteoblueSeeingResponse | null> {
  if (!apiKey) return null;

  try {
    const url = `https://my.meteoblue.com/packages/seeing-1h?lat=${lat}&lon=${lon}&apikey=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 7200 } });
    if (!res.ok) return null;
    return (await res.json()) as MeteoblueSeeingResponse;
  } catch (err) {
    console.warn('Meteoblue API fetch failed, using fallback seeing model:', err);
    return null;
  }
}
