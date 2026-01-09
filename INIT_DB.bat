@echo off
cd /d "c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\api"

echo ========================================
echo  INICIALIZANDO BASE DE DATOS
echo ========================================
echo.

echo [1/3] Eliminando BD anterior...
del /f /q "prisma\dev.db" >nul 2>&1

echo [2/3] Creando esquema...
call npx prisma db push --skip-generate

echo.
echo [3/3] Insertando datos iniciales...
call node prisma/seed.js

echo.
echo ========================================
echo  COMPLETADO
echo ========================================
echo.
echo Credenciales de prueba:
echo   Email:    admin@magrotec.com
echo   Password: Admin123!
echo.
pause
