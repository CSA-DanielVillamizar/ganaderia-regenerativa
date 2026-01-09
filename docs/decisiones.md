# Decisiones de Diseño - Ganadería Regenerativa

## 1. Arquitectura General

### Monorepo vs. Microservicios

**Decisión**: Monorepo con separación clara de apps

**Justificación**:
- ✅ Desarrollo más rápido y coordinado
- ✅ Compartir tipos TypeScript entre frontend y backend
- ✅ Deployments sincronizados
- ✅ Testing más simple (E2E con todo el stack)

**Herramienta**: Turbo para orquestación de builds

```
packages/shared  → DTOs, tipos, esquemas Zod
├── apps/api/   → NestJS backend
└── apps/web/   → Next.js frontend
```

---

## 2. Autenticación

### JWT vs. Sessions

**Decisión**: JWT (JSON Web Tokens)

**Justificación**:
- ✅ Stateless: no requiere sesión en servidor
- ✅ Escalable horizontalmente
- ✅ CORS-friendly
- ✅ Integración futura con microservicios

**Implementación**:
- Token generado al login
- Almacenado en localStorage del cliente
- Enviado en header `Authorization: Bearer <token>`
- Validado con Passport.js y estrategia JWT

**Seguridad**:
- Hash bcryptjs para contraseñas
- Expiración configurable (24h por defecto)
- RefreshToken para futuras implementaciones

---

## 3. Autorización y RBAC

### 4 Roles vs. Granularidad Completa

**Decisión**: 4 roles base (ADMIN, TECHNICIAN, MANAGER, VIEWER)

**Justificación**:
- ✅ Suficiente para MVP
- ✅ Simple de implementar y mantener
- ✅ Escalable a políticas más granulares (Fase 2)

**Guards Implementados**:
```typescript
@UseGuards(JwtAuthGuard)       // Token válido
@UseGuards(RolesGuard)          // Rol específico
@Roles('ADMIN', 'TECHNICIAN')   // Solo estos roles
```

**Verificación de Acceso a Finca**:
- Tabla `UserFarm` con permisos por finca
- Cada endpoint verifica `userFarms.farmId`
- Previene acceso cruzado entre usuarios

**Futuro (Fase 2)**:
- Permisos granulares por recurso
- Políticas por atributo (ABAC)
- Auditoría detallada por acción

---

## 4. Base de Datos

### Prisma + PostgreSQL vs. Alternativas

**Decisión**: Prisma ORM + PostgreSQL

**Justificación**:

| Aspecto | Prisma | TypeORM | MikroORM |
|--------|--------|---------|----------|
| Type Safety | Excelente | Bueno | Bueno |
| Migraciones | Automáticas | Manual | Automáticas |
| DX | Mejor | Bueno | Bueno |
| Performance | Muy bueno | Muy bueno | Muy bueno |
| Ecosystem | Creciente | Amplio | Creciente |

**PostgreSQL sobre MySQL/SQLite**:
- ✅ Soporte para JSON nativo
- ✅ Mejor concurrencia
- ✅ Más avanzado en queries complejas
- ✅ Soft deletes con índices

**Soft Deletes (deletedAt)**:
- Campos `deletedAt` en: User, Farm, Paddock, Herd, Animal
- Preserva auditoría completa
- Recuperación posible en futuro

---

## 5. Modelo de Datos

### Normalización vs. Desnormalización

**Decisión**: Normalización moderada con algunos campos desnormalizados

**Ejemplos**:

| Tabla | Campo Desnorm | Razón |
|-------|------------|-------|
| herds | currentWeight | Evita N+1 en listados |
| weighings | animalCount | Histórico de cantidad |
| movements | exitDate | Soft delete compatible |

**Relaciones**:
- Evitar joins complejos (> 3 tablas)
- Denormalizar solo si queries resultan lentas
- Mantener una tabla de auditoría separada

---

## 6. Cálculos

### Cálculos en Base de Datos vs. Aplicación

**Decisión**: Cálculos en aplicación (service layer)

