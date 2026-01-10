#!/bin/pwsh
# Script para iniciar ambos servidores correctamente

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "   🚀 INICIANDO GANADERÍA REGENERATIVA" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

$rootPath = "c:\Users\DanielVillamizar\GanaderiaRegenerativa"
Set-Location $rootPath

# Iniciar Backend (puerto 3001)
Write-Host "1️⃣  Backend en puerto 3001..." -ForegroundColor Cyan
Start-Process -FilePath "powershell" -ArgumentList "-Command","cd '$($rootPath)\apps\api'; node dist/apps/api/src/main.js" -WindowStyle Hidden
Start-Sleep -Seconds 3

# Iniciar Frontend (puerto 3000)
Write-Host "2️⃣  Frontend en puerto 3000..." -ForegroundColor Cyan
Start-Process -FilePath "powershell" -ArgumentList "-Command","cd '$($rootPath)\apps\web'; npx next dev -p 3000" -WindowStyle Normal

Write-Host ""
Write-Host "⏳ Esperando que los servidores estén listos..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "✅ SERVIDORES EN LÍNEA" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐  Frontend:    http://localhost:3000" -ForegroundColor Cyan
Write-Host "📚  API Docs:    http://localhost:3001/api/docs" -ForegroundColor Cyan
Write-Host "🔑  Login:       http://localhost:3000/auth/login" -ForegroundColor Cyan
Write-Host ""
Write-Host "Credenciales de prueba:" -ForegroundColor Yellow
Write-Host "  Email:    admin@magrotec.com" -ForegroundColor White
Write-Host "  Password: Admin123!" -ForegroundColor White
Write-Host ""
Write-Host "================================================" -ForegroundColor Green

Write-Host ""
