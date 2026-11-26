@echo off
setlocal
cd /d "%~dp0backend"
for /f "usebackq delims=" %%J in (`powershell -NoProfile -Command "$jdk = Get-ChildItem 'C:\Program Files\Eclipse Adoptium' -Directory -Filter 'jdk-21*' -ErrorAction SilentlyContinue | Sort-Object Name -Descending | Select-Object -First 1 -ExpandProperty FullName; if ($jdk) { $jdk }"`) do set "JAVA_HOME=%%J"
if not exist "%JAVA_HOME%\bin\java.exe" (
 for /f "usebackq delims=" %%J in (`powershell -NoProfile -Command "$java = Get-Command java -ErrorAction SilentlyContinue; if ($java) { Split-Path (Split-Path $java.Source -Parent) -Parent }"`) do set "JAVA_HOME=%%J"
)
if not exist "%JAVA_HOME%\bin\java.exe" (
 echo Configura JAVA_HOME para un JDK 21 antes de iniciar.
 pause
 exit /b 1
)
powershell -NoProfile -Command "if ((& '%JAVA_HOME%\bin\java.exe' -version 2^>^&1 | Out-String) -match 'version \"21\.') { exit 0 } else { exit 1 }"
if errorlevel 1 (
 echo Se requiere JDK 21. Configura JAVA_HOME con una instalacion de JDK 21.
 pause
 exit /b 1
)
if not exist .env (
 echo Copia .env.example a .env y completa tu conexion MySQL.
 pause
 exit /b 1
)
call mvnw.cmd spring-boot:run
pause
