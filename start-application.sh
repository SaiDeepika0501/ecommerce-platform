#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Store the original directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

# Global variables to track PIDs - using simple arrays instead of associative arrays
SERVICE_PIDS=""
SERVICE_NAMES=""

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to kill processes on a port
kill_port() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null)
    if [ -n "$pids" ]; then
        echo $pids | xargs kill -9 2>/dev/null
        sleep 1
    fi
}

# Function to cleanup all processes
cleanup_processes() {
    print_status "Cleaning up existing processes..."
    
    # Kill specific processes
    pkill -f "webpack-dev-server" 2>/dev/null || true
    pkill -f "webpack serve" 2>/dev/null || true
    pkill -f "nodemon" 2>/dev/null || true
    
    # Kill processes on specific ports
    kill_port 3000
    kill_port 3001
    kill_port 3002
    kill_port 3003
    kill_port 3004
    kill_port 5000
    
    # Wait for processes to terminate
    sleep 2
    
    # Clear PID tracking
    SERVICE_PIDS=""
    SERVICE_NAMES=""
}

# Function to add service PID
add_service_pid() {
    local service_name=$1
    local pid=$2
    if [ -z "$SERVICE_PIDS" ]; then
        SERVICE_PIDS="$pid"
        SERVICE_NAMES="$service_name"
    else
        SERVICE_PIDS="$SERVICE_PIDS $pid"
        SERVICE_NAMES="$SERVICE_NAMES $service_name"
    fi
}

# Function to wait for a service to be ready
wait_for_service() {
    local service_name=$1
    local port=$2
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if port_in_use $port; then
            print_status "$service_name is ready on port $port"
            return 0
        fi
        
        print_status "Waiting for $service_name on port $port... (attempt $attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    done
    
    print_error "$service_name failed to start on port $port after $max_attempts attempts"
    return 1
}

# Function to start a service properly
start_service() {
    local service_name=$1
    local service_dir=$2
    local port=$3
    local start_command=$4
    
    print_status "Starting $service_name..."
    
    # Check if directory exists
    if [ ! -d "$service_dir" ]; then
        print_error "Directory $service_dir does not exist"
        return 1
    fi
    
    # Kill any existing process on this port
    kill_port $port
    
    # Create log directory
    mkdir -p "$SCRIPT_DIR/logs"
    
    # Start the service in background with proper logging
    cd "$service_dir" || return 1
    
    # For webpack dev servers, use setsid to create a new session and properly detach from terminal
    # Also redirect stdin to /dev/null to prevent hanging
    if [[ "$start_command" == *"webpack serve"* ]]; then
        setsid $start_command < /dev/null > "$SCRIPT_DIR/logs/${service_name}.log" 2>&1 &
    else
        # For other services like backend, use nohup as before
        nohup $start_command > "$SCRIPT_DIR/logs/${service_name}.log" 2>&1 &
    fi
    
    local pid=$!
    
    # Disown the process to prevent it from being killed when the shell exits
    disown $pid 2>/dev/null || true
    
    add_service_pid "$service_name" "$pid"
    
    print_status "$service_name started with PID $pid"
    
    # Return to script directory
    cd "$SCRIPT_DIR" || return 1
    
    return 0
}

# Function to setup environment file
setup_environment() {
    if [ ! -f "backend/.env" ]; then
        print_status "Creating environment file..."
        cat > backend/.env << EOF
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-secret-key-here-replace-in-production-\$(date +%s)\$(openssl rand -hex 16)
CORS_ORIGIN=http://localhost:3000
SOCKET_ENABLED=true
AUTO_SEED=true
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF
    else
        print_status "Environment file already exists at backend/.env"
    fi
}

# Function to install dependencies
install_dependencies() {
    print_header "Installing Dependencies"
    
    # Install root dependencies
    print_status "Installing root dependencies..."
    npm install --silent
    
    # Install backend dependencies
    print_status "Installing backend dependencies..."
    (cd backend && npm install --silent)
    
    # Install frontend service dependencies
    local services=("shell" "products" "cart" "users" "admin")
    for service in "${services[@]}"; do
        print_status "Installing $service service dependencies..."
        (cd "frontend/$service" && npm install --silent)
    done
    
    print_status "All dependencies installed successfully!"
}

