# 📝 GUÍA: CREAR HISTORIAS (STORIES) DESDE ÉPICAS

**Objetivo:** Desglosar las 8 épicas MVP en ~32 historias detalladas

---

## 📋 ESTRUCTURA RECOMENDADA

Cada épica tiene 3-5 historias. Ejemplo para MVP-1:

```
MVP-1: Gestión estructural de la finca (ÉPICA)
├─ MVP-1.1: Crear y administrar fincas (STORY)
├─ MVP-1.2: Definir potreros con parámetros regenerativos (STORY)
└─ MVP-1.3: Asignar usuarios a fincas con roles (STORY)
```

---

## 🎯 PLANTILLA PARA CADA STORY

```markdown
## Descripción
[Descripción clara de lo que se construye]

## Criterios de Aceptación
- [ ] [Criterio 1]
- [ ] [Criterio 2]
- [ ] [Criterio 3]

## Tareas Técnicas
- [ ] Backend: [Tarea específica]
- [ ] Frontend: [Tarea específica]
- [ ] Tests: [Tarea específica]

## Esfuerzo
[N] SP

## Labels
story, P0, backend, frontend, [otras]
```

---

## 📊 HISTORIAS RECOMENDADAS POR ÉPICA

### MVP-1: Gestión estructural (3 stories)

#### MVP-1.1: Crear y administrar fincas (CRUD)
```bash
gh issue create --repo CSA-DanielVillamizar/ganaderia-regenerativa \
  --title "[MVP-P0-1.1] Story: CRUD fincas" \
  --body "## Descripción
CRUD completo para gestión de fincas (Create, Read, Update, Delete).

## Criterios de Aceptación
- [ ] POST /farms crea finca con validación de datos
- [ ] GET /farms obtiene lista paginada
- [ ] GET /farms/:id obtiene una finca
- [ ] PUT /farms/:id actualiza datos
- [ ] DELETE /farms/:id soft delete
- [ ] Todos endpoints requieren JWT + Admin role
- [ ] Validación: nombre requerido, área > 0, ubicación válida

## Tareas
- [ ] Backend: Completar FarmService
- [ ] Backend: Swagger docs
- [ ] Frontend: Form create/edit
- [ ] Frontend: Table list
- [ ] Tests: Unit >85% + integration CRUD flow

## Esfuerzo
3 SP" \
  --label "story,P0,backend,frontend"
```

#### MVP-1.2: Definir potreros
```bash
gh issue create --repo CSA-DanielVillamizar/ganaderia-regenerativa \
  --title "[MVP-P0-1.2] Story: CRUD potreros" \
  --body "## Descripción
CRUD de potreros (lotes) dentro de cada finca.

## Criterios de Aceptación
- [ ] POST /farms/:farmId/paddocks crea potrero
- [ ] Validación: nombre, área, coordenadas
- [ ] GET /farms/:farmId/paddocks lista potreros
- [ ] PUT/DELETE funcional
- [ ] Tipo de suelo y condiciones capturadas

## Esfuerzo
2 SP" \
  --label "story,P0,backend,frontend"
```

#### MVP-1.3: Asignar usuarios
```bash
gh issue create --repo CSA-DanielVillamizar/ganaderia-regenerativa \
  --title "[MVP-P0-1.3] Story: RBAC usuarios a fincas" \
  --body "## Descripción
Asignar usuarios a fincas con roles (Admin, Technician, Viewer).

## Criterios de Aceptación
- [ ] Admin puede invitar usuario a finca
- [ ] Roles controlados por UserFarm.role
- [ ] GET /farms/:farmId/users lista miembros
- [ ] DELETE /farms/:farmId/users/:userId revoca acceso

## Esfuerzo
3 SP" \
  --label "story,P0,backend,frontend,security"
```

### MVP-2: Lotes y animales (4 stories)

#### MVP-2.1: CRUD lotes
```bash
gh issue create --repo CSA-DanielVillamizar/ganaderia-regenerativa \
  --title "[MVP-P0-2.1] Story: CRUD lotes (herds)" \
  --body "## Criterios de Aceptación
- [ ] POST /herds crea lote con nombre, cantidad, peso inicial
- [ ] GET /herds/:id muestra estado actual
- [ ] PUT /herds/:id actualiza datos
- [ ] Cálculo de UA automático

## Esfuerzo
3 SP" \
  --label "story,P0,backend,frontend,data"
```

