import * as turf from '@turf/turf';
import { LocationState, NearbyParcel, ParcelFeature, ParcelFeatureCollection } from '../types';

export class GeoService {
  private watchId: number | null = null;
  private safetyTimeoutId: any = null;
  private onLocationChangeCallback: ((location: LocationState) => void) | null = null;
  private centroidCache = new Map<string, [number, number]>();
  private lastProcessedPosTime = 0;
  private lastProcessedLat: number | null = null;
  private lastProcessedLng: number | null = null;

  private currentLocationState: LocationState = {
    latitude: null,
    longitude: null,
    accuracy: null,
    heading: null,
    speed: null,
    timestamp: null,
    status: 'disabled',
    currentParcel: null,
    nearbyParcels: [],
  };

  /**
   * Start tracking user position using real browser geolocation API
   */
  public startTracking(
    onLocationChange: (location: LocationState) => void,
    parcels: ParcelFeatureCollection
  ): void {
    this.onLocationChangeCallback = onLocationChange;

    // Stop existing watch/timers
    this.stopTracking(false);

    if (!navigator.geolocation) {
      this.currentLocationState = {
        ...this.currentLocationState,
        status: 'error',
        errorMsg: 'La géolocalisation n’est pas supportée par votre navigateur.'
      };
      this.notifyUpdate();
      return;
    }

    this.currentLocationState.status = 'searching';
    this.notifyUpdate();

    const handleSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy, heading, speed } = position.coords;
      const now = Date.now();

      // Skip recalculations if movement is negligible and updated recently
      if (
        this.lastProcessedLat !== null &&
        this.lastProcessedLng !== null &&
        now - this.lastProcessedPosTime < 500
      ) {
        const dLat = Math.abs(latitude - this.lastProcessedLat);
        const dLng = Math.abs(longitude - this.lastProcessedLng);
        if (dLat < 0.000005 && dLng < 0.000005) {
          return;
        }
      }

      this.lastProcessedPosTime = now;
      this.lastProcessedLat = latitude;
      this.lastProcessedLng = longitude;

      const currentParcel = this.findParcelForPoint(latitude, longitude, parcels);
      const nearbyParcels = this.findNearbyParcels(latitude, longitude, parcels);

