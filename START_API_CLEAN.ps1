#!/usr/bin/env pwsh

# Script para iniciar el API con .env correcto

$apiPath = "c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\api"
Set-Location $apiPath

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " INICIANDO API CON BD SQLITE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar .env
Write-Host "Verificando .env..." -ForegroundColor Yellow
if (Test-Path ".env") {
    $dbUrl = Select-String -Path ".env" -Pattern "DATABASE_URL" | Select-Object -First 1
    Write-Host "  $dbUrl" -ForegroundColor White
} else {
    Write-Host "❌ No existe .env" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Compilando API..." -ForegroundColor Yellow
& npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build fallido" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " ✅ API INICIADO EN PUERTO 3001" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Iniciando servidor..." -ForegroundColor Yellow
& node dist/apps/api/src/main
