# 📝 PLANTILLAS DE ISSUES – GitHub Magrotec Ganadería Regenerativa

> **Objetivo:** Estandarizar creación de issues para épicas, historias, tareas, bugs y seguridad

---

## 1. TEMPLATE: ÉPICA

```markdown
---
name: "📦 Épica"
about: "Funcionalidad grande que agrupa múltiples historias de usuario"
labels: epic, needs-breakdown
assignees: ''
---

## 📦 ÉPICA: [Nombre descriptivo de la épica]

### 🎯 Objetivo de negocio
<!-- Describir el valor que aporta esta épica al producto y usuarios -->

### 📋 Criterios de aceptación de la épica
<!-- Condiciones que deben cumplirse para considerar la épica completa -->
- [ ] ...
- [ ] ...

### 🔗 Historias de usuario relacionadas
<!-- Lista de issues hijas (se creará tras desglose) -->
- #xxx Historia 1
- #xxx Historia 2
- #xxx Historia N

### 📐 Contexto técnico
<!-- Modelos de datos, APIs, componentes UI involucrados -->
**Modelos:** `Farm`, `Paddock`, ...  
**Endpoints:** `GET /api/v1/farms`, ...  
**Pantallas:** `/farms`, `/farms/new`, ...

### 🚧 Dependencias
<!-- Issues o épicas que deben completarse antes -->
- Depende de: #xxx

### 📊 Métricas de éxito
<!-- KPIs para medir impacto tras lanzamiento -->
- Métrica 1: ...
- Métrica 2: ...

### 🗓️ Timeline estimado
**Sprint objetivo:** SX-SY (X semanas)  
**Prioridad:** P0 (MVP) / P1 (PRO) / P2-P3 (PREMIUM)

---

**Checklist Definition of Done (Épica):**
- [ ] Todas las historias hijas completadas
- [ ] Tests E2E cubriendo flujo completo
- [ ] Documentación usuario actualizada
- [ ] Demostración funcional con stakeholders
```

---

## 2. TEMPLATE: HISTORIA DE USUARIO

```markdown
---
name: "👤 Historia de Usuario"
about: "Feature funcional con valor para el usuario final"
labels: story, needs-estimation
assignees: ''
---

## 👤 HISTORIA: [Título conciso]

### 📖 Como... Quiero... Para...
**Como** [rol del usuario]  
**Quiero** [acción/funcionalidad]  
**Para** [beneficio/objetivo]

**Ejemplo:**  
Como **técnico de campo**  
Quiero **registrar un pesaje con cinta métrica bovina**  
Para **estimar el peso del lote sin necesidad de báscula**

### ✅ Criterios de aceptación
<!-- Condiciones específicas verificables (Given-When-Then si aplica) -->
- [ ] **CA1:** ...
- [ ] **CA2:** ...
- [ ] **CA3:** ...

### 🎨 Diseño / Mockups
<!-- Links a Figma, capturas de pantalla, wireframes -->
[Incluir imagen o link]

### 🔧 Tareas técnicas (desglose)
<!-- Subtareas específicas que deben completarse -->
- [ ] **Backend:** Crear endpoint `POST /weighings` con validación `method=TAPE`
- [ ] **Backend:** Agregar lógica cálculo `estimatedWeightKg` usando divisor calibración
- [ ] **Frontend:** Formulario wizard 3 pasos (método, medidas, confirmación)
- [ ] **Frontend:** Integrar servicio `weighingService.create()`
- [ ] **Tests:** Unit test `weighing.service.calculateEstimatedWeight()`
- [ ] **Tests:** Integration test `POST /weighings` con datos cinta
- [ ] **Tests:** E2E Playwright flujo completo

### 🔗 Épica padre
Relacionado con: #xxx [Nombre Épica]

### 🚧 Dependencias técnicas
<!-- Otros issues que deben estar listos -->
- Requiere: #xxx (modelo `TapeCalibration` implementado)

### 📏 Estimación
**Puntos historia:** X (Fibonacci: 1, 2, 3, 5, 8, 13)  
**Sprint objetivo:** SX

---

**Checklist Definition of Done (Historia):**
- [ ] Código implementado siguiendo Clean Architecture
- [ ] Tests unitarios >80% cobertura en lógica crítica
- [ ] Tests integración para endpoints API
- [ ] Tests E2E para flujo UI completo
- [ ] Code review aprobado (mínimo 1 aprobación)
- [ ] Documentación técnica actualizada (JSDoc, README si aplica)
- [ ] Cumple criterios de aceptación (validado con PO/QA)
- [ ] Sin bugs P0-P1 abiertos relacionados
- [ ] Desplegado en ambiente staging y validado
```

