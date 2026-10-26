import React, { useState, useEffect } from 'react';
import { offlineCacheManager, SavedSector } from '../services/OfflineCacheManager';
import { LEFLAIVE_PARCEL_FEATURES } from '../data/leflaiveCatalog';
import { dataManager } from '../services/DataManager';
import { WifiOff, Download, Trash2, CheckCircle, Database, X, BookOpen, MapPin, Sparkles } from 'lucide-react';

interface OfflineManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fieldMode?: boolean;
  onSectorLoaded?: () => void;
}

const LIVRET_SECTORS = [
  {
    id: 'livret_puligny_grands_crus',
    name: 'Puligny-Montrachet & Grands Crus',
    subregion: 'Cœur Historique du Domaine',
    communes: ['Puligny-Montrachet'],
    center: [46.9635, 4.7555] as [number, number],
    featureCount: 65,
    description: 'Montrachet, Chevalier, Bâtard, Bienvenues-Bâtard, 1ers Crus & climats villages'
  },
  {
    id: 'livret_meursault_chassagne',
    name: 'Meursault & Chassagne-Montrachet',
    subregion: 'Côte de Beaune',
    communes: ['Meursault', 'Chassagne-Montrachet'],
    center: [46.9780, 4.7700] as [number, number],
    featureCount: 24,
    description: 'Sous le Dos d’Âne, Narvaux, Chassagne 1ers Crus & villages'
  },
  {
    id: 'livret_auxey_saint_romain_pernand',
    name: 'Auxey-Duresses, Saint-Romain, Pernand & Environs',
    subregion: 'Hautes Côtes & Collines',
    communes: ['Auxey-Duresses', 'Saint-Romain', 'Pernand-Vergelesses', 'Pommard', 'Volnay', 'Monthelie'],
    center: [46.9950, 4.7400] as [number, number],
    featureCount: 32,
    description: 'La Macabrée, Sous Frétilles, Saint-Romain, Pommard'
  },
  {
    id: 'livret_maconnais_chalonnaise',
    name: 'Mâconnais & Côte Chalonnaise',
    subregion: 'Vignobles du Sud & Rully',
    communes: ['Mâcon-Verzé', 'Pouilly-Fuissé', 'Solutré-Pouilly', 'Rully', 'Montagny-Rosey-Mercurey'],
    center: [46.3600, 4.7500] as [number, number],
    featureCount: 35,
    description: 'Domaine de Mâcon-Verzé, Pouilly-Fuissé, Solutré, Rully, Rosey'
  },
];

