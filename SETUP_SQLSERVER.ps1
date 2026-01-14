#!/usr/bin/env pwsh

<#
  Script: Configurar SQL Server para Ganadería Regenerativa
  Plataforma: Windows PowerShell 5.1+
  Requisitos: 
    - SQL Server Express/Developer/Enterprise instalado en puerto 1433
    - SSMS (SQL Server Management Studio) instalado
    - Permisos administrativos
#>

param(
    [string]$DatabaseName = "ganaderia_db",
    [string]$ServerInstance = "localhost",
    [string]$DatabaseUser = "sa"
)

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                  🗄️  CONFIGURACIÓN SQL SERVER                  ║" -ForegroundColor Cyan
Write-Host "║            Ganadería Regenerativa - Backend Setup            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# [PASO 1] Verificar SQL Server
# ============================================================================

Write-Host "[1/6] Verificando SQL Server..." -ForegroundColor Yellow
$sqlService = Get-Service -Name MSSQLSERVER -ErrorAction SilentlyContinue

if (-not $sqlService) {
    Write-Host "❌ SQL Server no está instalado en este equipo" -ForegroundColor Red
    Write-Host "   Instala: https://www.microsoft.com/es-es/sql-server/sql-server-downloads" -ForegroundColor Yellow
    exit 1
}

if ($sqlService.Status -ne "Running") {
    Write-Host "⚠️  SQL Server no está corriendo. Intentando iniciar..." -ForegroundColor Yellow
    try {
        Start-Service -Name MSSQLSERVER -ErrorAction Stop
        Start-Sleep -Seconds 3
        Write-Host "✅ SQL Server iniciado correctamente" -ForegroundColor Green
    } catch {
        Write-Host "❌ No se pudo iniciar SQL Server" -ForegroundColor Red
        Write-Host "   Error: $_" -ForegroundColor Gray
        Write-Host "   Solución: Inicia manualmente el servicio MSSQLSERVER en Servicios de Windows" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "✅ SQL Server está corriendo (MSSQLSERVER)" -ForegroundColor Green
}

# ============================================================================
# [PASO 2] Verificar/Crear .env
# ============================================================================

Write-Host ""
Write-Host "[2/6] Configurando variables de entorno..." -ForegroundColor Yellow

$apiPath = "c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\api"
$envFile = "$apiPath\.env"
$envExampleFile = "$apiPath\.env.example"

if (-not (Test-Path $envFile)) {
    if (-not (Test-Path $envExampleFile)) {
        Write-Host "❌ No existe .env ni .env.example en $apiPath" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "   Copiando .env.example → .env..." -ForegroundColor Gray
    Copy-Item $envExampleFile $envFile
    Write-Host "⚠️  IMPORTANTE: Edita $envFile con tu contraseña de SQL Server (usuario SA)" -ForegroundColor Yellow
    Write-Host "   Línea a editar:" -ForegroundColor Gray
    Write-Host "   DATABASE_URL=\"sqlserver://localhost:1433;database=ganaderia_db;user=sa;password=TU_PASSWORD;encrypt=true;trustServerCertificate=true\"" -ForegroundColor Cyan
    
    Write-Host ""
    Write-Host "   Presiona Enter cuando hayas editado .env..." -ForegroundColor Yellow
    Read-Host "   "
} else {
    Write-Host "✅ .env ya existe" -ForegroundColor Green
}

# ============================================================================
# [PASO 3] Crear Base de Datos en SQL Server
# ============================================================================

Write-Host ""
Write-Host "[3/6] Creando base de datos en SQL Server..." -ForegroundColor Yellow

try {
    # Intentar conectar con SQL Server
    $sqlConnectionString = "Server=$ServerInstance;Integrated Security=true;Connection Timeout=5;"
    $sqlConnection = New-Object System.Data.SqlClient.SqlConnection
    $sqlConnection.ConnectionString = $sqlConnectionString
    
    $sqlConnection.Open()
    Write-Host "   Conectado a SQL Server en $ServerInstance" -ForegroundColor Gray
    
    # Crear BD
    $createDbCommand = $sqlConnection.CreateCommand()
    $createDbCommand.CommandText = @"
        IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '$DatabaseName')
        BEGIN
            CREATE DATABASE [$DatabaseName] 
            COLLATE SQL_Latin1_General_CP1_CI_AS;
            PRINT 'Base de datos creada: $DatabaseName'
        END
        ELSE
        BEGIN
            PRINT 'Base de datos ya existe: $DatabaseName'
        END
"@
    
    $createDbCommand.ExecuteNonQuery() | Out-Null
    Write-Host "✅ Base de datos '$DatabaseName' lista" -ForegroundColor Green
    
    # Verificar usuario SA
    Write-Host "   Verificando usuario SA..." -ForegroundColor Gray
    $checkSaCommand = $sqlConnection.CreateCommand()
    $checkSaCommand.CommandText = "SELECT is_disabled FROM sys.sql_logins WHERE name = 'sa'"
    $saStatus = $checkSaCommand.ExecuteScalar()
    
    if ($saStatus -eq 0) {
        Write-Host "✅ Usuario SA está activo" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Usuario SA deshabilitado. Contacta a tu DBA para habilitarlo" -ForegroundColor Yellow
    }
    
    $sqlConnection.Close()
} catch {
    Write-Host "❌ Error al conectar a SQL Server: $_" -ForegroundColor Red
    Write-Host "   Verifica que:" -ForegroundColor Yellow
    Write-Host "   1. SQL Server está corriendo" -ForegroundColor Gray
    Write-Host "   2. Puerto 1433 está abierto" -ForegroundColor Gray
    Write-Host "   3. Tienes credenciales correctas" -ForegroundColor Gray
    exit 1
}

# ============================================================================
# [PASO 4] Generar Cliente Prisma
# ============================================================================

Write-Host ""
Write-Host "[4/6] Generando cliente Prisma para SQL Server..." -ForegroundColor Yellow

Push-Location $apiPath

try {
    & npx prisma generate --schema=prisma/schema.prisma 2>&1 | Tee-Object -Variable prismaOutput
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error en prisma generate" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Cliente Prisma generado correctamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error ejecutando prisma: $_" -ForegroundColor Red
    exit 1
}

# ============================================================================
# [PASO 5] Sincronizar Esquema
# ============================================================================

Write-Host ""
Write-Host "[5/6] Sincronizando esquema con la base de datos..." -ForegroundColor Yellow
Write-Host "   (Esto puede tomar 1-2 minutos)" -ForegroundColor Gray

try {
    & npx prisma db push --skip-generate 2>&1 | Tee-Object -Variable dbPushOutput
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Error en db push" -ForegroundColor Yellow
        Write-Host "   Diagnóstico:" -ForegroundColor Gray
        $dbPushOutput | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
        Write-Host ""
        Write-Host "   Soluciones posibles:" -ForegroundColor Yellow
        Write-Host "   1. Verifica que DATABASE_URL en .env es correcta" -ForegroundColor Gray
        Write-Host "   2. Confirma que la BD existe en SQL Server" -ForegroundColor Gray
        Write-Host "   3. Verifica permisos de usuario SA" -ForegroundColor Gray
        exit 1
    }
    Write-Host "✅ Esquema sincronizado exitosamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error durante db push: $_" -ForegroundColor Red
    exit 1
}

