import {
  Body,
  Constellation,
  DefineStar,
  Equator,
  Horizon,
  Illumination,
  Observer,
  SearchHourAngle,
  SearchRiseSet,
} from 'astronomy-engine';
import {
  BortleClass,
  CelestialBodyType,
  CulminationWindow,
  DSOSubtype,
  OpticsRequirement,
  SearchableCelestialTarget,
  TargetCatalog,
} from '../types/astro';
import { MESSIER_CATALOG } from './data/messier';
import { CALDWELL_CATALOG } from './data/caldwell';

function getAzimuthCompass(deg: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(((deg % 360) + 360) % 360 / 22.5) % 16;
  return directions[index];
}

interface StaticCelestialDef {
  id: string;
  name: string;
  type: CelestialBodyType;
  catalog?: TargetCatalog;
  dsoType?: DSOSubtype;
  catalogNumber?: number;
  ngc?: string;
  opticsRequirement?: OpticsRequirement;
  raHours: number;
  decDeg: number;
  distLy?: number;
  magnitude: number;
  constellation: string;
  description: string;
  notes?: string;
  minBortleClass?: BortleClass;
}

// 1. Prominent Navigational and Iconic Stars
const STARS_CATALOG: StaticCelestialDef[] = [
  {
    id: 'star-sirius',
    name: 'Sirius (Dog Star)',
    type: 'star',
    raHours: 6.752,
    decDeg: -16.716,
    magnitude: -1.46,
    constellation: 'Canis Major',
    description: 'Brightest star in Earth’s night sky; dazzling white-blue binary star system.',
    notes: 'Visible globally except above 73°N.',
  },
  {
    id: 'star-canopus',
    name: 'Canopus',
    type: 'star',
    raHours: 6.399,
    decDeg: -52.696,
    magnitude: -0.74,
    constellation: 'Carina',
    description: '2nd brightest star; primary navigational anchor for spacecraft in Southern Hemisphere.',
    notes: 'Circumpolar in Southern latitudes; invisible in North above 37°N.',
  },
  {
    id: 'star-alpha-centauri',
    name: 'Alpha Centauri (Rigil Kentaurus)',
    type: 'star',
    raHours: 14.660,
    decDeg: -60.833,
    magnitude: -0.27,
    constellation: 'Centaurus',
    description: 'Closest star system to our Solar System at 4.37 light-years.',
    notes: 'Pointer to the Southern Cross.',
  },
  {
    id: 'star-arcturus',
    name: 'Arcturus',
    type: 'star',
    raHours: 14.261,
    decDeg: 19.182,
    magnitude: -0.05,
    constellation: 'Boötes',
    description: 'Distinctive orange-red giant star; 4th brightest star in the night sky.',
    notes: 'Follow the arc of Ursa Major handle to Arcturus.',
  },
  {
    id: 'star-vega',
    name: 'Vega',
    type: 'star',
    raHours: 18.616,
    decDeg: 38.784,
    magnitude: 0.03,
    constellation: 'Lyra',
    description: 'Luminous blue-white star; key vertex of the Northern Summer Triangle.',
    notes: 'Historical zero-baseline for the astronomical magnitude scale.',
  },
  {
    id: 'star-capella',
    name: 'Capella',
    type: 'star',
    raHours: 5.278,
    decDeg: 45.998,
    magnitude: 0.08,
    constellation: 'Auriga',
    description: 'Golden-yellow quadruple star system; prominent Northern winter beacon.',
    notes: 'Sixth brightest star in the sky.',
  },
  {
    id: 'star-rigel',
    name: 'Rigel',
    type: 'star',
    raHours: 5.242,
    decDeg: -8.202,
    magnitude: 0.13,
    constellation: 'Orion',
    description: 'Brilliant blue supergiant star marking the left foot of Orion the Hunter.',
    notes: 'Estimated 40,000 times more luminous than the Sun.',
  },
  {
    id: 'star-procyon',
    name: 'Procyon',
    type: 'star',
    raHours: 7.655,
    decDeg: 5.225,
    magnitude: 0.34,
    constellation: 'Canis Minor',
    description: 'Bright white star forming the Winter Triangle with Sirius and Betelgeuse.',
    notes: '11.46 light-years from Earth.',
  },
  {
    id: 'star-betelgeuse',
    name: 'Betelgeuse',
    type: 'star',
    raHours: 5.919,
    decDeg: 7.407,
    magnitude: 0.50,
    constellation: 'Orion',
    description: 'Colossal red supergiant candidate supernova marking Orion’s right shoulder.',
    notes: 'Noticeable reddish-amber color contrast against Rigel.',
  },
  {
    id: 'star-achernar',
    name: 'Achernar',
    type: 'star',
    raHours: 1.629,
    decDeg: -57.237,
    magnitude: 0.46,
    constellation: 'Eridanus',
    description: 'Bluest, hottest star in the night sky; rapid rotator forming an oblate ellipsoid.',
    notes: 'Southern hemisphere marker.',
  },
  {
    id: 'star-hadar',
    name: 'Hadar (Beta Centauri)',
    type: 'star',
    raHours: 14.064,
    decDeg: -60.373,
    magnitude: 0.61,
    constellation: 'Centaurus',
    description: 'Blue-white giant star; second pointer star aligning to Crux.',
    notes: '390 light-years distant.',
  },
  {
    id: 'star-altair',
    name: 'Altair',
    type: 'star',
    raHours: 19.846,
    decDeg: 8.868,
    magnitude: 0.77,
    constellation: 'Aquila',
    description: 'Rapidly spinning bright star forming the southern vertex of the Summer Triangle.',
    notes: 'Only 16.7 light-years away.',
  },
  {
    id: 'star-acrux',
    name: 'Acrux (Alpha Crucis)',
    type: 'star',
    raHours: 12.443,
    decDeg: -63.099,
    magnitude: 0.77,
    constellation: 'Crux',
    description: 'Southernmost bright star of the Southern Cross constellation.',
    notes: 'Essential navigational pointer for true South.',
  },
  {
    id: 'star-aldebaran',
    name: 'Aldebaran',
    type: 'star',
    raHours: 4.599,
    decDeg: 16.509,
    magnitude: 0.85,
    constellation: 'Taurus',
    description: 'Fiery orange giant star depicting the fierce eye of the Bull.',
    notes: 'Appears in front of the Hyades cluster along the ecliptic.',
  },
  {
    id: 'star-antares',
    name: 'Antares',
    type: 'star',
    raHours: 16.490,
    decDeg: -26.432,
    magnitude: 1.06,
    constellation: 'Scorpius',
    description: 'Ruby-red supergiant known as the "Heart of the Scorpion" and rival of Mars.',
    notes: 'Magnificent deep red color naked-eye.',
  },
  {
    id: 'star-spica',
    name: 'Spica',
    type: 'star',
    raHours: 13.420,
    decDeg: -11.161,
    magnitude: 0.97,
    constellation: 'Virgo',
    description: 'Dazzling sapphire binary star held in the hand of the Maiden.',
    notes: 'Follow the spike to Spica from Arcturus.',
  },
  {
    id: 'star-pollux',
    name: 'Pollux',
    type: 'star',
    raHours: 7.755,
    decDeg: 28.026,
    magnitude: 1.14,
    constellation: 'Gemini',
    description: 'Brightest orange giant star in the constellation Gemini.',
    notes: 'Forms iconic stellar twin pair with Castor.',
  },
  {
    id: 'star-fomalhaut',
    name: 'Fomalhaut',
    type: 'star',
    raHours: 22.961,
    decDeg: -29.622,
    magnitude: 1.17,
    constellation: 'Piscis Austrinus',
    description: 'Solitary bright beacon in the southern autumn sky surrounded by an exoplanetary dust ring.',
    notes: 'Known as the Lonely Star of Autumn.',
  },
  {
    id: 'star-deneb',
    name: 'Deneb',
    type: 'star',
    raHours: 20.696,
    decDeg: 45.280,
    magnitude: 1.25,
    constellation: 'Cygnus',
    description: 'White supergiant tail of the Swan; one of the most distant naked-eye stars (~2,600 ly).',
    notes: 'Top vertex of the Northern Summer Triangle.',
  },
  {
    id: 'star-regulus',
    name: 'Regulus',
    type: 'star',
    raHours: 10.140,
    decDeg: 11.967,
    magnitude: 1.36,
    constellation: 'Leo',
    description: 'The "Little King" star sitting at the base of the sickle of Leo.',
    notes: 'Very close to the ecliptic; frequently occulted by the Moon.',
  },
  {
    id: 'star-polaris',
    name: 'Polaris (North Star)',
    type: 'star',
    raHours: 2.530,
    decDeg: 89.264,
    magnitude: 1.98,
    constellation: 'Ursa Minor',
    description: 'The celestial North pole anchor around which the Northern heavens rotate.',
    notes: 'Altitude directly equals observer’s Northern latitude.',
  },
];