# Function to check MongoDB
check_mongodb() {
    print_header "Database Setup"
    print_status "Checking for MongoDB..."
    
    if port_in_use 27017; then
        print_status "MongoDB is running on port 27017"
        if docker ps | grep -q mongo; then
            print_status "MongoDB is running in Docker container"
        fi
        return 0
    else
        print_warning "MongoDB is not running on port 27017"
        
        # Check if Docker is available
        if command_exists docker; then
            print_status "Starting MongoDB in Docker container..."
            
            # Try to start MongoDB using Docker
            if docker run -d --name ecommerce-mongo -p 27017:27017 mongo:latest > /dev/null 2>&1; then
                print_status "MongoDB Docker container started successfully"
            else
                # Container might already exist, try to start it
                if docker start ecommerce-mongo > /dev/null 2>&1; then
                    print_status "Existing MongoDB container started"
                else
                    print_warning "Failed to start MongoDB container"
                    return 1
                fi
            fi
            
            # Wait for MongoDB to be ready
            print_status "Waiting for MongoDB to be ready..."
            local max_attempts=30
            local attempt=1
            
            while [ $attempt -le $max_attempts ]; do
                if port_in_use 27017; then
                    print_status "MongoDB is now ready on port 27017"
                    return 0
                fi
                
                print_status "Waiting for MongoDB... (attempt $attempt/$max_attempts)"
                sleep 2
                ((attempt++))
            done
            
            print_error "MongoDB failed to start after $max_attempts attempts"
            return 1
        else
            print_warning "Docker is not available"
            print_warning "Please start MongoDB manually or install Docker"
            return 1
        fi
    fi
}

# Function to start all services
start_all_services() {
    print_header "Starting Services"
    cleanup_processes
    
    # Start backend server
    print_status "Starting backend server..."
    start_service "backend" "$SCRIPT_DIR/backend" 5000 "npm run dev"
    
    if wait_for_service "Backend server" 5000; then
        print_status "Backend server started successfully"
    else
        print_error "Failed to start backend server"
        return 1
    fi
    
    # Start frontend services
    print_status "Starting frontend services..."
    
    # Start each service individually
    start_service "shell" "$SCRIPT_DIR/frontend/shell" 3000 "npm start"
    start_service "products" "$SCRIPT_DIR/frontend/products" 3001 "npm start"
    start_service "cart" "$SCRIPT_DIR/frontend/cart" 3002 "npm start"
    start_service "users" "$SCRIPT_DIR/frontend/users" 3003 "npm start"
    start_service "admin" "$SCRIPT_DIR/frontend/admin" 3004 "npm start"
    
    # Wait for all services to be ready
    local services=(
        "shell:3000"
        "products:3001"
        "cart:3002"
        "users:3003"
        "admin:3004"
    )
    
    local started_services=0
    local total_services=${#services[@]}
    
    for service_info in "${services[@]}"; do
        IFS=':' read -ra SERVICE_PARTS <<< "$service_info"
        local service_name="${SERVICE_PARTS[0]}"
        local service_port="${SERVICE_PARTS[1]}"
        
        if wait_for_service "$service_name" "$service_port"; then
            ((started_services++))
        else
            print_error "Failed to start $service_name on port $service_port"
        fi
    done
    
    if [ $started_services -eq $total_services ]; then
        print_status "All $total_services frontend services started successfully!"
    else
        print_warning "Only $started_services out of $total_services frontend services started"
    fi
    
    # Verify all services are responding
    verify_all_services
    
    return 0
}

# Function to verify all services are responding
verify_all_services() {
    print_header "Service Status Verification"
    
    # Check backend
    if curl -s http://localhost:5000/health > /dev/null 2>&1; then
        echo "✅ Backend API (port 5000)"
    else
        echo "❌ Backend API (port 5000)"
    fi
    
    # Check frontend services
    local frontend_services=(
        "Shell:3000"
        "Products:3001"
        "Cart:3002"
        "Users:3003"
        "Admin:3004"
    )
    
    for service_info in "${frontend_services[@]}"; do
        IFS=':' read -ra SERVICE_PARTS <<< "$service_info"
        local service_name="${SERVICE_PARTS[0]}"
        local service_port="${SERVICE_PARTS[1]}"
        
        if curl -s http://localhost:$service_port > /dev/null 2>&1; then
            echo "✅ $service_name (port $service_port)"
        else
            echo "❌ $service_name (port $service_port)"
        fi
    done
    
    print_status "Service verification complete"
}

# Function to monitor services
monitor_services() {
    print_header "Service Monitoring"
    print_status "Monitoring services. Press Ctrl+C to stop all services."
    
    while true; do
        # Check if all services are still running
        local all_running=true
        
        # Convert space-separated strings to arrays for iteration
        local pids_array=($SERVICE_PIDS)
        local names_array=($SERVICE_NAMES)
        
        for i in "${!pids_array[@]}"; do
            local pid="${pids_array[$i]}"
            local service_name="${names_array[$i]}"
            
            if ! kill -0 "$pid" 2>/dev/null; then
                print_error "$service_name (PID $pid) has stopped unexpectedly"
                all_running=false
                
                # Try to restart the service
                case $service_name in
                    "backend")
                        start_service "backend" "$SCRIPT_DIR/backend" 5000 "npm run dev"
                        ;;
                    "shell")
                        start_service "shell" "$SCRIPT_DIR/frontend/shell" 3000 "npm start"
                        ;;
                    "products")
                        start_service "products" "$SCRIPT_DIR/frontend/products" 3001 "npm start"
                        ;;
                    "cart")
                        start_service "cart" "$SCRIPT_DIR/frontend/cart" 3002 "npm start"
                        ;;
                    "users")
                        start_service "users" "$SCRIPT_DIR/frontend/users" 3003 "npm start"
                        ;;
                    "admin")
                        start_service "admin" "$SCRIPT_DIR/frontend/admin" 3004 "npm start"
                        ;;
                esac
            fi
        done
        
        if $all_running; then
            echo -ne "\r$(date '+%H:%M:%S') - All services running ✅"
        fi
        
        sleep 10
    done
}

