# Rotación Ganado - Estructura Completa del Proyecto

## 📦 Estructura General

```
ganaderia-regenerativa/
│
├── 📄 README.md                    # Inicio rápido (inglés)
├── 📄 LEEME.md                     # Inicio rápido (español)
├── 📄 CHANGELOG.md                 # Historial de versiones
├── 📄 package.json                 # Workspace root (monorepo)
├── 📄 tsconfig.json                # TypeScript base config
├── 📄 turbo.json                   # Turbo orchestration
├── 📄 .eslintrc.json               # ESLint config
├── 📄 .prettierrc.json             # Prettier config
├── 📄 .gitignore                   # Git ignore
├── 📄 docker-compose.yml           # Docker services
│
├── 📁 .github/
│   └── 📁 workflows/
│       └── ci.yml                  # GitHub Actions CI
│
├── 📁 .husky/                      # Git hooks
│   └── pre-commit
│
├── 📁 docs/
│   ├── 📄 arquitectura.md          # Decisiones técnicas
│   ├── 📄 modelo_datos.md          # 15 tablas, relaciones
│   ├── 📄 calculos.md              # Fórmulas (UA, ganancia, demanda)
│   ├── 📄 decisiones.md            # Por qué cada decisión
│   ├── 📄 guia_rapida.md           # Comandos y debugging
│   └── 📄 CONTRIBUTING.md          # Estándares de código
│
├── 📁 packages/
│   └── 📁 shared/                  # DTOs y tipos compartidos
│       ├── 📄 package.json
│       ├── 📄 tsconfig.json
│       └── 📁 src/
│           └── index.ts            # Enums, DTOs, schemas Zod
│
├── 📁 apps/
│   │
│   ├── 📁 api/                     # 🔧 BACKEND - NestJS
│   │   ├── 📄 package.json         # Dependencies
│   │   ├── 📄 jest.config.ts       # Unit tests config
│   │   ├── 📄 .env.example
│   │   ├── 📄 Dockerfile
│   │   ├── 📄 tsconfig.json
│   │   ├── 📄 tsconfig.build.json
│   │   │
│   │   └── 📁 src/
│   │       ├── 📄 main.ts          # Bootstrap NestJS
│   │       ├── 📄 app.module.ts    # Root module
│   │       │
│   │       ├── 📁 auth/            # Autenticación JWT
│   │       │   ├── auth.service.ts
│   │       │   ├── auth.controller.ts
│   │       │   ├── 📁 strategies/
│   │       │   │   └── jwt.strategy.ts
│   │       │   ├── 📁 guards/
│   │       │   │   ├── jwt-auth.guard.ts
│   │       │   │   └── roles.guard.ts
│   │       │   └── 📁 decorators/
│   │       │       └── roles.decorator.ts
│   │       │
│   │       ├── 📁 farm/            # CRUD Fincas
│   │       │   ├── farm.service.ts
│   │       │   ├── farm.controller.ts
│   │       │   └── farm.module.ts
│   │       │
│   │       ├── 📁 paddock/         # CRUD Potreros
│   │       │   ├── paddock.service.ts
│   │       │   ├── paddock.controller.ts
│   │       │   └── paddock.module.ts
│   │       │
│   │       ├── 📁 herd/            # CRUD Lotes
│   │       │   ├── herd.service.ts
│   │       │   ├── herd.controller.ts
│   │       │   └── herd.module.ts
│   │       │
│   │       ├── 📁 weighing/        # Pesajes
│   │       │   ├── weighing.service.ts
│   │       │   ├── weighing.controller.ts
│   │       │   └── weighing.module.ts
│   │       │
│   │       ├── 📁 movement/        # Rotación
│   │       │   ├── movement.service.ts
│   │       │   ├── movement.controller.ts
│   │       │   └── movement.module.ts
│   │       │
│   │       ├── 📁 forage/          # Aforos
│   │       │   ├── forage.service.ts
│   │       │   ├── forage.controller.ts
│   │       │   └── forage.module.ts
│   │       │
│   │       ├── 📁 dashboard/       # KPIs & Trends
│   │       │   ├── dashboard.service.ts
│   │       │   ├── dashboard.controller.ts
│   │       │   └── dashboard.module.ts
│   │       │
│   │       └── 📁 common/          # Shared infrastructure
│   │           ├── 📁 prisma/
│   │           │   └── prisma.service.ts
│   │           └── 📁 filters/
│   │               └── http-exception.filter.ts
│   │
│   └── 📁 prisma/               # ORM & Migrations
│       ├── 📄 schema.prisma      # 15 modelos
│       ├── 📄 seed.ts            # Seed data
│       └── 📁 migrations/        # Historial
│
│   ├── 📁 web/                  # 🎨 FRONTEND - Next.js
│   │   ├── 📄 package.json
│   │   ├── 📄 vitest.config.ts  # Unit tests config
│   │   ├── 📄 .env.local.example
│   │   ├── 📄 next.config.js
│   │   ├── 📄 tsconfig.json
│   │   ├── 📄 tailwind.config.js
│   │   ├── 📄 Dockerfile
│   │   │
│   │   ├── 📁 public/           # Static assets
│   │   │   └── favicon.ico
│   │   │
│   │   └── 📁 src/
│   │       │
│   │       ├── 📁 app/          # Next.js App Router
│   │       │   ├── layout.tsx          # Root layout
│   │       │   ├── layout-client.tsx   # QueryClientProvider
│   │       │   ├── page.tsx            # Home page
│   │       │   │
│   │       │   ├── 📁 auth/
│   │       │   │   └── 📁 login/
│   │       │   │       └── page.tsx    # Login page
│   │       │   │
│   │       │   ├── 📁 farms/
│   │       │   │   ├── page.tsx        # Listado fincas
│   │       │   │   ├── 📁 [id]/
│   │       │   │   │   └── page.tsx    # Detalle finca
│   │       │   │   └── 📁 new/
│   │       │   │       └── page.tsx    # Crear finca
│   │       │   │
│   │       │   ├── 📁 dashboard/
│   │       │   │   ├── page.tsx        # Dashboard principal
│   │       │   │   └── layout.tsx
│   │       │   │
│   │       │   └── 📁 error.tsx        # Error boundary
│   │       │
│   │       ├── 📁 components/    # Reutilizables
│   │       │   ├── 📁 common/
│   │       │   │   ├── Input.tsx
│   │       │   │   ├── Button.tsx
│   │       │   │   ├── LoadingSpinner.tsx
│   │       │   │   └── Alert.tsx
│   │       │   │
│   │       │   ├── 📁 layout/
│   │       │   │   ├── Navigation.tsx  # Sidebar + BottomNav
│   │       │   │   └── Header.tsx
│   │       │   │
│   │       │   └── 📁 forms/    # (Futuro)
│   │       │       ├── FarmForm.tsx
│   │       │       ├── HerdForm.tsx
│   │       │       └── WeighingForm.tsx
│   │       │
│   │       ├── 📁 hooks/        # Custom React hooks
│   │       │   └── useAuth.ts
│   │       │
│   │       ├── 📁 lib/          # Utilidades
│   │       │   ├── api-config.ts      # URLs, rutas
│   │       │   ├── api-client.ts      # Axios instance
│   │       │   └── utils.ts           # formatDate, etc.
│   │       │
│   │       ├── 📁 services/     # API client
│   │       │   ├── auth.service.ts
│   │       │   └── api.service.ts     # CRUD para todas entidades
│   │       │
│   │       ├── 📁 styles/
│   │       │   └── globals.css        # Estilos globales
│   │       │
│   │       └── 📁 test/         # Test setup
│   │           └── setup.ts
│   │
└── Otros archivos raíz
    ├── .lintstagedrc.json       # Lint staged config
    └── .env (local development)
```

