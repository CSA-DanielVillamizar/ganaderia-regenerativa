# Módulo de Exportación de Reportes

## Descripción General

Módulo especializado en la generación de reportes técnicos en múltiples formatos (PDF, Excel, CSV, JSON) para facilitar análisis, auditoría y toma de decisiones basada en datos.

## Formatos Soportados

### 1. **Excel (.xlsx)**
- ✅ Múltiples hojas: Resumen + Secciones detalladas
- ✅ Formato tabular optimizado
- ✅ Compatible con Excel, Google Sheets, LibreOffice
- ✅ Ideal para análisis avanzados y gráficos

### 2. **CSV (.csv)**
- ✅ Formato texto separado por comas
- ✅ Compatible con cualquier editor de datos
- ✅ Fácil de integrar con otros sistemas
- ✅ Ideal para importación a bases de datos

### 3. **PDF (.pdf)** 
- ✅ HTML renderizado con estilos profesionales
- ✅ Optimizado para impresión
- ✅ Incluye logo, encabezados, tablas formateadas
- ✅ Ideal para presentaciones formales

### 4. **JSON (.json)**
- ✅ Estructura jerárquica completa
- ✅ Máxima flexibilidad para procesamiento
- ✅ Compatible con APIs y sistemas
- ✅ Ideal para integración técnica

## Tipos de Reportes

### 1. Reporte de Ciclo

**Endpoint**: `GET /api/v1/export/cycles/:cycleId?format=excel`

**Contenido**:
- ID y datos básicos del ciclo
- Rebaño asociado
- Todos los movimientos (entrada/salida)
- Días de ocupación por potrero
- Estado actual

**Ejemplo**:
```bash
curl -X GET "http://localhost:3001/api/v1/export/cycles/cycle-123?format=xlsx" \
  -H "Authorization: Bearer <token>" \
  -o "ciclo-reporte.xlsx"
```

---

### 2. Reporte de Pesajes

**Endpoint**: `GET /api/v1/export/weighings?farmId=farm-1&format=csv&startDate=2024-01-01&endDate=2024-01-31`

**Contenido**:
- Estadísticas: promedio, mínimo, máximo, rango
- Pesajes detallados por animal
- Fechas y observaciones
- Identificación de rebaños

**Parámetros**:
- `farmId`: ID de la finca (requerido)
- `format`: pdf | xlsx | csv | json (requerido)
- `startDate`: Fecha inicio en ISO 8601 (opcional, default: últimos 30 días)
- `endDate`: Fecha fin en ISO 8601 (opcional, default: hoy)

**Ejemplo de Respuesta (CSV)**:
```
PESAJES

Animal,"Rebaño","Peso (kg)","Fecha","Observaciones"
animal-1,"Herd-1",520,"01/01/2024","-"
animal-2,"Herd-1",530,"01/01/2024","-"
animal-3,"Herd-1",525,"01/01/2024","Bajo peso"
```

---

### 3. Reporte de Movimientos

**Endpoint**: `GET /api/v1/export/movements?farmId=farm-1&format=pdf`

**Contenido**:
- Estadísticas: total movimientos, completados, en progreso
- Ocupación promedio en días
- Número de potreros utilizados
- Detalle de cada movimiento

**Parámetros**:
- `farmId`: ID de la finca (requerido)
- `format`: pdf | xlsx | csv | json (requerido)
- `startDate`: Fecha inicio (opcional, default: últimos 90 días)
- `endDate`: Fecha fin (opcional, default: hoy)

---

### 4. Reporte de Aforos

**Endpoint**: `GET /api/v1/export/forage?farmId=farm-1&format=excel&startDate=2024-01-01`

**Contenido**:
- Estadísticas: MS promedio, mínimo, máximo
- Aforos detallados por potrero
- Proteína cruda (CP%) e IVMS cuando disponible
- Análisis de tendencias de forraje

**Parámetros**:
- `farmId`: ID de la finca (requerido)
- `format`: pdf | xlsx | csv | json (requerido)
- `startDate`: Fecha inicio (opcional, default: últimos 90 días)
- `endDate`: Fecha fin (opcional, default: hoy)

---

## Ejemplos de Uso Completos

### Ejemplo 1: Exportar Ciclo a Excel
```bash
# Obtener token
TOKEN=$(curl -X POST "http://localhost:3001/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.accessToken')

# Exportar ciclo
curl -X GET "http://localhost:3001/api/v1/export/cycles/cycle-123?format=xlsx" \
  -H "Authorization: Bearer $TOKEN" \
  -o "ciclo-enero-2024.xlsx"

# Resultado: ciclo-enero-2024.xlsx descargado localmente
```

### Ejemplo 2: Exportar Pesajes como CSV
```bash
curl -X GET "http://localhost:3001/api/v1/export/weighings?farmId=farm-1&format=csv" \
  -H "Authorization: Bearer $TOKEN" \
  -o "pesajes-enero.csv"

# Para período específico
curl -X GET "http://localhost:3001/api/v1/export/weighings?farmId=farm-1&format=csv&startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer $TOKEN" \
  -o "pesajes-enero-2024.csv"
```

### Ejemplo 3: Exportar Movimientos como PDF
```bash
curl -X GET "http://localhost:3001/api/v1/export/movements?farmId=farm-1&format=pdf" \
  -H "Authorization: Bearer $TOKEN" \
  -o "movimientos-trimestre.pdf"
```

