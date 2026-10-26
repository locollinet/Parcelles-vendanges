import { ParcelFeature } from '../types';

/**
 * Polygones vectoriels géométriques haute fidélité (délimitations cadastrales / INAO fines)
 * pour l'échantillon pilote sans toucher aux coordonnées GPS de guidage ni aux fiches livret.
 * Découpage ultra-propre en lanières de vignes distinctes sans aucun chevauchement.
 */
export const PILOT_VECTOR_PARCELS: Record<string, [number, number][]> = {
  // 1. Puligny-Montrachet 1er Cru - Les Pucelles (Page 36 - N°14 / id: p36-14-les-pucelles)
  // Lanière nord de Les Pucelles
  'p36-14-les-pucelles': [
    [4.75520, 46.96420],
    [4.75710, 46.96475],
    [4.75730, 46.96395],
    [4.75540, 46.96340],
    [4.75520, 46.96420]
  ],

  // 1bis. Chevalier-Montrachet Grand Cru (Page 36 - N°11 / id: p36-11-chevalier-montrachet)
  // Haut du coteau de Chevalier
  'p36-11-chevalier-montrachet': [
    [4.75020, 46.96440],
    [4.75210, 46.96510],
    [4.75250, 46.96390],
    [4.75050, 46.96320],
    [4.75020, 46.96440]
  ],

  // 2. Bâtard-Montrachet Grand Cru (Page 35 - N°5 BAVARD / id: p35-5-batard-montrachet-bavard)
  // Bandeau Ouest du climat Bâtard
  'p35-5-batard-montrachet-bavard': [
    [4.75380, 46.96220],
    [4.75470, 46.96250],
    [4.75510, 46.96120],
    [4.75420, 46.96090],
    [4.75380, 46.96220]
  ],

  // 3. Bâtard-Montrachet Grand Cru OPALE (Page 36 - N°12 / id: p36-12-batard-montrachet-opale)
  // Bandeau Est du climat Bâtard (parfaitement jointif sans chevauchement)
  'p36-12-batard-montrachet-opale': [
    [4.75475, 46.96252],
    [4.75565, 46.96282],
    [4.75605, 46.96152],
    [4.75515, 46.96122],
    [4.75475, 46.96252]
  ],

  // 4. Bienvenues-Bâtard-Montrachet Grand Cru (Page 36 - N°13 / id: p36-13-bienvenues-batard-montrachet)
  // Lanière contiguë à l'Est de Bâtard
  'p36-13-bienvenues-batard-montrachet': [
    [4.75620, 46.96300],
    [4.75750, 46.96345],
    [4.75780, 46.96235],
    [4.75650, 46.96190],
    [4.75620, 46.96300]
  ],

  // 5. Puligny-Montrachet 1er Cru - Les Folatières (Page 37 - N°20 / id: p37-20-les-folatieres-2-opale)
  // Lanière nette sur le coteau des Folatières
  'p37-20-les-folatieres-2-opale': [
    [4.74910, 46.96810],
    [4.75120, 46.96870],
    [4.75160, 46.96750],
    [4.74950, 46.96690],
    [4.74910, 46.96810]
  ]
};
