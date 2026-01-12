# Auditoría Completa del Repositorio - GanaderiaRegenerativa
**Fecha:** 11 de enero de 2026  
**Objetivo:** Auditoría completa del repositorio y plan para alcanzar producto usable en campo

---

## 1. RESUMEN EJECUTIVO

### Estado General del Proyecto
- **Tipo:** Monorepo con Turborepo
- **Aplicaciones:** API (NestJS) + Web (Next.js 14.2)
- **Base de Datos:** Prisma con SQLite (desarrollo)
- **Estado de Build:** ✅ EXITOSO (con warnings)
- **Estado de Tests:** ✅ EXITOSO (56/56 tests API passing)
- **Vulnerabilidades:** ⚠️ 32 vulnerabilidades detectadas (3 críticas, 15 high)

### Hallazgos Críticos
1. **DecisionTodayResponseSchema no exportado** - Bloquea funcionalidad de decisión diaria
2. **32 vulnerabilidades de seguridad** - Incluye 3 críticas
3. **Next.js 14.2 con advisory de seguridad** - Requiere actualización
4. **Múltiples deprecations** - Paquetes obsoletos en uso

---

## 2. INVENTARIO TÉCNICO COMPLETO

### 2.1 Estructura del Monorepo
```
GanaderiaRegenerativa/
├── apps/
│   ├── api/          # Backend NestJS + Prisma
│   └── web/          # Frontend Next.js 14.2
├── packages/
│   └── shared/       # Schemas y tipos compartidos
├── docs/             # Documentación del proyecto
├── scripts/          # Scripts de utilidad
└── [configs]         # Configuraciones raíz
```

### 2.2 Stack Tecnológico

#### Backend (apps/api)
- **Framework:** NestJS (última versión estable)
- **ORM:** Prisma 5.x
- **Base de Datos:** SQLite (dev), PostgreSQL (producción)
- **Testing:** Jest (56 tests, 2 suites)
- **Validación:** class-validator, class-transformer
- **Autenticación:** JWT (implementado)

#### Frontend (apps/web)
- **Framework:** Next.js 14.2.22 (App Router)
- **UI:** React 18.3.1
- **Estilos:** Tailwind CSS
- **Testing:** Vitest 1.1.3
- **Validación:** Zod (schemas desde @shared)
- **State:** React Context API

#### Paquete Compartido (packages/shared)
- **Contenido:** Schemas de validación, tipos TypeScript
- **Build:** TypeScript compiler
- **Problema identificado:** Falta exportar `DecisionTodayResponseSchema`

### 2.3 Modelo de Datos (Prisma)

#### Entidades Principales
```prisma
User            # Usuarios del sistema
Farm            # Fincas/predios
Paddock         # Potreros/parcelas
Herd            # Rebaños/hatos
Movement        # Movimientos de ganado
ForageSample    # Muestras de forraje
Weighing        # Pesajes de animales
Parameter       # Parámetros del sistema
TapeCalibrationHistory  # Histórico de calibración
```

#### Relaciones Clave
- Farm 1:N Paddock
- Farm 1:N Herd
- Farm 1:N ForageSample
- Herd N:N Paddock (through Movement)
- Movement 1:N Weighing

---

## 3. RESULTADOS DE COMANDOS EJECUTADOS

### 3.1 npm ci (Instalación de Dependencias)

**Comando:** `npm ci`  
**Exit Code:** 0 ✅  
**Duración:** ~45 segundos

#### Deprecation Warnings
```
- inflight@1.0.6
- rimraf@3.0.2
- glob@7.2.3
- are-we-there-yet@2.0.0
- gauge@3.0.2
- @humanwhocodes/config-array@0.13.0
- @humanwhocodes/object-schema@2.0.3
- eslint@8.x
```

#### Vulnerabilidades Detectadas
```
Total: 32 vulnerabilities
├── Low:       7
├── Moderate:  7
├── High:     15
└── Critical:  3
```

**Paquetes afectados:**
- next@14.2.22 (security advisory)
- postcss (múltiples versiones vulnerables)
- micromatch (Regex DoS)
- path-to-regexp (Regex DoS)
- send / serve-static (path traversal)

### 3.2 npm run build

**Comando:** `npm run build`  
**Exit Code:** 0 ✅  
**Duración:** ~2 minutos

