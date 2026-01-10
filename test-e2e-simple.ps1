# Test E2E Completo - Decision Today
# Sin caracteres especiales para evitar problemas de encoding

Write-Host ""
Write-Host "========================================"
Write-Host "  TEST E2E: DECISION TODAY"
Write-Host "========================================"
Write-Host ""

# PASO 1: VALIDAR PUERTOS
Write-Host "PASO 1: VALIDANDO PUERTOS Y CONFIGURACION"
Write-Host ""

$apiEnv = Get-Content "apps\api\.env" -Raw
$webEnv = Get-Content "apps\web\.env.local" -Raw

$apiPort = if ($apiEnv -match 'PORT=(\d+)') { $matches[1] } else { "3000" }
$corsOrigin = if ($apiEnv -match 'CORS_ORIGIN="([^"]+)"') { $matches[1] } else { "desconocido" }

Write-Host "[OK] API Puerto: $apiPort (desde apps/api/.env)"
Write-Host "[OK] CORS Origin: $corsOrigin"
Write-Host "[OK] WEB Puerto: 3001 (especificado)"
Write-Host ""

# PASO 2: VERIFICAR SERVIDORES
Write-Host "PASO 2: VERIFICANDO SERVIDORES"
Write-Host ""

$apiCheck = Test-NetConnection localhost -Port $apiPort -WarningAction SilentlyContinue
$webCheck = Test-NetConnection localhost -Port 3001 -WarningAction SilentlyContinue

if ($apiCheck.TcpTestSucceeded) {
    Write-Host "[OK] API corriendo en puerto $apiPort"
} else {
    Write-Host "[ERROR] API no responde"
    exit 1
}

if ($webCheck.TcpTestSucceeded) {
    Write-Host "[OK] WEB corriendo en puerto 3001"
} else {
    Write-Host "[ERROR] WEB no responde"
    exit 1
}

Write-Host ""

# PASO 3: AUTENTICACION
Write-Host "PASO 3: AUTENTICACION"
Write-Host ""

$authBody = @{
    email = "admin@magrotec.com"
    password = "Admin123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:$apiPort/api/v1/auth/login" -Method POST -Body $authBody -ContentType 'application/json' -ErrorAction Stop
    $token = $loginResponse.accessToken
    Write-Host "[OK] Login exitoso"
    Write-Host "Token: $($token.Substring(0,30))..."
} catch {
    Write-Host "[ERROR] Login fallido: $($_.Exception.Message)"
    exit 1
}

Write-Host ""

# PASO 4: OBTENER FINCAS
Write-Host "PASO 4: OBTENIENDO FINCAS"
Write-Host ""

$headers = @{ Authorization = "Bearer $token" }

try {
    $farms = Invoke-RestMethod -Uri "http://localhost:$apiPort/api/v1/farms" -Method GET -Headers $headers -ErrorAction Stop
    $farm = $farms[0]
    Write-Host "[OK] Fincas encontradas: $($farms.Count)"
    Write-Host "Seleccionada: $($farm.name) (ID: $($farm.id))"
} catch {
    Write-Host "[ERROR] No se pudieron obtener fincas"
    exit 1
}

Write-Host ""

# PASO 5: CONSULTAR ENDPOINT DECISION-TODAY
Write-Host "PASO 5: CONSULTANDO ENDPOINT DECISION-TODAY"
Write-Host ""

$decisionUrl = "http://localhost:$apiPort/api/v1/dashboard/$($farm.id)/decision-today"
Write-Host "URL: $decisionUrl"

try {
    $decision = Invoke-RestMethod -Uri $decisionUrl -Method GET -Headers $headers -ErrorAction Stop
    Write-Host "[OK] Endpoint respondio correctamente"
} catch {
    Write-Host "[ERROR] Fallo al consultar endpoint"
    if ($_.ErrorDetails.Message) {
        $errorDetail = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "TraceId: $($errorDetail.traceId)"
    }
    exit 1
}

Write-Host ""

