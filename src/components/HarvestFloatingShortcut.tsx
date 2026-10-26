import React from 'react';
import { BookOpen, CalendarDays, TrendingUp, ChevronRight, Share2, Sparkles } from 'lucide-react';
import { ParcelFeature } from '../types';

interface HarvestFloatingShortcutProps {
  onOpenHarvestModal: () => void;
  onOpenScheduleModal: () => void;
  onOpenDashboardModal: () => void;
  onOpenBilanGlobal?: () => void;
  parcels: ParcelFeature[];
  fieldMode: boolean;
  isVisible?: boolean;
  hasBottomBanner?: boolean;
}

export const HarvestFloatingShortcut: React.FC<HarvestFloatingShortcutProps> = ({
  onOpenHarvestModal,
  onOpenScheduleModal,
  onOpenDashboardModal,
  onOpenBilanGlobal,
  parcels,
  fieldMode,
  isVisible = true,
  hasBottomBanner = false,
}) => {
  if (!isVisible) return null;

  // Compute live stats for badges
  const stats = React.useMemo(() => {
    let vendangeCount = 0;
    let scheduledTodayCount = 0;
    let totalCaisses = 0;
    const todayStr = new Date().toISOString().split('T')[0];

    parcels.forEach((p) => {
      if (p.properties.harvest_status === 'vendange') vendangeCount++;
      if (p.properties.harvest_scheduled_date === todayStr) scheduledTodayCount++;
      if (p.properties.harvest_caisses) totalCaisses += p.properties.harvest_caisses;
    });

    const percentDone = parcels.length > 0 ? Math.round((vendangeCount / parcels.length) * 100) : 0;

    return { vendangeCount, scheduledTodayCount, totalCaisses, percentDone };
  }, [parcels]);

  return (
    <>
      {/* DESKTOP FLOATING STACK (Tablet & Desktop: right top side) */}
      <div className="hidden sm:flex fixed top-32 right-4 z-[990] pointer-events-auto flex-col gap-2 animate-in fade-in slide-in-from-right-3 duration-200">
        {/* 1. Livret Vendanges (156 Parcelles) */}
        <button
          type="button"
          onClick={onOpenHarvestModal}
          className={`group flex items-center gap-2.5 pl-2.5 pr-3.5 py-2 rounded-2xl shadow-xl backdrop-blur-xl border transition-all active:scale-95 ${
            fieldMode
              ? 'bg-zinc-950/95 border-amber-500/80 text-zinc-100 hover:bg-zinc-900 shadow-amber-950/40'
              : 'bg-white/95 border-amber-500/50 text-slate-900 hover:bg-amber-50/90 shadow-slate-900/10'
          }`}
          title="Consulter les fiches et plans des 156 parcelles vendangées"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-zinc-950 flex items-center justify-center font-black shadow-md group-hover:scale-105 transition-transform shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>

          <div className="text-left flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-tight text-amber-600 dark:text-amber-400">
                Livret Vendanges
              </span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-zinc-950">
                156
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-semibold leading-tight">
              Fiches & Plans
            </span>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform ml-auto" />
        </button>

        {/* 2. Calendrier / Planning journalier */}
        <button
          type="button"
          onClick={onOpenScheduleModal}
          className={`group flex items-center gap-2.5 pl-2.5 pr-3.5 py-2 rounded-2xl shadow-xl backdrop-blur-xl border transition-all active:scale-95 ${
            fieldMode
              ? 'bg-zinc-950/95 border-blue-500/70 text-zinc-100 hover:bg-zinc-900 shadow-blue-950/30'
              : 'bg-white/95 border-blue-500/40 text-slate-900 hover:bg-blue-50/90 shadow-slate-900/10'
          }`}
          title="Ouvrir le calendrier et circuit journalier des vendanges"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center font-black shadow-md group-hover:scale-105 transition-transform shrink-0">
            <CalendarDays className="w-4 h-4" />
          </div>

          <div className="text-left flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-tight text-blue-600 dark:text-blue-400">
                Calendrier Coupe
              </span>
              {stats.scheduledTodayCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-blue-500 text-white">
                  {stats.scheduledTodayCount} auj.
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-semibold leading-tight">
              Planning & Circuit
            </span>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform ml-auto" />
        </button>

        {/* 3. Statut d'avancement global */}
        <button
          type="button"
          onClick={onOpenDashboardModal}
          className={`group flex items-center gap-2.5 pl-2.5 pr-3.5 py-2 rounded-2xl shadow-xl backdrop-blur-xl border transition-all active:scale-95 ${
            fieldMode
              ? 'bg-zinc-950/95 border-emerald-500/70 text-zinc-100 hover:bg-zinc-900 shadow-emerald-950/30'
              : 'bg-white/95 border-emerald-500/40 text-slate-900 hover:bg-emerald-50/90 shadow-slate-900/10'
          }`}
          title="Voir l'avancement global, le % récolté et le total des caisses"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500 text-zinc-950 flex items-center justify-center font-black shadow-md group-hover:scale-105 transition-transform shrink-0">
            <TrendingUp className="w-4 h-4 stroke-[2.5]" />
          </div>

          <div className="text-left flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                Avancement
              </span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-emerald-500 text-zinc-950">
                {stats.percentDone}%
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-semibold leading-tight">
              {stats.vendangeCount}/{parcels.length} parcelles
            </span>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform ml-auto" />
        </button>

        {/* 4. Direct 1-Tap Bilan Global Copier Button */}
        {onOpenBilanGlobal && (
          <button
            type="button"
            onClick={onOpenBilanGlobal}
            className="group flex items-center gap-2.5 pl-2.5 pr-3.5 py-2 rounded-2xl shadow-xl backdrop-blur-xl border border-amber-500/70 bg-gradient-to-r from-amber-500/20 to-zinc-900/95 text-amber-300 hover:text-amber-200 hover:border-amber-400 transition-all active:scale-95"
            title="Copier le bilan global pour WhatsApp / SMS"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-zinc-950 flex items-center justify-center font-black shadow-md shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <div className="text-left flex flex-col">
              <span className="text-xs font-black tracking-tight text-amber-400">
                Bilan Global
              </span>
              <span className="text-[10px] text-zinc-400 font-semibold leading-tight">
                Copier / WhatsApp
              </span>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-amber-400 ml-auto" />
          </button>
        )}
      </div>

      {/* MOBILE BOTTOM DOCK (Smart touch bar, positioned above safe bottom area) */}
      {!hasBottomBanner && (
        <div className="sm:hidden fixed bottom-3 left-3 right-3 z-[995] pointer-events-auto flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex-1 bg-zinc-950/95 border border-zinc-800 backdrop-blur-xl rounded-2xl p-1.5 shadow-2xl flex items-center justify-around gap-1">
            {/* Livret (156) */}
            <button
              type="button"
              onClick={onOpenHarvestModal}
              className="flex-1 min-h-[46px] flex flex-col items-center justify-center py-1 px-1 rounded-xl active:bg-zinc-800 transition-colors text-zinc-200"
            >
              <div className="relative">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span className="absolute -top-1.5 -right-3 px-1 py-0.2 bg-amber-500 text-zinc-950 text-[9px] font-black rounded-full leading-none">
                  156
                </span>
              </div>
              <span className="text-[10px] font-black tracking-tight mt-1 text-zinc-300">
                Livret
              </span>
            </button>

            <div className="w-px h-6 bg-zinc-800" />

            {/* Planning */}
            <button
              type="button"
              onClick={onOpenScheduleModal}
              className="flex-1 min-h-[46px] flex flex-col items-center justify-center py-1 px-1 rounded-xl active:bg-zinc-800 transition-colors text-zinc-200"
            >
              <div className="relative">
                <CalendarDays className="w-4 h-4 text-blue-400" />
                {stats.scheduledTodayCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 px-1 py-0.2 bg-blue-500 text-white text-[9px] font-black rounded-full leading-none">
                    {stats.scheduledTodayCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-black tracking-tight mt-1 text-zinc-300">
                Planning
              </span>
            </button>

            <div className="w-px h-6 bg-zinc-800" />

            {/* Avancement */}
            <button
              type="button"
              onClick={onOpenDashboardModal}
              className="flex-1 min-h-[46px] flex flex-col items-center justify-center py-1 px-1 rounded-xl active:bg-zinc-800 transition-colors text-zinc-200"
            >
              <div className="relative">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="absolute -top-1.5 -right-3.5 px-1 py-0.2 bg-emerald-500 text-zinc-950 text-[9px] font-black rounded-full leading-none">
                  {stats.percentDone}%
                </span>
              </div>
              <span className="text-[10px] font-black tracking-tight mt-1 text-zinc-300">
                Avancement
              </span>
            </button>

            <div className="w-px h-6 bg-zinc-800" />

            {/* Direct Bilan Global Shortcut */}
            <button
              type="button"
              onClick={onOpenBilanGlobal || onOpenDashboardModal}
              className="flex-1 min-h-[46px] flex flex-col items-center justify-center py-1 px-1 rounded-xl bg-amber-500/10 border border-amber-500/30 active:bg-amber-500/20 transition-colors text-amber-300"
            >
              <Share2 className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-black tracking-tight mt-1 text-amber-400">
                Bilan
              </span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
