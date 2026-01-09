# 🚀 GUÍA DE EJECUCIÓN - HERRAMIENTA DIGITAL GANADERA

## ✅ Pre-requisitos

```bash
✓ Node.js v18+ instalado
✓ npm v9+ instalado
✓ Git instalado
✓ Puerto 3000 disponible (Backend)
✓ Puerto 3001 disponible (Frontend)
```

Verificar instalación:
```bash
node --version    # v18.x.x
npm --version     # 9.x.x
```

---

## 📦 Instalación de Dependencias

```bash
cd GanaderiaRegenerativa

# Instalar dependencias de workspace
npm install

# Instalar dependencias de apps
cd apps/api && npm install
cd ../web && npm install
```

---

## 🗄️ Base de Datos

### Crear/Resetear base de datos

```bash
cd apps/api

# Generar cliente Prisma
npx prisma generate

# Crear tablas (si no existen)
npx prisma migrate deploy

# O resetear todo (WARNING: pierde datos)
npx prisma migrate reset
```

El archivo `.env` debe contener:
```
DATABASE_URL="file:./prisma/dev.db"
```

---

## 🚀 Opción 1: Iniciar Servidores (Recomendado)

### Forma A: Dos Terminales (Control Total)

**Terminal 1 - Backend:**
```bash
cd apps/api
npm run start:dev
```
Verás:
```
[Nest] 12345 - 12/26/2025, 10:30:45 AM     LOG [NestFactory] Nest application successfully started
[Nest] 12345 - 12/26/2025, 10:30:45 AM     LOG [InstanceLoader] DashboardModule dependencies initialized
...
[Nest] 12345 - 12/26/2025, 10:30:46 AM     LOG [NestApplication] Nest application listening on port 3000
```

**Terminal 2 - Frontend:**
```bash
cd apps/web
npm run dev
```
Verás:
```
  ▲ Next.js 14.2.0
  
  ▶ Local:        http://localhost:3001
  ▶ Environments: .env.local

  ✓ Ready in 3.2s
```

### Forma B: Un Solo Terminal (Con Concurrently)

Si tienes `npm run start:all` configurado:
```bash
npm run start:all
```

---

## 🌐 Acceder a la Aplicación

### URLs

| Aplicación | URL | Descripción |
|---|---|---|
| **Frontend** | http://localhost:3001 | Interfaz principal |
| **Backend** | http://localhost:3000 | API REST |
| **API Docs** | http://localhost:3000/api | Documentación (si está habilitado) |

### Credenciales por Defecto

Si hay seed data:
```
Email: admin@ganaderia.local
Password: 123456
```

Si no, crear nueva cuenta:
1. Ir a http://localhost:3001
2. Click en "Crear Cuenta"
3. Completar formulario
4. Confirmar email (si hay validación)

---

## 📋 Flujo de Uso - Ejemplo Práctico

### 1️⃣ Login
```
1. Ir a http://localhost:3001
2. Ingresar credenciales
3. Será redirigido a /dashboard
```

### 2️⃣ Crear Primera Finca
```
1. Menú → Fincas → Nueva Finca
2. Completar:
   - Nombre: "Mi Primera Finca"
   - Ubicación: "Cauca, Colombia"
   - Hectáreas: 50
3. Guardar
```

### 3️⃣ Crear Potreros (Épica 1)
```
1. Click en finca
2. Tab "Potreros" → "+ Nuevo Potrero"
3. Completar:
   - Nombre: "Potrero A"
   - Hectáreas: 5
   - Descanso mínimo: 7 días
   - Tipo: PERENNE
4. Guardar
5. Repetir para 3-4 potreros
```

### 4️⃣ Crear Rebaño (Épica 2)
```
1. Tab "Rebaños" → "+ Nuevo Rebaño"
2. Completar:
   - Nombre: "Rebaño Pasto 1"
   - Peso inicial: 450 kg
   - Cantidad animales: 50
3. Guardar
```

