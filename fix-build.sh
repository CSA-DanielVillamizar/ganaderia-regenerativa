#!/usr/bin/env bash
cd /c/Users/DanielVillamizar/GanaderiaRegenerativa/apps/api

echo "Step 1: Clear cache"
npm cache clean --force 2>&1 | head -20

echo ""
echo "Step 2: Remove node_modules and reinstall"
rm -rf node_modules
npm install --prefer-offline 2>&1 | tail -20

echo ""
echo "Step 3: Generate Prisma client"
timeout 30 npx prisma generate 2>&1

echo ""
echo "Step 4: Build API"
timeout 60 npm run build 2>&1 | head -50

echo ""
echo "Done!"
