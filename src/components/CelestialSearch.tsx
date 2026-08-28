'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { CelestialBodyType, SearchableCelestialTarget } from '@/lib/types/astro';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface CelestialSearchProps {
  targets?: SearchableCelestialTarget[];
}

type DayFilter = 'all' | 'night_twilight' | 'daytime';
type SortOption = 'chronological' | 'altitude' | 'magnitude' | 'name';

export function CelestialSearch({ targets = [] }: CelestialSearchProps) {
  const { language, t } = useLanguage();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<CelestialBodyType | 'all'>('all');
  const [maxMag, setMaxMag] = useState<number>(10);
  const [dayFilter, setDayFilter] = useState<DayFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('chronological');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Type filter pills configuration
  const typeOptions: { id: CelestialBodyType | 'all'; label: string; icon: string }[] = [
    { id: 'all', label: t.celestialSearch.all, icon: '🌌' },
    { id: 'planet', label: t.celestialSearch.planets, icon: '🪐' },
    { id: 'star', label: language === 'pt' ? 'Estrelas' : 'Stars', icon: '⭐' },
    { id: 'constellation', label: language === 'pt' ? 'Constelações' : 'Constellations', icon: '✨' },
    { id: 'dso', label: t.celestialSearch.dso, icon: '🌀' },
    { id: 'moon', label: t.celestialSearch.moon, icon: '🌕' },
  ];

  // Filtering & sorting logic
  const filteredTargets = useMemo(() => {
    return targets
      .filter((t) => {
        // 1. Text search query match
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = t.name.toLowerCase().includes(q);
          const matchConst = t.constellation.toLowerCase().includes(q);
          const matchDesc = t.description.toLowerCase().includes(q);
          if (!matchName && !matchConst && !matchDesc) return false;
        }

        // 2. Type filter
        if (selectedType !== 'all' && t.type !== selectedType) {
          return false;
        }

        // 3. Magnitude threshold
        if (t.magnitude > maxMag) {
          return false;
        }

        // 4. Day / Night visibility filter
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
  }, [targets, searchQuery, selectedType, maxMag, dayFilter, sortOption]);

  if (!targets || targets.length === 0) return null;

  return (
    <section className="space-y-4">
      {/* Section Title & Header */}
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
              {language === 'pt' ? 'Busca e Culminação de Astros Celestiais' : 'Celestial Body Search & Culmination Explorer'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isCollapsed
                ? (language === 'pt' ? 'Clique para expandir filtros e horários de altitude máxima' : 'Click to expand search, filters, and peak elevation visibility windows')
                : (language === 'pt' ? 'Busque corpos celestes e acompanhe quando atingem o ponto mais alto no céu.' : 'Search celestial bodies and track when they reach their highest point in the sky across day & night.')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-cyan-300">
            {filteredTargets.length} {language === 'pt' ? 'astro(s)' : (filteredTargets.length === 1 ? 'body' : 'bodies')}
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
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.celestialSearch.searchPlaceholder}
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

        {/* Filter Controls Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1 border-t border-slate-800/60">
          {/* Type Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium mr-1">{language === 'pt' ? 'Tipo:' : 'Type:'}</span>
            {typeOptions.map((t) => {
              const isSelected = selectedType === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-200 shadow-sm shadow-cyan-500/10'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Visibility & Sort Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Day/Night Visibility Toggle */}
            <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setDayFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  dayFilter === 'all'
                    ? 'bg-cyan-500/20 text-cyan-200 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {language === 'pt' ? 'Todo o Céu' : 'All Skies'}
              </button>
              <button
                onClick={() => setDayFilter('night_twilight')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                  dayFilter === 'night_twilight'
                    ? 'bg-indigo-500/25 text-indigo-200 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🌙</span> {language === 'pt' ? 'Noite e Crepúsculo' : 'Night & Twilight'}
              </button>
              <button
                onClick={() => setDayFilter('daytime')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                  dayFilter === 'daytime'
                    ? 'bg-amber-500/25 text-amber-200 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>☀️</span> {language === 'pt' ? 'Diurno' : 'Daytime'}
              </button>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">{language === 'pt' ? 'Ordem:' : 'Sort:'}</span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-slate-200 px-3 py-1.5 focus:outline-none focus:border-cyan-500 font-sans cursor-pointer"
              >
                <option value="chronological">{language === 'pt' ? '⏰ Cronológica (Horário Pico)' : '⏰ Chronological (Peak Hour)'}</option>
                <option value="altitude">{language === 'pt' ? '📐 Maior Altitude de Pico' : '📐 Highest Peak Altitude'}</option>
                <option value="magnitude">{language === 'pt' ? '✨ Brilho (Magnitude)' : '✨ Brightest (Magnitude)'}</option>
                <option value="name">{language === 'pt' ? '🔤 Nome (A-Z)' : '🔤 Name (A-Z)'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Magnitude Slider Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/40 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span>{language === 'pt' ? 'Limite de Magnitude:' : 'Magnitude Limit:'}</span>
            <span className="font-mono text-cyan-300 font-semibold">
              {maxMag === 10
                ? (language === 'pt' ? 'Todas as Magnitudes (≤ +10)' : 'All Magnitudes (≤ +10)')
                : (language === 'pt' ? `Mais brilhantes que +${maxMag.toFixed(1)} mag` : `Brighter than +${maxMag.toFixed(1)} mag`)}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-64">
            <span className="text-[10px] text-slate-500 font-mono">-2</span>
            <input
              type="range"
              min="-2"
              max="10"
              step="0.5"
              value={maxMag}
              onChange={(e) => setMaxMag(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
            />
            <span className="text-[10px] text-slate-500 font-mono">+10</span>
          </div>
        </div>
      </div>

      {/* Results List / Grid */}
      {filteredTargets.length === 0 ? (
        <div className="glass-panel rounded-2xl p-8 text-center space-y-2">
          <div className="text-3xl">🔭</div>
          <h3 className="font-bold text-white text-sm">{t.celestialSearch.noResults}</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredTargets.map((target) => {
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
                  {/* Top Header: Icon, Name, Constellation, Type Badge */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">
                        {target.type === 'planet'
                          ? '🪐'
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
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider bg-slate-900 border border-slate-800 text-slate-400">
                      {target.type}
                    </span>
                  </div>

                  {/* Culmination Window Highlight Box */}
                  <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 space-y-2 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-medium">{language === 'pt' ? 'Ponto Mais Alto no Céu:' : 'Highest Point in Sky:'}</span>
                      <span className="text-xs font-bold text-cyan-300 font-mono">
                        {win.dayLabel} {language === 'pt' ? 'às' : 'at'} {peakHourStr}
                      </span>
                    </div>

                    {/* Peak Metrics Row */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-900 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block font-mono">{language === 'pt' ? 'Altitude Máx' : 'Peak Altitude'}</span>
                        <span className={`font-bold font-mono ${isPrimeAlt ? 'text-cyan-300' : 'text-slate-200'}`}>
                          {win.peakAltitudeDeg}° ({win.azimuthDirection})
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block font-mono">{language === 'pt' ? 'Status do Céu' : 'Sky Status'}</span>
                        <span className="text-[11px] font-medium flex items-center gap-1">
                          {isNight ? (
                            <span className="text-indigo-300">🌙 {language === 'pt' ? 'Céu Escuro' : 'Dark Sky'}</span>
                          ) : isTwilight ? (
                            <span className="text-amber-300">🌅 {language === 'pt' ? 'Crepúsculo' : 'Twilight'}</span>
                          ) : win.isDaytimeVisible ? (
                            <span className="text-emerald-300 font-semibold">☀️ {language === 'pt' ? 'Visível de Dia' : 'Day Visible'}</span>
                          ) : (
                            <span className="text-amber-400/90 text-[10px]">☀️ {language === 'pt' ? 'Pico Diurno' : 'Daytime Peak'}</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rise / Peak / Set Timeline Bar */}
                  <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800/60 mb-3">
                    <div className="text-[10px] uppercase font-mono text-slate-400 mb-1.5 flex items-center justify-between">
                      <span>{language === 'pt' ? 'Janela de Visibilidade' : 'Visibility Window'}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 text-center font-mono text-xs">
                      <div className="bg-slate-950/70 rounded-lg py-1 px-1.5">
                        <span className="text-[9px] text-slate-500 block uppercase">{language === 'pt' ? 'Nascer' : 'Rise'}</span>
                        <span className="text-slate-300">{riseStr || '—'}</span>
                      </div>
                      <div className="bg-cyan-950/50 border border-cyan-800/50 rounded-lg py-1 px-1.5">
                        <span className="text-[9px] text-cyan-400 block uppercase font-bold">{language === 'pt' ? 'Pico' : 'Highest'}</span>
                        <span className="text-cyan-200 font-bold">{peakHourStr}</span>
                      </div>
                      <div className="bg-slate-950/70 rounded-lg py-1 px-1.5">
                        <span className="text-[9px] text-slate-500 block uppercase">{language === 'pt' ? 'Pôr' : 'Set'}</span>
                        <span className="text-slate-300">{setStr || '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description & Observation Tips */}
                  {isExpanded && (
                    <div className="space-y-2 pt-2 border-t border-slate-800/70 text-xs text-slate-300 animate-fadeIn">
                      <p className="leading-relaxed text-slate-300">{target.description}</p>
                      {target.notes && (
                        <p className="text-[11px] text-cyan-300/80 bg-cyan-950/30 p-2 rounded-lg border border-cyan-800/30">
                          💡 <span className="font-semibold text-cyan-200">{language === 'pt' ? 'Dica de Observação:' : 'Observing Tip:'}</span> {target.notes}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="pt-2 border-t border-slate-800/50 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-slate-400">
                    {target.isAboveHorizon ? (language === 'pt' ? '🟢 Acima do Horizonte' : '🟢 Above Horizon Now') : (language === 'pt' ? '⚪ Abaixo do Horizonte' : '⚪ Below Horizon Now')}
                  </span>

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : target.id)}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer flex items-center gap-1 text-[11px]"
                  >
                    <span>{isExpanded ? (language === 'pt' ? 'Menos Info' : 'Less Info') : (language === 'pt' ? 'Detalhes' : 'Details')}</span>
                    <span>{isExpanded ? '▲' : '▼'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
        </div>
      )}
    </section>
  );
}

