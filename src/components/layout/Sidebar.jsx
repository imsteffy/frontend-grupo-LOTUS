import React from 'react';
import { 
  BarChart3, 
  Film, 
  BookOpen, 
  MessageSquare, 
  ShieldCheck, 
  User, 
  LogOut,
  X
} from 'lucide-react';

export default function Sidebar({ isOpen = true, onClose, activeNav = 'catalogo', onNavChange, user, onLogout }) {
  const isLoggedIn = !!localStorage.getItem('kiroku_token');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'catalogo', label: 'Catálogo de Animes', icon: Film },
    { id: 'biblioteca', label: 'Mi Biblioteca', icon: BookOpen },
    { id: 'resenas', label: 'Reseñas Comunitarias', icon: MessageSquare },
    { id: 'perfil', label: isLoggedIn ? 'Mi Perfil' : 'Iniciar Sesión', icon: User },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Telón oscuro de fondo en móviles al abrir el menú */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity"
      />

      {/* Barra lateral: Drawer flotante en móviles / Barra fija pegada en escritorio */}
      <aside className="fixed inset-y-0 left-0 z-50 lg:sticky lg:top-0 h-screen w-64 flex-shrink-0 bg-[#090a10] border-r border-[#181a27] flex flex-col justify-between text-slate-300 select-none shadow-2xl lg:shadow-none transition-all duration-300">
        <div className="p-5 flex flex-col gap-6 overflow-y-auto">
          {/* Brand + Botón cerrar solo visible en móviles */}
          <div className="flex items-center justify-between px-2">
            <div 
              onClick={() => {
                onNavChange('catalogo');
                if (window.innerWidth < 1024 && onClose) onClose();
              }}
              className="flex items-center gap-3 cursor-pointer group"
              title="Ir a la página principal"
            >
              <img 
                src="/kiroku_logo.png" 
                alt="Kiroku Logo" 
                className="w-9 h-9 rounded-xl object-contain shadow-lg shadow-purple-900/40 group-hover:scale-105 transition-transform" 
              />
              <span className="text-xl font-bold tracking-tight text-white font-sans group-hover:text-purple-300 transition-colors">
                kiroku
              </span>
            </div>

            {/* Botón X de cerrar para celulares */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#121422] transition-colors cursor-pointer"
              title="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation list */}
          <div className="flex flex-col gap-1">
            <span className="px-3 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
              Navegación
            </span>
            <nav className="mt-2 flex flex-col gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavChange(item.id);
                      if (window.innerWidth < 1024 && onClose) onClose();
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-purple-900/40 text-white border border-purple-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#121422]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                    <span className="text-xs font-semibold">{item.label}</span>
                  </button>
                );
              })}

              {/* Admin Panel button - Only visible if user has ADMIN role */}
              {user?.rol === 'ADMIN' && (
                <button
                  onClick={() => {
                    onNavChange('admin');
                    if (window.innerWidth < 1024 && onClose) onClose();
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer mt-2 ${
                    activeNav === 'admin'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-amber-400/90 hover:text-amber-300 hover:bg-[#121422] border border-amber-500/20'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold">Panel Admin</span>
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* Footer: Botón fijo en la parte inferior izquierda */}
        {isLoggedIn && (
          <div className="p-4 border-t border-[#181a27] bg-[#090a10] flex-shrink-0">
            <button
              onClick={() => {
                onLogout();
                if (window.innerWidth < 1024 && onClose) onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-xs font-semibold text-rose-300 transition-colors cursor-pointer shadow-md"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
