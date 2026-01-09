# 📚 DOCUMENTACIÓN TÉCNICA – Magrotec Ganadería Regenerativa

> **Sistema de gestión regenerativa para ganadería**: Rotación inteligente, pesaje con cinta métrica, aforos guiados y decisiones basadas en datos biológicos.

---

## 📋 ÍNDICE GENERAL

### 1. 📖 [Backlog Completo](./backlog.md)
- **Propósito:** Análisis exhaustivo de implementación actual vs épicas planificadas
- **Contenido:**
  - 17 épicas divididas en MVP (P0), PRO (P1) y PREMIUM (P2-P3)
  - Estado detallado: ✅ Completo | ⚠️ Parcial | ❌ No implementado
  - Criterios de aceptación por épica
  - Tareas pendientes específicas
  - Estimaciones de esfuerzo (puntos historia)
  - 7 gaps críticos (P0) bloqueadores MVP
- **Audiencia:** Product Owners, arquitectos, equipo desarrollo
- **Última actualización:** 2025-01-08

### 2. 🗺️ [Matriz de Trazabilidad](./traceability_matrix.md)
- **Propósito:** Mapeo completo Requerimiento → Implementación → Pruebas
- **Contenido:**
  - 52 requerimientos mapeados con ID único
  - Columnas: Requerimiento | Historia | UI/Pantalla | API/Endpoint | Modelo de Datos | Test Unit | Test Integración | Test E2E | Estado
  - Resumen estadístico: 35% completo, 27% parcial, 38% no implementado
  - Gaps críticos (P0) identificados
- **Audiencia:** QA, arquitectos, PM, equipo técnico
- **Última actualización:** 2025-01-08

### 3. 📅 [Roadmap Técnico 2025](./roadmap.md)
- **Propósito:** Plan de ejecución 6-12 meses para MVP → PRO → PREMIUM
- **Contenido:**
  - **FASE 1 (Q1 2025 - 12 semanas):** MVP PRODUCTION-READY
    - 6 sprints detallados (2 semanas c/u)
    - Entregables: Validación descanso, Wizard aforo, Pesaje cinta UI, Alertas, AuditLog, Tests
  - **FASE 2 (Q2 2025 - 12 semanas):** PRO FEATURES + ESCALA
    - Ciclos, Calibración automática, Guías campo, Observabilidad
  - **FASE 3 (Q3 2025 - 12 semanas):** PREMIUM BETA
    - Mapa 2.5D, Offline-first, Indicadores regenerativos, Exportaciones
  - **FASE 4 (Q4 2025 - 12 semanas):** PREMIUM LAUNCH + EXPANSIÓN
    - Infraestructura enterprise, Multi-país, Integraciones
  - Presupuesto estimado: $152K-$188K (12 meses)
  - Equipo sugerido: 2-3 dev + 1 QA + 1 DevOps + 1 PM
  - Riesgos y mitigaciones
- **Audiencia:** Stakeholders, PM, CTO, inversores
- **Última actualización:** 2025-01-08

### 4. 📝 [Templates de Issues GitHub](./issue_templates.md)
- **Propósito:** Estandarizar creación de issues para épicas, historias, tareas, bugs y seguridad
- **Contenido:**
  - 5 templates completos:
    1. 📦 **Épica** (funcionalidad grande)
    2. 👤 **Historia de Usuario** (feature con valor usuario)
    3. 🔧 **Tarea Técnica** (refactor, deuda técnica)
    4. 🐛 **Bug** (errores y comportamientos inesperados)
    5. 🔒 **Vulnerabilidad de Seguridad** (reporte privado)
  - Sistema de etiquetas (labels) completo
  - Definition of Done (DoD) por nivel
  - Flujo de trabajo issues (Creación → Triage → Estimación → Sprint → Desarrollo → Review → QA → Cierre)
  - Convenciones commits
- **Audiencia:** Todo el equipo técnico, PM, QA
- **Última actualización:** 2025-01-08

### 5. 🏗️ [Arquitectura del Sistema](./arquitectura.md)
- **Propósito:** Clean Architecture, patrones de diseño, decisiones técnicas
- **Contenido:**
  - Diagramas capas (Dominio, Aplicación, Infraestructura, Presentación)
  - Stack tecnológico completo
  - Decisiones arquitectónicas (ADRs)
- **Audiencia:** Arquitectos, desarrolladores senior
- **Última actualización:** 2024-12-26

### 6. 📊 [Modelo de Datos](./modelo_datos.md)
- **Propósito:** Esquema completo base de datos con relaciones
- **Contenido:**
  - 15 modelos Prisma: User, Farm, UserFarm, Paddock, Herd, Animal, Weighing, Movement, Cycle, ForageSample, Parameter, TapeCalibration, TapeCalibrationHistory
  - Diagrama ER
  - Índices y optimizaciones
- **Audiencia:** Backend developers, DBAs
- **Última actualización:** 2024-12-26

