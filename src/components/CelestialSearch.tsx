'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { SearchableCelestialTarget } from '@/lib/types/astro';

interface CelestialSearchProps {
  targets?: SearchableCelestialTarget[];
}

type FilterCategory = 'all' | 'planet' | 'messier' | 'caldwell' | 'galaxy' | 'nebula' | 'cluster' | 'star' | 'constellation';
type DayFilter = 'all' | 'night_twilight' | 'daytime';
type OpticsFilter = 'all' | 'binoculars' | 'telescope';
type SortOption = 'chronological' | 'altitude' | 'magnitude' | 'name';

export function CelestialSearch({ targets = [] }: CelestialSearchProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [opticsFilter, setOpticsFilter] = useState<OpticsFilter>('all');
  const [maxMag, setMaxMag] = useState<number>(15);
  const [dayFilter, setDayFilter] = useState<DayFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('chronological');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState<number>(24);

  // Category filter pills configuration
  const categoryOptions: { id: FilterCategory; label: string; icon: string }[] = [
    { id: 'all', label: 'All Bodies', icon: '🌌' },
    { id: 'planet', label: 'Planets', icon: '🪐' },
    { id: 'messier', label: 'Messier (110)', icon: '🔭' },
    { id: 'caldwell', label: 'Caldwell (109)', icon: '💎' },
    { id: 'galaxy', label: 'Galaxies', icon: '🌀' },
    { id: 'nebula', label: 'Nebulae', icon: '☁️' },
    { id: 'cluster', label: 'Star Clusters', icon: '✨' },
    { id: 'star', label: 'Stars', icon: '⭐' },
    { id: 'constellation', label: 'Constellations', icon: '🗺️' },
  ];

  // Filtering & sorting logic
  const filteredTargets = useMemo(() => {
    return targets
      .filter((t) => {
        // 1. Text search query match (name, constellation, description, ngc, notes, catalog)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = t.name.toLowerCase().includes(q);
          const matchConst = t.constellation.toLowerCase().includes(q);
          const matchDesc = t.description.toLowerCase().includes(q);
          const matchNgc = t.ngc ? t.ngc.toLowerCase().includes(q) : false;
          const matchNotes = t.notes ? t.notes.toLowerCase().includes(q) : false;
          const matchCatalog = t.catalog ? t.catalog.toLowerCase().includes(q) : false;
          if (!matchName && !matchConst && !matchDesc && !matchNgc && !matchNotes && !matchCatalog) {
            return false;
          }
        }

        // 2. Category filter
        if (selectedCategory !== 'all') {
          if (selectedCategory === 'planet' && t.type !== 'planet') return false;
          if (selectedCategory === 'star' && t.type !== 'star') return false;
          if (selectedCategory === 'constellation' && t.type !== 'constellation') return false;
          if (selectedCategory === 'messier' && t.catalog !== 'messier') return false;
          if (selectedCategory === 'caldwell' && t.catalog !== 'caldwell') return false;
          if (selectedCategory === 'galaxy' && t.dsoType !== 'galaxy') return false;
          if (
            selectedCategory === 'nebula' &&
            !(
              t.dsoType === 'diffuse_nebula' ||
              t.dsoType === 'planetary_nebula' ||
              t.dsoType === 'supernova_remnant' ||
              t.dsoType === 'dark_nebula'
            )
          ) {
            return false;
          }
          if (
            selectedCategory === 'cluster' &&
            !(t.dsoType === 'open_cluster' || t.dsoType === 'globular_cluster' || t.dsoType === 'asterism')
          ) {
            return false;
          }
        }

        // 3. Optics filter
        if (opticsFilter === 'binoculars') {
          const isBinocFriendly =
            t.opticsRequirement === 'naked_eye' ||
            t.opticsRequirement === 'binoculars' ||
            t.magnitude <= 6.5;
          if (!isBinocFriendly) return false;
        } else if (opticsFilter === 'telescope') {
          const isTelescopeReq =
            t.opticsRequirement === 'small_telescope' ||
            t.opticsRequirement === 'large_telescope' ||
            t.magnitude > 6.5;
          if (!isTelescopeReq) return false;
        }

        // 4. Magnitude threshold
        if (t.magnitude > maxMag) {
          return false;
        }

        // 5. Day / Night visibility filter
        if (dayFilter === 'night_twilight') {
          if (t.window.daytimeCategory === 'daytime' && !t.window.isDaytimeVisible) {
            return false;
          }
        } else if (dayFilter === 'daytime') {
          if (t.window.daytimeCategory !== 'daytime') {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'chronological') {
          return new Date(a.window.peakTime).getTime() - new Date(b.window.peakTime).getTime();
        } else if (sortOption === 'altitude') {
          return b.window.peakAltitudeDeg - a.window.peakAltitudeDeg;
        } else if (sortOption === 'magnitude') {
          return a.magnitude - b.magnitude;
        } else {
          return a.name.localeCompare(b.name);
        }
      });
  }, [targets, searchQuery, selectedCategory, opticsFilter, maxMag, dayFilter, sortOption]);

  if (!targets || targets.length === 0) return null;

  const visibleTargets = filteredTargets.slice(0, displayCount);

  return (
    <section className="space-y-4">
      {/* Section Title & Header (Clickable Collapsible Bar) */}
      <div
        onClick={() => setIsCollapsed((prev) => !prev)}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl glass-panel glass-panel-hover border border-slate-800 cursor-pointer select-none transition-all"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsCollapsed((prev) => !prev);
          }
        }}
        aria-expanded={!isCollapsed}
      >
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center text-sm font-bold">
            🔍
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              Celestial Body Explorer & Culmination Search
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isCollapsed
                ? 'Click to expand full 250+ catalog (Messier, Caldwell, Planets, Stars, Constellations) with peak times'
                : 'Search 250+ celestial targets, track peak culmination times, and filter by optics and category.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-cyan-300">
            {filteredTargets.length} {filteredTargets.length === 1 ? 'target' : 'targets'} available
          </span>
          <div className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center text-xs text-slate-300 hover:text-white transition-transform">
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Collapsible Content */}
      {!isCollapsed && (
        <div className="space-y-4 animate-fadeIn">
          {/* Main Control Panel (Search Bar + Filters) */}
          <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-4 border border-slate-800/80">
            {/* Search Input Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setDisplayCount(24);
                }}
                placeholder="Search by name, catalog or NGC (e.g. Cat's Eye, Pluto, M31, M42, C6, NGC 6543, Whirlpool, Orion)..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="space-y-2 pt-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-slate-400 font-medium mr-1">Category:</span>
                {categoryOptions.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setDisplayCount(24);
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer border ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-200 shadow-sm shadow-cyan-500/10'
                          : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Secondary Controls Row (Optics, Skies, Sorting) */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
              {/* Optics Filter */}
              <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium px-2">Optics:</span>
                <button
                  onClick={() => {
                    setOpticsFilter('all');
                    setDisplayCount(24);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    opticsFilter === 'all'
                      ? 'bg-cyan-500/20 text-cyan-200 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All Optics
                </button>
                <button
                  onClick={() => {
                    setOpticsFilter('binoculars');
                    setDisplayCount(24);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                    opticsFilter === 'binoculars'
                      ? 'bg-emerald-500/20 text-emerald-200 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>👀</span> Naked Eye & Binoculars
                </button>
                <button
                  onClick={() => {
                    setOpticsFilter('telescope');
                    setDisplayCount(24);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                    opticsFilter === 'telescope'
                      ? 'bg-indigo-500/20 text-indigo-200 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>🔭</span> Telescope
                </button>
              </div>

              {/* Day/Night Visibility and Sort Dropdown */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => {
                      setDayFilter('all');
                      setDisplayCount(24);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      dayFilter === 'all'
                        ? 'bg-cyan-500/20 text-cyan-200 font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    All Skies
                  </button>
                  <button
                    onClick={() => {
                      setDayFilter('night_twilight');
                      setDisplayCount(24);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                      dayFilter === 'night_twilight'
                        ? 'bg-indigo-500/25 text-indigo-200 font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>🌙</span> Night
                  </button>
                  <button
                    onClick={() => {
                      setDayFilter('daytime');
                      setDisplayCount(24);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                      dayFilter === 'daytime'
                        ? 'bg-amber-500/25 text-amber-200 font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>☀️</span> Day
                  </button>
                </div>

                {/* Sort Selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400 font-medium hidden sm:inline">Sort:</span>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    className="bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-slate-200 px-3 py-1.5 focus:outline-none focus:border-cyan-500 font-sans cursor-pointer"
                  >
                    <option value="chronological">⏰ Chronological (Peak Hour)</option>
                    <option value="altitude">📐 Highest Peak Altitude</option>
                    <option value="magnitude">✨ Brightest (Magnitude)</option>
                    <option value="name">🔤 Name (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Magnitude Slider Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/40 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <span>Magnitude Limit:</span>
                <span className="font-mono text-cyan-300 font-semibold">
                  {maxMag >= 14 ? 'All Magnitudes (≤ +15 / Pluto)' : `Brighter than +${maxMag.toFixed(1)} mag`}
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-64">
                <span className="text-[10px] text-slate-500 font-mono">-2</span>
                <input
                  type="range"
                  min="-2"
                  max="15"
                  step="0.5"
                  value={maxMag}
                  onChange={(e) => {
                    setMaxMag(parseFloat(e.target.value));
                    setDisplayCount(24);
                  }}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                />
                <span className="text-[10px] text-slate-500 font-mono">+15</span>
              </div>
            </div>
          </div>

          {/* Results List / Grid */}
          {filteredTargets.length === 0 ? (
            <div className="glass-panel rounded-2xl p-8 text-center space-y-2">
              <div className="text-3xl">🔭</div>
              <h3 className="font-bold text-white text-sm">No Celestial Bodies Match Your Criteria</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try adjusting your search query, selecting &quot;All Bodies&quot;, or increasing the magnitude limit.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {visibleTargets.map((target) => {
                  const win = target.window;
                  const peakDateObj = new Date(win.peakTime);
                  const peakHourStr = format(peakDateObj, 'HH:mm');
                  const riseStr = win.riseTime ? format(new Date(win.riseTime), 'HH:mm') : null;
                  const setStr = win.setTime ? format(new Date(win.setTime), 'HH:mm') : null;
                  const isExpanded = expandedId === target.id;

                  // Day / Night Category Badges
                  const isDay = win.daytimeCategory === 'daytime';
                  const isTwilight = win.daytimeCategory === 'twilight';
                  const isNight = win.daytimeCategory === 'night';
                  const isPrimeAlt = win.peakAltitudeDeg >= 30;

                  return (
                    <div
                      key={target.id}
                      className={`glass-panel glass-panel-hover rounded-2xl p-4 flex flex-col justify-between transition-all border ${
                        isNight && isPrimeAlt
                          ? 'border-indigo-500/40 glow-border-cyan'
                          : isTwilight
                          ? 'border-amber-700/40 bg-slate-950/60'
                          : isDay
                          ? 'border-orange-900/30 bg-slate-950/40'
                          : 'border-slate-800'
                      }`}
                    >
                      <div>
                        {/* Top Header: Icon, Name, Constellation, Badges */}
                        <div className="flex items-start justify-between gap-2 mb-2.5">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl">
                              {target.type === 'planet'
                                ? '🪐'
                                : target.catalog === 'messier'
                                ? '🔭'
                                : target.catalog === 'caldwell'
                                ? '💎'
                                : target.dsoType === 'galaxy'
                                ? '🌀'
                                : target.dsoType === 'diffuse_nebula' || target.dsoType === 'planetary_nebula'
                                ? '☁️'
                                : target.type === 'star'
                                ? '⭐'
                                : target.type === 'constellation'
                                ? '✨'
                                : target.type === 'moon'
                                ? '🌕'
                                : '🌀'}
                            </span>
                            <div>
                              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                                {target.name}
                              </h3>
                              <p className="text-[11px] text-slate-400 font-mono">
                                {target.constellation} • Mag {target.magnitude > 0 ? `+${target.magnitude}` : target.magnitude}
                                {target.ngc ? ` • ${target.ngc}` : ''}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            {target.catalog === 'messier' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-indigo-200">
                                Messier
                              </span>
                            )}
                            {target.catalog === 'caldwell' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-cyan-200">
                                Caldwell
                              </span>
                            )}
                            {target.catalog !== 'messier' && target.catalog !== 'caldwell' && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider bg-slate-900 border border-slate-800 text-slate-400">
                                {target.type}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Culmination Window Highlight Box */}
                        <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 space-y-2 mb-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-slate-400 font-medium">Highest Point in Sky:</span>
                            <span className="text-xs font-bold text-cyan-300 font-mono">
                              {win.dayLabel} at {peakHourStr}
                            </span>
                          </div>

                          {/* Peak Metrics Row */}
                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-900 text-xs">
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase block font-mono">Peak Altitude</span>
                              <span className={`font-bold font-mono ${isPrimeAlt ? 'text-cyan-300' : 'text-slate-200'}`}>
                                {win.peakAltitudeDeg}° ({win.azimuthDirection})
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase block font-mono">Sky Status</span>
                              <span className="text-[11px] font-medium flex items-center gap-1">
                                {isNight ? (
                                  <span className="text-indigo-300">🌙 Dark Sky</span>
                                ) : isTwilight ? (
                                  <span className="text-amber-300">🌅 Twilight</span>
                                ) : win.isDaytimeVisible ? (
                                  <span className="text-emerald-300 font-semibold">☀️ Day Visible</span>
                                ) : (
                                  <span className="text-amber-400/90 text-[10px]">☀️ Daytime Peak</span>
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Day Warning Banner if washed out by sun */}
                          {isDay && !win.isDaytimeVisible && (
                            <div className="bg-amber-950/40 border border-amber-800/40 rounded-lg px-2.5 py-1 text-[11px] text-amber-200/90 flex items-center gap-1.5">
                              <span>☀️</span>
                              <span>Peaks during daylight (hidden by solar glare)</span>
                            </div>
                          )}
                        </div>

                        {/* Rise / Peak / Set Timeline Bar */}
                        <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800/60 mb-3">
                          <div className="text-[10px] uppercase font-mono text-slate-400 mb-1.5 flex items-center justify-between">
                            <span>Visibility Window</span>
                            <span className="text-slate-500">24h Cycle</span>
                          </div>

                          <div className="grid grid-cols-3 gap-1 text-center font-mono text-xs">
                            <div className="bg-slate-950/70 rounded-lg py-1 px-1.5">
                              <span className="text-[9px] text-slate-500 block uppercase">Rise</span>
                              <span className="text-slate-300">{riseStr || '—'}</span>
                            </div>
                            <div className="bg-cyan-950/50 border border-cyan-800/50 rounded-lg py-1 px-1.5">
                              <span className="text-[9px] text-cyan-400 block uppercase font-bold">Highest</span>
                              <span className="text-cyan-200 font-bold">{peakHourStr}</span>
                            </div>
                            <div className="bg-slate-950/70 rounded-lg py-1 px-1.5">
                              <span className="text-[9px] text-slate-500 block uppercase">Set</span>
                              <span className="text-slate-300">{setStr || '—'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Description & Observation Tips */}
                        {isExpanded && (
                          <div className="space-y-2 pt-2 border-t border-slate-800/70 text-xs text-slate-300 animate-fadeIn">
                            <p className="leading-relaxed text-slate-300">{target.description}</p>
                            {target.opticsRequirement && (
                              <p className="text-[11px] text-emerald-300/90 bg-emerald-950/30 p-2 rounded-lg border border-emerald-800/30 font-mono">
                                🔭 <span className="font-semibold">Equipment:</span>{' '}
                                {target.opticsRequirement === 'naked_eye'
                                  ? 'Naked Eye Observable'
                                  : target.opticsRequirement === 'binoculars'
                                  ? 'Binoculars Recommended (7x50 / 10x50)'
                                  : target.opticsRequirement === 'small_telescope'
                                  ? 'Small Telescope (70mm–100mm / 3"–4")'
                                  : 'Medium to Large Telescope (6"+ / 150mm+)'}
                              </p>
                            )}
                            {target.notes && (
                              <p className="text-[11px] text-cyan-300/80 bg-cyan-950/30 p-2 rounded-lg border border-cyan-800/30">
                                💡 <span className="font-semibold text-cyan-200">Observing Tip:</span> {target.notes}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Card Footer: Expand / Details Button */}
                      <div className="pt-2 border-t border-slate-800/50 flex items-center justify-between text-xs">
                        <span className="text-[11px] font-mono text-slate-400">
                          {target.isAboveHorizon ? '🟢 Above Horizon Now' : '⚪ Below Horizon Now'}
                        </span>

                        <button
                          onClick={() => setExpandedId(isExpanded ? null : target.id)}
                          className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer flex items-center gap-1 text-[11px]"
                        >
                          <span>{isExpanded ? 'Less Info' : 'Details'}</span>
                          <span>{isExpanded ? '▲' : '▼'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination / Load More Bar */}
              {filteredTargets.length > displayCount && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                  <button
                    onClick={() => setDisplayCount((prev) => prev + 24)}
                    className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all shadow-md cursor-pointer"
                  >
                    Show More ({visibleTargets.length} of {filteredTargets.length} targets)
                  </button>
                  <button
                    onClick={() => setDisplayCount(filteredTargets.length)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs transition-all border border-slate-800 cursor-pointer"
                  >
                    Show All ({filteredTargets.length})
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
