import React, { useState } from 'react';
import { User, LogIn, UserPlus, Image, Check, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { kirokuApi } from '../services/api';

export default function ProfileView({ user, onUserUpdate, onShowToast }) {
  const [tab, setTab] = useState('login'); // 'login' or 'registro'
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Estados de opciones desplegables
  const [abrirActualizarNombre, setAbrirActualizarNombre] = useState(false);
  const [abrirAgregarAvatar, setAbrirAgregarAvatar] = useState(false);

  const [editNombre, setEditNombre] = useState(user?.name || '');
  const [editAvatar, setEditAvatar] = useState('');
  const [guardando, setGuardando] = useState(false);

  const token = localStorage.getItem('kiroku_token');
  const isLoggedIn = !!token;

  // Handle Login / Register
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (tab === 'login') {
        const res = await kirokuApi.login(email.trim(), password);
        if (res?.token) {
          localStorage.setItem('kiroku_token', res.token);
          const u = res.usuario || {};
          onUserUpdate({
            id: u._id,
            name: u.nombre || email.split('@')[0],
            initials: (u.nombre || email).substring(0, 2).toUpperCase(),
            rol: u.rol || 'STD',
            email: u.email || email,
            avatar: u.avatar || '',
          });
          if (onShowToast) onShowToast(`¡Bienvenido de vuelta, ${u.nombre || 'usuario'}!`);
        }
      } else {
        await kirokuApi.registro(nombre.trim(), email.trim(), password);
        if (onShowToast) onShowToast('¡Usuario registrado! Ya podés iniciar sesión.');
        setTab('login');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error al conectar.');
    } finally {
      setLoading(false);
    }
  };

  // Guardar cambio de nombre
  const handleSaveNombre = async (e) => {
    e.preventDefault();
    if (!editNombre.trim()) return;
    setGuardando(true);
    try {
      await kirokuApi.actualizarMiPerfil({ nombre: editNombre.trim() });
      onUserUpdate({
        ...user,
        name: editNombre.trim(),
        initials: editNombre.substring(0, 2).toUpperCase(),
      });
      if (onShowToast) onShowToast('Nombre actualizado.');
      setAbrirActualizarNombre(false);
    } catch (err) {
      if (onShowToast) onShowToast(`Error: ${err.message}`);
    } finally {
      setGuardando(false);
    }
  };

  // Guardar avatar
  const handleSaveAvatar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await kirokuApi.actualizarMiPerfil({ avatar: editAvatar.trim() });
      onUserUpdate({
        ...user,
        avatar: editAvatar.trim(),
      });
      if (onShowToast) onShowToast('Avatar actualizado.');
      setAbrirAgregarAvatar(false);
    } catch (err) {
      if (onShowToast) onShowToast(`Error: ${err.message}`);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center py-6">
      <div className="w-full max-w-lg flex flex-col gap-6">
        {/* Header centrado */}
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Mi Perfil
          </h1>
        </div>

        {!isLoggedIn ? (
          /* LOGIN / REGISTRO CENTRADO */
          <div className="p-6 sm:p-8 rounded-3xl bg-[#121422] border border-[#21263d] flex flex-col gap-5 shadow-xl">
            <div className="flex items-center justify-center gap-6 border-b border-[#1b1f33] pb-3">
              <button
                onClick={() => { setTab('login'); setErrorMsg(''); }}
                className={`text-xs font-bold pb-2 transition-colors cursor-pointer ${
                  tab === 'login' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-slate-400 hover:text-white'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => { setTab('registro'); setErrorMsg(''); }}
                className={`text-xs font-bold pb-2 transition-colors cursor-pointer ${
                  tab === 'registro' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-slate-400 hover:text-white'
                }`}
              >
                Registrarse
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 flex items-center justify-center gap-2 text-xs text-rose-300 text-center">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleAuth} className="flex flex-col gap-4">
              {tab === 'registro' && (
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-xs font-semibold text-slate-300">Nombre</label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Tu nombre"
                    className="bg-[#090a10] border border-[#23273e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-semibold text-slate-300">Correo electrónico</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="bg-[#090a10] border border-[#23273e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-semibold text-slate-300">Contraseña</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-[#090a10] border border-[#23273e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors disabled:opacity-50 cursor-pointer shadow-md"
              >
                {loading ? 'Cargando...' : tab === 'login' ? 'Ingresar' : 'Crear Cuenta'}
              </button>
            </form>
          </div>
        ) : (
          /* USUARIO LOGUEADO CENTRADO */
          <div className="flex flex-col gap-6">
            {/* Tarjeta de perfil centrada y equilibrada */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#121422] border border-[#21263d] flex flex-col items-center text-center shadow-xl relative">
              {/* Badge Admin discreto en la esquina superior derecha */}
              {user?.rol === 'ADMIN' && (
                <div className="absolute top-5 right-5">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-400 border border-amber-400/40">
                    Admin
                  </span>
                </div>
              )}

              {/* Avatar centrado */}
              <div className="w-20 h-20 rounded-full bg-purple-900/80 border-2 border-purple-500/40 flex items-center justify-center text-xl font-bold text-purple-200 overflow-hidden shadow-lg">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user?.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <span>{user?.initials || 'U'}</span>
                )}
              </div>

              {/* Nombre y correo centrados */}
              <div className="mt-4">
                <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                <p className="text-xs text-slate-400 mt-1">{user?.email}</p>
              </div>
            </div>

            {/* Sección de Opciones */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold text-slate-400 text-center">Opciones de Cuenta</span>

              {/* Opción 1: Actualizar Perfil (Nombre) */}
              <div className="rounded-2xl bg-[#121422] border border-[#21263d] overflow-hidden transition-all shadow-md">
                <button
                  type="button"
                  onClick={() => {
                    setAbrirActualizarNombre(prev => !prev);
                    setAbrirAgregarAvatar(false);
                  }}
                  className="w-full p-4 flex items-center justify-between text-left text-xs font-semibold text-slate-200 hover:bg-[#181a2b] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-purple-400" />
                    <span>Actualizar perfil</span>
                  </div>
                  {abrirActualizarNombre ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {abrirActualizarNombre && (
                  <form onSubmit={handleSaveNombre} className="p-4 pt-0 border-t border-[#1b1f33] flex flex-col gap-3 mt-3">
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[11px] text-slate-400">Nuevo nombre</label>
                      <input
                        type="text"
                        required
                        value={editNombre}
                        onChange={(e) => setEditNombre(e.target.value)}
                        placeholder="Ingresa tu nuevo nombre"
                        className="bg-[#090a10] border border-[#23273e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setAbrirActualizarNombre(false)}
                        className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={guardando}
                        className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold cursor-pointer"
                      >
                        {guardando ? 'Guardando...' : 'Guardar'}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Opción 2: Agregar Avatar */}
              <div className="rounded-2xl bg-[#121422] border border-[#21263d] overflow-hidden transition-all shadow-md">
                <button
                  type="button"
                  onClick={() => {
                    setAbrirAgregarAvatar(prev => !prev);
                    setAbrirActualizarNombre(false);
                  }}
                  className="w-full p-4 flex items-center justify-between text-left text-xs font-semibold text-slate-200 hover:bg-[#181a2b] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Image className="w-4 h-4 text-purple-400" />
                    <span>Agregar avatar</span>
                  </div>
                  {abrirAgregarAvatar ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {abrirAgregarAvatar && (
                  <form onSubmit={handleSaveAvatar} className="p-4 pt-0 border-t border-[#1b1f33] flex flex-col gap-3 mt-3">
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[11px] text-slate-400">URL de la imagen</label>
                      <input
                        type="url"
                        required
                        value={editAvatar}
                        onChange={(e) => setEditAvatar(e.target.value)}
                        placeholder="https://ejemplo.com/avatar.jpg"
                        className="bg-[#090a10] border border-[#23273e] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setAbrirAgregarAvatar(false)}
                        className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={guardando}
                        className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold cursor-pointer"
                      >
                        {guardando ? 'Guardando...' : 'Guardar Avatar'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
