@echo off
setlocal enabledelayedexpansion

cd /d "c:\Users\DanielVillamizar\GanaderiaRegenerativa"

echo [%date% %time%] === FASE 2: LIMPIEZA ===
if exist node_modules (
    echo Removiendo root\node_modules...
    rmdir /s /q node_modules >nul 2>&1
)
if exist package-lock.json (
    echo Removiendo root\package-lock.json...
    del package-lock.json >nul 2>&1
)
if exist apps\api\node_modules (
    echo Removiendo apps\api\node_modules...
    rmdir /s /q apps\api\node_modules >nul 2>&1
)
if exist apps\web\node_modules (
    echo Removiendo apps\web\node_modules...
    rmdir /s /q apps\web\node_modules >nul 2>&1
)
if exist apps\api\.prisma (
    echo Removiendo apps\api\.prisma...
    rmdir /s /q apps\api\.prisma >nul 2>&1
)

echo [%date% %time%] npm cache clean
call npm cache clean --force >nul 2>&1

echo [%date% %time%] === FASE 3: INSTALL ROOT ===
call npm install > install_root.log 2>&1
if !errorlevel! equ 0 (
    echo [OK] Root install exitcode 0
) else (
    echo [ERROR] Root install exitcode !errorlevel!
)
echo Last 50 lines of install_root.log:
powershell -Command "Get-Content 'install_root.log' -Tail 50"

echo.
echo [%date% %time%] === FASE 3b: INSTALL API ===
cd apps\api
call npm install > install_api.log 2>&1
if !errorlevel! equ 0 (
    echo [OK] API install exitcode 0
) else (
    echo [ERROR] API install exitcode !errorlevel!
)
echo Last 50 lines of install_api.log:
powershell -Command "Get-Content 'install_api.log' -Tail 50"

echo.
echo [%date% %time%] === FASE 3c: INSTALL WEB ===
cd ..\web
call npm install > install_web.log 2>&1
if !errorlevel! equ 0 (
    echo [OK] Web install exitcode 0
) else (
    echo [ERROR] Web install exitcode !errorlevel!
)
echo Last 50 lines of install_web.log:
powershell -Command "Get-Content 'install_web.log' -Tail 50"

echo.
echo [%date% %time%] === COMPLETE ===
cd ..\..\..
pause
