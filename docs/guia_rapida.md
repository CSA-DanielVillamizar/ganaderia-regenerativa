# Guía Rápida de Desarrollo

## ⚡ 5 Minutos Setup

```bash
# 1. Clonar e instalar
git clone <repo> && cd ganaderia-regenerativa
npm install

# 2. Levantar Docker
docker-compose up -d

# 3. Preparar BD
docker-compose exec api npm run db:push
docker-compose exec api npm run db:seed

# 4. Acceder
# Frontend: http://localhost:3001
# API: http://localhost:3000/api/v1
# Docs: http://localhost:3000/api/docs
# Email: admin@magrotec.com | Password: Admin123!
```

## 📁 Estructura Rápida

```
apps/
├── api/src/
│   ├── auth/         # Login, JWT
│   ├── farm/         # CRUD fincas
│   ├── paddock/      # CRUD potreros
│   ├── herd/         # CRUD lotes
│   ├── weighing/     # Pesajes
│   ├── movement/     # Rotación
│   ├── forage/       # Aforos
│   ├── dashboard/    # KPIs y gráficas
│   └── main.ts
└── web/src/
    ├── app/
    │   ├── auth/     # Login
    │   ├── farms/    # Listado + detail
    │   └── dashboard/# Gráficas
    ├── components/   # Inputs, Buttons, Alerts
    ├── services/     # API client
    ├── lib/          # utils, api-config
    └── hooks/        # useAuth, useQuery
```

## 🔥 Comandos Comunes

### Backend

```bash
cd apps/api

# Desarrollo
npm run dev

# Ver BD (interfaz gráfica)
npx prisma studio

# Crear migración
npx prisma migrate dev --name "descripcion"

# Reset BD (borra todo)
npx prisma migrate reset

# Tests
npm run test
npm run test:watch
npm run test:cov

# Linting
npm run lint
npm run format
```

### Frontend

```bash
cd apps/web

# Desarrollo
npm run dev

# Build
npm run build

# Tests
npm run test
npm run test:watch

# Linting
npm run lint
npm run format
```

### Monorepo (root)

```bash
# Todos los comandos en todas las apps
npm run dev        # dev mode
npm run build      # build
npm run lint       # ESLint
npm run format     # Prettier

# Monitoreo Turbo
npx turbo ui
```

## 📊 Flujos Principales

### 1. Login

```
POST /auth/login
{
  "email": "admin@magrotec.com",
  "password": "Admin123!"
}

Response:
{
  "accessToken": "eyJh...",
  "user": {
    "id": "...",
    "email": "...",
    "role": "ADMIN"
  }
}
```

### 2. Crear Finca

```
POST /farms
Headers: Authorization: Bearer <token>
{
  "name": "Mi Finca",
  "location": "Bogotá",
  "totalHectares": 100
}
```

### 3. Registrar Pesaje

```
POST /weighings
{
  "herdId": "...",
  "totalWeight": 4900,
  "animalCount": 15,
  "weightDate": "2024-01-29"
}
```

### 4. Ver Dashboard

```
GET /dashboard/summary?farmId=...
GET /dashboard/trends?farmId=...
GET /dashboard/alerts?farmId=...
```

## 🐛 Debugging

### BD no sincroniza

```bash
# Reset completo
cd apps/api
npx prisma migrate reset

# O reconstruir esquema
npx prisma db push --force-reset
```

### Token expirado

```bash
# Limpiar localStorage
localStorage.clear()
# Y hacer login nuevamente
```

### Puerto ocupado

```bash
# Ver qué ocupa puerto 3000
lsof -i :3000

# O cambiar en docker-compose.yml
# ports:
#   - '3001:3000'  ← Cambiar acá
```

### Logs detallados

```bash
# Backend
docker-compose logs api -f

# Frontend
docker-compose logs web -f

# BD
docker-compose logs db -f
```

## 📝 Agregar Feature Nuevo

### Ejemplo: Crear módulo "Pasture" (Pasto)

