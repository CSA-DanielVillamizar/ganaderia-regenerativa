@echo off
title API - Puerto 3001
cd /d "c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\api"

echo Compilando API...
call npm run build

if errorlevel 1 (
    echo Error en compilacion
    pause
    exit /b 1
)

echo.
echo Iniciando API en http://localhost:3001
echo Health Check: http://localhost:3001/health
echo.

node dist\apps\api\src\main
pause
