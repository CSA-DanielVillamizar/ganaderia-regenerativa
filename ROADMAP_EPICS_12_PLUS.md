# 🗺️ Hoja de Ruta: Épicas Siguientes (Épica 12+)

**Documento:** Planificación técnica post-Offline-First  
**Versión:** 1.0  
**Fecha:** 12 de enero de 2026

---

## 📊 Estado Actual: ✅ Épica 1 COMPLETADA

| Épica | Nombre | Status | Entrega |
|-------|--------|--------|---------|
| 1 | Offline-First (RxDB + Sync) | ✅ Completa | 2026-01-12 |
| 2 | Lógica Agronómica Avanzada | 🔲 Pendiente | 2026-01-26 |
| 3 | Infraestructura de Producción | 🔲 Pendiente | 2026-02-15 |
| 4 | PWA + Mobile UX | 🔲 Pendiente | 2026-03-01 |

---

## 🎯 ÉPICA 12: Refactorizar Otros Servicios Offline-First

**Prioridad:** 🔴 CRÍTICA  
**Estimado:** 2-3 horas  
**Dependencias:** Épica 1 (✅ Completa)

### Descripción
Aplicar el patrón offline-first a los servicios `movement.service.ts` y `weighing.service.ts`, siguiendo exactamente el mismo patrón que `forage.service.ts`.

### Tareas

#### 12.1 Refactorizar `movement.service.ts`
```
Status: 🔲 No iniciado
Estimado: 1 hora

Pasos:
1. ✅ Abrir apps/web/src/services/movement.service.ts
2. ✅ Refactorizar createMovement():
   - Generar localId
   - Insertar en db.movements
   - Encolar con enqueueSyncOperation()
   - Devolver respuesta optimista
   
3. ✅ Refactorizar getByHerd():
   - Obtener movimientos locales pendientes
   - Obtener movimientos remotos (si hay red)
   - Combinar inteligentemente
   - Devolver merged array
   
4. ✅ Agregar test manual (formulario)

Criterios de Aceptación:
- ✅ Movimientos se guardan localmente primero
- ✅ UI muestra movimiento inmediatamente
- ✅ Sincroniza cuando hay red
- ✅ Build sin errores
- ✅ @shared no es importado
```

#### 12.2 Refactorizar `weighing.service.ts`
```
Status: 🔲 No iniciado
Estimado: 1 hora

Pasos:
1. ✅ Abrir apps/web/src/services/weighing.service.ts
2. ✅ Refactorizar createWeighing():
   - Generar localId
   - Insertar en db.weighings
   - Encolar sincronización
   - Devolver respuesta optimista
   
3. ✅ Refactorizar getByHerd():
   - Merge local + remoto
   
4. ✅ Agregar cálculos locales:
   - averageWeightKg = totalWeightKg / numberOfAnimals
   - newHerdUA = calculateUA(averageWeightKg)
   
5. ✅ Test manual

Criterios de Aceptación:
- ✅ Pesajes guardados localmente
- ✅ Cálculos en tiempo real (UA/animal)
- ✅ Sincronización automática
- ✅ Build OK
```

#### 12.3 Validar Integración Completa
```
Status: 🔲 No iniciado
Estimado: 30 minutos

Tests:
1. ✅ Crear aforo + movimiento + pesaje en offline
2. ✅ Ver todos 3 en UI con status 'pending'
3. ✅ Indicador muestra "3 pendientes"
4. ✅ Conectar a internet
5. ✅ Verificar que los 3 se sincronizan
6. ✅ Indicador ahora muestra "0 pendientes"
7. ✅ Verificar en servidor que llegaron los 3
```

### Código Template

