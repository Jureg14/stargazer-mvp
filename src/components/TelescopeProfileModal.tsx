'use client';

import { useState } from 'react';
import {
  DEFAULT_TELESCOPE_PROFILE,
  Eyepiece,
  TELESCOPE_PRESETS,
  TelescopeProfile,
} from '@/lib/types/equipment';

interface TelescopeProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: TelescopeProfile;
  onSaveProfile: (profile: TelescopeProfile) => void;
}

export function TelescopeProfileModal({
  isOpen,
  onClose,
  profile: initialProfile,
  onSaveProfile,
}: TelescopeProfileModalProps) {
  const [profile, setProfile] = useState<TelescopeProfile>(initialProfile);
  const [newFocalLength, setNewFocalLength] = useState<string>('');

  if (!isOpen) return null;

  const focalRatio = profile.apertureMm > 0
    ? (profile.focalLengthMm / profile.apertureMm).toFixed(1)
    : '0.0';
  const apertureInches = profile.apertureMm > 0
    ? (profile.apertureMm / 25.4).toFixed(1)
    : '0.0';
  const maxUsefulMag = profile.apertureMm * 2;

  const handleApplyPreset = (presetId: string) => {
    const preset = TELESCOPE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setProfile({
      ...profile,
      name: preset.name,
      apertureMm: preset.apertureMm,
      focalLengthMm: preset.focalLengthMm,
      eyepieces: preset.defaultEyepieces.map((fl) => ({
        id: `ep-${fl}-${Date.now()}`,
        focalLengthMm: fl,
        apparentFovDeg: 52,
        label: `${fl}mm`,
      })),
    });
  };

  const handleAddEyepiece = (focalLengthNum: number) => {
    if (isNaN(focalLengthNum) || focalLengthNum <= 0) return;
    // Check if already exists
    if (profile.eyepieces.some((ep) => ep.focalLengthMm === focalLengthNum)) return;

    const newEp: Eyepiece = {
      id: `ep-${focalLengthNum}-${Date.now()}`,
      focalLengthMm: focalLengthNum,
      apparentFovDeg: 52,
      label: `${focalLengthNum}mm`,
    };

    const updatedEyepieces = [...profile.eyepieces, newEp].sort(
      (a, b) => b.focalLengthMm - a.focalLengthMm
    );

    setProfile({
      ...profile,
      eyepieces: updatedEyepieces,
    });
    setNewFocalLength('');
  };

  const handleAddBarlow = (multiplierNum: number) => {
    if (isNaN(multiplierNum) || multiplierNum <= 1) return;
    // Check if already exists
    if (profile.eyepieces.some((ep) => ep.isBarlow && ep.barlowMultiplier === multiplierNum)) return;

    const newBarlow: Eyepiece = {
      id: `barlow-${multiplierNum}x-${Date.now()}`,
      focalLengthMm: 0,
      isBarlow: true,
      barlowMultiplier: multiplierNum,
      label: `${multiplierNum}× Barlow Lens`,
    };

    setProfile({
      ...profile,
      eyepieces: [...profile.eyepieces, newBarlow],
    });
  };

  const handleRemoveEyepiece = (id: string) => {
    setProfile({
      ...profile,
      eyepieces: profile.eyepieces.filter((ep) => ep.id !== id),
    });
  };

  const handleSave = () => {
    onSaveProfile(profile);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="glass-panel border-slate-700/80 rounded-2xl max-w-xl w-full p-5 sm:p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🔭</span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Telescope & Eyepiece Setup
              </h3>
              <p className="text-xs text-slate-400">
                Tailors magnifications and eyepiece recommendations for tonight&apos;s targets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Enable / Disable Switch */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div>
            <span className="text-sm font-semibold text-white block">
              Enable Telescope Optics Mode
            </span>
            <span className="text-xs text-slate-400">
              Surfaces custom magnification & eyepiece advice on target cards
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={profile.enabled}
              onChange={(e) => setProfile({ ...profile, enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
          </label>
        </div>

        {/* Quick Presets */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Quick Telescope Presets
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {TELESCOPE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset.id)}
                className="text-left p-2.5 rounded-xl border border-slate-800/80 bg-slate-900/60 hover:bg-slate-800/80 hover:border-cyan-500/50 transition-all cursor-pointer group"
              >
                <span className="text-xs font-bold text-white group-hover:text-cyan-300 block">
                  {preset.name}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {preset.apertureMm}mm • f/{(preset.focalLengthMm / preset.apertureMm).toFixed(1)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Telescope Specifications */}
        <div className="space-y-3 pt-2 border-t border-slate-800/80">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            Telescope Specifications
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-300 block mb-1">
                Aperture (mm)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="40"
                  max="600"
                  value={profile.apertureMm}
                  onChange={(e) =>
                    setProfile({ ...profile, apertureMm: Math.max(1, Number(e.target.value)) })
                  }
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">
                  ~{apertureInches}&quot;
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">
                Focal Length (mm)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="100"
                  max="4000"
                  value={profile.focalLengthMm}
                  onChange={(e) =>
                    setProfile({ ...profile, focalLengthMm: Math.max(1, Number(e.target.value)) })
                  }
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">
                  f/{focalRatio}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
            <span className="text-slate-400">Calculated Focal Ratio: <strong className="text-cyan-300 font-mono">f/{focalRatio}</strong></span>
            <span className="text-slate-400">Max Useful Mag: <strong className="text-indigo-300 font-mono">{maxUsefulMag}×</strong></span>
          </div>
        </div>

        {/* Eyepieces & Barlow Lenses Kit */}
        <div className="space-y-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              My Eyepieces & Barlows ({profile.eyepieces.length})
            </label>
            <span className="text-[11px] text-slate-500">
              Click chips or enter custom values
            </span>
          </div>

          {/* Quick Add Chips */}
          <div className="space-y-1.5 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-500 text-[11px] w-20">Eyepieces:</span>
              {[32, 25, 20, 15, 10, 6, 4].map((fl) => (
                <button
                  key={fl}
                  type="button"
                  onClick={() => handleAddEyepiece(fl)}
                  className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 font-mono text-[11px] cursor-pointer"
                >
                  +{fl}mm
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-purple-400/90 text-[11px] w-20 flex items-center gap-1">
                <span>🔍</span> Barlows:
              </span>
              {[2, 2.5, 3].map((bm) => (
                <button
                  key={bm}
                  type="button"
                  onClick={() => handleAddBarlow(bm)}
                  className="px-2.5 py-0.5 rounded-lg bg-purple-950/60 border border-purple-800/70 text-purple-300 hover:text-white hover:border-purple-500 font-mono text-[11px] cursor-pointer transition-colors"
                >
                  +{bm}× Barlow
                </button>
              ))}
            </div>
          </div>

          {/* Eyepieces & Barlows List */}
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {profile.eyepieces.length === 0 && (
              <div className="p-3 text-center rounded-xl bg-slate-900/50 border border-dashed border-slate-800 text-xs text-slate-500">
                No eyepieces added yet. Click the chips above or add custom mm.
              </div>
            )}

            {/* Standard Eyepieces */}
            {profile.eyepieces
              .filter((ep) => !ep.isBarlow && ep.focalLengthMm > 0)
              .map((ep) => {
                const mag =
                  profile.focalLengthMm > 0
                    ? Math.round(profile.focalLengthMm / ep.focalLengthMm)
                    : 0;
                const exitPupil =
                  mag > 0 ? (profile.apertureMm / mag).toFixed(1) : '0.0';

                // Check active barlows
                const activeBarlows = profile.eyepieces.filter(
                  (b) => b.isBarlow && (b.barlowMultiplier || 0) > 1
                );

                return (
                  <div
                    key={ep.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800/50 text-indigo-300 flex items-center justify-center font-mono font-bold text-xs">
                        {ep.focalLengthMm}
                      </span>
                      <div>
                        <span className="font-semibold text-white block">
                          {ep.focalLengthMm}mm Eyepiece
                        </span>
                        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 flex-wrap mt-0.5">
                          <span>{mag}× magnification</span>
                          <span className="text-slate-600">•</span>
                          <span>{exitPupil}mm exit pupil</span>
                          {activeBarlows.map((ab) => (
                            <span
                              key={ab.id}
                              className="text-purple-400 bg-purple-950/60 border border-purple-900 px-1.5 py-0.2 rounded text-[10px]"
                            >
                              w/ {ab.barlowMultiplier}× Barlow: {Math.round(mag * ab.barlowMultiplier!)}× ({(ep.focalLengthMm / ab.barlowMultiplier!).toFixed(1)}mm eq)
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveEyepiece(ep.id)}
                      className="text-slate-500 hover:text-rose-400 px-2 py-1 cursor-pointer transition-colors"
                      title="Remove eyepiece"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}

            {/* Barlow Lenses in List */}
            {profile.eyepieces
              .filter((ep) => ep.isBarlow)
              .map((barlow) => (
                <div
                  key={barlow.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/60 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-purple-900/80 border border-purple-700 text-purple-200 flex items-center justify-center font-mono font-bold text-xs">
                      {barlow.barlowMultiplier}×
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-purple-200 block">
                          {barlow.label || `${barlow.barlowMultiplier}× Barlow Lens`}
                        </span>
                        <span className="text-[9px] bg-purple-900/80 border border-purple-600 text-purple-300 px-1.5 py-0.2 rounded font-mono font-bold uppercase tracking-wider">
                          Barlow Lens
                        </span>
                      </div>
                      <span className="text-[11px] text-purple-300/80 font-sans block mt-0.5">
                        Multiplies magnification by {barlow.barlowMultiplier}× for all eyepieces in your kit
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveEyepiece(barlow.id)}
                    className="text-purple-400 hover:text-rose-400 px-2 py-1 cursor-pointer transition-colors"
                    title="Remove Barlow lens"
                  >
                    ✕
                  </button>
                </div>
              ))}
          </div>

          {/* Custom Eyepiece & Barlow Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-800/60">
            {/* Custom Eyepiece focal length */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="2"
                max="60"
                placeholder="Eyepiece mm (e.g. 12)"
                value={newFocalLength}
                onChange={(e) => setNewFocalLength(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddEyepiece(Number(newFocalLength));
                  }
                }}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                type="button"
                onClick={() => handleAddEyepiece(Number(newFocalLength))}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer transition-all whitespace-nowrap"
              >
                + Add mm
              </button>
            </div>

            {/* Custom Barlow Multiplier */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleAddBarlow(2)}
                className="w-full px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 border border-purple-800/80 text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <span>🔍</span> + Add 2× Barlow
              </button>
              <button
                type="button"
                onClick={() => handleAddBarlow(3)}
                className="px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 border border-purple-800/80 text-xs font-semibold cursor-pointer transition-all whitespace-nowrap"
              >
                + 3× Barlow
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setProfile(DEFAULT_TELESCOPE_PROFILE)}
            className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
          >
            Reset to Default
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 cursor-pointer transition-all"
            >
              Save & Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
