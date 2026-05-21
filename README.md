# SGA_IngeSis Frontend

Frontend Angular para el sistema de gestión de solicitudes.

Este proyecto provee la interfaz del cliente con rutas de autenticación, gestión de solicitudes, perfil de usuario y control de accesos mediante guards.

## Estructura principal

- `src/app/app.ts` - Módulo principal y bootstrap de la aplicación.
- `src/app/app.routes.ts` - Configuración de rutas de la aplicación.
- `src/app/app.config.ts` - Configuración general de la app.
- `src/app/component/` - Componentes reutilizables y páginas de la aplicación.
  - `login` - inicio de sesión.
  - `registro` - creación de cuentas.
  - `inicio` - pantalla principal.
  - `solicitudes` - listado de solicitudes.
  - `detalle-solicitud` - vista de detalle de una solicitud.
  - `crear-solicitud` - formulario para crear solicitudes.
  - `perfil` - datos del usuario.
  - `navbar` - menú de navegación.
  - `unauthorized` - pantalla de acceso restringido.
- `src/app/servicios/` - Servicios de datos y autenticación.
- `src/app/modelos/` - Interfaces y modelos de datos.
- `src/styles.css` - estilos globales.
- `public/` - activos estáticos que se incluyen en el build.

## Requisitos previos

- Node.js compatible con `npm@11.9.0`.
- Angular CLI 21.x (opcional, pero recomendado para comandos locales).

## Instalación

Desde la carpeta del proyecto ejecuta:

```bash
npm install
```

## Ejecutar en desarrollo

Para iniciar el servidor local:

```bash
npm start
```

Luego abre `http://localhost:4200/` en el navegador.

## Scripts disponibles

- `npm start` - Inicia la aplicación con `ng serve` en modo desarrollo.
- `npm run build` - Genera el build de producción en `dist/`.
- `npm run watch` - Construye en modo watch para desarrollo.
- `npm test` - Ejecuta pruebas unitarias.

## Funcionalidades clave

- Autenticación y autorización.
- Rutas protegidas con guards (`auth.guard`, `public.guard`, `roles.guard`).
- Interceptor para el manejo de tokens de acceso (`auth.interceptor`).
- Gestión de solicitudes y usuarios mediante servicios dedicados.
- UI basada en componentes estructurados por funcionalidad.

## Notas

- El proyecto usa Angular 21 y PrimeNG para componentes de interfaz.
- Ajusta los endpoints del backend en `src/app/servicios/` según sea necesario.
- Si agregas nuevas rutas o guards, recuerda actualizar `app.routes.ts`.

## Recursos adicionales

- Angular: https://angular.io/
- Angular CLI: https://angular.io/cli
- PrimeNG: https://www.primefaces.org/primeng/
