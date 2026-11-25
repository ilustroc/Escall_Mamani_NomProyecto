# Matriz de cumplimiento técnico del Avance 3

Referencia: estructura y rúbrica PDF proporcionadas por el profesor. Esta matriz registra implementación y pruebas; no asigna una nota de sustentación.

## Evidencias mínimas de la guía

| Requisito | Estado comprobado | Soporte |
| --- | --- | --- |
| Frontend Angular en ejecución | Integrado y probado | Componentes standalone; capturas de navegador; build de producción |
| Backend Spring Boot activo | Integrado y probado | Perfil mysql; API y consultas reales |
| GET /api/publico/saludo desde Angular | Integrado y probado | PublicApiService → HttpClient → PublicController → texto visible |
| Recorrido de petición | Implementado y documentado en código | Componente, servicio, interceptor, controlador, servicio, repositorio |
| Estructura real frontend/backend | Disponible en fuentes | frontend/src/app y backend/src/main/java |
| Contrato REST | Implementado | Métodos/rutas, DTO JSON y respuestas HTTP verificadas |
| Persistencia MySQL | Integrada y probada | Cliente creado/editado desde Angular y conservado tras reiniciar Spring Boot |
| Login JWT desde Angular | Integrado y probado como avance adicional | AuthService, interceptor y recursos protegidos |
| CRUD de clientes | Integrado y probado como avance adicional | Alta, búsqueda/detalle, edición y eliminación con reglas |
| Datos reales del detalle | Integrados y probados | Cuentas, gestiones, pagos y promesas del backend |
| Gestión de cobranza | Integrada y probada | Registro del asesor y fila SQL correspondiente |
| Dashboard | Integrado y probado | Indicadores por periodo según rol |
| Reportes Angular | Integrado y probado | Consulta de los tres tipos, filtros, paginación y CSV verificados en navegador |
| Administración de usuarios Angular | Integrado y probado | Alta, edición y desactivación en navegador; alcance por equipo, activación y contraseña por API |
| Importaciones Angular | Integrado; lógica y transporte HTTP probados con MySQL | Formulario y servicio Angular, asignaciones/pagos con aceptación parcial e historial; selector visual de Chrome no verificado |
| Despliegue remoto | Pendiente | No exigido por defecto en la guía del Avance 3 |

## Informe y sustentación

El código ahora cubre los mínimos técnicos verificados, pero el Word y las diapositivas originales siguen describiendo la versión vanilla. Antes de entregar deben actualizarse los doce rubros: introducción; problema/requerimientos/continuidad; solución integrada; alcances/estado; arquitectura; contrato REST; integración Angular–Spring Boot; interfaz; persistencia/seguridad; pruebas; conclusiones/pendientes; anexos.

Los datos académicos e integrantes deben completarse con información real. La sustentación exige que cada integrante pueda explicar el código y los resultados. No se considera automáticamente alcanzado el puntaje de los criterios orales por haber corregido el software.

## Contratos centrales comprobados

| Método y ruta | Entrada | Respuesta / permisos |
| --- | --- | --- |
| GET /api/publico/saludo | Sin cuerpo ni token | 200 text/plain; público |
| POST /api/auth/login | {usuario,password} | 200 {token,expiraEn,usuario}; 401 credenciales inválidas |
| GET /api/clientes?q=... | Texto mínimo 3 caracteres + Bearer | 200 lista filtrada por cartera; 401 sin token |
| GET /api/clientes/{id} | ID + Bearer | 200 detalle con cuentas/gestiones/pagos/promesas; 404 no visible o inexistente |
| POST /api/clientes | {tipoDocumento,documento,nombres,email,direccion} + Bearer | 201; ADMIN; 400 inválido; 409 duplicado |
| PUT /api/clientes/{id} | {nombres,email,direccion} + Bearer | 200; requiere acceso al cliente |
| DELETE /api/clientes/{id} | ID + Bearer | 204; ADMIN; 409 si tiene cuentas |
| GET /api/tipificaciones | Bearer | 200 árbol de tipificaciones |
| POST /api/gestiones | Cuenta, teléfono, resultado, observación y compromiso si corresponde | 201; ASESOR con cuenta asignada |
| GET /api/dashboard?periodo=HOY | Bearer y periodo | 200; ADMIN/SUPERVISOR; 403 asesor |

Los modelos difieren del prototipo de Avance 1: la deuda pertenece a cuentas, el identificador lo genera la base y los clientes se identifican por documento. Se conserva el dominio del Avance 2 en lugar de simular esa información en el navegador.
