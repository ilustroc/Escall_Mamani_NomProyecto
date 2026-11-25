-- Ejecutar en el esquema dedicado de prueba.
USE escall_avance3;
-- Sustituir el documento por el cliente sintético creado desde Angular.
SELECT id, documento, nombres, email, direccion FROM clientes WHERE documento = '96781117';
-- Detener y reiniciar Spring Boot sin volver a ejecutar la carga SQL.
-- Repetir esta consulta y recuperar el mismo cliente desde Angular.
-- El cliente 96781117 se eliminó al terminar las pruebas de esta revisión.
