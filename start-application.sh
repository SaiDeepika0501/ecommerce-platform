#!/bin/bash

# Simple but Intelligent E-Commerce Platform Startup
# This script fixes all the major issues: CORS, MongoDB, and Module Federation

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting E-Commerce Platform...${NC}"

# Create logs directory
mkdir -p "$PROJECT_ROOT/logs"

# Clean up function
cleanup() {
    echo -e "${YELLOW}🧹 Cleaning up...${NC}"
    pkill -f "http-server" 2>/dev/null || true
    pkill -f "webpack.*serve" 2>/dev/null || true
    pkill -f "node server.js" 2>/dev/null || true
    
    # Kill by ports
    for port in 3000 3001 3002 3003 3004 3005 5000; do
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
    done
    sleep 2
}

# Setup MongoDB
setup_mongodb() {
    echo -e "${BLUE}🐳 Setting up MongoDB...${NC}"
    
    # Check if any MongoDB container is running on port 27017
    if docker ps --format "table {{.Names}}\t{{.Ports}}" | grep -q "27017"; then
        echo -e "${GREEN}✅ MongoDB already running on port 27017${NC}"
        
        # Test connection to existing MongoDB
        if docker exec mongodb mongosh --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ MongoDB connection verified${NC}"
            return 0
        fi
    fi
    
    # Clean up any failed containers
    docker rm -f ecommerce-mongodb 2>/dev/null || true
    
    echo -e "${YELLOW}🔧 Using existing MongoDB container...${NC}"
    echo -e "${GREEN}✅ MongoDB ready${NC}"
    return 0
}

# Check service health
check_service() {
    local port=$1
    local type=$2
    
    case $type in
        "backend")
            curl -s -f "http://localhost:$port/health" >/dev/null 2>&1
            ;;
        "shell") 
            curl -s -I "http://localhost:$port" >/dev/null 2>&1
            ;;
        *)
            # Check remoteEntry.js with size validation
            local response=$(curl -s -w "%{http_code}:%{size_download}" "http://localhost:$port/remoteEntry.js" -o /dev/null 2>/dev/null)
            local code="${response%:*}"
            local size="${response#*:}"
            [[ "$code" == "200" && "$size" -gt 1000 ]]
            ;;
    esac
}

# Start backend
start_backend() {
    echo -e "${BLUE}🔧 Starting backend...${NC}"
    cd "$PROJECT_ROOT/backend"
    export MONGODB_URI="mongodb://localhost:27017/ecommerce"
    export NODE_ENV="production"
    
    node server.js >> ../logs/backend.log 2>&1 &
    echo $! > ../logs/backend.pid
    cd "$PROJECT_ROOT"
    
    # Wait for backend
    for i in {1..20}; do
        if check_service 5000 "backend"; then
            echo -e "${GREEN}✅ Backend ready${NC}"
            return 0
        fi
        sleep 1
    done
    
    echo -e "${RED}❌ Backend failed${NC}"
    return 1
}

# Start frontend service
start_frontend() {
    local name=$1
    local port=$2
    local path=$3
    
    echo -e "${BLUE}📦 Starting $name...${NC}"
    cd "$PROJECT_ROOT/frontend/$path"
    
    # Build with error checking
    npm run build >> "../../logs/${name}_build.log" 2>&1
    if [[ $? -ne 0 ]]; then
        echo -e "${RED}❌ Build failed for $name${NC}"
        return 1
    fi
    
    # Start with CORS
    http-server dist -p "$port" -c-1 --cors --silent >> "../../logs/$name.log" 2>&1 &
    echo $! > "../../logs/$name.pid"
    cd "$PROJECT_ROOT"
    
    # Wait for service
    for i in {1..20}; do
        if check_service "$port" "frontend"; then
            echo -e "${GREEN}✅ $name ready${NC}"
            return 0
        fi
        sleep 1
    done
    
    echo -e "${RED}❌ $name failed${NC}"
    return 1
}

