# Script de limpieza y diagnóstico - SIN PIPES, SALIDA DIRECTA
Set-Location "c:\Users\DanielVillamizar\GanaderiaRegenerativa"

# Función con timeout
function Invoke-WithTimeout {
    param(
        [string]$Command,
        [int]$TimeoutSeconds = 120
    )
    
    $ErrorActionPreference = 'SilentlyContinue'
    $job = Start-Job -ScriptBlock { Invoke-Expression $args[0] } -ArgumentList $Command
    
    $result = Wait-Job -Job $job -Timeout $TimeoutSeconds
    
    if ($null -eq $result) {
        Write-Output "[TIMEOUT] Comando excedió $TimeoutSeconds segundos: $Command"
        Stop-Job -Job $job -Force
        Remove-Job -Job $job -Force
        return $false
    } else {
        $output = Receive-Job -Job $job
        Write-Output $output
        Remove-Job -Job $job
        return $true
    }
}

Write-Output "=== FASE 0: DIAGNÓSTICO ==="
Write-Output "Node: $(node -v)"
Write-Output "NPM: $(npm -v)"

Write-Output ""
Write-Output "=== FASE 1: LIMPIAR NODE MODULES ==="

# Limpieza manual sin Remove-Item
Write-Output "Limpiando raíz..."
& cmd /c "if exist node_modules rmdir /s /q node_modules" 2>$null
& cmd /c "if exist package-lock.json del package-lock.json" 2>$null

Write-Output "Limpiando apps\api..."
& cmd /c "if exist apps\api\node_modules rmdir /s /q apps\api\node_modules" 2>$null
& cmd /c "if exist apps\api\.prisma rmdir /s /q apps\api\.prisma" 2>$null

Write-Output "Limpiando apps\web..."
& cmd /c "if exist apps\web\node_modules rmdir /s /q apps\web\node_modules" 2>$null

Write-Output "Limpiando cache npm..."
npm cache clean --force | Out-Null

Write-Output ""
Write-Output "=== FASE 2: INSTALAR ROOT ==="
npm install
$root_status = $?
Write-Output "Root install status: $root_status"

Write-Output ""
Write-Output "=== FASE 3: INSTALAR API ==="
Set-Location "apps\api"
npm install
$api_status = $?
Write-Output "API install status: $api_status"

Write-Output ""
Write-Output "=== FASE 4: INSTALAR WEB ==="
Set-Location "..\web"
npm install
$web_status = $?
Write-Output "Web install status: $web_status"

Set-Location "..\..\"

Write-Output ""
Write-Output "=== RESULTADO FINAL ==="
Write-Output "Root: $root_status"
Write-Output "API: $api_status"
Write-Output "Web: $web_status"
