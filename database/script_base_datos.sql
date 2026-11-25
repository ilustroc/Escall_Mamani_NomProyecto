CREATE DATABASE IF NOT EXISTS escall_avance3 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE escall_avance3;

DROP TABLE IF EXISTS auditoria;
DROP TABLE IF EXISTS pagos;
DROP TABLE IF EXISTS promesas;
DROP TABLE IF EXISTS gestiones;
DROP TABLE IF EXISTS tipificaciones_n2;
DROP TABLE IF EXISTS tipificaciones_n1;
DROP TABLE IF EXISTS asignaciones;
DROP TABLE IF EXISTS cargas;
DROP TABLE IF EXISTS cuentas;
DROP TABLE IF EXISTS telefonos;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    usuario         VARCHAR(40)  NOT NULL,
    nombre          VARCHAR(120) NOT NULL,
    email           VARCHAR(150) NOT NULL,
    password_hash   VARCHAR(100) NOT NULL,
    rol             VARCHAR(20)  NOT NULL,
    supervisor_id   BIGINT,
    activo          BOOLEAN      NOT NULL DEFAULT TRUE,
    creado_en       DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT pk_usuarios PRIMARY KEY (id),
    CONSTRAINT uk_usuarios_usuario UNIQUE (usuario),
    CONSTRAINT uk_usuarios_email UNIQUE (email),
    CONSTRAINT fk_usuarios_supervisor FOREIGN KEY (supervisor_id) REFERENCES usuarios (id),
    CONSTRAINT ck_usuarios_rol CHECK (rol IN ('ADMIN', 'SUPERVISOR', 'ASESOR'))
) ENGINE = InnoDB;

CREATE TABLE clientes (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    tipo_documento  VARCHAR(10)  NOT NULL DEFAULT 'DNI',
    documento       VARCHAR(20)  NOT NULL,
    nombres         VARCHAR(150) NOT NULL,
    email           VARCHAR(150),
    direccion       VARCHAR(300),
    creado_en       DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_clientes PRIMARY KEY (id),
    CONSTRAINT uk_clientes_documento UNIQUE (documento),
    INDEX idx_clientes_nombres (nombres)
) ENGINE = InnoDB;

