@echo off
title Magrotec - Setup & Run
color 0a
cls

echo.
echo ========================================
echo   MAGROTEC - Configuracion Completa
echo ========================================
echo.

REM Ir a carpeta API
cd /d "c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\api"

REM Verificar si node_modules existe
if not exist "node_modules" (
    echo [1/3] Instalando dependencias del API...
    call npm install --legacy-peer-deps
    if errorlevel 1 (
        echo Error instalando API
        pause
        exit /b 1
    )
    echo [1/3] ✓ API instalado
)

REM Ir a carpeta web
cd /d "c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\web"

REM Verificar si node_modules existe
if not exist "node_modules" (
    echo [2/3] Instalando dependencias del Web...
    call npm install --legacy-peer-deps
    if errorlevel 1 (
        echo Error instalando Web
        pause
        exit /b 1
    )
    echo [2/3] ✓ Web instalado
)

REM Crear BD
cd /d "c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\api"
if not exist "prisma\dev.db" (
    echo [3/3] Creando base de datos SQLite...
    call npx prisma generate
    call npx prisma db push --skip-generate
    if errorlevel 1 (
        echo Advertencia: BD puede no estar creada, pero intentaremos continuar
    )
    echo [3/3] ✓ Base de datos configurada
)

echo.
echo ========================================
echo   LEVANTANDO SERVIDORES...
echo ========================================
echo.
echo Abriendo ventanas de terminal...
echo.

REM Levantar API en nueva ventana
cd /d "c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\api"
start "Magrotec API (Puerto 3001)" cmd /k "npm run dev"

REM Esperar un poco
timeout /t 5 /nobreak > nul

REM Levantar Frontend en nueva ventana
cd /d "c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\web"
start "Magrotec Frontend (Puerto 3000)" cmd /k "npm run dev"

timeout /t 3 /nobreak > nul

REM Mostrar info
cls
color 0b
echo.
echo ========================================
echo   ✓ APLICACION LISTA
echo ========================================
echo.
echo   Frontend: http://localhost:3000
echo   API:      http://localhost:3001
echo   Swagger:  http://localhost:3001/api/docs
echo.
echo Credenciales:
echo   Email:    demo@magrotec.com
echo   Password: Demo123!@#
echo.
echo Nota: Espera 10 segundos para que los
echo servidores se inicialicen completamente
echo.
echo ========================================
echo.

REM Abrir navegador
timeout /t 8 /nobreak > nul
start http://localhost:3000

timeout /t 5 /nobreak > nul

echo [✓] Navegador abierto en http://localhost:3000
echo.
echo Para cerrar todo: cierra estas ventanas CMD
echo.
pause
