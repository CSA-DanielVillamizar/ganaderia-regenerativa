# Script PowerShell para crear GitHub Issues desde JSON
# Uso: powershell -ExecutionPolicy Bypass -File scripts/create_all_issues.ps1

Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   CREADOR DE GITHUB ISSUES - MAGROTEC     ║" -ForegroundColor Cyan
Write-Host "║   Convirtiendo Backlog en GitHub Issues   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$Repo = "CSA-DanielVillamizar/ganaderia-regenerativa"
$IssuesFile = "scripts/issues_data.json"
$OutputFile = "docs/issues_created.md"

# 1. Verificar requisitos
Write-Host "[1/5] Verificando requisitos..." -ForegroundColor Yellow
$checks = @{
    "GitHub CLI" = { gh --version 2>&1 | Out-Null; $? }
    "Autenticación" = { gh auth status 2>&1 | Out-Null; $? }
    "JSON data" = { Test-Path $IssuesFile }
}

foreach ($check in $checks.GetEnumerator()) {
    if (& $check.Value) {
        Write-Host "  ✅ $($check.Name)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $($check.Name) - ERROR" -ForegroundColor Red
        if ($check.Name -eq "Autenticación") {
            Write-Host "     Ejecuta: gh auth login" -ForegroundColor Yellow
        }
        exit 1
    }
}
Write-Host "✅ Todos los requisitos cumplidos" -ForegroundColor Green
Write-Host ""

# 2. Crear labels
Write-Host "[2/5] Creando labels..." -ForegroundColor Yellow
$labels = @(
    @{name="epic"; color="3B2A7D"},
    @{name="story"; color="0366D6"},
    @{name="P0"; color="FF4444"},
    @{name="P1"; color="FFAA00"},
    @{name="P2"; color="00AA00"},
    @{name="P3"; color="0088FF"},
    @{name="backend"; color="427819"},
    @{name="frontend"; color="8B008B"},
    @{name="data"; color="1F77B4"},
    @{name="qa"; color="FF7F0E"},
    @{name="ux"; color="9467BD"},
    @{name="security"; color="D62728"}
)

$existingLabels = gh label list --repo $Repo --json name -q '.[].name' 2>&1
$createdCount = 0

foreach ($label in $labels) {
    if ($existingLabels -contains $label.name) {
        Write-Host "  ⏭️  Label '$($label.name)' ya existe" -ForegroundColor Gray
    } else {
        Write-Host "  ➕ Creando label '$($label.name)'..." -ForegroundColor Cyan
        gh label create $label.name --repo $Repo --color $label.color 2>&1 | Out-Null
        if ($?) {
            $createdCount++
        }
    }
}
Write-Host "✅ Labels completados ($createdCount nuevos)" -ForegroundColor Green
Write-Host ""

