@echo off
setlocal
cd /d "%~dp0"
node scripts\servir-frontend.mjs
pause
