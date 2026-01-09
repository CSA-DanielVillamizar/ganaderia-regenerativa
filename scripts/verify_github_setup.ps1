# Script para verificar configuración GitHub y crear issues desde backlog

Write-Host "========== VERIFICACIÓN GITHUB SETUP ==========" -ForegroundColor Cyan

# 1. Verificar que estamos en un repo git
Write-Host "`n1. Verificando repo git..." -ForegroundColor Yellow
$gitDir = git rev-parse --git-dir 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Repo git encontrado: $gitDir" -ForegroundColor Green
} else {
    Write-Host "❌ ERROR: No está en un repositorio git" -ForegroundColor Red
    exit 1
}

# 2. Verificar remoto GitHub
Write-Host "`n2. Verificando remoto GitHub..." -ForegroundColor Yellow
$remotes = git remote -v
Write-Host $remotes
if ($remotes -match "github.com") {
    Write-Host "✅ Remoto GitHub configurado" -ForegroundColor Green
} else {
    Write-Host "⚠️  ADVERTENCIA: No se encontró remoto GitHub" -ForegroundColor Yellow
}

# 3. Verificar gh CLI
Write-Host "`n3. Verificando GitHub CLI..." -ForegroundColor Yellow
$ghVersion = gh --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ GitHub CLI instalado: $ghVersion" -ForegroundColor Green
} else {
    Write-Host "❌ ERROR: GitHub CLI no encontrado. Instala con: scoop install gh" -ForegroundColor Red
    exit 1
}

# 4. Verificar autenticación
Write-Host "`n4. Verificando autenticación..." -ForegroundColor Yellow
$authStatus = gh auth status 2>&1
Write-Host $authStatus
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ GitHub CLI autenticado" -ForegroundColor Green
} else {
    Write-Host "❌ ERROR: No autenticado. Ejecuta: gh auth login" -ForegroundColor Red
    exit 1
}

# 5. Obtener info repo
Write-Host "`n5. Información del repositorio..." -ForegroundColor Yellow
$repoInfo = gh repo view --json owner,name,url -q '.owner.login + "/" + .name' 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Repo: $repoInfo" -ForegroundColor Green
} else {
    Write-Host "⚠️  No se pudo obtener info repositorio" -ForegroundColor Yellow
}

Write-Host "`n========== TODO VERIFICADO EXITOSAMENTE ==========" -ForegroundColor Green
Write-Host ""
