import React, { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, BookOpen, CheckCircle, Clock, Edit3, RefreshCw } from 'lucide-react';
import { kirokuApi } from '../services/api';

export default function LibraryView({ onShowToast, onOpenReviewModal }) {
  const [activeTab, setActiveTab] = useState('Todos');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const tabs = ['Todos', 'Viendo', 'Pendiente', 'Completado', 'Abandonado'];
  const token = localStorage.getItem('kiroku_token');

  const cargarSeguimientos = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await kirokuApi.getSeguimientos(activeTab);
      if (Array.isArray(res)) {
        setItems(res);
      }
    } catch (err) {
      console.warn('Error al cargar seguimientos:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSeguimientos();
  }, [activeTab, token]);

  // Increment episode
  const handleIncrement = async (item) => {
    try {
      const res = await kirokuApi.incrementarEpisodio(item._id);
      if (onShowToast) onShowToast(res?.mensaje || `+1 capítulo registrado`);
      cargarSeguimientos();
    } catch (err) {
      if (onShowToast) onShowToast(`Error: ${err.message}`);
    }
  };

  // Decrement episode
  const handleDecrement = async (item) => {
    if (item.episodioActual <= 0) return;
    const nextEp = item.episodioActual - 1;
    try {
      await kirokuApi.actualizarSeguimiento(item._id, {
        estado: item.estado,
        episodioActual: nextEp,
      });
      cargarSeguimientos();
    } catch (err) {
      if (onShowToast) onShowToast(`Error: ${err.message}`);
    }
  };

  // Change state
  const handleStateChange = async (item, nuevoEstado) => {
    try {
      await kirokuApi.actualizarSeguimiento(item._id, {
        estado: nuevoEstado,
        episodioActual: item.episodioActual,
      });
      if (onShowToast) onShowToast(`Estado actualizado a: ${nuevoEstado}`);
      cargarSeguimientos();
    } catch (err) {
      if (onShowToast) onShowToast(`Error: ${err.message}`);
    }
  };

  // Delete from library
  const handleDelete = async (item) => {
    const titulo = item.anime_id?.titulo || 'este anime';
    if (!window.confirm(`¿Quitar "${titulo}" de tu biblioteca personal?`)) return;
    try {
      await kirokuApi.eliminarSeguimiento(item._id);
      if (onShowToast) onShowToast(`Se eliminó "${titulo}"`);
      setItems(prev => prev.filter(s => s._id !== item._id));
    } catch (err) {
      if (onShowToast) onShowToast(`Error: ${err.message}`);
    }
  };

  if (!token) {
    return (
      <div className="p-12 text-center rounded-3xl bg-[#121422] border border-[#21263d] flex flex-col items-center gap-3">
        <BookOpen className="w-10 h-10 text-purple-400" />
        <h2 className="text-base font-bold text-white">Inicia sesión para gestionar tu biblioteca</h2>
        <p className="text-xs text-slate-400 max-w-md">
          Guarda tus animes favoritos, marca tu progreso capítulo a capítulo y sincroniza tus historias. Ve a la sección "Mi Perfil" para ingresar con tus credenciales.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Mi Biblioteca Personal
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Organiza tus animes por estado, suma tus episodios vistos y lleva el control de lo que estás viendo.
          </p>
        </div>

        <button
          onClick={cargarSeguimientos}
          className="px-3.5 py-1.5 rounded-xl bg-[#121422] hover:bg-[#1a1d2e] border border-[#21263d] text-xs font-semibold text-slate-300 flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1b1f33] pb-3 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-[#121422]'
              }`}
            >
              <span>{tab}</span>
            </button>
          );
        })}
      </div>

      {/* Seguimientos List */}
      <div className="flex flex-col gap-3">
        {items.map((item) => {
          const anime = item.anime_id || {};
          const totalEps = anime.totalEpisodios || 0;
          const percent = totalEps > 0 ? Math.min(100, Math.round((item.episodioActual / totalEps) * 100)) : 0;

          return (
            <div
              key={item._id}
              className="p-4 rounded-2xl bg-[#121422] border border-[#21263d] hover:border-purple-500/30 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              {/* Anime info */}
              <div className="flex items-center gap-3.5 min-w-[240px]">
                <img
                  src={anime.imagenPortada}
                  alt={anime.titulo}
                  className="w-12 h-16 rounded-xl object-cover bg-[#090a10] shadow-sm flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/100x140?text=No+Cover";
                  }}
                />
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">{anime.titulo}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {totalEps > 0 ? `${totalEps} capítulos totales` : 'Emisión indefinida'}
                  </p>
                </div>
              </div>

              {/* State selector */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Estado</span>
                <select
                  value={item.estado}
                  onChange={(e) => handleStateChange(item, e.target.value)}
                  className="bg-[#090a10] border border-[#262c46] text-xs font-semibold text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="Viendo">Viendo</option>
                  <option value="Completado">Completado</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Abandonado">Abandonado</option>
                </select>
              </div>

              {/* Progress Bar & Counters */}
              <div className="flex flex-col gap-1.5 w-full md:w-56">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-semibold">{item.episodioActual} / {totalEps || '∞'} caps</span>
                  <span className="text-[10px] text-slate-500 font-mono">{percent}%</span>
                </div>
                <div className="w-full bg-[#1b1f33] h-2 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${percent}%` }}
                    className="bg-purple-500 h-full rounded-full transition-all"
                  />
                </div>
              </div>

              {/* Increment / Decrement actions */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleDecrement(item)}
                  disabled={item.episodioActual <= 0}
                  className="w-8 h-8 rounded-lg bg-[#1b1f33] hover:bg-[#262c46] text-slate-300 disabled:opacity-30 flex items-center justify-center transition-colors cursor-pointer"
                  title="Restar 1 capítulo"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleIncrement(item)}
                  disabled={totalEps > 0 && item.episodioActual >= totalEps}
                  className="px-3 h-8 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-30 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-md"
                  title="Sumar +1 capítulo"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+1 Cap</span>
                </button>
              </div>

              {/* Delete action */}
              <button
                onClick={() => handleDelete(item)}
                className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
                title="Eliminar de mi biblioteca"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}

        {items.length === 0 && !loading && (
          <div className="p-12 text-center rounded-2xl bg-[#121422] border border-[#21263d] text-slate-400 text-xs">
            No tienes animes en estado "{activeTab}". Puedes agregar títulos desde la sección "Catálogo de Animes".
          </div>
        )}
      </div>
    </div>
  );
}
