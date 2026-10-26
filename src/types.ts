export type ClassificationLevel = 'Grand Cru' | '1er Cru' | 'Village' | 'Régionale' | 'IGP' | 'ALL' | string;
export type HarvestStatus = 'a_faire' | 'en_cours' | 'vendange' | undefined;

export interface LeflaiveParcelEntry {
  id: string;
  secteur: string;
  nom_parcelle: string;
  code: string;
  nb_rangs: string;
  numero_livret?: number | string;
  numero_sur_carte?: number | string;
  proprietaire?: string;
  couleur: 'Blanc' | 'Rouge' | 'Aligoté' | 'Passetougrain';
  niveau: ClassificationLevel;
  commune: string;
  appellation: string;
  page_livret: number;
  lat: number;
  lng: number;
  notes_terrain?: string;
  consignes_acces?: string;
  google_maps_url: string;
  diapositive?: string;
  carte_annotee?: string;
  pin_x_pct?: number | null;
  pin_y_pct?: number | null;
}

export interface BoundingBox {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
}

export interface ParcelPhoto {
  id: string;
  url: string;
  caption?: string;
  date?: string;
}

export interface ParcelProperties {
  id: string;
  source_cadastre_id?: string;
  code_parcel?: string;
  code_parcelle?: string;
  nom_parcelle?: string;
  nom_climat?: string;
  climat?: string;
  nom_aoc?: string;
  nom_app?: string;
  appellation?: string;
  nom_commune?: string;
  commune?: string;
  contenance_ha?: number;
  surface_ha?: number;
  niveau?: string;
  classification?: ClassificationLevel;
  cepage?: string;
  couleur?: string;
  producteur?: string;
  vigneron?: string;
  proprietaire?: string;
  code_livret?: string;
  numero_livret?: number | string;
  numero_sur_carte?: number | string;
  secteur_livret?: string;
  nb_rangs_details?: string;
  notes_acces?: string;
  page_livret?: number;
  is_vendange_livret?: boolean;
  google_maps_nav_url?: string;
  diapositive?: string;
  carte_annotee?: string;
  pin_x_pct?: number | null;
  pin_y_pct?: number | null;
  notes?: string;
  photo_url?: string;
  carte_photo_url?: string;
  photos?: ParcelPhoto[];
  harvest_status?: HarvestStatus;
  harvest_caisses?: number;
  harvest_hl?: number;
  harvest_kg?: number;
  harvest_date?: string;
  harvest_scheduled_date?: string;
  harvest_scheduled_order?: number;
  is_custom_user_parcel?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  millesime_estime?: string;
  annee_plantation?: number;
  description?: string;
  terroir_notes?: string;
  degre_moyen?: number;
  exposition?: string;
  altitude_m?: number;
  pente_pct?: number;
}

export interface ParcelGeometry {
  type: string;
  coordinates: any;
}

export interface ParcelFeature {
  id?: string;
  type: 'Feature';
  properties: ParcelProperties;
  geometry: ParcelGeometry;
}

export interface MapParcelCollection {
  type: 'FeatureCollection';
  features: ParcelFeature[];
}

export type ParcelFeatureCollection = MapParcelCollection;

export interface NearbyParcel {
  parcel?: ParcelFeature;
  feature?: ParcelFeature;
  distanceMeters: number;
  bearing?: number;
  directionText?: string;
  isInside?: boolean;
}

export interface LocationState {
  status: 'disabled' | 'searching' | 'active' | 'error';
  coords?: { lat: number; lng: number } | null;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number | null;
  errorMsg?: string | null;
  currentParcel?: ParcelFeature | null;
  nearbyParcels?: NearbyParcel[];
}

export interface VineyardRegion {
  name: string;
  subregion: string;
  center: [number, number];
  zoom: number;
  description: string;
}
