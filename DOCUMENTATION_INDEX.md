# 📚 Índice Completo de Documentación del Proyecto

**Proyecto:** Ganadería Regenerativa - Magrotec  
**Versión:** v1.0 (Field-Ready Beta)  
**Última actualización:** 12 de enero de 2026  
**Mantenedor:** Build Engineering & Tech Lead

---

## 🎯 START HERE (Comienza Aquí)

| Documento | Propósito | Duración Lectura | Audiencia |
|-----------|-----------|------------------|-----------|
| [COMIENZA_AQUI.md](COMIENZA_AQUI.md) | 📍 Punto de entrada para nuevos devs | 5 min | Developers |
| [README.md](README.md) | 📖 Overview general del proyecto | 10 min | Everyone |
| [QUICK_START.bat](QUICK_START.bat) | ⚡ Setup rápido en Windows | 2 min | Developers |

---

## 🏗️ ARQUITECTURA & DISEÑO

### Visión General
| Documento | Descripción |
|-----------|-------------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Arquitectura de capas, patrones, decisiones técnicas |
| [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) | Estructura de directorios y módulos |
| [SOLUCION_API.md](SOLUCION_API.md) | Especificación API REST completa |

### Offline-First (Épica 1 ✅)
| Documento | Contenido | Links Código |
|-----------|----------|-------------|
| [OFFLINE_FIRST_GUIDE.md](OFFLINE_FIRST_GUIDE.md) | 📖 Guía técnica completa offline-first | [Código Offline](/apps/web/src/lib/offline/) |
| [IMPLEMENTATION_SUMMARY_OFFLINE_FIRST.md](IMPLEMENTATION_SUMMARY_OFFLINE_FIRST.md) | 📋 Resumen ejecutivo implementación | Commits: [c3af5c5](https://github.com/CSA-DanielVillamizar/ganaderia-regenerativa/commit/c3af5c5) |
| [ARCHITECTURE_DIAGRAM_OFFLINE_FIRST.md](ARCHITECTURE_DIAGRAM_OFFLINE_FIRST.md) | 📊 Diagramas ASCII detallados | Data flow, sync motor, state management |

**Código Implementado:**
- `apps/web/src/lib/offline/schemas.ts` — RxDB schemas (4 colecciones)
- `apps/web/src/lib/offline/db.ts` — Database singleton
- `apps/web/src/lib/offline/sync-replicator.ts` — Motor de sincronización
- `apps/web/src/hooks/useOfflineSync.ts` — React hook state management
- `apps/web/src/components/layout/OfflineIndicator.tsx` — UI indicator
- `apps/web/src/services/forage.service.ts` — Refactored to offline-first

---

## 📅 ROADMAP & ÉPICAS

| Épica | Estado | Documento Roadmap |
|-------|--------|------------------|
| **Épica 1:** Offline-First (RxDB + Sync) | ✅ COMPLETADA | [ROADMAP_EPICS_12_PLUS.md](ROADMAP_EPICS_12_PLUS.md#épica-12-refactorizar-otros-servicios-offline-first) |
| **Épica 12:** Refactor movement + weighing | 🔲 Siguientes 2-3 horas | [ROADMAP_EPICS_12_PLUS.md](ROADMAP_EPICS_12_PLUS.md#épica-12-refactorizar-otros-servicios-offline-first) |
| **Épica 2:** Lógica Agronómica Avanzada | 🔲 2-3 semanas | [ROADMAP_EPICS_12_PLUS.md](ROADMAP_EPICS_12_PLUS.md#-épica-2-lógica-agronómica-avanzada-cerebro-voisin) |
| **Épica 3:** Infraestructura Producción | 🔲 1-2 semanas | [ROADMAP_EPICS_12_PLUS.md](ROADMAP_EPICS_12_PLUS.md#-épica-3-infraestructura-de-producción) |
| **Épica 4:** PWA + Mobile UX | 🔲 2-3 semanas | [ROADMAP_EPICS_12_PLUS.md](ROADMAP_EPICS_12_PLUS.md#-épica-4-pwa--mobile-ux) |

**Acceder al Roadmap Completo:** [ROADMAP_EPICS_12_PLUS.md](ROADMAP_EPICS_12_PLUS.md)

---

## 🔧 SETUP & INSTALACIÓN

### Primeros Pasos
1. **Windows Setup:**
   - Ejecutar: `QUICK_START.bat` 
   - O manual: [GETTING_STARTED.md](GETTING_STARTED.md)

2. **Base de Datos:**
   - SQLite (dev): `INIT_DB.bat`
   - PostgreSQL (prod): Ver [ROADMAP_EPICS_12_PLUS.md #3.1](ROADMAP_EPICS_12_PLUS.md#31-migración-sqlite--postgresql)

3. **Variables de Entorno:**
   - Copiar `.env.example` → `.env.local`
   - Ver [MAINTENANCE.md](MAINTENANCE.md) para detalles

### Scripts Principales
| Script | Propósito | Modo |
|--------|-----------|------|
| `START.bat` o `start-app.ps1` | Inicia API + Web Dev | Local Development |
| `START_API.bat` | Solo API (NestJS) | API Development |
| `START_WEB_SIMPLE.bat` | Solo Web (Next.js) | Web Development |
| `npm run build` | Build producción | CI/CD |
| `npm run test` | Test suite | QA |

---

## 🎓 GUÍAS POR FUNCIONALIDAD

### User Features (Qué puede hacer el usuario)

#### 📊 Gestión de Aforos (Forage Sampling)
- **Tutorial:** [OFFLINE_FIRST_GUIDE.md #Aforos](OFFLINE_FIRST_GUIDE.md#4-ejemplo-flujo-offline-first-aforos)
- **API:** [SOLUCION_API.md #/forage-samples](SOLUCION_API.md)
- **Implementación:** `apps/web/src/services/forage.service.ts`
- **Formulario:** `apps/web/src/components/ForageForm.tsx`

#### 🐄 Movimientos de Lotes (Herd Movements)
- **Upcoming:** Refactor Épica 12
- **API:** [SOLUCION_API.md #/movements](SOLUCION_API.md)
- **Template de refactor:** [ROADMAP_EPICS_12_PLUS.md #12.1](ROADMAP_EPICS_12_PLUS.md#121-refactorizar-movementservicets)

#### ⚖️ Pesajes (Animal Weighings)
- **Upcoming:** Refactor Épica 12
- **API:** [SOLUCION_API.md #/weighings](SOLUCION_API.md)
- **Template de refactor:** [ROADMAP_EPICS_12_PLUS.md #12.2](ROADMAP_EPICS_12_PLUS.md#122-refactorizar-weighingservicets)

#### 🧠 Lógica Agronómica (Voisin Method)
- **Punto Óptimo de Reposo (POR):** [ROADMAP_EPICS_12_PLUS.md #2.1](ROADMAP_EPICS_12_PLUS.md#21-punto-óptimo-de-reposo-por)
- **Alerta Sobrepastoreo:** [ROADMAP_EPICS_12_PLUS.md #2.2](ROADMAP_EPICS_12_PLUS.md#22-alerta-de-sobrepastoreo)
- **Carga Animal/Aforo (UA/Ha):** [ROADMAP_EPICS_12_PLUS.md #2.3](ROADMAP_EPICS_12_PLUS.md#23-carga-animal-vs-aforo-uaha)

### Developer Features (Cómo extender el proyecto)

#### Agregar Nueva Entidad Offline-First
1. **Schema RxDB:** Agregar en [apps/web/src/lib/offline/schemas.ts](apps/web/src/lib/offline/schemas.ts)
2. **Service:** Crear service similar a [forage.service.ts](apps/web/src/services/forage.service.ts)
   - Usar patrón: `save() → local first → enqueue sync → return optimistic`
3. **Sync Motor:** Se integra automáticamente con [sync-replicator.ts](apps/web/src/lib/offline/sync-replicator.ts)
4. **UI:** Usar hook [useOfflineSync()](apps/web/src/hooks/useOfflineSync.ts) para indicador

#### Agregar Nueva Funcionalidad Offline
- **Lectura:** [OFFLINE_FIRST_GUIDE.md #Extensibilidad](OFFLINE_FIRST_GUIDE.md#extensibilidad-y-próximos-pasos)
- **Patrón Template:** [ROADMAP_EPICS_12_PLUS.md #Template](ROADMAP_EPICS_12_PLUS.md#código-template)

#### Agregar Nueva Lógica Agronómica
- **Lectura:** [ROADMAP_EPICS_12_PLUS.md #Épica 2](ROADMAP_EPICS_12_PLUS.md#-épica-2-lógica-agronómica-avanzada-cerebro-voisin)
- **Implementar en:** Backend (`apps/api/src/`) + Frontend (`apps/web/src/`)

---

## 🧪 TESTING & QA

| Tipo de Test | Documento | Ejecución |
|--------------|-----------|-----------|
| **Unit Tests** | Tests en `__tests__/` folders | `npm run test -- --runInBand` |
| **E2E Tests** | [test-e2e.mjs](test-e2e.mjs) | `npm run test:e2e` |
| **Integration** | Offline + Sync | [OFFLINE_FIRST_GUIDE.md #Testing](OFFLINE_FIRST_GUIDE.md#testing-y-debugging) |
| **Manual Testing** | Checklist de features | [OFFLINE_FIRST_GUIDE.md #Validación](OFFLINE_FIRST_GUIDE.md#validación-y-debugging) |

---

## 🚀 DEPLOYMENT & DEVOPS

| Ambiente | Instrucciones | Estado |
|----------|---------------|--------|
| **Local Dev** | `START.bat` | ✅ Ready |
| **Staging** | Docker Compose (coming) | 🔲 Épica 3 |
| **Production** | AWS RDS + ECS (coming) | 🔲 Épica 3 |

**Guías:**
- [MAINTENANCE.md](MAINTENANCE.md) — Troubleshooting & logs
- [ROADMAP_EPICS_12_PLUS.md #Épica 3](ROADMAP_EPICS_12_PLUS.md#-épica-3-infraestructura-de-producción) — Docker + PostgreSQL

---

## 📖 DOCUMENTACIÓN TÉCNICA DETALLADA

### Backend (NestJS API)
- **Controladores:** `apps/api/src/*/controller.ts`
- **Servicios:** `apps/api/src/*/service.ts`
- **Prisma Schema:** `apps/api/prisma/schema.prisma`
- **Testing:** `apps/api/src/**/__tests__/*.spec.ts`

### Frontend (Next.js Web)
- **Pages/Routes:** `apps/web/src/app/`
- **Componentes UI:** `apps/web/src/components/`
- **Servicios:** `apps/web/src/services/`
- **Hooks Custom:** `apps/web/src/hooks/`
- **Utilities:** `apps/web/src/lib/`

### Shared Package
- **Types:** `packages/types/src/`
- **Utils:** `packages/utils/src/`
- **Hardening:** Restricción @shared vía ESLint (ver [ARCHITECTURE.md](ARCHITECTURE.md))

---

## 📋 ESTADO DEL PROYECTO

### Checklist General
- ✅ Arquitectura limpia (3 capas: API, Web, Shared)
- ✅ Offline-first implementado (RxDB + Sync)
- ✅ Hardening imports (@shared restriction)
- ✅ TypeScript strict mode
- ✅ Linting & formatting (ESLint + Prettier)
- ✅ Tests básicos (unit + e2e)
- 🔲 Lógica agronómica (Épicas 2)
- 🔲 Producción-ready (Épica 3)
- 🔲 PWA (Épica 4)

### Últimos Commits
```
d45a6c3 — docs: agregar hoja de ruta épicas 12+
c3af5c5 — feat: implementar capa offline-first con RxDB...
1a25b11 — docs: agregar resumen ejecutivo
3260f69 — docs: agregar diagramas detallados
```

---

## 🤔 PREGUNTAS FRECUENTES (FAQ)

### ¿Cómo funciona el offline?
→ Ver [OFFLINE_FIRST_GUIDE.md #Cómo Funciona](OFFLINE_FIRST_GUIDE.md#2-cómo-funciona)

### ¿Dónde está guardado mi data si estoy offline?
→ IndexedDB en el navegador (RxDB + Dexie). Ver [OFFLINE_FIRST_GUIDE.md #Storage](OFFLINE_FIRST_GUIDE.md#1-qué-es-offline-first)

### ¿Qué pasa si pierdo conexión durante un sync?
→ Se reintentan automáticamente. Ver [OFFLINE_FIRST_GUIDE.md #Retry Logic](OFFLINE_FIRST_GUIDE.md#2-cómo-funciona) y [ARCHITECTURE_DIAGRAM_OFFLINE_FIRST.md](ARCHITECTURE_DIAGRAM_OFFLINE_FIRST.md)

### ¿Cómo agrego una nueva funcionalidad offline?
→ Ver [OFFLINE_FIRST_GUIDE.md #Extensibilidad](OFFLINE_FIRST_GUIDE.md#extensibilidad-y-próximos-pasos) y [ROADMAP_EPICS_12_PLUS.md #Template](ROADMAP_EPICS_12_PLUS.md#código-template)

### ¿Cuál es el siguiente paso?
→ Épica 12: Refactor movement + weighing. Ver [ROADMAP_EPICS_12_PLUS.md](ROADMAP_EPICS_12_PLUS.md)

### ¿Dónde obtengo ayuda?
→ Contacta a Build Engineering (este documento es tu resource)

---

## 🔗 MAPA DE REFERENCIAS RÁPIDAS

### Por Rol

**👨‍💻 Developer Frontend:**
1. [COMIENZA_AQUI.md](COMIENZA_AQUI.md)
2. [OFFLINE_FIRST_GUIDE.md](OFFLINE_FIRST_GUIDE.md)
3. [apps/web/src/lib/offline/](apps/web/src/lib/offline/)
4. [ROADMAP_EPICS_12_PLUS.md #Épica 12](ROADMAP_EPICS_12_PLUS.md#-épica-12-refactorizar-otros-servicios-offline-first)

**👨‍💻 Developer Backend:**
1. [README.md](README.md)
2. [SOLUCION_API.md](SOLUCION_API.md)
3. `apps/api/` (NestJS)
4. [ROADMAP_EPICS_12_PLUS.md #Épica 2](ROADMAP_EPICS_12_PLUS.md#-épica-2-lógica-agronómica-avanzada-cerebro-voisin)

**🏗️ Architect/Tech Lead:**
1. [ARCHITECTURE.md](ARCHITECTURE.md)
2. [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
3. [ROADMAP_EPICS_12_PLUS.md](ROADMAP_EPICS_12_PLUS.md)
4. [OFFLINE_FIRST_GUIDE.md](OFFLINE_FIRST_GUIDE.md)

**🐛 QA/Tester:**
1. [OFFLINE_FIRST_GUIDE.md #Testing](OFFLINE_FIRST_GUIDE.md#testing-y-debugging)
2. [test-e2e.mjs](test-e2e.mjs)
3. [MAINTENANCE.md](MAINTENANCE.md)

**📱 Product Manager:**
1. [EXECUTIVE_SUMMARY.md](EXECUTIVE_SUMMARY.md) (si existe)
2. [OFFLINE_FIRST_GUIDE.md #Features](OFFLINE_FIRST_GUIDE.md#1-qué-es-offline-first)
3. [ROADMAP_EPICS_12_PLUS.md](ROADMAP_EPICS_12_PLUS.md) (timeline + features)

### Por Problema

| Problema | Lectura | Acción |
|----------|---------|--------|
| Offline no funciona | [OFFLINE_FIRST_GUIDE.md #Debugging](OFFLINE_FIRST_GUIDE.md#testing-y-debugging) | Check DevTools IndexedDB |
| Sync está atrapado | [ARCHITECTURE_DIAGRAM_OFFLINE_FIRST.md](ARCHITECTURE_DIAGRAM_OFFLINE_FIRST.md) | Revisar cola en IndexedDB |
| Build falla | [MAINTENANCE.md](MAINTENANCE.md) | `npm install` + limpiar cache |
| ¿Cómo agregar feature? | [ROADMAP_EPICS_12_PLUS.md #Código Template](ROADMAP_EPICS_12_PLUS.md#código-template) | Seguir patrón forage.service.ts |

---

## 📚 ÍNDICE ALFABÉTICO DE DOCUMENTOS

```
A — ARCHITECTURE.md, API_ENDPOINTS.md, ARCHITECTURE_DIAGRAM_OFFLINE_FIRST.md
C — COMIENZA_AQUI.md, CHANGELOG.md
D — DOCUMENTACION_INDICE.md, DEPLOYMENT.md (coming)
E — ENTREGABLES.md, EXECUTIVE_SUMMARY.md
G — GETTING_STARTED.md
I — INDEX.md, INDICE_COMPLETO.md, IMPLEMENTATION_SUMMARY_OFFLINE_FIRST.md
M — MAINTENANCE.md, MANUAL_USUARIO.md
P — PROJECT_STRUCTURE.md, PROXIMOS_PASOS.md
Q — QUICK_REFERENCE.md, QUICK_START.md
R — README.md, ROADMAP_EPICS_12_PLUS.md
S — START.md, START_SCRIPTS.md, SOLUCION_API.md
```

---

## 🎯 NEXT STEPS

1. **Hoy:** Leer este documento (5 min)
2. **Esta semana:** 
   - Ejecutar `QUICK_START.bat`
   - Leer [OFFLINE_FIRST_GUIDE.md](OFFLINE_FIRST_GUIDE.md)
   - Explorar código en [apps/web/src/lib/offline/](apps/web/src/lib/offline/)
3. **Próxima semana:** 
   - Iniciar Épica 12 (refactor servicios)
   - Ver [ROADMAP_EPICS_12_PLUS.md](ROADMAP_EPICS_12_PLUS.md)

---

**Última revisión:** 12 de enero de 2026  
**Versión documentación:** 1.0  
**Status:** Production-Ready ✅

Para actualizaciones futuras, actualizar este documento con la estructura y agregar links a nuevas épicas conforme se completen.
