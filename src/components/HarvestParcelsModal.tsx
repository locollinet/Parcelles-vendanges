import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Search, 
  Wine, 
  MapPin, 
  Navigation, 
  Compass, 
  BookOpen, 
  Layers, 
  Check, 
  ChevronRight, 
  SlidersHorizontal,
  ExternalLink,
  Users,
  Printer,
  FileText,
  Download
} from 'lucide-react';
import { ParcelFeature, ClassificationLevel } from '../types';
import { LEFLAIVE_PARCEL_FEATURES, LEFLAIVE_MASTER_CATALOG } from '../data/leflaiveCatalog';
import { geoService } from '../services/GeoService';

interface HarvestParcelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  parcels?: ParcelFeature[];
  onSelectParcel: (parcel: ParcelFeature) => void;
  onOpenLivretExport?: (mode?: 'vendanges' | 'atlas_illustre') => void;
  fieldMode: boolean;
}

export const HarvestParcelsModal: React.FC<HarvestParcelsModalProps> = ({
  isOpen,
  onClose,
  parcels,
  onSelectParcel,
  onOpenLivretExport,
  fieldMode
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCommune, setSelectedCommune] = useState<string>('ALL');
  const [selectedColor, setSelectedColor] = useState<string>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');

  // List of all 156 harvest features (live sync from DataManager/Firestore)
  const allHarvestParcels = parcels && parcels.length > 0 ? parcels : LEFLAIVE_PARCEL_FEATURES;

  // Extract unique communes with counts
  const communeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allHarvestParcels.forEach((p) => {
      const comm = p.properties.commune || 'Autre';
      counts[comm] = (counts[comm] || 0) + 1;
    });
    return counts;
  }, [allHarvestParcels]);

  const communes = useMemo(() => {
    return Object.keys(communeCounts).sort((a, b) => communeCounts[b] - communeCounts[a]);
  }, [communeCounts]);

  // Filtered harvest parcels
  const filteredParcels = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return allHarvestParcels.filter((parcel) => {
      const p = parcel.properties;
      
      // Match search query
      if (q) {
        const matchesName = (p.nom_parcelle || p.climat || '').toLowerCase().includes(q);
        const matchesApp = (p.appellation || p.nom_app || '').toLowerCase().includes(q);
        const matchesCommune = (p.commune || '').toLowerCase().includes(q);
        const matchesCode = (p.code_livret || p.code_parcelle || '').toLowerCase().includes(q);
        const matchesProprietaire = (p.proprietaire || p.vigneron || '').toLowerCase().includes(q);
        const matchesNumero = p.numero_livret ? String(p.numero_livret).includes(q) : false;
        const matchesPage = p.page_livret ? `page ${p.page_livret}`.includes(q) || String(p.page_livret) === q : false;
        const matchesSecteur = (p.secteur_livret || '').toLowerCase().includes(q);
        const matchesRangs = (p.nb_rangs_details || '').toLowerCase().includes(q);

        if (!matchesName && !matchesApp && !matchesCommune && !matchesCode && !matchesProprietaire && !matchesNumero && !matchesPage && !matchesSecteur && !matchesRangs) {
          return false;
        }
      }

      // Match commune filter
      if (selectedCommune !== 'ALL' && p.commune !== selectedCommune) {
        return false;
      }

      // Match color filter
      if (selectedColor !== 'ALL') {
        const color = p.couleur || (p.cepage?.includes('Pinot') ? 'Rouge' : 'Blanc');
        if (selectedColor === 'Blanc' && color !== 'Blanc') return false;
        if (selectedColor === 'Rouge' && color !== 'Rouge') return false;
        if (selectedColor === 'Aligoté' && color !== 'Aligoté') return false;
      }

      // Match classification level filter
      if (selectedLevel !== 'ALL' && p.niveau !== selectedLevel) {
        return false;
      }

      return true;
    });
  }, [allHarvestParcels, searchQuery, selectedCommune, selectedColor, selectedLevel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1300] bg-black/80 backdrop-blur-md flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4"
          onClick={onClose}
        >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          className="w-full max-w-2xl h-[94vh] sm:h-[88vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border bg-zinc-950 border-zinc-800 text-zinc-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/90 space-y-3 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-zinc-950 font-black flex items-center justify-center shadow-md shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black tracking-tight text-zinc-100">
                      Livret des Vendanges
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/20 border border-amber-500/40 text-amber-400">
                      {allHarvestParcels.length} parcelles
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-medium">
                    Catalogue intégral des parcelles vendangées & fiches terrain
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenLivretExport ? onOpenLivretExport('vendanges') : undefined}
                  className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 shadow-md shrink-0"
                  title="Imprimer ou exporter en PDF le livret des vendanges ou le grand atlas illustré"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">Imprimer / PDF</span>
                </button>

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition-all shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par climat, code (P44-61...), apporteur, commune..."
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all outline-none border bg-zinc-950 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:border-amber-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-zinc-400 hover:text-zinc-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Communes Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1">
              <button
                onClick={() => setSelectedCommune('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                  selectedCommune === 'ALL'
                    ? 'bg-amber-500 text-zinc-950 border-amber-400 font-black shadow-sm'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                }`}
              >
                Toutes ({allHarvestParcels.length})
              </button>

              {communes.map((comm) => {
                const count = communeCounts[comm];
                const isActive = selectedCommune === comm;
                return (
                  <button
                    key={comm}
                    onClick={() => setSelectedCommune(comm)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                      isActive
                        ? 'bg-amber-500 text-zinc-950 border-amber-400 font-black shadow-sm'
                        : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                    }`}
                  >
                    {comm} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results Summary Bar */}
          <div className="px-4 py-2 text-xs font-bold flex items-center justify-between border-b shrink-0 bg-zinc-950 text-zinc-400 border-zinc-800">
            <span>
              <strong className="text-amber-400">{filteredParcels.length}</strong> parcelle(s) correspondante(s)
            </span>
            {(searchQuery || selectedCommune !== 'ALL' || selectedColor !== 'ALL' || selectedLevel !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCommune('ALL');
                  setSelectedColor('ALL');
                  setSelectedLevel('ALL');
                }}
                className="text-amber-400 hover:underline font-bold text-[11px]"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>

          {/* Parcels List */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
            {filteredParcels.length === 0 ? (
              <div className="text-center py-16 space-y-2">
                <Wine className="w-10 h-10 mx-auto text-zinc-600" />
                <p className="text-sm font-bold text-zinc-300">
                  Aucune parcelle trouvée
                </p>
                <p className="text-xs text-zinc-500">
                  Essayez avec un autre nom de climat, code ou commune.
                </p>
              </div>
            ) : (
              filteredParcels.map((parcel) => {
                const p = parcel.properties;
                const mapsUrl = geoService.getGoogleMapsUrl(parcel);

                const isGrandCru = p.niveau === 'Grand Cru';
                const isPremierCru = p.niveau === '1er Cru';
                const isVillage = p.niveau === 'Village';

                return (
                  <div
                    key={p.id}
                    className="p-3.5 sm:p-4 rounded-2xl border transition-all space-y-2.5 bg-zinc-900/90 border-zinc-800 hover:border-amber-500/50"
                  >
                    {/* Header Row: Climat & Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                            isGrandCru
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                              : isPremierCru
                              ? 'bg-purple-500/20 text-purple-400 border-purple-500/50'
                              : isVillage
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                              : 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                          }`}>
                            {p.niveau}
                          </span>

                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            p.couleur === 'Rouge' 
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' 
                              : p.couleur === 'Aligoté'
                              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}>
                            {p.couleur || 'Blanc'}
                          </span>

                          {p.page_livret && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                              Page {p.page_livret}
                            </span>
                          )}

                          {p.harvest_status === 'vendange' && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                              <span>✓</span>
                              <span>Vendangé</span>
                              {(p.harvest_caisses || p.harvest_hl || p.harvest_kg) && (
                                <span className="font-normal opacity-90">
                                  ({[
                                    p.harvest_caisses ? `${p.harvest_caisses} c.` : null,
                                    p.harvest_hl ? `${p.harvest_hl} hL` : null,
                                    p.harvest_kg ? `${p.harvest_kg} kg` : null
                                  ].filter(Boolean).join(' • ')})
                                </span>
                              )}
                            </span>
                          )}

                          {p.harvest_status === 'en_cours' && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1">
                              <span>⏳</span>
                              <span>En cours</span>
                              {(p.harvest_caisses || p.harvest_hl || p.harvest_kg) && (
                                <span className="font-normal opacity-90">
                                  ({[
                                    p.harvest_caisses ? `${p.harvest_caisses} c.` : null,
                                    p.harvest_hl ? `${p.harvest_hl} hL` : null,
                                    p.harvest_kg ? `${p.harvest_kg} kg` : null
                                  ].filter(Boolean).join(' • ')})
                                </span>
                              )}
                            </span>
                          )}
                        </div>

                        <h3 className="text-base sm:text-lg font-black tracking-tight text-zinc-100 pt-0.5">
                          {p.nom_parcelle || p.climat}
                        </h3>

                        <p className="text-xs font-bold text-amber-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span>{p.appellation || p.nom_app} • {p.commune}</span>
                        </p>
                      </div>

                      {/* Code Pill */}
                      <div className="text-right shrink-0">
                        <div className="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono text-xs font-black">
                          {p.code_livret}
                          {p.numero_livret ? ` (N°${p.numero_livret})` : ''}
                        </div>
                      </div>
                    </div>

                    {/* Details Row: Rangs & Apporteur */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-zinc-800">
                      {p.nb_rangs_details && (
                        <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
                          <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span><strong>Rangs :</strong> {p.nb_rangs_details}</span>
                        </div>
                      )}

                      {p.proprietaire && (
                        <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                          <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span><strong>Apporteur :</strong> {p.proprietaire}</span>
                        </div>
                      )}
                    </div>

                    {/* Access Notice if exists */}
                    {p.notes_acces && (
                      <div className="p-2 rounded-xl bg-amber-950/40 text-[11px] text-amber-200 font-medium border border-amber-800/60">
                        ⚠️ <strong>Accès :</strong> {p.notes_acces}
                      </div>
                    )}

                    {/* Action Buttons: Voir sur la carte & Guidage GPS */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          onSelectParcel(parcel);
                          onClose();
                        }}
                        className="flex-1 py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] shadow-sm bg-amber-500 hover:bg-amber-400 text-zinc-950"
                      >
                        <Compass className="w-4 h-4" />
                        <span>Localiser sur la carte</span>
                      </button>

                      {mapsUrl && (
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2.5 px-4 rounded-xl font-bold text-xs bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                          title="Lancer le guidage Google Maps"
                        >
                          <Navigation className="w-4 h-4" />
                          <span>GPS Itinéraire</span>
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
