@echo off
REM Script para configurar repo git local

cd /d c:\Users\DanielVillamizar\GanaderiaRegenerativa

echo Inicializando repositorio git...
git init

echo Agregando remoto GitHub...
git remote add origin https://github.com/CSA-DanielVillamizar/ganaderia-regenerativa.git

echo Verificando remoto...
git remote -v

echo Done
