# API Endpoints - Documentación

## Base URL
```
http://localhost:3000/api
```

---

## 🔐 Autenticación

### POST /auth/register
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña",
  "name": "Nombre Completo"
}
```

### POST /auth/login
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña"
}
```

---

## 🏘️ Fincas (Farms)

### GET /farms
Obtiene todas las fincas del usuario

### POST /farms
```json
{
  "name": "Mi Finca",
  "location": "Departamento, Municipio",
  "hectares": 100
}
```

### GET /farms/:farmId
Obtiene detalles de una finca

### PUT /farms/:farmId
Actualiza una finca

---

## 🔧 Calibración de Cinta Métrica (Épica 7)

### GET /calibration/farms/:farmId
Obtiene calibración actual de finca
```
Respuesta:
{
  "farmId": "...",
  "divisor": 11877,
  "status": "PENDING",
  "notes": "Default calibration",
  "appliedDate": "2025-12-26T..."
}
```

### POST /calibration/farms/:farmId
Crea/actualiza calibración manual
```json
{
  "divisor": 11900,
  "notes": "Ajustado para raza Brahman"
}
```

### PUT /calibration/farms/:farmId/validate
Valida calibración después de revisión

### GET /calibration/farms/:farmId/history
Obtiene historial de calibraciones
```
Respuesta: Array de cambios históricos con RMSE
```

### POST /calibration/farms/:farmId/auto-calibrate
Calibración automática con 5+ pesajes
```json
{
  "weighings": [
    {
      "actualWeight": 450,
      "chestGirth": 185,
      "bodyLength": 225
    },
    ...
  ]
}
```

---

## 👨‍🌾 Rebaños (Herds)

### GET /herds/farms/:farmId
Obtiene rebaños de una finca

### POST /herds
```json
{
  "farmId": "...",
  "name": "Rebaño Pasto 1",
  "initialWeight": 450,
  "animalCount": 50
}
```

### GET /herds/:herdId
Obtiene detalles de rebaño

---

## ⚖️ Pesajes (Weighing - Épica 4)

### GET /weighing/herds/:herdId
Obtiene pesajes de rebaño

### POST /weighing
```json
{
  "herdId": "...",
  "method": "TAPE",
  "chestGirthCm": 185,
  "bodyLengthCm": 225,
  "weight": 451,
  "animalCount": 50,
  "recordedAt": "2025-12-26T10:00:00Z"
}
```

O con método SCALE:
```json
{
  "herdId": "...",
  "method": "SCALE",
  "weight": 451,
  "animalCount": 50,
  "recordedAt": "2025-12-26T10:00:00Z"
}
```

---

## 🌾 Aforos (Forage - Épica 5)

### GET /forage/paddocks/:paddockId
Obtiene aforos de potrero

### POST /forage
```json
{
  "paddockId": "...",
  "frameAreaM2": 1,
  "freshWeightKg": 15,
  "dryMatterPercent": 20,
  "utilizationPercent": 50,
  "sampleDate": "2025-12-26T10:00:00Z",
  "notes": "Muestra representativa del piso"
}
```

---

## 🐄 Movimientos (Movement - Épica 3)

### GET /movements/herds/:herdId
Obtiene movimientos de rebaño

### POST /movements
```json
{
  "herdId": "...",
  "paddockId": "...",
  "type": "ENTRY",
  "entryDate": "2025-12-26T08:00:00Z"
}
```

Validaciones:
- No puede haber 2 movimientos ENTRY sin EXIT en el mismo potrero
- EXIT no puede ser anterior a ENTRY
- Calcula días de ocupación automáticamente

### PUT /movements/:movementId
```json
{
  "exitDate": "2025-12-26T16:00:00Z"
}
```

---

## 📊 Dashboard (Épica 6)

### GET /dashboard/farms/:farmId/summary
```
Respuesta:
{
  "farmId": "...",
  "totalHerds": 5,
  "totalAnimals": 250,
  "totalWeight": 112500,
  "totalUA": 250,
  "activePaddocks": 8,
  "averageWeightPerAnimal": 450,
  "uaPerHectare": 2.5,
  "avgOccupancyDays": 5.2,
  "paddocksNeedingRest": 2,
  "alerts": [
    {
      "type": "OVERGRAZING",
      "severity": "high",
      "message": "...",
      "paddockName": "..."
    }
  ],
  "paddockStatuses": [
    {
      "paddockId": "...",
      "paddockName": "Potrero A",
      "status": "OCCUPIED",
      "restDays": 2,
      "minRestDays": 7,
      "herdName": "Rebaño 1",
      "daysOccupied": 5
    }
  ]
}
```

### GET /dashboard/farms/:farmId/trends
Gráficos de tendencias de peso y UA

### GET /dashboard/farms/:farmId/forage-stats
Estadísticas de disponibilidad forrajera

---

## 🗺️ Potreros (Paddock)

### GET /paddocks/farms/:farmId
```json
[
  {
    "id": "...",
    "name": "Potrero A",
    "hectares": 5,
    "minRestDays": 7,
    "pastureType": "PERENNE",
    "active": true,
    "description": "..."
  }
]
```

### POST /paddocks
```json
{
  "farmId": "...",
  "name": "Potrero Nueva",
  "hectares": 5,
  "minRestDays": 7,
  "pastureType": "PERENNE",
  "description": "..."
}
```

### PUT /paddocks/:paddockId
Actualiza potrero (minRestDays, pastureType, etc.)

---

## 📋 Parámetros (Configuration)

### GET /parameters/farms/:farmId
Obtiene parámetros configurables de finca

### POST /parameters/farms/:farmId
```json
{
  "key": "MAX_OCCUPANCY_DAYS",
  "value": "7",
  "description": "Días máximos de ocupación"
}
```

---

## 🔒 Headers Requeridos

Todos los endpoints excepto auth requieren:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## ⚠️ Códigos de Error

| Código | Descripción |
|--------|---|
| 200 | OK - Éxito |
| 201 | Created - Recurso creado |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - No autenticado |
| 403 | Forbidden - No tiene permisos |
| 404 | Not Found - Recurso no existe |
| 409 | Conflict - Violación de regla de negocio |
| 500 | Server Error - Error interno |

---

## 🧪 Ejemplos cURL

### Registrarse
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@ejemplo.com","password":"123456","name":"Test"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@ejemplo.com","password":"123456"}'
```

### Crear Finca
```bash
curl -X POST http://localhost:3000/api/farms \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mi Finca",
    "location": "Cauca",
    "hectares": 100
  }'
```

### Calibrar Cinta Métrica
```bash
curl -X POST http://localhost:3000/api/calibration/farms/FARM_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "divisor": 11900,
    "notes": "Ajustado para Brahman"
  }'
```

### Obtener Dashboard
```bash
curl -X GET http://localhost:3000/api/dashboard/farms/FARM_ID/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📱 Frontend URLs

```
http://localhost:3001/               - Home
http://localhost:3001/auth/login     - Login
http://localhost:3001/dashboard      - Dashboard (Épica 6)
http://localhost:3001/farms          - Listado de fincas
http://localhost:3001/farms/[id]     - Detalle de finca
http://localhost:3001/farms/[id]/herds/[herdId]     - Detalle rebaño (con WeighingForm - Épica 4)
http://localhost:3001/farms/[id]/paddocks           - Potreros (con ForageForm - Épica 5)
```

---

**API Version:** 1.0.0  
**Last Updated:** 2025-12-26  
**Status:** ✅ Producción-Ready
