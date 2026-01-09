@echo off
REM Script para seedear la BD
cd /d "c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\api"

echo ========================================
echo  CREANDO ESQUEMA Y DATOS INICIALES
echo ========================================
echo.

echo [1/2] Sincronizando esquema con BD...
call npx prisma db push --skip-generate

echo.
echo [2/2] Creando datos iniciales...
call npm run db:seed

echo.
echo ========================================
echo  COMPLETADO
echo ========================================
echo.
pause
