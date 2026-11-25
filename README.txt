================================================================================
  PROYECTO FINAL: INTEGRACIÓN FULL STACK (AVANCE 4 / ENTREGA FINAL)
  CRM DE COBRANZAS Y GESTIÓN DE CARTERA - ESCALL PERÚ S.A.C.
  Curso: Desarrollo Web Integrado (100000ST61) - UTP 2026-II
================================================================================

1. DESCRIPCIÓN GENERAL
--------------------------------------------------------------------------------
Solución web integral que optimiza los procesos de contacto, negociación,
seguimiento y recuperación de deuda de la agencia de cobranzas ESCALL PERÚ S.A.C.
Integra una interfaz moderna tipo SaaS (Linear/Stripe) en Angular con un backend
REST robusto en Spring Boot asegurado con JWT y persistencia relacional en MySQL.

2. TECNOLOGÍAS Y VERSIONES UTILIZADAS
--------------------------------------------------------------------------------
- Frontend:
  * Angular 20.0 (Standalone Components, Signals, Reactive Forms, Control Flow)
  * TypeScript 5.8
  * Tailwind CSS 3.4
  * Node.js v22.18 / npm v11.16
- Backend:
  * Java 21 LTS (Eclipse Adoptium OpenJDK 21)
  * Spring Boot 4.1.1
  * Spring Data JPA / Hibernate 7.4.5
  * Spring Security 6 (OAuth2 Resource Server + JWT Nimbus JOSE)
  * Lombok & Jakarta Validation
- Base de Datos:
  * MySQL 8.0 (Motor InnoDB, codificación UTF-8 mb4)
  * H2 Database (motor en memoria para suite de pruebas TDD)
- Contenedores & Despliegue:
  * Docker Engine v28 & Docker Compose v2.33
  * Nginx Alpine (servidor web proxy estático para Angular en contenedor)

3. PUERTOS Y DIRECCIONES DE ACCESO
--------------------------------------------------------------------------------
- Aplicación Frontend (Angular / Nginx):
  URL: http://localhost:4200

- Backend REST API (Spring Boot):
  URL Base: http://localhost:8080/api
  Swagger / Health Check: http://localhost:8080/actuator/health
  Recurso REST Público Mínimo (S14): http://localhost:8080/api/publico/saludo

- Base de Datos MySQL:
  Host: localhost
  Puerto Host: 3310 (Mapeado a 3306 en contenedor Docker para evitar conflictos)
  Base de Datos: escall_avance3
  Usuario / Password por defecto: escall_app / 2a_QNDv1iY9CyWaJSyHCrsMi3dJeX9Hu

4. USUARIOS DE DEMOSTRACIÓN Y PRUEBA (SEED DATA)
--------------------------------------------------------------------------------
Rol             | Usuario    | Contraseña   | Alcance operativo
----------------+------------+--------------+----------------------------------
ADMIN           | admin      | Admin12345   | Acceso total, altas y cargas CSV
SUPERVISOR      | sgarcia    | Clave12345   | Supervisa asesores de su equipo
SUPERVISOR      | mrojas     | Clave12345   | Supervisa asesores asignados
ASESOR          | asesor1    | Clave12345   | Gestión de su cartera asignada
ASESOR          | asesor2    | Clave12345   | Gestión de cuentas asignadas
ASESOR          | asesor3    | Clave12345   | Cartera asignada BCP/BBVA

5. ORDEN DE ARRANQUE Y PASOS DE EJECUCIÓN
--------------------------------------------------------------------------------
Existen dos formas sencillas de ejecutar el proyecto:

OPCIÓN A: Con Docker Compose (Recomendado, 100 % automático y reproducible)
---------------------------------------------------------------------------
1. Asegurarse de tener Docker Desktop iniciado.
2. Abrir una terminal en la raíz del proyecto (C:\GitHub\Escall_Mamani_NomProyecto).
3. Ejecutar:
     docker compose up --build -d
4. El contenedor levantará en orden automático:
     a) escall-mysql (puerto 3310)
     b) escall-backend (puerto 8080)
     c) escall-frontend (puerto 4200)
5. Abrir el navegador en http://localhost:4200.

OPCIÓN B: Ejecución Local Manual (Desarrollo)
--------------------------------------------
1. Base de datos MySQL:
   Importar el script de base de datos ejecutando en terminal:
     mysql -u root -p < database/script_base_datos.sql

2. Backend Spring Boot (Java 21):
   Abrir terminal en la carpeta 'backend/' y ejecutar:
     $env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot"  # (Windows)
     .\mvnw.cmd spring-boot:run

   * Nota: Para ejecutar sin MySQL usando base de datos en memoria H2:
     .\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=demo

3. Frontend Angular (Angular 20):
   Abrir terminal en la carpeta 'frontend/' y ejecutar:
     npm install
     npm start
   El servidor de desarrollo iniciará en http://localhost:4200 con hot-reload.

6. ESTRUCTURA DE ARCHIVOS DE LA ENTREGA
--------------------------------------------------------------------------------
PROYECTO_FINAL/
├── frontend/                     # Código fuente del Frontend Angular 20
├── backend/                      # Código fuente del Backend Spring Boot 4
├── database/
│   ├── script_base_datos.sql     # Script DDL + DML completo para MySQL
│   ├── 01_esquema.sql            # Esquema relacional base
│   └── datos_ficticios_5.csv     # Plantilla de ejemplo de cartera
├── informe/
│   └── informe_tecnico_final.md  # Informe técnico consolidado (13 rubros UTP)
├── docker-compose.yml            # Orquestación de contenedores
└── README.txt                    # Guía técnica de arranque y verificación