```typescript
// Template para movement.service.ts

export async function createMovement(
  request: CreateMovementRequest
): Promise<MovementResponse> {
  const db = await getDb();
  const localId = `movement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  // 1. Guardar localmente
  const movementDoc: MovementDoc = {
    localId,
    herdId: request.herdId,
    paddockId: request.paddockId,
    farmId: request.farmId,
    entryDate: `${request.entryDate}T00:00:00.000Z`,
    estimatedExitDate: `${request.estimatedExitDate}T00:00:00.000Z`,
    status: 'ACTIVE',
    syncStatus: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  await db.movements.insert(movementDoc);

  // 2. Encolar sincronización
  await enqueueSyncOperation({
    entity: 'movement',
    operation: 'CREATE',
    localId,
    payload: {
      herdId: request.herdId,
      paddockId: request.paddockId,
      type: 'ENTRY',
      entryDate: movementDoc.entryDate,
      exitDate: movementDoc.estimatedExitDate,
    },
  });

  // 3. Respuesta optimista
  return {
    id: localId,
    farmId: request.farmId,
    herdId: request.herdId,
    paddockId: request.paddockId,
    entryDate: request.entryDate,
    estimatedExitDate: request.estimatedExitDate,
    status: 'ACTIVE',
    syncStatus: 'pending',
  };
}
```

---

## 🧠 ÉPICA 2: Lógica Agronómica Avanzada (Cerebro Voisin)

**Prioridad:** 🔴 CRÍTICA  
**Estimado:** 2-3 semanas  
**Dependencias:** Épica 1 (✅ Completa)  
**Precondición:** Épica 12 (refactorización)

### Descripción
Implementar los cálculos agronómicos Voisin que hacen que la app sea más que un "registrador" y se convierta en un "asesor" inteligente.

### 2.1: Punto Óptimo de Reposo (POR)

```
Status: 🔲 No iniciado
Estimado: 3-4 días

Requisito Funcional:
"Calcular automáticamente cuántos días debe descansar un potrero
basado en:
- Altura del pasto al salir (crescimiento + degradación)
- Temperatura/Humedad (si hay datos)
- Estación del año
- Rendimiento histórico del potrero"

Implementación:

Backend (NestJS):
1. Crear endpoint: POST /potreros/{id}/calculate-rest-days
2. Algoritmo Voisin simplificado:
   
   por = 6 + (altura_salida - altura_entrada) / factor_crecimiento
   
   donde:
   - altura_entrada = última entrada (cm)
   - altura_salida = última salida (cm)
   - factor_crecimiento = depende de la estación (variable)
   
   Rangos sugeridos Voisin:
   - Verano: 14-30 días (poco pasto)
   - Otoño: 25-40 días
   - Primavera: 30-50 días (más crecimiento)
   - Invierno: 10-20 días (poco crecimiento)

Frontend (React):
1. Nueva sección en dashboard: "Potreros - Planes de Reposo"
2. Card por potrero:
   - Nombre
   - Últimas dimensiones (altura, kg/ha)
   - POR calculado: "30 días" ← con badge de estado
   - Últimas 5 ocupaciones (historial)
   - Visual: timeline con fechas entrada/salida

UI/UX:
┌─────────────────────────────────────┐
│ 📊 POTRERO NORTE                    │
├─────────────────────────────────────┤
│ Altura salida: 8 cm                 │
│ Kg/Ha: 2,500                        │
│                                      │
│ 🎯 PLAN DE REPOSO: 32 días          │
│    Próxima entrada: 14 de enero     │
│                                      │
│ Historial:                           │
│ ├─ Ent: 01/01, Sal: 12/01 (11 días) │
│ ├─ Ent: 23/12, Sal: 01/01 (9 días)  │
│ └─ ...                               │
└─────────────────────────────────────┘

Validación:
- ✅ Cálculo POR es consistente
- ✅ Coincide con recomendaciones Voisin
- ✅ Backend retorna JSON válido
- ✅ Frontend renderiza correctamente
```

### 2.2: Alerta de Sobrepastoreo

```
Status: 🔲 No iniciado
Estimado: 2-3 días