#### Output del Build

**apps/api:**
```
✓ Successfully built apps/api
  Output: dist/
  Modules: CommonJS
```

**apps/web:**
```
✓ Next.js build completed
  Pages: 15+ rutas
  Size: Optimizado
  
⚠️ WARNING:
./src/app/farms/[id]/decision-today/page.tsx
Module not found: Can't resolve 'DecisionTodayResponseSchema'
Attempted import error: 'DecisionTodayResponseSchema' 
is not exported from '@ganaderia-regenerativa/shared/index'
```

**packages/shared:**
```
✓ TypeScript compilation successful
  Output: dist/
  Types: index.d.ts
```

### 3.3 npm run test

**Comando:** `npm run test`  
**Exit Code:** 0 ✅  
**Duración:** ~15 segundos

#### Resultados de Tests API
```
Test Suites: 2 passed, 2 total
Tests:       56 passed, 56 total
Snapshots:   0 total
Time:        12.5s

Integration Tests:
├── AppController (e2e) - 9 tests ✅
│   ├── GET / - Returns Hello World
│   ├── Auth endpoints - Token generation
│   └── Protected routes - Access control
│
└── Feature Tests - 47 tests ✅
    ├── Parameters CRUD
    ├── Farms CRUD
    ├── Paddocks CRUD
    ├── Herds CRUD
    ├── Movements CRUD
    └── ForageSamples CRUD
```

**Nota:** Logs de Prisma muy verbosos durante tests (opportunity para mejora)

### 3.4 npx turbo build

**Comando:** `npx turbo build`  
**Exit Code:** 0 ✅  
**Duración:** ~90 segundos

#### Cache Status
```
Tasks:    3 successful, 3 total
Cached:   0 cached, 3 total
Time:     89.7s

Build Order:
1. @ganaderia-regenerativa/shared (16s)
2. @ganaderia-regenerativa/api (45s)
3. @ganaderia-regenerativa/web (28s)
```

**Mismo warning:** DecisionTodayResponseSchema no exportado

### 3.5 npx turbo test

**Comando:** `npx turbo test`  
**Exit Code:** 0 ✅  
**Duración:** ~20 segundos

```
Tasks:    1 successful, 1 total
(solo apps/api tiene tests configurados)
```

---

## 4. AUDITORÍA TÉCNICA DETALLADA

### 4.1 Problemas Identificados

#### 🔴 CRÍTICO - Exportación Faltante
**Ubicación:** `packages/shared/src/index.ts`  
**Problema:** `DecisionTodayResponseSchema` no está exportado  
**Impacto:** Página de decisión diaria no puede compilar correctamente  
**Evidencia:**
```
./src/app/farms/[id]/decision-today/page.tsx
Attempted import error: 'DecisionTodayResponseSchema' 
is not exported from '@ganaderia-regenerativa/shared/index'
```
**Archivos afectados:**
- `apps/web/src/app/farms/[id]/decision-today/page.tsx` (línea de import)
- `packages/shared/src/index.ts` (falta export)

#### 🔴 CRÍTICO - Vulnerabilidades de Seguridad
**Total:** 32 vulnerabilidades  
**Distribución:**
- **Critical (3):**
  - path-to-regexp < 0.1.10 (Regex DoS)
  - micromatch < 4.0.8 (Regex DoS)
  - send/serve-static (Path Traversal)

- **High (15):**
  - next@14.2.x (tiene advisory conocido)
  - postcss (múltiples versiones)
  - Various transitive dependencies

- **Moderate (7) + Low (7):**
  - Deprecation-related issues
  - Minor security advisories

**Recomendación:** Ejecutar `npm audit fix` y actualizar manualmente paquetes críticos

#### 🟡 MEDIO - Configuraciones Duplicadas
**Ubicación:** `apps/web/`  
**Problema:** Dos archivos de configuración idénticos para Vitest  
**Evidencia:**
- `vitest.config.ts` (212 bytes)
- `vitest.config.mts` (212 bytes)

**Contenido idéntico:**
```typescript
import { defineConfig } from 'vitest/config'
// ... configuración idéntica
```
**Recomendación:** Eliminar uno de los dos archivos (preferir .ts)

