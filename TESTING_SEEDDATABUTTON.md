# Testing del SeedDataButton - Guía Rápida

## ✅ Lo Que Se Ha Completado

1. **AnalyticsDashboard**: Sin título duplicado ✓
2. **Help Button (Móvil)**: Visible en BottomNav ✓  
3. **SeedDataButton**: Creado e integrado en dashboard ✓

---

## 🧪 Cómo Testear el SeedDataButton

### 1. Abre la Aplicación
```bash
# Terminal en workspace raíz
npm run dev
# O si prefieres iniciar frontend específicamente:
cd apps/web && npm run dev
```

Espera a que cargue:
- Frontend: http://localhost:3001 (o 3002 si está ocupado)
- Backend: http://localhost:3000

### 2. Login en la Aplicación
```
Email: admin@magrotec.com
Contraseña: Admin123!
```

### 3. Navega al Dashboard
Haz click en "Analítica" o navega a `/dashboard`

### 4. Busca el Botón Seed Data
Debe estar en la **esquina inferior izquierda** con:
- 🌱 Emoji de semilla
- Borde amarillo
- Fondo blanco
- Texto: "🌱 Cargar Datos Demo"

### 5. Click en el Botón
Verás:
1. **Estado Loading**: "🌱 Cargando datos de prueba..."
2. **Spinner azul** indicando que está procesando
3. **Recarga automática** después de 2 segundos

### 6. Verifica los Datos en IndexedDB
Abre DevTools (F12):
```
Application tab → IndexedDB → ganaderia-regenerativa
```

Deberías ver estas colecciones populadas:
- ✓ `paddocks` → 3 registros (El Roble, La Ceiba, Samán)
- ✓ `herds` → 1 registro (Novillos Levante, 20 animales)
- ✓ `movements` → 1 registro (movimiento activo)

### 7. Verifica el Dashboard
Después de la recarga, el dashboard debe mostrar:
- **KPI Cards** con datos del hato "Novillos Levante"
- **Gráficos** con información de potreros
- **Widgets** con peso actual (7000 kg) y promedio (350 kg)

---

## 🔍 Datos Creados

```
🌾 Potreros (Paddocks)
├─ El Roble (8 hectáreas) - AVAILABLE
├─ La Ceiba (12 hectáreas) - RESTING  
└─ Samán (10 hectáreas) - AVAILABLE

🐄 Hato (Herd)
├─ Nombre: Novillos Levante
├─ Animales: 20
├─ Peso Total: 7000 kg
├─ Peso Promedio: 350 kg
├─ Categoría: Ganado Joven
└─ Estado: ACTIVE

📍 Movimiento (Movement) - ACTIVO
├─ Hato: Novillos Levante
├─ Ubicación Actual: Samán
├─ Entrada: Hoy
└─ Salida Estimada: +30 días
```

---

## ❌ Si Algo No Funciona

### El botón no aparece
- [ ] Verifica que estés en `/dashboard`
- [ ] Recarga la página (Ctrl+R)
- [ ] Abre DevTools (F12) → Console tab
- [ ] Busca errores de RxDB

### Hace click pero no carga datos
**Check 1: Consola del navegador**
```javascript
// En DevTools Console:
await getDb()
// Debe retornar: GanaderiaDB {...}
```

**Check 2: Verifica RxDB iniciada**
```javascript
// En DevTools:
indexedDB.databases()
// Debe incluir: ganaderia-regenerativa
```

**Check 3: Mira los logs**
```
✅ Potrero creado: El Roble
✅ Potrero creado: La Ceiba
✅ Potrero creado: Samán
✅ Hato creado: [uuid]
✅ Movimiento creado: [uuid]
```

### Los datos no aparecen en dashboard
1. Verifica IndexedDB (paso 6 arriba)
2. Si los datos están en IndexedDB pero no en dashboard:
   - El dashboard probablemente filtra por `farmId`
   - Los datos se crean con `farmId: 'farm-demo-001'`
   - El usuario debe estar en esa "finca"

### Error "Cannot read property 'insert' of undefined"
Significa que `db.herds`, `db.paddocks` o `db.movements` no existen.
- Verifica que `getDb()` retorna la DB correctamente
- Revisa que RxDB está inicializada en `lib/offline/db.ts`

---

## 🎯 Testing Checklist

- [ ] SeedDataButton visible en dashboard (esquina inferior izquierda)
- [ ] Botón tiene borde amarillo y emoji 🌱
- [ ] Al hacer click, muestra "Cargando datos de prueba..."
- [ ] Página se recarga después de 2 segundos
- [ ] IndexedDB contiene 3 potreros, 1 hato, 1 movimiento
- [ ] Dashboard muestra datos del hato "Novillos Levante"
- [ ] KPI Cards muestran 20 animales
- [ ] WeightGain Widget muestra 7000 kg total / 350 kg promedio
- [ ] Help button visible en móvil (tap en 📱)
- [ ] Dashboard no tiene título duplicado

---

## 📝 Notas Técnicas

### Campo `farmId`
- Los datos se crean con `farmId: 'farm-demo-001'`
- Si el usuario está en una finca diferente, no verá estos datos
- **Solución**: Cambiar el selector de finca a "farm-demo-001"

### Sincronización
- Todos los registros tienen `syncStatus: 'pending'`
- Cuando se conecte con el servidor, se sincronizarán
- Por ahora, los datos son **solo offline** (en IndexedDB)

### UUID Generation
- Se usa `uuid v4` para generar IDs únicos
- No hay conflictos con datos existentes

---

## 🚀 Para Producción

**Antes de hacer deploy a producción:**

1. **Eliminar el componente del dashboard**
   ```tsx
   // Comentar en apps/web/src/app/dashboard/page.tsx
   // <SeedDataButton />
   ```

2. **Eliminar carpeta de debug**
   ```bash
   rm -r apps/web/src/components/debug/
   ```

3. **Build y test**
   ```bash
   npm run build
   npm run start
   ```

---

**Última actualización**: 2024
**Estado**: ✅ LISTO PARA TESTEAR
