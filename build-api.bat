@echo off
setlocal enabledelayedexpansion

REM Limpieza inicial
echo [1/5] Limpiando dist...
cd /d "C:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\api"
if exist dist ( rmdir /s /q dist )

REM Compilar
echo [2/5] Compilando API...
call npm run build
if !errorlevel! neq 0 (
    echo ❌ Build falló
    exit /b 1
)

REM Tests
echo [3/5] Ejecutando tests...
call npm run test:cov
if !errorlevel! neq 0 (
    echo ⚠️ Tests con fallos (esperado)
)

REM Lint
echo [4/5] Verificando lint...
call npm run lint
if !errorlevel! neq 0 (
    echo ⚠️ Lint issues encontrados
)

REM Intentar iniciar
echo [5/5] Probando startup...
start "" node dist/src/main.js
timeout /t 3

echo.
echo ✅ Completado. Revisa arriba los resultados.