### 7. 🧮 [Cálculos Regenerativos](./calculos.md)
- **Propósito:** Fórmulas biológicas y agronómicas del sistema
- **Contenido:**
  - Unidades Animal (UA)
  - Días recomendados (oferta/demanda forraje)
  - Carga instantánea (UA/ha)
  - Pesaje con cinta métrica bovina (perímetro torácico × largo corporal / divisor)
  - Calibración adaptativa
  - Aforo forraje (kg MS/ha)
- **Audiencia:** Agrónomos, desarrolladores backend, QA
- **Última actualización:** 2024-12-26

### 8. 🚀 [Guía Rápida de Inicio](./guia_rapida.md)
- **Propósito:** Onboarding para nuevos desarrolladores
- **Contenido:**
  - Setup local completo (prerrequisitos, instalación, database)
  - Scripts útiles
  - Primeros pasos desarrollo
  - Testing
- **Audiencia:** Nuevos desarrolladores
- **Última actualización:** 2024-12-26

### 9. ✅ [Definition of Done Detallado](./definition_of_done.md)
- **Propósito:** Checklist exhaustivo para considerar trabajo completo
- **Contenido:**
  - DoD por nivel (Épica, Historia, Tarea, Bug, Security)
  - Criterios código, tests, documentación, deployment
- **Audiencia:** Todo el equipo técnico
- **Última actualización:** 2024-12-26

### 10. 🤝 [Guía de Contribución](./CONTRIBUTING.md)
- **Propósito:** Normas para contribuir al proyecto
- **Contenido:**
  - Convenciones código
  - Branching strategy (Git Flow)
  - Pull Requests
  - Code reviews
- **Audiencia:** Todos los contribuidores
- **Última actualización:** 2024-12-26

### 11. 🔍 [QA Gaps Identificados](./qa_gaps.md)
- **Propósito:** Lista de mejoras QA y testing pendientes
- **Contenido:**
  - Tests unit faltantes
  - Tests integración críticos
  - Tests E2E por implementar
  - Cobertura objetivo
- **Audiencia:** QA Engineers, Tech Leads
- **Última actualización:** 2024-12-26

---

## 📂 ESTRUCTURA DEL PROYECTO

```
GanaderiaRegenerativa/
├── apps/
│   ├── api/               # Backend NestJS
│   │   ├── src/
│   │   │   ├── auth/      # Autenticación JWT
│   │   │   ├── farm/      # CRUD fincas
│   │   │   ├── paddock/   # CRUD potreros
│   │   │   ├── herd/      # CRUD lotes
│   │   │   ├── weighing/  # Pesajes (báscula + cinta)
│   │   │   ├── movement/  # Rotación y movimientos
│   │   │   ├── forage/    # Aforos forraje
│   │   │   ├── dashboard/ # KPIs y alertas
│   │   │   ├── cycle/     # Ciclos rotación
│   │   │   ├── calibration/ # Calibración cinta
│   │   │   ├── indicators/  # Indicadores regenerativos
│   │   │   ├── export/      # Exportaciones PDF/CSV
│   │   │   └── health/      # Health checks
│   │   └── prisma/
│   │       └── schema.prisma  # 15 modelos
│   │
│   └── web/               # Frontend Next.js
│       ├── src/
│       │   ├── app/       # Pages (App Router)
│       │   │   ├── auth/login/
│       │   │   ├── dashboard/
│       │   │   ├── farms/
│       │   │   └── ...
│       │   ├── components/
│       │   │   ├── layout/  # Sidebar, Navigation, FarmSwitcher
│       │   │   └── ui/      # Button, Alert, LoadingSpinner
│       │   ├── services/    # API clients (React Query)
│       │   ├── context/     # FarmContext
│       │   └── hooks/       # Custom hooks
│       └── vitest.config.ts
│
├── packages/
│   └── shared/            # DTOs compartidos
│       └── src/
│
├── docs/                  # 📚 ESTA CARPETA
│   ├── README.md          # Este archivo (índice)
│   ├── backlog.md         # Backlog completo MVP/PRO/PREMIUM
│   ├── traceability_matrix.md  # Matriz trazabilidad
│   ├── roadmap.md         # Roadmap 2025 (12 meses)
│   ├── issue_templates.md # Templates GitHub
│   ├── arquitectura.md    # Clean Architecture
│   ├── modelo_datos.md    # Esquema BD
│   ├── calculos.md        # Fórmulas regenerativas
│   ├── guia_rapida.md     # Setup local
│   ├── definition_of_done.md
│   ├── CONTRIBUTING.md
│   └── qa_gaps.md
│
├── docker-compose.yml     # Servicios locales
├── turbo.json             # Monorepo Turborepo
└── package.json           # Scripts raíz
```

---

## 🎯 ESTADO ACTUAL DEL PROYECTO (Snapshot 2025-01-08)

### ✅ Implementación Completada (~70% MVP)

#### Backend (13 controladores)
- ✅ Autenticación JWT + RBAC por finca
- ✅ CRUD completo: Fincas, Potreros, Lotes, Animales, Pesajes, Movimientos, Aforos
- ✅ Dashboard con 6 KPIs operativos
- ✅ Modelo datos robusto: 15 entidades con regenerative features
- ✅ Health checks (liveness/readiness)

