import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import DashboardView from './views/DashboardView';
import CatalogView from './views/CatalogView';
import LibraryView from './views/LibraryView';
import ReviewsView from './views/ReviewsView';
import ProfileView from './views/ProfileView';
import AdminView from './views/AdminView';
import NotFoundView from './views/NotFoundView';

import { kirokuApi } from './services/api';
import { Star, Plus, Check, X } from 'lucide-react';

// Obtener mapa inicial de biblioteca desde localStorage
const getInitialLibraryMap = () => {
  try {
    const cached = localStorage.getItem('kiroku_library_ids');
    return cached ? JSON.parse(cached) : {};
  } catch {
    return {};
  }
};

// Resolver ruta URL a módulo activo o 404
const resolvePathToNav = (pathname = '/') => {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/' || clean === '/catalogo') return 'catalogo';
  if (clean === '/dashboard') return 'dashboard';
  if (clean === '/biblioteca') return 'biblioteca';
  if (clean === '/resenas') return 'resenas';
  if (clean === '/perfil') return 'perfil';
  if (clean === '/admin') return 'admin';
  return '404'; // Cualquier ruta que no exista va a 404
};

export default function App() {
  const [currentPath, setCurrentPath] = useState(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );

  const activeNav = resolvePathToNav(currentPath);

  const [isSidebarOpen, setIsSidebarOpen] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );

  const [user, setUser] = useState({
    id: null,
    name: 'Invitado',
    initials: 'IN',
    rol: 'Sin login',
    email: '',
  });

  const [libraryMap, setLibraryMap] = useState(getInitialLibraryMap);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [animeReviews, setAnimeReviews] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Manejar cambio de panel actualizando la URL en la barra de navegación del navegador
  const handleNavChange = (navId) => {
    const routeMap = {
      catalogo: '/catalogo',
      dashboard: '/dashboard',
      biblioteca: '/biblioteca',
      resenas: '/resenas',
      perfil: '/perfil',
      admin: '/admin',
    };
    const targetUrl = routeMap[navId] || '/catalogo';
    window.history.pushState(null, '', targetUrl);
    setCurrentPath(targetUrl);
  };

  // Escuchar navegación del navegador (adelante / atrás)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Cargar seguimientos reales desde la base de datos
  const cargarBiblioteca = async () => {
    const token = localStorage.getItem('kiroku_token');
    if (!token) {
      setLibraryMap({});
      localStorage.removeItem('kiroku_library_ids');
      return;
    }
    try {
      const res = await kirokuApi.getSeguimientos();
      if (Array.isArray(res)) {
        const mapa = {};
        res.forEach((s) => {
          const aId = s.anime_id?._id || s.anime_id;
          if (aId) mapa[String(aId)] = true;
        });
        setLibraryMap(mapa);
        localStorage.setItem('kiroku_library_ids', JSON.stringify(mapa));
      }
    } catch (err) {
      console.warn('Error al cargar biblioteca:', err.message);
    }
  };

  // Check stored session on mount
  useEffect(() => {
    const token = localStorage.getItem('kiroku_token');
    if (token) {
      kirokuApi.getMiPerfil()
        .then((res) => {
          if (res?.usuario) {
            const u = res.usuario;
            setUser({
              id: u._id,
              name: u.nombre,
              initials: u.nombre.substring(0, 2).toUpperCase(),
              rol: u.rol || 'STD',
              email: u.email,
            });
          }
        })
        .catch(() => {
          localStorage.removeItem('kiroku_token');
        });
      cargarBiblioteca();
    }

    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('kiroku_token');
    localStorage.removeItem('kiroku_library_ids');
    setUser({
      id: null,
      name: 'Invitado',
      initials: 'IN',
      rol: 'Sin login',
      email: '',
    });
    setLibraryMap({});
    showToast('Sesión cerrada correctamente.');
    handleNavChange('catalogo');
  };

  // Open anime detail modal
  const handleOpenDetail = async (anime) => {
    setSelectedAnime(anime);
    setLoadingDetail(true);
    setAnimeReviews([]);
    try {
      const fullAnime = await kirokuApi.getAnimeById(anime._id).catch(() => null);
      if (fullAnime) setSelectedAnime(fullAnime);

      const reviews = await kirokuApi.getResenasPorAnime(anime._id).catch(() => []);
      if (Array.isArray(reviews)) setAnimeReviews(reviews);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Agregar anime a la biblioteca
  const handleAddToLibrary = async (animeId, titulo = 'Anime') => {
    const token = localStorage.getItem('kiroku_token');
    if (!token) {
      showToast('Debes iniciar sesión para agregar animes a tu biblioteca.');
      return;
    }

    try {
      await kirokuApi.crearSeguimiento(animeId, 'Viendo', 0);
      setLibraryMap((prev) => {
        const nuevo = { ...prev, [String(animeId)]: true };
        localStorage.setItem('kiroku_library_ids', JSON.stringify(nuevo));
        return nuevo;
      });
      showToast(`"${titulo}" agregado a tu biblioteca`);
      if (selectedAnime && selectedAnime._id === animeId) {
        setSelectedAnime(null);
      }
    } catch (err) {
      showToast(`Aviso: ${err.message}`);
      if (err.message && err.message.toLowerCase().includes('ya tenés')) {
        setLibraryMap((prev) => {
          const nuevo = { ...prev, [String(animeId)]: true };
          localStorage.setItem('kiroku_library_ids', JSON.stringify(nuevo));
          return nuevo;
        });
      }
    }
  };

  const isAlreadyInLibrary = selectedAnime ? !!libraryMap[String(selectedAnime._id)] : false;

  return (
    <div className="min-h-screen flex bg-[#08090f] text-slate-100 font-sans selection:bg-purple-600 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeNav={activeNav}
        onNavChange={handleNavChange}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
          onNavChange={handleNavChange}
        />

        <main className="flex-1 px-4 sm:px-6 md:px-8 py-5 md:py-7 flex flex-col max-w-7xl w-full mx-auto">
          {activeNav === 'dashboard' && (
            <DashboardView user={user} onShowToast={showToast} />
          )}

          {activeNav === 'catalogo' && (
            <CatalogView
              libraryMap={libraryMap}
              onAddToLibrary={handleAddToLibrary}
              onShowToast={showToast}
              onOpenDetail={handleOpenDetail}
            />
          )}

          {activeNav === 'biblioteca' && (
            <LibraryView
              onShowToast={showToast}
              onOpenReviewModal={() => handleNavChange('resenas')}
            />
          )}

          {activeNav === 'resenas' && (
            <ReviewsView
              user={user}
              onShowToast={showToast}
            />
          )}

          {activeNav === 'perfil' && (
            <ProfileView
              user={user}
              onUserUpdate={(updated) => {
                setUser(prev => ({ ...prev, ...updated }));
                cargarBiblioteca();
              }}
              onShowToast={showToast}
              onLogout={handleLogout}
            />
          )}

          {activeNav === 'admin' && (
            <AdminView onShowToast={showToast} />
          )}

          {/* RUTA NO VÁLIDA (404) */}
          {activeNav === '404' && (
            <NotFoundView
              pathname={currentPath}
              onGoHome={() => handleNavChange('catalogo')}
            />
          )}
        </main>
      </div>

      {/* Anime Detail Modal */}
      {selectedAnime && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setSelectedAnime(null)}
        >
          <div
            className="bg-[#121422] border border-[#272d47] rounded-3xl max-w-2xl w-full p-5 sm:p-6 flex flex-col gap-5 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 sm:gap-4">
                <img
                  src={selectedAnime.imagenPortada}
                  alt={selectedAnime.titulo}
                  className="w-14 sm:w-16 h-20 sm:h-24 rounded-xl object-cover bg-[#090a10] shadow-md flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/150x200?text=Sin+Portada";
                  }}
                />
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                    {selectedAnime.titulo}
                  </h3>
                  {selectedAnime.tituloOriginal && (
                    <p className="text-xs text-slate-400 italic mt-0.5">{selectedAnime.tituloOriginal}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mt-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{selectedAnime.calificacionPromedio || 0} ★</span>
                    <span className="text-slate-500 font-normal">({selectedAnime.totalResenas || 0} reseñas)</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedAnime(null)}
                className="w-8 h-8 rounded-full bg-[#1b1f33] hover:bg-[#282e4a] text-slate-400 hover:text-white flex items-center justify-center text-sm cursor-pointer flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Technical sheet pills */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-[#090a10] border border-[#1e2338]">
                <span className="text-[10px] text-slate-500 uppercase block">Episodios</span>
                <span className="font-bold text-white">
                  {selectedAnime.totalEpisodios > 0 ? selectedAnime.totalEpisodios : 'Continuo'}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#090a10] border border-[#1e2338]">
                <span className="text-[10px] text-slate-500 uppercase block">Estado</span>
                <span className="font-bold text-purple-300 truncate block">{selectedAnime.estadoEmision}</span>
              </div>
              <div className="p-2 rounded-xl bg-[#090a10] border border-[#1e2338]">
                <span className="text-[10px] text-slate-500 uppercase block">Año</span>
                <span className="font-bold text-white">{selectedAnime.anioEstreno || '—'}</span>
              </div>
            </div>

            {/* Géneros */}
            <div className="flex flex-wrap gap-1.5">
              {Array.isArray(selectedAnime.generos) && selectedAnime.generos.map((g) => (
                <span key={g} className="px-2.5 py-0.5 rounded-lg bg-[#1a1d2e] text-[11px] font-semibold text-purple-300 border border-[#2b314e]">
                  {g}
                </span>
              ))}
            </div>

            {/* Sinopsis */}
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Sinopsis</span>
              <p className="text-xs text-slate-300 leading-relaxed bg-[#090a10] p-3 rounded-xl border border-[#1e2338]">
                {selectedAnime.sinopsis || 'Sin sinopsis disponible.'}
              </p>
            </div>

            {/* Reviews list */}
            <div className="flex flex-col gap-2 pt-2 border-t border-[#1b1f33]">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Reseñas de la Comunidad</span>
                <span className="text-[10px] text-purple-400 font-semibold">{animeReviews.length} registradas</span>
              </span>

              <div className="max-h-40 overflow-y-auto flex flex-col gap-2">
                {animeReviews.map((r) => (
                  <div key={r._id} className="p-2.5 rounded-xl bg-[#090a10] border border-[#1e2338] text-xs">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-white">{r.usuario_id?.nombre || 'Usuario'}</span>
                      <span className="font-bold text-amber-400">{r.calificacion} / 10 ★</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">{r.texto}</p>
                    {r.spoiler && (
                      <span className="text-[10px] text-rose-400 font-semibold block mt-1">⚠️ Contiene spoilers</span>
                    )}
                  </div>
                ))}
                {animeReviews.length === 0 && (
                  <p className="text-center text-xs text-slate-500 py-3">No hay reseñas aún para este título.</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-3 border-t border-[#1b1f33]">
              <button
                disabled={isAlreadyInLibrary}
                onClick={() => !isAlreadyInLibrary && handleAddToLibrary(selectedAnime._id, selectedAnime.titulo)}
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
                onClick={() => setSelectedAnime(null)}
                className="px-4 sm:px-5 py-2.5 rounded-xl bg-[#1b1f33] hover:bg-[#282e4a] text-slate-300 text-xs font-medium transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#141728] border border-purple-500 text-purple-200 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-bounce max-w-xs sm:max-w-md">
          <span className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0"></span>
          <span className="truncate">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
