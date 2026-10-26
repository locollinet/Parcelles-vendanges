import { ParcelFeatureCollection, VineyardRegion } from '../types';

export const BURGUNDY_REGIONS: VineyardRegion[] = [
  {
    name: 'Côte de Beaune (Sud)',
    subregion: 'Puligny, Chassagne, Meursault, Santenay & Maranges',
    center: [46.9635, 4.7540], // Puligny-Montrachet
    zoom: 15,
    description: 'Le Montrachet, Bâtard, Criots, Meursault Perrières, Santenay Gravières, Maranges'
  },
  {
    name: 'Côte de Beaune (Centre & Auxey)',
    subregion: 'Auxey-Duresses, Monthélie, Saint-Romain, Pommard, Volnay',
    center: [46.9880, 4.7450], // Auxey-Duresses / Monthélie
    zoom: 15,
    description: 'Auxey-Duresses Les Duresses, Monthélie Champs Fulliot, Saint-Romain, Pommard Rugiens, Volnay'
  },
  {
    name: 'Côte de Beaune (Nord & Corton)',
    subregion: 'Beaune, Savigny, Chorey, Aloxe-Corton, Ladoix, Pernand',
    center: [47.0450, 4.8500], // Aloxe-Corton / Beaune
    zoom: 15,
    description: 'Corton-Charlemagne, Corton Bressandes, Beaune Clos des Mouches, Savigny, Ladoix'
  },
  {
    name: 'Plaine de Beaune & IGP',
    subregion: 'IGP Sainte-Marie-la-Blanche & Coteaux Bourguignons',
    center: [46.9750, 4.9150], // Sainte-Marie-la-Blanche
    zoom: 14,
    description: 'IGP Sainte-Marie-la-Blanche, IGP Coteaux Bourguignons, Terroirs du Val de Saône'
  },
  {
    name: 'Côte de Nuits (Bourgogne)',
    subregion: 'Grands Crus & Premiers Crus de Nuits',
    center: [47.1610, 4.9520], // Vosne-Romanée
    zoom: 15,
    description: 'Vosne-Romanée, Gevrey-Chambertin, Chambolle-Musigny, Vougeot, Nuits-Saint-Georges'
  },
  {
    name: 'Chablis (Bourgogne)',
    subregion: 'Chablis Grand Cru & Premier Cru',
    center: [47.8150, 3.8010],
    zoom: 14,
    description: 'Les Clos, Vaudésir, Valmur, Grenouilles, Blanchot, Preuses, Bougros'
  },
  {
    name: 'Pauillac & Médoc (Bordeaux)',
    subregion: 'Grands Crus Classés 1855',
    center: [45.1980, -0.7480],
    zoom: 14,
    description: 'Château Lafite Rothschild, Château Latour, Château Mouton Rothschild, Margaux'
  },
  {
    name: 'Saint-Émilion & Pomerol (Bordeaux)',
    subregion: 'Grands Crus Classés & Pomerol',
    center: [44.8935, -0.1550],
    zoom: 14,
    description: 'Château Cheval Blanc, Château Ausone, Petrus, Château Pavie'
  },
  {
    name: 'Champagne, Rhône & Alsace',
    subregion: 'Grands Crus de Champagne, Rhône & Alsace',
    center: [49.0300, 4.0200],
    zoom: 14,
    description: 'Hermitage, Côte-Rôtie, Champagne Grand Cru, Alsace Schlossberg'
  }
];

