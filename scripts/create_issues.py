#!/usr/bin/env python3
"""
Script para crear GitHub Issues desde backlog.md
Usa GitHub CLI (gh) para la creación
"""

import json
import subprocess
import sys
import os
from pathlib import Path
from datetime import datetime

class GitHubIssueCreator:
    def __init__(self, repo="CSA-DanielVillamizar/ganaderia-regenerativa"):
        self.repo = repo
        self.created_issues = []
        self.failed_issues = []
        self.project_root = Path(__file__).parent.parent
        
    def verify_requirements(self):
        """Verificar que gh CLI está instalado y autenticado"""
        print("\n🔍 Verificando requisitos...")
        
        # Verificar gh CLI
        try:
            result = subprocess.run(["gh", "--version"], capture_output=True, text=True)
            if result.returncode != 0:
                print("❌ GitHub CLI no instalado. Instala con: https://cli.github.com")
                return False
            print(f"✅ GitHub CLI: {result.stdout.strip()}")
        except FileNotFoundError:
            print("❌ GitHub CLI no encontrado en PATH")
            return False
        
        # Verificar autenticación
        try:
            result = subprocess.run(["gh", "auth", "status"], capture_output=True, text=True)
            if result.returncode != 0:
                print("❌ No autenticado. Ejecuta: gh auth login")
                return False
            print("✅ Autenticación: Conectado")
        except Exception as e:
            print(f"❌ Error verificando autenticación: {e}")
            return False
        
        return True
    
    def create_labels(self):
        """Crear labels necesarios"""
        print("\n🏷️  Creando labels...")
        
        labels = {
            "epic": "3B2A7D",
            "story": "0366D6",
            "P0": "FF4444",
            "P1": "FFAA00",
            "P2": "00AA00",
            "P3": "0088FF",
            "backend": "427819",
            "frontend": "8B008B",
            "data": "1F77B4",
            "qa": "FF7F0E",
            "ux": "9467BD",
            "security": "D62728"
        }
        
        created = 0
        for label, color in labels.items():
            try:
                result = subprocess.run(
                    ["gh", "label", "create", label, "--repo", self.repo, "--color", color],
                    capture_output=True,
                    text=True
                )
                if result.returncode == 0:
                    print(f"  ✅ Label '{label}' creado")
                    created += 1
                else:
                    # Puede ser que ya exista
                    if "already exists" in result.stderr.lower():
                        print(f"  ⏭️  Label '{label}' ya existe")
                    else:
                        print(f"  ⚠️  {label}: {result.stderr[:50]}")
            except Exception as e:
                print(f"  ❌ Error creando label '{label}': {e}")
        
        print(f"✅ Labels procesados ({created} nuevos)")
        return True
    
    def create_epic(self, epic_data):
        """Crear una épica como GitHub issue"""
        try:
            cmd = [
                "gh", "issue", "create",
                "--repo", self.repo,
                "--title", epic_data["title"],
                "--body", epic_data["body"],
                "--label", ",".join(epic_data["labels"])
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                # Extraer número de issue
                output = result.stdout.strip()
                if "#" in output:
                    issue_num = output.split("#")[1].split(" ")[0]
                    return int(issue_num)
                return None
            else:
                return None
                
        except Exception as e:
            print(f"  ❌ Error: {e}")
            return None
    
    def create_epics_from_json(self, json_file):
        """Crear épicas desde archivo JSON"""
        print("\n📝 Leyendo épicas...")
        
        json_path = self.project_root / json_file
        if not json_path.exists():
            print(f"❌ Archivo no encontrado: {json_path}")
            return False
        
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            epics = data.get("epics", [])
            print(f"📋 {len(epics)} épicas leídas")
            
            print("\n🚀 Creando épicas...")
            for i, epic in enumerate(epics, 1):
                progress = f"[{i}/{len(epics)}]"
                title = epic["title"][:50] + "..." if len(epic["title"]) > 50 else epic["title"]
                print(f"  {progress} {title}", end="... ")
                
                issue_num = self.create_epic(epic)
                if issue_num:
                    print(f"✅ #{issue_num}")
                    self.created_issues.append({
                        "number": issue_num,
                        "title": epic["title"],
                        "priority": epic.get("priority", "?"),
                        "labels": ", ".join(epic.get("labels", []))
                    })
                else:
                    print("⏭️  (posiblemente duplicado)")
                    self.failed_issues.append(epic["title"])
        
        except json.JSONDecodeError as e:
            print(f"❌ Error parsing JSON: {e}")
            return False
        except Exception as e:
            print(f"❌ Error: {e}")
            return False
        
        return True
    
    def generate_report(self, output_file="docs/issues_created.md"):
        """Generar reporte de issues creados"""
        print(f"\n📊 Generando reporte...")
        
        output_path = self.project_root / output_file
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Agrupar por prioridad
        by_priority = {}
        for issue in sorted(self.created_issues, key=lambda x: x["number"]):
            priority = issue["priority"]
            if priority not in by_priority:
                by_priority[priority] = []
            by_priority[priority].append(issue)
        
        # Generar markdown
        content = f"""# 📋 GITHUB ISSUES CREADOS

**Fecha:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}  
**Repositorio:** [CSA-DanielVillamizar/ganaderia-regenerativa](https://github.com/CSA-DanielVillamizar/ganaderia-regenerativa)

## 📊 RESUMEN ESTADÍSTICO

| Métrica | Valor |
|---------|-------|
| **Total creados** | {len(self.created_issues)} |
| **Fallidos/Duplicados** | {len(self.failed_issues)} |
| **Tasa éxito** | {int((len(self.created_issues) / (len(self.created_issues) + len(self.failed_issues)) * 100)) if self.created_issues or self.failed_issues else 0}% |

## 🎯 ISSUES POR PRIORIDAD

"""
        
        # Prioridades en orden
        priority_order = ["P0", "P1", "P2", "P3"]
        for priority in priority_order:
            if priority in by_priority:
                issues = by_priority[priority]
                content += f"\n### {priority} - {'Crítico (MVP)' if priority == 'P0' else 'Alto (PRO)' if priority == 'P1' else 'Medio/Bajo (PREMIUM)'}\n\n"
                content += "| # | Título | Labels |\n|---|--------|--------|\n"
                for issue in issues:
                    content += f"| #{issue['number']} | [{issue['title']}](https://github.com/{self.repo}/issues/{issue['number']}) | {issue['labels']} |\n"
        
        # Listado completo
        content += f"""

## 📋 LISTADO COMPLETO

| # | Título | Prioridad | Labels |
|---|--------|-----------|--------|
"""
        
        for issue in sorted(self.created_issues, key=lambda x: x["number"]):
            content += f"| #{issue['number']} | [{issue['title']}](https://github.com/{self.repo}/issues/{issue['number']}) | {issue['priority']} | {issue['labels']} |\n"
        
        content += f"""

## 🔗 ACCIONES SIGUIENTES

1. **Ver todos los issues:**  
   https://github.com/{self.repo}/issues

2. **Crear Project (sprint/planning):**
   ```bash
   gh project create --owner CSA-DanielVillamizar --title "Sprint 1" --format table
   ```

3. **Asignar issues a milestone:**
   ```bash
   gh issue edit <numero> --milestone "Sprint 1"
   ```

4. **Comenzar estimación:**
   - Revisar cada issue
   - Asignar story points
   - Asignar a desarrolladores

## 📈 PRÓXIMAS ÉPICAS

Los siguientes épicas están documentados en `docs/backlog.md` y requieren:
- **P1 (PRO):** Análisis avanzado, Reports, Mobile
- **P2-P3 (PREMIUM):** Marketplace, AI, Blockchain

---

**Generado por:** GitHub CLI + Python  
**Documentación:** `docs/backlog.md`, `docs/roadmap.md`, `docs/issue_templates.md`
"""
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ Reporte guardado en: {output_file}")
        return True
    
    def run(self):
        """Ejecutar el proceso completo"""
        print("\n╔════════════════════════════════════════════╗")
        print("║   GITHUB ISSUE CREATOR - GANADERÍA        ║")
        print("║     Automatizando creación de issues      ║")
        print("╚════════════════════════════════════════════╝")
        
        # Verificar requisitos
        if not self.verify_requirements():
            print("\n❌ No se pueden cumplir los requisitos")
            return False
        
        # Crear labels
        if not self.create_labels():
            print("❌ Error creando labels")
            return False
        
        # Crear épicas
        if not self.create_epics_from_json("scripts/issues_data.json"):
            print("⚠️  Error creando épicas")
        
        # Generar reporte
        if not self.generate_report():
            print("⚠️  Error generando reporte")
        
        # Mostrar resumen
        print("\n╔════════════════════════════════════════════╗")
        print("║           ✅ PROCESO COMPLETADO           ║")
        print("╚════════════════════════════════════════════╝")
        print(f"\n✅ Issues creados: {len(self.created_issues)}")
        if self.failed_issues:
            print(f"⚠️  Issues fallidos: {len(self.failed_issues)}")
        print(f"\n🔗 Ver en GitHub: https://github.com/{self.repo}/issues")
        print(f"📄 Reporte: docs/issues_created.md")
        
        return True

if __name__ == "__main__":
    creator = GitHubIssueCreator()
    success = creator.run()
    sys.exit(0 if success else 1)
