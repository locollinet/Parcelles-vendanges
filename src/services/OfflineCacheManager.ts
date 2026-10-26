import { ParcelFeature } from '../types';
import { LEFLAIVE_PARCEL_FEATURES } from '../data/leflaiveCatalog';

export interface SavedSector {
  id: string;
  name: string;
  communes: string[];
  subregion: string;
  center: [number, number];
  featureCount: number;
  downloadDate: string;
  sizeKb: number;
  isLivretPack?: boolean;
}

const STORAGE_KEY_PREFIX = 'burgundy_offline_sector_';
const INDEX_KEY = 'burgundy_offline_sectors_index';

export class OfflineCacheManager {
  /**
   * Save a parcel collection for a named sector into LocalStorage
   */
  public saveSector(
    sectorId: string,
    sectorName: string,
    subregion: string,
    communes: string[],
    center: [number, number],
    features: ParcelFeature[],
    isLivretPack: boolean = false
  ): SavedSector {
    const jsonStr = JSON.stringify(features);
    const sizeKb = Math.round(new Blob([jsonStr]).size / 1024);

    const savedSector: SavedSector = {
      id: sectorId,
      name: sectorName,
      subregion,
      communes,
      center,
      featureCount: features.length,
      downloadDate: new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      sizeKb,
      isLivretPack,
    };

    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${sectorId}`, jsonStr);

      const index = this.getSavedSectorsIndex();
      const updatedIndex = index.filter((s) => s.id !== sectorId);
      updatedIndex.push(savedSector);
      localStorage.setItem(INDEX_KEY, JSON.stringify(updatedIndex));
    } catch (err) {
      console.warn('LocalStorage size limit reached for offline sector', err);
    }

    return savedSector;
  }

  /**
   * Save the full Livret (all 156 parcels) for offline field usage
   */
  public saveFullLivret(): SavedSector {
    return this.saveSector(
      'livret_integral_156',
      'Pack Intégral Livret des Vendanges (156 parcelles)',
      'Domaine Olivier Leflaive',
      [
        'Puligny-Montrachet',
        'Chassagne-Montrachet',
        'Meursault',
        'Auxey-Duresses',
        'Saint-Romain',
        'Pernand-Vergelesses',
        'Pommard',
        'Volnay',
        'Monthelie',
        'Mâcon-Verzé',
        'Pouilly-Fuissé',
        'Solutré-Pouilly',
        'Rully',
        'Montagny'
      ],
      [46.9635, 4.7555],
      LEFLAIVE_PARCEL_FEATURES,
      true
    );
  }

  /**
   * Check if full Livret is saved offline
   */
  public isFullLivretSaved(): boolean {
    const index = this.getSavedSectorsIndex();
    return index.some((s) => s.id === 'livret_integral_156');
  }

  /**
   * Get list of all saved offline sectors
   */
  public getSavedSectorsIndex(): SavedSector[] {
    try {
      const raw = localStorage.getItem(INDEX_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Load features for a saved sector
   */
  public loadSectorFeatures(sectorId: string): ParcelFeature[] {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${sectorId}`);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Delete a saved sector
   */
  public deleteSector(sectorId: string): void {
    try {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${sectorId}`);
      const index = this.getSavedSectorsIndex();
      const updatedIndex = index.filter((s) => s.id !== sectorId);
      localStorage.setItem(INDEX_KEY, JSON.stringify(updatedIndex));
    } catch (e) {
      console.error('Error removing sector from offline storage', e);
    }
  }

  /**
   * Clear all offline storage
   */
  public clearAllOffline(): void {
    try {
      const index = this.getSavedSectorsIndex();
      for (const s of index) {
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}${s.id}`);
      }
      localStorage.removeItem(INDEX_KEY);
    } catch (e) {
      console.error('Error clearing offline storage', e);
    }
  }

  /**
   * Get all offline stored features combined
   */
  public getAllOfflineFeatures(): ParcelFeature[] {
    const index = this.getSavedSectorsIndex();
    const allFeatures: ParcelFeature[] = [];
    const seenIds = new Set<string>();

    for (const sec of index) {
      const feats = this.loadSectorFeatures(sec.id);
      for (const f of feats) {
        const id = String(f.id || f.properties.id || f.properties.code_parcel);
        if (!seenIds.has(id)) {
          seenIds.add(id);
          allFeatures.push(f);
        }
      }
    }

    return allFeatures;
  }

  /**
   * Total size of offline cache in MB
   */
  public getTotalOfflineSizeMb(): number {
    const index = this.getSavedSectorsIndex();
    const totalKb = index.reduce((acc, curr) => acc + curr.sizeKb, 0);
    return Math.round((totalKb / 1024) * 10) / 10;
  }
}

export const offlineCacheManager = new OfflineCacheManager();