Requisito Funcional:
"Si un lote lleva >3 días en el MISMO potrero,
mostrar ALERTA ROJA en:
1. Movimiento activo
2. Tarjeta del potrero
3. Dashboard (sección de Alertas)"

Implementación:

Backend:
1. Crear cálculo: occupancy_days = now - movement.entryDate
2. En dashboard/alerts endpoint:
   
   SELECT m.*, (CURRENT_DATE - DATE(m.entryDate)) as days
   FROM movements m
   WHERE m.status = 'ACTIVE'
   AND (CURRENT_DATE - DATE(m.entryDate)) > 3
   ORDER BY days DESC

Frontend Hook:
```typescript
function useOvergrazingAlerts(farmId: string) {
  const { data: alerts } = useQuery({
    queryKey: ['overgrazing', farmId],
    queryFn: () => dashboardService.getAlerts(farmId),
  });

  return {
    hasOvergrazing: (alerts?.overgrazing || []).length > 0,
    items: alerts?.overgrazing || [],
  };
}
```

UI Alert Card:
```
┌─────────────────────────────────────┐
│ ⚠️  SOBREPASTOREO DETECTADO        │
├─────────────────────────────────────┤
│ 🐄 LOTE A - POTRERO NORTE           │
│    Días en potrero: 5 (⚠️  > 3)     │
│    Recomendación: Mover AHORA      │
│                                      │
│ 🐄 LOTE B - POTRERO SUR             │
│    Días en potrero: 6 (⚠️  > 3)     │
│    Recomendación: Mover AHORA      │
│                                      │
│ [GENERAR PLAN DE MOVIMIENTOS]       │
└─────────────────────────────────────┘
```

Validación:
- ✅ Alert aparece cuando occupancy_days > 3
- ✅ Desaparece al cerrar movimiento
- ✅ Cálculo es en tiempo real
- ✅ No genera false positives
```

### 2.3: Carga Animal vs Aforo (UA/Ha)

```
Status: 🔲 No iniciado
Estimado: 4-5 días

Requisito Funcional:
"Al crear un movimiento, comparar:
- Demanda: Carga animal total del hato (UA)
- Oferta: kg/ha disponibles en potrero destino
- Si Demanda > Oferta: Bloquear movimiento + mostrar alerta"

Fórmula:
Demanda = (Número de animales en lote) × (peso promedio / 450)
Oferta = kg/Ha del potrero (del último aforo)
Relación = Demanda / Oferta

Interpretar:
- Relación < 0.5: Excelente (mucho pasto)
- 0.5 - 0.8: Bueno (suficiente)
- 0.8 - 1.0: Ajustado (límite)
- > 1.0: CRÍTICO (sobrepastoreo seguro)

Implementación:

Backend:
1. Endpoint: POST /movements/validate
   Entrada: { herdId, paddockId }
   Salida: { 
     isValid: boolean,
     demand: number,
     supply: number,
     ratio: number,
     message: string
   }

2. Lógica:
```python
def validate_movement(herd_id, paddock_id):
    herd = Herd.get(herd_id)
    paddock = Paddock.get(paddock_id)
    
    # Demanda
    ua_total = herd.number_of_animals * (herd.avg_weight_kg / 450)
    
    # Oferta
    last_forage = paddock.forages.order_by('-sampleDate').first()
    supply_kg_ha = last_forage.kgPerHectare if last_forage else 0
    
    # Relación
    ratio = ua_total / (supply_kg_ha * paddock.hectares)
    
    return {
        'isValid': ratio <= 1.0,
        'demand': ua_total,
        'supply': supply_kg_ha,
        'ratio': ratio,
        'message': 'OK' if ratio <= 1.0 else 'EXCESO DE CARGA'
    }
```

