#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Lesprivate Development Environment...${NC}"

# Helper function to check commands
check_command() {
    if ! command -v "$1" &> /dev/null; then
        echo -e "${RED}Error: '$1' command not found. Please make sure it is installed and in your PATH.${NC}"
        return 1
    fi
}

# Function to check if a port is in use
check_port() {
    # Check if lsof exists
    if ! command -v lsof &> /dev/null; then
        return
    fi
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}Warning: Port $port is already in use.${NC}"
    fi
}

# Function to check and start Docker containers
check_docker() {
    echo -e "${BLUE}Checking Docker containers...${NC}"
    
    check_command docker || exit 1

    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}Error: Docker is not running. Please start Docker Desktop first.${NC}"
        exit 1
    fi

    # Check if docker-compose.yml exists
    if [ ! -f "docker-compose.yml" ]; then
        echo -e "${RED}Error: docker-compose.yml not found.${NC}"
        exit 1
    fi

    echo -e "Starting Database and Redis via Docker Compose..."
    docker compose up -d

    # Optional: Wait for MySQL to be ready
    echo -e "Waiting for services to be ready..."
    sleep 5
}

# Cleanup function to kill background processes
cleanup() {
    echo -e "\n${RED}Stopping all services...${NC}"
    # Kill all child processes of this script
    pkill -P $$ 2>/dev/null
    echo -e "${GREEN}All services stopped.${NC}"
}

# Set trap for cleanup on exit
trap cleanup EXIT INT TERM

# Main execution
check_docker

echo -e "\n${BLUE}Starting services...${NC}"

# Start Backend
echo -e "${GREEN}Starting Backend (Go API) on port 8080...${NC}"
check_port 8080
if ! command -v go &> /dev/null; then
    echo -e "${RED}Skipping Backend startup: 'go' not found.${NC}"
    echo -e "${BLUE}Please install Go from https://go.dev/dl/${NC}"
else
    cd backend
    if [ ! -f "go.mod" ]; then
        echo -e "${RED}Error: go.mod not found in backend directory.${NC}"
    else
        echo -e "Running go mod download..."
        go mod download
        echo -e "Running go generate..."
        go generate ./...
        go run . &
        BACKEND_PID=$!
    fi
    cd ..
fi

# Start Admin Dashboard
echo -e "${GREEN}Starting Admin Dashboard on port 3000...${NC}"
check_command npm || exit 1
check_port 3000
cd admin
if [ ! -d "node_modules" ]; then
    echo -e "Installing dependencies for Admin (legacy peer deps)..."
    npm install --legacy-peer-deps
fi
npm run dev &
ADMIN_PID=$!
cd ..

# Start Frontend Customer App
echo -e "${GREEN}Starting Frontend (Customer App) on port 3001...${NC}"
check_port 3001
cd frontend
if [ ! -d "node_modules" ]; then
    echo -e "Installing dependencies for Frontend (legacy peer deps)..."
    npm install --legacy-peer-deps
fi
npm run dev -- -p 3001 &
FRONTEND_PID=$!
cd ..

# Start Homepage
echo -e "${GREEN}Starting Homepage on port 5173...${NC}"
check_port 5173
cd homepage
if [ ! -d "node_modules" ]; then
    echo -e "Installing dependencies for Homepage..."
    npm install
fi
npm run dev &
HOMEPAGE_PID=$!
cd ..

# Start Mentor App
echo -e "${GREEN}Starting Mentor App on port 3002...${NC}"
check_port 3002
cd mentor
if [ ! -d "node_modules" ]; then
    echo -e "Installing dependencies for Mentor App..."
    npm install
fi
npm run dev -- -p 3002 &
MENTOR_PID=$!
cd ..

echo -e "\n${GREEN}All services started!${NC}"
if command -v go &> /dev/null; then
    echo -e "Backend:   http://localhost:8080"
else
    echo -e "Backend:   (Not started - go check above)"
fi
echo -e "Admin:     http://localhost:3000"
echo -e "Frontend:  http://localhost:3001"
echo -e "Mentor:    http://localhost:3002"
echo -e "Homepage:  http://localhost:5173"
echo -e "${BLUE}Press Ctrl+C to stop all services.${NC}"

# Wait for all background processes
wait