// 2. Prominent Constellations
const CONSTELLATIONS_CATALOG: StaticCelestialDef[] = [
  {
    id: 'const-crux',
    name: 'Crux (Southern Cross)',
    type: 'constellation',
    raHours: 12.45,
    decDeg: -60.2,
    magnitude: 0.77,
    constellation: 'Crux',
    description: 'Iconic compact diamond cross of the Southern Hemisphere.',
    notes: 'Points toward the South Celestial Pole; contains the famous Coalsack dark nebula.',
  },
  {
    id: 'const-orion',
    name: 'Orion (The Hunter)',
    type: 'constellation',
    raHours: 5.58,
    decDeg: 0.0,
    magnitude: 0.13,
    constellation: 'Orion',
    description: 'World’s most recognizable equatorial constellation with Belt of 3 stars and Orion Nebula.',
    notes: 'Visible globally from late autumn to early spring.',
  },
  {
    id: 'const-scorpius',
    name: 'Scorpius (The Scorpion)',
    type: 'constellation',
    raHours: 16.90,
    decDeg: -30.0,
    magnitude: 1.06,
    constellation: 'Scorpius',
    description: 'Graceful curving tail and stinger immersed in the dense Milky Way stellar clouds.',
    notes: 'Anchored by the fiery red heart star Antares.',
  },
  {
    id: 'const-ursa-major',
    name: 'Ursa Major (Big Dipper)',
    type: 'constellation',
    raHours: 11.30,
    decDeg: 55.0,
    magnitude: 1.76,
    constellation: 'Ursa Major',
    description: 'Famous ladle asterism pointing directly to the North Pole star Polaris.',
    notes: 'Circumpolar in mid-to-high Northern latitudes.',
  },
  {
    id: 'const-cassiopeia',
    name: 'Cassiopeia (The Queen)',
    type: 'constellation',
    raHours: 1.00,
    decDeg: 60.0,
    magnitude: 2.24,
    constellation: 'Cassiopeia',
    description: 'Distinctive "W" or "M" shape across the Northern Milky Way.',
    notes: 'Opposite the Big Dipper across Polaris.',
  },
  {
    id: 'const-sagittarius',
    name: 'Sagittarius (The Teapot)',
    type: 'constellation',
    raHours: 19.00,
    decDeg: -25.0,
    magnitude: 1.85,
    constellation: 'Sagittarius',
    description: 'Teapot asterism pointing straight into the core of the Milky Way galaxy.',
    notes: 'Rich in bright nebulae, star clusters, and cosmic dust lanes.',
  },
  {
    id: 'const-taurus',
    name: 'Taurus (The Bull)',
    type: 'constellation',
    raHours: 4.60,
    decDeg: 16.5,
    magnitude: 0.85,
    constellation: 'Taurus',
    description: 'V-shaped head of the Bull with Aldebaran and the famous Pleiades cluster.',
    notes: 'Crossed by the ecliptic line.',
  },
  {
    id: 'const-cygnus',
    name: 'Cygnus (Northern Cross)',
    type: 'constellation',
    raHours: 20.60,
    decDeg: 42.0,
    magnitude: 1.25,
    constellation: 'Cygnus',
    description: 'Majestic celestial swan flying southward along the plane of the Milky Way.',
    notes: 'Contains the Great Rift and the Veil Nebula complex.',
  },
  {
    id: 'const-centaurus',
    name: 'Centaurus',
    type: 'constellation',
    raHours: 13.50,
    decDeg: -50.0,
    magnitude: -0.27,
    constellation: 'Centaurus',
    description: 'Vast southern constellation framing the Southern Cross and holding Omega Centauri.',
    notes: 'Hosts Alpha and Beta Centauri.',
  },
  {
    id: 'const-carina',
    name: 'Carina (The Keel)',
    type: 'constellation',
    raHours: 9.00,
    decDeg: -60.0,
    magnitude: -0.74,
    constellation: 'Carina',
    description: 'Spectacular Southern Milky Way segment containing Canopus and the Great Carina Nebula.',
    notes: 'One of the richest deep-sky regions in the sky.',
  },
  {
    id: 'const-leo',
    name: 'Leo (The Lion)',
    type: 'constellation',
    raHours: 10.70,
    decDeg: 15.0,
    magnitude: 1.36,
    constellation: 'Leo',
    description: 'Prominent spring zodiac constellation resembling a crouching lion.',
    notes: 'Contains the famous Leo Triplet galaxies.',
  },
  {
    id: 'const-gemini',
    name: 'Gemini (The Twins)',
    type: 'constellation',
    raHours: 7.30,
    decDeg: 22.0,
    magnitude: 1.14,
    constellation: 'Gemini',
    description: 'Zodiac constellation crowned by bright twin stars Castor and Pollux.',
    notes: 'Radiant of the prolific Geminid meteor shower in December.',
  },
];

