# ⚡ QUICK START: Crear GitHub Issues en 3 pasos

**⏱️ Duración total:** 5-10 minutos  
**📊 Resultado:** 8 épicas MVP + 12 labels en GitHub  

---

## 🎯 3 PASOS SIMPLES

### PASO 1: DOBLE CLIC (1 minuto)
Haz **doble clic** en el archivo:
```
CREAR_ISSUES.bat
```

---

### PASO 2: ESPERAR (4-9 minutos)
La ventana se abrirá y mostrará:
```
╔════════════════════════════════════════════╗
║   CREADOR DE GITHUB ISSUES - MAGROTEC     ║
╚════════════════════════════════════════════╝

[1/5] Verificando requisitos...
  ✅ GitHub CLI
  ✅ Autenticación
  ✅ JSON data

[2/5] Creando labels...
  ✅ epic
  ✅ story
  ✅ P0, P1, P2, P3
  ✅ backend, frontend, data, qa, ux, security

[3/5] Leyendo épicas...
  📋 8 épicas leídas

[4/5] Creando issues...
  [12%] [MVP-P0] Épica: Gestión estructural de la finca
       ✅ Issue #1
  [25%] [MVP-P0] Épica: Lotes, animales y estado real
       ✅ Issue #2
  ...

[5/5] Generando reporte...
  📄 Reporte guardado en: docs/issues_created.md

✅ COMPLETADO
📊 Issues creados: 8
🔗 Ver en GitHub: https://github.com/CSA-DanielVillamizar/ganaderia-regenerativa/issues
```

---

### PASO 3: VERIFICAR (0 minutos)
Presiona **Enter** cuando termine.

Ir a GitHub para verificar:
```
https://github.com/CSA-DanielVillamizar/ganaderia-regenerativa/issues
```

Deberías ver 8 épicas creadas:
```
✅ [MVP-P0] Épica: Gestión estructural de la finca
✅ [MVP-P0] Épica: Lotes, animales y estado real
✅ [MVP-P0] Épica: Rotación y descanso
✅ [MVP-P0] Épica: Pesajes (báscula + cinta métrica)
✅ [MVP-P0] Épica: Aforos y forraje
✅ [MVP-P0] Épica: Dashboard operativo
✅ [MVP-P0] Épica: Seguridad y auditoría
✅ [MVP-P0] Épica: Parametría biológica
```

---

## 🎉 ¡LISTO!

Ahora tienes:
- ✅ 8 épicas MVP en GitHub
- ✅ 12 labels para organizar
- ✅ Reporte completo documentado

---

## 📝 PRÓXIMO PASO: Crear Historias

Abre: **[CREAR_HISTORIAS.md](CREAR_HISTORIAS.md)**

Seguir templates para desglosar cada épica en 3-4 historias (~32 total).

---

## ❌ SI ALGO FALLA

### Error: "GitHub CLI not found"
```bash
# Instala desde: https://cli.github.com
# Luego:
gh auth login
```

### Error: "Not authenticated"
```bash
gh auth login
# Sigue las instrucciones
```

### Error: "Repository not found"
- Verifica acceso a: `CSA-DanielVillamizar/ganaderia-regenerativa`
- Repo debe ser público o tienes acceso

### Script se congela
- Presiona `Ctrl+C` para cancelar
- Verifica conexión a internet
- Intenta ejecutar manualmente:
  ```bash
  cd c:\Users\DanielVillamizar\GanaderiaRegenerativa
  python scripts/create_issues.py
  ```

---

## 📚 DOCUMENTACIÓN COMPLETA

Si necesitas más detalles:
- **[RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md)** - Visión general
- **[CREAR_GITHUB_ISSUES.md](CREAR_GITHUB_ISSUES.md)** - Guía detallada
- **[INDICE_COMPLETO.md](INDICE_COMPLETO.md)** - Navegación
- **[docs/backlog.md](docs/backlog.md)** - Backlog completo

---

**¡Vamos! Haz doble clic en CREAR_ISSUES.bat ⏰**
