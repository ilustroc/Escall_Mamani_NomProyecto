# Verificación del Avance 3

Resultados observados el 17 de noviembre de 2026, zona America/Lima. Todos los datos usados son sintéticos. Las capturas no contienen el JWT ni contraseñas.

## Compilación

Angular CLI 21.2.26, Node.js 24.12.0, TypeScript de package-lock.json. `npm run build`: completado sin errores ni advertencias. Archivos iniciales: 351,38 kB (transferencia estimada 91,45 kB).

Backend: Spring Boot 4.1.1, Java 21.0.12.1. `mvnw.cmd -B -ntp package -DskipTests`: BUILD SUCCESS. Las pruebas se ejecutaron por separado.

## Suite del backend

`mvnw.cmd -B -ntp test`: **10 pruebas, 0 fallos, 0 errores, 0 omitidas**, BUILD SUCCESS. La última ejecución terminó sin la advertencia de escritura que apareció durante el episodio anterior de falta de espacio.

Perfil demo H2. Incluye login, permisos por rol y cartera, gestión/promesa/pago, administración de usuarios, tipificaciones, CRUD, carga sin archivo, saludo público, CORS y JWT inválido. Estas pruebas automáticas no se confunden con la prueba MySQL descrita a continuación.

## Integración real con MySQL

MySQL Community Server 8.0.46, esquema escall_avance3, instancia aislada 127.0.0.1:3310, backend en perfil mysql, frontend en localhost:4200.

1. Desde Angular se registró un cliente sintético con documento 96781117; el backend asignó el ID 13.
2. Desde Angular se editó su dirección a «Dirección actualizada desde Angular».
3. Se canceló una eliminación y se comprobó que el cliente permanecía disponible.
4. Se consultó directamente la tabla clientes de MySQL.
5. Se detuvo el proceso Spring Boot y se inició otro proceso con el mismo perfil mysql.
6. Se recargó la página Angular y se recuperó el mismo ID, documento y dirección. Se confirmó de nuevo con API y SQL.
7. Al terminar, Angular eliminó el cliente de prueba. La búsqueda quedó vacía y el detalle pasó a HTTP 404.

Soportes: `persistencia.json`, `mysql-antes-reinicio.txt`, `mysql-despues-reinicio.txt`, `02-cliente-registrado-editado.jpg` y `03-cliente-despues-reinicio.jpg` en evidencias/. El ID 13 ya no existe porque se eliminó durante el cierre de la prueba. Los soportes registran el estado observado antes de esa eliminación.

## Navegador

| Caso | Resultado observado |
| --- | --- |
| GET público Angular → Spring Boot | Mensaje real visible sin iniciar sesión |
| Login incorrecto | Mensaje «Usuario o contraseña incorrectos» |
| Login administrador | Navegación a clientes y acceso a dashboard |
| Correo inválido al crear | Mensaje orientativo y botón deshabilitado |
| Alta y edición | Cambios persistidos en MySQL |
| Cancelar eliminación | Registro conservado |
| Confirmar eliminación | Vuelve a clientes; búsqueda sin coincidencias |
| Dashboard | Indicadores reales; cambio al periodo HOY |
| Asesor | Sin alta administrativa ni dashboard; búsqueda limitada a cartera |
| Registro de gestión | N2 depende de N1; promesa sin fecha/monto bloquea registro |
| Gestión sin compromiso | Guardada desde Angular y visible en historial; comprobada en tabla gestiones |
| Guard de rol | Asesor que navega a /dashboard vuelve a clientes |
| Cierre de sesión | Acceso posterior a /clientes redirige al login |

Soporte de gestión: `05-gestion-asesor.jpg` y `gestion-mysql.txt`. La gestión sintética observada quedó en la instancia de prueba, no en la base existente del usuario.

## Peticiones HTTP

Quince comprobaciones con resultado esperado en `evidencias/pruebas-http.json`. Incluyen 200, 400, 401, 403, 404 y 409; el alta y la eliminación también se observaron en el recorrido de navegador y están cubiertas con 201/204 en JUnit. No se guardan tokens.

El servidor del build Angular incluido respondió 200 a /conexion, /clientes/2, JavaScript, CSS y logo. Registro: `frontend-compilado.json`.

## Alcance

No se realizó despliegue remoto, auditoría de seguridad ni prueba de todos los navegadores. Esta verificación inicial se amplió el 18/11/2026 con los tres módulos Angular: ver VERIFICACION_MODULOS.md. La comprensión individual de cada integrante se evalúa en la sustentación.
