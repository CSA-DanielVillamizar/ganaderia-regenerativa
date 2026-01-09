# Contribución al Proyecto

## Estándares de Código

### TypeScript

- ✅ `strict: true` en tsconfig.json
- ✅ No usar `any`
- ✅ Interfaces sobre tipos cuando sea apropiado
- ✅ Generics para reutilización

### Naming Conventions

```typescript
// Interfaces
interface IUser { ... }
interface IFarmService { ... }

// Enums
enum RoleEnum { ADMIN, TECHNICIAN, ... }

// Functions
function createFarm() { ... }

// Variables
const farmList: Farm[] = [];
const isActive: boolean = true;

// Constants
const DEFAULT_TIMEOUT = 5000;
const API_VERSION = 'v1';
```

### Comentarios

```typescript
/**
 * Calcula las unidades animales del lote.
 * 
 * @param weightKg - Peso total en kg
 * @param uaWeight - Peso UA de referencia (default 450)
 * @returns Cantidad de UA
 * 
 * @example
 * const ua = calculateUA(4500, 450); // 10
 */
function calculateUA(weightKg: number, uaWeight: number = 450): number {
  return weightKg / uaWeight;
}
```

## Git Workflow

### Branch Names

```
feature/auth-jwt          # Nueva funcionalidad
bugfix/login-error        # Bug fix
refactor/dashboard        # Refactorización
docs/api-endpoints        # Documentación
test/dashboard-service    # Tests
```

### Commit Messages

```
feat: agregar módulo de aforos
fix: corregir cálculo de UA
docs: actualizar README
test: add tests para dashboard
refactor: simplificar dashboard service
```

### Pull Request

1. Crear rama desde `develop`
2. Hacer cambios + tests
3. Linting + formatting
4. Crear PR con descripción clara
5. CI debe pasar ✅
6. Merge cuando aprobado

## Pre-commit Hooks (Husky)

Automáticamente valida antes de commit:
- ESLint
- Prettier
- TypeScript type-check

```bash
# Si husky falla, puedes skipear (NO recomendado)
git commit --no-verify
```

## Testing

### Cobertura Mínima

- Backend: 70% funciones principales
- Frontend: 50% componentes críticos
- E2E: Flujos principales

### Test Naming

```typescript
describe('DashboardService', () => {
  describe('calculateUA', () => {
    it('debería retornar 10 UA para 4500 kg', () => {
      expect(calculateUA(4500)).toBe(10);
    });

    it('debería lanzar error si peso es negativo', () => {
      expect(() => calculateUA(-100)).toThrow();
    });
  });
});
```

### Run Tests

```bash
# Backend
cd apps/api
npm run test
npm run test:cov    # Ver cobertura

# Frontend
cd apps/web
npm run test
npm run test:watch  # Modo watch
```

## Documentación

### Cambios a docs/

```markdown
# Nuevo título

Explicación clara del cambio.

## Subsección

- Punto 1
- Punto 2

### Ejemplo

\`\`\`typescript
// código
\`\`\`
```

### API Changes

Actualizar automáticamente via Swagger, pero documentar en:
1. `docs/arquitectura.md` (cambio conceptual)
2. Comentario en controller (NestJS genera Swagger)
3. CHANGELOG.md (cambio breaking)

## Release Process

```bash
# 1. Update version
npm version patch   # 1.0.0 → 1.0.1
npm version minor   # 1.0.0 → 1.1.0
npm version major   # 1.0.0 → 2.0.0

# 2. Tag
git tag v1.0.1
git push origin v1.0.1

# 3. Changelog
# Actualizar CHANGELOG.md

# 4. GitHub Release
# Crear release en GitHub con notas
```

## Checklist Antes de Enviar PR

- [ ] Código corre sin errores
- [ ] ESLint passa (`npm run lint`)
- [ ] Prettier formateado (`npm run format`)
- [ ] Tests pasan (`npm run test`)
- [ ] TypeScript strict (`npm run build`)
- [ ] Documentación actualizada
- [ ] Commit messages claros
- [ ] No hay `console.log()` en producción

## Reporte de Bugs

**Template**:

```markdown
## Descripción
Breve descripción del bug

## Pasos para reproducir
1. Ir a...
2. Hacer click en...
3. Ver error

## Comportamiento esperado
Debería...

## Comportamiento actual
Actualmente...

## Entorno
- OS: Windows / Mac / Linux
- Node: 18.x
- Browser: Chrome 120

## Screenshots
[Si aplica]
```

## Solicitud de Features

**Template**:

```markdown
## Descripción
Qué característica se necesita

## Motivación
Por qué es importante

## Ejemplo de Uso
Cómo se usaría

## Alternativas
Otras formas de resolver esto
```

---

**¡Gracias por contribuir! 🚀**
