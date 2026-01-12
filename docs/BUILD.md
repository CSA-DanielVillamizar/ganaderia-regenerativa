# Guía de Build, Test y Desarrollo

## Problema del Loop de Turbo en Windows

### Síntoma
Al ejecutar `npm run build` o `npm run test` en el root, Turbo mostraba el error:
```
recursive_turbo_invocations
x Your `package.json` script looks like it invokes a Root Task (//#build),
  creating a loop of `turbo` invocations.
```

### Causa Raíz
Turborepo 1.12.4 en Windows tenía un bug en la detección de loops recursivos. El root package.json invocaba `turbo run build`, que Turbo a su vez intentaba ejecutar como una tarea raíz, creando una falsa detección de recursión. Además:
- Faltaba declaración `packageManager` en root
- Faltaba declaración `workspaces` en root
- Turbo.json usaba sintaxis deprecada `pipeline` en lugar de `tasks` (Turbo v2+)

### Solución Implementada

#### 1. Actualización de Turbo
```json
"turbo": "^1.12.4" → "turbo": "^2.7.3"
```
Turbo 2.7.3 implementó mejoras significativas en la detección de loops.

#### 2. Configuración Root (package.json)
```json
{
  "packageManager": "npm@10.5.0",
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "build": "npm run build:packages",        // NO invoca turbo
    "test": "npm run test:all",               // NO invoca turbo
    "build:packages": "npm run build:shared && npm run build:api && npm run build:web",
    "test:unit": "cd apps/api && npm run test:unit",
    "test:integration": "cd apps/api && npm run test:api",
    "test:all": "npm run test:unit && npm run test:integration",
    "turbo:build": "turbo build",             // Para invocar turbo explícitamente
    "turbo:test": "turbo test",
    "turbo:dev": "turbo dev --parallel"
  }
}
```

**Cambio Crítico**: Los scripts raíz (`build`, `test`) ahora delegan a los paquetes individuales **sin invocar turbo**. Esto evita la recursión detectable por Turbo.

#### 3. Configuración Turbo (turbo.json)
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalEnv": [],
  "tasks": {
    "build": {
      "outputs": ["dist/**", ".next/**", "build/**"],
      "dependsOn": ["^build"],
      "cache": true
    },
    "test": {
      "outputs": ["coverage/**"],
      "cache": true,
      "dependsOn": ["build"]
    },
    ...
  }
}
```

**Cambios**:
- `pipeline` → `tasks` (sintaxis Turbo 2.x)
- Agregado `cache`, `outputs`, `dependsOn` explícitos
- Las tareas solo definen comportamiento para **paquetes**, no para el root

#### 4. Separación Unit vs Integration
En `apps/api/package.json`:
```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest src --testPathIgnorePatterns=integration",
    "test:api": "jest --testPathPattern=integration"
  }
}
```

Y en root:
```json
{
  "scripts": {
    "test:unit": "cd apps/api && npm run test:unit",
    "test:integration": "cd apps/api && npm run test:api",
    "test:all": "npm run test:unit && npm run test:integration"
  }
}
```

### Validación en Windows PowerShell

#### Versiones
```powershell
PS> node -v
v24.11.0

PS> npm -v
11.6.1
```
✅ npm 11.6.1 > 10.5.0 (requerido)

#### Tests de Funcionalidad
```powershell
# Build del root (delegación)
PS> npm run build
✅ EXIT CODE: 0
   - packages/shared: tsc
   - apps/api: nest build
   - apps/web: next build

# Test unitarios
PS> npm run test:unit
✅ Test Suites: 6 passed, 6 total
   Tests: 47 passed, 47 total

# Test de integración
PS> npm run test:integration
✅ Test Suites: 2 passed, 2 total
   Tests: 9 passed, 9 total

# Test completo
PS> npm run test
✅ Runs test:unit && test:integration
   Total: 8 suites, 56 tests passed

