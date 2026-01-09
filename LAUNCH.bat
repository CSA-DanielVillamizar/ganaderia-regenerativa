@echo off
setlocal enabledelayedexpansion

REM BD Setup
cd /d "c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\api"

echo Generando cliente Prisma...
call npx prisma generate
if !errorlevel! neq 0 (
    echo Error en prisma generate
    exit /b 1
)

echo Creando base de datos SQLite...
call npx prisma db push --accept-data-loss
if !errorlevel! neq 0 (
    echo Error en prisma db push
    exit /b 1
)

echo BD lista!

REM Levanta API
echo.
echo Levantando API en puerto 3001...
timeout /t 2 /nobreak > nul
start "API NestJS" cmd /k "cd /d c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\api && npm run dev"

REM Levanta Web
echo Esperando 5 segundos para API...
timeout /t 5 /nobreak > nul
echo Levantando Frontend en puerto 3000...
start "Frontend Next.js" cmd /k "cd /d c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\web && npm run dev"

REM Info
echo.
echo ============================================
echo   ✓ APLICACION EN PROCESO DE INICIO
echo ============================================
echo.
echo Espera 10 segundos a que inicialicen...
echo.
timeout /t 10 /nobreak > nul

echo.
echo ============================================
echo   APLICACION LISTA
echo ============================================
echo.
echo Frontend: http://localhost:3000
echo API:      http://localhost:3001
echo Swagger:  http://localhost:3001/api/docs
echo.
echo Login:
echo   Email:    demo@magrotec.com
echo   Password: Demo123!@#
echo.
echo ============================================
echo.
start http://localhost:3000

endlocal
