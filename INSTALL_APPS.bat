@echo off
echo ====================================
echo INSTALACION LIMPIA - MAGROTEC MVP
echo ====================================
echo.

REM Instalar Web (sin workspaces)
echo [1/2] Instalando Frontend (Next.js)...
cd /d "c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\web"
call npm install --force
if errorlevel 1 (
    echo ERROR: Instalacion de Web falló
    pause
    exit /b 1
)

echo.
echo [2/2] Instalando API (NestJS) SIN better-sqlite3...
cd /d "c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\api"
call npm install --force
if errorlevel 1 (
    echo ERROR: Instalacion de API falló
    pause
    exit /b 1
)

echo.
echo ====================================
echo INSTALACION COMPLETA
echo ====================================
echo.
echo Ahora puedes iniciar los servidores con START_SERVERS.bat
echo.
pause