#### 🟡 MEDIO - Paquetes Deprecados
**Lista completa:**
1. `inflight@1.0.6` → Usar `fs.promises` nativo
2. `rimraf@3.0.2` → Actualizar a v5.x
3. `glob@7.2.3` → Actualizar a v10.x
4. `eslint@8.x` → Migrar a v9.x
5. `are-we-there-yet@2.0.0` → Dependency de npm
6. `@humanwhocodes/config-array` → Actualizar ESLint

#### 🟢 BAJO - Logs Verbosos en Tests
**Ubicación:** Tests de integración API  
**Problema:** Prisma imprime queries SQL completos durante tests  
**Impacto:** Output de tests difícil de leer  
**Solución:** Configurar `prisma.log = []` en entorno de test

#### 🟢 BAJO - Scripts de Inicio Múltiples
**Ubicación:** Raíz del proyecto  
**Problema:** 10+ scripts .bat/.ps1 para iniciar aplicación  
**Archivos:**
- START_API.bat
- START_WEB_DEV.ps1
- START_DEVELOPMENT.bat
- START_PRODUCTION.bat
- LAUNCH_APP.ps1
- start-app.ps1
- start-servers.sh
- etc.

**Recomendación:** Consolidar en 2-3 scripts principales y documentar en README

### 4.2 Análisis de Código

#### Backend (apps/api)

**Estructura de Módulos:**
```
src/
├── app.module.ts          # Módulo raíz (wiring correcto)
├── auth/                  # Autenticación JWT
├── farms/                 # CRUD Fincas
├── paddocks/              # CRUD Potreros
├── herds/                 # CRUD Rebaños
├── movements/             # CRUD Movimientos
├── forage-samples/        # CRUD Muestras forraje
├── weighings/             # CRUD Pesajes
├── parameters/            # Parámetros sistema
└── prisma/                # Servicio Prisma
```

**Calidad del Código:**
- ✅ Clean Architecture aplicada
- ✅ Separación en capas (controllers, services, repositories)
- ✅ DTOs para validación
- ✅ Guards para autenticación
- ✅ Tests de integración completos
- ⚠️ Falta documentación Swagger/OpenAPI

**Controller Example (parameter.controller.ts):**
```typescript
@Controller('parameters')
export class ParameterController {
  @Get()
  async getParameters() {
    return {
      min_rest_days: 21,
      // ... otros parámetros
    };
  }
}
```
**Análisis:** Código limpio, bien estructurado, sigue convenciones NestJS

#### Frontend (apps/web)

**Estructura de Rutas (App Router):**
```
app/
├── auth/login/                    # Login
├── dashboard/                     # Dashboard principal
│   └── movements/                 # Historial movimientos
├── farms/                         # Gestión fincas
│   ├── new/                       # Nueva finca
│   └── [id]/                      # Detalle finca
│       ├── decision-today/        # ⚠️ PROBLEMA AQUÍ
│       ├── forage/new/            # Nueva muestra forraje
│       ├── herds/                 # Rebaños
│       ├── movements/             # Movimientos
│       ├── paddocks/              # Potreros
│       └── weighings/             # Pesajes
├── herds/                         # Lista rebaños
└── paddocks/                      # Lista potreros
```

**Calidad del Código:**
- ✅ Next.js App Router usado correctamente
- ✅ Componentes organizados por dominio
- ✅ Hooks custom para lógica reutilizable
- ✅ Services para API calls
- ✅ Context API para estado global
- ⚠️ Falta cobertura de tests (0 tests en web)
- ⚠️ Import problem en decision-today

**Página Problemática (decision-today/page.tsx):**
```typescript
import { DecisionTodayResponseSchema } from '@ganaderia-regenerativa/shared';
// ❌ Este import falla porque el schema no está exportado
```

#### Paquete Compartido (packages/shared)

**Contenido Actual:**
```typescript
// src/index.ts
export * from './schemas';
export * from './types';
// ⚠️ Falta exportar DecisionTodayResponseSchema
```

**Schemas Esperados:**
- ForageSchema ✅
- MovementSchema ✅
- WeighingSchema ✅
- DecisionTodayResponseSchema ❌ (NO EXPORTADO)

---

## 5. AUDITORÍA FUNCIONAL

### 5.1 Funcionalidades Implementadas

