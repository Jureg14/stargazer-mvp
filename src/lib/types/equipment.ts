export interface BarlowLens {
  id: string;
  multiplier: number; // e.g. 2, 2.5, 3
  label?: string; // e.g. "2× Barlow"
}

export interface Eyepiece {
  id: string;
  focalLengthMm: number; // e.g. 25, 10, 6 (or 0 for standalone Barlow)
  apparentFovDeg?: number; // e.g. 52 (Plössl), 68 (Wide), 82 (Ultra-wide)
  label?: string; // Optional custom name, e.g. "25mm Plössl"
  isBarlow?: boolean; // True if this item in the list is a Barlow lens
  barlowMultiplier?: number; // e.g. 2, 2.5, 3
}

export interface TelescopeProfile {
  enabled: boolean;
  name: string;
  apertureMm: number; // in mm, e.g. 150 (6")
  focalLengthMm: number; // in mm, e.g. 1200
  eyepieces: Eyepiece[];
  barlowLenses?: BarlowLens[];
  hasBarlow2x?: boolean;
}

export interface EyepieceCalculation {
  eyepiece: Eyepiece;
  magnification: number; // M = F_scope / f_eyepiece
  exitPupilMm: number; // EP = aperture / M
  trueFovDeg: number; // TFOV ≈ AFOV / M
  isRecommended: boolean;
  isOverMagnified?: boolean; // Exceeds 2 * apertureMm
  role: 'wide' | 'medium' | 'planetary';
  roleLabel: string;
  barlowMultiplier?: number; // e.g. 2 for 2× Barlow
  effectiveFocalLengthMm?: number; // e.g. 12.5 for 25mm + 2× Barlow
  displayName: string; // e.g. "25mm" or "10mm + 2× Barlow"
}

export interface TargetOpticsRecommendation {
  recommendedEyepiece: EyepieceCalculation;
  allCalculations: EyepieceCalculation[];
  summaryText: string; // e.g. "Use 25mm (48×) for wide-field"
  maxUsefulMagnification: number; // 2 * apertureMm
  focalRatio: number; // F_scope / aperture
}

export const DEFAULT_TELESCOPE_PROFILE: TelescopeProfile = {
  enabled: true,
  name: 'My Telescope',
  apertureMm: 150, // 6-inch telescope
  focalLengthMm: 1200, // f/8
  eyepieces: [
    { id: 'ep-25', focalLengthMm: 25, apparentFovDeg: 52, label: '25mm' },
    { id: 'ep-10', focalLengthMm: 10, apparentFovDeg: 52, label: '10mm' },
    { id: 'ep-6', focalLengthMm: 6, apparentFovDeg: 52, label: '6mm' },
  ],
  hasBarlow2x: false,
};

export interface TelescopePreset {
  id: string;
  name: string;
  apertureMm: number;
  focalLengthMm: number;
  description: string;
  defaultEyepieces: number[];
}

export const TELESCOPE_PRESETS: TelescopePreset[] = [
  {
    id: 'preset-70-refractor',
    name: '70mm Refractor (Starter / Travel)',
    apertureMm: 70,
    focalLengthMm: 700,
    description: 'f/10 refractor; crisp lunar, bright planets, and double stars',
    defaultEyepieces: [25, 10],
  },
  {
    id: 'preset-100-reflector',
    name: '100mm Tabletop Reflector',
    apertureMm: 100,
    focalLengthMm: 500,
    description: 'f/5 fast Newtonian; bright wide-field rich star fields',
    defaultEyepieces: [20, 10],
  },
  {
    id: 'preset-150-dob',
    name: '6" (150mm) Dobsonian / Reflector',
    apertureMm: 150,
    focalLengthMm: 1200,
    description: 'f/8 all-around classic; deep sky showpieces and high-power planets',
    defaultEyepieces: [25, 10, 6],
  },
  {
    id: 'preset-200-dob',
    name: '8" (200mm) Dobsonian (Light Bucket)',
    apertureMm: 200,
    focalLengthMm: 1200,
    description: 'f/6 deep sky powerhouse; spiral arms, globular clusters & planetary rilles',
    defaultEyepieces: [30, 15, 9],
  },
  {
    id: 'preset-203-sct',
    name: '8" (203mm) Schmidt-Cassegrain (SCT)',
    apertureMm: 203,
    focalLengthMm: 2032,
    description: 'f/10 compact long focal length; planetary and lunar specialist',
    defaultEyepieces: [40, 25, 12],
  },
];
