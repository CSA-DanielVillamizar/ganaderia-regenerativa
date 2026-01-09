@echo off
cd /d "c:\Users\DanielVillamizar\GanaderiaRegenerativa\apps\api"

echo Generando cliente Prisma...
call npx prisma generate

echo Creando base de datos SQLite...
call npx prisma db push --accept-data-loss

echo.
echo Base de datos creada exitosamente!
echo.
pause
