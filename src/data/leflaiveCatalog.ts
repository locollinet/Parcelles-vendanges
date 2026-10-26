import { LeflaiveParcelEntry, ParcelFeature } from '../types';
import { LEFLAIVE_DATA_PART_1 } from './leflaiveDataPart1';
import { LEFLAIVE_DATA_PART_2 } from './leflaiveDataPart2';
import { LEFLAIVE_DATA_PART_3 } from './leflaiveDataPart3';
import { PILOT_VECTOR_PARCELS } from './pilotVectorParcels';

export const LEFLAIVE_MASTER_CATALOG: LeflaiveParcelEntry[] = [
  ...LEFLAIVE_DATA_PART_1,
  ...LEFLAIVE_DATA_PART_2,
  ...LEFLAIVE_DATA_PART_3
];

// Helper pour générer un polygone GeoJSON approximé propre et compact autour du point GPS réel
function generateParcelPolygon(lat: number, lng: number): [number, number][] {
  const dLat = 0.00065;
  const dLng = 0.00095;
  return [
    [lng - dLng, lat - dLat],
    [lng + dLng, lat - dLat * 0.7],
    [lng + dLng * 0.9, lat + dLat],
    [lng - dLng * 0.8, lat + dLat * 0.9],
    [lng - dLng, lat - dLat]
  ];
}

// Convertit le catalogue Leflaive en ParcelFeatures compatibles avec la carte Leaflet et le moteur de recherche
export const LEFLAIVE_PARCEL_FEATURES: ParcelFeature[] = LEFLAIVE_MASTER_CATALOG.map((entry) => {
  // Use high-fidelity pilot vector polygon if available for this parcel, otherwise fallback
  const polygonCoords = PILOT_VECTOR_PARCELS[entry.id] || generateParcelPolygon(entry.lat, entry.lng);

  return {
    type: 'Feature',
    id: entry.id,
    geometry: {
      type: 'Polygon',
      coordinates: [polygonCoords]
    },
    properties: {
      id: entry.id,
      code_parcelle: entry.code,
      nom_parcelle: entry.nom_parcelle,
      appellation: entry.appellation,
      climat: entry.nom_parcelle,
      commune: entry.commune,
      niveau: entry.niveau,
      niveau_classification: entry.niveau,
      couleur: entry.couleur === 'Passetougrain' ? 'Rouge' : entry.couleur,
      producteur: entry.proprietaire || '',
      vigneron: entry.proprietaire || '',
      proprietaire: entry.proprietaire || '',
      code_livret: entry.code,
      numero_livret: entry.numero_livret,
      secteur_livret: entry.secteur,
      nb_rangs_details: entry.nb_rangs,
      notes_acces: entry.consignes_acces,
      page_livret: entry.page_livret,
      is_vendange_livret: true,
      google_maps_nav_url: `https://www.google.com/maps/dir/?api=1&destination=${entry.lat.toFixed(6)},${entry.lng.toFixed(6)}&travelmode=driving`,
      diapositive: entry.diapositive,
      carte_annotee: entry.carte_annotee,
      pin_x_pct: entry.pin_x_pct,
      pin_y_pct: entry.pin_y_pct,
      numero_sur_carte: entry.numero_sur_carte || entry.numero_livret,
      notes: `${entry.secteur}${entry.numero_livret ? ` - N°${entry.numero_livret}` : ''} | Code: ${entry.code} | Rangs: ${entry.nb_rangs}${entry.proprietaire ? ` | Apporteur: ${entry.proprietaire}` : ''}`,
      superficie_ha: 0.5,
      millesime_estime: '2024',
      cepage_principal: entry.couleur === 'Blanc' ? 'Chardonnay' : entry.couleur === 'Aligoté' ? 'Aligoté' : 'Pinot Noir',
      cepage: entry.couleur === 'Blanc' ? 'Chardonnay' : entry.couleur === 'Aligoté' ? 'Aligoté' : 'Pinot Noir'
    }
  };
});

export const LEFLAIVE_CATALOG_CODES = new Set<string>(
  LEFLAIVE_MASTER_CATALOG.map((e) => e.code.toUpperCase())
);

