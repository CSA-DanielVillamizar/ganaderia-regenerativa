# Módulo de Indicadores Regenerativos

## Descripción General

Módulo especializado en el cálculo y análisis de indicadores de sostenibilidad para sistemas regenerativos de ganadería. Proporciona métricas avanzadas de salud de pastura, presión de pastoreo, índices de recuperación y sostenibilidad global.

## Características Principales

### 1. Cálculo de Indicadores Regenerativos

El módulo calcula automáticamente 4 indicadores clave:

#### **Presión de Pastoreo (UA/hectárea)**
- **Fórmula**: `Total UA / Hectáreas disponibles`
- **Rango Óptimo**: 0.5 - 3.0 UA/ha
- **Significado**: Mide intensidad de uso del pasto
- **Implicaciones**:
  - **< 0.5**: Subutilización, poco impacto regenerativo
  - **0.5-3.0**: Óptimo para compactación y estimulación
  - **> 3.0**: Sobrepastoreo, riesgo de degradación

#### **Índice de Recuperación (Ratio Descanso/Ocupación)**
- **Fórmula**: `Días de descanso promedio / Días de ocupación promedio`
- **Rango Óptimo**: ≥ 2.0
- **Significado**: Capacidad del pasto de recuperarse entre ocupaciones
- **Implicaciones**:
  - **< 1.5**: Recuperación crítica, aumenta período de descanso
  - **1.5-2.0**: Recuperación limitada, monitora próximas rotaciones
  - **≥ 2.0**: Recuperación adecuada, sistema en equilibrio

#### **Disponibilidad de Forraje (kg MS/ha)**
- **Fórmula**: `Última medición de MS x hectáreas / Consumo UA`
- **Estimado**: `Días de forraje disponible = kg MS/ha ÷ (Total UA × 10)`
- **Rango Óptimo**: ≥ 1500 kg MS/ha
- **Significado**: Cantidad de materia seca disponible para consumo
- **Implicaciones**:
  - **< 500**: Crítico, riesgo de desnutrición
  - **500-1000**: Limitado, monitoreo de consumo
  - **≥ 1500**: Suficiente para alimentación

#### **Score de Sostenibilidad Global (0-1)**
- **Fórmula**: Combinación ponderada de:
  - Presión óptima: +0.25
  - Recuperación adecuada: +0.25
  - Forraje disponible: +0.25
  - Base: 0.5
- **Rangos**:
  - **≥ 0.8**: EXCELENTE - Sistema en buen estado regenerativo
  - **0.6-0.8**: BUENO - Sistema funcionando adecuadamente
  - **0.4-0.6**: REGULAR - Requiere ajustes
  - **< 0.4**: CRÍTICO - Revisión completa del sistema

## Endpoints de la API

### GET `/api/v1/indicators/farms/:farmId`

Obtiene indicadores regenerativos completos de una finca.

**Parámetros de Consulta:**
- `days` (opcional): Número de días a analizar (1-365, default: 30)

**Ejemplo de Solicitud:**
```bash
curl -X GET "http://localhost:3001/api/v1/indicators/farms/farm-123?days=30" \
  -H "Authorization: Bearer <token>"
```

**Respuesta (200 OK):**
```json
{
  "farm": {
    "id": "farm-123",
    "name": "Finca Regenerativa"
  },
  "period": {
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T00:00:00.000Z",
    "daysAnalyzed": 30
  },
  "pastureHealth": {
    "pastorePressure": 1.5,
    "recoveryIndex": 2.1,
    "forageLevelKgMSHa": 1800,
    "sustainabilityScore": 0.85,
    "details": {
      "totalUA": 150,
      "farmHectares": 100,
      "avgOccupancyDays": 7,
      "avgRestDays": 30,
      "forageAvailableDays": 42
    }
  },
  "trends": {
    "pastorePressure": {
      "current": 1.5,
      "previous": 1.3,
      "trend": "INCREASING",
      "change": 0.2
    },
    "forageAvailability": {
      "current": 1800,
      "previous": 2000,
      "trend": "DECREASING",
      "change": -200
    },
    "recoveryProgress": {
      "current": 2.1,
      "previous": 1.9,
      "trend": "IMPROVING",
      "change": 0.2
    }
  },
  "recommendations": [
    "✅ Presión de pastoreo dentro de rango óptimo (0.5-3 UA/ha)",
    "✅ Período de descanso adecuado para recuperación del forraje",
    "✅ Forraje disponible suficiente (>1500 kg MS/ha)",
    "🟢 EXCELENTE: Sistema regenerativo en buen estado de salud sostenible"
  ],
  "paddockAnalysis": [
    {
      "paddockId": "paddock-1",
      "paddockName": "Potrero Norte",
      "currentState": "RESTING",
      "daysInState": 15,
      "recoveryProgress": 50,
      "recommendedAction": "🌱 En descanso. Permite recuperación completa"
    },
    {
      "paddockId": "paddock-2",
      "paddockName": "Potrero Sur",
      "currentState": "READY",
      "daysInState": 45,
      "recoveryProgress": 100,
      "recommendedAction": "✅ Listo para ocupar. Considera rotación"
    }
  ]
}
```