# Function to display service information
show_service_info() {
    print_header "Service Information"
    echo "🚀 Application is running!"
    echo ""
    echo "Main Application:"
    echo "  🌐 Shell App: http://localhost:3000"
    echo ""
    echo "Micro-Frontend Services:"
    echo "  📦 Products: http://localhost:3001"
    echo "  🛒 Cart: http://localhost:3002"
    echo "  👤 Users: http://localhost:3003"
    echo "  🔧 Admin: http://localhost:3004"
    echo ""
    echo "Backend Services:"
    echo "  🔧 API Server: http://localhost:5000"
    echo "  📚 Health Check: http://localhost:5000/health"
    echo ""
    echo "📋 Service PIDs:"
    local pids_array=($SERVICE_PIDS)
    local names_array=($SERVICE_NAMES)
    for i in "${!pids_array[@]}"; do
        echo "  ${names_array[$i]}: ${pids_array[$i]}"
    done
    echo ""
    echo "📊 Logs location: $SCRIPT_DIR/logs/"
    echo ""
    
    # Check database status
    if port_in_use 27017; then
        echo "✅ Database Status: MongoDB is running on port 27017"
        if docker ps | grep -q ecommerce-mongo; then
            echo "   (Running in Docker container: ecommerce-mongo)"
        fi
    else
        echo "❌ Database Status: MongoDB is not running"
    fi
}

# Function to handle cleanup on exit
cleanup_on_exit() {
    print_header "Shutting Down Services"
    print_status "Stopping all services..."
    
    # Kill all background processes
    local pids_array=($SERVICE_PIDS)
    local names_array=($SERVICE_NAMES)
    for i in "${!pids_array[@]}"; do
        local pid="${pids_array[$i]}"
        local service_name="${names_array[$i]}"
        if kill -0 "$pid" 2>/dev/null; then
            print_status "Stopping $service_name (PID $pid)"
            kill "$pid" 2>/dev/null || true
        fi
    done
    
    # Additional cleanup
    cleanup_processes
    
    # Ask about MongoDB
    if docker ps | grep -q ecommerce-mongo; then
        print_status "Stop MongoDB container? (y/n)"
        read -t 5 -n 1 response
        echo ""
        if [[ $response == "y" || $response == "Y" ]]; then
            print_status "Stopping MongoDB container..."
            docker stop ecommerce-mongo > /dev/null 2>&1
            print_status "MongoDB container stopped"
        fi
    fi
    
    print_status "All services stopped"
    exit 0
}

# Main execution
main() {
    print_header "E-Commerce Platform Startup Script"
    
    # Check prerequisites
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_status "Node.js version: $(node --version)"
    print_status "npm version: $(npm --version)"
    
    # Setup environment
    setup_environment
    
    # Install dependencies
    install_dependencies
    
    # Check and setup MongoDB
    if ! check_mongodb; then
        print_warning "MongoDB setup failed - continuing without database"
    fi
    
    # Start all services
    if start_all_services; then
        # Show service information
        show_service_info
        
        # Setup signal handlers for graceful shutdown
        trap cleanup_on_exit SIGINT SIGTERM
        
        # Monitor services
        monitor_services
    else
        print_error "Failed to start all services"
        cleanup_on_exit
        exit 1
    fi
}

# Run main function
main "$@" 