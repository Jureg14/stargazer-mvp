'use client';

import { MeteorShower } from '@/lib/types/astro';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface MeteorShowersProps {
  showers: MeteorShower[];
}

export function MeteorShowers({ showers }: MeteorShowersProps) {
  const { language, t } = useLanguage();

  if (showers.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>🌠</span> {t.meteors.title}
        </h2>
        <span className="text-xs font-mono text-amber-300">
          {showers.length} {language === 'pt' ? 'chuva(s) no alcance' : (showers.length === 1 ? 'shower' : 'showers') + ' in range'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {showers.map((s) => (
          <div
            key={s.id}
            className={`glass-panel glass-panel-hover rounded-2xl p-4 flex flex-col justify-between ${
              s.isPeakNight
                ? 'border-amber-500/50 glow-border-amber'
                : 'border-slate-800'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    {s.name}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {t.meteors.radiant}: {s.radiantConstellation} ({s.parentBody})
                  </p>
                </div>

                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    s.isPeakNight
                      ? 'bg-amber-950/70 border-amber-800 text-amber-300 animate-pulse'
                      : s.status === 'Incoming'
                      ? 'bg-indigo-950/70 border-indigo-800 text-indigo-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {s.isPeakNight ? (language === 'pt' ? '🔥 Pico Hoje' : '🔥 Peak Tonight') : s.status}
                </span>
              </div>

              <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/80 mb-3 text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>{language === 'pt' ? 'Janela de Pico:' : 'Peak Window:'}</span>
                  <span className="font-mono text-slate-200">{s.peakDate}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>{language === 'pt' ? 'Período Ativo:' : 'Active Range:'}</span>
                  <span className="font-mono text-slate-300 text-[11px]">{s.activeRange}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
              <div className="bg-slate-900/80 rounded-lg p-1.5 text-center">
                <span className="text-slate-500 block text-[10px] uppercase">ZHR Nominal</span>
                <span className="font-bold text-slate-200">{s.nominalZhr}</span>
              </div>
              <div className="bg-slate-900/80 rounded-lg p-1.5 text-center">
                <span className="text-slate-500 block text-[10px] uppercase">{language === 'pt' ? 'Previsto/h' : 'Expected/hr'}</span>
                <span className={`font-bold ${s.effectiveZhr >= 20 ? 'text-amber-300' : 'text-slate-200'}`}>
                  ~{s.effectiveZhr}
                </span>
              </div>
              <div className="bg-slate-900/80 rounded-lg p-1.5 text-center">
                <span className="text-slate-500 block text-[10px] uppercase">{language === 'pt' ? 'Alt Radiante' : 'Radiant Alt'}</span>
                <span className="font-bold text-cyan-300">{s.radiantAltitude}°</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

