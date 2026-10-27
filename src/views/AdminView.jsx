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
  FolderPlus,
  Search,
  Crown,
  Sparkles,
  ArrowUpRight
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
  const [busquedaAnime, setBusquedaAnime] = useState('');
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
  const [busquedaUsuario, setBusquedaUsuario] = useState('');
  const [errorUsuario, setErrorUsuario] = useState('');

  // ==========================
  // CARGAS INICIALES
  // ==========================
  const cargarGeneros = async () => {
    setLoadingGeneros(true);
    setErrorGenero('');
    try {
      const res = await generosService.obtenerGeneros();
      setGeneros(Array.isArray(res?.generos) ? res.generos : []);
    } catch (err) {
      setErrorGenero(err.message || 'Error al cargar géneros');
    } finally {
      setLoadingGeneros(false);
    }
  };

  const cargarAnimes = async () => {
    setLoadingAnimes(true);
    try {
      const res = await kirokuApi.getAnimes('limite=100');
      setAnimes(Array.isArray(res?.animes) ? res.animes : []);
    } catch (err) {
      console.warn('Error al cargar animes en Admin:', err.message);
    } finally {
      setLoadingAnimes(false);
    }
  };

  const cargarUsuarios = async () => {
    setLoadingUsers(true);
    setErrorUsuario('');
    try {
      const res = await kirokuApi.getUsuarios();
      const userList = Array.isArray(res) ? res : Array.isArray(res?.usuarios) ? res.usuarios : [];
      setUsuarios(userList);
    } catch (err) {
      setErrorUsuario(err.message || 'Error al cargar usuarios.');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    cargarGeneros();
    cargarAnimes();
    cargarUsuarios();
  }, []);

  // Handlers Géneros
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

  // Handlers Animes
  const toggleGeneroSeleccionado = (nombreGen) => {
    setAnimeForm(prev => {
      const existe = prev.generos.includes(nombreGen);
      const nuevos = existe ? prev.generos.filter(g => g !== nombreGen) : [...prev.generos, nombreGen];
      return { ...prev, generos: nuevos };
    });
  };

  const handleSaveAnime = async (e) => {
    e.preventDefault();
    if (!animeForm.generos || animeForm.generos.length === 0) {
      if (onShowToast) onShowToast('Selecciona al menos un género.');
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
        if (onShowToast) onShowToast('Anime actualizado');
      } else {
        await kirokuApi.crearAnime(payload);
        if (onShowToast) onShowToast('Anime creado');
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
      if (onShowToast) onShowToast(res?.mensaje || 'Géneros agregados');
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
      if (onShowToast) onShowToast(`Anime importado: "${res?.anime?.titulo || importQuery}"`);
      setImportQuery('');
      cargarAnimes();
      cargarGeneros();
    } catch (err) {
      if (onShowToast) onShowToast(`Error de importación: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  // Handlers Usuarios
  const handleToggleRol = async (u) => {
    const nuevoRol = u.rol === 'ADMIN' ? 'STD' : 'ADMIN';
    if (!window.confirm(`¿Cambiar rol de ${u.nombre} a ${nuevoRol}?`)) return;
    try {
      await kirokuApi.cambiarRolUsuario(u._id, nuevoRol);
      if (onShowToast) onShowToast(`Rol actualizado a ${nuevoRol}`);
      cargarUsuarios();
    } catch (err) {
      if (onShowToast) onShowToast(`Error: ${err.message}`);
    }
  };

  const handleDeleteUser = async (u) => {
    if (!window.confirm(`¿Eliminar la cuenta de ${u.nombre}?`)) return;
    try {
      await kirokuApi.eliminarUsuario(u._id);
      if (onShowToast) onShowToast(`Usuario eliminado`);
      cargarUsuarios();
    } catch (err) {
      if (onShowToast) onShowToast(`Error: ${err.message}`);
    }
  };

  const animesFiltrados = animes.filter(a => 
    !busquedaAnime.trim() || 
    (a.titulo || '').toLowerCase().includes(busquedaAnime.toLowerCase())
  );

  const usuariosFiltrados = usuarios.filter(u =>
    !busquedaUsuario.trim() ||
    (u.nombre || '').toLowerCase().includes(busquedaUsuario.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(busquedaUsuario.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full">
      {/* ========================================================= */}
      {/* HEADER EDITORIAL / MINIMALISTA                            */}
      {/* ========================================================= */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#1b1f33] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-[11px] font-semibold tracking-wider text-amber-400/90 uppercase font-mono">
              Consola de Gestión
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Panel de Administración
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Administración central del catálogo de series, taxonomía de géneros y usuarios.
          </p>
        </div>

        {/* Segmented Control de pestañas elegante */}
        <div className="flex items-center p-1 rounded-xl bg-[#11131f] border border-[#1e2338]">
          <button
            onClick={() => { setActiveTab('catalogo'); cargarAnimes(); }}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'catalogo'
                ? 'bg-[#1e2238] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Series ({animes.length})
          </button>

          <button
            onClick={() => { setActiveTab('generos'); cargarGeneros(); }}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'generos'
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Géneros ({generos.length})
          </button>

          <button
            onClick={() => { setActiveTab('usuarios'); cargarUsuarios(); }}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'usuarios'
                ? 'bg-[#1e2238] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Usuarios ({usuarios.length})
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* PESTAÑA 1: GÉNEROS                                        */}
      {/* ========================================================= */}
      {activeTab === 'generos' && (
        <div className="flex flex-col gap-6">
          {/* Formulario limpio para dar de alta géneros */}
          <div className="p-6 rounded-2xl bg-[#11131f] border border-[#1e2338] flex flex-col gap-4">
            <div>
              <h2 className="text-sm font-bold text-white">Nuevo Género</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Los animes del catálogo solo podrán asociarse a géneros dados de alta aquí.
              </p>
            </div>

            <form onSubmit={handleCrearGenero} className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                required
                value={nuevoGeneroNombre}
                onChange={(e) => setNuevoGeneroNombre(e.target.value)}
                placeholder="Nombre oficial (ej: Isekai, Cyberpunk, Mecha)..."
                className="bg-[#090a10] border border-[#23273e] focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none flex-1 min-w-[260px] transition-colors"
              />
              <button
                type="submit"
                disabled={creandoGenero}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-md"
              >
                {creandoGenero ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>Crear Género</span>
              </button>
            </form>

            {errorGenero && (
              <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/40 text-xs text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorGenero}</span>
              </div>
            )}
          </div>

          {/* Lista de géneros con diseño editorial */}
          <div className="rounded-2xl bg-[#11131f] border border-[#1e2338] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#1e2338] flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                Géneros registrados ({generos.length})
              </span>
              <button
                onClick={cargarGeneros}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingGeneros ? 'animate-spin' : ''}`} />
                <span>Refrescar</span>
              </button>
            </div>

            <div className="divide-y divide-[#1e2338]">
              {generos.map((g) => (
                <div key={g._id} className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                  {generoEnEdicion?._id === g._id ? (
                    <div className="flex items-center gap-2 flex-1 max-w-sm">
                      <input
                        type="text"
                        value={nombreEditado}
                        onChange={(e) => setNombreEditado(e.target.value)}
                        className="bg-[#090a10] border border-amber-400 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none w-full"
                        autoFocus
                      />
                      <button
                        onClick={() => handleRenombrarGenero(g._id)}
                        className="p-1.5 rounded-lg bg-lime-400 text-slate-950 hover:bg-lime-300 cursor-pointer"
                        title="Guardar nombre"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setGeneroEnEdicion(null)}
                        className="p-1.5 rounded-lg bg-[#1e2338] text-slate-300 hover:text-white cursor-pointer"
                        title="Cancelar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-white">{g.nombre}</span>
                      <span className="text-[10px] text-slate-500 font-mono">ID: {g._id}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setGeneroEnEdicion(g);
                        setNombreEditado(g.nombre);
                        setErrorGenero('');
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-[#1e2338] transition-colors cursor-pointer"
                    >
                      Renombrar
                    </button>

                    <button
                      onClick={() => handleEliminarGenero(g)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
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

      {/* ========================================================= */}
      {/* PESTAÑA 2: CATÁLOGO DE ANIMES                             */}
      {/* ========================================================= */}
      {activeTab === 'catalogo' && (
        <div className="flex flex-col gap-6">
          {/* Barra de herramientas superior */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-[#11131f] border border-[#1e2338]">
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
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-600/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Serie</span>
            </button>

            {/* Ingest Assistant */}
            <form onSubmit={handleImport} className="flex items-center gap-2">
              <input
                type="text"
                value={importQuery}
                onChange={(e) => setImportQuery(e.target.value)}
                placeholder="Nombre o ID MyAnimeList..."
                className="bg-[#090a10] border border-[#23273e] focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none w-64 transition-colors"
              />
              <button
                type="submit"
                disabled={isImporting}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {isImporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span>Importar MAL</span>
              </button>
            </form>
          </div>

          {/* Buscador dentro del catálogo */}
          <div className="flex items-center bg-[#11131f] border border-[#1e2338] rounded-xl px-4 py-2.5 text-xs text-white max-w-sm">
            <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={busquedaAnime}
              onChange={(e) => setBusquedaAnime(e.target.value)}
              placeholder="Filtrar por título..."
              className="bg-transparent border-none text-white focus:outline-none w-full placeholder-slate-500"
            />
          </div>

          {/* Tabla de animes */}
          <div className="rounded-2xl bg-[#11131f] border border-[#1e2338] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#090a10] text-slate-400 text-[11px] font-semibold uppercase tracking-wider border-b border-[#1e2338]">
                  <tr>
                    <th className="px-6 py-4">Serie</th>
                    <th className="px-4 py-4">Géneros</th>
                    <th className="px-4 py-4">Episodios</th>
                    <th className="px-4 py-4">Estado</th>
                    <th className="px-4 py-4">Puntaje</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2338]">
                  {animesFiltrados.map((a) => (
                    <tr key={a._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-3.5 flex items-center gap-3.5">
                        <img
                          src={a.imagenPortada}
                          alt={a.titulo}
                          className="w-10 h-14 rounded-lg object-cover bg-[#090a10] shadow-sm flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = "https://via.placeholder.com/100x140?text=No+Img";
                          }}
                        />
                        <div>
                          <p className="font-bold text-white text-xs leading-tight">{a.titulo}</p>
                          {a.tituloOriginal && (
                            <p className="text-[11px] text-slate-500 mt-0.5">{a.tituloOriginal}</p>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 max-w-[220px]">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(a.generos) && a.generos.map(g => (
                            <span key={g} className="px-2 py-0.5 rounded-md bg-[#181a2b] text-[10px] text-purple-300 border border-[#23273e]">
                              {g}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-medium text-slate-200">
                        {a.totalEpisodios > 0 ? `${a.totalEpisodios} eps` : 'Continuo'}
                      </td>

                      <td className="px-4 py-3.5 text-slate-400">
                        {a.estadoEmision}
                      </td>

                      <td className="px-4 py-3.5 font-bold text-amber-400">
                        {a.calificacionPromedio || 0} ★
                      </td>

                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setPatchModalAnime(a);
                              setPatchGenerosSeleccionados([]);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-[#181a2b] hover:bg-amber-400 hover:text-slate-950 text-amber-300 text-[11px] font-semibold transition-colors cursor-pointer border border-amber-400/30"
                            title="Anexar géneros"
                          >
                            +Género
                          </button>

                          <button
                            onClick={() => handleOpenEdit(a)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e2338] transition-colors cursor-pointer"
                            title="Editar serie"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteAnime(a._id, a.titulo)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
                            title="Eliminar serie"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {animesFiltrados.length === 0 && !loadingAnimes && (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-500 text-xs">
                        No se encontraron series en el catálogo.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PESTAÑA 3: GESTIÓN DE USUARIOS                            */}
      {/* ========================================================= */}
      {activeTab === 'usuarios' && (
        <div className="flex flex-col gap-6">
          {/* Métricas limpias sin cajas anidadas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#11131f] border border-[#1e2338] flex flex-col justify-between gap-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Total Registrados
              </span>
              <span className="text-2xl font-bold text-white">{usuarios.length}</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#11131f] border border-[#1e2338] flex flex-col justify-between gap-1">
              <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5" />
                <span>Administradores</span>
              </span>
              <span className="text-2xl font-bold text-amber-400">
                {usuarios.filter(u => u.rol === 'ADMIN').length}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#11131f] border border-[#1e2338] flex flex-col justify-between gap-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Usuarios Estándar
              </span>
              <span className="text-2xl font-bold text-slate-300">
                {usuarios.filter(u => u.rol !== 'ADMIN').length}
              </span>
            </div>
          </div>

          {/* Barra de búsqueda de usuarios */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center bg-[#11131f] border border-[#1e2338] rounded-xl px-4 py-2.5 text-xs text-white w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                value={busquedaUsuario}
                onChange={(e) => setBusquedaUsuario(e.target.value)}
                placeholder="Buscar por nombre o correo..."
                className="bg-transparent border-none text-white focus:outline-none w-full placeholder-slate-500"
              />
            </div>

            <button
              onClick={cargarUsuarios}
              disabled={loadingUsers}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#11131f] border border-transparent hover:border-[#1e2338] transition-colors cursor-pointer flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin' : ''}`} />
              <span>Actualizar lista</span>
            </button>
          </div>

          {errorUsuario && (
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/40 text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorUsuario}</span>
            </div>
          )}

          {/* Tabla de usuarios */}
          <div className="rounded-2xl bg-[#11131f] border border-[#1e2338] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#090a10] text-slate-400 text-[11px] font-semibold uppercase tracking-wider border-b border-[#1e2338]">
                  <tr>
                    <th className="px-6 py-4">Usuario</th>
                    <th className="px-4 py-4">Rol</th>
                    <th className="px-4 py-4">Registro</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2338]">
                  {usuariosFiltrados.map((u) => {
                    const esAdmin = u.rol === 'ADMIN';
                    return (
                      <tr key={u._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-3.5 flex items-center gap-3.5">
                          {u.avatar ? (
                            <img
                              src={u.avatar}
                              alt={u.nombre}
                              className="w-9 h-9 rounded-full object-cover border border-purple-500/40 shadow-sm"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : (
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                              esAdmin ? 'bg-amber-400 text-slate-950' : 'bg-purple-900/60 text-purple-200'
                            }`}>
                              {(u.nombre || 'U').substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-white text-xs">{u.nombre}</p>
                            <p className="text-slate-400 text-[11px]">{u.email}</p>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          {esAdmin ? (
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 bg-amber-400/20 text-amber-300 border border-amber-400/40">
                              <Crown className="w-2.5 h-2.5 text-amber-400" />
                              <span>Admin</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">Estándar</span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                          {u.fechaRegistro ? new Date(u.fechaRegistro).toLocaleDateString() : '—'}
                        </td>

                        <td className="px-6 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleRol(u)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                esAdmin
                                  ? 'text-slate-400 hover:text-white hover:bg-[#1e2338]'
                                  : 'bg-amber-400/10 hover:bg-amber-400 hover:text-slate-950 text-amber-300 border border-amber-400/30'
                              }`}
                            >
                              {esAdmin ? 'Degradar a STD' : 'Hacer Admin'}
                            </button>

                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
                              title="Eliminar usuario"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: AGREGAR GÉNEROS (PATCH) */}
      {patchModalAnime && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#11131f] border border-amber-400/40 rounded-2xl max-w-md w-full p-6 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                Sumar géneros a "{patchModalAnime.titulo}"
              </h3>
              <button
                onClick={() => setPatchModalAnime(null)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Elige los géneros que deseas anexar. Los géneros previos se conservarán.
            </p>

            <div className="p-3.5 rounded-xl bg-[#090a10] border border-[#1e2338] max-h-40 overflow-y-auto flex flex-wrap gap-1.5">
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
                onClick={() => setPatchModalAnime(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handlePatchGeneros}
                disabled={patchGenerosSeleccionados.length === 0}
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs cursor-pointer disabled:opacity-40"
              >
                Guardar ({patchGenerosSeleccionados.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREAR / EDITAR ANIME */}
      {isAnimeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#11131f] border border-[#1e2338] rounded-2xl max-w-lg w-full p-6 flex flex-col gap-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {editingAnimeId ? 'Editar Serie' : 'Nueva Serie en Catálogo'}
              </h3>
              <button
                onClick={() => setIsAnimeModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAnime} className="flex flex-col gap-4">
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
                        onClick={() => toggleGeneroSeleccionado(g.nombre)}
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
                  onClick={() => setIsAnimeModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer shadow-md"
                >
                  {editingAnimeId ? 'Guardar Cambios' : 'Crear Serie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
