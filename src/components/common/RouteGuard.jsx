import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

/**
 * RouteGuard - Protege vistas según el rol requerido del usuario
 * @param {object} user - Objeto de usuario actual
 * @param {string} requiredRole - Rol exigido (ej: 'ADMIN')
 * @param {ReactNode} children - Vista a renderizar si está autorizado
 * @param {function} onRedirect - Callback para redirigir si el acceso es denegado
 */
export default function RouteGuard({ user, requiredRole = 'ADMIN', children, onRedirect }) {
  if (user?.rol === requiredRole) {
    return children;
  }

  return (
    <div className="p-8 sm:p-12 text-center rounded-3xl bg-[#121422] border border-rose-900/40 flex flex-col items-center gap-4 max-w-lg mx-auto my-12 shadow-2xl">
      <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-800/40 flex items-center justify-center text-rose-400 shadow-md">
        <ShieldAlert className="w-6 h-6" />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-400">
          Error 403 Forbidden
        </span>
        <h2 className="text-lg font-bold text-white">Acceso Restringido</h2>
        <p className="text-xs text-slate-400 leading-relaxed mt-1">
          Esta sección está reservada exclusivamente para administradores de Kiroku. Tu cuenta actual no posee privilegios suficientes para gestionar este panel.
        </p>
      </div>

      <button
        onClick={onRedirect}
        className="mt-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-purple-600/30"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver al Catálogo</span>
      </button>
    </div>
  );
}