// 3. Special Celestial Showpieces (Galactic Center, etc.)
const SPECIAL_DSO_CATALOG: StaticCelestialDef[] = [
  {
    id: 'dso-milkyway-core',
    name: 'Milky Way Galactic Core',
    type: 'dso',
    catalog: 'solar',
    dsoType: 'diffuse_nebula',
    opticsRequirement: 'naked_eye',
    raHours: 17.761,
    decDeg: -29.008,
    magnitude: -1.0,
    constellation: 'Sagittarius',
    minBortleClass: 4,
    description: 'The supermassive galactic center and dense stellar clouds of our home galaxy.',
    notes: 'Requires zero moonlight and Bortle ≤ 4 skies for full majesty.',
  },
];

interface PlanetDef {
  id: string;
  name: string;
  body: Body;
  description: string;
  notes?: string;
}

const PLANETS_CONFIG: PlanetDef[] = [
  {
    id: 'planet-mercury',
    name: 'Mercury',
    body: Body.Mercury,
    description: 'Innermost swift planet; hugs the horizon in morning or evening twilight.',
    notes: 'Rarely seen against dark skies due to proximity to the Sun.',
  },
  {
    id: 'planet-venus',
    name: 'Venus',
    body: Body.Venus,
    description: 'Blindingly bright Morning or Evening Star; shrouded in reflective sulfuric clouds.',
    notes: 'Brightest natural celestial object after the Moon; can be spotted in broad daylight.',
  },
  {
    id: 'planet-mars',
    name: 'Mars (The Red Planet)',
    body: Body.Mars,
    description: 'Rust-red rocky planet exhibiting polar ice caps and surface dark markings in telescopes.',
    notes: 'Striking reddish-orange tint to the naked eye.',
  },
  {
    id: 'planet-jupiter',
    name: 'Jupiter',
    body: Body.Jupiter,
    description: 'Colossal Gas Giant; 4 Galilean moons (Io, Europa, Ganymede, Callisto) visible in binoculars.',
    notes: 'Cloud bands and Great Red Spot visible in small telescopes.',
  },
  {
    id: 'planet-saturn',
    name: 'Saturn (Ringed Wonder)',
    body: Body.Saturn,
    description: 'Spectacular icy ring system and golden atmospheric globe.',
    notes: 'Rings and giant moon Titan easily visible in small telescope.',
  },
  {
    id: 'planet-uranus',
    name: 'Uranus',
    body: Body.Uranus,
    description: 'Ice Giant planet showing a tiny pale cyan disk in telescopes.',
    notes: 'Magnitude ~5.7; faint naked-eye at dark sky sites, easy binocular target.',
  },
  {
    id: 'planet-neptune',
    name: 'Neptune',
    body: Body.Neptune,
    description: 'Deep cobalt-blue Ice Giant planet at the outer edge of the Solar System.',
    notes: 'Magnitude ~7.8; requires binoculars or telescope to observe.',
  },
  {
    id: 'planet-pluto',
    name: 'Pluto (Dwarf Planet)',
    body: Body.Pluto,
    description: 'Dwarf planet at the outer frozen rim of the solar system in the Kuiper Belt.',
    notes: 'Extreme visual observing challenge (magnitude ~+14.5). Requires 8"+ (200mm+) telescope and dark Bortle ≤ 3 skies.',
  },
];

