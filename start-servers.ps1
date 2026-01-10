#!/bin/pwsh
# Script para iniciar backend y frontend

Write-Host "🚀 Iniciando Ganadería Regenerativa..." -ForegroundColor Green
Write-Host ""

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $rootDir

# Primero iniciar el backend
Write-Host "⚙️  Backend iniciando en puerto 3001..." -ForegroundColor Cyan
Set-Location "$rootDir\apps\api"

$backendProcess = Start-Process -NoNewWindow -FilePath "node" -ArgumentList "dist/apps/api/src/main.js" -PassThru
Start-Sleep -Seconds 3

# Luego el frontend
Write-Host "🎨 Frontend iniciando en puerto 3000..." -ForegroundColor Cyan
Set-Location "$rootDir\apps\web"

$frontendProcess = Start-Process -NoNewWindow -FilePath "npx" -ArgumentList "next", "dev", "-p", "3000" -PassThru

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "✅ SERVICIOS ACTIVOS" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Frontend:  http://localhost:3000" -ForegroundColor Yellow
Write-Host "📚 API Docs:  http://localhost:3001/api/docs" -ForegroundColor Yellow
Write-Host "🔑 Login:     http://localhost:3000/auth/login" -ForegroundColor Yellow
Write-Host ""
Write-Host "Credenciales:" -ForegroundColor Cyan
Write-Host "  Email: admin@magrotec.com"
Write-Host "  Pass:  Admin123!"
Write-Host ""
Write-Host "Presiona Ctrl+C para detener los servidores" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Green

# Esperar a que finalicen
Wait-Process -InputObject $backendProcess, $frontendProcess
