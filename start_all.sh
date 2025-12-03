#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}=========================================="
echo "     QueueFlex - Starting All Services"
echo "==========================================${NC}"

# Create logs directory if it doesn't exist
echo -e "\n${BLUE}Step 0: Setting up environment...${NC}"
if [ ! -d "logs" ]; then
    mkdir logs
    echo -e "${GREEN}✓ Created logs directory${NC}"
else
    echo -e "${GREEN}✓ Logs directory exists${NC}"
fi

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 0
    else
        return 1
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    echo -e "${YELLOW}Killing existing process on port $port...${NC}"
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
    sleep 1
}

# Clean up function
cleanup() {
    echo -e "\n${RED}Shutting down all services...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

echo -e "\n${BLUE}Step 1: Checking and cleaning ports...${NC}"

# Check and clean ports
PORTS=(3000 4000 5000 50051)
for port in "${PORTS[@]}"; do
    if check_port $port; then
        echo -e "${YELLOW}Port $port is in use${NC}"
        kill_port $port
    else
        echo -e "${GREEN}Port $port is available${NC}"
    fi
done

echo -e "\n${BLUE}Step 2: Starting Auth Service (gRPC)...${NC}"
cd auth_service
node grpc_server.js > ../logs/grpc_server.log 2>&1 &
GRPC_PID=$!
cd ..
sleep 3

if check_port 50051; then
    echo -e "${GREEN}✓ Auth gRPC Server started on port 50051 (PID: $GRPC_PID)${NC}"
else
    echo -e "${RED}✗ Failed to start Auth gRPC Server${NC}"
    echo -e "${YELLOW}Check logs/grpc_server.log for details${NC}"
    cat logs/grpc_server.log
    exit 1
fi

echo -e "\n${BLUE}Step 3: Starting Auth Service (REST)...${NC}"
cd auth_service
node index.js > ../logs/auth_rest.log 2>&1 &
AUTH_PID=$!
cd ..
sleep 3

if check_port 3000; then
    echo -e "${GREEN}✓ Auth REST Server started on port 3000 (PID: $AUTH_PID)${NC}"
else
    echo -e "${RED}✗ Failed to start Auth REST Server${NC}"
    echo -e "${YELLOW}Check logs/auth_rest.log for details${NC}"
    cat logs/auth_rest.log
    kill $GRPC_PID 2>/dev/null
    exit 1
fi

echo -e "\n${BLUE}Step 4: Starting Admin Service...${NC}"
cd admin_service
python main.py > ../logs/admin_service.log 2>&1 &
ADMIN_PID=$!
cd ..
sleep 3

if check_port 5000; then
    echo -e "${GREEN}✓ Admin Service started on port 5000 (PID: $ADMIN_PID)${NC}"
else
    echo -e "${RED}✗ Failed to start Admin Service${NC}"
    kill $GRPC_PID $AUTH_PID
    exit 1
fi

echo -e "\n${BLUE}Step 5: Starting Queue Service...${NC}"
cd queue_service
python main.py > ../logs/queue_service.log 2>&1 &
QUEUE_PID=$!
cd ..
sleep 3

if check_port 4000; then
    echo -e "${GREEN}✓ Queue Service started on port 4000 (PID: $QUEUE_PID)${NC}"
else
    echo -e "${RED}✗ Failed to start Queue Service${NC}"
    kill $GRPC_PID $AUTH_PID $ADMIN_PID
    exit 1
fi

echo -e "\n${GREEN}=========================================="
echo "     All Services Started Successfully!"
echo "==========================================${NC}"

echo -e "\n${CYAN}Service Status:${NC}"
echo -e "  ${GREEN}✓${NC} Auth gRPC:    localhost:50051 (PID: $GRPC_PID)"
echo -e "  ${GREEN}✓${NC} Auth REST:    localhost:3000  (PID: $AUTH_PID)"
echo -e "  ${GREEN}✓${NC} Admin Service: localhost:5000  (PID: $ADMIN_PID)"
echo -e "  ${GREEN}✓${NC} Queue Service: localhost:4000  (PID: $QUEUE_PID)"

echo -e "\n${CYAN}Logs Location:${NC}"
echo -e "  logs/grpc_server.log"
echo -e "  logs/auth_rest.log"
echo -e "  logs/admin_service.log"
echo -e "  logs/queue_service.log"

echo -e "\n${CYAN}API Endpoints:${NC}"
echo -e "  ${BLUE}Auth:${NC}    http://localhost:3000"
echo -e "  ${BLUE}Queue:${NC}   http://localhost:4000"
echo -e "  ${BLUE}Admin:${NC}   http://localhost:5000"

echo -e "\n${YELLOW}To start the frontend:${NC}"
echo -e "  cd queueflex-frontend"
echo -e "  mvn clean javafx:run"

echo -e "\n${YELLOW}To stop all services:${NC}"
echo -e "  Press ${RED}Ctrl+C${YELLOW} or run: ${RED}./stop_all.sh${NC}"

echo -e "\n${YELLOW}To view logs in real-time:${NC}"
echo -e "  tail -f logs/grpc_server.log"
echo -e "  tail -f logs/auth_rest.log"
echo -e "  tail -f logs/admin_service.log"
echo -e "  tail -f logs/queue_service.log"

echo -e "\n${GREEN}Services are running. Press Ctrl+C to stop all services.${NC}\n"

# Wait for all background processes
wait