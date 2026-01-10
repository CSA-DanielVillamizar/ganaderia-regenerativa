#!/bin/bash

echo "🚀 Iniciando Ganadería Regenerativa..."
echo ""

cd "$(dirname "$0")"

# Iniciar backend en background
echo "⚙️  Backend iniciando en puerto 3001..."
cd apps/api
node dist/apps/api/src/main.js &
BACKEND_PID=$!
sleep 3

# Iniciar frontend en background
echo "🎨 Frontend iniciando en puerto 3000..."
cd ../web
npx next dev -p 3000 &
FRONTEND_PID=$!

echo ""
echo "================================"
echo "✅ SERVICIOS ACTIVOS"
echo "================================"
echo ""
echo "🌐 Frontend:  http://localhost:3000"
echo "📚 API Docs:  http://localhost:3001/api/docs"
echo "🔑 Login:     http://localhost:3000/auth/login"
echo ""
echo "Credenciales:"
echo "  Email: admin@magrotec.com"
echo "  Pass:  Admin123!"
echo ""
echo "Presiona Ctrl+C para detener los servidores"
echo "================================"

# Mantener script activo
wait
