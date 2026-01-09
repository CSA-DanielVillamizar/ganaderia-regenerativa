@echo off
echo ============================================
echo   Ganaderia Regenerativa - Inicio Rapido
echo ============================================
echo.

REM Verifica si Node.js esta instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js no esta instalado
    echo Por favor instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Verificando dependencias...
cd "%~dp0apps\api"
if not exist "node_modules\" (
    echo Instalando dependencias del API...
    call npm install
)

cd "%~dp0apps\web"
if not exist "node_modules\" (
    echo Instalando dependencias del Web...
    call npm install
)

echo.
echo [2/4] Generando Prisma Client...
cd "%~dp0apps\api"
call npx prisma generate

echo.
echo [3/4] Compilando aplicaciones...
cd "%~dp0apps\api"
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Fallo la compilacion del API
    pause
    exit /b 1
)

cd "%~dp0apps\web"
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Fallo la compilacion del Web
    pause
    exit /b 1
)

echo.
echo [4/4] Iniciando servidores...
echo.
echo ============================================
echo   API: http://localhost:3001/api/v1
echo   Web: http://localhost:3000
echo   Health: http://localhost:3001/health
echo ============================================
echo.

REM Inicia API en background
start "API - Ganaderia" /MIN cmd /c "cd /d %~dp0apps\api && node dist\main.js"

REM Espera 3 segundos
timeout /t 3 /nobreak >nul

REM Inicia Web
cd "%~dp0apps\web"
call npm run start

pause
