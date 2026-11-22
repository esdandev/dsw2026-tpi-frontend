# Portal Salud — Frontend

Aplicación web desarrollada con **React**, **Vite**, **Tailwind CSS**, **React Router DOM** y **Axios** para la gestión integral de especialidades médicas, profesionales, disponibilidades horarias y reserva/administración de turnos.

## Integrantes

- Escalante Daniel - 60554
- Gutierrez Maia - 60348
- Ibarra Mauro - 60698
- Ruiz Lisandro - 58399

---

## Requisitos previos

- **Node.js** v18 o superior y **npm**
- API backend de **ASP.NET Core** ejecutándose localmente en `http://localhost:5278`

---

## Configuración

El frontend utiliza un proxy de Vite para comunicarse con la API de ASP.NET Core.

En el archivo `.env.development` se configura:

```env
API_PROXY_TARGET=http://localhost:5278
```

- Las solicitudes realizadas a `/api/*` se redirigen automáticamente al backend.
- La autenticación utiliza JWT mediante el encabezado `Authorization: Bearer <token>`.
- Si cambia el puerto del backend, actualizar `API_PROXY_TARGET` y reiniciar Vite.
- En producción se debe configurar el servidor web para redirigir las solicitudes `/api/*` al backend.

---

## Pasos de instalación y scripts disponibles

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Ejecutar lint:**
   ```bash
   npm run lint
   ```

3. **Ejecutar tests de helpers:**
   ```bash
   npm test
   ```

4. **Iniciar aplicación en desarrollo** (disponible en `http://localhost:5173`, con el backend corriendo en `http://localhost:5278`):
   ```bash
   npm run dev
   ```

5. **Crear archivos para producción:**
   ```bash
   npm run build
   ```

---

## Arquitectura del proyecto

El código fuente dentro de `src/` está organizado por módulos funcionales del dominio, separando páginas, componentes reutilizables, hooks personalizados, servicios HTTP y helpers de validación y fechas:

```text
src/
├── modules/
│   ├── auth/            # Inicio de sesión, registro y contexto de autenticación
│   ├── specialties/     # Gestión administrativa de especialidades médicas
│   ├── doctors/         # Gestión administrativa de profesionales y matrículas
│   ├── availabilities/  # Configuración de franjas horarias y consulta de slots libres
│   ├── patients/        # Portal del paciente (reserva y listado de turnos propios)
│   ├── appointments/    # Servicios de turnos y búsqueda administrativa paginada
│   └── shared/          # Cliente Axios, componentes UI compartidos y helpers de fecha/errores
```

---

## Endpoints utilizados

| Módulo | Método | Endpoint | Descripción |
| :--- | :--- | :--- | :--- |
| **Autenticación** | `POST` | `/api/auth/admin/login` | Login de administrador y obtención del JWT. |
| | `POST` | `/api/auth/patient/login` | Login de paciente con email y DNI; si no existe, se registra automáticamente. |
| | `POST` | `/api/auth/logout` | Revocación del token actual (requiere JWT). |
| **Especialidades** | `GET` | `/api/specialties` | Listado paginado de especialidades (`pageSize`, `pageIndex`, `name`). |
| | `POST` | `/api/specialties` | Alta de especialidad médica. |
| | `PUT` | `/api/specialties/{id}` | Actualización de especialidad. |
| | `DELETE` | `/api/specialties/{id}` | Baja lógica de especialidad. |
| **Profesionales** | `GET` | `/api/doctors` | Listado paginado de médicos (`pageSize`, `pageIndex`, `name`, `specialtyId`). |
| | `GET` | `/api/doctors/{id}/availabilities` | Franjas horarias configuradas para un médico. |
| | `GET` | `/api/doctors/{id}/slots` | Slots libres por rango de fechas (`from` y `to`). |
| | `POST` | `/api/doctors` | Alta de profesional médico con matrícula (`licenseNumber`). |
| | `PUT` | `/api/doctors/{id}` | Actualización de profesional. |
| | `DELETE` | `/api/doctors/{id}` | Baja lógica de profesional. |
| **Disponibilidades** | `POST` | `/api/availabilities` | Alta de la disponibilidad semanal de un médico. |
| | `PUT` | `/api/availabilities` | Actualización de la disponibilidad semanal. |
| **Turnos** | `POST` | `/api/appointments` | Reserva de turno médico (`doctorId`, `availabilitySlotId`, `patient.dni`, `reason`). |
| | `GET` | `/api/appointments/patient` | Turnos del paciente autenticado (`dni`). |
| | `DELETE` | `/api/appointments/{id}` | Cancelación de turno por parte del paciente. |
| | `GET` | `/api/appointments` | Listado administrativo paginado por fecha (`date`, `pageIndex`, `pageSize`). |
| | `GET` | `/api/appointments/search` | Búsqueda administrativa filtrada por `dni`, `specialtyId`, `doctorId` y `date`. |

