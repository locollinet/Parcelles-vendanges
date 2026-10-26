import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  X, 
  MapPin, 
  Wine, 
  Layers, 
  Calendar, 
  CheckCircle2, 
  WifiOff, 
  Compass, 
  Printer, 
  Smartphone, 
  Sparkles, 
  Search, 
  Navigation,
  TrendingUp,
  SunMedium,
  Check
} from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  fieldMode?: boolean;
}

type GuideTab = 'simple_3steps' | 'find_plot' | 'validate_harvest' | 'overview_planning';

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  isOpen,
  onClose,
  fieldMode = false
}) => {
  const [activeTab, setActiveTab] = useState<GuideTab>('simple_3steps');

  if (!isOpen) return null;

  const handlePrintCheatSheet = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Veuillez autoriser les fenêtres pop-up pour imprimer la fiche mémo.');
      return;
    }

    const memoHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Fiche Mémo Simple • Vendanges 2024 • Domaine Olivier Leflaive</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      color: #09090b;
      padding: 10mm;
      font-size: 10pt;
      line-height: 1.4;
    }
    @page { size: A4 portrait; margin: 10mm; }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #854d0e;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .title { font-size: 18pt; font-weight: 900; color: #854d0e; }
    .subtitle { font-size: 9.5pt; font-weight: 700; color: #52525b; }
    .badge { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; padding: 4px 10px; border-radius: 8px; font-weight: 800; font-size: 8.5pt; }
    
    .big-steps { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 14px; }
    .step-box {
      border: 2px solid #e4e4e7;
      border-radius: 10px;
      padding: 12px;
      background: #fafafa;
      text-align: left;
    }
    .step-num {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #854d0e;
      color: white;
      font-weight: 900;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11pt;
      margin-bottom: 8px;
    }
    .step-box h3 { font-size: 11pt; font-weight: 800; margin-bottom: 6px; color: #18181b; }
    .step-box p { font-size: 8.5pt; color: #3f3f46; line-height: 1.35; }
    
    .section-title {
      font-size: 11pt;
      font-weight: 800;
      color: #854d0e;
      margin-top: 10px;
      margin-bottom: 8px;
      border-bottom: 1px solid #e4e4e7;
      padding-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .card {
      border: 1px solid #d4d4d8;
      border-radius: 8px;
      padding: 10px;
      background: #ffffff;
    }
    .card h4 { font-size: 9.5pt; font-weight: 800; margin-bottom: 4px; color: #18181b; }
    .card p, .card li { font-size: 8.5pt; color: #3f3f46; }
    .highlight { background: #fef08a; padding: 1px 4px; border-radius: 3px; font-weight: 700; color: #854d0e; }
    .status-pill { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 7.5pt; font-weight: 800; margin-right: 4px; }
    .status-todo { background: #e4e4e7; color: #3f3f46; }
    .status-prog { background: #fed7aa; color: #9a3412; }
    .status-done { background: #bbf7d0; color: #166534; }
    
    .footer {
      margin-top: 14px;
      border-top: 1px solid #d4d4d8;
      padding-top: 8px;
      display: flex;
      justify-content: space-between;
      font-size: 8pt;
      color: #71717a;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">🍇 Comment ça marche ? • Vendanges 2024</div>
      <div class="subtitle">Domaine Olivier Leflaive • Guide simple pour tout le monde</div>
    </div>
    <span class="badge">Fiche Mémo Terrain</span>
  </div>

  <div class="big-steps">
    <div class="step-box">
      <div class="step-num">1</div>
      <h3>Trouver la vigne</h3>
      <p>Tapez le nom de la vigne ou le code (ex: <span class="highlight">BAT</span>, <span class="highlight">MAC</span>) dans la barre en haut.<br/><br/>
      Cliquez sur <span class="highlight">🧭 GPS / Itinéraire</span> pour que votre téléphone vous guide directement en voiture ou tracteur.</p>
    </div>

    <div class="step-box">
      <div class="step-num">2</div>
      <h3>Vérifier la parcelle</h3>
      <p>Regardez la <strong>pastille orange numérotée</strong> sur la carte.<br/><br/>
      Vérifiez les consignes simples : <strong>nombre de rangs</strong>, cépage (Chardonnay / Pinot) et apporteur (Domaine ou Achat).</p>
    </div>

    <div class="step-box">
      <div class="step-num">3</div>
      <h3>Pointer les caisses</h3>
      <p>En bas de l'écran, cliquez sur :<br/>
      <span class="status-pill status-prog">🟠 En cours</span> pendant la coupe.<br/>
      <span class="status-pill status-done">🟢 Récolté</span> une fois fini.<br/><br/>
      Indiquez le <strong>nombre de caisses</strong> récoltées.</p>
    </div>
  </div>

  <div class="section-title">💡 4 Choses Utiles à Retenir</div>
  <div class="grid-2">
    <div class="card">
      <h4>📶 Et s'il n'y a pas de réseau 4G dans la combe ?</h4>
      <p>Pas de panique ! L'application fonctionne sans internet. Vos changements de statut et les caisses sont gardés en mémoire sur votre téléphone et envoyés dès le retour au cuverie.</p>
    </div>

    <div class="card">
      <h4>☀️ Écran illisible en plein soleil ?</h4>
      <p>Cliquez sur l'icône soleil <span class="highlight">☀️ Mode Terrain</span> en haut à droite : l'écran passe en contraste maximal et les boutons deviennent plus grands pour une utilisation facile avec des gants.</p>
    </div>

    <div class="card">
      <h4>📅 Suivre l'ordre de passage du jour</h4>
      <p>Cliquez sur le bouton flottant <span class="highlight">📅 Circuit & Planning</span> pour voir la liste des vignes prévues pour la journée, triées par commune et par ordre de priorité.</p>
    </div>

    <div class="card">
      <h4>📊 Voir le total récolté</h4>
      <p>Cliquez sur le menu ⚙️ > <span class="highlight">Bilan Global</span> pour voir instantanément le cumul des hectares coupés et le nombre total de caisses reçues à la cuverie.</p>
    </div>
  </div>

  <div class="footer">
    <span>Domaine Olivier Leflaive • Puligny-Montrachet</span>
    <span>Fiche d'utilisation express pour l'ensemble des équipes</span>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(memoHtml);
    printWindow.document.close();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1500] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-4xl max-h-[92vh] rounded-3xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/90 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-zinc-950 flex items-center justify-center font-black shadow-md shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                    Comment utiliser l'application ?
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider">
                    Vendanges 2024
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Guide simple et direct pour tout le monde • Domaine Olivier Leflaive
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrintCheatSheet}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md transition-all active:scale-95"
                title="Imprimer la fiche mémo A4 simple"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimer Fiche Mémo (1 page)</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs - Simple & Universel */}
          <div className="px-4 pt-3 pb-2 border-b border-zinc-800/80 bg-zinc-900/40 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
            <button
              onClick={() => setActiveTab('simple_3steps')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'simple_3steps'
                  ? 'bg-amber-500 text-zinc-950 shadow-md'
                  : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>1. En 3 étapes simples</span>
            </button>

            <button
              onClick={() => setActiveTab('find_plot')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'find_plot'
                  ? 'bg-blue-500 text-zinc-950 shadow-md'
                  : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>2. Trouver sa vigne & GPS</span>
            </button>

            <button
              onClick={() => setActiveTab('validate_harvest')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'validate_harvest'
                  ? 'bg-emerald-500 text-zinc-950 shadow-md'
                  : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>3. Valider la récolte & Caisses</span>
            </button>

            <button
              onClick={() => setActiveTab('overview_planning')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'overview_planning'
                  ? 'bg-purple-500 text-zinc-950 shadow-md'
                  : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>4. Circuit du jour & Bilan</span>
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-sm text-zinc-300">
            {/* TAB 1: EN 3 ÉTAPES SIMPLES */}
            {activeTab === 'simple_3steps' && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  <h3 className="text-sm font-black mb-1 flex items-center gap-2">
                    <span>🍇</span> Le principe est très simple :
                  </h3>
                  <p className="text-xs text-zinc-300">
                    L'application rassemble les <strong>156 parcelles de vendange</strong> du domaine. Sur votre téléphone ou tablette, vous pouvez trouver n'importe quelle vigne en 3 secondes et déclarer quand elle est coupée.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* ÉTAPE 1 */}
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="w-9 h-9 rounded-2xl bg-amber-500 text-zinc-950 flex items-center justify-center font-black text-sm mb-2 shadow-md">
                        1
                      </div>
                      <h4 className="font-black text-white text-sm">Trouver la vigne</h4>
                      <p className="text-xs text-zinc-400 mt-1">
                        Tapez le nom du climat (ex: <em>Les Pucelles</em>), la commune ou le code court (ex: <span className="text-amber-400 font-bold">BAT</span>, <span className="text-amber-400 font-bold">MAC</span>) dans la barre du haut.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300 font-medium">
                      💡 Cliquez sur <strong>« GPS / Itinéraire »</strong> pour être guidé jusqu'au bout du chemin.
                    </div>
                  </div>

                  {/* ÉTAPE 2 */}
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="w-9 h-9 rounded-2xl bg-blue-500 text-zinc-950 flex items-center justify-center font-black text-sm mb-2 shadow-md">
                        2
                      </div>
                      <h4 className="font-black text-white text-sm">Vérifier les consignes</h4>
                      <p className="text-xs text-zinc-400 mt-1">
                        Repérez la <strong>pastille orange numérotée</strong> sur la carte. Regardez le <strong>nombre de rangs</strong> à couper et si c'est du <em>Domaine</em> ou un <em>Achat</em>.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300 font-medium">
                      💡 Le numéro de la pastille est identique au livret papier.
                    </div>
                  </div>

                  {/* ÉTAPE 3 */}
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="w-9 h-9 rounded-2xl bg-emerald-500 text-zinc-950 flex items-center justify-center font-black text-sm mb-2 shadow-md">
                        3
                      </div>
                      <h4 className="font-black text-white text-sm">Valider la coupe</h4>
                      <p className="text-xs text-zinc-400 mt-1">
                        En bas de la fiche, cliquez sur <strong>🟢 Récolté</strong> quand c'est terminé et tapez le nombre de caisses (ex: <em>35 caisses</em>).
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300 font-medium">
                      💡 Tout le monde (chai & direction) voit l'avancement en direct !
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                      <SunMedium className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Astuce Plein Soleil sur le terrain</div>
                      <div className="text-[11px] text-zinc-400">Cliquez sur l'icône soleil en haut à droite pour agrandir les boutons et booster le contraste.</div>
                    </div>
                  </div>
                  <button
                    onClick={handlePrintCheatSheet}
                    className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-xs font-bold flex items-center gap-2 border border-zinc-700 transition-all"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimer la fiche mémo papier</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: TROUVER SA VIGNE & ITINÉRAIRE GPS */}
            {activeTab === 'find_plot' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-300 space-y-1">
                  <h4 className="font-bold text-xs flex items-center gap-2">
                    <Navigation className="w-4 h-4" />
                    <span>Comment localiser une parcelle sans hésiter ?</span>
                  </h4>
                  <p className="text-xs text-zinc-300">
                    Vous avez 3 façons très simples d'ouvrir la bonne fiche :
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                    <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Search className="w-4 h-4" />
                      <span>1. Par la recherche</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Tapez quelques lettres du nom du climat (ex: <em>Charmes</em>, <em>Garenne</em>), la commune, ou le code du livret (ex: <em>CHM</em>, <em>MEU</em>).
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      <span>2. En touchant la carte</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Touchez directement n'importe quel polygone de vigne ou sa pastille orange sur la carte satellite.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                    <div className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                      <Layers className="w-4 h-4" />
                      <span>3. Par la liste « 156 »</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Cliquez sur le bouton <strong>« 156 Vendanges »</strong> en haut pour voir toutes les parcelles classées par commune et par couleur.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Compass className="w-4 h-4 text-amber-400" />
                    <span>Lancer le guidage GPS (Waze / Google Maps / Apple Plans)</span>
                  </h4>
                  <p className="text-xs text-zinc-300">
                    Dans la fiche de la vigne, cliquez simplement sur le gros bouton bleu <strong>« 🧭 GPS / Itinéraire »</strong>. Votre smartphone ouvre automatiquement votre application GPS habituelle avec le point exact d'entrée du chemin de vigne.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: VALIDER LA RÉCOLTE & CAISSES */}
            {activeTab === 'validate_harvest' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-1">
                  <h4 className="font-bold text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Les 3 boutons d'état de récolte</span>
                  </h4>
                  <p className="text-xs text-zinc-300">
                    En bas de chaque fiche de vigne, vous avez 3 boutons clairs :
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                    <span className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-bold inline-block">
                      🟡 À faire
                    </span>
                    <p className="text-xs text-zinc-400">
                      La vigne est en attente de vendange.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold inline-block">
                      🟠 En cours
                    </span>
                    <p className="text-xs text-zinc-400">
                      Les coupeurs sont dans les rangs.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold inline-block">
                      🟢 Récolté
                    </span>
                    <p className="text-xs text-zinc-400">
                      La coupe est terminée, la parcelle est validée.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <span>📦</span> Noter le nombre de caisses
                  </h4>
                  <p className="text-xs text-zinc-300">
                    Après avoir cliqué sur <strong>🟢 Récolté</strong>, un champ vous propose d'entrer le nombre de caisses (ex: <em>45</em>). Cela met à jour instantanément les totaux pour la cuverie et la pesée.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-300 space-y-2">
                  <h4 className="font-bold text-xs flex items-center gap-2">
                    <WifiOff className="w-4 h-4" />
                    <span>Et s'il n'y a pas de réseau 4G dans la combe ?</span>
                  </h4>
                  <p className="text-xs text-zinc-300">
                    L'application garde tout en mémoire sur votre smartphone. Dès que vous retrouvez du réseau ou le Wi-Fi de la cuverie, toutes vos validations et vos caisses sont synchronisées automatiquement sans rien perdre.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 4: CIRCUIT DU JOUR & BILAN */}
            {activeTab === 'overview_planning' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-300 space-y-1">
                  <h4 className="font-bold text-xs flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Suivre la journée & vue globale</span>
                  </h4>
                  <p className="text-xs text-zinc-300">
                    Deux outils pratiques accessibles à tout moment :
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <span className="p-1 rounded bg-amber-500 text-zinc-950 font-black text-[10px]">📅</span>
                      <span>Circuit & Planning du jour</span>
                    </h4>
                    <p className="text-xs text-zinc-400">
                      Bouton flottant en bas à droite : affiche la liste des vignes prévues pour la journée, triées par secteur et ordre de passage pour savoir où aller ensuite.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <span className="p-1 rounded bg-emerald-500 text-zinc-950 font-black text-[10px]">📊</span>
                      <span>Bilan Global des Hectares</span>
                    </h4>
                    <p className="text-xs text-zinc-400">
                      Dans le menu ⚙️ : affiche le cumul des hectares récoltés (en ha et en %), la répartition par appellation (Grands Crus, 1ers Crus, Villages) et le total des caisses.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Printer className="w-4 h-4 text-amber-400" />
                    <span>Besoin du livret papier pour le tracteur ?</span>
                  </h4>
                  <p className="text-xs text-zinc-300">
                    Allez dans Menu ⚙️ &gt; <strong>« Imprimer Livrets & Atlas PDF »</strong> pour générer en un clic le classeur complet ou les fiches récapitulatives A4 prêtes à être imprimées avec les photos et les cartes annotées.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-zinc-800 bg-zinc-900/80 flex items-center justify-between gap-3 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={handlePrintCheatSheet}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-lg transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer Fiche Mémo Simple (1 page A4)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs transition-all"
            >
              C'est compris, fermer
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

