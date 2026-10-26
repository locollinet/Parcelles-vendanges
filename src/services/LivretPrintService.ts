import { ParcelFeature } from '../types';

export interface LivretPrintOptions {
  mode: 'vendanges' | 'atlas_illustre';
  communeFilter: string; // 'ALL' or specific commune
  levelFilter: string; // 'ALL' or 'Grand Cru', etc.
  statusFilter: string; // 'ALL' or 'a_faire', etc.
  includeCoverPage: boolean;
  includeSummaryStats: boolean;
  includeTerrainPhotos: boolean;
  includeCheckboxes: boolean;
  selectedParcelIds?: string[];
  millesime?: string;
  equipeName?: string;
}

export class LivretPrintService {
  private imageBase64Cache = new Map<string, string>();

  /**
   * Converts a given image URL (relative or absolute) to a base64 Data URI
   */
  public async fetchAsDataUri(url: string): Promise<string> {
    if (!url) return '';
    const trimmed = url.trim();
    if (trimmed.startsWith('data:')) return trimmed;

    if (this.imageBase64Cache.has(trimmed)) {
      return this.imageBase64Cache.get(trimmed)!;
    }

    try {
      // Ensure leading slash if relative
      const fetchUrl = (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/'))
        ? trimmed
        : `/${trimmed}`;

      const res = await fetch(fetchUrl);
      if (!res.ok) {
        return trimmed;
      }
      const blob = await res.blob();
      const dataUri = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string || trimmed);
        reader.onerror = () => resolve(trimmed);
        reader.readAsDataURL(blob);
      });