#### MVP-2.2: Registrar animales
```bash
gh issue create --repo CSA-DanielVillamizar/ganaderia-regenerativa \
  --title "[MVP-P0-2.2] Story: Registrar animales individuales" \
  --body "## Criterios de Aceptación
- [ ] POST /animals registra animal (ID, raza, edad, peso)
- [ ] GET /herds/:herdId/animals lista animales
- [ ] Tracking por animal individual

## Esfuerzo
2 SP" \
  --label "story,P0,backend,frontend"
```

#### MVP-2.3: Estado en tiempo real
```bash
gh issue create --repo CSA-DanielVillamizar/ganaderia-regenerativa \
  --title "[MVP-P0-2.3] Story: Dashboard estado lote" \
  --body "## Criterios de Aceptación
- [ ] Card mostrando: cantidad, peso promedio, UA, último pesaje
- [ ] Actualización automática tras movimiento/pesaje

## Esfuerzo
2 SP" \
  --label "story,P0,frontend"
```

#### MVP-2.4: Historial de cambios
```bash
gh issue create --repo CSA-DanielVillamizar/ganaderia-regenerativa \
  --title "[MVP-P0-2.4] Story: Historial cambios lote" \
  --body "## Criterios de Aceptación
- [ ] Timeline mostrando movimientos y pesajes
- [ ] Fecha y cambios registrados

## Esfuerzo
1 SP" \
  --label "story,P0,frontend"
```

### MVP-3: Rotación y descanso (4 stories)

#### MVP-3.1: Registrar movimientos
```bash
gh issue create --repo CSA-DanielVillamizar/ganaderia-regenerativa \
  --title "[MVP-P0-3.1] Story: Registrar movimientos lotes" \
  --body "## Criterios de Aceptación
- [ ] POST /movements registra entrada y salida
- [ ] Campos: herdId, paddockId, fecha, notas
- [ ] GET /movements lista por lote

## Esfuerzo
2 SP" \
  --label "story,P0,backend,frontend"
```

#### MVP-3.2: Validar ocupación única
```bash
gh issue create --repo CSA-DanielVillamizar/ganaderia-regenerativa \
  --title "[MVP-P0-3.2] Story: Bloquear doble ocupación" \
  --body "## Criterios de Aceptación
- [ ] Guard: 1 lote activo por potrero
- [ ] Error 409 si intenta asignar lote a potrero ocupado
- [ ] UI error message claro

## Esfuerzo
2 SP" \
  --label "story,P0,backend,frontend"
```

#### MVP-3.3: Calcular días descanso
```bash
gh issue create --repo CSA-DanielVillamizar/ganaderia-regenerativa \
  --title "[MVP-P0-3.3] Story: Cálculo días ocupación y descanso" \
  --body "## Criterios de Aceptación
- [ ] GET /paddocks/:paddockId/rest-history
- [ ] Retorna: últimas ocupaciones + días descanso
- [ ] Cálculo automático sin input manual

## Esfuerzo
3 SP" \
  --label "story,P0,backend,data"
```

#### MVP-3.4: Validar descanso mínimo ⭐ CRÍTICO
```bash
gh issue create --repo CSA-DanielVillamizar/ganaderia-regenerativa \
  --title "[MVP-P0-3.4] Story: Validar descanso mínimo BEFORE movimiento" \
  --body "## Descripción
⭐ CRÍTICO para ser sistema regenerativo. Sin esto no hay validación.

## Criterios de Aceptación
- [ ] Guard en POST /movements valida minRestDays
- [ ] Bloquea movimiento si descanso < minRestDays
- [ ] Error 400 con mensaje: 'Descanso insuficiente. Requiere X más días.'
- [ ] Tests: scenario descanso OK vs insuficiente
- [ ] Frontend: Alert prominente si descanso insuficiente

## Esfuerzo
5 SP" \
  --label "story,P0,backend,frontend,critical"
```

### MVP-4: Pesajes (3 stories)

#### MVP-4.1: Pesaje báscula
```bash
gh issue create --repo CSA-DanielVillamizar/ganaderia-regenerativa \
  --title "[MVP-P0-4.1] Story: Registrar pesaje con báscula" \
  --body "## Criterios de Aceptación
- [ ] POST /weighings con method=scale, weight, date
- [ ] UI: Form simple 3 campos
- [ ] Validación: peso > 0

## Esfuerzo
2 SP" \
  --label "story,P0,backend,frontend,ux"
```

