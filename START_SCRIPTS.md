# 🚀 Scripts de Inicio Rápido

## Scripts Disponibles

### 1️⃣ `START_DEVELOPMENT.bat` (Recomendado para desarrollo)
Inicia ambos servidores en modo desarrollo con hot-reload:
- **API**: Puerto 3001 con watch mode
- **Web**: Puerto 3000 con Next.js dev

**Características**:
- Auto-recarga al cambiar archivos
- Source maps para debugging
- Logs detallados en consola
- Instala dependencias automáticamente

**Uso**:
```bash
# Doble clic en el archivo o desde terminal:
START_DEVELOPMENT.bat
```

---

### 2️⃣ `START_PRODUCTION.bat` (Para producción local)
Compila y ejecuta versión optimizada:
- **API**: Puerto 3001 (build compilado)
- **Web**: Puerto 3000 (Next.js optimizado)

**Características**:
- Build optimizado para performance
- Sin source maps
- Menor uso de memoria
- Instala dependencias y compila automáticamente

**Uso**:
```bash
# Doble clic en el archivo o desde terminal:
START_PRODUCTION.bat
```

---

## Health Check Endpoints

Una vez iniciado el API, verifica su estado:

### ✅ Health Check Básico
```bash
curl http://localhost:3001/health
```

**Respuesta**:
```json
{
  "status": "ok",
  "timestamp": "2026-01-08T16:30:00.000Z",
  "service": "Ganadería Regenerativa API",
  "version": "1.0.0"
}
```

### 🔍 Health Check Detallado
```bash
curl http://localhost:3001/health/detailed
```

**Respuesta**:
```json
{
  "status": "ok",
  "timestamp": "2026-01-08T16:30:00.000Z",
  "service": "Ganadería Regenerativa API",
  "version": "1.0.0",
  "uptime": 123.45,
  "memory": {
    "used": 45,
    "total": 128,
    "unit": "MB"
  },
  "environment": "development"
}
```

---

## URLs de Acceso

Una vez iniciados, accede a:

- **Frontend**: http://localhost:3000
- **API Base**: http://localhost:3001/api/v1
- **Health Check**: http://localhost:3001/health
- **Dashboard**: http://localhost:3000/dashboard

---

## Detener Servidores

### En Windows:
1. Presiona `Ctrl + C` en la ventana de terminal
2. O cierra las ventanas abiertas por los scripts

### Forzar cierre de puertos:
```powershell
# Buscar procesos
Get-NetTCPConnection -LocalPort 3000,3001 | Select-Object LocalPort, OwningProcess

# Detener proceso
Stop-Process -Id <PID> -Force
```

---

## Troubleshooting

### ❌ Puerto ya en uso
```bash
# Detener proceso en puerto 3001
Get-NetTCPConnection -LocalPort 3001 | Select-Object OwningProcess
Stop-Process -Id <PID> -Force
```

### ❌ Dependencias faltantes
```bash
cd apps/api && npm install
cd apps/web && npm install
```

### ❌ Error de Prisma
```bash
cd apps/api
npx prisma generate
npx prisma db push
```

### ❌ Build fallido
```bash
# Limpiar y reconstruir
cd apps/api
rm -rf node_modules dist
npm install
npm run build
```

---

## Verificación Rápida

### 1. Verifica puertos abiertos:
```powershell
Test-NetConnection -ComputerName 127.0.0.1 -Port 3001
Test-NetConnection -ComputerName 127.0.0.1 -Port 3000
```

### 2. Verifica health del API:
```bash
curl http://localhost:3001/health
```

### 3. Accede al Web:
```
http://localhost:3000
```

---

**Última actualización**: 8 Enero 2026  
**Versión**: 1.0.0  
**Status**: ✅ Production Ready
