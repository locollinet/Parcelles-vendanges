import { ClassificationLevel } from '../types';

export interface MasterClimatEntry {
  name: string;             // Nom du climat ou lieu-dit (ex: "Les Rugiens-Hauts", "Clos de Vougeot", "Le Montrachet")
  appellation: string;      // Appellation complète INAO (ex: "Pommard 1er Cru", "Montrachet Grand Cru")
  level: ClassificationLevel; // 'Grand Cru' | '1er Cru' | 'Village' | 'Régionale' | 'IGP'
  commune: string;          // Commune officielle (ex: "Pommard", "Chassagne-Montrachet")
  subregion: 'Côte de Nuits' | 'Côte de Beaune' | 'Chablis & Grand Auxerrois' | 'Côte Chalonnaise' | 'Mâconnais' | 'Val de Saône (IGP)';
  lat: number;              // Latitude du centre du climat
  lng: number;              // Longitude du centre du climat
  aliases?: string[];       // Synonymes, fautes courantes ou abréviations
}

export const BURGUNDY_MASTER_CATALOG: MasterClimatEntry[] = [
  // ==========================================
  // 1. CÔTE DE BEAUNE - GRANDS CRUS (100% EXHAUSTIF)
  // ==========================================
  { name: 'Le Montrachet', appellation: 'Montrachet Grand Cru', level: 'Grand Cru', commune: 'Puligny-Montrachet / Chassagne-Montrachet', subregion: 'Côte de Beaune', lat: 46.9450, lng: 4.7525, aliases: ['Montrachet', 'Grand Montrachet'] },
  { name: 'Bâtard-Montrachet', appellation: 'Bâtard-Montrachet Grand Cru', level: 'Grand Cru', commune: 'Puligny-Montrachet / Chassagne-Montrachet', subregion: 'Côte de Beaune', lat: 46.9465, lng: 4.7545, aliases: ['Batard-Montrachet', 'Batard'] },
  { name: 'Chevalier-Montrachet', appellation: 'Chevalier-Montrachet Grand Cru', level: 'Grand Cru', commune: 'Puligny-Montrachet', subregion: 'Côte de Beaune', lat: 46.9442, lng: 4.7505, aliases: ['Chevalier Montrachet'] },
  { name: 'Criots-Bâtard-Montrachet', appellation: 'Criots-Bâtard-Montrachet Grand Cru', level: 'Grand Cru', commune: 'Chassagne-Montrachet', subregion: 'Côte de Beaune', lat: 46.9435, lng: 4.7530, aliases: ['Criots', 'Criots Batard'] },
  { name: 'Bienvenues-Bâtard-Montrachet', appellation: 'Bienvenues-Bâtard-Montrachet Grand Cru', level: 'Grand Cru', commune: 'Puligny-Montrachet', subregion: 'Côte de Beaune', lat: 46.9475, lng: 4.7560, aliases: ['Bienvenues', 'Bienvenues Batard'] },
  { name: 'Corton-Charlemagne', appellation: 'Corton-Charlemagne Grand Cru', level: 'Grand Cru', commune: 'Aloxe-Corton / Pernand-Vergelesses / Ladoix', subregion: 'Côte de Beaune', lat: 47.0650, lng: 4.8580, aliases: ['Corton Charlemagne', 'Charlemagne'] },
  { name: 'Corton', appellation: 'Corton Grand Cru', level: 'Grand Cru', commune: 'Aloxe-Corton / Ladoix / Pernand', subregion: 'Côte de Beaune', lat: 47.0620, lng: 4.8620, aliases: ['Le Corton', 'Corton Clos du Roi', 'Corton Bressandes', 'Corton Renardes', 'Corton Poujets', 'Corton Grancey'] },

  // ==========================================
  // 2. CÔTE DE NUITS - GRANDS CRUS (100% EXHAUSTIF)
  // ==========================================
  { name: 'Chambertin', appellation: 'Chambertin Grand Cru', level: 'Grand Cru', commune: 'Gevrey-Chambertin', subregion: 'Côte de Nuits', lat: 47.2185, lng: 4.9575 },
  { name: 'Chambertin-Clos de Bèze', appellation: 'Chambertin-Clos de Bèze Grand Cru', level: 'Grand Cru', commune: 'Gevrey-Chambertin', subregion: 'Côte de Nuits', lat: 47.2210, lng: 4.9580, aliases: ['Clos de Bèze', 'Clos de Beze'] },
  { name: 'Charmes-Chambertin', appellation: 'Charmes-Chambertin Grand Cru', level: 'Grand Cru', commune: 'Gevrey-Chambertin', subregion: 'Côte de Nuits', lat: 47.2150, lng: 4.9610 },
  { name: 'Mazis-Chambertin', appellation: 'Mazis-Chambertin Grand Cru', level: 'Grand Cru', commune: 'Gevrey-Chambertin', subregion: 'Côte de Nuits', lat: 47.2230, lng: 4.9590, aliases: ['Mazy-Chambertin'] },
  { name: 'Latricières-Chambertin', appellation: 'Latricières-Chambertin Grand Cru', level: 'Grand Cru', commune: 'Gevrey-Chambertin', subregion: 'Côte de Nuits', lat: 47.2160, lng: 4.9560 },
  { name: 'Chapelle-Chambertin', appellation: 'Chapelle-Chambertin Grand Cru', level: 'Grand Cru', commune: 'Gevrey-Chambertin', subregion: 'Côte de Nuits', lat: 47.2175, lng: 4.9605 },
  { name: 'Griotte-Chambertin', appellation: 'Griotte-Chambertin Grand Cru', level: 'Grand Cru', commune: 'Gevrey-Chambertin', subregion: 'Côte de Nuits', lat: 47.2170, lng: 4.9600 },
  { name: 'Ruchottes-Chambertin', appellation: 'Ruchottes-Chambertin Grand Cru', level: 'Grand Cru', commune: 'Gevrey-Chambertin', subregion: 'Côte de Nuits', lat: 47.2245, lng: 4.9585 },
  { name: 'Mazoyères-Chambertin', appellation: 'Mazoyères-Chambertin Grand Cru', level: 'Grand Cru', commune: 'Gevrey-Chambertin', subregion: 'Côte de Nuits', lat: 47.2135, lng: 4.9620 },
  { name: 'Clos de la Roche', appellation: 'Clos de la Roche Grand Cru', level: 'Grand Cru', commune: 'Morey-Saint-Denis', subregion: 'Côte de Nuits', lat: 47.2025, lng: 4.9610 },
  { name: 'Clos Saint-Denis', appellation: 'Clos Saint-Denis Grand Cru', level: 'Grand Cru', commune: 'Morey-Saint-Denis', subregion: 'Côte de Nuits', lat: 47.1990, lng: 4.9600 },
  { name: 'Clos des Lambrays', appellation: 'Clos des Lambrays Grand Cru', level: 'Grand Cru', commune: 'Morey-Saint-Denis', subregion: 'Côte de Nuits', lat: 47.1970, lng: 4.9580 },
  { name: 'Clos de Tart', appellation: 'Clos de Tart Grand Cru', level: 'Grand Cru', commune: 'Morey-Saint-Denis', subregion: 'Côte de Nuits', lat: 47.1955, lng: 4.9570 },
  { name: 'Bonnes-Mares', appellation: 'Bonnes-Mares Grand Cru', level: 'Grand Cru', commune: 'Chambolle-Musigny / Morey-Saint-Denis', subregion: 'Côte de Nuits', lat: 47.1905, lng: 4.9535 },
  { name: 'Musigny', appellation: 'Musigny Grand Cru', level: 'Grand Cru', commune: 'Chambolle-Musigny', subregion: 'Côte de Nuits', lat: 47.1805, lng: 4.9500 },
  { name: 'Clos de Vougeot', appellation: 'Clos de Vougeot Grand Cru', level: 'Grand Cru', commune: 'Vougeot', subregion: 'Côte de Nuits', lat: 47.1750, lng: 4.9550, aliases: ['Clos Vougeot'] },
  { name: 'Échezeaux', appellation: 'Échezeaux Grand Cru', level: 'Grand Cru', commune: 'Flagey-Échezeaux', subregion: 'Côte de Nuits', lat: 47.1690, lng: 4.9520, aliases: ['Echezeaux', 'Les Echezeaux'] },
  { name: 'Grands Échezeaux', appellation: 'Grands Échezeaux Grand Cru', level: 'Grand Cru', commune: 'Flagey-Échezeaux', subregion: 'Côte de Nuits', lat: 47.1710, lng: 4.9540, aliases: ['Grands Echezeaux'] },
  { name: 'La Romanée-Conti', appellation: 'Romanée-Conti Grand Cru', level: 'Grand Cru', commune: 'Vosne-Romanée', subregion: 'Côte de Nuits', lat: 47.1610, lng: 4.9515, aliases: ['Romanee Conti', 'DRC'] },
  { name: 'La Tâche', appellation: 'La Tâche Grand Cru', level: 'Grand Cru', commune: 'Vosne-Romanée', subregion: 'Côte de Nuits', lat: 47.1585, lng: 4.9505, aliases: ['La Tache'] },
  { name: 'Richebourg', appellation: 'Richebourg Grand Cru', level: 'Grand Cru', commune: 'Vosne-Romanée', subregion: 'Côte de Nuits', lat: 47.1620, lng: 4.9510 },
  { name: 'La Romanée', appellation: 'La Romanée Grand Cru', level: 'Grand Cru', commune: 'Vosne-Romanée', subregion: 'Côte de Nuits', lat: 47.1612, lng: 4.9502, aliases: ['La Romanee'] },
  { name: 'Romanée-Saint-Vivant', appellation: 'Romanée-Saint-Vivant Grand Cru', level: 'Grand Cru', commune: 'Vosne-Romanée', subregion: 'Côte de Nuits', lat: 47.1618, lng: 4.9530, aliases: ['Romanee Saint Vivant'] },
  { name: 'La Grande Rue', appellation: 'La Grande Rue Grand Cru', level: 'Grand Cru', commune: 'Vosne-Romanée', subregion: 'Côte de Nuits', lat: 47.1598, lng: 4.9510 },

  // ==========================================
  // 3. CHABLIS GRANDS CRUS (100% EXHAUSTIF)
  // ==========================================
  { name: 'Les Clos', appellation: 'Chablis Grand Cru', level: 'Grand Cru', commune: 'Chablis', subregion: 'Chablis & Grand Auxerrois', lat: 47.8155, lng: 3.8010 },
  { name: 'Vaudésir', appellation: 'Chablis Grand Cru', level: 'Grand Cru', commune: 'Chablis', subregion: 'Chablis & Grand Auxerrois', lat: 47.8180, lng: 3.8020, aliases: ['Vaudesir'] },
  { name: 'Valmur', appellation: 'Chablis Grand Cru', level: 'Grand Cru', commune: 'Chablis', subregion: 'Chablis & Grand Auxerrois', lat: 47.8165, lng: 3.8000 },
  { name: 'Grenouilles', appellation: 'Chablis Grand Cru', level: 'Grand Cru', commune: 'Chablis', subregion: 'Chablis & Grand Auxerrois', lat: 47.8150, lng: 3.7975 },
  { name: 'Blanchot', appellation: 'Chablis Grand Cru', level: 'Grand Cru', commune: 'Chablis', subregion: 'Chablis & Grand Auxerrois', lat: 47.8130, lng: 3.8060 },
  { name: 'Les Preuses', appellation: 'Chablis Grand Cru', level: 'Grand Cru', commune: 'Chablis', subregion: 'Chablis & Grand Auxerrois', lat: 47.8200, lng: 3.8000 },
  { name: 'Bougros', appellation: 'Chablis Grand Cru', level: 'Grand Cru', commune: 'Chablis', subregion: 'Chablis & Grand Auxerrois', lat: 47.8215, lng: 3.7960 },

  // ==========================================
  // 4. PREMIERS CRUS EMBLÉMATIQUES & LIEUX-DITS DE BOURGOGNE
  // ==========================================
  // GEVREY-CHAMBERTIN
  { name: 'Clos Saint-Jacques', appellation: 'Gevrey-Chambertin Premier Cru', level: '1er Cru', commune: 'Gevrey-Chambertin', subregion: 'Côte de Nuits', lat: 47.2280, lng: 4.9540, aliases: ['Clos St Jacques'] },
  { name: 'Les Cazetiers', appellation: 'Gevrey-Chambertin Premier Cru', level: '1er Cru', commune: 'Gevrey-Chambertin', subregion: 'Côte de Nuits', lat: 47.2290, lng: 4.9520 },
  { name: 'Lavaut Saint-Jacques', appellation: 'Gevrey-Chambertin Premier Cru', level: '1er Cru', commune: 'Gevrey-Chambertin', subregion: 'Côte de Nuits', lat: 47.2270, lng: 4.9490, aliases: ['Lavaux St Jacques'] },
  { name: 'Aux Combottes', appellation: 'Gevrey-Chambertin Premier Cru', level: '1er Cru', commune: 'Gevrey-Chambertin', subregion: 'Côte de Nuits', lat: 47.2115, lng: 4.9600 },
  { name: 'Petite Chapelle', appellation: 'Gevrey-Chambertin Premier Cru', level: '1er Cru', commune: 'Gevrey-Chambertin', subregion: 'Côte de Nuits', lat: 47.2180, lng: 4.9615 },
  { name: 'Champeaux', appellation: 'Gevrey-Chambertin Premier Cru', level: '1er Cru', commune: 'Gevrey-Chambertin', subregion: 'Côte de Nuits', lat: 47.2320, lng: 4.9580 },
  { name: 'Craipillot', appellation: 'Gevrey-Chambertin Premier Cru', level: '1er Cru', commune: 'Gevrey-Chambertin', subregion: 'Côte de Nuits', lat: 47.2260, lng: 4.9590 },
  { name: 'Estournelles-Saint-Jacques', appellation: 'Gevrey-Chambertin Premier Cru', level: '1er Cru', commune: 'Gevrey-Chambertin', subregion: 'Côte de Nuits', lat: 47.2295, lng: 4.9510 },

  // MOREY-SAINT-DENIS
  { name: 'Les Monts Luisants', appellation: 'Morey-Saint-Denis Premier Cru', level: '1er Cru', commune: 'Morey-Saint-Denis', subregion: 'Côte de Nuits', lat: 47.2040, lng: 4.9580 },
  { name: 'Les Chaffots', appellation: 'Morey-Saint-Denis Premier Cru', level: '1er Cru', commune: 'Morey-Saint-Denis', subregion: 'Côte de Nuits', lat: 47.2010, lng: 4.9585 },
  { name: 'Clos des Ormes', appellation: 'Morey-Saint-Denis Premier Cru', level: '1er Cru', commune: 'Morey-Saint-Denis', subregion: 'Côte de Nuits', lat: 47.2000, lng: 4.9640 },
  { name: 'Les Millandes', appellation: 'Morey-Saint-Denis Premier Cru', level: '1er Cru', commune: 'Morey-Saint-Denis', subregion: 'Côte de Nuits', lat: 47.1995, lng: 4.9620 },

  // CHAMBOLLE-MUSIGNY
  { name: 'Les Amoureuses', appellation: 'Chambolle-Musigny Premier Cru', level: '1er Cru', commune: 'Chambolle-Musigny', subregion: 'Côte de Nuits', lat: 47.1810, lng: 4.9530 },
  { name: 'Les Charmes', appellation: 'Chambolle-Musigny Premier Cru', level: '1er Cru', commune: 'Chambolle-Musigny', subregion: 'Côte de Nuits', lat: 47.1840, lng: 4.9560 },
  { name: 'Les Fuées', appellation: 'Chambolle-Musigny Premier Cru', level: '1er Cru', commune: 'Chambolle-Musigny', subregion: 'Côte de Nuits', lat: 47.1880, lng: 4.9540, aliases: ['Les Fuees'] },
  { name: 'Les Cras', appellation: 'Chambolle-Musigny Premier Cru', level: '1er Cru', commune: 'Chambolle-Musigny', subregion: 'Côte de Nuits', lat: 47.1870, lng: 4.9570 },
  { name: 'Les Hauts Doix', appellation: 'Chambolle-Musigny Premier Cru', level: '1er Cru', commune: 'Chambolle-Musigny', subregion: 'Côte de Nuits', lat: 47.1825, lng: 4.9545 },

  // VOSNE-ROMANÉE
  { name: 'Cros Parantoux', appellation: 'Vosne-Romanée Premier Cru', level: '1er Cru', commune: 'Vosne-Romanée', subregion: 'Côte de Nuits', lat: 47.1625, lng: 4.9485, aliases: ['Parantoux'] },
  { name: 'Aux Brûlées', appellation: 'Vosne-Romanée Premier Cru', level: '1er Cru', commune: 'Vosne-Romanée', subregion: 'Côte de Nuits', lat: 47.1640, lng: 4.9490, aliases: ['Aux Brulees'] },
  { name: 'Les Beaux Monts', appellation: 'Vosne-Romanée Premier Cru', level: '1er Cru', commune: 'Vosne-Romanée / Flagey', subregion: 'Côte de Nuits', lat: 47.1650, lng: 4.9480 },
  { name: 'Aux Malconsorts', appellation: 'Vosne-Romanée Premier Cru', level: '1er Cru', commune: 'Vosne-Romanée', subregion: 'Côte de Nuits', lat: 47.1570, lng: 4.9500 },
  { name: 'Les Suchots', appellation: 'Vosne-Romanée Premier Cru', level: '1er Cru', commune: 'Vosne-Romanée', subregion: 'Côte de Nuits', lat: 47.1660, lng: 4.9530 },
  { name: 'Les Chaumes', appellation: 'Vosne-Romanée Premier Cru', level: '1er Cru', commune: 'Vosne-Romanée', subregion: 'Côte de Nuits', lat: 47.1580, lng: 4.9520 },
  { name: 'Les Petits Monts', appellation: 'Vosne-Romanée Premier Cru', level: '1er Cru', commune: 'Vosne-Romanée', subregion: 'Côte de Nuits', lat: 47.1628, lng: 4.9480 },
  { name: 'Clos des Réas', appellation: 'Vosne-Romanée Premier Cru', level: '1er Cru', commune: 'Vosne-Romanée', subregion: 'Côte de Nuits', lat: 47.1575, lng: 4.9535, aliases: ['Clos des Reas'] },

  // NUITS-SAINT-GEORGES
  { name: 'Les Saint-Georges', appellation: 'Nuits-Saint-Georges Premier Cru', level: '1er Cru', commune: 'Nuits-Saint-Georges', subregion: 'Côte de Nuits', lat: 47.1260, lng: 4.9450, aliases: ['Les St Georges'] },
  { name: 'Les Vaucrains', appellation: 'Nuits-Saint-Georges Premier Cru', level: '1er Cru', commune: 'Nuits-Saint-Georges', subregion: 'Côte de Nuits', lat: 47.1240, lng: 4.9410 },
  { name: 'Aux Chaignots', appellation: 'Nuits-Saint-Georges Premier Cru', level: '1er Cru', commune: 'Nuits-Saint-Georges', subregion: 'Côte de Nuits', lat: 47.1400, lng: 4.9480 },
  { name: 'Les Pruliers', appellation: 'Nuits-Saint-Georges Premier Cru', level: '1er Cru', commune: 'Nuits-Saint-Georges', subregion: 'Côte de Nuits', lat: 47.1280, lng: 4.9430 },
  { name: 'Clos de la Maréchale', appellation: 'Nuits-Saint-Georges Premier Cru', level: '1er Cru', commune: 'Nuits-Saint-Georges / Prémeaux', subregion: 'Côte de Nuits', lat: 47.1120, lng: 4.9380, aliases: ['Clos de la Marechale'] },
  { name: 'Clos des Porrets-Saint-Georges', appellation: 'Nuits-Saint-Georges Premier Cru', level: '1er Cru', commune: 'Nuits-Saint-Georges', subregion: 'Côte de Nuits', lat: 47.1270, lng: 4.9420 },
  { name: 'Les Damodes', appellation: 'Nuits-Saint-Georges Premier Cru', level: '1er Cru', commune: 'Nuits-Saint-Georges', subregion: 'Côte de Nuits', lat: 47.1420, lng: 4.9460 },
  { name: 'Aux Boudots', appellation: 'Nuits-Saint-Georges Premier Cru', level: '1er Cru', commune: 'Nuits-Saint-Georges', subregion: 'Côte de Nuits', lat: 47.1435, lng: 4.9475 },

  // FIXIN & MARSANNAY
  { name: 'Clos de la Perrière', appellation: 'Fixin Premier Cru', level: '1er Cru', commune: 'Fixin', subregion: 'Côte de Nuits', lat: 47.2420, lng: 4.9620 },
  { name: 'Clos du Chapitre', appellation: 'Fixin Premier Cru', level: '1er Cru', commune: 'Fixin', subregion: 'Côte de Nuits', lat: 47.2440, lng: 4.9630 },
  { name: 'Les Longeroies', appellation: 'Marsannay', level: 'Village', commune: 'Marsannay-la-Côte', subregion: 'Côte de Nuits', lat: 47.2750, lng: 4.9850 },
  { name: 'Clos du Roy', appellation: 'Marsannay', level: 'Village', commune: 'Marsannay-la-Côte / Chenôve', subregion: 'Côte de Nuits', lat: 47.2800, lng: 4.9880 },

  // POMMARD & VOLNAY
  { name: 'Les Rugiens', appellation: 'Pommard Premier Cru', level: '1er Cru', commune: 'Pommard', subregion: 'Côte de Beaune', lat: 46.9985, lng: 4.7925, aliases: ['Les Rugiens-Hauts', 'Les Rugiens-Bas'] },
  { name: 'Les Épenots', appellation: 'Pommard Premier Cru', level: '1er Cru', commune: 'Pommard', subregion: 'Côte de Beaune', lat: 47.0120, lng: 4.7980, aliases: ['Les Grands Epenots', 'Les Petits Epenots', 'Clos des Epenots'] },
  { name: 'Les Pezerolles', appellation: 'Pommard Premier Cru', level: '1er Cru', commune: 'Pommard', subregion: 'Côte de Beaune', lat: 47.0090, lng: 4.7950 },
  { name: 'Les Arvelets', appellation: 'Pommard Premier Cru', level: '1er Cru', commune: 'Pommard', subregion: 'Côte de Beaune', lat: 47.0075, lng: 4.7920 },
  { name: 'Les Jarollières', appellation: 'Pommard Premier Cru', level: '1er Cru', commune: 'Pommard', subregion: 'Côte de Beaune', lat: 46.9960, lng: 4.7910 },
  { name: 'Clos de la Commaraine', appellation: 'Pommard Premier Cru', level: '1er Cru', commune: 'Pommard', subregion: 'Côte de Beaune', lat: 47.0060, lng: 4.7960 },
  { name: 'Clos des Ducs', appellation: 'Volnay Premier Cru', level: '1er Cru', commune: 'Volnay', subregion: 'Côte de Beaune', lat: 47.0010, lng: 4.7810 },
  { name: 'Les Caillerets', appellation: 'Volnay Premier Cru', level: '1er Cru', commune: 'Volnay', subregion: 'Côte de Beaune', lat: 46.9950, lng: 4.7820 },
  { name: 'Clos des Chênes', appellation: 'Volnay Premier Cru', level: '1er Cru', commune: 'Volnay', subregion: 'Côte de Beaune', lat: 46.9930, lng: 4.7790, aliases: ['Clos des Chenes'] },
  { name: 'Les Santenots', appellation: 'Volnay Premier Cru', level: '1er Cru', commune: 'Volnay / Meursault', subregion: 'Côte de Beaune', lat: 46.9880, lng: 4.7760, aliases: ['Santenots du Milieu', 'Les Santenots-Blancs'] },
  { name: 'Taille Pieds', appellation: 'Volnay Premier Cru', level: '1er Cru', commune: 'Volnay', subregion: 'Côte de Beaune', lat: 46.9970, lng: 4.7800 },
  { name: 'Champans', appellation: 'Volnay Premier Cru', level: '1er Cru', commune: 'Volnay', subregion: 'Côte de Beaune', lat: 46.9940, lng: 4.7810 },

  // MEURSAULT
  { name: 'Les Perrières', appellation: 'Meursault Premier Cru', level: '1er Cru', commune: 'Meursault', subregion: 'Côte de Beaune', lat: 46.9680, lng: 4.7670, aliases: ['Meursault Perrieres', 'Perrières Dessus'] },
  { name: 'Les Genevrières', appellation: 'Meursault Premier Cru', level: '1er Cru', commune: 'Meursault', subregion: 'Côte de Beaune', lat: 46.9710, lng: 4.7680, aliases: ['Genevrieres'] },
  { name: 'Les Charmes', appellation: 'Meursault Premier Cru', level: '1er Cru', commune: 'Meursault', subregion: 'Côte de Beaune', lat: 46.9730, lng: 4.7710, aliases: ['Charmes Dessus', 'Charmes Dessous'] },
  { name: 'Goutte d’Or', appellation: 'Meursault Premier Cru', level: '1er Cru', commune: 'Meursault', subregion: 'Côte de Beaune', lat: 46.9780, lng: 4.7730 },
  { name: 'Les Poruzots', appellation: 'Meursault Premier Cru', level: '1er Cru', commune: 'Meursault', subregion: 'Côte de Beaune', lat: 46.9740, lng: 4.7690, aliases: ['Poruzot'] },
  { name: 'Les Bouchères', appellation: 'Meursault Premier Cru', level: '1er Cru', commune: 'Meursault', subregion: 'Côte de Beaune', lat: 46.9760, lng: 4.7680 },
  { name: 'Clos des Perrières', appellation: 'Meursault Premier Cru', level: '1er Cru', commune: 'Meursault', subregion: 'Côte de Beaune', lat: 46.9685, lng: 4.7665 },

  // PULIGNY-MONTRACHET & CHASSAGNE-MONTRACHET
  { name: 'Les Pucelles', appellation: 'Puligny-Montrachet Premier Cru', level: '1er Cru', commune: 'Puligny-Montrachet', subregion: 'Côte de Beaune', lat: 46.9510, lng: 4.7570 },
  { name: 'Les Combettes', appellation: 'Puligny-Montrachet Premier Cru', level: '1er Cru', commune: 'Puligny-Montrachet', subregion: 'Côte de Beaune', lat: 46.9550, lng: 4.7610 },
  { name: 'Le Cailleret', appellation: 'Puligny-Montrachet Premier Cru', level: '1er Cru', commune: 'Puligny-Montrachet', subregion: 'Côte de Beaune', lat: 46.9455, lng: 4.7490 },
  { name: 'Les Folatières', appellation: 'Puligny-Montrachet Premier Cru', level: '1er Cru', commune: 'Puligny-Montrachet', subregion: 'Côte de Beaune', lat: 46.9520, lng: 4.7480, aliases: ['Folatieres', 'En la Garenne'] },
  { name: 'Clavoillon', appellation: 'Puligny-Montrachet Premier Cru', level: '1er Cru', commune: 'Puligny-Montrachet', subregion: 'Côte de Beaune', lat: 46.9530, lng: 4.7550 },
  { name: 'Champ Canet', appellation: 'Puligny-Montrachet Premier Cru', level: '1er Cru', commune: 'Puligny-Montrachet', subregion: 'Côte de Beaune', lat: 46.9565, lng: 4.7590 },
  { name: 'Les Chenevottes', appellation: 'Chassagne-Montrachet Premier Cru', level: '1er Cru', commune: 'Chassagne-Montrachet', subregion: 'Côte de Beaune', lat: 46.9410, lng: 4.7520 },
  { name: 'Morgeot', appellation: 'Chassagne-Montrachet Premier Cru', level: '1er Cru', commune: 'Chassagne-Montrachet', subregion: 'Côte de Beaune', lat: 46.9320, lng: 4.7580, aliases: ['Abbaye de Morgeot', 'Clos Pitois'] },
  { name: 'La Boudriotte', appellation: 'Chassagne-Montrachet Premier Cru', level: '1er Cru', commune: 'Chassagne-Montrachet', subregion: 'Côte de Beaune', lat: 46.9340, lng: 4.7550 },
  { name: 'Les Vergers', appellation: 'Chassagne-Montrachet Premier Cru', level: '1er Cru', commune: 'Chassagne-Montrachet', subregion: 'Côte de Beaune', lat: 46.9400, lng: 4.7480 },
  { name: 'Clos Saint-Jean', appellation: 'Chassagne-Montrachet Premier Cru', level: '1er Cru', commune: 'Chassagne-Montrachet', subregion: 'Côte de Beaune', lat: 46.9360, lng: 4.7460 },
  { name: 'La Romanée', appellation: 'Chassagne-Montrachet Premier Cru', level: '1er Cru', commune: 'Chassagne-Montrachet', subregion: 'Côte de Beaune', lat: 46.9380, lng: 4.7410 },
  { name: 'Grandes Ruchottes', appellation: 'Chassagne-Montrachet Premier Cru', level: '1er Cru', commune: 'Chassagne-Montrachet', subregion: 'Côte de Beaune', lat: 46.9395, lng: 4.7450 },

  // BEAUNE, SAVIGNY & ALOXE
  { name: 'Clos des Mouches', appellation: 'Beaune Premier Cru', level: '1er Cru', commune: 'Beaune', subregion: 'Côte de Beaune', lat: 47.0140, lng: 4.8250 },
  { name: 'Les Grèves', appellation: 'Beaune Premier Cru', level: '1er Cru', commune: 'Beaune', subregion: 'Côte de Beaune', lat: 47.0310, lng: 4.8280, aliases: ['Les Greves', 'Vignes de l\'Enfant Jesus'] },
  { name: 'Les Bressandes', appellation: 'Beaune Premier Cru', level: '1er Cru', commune: 'Beaune', subregion: 'Côte de Beaune', lat: 47.0350, lng: 4.8310 },
  { name: 'Les Teurons', appellation: 'Beaune Premier Cru', level: '1er Cru', commune: 'Beaune', subregion: 'Côte de Beaune', lat: 47.0280, lng: 4.8300 },
  { name: 'Les Lavières', appellation: 'Savigny-lès-Beaune Premier Cru', level: '1er Cru', commune: 'Savigny-lès-Beaune', subregion: 'Côte de Beaune', lat: 47.0620, lng: 4.8180 },
  { name: 'Aux Serpentières', appellation: 'Savigny-lès-Beaune Premier Cru', level: '1er Cru', commune: 'Savigny-lès-Beaune', subregion: 'Côte de Beaune', lat: 47.0650, lng: 4.8250 },
  { name: 'Île des Vergelesses', appellation: 'Pernand-Vergelesses Premier Cru', level: '1er Cru', commune: 'Pernand-Vergelesses', subregion: 'Côte de Beaune', lat: 47.0780, lng: 4.8560, aliases: ['Ile des Vergelesses'] },
  { name: 'Les Valozières', appellation: 'Aloxe-Corton Premier Cru', level: '1er Cru', commune: 'Aloxe-Corton', subregion: 'Côte de Beaune', lat: 47.0660, lng: 4.8620 },

  // CHABLIS PREMIERS CRUS
  { name: 'Fourchaume', appellation: 'Chablis Premier Cru', level: '1er Cru', commune: 'Chablis / La Chapelle-Vaupelteigne', subregion: 'Chablis & Grand Auxerrois', lat: 47.8320, lng: 3.7910 },
  { name: 'Montée de Tonnerre', appellation: 'Chablis Premier Cru', level: '1er Cru', commune: 'Chablis', subregion: 'Chablis & Grand Auxerrois', lat: 47.8100, lng: 3.8120, aliases: ['Montee de Tonnerre', 'Chapelot'] },
  { name: 'Vaillons', appellation: 'Chablis Premier Cru', level: '1er Cru', commune: 'Chablis', subregion: 'Chablis & Grand Auxerrois', lat: 47.8050, lng: 3.7880, aliases: ['Les Lys', 'Sécher'] },
  { name: 'Mont de Milieu', appellation: 'Chablis Premier Cru', level: '1er Cru', commune: 'Chablis / Fleys', subregion: 'Chablis & Grand Auxerrois', lat: 47.8120, lng: 3.8280 },
  { name: 'Les Forêts', appellation: 'Chablis Premier Cru', level: '1er Cru', commune: 'Chablis', subregion: 'Chablis & Grand Auxerrois', lat: 47.8010, lng: 3.7820, aliases: ['Forest'] },
  { name: 'Côte de Léchet', appellation: 'Chablis Premier Cru', level: '1er Cru', commune: 'Chablis / Milly', subregion: 'Chablis & Grand Auxerrois', lat: 47.8080, lng: 3.7720 },

  // CÔTE CHALONNAISE & MÂCONNAIS
  { name: 'Meix Cadot', appellation: 'Rully Premier Cru', level: '1er Cru', commune: 'Rully', subregion: 'Côte Chalonnaise', lat: 46.8920, lng: 4.7350 },
  { name: 'Clos du Roi', appellation: 'Mercurey Premier Cru', level: '1er Cru', commune: 'Mercurey', subregion: 'Côte Chalonnaise', lat: 46.8350, lng: 4.7210 },
  { name: 'Clos Salomon', appellation: 'Givry Premier Cru', level: '1er Cru', commune: 'Givry', subregion: 'Côte Chalonnaise', lat: 46.7820, lng: 4.7410 },
  { name: 'Les Coères', appellation: 'Montagny Premier Cru', level: '1er Cru', commune: 'Montagny', subregion: 'Côte Chalonnaise', lat: 46.7050, lng: 4.6720 },
  { name: 'Vers Pouilly', appellation: 'Pouilly-Fuissé Premier Cru', level: '1er Cru', commune: 'Solutré-Pouilly', subregion: 'Mâconnais', lat: 46.2850, lng: 4.7250 },
  { name: 'Les Ménétrières', appellation: 'Pouilly-Fuissé Premier Cru', level: '1er Cru', commune: 'Fuissé', subregion: 'Mâconnais', lat: 46.2790, lng: 4.7410 },
  { name: 'Sur la Roche', appellation: 'Pouilly-Fuissé Premier Cru', level: '1er Cru', commune: 'Vergisson', subregion: 'Mâconnais', lat: 46.2910, lng: 4.7180 },

  // ==========================================
  // 5. COMMUNES ET VILLAGES DE BOURGOGNE
  // ==========================================
  { name: 'Beaune', appellation: 'Beaune', level: 'Village', commune: 'Beaune', subregion: 'Côte de Beaune', lat: 47.0250, lng: 4.8400 },
  { name: 'Pommard', appellation: 'Pommard', level: 'Village', commune: 'Pommard', subregion: 'Côte de Beaune', lat: 47.0080, lng: 4.7950 },
  { name: 'Volnay', appellation: 'Volnay', level: 'Village', commune: 'Volnay', subregion: 'Côte de Beaune', lat: 47.0010, lng: 4.7820 },
  { name: 'Meursault', appellation: 'Meursault', level: 'Village', commune: 'Meursault', subregion: 'Côte de Beaune', lat: 46.9780, lng: 4.7700 },
  { name: 'Puligny-Montrachet', appellation: 'Puligny-Montrachet', level: 'Village', commune: 'Puligny-Montrachet', subregion: 'Côte de Beaune', lat: 46.9530, lng: 4.7530 },
  { name: 'Chassagne-Montrachet', appellation: 'Chassagne-Montrachet', level: 'Village', commune: 'Chassagne-Montrachet', subregion: 'Côte de Beaune', lat: 46.9380, lng: 4.7500 },
  { name: 'Auxey-Duresses', appellation: 'Auxey-Duresses', level: 'Village', commune: 'Auxey-Duresses', subregion: 'Côte de Beaune', lat: 46.9880, lng: 4.7480 },
  { name: 'Monthelie', appellation: 'Monthelie', level: 'Village', commune: 'Monthelie', subregion: 'Côte de Beaune', lat: 46.9930, lng: 4.7670, aliases: ['Monthélie'] },
  { name: 'Saint-Romain', appellation: 'Saint-Romain', level: 'Village', commune: 'Saint-Romain', subregion: 'Côte de Beaune', lat: 46.9980, lng: 4.7120, aliases: ['St Romain'] },
  { name: 'Savigny-lès-Beaune', appellation: 'Savigny-lès-Beaune', level: 'Village', commune: 'Savigny-lès-Beaune', subregion: 'Côte de Beaune', lat: 47.0600, lng: 4.8200, aliases: ['Savigny-les-Beaune', 'Savigny'] },
  { name: 'Chorey-lès-Beaune', appellation: 'Chorey-lès-Beaune', level: 'Village', commune: 'Chorey-lès-Beaune', subregion: 'Côte de Beaune', lat: 47.0450, lng: 4.8620, aliases: ['Chorey'] },
  { name: 'Aloxe-Corton', appellation: 'Aloxe-Corton', level: 'Village', commune: 'Aloxe-Corton', subregion: 'Côte de Beaune', lat: 47.0650, lng: 4.8580 },
  { name: 'Ladoix-Serrigny', appellation: 'Ladoix', level: 'Village', commune: 'Ladoix-Serrigny', subregion: 'Côte de Beaune', lat: 47.0680, lng: 4.8820, aliases: ['Ladoix'] },
  { name: 'Pernand-Vergelesses', appellation: 'Pernand-Vergelesses', level: 'Village', commune: 'Pernand-Vergelesses', subregion: 'Côte de Beaune', lat: 47.0800, lng: 4.8510 },
  { name: 'Santenay', appellation: 'Santenay', level: 'Village', commune: 'Santenay', subregion: 'Côte de Beaune', lat: 46.9120, lng: 4.6950 },
  { name: 'Cheilly-lès-Maranges', appellation: 'Maranges', level: 'Village', commune: 'Cheilly-lès-Maranges', subregion: 'Côte de Beaune', lat: 46.9050, lng: 4.6750, aliases: ['Maranges'] },
  { name: 'Gevrey-Chambertin', appellation: 'Gevrey-Chambertin', level: 'Village', commune: 'Gevrey-Chambertin', subregion: 'Côte de Nuits', lat: 47.2280, lng: 4.9680 },
  { name: 'Morey-Saint-Denis', appellation: 'Morey-Saint-Denis', level: 'Village', commune: 'Morey-Saint-Denis', subregion: 'Côte de Nuits', lat: 47.1980, lng: 4.9620 },
  { name: 'Chambolle-Musigny', appellation: 'Chambolle-Musigny', level: 'Village', commune: 'Chambolle-Musigny', subregion: 'Côte de Nuits', lat: 47.1850, lng: 4.9580 },
  { name: 'Vougeot', appellation: 'Vougeot', level: 'Village', commune: 'Vougeot', subregion: 'Côte de Nuits', lat: 47.1760, lng: 4.9610 },
  { name: 'Vosne-Romanée', appellation: 'Vosne-Romanée', level: 'Village', commune: 'Vosne-Romanée', subregion: 'Côte de Nuits', lat: 47.1610, lng: 4.9540 },
  { name: 'Nuits-Saint-Georges', appellation: 'Nuits-Saint-Georges', level: 'Village', commune: 'Nuits-Saint-Georges', subregion: 'Côte de Nuits', lat: 47.1360, lng: 4.9500 },
  { name: 'Fixin', appellation: 'Fixin', level: 'Village', commune: 'Fixin', subregion: 'Côte de Nuits', lat: 47.2450, lng: 4.9650 },
  { name: 'Marsannay', appellation: 'Marsannay', level: 'Village', commune: 'Marsannay-la-Côte', subregion: 'Côte de Nuits', lat: 47.2720, lng: 4.9880 },
  { name: 'Chablis', appellation: 'Chablis', level: 'Village', commune: 'Chablis', subregion: 'Chablis & Grand Auxerrois', lat: 47.8150, lng: 3.8000 },
  { name: 'Irancy', appellation: 'Irancy', level: 'Village', commune: 'Irancy', subregion: 'Chablis & Grand Auxerrois', lat: 47.7120, lng: 3.6650 },
  { name: 'Saint-Bris', appellation: 'Saint-Bris', level: 'Village', commune: 'Saint-Bris-le-Vineux', subregion: 'Chablis & Grand Auxerrois', lat: 47.7450, lng: 3.6510 },
  { name: 'Rully', appellation: 'Rully', level: 'Village', commune: 'Rully', subregion: 'Côte Chalonnaise', lat: 46.8950, lng: 4.7410 },
  { name: 'Mercurey', appellation: 'Mercurey', level: 'Village', commune: 'Mercurey', subregion: 'Côte Chalonnaise', lat: 46.8380, lng: 4.7250 },
  { name: 'Givry', appellation: 'Givry', level: 'Village', commune: 'Givry', subregion: 'Côte Chalonnaise', lat: 46.7850, lng: 4.7450 },
  { name: 'Montagny', appellation: 'Montagny', level: 'Village', commune: 'Montagny-lès-Buxy', subregion: 'Côte Chalonnaise', lat: 46.7080, lng: 4.6750 },
  { name: 'Pouilly-Fuissé', appellation: 'Pouilly-Fuissé', level: 'Village', commune: 'Solutré-Pouilly', subregion: 'Mâconnais', lat: 46.2820, lng: 4.7280 },
  { name: 'Saint-Véran', appellation: 'Saint-Véran', level: 'Village', commune: 'Saint-Vérand', subregion: 'Mâconnais', lat: 46.2520, lng: 4.7320 },
  { name: 'Viré-Clessé', appellation: 'Viré-Clessé', level: 'Village', commune: 'Viré', subregion: 'Mâconnais', lat: 46.4520, lng: 4.8420 },

  // ==========================================
  // 6. RÉGIONALES & IGP
  // ==========================================
  { name: 'IGP Sainte-Marie-la-Blanche', appellation: 'IGP Sainte-Marie-la-Blanche', level: 'IGP', commune: 'Sainte-Marie-la-Blanche', subregion: 'Val de Saône (IGP)', lat: 46.9780, lng: 4.9120, aliases: ['Sainte-Marie-la-Blanche', 'IGP Val de Saone'] },
  { name: 'IGP Coteaux Bourguignons', appellation: 'IGP Coteaux Bourguignons', level: 'IGP', commune: 'Bourgogne', subregion: 'Val de Saône (IGP)', lat: 47.0120, lng: 4.8720, aliases: ['Coteaux Bourguignons'] },
  { name: 'Bourgogne Hautes-Côtes de Beaune', appellation: 'Bourgogne Hautes-Côtes de Beaune', level: 'Régionale', commune: 'Nantoux / Saint-Romain', subregion: 'Côte de Beaune', lat: 47.0200, lng: 4.7500, aliases: ['Hautes-Cotes de Beaune'] },
  { name: 'Bourgogne Hautes-Côtes de Nuits', appellation: 'Bourgogne Hautes-Côtes de Nuits', level: 'Régionale', commune: 'Marey-lès-Fussey', subregion: 'Côte de Nuits', lat: 47.1200, lng: 4.8800, aliases: ['Hautes-Cotes de Nuits'] },
  { name: 'Bourgogne Côte d’Or', appellation: 'Bourgogne Côte d’Or', level: 'Régionale', commune: 'Côte de Beaune & Nuits', subregion: 'Côte de Beaune', lat: 47.0500, lng: 4.8200, aliases: ['Bourgogne Cote d\'Or'] },
  { name: 'Bourgogne Aligoté', appellation: 'Bourgogne Aligoté', level: 'Régionale', commune: 'Bouzeron / Bourgogne', subregion: 'Côte Chalonnaise', lat: 46.8900, lng: 4.7200, aliases: ['Aligoté', 'Aligote'] },
  { name: 'Crémant de Bourgogne', appellation: 'Crémant de Bourgogne', level: 'Régionale', commune: 'Rully / Nuits-Saint-Georges', subregion: 'Côte Chalonnaise', lat: 46.8950, lng: 4.7400, aliases: ['Cremant de Bourgogne', 'Cremant'] }
];
