# 🧪 Guía de Testing FASE 3

## 🎯 Objetivo
Validar que todos los componentes de FASE 3 funcionen correctamente en ambiente local antes de desplegar a producción.

---

## 🚀 Setup Previo

### 1. Asegurar que todo está compilado
```bash
cd apps/web
npm run build
# Verificar que compile sin errores
```

### 2. Iniciar el servidor de desarrollo
```bash
npm run dev
# Debe mostrar: ▲ Next.js 14.2.0 ready on http://localhost:3000
```

### 3. Asegurar que el backend está corriendo
```bash
cd apps/api
npm run start:dev
# Debe mostrar: [NestApplication] Nest application successfully started
```

---

## 🧪 Test 1: Cargar la Página

### Paso a Paso
1. Abrir navegador
2. Navegar a: `http://localhost:3000/dashboard/movements`
3. Verificar que carga sin errores

### Resultados Esperados
```
✓ Página carga sin errores
✓ Se ve el título "Panel de Operaciones"
✓ Se ve la descripción "Monitorea el estado actual..."
✓ CurrentFincaStatus muestra skeleton loaders (tarjetas pulsantes)
✓ MovementHistoryTable muestra skeleton loaders (filas pulsantes)
✓ No hay errores en DevTools (F12 → Console)
```

### Si Hay Error
```
❌ "Cannot find module '@web/components'"
→ Solución: npm install en apps/web

❌ "Failed to fetch data"
→ Solución: Verificar que el backend está corriendo en :3001

❌ Página en blanco
→ Solución: F12 → Network, buscar errores en llamadas API
```

---

## 🧪 Test 2: CurrentFincaStatus (Dashboard)

### Paso a Paso
1. Esperar a que termine de cargar (5-10 segundos)
2. Los skeleton loaders deben desaparecer
3. Deben aparecer tarjetas con movimientos activos

### Resultados Esperados
```
┌─────────────────────────────────┐
│ LOTE A      [Recuperando]       │
│ 45 animales                     │
│ En Potrero                      │
│ Potrero Norte (10 ha)           │
│ Días en Potrero: 28             │
│ Entrada: 12/01/2026             │
│ ✅ Listo para salida            │
└─────────────────────────────────┘
```

✓ Se muestran tarjetas con datos reales  
✓ Cada tarjeta tiene: nombre lote, animales, potrero, días, estado  
✓ Badge "Recuperando" aparece si aplica  
✓ Si no hay movimientos activos: mensaje "No hay movimientos activos"  

### Test de Auto-Refresh
1. Anotar la hora actual
2. Esperar 5 minutos
3. Verificar que los datos se recargaron

✓ Datos se actualizan automáticamente cada 5 minutos  

### Test de Error Simulado
1. Desconectar el backend (Ctrl+C en terminal)
2. Esperar a que expire la solicitud
3. Verificar que aparece notificación de error

✓ Notificación muestra error  
✓ Notificación incluye traceId  
✓ La página no se cae  

---

## 🧪 Test 3: MovementHistoryTable (Tabla)

### Paso a Paso
1. Scroll down a la tabla
2. Esperar a que termine de cargar
3. Los skeleton loaders deben desaparecer
4. Deben aparecer filas con historial

### Resultados Esperados
```
┌────────┬──────────┬──────────┬──────────┬────────┬──────┐
│ Lote   │ Potrero  │ Entrada  │ Salida   │ Estado │ Días │
├────────┼──────────┼──────────┼──────────┼────────┼──────┤
│ LOTE A │ Pot. N   │ 12/01/26 │ -        │ 🟢 Act │ 28d  │
│ LOTE B │ Pot. S   │ 10/12/25 │ 05/01/26 │ ⚫ Cmp │ 26d  │
└────────┴──────────┴──────────┴──────────┴────────┴──────┘
```

✓ Tabla muestra datos  
✓ 5 columnas visibles por defecto  
✓ Status badges correctos (🟢 o ⚫)  
✓ Fechas formateadas en es-ES (12/01/2026)  

---

## 🧪 Test 4: Paginación

### Navegación Anterior/Siguiente
1. Verificar que hay botón "Anterior" (deshabilitado en página 1)
2. Verificar que hay botón "Siguiente" (habilitado si hay más páginas)
3. Hacer clic en "Siguiente"

