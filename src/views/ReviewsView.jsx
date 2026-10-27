import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, Send, Trash2, Edit, ShieldAlert, ShieldCheck, Crown } from 'lucide-react';
import { kirokuApi } from '../services/api';

export default function ReviewsView({ onShowToast, user }) {
  const [animes, setAnimes] = useState([]);
  const [selectedAnimeId, setSelectedAnimeId] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // New review form
  const [calificacion, setCalificacion] = useState(10);
  const [texto, setTexto] = useState('');
  const [spoiler, setSpoiler] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Editing existing review (PUT /api/resenas/:id)
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editCalificacion, setEditCalificacion] = useState(10);
  const [editTexto, setEditTexto] = useState('');
  const [editSpoiler, setEditSpoiler] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  const token = localStorage.getItem('kiroku_token');

  // Load animes list for the dropdown
  useEffect(() => {
    kirokuApi.getAnimes('limite=50')
      .then((res) => {
        if (res?.animes && res.animes.length > 0) {
          setAnimes(res.animes);
          setSelectedAnimeId(res.animes[0]._id);
        }
      })
      .catch((err) => console.warn('Error al cargar animes en Reseñas:', err.message));
  }, []);

  // Load reviews when selected anime changes
  const cargarResenas = async (animeId) => {
    if (!animeId) return;
    setLoadingReviews(true);
    try {
      const res = await kirokuApi.getResenasPorAnime(animeId);
      if (Array.isArray(res)) {
        setReviews(res);
      }
    } catch (err) {
      console.warn('Error al cargar reseñas:', err.message);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    cargarResenas(selectedAnimeId);
  }, [selectedAnimeId]);

  // Create review: POST /api/resenas
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!token) {
      if (onShowToast) onShowToast('Debes iniciar sesión para publicar una reseña.');
      return;
    }
    if (!selectedAnimeId || !texto.trim()) return;

    setSubmitting(true);
    try {
      await kirokuApi.crearResena({
        anime_id: selectedAnimeId,
        calificacion: Number(calificacion),
        texto: texto.trim(),
        spoiler: Boolean(spoiler),
      });

      if (onShowToast) onShowToast('¡Reseña publicada con éxito!');
      setTexto('');
      setSpoiler(false);
      cargarResenas(selectedAnimeId);
    } catch (err) {
      if (onShowToast) onShowToast(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Mode for review
  const handleStartEdit = (rev) => {
    setEditingReviewId(rev._id);
    setEditCalificacion(rev.calificacion);
    setEditTexto(rev.texto);
    setEditSpoiler(rev.spoiler || false);
  };

  // Save Edit: PUT /api/resenas/:id
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      await kirokuApi.actualizarResena(editingReviewId, {
        calificacion: Number(editCalificacion),
        texto: editTexto.trim(),
        spoiler: Boolean(editSpoiler),
      });
      if (onShowToast) onShowToast('Reseña actualizada correctamente');
      setEditingReviewId(null);
      cargarResenas(selectedAnimeId);
    } catch (err) {
      if (onShowToast) onShowToast(`Error: ${err.message}`);
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete review: DELETE /api/resenas/:id
  const handleDelete = async (resenaId) => {
    if (!window.confirm('¿Eliminar esta reseña?')) return;
    try {
      await kirokuApi.eliminarResena(resenaId);
      if (onShowToast) onShowToast('Reseña eliminada correctamente.');
      setReviews(prev => prev.filter(r => r._id !== resenaId));
    } catch (err) {
      if (onShowToast) onShowToast(`Error: ${err.message}`);
    }
  };

  const selectedAnime = animes.find(a => a._id === selectedAnimeId);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Reseñas y Opiniones de la Comunidad
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Comparte tus impresiones de cada anime, califica del 1 al 10 y debate sin spoilers.
        </p>
      </div>

      {/* Select Anime to inspect */}
      <div className="p-5 rounded-3xl bg-[#121422] border border-[#21263d] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-white">Seleccionar Anime para ver o publicar reseñas:</label>
          <span className="text-[11px] text-slate-400">Elige un título de la lista</span>
        </div>

        <select
          value={selectedAnimeId}
          onChange={(e) => setSelectedAnimeId(e.target.value)}
          className="bg-[#090a10] border border-[#23273e] text-xs font-semibold text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-purple-500 w-full sm:w-80"
        >
          {animes.map((a) => (
            <option key={a._id} value={a._id}>
              {a.titulo} ({a.calificacionPromedio || 0} ★)
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Create Review Form */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[#121422] border border-[#21263d] flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#1b1f33] pb-3">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <span>Escribir Reseña</span>
            </h2>
            <span className="text-[10px] text-slate-500 font-medium">1 reseña por usuario</span>
          </div>

          <form onSubmit={handleSubmitReview} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-400">Anime seleccionado:</span>
              <span className="text-sm font-bold text-white">{selectedAnime?.titulo || 'Cargando...'}</span>
            </div>

            {/* Score 1 to 10 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Calificación (1 al 10):</span>
                <span className="font-black text-amber-400 text-sm flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {calificacion} / 10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={calificacion}
                onChange={(e) => setCalificacion(e.target.value)}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Content text */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Tu crítica u opinión:</label>
              <textarea
                required
                rows="4"
                maxLength={2000}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Escribe tu análisis sobre la animación, trama y desarrollo (máx 2000 car)..."
                className="bg-[#090a10] border border-[#23273e] rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>

            {/* Spoiler flag */}
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={spoiler}
                onChange={(e) => setSpoiler(e.target.checked)}
                className="rounded bg-[#090a10] border-slate-700 text-purple-600 focus:ring-0"
              />
              <span>Advertir que esta reseña contiene spoilers</span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-lg shadow-purple-600/30"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Publicando...' : 'Publicar Reseña'}</span>
            </button>
          </form>
        </div>

        {/* Right: Reviews List */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#1b1f33] pb-2">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Reseñas registradas ({reviews.length})
            </h2>
            {loadingReviews && (
              <span className="text-[11px] text-purple-400 font-medium">Cargando opiniones...</span>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {reviews.map((rev) => {
              const autor = rev.usuario_id || {};
              const esMiResena = token && (autor._id === user?.id || autor.nombre === user?.name || user?.rol === 'ADMIN');
              const isEditingThis = editingReviewId === rev._id;

              // Destacar en dorado si la reseña fue hecha por un ADMIN
              const esAdmin = autor.rol === 'ADMIN' || (user?.rol === 'ADMIN' && (autor._id === user?.id || autor.nombre === user?.name));

              // Obtener avatar del usuario (guardado en BD o en caché local si es mi reseña)
              const avatarSrc = (esMiResena && user?.avatar) ? user.avatar : autor.avatar;

              return (
                <div
                  key={rev._id}
                  className={`p-4 rounded-2xl transition-all flex flex-col justify-between gap-3 ${
                    esAdmin
                      ? 'border-2 border-amber-400/70 bg-gradient-to-r from-amber-950/25 via-[#181512] to-[#121422] shadow-lg shadow-amber-950/20'
                      : 'border border-[#21263d] bg-[#121422]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar del autor: si tiene imagen la muestra en todas las áreas */}
                      {avatarSrc ? (
                        <img
                          src={avatarSrc}
                          alt={autor.nombre || 'Avatar'}
                          className={`w-9 h-9 rounded-full object-cover shadow-md ${
                            esAdmin ? 'border-2 border-amber-400 ring-2 ring-amber-400/20' : 'border border-purple-500/40'
                          }`}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                            esAdmin
                              ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                              : 'bg-purple-900/60 border border-purple-500/40 text-purple-200'
                          }`}
                        >
                          {(autor.nombre || 'U').substring(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">{autor.nombre || 'Usuario'}</h4>
                          {/* Badge de ADMIN dorado destacado */}
                          {esAdmin && (
                            <span className="px-2 py-0.2 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/50 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                              <Crown className="w-2.5 h-2.5 text-amber-400" />
                              <span>Admin</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                        esAdmin
                          ? 'bg-amber-400/20 border border-amber-400/40 text-amber-300'
                          : 'bg-[#252818] border border-[#484e27] text-lime-400'
                      }`}>
                        {rev.calificacion} / 10 ★
                      </div>

                      {esMiResena && !isEditingThis && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleStartEdit(rev)}
                            className="p-1 rounded text-slate-400 hover:text-purple-300 transition-colors cursor-pointer"
                            title="Editar reseña"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(rev._id)}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Eliminar reseña"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Edit Form or Display Text */}
                  {isEditingThis ? (
                    <form onSubmit={handleSaveEdit} className="flex flex-col gap-3 pt-2 border-t border-[#1b1f33]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300">Modificar Calificación:</span>
                        <span className="font-bold text-amber-400">{editCalificacion} / 10 ★</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={editCalificacion}
                        onChange={(e) => setEditCalificacion(e.target.value)}
                        className="w-full accent-purple-500"
                      />

                      <textarea
                        required
                        rows="3"
                        maxLength={2000}
                        value={editTexto}
                        onChange={(e) => setEditTexto(e.target.value)}
                        className="bg-[#090a10] border border-[#23273e] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
                      />

                      <label className="flex items-center gap-2 text-xs text-slate-300">
                        <input
                          type="checkbox"
                          checked={editSpoiler}
                          onChange={(e) => setEditSpoiler(e.target.checked)}
                          className="rounded bg-[#090a10]"
                        />
                        <span>Contiene spoilers</span>
                      </label>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingReviewId(null)}
                          className="px-3 py-1 rounded-lg text-xs text-slate-400 hover:text-white cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={savingEdit}
                          className="px-3.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold cursor-pointer"
                        >
                          {savingEdit ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {rev.texto}
                      </p>

                      {rev.spoiler ? (
                        <div className="flex items-center gap-1.5 text-[10px] text-rose-400">
                          <ShieldAlert className="w-3 h-3" />
                          <span>Contiene spoilers</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Sin spoilers</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}

            {reviews.length === 0 && !loadingReviews && (
              <div className="p-8 text-center rounded-2xl bg-[#121422] border border-[#21263d] text-slate-500 text-xs">
                Este anime aún no tiene opiniones publicadas. ¡Sé el primero en calificarlo!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
