@echo off
REM Script para limpieza TOTAL y fresh start

echo ========================================
echo  LIMPIEZA TOTAL Y REBUILD
echo ========================================
echo.

cd /d "c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\api"

echo [1/5] Matando procesos Node...
taskkill /F /IM node.exe >nul 2>&1

echo [2/5] Eliminando dist antiguo...
rmdir /s /q dist >nul 2>&1

echo [3/5] Regenerando Prisma Client...
call npx prisma generate --schema=prisma/schema.prisma

echo.
echo [4/5] Compilando...
call npm run build

if errorlevel 1 (
    echo.
    echo ❌ BUILD FALLIDO
    pause
    exit /b 1
)

echo.
echo [5/5] Iniciando API...
echo ========================================
echo  API INICIADO EN PUERTO 3001
echo ========================================
echo.

node dist\apps\api\src\main

pause