**Justificación**:
- ✅ Lógica centralizada
- ✅ Fácil testear
- ✅ Menos dependencia de SQL nativo
- ✅ Reutilizable en frontend (Zod)

**Ejemplos**:
```typescript
// Dashboard Service
const ua = totalWeight / parameters.UAWeight;
const demand = ua * (parameters.dailyDemandPercent / 100);
const gain = finalWeight - initialWeight;
```

**Campo Almacenado**:
- Solo `herd.currentWeight` se almacena
- UA se calcula bajo demanda
- Histórico en tabla `weighings`

---

## 7. Dashboard

### Agregaciones Complejas

**Decisión**: Service layer con queries múltiples + in-memory aggregation

**Alternativa Rechazada**:
- Vistas SQL (menos flexible)
- Materialized Views (más complejo)

**Endpoints Separados**:
```
GET /dashboard/summary       → KPIs
GET /dashboard/trends        → Histórico peso/UA
GET /dashboard/rotation-status → Rotación actual
GET /dashboard/forage-stats  → Aforos recientes
GET /dashboard/alerts        → Alertas operativas
```

**Caché en Frontend**:
- TanStack Query con staleTime=5min
- Evita recalcular muy frecuentemente
- Usuario ve datos frescos sin overhead

---

## 8. Frontend

### Next.js App Router vs. Pages Router

**Decisión**: Next.js 14+ App Router

**Justificación**:
- ✅ Server Components (seguridad)
- ✅ Mejor performance (less JS)
- ✅ Layouts anidados naturales
- ✅ Futuro de Next.js

**Estructura**:
```
app/
├── layout.tsx           → Root + Metadata
├── layout-client.tsx    → QueryClientProvider
├── (auth)/
│   └── login/page.tsx
└── (dashboard)/         → Protected routes
    ├── dashboard/page.tsx
    ├── farms/
    │   ├── page.tsx     → List
    │   ├── [id]/page.tsx → Detail
    │   └── new/page.tsx  → Create
    └── ...
```

**MiddleWare (Futuro)**:
```typescript
// middleware.ts
if (!token) redirect('/auth/login')
```

---

## 9. Forms y Validación

### React Hook Form + Zod

**Decisión**: RHF + Zod, esquemas compartidos

**Ventajas**:
- ✅ Validación cliente: inmediata
- ✅ Validación servidor: con mismo schema
- ✅ Mensajes errores consistentes
- ✅ Performance (lazy validation)

**Flujo**:
```
Frontend Form (RHF)
    ↓
Zod validation (local)
    ↓
API call (dto con mismo schema)
    ↓
Backend (Controller + Pipe de Zod)
    ↓
Service (lógica)
    ↓
Prisma (validación modelo)
```

**Schemas Compartidos**:
```typescript
// packages/shared/src/index.ts
export const CreateFarmDtoSchema = z.object({
  name: z.string().min(3),
  location: z.string().min(2),
  totalHectares: z.number().positive(),
});

// Frontend y Backend usan el mismo schema
```

---

## 10. Estado Global

### TanStack Query para Server State

**Decisión**: TanStack Query (React Query) ÚNICAMENTE para server state

**Justificación**:
- ✅ Sincronización con servidor
- ✅ Caché automático
- ✅ Deduplicación requests
- ✅ Stale while revalidate

**No Usar Para**:
- UI state (form inputs) → React state / RHF
- User preferences → localStorage
- Auth token → localStorage (con precaución)

**Configuración Recomendada**:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,      // 5 min
      gcTime: 1000 * 60 * 10,         // 10 min
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

---

## 11. Estilos

### TailwindCSS + Custom Theme

**Decisión**: TailwindCSS sin CSS-in-JS

**Justificación**:
- ✅ Pequeño bundle size
- ✅ Utilidad first
- ✅ Fácil mantener consistencia
- ✅ Excelente soporte shadcn/ui

**Colores Corporativos**:
```javascript
theme: {
  colors: {
    primary: '#22c55e',    // Verde regenerativo
    secondary: '#a78bfa',   // Púrpura para acciones
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  }
}
```

