# 📖 QUICK REFERENCE - Herramienta de Ganadería Regenerativa

## 🔥 Atajos Rápidos

### Iniciar Desarrollo
```powershell
# Opción 1: Scripts PowerShell (Recomendado)
# Terminal 1:
.\START_API_DEV.ps1

# Terminal 2:
.\START_WEB_DEV.ps1

# Opción 2: Modo manual
# Terminal 1:
cd apps/api && npm run dev

# Terminal 2:
cd apps/web && npm run dev
```

### Acceso Inmediato
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001/api/v1
- **Health Check**: http://localhost:3001/health
- **Health Detailed**: http://localhost:3001/health/detailed
- **Dashboard**: http://localhost:3000/dashboard

---

## 📊 FLUJOS PRINCIPALES

### 1️⃣ Crear Finca (Nueva)
```
/farms/new
├─ Nombre finca
├─ Hectáreas totales
├─ Configuración inicial (minRestDays=30)
└─ ✅ Crea: Farm + configParams
```

### 2️⃣ Crear Rebaño
```
/farms/[id]
├─ Click "Agregar Rebaño"
├─ Nombre, raza, cantidad de animales
└─ ✅ Crea: Herd + Animal[] + calcula UA
```

### 3️⃣ Registro de Pesaje (Dual)
```
/farms/[id]/herds/[herdId] → Sección PESAR
├─ MÉTODO 1: SCALE (Báscula)
│  ├─ Peso directo kg
│  └─ Almacena: actualWeight
│
└─ MÉTODO 2: TAPE (Cinta métrica)
   ├─ Perímetro torácico (cm)
   ├─ Largo corporal (cm)
   └─ Formula: (girth² × length) / divisor
      ├─ Divisor default: 11877
      ├─ Rango válido: 10000-13000
      └─ Almacena: chestGirth, bodyLength
```

### 4️⃣ Calibración de Fórmula TAPE
```
/farms/[id]/dashboard → Panel "Calibración de Cinta"

MODO MANUAL:
├─ Ajustar divisor slider (10000-13000)
├─ Agregar notas
└─ ✅ Guardar

MODO AUTOMÁTICO:
├─ Sistema calcula divisor óptimo
├─ Usa últimos 5+ pesajes
├─ Aplica regresión (mínimos cuadrados)
├─ Muestra RMSE error
└─ ✅ Valida automáticamente
```

### 5️⃣ Aforo Guiado (4 Pasos)
```
/farms/[id]/paddocks → Sección "AFORO"
│
├─ PASO 1: Marco
│  ├─ 0.25 m² (muestra pequeña)
│  ├─ 1 m² (estándar)
│  └─ 4 m² (área grande)
│
├─ PASO 2: Peso Fresco
│  └─ Kg recién cortados
│
├─ PASO 3: % Materia Seca
│  ├─ 18% (forraje verde)
│  ├─ 25% (forraje maduro)
│  └─ 40% (forraje seco)
│
├─ PASO 4: % Aprovechamiento
│  ├─ 60% (pastoreo ligero)
│  ├─ 75% (pastoreo normal)
│  └─ 90% (pastoreo intenso)
│
└─ ✅ RESULTADO: kg MS/ha auto-calculado
   Formula: (peso_fresco × %MS × %aprovech) / área × 10000
```

### 6️⃣ Rotación de Potreros
```
/farms/[id]/paddocks → Mapa Visual

ESTADO READY (verde ✅):
├─ Click en potrero
└─ "Ocupar" → Selecciona rebaño

ESTADO OCCUPIED (rojo 🐄):
├─ Muestra días de ocupación
├─ Alerta si > 7 días
└─ "Liberar" → Move a otro potrero

ESTADO RESTING (amarillo 🌱):
├─ Barra de progreso (restDays / minRestDays)
├─ Alerta ⚠️ si descanso insuficiente
└─ Auto → READY cuando completa
```