---

### GET `/api/v1/indicators/farms/:farmId/trends`

Análisis comparativo de indicadores con período anterior.

**Parámetros:**
- `farmId` (requerido): ID de la finca

**Respuesta (200 OK):**
```json
{
  "farm": {
    "id": "farm-123",
    "name": "Finca Regenerativa"
  },
  "period": {
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T00:00:00.000Z",
    "daysAnalyzed": 30
  },
  "trends": {
    "pastorePressure": {
      "current": 1.5,
      "previous": 1.3,
      "trend": "INCREASING",
      "change": 0.2
    },
    "forageAvailability": {
      "current": 1800,
      "previous": 2000,
      "trend": "DECREASING",
      "change": -200
    },
    "recoveryProgress": {
      "current": 2.1,
      "previous": 1.9,
      "trend": "IMPROVING",
      "change": 0.2
    }
  },
  "recommendations": [
    "📊 Tendencia: Presión de pastoreo en aumento. Prepara rotación más rápida",
    "📉 Tendencia: Forraje disponible disminuyendo. Espaciar movimientos"
  ],
  "analysisDate": "2024-01-31T12:00:00.000Z"
}
```

---

### GET `/api/v1/indicators/farms/:farmId/recovery-analysis`

Análisis detallado de recuperación por potrero.

**Parámetros:**
- `farmId` (requerido): ID de la finca

**Respuesta (200 OK):**
```json
{
  "farm": {
    "id": "farm-123",
    "name": "Finca Regenerativa"
  },
  "period": {
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T00:00:00.000Z",
    "daysAnalyzed": 30
  },
  "paddockAnalysis": [
    {
      "paddockId": "paddock-1",
      "paddockName": "Potrero Norte",
      "currentState": "RESTING",
      "daysInState": 15,
      "recoveryProgress": 50,
      "recommendedAction": "🌱 En descanso. Permite recuperación completa"
    },
    {
      "paddockId": "paddock-2",
      "paddockName": "Potrero Sur",
      "currentState": "READY",
      "daysInState": 45,
      "recoveryProgress": 100,
      "recommendedAction": "✅ Listo para ocupar. Considera rotación"
    }
  ],
  "recoveryIndexOverall": 2.1,
  "recommendation": "Recuperación adecuada. Sistema en equilibrio"
}
```

---

### GET `/api/v1/indicators/farms/:farmId/sustainability`

Score integral de sostenibilidad con desglose de factores.

**Parámetros:**
- `farmId` (requerido): ID de la finca

**Respuesta (200 OK):**
```json
{
  "farm": {
    "id": "farm-123",
    "name": "Finca Regenerativa"
  },
  "sustainabilityScore": 0.85,
  "scoreLevel": "EXCELENTE",
  "factors": {
    "pastorePressure": {
      "value": 1.5,
      "ideal": "0.5-3.0 UA/ha",
      "status": "ÓPTIMO"
    },
    "recoveryIndex": {
      "value": 2.1,
      "ideal": "≥ 2.0",
      "status": "ÓPTIMO"
    },
    "forageLevel": {
      "value": 1800,
      "ideal": "≥ 1500 kg MS/ha",
      "status": "ÓPTIMO"
    }
  },
  "recommendations": [
    "✅ Presión de pastoreo dentro de rango óptimo (0.5-3 UA/ha)",
    "✅ Período de descanso adecuado para recuperación del forraje",
    "✅ Forraje disponible suficiente (>1500 kg MS/ha)",
    "🟢 EXCELENTE: Sistema regenerativo en buen estado de salud sostenible"
  ],
  "analysisDate": "2024-01-31T12:00:00.000Z"
}
```

---

## Lógica de Cálculos Detallada

### Presión de Pastoreo
```
pastorePressure = totalUA / farmHectares

Ejemplo:
- Total UA: 150 animales × 0.5 UA/animal = 75 UA
- Hectáreas: 50 ha
- Presión: 75 / 50 = 1.5 UA/ha ✅ ÓPTIMO
```

### Índice de Recuperación
```
recoveryIndex = avgRestDays / avgOccupancyDays

Ejemplo:
- Ocupación promedio: 7 días
- Descanso mínimo: 30 días (configurable por parámetro)
- Índice: 30 / 7 = 4.28 ✅ EXCELENTE
```

### Disponibilidad de Forraje
```
forageAvailableDays = kgMSPerHa / (totalUA × 10)

Donde:
- kgMSPerHa: Última medición de materia seca
- 10 kg/día: Consumo estimado por UA
- Ejemplo: 1800 kg/ha / (75 UA × 10) = 2.4 meses
```