      this.currentLocationState = {
        latitude,
        longitude,
        accuracy: accuracy || null,
        heading: heading || null,
        speed: speed || null,
        timestamp: position.timestamp,
        status: 'active',
        currentParcel,
        nearbyParcels,
        errorMsg: undefined,
      };
      this.notifyUpdate();
    };

    const handleError = (error: GeolocationPositionError) => {
      let errorMsg = 'Erreur de géolocalisation.';
      if (error.code === error.PERMISSION_DENIED) {
        errorMsg = 'Permission GPS refusée. Veuillez autoriser la localisation dans votre navigateur.';
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        errorMsg = 'Signal GPS indisponible. Vérifiez vos paramètres ou votre réseau.';
      } else if (error.code === error.TIMEOUT) {
        errorMsg = 'Délai d’attente GPS dépassé. Veuillez réespayer.';
      }

      this.currentLocationState = {
        ...this.currentLocationState,
        status: 'error',
        errorMsg,
      };
      this.notifyUpdate();
    };

    // Request actual current position
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      (err) => {
        // Retry with high accuracy if standard accuracy failed
        navigator.geolocation.getCurrentPosition(
          handleSuccess,
          handleError,
          { enableHighAccuracy: true, timeout: 12000, maximumAge: 5000 }
        );
      },
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 5000 }
    );

    // Continuous watch position for real-time tracking
    try {
      this.watchId = navigator.geolocation.watchPosition(
        handleSuccess,
        (err) => console.warn('WatchPosition info:', err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 3000 }
      );
    } catch (e) {
      // Ignore watchPosition errors
    }
  }

  /**
   * Stop tracking user position
   */
  public stopTracking(resetStatus: boolean = true): void {
    if (this.safetyTimeoutId) {
      clearTimeout(this.safetyTimeoutId);
      this.safetyTimeoutId = null;
    }
    if (this.watchId !== null && navigator.geolocation) {
      try {
        navigator.geolocation.clearWatch(this.watchId);
      } catch (e) {
        // ignore
      }
      this.watchId = null;
    }
    if (resetStatus) {
      this.currentLocationState.status = 'disabled';
      this.currentLocationState.currentParcel = null;
      this.notifyUpdate();
    }
  }

  /**
   * Helper to compute or retrieve cached bounding box [minLat, maxLat, minLng, maxLng] for a parcel
   */
  private getParcelBbox(feature: ParcelFeature): [number, number, number, number] | null {
    if (!feature || !feature.geometry) return null;

    const key = String(feature.id || feature.properties?.id || feature.properties?.code_parcel);
    if ((feature as any)._bbox) {
      return (feature as any)._bbox;
    }

    try {
      const bbox = turf.bbox(feature as any); // [minLng, minLat, maxLng, maxLat]
      const result: [number, number, number, number] = [bbox[1], bbox[3], bbox[0], bbox[2]];
      (feature as any)._bbox = result;
      return result;
    } catch (err) {
      return null;
    }
  }

  /**
   * Evaluate which parcel contains the given lat/lng point using turf.booleanPointInPolygon with bounding-box pre-filtering
   */
  public findParcelForPoint(
    lat: number,
    lng: number,
    parcels: ParcelFeatureCollection
  ): ParcelFeature | null {
    if (!lat || !lng || !parcels || !parcels.features) return null;

    try {
      const pt = turf.point([lng, lat]);

      for (const feature of parcels.features) {
        if (!feature.geometry) continue;

        // Bounding box pre-filter check
        const bbox = this.getParcelBbox(feature);
        if (bbox) {
          const [minLat, maxLat, minLng, maxLng] = bbox;
          if (lat < minLat || lat > maxLat || lng < minLng || lng > maxLng) {
            continue; // Skip expensive polygon calculation if point is outside bounding box
          }
        }
        
        // Ensure polygon coordinates are properly structured
        if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
          const isInside = turf.booleanPointInPolygon(pt, feature as any);
          if (isInside) {
            return feature;
          }
        }
      }
    } catch (err) {
      console.warn('Error evaluating booleanPointInPolygon:', err);
    }

    return null;
  }

  /**
   * Calculate exact centroid of a parcel feature using turf.centroid with caching
   */
  public getParcelCentroid(feature: ParcelFeature): [number, number] | null {
    if (!feature || !feature.geometry) return null;

    const key = String(feature.id || feature.properties?.id || feature.properties?.code_parcel);
    if (key && this.centroidCache.has(key)) {
      return this.centroidCache.get(key)!;
    }

    try {
      const center = turf.centroid(feature as any);
      if (center && center.geometry && center.geometry.coordinates) {
        // turf returns [lng, lat], Leaflet needs [lat, lng]
        const [lng, lat] = center.geometry.coordinates;
        const res: [number, number] = [lat, lng];
        if (key) {
          this.centroidCache.set(key, res);
        }
        return res;
      }
    } catch (err) {
      console.warn('Error calculating centroid:', err);
    }

    return null;
  }

  /**
   * Generate direct Google Maps navigation URL
   * Prioritizes exact GPS coordinates with travelmode=driving
   * This bypasses maps.app.goo.gl redirect server failures, eco-mode cell tower sleep at dawn,
   * and prevents Google Maps from defaulting to nonexistent public transit at 5:00 AM.
   */
  public getGoogleMapsUrl(feature: ParcelFeature): string | null {
    const coords = this.getParcelCentroid(feature);
    if (coords) {
      const [lat, lng] = coords;
      return `https://www.google.com/maps/dir/?api=1&destination=${lat.toFixed(6)},${lng.toFixed(6)}&travelmode=driving`;
    }
    if (feature.properties?.google_maps_nav_url) {
      return feature.properties.google_maps_nav_url;
    }
    return null;
  }

  /**
   * Find parcels around user lat/lng sorted by distance (meters)
   */
  public findNearbyParcels(
    lat: number,
    lng: number,
    parcels: ParcelFeatureCollection,
    maxDistanceMeters: number = 5000,
    limit: number = 50
  ): NearbyParcel[] {
    if (!lat || !lng || !parcels || !parcels.features) return [];

    const userPt = turf.point([lng, lat]);
    const list: NearbyParcel[] = [];

    // Convert maxDistanceMeters to approximate lat/lng degree padding (~111km per degree lat)
    const degreePadding = (maxDistanceMeters / 1000) / 100;

    for (const feature of parcels.features) {
      if (!feature.geometry) continue;

      // Quick bounding box check with distance margin
      const bbox = this.getParcelBbox(feature);
      if (bbox) {
        const [minLat, maxLat, minLng, maxLng] = bbox;
        if (
          lat < minLat - degreePadding ||
          lat > maxLat + degreePadding ||
          lng < minLng - degreePadding ||
          lng > maxLng + degreePadding
        ) {
          continue; // Far away, skip distance calculation
        }
      }

      try {
        let isInside = false;
        if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
          isInside = turf.booleanPointInPolygon(userPt, feature as any);
        }

        let distanceMeters = 0;
        let bearing = 0;
        let directionText = 'N';

        if (isInside) {
          distanceMeters = 0;
        } else {
          const centroidCoords = this.getParcelCentroid(feature);
          if (centroidCoords) {
            const centroidPt = turf.point([centroidCoords[1], centroidCoords[0]]);
            const distKm = turf.distance(userPt, centroidPt, { units: 'kilometers' });
            distanceMeters = Math.round(distKm * 1000);
            
            // Bearing calculation from user to parcel centroid
            try {
              bearing = Math.round(turf.bearing(userPt, centroidPt));
              directionText = this.bearingToCardinal(bearing);
            } catch (e) {
              // fallback
            }
          }
        }

        if (isInside || distanceMeters <= maxDistanceMeters) {
          list.push({
            feature,
            distanceMeters,
            bearing,
            directionText,
            isInside,
          });
        }
      } catch (err) {
        // Continue on any geometry parsing error
      }
    }

    list.sort((a, b) => a.distanceMeters - b.distanceMeters);
    return list.slice(0, limit);
  }

  /**
   * Simulate GPS location for testing / demo in Burgundy
   */
  public simulateLocation(
    lat: number,
    lng: number,
    parcels: ParcelFeatureCollection
  ): LocationState {
    const currentParcel = this.findParcelForPoint(lat, lng, parcels);
    const nearbyParcels = this.findNearbyParcels(lat, lng, parcels);

    this.currentLocationState = {
      latitude: lat,
      longitude: lng,
      accuracy: 6,
      heading: 45,
      speed: 0,
      timestamp: Date.now(),
      status: 'active',
      currentParcel,
      nearbyParcels,
    };
    this.notifyUpdate();
    return this.currentLocationState;
  }

  public getCurrentState(): LocationState {
    return this.currentLocationState;
  }

  /**
   * Re-evaluate current parcel and nearby parcels whenever new features are added to DataManager
   */
  public reevaluateParcels(parcels: ParcelFeatureCollection): void {
    if (this.currentLocationState.latitude !== null && this.currentLocationState.longitude !== null) {
      const lat = this.currentLocationState.latitude;
      const lng = this.currentLocationState.longitude;
      const currentParcel = this.findParcelForPoint(lat, lng, parcels);
      const nearbyParcels = this.findNearbyParcels(lat, lng, parcels);

      this.currentLocationState.currentParcel = currentParcel;
      this.currentLocationState.nearbyParcels = nearbyParcels;
      this.notifyUpdate();
    }
  }

  public bearingToCardinal(bearingDeg: number): string {
    const normalized = (bearingDeg + 360) % 360;
    const cardinals = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    const index = Math.round(normalized / 45) % 8;
    return cardinals[index];
  }

  /**
   * Get direct navigation vector (distance, bearing, cardinal direction) to a parcel from current position
   */
  public getVectorToParcel(
    fromLat: number,
    fromLng: number,
    feature: ParcelFeature
  ): { distanceMeters: number; bearing: number; directionText: string } | null {
    try {
      const userPt = turf.point([fromLng, fromLat]);
      const centroidCoords = this.getParcelCentroid(feature);
      if (!centroidCoords) return null;

      const centroidPt = turf.point([centroidCoords[1], centroidCoords[0]]);
      const distKm = turf.distance(userPt, centroidPt, { units: 'kilometers' });
      const distanceMeters = Math.round(distKm * 1000);
      const bearing = Math.round(turf.bearing(userPt, centroidPt));
      const directionText = this.bearingToCardinal(bearing);

      return { distanceMeters, bearing, directionText };
    } catch (e) {
      return null;
    }
  }

  private notifyUpdate(): void {
    if (this.onLocationChangeCallback) {
      this.onLocationChangeCallback({ ...this.currentLocationState });
    }
  }
}

export const geoService = new GeoService();
