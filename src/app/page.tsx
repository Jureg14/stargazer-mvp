'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from '@/components/Header';
import { LocationSearch, LocationState } from '@/components/LocationSearch';
import { SkyConditionsHero } from '@/components/SkyConditionsHero';
import { ItineraryTimeline } from '@/components/ItineraryTimeline';
import { HourlyTimelineBar } from '@/components/HourlyTimelineBar';
import { CelestialGrid } from '@/components/CelestialGrid';
import { StargazeItineraryResponse } from '@/lib/types/itinerary';

export default function HomePage() {
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState<LocationState>({
    lat: -23.5505,
    lon: -46.6333,
    name: 'São Paulo, Brazil',
  });
  const [plan, setPlan] = useState<StargazeItineraryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialLoadDone = useRef(false);

  // Fetch stargazing plan when location or date changes
  const fetchPlan = useCallback(async (loc: LocationState, queryDate: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/stargaze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: loc.lat,
          lon: loc.lon,
          date: queryDate,
          locationName: loc.name,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${res.statusText}`);
      }

      const data: StargazeItineraryResponse = await res.json();
      setPlan(data);
    } catch (err: unknown) {
      console.error('Plan retrieval failed:', err);
      setError(err instanceof Error ? err.message : 'Unable to calculate itinerary');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load: try browser geolocation, fallback to default
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const userLoc: LocationState = {
              lat: Math.round(pos.coords.latitude * 10000) / 10000,
              lon: Math.round(pos.coords.longitude * 10000) / 10000,
              name: 'Current Location',
            };
            setLocation(userLoc);
            void fetchPlan(userLoc, date);
          },
          () => {
            // If denied or unavailable, fetch with default location
            void fetchPlan(location, date);
          },
          { timeout: 5000 }
        );
      } else {
        void fetchPlan(location, date);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchPlan, date, location]);

  const handleLocationChange = (newLoc: LocationState) => {
    setLocation(newLoc);
    void fetchPlan(newLoc, date);
  };

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    void fetchPlan(location, newDate);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      <div>
        <Header date={date} onDateChange={handleDateChange} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
          {/* Location Search Bar */}
          <LocationSearch
            location={location}
            onLocationChange={handleLocationChange}
            isLoading={loading}
          />

          {/* Error Banner */}
          {error && (
            <div className="bg-rose-950/70 border border-rose-800 text-rose-200 px-4 py-3 rounded-2xl text-xs sm:text-sm flex items-center justify-between">
              <span>⚠️ {error}</span>
              <button
                onClick={() => void fetchPlan(location, date)}
                className="underline hover:text-white ml-3 font-semibold cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading Indicator Banner */}
          {loading && !plan && (
            <div className="glass-panel rounded-2xl p-12 text-center space-y-3 animate-pulse">
              <div className="text-4xl animate-bounce">🌌</div>
              <h2 className="text-lg font-bold text-white">Analyzing Night Sky Conditions</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Computing planetary positions, lunar glare, twilight thresholds, and cloud models...
              </p>
            </div>
          )}

          {/* Main Stargazing Content */}
          {plan && (
            <>
              {/* Sky Conditions Overview Hero */}
              <SkyConditionsHero
                score={plan.nightQualityScore}
                summary={plan.nightSummary}
                twilight={plan.twilight}
                moon={plan.moon}
                bestWindow={plan.bestWindow}
              />

              {/* Itinerary Timeline Windows */}
              <ItineraryTimeline windows={plan.windows} isLoading={loading} />

              {/* Hourly Sky Breakdown Spectrum */}
              {plan.hourlyTimeline && (
                <HourlyTimelineBar timeline={plan.hourlyTimeline} />
              )}

              {/* Celestial Target Cards */}
              <CelestialGrid targets={plan.targets} />
            </>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© Stargazer — Powered by Open-Meteo & Astronomy Engine</p>
          <div className="flex items-center space-x-4">
            <span>Astronomical Night v1.0</span>
            <span>•</span>
            <span className="text-cyan-400/80">J2000 Ephemeris</span>
          </div>
        </div>
      </footer>
    </div>
  );
}