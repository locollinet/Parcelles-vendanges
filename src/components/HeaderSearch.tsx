import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Filter, Wine, MapPin, Compass, ChevronDown, Upload, WifiOff, BookOpen, Settings, Sun, Sparkles, Check, Plus, Layers, Map as MapIcon, Printer } from 'lucide-react';
import { ClassificationLevel, ParcelFeature, VineyardRegion } from '../types';
import { BURGUNDY_REGIONS } from '../data/burgundyParcels';

interface HeaderSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchFocus?: () => void;
  displayScope?: 'livret' | 'all';
  onDisplayScopeChange?: (scope: 'livret' | 'all') => void;
  activeLevelFilter: string;
  onLevelFilterChange: (level: string) => void;
  searchResultCount: number;
  totalCachedCount: number;
  searchResults: ParcelFeature[];
  onSelectParcel: (parcel: ParcelFeature) => void;
  onJumpToRegion: (region: VineyardRegion) => void;
  fieldMode: boolean;
  onToggleFieldMode: () => void;
  onOpenListDrawer: () => void;
  onOpenImportExport: () => void;
  onOpenOfflineManager: () => void;
  onOpenHarvestModal: () => void;
  onOpenLivretExport?: (mode?: 'vendanges' | 'atlas_illustre') => void;
  onOpenBilanGlobal?: () => void;
  onOpenAddParcel?: () => void;
  onOpenUserGuide?: () => void;
  onCenterOnUser?: () => void;
  gpsStatus?: string;
  baseLayer?: 'voyager' | 'satellite';
  onToggleBaseLayer?: () => void;
}

