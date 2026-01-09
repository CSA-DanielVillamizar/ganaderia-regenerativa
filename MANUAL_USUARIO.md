# 📖 Manual de Usuario - Sistema de Ganadería Regenerativa

## 🎯 Bienvenido

Este manual te guiará paso a paso en el uso del sistema de gestión para ganadería regenerativa. Está diseñado para que cualquier persona del equipo de la finca pueda administrar los lotes, controlar rotaciones y tomar decisiones informadas sobre el pastoreo.

---

## 📑 Tabla de Contenidos

1. [Acceso al Sistema](#1-acceso-al-sistema)
2. [Página de Inicio](#2-página-de-inicio)
3. [Gestión de Lotes (Hatos)](#3-gestión-de-lotes-hatos)
4. [Gestión de Potreros](#4-gestión-de-potreros)
5. [Panel de Movimientos](#5-panel-de-movimientos)
6. [Dashboard Operativo](#6-dashboard-operativo)
7. [Alertas de Sobrepastoreo](#7-alertas-de-sobrepastoreo)
8. [Selector de Temporada](#8-selector-de-temporada)
9. [Exportar Reportes](#9-exportar-reportes)
10. [Notificaciones WhatsApp](#10-notificaciones-whatsapp)
11. [Registro de Pesajes](#11-registro-de-pesajes)
12. [Preguntas Frecuentes](#12-preguntas-frecuentes)

---

## 1. Acceso al Sistema

### 📍 Ingresar a la Aplicación

1. **Abre tu navegador** (Chrome, Firefox, Edge o Safari)
2. **Escribe la dirección**: `http://tu-dominio.com` o `http://localhost:3000` (si es local)
3. **Ingresa tus credenciales**:
   - Usuario: tu correo electrónico
   - Contraseña: la que te proporcionó el administrador

### 🔐 Primer Inicio de Sesión

Si es tu primera vez:
- Usa la contraseña temporal que recibiste
- El sistema te pedirá cambiar tu contraseña
- **Importante**: Anota tu nueva contraseña en un lugar seguro

### ⚠️ ¿Olvidaste tu contraseña?

1. Haz clic en "¿Olvidaste tu contraseña?"
2. Ingresa tu correo electrónico
3. Revisa tu correo (también en spam/correo no deseado)
4. Sigue las instrucciones del correo para recuperarla

---

## 2. Página de Inicio

### 🏠 Panel Principal (Dashboard)

Al ingresar verás:

```
┌──────────────────────────────────────────┐
│  🏠 Panel de Operaciones    [🌧️/☀️]      │
├──────────────────────────────────────────┤
│  RESUMEN RÁPIDO                          │
│  📊 Lotes Activos  │ 🟢 Potreros OK     │
│  ⚠️  Alertas       │ 💚 Estado General  │
├──────────────────────────────────────────┤
│  MENÚ LATERAL                            │
│  • Panel de Control                      │
│  • Lotes                                 │
│  • Potreros                              │
│  • Movimientos                           │
│  • Pesajes                               │
│  • Forrajes                              │
└──────────────────────────────────────────┘
```

### 🧭 Navegación

**Menú Lateral Izquierdo**:
- **Panel de Control**: Vista general de toda la finca
- **Lotes**: Gestiona tus grupos de animales
- **Potreros**: Administra tus áreas de pastoreo
- **Movimientos**: Registra rotaciones de lotes
- **Pesajes**: Registra el peso de los animales
- **Forrajes**: (Próximamente) Gestión de pasturas

**Barra Superior**:
- **🌧️/☀️ Selector de Temporada**: Cambia entre época de lluvias y seca
- **🔔 Notificaciones**: Alertas importantes
- **👤 Tu Perfil**: Configuración de cuenta

---

## 3. Gestión de Lotes (Hatos)

### ¿Qué es un Lote?

Un **lote** es un grupo de animales que se mueven juntos por los potreros. Por ejemplo:
- Lote A: Vacas en producción
- Lote B: Novillas de levante
- Lote C: Toros reproductores

### ➕ Crear un Nuevo Lote

1. **Ve a "Lotes"** en el menú lateral
2. **Haz clic en "➕ Nuevo Lote"**
3. **Completa el formulario**:

   ```
   📋 Información del Lote
   
   Nombre del Lote: _____________ (Ej: "Lote Producción A")
   Cantidad de Animales: _______ (Ej: 50)
   Tipo de Animal: [Seleccionar ▼]
     • Vacas lecheras
     • Vacas de carne
     • Novillas
     • Toros
     • Terneros
   
   [Cancelar]  [✓ Crear Lote]
   ```

4. **Haz clic en "Crear Lote"**
5. **Verás confirmación**: "✓ Lote creado exitosamente"

### ✏️ Editar un Lote Existente

1. En la lista de lotes, busca el que quieres modificar
2. Haz clic en el **ícono de lápiz** ✏️
3. Modifica los datos necesarios
4. Haz clic en "Guardar Cambios"

### 📊 Ver Detalles de un Lote

Haz clic sobre cualquier lote para ver:
- Cantidad actual de animales
- Potrero donde está ubicado
- Fecha de última rotación
- Historial de movimientos
- Peso promedio (si hay pesajes registrados)

### 🗑️ Eliminar un Lote

⚠️ **Cuidado**: Solo puedes eliminar lotes sin movimientos registrados.

1. Haz clic en el **ícono de basura** 🗑️
2. Confirma la acción
3. El lote se eliminará permanentemente

---

## 4. Gestión de Potreros

### ¿Qué es un Potrero?

Un **potrero** es un área delimitada de pastoreo donde los animales consumen forraje. Cada potrero tiene:
- Tamaño en hectáreas
- Días mínimos de descanso (para regeneración del pasto)
- Estado: En uso, En descanso, Disponible

### ➕ Crear un Nuevo Potrero

1. **Ve a "Potreros"** en el menú lateral
2. **Haz clic en "➕ Nuevo Potrero"**
3. **Completa el formulario**:

   ```
   📋 Información del Potrero
   
   Nombre: _________________ (Ej: "Potrero Norte 1")
   Tamaño (ha): ____________ (Ej: 2.5)
   Días de Descanso: _______ (Ej: 30)
   Tipo de Pasto: __________ (Ej: "Brachiaria")
   
   [Cancelar]  [✓ Crear Potrero]
   ```

4. **Haz clic en "Crear Potrero"**

### 📍 Información Clave de Cada Potrero

En la lista de potreros verás:

```
🟢 Potrero Norte 1         2.5 ha
   └─ Descanso: 30 días | Estado: DISPONIBLE
   
🔴 Potrero Sur 3          1.8 ha
   └─ Descanso: 25 días | Estado: OCUPADO (Lote A)
   
🟡 Potrero Este 2         3.0 ha
   └─ Descanso: 35 días | Estado: EN DESCANSO (15 días)
```

**Colores**:
- 🟢 **Verde**: Disponible para recibir animales
- 🔴 **Rojo**: Ocupado actualmente
- 🟡 **Amarillo**: En periodo de descanso

### ✏️ Editar un Potrero

1. Haz clic en el **ícono de lápiz** ✏️ del potrero
2. Modifica los datos (tamaño, días de descanso, etc.)
3. Guarda los cambios

### ⚙️ Días de Descanso

Los **días de descanso** son críticos para la regeneración del pasto:
- **Época de lluvias**: 25-30 días (crece rápido)
- **Época seca**: 40-45 días (crece lento)

💡 **Consejo**: El sistema te alertará si un lote lleva demasiado tiempo en un potrero.

---

## 5. Panel de Movimientos

### ¿Qué es un Movimiento?

Un **movimiento** es cuando trasladas un lote de un potrero a otro. Es la base de la rotación regenerativa.

### ➕ Registrar un Nuevo Movimiento

1. **Ve a "Movimientos"** en el menú lateral
2. **Haz clic en "➕ Nuevo Movimiento"**
3. **Completa el formulario**:

   ```
   📋 Registrar Movimiento
   
   Lote: [Seleccionar ▼]
     • Lote A (50 vacas)
     • Lote B (30 novillas)
     • Lote C (20 vacas)
   
   Potrero Destino: [Seleccionar ▼]
     • 🟢 Potrero Norte 1 (DISPONIBLE)
     • 🟢 Potrero Este 5 (DISPONIBLE)
   
   Fecha de Entrada: [09/01/2026] [📅]
   
   Notas (opcional): ________________________
   
   [Cancelar]  [✓ Registrar Movimiento]
   ```

4. **Haz clic en "Registrar Movimiento"**
5. **Confirmación**: "✓ Movimiento registrado. El lote ha sido trasladado."

### 🔄 ¿Cuándo Debo Rotar?

El sistema te ayuda a decidir:
- **Alertas automáticas**: Te avisa cuando un lote lleva demasiado tiempo
- **Estado visual**: Colores en el dashboard indican urgencia
- **Días ocupados**: Compara con los días recomendados

### 📋 Ver Historial de Movimientos

En la página de Movimientos verás una tabla:

```
┌─────────────┬──────────────┬────────────┬────────────┬──────────┐
│ Lote        │ Potrero      │ Entrada    │ Salida     │ Duración │
├─────────────┼──────────────┼────────────┼────────────┼──────────┤
│ Lote A      │ Potrero N-1  │ 05/01/2026 │ 08/01/2026 │ 3 días   │
│ Lote B      │ Potrero S-3  │ 01/01/2026 │ -          │ 9 días   │
│ Lote A      │ Potrero E-2  │ 28/12/2025 │ 05/01/2026 │ 8 días   │
└─────────────┴──────────────┴────────────┴────────────┴──────────┘
```

**Columnas**:
- **Lote**: Qué grupo de animales
- **Potrero**: Dónde están/estuvieron
- **Entrada**: Cuándo entraron
- **Salida**: Cuándo salieron (vacío si aún están)
- **Duración**: Total de días en el potrero

### 🔍 Filtros Disponibles

Puedes filtrar por:
- **Lote específico**: Ver solo movimientos del "Lote A"
- **Potrero específico**: Ver historial del "Potrero Norte 1"
- **Rango de fechas**: Movimientos del último mes
- **Estado**: Solo movimientos activos o completados

---

## 6. Dashboard Operativo

### 📊 Estado Actual de la Finca

En la parte superior del panel de movimientos encontrarás el **Dashboard Operativo** con 4 indicadores clave:

```
┌────────────────────────────────────────────────────┐
│  ESTADO ACTUAL DE LA FINCA                         │
├──────────────┬──────────────┬──────────────┬───────┤
│ 🐮 LOTES     │ 🟢 POTREROS  │ ⚠️  ALERTAS  │ 💚    │
│              │              │              │ SALUD │
│    8         │    12        │    2         │       │
│  Activos     │  Descansando │  Activas     │ Óptimo│
└──────────────┴──────────────┴──────────────┴───────┘
```

### 📈 ¿Qué Significa Cada Indicador?

#### 🐮 Lotes Activos
- **Número**: Cuántos lotes están en potreros
- **Verde**: Todo normal
- **Amarillo**: Algún lote necesita revisión

#### 🟢 Potreros en Descanso
- **Número**: Cuántos potreros están regenerándose
- **Ideal**: Al menos 60-70% de tus potreros en descanso

#### ⚠️ Alertas Activas
- **Número**: Cuántos lotes exceden el tiempo recomendado
- **Verde (0)**: ¡Perfecto! No hay alertas
- **Amarillo (1-2)**: Atención requerida pronto
- **Rojo (3+)**: Acción urgente necesaria

#### 💚 Estado General de la Finca
- **Óptimo** 🟢: Todo bajo control
- **Precaución** 🟡: Algunas áreas necesitan atención
- **Crítico** 🔴: Se requiere acción inmediata

---

## 7. Alertas de Sobrepastoreo

### ⚠️ ¿Qué es el Sobrepastoreo?

El **sobrepastoreo** ocurre cuando un lote permanece demasiado tiempo en un potrero, dañando el pasto y el suelo. El sistema detecta esto automáticamente.

### 🚨 Tipos de Alertas

Las alertas se clasifican por severidad:

```
┌─────────────────────────────────────────┐
│  ⚠️  ALERTAS DE SOBREPASTOREO          │
├─────────────────────────────────────────┤
│  🔴 CRÍTICA - Lote A en Potrero Norte 1 │
│     45 días ocupados (Máx: 30 días)     │
│     Exceso: 15 días (50%)               │
│     [📱 Notificar WhatsApp]             │
├─────────────────────────────────────────┤
│  🟠 ALTA - Lote B en Potrero Sur 3      │
│     38 días ocupados (Máx: 30 días)     │
│     Exceso: 8 días (27%)                │
│     [📱 Notificar WhatsApp]             │
├─────────────────────────────────────────┤
│  🟡 MEDIA - Lote C en Potrero Este 2    │
│     33 días ocupados (Máx: 30 días)     │
│     Exceso: 3 días (10%)                │
│     [📱 Notificar WhatsApp]             │
└─────────────────────────────────────────┘
```

#### 🔴 Alerta CRÍTICA
- **Qué significa**: El lote lleva 50% o más de exceso
- **Qué hacer**: **¡Rotar INMEDIATAMENTE!**
- **Riesgo**: Daño severo al pasto y compactación del suelo

#### 🟠 Alerta ALTA
- **Qué significa**: Exceso entre 25-49%
- **Qué hacer**: Rotar en las próximas 24-48 horas
- **Riesgo**: Reducción en calidad del rebrote

#### 🟡 Alerta MEDIA
- **Qué significa**: Exceso menor a 25%
- **Qué hacer**: Planificar rotación esta semana
- **Riesgo**: Leve presión sobre el pasto

### 🔄 Actualización Automática

Las alertas se actualizan cada **5 minutos** automáticamente. No necesitas refrescar la página.

### ✅ ¿Cómo Resolver una Alerta?

1. **Identifica el lote y potrero** en la alerta
2. **Ve a "Movimientos"** > "Nuevo Movimiento"
3. **Selecciona el lote** con alerta
4. **Elige un potrero disponible** (verde)
5. **Registra el movimiento**
6. La alerta desaparecerá automáticamente

---

## 8. Selector de Temporada

### 🌧️☀️ ¿Para Qué Sirve?

El **Selector de Temporada** ajusta las recomendaciones según el clima:

```
┌────────────────────────────────┐
│  [🌧️ Temporada de Lluvias]    │  ← Activo
│  [☀️ Temporada Seca]           │
└────────────────────────────────┘
```

### 🌧️ Temporada de Lluvias (Invierno)

- **Cuándo**: Meses de más lluvia (abril-noviembre típicamente)
- **Factor**: 1.0x (normal)
- **Características**:
  - El pasto crece más rápido
  - Descanso de 25-30 días
  - Mayor capacidad de carga

### ☀️ Temporada Seca (Verano)

- **Cuándo**: Meses de menos lluvia (diciembre-marzo típicamente)
- **Factor**: 1.5x (ajustado)
- **Características**:
  - El pasto crece más lento
  - Descanso de 40-50 días
  - Menor capacidad de carga

### 🔄 Cambiar de Temporada

1. **Busca el selector** en la esquina superior derecha
2. **Haz clic** en el botón de la temporada deseada
3. El sistema guarda tu selección automáticamente
4. Las validaciones se ajustan al instante

💡 **Consejo**: Cambia la temporada cuando notes cambio significativo en el clima.

---

## 9. Exportar Reportes

### 📄 ¿Para Qué Exportar?

Los reportes te permiten:
- Llevar registros físicos
- Compartir información con asesores
- Análisis en Excel
- Auditorías y trazabilidad

### 📊 Exportar a PDF

1. **Ve a "Movimientos"**
2. **Aplica filtros** si deseas (opcional):
   - Rango de fechas
   - Lote específico
   - Potrero específico
3. **Haz clic en el botón** 📄 **"Exportar PDF"**
4. **Espera unos segundos**
5. El archivo se descarga automáticamente

**El PDF incluye**:
- Encabezado profesional: "Reporte de Movimientos - Ganadería Regenerativa"
- Fecha de generación
- Filtros aplicados
- Tabla completa con todos los movimientos
- Código de auditoría (traceId)
- Numeración de páginas

### 📊 Exportar a Excel

1. **Ve a "Movimientos"**
2. **Aplica filtros** si deseas
3. **Haz clic en el botón** 📊 **"Exportar Excel"**
4. El archivo `.xlsx` se descarga

**El Excel incluye**:
- Columnas: Lote, Potrero, Entrada, Salida, Duración, Estado, Referencia
- Formato de tabla con encabezados en azul
- Listo para análisis con fórmulas
- Compatible con Excel, Google Sheets, LibreOffice

### 💡 Consejos para Reportes

- **Exporta semanalmente**: Ten respaldo de tus datos
- **Usa filtros**: Reportes específicos son más útiles
- **Guarda con nombres descriptivos**: Ej: `Movimientos_Enero_2026.pdf`
- **Comparte con tu equipo**: Facilita la coordinación

### 📋 Ejemplo de Uso

**Escenario**: Necesitas mostrar al veterinario el historial del Lote A

1. Ve a Movimientos
2. Filtra por "Lote A"
3. Selecciona últimos 3 meses
4. Exporta a PDF
5. Envía por correo o WhatsApp

---

## 10. Notificaciones WhatsApp

### 📱 Alertas Instantáneas

Cada alerta de sobrepastoreo tiene un **botón de WhatsApp** que te permite compartir la información rápidamente.

### 🚀 Cómo Usar

1. **Identifica la alerta** que quieres compartir
2. **Haz clic en** 📱 **"Notificar WhatsApp"**
3. **Se abre WhatsApp** (web o app) con mensaje pre-llenado:

   ```
   ⚠️ ALERTA DE SOBREPASTOREO
   
   Lote: Lote A
   Potrero: Potrero Norte 1
   Días: 45 (Máximo permitido: 30)
   Exceso: 15 días
   Severidad: CRÍTICA
   
   Se requiere rotación inmediata.
   ```

4. **Selecciona el contacto** o grupo (tu equipo, capataz, etc.)
5. **Envía el mensaje**

### 👥 Usos Recomendados

- **Alertar al capataz**: Cuando detectes una alerta crítica
- **Coordinar rotaciones**: Avisar al equipo que debe preparar potrero
- **Informar al dueño**: Situaciones que requieren decisión
- **Registro en grupo**: Mantener al equipo informado

### 💡 Consejo Pro

Crea un **grupo de WhatsApp** llamado "Equipo Ganadería" y usa este botón para:
- Coordinar movimientos del día
- Compartir alertas urgentes
- Mantener trazabilidad de decisiones

---

## 11. Registro de Pesajes

### ⚖️ ¿Por Qué Registrar Pesajes?

Los pesajes te ayudan a:
- Monitorear ganancia de peso
- Evaluar la calidad del forraje
- Tomar decisiones de venta o compra
- Calcular el peso promedio del lote

### ➕ Registrar un Nuevo Pesaje

1. **Ve a "Pesajes"** en el menú lateral
2. **Haz clic en "➕ Nuevo Pesaje"**
3. **Completa el formulario**:

   ```
   📋 Registrar Pesaje
   
   Lote: [Seleccionar ▼]
     • Lote A (50 vacas)
   
   Fecha del Pesaje: [09/01/2026] [📅]
   
   Peso Promedio (kg): _______ (Ej: 450)
   
   Cantidad Pesada: __________ (Ej: 50)
   
   Notas (opcional): ________________________
   
   [Cancelar]  [✓ Registrar Pesaje]
   ```

4. **Haz clic en "Registrar Pesaje"**

### 📊 Ver Historial de Pesajes

```
┌────────────┬─────────────┬──────────────┬────────────────┐
│ Fecha      │ Lote        │ Peso Promedio│ Ganancia Diaria│
├────────────┼─────────────┼──────────────┼────────────────┤
│ 09/01/2026 │ Lote A      │ 450 kg       │ +0.8 kg/día    │
│ 25/12/2025 │ Lote A      │ 438 kg       │ +0.7 kg/día    │
│ 10/12/2025 │ Lote A      │ 428 kg       │ -              │
└────────────┴─────────────┴──────────────┴────────────────┘
```

### 📈 Analizar Tendencias

El sistema calcula automáticamente:
- **Ganancia diaria**: (Peso actual - Peso anterior) / días transcurridos
- **Tendencia**: Si está mejorando o disminuyendo
- **Comparación con promedio histórico**

### 💡 Mejores Prácticas

- **Pesa regularmente**: Cada 15-30 días es ideal
- **Mismo horario**: Pesa siempre en la mañana (ayuno)
- **Condiciones similares**: Evita después de lluvia o estrés
- **Registra inmediatamente**: No confíes solo en la memoria

---

## 12. Preguntas Frecuentes

### ❓ Uso General

**P: ¿Puedo usar el sistema en mi celular?**  
R: Sí, la aplicación es responsive y funciona en celulares, tablets y computadoras.

**P: ¿Se guardan mis datos automáticamente?**  
R: Sí, cada acción se guarda inmediatamente en la base de datos.

**P: ¿Puedo usar el sistema sin internet?**  
R: No, necesitas conexión a internet para acceder y registrar datos.

**P: ¿Varios usuarios pueden trabajar al mismo tiempo?**  
R: Sí, el sistema soporta múltiples usuarios simultáneos.

### ❓ Movimientos y Rotaciones

**P: ¿Qué pasa si registro mal un movimiento?**  
R: Contacta al administrador para corregirlo. Próximamente podrás editarlos tú mismo.

**P: ¿Puedo mover un lote a varios potreros a la vez?**  
R: No, cada lote solo puede estar en un potrero. Si dividiste el lote, crea dos lotes separados.

**P: ¿Por qué no aparece mi potrero en la lista?**  
R: El potrero puede estar ocupado por otro lote. Verifica en "Potreros" su estado actual.

**P: ¿Cuántos días debe descansar un potrero?**  
R: Depende de la época:
- Lluvias: 25-30 días
- Seca: 40-50 días

### ❓ Alertas

**P: ¿Cada cuánto se actualizan las alertas?**  
R: Automáticamente cada 5 minutos.

**P: ¿Cómo elimino una alerta?**  
R: Las alertas se eliminan automáticamente cuando rotas el lote a otro potrero.

**P: ¿Puedo cambiar los días máximos permitidos?**  
R: Sí, edita el potrero y ajusta "Días de Descanso".

### ❓ Exportación

**P: ¿Dónde se guardan los archivos exportados?**  
R: En la carpeta de "Descargas" de tu navegador.

**P: ¿Puedo exportar datos de hace meses?**  
R: Sí, usa los filtros de fecha para seleccionar cualquier periodo.

**P: ¿El PDF se puede imprimir?**  
R: Sí, está optimizado para impresión en papel tamaño carta.

### ❓ Pesajes

**P: ¿Debo pesar todos los animales?**  
R: Idealmente sí, pero puedes pesar una muestra representativa (mínimo 30%).

**P: ¿Qué hago si hay diferentes pesos en el lote?**  
R: Registra el peso promedio del lote completo.

**P: ¿Puedo ver gráficos de evolución de peso?**  
R: Esta función está en desarrollo y estará disponible próximamente.

### ❓ Soporte Técnico

**P: ¿Qué hago si encuentro un error?**  
R: Anota:
- Qué estabas haciendo
- Mensaje de error (si apareció)
- Toma captura de pantalla
- Contacta al administrador o soporte técnico

**P: ¿Cómo sugiero mejoras?**  
R: Usa el botón "Feedback" o contacta al equipo de desarrollo.

**P: ¿Hay tutoriales en video?**  
R: Próximamente habrá videos tutoriales en el canal de YouTube del proyecto.

---

## 📞 Contacto y Soporte

### 🆘 ¿Necesitas Ayuda?

**Soporte Técnico**:
- 📧 Email: soporte@tuempresa.com
- 📱 WhatsApp: +57 XXX XXX XXXX
- ⏰ Horario: Lunes a Viernes, 8:00 AM - 5:00 PM

**Capacitación**:
- Solicita capacitación presencial o virtual
- Talleres grupales disponibles
- Material de apoyo en PDF

### 💡 Recursos Adicionales

- **Video Tutoriales**: [YouTube Channel]
- **Blog**: Consejos de ganadería regenerativa
- **Comunidad**: Grupo de WhatsApp de usuarios
- **Actualizaciones**: Boletín mensual con nuevas funciones

---

## ✨ Consejos para Aprovechar al Máximo el Sistema

### 🎯 Rutina Diaria Recomendada

**Por la Mañana (5-10 minutos)**:
1. Abre el Dashboard
2. Revisa las alertas del día
3. Planifica rotaciones necesarias
4. Verifica estado general de la finca

**Al Realizar Rotaciones**:
1. Registra el movimiento inmediatamente
2. Agrega notas si hay algo especial
3. Verifica que la alerta se resuelva

**Semanalmente**:
1. Revisa el historial de movimientos
2. Exporta reporte semanal (PDF)
3. Analiza tendencias de ocupación
4. Planifica rotaciones de la próxima semana

**Mensualmente**:
1. Exporta reporte mensual completo
2. Realiza pesajes de control
3. Revisa que todos los potreros hayan descansado
4. Evalúa resultados con el equipo

### 🌟 Mejores Prácticas

✅ **Registra todo al instante**: No dejes para después  
✅ **Usa notas**: Documenta observaciones importantes  
✅ **Revisa alertas diario**: Previene sobrepastoreo  
✅ **Cambia temporada**: Ajusta según el clima real  
✅ **Exporta regularmente**: Ten respaldos de datos  
✅ **Comparte con el equipo**: Mantén a todos informados  
✅ **Analiza tendencias**: Usa los datos para mejorar  
✅ **Capacita a otros**: Enseña al equipo a usar el sistema  

---

## 🎓 Glosario de Términos

- **Lote (Hato)**: Grupo de animales que se mueven juntos
- **Potrero**: Área delimitada de pastoreo
- **Movimiento**: Traslado de un lote a otro potrero
- **Rotación**: Práctica de mover lotes entre potreros
- **Descanso**: Periodo sin animales para regeneración del pasto
- **Sobrepastoreo**: Exceso de tiempo de un lote en un potrero
- **Alerta**: Notificación de situación que requiere atención
- **Dashboard**: Panel de control con información general
- **KPI**: Indicador Clave de Desempeño (métricas importantes)
- **Temporada**: Época del año (lluvias o seca) que afecta manejo
- **Forraje**: Pasto o vegetación que consumen los animales
- **Carga Animal**: Cantidad de animales por hectárea
- **Ganadería Regenerativa**: Sistema que mejora el suelo y pasto

---

## 📖 Apéndice: Atajos de Teclado

Para usuarios avanzados que desean trabajar más rápido:

| Atajo | Acción |
|-------|--------|
| `Ctrl + N` | Nuevo movimiento |
| `Ctrl + E` | Exportar (último usado) |
| `Ctrl + F` | Buscar/Filtrar |
| `Ctrl + R` | Refrescar dashboard |
| `Esc` | Cerrar modal o formulario |
| `Tab` | Navegar entre campos |
| `Enter` | Confirmar acción |

---

## 📅 Historial de Versiones del Manual

- **v1.0** - 09/01/2026: Manual inicial con todas las funcionalidades de FASE 4
- Próximas actualizaciones incluirán: gestión de forrajes, reportes avanzados, módulo financiero

---

**¡Gracias por usar el Sistema de Ganadería Regenerativa!**

Esperamos que esta herramienta te ayude a llevar tu finca a un nuevo nivel de productividad sostenible. 🌱🐮

---

*Manual creado con ❤️ para los productores que cuidan la tierra mientras producen.*