# ============================================================================
# [PASO 6] Cargar Datos Iniciales (Seed)
# ============================================================================

Write-Host ""
Write-Host "[6/6] Cargando datos iniciales (seed)..." -ForegroundColor Yellow

if (Test-Path "prisma/seed.ts") {
    try {
        & npx ts-node prisma/seed.ts 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Datos iniciales cargados correctamente" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Seed parcialmente ejecutado (puede ser normal si no hay seed definido)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  No se ejecutó seed (puede no estar configurado): $_" -ForegroundColor Yellow
    }
} else {
    Write-Host "ℹ️  No existe seed.ts definido (ignorado)" -ForegroundColor Gray
}

Pop-Location

# ============================================================================
# RESUMEN FINAL
# ============================================================================

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                   ✅ CONFIGURACIÓN COMPLETADA                  ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📊 Resumen:" -ForegroundColor Cyan
Write-Host "   • Servidor SQL: $ServerInstance" -ForegroundColor Gray
Write-Host "   • Base de datos: $DatabaseName" -ForegroundColor Gray
Write-Host "   • Usuario: $DatabaseUser" -ForegroundColor Gray
Write-Host "   • Provider Prisma: sqlserver" -ForegroundColor Gray
Write-Host ""

Write-Host "🚀 Próximos pasos:" -ForegroundColor Yellow
Write-Host "   1. cd apps/api" -ForegroundColor Gray
Write-Host "   2. npm run dev              (inicia API en puerto 3000)" -ForegroundColor Gray
Write-Host "   3. npm run prisma:studio   (abre interfaz gráfica Prisma)" -ForegroundColor Gray
Write-Host ""

Write-Host "📚 Comandos útiles:" -ForegroundColor Cyan
Write-Host "   • npm run db:migrate        (ejecutar migraciones pendientes)" -ForegroundColor Gray
Write-Host "   • npm run db:push           (sincronizar esquema actual)" -ForegroundColor Gray
Write-Host "   • npm run db:reset          (resetear BD completamente)" -ForegroundColor Gray
Write-Host "   • npm run prisma:validate   (validar schema.prisma)" -ForegroundColor Gray
Write-Host ""

Write-Host "🔗 URLs de verificación:" -ForegroundColor Cyan
Write-Host "   • API Docs:  http://localhost:3000/api/docs" -ForegroundColor Gray
Write-Host "   • Health:    http://localhost:3000/api/v1/health" -ForegroundColor Gray
Write-Host ""