**Componentes Base**:
- Inputs reutilizables con validación visual
- Buttons con variantes (primary/secondary/danger/ghost)
- Alerts con severidad
- Forms con etiquetas y helpers

---

## 12. Testing

### Estrategia Piramidal

**Decisión**: Implementar gradualmente

**Pirámide** (recomendado):
```
     E2E (10%)
    Integration (30%)
    Unit Tests (60%)
```

**Unit Tests** (Backend):
- Dashboard service: cálculos de UA, ganancia, demanda
- Auth service: login, token validation
- Farm service: access control

**Integration Tests** (Backend):
- Auth flow: login → token → protected endpoint
- Farm CRUD: create, read, update, delete con validación

**E2E Tests** (Futuro):
- Playwright/Cypress: login → farm creation → dashboard
- Validar flujos completos usuario

**Herramientas**:
- Backend: Jest + Supertest
- Frontend: Vitest + React Testing Library

---

## 13. Documentación API

### Swagger/OpenAPI

**Decisión**: Swagger automático con decoradores NestJS

**Ventajas**:
- ✅ Auto-generado desde código
- ✅ Sincronizado con cambios
- ✅ Interfaz interactiva

**Acceso**:
```
http://localhost:3000/api/docs
http://localhost:3000/api/json
```

**Decoradores**:
```typescript
@ApiOperation({ summary: 'Crear finca' })
@ApiResponse({ status: 201, type: FarmResponse })
@Post()
create(@Body() dto: CreateFarmDto) { ... }
```

---

## 14. Auditoría

### Tabla AuditLog Separada

**Decisión**: Tabla independiente, no softDelete logic mezclado

**Campos**:
```
id, userId, entityType, entityId, action, changes (JSON), createdAt
```

**Cuándo Registrar**:
- CREATE: Después de crear
- UPDATE: Cambios antes → después
- DELETE: Soft delete (registrar cambio)

**Queries Rápidas**:
```sql
SELECT * FROM audit_logs 
WHERE entityType = 'Farm' AND userId = '...'
ORDER BY createdAt DESC
LIMIT 100;
```

---

## 15. Deployments

### Docker + Docker Compose Local

**Decisión**: Docker para dev/prod consistency

**Ventajas**:
- ✅ Mismo entorno en laptop y servidor
- ✅ Fácil onboarding nuevos developers
- ✅ Reproducer bugs

**Stack**:
```yaml
postgres:16      → DB principal
api (NestJS)     → Backend
web (Next.js)    → Frontend
```

**Volumes**:
```
postgres_data    → Persistencia DB
./apps/api/src   → Hot reload backend
./apps/web/src   → Hot reload frontend
```

**Futuro (Fase 2)**:
- GitHub Container Registry
- Azure Container Instances
- Kubernetes (si escala)

---

## 16. Decisiones Pendientes (Fase 2+)

| Decisión | Opciones | TBD |
|----------|----------|-----|
| Offline Sync | Workbox / TanStack Query sync | ✓ |
| Auth Social | Entra ID / Google / GitHub | ✓ |
| Pagos | Stripe / PayU / MercadoPago | ✓ |
| Analytics | Mixpanel / Segment / Custom | ✓ |
| Logging | Datadog / New Relic / LogRocket | ✓ |
| Email | SendGrid / Postmark / AWS SES | ✓ |
| Geolocation | Mapbox / Google Maps / Leaflet | ✓ |
| Mobile | React Native / Flutter / PWA | ✓ |

---

## Conclusión

Las decisiones prueban un **balance entre pragmatismo y escalabilidad**:
- ✅ Tecnologías maduras (NestJS, Prisma, Next.js)
- ✅ DX excelente (TypeScript end-to-end)
- ✅ Performance competitivo (caché, queries optimizadas)
- ✅ Mantenibilidad (arquitectura clara, testing posible)
- ✅ Flexibilidad para pivots (arquitectura modular)

**No es YAGNI (You Aren't Gonna Need It)**. Es **construcción thoughtful** para MVP robusto que crece.
