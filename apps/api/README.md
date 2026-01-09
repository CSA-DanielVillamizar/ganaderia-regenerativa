# API - Rotación Ganado

Backend API con NestJS y Prisma para gestión de ganadería regenerativa.

## Setup

```bash
npm install
npx prisma migrate dev
npm run dev
```

## Variables de Entorno

Crear `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/ganaderia_dev"
JWT_SECRET="tu-clave-secreta"
JWT_EXPIRATION="24h"
PORT=3000
```
