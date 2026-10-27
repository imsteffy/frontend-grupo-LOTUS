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
  Terminal,
  Cpu,
  Database,
  Radio
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

  // Modal para agregar géneros rápidos (PATCH /api/animes/:id/generos)
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

  // Cargas
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
      if (onShowToast) onShowToast(res?.mensaje || 'Género creado');
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
      if (onShowToast) onShowToast(`Error: ${err.message}`);
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
    if (!window.confirm(`¿Eliminar al usuario ${u.nombre}?`)) return;
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
    <div className="flex flex-col gap-6 font-sans">
      {/* ======================================================== */}
      {/* RETRO-TECH TERMINAL BANNER (Estética Consola NERV / Anime) */}
      {/* ======================================================== */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0c0d16] border border-[#23273e] p-5">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            {/* Retro terminal status icon */}
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner flex-shrink-0">
              <Terminal className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 tracking-wider">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  SYS.ONLINE
                </span>
                <span>/</span>
                <span>ROOT_LEVEL</span>
                <span>/</span>
                <span className="text-purple-400">KIROKU_OS_v2.0</span>
              </div>
              <h1 className="text-xl font-black text-white tracking-tight mt-0.5">
                Consola de Administración Central
              </h1>
            </div>
          </div>

          {/* Retro-Tech Tabs Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#07080f] border border-[#1b1f33] self-start md:self-auto">
            <button
              onClick={() => { setActiveTab('catalogo'); cargarAnimes(); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'catalogo'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>01. ANIMES [{animes.length}]</span>
            </button>

            <button
              onClick={() => { setActiveTab('generos'); cargarGeneros(); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'generos'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                  : 'text-amber-400/80 hover:text-amber-300'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>02. GÉNEROS [{generos.length}]</span>
            </button>

            <button
              onClick={() => { setActiveTab('usuarios'); cargarUsuarios(); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'usuarios'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>03. USUARIOS [{usuarios.length}]</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* PESTAÑA 1: CATÁLOGO DE GÉNEROS                            */}
      {/* ========================================================= */}
      {activeTab === 'generos' && (
        <div className="flex flex-col gap-5">
          {/* Create Genre Form (Limpio, sin cajas anidadas) */}
          <div className="p-4 rounded-2xl bg-[#0c0d16] border border-[#23273e] flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-amber-400 font-bold tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span>AGREGAR GÉNERO AL CATÁLOGO</span>
              </span>
              <span className="text-slate-500">POST /api/generos</span>
            </div>

            <form onSubmit={handleCrearGenero} className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[240px] flex items-center bg-[#07080f] border border-[#252a42] focus-within:border-amber-400 rounded-xl px-3.5 py-2">
                <span className="text-amber-400 font-mono text-xs mr-2">{'>'}</span>
                <input
                  type="text"
                  required
                  value={nuevoGeneroNombre}
                  onChange={(e) => setNuevoGeneroNombre(e.target.value)}
                  placeholder="Nombre oficial (ej: Isekai, Mecha, Cyberpunk)..."
                  className="bg-transparent border-none text-xs text-white placeholder-slate-600 focus:outline-none w-full"
                />
              </div>

              <button
                type="submit"
                disabled={creandoGenero}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-md"
              >
                {creandoGenero ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>Crear Género</span>
              </button>
            </form>

            {errorGenero && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-xs text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorGenero}</span>
              </div>
            )}
          </div>

          {/* Lista de géneros estilo terminal */}
          <div className="rounded-2xl bg-[#0c0d16] border border-[#23273e] overflow-hidden">
            <div className="px-5 py-3 border-b border-[#1c2033] flex items-center justify-between text-xs font-mono text-slate-400">
              <span>LISTADO DE GÉNEROS PERSISTIDOS ({generos.length})</span>
              <button
                onClick={cargarGeneros}
                className="hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${loadingGeneros ? 'animate-spin' : ''}`} />
                <span>Recargar</span>
              </button>
            </div>

            <div className="divide-y divide-[#171a2b]">
              {generos.map((g) => (
                <div key={g._id} className="px-5 py-3 flex items-center justify-between gap-4 hover:bg-[#121422] transition-colors">
                  {generoEnEdicion?._id === g._id ? (
                    <div className="flex items-center gap-2 flex-1 max-w-sm">
                      <input
                        type="text"
                        value={nombreEditado}
                        onChange={(e) => setNombreEditado(e.target.value)}
                        className="bg-[#07080f] border border-amber-500 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none w-full font-mono"
                        autoFocus
                      />
                      <button
                        onClick={() => handleRenombrarGenero(g._id)}
                        className="p-1 rounded-md bg-lime-400 text-slate-950 hover:bg-lime-300 cursor-pointer"
                        title="Confirmar"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setGeneroEnEdicion(null)}
                        className="p-1 rounded-md bg-[#1a1d2e] text-slate-300 hover:text-white cursor-pointer"
                        title="Cancelar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-amber-400 text-xs">●</span>
                      <span className="text-sm font-semibold text-white">{g.nombre}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setGeneroEnEdicion(g);
                        setNombreEditado(g.nombre);
                        setErrorGenero('');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#141624] hover:bg-purple-600 text-slate-300 hover:text-white text-xs font-mono transition-colors cursor-pointer border border-[#23273e]"
                      title="Renombrar género"
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
                <p className="p-8 text-center text-xs text-slate-500 font-mono">
                  [EMPTY_CATALOG] No hay géneros registrados.
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
        <div className="flex flex-col gap-5">
          {/* Acciones principales: Crear anime + Importar MAL */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#0c0d16] border border-[#23273e]">
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
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>NUEVO ANIME [+]</span>
            </button>

            {/* Ingest Assistant */}
            <form onSubmit={handleImport} className="flex items-center gap-2">
              <div className="flex items-center bg-[#07080f] border border-[#252a42] rounded-xl px-3 py-1.5 text-xs text-white w-60">
                <span className="text-amber-400 font-mono text-xs mr-2">{'>'}</span>
                <input
                  type="text"
                  value={importQuery}
                  onChange={(e) => setImportQuery(e.target.value)}
                  placeholder="ID o Nombre en MyAnimeList..."
                  className="bg-transparent border-none text-white focus:outline-none w-full placeholder-slate-600"
                />
              </div>
              <button
                type="submit"
                disabled={isImporting}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-md"
              >
                {isImporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span>Importar MAL</span>
              </button>
            </form>
          </div>

          {/* Barra de búsqueda simple */}
          <div className="flex items-center bg-[#07080f] border border-[#23273e] rounded-xl px-3.5 py-2 text-xs text-white max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={busquedaAnime}
              onChange={(e) => setBusquedaAnime(e.target.value)}
              placeholder="Buscar anime en catálogo..."
              className="bg-transparent border-none text-white focus:outline-none w-full placeholder-slate-600"
            />
          </div>

          {/* Tabla de animes limpia */}
          <div className="rounded-2xl bg-[#0c0d16] border border-[#23273e] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#07080f] text-slate-400 font-mono text-[10px] uppercase tracking-wider border-b border-[#1c2033]">
                  <tr>
                    <th className="px-5 py-3">Serie</th>
                    <th className="px-4 py-3">Géneros</th>
                    <th className="px-4 py-3">Capítulos</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Puntaje</th>
                    <th className="px-5 py-3 text-right">Comandos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#171a2b]">
                  {animesFiltrados.map((a) => (
                    <tr key={a._id} className="hover:bg-[#121422] transition-colors">
                      <td className="px-5 py-3 flex items-center gap-3">
                        <img
                          src={a.imagenPortada}
                          alt={a.titulo}
                          className="w-9 h-12 rounded-lg object-cover bg-[#07080f] flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = "https://via.placeholder.com/100x140?text=No+Img";
                          }}
                        />
                        <div>
                          <p className="font-bold text-white text-xs leading-tight">{a.titulo}</p>
                          {a.tituloOriginal && (
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">{a.tituloOriginal}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(a.generos) && a.generos.map(g => (
                            <span key={g} className="px-1.5 py-0.2 rounded bg-[#141624] text-[9px] font-mono text-purple-300 border border-[#23273e]">
                              {g}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300">
                        {a.totalEpisodios > 0 ? `${a.totalEpisodios} eps` : 'Continuo'}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                        {a.estadoEmision}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-amber-400">
                        {a.calificacionPromedio || 0} ★
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setPatchModalAnime(a);
                              setPatchGenerosSeleccionados([]);
                            }}
                            className="px-2 py-1 rounded-md bg-[#141624] hover:bg-amber-500 hover:text-slate-950 text-amber-300 text-[10px] font-mono font-bold transition-colors cursor-pointer border border-amber-500/30"
                            title="Anexar géneros"
                          >
                            +Género
                          </button>

                          <button
                            onClick={() => handleOpenEdit(a)}
                            className="p-1 rounded-md bg-[#141624] hover:bg-purple-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="Editar anime"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteAnime(a._id, a.titulo)}
                            className="p-1 rounded-md text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
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

      {/* ========================================================= */}
      {/* PESTAÑA 3: GESTIÓN DE USUARIOS                            */}
      {/* ========================================================= */}
      {activeTab === 'usuarios' && (
        <div className="flex flex-col gap-5">
          {/* Métricas simples estilo telemetría */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
            <div className="p-3.5 rounded-xl bg-[#0c0d16] border border-[#23273e] flex items-center justify-between">
              <span className="text-xs text-slate-400">TOTAL USUARIOS:</span>
              <span className="text-base font-black text-white">{usuarios.length}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0c0d16] border border-[#23273e] flex items-center justify-between">
              <span className="text-xs text-amber-400">ADMINISTRADORES:</span>
              <span className="text-base font-black text-amber-400">
                {usuarios.filter(u => u.rol === 'ADMIN').length}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0c0d16] border border-[#23273e] flex items-center justify-between">
              <span className="text-xs text-slate-400">ESTÁNDAR (STD):</span>
              <span className="text-base font-black text-slate-300">
                {usuarios.filter(u => u.rol !== 'ADMIN').length}
              </span>
            </div>
          </div>

          {/* Filtro de búsqueda */}
          <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-[#0c0d16] border border-[#23273e]">
            <div className="flex items-center bg-[#07080f] border border-[#23273e] rounded-lg px-3 py-1.5 text-xs text-white w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                value={busquedaUsuario}
                onChange={(e) => setBusquedaUsuario(e.target.value)}
                placeholder="Buscar usuario..."
                className="bg-transparent border-none text-white focus:outline-none w-full placeholder-slate-600"
              />
            </div>

            <button
              onClick={cargarUsuarios}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 font-mono cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin' : ''}`} />
              <span>Recargar</span>
            </button>
          </div>

          {/* Tabla de usuarios limpia */}
          <div className="rounded-2xl bg-[#0c0d16] border border-[#23273e] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#07080f] text-slate-400 font-mono text-[10px] uppercase tracking-wider border-b border-[#1c2033]">
                  <tr>
                    <th className="px-5 py-3">Usuario</th>
                    <th className="px-4 py-3">Rol</th>
                    <th className="px-4 py-3">Registro</th>
                    <th className="px-5 py-3 text-right">Comandos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#171a2b]">
                  {usuariosFiltrados.map((u) => {
                    const esAdmin = u.rol === 'ADMIN';
                    return (
                      <tr key={u._id} className="hover:bg-[#121422] transition-colors">
                        <td className="px-5 py-3 flex items-center gap-3">
                          {u.avatar ? (
                            <img
                              src={u.avatar}
                              alt={u.nombre}
                              className="w-8 h-8 rounded-full object-cover border border-purple-500/40"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                              esAdmin ? 'bg-amber-400 text-slate-950' : 'bg-purple-900/80 text-purple-200'
                            }`}>
                              {(u.nombre || 'U').substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-white text-xs">{u.nombre}</p>
                            <p className="text-slate-500 text-[11px] font-mono">{u.email}</p>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            esAdmin ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {u.rol}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-slate-400 text-[11px] font-mono">
                          {u.fechaRegistro ? new Date(u.fechaRegistro).toLocaleDateString() : '—'}
                        </td>

                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2 font-mono">
                            <button
                              onClick={() => handleToggleRol(u)}
                              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                                esAdmin
                                  ? 'bg-[#141624] text-slate-400 hover:text-white border border-[#23273e]'
                                  : 'bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {esAdmin ? '→ STD' : '→ ADMIN'}
                            </button>

                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
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

      {/* MODAL: AGREGAR GÉNEROS (PATCH /api/animes/:id/generos) */}
      {patchModalAnime && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#0c0d16] border border-amber-500/40 rounded-2xl max-w-md w-full p-5 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1c2033] pb-3">
              <h3 className="text-sm font-bold text-white font-mono">
                // ANEXAR GÉNEROS: {patchModalAnime.titulo}
              </h3>
              <button
                onClick={() => setPatchModalAnime(null)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 font-mono">
              Selecciona géneros para anexar a la serie (sin duplicar ni reemplazar).
            </p>

            <div className="p-3 rounded-xl bg-[#07080f] border border-[#23273e] max-h-40 overflow-y-auto flex flex-wrap gap-1.5 font-mono">
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
                    className={`px-2 py-0.5 rounded text-xs transition-all ${
                      yaLoTiene
                        ? 'bg-[#141624] text-slate-600 cursor-not-allowed'
                        : isSelected
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-[#10121d] text-slate-300 hover:text-white'
                    }`}
                  >
                    {yaLoTiene ? `✓ ${g.nombre}` : isSelected ? `+ ${g.nombre}` : g.nombre}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#1c2033] font-mono text-xs">
              <button
                onClick={() => setPatchModalAnime(null)}
                className="px-3 py-1.5 text-slate-400 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handlePatchGeneros}
                disabled={patchGenerosSeleccionados.length === 0}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer disabled:opacity-40"
              >
                Confirmar ({patchGenerosSeleccionados.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREAR / EDITAR ANIME */}
      {isAnimeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#0c0d16] border border-[#272d47] rounded-2xl max-w-lg w-full p-5 flex flex-col gap-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1c2033] pb-3">
              <h3 className="text-sm font-bold text-white font-mono">
                {editingAnimeId ? '// EDITAR SERIE' : '// NUEVA SERIE EN CATÁLOGO'}
              </h3>
              <button
                onClick={() => setIsAnimeModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAnime} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-400 font-mono">Título Oficial</span>
                <input
                  type="text"
                  required
                  value={animeForm.titulo}
                  onChange={(e) => setAnimeForm({ ...animeForm, titulo: e.target.value })}
                  placeholder="Ej: Death Note"
                  className="bg-[#07080f] border border-[#23273e] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-slate-400 font-mono">Géneros del Catálogo ({animeForm.generos.length} elegidos)</span>
                <div className="p-2.5 rounded-lg bg-[#07080f] border border-[#23273e] max-h-32 overflow-y-auto flex flex-wrap gap-1 font-mono">
                  {generos.map((g) => {
                    const isSelected = animeForm.generos.includes(g.nombre);
                    return (
                      <button
                        type="button"
                        key={g._id}
                        onClick={() => toggleGeneroSeleccionado(g.nombre)}
                        className={`px-2 py-0.5 rounded text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-purple-600 text-white font-bold'
                            : 'bg-[#141624] text-slate-400 hover:text-white'
                        }`}
                      >
                        {isSelected && '✓ '}
                        {g.nombre}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-400">Total Episodios</span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={animeForm.totalEpisodios}
                    onChange={(e) => setAnimeForm({ ...animeForm, totalEpisodios: e.target.value })}
                    className="bg-[#07080f] border border-[#23273e] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-400">Estado</span>
                  <select
                    value={animeForm.estadoEmision}
                    onChange={(e) => setAnimeForm({ ...animeForm, estadoEmision: e.target.value })}
                    className="bg-[#07080f] border border-[#23273e] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="Finalizado">Finalizado</option>
                    <option value="En emisión">En emisión</option>
                    <option value="Por estrenar">Por estrenar</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-400 font-mono">URL de Portada</span>
                <input
                  type="url"
                  required
                  value={animeForm.imagenPortada}
                  onChange={(e) => setAnimeForm({ ...animeForm, imagenPortada: e.target.value })}
                  className="bg-[#07080f] border border-[#23273e] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-400 font-mono">Sinopsis</span>
                <textarea
                  required
                  rows="3"
                  value={animeForm.sinopsis}
                  onChange={(e) => setAnimeForm({ ...animeForm, sinopsis: e.target.value })}
                  className="bg-[#07080f] border border-[#23273e] rounded-lg p-2.5 text-xs text-white focus:outline-none resize-none font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1c2033] font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setIsAnimeModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer"
                >
                  {editingAnimeId ? 'Guardar Cambios' : 'Confirmar y Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
