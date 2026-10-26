import React from 'react';
import { LocationState, ParcelFeature, ClassificationLevel } from '../types';
import { Compass, Navigation, MapPin, Wine, ChevronRight, AlertCircle, Sparkles } from 'lucide-react';
import { geoService } from '../services/GeoService';

interface NearbyParcelsPanelProps {
  locationState: LocationState;
  onSelectParcel: (parcel: ParcelFeature) => void;
  onCenterOnUser: () => void;
  fieldMode: boolean;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const NearbyParcelsPanel: React.FC<NearbyParcelsPanelProps> = ({
  locationState,
  onSelectParcel,
  onCenterOnUser,
  fieldMode,
  isOpen,
  onToggleOpen,
}) => {
  const { status, latitude, longitude, accuracy, currentParcel, nearbyParcels = [], errorMsg } = locationState;

  const getBadgeStyle = (level: ClassificationLevel) => {
    switch (level) {
      case 'Grand Cru':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case '1er Cru':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      case 'Village':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    }
  };

  if (status === 'disabled') {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-3 right-3 sm:left-6 sm:right-auto sm:max-w-md z-[1050] pointer-events-auto">
      <div
        className={`rounded-3xl border shadow-2xl backdrop-blur-xl transition-all overflow-hidden ${
          fieldMode
            ? 'bg-zinc-950/95 border-amber-500/50 text-zinc-100 shadow-amber-950/30'
            : 'bg-white/95 border-slate-200/90 text-slate-900 shadow-slate-900/15'
        }`}
      >
        {/* Header Bar */}
        <div
          onClick={onToggleOpen}
          className="p-3.5 flex items-center justify-between cursor-pointer select-none hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-500">
                <Navigation className="w-5 h-5 fill-emerald-500 animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-zinc-950 animate-ping" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-500">
                  GPS Actif
                </span>
                {accuracy && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    ±{Math.round(accuracy)}m
                  </span>
                )}
              </div>

              <p className="text-xs font-bold truncate">
                {currentParcel ? (
                  <span className="text-amber-500 font-extrabold flex items-center gap-1">
                    📍 Dans : {currentParcel.properties.climat || currentParcel.properties.nom_app}
                  </span>
                ) : (
                  <span>{nearbyParcels.length} parcelle(s) à proximité</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCenterOnUser();
              }}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-500 text-zinc-950 text-xs font-black flex items-center gap-1 active:scale-95 transition-transform"
              title="Centrer ma position"
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ma position</span>
            </button>

            <button className="p-1 text-slate-400 hover:text-slate-100">
              <ChevronRight
                className={`w-5 h-5 transition-transform duration-300 ${
                  isOpen ? '-rotate-90' : 'rotate-90'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Expanded Nearby Parcels Content */}
        {isOpen && (
          <div className="px-3.5 pb-3.5 pt-1 space-y-3 border-t border-slate-200/50 dark:border-zinc-800/80 max-h-[50vh] overflow-y-auto">
            {/* User Inside Parcel Hero Card */}
            {currentParcel && (
              <div
                onClick={() => onSelectParcel(currentParcel)}
                className="p-3 rounded-2xl bg-gradient-to-br from-emerald-950/80 to-zinc-900 border-2 border-emerald-500/80 text-white cursor-pointer active:scale-[0.99] transition-transform space-y-1 shadow-lg"
              >
                <div className="flex items-center justify-between text-[11px] font-black uppercase text-emerald-400 tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Vous êtes actuellement ici
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-[10px]">
                    0 mètre
                  </span>
                </div>
                <h4 className="text-base font-black leading-snug">
                  {currentParcel.properties.climat || currentParcel.properties.nom_app}
                </h4>
                <p className="text-xs font-medium text-emerald-200/80 flex items-center gap-1">
                  <Wine className="w-3.5 h-3.5 text-emerald-400" />
                  Appellation {currentParcel.properties.nom_app} • {currentParcel.properties.commune}
                </p>
              </div>
            )}

            {/* List of Nearby Parcels */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                <span>Parcelles à proximité ({nearbyParcels.length})</span>
                {latitude && longitude && (
                  <span className="font-mono text-[10px] text-slate-500">
                    {latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E
                  </span>
                )}
              </div>

              {nearbyParcels.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-700/50 rounded-2xl">
                  Aucune parcelle répertoriée dans le périmètre direct.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {nearbyParcels.map(({ feature, distanceMeters, isInside }) => {
                    const props = feature.properties;
                    return (
                      <div
                        key={String(feature.id || `${props.commune}-${props.code_parcel}`)}
                        onClick={() => onSelectParcel(feature)}
                        className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 active:scale-[0.98] ${
                          isInside
                            ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                            : fieldMode
                            ? 'bg-zinc-900/80 border-zinc-800 hover:bg-zinc-800 text-zinc-100'
                            : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100 text-slate-900'
                        }`}
                      >
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${getBadgeStyle(props.niveau)}`}>
                              {props.niveau}
                            </span>
                            <span className="text-xs font-black truncate">
                              {props.climat || props.nom_app}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            {props.commune} {props.vigneron ? `• ${props.vigneron}` : ''}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`inline-flex items-center px-2 py-1 rounded-xl text-xs font-black ${
                            isInside
                              ? 'bg-emerald-500 text-zinc-950'
                              : fieldMode
                              ? 'bg-zinc-800 text-amber-400 border border-zinc-700'
                              : 'bg-white text-slate-800 border border-slate-200 shadow-sm'
                          }`}>
                            {isInside ? '0m' : `à ${distanceMeters}m`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
