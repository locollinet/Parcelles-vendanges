import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ZoomIn, Layers, MapPin, Eye } from 'lucide-react';

interface LivretPlanViewerProps {
  pageLivret?: number;
  commune?: string;
  nomParcelle?: string;
  carteAnnotee?: string;
  diapositive?: string;
  pinXPct?: number | null;
  pinYPct?: number | null;
  numeroSurCarte?: string | number;
  fieldMode: boolean;
}

export const LivretPlanViewer: React.FC<LivretPlanViewerProps> = ({
  pageLivret,
  commune,
  nomParcelle,
  carteAnnotee,
  diapositive,
  pinXPct,
  pinYPct,
  numeroSurCarte,
  fieldMode
}) => {
  const [isSlideLightboxOpen, setIsSlideLightboxOpen] = useState(false);
  const [isCarteLightboxOpen, setIsCarteLightboxOpen] = useState(false);

  if (!pageLivret && !carteAnnotee) return null;

  // Chemins exacts issus du CSV (cartes/ et slides/)
  const carteUrl = carteAnnotee
    ? (carteAnnotee.startsWith('/') ? carteAnnotee : `/${carteAnnotee}`)
    : (pageLivret ? `/cartes/carte_p${pageLivret}.jpg` : '');

  const slideUrl = diapositive
    ? (diapositive.startsWith('/') ? diapositive : `/${diapositive}`)
    : (pageLivret ? `/slides/slide_${pageLivret}.jpg` : '');

  const hasPin = pinXPct !== null && pinXPct !== undefined && pinYPct !== null && pinYPct !== undefined;

  return (
    <div className="space-y-3">
      {/* 1. VISUEL PRINCIPAL DE LA FICHE : Carte Annotée du Secteur avec Anneau de Repérage Exact */}
      <div className={`p-3.5 rounded-2xl border transition-all ${
        fieldMode 
          ? 'bg-zinc-900/95 border-zinc-800 ring-1 ring-amber-500/20' 
          : 'bg-amber-50/90 border-amber-200/90'
      }`}>
        {/* En-tête du visuel principal */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-zinc-950 flex items-center justify-center font-black shadow-sm shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-black tracking-tight text-slate-900 dark:text-zinc-100">
                  Carte annotée du secteur
                </span>
                {numeroSurCarte && (
                  <span className="px-1.5 py-0.2 rounded-md text-[10px] font-black bg-orange-500 text-white shadow-sm">
                    Pastille n°{numeroSurCarte}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-zinc-400 font-medium">
                {hasPin 
                  ? `Repère orange : pastille n°${numeroSurCarte} (Livret page ${pageLivret})` 
                  : `n°${numeroSurCarte} sur la carte (Livret page ${pageLivret})`}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCarteLightboxOpen(true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 shadow-sm shrink-0 ${
              fieldMode
                ? 'bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-amber-500/30'
                : 'bg-white hover:bg-slate-50 text-slate-900 border border-slate-200'
            }`}
          >
            <ZoomIn className="w-3.5 h-3.5" />
            <span>Plein écran</span>
          </button>
        </div>

        {/* Conteneur de l'image préservant strictement le ratio naturel */}
        <div 
          onClick={() => setIsCarteLightboxOpen(true)}
          className="relative w-full rounded-xl overflow-hidden border border-amber-500/30 bg-zinc-950 shadow-inner group cursor-pointer"
        >
          {/* L'image principale : pas de object-fit: cover pour préserver le ratio strict */}
          <div className="relative w-full">
            <img 
              src={carteUrl} 
              alt={`Carte annotée secteur page ${pageLivret}`}
              className="w-full h-auto block select-none"
              loading="lazy"
            />

            {/* UN SEUL repère : Anneau orange vif centré à pin_x_pct% et pin_y_pct% */}
            {hasPin && (
              <div 
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 flex items-center justify-center"
                style={{ 
                  left: `${pinXPct}%`, 
                  top: `${pinYPct}%` 
                }}
              >
                {/* Anneau orange vif fluorescent pulsant */}
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-[3.5px] border-orange-500 bg-orange-500/10 shadow-[0_0_12px_rgba(249,115,22,1),inset_0_0_6px_rgba(249,115,22,0.6)] animate-pulse" />
                {/* Pastille centrale discrète */}
                <div className="absolute w-2 h-2 rounded-full bg-orange-500 shadow-sm" />
              </div>
            )}

            {/* Overlay bas avec indication */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2 flex items-end justify-between">
              {hasPin ? (
                <span className="px-2 py-0.5 rounded-md bg-orange-500/90 text-white font-black text-[10px] tracking-wide backdrop-blur-sm shadow-sm">
                  Anneau orange = Pastille n°{numeroSurCarte}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md bg-amber-500/90 text-zinc-950 font-black text-[10px] tracking-wide backdrop-blur-sm shadow-sm">
                  n°{numeroSurCarte} sur la carte
                </span>
              )}

              <span className="text-[10px] font-bold text-zinc-300 bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm">
                Page {pageLivret}
              </span>
            </div>
          </div>
        </div>

        {/* Légende textuelle si pin_x_pct est vide */}
        {!hasPin && numeroSurCarte && (
          <div className="mt-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center text-xs font-black text-amber-700 dark:text-amber-300">
            « n°{numeroSurCarte} sur la carte »
          </div>
        )}
      </div>

      {/* 2. BOUTON & ACCÈS AU VIEWER « DIAPOSITIVE EXACTE » */}
      <div className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
        fieldMode 
          ? 'bg-zinc-900/60 border-zinc-800/80 text-zinc-300' 
          : 'bg-white border-slate-200 text-slate-700'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-zinc-800 text-amber-400 flex items-center justify-center font-black shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-black text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span>Diapositive exacte du livret</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-zinc-800 text-amber-400">
                Page {pageLivret}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Diapositive complète avec tous les climats et détails
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsSlideLightboxOpen(true)}
          className="px-3 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center gap-1.5 transition-all active:scale-95 shadow-md shrink-0"
        >
          <Eye className="w-4 h-4" />
          <span>Voir diapo</span>
        </button>
      </div>

      {/* LIGHTBOX 1 : CARTE ANNOTÉE AGRANDIE AVEC ANNEAU */}
      <AnimatePresence>
        {isCarteLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-xl flex flex-col justify-between p-2 sm:p-4"
            onClick={() => setIsCarteLightboxOpen(false)}
          >
            {/* Header Lightbox */}
            <div 
              className="flex items-center justify-between bg-zinc-900/90 border border-zinc-800 p-3 sm:p-4 rounded-2xl text-zinc-100 shrink-0 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-black">
                      CARTE ANNOTÉE • {commune?.toUpperCase()}
                    </h3>
                    {numeroSurCarte && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-orange-500 text-white">
                        PASTILLE N°{numeroSurCarte}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 font-medium">
                    {nomParcelle ? nomParcelle : `Page ${pageLivret}`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCarteLightboxOpen(false)}
                className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 active:scale-95 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Zone d'affichage Image HD préservant ratio avec Repère */}
            <div 
              className="flex-1 my-2 sm:my-3 flex items-center justify-center overflow-auto rounded-2xl bg-zinc-950 border border-zinc-800/80 p-2 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative max-w-full max-h-full inline-block">
                <img 
                  src={carteUrl} 
                  alt={`Carte annotée plein écran page ${pageLivret}`}
                  className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl block"
                />

                {hasPin && (
                  <div 
                    className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 flex items-center justify-center"
                    style={{ 
                      left: `${pinXPct}%`, 
                      top: `${pinYPct}%` 
                    }}
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-orange-500 bg-orange-500/10 shadow-[0_0_16px_rgba(249,115,22,1),inset_0_0_8px_rgba(249,115,22,0.6)] animate-pulse" />
                    <div className="absolute w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm" />
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div 
              className="bg-zinc-900/90 border border-zinc-800 p-3 rounded-2xl text-xs text-zinc-300 flex items-center justify-between gap-2 shrink-0 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 text-zinc-300 text-xs font-semibold">
                <span>📍 Carte annotée du livret</span>
                {hasPin ? (
                  <span className="text-orange-400 font-bold">• Anneau orange = n°{numeroSurCarte}</span>
                ) : (
                  <span className="text-amber-400 font-bold">• n°{numeroSurCarte} sur la carte</span>
                )}
              </div>

              <div className="text-amber-400 font-black text-xs">
                Page {pageLivret}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LIGHTBOX 2 : DIAPOSITIVE EXACTE COMPLÈTE */}
      <AnimatePresence>
        {isSlideLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-xl flex flex-col justify-between p-2 sm:p-4"
            onClick={() => setIsSlideLightboxOpen(false)}
          >
            {/* Header Lightbox */}
            <div 
              className="flex items-center justify-between bg-zinc-900/90 border border-zinc-800 p-3 sm:p-4 rounded-2xl text-zinc-100 shrink-0 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-zinc-950 flex items-center justify-center font-black">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black">
                      DIAPOSITIVE EXACTE • SECTEUR {commune?.toUpperCase()}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500 text-zinc-950">
                      PAGE {pageLivret}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-medium">
                    {nomParcelle ? `${nomParcelle}` : commune}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsSlideLightboxOpen(false)}
                className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 active:scale-95 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Zone d'affichage Image HD */}
            <div 
              className="flex-1 my-2 sm:my-3 flex items-center justify-center overflow-auto rounded-2xl bg-zinc-950 border border-zinc-800/80 p-2 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={slideUrl} 
                alt={`Diapositive ${pageLivret}`}
                className="max-w-full max-h-[82vh] object-contain rounded-xl shadow-2xl"
                loading="lazy"
              />
            </div>

            {/* Footer */}
            <div 
              className="bg-zinc-900/90 border border-zinc-800 p-3 rounded-2xl text-xs text-zinc-300 flex items-center justify-between gap-2 shrink-0 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 text-zinc-300 text-xs font-semibold">
                <span>📍 Diapositive PowerPoint officielle du Domaine</span>
              </div>

              <div className="text-amber-400 font-black text-xs">
                Page {pageLivret}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