### Score de Sostenibilidad
```
sustainabilityScore = 0.5 + factors

Factores:
- Presión 0.5-3.0 UA/ha: +0.25
- Recuperación ≥ 2.0: +0.25
- Forraje ≥ 1500 kg/ha: +0.25

Ejemplo:
- Base: 0.5
- Presión óptima: +0.25
- Recuperación adecuada: +0.25
- Forraje suficiente: +0.25
- Total: 0.5 + 0.25 + 0.25 + 0.25 = 1.0 (CAPPED at 1.0)
```

## Validaciones

1. **Acceso a Finca**: Verifica que el usuario tenga permisos de lectura
2. **Período de Análisis**: Valida rango de días (1-365)
3. **Datos de Entrada**: Requiere movimientos, aforos y parámetros válidos
4. **Integridad de Fechas**: Valida coherencia de fechas de entrada/salida

## Recomendaciones Automáticas

El sistema genera recomendaciones contextuales basadas en:

- **Presión de pastoreo**: Intensidad de carga animal
- **Recuperación**: Tiempo de descanso vs. ocupación
- **Forraje**: Disponibilidad de alimento
- **Sostenibilidad**: Score integral
- **Tendencias**: Cambios en 30 últimos días

Ejemplo de recomendaciones automáticas:
```
⚠️ ALTO: Presión de pastoreo superior a lo ideal (>3 UA/ha). 
         Reduce carga o aumenta área

🔴 CRÍTICO: Descanso insuficiente (ratio <1.5). 
           Aumenta período de reposo

📊 Tendencia: Presión de pastoreo en aumento. 
             Prepara rotación más rápida
```

## Análisis por Potrero

Cada potrero se analiza por:

- **Estado Actual**: READY, OCCUPIED, RESTING, RECOVERING
- **Días en Estado**: Cuánto tiempo ha estado en ese estado
- **Progreso de Recuperación**: Porcentaje de descanso completado (0-100%)
- **Acción Recomendada**: Decisión operativa basada en estado

Estados posibles:
- **READY**: Listo para ocupar, ha completado descanso
- **OCCUPIED**: Ganado dentro del potrero
- **RESTING**: En período de descanso (< 30 días)
- **RECOVERING**: En recuperación activa

## Uso Típico en Dashboard

```javascript
// Frontend Next.js
const [indicators, setIndicators] = useState(null);

useEffect(() => {
  fetch(`/api/v1/indicators/farms/${farmId}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(r => r.json())
  .then(data => setIndicators(data));
}, [farmId]);

// Renderizar
<div>
  <div className="metric">
    <span className="value">{indicators?.pastureHealth.sustainabilityScore}</span>
    <span className="label">Score de Sostenibilidad</span>
  </div>
  
  <div className="metric">
    <span className="value">{indicators?.pastureHealth.pastorePressure} UA/ha</span>
    <span className="label">Presión de Pastoreo</span>
  </div>
  
  <div className="trends">
    {indicators?.trends.pastorePressure.trend === 'INCREASING' && (
      <alert>Presión aumentando - prepara rotación</alert>
    )}
  </div>
</div>
```

## Caché y Performance

- Indicadores se calculan bajo demanda (no pre-cacheados)
- Requiere datos de: movimientos (últimos 30 días), aforos, parámetros
- Tiempo típico de respuesta: 200-500ms
- Optimización: Índices en Movement.entryDate y ForageSample.createdAt

## Seguridad

- ✅ Todo acceso requiere JwtAuthGuard
- ✅ Validación de propiedad de finca (userFarm)
- ✅ Inyección de Prisma (ORM seguro)
- ✅ Input validation en Query params
- ✅ No expone datos de otros usuarios/fincas

## Pruebas Unitarias

Archivo: `indicators.service.spec.ts`

Cobertura:
- ✅ Cálculo de indicadores (presión, recuperación, sostenibilidad)
- ✅ Validación de acceso a finca
- ✅ Generación de recomendaciones
- ✅ Análisis de potreros
- ✅ Cálculo de tendencias

Ejecutar:
```bash
npm test -- indicators.service
```

## Roadmap Fase 2

- [ ] Dashboard widgets para indicadores
- [ ] Alertas automáticas basadas en umbrales
- [ ] Exportación de reportes (PDF/Excel)
- [ ] Predicción de tendencias (ML)
- [ ] Benchmarking entre fincas

## Referencias Técnicas

- Modelos Prisma: Farm, Movement, ForageSample, Parameter, Paddock
- Guardias: JwtAuthGuard
- Excepciones: ForbiddenException, NotFoundException, BadRequestException
- DTO Pattern: Request body validation con Zod

## Soporte

Para consultas o mejoras al módulo, contacta al equipo de desarrollo.
