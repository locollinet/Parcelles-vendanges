import React, { useState, useRef } from 'react';
import { ParcelFeature } from '../types';
import { importExportManager } from '../services/ImportExportManager';
import { Upload, Download, FileText, CheckCircle, AlertCircle, X, Database } from 'lucide-react';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  cachedParcels: ParcelFeature[];
  onImportFeatures: (features: ParcelFeature[], sourceName: string) => void;
  fieldMode?: boolean;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  cachedParcels,
  onImportFeatures,
  fieldMode,
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [isDragging, setIsDragging] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error';
    message?: string;
    count?: number;
    filename?: string;
  }>({ type: 'idle' });

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processUploadedFile(file);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processUploadedFile(file);
    }
  };

  const processUploadedFile = async (file: File) => {
    setImportStatus({ type: 'loading', message: `Analyse du fichier ${file.name}...` });
    try {
      const res = await importExportManager.parseFile(file);
      setImportStatus({
        type: 'success',
        message: `Importation réussie ! ${res.count} parcelles chargées depuis ${res.filename}.`,
        count: res.count,
        filename: res.filename,
      });
      onImportFeatures(res.features, res.filename);
    } catch (err: any) {
      setImportStatus({
        type: 'error',
        message: err.message || "Erreur lors de l'importation du fichier.",
      });
    }
  };

  const handleExportGeoJSON = () => {
    importExportManager.exportToGeoJSON(cachedParcels, `parcelles_bourgogne_${cachedParcels.length}.geojson`);
  };

  const handleExportCSV = () => {
    importExportManager.exportToCSV(cachedParcels, `parcelles_notes_bourgogne.csv`);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-xl rounded-3xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh] ${
          fieldMode
            ? 'bg-zinc-950 border-amber-500/40 text-zinc-100'
            : 'bg-zinc-900 border-zinc-800 text-zinc-100'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-wide text-zinc-100">
                Données Domaine & Cartographie
              </h3>
              <p className="text-xs text-zinc-400">Import/Export GeoJSON, KML, CSV & Registres</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-zinc-800/80 bg-zinc-950/30 p-1.5 gap-2 px-6">
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'import'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Upload className="w-4 h-4" /> Importer
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'export'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Download className="w-4 h-4" /> Exporter ({cachedParcels.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {activeTab === 'import' ? (
            <div className="space-y-4">
              <p className="text-xs text-zinc-300 leading-relaxed">
                Importez les contours de vos parcelles de domaine, fichiers SIG vignerons ou registres
                de vendanges sous format <strong>GeoJSON, KML, JSON ou CSV</strong>.
              </p>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                  isDragging
                    ? 'border-amber-400 bg-amber-500/10 scale-[0.99]'
                    : 'border-zinc-700/80 bg-zinc-950/40 hover:border-amber-500/50 hover:bg-zinc-900/60'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".geojson,.json,.kml,.csv"
                  className="hidden"
                />
                <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-400 mb-3 border border-amber-500/20">
                  <Upload className="w-8 h-8" />
                </div>
                <span className="text-sm font-bold text-zinc-100">Glissez-déposez un fichier ici</span>
                <span className="text-xs text-zinc-400 mt-1">
                  Formats supportés : .geojson, .kml, .csv, .json
                </span>
              </div>

              {/* Status Message */}
              {importStatus.type === 'loading' && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  {importStatus.message}
                </div>
              )}

              {importStatus.type === 'success' && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  {importStatus.message}
                </div>
              )}

              {importStatus.type === 'error' && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {importStatus.message}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-zinc-300 leading-relaxed">
                Exportez les parcelles actuellement en mémoire (<strong>{cachedParcels.length} parcelles</strong>) avec leurs données géométriques, informations de climat, vignerons et vos notes de dégustation.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleExportGeoJSON}
                  className="flex items-start gap-3 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-800/50 text-left transition-all active:scale-95 group"
                >
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-zinc-950 transition-colors">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-zinc-100">Export GeoJSON</span>
                    <span className="block text-[11px] text-zinc-400 mt-0.5">
                      Contours géométriques complets pour QGIS / ArcGIS
                    </span>
                  </div>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="flex items-start gap-3 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-800/50 text-left transition-all active:scale-95 group"
                >
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-zinc-950 transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-zinc-100">Export CSV / Excel</span>
                    <span className="block text-[11px] text-zinc-400 mt-0.5">
                      Tableur avec climats, surfaces & vos notes
                    </span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
