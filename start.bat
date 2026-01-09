@echo off
echo Levantando aplicacion...
echo.

start "API NestJS" cmd /k "cd /d c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\api && npm run dev"

timeout /t 5 /nobreak > nul

start "Frontend Next.js" cmd /k "cd /d c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\web && npm run dev"

timeout /t 8 /nobreak > nul

echo.
echo ============================================
echo   APLICACION LEVANTADA
echo ============================================
echo.
echo Frontend: http://localhost:3000
echo API:      http://localhost:3001
echo Swagger:  http://localhost:3001/api/docs
echo.
echo Credenciales:
echo   Email:    demo@magrotec.com
echo   Password: Demo123!@#
echo.
echo ============================================
echo.

start http://localhost:3000

pause
