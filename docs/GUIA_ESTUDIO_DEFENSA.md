# 📚 Guía de Estudio y Defensa Técnica — Kiroku Frontend

> **Cátedra:** Programación III — INSPT  
> **Comisión:** 3-601 TM | **Grupo:** LOTUS  
> **Proyecto:** Kiroku (記録) — Plataforma de Seguimiento y Reseñas de Anime  
> **Repositorio Frontend:** [imsteffy/frontend-grupo-LOTUS](https://github.com/imsteffy/frontend-grupo-LOTUS)  
> **Frontend Desplegado en Vercel:** [https://frontend-grupo-lotus.vercel.app](https://frontend-grupo-lotus.vercel.app)  
> **API REST Desplegada en Render:** `https://backend-grupo-lotus.onrender.com/api`

---

## 📑 Índice de Contenidos
1. [Resumen Ejecutivo y Contexto del Proyecto](#1-resumen-ejecutivo-y-contexto-del-proyecto)
2. [Arquitectura del Sistema: Frontend Desacoplado y API REST](#2-arquitectura-del-sistema-frontend-desacoplado-y-api-rest)
3. [Stack Tecnológico y Justificación Técnica de Decisiones](#3-stack-tecnológico-y-justificación-técnica-de-decisiones)
4. [Estructura del Proyecto y División de Responsabilidades](#4-estructura-del-proyecto-y-división-de-responsabilidades)
5. [Autenticación Stateless, JWT y Control de Acceso (RBAC)](#5-autenticación-stateless-jwt-y-control-de-acceso-rbac)
6. [Gestión de Estado, Ciclo de Vida y Hooks de React](#6-gestión-de-estado-ciclo-de-vida-y-hooks-de-react)
7. [Capa de Comunicación HTTP y Consumo de Endpoints](#7-capa-de-comunicación-http-y-consumo-de-endpoints)
8. [Integración con MongoDB: Pipelines de Agregación y Analítica](#8-integración-con-mongodb-pipelines-de-agregación-y-analítica)
9. [Bugs Críticos Identificados y Resueltos en el Frontend](#9-bugs-críticos-identificados-y-resueltos-en-el-frontend)
10. [Preguntas Frecuentes y Respuestas Clave para la Defensa Técnica](#10-preguntas-frecuentes-y-respuestas-clave-para-la-defensa-técnica)

---

## 1. Resumen Ejecutivo y Contexto del Proyecto

### ¿Qué es Kiroku?
**Kiroku** (*del japonés 記録: registro o memoria*) es una **Single Page Application (SPA)** interactiva construida con **React 18, Vite y Tailwind CSS**. Permite a los amantes del anime explorar un catálogo oficial, llevar el seguimiento capítulo a capítulo de su biblioteca personal, redactar reseñas comunitarias con advertencia de spoilers y visualizar métricas analíticas avanzadas calculadas en MongoDB.

### Problemática Resuelta
Los seguidores de series de anime consumen contenido en diversas plataformas y suelen perder la cuenta del último capítulo visto, las series que tienen pendientes o las opiniones confiables de la comunidad. Kiroku centraliza esta experiencia brindando una interfaz rápida, intuitiva y responsive, consumiendo una API REST independiente.

---

## 2. Arquitectura del Sistema: Frontend Desacoplado y API REST

El proyecto aplica una **arquitectura cliente-servidor desacoplada** (*decoupled architecture*):

```
+-------------------------------------------------------------+
|                  CLIENTE: FRONTEND (SPA)                    |
|  React 18 + Vite + Tailwind CSS (Desplegado en Netlify/Vercel)
|  - Renderizado del lado del cliente (CSR)                   |
|  - Estado en memoria + sincronización localStorage         |
|  - Enrutamiento con History API                             |
+-------------------------------------------------------------+
                              |
                     Peticiones HTTP (JSON)
                 Authorization: Bearer <JWT>
                              |
                              v
+-------------------------------------------------------------+
|                  SERVIDOR: BACKEND (API REST)               |
|  Node.js + Express (Desplegado en Render)                   |
|  - Rutas RESTful (/api/animes, /api/seguimientos, etc.)     |
|  - Middlewares de Autenticación y Autorización (RBAC)        |
|  - Mongoose ODM & Base de Datos MongoDB Atlas               |
+-------------------------------------------------------------+
```

### Ventajas de una Arquitectura Desacoplada:
1. **Separación de incumbencias (SoC - Separation of Concerns):** El frontend solo se preocupa de la interfaz, reactividad y experiencia de usuario; el backend se encarga de la lógica de negocio, reglas de persistencia, integridad de datos y seguridad.
2. **Independencia de despliegue:** Se pueden actualizar y desplegar versiones nuevas del frontend (en Vercel/Netlify) sin tocar el backend (en Render), y viceversa.
3. **Escalabilidad y reutilización:** La misma API REST podría alimentar en el futuro una app móvil (React Native/Flutter) o extensiones de navegador sin cambiar una sola línea de lógica en el servidor.
4. **Stateless Backend:** El backend no mantiene sesiones en memoria ni en disco (`req.session`); cada petición es autocontenida mediante un token **JWT**.

---

## 3. Stack Tecnológico y Justificación Técnica de Decisiones

| Tecnología | Rol | Justificación Técnica ante la Cátedra |
| :--- | :--- | :--- |
| **React 18** | Biblioteca UI | Paradigma declarativo, Virtual DOM para renders eficientes con reconciliación por diffing, arquitectura de componentes reutilizables y hooks nativos (`useState`, `useEffect`). |
| **Vite** | Bundler & Dev Server | Reemplaza a Create React App (CRA). Utiliza **esbuild** (escrito en Go) para pre-bundling en milisegundos, aprovecha los módulos ESM nativos del navegador, y provee **Hot Module Replacement (HMR)** ultrarrápido. |
| **Tailwind CSS 3** | Motor de Estilos | Framework utilitario (*utility-first*). Gracias a su motor JIT (*Just-In-Time*), genera únicamente el CSS que se utiliza en el proyecto, evitando hojas de estilo gigantescas. Garantiza diseño responsive mediante prefijos (`sm:`, `md:`, `lg:`) y paleta cinematográfica dark-mode consistente. |
| **Lucide React** | Iconografía | Iconos SVG optimizados y basados en árbol de dependencias (*tree-shakable*), manteniendo el peso del bundle mínimo. |
| **Fetch API nativo** | Cliente HTTP | Evita la inclusión de librerías externas pesadas (como Axios). Se encapsuló en un helper centralizado `apiRequest` que inyecta automáticamente el token JWT y maneja errores HTTP y 401. |

---

## 4. Estructura del Proyecto y División de Responsabilidades

El proyecto se diseñó modularmente reflejando la división por módulos de la cátedra:

```text
src/
├── components/
│   └── layout/
│       ├── Navbar.jsx          # Cabecera responsive, logo y avatar interactivo
│       ├── Sidebar.jsx         # Menú lateral colapsable, drawer móvil y logout
│       └── Footer.jsx          # Pie de página institucional y enlaces
├── views/
│   ├── CatalogView.jsx         # [Módulo 2] Catálogo general, paginado, búsqueda y filtros
│   ├── LibraryView.jsx         # [Módulo 3] Biblioteca personal por pestañas y +1 Cap
│   ├── ReviewsView.jsx         # [Módulo 3] CRUD de reseñas comunitarias y moderación
│   ├── DashboardView.jsx       # [Módulo 3] Métricas personales y rankings comunitarios
│   ├── ProfileView.jsx         # [Módulo 1] Login, registro y edición de perfil/avatar
│   ├── AdminView.jsx           # [Módulos 1 y 2] Consola administrativa (animes, géneros, usuarios)
│   └── NotFoundView.jsx        # Vista 404 personalizada para rutas inválidas
├── services/
│   └── api.js                  # Capa de consumo HTTP centralizada con JWT
├── App.jsx                     # Componente raíz, orquestador de estado global y routing
├── main.jsx                    # Punto de entrada y montaje en el DOM
└── index.css                   # Directivas Tailwind y estilos de scrollbar
```

---

## 5. Autenticación Stateless, JWT y Control de Acceso (RBAC)

### ¿Cómo funciona la Autenticación con JWT en Kiroku?
1. **Inicio de Sesión:** El usuario envía su email y contraseña a `POST /api/auth/login`.
2. **Generación del Token:** El servidor verifica el hash de la contraseña (bcrypt) y emite un token firmado:
   - **Header:** Algoritmo de firma (`HS256`).
   - **Payload:** Datos públicos del usuario (`_id`, `email`, `rol`).
   - **Signature:** Firma con la clave secreta del backend (`JWT_SECRET`).
3. **Persistencia en el Cliente:** El frontend recibe el token y lo guarda en `localStorage.setItem('kiroku_token', token)`.
4. **Peticiones Autenticadas:** Cada vez que el frontend hace una petición protegida, el helper `apiRequest` añade la cabecera:
   ```http
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
5. **Cierre de Sesión:** Es puramente del lado del cliente: se borra el token de `localStorage` y se resetea el estado de React. No requiere petición al servidor porque el backend no guarda estado de sesión.

### Control de Acceso Basado en Roles (RBAC)
Existen dos roles en el sistema:
- **STD (Estándar):** Puede navegar el catálogo, agregar animes a su biblioteca personal, registrar capítulos vistos, redactar una reseña por título y editar o eliminar sus propias reseñas.
- **ADMIN (Administrador):** Posee todos los permisos de STD y además:
  - Consola de gestión exclusiva en `/admin`.
  - Crear, editar, parchear géneros y eliminar animes del catálogo oficial.
  - Importar animes automáticamente desde la API externa de MyAnimeList/Jikan.
  - Crear, renombrar y eliminar géneros oficiales de la taxonomía.
  - Listar usuarios, ascender/degradar roles (`STD` ↔ `ADMIN`) y eliminar cuentas.
  - Moderar reseñas comunitarias (eliminar cualquier reseña inapropiada con badge dorado distintivo).

### Protección de Rutas (Client-Side Route Guard)
En `App.jsx`, la ruta `/admin` cuenta con validación estricta:
```jsx
{activeNav === 'admin' && (
  user?.rol === 'ADMIN' ? (
    <AdminView onShowToast={showToast} />
  ) : (
    <div className="card-403">
      <h2>Acceso Denegado (403)</h2>
      <p>Esta sección está reservada exclusivamente para administradores.</p>
    </div>
  )
)}
```
> **Nota de Defensa:** Aunque el cliente oculte o bloquee la vista, la seguridad real reside en los middlewares del backend (`verificarToken` y `esAdmin`). Si un usuario malintencionado intentara llamar directamente a `DELETE /api/usuarios/:id` mediante Postman o cURL sin un token ADMIN válido, el backend devolverá `403 Forbidden`.

---

## 6. Gestión de Estado, Ciclo de Vida y Hooks de React

### ¿Cómo maneja el estado la aplicación?
- **Elevación del Estado (*Lifting State Up*):** La información global (usuario logueado, mapa de animes en biblioteca `libraryMap`, mensaje de feedback `toastMessage` y anime seleccionado para el modal de detalle) reside en el componente raíz `App.jsx` y se transfiere hacia los hijos mediante *props*.
- **Estado Local (*Local State*):** Cada vista maneja sus formularios locales, filtros de búsqueda, estados de carga (`loading`) y visibilidad de acordeones mediante `useState`.
- **Caché en LocalStorage:** El mapa de IDs de la biblioteca (`kiroku_library_ids`) se cachea en `localStorage` para que los botones del catálogo muestren el estado "En biblioteca" de forma instantánea al recargar la página, sin esperar la respuesta de red.

### Hooks Utilizados
1. **`useState`:** Declaración de variables reactivas cuyo cambio dispara un re-renderizado controlado.
2. **`useEffect`:**
   - **Al montar el componente (`[]`):** Inicialización de la sesión (`getMiPerfil`), carga de biblioteca, escucha de cambios de tamaño de pantalla (`resize`) y del evento de sesión expirada (`auth:unauthorized`).
   - **Con dependencias (`[genero, estado, anio, orden]`):** Dispara automáticamente una nueva consulta filtrada a la API cuando el usuario modifica cualquier selector en el catálogo.
   - **Funciones de limpieza (*cleanup functions*):** Desuscripción obligatoria de `window.removeEventListener` para evitar fugas de memoria (*memory leaks*).

### Enrutamiento sin dependencias pesadas (SPA Router Casero)
En lugar de incorporar `react-router-dom` (lo que agregaría decenas de kilobytes al bundle final), se implementó un enrutador nativo y declarativo usando la **HTML5 History API**:
- `window.history.pushState(null, '', targetUrl)`: Cambia la URL en la barra de direcciones del navegador sin recargar la página.
- Evento `popstate`: Escucha los botones "Atrás" y "Adelante" del navegador para sincronizar el estado `currentPath`.
- Resolución de rutas mediante `resolvePathToNav(pathname)`: Mapea URLs como `/catalogo`, `/biblioteca`, `/resenas`, `/admin` a su componente correspondiente, cayendo en `NotFoundView (404)` ante rutas no reconocidas.

---

## 7. Capa de Comunicación HTTP y Consumo de Endpoints

### El Helper Centralizado `apiRequest`
En `src/services/api.js`:
- Inyecta `Content-Type: application/json`.
- Inyecta el header `Authorization: Bearer <token>` si existe un token en `localStorage`.
- Intercepta respuestas `204 No Content` (habituales en operaciones `DELETE`) retornando `null` de forma segura.
- Si recibe un código `401 Unauthorized`:
  - Limpia el token corrupto o expirado de `localStorage`.
  - Despacha el evento `auth:unauthorized` a nivel de ventana para que la interfaz cierre la sesión del usuario inmediatamente y muestre una notificación.
- Normaliza mensajes de error devueltos por el backend (`data?.mensaje || data?.error || data?.message`).

### Matriz de Verbos HTTP y Semántica REST

| Método HTTP | Endpoint | Acción Semántica | Código HTTP Esperado |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/animes?pagina=1&limite=10` | Consulta de lista paginada y filtrada | `200 OK` |
| **GET** | `/api/animes/:id` | Consulta de ficha técnica detallada | `200 OK` |
| **POST** | `/api/auth/login` | Envío de credenciales y generación de JWT | `200 OK` |
| **POST** | `/api/seguimientos` | Creación de nuevo registro en biblioteca | `201 Created` |
| **PUT** | `/api/animes/:id` | Actualización o reemplazo completo de anime | `200 OK` |
| **PUT** | `/api/usuarios/me` | Actualización de perfil propio (nombre / avatar) | `200 OK` |
| **PATCH** | `/api/seguimientos/:id/incrementar` | Actualización parcial: suma +1 capítulo y autocompleta | `200 OK` |
| **PATCH** | `/api/animes/:id/generos` | Actualización parcial: anexar géneros sin pisar existentes | `200 OK` |
| **PATCH** | `/api/usuarios/:id/rol` | Actualización parcial: cambio de rol STD/ADMIN | `200 OK` |
| **DELETE** | `/api/seguimientos/:id` | Eliminación de anime de la biblioteca personal | `204 No Content` |
| **DELETE** | `/api/generos/:id` | Baja de género (valida si hay animes asociados) | `204 No Content` o `409 Conflict` |

> **Diferencia Clave entre PUT y PATCH para la Defensa:**
> - `PUT` es **idempotente y reemplaza** la entidad completa con los datos provistos en el cuerpo.
> - `PATCH` realiza una **mutación parcial o específica** sobre uno o pocos atributos de la entidad (por ejemplo, incrementar en 1 el contador de episodios o cambiar únicamente el rol de un usuario), reduciendo el tráfico de red y evitando efectos colaterales de sobreescritura accidental.

---

## 8. Integración con MongoDB: Pipelines de Agregación y Analítica

En el `DashboardView`, el frontend consume dos endpoints analíticos calculados por MongoDB mediante el framework de agregación:

### 1. Estadísticas Personales (`GET /api/usuarios/me/estadisticas`)
- **Horas vistas:** Calculado dinámicamente con la fórmula:
  $$\text{Horas Vistas} = \frac{\text{episodiosVistos} \times 24}{60}$$
- **Géneros más vistos:** MongoDB ejecuta un pipeline con `$lookup` vinculando la colección de seguimientos con la colección de animes, aplica `$unwind` sobre el array de géneros y agrupa con `$sortByCount` para obtener el ranking personal de categorías más consumidas.

### 2. Rankings Comunitarios (`GET /api/stats/rankings`)
- **Top 10 Mejor Calificados:** Pipeline que promedia las calificaciones de la colección `resenas` por anime, desempata de manera determinista y devuelve los títulos con mayor valoración y total de reseñas.
- **Top 10 Más Seguidos:** Agrupa la colección `seguimientos` contando cuántos usuarios tienen guardado cada título.

---

## 9. Bugs Críticos Identificados y Resueltos en el Frontend

Durante la auditoría exhaustiva del repositorio se identificaron y subsanaron los siguientes problemas de integración:

### 1. Bug de Doble Codificación en Filtros de Géneros (`CatalogView.jsx`)
- **Problema:** En la construcción de la URL se ejecutaba:
  `params.append('genero', encodeURIComponent(genero));`
  Dado que `URLSearchParams` codifica automáticamente los valores al llamar a `.toString()`, los géneros con tildes o caracteres especiales (ej: "Acción", "Ciencia Ficción") terminaban codificados dos veces (`Acci%25C3%25B3n`). Al llegar al backend, la consulta fallaba y no devolvía ningún anime.
- **Solución:** Se removió el envoltorio innecesario, dejando `params.append('genero', genero)`.

### 2. Desincronización de Biblioteca y Catálogo al Eliminar (`LibraryView.jsx`)
- **Problema:** Cuando el usuario borraba un anime de su biblioteca desde `LibraryView`, se eliminaba en el servidor y de la lista visual, pero no se notificaba a `App.jsx`. Por ende, el mapa global `libraryMap` seguía creyendo que el anime estaba en biblioteca, y al volver al catálogo o modal el botón continuaba mostrando "En biblioteca" deshabilitado.
- **Solución:** Se pasó el prop `onLibraryChange={cargarBiblioteca}` a `LibraryView`, asegurando que tras cualquier eliminación se actualice el mapa global y `localStorage` inmediatamente.

### 3. Expiración Silenciosa de Token 401 sin Reacción en UI (`api.js` y `App.jsx`)
- **Problema:** La capa de API despachaba un evento custom `auth:unauthorized` ante respuestas 401, pero ningún componente lo estaba escuchando. El usuario quedaba en una interfaz visualmente logueada que fallaba en cada click.
- **Solución:** Se agregó un listener del evento en `App.jsx` que ejecuta `handleLogout()` y muestra un toast informando al usuario que su sesión expiró.

### 4. Vulnerabilidad de Vista y Falta de Route Guard en `/admin` (`App.jsx`)
- **Problema:** Si un usuario no administrador o un invitado tipeaba `/admin` en la barra de navegación, la aplicación renderizaba el panel de administración, disparando múltiples llamadas fallidas y exponiendo la estructura del panel.
- **Solución:** Se implementó una cláusula de guardia en `App.jsx` que verifica `user?.rol === 'ADMIN'`. Si no lo es, renderiza una tarjeta de Acceso Denegado (403) con opción de volver al catálogo.

### 5. Confusión de Permisos en Reseñas: Editar vs Moderar (`ReviewsView.jsx`)
- **Problema:** La variable `esMiResena` agrupaba tanto al autor como al admin (`autor._id === user?.id || user?.rol === 'ADMIN'`), mostrando el botón de edición a los administradores en reseñas de terceros. Al intentar guardar la edición, el backend rechazaba la petición con 403.
- **Solución:** Se separaron las responsabilidades: solo el autor original puede ver y ejecutar la **edición**, mientras que el administrador posee el permiso exclusivo de **moderación/eliminación**.

### 6. Desconexión entre Catálogo / Biblioteca y Reseñas
- **Problema:** Al consultar la ficha de un anime o tenerlo completado en la biblioteca, el usuario no tenía un camino directo para redactar su opinión; debía ir a la pestaña "Reseñas" y buscar el título manualmente en un selector desplegable.
- **Solución:** Se agregó un botón de enlace directo "Escribir reseña" en el modal de detalle y en la biblioteca personal que redirige automáticamente a la vista de reseñas con ese anime preseleccionado.

---

## 10. Preguntas Frecuentes y Respuestas Clave para la Defensa Técnica

### P1: ¿Por qué eligieron React en lugar de JavaScript Vanilla o un framework como Angular/Vue?
> **Respuesta modelo:** React ofrece el equilibrio ideal entre peso, flexibilidad y reactividad para una SPA de consumo de medios. Su paradigma declarativo permite describir cómo debe lucir la interfaz en base al estado, dejando que el **Virtual DOM** calcule eficientemente las mutaciones mínimas sobre el DOM real mediante su algoritmo de reconciliación (*diffing*). Además, el ecosistema de hooks nativos (`useState`, `useEffect`) permite desacoplar la lógica de estado de la presentación de forma limpia y reutilizable.

---

### P2: ¿Por qué la aplicación es una SPA y qué implicancias tiene el renderizado del lado del cliente (CSR)?
> **Respuesta modelo:** Kiroku es una Single Page Application porque solo carga un único documento HTML (`index.html`) provisto por Vite. A partir de allí, el motor de JavaScript en el navegador toma el control y renderiza dinámicamente cada vista modificando el árbol de nodos según las interacciones del usuario.  
> **Ventaja:** Navegación instantánea sin el parpadeo típico de la recarga completa de página del renderizado clásico del lado del servidor (SSR).  
> **Compromiso técnico:** El primer renderizado requiere descargar el bundle JS inicial; esto se optimizó mediante Vite y Tailwind JIT para mantener el peso total extremadamente ligero.

---

### P3: ¿Cómo manejan la seguridad del JWT y por qué lo guardan en localStorage?
> **Respuesta modelo:** El JWT viaja en la cabecera estándar `Authorization: Bearer <token>` protegiendo cada endpoint sensible en el backend.  
> Lo almacenamos en `localStorage` para garantizar la persistencia de la sesión incluso si el usuario recarga o cierra la pestaña. En una arquitectura de producción con dominio unificado, la alternativa más segura contra ataques XSS sería utilizar cookies con bandera `HttpOnly` y `SameSite=Strict`. Dado que nuestro backend está en Render y el frontend en otro dominio independiente, el uso de Bearer Token en `localStorage` con sanitización de inputs y validación de esquemas en el backend es el estándar de la industria para evitar problemas de políticas de cookies de terceros (*Third-Party Cookies*).

---

### P4: ¿Qué sucede si el token JWT expira mientras el usuario está utilizando la aplicación?
> **Respuesta modelo:** Nuestro cliente HTTP centralizado (`apiRequest` en `api.js`) intercepta automáticamente cualquier respuesta con código de estado HTTP `401 Unauthorized`. Si esto ocurre, elimina inmediatamente el token inválido de `localStorage` y dispara un evento desacoplado `window.dispatchEvent(new Event('auth:unauthorized'))`. El componente principal `App.jsx` escucha este evento, reinicia el estado de usuario a "Invitado" y le muestra una notificación clara al usuario informándole que su sesión caducó.

---

### P5: ¿Qué diferencia hay entre los filtros del lado del cliente vs del lado del servidor en el catálogo?
> **Respuesta modelo:** En Kiroku, los filtros de búsqueda, género, estado y ordenamiento se resuelven en el **lado del servidor** (*server-side filtering* y *pagination*).  
> **¿Por qué?** Si trajéramos los cientos o miles de animes al navegador para filtrarlos con `.filter()`, el consumo de datos móviles y la memoria del cliente se degradarían drásticamente. En su lugar, el frontend envía los query parameters (`?buscar=naruto&genero=Accion&pagina=1&limite=10`), permitiendo que el motor de indexación de MongoDB resuelva la consulta de forma ultrarrápida y devuelva únicamente los 10 documentos requeridos.

---

### P6: ¿Por qué usaron un botón `+1 Cap` con método PATCH en lugar de un formulario con PUT?
> **Respuesta modelo:** Por semántica REST y economía de red. La acción de registrar que viste un capítulo es una **mutación atómica y parcial**: solo se incrementa el contador `episodioActual`.  
> Utilizar `PATCH /api/seguimientos/:id/incrementar` permite que el backend valide atómicamente la regla de negocio: si el capítulo actual alcanza el total de episodios del anime, el estado pasa automáticamente a `Completado`. Realizar esto con `PUT` obligaría al frontend a enviar toda la estructura del objeto y expondría la lógica a condiciones de carrera (*race conditions*).

---

### P7: ¿Cómo garantizan que un usuario común no acceda al panel de administración?
> **Respuesta modelo:** Aplicamos una estrategia de **defensa en profundidad** (*Defense in Depth*):
> 1. **En la UI del Frontend:** La barra lateral solo muestra el botón "Panel Admin" si `user.rol === 'ADMIN'`.
> 2. **En el Enrutador del Frontend:** La ruta `/admin` verifica el rol en `App.jsx`; si un usuario sin privilegios fuerza la URL, recibe una pantalla de error 403 y no se monta el componente.
> 3. **En el Backend (seguridad real):** Los endpoints administrativos (`/api/usuarios`, `/api/animes` POST/DELETE, `/api/generos` POST/PUT/DELETE) están custodiados por el middleware `esAdmin`. Aunque un usuario logueado como STD intente enviar una petición directa mediante cURL o Postman con su token, el backend decodifica la firma criptográfica del JWT, comprueba que el rol es `STD` y rechaza la solicitud con un código HTTP `403 Forbidden`.

---

### P8: ¿Cómo se comunican los componentes entre sí sin usar Redux o Context API?
> **Respuesta modelo:** Para la escala y modularidad de Kiroku, se aplicó el patrón recomendado por el equipo de React: **Lifting State Up** (Elevación de Estado).  
> El componente raíz `App.jsx` mantiene las piezas críticas de estado compartido (`user`, `libraryMap`, `selectedAnime`) y las distribuye mediante *props down, events up* (las vistas reciben datos vía props y notifican cambios ejecutando funciones callback pasadas por el padre, como `onAddToLibrary` o `onUserUpdate`). Esto mantiene el flujo de datos **unidireccional y predecible**, facilitando el debugging sin la complejidad innecesaria de dependencias adicionales como Redux.

---

## 🎯 Consejos Finales para la Presentación
1. **Confianza y vocabulario técnico:** Utilicen términos precisos como *SPA*, *Virtual DOM*, *stateless*, *endpoints RESTful*, *reconciliación*, *payload*, *RBAC*, *idempotencia*.
2. **Demostración en vivo sugerida:**
   - Iniciar en modo incógnito (Invitado) para mostrar el catálogo y filtros.
   - Iniciar sesión como usuario `STD`: agregar un anime a la biblioteca, usar el botón `+1 Cap` y dejar una reseña con spoiler.
   - Iniciar sesión como `ADMIN`: mostrar cómo se activa el "Panel Admin" en dorado, crear un género, gestionar un anime y mostrar el badge dorado de moderación.
3. **Mención al trabajo en equipo:** Destacar cómo la arquitectura desacoplada y la capa `api.js` permitieron que cada integrante avance en su módulo sin bloquear al resto.

---

## 11. Defensa de los 8 Hallazgos del Informe Docente (Backend)

| # | Hallazgo | Prioridad | Causa Raíz Detectada | Solución Implementada y Argumento de Defensa |
| :---: | :--- | :---: | :--- | :--- |
| **01** | Permisos sobreviven a baja o cambio de rol | **P1** | `authToken` copiaba claims del JWT sin consultar la BD. | Se transformó `authToken` a asíncrono para consultar `Usuario.findById(id).select('_id email rol nombre')`. Si fue borrado responde `401` ("Cuenta dada de baja"); si su rol cambió, toma el rol actual de la BD. |
| **02** | Reducir total de episodios rompe seguimientos | **P1** | `actualizarAnime` no validaba si existían seguimientos con capítulos superiores. | Si se envía `totalEpisodios > 0`, se verifica con `Seguimiento.findOne({ anime_id: id, episodioActual: { $gt: body.totalEpisodios } })`. Si existe conflicto, responde `409 Conflict`. |
| **03** | El estado 'Completado' impedía retroceder solo el episodio | **P2** | `aplicarReglas()` pisaba `episodioActual = total` si el estado previo era 'Completado'. | Se implementó precedencia: si se reduce el episodio a un valor menor al total sin enviar estado, transiciona naturalmente de 'Completado' a 'Viendo'. |
| **04** | Episodios admiten números fraccionarios | **P1** | Los esquemas tenían `type: Number` y `min: 0`, pero no requerían entero. | Se incorporó el validador `validate: { validator: Number.isInteger, message: '...debe ser un número entero' }` en `Anime.js` (`totalEpisodios`, `anioEstreno`) y `Seguimiento.js` (`episodioActual`). |
| **05** | Afirmación de "recálculo atómico" en el README | **P2** | Se afirmaba atomicidad estricta para dos operaciones separadas (`Resena.save()` y luego `recalcularAnime()`). | Se clarificó la documentación explicando que es un recálculo asincrónico por agregación para consistencia eventual, y se blindó el controlador con `try/catch` para logging y control de excepciones. |
| **06** | Incrementar episodio pierde actualizaciones simultáneas | **P2** | `incrementarEpisodio` leía en memoria, sumaba `+ 1` y guardaba (`save()`). | Se implementó actualización condicional atómica con `findOneAndUpdate` en MongoDB con pipeline de actualización `$inc`/`$set`, asegurando que peticiones concurrentes avancen de forma atómica y consistente. |
| **07** | Rutas inexistentes y errores sin contrato uniforme | **P2** | Rutas inexistentes devolvían HTML por defecto y error 11000 siempre decía "email". | Se agregó middleware 404 en `app.js` (`{ error: true, mensaje: 'Ruta no encontrada: METHOD URL' }`) y en `errorHandler.middleware.js` se extrae el campo duplicado de `error.keyValue` para informar el motivo real (título, género, seguimiento o email). |
| **08** | Unicidad del título difería entre alta y edición | **P2** | El alta validaba con regex case-insensitive pero la edición solo confiaba en el índice único case-sensitive. | En `actualizarAnime`, si se envía `body.titulo`, se valida duplicados con regex case-insensitive excluyendo el ID actual (`_id: { $ne: id }`), respondiendo `409 Conflict` si colisiona. |