#### ✅ Autenticación y Autorización
- Login con email/password
- Generación de JWT tokens
- Guards en rutas protegidas
- Credenciales demo: admin@example.com / admin123

#### ✅ Gestión de Fincas
- Listar fincas del usuario
- Crear nueva finca
- Ver detalle de finca
- Editar/eliminar finca

#### ✅ Gestión de Potreros
- Listar potreros por finca
- Crear nuevo potrero
- Configurar: nombre, área, estado
- Ver estado actual (ocupado/disponible)

#### ✅ Gestión de Rebaños
- Listar rebaños por finca
- Crear nuevo rebaño
- Configurar: nombre, cantidad animales, peso promedio
- Ver estado actual del rebaño

#### ✅ Movimientos de Ganado
- Crear movimiento (rebaño → potrero)
- Validación de disponibilidad
- Cálculo de días de permanencia
- Cerrar movimiento
- Historial completo de movimientos

#### ✅ Muestras de Forraje
- Registrar muestra de forraje
- Campos: altura, densidad, fecha
- Asociar a potrero específico
- Historial de muestras

#### ✅ Pesajes de Animales
- Registrar pesaje individual
- Registrar pesaje grupal
- Calibración de cinta (peso vs perímetro torácico)
- Historial de pesajes

#### ✅ Dashboard
- KPIs principales de la finca
- Estado actual de potreros
- Movimientos activos
- Filtros por fecha y estado

#### ⚠️ Decisión Diaria (PARCIAL)
- **Backend:** Endpoint `/farms/:id/decision-today` implementado
- **Frontend:** Página creada PERO no compila por import faltante
- **Funcionalidad:** Recomendación de rotación de potreros

### 5.2 Funcionalidades Pendientes (Para Producto en Campo)

#### 🔴 Alta Prioridad

1. **Modo Offline**
   - Estado: No implementado
   - Necesidad: CRÍTICA para uso en campo (sin conectividad)
   - Componentes requeridos:
     - Service Worker para PWA
     - IndexedDB para almacenamiento local
     - Sincronización diferida
   - Archivo base existe: `src/lib/offline-sync.ts` (⚠️ sin implementar)

2. **Exportación de Reportes**
   - Estado: Parcialmente implementado
   - Archivo: `src/services/export.service.ts`
   - Pendiente:
     - Implementar exportación PDF
     - Implementar exportación Excel
     - Templates de reportes oficiales

3. **Notificaciones Push**
   - Estado: Estructura base creada
   - Archivo: `src/services/notification.service.ts`
   - Pendiente:
     - Integrar con navegador (Notification API)
     - Sistema de alertas por reglas
     - Archivo base: `src/lib/alert-rules.ts`

4. **Guías de Campo Digitales**
   - Estado: Estructura base
   - Archivo: `src/lib/field-guides.ts`
   - Pendiente:
     - Contenido completo de guías
     - Imágenes/diagramas
     - Acceso offline

#### 🟡 Media Prioridad

5. **Validaciones de Negocio Avanzadas**
   - Validación de capacidad de carga del potrero
   - Alertas de sobrepastoreo
   - Recomendaciones automáticas de rotación
   - Archivo base: `src/hooks/useMovementValidation.ts`

6. **Multi-idioma (i18n)**
   - Actualmente: Solo español
   - Necesario para: Expansión a otros países

7. **Gráficos y Visualizaciones**
   - Evolución de peso del ganado
   - Historial de ocupación de potreros
   - Tendencias de producción de forraje

8. **Backup y Recuperación**
   - Backup automático de base de datos
   - Exportación completa de datos
   - Importación de datos históricos

#### 🟢 Baja Prioridad

9. **Integración con Hardware**
   - Báscula Bluetooth
   - GPS para geo-referenciación
   - Sensores de humedad/forraje

10. **Módulo Financiero**
    - Costos por potrero
    - Costos por rebaño
    - ROI de rotaciones

---

## 6. ANÁLISIS DE CALIDAD DE CÓDIGO

### 6.1 Métricas de Código

#### Cobertura de Tests
```
apps/api:   ~75% (estimado, 56 tests)
apps/web:   0% (sin tests implementados)
shared:     0% (sin tests)
```

