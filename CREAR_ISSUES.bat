@echo off
REM Script para crear GitHub Issues automáticamente
REM Uso: Haz doble clic en este archivo

setlocal enabledelayedexpansion

cd /d "c:\Users\DanielVillamizar\GanaderiaRegenerativa"

echo.
echo ════════════════════════════════════════════
echo   CREADOR DE GITHUB ISSUES - GANADERIA
echo ════════════════════════════════════════════
echo.

REM Verificar que gh está instalado
where gh >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ GitHub CLI no está instalado
    echo Instálalo desde: https://cli.github.com
    pause
    exit /b 1
)

REM Verificar autenticación
gh auth status >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ No estás autenticado en GitHub
    echo Ejecuta: gh auth login
    pause
    exit /b 1
)

echo ✅ GitHub CLI instalado y autenticado
echo.

REM Crear labels
echo 🏷️  Creando labels...
set repo=CSA-DanielVillamizar/ganaderia-regenerativa

gh label create epic --repo !repo! --color 3B2A7D 2>nul || echo   ⏭️ Label 'epic' ya existe
gh label create story --repo !repo! --color 0366D6 2>nul || echo   ⏭️ Label 'story' ya existe
gh label create P0 --repo !repo! --color FF4444 2>nul || echo   ⏭️ Label 'P0' ya existe
gh label create P1 --repo !repo! --color FFAA00 2>nul || echo   ⏭️ Label 'P1' ya existe
gh label create P2 --repo !repo! --color 00AA00 2>nul || echo   ⏭️ Label 'P2' ya existe
gh label create P3 --repo !repo! --color 0088FF 2>nul || echo   ⏭️ Label 'P3' ya existe
gh label create backend --repo !repo! --color 427819 2>nul || echo   ⏭️ Label 'backend' ya existe
gh label create frontend --repo !repo! --color 8B008B 2>nul || echo   ⏭️ Label 'frontend' ya existe
gh label create data --repo !repo! --color 1F77B4 2>nul || echo   ⏭️ Label 'data' ya existe
gh label create qa --repo !repo! --color FF7F0E 2>nul || echo   ⏭️ Label 'qa' ya existe

echo ✅ Labels creados
echo.

REM Ejecutar script Python
echo 🚀 Ejecutando script Python...
python scripts/create_issues.py

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ════════════════════════════════════════════
    echo   ✅ COMPLETADO
    echo ════════════════════════════════════════════
    echo.
    echo 📊 Ver issues en GitHub:
    echo https://github.com/!repo!/issues
    echo.
) else (
    echo.
    echo ❌ Error ejecutando script
    echo.
)

pause
