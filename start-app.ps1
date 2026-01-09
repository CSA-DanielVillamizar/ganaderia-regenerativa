#!/usr/bin/env pwsh
# Script para levantar la aplicación completa

Write-Host "🔧 Instalando dependencias..." -ForegroundColor Yellow
Set-Location "c:\Users\DanielVillamizar\GanaderiaRegenerativa"

if (-not (Test-Path "node_modules")) {
    Write-Host "  - Root dependencies..."
    & npm install --legacy-peer-deps 2>&1 | Out-Null
}

if (-not (Test-Path "apps\api\node_modules")) {
    Write-Host "  - API dependencies..."
    Set-Location "apps\api"
    & npm install --legacy-peer-deps 2>&1 | Out-Null
    Set-Location "..\.."
}

if (-not (Test-Path "apps\web\node_modules")) {
    Write-Host "  - Web dependencies..."
    Set-Location "apps\web"
    & npm install --legacy-peer-deps 2>&1 | Out-Null
    Set-Location "..\.."
}

Write-Host "✅ Dependencias instaladas" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Configurando base de datos..." -ForegroundColor Yellow
Set-Location "apps\api"

# Generar cliente Prisma
& npx prisma generate 2>&1 | Out-Null

# Crear BD
if (-not (Test-Path "prisma\dev.db")) {
    & npx prisma db push --skip-generate 2>&1 | Out-Null
}

Set-Location "..\.."

Write-Host "✅ Base de datos lista" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 LEVANTANDO APLICACIÓN EN 5 SEGUNDOS..." -ForegroundColor Cyan
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "  API:      http://localhost:3001" -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Levantar en background
$apiProcess = Start-Process powershell -ArgumentList "-NoExit -Command `"cd 'c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\api'; npm run dev`"" -PassThru
Start-Sleep -Seconds 3

$webProcess = Start-Process powershell -ArgumentList "-NoExit -Command `"cd 'c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\web'; npm run dev`"" -PassThru

Write-Host "✅ API proceso iniciado (PID: $($apiProcess.Id))" -ForegroundColor Green
Write-Host "✅ Web proceso iniciado (PID: $($webProcess.Id))" -ForegroundColor Green
Write-Host ""
Write-Host "Espera 10 segundos a que los servidores inicien..." -ForegroundColor Yellow

Start-Sleep -Seconds 10

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "        ✅ APLICACIÓN LISTA PARA USAR" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 URLs:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" 
Write-Host "   API:      http://localhost:3001"
Write-Host "   Swagger:  http://localhost:3001/api/docs"
Write-Host ""
Write-Host "🔐 Login:" -ForegroundColor Yellow
Write-Host "   Email:    demo@magrotec.com"
Write-Host "   Password: Demo123!@#"
Write-Host ""
Write-Host "💾 BD: SQLite en apps/api/prisma/dev.db"
Write-Host ""
