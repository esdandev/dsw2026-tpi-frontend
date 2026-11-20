# Unidad 5

# Configuración

El frontend utiliza un proxy de Vite para comunicarse
con la API de ASP.NET Core.

En el archivo .env.development se configura:

API_PROXY_TARGET=http://localhost:5278

Las solicitudes realizadas a /api/* se redirigen
automáticamente al backend.

La autenticación utiliza JWT mediante el encabezado
Authorization: Bearer <token>.

Para iniciar el proyecto:

1. Ejecutar el backend en http://localhost:5278.
2. Instalar las dependencias con npm install.
3. Iniciar el frontend con npm run dev.

Si cambia el puerto del backend, actualizar
API_PROXY_TARGET y reiniciar Vite.

En producción se debe configurar el servidor web
para redirigir las solicitudes /api/* al backend.

## Pasos de instalación

### Ejecutar:

`npm install`

### Ejecutar lint

`npm run lint`

### Iniciar aplicación

`npm run dev`

### Crear archivos para producción

`npm run build`
