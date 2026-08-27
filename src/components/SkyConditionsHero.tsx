'use client';

import { format } from 'date-fns';
import { MoonInfo, TwilightTimes } from '@/lib/types/astro';
import { ObservationWindow } from '@/lib/types/itinerary';

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
  // Score styling
  let scoreColor = 'text-emerald-400';
  let strokeColor = '#34d399';
  let badgeLabel = 'Excellent';
  let badgeBg = 'bg-emerald-950/60 border-emerald-800/50 text-emerald-300';

  if (score >= 80) {
    scoreColor = 'text-cyan-300';
    strokeColor = '#67e8f9';
    badgeLabel = 'Prime Night';
    badgeBg = 'bg-cyan-950/60 border-cyan-800/50 text-cyan-300';
  } else if (score >= 60) {
    scoreColor = 'text-emerald-400';
    strokeColor = '#34d399';
    badgeLabel = 'Good Conditions';
    badgeBg = 'bg-emerald-950/60 border-emerald-800/50 text-emerald-300';
  } else if (score >= 40) {
    scoreColor = 'text-amber-400';
    strokeColor = '#fbbf24';
    badgeLabel = 'Fair / Partial';
    badgeBg = 'bg-amber-950/60 border-amber-800/50 text-amber-300';
  } else {
    scoreColor = 'text-rose-400';
    strokeColor = '#f87171';
    badgeLabel = 'Poor / Overcast';
    badgeBg = 'bg-rose-950/60 border-rose-800/50 text-rose-300';
  }

  // Circular gauge math (radius = 36, circumference = 2 * PI * 36 = ~226)
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Format twilight bounds
  const duskTime = twilight.astroDusk ? format(new Date(twilight.astroDusk), 'HH:mm') : null;
  const dawnTime = twilight.astroDawn ? format(new Date(twilight.astroDawn), 'HH:mm') : null;

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
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Index</span>
          </div>
        </div>

        {/* Night Summary Text & Highlights */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${badgeBg}`}>
              {badgeLabel}
            </span>
            {bestWindow && (
              <span className="text-xs font-medium text-slate-400">
                Best window: <span className="font-mono text-slate-200">{format(new Date(bestWindow.start), 'HH:mm')}–{format(new Date(bestWindow.end), 'HH:mm')}</span>
              </span>
            )}
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white mb-1">
            Sky Quality Overview
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {summary}
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Dark Sky Hours</span>
              <span className="font-mono font-medium text-slate-200">
                {duskTime && dawnTime ? `${duskTime} – ${dawnTime}` : 'Sun near horizon'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Best Seeing</span>
              <span className="font-medium text-cyan-300">
                {bestWindow ? bestWindow.seeing : 'Variable'}
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-slate-500 block text-[11px]">Avg Window Cloud</span>
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
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Lunar Status</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {Math.round(moon.illuminationFraction * 100)}% Illuminated
            </span>
          </div>

          <div className="flex items-center space-x-3 mb-3">
            <div className="text-3xl select-none">
              {moon.illuminationFraction < 0.1 ? '🌑' : moon.illuminationFraction < 0.4 ? '🌒' : moon.illuminationFraction < 0.7 ? '🌓' : moon.illuminationFraction < 0.9 ? '🌔' : '🌕'}
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">{moon.phaseName}</h3>
              <p className="text-xs text-slate-400 font-mono">
                Mag {moon.magnitude > 0 ? `+${moon.magnitude}` : moon.magnitude}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-1.5 pt-3 border-t border-slate-800/80 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Altitude:</span>
            <span className="font-mono text-slate-200">
              {moon.altitude > 0 ? `${moon.altitude}° (Above horizon)` : `${moon.altitude}° (Below horizon)`}
            </span>
          </div>
          {moon.riseTime && (
            <div className="flex justify-between text-slate-400">
              <span>Moonrise:</span>
              <span className="font-mono text-slate-200">{format(new Date(moon.riseTime), 'HH:mm')}</span>
            </div>
          )}
          {moon.setTime && (
            <div className="flex justify-between text-slate-400">
              <span>Moonset:</span>
              <span className="font-mono text-slate-200">{format(new Date(moon.setTime), 'HH:mm')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