export const HeaderSearch: React.FC<HeaderSearchProps> = ({
  searchQuery,
  onSearchChange,
  onSearchFocus,
  displayScope = 'livret',
  onDisplayScopeChange,
  activeLevelFilter,
  onLevelFilterChange,
  searchResultCount,
  searchResults,
  onSelectParcel,
  onJumpToRegion,
  fieldMode,
  onToggleFieldMode,
  onOpenListDrawer,
  onOpenImportExport,
  onOpenOfflineManager,
  onOpenHarvestModal,
  onOpenLivretExport,
  onOpenBilanGlobal,
  onOpenAddParcel,
  onOpenUserGuide,
  onCenterOnUser,
  gpsStatus = 'disabled',
  baseLayer = 'satellite',
  onToggleBaseLayer,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [isRegionMenuOpen, setIsRegionMenuOpen] = useState(false);
  const [inputValue, setInputValue] = useState(searchQuery);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local input value if parent searchQuery changes externally
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setIsSettingsMenuOpen(false);
        setIsRegionMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleInputFocus = () => {
    setIsDropdownOpen(true);
    if (onSearchFocus) {
      onSearchFocus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setIsDropdownOpen(true);
    if (onSearchFocus) {
      onSearchFocus();
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!val.trim()) {
      onSearchChange('');
    } else {
      debounceRef.current = setTimeout(() => {
        onSearchChange(val);
      }, 120);
    }
  };

  // Sub-filters when in Livret mode
  const livretSubLevels = [
    { label: '📖 Tout le Livret (156)', value: 'LIVRET' },
    { label: '⭐ Grands Crus', value: 'LIVRET:Grand Cru' },
    { label: '🟣 1ers Crus', value: 'LIVRET:1er Cru' },
    { label: '🟢 Villages', value: 'LIVRET:Village' },
    { label: '🔵 Régionales', value: 'LIVRET:Régionale' },
    { label: '⏳ À couper', value: 'LIVRET:a_faire' },
    { label: '⚡ En cours', value: 'LIVRET:en_cours' },
    { label: '✅ Vendangées', value: 'LIVRET:vendange' },
  ];

  // Sub-filters when in All Cadastre mode
  const allCadastreLevels = [
    { label: '🌐 Toutes les parcelles', value: 'ALL' },
    { label: '⭐ Grand Cru', value: 'Grand Cru' },
    { label: '🟣 1er Cru', value: '1er Cru' },
    { label: '🟢 Village', value: 'Village' },
    { label: '🔵 Régionale', value: 'Régionale' },
    { label: '⚪ IGP', value: 'IGP' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-[1000] p-2 sm:p-3 pointer-events-none">
      <div className="max-w-4xl mx-auto space-y-2 pointer-events-auto" ref={containerRef}>
        
        {/* Main Search Bar & Top Navigation Bar */}
        <div className={`flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-2xl shadow-xl backdrop-blur-md border transition-all ${
          fieldMode 
            ? 'bg-zinc-950/95 border-amber-500/60 text-zinc-50' 
            : 'bg-white/95 border-slate-200/90 text-slate-900 shadow-slate-900/5'
        }`}>
          {/* Logo & App Icon */}
          <div className="flex items-center gap-2 pl-1.5 sm:pl-2 pr-1 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-zinc-950 font-black shadow-md">
              <Wine className="w-5 h-5 text-zinc-950 stroke-[2.5]" />
            </div>
            <div className="hidden lg:block">
              <h1 className="text-xs font-black uppercase tracking-wider text-amber-700">Vignobles de France</h1>
              <p className="text-[10px] font-bold text-slate-500 leading-none">Cadastre & INAO d’État</p>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 min-w-[130px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onClick={handleInputFocus}
              placeholder="Rechercher un climat, une appellation..."
              className={`w-full pl-9 pr-8 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all outline-none ${
                fieldMode
                  ? 'bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500'
                  : 'bg-slate-100/90 border border-slate-200/80 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500'
              }`}
            />
            {inputValue && (
              <button
                onClick={() => {
                  setInputValue('');
                  onSearchChange('');
                  setIsDropdownOpen(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Livret Parcellaire Vendanges Shortcut Button */}
          <button
            onClick={onOpenHarvestModal}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl border shrink-0 transition-all active:scale-95 flex items-center gap-1.5 text-xs font-black shadow-md ${
              fieldMode
                ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 border-amber-400 shadow-amber-500/20'
                : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 border-amber-400 shadow-amber-500/20'
            }`}
            title="Consulter les 156 parcelles du Livret des Vendanges"
          >
            <BookOpen className="w-4 h-4 text-zinc-950 stroke-[2.5]" />
            <span className="hidden xs:inline">Livret</span>
            <span className="px-1.5 py-0.2 rounded-md text-[10px] font-black bg-zinc-950 text-amber-400">156</span>
          </button>

          {/* Guide Vendanges Button */}
          {onOpenUserGuide && (
            <button
              onClick={onOpenUserGuide}
              className="p-2 sm:px-3 sm:py-2 rounded-xl border shrink-0 transition-all active:scale-95 flex items-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-950/20"
              title="Guide d'utilisation Vendanges 2024 & Fiche terrain à imprimer"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span className="hidden sm:inline">Guide</span>
            </button>
          )}

          {/* List View Drawer Button */}
          <button
            onClick={onOpenListDrawer}
            className={`p-2.5 rounded-xl border shrink-0 transition-all active:scale-95 ${
              fieldMode
                ? 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-200'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
            }`}
            title="Afficher la liste des parcelles"
          >
            <Filter className="w-4 h-4" />
          </button>

          {/* Direct Add New Parcel / Fiche Button on Main Interface */}
          {onOpenAddParcel && (
            <button
              onClick={onOpenAddParcel}
              className={`p-2.5 sm:px-3 sm:py-2 rounded-xl border shrink-0 transition-all active:scale-95 flex items-center gap-1.5 text-xs font-bold ${
                fieldMode
                  ? 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-amber-400'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
              }`}
              title="Créer une nouvelle fiche parcelle"
            >
              <Plus className="w-4 h-4 text-amber-500 stroke-[2.5]" />
              <span className="hidden sm:inline">Nouvelle fiche</span>
            </button>
          )}

          {/* Satellite / Plan Basemap Toggle Button */}
          {onToggleBaseLayer && (
            <button
              onClick={onToggleBaseLayer}
              className={`p-2.5 rounded-xl border shrink-0 transition-all active:scale-95 flex items-center justify-center ${
                baseLayer === 'satellite'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 border-emerald-400 font-bold shadow-md shadow-emerald-500/20'
                  : fieldMode
                  ? 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-200'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
              title={baseLayer === 'satellite' ? "Vue Satellite active (cliquer pour Plan)" : "Vue Plan active (cliquer pour Satellite)"}
            >
              {baseLayer === 'satellite' ? <Layers className="w-4 h-4 stroke-[2.5]" /> : <MapIcon className="w-4 h-4" />}
            </button>
          )}

          {/* Discreet Settings & Tools Popover Menu */}
          <div className="relative shrink-0">
            <button
              onClick={() => {
                setIsSettingsMenuOpen(!isSettingsMenuOpen);
                setIsRegionMenuOpen(false);
              }}
              className={`p-2.5 rounded-xl border shrink-0 transition-all active:scale-95 flex items-center justify-center relative ${
                isSettingsMenuOpen
                  ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold'
                  : fieldMode
                  ? 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-200'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
              title="Paramètres, Domaine & Outils"
            >
              <Settings className="w-4 h-4" />
              {fieldMode && !isSettingsMenuOpen && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-zinc-950 animate-pulse" />
              )}
            </button>

            {/* Discreet Settings Popover */}
            {isSettingsMenuOpen && (
              <div className={`absolute right-0 top-full mt-2 w-72 rounded-2xl shadow-2xl p-2.5 space-y-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 border ${
                fieldMode
                  ? 'bg-zinc-900 border-zinc-700 text-zinc-100'
                  : 'bg-white border-slate-200 text-slate-900'
              }`}>
                <div className="px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Outils & Paramètres
                </div>

                {/* Satellite / Plan Basemap Toggle Row */}
                {onToggleBaseLayer && (
                  <button
                    onClick={() => {
                      onToggleBaseLayer();
                    }}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between group ${
                      baseLayer === 'satellite' ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300' : 'hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${baseLayer === 'satellite' ? 'bg-emerald-500 text-zinc-950' : 'bg-slate-200 text-slate-700'}`}>
                        {baseLayer === 'satellite' ? <Layers className="w-4 h-4 stroke-[2.5]" /> : <MapIcon className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="text-xs font-black block">Fond de Carte</span>
                        <span className="text-[10px] text-slate-400 block font-medium">
                          {baseLayer === 'satellite' ? 'Vue Satellite haute résolution' : 'Vue Plan & Relief'}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[11px] font-black px-2 py-0.5 rounded-md ${
                      baseLayer === 'satellite' ? 'bg-emerald-500 text-zinc-950' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {baseLayer === 'satellite' ? 'SATELLITE' : 'PLAN'}
                    </span>
                  </button>
                )}

                {/* Mode Terrain Toggle Row */}
                <button
                  onClick={() => {
                    onToggleFieldMode();
                  }}
                  className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between group ${
                    fieldMode ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300' : 'hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${fieldMode ? 'bg-amber-500 text-zinc-950' : 'bg-amber-100 text-amber-700'}`}>
                      <Sun className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="text-xs font-black block">Mode Terrain</span>
                      <span className="text-[10px] text-slate-400 block font-medium">Contraste plein soleil en vigne</span>
                    </div>
                  </div>
                  <span className={`text-[11px] font-black px-2 py-0.5 rounded-md ${
                    fieldMode ? 'bg-amber-500 text-zinc-950' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {fieldMode ? 'ACTIF' : 'OFF'}
                  </span>
                </button>

                {/* Ajouter une nouvelle parcelle Button */}
                {onOpenAddParcel && (
                  <button
                    onClick={() => {
                      setIsSettingsMenuOpen(false);
                      onOpenAddParcel();
                    }}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between group ${
                      fieldMode ? 'hover:bg-zinc-800' : 'hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-500 font-black flex items-center justify-center">
                        <span className="text-sm leading-none">+</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold block text-amber-500">Ajouter une fiche parcelle</span>
                        <span className="text-[10px] text-slate-400 block font-medium">Position GPS, photo & synchronisation équipe</span>
                      </div>
                    </div>
                  </button>
                )}

                {/* Livret & Grand Atlas PDF Export Button */}
                {onOpenLivretExport && (
                  <button
                    onClick={() => {
                      setIsSettingsMenuOpen(false);
                      onOpenLivretExport('vendanges');
                    }}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between group bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-amber-500 text-zinc-950 font-black">
                        <Printer className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-black block text-amber-400">Imprimer Livrets & Atlas PDF</span>
                        <span className="text-[10px] text-zinc-400 block font-medium">Édition papier A4 & fiches illustrées</span>
                      </div>
                    </div>
                  </button>
                )}

                {/* Domaine Import/Export Button */}
                <button
                  onClick={() => {
                    setIsSettingsMenuOpen(false);
                    onOpenImportExport();
                  }}
                  className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between group ${
                    fieldMode ? 'hover:bg-zinc-800' : 'hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block">Gestion Domaine</span>
                      <span className="text-[10px] text-slate-400 block font-medium">Import / Export KML, GeoJSON, CSV</span>
                    </div>
                  </div>
                </button>

                {/* Bilan Global Vendanges Shortcut Button */}
                {onOpenBilanGlobal && (
                  <button
                    onClick={() => {
                      setIsSettingsMenuOpen(false);
                      onOpenBilanGlobal();
                    }}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between group bg-amber-500/10 border border-amber-500/40 text-amber-300 hover:bg-amber-500/20`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-amber-500 text-zinc-950 font-black">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-black block text-amber-400">Bilan Global des Vendanges</span>
                        <span className="text-[10px] text-zinc-400 block font-medium">Copier / coller pour WhatsApp & SMS</span>
                      </div>
                    </div>
                  </button>
                )}

                {/* Guide Utilisateur Vendanges 2024 */}
                {onOpenUserGuide && (
                  <button
                    onClick={() => {
                      setIsSettingsMenuOpen(false);
                      onOpenUserGuide();
                    }}
                    className="w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between group bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-500 text-zinc-950 font-black">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-black block text-emerald-400">Guide d'Utilisation Vendanges</span>
                        <span className="text-[10px] text-zinc-400 block font-medium">Pour Directrice Technique, Coupeurs & Fiche A4</span>
                      </div>
                    </div>
                  </button>
                )}

                {/* Mode Hors-Ligne Livret Button */}
                <button
                  onClick={() => {
                    setIsSettingsMenuOpen(false);
                    onOpenOfflineManager();
                  }}
                  className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between group ${
                    fieldMode ? 'hover:bg-zinc-800' : 'hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      <WifiOff className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block">Mode Hors-Ligne</span>
                      <span className="text-[10px] text-slate-400 block font-medium">Parcelles du Livret (156) sans 4G</span>
                    </div>
                  </div>
                </button>

                {/* Secteurs / Vignobles Jump */}
                <div className="pt-1.5 border-t border-slate-200 dark:border-zinc-800">
                  <div className="px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Secteurs de Bourgogne
                  </div>
                  <div className="space-y-0.5 max-h-36 overflow-y-auto">
                    {BURGUNDY_REGIONS.map((region) => (
                      <button
                        key={region.name}
                        onClick={() => {
                          onJumpToRegion(region);
                          setIsSettingsMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
                          fieldMode ? 'hover:bg-zinc-800 text-zinc-200' : 'hover:bg-slate-100 text-slate-800'
                        }`}
                      >
                        <span className="truncate">{region.name}</span>
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>

        {/* Scope Selector (Livret Domaine vs Toute la Bourgogne) & Filter Pills */}
        <div className="space-y-1.5">
          {/* Main Scope Switcher Segment */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-lg">
            <button
              onClick={() => {
                if (onDisplayScopeChange) onDisplayScopeChange('livret');
                onLevelFilterChange('LIVRET');
              }}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 active:scale-98 ${
                displayScope === 'livret'
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <span>🍇 Livret Domaine</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                displayScope === 'livret' ? 'bg-zinc-950 text-amber-400' : 'bg-zinc-800 text-zinc-300'
              }`}>
                156
              </span>
            </button>

            <button
              onClick={() => {
                if (onDisplayScopeChange) onDisplayScopeChange('all');
                onLevelFilterChange('ALL');
              }}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 active:scale-98 ${
                displayScope === 'all'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              <span>🌐 Toute la Bourgogne</span>
            </button>
          </div>

          {/* Sub-Filters Pills Bar tailored to active scope */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar px-0.5">
            {displayScope === 'livret' ? (
              livretSubLevels.map((lvl) => {
                const isActive = activeLevelFilter === lvl.value;
                return (
                  <button
                    key={lvl.value}
                    onClick={() => onLevelFilterChange(lvl.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shadow-sm active:scale-95 ${
                      isActive
                        ? 'bg-amber-500 text-zinc-950 border-amber-400 font-black shadow-amber-500/20'
                        : fieldMode
                        ? 'bg-zinc-900/90 text-amber-300/80 border-amber-500/30 hover:bg-zinc-800'
                        : 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    {lvl.label}
                  </button>
                );
              })
            ) : (
              <>
                {allCadastreLevels.map((lvl) => {
                  const isActive = activeLevelFilter === lvl.value;
                  return (
                    <button
                      key={lvl.value}
                      onClick={() => onLevelFilterChange(lvl.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shadow-sm active:scale-95 ${
                        isActive
                          ? 'bg-blue-600 text-white border-blue-500 font-black shadow-blue-600/20'
                          : fieldMode
                          ? 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                          : 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-white'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  );
                })}
                <button
                  onClick={() => {
                    if (onDisplayScopeChange) onDisplayScopeChange('livret');
                    onLevelFilterChange('LIVRET');
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap bg-amber-500/20 border border-amber-500/50 text-amber-300 hover:bg-amber-500/30 transition-all shrink-0"
                >
                  ↩️ Revenir au Livret (156)
                </button>
              </>
            )}
          </div>
        </div>

        {/* Autocomplete Search Results Dropdown */}
        {isDropdownOpen && searchQuery.trim().length > 0 && (
          <div className={`rounded-2xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto divide-y animate-in fade-in zoom-in-95 duration-150 border ${
            fieldMode
              ? 'bg-zinc-900/95 border-zinc-700 divide-zinc-800 text-zinc-100'
              : 'bg-white/98 border-slate-200 divide-slate-100 text-slate-900'
          }`}>
            <div className="px-3.5 py-2.5 bg-slate-50/80 text-xs font-bold text-slate-500 flex justify-between items-center">
              <span>{searchResultCount} parcelle(s) trouvée(s)</span>
              <button
                onClick={() => setIsDropdownOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-[11px] font-semibold"
              >
                Fermer
              </button>
            </div>

            {searchResults.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                Aucune parcelle trouvée pour <span className="text-slate-900 font-bold">"{searchQuery}"</span>
              </div>
            ) : (
              searchResults.slice(0, 10).map((parcel) => {
                const props = parcel.properties;
                return (
                  <button
                    key={props.id || props.code_parcel}
                    onClick={() => {
                      onSelectParcel(parcel);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left p-3.5 transition-all flex items-center justify-between group ${
                      fieldMode ? 'hover:bg-zinc-800/90' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0 pr-2">
                      <div className="text-sm font-black text-slate-900 group-hover:text-blue-600 truncate">
                        {props.climat || props.nom_app}
                      </div>
                      <div className="text-xs text-slate-500 font-medium truncate flex items-center gap-1.5">
                        <span className="font-bold text-slate-700">{props.nom_app}</span>
                        <span>•</span>
                        <span>{props.commune}</span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest shrink-0 ${
                        props.niveau === 'Grand Cru'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : props.niveau === '1er Cru'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : props.niveau === 'Village'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : props.niveau === 'IGP'
                          ? 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {props.niveau}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        )}

      </div>
    </header>
  );
};
