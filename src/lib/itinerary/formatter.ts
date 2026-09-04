import { format } from 'date-fns';
import { ObservationWindow } from '../types/itinerary';

/**
 * Builds human-readable natural language sentences describing observation windows.
 */
export function generateWindowNarrative(window: Partial<ObservationWindow>): string {
  const startDate = window.start ? new Date(window.start) : new Date();
  const endDate = window.end ? new Date(window.end) : new Date();
  const dayName = format(startDate, 'EEEE');
  const timeRange = `${format(startDate, 'HH:mm')}–${format(endDate, 'HH:mm')}`;

  const cloudStr = `${window.avgCloud ?? 0}% cloud cover`;
  const moonStr = window.moonStatus ?? 'moderate moonlight';
  const seeingStr = window.seeing === 'Excellent' ? 'excellent seeing conditions' : `${window.seeing ?? 'good'} atmospheric stability`;

  const highlightsList = window.highlights && window.highlights.length > 0
    ? window.highlights.slice(0, 3).join(', ')
    : 'clear starry sky';

  let narrative = `${dayName} ${timeRange} will have: ${cloudStr}, ${moonStr}, ${highlightsList}, and ${seeingStr}.`;

  // Append satellite pass alerts if occurring in this window
  if (window.satellites && window.satellites.length > 0) {
    const sat = window.satellites[0];
    const passTime = format(new Date(sat.peakTime), 'HH:mm');
    narrative += ` ${sat.satelliteName.split(' ')[0]} visible pass at ${passTime} (max alt ${sat.maxAltitudeDeg}°, mag ${sat.estimatedMagnitude}, ${sat.trajectory}).`;
  }

  // Append meteor peak highlight if active
  if (window.meteors && window.meteors.length > 0) {
    const peakShower = window.meteors.find((m) => m.isPeakNight) ?? window.meteors[0];
    if (peakShower.effectiveZhr >= 10) {
      narrative += ` ${peakShower.name} active (~${peakShower.effectiveZhr} meteors/hr).`;
    }
  }

  return narrative;
}

/**
 * Generates an overall night assessment summary.
 */
export function generateNightSummary(
  nightScore: number,
  bestWindow: ObservationWindow | null,
  darkHoursCount: number,
  satelliteCount = 0,
  peakMeteors?: string
): string {
  let text = '';
  if (nightScore >= 80) {
    text = `Prime stargazing night with ${darkHoursCount} hours of dark skies. Optimal window: ${bestWindow ? `${format(new Date(bestWindow.start), 'HH:mm')}–${format(new Date(bestWindow.end), 'HH:mm')}` : 'evening hours'}.`;
  } else if (nightScore >= 60) {
    text = `Good stargazing conditions with clear patches. Best observing interval: ${bestWindow ? `${format(new Date(bestWindow.start), 'HH:mm')}–${format(new Date(bestWindow.end), 'HH:mm')}` : 'late night'}.`;
  } else if (nightScore >= 40) {
    text = `Marginal conditions. Occasional breaks in cloud cover allow observing bright planets and lunar features.`;
  } else {
    text = `Suboptimal stargazing tonight due to heavy cloud cover or atmospheric turbulence.`;
  }

  if (satelliteCount > 0) {
    text += ` ${satelliteCount} visible satellite ${satelliteCount === 1 ? 'pass' : 'passes'} (ISS/Tiangong) tonight.`;
  }
  if (peakMeteors) {
    text += ` ${peakMeteors} peak tonight.`;
  }

  return text;
}
