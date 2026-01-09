#!/usr/bin/env pwsh

# Script para seedear la BD
$apiPath = "c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\api"
Set-Location $apiPath

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " CREANDO DATOS INICIALES EN BD" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/2] Sincronizando esquema con BD..." -ForegroundColor Yellow
& npx prisma db push --skip-generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en db push" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[2/2] Ejecutando seed..." -ForegroundColor Yellow
& node prisma/seed.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en seed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " ✅ DATOS INICIALES CREADOS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Credenciales de prueba:" -ForegroundColor Cyan
Write-Host "  Email:    admin@magrotec.com" -ForegroundColor White
Write-Host "  Password: Admin123!" -ForegroundColor White
