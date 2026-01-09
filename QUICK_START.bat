@echo off
echo ============================================
echo INSTALACION Y EJECUCION RAPIDA
echo ============================================
echo.

cd /d c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\web
echo [1/3] Instalando Frontend...
call npm install --legacy-peer-deps
if errorlevel 1 (
    echo ERROR en frontend
    pause
    exit /b 1
)
echo Frontend OK!

cd /d c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\api
echo [2/3] Instalando API...
call npm install --legacy-peer-deps  
if errorlevel 1 (
    echo ERROR en API
    pause
    exit /b 1
)
echo API OK!

echo [3/3] Iniciando servidores...
start "API - Puerto 3001" cmd /k "cd /d c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\api && npm run dev"
timeout /t 5 /nobreak
start "Frontend - Puerto 3000" cmd /k "cd /d c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\web && npm run dev"

echo.
echo ============================================
echo APLICACION INICIADA
echo ============================================
echo Frontend: http://localhost:3000
echo API: http://localhost:3001/api/docs
echo.
echo Credenciales: demo@magrotec.com / Demo123!@#
echo.
pause
