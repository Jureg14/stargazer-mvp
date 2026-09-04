'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import { Header } from '@/components/Header';
import { LocationSearch, LocationState } from '@/components/LocationSearch';
import { SkyConditionsHero } from '@/components/SkyConditionsHero';
import { CelestialSearch } from '@/components/CelestialSearch';
import { TonightBestTargets } from '@/components/TonightBestTargets';
import { AltitudeChart } from '@/components/AltitudeChart';
import { SatellitePasses } from '@/components/SatellitePasses';
import { MeteorShowers } from '@/components/MeteorShowers';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { BortleClass } from '@/lib/types/astro';
import { StargazeItineraryResponse } from '@/lib/types/itinerary';
import { useTelescopeProfile } from '@/lib/hooks/useTelescopeProfile';
import { TelescopeProfileModal } from '@/components/TelescopeProfileModal';

export default function HomePage() {
  const [date, setDate] = useState<string>(() => {
    const now = new Date();
    // If it's early morning before 05:00, user is in tonight's (yesterday evening's) observing session
    if (now.getHours() < 5) {
      const yesterday = new Date(now.getTime() - 24 * 3600 * 1000);
      return format(yesterday, 'yyyy-MM-dd');
    }
    return format(now, 'yyyy-MM-dd');
  });
  const [bortle, setBortle] = useState<BortleClass>(4);
  const [location, setLocation] = useState<LocationState>({
    lat: -23.5505,
    lon: -46.6333,
    name: 'São Paulo, Brazil',
  });
  const [plan, setPlan] = useState<StargazeItineraryResponse | null>(null);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialLoadDone = useRef(false);

  // Telescope & Equipment Profile state (persisted to localStorage)
  const { profile: telescopeProfile, setProfile: setTelescopeProfile } = useTelescopeProfile();
  const [isTelescopeModalOpen, setIsTelescopeModalOpen] = useState(false);

  // Fetch stargazing plan when location, date, or Bortle changes
  const fetchPlan = useCallback(async (loc: LocationState, queryDate: string, userBortle: BortleClass) => {
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
          bortleClass: userBortle,
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
            void fetchPlan(userLoc, date, bortle);
          },
          () => {
            void fetchPlan(location, date, bortle);
          },
          { timeout: 5000 }
        );
      } else {
        void fetchPlan(location, date, bortle);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchPlan, date, location, bortle]);

  const handleLocationChange = (newLoc: LocationState) => {
    setLocation(newLoc);
    void fetchPlan(newLoc, date, bortle);
  };

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    void fetchPlan(location, newDate, bortle);
  };

  const handleBortleChange = (newBortle: BortleClass) => {
    setBortle(newBortle);
    void fetchPlan(location, date, newBortle);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      <div>
        <Header
          date={date}
          onDateChange={handleDateChange}
          bortle={bortle}
          onBortleChange={handleBortleChange}
          telescopeProfile={telescopeProfile}
          onOpenTelescopeModal={() => setIsTelescopeModalOpen(true)}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
          {/* PWA Install Banner */}
          <PWAInstallPrompt />

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
                onClick={() => void fetchPlan(location, date, bortle)}
                className="underline hover:text-white ml-3 font-semibold cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}


          {/* Loading Indicator Banner */}
          {loading && !plan && (
            <div className="glass-panel rounded-2xl p-12 text-center space-y-3 animate-pulse">
              <div className="text-4xl animate-bounce">🛰️</div>
              <h2 className="text-lg font-bold text-white">Calculating v3 Pro Ephemeris & Atmospheric Seeing</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Tracking ISS passes, atmospheric seeing indices, Geohash cached ephemeris, and planetary orbits...
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

              {/* Interactive Altitude Progression Curve */}
              {plan.targets && (
                <AltitudeChart
                  targets={plan.targets}
                  selectedTargetId={selectedTargetId}
                  onSelectTarget={setSelectedTargetId}
                />
              )}

              {/* Celestial Body Search Bar & Observation Windows Filter */}
              {plan.searchCatalog && (
                <CelestialSearch targets={plan.searchCatalog} />
              )}

              {/* Tonight's Best Targets (Consolidated Observation Windows & Celestial Targets) */}
              {plan.targets && (
                <TonightBestTargets
                  targets={plan.targets}
                  windows={plan.windows}
                  isLoading={loading}
                  selectedTargetId={selectedTargetId}
                  onSelectTarget={setSelectedTargetId}
                  telescopeProfile={telescopeProfile}
                  onOpenTelescopeModal={() => setIsTelescopeModalOpen(true)}
                />
              )}

              {/* Active Meteor Showers */}
              {plan.meteorShowers && plan.meteorShowers.length > 0 && (
                <MeteorShowers showers={plan.meteorShowers} />
              )}

              {/* Visible Satellite Passes (ISS & Tiangong) */}
              {plan.satellites && plan.satellites.length > 0 && (
                <SatellitePasses passes={plan.satellites} />
              )}
            </>
          )}
        </main>

        {/* Equipment & Telescope Settings Modal */}
        <TelescopeProfileModal
          isOpen={isTelescopeModalOpen}
          onClose={() => setIsTelescopeModalOpen(false)}
          profile={telescopeProfile}
          onSaveProfile={setTelescopeProfile}
        />
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© Stargazer v2 — Powered by Open-Meteo, Astronomy Engine & CelesTrak</p>
          <div className="flex items-center space-x-4">
            <span className="text-indigo-400 font-mono">Bortle {bortle}</span>
            <span>•</span>
            <span className="text-cyan-400/80 font-mono">ISS Tracking</span>
          </div>
        </div>
      </footer>
    </div>
  );
}