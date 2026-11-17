import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Toast from './components/common/Toast';
import RouteGuard from './components/common/RouteGuard';
import AnimeDetailModal from './components/anime/AnimeDetailModal';

import DashboardView from './views/DashboardView';
import CatalogView from './views/CatalogView';
import LibraryView from './views/LibraryView';
import ReviewsView from './views/ReviewsView';
import ProfileView from './views/ProfileView';
import AdminView from './views/AdminView';
import NotFoundView from './views/NotFoundView';

import { kirokuApi } from './services/api';

const getInitialLibraryMap = () => {
  try {
    const cached = localStorage.getItem('kiroku_library_ids');
    return cached ? JSON.parse(cached) : {};
  } catch {
    return {};
  }
};

const resolvePathToNav = (pathname = '/') => {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/' || clean === '/catalogo') return 'catalogo';
  if (clean === '/dashboard') return 'dashboard';
  if (clean === '/biblioteca') return 'biblioteca';
  if (clean === '/resenas') return 'resenas';
  if (clean === '/perfil') return 'perfil';
  if (clean === '/admin') return 'admin';
  return '404';
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
    avatar: '',
  });

  const [libraryMap, setLibraryMap] = useState(getInitialLibraryMap);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [animeReviews, setAnimeReviews] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [targetReviewAnimeId, setTargetReviewAnimeId] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleNavChange = (navId, extraAnimeId = null) => {
    if (extraAnimeId) {
      setTargetReviewAnimeId(extraAnimeId);
    }
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

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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

  useEffect(() => {
    const token = localStorage.getItem('kiroku_token');
    const cachedAvatar = localStorage.getItem('kiroku_user_avatar') || '';
    if (token) {
      kirokuApi.getMiPerfil()
        .then((res) => {
          if (res?.usuario) {
            const u = res.usuario;
            const userAvatar = u.avatar || cachedAvatar;
            setUser({
              id: u._id,
              name: u.nombre,
              initials: u.nombre.substring(0, 2).toUpperCase(),
              rol: u.rol || 'STD',
              email: u.email,
              avatar: userAvatar,
            });
            if (userAvatar) {
              localStorage.setItem('kiroku_user_avatar', userAvatar);
            }
          }
        })
        .catch(() => {
          localStorage.removeItem('kiroku_token');
          localStorage.removeItem('kiroku_user_avatar');
        });
      cargarBiblioteca();
    }

    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);

    const handleUnauthorized = () => {
      handleLogout();
      showToast('Tu sesión ha expirado o no es válida. Por favor inicia sesión nuevamente.');
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('kiroku_token');
    localStorage.removeItem('kiroku_library_ids');
    localStorage.removeItem('kiroku_user_avatar');
    setUser({
      id: null,
      name: 'Invitado',
      initials: 'IN',
      rol: 'Sin login',
      email: '',
      avatar: '',
    });
    setLibraryMap({});
    showToast('Sesión cerrada correctamente.');
    handleNavChange('catalogo');
  };

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
          user={user}
        />

        <main className="flex-1 px-4 sm:px-6 md:px-8 py-5 md:py-7 flex flex-col max-w-7xl w-full mx-auto">
          {activeNav === 'dashboard' && (
            <DashboardView
              user={user}
              onShowToast={showToast}
              onOpenDetail={handleOpenDetail}
            />
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
              onOpenReviewModal={(animeId) => handleNavChange('resenas', animeId)}
              onLibraryChange={cargarBiblioteca}
              onNavigate={handleNavChange}
            />
          )}

          {activeNav === 'resenas' && (
            <ReviewsView
              user={user}
              onShowToast={showToast}
              initialAnimeId={targetReviewAnimeId}
            />
          )}

          {activeNav === 'perfil' && (
            <ProfileView
              user={user}
              onUserUpdate={(updated) => {
                setUser(prev => ({ ...prev, ...updated }));
                if (updated.avatar) {
                  localStorage.setItem('kiroku_user_avatar', updated.avatar);
                }
                cargarBiblioteca();
              }}
              onShowToast={showToast}
              onLogout={handleLogout}
            />
          )}

          {activeNav === 'admin' && (
            <RouteGuard
              user={user}
              requiredRole="ADMIN"
              onRedirect={() => handleNavChange('catalogo')}
            >
              <AdminView onShowToast={showToast} />
            </RouteGuard>
          )}

          {activeNav === '404' && (
            <NotFoundView
              pathname={currentPath}
              onGoHome={() => handleNavChange('catalogo')}
            />
          )}

          {/* Footer institucional */}
          <Footer />
        </main>
      </div>

      {/* Modal Ficha Técnica de Anime */}
      <AnimeDetailModal
        anime={selectedAnime}
        isOpen={Boolean(selectedAnime)}
        onClose={() => setSelectedAnime(null)}
        reviews={animeReviews}
        user={user}
        isAlreadyInLibrary={isAlreadyInLibrary}
        onAddToLibrary={handleAddToLibrary}
        onNavigateToReviews={(animeId) => handleNavChange('resenas', animeId)}
      />

      {/* Notificación flotante Toast */}
      <Toast message={toastMessage} />
    </div>
  );
}