#### Complejidad Ciclomática
- **Backend:** Baja-Media (funciones cortas, bien estructuradas)
- **Frontend:** Media (algunos componentes grandes)

#### Deuda Técnica Estimada
- **Alta:** 2 días (vulnerabilidades + export faltante)
- **Media:** 5 días (deprecations + duplicaciones)
- **Baja:** 3 días (mejoras de logging + scripts)

### 6.2 Cumplimiento de Clean Architecture

#### ✅ Aspectos Positivos
1. **Separación de capas clara:**
   - Controllers (API layer)
   - Services (Business logic)
   - Repositories (Data access via Prisma)
   
2. **DTOs para validación:**
   ```typescript
   export class CreateFarmDto {
     @IsString()
     @IsNotEmpty()
     name: string;
     
     @IsNumber()
     area: number;
   }
   ```

3. **Inversión de dependencias:**
   - Services no dependen de controllers
   - Uso de interfaces cuando necesario

4. **Paquete compartido:**
   - Schemas reutilizables entre API y Web
   - Tipos compartidos evitan duplicación

#### ⚠️ Áreas de Mejora

1. **Falta capa de Domain:**
   - No hay entidades de dominio puras
   - Lógica de negocio mezclada con DTOs

2. **Tests unitarios limitados:**
   - Mayoría son tests de integración
   - Falta test de lógica de negocio aislada

3. **Documentación:**
   - Falta JSDoc en funciones clave
   - No hay documentación de arquitectura formal

---

## 7. BACKLOG PRIORIZADO

### FASE 1: Estabilización (1-2 días)
**Objetivo:** Resolver problemas críticos que bloquean funcionalidad

#### Tarea 1.1: Arreglar Export de DecisionTodayResponseSchema
**Prioridad:** 🔴 CRÍTICA  
**Estimación:** 30 minutos  
**Archivos:**
- `packages/shared/src/index.ts`
- Verificar `packages/shared/src/schemas/` para el schema

**Pasos:**
1. Localizar definición de `DecisionTodayResponseSchema`
2. Exportar desde `index.ts`
3. Verificar build: `npm run build`
4. Verificar uso en `apps/web/src/app/farms/[id]/decision-today/page.tsx`

#### Tarea 1.2: Resolver Vulnerabilidades Críticas
**Prioridad:** 🔴 CRÍTICA  
**Estimación:** 2-4 horas  
**Comando:** `npm audit fix --force`

**Actualizaciones manuales requeridas:**
```bash
npm update next@latest           # 14.2.22 → 15.x
npm update postcss@latest        # Resolver vulnerabilidades
npm audit fix --force            # Resto de dependencias
```

**Validación post-actualización:**
- ✅ `npm run build` exitoso
- ✅ `npm run test` todos passing
- ✅ Verificar compatibilidad Next.js 15 con código actual

#### Tarea 1.3: Limpiar Configuraciones Duplicadas
**Prioridad:** 🟡 MEDIA  
**Estimación:** 15 minutos  
**Acción:** Eliminar `apps/web/vitest.config.mts`, mantener solo `.ts`

---

### FASE 2: Producto Mínimo en Campo (1-2 semanas)

#### Tarea 2.1: Implementar Modo Offline
**Prioridad:** 🔴 ALTA  
**Estimación:** 3-5 días  
**User Story:** *"Como ganadero en campo sin conectividad, necesito registrar movimientos y datos que se sincronicen cuando tenga internet"*

**Subtareas:**
1. **Service Worker + PWA** (1 día)
   - Configurar Next.js como PWA
   - Definir estrategias de cache (Network First, Cache First)
   - Archivo: `next.config.js` + `public/manifest.json`

2. **Almacenamiento Local con IndexedDB** (1 día)
   - Implementar capa de persistencia local
   - Schema local para: movements, weighings, forages
   - Biblioteca sugerida: Dexie.js

3. **Cola de Sincronización** (1 día)
   - Detectar reconexión a internet
   - Procesar cola de cambios pendientes
   - Resolver conflictos (last-write-wins o manual)
   - Completar: `src/lib/offline-sync.ts`

4. **UI de Estado de Sync** (0.5 días)
   - Indicador "Offline mode"
   - Badge de "X cambios pendientes"
   - Botón manual "Sincronizar ahora"

