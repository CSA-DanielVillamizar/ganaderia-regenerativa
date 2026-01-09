@echo off
chcp 65001 >nul
cd /d "c:\Users\DanielVillamizar\GanaderiaRegenerativa"
powershell -NoProfile -ExecutionPolicy Bypass -File "scripts\create_all_issues.ps1"
pause
