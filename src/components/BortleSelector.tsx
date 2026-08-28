'use client';

import { useState, useRef, useEffect } from 'react';
import { BortleClass } from '@/lib/types/astro';
import { BORTLE_CLASSES } from '@/lib/astro/bortle';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface BortleSelectorProps {
  currentBortle: BortleClass;
  onChange: (bortle: BortleClass) => void;
}

export function BortleSelector({ currentBortle, onChange }: BortleSelectorProps) {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentInfo = BORTLE_CLASSES[currentBortle] ?? BORTLE_CLASSES[4];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getLocalizedBortle = (classNum: BortleClass) => {
    const key = `class${classNum}` as keyof typeof t.bortle;
    return t.bortle[key] ?? { name: BORTLE_CLASSES[classNum].title, desc: BORTLE_CLASSES[classNum].description };
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-200 transition-all cursor-pointer"
        title={language === 'pt' ? 'Alterar nível de poluição luminosa (Classe Bortle 1–9)' : 'Change light pollution level (Bortle Class 1–9)'}
      >
        <span className="w-2 h-2 rounded-full" style={{
          backgroundColor: currentBortle <= 3 ? '#34d399' : currentBortle <= 5 ? '#fbbf24' : '#f87171'
        }} />
        <span>Bortle {currentBortle}</span>
        <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">(NELM {currentInfo.nelm})</span>
        <span className="text-[10px] text-slate-400">▾</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 p-2 space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
            {language === 'pt' ? 'Selecione a Poluição Luminosa' : 'Select Light Pollution Level'}
          </div>
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/50">
            {Object.values(BORTLE_CLASSES).map((b) => {
              const loc = getLocalizedBortle(b.classNumber);
              return (
                <button
                  key={b.classNumber}
                  onClick={() => {
                    onChange(b.classNumber);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl transition-colors flex items-start gap-2.5 cursor-pointer ${
                    currentBortle === b.classNumber ? 'bg-indigo-950/80 text-cyan-300' : 'hover:bg-slate-800/60 text-slate-200'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full mt-1 shrink-0"
                    style={{
                      backgroundColor:
                        b.classNumber <= 3 ? '#34d399' : b.classNumber <= 5 ? '#fbbf24' : '#f87171',
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>{loc.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">NELM {b.nelm}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{loc.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

