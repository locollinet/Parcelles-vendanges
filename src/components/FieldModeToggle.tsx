import React from 'react';
import { Sun, Eye } from 'lucide-react';

interface FieldModeToggleProps {
  fieldMode: boolean;
  onToggle: () => void;
}

export const FieldModeToggle: React.FC<FieldModeToggleProps> = ({ fieldMode, onToggle }) => {
  return (
    <div className="fixed top-24 right-4 sm:right-6 z-[1000] pointer-events-auto">
      <button
        onClick={onToggle}
        className={`px-3 py-2 rounded-xl text-xs font-bold border shadow-xl backdrop-blur-md flex items-center gap-1.5 transition-all active:scale-95 ${
          fieldMode
            ? 'bg-amber-500 text-zinc-950 border-amber-400 font-extrabold shadow-amber-500/30'
            : 'bg-white/95 text-slate-800 border-slate-200/90 hover:bg-slate-50 shadow-slate-900/5'
        }`}
        title="Activer le mode contraste élevé pour le plein soleil en vigne"
      >
        <Sun className={`w-4 h-4 ${fieldMode ? 'text-zinc-950' : 'text-amber-400'}`} />
        <span className="hidden sm:inline">Mode Terrain</span>
      </button>
    </div>
  );
};