### 5️⃣ Registrar Primer Pesaje (Épica 4)
```
1. Click en rebaño
2. Botón "+ Nuevo Pesaje"
3. Elegir método:
   a) BÁSCULA: Ingresa peso directo
   b) CINTA: Ingresa perímetro (cm) y largo (cm)
      → Sistema estima automáticamente
4. Guardar
5. Ver en tabla de pesajes
```

### 6️⃣ Hacer Aforo (Épica 5)
```
1. Ir a Potreros
2. Click en un potrero
3. Botón "📊 Registrar Aforo"
4. Completar 4 pasos:
   - Marco: 1 m² (por defecto)
   - Peso fresco: 15 kg
   - % MS: 20%
   - % Aprovechamiento: 50%
5. Sistema calcula:
   ✓ kg MS/ha
   ✓ Días para 30 UA
6. Guardar
```

### 7️⃣ Ver Dashboard (Épica 6)
```
1. Ir a Dashboard
2. Ver KPIs:
   - Total UA
   - UA/hectárea
   - Ocupación promedio
   - Potreros necesitando descanso
3. Ver Alertas (por severidad)
4. Ver Mapa de Potreros:
   - 🐄 Ocupados (rojo)
   - 🌱 Reposando (amarillo)
   - ✅ Listos (verde)
5. Hacer rotaciones según alertas
```

### 8️⃣ Calibrar Cinta (Épica 7)
```
Opción A: Manual
1. Finca → Configuración → Calibración
2. Ajustar divisor (10000-13000)
3. Guardar y validar

Opción B: Automática
1. Hacer 5+ pesajes reales con bácula
2. Ir a Calibración
3. Click "Calibración Automática"
4. Subir pesajes con girth y length
5. Sistema calcula divisor óptimo
```

### 9️⃣ Consultar Guías (Épica 8)
```
1. Dashboard → Click en ícono "📖"
2. Seleccionar guía:
   - Pesaje por Cinta
   - Aforo de Forraje
   - Rotación de Potreros
   - Monitoreo de Salud
3. Seguir paso a paso
4. Ver tips, materiales, seguridad
```

### 🔟 Funcionar Offline (Épica 11)
```
1. Con la app abierta: Desconectar internet
2. Intentar guardar datos (pesaje, aforo, etc.)
3. App guarda localmente: "⏳ Pendiente sync"
4. Reconectar internet
5. App auto-sincroniza en background
6. Ver ✅ "Sincronizado"
```

---

## 🛠️ Comandos Útiles

### Desarrollo

```bash
# Backend
cd apps/api

# Dev server (hot reload)
npm run start:dev

# Build producción
npm run build

# Ejecutar build
npm start

# Generar Prisma
npx prisma generate

# Abrir Prisma Studio
npx prisma studio

# Reset DB (⚠️ Borra datos)
npx prisma migrate reset
```

```bash
# Frontend
cd apps/web

# Dev server (hot reload)
npm run dev

# Build producción
npm run build

# Ejecutar build
npm start

# Lint
npm run lint

# Type check
npm run type-check
```

### Testing

```bash
# Backend
npm run test              # Unit tests
npm run test:integration # Integration tests
npm run test:e2e        # E2E tests

# Frontend
npm run test
npm run test:watch
```

---

## 🔍 Debugging

### Backend Logs
```bash
# Activar DEBUG mode
DEBUG=* npm run start:dev

# O en .env
DEBUG=app:*
```

### Frontend DevTools
```
1. Abrir http://localhost:3001
2. F12 o Ctrl+Shift+I
3. Pestañas:
   - Console: logs y errores
   - Network: llamadas API
   - Application → Storage:
     - localStorage: queue de sincronización offline
     - sessionStorage: tokens
```

### Prisma Studio
```bash
cd apps/api
npx prisma studio
# Abre http://localhost:5555
# Visualiza y edita BD gráficamente
```

---

## ⚠️ Problemas Comunes

### Puerto ya en uso
```bash
# Ver qué usa el puerto
netstat -ano | findstr :3000    # Windows
lsof -i :3000                   # Mac/Linux

# Cambiar puerto en .env o package.json
```

