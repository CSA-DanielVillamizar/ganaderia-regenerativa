# 🌾 Ganadería Regenerativa - Sistema Integral de Rotación Sostenible

> **Aplicación web profesional para optimizar la rotación de potreros y gestión integral de ganadería regenerativa**

[![CI Tests](https://github.com/CSA-DanielVillamizar/ganaderia-regenerativa/actions/workflows/tests.yml/badge.svg)](https://github.com/CSA-DanielVillamizar/ganaderia-regenerativa)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 📋 Descripción General

**Ganadería Regenerativa** es una plataforma integral diseñada para **optimizar la rotación sostenible de potreros** en sistemas ganaderos. La aplicación facilita la toma de decisiones científicas mediante análisis de datos reales (aforos, pesajes, movimientos) y recomendaciones automáticas basadas en parámetros configurables.

### ¿Para Qué Sirve?

Esta aplicación resuelve los principales desafíos en ganadería regenerativa:

| Desafío | Solución |
|---------|----------|
| 📊 **Desconocimiento del estado real de potreros** | Dashboard decisional con recomendación de próximo potrero basada en descanso, forraje y carga animal |
| 🔄 **Ciclos de rotación incorrectos** | Movimientos automáticos con cálculo de ocupación/descanso |
| 🌱 **Aforos imprecisos** | Registro de aforos en marco cuadrado con cálculo de kg/ha y MS% |
| ⚖️ **Control de ganancia inadecuado** | Pesajes periódicos con cálculo automático de ganancia por UA |
| 📈 **Falta de trazabilidad** | Auditoría completa de cambios con timestamps y usuario |
| 🎯 **Decisiones empíricas** | Sistema de confianza y explainability para cada recomendación |

### Casos de Uso Principales

1. **Ganadero operario**: Ver decisión del día y registrar operaciones (movimientos, pesajes, aforos)
2. **Técnico predial**: Analizar históricos, ajustar parámetros, revisar alertas de rotación
3. **Gerente**: Supervisar KPIs, evolución de ganancia, rentabilidad por lote
4. **ADMIN**: Gestionar usuarios, fincas, roles y accesos

## 🎯 Estado Actual (v0.2.0 - Enero 2026)

| Componente | Estado | % Avance |
|-----------|--------|----------|
| **Fase 1: Bases** | ✅ COMPLETA | 100% |
| **Fase 2: Punto 4 (UX Web)** | ✅ COMPLETA | 100% |
| **CI/CD (103 tests)** | ✅ VERDE | 100% |
| **Fase 2: Punto 4.3 (Operation Wizards)** | 🔨 EN PROGRESO | 0% |

### Funcionalidades Implementadas ✅

**Backend (API REST)**
- ✅ Autenticación JWT + roles (ADMIN, TECHNICIAN, MANAGER, VIEWER)
- ✅ CRUD completo: Fincas, Potreros, Lotes, Animales, Usuarios
- ✅ Registro de operaciones: Pesajes, Aforos, Movimientos
- ✅ Sistema de Parameters (configuración por finca)
- ✅ **Decision Today**: Endpoint decisional con confianza y explainability
- ✅ Cálculos automáticos: UA, ganancia, demanda, dias recomendados
- ✅ Validación de rotación: Alertas por ocupación/descanso excesivo
- ✅ Filtros globales de excepciones
- ✅ 103 tests pasando (unitarios + integración)

**Frontend (Next.js + React)**
- ✅ Autenticación con formulario y persistencia
- ✅ Layout responsivo con sidebar y header
- ✅ **Página Decision Today** (recomendación diaria inteligente)
- ✅ Components: ConfidenceBadge, ExplainabilityPanel, ActionChecklistPanel
- ✅ Fetch wrapper con manejo de errores y traceId
- ✅ Estados: Loading, Error, Empty, Success
- ✅ Navegación inteligente entre pantallas
- ✅ Integración con API via React Query

**Data & Seed**
- ✅ Migraciones Prisma con versionado
- ✅ Datos demo: 1 finca con 8 potreros y 1 lote
- ✅ 5 pesajes históricos (ganancia de 80 kg)
- ✅ 5 movimientos de rotación
- ✅ Aforos con valores realistas

---

## 🚀 Inicio Rápido

### Opción 1: Con Docker Compose (Recomendado)

```bash
# 1. Clonar repositorio
git clone https://github.com/CSA-DanielVillamizar/ganaderia-regenerativa.git
cd ganaderia-regenerativa

# 2. Levantar servicios
docker-compose up -d

# 3. Crear base de datos y cargar seed
docker-compose exec api npm run db:push
docker-compose exec api npm run db:seed

# 4. Acceder a la aplicación
# 🌐 Frontend: http://localhost:3001
# 📚 API Docs: http://localhost:3000/api/docs
# 🗄️ Database UI: http://localhost:3000/api/studio (Prisma Studio)
```

### Opción 2: Desarrollo Local (Sin Docker)

#### Requisitos Previos
- **Node.js** 18.0 o superior
- **npm** o **yarn**
- **PostgreSQL** 16+ (o usar SQLite para desarrollo)

#### Backend - API NestJS

```bash
cd apps/api

# 1. Copiar configuración (si no existe)
cp .env.example .env

# 2. Editar .env con tu configuración
# DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/ganaderia
# O para SQLite:
# DATABASE_URL="file:./prisma/dev.db"

# 3. Instalar dependencias
npm install

# 4. Crear base de datos
npx prisma db push

# 5. Cargar datos de ejemplo
npx prisma db seed

# 6. Iniciar servidor de desarrollo
npm run dev
# API escuchando en http://localhost:3000
```

#### Frontend - Next.js

```bash
cd apps/web

# 1. Copiar configuración (si no existe)
cp .env.local.example .env.local

# 2. Editar si es necesario (usualmente no requiere cambios)
# NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1

# 3. Instalar dependencias
npm install

# 4. Iniciar servidor de desarrollo
npm run dev
# Frontend escuchando en http://localhost:3001
```

### Credenciales Demo

| Email | Contraseña | Rol | Permisos |
|-------|-----------|-----|----------|
| `admin@magrotec.com` | `Admin123!` | ADMIN | Acceso total |
| `tecnico@magrotec.com` | `Tecnico123!` | TECHNICIAN | Gestión técnica |

---

## 📖 Guía de Usuario Final - Operación de la Aplicación

### 1️⃣ Autenticación

**Paso 1: Acceder al Login**
- Abrir navegador: `http://localhost:3001`
- Se redirige automáticamente a `/auth/login` si no estás autenticado

**Paso 2: Ingresar Credenciales**
```
Email: admin@magrotec.com
Contraseña: Admin123!
```

**Paso 3: Navegar al Dashboard**
- Después de login exitoso, accedes a la página de fincas
- Selecciona tu finca para ver el Dashboard

### 2️⃣ Dashboard - Decisión del Día

**Ubicación:** `/farms/[id]/decision-today`

Este es el **corazón de la aplicación**. Aquí obtienes la recomendación diaria para tu ganadería:

#### 🎯 Componentes Principales

**A. Tarjeta de Recomendación (Verde)**
```
📌 Siguiente Potrero Recomendado
   Potrero 6 - 7.54 ha
   ✓ 30 días de descanso (cumple mínimo)
   ✓ 2,800 kg/ha de forraje
   
   → Botón "Ir" para registrar movimiento
```

**B. Badge de Confianza**
```
🎯 Confianza: ALTA (HIGH)
   ✓ Indicador verde = decisión científica, basada en datos
   ✓ Amarillo (MEDIUM) = menos datos, usar con cautela
   ✓ Rojo (LOW) = pocos datos, validar manualmente
```

**C. Panel de Explainabilidad (2 razones)**
```
💡 ¿Por qué esta recomendación?

1. Descanso de 30 días ≥ mínimo de 30 días
   📊 Fuente: Histórico de movimientos
   🔢 Peso: 5/10 (muy importante)

2. Carga animal óptima (2.0 UA/ha)
   📊 Fuente: Datos de pesaje
   🔢 Peso: 3/10 (importante)
```

**D. Checklist de Acciones**
```
✅ Acciones URGENTES para hoy (14 tareas)

AFOROS (8 tareas):
  □ Aforo Potrero 6
  □ Aforo Potrero 7
  ... más

PESAJES (1 tarea):
  □ Pesar lote "Lote A - Novillas"

CIERRES (5 tareas):
  □ Cerrar movimiento Potrero 1
  □ Cerrar movimiento Potrero 2
  ... más
```

**E. Panel de Alertas (Rojo)**
```
⚠️ ALERTAS CRÍTICAS - Rotaciones Vencidas

Potrero 1: 374 días ocupado (mín: 30)
Potrero 2: 364 días ocupado (mín: 30)
... más potreros con problemas
```

#### 📱 Cómo Actuar sobre la Recomendación

1. **Leer la decisión completa**
   - Confianza: ¿Es ALTA, MEDIA o BAJA?
   - Explainability: ¿Entiendes las razones?

2. **Revisar acciones urgentes**
   - ¿Hay aforos, pesajes o cierres para hoy?
   - Hacer clic en cada acción para registrar

3. **Hacer clic en "Ir"**
   - Abre formulario de movimiento
   - Llena datos: fecha, herd, paddock
   - Guarda movimiento
   - Automáticamente retorna a Decision Today
   - Decisión se recalcula con nuevos datos

4. **Revisar alertas**
   - ¿Hay potreros ocupados demasiado tiempo?
   - Ejecutar movimientos para liberar potreros

### 3️⃣ Operaciones - Registrar Movimientos

**Ubicación:** `/farms/[id]/movements/new` (desde Decision Today)

**Formulario de Movimiento:**
```
┌─────────────────────────────────────┐
│ Registrar Movimiento                │
├─────────────────────────────────────┤
│ Lote:           [Lote A - Novillas] │
│ Potrero:        [Potrero 6]         │
│ Fecha Entrada:  [10-01-2026]        │
│ Descanso Mín:   [30] días           │
│ Salida Estimada: [09-02-2026]       │
│                                      │
│ [ Guardar ]  [ Cancelar ]           │
└─────────────────────────────────────┘
```

**Flujo:**
1. Decision Today muestra recomendación → clic en "Ir"
2. Abre formulario pre-llenado con lote y potrero
3. Completa fechas (entrada es automática = hoy)
4. Guarda
5. Retorna a Decision Today (se recalcula)

### 4️⃣ Operaciones - Registrar Pesajes

**Ubicación:** `/farms/[id]/weighings/new`

**Formulario de Pesaje:**
```
┌──────────────────────────────────────┐
│ Registrar Pesaje                     │
├──────────────────────────────────────┤
│ Lote:              [Lote A - Novillas]│
│ Fecha Pesaje:      [10-01-2026]      │
│ Número de Animales: [15]             │
│ Peso Total (kg):   [4950]            │
│ Peso Promedio:     [330 kg] (auto)   │
│                                       │
│ [ Guardar ]  [ Cancelar ]            │
└──────────────────────────────────────┘
```

**Automatismos:**
- Peso promedio = Peso total / Número animales
- Ganancia diaria = (Peso actual - Peso anterior) / Días
- Actualiza UA automáticamente
- Recalcula Decision Today

### 5️⃣ Operaciones - Registrar Aforos

**Ubicación:** `/farms/[id]/forage/new`

**Formulario de Aforo (Marco Cuadrado):**
```
┌──────────────────────────────────────┐
│ Registrar Aforo - Marco Cuadrado     │
├──────────────────────────────────────┤
│ Potrero:           [Potrero 6]       │
│ Fecha:             [10-01-2026]      │
│ Altura (cm):       [45]              │
│ Peso Muestra (kg): [1.25]            │
│ MS% (materia seca):[65%]             │
│                                       │
│ CÁLCULOS:                            │
│ kg/ha estimado:    [2,800] (auto)    │
│ Estado del potrero: BUENO            │
│                                       │
│ [ Guardar ]  [ Cancelar ]            │
└──────────────────────────────────────┘
```

**Fórmula:**
```
kg/ha = (Peso muestra en g / MS%) × factor de marco
```

### 6️⃣ Operaciones - Cerrar Movimientos

**Ubicación:** `/farms/[id]/movements/[id]/close`

**Formulario de Cierre:**
```
┌──────────────────────────────────────┐
│ Cerrar Movimiento                    │
├──────────────────────────────────────┤
│ Lote:              [Lote A - Novillas]│
│ Potrero:           [Potrero 6]       │
│ Entrada:           [10-01-2026]      │
│ Salida Estimada:   [09-02-2026]      │
│ Salida Real:       [08-02-2026] ✏️   │
│ Observaciones:     [Forraje bajó]    │
│                                       │
│ [ Cerrar ]  [ Cancelar ]             │
└──────────────────────────────────────┘
```

**Impacto al Cerrar:**
- Movimiento marca como CLOSED
- Potrero queda disponible para próxima entrada
- Autoriza reutilización del potrero
- Recalcula ciclos de rotación

### 7️⃣ Configuración - Parámetros de Finca

**Ubicación:** `/farms/[id]/parameters`

**Parámetros Ajustables:**
```
┌────────────────────────────────┐
│ Parámetros de La Praderas      │
├────────────────────────────────┤
│ Descanso Mínimo (días)    [30] │
│ Descanso Máximo (días)   [120] │
│ Demanda Diaria %         [2.5] │
│ Aprovechamiento Forraje  [80%] │
│ Peso Referencia (kg)    [450]  │
│ MS% Referencia          [65%]  │
│                                 │
│ [ Guardar ]  [ Cancelar ]       │
└────────────────────────────────┘
```

**Impacto:**
- Se usa para calcular días recomendados
- Se usa para determinar mínimo descanso
- Afecta la recomendación de Decision Today

---

## 🛠️ Ejemplos de Uso Completos

### Escenario 1: Día Típico de Operación

**9:00 AM - Revisar Decision Today**
```
1. Login: admin@magrotec.com / Admin123!
2. Ir a: http://localhost:3001/farms/[ID]/decision-today
3. Leer recomendación: "Potrero 6 listo"
4. Revisar checklist: 14 acciones hoy
```

**10:00 AM - Registrar Aforo**
```
1. Hacer clic en acción "Aforo Potrero 6"
2. Llenar forma:
   - Altura: 45 cm
   - Peso muestra: 1.25 kg
   - MS%: 65%
3. Guardar
4. Retorna a Decision Today (se recalcula)
```

**2:00 PM - Registrar Pesaje**
```
1. Hacer clic en "Pesar lote Novillas"
2. Llenar forma:
   - Peso total: 4,950 kg (ganancia de 50 kg)
3. Guardar
4. Sistema calcula:
   - Ganancia: 50 kg (3.33 kg por animal)
   - Ganancia diaria: 0.33 kg/día
   - UA actualizado
```

**4:00 PM - Registrar Movimiento**
```
1. Decision Today recomienda: "Ir a Potrero 6"
2. Clic en "Ir"
3. Formulario pre-lleno:
   - Lote: Lote A - Novillas
   - Potrero: Potrero 6
4. Completa:
   - Fecha: 10-01-2026
5. Guardar
6. Sistema calcula:
   - Ocupación anterior: 40 días
   - Descanso anterior: 80 días
   - Nuevo ciclo inicia
```

**6:00 PM - Cerrar Movimiento Anterior**
```
1. En Decision Today, revisar acciones pendientes
2. Hacer clic en "Cerrar movimiento Potrero X"
3. Confirmar fecha de salida
4. Guardar
5. Potrero X queda disponible para próximo lote
```

### Escenario 2: Ajuste de Parámetros

**Situación:** El técnico nota que los potreros se recuperan más lento

**Acción:**
```
1. Ir a: /farms/[ID]/parameters
2. Cambiar:
   - Descanso Mínimo: 30 → 40 días
   - Aprovechamiento: 80% → 75%
3. Guardar
4. Decision Today usa nuevos parámetros
5. Recomendaciones se recalculan automáticamente
```

---

## 📊 Diccionario de Términos

| Término | Definición | Ejemplo |
|---------|-----------|---------|
| **UA (Unidad Animal)** | Equivalente a 450 kg de peso vivo | 4,500 kg = 10 UA |
| **Potrero** | Subdivisión del pastizal separada por cerca | Potrero 6 = 7.54 ha |
| **Ocupación** | Días que un lote permanece en un potrero | 40 días |
| **Descanso** | Días que un potrero recupera forraje | 80 días |
| **Aforo** | Muestreo de biomasa mediante marco cuadrado | 2,800 kg/ha |
| **MS%** | Porcentaje de materia seca en la muestra | 65% = forraje seco |
| **kg/ha** | Cantidad de forraje disponible por hectárea | 2,800 kg/ha |
| **Ganancia** | Incremento de peso del lote en período | +80 kg en 30 días |
| **Demanda Diaria** | Consumo de forraje necesario por UA | UA × 2.5% del peso |
| **Confianza** | Nivel de certeza de la recomendación | HIGH / MEDIUM / LOW |

---

## 🏗️ Arquitectura Técnica

### Stack Tecnológico

| Capa | Tecnología | Uso |
|------|-----------|-----|
| **Frontend** | Next.js 14, React 18, TailwindCSS | UI responsiva |
| **Backend** | NestJS, TypeScript | API REST |
| **Base de Datos** | PostgreSQL / SQLite | Persistencia |
| **ORM** | Prisma | Mapeo objeto-relacional |
| **Auth** | JWT + bcrypt | Autenticación segura |
| **Validación** | Zod | Tipado en tiempo de compilación |
| **Testing** | Jest, Vitest | Cobertura 100% |
| **DevOps** | Docker, Docker Compose, GitHub Actions | Containerización y CI |

### Estructura del Proyecto

```
ganaderia-regenerativa/
├── apps/
│   ├── api/                      # Backend NestJS
│   │   ├── src/
│   │   │   ├── auth/            # Autenticación
│   │   │   ├── farms/           # Fincas
│   │   │   ├── paddocks/        # Potreros
│   │   │   ├── herds/           # Lotes
│   │   │   ├── weighings/       # Pesajes
│   │   │   ├── forage/          # Aforos
│   │   │   ├── movements/       # Movimientos
│   │   │   ├── parameter/       # Configuración
│   │   │   ├── dashboard/       # Decision Today
│   │   │   └── common/          # Utilitarios
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Modelo de datos
│   │   │   ├── migrations/     # Versionado BD
│   │   │   └── seed.ts         # Datos iniciales
│   │   └── test/               # Tests
│   │
│   └── web/                      # Frontend Next.js
│       ├── src/
│       │   ├── app/            # Pages (App Router)
│       │   ├── components/     # React components
│       │   ├── services/       # API clients
│       │   ├── lib/           # Utilidades
│       │   └── styles/        # CSS global
│       └── test/              # Tests
│
├── packages/
│   └── shared/                  # DTOs y tipos compartidos
│       └── src/index.ts        # Exporta todas las interfaces
│
├── docs/                        # Documentación
│   ├── arquitectura.md
│   ├── modelo_datos.md
│   ├── calculos.md
│   └── decisiones.md
│
└── docker-compose.yml          # Definición de servicios
```

### Flujo de Datos

```
Usuario (Frontend)
    ↓
  [Componente React]
    ↓
  [Fetch Wrapper] (manejo de errores, token JWT)
    ↓
  [API REST - Backend NestJS]
    ↓
  [Guards - Validación de rol] (JWT, RBAC)
    ↓
  [Controllers - Ruteo]
    ↓
  [Services - Lógica de negocio]
    ↓
  [Prisma ORM]
    ↓
  [PostgreSQL / SQLite]
    ↓
  [Respuesta JSON]
    ↓
  [Cliente retorna datos]
    ↓
  [React Query - Estado y caché]
    ↓
  [Render UI actualizada]
```

---

## 🧪 Testing

### Ejecutar Tests

```bash
# Backend - Todos los tests
cd apps/api
npm run test

# Backend - Con coverage
npm run test:cov

# Backend - Watch mode
npm run test:watch

# Frontend - Todos los tests
cd apps/web
npm run test

# Monorepo - Todos los tests
npm run test
```

### Cobertura Actual

```
✅ Backend: 103 tests pasando
   - Auth: 12 tests
   - Farms: 8 tests
   - Paddocks: 15 tests
   - Herds: 10 tests
   - Weighings: 12 tests
   - Forage: 8 tests
   - Movements: 18 tests
   - Parameters: 12 tests
   - Dashboard: 8 tests

✅ Frontend: Tests en Next.js con Vitest
```

---

## 📚 Documentación Completa

Para más detalles técnicos, consulta:

- **[Arquitectura Detallada](./docs/arquitectura.md)** - Decisiones de diseño y patrones
- **[Modelo de Datos](./docs/modelo_datos.md)** - Estructura de tablas y relaciones
- **[Fórmulas y Cálculos](./docs/calculos.md)** - Matemática de rotación
- **[Decisiones de Diseño](./docs/decisiones.md)** - Why y How de cada componente
- **[Definition of Done](./docs/definition_of_done.md)** - Criterios de aceptación
- **[QA Gaps](./docs/qa_gaps.md)** - Brechas identificadas (histórico)

---

## 🔒 Seguridad

### Medidas Implementadas

- ✅ **JWT**: Token con expiración de 24h
- ✅ **RBAC**: 4 roles con permisos granulares
- ✅ **CORS**: Configurado según dominio
- ✅ **Validación Server-Side**: Zod + decoradores NestJS
- ✅ **Auditoría**: Cada cambio registra user + timestamp
- ✅ **Bcrypt**: Contraseñas hasheadas
- ✅ **HTTPS**: Recomendado en producción

### Roles y Permisos

| Rol | Lectura | Crear | Editar | Eliminar |
|-----|---------|-------|--------|----------|
| **ADMIN** | ✅ Todo | ✅ Todo | ✅ Todo | ✅ Todo |
| **TECHNICIAN** | ✅ Finca | ✅ Datos | ✅ Datos | ⚠️ Propio |
| **MANAGER** | ✅ Finca | ✅ Reports | ✅ Reports | ❌ |
| **VIEWER** | ✅ Finca | ❌ | ❌ | ❌ |

---

## 🐛 Troubleshooting

### Error: Base de datos no se conecta

```bash
# Verificar que PostgreSQL está corriendo
docker-compose ps

# Ver logs
docker-compose logs db

# Recrear BD
docker-compose down -v
docker-compose up -d db
```

### Error: Puerto 3000 o 3001 en uso

```powershell
# Windows - Matar proceso en puerto
Get-NetTCPConnection -LocalPort 3000 | Stop-Process -Force

# Linux/Mac
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Error: Prisma - Cliente no generado

```bash
cd apps/api
npx prisma generate
```

### Error: Token JWT expirado

- Token tiene duración de 24h
- Hacer login nuevamente
- O usar refresh tokens (futuro)

### Error: Forbidden - Sin permisos

```
Error: User does not have permission for this farm
```
- Usuario no está asignado a esa finca
- Contactar admin para agregar acceso
- Ver UserFarm en base de datos

---

## 🚀 Próximos Pasos (Roadmap)

### Fase 2.1 - Operation Wizards (En Progreso 🔨)
- [ ] Formulario de Forage (aforos)
- [ ] Formulario de Weighing (pesajes)
- [ ] Formulario de Movement (movimientos)
- [ ] Formulario de Closure (cerrar movimientos)

### Fase 2.2 - Farm Parameters UI
- [ ] Tabla editable de parámetros
- [ ] Validaciones por finca
- [ ] Histórico de cambios

### Fase 3 - Hardening
- [ ] Tests E2E con Playwright/Cypress
- [ ] Validación exhaustiva de tipos
- [ ] Performance optimization
- [ ] Sentry para error tracking

### Fase 4 - Production Ready
- [ ] Deploy a Azure
- [ ] CI/CD con GitHub Actions
- [ ] Monitoring y alertas
- [ ] Backup automático de BD

---

## 📞 Contacto y Soporte

- **Documentación**: Ver carpeta `docs/`
- **Issues**: GitHub Issues
- **Email**: admin@magrotec.com

---

## 📄 Licencia

MIT © 2026 Magrotec

---

**Happy Regenerative Farming! 🌾🐄**

*Construido con ❤️ para ganadería sostenible*
