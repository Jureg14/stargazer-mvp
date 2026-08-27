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

  return `${dayName} ${timeRange} will have: ${cloudStr}, ${moonStr}, ${highlightsList}, and ${seeingStr}.`;
}

/**
 * Generates an overall night assessment summary.
 */
export function generateNightSummary(
  nightScore: number,
  bestWindow: ObservationWindow | null,
  darkHoursCount: number
): string {
  if (nightScore >= 80) {
    return `Prime stargazing night with ${darkHoursCount} hours of dark skies. Optimal window: ${bestWindow ? `${format(new Date(bestWindow.start), 'HH:mm')}–${format(new Date(bestWindow.end), 'HH:mm')}` : 'evening hours'}.`;
  }
  if (nightScore >= 60) {
    return `Good stargazing conditions with clear patches. Best observing interval: ${bestWindow ? `${format(new Date(bestWindow.start), 'HH:mm')}–${format(new Date(bestWindow.end), 'HH:mm')}` : 'late night'}.`;
  }
  if (nightScore >= 40) {
    return `Marginal conditions. Occasional breaks in cloud cover allow observing bright planets and lunar features.`;
  }
  return `Suboptimal stargazing tonight due to heavy cloud cover or atmospheric turbulence.`;
}