## 📊 Estadísticas

### Líneas de Código (Estimado)

| Carpeta | Archivos | LOC |
|---------|----------|-----|
| apps/api/src | 25 | 2,500 |
| apps/web/src | 15 | 1,800 |
| packages/shared | 1 | 400 |
| docs | 6 | 3,000 |
| **Total** | **47** | **7,700** |

### Coverage de Funcionalidades

| Aspecto | % Completo |
|---------|-----------|
| Backend CRUD | 100% |
| Frontend Páginas | 100% |
| Dashboard | 100% |
| Tests | 0% (Fase 2) |
| Documentación | 100% |
| DevOps | 80% |

## 🔌 Integraciones

### APIs Externas

- ✅ **PostgreSQL** - Base de datos
- ✅ **Prisma Cloud** - ORM (opcional)
- 🔄 **Entra ID** - Auth (Fase 2)
- 🔄 **SendGrid** - Email (Fase 2)
- 🔄 **Stripe** - Pagos (Fase 2)

### Librerías Principales

**Backend (30+ dependencias)**:
```json
{
  "@nestjs/common": "^10.0.0",
  "@nestjs/jwt": "^11.0.0",
  "prisma": "^5.0.0",
  "passport-jwt": "^4.0.1",
  "bcryptjs": "^2.4.3",
  "zod": "^3.22.0"
}
```

**Frontend (35+ dependencias)**:
```json
{
  "next": "^14.1.0",
  "react": "^18.2.0",
  "@tanstack/react-query": "^5.0.0",
  "react-hook-form": "^7.48.0",
  "recharts": "^2.10.0",
  "tailwindcss": "^3.4.0",
  "zod": "^3.22.0"
}
```

## 🚀 Deployment Checklist

- [ ] Variables de entorno (.env configurados)
- [ ] DB migrations ejecutadas (`npm run db:push`)
- [ ] Seed data cargado (`npm run db:seed`)
- [ ] Linting pasó (`npm run lint`)
- [ ] Build completó sin errores (`npm run build`)
- [ ] Tests corrieron (`npm run test`)
- [ ] Docker images built
- [ ] Secretos guardados en KeyVault/Secrets Manager
- [ ] CORS, HTTPS, CSP configurados
- [ ] Health checks listos
- [ ] Monitoring/Logging habilitado
- [ ] Backups programados

## 📞 Soporte Rápido

| Problema | Solución |
|----------|----------|
| Puerto 3000 ocupado | `lsof -i :3000` o cambiar en docker-compose.yml |
| BD no synca | `npx prisma migrate reset` |
| Token expirado | `localStorage.clear()` y re-login |
| Node modules huge | `npm install --legacy-peer-deps` |
| Migraciones fallidas | Ver `.prisma/migrations/` y rollback |

---

**Generado automáticamente - Última actualización: Enero 2024**
