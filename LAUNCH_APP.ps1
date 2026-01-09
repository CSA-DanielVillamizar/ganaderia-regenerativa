# SCRIPT DE INSTALACION Y EJECUCION COMPLETA
# ==========================================

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "MAGROTEC MVP - INSTALACION Y EJECUCION" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

$ErrorActionPreference = "Continue"
$rootPath = "c:\Users\DanielVillamizar\GanaderiaRegenerativa"

# PASO 1: Instalar Frontend
Write-Host "[1/4] Instalando FRONTEND..." -ForegroundColor Yellow
Set-Location "$rootPath\apps\web"

if (Test-Path "node_modules") {
    Write-Host "  Limpiando instalacion anterior..." -ForegroundColor Gray
    Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
}
if (Test-Path "package-lock.json") {
    Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
}

Write-Host "  Ejecutando npm install..." -ForegroundColor Gray
npm install --legacy-peer-deps 2>&1 | Out-File -FilePath "$rootPath\install-web.log"

if ($LASTEXITCODE -eq 0) {
    Write-Host "  Frontend instalado OK" -ForegroundColor Green
} else {
    Write-Host "  ERROR en instalacion de Frontend" -ForegroundColor Red
    Write-Host "  Revisa el archivo: install-web.log" -ForegroundColor Red
    exit 1
}

# PASO 2: Instalar API
Write-Host "`n[2/4] Instalando API..." -ForegroundColor Yellow
Set-Location "$rootPath\apps\api"

if (Test-Path "node_modules") {
    Write-Host "  Limpiando instalacion anterior..." -ForegroundColor Gray
    Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
}
if (Test-Path "package-lock.json") {
    Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
}

Write-Host "  Ejecutando npm install..." -ForegroundColor Gray
npm install --legacy-peer-deps 2>&1 | Out-File -FilePath "$rootPath\install-api.log"

if ($LASTEXITCODE -eq 0) {
    Write-Host "  API instalado OK" -ForegroundColor Green
} else {
    Write-Host "  ERROR en instalacion de API" -ForegroundColor Red
    Write-Host "  Revisa el archivo: install-api.log" -ForegroundColor Red
    exit 1
}

# PASO 3: Configurar Base de Datos
Write-Host "`n[3/4] Configurando Base de Datos..." -ForegroundColor Yellow
Set-Location "$rootPath\apps\api"

if (-not (Test-Path "prisma\dev.db")) {
    Write-Host "  Creando archivo de base de datos..." -ForegroundColor Gray
    New-Item -ItemType File -Path "prisma\dev.db" -Force | Out-Null
}

Write-Host "  Base de datos lista" -ForegroundColor Green

# PASO 4: Iniciar Servidores
Write-Host "`n[4/4] Iniciando Servidores..." -ForegroundColor Yellow

Write-Host "  Iniciando API en puerto 3001..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootPath\apps\api'; Write-Host 'API - Puerto 3001' -ForegroundColor Cyan; npm run dev"

Start-Sleep -Seconds 5

Write-Host "  Iniciando Frontend en puerto 3000..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootPath\apps\web'; Write-Host 'FRONTEND - Puerto 3000' -ForegroundColor Cyan; npm run dev"

Write-Host "`n============================================" -ForegroundColor Green
Write-Host " APLICACION LEVANTADA EXITOSAMENTE" -ForegroundColor Green
Write-Host "============================================`n" -ForegroundColor Green

Write-Host " Frontend: " -NoNewline
Write-Host "http://localhost:3000" -ForegroundColor Cyan
Write-Host " API: " -NoNewline  
Write-Host "http://localhost:3001" -ForegroundColor Cyan
Write-Host " Swagger: " -NoNewline
Write-Host "http://localhost:3001/api/docs" -ForegroundColor Cyan

Write-Host "`nCredenciales:" -ForegroundColor Yellow
Write-Host "  demo@magrotec.com"
Write-Host "  Demo123!@#"

Write-Host "`nEspera 15-20 segundos para que los servidores inicien completamente." -ForegroundColor Gray
Write-Host "Las ventanas de API y Frontend se abrieron en segundo plano.`n" -ForegroundColor Gray

Set-Location $rootPath
