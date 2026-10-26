import React from 'react';
import { LocateFixed, Navigation, Compass, AlertCircle } from 'lucide-react';
import { LocationState } from '../types';

interface GpsFloatingButtonProps {
  locationState: LocationState;
  onToggleGps: () => void;
  onCenterOnUser: () => void;
  fieldMode: boolean;
  isVisible?: boolean;
  hasBanner?: boolean;
}

export const GpsFloatingButton: React.FC<GpsFloatingButtonProps> = ({
  locationState,
  onToggleGps,
  onCenterOnUser,
  fieldMode,
  isVisible = true,
  hasBanner = false,
}) => {
  const { status, accuracy, errorMsg } = locationState;

  if (!isVisible) return null;

  const handleClick = () => {
    if (status !== 'active') {
      onToggleGps();
    } else {
      onCenterOnUser();
    }
  };

  return (
    <div
      className={`fixed ${
        hasBanner ? 'bottom-24 sm:bottom-28' : 'bottom-20 sm:bottom-8'
      } right-3.5 sm:right-6 z-[1040] flex flex-col items-end gap-2 pointer-events-auto transition-all duration-200`}
    >
      {/* Error notification if geolocation is blocked */}
      {status === 'error' && errorMsg && (
        <div className="max-w-xs p-3 rounded-2xl bg-zinc-950/95 border border-rose-500/80 text-zinc-100 shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="text-[11px] font-semibold text-rose-200">{errorMsg}</span>
        </div>
      )}

      {/* Primary Floating Thumb Button */}
      <button
        type="button"
        onClick={handleClick}
        className={`group flex items-center gap-2.5 px-4 py-3.5 rounded-full shadow-2xl transition-all active:scale-95 font-black text-xs ${
          status === 'active'
            ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/40 ring-4 ring-emerald-500/20'
            : status === 'searching'
            ? 'bg-amber-500 text-zinc-950 shadow-amber-500/40 animate-pulse ring-4 ring-amber-500/20'
            : fieldMode
            ? 'bg-zinc-900/95 text-amber-400 border-2 border-amber-500/80 hover:bg-zinc-800 shadow-zinc-950/80 backdrop-blur-xl'
            : 'bg-zinc-900 text-emerald-400 border-2 border-emerald-500/80 hover:bg-zinc-800 shadow-xl shadow-slate-900/20 backdrop-blur-xl'
        }`}
        title="Centrer la carte sur ma position GPS dans les vignes"
      >
        {status === 'active' ? (
          <Navigation className="w-5 h-5 fill-zinc-950 shrink-0 animate-pulse" />
        ) : status === 'searching' ? (
          <Compass className="w-5 h-5 animate-spin shrink-0 text-zinc-950" />
        ) : (
          <LocateFixed className="w-5 h-5 shrink-0 text-emerald-400 group-hover:scale-110 transition-transform" />
        )}

        <div className="flex flex-col items-start text-left leading-none">
          <span className="text-xs font-black uppercase tracking-wider">
            {status === 'active'
              ? 'Ma position'
              : status === 'searching'
              ? 'Recherche...'
              : 'Ma position'}
          </span>
          {status === 'active' && accuracy && (
            <span className="text-[10px] font-bold text-zinc-900/80 mt-0.5">
              ±{Math.round(accuracy)}m
            </span>
          )}
        </div>
      </button>
    </div>
  );
};
