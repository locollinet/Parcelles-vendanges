import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Camera, Navigation, Layers, Check, Upload, Wine, Sparkles, Search, Trash2, Image as ImageIcon } from 'lucide-react';
import { ParcelFeature, ClassificationLevel, ParcelPhoto } from '../types';
import { dataManager } from '../services/DataManager';
import { geoService } from '../services/GeoService';
import { compressImage } from '../services/ImageCompressor';

interface AddParcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onParcelCreated: (parcel: ParcelFeature) => void;
  currentGpsCoords?: { lat: number; lng: number } | null;
  clickedCoords?: { lat: number; lng: number } | null;
  sourceParcel?: ParcelFeature | null;
  fieldMode: boolean;
}

export const AddParcelModal: React.FC<AddParcelModalProps> = ({
  isOpen,
  onClose,
  onParcelCreated,
  currentGpsCoords,
  clickedCoords,
  sourceParcel,
  fieldMode
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoComplementInputRef = useRef<HTMLInputElement>(null);

  // Attached parcel reference
  const [attachedParcel, setAttachedParcel] = useState<ParcelFeature | null>(sourceParcel || null);
  const [searchParcelQuery, setSearchParcelQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ParcelFeature[]>([]);

  const [nomParcelle, setNomParcelle] = useState('');
  const [nomApp, setNomApp] = useState('');
  const [commune, setCommune] = useState('Puligny-Montrachet');
  const [classification, setClassification] = useState<ClassificationLevel>('Régionale');
  const [cepage, setCepage] = useState('Chardonnay');
  const [codeLivret, setCodeLivret] = useState('BBL');
  const [numeroLivret, setNumeroLivret] = useState('');
  const [nbRangs, setNbRangs] = useState('');
  const [proprietaire, setProprietaire] = useState('');
  const [secteur, setSecteur] = useState('');
  const [notes, setNotes] = useState('');
  
  // Coordinates
  const [latInput, setLatInput] = useState('');
  const [lngInput, setLngInput] = useState('');

  // Main Satellite/Plan Photo
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  
  // Extra Visual Complements (Photos de terrain / rangs / délimitations)
  const [extraPhotos, setExtraPhotos] = useState<ParcelPhoto[]>([]);
  const [extraPhotoCaption, setExtraPhotoCaption] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset or fill form whenever modal opens or sourceParcel changes
  useEffect(() => {
    if (!isOpen) return;

    const baseParcel = sourceParcel || null;
    setAttachedParcel(baseParcel);

    if (baseParcel) {
      const p = baseParcel.properties;
      const centroid = geoService.getParcelCentroid(baseParcel);

      setNomParcelle(p.nom_parcelle || p.nom_climat || p.climat || '');
      setNomApp(p.nom_app || p.appellation || p.nom_aoc || '');
      setCommune(p.commune || p.nom_commune || 'Puligny-Montrachet');
      setClassification((p.classification || p.niveau || 'Village') as ClassificationLevel);
      setCepage(p.cepage || 'Chardonnay');
      setCodeLivret(p.code_livret || p.code_parcel || 'BBL');
      setNumeroLivret(String(p.numero_livret || p.numero_sur_carte || ''));
      setNbRangs(p.nb_rangs_details || '');
      setProprietaire(p.proprietaire || p.vigneron || '');
      setSecteur(p.secteur_livret || '');
      setNotes(p.notes || '');
      setPhotoDataUrl(p.photo_url || null);
      setExtraPhotos(p.photos || []);

      if (centroid) {
        setLatInput(centroid[0].toFixed(6));
        setLngInput(centroid[1].toFixed(6));
      }
    } else {
      const initLat = clickedCoords?.lat || currentGpsCoords?.lat || 46.975;
      const initLng = clickedCoords?.lng || currentGpsCoords?.lng || 4.753;
      setLatInput(initLat.toFixed(6));
      setLngInput(initLng.toFixed(6));
      setNomParcelle('');
      setNomApp('');
      setCommune('Puligny-Montrachet');
      setClassification('Régionale');
      setCepage('Chardonnay');
      setCodeLivret('BBL');
      setNumeroLivret('');
      setNbRangs('');
      setProprietaire('');
      setSecteur('');
      setNotes('');
      setPhotoDataUrl(null);
      setExtraPhotos([]);
    }
  }, [isOpen, sourceParcel, clickedCoords, currentGpsCoords]);

  // Parcel quick search to attach
  useEffect(() => {
    if (searchParcelQuery.trim().length >= 2) {
      const results = dataManager.searchParcels(searchParcelQuery).slice(0, 5);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchParcelQuery]);

  const handleSelectAttachedParcel = (parcel: ParcelFeature) => {
    setAttachedParcel(parcel);
    setSearchParcelQuery('');
    setSearchResults([]);

    const p = parcel.properties;
    const centroid = geoService.getParcelCentroid(parcel);
    setNomParcelle(p.nom_parcelle || p.nom_climat || p.climat || '');
    setNomApp(p.nom_app || p.appellation || '');
    setCommune(p.commune || p.nom_commune || 'Puligny-Montrachet');
    setClassification((p.classification || p.niveau || 'Village') as ClassificationLevel);
    if (p.cepage) setCepage(p.cepage);
    if (centroid) {
      setLatInput(centroid[0].toFixed(6));
      setLngInput(centroid[1].toFixed(6));
    }
  };

  // Use current GPS button handler
  const handleUseCurrentGps = () => {
    if (currentGpsCoords) {
      setLatInput(currentGpsCoords.lat.toFixed(6));
      setLngInput(currentGpsCoords.lng.toFixed(6));
    }
  };

  // Main Satellite / Plan photo upload
  const handleMainPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 1400, 1400, 0.82);
        setPhotoDataUrl(compressed);
      } catch (err) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoDataUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Add extra terrain complement photo
  const handleExtraPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 1280, 1280, 0.80);
        const newPhoto: ParcelPhoto = {
          id: `photo-${Date.now()}`,
          url: compressed,
          caption: extraPhotoCaption.trim() || 'Photo de terrain (délimitation / rangs)',
          date: new Date().toLocaleDateString('fr-FR')
        };
        setExtraPhotos(prev => [...prev, newPhoto]);
        setExtraPhotoCaption('');
      } catch (err) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const newPhoto: ParcelPhoto = {
            id: `photo-${Date.now()}`,
            url: reader.result as string,
            caption: extraPhotoCaption.trim() || 'Photo de terrain (délimitation / rangs)',
            date: new Date().toLocaleDateString('fr-FR')
          };
          setExtraPhotos(prev => [...prev, newPhoto]);
          setExtraPhotoCaption('');
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleRemoveExtraPhoto = (photoId: string) => {
    setExtraPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomParcelle.trim()) {
      alert('Veuillez renseigner le nom de la parcelle');
      return;
    }

    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);

    if (isNaN(lat) || isNaN(lng)) {
      alert('Coordonnées GPS invalides');
      return;
    }

    setIsSubmitting(true);

    const parcelId = attachedParcel
      ? `domaine-${attachedParcel.properties.id || attachedParcel.id}`
      : `custom-${Date.now()}`;

    // Use attached parcel geometry if exists, otherwise generate polygon around GPS
    let geometry = attachedParcel?.geometry;
    if (!geometry || !geometry.coordinates) {
      const deltaLat = 0.0006;
      const deltaLng = 0.0009;
      geometry = {
        type: 'Polygon',
        coordinates: [[
          [lng - deltaLng, lat + deltaLat],
          [lng + deltaLng, lat + deltaLat],
          [lng + deltaLng, lat - deltaLat],
          [lng - deltaLng, lat - deltaLat],
          [lng - deltaLng, lat + deltaLat]
        ]]
      };
    }

    const newFeature: ParcelFeature = {
      type: 'Feature',
      id: parcelId,
      properties: {
        id: parcelId,
        source_cadastre_id: attachedParcel ? String(attachedParcel.properties.id || attachedParcel.id) : undefined,
        nom_parcelle: nomParcelle.trim(),
        climat: nomParcelle.trim(),
        nom_climat: nomParcelle.trim(),
        nom_app: nomApp.trim() || nomParcelle.trim(),
        appellation: nomApp.trim() || nomParcelle.trim(),
        commune: commune.trim(),
        nom_commune: commune.trim(),
        classification: classification,
        niveau: classification,
        cepage: cepage.trim(),
        code_livret: codeLivret.trim().toUpperCase(),
        code_parcel: codeLivret.trim().toUpperCase(),
        numero_livret: numeroLivret.trim(),
        numero_sur_carte: numeroLivret.trim(),
        nb_rangs_details: nbRangs.trim(),
        proprietaire: proprietaire.trim(),
        vigneron: proprietaire.trim(),
        secteur_livret: secteur.trim(),
        notes: notes.trim(),
        photo_url: photoDataUrl || undefined,
        photos: extraPhotos.length > 0 ? extraPhotos : undefined,
        is_custom_user_parcel: true,
        surface_ha: attachedParcel?.properties.surface_ha,
        created_at: new Date().toISOString()
      },
      geometry: geometry
    };

    const saved = dataManager.createCustomParcel(newFeature);
    setIsSubmitting(false);
    onParcelCreated(saved);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`w-full max-w-lg max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border ${
            fieldMode
              ? 'bg-zinc-950 border-zinc-800 text-zinc-100'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between border-amber-500/20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 font-black">
                +
              </div>
              <div>
                <h3 className="text-base font-black tracking-tight">
                  {attachedParcel ? 'Créer une fiche domaine rattachée' : 'Ajouter une fiche parcelle'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">Synchronisé en temps réel avec toute l'équipe</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Form Body (Scrollable) */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
            
            {/* Rattachement à une parcelle existante de la map */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> Rattachement au contour cadastral
                </span>
                {attachedParcel && (
                  <button
                    type="button"
                    onClick={() => setAttachedParcel(null)}
                    className="text-[10px] font-bold text-rose-500 hover:underline"
                  >
                    Détacher
                  </button>
                )}
              </div>

              {attachedParcel ? (
                <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-black text-amber-900 dark:text-amber-200">
                      ✓ Rattachée à : {attachedParcel.properties.nom_parcelle || attachedParcel.properties.climat}
                    </div>
                    <div className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                      {attachedParcel.properties.commune} • {attachedParcel.properties.surface_ha ? `${attachedParcel.properties.surface_ha} ha • ` : ''}Contour cadastral conservé
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={searchParcelQuery}
                      onChange={(e) => setSearchParcelQuery(e.target.value)}
                      placeholder="Rechercher une parcelle de la map à rattacher..."
                      className={`w-full pl-8 pr-3 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        fieldMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  {searchResults.length > 0 && (
                    <div className="rounded-xl border border-amber-500/30 overflow-hidden bg-zinc-900 divide-y divide-zinc-800">
                      {searchResults.map((p) => (
                        <div
                          key={p.properties.id || p.id}
                          onClick={() => handleSelectAttachedParcel(p)}
                          className="p-2 hover:bg-amber-500/20 cursor-pointer text-xs flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-white block">
                              {p.properties.nom_parcelle || p.properties.climat}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {p.properties.commune} • {p.properties.appellation}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md">
                            Rattacher
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Nom & Appellation */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                Nom de la parcelle / Climat <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nomParcelle}
                onChange={(e) => setNomParcelle(e.target.value)}
                placeholder="Ex: Puligny-Montrachet – Les Folatières"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  fieldMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            {/* Appellation & Commune */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">Appellation</label>
                <input
                  type="text"
                  value={nomApp}
                  onChange={(e) => setNomApp(e.target.value)}
                  placeholder="Ex: Puligny-Montrachet 1er Cru"
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    fieldMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">Commune</label>
                <input
                  type="text"
                  value={commune}
                  onChange={(e) => setCommune(e.target.value)}
                  placeholder="Ex: Puligny-Montrachet"
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    fieldMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            {/* Classification & Cépage */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">Classification</label>
                <select
                  value={classification}
                  onChange={(e) => setClassification(e.target.value as ClassificationLevel)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    fieldMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="Grand Cru">Grand Cru</option>
                  <option value="1er Cru">1er Cru</option>
                  <option value="Village">Village</option>
                  <option value="Régionale">Régionale</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">Cépage</label>
                <input
                  type="text"
                  value={cepage}
                  onChange={(e) => setCepage(e.target.value)}
                  placeholder="Chardonnay, Pinot Noir..."
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    fieldMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            {/* Code Livret & Numéro */}
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300">Code</label>
                <input
                  type="text"
                  value={codeLivret}
                  onChange={(e) => setCodeLivret(e.target.value)}
                  placeholder="ALI, BBL..."
                  className={`w-full px-2.5 py-2 rounded-xl border text-xs font-medium uppercase focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    fieldMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300">N° Livret</label>
                <input
                  type="text"
                  value={numeroLivret}
                  onChange={(e) => setNumeroLivret(e.target.value)}
                  placeholder="Ex: 5"
                  className={`w-full px-2.5 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    fieldMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300">Nb Rangs</label>
                <input
                  type="text"
                  value={nbRangs}
                  onChange={(e) => setNbRangs(e.target.value)}
                  placeholder="Ex: 14 rangs"
                  className={`w-full px-2.5 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    fieldMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            {/* Apporteur & Secteur */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">Apporteur / Propriétaire</label>
                <input
                  type="text"
                  value={proprietaire}
                  onChange={(e) => setProprietaire(e.target.value)}
                  placeholder="Ex: CHAVY, OPALE..."
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    fieldMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">Secteur</label>
                <input
                  type="text"
                  value={secteur}
                  onChange={(e) => setSecteur(e.target.value)}
                  placeholder="Ex: Corpeau 2"
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    fieldMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            {/* GPS Coordinates & Position Button */}
            <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Coordonnées GPS du centre
                </span>
                {currentGpsCoords && (
                  <button
                    type="button"
                    onClick={handleUseCurrentGps}
                    className="text-[11px] font-bold text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <Navigation className="w-3 h-3" /> Ma position GPS actuelle
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400">Latitude</label>
                  <input
                    type="text"
                    required
                    value={latInput}
                    onChange={(e) => setLatInput(e.target.value)}
                    className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold ${
                      fieldMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400">Longitude</label>
                  <input
                    type="text"
                    required
                    value={lngInput}
                    onChange={(e) => setLngInput(e.target.value)}
                    className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold ${
                      fieldMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Photo Satellite ou Plan Global */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                Photo satellite ou plan d'ensemble
              </label>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleMainPhotoChange}
                className="hidden"
              />

              {photoDataUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-amber-500/40">
                  <img
                    src={photoDataUrl}
                    alt="Aperçu photo parcelle"
                    className="w-full h-36 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotoDataUrl(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-3.5 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                    fieldMode
                      ? 'border-zinc-700 hover:border-amber-500 bg-zinc-900/50'
                      : 'border-slate-300 hover:border-amber-500 bg-slate-50'
                  }`}
                >
                  <Camera className="w-5 h-5 text-amber-500" />
                  <span className="text-xs font-bold text-slate-600 dark:text-zinc-300">
                    Prendre ou importer une photo d'ensemble
                  </span>
                </div>
              )}
            </div>

            {/* COMPLÉMENTS VISUELS : Photos de rangs, repères, délimitations */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" /> Compléments visuels (Rangs & Délimitations)
                </span>
                <span className="text-[10px] text-zinc-400">{extraPhotos.length} photo(s)</span>
              </div>

              {/* Gallery of extra photos */}
              {extraPhotos.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {extraPhotos.map((photo) => (
                    <div key={photo.id} className="relative rounded-xl overflow-hidden border border-zinc-700 bg-black group">
                      <img src={photo.url} alt={photo.caption} className="w-full h-24 object-cover" />
                      <div className="p-1.5 bg-zinc-950/90 text-[10px] font-medium text-zinc-200 truncate">
                        {photo.caption}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveExtraPhoto(photo.id)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-rose-600/90 text-white hover:bg-rose-700 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Input for adding new extra photo */}
              <div className="space-y-2 pt-1 border-t border-zinc-800">
                <input
                  type="text"
                  value={extraPhotoCaption}
                  onChange={(e) => setExtraPhotoCaption(e.target.value)}
                  placeholder="Légende (ex: Piquet borne nord, Délimitation rangée 12...)"
                  className="w-full px-3 py-1.5 rounded-xl border border-zinc-700 bg-zinc-900 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                
                <input
                  type="file"
                  ref={photoComplementInputRef}
                  accept="image/*"
                  onChange={handleExtraPhotoChange}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => photoComplementInputRef.current?.click()}
                  className="w-full py-2 px-3 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>+ Ajouter une photo de délimitation / rang</span>
                </button>
              </div>
            </div>

            {/* Notes & Observations */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">Notes & Consignes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Consignes d'accès, observations de vendanges..."
                rows={2}
                className={`w-full px-3 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  fieldMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-sm shadow-lg shadow-amber-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>{isSubmitting ? 'Création...' : 'Créer & Partager avec l\'équipe'}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className={`py-3 px-4 rounded-2xl font-bold text-sm border transition-all ${
                  fieldMode ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                Annuler
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
