import { ParcelFeature, ParcelProperties } from '../types';

export class ImportExportManager {
  /**
   * Export features array to GeoJSON string download
   */
  public exportToGeoJSON(features: ParcelFeature[], filename = 'parcelles_bourgogne_export.geojson'): void {
    const collection = {
      type: 'FeatureCollection',
      features,
    };

    const jsonStr = JSON.stringify(collection, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    this.triggerDownload(blob, filename);
  }

  /**
   * Export features array to CSV format (compatible with Excel / Google Sheets)
   */
  public exportToCSV(features: ParcelFeature[], filename = 'parcelles_bourgogne_notes.csv'): void {
    const headers = [
      'ID Parcelle',
      'Code Cadastral',
      'Appellation INAO',
      'Climat / Lieu-dit',
      'Niveau Classification',
      'Commune',
      'Surface (ha)',
      'Vigneron / Domaine',
      'Cépage',
      'Notes & Observations',
    ];

    const rows = features.map((f) => {
      const p = f.properties;
      return [
        this.escapeCsv(p.id),
        this.escapeCsv(p.code_parcel || ''),
        this.escapeCsv(p.nom_app || ''),
        this.escapeCsv(p.climat || ''),
        this.escapeCsv(p.niveau || ''),
        this.escapeCsv(p.commune || ''),
        p.surface_ha ? p.surface_ha.toFixed(2) : '0.00',
        this.escapeCsv(p.vigneron || ''),
        this.escapeCsv(p.cepage || ''),
        this.escapeCsv(p.notes || ''),
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n'); // UTF-8 BOM for Excel
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    this.triggerDownload(blob, filename);
  }

  /**
   * Parse uploaded file (GeoJSON, JSON, KML, CSV) into ParcelFeature[]
   */
  public async parseFile(file: File): Promise<{ features: ParcelFeature[]; count: number; filename: string }> {
    const text = await file.text();
    const filename = file.name;
    const ext = filename.split('.').pop()?.toLowerCase();

    if (ext === 'geojson' || ext === 'json') {
      return this.parseGeoJSON(text, filename);
    } else if (ext === 'kml') {
      return this.parseKML(text, filename);
    } else if (ext === 'csv') {
      return this.parseCSV(text, filename);
    } else {
      throw new Error(`Format non supporté (${ext}). Format requis: GeoJSON, KML, CSV ou JSON.`);
    }
  }

  private parseGeoJSON(text: string, filename: string): { features: ParcelFeature[]; count: number; filename: string } {
    const parsed = JSON.parse(text);
    let rawFeatures: any[] = [];

    if (parsed.type === 'FeatureCollection' && Array.isArray(parsed.features)) {
      rawFeatures = parsed.features;
    } else if (parsed.type === 'Feature') {
      rawFeatures = [parsed];
    } else if (Array.isArray(parsed)) {
      rawFeatures = parsed;
    } else {
      throw new Error('Structure GeoJSON invalide.');
    }

    const features: ParcelFeature[] = rawFeatures.map((f, idx) => {
      const props = f.properties || {};
      const id = props.id || props.code_parcel || `IMPORT-${Date.now()}-${idx}`;
      return {
        type: 'Feature',
        id,
        geometry: f.geometry || { type: 'Polygon', coordinates: [] },
        properties: {
          id,
          code_parcel: props.code_parcel || props.id || `IMPORT-${idx + 1}`,
          nom_app: props.nom_app || props.appellation || 'Import Domaine',
          climat: props.climat || props.lieu_dit || props.name || `Climat Importé #${idx + 1}`,
          niveau: props.niveau || props.classification || 'Village',
          commune: props.commune || props.nom_com || 'Bourgogne',
          vigneron: props.vigneron || props.domaine || filename.replace(/\.[^/.]+$/, ''),
          surface_ha: props.surface_ha || (props.contenance ? props.contenance / 10000 : 0.5),
          cepage: props.cepage || 'Pinot Noir',
          notes: props.notes || `Importé le ${new Date().toLocaleDateString('fr-FR')} depuis ${filename}`,
        },
      };
    });

    return { features, count: features.length, filename };
  }

  private parseKML(kmlText: string, filename: string): { features: ParcelFeature[]; count: number; filename: string } {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kmlText, 'text/xml');
    const placemarks = Array.from(xmlDoc.getElementsByTagName('Placemark'));

    const features: ParcelFeature[] = [];

    placemarks.forEach((pm, idx) => {
      const name = pm.getElementsByTagName('name')[0]?.textContent || `Parcelle ${idx + 1}`;
      const desc = pm.getElementsByTagName('description')[0]?.textContent || '';
      const coordNode = pm.getElementsByTagName('coordinates')[0];

      if (coordNode && coordNode.textContent) {
        const rawCoords = coordNode.textContent.trim().split(/\s+/);
        const polygonCoords = rawCoords
          .map((pt) => {
            const parts = pt.split(',').map(Number);
            return parts.length >= 2 ? [parts[0], parts[1]] : null;
          })
          .filter((pt): pt is [number, number] => pt !== null);

        if (polygonCoords.length > 2) {
          const id = `KML-${Date.now()}-${idx}`;
          features.push({
            type: 'Feature',
            id,
            geometry: {
              type: 'Polygon',
              coordinates: [polygonCoords],
            },
            properties: {
              id,
              code_parcel: `KML-${idx + 1}`,
              nom_app: name.includes('Cru') ? name : 'Appellation Domaine',
              climat: name,
              niveau: name.toLowerCase().includes('grand cru')
                ? 'Grand Cru'
                : name.toLowerCase().includes('1er cru')
                ? '1er Cru'
                : 'Village',
              commune: 'Bourgogne',
              vigneron: filename.replace(/\.[^/.]+$/, ''),
              surface_ha: 0.75,
              cepage: 'Pinot Noir / Chardonnay',
              notes: desc || `Import KML: ${filename}`,
            },
          });
        }
      }
    });

    return { features, count: features.length, filename };
  }

  private parseCSV(csvText: string, filename: string): { features: ParcelFeature[]; count: number; filename: string } {
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length <= 1) {
      throw new Error('Le fichier CSV est vide ou ne contient que des entêtes.');
    }

    const separator = lines[0].includes(';') ? ';' : ',';
    const rows = lines.slice(1);
    const features: ParcelFeature[] = [];

    rows.forEach((row, idx) => {
      const cols = row.split(separator).map((c) => c.replace(/^["']|["']$/g, '').trim());
      if (cols.length >= 3) {
        const id = cols[0] || `CSV-${idx + 1}`;
        const code_parcel = cols[1] || id;
        const nom_app = cols[2] || 'Bourgogne';
        const climat = cols[3] || `Parcelle ${code_parcel}`;
        const niveau = (cols[4] || 'Village') as any;
        const commune = cols[5] || 'Bourgogne';
        const surface_ha = parseFloat(cols[6]) || 0.5;
        const vigneron = cols[7] || filename.replace(/\.[^/.]+$/, '');
        const cepage = cols[8] || 'Pinot Noir';
        const notes = cols[9] || `Import CSV ${filename}`;

        features.push({
          type: 'Feature',
          id,
          geometry: {
            type: 'Polygon',
            coordinates: [], // Non-geometric tabular import
          },
          properties: {
            id,
            code_parcel,
            nom_app,
            climat,
            niveau,
            commune,
            surface_ha,
            vigneron,
            cepage,
            notes,
          },
        });
      }
    });

    return { features, count: features.length, filename };
  }

  private escapeCsv(val: string): string {
    if (!val) return '""';
    const clean = val.replace(/"/g, '""');
    return `"${clean}"`;
  }

  private triggerDownload(blob: Blob, filename: string): void {
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

export const importExportManager = new ImportExportManager();
