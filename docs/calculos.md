# Fórmulas y Cálculos - Ganadería Regenerativa

## Cálculos Fundamentales

### 1. Unidad Animal (UA)

**Definición**: Medida estándar de biomasa de ganado.

```
UA = Peso Total del Lote (kg) / 450 kg (estándar)

Ejemplo:
- Lote de 15 animales
- Peso promedio: 300 kg/animal
- Peso total: 15 × 300 = 4500 kg
- UA = 4500 / 450 = 10 UA
```

**Configuración por Finca**:
- Valor por defecto: 450 kg
- Algunos sistemas usan 500 kg
- Almacenado en `parameters.UAWeight`

### 2. Ganancia de Peso

#### Ganancia Absoluta (kg)

```
GANANCIA_KG = Peso Final - Peso Inicial

Ejemplo:
- Peso inicial (pesaje 1): 4500 kg
- Peso final (pesaje 5): 4900 kg
- Ganancia = 4900 - 4500 = 400 kg
```

#### Ganancia en UA

```
GANANCIA_UA = (Peso Final / 450) - (Peso Inicial / 450)
           = Ganancia_KG / 450

Ejemplo:
- Ganancia UA = 400 / 450 = 0.89 UA
```

#### Ganancia Diaria

```
GANANCIA_DIARIA = Ganancia_KG / Número de Días

Ejemplo (50 días entre pesajes):
- Ganancia diaria = 400 kg / 50 días = 8 kg/día
- Por animal: 8 kg/día / 15 animales = 0.53 kg/animal/día
```

#### Ganancia por Animal

```
GANANCIA_POR_ANIMAL = Ganancia_KG / Cantidad de Animales

Ejemplo:
- Ganancia por animal = 400 kg / 15 = 26.7 kg/animal
```

### 3. Demanda de Forraje

#### Demanda Diaria del Lote

```
DEMANDA_DIARIA = UA_TOTAL × (% PV Consumo Diario / 100)

% típico: 2.5% del Peso Vivo (rango: 2.0 - 3.0%)

Ejemplo:
- UA = 10 UA
- Demanda = 10 × 2.5% = 0.25 UA
- En kg = 10 × 450 × 2.5% = 112.5 kg/día
```

**Configuración**: `parameters.dailyDemandPercent`

#### Demanda por Animal

```
DEMANDA_POR_ANIMAL = DEMANDA_DIARIA / Cantidad de Animales

Ejemplo:
- 112.5 kg/día / 15 animales = 7.5 kg/animal/día
```

### 4. Cálculos de Rotación

#### Ocupación (Días en Potrero)

```
OCUPACION_DIAS = Fecha Salida - Fecha Entrada

Ejemplo:
- Entrada: 2024-01-15
- Salida: 2024-01-25
- Ocupación: 10 días
```

#### Forraje Disponible (Biom disponible)

```
FORRAJE_DISPONIBLE = kg/ha × Hectáreas × % Aprovechamiento

% aprovechamiento típico: 60% (rango: 50-70%)

Ejemplo:
- Aforo: 3000 kg/ha
- Potrero: 6 ha
- Aprovechamiento: 60%
- Disponible = 3000 × 6 × 0.60 = 10,800 kg
```

#### Días de Ocupación Recomendados

```
DIAS_RECOMENDADOS = FORRAJE_DISPONIBLE / DEMANDA_DIARIA

Ejemplo:
- Forraje disponible: 10,800 kg
- Demanda diaria: 112.5 kg
- Días recomendados = 10,800 / 112.5 = 96 días
```

**Interpretación**:
- Si ocupación actual < días recomendados: potrero tiene capacidad
- Si ocupación actual > días recomendados: riesgo de sobrepastoreo

#### Ciclo Completo de Rotación

```
CICLO_TOTAL = Ocupación × Número de Potreros

Regla típica:
- 40-55 días de ciclo total
- 8 potreros: 5-7 días ocupación cada uno
- 10 potreros: 4-5 días ocupación cada uno

Ejemplo (8 potreros):
- Ciclo = 5 días × 8 = 40 días
- Descanso entre ocupaciones: 35 días
```

### 5. Indicadores de Calidad Forrajera

#### Materia Seca (MS %)

```
MS % = (Peso Seco / Peso Fresco) × 100

Rangos típicos:
- Pasto fresco: 15-25% MS
- Heno: 85-90% MS
- Ensilaje: 30-35% MS
```

#### Proteína Bruta (PB %)

```
PB % = Contenido de proteína / Peso total × 100

Necesidades según fase:
- Becerros: 16-18% PB
- Novillas en crecimiento: 12-14% PB
- Vacas adultas: 10-12% PB
```

**Nota**: Almacenado como referencia en aforos para futuro análisis.

### 6. Eficiencia de Conversión

#### Conversión Alimenticia (CA)

```
CA = Alimento Consumido / Ganancia de Peso

Ejemplo:
- Consumo: 1800 kg (forraje + suplemento)
- Ganancia: 400 kg
- CA = 1800 / 400 = 4.5

Interpretación:
- CA = 4.5 significa que el animal necesita 4.5 kg de alimento
  para ganar 1 kg de peso
```

**Rangos esperados**:
- Buena: CA 4-5
- Regular: CA 5-6
- Pobre: CA > 6

#### Eficiencia de Pastoreo

```
EFICIENCIA = Ganancia Observada / Ganancia Esperada × 100%

Ganancia esperada:
- Novillas 18-24 meses: 0.8-1.0 kg/animal/día
- Vacas adultas: 0.3-0.5 kg/animal/día
- Toros: 0.5-0.7 kg/animal/día

Ejemplo:
- Ganancia observada: 0.6 kg/animal/día
- Ganancia esperada: 0.8 kg/animal/día
- Eficiencia = (0.6 / 0.8) × 100 = 75%
```

