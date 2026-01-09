# Script para iniciar Web en modo desarrollo
# Uso: .\START_WEB_DEV.ps1

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Iniciando Web - Ganaderia Regenerativa" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$webPath = "c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\web"

# Navegar al directorio
Set-Location $webPath
Write-Host "[1/2] Ubicado en: $webPath" -ForegroundColor Green

# Iniciar Next.js
Write-Host "[2/2] Iniciando Next.js..." -ForegroundColor Green
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "   Web disponible en:" -ForegroundColor Green
Write-Host "   http://localhost:3000" -ForegroundColor White
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Presiona Ctrl+C para detener" -ForegroundColor Yellow
Write-Host ""

# Ejecutar Next.js
& npm run dev
