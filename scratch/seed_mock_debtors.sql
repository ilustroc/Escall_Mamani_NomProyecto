
SET NAMES utf8mb4;
USE escall_avance3;

-- 10 Clientes del Mock de Cartera (incluyendo Jorge Luis Morales Vega DNI 10482914)
INSERT INTO clientes (id, tipo_documento, documento, nombres, email, direccion) VALUES
(101, 'DNI', '44920184', 'Juan Carlos Mendoza Ruiz', 'jcmendoza.pe@gmail.com', 'Av. Javier Prado Este 2450 Dpto 402, San Isidro, Lima'),
(102, 'DNI', '10293847', 'María Elena Quispe Flores', 'mequispe.flores@outlook.com', 'Calle Los Arces 312, Cayma, Arequipa'),
(103, 'DNI', '20485912', 'Carlos Alberto Rodríguez Paredes', 'crodriguez.paredes@hotmail.com', 'Mz. B Lote 14 Urb. El Golf, Victor Larco, Trujillo'),
(104, 'DNI', '45892013', 'Ana Lucía Flores Morales', 'aflores.morales@yahoo.es', 'Calle Schell 450 Dpto 801, Miraflores, Lima'),
(105, 'DNI', '09384721', 'Pedro Antonio Sánchez Castro', 'psanchez.castro@gmail.com', 'Av. Quiñones 780, Pimentel, Chiclayo'),
(106, 'DNI', '10394857', 'Carmen Rosa Vega Luna', 'cvega.luna@empresarial.pe', 'Calle Las Camelias 145, Santiago de Surco, Lima'),
(107, 'DNI', '10482914', 'Jorge Luis Morales Vega', 'jorge.morales.vega@gmail.com', 'Av. Larco 890, Urb. California, Trujillo'),
(108, 'DNI', '40928374', 'Roberto Carlos Huamán Soto', 'rhuaman.soto@gmail.com', 'Av. Micaela Bastidas 450, Wanchaq, Cusco'),
(109, 'DNI', '10492837', 'Patricia Elena Castro Romero', 'pcastro.romero@hotmail.com', 'Av. Grau 1200, Castilla, Piura'),
(110, 'DNI', '41029384', 'Miguel Ángel Navarro Díaz', 'mnavarro.diaz@consultores.pe', 'Calle Rousseau 320, San Borja, Lima')
ON DUPLICATE KEY UPDATE nombres=VALUES(nombres), email=VALUES(email), direccion=VALUES(direccion);

-- Teléfonos
INSERT INTO telefonos (id, cliente_id, numero, tipo, activo) VALUES
(201, 101, '+51 987 654 321', 'CELULAR', 1),
(202, 101, '+51 1 422 9012', 'FIJO', 1),
(203, 102, '+51 959 123 456', 'CELULAR', 1),
(204, 103, '+51 948 776 543', 'CELULAR', 1),
(205, 103, '+51 44 283 190', 'FIJO', 1),
(206, 104, '+51 993 456 789', 'CELULAR', 1),
(207, 105, '+51 979 881 234', 'CELULAR', 1),
(208, 106, '+51 981 234 567', 'CELULAR', 1),
(209, 107, '+51 944 192 883', 'CELULAR', 1),
(210, 107, '+51 44 284 910', 'FIJO', 1),
(211, 108, '+51 984 551 290', 'CELULAR', 1),
(212, 109, '+51 969 332 109', 'CELULAR', 1),
(213, 110, '+51 998 776 123', 'CELULAR', 1)
ON DUPLICATE KEY UPDATE numero=VALUES(numero);

