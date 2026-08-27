'use client';

interface HeaderProps {
  date: string;
  onDateChange: (date: string) => void;
}

export function Header({ date, onDateChange }: HeaderProps) {
  return (
    <header className="border-b border-indigo-950/60 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl select-none">🌌</span>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                Stargazer <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">MVP</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Intelligent Stargazing & Ephemeris Itinerary</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative flex items-center">
            <label htmlFor="date-picker" className="text-xs text-slate-400 mr-2 hidden sm:inline-block">Target Night:</label>
            <input
              id="date-picker"
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              className="bg-slate-900/90 border border-slate-700/80 text-xs sm:text-sm text-slate-200 px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all font-mono"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
