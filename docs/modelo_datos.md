# Modelo de Datos - Ganadería Regenerativa

## Tablas Principales

### users

Almacena usuarios del sistema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Clave primaria |
| email | String | Email único |
| password | String | Hash bcrypt |
| firstName | String | Nombre |
| lastName | String | Apellido |
| role | Enum | ADMIN, TECHNICIAN, MANAGER, VIEWER |
| createdAt | DateTime | Creación |
| updatedAt | DateTime | Actualización |
| deletedAt | DateTime? | Soft delete |

### farms

Fincas/granjas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Clave primaria |
| name | String | Nombre finca |
| location | String | Municipio/región |
| totalHectares | Float | Ha totales |
| createdBy | UUID | Usuario que crea |
| createdAt | DateTime | Creación |
| updatedAt | DateTime | Actualización |
| deletedAt | DateTime? | Soft delete |

### user_farms

Permisos usuario-finca (relación many-to-many).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Clave primaria |
| userId | UUID | Referencia a users |
| farmId | UUID | Referencia a farms |
| role | Enum | ADMIN, MANAGER, VIEWER |

Restricción: `UNIQUE(userId, farmId)`

### paddocks

Potreros (parcelas de pastoreo).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Clave primaria |
| farmId | UUID | Referencia a farms |
| name | String | Ej. "Potrero A1" |
| hectares | Float | Tamaño hectáreas |
| description | String? | Notas |
| createdAt | DateTime | Creación |
| updatedAt | DateTime | Actualización |
| deletedAt | DateTime? | Soft delete |

Índice en `farmId` para queries rápidas.

### herds

Lotes (grupos de animales).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Clave primaria |
| farmId | UUID | Referencia a farms |
| name | String | Ej. "Lote A" |
| animalCount | Int | Cantidad animales |
| breed | String | Raza |
| currentWeight | Float | Peso total kg actual |
| notes | String? | Notas |
| createdAt | DateTime | Creación |
| updatedAt | DateTime | Actualización |
| deletedAt | DateTime? | Soft delete |

Índice en `farmId`.

### animals

Animales individuales.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Clave primaria |
| herdId | UUID | Referencia a herds |
| earTag | String | Número de caravana |
| gender | Enum | MALE, FEMALE |
| birthDate | DateTime | Fecha nacimiento |
| weight | Float | Peso kg |
| notes | String? | Notas |
| createdAt | DateTime | Creación |

Índice en `herdId`, unique en `(herdId, earTag)`.

### weighings

Pesajes (registros de peso).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Clave primaria |
| herdId | UUID | Referencia a herds |
| totalWeight | Float | Peso total kg |
| animalCount | Int | Cantidad animales |
| weightDate | DateTime | Fecha pesaje |
| notes | String? | Notas |
| createdBy | UUID | Usuario registra |
| createdAt | DateTime | Creación |
| updatedAt | DateTime | Actualización |

Índice en `herdId`, `weightDate` para trends.

### cycles

Ciclos de rotación.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Clave primaria |
| farmId | UUID | Referencia a farms |
| name | String | Ej. "Ciclo Q4 2024" |
| startDate | DateTime | Inicio |
| endDate | DateTime? | Fin (null = activo) |
| status | Enum | PLANNING, ACTIVE, COMPLETED |
| description | String? | Detalles |
| createdAt | DateTime | Creación |
| updatedAt | DateTime | Actualización |

Índice en `farmId`, `status`.

### movements

Movimientos de entrada/salida a potreros.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Clave primaria |
| herdId | UUID | Referencia a herds |
| paddockId | UUID | Referencia a paddocks |
| cycleId | UUID? | Referencia a cycles |
| entryDate | DateTime | Entrada |
| exitDate | DateTime? | Salida (null = activo) |
| type | Enum | ENTRY, EXIT |
| notes | String? | Notas |
| createdAt | DateTime | Creación |

Índice en `herdId`, `paddockId`, `cycleId`.

### forage_samples

Aforos (muestras de forraje).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Clave primaria |
| paddockId | UUID | Referencia a paddocks |
| farmId | UUID | Referencia a farms |
| kgPerHectare | Float | kg/ha estimado |
| dryMatterPercent | Float | MS% (materia seca) |
| sampleDate | DateTime | Fecha muestreo |
| notes | String? | Notas |
| createdBy | UUID | Usuario registra |
| createdAt | DateTime | Creación |

Índice en `paddockId`, `farmId`, `sampleDate`.

### parameters

Parámetros de cálculo por finca.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Clave primaria |
| farmId | UUID | Referencia a farms |
| UAWeight | Float | Peso UA (default 450) |
| dailyDemandPercent | Float | % PV demanda diaria (default 2.5) |
| forageDryMatterPercent | Float | MS% promedio forraje |
| description | String? | Notas |
| updatedAt | DateTime | Última actualización |