-- Cuentas de cartera
INSERT INTO cuentas (id, cliente_id, numero_operacion, entidad, producto, cartera, cosecha, deuda_total, dias_mora) VALUES
(201, 101, 'PREST-BCP-8921', 'Banco de Crédito BCP', 'Préstamo Personal', 'BCP Comercial', '2026-Q1', 18450.00, 45),
(202, 102, 'TC-INTER-4412', 'Interbank', 'Tarjeta Oro Visa', 'BBVA Consumo', '2026-Q2', 8230.50, 12),
(203, 103, 'HIP-SCOTIA-019', 'Scotiabank', 'Crédito Hipotecario MiVivienda', 'Scotiabank Pyme', '2025-Q4', 45200.00, 88),
(204, 104, 'VEH-BBVA-7821', 'BBVA', 'Crédito Vehicular AutoFácil', 'BBVA Consumo', '2025-Q3', 12100.00, 130),
(205, 105, 'MICRO-PICH-552', 'Banco Pichincha', 'Microcrédito Capital Trabajo', 'BCP Comercial', '2026-Q2', 3150.00, 25),
(206, 106, 'COM-BCP-1092', 'Banco de Crédito BCP', 'Línea de Crédito Comercial', 'BCP Comercial', '2026-Q1', 67800.00, 72),
(207, 107, 'PREST-BBVA-901', 'BBVA', 'Préstamo Consumo Ágil', 'BBVA Consumo', '2025-Q4', 34100.00, 115),
(208, 108, 'TC-SCOTIA-331', 'Scotiabank', 'Tarjeta Platinum Master', 'Scotiabank Pyme', '2026-Q1', 15400.00, 60),
(209, 109, 'CONSUMO-INTER-889', 'Interbank', 'Crédito Efectivo Inmediato', 'BBVA Consumo', '2026-Q2', 9850.00, 18),
(210, 110, 'PYME-BCP-662', 'Banco de Crédito BCP', 'Crédito Pyme Impulso', 'BCP Comercial', '2025-Q4', 28900.00, 95)
ON DUPLICATE KEY UPDATE deuda_total=VALUES(deuda_total), dias_mora=VALUES(dias_mora);

-- Asignaciones a asesores activos
INSERT INTO asignaciones (id, cuenta_id, asesor_id, fecha_asignacion, activa) VALUES
(201, 201, 4, '2026-11-01', 1),
(202, 202, 5, '2026-11-01', 1),
(203, 203, 6, '2026-11-01', 1),
(204, 204, 7, '2026-11-01', 1),
(205, 205, 8, '2026-11-01', 1),
(206, 206, 9, '2026-11-01', 1),
(207, 207, 6, '2026-11-01', 1),
(208, 208, 11, '2026-11-01', 1),
(209, 209, 12, '2026-11-01', 1),
(210, 210, 4, '2026-11-01', 1)
ON DUPLICATE KEY UPDATE activa=VALUES(activa);

-- Gestiones iniciales para Jorge Luis Morales Vega (cuenta 207) y otros
INSERT INTO gestiones (id, cuenta_id, asesor_id, fecha_hora, telefono, tipificacion_n1_id, tipificacion_n2_id, observacion) VALUES
(1501, 207, 6, '2026-11-22 17:10:00', '+51 944 192 883', 2, 4, 'Intentos en mañana y tarde. Línea apagada. Se envió SMS y correo informativo de escalamiento a cobranza judicial.'),
(1502, 207, 6, '2026-11-24 10:45:00', '+51 944 192 883', 1, 1, 'Contacto con titular Jorge Morales. Indica voluntad de refinanciar deuda total de S/ 34,100 en 3 cuotas. Se agenda seguimiento.'),
(1503, 201, 4, '2026-11-25 11:30:00', '+51 987 654 321', 1, 1, 'Contacto con titular. Se logra acuerdo y promesa de pago de S/ 15,000 para el 27/11.'),
(1504, 206, 9, '2026-11-24 16:20:00', '+51 981 234 567', 1, 1, 'Titular solicita exoneración de intereses moratorios para cancelación total en una cuota.')
ON DUPLICATE KEY UPDATE observacion=VALUES(observacion);

-- Promesa de pago para cuenta 201
INSERT INTO promesas (id, gestion_id, cuenta_id, asesor_id, fecha_compromiso, monto, estado) VALUES
(501, 1503, 201, 4, '2026-11-27', 15000.00, 'PENDIENTE')
ON DUPLICATE KEY UPDATE monto=VALUES(monto);

-- Pagos previos registrados para Jorge Morales y otros
INSERT INTO pagos (id, cuenta_id, fecha_pago, monto, referencia) VALUES
(401, 207, '2026-07-15', 2500.00, 'PAG-BBVA-00912'),
(402, 201, '2026-09-10', 3200.00, 'PAG-BCP-11289')
ON DUPLICATE KEY UPDATE monto=VALUES(monto);
