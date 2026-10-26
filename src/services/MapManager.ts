import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ClassificationLevel, ParcelFeature, ParcelProperties } from '../types';

export interface MapManagerOptions {
  containerId: string;
  initialCenter?: [number, number];
  initialZoom?: number;
  onParcelSelect: (parcel: ParcelFeature) => void;
  onBoundsChange: (bbox: { minLng: number; minLat: number; maxLng: number; maxLat: number }, zoom: number) => void;
  onMapBackgroundClick?: () => void;
}

export class MapManager {
  private map: L.Map | null = null;
  private geojsonLayer: L.GeoJSON | null = null;
  private userLocationMarker: L.CircleMarker | null = null;
  private userAccuracyCircle: L.Circle | null = null;
  private selectedParcelLayer: L.Layer | null = null;
  private selectedParcelId: string | null = null;
  private currentFeatures: ParcelFeature[] = [];
  private darkTileLayer: L.TileLayer | null = null;
  private satelliteLayer: L.TileLayer | null = null;
  public currentBaseLayer: 'voyager' | 'satellite' = 'satellite';

  private onParcelSelectCallback: ((parcel: ParcelFeature) => void) | null = null;
  private onBoundsChangeCallback: ((bbox: { minLng: number; minLat: number; maxLng: number; maxLat: number }, zoom: number) => void) | null = null;