// Rich GeoJSON dataset of official Climats, Lieux-Dits & Parcels of Côte de Beaune, Côte de Nuits & Chablis
export const BURGUNDY_PARCELS_GEOJSON: ParcelFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    // ==========================================
    // CÔTE DE BEAUNE - POMMARD
    // ==========================================
    {
      type: 'Feature',
      id: 'POM-RUG-01',
      properties: {
        id: 'POM-RUG-01',
        code_parcel: 'POM-001-RUG',
        nom_app: 'Pommard Premier Cru',
        climat: 'Les Rugiens (Hauts & Bas)',
        niveau: '1er Cru',
        commune: 'Pommard',
        vigneron: 'Domaine de Courcel / Domaine Gaunoux',
        surface_ha: 12.66,
        annee_plantation: 1958,
        cepage: 'Pinot Noir',
        notes: 'Climat mythique de Pommard. Sols ferrugineux rouges très riches en oxyde de fer, produisant des vins intenses, tanniques et de garde exceptionnelle.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.7935, 47.0090],
          [4.7965, 47.0105],
          [4.7972, 47.0085],
          [4.7942, 47.0075],
          [4.7935, 47.0090]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'POM-EPE-01',
      properties: {
        id: 'POM-EPE-01',
        code_parcel: 'POM-002-GEP',
        nom_app: 'Pommard Premier Cru',
        climat: 'Les Grands Épenots',
        niveau: '1er Cru',
        commune: 'Pommard',
        vigneron: 'Domaine de Courcel / Domaine Parent',
        surface_ha: 10.15,
        annee_plantation: 1964,
        cepage: 'Pinot Noir',
        notes: 'Situé à la frontière avec Beaune. Sols argilo-calcaires profonds apportant rondeur, velouté et puissance aromatique.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8010, 47.0130],
          [4.8035, 47.0138],
          [4.8040, 47.0120],
          [4.8015, 47.0112],
          [4.8010, 47.0130]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'POM-PEP-01',
      properties: {
        id: 'POM-PEP-01',
        code_parcel: 'POM-003-PEP',
        nom_app: 'Pommard Premier Cru',
        climat: 'Les Petits Épenots',
        niveau: '1er Cru',
        commune: 'Pommard',
        vigneron: 'Domaine Michel Gaunoux',
        surface_ha: 15.14,
        cepage: 'Pinot Noir',
        notes: 'Contigu aux Grands Épenots. Sol calcaire filtrant offrant plus d’élégance et de finesse de grain.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8038, 47.0140],
          [4.8062, 47.0150],
          [4.8068, 47.0132],
          [4.8044, 47.0125],
          [4.8038, 47.0140]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'POM-PEZ-01',
      properties: {
        id: 'POM-PEZ-01',
        code_parcel: 'POM-004-PEZ',
        nom_app: 'Pommard Premier Cru',
        climat: 'Les Pezerolles',
        niveau: '1er Cru',
        commune: 'Pommard',
        vigneron: 'Domaine de Montille',
        surface_ha: 5.92,
        cepage: 'Pinot Noir',
        notes: 'Lieu-dit très réputé du haut du coteau de Pommard, caractérisé par une minéralité calcaire et des notes d’épices douces.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.7970, 47.0155],
          [4.7995, 47.0162],
          [4.8000, 47.0148],
          [4.7975, 47.0142],
          [4.7970, 47.0155]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'POM-JAR-01',
      properties: {
        id: 'POM-JAR-01',
        code_parcel: 'POM-005-JAR',
        nom_app: 'Pommard Premier Cru',
        climat: 'Les Jarollières',
        niveau: '1er Cru',
        commune: 'Pommard',
        vigneron: 'Domaine Laousse / Pousse d’Or',
        surface_ha: 3.17,
        cepage: 'Pinot Noir',
        notes: 'Contigu au climat Les Santenots de Volnay. Allie la structure de Pommard à la délicatesse de Volnay.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.7915, 47.0062],
          [4.7940, 47.0070],
          [4.7945, 47.0055],
          [4.7920, 47.0048],
          [4.7915, 47.0062]
        ]]
      }
    },

    // ==========================================
    // CÔTE DE BEAUNE - VOLNAY
    // ==========================================
    {
      type: 'Feature',
      id: 'VOL-SAN-01',
      properties: {
        id: 'VOL-SAN-01',
        code_parcel: 'VOL-001-SAN',
        nom_app: 'Volnay Premier Cru',
        climat: 'Les Santenots du Milieu',
        niveau: '1er Cru',
        commune: 'Volnay',
        vigneron: 'Domaine des Comtes Lafon / Domaine Marquis d’Angerville',
        surface_ha: 7.80,
        annee_plantation: 1961,
        cepage: 'Pinot Noir',
        notes: 'Le fleuron des Pinot Noirs de Volnay (cadastré sur Meursault). Sols de calcaire bajocien rouge et fin.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.7860, 46.9960],
          [4.7885, 46.9968],
          [4.7890, 46.9950],
          [4.7865, 46.9942],
          [4.7860, 46.9960]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'VOL-CAI-01',
      properties: {
        id: 'VOL-CAI-01',
        code_parcel: 'VOL-002-CAI',
        nom_app: 'Volnay Premier Cru',
        climat: 'Les Caillerets (En Caillerets)',
        niveau: '1er Cru',
        commune: 'Volnay',
        vigneron: 'Domaine Marquis d’Angerville / La Pousse d’Or',
        surface_ha: 14.32,
        cepage: 'Pinot Noir',
        notes: 'Considéré comme le plus grand climat de Volnay. Terroir extrêmement caillouteux apportant tension et noblesse aromatique.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.7800, 46.9930],
          [4.7825, 46.9938],
          [4.7830, 46.9920],
          [4.7805, 46.9912],
          [4.7800, 46.9930]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'VOL-CHA-01',
      properties: {
        id: 'VOL-CHA-01',
        code_parcel: 'VOL-003-CHA',
        nom_app: 'Volnay Premier Cru',
        climat: 'Les Champans',
        niveau: '1er Cru',
        commune: 'Volnay',
        vigneron: 'Domaine Marquis d’Angerville',
        surface_ha: 11.20,
        cepage: 'Pinot Noir',
        notes: 'Pente douce exposée sud-est. Sols de marne calcaire. Vin d’une grande plénitude et silky texture.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.7830, 46.9945],
          [4.7855, 46.9952],
          [4.7860, 46.9935],
          [4.7835, 46.9928],
          [4.7830, 46.9945]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'VOL-TAI-01',
      properties: {
        id: 'VOL-TAI-01',
        code_parcel: 'VOL-004-TAI',
        nom_app: 'Volnay Premier Cru',
        climat: 'Les Taillepieds',
        niveau: '1er Cru',
        commune: 'Volnay',
        vigneron: 'Domaine de Montille / Domaine Marquis d’Angerville',
        surface_ha: 7.13,
        cepage: 'Pinot Noir',
        notes: 'Pente raide en haut de coteau. Pierres calcaires tranchantes ("taille-pieds"). Pureté et fraîcheur cristalline.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.7810, 46.9955],
          [4.7830, 46.9962],
          [4.7835, 46.9948],
          [4.7815, 46.9941],
          [4.7810, 46.9955]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'VOL-DUC-01',
      properties: {
        id: 'VOL-DUC-01',
        code_parcel: 'VOL-005-DUC',
        nom_app: 'Volnay Premier Cru',
        climat: 'Le Clos des Ducs (Monopole)',
        niveau: '1er Cru',
        commune: 'Volnay',
        vigneron: 'Domaine Marquis d’Angerville',
        surface_ha: 2.15,
        cepage: 'Pinot Noir',
        notes: 'Monopole légendaire du Domaine Marquis d’Angerville, ceint de murs au-dessus du village de Volnay.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.7780, 46.9970],
          [4.7800, 46.9976],
          [4.7805, 46.9962],
          [4.7785, 46.9956],
          [4.7780, 46.9970]
        ]]
      }
    },

    // ==========================================
    // CÔTE DE BEAUNE - MEURSAULT
    // ==========================================
    {
      type: 'Feature',
      id: 'MEU-PER-01',
      properties: {
        id: 'MEU-PER-01',
        code_parcel: 'MEU-001-PER',
        nom_app: 'Meursault Premier Cru',
        climat: 'Les Perrières (Dessous & Dessus)',
        niveau: '1er Cru',
        commune: 'Meursault',
        vigneron: 'Domaine Coche-Dury / Domaine Roulot / Comtes Lafon',
        surface_ha: 13.50,
        annee_plantation: 1955,
        cepage: 'Chardonnay',
        notes: 'Anciennes carrières de calcaire blanc. Considéré comme l’équivalent incontesté d’un Grand Cru en Meursault.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.7660, 46.9720],
          [4.7688, 46.9728],
          [4.7692, 46.9712],
          [4.7665, 46.9705],
          [4.7660, 46.9720]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'MEU-CHA-01',
      properties: {
        id: 'MEU-CHA-01',
        code_parcel: 'MEU-002-CHA',
        nom_app: 'Meursault Premier Cru',
        climat: 'Les Charmes (Dessus & Dessous)',
        niveau: '1er Cru',
        commune: 'Meursault',
        vigneron: 'Domaine des Comtes Lafon / Domaine Roulot',
        surface_ha: 31.12,
        cepage: 'Chardonnay',
        notes: 'Climat emblématique de Meursault exposant plein est. Vins opulents, briochés, généreux et d’un immense équilibre.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.7680, 46.9750],
          [4.7710, 46.9758],
          [4.7715, 46.9740],
          [4.7685, 46.9732],
          [4.7680, 46.9750]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'MEU-GEN-01',
      properties: {
        id: 'MEU-GEN-01',
        code_parcel: 'MEU-003-GEN',
        nom_app: 'Meursault Premier Cru',
        climat: 'Les Genevrières',
        niveau: '1er Cru',
        commune: 'Meursault',
        vigneron: 'Domaine Coche-Dury / Domaine Rémi Jobard',
        surface_ha: 16.48,
        cepage: 'Chardonnay',
        notes: 'Anciennement couvert de genévriers. Sols marno-calcaires rougeâtres procurant des arômes d’agrumes et d’épices fines.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.7645, 46.9735],
          [4.7670, 46.9742],
          [4.7675, 46.9728],
          [4.7650, 46.9721],
          [4.7645, 46.9735]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'MEU-GOR-01',
      properties: {
        id: 'MEU-GOR-01',
        code_parcel: 'MEU-004-GOR',
        nom_app: 'Meursault Premier Cru',
        climat: 'Goutte d’Or',
        niveau: '1er Cru',
        commune: 'Meursault',
        vigneron: 'Domaine Arnaud Ente / Domaine Buisson-Charles',
        surface_ha: 5.43,
        cepage: 'Chardonnay',
        notes: 'Climat situé juste au-dessus du village. Sols caillouteux et argileux donnant des vins d’une couleur dorée étincelante.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.7685, 46.9805],
          [4.7708, 46.9812],
          [4.7712, 46.9798],
          [4.7690, 46.9791],
          [4.7685, 46.9805]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'MEU-POR-01',
      properties: {
        id: 'MEU-POR-01',
        code_parcel: 'MEU-005-POR',
        nom_app: 'Meursault Premier Cru',
        climat: 'Les Poruzots (Porusot)',
        niveau: '1er Cru',
        commune: 'Meursault',
        vigneron: 'Domaine François Mikulski / Jobard',
        surface_ha: 11.42,
        cepage: 'Chardonnay',
        notes: 'Situé au cœur du coteau de Meursault. Sols rocailleux drainants donnant des blancs très structurés.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.7655, 46.9765],
          [4.7680, 46.9772],
          [4.7685, 46.9758],
          [4.7660, 46.9751],
          [4.7655, 46.9765]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'MEU-NAR-01',
      properties: {
        id: 'MEU-NAR-01',
        code_parcel: 'MEU-006-NAR',
        nom_app: 'Meursault',
        climat: 'Les Narvaux (Dessus & Dessous)',
        niveau: 'Village',
        commune: 'Meursault',
        vigneron: 'Domaine d’Auvenay (Lalou Bize-Leroy) / Coche-Dury',
        surface_ha: 14.10,
        cepage: 'Chardonnay',
        notes: 'Superbe lieu-dit Village d’altitude surplombant Les Genevrières. Tension saline exceptionnelle.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.7620, 46.9740],
          [4.7642, 46.9748],
          [4.7646, 46.9734],
          [4.7624, 46.9726],
          [4.7620, 46.9740]
        ]]
      }
    },

    // ==========================================
    // CÔTE DE BEAUNE - PULIGNY-MONTRACHET
    // ==========================================
    {
      type: 'Feature',
      id: 'MON-001',
      properties: {
        id: 'MON-001',
        code_parcel: 'PUL-001-MON',
        nom_app: 'Montrachet',
        climat: 'Le Montrachet',
        niveau: 'Grand Cru',
        commune: 'Puligny-Montrachet',
        vigneron: 'Domaine de la Romanée-Conti / Domaine Leflaive / Ramonet',
        surface_ha: 7.99,
        annee_plantation: 1950,
        cepage: 'Chardonnay',
        notes: 'Le Montrachet : sommet absolu des grands vins blancs de la planète. Coteau de calcaire jurassique parfait.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.7522, 46.9632],
          [4.7542, 46.9639],
          [4.7546, 46.9625],
          [4.7526, 46.9618],
          [4.7522, 46.9632]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'BAT-001',
      properties: {
        id: 'BAT-001',
        code_parcel: 'PUL-002-BAT',
        nom_app: 'Bâtard-Montrachet',
        climat: 'Bâtard-Montrachet',
        niveau: 'Grand Cru',
        commune: 'Puligny-Montrachet',
        vigneron: 'Domaine Leflaive / Pierre-Yves Colin-Morey',
        surface_ha: 11.24,
        cepage: 'Chardonnay',
        notes: 'Grand Cru contigu au Montrachet. Sols plus profonds procurant une puissance et un gras inimitables.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.7535, 46.9620],
          [4.7555, 46.9627],
          [4.7560, 46.9612],
          [4.7540, 46.9605],
          [4.7535, 46.9620]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'CHE-001',
      properties: {
        id: 'CHE-001',
        code_parcel: 'PUL-003-CHE',
        nom_app: 'Chevalier-Montrachet',
        climat: 'Chevalier-Montrachet',
        niveau: 'Grand Cru',
        commune: 'Puligny-Montrachet',
        vigneron: 'Domaine Leflaive / Domaine Bouchard Père & Fils',
        surface_ha: 7.30,
        cepage: 'Chardonnay',
        notes: 'Surplombe directement Le Montrachet. Sols très minces sur roche calcaire pure. Vin cristallin et aérien.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.7500, 46.9645],
          [4.7522, 46.9652],
          [4.7526, 46.9638],
          [4.7504, 46.9631],
          [4.7500, 46.9645]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'PUC-001',
      properties: {
        id: 'PUC-001',
        code_parcel: 'PUL-004-PUC',
        nom_app: 'Puligny-Montrachet Premier Cru',
        climat: 'Les Pucelles',
        niveau: '1er Cru',
        commune: 'Puligny-Montrachet',
        vigneron: 'Domaine Leflaive / Domaine Boillot',
        surface_ha: 6.76,
        cepage: 'Chardonnay',
        notes: 'Climat d’une élégance mythique adossé au Bâtard-Montrachet. Notes de chèvrefeuille, noisette fraîche et aubépine.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.7550, 46.9642],
          [4.7572, 46.9649],
          [4.7576, 46.9635],
          [4.7554, 46.9628],
          [4.7550, 46.9642]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'FOL-001',
      properties: {
        id: 'FOL-001',
        code_parcel: 'PUL-005-FOL',
        nom_app: 'Puligny-Montrachet Premier Cru',
        climat: 'Les Folatières (Ez Folatières & Clos de la Garenne)',
        niveau: '1er Cru',
        commune: 'Puligny-Montrachet',
        vigneron: 'Domaine Leflaive / Etienne Sauzet',
        surface_ha: 17.65,
        cepage: 'Chardonnay',
        notes: 'Le plus grand Premier Cru en superficie de Puligny, étagé à mi-coteau. Équilibre parfait entre minéralité et fruit.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.7490, 46.9680],
          [4.7518, 46.9688],
          [4.7522, 46.9672],
          [4.7494, 46.9664],
          [4.7490, 46.9680]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'COM-001',
      properties: {
        id: 'COM-001',
        code_parcel: 'PUL-006-COM',
        nom_app: 'Puligny-Montrachet Premier Cru',
        climat: 'Les Combettes',
        niveau: '1er Cru',
        commune: 'Puligny-Montrachet',
        vigneron: 'Domaine Etienne Sauzet / Domaine Leflaive',
        surface_ha: 6.76,
        cepage: 'Chardonnay',
        notes: 'Jouxtant Meursault Charmes. Apporte la rondeur de Meursault alliée à la droiture pierreuse de Puligny.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.7535, 46.9700],
          [4.7560, 46.9708],
          [4.7565, 46.9692],
          [4.7540, 46.9684],
          [4.7535, 46.9700]
        ]]
      }
    },

    // ==========================================
    // CÔTE DE BEAUNE - CHASSAGNE-MONTRACHET
    // ==========================================
    {
      type: 'Feature',
      id: 'CHA-MOR-01',
      properties: {
        id: 'CHA-MOR-01',
        code_parcel: 'CHA-001-MOR',
        nom_app: 'Chassagne-Montrachet Premier Cru',
        climat: 'Morgeot (Abbaye de Morgeot & Clos Pitois)',
        niveau: '1er Cru',
        commune: 'Chassagne-Montrachet',
        vigneron: 'Domaine Ramonet / Domaine Bernard Moreau',
        surface_ha: 58.00,
        cepage: 'Chardonnay & Pinot Noir',
        notes: 'Ancien domaine des moines de l’Abbaye de Morgeot. Vins puissants, amples, riches en extraits secs.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.7490, 46.9320],
          [4.7525, 46.9328],
          [4.7530, 46.9310],
          [4.7495, 46.9302],
          [4.7490, 46.9320]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'CHA-VER-01',
      properties: {
        id: 'CHA-VER-01',
        code_parcel: 'CHA-002-VER',
        nom_app: 'Chassagne-Montrachet Premier Cru',
        climat: 'Les Vergers',
        niveau: '1er Cru',
        commune: 'Chassagne-Montrachet',
        vigneron: 'Domaine Ramonet / Domaine Niellon',
        surface_ha: 9.40,
        cepage: 'Chardonnay',
        notes: 'Situé au nord du village en direction de Puligny. Terroir calcaire frais donnant des blancs très ciselés.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.7475, 46.9425],
          [4.7500, 46.9432],
          [4.7505, 46.9418],
          [4.7480, 46.9410],
          [4.7475, 46.9425]
        ]]
      }
    },

    // ==========================================
    // CÔTE DE BEAUNE - BEAUNE
    // ==========================================
    {
      type: 'Feature',
      id: 'BEA-MOU-01',
      properties: {
        id: 'BEA-MOU-01',
        code_parcel: 'BEA-001-MOU',
        nom_app: 'Beaune Premier Cru',
        climat: 'Clos des Mouches',
        niveau: '1er Cru',
        commune: 'Beaune',
        vigneron: 'Maison Joseph Drouhin / Chanson',
        surface_ha: 25.18,
        cepage: 'Chardonnay (50%) & Pinot Noir (50%)',
        notes: 'Climat d’exception ("mouches" désignait les abeilles). Produit l’un des plus célèbres Beaune Blancs et Rouges.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8260, 47.0175],
          [4.8290, 47.0182],
          [4.8295, 47.0165],
          [4.8265, 47.0158],
          [4.8260, 47.0175]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'BEA-GRE-01',
      properties: {
        id: 'BEA-GRE-01',
        code_parcel: 'BEA-002-GRE',
        nom_app: 'Beaune Premier Cru',
        climat: 'Les Grèves (Vigne de l’Enfant Jésus)',
        niveau: '1er Cru',
        commune: 'Beaune',
        vigneron: 'Domaine Bouchard Père & Fils / Louis Jadot',
        surface_ha: 31.33,
        cepage: 'Pinot Noir',
        notes: 'Cœur historique du vignoble de Beaune. Sols de grès calcaire profonds. Équilibre parfait.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8265, 47.0340],
          [4.8295, 47.0348],
          [4.8300, 47.0330],
          [4.8270, 47.0322],
          [4.8265, 47.0340]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'BEA-BRE-01',
      properties: {
        id: 'BEA-BRE-01',
        code_parcel: 'BEA-003-BRE',
        nom_app: 'Beaune Premier Cru',
        climat: 'Les Bressandes',
        niveau: '1er Cru',
        commune: 'Beaune',
        vigneron: 'Domaine Albert Morot / Chanson',
        surface_ha: 17.38,
        cepage: 'Pinot Noir',
        notes: 'Haut de coteau très ensoleillé. Vin puissant, généreux et aux arômes de fruits noirs sauvages.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8295, 47.0380],
          [4.8322, 47.0388],
          [4.8326, 47.0372],
          [4.8300, 47.0365],
          [4.8295, 47.0380]
        ]]
      }
    },

    // ==========================================
    // CÔTE DE BEAUNE - ALOXE-CORTON / PERNAND / LADOIX
    // ==========================================
    {
      type: 'Feature',
      id: 'COR-CHA-01',
      properties: {
        id: 'COR-CHA-01',
        code_parcel: 'ALO-001-CHA',
        nom_app: 'Corton-Charlemagne',
        climat: 'Le Charlemagne & En Charlemagne',
        niveau: 'Grand Cru',
        commune: 'Aloxe-Corton',
        vigneron: 'Domaine Bonneau du Martray / Coche-Dury / Bouchard',
        surface_ha: 52.00,
        annee_plantation: 1952,
        cepage: 'Chardonnay',
        notes: 'Grand Cru légendaire offert par l’Empereur Charlemagne aux moines de Saulieu. Exposition sud-ouest radieuse.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8550, 47.0650],
          [4.8580, 47.0658],
          [4.8585, 47.0640],
          [4.8555, 47.0632],
          [4.8550, 47.0650]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'COR-ROU-01',
      properties: {
        id: 'COR-ROU-01',
        code_parcel: 'ALO-002-COR',
        nom_app: 'Corton Grand Cru',
        climat: 'Le Corton / Clos du Roi / Les Renardes',
        niveau: 'Grand Cru',
        commune: 'Aloxe-Corton',
        vigneron: 'Domaine de la Romanée-Conti / Domaine Tollot-Beaut',
        surface_ha: 95.00,
        cepage: 'Pinot Noir',
        notes: 'Seul Grand Cru rouge de la Côte de Beaune. Vins monumentaux d’une garde centenaire.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8600, 47.0610],
          [4.8635, 47.0618],
          [4.8640, 47.0598],
          [4.8605, 47.0590],
          [4.8600, 47.0610]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'PER-ILE-01',
      properties: {
        id: 'PER-ILE-01',
        code_parcel: 'PER-001-ILE',
        nom_app: 'Pernand-Vergelesses Premier Cru',
        climat: 'Île des Vergelesses',
        niveau: '1er Cru',
        commune: 'Pernand-Vergelesses',
        vigneron: 'Domaine Chandon de Briailles',
        surface_ha: 9.41,
        cepage: 'Pinot Noir & Chardonnay',
        notes: 'Le joyau de Pernand-Vergelesses. Coteau orienté est avec sols argilo-calcaires profonds.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8510, 47.0810],
          [4.8540, 47.0818],
          [4.8545, 47.0800],
          [4.8515, 47.0792],
          [4.8510, 47.0810]
        ]]
      }
    },

    // ==========================================
    // CÔTE DE BEAUNE - SAVIGNY-LÈS-BEAUNE
    // ==========================================
    {
      type: 'Feature',
      id: 'SAV-LAV-01',
      properties: {
        id: 'SAV-LAV-01',
        code_parcel: 'SAV-001-LAV',
        nom_app: 'Savigny-lès-Beaune Premier Cru',
        climat: 'Les Lavières',
        niveau: '1er Cru',
        commune: 'Savigny-lès-Beaune',
        vigneron: 'Domaine Tollot-Beaut / Domaine Chandon de Briailles',
        surface_ha: 17.66,
        cepage: 'Pinot Noir',
        notes: 'Sols composés de dalles calcaires ("laves"). Produit des vins souples, parfumés et élégants.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8230, 47.0620],
          [4.8260, 47.0628],
          [4.8265, 47.0610],
          [4.8235, 47.0602],
          [4.8230, 47.0620]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'SAV-DOM-01',
      properties: {
        id: 'SAV-DOM-01',
        code_parcel: 'SAV-002-DOM',
        nom_app: 'Savigny-lès-Beaune Premier Cru',
        climat: 'Aux Clous / La Dominode',
        niveau: '1er Cru',
        commune: 'Savigny-lès-Beaune',
        vigneron: 'Domaine Pavelot',
        surface_ha: 18.50,
        cepage: 'Pinot Noir',
        notes: 'Climat emblématique de Savigny. Sols graveleux sablonneux apportant structure et richesse.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8330, 47.0560],
          [4.8360, 47.0568],
          [4.8365, 47.0550],
          [4.8335, 47.0542],
          [4.8330, 47.0560]
        ]]
      }
    },

    // ==========================================
    // CÔTE DE BEAUNE - SAINT-AUBIN
    // ==========================================
    {
      type: 'Feature',
      id: 'STA-REM-01',
      properties: {
        id: 'STA-REM-01',
        code_parcel: 'STA-001-REM',
        nom_app: 'Saint-Aubin Premier Cru',
        climat: 'En Remilly',
        niveau: '1er Cru',
        commune: 'Saint-Aubin',
        vigneron: 'Domaine Hubert Lamy / Pierre-Yves Colin-Morey',
        surface_ha: 29.80,
        cepage: 'Chardonnay',
        notes: 'Situé sur l’envers du coteau du Montrachet. Terroir calcaire aride d’une fraîcheur remarquable.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.7360, 46.9550],
          [4.7390, 46.9558],
          [4.7395, 46.9540],
          [4.7365, 46.9532],
          [4.7360, 46.9550]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'STA-MUR-01',
      properties: {
        id: 'STA-MUR-01',
        code_parcel: 'STA-002-MUR',
        nom_app: 'Saint-Aubin Premier Cru',
        climat: 'Les Murgers des Dents de Chien',
        niveau: '1er Cru',
        commune: 'Saint-Aubin',
        vigneron: 'Domaine Hubert Lamy',
        surface_ha: 15.20,
        cepage: 'Chardonnay',
        notes: 'Coteau caillouteux abrupte bordant le Chevalier-Montrachet. Mineralité affûtée comme une dent de chien.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.7395, 46.9565],
          [4.7420, 46.9572],
          [4.7425, 46.9558],
          [4.7400, 46.9550],
          [4.7395, 46.9565]
        ]]
      }
    },

    // ==========================================
    // CÔTE DE BEAUNE - SANTENAY
    // ==========================================
    {
      type: 'Feature',
      id: 'SAN-GRA-01',
      properties: {
        id: 'SAN-GRA-01',
        code_parcel: 'SAN-001-GRA',
        nom_app: 'Santenay Premier Cru',
        climat: 'Les Gravières',
        niveau: '1er Cru',
        commune: 'Santenay',
        vigneron: 'Domaine Hubert Lamy / Roger Belland',
        surface_ha: 29.30,
        cepage: 'Pinot Noir & Chardonnay',
        notes: 'Le Premier Cru le plus renommé de Santenay. Alluvions oolithiques apportant vivacité et fruité épicé.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.7060, 46.9180],
          [4.7090, 46.9188],
          [4.7095, 46.9170],
          [4.7065, 46.9162],
          [4.7060, 46.9180]
        ]]
      }
    },

    // ==========================================
    // CÔTE DE NUITS - VOSNE-ROMANÉE
    // ==========================================
    {
      type: 'Feature',
      id: 'RC-001',
      properties: {
        id: 'RC-001',
        code_parcel: '000-A-012',
        nom_app: 'Romanée-Conti',
        climat: 'La Romanée-Conti (Monopole)',
        niveau: 'Grand Cru',
        commune: 'Vosne-Romanée',
        vigneron: 'Domaine de la Romanée-Conti (DRC)',
        surface_ha: 1.81,
        annee_plantation: 1947,
        cepage: 'Pinot Noir',
        notes: 'Monopole légendaire de 1,81 hectare. Sol d’éboulis calcaire du Bathonien supérieur.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.9512, 47.1612],
          [4.9525, 47.1616],
          [4.9528, 47.1607],
          [4.9515, 47.1603],
          [4.9512, 47.1612]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'LT-002',
      properties: {
        id: 'LT-002',
        code_parcel: '000-A-018',
        nom_app: 'La Tâche',
        climat: 'La Tâche (Monopole)',
        niveau: 'Grand Cru',
        commune: 'Vosne-Romanée',
        vigneron: 'Domaine de la Romanée-Conti',
        surface_ha: 6.06,
        annee_plantation: 1952,
        cepage: 'Pinot Noir',
        notes: 'Monopole de La Tâche Grand Cru. Orienté plein est.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.9505, 47.1595],
          [4.9522, 47.1599],
          [4.9526, 47.1588],
          [4.9509, 47.1584],
          [4.9505, 47.1595]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'RIC-003',
      properties: {
        id: 'RIC-003',
        code_parcel: '000-B-004',
        nom_app: 'Richebourg',
        climat: 'Les Richebourgs',
        niveau: 'Grand Cru',
        commune: 'Vosne-Romanée',
        vigneron: 'Domaine Leroy / DRC',
        surface_ha: 8.03,
        annee_plantation: 1960,
        cepage: 'Pinot Noir',
        notes: 'Grand Cru adjacent à la Romanée-Conti.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.9515, 47.1622],
          [4.9532, 47.1627],
          [4.9535, 47.1617],
          [4.9518, 47.1613],
          [4.9515, 47.1622]
        ]]
      }
    },

    // ==========================================
    // CÔTE DE NUITS - GEVREY-CHAMBERTIN
    // ==========================================
    {
      type: 'Feature',
      id: 'CHA-001',
      properties: {
        id: 'CHA-001',
        code_parcel: '000-G-001',
        nom_app: 'Chambertin',
        climat: 'Le Chambertin',
        niveau: 'Grand Cru',
        commune: 'Gevrey-Chambertin',
        vigneron: 'Domaine Armand Rousseau',
        surface_ha: 12.90,
        annee_plantation: 1962,
        cepage: 'Pinot Noir',
        notes: 'Le Roi des Vins. Vignoble très homogène orienté est.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.9610, 47.2085],
          [4.9632, 47.2090],
          [4.9636, 47.2078],
          [4.9614, 47.2072],
          [4.9610, 47.2085]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'CSJ-002',
      properties: {
        id: 'CSJ-002',
        code_parcel: '000-G-012',
        nom_app: 'Gevrey-Chambertin Premier Cru',
        climat: 'Clos Saint-Jacques',
        niveau: '1er Cru',
        commune: 'Gevrey-Chambertin',
        vigneron: 'Domaine Fourrier / Rousseau',
        surface_ha: 6.70,
        cepage: 'Pinot Noir',
        notes: 'Considéré comme un équivalent de Grand Cru. Sol calcaire blanc.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.9570, 47.2110],
          [4.9590, 47.2115],
          [4.9594, 47.2102],
          [4.9574, 47.2098],
          [4.9570, 47.2110]
        ]]
      }
    },

    // ==========================================
    // CÔTE DE NUITS - CHAMBOLLE-MUSIGNY
    // ==========================================
    {
      type: 'Feature',
      id: 'MUS-001',
      properties: {
        id: 'MUS-001',
        code_parcel: '000-CM-001',
        nom_app: 'Musigny',
        climat: 'Le Musigny',
        niveau: 'Grand Cru',
        commune: 'Chambolle-Musigny',
        vigneron: 'Domaine Comte Georges de Vogüé',
        surface_ha: 10.85,
        cepage: 'Pinot Noir / Chardonnay (0.6ha)',
        notes: 'L’un des rares Grands Crus pouvant produire du vin blanc en Côte de Nuits.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.9560, 47.1770],
          [4.9580, 47.1776],
          [4.9584, 47.1762],
          [4.9564, 47.1758],
          [4.9560, 47.1770]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'AMO-001',
      properties: {
        id: 'AMO-001',
        code_parcel: '000-CM-002',
        nom_app: 'Chambolle-Musigny Premier Cru',
        climat: 'Les Amoureuses',
        niveau: '1er Cru',
        commune: 'Chambolle-Musigny',
        vigneron: 'Domaine Georges Roumier / Mugnier',
        surface_ha: 5.40,
        cepage: 'Pinot Noir',
        notes: 'Le Premier Cru le plus sensuel et recherché de Bourgogne. Soie et dentelle aromatique.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.9540, 47.1750],
          [4.9562, 47.1758],
          [4.9566, 47.1742],
          [4.9544, 47.1735],
          [4.9540, 47.1750]
        ]]
      }
    },

    // ==========================================
    // CHABLIS
    // ==========================================
    {
      type: 'Feature',
      id: 'CHA-CLOS-01',
      properties: {
        id: 'CHA-CLOS-01',
        code_parcel: '000-CHB-01',
        nom_app: 'Chablis Grand Cru',
        climat: 'Les Clos',
        niveau: 'Grand Cru',
        commune: 'Chablis',
        vigneron: 'Domaine François Raveneau / Dauvissat',
        surface_ha: 25.86,
        cepage: 'Chardonnay',
        notes: 'Sol Kimmeridgien pur à exogyra virgula. Le roi incontesté de Chablis.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [3.8010, 47.8155],
          [3.8035, 47.8162],
          [3.8040, 47.8148],
          [3.8015, 47.8142],
          [3.8010, 47.8155]
        ]]
      }
    },

    // ==========================================
    // CÔTE DE BEAUNE - AUXEY-DURESSES
    // ==========================================
    {
      type: 'Feature',
      id: 'AUX-DUR-01',
      properties: {
        id: 'AUX-DUR-01',
        code_parcel: 'AUX-001-DUR',
        nom_app: 'Auxey-Duresses Premier Cru',
        climat: 'Les Duresses',
        niveau: '1er Cru',
        commune: 'Auxey-Duresses',
        vigneron: 'Domaine d’Auvenay / Maison Benjamin Leroux',
        surface_ha: 9.30,
        cepage: 'Pinot Noir',
        notes: 'Coteaux exposés sud/sud-est faisant face à Meursault. Sols argilo-calcaires pierreux produisant des rouges d’une grande tension minérale.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.7480, 46.9890],
          [4.7505, 46.9898],
          [4.7512, 46.9882],
          [4.7485, 46.9875],
          [4.7480, 46.9890]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'AUX-VAL-01',
      properties: {
        id: 'AUX-VAL-01',
        code_parcel: 'AUX-002-VAL',
        nom_app: 'Auxey-Duresses Premier Cru',
        climat: 'Climat Val',
        niveau: '1er Cru',
        commune: 'Auxey-Duresses',
        vigneron: 'Domaine Prunier-Darny',
        surface_ha: 4.10,
        cepage: 'Chardonnay',
        notes: 'Vigne d’altitude modérée sur sol marno-calcaire. Blancs tendus, ciselés aux notes de noisette fraîche et d’agrumes.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.7420, 46.9870],
          [4.7445, 46.9878],
          [4.7450, 46.9862],
          [4.7425, 46.9855],
          [4.7420, 46.9870]
        ]]
      }
    },

    // ==========================================
    // CÔTE DE BEAUNE - MONTHÉLIE
    // ==========================================
    {
      type: 'Feature',
      id: 'MON-FUL-01',
      properties: {
        id: 'MON-FUL-01',
        code_parcel: 'MON-001-FUL',
        nom_app: 'Monthelie Premier Cru',
        climat: 'Les Champs Fulliot',
        niveau: '1er Cru',
        commune: 'Monthelie',
        vigneron: 'Domaine Coche-Dury / Domaine Eric de Suremain',
        surface_ha: 8.12,
        cepage: 'Pinot Noir',
        notes: 'Climat emblématique de Monthelie contigu au Clos des Chênes de Volnay. Rouge élégant, fuyant la lourdeur, aux tannins de soie.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.7660, 46.9940],
          [4.7685, 46.9948],
          [4.7690, 46.9932],
          [4.7665, 46.9925],
          [4.7660, 46.9940]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'MON-VEL-01',
      properties: {
        id: 'MON-VEL-01',
        code_parcel: 'MON-002-VEL',
        nom_app: 'Monthelie Premier Cru',
        climat: 'Sur la Velle',
        niveau: '1er Cru',
        commune: 'Monthelie',
        vigneron: 'Domaine Paul Garaudet',
        surface_ha: 6.05,
        cepage: 'Pinot Noir',
        notes: 'Pente douce surplombant le village. Sol rouge oxfordien très calcaire.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.7688, 46.9952],
          [4.7710, 46.9960],
          [4.7715, 46.9945],
          [4.7692, 46.9938],
          [4.7688, 46.9952]
        ]]
      }
    },

    // ==========================================
    // CÔTE DE BEAUNE - SAINT-ROMAIN
    // ==========================================
    {
      type: 'Feature',
      id: 'STR-CHA-01',
      properties: {
        id: 'STR-CHA-01',
        code_parcel: 'STR-001-CHA',
        nom_app: 'Saint-Romain',
        climat: 'Sous le Château',
        niveau: 'Village',
        commune: 'Saint-Romain',
        vigneron: 'Domaine Alain Gras / Domaine Christophe Buisson',
        surface_ha: 14.20,
        cepage: 'Chardonnay',
        notes: 'Cirque rocheux d’altitude (350m-400m). Sol de marnes blanches liasiques donnant des blancs tranchants et ultra minéraux.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.7120, 46.9980],
          [4.7150, 46.9990],
          [4.7155, 46.9972],
          [4.7125, 46.9965],
          [4.7120, 46.9980]
        ]]
      }
    },

    // ==========================================
    // CÔTE DE BEAUNE - CHOREY-LÈS-BEAUNE
    // ==========================================
    {
      type: 'Feature',
      id: 'CHO-BON-01',
      properties: {
        id: 'CHO-BON-01',
        code_parcel: 'CHO-001-BON',
        nom_app: 'Chorey-lès-Beaune',
        climat: 'Les Bons Ores',
        niveau: 'Village',
        commune: 'Chorey-lès-Beaune',
        vigneron: 'Domaine Tollot-Beaut / Domaine Germain',
        surface_ha: 11.50,
        cepage: 'Pinot Noir',
        notes: 'Sols d’alluvions anciennes sur calcaire bathonien. Vin souple, fruité et très accessible.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8620, 47.0450],
          [4.8650, 47.0458],
          [4.8655, 47.0440],
          [4.8625, 47.0432],
          [4.8620, 47.0450]
        ]]
      }
    },

    // ==========================================
    // CÔTE DE BEAUNE - LADOIX-SERRIGNY
    // ==========================================
    {
      type: 'Feature',
      id: 'LAD-GRE-01',
      properties: {
        id: 'LAD-GRE-01',
        code_parcel: 'LAD-001-GRE',
        nom_app: 'Ladoix Premier Cru',
        climat: 'Les Gréchons et Foutrières',
        niveau: '1er Cru',
        commune: 'Ladoix-Serrigny',
        vigneron: 'Domaine Sylvain Loichet / Prince Florent de Mérode',
        surface_ha: 3.80,
        cepage: 'Chardonnay',
        notes: 'Haut du coteau contigu au Corton-Charlemagne. Sol calcaire clair apportant une tension digne d’un grand cru.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8820, 47.0620],
          [4.8845, 47.0628],
          [4.8850, 47.0612],
          [4.8825, 47.0605],
          [4.8820, 47.0620]
        ]]
      }
    },

    // ==========================================
    // CÔTE DE BEAUNE - SAVIGNY-LÈS-BEAUNE
    // ==========================================
    {
      type: 'Feature',
      id: 'SAV-SER-01',
      properties: {
        id: 'SAV-SER-01',
        code_parcel: 'SAV-001-SER',
        nom_app: 'Savigny-lès-Beaune Premier Cru',
        climat: 'Aux Serpentières',
        niveau: '1er Cru',
        commune: 'Savigny-lès-Beaune',
        vigneron: 'Domaine Pavelot / Domaine Bize',
        surface_ha: 6.90,
        cepage: 'Pinot Noir',
        notes: 'Légère pente exposée sud. Sol d’alluvions graveleuses rouges produisant des rouges profonds et épicés.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8250, 47.0610],
          [4.8280, 47.0618],
          [4.8285, 47.0600],
          [4.8255, 47.0592],
          [4.8250, 47.0610]
        ]]
      }
    },

    // ==========================================
    // CÔTE DE BEAUNE - BEAUNE
    // ==========================================
    {
      type: 'Feature',
      id: 'BEA-BRE-01',
      properties: {
        id: 'BEA-BRE-01',
        code_parcel: 'BEA-001-BRE',
        nom_app: 'Beaune Premier Cru',
        climat: 'Les Bressandes',
        niveau: '1er Cru',
        commune: 'Beaune',
        vigneron: 'Maison Joseph Drouhin / Domaine Albert Morot',
        surface_ha: 17.40,
        cepage: 'Pinot Noir',
        notes: 'Milieu de coteau exposé est. Calcaire oxfordien superficiel donnant l’un des plus grands vins de garde de Beaune.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8320, 47.0380],
          [4.8350, 47.0388],
          [4.8355, 47.0370],
          [4.8325, 47.0362],
          [4.8320, 47.0380]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'BEA-MOU-01',
      properties: {
        id: 'BEA-MOU-01',
        code_parcel: 'BEA-002-MOU',
        nom_app: 'Beaune Premier Cru',
        climat: 'Clos des Mouches',
        niveau: '1er Cru',
        commune: 'Beaune',
        vigneron: 'Maison Joseph Drouhin / Chanson',
        surface_ha: 25.10,
        cepage: 'Chardonnay (14ha) / Pinot Noir (11ha)',
        notes: 'Climat mythique à la limite de Pommard. "Mouches" désignait autrefois les abeilles. Vins blancs riches, mielleux et complexes.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8280, 47.0220],
          [4.8310, 47.0228],
          [4.8315, 47.0210],
          [4.8285, 47.0202],
          [4.8280, 47.0220]
        ]]
      }
    },

    // ==========================================
    // CÔTE DE BEAUNE - GRANDS CRUS CHASSAGNE / PULIGNY
    // ==========================================
    {
      type: 'Feature',
      id: 'CRI-MON-01',
      properties: {
        id: 'CRI-MON-01',
        code_parcel: 'CRI-001-MON',
        nom_app: 'Criots-Bâtard-Montrachet Grand Cru',
        climat: 'Criots-Bâtard-Montrachet',
        niveau: 'Grand Cru',
        commune: 'Chassagne-Montrachet',
        vigneron: 'Domaine Hubert Lamy / Domaine Fontaine-Gagnard',
        surface_ha: 1.57,
        cepage: 'Chardonnay',
        notes: 'Le plus petit des Grands Crus blancs de Bourgogne. Sol calcaire argileux très caillouteux exposé sud-est.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.7520, 46.9440],
          [4.7538, 46.9445],
          [4.7542, 46.9432],
          [4.7524, 46.9428],
          [4.7520, 46.9440]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'BIE-MON-01',
      properties: {
        id: 'BIE-MON-01',
        code_parcel: 'BIE-001-MON',
        nom_app: 'Bienvenues-Bâtard-Montrachet Grand Cru',
        climat: 'Bienvenues-Bâtard-Montrachet',
        niveau: 'Grand Cru',
        commune: 'Puligny-Montrachet',
        vigneron: 'Domaine Leflaive / Domaine Ramonet',
        surface_ha: 3.69,
        cepage: 'Chardonnay',
        notes: 'Contigu à Bâtard-Montrachet. Texture séduisante, arômes de poire, d’amande grillée et de minéraux précieux.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.7550, 46.9480],
          [4.7570, 46.9486],
          [4.7574, 46.9472],
          [4.7554, 46.9466],
          [4.7550, 46.9480]
        ]]
      }
    },

    // ==========================================
    // CÔTE DE BEAUNE - MARANGES & SANTENAY
    // ==========================================
    {
      type: 'Feature',
      id: 'MAR-FUS-01',
      properties: {
        id: 'MAR-FUS-01',
        code_parcel: 'MAR-001-FUS',
        nom_app: 'Maranges Premier Cru',
        climat: 'La Fussière',
        niveau: '1er Cru',
        commune: 'Dezize-lès-Maranges',
        vigneron: 'Domaine Bachelet-Monnot',
        surface_ha: 34.80,
        cepage: 'Pinot Noir',
        notes: 'Porte sud de la Côte de Beaune. Sol de marnes bleues et calcaire à entroques. Vins fruités, épicés et généreux.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.6580, 46.9180],
          [4.6610, 46.9188],
          [4.6615, 46.9170],
          [4.6585, 46.9162],
          [4.6580, 46.9180]
        ]]
      }
    },

    // ==========================================
    // RÉGIONALES INAO & IGP
    // ==========================================
    {
      type: 'Feature',
      id: 'IGP-SMB-01',
      properties: {
        id: 'IGP-SMB-01',
        code_parcel: 'IGP-001-SMB',
        nom_app: 'IGP Sainte-Marie-la-Blanche',
        climat: 'Coteaux de la Saône',
        niveau: 'IGP',
        commune: 'Sainte-Marie-la-Blanche',
        vigneron: 'Vignerons de la plaine de Beaune',
        surface_ha: 45.00,
        cepage: 'Chardonnay / Pinot Noir / Gamay',
        notes: 'Indication Géographique Protégée du val de Saône, bordant l’AOC Beaune. Vins frais, fruités et gourmands.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.9120, 46.9780],
          [4.9160, 46.9790],
          [4.9165, 46.9765],
          [4.9125, 46.9755],
          [4.9120, 46.9780]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'IGP-CBO-01',
      properties: {
        id: 'IGP-CBO-01',
        code_parcel: 'IGP-002-CBO',
        nom_app: 'IGP Coteaux Bourguignons',
        climat: 'Val de Saône',
        niveau: 'IGP',
        commune: 'Beaune',
        vigneron: 'Maison Albert Bichot',
        surface_ha: 80.00,
        cepage: 'Gamay / Pinot Noir',
        notes: 'IGP régionale couvrant les terroirs de Bourgogne et Beaujolais. Vin de plaisir et de convivialité.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8720, 47.0120],
          [4.8760, 47.0130],
          [4.8765, 47.0105],
          [4.8725, 47.0095],
          [4.8720, 47.0120]
        ]]
      }
    },

    // ==========================================
    // CÔTE DE BEAUNE - SAVIGNY-LÈS-BEAUNE (ATLAS ATTESTÉ ENTIER)
    // ==========================================
    {
      type: 'Feature',
      id: 'SAV-GUE-01',
      properties: {
        id: 'SAV-GUE-01',
        code_parcel: 'SAV-002-GUE',
        nom_app: 'Savigny-lès-Beaune Premier Cru',
        climat: 'Aux Guettes',
        niveau: '1er Cru',
        commune: 'Savigny-lès-Beaune',
        vigneron: 'Domaine Pavelot / Domaine A.-F. Gros',
        surface_ha: 9.80,
        cepage: 'Pinot Noir / Chardonnay',
        notes: 'Haut de coteau exposé plein sud surplombant le village. Sol sablo-limoneux très calcaire offrant tension et arômes de fruits rouges frais.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8210, 47.0650],
          [4.8235, 47.0658],
          [4.8240, 47.0642],
          [4.8215, 47.0635],
          [4.8210, 47.0650]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'SAV-CLO-01',
      properties: {
        id: 'SAV-CLO-01',
        code_parcel: 'SAV-003-CLO',
        nom_app: 'Savigny-lès-Beaune Premier Cru',
        climat: 'Aux Clous',
        niveau: '1er Cru',
        commune: 'Savigny-lès-Beaune',
        vigneron: 'Domaine Pierre Guillemot / Catherine et Claude Maréchal',
        surface_ha: 10.20,
        cepage: 'Pinot Noir',
        notes: 'Climat très réputé du versant sud de la vallée du Rhoin. Sol rougeâtre chargé en limons et calcaire bathonien.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8220, 47.0630],
          [4.8250, 47.0638],
          [4.8255, 47.0620],
          [4.8225, 47.0612],
          [4.8220, 47.0630]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'SAV-GRA-01',
      properties: {
        id: 'SAV-GRA-01',
        code_parcel: 'SAV-004-GRA',
        nom_app: 'Savigny-lès-Beaune Premier Cru',
        climat: 'Aux Gravains',
        niveau: '1er Cru',
        commune: 'Savigny-lès-Beaune',
        vigneron: 'Domaine Pavelot / Domaine Tollot-Beaut',
        surface_ha: 5.40,
        cepage: 'Pinot Noir',
        notes: 'Coteau très graveleux contigu aux Serpentières et aux Lavières. Vin d’une grande élégance avec des tannins fins.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8260, 47.0615],
          [4.8285, 47.0622],
          [4.8290, 47.0605],
          [4.8265, 47.0598],
          [4.8260, 47.0615]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'SAV-LAV-01',
      properties: {
        id: 'SAV-LAV-01',
        code_parcel: 'SAV-005-LAV',
        nom_app: 'Savigny-lès-Beaune Premier Cru',
        climat: 'Les Lavières',
        niveau: '1er Cru',
        commune: 'Savigny-lès-Beaune',
        vigneron: 'Domaine Tollot-Beaut / Domaine Chandon de Briailles',
        surface_ha: 17.60,
        cepage: 'Pinot Noir',
        notes: 'L’un des climats les plus vastes et célèbres de Savigny. "Laves" désigne les dalles calcaires affleurantes.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8290, 47.0605],
          [4.8320, 47.0612],
          [4.8325, 47.0595],
          [4.8295, 47.0588],
          [4.8290, 47.0605]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'SAV-TAL-01',
      properties: {
        id: 'SAV-TAL-01',
        code_parcel: 'SAV-006-TAL',
        nom_app: 'Savigny-lès-Beaune Premier Cru',
        climat: 'Les Talmettes',
        niveau: '1er Cru',
        commune: 'Savigny-lès-Beaune',
        vigneron: 'Domaine Simon Bize & Fils',
        surface_ha: 3.10,
        cepage: 'Pinot Noir',
        notes: 'Enclave exposée sud contiguë aux Lavières et aux Vergelesses. Sol mince sur dalles de calcaire clair.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8325, 47.0610],
          [4.8348, 47.0616],
          [4.8352, 47.0602],
          [4.8329, 47.0596],
          [4.8325, 47.0610]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'SAV-VER-01',
      properties: {
        id: 'SAV-VER-01',
        code_parcel: 'SAV-007-VER',
        nom_app: 'Savigny-lès-Beaune Premier Cru',
        climat: 'Aux Vergelesses',
        niveau: '1er Cru',
        commune: 'Savigny-lès-Beaune',
        vigneron: 'Domaine Chandon de Briailles / Domaine Simon Bize',
        surface_ha: 14.50,
        cepage: 'Pinot Noir / Chardonnay',
        notes: 'Grand Climat emblématique contigu à Pernand-Vergelesses. Vins d’une classe immense, riches, complexes et taillés pour la garde.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8350, 47.0615],
          [4.8385, 47.0622],
          [4.8390, 47.0605],
          [4.8355, 47.0598],
          [4.8350, 47.0615]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'SAV-BVER-01',
      properties: {
        id: 'SAV-BVER-01',
        code_parcel: 'SAV-008-BVER',
        nom_app: 'Savigny-lès-Beaune Premier Cru',
        climat: 'Les Basses Vergelesses',
        niveau: '1er Cru',
        commune: 'Savigny-lès-Beaune',
        vigneron: 'Domaine Rapet Père & Fils',
        surface_ha: 7.20,
        cepage: 'Pinot Noir',
        notes: 'Pied de coteau sous Aux Vergelesses. Sols profonds très riches en oxyde de fer.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8380, 47.0595],
          [4.8410, 47.0602],
          [4.8415, 47.0585],
          [4.8385, 47.0578],
          [4.8380, 47.0595]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'SAV-FOU-01',
      properties: {
        id: 'SAV-FOU-01',
        code_parcel: 'SAV-009-FOU',
        nom_app: 'Savigny-lès-Beaune Premier Cru',
        climat: 'Aux Fourches',
        niveau: '1er Cru',
        commune: 'Savigny-lès-Beaune',
        vigneron: 'Domaine Franco-Espagnol / Domaine Ecard',
        surface_ha: 5.10,
        cepage: 'Pinot Noir',
        notes: 'Climat situé en plaine sur alluvions calcaires fines. Vins souples, délicats et parfumés.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8280, 47.0580],
          [4.8310, 47.0588],
          [4.8315, 47.0570],
          [4.8285, 47.0562],
          [4.8280, 47.0580]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'SAV-CHA-01',
      properties: {
        id: 'SAV-CHA-01',
        code_parcel: 'SAV-010-CHA',
        nom_app: 'Savigny-lès-Beaune Premier Cru',
        climat: 'Aux Champs Chardons',
        niveau: '1er Cru',
        commune: 'Savigny-lès-Beaune',
        vigneron: 'Domaine Maurice Ecard',
        surface_ha: 4.80,
        cepage: 'Pinot Noir',
        notes: 'Coteau plein sud au milieu de la cuvette. Sol argilo-limoneux produisant des rouges denses et charnus.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8285, 47.0560],
          [4.8312, 47.0568],
          [4.8318, 47.0550],
          [4.8290, 47.0542],
          [4.8285, 47.0560]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'SAV-PRU-01',
      properties: {
        id: 'SAV-PRU-01',
        code_parcel: 'SAV-011-PRU',
        nom_app: 'Savigny-lès-Beaune Premier Cru',
        climat: 'Aux Champs des Pruniers',
        niveau: '1er Cru',
        commune: 'Savigny-lès-Beaune',
        vigneron: 'Domaine Machard de Gramont',
        surface_ha: 3.90,
        cepage: 'Pinot Noir',
        notes: 'Petit climat abrité au pied du coteau. Vins très ronds aux arômes de cerise noire.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8290, 47.0540],
          [4.8315, 47.0548],
          [4.8320, 47.0532],
          [4.8295, 47.0525],
          [4.8290, 47.0540]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'SAV-BEA-01',
      properties: {
        id: 'SAV-BEA-01',
        code_parcel: 'SAV-012-BEA',
        nom_app: 'Savigny-lès-Beaune Premier Cru',
        climat: 'Les Beaumonts',
        niveau: '1er Cru',
        commune: 'Savigny-lès-Beaune',
        vigneron: 'Domaine Jean-Marc Pavelot',
        surface_ha: 6.30,
        cepage: 'Pinot Noir',
        notes: 'Climat réputé bordant la route de Beaune. Sol brun calcaire filtrant.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8295, 47.0520],
          [4.8325, 47.0528],
          [4.8330, 47.0510],
          [4.8300, 47.0502],
          [4.8295, 47.0520]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'SAV-BOU-01',
      properties: {
        id: 'SAV-BOU-01',
        code_parcel: 'SAV-013-BOU',
        nom_app: 'Savigny-lès-Beaune Premier Cru',
        climat: 'Les Boutières',
        niveau: '1er Cru',
        commune: 'Savigny-lès-Beaune',
        vigneron: 'Domaine Emmanuel Rouget / Domaine Ecard',
        surface_ha: 8.90,
        cepage: 'Pinot Noir / Chardonnay',
        notes: 'Climat historique de bas de coteau. Sol graveleux très chaud à la maturité précoce.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8330, 47.0550],
          [4.8360, 47.0558],
          [4.8365, 47.0540],
          [4.8335, 47.0532],
          [4.8330, 47.0550]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'SAV-CRA-01',
      properties: {
        id: 'SAV-CRA-01',
        code_parcel: 'SAV-014-CRA',
        nom_app: 'Savigny-lès-Beaune Premier Cru',
        climat: 'Les Crapousuets',
        niveau: '1er Cru',
        commune: 'Savigny-lès-Beaune',
        vigneron: 'Domaine de la Vougeraie',
        surface_ha: 2.80,
        cepage: 'Pinot Noir',
        notes: 'Micro-climat contigu aux Brunettes et Planchots. Sol de lherzolite et argiles rouges.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8365, 47.0525],
          [4.8390, 47.0532],
          [4.8395, 47.0518],
          [4.8370, 47.0510],
          [4.8365, 47.0525]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'SAV-GUE-02',
      properties: {
        id: 'SAV-GUE-02',
        code_parcel: 'SAV-015-GUE',
        nom_app: 'Savigny-lès-Beaune Premier Cru',
        climat: 'Les Guérets',
        niveau: '1er Cru',
        commune: 'Savigny-lès-Beaune',
        vigneron: 'Domaine Tollot-Beaut',
        surface_ha: 3.20,
        cepage: 'Pinot Noir',
        notes: 'Très beau versant abrité de la colline de Mont-Batois. Vins soyeux et fins.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8400, 47.0555],
          [4.8425, 47.0562],
          [4.8430, 47.0548],
          [4.8405, 47.0540],
          [4.8400, 47.0555]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'SAV-CIT-01',
      properties: {
        id: 'SAV-CIT-01',
        code_parcel: 'SAV-016-CIT',
        nom_app: 'Savigny-lès-Beaune Premier Cru',
        climat: 'Les Citernes',
        niveau: '1er Cru',
        commune: 'Savigny-lès-Beaune',
        vigneron: 'Domaine Simon Bize',
        surface_ha: 1.90,
        cepage: 'Pinot Noir',
        notes: 'Sol très calcaire blanchâtre conservant une grande fraîcheur naturelle.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8370, 47.0540],
          [4.8395, 47.0548],
          [4.8400, 47.0532],
          [4.8375, 47.0525],
          [4.8370, 47.0540]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'SAV-VER-02',
      properties: {
        id: 'SAV-VER-02',
        code_parcel: 'SAV-017-VER',
        nom_app: 'Savigny-lès-Beaune Premier Cru',
        climat: 'Les Vercots',
        niveau: '1er Cru',
        commune: 'Savigny-lès-Beaune',
        vigneron: 'Domaine Pavelot',
        surface_ha: 4.20,
        cepage: 'Pinot Noir',
        notes: 'Coteau plein est sur calcaire dur. Rouges puissants taillés pour la garde.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8410, 47.0545],
          [4.8435, 47.0552],
          [4.8440, 47.0538],
          [4.8415, 47.0530],
          [4.8410, 47.0545]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'SAV-RAT-01',
      properties: {
        id: 'SAV-RAT-01',
        code_parcel: 'SAV-018-RAT',
        nom_app: 'Savigny-lès-Beaune',
        climat: 'Les Ratousses',
        niveau: 'Village',
        commune: 'Savigny-lès-Beaune',
        vigneron: 'Domaine Camus-Bruchon',
        surface_ha: 5.60,
        cepage: 'Pinot Noir',
        notes: 'Climat Village situé le long de la RN74. Vin friand aux notes de framboise et de groseille.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8250, 47.0490],
          [4.8280, 47.0498],
          [4.8285, 47.0480],
          [4.8255, 47.0472],
          [4.8250, 47.0490]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'SAV-LON-01',
      properties: {
        id: 'SAV-LON-01',
        code_parcel: 'SAV-019-LON',
        nom_app: 'Savigny-lès-Beaune',
        climat: 'Les Champs Longs',
        niveau: 'Village',
        commune: 'Savigny-lès-Beaune',
        vigneron: 'Domaine du Prieuré',
        surface_ha: 7.80,
        cepage: 'Pinot Noir',
        notes: 'Terroir d’alluvions à la sortie sud du village bordant Chorey-lès-Beaune.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8400, 47.0480],
          [4.8430, 47.0488],
          [4.8435, 47.0470],
          [4.8405, 47.0462],
          [4.8400, 47.0480]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'SAV-SAU-01',
      properties: {
        id: 'SAV-SAU-01',
        code_parcel: 'SAV-020-SAU',
        nom_app: 'Savigny-lès-Beaune',
        climat: 'Le Grand Saussy',
        niveau: 'Village',
        commune: 'Savigny-lès-Beaune',
        vigneron: 'Domaine Chenu Père & Fille',
        surface_ha: 8.40,
        cepage: 'Pinot Noir / Chardonnay',
        notes: 'Climat du sud-est de Savigny aux sols argileux profonds produisant des vins ronds et généreux.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8420, 47.0450],
          [4.8450, 47.0458],
          [4.8455, 47.0440],
          [4.8425, 47.0432],
          [4.8420, 47.0450]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'SAV-MAL-01',
      properties: {
        id: 'SAV-MAL-01',
        code_parcel: 'SAV-021-MAL',
        nom_app: 'Savigny-lès-Beaune',
        climat: 'Poirier Malchaussé',
        niveau: 'Village',
        commune: 'Savigny-lès-Beaune',
        vigneron: 'Domaine Jean-Michel Giboulot',
        surface_ha: 4.30,
        cepage: 'Pinot Noir',
        notes: 'Sol de limon calcaire en bordure du péage de Beaune Nord. Vin gourmand et fruité.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8180, 47.0460],
          [4.8210, 47.0468],
          [4.8215, 47.0450],
          [4.8185, 47.0442],
          [4.8180, 47.0460]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'SAV-MLD-01',
      properties: {
        id: 'SAV-MLD-01',
        code_parcel: 'SAV-022-MLD',
        nom_app: 'Savigny-lès-Beaune',
        climat: 'La Maladière',
        niveau: 'Village',
        commune: 'Savigny-lès-Beaune',
        vigneron: 'Domaine Dujardin',
        surface_ha: 3.50,
        cepage: 'Pinot Noir',
        notes: 'Ancien site historique de léproserie du Moyen Âge. Sol léger et pierreux.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8220, 47.0460],
          [4.8245, 47.0468],
          [4.8250, 47.0452],
          [4.8225, 47.0445],
          [4.8220, 47.0460]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'SAV-REP-01',
      properties: {
        id: 'SAV-REP-01',
        code_parcel: 'SAV-023-REP',
        nom_app: 'Savigny-lès-Beaune',
        climat: 'Les Grandes Rèpes',
        niveau: 'Village',
        commune: 'Savigny-lès-Beaune',
        vigneron: 'Domaine de Bellene / Nicolas Potel',
        surface_ha: 4.90,
        cepage: 'Pinot Noir',
        notes: 'Terroir très régulier du sud de la commune aux vignes souvent très âgées.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8255, 47.0460],
          [4.8280, 47.0468],
          [4.8285, 47.0452],
          [4.8260, 47.0445],
          [4.8255, 47.0460]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'SAV-TUE-01',
      properties: {
        id: 'SAV-TUE-01',
        code_parcel: 'SAV-024-TUE',
        nom_app: 'Savigny-lès-Beaune',
        climat: 'Tue-Boeuf',
        niveau: 'Village',
        commune: 'Savigny-lès-Beaune',
        vigneron: 'Domaine Dublere',
        surface_ha: 3.10,
        cepage: 'Pinot Noir',
        notes: 'Climat au nom évocateur du labeur de la terre. Sols très lourds et profonds.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8285, 47.0460],
          [4.8310, 47.0468],
          [4.8315, 47.0452],
          [4.8290, 47.0445],
          [4.8285, 47.0460]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'SAV-CTR-01',
      properties: {
        id: 'SAV-CTR-01',
        code_parcel: 'SAV-025-CTR',
        nom_app: 'Savigny-lès-Beaune',
        climat: 'Contrelin',
        niveau: 'Village',
        commune: 'Savigny-lès-Beaune',
        vigneron: 'Domaine Serrigny',
        surface_ha: 6.20,
        cepage: 'Pinot Noir',
        notes: 'Pointe sud-ouest de Savigny touchant l’autoroute A6.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8150, 47.0420],
          [4.8180, 47.0428],
          [4.8185, 47.0410],
          [4.8155, 47.0402],
          [4.8150, 47.0420]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'SAV-TRO-01',
      properties: {
        id: 'SAV-TRO-01',
        code_parcel: 'SAV-026-TRO',
        nom_app: 'Savigny-lès-Beaune',
        climat: 'Trot Garnier',
        niveau: 'Village',
        commune: 'Savigny-lès-Beaune',
        vigneron: 'Domaine Catherine & Claude Maréchal',
        surface_ha: 2.90,
        cepage: 'Pinot Noir',
        notes: 'Enclave extrême sud de la commune de Savigny-lès-Beaune.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8200, 47.0390],
          [4.8225, 47.0398],
          [4.8230, 47.0382],
          [4.8205, 47.0375],
          [4.8200, 47.0390]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'SAV-NAR-01',
      properties: {
        id: 'SAV-NAR-01',
        code_parcel: 'SAV-027-NAR',
        nom_app: 'Savigny-lès-Beaune Premier Cru',
        climat: 'Les Narbantons',
        niveau: '1er Cru',
        commune: 'Savigny-lès-Beaune',
        vigneron: 'Domaine Leroy / Domaine Mongeard-Mugneret',
        surface_ha: 8.20,
        cepage: 'Pinot Noir',
        notes: 'L’un des plus réputés Premiers Crus du bas du coteau sud. Vins intenses aux arômes d’épices et de cassis.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8180, 47.0580],
          [4.8210, 47.0588],
          [4.8215, 47.0570],
          [4.8185, 47.0562],
          [4.8180, 47.0580]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'SAV-ROU-01',
      properties: {
        id: 'SAV-ROU-01',
        code_parcel: 'SAV-028-ROU',
        nom_app: 'Savigny-lès-Beaune Premier Cru',
        climat: 'Les Rouvrettes',
        niveau: '1er Cru',
        commune: 'Savigny-lès-Beaune',
        vigneron: 'Domaine Chandon de Briailles',
        surface_ha: 2.10,
        cepage: 'Pinot Noir',
        notes: 'Petit climat abrité au pied de la colline de Redrescut. Sols calcaires très pierreux.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8160, 47.0600],
          [4.8185, 47.0608],
          [4.8190, 47.0592],
          [4.8165, 47.0585],
          [4.8160, 47.0600]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'SAV-JAR-01',
      properties: {
        id: 'SAV-JAR-01',
        code_parcel: 'SAV-029-JAR',
        nom_app: 'Savigny-lès-Beaune Premier Cru',
        climat: 'Les Hauts Jarrons',
        niveau: '1er Cru',
        commune: 'Savigny-lès-Beaune',
        vigneron: 'Domaine Jean-Michel Giboulot',
        surface_ha: 6.40,
        cepage: 'Pinot Noir',
        notes: 'Climat du versant sud bordant Beaune. Vin charpenté et riche en couleur.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8140, 47.0580],
          [4.8165, 47.0588],
          [4.8170, 47.0572],
          [4.8145, 47.0565],
          [4.8140, 47.0580]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'SAV-PEU-01',
      properties: {
        id: 'SAV-PEU-01',
        code_parcel: 'SAV-030-PEU',
        nom_app: 'Savigny-lès-Beaune Premier Cru',
        climat: 'Les Peuillets',
        niveau: '1er Cru',
        commune: 'Savigny-lès-Beaune',
        vigneron: 'Domaine Camus-Bruchon',
        surface_ha: 11.20,
        cepage: 'Pinot Noir',
        notes: 'Grand climat du pied de coteau ouest. Vins ronds, très fins et de consommation plus rapide.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8120, 47.0550],
          [4.8150, 47.0558],
          [4.8155, 47.0540],
          [4.8125, 47.0532],
          [4.8120, 47.0550]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'SAV-MAR-01',
      properties: {
        id: 'SAV-MAR-01',
        code_parcel: 'SAV-031-MAR',
        nom_app: 'Savigny-lès-Beaune Premier Cru',
        climat: 'Les Marconnets',
        niveau: '1er Cru',
        commune: 'Savigny-lès-Beaune',
        vigneron: 'Domaine Chanson / Domaine de la Vougeraie',
        surface_ha: 9.30,
        cepage: 'Pinot Noir / Chardonnay',
        notes: 'Climat mythique à la frontière directe de Beaune Premier Cru Les Marconnets. Sols sableux et calcaires.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8130, 47.0520],
          [4.8160, 47.0528],
          [4.8165, 47.0510],
          [4.8135, 47.0502],
          [4.8130, 47.0520]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'SAV-CON-01',
      properties: {
        id: 'SAV-CON-01',
        code_parcel: 'SAV-032-CON',
        nom_app: 'Savigny-lès-Beaune',
        climat: 'Ez Connardises',
        niveau: 'Village',
        commune: 'Savigny-lès-Beaune',
        vigneron: 'Domaine Simon Bize',
        surface_ha: 7.10,
        cepage: 'Pinot Noir',
        notes: 'Terroir village situé sous Les Lavières au sol d’alluvions fines.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8260, 47.0590],
          [4.8285, 47.0598],
          [4.8290, 47.0582],
          [4.8265, 47.0575],
          [4.8260, 47.0590]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'SAV-LIA-01',
      properties: {
        id: 'SAV-LIA-01',
        code_parcel: 'SAV-033-LIA',
        nom_app: 'Savigny-lès-Beaune',
        climat: 'Les Grands Liards',
        niveau: 'Village',
        commune: 'Savigny-lès-Beaune',
        vigneron: 'Domaine Simon Bize / Domaine Pavelot',
        surface_ha: 12.30,
        cepage: 'Pinot Noir',
        notes: 'L’un des terroirs Village les plus réputés de Bourgogne. Vignes cinquantenaires donnant un vin d’une profondeur étonnante.'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.8230, 47.0600],
          [4.8260, 47.0608],
          [4.8265, 47.0590],
          [4.8235, 47.0582],
          [4.8230, 47.0600]
        ]]
      }
    }
  ]
};
