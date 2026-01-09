@echo off
REM Script para compilar, lanzar servicios y probar login
REM Abre 3 ventanas: API, Web, y prueba

echo ========================================
echo  INICIANDO SERVICIOS PARA PRUEBA LOGIN
echo ========================================
echo.

REM Abrir Terminal 1: API
echo [1/3] Compilando y lanzando API en puerto 3001...
start "API Server" cmd /k "cd c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\api && npm run build && echo. && echo API Build completado. Iniciando servidor... && echo. && timeout /t 3 && node dist\apps\api\src\main"

REM Esperar a que API compile
timeout /t 15

REM Abrir Terminal 2: Web
echo [2/3] Lanzando Web en puerto 3000...
start "Web Server" cmd /k "cd c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\web && npm run dev"

REM Esperar a que Web inicie
timeout /t 10

REM Abrir navegador con login
echo [3/3] Abriendo navegador para prueba de login...
timeout /t 3
start "" "http://localhost:3000"

echo.
echo ========================================
echo  SERVICIOS INICIADOS
echo ========================================
echo  - API:   http://localhost:3001
echo  - Web:   http://localhost:3000
echo  - Login: admin@magrotec.com / Admin123!
echo ========================================
echo.
pause