#### MVP-4.2: Pesaje con cinta métrica
```bash
gh issue create --repo CSA-DanielVillamizar/ganaderia-regenerativa \
  --title "[MVP-P0-4.2] Story: Pesaje con cinta métrica (estimación)" \
  --body "## Criterios de Aceptación
- [ ] UI: Wizard 3 pasos (método → medidas → preview → confirmar)
- [ ] Paso 1: Seleccionar method=tape
- [ ] Paso 2: Input perímetro pecho (cm), largo cuerpo (cm)
- [ ] Paso 3: Preview estimatedWeightKg calculado
- [ ] POST /weighings guarda

## Esfuerzo
5 SP (UI wizard es 70% del trabajo)" \
  --label "story,P0,frontend,ux"
```

#### MVP-4.3: Comparativa real vs estimado
```bash
gh issue create --repo CSA-DanielVillamizar/ganaderia-regenerativa \
  --title "[MVP-P0-4.3] Story: Análisis precisión pesajes" \
  --body "## Criterios de Aceptación
- [ ] GET /weighings/:herdId/analysis retorna comparativa
- [ ] Tabla: fecha, método, real, estimado, delta
- [ ] Scatter plot real vs estimado con línea 45°
- [ ] Mostrar R² para validar calibración

## Esfuerzo
5 SP" \
  --label "story,P0,backend,frontend,data"
```

### MVP-5: Aforos (3 stories)

#### MVP-5.1: Wizard aforo guiado
```bash
gh issue create --repo CSA-DanielVillamizar/ganaderia-regenerativa \
  --title "[MVP-P0-5.1] Story: Wizard aforo 4 pasos" \
  --body "## Criterios de Aceptación
- [ ] Stepper UI con 4 pasos
- [ ] Paso 1: Seleccionar potrero
- [ ] Paso 2: 3 muestras de forraje
- [ ] Paso 3: Pesar muestras (fresco + seco)
- [ ] Paso 4: Preview cálculo kg MS/ha

## Esfuerzo
8 SP" \
  --label "story,P0,frontend,ux"
```

#### MVP-5.2: Cálculo kg MS/ha
```bash
gh issue create --repo CSA-DanielVillamizar/ganaderia-regenerativa \
  --title "[MVP-P0-5.2] Story: Calcular disponibilidad forraje" \
  --body "## Criterios de Aceptación
- [ ] POST /forage-samples calcula kg MS/ha automáticamente
- [ ] Fórmula: (peso_seco / peso_fresco) * densidad_estimada
- [ ] GET /paddocks/:id/forage-availability retorna último aforo

## Esfuerzo
3 SP" \
  --label "story,P0,backend,data"
```

#### MVP-5.3: Días recomendados
```bash
gh issue create --repo CSA-DanielVillamizar/ganaderia-regenerativa \
  --title "[MVP-P0-5.3] Story: Calcular días recomendados ocupación" \
  --body "## Criterios de Aceptación
- [ ] GET /paddocks/:paddockId/recommended-days?herdId=X
- [ ] Fórmula: (forraje_disponible / consumo_diario) 
- [ ] Card en dashboard: 'Potrero aguanta N días con este lote'

## Esfuerzo
5 SP" \
  --label "story,P0,backend,frontend,data"
```

### MVP-6: Dashboard (2 stories)

#### MVP-6.1: KPIs operativos
```bash
gh issue create --repo CSA-DanielVillamizar/ganaderia-regenerativa \
  --title "[MVP-P0-6.1] Story: KPIs dashboard (6 gráficas)" \
  --body "## Criterios de Aceptación
- [ ] 1. Carga UA/ha vs objetivo
- [ ] 2. Días de descanso histórico
- [ ] 3. Ganancia de peso promedio
- [ ] 4. Disponibilidad forraje
- [ ] 5. Rotación histórica
- [ ] 6. Salud del suelo (índice simple)

## Esfuerzo
8 SP" \
  --label "story,P0,frontend,data"
```

