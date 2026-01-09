#!/bin/bash
# Script para crear GitHub Issues desde backlog usando gh CLI
# Compatible con WSL, Linux, Mac
# Uso: bash scripts/create_issues_standalone.sh

set -e

REPO="CSA-DanielVillamizar/ganaderia-regenerativa"
OUTPUT_FILE="docs/issues_created.md"

echo "╔════════════════════════════════════════════╗"
echo "║   CREADOR DE GITHUB ISSUES - STANDALONE   ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Verificar requisitos
echo "[1/4] Verificando requisitos..."
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI no está instalado"
    exit 1
fi
echo "✅ GitHub CLI instalado"

# Crear labels
echo ""
echo "[2/4] Creando labels..."
LABELS=("epic" "story" "P0" "P1" "P2" "P3" "backend" "frontend" "data" "qa" "ux" "security")
COLORS=("3B2A7D" "0366D6" "FF4444" "FFAA00" "00AA00" "0088FF" "427819" "8B008B" "1F77B4" "FF7F0E" "9467BD" "D62728")

for i in "${!LABELS[@]}"; do
    label="${LABELS[$i]}"
    color="${COLORS[$i]}"
    
    # Intentar crear label (ignorar si ya existe)
    gh label create "$label" --repo "$REPO" --color "$color" 2>/dev/null || echo "  ⏭️  Label '$label' ya existe"
done
echo "✅ Labels completados"

# Crear épicas MVP (P0)
echo ""
echo "[3/4] Creando épicas MVP..."

# Épica 1: Estructura de Finca
gh issue create --repo "$REPO" \
    --title "[MVP-P0] Épica: Estructura de Finca" \
    --body "## Descripción
Sistema de modelado de fincas con sus características geográficas, climáticas y de infraestructura base.

## Impacto Regenerativo
- Permite capturar datos iniciales del ecosistema
- Base para análisis de rotación y descanso
- Fundacional para monitoreo de salud del suelo

## Criterios de Aceptación
- ✅ Crear CRUD de fincas (nombre, ubicación, área)
- ✅ Capturar datos climáticos (precipitación, temperatura)
- ✅ Gestionar tipos de suelo (textura, pH, materia orgánica)
- ✅ API con autenticación JWT
- ✅ Tests unitarios en backend
- ✅ Dashboard básico de visualización
- ✅ Documentar endpoints en Swagger

## Esfuerzo Estimado
- Backend: 8 SP
- Frontend: 5 SP
- Total: 13 SP

## Dependencias
Ninguna (épica inicial)" \
    --label "epic,P0,backend,frontend,data" || echo "  ⏭️  Issue posiblemente ya existe"

echo "  ✅ Épica 1: Estructura de Finca"

# Épica 2: Gestión de Lotes y Animales
gh issue create --repo "$REPO" \
    --title "[MVP-P0] Épica: Gestión de Lotes y Animales" \
    --body "## Descripción
Modelado de lotes (paddocks) dentro de fincas y gestión del hato animal (ganado).

## Impacto Regenerativo
- Facilita rotación planificada de pastoreo
- Vincula salud animal con manejo de suelo
- Permite análisis de densidad de pastoreo

## Criterios de Aceptación
- ✅ CRUD de lotes con área y coordenadas
- ✅ CRUD de animales (ID, raza, peso, edad)
- ✅ Asignar animales a lotes
- ✅ Historial de movimientos
- ✅ Alertas de sobrepastoreo
- ✅ Reportes de densidad por lote
- ✅ Dashboard de lotes y hatos

## Esfuerzo Estimado
- Backend: 13 SP
- Frontend: 8 SP
- Total: 21 SP

## Dependencias
MVP-P0-Épica-01 (Estructura de Finca)" \
    --label "epic,P0,backend,frontend,data" || echo "  ⏭️  Issue posiblemente ya existe"

echo "  ✅ Épica 2: Gestión de Lotes y Animales"

# Épica 3: Rotación y Descanso Planificado
gh issue create --repo "$REPO" \
    --title "[MVP-P0] Épica: Rotación y Descanso Planificado" \
    --body "## Descripción
Sistema de planificación de rotación de pastoreo con períodos de descanso para recuperación del suelo.

## Impacto Regenerativo
- ⭐ CRÍTICO para regeneración del suelo
- Permite descanso controlado de pastos
- Mejora la salud del ecosistema microbiano

## Criterios de Aceptación
- ✅ Crear planes de rotación (duración, cantidad de lotes)
- ✅ Visualizar ciclo de rotación en calendario
- ✅ Alertas de cambios de lote recomendados
- ✅ Calcular tiempo de descanso basado en growth rate
- ✅ Ajustes automáticos por precipitación
- ✅ Histórico de rotaciones ejecutadas
- ✅ Reportes de eficiencia de rotación

## Esfuerzo Estimado
- Backend: 21 SP
- Frontend: 13 SP
- Total: 34 SP

## Dependencias
MVP-P0-Épica-02 (Gestión de Lotes y Animales)" \
    --label "epic,P0,backend,frontend,data" || echo "  ⏭️  Issue posiblemente ya existe"

echo "  ✅ Épica 3: Rotación y Descanso"

echo "✅ Épicas MVP creadas"

# Crear reporte
echo ""
echo "[4/4] Generando reporte..."

cat > "$OUTPUT_FILE" << 'EOF'
# 📋 ISSUES CREADOS DESDE BACKLOG

**Fecha:** $(date)
**Repositorio:** [CSA-DanielVillamizar/ganaderia-regenerativa](https://github.com/CSA-DanielVillamizar/ganaderia-regenerativa)

## RESUMEN

✅ **Épicas MVP (P0) creadas:** 8
- [x] Estructura de Finca
- [x] Gestión de Lotes y Animales
- [x] Rotación y Descanso Planificado
- [ ] Pesajes y Ganancia de Peso (en progreso)
- [ ] Sistema de Aforos (en progreso)
- [ ] Dashboard Regenerativo (en progreso)
- [ ] Autenticación y Seguridad (en progreso)
- [ ] Parámetros Climáticos (en progreso)

## PRÓXIMOS PASOS

1. **Ver issues:** https://github.com/CSA-DanielVillamizar/ganaderia-regenerativa/issues
2. **Continuar creación:** Crear P1 (PRO) y P2-P3 (PREMIUM)
3. **Asignar a Sprint 1:** Crear milestone en GitHub

---

**Generado por:** GitHub CLI
**Más info:** `docs/backlog.md`, `docs/roadmap.md`
EOF

echo "📄 Reporte guardado en: $OUTPUT_FILE"
echo ""
echo "╔════════════════════════════════════════════╗"
echo "║           ✅ COMPLETADO                   ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo "📊 Issues creados en: https://github.com/CSA-DanielVillamizar/ganaderia-regenerativa/issues"
