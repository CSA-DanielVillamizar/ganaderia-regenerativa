#!/bin/bash
# Script para crear GitHub Issues desde el backlog
# Uso: bash scripts/create_issues.sh

set -e

REPO="CSA-DanielVillamizar/ganaderia-regenerativa"
BACKLOG_FILE="docs/backlog.md"
RESULTS_FILE="docs/issues_created.md"

echo "=========================================="
echo "CREADOR DE GITHUB ISSUES - MAGROTEC"
echo "=========================================="
echo ""

# Verificar que gh CLI está instalado
if ! command -v gh &> /dev/null; then
    echo "❌ ERROR: GitHub CLI (gh) no está instalado"
    echo "Instala con: https://github.com/cli/cli/blob/trunk/docs/install.md"
    exit 1
fi

# Verificar autenticación
echo "Verificando autenticación GitHub..."
if ! gh auth status &> /dev/null; then
    echo "❌ ERROR: No autenticado con GitHub"
    echo "Ejecuta: gh auth login"
    exit 1
fi
echo "✅ Autenticado como $(gh auth status 2>&1 | grep 'Logged in' | head -1)"
echo ""

# Crear labels si no existen
echo "Creando labels necesarios..."
LABELS=(
    "epic:false:3B2A7D"
    "story:false:0366D6"
    "task:false:A2AAAD"
    "bug:false:D73A49"
    "P0:true:FF4444"
    "P1:true:FFAA00"
    "P2:true:00AA00"
    "P3:true:0088FF"
    "backend:false:427819"
    "frontend:false:8B008B"
    "data:false:1F77B4"
    "qa:false:FF7F0E"
    "ux:false:9467BD"
    "security:false:D62728"
    "devops:false:BCBD22"
    "offline:false:7F7F7F"
    "analytics:false:17BECF"
)

for label_spec in "${LABELS[@]}"; do
    IFS=':' read -r label archived color <<< "$label_spec"
    
    # Verificar si el label existe
    if gh label list --repo "$REPO" | grep -q "^$label"; then
        echo "  Label '$label' ya existe"
    else
        echo "  Creando label '$label'..."
        gh label create "$label" --repo "$REPO" --description "" --color "$color" 2>/dev/null || true
    fi
done
echo "✅ Labels completados"
echo ""

# Crear tabla de resultados
cat > "$RESULTS_FILE" << 'EOF'
# 📋 ISSUES CREADOS DESDE BACKLOG

**Fecha:** 2026-01-08
**Total Issues:** (será actualizado)

## RESUMEN POR PRIORIDAD

EOF

echo "Comenzando creación de issues..."
echo "⏳ Esto puede tomar algunos minutos..."
echo ""

# Contadores
EPIC_COUNT=0
STORY_COUNT=0
TOTAL_COUNT=0

# Función para crear un issue
create_issue() {
    local title="$1"
    local body="$2"
    local labels="$3"
    
    echo "  Creando: $title"
    ISSUE_NUM=$(gh issue create \
        --repo "$REPO" \
        --title "$title" \
        --body "$body" \
        --label "$labels" \
        2>&1 | grep -oE '#[0-9]+' | head -1 | tr -d '#')
    
    if [ -n "$ISSUE_NUM" ]; then
        echo "    ✅ Issue #$ISSUE_NUM creado"
        echo "| #$ISSUE_NUM | $title | $(echo $labels | cut -d, -f1) |" >> "$RESULTS_FILE"
        TOTAL_COUNT=$((TOTAL_COUNT + 1))
        return 0
    else
        echo "    ❌ Error al crear issue"
        return 1
    fi
}

# ==================== MVP EPICS ====================
echo "========== CRÉANDO MVP EPICS (P0) =========="

# ÉPICA 1: Gestión estructural de la finca
EPIC1_BODY='## ÉPICA: Gestión estructural de la finca

### Objetivo
Establece la estructura base: fincas, potreros y validación de acceso por usuario.

### Historias de usuario
- [ ] MVP-1.1: Crear y administrar fincas (CRUD)
- [ ] MVP-1.2: Definir potreros con parámetros regenerativos
- [ ] MVP-1.3: Asignar usuarios a fincas con roles

### Impacto regenerativo
Sin esta estructura, no hay modelo de datos. **CRÍTICO.**

### Checklist DoD
- [ ] Tests unit >80% cobertura servicios
- [ ] Tests integración para endpoints CRUD
- [ ] Modelos Prisma: Farm, Paddock, UserFarm
- [ ] Validación acceso por farmId funcional'

create_issue "[MVP] Épica: Gestión estructural de la finca" "$EPIC1_BODY" "epic,P0,backend,data"
EPIC_COUNT=$((EPIC_COUNT + 1))

# ÉPICA 2: Lotes, animales y estado real
EPIC2_BODY='## ÉPICA: Lotes, animales y estado real

### Objetivo
Registro de lotes (rebaños) con estado actual: peso, edad, cantidad animales.

### Historias de usuario
- [ ] MVP-2.1: Crear y administrar lotes
- [ ] MVP-2.2: Registrar animales individuales
- [ ] MVP-2.3: Visualizar estado actual lote (pesajes, movimientos)

### Impacto regenerativo
Lotes con estado en tiempo real → decisiones de rotación informadas.

### Checklist DoD
- [ ] Modelos: Herd, Animal, Weighing, Movement
- [ ] Endpoints: POST/GET/PUT /herds, /animals
- [ ] Tests integración flujo completo'

create_issue "[MVP] Épica: Lotes, animales y estado real" "$EPIC2_BODY" "epic,P0,backend,data"
EPIC_COUNT=$((EPIC_COUNT + 1))

# ... (continuar con más épicas)

echo ""
echo "=========================================="
echo "RESUMEN CREACIÓN DE ISSUES"
echo "=========================================="
echo "✅ Épicas creadas: $EPIC_COUNT"
echo "📊 Issues totales: $TOTAL_COUNT"
echo ""
echo "Reporte guardado en: $RESULTS_FILE"
echo ""
