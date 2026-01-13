@echo off
cd /d c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\api
echo [INFO] Directorio actual: %CD%
echo [INFO] Limpiando dist...
if exist dist rmdir /s /q dist
echo [INFO] Compilando con nest build...
call npx nest build
if errorlevel 1 (
    echo [ERROR] Compilación fallida
    exit /b 1
)
echo [INFO] Archivo compilado. Iniciando servidor...
node dist\apps\api\src\main.js
