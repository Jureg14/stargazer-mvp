'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { CelestialTarget } from '@/lib/types/astro';

interface AltitudeChartProps {
  targets: CelestialTarget[];
}

const TARGET_COLORS: Record<string, string> = {
  saturn: '#fbbf24',    // amber
  jupiter: '#60a5fa',   // blue
  mars: '#f87171',      // red
  venus: '#fef08a',     // yellow
  'milkyway-core': '#c084fc', // purple
  'm31-andromeda': '#34d399', // emerald
  'm42-orion': '#38bdf8',     // sky
  'm45-pleiades': '#818cf8',  // indigo
  'm13-hercules': '#f472b6',  // pink
};

export function AltitudeChart({ targets }: AltitudeChartProps) {
  const [activeTargetId, setActiveTargetId] = useState<string | null>(null);

  const targetsWithCurves = targets.filter((t) => t.altitudeHistory && t.altitudeHistory.length > 0);
  if (targetsWithCurves.length === 0) return null;

  const samplePoints = targetsWithCurves[0].altitudeHistory ?? [];
  if (samplePoints.length === 0) return null;

  const width = 800;
  const height = 240;
  const padLeft = 40;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 30;

  const chartWidth = width - padLeft - padRight;
  const chartHeight = height - padTop - padBottom;

  const getX = (index: number) => padLeft + (index / (samplePoints.length - 1)) * chartWidth;
  const getY = (alt: number) => padTop + chartHeight - (Math.max(0, Math.min(90, alt)) / 90) * chartHeight;

  return (
    <div className="glass-panel rounded-2xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>📈</span> Celestial Altitude Progression (Dusk to Dawn)
        </h2>
        <span className="text-xs text-slate-400">
          Target elevation curves (0° Horizon to 90° Zenith)
        </span>
      </div>

      {/* Target Legend Pills */}
      <div className="flex flex-wrap gap-2 pt-1">
        {targetsWithCurves.map((t) => {
          const color = TARGET_COLORS[t.id] ?? '#94a3b8';
          const isSelected = activeTargetId === t.id;

          return (
            <button
              key={t.id}
              onClick={() => setActiveTargetId(isSelected ? null : t.id)}
              className={`text-xs px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-800 border-white text-white shadow-md'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span>{t.name}</span>
            </button>
          );
        })}
      </div>

      {/* SVG Curve Chart */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[600px]">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            {/* Background Grid & Altitude Thresholds */}
            {[0, 30, 60, 90].map((alt) => {
              const y = getY(alt);
              return (
                <g key={alt}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={width - padRight}
                    y2={y}
                    stroke="#1e293b"
                    strokeDasharray={alt === 0 ? '0' : '4 4'}
                    strokeWidth="1"
                  />
                  <text
                    x={padLeft - 8}
                    y={y + 4}
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    {alt}°
                  </text>
                </g>
              );
            })}

            {/* Optimal Horizon Zone Band (> 25°) */}
            <rect
              x={padLeft}
              y={getY(90)}
              width={chartWidth}
              height={getY(25) - getY(90)}
              fill="rgba(56, 189, 248, 0.03)"
            />

            {/* Target Altitude Curves */}
            {targetsWithCurves.map((t) => {
              const color = TARGET_COLORS[t.id] ?? '#94a3b8';
              const isDimmed = activeTargetId !== null && activeTargetId !== t.id;
              const points = t.altitudeHistory ?? [];

              const pathData = points
                .map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(pt.altitude)}`)
                .join(' ');

              return (
                <g key={t.id} opacity={isDimmed ? 0.2 : 1.0} className="transition-opacity duration-200">
                  <path
                    d={pathData}
                    fill="none"
                    stroke={color}
                    strokeWidth={activeTargetId === t.id ? '3' : '2'}
                    strokeLinecap="round"
                  />
                </g>
              );
            })}

            {/* X-Axis Time Labels */}
            {samplePoints.map((pt, idx) => {
              if (idx % 2 !== 0 && idx !== samplePoints.length - 1) return null;
              const x = getX(idx);
              const label = format(new Date(pt.time), 'HH:mm');

              return (
                <text
                  key={idx}
                  x={x}
                  y={height - 8}
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {label}
                </text>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