Frontend (en Formulario de Movimiento):
```typescript
async function validateMovement(herdId, paddockId) {
  const validation = await api.post('/movements/validate', {
    herdId,
    paddockId,
  });

  if (!validation.isValid) {
    return showAlert({
      title: '⚠️ Exceso de Carga Animal',
      message: `Demanda: ${validation.demand.toFixed(1)} UA\n`
              + `Oferta: ${validation.supply.toFixed(0)} kg/Ha\n`
              + `Relación: ${validation.ratio.toFixed(2)} (límite: 1.0)`,
      buttons: [
        { text: 'Aceptar y continuar', onPress: () => confirmMove() },
        { text: 'Cancelar', style: 'cancel' },
      ],
    });
  }

  // Validación pasó
  return createMovement();
}
```

UI en Formulario:
```
┌─────────────────────────────────────┐
│ NUEVO MOVIMIENTO                     │
├─────────────────────────────────────┤
│ Lote: [Lote A ▼]                    │
│ Potrero: [Potrero Norte ▼]          │
│ Fecha entrada: [12/01/2026]         │
│                                      │
│ 📊 VALIDACIÓN CARGA:                │
│ Demanda: 18.5 UA                    │
│ Oferta: 25,000 kg/ha                │
│ Relación: 0.74 ✅ (Bueno)           │
│                                      │
│ [GUARDAR]                            │
└─────────────────────────────────────┘
```

Validación:
- ✅ Cálculo de UA es correcto
- ✅ Referencia peso = 450 kg
- ✅ Usa último aforo disponible
- ✅ Permite override con confirmación
- ✅ No bloquea si no hay aforo (warn)
```

---

## 🛠️ ÉPICA 3: Infraestructura de Producción

**Prioridad:** 🟡 ALTA  
**Estimado:** 1-2 semanas  
**Dependencias:** Épica 1 (✅ Completa)

### Descripción
Pasar de SQLite (desarrollo local) a PostgreSQL (producción robusta).  
Dockerizar todo para deployment consistente.

### 3.1: Migración SQLite → PostgreSQL

```
Status: 🔲 No iniciado
Estimado: 3-4 días

Pasos:

1. ✅ Crear schema PostgreSQL
   - Usar existente Prisma schema
   - Agregarmigrations/
   - npx prisma migrate dev --name init

2. ✅ Crear script de migración de datos
   - Leer SQLite (dev.db)
   - Transformar data
   - Insertar en PostgreSQL
   - Validar integridad

3. ✅ Actualizar environment variables
   - DATABASE_URL=postgresql://...

4. ✅ Testing
   - Dev: SQLite (como ahora)
   - Staging: PostgreSQL
   - Prod: PostgreSQL (Amazon RDS)

Script Migración (scripts/migrate-sqlite-to-postgres.ts):
```typescript
import Database from 'better-sqlite3';
import { PrismaClient } from '@prisma/client';

const sqliteDb = new Database('apps/api/prisma/dev.db');
const prisma = new PrismaClient();

async function migrateFarms() {
  const farms = sqliteDb.prepare('SELECT * FROM farms').all();
  
  for (const farm of farms) {
    await prisma.farm.create({
      data: {
        id: farm.id,
        name: farm.name,
        location: farm.location,
        hectares: farm.hectares,
        createdAt: new Date(farm.createdAt),
        updatedAt: new Date(farm.updatedAt),
      },
    });
  }
}

async function main() {
  console.log('Iniciando migración SQLite → PostgreSQL...');
  await migrateFarms();
  // Repeat for paddocks, herds, movements, weighings, forage_samples
  console.log('✅ Migración completada');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
```
```

### 3.2: Docker Compose Stack

```
Status: 🔲 No iniciado
Estimado: 2-3 días

docker-compose.yml:
```yaml
version: '3.9'

services:
  # Base de datos PostgreSQL
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ganaderia_db
      POSTGRES_USER: ganaderia
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ganaderia"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend NestJS
  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://ganaderia:${DB_PASSWORD}@postgres:5432/ganaderia_db
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./apps/api:/app/apps/api

  # Frontend Next.js
  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: http://api:3000
    ports:
      - "3001:3001"
    depends_on:
      - api

volumes:
  postgres_data:
```

