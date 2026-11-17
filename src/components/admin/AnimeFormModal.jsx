import React from 'react';

/**
 * Modal para dar de alta o editar una serie del catálogo oficial
 */
export default function AnimeFormModal({
  isOpen,
  isEditing,
  animeForm,
  setAnimeForm,
  generos = [],
  onToggleGenero,
  onClose,
  onSubmit,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="bg-[#11131f] border border-[#1e2338] rounded-2xl max-w-lg w-full p-6 flex flex-col gap-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">
            {isEditing ? 'Editar Serie' : 'Nueva Serie en Catálogo'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">Título</label>
            <input
              type="text"
              required
              value={animeForm.titulo}
              onChange={(e) => setAnimeForm({ ...animeForm, titulo: e.target.value })}
              placeholder="Ej: Death Note"
              className="bg-[#090a10] border border-[#23273e] focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Géneros ({animeForm.generos.length} seleccionados)
            </label>
            <div className="p-3 rounded-xl bg-[#090a10] border border-[#23273e] max-h-36 overflow-y-auto flex flex-wrap gap-1.5">
              {generos.map((g) => {
                const isSelected = animeForm.generos.includes(g.nombre);
                return (
                  <button
                    type="button"
                    key={g._id}
                    onClick={() => onToggleGenero(g.nombre)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600 text-white font-bold'
                        : 'bg-[#181a2b] text-slate-400 hover:text-white'
                    }`}
                  >
                    {isSelected && '✓ '}
                    {g.nombre}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Total Episodios</label>
              <input
                type="number"
                min="0"
                required
                value={animeForm.totalEpisodios}
                onChange={(e) => setAnimeForm({ ...animeForm, totalEpisodios: e.target.value })}
                className="bg-[#090a10] border border-[#23273e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Estado</label>
              <select
                value={animeForm.estadoEmision}
                onChange={(e) => setAnimeForm({ ...animeForm, estadoEmision: e.target.value })}
                className="bg-[#090a10] border border-[#23273e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              >
                <option value="Finalizado">Finalizado</option>
                <option value="En emisión">En emisión</option>
                <option value="Por estrenar">Por estrenar</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">URL de Portada</label>
            <input
              type="url"
              required
              value={animeForm.imagenPortada}
              onChange={(e) => setAnimeForm({ ...animeForm, imagenPortada: e.target.value })}
              className="bg-[#090a10] border border-[#23273e] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">Sinopsis</label>
            <textarea
              required
              rows="3"
              value={animeForm.sinopsis}
              onChange={(e) => setAnimeForm({ ...animeForm, sinopsis: e.target.value })}
              className="bg-[#090a10] border border-[#23273e] rounded-xl p-3 text-xs text-white focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer shadow-md"
            >
              {isEditing ? 'Guardar Cambios' : 'Crear Serie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
