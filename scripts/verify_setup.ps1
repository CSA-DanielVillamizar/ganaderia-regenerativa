# Script para verificar configuracion GitHub

Write-Host "Verificando GitHub CLI..." -ForegroundColor Cyan

# Verificar gh CLI
$ghVersion = gh --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "GitHub CLI: $ghVersion" -ForegroundColor Green
} else {
    Write-Host "ERROR: GitHub CLI no encontrado" -ForegroundColor Red
    exit 1
}

# Verificar autenticacion
Write-Host "`nVerificando autenticacion..." -ForegroundColor Cyan
gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: No autenticado con GitHub" -ForegroundColor Red
    exit 1
}

Write-Host "`nVerificando repositorio..." -ForegroundColor Cyan
git remote -v 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: No en un repositorio git" -ForegroundColor Red
    exit 1
}

Write-Host "`nTodo verificado correctamente" -ForegroundColor Green
