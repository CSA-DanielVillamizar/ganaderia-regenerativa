# Rotación Ganado - README Principal

> Aplicación web premium para gestión de ganadería regenerativa y rotación de potreros.

## ⚠️ Estado de Certificación MVP

**Versión:** 0.1.0-beta  
**Fecha:** 2025-12-26  
**Estado:** � REFACTORIZACIÓN HACIA PRODUCCIÓN

### Resumen Ejecutivo
Este proyecto está bajo refactorización guiada por metodología **GAP-DRIVEN** para alcanzar producción. Se identificaron **16 gaps críticos** (P0-P3) que requieren:
- ✅ Tests unitarios + integración + E2E
- ✅ Validaciones de negocio ganadero
- ✅ RBAC real a nivel API
- ✅ CI/CD con GitHub Actions

**Documentación de calidad:**
- [Definition of Done](./docs/definition_of_done.md) - Criterios de aceptación
- [QA Gaps](./docs/qa_gaps.md) - Lista priorizada de brechas (P0→P3)
- [Traceability Matrix](./docs/traceability_matrix.md) - Mapeo Req → UI → API → Tests

**Progreso P0:** 2/6 gaps cerrados (33%) | **Próximo hito:** P0.3 - Aforos reales

### Historial de Cierres

**P0.1 - Fuente de Verdad de Lote en Potrero** ✅ CLOSED (26 dic 2025)
- Agregado `status` (ACTIVE/CLOSED) a Movement
- Tests: 8/8 ✅ PASSING
- Impact: Un lote solo puede estar en un potrero a la vez

**P0.2 - Carga Animal Correcta (UA y UA/ha)** ✅ CLOSED (26 dic 2025)
- Servicio Parameter para parámetros configurables
- Herd.calculateUA() y updateCurrentUA()
- Endpoint: GET /paddocks/:id/stocking-rate
- Tests: 25/25 ✅ PASSING (Parameter 9, Herd 10, Paddock 6)
- Impact: Cálculos de carga animal basados en parámetros reales

---

## 🚀 Inicio Rápido

### Con Docker Compose (Recomendado)

```bash
# 1. Clonar y acceder
git clone <repo>
cd ganaderia-regenerativa

# 2. Levantar servicios
docker-compose up -d

# 3. Crear y poblar base de datos
docker-compose exec api npm run db:push
docker-compose exec api npm run db:seed

# 4. Acceder a la aplicación
# Frontend: http://localhost:3001
# API: http://localhost:3000/api/v1
# Documentación: http://localhost:3000/api/docs
```

### Credenciales Demo

```
Email: admin@magrotec.com
Contraseña: Admin123!
```

### Sin Docker (Desarrollo Local)

#### Prerequisites

- Node.js 18+
- PostgreSQL 16+
- npm o yarn

#### Backend

```bash
cd apps/api

# Copiar variables de entorno
cp .env.example .env
# Editar .env con tu DATABASE_URL

# Instalar y ejecutar
npm install
npx prisma db push
npx prisma db seed
npm run dev
```

#### Frontend

```bash
cd apps/web

# Copiar variables de entorno
cp .env.local.example .env.local

# Instalar y ejecutar
npm install
npm run dev
```

## 📁 Estructura del Proyecto

```
ganaderia-regenerativa/
├── apps/
│   ├── api/              # Backend NestJS + Prisma
│   │   ├── src/          # Código fuente
│   │   ├── prisma/       # Schema, migraciones, seed
│   │   └── test/         # Tests
│   └── web/              # Frontend Next.js
│       ├── src/
│       │   ├── app/      # Páginas y rutas
│       │   ├── components/
│       │   ├── lib/
│       │   └── services/
│       └── test/
├── packages/
│   └── shared/           # DTOs, tipos compartidos
├── docs/                 # Documentación
└── docker-compose.yml
```

## 🏗️ Stack Tecnológico

### Backend

- **NestJS** - Framework TypeScript
- **Prisma** - ORM y migraciones
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación
- **Zod** - Validación de tipos

### Frontend

- **Next.js 14+** - App Router
- **React 18** - UI library
- **TailwindCSS** - Estilos
- **React Hook Form** - Forms
- **TanStack Query** - Estado y caché
- **Recharts** - Gráficas
- **Zod** - Validación

### DevOps

- **Docker & Docker Compose** - Containerización
- **GitHub Actions** - CI/CD
- **ESLint & Prettier** - Calidad de código

## 🧮 Conceptos Clave

### Unidad Animal (UA)

```
UA = Peso Total (kg) / 450 kg
Ejemplo: 4500 kg / 450 = 10 UA
```

### Ciclo de Rotación

- **Ocupación**: Días que lote permanece en potrero
- **Descanso**: Período antes de reutilizar potrero
- **Ciclo típico**: 40-55 días con 8 potreros

### Aforo

Estimación de forraje mediante marco cuadrado:
- `kg/ha`: Biomasa disponible por hectárea
- `MS%`: Materia seca (%)

### Cálculos Automáticos

```
Ganancia = Peso Final - Peso Inicial
Demanda = UA × 2.5% del Peso Vivo (configurable)
Forraje Disponible = kg/ha × hectáreas × aprovechamiento%
Días Recomendados = Forraje Disponible / Demanda Diaria
```

## 📊 Módulos Incluidos (MVP)

