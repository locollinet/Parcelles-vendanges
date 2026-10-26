import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapManager } from './services/MapManager';
import { geoService } from './services/GeoService';
import { dataManager } from './services/DataManager';
import { offlineCacheManager } from './services/OfflineCacheManager';
import { BoundingBox, LocationState, ParcelFeature, ParcelProperties, VineyardRegion } from './types';
import { HeaderSearch } from './components/HeaderSearch';
import { BottomSheet } from './components/BottomSheet';
import { GpsFloatingButton } from './components/GpsFloatingButton';
import { ZoomWarningBanner } from './components/ZoomWarningBanner';
import { FieldModeToggle } from './components/FieldModeToggle';
import { ParcelListDrawer } from './components/ParcelListDrawer';
import { NearbyParcelsPanel } from './components/NearbyParcelsPanel';
import { ParcelRibbonBanner } from './components/ParcelRibbonBanner';
import { ImportExportModal } from './components/ImportExportModal';
import { OfflineManagerModal } from './components/OfflineManagerModal';
import { HarvestParcelsModal } from './components/HarvestParcelsModal';
import { HarvestScheduleModal } from './components/HarvestScheduleModal';
import { HarvestDashboardModal } from './components/HarvestDashboardModal';
import { HarvestFloatingShortcut } from './components/HarvestFloatingShortcut';
import { AddParcelModal } from './components/AddParcelModal';
import { BilanGlobalModal } from './components/BilanGlobalModal';
import { LivretExportModal } from './components/LivretExportModal';
import { UserGuideModal } from './components/UserGuideModal';

