# CRM ESCALL Perú — Avance 3 corregido

Solución Angular + Spring Boot + JPA/MySQL. El backend se recuperó de «codigo 2do avance actualizado/web-main» para conservar la continuidad del segundo avance. El frontend reemplaza el prototipo HTML/JavaScript de la carpeta original del tercer avance.

## Qué quedó comprobado

- Angular 21.2.26 compila en producción sin errores ni advertencias: 351,38 kB de archivos iniciales.
- Spring Boot 4.1.1 y Java 21.0.12.1: 10 pruebas de integración, 0 fallos, 0 errores y 0 omitidas. Perfil H2 para la suite automática.
- MySQL 8.0.46: cliente creado y editado desde Angular, consultado directamente en SQL, y recuperado con el mismo ID/documento/dirección después de reiniciar Spring Boot.
- Navegador: GET público, login inválido/válido, validación de correo, alta, edición, cancelación de eliminación, eliminación confirmada, búsqueda, dashboard, permisos de asesor, gestión registrada en historial y cierre de sesión.
- 15 comprobaciones HTTP iniciales y 41 adicionales de los módulos nuevos respondieron como se esperaba; el build Angular y diez pruebas de lógica de frontend también pasaron.
- Evidencias y alcance detallado: `docs/VERIFICACION.md` y `docs/evidencias/`.

La instancia usada para verificar MySQL escucha en 3310 y contiene datos sintéticos. No se modificó la base existente del usuario. La conexión de tu instalación se configura mediante `.env`; sus claves no se incluyen en el paquete.

## Requisitos

Java 21 y Node.js 24. Maven Wrapper incluido. La aplicación compilada de Angular está incluida en `frontend-compilado/`; para usarla no hace falta instalar npm.

### Inicio rápido con H2

Abrir dos terminales en la raíz del proyecto:

```powershell
cd backend
# JAVA_HOME debe apuntar a un JDK 21.
.\mvnw.cmd spring-boot:run '-Dspring-boot.run.profiles=demo'
```

```powershell
node scripts/servir-frontend.mjs
```

En Windows también puedes ejecutar `INICIAR_BACKEND_DEMO.cmd` e `INICIAR_FRONTEND.cmd`. El backend puede tardar en descargar dependencias en la primera ejecución.

Abrir `http://localhost:4200/conexion` y después iniciar sesión:

| Perfil | Usuario | Clave de demostración |
| --- | --- | --- |
| Administrador | admin | Admin12345 |
| Supervisor | sgarcia | Clave12345 |
| Asesor | asesor1 | Clave12345 |

H2 pierde los datos al detener el proceso. **Para sustentar persistencia se debe usar MySQL**, como se hizo en la verificación adjunta.

### Ejecutar con MySQL

1. Ejecutar `database/01_esquema.sql` en MySQL Workbench. Crea el esquema dedicado `escall_avance3` sin borrar tablas existentes.
2. Preparar un usuario con permisos sobre ese esquema. Copiar `backend/.env.example` a `backend/.env` y completar conexión, claves y administrador.
3. Para una base de prueba vacía, `DATOS_DEMO=true` carga datos sintéticos una sola vez. Para datos propios usar `false`.
4. Desde `backend`, ejecutar `.\mvnw.cmd spring-boot:run` (MySQL es el perfil predeterminado), o usar `INICIAR_BACKEND_MYSQL.cmd`.
5. Iniciar el frontend como se indicó antes.

No ejecutar el perfil demo para demostrar MySQL. La suite JUnit usa H2 y se documenta por separado de la comprobación real de MySQL.

### Desarrollar el frontend Angular

Desde `frontend`:

```powershell
npm ci
npm run build
npm start
```

`package-lock.json` fija las versiones comprobadas. `npm start` ejecuta el servidor de desarrollo; `node scripts/servir-frontend.mjs` sirve el build de producción incluido. Ambos usan 4200: ejecutar solo uno a la vez.

Después de modificar y compilar Angular, copiar el contenido de `frontend/dist/escall/browser/` a `frontend-compilado/` si se desea actualizar ese servidor de vista previa.

