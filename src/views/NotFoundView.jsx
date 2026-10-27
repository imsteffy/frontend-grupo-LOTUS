import React from 'react';
import { AlertTriangle, ArrowLeft, Film } from 'lucide-react';

export default function NotFoundView({ pathname = '', onGoHome }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="p-8 sm:p-12 rounded-3xl bg-[#121422] border border-[#21263d] max-w-md w-full flex flex-col items-center gap-5 shadow-2xl">
        {/* 404 Badge */}
        <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-800/40 flex items-center justify-center text-rose-400">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-5xl font-black text-white tracking-tight">404</span>
          <h1 className="text-lg font-bold text-slate-200">Página no encontrada</h1>
          <p className="text-xs text-slate-400 leading-relaxed mt-1">
            La dirección que ingresaste no existe en la plataforma Kiroku.
          </p>
          {pathname && (
            <span className="text-[11px] font-mono text-purple-400 bg-[#090a10] px-3 py-1.5 rounded-xl border border-[#1e2338] mt-2 inline-block break-all">
              Ruta: {pathname}
            </span>
          )}
        </div>

        {/* Action button */}
        <button
          onClick={onGoHome}
          className="mt-2 w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-purple-600/30"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Catálogo</span>
        </button>
      </div>
    </div>
  );
}
