'use client';

import { format } from 'date-fns';
import { MoonInfo, TwilightTimes } from '@/lib/types/astro';
import { ObservationWindow } from '@/lib/types/itinerary';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface SkyConditionsHeroProps {
  score: number;
  summary: string;
  twilight: TwilightTimes;
  moon: MoonInfo;
  bestWindow: ObservationWindow | null;
}

export function SkyConditionsHero({
  score,
  summary,
  twilight,
  moon,
  bestWindow,
}: SkyConditionsHeroProps) {
  const { language, t } = useLanguage();

  // Score styling & localized badges
  let scoreColor = 'text-emerald-400';
  let strokeColor = '#34d399';
  let badgeLabel = language === 'pt' ? 'Excelente' : 'Excellent';
  let badgeBg = 'bg-emerald-950/60 border-emerald-800/50 text-emerald-300';

  if (score >= 80) {
    scoreColor = 'text-cyan-300';
    strokeColor = '#67e8f9';
    badgeLabel = language === 'pt' ? 'Noite Excelente' : 'Prime Night';
    badgeBg = 'bg-cyan-950/60 border-cyan-800/50 text-cyan-300';
  } else if (score >= 60) {
    scoreColor = 'text-emerald-400';
    strokeColor = '#34d399';
    badgeLabel = language === 'pt' ? 'Boas Condições' : 'Good Conditions';
    badgeBg = 'bg-emerald-950/60 border-emerald-800/50 text-emerald-300';
  } else if (score >= 40) {
    scoreColor = 'text-amber-400';
    strokeColor = '#fbbf24';
    badgeLabel = language === 'pt' ? 'Parcial / Moderada' : 'Fair / Partial';
    badgeBg = 'bg-amber-950/60 border-amber-800/50 text-amber-300';
  } else {
    scoreColor = 'text-rose-400';
    strokeColor = '#f87171';
    badgeLabel = language === 'pt' ? 'Desfavorável' : 'Poor / Overcast';
    badgeBg = 'bg-rose-950/60 border-rose-800/50 text-rose-300';
  }

  // Circular gauge math (radius = 36, circumference = 2 * PI * 36 = ~226)
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Format twilight bounds
  const duskTime = twilight.astroDusk ? format(new Date(twilight.astroDusk), 'HH:mm') : null;
  const dawnTime = twilight.astroDawn ? format(new Date(twilight.astroDawn), 'HH:mm') : null;

  // Localized Moon phase
  const getMoonPhaseTranslation = (phaseName: string) => {
    if (language !== 'pt') return phaseName;
    switch (phaseName) {
      case 'New Moon': return t.moonPhases.newMoon;
      case 'Waxing Crescent': return t.moonPhases.waxingCrescent;
      case 'First Quarter': return t.moonPhases.firstQuarter;
      case 'Waxing Gibbous': return t.moonPhases.waxingGibbous;
      case 'Full Moon': return t.moonPhases.fullMoon;
      case 'Waning Gibbous': return t.moonPhases.waningGibbous;
      case 'Third Quarter': return t.moonPhases.thirdQuarter;
      case 'Waning Crescent': return t.moonPhases.waningCrescent;
      default: return phaseName;
    }
  };

  const getSeeingTranslation = (seeingStr?: string) => {
    if (!seeingStr) return language === 'pt' ? 'Variável' : 'Variable';
    if (language === 'pt') {
      if (seeingStr === 'Excellent') return t.skyConditions.excellentSeeing;
      if (seeingStr === 'Good') return t.skyConditions.goodSeeing;
      if (seeingStr === 'Fair') return t.skyConditions.moderateSeeing;
    }
    return seeingStr;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. Overall Score & Summary */}
      <div className="glass-panel rounded-2xl p-5 md:col-span-2 flex flex-col sm:flex-row items-center sm:items-start gap-5">
        {/* Score Circular Gauge */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-28 h-28" viewBox="0 0 96 96">
            <circle
              cx="48"
              cy="48"
              r={radius}
              fill="transparent"
              stroke="#1e293b"
              strokeWidth="8"
            />
            <circle
              className="score-circle"
              cx="48"
              cy="48"
              r={radius}
              fill="transparent"
              stroke={strokeColor}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-extrabold font-mono ${scoreColor}`}>{score}</span>
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">{language === 'pt' ? 'Índice' : 'Index'}</span>
          </div>
        </div>

        {/* Night Summary Text & Highlights */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5 flex-wrap">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${badgeBg}`}>
              {badgeLabel}
            </span>
            {bestWindow && (
              <span className="text-xs font-medium text-slate-400">
                {language === 'pt' ? 'Melhor janela:' : 'Best window:'} <span className="font-mono text-slate-200">{format(new Date(bestWindow.start), 'HH:mm')}–{format(new Date(bestWindow.end), 'HH:mm')}</span>
              </span>
            )}
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white mb-1">
            {t.skyConditions.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {summary}
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">{t.skyConditions.twilightLabel}</span>
              <span className="font-mono font-medium text-slate-200">
                {duskTime && dawnTime ? `${duskTime} – ${dawnTime}` : (language === 'pt' ? 'Sol perto do horizonte' : 'Sun near horizon')}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">{t.skyConditions.seeingLabel}</span>
              <span className="font-medium text-cyan-300">
                {getSeeingTranslation(bestWindow?.seeing)}
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-slate-500 block text-[11px]">{language === 'pt' ? 'Nuvens na Janela' : 'Avg Window Cloud'}</span>
              <span className="font-mono font-medium text-slate-200">
                {bestWindow ? `${bestWindow.avgCloud}%` : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Moon & Night Sky Status Card */}
      <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{t.skyConditions.moonPhaseLabel}</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {Math.round(moon.illuminationFraction * 100)}% {t.skyConditions.moonIllumination}
            </span>
          </div>

          <div className="flex items-center space-x-3 mb-3">
            <div className="text-3xl select-none">
              {moon.illuminationFraction < 0.1 ? '🌑' : moon.illuminationFraction < 0.4 ? '🌒' : moon.illuminationFraction < 0.7 ? '🌓' : moon.illuminationFraction < 0.9 ? '🌔' : '🌕'}
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">{getMoonPhaseTranslation(moon.phaseName)}</h3>
              <p className="text-xs text-slate-400 font-mono">
                Mag {moon.magnitude > 0 ? `+${moon.magnitude}` : moon.magnitude}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-1.5 pt-3 border-t border-slate-800/80 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>{language === 'pt' ? 'Altitude:' : 'Altitude:'}</span>
            <span className="font-mono text-slate-200">
              {moon.altitude > 0
                ? `${moon.altitude}° (${language === 'pt' ? 'Acima do horizonte' : 'Above horizon'})`
                : `${moon.altitude}° (${language === 'pt' ? 'Abaixo do horizonte' : 'Below horizon'})`}
            </span>
          </div>
          {moon.riseTime && (
            <div className="flex justify-between text-slate-400">
              <span>{language === 'pt' ? 'Nascer da Lua:' : 'Moonrise:'}</span>
              <span className="font-mono text-slate-200">{format(new Date(moon.riseTime), 'HH:mm')}</span>
            </div>
          )}
          {moon.setTime && (
            <div className="flex justify-between text-slate-400">
              <span>{language === 'pt' ? 'Pôr da Lua:' : 'Moonset:'}</span>
              <span className="font-mono text-slate-200">{format(new Date(moon.setTime), 'HH:mm')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

