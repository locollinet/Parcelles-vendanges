import React, { useState, useMemo } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  Clock, 
  CircleDot, 
  Wine, 
  MapPin, 
  Sparkles,
  Package,
  Droplets,
  Scale
} from 'lucide-react';
import { ParcelFeature } from '../types';

interface BilanGlobalModalProps {
  isOpen: boolean;
  onClose: () => void;
  parcels: ParcelFeature[];
  fieldMode?: boolean;
}

export const BilanGlobalModal: React.FC<BilanGlobalModalProps> = ({
  isOpen,
  onClose,
  parcels,
  fieldMode = false,
}) => {
  const [copiedToast, setCopiedToast] = useState(false);

  // Compute live synthesis across all units
  const stats = useMemo(() => {
    let totalParcels = parcels.length;
    let doneParcels: ParcelFeature[] = [];
    let inProgressParcels: ParcelFeature[] = [];
    let pendingParcels: ParcelFeature[] = [];
    let totalCaisses = 0;
    let totalHl = 0;
    let totalKg = 0;

    parcels.forEach((p) => {
      const status = p.properties.harvest_status || 'a_faire';
      const caisses = p.properties.harvest_caisses || 0;
      const hl = p.properties.harvest_hl || 0;
      const kg = p.properties.harvest_kg || 0;

      totalCaisses += caisses;
      totalHl += hl;
      totalKg += kg;

      if (status === 'vendange') {
        doneParcels.push(p);
      } else if (status === 'en_cours') {
        inProgressParcels.push(p);
      } else {
        pendingParcels.push(p);
      }
    });

    const percentDone = totalParcels > 0 ? Math.round((doneParcels.length / totalParcels) * 100) : 0;

    return {
      totalParcels,
      doneCount: doneParcels.length,
      inProgressCount: inProgressParcels.length,
      pendingCount: pendingParcels.length,
      percentDone,
      totalCaisses,
      totalHl,
      totalKg,
      doneParcels,
      inProgressParcels,
      pendingParcels,
    };
  }, [parcels]);

  // Generate clean, readable WhatsApp / SMS text
  const summaryText = useMemo(() => {
    const todayStr = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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
          const name = p.properties.nom_parcelle || p.properties.climat || p.properties.nom_app || 'Parcelle';
          const code = p.properties.code_livret || p.properties.code || p.properties.code_parcel ? ` [${p.properties.code_livret || p.properties.code || p.properties.code_parcel}]` : '';
          const page = p.properties.page_livret ? ` (p.${p.properties.page_livret})` : '';
          const qParts: string[] = [];
          if (p.properties.harvest_caisses) qParts.push(`${p.properties.harvest_caisses} c.`);
          if (p.properties.harvest_hl) qParts.push(`${p.properties.harvest_hl} hL`);
          if (p.properties.harvest_kg) qParts.push(`${p.properties.harvest_kg.toLocaleString('fr-FR')} kg`);
          const qText = qParts.length > 0 ? qParts.join(' • ') : `${p.properties.harvest_caisses || 0} caisses`;
          text += `  ✓ ${name}${code}${page} : ${qText}\n`;
        });
        text += `\n`;
      }

      if (dayInProgress.length > 0) {
        text += `⏳ PARCELLES DU JOUR EN COURS (${dayInProgress.length}) :\n`;
        dayInProgress.forEach((p) => {
          const name = p.properties.nom_parcelle || p.properties.climat || p.properties.nom_app || 'Parcelle';
          const code = p.properties.code_livret || p.properties.code || p.properties.code_parcel ? ` [${p.properties.code_livret || p.properties.code || p.properties.code_parcel}]` : '';
          const page = p.properties.page_livret ? ` (p.${p.properties.page_livret})` : '';
          text += `  ⏳ ${name}${code}${page}\n`;
        });
        text += `\n`;
      }
    } else {
      text += `• Aucune parcelle spécifiquement planifiée aujourd'hui\n\n`;
    }

    // ──────────────────────────────────────────
    // BLOC 2 : AVANCEMENT GLOBAL DU DOMAINE
    // ──────────────────────────────────────────
    text += `════════════════════════════════════\n`;
    text += `🌐 [2] AVANCEMENT GLOBAL DU DOMAINE (CUMUL CAMPAGNE)\n`;
    text += `────────────────────────────────────\n`;
    text += `• Total Domaine : ${stats.totalParcels} parcelles cataloguées\n`;
    text += `• Vendangées au total : ${stats.doneCount} / ${stats.totalParcels} (${stats.percentDone}% du domaine)\n`;
    text += `• En cours de récolte : ${stats.inProgressCount} parcelle${stats.inProgressCount > 1 ? 's' : ''}\n`;
    text += `• Restantes à vendanger : ${stats.pendingCount} parcelle${stats.pendingCount > 1 ? 's' : ''}\n`;
    
    // Volumes Cumulés
    const volumesList: string[] = [];
    if (stats.totalCaisses > 0) volumesList.push(`${stats.totalCaisses} caisses`);
    if (stats.totalHl > 0) volumesList.push(`${parseFloat(stats.totalHl.toFixed(2))} hL`);
    if (stats.totalKg > 0) volumesList.push(`${stats.totalKg.toLocaleString('fr-FR')} kg`);
    
    if (volumesList.length > 0) {
      text += `• Total récolté CUMULÉ (depuis début) : ${volumesList.join(' • ')}\n`;
    } else {
      text += `• Total récolté CUMULÉ : ${stats.totalCaisses} caisses\n`;
    }

    text += `\n📲 Relevé exporté via Livret Parcellaire Leflaive`;
    return text;
  }, [stats, parcels]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(summaryText);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = summaryText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3000);
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Bilan des Vendanges',
          text: summaryText,
        });
      } catch (e) {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handleDownloadCsv = () => {
    const headers = ['ID', 'Parcelle', 'Appellation', 'Commune', 'Niveau', 'Code', 'Rangs', 'Statut', 'Date_Recolte', 'Caisses', 'Hectolitres_hL', 'Kilos_kg', 'Notes'];
    const rows = parcels.map((p) => {
      const pr = p.properties;
      return [
        pr.id || '',
        `"${(pr.nom_parcelle || pr.climat || '').replace(/"/g, '""')}"`,
        `"${(pr.nom_app || pr.appellation || '').replace(/"/g, '""')}"`,
        `"${(pr.commune || '').replace(/"/g, '""')}"`,
        `"${(pr.niveau || '').replace(/"/g, '""')}"`,
        `"${(pr.code_livret || pr.code_parcel || '').replace(/"/g, '""')}"`,
        `"${(pr.nb_rangs_details || '').replace(/"/g, '""')}"`,
        `"${pr.harvest_status || 'a_faire'}"`,
        `"${pr.harvest_date || ''}"`,
        pr.harvest_caisses ?? '',
        pr.harvest_hl ?? '',
        pr.harvest_kg ?? '',
        `"${(pr.notes || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Bilan_Vendanges_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-2xl rounded-3xl shadow-2xl border overflow-hidden flex flex-col max-h-[92dvh] ${
          fieldMode
            ? 'bg-zinc-950 border-amber-500/50 text-zinc-100'
            : 'bg-zinc-900 border-zinc-800 text-zinc-100'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-zinc-950 flex items-center justify-center font-black shadow-md shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Bilan des Vendanges
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-zinc-950">
                  {stats.percentDone}%
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Copier / coller instantané pour WhatsApp, SMS ou rapport équipe
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                Progression
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-400">
                {stats.percentDone}%
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-900/90 border border-emerald-500/30 text-center">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                Vendangées
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400">
                {stats.doneCount} <span className="text-xs font-normal text-zinc-400">/ {stats.totalParcels}</span>
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-900/90 border border-amber-500/30 text-center">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                Total Caisses
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-400 flex items-center justify-center gap-1">
                <Package className="w-4 h-4 text-amber-500" />
                {stats.totalCaisses}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-900/90 border border-purple-500/30 text-center">
              <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block">
                Volume hL / kg
              </span>
              <span className="text-sm font-black text-purple-300 flex flex-col items-center justify-center pt-1">
                <span>{stats.totalHl > 0 ? `${parseFloat(stats.totalHl.toFixed(1))} hL` : '—'}</span>
                <span className="text-[10px] text-zinc-400">{stats.totalKg > 0 ? `${stats.totalKg.toLocaleString('fr-FR')} kg` : ''}</span>
              </span>
            </div>
          </div>

          {/* Primary 1-Tap Copy Action Banner */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-500/20 via-zinc-900 to-zinc-900 border-2 border-amber-500/60 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                  Prêt à envoyer par SMS / WhatsApp
                </span>
              </div>
              {copiedToast && (
                <span className="px-3 py-1 rounded-full bg-emerald-500 text-zinc-950 text-xs font-black flex items-center gap-1 animate-in fade-in zoom-in-95">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  Copié dans le presse-papier !
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all"
              >
                {copiedToast ? <Check className="w-5 h-5 stroke-[3]" /> : <Copy className="w-5 h-5" />}
                <span>{copiedToast ? 'Copié !' : '📋 Copier le Bilan Formaté'}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="py-3.5 px-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm flex items-center justify-center gap-2 border border-zinc-700 active:scale-98 transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span>Partager</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadCsv}
                className="py-3.5 px-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-sm flex items-center justify-center gap-2 border border-zinc-700 active:scale-98 transition-all"
                title="Télécharger la feuille de calcul Excel/CSV"
              >
                <Download className="w-4 h-4" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          {/* Formatted Text Preview Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Aperçu du texte généré
              </span>
              <span className="text-[11px] text-zinc-500 font-mono">
                {summaryText.length} caractères
              </span>
            </div>

            <pre className="w-full p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 whitespace-pre-wrap select-all leading-relaxed max-h-64 overflow-y-auto">
              {summaryText}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-zinc-500">
            Livret des Vendanges • 156 parcelles
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
