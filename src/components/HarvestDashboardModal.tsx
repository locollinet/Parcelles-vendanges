import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  CircleDot, 
  X, 
  Wine, 
  Package, 
  Layers, 
  TrendingUp, 
  Search, 
  ChevronRight,
  Sparkles,
  BarChart3,
  Calendar,
  Share2,
  Copy,
  Check,
  FileSpreadsheet,
  Droplets,
  Scale
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ParcelFeature, ParcelProperties, ClassificationLevel } from '../types';
import { dataManager } from '../services/DataManager';

interface HarvestDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  parcels: ParcelFeature[];
  onSelectParcel: (parcel: ParcelFeature) => void;
  onUpdateParcel?: (parcelId: string, updates: Partial<ParcelProperties>) => void;
  onOpenSchedule?: () => void;
  fieldMode?: boolean;
}

export const HarvestDashboardModal: React.FC<HarvestDashboardModalProps> = ({
  isOpen,
  onClose,
  parcels,
  onSelectParcel,
  onUpdateParcel,
  onOpenSchedule,
  fieldMode = false
}) => {
  const [filterTab, setFilterTab] = useState<'ALL' | 'vendange' | 'en_cours' | 'a_faire'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [copiedGlobalToast, setCopiedGlobalToast] = useState<boolean>(false);
  const [activeUnitMode, setActiveUnitMode] = useState<'caisses' | 'hl' | 'kg'>('caisses');

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
    if (onUpdateParcel) onUpdateParcel(pid, updates);
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
    if (onUpdateParcel) onUpdateParcel(pid, updates);
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
    if (onUpdateParcel) onUpdateParcel(pid, updates);
    dataManager.updateParcelProperties(pid, updates);
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
    if (onUpdateParcel) onUpdateParcel(pid, updates);
    dataManager.updateParcelProperties(pid, updates);
  };

  // Total domain parcels & Vendanges stats
  const stats = useMemo(() => {
    let total = parcels.length;
    let vendangeCount = 0;
    let enCoursCount = 0;
    let aFaireCount = 0;
    let totalCaisses = 0;
    let totalHl = 0;
    let totalKg = 0;

    parcels.forEach((p) => {
      const status = p.properties.harvest_status;
      const caisses = p.properties.harvest_caisses || 0;
      const hl = p.properties.harvest_hl || 0;
      const kg = p.properties.harvest_kg || 0;
      totalCaisses += caisses;
      totalHl += hl;
      totalKg += kg;

      if (status === 'vendange') {
        vendangeCount++;
      } else if (status === 'en_cours') {
        enCoursCount++;
      } else {
        aFaireCount++;
      }
    });

    const percentDone = total > 0 ? Math.round((vendangeCount / total) * 100) : 0;
    const percentInProgress = total > 0 ? Math.round((enCoursCount / total) * 100) : 0;

    return {
      total,
      vendangeCount,
      enCoursCount,
      aFaireCount,
      totalCaisses,
      totalHl,
      totalKg,
      percentDone,
      percentInProgress
    };
  }, [parcels]);

  const generateGlobalSummaryText = () => {
    const todayStr = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const todayIso = new Date().toISOString().split('T')[0];

    // Compute day-specific parcels & volumes for today
    const dayParcels = parcels.filter(
      (p) => p.properties.harvest_scheduled_date === todayIso || p.properties.harvest_date === new Date().toLocaleDateString('fr-FR')
    );
    const dayDone = dayParcels.filter((p) => p.properties.harvest_status === 'vendange');
    const dayInProgress = dayParcels.filter((p) => p.properties.harvest_status === 'en_cours');
    const dayPending = dayParcels.filter((p) => !p.properties.harvest_status || p.properties.harvest_status === 'a_faire');

    const dayCaisses = dayParcels.reduce((s, p) => s + (p.properties.harvest_caisses || 0), 0);
    const dayHl = dayParcels.reduce((s, p) => s + (p.properties.harvest_hl || 0), 0);
    const dayKg = dayParcels.reduce((s, p) => s + (p.properties.harvest_kg || 0), 0);
    const dayPercent = dayParcels.length > 0 ? Math.round((dayDone.length / dayParcels.length) * 100) : 0;

    let text = `🍇 BILAN DES VENDANGES • DOMAINE LEFLAIVE\n`;
    text += `📅 Date du relevé : ${todayStr}\n`;
    text += `════════════════════════════════════\n\n`;

    // ──────────────────────────────────────────
    // BLOC 1 : BILAN DE LA JOURNÉE
    // ──────────────────────────────────────────
    text += `📌 [1] BILAN DE LA JOURNÉE (${todayStr.toUpperCase()})\n`;
    text += `────────────────────────────────────\n`;
    if (dayParcels.length > 0) {
      text += `• Circuit du jour : ${dayParcels.length} parcelle${dayParcels.length > 1 ? 's' : ''} au planning\n`;
      text += `• Avancement du jour : ${dayPercent}% (${dayDone.length} vendangée${dayDone.length > 1 ? 's' : ''} / ${dayInProgress.length} en cours / ${dayPending.length} à faire)\n`;

      const dayVols: string[] = [];
      if (dayCaisses > 0) dayVols.push(`${dayCaisses} caisses`);
      if (dayHl > 0) dayVols.push(`${parseFloat(dayHl.toFixed(2))} hL`);
      if (dayKg > 0) dayVols.push(`${dayKg.toLocaleString('fr-FR')} kg`);

      if (dayVols.length > 0) {
        text += `• Récolté CE JOUR : ${dayVols.join(' • ')}\n\n`;
      } else {
        text += `• Récolté CE JOUR : ${dayCaisses} caisse\n\n`;
      }

      if (dayDone.length > 0) {
        text += `✅ PARCELLES DU JOUR TERMINÉES (${dayDone.length}) :\n`;
        dayDone.forEach((p) => {
          const name = p.properties.nom_climat || p.properties.climat || p.properties.nom_parcelle || 'Parcelle';
          const code = p.properties.code_livret || p.properties.code || p.properties.code_parcel ? ` [${p.properties.code_livret || p.properties.code || p.properties.code_parcel}]` : '';
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

      if (dayInProgress.length > 0) {
        text += `⏳ PARCELLES DU JOUR EN COURS (${dayInProgress.length}) :\n`;
        dayInProgress.forEach((p) => {
          const name = p.properties.nom_climat || p.properties.climat || p.properties.nom_parcelle || 'Parcelle';
          const code = p.properties.code_livret || p.properties.code || p.properties.code_parcel ? ` [${p.properties.code_livret || p.properties.code || p.properties.code_parcel}]` : '';
          const page = p.properties.page_livret ? ` (p.${p.properties.page_livret})` : '';
          text += `  ⏳ ${name}${code}${page}\n`;
        });
        text += `\n`;
      }
    } else {
      text += `• Aucune parcelle programmée aujourd'hui\n\n`;
    }

    // ──────────────────────────────────────────
    // BLOC 2 : AVANCEMENT GLOBAL DU DOMAINE
    // ──────────────────────────────────────────
    text += `════════════════════════════════════\n`;
    text += `🌐 [2] AVANCEMENT GLOBAL DU DOMAINE (CUMUL CAMPAGNE)\n`;
    text += `────────────────────────────────────\n`;
    text += `• Total Domaine : ${stats.total} parcelles cataloguées\n`;
    text += `• Vendangées au total : ${stats.vendangeCount} / ${stats.total} (${stats.percentDone}% du domaine)\n`;
    text += `• En cours de récolte : ${stats.enCoursCount} parcelle${stats.enCoursCount > 1 ? 's' : ''}\n`;
    text += `• Restantes à vendanger : ${stats.aFaireCount} parcelle${stats.aFaireCount > 1 ? 's' : ''}\n`;

    const volSummary: string[] = [];
    if (stats.totalCaisses > 0) volSummary.push(`${stats.totalCaisses} caisses`);
    if (stats.totalHl > 0) volSummary.push(`${parseFloat(stats.totalHl.toFixed(2))} hL`);
    if (stats.totalKg > 0) volSummary.push(`${stats.totalKg.toLocaleString('fr-FR')} kg`);
    
    if (volSummary.length > 0) {
      text += `• Total récolté CUMULÉ (depuis début) : ${volSummary.join(' • ')}\n`;
    } else {
      text += `• Total récolté CUMULÉ : ${stats.totalCaisses} caisses\n`;
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

  const handleShareOrCopyGlobal = async () => {
    const text = generateGlobalSummaryText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Bilan Global des Vendanges`,
          text: text
        });
        return;
      } catch (e) {
        // Fallback to copy
      }
    }
    await copyTextToClipboard(text);
    setCopiedGlobalToast(true);
    setTimeout(() => setCopiedGlobalToast(false), 2500);
  };

  const handleExportGlobalCSV = () => {
    const headers = ['Code', 'Climat', 'Appellation', 'Commune', 'Page Livret', 'Statut Vendange', 'Caisses', 'Hectolitres_hL', 'Kilos_kg', 'Date Récolte', 'Vigneron'];
    const rows = parcels.map((p) => [
      `"${p.properties.code || p.properties.code_parcel || ''}"`,
      `"${p.properties.nom_climat || p.properties.climat || p.properties.nom_parcelle || ''}"`,
      `"${p.properties.nom_app || p.properties.appellation || ''}"`,
      `"${p.properties.commune || ''}"`,
      `"${p.properties.page_livret || ''}"`,
      `"${p.properties.harvest_status || 'a_faire'}"`,
      p.properties.harvest_caisses || 0,
      p.properties.harvest_hl || '',
      p.properties.harvest_kg || '',
      `"${p.properties.harvest_date || ''}"`,
      `"${p.properties.vigneron || ''}"`
    ]);
    const csvContent = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bilan_global_vendanges_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered parcels list
  const filteredParcels = useMemo(() => {
    return parcels.filter((p) => {
      const status = p.properties.harvest_status || 'a_faire';
      if (filterTab !== 'ALL' && status !== filterTab) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = (p.properties.nom_parcelle || p.properties.nom_climat || p.properties.climat || '').toLowerCase();
        const code = (p.properties.code || '').toLowerCase();
        const commune = (p.properties.commune || '').toLowerCase();
        const app = (p.properties.nom_app || p.properties.appellation || '').toLowerCase();
        return name.includes(q) || code.includes(q) || commune.includes(q) || app.includes(q);
      }

      return true;
    });
  }, [parcels, filterTab, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1050] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl max-h-[92vh] sm:max-h-[88vh] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl border bg-zinc-950 border-zinc-800 text-zinc-100"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-zinc-950 flex items-center justify-center font-black shadow-md">
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-zinc-100 flex items-center gap-2">
                <span>Statut d'Avancement</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                  {stats.percentDone}% Récolté
                </span>
              </h2>
              <p className="text-xs text-zinc-400 font-medium">
                Suivi des 156 parcelles du livret & caisses récoltées
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowExportModal(true)}
              className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-md"
              title="Exporter ou partager le bilan global des vendanges"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Bilan Global</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition-transform active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress KPI Cards */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/40 space-y-3 shrink-0">
          {/* Visual Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-black">
              <span className="text-zinc-400">Progression globale</span>
              <span className="text-emerald-400 font-mono">{stats.vendangeCount} / {stats.total} parcelles ({stats.percentDone}%)</span>
            </div>
            <div className="w-full h-3 rounded-full bg-zinc-800 overflow-hidden flex">
              <div 
                className="bg-emerald-500 h-full transition-all duration-500" 
                style={{ width: `${stats.percentDone}%` }}
                title={`Vendangé : ${stats.percentDone}%`}
              />
              <div 
                className="bg-amber-500 h-full transition-all duration-500" 
                style={{ width: `${stats.percentInProgress}%` }}
                title={`En cours : ${stats.percentInProgress}%`}
              />
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
            <div className="p-2 rounded-2xl bg-zinc-900 border border-zinc-800 text-center">
              <div className="text-sm sm:text-base font-black text-emerald-400">{stats.vendangeCount}</div>
              <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-tight">Vendangé</div>
            </div>
            <div className="p-2 rounded-2xl bg-zinc-900 border border-zinc-800 text-center">
              <div className="text-sm sm:text-base font-black text-amber-400">{stats.enCoursCount}</div>
              <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-tight">En cours</div>
            </div>
            <div className="p-2 rounded-2xl bg-zinc-900 border border-zinc-800 text-center">
              <div className="text-sm sm:text-base font-black text-blue-400">{stats.aFaireCount}</div>
              <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-tight">À faire</div>
            </div>
            <div className="p-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center">
              <div className="text-sm sm:text-base font-black text-amber-300 font-mono">{stats.totalCaisses}</div>
              <div className="text-[9px] font-black text-amber-400 uppercase tracking-tight flex items-center justify-center gap-0.5">
                <span>📦 Caisses</span>
              </div>
            </div>
            <div className="p-2 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-center">
              <div className="text-sm sm:text-base font-black text-purple-300 font-mono">
                {parseFloat(stats.totalHl.toFixed(1))}
              </div>
              <div className="text-[9px] font-black text-purple-300 uppercase tracking-tight flex items-center justify-center gap-0.5">
                <span>🍷 Hectolitres</span>
              </div>
            </div>
            <div className="p-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
              <div className="text-sm sm:text-base font-black text-emerald-300 font-mono truncate">
                {stats.totalKg > 999 ? `${(stats.totalKg / 1000).toFixed(1)}t` : `${stats.totalKg}k`}
              </div>
              <div className="text-[9px] font-black text-emerald-300 uppercase tracking-tight flex items-center justify-center gap-0.5">
                <span>⚖️ Kilos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs & Search */}
        <div className="p-3 border-b border-zinc-800 bg-zinc-900/50 space-y-2 shrink-0">
          <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-zinc-950 border border-zinc-800">
            <button
              onClick={() => setFilterTab('ALL')}
              className={`py-1.5 px-1 rounded-lg text-xs font-bold transition-all ${
                filterTab === 'ALL'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Tous ({stats.total})
            </button>
            <button
              onClick={() => setFilterTab('vendange')}
              className={`py-1.5 px-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                filterTab === 'vendange'
                  ? 'bg-emerald-500 text-zinc-950 font-black shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Fait ({stats.vendangeCount})</span>
            </button>
            <button
              onClick={() => setFilterTab('en_cours')}
              className={`py-1.5 px-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                filterTab === 'en_cours'
                  ? 'bg-amber-500 text-zinc-950 font-black shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>En cours ({stats.enCoursCount})</span>
            </button>
            <button
              onClick={() => setFilterTab('a_faire')}
              className={`py-1.5 px-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                filterTab === 'a_faire'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <CircleDot className="w-3 h-3" />
              <span>Reste ({stats.aFaireCount})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Filtrer par nom de climat, code, commune..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-amber-500"
              />
            </div>

            {/* Quick Saisie Unit Mode Selector */}
            <div className="flex items-center gap-1 p-0.5 rounded-xl bg-zinc-950 border border-zinc-800 shrink-0">
              <button
                onClick={() => setActiveUnitMode('caisses')}
                className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 ${
                  activeUnitMode === 'caisses'
                    ? 'bg-amber-500 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Saisie rapide en Caisses"
              >
                <span>📦 Caisses</span>
              </button>
              <button
                onClick={() => setActiveUnitMode('hl')}
                className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 ${
                  activeUnitMode === 'hl'
                    ? 'bg-purple-500 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Saisie rapide en Hectolitres (hL)"
              >
                <span>🍷 hL</span>
              </button>
              <button
                onClick={() => setActiveUnitMode('kg')}
                className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 ${
                  activeUnitMode === 'kg'
                    ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Saisie rapide en Kilos (kg)"
              >
                <span>⚖️ kg</span>
              </button>
            </div>
          </div>
        </div>

        {/* Parcels List */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-2.5">
          {filteredParcels.map((parcel) => {
            const name = parcel.properties.nom_parcelle || parcel.properties.nom_climat || parcel.properties.climat || 'Parcelle';
            const status = parcel.properties.harvest_status || 'a_faire';
            const caisses = parcel.properties.harvest_caisses || 0;
            const hl = parcel.properties.harvest_hl || 0;
            const kg = parcel.properties.harvest_kg || 0;

            return (
              <div
                key={parcel.id || parcel.properties.id}
                onClick={() => {
                  onSelectParcel(parcel);
                  onClose();
                }}
                className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all active:scale-[0.99] ${
                  status === 'vendange'
                    ? 'bg-zinc-900 border-emerald-500/40 hover:border-emerald-400 shadow-sm'
                    : status === 'en_cours'
                    ? 'bg-zinc-900 border-amber-500/50 hover:border-amber-400 shadow-sm ring-1 ring-amber-500/20'
                    : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700'
                }`}
              >
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
                    <span className="text-[10px] text-zinc-400 font-medium">
                      ({parcel.properties.commune || 'Bourgogne'})
                    </span>
                  </div>

                  <div className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5 flex-wrap">
                    <span>{parcel.properties.niveau || 'Village'}</span>
                    {parcel.properties.nb_rangs && (
                      <span>• {parcel.properties.nb_rangs} rangs</span>
                    )}
                    {parcel.properties.harvest_date && status === 'vendange' && (
                      <span className="text-emerald-400 font-bold">• Fait le {parcel.properties.harvest_date}</span>
                    )}
                  </div>

                  {/* Multi-units badge display row */}
                  {(caisses > 0 || hl > 0 || kg > 0) && (
                    <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                      {caisses > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold flex items-center gap-1">
                          <span>📦</span>
                          <span>{caisses} c.</span>
                        </span>
                      )}
                      {hl > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-bold flex items-center gap-1">
                          <span>🍷</span>
                          <span>{hl} hL</span>
                        </span>
                      )}
                      {kg > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                          <span>⚖️</span>
                          <span>{kg.toLocaleString('fr-FR')} kg</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                  {/* Dynamic Quick Counter depending on selected unit */}
                  {activeUnitMode === 'caisses' && (
                    <div className="flex items-center gap-1 bg-zinc-950 px-1.5 py-0.5 rounded-lg border border-amber-500/30">
                      <span className="text-[10px] text-amber-500 font-black mr-0.5">📦</span>
                      <button
                        onClick={(e) => handleQuickCaisses(parcel, -1, e)}
                        className="w-5 h-5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center"
                        title="-1 caisse"
                      >
                        -
                      </button>
                      <span className="min-w-[24px] text-center font-mono font-black text-xs text-amber-400">
                        {caisses}
                      </span>
                      <button
                        onClick={(e) => handleQuickCaisses(parcel, +1, e)}
                        className="w-5 h-5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center"
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
                        className="w-5 h-5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center"
                        title="-0.5 hL"
                      >
                        -
                      </button>
                      <span className="min-w-[30px] text-center font-mono font-black text-xs text-purple-300">
                        {hl}
                      </span>
                      <button
                        onClick={(e) => handleQuickHl(parcel, +0.5, e)}
                        className="w-5 h-5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center"
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
                        className="w-5 h-5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center"
                        title="-25 kg"
                      >
                        -
                      </button>
                      <span className="min-w-[32px] text-center font-mono font-black text-xs text-emerald-300">
                        {kg}
                      </span>
                      <button
                        onClick={(e) => handleQuickKg(parcel, +25, e)}
                        className="w-5 h-5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center"
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

                  {/* Status toggle button */}
                  <button
                    onClick={(e) => {
                      const nextStatus = status === 'a_faire' ? 'en_cours' : status === 'en_cours' ? 'vendange' : 'a_faire';
                      handleQuickStatus(parcel, nextStatus, e);
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-black border transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
                      status === 'vendange'
                        ? 'bg-emerald-500 text-zinc-950 border-emerald-400 hover:bg-emerald-400'
                        : status === 'en_cours'
                        ? 'bg-amber-500 text-zinc-950 border-amber-400 hover:bg-amber-400'
                        : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:text-zinc-100 hover:bg-zinc-700'
                    }`}
                  >
                    {status === 'vendange' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Fait</span>
                      </>
                    ) : status === 'en_cours' ? (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        <span>En cours</span>
                      </>
                    ) : (
                      <>
                        <CircleDot className="w-3.5 h-3.5 text-blue-400" />
                        <span>À faire</span>
                      </>
                    )}
                  </button>

                  <div 
                    onClick={() => {
                      onSelectParcel(parcel);
                      onClose();
                    }}
                    className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 cursor-pointer transition-colors"
                    title="Voir la fiche complète"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}

          {filteredParcels.length === 0 && (
            <div className="text-center py-10 text-xs text-zinc-500">
              Aucune parcelle ne correspond au filtre sélectionné.
            </div>
          )}
        </div>

        {/* Footer with Schedule shortcut */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/90 flex items-center justify-between shrink-0">
          {onOpenSchedule && (
            <button
              onClick={() => {
                onClose();
                onOpenSchedule();
              }}
              className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Ouvrir le planning journalier</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors ml-auto active:scale-95"
          >
            Fermer
          </button>
        </div>

        {/* Global Export / Share Popup */}
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
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-zinc-950 flex items-center justify-center font-black">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-zinc-100">
                        Bilan Global des Vendanges
                      </h3>
                      <p className="text-[11px] text-zinc-400">
                        Synthèse complète pour la régie et la cuverie
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
                  {generateGlobalSummaryText()}
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={handleShareOrCopyGlobal}
                    className={`w-full py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                      copiedGlobalToast
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-md'
                    }`}
                  >
                    {copiedGlobalToast ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Copié dans le presse-papier !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Partager / Copier le bilan complet (WhatsApp & SMS)</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExportGlobalCSV}
                      className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                      <span>Télécharger CSV Complet (156 parcelles)</span>
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
