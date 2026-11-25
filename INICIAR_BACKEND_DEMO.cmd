@echo off
setlocal
cd /d "%~dp0backend"
if not exist "%JAVA_HOME%\bin\java.exe" (
 for /f "usebackq delims=" %%J in (`powershell -NoProfile -Command "$java = Get-Command java -ErrorAction SilentlyContinue; if ($java) { Split-Path (Split-Path $java.Source -Parent) -Parent }"`) do set "JAVA_HOME=%%J"
)
if not exist "%JAVA_HOME%\bin\java.exe" (
 echo Configura JAVA_HOME para un JDK 21 antes de iniciar.
 pause
 exit /b 1
)
call mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=demo
pause
