# Verificación de los tres módulos adicionales

Fecha: 18/11/2026, America/Lima. Entorno: Angular 21.2.26 / Node 24.12.0 / Spring Boot 4.1.1 / MySQL 8.0.46, esquema aislado escall_avance3 en 127.0.0.1:3310. Datos sintéticos.

## Compilación

`npm run build`: correcto, sin errores ni advertencias. Tamaño inicial 387,77 kB; transferencia estimada 98,90 kB. No se modificó el backend para agregar estas pantallas; conserva la suite previamente comprobada de diez pruebas.

## Navegador

- Reportes: consulta inicial con 60 gestiones, cambio a página 2 de 3, filtro por Lucía Torres, consulta de pagos y promesas y bloqueo de fechas invertidas. El CSV descargado tenía 18 filas de datos y todas correspondían al asesor elegido. Evidencia: 01-reportes.jpg y validacion-exportacion.json.
- Usuarios: creación del asesor sintético front18 desde Angular, obligatoriedad de supervisor, filtro de tabla, edición de nombre, cancelación y confirmación de desactivación. No se permite desactivar el propio administrador desde la interfaz. Evidencia: 02-usuarios.jpg.
- El selector automatizado de archivos de Chrome requirió un permiso de extensión no habilitado. El intento con control nativo terminó porque la herramienta no pudo verificar la URL de Windows. No se cambiaron permisos. **No se afirma una carga manual verificada en Chrome.**

## Pruebas de lógica Angular

`npm test`: **10 pruebas, 10 correctas, 0 fallos**. Usan los componentes reales y Formularios Reactivos, con servicios sustituidos para aislar el comportamiento:

1. Vacío, formato no admitido y límite de 10 MB.
2. Prevención de doble carga y presentación de aceptados/rechazados.
3. Error de servidor conserva archivo para reintento.
4. Cambio de tipo limpia selección y resultados.
5. Fechas invertidas y rango de más de un año.
6. Paginación de 25 filas y reinicio de página al consultar.
7. Conservación de filtros de tipo, asesor, cartera y fechas.
8. Contraseña inicial y supervisor requeridos según rol.
9. Edición sin contraseña nueva y contexto de supervisor.
10. Contraseñas de confirmación distintas y longitud insuficiente.

Estas pruebas no renderizan el DOM ni sustituyen las pruebas de navegador registradas arriba.

## Importación Angular con MySQL

`npm run test:integration`: correcto. Ejecuta el componente ImportacionesPage y OperacionesService con HttpClient y FormData reales en Node. Un adaptador de transporte usa fetch para comunicarse con el backend real; el token de prueba se obtiene por login. No usa ni modifica la seguridad de Chrome.

- Archivo de cabecera inválida: HTTP 409, sin resultado falso de éxito y archivo conservado para reintento.
- Asignaciones: 3 filas, 1 aceptada, 2 rechazadas (operación repetida y deuda negativa).
- Pagos: 3 filas, 1 aceptada, 2 rechazadas (pago duplicado y operación inexistente).
- Historial: contiene las cargas y su detalle.
- Verificación SQL independiente: cliente/cuenta creados, deuda 1000,00 y pago 125,50. Saldo devuelto por la API: 874,50.

Soportes: importacion-angular-mysql.json y comprobacion-mysql.txt. Se repitió la prueba con el comando incluido para comprobar su reproducibilidad; cada ejecución genera identificadores de prueba nuevos.

## HTTP y permisos

41 comprobaciones adicionales correctas (23 iniciales y 18 de cierre). Soportes: pruebas-http-modulos.json y pruebas-http-cierre.json.

Incluyen consultas de los tres reportes como administrador/supervisor, rechazo al asesor (403), rechazo sin sesión (401), fechas inválidas (409), creación del asesor por supervisor en su propio equipo, imposibilidad de modificar usuarios ajenos (404), duplicado de usuario (409), contraseña corta (400), restablecimiento (204), activación, login con la nueva contraseña y rechazo de la anterior. El restablecimiento se probó por API; no se automatizó el cambio de contraseña mediante la interfaz.

Los usuarios front18 y equipo18 quedaron desactivados al terminar. Las cargas y los registros sintéticos permanecen en la instancia aislada de prueba. No se modificaron las bases existentes del usuario.

## Alcance de esta entrega

Se completaron las tres pantallas solicitadas y su conexión con los endpoints. El informe Word y el PowerPoint quedan a cargo del usuario, según su indicación. No se afirma despliegue remoto ni auditoría general de seguridad.