### 7️⃣ Dashboard & Alertas
```
/dashboard → Vista Operacional

MÉTRICAS:
├─ UA totales finca
├─ UA/hectárea (densidad)
├─ Ocupación promedio
└─ Potreros en descanso

ALERTAS:
├─ 🔴 CRÍTICA (roja): Sobrepastoreo, descanso insuficiente
├─ 🟠 MODERADA (naranja): Carga alta, pesajes atrasados
└─ 🟡 INFO (amarilla): Recordatorios

MAPA:
├─ Estado actual todos los potreros
├─ Código color por estado
└─ Click → Expandir detalles
```

### 8️⃣ Guías Interactivas
```
Acceso desde cualquier sección → Botón "📚 Ver Guía"

DISPONIBLES:
├─ ⚖️ Pesaje con Cinta (5 pasos, 15 min)
├─ 🌾 Aforo de Forraje (6 pasos, 45 min)
├─ 🐄 Rotación Segura (5 pasos, 30 min)
└─ 💪 Monitoreo Salud (4 pasos, 15 min)

CADA GUÍA:
├─ Paso actual: título, descripción, tips, advertencias
├─ Materiales requeridos
├─ Notas de seguridad
├─ Navegación: ← Anterior | Siguiente →
└─ Progreso visual (ej: 3/6 pasos)
```

### 9️⃣ Sincronización Offline
```
AUTOMÁTICA:
├─ App funciona sin internet
├─ Cambios guardados en localStorage
├─ Al reconectar: auto-sincroniza con servidor

MANUAL:
├─ Icono 🔄 muestra status
├─ Click → Sincronizar ahora
├─ Historial de intentos
└─ Reintentos automáticos (máx 3)

STATUS:
├─ ✅ Synced (completado)
├─ ⏳ Pending (en cola)
├─ ❌ Failed (error - reintentable)
└─ 💾 Offline (sin internet)
```

---

## 🎯 ATAJOS POR ROL

### 👨‍🌾 Ganadero
```
Flujo Típico Diario:
1. Dashboard → Ver alertas (5 min)
2. Pesaje → TAPE o SCALE (10 min)
3. Rotación → Liberar/Ocupar potrero (5 min)
4. Aforo → Si es necesario (30 min)
5. Offline → Cambios sync automático
```

### 👨‍💼 Administrador
```
Flujo Setup:
1. /farms/new → Crear finca
2. Configurar minRestDays en settings
3. /farms/[id]/paddocks → Crear potreros
4. /farms/[id]/herds/new → Crear rebaños
5. Calibrar fórmula TAPE (automático)
6. Dashboard → Revisar alertas iniciales
```

---

## 🔌 API ENDPOINTS (Resumen)

### Health Check
```
GET    http://localhost:3001/health                   → Status básico del servicio
GET    http://localhost:3001/health/detailed          → Status detallado (uptime, memoria)
```

### Calibración
```
GET    http://localhost:3001/api/v1/calibration/farms/:farmId              → Ver calibración actual
POST   http://localhost:3001/api/v1/calibration/farms/:farmId              → Actualizar manual
PUT    http://localhost:3001/api/v1/calibration/farms/:farmId/validate     → Marcar como válida
GET    http://localhost:3001/api/v1/calibration/farms/:farmId/history      → Últimos cambios
POST   http://localhost:3001/api/v1/calibration/farms/:farmId/auto-calibrate → Regresión automática
```

### Pesaje
```
POST   http://localhost:3001/api/v1/weighing/farms/:farmId/herds/:herdId   → Registrar pesaje
GET    http://localhost:3001/api/v1/weighing/farms/:farmId/herds/:herdId   → Historial pesajes
```

### Aforo
```
POST   http://localhost:3001/api/v1/forage/farms/:farmId/paddocks/:paddockId → Registrar aforo
GET    http://localhost:3001/api/v1/forage/farms/:farmId/paddocks/:paddockId → Historial aforos
```

### Rotación
```
POST   http://localhost:3001/api/v1/movement/farms/:farmId                 → Mover rebaño
GET    http://localhost:3001/api/v1/movement/farms/:farmId                 → Historial movimientos
```

### Otros
```
GET    http://localhost:3001/api/v1/farms                  → Listar fincas
POST   http://localhost:3001/api/v1/farms                  → Crear finca
GET    http://localhost:3001/api/v1/farms/:id              → Detalle finca
GET    http://localhost:3001/api/v1/dashboard/farms/:id    → Métricas dashboard
```

