// URL base configurable mediante variable de entorno con fallback directo a Render
export const API_BASE = import.meta.env.VITE_API_URL || 'https://backend-grupo-lotus.onrender.com/api';

/**
 * Helper centralizado para solicitudes HTTP a la API REST de Kiroku
 */
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('kiroku_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    // 204 No Content (DELETE exitoso)
    if (res.status === 204) return null;

    // Manejo de expiración o token inválido
    if (res.status === 401) {
      localStorage.removeItem('kiroku_token');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg = data?.mensaje || data?.error || data?.message || `Error HTTP ${res.status}`;
      const err = new Error(errorMsg);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  } catch (err) {
    console.warn(`[Kiroku API] Error en ${endpoint}:`, err.message);
    throw err;
  }
}

// ==========================================
// SERVICIO DE GÉNEROS (Catálogo administrable)
// ==========================================
export const generosService = {
  // GET /api/generos (Público) -> { total, generos: [{ _id, nombre, ... }] }
  obtenerGeneros: () => apiRequest('/generos'),

  // POST /api/generos (ADMIN) -> { mensaje, genero }
  crearGenero: (nombre, token = null) =>
    apiRequest('/generos', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify({ nombre: nombre.trim() }),
    }),

  // PUT /api/generos/:id (ADMIN) -> { mensaje, genero }
  actualizarGenero: (id, nombre, token = null) =>
    apiRequest(`/generos/${id}`, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify({ nombre: nombre.trim() }),
    }),

  // DELETE /api/generos/:id (ADMIN) -> 204 No Content
  eliminarGenero: (id, token = null) =>
    apiRequest(`/generos/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),
};

export const kirokuApi = {
  // --- GÉNEROS ---
  ...generosService,

  // --- AUTENTICACIÓN Y USUARIOS (Integrante 1) ---
  login: (email, password) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  registro: (nombre, email, password, avatar = '') =>
    apiRequest('/auth/registro', {
      method: 'POST',
      body: JSON.stringify({ nombre, email, password, avatar }),
    }),

  getMiPerfil: () => apiRequest('/usuarios/me'),

  actualizarMiPerfil: (data) =>
    apiRequest('/usuarios/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getUsuarios: () => apiRequest('/usuarios'),

  cambiarRolUsuario: (id, rol) =>
    apiRequest(`/usuarios/${id}/rol`, {
      method: 'PATCH',
      body: JSON.stringify({ rol }),
    }),

  eliminarUsuario: (id) =>
    apiRequest(`/usuarios/${id}`, {
      method: 'DELETE',
    }),

  // --- CATÁLOGO DE ANIMES (Integrante 2) ---
  getAnimes: (params = '') => apiRequest(`/animes${params ? `?${params}` : ''}`),

  getAnimeById: (id) => apiRequest(`/animes/${id}`),

  crearAnime: (animeData) =>
    apiRequest('/animes', {
      method: 'POST',
      body: JSON.stringify({
        ...animeData,
        generos: Array.isArray(animeData.generos) ? animeData.generos : [animeData.generos]
      }),
    }),

  actualizarAnime: (id, animeData) =>
    apiRequest(`/animes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(animeData),
    }),

  // PATCH /api/animes/:id/generos (ADMIN) -> Agregar géneros sin pisar los que ya tiene
  agregarGenerosAnime: (id, generos) =>
    apiRequest(`/animes/${id}/generos`, {
      method: 'PATCH',
      body: JSON.stringify({ generos }),
    }),

  eliminarAnime: (id) =>
    apiRequest(`/animes/${id}`, {
      method: 'DELETE',
    }),

  importarExterno: (queryOrMalId) =>
    apiRequest('/animes/importar-externo', {
      method: 'POST',
      body: JSON.stringify(
        typeof queryOrMalId === 'number' || /^\d+$/.test(String(queryOrMalId).trim())
          ? { malId: Number(queryOrMalId) }
          : { busqueda: String(queryOrMalId).trim() }
      ),
    }),

  // --- SEGUIMIENTOS Y BIBLIOTECA (Integrante 3) ---
  getSeguimientos: (estado = '') =>
    apiRequest(`/seguimientos${estado && estado !== 'Todos' ? `?estado=${estado}` : ''}`),

  crearSeguimiento: (anime_id, estado = 'Pendiente', episodioActual = 0) =>
    apiRequest('/seguimientos', {
      method: 'POST',
      body: JSON.stringify({ anime_id, estado, episodioActual }),
    }),

  actualizarSeguimiento: (id, data) =>
    apiRequest(`/seguimientos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  incrementarEpisodio: (id) =>
    apiRequest(`/seguimientos/${id}/incrementar`, {
      method: 'PATCH',
    }),

  eliminarSeguimiento: (id) =>
    apiRequest(`/seguimientos/${id}`, {
      method: 'DELETE',
    }),

  // --- RESEÑAS COMUNITARIAS (Integrante 3) ---
  getResenasPorAnime: (animeId) => apiRequest(`/resenas/anime/${animeId}`),

  crearResena: (data) =>
    apiRequest('/resenas', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  actualizarResena: (id, data) =>
    apiRequest(`/resenas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  eliminarResena: (id) =>
    apiRequest(`/resenas/${id}`, {
      method: 'DELETE',
    }),

  // --- ESTADÍSTICAS Y ANALÍTICA (Integrante 3) ---
  getRankings: () => apiRequest('/stats/rankings'),

  getEstadisticasPersonales: () => apiRequest('/usuarios/me/estadisticas'),
};
