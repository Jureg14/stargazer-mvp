'use client';

import { BortleClass } from '@/lib/types/astro';
import { TelescopeProfile } from '@/lib/types/equipment';
import { BortleSelector } from './BortleSelector';

interface HeaderProps {
  date: string;
  onDateChange: (date: string) => void;
  bortle: BortleClass;
  onBortleChange: (bortle: BortleClass) => void;
  telescopeProfile?: TelescopeProfile;
  onOpenTelescopeModal?: () => void;
}

export function Header({
  date,
  onDateChange,
  bortle,
  onBortleChange,
  telescopeProfile,
  onOpenTelescopeModal,
}: HeaderProps) {
  return (
    <header className="border-b border-indigo-950/60 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-3">
          <span className="text-2xl select-none">🌌</span>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                Stargazer <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">v2</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Intelligent Ephemeris, ISS & Meteor Planner</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Telescope Optics Profile Button */}
          {onOpenTelescopeModal && (
            <button
              type="button"
              onClick={onOpenTelescopeModal}
              title="Configure your telescope and eyepieces"
              className={`text-xs px-2.5 sm:px-3 py-1.5 rounded-xl border font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                telescopeProfile?.enabled
                  ? 'bg-indigo-950/70 border-indigo-600/60 text-indigo-200 hover:border-indigo-400 hover:text-white shadow-sm'
                  : 'bg-slate-900/90 border-slate-700/80 text-slate-400 hover:text-slate-200 hover:border-slate-600'
              }`}
            >
              <span>🔭</span>
              <span className="hidden md:inline font-sans font-medium">
                {telescopeProfile?.enabled
                  ? `${telescopeProfile.apertureMm}mm (f/${(telescopeProfile.focalLengthMm / telescopeProfile.apertureMm).toFixed(1)})`
                  : 'Setup Telescope'}
              </span>
            </button>
          )}

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
