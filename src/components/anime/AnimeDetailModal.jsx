import React from 'react';
import { Star, Plus, Check, X, MessageSquare, Crown } from 'lucide-react';

/**
 * Modal con ficha técnica detallada y reseñas de un anime
 */
export default function AnimeDetailModal({
  anime,
  isOpen,
  onClose,
  reviews = [],
  user,
  isAlreadyInLibrary,
  onAddToLibrary,
  onNavigateToReviews,
}) {
  if (!isOpen || !anime) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#121422] border border-[#272d47] rounded-3xl max-w-2xl w-full p-5 sm:p-6 flex flex-col gap-5 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con portada y título */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4">
            <img
              src={anime.imagenPortada}
              alt={anime.titulo}
              referrerPolicy="no-referrer"
              className="w-14 sm:w-16 h-20 sm:h-24 rounded-xl object-cover bg-[#090a10] shadow-md flex-shrink-0"
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/150x200/121422/a855f7?text=Sin+Portada";
              }}
            />
            <div>
              <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                {anime.titulo}
              </h3>
              {anime.tituloOriginal && (
                <p className="text-xs text-slate-400 italic mt-0.5">{anime.tituloOriginal}</p>
              )}
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mt-1">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{anime.calificacionPromedio || 0} ★</span>
                <span className="text-slate-500 font-normal">({anime.totalResenas || 0} reseñas)</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1b1f33] hover:bg-[#282e4a] text-slate-400 hover:text-white flex items-center justify-center text-sm cursor-pointer flex-shrink-0 transition-colors"
            title="Cerrar ficha"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ficha técnica resumida */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded-xl bg-[#090a10] border border-[#1e2338]">
            <span className="text-[10px] text-slate-500 uppercase block">Episodios</span>
            <span className="font-bold text-white">
              {anime.totalEpisodios > 0 ? anime.totalEpisodios : 'Continuo'}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-[#090a10] border border-[#1e2338]">
            <span className="text-[10px] text-slate-500 uppercase block">Estado</span>
            <span className="font-bold text-purple-300 truncate block">{anime.estadoEmision}</span>
          </div>
          <div className="p-2 rounded-xl bg-[#090a10] border border-[#1e2338]">
            <span className="text-[10px] text-slate-500 uppercase block">Año</span>
            <span className="font-bold text-white">{anime.anioEstreno || '—'}</span>
          </div>
        </div>

        {/* Géneros */}
        <div className="flex flex-wrap gap-1.5">
          {Array.isArray(anime.generos) && anime.generos.map((g) => (
            <span key={g} className="px-2.5 py-0.5 rounded-lg bg-[#1a1d2e] text-[11px] font-semibold text-purple-300 border border-[#2b314e]">
              {g}
            </span>
          ))}
        </div>

        {/* Sinopsis */}
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Sinopsis</span>
          <p className="text-xs text-slate-300 leading-relaxed bg-[#090a10] p-3 rounded-xl border border-[#1e2338]">
            {anime.sinopsis || 'Sin sinopsis disponible.'}
          </p>
        </div>

        {/* Lista de reseñas comunitarias */}
        <div className="flex flex-col gap-2 pt-2 border-t border-[#1b1f33]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Reseñas de la Comunidad
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-purple-400 font-semibold">{reviews.length} registradas</span>
              <button
                onClick={() => {
                  onClose();
                  onNavigateToReviews(anime._id);
                }}
                className="text-[10px] text-purple-300 hover:text-white font-bold flex items-center gap-1 bg-purple-900/50 hover:bg-purple-800/60 border border-purple-700/50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                title="Ir a publicar reseña para este anime"
              >
                <MessageSquare className="w-3 h-3" />
                <span>Escribir reseña</span>
              </button>
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto flex flex-col gap-2">
            {reviews.map((r) => {
              const autor = r.usuario_id || {};
              const esAdmin = autor.rol === 'ADMIN' 
                || autor.nombre === 'Administrador' 
                || autor.nombre?.toLowerCase().includes('admin')
                || (user?.rol === 'ADMIN' && (String(autor._id) === String(user?.id) || autor.nombre === user?.name));

              const avatarSrc = (String(autor._id) === String(user?.id) && user?.avatar) ? user.avatar : autor.avatar;

              return (
                <div
                  key={r._id}
                  className={`p-3 rounded-xl text-xs transition-all flex flex-col gap-1.5 ${
                    esAdmin
                      ? 'border-2 border-amber-400/80 bg-gradient-to-r from-amber-950/25 via-[#181512] to-[#121422] shadow-md shadow-amber-950/20'
                      : 'border border-[#1e2338] bg-[#090a10]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      {avatarSrc ? (
                        <img
                          src={avatarSrc}
                          alt={autor.nombre || 'Avatar'}
                          referrerPolicy="no-referrer"
                          className={`w-6 h-6 rounded-full object-cover ${
                            esAdmin ? 'border-2 border-amber-400' : 'border border-purple-500/40'
                          }`}
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                            esAdmin ? 'bg-amber-400 text-slate-950 font-black' : 'bg-purple-900 text-purple-200'
                          }`}
                        >
                          {(autor.nombre || 'U').substring(0, 2).toUpperCase()}
                        </div>
                      )}

                      <span className="font-bold text-white flex items-center gap-1.5">
                        <span>{autor.nombre || 'Usuario'}</span>
                        {esAdmin && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[9px] font-black uppercase flex items-center gap-0.5 border border-amber-400/40">
                            <Crown className="w-2 h-2 text-amber-400" />
                            <span>Admin</span>
                          </span>
                        )}
                      </span>
                    </div>

                    <span className="font-bold text-amber-400">{r.calificacion} / 10 ★</span>
                  </div>

                  {r.spoiler && (
                    <span className="text-[10px] font-semibold text-rose-400 bg-rose-950/30 px-2 py-0.5 rounded border border-rose-900/30 w-fit">
                      ⚠️ Contiene spoilers
                    </span>
                  )}

                  <p className="text-slate-300 text-xs leading-relaxed">{r.texto}</p>
                </div>
              );
            })}

            {reviews.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-4 bg-[#090a10] rounded-xl border border-[#1e2338]">
                Aún no hay reseñas registradas para este anime. ¡Sé el primero en compartir tu opinión!
              </p>
            )}
          </div>
        </div>

        {/* Acciones inferiores */}
        <div className="flex items-center gap-3 pt-2 border-t border-[#1b1f33]">
          <button
            disabled={isAlreadyInLibrary}
            onClick={() => !isAlreadyInLibrary && onAddToLibrary(anime._id, anime.titulo)}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors ${
              isAlreadyInLibrary
                ? 'bg-lime-400 text-slate-950 font-bold opacity-90 cursor-default'
                : 'bg-purple-600 hover:bg-purple-500 text-white cursor-pointer shadow-lg shadow-purple-600/30'
            }`}
          >
            {isAlreadyInLibrary ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isAlreadyInLibrary ? 'En tu Biblioteca' : 'Añadir a mi Biblioteca'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 sm:px-5 py-2.5 rounded-xl bg-[#1b1f33] hover:bg-[#282e4a] text-slate-300 text-xs font-medium transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
