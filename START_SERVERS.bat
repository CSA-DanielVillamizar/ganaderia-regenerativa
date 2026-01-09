@echo off
echo ====================================
echo MAGROTEC MVP - INICIAR SERVIDORES
echo ====================================
echo.
echo Este script abrirá 2 ventanas separadas:
echo  - API en puerto 3001
echo  - Frontend en puerto 3000
echo.
pause

REM Iniciar API
start "MAGROTEC API - Puerto 3001" cmd /k "cd /d c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\api && npm run dev"

REM Esperar 5 segundos
timeout /t 5 /nobreak

REM Iniciar Frontend
start "MAGROTEC Frontend - Puerto 3000" cmd /k "cd /d c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\web && npm run dev"

echo.
echo ====================================
echo SERVIDORES INICIADOS
echo ====================================
echo.
echo API: http://localhost:3001/api/docs
echo Frontend: http://localhost:3000
echo.
echo Credenciales:
echo   demo@magrotec.com
echo   Demo123!@#
echo.
echo Las ventanas se abrieron por separado.
echo Espera 10-15 segundos para que los servidores inicien completamente.
echo.
pause
