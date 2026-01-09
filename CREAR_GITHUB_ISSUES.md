# 🚀 GUÍA DE EJECUCIÓN MANUAL: CREAR GITHUB ISSUES

Debido a problemas con el terminal en VS Code, necesitas ejecutar estos comandos manualmente.

## OPCIÓN 1: Ejecutar desde CMD o PowerShell (RECOMENDADO)

### Paso 1: Abre una ventana nueva de CMD o PowerShell
- **Windows:** `Win + R` → escribe `cmd` o `powershell` → Enter
- Navega a la carpeta del proyecto:
```bash
cd c:\Users\DanielVillamizar\GanaderiaRegenerativa
```

### Paso 2: Crea los labels necesarios

```bash
gh label create epic --repo CSA-DanielVillamizar/ganaderia-regenerativa --color 3B2A7D
gh label create story --repo CSA-DanielVillamizar/ganaderia-regenerativa --color 0366D6
gh label create P0 --repo CSA-DanielVillamizar/ganaderia-regenerativa --color FF4444
gh label create P1 --repo CSA-DanielVillamizar/ganaderia-regenerativa --color FFAA00
gh label create P2 --repo CSA-DanielVillamizar/ganaderia-regenerativa --color 00AA00
gh label create P3 --repo CSA-DanielVillamizar/ganaderia-regenerativa --color 0088FF
gh label create backend --repo CSA-DanielVillamizar/ganaderia-regenerativa --color 427819
gh label create frontend --repo CSA-DanielVillamizar/ganaderia-regenerativa --color 8B008B
gh label create data --repo CSA-DanielVillamizar/ganaderia-regenerativa --color 1F77B4
gh label create qa --repo CSA-DanielVillamizar/ganaderia-regenerativa --color FF7F0E
gh label create ux --repo CSA-DanielVillamizar/ganaderia-regenerativa --color 9467BD
gh label create security --repo CSA-DanielVillamizar/ganaderia-regenerativa --color D62728
```

### Paso 3: Ejecuta el script Python

```bash
python scripts/create_issues.py
```

**O** si necesitas especificar la ruta completa:

```bash
python "c:\Users\DanielVillamizar\GanaderiaRegenerativa\scripts\create_issues.py"
```

---

## OPCIÓN 2: Ejecutar desde Git Bash o WSL

Si tienes Git Bash o WSL instalado:

```bash
cd /c/Users/DanielVillamizar/GanaderiaRegenerativa
bash scripts/create_issues_standalone.sh
```

---

## OPCIÓN 3: Script Batch Automático

Crea un archivo `run_create_issues.bat` en la raíz del proyecto con:

```batch
@echo off
cd /d "c:\Users\DanielVillamizar\GanaderiaRegenerativa"
python scripts/create_issues.py
pause
```

Luego haz doble clic en el archivo `.bat`

---

## ¿QUÉ HACE EL SCRIPT?

1. ✅ Verifica que `gh` CLI está instalado y autenticado
2. ✅ Crea 12 labels en GitHub (epic, story, P0-P3, backend, frontend, etc.)
3. ✅ Lee el archivo `scripts/issues_data.json`
4. ✅ Crea 8 épicas MVP (P0) como GitHub Issues
5. ✅ Genera reporte en `docs/issues_created.md`

---

## VERIFICAR QUE FUNCIONÓ

Después de ejecutar el script:

1. **Ver issues creados en GitHub:**
   ```bash
   gh issue list --repo CSA-DanielVillamizar/ganaderia-regenerativa
   ```

2. **O abre en navegador:**
   https://github.com/CSA-DanielVillamizar/ganaderia-regenerativa/issues

3. **Verifica que se creó el reporte:**
   Abre `docs/issues_created.md` en VS Code

---

## TROUBLESHOOTING

### Error: "gh: command not found"
- Instala GitHub CLI desde https://cli.github.com
- Luego autentica: `gh auth login`

### Error: "Not authenticated"
- Ejecuta: `gh auth login`
- Sigue las instrucciones en pantalla

### Error: "Repository not found"
- Verifica que el repositorio es público o tienes acceso
- Verifica la URL: `CSA-DanielVillamizar/ganaderia-regenerativa`

### Python no encontrado
- Instala Python 3.8+ desde python.org
- O usa: `py` en lugar de `python`

---

## PRÓXIMOS PASOS

Después de crear las épicas MVP:

1. **Crear historias (stories) bajo cada épica**
2. **Crear Project en GitHub para sprint planning**
3. **Asignar issues a developers**
4. **Comenzar estimación con equipo**

Consulta `docs/backlog.md` para ver todas las historias pendientes.

---

**📚 Documentación relacionada:**
- `docs/backlog.md` - Backlog completo con 17 épicas
- `docs/roadmap.md` - Plan de 12 meses
- `scripts/issues_data.json` - Datos estructurados de épicas
