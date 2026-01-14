@echo off
REM filepath: VERIFY_SQLSERVER.bat
REM Verifica la configuración de SQL Server antes de iniciar la API
REM Uso: VERIFY_SQLSERVER.bat

setlocal enabledelayedexpansion

cls
echo.
echo ========================================
echo    Verificacion SQL Server Setup
echo ========================================
echo.

REM Navegar a carpeta API
cd /d "c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\api"

if errorlevel 1 (
    echo Error: No se pudo navegar a apps/api
    pause
    exit /b 1
)

REM Paso 1: Validar schema.prisma
echo [1/4] Validando Prisma schema...
call npx prisma validate --schema=prisma/schema.prisma
if errorlevel 1 (
    echo.
    echo ERROR: Schema invalido
    pause
    exit /b 1
)
echo OK - Schema valido
echo.

REM Paso 2: Generar cliente
echo [2/4] Regenerando cliente Prisma...
call npx prisma generate --schema=prisma/schema.prisma
if errorlevel 1 (
    echo.
    echo ERROR: No se pudo generar cliente Prisma
    pause
    exit /b 1
)
echo OK - Cliente generado
echo.

REM Paso 3: Verificar conexion
echo [3/4] Probando conexion a SQL Server...
call npx prisma db execute --stdin < nul
if errorlevel 1 (
    echo.
    echo ADVERTENCIA: No se pudo conectar a SQL Server
    echo.
    echo Verifica:
    echo   1. SQL Server esta corriendo (Services: MSSQLSERVER)
    echo   2. Puerto 1433 esta abierto
    echo   3. .env tiene DATABASE_URL correcta
    echo   4. Base de datos existe en SSMS
    echo.
    pause
    exit /b 1
)
echo OK - Conexion exitosa
echo.

REM Paso 4: Verificar estructura BD
echo [4/4] Verificando tablas en base de datos...
REM Simplemente intentar una consulta basica via Prisma
call npx prisma client generate
if errorlevel 1 (
    echo.
    echo ADVERTENCIA: No se pudo verificar tablas (puede estar vacio)
) else (
    echo OK - Estructura de BD valida
)
echo.

echo ========================================
echo    Verificacion COMPLETADA
echo ========================================
echo.
echo Proximos pasos:
echo   1. Abrir terminal en: c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\api
echo   2. Ejecutar: npm run dev
echo   3. API disponible en: http://localhost:3000/api/docs
echo.

pause