✅ Autenticación (JWT + credenciales)
✅ Gestión de Fincas (CRUD)
✅ Gestión de Potreros (CRUD)
✅ Gestión de Lotes/Animales (CRUD)
✅ Registro de Pesajes
✅ Movimientos (entrada/salida a potreros)
✅ Aforos (marcos cuadrados)
✅ Cálculos automáticos (UA, ganancia, días)
✅ Dashboard con 6 gráficas principales
✅ RBAC (4 roles)
✅ Auditoría de cambios
✅ Seed data (caso completo)

## 🎯 Dashboard - Gráficas Principales

1. **Evolución de Peso** (Línea)
2. **Evolución de UA** (Línea)
3. **Ocupación por Potrero** (Timeline)
4. **Forraje Disponible** (Barras)
5. **Alertas y Estado** (Cards + Semáforo)
6. **KPIs Resumen** (Tarjetas)

## 🔐 Seguridad y RBAC

### Roles

| Rol | Permisos |
|-----|----------|
| ADMIN | Acceso total |
| TECHNICIAN | Gestión técnica de datos |
| MANAGER | Supervisión operativa |
| VIEWER | Solo lectura |

### Protecciones

- ✅ JWT obligatorio en todos los endpoints
- ✅ Validación de acceso a finca por usuario
- ✅ CORS configurado
- ✅ Rate limiting (implementar en Fase 2)
- ✅ Validación server-side de entrada

## 📝 Scripts Disponibles

### Root (Monorepo)

```bash
npm run dev          # Dev mode todas las apps
npm run build        # Build todas las apps
npm run test         # Tests todas las apps
npm run lint         # ESLint todas las apps
npm run format       # Prettier todas las apps
npm run format:fix   # Prettier fix todas las apps
```

### Backend (`apps/api`)

```bash
npm run dev          # Watch mode
npm run build        # Build para producción
npm run start        # Ejecutar build
npm run test         # Jest tests
npm run lint         # ESLint
npm run db:push      # Aplicar schema Prisma
npm run db:migrate   # Crear migración
npm run db:seed      # Poblar datos de ejemplo
npm run db:studio    # Prisma Studio (UI)
```

### Frontend (`apps/web`)

```bash
npm run dev          # Dev server
npm run build        # Build optimizado
npm run start        # Servidor producción
npm run test         # Vitest
npm run lint         # ESLint
```

## 🗄️ Base de Datos

### Tablas Principales

- `users` - Usuarios del sistema
- `farms` - Fincas
- `user_farms` - Permisos usuario-finca
- `paddocks` - Potreros
- `herds` - Lotes
- `animals` - Animales individuales
- `weighings` - Pesajes
- `cycles` - Ciclos de rotación
- `movements` - Movimientos entrada/salida
- `forage_samples` - Aforos
- `parameters` - Configuración por finca
- `audit_logs` - Bitácora

### Acceder a la BD

```bash
# Con Docker
docker-compose exec db psql -U ganaderia -d ganaderia_dev

# Sin Docker (si PostgreSQL está en local)
psql -U ganaderia -d ganaderia_dev

# O usar Prisma Studio
cd apps/api
npx prisma studio
```

## 🧪 Testing

```bash
# Backend - Unit tests
cd apps/api
npm run test
npm run test:watch
npm run test:cov

# Frontend
cd apps/web
npm run test
npm run test:watch
```

## 📚 Documentación

- [Arquitectura Detallada](./docs/arquitectura.md)
- [Modelo de Datos](./docs/modelo_datos.md)
- [Fórmulas y Cálculos](./docs/calculos.md)
- [Decisiones de Diseño](./docs/decisiones.md)

## 🚀 Deploy (Futuro)

Próximas fases incluirán deployment a:

- ☐ Docker Hub
- ☐ Azure Container Instances
- ☐ Vercel (Frontend)
- ☐ Azure App Service (Backend)

## 📝 Datos de Ejemplo (Seed)

El `seed.ts` automáticamente carga:

```
Finca: Las Praderas (Cundinamarca, 50 ha)
├── 8 Potreros (5-8 ha cada uno)
├── 1 Lote: 15 novillas
│   ├── Peso inicial: 4500 kg (10 UA)
│   └── Peso actual: 4900 kg (10.89 UA)
├── 5 Pesajes históricos (ganancia de 80 kg)
├── 5 Movimientos de rotación
└── Aforos con kg/ha estimados (2500-4000 kg/ha)

Usuarios:
- admin@magrotec.com / Admin123! (ADMIN)
- tecnico@magrotec.com / Tech123! (TECHNICIAN)
```

## 🛠️ Troubleshooting

### Error de conexión a BD

```bash
# Verificar que PostgreSQL está corriendo
docker-compose ps

# Ver logs
docker-compose logs db

# Recrear contenedor
docker-compose down -v
docker-compose up -d db
```

### Error de Prisma

```bash
# Regenerar cliente
cd apps/api
npx prisma generate

# Resetear BD (borrar datos)
npx prisma migrate reset
```

### Puertos en uso

Cambiar en `docker-compose.yml`:

```yaml
services:
  api:
    ports:
      - '3001:3000'  # Cambiar 3001
  web:
    ports:
      - '3002:3000'  # Cambiar 3002
```

## 📞 Soporte

Para preguntas o problemas:

1. Revisar [Arquitectura](./docs/arquitectura.md)
2. Consultar logs: `docker-compose logs`
3. Prisma Studio: `npx prisma studio`

## 📄 Licencia

MIT © 2025 Magrotec

---

**Happy farming! 🌾🐄**
