# Rotación Ganado - Documentación de Arquitectura

## Visión General

**Rotación Ganado** (Magrotec) es una aplicación web premium para gestión de ganadería regenerativa y rotación de potreros.

### Objetivos Principales

- 📊 Gestionar inventario de ganado (lotes, animales, pesajes)
- 🌾 Planificar y registrar rotación de potreros
- 📐 Realizar aforos (marcos cuadrados) para estimar forraje
- 🧮 Calcular automáticamente UA (Unidades Animales) y ganancias
- 📈 Mostrar dashboards premium con gráficas e indicadores

## Stack Tecnológico

### Backend

- **Framework**: NestJS
- **Lenguaje**: TypeScript
- **ORM**: Prisma
- **Base de Datos**: PostgreSQL
- **Autenticación**: JWT
- **Validación**: Zod, Class Validator
- **Testing**: Jest, Supertest

### Frontend

- **Framework**: Next.js 14+ (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: TailwindCSS
- **Componentes UI**: shadcn/ui, Radix UI, lucide-react
- **Forms**: React Hook Form + Zod
- **State Management**: TanStack Query (React Query)
- **Gráficas**: Recharts
- **Testing**: Vitest, React Testing Library

### DevOps

- **Contenedorización**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Calidad de Código**: ESLint, Prettier, Husky, lint-staged

## Arquitectura

### Monorepo Structure

```
├── apps/
│   ├── api/              # Backend NestJS
│   │   ├── src/
│   │   │   ├── auth/     # Módulo de autenticación
│   │   │   ├── farm/     # Gestión de fincas
│   │   │   ├── paddock/  # Gestión de potreros
│   │   │   ├── herd/     # Gestión de lotes
│   │   │   ├── weighing/ # Registro de pesajes
│   │   │   ├── movement/ # Movimientos entrada/salida
│   │   │   ├── forage/   # Aforos
│   │   │   ├── dashboard/# Dashboards
│   │   │   ├── common/   # Utilidades compartidas
│   │   │   └── main.ts
│   │   ├── prisma/       # Schema, migraciones, seed
│   │   └── package.json
│   └── web/              # Frontend Next.js
│       ├── src/
│       │   ├── app/      # App Router (páginas)
│       │   ├── components/ # Componentes reutilizables
│       │   ├── hooks/    # Custom hooks
│       │   ├── lib/      # Utilidades
│       │   ├── services/ # Servicios API
│       │   └── styles/   # CSS global
│       └── package.json
├── packages/
│   └── shared/           # DTOs, tipos, esquemas Zod compartidos
├── docker-compose.yml
└── package.json (workspace root)
```

### Capas (Backend)

**Clean Architecture Ligera:**

1. **Interface (Controllers)**: Reciben requests HTTP
2. **Application (Services)**: Lógica de negocio, CRUD, cálculos
3. **Domain (Models)**: Entidades y reglas de dominio (Prisma)
4. **Infrastructure (Prisma, JWT)**: Acceso a base de datos y externos

### Flujo de Datos (Frontend)

```
UI Components
    ↓
React Hook Form + Zod (validación cliente)
    ↓
Services (api-client con axios)
    ↓
TanStack Query (caché, sincronización)
    ↓
API Backend (NestJS)
```

## Conceptos de Dominio

### Unidad Animal (UA)

- **Definición**: Unidad de medida estándar = 450 kg
- **Cálculo**: `UA = pesoTotalKg / 450`

### Ciclo de Rotación

- **Duración típica**: 40-55 días
- **Potreros**: 8 potreros en ejemplo (configurable)
- **Ocupación**: Número de días que lote está en potrero
- **Descanso**: Período antes de siguiente ocupación

### Aforo

- **Método**: Marco cuadrado (1 m²)
- **Parámetros**:
  - kg/ha (forraje disponible)
  - MS% (materia seca)
- **Uso**: Estimar forraje disponible = `kg/ha * hectáreas * %aprovechamiento`

### Cálculos Clave

```
Demanda diaria = UA total × 2.5% PV (configurable)
Forraje disponible = kg/ha × ha potrero × 60% (aprovechamiento)
Días recomendados = Forraje disponible / Demanda diaria
Ganancia kg = Peso final - Peso inicial
Ganancia UA = (Peso final / 450) - (Peso inicial / 450)
```

## Modelos de Datos

### Entidades Principales

1. **User**: Usuarios del sistema con roles (ADMIN, TECHNICIAN, MANAGER, VIEWER)
2. **Farm**: Finca/granja
3. **Paddock**: Potrero (parcela para pastoreo)
4. **Herd**: Lote (grupo de animales)
5. **Animal**: Animal individual
6. **Weighing**: Pesaje (peso grupal o por animal)
7. **Cycle**: Ciclo de rotación
8. **Movement**: Entrada/salida de lote a potrero
9. **ForageSample**: Aforo
10. **Parameter**: Configuración de cálculos por finca
11. **AuditLog**: Bitácora de cambios

### Relaciones Clave

- Un usuario puede gestionar múltiples fincas
- Una finca tiene múltiples potreros y lotes
- Un lote tiene múltiples animales
- Un lote puede estar activo en 1 potrero a la vez
- Los movimientos permiten rastrear ocupación/descanso

## Endpoints API (v1)

### Autenticación

- `POST /auth/login`: Login
- `GET /auth/me`: Perfil actual

### Fincas

- `POST /farms`: Crear
- `GET /farms`: Listar mis fincas
- `GET /farms/{id}`: Detalle
- `PUT /farms/{id}`: Actualizar
- `DELETE /farms/{id}`: Eliminar

### Potreros

- `POST /paddocks`: Crear
- `GET /paddocks?farmId=...`: Listar por finca
- `GET /paddocks/{id}`: Detalle
- `PUT /paddocks/{id}`: Actualizar
- `DELETE /paddocks/{id}`: Eliminar

### Lotes

- `POST /herds`: Crear
- `GET /herds?farmId=...`: Listar por finca
- `GET /herds/{id}`: Detalle (incluye animales)
- `PUT /herds/{id}`: Actualizar
- `DELETE /herds/{id}`: Eliminar

### Pesajes

- `POST /weighings`: Registrar
- `GET /weighings?herdId=...`: Listar por lote
- `GET /weighings/{herdId}/history`: Historial con cálculos

### Movimientos

- `POST /movements`: Registrar entrada/salida
- `GET /movements?herdId=...`: Listar por lote
- `PUT /movements/{id}`: Actualizar
- `GET /movements/{id}/occupancy`: Calcular días ocupados

### Aforos

- `POST /forage-samples`: Registrar
- `GET /forage-samples?paddockId=...`: Listar por potrero
- `GET /forage-samples/farm/{farmId}`: Últimos 30 días

### Dashboard

- `GET /dashboard/summary?farmId=...`: KPIs
- `GET /dashboard/trends?farmId=...`: Tendencias peso/UA
- `GET /dashboard/rotation-status?farmId=...`: Estado rotación
- `GET /dashboard/forage-stats?farmId=...`: Estadísticas aforos
- `GET /dashboard/alerts?farmId=...`: Alertas operativas

## RBAC (Control de Acceso)

### Roles

1. **ADMIN**: Acceso total
2. **TECHNICIAN**: Gestión técnica (datos, cálculos)
3. **MANAGER**: Supervisión (lectura+escritura datos operativos)
4. **VIEWER**: Solo lectura

### Protección

- Todos los endpoints requieren JWT
- Verificación de acceso a finca por UserFarm
- Guards: `JwtAuthGuard`, `RolesGuard`

## Auditoría

Tabla `AuditLog` registra:

- Quién realizó la acción
- Qué entidad fue modificada
- Cuándo ocurrió
- Cambios realizados (JSON)

## Dashboard (MVP)

### 6 Gráficas Principales

1. **Evolución de Peso** (Línea): Peso total vs tiempo
2. **Evolución de UA** (Línea): UA total vs tiempo
3. **Ocupación por Potrero** (Timeline/Barras): Qué lote en qué potrero
4. **Forraje Disponible** (Barras): kg/ha por potrero
5. **Alertas y Estado**: Cards con semáforo
6. **KPIs**: Tarjetas de resumen (lotes, animales, UA, etc.)

## Ejecución Local

### Con Docker Compose

```bash
# Clonar y preparar
git clone <repo>
cd ganaderia-regenerativa

# Levantar servicios
docker-compose up -d

# Ejecutar migraciones y seed
docker-compose exec api npm run db:push
docker-compose exec api npm run db:seed

# Acceder
# Frontend: http://localhost:3001
# API: http://localhost:3000/api/v1
# Docs: http://localhost:3000/api/docs
```

### Sin Docker (Local)

```bash
# Backend
cd apps/api
npm install
npx prisma db push
npx prisma db seed
npm run dev

# Frontend (en otra terminal)
cd apps/web
npm install
npm run dev
```

## Datos de Ejemplo (Seed)

El seed crea:

- 1 usuario admin (admin@magrotec.com / Admin123!)
- 1 usuario técnico (tecnico@magrotec.com / Tech123!)
- 1 finca "Las Praderas" (Cundinamarca)
- 8 potreros (5-8 ha cada uno)
- 1 lote de 15 novillas
- 5 pesajes históricos (incremento de 80 kg)
- 5 movimientos de rotación
- Aforos en todos los potreros
- Parámetros de cálculo configurados

## Testing

```bash
# Backend - Unit tests
cd apps/api
npm run test

# Backend - Coverage
npm run test:cov

# Frontend - Vitest
cd apps/web
npm run test

# E2E
npm run test:e2e
```

## CI/CD (GitHub Actions)

Pipeline automatizado:

1. **Install**: npm install
2. **Lint**: eslint
3. **Type Check**: tsc
4. **Build**: next build + nest build
5. **Test**: jest + vitest
6. **Deploy** (futuro)

## Decisiones Clave

### Prisma + PostgreSQL

- ✅ Type-safe ORM
- ✅ Migraciones automáticas
- ✅ Excelente DX

### Next.js App Router

- ✅ Server Components para seguridad
- ✅ API Routes integradas (future)
- ✅ Mejor performance

### React Query + TypeScript

- ✅ Sincronización de estado
- ✅ Caché automático
- ✅ Deduplicación de requests

### TailwindCSS

- ✅ Utility-first
- ✅ Componentes reutilizables
- ✅ Dark mode listo

## Próximas Fases

### Fase 2

- [ ] Planificador de rotación tipo Gantt
- [ ] Sync offline-first
- [ ] Exportación PDF/Excel
- [ ] Integración Entra ID / Azure AD B2C
- [ ] Analítica avanzada

### Fase 3

- [ ] Mobile app nativa (React Native)
- [ ] IoT sensores de peso/clima
- [ ] Machine learning para predicción

## Contacto y Soporte

**Magrotec** - Ganadería Regenerativa Inteligente

Desarrollo Tech Lead: [Tu nombre]
