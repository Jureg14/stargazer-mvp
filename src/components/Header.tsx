'use client';

import { BortleClass } from '@/lib/types/astro';
import { BortleSelector } from './BortleSelector';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface HeaderProps {
  date: string;
  onDateChange: (date: string) => void;
  bortle: BortleClass;
  onBortleChange: (bortle: BortleClass) => void;
}

export function Header({ date, onDateChange, bortle, onBortleChange }: HeaderProps) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="border-b border-indigo-950/60 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-3">
          <span className="text-2xl select-none">🌌</span>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                {t.header.title} <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">v2</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">{t.header.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Language Selector Toggle */}
          <div className="flex items-center bg-slate-900/90 border border-slate-700/80 rounded-xl p-0.5">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                language === 'en'
                  ? 'bg-indigo-600/60 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="English"
            >
              <span>🇺🇸</span>
              <span className="hidden sm:inline">EN</span>
            </button>
            <button
              onClick={() => setLanguage('pt')}
              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                language === 'pt'
                  ? 'bg-indigo-600/60 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Português (Brasil)"
            >
              <span>🇧🇷</span>
              <span className="hidden sm:inline">PT</span>
            </button>
          </div>

          {/* Bortle Light Pollution Selector */}
          <BortleSelector currentBortle={bortle} onChange={onBortleChange} />

          {/* Date Picker */}
          <div className="relative flex items-center">
            <input
              id="date-picker"
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              className="bg-slate-900/90 border border-slate-700/80 text-xs sm:text-sm text-slate-200 px-2.5 sm:px-3 py-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all font-mono"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

