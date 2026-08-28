'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { HourlyScoreBreakdown } from '@/lib/types/itinerary';

interface HourlyTimelineBarProps {
  timeline: HourlyScoreBreakdown[];
}

export function HourlyTimelineBar({ timeline }: HourlyTimelineBarProps) {
  const [selectedHour, setSelectedHour] = useState<HourlyScoreBreakdown | null>(null);

  // Filter timeline to show the target night sequence: from evening dusk (Day 1) to morning dawn (Day 2)
  // Find the first index after hour 12 where Sun altitude drops below 2 degrees
  let startIndex = timeline.findIndex((h) => {
    const d = new Date(h.time);
    return d.getUTCHours() >= 12 && h.sunAlt <= 2;
  });

  if (startIndex === -1) {
    startIndex = timeline.findIndex((h) => h.sunAlt <= 2);
  }
  if (startIndex === -1) startIndex = 0;

  const displayTimeline: HourlyScoreBreakdown[] = [];
  for (let i = startIndex; i < timeline.length; i++) {
    const h = timeline[i];
    if (displayTimeline.length > 0 && h.sunAlt > 2) {
      break; // End sequence at morning sunrise
    }
    displayTimeline.push(h);
  }

  const finalTimeline = displayTimeline.length > 0 ? displayTimeline : timeline.slice(12, 28);

  return (
    <div className="glass-panel rounded-2xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>📊</span> Night Sky Hourly Spectrum (Dusk to Dawn)
        </h2>
        <span className="text-xs text-slate-400">
          Click any hour bar for detailed sky quality breakdown
        </span>
      </div>

      {/* Hourly Timeline Chart */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-end gap-1.5 min-w-[550px] h-36 pt-4 px-1">
          {finalTimeline.map((h, i) => {
            const timeObj = new Date(h.time);
            const hourLabel = format(timeObj, 'HH:mm');
            const dateLabel = format(timeObj, 'dd/MM');
            const heightPct = Math.max(8, h.totalScore);
            const isSelected = selectedHour?.time === h.time;

            // Score color styling
            let barColor = 'bg-slate-700';
            if (h.totalScore >= 75) barColor = 'bg-gradient-to-t from-cyan-600 to-cyan-400';
            else if (h.totalScore >= 50) barColor = 'bg-gradient-to-t from-emerald-600 to-emerald-400';
            else if (h.totalScore >= 30) barColor = 'bg-gradient-to-t from-amber-600 to-amber-400';
            else if (h.totalScore > 0) barColor = 'bg-gradient-to-t from-rose-700 to-rose-500';

            return (
              <button
                key={i}
                onClick={() => setSelectedHour(isSelected ? null : h)}
                className={`flex-1 flex flex-col items-center justify-end h-full group focus:outline-none transition-all cursor-pointer ${
                  isSelected ? 'scale-105' : 'hover:opacity-90'
                }`}
              >
                {/* Score bar */}
                <div className="w-full flex flex-col items-center justify-end h-20">
                  <span className="text-[10px] font-mono text-slate-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {h.totalScore}
                  </span>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full max-w-[28px] rounded-t-md ${barColor} ${
                      isSelected ? 'ring-2 ring-white shadow-lg' : ''
                    } transition-all`}
                  />
                </div>

                {/* Cloud indicator dot */}
                <div
                  className="w-1.5 h-1.5 rounded-full mt-1.5 mb-1"
                  style={{
                    backgroundColor:
                      h.cloudCover < 20
                        ? '#34d399'
                        : h.cloudCover < 50
                        ? '#fbbf24'
                        : '#f87171',
                  }}
                  title={`${h.cloudCover}% cloud cover`}
                />

                {/* Time & Date Stacked Label */}
                <div className="flex flex-col items-center leading-tight">
                  <span
                    className={`text-[11px] font-mono tracking-tighter ${
                      isSelected ? 'font-bold text-white' : 'text-slate-300'
                    }`}
                  >
                    {hourLabel}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500">
                    {dateLabel}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Hour Details Box */}
      {selectedHour && (
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                {format(new Date(selectedHour.time), 'dd/MM HH:mm')}
              </span>
              <span className="text-xs text-slate-300 font-medium">
                Score: <strong className="text-cyan-300 font-mono">{selectedHour.totalScore}/100</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Cloud: {selectedHour.cloudCover}%</span>
              <span>•</span>
              <span>Seeing: {selectedHour.seeingQuality}</span>
              <span>•</span>
              <span>Sun: {selectedHour.sunAlt}°</span>
            </div>
          </div>

          <div className="text-xs text-slate-300">
            <span className="text-slate-400 font-medium mr-1.5">Visible at this hour:</span>
            {selectedHour.targetNames.length > 0 ? (
              <span className="text-slate-200">{selectedHour.targetNames.join(', ')}</span>
            ) : (
              <span className="text-slate-500">None optimal above 20° altitude</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
