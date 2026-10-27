import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Film, 
  Users, 
  Tag, 
  Plus, 
  Trash2, 
  Edit, 
  Download, 
  RefreshCw, 
  Check, 
  X, 
  AlertTriangle,
  FolderPlus
} from 'lucide-react';
import { kirokuApi, generosService } from '../services/api';

export default function AdminView({ onShowToast }) {
  const [activeTab, setActiveTab] = useState('catalogo'); // 'catalogo' | 'generos' | 'usuarios'

  // --- GÉNEROS STATE ---
  const [generos, setGeneros] = useState([]);
  const [loadingGeneros, setLoadingGeneros] = useState(false);
  const [nuevoGeneroNombre, setNuevoGeneroNombre] = useState('');
  const [creandoGenero, setCreandoGenero] = useState(false);
  const [errorGenero, setErrorGenero] = useState('');
  const [generoEnEdicion, setGeneroEnEdicion] = useState(null);
  const [nombreEditado, setNombreEditado] = useState('');

  // --- ANIMES STATE ---
  const [animes, setAnimes] = useState([]);
  const [loadingAnimes, setLoadingAnimes] = useState(false);
  const [importQuery, setImportQuery] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isAnimeModalOpen, setIsAnimeModalOpen] = useState(false);
  const [editingAnimeId, setEditingAnimeId] = useState(null);

  // Modal para agregar géneros rápidos
  const [patchModalAnime, setPatchModalAnime] = useState(null);
  const [patchGenerosSeleccionados, setPatchGenerosSeleccionados] = useState([]);

  // Form state for Anime
  const [animeForm, setAnimeForm] = useState({
    titulo: '',
    tituloOriginal: '',
    sinopsis: '',
    generos: [],
    totalEpisodios: 12,
    estadoEmision: 'Finalizado',
    imagenPortada: 'https://via.placeholder.com/300x450?text=Portada',
    anioEstreno: 2024,
  });

  // --- USUARIOS STATE ---
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // ==========================
  // CARGAS INICIALES
  // ==========================
  const cargarGeneros = async () => {
    setLoadingGeneros(true);
    setErrorGenero('');
    try {
      const res = await generosService.obtenerGeneros();
      if (res?.generos) setGeneros(res.generos);
    } catch (err) {
      setErrorGenero(err.message || 'Error al cargar catálogo de géneros');
    } finally {
      setLoadingGeneros(false);
    }
  };

  const cargarAnimes = async () => {
    setLoadingAnimes(true);
    try {
      const res = await kirokuApi.getAnimes('limite=50');
      if (res?.animes) setAnimes(res.animes);
    } catch (err) {
      console.warn('Error al cargar animes en Admin:', err.message);
    } finally {
      setLoadingAnimes(false);
    }
  };

  const cargarUsuarios = async () => {
    setLoadingUsers(true);
    try {
      const res = await kirokuApi.getUsuarios();
      if (Array.isArray(res)) setUsuarios(res);
    } catch (err) {
      console.warn('Error al cargar usuarios en Admin:', err.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    cargarGeneros();
    cargarAnimes();
    cargarUsuarios();
  }, []);

  // ==========================
  // GESTIÓN DE GÉNEROS
  // ==========================
  const handleCrearGenero = async (e) => {
    e.preventDefault();
    if (!nuevoGeneroNombre.trim()) return;
    setCreandoGenero(true);
    setErrorGenero('');

    try {
      const res = await generosService.crearGenero(nuevoGeneroNombre);
      if (onShowToast) onShowToast(res?.mensaje || 'Género creado correctamente');
      setNuevoGeneroNombre('');
      cargarGeneros();
    } catch (err) {
      setErrorGenero(err.message);
      if (onShowToast) onShowToast(`Error: ${err.message}`);
    } finally {
      setCreandoGenero(false);
    }
  };

  const handleRenombrarGenero = async (id) => {
    if (!nombreEditado.trim()) return;
    setErrorGenero('');
    try {
      const res = await generosService.actualizarGenero(id, nombreEditado);
      if (onShowToast) onShowToast(res?.mensaje || 'Género actualizado');
      setGeneroEnEdicion(null);
      setNombreEditado('');
      cargarGeneros();
    } catch (err) {
      setErrorGenero(err.message);
      if (onShowToast) onShowToast(`Error: ${err.message}`);
    }
  };

  const handleEliminarGenero = async (g) => {
    if (!window.confirm(`¿Seguro que deseas eliminar el género '${g.nombre}'?`)) return;
    setErrorGenero('');
    try {
      await generosService.eliminarGenero(g._id);
      if (onShowToast) onShowToast(`Género '${g.nombre}' eliminado`);
      cargarGeneros();
    } catch (err) {
      setErrorGenero(err.message);
      if (onShowToast) onShowToast(`No se pudo eliminar: ${err.message}`);
    }
  };

  // ==========================
  // GESTIÓN DE ANIMES
  // ==========================
  const toggleGeneroSeleccionado = (nombreGen) => {
    setAnimeForm(prev => {
      const existe = prev.generos.includes(nombreGen);
      const nuevos = existe
        ? prev.generos.filter(g => g !== nombreGen)
        : [...prev.generos, nombreGen];
      return { ...prev, generos: nuevos };
    });
  };

  const handleSaveAnime = async (e) => {
    e.preventDefault();
    if (!animeForm.generos || animeForm.generos.length === 0) {
      if (onShowToast) onShowToast('Error: Debes seleccionar al menos un género.');
      return;
    }

    const payload = {
      ...animeForm,
      totalEpisodios: Number(animeForm.totalEpisodios),
      anioEstreno: Number(animeForm.anioEstreno),
    };

    try {
      if (editingAnimeId) {
        await kirokuApi.actualizarAnime(editingAnimeId, payload);
        if (onShowToast) onShowToast('Anime actualizado en el catálogo');
      } else {
        await kirokuApi.crearAnime(payload);
        if (onShowToast) onShowToast('Nuevo anime creado en el catálogo');
      }
      setIsAnimeModalOpen(false);
      setEditingAnimeId(null);
      cargarAnimes();
    } catch (err) {
      if (onShowToast) onShowToast(`Error: ${err.message}`);
    }
  };

  const handleOpenEdit = (a) => {
    setEditingAnimeId(a._id);
    setAnimeForm({
      titulo: a.titulo,
      tituloOriginal: a.tituloOriginal || '',
      sinopsis: a.sinopsis,
      generos: Array.isArray(a.generos) ? [...a.generos] : [],
      totalEpisodios: a.totalEpisodios || 0,
      estadoEmision: a.estadoEmision || 'Finalizado',
      imagenPortada: a.imagenPortada || '',
      anioEstreno: a.anioEstreno || 2024,
    });
    setIsAnimeModalOpen(true);
  };

  const handlePatchGeneros = async (e) => {
    e.preventDefault();
    if (!patchModalAnime || patchGenerosSeleccionados.length === 0) return;

    try {
      const res = await kirokuApi.agregarGenerosAnime(patchModalAnime._id, patchGenerosSeleccionados);
      if (onShowToast) onShowToast(res?.mensaje || 'Géneros agregados correctamente');
      setPatchModalAnime(null);
      setPatchGenerosSeleccionados([]);
      cargarAnimes();
    } catch (err) {
      if (onShowToast) onShowToast(`Error: ${err.message}`);
    }
  };

  const handleDeleteAnime = async (id, titulo) => {
    if (!window.confirm(`¿Eliminar definitivamente "${titulo}" del catálogo?`)) return;
    try {
      await kirokuApi.eliminarAnime(id);
      if (onShowToast) onShowToast(`"${titulo}" eliminado`);
      setAnimes(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      if (onShowToast) onShowToast(`Error: ${err.message}`);
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!importQuery.trim()) return;
    setIsImporting(true);
    try {
      const res = await kirokuApi.importarExterno(importQuery);
      if (onShowToast) onShowToast(`¡Anime importado: "${res?.anime?.titulo || importQuery}"!`);
      setImportQuery('');
      cargarAnimes();
      cargarGeneros();
    } catch (err) {
      if (onShowToast) onShowToast(`Error de importación: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  // ==========================
  // GESTIÓN DE USUARIOS
  // ==========================
  const handleToggleRol = async (u) => {
    const nuevoRol = u.rol === 'ADMIN' ? 'STD' : 'ADMIN';
    if (!window.confirm(`¿Cambiar rol de ${u.nombre} a ${nuevoRol}?`)) return;
    try {
      await kirokuApi.cambiarRolUsuario(u._id, nuevoRol);
      if (onShowToast) onShowToast(`Rol de ${u.nombre} actualizado a ${nuevoRol}`);
      cargarUsuarios();
    } catch (err) {
      if (onShowToast) onShowToast(`Error: ${err.message}`);
    }
  };

  const handleDeleteUser = async (u) => {
    if (!window.confirm(`¿Eliminar la cuenta de ${u.nombre} (${u.email})?`)) return;
    try {
      await kirokuApi.eliminarUsuario(u._id);
      if (onShowToast) onShowToast(`Usuario ${u.nombre} eliminado`);
      cargarUsuarios();
    } catch (err) {
      if (onShowToast) onShowToast(`Error: ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-8 h-8 text-amber-400" />
            <span>Panel de Administración</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestión completa del Catálogo de Animes, Géneros y Usuarios.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#121422] border border-[#21263d]">
          <button
            onClick={() => setActiveTab('catalogo')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'catalogo'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Animes ({animes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('generos')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'generos'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-amber-400/80 hover:text-amber-300'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Géneros ({generos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('usuarios')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'usuarios'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Usuarios ({usuarios.length})</span>
          </button>
        </div>
      </div>

      {/* PESTAÑA 1: CATÁLOGO DE GÉNEROS */}
      {activeTab === 'generos' && (
        <div className="flex flex-col gap-6">
          <div className="p-5 rounded-3xl bg-[#121422] border border-amber-500/30 flex flex-col gap-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Crear Nuevo Género</span>
            </span>

            <form onSubmit={handleCrearGenero} className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                required
                value={nuevoGeneroNombre}
                onChange={(e) => setNuevoGeneroNombre(e.target.value)}
                placeholder="Nombre del género (ej: Isekai, Cyberpunk, Mecha)..."
                className="bg-[#090a10] border border-[#262c46] focus:border-amber-500 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none flex-1 min-w-[240px]"
              />
              <button
                type="submit"
                disabled={creandoGenero}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-md"
              >
                {creandoGenero ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>Crear Género</span>
              </button>
            </form>

            {errorGenero && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 flex items-center gap-2 text-xs text-rose-300">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorGenero}</span>
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-[#121422] border border-[#21263d] overflow-hidden">
            <div className="p-4 border-b border-[#21263d] flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Géneros Registrados ({generos.length})
              </span>
              <button
                onClick={cargarGeneros}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingGeneros ? 'animate-spin' : ''}`} />
                <span>Refrescar</span>
              </button>
            </div>

            <div className="divide-y divide-[#1b1f33]">
              {generos.map((g) => (
                <div key={g._id} className="p-4 flex items-center justify-between gap-4 hover:bg-[#181a2b] transition-colors">
                  {generoEnEdicion?._id === g._id ? (
                    <div className="flex items-center gap-2 flex-1 max-w-sm">
                      <input
                        type="text"
                        value={nombreEditado}
                        onChange={(e) => setNombreEditado(e.target.value)}
                        className="bg-[#090a10] border border-amber-500 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none w-full"
                        autoFocus
                      />
                      <button
                        onClick={() => handleRenombrarGenero(g._id)}
                        className="p-1.5 rounded-lg bg-lime-400 text-slate-950 hover:bg-lime-300 transition-colors cursor-pointer"
                        title="Guardar nombre"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setGeneroEnEdicion(null)}
                        className="p-1.5 rounded-lg bg-[#1a1d2e] text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="Cancelar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-lg bg-[#1a1d2e] border border-[#2b314e] text-xs font-bold text-purple-300">
                        {g.nombre}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setGeneroEnEdicion(g);
                        setNombreEditado(g.nombre);
                        setErrorGenero('');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#1a1d2e] hover:bg-purple-600 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Renombrar género"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Renombrar</span>
                    </button>

                    <button
                      onClick={() => handleEliminarGenero(g)}
                      className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 transition-colors cursor-pointer"
                      title="Eliminar género"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {generos.length === 0 && !loadingGeneros && (
                <p className="p-8 text-center text-xs text-slate-500">
                  No hay géneros creados en el catálogo.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: CATÁLOGO DE ANIMES */}
      {activeTab === 'catalogo' && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-[#121422] border border-[#21263d]">
            <button
              onClick={() => {
                setEditingAnimeId(null);
                setAnimeForm({
                  titulo: '',
                  tituloOriginal: '',
                  sinopsis: '',
                  generos: generos.length > 0 ? [generos[0].nombre] : [],
                  totalEpisodios: 12,
                  estadoEmision: 'Finalizado',
                  imagenPortada: 'https://via.placeholder.com/300x450?text=Portada',
                  anioEstreno: 2024,
                });
                setIsAnimeModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Anime Manualmente</span>
            </button>

            <form onSubmit={handleImport} className="flex items-center gap-2">
              <input
                type="text"
                value={importQuery}
                onChange={(e) => setImportQuery(e.target.value)}
                placeholder="Nombre o ID MyAnimeList"
                className="bg-[#090a10] border border-[#262c46] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 w-64"
              />
              <button
                type="submit"
                disabled={isImporting}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-md"
              >
                {isImporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span>Importar MAL</span>
              </button>
            </form>
          </div>

          {/* Table of Animes */}
          <div className="rounded-3xl bg-[#121422] border border-[#21263d] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0d0f1a] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#21263d]">
                  <tr>
                    <th className="px-5 py-3.5">Portada & Título</th>
                    <th className="px-4 py-3.5">Géneros</th>
                    <th className="px-4 py-3.5">Episodios</th>
                    <th className="px-4 py-3.5">Estado</th>
                    <th className="px-4 py-3.5">Calificación</th>
                    <th className="px-5 py-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1b1f33]">
                  {animes.map((a) => (
                    <tr key={a._id} className="hover:bg-[#181a2b] transition-colors">
                      <td className="px-5 py-3 flex items-center gap-3">
                        <img
                          src={a.imagenPortada}
                          alt={a.titulo}
                          className="w-10 h-14 rounded-lg object-cover bg-[#090a10] shadow-sm flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = "https://via.placeholder.com/100x140?text=No+Img";
                          }}
                        />
                        <div>
                          <p className="font-bold text-white leading-tight">{a.titulo}</p>
                          {a.tituloOriginal && (
                            <p className="text-[11px] text-slate-500">{a.tituloOriginal}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(a.generos) && a.generos.map(g => (
                            <span key={g} className="px-1.5 py-0.2 rounded bg-[#1a1d2e] text-[9px] text-purple-300 border border-[#2b314e]">
                              {g}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-200">
                        {a.totalEpisodios > 0 ? `${a.totalEpisodios} ep` : 'Continuo'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full bg-[#1b1f33] text-[10px] font-semibold text-purple-300 border border-[#2b314e]">
                          {a.estadoEmision}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-amber-400">
                        {a.calificacionPromedio || 0} ★
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setPatchModalAnime(a);
                              setPatchGenerosSeleccionados([]);
                            }}
                            className="px-2 py-1 rounded-lg bg-[#1a1d2e] hover:bg-amber-500 hover:text-slate-950 text-amber-300 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer border border-amber-500/30"
                            title="Agregar géneros sin reemplazar"
                          >
                            <FolderPlus className="w-3 h-3" />
                            <span>+Género</span>
                          </button>

                          <button
                            onClick={() => handleOpenEdit(a)}
                            className="p-1.5 rounded-lg bg-[#1a1d2e] hover:bg-purple-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="Editar anime"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteAnime(a._id, a.titulo)}
                            className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 transition-colors cursor-pointer"
                            title="Eliminar anime"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 3: GESTIÓN DE USUARIOS */}
      {activeTab === 'usuarios' && (
        <div className="rounded-3xl bg-[#121422] border border-[#21263d] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0d0f1a] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#21263d]">
                <tr>
                  <th className="px-5 py-3.5">Usuario & Email</th>
                  <th className="px-4 py-3.5">Rol Actual</th>
                  <th className="px-4 py-3.5">Fecha de Registro</th>
                  <th className="px-5 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b1f33]">
                {usuarios.map((u) => (
                  <tr key={u._id} className="hover:bg-[#181a2b] transition-colors">
                    <td className="px-5 py-3.5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-900/80 border border-purple-500/40 flex items-center justify-center font-bold text-xs text-purple-200">
                        {(u.nombre || 'U').substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-white">{u.nombre}</p>
                        <p className="text-slate-400">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                        u.rol === 'ADMIN'
                          ? 'bg-amber-400/20 text-amber-400 border border-amber-400/40'
                          : 'bg-purple-900/40 text-purple-300 border border-purple-700/30'
                      }`}>
                        {u.rol}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400">
                      {u.fechaRegistro ? new Date(u.fechaRegistro).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleRol(u)}
                          className="px-2.5 py-1 rounded-lg bg-[#1a1d2e] hover:bg-[#272c44] border border-[#2b314e] text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
                          title="Cambiar rol"
                        >
                          Asignar {u.rol === 'ADMIN' ? 'STD' : 'ADMIN'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 transition-colors cursor-pointer"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: AGREGAR GÉNEROS RÁPIDOS */}
      {patchModalAnime && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#121422] border border-amber-500/40 rounded-3xl max-w-md w-full p-6 flex flex-col gap-4 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  Agregar géneros a "{patchModalAnime.titulo}"
                </h3>
              </div>
              <button
                onClick={() => setPatchModalAnime(null)}
                className="w-7 h-7 rounded-full bg-[#1b1f33] text-slate-400 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Selecciona géneros para sumar al anime. No eliminará los géneros actuales ni duplicará repetidos.
            </p>

            <div className="p-3 rounded-xl bg-[#090a10] border border-[#262c46] max-h-40 overflow-y-auto flex flex-wrap gap-1.5">
              {generos.map((g) => {
                const yaLoTiene = patchModalAnime.generos?.includes(g.nombre);
                const isSelected = patchGenerosSeleccionados.includes(g.nombre);
                return (
                  <button
                    key={g._id}
                    disabled={yaLoTiene}
                    type="button"
                    onClick={() => {
                      setPatchGenerosSeleccionados(prev =>
                        prev.includes(g.nombre) ? prev.filter(x => x !== g.nombre) : [...prev, g.nombre]
                      );
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      yaLoTiene
                        ? 'bg-[#181a27] text-slate-600 border border-transparent cursor-not-allowed'
                        : isSelected
                        ? 'bg-amber-500 text-slate-950 font-bold border border-amber-400'
                        : 'bg-[#141624] text-slate-300 border border-[#23273e] hover:text-white'
                    }`}
                  >
                    {yaLoTiene ? `✓ ${g.nombre} (ya tiene)` : isSelected ? `+ ${g.nombre}` : g.nombre}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handlePatchGeneros}
                disabled={patchGenerosSeleccionados.length === 0}
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
              >
                Sumar géneros ({patchGenerosSeleccionados.length})
              </button>
              <button
                onClick={() => setPatchModalAnime(null)}
                className="px-4 py-2 rounded-xl bg-[#1b1f33] text-slate-300 text-xs"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREAR / EDITAR ANIME */}
      {isAnimeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#121422] border border-[#272d47] rounded-3xl max-w-lg w-full p-6 flex flex-col gap-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-purple-400" />
                <span>{editingAnimeId ? 'Editar Anime' : 'Nuevo Anime en Catálogo'}</span>
              </h3>
              <button
                onClick={() => setIsAnimeModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#1b1f33] hover:bg-[#282e4a] text-slate-400 hover:text-white flex items-center justify-center text-sm cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAnime} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-300">Título oficial</label>
                <input
                  type="text"
                  required
                  value={animeForm.titulo}
                  onChange={(e) => setAnimeForm({ ...animeForm, titulo: e.target.value })}
                  placeholder="Ej: Death Note"
                  className="bg-[#090a10] border border-[#262c46] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-300">
                    Géneros (Selección obligatoria del catálogo):
                  </label>
                  <span className="text-[11px] text-purple-400 font-bold">
                    {animeForm.generos.length} seleccionados
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#090a10] border border-[#262c46] max-h-36 overflow-y-auto flex flex-wrap gap-1.5">
                  {generos.map((g) => {
                    const isSelected = animeForm.generos.includes(g.nombre);
                    return (
                      <button
                        type="button"
                        key={g._id}
                        onClick={() => toggleGeneroSeleccionado(g.nombre)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-purple-600 text-white font-bold border border-purple-400 shadow-sm'
                            : 'bg-[#141624] text-slate-400 border border-[#23273e] hover:text-white hover:bg-[#1a1d2e]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                        <span>{g.nombre}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-300">Total Episodios</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={animeForm.totalEpisodios}
                    onChange={(e) => setAnimeForm({ ...animeForm, totalEpisodios: e.target.value })}
                    className="bg-[#090a10] border border-[#262c46] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-300">Estado de Emisión</label>
                  <select
                    value={animeForm.estadoEmision}
                    onChange={(e) => setAnimeForm({ ...animeForm, estadoEmision: e.target.value })}
                    className="bg-[#090a10] border border-[#262c46] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Finalizado">Finalizado</option>
                    <option value="En emisión">En emisión</option>
                    <option value="Por estrenar">Por estrenar</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-300">URL Imagen de Portada</label>
                <input
                  type="url"
                  required
                  value={animeForm.imagenPortada}
                  onChange={(e) => setAnimeForm({ ...animeForm, imagenPortada: e.target.value })}
                  placeholder="https://..."
                  className="bg-[#090a10] border border-[#262c46] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-300">Sinopsis</label>
                <textarea
                  required
                  rows="3"
                  value={animeForm.sinopsis}
                  onChange={(e) => setAnimeForm({ ...animeForm, sinopsis: e.target.value })}
                  placeholder="Sinopsis oficial..."
                  className="bg-[#090a10] border border-[#262c46] rounded-xl p-3 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingAnimeId ? 'Guardar Cambios' : 'Crear Anime'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAnimeModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#1b1f33] hover:bg-[#282e4a] text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