---

## 3. TEMPLATE: TAREA TÉCNICA

```markdown
---
name: "🔧 Tarea Técnica"
about: "Trabajo técnico sin impacto directo usuario (refactor, deuda técnica, mejora infraestructura)"
labels: task, tech-debt
assignees: ''
---

## 🔧 TAREA: [Descripción técnica]

### 🎯 Objetivo
<!-- Por qué es necesaria esta tarea -->

### 📋 Descripción detallada
<!-- Explicación técnica del trabajo a realizar -->

### ✅ Checklist de trabajo
- [ ] Subtarea 1
- [ ] Subtarea 2
- [ ] Subtarea N

### 🔗 Contexto / Referencias
<!-- Issues relacionados, documentación, RFCs -->
- Relacionado con: #xxx
- Documentación: [link]

### 📏 Estimación
**Puntos:** X  
**Sprint objetivo:** SX

---

**Checklist Definition of Done (Tarea):**
- [ ] Código implementado y testeado
- [ ] Code review aprobado
- [ ] Documentación técnica actualizada
- [ ] No introduce regresiones (CI/CD verde)
```

---

## 4. TEMPLATE: BUG

```markdown
---
name: "🐛 Bug"
about: "Reporte de error o comportamiento inesperado"
labels: bug, needs-triage
assignees: ''
---

## 🐛 BUG: [Título descriptivo del error]

### 📝 Descripción del problema
<!-- Explicación clara del comportamiento incorrecto -->

### 🔄 Pasos para reproducir
1. Ir a `/ruta/pagina`
2. Hacer clic en botón "X"
3. Ingresar datos "Y"
4. Observar error "Z"

### 🎯 Comportamiento esperado
<!-- Qué debería ocurrir -->

### 🐞 Comportamiento actual
<!-- Qué ocurre realmente (incluir mensajes error) -->

### 📸 Capturas / Videos
<!-- Screenshots, GIFs, logs relevantes -->
```
[Adjuntar imagen/log]
```

### 🌍 Entorno
- **Ambiente:** Producción / Staging / Local
- **Navegador:** Chrome 120 / Firefox / Safari / Edge
- **Dispositivo:** Desktop / Mobile (Android/iOS)
- **Usuario afectado:** admin@magrotec.com / todos
- **Versión app:** vX.Y.Z

### 📊 Severidad
<!-- Marcar UNA opción -->
- [ ] **P0 - CRÍTICO:** Bloquea uso completo app (ej: login roto, crash total)
- [ ] **P1 - ALTO:** Bloquea funcionalidad clave (ej: no se pueden registrar pesajes)
- [ ] **P2 - MEDIO:** Funcionalidad afectada pero hay workaround
- [ ] **P3 - BAJO:** Cosmético o edge case poco frecuente

### 🔍 Logs / Errores técnicos
<!-- Stack trace, console errors, logs backend -->
```
[Pegar logs aquí]
```

### 🛠️ Posible causa / solución
<!-- Si tienes hipótesis técnica (opcional) -->

---

**Checklist Definition of Done (Bug):**
- [ ] Bug reproducido en local
- [ ] Fix implementado con tests que previenen regresión
- [ ] Code review aprobado
- [ ] Validado en staging por reportante o QA
- [ ] Desplegado en producción
- [ ] Verificado en producción (no reaparece)
```

---

## 5. TEMPLATE: SEGURIDAD (SECURITY ISSUE)

