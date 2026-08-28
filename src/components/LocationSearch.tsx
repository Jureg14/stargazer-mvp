'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export interface LocationState {
  lat: number;
  lon: number;
  name: string;
}

interface LocationSearchProps {
  location: LocationState;
  onLocationChange: (loc: LocationState) => void;
  isLoading: boolean;
}

interface GeocodeItem {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}

export function LocationSearch({
  location,
  onLocationChange,
  isLoading,
}: LocationSearchProps) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodeItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search for city geocoding
  useEffect(() => {
    let isMounted = true;
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      const timer = setTimeout(() => {
        if (isMounted) {
          setResults([]);
          setIsSearching(false);
        }
      }, 0);
      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    }

    const timer = setTimeout(async () => {
      if (isMounted) setIsSearching(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(trimmed)}`);
        if (res.ok && isMounted) {
          const data = await res.json();
          setResults(data.results ?? []);
          setIsOpen(true);
        }
      } catch (e) {
        console.error('Geocoding search failed', e);
      } finally {
        if (isMounted) setIsSearching(false);
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUseGeolocation = () => {
    if (!navigator.geolocation) {
      alert(t.location.geoErrorNotSupported);
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        onLocationChange({
          lat: Math.round(pos.coords.latitude * 10000) / 10000,
          lon: Math.round(pos.coords.longitude * 10000) / 10000,
          name: t.location.currentLocationName,
        });
        setQuery('');
      },
      (err) => {
        setIsLocating(false);
        alert(`${t.location.geoErrorPrefix}${err.message}`);
      },
      { timeout: 10000 }
    );
  };

  const selectCity = (city: GeocodeItem) => {
    const displayName = [city.name, city.admin1, city.country].filter(Boolean).join(', ');
    onLocationChange({
      lat: Math.round(city.latitude * 10000) / 10000,
      lon: Math.round(city.longitude * 10000) / 10000,
      name: displayName,
    });
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 relative z-20" ref={dropdownRef}>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Current Location Badge */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-lg">
            📍
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{t.location.observingSite}</span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                {location.lat >= 0 ? `${location.lat}°N` : `${Math.abs(location.lat)}°S`}, {location.lon >= 0 ? `${location.lon}°E` : `${Math.abs(location.lon)}°W`}
              </span>
            </div>
            <p className="text-sm sm:text-base font-semibold text-white truncate max-w-[280px] sm:max-w-md">
              {location.name || t.location.customCoords}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* City Autocomplete Input */}
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder={t.location.searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => results.length > 0 && setIsOpen(true)}
              className="w-full bg-slate-900/90 border border-slate-700/80 text-xs sm:text-sm text-slate-200 px-3.5 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition-all placeholder:text-slate-500"
            />
            {isSearching && (
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 animate-spin">⟳</span>
            )}

            {/* Autocomplete Dropdown Menu */}
            {isOpen && results.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto divide-y divide-slate-800">
                {results.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => selectCity(r)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-indigo-950/60 transition-colors flex items-center justify-between group text-xs sm:text-sm cursor-pointer"
                  >
                    <div>
                      <p className="font-medium text-slate-200 group-hover:text-cyan-300">
                        {r.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {[r.admin1, r.country].filter(Boolean).join(', ')}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      {Math.round(r.latitude)}°, {Math.round(r.longitude)}°
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Use My Location Button */}
          <button
            onClick={handleUseGeolocation}
            disabled={isLocating || isLoading}
            title={t.location.myLocation}
            className="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/40 text-indigo-200 hover:text-white text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50 active:scale-95 cursor-pointer"
          >
            <span>{isLocating ? '📡' : '🎯'}</span>
            <span className="hidden sm:inline">{isLocating ? t.location.locating : t.location.myLocation}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

