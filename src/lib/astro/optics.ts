import { CelestialTarget } from '../types/astro';
import {
  EyepieceCalculation,
  TargetOpticsRecommendation,
  TelescopeProfile,
} from '../types/equipment';

/**
 * Calculates optical metrics (Magnification, Exit Pupil, True Field of View)
 * and matches the ideal eyepiece for each celestial target.
 */
export function calculateTargetOptics(
  profile: TelescopeProfile,
  target: CelestialTarget
): TargetOpticsRecommendation | null {
  if (
    profile.enabled === false ||
    !profile.eyepieces ||
    profile.eyepieces.length === 0 ||
    profile.apertureMm <= 0 ||
    profile.focalLengthMm <= 0
  ) {
    return null;
  }

  const maxUsefulMag = Math.round(profile.apertureMm * 2);
  const focalRatio = Math.round((profile.focalLengthMm / profile.apertureMm) * 10) / 10;

  // Filter out any standalone barlow items from base eyepieces
  const standardEyepieces = profile.eyepieces.filter((ep) => !ep.isBarlow && ep.focalLengthMm > 0);
  if (standardEyepieces.length === 0) {
    return null;
  }

  // Detect active Barlow multipliers
  const barlowMultipliers: number[] = [];
  profile.eyepieces.forEach((ep) => {
    if (ep.isBarlow && ep.barlowMultiplier && ep.barlowMultiplier > 1) {
      barlowMultipliers.push(ep.barlowMultiplier);
    }
  });
  if (profile.barlowLenses) {
    profile.barlowLenses.forEach((b) => {
      if (b.multiplier > 1) barlowMultipliers.push(b.multiplier);
    });
  }
  if (profile.hasBarlow2x) {
    barlowMultipliers.push(2);
  }
  const uniqueBarlows = Array.from(new Set(barlowMultipliers));

  // Calculate telemetry for native eyepieces
  const allCalculations: EyepieceCalculation[] = [];

  standardEyepieces.forEach((ep) => {
    // 1. Native eyepiece
    const rawMag = profile.focalLengthMm / ep.focalLengthMm;
    const magnification = Math.round(rawMag * 10) / 10;
    const exitPupilMm = Math.round((profile.apertureMm / magnification) * 100) / 100;
    const afov = ep.apparentFovDeg || 52;
    const trueFovDeg = Math.round((afov / magnification) * 100) / 100;
    const isOverMagnified = magnification > maxUsefulMag;

    let role: 'wide' | 'medium' | 'planetary' = 'medium';
    let roleLabel = 'Medium Power (Clusters)';
    if (magnification >= 110) {
      role = 'planetary';
      roleLabel = 'High Power (Planetary/Lunar)';
    } else if (magnification <= 55) {
      role = 'wide';
      roleLabel = 'Low Power (Wide-Field DSOs)';
    }

    allCalculations.push({
      eyepiece: ep,
      magnification,
      exitPupilMm,
      trueFovDeg,
      isRecommended: false,
      isOverMagnified,
      role,
      roleLabel,
      barlowMultiplier: 1,
      effectiveFocalLengthMm: ep.focalLengthMm,
      displayName: ep.label || `${ep.focalLengthMm}mm`,
    });

    // 2. Eyepiece + Barlow combinations
    uniqueBarlows.forEach((bm) => {
      const barlowMag = Math.round(rawMag * bm * 10) / 10;
      const barlowExitPupil = Math.round((profile.apertureMm / barlowMag) * 100) / 100;
      const barlowTrueFov = Math.round((afov / barlowMag) * 100) / 100;
      const barlowOver = barlowMag > maxUsefulMag;
      const effectiveFocal = Math.round((ep.focalLengthMm / bm) * 10) / 10;

      let bRole: 'wide' | 'medium' | 'planetary' = 'medium';
      let bRoleLabel = 'Medium Power (Clusters)';
      if (barlowMag >= 110) {
        bRole = 'planetary';
        bRoleLabel = 'High Power (Planetary/Lunar)';
      } else if (barlowMag <= 55) {
        bRole = 'wide';
        bRoleLabel = 'Low Power (Wide-Field DSOs)';
      }

      allCalculations.push({
        eyepiece: ep,
        magnification: barlowMag,
        exitPupilMm: barlowExitPupil,
        trueFovDeg: barlowTrueFov,
        isRecommended: false,
        isOverMagnified: barlowOver,
        role: bRole,
        roleLabel: bRoleLabel,
        barlowMultiplier: bm,
        effectiveFocalLengthMm: effectiveFocal,
        displayName: `${ep.focalLengthMm}mm + ${bm}× Barlow`,
      });
    });
  });

  // Sort by magnification ascending (lowest power / widest to highest power)
  allCalculations.sort((a, b) => a.magnification - b.magnification);

  const tId = target.id.toLowerCase();
  const tName = target.name.toLowerCase();
  const isPlanet = target.type === 'planet';
  const isMoon = target.type === 'moon';
  const isExtendedDSO =
    tId.includes('m31') ||
    tId.includes('m42') ||
    tId.includes('m45') ||
    tName.includes('andromeda') ||
    tName.includes('orion') ||
    tName.includes('pleiades') ||
    tId.includes('milkyway');
  const isCompactDSO =
    tId.includes('m13') ||
    tName.includes('hercules') ||
    tName.includes('cluster') ||
    (!isExtendedDSO && !isPlanet && !isMoon);

  let bestIndex = 0;
  let summaryText = '';

  if (isPlanet) {
    // Planets require high magnification without exceeding telescope physical resolution limit
    const validPlanetary = allCalculations.filter(
      (c) => !c.isOverMagnified && c.magnification <= 260
    );
    if (validPlanetary.length > 0) {
      bestIndex = allCalculations.indexOf(validPlanetary[validPlanetary.length - 1]);
    } else {
      // Pick highest magnification that isn't overmagnified if possible
      const nonOver = allCalculations.filter((c) => !c.isOverMagnified);
      bestIndex = nonOver.length > 0 ? allCalculations.indexOf(nonOver[nonOver.length - 1]) : 0;
    }
    const chosen = allCalculations[bestIndex];
    summaryText = `Use ${chosen.displayName} (${Math.round(chosen.magnification)}×) for planetary detail`;
  } else if (isMoon) {
    // For the Moon, medium-high magnification resolves craters & rilles
    const mediumHigh = allCalculations.filter(
      (c) => !c.isOverMagnified && c.magnification >= 60 && c.magnification <= maxUsefulMag
    );
    if (mediumHigh.length > 0) {
      bestIndex = allCalculations.indexOf(mediumHigh[mediumHigh.length - 1]);
    } else {
      bestIndex = Math.min(allCalculations.length - 1, Math.floor(allCalculations.length / 2));
    }
    const chosen = allCalculations[bestIndex];
    summaryText = `Use ${chosen.displayName} (${Math.round(chosen.magnification)}×) for crater detail`;
  } else if (isExtendedDSO) {
    // Extended nebulae and galaxies need lowest magnification for wide TFOV and bright exit pupil
    bestIndex = 0; // lowest magnification
    const chosen = allCalculations[bestIndex];
    summaryText = `Use ${chosen.displayName} (${Math.round(chosen.magnification)}×) for wide-field`;
  } else if (isCompactDSO) {
    // Globular clusters and compact DSOs need medium magnification (~75x-120x) to resolve stars
    const medium = allCalculations.filter(
      (c) => !c.isOverMagnified && c.magnification >= 50 && c.magnification <= 140
    );
    if (medium.length > 0) {
      bestIndex = allCalculations.indexOf(medium[medium.length - 1]);
    } else {
      bestIndex = Math.min(allCalculations.length - 1, Math.floor(allCalculations.length / 2));
    }
    const chosen = allCalculations[bestIndex];
    summaryText = `Use ${chosen.displayName} (${Math.round(chosen.magnification)}×) to resolve core stars`;
  } else {
    bestIndex = 0;
    const chosen = allCalculations[bestIndex];
    summaryText = `Use ${chosen.displayName} (${Math.round(chosen.magnification)}×)`;
  }

  // Mark recommended eyepiece
  allCalculations[bestIndex].isRecommended = true;

  return {
    recommendedEyepiece: allCalculations[bestIndex],
    allCalculations,
    summaryText,
    maxUsefulMagnification: maxUsefulMag,
    focalRatio,
  };
}