```markdown
---
name: "🔒 Vulnerabilidad de Seguridad"
about: "Reporte privado de problemas de seguridad"
labels: security, private
assignees: '@security-team'
---

## 🔒 VULNERABILIDAD: [Título descriptivo SIN detalles sensibles]

### ⚠️ AVISO
**Este issue contiene información sensible. NO compartir públicamente hasta resolución.**

### 📝 Descripción del problema
<!-- Explicación de la vulnerabilidad -->

### 🎯 Tipo de vulnerabilidad
<!-- Marcar todas las que apliquen -->
- [ ] Inyección (SQL, NoSQL, XSS, etc.)
- [ ] Autenticación rota / Sesiones inseguras
- [ ] Exposición datos sensibles
- [ ] XXE (XML External Entities)
- [ ] Control acceso roto (RBAC bypassable)
- [ ] Configuración incorrecta seguridad
- [ ] CSRF (Cross-Site Request Forgery)
- [ ] Deserialización insegura
- [ ] Componentes con vulnerabilidades conocidas (CVE)
- [ ] Logging/Monitoreo insuficiente
- [ ] Otro: ...

### 🔄 Pasos para explotar (PoC)
<!-- Proof of Concept demostrando la vulnerabilidad -->
1. ...
2. ...

### 📊 Severidad (CVSS)
<!-- Calcular con https://nvd.nist.gov/vuln-metrics/cvss/v3-calculator -->
- **Score CVSS:** X.X
- **Nivel:** Crítico / Alto / Medio / Bajo

### 🎯 Impacto potencial
<!-- Qué datos/sistemas están en riesgo -->

### 🛠️ Mitigación temporal (si existe)
<!-- Workaround hasta fix definitivo -->

### 🔧 Solución propuesta
<!-- Cómo corregir la vulnerabilidad -->

---

**Checklist Definition of Done (Security Issue):**
- [ ] Vulnerabilidad confirmada por equipo seguridad
- [ ] Fix implementado siguiendo OWASP guidelines
- [ ] Tests específicos agregados (penetration tests)
- [ ] Code review de seguridad aprobado
- [ ] Desplegado en producción sin exposición previa
- [ ] Post-mortem documentado (lecciones aprendidas)
- [ ] CVE asignado si aplica (vulnerabilidad pública conocida)
```

---

## 📌 SISTEMA DE ETIQUETAS (LABELS)

### Por tipo:
- `epic` – Épica (funcionalidad grande)
- `story` – Historia de usuario
- `task` – Tarea técnica
- `bug` – Error/defecto
- `security` – Vulnerabilidad seguridad
- `enhancement` – Mejora funcionalidad existente
- `refactor` – Refactorización código
- `docs` – Documentación

### Por prioridad:
- `P0` – Crítico (bloqueador MVP/producción)
- `P1` – Alto (importante para release)
- `P2` – Medio (deseable pero no bloqueante)
- `P3` – Bajo (nice-to-have)

### Por capa técnica:
- `backend` – Trabajo en `apps/api`
- `frontend` – Trabajo en `apps/web`
- `database` – Cambios schema Prisma
- `infra` – DevOps, CI/CD, hosting
- `qa` – Testing específico

### Por estado:
- `needs-triage` – Requiere análisis inicial
- `needs-breakdown` – Épica pendiente de desglosar
- `needs-estimation` – Requiere estimación puntos
- `blocked` – Bloqueado por dependencia externa
- `in-progress` – En desarrollo activo
- `in-review` – En code review
- `ready-to-test` – Listo para QA

### Por ámbito funcional:
- `auth` – Autenticación/autorización
- `dashboard` – Dashboard y KPIs
- `farms` – Gestión fincas
- `herds` – Gestión lotes
- `weighings` – Pesajes (báscula/cinta)
- `movements` – Rotación y movimientos
- `forage` – Aforos y forraje
- `cycles` – Ciclos de rotación
- `calibration` – Calibración cinta métrica
- `exports` – Exportaciones PDF/CSV
- `indicators` – Indicadores regenerativos
- `offline` – Funcionalidad offline-first

---

## 📊 DEFINITION OF DONE (DoD) POR NIVEL

### ✅ DoD ÉPICA
- [ ] Todas las historias de usuario completadas y desplegadas
- [ ] Tests E2E cubriendo flujo completo épica
- [ ] Documentación usuario actualizada (guías, videos si aplica)
- [ ] Demostración funcional con stakeholders (PO, cliente beta)
- [ ] Métricas de éxito medibles (ej: NPS, tiempo tarea, adopción)

### ✅ DoD HISTORIA DE USUARIO
- [ ] Código implementado siguiendo Clean Architecture (capas separadas)
- [ ] Tests unitarios >80% cobertura lógica crítica
- [ ] Tests integración para endpoints API (request/response completos)
- [ ] Tests E2E para flujo UI completo (login → acción → validación)
- [ ] Code review aprobado (mínimo 1 aprobación, checklist seguridad)
- [ ] Documentación técnica actualizada (JSDoc funciones, README componentes)
- [ ] Cumple todos los criterios de aceptación (validado con PO/QA)
- [ ] Sin bugs P0-P1 abiertos relacionados con la historia
- [ ] Desplegado en staging y validado funcionalmente

