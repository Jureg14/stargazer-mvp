'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { CelestialTarget } from '@/lib/types/astro';

interface AltitudeChartProps {
  targets: CelestialTarget[];
}

const TARGET_COLORS: Record<string, string> = {
  moon: '#e2e8f0',      // glowing silver/pearl
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
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [hoveredTargetId, setHoveredTargetId] = useState<string | null>(null);

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

  const activeTargetId = hoveredTargetId ?? selectedTargetId;
  const activeTarget = targetsWithCurves.find((t) => t.id === activeTargetId);

  return (
    <div className="glass-panel rounded-2xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>📈</span> Celestial Altitude Progression (Dusk to Dawn)
        </h2>
        <span className="text-xs text-slate-400">
          Hover or click any curve or legend pill to highlight line trajectory
        </span>
      </div>

      {/* Target Legend Pills */}
      <div className="flex flex-wrap gap-2 pt-1">
        {targetsWithCurves.map((t) => {
          const color = TARGET_COLORS[t.id] ?? '#94a3b8';
          const isHighlighted = activeTargetId === t.id;

          return (
            <button
              key={t.id}
              onClick={() => setSelectedTargetId(selectedTargetId === t.id ? null : t.id)}
              onMouseEnter={() => setHoveredTargetId(t.id)}
              onMouseLeave={() => setHoveredTargetId(null)}
              className={`text-xs px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                isHighlighted
                  ? 'bg-slate-800 border-white text-white shadow-lg scale-105 ring-1 ring-white/40'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full transition-transform ${isHighlighted ? 'scale-125' : ''}`}
                style={{ backgroundColor: color, boxShadow: isHighlighted ? `0 0 8px ${color}` : undefined }}
              />
              <span>{t.name}</span>
            </button>
          );
        })}
      </div>

      {/* Target Info Bar (Fixed height to prevent layout shift & hover flickering) */}
      <div className="h-9 bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 text-xs flex items-center justify-between text-slate-200 transition-colors duration-150">
        {activeTarget ? (
          <>
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: TARGET_COLORS[activeTarget.id] ?? '#94a3b8',
                  boxShadow: `0 0 8px ${TARGET_COLORS[activeTarget.id] ?? '#94a3b8'}`,
                }}
              />
              <span className="font-bold text-white">{activeTarget.name}</span>
              <span className="text-slate-400">({activeTarget.constellation || activeTarget.type})</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300 font-mono">
              <span>Alt: <strong>{activeTarget.altitude}°</strong></span>
              <span>Mag: <strong>{activeTarget.magnitude}</strong></span>
              <span className="text-cyan-300">{activeTarget.isOptimal ? '★ Optimal View' : activeTarget.notes || ''}</span>
            </div>
          </>
        ) : (
          <div className="text-slate-500 text-xs flex items-center gap-2 w-full justify-center font-mono">
            <span>✨</span>
            <span>Hover or click any line or legend pill to inspect celestial altitude & stats</span>
          </div>
        )}
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
              const isHighlighted = activeTargetId === t.id;
              const isDimmed = activeTargetId !== null && !isHighlighted;
              const points = t.altitudeHistory ?? [];

              const pathData = points
                .map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(pt.altitude)}`)
                .join(' ');

              return (
                <g
                  key={t.id}
                  opacity={isDimmed ? 0.15 : 1.0}
                  className="transition-all duration-200"
                  onMouseEnter={() => setHoveredTargetId(t.id)}
                  onMouseLeave={() => setHoveredTargetId(null)}
                >
                  {/* Invisible wide hit-area stroke for effortless mouse hover */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="16"
                    strokeLinecap="round"
                    className="cursor-pointer"
                  />
                  {/* Glowing visible target curve */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke={color}
                    strokeWidth={isHighlighted ? '4' : '2'}
                    strokeLinecap="round"
                    className="pointer-events-none transition-all duration-200"
                    style={{
                      filter: isHighlighted ? `drop-shadow(0 0 6px ${color})` : undefined,
                    }}
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