### 7. Alertas y Umbrales

#### Pesaje Vencido

```
ALERTA_PESAJE = Hoy - Último Pesaje > Umbral

Umbrales recomendados:
- Agroecológicos: 7 días
- Intensivos: 3-5 días
- Extensivos: 14-21 días

Configuración por finca recomendada
```

#### Sobrepastoreo

```
ALERTA_SOBREPASTOREO = Ocupación > Días Recomendados

Criterios:
- Ocupación > 70% de recomendación: Amarillo
- Ocupación > 100% de recomendación: Rojo
```

#### Bajo Crecimiento

```
ALERTA_BAJO_CRECIMIENTO = Ganancia Diaria < Umbral

Umbrales por tipo:
- Novillas 18-24 meses: < 0.6 kg/día
- Vacas adultas: < 0.2 kg/día
```

## Cálculos del Dashboard

### Resumen (Summary)

```
totalHerds = COUNT(herds WHERE farmId = ? AND deletedAt IS NULL)
totalAnimals = SUM(herd.animalCount)
totalWeight = SUM(herd.currentWeight)
totalUA = totalWeight / parameters.UAWeight
activePaddocks = COUNT(movements WHERE cycleId = currentCycle AND exitDate IS NULL)
averageWeightPerAnimal = totalWeight / totalAnimals
```

### Tendencias (Trends)

```
Para cada fecha en weighings:
- date: weighing.weightDate
- weight: weighing.totalWeight
- ua: weighing.totalWeight / parameters.UAWeight
- gain: weighing.totalWeight - previous.totalWeight (si existe)
```

Agrupado por:
- Día
- Semana
- Mes

### Rotación (RotationStatus)

```
Para cada movimiento activo:
{
  herdName: herd.name,
  paddockName: paddock.name,
  entryDate: movement.entryDate,
  occupancyDays: TODAY - entryDate,
  recommendedDays: forraje_disponible / demanda,
  status: "En tiempo" | "Próximo a vencer" | "Sobrepastoreo"
}
```

### Estadísticas Forraje (ForageStats)

```
Para últimos 30 días:
{
  paddockName: paddock.name,
  kgPerHectare: aforo.kgPerHectare,
  dryMatterPercent: aforo.dryMatterPercent,
  forageDays: kgPerHectare * hectares * 0.6 / demanda,
  sampleDate: aforo.sampleDate
}
```

### Alertas (Alerts)

```
1. Pesajes Vencidos:
   - Última pesaje de lote > 7 días
   - Alerta tipo "OVERDUE_WEIGHING"

2. Sobrepastoreo:
   - Ocupación > días recomendados
   - Alerta tipo "OVERGRAZING"

3. Bajo Crecimiento (futuro):
   - Ganancia < umbral configurado
   - Alerta tipo "LOW_GROWTH"

4. Aforo Vencido (futuro):
   - Último aforo > 30 días
   - Alerta tipo "STALE_FORAGE_DATA"
```

## Fórmulas Complejas del Ejemplo

### Ejemplo Completo: "Las Praderas"

**Datos Base**:
```
Finca: Las Praderas (50 ha)
Lote A: 15 novillas Brahman x Holstein
Potrero: "Potrero Sur" (6 ha)
Ciclo: 40 días (8 potreros × 5 días)
```

**Pesajes**:
```
Pesaje 1: 2024-01-01 → 4500 kg (300 kg/animal)
Pesaje 2: 2024-01-08 → 4560 kg (304 kg/animal)
Pesaje 3: 2024-01-15 → 4620 kg (308 kg/animal)
Pesaje 4: 2024-01-22 → 4780 kg (318.7 kg/animal)
Pesaje 5: 2024-01-29 → 4900 kg (326.7 kg/animal)
```

**Aforo "Potrero Sur"**: 3500 kg/ha, 22% MS

**Cálculos**:

```
1. UA Inicial
   UA = 4500 / 450 = 10 UA

2. UA Final (Pesaje 5)
   UA = 4900 / 450 = 10.89 UA

3. Ganancia Total (29 días)
   Ganancia = 4900 - 4500 = 400 kg
   Ganancia por animal = 400 / 15 = 26.7 kg
   Ganancia diaria = 400 / 29 = 13.8 kg/día
   Ganancia por animal/día = 13.8 / 15 = 0.92 kg/animal/día

4. Demanda Diaria
   Demanda = 10 UA × 2.5% = 0.25 UA = 112.5 kg/día

5. Forraje Disponible (Potrero Sur)
   Disponible = 3500 kg/ha × 6 ha × 0.60 = 12,600 kg

6. Días Recomendados
   Días = 12,600 / 112.5 = 112 días

7. Conversión Alimenticia (estimada)
   Forraje consumido = 112.5 kg/día × 5 días = 562.5 kg
   Ganancia en 5 días = 120 kg (400/29 × 5)
   CA = 562.5 / 120 = 4.7

8. Eficiencia de Crecimiento
   Ganancia esperada: 0.8 kg/animal/día (novilla 18-24 meses)
   Ganancia observada: 0.92 kg/animal/día
   Eficiencia = (0.92 / 0.80) × 100 = 115%  ✓ Excelente
```

**Dashboard Summary**:
```
{
  "totalHerds": 1,
  "totalAnimals": 15,
  "totalWeight": 4900,
  "totalUA": 10.89,
  "activePaddocks": 1,
  "averageWeightPerAnimal": 326.7
}
```

---

## Referencias

- FAO: Producción Ganadera y Sanidad Animal
- USDA: Nutrient Requirements of Beef Cattle
- CORPOICA: Sistemas de Rotación en Trópico
- ICA: Manual Técnico de Ganadería Sostenible