export const OfflineManagerModal: React.FC<OfflineManagerModalProps> = ({
  isOpen,
  onClose,
  fieldMode,
  onSectorLoaded,
}) => {
  const [savedSectors, setSavedSectors] = useState<SavedSector[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSavedSectors(offlineCacheManager.getSavedSectorsIndex());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isFullLivretSaved = offlineCacheManager.isFullLivretSaved();

  const handleDownloadFullLivret = () => {
    setDownloadingId('livret_integral_156');
    setTimeout(() => {
      offlineCacheManager.saveFullLivret();
      // Inject into data manager so map displays them offline immediately
      dataManager.addCustomFeatures(LEFLAIVE_PARCEL_FEATURES);
      setSavedSectors(offlineCacheManager.getSavedSectorsIndex());
      setDownloadingId(null);
      if (onSectorLoaded) onSectorLoaded();
    }, 450);
  };

  const handleDownloadLivretSector = (sec: typeof LIVRET_SECTORS[0]) => {
    setDownloadingId(sec.id);
    setTimeout(() => {
      // Filter the 156 features specifically for this sector
      const matchingFeatures = LEFLAIVE_PARCEL_FEATURES.filter((f) => {
        const comm = (f.properties.commune || '').toLowerCase();
        return sec.communes.some((c) => comm.includes(c.toLowerCase()) || c.toLowerCase().includes(comm));
      });

      const featuresToSave = matchingFeatures.length > 0 ? matchingFeatures : LEFLAIVE_PARCEL_FEATURES.slice(0, sec.featureCount);

      offlineCacheManager.saveSector(
        sec.id,
        sec.name,
        sec.subregion,
        sec.communes,
        sec.center,
        featuresToSave,
        true
      );

      dataManager.addCustomFeatures(featuresToSave);
      setSavedSectors(offlineCacheManager.getSavedSectorsIndex());
      setDownloadingId(null);
      if (onSectorLoaded) onSectorLoaded();
    }, 400);
  };

  const handleDeleteSector = (secId: string) => {
    offlineCacheManager.deleteSector(secId);
    setSavedSectors(offlineCacheManager.getSavedSectorsIndex());
  };

  const totalSizeMb = offlineCacheManager.getTotalOfflineSizeMb();

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-xl rounded-3xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh] ${
          fieldMode
            ? 'bg-zinc-950 border-amber-500/40 text-zinc-100'
            : 'bg-zinc-900 border-zinc-800 text-zinc-100'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-wide text-zinc-100">
                  Mode Hors-Ligne • Livret des Vendanges
                </h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-500 text-zinc-950">
                  156 parcelles
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Téléchargement direct des 156 parcelles pour les zones de vignes sans couverture 4G
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Banner */}
        <div className="px-6 py-3 bg-zinc-950/80 border-b border-zinc-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-zinc-300 font-medium">
            <Database className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Stockage hors-ligne utilisé : <strong>{totalSizeMb} Mo</strong> ({savedSectors.length} pack(s) actif(s))
            </span>
          </div>
          {savedSectors.length > 0 && (
            <button
              onClick={() => {
                offlineCacheManager.clearAllOffline();
                setSavedSectors([]);
              }}
              className="text-[11px] font-bold text-rose-400 hover:text-rose-300"
            >
              Vider le cache
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Master 1-Tap Download for the 156 parcels */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-zinc-900 border border-amber-500/40 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <h4 className="text-sm font-black text-amber-400 uppercase tracking-wide">
                    Pack Intégral • Tout le Livret (156 parcelles)
                  </h4>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Enregistre en 1 clic l'intégralité des 156 parcelles du Domaine (polygones GPS, rangs, climats, fiches techniques).
                </p>
              </div>

              <div className="shrink-0">
                {isFullLivretSaved ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-black border border-emerald-500/30">
                      <CheckCircle className="w-4 h-4" />
                      Prêt Hors-Ligne
                    </span>
                    <button
                      onClick={() => handleDeleteSector('livret_integral_156')}
                      className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-zinc-950 transition-all"
                      title="Supprimer le pack intégral"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleDownloadFullLivret}
                    disabled={downloadingId === 'livret_integral_156'}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black transition-all active:scale-95 shadow-lg shadow-amber-500/20 disabled:opacity-50"
                  >
                    {downloadingId === 'livret_integral_156' ? (
                      <span className="w-4 h-4 rounded-full border-2 border-zinc-950 border-t-transparent animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 stroke-[2.5]" />
                    )}
                    <span>{downloadingId === 'livret_integral_156' ? 'Téléchargement...' : 'Télécharger (156)'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sub-sectors list of Livret */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400">
              Ou télécharger par secteur du Livret
            </h4>

            {LIVRET_SECTORS.map((sec) => {
              const isSaved = savedSectors.some((s) => s.id === sec.id);
              const savedInfo = savedSectors.find((s) => s.id === sec.id);
              const isDownloading = downloadingId === sec.id;

              return (
                <div
                  key={sec.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isSaved
                      ? 'bg-emerald-950/20 border-emerald-500/40'
                      : 'bg-zinc-950/50 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-amber-400 px-2 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/20 shrink-0">
                        {sec.featureCount} parcelles
                      </span>
                      <h5 className="text-xs sm:text-sm font-bold text-zinc-100 truncate">{sec.name}</h5>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      {sec.communes.join(', ')}
                    </p>

                    {isSaved && savedInfo && (
                      <span className="inline-flex items-center gap-1.5 mt-2 text-[11px] font-bold text-emerald-400">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Disponible hors-ligne ({savedInfo.featureCount} parcelles)
                      </span>
                    )}
                  </div>

                  <div className="shrink-0">
                    {isSaved ? (
                      <button
                        onClick={() => handleDeleteSector(sec.id)}
                        className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-zinc-950 transition-all"
                        title="Supprimer ce secteur hors-ligne"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDownloadLivretSector(sec)}
                        disabled={isDownloading || isFullLivretSaved}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all active:scale-95 disabled:opacity-40"
                      >
                        {isDownloading ? (
                          <span className="w-3.5 h-3.5 rounded-full border-2 border-zinc-200 border-t-transparent animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                        <span>{isDownloading ? '...' : 'Télécharger'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};