---

## 🛠️ COMANDOS ÚTILES

### Desarrollo
```bash
# Generar Prisma Client
npm run prisma:generate

# Ver base de datos
npm run prisma:studio

# Resetear BD (desarrollo)
npm run prisma:reset

# Linting
npm run lint

# Tests
npm run test
npm run test:watch
```

### Build/Deploy
```bash
# Build producción
npm run build              # Ambos
cd apps/api && npm run build    # Solo API
cd apps/web && npm run build    # Solo Web

# Servir producción
npm run start              # Ambos en producción
```

---

## 🚨 TROUBLESHOOTING RÁPIDO

### Problema: "Port 3000/3001 already in use"
```bash
# Buscar proceso en puerto
lsof -i :3000              # macOS/Linux
netstat -ano | findstr :3000  # Windows PowerShell

# Matar proceso (macOS/Linux)
kill -9 <PID>

# Windows PowerShell
Stop-Process -Id <PID> -Force
```

### Problema: "Prisma schema out of sync"
```bash
npx prisma generate
npx prisma db push
```

### Problema: "Dependencies missing"
```bash
npm install
cd apps/api && npm install
cd apps/web && npm install
```

### Problema: "Build fails with TypeScript errors"
```bash
# Rebuild type definitions
npx prisma generate
npx tsc --noEmit

# Si persiste, revisar ERRORS.md
```

---

## 📱 FUNCIONES POR PÁGINA

| URL | Función | Input | Output |
|-----|---------|-------|--------|
| `/farms/new` | Crear finca | nombre, hectáreas | Finca + potreros |
| `/farms/[id]` | Detalle finca | - | Farm data + rebaños |
| `/farms/[id]/herds/new` | Crear rebaño | nombre, raza, cantidad | Herd + animales |
| `/farms/[id]/paddocks` | Ver potreros | - | Mapa visual + timeline |
| `/farms/[id]/herds/[herdId]` | Detalle rebaño | - | Pesar + historial |
| `/dashboard` | KPIs + Alertas | - | Métricas + mapa |
| `/auth/login` | Autenticación | email, password | JWT token |

---

## 🔐 AUTENTICACIÓN

```bash
# Header requerido en todas las requests (excepto /auth/*)
Authorization: Bearer <JWT_TOKEN>

# Ejemplo
curl -H "Authorization: Bearer eyJhbGc..." \
  http://localhost:3000/farms
```

---

## 💾 DATOS DE PRUEBA

```javascript
// Crear finca
POST http://localhost:3001/api/v1/farms
{
  "name": "Finca El Porvenir",
  "hectares": 100,
  "municipality": "Manizales"
}

// Crear rebaño
POST http://localhost:3001/api/v1/farms/:farmId/herds
{
  "name": "Grupo A",
  "breed": "Brahmán",
  "quantity": 50
}

// Pesaje SCALE
POST http://localhost:3001/api/v1/weighing/farms/:farmId/herds/:herdId
{
  "method": "SCALE",
  "actualWeight": 450,
  "date": "2025-12-26"
}

// Pesaje TAPE
POST http://localhost:3001/api/v1/weighing/farms/:farmId/herds/:herdId
{
  "method": "TAPE",
  "chestGirth": 185,
  "bodyLength": 220,
  "date": "2025-12-26"
}

// Aforo
POST http://localhost:3001/api/v1/forage/farms/:farmId/paddocks/:paddockId
{
  "frameSize": 1,
  "freshWeight": 15.5,
  "dryMatterPercentage": 25,
  "usagePercentage": 75
}
```

---

## 📌 CHECKLIST INICIAL

- [ ] npm install (raíz y apps/*)
- [ ] npx prisma generate
- [ ] npm run build (verificar 0 errores)
- [ ] npm run start:dev (ambos servidores)
- [ ] Acceder a http://localhost:3001
- [ ] Login o crear cuenta
- [ ] Crear finca de prueba
- [ ] Crear rebaño
- [ ] Hacer un pesaje (TAPE o SCALE)
- [ ] Ver dashboard

---

**Última actualización**: 2025-12-26  
**Versión**: 1.0.0  
**Status**: ✅ Production Ready

