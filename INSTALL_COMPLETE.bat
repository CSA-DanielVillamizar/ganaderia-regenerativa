@echo off
echo ============================================
echo MAGROTEC MVP - INSTALACION COMPLETA
echo ============================================
echo.
echo Este proceso puede tomar 5-10 minutos.
echo NO cierres esta ventana hasta que termine.
echo.
pause

REM Navegar al directorio web
echo.
echo [1/2] Instalando FRONTEND (Next.js)...
echo Directorio: apps\web
cd /d "c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\web"

REM Limpiar instalacion anterior
if exist node_modules (
    echo Limpiando node_modules anterior...
    rd /s /q node_modules
)
if exist package-lock.json (
    del /f /q package-lock.json
)

REM Instalar
echo Instalando dependencias...
call npm install
if errorlevel 1 (
    echo.
    echo ERROR: La instalacion del FRONTEND fallo.
    echo Revisa los mensajes de error arriba.
    pause
    exit /b 1
)

echo.
echo Frontend instalado exitosamente!
echo.

REM Navegar al directorio API
echo [2/2] Instalando API (NestJS)...
echo Directorio: apps\api
cd /d "c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\api"

REM Limpiar instalacion anterior
if exist node_modules (
    echo Limpiando node_modules anterior...
    rd /s /q node_modules
)
if exist package-lock.json (
    del /f /q package-lock.json
)

REM Instalar
echo Instalando dependencias...
call npm install
if errorlevel 1 (
    echo.
    echo ERROR: La instalacion del API fallo.
    echo Revisa los mensajes de error arriba.
    pause
    exit /b 1
)

echo.
echo API instalado exitosamente!
echo.
echo ============================================
echo INSTALACION COMPLETADA CON EXITO
echo ============================================
echo.
echo Ahora puedes ejecutar START_SERVERS.bat
echo para iniciar la aplicacion.
echo.
pause
