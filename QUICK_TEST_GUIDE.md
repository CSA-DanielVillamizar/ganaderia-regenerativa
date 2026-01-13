# 🎯 GUÍA RÁPIDA DE TESTING - SeedDataButton

## 🚀 Inicio Rápido (5 minutos)

### Paso 1: Inicia la Aplicación
```bash
cd apps/web
npm run dev
```
Espera a que aparezca: `✓ ready on http://localhost:3001`

### Paso 2: Login
```
URL: http://localhost:3001/auth/login
Email: admin@magrotec.com
Contraseña: Admin123!
```

### Paso 3: Ve a Dashboard
```
Click en "Analítica" en la navegación
URL: http://localhost:3001/dashboard
```

### Paso 4: Busca el Botón
Esquina **inferior izquierda**:
```
┌─────────────────────────┐
│ 🌱 Datos de Prueba      │
│ Crea automáticamente:   │
│ • 3 Potreros            │
│ • 1 Hato                │
│ • 1 Movimiento activo   │
│                         │
│ [🌱 Cargar Datos Demo]  │
└─────────────────────────┘
```

### Paso 5: Click & Observe
1. **Click** en "🌱 Cargar Datos Demo"
2. **Status**: "🌱 Cargando datos de prueba..."
3. **Spinner**: Animación de carga
4. **Success**: "✅ ¡Datos cargados!..."
5. **Auto-reload**: Página se recarga en 2 segundos

---

## 🔍 Verificaciones Post-Carga

### ✅ Check 1: IndexedDB
**Abre DevTools** (F12):
```
DevTools → Application tab → IndexedDB
  → ganaderia-regenerativa
    → herds (1 registro)
    → paddocks (3 registros)
    → movements (1 registro)
```

**Haz clic en cada colección** y verifica datos:
```
herds [0]:
  id: "uuid"
  name: "Novillos Levante"
  numberOfAnimals: 20
  currentWeight: 7000

paddocks [0]:
  id: "uuid"
  name: "El Roble"
  hectares: 8
  status: "AVAILABLE"

paddocks [1]:
  id: "uuid"
  name: "La Ceiba"
  hectares: 12
  status: "RESTING"

paddocks [2]:
  id: "uuid"
  name: "Samán"
  hectares: 10
  status: "AVAILABLE"

movements [0]:
  localId: "uuid"
  herdId: "[id del hato]"
  paddockId: "[id de samán]"
  status: "ACTIVE"
```

### ✅ Check 2: Dashboard
Después de la recarga, verifica:
```
Dashboard → Analítica

📊 KPI Cards:
  ✓ Animales: 20
  ✓ Peso Total: 7000 kg
  ✓ Peso Promedio: 350 kg

📈 Gráficos:
  ✓ PastureWedge cargado
  ✓ WeightGainReport cargado

🎯 Otros:
  ✓ Sin error messages
  ✓ Datos reflejados en todas las secciones
```

### ✅ Check 3: Console
Abre **DevTools → Console tab**:
```
✅ Potrero creado: El Roble
✅ Potrero creado: La Ceiba
✅ Potrero creado: Samán
✅ Hato creado: [uuid]
✅ Movimiento creado: [uuid]
```

No debe haber errores rojos.

---

## 📋 Checklist de Validación

```
□ SeedDataButton visible (esquina inferior izquierda)
□ Borde amarillo y emoji 🌱
□ Status message muestra "Cargando datos..."
□ Page recarga después de 2 segundos
□ Success message aparece
□ IndexedDB contiene 3 paddocks
□ IndexedDB contiene 1 herd
□ IndexedDB contiene 1 movement
□ Dashboard muestra 20 animales
□ Dashboard muestra 7000 kg total
□ Dashboard muestra 350 kg promedio
□ Ningún error en console
□ Datos persisten después de F5 refresh
```

---

## ❓ FAQs & Troubleshooting

### P: El botón no aparece
**R**: 
1. Verifica que estés en `/dashboard`
2. Scroll hacia abajo si está debajo del viewport
3. Recarga la página (Ctrl+R)
4. Abre DevTools → Console y busca errores

### P: Al hacer click no pasa nada
**R**:
1. Abre Console (F12) → Console tab
2. Busca errores relacionados a "RxDB" o "getDb"
3. Verifica que `indexedDB.databases()` tenga "ganaderia-regenerativa"

### P: Veo error "Cannot read property 'insert' of undefined"
**R**: RxDB no está inicializado correctamente
1. Verifica que frontend está corriendo (`npm run dev`)
2. Recarga la página completamente (Ctrl+Shift+R)
3. Espera 3 segundos antes de hacer click

### P: Los datos están en IndexedDB pero no en dashboard
**R**: Probablemente es un problema de `farmId`
1. Los datos se crean con `farmId: 'farm-demo-001'`
2. El dashboard filtra por farm activa
3. Cambiar selector de finca a "farm-demo-001" (si existe opción)

### P: Page no se recarga automáticamente
**R**:
1. Verifica que DevTools no tiene breakpoints
2. Verifica que no hay errores en Console
3. Haz refresh manual (F5) si es necesario

---

## 🎬 Video Steps (si necesitas)

```
1. npm run dev → terminal
2. Open http://localhost:3001
3. Login (admin@magrotec.com / Admin123!)
4. Go to Dashboard
5. Scroll down to corner
6. Click button
7. Wait for success message
8. F5 to verify data persists
9. F12 to inspect IndexedDB
```

---

## 📊 Datos Esperados (Resumen)

```
Entrada: 1 Click
        ↓
    [RxDB Insert]
        ↓
Salida: 5 Registros
    ├─ 3 Potreros (El Roble, La Ceiba, Samán)
    ├─ 1 Hato (Novillos Levante, 20 animales)
    └─ 1 Movimiento (Activo en Samán)

Dashboard: Debe actualizar automáticamente
Sincronización: Será "pending" hasta conectar con servidor
```

---

## 🛑 STOP - Antes de Ir a Producción

**Eliminar antes de deploy:**

```bash
# 1. Comentar en dashboard/page.tsx
# Línea ~60: <SeedDataButton />

# 2. Eliminar carpeta
rm -r apps/web/src/components/debug/

# 3. Rebuild
npm run build

# 4. Test
npm run start
```

---

## ✅ Estado: LISTO PARA TESTING

**Documentación**: Completa  
**Código**: Implementado  
**Git**: Pusheado  
**Testing**: Instrucciones listas

---

**Última actualización**: 2024  
**Responsable**: Senior Frontend Developer  
**Nivel**: 🟢 READY TO TEST