### audit_logs

Bitácora de cambios.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Clave primaria |
| userId | UUID | Usuario que realizó |
| entityType | String | Ej. "Herd", "Weighing" |
| entityId | UUID | ID de la entidad |
| action | String | "CREATE", "UPDATE", "DELETE" |
| changes | JSON | Cambios realizados |
| createdAt | DateTime | Timestamp |

Índice en `userId`, `entityType`, `createdAt`.

## Relaciones Clave

```
User
  ├──→ UserFarm (many-to-many a Farm)
  ├──→ AuditLog (auditoría)
  └──→ Weighing (pesajes registrados)

Farm
  ├──→ UserFarm (acceso de usuarios)
  ├──→ Paddocks (potreros)
  ├──→ Herds (lotes)
  ├──→ Cycles (ciclos)
  ├──→ ForageSamples (aforos)
  └──→ Parameters (configuración)

Paddock
  ├──→ Movements (entrada/salida)
  └──→ ForageSamples (aforos)

Herd
  ├──→ Animals (animales)
  ├──→ Weighings (pesajes)
  └──→ Movements (rotación)

Animal
  └──→ Herd (pertenencia)

Weighing
  └──→ Herd (pesaje de)

Cycle
  ├──→ Farm (pertenencia)
  └──→ Movements (rotaciones en ciclo)

Movement
  ├──→ Herd (lote que se mueve)
  ├──→ Paddock (destino)
  └──→ Cycle (ciclo asociado)

ForageSample
  ├──→ Paddock (dónde se muestreó)
  └──→ Farm (referencia)
```

## Enums

### Role (User)

```
ADMIN      - Acceso total
TECHNICIAN - Gestión técnica
MANAGER    - Supervisión
VIEWER     - Solo lectura
```

### AnimalGender

```
MALE       - Macho
FEMALE     - Hembra
```

### CycleStatus

```
PLANNING   - En planificación
ACTIVE     - Activo
COMPLETED  - Finalizado
```

### MovementType

```
ENTRY      - Entrada a potrero
EXIT       - Salida del potrero
```

## Cálculos Derivados (No Almacenados)

### UA (Unidades Animales)

```sql
UA = herd.currentWeight / parameters.UAWeight

Ejemplo: 4500 kg / 450 kg = 10 UA
```

### Ganancia Kg

```sql
GANANCIA_KG = peso_final - peso_inicial

De la tabla weighings:
- Calcular diferencia entre último y primer peso
- Período típico: 1-4 semanas
```

### Ganancia UA

```sql
GANANCIA_UA = (peso_final / 450) - (peso_inicial / 450)
```

### Demanda Diaria

```sql
DEMANDA_DIARIA = UA_TOTAL * parameters.dailyDemandPercent / 100

Ejemplo: 10 UA * 2.5% = 0.25 (250 kg PV/día)
```

### Días de Ocupación

```sql
OCUPACION_DIAS = EXTRACT(DAY FROM movements.exitDate - movements.entryDate)
```

### Forraje Disponible

```sql
FORRAJE_DISPONIBLE = 
  forage_samples.kgPerHectare 
  * paddock.hectares 
  * 0.60  -- Aprovechamiento típico 60%
```

### Días Recomendados en Potrero

```sql
DIAS_RECOMENDADOS = FORRAJE_DISPONIBLE / DEMANDA_DIARIA
```

## Índices (Performance)

Creados automáticamente en Prisma:

```sql
CREATE INDEX weighings_herdId_weightDate 
  ON weighings(herdId, weightDate DESC);

CREATE INDEX movements_herdId_paddockId 
  ON movements(herdId, paddockId);

CREATE INDEX forage_samples_paddockId_sampleDate 
  ON forage_samples(paddockId, sampleDate DESC);

CREATE INDEX user_farms_userId_farmId 
  ON user_farms(userId, farmId);

CREATE UNIQUE INDEX animals_herdId_earTag 
  ON animals(herdId, earTag);
```

## Constraints

```sql
-- Solo un lote activo por potrero
-- Implementado a nivel aplicación

-- Email único
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE(email);

-- UserFarm única
ALTER TABLE user_farms ADD CONSTRAINT user_farms_unique UNIQUE(userId, farmId);

-- EarTag único por lote
ALTER TABLE animals ADD CONSTRAINT animals_unique UNIQUE(herdId, earTag);
```

---

Para cambios al esquema usar:
```bash
npx prisma migrate dev --name "descripción_cambio"
npx prisma generate
```