✓ Tabla se actualiza con nuevos datos  
✓ Página contador se incrementa (1 → 2)  
✓ Botón "Anterior" se habilita  
✓ Datos nuevos aparecen  

### Cambio de Tamaño de Página
1. Encontrar selector "Por página: [10 ▼]"
2. Hacer clic para abrir dropdown
3. Seleccionar 20

✓ Dropdown muestra opciones: 10, 20, 50  
✓ Al seleccionar 20, tabla se recarga  
✓ Se muestran hasta 20 filas  
✓ Página contador se actualiza (ej: "Página 1 de 3")  

```
Tamaño: 10  → Páginas esperadas: ~4-5
Tamaño: 20  → Páginas esperadas: ~2-3
Tamaño: 50  → Páginas esperadas: 1
```

---

## 🧪 Test 5: Filtros

### Filtro por Lote (herdId)
1. Buscar panel de filtros
2. Encontrar input "Filtrar por Lote"
3. Ingresar un herdId (ej: "herd-123")

✓ Tabla se recarga inmediatamente  
✓ Solo muestra movimientos de ese lote  
✓ Contador de página se reinicia a 1  

### Filtro por Potrero (paddockId)
1. Encontrar input "Filtrar por Potrero"
2. Ingresar un paddockId (ej: "paddock-456")

✓ Tabla se recarga inmediatamente  
✓ Solo muestra movimientos de ese potrero  

### Combinar Filtros
1. Ingresar herdId
2. Ingresar paddockId

✓ Tabla filtra por AMBOS (AND logic)  
✓ Muestra solo movimientos de ese lote EN ese potrero  

### Limpiar Filtros
1. Hacer clic en botón "Limpiar Filtros"

✓ Ambos campos se vacían  
✓ Tabla muestra todos los movimientos  
✓ Botón "Limpiar Filtros" desaparece  

---

## 🧪 Test 6: Panel de Filtros

### Abrir/Cerrar Panel
1. Hacer clic en botón "Añadir Filtros"

✓ Panel de filtros se abre  
✓ Muestra inputs para herdId y paddockId  
✓ Muestra instrucción "Deja en blanco para ver todos"  

2. Hacer clic nuevamente en "Añadir Filtros"

✓ Panel se cierra  

### Estado Visual
1. Sin filtros: botón muestra "Añadir Filtros" (azul)
2. Ingresar un filtro
3. Botón debe cambiar a "Filtros Activos" (indicador visual)

✓ Cuando hay filtros, muestra estado activo  
✓ Cuando sin filtros, botón se resetea  

---

## 🧪 Test 7: Error Handling

### Simular Error de API
1. Ir a DevTools (F12 → Network)
2. Desconectar el backend (Ctrl+C en api terminal)
3. Realizar alguna acción:
   - Cambiar página
   - Ingresar filtro
   - Refrescar auto-refresh

✓ Notificación de error aparece  
✓ Notificación incluye:
   - Mensaje de error
   - TraceId
   - Botón de cerrar  

### Debugging con TraceId
1. Copiar traceId de la notificación
2. En terminal del backend, buscar:
   ```bash
   grep "traceId" logs/error.log
   ```
3. Revisar qué falló

✓ TraceId es único y coincide entre frontend y backend  
✓ Permite rastrear errores fácilmente  

---

## 🧪 Test 8: Responsividad

### Móvil (< 768px)
1. Abrir DevTools (F12)
2. Toggle Device Toolbar (Ctrl+Shift+M)
3. Seleccionar iPhone 12 (390px)

✓ Cards en 1 columna  
✓ Tabla scrollea horizontalmente  
✓ Filtros apilados verticalmente  
✓ Botones son tocables (> 44px altura)  
✓ Sin elementos cortados  

### Tablet (768-1024px)
1. Cambiar a iPad (768px)

✓ Cards en 2 columnas  
✓ Tabla visible sin scroll horizontal  
✓ Filtros lado a lado  
✓ Todo proporcional  

### Desktop (> 1024px)
1. Cambiar a Desktop (1440px)

✓ Cards en 3 columnas  
✓ Tabla con mucho espacio  
✓ Panel de filtros bien distribuido  

---

## 🧪 Test 9: Performance

