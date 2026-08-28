import { format } from 'date-fns';
import { ObservationWindow } from '../types/itinerary';
import { Language } from '../i18n/translations';

const dayNamesPt: Record<string, string> = {
  Sunday: 'Domingo',
  Monday: 'Segunda-feira',
  Tuesday: 'Terça-feira',
  Wednesday: 'Quarta-feira',
  Thursday: 'Quinta-feira',
  Friday: 'Sexta-feira',
  Saturday: 'Sábado',
};

/**
 * Builds human-readable natural language sentences describing observation windows.
 */
export function generateWindowNarrative(window: Partial<ObservationWindow>, lang: Language = 'en'): string {
  const startDate = window.start ? new Date(window.start) : new Date();
  const endDate = window.end ? new Date(window.end) : new Date();
  const rawDayName = format(startDate, 'EEEE');
  const dayName = lang === 'pt' ? (dayNamesPt[rawDayName] || rawDayName) : rawDayName;
  const timeRange = `${format(startDate, 'HH:mm')}–${format(endDate, 'HH:mm')}`;

  if (lang === 'pt') {
    const cloudStr = `${window.avgCloud ?? 0}% de cobertura de nuvens`;
    const moonStr = window.moonStatus ?? 'brilho lunar moderado';
    const seeingStr = window.seeing === 'Excellent' ? 'excelentes condições de seeing' : `estabilidade atmosférica ${window.seeing === 'Good' ? 'boa' : 'moderada'}`;

    const highlightsList = window.highlights && window.highlights.length > 0
      ? window.highlights.slice(0, 3).join(', ')
      : 'céu limpo e estrelado';

    let narrative = `${dayName} das ${timeRange} terá: ${cloudStr}, ${moonStr}, ${highlightsList} e ${seeingStr}.`;

    if (window.satellites && window.satellites.length > 0) {
      const sat = window.satellites[0];
      const passTime = format(new Date(sat.peakTime), 'HH:mm');
      narrative += ` Passagem visível da ${sat.satelliteName.split(' ')[0]} às ${passTime} (alt máx ${sat.maxAltitudeDeg}°, mag ${sat.estimatedMagnitude}, ${sat.trajectory}).`;
    }

    if (window.meteors && window.meteors.length > 0) {
      const peakShower = window.meteors.find((m) => m.isPeakNight) ?? window.meteors[0];
      if (peakShower.effectiveZhr >= 10) {
        narrative += ` Chuva de meteoros ${peakShower.name} ativa (~${peakShower.effectiveZhr} meteoros/h).`;
      }
    }

    return narrative;
  }

  const cloudStr = `${window.avgCloud ?? 0}% cloud cover`;
  const moonStr = window.moonStatus ?? 'moderate moonlight';
  const seeingStr = window.seeing === 'Excellent' ? 'excellent seeing conditions' : `${window.seeing ?? 'good'} atmospheric stability`;

  const highlightsList = window.highlights && window.highlights.length > 0
    ? window.highlights.slice(0, 3).join(', ')
    : 'clear starry sky';

  let narrative = `${dayName} ${timeRange} will have: ${cloudStr}, ${moonStr}, ${highlightsList}, and ${seeingStr}.`;

  if (window.satellites && window.satellites.length > 0) {
    const sat = window.satellites[0];
    const passTime = format(new Date(sat.peakTime), 'HH:mm');
    narrative += ` ${sat.satelliteName.split(' ')[0]} visible pass at ${passTime} (max alt ${sat.maxAltitudeDeg}°, mag ${sat.estimatedMagnitude}, ${sat.trajectory}).`;
  }

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
  peakMeteors?: string,
  lang: Language = 'en'
): string {
  let text = '';

  if (lang === 'pt') {
    const windowStr = bestWindow ? `${format(new Date(bestWindow.start), 'HH:mm')}–${format(new Date(bestWindow.end), 'HH:mm')}` : 'primeiras horas';
    if (nightScore >= 80) {
      text = `Excelente noite para observação com ${darkHoursCount} horas de céu escuro. Janela ideal: ${windowStr}.`;
    } else if (nightScore >= 60) {
      text = `Boas condições de observação com aberturas no céu. Melhor intervalo: ${windowStr}.`;
    } else if (nightScore >= 40) {
      text = `Condições moderadas. Aberturas ocasionais nas nuvens permitem observar planetas brilhantes e detalhes lunares.`;
    } else {
      text = `Noite desfavorável para observação astronômica devido à alta nebulosidade ou turbulência.`;
    }

    if (satelliteCount > 0) {
      text += ` ${satelliteCount} ${satelliteCount === 1 ? 'passagem visível' : 'passagens visíveis'} de satélite (ISS/Tiangong) esta noite.`;
    }
    if (peakMeteors) {
      text += ` Pico de ${peakMeteors} esta noite.`;
    }
    return text;
  }

  const windowStr = bestWindow ? `${format(new Date(bestWindow.start), 'HH:mm')}–${format(new Date(bestWindow.end), 'HH:mm')}` : 'evening hours';
  if (nightScore >= 80) {
    text = `Prime stargazing night with ${darkHoursCount} hours of dark skies. Optimal window: ${windowStr}.`;
  } else if (nightScore >= 60) {
    text = `Good stargazing conditions with clear patches. Best observing interval: ${windowStr}.`;
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