# Turbo build
PS> npm run turbo:build
✅ Tasks: 3 successful, 3 total
   Time: 37.535s

# Turbo build con filter
PS> npx turbo build --filter=@ganaderia/api
✅ @ganaderia/api:build: cache miss, executing...
   Tasks: 1 successful, 1 total
```

### Verificación de Consistencia

#### Workspaces
```json
"workspaces": ["apps/*", "packages/*"]
```
✅ Detecta automáticamente:
- `apps/api` (@ganaderia/api)
- `apps/web` (@ganaderia/web)
- `packages/shared` (@ganaderia/shared)

#### packageManager
```json
"packageManager": "npm@10.5.0"
```
✅ Requerido por Turbo 2.7.3 para:
- Detectar workspace correctamente
- Validar versión mínima de npm
- Mejor integración con lockfile

#### Sin Bash
✅ Todos los scripts funcionan en PowerShell:
- No usan pipes (`|`) complejos
- No usan `||` (utilizan `&&` para secuencial)
- No usan `|| true` (saltar errores si es crítico)

## Comandos Soportados

| Comando | Tipo | Descripción | Cuándo Usar |
|---------|------|-------------|------------|
| `npm run build` | Delegación | Build secuencial: shared → api → web | **Dev/CI predeterminado** |
| `npm run test:unit` | Delegación | Solo tests unitarios (47 tests) | Development, feedback rápido |
| `npm run test:integration` | Delegación | Solo tests de integración (9 tests) | Pre-commit, validación DB |
| `npm run test` | Delegación | test:unit + test:integration (56 total) | CI/CD, pre-push |
| `npm run test:all` | Alias | Igual a `npm run test` | Legibilidad |
| `npm run dev` | Delegación | Dev en paralelo: api, web, shared | Development activo |
| `npm run turbo:build` | Turbo directo | Build con Turbo CLI | Scripts avanzados, filter |
| `npm run turbo:test` | Turbo directo | Test con Turbo CLI | Scripts avanzados, cache |
| `npm run turbo:dev` | Turbo directo | Dev con Turbo CLI | Parallelismo avanzado |
| `npx turbo build --filter=@ganaderia/api` | Turbo CLI | Build solo de api | Optimización, targets específicos |

## Estructura de Dependencias

```
Root (ganaderia-regenerativa)
├── apps/
│   ├── api (@ganaderia/api)
│   │   └── Depende de: @ganaderia/shared
│   └── web (@ganaderia/web)
│       └── Depende de: @ganaderia/shared
└── packages/
    └── shared (@ganaderia/shared)
        └── Sin dependencias internas

turbo.json:
  build:
    dependsOn: ["^build"]  # Construye dependencias primero
  
  test:
    dependsOn: ["build"]   # Requiere build antes de tests
```

## Reproducción y Verificación

### Si el error vuelve a aparecer:

1. **Verificar archivo editado accidentalmente**:
   ```powershell
   # Confirmar que root scripts NO invocan "turbo"
   cat package.json | Select-String -Pattern '"turbo' | Select-String -Pattern '"build"|"test"'
   ```

2. **Verificar turbo.json**:
   ```powershell
   # Confirmar que es "tasks", no "pipeline"
   cat turbo.json | Select-String -Pattern '"tasks"'
   ```

3. **Limpiar cache**:
   ```powershell
   rm -r .turbo
   npm install
   npm run build
   ```

4. **Versiones**:
   ```powershell
   npm list turbo
   npm -v
   node -v
   ```

### Comandos de Validación Diaria

```powershell
# Full validation suite
npm run build && npm run test && npm run turbo:build

# Rápido (dev)
npm run test:unit && npm run build:api

# Pre-commit
npm run test:all && npm run lint

# Pre-push
npm run build && npm run test && npm run lint
```

---

**Última actualización**: 11 de enero 2026  
**Turbo versión**: 2.7.3  
**Node versión**: 24.11.0  
**npm versión**: 11.6.1
