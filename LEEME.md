# Rotación Ganado - Magrotec

**Aplicación Premium de Gestión Ganadera Regenerativa**

---

## 🌟 ¿Qué Es?

Sistema integral web para ganaderos moderno que desean:

✅ **Gestionar la rotación** de potreros (pastoreo holístico)  
✅ **Rastrear el crecimiento** de los animales (pesajes semanales)  
✅ **Calcular automáticamente** Unidades Animales (UA) y ganancias  
✅ **Estimar forraje** disponible (aforos con marco cuadrado)  
✅ **Visualizar trends** con dashboards interactivos  
✅ **Controlar acceso** multi-usuario con roles  
✅ **Auditar cambios** para trazabilidad completa  

---

## 🚀 Inicio en 3 Pasos

### 1️⃣ Clona el Repo

```bash
git clone https://github.com/tu-usuario/ganaderia-regenerativa.git
cd ganaderia-regenerativa
npm install
```

### 2️⃣ Levanta Docker

```bash
docker-compose up -d

# Espera 30 segundos a que PostgreSQL esté listo
docker-compose exec api npm run db:push
docker-compose exec api npm run db:seed
```

### 3️⃣ Abre en el Navegador

```
🌐 Frontend: http://localhost:3001
📡 API: http://localhost:3000/api/v1
📚 Docs: http://localhost:3000/api/docs
```

**Login Demo:**
- 📧 `admin@magrotec.com`
- 🔑 `Admin123!`

---

## 📊 Características MVP

### 🏠 Gestión de Fincas

- Crear múltiples fincas
- Definir ubicación y hectáreas totales
- Acceso por usuario con permisos

### 🌾 Potreros (Parcelas de Pastoreo)

- Crear potreros con hectáreas
- Registrar aforos (estimación forraje kg/ha)
- Ver rotación actual del ganado

### 🐄 Lotes & Animales

- Crear lotes con cantidad y raza
- Registrar animales individuales (caravana)
- Rastrear peso actual del lote

### ⚖️ Pesajes

- Registrar pesajes periódicos
- Calcular ganancia automáticamente
- Generar histórico con trends

### 🔄 Rotación

- Registrar entrada/salida de potreros
- Calcular días ocupados
- Vincular a ciclos de rotación

### 📈 Dashboard

**6 Gráficas Principales:**

1. **Evolución Peso** (Línea) - Peso total vs. tiempo
2. **Evolución UA** (Línea) - Unidades Animales vs. tiempo
3. **Ocupación Potreros** (Timeline) - Dónde está cada lote
4. **Forraje Disponible** (Barras) - kg/ha por potrero
5. **KPIs** (Cards) - Lotes, animales, UA, promedio peso
6. **Alertas** (Cards con semáforo) - Pesajes vencidos, sobrepastoreo

---

## 🛠️ Tech Stack

### Backend

```
┌─ NestJS (Node.js Framework)
├─ Prisma (ORM)
├─ PostgreSQL (Base de datos)
├─ JWT (Autenticación)
└─ Zod (Validación)
```

### Frontend

```
┌─ Next.js 14+ (React Framework)
├─ TailwindCSS (Estilos)
├─ React Hook Form (Formularios)
├─ TanStack Query (Estado)
├─ Recharts (Gráficas)
└─ Zod (Validación)
```

### DevOps

```
┌─ Docker & Docker Compose
├─ GitHub Actions (CI/CD)
├─ Husky (Git hooks)
└─ Turbo (Monorepo orchestration)
```

---

## 📚 Documentación Completa

| Documento | Descripción |
|-----------|------------|
| [README.md](./README.md) | Inicio rápido y setup |
| [Arquitectura](./docs/arquitectura.md) | Decisiones técnicas principales |
| [Modelo de Datos](./docs/modelo_datos.md) | 15 tablas, relaciones, enums |
| [Cálculos](./docs/calculos.md) | Fórmulas de UA, ganancia, demanda |
| [Decisiones](./docs/decisiones.md) | Por qué TypeScript, Prisma, etc. |
| [Guía Rápida](./docs/guia_rapida.md) | Comandos, debugging, troubleshooting |
| [CONTRIBUTING](./docs/CONTRIBUTING.md) | Estándares de código, PRs |

---

## 🎯 Cálculos Automáticos

### Unidad Animal (UA)

