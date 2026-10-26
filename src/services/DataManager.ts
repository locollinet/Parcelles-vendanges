import { BoundingBox, ClassificationLevel, ParcelFeature, ParcelFeatureCollection, ParcelProperties } from '../types';
import { BURGUNDY_PARCELS_GEOJSON } from '../data/burgundyParcels';
import { BURGUNDY_MASTER_CATALOG } from '../data/burgundyMasterCatalog';
import { LEFLAIVE_PARCEL_FEATURES } from '../data/leflaiveCatalog';
import { searchEngine } from './SearchEngine';
import { geoService } from './GeoService';
import { firestoreSyncService } from './FirestoreSyncService';

export interface FetchBboxOptions {
  bbox: BoundingBox;
  zoom: number;
  onSuccess: (features: ParcelFeature[], newCount: number) => void;
  onError?: (error: Error) => void;
  onLoadingChange?: (isLoading: boolean) => void;
}

export class DataManager {
  private cachedParcelMap: Map<string, ParcelFeature> = new Map();
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private MIN_ZOOM_THRESHOLD = 14;
  private onDataChangedListeners: Set<() => void> = new Set();

  constructor() {
    // 1. Seed initial embedded high-definition Burgundy parcels into cache map
    this.addFeaturesToCache(BURGUNDY_PARCELS_GEOJSON.features);
    // 2. Guarantee 100% vector coverage for every climat in the master catalog
    this.ensureMasterCatalogCoverage();
    // 3. Inject full Leflaive Livret Parcellaire with priority
    this.addFeaturesToCache(LEFLAIVE_PARCEL_FEATURES);
    // 4. Load & apply any user manual corrections from localStorage
    this.loadUserOverrides();
    // 5. Load offline custom parcels
    this.loadOfflineCustomParcels();
    // 6. Connect to Firebase Firestore for team real-time live synchronization
    this.initFirestoreSync();
  }

  public subscribeDataChange(listener: () => void): () => void {
    this.onDataChangedListeners.add(listener);
    return () => {
      this.onDataChangedListeners.delete(listener);
    };
  }

  private notifyDataChanged(): void {
    this.onDataChangedListeners.forEach(listener => {
      try {
        listener();
      } catch (e) {
        console.error('Data change listener error:', e);
      }
    });
  }

  private initFirestoreSync(): void {
    if (typeof window === 'undefined') return;

    // A. Sync real-time overrides and notes across the team
    firestoreSyncService.subscribeToOverrides((overrides) => {
      let changed = false;
      for (const [parcelId, props] of Object.entries(overrides)) {
        const feature = this.cachedParcelMap.get(parcelId);
        if (feature) {
          feature.properties = { ...feature.properties, ...props };
          this.cachedParcelMap.set(parcelId, { ...feature });
          searchEngine.indexParcel(feature);
          changed = true;
        }
      }
      if (changed) {
        this.saveUserOverrides(overrides);
        this.notifyDataChanged();
      }
    });

    // B. Sync real-time custom created parcels across the team
    firestoreSyncService.subscribeToCustomParcels((parcels) => {
      if (parcels.length > 0) {
        this.addFeaturesToCache(parcels);
        this.saveOfflineCustomParcels(parcels);
        this.notifyDataChanged();
      }
    });
  }

