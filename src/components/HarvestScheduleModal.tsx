import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  X, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Wine, 
  Plus, 
  Trash2, 
  ChevronRight, 
  CalendarDays, 
  Layers, 
  ArrowRight,
  Sparkles,
  AlertCircle,
  Share2,
  Copy,
  Check,
  FileSpreadsheet,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { ParcelFeature, ParcelProperties } from '../types';
import { dataManager } from '../services/DataManager';

interface HarvestScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  parcels: ParcelFeature[];
  onSelectParcel: (parcel: ParcelFeature) => void;
  onUpdateParcel: (parcelId: string, updates: Partial<ParcelProperties>) => void;
  fieldMode?: boolean;
}

export const HarvestScheduleModal: React.FC<HarvestScheduleModalProps> = ({
  isOpen,
  onClose,
  parcels,
  onSelectParcel,
  onUpdateParcel,
  fieldMode = false
}) => {
  // Current date formatting for defaults (YYYY-MM-DD)
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [isAddingParcel, setIsAddingParcel] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [copiedDayToast, setCopiedDayToast] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [activeUnitMode, setActiveUnitMode] = useState<'caisses' | 'hl' | 'kg'>('caisses');

  // Group all scheduled parcels by date
  const scheduleByDate = useMemo(() => {
    const map: Record<string, ParcelFeature[]> = {};
    parcels.forEach((p) => {
      const d = p.properties.harvest_scheduled_date;
      if (d) {
        if (!map[d]) map[d] = [];
        map[d].push(p);
      }
    });

    // Sort parcels within each date by order or name
    Object.keys(map).forEach((d) => {
      map[d].sort((a, b) => {
        const orderA = a.properties.harvest_scheduled_order ?? 999;
        const orderB = b.properties.harvest_scheduled_order ?? 999;
        return orderA - orderB;
      });
    });

    return map;
  }, [parcels]);

  // List of distinct dates with planning, sorted chronologically
  const availableDates = useMemo(() => {
    const set = new Set(Object.keys(scheduleByDate));
    set.add(todayStr);
    return Array.from(set).sort();
  }, [scheduleByDate, todayStr]);

  // Parcels for currently selected day
  const parcelsForSelectedDate = useMemo(() => {
    return scheduleByDate[selectedDate] || [];
  }, [scheduleByDate, selectedDate]);

  // Daily subtotals and stats for the selected date
  const dayStats = useMemo(() => {
    const total = parcelsForSelectedDate.length;
    let vendangeCount = 0;
    let enCoursCount = 0;
    let aFaireCount = 0;
    let totalCaisses = 0;
    let totalHl = 0;
    let totalKg = 0;

    parcelsForSelectedDate.forEach((p) => {
      const st = p.properties.harvest_status || 'a_faire';
      if (st === 'vendange') vendangeCount++;
      else if (st === 'en_cours') enCoursCount++;
      else aFaireCount++;

      totalCaisses += p.properties.harvest_caisses || 0;
      totalHl += p.properties.harvest_hl || 0;
      totalKg += p.properties.harvest_kg || 0;
    });

    const percentDone = total > 0 ? Math.round((vendangeCount / total) * 100) : 0;
    const percentInProgress = total > 0 ? Math.round((enCoursCount / total) * 100) : 0;

    return {
      total,
      vendangeCount,
      enCoursCount,
      aFaireCount,
      totalCaisses,
      totalHl: parseFloat(totalHl.toFixed(2)),
      totalKg,
      percentDone,
      percentInProgress
    };
  }, [parcelsForSelectedDate]);

  // Overall Campaign Stats (across all 156 parcels of the estate)
  const globalStats = useMemo(() => {
    const total = parcels.length;
    let vendangeCount = 0;
    let enCoursCount = 0;
    let aFaireCount = 0;
    let totalCaisses = 0;
    let totalHl = 0;
    let totalKg = 0;

    parcels.forEach((p) => {
      const st = p.properties.harvest_status || 'a_faire';
      if (st === 'vendange') vendangeCount++;
      else if (st === 'en_cours') enCoursCount++;
      else aFaireCount++;

      totalCaisses += p.properties.harvest_caisses || 0;
      totalHl += p.properties.harvest_hl || 0;
      totalKg += p.properties.harvest_kg || 0;
    });

    const percentDone = total > 0 ? Math.round((vendangeCount / total) * 100) : 0;
    const percentInProgress = total > 0 ? Math.round((enCoursCount / total) * 100) : 0;

    return {
      total,
      vendangeCount,
      enCoursCount,
      aFaireCount,
      totalCaisses,
      totalHl: parseFloat(totalHl.toFixed(2)),
      totalKg,
      percentDone,
      percentInProgress
    };
  }, [parcels]);

  // Parcels available to add to selected day (not already on this day)
  const candidateParcels = useMemo(() => {
    const currentDayIds = new Set(parcelsForSelectedDate.map((p) => p.id || p.properties.id));
    return parcels.filter((p) => {
      const pid = p.id || p.properties.id;
      if (currentDayIds.has(pid)) return false;
      if (!searchFilter.trim()) return true;
      const query = searchFilter.toLowerCase();
      const name = (p.properties.nom_parcelle || p.properties.nom_climat || p.properties.climat || '').toLowerCase();
      const code = (p.properties.code || '').toLowerCase();
      const commune = (p.properties.commune || '').toLowerCase();
      const app = (p.properties.nom_app || p.properties.appellation || '').toLowerCase();
      return name.includes(query) || code.includes(query) || commune.includes(query) || app.includes(query);
    });
  }, [parcels, parcelsForSelectedDate, searchFilter]);

  if (!isOpen) return null;

  const handleScheduleParcel = (parcel: ParcelFeature) => {
    const pid = parcel.id || parcel.properties.id;
    if (!pid) return;
    const nextOrder = parcelsForSelectedDate.length + 1;
    const updates: Partial<ParcelProperties> = {
      harvest_scheduled_date: selectedDate,
      harvest_scheduled_order: nextOrder,
      harvest_status: parcel.properties.harvest_status || 'a_faire'
    };
    onUpdateParcel(pid, updates);
    dataManager.updateParcelProperties(pid, updates);
  };

  const handleRemoveFromSchedule = (parcel: ParcelFeature, e: React.MouseEvent) => {
    e.stopPropagation();
    const pid = parcel.id || parcel.properties.id;
    if (!pid) return;
    const updates: Partial<ParcelProperties> = {
      harvest_scheduled_date: undefined,
      harvest_scheduled_order: undefined
    };
    onUpdateParcel(pid, updates);
    dataManager.updateParcelProperties(pid, updates);
  };

  const handleMoveOrder = (index: number, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= parcelsForSelectedDate.length) return;

    const currentParcel = parcelsForSelectedDate[index];
    const targetParcel = parcelsForSelectedDate[targetIndex];

    const currentPid = currentParcel.id || currentParcel.properties.id;
    const targetPid = targetParcel.id || targetParcel.properties.id;

    if (!currentPid || !targetPid) return;

    const orderCurrent = targetIndex + 1;
    const orderTarget = index + 1;

    onUpdateParcel(currentPid, { harvest_scheduled_order: orderCurrent });
    dataManager.updateParcelProperties(currentPid, { harvest_scheduled_order: orderCurrent });

    onUpdateParcel(targetPid, { harvest_scheduled_order: orderTarget });
    dataManager.updateParcelProperties(targetPid, { harvest_scheduled_order: orderTarget });
  };

  const handleQuickStatus = (parcel: ParcelFeature, status: 'a_faire' | 'en_cours' | 'vendange', e: React.MouseEvent) => {
    e.stopPropagation();
    const pid = parcel.id || parcel.properties.id;
    if (!pid) return;
    const updates: Partial<ParcelProperties> = {
      harvest_status: status
    };
    if (status === 'vendange') {
      updates.harvest_date = parcel.properties.harvest_date || new Date().toLocaleDateString('fr-FR');
    } else if (parcel.properties.harvest_date) {
      updates.harvest_date = parcel.properties.harvest_date;
    }
    onUpdateParcel(pid, updates);
    dataManager.updateParcelProperties(pid, updates);
  };

  const handleQuickCaisses = (parcel: ParcelFeature, delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const pid = parcel.id || parcel.properties.id;
    if (!pid) return;
    const current = parcel.properties.harvest_caisses || 0;
    const nextVal = Math.max(0, current + delta);
    const updates: Partial<ParcelProperties> = {
      harvest_caisses: nextVal,
      harvest_status: nextVal > 0 && parcel.properties.harvest_status === 'a_faire' ? 'en_cours' : parcel.properties.harvest_status
    };
    onUpdateParcel(pid, updates);
    dataManager.updateParcelProperties(pid, updates);
  };

  const handleQuickHl = (parcel: ParcelFeature, delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const pid = parcel.id || parcel.properties.id;
    if (!pid) return;
    const current = parcel.properties.harvest_hl || 0;
    const nextVal = Math.max(0, parseFloat((current + delta).toFixed(2)));
    const updates: Partial<ParcelProperties> = {
      harvest_hl: nextVal,
      harvest_status: nextVal > 0 && parcel.properties.harvest_status === 'a_faire' ? 'en_cours' : parcel.properties.harvest_status
    };
    onUpdateParcel(pid, updates);
    dataManager.updateParcelProperties(pid, updates);
  };

  const handleQuickKg = (parcel: ParcelFeature, delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const pid = parcel.id || parcel.properties.id;
    if (!pid) return;
    const current = parcel.properties.harvest_kg || 0;
    const nextVal = Math.max(0, Math.round(current + delta));
    const updates: Partial<ParcelProperties> = {
      harvest_kg: nextVal,
      harvest_status: nextVal > 0 && parcel.properties.harvest_status === 'a_faire' ? 'en_cours' : parcel.properties.harvest_status
    };
    onUpdateParcel(pid, updates);
    dataManager.updateParcelProperties(pid, updates);
  };

  const formatDateLabel = (dateStr: string) => {
    if (dateStr === todayStr) return "Aujourd'hui";
    try {
      const parts = dateStr.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  const generateDaySummaryText = () => {
    const formattedDate = formatDateLabel(selectedDate);
    const dateParcels = parcelsForSelectedDate;
    const doneParcels = dateParcels.filter((p) => p.properties.harvest_status === 'vendange');
    const inProgressParcels = dateParcels.filter((p) => p.properties.harvest_status === 'en_cours');
    const todoParcels = dateParcels.filter((p) => !p.properties.harvest_status || p.properties.harvest_status === 'a_faire');
    
    const totalCaissesDay = dateParcels.reduce((sum, p) => sum + (p.properties.harvest_caisses || 0), 0);
    const totalHlDay = dateParcels.reduce((sum, p) => sum + (p.properties.harvest_hl || 0), 0);
    const totalKgDay = dateParcels.reduce((sum, p) => sum + (p.properties.harvest_kg || 0), 0);

    let text = `🍇 BILAN DES VENDANGES • DOMAINE LEFLAIVE\n`;
    text += `📅 Date du relevé : ${formattedDate} (${selectedDate})\n`;
    text += `════════════════════════════════════\n\n`;

    // ──────────────────────────────────────────
    // BLOC 1 : LA JOURNÉE
    // ──────────────────────────────────────────
    text += `📌 [1] BILAN DE LA JOURNÉE (${formattedDate.toUpperCase()})\n`;
    text += `────────────────────────────────────\n`;
    text += `• Circuit du jour : ${dayStats.total} parcelle${dayStats.total > 1 ? 's' : ''} au planning\n`;
    text += `• Avancement du jour : ${dayStats.percentDone}% réalisé (${doneParcels.length} vendangée${doneParcels.length > 1 ? 's' : ''} / ${inProgressParcels.length} en cours / ${todoParcels.length} à faire)\n`;

    const volDaySummary: string[] = [];
    if (totalCaissesDay > 0) volDaySummary.push(`${totalCaissesDay} caisses`);
    if (totalHlDay > 0) volDaySummary.push(`${parseFloat(totalHlDay.toFixed(2))} hL`);
    if (totalKgDay > 0) volDaySummary.push(`${totalKgDay.toLocaleString('fr-FR')} kg`);
    
    if (volDaySummary.length > 0) {
      text += `• Récolté CE JOUR : ${volDaySummary.join(' • ')}\n\n`;
    } else {
      text += `• Récolté CE JOUR : ${totalCaissesDay} caisse\n\n`;
    }

    // DÉTAIL DU CIRCUIT DU JOUR
    if (doneParcels.length > 0) {
      text += `✅ PARCELLES DU JOUR TERMINÉES (${doneParcels.length}) :\n`;
      doneParcels.forEach((p) => {
        const name = p.properties.nom_climat || p.properties.climat || p.properties.nom_parcelle || 'Parcelle';
        const code = p.properties.code || p.properties.code_livret ? ` [${p.properties.code || p.properties.code_livret}]` : '';
        const page = p.properties.page_livret ? ` (p.${p.properties.page_livret})` : '';
        const qParts: string[] = [];
        if (p.properties.harvest_caisses) qParts.push(`${p.properties.harvest_caisses} c.`);
        if (p.properties.harvest_hl) qParts.push(`${p.properties.harvest_hl} hL`);
        if (p.properties.harvest_kg) qParts.push(`${p.properties.harvest_kg} kg`);
        const qStr = qParts.length > 0 ? qParts.join(' • ') : `${p.properties.harvest_caisses || 0} caisses`;
        text += `  ✓ ${name}${code}${page} : ${qStr}\n`;
      });
      text += `\n`;
    }

    if (inProgressParcels.length > 0) {
      text += `⏳ PARCELLES DU JOUR EN COURS (${inProgressParcels.length}) :\n`;
      inProgressParcels.forEach((p) => {
        const name = p.properties.nom_climat || p.properties.climat || p.properties.nom_parcelle || 'Parcelle';
        const code = p.properties.code || p.properties.code_livret ? ` [${p.properties.code || p.properties.code_livret}]` : '';
        const page = p.properties.page_livret ? ` (p.${p.properties.page_livret})` : '';
        const qParts: string[] = [];
        if (p.properties.harvest_caisses) qParts.push(`${p.properties.harvest_caisses} c.`);
        if (p.properties.harvest_hl) qParts.push(`${p.properties.harvest_hl} hL`);
        if (p.properties.harvest_kg) qParts.push(`${p.properties.harvest_kg} kg`);
        const qStr = qParts.length > 0 ? qParts.join(' • ') : 'En cours';
        text += `  ⏳ ${name}${code}${page} : ${qStr}\n`;
      });
      text += `\n`;
    }

    if (todoParcels.length > 0) {
      text += `📋 PARCELLES DU JOUR RESTANTES (${todoParcels.length}) :\n`;
      todoParcels.forEach((p) => {
        const name = p.properties.nom_climat || p.properties.climat || p.properties.nom_parcelle || 'Parcelle';
        const code = p.properties.code || p.properties.code_livret ? ` [${p.properties.code || p.properties.code_livret}]` : '';
        const page = p.properties.page_livret ? ` (p.${p.properties.page_livret})` : '';
        text += `  • ${name}${code}${page}\n`;
      });
      text += `\n`;
    }

    // ──────────────────────────────────────────
    // BLOC 2 : AVANCEMENT GLOBAL DU DOMAINE (CUMUL)
    // ──────────────────────────────────────────
    text += `════════════════════════════════════\n`;
    text += `🌐 [2] AVANCEMENT GLOBAL DU DOMAINE (CUMUL CAMPAGNE)\n`;
    text += `────────────────────────────────────\n`;
    text += `• Total Domaine : ${globalStats.total} parcelles cataloguées\n`;
    text += `• Vendangées au total : ${globalStats.vendangeCount} / ${globalStats.total} (${globalStats.percentDone}% du domaine)\n`;
    text += `• En cours de récolte : ${globalStats.enCoursCount} parcelle${globalStats.enCoursCount > 1 ? 's' : ''}\n`;
    text += `• Restantes à vendanger : ${globalStats.aFaireCount} parcelle${globalStats.aFaireCount > 1 ? 's' : ''}\n`;

    const volGlobal: string[] = [];
    if (globalStats.totalCaisses > 0) volGlobal.push(`${globalStats.totalCaisses} caisses`);
    if (globalStats.totalHl > 0) volGlobal.push(`${globalStats.totalHl} hL`);
    if (globalStats.totalKg > 0) volGlobal.push(`${globalStats.totalKg.toLocaleString('fr-FR')} kg`);
    if (volGlobal.length > 0) {
      text += `• Total récolté CUMULÉ (depuis début) : ${volGlobal.join(' • ')}\n`;
    }
    text += `\n📲 Relevé exporté via Livret Parcellaire Leflaive`;
    return text;
  };

  const copyTextToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (err) {
      console.warn('Navigator clipboard failed, falling back to execCommand', err);
    }

    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      console.error('Fallback clipboard copy failed:', err);
      return false;
    }
  };

  const handleShareOrCopy = async () => {
    const text = generateDaySummaryText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Bilan Vendanges - ${selectedDate}`,
          text: text
        });
        return;
      } catch (e) {
        // Fallback to copy
      }
    }
    await copyTextToClipboard(text);
    setCopiedDayToast(true);
    setTimeout(() => setCopiedDayToast(false), 2500);
  };

  const handleExportCSV = () => {
    const headers = ['Code', 'Climat', 'Appellation', 'Page Livret', 'Statut', 'Caisses', 'Hectolitres_hL', 'Kilos_kg', 'Date Récolte'];
    const rows = parcelsForSelectedDate.map((p) => [
      `"${p.properties.code || p.properties.code_parcel || ''}"`,
      `"${p.properties.nom_climat || p.properties.climat || p.properties.nom_parcelle || ''}"`,
      `"${p.properties.nom_app || p.properties.appellation || ''}"`,
      `"${p.properties.page_livret || ''}"`,
      `"${p.properties.harvest_status || 'a_faire'}"`,
      p.properties.harvest_caisses || 0,
      p.properties.harvest_hl || '',
      p.properties.harvest_kg || '',
      `"${p.properties.harvest_date || selectedDate}"`
    ]);
    const csvContent = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bilan_vendanges_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[1050] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl max-h-[94vh] sm:max-h-[88vh] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl border bg-zinc-950 border-zinc-800 text-zinc-100"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-zinc-950 flex items-center justify-center font-black shadow-md shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-zinc-100 flex items-center gap-2">
                <span>Calendrier des Vendanges</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
                  Livret (156)
                </span>
              </h2>
              <p className="text-xs text-zinc-400 font-medium">
                Circuit de coupe journalier & avancement
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowExportModal(true)}
              className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-md shrink-0"
              title="Exporter ou partager le bilan de la journée"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Bilan du jour</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition-transform active:scale-95 shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Date Selector Pills Bar */}
        <div className="p-3 border-b border-zinc-800 bg-zinc-900/50 overflow-x-auto flex items-center gap-2 shrink-0 no-scrollbar">
          {availableDates.map((dateStr) => {
            const count = (scheduleByDate[dateStr] || []).length;
            const isSelected = selectedDate === dateStr;
            return (
              <button
                key={dateStr}
                onClick={() => {
                  setSelectedDate(dateStr);
                  setIsAddingParcel(false);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-black shrink-0 transition-all flex items-center gap-2 active:scale-95 ${
                  isSelected
                    ? 'bg-amber-500 text-zinc-950 shadow-md scale-[1.02]'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                }`}
              >
                <span>{formatDateLabel(dateStr)}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-zinc-950/30 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              if (e.target.value) {
                setSelectedDate(e.target.value);
                setIsAddingParcel(false);
              }
            }}
            className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-zinc-900 border border-zinc-700 text-zinc-200 outline-none cursor-pointer hover:border-zinc-500"
            title="Choisir une autre date"
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5">
          
          {/* Sous-totaux et progression du jour */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                  Sous-totaux • {formatDateLabel(selectedDate)}
                </span>
                <span className="text-xs font-bold text-zinc-400">
                  ({dayStats.total} parcelle{dayStats.total > 1 ? 's' : ''})
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="text-emerald-400 font-mono">{dayStats.vendangeCount} faites</span>
                <span className="text-zinc-600">•</span>
                <span className="text-amber-400 font-mono">{dayStats.enCoursCount} en cours</span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-400 font-mono">{dayStats.percentDone}%</span>
              </div>
            </div>

            {/* Barre de progression de la journée */}
            <div className="w-full h-2 rounded-full bg-zinc-950 overflow-hidden flex border border-zinc-800/80">
              <div 
                className="bg-emerald-500 transition-all duration-300"
                style={{ width: `${dayStats.percentDone}%` }}
                title={`${dayStats.vendangeCount} vendangées (${dayStats.percentDone}%)`}
              />
              <div 
                className="bg-amber-500 transition-all duration-300"
                style={{ width: `${dayStats.percentInProgress}%` }}
                title={`${dayStats.enCoursCount} en cours (${dayStats.percentInProgress}%)`}
              />
            </div>

            {/* Badges des sous-totaux récoltés du jour */}
            <div className="grid grid-cols-3 gap-2 pt-0.5">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-center">
                <div className="text-xs sm:text-sm font-black text-amber-300 font-mono">
                  {dayStats.totalCaisses}
                </div>
                <div className="text-[9px] font-black text-amber-400 uppercase tracking-tight flex items-center justify-center gap-1">
                  <span>📦</span>
                  <span>Caisses</span>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/25 text-center">
                <div className="text-xs sm:text-sm font-black text-purple-300 font-mono">
                  {dayStats.totalHl}
                </div>
                <div className="text-[9px] font-black text-purple-400 uppercase tracking-tight flex items-center justify-center gap-1">
                  <span>🍷</span>
                  <span>Hectolitres</span>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-center">
                <div className="text-xs sm:text-sm font-black text-emerald-300 font-mono truncate">
                  {dayStats.totalKg.toLocaleString('fr-FR')}
                </div>
                <div className="text-[9px] font-black text-emerald-400 uppercase tracking-tight flex items-center justify-center gap-1">
                  <span>⚖️</span>
                  <span>Kilos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Bar: Add Parcel Button & Quick Unit Selector */}
          <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
                Ordre de passage
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Unit selector for quick edit on rows */}
              <div className="flex items-center gap-1 p-0.5 rounded-xl bg-zinc-900 border border-zinc-800">
                <button
                  onClick={() => setActiveUnitMode('caisses')}
                  className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                    activeUnitMode === 'caisses'
                      ? 'bg-amber-500 text-zinc-950 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Ajuster en Caisses"
                >
                  📦 Caisses
                </button>
                <button
                  onClick={() => setActiveUnitMode('hl')}
                  className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                    activeUnitMode === 'hl'
                      ? 'bg-purple-500 text-zinc-950 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Ajuster en Hectolitres"
                >
                  🍷 hL
                </button>
                <button
                  onClick={() => setActiveUnitMode('kg')}
                  className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                    activeUnitMode === 'kg'
                      ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Ajuster en Kilos"
                >
                  ⚖️ kg
                </button>
              </div>

              <button
                onClick={() => setIsAddingParcel(!isAddingParcel)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm active:scale-95 shrink-0 ${
                  isAddingParcel
                    ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                    : 'bg-amber-500 text-zinc-950 hover:bg-amber-400'
                }`}
              >
                {isAddingParcel ? (
                  <>
                    <X className="w-3.5 h-3.5" />
                    <span>Fermer</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>+ Ajouter</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Add Parcel Drawer / Search Panel */}
          <AnimatePresence>
            {isAddingParcel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3.5 rounded-2xl bg-zinc-900 border border-amber-500/40 space-y-3 shadow-xl overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-400">
                    Sélectionner une parcelle à planifier le {formatDateLabel(selectedDate)}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {candidateParcels.length} disponible(s)
                  </span>
                </div>

                <input
                  type="text"
                  placeholder="Rechercher climat, code, commune..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-zinc-100 placeholder-zinc-500 focus:border-amber-500 outline-none"
                  autoFocus
                />

                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {candidateParcels.slice(0, 20).map((cp) => {
                    const name = cp.properties.nom_parcelle || cp.properties.nom_climat || cp.properties.climat || 'Parcelle';
                    return (
                      <div
                        key={cp.id || cp.properties.id}
                        className="p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800/90 border border-zinc-800 flex items-center justify-between gap-2 transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            {cp.properties.code && (
                              <span className="px-1.5 py-0.2 rounded font-mono font-black text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                {cp.properties.code}
                              </span>
                            )}
                            <span className="text-xs font-bold text-zinc-200 truncate">
                              {name}
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-400">
                            {cp.properties.commune || 'Bourgogne'} • {cp.properties.niveau || 'Appellation'}
                          </span>
                        </div>

                        <button
                          onClick={() => handleScheduleParcel(cp)}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black flex items-center gap-1 shrink-0 active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Planifier</span>
                        </button>
                      </div>
                    );
                  })}
                  {candidateParcels.length === 0 && (
                    <div className="text-center py-4 text-xs text-zinc-500">
                      Aucune parcelle correspondante trouvée.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* List of Scheduled Parcels for the Day */}
          {parcelsForSelectedDate.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 space-y-2">
              <CalendarIcon className="w-8 h-8 mx-auto text-zinc-600" />
              <div className="text-sm font-bold text-zinc-300">
                Aucune parcelle planifiée pour cette journée
              </div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Cliquez sur « + Ajouter » ci-dessus pour définir le circuit de coupe de l'équipe.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {parcelsForSelectedDate.map((parcel, index) => {
                const name = parcel.properties.nom_parcelle || parcel.properties.nom_climat || parcel.properties.climat || 'Parcelle';
                const status = parcel.properties.harvest_status || 'a_faire';
                const caisses = parcel.properties.harvest_caisses || 0;
                const hl = parcel.properties.harvest_hl || 0;
                const kg = parcel.properties.harvest_kg || 0;

                const isFirst = index === 0;
                const isLast = index === parcelsForSelectedDate.length - 1;

                return (
                  <div
                    key={parcel.id || parcel.properties.id}
                    onClick={() => {
                      onSelectParcel(parcel);
                      onClose();
                    }}
                    className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all active:scale-[0.99] ${
                      status === 'vendange'
                        ? 'bg-zinc-900/90 border-emerald-500/50 hover:border-emerald-400'
                        : status === 'en_cours'
                        ? 'bg-zinc-900/90 border-amber-500/50 hover:border-amber-400'
                        : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Step Number Badge + Re-order buttons */}
                      <div className="flex flex-col items-center gap-0.5 shrink-0">
                        <button
                          onClick={(e) => handleMoveOrder(index, 'up', e)}
                          disabled={isFirst}
                          className={`w-6 h-4 rounded flex items-center justify-center transition-colors ${
                            isFirst 
                              ? 'text-zinc-700 cursor-not-allowed' 
                              : 'text-zinc-400 hover:text-amber-400 hover:bg-zinc-800'
                          }`}
                          title="Déplacer vers le haut dans l'ordre"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                          status === 'vendange'
                            ? 'bg-emerald-500 text-zinc-950 font-black shadow-sm'
                            : status === 'en_cours'
                            ? 'bg-amber-500 text-zinc-950 font-black shadow-sm'
                            : 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                        }`}>
                          {index + 1}
                        </div>

                        <button
                          onClick={(e) => handleMoveOrder(index, 'down', e)}
                          disabled={isLast}
                          className={`w-6 h-4 rounded flex items-center justify-center transition-colors ${
                            isLast 
                              ? 'text-zinc-700 cursor-not-allowed' 
                              : 'text-zinc-400 hover:text-amber-400 hover:bg-zinc-800'
                          }`}
                          title="Déplacer vers le bas dans l'ordre"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {parcel.properties.code && (
                            <span className="px-1.5 py-0.2 rounded font-mono font-black text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              {parcel.properties.code}
                            </span>
                          )}
                          <span className="text-sm font-black text-zinc-100 truncate">
                            {name}
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            ({parcel.properties.commune || 'Bourgogne'})
                          </span>
                        </div>

                        <div className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5 flex-wrap">
                          <span>{parcel.properties.niveau || 'Village'}</span>
                          {parcel.properties.nb_rangs && (
                            <span>• {parcel.properties.nb_rangs} rangs</span>
                          )}
                          {parcel.properties.page_livret && (
                            <span className="text-amber-400/90 font-medium">• Livret p.{parcel.properties.page_livret}</span>
                          )}
                        </div>

                        {/* Multi-units badges */}
                        {(caisses > 0 || hl > 0 || kg > 0) && (
                          <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                            {caisses > 0 && (
                              <span className="px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                                📦 {caisses} c.
                              </span>
                            )}
                            {hl > 0 && (
                              <span className="px-1.5 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-bold">
                                🍷 {hl} hL
                              </span>
                            )}
                            {kg > 0 && (
                              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                                ⚖️ {kg.toLocaleString('fr-FR')} kg
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Status Buttons and Unit Counter on the row */}
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                      
                      {/* Dynamic Unit Counter */}
                      {activeUnitMode === 'caisses' && (
                        <div className="flex items-center gap-1 bg-zinc-950 px-1.5 py-0.5 rounded-lg border border-amber-500/30">
                          <span className="text-[10px] text-amber-500 font-black mr-0.5">📦</span>
                          <button
                            onClick={(e) => handleQuickCaisses(parcel, -1, e)}
                            className="w-5 h-5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs flex items-center justify-center"
                            title="-1 caisse"
                          >
                            -
                          </button>
                          <span className="min-w-[24px] text-center font-mono font-black text-xs text-amber-400">
                            {caisses}
                          </span>
                          <button
                            onClick={(e) => handleQuickCaisses(parcel, +1, e)}
                            className="w-5 h-5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs flex items-center justify-center"
                            title="+1 caisse"
                          >
                            +
                          </button>
                          <button
                            onClick={(e) => handleQuickCaisses(parcel, +5, e)}
                            className="px-1 h-5 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-[10px] flex items-center justify-center ml-0.5"
                            title="+5 caisses"
                          >
                            +5
                          </button>
                        </div>
                      )}

                      {activeUnitMode === 'hl' && (
                        <div className="flex items-center gap-1 bg-zinc-950 px-1.5 py-0.5 rounded-lg border border-purple-500/30">
                          <span className="text-[10px] text-purple-400 font-black mr-0.5">🍷</span>
                          <button
                            onClick={(e) => handleQuickHl(parcel, -0.5, e)}
                            className="w-5 h-5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs flex items-center justify-center"
                            title="-0.5 hL"
                          >
                            -
                          </button>
                          <span className="min-w-[30px] text-center font-mono font-black text-xs text-purple-300">
                            {hl}
                          </span>
                          <button
                            onClick={(e) => handleQuickHl(parcel, +0.5, e)}
                            className="w-5 h-5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs flex items-center justify-center"
                            title="+0.5 hL"
                          >
                            +
                          </button>
                          <button
                            onClick={(e) => handleQuickHl(parcel, +2, e)}
                            className="px-1 h-5 rounded bg-purple-500 hover:bg-purple-400 text-zinc-950 font-black text-[10px] flex items-center justify-center ml-0.5"
                            title="+2 hL"
                          >
                            +2
                          </button>
                        </div>
                      )}

                      {activeUnitMode === 'kg' && (
                        <div className="flex items-center gap-1 bg-zinc-950 px-1.5 py-0.5 rounded-lg border border-emerald-500/30">
                          <span className="text-[10px] text-emerald-400 font-black mr-0.5">⚖️</span>
                          <button
                            onClick={(e) => handleQuickKg(parcel, -25, e)}
                            className="w-5 h-5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs flex items-center justify-center"
                            title="-25 kg"
                          >
                            -
                          </button>
                          <span className="min-w-[32px] text-center font-mono font-black text-xs text-emerald-300">
                            {kg}
                          </span>
                          <button
                            onClick={(e) => handleQuickKg(parcel, +25, e)}
                            className="w-5 h-5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs flex items-center justify-center"
                            title="+25 kg"
                          >
                            +
                          </button>
                          <button
                            onClick={(e) => handleQuickKg(parcel, +100, e)}
                            className="px-1 h-5 rounded bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-[10px] flex items-center justify-center ml-0.5"
                            title="+100 kg"
                          >
                            +100
                          </button>
                        </div>
                      )}

                      {/* Statut buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleQuickStatus(parcel, 'a_faire', e)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                            status === 'a_faire'
                              ? 'bg-blue-600 text-white border-blue-500'
                              : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200'
                          }`}
                        >
                          À faire
                        </button>

                        <button
                          onClick={(e) => handleQuickStatus(parcel, 'en_cours', e)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-black border transition-colors ${
                            status === 'en_cours'
                              ? 'bg-amber-500 text-zinc-950 border-amber-400'
                              : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200'
                          }`}
                        >
                          En cours
                        </button>

                        <button
                          onClick={(e) => handleQuickStatus(parcel, 'vendange', e)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-black border transition-colors ${
                            status === 'vendange'
                              ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
                              : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200'
                          }`}
                        >
                          Vendangé
                        </button>

                        <button
                          onClick={(e) => handleRemoveFromSchedule(parcel, e)}
                          className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-zinc-500 flex items-center justify-center transition-colors ml-1"
                          title="Retirer du circuit du jour"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/90 flex items-center justify-between shrink-0">
          <div className="text-xs text-zinc-400 font-medium">
            Synchronisation temps réel avec l'équipe
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors"
          >
            Fermer
          </button>
        </div>

        {/* Bilan Export / Share Popup */}
        <AnimatePresence>
          {showExportModal && (
            <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] flex flex-col"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-zinc-950 flex items-center justify-center font-black">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-zinc-100">
                        Bilan Vendanges • {formatDateLabel(selectedDate)}
                      </h3>
                      <p className="text-[11px] text-zinc-400">
                        Prêt pour envoi à la cuverie / chef de culture
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowExportModal(false)}
                    className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Text preview */}
                <div className="flex-1 min-h-[160px] max-h-[260px] overflow-y-auto bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800 font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed select-all">
                  {generateDaySummaryText()}
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={handleShareOrCopy}
                    className={`w-full py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                      copiedDayToast
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-md'
                    }`}
                  >
                    {copiedDayToast ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Copié dans le presse-papier !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Partager / Copier le message (WhatsApp & SMS)</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExportCSV}
                      className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                      <span>Télécharger CSV (Excel)</span>
                    </button>
                    <button
                      onClick={() => setShowExportModal(false)}
                      className="px-4 py-2.5 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 text-xs font-bold transition-colors"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