5. **Testing** (0.5 días)
   - Test sin conectividad (DevTools Offline)
   - Test de reconexión
   - Test de sincronización de conflictos

#### Tarea 2.2: Sistema de Notificaciones
**Prioridad:** 🔴 ALTA  
**Estimación:** 2-3 días  
**User Story:** *"Como ganadero necesito alertas cuando un potrero necesita rotación o un animal necesita atención"*

**Subtareas:**
1. **Motor de Reglas de Negocio** (1 día)
   - Completar `src/lib/alert-rules.ts`
   - Reglas implementadas:
     - Días de ocupación > días de descanso recomendados
     - Peso animal bajo umbral
     - Altura forraje < mínimo recomendado
     - Sobrecarga de potrero

2. **Sistema de Notificaciones Browser** (0.5 días)
   - Solicitar permisos de notificación
   - Push notifications con Notification API
   - Completar `src/services/notification.service.ts`

3. **Backend de Alertas** (0.5 días)
   - Endpoint: `GET /api/alerts`
   - Cron job para evaluar reglas cada hora
   - Persistir alertas en DB (nueva tabla)

4. **UI de Alertas** (0.5 días)
   - Bell icon con badge de contador
   - Lista de alertas en dropdown
   - Marcar como leído/descartado

#### Tarea 2.3: Exportación de Reportes
**Prioridad:** 🟡 MEDIA  
**Estimación:** 2-3 días  

**Subtareas:**
1. **Reporte PDF de Movimientos** (1 día)
   - Biblioteca: jsPDF o react-pdf
   - Template: Historial de movimientos del mes
   - Completar `src/services/export.service.ts`

2. **Exportación Excel** (1 día)
   - Biblioteca: exceljs o xlsx
   - Exportar: Inventario actual, Movimientos, Pesajes

3. **Templates Personalizables** (0.5 días)
   - Logo de finca
   - Encabezado personalizado
   - Campos opcionales

#### Tarea 2.4: Guías de Campo Digitales
**Prioridad:** 🟡 MEDIA  
**Estimación:** 3-5 días  

**Contenido a crear:**
1. **Guía de Evaluación de Forraje**
   - Cómo medir altura
   - Cómo evaluar densidad
   - Indicadores de calidad

2. **Guía de Manejo de Rotaciones**
   - Cálculo de días de descanso
   - Signos de sobre-pastoreo
   - Momento óptimo de rotación

3. **Guía de Pesaje**
   - Técnicas de pesaje con cinta
   - Calibración de báscula
   - Interpretación de resultados

**Implementación:**
- Formato: Markdown + imágenes
- Viewer: Completar `src/components/common/FieldGuideViewer.tsx`
- Acceso offline: Bundled con app

#### Tarea 2.5: Tests Frontend
**Prioridad:** 🟡 MEDIA  
**Estimación:** 3-5 días  

**Cobertura objetivo: >60%**
- Tests de componentes con Vitest + Testing Library
- Tests de servicios (API calls mockeados)
- Tests de hooks custom
- Tests E2E con Playwright (los más críticos)

---

### FASE 3: Mejoras de Producción (1-2 semanas)

#### Tarea 3.1: Migrar a Next.js 15
**Prioridad:** 🟡 MEDIA  
**Estimación:** 2-3 días  
**Breaking changes esperados:**
- Turbopack por defecto
- Cambios en App Router
- Cambios en imagen optimization

#### Tarea 3.2: Actualizar Dependencias Deprecadas
**Prioridad:** 🟡 MEDIA  
**Estimación:** 1-2 días  
**Paquetes:**
- ESLint 8 → 9 (flat config)
- rimraf → v5
- glob → v10

#### Tarea 3.3: Documentación API (Swagger)
**Prioridad:** 🟢 BAJA  
**Estimación:** 1 día  
**Librería:** @nestjs/swagger

#### Tarea 3.4: Optimización de Build
**Prioridad:** 🟢 BAJA  
**Estimación:** 1 día  
**Acciones:**
- Tree-shaking optimization
- Code splitting strategy
- Lazy loading de rutas

#### Tarea 3.5: Monitoreo y Logging
**Prioridad:** 🟢 BAJA  
**Estimación:** 2 días  
**Herramientas:**
- Winston para logging estructurado
- Sentry para error tracking
- Analytics básico (Plausible/Umami)

