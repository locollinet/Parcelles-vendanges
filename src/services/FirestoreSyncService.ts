import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs,
  serverTimestamp,
  deleteField
} from 'firebase/firestore';
import { db } from './firebase';
import { ParcelFeature, ParcelProperties } from '../types';

/**
 * Recursively sanitizes data before sending to Firestore.
 * Converts `undefined` properties to `deleteField()` so Firestore merges cleanly
 * without throwing "Unsupported field value: undefined".
 */
function sanitizeForFirestore<T extends Record<string, any>>(data: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key of Object.keys(data)) {
    const value = data[key];
    if (value === undefined) {
      result[key] = deleteField();
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      result[key] = sanitizeForFirestore(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export class FirestoreSyncService {
  private unsubOverrides: (() => void) | null = null;
  private unsubCustomParcels: (() => void) | null = null;

  /**
   * Listen to real-time parcel overrides made by any team member
   */
  public subscribeToOverrides(onUpdate: (overrides: Record<string, Partial<ParcelProperties>>) => void): () => void {
    try {
      const collRef = collection(db, 'overrides');
      this.unsubOverrides = onSnapshot(collRef, (snapshot) => {
        const overrides: Record<string, Partial<ParcelProperties>> = {};
        snapshot.forEach((docSnap) => {
          overrides[docSnap.id] = docSnap.data() as Partial<ParcelProperties>;
        });
        onUpdate(overrides);
      }, (error) => {
        console.warn('Firestore overrides subscription notice:', error);
      });
    } catch (err) {
      console.warn('Firestore overrides init notice:', err);
    }

    return () => {
      if (this.unsubOverrides) {
        this.unsubOverrides();
        this.unsubOverrides = null;
      }
    };
  }

  /**
   * Listen to real-time custom parcels created by any team member
   */
  public subscribeToCustomParcels(onUpdate: (parcels: ParcelFeature[]) => void): () => void {
    try {
      const collRef = collection(db, 'custom_parcelles');
      this.unsubCustomParcels = onSnapshot(collRef, (snapshot) => {
        const parcels: ParcelFeature[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as ParcelFeature;
          if (data && data.geometry && data.properties) {
            parcels.push(data);
          }
        });
        onUpdate(parcels);
      }, (error) => {
        console.warn('Firestore custom parcelles subscription notice:', error);
      });
    } catch (err) {
      console.warn('Firestore custom parcelles init notice:', err);
    }

    return () => {
      if (this.unsubCustomParcels) {
        this.unsubCustomParcels();
        this.unsubCustomParcels = null;
      }
    };
  }

  /**
   * Save a manual override or note on any existing parcel
   */
  public async saveOverride(parcelId: string, updates: Partial<ParcelProperties>): Promise<void> {
    try {
      const docRef = doc(db, 'overrides', parcelId);
      const sanitized = sanitizeForFirestore({
        ...updates,
        updated_at: new Date().toISOString()
      });
      await setDoc(docRef, sanitized, { merge: true });
    } catch (err) {
      console.error('Error saving override to Firestore:', err);
      throw err;
    }
  }

  /**
   * Remove an override (reset to original catalog data)
   */
  public async removeOverride(parcelId: string): Promise<void> {
    try {
      const docRef = doc(db, 'overrides', parcelId);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Error removing override from Firestore:', err);
      throw err;
    }
  }

  /**
   * Save a newly created custom parcel to Firestore (accessible to the whole team)
   */
  public async saveCustomParcel(parcel: ParcelFeature): Promise<void> {
    try {
      const parcelId = String(parcel.id || parcel.properties.id);
      const docRef = doc(db, 'custom_parcelles', parcelId);
      const sanitized = sanitizeForFirestore({
        ...parcel,
        properties: {
          ...parcel.properties,
          updated_at: new Date().toISOString()
        }
      });
      await setDoc(docRef, sanitized, { merge: true });
    } catch (err) {
      console.error('Error saving custom parcel to Firestore:', err);
      throw err;
    }
  }

  /**
   * Delete a custom parcel from Firestore
   */
  public async deleteCustomParcel(parcelId: string): Promise<void> {
    try {
      const docRef = doc(db, 'custom_parcelles', parcelId);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Error deleting custom parcel from Firestore:', err);
      throw err;
    }
  }
}

export const firestoreSyncService = new FirestoreSyncService();