#### 1. **Backend (NestJS)**

```bash
cd apps/api

# Generar módulo (NestJS schematic)
npx nest g module pasture
npx nest g service pasture/pasture
npx nest g controller pasture/pasture

# Editar: prisma/schema.prisma
# Agregar modelo Pasture

# Crear migración
npx prisma migrate dev --name "add_pasture"

# Editar: pasture.service.ts
# Agregar lógica

# Editar: pasture.controller.ts
# Agregar endpoints

# Editar: app.module.ts
# Importar PastureModule

# Tests
npm run test
```

#### 2. **Frontend (Next.js)**

```bash
cd apps/web

# Crear carpeta
mkdir -p src/app/pastures
mkdir -p src/components/forms

# Crear files:
# - app/pastures/page.tsx (listado)
# - app/pastures/[id]/page.tsx (detalle)
# - app/pastures/new/page.tsx (crear)
# - components/forms/PastureForm.tsx
# - services/api.service.ts (actualizar)

# Tests
npm run test
```

#### 3. **Shared (DTOs)**

```bash
cd packages/shared

# Editar: src/index.ts
# Agregar CreatePastureDtoSchema, enums, types

# Publicar cambios (npm publish si monorepo público)
```

#### 4. **Validar**

```bash
# Terminal 1: Backend
cd apps/api && npm run dev

# Terminal 2: Frontend
cd apps/web && npm run dev

# Terminal 3: BD
docker-compose up -d

# Probar en http://localhost:3001/pastures
```

## 🧪 Testing Rápido

### Unit Test (Dashboard Service)

```typescript
// apps/api/src/dashboard/dashboard.service.spec.ts
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(() => {
    service = new DashboardService(mockPrisma);
  });

  it('debería calcular UA correctamente', () => {
    const ua = 4500 / 450;
    expect(ua).toBe(10);
  });
});
```

### E2E Test (Cypress/Playwright)

```typescript
// e2e/login.spec.ts
test('usuario puede hacer login', async ({ page }) => {
  await page.goto('http://localhost:3001/auth/login');
  await page.fill('[name="email"]', 'admin@magrotec.com');
  await page.fill('[name="password"]', 'Admin123!');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

## 🔐 Seguridad Rápida

| Check | Comando |
|-------|---------|
| Secrets | `npm audit --production` |
| Tipos | `npm run build` |
| Lint | `npm run lint` |
| Auth | Verificar JWT en `/auth/me` |
| CORS | Check en swagger /api/docs |

## 📚 Documentación Rápida

- **[Arquitectura](./docs/arquitectura.md)** - Decisiones principales
- **[Modelo de Datos](./docs/modelo_datos.md)** - Tablas y relaciones
- **[Cálculos](./docs/calculos.md)** - Fórmulas de UA, ganancia, etc.
- **[Decisiones](./docs/decisiones.md)** - Por qué TypeScript, Next.js, Prisma, etc.
- **[API Docs](http://localhost:3000/api/docs)** - Swagger en vivo

## 🚀 Lanzar a Producción

```bash
# Build final
npm run build

# Crear imagen Docker
docker build -t ganaderia-api:latest ./apps/api
docker build -t ganaderia-web:latest ./apps/web

# Push a registry (ej. Docker Hub)
docker tag ganaderia-api:latest tu-usuario/ganaderia-api:latest
docker push tu-usuario/ganaderia-api:latest

# O deployar a Azure
az container create ...

# O a Vercel (frontend)
vercel deploy --prod
```

## 💬 Tips Finales

- **Hot Reload**: Cambios en código se reflejan automáticamente
- **Prisma Studio**: `npx prisma studio` para inspeccionar BD gráficamente
- **API Docs**: Swagger en `/api/docs` siempre sincronizado
- **Git Hooks**: Husky + lint-staged previene commits malos
- **Turbo Cache**: Primera build lenta, siguientes muy rápidas

---

¡Happy coding! 🚀🌾
