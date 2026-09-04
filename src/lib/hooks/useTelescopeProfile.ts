'use client';

import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_TELESCOPE_PROFILE, TelescopeProfile } from '../types/equipment';

const STORAGE_KEY = 'stargazer_telescope_profile_v1';

export function useTelescopeProfile() {
  const [profile, setProfileState] = useState<TelescopeProfile>(DEFAULT_TELESCOPE_PROFILE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed.apertureMm === 'number') {
          setProfileState(parsed);
        }
      }
    } catch (err) {
      console.warn('Failed to load telescope profile from localStorage:', err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const setProfile = useCallback((newProfile: TelescopeProfile) => {
    setProfileState(newProfile);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
    } catch (err) {
      console.warn('Failed to save telescope profile to localStorage:', err);
    }
  }, []);

  return { profile, setProfile, isLoaded };
}