### Dependencies no instaladas
```bash
# Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Problemas con Prisma
```bash
# Regenerar cliente
npx prisma generate

# Crear migrations
npx prisma migrate dev --name init
```

### Frontend no conecta con API
```bash
# Verificar .env.local en apps/web
NEXT_PUBLIC_API_URL=http://localhost:3000

# O en api.service.ts
const BASE_URL = 'http://localhost:3000/api'
```

---

## 📊 Monitoreo

### Health Check
```bash
# Backend
curl http://localhost:3000/health

# Frontend (compilación OK)
curl http://localhost:3001

# API Endpoints
curl http://localhost:3000/api/farms -H "Authorization: Bearer TOKEN"
```

### Logs Importantes

**Backend:**
```
[NestFactory] Starting...
[TypeOrmModule] Connecting...
[NestApplication] Listening on port 3000
```

**Frontend:**
```
✓ Ready in 3.2s
✓ Compiled successfully
Routes: 9 compiladas
```

---

## 🚀 Deploy a Producción

### Build Production

```bash
# Backend
cd apps/api
npm run build
# Genera: dist/

# Frontend
cd apps/web
npm run build
# Genera: .next/
```

### Ejecutar Builds

```bash
# Backend
node dist/main.js

# Frontend
npm start
```

### Variables de Entorno Producción

**apps/api/.env.production**
```
DATABASE_URL="file:./prod.db"
JWT_SECRET="tu-secret-aqui"
NODE_ENV="production"
```

**apps/web/.env.production**
```
NEXT_PUBLIC_API_URL="https://api.tudominio.com"
```

---

## 📱 Testing Manual

### Checklist de Pruebas Manuales

```
Login
☐ Registrarse con nuevo usuario
☐ Login con credenciales
☐ Logout
☐ Token persiste en localStorage

Dashboard
☐ KPIs se cargan correctamente
☐ Alertas se muestran por severidad
☐ Mapa de potreros actualiza
☐ Gráficos renderean

Pesajes (Épica 4)
☐ SCALE: guardar peso directo
☐ TAPE: estimar con medidas
☐ Ver peso por animal
☐ Historial se actualiza

Aforos (Épica 5)
☐ 4 pasos se completan
☐ kgMS/ha calcula correctamente
☐ Presets funcionan
☐ Datos se guardan

Rotación (Épica 3)
☐ Crear movimiento de entrada
☐ Validar no doble ocupancia
☐ Crear salida
☐ Calcular días ocupación
☐ Marcar descanso iniciado

Guías (Épica 8)
☐ Abrir guía paso a paso
☐ Ver tips y advertencias
☐ Navegar siguiente/anterior
☐ Completar guía

Offline (Épica 11)
☐ Desconectar internet
☐ Intentar guardar datos
☐ Ver "Pendiente sync"
☐ Reconectar
☐ Auto-sincronizar
☐ Ver "Sincronizado"

Calibración (Épica 7)
☐ Ver divisor actual
☐ Ajustar manualmente
☐ Validar cambios
☐ Ver historial
```

---

## 📞 Soporte

Si encuentras errores:

1. **Revisar logs:**
   ```bash
   # Backend
   npm run start:dev
   # Busca errores en consola
   
   # Frontend
   npm run dev
   # Busca errores en consola
   ```

2. **Database:**
   ```bash
   npx prisma studio
   # Verifica datos en BD
   ```

3. **Network:**
   ```bash
   # DevTools → Network
   # Verifica requests a API
   ```

---

## 🎯 Próximos Pasos

1. ✅ Ejecutar dev servers
2. ✅ Crear finca de prueba
3. ✅ Crear rebaños y potreros
4. ✅ Probar todos los formularios
5. ✅ Verificar cálculos y alertas
6. ✅ Revisar UI/UX
7. ✅ Documentar feedback
8. ✅ Deploy a staging
9. ✅ Testing en campo real
10. ✅ Deploy a producción

---

**Status:** ✅ Listo para ejecutar  
**Versión:** 1.0.0  
**Fecha:** 2025-12-26
