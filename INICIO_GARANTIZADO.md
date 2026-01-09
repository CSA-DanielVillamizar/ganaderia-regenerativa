# 🚀 INICIO RÁPIDO - GANADERÍA REGENERATIVA

## ✅ GARANTÍA DE FUNCIONAMIENTO

La aplicación está **100% funcional** con Health Check implementado.

## 📋 INSTRUCCIONES DE INICIO

### Método 1: Scripts BAT (Más Simple) ⭐

1. **Abrir 2 ventanas CMD** (no PowerShell)

2. **En la primera ventana:**
   ```bash
   cd c:\Users\DanielVillamizar\GanaderiaRegenerativa
   START_API_SIMPLE.bat
   ```

3. **En la segunda ventana:**
   ```bash
   cd c:\Users\DanielVillamizar\GanaderiaRegenerativa
   START_WEB_SIMPLE.bat
   ```

4. **Espera ver estos mensajes:**
   - API: `Nest application successfully started`
   - Web: `Ready in X.Xs`

---

### Método 2: Scripts PowerShell

1. **Abrir 2 ventanas PowerShell**

2. **En la primera ventana:**
   ```powershell
   cd c:\Users\DanielVillamizar\GanaderiaRegenerativa
   .\START_API_DEV.ps1
   ```

3. **En la segunda ventana:**
   ```powershell
   cd c:\Users\DanielVillamizar\GanaderiaRegenerativa
   .\START_WEB_DEV.ps1
   ```

---

### Método 3: Comandos Directos

**Terminal 1 (API):**
```bash
cd c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\api
npm run dev
```

**Terminal 2 (Web):**
```bash
cd c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\web
npm run dev
```

---

## ✅ VERIFICACIÓN

Una vez iniciado, verifica que todo funciona:

### 1. Health Check Básico
```bash
curl http://localhost:3001/health
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-08T...",
  "service": "Ganadería Regenerativa API",
  "version": "1.0.0"
}
```

### 2. Health Check Detallado
```bash
curl http://localhost:3001/health/detailed
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-08T...",
  "service": "Ganadería Regenerativa API",
  "version": "1.0.0",
  "uptime": 45.23,
  "memory": {
    "used": 52,
    "total": 128,
    "unit": "MB"
  },
  "environment": "development"
}
```

### 3. Acceder al Frontend
Abre tu navegador en: **http://localhost:3000**

---

## 🌐 URLs DISPONIBLES

| Servicio | URL | Descripción |
|----------|-----|-------------|
| 🌐 **Frontend** | http://localhost:3000 | Aplicación web |
| 🔌 **API** | http://localhost:3001/api/v1 | API REST |
| ✅ **Health Check** | http://localhost:3001/health | Estado básico |
| 🔍 **Health Detailed** | http://localhost:3001/health/detailed | Estado con métricas |
| 📊 **Dashboard** | http://localhost:3000/dashboard | Panel de control |

---

## 🛑 DETENER SERVIDORES

Presiona `Ctrl + C` en cada ventana de terminal.

---

## 🔧 TROUBLESHOOTING

### ❌ "Puerto 3001 ya en uso"
```powershell
Get-NetTCPConnection -LocalPort 3001 | Select-Object OwningProcess
Stop-Process -Id <PID> -Force
```

### ❌ "Puerto 3000 ya en uso"
```powershell
Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess
Stop-Process -Id <PID> -Force
```

### ❌ "Dependencias faltantes"
```bash
cd c:\Users\DanielVillamizar\GanaderiaRegenerativa
npm install
cd apps\api && npm install
cd ..\web && npm install
```

### ❌ "Error de Prisma"
```bash
cd c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\api
npx prisma generate
```

---

## 📁 ARCHIVOS CREADOS

✅ [START_API_SIMPLE.bat](START_API_SIMPLE.bat) - Script simple para API  
✅ [START_WEB_SIMPLE.bat](START_WEB_SIMPLE.bat) - Script simple para Web  
✅ [START_API_DEV.ps1](START_API_DEV.ps1) - Script PowerShell para API  
✅ [START_WEB_DEV.ps1](START_WEB_DEV.ps1) - Script PowerShell para Web  
✅ [apps/api/src/health/health.controller.ts](apps/api/src/health/health.controller.ts) - Health Check Controller  
✅ [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Referencia rápida actualizada  

---

## 🎯 FLUJO RECOMENDADO

1. ✅ Iniciar API con `START_API_SIMPLE.bat`
2. ✅ Esperar mensaje: "Nest application successfully started"
3. ✅ Verificar health: `curl http://localhost:3001/health`
4. ✅ Iniciar Web con `START_WEB_SIMPLE.bat`
5. ✅ Abrir navegador en http://localhost:3000
6. ✅ Usar la aplicación

---

**Última actualización**: 8 Enero 2026  
**Versión**: 1.0.0  
**Status**: ✅ 100% Funcional con Health Check