export default function App() {
  const mapManagerRef = useRef<MapManager | null>(null);
  const shouldCenterOnNextFixRef = useRef<boolean>(false);
  
  // App state
  const [currentZoom, setCurrentZoom] = useState<number>(15);
  const [isLoadingNetwork, setIsLoadingNetwork] = useState<boolean>(false);
  const [selectedParcel, setSelectedParcel] = useState<ParcelFeature | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  const [cachedParcels, setCachedParcels] = useState<ParcelFeature[]>([]);
  const [harvestParcels, setHarvestParcels] = useState<ParcelFeature[]>(() => dataManager.getHarvestParcels());
  const [displayScope, setDisplayScope] = useState<'livret' | 'all'>('livret');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeLevelFilter, setActiveLevelFilter] = useState<string>('LIVRET');
  const [baseLayer, setBaseLayer] = useState<'voyager' | 'satellite'>('satellite');
  const [fieldMode, setFieldMode] = useState<boolean>(false);
  const [isListDrawerOpen, setIsListDrawerOpen] = useState<boolean>(false);
  const [isNearbyPanelOpen, setIsNearbyPanelOpen] = useState<boolean>(true);

  // Modals state
  const [isImportExportOpen, setIsImportExportOpen] = useState<boolean>(false);
  const [isOfflineManagerOpen, setIsOfflineManagerOpen] = useState<boolean>(false);
  const [isHarvestModalOpen, setIsHarvestModalOpen] = useState<boolean>(false);
  const [isHarvestScheduleOpen, setIsHarvestScheduleOpen] = useState<boolean>(false);
  const [isHarvestDashboardOpen, setIsHarvestDashboardOpen] = useState<boolean>(false);
  const [isBilanGlobalOpen, setIsBilanGlobalOpen] = useState<boolean>(false);
  const [isLivretExportOpen, setIsLivretExportOpen] = useState<boolean>(false);
  const [isUserGuideOpen, setIsUserGuideOpen] = useState<boolean>(false);
  const [livretExportMode, setLivretExportMode] = useState<'vendanges' | 'atlas_illustre'>('vendanges');
  const [livretExportInitialParcel, setLivretExportInitialParcel] = useState<ParcelFeature | null>(null);
  const [isAddParcelOpen, setIsAddParcelOpen] = useState<boolean>(false);
  const [addParcelSourceParcel, setAddParcelSourceParcel] = useState<ParcelFeature | null>(null);
  const [parcelOriginModal, setParcelOriginModal] = useState<'livret' | 'schedule' | 'dashboard' | 'list' | null>(null);

  // GPS state
  const [locationState, setLocationState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    heading: null,
    speed: null,
    timestamp: null,
    status: 'disabled',
    currentParcel: null,
  });

  // Calculate user distance from Burgundy center (Puligny-Montrachet)
  const userDistanceFromBurgundyKm = React.useMemo(() => {
    if (!locationState.latitude || !locationState.longitude) return null;
    const lat1 = locationState.latitude;
    const lon1 = locationState.longitude;
    const lat2 = 46.9635; // Puligny-Montrachet lat
    const lon2 = 4.7555;  // Puligny-Montrachet lng
    
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }, [locationState.latitude, locationState.longitude]);

  // Handle parcel selection: select on map and open drawer without forcing aggressive zoom
  const handleParcelSelect = useCallback((parcel: ParcelFeature, shouldPan: boolean = false) => {
    setSelectedParcel(parcel);
    setIsSheetOpen(true);
    if (mapManagerRef.current) {
      mapManagerRef.current.selectParcel(parcel);
      if (shouldPan) {
        // Only pan if explicitly requested (e.g. from search bar or drawer click)
        mapManagerRef.current.panToParcelCenter(parcel);
      }
    }
  }, []);

  // Handle explicit request to center/frame a parcel
  const handleCenterOnParcel = useCallback((parcel: ParcelFeature) => {
    if (mapManagerRef.current) {
      mapManagerRef.current.flyToParcel(parcel, { maxZoom: 16 });
    }
  }, []);

  // Handle closing sheet: return to originating modal if that's where the parcel was opened from
  const handleCloseSheet = useCallback(() => {
    setIsSheetOpen(false);
    if (parcelOriginModal === 'livret') {
      setIsHarvestModalOpen(true);
    } else if (parcelOriginModal === 'schedule') {
      setIsHarvestScheduleOpen(true);
    } else if (parcelOriginModal === 'dashboard') {
      setIsHarvestDashboardOpen(true);
    } else if (parcelOriginModal === 'list') {
      setIsListDrawerOpen(true);
    }
    setParcelOriginModal(null);
  }, [parcelOriginModal]);

  // Handle parcel unselection (clears highlight and banner)
  const handleUnselectParcel = useCallback(() => {
    setSelectedParcel(null);
    setIsSheetOpen(false);
    if (parcelOriginModal === 'livret') {
      setIsHarvestModalOpen(true);
    } else if (parcelOriginModal === 'schedule') {
      setIsHarvestScheduleOpen(true);
    } else if (parcelOriginModal === 'dashboard') {
      setIsHarvestDashboardOpen(true);
    } else if (parcelOriginModal === 'list') {
      setIsListDrawerOpen(true);
    }
    setParcelOriginModal(null);
    if (mapManagerRef.current) {
      mapManagerRef.current.selectParcel(null);
    }
  }, [parcelOriginModal]);

  // Handle base layer toggle (Plan vs Satellite)
  const handleToggleBaseLayer = useCallback(() => {
    if (mapManagerRef.current) {
      const newLayer = mapManagerRef.current.toggleBaseLayer();
      setBaseLayer(newLayer);
    }
  }, []);

  // Handle opening the Livret & Grand Atlas export / print modal
  const handleOpenLivretExport = useCallback((mode: 'vendanges' | 'atlas_illustre' = 'vendanges', parcel: ParcelFeature | null = null) => {
    setLivretExportMode(mode);
    setLivretExportInitialParcel(parcel);
    setIsLivretExportOpen(true);
  }, []);

  // Handle bounding box & zoom changes from Leaflet map
  const handleBoundsChange = useCallback((bbox: BoundingBox, zoom: number) => {
    setCurrentZoom(zoom);

    dataManager.fetchParcelsInBbox({
      bbox,
      zoom,
      onLoadingChange: (loading) => setIsLoadingNetwork(loading),
      onSuccess: (features) => {
        setCachedParcels(features);
      },
      onError: (err) => {
        console.warn('Network BBOX query fallback active.', err);
      }
    });
  }, []);

  // Filter cached parcels based on active display scope ('livret' by default vs 'all') and sub-filters
  const displayedParcels = React.useMemo(() => {
    if (displayScope === 'livret') {
      // Base pool is strictly the 156 harvest livret parcels of the Domaine
      const livretPool = cachedParcels.filter(
        (p) => Boolean(p.properties.is_vendange_livret || p.properties.code_livret || p.properties.page_livret)
      );

      if (activeLevelFilter === 'LIVRET' || activeLevelFilter === 'ALL') {
        return livretPool;
      }
      if (activeLevelFilter.startsWith('LIVRET:')) {
        const sub = activeLevelFilter.replace('LIVRET:', '').trim();
        if (sub === 'ALL' || sub === '') return livretPool;
        if (['a_faire', 'en_cours', 'vendange'].includes(sub)) {
          return livretPool.filter(p => (p.properties.harvest_status || 'a_faire') === sub);
        }
        return livretPool.filter(p => p.properties.niveau?.trim().toLowerCase() === sub.toLowerCase());
      }
      return livretPool.filter(
        (p) => p.properties.niveau?.trim().toLowerCase() === activeLevelFilter.trim().toLowerCase()
      );
    }

    // displayScope === 'all': full cadastre in Burgundy
    if (activeLevelFilter === 'ALL' || activeLevelFilter === 'LIVRET') {
      return cachedParcels;
    }
    return cachedParcels.filter(
      (p) => p.properties.niveau?.trim().toLowerCase() === activeLevelFilter.trim().toLowerCase()
    );
  }, [cachedParcels, displayScope, activeLevelFilter]);

  // Sync map layers whenever displayedParcels changes
  useEffect(() => {
    if (mapManagerRef.current) {
      mapManagerRef.current.renderParcels(displayedParcels);
    }
  }, [displayedParcels]);

  // Unselect parcel if it no longer matches the active level filter
  useEffect(() => {
    if (selectedParcel && activeLevelFilter !== 'ALL') {
      if (activeLevelFilter === 'LIVRET' || activeLevelFilter.startsWith('LIVRET:')) {
        const isLivret = selectedParcel.properties.is_vendange_livret || selectedParcel.properties.code_livret || selectedParcel.properties.page_livret;
        const targetLevel = activeLevelFilter.startsWith('LIVRET:') ? activeLevelFilter.replace('LIVRET:', '').trim() : null;
        if (!isLivret || (targetLevel && selectedParcel.properties.niveau?.trim() !== targetLevel)) {
          setSelectedParcel(null);
          setIsSheetOpen(false);
          if (mapManagerRef.current) {
            mapManagerRef.current.selectParcel(null);
          }
        }
      } else if (selectedParcel.properties.niveau?.trim() !== activeLevelFilter.trim()) {
        setSelectedParcel(null);
        setIsSheetOpen(false);
        if (mapManagerRef.current) {
          mapManagerRef.current.selectParcel(null);
        }
      }
    }
  }, [activeLevelFilter, selectedParcel]);

  // Initialize Leaflet Map on mount and seed offline features if present
  useEffect(() => {
    const mapMgr = new MapManager();
    mapManagerRef.current = mapMgr;

    mapMgr.init({
      containerId: 'map-container',
      initialCenter: [46.9635, 4.7555], // Puligny-Montrachet / Domaine Leflaive center
      initialZoom: 15,
      onParcelSelect: handleParcelSelect,
      onBoundsChange: handleBoundsChange,
      onMapBackgroundClick: handleUnselectParcel,
    });

    // Seed offline stored features into DataManager if available
    const offlineFeatures = offlineCacheManager.getAllOfflineFeatures();
    if (offlineFeatures.length > 0) {
      dataManager.addCustomFeatures(offlineFeatures);
    }

    // Seed initial parcels on map
    const initialFeatures = dataManager.getAllCachedFeatures();
    setCachedParcels(initialFeatures);
    setHarvestParcels(dataManager.getHarvestParcels());

    // Subscribe to real-time live updates from Firebase / DataManager
    const unsubData = dataManager.subscribeDataChange(() => {
      const updatedFeatures = dataManager.getAllCachedFeatures();
      setCachedParcels(updatedFeatures);
      setHarvestParcels(dataManager.getHarvestParcels());
    });

    return () => {
      unsubData();
      mapMgr.destroy();
    };
  }, [handleParcelSelect, handleBoundsChange, handleUnselectParcel]);

  // Handle GPS location updates
  const handleLocationUpdate = useCallback((newLoc: LocationState) => {
    setLocationState(newLoc);

    if (newLoc.latitude && newLoc.longitude && mapManagerRef.current) {
      mapManagerRef.current.updateUserLocation(newLoc.latitude, newLoc.longitude, newLoc.accuracy);

      // Auto-fly to user location if centering was requested or on first fix
      if (shouldCenterOnNextFixRef.current) {
        mapManagerRef.current.centerOnUser(newLoc.latitude, newLoc.longitude);
        shouldCenterOnNextFixRef.current = false;
      }

      // Only auto-select parcel on GPS location update if the user hasn't explicitly opened another parcel or requested initial centering
      if (newLoc.currentParcel && shouldCenterOnNextFixRef.current) {
        handleParcelSelect(newLoc.currentParcel, false);
      }
    }
  }, [handleParcelSelect]);

  // Toggle GPS Geolocation tracking
  const toggleGps = useCallback(() => {
    if (locationState.status === 'active' || locationState.status === 'searching') {
      geoService.stopTracking();
      setLocationState(geoService.getCurrentState());
    } else {
      shouldCenterOnNextFixRef.current = true;
      const collection = dataManager.getFeatureCollection();
      geoService.startTracking(handleLocationUpdate, collection);
    }
  }, [locationState.status, handleLocationUpdate]);

  // Center map on user location
  const centerOnUser = useCallback(() => {
    if (locationState.latitude && locationState.longitude && mapManagerRef.current) {
      mapManagerRef.current.centerOnUser(locationState.latitude, locationState.longitude);
      mapManagerRef.current.updateUserLocation(locationState.latitude, locationState.longitude, locationState.accuracy);
      
      if (locationState.status !== 'active' && locationState.status !== 'searching') {
        const collection = dataManager.getFeatureCollection();
        geoService.startTracking(handleLocationUpdate, collection);
      }
    } else {
      shouldCenterOnNextFixRef.current = true;
      const collection = dataManager.getFeatureCollection();
      geoService.startTracking(handleLocationUpdate, collection);
    }
  }, [locationState.latitude, locationState.longitude, locationState.accuracy, locationState.status, handleLocationUpdate]);

  // Jump to a specific Burgundy region
  const handleJumpToRegion = useCallback((region: VineyardRegion) => {
    const map = mapManagerRef.current?.getMap();
    if (map) {
      map.flyTo(region.center, region.zoom, { duration: 1.5 });
    }
  }, []);

  // Update parcel properties in DataManager (full manual editing)
  const handleUpdateParcel = useCallback((parcelId: string, updates: Partial<ParcelProperties>) => {
    const updated = dataManager.updateParcelProperties(parcelId, updates);
    if (updated) {
      setSelectedParcel({ ...updated });
      setCachedParcels(dataManager.getAllCachedFeatures());
    }
  }, []);

  // Reset parcel properties to catalog defaults
  const handleResetParcel = useCallback((parcelId: string) => {
    const reset = dataManager.resetParcelProperties(parcelId);
    if (reset) {
      setSelectedParcel({ ...reset });
      setCachedParcels(dataManager.getAllCachedFeatures());
    }
  }, []);

  // Update parcel notes in DataManager
  const handleUpdateParcelNotes = useCallback((parcelId: string, vigneron: string, notes: string) => {
    const updated = dataManager.updateParcelNotes(parcelId, vigneron, notes);
    if (updated) {
      setSelectedParcel({ ...updated });
      setCachedParcels(dataManager.getAllCachedFeatures());
    }
  }, []);

  // Handle imported custom features (GeoJSON, KML, CSV)
  const handleImportFeatures = useCallback((features: ParcelFeature[]) => {
    dataManager.addCustomFeatures(features);
    setCachedParcels(dataManager.getAllCachedFeatures());
    if (features.length > 0) {
      handleParcelSelect(features[0]);
    }
  }, [handleParcelSelect]);

  // Handle offline sector loaded
  const handleOfflineSectorLoaded = useCallback(() => {
    const offlineFeatures = offlineCacheManager.getAllOfflineFeatures();
    if (offlineFeatures.length > 0) {
      dataManager.addCustomFeatures(offlineFeatures);
      setCachedParcels(dataManager.getAllCachedFeatures());
    }
  }, []);

  // Filtered search results
  const searchResults = React.useMemo(() => {
    const effectiveFilter = displayScope === 'livret'
      ? (activeLevelFilter.startsWith('LIVRET') ? activeLevelFilter : `LIVRET:${activeLevelFilter}`)
      : activeLevelFilter;
    return dataManager.searchParcels(searchQuery, effectiveFilter);
  }, [searchQuery, activeLevelFilter, displayScope, cachedParcels]);

  return (
    <div className={`relative w-screen h-[100dvh] overflow-hidden ${fieldMode ? 'dark bg-black' : 'bg-zinc-950'}`}>
      
      {/* Fixed Header Search & Filters */}
      <HeaderSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchFocus={() => {
          if (isSheetOpen) {
            setIsSheetOpen(false);
          }
        }}
        displayScope={displayScope}
        onDisplayScopeChange={setDisplayScope}
        activeLevelFilter={activeLevelFilter}
        onLevelFilterChange={setActiveLevelFilter}
        searchResultCount={searchResults.length}
        totalCachedCount={cachedParcels.length}
        searchResults={searchResults}
        onSelectParcel={(parcel) => handleParcelSelect(parcel, true)}
        onJumpToRegion={handleJumpToRegion}
        fieldMode={fieldMode}
        onToggleFieldMode={() => setFieldMode(!fieldMode)}
        onOpenListDrawer={() => setIsListDrawerOpen(true)}
        onOpenImportExport={() => setIsImportExportOpen(true)}
        onOpenOfflineManager={() => setIsOfflineManagerOpen(true)}
        onOpenHarvestModal={() => setIsHarvestModalOpen(true)}
        onOpenLivretExport={handleOpenLivretExport}
        onOpenBilanGlobal={() => setIsBilanGlobalOpen(true)}
        onOpenUserGuide={() => setIsUserGuideOpen(true)}
        onOpenAddParcel={() => {
          setAddParcelSourceParcel(selectedParcel || null);
          setIsAddParcelOpen(true);
        }}
        onCenterOnUser={centerOnUser}
        gpsStatus={locationState.status}
        baseLayer={baseLayer}
        onToggleBaseLayer={handleToggleBaseLayer}
      />

      {/* Scope banner when viewing entire Burgundy cadastre */}
      {displayScope === 'all' && (
        <div className="fixed top-24 sm:top-28 left-1/2 -translate-x-1/2 z-[1000] pointer-events-auto max-w-md w-[92vw] sm:w-auto animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between gap-3 px-3.5 py-1.5 rounded-2xl bg-blue-950/95 border border-blue-500/60 text-blue-100 text-xs shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-2 min-w-0 pr-1">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shrink-0" />
              <span className="truncate font-semibold">
                Cadastre étendu actif ({cachedParcels.length} parcelles)
              </span>
            </div>
            <button
              onClick={() => {
                setDisplayScope('livret');
                setActiveLevelFilter('LIVRET');
              }}
              className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-[11px] font-black transition-all active:scale-95 shadow-md shrink-0"
            >
              🍇 Livret (156)
            </button>
          </div>
        </div>
      )}

      {/* Harvest Parcels Floating Quick Shortcuts (Livret + Calendrier + Statut Avancement + Bilan) */}
      <HarvestFloatingShortcut
        onOpenHarvestModal={() => setIsHarvestModalOpen(true)}
        onOpenScheduleModal={() => setIsHarvestScheduleOpen(true)}
        onOpenDashboardModal={() => setIsHarvestDashboardOpen(true)}
        onOpenBilanGlobal={() => setIsBilanGlobalOpen(true)}
        parcels={harvestParcels}
        fieldMode={fieldMode}
        isVisible={!selectedParcel || !isSheetOpen}
        hasBottomBanner={selectedParcel !== null || isSheetOpen}
      />

      {/* Distance from Burgundy Feedback Banner when GPS is active */}
      {locationState.status === 'active' && userDistanceFromBurgundyKm !== null && userDistanceFromBurgundyKm > 15 && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-[1000] pointer-events-auto max-w-md w-[92vw] sm:w-auto animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-2xl bg-zinc-950/95 border border-emerald-500/60 text-zinc-100 text-xs shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-2 min-w-0 pr-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span className="truncate font-medium">
                GPS Actif : <strong className="text-emerald-400 font-bold">à {userDistanceFromBurgundyKm} km</strong> de Puligny-Montrachet
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={centerOnUser}
                className="px-2.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-[11px] font-black transition-all active:scale-95 shadow-md"
              >
                Ma position
              </button>
              <button
                onClick={() => {
                  const map = mapManagerRef.current?.getMap();
                  if (map) map.flyTo([46.9635, 4.7555], 15, { duration: 1.2 });
                }}
                className="px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-bold transition-all active:scale-95"
              >
                Domaine
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zoom / BBOX Warning & Loading Banner */}
      <ZoomWarningBanner
        currentZoom={currentZoom}
        minZoomThreshold={14}
        isLoadingNetwork={isLoadingNetwork}
      />

      {/* Fullscreen Leaflet Map Container */}
      <div id="map-container" className="w-full h-full z-[1]" />

      {/* Nearby Parcels Panel (GPS Location Context) - Hidden when parcel detail card is active to avoid mobile clutter */}
      {!selectedParcel && (
        <NearbyParcelsPanel
          locationState={locationState}
          onSelectParcel={handleParcelSelect}
          onCenterOnUser={centerOnUser}
          fieldMode={fieldMode}
          isOpen={isNearbyPanelOpen}
          onToggleOpen={() => setIsNearbyPanelOpen(!isNearbyPanelOpen)}
        />
      )}

      {/* Floating GPS Button - Positioned bottom-right for easy thumb access */}
      <GpsFloatingButton
        locationState={locationState}
        onToggleGps={toggleGps}
        onCenterOnUser={centerOnUser}
        fieldMode={fieldMode}
        isVisible={selectedParcel === null || !isSheetOpen}
        hasBanner={selectedParcel !== null && !isSheetOpen}
      />

      {/* Compact Ribbon Banner when parcel is selected but full popup is closed */}
      {selectedParcel && !isSheetOpen && (
        <ParcelRibbonBanner
          parcel={selectedParcel}
          onOpenSheet={() => setIsSheetOpen(true)}
          onUnselectParcel={handleUnselectParcel}
          fieldMode={fieldMode}
        />
      )}

      {/* Bottom Sheet for Selected Parcel Details */}
      {isSheetOpen && (
        <BottomSheet
          parcel={selectedParcel}
          onClose={handleCloseSheet}
          onCenterOnParcel={handleCenterOnParcel}
          onOpenLivretExport={handleOpenLivretExport}
          onCreateDomaineFicheFromParcel={(p) => {
            setAddParcelSourceParcel(p);
            setIsAddParcelOpen(true);
          }}
          isCurrentGpsParcel={
            selectedParcel !== null &&
            locationState.currentParcel !== null &&
            (selectedParcel.id === locationState.currentParcel.id ||
              selectedParcel.properties.id === locationState.currentParcel.properties.id)
          }
          userGpsCoords={
            locationState.latitude && locationState.longitude
              ? { lat: locationState.latitude, lng: locationState.longitude }
              : null
          }
          onUpdateParcelNotes={handleUpdateParcelNotes}
          onUpdateParcel={handleUpdateParcel}
          onResetParcel={handleResetParcel}
          fieldMode={fieldMode}
        />
      )}

      {/* Slide-over Drawer for Loaded Parcels List */}
      <ParcelListDrawer
        isOpen={isListDrawerOpen}
        onClose={() => setIsListDrawerOpen(false)}
        parcels={cachedParcels}
        onSelectParcel={(parcel) => {
          setParcelOriginModal('list');
          handleParcelSelect(parcel, true);
        }}
        activeFilter={activeLevelFilter}
        onFilterChange={setActiveLevelFilter}
        displayScope={displayScope}
        onDisplayScopeChange={setDisplayScope}
      />

      {/* Import / Export Domaine & Registres Modal */}
      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        cachedParcels={cachedParcels}
        onImportFeatures={handleImportFeatures}
        fieldMode={fieldMode}
      />

      {/* Offline Sector Cache Manager Modal */}
      <OfflineManagerModal
        isOpen={isOfflineManagerOpen}
        onClose={() => setIsOfflineManagerOpen(false)}
        fieldMode={fieldMode}
        onSectorLoaded={handleOfflineSectorLoaded}
      />

      {/* Harvest Parcels Interactive Catalogue Modal */}
      <HarvestParcelsModal
        isOpen={isHarvestModalOpen}
        onClose={() => setIsHarvestModalOpen(false)}
        parcels={harvestParcels}
        onSelectParcel={(parcel) => {
          setParcelOriginModal('livret');
          handleParcelSelect(parcel, true);
        }}
        onOpenLivretExport={handleOpenLivretExport}
        fieldMode={fieldMode}
      />

      {/* Harvest Daily Schedule & Planning Modal */}
      <HarvestScheduleModal
        isOpen={isHarvestScheduleOpen}
        onClose={() => setIsHarvestScheduleOpen(false)}
        parcels={harvestParcels}
        onSelectParcel={(parcel) => {
          setParcelOriginModal('schedule');
          handleParcelSelect(parcel, true);
        }}
        onUpdateParcel={handleUpdateParcel}
        fieldMode={fieldMode}
      />

      {/* Harvest Overall Progress Dashboard & Caisses Modal */}
      <HarvestDashboardModal
        isOpen={isHarvestDashboardOpen}
        onClose={() => setIsHarvestDashboardOpen(false)}
        parcels={harvestParcels}
        onSelectParcel={(parcel) => {
          setParcelOriginModal('dashboard');
          handleParcelSelect(parcel, true);
        }}
        onUpdateParcel={handleUpdateParcel}
        onOpenSchedule={() => setIsHarvestScheduleOpen(true)}
        fieldMode={fieldMode}
      />

      {/* Bilan Global WhatsApp / SMS Copy Modal */}
      <BilanGlobalModal
        isOpen={isBilanGlobalOpen}
        onClose={() => setIsBilanGlobalOpen(false)}
        parcels={harvestParcels}
        fieldMode={fieldMode}
      />

      {/* Add New Custom Parcel Modal (GPS + Photo + Team Sync) */}
      <AddParcelModal
        isOpen={isAddParcelOpen}
        onClose={() => {
          setIsAddParcelOpen(false);
          setAddParcelSourceParcel(null);
        }}
        onParcelCreated={(newParcel) => {
          handleParcelSelect(newParcel, true);
        }}
        sourceParcel={addParcelSourceParcel}
        currentGpsCoords={
          locationState.latitude && locationState.longitude
            ? { lat: locationState.latitude, lng: locationState.longitude }
            : null
        }
        fieldMode={fieldMode}
      />

      {/* Livret des Vendanges & Grand Atlas Parcellaire PDF / Impression Modal */}
      <LivretExportModal
        isOpen={isLivretExportOpen}
        onClose={() => {
          setIsLivretExportOpen(false);
          setLivretExportInitialParcel(null);
        }}
        parcels={harvestParcels}
        initialMode={livretExportMode}
        initialParcel={livretExportInitialParcel}
        fieldMode={fieldMode}
      />

      {/* Guide d'Utilisation Vendanges 2024 (Rôles, Directrice Technique, Coupeurs & Fiche A4) */}
      <UserGuideModal
        isOpen={isUserGuideOpen}
        onClose={() => setIsUserGuideOpen(false)}
        fieldMode={fieldMode}
      />
    </div>
  );
}