CREATE TABLE telefonos (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    cliente_id      BIGINT       NOT NULL,
    numero          VARCHAR(20)  NOT NULL,
    tipo            VARCHAR(20)  NOT NULL DEFAULT 'CELULAR',
    activo          BOOLEAN      NOT NULL DEFAULT TRUE,
    CONSTRAINT pk_telefonos PRIMARY KEY (id),
    CONSTRAINT uk_telefonos_cliente_numero UNIQUE (cliente_id, numero),
    CONSTRAINT fk_telefonos_cliente FOREIGN KEY (cliente_id) REFERENCES clientes (id) ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE cuentas (
    id               BIGINT        NOT NULL AUTO_INCREMENT,
    cliente_id       BIGINT        NOT NULL,
    numero_operacion VARCHAR(40)   NOT NULL,
    entidad          VARCHAR(80)   NOT NULL,
    producto         VARCHAR(80)   NOT NULL,
    cartera          VARCHAR(80)   NOT NULL,
    cosecha          VARCHAR(20)   NOT NULL,
    deuda_total      DECIMAL(12,2) NOT NULL,
    dias_mora        INT           NOT NULL,
    creado_en        DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_cuentas PRIMARY KEY (id),
    CONSTRAINT uk_cuentas_operacion UNIQUE (numero_operacion),
    CONSTRAINT fk_cuentas_cliente FOREIGN KEY (cliente_id) REFERENCES clientes (id),
    CONSTRAINT ck_cuentas_deuda CHECK (deuda_total >= 0),
    CONSTRAINT ck_cuentas_mora CHECK (dias_mora >= 0),
    INDEX idx_cuentas_cartera (cartera),
    INDEX idx_cuentas_cosecha (cosecha)
) ENGINE = InnoDB;

CREATE TABLE cargas (
    id              BIGINT        NOT NULL AUTO_INCREMENT,
    tipo            VARCHAR(20)   NOT NULL,
    nombre_archivo  VARCHAR(200)  NOT NULL,
    usuario_id      BIGINT        NOT NULL,
    total           INT           NOT NULL,
    aceptados       INT           NOT NULL DEFAULT 0,
    rechazados      INT           NOT NULL DEFAULT 0,
    detalle_errores MEDIUMTEXT,
    creado_en       DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_cargas PRIMARY KEY (id),
    CONSTRAINT fk_cargas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
    CONSTRAINT ck_cargas_tipo CHECK (tipo IN ('ASIGNACION', 'PAGO')),
    INDEX idx_cargas_fecha (creado_en)
) ENGINE = InnoDB;

CREATE TABLE asignaciones (
    id               BIGINT      NOT NULL AUTO_INCREMENT,
    cuenta_id        BIGINT      NOT NULL,
    asesor_id        BIGINT      NOT NULL,
    fecha_asignacion DATE        NOT NULL,
    fecha_fin        DATE,
    activa           BOOLEAN     NOT NULL DEFAULT TRUE,
    carga_id         BIGINT,
    creado_en        DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_asignaciones PRIMARY KEY (id),
    CONSTRAINT fk_asignaciones_cuenta FOREIGN KEY (cuenta_id) REFERENCES cuentas (id),
    CONSTRAINT fk_asignaciones_asesor FOREIGN KEY (asesor_id) REFERENCES usuarios (id),
    CONSTRAINT fk_asignaciones_carga FOREIGN KEY (carga_id) REFERENCES cargas (id),
    INDEX idx_asignaciones_asesor_activa (asesor_id, activa)
) ENGINE = InnoDB;

CREATE TABLE tipificaciones_n1 (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    nombre      VARCHAR(80)  NOT NULL,
    es_contacto BOOLEAN      NOT NULL,
    orden       INT          NOT NULL DEFAULT 0,
    activo      BOOLEAN      NOT NULL DEFAULT TRUE,
    CONSTRAINT pk_tipificaciones_n1 PRIMARY KEY (id),
    CONSTRAINT uk_tipificaciones_n1_nombre UNIQUE (nombre)
) ENGINE = InnoDB;

CREATE TABLE tipificaciones_n2 (
    id                  BIGINT       NOT NULL AUTO_INCREMENT,
    n1_id               BIGINT       NOT NULL,
    nombre              VARCHAR(80)  NOT NULL,
    requiere_compromiso BOOLEAN      NOT NULL DEFAULT FALSE,
    orden               INT          NOT NULL DEFAULT 0,
    activo              BOOLEAN      NOT NULL DEFAULT TRUE,
    CONSTRAINT pk_tipificaciones_n2 PRIMARY KEY (id),
    CONSTRAINT uk_tipificaciones_n2_n1_nombre UNIQUE (n1_id, nombre),
    CONSTRAINT fk_tipificaciones_n2_n1 FOREIGN KEY (n1_id) REFERENCES tipificaciones_n1 (id)
) ENGINE = InnoDB;

CREATE TABLE gestiones (
    id                  BIGINT       NOT NULL AUTO_INCREMENT,
    cuenta_id           BIGINT       NOT NULL,
    asesor_id           BIGINT       NOT NULL,
    fecha_hora          DATETIME(6)  NOT NULL,
    telefono            VARCHAR(20)  NOT NULL,
    tipificacion_n1_id  BIGINT       NOT NULL,
    tipificacion_n2_id  BIGINT       NOT NULL,
    observacion         VARCHAR(500) NOT NULL,
    creado_en           DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_gestiones PRIMARY KEY (id),
    CONSTRAINT fk_gestiones_cuenta FOREIGN KEY (cuenta_id) REFERENCES cuentas (id),
    CONSTRAINT fk_gestiones_asesor FOREIGN KEY (asesor_id) REFERENCES usuarios (id),
    CONSTRAINT fk_gestiones_n1 FOREIGN KEY (tipificacion_n1_id) REFERENCES tipificaciones_n1 (id),
    CONSTRAINT fk_gestiones_n2 FOREIGN KEY (tipificacion_n2_id) REFERENCES tipificaciones_n2 (id),
    INDEX idx_gestiones_fecha (fecha_hora),
    INDEX idx_gestiones_asesor_fecha (asesor_id, fecha_hora)
) ENGINE = InnoDB;

CREATE TABLE promesas (
    id               BIGINT        NOT NULL AUTO_INCREMENT,
    gestion_id       BIGINT        NOT NULL,
    cuenta_id        BIGINT        NOT NULL,
    asesor_id        BIGINT        NOT NULL,
    fecha_compromiso DATE          NOT NULL,
    monto            DECIMAL(12,2) NOT NULL,
    estado           VARCHAR(20)   NOT NULL DEFAULT 'PENDIENTE',
    creado_en        DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_promesas PRIMARY KEY (id),
    CONSTRAINT uk_promesas_gestion UNIQUE (gestion_id),
    CONSTRAINT fk_promesas_gestion FOREIGN KEY (gestion_id) REFERENCES gestiones (id),
    CONSTRAINT fk_promesas_cuenta FOREIGN KEY (cuenta_id) REFERENCES cuentas (id),
    CONSTRAINT fk_promesas_asesor FOREIGN KEY (asesor_id) REFERENCES usuarios (id),
    CONSTRAINT ck_promesas_monto CHECK (monto > 0),
    CONSTRAINT ck_promesas_estado CHECK (estado IN ('PENDIENTE', 'CUMPLIDA')),
    INDEX idx_promesas_fecha (fecha_compromiso)
) ENGINE = InnoDB;

CREATE TABLE pagos (
    id              BIGINT        NOT NULL AUTO_INCREMENT,
    cuenta_id       BIGINT        NOT NULL,
    fecha_pago      DATE          NOT NULL,
    monto           DECIMAL(12,2) NOT NULL,
    referencia      VARCHAR(60)   NOT NULL DEFAULT '',
    carga_id        BIGINT,
    creado_en       DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_pagos PRIMARY KEY (id),
    CONSTRAINT uk_pagos_duplicado UNIQUE (cuenta_id, fecha_pago, monto, referencia),
    CONSTRAINT fk_pagos_cuenta FOREIGN KEY (cuenta_id) REFERENCES cuentas (id),
    CONSTRAINT fk_pagos_carga FOREIGN KEY (carga_id) REFERENCES cargas (id),
    CONSTRAINT ck_pagos_monto CHECK (monto > 0),
    INDEX idx_pagos_fecha (fecha_pago)
) ENGINE = InnoDB;

CREATE TABLE auditoria (
    id              BIGINT        NOT NULL AUTO_INCREMENT,
    usuario         VARCHAR(40)   NOT NULL,
    accion          VARCHAR(60)   NOT NULL,
    entidad         VARCHAR(60)   NOT NULL,
    entidad_id      VARCHAR(40),
    detalle         VARCHAR(1000),
    fecha           DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_auditoria PRIMARY KEY (id),
    INDEX idx_auditoria_fecha (fecha)
) ENGINE = InnoDB;

CREATE OR REPLACE VIEW vista_productividad_asesor AS
SELECT u.id                                   AS asesor_id,
       u.nombre                               AS asesor,
       COUNT(g.id)                            AS gestiones,
       SUM(CASE WHEN n1.es_contacto THEN 1 ELSE 0 END) AS contactos,
       COUNT(p.id)                            AS promesas,
       COALESCE(SUM(p.monto), 0)              AS monto_prometido
FROM usuarios u
LEFT JOIN gestiones g          ON g.asesor_id = u.id
LEFT JOIN tipificaciones_n1 n1 ON n1.id = g.tipificacion_n1_id
LEFT JOIN promesas p           ON p.gestion_id = g.id
WHERE u.rol = 'ASESOR'
GROUP BY u.id, u.nombre;

INSERT INTO usuarios (id, usuario, nombre, email, password_hash, rol, supervisor_id, activo) VALUES
(1, 'admin', 'Administrador del sistema', 'admin@escall.pe', '$2a$10$w8gZ9YkG.00hU3uYg9QkTez1jC1tL2yOqM1xX/4V4cZ5rW3eYkX8i', 'ADMIN', NULL, TRUE),
(2, 'sgarcia', 'Sandra García', 'sgarcia@escall.pe', '$2a$10$w8gZ9YkG.00hU3uYg9QkTez1jC1tL2yOqM1xX/4V4cZ5rW3eYkX8i', 'SUPERVISOR', NULL, TRUE),
(3, 'mrojas', 'Miguel Rojas', 'mrojas@escall.pe', '$2a$10$w8gZ9YkG.00hU3uYg9QkTez1jC1tL2yOqM1xX/4V4cZ5rW3eYkX8i', 'SUPERVISOR', NULL, TRUE),
(4, 'asesor1', 'Lucía Torres', 'asesor1@escall.pe', '$2a$10$w8gZ9YkG.00hU3uYg9QkTez1jC1tL2yOqM1xX/4V4cZ5rW3eYkX8i', 'ASESOR', 2, TRUE),
(5, 'asesor2', 'Carlos Medina', 'asesor2@escall.pe', '$2a$10$w8gZ9YkG.00hU3uYg9QkTez1jC1tL2yOqM1xX/4V4cZ5rW3eYkX8i', 'ASESOR', 2, TRUE),
(6, 'asesor3', 'Valeria Quispe', 'asesor3@escall.pe', '$2a$10$w8gZ9YkG.00hU3uYg9QkTez1jC1tL2yOqM1xX/4V4cZ5rW3eYkX8i', 'ASESOR', 3, TRUE);

INSERT INTO tipificaciones_n1 (id, nombre, es_contacto, orden, activo) VALUES
(1, 'Contacto directo', TRUE, 1, TRUE),
(2, 'Contacto indirecto', TRUE, 2, TRUE),
(3, 'No contacto', FALSE, 3, TRUE),
(4, 'Ilocalizado', FALSE, 4, TRUE);

INSERT INTO tipificaciones_n2 (id, n1_id, nombre, requiere_compromiso, orden, activo) VALUES
(1, 1, 'Promesa de pago', TRUE, 1, TRUE),
(2, 1, 'Ya pagó', FALSE, 2, TRUE),
(3, 1, 'Solicita refinanciación', FALSE, 3, TRUE),
(4, 1, 'Negativa de pago', FALSE, 4, TRUE),
(5, 1, 'Volver a llamar', FALSE, 5, TRUE),
(6, 2, 'Mensaje con familiar', FALSE, 1, TRUE),
(7, 2, 'Mensaje con tercero', FALSE, 2, TRUE),
(8, 2, 'Promesa de pago por tercero', TRUE, 3, TRUE),
(9, 3, 'No contesta', FALSE, 1, TRUE),
(10, 3, 'Buzón de voz', FALSE, 2, TRUE),
(11, 3, 'Teléfono apagado', FALSE, 3, TRUE),
(12, 3, 'Cuelga la llamada', FALSE, 4, TRUE),
(13, 4, 'Número equivocado', FALSE, 1, TRUE),
(14, 4, 'Número no existe', FALSE, 2, TRUE),
(15, 4, 'Titular fallecido', FALSE, 3, TRUE);

INSERT INTO clientes (id, tipo_documento, documento, nombres, email, direccion) VALUES
(1, 'DNI', '45879632', 'Juan Carlos Pérez Díaz', 'jperez@gmail.com', 'Av. Arequipa 1420, Lince, Lima'),
(2, 'DNI', '41236587', 'María Elena Flores Ramos', 'mflores@hotmail.com', 'Calle Los Pinos 345, Miraflores, Lima'),
(3, 'DNI', '70125489', 'José Luis Castillo Vega', 'jcastillo@gmail.com', 'Jr. Junín 580, Cercado de Lima'),
(4, 'DNI', '46985231', 'Ana Lucía Gutiérrez Soto', 'agutierrez@gmail.com', 'Av. La Marina 2100, San Miguel, Lima'),
(5, 'DNI', '10458796', 'Pedro Antonio Huamán Cruz', 'phuaman@yahoo.es', 'Av. Javier Prado Este 4500, Surco, Lima'),
(6, 'DNI', '72563148', 'Rosa María Chávez León', 'rchavez@gmail.com', 'Calle Berlín 789, Miraflores, Lima'),
(7, 'DNI', '43698521', 'Luis Alberto Mendoza Ríos', 'lmendoza@outlook.com', 'Av. Brasil 1850, Jesús María, Lima'),
(8, 'DNI', '47852369', 'Carmen Rosa Vargas Ortiz', 'cvargas@gmail.com', 'Av. Universitaria 3200, Los Olivos, Lima');

INSERT INTO telefonos (cliente_id, numero, tipo, activo) VALUES
(1, '987654321', 'CELULAR', TRUE),
(1, '014235890', 'FIJO', TRUE),
(2, '912345678', 'CELULAR', TRUE),
(3, '956321478', 'CELULAR', TRUE),
(4, '998877665', 'CELULAR', TRUE),
(5, '945612378', 'CELULAR', TRUE),
(6, '934567812', 'CELULAR', TRUE),
(7, '976543210', 'CELULAR', TRUE),
(8, '923456789', 'CELULAR', TRUE);

INSERT INTO cuentas (id, cliente_id, numero_operacion, entidad, producto, cartera, cosecha, deuda_total, dias_mora) VALUES
(1, 1, 'OP-100201', 'Banco Andino', 'Tarjeta de crédito', 'Banco Andino - Tarjetas', '2026-08', 4850.50, 45),
(2, 2, 'OP-100202', 'Financiera Sol', 'Préstamo personal', 'Financiera Sol - Consumo', '2026-07', 8920.00, 72),
(3, 3, 'OP-100203', 'Caja Norte', 'Crédito vehicular', 'Caja Norte - Vehicular', '2026-09', 15400.00, 15),
(4, 4, 'OP-100204', 'Banco Andino', 'Tarjeta de crédito', 'Banco Andino - Tarjetas', '2026-08', 3200.00, 95),
(5, 5, 'OP-100205', 'Financiera Sol', 'Préstamo personal', 'Financiera Sol - Consumo', '2026-07', 6740.80, 28),
(6, 6, 'OP-100206', 'Caja Norte', 'Crédito vehicular', 'Caja Norte - Vehicular', '2026-09', 24100.00, 110),
(7, 7, 'OP-100207', 'Banco Andino', 'Préstamo personal', 'Banco Andino - Tarjetas', '2026-08', 5100.00, 35),
(8, 8, 'OP-100208', 'Financiera Sol', 'Línea de crédito', 'Financiera Sol - Consumo', '2026-07', 9800.00, 60);

INSERT INTO asignaciones (cuenta_id, asesor_id, fecha_asignacion, activa) VALUES
(1, 4, '2026-10-01', TRUE),
(2, 4, '2026-10-01', TRUE),
(3, 5, '2026-10-01', TRUE),
(4, 5, '2026-10-01', TRUE),
(5, 6, '2026-10-01', TRUE),
(6, 6, '2026-10-01', TRUE),
(7, 4, '2026-10-01', TRUE),
(8, 5, '2026-10-01', TRUE);

INSERT INTO gestiones (id, cuenta_id, asesor_id, fecha_hora, telefono, tipificacion_n1_id, tipificacion_n2_id, observacion) VALUES
(1, 1, 4, '2026-11-20 10:15:00', '987654321', 1, 1, 'Cliente confirma compromiso de pago para fin de mes por amortización acordada.'),
(2, 2, 4, '2026-11-21 11:30:00', '912345678', 1, 4, 'Titular indica falta de liquidez por el momento; solicita nueva llamada la próxima semana.'),
(3, 3, 5, '2026-11-22 09:45:00', '956321478', 3, 9, 'Teléfono timbra pero no contesta. Se programará segundo intento en horario de la tarde.');

INSERT INTO promesas (gestion_id, cuenta_id, asesor_id, fecha_compromiso, monto, estado) VALUES
(1, 1, 4, '2026-11-30', 1500.00, 'PENDIENTE');

INSERT INTO pagos (cuenta_id, fecha_pago, monto, referencia) VALUES
(1, '2026-11-15', 500.00, 'DEP-BCP-984512'),
(4, '2026-11-18', 350.00, 'TRANSF-IBK-77412');