### Ejemplo 4: Exportar Aforos como JSON
```bash
# JSON es ideal para integración con sistemas
curl -X GET "http://localhost:3001/api/v1/export/forage?farmId=farm-1&format=json" \
  -H "Authorization: Bearer $TOKEN" \
  -o "aforos-raw.json"

# Procesar con jq
curl -s -X GET "http://localhost:3001/api/v1/export/forage?farmId=farm-1&format=json" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.sections[1].data[] | select(.MS > 1500)'
```

---

## Integración en Frontend (Next.js)

### Componente React para Descarga
```typescript
// components/ExportButton.tsx
import { useState } from 'react';

export function ExportButton({ farmId, type }: { farmId: string; type: 'weighings' | 'movements' | 'forage' }) {
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState<'pdf' | 'xlsx' | 'csv'>('xlsx');

  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/v1/export/${type}?farmId=${farmId}&format=${format}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-${type}-${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
    } catch (error) {
      console.error('Error exportando:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <select value={format} onChange={(e) => setFormat(e.target.value as any)}>
        <option value="pdf">PDF</option>
        <option value="xlsx">Excel</option>
        <option value="csv">CSV</option>
      </select>
      <button onClick={handleExport} disabled={loading}>
        {loading ? 'Exportando...' : 'Descargar Reporte'}
      </button>
    </div>
  );
}
```

### Uso en Página
```typescript
// pages/farm/[id]/reports.tsx
import { ExportButton } from '@/components/ExportButton';

export default function ReportsPage({ farmId }: { farmId: string }) {
  return (
    <div>
      <h1>Reportes de Finca</h1>
      
      <section>
        <h2>Pesajes</h2>
        <ExportButton farmId={farmId} type="weighings" />
      </section>
      
      <section>
        <h2>Movimientos</h2>
        <ExportButton farmId={farmId} type="movements" />
      </section>
      
      <section>
        <h2>Aforos</h2>
        <ExportButton farmId={farmId} type="forage" />
      </section>
    </div>
  );
}
```

---

## Estructura de Datos en Reportes

### Estructura Común
```json
{
  "title": "Reporte de Pesajes",
  "summary": {
    "Total Pesajes": 150,
    "Peso Promedio (kg)": 520.5,
    "Peso Mínimo (kg)": 380,
    "Peso Máximo (kg)": 620
  },
  "sections": [
    {
      "name": "Estadísticas",
      "data": [ /* Array de objetos */ ]
    },
    {
      "name": "Pesajes Detallados",
      "data": [ /* Array de objetos */ ]
    }
  ],
  "exportDate": "2024-01-31T12:00:00.000Z"
}
```

### Excel: Múltiples Hojas
```
📊 Hoja 1: Resumen
   - Datos agregados principales

📊 Hoja 2: Estadísticas
   - Métricas calculadas

📊 Hoja 3: Detallados
   - Registro completo de cada entrada
```

---

## Validaciones

1. **Autenticación**: Requiere JwtAuthGuard
2. **Autorización**: Usuario debe tener acceso a la finca
3. **Formato**: Solo acepta pdf | xlsx | csv | json
4. **Fechas**: Deben estar en formato ISO 8601
5. **FarmId**: Requerido para reportes de finca

---

## Manejo de Errores

### Error 400 - Bad Request
```bash
curl -X GET "http://localhost:3001/api/v1/export/weighings?farmId=" \
  -H "Authorization: Bearer $TOKEN"

# Respuesta
{
  "statusCode": 400,
  "message": "farmId es requerido",
  "error": "Bad Request"
}
```

### Error 401 - Unauthorized
```bash
curl -X GET "http://localhost:3001/api/v1/export/weighings?farmId=farm-1&format=csv"

# Respuesta (sin token)
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### Error 403 - Forbidden
```bash
# Usuario sin acceso a finca
{
  "statusCode": 403,
  "message": "No tienes acceso a esta finca"
}
```

---

## Performance y Límites

- **Tamaño máximo reporte**: ~50 MB (depende de servidor)
- **Tiempo máximo generación**: ~30 segundos
- **Memoria**: ~100 MB por reporte concurrente
- **Concurrencia**: Sin límite específico (depende de capacidad servidor)

**Optimizaciones**:
- Usar CSV para grandes volúmenes de datos
- Limitar rango de fechas en consultas
- Hacer exportaciones en momentos de bajo uso

---

## Casos de Uso

### 1. Auditoría y Trazabilidad
```
Generar reporte mensual de movimientos → PDF → Archivar
```

### 2. Análisis Técnico
```
Exportar pesajes → CSV → Importar a Excel → Crear gráficos
```

### 3. Integración con Sistemas Externos
```
Exportar aforos → JSON → API externa → Dashboard tercero
```

### 4. Presentaciones Ejecutivas
```
Ciclo completo → PDF impreso → Presentación física
```

---

## Futuros Desarrollos

- [ ] Reportes combinados (múltiples tipos)
- [ ] Plantillas personalizables por usuario
- [ ] Programación automática de reportes
- [ ] Envío por correo electrónico
- [ ] Gráficos embebidos en PDF
- [ ] Watermark de seguridad
- [ ] Caché de reportes frecuentes

---

## Dependencias

- `xlsx`: Generación de archivos Excel
- `express`: Framework REST (para Response)
- `Prisma`: Consultas a base de datos

## Testing

```bash
# Ejecutar pruebas unitarias (cuando se agreguen)
npm test -- export.service

# Validar endpoint
curl -X GET "http://localhost:3001/api/v1/export/weighings?farmId=test&format=csv" \
  -H "Authorization: Bearer test-token" \
  -v
```

---

## Soporte

Para reportes adicionales o mejoras, contacta al equipo de desarrollo.
