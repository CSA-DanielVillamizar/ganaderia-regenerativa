# Test End-to-End: Decision Today Page
# Fecha: 2026-01-10

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST E2E: DECISION TODAY PAGE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. VERIFICAR SERVIDORES
Write-Host "1. VERIFICANDO SERVIDORES..." -ForegroundColor Yellow
$api = Test-NetConnection -ComputerName localhost -Port 3000 -WarningAction SilentlyContinue
$web = Test-NetConnection -ComputerName localhost -Port 3001 -WarningAction SilentlyContinue

if ($api.TcpTestSucceeded) {
    Write-Host "   ✅ API (3000): CORRIENDO" -ForegroundColor Green
} else {
    Write-Host "   ❌ API (3000): NO RESPONDE" -ForegroundColor Red
    exit 1
}

if ($web.TcpTestSucceeded) {
    Write-Host "   ✅ WEB (3001): CORRIENDO" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  WEB (3001): NO RESPONDE" -ForegroundColor Yellow
}

Write-Host ""

# 2. AUTENTICACIÓN
Write-Host "2. AUTENTICACIÓN..." -ForegroundColor Yellow
$authBody = @{
    email = "admin@magrotec.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/auth/login' -Method POST -Body $authBody -ContentType 'application/json' -ErrorAction Stop
    $token = $loginResponse.access_token
    Write-Host "   ✅ Login exitoso" -ForegroundColor Green
    Write-Host "   Token: $($token.Substring(0,20))..." -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Login fallido" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        $errorDetail = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "   TraceId: $($errorDetail.traceId)" -ForegroundColor Red
    }
    exit 1
}

Write-Host ""

# 3. OBTENER FINCAS
Write-Host "3. OBTENIENDO FINCAS..." -ForegroundColor Yellow
$headers = @{
    Authorization = "Bearer $token"
}

try {
    $farms = Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/farms' -Method GET -Headers $headers -ErrorAction Stop
    
    if ($farms.Count -eq 0) {
        Write-Host "   ⚠️  No hay fincas disponibles" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "   ✅ Fincas obtenidas: $($farms.Count)" -ForegroundColor Green
    $farm = $farms[0]
    Write-Host "   Finca seleccionada: $($farm.name) (ID: $($farm.id))" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Error obteniendo fincas" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 4. PROBAR ENDPOINT DECISION TODAY
Write-Host "4. PROBANDO ENDPOINT DECISION-TODAY..." -ForegroundColor Yellow
$decisionUrl = "http://localhost:3000/api/v1/dashboard/$($farm.id)/decision-today"
Write-Host "   URL: $decisionUrl" -ForegroundColor Gray

try {
    $decision = Invoke-RestMethod -Uri $decisionUrl -Method GET -Headers $headers -ErrorAction Stop
    Write-Host "   ✅ Endpoint respondió correctamente" -ForegroundColor Green
    Write-Host ""
    
    # 5. VALIDAR ESTRUCTURA DE RESPUESTA
    Write-Host "5. VALIDANDO ESTRUCTURA DE DATOS..." -ForegroundColor Yellow
    
    $validations = @()
    
    # Confidence Level
    if ($decision.confidenceLevel) {
        Write-Host "   ✅ confidenceLevel: $($decision.confidenceLevel)" -ForegroundColor Green
        $validations += $true
    } else {
        Write-Host "   ❌ confidenceLevel: FALTA" -ForegroundColor Red
        $validations += $false
    }
    
    # Explainability
    if ($decision.explainability -and $decision.explainability.Count -gt 0) {
        Write-Host "   ✅ explainability: $($decision.explainability.Count) razones" -ForegroundColor Green
        $validations += $true
        
        # Mostrar primera razón
        $reason = $decision.explainability[0]
        Write-Host "      - Ejemplo: $($reason.reason)" -ForegroundColor Gray
        Write-Host "        Source: $($reason.source), Weight: $($reason.weight)" -ForegroundColor Gray
    } else {
        Write-Host "   ❌ explainability: VACÍO" -ForegroundColor Red
        $validations += $false
    }
    
    # Action Checklist
    if ($decision.actionChecklist) {
        Write-Host "   ✅ actionChecklist: $($decision.actionChecklist.Count) acciones" -ForegroundColor Green
        $validations += $true
        
        if ($decision.actionChecklist.Count -gt 0) {
            $action = $decision.actionChecklist[0]
            Write-Host "      - Ejemplo: $($action.action)" -ForegroundColor Gray
            Write-Host "        Priority: $($action.priority), Status: $($action.status)" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ⚠️  actionChecklist: NO PRESENTE" -ForegroundColor Yellow
        $validations += $true  # No es obligatorio
    }
    
    # Recommended Paddock
    if ($decision.recommendedNextPaddock) {
        Write-Host "   ✅ recommendedNextPaddock: $($decision.recommendedNextPaddock.name)" -ForegroundColor Green
        Write-Host "      - Hectáreas: $($decision.recommendedNextPaddock.hectares)" -ForegroundColor Gray
        Write-Host "      - Forraje disponible: $($decision.recommendedNextPaddock.availableForageKg) kg MS" -ForegroundColor Gray
        $validations += $true
    } else {
        Write-Host "   ⚠️  recommendedNextPaddock: NO HAY RECOMENDACIÓN" -ForegroundColor Yellow
        $validations += $true
    }
    
    # Recommended Herd
    if ($decision.recommendedHerd) {
        Write-Host "   ✅ recommendedHerd: $($decision.recommendedHerd.name)" -ForegroundColor Green
        Write-Host "      - UA actual: $($decision.recommendedHerd.currentUA)" -ForegroundColor Gray
        $validations += $true
    } else {
        Write-Host "   ⚠️  recommendedHerd: NO HAY RECOMENDACIÓN" -ForegroundColor Yellow
        $validations += $true
    }
    
    # Min Rest Days
    if ($decision.minRestDays -ne $null) {
        Write-Host "   ✅ minRestDays: $($decision.minRestDays) días" -ForegroundColor Green
        $validations += $true
    } else {
        Write-Host "   ❌ minRestDays: FALTA" -ForegroundColor Red
        $validations += $false
    }
    
    Write-Host ""
    
    # 6. RESULTADO FINAL
    Write-Host "========================================" -ForegroundColor Cyan
    $passedValidations = ($validations | Where-Object { $_ -eq $true }).Count
    $totalValidations = $validations.Count
    
    if ($passedValidations -eq $totalValidations) {
        Write-Host "  ✅ TEST: PASS ($passedValidations/$totalValidations)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  TEST: PARTIAL PASS ($passedValidations/$totalValidations)" -ForegroundColor Yellow
    }
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    # 7. URL PARA PRUEBA MANUAL
    Write-Host "PRUEBA MANUAL EN NAVEGADOR:" -ForegroundColor Cyan
    Write-Host "http://localhost:3001/farms/$($farm.id)/decision-today" -ForegroundColor White
    Write-Host ""
    
    # 8. GUARDAR RESPUESTA COMPLETA
    Write-Host "RESPUESTA COMPLETA GUARDADA EN: test-decision-response.json" -ForegroundColor Gray
    $decision | ConvertTo-Json -Depth 10 | Out-File "test-decision-response.json" -Encoding UTF8
    
} catch {
    Write-Host "   ❌ Error consultando endpoint" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        $errorDetail = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "   StatusCode: $($errorDetail.statusCode)" -ForegroundColor Red
        Write-Host "   Message: $($errorDetail.message)" -ForegroundColor Red
        Write-Host "   TraceId: $($errorDetail.traceId)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  ❌ TEST: FAIL" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Cyan
    
    exit 1
}
