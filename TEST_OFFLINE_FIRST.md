# 🧪 Manual de Testing: Offline-First Implementation

**Estado del Servidor:** ✅ Corriendo en http://localhost:3001  
**Fecha:** 12 de enero de 2026  
**Épica:** 1 - Offline-First Architecture

---

## 🎯 Objetivo del Test

Validar que la funcionalidad offline-first funciona correctamente:
1. ✅ Crear datos sin internet (guardados localmente)
2. ✅ UI responde inmediatamente (latencia <100ms)
3. ✅ Indicador muestra estado correcto
4. ✅ Sincronización automática al reconectar

---

## 📋 Pasos del Test

### ✅ Paso 1: Abrir la Aplicación

```
1. Abre navegador (Chrome, Firefox, Edge)
2. Ve a: http://localhost:3001
3. Inicia sesión con tus credenciales
4. Navega a: Dashboard o Formulario de Aforo
```

**Resultado esperado:** 
- ✅ Página carga correctamente
- ✅ Puedes ver el indicador en la esquina superior (debería decir "Todo sincronizado")

---

### ✅ Paso 2: Activar Modo Offline

#### Opción A: DevTools (Recomendado)
```
1. Abre DevTools: F12 (Windows) o Cmd+Option+I (Mac)
2. Ve a tab: Network
3. En la esquina superior izquierda, busca "Throttling"
4. Selecciona: "Offline"
```

#### Opción B: Desactivar WiFi/Ethernet
```
1. Desconecta tu WiFi o Ethernet físicamente
2. Verifica que `navigator.onLine === false` en console
```

**Resultado esperado:**
- ✅ El indicador cambia de verde a rojo/naranja
- ✅ Dice "Modo Offline"
- ✅ No hay error en la página (funciona sin internet)

---

### ✅ Paso 3: Crear un Nuevo Aforo (Sin Internet)

```
1. Navega a: /farms/[id]/forage/new (o usa el formulario visible)
2. Completa los campos:
   - Potrero: Selecciona cualquiera
   - Fecha: Hoy
   - Altura: 45 cm
   - Peso muestra: 2.5 kg
   - Materia seca: 32%
3. Haz clic en: "GUARDAR"
```

**Resultado esperado:**
- ✅ El formulario se envía instantáneamente (SIN esperar)
- ✅ Ves el nuevo aforo en la lista INMEDIATAMENTE
- ✅ El indicador cambia a "1 cambio pendiente" (ámbar)
- ✅ Badge muestra: "⏳ Sincronizando" o "1 pendiente"

**Esto es lo importante:** El usuario VE el dato en pantalla en <100ms, sin latencia de red

---

### ✅ Paso 4: Verificar Estado Local

Abre DevTools y verifica que el dato está en IndexedDB:

```javascript
// En la console del navegador:
// 1. Abre DevTools → Application tab
// 2. IndexedDB → ganaderia-offline-db
// 3. forageSamples (collection)
// 4. Deberías ver el aforo que creaste con:
//    - localId: "forage_..."
//    - syncStatus: "pending"
```

**O usa esta query en console:**
```javascript
const db = await (await import('/lib/offline/db.js')).getDb();
const items = await db.forageSamples.find().exec();
console.table(items.map(i => i.toJSON()));
```

**Resultado esperado:**
- ✅ El aforo existe en IndexedDB
- ✅ syncStatus: 'pending'
- ✅ localId está presente

---

### ✅ Paso 5: Crear Otro Aforo (Validar Cola)

Repite el Paso 3 para crear un SEGUNDO aforo:

```
1. Mismo formulario
2. Datos diferentes (ej: 50 cm altura)
3. Guardar
```

**Resultado esperado:**
- ✅ El indicador ahora dice: "2 cambios pendientes" o "⏳ 2"
- ✅ Ambos aforos están en pantalla
- ✅ Ambos en IndexedDB con syncStatus='pending'

---

### ✅ Paso 6: Reconectar Internet

#### Opción A: DevTools
```
1. DevTools → Network tab
2. Throttling: Vuelve a: "No throttling" o "Online"
```

#### Opción B: Reconecta WiFi
```
1. Reconecta tu WiFi o Ethernet
```

**Resultado esperado:**
- ✅ El indicador cambia a: "🔵 ⟳ Sincronizando..."
- ✅ Es rápido (debería durar 2-5 segundos)
- ✅ El indicador vuelve a verde: "✅ Todo sincronizado"

---

### ✅ Paso 7: Validar Sincronización

Verifica que los datos llegaron al servidor:

#### Opción A: Revisar IndexedDB
```javascript
// En console:
const db = await (await import('/lib/offline/db.js')).getDb();
const items = await db.forageSamples.find().exec();
console.table(items.map(i => ({
  localId: i.toJSON().localId,
  remoteId: i.toJSON().remoteId,
  syncStatus: i.toJSON().syncStatus,
  sampleDate: i.toJSON().sampleDate
})));
```

**Resultado esperado:**
- ✅ Los 2 aforos ahora tienen: syncStatus='synced'
- ✅ Tienen remoteId (ID asignado por servidor)