---

### FASE 4: Funcionalidades Avanzadas (2-4 semanas)

#### Tarea 4.1: Gráficos y Visualizaciones
**Prioridad:** 🟢 MEDIA  
**Estimación:** 3-5 días  
**Librería:** Recharts o Chart.js

**Gráficos a implementar:**
- Evolución de peso por rebaño
- Ocupación de potreros (Gantt-like)
- Producción de forraje (líneas)
- Comparativa de períodos

#### Tarea 4.2: Mapa Interactivo de Finca
**Prioridad:** 🟢 MEDIA  
**Estimación:** 5-7 días  

**Funcionalidades:**
- Dibujar potreros en mapa
- Ver estado en tiempo real (colores)
- Click en potrero → detalle
- Librería: Leaflet o Mapbox

**Base existente:**
- `src/components/common/PaddockMap.tsx` (⚠️ implementar)

#### Tarea 4.3: Multi-idioma (i18n)
**Prioridad:** 🟢 BAJA  
**Estimación:** 3-5 días  
**Librería:** next-i18next

**Idiomas objetivo:**
- Español (actual)
- Inglés
- Portugués (opcional)

#### Tarea 4.4: Módulo Financiero Básico
**Prioridad:** 🟢 BAJA  
**Estimación:** 5-7 días  

**Funcionalidades:**
- Costos por movimiento
- Costos fijos por potrero
- Ingresos por venta
- Reporte de rentabilidad

#### Tarea 4.5: Integración con Hardware
**Prioridad:** 🟢 BAJA (depende de hardware disponible)  
**Estimación:** 7-10 días  

**Dispositivos:**
- Báscula Bluetooth (Web Bluetooth API)
- GPS tracker (Geolocation API)
- Sensores IoT (via API REST)

---

## 8. ESTIMACIONES Y ROADMAP

### Tiempo Total Estimado por Fase

| Fase | Duración | Dependencias | Resultado |
|------|----------|--------------|-----------|
| **Fase 1: Estabilización** | 1-2 días | Ninguna | Build limpio, sin vulnerabilidades críticas |
| **Fase 2: MVP Campo** | 1-2 semanas | Fase 1 completa | Producto usable sin conectividad |
| **Fase 3: Producción** | 1-2 semanas | Fase 2 completa | Producto optimizado y monitoreado |
| **Fase 4: Avanzadas** | 2-4 semanas | Fase 3 completa | Producto completo con funcionalidades premium |

### Timeline Agresivo (Producto en Campo)
```
Semana 1:
├── Día 1-2: Fase 1 completa
├── Día 3-4: Modo Offline (Task 2.1)
└── Día 5: Notificaciones (Task 2.2)

Semana 2:
├── Día 1-2: Reportes (Task 2.3)
├── Día 3-4: Guías de Campo (Task 2.4)
└── Día 5: Tests Frontend críticos (Task 2.5)

→ LISTO PARA CAMPO (MVP)
```

### Timeline Recomendado (Producto Robusto)
```
Mes 1:
├── Semana 1: Fase 1
├── Semana 2-3: Fase 2
└── Semana 4: Fase 3 (parcial)

Mes 2:
├── Semana 1-2: Fase 3 completa
└── Semana 3-4: Fase 4 (según prioridades)

→ PRODUCTO MADURO
```

---

## 9. RECOMENDACIONES FINALES

### 9.1 Acciones Inmediatas (Hoy)
1. ✅ **Arreglar export de DecisionTodayResponseSchema** (30 min)
2. ✅ **Ejecutar `npm audit fix --force`** (15 min)
3. ✅ **Validar builds después de fixes** (15 min)

### 9.2 Esta Semana
1. **Implementar modo offline básico** (crítico para campo)
2. **Crear 2-3 guías de campo** (contenido prioritario)
3. **Implementar sistema de alertas** (valor inmediato)

### 9.3 Este Mes
1. **Completar MVP de campo** (Fase 2)
2. **Migrar a Next.js 15** (estabilidad)
3. **Agregar tests frontend** (calidad)

### 9.4 Próximo Trimestre
1. **Implementar funcionalidades avanzadas** (Fase 4)
2. **Preparar para escalabilidad** (PostgreSQL production)
3. **Marketing y onboarding** (primeros usuarios reales)

