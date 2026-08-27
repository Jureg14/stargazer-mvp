'use client';

import { format } from 'date-fns';
import { SatellitePass } from '@/lib/types/astro';

interface SatellitePassesProps {
  passes: SatellitePass[];
}

export function SatellitePasses({ passes }: SatellitePassesProps) {
  if (passes.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>🛰️</span> Visible Satellite Passes Tonight
        </h2>
        <span className="text-xs font-mono text-cyan-300">
          {passes.length} {passes.length === 1 ? 'pass' : 'passes'} (ISS / Tiangong)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {passes.map((pass, idx) => {
          const startTime = format(new Date(pass.startTime), 'HH:mm');
          const peakTime = format(new Date(pass.peakTime), 'HH:mm:ss');
          const endTime = format(new Date(pass.endTime), 'HH:mm');
          const durationMins = Math.round(pass.durationSeconds / 60);

          return (
            <div
              key={idx}
              className="glass-panel glass-panel-hover rounded-2xl p-4 border-l-4 border-l-cyan-400 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-sm">
                      🛰️
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">
                        {pass.satelliteName}
                      </h3>
                      <p className="text-[11px] font-mono text-cyan-300">
                        Peak at {peakTime} (Duration: ~{durationMins} min)
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-cyan-200">
                    Mag {pass.estimatedMagnitude}
                  </span>
                </div>

                <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/80 mb-3 text-xs flex items-center justify-between">
                  <div className="text-slate-300">
                    <span className="text-slate-500 block text-[10px] uppercase">Trajectory</span>
                    <span className="font-semibold text-white font-mono">{pass.trajectory}</span>
                  </div>
                  <div className="text-right text-slate-300">
                    <span className="text-slate-500 block text-[10px] uppercase">Time Span</span>
                    <span className="font-mono text-cyan-200">{startTime} – {endTime}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
                <div className="bg-slate-900/80 rounded-lg p-1.5 text-center">
                  <span className="text-slate-500 block text-[10px] uppercase">Max Alt</span>
                  <span className="font-bold text-cyan-300">{pass.maxAltitudeDeg}°</span>
                </div>
                <div className="bg-slate-900/80 rounded-lg p-1.5 text-center">
                  <span className="text-slate-500 block text-[10px] uppercase">Rises</span>
                  <span className="font-bold text-slate-200">{pass.startDirection} ({pass.startAzimuthDeg}°)</span>
                </div>
                <div className="bg-slate-900/80 rounded-lg p-1.5 text-center">
                  <span className="text-slate-500 block text-[10px] uppercase">Sets</span>
                  <span className="font-bold text-slate-200">{pass.endDirection} ({pass.endAzimuthDeg}°)</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
