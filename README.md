# Frontend Client (React + Vite)

Aplicación Single Page Application (SPA) construida con React y Vite, diseñada para consumir la API REST del backend. Este proyecto sirvió como entorno práctico para dominar los fundamentos modernos de React, enrutamiento en el cliente, gestión de estado y consumo de servicios HTTP.

---

## 🎯 Conceptos Aprendidos e Implementados

* **Tooling moderno con Vite:** Entorno de desarrollo ágil con recarga en vivo (HMR), acceso en red local (`vite --host`) y compilación optimizada para producción (`vite build`).
* **Arquitectura SPA y Enrutamiento:** Navegación dinámica en el cliente (Single Page Application) mediante React Router, simulando múltiples vistas sin recargar el navegador.
* **Autenticación con JWT:**
  * Formularios de registro e inicio de sesión.
  * Almacenamiento y persistencia del token JWT (en almacenamiento local/sesión).
  * Manejo del estado de autenticación a través de la aplicación.
* **Capa de Servicios Modular:** Separación de responsabilidades aislando las llamadas HTTP al backend en módulos independientes (`services/`), evitando acoplar `fetch` o `axios` directamente dentro de la interfaz.
* **Ciclo de vida y Reactividad:**
  * Uso de `useEffect` para la carga inicial de datos (listados, perfiles) al montar componentes.
  * Manejo de eventos (`onClick`, `onSubmit`) para acciones reactivas iniciadas por el usuario.
* **Gestión de Formularios y Estados:** Manejo de formularios controlados con `useState` y renderizado declarativo de colecciones y listas.

---

## 📁 Estructura del Proyecto

```text
frontend/
├── components/      # Componentes de UI reutilizables
├── services/        # Módulos para peticiones HTTP a la API REST
├── App.jsx          # Componente raíz, configuración del router y handlers principales
└── main.jsx         # Punto de entrada de la aplicación
