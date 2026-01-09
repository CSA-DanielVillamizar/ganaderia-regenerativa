@echo off
echo ============================================
echo   Ganaderia Regenerativa - Modo Desarrollo
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

echo [1/3] Verificando dependencias...
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
echo [2/3] Generando Prisma Client...
cd "%~dp0apps\api"
call npx prisma generate

echo.
echo [3/3] Iniciando servidores en modo desarrollo...
echo.
echo ============================================
echo   API: http://localhost:3001/api/v1
echo   Web: http://localhost:3000
echo   Health: http://localhost:3001/health
echo ============================================
echo.
echo Presiona Ctrl+C para detener los servidores
echo.

REM Inicia API en background con watch mode
start "API DEV - Ganaderia" cmd /c "cd /d %~dp0apps\api && npm run dev"

REM Espera 5 segundos para que compile
timeout /t 5 /nobreak >nul

REM Inicia Web en foreground
cd "%~dp0apps\web"
call npm run dev

pause
