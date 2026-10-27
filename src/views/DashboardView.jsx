import React, { useState, useEffect } from 'react';
import { BarChart3, Clock, CheckCircle, Flame, Star, Trophy, RefreshCw, AlertCircle } from 'lucide-react';
import { kirokuApi } from '../services/api';

export default function DashboardView({ user, onShowToast, onOpenDetail }) {
  const [personalStats, setPersonalStats] = useState(null);
  const [rankings, setRankings] = useState({ mejorPuntuados: [], masSeguidos: [] });
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('kiroku_token');
  const isLoggedIn = !!token;

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // 1. Rankings públicos (GET /api/stats/rankings)
      const rankData = await kirokuApi.getRankings().catch(() => null);
      if (rankData) {
        setRankings({
          mejorPuntuados: rankData.mejorPuntuados || [],
          masSeguidos: rankData.masSeguidos || [],
        });
      }

      // 2. Si está logueado, cargar estadísticas personales (GET /api/usuarios/me/estadisticas)
      if (isLoggedIn) {
        const stats = await kirokuApi.getEstadisticasPersonales().catch(() => null);
        if (stats) setPersonalStats(stats);
      } else {
        setPersonalStats(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [token]);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-purple-400" />
            <span>Dashboard y Estadísticas</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Resumen de actividad personal en la base de datos y rankings comunitarios.
          </p>
        </div>

        <button
          onClick={cargarDatos}
          disabled={loading}
          className="px-3.5 py-1.5 rounded-xl bg-[#121422] hover:bg-[#1a1d2e] border border-[#21263d] text-xs font-semibold text-slate-300 flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* SECCIÓN 1: ESTADÍSTICAS PERSONALES (GET /api/usuarios/me/estadisticas) */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#1b1f33] pb-2">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Mi Rendimiento Personal</span>
          </h2>
          {!isLoggedIn && (
            <span className="text-[11px] text-amber-400">Inicia sesión para registrar tu progreso</span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Episodios vistos */}
          <div className="p-4 rounded-2xl bg-[#121422] border border-[#21263d] flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-purple-400">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-black text-white">
                {personalStats?.episodiosVistos ?? (isLoggedIn ? 0 : '—')}
              </span>
              <p className="text-[11px] text-slate-400">Capítulos vistos en total</p>
            </div>
          </div>

          {/* Horas vistas (fórmula: episodios * 24 / 60) */}
          <div className="p-4 rounded-2xl bg-[#121422] border border-[#21263d] flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-lime-950/60 border border-lime-800/40 flex items-center justify-center text-lime-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-black text-white">
                {personalStats?.horasVistas ?? (isLoggedIn ? 0 : '—')} h
              </span>
              <p className="text-[11px] text-slate-400">Horas de historias (24 min/ep)</p>
            </div>
          </div>

          {/* Series por estado */}
          <div className="p-4 rounded-2xl bg-[#121422] border border-[#21263d] col-span-1 sm:col-span-2">
            <span className="text-xs font-bold text-slate-300 block mb-2">Desglose de Biblioteca por Estado</span>
            <div className="grid grid-cols-4 gap-2 text-center">
              {['Viendo', 'Completado', 'Pendiente', 'Abandonado'].map((st) => {
                const found = personalStats?.porEstado?.find(e => e.estado === st);
                return (
                  <div key={st} className="p-2 rounded-xl bg-[#090a10] border border-[#1b1f33]">
                    <span className="text-sm font-bold text-white">
                      {isLoggedIn ? (found ? found.cantidad : 0) : '—'}
                    </span>
                    <p className="text-[10px] text-slate-400 truncate">{st}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Géneros favoritos del usuario ($lookup & $unwind) */}
        {isLoggedIn && (
          <div className="p-4 rounded-2xl bg-[#121422] border border-[#21263d]">
            <span className="text-xs font-bold text-slate-300 block mb-2.5">
              Mis Géneros más Vistos en Biblioteca
            </span>
            {personalStats?.generosFavoritos && personalStats.generosFavoritos.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {personalStats.generosFavoritos.map((g) => (
                  <span
                    key={g.genero}
                    className="px-3 py-1 rounded-xl bg-[#1a1d2e] border border-[#272d47] text-xs font-medium text-purple-300 flex items-center gap-2"
                  >
                    <span>{g.genero}</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-purple-900/60 text-[10px] text-white">
                      {g.cantidad} animes
                    </span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-1">
                Aún no tienes series registradas en tu biblioteca personal.
              </p>
            )}
          </div>
        )}
      </div>

      {/* SECCIÓN 2: RANKINGS DE LA COMUNIDAD (GET /api/stats/rankings) */}
      <div className="flex flex-col gap-4">
        <div className="border-b border-[#1b1f33] pb-2">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Rankings de la Comunidad</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Top 10 Mejor Puntuados */}
          <div className="p-5 rounded-3xl bg-[#121422] border border-[#21263d] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Top Mejor Calificados</span>
              </h3>
              <span className="text-[10px] text-slate-500">Por promedio de reseñas</span>
            </div>

            <div className="divide-y divide-[#1b1f33]">
              {rankings.mejorPuntuados && rankings.mejorPuntuados.length > 0 ? (
                rankings.mejorPuntuados.map((a, i) => (
                  <div 
                    key={a._id || i} 
                    onClick={() => onOpenDetail && onOpenDetail(a)}
                    className="py-2.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#181a2b] px-2 rounded-xl transition-colors"
                    title="Ver ficha técnica"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-slate-500 font-mono w-4">#{i + 1}</span>
                      {a.imagenPortada && (
                        <img 
                          src={a.imagenPortada} 
                          alt={a.titulo} 
                          className="w-8 h-10 rounded-md object-cover bg-[#090a10]"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      )}
                      <span className="text-xs font-semibold text-white hover:text-purple-300 transition-colors">
                        {a.titulo}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-amber-400">{a.calificacionPromedio || 0} ★</span>
                      <span className="text-[10px] text-slate-500">({a.totalResenas || 0} reseñas)</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 py-4 text-center">
                  Aún no hay reseñas registradas para calcular el ranking.
                </p>
              )}
            </div>
          </div>

          {/* Top 10 Más Seguidos */}
          <div className="p-5 rounded-3xl bg-[#121422] border border-[#21263d] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-500" />
                <span>Top Más Populares en Bibliotecas</span>
              </h3>
              <span className="text-[10px] text-slate-500">Por total de seguidores</span>
            </div>

            <div className="divide-y divide-[#1b1f33]">
              {rankings.masSeguidos && rankings.masSeguidos.length > 0 ? (
                rankings.masSeguidos.map((a, i) => (
                  <div 
                    key={a._id || i} 
                    onClick={() => onOpenDetail && onOpenDetail(a)}
                    className="py-2.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#181a2b] px-2 rounded-xl transition-colors"
                    title="Ver ficha técnica"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-slate-500 font-mono w-4">#{i + 1}</span>
                      {a.imagenPortada && (
                        <img 
                          src={a.imagenPortada} 
                          alt={a.titulo} 
                          className="w-8 h-10 rounded-md object-cover bg-[#090a10]"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      )}
                      <span className="text-xs font-semibold text-white hover:text-purple-300 transition-colors">
                        {a.titulo}
                      </span>
                    </div>
                    {/* Campo exacto devuelto por stats.controller: a.seguidores */}
                    <span className="text-xs font-bold text-purple-400">
                      {a.seguidores ?? a.totalSeguidores ?? 0} {a.seguidores === 1 ? 'seguidor' : 'seguidores'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 py-4 text-center">
                  Aún no hay seguimientos en bibliotecas para calcular el ranking.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
