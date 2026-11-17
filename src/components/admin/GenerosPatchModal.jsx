import React from 'react';

/**
 * Modal para anexar géneros a un anime existente sin reemplazar los previos (PATCH)
 */
export default function GenerosPatchModal({
  anime,
  generos = [],
  selectedGeneros = [],
  onToggleGenero,
  onClose,
  onSubmit,
}) {
  if (!anime) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="bg-[#11131f] border border-amber-400/40 rounded-2xl max-w-md w-full p-6 flex flex-col gap-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">
            Sumar géneros a "{anime.titulo}"
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Elige los géneros que deseas anexar. Los géneros previos se conservarán intactos en el backend.
        </p>

        <div className="p-3.5 rounded-xl bg-[#090a10] border border-[#1e2338] max-h-40 overflow-y-auto flex flex-wrap gap-1.5">
          {generos.map((g) => {
            const yaLoTiene = anime.generos?.includes(g.nombre);
            const isSelected = selectedGeneros.includes(g.nombre);
            return (
              <button
                key={g._id}
                disabled={yaLoTiene}
                type="button"
                onClick={() => onToggleGenero(g.nombre)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  yaLoTiene
                    ? 'bg-[#181a2b] text-slate-600 cursor-not-allowed'
                    : isSelected
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'bg-[#181a2b] text-slate-300 hover:text-white'
                }`}
              >
                {yaLoTiene ? `✓ ${g.nombre}` : isSelected ? `+ ${g.nombre}` : g.nombre}
              </button>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={onSubmit}
            disabled={selectedGeneros.length === 0}
            className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs cursor-pointer disabled:opacity-40"
          >
            Guardar ({selectedGeneros.length})
          </button>
        </div>
      </div>
    </div>
  );
}