# 3. Leer datos de issues
Write-Host "[3/5] Leyendo datos de issues..." -ForegroundColor Yellow
try {
    $issuesData = Get-Content $IssuesFile | ConvertFrom-Json
    $totalEpics = $issuesData.epics.Count
    Write-Host "  📋 $totalEpics épicas leídas correctamente" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Error leyendo $IssuesFile" -ForegroundColor Red
    Write-Host "     $_" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Datos cargados correctamente" -ForegroundColor Green
Write-Host ""

# 4. Crear issues
Write-Host "[4/5] Creando issues..." -ForegroundColor Yellow
$createdIssues = @()
$failedIssues = @()
$issueCount = 0

foreach ($epic in $issuesData.epics) {
    $issueCount++
    $progressPct = [math]::Round(($issueCount / $totalEpics) * 100)
    Write-Host "  [$progressPct%] $($epic.title)" -ForegroundColor Cyan
    
    try {
        # Crear issue
        $output = gh issue create `
            --repo $Repo `
            --title $epic.title `
            --body $epic.body `
            --label ($epic.labels -join ",") `
            2>&1
        
        # Extraer número
        if ($output -match '#(\d+)') {
            $issueNum = $matches[1]
            Write-Host "       ✅ Issue #$issueNum creado" -ForegroundColor Green
            
            $createdIssues += @{
                number = $issueNum
                title = $epic.title
                priority = $epic.priority
                labels = $epic.labels -join ", "
            }
        } else {
            Write-Host "       ⚠️  Posiblemente duplicado" -ForegroundColor Yellow
            $failedIssues += $epic.title
        }
    } catch {
        Write-Host "       ❌ Error: $_" -ForegroundColor Red
        $failedIssues += $epic.title
    }
    
    # Rate limit: pequeña pausa entre requests
    Start-Sleep -Milliseconds 500
}

Write-Host "✅ Creación de issues completada" -ForegroundColor Green
Write-Host ""

# 5. Generar reporte
Write-Host "[5/5] Generando reporte..." -ForegroundColor Yellow

$reportContent = @"
# 📋 ISSUES CREADOS DESDE BACKLOG

**Fecha:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  
**Repositorio:** [$Repo](https://github.com/$Repo)  
**Total Issues Creados:** $($createdIssues.Count)  

## RESUMEN ESTADÍSTICO

| Métrica | Valor |
|---------|-------|
| Épicas creadas | $($createdIssues.Count) |
| Fallidas/Duplicadas | $($failedIssues.Count) |
| Tasa éxito | $(if ($totalEpics -gt 0) { [math]::Round(($createdIssues.Count / $totalEpics) * 100) }%)% |

## ISSUES POR PRIORIDAD

### P0 - Crítico (MVP)

"@

$p0Issues = $createdIssues | Where-Object { $_.priority -eq "P0" }
foreach ($issue in $p0Issues) {
    $reportContent += "`n| #$($issue.number) | [$($issue.title)](https://github.com/$Repo/issues/$($issue.number)) | $($issue.labels) |"
}

$reportContent += @"

### P1 - Alto (PRO)

| # | Título | Labels |
|----|--------|--------|

### P2 - Medio (PREMIUM)

| # | Título | Labels |
|----|--------|--------|

### P3 - Bajo (PREMIUM)

| # | Título | Labels |
|----|--------|--------|

## LISTADO COMPLETO

| # | Título | Prioridad | Labels |
|----|--------|-----------|--------|
"@

foreach ($issue in $createdIssues | Sort-Object { [int]$_.number }) {
    $reportContent += "`n| #$($issue.number) | [$($issue.title)](https://github.com/$Repo/issues/$($issue.number)) | $($issue.priority) | $($issue.labels) |"
}

$reportContent += @"

## PRÓXIMOS PASOS

1. **Revisar issues:** `gh issue list --repo $Repo`
2. **Ver un issue:** `gh issue view <numero> --repo $Repo`
3. **Asignar a sprint:** Agregar project "Sprint 1" manualmente
4. **Empezar desarrollo:** Crear ramas `feature/issue-XXX-nombre`

## NOTAS

- Algunos issues pueden estar duplicados si se ejecutó script dos veces
- Los P1 y P2 están en backlog, priorizar P0 primero
- Todos los issues incluyen criterios de aceptación del `docs/backlog.md`

---

**Generado por:** GitHub CLI + PowerShell  
**Más info:** `docs/backlog.md`, `docs/roadmap.md`, `docs/issue_templates.md`
"@

Set-Content -Path $OutputFile -Value $reportContent -Encoding UTF8
Write-Host "  📄 Reporte guardado en: $OutputFile" -ForegroundColor Green
Write-Host "✅ Reporte generado correctamente" -ForegroundColor Green
Write-Host ""

# Resumen final
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║           RESUMEN FINAL                   ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Issues creados: $($createdIssues.Count)" -ForegroundColor Green
if ($failedIssues.Count -gt 0) {
    Write-Host "⚠️  Issues fallidos: $($failedIssues.Count)" -ForegroundColor Yellow
}
Write-Host "📊 Repo: $Repo" -ForegroundColor Cyan
Write-Host "📄 Reporte: $OutputFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔗 Ver issues en GitHub:" -ForegroundColor Yellow
Write-Host "   https://github.com/$Repo/issues" -ForegroundColor Blue
Write-Host ""
Write-Host "📖 Próximas tareas:" -ForegroundColor Yellow
Write-Host "   1. Revisar issues creados" -ForegroundColor Gray
Write-Host "   2. Crear Project para Sprint 1" -ForegroundColor Gray
Write-Host "   3. Comenzar estimación con equipo" -ForegroundColor Gray
Write-Host ""
