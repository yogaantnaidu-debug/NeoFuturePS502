#!/bin/bash

# Configuration colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting MindSync Health Dashboard (Mac OS)${NC}"
echo "============================================="

# Function to cleanly stop background processes on exit
cleanup() {
    echo ""
    echo -e "${BLUE}Stopping all MindSync services...${NC}"
    kill $PYTHON_PID $NODE_PID 2>/dev/null
    exit
}

trap cleanup INT TERM

# 1. Start Python ML API
echo -e "${GREEN}[1/2] Starting Python XGBoost Server (Port 5001)...${NC}"
cd mindsync-backend
source .venv.mac/bin/activate
python models/ml_api.py &
PYTHON_PID=$!
cd ..

# Wait a couple seconds for Flask to initialize
sleep 2

# 2. Start Node Express Backend (which also serves the frontend build)
echo -e "${GREEN}[2/2] Starting Node.js API & React Frontend Server (Port 5000)...${NC}"
cd mindsync-backend
npm start &
NODE_PID=$!
cd ..

echo "============================================="
echo -e "${GREEN}MindSync is now running!${NC}"
echo -e "Access your application at: http://localhost:5000"
echo -e "Press [Ctrl+C] to gracefully stop."
echo "============================================="

# Wait indefinitely for logs
wait $PYTHON_PID $NODE_PID