---

## 10. MÉTRICAS DE ÉXITO

### Criterios de "Producto Usable en Campo"

#### ✅ Funcionales
- [ ] Usuario puede trabajar 100% offline
- [ ] Datos se sincronizan automáticamente al reconectar
- [ ] Notificaciones funcionan en dispositivo móvil
- [ ] Reportes se exportan en PDF/Excel
- [ ] Guías de campo accesibles offline
- [ ] Todas las funcionalidades core funcionan sin errores

#### ✅ Técnicos
- [ ] 0 vulnerabilidades críticas o high
- [ ] Build time < 2 minutos
- [ ] Test coverage API > 75%
- [ ] Test coverage Web > 60%
- [ ] Lighthouse score > 80 (Performance, Accessibility)
- [ ] PWA installable en móvil

#### ✅ UX/Usabilidad
- [ ] Tiempo de primera carga < 3 segundos
- [ ] Formularios validados con feedback claro
- [ ] Navegación intuitiva (< 3 clicks a cualquier acción)
- [ ] Responsive en móviles (< 600px)
- [ ] Modo offline claramente indicado
- [ ] Estado de sincronización visible

---

## 11. ANEXOS

### A. Comandos Útiles

```bash
# Desarrollo
npm run dev              # Inicia ambos apps en dev mode
npm run dev:api          # Solo API
npm run dev:web          # Solo Web

# Build
npm run build            # Build de todo
npx turbo build          # Build con Turbo (paralelo)

# Tests
npm run test             # Tests de API
npm run test:watch       # Tests en watch mode
npm run test:e2e         # Tests E2E (cuando se implementen)

# Base de Datos
cd apps/api
npx prisma generate      # Genera Prisma Client
npx prisma db push       # Sincroniza schema con DB
npx prisma studio        # Abre UI de DB
npx prisma db seed       # Seed de datos iniciales

# Limpieza
npm run clean            # Limpia node_modules y builds
npm ci                   # Instalación limpia

# Linting
npm run lint             # ESLint en todo el monorepo
npm run format           # Prettier en todo el código
```

### B. Variables de Entorno Requeridas

**apps/api/.env:**
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-here"
NODE_ENV="development"
PORT=3001
```

**apps/web/.env.local:**
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_APP_NAME="Ganadería Regenerativa"
```

### C. Credenciales Demo
```
Email:    admin@example.com
Password: admin123
```

### D. Enlaces Importantes

- **Documentación Prisma:** https://www.prisma.io/docs
- **Next.js App Router:** https://nextjs.org/docs/app
- **NestJS Docs:** https://docs.nestjs.com
- **Turborepo Guide:** https://turbo.build/repo/docs

---

## 12. CONCLUSIONES

### Estado Actual
El proyecto **GanaderiaRegenerativa** está en un estado **sólido y funcional** con:
- ✅ Arquitectura bien definida (monorepo + Clean Architecture)
- ✅ Stack moderno y escalable
- ✅ Funcionalidades core implementadas
- ✅ Tests de backend completos
- ⚠️ 2 problemas críticos pero fáciles de resolver

### Distancia a "Producto Usable en Campo"
**Estimación:** **2-3 semanas de desarrollo full-time**

**Bloqueos principales:**
1. Falta modo offline (sin esto, NO es usable en campo)
2. Falta sistema de notificaciones (valor crítico)
3. Vulnerabilidades de seguridad (riesgo en producción)

### Viabilidad
**ALTA.** El proyecto tiene:
- Bases técnicas sólidas
- Código de calidad
- Arquitectura escalable
- Documentación existente

Con el backlog priorizado propuesto, el producto puede estar **listo para pilotos en campo en 3 semanas**.

### Próximos Pasos Recomendados
1. **HOY:** Resolver problemas críticos (export + vulnerabilidades)
2. **Esta semana:** Implementar modo offline (Task 2.1)
3. **Próxima semana:** Completar MVP de campo (Tasks 2.2-2.5)
4. **Semana 3:** Testing exhaustivo y ajustes
5. **Semana 4:** Deploy y primer piloto con usuarios reales

---

**Fin del Reporte de Auditoría**  
*Generado automáticamente el 11 de enero de 2026*
