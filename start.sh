#!/bin/bash

DIR="$(cd "$(dirname "$0")" && pwd)"
LOCAL_IP=$(hostname -I | awk '{print $1}')

echo "================================"
echo "  GaanaBajao - Music Streaming  "
echo "================================"
echo ""

echo "Starting backend on port 5000..."
cd "$DIR/backend"
node src/server.js &
BACKEND_PID=$!

echo "Starting frontend on port 5173..."
cd "$DIR/frontend"
npx vite &
FRONTEND_PID=$!

sleep 2
echo ""
echo "GaanaBajao is running!"
echo ""
echo "  Local:    http://localhost:5173"
echo "  Network:  http://$LOCAL_IP:5173  <-- share this with others"
echo ""
echo "Demo account: demo@gaanabajao.com / demo123"
echo ""
echo "Press Ctrl+C to stop..."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo Stopped.; exit 0" INT TERM

wait
