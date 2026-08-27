'use client';

import { format } from 'date-fns';
import { ObservationWindow } from '@/lib/types/itinerary';

interface ItineraryTimelineProps {
  windows: ObservationWindow[];
  isLoading: boolean;
}

export function ItineraryTimeline({ windows, isLoading }: ItineraryTimelineProps) {
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
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 font-mono">
                    Quality: {win.avgScore}/100
                  </span>
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
                    <span>{t.type === 'planet' ? '🪐' : t.type === 'milkyway' ? '🌌' : '✨'}</span>
                    <span>{t.name}</span>
                    <span className="font-mono text-[11px] text-slate-400">({Math.round(t.altitude)}°)</span>
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