apps/api/Dockerfile:
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY apps/api apps/api
COPY packages packages

RUN npm install
RUN npm run build --workspace=@ganaderia/api

EXPOSE 3000

CMD ["npm", "start", "--workspace=@ganaderia/api"]
```

apps/web/Dockerfile:
```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY apps/web apps/web
COPY packages packages

RUN npm install
RUN npm run build --workspace=@ganaderia/web

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/.next .next
COPY --from=builder /app/public public
COPY package.json ./

EXPOSE 3001

CMD ["npm", "start", "--workspace=@ganaderia/web"]
```

Uso:
```bash
# Copiar template .env
cp .env.example .env.local

# Iniciar stack
docker-compose up -d

# Ejecutar migraciones
docker exec ganaderia-api npx prisma migrate deploy

# Verificar
docker logs ganaderia-postgres
docker logs ganaderia-api
docker logs ganaderia-web
```
```

---

## 📱 ÉPICA 4: PWA + Mobile UX

**Prioridad:** 🟡 MEDIA (después de Prod)  
**Estimado:** 2-3 semanas  
**Dependencias:** Épica 3 (Producción ready)

### 4.1: Progressive Web App (PWA)

```
Status: 🔲 No iniciado
Estimado: 3-4 días

Pasos:

1. ✅ Crear public/manifest.json
```json
{
  "name": "Ganadería Regenerativa - Magrotec",
  "short_name": "Magrotec",
  "description": "App de gestión para rotación regenerativa de ganado",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#059669",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    }
  ],
  "categories": ["agriculture", "business"],
  "screenshots": [
    {
      "src": "/screenshots/1.png",
      "type": "image/png",
      "sizes": "540x720"
    }
  ]
}
```

2. ✅ Crear Service Worker (apps/web/public/sw.js)
   - Cache-first strategy para assets estáticos
   - Network-first strategy para API calls (offline cache)
   - Skip-waiting para updates

3. ✅ Registrar SW en layout.tsx
   - useEffect(() => navigator.serviceWorker.register('/sw.js'), [])

4. ✅ Agregar meta tags PWA en layout.tsx
   - apple-mobile-web-app-capable
   - apple-mobile-web-app-status-bar-style
   - theme-color

5. ✅ Build & test en móvil
```

### 4.2: Mobile UX Optimization

```
Status: 🔲 No iniciado
Estimado: 1-2 semanas

UX Improvements:

1. Botones grandes para toque
   - Mín. 48px × 48px (tap target)
   - Spacing entre botones (evitar misclicks)

2. Entrada de datos optimizada
   - Selectores en lugar de textinputs donde sea posible
   - Calendario picker (date) nativo
   - Número picker (número animales)

3. Keyboard context
   - Overflow visible cuando keyboard abre
   - Bottom navigation no se superpone
   - Scroll automático a campo activo

4. Orientación
   - Soportar landscape para formularios largos
   - Responsive layouts

5. Accesibilidad
   - Colores con suficiente contraste
   - Labels accesibles (aria-label, htmlFor)
   - Navegación por teclado funcional

Form Components Refactored:
```
ANTES (Desktop):
┌─────────────────────────────────────┐
│ NUEVO AFORO                          │
├─────────────────────────────────────┤
│ Potrero:                             │
│ [Dropdown: Seleccionar potrero...]   │
│                                      │
│ Fecha muestra: [12/01/2026]          │
│ Altura pasto: [____] cm              │
│ Peso muestra: [____] kg              │
│ Materia seca: [____] %               │
│                                      │
│ [GUARDAR]  [CANCELAR]                │
└─────────────────────────────────────┘