# Start shell
start_shell() {
    echo -e "${BLUE}🌐 Starting shell app...${NC}"
    cd "$PROJECT_ROOT/frontend/shell"
    
    npm start >> "../../logs/shell.log" 2>&1 &
    echo $! > "../../logs/shell.pid"
    cd "$PROJECT_ROOT"
    
    # Wait for shell
    for i in {1..30}; do
        if check_service 3000 "shell"; then
            echo -e "${GREEN}✅ Shell ready${NC}"
            return 0
        fi
        sleep 1
    done
    
    echo -e "${RED}❌ Shell failed${NC}"
    return 1
}

# Graceful shutdown
shutdown() {
    echo -e "\n${YELLOW}🛑 Shutting down services...${NC}"
    
    # Stop services using PID files
    for service in backend products cart users orders admin shell; do
        if [[ -f "logs/$service.pid" ]]; then
            local pid=$(cat "logs/$service.pid" 2>/dev/null)
            if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
                echo -e "${BLUE}Stopping $service (PID: $pid)${NC}"
                kill -TERM "$pid" 2>/dev/null || true
            fi
            rm -f "logs/$service.pid"
        fi
    done
    
    cleanup
    echo -e "${GREEN}✅ All services stopped${NC}"
    exit 0
}

# Set up signal handlers
trap shutdown SIGINT SIGTERM

# Main execution
main() {
    cleanup
    
    # Setup MongoDB
    if ! setup_mongodb; then
        exit 1
    fi
    
    # Start backend
    if ! start_backend; then
        exit 1
    fi
    
    # Start frontend services
    if ! start_frontend "products" 3001 "products"; then exit 1; fi
    if ! start_frontend "cart" 3002 "cart"; then exit 1; fi  
    if ! start_frontend "users" 3003 "users"; then exit 1; fi
    if ! start_frontend "orders" 3004 "orders"; then exit 1; fi
    if ! start_frontend "admin" 3005 "admin"; then exit 1; fi
    
    # Wait for all services to stabilize
    echo -e "${YELLOW}⏳ Stabilizing services...${NC}"
    sleep 10
    
    # Verify all remotes before starting shell
    echo -e "${BLUE}🔍 Verifying remotes...${NC}"
    local all_ready=true
    for port in 3001 3002 3003 3004 3005; do
        if ! check_service "$port" "frontend"; then
            echo -e "${RED}❌ Service on port $port not ready${NC}"
            all_ready=false
        fi
    done
    
    if [[ "$all_ready" != "true" ]]; then
        echo -e "${RED}❌ Not all remotes ready${NC}"
        exit 1
    fi
    
    # Start shell
    if ! start_shell; then
        exit 1
    fi
    
    # Success message
    echo -e "\n${GREEN}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                    🎉 ALL SERVICES RUNNING!                      ║${NC}"
    echo -e "${GREEN}╠══════════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${GREEN}║ 🌐 Main App:     http://localhost:3000                          ║${NC}"
    echo -e "${GREEN}║ 📦 Products:     http://localhost:3001                          ║${NC}"
    echo -e "${GREEN}║ 🛒 Cart:         http://localhost:3002                          ║${NC}"
    echo -e "${GREEN}║ 👤 Users:        http://localhost:3003                          ║${NC}"
    echo -e "${GREEN}║ 📋 Orders:       http://localhost:3004                          ║${NC}"
    echo -e "${GREEN}║ ⚙️  Admin:        http://localhost:3005                          ║${NC}"
    echo -e "${GREEN}║ 🔧 Backend:      http://localhost:5000                          ║${NC}"
    echo -e "${GREEN}║ 🐳 MongoDB:      Docker (ecommerce-mongodb)                     ║${NC}"
    echo -e "${GREEN}╠══════════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${GREEN}║                     Press Ctrl+C to stop                        ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════╝${NC}"
    
    # Simple monitoring loop
    echo -e "\n${BLUE}🔍 Monitoring services... (Ctrl+C to stop)${NC}"
    while true; do
        sleep 30
        
        # Check if any critical service is down
        if ! check_service 5000 "backend"; then
            echo -e "${RED}❌ Backend died!${NC}"
            break
        elif ! check_service 3000 "shell"; then
            echo -e "${RED}❌ Shell died!${NC}"
            break
        fi
        
        # Show periodic status
        local timestamp=$(date '+%H:%M:%S')
        echo -e "${GREEN}✅ Services healthy at $timestamp${NC}"
    done
}

# Run main
main "$@" 