  public init(options: MapManagerOptions): L.Map {
    const { containerId, initialCenter = [47.1610, 4.9520], initialZoom = 15, onParcelSelect, onBoundsChange } = options;

    this.onParcelSelectCallback = onParcelSelect;
    this.onBoundsChangeCallback = onBoundsChange;

    // Fix Leaflet marker icons in Vite
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    this.map = L.map(containerId, {
      preferCanvas: false,
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false, // We render custom zoom controls for mobile ergonomics
      attributionControl: false
    });

    // Base CartoDB Dark Matter / Satellite Hybrid map tiles for field readability
    const darkTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    });

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
    });

    darkTileLayer.addTo(this.map);
    this.darkTileLayer = darkTileLayer;
    this.satelliteLayer = satelliteLayer;
    this.currentBaseLayer = 'satellite'; // start on satellite by default or voyager

    // Set Satellite as active base layer by default
    this.map.removeLayer(darkTileLayer);
    satelliteLayer.addTo(this.map);

    // Listen to moveend and zoomend to notify BBOX changes
    this.map.on('moveend zoomend', () => {
      this.emitBoundsChange();
    });

    // Listen to background click on map
    this.map.on('click', () => {
      if (options.onMapBackgroundClick) {
        options.onMapBackgroundClick();
      }
    });

    return this.map;
  }

  private layerByParcelId = new Map<string, L.Layer>();

  /**
   * Render or update GeoJSON parcel features on map
   */
  public renderParcels(features: ParcelFeature[]): void {
    if (!this.map) return;

    this.currentFeatures = features;
    this.layerByParcelId.clear();

    if (this.geojsonLayer) {
      this.map.removeLayer(this.geojsonLayer);
    }

    this.geojsonLayer = L.geoJSON(
      {
        type: 'FeatureCollection',
        features: features as any[]
      } as any,
      {
        style: (feature) => this.getStyleForFeature(feature as any),
        onEachFeature: (feature, layer) => {
          const fid = String(feature.id || (feature as any).properties?.id || (feature as any).properties?.code_parcel);
          if (fid) {
            this.layerByParcelId.set(fid, layer);
          }

          layer.on({
            click: (e) => {
              if (e.originalEvent) {
                e.originalEvent.stopPropagation();
              }
              L.DomEvent.stopPropagation(e as any);
              this.selectParcel(feature as any, layer);
              if (this.onParcelSelectCallback) {
                this.onParcelSelectCallback(feature as any);
              }
            },
            mouseover: () => {
              if (layer !== this.selectedParcelLayer && (layer as any).setStyle) {
                (layer as any).setStyle({ fillOpacity: 0.6, weight: 3 });
              }
            },
            mouseout: () => {
              if (layer !== this.selectedParcelLayer && (layer as any).setStyle) {
                (layer as any).setStyle(this.getStyleForFeature(feature as any));
              }
            }
          });
        }
      }
    ).addTo(this.map);

    // Re-highlight if a parcel was previously selected
    if (this.selectedParcelId) {
      this.highlightParcelById(this.selectedParcelId);
    }
  }

  /**
   * High-contrast styling based on classification level
   */
  public getStyleForFeature(feature: ParcelFeature): L.PathOptions {
    const isSelected = feature.id === this.selectedParcelId || feature.properties.id === this.selectedParcelId;
    const level: ClassificationLevel = feature.properties.niveau || 'Village';
    const harvestStatus = feature.properties.harvest_status;

    let color = '#10B981'; // Green for Village
    let fillColor = '#10B981';

    // Prioritize harvest status if explicitly marked during vendanges
    if (harvestStatus === 'vendange') {
      color = '#10B981'; // Bright Green checked
      fillColor = '#059669';
    } else if (harvestStatus === 'en_cours') {
      color = '#F59E0B'; // Amber Orange
      fillColor = '#D97706';
    } else if (harvestStatus === 'a_faire') {
      color = '#3B82F6'; // Blue
      fillColor = '#2563EB';
    } else {
      switch (level) {
        case 'Grand Cru':
          color = '#D4AF37'; // Gold
          fillColor = '#F59E0B';
          break;
        case '1er Cru':
          color = '#A855F7'; // Violet/Purple
          fillColor = '#8B5CF6';
          break;
        case 'Village':
          color = '#10B981'; // Emerald Green
          fillColor = '#10B981';
          break;
        case 'Régionale':
          color = '#3B82F6'; // Blue
          fillColor = '#3B82F6';
          break;
        default:
          color = '#6B7280';
          fillColor = '#6B7280';
      }
    }

    if (isSelected) {
      return {
        color: '#FFFFFF',
        fillColor: harvestStatus === 'vendange' ? '#10B981' : (harvestStatus === 'en_cours' ? '#F59E0B' : '#F59E0B'),
        weight: 3,
        opacity: 1,
        fillOpacity: 0.65,
        dashArray: undefined
      };
    }

    return {
      color: color,
      fillColor: fillColor,
      weight: harvestStatus ? 2.5 : (level === 'Grand Cru' || level === '1er Cru' ? 2 : 1.5),
      opacity: 0.9,
      fillOpacity: harvestStatus === 'vendange' ? 0.35 : (harvestStatus === 'en_cours' ? 0.4 : 0.18),
      dashArray: harvestStatus === 'en_cours' ? '4, 4' : undefined
    };
  }

  /**
   * Programmatically select parcel and highlight on map
   */
  public selectParcel(feature: ParcelFeature | null, layer?: L.Layer): void {
    const prevLayer = this.selectedParcelLayer;
    const prevId = this.selectedParcelId;

    if (!feature) {
      this.selectedParcelId = null;
      this.selectedParcelLayer = null;
      if (prevLayer && (prevLayer as any).setStyle && prevId) {
        const prevFeat = (prevLayer as any).feature as ParcelFeature;
        if (prevFeat) {
          (prevLayer as any).setStyle(this.getStyleForFeature(prevFeat));
        }
      }
      return;
    }

    const parcelId = String(feature.id || feature.properties.id || feature.properties.code_parcel);
    if (this.selectedParcelId === parcelId && this.selectedParcelLayer) {
      return;
    }

    // Reset previous selection style
    if (prevLayer && (prevLayer as any).setStyle) {
      const prevFeat = (prevLayer as any).feature as ParcelFeature;
      if (prevFeat) {
        (prevLayer as any).setStyle(this.getStyleForFeature(prevFeat));
      }
    }

    this.selectedParcelId = parcelId;
    const targetLayer = layer || this.layerByParcelId.get(parcelId);

    if (targetLayer) {
      this.selectedParcelLayer = targetLayer;
      (targetLayer as any).setStyle(this.getStyleForFeature(feature));
      if ((targetLayer as any).bringToFront) {
        (targetLayer as any).bringToFront();
      }
    }
  }

  /**
   * Highlight parcel by ID
   */
  public highlightParcelById(parcelId: string): void {
    const targetLayer = this.layerByParcelId.get(parcelId);
    if (targetLayer) {
      const feature = (targetLayer as any).feature as ParcelFeature;
      if (feature) {
        this.selectParcel(feature, targetLayer);
      }
    }
  }

  /**
   * Pan & Zoom smoothly to a parcel polygon without excessive forced zoom
   */
  public flyToParcel(feature: ParcelFeature, options?: { maxZoom?: number }): void {
    if (!this.map || !feature.geometry) return;

    try {
      const geoLayer = L.geoJSON(feature as any);
      const bounds = geoLayer.getBounds();
      if (bounds.isValid()) {
        const isMobile = window.innerWidth < 640;
        const currentZoom = this.map.getZoom();
        // If map is already at a good zoom level (>=15), don't aggressively zoom in to 17
        const targetMaxZoom = options?.maxZoom ?? Math.max(currentZoom, 15);
        this.map.flyToBounds(bounds, {
          paddingTopLeft: isMobile ? [20, 90] : [60, 80],
          paddingBottomRight: isMobile ? [20, 220] : [60, 80],
          maxZoom: targetMaxZoom,
          duration: 0.7
        });
      }
    } catch (e) {
      console.warn('Could not fly to parcel bounds:', e);
    }
  }

  /**
   * Pan to parcel center while keeping current zoom level intact
   */
  public panToParcelCenter(feature: ParcelFeature): void {
    if (!this.map || !feature.geometry) return;
    try {
      const geoLayer = L.geoJSON(feature as any);
      const center = geoLayer.getBounds().getCenter();
      if (center) {
        this.map.panTo(center, { animate: true, duration: 0.5 });
      }
    } catch (e) {
      console.warn('Could not pan to parcel center:', e);
    }
  }

  /**
   * Update User GPS position marker and accuracy circle on map
   */
  public updateUserLocation(lat: number, lng: number, accuracy?: number | null): void {
    if (!this.map) return;

    const latLng = L.latLng(lat, lng);

    if (!this.userLocationMarker) {
      // Create pulsing user marker
      this.userLocationMarker = L.circleMarker(latLng, {
        radius: 9,
        color: '#FFFFFF',
        weight: 3,
        fillColor: '#2563EB',
        fillOpacity: 1,
        className: 'gps-user-marker'
      }).addTo(this.map);
    } else {
      this.userLocationMarker.setLatLng(latLng);
    }

    if (accuracy) {
      if (!this.userAccuracyCircle) {
        this.userAccuracyCircle = L.circle(latLng, {
          radius: accuracy,
          color: '#3B82F6',
          weight: 1,
          fillColor: '#60A5FA',
          fillOpacity: 0.15
        }).addTo(this.map);
      } else {
        this.userAccuracyCircle.setLatLng(latLng);
        this.userAccuracyCircle.setRadius(accuracy);
      }
    }

    this.userLocationMarker.bringToFront();
  }

  /**
   * Pan map to current user GPS location
   */
  public centerOnUser(lat: number, lng: number): void {
    if (this.map) {
      this.map.flyTo([lat, lng], 17, { duration: 1.2 });
    }
  }

  /**
   * Emit current map view bounding box to listener
   */
  private emitBoundsChange(): void {
    if (!this.map || !this.onBoundsChangeCallback) return;

    const bounds = this.map.getBounds();
    const zoom = this.map.getZoom();

    this.onBoundsChangeCallback(
      {
        minLng: bounds.getWest(),
        minLat: bounds.getSouth(),
        maxLng: bounds.getEast(),
        maxLat: bounds.getNorth(),
      },
      zoom
    );
  }

  public toggleBaseLayer(): 'voyager' | 'satellite' {
    if (!this.map || !this.darkTileLayer || !this.satelliteLayer) return this.currentBaseLayer;
    if (this.currentBaseLayer === 'satellite') {
      this.map.removeLayer(this.satelliteLayer);
      this.darkTileLayer.addTo(this.map);
      this.currentBaseLayer = 'voyager';
    } else {
      this.map.removeLayer(this.darkTileLayer);
      this.satelliteLayer.addTo(this.map);
      this.currentBaseLayer = 'satellite';
    }
    return this.currentBaseLayer;
  }

  public setBaseLayer(layer: 'voyager' | 'satellite'): void {
    if (!this.map || !this.darkTileLayer || !this.satelliteLayer) return;
    if (layer === 'satellite' && this.currentBaseLayer !== 'satellite') {
      this.map.removeLayer(this.darkTileLayer);
      this.satelliteLayer.addTo(this.map);
      this.currentBaseLayer = 'satellite';
    } else if (layer === 'voyager' && this.currentBaseLayer !== 'voyager') {
      this.map.removeLayer(this.satelliteLayer);
      this.darkTileLayer.addTo(this.map);
      this.currentBaseLayer = 'voyager';
    }
  }

  public getMap(): L.Map | null {
    return this.map;
  }

  public destroy(): void {
    if (this.geojsonLayer && this.map) {
      try {
        this.map.removeLayer(this.geojsonLayer);
      } catch (e) {
        // ignore cleanup error
      }
      this.geojsonLayer = null;
    }
    if (this.userLocationMarker && this.map) {
      try {
        this.map.removeLayer(this.userLocationMarker);
      } catch (e) {
        // ignore cleanup error
      }
      this.userLocationMarker = null;
    }
    if (this.userAccuracyCircle && this.map) {
      try {
        this.map.removeLayer(this.userAccuracyCircle);
      } catch (e) {
        // ignore cleanup error
      }
      this.userAccuracyCircle = null;
    }
    if (this.map) {
      try {
        this.map.off();
        this.map.remove();
      } catch (e) {
        // ignore map removal error
      }
      this.map = null;
    }
  }
}
