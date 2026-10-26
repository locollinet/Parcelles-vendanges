import React from 'react';
import { Wine, Maximize2, X, MapPin } from 'lucide-react';
import { ParcelFeature, ClassificationLevel } from '../types';

interface ParcelRibbonBannerProps {
  parcel: ParcelFeature;
  onOpenSheet: () => void;
  onUnselectParcel: () => void;
  fieldMode: boolean;
}

export const ParcelRibbonBanner: React.FC<ParcelRibbonBannerProps> = ({
  parcel,
  onOpenSheet,
  onUnselectParcel,
  fieldMode,
}) => {
  const props = parcel.properties;

  const getLevelBadge = (level: ClassificationLevel) => {
    switch (level) {
      case 'Grand Cru':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
          dot: 'bg-amber-400',
          label: 'Grand Cru'
        };
      case '1er Cru':
        return {
          bg: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
          dot: 'bg-purple-400',
          label: '1er Cru'
        };
      case 'Village':
        return {
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
          dot: 'bg-emerald-400',
          label: 'Village'
        };
      case 'Régionale':
      default:
        return {
          bg: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
          dot: 'bg-blue-400',
          label: 'Régionale'
        };
    }
  };

  const badge = getLevelBadge(props.niveau || 'Village');
  const realParcelName = props.climat || props.nom_app || props.nom_climat || props.nom_aoc || (props.code_parcel ? `Parcelle ${props.code_parcel}` : 'Parcelle Viticole');

  return (
    <div className="fixed bottom-4 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:w-auto sm:max-w-md z-[1050] pointer-events-auto animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div
        onClick={onOpenSheet}
        className={`group cursor-pointer p-3 pr-2 rounded-2xl shadow-2xl border backdrop-blur-xl transition-all flex items-center justify-between gap-3 ${
          fieldMode
            ? 'bg-zinc-950/95 border-amber-500/80 text-zinc-50 shadow-amber-950/30'
            : 'bg-zinc-900/95 border-zinc-700/80 text-zinc-100 shadow-zinc-950/40 hover:border-amber-500/60'
        }`}
      >
        {/* Left Side: Badge + Name & Location info */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Wine className="w-4 h-4 text-amber-400" />
          </div>

          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${badge.bg}`}>
                {badge.label}
              </span>
              {props.harvest_status === 'vendange' && (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  ✓ Vendangé
                </span>
              )}
              {props.harvest_status === 'en_cours' && (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  ⏳ En cours
                </span>
              )}
              {(props.harvest_caisses || props.harvest_hl || props.harvest_kg) && (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-zinc-800 text-amber-300 border border-amber-500/30">
                  {[
                    props.harvest_caisses ? `📦 ${props.harvest_caisses} c.` : null,
                    props.harvest_hl ? `🍷 ${props.harvest_hl} hL` : null,
                    props.harvest_kg ? `⚖️ ${props.harvest_kg} kg` : null
                  ].filter(Boolean).join(' ')}
                </span>
              )}
              <span className="text-xs font-black text-amber-400 truncate max-w-[170px] xs:max-w-[220px] sm:max-w-[260px]">
                {realParcelName}
              </span>
            </div>

            <div className="text-[11px] font-medium text-zinc-400 truncate flex items-center gap-1">
              <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
              <span>
                {props.commune || props.nom_commune ? `${props.commune || props.nom_commune}` : ''}
                {props.nom_app && props.nom_app !== realParcelName ? ` • ${props.nom_app}` : ''}
                {props.code_parcel ? ` • Cadastre ${props.code_parcel}` : ''}
                {props.surface_ha || props.contenance_ha ? ` (${props.surface_ha || props.contenance_ha} ha)` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onOpenSheet}
            className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black transition-all active:scale-95 shadow-md flex items-center gap-1.5"
            title="Ouvrir la fiche complète de la parcelle"
          >
            <span>Fiche</span>
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onUnselectParcel}
            className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-all active:scale-95"
            title="Désélectionner la parcelle"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
