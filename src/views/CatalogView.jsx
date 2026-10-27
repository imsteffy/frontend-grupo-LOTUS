import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Plus, Check, ChevronLeft, ChevronRight, ExternalLink, RefreshCw, AlertTriangle } from 'lucide-react';
import { kirokuApi, generosService } from '../services/api';

export default function CatalogView({ onShowToast, onOpenDetail }) {
  const [animes, setAnimes] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Filtros dinámicos
  const [buscar, setBuscar] = useState('');
  const [genero, setGenero] = useState('');
  const [estado, setEstado] = useState('');
  const [anio, setAnio] = useState('');
  const [orden, setOrden] = useState('recientes');

  // Catálogo dinámico de géneros desde el backend
  const [listaGeneros, setListaGeneros] = useState([]);
  const [cargandoGeneros, setCargandoGeneros] = useState(false);

  const [addedIds, setAddedIds] = useState({});

  // Cargar géneros dinámicos (GET /api/generos)
  const cargarGeneros = async () => {
    setCargandoGeneros(true);
    try {
      const res = await generosService.obtenerGeneros();
      if (res?.generos) {
        setListaGeneros(res.generos);
      }
    } catch (err) {
      console.warn('Error al cargar catálogo de géneros:', err.message);
    } finally {
      setCargandoGeneros(false);
    }
  };

  useEffect(() => {
    cargarGeneros();
  }, []);

  // Cargar animes con filtros combinados (GET /api/animes)
  const cargarCatalogo = async (page = 1) => {
    setLoading(true);
    setErrorMsg('');
    const params = new URLSearchParams();
    if (buscar.trim()) params.append('buscar', buscar.trim());
    if (genero && genero !== 'Todos') params.append('genero', encodeURIComponent(genero));
    if (estado) params.append('estado', estado);
    if (anio) params.append('anio', anio);
    if (orden) params.append('orden', orden);
    params.append('pagina', page);
    params.append('limite', 10);

    try {
      const res = await kirokuApi.getAnimes(params.toString());
      if (res?.animes) {
        setAnimes(res.animes);
        setTotal(res.total || 0);
        setPagina(res.pagina || 1);
        setTotalPaginas(res.totalPaginas || 1);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error al conectar con la base de datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCatalogo(1);
  }, [genero, estado, anio, orden]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    cargarCatalogo(1);
  };

  const handleAdd = async (anime, estadoInicial = 'Viendo') => {
    const token = localStorage.getItem('kiroku_token');
    if (!token) {
      if (onShowToast) onShowToast('Debes iniciar sesión para agregar a tu biblioteca.');
      return;
    }

    try {
      await kirokuApi.crearSeguimiento(anime._id, estadoInicial, 0);
      setAddedIds(prev => ({ ...prev, [anime._id]: true }));
      if (onShowToast) onShowToast(`"${anime.titulo}" agregado a tu biblioteca`);
    } catch (err) {
      if (onShowToast) onShowToast(`Aviso: ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Catálogo Oficial de Animes
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Explora la colección completa, busca por nombre y filtra por género, año o estado de emisión.
        </p>
      </div>

      {/* Filter and Query Bar */}
      <form onSubmit={handleSearchSubmit} className="p-5 rounded-3xl bg-[#121422] border border-[#21263d] flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[220px] flex items-center bg-[#090a10] border border-[#23273e] focus-within:border-purple-500 rounded-xl px-3 py-2 text-xs">
            <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              placeholder="Buscar por título..."
              className="bg-transparent border-none text-white focus:outline-none w-full"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Buscar
          </button>
        </div>

        {/* Combined Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300 pt-1">
          {/* Género dinámico */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-500 font-semibold flex items-center justify-between">
              <span>Género</span>
              {cargandoGeneros && <span className="text-[10px] text-purple-400">cargando...</span>}
            </label>
            <select
              value={genero}
              onChange={(e) => setGenero(e.target.value)}
              className="bg-[#090a10] border border-[#23273e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="">Todos los géneros</option>
              {listaGeneros.map(g => (
                <option key={g._id} value={g.nombre}>{g.nombre}</option>
              ))}
            </select>
          </div>

          {/* Estado */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-500 font-semibold">Estado de emisión</label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="bg-[#090a10] border border-[#23273e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="">Todos los estados</option>
              <option value="Finalizado">Finalizado</option>
              <option value="En emisión">En emisión</option>
              <option value="Por estrenar">Por estrenar</option>
            </select>
          </div>

          {/* Año */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-500 font-semibold">Año de estreno</label>
            <input
              type="number"
              min="1960"
              max="2035"
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
              placeholder="Ej: 2023"
              className="bg-[#090a10] border border-[#23273e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          {/* Orden */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-500 font-semibold">Ordenar por</label>
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              className="bg-[#090a10] border border-[#23273e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option value="recientes">Más recientes</option>
              <option value="calificacion">Mejor calificados</option>
              <option value="titulo">Título (A-Z)</option>
              <option value="episodios">Más episodios</option>
              <option value="antiguos">Más antiguos</option>
            </select>
          </div>
        </div>
      </form>

      {/* Error notification if server failed */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/40 flex items-center gap-3 text-xs text-rose-300">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Results Count & Status */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Mostrando <strong>{animes.length}</strong> de <strong>{total}</strong> animes</span>
        {loading && (
          <span className="text-purple-400 font-medium flex items-center gap-1.5 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Cargando catálogo...</span>
          </span>
        )}
      </div>

      {/* Anime Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {animes.map((anime) => {
          const isAdded = !!addedIds[anime._id];
          return (
            <div
              key={anime._id}
              className="p-3 rounded-2xl bg-[#121422] border border-[#21263d] hover:border-purple-500/40 transition-all flex flex-col justify-between gap-3 group"
            >
              {/* Poster */}
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#090a10]">
                <img
                  src={anime.imagenPortada}
                  alt={anime.titulo}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/300x450?text=No+Cover";
                  }}
                />

                <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/80 px-2 py-0.5 rounded-md text-[11px] font-bold text-amber-400 border border-[#2a304e]">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>{anime.calificacionPromedio || 0}</span>
                </div>

                <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] text-purple-300 font-semibold border border-[#2a304e]">
                  {anime.totalEpisodios > 0 ? `${anime.totalEpisodios} ep` : 'Emisión'}
                </div>
              </div>

              {/* Info & Genre Chips */}
              <div className="flex flex-col gap-1.5">
                <h3 className="text-xs font-bold text-white line-clamp-1 group-hover:text-purple-300">
                  {anime.titulo}
                </h3>

                {/* Genre Chips */}
                <div className="flex flex-wrap gap-1 max-h-12 overflow-hidden">
                  {Array.isArray(anime.generos) && anime.generos.length > 0 ? (
                    anime.generos.map((g) => (
                      <span
                        key={g}
                        className="px-1.5 py-0.2 rounded-md bg-[#1a1d2e] text-[9px] font-medium text-purple-300 border border-[#2b314e]"
                      >
                        {g}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-500">Sin géneros</span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                  <span>{anime.estadoEmision}</span>
                  <span>{anime.anioEstreno || '—'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-[#1b1f33]">
                <button
                  onClick={() => handleAdd(anime, 'Viendo')}
                  className={`w-full py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    isAdded
                      ? 'bg-lime-400 text-slate-950'
                      : 'bg-[#1a1d2e] hover:bg-purple-600 text-slate-200 hover:text-white'
                  }`}
                >
                  {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{isAdded ? 'En biblioteca' : '+ Biblioteca'}</span>
                </button>

                <button
                  onClick={() => onOpenDetail(anime)}
                  className="w-full py-1 rounded-lg text-[11px] text-slate-400 hover:text-purple-300 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Ficha técnica</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {animes.length === 0 && !loading && (
        <div className="p-12 text-center rounded-3xl bg-[#121422] border border-[#21263d] text-slate-400 text-xs">
          No se encontraron animes con los filtros seleccionados.
        </div>
      )}

      {/* Pagination Controls */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4 border-t border-[#1b1f33]">
          <button
            onClick={() => cargarCatalogo(pagina - 1)}
            disabled={pagina <= 1}
            className="px-3.5 py-1.5 rounded-xl bg-[#121422] hover:bg-[#1a1d2e] border border-[#21263d] text-xs font-semibold text-slate-300 disabled:opacity-30 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>
          <span className="text-xs text-slate-400 font-mono">
            Página {pagina} de {totalPaginas}
          </span>
          <button
            onClick={() => cargarCatalogo(pagina + 1)}
            disabled={pagina >= totalPaginas}
            className="px-3.5 py-1.5 rounded-xl bg-[#121422] hover:bg-[#1a1d2e] border border-[#21263d] text-xs font-semibold text-slate-300 disabled:opacity-30 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Siguiente</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
