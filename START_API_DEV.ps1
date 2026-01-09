# Script para iniciar API en modo desarrollo
# Uso: .\START_API_DEV.ps1

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Iniciando API - Ganaderia Regenerativa" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$apiPath = "c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\api"

# Navegar al directorio
Set-Location $apiPath
Write-Host "[1/3] Ubicado en: $apiPath" -ForegroundColor Green

# Limpiar dist si existe
if (Test-Path "dist") {
    Write-Host "[2/3] Limpiando carpeta dist..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
} else {
    Write-Host "[2/3] Carpeta dist no existe (primera ejecucion)" -ForegroundColor Yellow
}

# Iniciar Nest en modo watch
Write-Host "[3/3] Iniciando Nest en modo desarrollo..." -ForegroundColor Green
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "   API disponible en:" -ForegroundColor Green
Write-Host "   http://localhost:3001/api/v1" -ForegroundColor White
Write-Host "   " -ForegroundColor Green
Write-Host "   Health Check:" -ForegroundColor Green
Write-Host "   http://localhost:3001/health" -ForegroundColor White
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Presiona Ctrl+C para detener" -ForegroundColor Yellow
Write-Host ""

# Ejecutar nest con npx (siempre funciona)
& npm run dev
