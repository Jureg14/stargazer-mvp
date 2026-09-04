'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ObservationWindow } from '@/lib/types/itinerary';

interface ItineraryTimelineProps {
  windows: ObservationWindow[];
  isLoading: boolean;
}

export function ItineraryTimeline({ windows, isLoading }: ItineraryTimelineProps) {
  const [activeModalWindow, setActiveModalWindow] = useState<ObservationWindow | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>⏱️</span> Observation Windows
        </h2>
        <div className="glass-panel rounded-2xl p-6 text-center animate-pulse">
          <p className="text-sm text-slate-400">Calculating celestial ephemeris and weather models...</p>
        </div>
      </div>
    );
  }

  if (windows.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>⏱️</span> Observation Windows
        </h2>
        <div className="glass-panel rounded-2xl p-6 text-center">
          <div className="text-3xl mb-2">☁️</div>
          <h3 className="font-semibold text-white mb-1">No Optimal Viewing Windows Found</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Cloud cover or light conditions exceed prime observing thresholds tonight. Consider checking another date or tracking daytime/planetary culminations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>⏱️</span> Observation Windows
        </h2>
        <span className="text-xs font-mono text-slate-400">
          {windows.length} {windows.length === 1 ? 'window' : 'windows'} identified
        </span>
      </div>

      <div className="space-y-3">
        {windows.map((win, idx) => {
          const startTime = format(new Date(win.start), 'HH:mm');
          const endTime = format(new Date(win.end), 'HH:mm');
          const hours = Math.floor(win.durationMinutes / 60);
          const mins = win.durationMinutes % 60;
          const durationLabel = hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ''}` : `${mins}m`;

          return (
            <div
              key={win.id}
              className="glass-panel glass-panel-hover rounded-2xl p-5 border-l-4 border-l-cyan-400 transition-all"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center text-xs font-bold font-mono">
                    #{idx + 1}
                  </span>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white font-mono flex items-center gap-2">
                      {startTime} – {endTime}
                      <span className="text-xs font-normal text-slate-400 font-sans">({durationLabel})</span>
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveModalWindow(win)}
                    title="Click for score calculation breakdown"
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-900 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-white font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:shadow-cyan-500/10"
                  >
                    <span>Quality: <strong>{win.avgScore}/100</strong></span>
                    <span className="text-[10px] bg-cyan-950/80 px-1 py-0.2 rounded text-cyan-400">ℹ breakdown</span>
                  </button>

                  <span className="text-xs font-medium px-2 py-1 rounded-lg bg-indigo-950/60 border border-indigo-800/40 text-indigo-300">
                    {win.avgCloud}% Cloud
                  </span>
                </div>
              </div>

              {/* Natural Language Narrative Summary */}
              <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/70 mb-3.5">
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {win.narrative}
                </p>
              </div>

              {/* Highlights & Target Tags */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Visible Targets:</span>
                {win.targets.map((t) => (
                  <span
                    key={t.id}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1 ${
                      t.isOptimal
                        ? 'bg-cyan-950/50 border-cyan-700/50 text-cyan-200'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <span>{t.type === 'planet' ? '🪐' : t.type === 'milkyway' ? '🌌' : t.type === 'moon' ? '🌕' : '✨'}</span>
                    <span>{t.name}</span>
                    <span className="font-mono text-[11px] text-slate-400">({Math.round(t.altitude)}°)</span>
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Score Breakdown Modal Popup */}
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
                  Window: {format(new Date(activeModalWindow.start), 'HH:mm')} – {format(new Date(activeModalWindow.end), 'HH:mm')} ({Math.round(activeModalWindow.durationMinutes / 60)}h)
                </p>
              </div>
              <button
                onClick={() => setActiveModalWindow(null)}
                className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Score Metric Formula Summary */}
            <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
              <span className="text-xs text-slate-300 font-medium">Composite Observation Quality:</span>
              <span className="text-lg font-bold font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-800/60 px-3 py-0.5 rounded-lg">
                {activeModalWindow.avgScore} / 100
              </span>
            </div>

            {/* Metric Factors Breakdown List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              <div className="flex items-center justify-between text-xs px-3 py-1.5 rounded-lg bg-slate-900/60 text-slate-400 font-mono">
                <span>Base Neutral Starting Rating</span>
                <span className="text-slate-300 font-bold">+50 pts</span>
              </div>

              {activeModalWindow.scoreDetails?.factors.map((f, i) => {
                const isPos = f.score > 0;
                const isNeg = f.score < 0;

                return (
                  <div
                    key={i}
                    className={`flex items-start justify-between gap-3 text-xs p-3 rounded-xl border ${
                      isPos
                        ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                        : isNeg
                        ? 'bg-rose-950/20 border-rose-800/40 text-rose-200'
                        : 'bg-amber-950/20 border-amber-800/40 text-amber-200'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                        <span>{isPos ? '▲' : isNeg ? '▼' : '•'}</span>
                        <span>{f.category}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5">{f.description}</p>
                    </div>

                    <span
                      className={`font-mono font-bold whitespace-nowrap text-xs px-2 py-0.5 rounded ${
                        isPos
                          ? 'bg-emerald-900/60 text-emerald-300'
                          : isNeg
                          ? 'bg-rose-900/60 text-rose-300'
                          : 'bg-amber-900/60 text-amber-300'
                      }`}
                    >
                      {isPos ? `+${f.score}` : f.score} pts
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer Note */}
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Heuristic score range: 0 (poor) to 100 (pristine)</span>
              <button
                onClick={() => setActiveModalWindow(null)}
                className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
