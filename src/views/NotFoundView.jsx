import React from 'react';
import { ArrowLeft } from 'lucide-react';
import sasukeGif from '../assets/404-sasuke.gif';

export default function NotFoundView({ pathname = '', onGoHome }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="p-8 sm:p-12 rounded-3xl bg-[#121422] border border-[#21263d] max-w-lg w-full flex flex-col items-center gap-6 shadow-2xl">
        {/* GIF de Sasuke bailando (404) */}
        <div className="w-full flex justify-center">
          <img
            src={sasukeGif}
            alt="Sasuke Bailando 404"
            className="w-56 sm:w-64 h-auto rounded-2xl object-cover shadow-2xl border border-purple-500/30"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-5xl font-black text-white tracking-tight">404</span>
          <h1 className="text-xl font-bold text-slate-200">¡Ups! Esta página no existe</h1>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            Parece que te perdiste en el camino ninja. La dirección que ingresaste no existe en Kiroku.
          </p>
          {pathname && (
            <span className="text-[11px] font-mono text-purple-400 bg-[#090a10] px-3 py-1.5 rounded-xl border border-[#1e2338] mt-2 inline-block break-all">
              Ruta no válida: {pathname}
            </span>
          )}
        </div>

        {/* Action button */}
        <button
          onClick={onGoHome}
          className="w-full sm:w-auto px-8 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-purple-600/30"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Catálogo</span>
        </button>
      </div>
    </div>
  );
}
