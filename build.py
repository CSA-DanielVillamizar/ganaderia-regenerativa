#!/usr/bin/env python3
import subprocess
import sys
import os

os.chdir('c:\\Users\\DanielVillamizar\\GanaderiaRegenerativa\\apps\\api')

print("🔨 Building API...")
result = subprocess.run([sys.executable, '-m', 'subprocess', 'run', 'npm', 'run', 'build'], 
                       capture_output=True, text=True, timeout=60)

print(result.stdout)
if result.stderr:
    print("STDERR:", result.stderr)

sys.exit(result.returncode)
