@echo off
REM =================================================================
REM MAGROTEC MVP - COMPLETE SETUP SCRIPT  
REM =================================================================

setlocal enabledelayedexpansion

echo.
echo ========== MAGROTEC MVP - Setup Application ==========
echo.

REM Navigate to root directory
cd /d "c:\Users\DanielVillamizar\GanaderiaRegenerativa"

echo [1/5] Installing root dependencies (Turbo, TypeScript, ESLint)...
call npm install --force
if errorlevel 1 (
    echo ERROR: Root npm install failed
    pause
    exit /b 1
)

echo.
echo [2/5] Installing API dependencies...
cd /d "c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\api"
call npm install --force
if errorlevel 1 (
    echo ERROR: API npm install failed
    pause
    exit /b 1
)

echo.
echo [3/5] Installing Web dependencies...
cd /d "c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\web"
call npm install --force
if errorlevel 1 (
    echo ERROR: Web npm install failed
    pause
    exit /b 1
)

echo.
echo [4/5] Building API...
cd /d "c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\api"
call npm run build
if errorlevel 1 (
    echo WARNING: API build failed, but continuing...
)

echo.
echo [5/5] Starting services...
echo.
echo ========== SERVICES STARTING ==========
echo.
echo Frontend will start on http://localhost:3000
echo API will start on http://localhost:3001/api/docs
echo.

REM Start API in separate window
start "Magrotec API Server" cmd /k cd /d "c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\api" ^&^& npm run dev

REM Wait a moment for API to start
timeout /t 5 /nobreak

REM Start Frontend in separate window
start "Magrotec Web Client" cmd /k cd /d "c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\web" ^&^& npm run dev

echo.
echo ========== SETUP COMPLETE ==========
echo.
echo Applications are starting in separate windows.
echo Please wait 10-15 seconds for both servers to initialize.
echo.
pause
