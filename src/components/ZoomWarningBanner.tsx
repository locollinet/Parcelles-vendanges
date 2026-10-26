import React from 'react';
import { ZoomIn, Info } from 'lucide-react';

interface ZoomWarningBannerProps {
  currentZoom: number;
  minZoomThreshold: number;
  isLoadingNetwork: boolean;
}

export const ZoomWarningBanner: React.FC<ZoomWarningBannerProps> = ({
  currentZoom,
  minZoomThreshold,
  isLoadingNetwork,
}) => {
  if (currentZoom >= minZoomThreshold && !isLoadingNetwork) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[1000] pointer-events-auto">
      {currentZoom < minZoomThreshold ? (
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/95 border border-amber-300 text-amber-900 text-xs font-bold shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
          <ZoomIn className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Zoomez (Zoom ≥ {minZoomThreshold}) pour charger les parcelles</span>
        </div>
      ) : isLoadingNetwork ? (
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/95 border border-slate-200 text-slate-800 text-xs font-bold shadow-xl backdrop-blur-md animate-in fade-in duration-200">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          <span>Chargement BBOX des parcelles...</span>
        </div>
      ) : null}
    </div>
  );
};
