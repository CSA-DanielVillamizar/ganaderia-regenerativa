# 🏗️ ARQUITECTURA TÉCNICA - Ganadería Regenerativa v1.0.0

## 📐 Diagrama General del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        USUARIO (NAVEGADOR)                      │
│                   http://localhost:3001                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                   HTTP/REST (JSON)
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
┌───────▼────────────────────┐   ┌───────────▼─────────────────┐
│                            │   │                             │
│  FRONTEND (Next.js 14.2)  │   │  BACKEND (NestJS 10)       │
│  ─────────────────────     │   │  ────────────────────       │
│                            │   │                             │
│  • React 18               │   │  • Prisma 5.7.1 ORM        │
│  • TypeScript 5.x         │   │  • SQLite Database          │
│  • Tailwind CSS           │   │  • JWT Auth                 │
│  • React Query            │   │  • Zod Validation          │
│  • Recharts               │   │  • Clean Architecture      │
│                            │   │                             │
│  Pages (9):               │   │  Modules (11):              │
│  ├─ /                    │   │  ├─ AuthModule              │
│  ├─ /auth/login          │   │  ├─ FarmModule              │
│  ├─ /dashboard           │   │  ├─ PaddockModule          │
│  ├─ /farms               │   │  ├─ HerdModule              │
│  ├─ /farms/[id]          │   │  ├─ WeighingModule          │
│  ├─ /farms/[id]/herds/*  │   │  ├─ MovementModule          │
│  ├─ /farms/[id]/paddocks │   │  ├─ ForageModule            │
│  ├─ /farms/new           │   │  ├─ DashboardModule        │
│  └─ /farms/[id]/herds/new│   │  ├─ ParameterModule        │
│                            │   │  ├─ CalibrationModule ⭐  │
│  Components (20+):        │   │  └─ PrismaModule            │
│  ├─ DashboardKPIs         │   │                             │
│  ├─ WeighingForm          │   │  REST Endpoints (30+):      │
│  ├─ ForageForm            │   │  ├─ /farms                  │
│  ├─ CalibrationForm ⭐   │   │  ├─ /herd                   │
│  ├─ FieldGuideViewer ⭐  │   │  ├─ /paddock                │
│  ├─ PaddockMap ⭐        │   │  ├─ /weighing               │
│  ├─ FormCard             │   │  ├─ /forage                 │
│  └─ StatusBadge          │   │  ├─ /movement               │
│                            │   │  ├─ /dashboard             │
│  Librerías (5):           │   │  ├─ /calibration ⭐        │
│  ├─ field-guides.ts ⭐   │   │  └─ /parameter              │
│  ├─ alert-rules.ts ⭐    │   │                             │
│  ├─ offline-sync.ts ⭐   │   │  Servicios (11):            │
│  ├─ hooks.ts             │   │  ├─ AuthService             │
│  └─ utils.ts             │   │  ├─ FarmService             │
│                            │   │  ├─ PaddockService        │
│  Storage:                 │   │  ├─ HerdService             │
│  ├─ localStorage (offline)│   │  ├─ WeighingService        │
│  ├─ sessionStorage        │   │  ├─ MovementService        │
│  └─ IndexedDB (future)    │   │  ├─ ForageService          │
│                            │   │  ├─ DashboardService      │
│                            │   │  ├─ ParameterService      │
│                            │   │  ├─ CalibrationService ⭐ │
│                            │   │  └─ PrismaService          │
└────────────────────────────┘   │                             │
                                  │  Database Layer:          │
                                  │  ├─ User                  │
                                  │  ├─ Farm                  │
                                  │  ├─ Paddock              │
                                  │  ├─ Herd                  │
                                  │  ├─ Animal                │
                                  │  ├─ Weighing              │
                                  │  ├─ Forage                │
                                  │  ├─ Movement              │
                                  │  ├─ Parameter             │
                                  │  ├─ TapeCalibration ⭐    │
                                  │  ├─ TapeCalibrationHistory│
                                  │  └─ Timestamps            │
                                  └─────────────────────────────┘
                                            │
                                            │
                                  ┌─────────▼───────────┐
                                  │   SQLite Database   │
                                  │  (data.db)         │
                                  └─────────────────────┘

⭐ = Nuevos en v1.0.0 (Épicas 7-11)
```

---

## 🔄 FLUJO DE DATOS - Ejemplo: Pesaje con Cinta (TAPE)

```
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND - CalibrationForm / WeighingForm                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 1. Usuario llena formulario:                                   │
│    ├─ Perímetro torácico: 185 cm                               │
│    ├─ Largo corporal: 220 cm                                   │
│    └─ Selecciona: TAPE method                                  │
│                                                                 │
│ 2. Validación Frontend:                                         │
│    ├─ Zod schema: chestGirth ∈ [100,300], bodyLength ∈ [100,300]
│    └─ ✅ Valida antes de enviar                                │
│                                                                 │
│ 3. HTTP POST → http://localhost:3000/weighing                  │
│    {                                                            │
│      "method": "TAPE",                                         │
│      "chestGirth": 185,                                        │
│      "bodyLength": 220,                                        │
│      "date": "2025-12-26"                                      │
│    }                                                            │
│                                                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
              REST API (NestJS Controller)
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│ BACKEND - WeighingController                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 1. @Post('/farms/:farmId/herds/:herdId')                        │
│    ├─ Extrae JWT token → userId                                │
│    ├─ Valida @UseGuards(JwtAuthGuard)                          │
│    └─ Parámetros: farmId, herdId                               │
│                                                                 │
│ 2. Validación Backend (Zod):                                   │
│    ├─ chestGirth: 100 ≤ x ≤ 300 ✅                             │
│    ├─ bodyLength: 100 ≤ x ≤ 300 ✅                             │
│    └─ method ∈ ['SCALE', 'TAPE'] ✅                            │
│                                                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
               Service Layer (WeighingService)
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│ WeighingService.create()                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 1. Obtener finca y verificar permisos:                          │
│    const farm = await farmService.getById(farmId)              │
│    ├─ Si no existe → throw NotFoundException                   │
│    └─ Si usuario no tiene acceso → throw ForbiddenException    │
│                                                                 │
│ 2. Obtener calibración actual:                                  │
│    const calibration = await calibrationService.getByFarm()    │
│    ├─ Si existe: usa divisor guardado                          │
│    └─ Si no existe: usa default (11877)                        │
│                                                                 │
│ 3. CÁLCULO - Fórmula TAPE:                                     │
│    weight = (chestGirth² × bodyLength) / divisor               │
│    weight = (185² × 220) / 11877                               │
│    weight = (34225 × 220) / 11877                              │
│    weight = 7529500 / 11877                                    │
│    weight ≈ 634 kg  ← Peso estimado del animal                │
│                                                                 │
│ 4. Validar rangos sensatos:                                    │
│    ├─ Si weight < 100 → throw RangeException                   │
│    ├─ Si weight > 2000 → throw RangeException                  │
│    └─ Si checksum válido ✅                                    │
│                                                                 │
│ 5. Crear registro Weighing en BD:                              │
│    await prisma.weighing.create({                              │
│      farmId,                                                   │
│      herdId,                                                   │
│      method: 'TAPE',                                           │
│      chestGirth: 185,                                          │
│      bodyLength: 220,                                          │
│      actualWeight: 634,  // ← Calculado                        │
│      date: new Date('2025-12-26'),                             │
│      createdBy: userId,                                        │
│      createdAt: now                                            │
│    })                                                           │
│                                                                 │
│ 6. Log auditoría:                                              │
│    logger.log({                                                │
│      event: 'WEIGHING_CREATED',                                │
│      farmId, herdId, userId,                                   │
│      method: 'TAPE',                                           │
│      calculatedWeight: 634,                                    │
│      divisor: 11877                                            │
│    })                                                           │
│                                                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
          Prisma ORM Layer (Database Access)
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│ SQLite Database                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ INSERT INTO weighing (                                         │
│   farmId, herdId, method, chestGirth, bodyLength,              │
│   actualWeight, date, createdBy, createdAt, updatedAt          │
│ ) VALUES (                                                     │
│   123, 456, 'TAPE', 185, 220,                                  │
│   634, '2025-12-26', 'user-1', now, now                        │
│ )                                                              │
│                                                                 │
│ ✅ ROWID: 999 → Weighing ID                                    │
│                                                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
              Response JSON (WeighingController)
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│ HTTP Response (201 Created)                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ {                                                              │
│   "id": "999",                                                 │
│   "farmId": "123",                                             │
│   "herdId": "456",                                             │
│   "method": "TAPE",                                            │
│   "chestGirth": 185,                                           │
│   "bodyLength": 220,                                           │
│   "actualWeight": 634,                                         │
│   "date": "2025-12-26T00:00:00Z",                              │
│   "createdBy": "user-1",                                       │
│   "createdAt": "2025-12-26T14:32:15Z",                         │
│   "updatedAt": "2025-12-26T14:32:15Z"                          │
│ }                                                              │
│                                                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│ FRONTEND - State Management (React Query)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 1. Mutación exitosa:                                           │
│    ├─ Invalidar cache: weighings, herds, dashboard             │
│    ├─ Refetch automático de KPIs                               │
│    └─ Toast notification: "✅ Pesaje registrado"              │
│                                                                 │
│ 2. Actualizar estado UI:                                       │
│    ├─ Limpiar formulario                                       │
│    ├─ Actualizar lista de pesajes                              │
│    └─ Refrescar gráficos en tiempo real                        │
│                                                                 │
│ 3. Sincronización Offline (si estaba offline):                 │
│    ├─ Agregar a OfflineSyncService.queue                       │
│    ├─ Guardar en localStorage                                  │
│    └─ Intentar sync cuando hay conexión                        │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Capas de Validación (Defensa en Profundidad)

```
┌─────────────────────────────────────────────┐
│ 1. Frontend Validation (Zod)               │
│    - Ejecuta ANTES de enviar              │
│    - User feedback inmediato               │
│    - Browser-based, no costo server        │
└────────────┬────────────────────────────────┘
             │
┌────────────▼─────────────────────────────────┐
│ 2. HTTP Transmission                         │
│    - Autorización header (JWT)               │
│    - Content-Type: application/json          │
│    - HTTPS en producción                     │
└────────────┬─────────────────────────────────┘
             │
┌────────────▼──────────────────────────────────┐
│ 3. Backend Validation (Zod again)            │
│    - Defense-in-depth strategy               │
│    - No confiar en cliente                   │
│    - Validación completa DTOs                │
└────────────┬──────────────────────────────────┘
             │
┌────────────▼──────────────────────────────────┐
│ 4. Authentication (JWT Guard)                │
│    - Verificar usuario autenticado           │
│    - Extraer userId de token                 │
│    - Rechazar sin token válido               │
└────────────┬──────────────────────────────────┘
             │
┌────────────▼──────────────────────────────────┐
│ 5. Authorization (Service Layer)             │
│    - ¿Usuario tiene acceso a finca?          │
│    - ¿Rebaño pertenece a finca?              │
│    - Enforcar reglas de negocio              │
└────────────┬──────────────────────────────────┘
             │
┌────────────▼──────────────────────────────────┐
│ 6. Business Logic (Service Methods)          │
│    - Cálculos (peso, UA, MS/ha)              │
│    - Validaciones rangos                     │
│    - Controles operacionales                 │
└────────────┬──────────────────────────────────┘
             │
┌────────────▼──────────────────────────────────┐
│ 7. Database Constraints                      │
│    - Foreign keys (relaciones)               │
│    - Unique constraints                      │
│    - Default values                          │
│    - Column types & lengths                  │
└────────────────────────────────────────────────┘
```

---

## 📊 Modelos de Base de Datos (Relaciones)

```
User
├─ id (PK)
├─ email (UNIQUE)
├─ password (hashed)
├─ name
└─ ← UserFarm[] (1:many)
   └─ Farm[] (M:N)

Farm (Finca)
├─ id (PK)
├─ name
├─ hectares
├─ createdBy → User (FK)
├─ ← UserFarm[] (1:many)
├─ ← Paddock[] (1:many)
├─ ← Herd[] (1:many)
├─ ← Weighing[] (1:many)
├─ ← Forage[] (1:many)
├─ ← Movement[] (1:many)
├─ ← Parameter[] (1:many)
├─ ← TapeCalibration (1:1) ⭐
├─ ← TapeCalibrationHistory[] (1:many) ⭐
└─ timestamps

Paddock (Potrero)
├─ id (PK)
├─ farmId → Farm (FK)
├─ name
├─ hectares
├─ status (READY | OCCUPIED | RESTING)
├─ occupiedSince
├─ currentHerdId → Herd (FK, nullable)
├─ ← Movement[] (1:many)
├─ ← Forage[] (1:many)
└─ timestamps

Herd (Rebaño)
├─ id (PK)
├─ farmId → Farm (FK)
├─ name
├─ breed
├─ quantity
├─ ← Animal[] (1:many)
├─ ← Weighing[] (1:many)
├─ ← Movement[] (1:many)
└─ timestamps

Animal
├─ id (PK)
├─ herdId → Herd (FK)
├─ earTag
├─ birthDate
├─ gender
└─ timestamps

Weighing (Pesaje)
├─ id (PK)
├─ farmId → Farm (FK)
├─ herdId → Herd (FK)
├─ method (SCALE | TAPE) ← Doble método
├─ actualWeight (kg)
├─ chestGirth (cm, solo TAPE)
├─ bodyLength (cm, solo TAPE)
├─ date
├─ createdBy → User
└─ timestamps

Forage (Aforo)
├─ id (PK)
├─ farmId → Farm (FK)
├─ paddockId → Paddock (FK)
├─ frameSize (0.25 | 1 | 4)
├─ freshWeight (kg)
├─ dryMatterPercentage
├─ usagePercentage
├─ kgDryMatterPerHa ← Auto-calculado
└─ timestamps

Movement (Rotación)
├─ id (PK)
├─ farmId → Farm (FK)
├─ herdId → Herd (FK)
├─ fromPaddockId → Paddock (FK)
├─ toPaddockId → Paddock (FK)
├─ movementDate
├─ notes
└─ timestamps

Parameter (Configuración)
├─ id (PK)
├─ farmId → Farm (FK)
├─ paramKey (minRestDays, etc)
├─ paramValue
└─ timestamps

TapeCalibration (NUEVO ⭐)
├─ id (PK)
├─ farmId → Farm (FK, UNIQUE)
├─ divisor (default 11877)
├─ status (PENDING | VALIDATED)
├─ notes
├─ appliedDate
├─ ← TapeCalibrationHistory[] (1:many)
└─ timestamps

TapeCalibrationHistory (NUEVO ⭐)
├─ id (PK)
├─ farmId → Farm (FK)
├─ previousDivisor
├─ newDivisor
├─ samplesUsed (count)
├─ rmseError (regresión error)
└─ createdAt

UserFarm (Junction)
├─ id (PK)
├─ userId → User (FK)
├─ farmId → Farm (FK)
├─ role (OWNER | ADMIN | OPERATOR)
└─ timestamps
```

---

## 🎯 Patrones de Arquitectura

### Clean Architecture Layer Pattern

```
┌─────────────────────────────┐
│   CONTROLLER LAYER          │  ← HTTP Interface
│  (WeighingController)       │     Deserialize JSON
│  ─────────────────────────  │     Validate JWT
│  @Post('/weighing')         │     Serialize Response
└────────────┬────────────────┘
             │
┌────────────▼────────────────────┐
│   SERVICE LAYER (Business)      │  ← Core Logic
│  (WeighingService)              │     Calculations
│  ─────────────────────────────  │     Rules
│  • calculateWeight()            │     Validation
│  • validateWeighing()           │     Orchestration
│  • getWeighingsByHerd()         │
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────────┐
│   DATA ACCESS LAYER (Prisma ORM)   │  ← Database
│  (PrismaService)                    │     Queries
│  ─────────────────────────────────  │     Transactions
│  prisma.weighing.create()           │     Relations
│  prisma.weighing.findMany()         │
└────────────────────────────────────┘
```

### Dependency Injection Pattern

```
Module (WeighingModule)
├─ Imports: [PrismaModule, AuthModule]
├─ Providers:
│  ├─ WeighingService
│  ├─ WeighingController (inyecta WeighingService)
│  └─ Otros servicios requeridos
└─ Exports: [WeighingService]

// En servicio
export class WeighingService {
  constructor(
    private prisma: PrismaService,     // ← Inyectado
    private calibration: CalibrationService,  // ← Inyectado
    private logger: LoggerService
  ) {}
}
```

### Guard Pattern (Authentication)

```
@UseGuards(JwtAuthGuard)
@Post('/weighing')
async createWeighing(
  @Req() req,    // ← Guard incluye usuario
  @Body() body
) {
  const userId = req.user.id;  // ← Extraído del JWT
  // ...
}
```

---

## 🔄 Offline-First Sync Pattern

```
USER (ONLINE/OFFLINE)
         │
         ├─ ONLINE ──→ Request → API ──→ Response ──→ Cache
         │
         └─ OFFLINE
             │
             ├─ Add to Queue (localStorage)
             ├─ Save to IndexedDB
             │
             ↓
          Browser Reconnects
             │
             ├─ Detect 'online' event
             ├─ Retrieve queue from localStorage
             │
             ├─ For each item:
             │  ├─ Try POST to API
             │  ├─ If success: remove from queue
             │  └─ If fail: increment retry count
             │
             └─ Update UI with sync status
```

**Implementación**: [offline-sync.ts](../apps/web/src/lib/offline-sync.ts)

---

## 📈 Performance Optimization

```
FRONTEND:
├─ Code Splitting
│  ├─ Route-based (Next.js automatic)
│  └─ Component lazy loading
├─ Caching
│  ├─ React Query (server state)
│  ├─ localStorage (offline queue)
│  └─ Browser cache (assets)
├─ Image Optimization
│  ├─ Next.js Image component
│  ├─ WebP format
│  └─ Lazy loading
└─ CSS
   ├─ Tailwind JIT
   ├─ Tree-shaking
   └─ Minification

BACKEND:
├─ Database
│  ├─ Indexes on FK & frequent queries
│  ├─ Prisma query optimization
│  └─ Connection pooling
├─ Caching
│  ├─ Response caching headers
│  ├─ Redis (future)
│  └─ Database query cache
├─ Compression
│  ├─ gzip
│  ├─ minification
│  └─ tree-shaking
└─ Rate Limiting
   ├─ Per-user quota
   ├─ Per-IP throttling
   └─ Authentication-based limits

BUILD:
├─ API
│  ├─ TypeScript: strict mode enabled
│  ├─ NestJS: production build
│  └─ Bundle size: <5MB
├─ Web
│  ├─ Next.js: optimized build
│  ├─ CSS purging: Tailwind
│  └─ JavaScript: ~87kB First Load
└─ Shared
   ├─ Tree-shaking
   └─ Dead code elimination
```

---

## 🧪 Testing Strategy

```
UNIT TESTS:
├─ Services (business logic)
├─ Utilities (helpers)
└─ Hooks (React)

INTEGRATION TESTS:
├─ Service → Database (Weighing service + Prisma)
├─ Controller → Service (API endpoints)
└─ Frontend → API (Component integration)

E2E TESTS:
├─ Complete user flows
├─ Auth → Create Farm → Add Herd → Weighing
└─ Cross-platform (desktop, mobile)

PERFORMANCE TESTS:
├─ Load testing (concurrent users)
├─ Database query performance
└─ Frontend rendering performance

TEST TOOLS:
├─ Jest (unit/integration)
├─ Supertest (API endpoints)
├─ React Testing Library
├─ Playwright (E2E)
└─ Apache JMeter (load)
```

---

## 🚀 Deployment Architecture

```
LOCAL DEVELOPMENT:
├─ npm run start:dev
├─ API: http://localhost:3000
└─ Web: http://localhost:3001

STAGING:
├─ Docker containers
├─ CI/CD pipeline (GitHub Actions)
├─ Automated tests + linting
└─ Manual QA approval

PRODUCTION:
├─ API Server
│  ├─ Docker container
│  ├─ Load balancer
│  ├─ Health checks
│  └─ Auto-scaling
├─ Database
│  ├─ PostgreSQL (production)
│  ├─ Automated backups
│  ├─ Replication
│  └─ Point-in-time recovery
├─ CDN
│  ├─ Static assets
│  ├─ Image optimization
│  └─ Geographic distribution
└─ Monitoring
   ├─ Sentry (errors)
   ├─ Datadog (metrics)
   ├─ CloudWatch (logs)
   └─ Alert rules
```

---

## 📝 API Contract (TypeScript Definitions)

```typescript
// WEIGHING ENDPOINT

// Request
type CreateWeighingRequest = {
  method: 'SCALE' | 'TAPE';
  date: ISO8601String;
  actualWeight?: number;        // ← Required if SCALE
  chestGirth?: number;          // ← Required if TAPE (cm)
  bodyLength?: number;          // ← Required if TAPE (cm)
};

// Response
type WeighingResponse = {
  id: string;
  farmId: string;
  herdId: string;
  method: 'SCALE' | 'TAPE';
  actualWeight: number;         // ← Always calculated/provided
  chestGirth?: number;
  bodyLength?: number;
  date: ISO8601String;
  createdBy: string;
  createdAt: ISO8601String;
  updatedAt: ISO8601String;
};

// Error Responses
type ErrorResponse = {
  statusCode: 400 | 401 | 403 | 404 | 500;
  message: string;
  error?: string;
  details?: Record<string, any>;
};

// Example 400 (Validation):
// {
//   statusCode: 400,
//   message: "Validation failed",
//   details: {
//     chestGirth: "Must be between 100 and 300"
//   }
// }
```

---

## 🔑 Key Technologies & Versions

```
FRONTEND:
├─ next@14.2.0
├─ react@18.2.0
├─ typescript@5.x
├─ tailwindcss@3.x
├─ react-query@4.x
├─ zod@3.x
└─ recharts@2.x

BACKEND:
├─ @nestjs/core@10.x
├─ @nestjs/jwt@11.x
├─ prisma@5.7.1
├─ zod@3.x
├─ sqlite3@5.x
└─ bcryptjs@2.x

SHARED:
├─ typescript@5.x
├─ zod@3.x
└─ vitest@0.x (testing)

TOOLING:
├─ turbo (monorepo)
├─ esbuild (bundling)
├─ prettier (formatting)
├─ eslint (linting)
└─ jest/vitest (testing)

DEVOPS:
├─ Docker
├─ GitHub Actions (CI/CD)
├─ Vercel (hosting - future)
├─ AWS/Azure (backend)
└─ Sentry (error tracking)
```

---

**Diagrama generado**: 2025-12-26  
**Arquitectura versión**: 1.0.0  
**Status**: ✅ Production Ready

