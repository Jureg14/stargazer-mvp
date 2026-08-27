import { BortleClass, BortleInfo } from '../types/astro';

export const BORTLE_CLASSES: Record<BortleClass, BortleInfo> = {
  1: {
    classNumber: 1,
    title: 'Class 1: Pristine Dark Sky',
    nelm: 7.8,
    description: 'Milky Way casts shadows; Zodiacal light bright; faint galaxies direct vision.',
    penaltyScore: 0,
  },
  2: {
    classNumber: 2,
    title: 'Class 2: Truly Dark Site',
    nelm: 7.3,
    description: 'Milky Way highly structured; M31 easily visible to naked eye.',
    penaltyScore: -2,
  },
  3: {
    classNumber: 3,
    title: 'Class 3: Rural Sky',
    nelm: 6.8,
    description: 'Milky Way still complex; slight light domes on horizon.',
    penaltyScore: -5,
  },
  4: {
    classNumber: 4,
    title: 'Class 4: Rural / Suburban Transition',
    nelm: 6.3,
    description: 'Milky Way visible above horizon; moderate light domes.',
    penaltyScore: -10,
  },
  5: {
    classNumber: 5,
    title: 'Class 5: Suburban Sky',
    nelm: 5.8,
    description: 'Milky Way washed out near horizon; M31 faint smudge.',
    penaltyScore: -18,
  },
  6: {
    classNumber: 6,
    title: 'Class 6: Bright Suburban Sky',
    nelm: 5.3,
    description: 'Milky Way only detectable near zenith; sky has grayish cast.',
    penaltyScore: -28,
  },
  7: {
    classNumber: 7,
    title: 'Class 7: Suburban / Urban Transition',
    nelm: 4.8,
    description: 'Strong sky glow; only bright constellations & planets easily visible.',
    penaltyScore: -38,
  },
  8: {
    classNumber: 8,
    title: 'Class 8: City Sky',
    nelm: 4.3,
    description: 'Sky glows brightly; stars forming constellation outlines faint.',
    penaltyScore: -48,
  },
  9: {
    classNumber: 9,
    title: 'Class 9: Inner-City Sky',
    nelm: 4.0,
    description: 'Entire sky brightly lit; only Moon, planets, and brightest stars visible.',
    penaltyScore: -55,
  },
};

export function getBortleInfo(bortle: BortleClass | number = 4): BortleInfo {
  const normalized = Math.max(1, Math.min(9, Math.round(bortle))) as BortleClass;
  return BORTLE_CLASSES[normalized] ?? BORTLE_CLASSES[4];
}