function getDayLabel(peakDate: Date, queryDate: Date): string {
  const peakTimeHours = peakDate.getHours();
  const diffDays = Math.round((new Date(peakDate.getFullYear(), peakDate.getMonth(), peakDate.getDate()).getTime() -
    new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate()).getTime()) / 86400000);

  if (diffDays === 0) {
    if (peakTimeHours < 12) return 'Today Morning';
    if (peakTimeHours < 18) return 'Today Afternoon';
    return 'Tonight';
  } else if (diffDays === 1) {
    if (peakTimeHours < 6) return 'Tonight (Past Midnight)';
    if (peakTimeHours < 12) return 'Tomorrow Morning';
    if (peakTimeHours < 18) return 'Tomorrow Afternoon';
    return 'Tomorrow Night';
  } else if (diffDays < 0) {
    return 'Earlier Today';
  } else {
    return 'Next Day';
  }
}

/**
 * Calculates complete culmination and visibility window metrics for a body or star slot.
 */
function computeCulminationWindow(
  body: Body,
  searchStartDate: Date,
  observer: Observer,
  isFixedTarget: boolean,
  magnitude: number
): CulminationWindow | null {
  try {
    // 1. Find the next meridian transit (Hour Angle = 0, highest point in sky)
    const transitEvent = SearchHourAngle(body, observer, 0.0, searchStartDate, 1.5);
    if (!transitEvent) return null;

    const peakDate = transitEvent.time.date;
    const peakAltitudeDeg = Math.round(transitEvent.hor.altitude * 10) / 10;
    const peakAzimuthDeg = Math.round(transitEvent.hor.azimuth * 10) / 10;
    const azimuthDirection = getAzimuthCompass(peakAzimuthDeg);

    // 2. Check Sun altitude at peak date
    const sunEq = Equator(Body.Sun, peakDate, observer, true, true);
    const sunHor = Horizon(peakDate, observer, sunEq.ra, sunEq.dec, 'normal');
    const sunAltAtPeak = Math.round(sunHor.altitude * 10) / 10;

    let daytimeCategory: 'night' | 'twilight' | 'daytime' = 'night';
    if (sunAltAtPeak >= -0.833) {
      daytimeCategory = 'daytime';
    } else if (sunAltAtPeak >= -12) {
      daytimeCategory = 'twilight';
    }

    // 3. Determine if naked-eye visible in broad daylight
    let isDaytimeVisible = false;
    if (body === Body.Moon) {
      isDaytimeVisible = true;
    } else if (body === Body.Venus && magnitude <= -4.0 && peakAltitudeDeg >= 20) {
      isDaytimeVisible = true;
    }

    // 4. Find Rise & Set times around culmination
    // Search 12 hours before culmination for rise, and 12 hours after for set
    const searchBefore = new Date(peakDate.getTime() - 14 * 3600 * 1000);
    const riseResult = SearchRiseSet(body, observer, 1, searchBefore, 1.2);
    const setResult = SearchRiseSet(body, observer, -1, peakDate, 1.2);

    const riseTime = riseResult?.date ? riseResult.date.toISOString() : null;
    const setTime = setResult?.date ? setResult.date.toISOString() : null;
    const dayLabel = getDayLabel(peakDate, searchStartDate);

    return {
      riseTime,
      peakTime: peakDate.toISOString(),
      setTime,
      peakAltitudeDeg,
      peakAzimuthDeg,
      sunAltAtPeak,
      daytimeCategory,
      isDaytimeVisible,
      azimuthDirection,
      dayLabel,
    };
  } catch (err) {
    console.error('Error calculating culmination for body:', body, err);
    return null;
  }
}