#### Frontend (Next.js 14 App Router)
- ✅ Login funcional con persistencia token
- ✅ Dashboard operativo (KPIs + gráficas)
- ✅ Gestión fincas completa
- ✅ Detalle lotes con pesajes, movimientos, forraje
- ✅ FarmContext global con validación acceso
- ✅ Responsive (sidebar desktop + bottom nav mobile)

#### Base de Datos
- ✅ Prisma con 15 modelos
- ✅ Soft delete en entidades críticas
- ✅ Campos regenerativos:
  - `Weighing.method` (SCALE | TAPE) con perímetro/largo
  - `TapeCalibration` con divisor y history
  - `ForageSample` con campos extendidos (frameAreaM2, kgMSPerHa, etc.)
  - `Parameter` para configuración por finca
  - `Cycle` para rotaciones completas

### ⚠️ Implementación Parcial (~20% PRO)

- ⚠️ **Pesaje cinta:** Backend completo, UI formulario básico (falta especializado)
- ⚠️ **Aforo:** Campos extendidos existen, wizard guiado falta
- ⚠️ **Calibración:** Backend completo, UI básica (falta recalibración automática)
- ⚠️ **Alertas:** Lógica parcial existe, panel visual destacado falta
- ⚠️ **Ciclos:** Backend completo, CRUD frontend falta
- ⚠️ **Auditoría:** `createdBy/updatedBy` existe, modelo `AuditLog` falta

### ❌ No Implementado (~5% PREMIUM + gaps MVP)

#### Gaps Críticos MVP (P0):
1. ❌ Validación descanso mínimo antes de movimiento
2. ❌ UI pesaje cinta métrica especializada
3. ❌ Comparativa real vs estimado (precisión cinta)
4. ❌ Wizard aforo guiado 4 pasos
5. ❌ Cálculo días recomendados (oferta/demanda)
6. ❌ Panel alertas visuales destacado
7. ❌ AuditLog completo

#### Funcionalidades PRO pendientes:
- ❌ Comparativo ciclos históricos
- ❌ Recalibración automática cinta
- ❌ Guías de campo (aforo, pesaje, rotación)
- ❌ Alerta carga alta
- ❌ Logs estructurados (Winston)
- ❌ Métricas OpenTelemetry

#### Funcionalidades PREMIUM:
- ❌ Mapa 2.5D con simulación
- ❌ Offline-first (Service Worker + sync)
- ❌ Indicadores regenerativos avanzados
- ❌ Exportaciones PDF/CSV

---

## 🚀 PRÓXIMOS PASOS (según roadmap)

### Sprint 1-2 (Semanas 1-4 de 2025):
1. **MVP-3.4:** Validación descanso mínimo (3 pts)
2. **MVP-5.3:** Cálculo días recomendados (5 pts)
3. **MVP-4.2:** UI pesaje cinta métrica (5 pts)
4. **MVP-4.3:** Comparativa real vs estimado (3 pts)

**Objetivo:** Cerrar gaps críticos cálculos y pesaje

### Sprint 3-4 (Semanas 5-8):
1. **MVP-5.1:** Wizard aforo guiado (8 pts)
2. **MVP-6.2:** Panel alertas visuales (5 pts)

**Objetivo:** Aforo accesible + alertas proactivas

### Sprint 5-6 (Semanas 9-12):
1. **MVP-7.3:** AuditLog completo (8 pts)
2. **Testing MVP:** Unit + Integration + E2E (13 pts)
3. **Pulido UI/UX** (5 pts)

**Objetivo:** MVP production-ready para clientes reales

---

## 📊 MÉTRICAS DE ÉXITO

### MVP (Fin Q1 2025):
- ✅ 5 clientes beta en campo
- ✅ <3s tiempo respuesta P95 endpoints
- ✅ <1% tasa error producción
- ✅ >70% cobertura tests

### PRO (Fin Q2 2025):
- ✅ 50 clientes activos
- ✅ NPS >40
- ✅ Uptime >99.5%

### PREMIUM (Fin Q3 2025):
- ✅ 20 clientes PREMIUM beta
- ✅ Uso offline >30% sesiones campo
- ✅ NPS >50

### EXPANSIÓN (Fin Q4 2025):
- ✅ 200 clientes totales (100 PREMIUM)
- ✅ ARR $500K+
- ✅ 2+ países adicionales activos

---

## 🤝 CONTRIBUIR

¿Quieres contribuir? Lee [CONTRIBUTING.md](./CONTRIBUTING.md) para conocer:
- Convenciones código (Clean Architecture)
- Branching strategy (Git Flow)
- Pull Requests y Code Reviews
- Definition of Done

---

## 📞 CONTACTO

**Equipo Magrotec**  
- Email: dev@magrotec.com  
- GitHub: [github.com/magrotec/ganaderia-regenerativa](https://github.com/magrotec/ganaderia-regenerativa)  
- Documentación: Esta carpeta `/docs`

---

## 📄 LICENCIA

Este proyecto es propiedad de Magrotec. Todos los derechos reservados.

---

**Última actualización:** 2025-01-08  
**Próxima revisión:** Fin Sprint 1 (validar progreso real vs plan)