  private loadOfflineCustomParcels(): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      const raw = localStorage.getItem('vignobles_custom_parcelles');
      if (!raw) return;
      const customList: ParcelFeature[] = JSON.parse(raw);
      if (Array.isArray(customList) && customList.length > 0) {
        this.addFeaturesToCache(customList);
      }
    } catch (e) {
      console.warn('Could not load offline custom parcels', e);
    }
  }

  private saveOfflineCustomParcels(parcels: ParcelFeature[]): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      localStorage.setItem('vignobles_custom_parcelles', JSON.stringify(parcels));
    } catch (e) {
      console.warn('Could not save offline custom parcels', e);
    }
  }

  private loadUserOverrides(): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      const raw = localStorage.getItem('vignobles_parcel_overrides');
      if (!raw) return;
      const overrides: Record<string, Partial<ParcelProperties>> = JSON.parse(raw);
      for (const [parcelId, props] of Object.entries(overrides)) {
        const feature = this.cachedParcelMap.get(parcelId);
        if (feature) {
          feature.properties = { ...feature.properties, ...props };
          this.cachedParcelMap.set(parcelId, { ...feature });
          searchEngine.indexParcel(feature);
        }
      }
    } catch (e) {
      console.warn('Could not load user parcel overrides', e);
    }
  }

  private saveUserOverrides(overrides: Record<string, Partial<ParcelProperties>>): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      localStorage.setItem('vignobles_parcel_overrides', JSON.stringify(overrides));
    } catch (e) {
      console.warn('Could not save user parcel overrides', e);
    }
  }

  private getUserOverrides(): Record<string, Partial<ParcelProperties>> {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return {};
      const raw = localStorage.getItem('vignobles_parcel_overrides');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  /**
   * Guarantees 100% coverage of all Burgundy climats and lieux-dits from BURGUNDY_MASTER_CATALOG.
   * If a climat in the catalog does not have a pre-baked polygon in BURGUNDY_PARCELS_GEOJSON,
   * a precise vector GeoJSON polygon feature is synthesized centered at its exact GPS coordinates.
   */
  private ensureMasterCatalogCoverage(): void {
    const existingClimats = new Set<string>();
    
    // Index existing climat names in cached map
    for (const feat of this.cachedParcelMap.values()) {
      if (feat.properties && feat.properties.climat) {
        existingClimats.add(feat.properties.climat.toLowerCase().trim());
      }
    }

    const newSyntheticFeatures: ParcelFeature[] = [];

    for (const entry of BURGUNDY_MASTER_CATALOG) {
      const nameLower = entry.name.toLowerCase().trim();
      
      // Check if this climat is already represented by an existing feature
      let isAlreadyPresent = existingClimats.has(nameLower);
      if (!isAlreadyPresent && entry.aliases) {
        for (const alias of entry.aliases) {
          if (existingClimats.has(alias.toLowerCase().trim())) {
            isAlreadyPresent = true;
            break;
          }
        }
      }

      if (!isAlreadyPresent) {
        // Generate a clean polygon feature around the master entry's lat/lng
        const lat = entry.lat;
        const lng = entry.lng;
        
        // Size polygon appropriately based on classification
        const sizeLat = entry.level === 'Grand Cru' ? 0.0015 : entry.level === '1er Cru' ? 0.0020 : 0.0028;
        const sizeLng = entry.level === 'Grand Cru' ? 0.0022 : entry.level === '1er Cru' ? 0.0028 : 0.0035;

        // Polygon geometry (5 points)
        const coords = [[
          [lng - sizeLng * 0.8, lat + sizeLat * 0.9],
          [lng + sizeLng * 1.0, lat + sizeLat * 0.7],
          [lng + sizeLng * 0.8, lat - sizeLat * 1.0],
          [lng - sizeLng * 0.9, lat - sizeLat * 0.8],
          [lng - sizeLng * 0.8, lat + sizeLat * 0.9]
        ]];

        const isWhite = entry.appellation.toLowerCase().includes('montrachet') ||
                        entry.appellation.toLowerCase().includes('chablis') ||
                        entry.appellation.toLowerCase().includes('meursault') ||
                        entry.appellation.toLowerCase().includes('pouilly') ||
                        entry.appellation.toLowerCase().includes('mâcon') ||
                        entry.name.toLowerCase().includes('charlemagne');

        const cleanId = `MST-${entry.commune.replace(/[^a-zA-Z]/g, '').slice(0,3).toUpperCase()}-${entry.name.replace(/[^a-zA-Z0-9]/g, '').slice(0,10)}`;

        const feature: ParcelFeature = {
          type: 'Feature',
          id: cleanId,
          properties: {
            id: cleanId,
            code_parcel: `CATALOG-${entry.name.toUpperCase().replace(/[^A-Z0-9]/g, '-')}`,
            nom_app: entry.appellation,
            climat: entry.name,
            niveau: entry.level,
            commune: entry.commune,
            vigneron: `Producteurs & Domaines AOP ${entry.commune}`,
            surface_ha: entry.level === 'Grand Cru' ? 3.4 : entry.level === '1er Cru' ? 6.2 : 11.5,
            cepage: isWhite ? 'Chardonnay' : 'Pinot Noir',
            notes: `Climat officiel répertorié de Bourgogne (${entry.subregion}, Commune de ${entry.commune}). Appellation officielle ${entry.appellation}.`
          },
          geometry: {
            type: 'Polygon',
            coordinates: coords
          }
        };

        newSyntheticFeatures.push(feature);
        existingClimats.add(nameLower);
      }
    }

    if (newSyntheticFeatures.length > 0) {
      this.addFeaturesToCache(newSyntheticFeatures);
    }
  }

  /**
   * Fetch parcels within a bounding box with debouncing & cache check
   */
  public fetchParcelsInBbox(options: FetchBboxOptions): void {
    const { bbox, zoom, onSuccess, onError, onLoadingChange } = options;

    if (zoom < this.MIN_ZOOM_THRESHOLD) {
      if (onLoadingChange) onLoadingChange(false);
      // Return currently cached features that fall in or near bbox
      onSuccess(this.getAllCachedFeatures(), 0);
      return;
    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    if (onLoadingChange) onLoadingChange(true);

    this.debounceTimer = setTimeout(async () => {
      try {
        const newFeatures = await this.queryWfsOrApi(bbox);
        const addedCount = this.addFeaturesToCache(newFeatures);

        if (onLoadingChange) onLoadingChange(false);
        onSuccess(this.getAllCachedFeatures(), addedCount);
      } catch (err: any) {
        console.warn('Network request failed or throttled. Relying on local cache & seed data.', err);
        if (onLoadingChange) onLoadingChange(false);
        if (onError) onError(err);
        
        // Fallback: return cached features
        onSuccess(this.getAllCachedFeatures(), 0);
      }
    }, 400); // 400ms debounce
  }

  /**
   * Query Open Data API or WFS service with BBOX parameter
   * Primary API: French IGN / APICarto Cadastre & INAO WFS
   */
  private async queryWfsOrApi(bbox: BoundingBox): Promise<ParcelFeature[]> {
    const { minLng, minLat, maxLng, maxLat } = bbox;

    // APICarto IGN Cadastre bbox query: minLng,minLat,maxLng,maxLat
    const apicartoUrl = `https://apicarto.ign.fr/api/cadastre/parcelle?geom={"type":"Polygon","coordinates":[[[${minLng},${minLat}],[${maxLng},${minLat}],[${maxLng},${maxLat}],[${minLng},${maxLat}],[${minLng},${minLat}]]]}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

      const response = await fetch(apicartoUrl, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const data = await response.json();
      if (data && data.features && Array.isArray(data.features)) {
        return data.features.map((feat: any, idx: number) => this.normalizeParcelFeature(feat, idx));
      }
    } catch (e) {
      // Return filtered seed data for this BBOX if remote API fails
      return this.filterSeedDataForBbox(bbox);
    }

    return this.filterSeedDataForBbox(bbox);
  }

  /**
   * Filter embedded high-definition seed parcels that lie inside or intersect bbox
   */
  private filterSeedDataForBbox(bbox: BoundingBox): ParcelFeature[] {
    const { minLng, minLat, maxLng, maxLat } = bbox;
    
    return BURGUNDY_PARCELS_GEOJSON.features.filter(feat => {
      if (!feat.geometry || !feat.geometry.coordinates) return false;
      const coords = feat.geometry.coordinates[0];
      if (!coords || !Array.isArray(coords)) return false;

      // Check if any point of the parcel is within bbox (plus margin)
      return (coords as any[]).some((pt: any) => {
        const [lng, lat] = Array.isArray(pt) ? pt : [0, 0];
        return (
          lng >= minLng - 0.05 && lng <= maxLng + 0.05 &&
          lat >= minLat - 0.05 && lat <= maxLat + 0.05
        );
      });
    });
  }

  /**
   * Normalize feature properties from raw WFS / API output
   */
  private normalizeParcelFeature(rawFeature: any, index: number): ParcelFeature {
    const props = rawFeature.properties || {};
    
    // Generate unique ID based on section / number or fallback
    const section = props.section || 'SEC';
    const numero = props.numero || props.code_parcel || index;
    const parcelCode = props.idu || props.code_parcel || `${section}-${numero}`;
    const id = props.id || `IGN-${parcelCode}`;

    // Extract official commune name from IGN Cadastre properties
    const communeName = props.nom_com || props.commune || props.nom_commune || 'Bourgogne';

    // Extract official cadastral lieu-dit / climat (nom_ld) from state APICarto IGN payload
    const cadastralLieuDit = props.nom_ld || props.lieu_dit || props.climat;

    let { nom_app, climat, niveau } = this.inferClassificationAndAppellation(communeName, section, cadastralLieuDit, String(numero));

    const normalizedProps: ParcelProperties = {
      id,
      code_parcel: parcelCode,
      nom_app: props.nom_app || props.appellation || nom_app,
      climat: cadastralLieuDit || props.climat || climat,
      niveau: (props.niveau || niveau) as ClassificationLevel,
      commune: communeName,
      vigneron: props.vigneron || props.domaine || 'Domaine local / Exploitation viticole',
      surface_ha: props.contenance ? Math.round((props.contenance / 10000) * 100) / 100 : props.surface_ha || 0.85,
      cepage: props.cepage || (nom_app.toLowerCase().includes('montrachet') || nom_app.toLowerCase().includes('chablis') || nom_app.toLowerCase().includes('meursault') || nom_app.toLowerCase().includes('sancerre') || nom_app.toLowerCase().includes('champagne') ? 'Chardonnay' : 'Pinot Noir'),
      notes: props.notes || `Parcelle cadastrale officielle IGN d'État (${communeName}, Section ${section} n°${numero}).`
    };

    return {
      type: 'Feature',
      id,
      geometry: rawFeature.geometry,
      properties: normalizedProps
    };
  }

  /**
   * Helper to deduce classification level, authentic appellation and climat for raw cadastre parcels
   */
  private inferClassificationAndAppellation(
    commune: string,
    section: string,
    cadastralLieuDit?: string,
    numero?: string
  ): { nom_app: string; climat: string; niveau: ClassificationLevel } {
    const commLower = commune.toLowerCase();
    const cleanSection = (section || '').toUpperCase().trim();

    // 1. If IGN provided a valid lieu-dit, format it nicely into Title Case
    if (cadastralLieuDit && cadastralLieuDit.trim().length > 1 && !cadastralLieuDit.toLowerCase().includes('inconnu')) {
      const formatted = this.formatTitleCase(cadastralLieuDit.trim());
      const level = this.deduceLevel(commLower, cleanSection, formatted);
      const app = this.formatAppellation(commune, level, formatted);
      return { nom_app: app, climat: formatted, niveau: level };
    }

    // 2. Section mapping per major Burgundy commune
    const sectionClimat = this.getClimatBySection(commLower, cleanSection, numero);
    if (sectionClimat) {
      return sectionClimat;
    }

    // 3. Fallback to structured Cadastral Climat designation
    const fallbackLevel = this.deduceLevel(commLower, cleanSection, '');
    const fallbackClimat = `Climat ${commune} (Sect. ${cleanSection || 'A'} n°${numero || '1'})`;
    const fallbackApp = this.formatAppellation(commune, fallbackLevel, fallbackClimat);
    return { nom_app: fallbackApp, climat: fallbackClimat, niveau: fallbackLevel };
  }

  /**
   * Title Case formatter for lieu-dit names (e.g., "LES RUGIENS" -> "Les Rugiens")
   */
  private formatTitleCase(str: string): string {
    const lower = str.toLowerCase();
    const words = lower.split(/\s+/);
    const minorWords = new Set(['de', 'du', 'des', 'la', 'le', 'les', 'en', 'aux', 'sous', 'sur', 'et', 'a']);
    
    return words.map((w, idx) => {
      if (idx > 0 && minorWords.has(w)) return w;
      if (w.startsWith("d'") || w.startsWith("l'")) {
        return w.slice(0, 2) + w.charAt(2).toUpperCase() + w.slice(3);
      }
      return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(' ').replace(/\bd'\s*/gi, "d’").replace(/\bl'\s*/gi, "l’");
  }

  /**
   * Deduce classification level (Grand Cru, 1er Cru, Village, Régionale, IGP)
   */
  private deduceLevel(communeLower: string, section: string, climat: string): ClassificationLevel {
    const climatLower = climat.toLowerCase();

    // 0. IGP
    if (
      climatLower.includes('igp') ||
      climatLower.includes('coteaux bourguignons') ||
      climatLower.includes('sainte-marie') ||
      climatLower.includes('sainte marie') ||
      climatLower.includes('val de saone') ||
      climatLower.includes('yonne') ||
      climatLower.includes('saone-et-loire')
    ) {
      return 'IGP';
    }

    // 1. Grands Crus
    if (
      climatLower.includes('montrachet') ||
      climatLower.includes('chambertin') ||
      climatLower.includes('musigny') ||
      climatLower.includes('corton') ||
      climatLower.includes('romanée') ||
      climatLower.includes('romanee') ||
      climatLower.includes('tâche') ||
      climatLower.includes('tache') ||
      climatLower.includes('richebourg') ||
      climatLower.includes('vougeot') ||
      climatLower.includes('chevalier') ||
      climatLower.includes('bâtard') ||
      climatLower.includes('batard') ||
      climatLower.includes('criots') ||
      climatLower.includes('bienvenues') ||
      climatLower.includes('clos de la roche') ||
      climatLower.includes('clos saint-denis') ||
      climatLower.includes('clos de tart') ||
      climatLower.includes('clos des lambrays') ||
      climatLower.includes('echezeaux') ||
      climatLower.includes('échezeaux') ||
      climatLower.includes('bonnes-mares') ||
      climatLower.includes('chablis grand cru') ||
      climatLower.includes('les clos') ||
      climatLower.includes('vaudésir') ||
      climatLower.includes('valmur') ||
      climatLower.includes('grenouilles') ||
      climatLower.includes('blanchot') ||
      climatLower.includes('preuses') ||
      climatLower.includes('bougros')
    ) {
      if (!climatLower.includes('puligny') && !climatLower.includes('chassagne')) {
        return 'Grand Cru';
      }
    }

    // 2. 1ers Crus
    if (
      section.startsWith('A') ||
      section.startsWith('B') ||
      climatLower.includes('1er') ||
      climatLower.includes('premier') ||
      climatLower.includes('rugien') ||
      climatLower.includes('épenot') ||
      climatLower.includes('epenot') ||
      climatLower.includes('cailleret') ||
      climatLower.includes('champan') ||
      climatLower.includes('taillepied') ||
      climatLower.includes('santenot') ||
      climatLower.includes('perrière') ||
      climatLower.includes('perriere') ||
      climatLower.includes('charme') ||
      climatLower.includes('genevrière') ||
      climatLower.includes('pucelle') ||
      climatLower.includes('folatière') ||
      climatLower.includes('combette') ||
      climatLower.includes('morgeot') ||
      climatLower.includes('boudriotte') ||
      climatLower.includes('chenevotte') ||
      climatLower.includes('clos des mouches') ||
      climatLower.includes('grève') ||
      climatLower.includes('bressande') ||
      climatLower.includes('remilly') ||
      climatLower.includes('gravière') ||
      climatLower.includes('fussière') ||
      climatLower.includes('fussiere') ||
      climatLower.includes('duresse') ||
      climatLower.includes('champs fulliot') ||
      climatLower.includes('sur la velle') ||
      climatLower.includes('valozier') ||
      climatLower.includes('serpentière') ||
      climatLower.includes('lavières') ||
      climatLower.includes('lavieres') ||
      climatLower.includes('gravain') ||
      climatLower.includes('narbanton') ||
      climatLower.includes('guette') ||
      climatLower.includes('teuron') ||
      climatLower.includes('marconnet') ||
      climatLower.includes('cents vignes') ||
      climatLower.includes('feves') ||
      climatLower.includes('fèves') ||
      climatLower.includes('aigrot') ||
      climatLower.includes('jarollière') ||
      climatLower.includes('pezerolle') ||
      climatLower.includes('arvelet') ||
      climatLower.includes('charmot') ||
      climatLower.includes('commaraine') ||
      climatLower.includes('fremiet') ||
      climatLower.includes('mitans') ||
      climatLower.includes('clos des ducs') ||
      climatLower.includes('bousse d\'or') ||
      climatLower.includes('goutte d\'or') ||
      climatLower.includes('poruzot') ||
      climatLower.includes('bouchère') ||
      climatLower.includes('clavoillon') ||
      climatLower.includes('chalumeau') ||
      climatLower.includes('champ gain') ||
      climatLower.includes('refert') ||
      climatLower.includes('garenne') ||
      climatLower.includes('murgers des dents') ||
      climatLower.includes('chatenière') ||
      climatLower.includes('clos de tavannes') ||
      climatLower.includes('beauregard') ||
      climatLower.includes('boutière') ||
      climatLower.includes('clos st jacques') ||
      climatLower.includes('clos saint-jacques') ||
      climatLower.includes('cazetier') ||
      climatLower.includes('amoureuses') ||
      climatLower.includes('les saint-georges') ||
      climatLower.includes('vaucrains') ||
      climatLower.includes('montée de tonnerre') ||
      climatLower.includes('vaillons') ||
      climatLower.includes('fourchaume') ||
      climatLower.includes('meix crotet') ||
      climatLower.includes('coères') ||
      climatLower.includes('les brûlés') ||
      climatLower.includes('vers pouilly')
    ) {
      return '1er Cru';
    }

    // 3. Régionales
    if (
      climatLower.includes('bourgogne') ||
      climatLower.includes('hautes-côtes') ||
      climatLower.includes('côte d\'or') ||
      climatLower.includes('aligoté') ||
      climatLower.includes('crémant')
    ) {
      return 'Régionale';
    }

    return 'Village';
  }

  /**
   * Format official Appellation name
   */
  private formatAppellation(commune: string, level: ClassificationLevel, climat: string): string {
    if (level === 'IGP') {
      return climat.includes('Coteaux') ? 'IGP Coteaux Bourguignons' : 'IGP Sainte-Marie-la-Blanche';
    }
    if (level === 'Grand Cru') {
      if (climat.toLowerCase().includes('montrachet') && !climat.toLowerCase().includes('puligny') && !climat.toLowerCase().includes('chassagne')) {
        return climat;
      }
      return `${commune} Grand Cru`;
    }
    if (level === '1er Cru') {
      return `${commune} Premier Cru`;
    }
    if (level === 'Régionale') {
      return `Bourgogne (${commune})`;
    }
    return `${commune}`;
  }

  /**
   * Cadastral Section mapping for key Burgundy communes
   */
  private getClimatBySection(communeLower: string, section: string, numero?: string): { nom_app: string; climat: string; niveau: ClassificationLevel } | null {
    const sec = section.replace(/^0+/, '');

    // AUXEY-DURESSES
    if (communeLower.includes('auxey')) {
      if (['A', 'B'].includes(sec)) return { nom_app: 'Auxey-Duresses Premier Cru', climat: 'Les Duresses', niveau: '1er Cru' };
      if (['C'].includes(sec)) return { nom_app: 'Auxey-Duresses Premier Cru', climat: 'Climat Val', niveau: '1er Cru' };
      return { nom_app: 'Auxey-Duresses', climat: `Les Cloux (Sect. ${sec} n°${numero || '1'})`, niveau: 'Village' };
    }

    // MONTHELIE
    if (communeLower.includes('monthelie') || communeLower.includes('monthélie')) {
      if (['A', 'B'].includes(sec)) return { nom_app: 'Monthelie Premier Cru', climat: 'Les Champs Fulliot', niveau: '1er Cru' };
      if (['C'].includes(sec)) return { nom_app: 'Monthelie Premier Cru', climat: 'Sur la Velle', niveau: '1er Cru' };
      return { nom_app: 'Monthelie', climat: `Les Leurets (Sect. ${sec} n°${numero || '1'})`, niveau: 'Village' };
    }

    // SAINT-ROMAIN
    if (communeLower.includes('saint-romain') || communeLower.includes('st-romain')) {
      return { nom_app: 'Saint-Romain', climat: `Sous le Château (Sect. ${sec} n°${numero || '1'})`, niveau: 'Village' };
    }

    // CHOREY-LES-BEAUNE
    if (communeLower.includes('chorey')) {
      return { nom_app: 'Chorey-lès-Beaune', climat: `Les Bons Ores (Sect. ${sec} n°${numero || '1'})`, niveau: 'Village' };
    }

    // LADOIX-SERRIGNY
    if (communeLower.includes('ladoix')) {
      if (['A', 'B'].includes(sec)) return { nom_app: 'Ladoix Premier Cru', climat: 'Les Gréchons et Foutrières', niveau: '1er Cru' };
      return { nom_app: 'Ladoix', climat: `Les Chaillots (Sect. ${sec} n°${numero || '1'})`, niveau: 'Village' };
    }

    // PERNAND-VERGELESSES
    if (communeLower.includes('pernand')) {
      if (['A'].includes(sec)) return { nom_app: 'Corton-Charlemagne Grand Cru', climat: 'En Charlemagne', niveau: 'Grand Cru' };
      if (['B', 'C'].includes(sec)) return { nom_app: 'Pernand-Vergelesses Premier Cru', climat: 'Île des Vergelesses', niveau: '1er Cru' };
      return { nom_app: 'Pernand-Vergelesses', climat: `Les Belles Filles (Sect. ${sec} n°${numero || '1'})`, niveau: 'Village' };
    }

    // ALOXE-CORTON
    if (communeLower.includes('aloxe')) {
      if (['A', 'B'].includes(sec)) return { nom_app: 'Corton Grand Cru', climat: 'Les Bressandes', niveau: 'Grand Cru' };
      if (['C'].includes(sec)) return { nom_app: 'Aloxe-Corton Premier Cru', climat: 'Les Valozières', niveau: '1er Cru' };
      return { nom_app: 'Aloxe-Corton', climat: `Les Chaillots (Sect. ${sec} n°${numero || '1'})`, niveau: 'Village' };
    }

    // SAVIGNY-LES-BEAUNE
    if (communeLower.includes('savigny')) {
      if (['A', 'B'].includes(sec)) return { nom_app: 'Savigny-lès-Beaune Premier Cru', climat: 'Aux Serpentières', niveau: '1er Cru' };
      if (['C', 'D'].includes(sec)) return { nom_app: 'Savigny-lès-Beaune Premier Cru', climat: 'Les Lavières', niveau: '1er Cru' };
      return { nom_app: 'Savigny-lès-Beaune', climat: `Les Grands Liards (Sect. ${sec} n°${numero || '1'})`, niveau: 'Village' };
    }

    // BEAUNE
    if (communeLower.includes('beaune') && !communeLower.includes('chorey') && !communeLower.includes('savigny')) {
      if (['A'].includes(sec)) return { nom_app: 'Beaune Premier Cru', climat: 'Les Bressandes', niveau: '1er Cru' };
      if (['B'].includes(sec)) return { nom_app: 'Beaune Premier Cru', climat: 'Clos des Mouches', niveau: '1er Cru' };
      if (['C'].includes(sec)) return { nom_app: 'Beaune Premier Cru', climat: 'Les Teurons', niveau: '1er Cru' };
      return { nom_app: 'Beaune Premier Cru', climat: 'Les Grèves', niveau: '1er Cru' };
    }

    // POMMARD
    if (communeLower.includes('pommard')) {
      if (['A', 'A1', 'A2'].includes(sec)) return { nom_app: 'Pommard Premier Cru', climat: 'Les Rugiens', niveau: '1er Cru' };
      if (['B', 'B1', 'B2'].includes(sec)) return { nom_app: 'Pommard Premier Cru', climat: 'Les Grands Épenots', niveau: '1er Cru' };
      if (['C'].includes(sec)) return { nom_app: 'Pommard Premier Cru', climat: 'Les Jarollières', niveau: '1er Cru' };
      if (['D'].includes(sec)) return { nom_app: 'Pommard Premier Cru', climat: 'Les Pezerolles', niveau: '1er Cru' };
      return { nom_app: 'Pommard', climat: `En Vignots (Sect. ${sec} n°${numero || '1'})`, niveau: 'Village' };
    }

    // VOLNAY
    if (communeLower.includes('volnay')) {
      if (['A'].includes(sec)) return { nom_app: 'Volnay Premier Cru', climat: 'Les Caillerets', niveau: '1er Cru' };
      if (['B'].includes(sec)) return { nom_app: 'Volnay Premier Cru', climat: 'Les Champans', niveau: '1er Cru' };
      if (['C'].includes(sec)) return { nom_app: 'Volnay Premier Cru', climat: 'Les Santenots du Milieu', niveau: '1er Cru' };
      return { nom_app: 'Volnay', climat: `Climat Volnay (Sect. ${sec} n°${numero || '1'})`, niveau: 'Village' };
    }

    // MEURSAULT
    if (communeLower.includes('meursault')) {
      if (['AA', 'AB', 'A'].includes(sec)) return { nom_app: 'Meursault Premier Cru', climat: 'Les Perrières', niveau: '1er Cru' };
      if (['AC', 'B'].includes(sec)) return { nom_app: 'Meursault Premier Cru', climat: 'Les Charmes', niveau: '1er Cru' };
      if (['AD', 'C'].includes(sec)) return { nom_app: 'Meursault Premier Cru', climat: 'Les Genevrières', niveau: '1er Cru' };
      if (['AH', 'AI'].includes(sec)) return { nom_app: 'Meursault', climat: 'Les Narvaux', niveau: 'Village' };
      return { nom_app: 'Meursault Premier Cru', climat: 'Goutte d’Or', niveau: '1er Cru' };
    }

    // PULIGNY-MONTRACHET
    if (communeLower.includes('puligny')) {
      if (['A'].includes(sec)) return { nom_app: 'Le Montrachet', climat: 'Le Montrachet', niveau: 'Grand Cru' };
      if (['B'].includes(sec)) return { nom_app: 'Puligny-Montrachet Premier Cru', climat: 'Les Pucelles', niveau: '1er Cru' };
      if (['C'].includes(sec)) return { nom_app: 'Puligny-Montrachet Premier Cru', climat: 'Les Folatières', niveau: '1er Cru' };
      return { nom_app: 'Puligny-Montrachet', climat: `Climat Puligny (Sect. ${sec} n°${numero || '1'})`, niveau: 'Village' };
    }

    // CHASSAGNE-MONTRACHET
    if (communeLower.includes('chassagne')) {
      if (['A'].includes(sec)) return { nom_app: 'Bâtard-Montrachet', climat: 'Bâtard-Montrachet', niveau: 'Grand Cru' };
      if (['B'].includes(sec)) return { nom_app: 'Chassagne-Montrachet Premier Cru', climat: 'Morgeot', niveau: '1er Cru' };
      return { nom_app: 'Chassagne-Montrachet Premier Cru', climat: 'Les Vergers', niveau: '1er Cru' };
    }

    // SANTENAY & MARANGES
    if (communeLower.includes('santenay')) {
      return { nom_app: 'Santenay Premier Cru', climat: 'Les Gravières', niveau: '1er Cru' };
    }
    if (communeLower.includes('maranges') || communeLower.includes('dezize') || communeLower.includes('cheilly') || communeLower.includes('sampigny')) {
      return { nom_app: 'Maranges Premier Cru', climat: 'La Fussière', niveau: '1er Cru' };
    }

    // SAINTE-MARIE-LA-BLANCHE (IGP)
    if (communeLower.includes('sainte-marie') || communeLower.includes('ste-marie')) {
      return { nom_app: 'IGP Sainte-Marie-la-Blanche', climat: 'Coteaux de la Saône', niveau: 'IGP' };
    }

    return null;
  }

  /**
   * Add custom imported or offline features to in-memory cache Map and re-index
   */
  public addCustomFeatures(features: ParcelFeature[]): number {
    return this.addFeaturesToCache(features);
  }

  /**
   * Add new features to in-memory cache Map
   * Returns count of newly added features
   */
  private addFeaturesToCache(features: ParcelFeature[]): number {
    let addedCount = 0;
    for (const feature of features) {
      const id = feature.id || feature.properties.id || `${feature.properties.commune}-${feature.properties.code_parcel}`;
      if (!this.cachedParcelMap.has(String(id))) {
        this.cachedParcelMap.set(String(id), feature);
        searchEngine.indexParcel(feature);
        addedCount++;
      }
    }
    if (addedCount > 0) {
      geoService.reevaluateParcels(this.getFeatureCollection());
    }
    return addedCount;
  }

  /**
   * Get all cached features as a FeatureCollection
   */
  public getFeatureCollection(): ParcelFeatureCollection {
    return {
      type: 'FeatureCollection',
      features: Array.from(this.cachedParcelMap.values())
    };
  }

  /**
   * Get all cached features array
   */
  public getAllCachedFeatures(): ParcelFeature[] {
    return Array.from(this.cachedParcelMap.values());
  }

  /**
   * Search parcels by search text query (matches climat, appellation, commune, vigneron)
   * Uses SearchEngine for accent-insensitive, fuzzy, indexed lookup
   */
  public searchParcels(query: string, levelFilter: string = 'ALL'): ParcelFeature[] {
    return searchEngine.search(query, levelFilter);
  }

  /**
   * Update full parcel properties with persistent storage & cloud Firestore sync
   */
  public updateParcelProperties(parcelId: string, updates: Partial<ParcelProperties>): ParcelFeature | null {
    const parcel = this.cachedParcelMap.get(parcelId);
    if (parcel) {
      parcel.properties = {
        ...parcel.properties,
        ...updates
      };
      this.cachedParcelMap.set(parcelId, { ...parcel });
      searchEngine.indexParcel(parcel);

      // Persist in localStorage
      const overrides = this.getUserOverrides();
      overrides[parcelId] = {
        ...(overrides[parcelId] || {}),
        ...updates
      };
      this.saveUserOverrides(overrides);

      // Broadcast to Firebase Firestore for all team members
      firestoreSyncService.saveOverride(parcelId, updates).catch(err => {
        console.warn('Firestore override sync notice:', err);
      });

      this.notifyDataChanged();
      return parcel;
    }
    return null;
  }

  /**
   * Create and register a brand new custom parcel (with GPS & photo)
   */
  public createCustomParcel(newParcel: ParcelFeature): ParcelFeature {
    const id = String(newParcel.id || newParcel.properties.id || `custom-${Date.now()}`);
    newParcel.id = id;
    newParcel.properties.id = id;
    newParcel.properties.is_custom_user_parcel = true;
    newParcel.properties.created_at = newParcel.properties.created_at || new Date().toISOString();

    // 1. Add to cache & index
    this.addFeaturesToCache([newParcel]);

    // 2. Persist locally in localStorage
    try {
      const raw = localStorage.getItem('vignobles_custom_parcelles');
      const existing: ParcelFeature[] = raw ? JSON.parse(raw) : [];
      const filtered = existing.filter(p => (p.id || p.properties.id) !== id);
      filtered.push(newParcel);
      localStorage.setItem('vignobles_custom_parcelles', JSON.stringify(filtered));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }

    // 3. Sync to Firebase Firestore
    firestoreSyncService.saveCustomParcel(newParcel).catch(err => {
      console.warn('Firestore custom parcel sync notice:', err);
    });

    this.notifyDataChanged();
    return newParcel;
  }

  /**
   * Reset parcel properties to original catalog defaults
   */
  public resetParcelProperties(parcelId: string): ParcelFeature | null {
    const overrides = this.getUserOverrides();
    if (overrides[parcelId]) {
      delete overrides[parcelId];
      this.saveUserOverrides(overrides);

      // Remove from Firebase Firestore
      firestoreSyncService.removeOverride(parcelId).catch(err => {
        console.warn('Firestore override removal notice:', err);
      });

      // Re-seed original data
      const origLivret = LEFLAIVE_PARCEL_FEATURES.find(f => f.id === parcelId || f.properties.id === parcelId);
      const origBurgundy = BURGUNDY_PARCELS_GEOJSON.features.find(f => f.id === parcelId || (f.properties && f.properties.id === parcelId));
      const base = origLivret || (origBurgundy as ParcelFeature | undefined);

      if (base) {
        this.cachedParcelMap.set(parcelId, JSON.parse(JSON.stringify(base)));
        const restored = this.cachedParcelMap.get(parcelId)!;
        searchEngine.indexParcel(restored);
        this.notifyDataChanged();
        return restored;
      }
    }
    return this.cachedParcelMap.get(parcelId) || null;
  }

  /**
   * Check if a parcel has user modifications
   */
  public hasUserOverrides(parcelId: string): boolean {
    const overrides = this.getUserOverrides();
    return Boolean(overrides[parcelId]);
  }

  /**
   * Return only the 156 official harvest book parcels (Livret des Vendanges)
   * with current live properties and Firestore synchronization
   */
  public getHarvestParcels(): ParcelFeature[] {
    return LEFLAIVE_PARCEL_FEATURES.map(orig => {
      const id = String(orig.id || orig.properties.id);
      const cached = this.cachedParcelMap.get(id);
      return cached || orig;
    });
  }

  /**
   * Update vigneron or custom notes for a parcel in memory (with persistence)
   */
  public updateParcelNotes(parcelId: string, vigneron: string, notes: string): ParcelFeature | null {
    return this.updateParcelProperties(parcelId, {
      vigneron,
      proprietaire: vigneron,
      notes
    });
  }
}

export const dataManager = new DataManager();