#### MVP-6.2: Panel alertas destacado
```bash
gh issue create --repo CSA-DanielVillamizar/ganaderia-regenerativa \
  --title "[MVP-P0-6.2] Story: Panel alertas dashboard" \
  --body "## Criterios de Aceptación
- [ ] Alertas por severidad: ROJO (crítico), AMARILLO, NARANJA, AZUL
- [ ] Tipos: descanso insuficiente, sobrepastoreo, pesaje vencido, forraje bajo
- [ ] Badge con contador en header
- [ ] Click → desplegar lista

## Esfuerzo
5 SP" \
  --label "story,P0,frontend,ux"
```

### MVP-7: Seguridad (2 stories)

#### MVP-7.1: Autenticación JWT + RBAC
```bash
gh issue create --repo CSA-DanielVillamizar/ganaderia-regenerativa \
  --title "[MVP-P0-7.1] Story: JWT login + RBAC roles" \
  --body "## Criterios de Aceptación
- [ ] POST /auth/login retorna JWT
- [ ] Guards @UseGuards(JwtAuthGuard) en endpoints protegidos
- [ ] Roles: Admin > Technician > Viewer
- [ ] Tests: Denegar acceso sin token, token inválido

## Esfuerzo
3 SP" \
  --label "story,P0,backend,security"
```

#### MVP-7.2: Auditoría (AuditLog)
```bash
gh issue create --repo CSA-DanielVillamizar/ganaderia-regenerativa \
  --title "[MVP-P0-7.2] Story: AuditLog trazabilidad cambios" \
  --body "## Criterios de Aceptación
- [ ] Modelo Prisma: AuditLog (entity, entityId, action, changes, userId, createdAt)
- [ ] Interceptor automático en UPDATE/DELETE
- [ ] GET /admin/audit listable por entidad y fecha
- [ ] Documenta policy retención (90/180 días)

## Esfuerzo
8 SP" \
  --label "story,P0,backend,security"
```

### MVP-8: Parametría (2 stories)

#### MVP-8.1: CRUD parámetros
```bash
gh issue create --repo CSA-DanielVillamizar/ganaderia-regenerativa \
  --title "[MVP-P0-8.1] Story: Admin CRUD parámetros finca" \
  --body "## Criterios de Aceptación
- [ ] GET /farms/:farmId/parameters retorna parámetros
- [ ] PUT /farms/:farmId/parameters actualiza (admin only)
- [ ] Parámetros: consumo_diario, ua_optimo_ha, min_rest_days, etc

## Esfuerzo
3 SP" \
  --label "story,P0,backend,frontend"
```

#### MVP-8.2: Valores por defecto
```bash
gh issue create --repo CSA-DanielVillamizar/ganaderia-regenerativa \
  --title "[MVP-P0-8.2] Story: Parámetros por defecto al crear finca" \
  --body "## Criterios de Aceptación
- [ ] POST /farms auto-crea Parameter record con defaults
- [ ] Defaults basados en tipo ganadería (carne vs leche)
- [ ] Admin puede overridden inmediatamente

## Esfuerzo
1 SP" \
  --label "story,P0,backend"
```

---

## 🔗 COMANDO TEMPLATE PARA CREAR HISTORIAS EN LOTE

```bash
# Copiar para crear todas las stories:

REPO="CSA-DanielVillamizar/ganaderia-regenerativa"

# MVP-1 historias
gh issue create --repo $REPO --title "[MVP-P0-1.1] Story: CRUD fincas" --body "..." --label "story,P0,backend,frontend"
gh issue create --repo $REPO --title "[MVP-P0-1.2] Story: CRUD potreros" --body "..." --label "story,P0,backend,frontend"
gh issue create --repo $REPO --title "[MVP-P0-1.3] Story: RBAC usuarios" --body "..." --label "story,P0,backend,frontend,security"

# MVP-2 historias
gh issue create --repo $REPO --title "[MVP-P0-2.1] Story: CRUD lotes" --body "..." --label "story,P0,backend,frontend"
# ... etc
```

---

## ✅ PRÓXIMAS ACCIONES

1. **Crear 8 épicas** ← Hacer primero (ejecutar CREAR_ISSUES.bat)
2. **Crear 32 historias** ← Después (copiar templates arriba)
3. **Asignar a Sprint 1** ← Hacer milestone en GitHub
4. **Estimación** ← Planning Poker con equipo
5. **Asignar developers** ← Crear branches feature/issue-XX

---

**Documento:** Guía Historias MVP  
**Última actualización:** 2025  
**Responsable:** PM + Arquitecto