### ✅ DoD TAREA TÉCNICA
- [ ] Código implementado y testeado (unit tests)
- [ ] Code review aprobado
- [ ] Documentación técnica actualizada (si afecta API/arquitectura)
- [ ] CI/CD pipeline verde (no introduce regresiones)
- [ ] Métricas performance no empeoran (si aplica)

### ✅ DoD BUG
- [ ] Bug reproducido consistentemente en local
- [ ] Root cause identificada
- [ ] Fix implementado con tests de regresión (evitar reaparición)
- [ ] Code review aprobado
- [ ] Validado en staging por reportante original o QA
- [ ] Desplegado en producción
- [ ] Verificado en producción (bug no reaparece, logs limpios)
- [ ] Post-mortem si es P0 (documentar causa raíz y prevención futura)

### ✅ DoD SECURITY ISSUE
- [ ] Vulnerabilidad confirmada y clasificada (CVSS score)
- [ ] Fix implementado siguiendo OWASP Top 10 / CWE guidelines
- [ ] Tests de seguridad específicos (penetration tests, fuzz testing)
- [ ] Code review seguridad aprobado (mínimo 2 revisores)
- [ ] Desplegado en producción sin disclosure previo
- [ ] Post-mortem documentado (lecciones aprendidas, mejoras proceso)
- [ ] CVE asignado si es vulnerabilidad pública relevante
- [ ] Stakeholders notificados (compliance, legal si afecta usuarios)

---

## 🚀 FLUJO DE TRABAJO ISSUES

```
1. CREACIÓN
   ├─ Usar template apropiado
   ├─ Asignar labels iniciales (tipo, prioridad, capa)
   └─ Estado: `needs-triage`

2. TRIAGE (daily standup)
   ├─ Validar info completa
   ├─ Asignar prioridad definitiva (P0-P3)
   ├─ Asignar a épica si aplica
   └─ Estado: `needs-estimation` (historias/tareas) o `ready` (bugs P0)

3. ESTIMACIÓN (planning)
   ├─ Equipo estima puntos historia (Fibonacci)
   ├─ Descomponer si >13 puntos
   └─ Estado: `ready` → backlog priorizado

4. SPRINT PLANNING
   ├─ Seleccionar issues según capacity equipo
   ├─ Asignar a desarrollador
   └─ Estado: `sprint-backlog`

5. DESARROLLO
   ├─ Mover a `in-progress` al iniciar
   ├─ Crear rama `feature/issue-123-descripcion`
   ├─ Commits: `feat: #123 descripción`
   └─ PR linkado al issue (`Closes #123`)

6. CODE REVIEW
   ├─ Estado: `in-review`
   ├─ Checklist DoD validado por reviewer
   ├─ CI/CD verde (tests, lint, build)
   └─ Aprobación → merge

7. QA TESTING
   ├─ Estado: `ready-to-test`
   ├─ QA valida en staging
   └─ Si OK → deploy producción | Si falla → back to `in-progress`

8. CIERRE
   ├─ Validación producción OK
   ├─ Actualizar documentación usuario si aplica
   ├─ Issue cerrado automáticamente (PR merged)
   └─ Sprint retrospective: métricas (velocity, bugs escape, etc.)
```

---

## 📏 CONVENCIONES COMMITS

**Formato:** `<tipo>: #<issue-id> <descripción>`

**Tipos:**
- `feat:` – Nueva funcionalidad
- `fix:` – Corrección bug
- `refactor:` – Refactorización sin cambio funcional
- `test:` – Agregar/modificar tests
- `docs:` – Cambios documentación
- `style:` – Formato código (lint, prettier)
- `chore:` – Tareas mantenimiento (deps, config)
- `perf:` – Mejora performance

**Ejemplos:**
```bash
feat: #42 Agregar validación descanso mínimo en movimientos
fix: #128 Corregir cálculo estimatedWeightKg con divisor calibración
refactor: #95 Extraer lógica cálculo UA a servicio compartido
test: #42 Agregar tests integración POST /movements con validación descanso
docs: #210 Actualizar README con instrucciones setup Prisma
```

---

## 🔗 REFERENCIAS

- **Backlog completo:** `docs/backlog.md`
- **Matriz trazabilidad:** `docs/traceability_matrix.md`
- **Roadmap:** `docs/roadmap.md`
- **Clean Architecture:** `docs/arquitectura.md`
- **Definition of Done detallado:** `docs/definition_of_done.md`

---

**Última actualización:** 2025-01-08  
**Próxima revisión:** Tras Sprint 1 (ajustar templates según feedback equipo)