#!/bin/bash

DIR="$(cd "$(dirname "$0")" && pwd)"
LOCAL_IP=$(hostname -I | awk '{print $1}')

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  🎵 GaanaBajao - Music Streaming${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Check if backend dependencies are installed
if [ ! -d "$DIR/backend/node_modules" ]; then
  echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
  cd "$DIR/backend"
  npm install --silent
  if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install backend dependencies${NC}"
    exit 1
  fi
fi

# Check if .env exists, if not create from .env.example
if [ ! -f "$DIR/backend/.env" ]; then
  if [ -f "$DIR/backend/.env.example" ]; then
    echo -e "${YELLOW}📝 Creating .env from .env.example${NC}"
    cp "$DIR/backend/.env.example" "$DIR/backend/.env"
    echo -e "${GREEN}✓ .env created${NC}"
  else
    echo -e "${YELLOW}⚠️  Creating default .env${NC}"
    cat > "$DIR/backend/.env" << 'EOF'
PORT=5000
JWT_SECRET=gaanabajao_super_secret_jwt_key_2024
FRONTEND_URL=http://localhost:5173
EOF
  fi
fi

# Check if frontend dependencies are installed
if [ ! -d "$DIR/frontend/node_modules" ]; then
  echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
  cd "$DIR/frontend"
  npm install --silent
  if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
    exit 1
  fi
fi

echo -e "${GREEN}✓ All dependencies ready${NC}"
echo ""

# Start backend
echo -e "${BLUE}🚀 Starting backend on port 5000...${NC}"
cd "$DIR/backend"
npm run dev > "$DIR/backend.log" 2>&1 &
BACKEND_PID=$!

# Start frontend
echo -e "${BLUE}🚀 Starting frontend on port 5173...${NC}"
cd "$DIR/frontend"
npm run dev > "$DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!

# Wait for servers to start
sleep 3

# Check if processes are still running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
  echo -e "${RED}❌ Backend failed to start. Check backend.log${NC}"
  cat "$DIR/backend.log"
  exit 1
fi

if ! kill -0 $FRONTEND_PID 2>/dev/null; then
  echo -e "${RED}❌ Frontend failed to start. Check frontend.log${NC}"
  cat "$DIR/frontend.log"
  exit 1
fi

echo ""
echo -e "${GREEN}✨ GaanaBajao is running!${NC}"
echo ""
echo -e "${BLUE}📱 Local:${NC}    http://localhost:5173"
echo -e "${BLUE}🌐 Network:${NC}  http://$LOCAL_IP:5173"
echo -e "${BLUE}👤 Demo:${NC}     demo@gaanabajao.com / demo123"
echo ""
echo -e "${YELLOW}📜 Logs:${NC}"
echo -e "  Backend:  tail -f $DIR/backend.log"
echo -e "  Frontend: tail -f $DIR/frontend.log"
echo ""
echo -e "${RED}Press Ctrl+C to stop...${NC}"
echo ""

# Cleanup on exit
cleanup() {
  echo ""
  echo -e "${YELLOW}🛑 Stopping services...${NC}"
  kill $BACKEND_PID 2>/dev/null
  kill $FRONTEND_PID 2>/dev/null
  sleep 1
  echo -e "${GREEN}✓ Stopped${NC}"
  exit 0
}

trap cleanup INT TERM

# Wait for background processes
wait $BACKEND_PID
wait $FRONTEND_PID