$$UA = \frac{\text{Peso Total (kg)}}{450}$$

**Ejemplo:** 4500 kg ÷ 450 = **10 UA**

### Ganancia

$$\text{Ganancia (kg)} = \text{Peso Final} - \text{Peso Inicial}$$

$$\text{Ganancia Diaria} = \frac{\text{Ganancia (kg)}}{\text{Días}}$$

**Ejemplo:** 4900 kg - 4500 kg = 400 kg en 29 días = **13.8 kg/día**

### Demanda de Forraje

$$\text{Demanda} = UA \times \text{2.5%} = \text{kg/día}$$

**Ejemplo:** 10 UA × 2.5% = **112.5 kg/día**

### Días Recomendados en Potrero

$$\text{Días} = \frac{\text{Forraje Disponible (kg)}}{\text{Demanda Diaria (kg)}}$$

**Ejemplo:** 12,600 kg ÷ 112.5 = **112 días**

---

## 🔒 Seguridad

- ✅ JWT autenticación con expiración (24h)
- ✅ Hashing bcryptjs para contraseñas
- ✅ RBAC con 4 roles (ADMIN, TECHNICIAN, MANAGER, VIEWER)
- ✅ Acceso a fincas verificado por usuario
- ✅ Soft deletes para auditoría completa
- ✅ AuditLog de cambios (quién, qué, cuándo)

---

## 📊 Datos de Ejemplo

El seed automático carga:

```
🏠 Finca: Las Praderas (Cundinamarca, 50 ha)
├── 🌾 8 Potreros (5-8 ha cada uno)
├── 🐄 1 Lote: 15 novillas
│   ├── Peso inicial: 4500 kg (10 UA)
│   └── Peso actual: 4900 kg (10.89 UA)
├── 📊 5 Pesajes históricos
├── 🔄 5 Movimientos rotación
└── 📐 Aforos en todos potreros

👥 Usuarios:
├── admin@magrotec.com / Admin123! (ADMIN)
└── tecnico@magrotec.com / Tech123! (TECHNICIAN)
```

---

## 🚀 Deployments

### Local Development

```bash
docker-compose up -d
```

### Azure (Futuro)

```bash
# API → Azure App Service
# Web → Vercel o Azure Static Web Apps
# DB → Azure Database for PostgreSQL
```

### GitHub Actions

Automatic CI/CD en cada push:
- ESLint + Prettier check
- Build API & Web
- Run tests
- (Deploy si todo OK)

---

## 📈 Roadmap

### ✅ MVP (Completado)

- Autenticación y RBAC
- CRUD de todas las entidades
- Dashboard con 6 gráficas
- Cálculos automáticos
- Seed data
- Documentación completa

### 🔄 Fase 2 (Q1 2024)

- [ ] Planificador Gantt de rotación
- [ ] Filtros en dashboard
- [ ] Export PDF/Excel
- [ ] Tests unitarios + E2E
- [ ] Notificaciones
- [ ] Entra ID / Azure AD B2C

### 🚀 Fase 3 (Q2 2024)

- [ ] Mobile app (React Native)
- [ ] IoT sensores
- [ ] Machine Learning (predicción)
- [ ] Multi-idioma
- [ ] Dark mode

---

## 🤝 Contribuir

¡Contribuciones son bienvenidas! Mira [CONTRIBUTING.md](./docs/CONTRIBUTING.md)

```bash
# 1. Fork el repo
# 2. Crear rama (feature/algo-nuevo)
# 3. Commit cambios
# 4. Push a rama
# 5. Crear Pull Request
```

**Estándares:**
- ✅ TypeScript strict
- ✅ ESLint + Prettier
- ✅ Tests incluidos
- ✅ Documentación actualizada

---

## 🆘 Soporte

- 📚 [Documentación](./docs/)
- 🐛 [Reportar Bug](https://github.com/tu-usuario/ganaderia-regenerativa/issues)
- 💡 [Solicitar Feature](https://github.com/tu-usuario/ganaderia-regenerativa/issues)

---

## 📄 Licencia

MIT © 2025 Magrotec - Ganadería Regenerativa Inteligente

---

## 🙏 Agradecimientos

Hecho con ❤️ para ganaderos del Trópico que aman la sustentabilidad.

**Magrotec** - *Rotación Ganado* 🌾🐄📊