      if (dataUri.startsWith('data:')) {
        this.imageBase64Cache.set(trimmed, dataUri);
        // Also map alternate relative/absolute keys
        this.imageBase64Cache.set(fetchUrl, dataUri);
      }
      return dataUri;
    } catch {
      return trimmed;
    }
  }

  /**
   * Preloads all required images for given parcels and converts them into standalone base64 Data URIs
   */
  public async preloadAllImagesAsBase64(
    parcels: ParcelFeature[],
    onProgress?: (progressPct: number, currentItem: string) => void
  ): Promise<Map<string, string>> {
    const urlsToFetch = new Set<string>();

    parcels.forEach((p) => {
      const props = p.properties;
      const pageLivret = props.page_livret;

      if (props.carte_annotee) urlsToFetch.add(props.carte_annotee);
      else if (pageLivret) urlsToFetch.add(`/cartes/carte_p${pageLivret}.jpg`);

      if (props.diapositive) urlsToFetch.add(props.diapositive);
      else if (pageLivret) urlsToFetch.add(`/slides/slide_${pageLivret}.jpg`);

      if (props.photo_url) urlsToFetch.add(props.photo_url);
      if (props.photos && props.photos.length > 0) {
        props.photos.forEach((ph) => {
          if (ph.url) urlsToFetch.add(ph.url);
        });
      }
    });

    const urlList = Array.from(urlsToFetch);
    const total = urlList.length;
    let completed = 0;

    for (const url of urlList) {
      if (onProgress) {
        onProgress(Math.round((completed / Math.max(total, 1)) * 100), url);
      }
      await this.fetchAsDataUri(url);
      completed++;
    }

    if (onProgress) {
      onProgress(100, 'Terminé');
    }

    return this.imageBase64Cache;
  }

  /**
   * Filter parcels according to export options
   */
  public filterParcels(parcels: ParcelFeature[], options: LivretPrintOptions): ParcelFeature[] {
    return parcels.filter((parcel) => {
      const p = parcel.properties;

      if (options.selectedParcelIds && options.selectedParcelIds.length > 0) {
        if (!options.selectedParcelIds.includes(String(parcel.id || p.id))) {
          return false;
        }
      }

      if (options.communeFilter !== 'ALL' && p.commune !== options.communeFilter) {
        return false;
      }

      if (options.levelFilter !== 'ALL' && p.niveau !== options.levelFilter) {
        return false;
      }

      if (options.statusFilter !== 'ALL') {
        const status = p.harvest_status || 'a_faire';
        if (status !== options.statusFilter) return false;
      }

      return true;
    });
  }

  /**
   * Generates full standalone HTML string for printing / PDF saving
   */
  public generatePrintableHtml(parcels: ParcelFeature[], options: LivretPrintOptions): string {
    const filtered = this.filterParcels(parcels, options);
    const millesime = options.millesime || '2024';
    const dateFormatted = new Date().toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const isAtlas = options.mode === 'atlas_illustre';
    const title = isAtlas
      ? `Grand Atlas Parcellaire Illustré • Domaine Olivier Leflaive (${millesime})`
      : `Livret des Vendanges • Circuit de Récolte • Domaine Olivier Leflaive (${millesime})`;

    const origin = typeof window !== 'undefined' && window.location ? window.location.origin : '';

    // Group parcels by commune for structured presentation
    const parcelsByCommune: Record<string, ParcelFeature[]> = {};
    filtered.forEach((p) => {
      const comm = p.properties.commune || 'Autres Secteurs';
      if (!parcelsByCommune[comm]) parcelsByCommune[comm] = [];
      parcelsByCommune[comm].push(p);
    });

    // Compute stats
    const totalParcels = filtered.length;
    let grandCruCount = 0;
    let premierCruCount = 0;
    let villageCount = 0;
    let blancCount = 0;
    let rougeCount = 0;

    filtered.forEach((p) => {
      const niv = p.properties.niveau;
      if (niv === 'Grand Cru') grandCruCount++;
      else if (niv === '1er Cru') premierCruCount++;
      else if (niv === 'Village') villageCount++;

      const col = p.properties.couleur || 'Blanc';
      if (col === 'Rouge' || col === 'Passetougrain') rougeCount++;
      else blancCount++;
    });

    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <base href="${origin}/">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');

    :root {
      --primary: #854d0e;
      --primary-light: #fef3c7;
      --accent: #b45309;
      --dark: #09090b;
      --gray-50: #fafafa;
      --gray-100: #f4f4f5;
      --gray-200: #e4e4e7;
      --gray-300: #d4d4d8;
      --gray-600: #52525b;
      --gray-800: #27272a;
      --grand-cru: #b45309;
      --premier-cru: #7c3aed;
      --village: #059669;
      --regionale: #2563eb;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      background-color: #ffffff;
      color: #18181b;
      font-size: 11pt;
      line-height: 1.4;
      padding: 0;
      margin: 0;
    }

    /* PRINT LAYOUT RULES */
    @page {
      size: ${isAtlas ? 'A4 landscape' : 'A4 portrait'};
      margin: ${isAtlas ? '10mm 12mm' : '12mm 14mm'};
    }

    @media print {
      .no-print {
        display: none !important;
      }
      body {
        background: white;
      }
      .page-break {
        page-break-after: always;
        break-after: page;
      }
      .avoid-break {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      .document-container {
        max-width: 100% !important;
        box-shadow: none !important;
        padding: 0 !important;
        margin: 0 !important;
      }
    }

    /* SCREEN PREVIEW CONTAINER */
    .document-container {
      max-width: ${isAtlas ? '1180px' : '900px'};
      margin: 20px auto;
      background: white;
      padding: 24px 32px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.12);
      border-radius: 8px;
    }

    /* FLOATING ACTION BAR FOR SCREEN */
    .floating-bar {
      position: sticky;
      top: 12px;
      z-index: 999;
      background: #09090b;
      color: white;
      padding: 12px 20px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 24px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.3);
      border: 1px solid #27272a;
    }

    .floating-bar button {
      background: #f59e0b;
      color: #09090b;
      border: none;
      font-weight: 800;
      font-size: 13px;
      padding: 10px 18px;
      border-radius: 12px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.15s ease;
    }

    .floating-bar button:hover {
      background: #fbbf24;
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: #27272a !important;
      color: #f4f4f5 !important;
    }

    .btn-secondary:hover {
      background: #3f3f46 !important;
    }

    /* COVER PAGE */
    .cover-page {
      min-height: ${isAtlas ? '180mm' : '260mm'};
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border: 3px double #b45309;
      padding: 40px;
      margin-bottom: 24px;
      background: linear-gradient(135deg, #fffbf0 0%, #ffffff 50%, #fef3c7 100%);
      text-align: center;
      position: relative;
    }

    .cover-header {
      margin-top: 30px;
    }

    .cover-logo-badge {
      display: inline-block;
      border: 2px solid #b45309;
      padding: 6px 18px;
      font-family: 'Cinzel', serif;
      font-weight: 800;
      font-size: 14pt;
      letter-spacing: 4px;
      color: #78350f;
      text-transform: uppercase;
      margin-bottom: 20px;
      background: #ffffff;
    }

    .cover-title {
      font-family: 'Cinzel', serif;
      font-size: 26pt;
      font-weight: 900;
      color: #18181b;
      letter-spacing: 1px;
      line-height: 1.2;
      text-transform: uppercase;
      margin-bottom: 12px;
    }

    .cover-subtitle {
      font-size: 13pt;
      font-weight: 600;
      color: #b45309;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }

    .cover-millesime {
      display: inline-block;
      background: #78350f;
      color: #fef3c7;
      padding: 4px 16px;
      border-radius: 20px;
      font-weight: 800;
      font-size: 12pt;
      letter-spacing: 2px;
      margin-top: 10px;
    }

    .cover-stats-box {
      margin: 40px auto;
      max-width: 600px;
      background: rgba(255,255,255,0.9);
      border: 1px solid #d4d4d8;
      border-radius: 12px;
      padding: 18px 24px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      text-align: center;
    }

    .cover-stat-val {
      font-size: 20pt;
      font-weight: 900;
      color: #78350f;
      line-height: 1;
    }

    .cover-stat-label {
      font-size: 8.5pt;
      font-weight: 700;
      color: #52525b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 4px;
    }

    .cover-footer {
      border-top: 1px solid #d4d4d8;
      padding-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9pt;
      color: #71717a;
      font-weight: 600;
    }

    /* SECTION HEADER */
    .commune-header {
      background: #18181b;
      color: #ffffff;
      padding: 10px 16px;
      border-radius: 8px;
      margin: 24px 0 12px 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .commune-title {
      font-family: 'Cinzel', serif;
      font-size: 13pt;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .commune-count {
      background: #f59e0b;
      color: #09090b;
      font-size: 9pt;
      font-weight: 900;
      padding: 2px 10px;
      border-radius: 12px;
    }

    /* TABLE FOR VENDANGES LIVRET */
    .vendanges-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.5pt;
      margin-bottom: 20px;
    }

    .vendanges-table th {
      background: #f4f4f5;
      color: #27272a;
      font-weight: 800;
      text-transform: uppercase;
      font-size: 7.5pt;
      letter-spacing: 0.5px;
      padding: 8px 6px;
      border: 1px solid #d4d4d8;
      text-align: left;
    }

    .vendanges-table td {
      padding: 7px 6px;
      border: 1px solid #e4e4e7;
      vertical-align: top;
    }

    .vendanges-table tr:nth-child(even) {
      background-color: #fafafa;
    }

    .code-badge {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 800;
      font-size: 8.5pt;
      color: #78350f;
      background: #fef3c7;
      padding: 2px 5px;
      border-radius: 4px;
      border: 1px solid #fde68a;
      display: inline-block;
      white-space: nowrap;
    }

    .level-badge {
      font-size: 7pt;
      font-weight: 800;
      text-transform: uppercase;
      padding: 1.5px 5px;
      border-radius: 4px;
      display: inline-block;
      white-space: nowrap;
    }

    .badge-gc { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
    .badge-1er { background: #f3e8ff; color: #6b21a8; border: 1px solid #d8b4fe; }
    .badge-vil { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
    .badge-reg { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }

    .color-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 4px;
    }
    .dot-blanc { background: #f59e0b; }
    .dot-rouge { background: #dc2626; }
    .dot-aligote { background: #06b6d4; }

    /* CHECKBOXES FOR VENDANGES TABLE */
    .releve-box {
      border: 1px dashed #a1a1aa;
      background: #ffffff;
      padding: 3px 5px;
      border-radius: 4px;
      font-size: 7pt;
      color: #71717a;
      min-width: 140px;
    }

    /* ATLAS ILLUSTRE FICHE CARD LAYOUT (A4 OPTIMIZED) */
    .atlas-fiche-card {
      border: 1.5px solid #b45309;
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 24px;
      background: #ffffff;
      page-break-inside: avoid;
      break-inside: avoid;
      position: relative;
    }

    .atlas-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #b45309;
      padding-bottom: 10px;
      margin-bottom: 12px;
      gap: 16px;
    }

    .atlas-climat-title {
      font-family: 'Cinzel', serif;
      font-size: 16pt;
      font-weight: 900;
      color: #18181b;
      line-height: 1.1;
      text-transform: uppercase;
    }

    .atlas-appellation {
      font-size: 10pt;
      font-weight: 700;
      color: #b45309;
      margin-top: 2px;
    }

    .atlas-grid {
      display: grid;
      grid-template-columns: ${isAtlas ? '1.1fr 1fr 0.9fr' : '1fr 1fr'};
      gap: 14px;
      align-items: stretch;
    }

    .atlas-image-container {
      border: 1px solid #d4d4d8;
      border-radius: 8px;
      overflow: hidden;
      background: #09090b;
      position: relative;
      text-align: center;
      display: flex;
      flex-direction: column;
    }

    .atlas-image-label {
      background: #18181b;
      color: #f4f4f5;
      font-size: 8pt;
      font-weight: 800;
      padding: 5px 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #27272a;
    }

    .atlas-image-body {
      position: relative;
      flex: 1;
      min-height: ${isAtlas ? '175px' : '200px'};
      background: #09090b;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .atlas-img {
      width: 100%;
      height: 100%;
      max-height: ${isAtlas ? '185px' : '210px'};
      object-fit: contain;
      display: block;
      background: #09090b;
    }

    .atlas-img-placeholder {
      padding: 24px;
      color: #71717a;
      font-size: 8pt;
      font-weight: 600;
      text-align: center;
    }

    /* Anneau orange sur la carte imprimable */
    .pin-overlay {
      position: absolute;
      transform: translate(-50%, -50%);
      width: 28px;
      height: 28px;
      border: 3px solid #f97316;
      background: rgba(249, 115, 22, 0.35);
      border-radius: 50%;
      box-shadow: 0 0 8px rgba(249, 115, 22, 0.9);
      pointer-events: none;
      z-index: 10;
    }

    .pin-dot {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 6px;
      height: 6px;
      background: #f97316;
      border-radius: 50%;
      box-shadow: 0 0 4px #000;
    }

    .atlas-info-box {
      background: #fafafa;
      border: 1px solid #e4e4e7;
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 8.5pt;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .atlas-photos-section {
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px dashed #d4d4d8;
    }

    .atlas-photos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 8px;
      margin-top: 6px;
    }

    .atlas-photo-item {
      border: 1px solid #e4e4e7;
      border-radius: 6px;
      overflow: hidden;
      background: #09090b;
      position: relative;
    }

    .atlas-photo-item img {
      width: 100%;
      height: 85px;
      object-fit: cover;
      display: block;
    }

    .atlas-photo-caption {
      padding: 2px 4px;
      background: #18181b;
      color: #e4e4e7;
      font-size: 6.5pt;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px dotted #e4e4e7;
      padding-bottom: 4px;
    }

    .info-label {
      font-weight: 700;
      color: #71717a;
    }

    .info-val {
      font-weight: 800;
      color: #18181b;
      text-align: right;
    }

    .notes-box {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 6px;
      padding: 6px 8px;
      font-size: 8pt;
      color: #78350f;
      line-height: 1.3;
      margin-top: 4px;
    }

    .harvest-fill-box {
      border: 1.5px dashed #71717a;
      border-radius: 6px;
      padding: 8px;
      background: #ffffff;
      font-size: 8pt;
      margin-top: 6px;
    }

    .page-footer {
      display: flex;
      justify-content: space-between;
      font-size: 8pt;
      color: #a1a1aa;
      border-top: 1px solid #e4e4e7;
      padding-top: 6px;
      margin-top: 8px;
      font-weight: 600;
    }
  </style>
</head>
<body>

  <!-- Floating screen control bar (never printed) -->
  <div class="floating-bar no-print">
    <div>
      <strong style="font-size: 14px; color: #f59e0b;">${isAtlas ? 'Grand Atlas Parcellaire' : 'Livret des Vendanges'}</strong>
      <span style="font-size: 12px; color: #a1a1aa; margin-left: 8px;">(${filtered.length} parcelles • Millésime ${millesime})</span>
    </div>
    <div style="display: flex; gap: 10px;">
      <button onclick="window.print()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        Imprimer / Enregistrer en PDF
      </button>
      <button class="btn-secondary" onclick="window.close()">
        Fermer
      </button>
    </div>
  </div>

  <div class="document-container">

    ${options.includeCoverPage ? `
    <!-- COVER PAGE -->
    <div class="cover-page page-break">
      <div class="cover-header">
        <div class="cover-logo-badge">Domaine Olivier Leflaive</div>
        <h1 class="cover-title">${isAtlas ? 'Grand Atlas Parcellaire' : 'Livret des Vendanges'}</h1>
        <div class="cover-subtitle">${isAtlas ? 'Fiches Illustrées des Climats, Plans & Terroirs' : 'Circuit de Récolte, Fiches Terrain & Relevés de Coupe'}</div>
        <div class="cover-millesime">MILLÉSIME ${millesime}</div>
      </div>

      <div class="cover-stats-box">
        <div>
          <div class="cover-stat-val">${totalParcels}</div>
          <div class="cover-stat-label">Parcelles au Livret</div>
        </div>
        <div>
          <div class="cover-stat-val">${grandCruCount + premierCruCount}</div>
          <div class="cover-stat-label">Crus d'Exception</div>
        </div>
        <div>
          <div class="cover-stat-val">${Object.keys(parcelsByCommune).length}</div>
          <div class="cover-stat-label">Communes & Villages</div>
        </div>
      </div>

      <div style="font-size: 10pt; color: #52525b; font-weight: 600; max-width: 550px; margin: 0 auto;">
        ${options.communeFilter !== 'ALL' ? `Édition spécifique : <strong>Secteur ${options.communeFilter}</strong><br>` : 'Édition Intégrale de la Côte de Beaune & Côte Chalonnaise<br>'}
        ${options.equipeName ? `Chef d'équipe / Équipe de coupe : <strong>${options.equipeName}</strong>` : 'Document officiel d\'exploitation terrain & cave'}
      </div>

      <div class="cover-footer">
        <span>Domaine Olivier Leflaive • Place du Monument, 21190 Puligny-Montrachet</span>
        <span>Édité le ${dateFormatted}</span>
      </div>
    </div>
    ` : ''}

    ${isAtlas ? this.renderAtlasContent(parcelsByCommune, options) : this.renderVendangesContent(parcelsByCommune, options)}

  </div>

  <script>
    // Auto-launch print dialog on load if query param print=1 is present
    window.addEventListener('load', function() {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('print') === 'true') {
        setTimeout(function() {
          window.print();
        }, 500);
      }
    });
  </script>
</body>
</html>`;
  }

  /**
   * Render Mode 1: Table-based Vendanges Booklet (compact, field-ready)
   */
  private renderVendangesContent(parcelsByCommune: Record<string, ParcelFeature[]>, options: LivretPrintOptions): string {
    const communeKeys = Object.keys(parcelsByCommune).sort();

    return communeKeys.map((commune) => {
      const parcels = parcelsByCommune[commune];

      return `
      <div class="avoid-break" style="margin-bottom: 24px;">
        <div class="commune-header">
          <div class="commune-title">
            <span>📍 ${commune}</span>
          </div>
          <div class="commune-count">${parcels.length} parcelle(s)</div>
        </div>

        <table class="vendanges-table">
          <thead>
            <tr>
              <th style="width: 75px;">Code Livret</th>
              <th style="width: 140px;">Climat / Parcelle</th>
              <th style="width: 120px;">Appellation</th>
              <th style="width: 70px;">Niveau</th>
              <th style="width: 50px;">Couleur</th>
              <th style="width: 45px; text-align: center;">Diapo</th>
              <th style="width: 130px;">Rangs / Apporteur</th>
              <th>Consignes d'accès & Relevé Récolte</th>
            </tr>
          </thead>
          <tbody>
            ${parcels.map((parcel) => {
              const p = parcel.properties;
              const isGc = p.niveau === 'Grand Cru';
              const is1er = p.niveau === '1er Cru';
              const isVil = p.niveau === 'Village';
              const badgeClass = isGc ? 'badge-gc' : is1er ? 'badge-1er' : isVil ? 'badge-vil' : 'badge-reg';
              const colorDotClass = p.couleur === 'Rouge' ? 'dot-rouge' : p.couleur === 'Aligoté' ? 'dot-aligote' : 'dot-blanc';

              return `
              <tr>
                <td>
                  <span class="code-badge">${p.code_livret || p.code_parcel || '-'}</span>
                  ${p.numero_livret ? `<div style="font-size: 7pt; font-weight: 700; color: #92400e;">N°${p.numero_livret}</div>` : ''}
                </td>
                <td>
                  <strong style="font-size: 9pt; color: #09090b;">${p.nom_parcelle || p.climat || '-'}</strong>
                  ${p.surface_ha ? `<div style="font-size: 7.5pt; color: #71717a;">${p.surface_ha} ha • ${p.cepage || ''}</div>` : ''}
                </td>
                <td style="font-weight: 600; color: #27272a;">${p.appellation || p.nom_app || '-'}</td>
                <td>
                  <span class="level-badge ${badgeClass}">${p.niveau || 'Village'}</span>
                </td>
                <td>
                  <span class="color-dot ${colorDotClass}"></span>
                  <span style="font-size: 7.5pt; font-weight: 600;">${p.couleur || 'Blanc'}</span>
                </td>
                <td style="text-align: center; font-weight: 800; color: #b45309; font-family: monospace;">
                  ${p.page_livret ? `p.${p.page_livret}` : '-'}
                </td>
                <td>
                  ${p.nb_rangs_details ? `<div style="font-weight: 700; color: #18181b;">Rangs: ${p.nb_rangs_details}</div>` : ''}
                  ${p.proprietaire ? `<div style="font-size: 7.5pt; color: #b45309; font-weight: 700;">App: ${p.proprietaire}</div>` : ''}
                </td>
                <td>
                  ${p.notes_acces ? `<div style="font-size: 7.5pt; color: #92400e; font-weight: 600; margin-bottom: 3px;">⚠️ ${p.notes_acces}</div>` : ''}
                  ${options.includeCheckboxes ? `
                  <div class="releve-box">
                    <strong>Pointage :</strong> [ ] Date: __/__ | Caisses: ____ | hL: ____ | kg: ____
                  </div>
                  ` : ''}
                </td>
              </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
      `;
    }).join('');
  }

  /**
   * Helper to ensure image URLs are fully qualified Data URIs or absolute URLs for all offline & print contexts
   */
  private toAbsoluteUrl(path: string | undefined | null, origin: string): string {
    if (!path) return '';
    const trimmed = path.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('data:')) {
      return trimmed;
    }

    // Check in-memory base64 cache first for 100% standalone offline display
    if (this.imageBase64Cache.has(trimmed)) {
      return this.imageBase64Cache.get(trimmed)!;
    }
    const cleanWithSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    if (this.imageBase64Cache.has(cleanWithSlash)) {
      return this.imageBase64Cache.get(cleanWithSlash)!;
    }

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('blob:')) {
      return trimmed;
    }
    return origin ? `${origin}${cleanWithSlash}` : cleanWithSlash;
  }

  /**
   * Render Mode 2: Grand Atlas Illustré (1 fiche complète par parcelle avec photos & cartes)
   */
  private renderAtlasContent(parcelsByCommune: Record<string, ParcelFeature[]>, options: LivretPrintOptions): string {
    const communeKeys = Object.keys(parcelsByCommune).sort();
    const origin = typeof window !== 'undefined' && window.location ? window.location.origin : '';

    return communeKeys.map((commune) => {
      const parcels = parcelsByCommune[commune];

      return parcels.map((parcel) => {
        const p = parcel.properties;
        const pageLivret = p.page_livret;

        // Resolve absolute URLs for reliable rendering across all print / preview contexts
        const rawCartePath = p.carte_annotee || (pageLivret ? `cartes/carte_p${pageLivret}.jpg` : '');
        const rawSlidePath = p.diapositive || (pageLivret ? `slides/slide_${pageLivret}.jpg` : '');

        const carteUrl = this.toAbsoluteUrl(rawCartePath, origin);
        const slideUrl = this.toAbsoluteUrl(rawSlidePath, origin);

        const hasPin = p.pin_x_pct !== null && p.pin_x_pct !== undefined && p.pin_y_pct !== null && p.pin_y_pct !== undefined;
        const numeroSurCarte = p.numero_sur_carte || p.numero_livret;

        const isGc = p.niveau === 'Grand Cru';
        const is1er = p.niveau === '1er Cru';
        const isVil = p.niveau === 'Village';
        const badgeClass = isGc ? 'badge-gc' : is1er ? 'badge-1er' : isVil ? 'badge-vil' : 'badge-reg';

        // Extract custom terrain photos uploaded by team
        const rawPhotos = (p.photos && p.photos.length > 0) 
          ? p.photos 
          : (p.photo_url ? [{ id: 'main', url: p.photo_url, caption: 'Photo d\'ensemble' }] : []);

        const customPhotos = rawPhotos.map((photo) => ({
          ...photo,
          url: this.toAbsoluteUrl(photo.url, origin)
        }));

        // Fallback for visual slots if carte or slide is missing
        const slot1Image = carteUrl || (customPhotos.length > 0 ? customPhotos[0].url : '');
        const slot1IsCarte = Boolean(carteUrl);

        const slot2Image = slideUrl || (customPhotos.length > 1 ? customPhotos[1].url : (!slot1IsCarte && customPhotos.length > 0 ? customPhotos[0].url : ''));
        const slot2IsSlide = Boolean(slideUrl);

        return `
        <div class="atlas-fiche-card page-break">
          <!-- Card Header -->
          <div class="atlas-card-header">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span class="level-badge ${badgeClass}" style="font-size: 8.5pt; padding: 2px 8px;">${p.niveau || 'Village'}</span>
                <span style="font-size: 8.5pt; font-weight: 700; color: #52525b;">${p.couleur || 'Blanc'} • ${p.cepage || 'Chardonnay'}</span>
                ${p.page_livret ? `<span style="font-size: 8pt; font-weight: 800; background: #27272a; color: #f4f4f5; padding: 1px 6px; border-radius: 4px;">Livret Page ${p.page_livret}</span>` : ''}
              </div>
              <h2 class="atlas-climat-title">${p.nom_parcelle || p.climat || 'Parcelle sans nom'}</h2>
              <div class="atlas-appellation">Appellation ${p.appellation || p.nom_app || commune} • Commune de ${commune}</div>
            </div>

            <div style="text-align: right;">
              <span class="code-badge" style="font-size: 11pt; padding: 4px 10px;">${p.code_livret || p.code_parcel || '-'}</span>
              ${numeroSurCarte ? `<div style="font-size: 8.5pt; font-weight: 900; color: #ea580c; margin-top: 3px;">PASTILLE N°${numeroSurCarte}</div>` : ''}
            </div>
          </div>

          <!-- Card Content Grid -->
          <div class="atlas-grid">
            <!-- 1. Carte Annotée avec Anneau Orange ou Photo Principale -->
            <div class="atlas-image-container">
              <div class="atlas-image-label">
                <span>📍 ${slot1IsCarte ? 'Carte Annotée du Secteur' : 'Photo de la Parcelle'}</span>
                ${(slot1IsCarte && numeroSurCarte) ? `<span style="background: #f97316; color: white; padding: 1px 5px; border-radius: 3px; font-size: 7pt;">Repère N°${numeroSurCarte}</span>` : ''}
              </div>
              <div class="atlas-image-body">
                ${slot1Image ? `
                  <img src="${slot1Image}" alt="Carte annotée secteur" class="atlas-img" loading="eager" decoding="sync" />
                  ${(slot1IsCarte && hasPin) ? `
                  <div class="pin-overlay" style="left: ${p.pin_x_pct}%; top: ${p.pin_y_pct}%;">
                    <div class="pin-dot"></div>
                  </div>
                  ` : ''}
                ` : `
                  <div class="atlas-img-placeholder">
                    <div style="font-size: 20pt; margin-bottom: 4px;">🗺️</div>
                    <div>Plan du secteur non disponible</div>
                  </div>
                `}
              </div>
            </div>

            <!-- 2. Diapositive PowerPoint Officielle du Domaine ou Photo Complémentaire -->
            <div class="atlas-image-container">
              <div class="atlas-image-label">
                <span>🏛️ ${slot2IsSlide ? 'Plan Officiel du Domaine' : 'Visuel Terrain'}</span>
                ${slot2IsSlide ? `<span style="color: #f59e0b;">Page ${pageLivret || '-'}</span>` : ''}
              </div>
              <div class="atlas-image-body">
                ${slot2Image ? `
                  <img src="${slot2Image}" alt="Diapositive domaine" class="atlas-img" loading="eager" decoding="sync" />
                ` : `
                  <div class="atlas-img-placeholder">
                    <div style="font-size: 20pt; margin-bottom: 4px;">🏛️</div>
                    <div>Fiche domaine textuelle</div>
                    <div style="font-size: 7pt; color: #a1a1aa; margin-top: 4px;">${p.nom_parcelle || 'Parcelle'}</div>
                  </div>
                `}
              </div>
            </div>

            <!-- 3. Fiche Technique, Accès & Émargement -->
            <div class="atlas-info-box">
              <div class="info-row">
                <span class="info-label">Propriétaire / Apporteur :</span>
                <span class="info-val" style="color: #b45309;">${p.proprietaire || 'Domaine Olivier Leflaive'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Rangs & Configuration :</span>
                <span class="info-val">${p.nb_rangs_details || 'Non spécifié'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Surface :</span>
                <span class="info-val">${p.surface_ha ? `${p.surface_ha} ha` : (p.contenance_ha ? `${p.contenance_ha} ha` : 'N/A')}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Cépage :</span>
                <span class="info-val">${p.cepage || (p.couleur === 'Rouge' ? 'Pinot Noir' : 'Chardonnay')}</span>
              </div>

              ${p.notes_acces ? `
              <div class="notes-box">
                <strong>⚠️ Accès & Repères :</strong> ${p.notes_acces}
              </div>
              ` : ''}

              ${p.notes ? `
              <div style="font-size: 7.5pt; color: #52525b; margin-top: 3px;">
                <strong>Observations :</strong> ${p.notes}
              </div>
              ` : ''}

              <!-- Section Relevé Récolte -->
              ${options.includeCheckboxes ? `
              <div class="harvest-fill-box">
                <strong style="font-size: 8pt; color: #18181b;">RELEVÉ DE VENDANGE :</strong>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-top: 4px; font-size: 7.5pt;">
                  <div>Date : ___/___/2024</div>
                  <div>Caisses : _________</div>
                  <div>Volume hL : ______</div>
                  <div>Poids kg : _________</div>
                </div>
                <div style="margin-top: 3px; font-size: 7pt; color: #71717a;">Visa Coupeur : _________________</div>
              </div>
              ` : ''}
            </div>
          </div>

          <!-- Section Galerie Photos Terrain Enregistrées (si photos existantes) -->
          ${(options.includeTerrainPhotos && customPhotos.length > 0) ? `
          <div class="atlas-photos-section">
            <div style="font-size: 8pt; font-weight: 800; color: #27272a; display: flex; align-items: center; gap: 6px;">
              <span>📷</span>
              <span>PHOTOS DE TERRAIN DE L'ÉQUIPE (${customPhotos.length})</span>
            </div>
            <div class="atlas-photos-grid">
              ${customPhotos.map((photo) => `
                <div class="atlas-photo-item">
                  <img src="${photo.url}" alt="${photo.caption || 'Terrain'}" loading="eager" />
                  ${photo.caption ? `<div class="atlas-photo-caption" title="${photo.caption}">${photo.caption}</div>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}

          <!-- Card Footer -->
          <div class="page-footer">
            <span>Domaine Olivier Leflaive • Livret Parcellaire Officiel</span>
            <span>${p.code_livret || ''} • ${p.nom_parcelle || p.climat || ''} • Page ${pageLivret || ''}</span>
          </div>
        </div>
        `;
      }).join('');
    }).join('');
  }

  /**
   * Opens dedicated print window or triggers iframe print
   */
  public openPrintWindow(parcels: ParcelFeature[], options: LivretPrintOptions): Window | null {
    const html = this.generatePrintableHtml(parcels, options);
    const printWindow = window.open('', '_blank');

    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      return printWindow;
    }

    return null;
  }

  /**
   * Fallback iframe print method if popup is blocked
   */
  public printViaIframe(parcels: ParcelFeature[], options: LivretPrintOptions): void {
    const html = this.generatePrintableHtml(parcels, options);
    
    // Remove previous print iframe if any
    const existingIframe = document.getElementById('hidden-print-iframe');
    if (existingIframe) {
      existingIframe.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'hidden-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }, 500);
    }
  }

  /**
   * Export standalone HTML file for saving/offline viewing
   */
  public downloadHtmlFile(parcels: ParcelFeature[], options: LivretPrintOptions): void {
    const html = this.generatePrintableHtml(parcels, options);
    const filename = options.mode === 'atlas_illustre'
      ? `Grand_Atlas_Parcellaire_Leflaive_${options.communeFilter !== 'ALL' ? options.communeFilter : 'Integral'}.html`
      : `Livret_Vendanges_Leflaive_${options.communeFilter !== 'ALL' ? options.communeFilter : 'Integral'}.html`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const livretPrintService = new LivretPrintService();