#### Opción B: Revisar Network Tab
```
1. En DevTools → Network tab
2. Busca requests POST a: /forage-samples
3. Deberías ver 2 requests (uno por cada aforo)
4. Status: 200 o 201 (éxito)
```

**Resultado esperado:**
- ✅ Hay 2 POST requests a /forage-samples
- ✅ Response status: 200/201
- ✅ Response contiene ID del servidor

#### Opción C: API directa
```bash
# En terminal (PowerShell):
# Listar aforos del servidor
$url = "http://localhost:3000/forage-samples"
Invoke-RestMethod -Uri $url -Headers @{"Authorization"="Bearer YOUR_TOKEN"}

# Deberías ver tus 2 aforos en la respuesta
```

---

### ✅ Paso 8: Validar UI

Recarga la página (F5) con internet conectada:

```
1. Presiona: F5 (reload)
2. Espera que cargue
3. Navega a la lista de aforos
```

**Resultado esperado:**
- ✅ Los 2 aforos siguen apareciendo en la lista
- ✅ Ambos muestran syncStatus='synced'
- ✅ No hay duplicados
- ✅ El indicador sigue en verde

---

## 🐛 Troubleshooting

### Problema: El indicador sigue en rojo después de reconectar

```
✅ Solución:
1. Abre DevTools → Console
2. Verifica que no hay errores rojo
3. Busca logs que empiecen con "❌ Error"
4. Si hay error de API: verifica que el backend está corriendo
5. En caso de duda, recarga la página (F5)
```

### Problema: El aforo NO aparece inmediatamente

```
✅ Solución:
1. Verifica modo offline está ACTIVO
2. Abre DevTools → Network
3. Confirma que Throttling = "Offline"
4. Intenta crear nuevamente
5. Revisa console para errores de RxDB
```

### Problema: Los aforos se duplican después de sync

```
✅ Solución:
1. Esto NO debería ocurrir si el merge está bien hecho
2. Abre DevTools → Application → IndexedDB → syncQueue
3. Verifica que los items dicen: status='synced'
4. Si ves duplicados, probablemente es un bug en el merge
5. Reporta en GitHub con screenshot
```

### Problema: Sincronización muy lenta

```
✅ Solución:
1. Verifica que el backend API está corriendo
2. En terminal: npm run dev (en apps/api)
3. Si la API es lenta, el sync también lo será
4. Esto es normal: timeout de HTTP es ~30s
```

---

## 📊 Métricas a Validar

| Métrica | Esperado | Resultado |
|---------|----------|-----------|
| **Latencia crear sin internet** | <100ms | ✅ |
| **Indicador cambia offline** | Inmediato | ✅ |
| **Indicador muestra pendientes** | Correcto | ✅ |
| **Sincronización automática** | Al reconectar | ✅ |
| **Tiempo de sync** | 2-5s para 2 items | ✅ |
| **Indicador vuelve a verde** | Después de sync | ✅ |
| **No hay duplicados** | 0 duplicados | ✅ |
| **RemoteId se asigna** | Después de sync | ✅ |

---

## 🎯 Checklist Final

- [ ] ✅ Creé 2 aforos sin internet
- [ ] ✅ Aparecieron inmediatamente en UI
- [ ] ✅ El indicador cambió a "pendiente"
- [ ] ✅ Reconecté internet
- [ ] ✅ El indicador mostró "Sincronizando..."
- [ ] ✅ El indicador volvió a verde
- [ ] ✅ No hay duplicados en la lista
- [ ] ✅ Los aforos tienen remoteId después de sync
- [ ] ✅ Recargué la página y los aforos persisten

**Si marcaste ✅ en todos:** 🎉 **ÉPICA 1 FUNCIONA CORRECTAMENTE**

---

## 📝 Reporte de Resultados

Si encuentras algún problema, copia este template:

```markdown
### Bug/Issue: [Descripción]

**Pasos para reproducir:**
1. 
2.
3.

**Resultado esperado:**


**Resultado actual:**


**Logs/Screenshots:**
(Adjunta screenshot de DevTools Console)

**Ambiente:**
- Navegador: Chrome/Firefox/Safari
- SO: Windows/Mac/Linux
- Versión app: 1.0
```

---

## 🚀 Próximos Pasos (Después del Test)

Si todo funciona correctamente:

1. **Épica 12:** Refactorizar movement.service.ts y weighing.service.ts
   → Ver: [EPIC_12_EXECUTION_GUIDE.md](EPIC_12_EXECUTION_GUIDE.md)

2. **Épica 2:** Lógica Agronómica (Voisin)
   → Ver: [ROADMAP_EPICS_12_PLUS.md](ROADMAP_EPICS_12_PLUS.md)

---

**Happy Testing! 🧪**

Si necesitas ayuda durante el test, abre GitHub Issues con el template de bug arriba.

---

**Servidor:** http://localhost:3001  
**DevTools:** F12  
**Backend:** http://localhost:3000 (si es necesario)
