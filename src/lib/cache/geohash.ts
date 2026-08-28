const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

/**
 * Encodes latitude and longitude into a Geohash string of given precision.
 * Default precision = 4 (~39 km x 19 km grid, optimal for astronomical weather/ephemeris caching).
 */
export function encodeGeohash(latitude: number, longitude: number, precision = 4): string {
  let isEven = true;
  let latMin = -90;
  let latMax = 90;
  let lonMin = -180;
  let lonMax = 180;
  let bit = 0;
  let ch = 0;
  let geohash = '';

  while (geohash.length < precision) {
    if (isEven) {
      const lonMid = (lonMin + lonMax) / 2;
      if (longitude >= lonMid) {
        ch |= 1 << (4 - bit);
        lonMin = lonMid;
      } else {
        lonMax = lonMid;
      }
    } else {
      const latMid = (latMin + latMax) / 2;
      if (latitude >= latMid) {
        ch |= 1 << (4 - bit);
        latMin = latMid;
      } else {
        latMax = latMid;
      }
    }

    isEven = !isEven;
    if (bit < 4) {
      bit++;
    } else {
      geohash += BASE32[ch];
      bit = 0;
      ch = 0;
    }
  }

  return geohash;
}

/**
 * Decodes a geohash string into latitude and longitude bounds/center.
 */
export function decodeGeohash(geohash: string): { latitude: number; longitude: number } {
  let isEven = true;
  let latMin = -90;
  let latMax = 90;
  let lonMin = -180;
  let lonMax = 180;

  for (let i = 0; i < geohash.length; i++) {
    const c = geohash[i];
    const cd = BASE32.indexOf(c);
    if (cd === -1) continue;

    for (let j = 4; j >= 0; j--) {
      const mask = 1 << j;
      if (isEven) {
        if (cd & mask) {
          lonMin = (lonMin + lonMax) / 2;
        } else {
          lonMax = (lonMin + lonMax) / 2;
        }
      } else {
        if (cd & mask) {
          latMin = (latMin + latMax) / 2;
        } else {
          latMax = (latMin + latMax) / 2;
        }
      }
      isEven = !isEven;
    }
  }

  return {
    latitude: (latMin + latMax) / 2,
    longitude: (lonMin + lonMax) / 2,
  };
}
