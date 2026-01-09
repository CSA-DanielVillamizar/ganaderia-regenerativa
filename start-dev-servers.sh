#!/bin/bash
# Script para iniciar ambos servidores en desarrollo

echo "🚀 INICIANDO APLICACIÓN EN MODO DESARROLLO"
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Backend (API NestJS)${NC}"
echo "   Puerto: 3000"
echo "   Comando: npm run start:dev"
echo ""

echo -e "${BLUE}🌐 Frontend (Web Next.js)${NC}"
echo "   Puerto: 3001"
echo "   Comando: npm run dev"
echo ""

echo "=========================================="
echo -e "${GREEN}Iniciando servidores...${NC}"
echo ""

# Iniciar API en background
cd apps/api
npm run start:dev &
API_PID=$!

# Esperar un poco para que la API inicie
sleep 3

# Iniciar Web en background
cd ../web
npm run dev &
WEB_PID=$!

echo ""
echo -e "${GREEN}✅ Ambos servidores iniciados${NC}"
echo ""
echo "PID del API: $API_PID"
echo "PID del Web: $WEB_PID"
echo ""
echo "URLs:"
echo "  Backend:  http://localhost:3000"
echo "  Frontend: http://localhost:3001"
echo ""
echo "Para detener: Presiona Ctrl+C"
echo ""

# Mantener el script ejecutándose
wait
