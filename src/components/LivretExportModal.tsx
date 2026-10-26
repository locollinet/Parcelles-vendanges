import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Printer, 
  BookOpen, 
  FileText, 
  Download, 
  Eye, 
  Check, 
  Layers, 
  MapPin, 
  Wine, 
  Sparkles, 
  ExternalLink,
  ChevronRight,
  Filter,
  CheckSquare,
  Image as ImageIcon
} from 'lucide-react';
import { ParcelFeature } from '../types';
import { livretPrintService, LivretPrintOptions } from '../services/LivretPrintService';

interface LivretExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  parcels: ParcelFeature[];
  initialMode?: 'vendanges' | 'atlas_illustre';
  initialParcel?: ParcelFeature | null;
  fieldMode?: boolean;
}

export const LivretExportModal: React.FC<LivretExportModalProps> = ({
  isOpen,
  onClose,
  parcels,
  initialMode = 'vendanges',
  initialParcel = null,
  fieldMode = false,
}) => {
  const [mode, setMode] = useState<'vendanges' | 'atlas_illustre'>(initialMode);
  const [selectedCommune, setSelectedCommune] = useState<string>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [includeCoverPage, setIncludeCoverPage] = useState<boolean>(true);
  const [includeCheckboxes, setIncludeCheckboxes] = useState<boolean>(true);
  const [includeTerrainPhotos, setIncludeTerrainPhotos] = useState<boolean>(true);
  const [equipeName, setEquipeName] = useState<string>('');
  const [millesime, setMillesime] = useState<string>('2024');
  const [activeTab, setActiveTab] = useState<'config' | 'preview'>('config');
  const [popupBlockedWarning, setPopupBlockedWarning] = useState<boolean>(false);

  // Single parcel selection if opened from BottomSheet
  const [onlySelectedParcel, setOnlySelectedParcel] = useState<boolean>(initialParcel !== null);

  // If initialParcel changes when modal opens
  React.useEffect(() => {
    if (initialParcel) {
      setOnlySelectedParcel(true);
      setMode('atlas_illustre');
    }
  }, [initialParcel]);

  // Unique communes and counts
  const communeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    parcels.forEach((p) => {
      const comm = p.properties.commune || 'Autre';
      counts[comm] = (counts[comm] || 0) + 1;
    });
    return counts;
  }, [parcels]);

  const communes = useMemo(() => {
    return Object.keys(communeCounts).sort((a, b) => communeCounts[b] - communeCounts[a]);
  }, [communeCounts]);

  const [isEmbeddingImages, setIsEmbeddingImages] = useState(false);
  const [embedProgress, setEmbedProgress] = useState(0);

  const printOptions: LivretPrintOptions = useMemo(() => {
    return {
      mode,
      communeFilter: onlySelectedParcel ? 'ALL' : selectedCommune,
      levelFilter: onlySelectedParcel ? 'ALL' : selectedLevel,
      statusFilter: onlySelectedParcel ? 'ALL' : selectedStatus,
      includeCoverPage: onlySelectedParcel ? false : includeCoverPage,
      includeSummaryStats: !onlySelectedParcel,
      includeTerrainPhotos,
      includeCheckboxes,
      selectedParcelIds: (onlySelectedParcel && initialParcel) ? [String(initialParcel.id || initialParcel.properties.id)] : undefined,
      millesime,
      equipeName: equipeName.trim() || undefined
    };
  }, [
    mode, 
    selectedCommune, 
    selectedLevel, 
    selectedStatus, 
    includeCoverPage, 
    includeCheckboxes, 
    includeTerrainPhotos, 
    onlySelectedParcel, 
    initialParcel, 
    millesime, 
    equipeName
  ]);

  const targetParcels = useMemo(() => {
    return livretPrintService.filterParcels(parcels, printOptions);
  }, [parcels, printOptions]);

  // Preload images as base64 in the background when modal is open
  useEffect(() => {
    if (!isOpen || targetParcels.length === 0) return;
    let isCancelled = false;

    livretPrintService.preloadAllImagesAsBase64(targetParcels, (pct) => {
      if (!isCancelled) setEmbedProgress(pct);
    }).catch(() => {});

    return () => {
      isCancelled = true;
    };
  }, [isOpen, targetParcels]);

  // Generate live preview HTML
  const previewHtml = useMemo(() => {
    if (!isOpen) return '';
    return livretPrintService.generatePrintableHtml(parcels, printOptions);
  }, [isOpen, parcels, printOptions, embedProgress]);

  if (!isOpen) return null;

  const prepareImagesAndExecute = async (callback: () => void) => {
    try {
      setIsEmbeddingImages(true);
      await livretPrintService.preloadAllImagesAsBase64(targetParcels, (pct) => {
        setEmbedProgress(pct);
      });
      setIsEmbeddingImages(false);
      callback();
    } catch {
      setIsEmbeddingImages(false);
      callback();
    }
  };

  const handleLaunchPrint = () => {
    setPopupBlockedWarning(false);
    prepareImagesAndExecute(() => {
      const win = livretPrintService.openPrintWindow(parcels, printOptions);
      if (!win) {
        // Popup blocked fallback: run iframe print
        setPopupBlockedWarning(true);
        livretPrintService.printViaIframe(parcels, printOptions);
      } else {
        setTimeout(() => {
          win.focus();
          win.print();
        }, 600);
      }
    });
  };

  const handleOpenStandaloneWindow = () => {
    prepareImagesAndExecute(() => {
      const win = livretPrintService.openPrintWindow(parcels, printOptions);
      if (!win) {
        setPopupBlockedWarning(true);
      }
    });
  };

  const handleDownloadHtml = () => {
    prepareImagesAndExecute(() => {
      livretPrintService.downloadHtmlFile(parcels, printOptions);
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1400] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-4xl max-h-[92vh] rounded-3xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/90 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-zinc-950 flex items-center justify-center font-black shadow-md shrink-0">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-zinc-100 flex items-center gap-2">
                  <span>Édition & Impression des Livrets</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    PDF & Papier
                  </span>
                </h2>
                <p className="text-xs text-zinc-400 font-medium">
                  {targetParcels.length} parcelle(s) prête(s) pour l'impression A4 haute résolution
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Tab Selector */}
              <div className="flex items-center bg-zinc-800/90 p-1 rounded-xl border border-zinc-700">
                <button
                  onClick={() => setActiveTab('config')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'config'
                      ? 'bg-amber-500 text-zinc-950 font-black shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Options
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'preview'
                      ? 'bg-amber-500 text-zinc-950 font-black shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Aperçu Document
                </button>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Popup blocked warning notice */}
          {popupBlockedWarning && (
            <div className="bg-amber-950/80 border-b border-amber-500/40 px-4 py-2 text-xs text-amber-200 flex items-center justify-between gap-2">
              <span>⚠️ Les fenêtres pop-up sont bloquées par votre navigateur. L'impression automatique via iframe a été déclenchée. Vous pouvez aussi télécharger le livret autonome ci-dessous.</span>
              <button
                onClick={() => setPopupBlockedWarning(false)}
                className="text-amber-400 font-bold hover:underline"
              >
                OK
              </button>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {activeTab === 'config' ? (
              <div className="space-y-6 max-w-3xl mx-auto">
                {/* 1. SELECTION DU TYPE DE LIVRET (LES 2 LIVRETS DU DOMAINE) */}
                <div className="space-y-2.5">
                  <label className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>1. Choisir le format du livret</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Option 1: Livret des Vendanges (Synthèse Opérationnelle) */}
                    <div
                      onClick={() => setMode('vendanges')}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                        mode === 'vendanges'
                          ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-950/40'
                          : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="w-9 h-9 rounded-xl bg-amber-500 text-zinc-950 flex items-center justify-center font-black">
                          🍇
                        </div>
                        {mode === 'vendanges' && (
                          <div className="w-5 h-5 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center font-black text-xs">
                            ✓
                          </div>
                        )}
                      </div>

                      <h3 className="font-black text-sm text-zinc-100 mt-2.5">
                        Livret des Vendanges
                      </h3>
                      <p className="text-xs text-amber-400 font-bold mt-0.5">
                        Circuit de coupe & fiches de pointage
                      </p>
                      <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                        Tableau compact par commune avec ordre de passage, rangs, apporteurs, consignes d'accès et cases de relevé (caisses, kg, hL).
                      </p>

                      <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center gap-2 text-[11px] text-zinc-400 font-semibold">
                        <span>📄 Format A4 Portrait</span>
                        <span>•</span>
                        <span>⚡ Très condensé</span>
                      </div>
                    </div>

                    {/* Option 2: Grand Atlas Parcellaire Illustré (Fiche par fiche HD) */}
                    <div
                      onClick={() => setMode('atlas_illustre')}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                        mode === 'atlas_illustre'
                          ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-950/40'
                          : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="w-9 h-9 rounded-xl bg-amber-500 text-zinc-950 flex items-center justify-center font-black">
                          📖
                        </div>
                        {mode === 'atlas_illustre' && (
                          <div className="w-5 h-5 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center font-black text-xs">
                            ✓
                          </div>
                        )}
                      </div>

                      <h3 className="font-black text-sm text-zinc-100 mt-2.5">
                        Grand Atlas Parcellaire Illustré
                      </h3>
                      <p className="text-xs text-amber-400 font-bold mt-0.5">
                        Fiche par fiche HD (Cartes, Diapos & Photos)
                      </p>
                      <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                        Chaque parcelle sur une page A4 complète : Carte annotée avec repère orange, Diapositive PowerPoint originale du Domaine, photos et détails.
                      </p>

                      <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center gap-2 text-[11px] text-zinc-400 font-semibold">
                        <span>🖼️ Format A4 Paysage HD</span>
                        <span>•</span>
                        <span>🏛️ Prestige Domaine</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. PÉRIMÈTRE & FILTRES */}
                <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Filter className="w-3.5 h-3.5" />
                      <span>2. Périmètre d'impression ({targetParcels.length} parcelles)</span>
                    </label>

                    {initialParcel && (
                      <button
                        onClick={() => setOnlySelectedParcel(!onlySelectedParcel)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-all ${
                          onlySelectedParcel
                            ? 'bg-amber-500 text-zinc-950 border-amber-400'
                            : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                        }`}
                      >
                        {onlySelectedParcel ? `Fiche unique : ${initialParcel.properties.nom_parcelle}` : 'Imprimer le livret complet'}
                      </button>
                    )}
                  </div>

                  {!onlySelectedParcel && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Commune Filter */}
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                          Commune / Secteur
                        </label>
                        <select
                          value={selectedCommune}
                          onChange={(e) => setSelectedCommune(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-100 outline-none focus:border-amber-500"
                        >
                          <option value="ALL">Toutes les communes ({parcels.length})</option>
                          {communes.map((comm) => (
                            <option key={comm} value={comm}>
                              {comm} ({communeCounts[comm]})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Classification Filter */}
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                          Niveau d'appellation
                        </label>
                        <select
                          value={selectedLevel}
                          onChange={(e) => setSelectedLevel(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-100 outline-none focus:border-amber-500"
                        >
                          <option value="ALL">Tous les niveaux</option>
                          <option value="Grand Cru">Grands Crus</option>
                          <option value="1er Cru">Premiers Crus</option>
                          <option value="Village">Villages</option>
                          <option value="Régionale">Régionales / Bourgognes</option>
                        </select>
                      </div>

                      {/* Status Filter */}
                      <div>
                        <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                          Statut de récolte
                        </label>
                        <select
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-100 outline-none focus:border-amber-500"
                        >
                          <option value="ALL">Toutes les parcelles</option>
                          <option value="a_faire">À vendanger</option>
                          <option value="en_cours">En cours de coupe</option>
                          <option value="vendange">Déjà vendangées</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. OPTIONS COMPLÉMENTAIRES */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 text-xs">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={includeCoverPage}
                        onChange={(e) => setIncludeCoverPage(e.target.checked)}
                        className="w-4 h-4 rounded border-zinc-700 text-amber-500 focus:ring-amber-500 bg-zinc-950"
                      />
                      <span className="font-bold text-zinc-200">Page de garde prestige du Domaine</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={includeCheckboxes}
                        onChange={(e) => setIncludeCheckboxes(e.target.checked)}
                        className="w-4 h-4 rounded border-zinc-700 text-amber-500 focus:ring-amber-500 bg-zinc-950"
                      />
                      <span className="font-bold text-zinc-200">Cases de pointage & relevés terrain</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={includeTerrainPhotos}
                        onChange={(e) => setIncludeTerrainPhotos(e.target.checked)}
                        className="w-4 h-4 rounded border-zinc-700 text-amber-500 focus:ring-amber-500 bg-zinc-950"
                      />
                      <span className="font-bold text-zinc-200">Inclure les photos terrain enregistrées</span>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                        Chef d'équipe / Porteur du livret :
                      </label>
                      <input
                        type="text"
                        value={equipeName}
                        onChange={(e) => setEquipeName(e.target.value)}
                        placeholder="Ex : Équipe Olivier / Coupeurs Puligny"
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-zinc-100 outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-400 block mb-1">
                        Millésime :
                      </label>
                      <input
                        type="text"
                        value={millesime}
                        onChange={(e) => setMillesime(e.target.value)}
                        className="w-28 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs font-bold text-zinc-100 outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* LIVE PREVIEW IFRAME */
              <div className="h-full flex flex-col space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                  <span>Aperçu en temps réel conforme à l'impression papier</span>
                  <span className="text-amber-400 font-bold">{targetParcels.length} parcelle(s)</span>
                </div>
                <div className="flex-1 min-h-[460px] bg-white rounded-2xl overflow-hidden border border-zinc-700 shadow-inner">
                  <iframe
                    srcDoc={previewHtml}
                    title="Aperçu du Livret"
                    className="w-full h-full border-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-900/90 flex items-center justify-between gap-3 shrink-0 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              {isEmbeddingImages ? (
                <div className="flex items-center gap-2 text-amber-400 font-bold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Intégration haute fidélité des images ({embedProgress}%)...</span>
                </div>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Images haute fidélité 100% autonomes & certifiées hors-ligne</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Bouton Ouvrir plein écran */}
              <button
                disabled={isEmbeddingImages}
                onClick={handleOpenStandaloneWindow}
                className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 border border-zinc-700 disabled:opacity-50"
                title="Ouvrir dans un nouvel onglet"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Plein écran</span>
              </button>

              {/* Bouton Télécharger HTML autonome */}
              <button
                disabled={isEmbeddingImages}
                onClick={handleDownloadHtml}
                className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 border border-amber-500/30 disabled:opacity-50"
                title="Télécharger le document pour lecture hors-ligne avec toutes les images intégrées"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger HTML Autonome</span>
              </button>

              {/* Bouton Principal Imprimer / PDF */}
              <button
                disabled={isEmbeddingImages}
                onClick={handleLaunchPrint}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-amber-950/40 disabled:opacity-50"
              >
                <Printer className="w-4 h-4" />
                <span>{isEmbeddingImages ? 'Préparation...' : "Lancer l'Impression / PDF"}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
