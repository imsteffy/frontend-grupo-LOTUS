import React from 'react';
import { Menu } from 'lucide-react';

export default function Navbar({ isSidebarOpen, onToggleSidebar, onNavChange }) {
  return (
    <header className="h-16 border-b border-[#181a27] px-6 md:px-8 flex items-center justify-between bg-[#090a10]/80 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {/* Botón para desplegar / ocultar el menú lateral */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl bg-[#121422] border border-[#21263d] hover:border-purple-500 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title={isSidebarOpen ? "Ocultar menú lateral" : "Mostrar menú lateral"}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Solo aparece cuando la barra lateral está OCULTA. Al hacer clic redirige a la página principal */}
        {!isSidebarOpen && (
          <div
            onClick={() => onNavChange('catalogo')}
            className="flex items-center gap-2.5 cursor-pointer group select-none transition-all duration-200"
            title="Ir a la página principal"
          >
            <img
              src="/kiroku_logo.png"
              alt="Kiroku"
              className="w-8 h-8 rounded-xl object-contain shadow-md shadow-purple-900/40 group-hover:scale-105 transition-transform"
            />
            <span className="text-xl font-bold tracking-tight text-white font-sans group-hover:text-purple-300 transition-colors">
              kiroku
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3"></div>
    </header>
  );
}