/**
 * Calculates complete searchable catalog of planets, Moon, stars, constellations, and DSOs
 * with exact culmination times (highest point in sky), rise/set windows, and daytime differentiation.
 */
export function calculateSearchCatalog(
  queryDate: Date,
  observer: Observer
): SearchableCelestialTarget[] {
  const results: SearchableCelestialTarget[] = [];
  // Start searching from noon of the query date to encompass full observing night
  const searchStart = new Date(queryDate);
  searchStart.setUTCHours(12, 0, 0, 0);

  // 1. Calculate Planets (including Pluto)
  for (const planet of PLANETS_CONFIG) {
    const illum = Illumination(planet.body, queryDate);
    const mag = Math.round(illum.mag * 10) / 10;
    const eq = Equator(planet.body, queryDate, observer, true, true);
    const hor = Horizon(queryDate, observer, eq.ra, eq.dec, 'normal');
    const constInfo = Constellation(eq.ra, eq.dec);

    const window = computeCulminationWindow(planet.body, searchStart, observer, false, mag);
    if (!window) continue;

    results.push({
      id: planet.id,
      name: planet.name,
      type: 'planet',
      catalog: 'solar',
      opticsRequirement: planet.id === 'planet-pluto' ? 'large_telescope' : planet.id === 'planet-neptune' || planet.id === 'planet-uranus' ? 'binoculars' : 'naked_eye',
      magnitude: mag,
      constellation: constInfo.name,
      description: planet.description,
      notes: planet.notes,
      window,
      currentAltitude: Math.round(hor.altitude * 10) / 10,
      currentAzimuth: Math.round(hor.azimuth * 10) / 10,
      isAboveHorizon: hor.altitude > 0,
    });
  }

  // 2. Calculate Moon
  {
    const illum = Illumination(Body.Moon, queryDate);
    const mag = Math.round(illum.mag * 10) / 10;
    const eq = Equator(Body.Moon, queryDate, observer, true, true);
    const hor = Horizon(queryDate, observer, eq.ra, eq.dec, 'normal');
    const constInfo = Constellation(eq.ra, eq.dec);

    const window = computeCulminationWindow(Body.Moon, searchStart, observer, false, mag);
    if (window) {
      const illumPct = Math.round(illum.phase_fraction * 100);
      results.push({
        id: 'moon',
        name: `Moon (${illumPct}% Illum)`,
        type: 'moon',
        catalog: 'solar',
        opticsRequirement: 'naked_eye',
        magnitude: mag,
        constellation: constInfo.name,
        description: `Lunar disc illuminated ${illumPct}%. Prominent craters and maria visible.`,
        notes: illumPct > 50 ? 'Significant skyglow washes out faint nebulae.' : 'Gentle moonlight.',
        window,
        currentAltitude: Math.round(hor.altitude * 10) / 10,
        currentAzimuth: Math.round(hor.azimuth * 10) / 10,
        isAboveHorizon: hor.altitude > 0,
      });
    }
  }

  // 3. Calculate Static Targets (Stars, Constellations, Special DSOs, Full Messier & Caldwell Catalogs)
  const allStaticTargets: StaticCelestialDef[] = [
    ...STARS_CATALOG.map((s) => ({ ...s, catalog: 'star' as const, opticsRequirement: 'naked_eye' as const })),
    ...CONSTELLATIONS_CATALOG.map((c) => ({ ...c, catalog: 'constellation' as const, opticsRequirement: 'naked_eye' as const })),
    ...SPECIAL_DSO_CATALOG,
    ...MESSIER_CATALOG,
    ...CALDWELL_CATALOG,
  ];

  for (let i = 0; i < allStaticTargets.length; i++) {
    const target = allStaticTargets[i];

    // Latitude pre-filtering optimization:
    // Max theoretical altitude at culmination is 90 - |observerLat - decDeg|.
    // If max theoretical altitude <= 0 deg, the object never rises above the horizon for this observer!
    const maxAlt = 90 - Math.abs(observer.latitude - target.decDeg);
    if (maxAlt <= 0) {
      continue;
    }

    // Define temporary star slot (Star1)
    DefineStar(Body.Star1, target.raHours, target.decDeg, target.distLy ?? 1000);

    const eq = Equator(Body.Star1, queryDate, observer, true, true);
    const hor = Horizon(queryDate, observer, eq.ra, eq.dec, 'normal');

    const window = computeCulminationWindow(Body.Star1, searchStart, observer, true, target.magnitude);
    if (!window) continue;

    results.push({
      id: target.id,
      name: target.name,
      type: target.type,
      catalog: target.catalog,
      dsoType: target.dsoType,
      catalogNumber: target.catalogNumber,
      ngc: target.ngc,
      opticsRequirement: target.opticsRequirement,
      magnitude: target.magnitude,
      constellation: target.constellation,
      description: target.description,
      notes: target.notes,
      window,
      currentAltitude: Math.round(hor.altitude * 10) / 10,
      currentAzimuth: Math.round(hor.azimuth * 10) / 10,
      isAboveHorizon: hor.altitude > 0,
      minBortleClass: target.minBortleClass,
    });
  }

  // Sort default: Chronological by culmination peak time
  results.sort((a, b) => new Date(a.window.peakTime).getTime() - new Date(b.window.peakTime).getTime());

  return results;
}