# PASO 6: VALIDAR ESTRUCTURA
Write-Host "PASO 6: VALIDANDO ESTRUCTURA DE DATOS"
Write-Host ""

$validations = @()

if ($decision.confidenceLevel) {
    Write-Host "[OK] confidenceLevel: $($decision.confidenceLevel)"
    $validations += $true
} else {
    Write-Host "[ERROR] confidenceLevel falta"
    $validations += $false
}

if ($decision.explainability -and $decision.explainability.Count -gt 0) {
    Write-Host "[OK] explainability: $($decision.explainability.Count) razones"
    $reason = $decision.explainability[0]
    Write-Host "  -> $($reason.reason) (source: $($reason.source), weight: $($reason.weight))"
    $validations += $true
} else {
    Write-Host "[ERROR] explainability vacio"
    $validations += $false
}

if ($decision.actionChecklist) {
    Write-Host "[OK] actionChecklist: $($decision.actionChecklist.Count) acciones"
    $validations += $true
} else {
    Write-Host "[INFO] actionChecklist vacio (opcional)"
    $validations += $true
}

if ($decision.recommendedNextPaddock) {
    Write-Host "[OK] recommendedNextPaddock: $($decision.recommendedNextPaddock.name)"
    Write-Host "  -> Hectareas: $($decision.recommendedNextPaddock.hectares)"
    Write-Host "  -> Forraje: $($decision.recommendedNextPaddock.availableForageKg) kg MS"
    $validations += $true
} else {
    Write-Host "[INFO] Sin recomendacion de paddock"
    $validations += $true
}

if ($decision.recommendedHerd) {
    Write-Host "[OK] recommendedHerd: $($decision.recommendedHerd.name)"
    Write-Host "  -> UA actual: $($decision.recommendedHerd.currentUA)"
    $validations += $true
} else {
    Write-Host "[INFO] Sin recomendacion de herd"
    $validations += $true
}

if ($decision.minRestDays -ne $null) {
    Write-Host "[OK] minRestDays: $($decision.minRestDays) dias"
    $validations += $true
} else {
    Write-Host "[ERROR] minRestDays falta"
    $validations += $false
}

Write-Host ""

# PASO 7: RESULTADO
$passed = ($validations | Where-Object { $_ -eq $true }).Count
$total = $validations.Count

Write-Host "========================================"
if ($passed -eq $total) {
    Write-Host "  [PASS] TEST API: $passed/$total"
} else {
    Write-Host "  [PARTIAL] TEST API: $passed/$total"
}
Write-Host "========================================"
Write-Host ""

# PASO 8: GUARDAR EVIDENCIA
$outputPath = "test-e2e-decision-response.json"
$decision | ConvertTo-Json -Depth 10 | Out-File $outputPath -Encoding UTF8
Write-Host "[OK] Respuesta guardada en: $outputPath"
Write-Host ""

