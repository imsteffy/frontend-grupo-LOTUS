# Historial Completo de Conversación y Desarrollo — Frontend Kiroku

**Fecha:** 26 y 27 de Octubre, 2026  
**Proyecto:** Kiroku — Plataforma Full-Stack de Seguimiento y Reseñas de Anime  
**Cátedra:** Programación III (Comisión 3-601 TM) — INSPT  
**Profesor:** Carlos E. Cimino  
**Grupo:** LOTUS  
**Repositorios:**
* Frontend: `C:\Users\Steff\Desktop\frontend-grupo-LOTUS` → [GitHub](https://github.com/imsteffy/frontend-grupo-LOTUS)
* Backend: `C:\Users\Steff\Desktop\backend-grupo-LOTUS` → [GitHub](https://github.com/imsteffy/backend-grupo-LOTUS)
* API en Vivo: `https://backend-grupo-lotus.onrender.com/api`
* Base de Datos: MongoDB Atlas (`kiroku_db`)

---

## 📑 Índice de Etapas y Decisiones del Chat

1. [Análisis Inicial y Estado de los Repositorios](#1-análisis-inicial-y-estado-de-los-repositorios)
2. [Creación del Frontend desde Cero (React 18 + Vite + Tailwind CSS)](#2-creación-del-frontend-desde-cero)
3. [Auditoría del Backend y Corrección de Discrepancias](#3-auditoría-del-backend-y-corrección-de-discrepancias)
4. [Simplificación del Frontend: Foco 100% en Endpoints](#4-simplificación-del-frontend-foco-100-en-endpoints)
5. [Incorporación del Catálogo de Géneros y Commits de Main](#5-incorporación-del-catálogo-de-géneros-y-commits-de-main)
6. [Nuevo Endpoint Detectado: PATCH /animes/:id/generos](#6-nuevo-endpoint-detectado-patch-animesidgeneros)
7. [Limpieza Visual: Rutas Técnicas y Etiquetas Eliminadas](#7-limpieza-visual-rutas-técnicas-y-etiquetas-eliminadas)
8. [Barra Lateral Fija, Botón Cerrar Sesión y Menú Responsive](#8-barra-lateral-fija-botón-cerrar-sesión-y-menú-responsive)
9. [Rediseño Centrado de "Mi Perfil" y Opciones Desplegables](#9-rediseño-centrado-de-mi-perfil-y-opciones-desplegables)
10. [Integración del Logo Oficial y Cabecera Dinámica](#10-integración-del-logo-oficial-y-cabecera-dinámica)
11. [Conexión con el Celular y Solución de Red](#11-conexión-con-el-celular-y-solución-de-red)
12. [Persistencia del Estado "En Biblioteca" al Refrescar (F5)](#12-persistencia-del-estado-en-biblioteca-al-refrescar-f5)
13. [Solución del Error 404 en Netlify y Pantalla con GIF de Sasuke](#13-solución-del-error-404-en-netlify-y-pantalla-con-gif-de-sasuke)
14. [Auditoría del Dashboard: Podio Estable y Métricas Reales](#14-auditoría-del-dashboard-podio-estable-y-métricas-reales)
15. [Reseñas de Administrador en Dorado y Sincronización del Avatar](#15-reseñas-de-administrador-en-dorado-y-sincronización-del-avatar)
16. [Resolución de Pausa en Netlify y Migración a Vercel](#16-resolución-de-pausa-en-netlify-y-migración-a-vercel)
17. [Corrección del Panel de Administración (Listado de Usuarios)](#17-corrección-del-panel-de-administración-listado-de-usuarios)
18. [Rediseño Editorial y Minimalista del Panel Admin](#18-rediseño-editorial-y-minimalista-del-panel-admin)
19. [Checklist Completo para la Defensa Oral](#19-checklist-completo-para-la-defensa-oral)

---

## 1. Análisis Inicial y Estado de los Repositorios

* Se revisó la imagen de referencia `Sin título.png` que mostraba una propuesta de dashboard moderno oscuro para **Kiroku**.
* Se consultó el estado del backend (`backend-grupo-LOTUS`) donde se habían testeado autenticación y creación de animes, quedando pendiente la sincronización completa.
* El frontend estaba vacío (solo `README.md` y `PROPUESTA.md`).

---

## 2. Creación del Frontend desde Cero

Se configuró el entorno en `frontend-grupo-LOTUS`:
* **Vite 6 + React 18 + Tailwind CSS 3.4 + Lucide React**.
* Configuración de servidor en `vite.config.js` con soporte para conexión en red local (`host: true`) y proxy a `http://localhost:3000`.
* Configuración de colores en `tailwind.config.js` (`#090a10`, `#121422`, `#7c3aed`, `#a3e635`).
* Creación de `src/services/api.js` centralizado.

---

## 3. Auditoría del Backend y Corrección de Discrepancias

Al auditar los 4 modelos de Mongoose y los controladores en `backend-grupo-LOTUS`:
1. **Roles en `Usuario.js`:** El backend usa `'STD'` y `'ADMIN'` (no `'USER'`). Se adaptó en todo el cliente.
2. **Campos en `Seguimiento.js`:** Espera `{ anime_id, estado, episodioActual }` (no `animeId` ni `episodiosVistos`).
3. **Puntuación en `Resena.js`:** La calificación (1 a 10) pertenece a la reseña, y el campo booleano se llama `spoiler` (no `tieneSpoilers`).
4. **Fórmula de Analítica:** En `stats.controller.js` se constató la fórmula real: `horasVistas = (episodiosVistos * 24 min) / 60`.

---

## 4. Simplificación del Frontend: Foco 100% en Endpoints

A petición expresa de eliminar elementos artificiales y centrarse en lo requerido por el backend:
* **Se eliminaron:** Mocks hardcodeados, tarjetas promocionales ("Un episodio más"), widgets de racha ("5 días de racha"), tags ficticios ("Para ti"), calendarios de emisión japonesa estáticos y sección separada de "Favoritos".
* **Se consolidaron las 5 vistas funcionales:**
  1. `DashboardView.jsx` (`/api/stats/rankings` y `/api/usuarios/me/estadisticas`).
  2. `CatalogView.jsx` (`/api/animes` con filtros `buscar`, `genero`, `estado`, `anio`, `orden` y paginación).
  3. `LibraryView.jsx` (`/api/seguimientos` con avance `+1 Cap` y autocompletado).
  4. `ReviewsView.jsx` (`/api/resenas` con calificaciones, spoilers y edición/borrado).
  5. `ProfileView.jsx` (`/api/auth/login`, `/api/auth/registro` y `/api/usuarios/me`).
  6. `AdminView.jsx` (Gestión exclusiva de Admin para animes, géneros y usuarios).

---

## 5. Incorporación del Catálogo de Géneros y Commits de Main

* Se hizo `git pull origin main` en `backend-grupo-LOTUS` incorporando:
  * `src/models/Genero.js`
  * `src/routes/generos.routes.js`
  * `src/controllers/genero.controller.js`
  * `src/seedGeneros.js`
* Se ejecutó `node src/seedGeneros.js` poblando **21 géneros reales** en MongoDB Atlas.
* En el frontend se implementó `generosService` en `api.js` y se cargó el `<select>` dinámico en el catálogo con `encodeURIComponent`.
* En `AdminView` se añadió la pestaña de administración de géneros (crear, renombrar y eliminar con control de error 409).
* En el formulario de animes se reemplazó el texto libre por un **selector múltiple de géneros obligatorio**.

---

## 6. Nuevo Endpoint Detectado: PATCH /animes/:id/generos

* Se detectó el commit `00077de` en el backend: `PATCH /api/animes/:id/generos`.
* Permite al Administrador sumar géneros a un anime existente sin reemplazar los previos ni duplicar (`$addToSet`).
* Se añadió la función en `api.js` y el botón **`+Género`** en la tabla de administración.

---

## 7. Limpieza Visual: Rutas Técnicas y Etiquetas Eliminadas

* Se eliminaron todas las etiquetas `/api/animes`, `GET`, `POST`, `(?genero=)` de los títulos, botones y modales.
* La interfaz quedó con textos directos y naturales en español.

---

## 8. Barra Lateral Fija, Botón Cerrar Sesión y Menú Responsive

* **Fijación al Viewport:** Se aplicó `h-screen sticky top-0` a la barra lateral con scroll independiente (`overflow-y-auto`).
* **Botón Cerrar Sesión Fijo:** El botón permanece siempre visible en la esquina inferior izquierda sin importar cuánto scroll se haga en el contenido principal.
* **Responsive en móviles:** En pantallas pequeñas, el menú lateral actúa como un *drawer flotante* con fondo oscuro desenfocado y se cierra automáticamente al seleccionar un panel o pulsar la `✕`.

---

## 9. Rediseño Centrado de "Mi Perfil" y Opciones Desplegables

* Se centró todo el contenedor horizontalmente (`max-w-lg mx-auto`).
* Se ocultó el rol para usuarios normales; solo aparece un badge `Admin` en la esquina superior derecha si el usuario tiene rol de administrador.
* Se estructuraron las opciones en acordeones desplegables:
  * **Actualizar perfil** (nombre).
  * **Agregar / Cambiar avatar** (URL de imagen).

---

## 10. Integración del Logo Oficial y Cabecera Dinámica

* Se copió `KIROKU_LOGO_png.png` a `/public/kiroku_logo.png` y se configuró como favicon.
* **Comportamiento dinámico en Navbar:**
  * Al desplegar la barra lateral, el logo en el header se oculta.
  * Al cerrar/ocultar la barra lateral, el logo y la palabra **kiroku** reaparecen en la barra superior.
  * Al hacer clic en el logo/nombre, redirige siempre a la página principal del catálogo.
  * Se eliminó el texto redundante `/ Catálogo de Animes` del header.

---

## 11. Conexión con el Celular y Solución de Red

* Se habilitó `server.host: true` en `vite.config.js`.
* Se diagnosticó que el celular del usuario no cargaba debido al uso de DNS Privado / VPN en el móvil y la red configurada como "Pública" en Windows.

---

## 12. Persistencia del Estado "En Biblioteca" al Refrescar (F5)

* **Diagnóstico:** El catálogo y el modal tenían estados locales desconectados y la llamada de red al recargar tardaba en responder.
* **Solución:** Se centralizó el mapa de biblioteca en `App.jsx`, se sincronizó de forma instantánea en `localStorage` (`kiroku_library_ids`) y se revalida en segundo plano con `GET /api/seguimientos`.
* Al pulsar `F5`, el botón arranca en el milisegundo 0 como **`✓ En biblioteca` (verde lima)**.

---

## 13. Solución del Error 404 en Netlify y Pantalla con GIF de Sasuke

* Se configuraron `vercel.json` y `netlify.toml` con la regla de redirección SPA `/* -> /index.html 200`.
* Se programó un router del lado del cliente que detecta si la ruta ingresada es inválida (ej: `/puo`).
* Si la ruta no existe, renderiza `NotFoundView.jsx` con el GIF animado de **Sasuke bailando** (*passinho jamal*) y un botón para volver al catálogo.

---

## 14. Auditoría del Dashboard: Podio Estable y Métricas Reales

* **Diagnóstico del Podio cambiante:** En MongoDB Atlas, 6 animes empatan con exactamente 1 seguidor. Sin un criterio secundario de desempate, la agregación `$sort: { seguidores: -1 }` devolvía los documentos en orden arbitrario.
* **Solución:** Se implementó un desempate estable por título (A-Z), dejando el podio ordenado y firme.
* Se corrigió el bug del campo `seguidores` devuelto por el backend.

---

## 15. Reseñas de Administrador en Dorado y Sincronización del Avatar

* Se actualizó `backend-grupo-LOTUS/src/controllers/resena.controller.js` agregando el campo `rol` en `.populate('usuario_id', 'nombre avatar rol')`.
* En el frontend (`ReviewsView.jsx` y modal de ficha técnica):
  * Las reseñas de Administrador se destacan con **borde dorado `border-2 border-amber-400`**, fondo degradado ámbar y badge **`👑 Admin`**.
* El avatar cargado por el usuario se guarda en Atlas (`PUT /api/usuarios/me`), se sincroniza en `localStorage` y se muestra en:
  1. El círculo principal de Mi Perfil.
  2. La esquina superior derecha de la cabecera (Navbar).
  3. Cada reseña comunitaria al lado del nombre del autor.

---

## 16. Resolución de Pausa en Netlify y Migración a Vercel

* Netlify pausó los despliegues automáticos por haber alcanzado el límite mensual de minutos gratuitos (*operational credits*).
* Se recomendó el despliegue en **Vercel** (`vercel.com`), que es gratuito, más rápido y ya cuenta con `vercel.json` listo en el repositorio.

---

## 17. Corrección del Panel de Administración (Listado de Usuarios)

* **Diagnóstico:** Al presionar la pestaña *"Usuarios"*, aparecía vacía porque el backend en `GET /api/usuarios` responde `{ usuarios: [...] }` (un objeto), y el frontend evaluaba `if (Array.isArray(res))`.
* **Solución:** Se corrigió para extraer `res.usuarios`.
* Se confirmaron y listaron los **9 usuarios reales de Atlas** (*Jesu Test, Administrador, Usuario Normal, Steff, maxi, jesu, ElMasiPlay, Test Check, xd*) con sus botones de cambiar rol (`STD` ↔ `ADMIN`) y eliminar.

---

## 18. Rediseño Editorial y Minimalista del Panel Admin

* Se aplicó la filosofía de **Frontend Design (Anthropic / Claude)**:
  * Tono *Dark Studio / Editorial*: Carbón profundo (`#090a10`), superficies `#11131f` y divisores `#1e2338`.
  * Se eliminaron los recuadros artificiales sobre los labels.
  * Pestañas tipo *Segmented Control* integradas.
  * Tablas con espaciado amplio, efecto hover suave y controles de acción organizados.
  * Métricas superiores de usuarios limpias (Total: 9, Admin: 5, Estándar: 4).

---

## 19. Checklist Completo para la Defensa Oral

### 👤 Integrante 1 (Auth & Usuarios)
- [x] Registro de usuario (`POST /api/auth/registro`).
- [x] Login con JWT almacenado en `localStorage` (`POST /api/auth/login`).
- [x] Consulta y edición de perfil (`GET` y `PUT /api/usuarios/me`).
- [x] Gestión de usuarios exclusiva de Admin (`GET /api/usuarios`).
- [x] Cambio de rol STD/ADMIN (`PATCH /api/usuarios/:id/rol`).
- [x] Eliminación de usuario (`DELETE /api/usuarios/:id`).
- [x] Cierre de sesión seguro.

### 👤 Integrante 2 (Catálogo Oficial & Géneros)
- [x] Listado de animes con buscador y filtros combinados (`GET /api/animes`).
- [x] Paginación de catálogo en MongoDB.
- [x] Ficha técnica con sinopsis, metadatos y chips de géneros (`GET /api/animes/:id`).
- [x] Alta manual de anime con multiselect obligatorio de géneros (`POST /api/animes`).
- [x] Modificación completa de anime (`PUT /api/animes/:id`).
- [x] Anexar géneros sin pisar existentes (`PATCH /api/animes/:id/generos`).
- [x] Eliminación definitiva de anime (`DELETE /api/animes/:id`).
- [x] Ingesta asistida desde MyAnimeList/Jikan (`POST /api/animes/importar-externo`).
- [x] CRUD completo de la colección de Géneros (`/api/generos`).

### 👤 Integrante 3 (Biblioteca, Reseñas & Analítica)
- [x] Biblioteca personal por estados: Todos, Viendo, Completado, etc. (`GET /api/seguimientos`).
- [x] Añadir anime a biblioteca (`POST /api/seguimientos`).
- [x] Avance de capítulos con autocompletado (`PATCH /api/seguimientos/:id/incrementar`).
- [x] Modificación de estado y eliminación de biblioteca.
- [x] Reseñas con calificación 1-10 y spoiler flag (`POST /api/resenas`).
- [x] Edición de reseña propia (`PUT /api/resenas/:id`).
- [x] Eliminación / moderación de reseña (`DELETE /api/resenas/:id`).
- [x] Dashboard analítico personal (`GET /api/usuarios/me/estadisticas`).
- [x] Rankings comunitarios Top 10 mejor puntuados y más seguidos (`GET /api/stats/rankings`).
