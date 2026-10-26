import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Wine, MapPin, Navigation, Filter, ExternalLink } from 'lucide-react';
import { ClassificationLevel, ParcelFeature } from '../types';
import { geoService } from '../services/GeoService';

interface ParcelListDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  parcels: ParcelFeature[];
  onSelectParcel: (parcel: ParcelFeature) => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  displayScope?: 'livret' | 'all';
  onDisplayScopeChange?: (scope: 'livret' | 'all') => void;
}

export const ParcelListDrawer: React.FC<ParcelListDrawerProps> = ({
  isOpen,
  onClose,
  parcels,
  onSelectParcel,
  activeFilter,
  onFilterChange,
  displayScope = 'livret',
  onDisplayScopeChange,
}) => {
  const livretSubFilters = [
    { label: '📖 Tout le Livret (156)', value: 'LIVRET' },
    { label: '⭐ Grands Crus', value: 'LIVRET:Grand Cru' },
    { label: '🟣 1ers Crus', value: 'LIVRET:1er Cru' },
    { label: '🟢 Villages', value: 'LIVRET:Village' },
    { label: '🔵 Régionales', value: 'LIVRET:Régionale' },
    { label: '⏳ À couper', value: 'LIVRET:a_faire' },
    { label: '⚡ En cours', value: 'LIVRET:en_cours' },
    { label: '✅ Vendangées', value: 'LIVRET:vendange' },
  ];

  const allCadastreFilters = [
    { label: '🌐 Toutes les parcelles', value: 'ALL' },
    { label: '⭐ Grand Cru', value: 'Grand Cru' },
    { label: '🟣 1er Cru', value: '1er Cru' },
    { label: '🟢 Village', value: 'Village' },
    { label: '🔵 Régionale', value: 'Régionale' },
    { label: '⚪ IGP', value: 'IGP' },
  ];

  const filteredParcels = parcels.filter((p) => {
    const isLivret = Boolean(p.properties.is_vendange_livret || p.properties.code_livret || p.properties.page_livret);

    if (displayScope === 'livret') {
      if (!isLivret) return false;
      if (activeFilter === 'LIVRET' || activeFilter === 'ALL') return true;
      if (activeFilter.startsWith('LIVRET:')) {
        const sub = activeFilter.replace('LIVRET:', '').trim();
        if (sub === 'ALL' || sub === '') return true;
        if (['a_faire', 'en_cours', 'vendange'].includes(sub)) {
          return (p.properties.harvest_status || 'a_faire') === sub;
        }
        return p.properties.niveau?.trim().toLowerCase() === sub.toLowerCase();
      }
      return p.properties.niveau?.trim().toLowerCase() === activeFilter.trim().toLowerCase();
    }

    // displayScope === 'all'
    if (activeFilter === 'ALL' || activeFilter === 'LIVRET') return true;
    return p.properties.niveau?.trim().toLowerCase() === activeFilter.trim().toLowerCase();
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1200] bg-black/60 backdrop-blur-sm flex justify-end"
          onClick={onClose}
        >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="w-full max-w-md h-full bg-zinc-950 border-l border-zinc-800 p-4 sm:p-5 flex flex-col space-y-3.5 text-zinc-100 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Wine className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-black text-white">
                {displayScope === 'livret' ? 'Parcelles du Livret' : 'Cadastre Bourguignon'} ({filteredParcels.length})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scope Switcher Segment */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
            <button
              onClick={() => {
                if (onDisplayScopeChange) onDisplayScopeChange('livret');
                onFilterChange('LIVRET');
              }}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                displayScope === 'livret'
                  ? 'bg-amber-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>🍇 Livret Domaine</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-black ${
                displayScope === 'livret' ? 'bg-zinc-950 text-amber-400' : 'bg-zinc-800 text-zinc-300'
              }`}>
                156
              </span>
            </button>

            <button
              onClick={() => {
                if (onDisplayScopeChange) onDisplayScopeChange('all');
                onFilterChange('ALL');
              }}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                displayScope === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>🌐 Toute Bourgogne</span>
            </button>
          </div>

          {/* Classification / Status Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {(displayScope === 'livret' ? livretSubFilters : allCadastreFilters).map((f) => {
              const isActive = activeFilter === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => onFilterChange(f.value)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                    isActive
                      ? displayScope === 'livret'
                        ? 'bg-amber-500 text-zinc-950 border-amber-400 font-black shadow-sm'
                        : 'bg-blue-600 text-white border-blue-500 font-black shadow-sm'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredParcels.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs font-medium">
                Aucune parcelle dans la zone actuelle. Zoomez ou déplacez la carte.
              </div>
            ) : (
              filteredParcels.map((parcel) => {
                const props = parcel.properties;
                const mapsUrl = geoService.getGoogleMapsUrl(parcel);

                return (
                  <div
                    key={props.id || props.code_parcel}
                    className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 transition-all flex items-center justify-between gap-2 group cursor-pointer"
                    onClick={() => {
                      onSelectParcel(parcel);
                      onClose();
                    }}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900 group-hover:text-blue-600 truncate">
                          {props.climat || props.nom_app}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium truncate">
                        {props.nom_app} • {props.commune}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-0.5">
                        <span className="font-bold text-slate-700">{props.vigneron || 'Non renseigné'}</span>
                        {props.surface_ha && <span>• {props.surface_ha} ha</span>}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                          props.niveau === 'Grand Cru'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : props.niveau === '1er Cru'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : props.niveau === 'Village'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {props.niveau}
                      </span>

                      {mapsUrl && (
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-xl bg-slate-200/80 hover:bg-slate-900 hover:text-white text-slate-700 text-[10px] font-bold flex items-center gap-1 transition-all"
                          title="Itinéraire Google Maps"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>GPS</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
};