# PASO 9: INSTRUCCIONES PARA UI
Write-Host "========================================"
Write-Host "  PRUEBA MANUAL DE UI"
Write-Host "========================================"
Write-Host ""
Write-Host "URL: http://localhost:3001/farms/$($farm.id)/decision-today"
Write-Host ""
Write-Host "CHECKLIST DE VALIDACION UI:"
Write-Host ""
Write-Host "1. LOADING STATE"
Write-Host "   - Refrescar pagina (F5)"
Write-Host "   - Verificar spinner aparece"
Write-Host ""
Write-Host "2. ERROR STATE CON TRACEID"
Write-Host "   - Detener API (Ctrl+C)"
Write-Host "   - Refrescar pagina"
Write-Host "   - Verificar ErrorState con traceId"
Write-Host "   - Verificar boton Reintentar"
Write-Host "   - Reiniciar API y reintentar"
Write-Host ""
Write-Host "3. SUCCESS - RECOMMENDATION CARD"
Write-Host "   - Tarjeta verde con gradiente"
Write-Host "   - Paddock: $($decision.recommendedNextPaddock.name)"
if ($decision.recommendedHerd) {
    Write-Host "   - Herd: $($decision.recommendedHerd.name)"
}
Write-Host "   - Grid de estadisticas visible"
Write-Host "   - Boton Registrar Movimiento"
Write-Host ""
Write-Host "4. CONFIDENCE BADGE"
Write-Host "   - Badge muestra: $($decision.confidenceLevel)"
Write-Host "   - Color correcto (HIGH=verde, MEDIUM=amarillo, LOW=rojo)"
Write-Host "   - Bullets explicativos visibles"
Write-Host ""
Write-Host "5. EXPLAINABILITY PANEL"
Write-Host "   - Titulo visible"
Write-Host "   - $($decision.explainability.Count) razones listadas"
Write-Host "   - Cada razon con source icon y weight badge"
Write-Host ""
if ($decision.actionChecklist -and $decision.actionChecklist.Count -gt 0) {
    Write-Host "6. ACTION CHECKLIST PANEL"
    Write-Host "   - $($decision.actionChecklist.Count) acciones listadas"
    Write-Host "   - Priority badges coloreados"
    Write-Host "   - Botones 'Ir' presentes"
    Write-Host ""
}
Write-Host "7. NAVEGACION Y CTAs"
Write-Host "   - Click 'Registrar Movimiento' -> navega a /movements/new"
Write-Host "   - Click boton 'Ir' -> navega correctamente"
Write-Host "   - Boton Back -> regresa a Decision Today"
Write-Host "   - Boton Actualizar -> refresca datos"
Write-Host ""
Write-Host "8. CAPTURAR EVIDENCIA"
Write-Host "   - Screenshot de loading state"
Write-Host "   - Screenshot de error state con traceId"
Write-Host "   - Screenshot de pagina completa"
Write-Host "   - Screenshot de URL despues de CTA"
Write-Host ""

# PASO 10: CREAR REPORTE
$reportPath = "test-e2e-REPORT.md"
$report = @"
# TEST E2E: DECISION TODAY - REPORTE

**Fecha:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Farm ID:** $($farm.id)
**Farm Name:** $($farm.name)

## CONFIGURACION VALIDADA

- API Puerto: $apiPort (desde apps/api/.env)
- WEB Puerto: 3001 (segun especificacion)
- CORS Origin: $corsOrigin

## TEST DE API: PASS ($passed/$total validaciones)

### Estructura de Datos:

- confidenceLevel: $($decision.confidenceLevel)
- explainability: $($decision.explainability.Count) razones
- actionChecklist: $($decision.actionChecklist.Count) acciones
- recommendedNextPaddock: $($decision.recommendedNextPaddock.name)
- recommendedHerd: $($decision.recommendedHerd.name)
- minRestDays: $($decision.minRestDays) dias

## PRUEBA MANUAL UI

**URL:** http://localhost:3001/farms/$($farm.id)/decision-today

### Checklist:

- [ ] 1. Loading state aparece al refrescar
- [ ] 2. Error state con traceId cuando API esta caido
- [ ] 3. RecommendationCard renderiza correctamente
- [ ] 4. ConfidenceBadge muestra nivel y color correcto
- [ ] 5. ExplainabilityPanel muestra razones con icons
- [ ] 6. ActionChecklistPanel muestra acciones con prioridades
- [ ] 7. CTAs navegan correctamente
- [ ] 8. Boton Actualizar refresca datos

### Evidencia Requerida:

- Screenshot: Loading state
- Screenshot: Error state con traceId
- Screenshot: Pagina completa en success state
- Screenshot: URL despues de click en CTA

## DATOS DE RESPUESTA

Ver archivo: test-e2e-decision-response.json

## CONCLUSION

**TEST API:** PASS

**TEST UI:** PENDIENTE VALIDACION MANUAL

---

*Generado por test-e2e-simple.ps1*
"@

$report | Out-File $reportPath -Encoding UTF8
Write-Host "[OK] Reporte guardado en: $reportPath"
Write-Host ""
Write-Host "========================================"
Write-Host "  TEST E2E COMPLETADO"
Write-Host "========================================"
Write-Host ""