### Tiempo de Carga
1. Abrir DevTools (F12 → Network)
2. Refrescar página (Ctrl+R)
3. Observar tiempo total

✓ Página carga en < 3 segundos  
✓ Data API carga en < 2 segundos  
✓ Skeleton loaders aparecen instantáneamente  

### Cambio de Página
1. Ir a página 2 (hacer clic "Siguiente")
2. Observar tiempo de recarga

✓ Cambio de página es casi instantáneo (< 500ms)  
✓ Tabla se actualiza sin flickering  

### Cambio de Filtro
1. Ingresar un herdId
2. Observar tiempo de respuesta

✓ Tabla se actualiza < 500ms  
✓ Sin delay perceptible  

---

## 🧪 Test 10: Casos Especiales

### Sin Datos
1. Filtrar por un herdId que no existe
2. O un paddockId que no existe

✓ Tabla muestra mensaje "No hay movimientos"  
✓ Sin errores en consola  

### Muchos Datos
1. Ir al tamaño más pequeño (10 registros)
2. Navegar a última página

✓ Sin performance lag  
✓ Página carga correctamente  

### Cambios Mientras Carga
1. Cambiar filtro mientras tabla se carga
2. Cambiar página mientras tabla se carga

✓ Última acción prevalece  
✓ Sin errores de race condition  

---

## ✅ Checklist de Validación

```
Functional Tests
□ Página carga sin errores
□ CurrentFincaStatus muestra datos
□ MovementHistoryTable muestra datos
□ Paginación funciona (Anterior/Siguiente)
□ Selector de tamaño funciona (10/20/50)
□ Filtro herdId funciona
□ Filtro paddockId funciona
□ Limpiar filtros funciona
□ Panel de filtros abre/cierra
□ Auto-refresh cada 5 minutos

Error Handling
□ Notificación muestra en error API
□ TraceId incluido en notificación
□ No hay crashes
□ Datos quedan en pantalla si error

Responsiveness
□ Móvil (< 768px): OK
□ Tablet (768-1024px): OK
□ Desktop (> 1024px): OK
□ Sin elementos cortados
□ Botones tocables en móvil

Performance
□ Carga inicial < 3s
□ Cambio de página < 500ms
□ Cambio de filtro < 500ms
□ Skeleton loaders visibles

UX/UI
□ Colores correctos
□ Spacing coherente
□ Íconos visibles
□ Textos legibles
□ Badges correctos
```

---

## 📝 Reporte de Testing

### Plantilla para Documentar Resultados

```markdown
## Testing Report - FASE 3

**Date:** [YYYY-MM-DD]
**Tester:** [Nombre]
**Environment:** localhost:3000

### Results Summary
- Total Tests: 50
- Passed: __
- Failed: __
- Pending: __

### Test 1: Page Load
[ ] PASS [ ] FAIL
Notes: ___________

### Test 2: CurrentFincaStatus
[ ] PASS [ ] FAIL
Notes: ___________

... (for each test)

### Issues Found
1. Issue #1
   - Description: ___
   - Severity: Low/Medium/High
   - Steps to reproduce: ___
   - Expected: ___
   - Actual: ___

2. Issue #2
   ...

### Conclusion
Overall status: ✅ PASS / ❌ FAIL
Ready for production: YES / NO
```

---

## 🚀 Procedimiento de Despliegue

Solo proceder si todos los tests pasan:

1. **Verificar Build**
   ```bash
   npm run build
   # Debe compilar sin errores
   ```

2. **Verificar Deploy**
   ```bash
   npm run start
   # Debe iniciar sin errores
   ```

3. **Verificar Production URL**
   ```
   http://production-url.com/dashboard/movements
   # Debe funcionar igual que en local
   ```

---

## 📞 Troubleshooting

| Error | Solución |
|-------|----------|
| 404 on API call | Verificar backend running |
| Blank page | Check F12 Console for errors |
| Tabla no carga | Verificar API response format |
| Filtros no funcionan | Revisar parámetros de API |
| Responsividad rota | Verificar Tailwind classes |
| Auto-refresh no funciona | Revisar setInterval en código |
| Notificación no muestra | Verificar NotificationContainer |

---

**¡Listo para testing!** 🧪

Ejecutar todos los tests y documentar resultados en FASE_3_TESTING_RESULTS.md

