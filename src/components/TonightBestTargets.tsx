'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { CelestialTarget, TargetQualityTier } from '@/lib/types/astro';
import { ObservationWindow } from '@/lib/types/itinerary';

interface TonightBestTargetsProps {
  targets: CelestialTarget[];
  windows?: ObservationWindow[];
  isLoading?: boolean;
}

function getAzimuthDirection(deg: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(((deg % 360) + 360) % 360 / 22.5) % 16;
  return directions[index];
}

export function TonightBestTargets({ targets, windows = [], isLoading = false }: TonightBestTargetsProps) {
  const [selectedTier, setSelectedTier] = useState<'all' | TargetQualityTier>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'planet' | 'dso' | 'moon'>('all');
  const [expandedTargetId, setExpandedTargetId] = useState<string | null>(null);
  const [activeModalWindow, setActiveModalWindow] = useState<ObservationWindow | null>(null);

  // Derive counts
  const counts = useMemo(() => {
    let excellent = 0;
    let good = 0;
    let poor = 0;

    for (const t of targets) {
      const tier = t.statusTier || t.evaluation?.tier || (t.altitude >= 35 ? 'excellent' : t.altitude >= 20 ? 'good' : 'poor');
      if (tier === 'excellent') excellent++;
      else if (tier === 'good') good++;
      else poor++;
    }

    return { excellent, good, poor, total: targets.length };
  }, [targets]);

  // Filter targets
  const filteredTargets = useMemo(() => {
    return targets.filter((t) => {
      const tier = t.statusTier || t.evaluation?.tier || (t.altitude >= 35 ? 'excellent' : t.altitude >= 20 ? 'good' : 'poor');
      if (selectedTier !== 'all' && tier !== selectedTier) return false;

      if (selectedCategory !== 'all') {
        if (selectedCategory === 'dso' && t.type !== 'dso' && t.type !== 'milkyway') return false;
        if (selectedCategory === 'planet' && t.type !== 'planet') return false;
        if (selectedCategory === 'moon' && t.type !== 'moon') return false;
      }

      return true;
    });
  }, [targets, selectedTier, selectedCategory]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>✨</span> Tonight&apos;s best targets
        </h2>
        <div className="glass-panel rounded-2xl p-8 text-center animate-pulse">
          <p className="text-sm text-slate-400">Evaluating seeing stability, transparency & celestial windows...</p>
        </div>
      </div>
    );
  }

  if (targets.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>✨</span> Tonight&apos;s best targets
        </h2>
        <div className="glass-panel rounded-2xl p-6 text-center">
          <div className="text-3xl mb-2">☁️</div>
          <h3 className="font-semibold text-white mb-1">No Observable Targets Tonight</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Heavy cloud cover or light interference prevents quality observations tonight.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-800/60">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>✨</span> Tonight&apos;s best targets
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Condition-tailored recommendations weighted by seeing, transparency, and lunar glare
          </p>
        </div>

        {/* Global Observation Windows & Breakdown Button */}
        {windows.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveModalWindow(windows[0])}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-white font-mono flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow-cyan-500/10"
              title="View atmospheric seeing & score factors breakdown"
            >
              <span>Prime Window: {format(new Date(windows[0].start), 'HH:mm')}–{format(new Date(windows[0].end), 'HH:mm')}</span>
              <span className="text-[10px] bg-cyan-950/90 px-1.5 py-0.5 rounded text-cyan-400 font-sans font-medium">
                📊 Score {windows[0].avgScore}/100
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Filter Tabs & Category Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Tier Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs">
          <button
            onClick={() => setSelectedTier('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              selectedTier === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({counts.total})
          </button>
          <button
            onClick={() => setSelectedTier('excellent')}
            className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedTier === 'excellent'
                ? 'bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 shadow-sm'
                : 'text-slate-400 hover:text-emerald-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-sm shadow-emerald-400/50"></span>
            <span>Excellent</span>
            <span className="font-mono text-[10px] opacity-80">({counts.excellent})</span>
          </button>
          <button
            onClick={() => setSelectedTier('good')}
            className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedTier === 'good'
                ? 'bg-amber-950/80 border border-amber-700/60 text-amber-300 shadow-sm'
                : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block shadow-sm shadow-amber-400/50"></span>
            <span>Good</span>
            <span className="font-mono text-[10px] opacity-80">({counts.good})</span>
          </button>
          <button
            onClick={() => setSelectedTier('poor')}
            className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedTier === 'poor'
                ? 'bg-rose-950/80 border border-rose-700/60 text-rose-300 shadow-sm'
                : 'text-slate-400 hover:text-rose-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400 inline-block shadow-sm shadow-rose-400/50"></span>
            <span>Poor tonight</span>
            <span className="font-mono text-[10px] opacity-80">({counts.poor})</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-indigo-950/70 border-indigo-700/60 text-indigo-200'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-300'
            }`}
          >
            All Types
          </button>
          <button
            onClick={() => setSelectedCategory('planet')}
            className={`px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer ${
              selectedCategory === 'planet'
                ? 'bg-indigo-950/70 border-indigo-700/60 text-indigo-200'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-300'
            }`}
          >
            🪐 Planets
          </button>
          <button
            onClick={() => setSelectedCategory('dso')}
            className={`px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer ${
              selectedCategory === 'dso'
                ? 'bg-indigo-950/70 border-indigo-700/60 text-indigo-200'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-300'
            }`}
          >
            🌌 Deep Sky
          </button>
          <button
            onClick={() => setSelectedCategory('moon')}
            className={`px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer ${
              selectedCategory === 'moon'
                ? 'bg-indigo-950/70 border-indigo-700/60 text-indigo-200'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-300'
            }`}
          >
            🌕 Moon
          </button>
        </div>
      </div>

      {/* Target Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredTargets.map((t) => {
          const evalData = t.evaluation;
          const tier = t.statusTier || evalData?.tier || (t.altitude >= 35 ? 'excellent' : t.altitude >= 20 ? 'good' : 'poor');
          const tierLabel = t.statusLabel || evalData?.tierLabel || (tier === 'excellent' ? 'Excellent' : tier === 'good' ? 'Good' : 'Poor tonight');
          const bestWindow = t.bestWindow || evalData?.bestWindow || 'Below horizon all night';
          const peakAlt = t.peakAltitude ?? evalData?.peakAltitude ?? Math.round(t.altitude);
          const conditionSummary = t.conditionSummary || evalData?.conditionSummary || (tier === 'poor' ? (t.poorReason || 'Low altitude + poor seeing') : t.type === 'planet' ? 'Seeing: Good' : 'Moon interference: Low');
          const isExpanded = expandedTargetId === t.id;
          const azDir = getAzimuthDirection(t.azimuth);

          // Colored top border per status tier
          const cardBorderStyles =
            tier === 'excellent'
              ? 'border-t-4 border-t-emerald-400 border-x border-b border-slate-800/80 shadow-lg shadow-emerald-950/20 hover:border-t-emerald-300'
              : tier === 'good'
              ? 'border-t-4 border-t-amber-400 border-x border-b border-slate-800/80 shadow-lg shadow-amber-950/20 hover:border-t-amber-300'
              : 'border-t-4 border-t-rose-500 border-x border-b border-slate-900/80 bg-slate-950/40 opacity-85 hover:border-t-rose-400';

          const headerColor =
            tier === 'excellent'
              ? 'text-emerald-300'
              : tier === 'good'
              ? 'text-amber-300'
              : 'text-rose-300';

          return (
            <div
              key={t.id}
              className={`glass-panel glass-panel-hover rounded-2xl p-4 sm:p-5 transition-all flex flex-col justify-between ${cardBorderStyles}`}
            >
              <div>
                {/* Target Title Row: Target Name — Quality Rating (no circle emojis, colored top border instead) */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl" title={t.type}>
                      {t.type === 'planet'
                        ? '🪐'
                        : t.type === 'milkyway'
                        ? '🌌'
                        : t.type === 'moon'
                        ? '🌕'
                        : '✨'}
                    </span>
                    <div>
                      <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-2 flex-wrap">
                        <span>{t.name}</span>
                        <span className="text-slate-500">—</span>
                        <span className={`text-sm sm:text-base font-semibold ${headerColor}`}>
                          {tierLabel}
                        </span>
                      </h3>
                      {t.constellation && (
                        <p className="text-xs text-slate-400">{t.constellation}</p>
                      )}
                    </div>
                  </div>

                  {evalData?.score !== undefined && (
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400" title="Target Suitability Score">
                      {evalData.score}/100
                    </span>
                  )}
                </div>

                {/* Primary Telemetry Rows matching requested example format */}
                <div className="space-y-1.5 py-2.5 px-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs sm:text-sm font-sans">
                  {/* Row 1: Best Window */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Best:</span>
                    <span className="font-mono font-semibold text-slate-100">
                      {bestWindow}
                    </span>
                  </div>

                  {/* Row 2: Peak Altitude */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Altitude:</span>
                    <span className="font-mono font-bold text-cyan-300">
                      {peakAlt}°
                    </span>
                  </div>

                  {/* Row 3: Dominant Condition / Status Metric */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/40">
                    <span className="text-slate-400 font-medium">
                      {tier === 'poor'
                        ? 'Notice:'
                        : t.type === 'planet' || t.type === 'moon'
                        ? 'Seeing:'
                        : 'Moon interference:'}
                    </span>
                    <span
                      className={`font-semibold ${
                        tier === 'poor'
                          ? 'text-rose-300'
                          : conditionSummary.includes('Excellent') || conditionSummary.includes('Low') || conditionSummary.includes('None')
                          ? 'text-emerald-300'
                          : 'text-amber-300'
                      }`}
                    >
                      {tier === 'poor'
                        ? conditionSummary
                        : conditionSummary.replace(/^(Seeing:\s*|Moon interference:\s*)/i, '')}
                    </span>
                  </div>
                </div>

                {/* Notes Summary */}
                {t.notes && (
                  <p className="text-xs text-slate-300/90 mt-3 leading-relaxed">
                    {t.notes}
                  </p>
                )}
              </div>

              {/* Expandable Technical Telemetry Toggle */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                <button
                  onClick={() => setExpandedTargetId(isExpanded ? null : t.id)}
                  className="w-full flex items-center justify-between text-[11px] text-slate-400 hover:text-cyan-300 font-medium cursor-pointer transition-colors"
                >
                  <span>{isExpanded ? 'Hide Coordinates & Optics' : 'Show Coordinates & Optics'}</span>
                  <span>{isExpanded ? '▲' : '▼'}</span>
                </button>

                {isExpanded && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800/50 space-y-2 text-[11px] animate-in fade-in duration-150">
                    <div className="grid grid-cols-3 gap-1.5 font-mono">
                      <div className="bg-slate-900/90 rounded-lg p-1.5 text-center">
                        <span className="text-slate-500 block text-[10px] uppercase">Current Alt</span>
                        <span className="font-bold text-slate-200">{t.altitude}°</span>
                      </div>
                      <div className="bg-slate-900/90 rounded-lg p-1.5 text-center">
                        <span className="text-slate-500 block text-[10px] uppercase">Azimuth</span>
                        <span className="font-bold text-slate-200">
                          {t.azimuth}° <span className="text-slate-400 font-sans text-[10px]">({azDir})</span>
                        </span>
                      </div>
                      <div className="bg-slate-900/90 rounded-lg p-1.5 text-center">
                        <span className="text-slate-500 block text-[10px] uppercase">Mag</span>
                        <span className="font-bold text-slate-200">
                          {t.magnitude > 0 ? `+${t.magnitude}` : t.magnitude}
                        </span>
                      </div>
                    </div>

                    {t.minBortleClass && (
                      <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-[11px] text-indigo-300">
                        <span>Light Pollution Limit:</span>
                        <span className="font-mono font-semibold">Bortle ≤ {t.minBortleClass}</span>
                      </div>
                    )}

                    {evalData?.cloudCover !== undefined && (
                      <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300">
                        <span>Window Cloud Cover:</span>
                        <span className="font-mono font-semibold text-slate-200">{evalData.cloudCover}%</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Observation Window Score Breakdown Modal */}
      {activeModalWindow && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setActiveModalWindow(null)}
        >
          <div
            className="glass-panel border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>📊</span> Quality Score Calculation Breakdown
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Prime Window: {format(new Date(activeModalWindow.start), 'HH:mm')} – {format(new Date(activeModalWindow.end), 'HH:mm')} ({Math.round(activeModalWindow.durationMinutes / 60)}h)
                </p>
              </div>
              <button
                onClick={() => setActiveModalWindow(null)}
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Score Hero Summary */}
            <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-mono">Calculated Window Rating</span>
                <div className="text-2xl font-bold font-mono text-cyan-300">
                  {activeModalWindow.avgScore} <span className="text-sm font-normal text-slate-400">/ 100</span>
                </div>
              </div>
              <div className="text-right text-xs space-y-0.5">
                <div className="text-slate-300">Atmospheric Seeing: <strong className="text-cyan-300">{activeModalWindow.seeing}</strong></div>
                <div className="text-slate-300">Cloud Cover: <strong className="text-indigo-300">{activeModalWindow.avgCloud}%</strong></div>
                <div className="text-slate-400 font-mono text-[11px]">{activeModalWindow.moonStatus}</div>
              </div>
            </div>

            {/* Score Factor Items */}
            {activeModalWindow.scoreDetails && (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {activeModalWindow.scoreDetails.factors.map((factor, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/70 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {factor.status === 'positive' ? '🟢' : factor.status === 'neutral' ? '🟡' : '🔴'}
                      </span>
                      <div>
                        <span className="font-semibold text-white block">{factor.category}</span>
                        <span className="text-slate-400 text-[11px]">{factor.description}</span>
                      </div>
                    </div>
                    <span
                      className={`font-mono font-bold text-xs ${
                        factor.score > 0
                          ? 'text-emerald-400'
                          : factor.score < 0
                          ? 'text-rose-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {factor.score > 0 ? `+${factor.score}` : factor.score}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Window Narrative */}
            <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/60 text-xs text-slate-300 leading-relaxed">
              {activeModalWindow.narrative}
            </div>

            <button
              onClick={() => setActiveModalWindow(null)}
              className="w-full py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold cursor-pointer transition-all"
            >
              Close Breakdown
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
