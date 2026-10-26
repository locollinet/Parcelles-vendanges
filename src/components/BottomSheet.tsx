import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navigation, MapPin, Wine, Edit3, X, Check, Compass, Layers, Info, RotateCcw, Save, Camera, Trash2, Image as ImageIcon, PlusCircle, ArrowUpRight, CheckCircle2, Clock, CircleDot, Package, Scale, Droplets, Printer } from 'lucide-react';
import { ParcelFeature, ClassificationLevel, ParcelProperties, ParcelPhoto, HarvestStatus } from '../types';
import { LEFLAIVE_CATALOG_CODES } from '../data/leflaiveCatalog';
import { geoService } from '../services/GeoService';
import { LivretPlanViewer } from './LivretPlanViewer';
import { dataManager } from '../services/DataManager';
import { compressImage } from '../services/ImageCompressor';

interface BottomSheetProps {
  parcel: ParcelFeature | null;
  onClose: () => void;
  onCenterOnParcel?: (parcel: ParcelFeature) => void;
  onCreateDomaineFicheFromParcel?: (parcel: ParcelFeature) => void;
  onOpenLivretExport?: (mode?: 'vendanges' | 'atlas_illustre', parcel?: ParcelFeature) => void;
  isCurrentGpsParcel: boolean;
  userGpsCoords?: { lat: number; lng: number } | null;
  onUpdateParcelNotes: (parcelId: string, vigneron: string, notes: string) => void;
  onUpdateParcel?: (parcelId: string, updates: Partial<ParcelProperties>) => void;
  onResetParcel?: (parcelId: string) => void;
  fieldMode: boolean;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  parcel,
  onClose,
  onCenterOnParcel,
  onCreateDomaineFicheFromParcel,
  onOpenLivretExport,
  isCurrentGpsParcel,
  userGpsCoords,
  onUpdateParcelNotes,
  onUpdateParcel,
  onResetParcel,
  fieldMode
}) => {
  if (!parcel) return null;

  const props = parcel.properties;
  const parcelId = String(parcel.id || props.id);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual Editing Form State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom_parcelle: props.nom_parcelle || props.climat || '',
    nom_app: props.nom_app || props.appellation || '',
    code_livret: props.code_livret || props.code_parcel || '',
    numero_livret: String(props.numero_livret || props.numero_sur_carte || ''),
    nb_rangs_details: props.nb_rangs_details || '',
    proprietaire: props.proprietaire || props.vigneron || '',
    cepage: props.cepage || '',
    commune: props.commune || props.nom_commune || '',
    secteur_livret: props.secteur_livret || '',
    notes: props.notes || ''
  });

  // Terrain Photos State
  const [photosList, setPhotosList] = useState<ParcelPhoto[]>(props.photos || []);
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState<ParcelPhoto | null>(null);
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);

  // Sync form state when parcel changes
  useEffect(() => {
    setFormData({
      nom_parcelle: props.nom_parcelle || props.climat || '',
      nom_app: props.nom_app || props.appellation || '',
      code_livret: props.code_livret || props.code_parcel || '',
      numero_livret: String(props.numero_livret || props.numero_sur_carte || ''),
      nb_rangs_details: props.nb_rangs_details || '',
      proprietaire: props.proprietaire || props.vigneron || '',
      cepage: props.cepage || '',
      commune: props.commune || props.nom_commune || '',
      secteur_livret: props.secteur_livret || '',
      notes: props.notes || ''
    });
    setPhotosList(props.photos || []);
    setIsEditing(false);
    setIsAddingPhoto(false);
  }, [parcelId, props]);

  const hasManualModifications = dataManager.hasUserOverrides(parcelId);

  const googleMapsUrl = React.useMemo(() => {
    return geoService.getGoogleMapsUrl(parcel);
  }, [parcel]);

  const handleSaveAll = () => {
    const updates: Partial<ParcelProperties> = {
      nom_parcelle: formData.nom_parcelle.trim(),
      climat: formData.nom_parcelle.trim(),
      nom_climat: formData.nom_parcelle.trim(),
      nom_app: formData.nom_app.trim(),
      appellation: formData.nom_app.trim(),
      code_livret: formData.code_livret.trim(),
      code_parcel: formData.code_livret.trim(),
      numero_livret: formData.numero_livret.trim(),
      numero_sur_carte: formData.numero_livret.trim(),
      nb_rangs_details: formData.nb_rangs_details.trim(),
      proprietaire: formData.proprietaire.trim(),
      vigneron: formData.proprietaire.trim(),
      cepage: formData.cepage.trim(),
      commune: formData.commune.trim(),
      nom_commune: formData.commune.trim(),
      secteur_livret: formData.secteur_livret.trim(),
      notes: formData.notes.trim()
    };

    if (onUpdateParcel) {
      onUpdateParcel(parcelId, updates);
    } else {
      dataManager.updateParcelProperties(parcelId, updates);
      onUpdateParcelNotes(parcelId, updates.proprietaire || '', updates.notes || '');
    }
    setIsEditing(false);
  };

  const handleResetToDefault = () => {
    if (confirm('Voulez-vous rétablir les informations d\'origine pour cette fiche ?')) {
      if (onResetParcel) {
        onResetParcel(parcelId);
      } else {
        dataManager.resetParcelProperties(parcelId);
      }
      setIsEditing(false);
    }
  };

  const [harvestStatus, setHarvestStatus] = useState<HarvestStatus>(props.harvest_status);
  const [harvestCaisses, setHarvestCaisses] = useState<number | undefined>(props.harvest_caisses);
  const [harvestHl, setHarvestHl] = useState<number | undefined>(props.harvest_hl);
  const [harvestKg, setHarvestKg] = useState<number | undefined>(props.harvest_kg);
  const [activeUnitTab, setActiveUnitTab] = useState<'caisses' | 'hl' | 'kg'>('caisses');

  // Sync harvest status & quantities when parcel changes
  useEffect(() => {
    setHarvestStatus(props.harvest_status);
    setHarvestCaisses(props.harvest_caisses);
    setHarvestHl(props.harvest_hl);
    setHarvestKg(props.harvest_kg);
  }, [props.harvest_status, props.harvest_caisses, props.harvest_hl, props.harvest_kg]);

  // Vector calculation (bearing, distance, cardinal direction)
  const gpsVector = React.useMemo(() => {
    if (!userGpsCoords?.lat || !userGpsCoords?.lng || !parcel) return null;
    return geoService.getVectorToParcel(userGpsCoords.lat, userGpsCoords.lng, parcel);
  }, [userGpsCoords, parcel]);

  const handleSetHarvestStatus = (status: HarvestStatus) => {
    setHarvestStatus(status);
    const updates: Partial<ParcelProperties> = {
      harvest_status: status
    };
    if (status === 'vendange') {
      updates.harvest_date = props.harvest_date || new Date().toLocaleDateString('fr-FR');
    } else if (props.harvest_date) {
      updates.harvest_date = props.harvest_date;
    }
    if (onUpdateParcel) {
      onUpdateParcel(parcelId, updates);
    } else {
      dataManager.updateParcelProperties(parcelId, updates);
    }
  };

  const handleUpdateCaisses = (count: number) => {
    const validCount = Math.max(0, count);
    setHarvestCaisses(validCount);
    const updates: Partial<ParcelProperties> = {
      harvest_caisses: validCount
    };
    if (onUpdateParcel) {
      onUpdateParcel(parcelId, updates);
    } else {
      dataManager.updateParcelProperties(parcelId, updates);
    }
  };

  const handleUpdateHl = (vol: number) => {
    const validVol = Math.max(0, parseFloat(vol.toFixed(2)));
    setHarvestHl(validVol);
    const updates: Partial<ParcelProperties> = {
      harvest_hl: validVol
    };
    if (onUpdateParcel) {
      onUpdateParcel(parcelId, updates);
    } else {
      dataManager.updateParcelProperties(parcelId, updates);
    }
  };

  const handleUpdateKg = (weight: number) => {
    const validWeight = Math.max(0, Math.round(weight));
    setHarvestKg(validWeight);
    const updates: Partial<ParcelProperties> = {
      harvest_kg: validWeight
    };
    if (onUpdateParcel) {
      onUpdateParcel(parcelId, updates);
    } else {
      dataManager.updateParcelProperties(parcelId, updates);
    }
  };

  // Add a new terrain photo to this parcel (with auto compression)
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedUrl = await compressImage(file, 1280, 1280, 0.82);
        const newPhoto: ParcelPhoto = {
          id: `photo-${Date.now()}`,
          url: compressedUrl,
          caption: newPhotoCaption.trim() || 'Photo de terrain (délimitation / rangs)',
          date: new Date().toLocaleDateString('fr-FR')
        };
        const updated = [...photosList, newPhoto];
        setPhotosList(updated);
        setNewPhotoCaption('');
        setIsAddingPhoto(false);

        if (onUpdateParcel) {
          onUpdateParcel(parcelId, { photos: updated });
        } else {
          dataManager.updateParcelProperties(parcelId, { photos: updated });
        }
      } catch (err) {
        console.warn('Error compressing photo:', err);
        const reader = new FileReader();
        reader.onloadend = () => {
          const newPhoto: ParcelPhoto = {
            id: `photo-${Date.now()}`,
            url: reader.result as string,
            caption: newPhotoCaption.trim() || 'Photo de terrain (délimitation / rangs)',
            date: new Date().toLocaleDateString('fr-FR')
          };
          const updated = [...photosList, newPhoto];
          setPhotosList(updated);
          setNewPhotoCaption('');
          setIsAddingPhoto(false);

          if (onUpdateParcel) {
            onUpdateParcel(parcelId, { photos: updated });
          } else {
            dataManager.updateParcelProperties(parcelId, { photos: updated });
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Delete a terrain photo
  const handleDeletePhoto = (photoId: string) => {
    if (confirm('Supprimer cette photo pour toute l\'équipe ?')) {
      const updated = photosList.filter(p => p.id !== photoId);
      setPhotosList(updated);
      if (activeLightboxPhoto?.id === photoId) {
        setActiveLightboxPhoto(null);
      }
      if (onUpdateParcel) {
        onUpdateParcel(parcelId, { photos: updated });
      } else {
        dataManager.updateParcelProperties(parcelId, { photos: updated });
      }
    }
  };

  const getLevelColorBadge = (level: ClassificationLevel) => {
    switch (level) {
      case 'Grand Cru':
        return {
          bg: fieldMode ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'bg-amber-100 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          text: 'Grand Cru'
        };
      case '1er Cru':
        return {
          bg: fieldMode ? 'bg-purple-500/20 text-purple-300 border-purple-500/50' : 'bg-purple-100 text-purple-800 border-purple-200',
          dot: 'bg-purple-500',
          text: '1er Cru'
        };
      case 'Village':
        return {
          bg: fieldMode ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' : 'bg-emerald-100 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
          text: 'Village'
        };
      case 'Régionale':
      default:
        return {
          bg: fieldMode ? 'bg-blue-500/20 text-blue-300 border-blue-500/50' : 'bg-blue-100 text-blue-800 border-blue-200',
          dot: 'bg-blue-500',
          text: 'Régionale'
        };
    }
  };

  const levelInfo = getLevelColorBadge(props.niveau || 'Village');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 340 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.05, bottom: 0.5 }}
        onDragEnd={(_, info) => {
          if (!isEditing && !isAddingPhoto && (info.offset.y > 90 || info.velocity.y > 400)) {
            onClose();
          }
        }}
        className="fixed bottom-0 left-0 right-0 z-[1100] max-w-xl mx-auto p-2 sm:p-4 pointer-events-none"
      >
        <div
          className={`pointer-events-auto rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.18)] border transition-all overflow-hidden relative ${
            fieldMode
              ? 'bg-zinc-950 border-amber-500/80 text-zinc-50'
              : 'bg-white border-slate-200/80 text-slate-900'
          }`}
        >
          {/* Bouton croix toujours fixe en haut à droite */}
          <button
            onClick={onClose}
            aria-label="Fermer la fiche"
            className={`absolute top-3 right-3 z-30 p-2 sm:p-2.5 rounded-full transition-all active:scale-95 shadow-md flex items-center justify-center ${
              fieldMode
                ? 'bg-zinc-900/95 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 backdrop-blur-md'
                : 'bg-white/95 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/90 backdrop-blur-md shadow-sm'
            }`}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top Handle bar for touch drag */}
          <div className="pt-3 pb-1.5 flex justify-center cursor-grab active:cursor-grabbing">
            <div className={`w-14 h-1.5 rounded-full transition-colors ${fieldMode ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-slate-300 hover:bg-slate-400'}`} />
          </div>

          <div className="p-4 sm:p-5 space-y-4 max-h-[82vh] overflow-y-auto">
            {/* Header Title & Badges */}
            <div className="space-y-2 pr-10">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  {/* GPS Indicator if currently inside */}
                  {isCurrentGpsParcel && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-extrabold tracking-wide uppercase animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      📍 Vous êtes dans cette parcelle
                    </div>
                  )}

                  {/* Manual override badge */}
                  {hasManualModifications && !isEditing && (
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-300 text-[10px] font-bold">
                      <span>✏️ Modifié manuellement</span>
                    </div>
                  )}

                  <h2 className={`text-xl sm:text-2xl font-black tracking-tight leading-tight ${
                    fieldMode ? 'text-zinc-100' : 'text-slate-900'
                  }`}>
                    {props.nom_parcelle || props.climat || props.nom_app}
                  </h2>
                  
                  <p className="text-sm font-bold text-amber-600 flex items-center gap-1.5">
                    <Wine className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>Appellation {props.nom_app || props.appellation}</span>
                  </p>
                </div>
              </div>

              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black uppercase border ${levelInfo.bg}`}>
                  <span className={`w-2 h-2 rounded-full ${levelInfo.dot}`} />
                  {levelInfo.text}
                </span>

                <span className={`px-2.5 py-1 rounded-xl border text-xs font-bold flex items-center gap-1 ${
                  fieldMode
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-300'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {props.commune || props.nom_commune}
                </span>

                {props.surface_ha && (
                  <span className={`px-2.5 py-1 rounded-xl border text-xs font-semibold ${
                    fieldMode
                      ? 'bg-zinc-800/80 border-zinc-700 text-zinc-400'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    {props.surface_ha} ha
                  </span>
                )}

                {(props.code_livret || props.code_parcel) && (
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold ${
                    fieldMode ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {props.code_livret || props.code_parcel}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons: Itinéraire, Centrer, Créer fiche domaine & Corriger à la main */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {googleMapsUrl && (
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex-1 min-w-[110px] h-11 py-2.5 px-3 rounded-2xl font-black text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] group ${
                    fieldMode
                      ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/20'
                      : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20'
                  }`}
                >
                  <Navigation className="w-3.5 h-3.5 fill-current group-hover:scale-110 transition-transform" />
                  <span>Itinéraire</span>
                </a>
              )}

              {onCenterOnParcel && (
                <button
                  type="button"
                  onClick={() => onCenterOnParcel(parcel)}
                  className={`h-11 px-3 rounded-2xl font-bold text-xs border flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] ${
                    fieldMode
                      ? 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-200'
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                  }`}
                  title="Recadrer la carte sur cette parcelle"
                >
                  <Compass className="w-3.5 h-3.5 text-amber-500" />
                  <span>Centrer</span>
                </button>
              )}

              {onOpenLivretExport && (
                <button
                  type="button"
                  onClick={() => onOpenLivretExport('atlas_illustre', parcel)}
                  className={`h-11 px-3 rounded-2xl font-bold text-xs border flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] ${
                    fieldMode
                      ? 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-amber-400'
                      : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900'
                  }`}
                  title="Imprimer ou exporter la fiche A4 / PDF illustrée"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-500" />
                  <span>Fiche A4</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className={`h-11 px-3.5 rounded-2xl font-bold text-xs border flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] ${
                  isEditing
                    ? 'bg-amber-500 border-amber-600 text-zinc-950 shadow-sm'
                    : fieldMode
                    ? 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-amber-400'
                    : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900'
                }`}
                title="Modifier les informations de la parcelle"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Fermer' : 'Modifier'}</span>
              </button>
            </div>

            {/* GPS Direct Field Guidance (Flèche d'orientation & Cap dans les chemins de vignes) */}
            {gpsVector && !isCurrentGpsParcel && (
              <div className={`p-3 rounded-2xl border flex items-center justify-between ${
                fieldMode ? 'bg-zinc-900/90 border-amber-500/30 text-zinc-200' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl bg-amber-500 text-zinc-950 flex items-center justify-center shadow-sm font-black transition-transform duration-300 shrink-0"
                    style={{ transform: `rotate(${gpsVector.bearing}deg)` }}
                    title={`Cap vers la parcelle : ${gpsVector.bearing}° (${gpsVector.directionText})`}
                  >
                    <ArrowUpRight className="w-6 h-6 stroke-[3]" />
                  </div>
                  <div>
                    <div className="text-xs font-black tracking-tight flex items-center gap-1.5">
                      <span>Direction {gpsVector.directionText}</span>
                      <span className="text-[10px] opacity-60 font-mono">({gpsVector.bearing}°)</span>
                    </div>
                    <div className="text-[11px] font-semibold text-amber-500">
                      À {gpsVector.distanceMeters >= 1000 ? `${(gpsVector.distanceMeters / 1000).toFixed(1)} km` : `${gpsVector.distanceMeters} m`} à vol d'oiseau
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Cap direct</span>
                </div>
              </div>
            )}

            {/* Vendanges : Suivi d'avancement & statut de coupe (pour les 156 parcelles du livret) */}
            {Boolean(
              props.is_vendange_livret || 
              props.page_livret || 
              props.code_livret || 
              props.secteur_livret || 
              (props.id && String(props.id).startsWith('leflaive-')) ||
              (props.code && LEFLAIVE_CATALOG_CODES.has(String(props.code).toUpperCase()))
            ) && (
              <div className={`p-4 rounded-2xl border space-y-3.5 shadow-sm ${
                fieldMode ? 'bg-zinc-900/95 border-amber-500/30' : 'bg-amber-50/50 border-amber-200/80'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                    <Wine className="w-4 h-4" />
                    <span>Suivi Vendanges • Livret (Page {props.page_livret || '—'})</span>
                  </span>
                  {props.harvest_date && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Fait le {props.harvest_date}
                    </span>
                  )}
                </div>

                {/* Status Segmented Buttons (1 touch) */}
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-zinc-950/80 border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => handleSetHarvestStatus('a_faire')}
                    className={`py-2.5 px-1 rounded-lg text-xs font-black flex flex-col items-center justify-center gap-1 transition-all ${
                      harvestStatus === 'a_faire'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                    }`}
                  >
                    <CircleDot className="w-4 h-4" />
                    <span>À faire</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetHarvestStatus('en_cours')}
                    className={`py-2.5 px-1 rounded-lg text-xs font-black flex flex-col items-center justify-center gap-1 transition-all ${
                      harvestStatus === 'en_cours'
                        ? 'bg-amber-500 text-zinc-950 shadow-md'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>En cours</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetHarvestStatus('vendange')}
                    className={`py-2.5 px-1 rounded-lg text-xs font-black flex flex-col items-center justify-center gap-1 transition-all ${
                      harvestStatus === 'vendange'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Vendangé</span>
                  </button>
                </div>

                {/* Section Saisie et Comptage Multi-Unités (Caisses, Hectolitres, Kilos) */}
                <div className="p-3 rounded-xl bg-zinc-950/90 border border-zinc-800/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-black text-amber-400">
                      <Wine className="w-4 h-4" />
                      <span>Volume & Récolte</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-semibold">
                      Caisses • Hectolitres • Kilos
                    </span>
                  </div>

                  {/* Unit Selector Tabs */}
                  <div className="grid grid-cols-3 gap-1 p-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-black">
                    <button
                      type="button"
                      onClick={() => setActiveUnitTab('caisses')}
                      className={`py-1.5 px-2 rounded-md flex items-center justify-center gap-1 transition-all ${
                        activeUnitTab === 'caisses'
                          ? 'bg-amber-500 text-zinc-950 shadow-sm'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>Caisses</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveUnitTab('hl')}
                      className={`py-1.5 px-2 rounded-md flex items-center justify-center gap-1 transition-all ${
                        activeUnitTab === 'hl'
                          ? 'bg-amber-500 text-zinc-950 shadow-sm'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Droplets className="w-3.5 h-3.5" />
                      <span>Hectolitres</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveUnitTab('kg')}
                      className={`py-1.5 px-2 rounded-md flex items-center justify-center gap-1 transition-all ${
                        activeUnitTab === 'kg'
                          ? 'bg-amber-500 text-zinc-950 shadow-sm'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>Kilos</span>
                    </button>
                  </div>

                  {/* Active Unit Input Controls */}
                  {activeUnitTab === 'caisses' && (
                    <div className="flex items-center justify-between gap-2 pt-1 animate-in fade-in duration-150">
                      {/* Decrement buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateCaisses(Math.max(0, (harvestCaisses || 0) - 5))}
                          className="h-10 px-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-300 font-black text-xs border border-zinc-700/60"
                          title="Retirer 5 caisses"
                        >
                          -5
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateCaisses(Math.max(0, (harvestCaisses || 0) - 1))}
                          className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-300 font-black text-sm border border-zinc-700/60"
                          title="Retirer 1 caisse"
                        >
                          -1
                        </button>
                      </div>

                      {/* Numeric Input & Display */}
                      <div className="flex items-center justify-center bg-zinc-900 border border-amber-500/40 rounded-xl px-3 py-1 min-w-[90px]">
                        <input
                          type="number"
                          min="0"
                          value={harvestCaisses ?? 0}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            handleUpdateCaisses(isNaN(val) ? 0 : Math.max(0, val));
                          }}
                          className="w-14 text-center font-black text-xl text-amber-400 font-mono bg-transparent outline-none"
                        />
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">c.</span>
                      </div>

                      {/* Increment buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateCaisses((harvestCaisses || 0) + 1)}
                          className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-200 font-black text-sm border border-zinc-700/60"
                          title="Ajouter 1 caisse"
                        >
                          +1
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateCaisses((harvestCaisses || 0) + 5)}
                          className="h-10 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-zinc-950 font-black text-xs shadow-md"
                          title="Ajouter 5 caisses"
                        >
                          +5
                        </button>
                      </div>
                    </div>
                  )}

                  {activeUnitTab === 'hl' && (
                    <div className="flex items-center justify-between gap-2 pt-1 animate-in fade-in duration-150">
                      {/* Decrement buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateHl(Math.max(0, (harvestHl || 0) - 2))}
                          className="h-10 px-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-300 font-black text-xs border border-zinc-700/60"
                          title="Retirer 2 hL"
                        >
                          -2
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateHl(Math.max(0, (harvestHl || 0) - 0.5))}
                          className="h-10 px-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-300 font-black text-xs border border-zinc-700/60"
                          title="Retirer 0.5 hL"
                        >
                          -0.5
                        </button>
                      </div>

                      {/* Numeric Input & Display */}
                      <div className="flex items-center justify-center bg-zinc-900 border border-amber-500/40 rounded-xl px-2.5 py-1 min-w-[95px]">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={harvestHl ?? 0}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            handleUpdateHl(isNaN(val) ? 0 : Math.max(0, val));
                          }}
                          className="w-14 text-center font-black text-xl text-amber-400 font-mono bg-transparent outline-none"
                        />
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">hL</span>
                      </div>

                      {/* Increment buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateHl((harvestHl || 0) + 0.5)}
                          className="h-10 px-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-200 font-black text-xs border border-zinc-700/60"
                          title="Ajouter 0.5 hL"
                        >
                          +0.5
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateHl((harvestHl || 0) + 2)}
                          className="h-10 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-zinc-950 font-black text-xs shadow-md"
                          title="Ajouter 2 hL"
                        >
                          +2
                        </button>
                      </div>
                    </div>
                  )}

                  {activeUnitTab === 'kg' && (
                    <div className="flex items-center justify-between gap-2 pt-1 animate-in fade-in duration-150">
                      {/* Decrement buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateKg(Math.max(0, (harvestKg || 0) - 100))}
                          className="h-10 px-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-300 font-black text-xs border border-zinc-700/60"
                          title="Retirer 100 kg"
                        >
                          -100
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateKg(Math.max(0, (harvestKg || 0) - 25))}
                          className="h-10 px-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-300 font-black text-xs border border-zinc-700/60"
                          title="Retirer 25 kg"
                        >
                          -25
                        </button>
                      </div>

                      {/* Numeric Input & Display */}
                      <div className="flex items-center justify-center bg-zinc-900 border border-amber-500/40 rounded-xl px-2.5 py-1 min-w-[100px]">
                        <input
                          type="number"
                          step="10"
                          min="0"
                          value={harvestKg ?? 0}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            handleUpdateKg(isNaN(val) ? 0 : Math.max(0, val));
                          }}
                          className="w-16 text-center font-black text-xl text-amber-400 font-mono bg-transparent outline-none"
                        />
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">kg</span>
                      </div>

                      {/* Increment buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateKg((harvestKg || 0) + 25)}
                          className="h-10 px-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-200 font-black text-xs border border-zinc-700/60"
                          title="Ajouter 25 kg"
                        >
                          +25
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateKg((harvestKg || 0) + 100)}
                          className="h-10 px-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-zinc-950 font-black text-xs shadow-md"
                          title="Ajouter 100 kg"
                        >
                          +100
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Summary of all entered quantities */}
                  {(Boolean(harvestCaisses) || Boolean(harvestHl) || Boolean(harvestKg)) && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-zinc-800/80">
                      <span className="text-[10px] font-bold text-zinc-400">Total renseigné :</span>
                      {Boolean(harvestCaisses) && (
                        <span 
                          onClick={() => setActiveUnitTab('caisses')}
                          className="cursor-pointer px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold"
                        >
                          📦 {harvestCaisses} c.
                        </span>
                      )}
                      {Boolean(harvestHl) && (
                        <span 
                          onClick={() => setActiveUnitTab('hl')}
                          className="cursor-pointer px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[11px] font-bold"
                        >
                          🍷 {harvestHl} hL
                        </span>
                      )}
                      {Boolean(harvestKg) && (
                        <span 
                          onClick={() => setActiveUnitTab('kg')}
                          className="cursor-pointer px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold"
                        >
                          ⚖️ {harvestKg.toLocaleString('fr-FR')} kg
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* FORMULAIRE DE CORRECTION MANUELLE */}
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-4 rounded-3xl border space-y-3.5 ${
                  fieldMode
                    ? 'bg-zinc-900/90 border-amber-500/40 text-zinc-100'
                    : 'bg-amber-50/80 border-amber-300 text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between pb-1 border-b border-amber-500/20">
                  <span className="text-xs font-black text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5" /> Correction manuelle de la fiche
                  </span>
                  {hasManualModifications && (
                    <button
                      type="button"
                      onClick={handleResetToDefault}
                      className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Rétablir d'origine
                    </button>
                  )}
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-0.5">
                      Nom de la parcelle / Climat
                    </label>
                    <input
                      type="text"
                      value={formData.nom_parcelle}
                      onChange={(e) => setFormData({ ...formData, nom_parcelle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-0.5">
                        Appellation
                      </label>
                      <input
                        type="text"
                        value={formData.nom_app}
                        onChange={(e) => setFormData({ ...formData, nom_app: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-0.5">
                        Commune
                      </label>
                      <input
                        type="text"
                        value={formData.commune}
                        onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-zinc-400 mb-0.5">
                        Code Livret
                      </label>
                      <input
                        type="text"
                        value={formData.code_livret}
                        onChange={(e) => setFormData({ ...formData, code_livret: e.target.value })}
                        className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono font-bold uppercase focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-zinc-400 mb-0.5">
                        N° Livret / Carte
                      </label>
                      <input
                        type="text"
                        value={formData.numero_livret}
                        onChange={(e) => setFormData({ ...formData, numero_livret: e.target.value })}
                        className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 dark:text-zinc-400 mb-0.5">
                        Nb Rangs
                      </label>
                      <input
                        type="text"
                        value={formData.nb_rangs_details}
                        onChange={(e) => setFormData({ ...formData, nb_rangs_details: e.target.value })}
                        className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-0.5">
                        Apporteur / Vigneron
                      </label>
                      <input
                        type="text"
                        value={formData.proprietaire}
                        onChange={(e) => setFormData({ ...formData, proprietaire: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-0.5">
                        Cépage
                      </label>
                      <input
                        type="text"
                        value={formData.cepage}
                        onChange={(e) => setFormData({ ...formData, cepage: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-0.5">
                      Notes & Observations de terrain
                    </label>
                    <textarea
                      rows={2}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSaveAll}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-transform active:scale-95"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Enregistrer pour l'équipe</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-zinc-700 bg-transparent text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </motion.div>
            )}

            {/* Fiche Vendanges / Domaine Information Block */}
            {(props.code_livret || props.numero_livret || props.nb_rangs_details || props.proprietaire || props.cepage || props.secteur_livret) && (
              <div className={`p-4 rounded-2xl border space-y-3 ${
                fieldMode
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-200'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-zinc-800">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-500">
                    Fiche Domaine
                  </span>
                  {props.secteur_livret && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                      Secteur : {props.secteur_livret}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  {props.code_livret && (
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-semibold">Code Livret</span>
                      <span className="font-mono font-bold text-sm text-amber-600">{props.code_livret}</span>
                    </div>
                  )}

                  {props.numero_livret && (
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-semibold">Numéro</span>
                      <span className="font-bold text-sm">{props.numero_livret}</span>
                    </div>
                  )}

                  {props.nb_rangs_details && (
                    <div className="col-span-2">
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-semibold">Configuration des rangs</span>
                      <span className="font-semibold text-emerald-800 dark:text-emerald-300">{props.nb_rangs_details}</span>
                    </div>
                  )}

                  {props.cepage && (
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-semibold">Cépage</span>
                      <span className="font-bold">{props.cepage}</span>
                    </div>
                  )}

                  {props.proprietaire && (
                    <div className="col-span-2">
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-semibold">Apporteur / Propriétaire</span>
                      <span className="font-bold text-amber-800 dark:text-amber-300">{props.proprietaire}</span>
                    </div>
                  )}

                  {props.notes_acces && (
                    <div className="col-span-2 p-2 rounded-xl bg-amber-100/50 dark:bg-amber-950/40 text-[11px] text-amber-900 dark:text-amber-200 font-medium">
                      ⚠️ <strong>Consigne d'accès :</strong> {props.notes_acces}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Visual Plan & Zoom from Livret */}
            {props.page_livret && (
              <LivretPlanViewer
                pageLivret={props.page_livret}
                commune={props.commune || props.nom_commune}
                nomParcelle={props.nom_parcelle || props.climat}
                carteAnnotee={props.carte_annotee}
                diapositive={props.diapositive}
                pinXPct={props.pin_x_pct}
                pinYPct={props.pin_y_pct}
                numeroSurCarte={props.numero_sur_carte || props.numero_livret}
                fieldMode={fieldMode}
              />
            )}

            {/* Custom Photo Uploaded by user / team */}
            {props.photo_url && (
              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Photo satellite / Plan d'ensemble
                </span>
                <div className="rounded-xl overflow-hidden border border-zinc-800 cursor-pointer" onClick={() => setActiveLightboxPhoto({ id: 'main', url: props.photo_url!, caption: 'Photo d\'ensemble' })}>
                  <img
                    src={props.photo_url}
                    alt={props.nom_parcelle || 'Photo parcelle'}
                    className="w-full h-auto max-h-64 object-cover"
                  />
                </div>
              </div>
            )}

            {/* COMPLÉMENTS VISUELS & PHOTOS DE TERRAIN (Rangs, Repères, Délimitations) */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" /> Photos de terrain & Délimitations
                </span>
                <span className="text-[10px] font-bold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full">
                  {photosList.length} photo(s)
                </span>
              </div>

              {/* Photos Gallery */}
              {photosList.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {photosList.map((photo) => (
                    <div
                      key={photo.id}
                      className="relative rounded-xl overflow-hidden border border-zinc-700 bg-black group cursor-pointer"
                      onClick={() => setActiveLightboxPhoto(photo)}
                    >
                      <img src={photo.url} alt={photo.caption || 'Photo'} className="w-full h-28 object-cover" />
                      <div className="p-1.5 bg-zinc-950/90 text-[10px] font-medium text-zinc-200 truncate">
                        {photo.caption || 'Photo de terrain'}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePhoto(photo.id);
                        }}
                        className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-rose-600/90 text-white hover:bg-rose-700 transition-colors shadow-md"
                        title="Supprimer la photo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-400 italic">
                  Aucune photo de terrain ajoutée. Vous pouvez ajouter une photo d'un rang, piquet ou repère pour guider l'équipe.
                </p>
              )}

              {/* Add photo trigger & input */}
              {isAddingPhoto ? (
                <div className="p-2.5 rounded-xl bg-zinc-950 border border-amber-500/40 space-y-2">
                  <input
                    type="text"
                    value={newPhotoCaption}
                    onChange={(e) => setNewPhotoCaption(e.target.value)}
                    placeholder="Légende (ex: Délimitation rangée 14, Piquet nord...)"
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-2 px-3 rounded-lg bg-amber-500 text-zinc-950 text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Prendre / Choisir photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingPhoto(false)}
                      className="py-2 px-3 rounded-lg border border-zinc-700 text-zinc-300 text-xs font-bold"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingPhoto(true)}
                  className="w-full py-2.5 px-3 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <PlusCircle className="w-4 h-4 text-amber-400" />
                  <span>Ajouter une photo (rangée, repère, accès)</span>
                </button>
              )}
            </div>

            {/* Optional Notes */}
            {props.notes && !isEditing && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-zinc-900 border border-amber-200/80 dark:border-zinc-800 space-y-1">
                <span className="text-[11px] font-black text-amber-800 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> Notes & Renseignements
                </span>
                <p className="text-xs text-amber-950 dark:text-zinc-200 font-medium leading-relaxed italic">{props.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Fullscreen Photo Lightbox Modal */}
        {activeLightboxPhoto && (
          <div className="fixed inset-0 z-[3000] bg-black/95 flex flex-col items-center justify-center p-4">
            <button
              onClick={() => setActiveLightboxPhoto(null)}
              className="absolute top-4 right-4 p-3 rounded-full bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="max-w-3xl max-h-[80vh] overflow-hidden rounded-2xl border border-zinc-700">
              <img
                src={activeLightboxPhoto.url}
                alt={activeLightboxPhoto.caption || 'Aperçu'}
                className="w-full h-auto max-h-[75vh] object-contain"
              />
            </div>
            {activeLightboxPhoto.caption && (
              <div className="mt-3 text-center px-4 py-2 rounded-xl bg-zinc-900/90 border border-zinc-700 text-sm font-bold text-amber-300">
                {activeLightboxPhoto.caption}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