DESPUÉS (Mobile-optimized):
┌─────────────────────────────────────┐
│ NUEVO AFORO                          │
├─────────────────────────────────────┤
│                                      │
│ Potrero:                             │
│ ┌─────────────────────────────────┐  │
│ │ 🏞️  POTRERO NORTE          ▼ │  │
│ └─────────────────────────────────┘  │
│                                      │
│ Fecha muestra:                       │
│ ┌─────────────────────────────────┐  │
│ │ 📅 [12/01/2026 ▼]            │  │
│ └─────────────────────────────────┘  │
│                                      │
│ Altura pasto:                        │
│ ┌─────────────────────────────────┐  │
│ │ [45_] cm                        │  │
│ └─────────────────────────────────┘  │
│                                      │
│ Peso muestra:                        │
│ ┌─────────────────────────────────┐  │
│ │ [2.5_] kg                       │  │
│ └─────────────────────────────────┘  │
│                                      │
│ Materia seca:                        │
│ ┌─────────────────────────────────┐  │
│ │ [32_] %                         │  │
│ └─────────────────────────────────┘  │
│                                      │
│ ┌─────────────────────────────────┐  │
│ │  GUARDAR                         │  │
│ └─────────────────────────────────┘  │
│                                      │
│ ┌─────────────────────────────────┐  │
│ │  CANCELAR                        │  │
│ └─────────────────────────────────┘  │
│                                      │
└─────────────────────────────────────┘

Cambios:
✅ Botones full-width (toque fácil)
✅ Inputs más grandes (teclado numérico)
✅ Selectores con iconos (visual)
✅ Una acción por línea (no confusión)
✅ Espaciado vertical (evitar misclicks)
```
```

---

## 📈 Timeline Recomendado

```
ENERO 2026:
├─ Semana 1-2: Épica 12 (Refactor servicios)
│  └─ movimiento.service.ts + weighing.service.ts
│
└─ Semana 3-4: Inicio Épica 2.1 (POR)

FEBRERO 2026:
├─ Semana 1-3: Épica 2 (Lógica Agronómica)
│  ├─ 2.1 POR (Punto de Reposo)
│  ├─ 2.2 Alerta de Sobrepastoreo
│  └─ 2.3 Carga Animal vs Aforo
│
└─ Semana 4+: Épica 3 (Infraestructura)
   ├─ Migración SQLite → PostgreSQL
   └─ Docker Compose setup

MARZO 2026:
├─ Semana 1-2: Épica 3 finalización + testing
│
└─ Semana 3-4: Épica 4 (PWA + Mobile)
   ├─ Manifest.json + Service Worker
   └─ Mobile UX refactor

ABRIL 2026:
├─ QA/Testing en campo
├─ Beta con usuarios piloto
└─ Launch v1.0 🚀
```

---

## 🎯 Métricas de Éxito

| Métrica | Épica 12 | Épica 2 | Épica 3 | Épica 4 |
|---------|----------|---------|---------|---------|
| Test Coverage | 70%+ | 85%+ | 90%+ | 80%+ |
| Performance (LCP) | < 3s | < 2s | < 2s | < 2s |
| Offline Functionality | 100% | 100% | 100% | 100% |
| Mobile Responsive | N/A | N/A | N/A | 100% |
| Accessibility (WCAG) | AA | AA | AA | AA |
| Bugs Críticos | 0 | 0 | 0 | 0 |

---

## 📋 Next Steps

**Inmediato (Hoy-Mañana):**
1. ✅ Code review de Épica 1 (Offline-First)
2. ✅ Mergear a `main` (already done ✨)
3. 🔲 Comunicar al equipo el nuevo flujo
4. 🔲 Training para usar offline-first

**Esta Semana:**
1. 🔲 Iniciar Épica 12 (Refactor movimientos/pesajes)
2. 🔲 Crear PR para revisión
3. 🔲 Testing en staging

**Próximas 2 Semanas:**
1. 🔲 Finalizar Épica 12
2. 🔲 Iniciar Épica 2.1 (POR Voisin)
3. 🔲 Planning Épica 3

---

**Documento creado por:** Build Engineer & Tech Lead  
**Timestamp:** 12 de enero de 2026  
**Estado:** Ready for execution
