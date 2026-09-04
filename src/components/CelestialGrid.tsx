'use client';

import { CelestialTarget } from '@/lib/types/astro';

interface CelestialGridProps {
  targets: CelestialTarget[];
}

function getAzimuthDirection(deg: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((deg % 360) / 22.5) % 16;
  return directions[index];
}

export function CelestialGrid({ targets }: CelestialGridProps) {
  if (targets.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>🔭</span> Celestial Targets Tonight
        </h2>
        <span className="text-xs font-mono text-slate-400">
          {targets.filter((t) => t.isAboveHorizon).length} above horizon
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {targets.map((t) => {
          const azDir = getAzimuthDirection(t.azimuth);
          const isPrime = t.altitude >= 30;
          const isVisible = t.altitude > 0;

          return (
            <div
              key={t.id}
              className={`glass-panel glass-panel-hover rounded-2xl p-4 flex flex-col justify-between transition-all ${
                isPrime
                  ? 'border-indigo-500/40 glow-border-cyan'
                  : isVisible
                  ? 'border-slate-800'
                  : 'opacity-50 border-slate-900 bg-slate-950/40'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {t.type === 'planet'
                        ? '🪐'
                        : t.type === 'milkyway'
                        ? '🌌'
                        : t.type === 'moon'
                        ? '🌕'
                        : '✨'}
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                        {t.name}
                      </h3>
                      {t.constellation && (
                        <p className="text-[11px] text-slate-400">{t.constellation}</p>
                      )}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      isPrime
                        ? 'bg-cyan-950/70 border-cyan-800/60 text-cyan-300'
                        : isVisible
                        ? 'bg-slate-800 border-slate-700 text-slate-300'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    {isPrime ? 'Prime Alt' : isVisible ? 'Observable' : 'Below Horizon'}
                  </span>
                </div>

                {t.notes && (
                  <p className="text-xs text-slate-300/90 mb-3 leading-relaxed">
                    {t.notes}
                  </p>
                )}
              </div>

              {/* Coordinates & Magnitude Telemetry */}
              <div className="grid grid-cols-3 gap-1.5 pt-2.5 border-t border-slate-800/80 text-[11px] font-mono">
                <div className="bg-slate-900/80 rounded-lg p-1.5 text-center">
                  <span className="text-slate-500 block text-[10px] uppercase">Altitude</span>
                  <span className={`font-bold ${isPrime ? 'text-cyan-300' : 'text-slate-200'}`}>
                    {t.altitude}°
                  </span>
                </div>
                <div className="bg-slate-900/80 rounded-lg p-1.5 text-center">
                  <span className="text-slate-500 block text-[10px] uppercase">Azimuth</span>
                  <span className="font-bold text-slate-200">
                    {t.azimuth}° <span className="text-slate-400 font-sans text-[10px]">({azDir})</span>
                  </span>
                </div>
                <div className="bg-slate-900/80 rounded-lg p-1.5 text-center">
                  <span className="text-slate-500 block text-[10px] uppercase">Mag</span>
                  <span className="font-bold text-slate-200">
                    {t.magnitude > 0 ? `+${t.magnitude}` : t.magnitude}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