---

## Decisiones técnicas y reglas de negocio

- **Listados paginados por el servidor:** Las tablas administrativas delegan el paginado al backend mediante los parámetros `pageIndex` y `pageSize`, consumiendo respuestas con el contrato `{ pageSize, pageIndex, data, total }`.
- **Reserva mediante `availabilitySlotId`:** Al confirmar un turno (`POST /api/appointments`), el frontend envía el identificador único del bloque horario seleccionado (`availabilitySlotId`) junto con `doctorId`, `patient.dni` (numérico entero) y `reason`.
- **Endpoint extra de slots disponibles:** Para el calendario semanal del paciente se consume `GET /api/availabilities/doctor/{doctorId}/slots?from=YYYY-MM-DD&to=YYYY-MM-DD`, evitando calcular subdivisiones de agenda en el cliente y reflejando en tiempo real los turnos ya ocupados.
- **Ventana mensual de disponibilidad:** La navegación por semanas en la pantalla de reserva acota la consulta hacia adelante a una ventana máxima de ~31 días (4 semanas) desde la fecha actual en zona horaria `America/Argentina/Buenos_Aires`.
- **Matrícula médica (`licenseNumber`) obligatoria y única:** El formulario de alta de médicos exige el ingreso de `licenseNumber` antes de enviar la petición y mapea errores de conflicto (`409`) del backend directamente sobre el campo correspondiente.
- **Login de paciente con DNI:** Al iniciar sesión como `PACIENTE`, el DNI se almacena en `localStorage` junto con el token y el rol, permitiendo consultar automáticamente sus turnos (`GET /api/appointments/patient?dni=...`) y precompletar sus reservas sin volver a solicitar el documento.
- **Conversión horaria UTC → Argentina:** Todas las marcas temporales (`availableTime`, `startTime`) recibidas en UTC desde la API se formatean a `America/Argentina/Buenos_Aires` (`dd/MM/yyyy` y `HH:mm hs`) mediante helpers centralizados.

---

## Usuarios de prueba y flujo recomendado

### Credenciales de prueba

- **Administrador:**
  - **Email:** `admin@utn.com`
  - **Contraseña:** `[Contraseña configurada en el backend]`
- **Paciente:**
  - **Email:** `paciente@gmail.com`
  - **DNI:** `12345677`
  - No hay registro público: el primer login con un email y DNI nuevos crea el paciente.

### Flujo recomendado de prueba

1. **Panel Administrador (`/admin/home`):**
   - Ingresar con la cuenta de administrador.
   - Verificar o crear una especialidad médica en **Especialidades**.
   - Registrar o verificar un médico con matrícula única (`licenseNumber`) en **Doctores** y configurar sus franjas horarias de atención.
2. **Reserva de Turno (`/`) — Rol Paciente:**
   - Cerrar sesión e ingresar con la cuenta de paciente.
   - Seleccionar especialidad, profesional y un horario disponible en el calendario semanal, completar el motivo de consulta y confirmar el turno.
3. **Mis Turnos (`/appointments`) — Rol Paciente:**
   - Verificar que el turno figure con estado **Confirmado** (`BOOKED`) y fecha/hora en formato argentino.
   - Probar la cancelación de un turno (`DELETE /api/appointments/{id}`) y comprobar que el horario vuelve a liberarse en el calendario.
4. **Búsqueda Administrativa de Turnos (`/admin/patients`) — Rol Administrador:**
   - Reingresar como administrador y filtrar turnos por **DNI**, **Especialidad**, **Doctor** o **Fecha**.
   - Verificar la traducción de estados (`Confirmado`, `Cancelado`, `Atendido`, `Ausente`) y los controles de paginación del servidor.
