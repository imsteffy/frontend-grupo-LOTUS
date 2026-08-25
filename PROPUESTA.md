# Propuesta de Proyecto — Frontend de Seguimiento de Anime

## Descripción

El proyecto consiste en desarrollar la **interfaz web de una plataforma de seguimiento y reseñas de anime**. El frontend permitirá a los usuarios visualizar anime, consultar su información, gestionar su lista personal, actualizar su progreso, puntuar títulos, escribir reseñas y marcar favoritos.

La aplicación consumirá los servicios proporcionados por la **API REST desarrollada en el repositorio de backend**, encargándose exclusivamente de la presentación y la interacción con el usuario.

## Problemática

Los usuarios que siguen diferentes anime necesitan una interfaz sencilla y organizada que les permita consultar información, administrar su progreso y acceder a las opiniones y valoraciones de la comunidad.

## Propuesta de solución

Se propone desarrollar una **aplicación web interactiva** que permita acceder de manera visual a las funcionalidades ofrecidas por la API.

El frontend mostrará la información obtenida desde el backend y permitirá al usuario interactuar con ella mediante diferentes vistas, formularios, filtros y componentes.

Entre las principales funcionalidades se encuentran:

- Explorar y buscar anime.
- Consultar información detallada de cada título.
- Gestionar la lista personal.
- Actualizar el estado y progreso.
- Puntuar anime.
- Escribir y consultar reseñas.
- Gestionar favoritos.
- Consultar historial y estadísticas personales.
- Filtrar y ordenar contenido.

## Estructura del proyecto

El proyecto estará dividido en **dos repositorios independientes**:

- **Frontend:** aplicación web desarrollada con React, responsable de la interfaz, navegación, componentes y experiencia de usuario.
- **Backend:** API REST independiente que proporciona los datos y servicios consumidos por el frontend.

La comunicación entre ambos se realizará mediante **peticiones HTTP y respuestas en formato JSON**.

En esta etapa, la propuesta se centra exclusivamente en el desarrollo del **frontend y su integración con la API REST**.