## Pantallas y funcionalidades

- `/conexion`: recurso público S14 mediante PublicApiService, HttpClient y `responseType: 'text'`.
- `/login`: autenticación real `POST /api/auth/login`, token con vencimiento y sesión por pestaña.
- `/clientes`: búsqueda por documento, nombre u operación (mínimo 3 caracteres), alcance por cartera y alta para administrador.
- `/clientes/:id`: cuentas, gestiones, pagos y promesas del backend; edición y eliminación con confirmación. Solo se pueden eliminar clientes sin cuentas.
- Registro de gestiones del asesor: N2 depende de N1; fecha y monto obligatorios cuando el resultado requiere compromiso.
- `/dashboard`: indicadores por hoy, semana o mes; acceso para supervisor/administrador.

Las tres pantallas adicionales están implementadas:

- `/reportes`: gestiones, pagos y promesas; filtros por periodo/rango, asesor, cartera y cosecha; paginación de 25 filas; exportación CSV de todas las filas filtradas.
- `/usuarios`: listado y filtro, creación, edición, activación/desactivación con confirmación y restablecimiento de contraseña. Supervisor limitado a su equipo; administrador gestiona los perfiles.
- `/importaciones`: CSV/TXT de asignaciones y pagos, plantillas descargables, validación de archivo, resumen aceptados/rechazados y detalle del historial.

Validación ampliada del 18/11/2026: ver `docs/VERIFICACION_MODULOS.md`. El selector automático de archivos de Chrome estuvo restringido; la carga se comprobó con el componente y servicio Angular ejecutados en Node, HttpClient/FormData y el backend real con MySQL.

## Arquitectura

Componente Angular → servicio inyectable → HttpClient → interceptor Bearer cuando corresponde → controlador REST → servicio transaccional → repositorio JPA → MySQL → DTO → estado de la interfaz.

- URL base central: `frontend/src/app/core/api.config.ts`.
- Configuración: `provideRouter` y `provideHttpClient(withInterceptors(...))` en `app.config.ts`.
- Guards controlan la navegación; los permisos efectivos se verifican en Spring Security y en los servicios.
- CORS permite `http://localhost:4200` y `http://127.0.0.1:4200`, incluidos Authorization y Content-Type.
- Los errores del backend usan `estado`, `mensaje` y `errores`; la interfaz distingue errores de validación, conexión, sesión y permisos.
- Las cuentas y gestiones sustituyen los datos ilustrativos del prototipo anterior.

## Pruebas de los módulos adicionales

Desde `frontend`, después de `npm ci`:

```powershell
npm test
```

Ejecuta diez pruebas de lógica de formularios, filtros y manejo de cargas sin modificar datos.

La prueba siguiente escribe registros sintéticos: ejecutarla solo contra una instancia local de prueba o el perfil demo, con el backend en localhost:8080:

```powershell
npm run test:integration
```

Usa el componente y servicio Angular en Node con un adaptador de transporte HTTP de prueba. Genera operaciones/documentos nuevos en cada ejecución y comprueba rechazo de estructura inválida, asignaciones y pagos con aceptación parcial e historial. Las credenciales demo predeterminadas pueden sustituirse con CRM_TEST_USER y CRM_TEST_PASSWORD. Guarda el resultado en `frontend/tests/resultados/`.

## Pruebas y documentación

```powershell
cd backend
.\mvnw.cmd -B -ntp test
```

Ver `docs/MATRIZ_AVANCE3.md` para el cumplimiento técnico frente a la guía del profesor y `docs/VERIFICACION.md` para resultados y evidencias. El Word y las diapositivas originales no se han actualizado en esta etapa de corrección del software; todavía describen el prototipo anterior y deben adaptarse antes de la entrega académica.

No se incluyen `.env`, credenciales de la instancia temporal, `node_modules`, cachés ni `target` en el ZIP.

Referencias de implementación: https://angular.dev/guide/http/setup y https://angular.dev/guide/http/interceptors.
