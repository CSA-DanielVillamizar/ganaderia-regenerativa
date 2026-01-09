# Script PowerShell para crear GitHub Issues desde backlog
# Uso: powershell -ExecutionPolicy Bypass -File scripts/create_issues.ps1

param(
    [string]$RepoOwner = "CSA-DanielVillamizar",
    [string]$RepoName = "ganaderia-regenerativa",
    [string]$BacklogFile = "docs/backlog.md",
    [string]$OutputFile = "docs/issues_created.md"
)

$ErrorActionPreference = "Continue"
$Repo = "$RepoOwner/$RepoName"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "CREADOR DE GITHUB ISSUES - MAGROTEC" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar gh CLI
Write-Host "Verificando GitHub CLI..." -ForegroundColor Yellow
$ghVersion = gh --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: GitHub CLI no instalado" -ForegroundColor Red
    exit 1
}
Write-Host "GitHub CLI versión: $($ghVersion[0])" -ForegroundColor Green

# 2. Verificar autenticación
Write-Host "Verificando autenticación..." -ForegroundColor Yellow
$authCheck = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: No autenticado. Ejecuta: gh auth login" -ForegroundColor Red
    exit 1
}
Write-Host "Autenticado correctamente" -ForegroundColor Green
Write-Host ""

# 3. Crear labels
Write-Host "Creando labels..." -ForegroundColor Yellow

$labels = @(
    @{name="epic"; color="3B2A7D"; description="Funcionalidad grande"},
    @{name="story"; color="0366D6"; description="Historia de usuario"},
    @{name="task"; color="A2AAAD"; description="Tarea tecnica"},
    @{name="bug"; color="D73A49"; description="Error encontrado"},
    @{name="P0"; color="FF4444"; description="Critico - MVP"},
    @{name="P1"; color="FFAA00"; description="Alto - PRO"},
    @{name="P2"; color="00AA00"; description="Medio - PREMIUM"},
    @{name="P3"; color="0088FF"; description="Bajo - PREMIUM"},
    @{name="backend"; color="427819"; description="Backend/API"},
    @{name="frontend"; color="8B008B"; description="Frontend/Web"},
    @{name="data"; color="1F77B4"; description="Base de datos"},
    @{name="qa"; color="FF7F0E"; description="Testing/QA"},
    @{name="ux"; color="9467BD"; description="UI/UX"},
    @{name="security"; color="D62728"; description="Seguridad"}
)

foreach ($label in $labels) {
    $existingLabels = gh label list --repo $Repo --json name -q '.[].name' 2>&1
    if ($existingLabels -contains $label.name) {
        Write-Host "  Label '$($label.name)' ya existe" -ForegroundColor Gray
    } else {
        Write-Host "  Creando label '$($label.name)'..." -ForegroundColor Cyan
        gh label create $label.name --repo $Repo --color $label.color --description $label.description 2>&1 | Out-Null
    }
}
Write-Host "Labels completados" -ForegroundColor Green
Write-Host ""

# 4. Crear issues (estructura de datos)
$epics = @(
    @{
        id="MVP-1";
        title="[MVP] Épica: Gestión estructural de la finca";
        body="## ÉPICA: Gestión estructural de la finca`n`n### Objetivo`nEstablece la estructura base: fincas, potreros y validación de acceso por usuario.`n`n### Historias de usuario`n- MVP-1.1: Crear y administrar fincas (CRUD)`n- MVP-1.2: Definir potreros con parámetros regenerativos`n- MVP-1.3: Asignar usuarios a fincas con roles`n`n### Impacto regenerativo`nSin esta estructura, no hay modelo de datos. **CRÍTICO.**`n`n### Checklist DoD`n- Tests unit >80% cobertura servicios`n- Tests integración para endpoints CRUD`n- Modelos Prisma: Farm, Paddock, UserFarm`n- Validación acceso por farmId funcional";
        labels="epic,P0,backend,data"
    },
    @{
        id="MVP-2";
        title="[MVP] Épica: Lotes, animales y estado real";
        body="## ÉPICA: Lotes, animales y estado real`n`n### Objetivo`nRegistro de lotes (rebaños) con estado actual: peso, edad, cantidad animales.`n`n### Historias de usuario`n- MVP-2.1: Crear y administrar lotes`n- MVP-2.2: Registrar animales individuales`n- MVP-2.3: Visualizar estado actual lote`n`n### Impacto regenerativo`nLotes con estado en tiempo real → decisiones de rotación informadas.`n`n### Checklist DoD`n- Modelos: Herd, Animal, Weighing, Movement`n- Endpoints: POST/GET/PUT /herds, /animals`n- Tests integración flujo completo";
        labels="epic,P0,backend,data"
    },
    @{
        id="MVP-3";
        title="[MVP] Épica: Rotación y descanso";
        body="## ÉPICA: Rotación y descanso`n`n### Objetivo`nGestión inteligente de rotación de lotes entre potreros, respetando descanso mínimo.`n`n### Historias de usuario`n- MVP-3.1: Registrar movimientos entrada/salida`n- MVP-3.2: Bloquear doble ocupación`n- MVP-3.3: Calcular descanso`n- MVP-3.4: Validar descanso mínimo`n`n### Impacto regenerativo`nDescanso es la BASE de ganadería regenerativa. **CRÍTICO.**`n`n### Gaps identificados`n- MVP-3.4 NO IMPLEMENTADO: Validación descanso mínimo";
        labels="epic,P0,backend"
    },
    @{
        id="MVP-4";
        title="[MVP] Épica: Pesajes (báscula + cinta métrica)";
        body="## ÉPICA: Pesajes (báscula + cinta métrica)`n`n### Objetivo`nRegistrar peso real con báscula o estimado con cinta métrica bovina (perímetro × largo / divisor).`n`n### Historias de usuario`n- MVP-4.1: Pesaje báscula`n- MVP-4.2: Pesaje cinta métrica`n- MVP-4.3: Comparar real vs estimado`n- MVP-4.4: Calcular UA tras pesaje`n`n### Impacto regenerativo`nCinta métrica democratiza pesaje en campo (sin báscula costosa). **DIFERENCIADOR ÚNICO.**`n`n### Gaps identificados`n- MVP-4.2 PARCIAL: UI formulario especializado falta`n- MVP-4.3 NO IMPLEMENTADO: Comparativa visual falta";
        labels="epic,P0,backend,frontend,ux"
    }
)

Write-Host "Creando issues..." -ForegroundColor Yellow
$totalCreated = 0

foreach ($epic in $epics) {
    Write-Host "  Creando: $($epic.title)" -ForegroundColor Cyan
    
    try {
        $output = gh issue create `
            --repo $Repo `
            --title $epic.title `
            --body $epic.body `
            --label $epic.labels `
            2>&1
        
        # Extraer número de issue de output
        $issueNum = $output | Select-String -Pattern '#(\d+)' | ForEach-Object { $_.Matches.Groups[1].Value }
        
        if ($issueNum) {
            Write-Host "    ✅ Issue #$issueNum creado" -ForegroundColor Green
            $totalCreated++
        } else {
            Write-Host "    ⚠️  Issue creado pero número desconocido" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "    ❌ Error: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "RESUMEN" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Épicas creadas: $totalCreated" -ForegroundColor Green
Write-Host "Repo: $Repo" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Ver issues: gh issue list --repo $Repo" -ForegroundColor Gray
Write-Host "2. Ver un issue: gh issue view <numero> --repo $Repo" -ForegroundColor Gray
Write-Host ""
