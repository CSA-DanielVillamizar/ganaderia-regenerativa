# 🔧 GUÍA DE MANTENIMIENTO Y EXPANSIÓN - Ganadería Regenerativa

## 📋 Tabla de Contenidos
1. [Mantenimiento Regular](#mantenimiento-regular)
2. [Agregar Nuevas Features](#agregar-nuevas-features)
3. [Debugging](#debugging)
4. [Performance Tuning](#performance-tuning)
5. [Seguridad](#seguridad)
6. [Escalado](#escalado)

---

## 🛠️ Mantenimiento Regular

### Daily Checklist
```bash
# Verificar logs
tail -f logs/api.log       # Backend logs
tail -f logs/web.log       # Frontend logs

# Health checks
curl http://localhost:3000/health
curl http://localhost:3001/health

# Database integrity
npm run prisma:studio

# Check for security updates
npm audit
npm audit fix  # Si es seguro hacerlo
```

### Weekly Tasks
```bash
# Backup base de datos
npm run db:backup

# Run tests
npm run test
npm run test:e2e

# Code quality
npm run lint
npm run type-check

# Performance metrics
npm run analyze:bundle
```

### Monthly Tasks
```bash
# Actualizar dependencias
npm update

# Clean up
npm run clean
npm run cache:clear

# Database optimization
npm run db:optimize
npm run db:vacuum  # SQLite

# Security audit completo
npm audit --audit-level=moderate
```

---

## ✨ Agregar Nuevas Features

### Patrón: Nueva Épica Completa

#### 1. Diseñar el Modelo de Datos
```typescript
// apps/api/prisma/schema.prisma

model NuevaEntidad {
  id        String   @id @default(cuid())
  farmId    String
  farm      Farm     @relation(fields: [farmId], references: [id])
  
  // Campos específicos
  name      String
  value     Float
  
  // Auditoría
  createdBy String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([farmId, name])
  @@index([farmId])
}
```

**Checklist:**
- [ ] Define all required fields
- [ ] Add indexes for frequent queries
- [ ] Include audit fields (createdBy, timestamps)
- [ ] Set up relationships with other entities
- [ ] Add unique constraints where appropriate

#### 2. Generar Prisma Client
```bash
npx prisma generate
npx prisma db push   # SQLite
npx prisma migrate dev --name "add_nueva_entidad"  # PostgreSQL
```

#### 3. Crear Backend Module

```typescript
// apps/api/src/nueva-entidad/nueva-entidad.module.ts
import { Module } from '@nestjs/common';
import { NuevaEntidadService } from './nueva-entidad.service';
import { NuevaEntidadController } from './nueva-entidad.controller';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NuevaEntidadController],
  providers: [NuevaEntidadService],
  exports: [NuevaEntidadService],
})
export class NuevaEntidadModule {}
```

#### 4. Implementar Service
```typescript
// apps/api/src/nueva-entidad/nueva-entidad.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateNuevaEntidadDto } from './dto/create-nueva-entidad.dto';
import { Zod validation } from 'zod';

@Injectable()
export class NuevaEntidadService {
  constructor(private prisma: PrismaService) {}

  async create(farmId: string, dto: CreateNuevaEntidadDto) {
    // Validar farm existe y usuario tiene acceso
    const farm = await this.prisma.farm.findUnique({
      where: { id: farmId },
    });
    
    if (!farm) {
      throw new NotFoundException('Farm not found');
    }

    // Validar business rules
    if (dto.value < 0) {
      throw new BadRequestException('Value must be positive');
    }

    // Crear registro
    return this.prisma.nuevaEntidad.create({
      data: {
        farmId,
        name: dto.name,
        value: dto.value,
        createdBy: dto.userId,
      },
    });
  }

  async getByFarm(farmId: string) {
    return this.prisma.nuevaEntidad.findMany({
      where: { farmId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, dto: UpdateNuevaEntidadDto) {
    return this.prisma.nuevaEntidad.update({
      where: { id },
      data: {
        name: dto.name,
        value: dto.value,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.nuevaEntidad.delete({
      where: { id },
    });
  }
}
```

**Checklist:**
- [ ] Validar acceso del usuario (farm exists)
- [ ] Validar business rules
- [ ] Usar Zod para DTOs
- [ ] Incluir audit fields (createdBy)
- [ ] Manejo de errores robusto
- [ ] Logging de operaciones importantes

#### 5. Crear DTO con Zod
```typescript
// apps/api/src/nueva-entidad/dto/create-nueva-entidad.dto.ts
import { z } from 'zod';

export const CreateNuevaEntidadDtoSchema = z.object({
  name: z.string().min(1).max(100),
  value: z.number().positive(),
  userId: z.string(),
});

export type CreateNuevaEntidadDto = z.infer<typeof CreateNuevaEntidadDtoSchema>;

// En el controller:
@Post()
@UseGuards(JwtAuthGuard)
async create(
  @Param('farmId') farmId: string,
  @Body() body: any,
  @Req() req,
) {
  const dto = CreateNuevaEntidadDtoSchema.parse({
    ...body,
    userId: req.user.id,
  });
  return this.service.create(farmId, dto);
}
```

#### 6. Crear Controller
```typescript
// apps/api/src/nueva-entidad/nueva-entidad.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NuevaEntidadService } from './nueva-entidad.service';

@Controller('nueva-entidad')
export class NuevaEntidadController {
  constructor(private service: NuevaEntidadService) {}

  @Post('farms/:farmId')
  @UseGuards(JwtAuthGuard)
  async create(@Param('farmId') farmId: string, @Body() dto: any) {
    return this.service.create(farmId, dto);
  }

  @Get('farms/:farmId')
  @UseGuards(JwtAuthGuard)
  async getByFarm(@Param('farmId') farmId: string) {
    return this.service.getByFarm(farmId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
```

#### 7. Registrar en AppModule
```typescript
// apps/api/src/app.module.ts
import { NuevaEntidadModule } from './nueva-entidad/nueva-entidad.module';

@Module({
  imports: [
    // ... otros modules
    NuevaEntidadModule,  // ← Agregar aquí
  ],
})
export class AppModule {}
```

#### 8. Frontend Form Component
```typescript
// apps/web/src/components/forms/NuevaEntidadForm.tsx
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

export function NuevaEntidadForm({ farmId, onSuccess }) {
  const [formData, setFormData] = useState({ name: '', value: '' });
  const [errors, setErrors] = useState({});

  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch(`/api/nueva-entidad/farms/${farmId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (data) => {
      setFormData({ name: '', value: '' });
      onSuccess(data);
    },
    onError: (err) => {
      setErrors({ submit: err.message });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Required';
    if (!formData.value || parseFloat(formData.value) <= 0) {
      newErrors.value = 'Must be positive';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    mutation.mutate({
      name: formData.name,
      value: parseFloat(formData.value),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Nombre</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border rounded"
        />
        {errors.name && <span className="text-red-500 text-xs">{errors.name}</span>}
      </div>

      <div>
        <label className="block text-sm font-medium">Valor</label>
        <input
          type="number"
          step="0.01"
          value={formData.value}
          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
          className="w-full px-3 py-2 border rounded"
        />
        {errors.value && <span className="text-red-500 text-xs">{errors.value}</span>}
      </div>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
      >
        {mutation.isPending ? 'Guardando...' : 'Guardar'}
      </button>

      {errors.submit && <div className="text-red-500 text-sm">{errors.submit}</div>}
    </form>
  );
}
```

#### 9. Tests
```typescript
// apps/api/src/nueva-entidad/nueva-entidad.service.spec.ts
import { Test } from '@nestjs/testing';
import { NuevaEntidadService } from './nueva-entidad.service';
import { PrismaService } from '../common/prisma/prisma.service';

describe('NuevaEntidadService', () => {
  let service: NuevaEntidadService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        NuevaEntidadService,
        {
          provide: PrismaService,
          useValue: {
            nuevaEntidad: {
              create: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            farm: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<NuevaEntidadService>(NuevaEntidadService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create nueva-entidad', async () => {
    const mockData = { id: '1', name: 'Test', value: 100 };
    jest.spyOn(prisma.farm, 'findUnique').mockResolvedValue({ id: 'farm-1' } as any);
    jest.spyOn(prisma.nuevaEntidad, 'create').mockResolvedValue(mockData as any);

    const result = await service.create('farm-1', {
      name: 'Test',
      value: 100,
      userId: 'user-1',
    });

    expect(result).toEqual(mockData);
    expect(prisma.nuevaEntidad.create).toHaveBeenCalled();
  });

  it('should throw if farm not found', async () => {
    jest.spyOn(prisma.farm, 'findUnique').mockResolvedValue(null);

    await expect(
      service.create('farm-1', { name: 'Test', value: 100, userId: 'user-1' })
    ).rejects.toThrow();
  });

  it('should throw if value is negative', async () => {
    jest.spyOn(prisma.farm, 'findUnique').mockResolvedValue({ id: 'farm-1' } as any);

    // Validación debería ocurrir en el servicio
    // Implementar según tu lógica
  });
});
```

**Checklist Completo:**
- [ ] Modelo Prisma creado
- [ ] `prisma generate` ejecutado exitosamente
- [ ] Service con CRUD completo
- [ ] DTO con validación Zod
- [ ] Controller con endpoints
- [ ] Registrado en AppModule
- [ ] Tests escribientes
- [ ] Frontend form creado
- [ ] Build exitoso (API y Web)
- [ ] Tested manualmente

---

## 🐛 Debugging

### Backend Issues

```bash
# Activar logs verbose
NODE_DEBUG=* npm run start:dev

# Revisar logs de Prisma
PRISMA_CLIENT_ENGINE_LOG=debug npm run start:dev

# Debugger (Node)
node --inspect-brk dist/main.js

# En Chrome: chrome://inspect
```

### Frontend Issues

```bash
# React DevTools Chrome Extension
# Redux DevTools (si hay state management)
# Network tab para ver requests

# Debug logs
console.log('DEBUG:', data);

# Debugger statement
debugger;  // Pausa en Chrome DevTools
```

### Database Issues

```bash
# Abrir Prisma Studio (UI)
npm run prisma:studio

# SQL raw query
npx prisma db execute --stdin

# Backup
npm run db:backup

# Restore
npm run db:restore
```

---

## ⚡ Performance Tuning

### Frontend Optimization

```typescript
// 1. Lazy Loading Components
import dynamic from 'next/dynamic';

const FieldGuideViewer = dynamic(
  () => import('./FieldGuideViewer'),
  { loading: () => <div>Cargando...</div> }
);

// 2. Image Optimization
import Image from 'next/image';

<Image
  src="/forage.jpg"
  alt="Forage sampling"
  width={400}
  height={300}
  priority={false}  // Para non-critical images
/>

// 3. Memoización de Componentes
const MemoizedMap = React.memo(PaddockMap);

// 4. Use useMemo para cálculos costosos
const sortedPaddocks = useMemo(() => {
  return paddocks.sort((a, b) => {
    // Cálculo costoso
    return a.value - b.value;
  });
}, [paddocks]);

// 5. Virtualización para listas largas
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={50}
>
  {({ index, style }) => (
    <div style={style}>
      {items[index]}
    </div>
  )}
</FixedSizeList>
```

### Backend Optimization

```typescript
// 1. Índices en BD
model Weighing {
  @@index([farmId])
  @@index([herdId])
  @@index([createdAt])
}

// 2. Seleccionar solo campos necesarios
const weighings = await prisma.weighing.findMany({
  where: { farmId },
  select: {
    id: true,
    actualWeight: true,
    date: true,
    // ← No seleccionar campos innecesarios
  },
});

// 3. Paginación
const PAGE_SIZE = 20;
const weighings = await prisma.weighing.findMany({
  where: { farmId },
  skip: (page - 1) * PAGE_SIZE,
  take: PAGE_SIZE,
});

// 4. Caching
import { Cache } from '@nestjs/cache-manager';

@Cacheable({
  key: `farm:${farmId}:summary`,
  ttl: 300, // 5 minutes
})
async getFarmSummary(farmId: string) {
  // ...
}

// 5. Batch Operations
const weighings = await prisma.weighing.createMany({
  data: [
    { farmId, herdId, actualWeight: 500 },
    { farmId, herdId, actualWeight: 520 },
  ],
});
```

### Database Optimization

```bash
# Análisis de queries
EXPLAIN QUERY PLAN SELECT * FROM weighing WHERE farmId = '123';

# Optimización SQLite
PRAGMA optimize;
VACUUM;
PRAGMA integrity_check;

# Índices
CREATE INDEX idx_weighing_farmId ON weighing(farmId);
CREATE INDEX idx_weighing_date ON weighing(date DESC);
```

---

## 🔒 Seguridad

### Checklist de Seguridad

```typescript
// 1. Validar entrada
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// 2. Sanitizar output
const sanitize = (html: string) => {
  return html.replace(/[<>]/g, '');
};

// 3. CORS
import { NestFactory } from '@nestjs/core';

const app = await NestFactory.create(AppModule);
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
});

// 4. Rate Limiting
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
  ],
})
export class AppModule {}

// 5. Helmet (headers de seguridad)
import helmet from 'helmet';

app.use(helmet());

// 6. HTTPS en producción
const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
};

// 7. Validar JWT
@UseGuards(JwtAuthGuard)
@Get()
getData() {}

// 8. Encriptar passwords
import * as bcrypt from 'bcryptjs';

const hashedPassword = await bcrypt.hash(password, 10);

// 9. Vars de entorno
import { ConfigService } from '@nestjs/config';

constructor(private config: ConfigService) {
  this.secret = this.config.get('JWT_SECRET');
}

// 10. Audit logging
logger.log({
  action: 'USER_CREATED',
  userId: '123',
  timestamp: new Date(),
  ip: req.ip,
});
```

### Environment Variables
```bash
# .env.local (NUNCA commitear)
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="tu-secreto-muy-largo-aqui"
API_URL="http://localhost:3000"
NODE_ENV="development"

# .env.production
DATABASE_URL="postgresql://..."
JWT_SECRET="${VAULT_JWT_SECRET}"
API_URL="https://api.produccion.com"
NODE_ENV="production"
```

---

## 📊 Escalado

### Escalar a PostgreSQL (de SQLite)

```bash
# 1. Instalar driver
npm install @prisma/client @prisma/engines pg

# 2. Actualizar .env
# DATABASE_URL="postgresql://user:password@localhost:5432/ganaderia"

# 3. Actualizar schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"  // ← Cambiar de "sqlite"
  url      = env("DATABASE_URL")
}

# 4. Crear migrations
npx prisma migrate dev --name "init-postgres"

# 5. Deploy
npx prisma migrate deploy
```

### Escalar Horizontalmente

```typescript
// API Server
// 1. Load Balancer (NGINX)
upstream api {
  server api-1:3000 weight=1;
  server api-2:3000 weight=1;
  server api-3:3000 weight=1;
}

server {
  listen 80;
  location / {
    proxy_pass http://api;
  }
}

// 2. Sticky Sessions (si es necesario)
upstream api {
  least_conn;  // ← En lugar de round-robin
  server api-1:3000;
  server api-2:3000;
}

// 3. Health Checks
@Get('health')
health() {
  return { status: 'ok', timestamp: new Date() };
}
```

### Caching Distribuido

```typescript
// Redis
import { CacheModule } from '@nestjs/cache-manager';
import { RedisClientOptions } from 'redis';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.register<RedisClientOptions>({
      store: redisStore,
      host: 'localhost',
      port: 6379,
    }),
  ],
})
export class AppModule {}

// Usar
@Cacheable('farm:' + farmId, 300)
async getFarm(farmId: string) {
  return this.farmService.getById(farmId);
}
```

### Monitoreo en Producción

```typescript
// Sentry (Error Tracking)
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Datadog (APM)
import { datadogRum } from '@datadog/browser-rum';

datadogRum.init({
  applicationId: 'xxx',
  clientToken: 'xxx',
  site: 'datadoghq.com',
  service: 'ganaderia-web',
  env: 'production',
  sessionReplaySampleRate: 20,
  traceSampleRate: 20,
});

// CloudWatch (Logs)
import winston from 'winston';
import WinstonCloudWatch from 'winston-cloudwatch';

logger.add(
  new WinstonCloudWatch({
    logGroupName: 'ganaderia-api',
    logStreamName: 'prod',
  })
);
```

---

## 📚 Referencias Útiles

- [NestJS Docs](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Zod Documentation](https://zod.dev)
- [OWASP Security](https://owasp.org)

---

**Última actualización:** 2025-12-26  
**Versión:** 1.0.0  
**Mantenedor:** @DanielVillamizar

