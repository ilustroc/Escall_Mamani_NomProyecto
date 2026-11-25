# Etapa 1: Compilación del backend con Maven y Java 21
FROM maven:3.9.9-eclipse-temurin-21 AS builder
WORKDIR /build

# Copiar descriptor de dependencias
COPY pom.xml ./

# Descargar dependencias para cachear capas
RUN mvn dependency:go-offline -B || true

# Copiar código fuente y compilar JAR
COPY src ./src
RUN mvn clean package -DskipTests -B

# Etapa 2: Imagen final ligera con Java 21 JRE
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copiar el artefacto generado
COPY --from=builder /build/target/crm-cobranzas-*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
