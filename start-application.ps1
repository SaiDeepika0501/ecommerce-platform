# E-Commerce Platform with IoT - PowerShell Startup Script
# Requires PowerShell 5.0 or later

param(
    [switch]$NoMongoDB,
    [switch]$SkipBuild,
    [switch]$Verbose
)

# Set execution policy for current session
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force

# Enable strict mode
Set-StrictMode -Version Latest

# Colors for output
$Colors = @{
    Green = 'Green'
    Red = 'Red'
    Yellow = 'Yellow'
    Blue = 'Blue'
    Cyan = 'Cyan'
    White = 'White'
}

function Write-ColorText {
    param(
        [string]$Text,
        [string]$Color = 'White'
    )
    Write-Host $Text -ForegroundColor $Colors[$Color]
}

function Write-Header {
    param([string]$Title)
    Write-Host ""
    Write-ColorText "======================================================================" "Cyan"
    Write-ColorText "                    $Title                    " "Cyan"
    Write-ColorText "======================================================================" "Cyan"
    Write-Host ""
}

function Test-Port {
    param([int]$Port)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue
    return $connection
}

function Stop-ProcessOnPort {
    param([int]$Port)
    
    $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | 
                 Select-Object -ExpandProperty OwningProcess -Unique
    
    foreach ($processId in $processes) {
        try {
            $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
            if ($process) {
                Write-ColorText "⚠️  Stopping process $($process.ProcessName) (PID: $processId) on port $Port..." "Yellow"
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
            }
        } catch {
            # Process might have already ended
        }
    }
}

function Wait-ForService {
    param(
        [int]$Port,
        [string]$ServiceName,
        [int]$MaxAttempts = 30
    )
    
    $attempt = 0
    do {
        $attempt++
        if (Test-Port -Port $Port) {
            # Additional check for remoteEntry.js for frontend services
            if ($Port -ne 5000) {
                try {
                    $response = Invoke-WebRequest -Uri "http://localhost:$Port/remoteEntry.js" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
                    if ($response.StatusCode -eq 200) {
                        Write-ColorText "✅ $ServiceName is ready" "Green"
                        return $true
                    }
                } catch {
                    # Continue waiting
                }
            } else {
                Write-ColorText "✅ $ServiceName is ready" "Green"
                return $true
            }
        }
        
        if ($attempt -le $MaxAttempts) {
            Write-ColorText "   Waiting for $ServiceName on port $Port... Attempt $attempt/$MaxAttempts" "Yellow"
            Start-Sleep -Seconds 2
        }
    } while ($attempt -le $MaxAttempts)
    
    Write-ColorText "❌ Timeout waiting for $ServiceName on port $Port" "Red"
    return $false
}

function Start-BackgroundProcess {
    param(
        [string]$Command,
        [string]$Arguments,
        [string]$WorkingDirectory,
        [string]$LogFile
    )
    
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = $Command
    $psi.Arguments = $Arguments
    $psi.WorkingDirectory = $WorkingDirectory
    $psi.UseShellExecute = $false
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $psi.CreateNoWindow = $true
    
    $process = [System.Diagnostics.Process]::Start($psi)
    
    # Redirect output to log file
    if ($LogFile) {
        Start-Job -ScriptBlock {
            param($proc, $log)
            while (!$proc.HasExited) {
                $output = $proc.StandardOutput.ReadLine()
                if ($output) {
                    Add-Content -Path $log -Value $output
                }
            }
        } -ArgumentList $process, $LogFile | Out-Null
    }
    
    return $process
}

# Main script starts here
Write-Header "🚀 E-Commerce Platform with IoT - PowerShell Startup"

# Check prerequisites
Write-ColorText "🔍 Checking prerequisites..." "Blue"

# Check Node.js
try {
    $nodeVersion = node --version 2>$null
    Write-ColorText "✅ Node.js: $nodeVersion" "Green"
} catch {
    Write-ColorText "❌ Node.js is not installed or not in PATH" "Red"
    Write-ColorText "Please install Node.js from https://nodejs.org/" "Yellow"
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version 2>$null
    Write-ColorText "✅ npm: v$npmVersion" "Green"
} catch {
    Write-ColorText "❌ npm is not installed or not in PATH" "Red"
    exit 1
}

# Set up paths
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $ProjectRoot "backend"
$FrontendDir = Join-Path $ProjectRoot "frontend"
$LogsDir = Join-Path $ProjectRoot "logs"

# Create logs directory
if (!(Test-Path $LogsDir)) {
    New-Item -ItemType Directory -Path $LogsDir -Force | Out-Null
}

# Cleanup existing processes
Write-ColorText "🧹 Cleaning up existing processes..." "Yellow"
$portsToClean = @(3000, 3001, 3002, 3003, 3004, 3005, 5000)
foreach ($port in $portsToClean) {
    Stop-ProcessOnPort -Port $port
}

# Kill any remaining Node.js processes related to our application
Get-Process -Name "node" -ErrorAction SilentlyContinue | 
    Where-Object { $_.CommandLine -like "*ecommerce*" -or $_.CommandLine -like "*server.js*" -or $_.CommandLine -like "*webpack*" -or $_.CommandLine -like "*http-server*" } |
    ForEach-Object { 
        Write-ColorText "Stopping Node.js process: $($_.ProcessName) (PID: $($_.Id))" "Yellow"
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue 
    }

Start-Sleep -Seconds 3

# MongoDB Setup
if (!$NoMongoDB) {
    Write-ColorText "🐳 Setting up MongoDB..." "Blue"
    
    if (Test-Port -Port 27017) {
        Write-ColorText "✅ MongoDB already running on port 27017" "Green"
    } else {
        # Try to start MongoDB service
        $mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
        if ($mongoService) {
            Write-ColorText "Starting MongoDB Windows service..." "Blue"
            Start-Service -Name "MongoDB" -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 5
        } else {
            # Try Docker
            $dockerVersion = docker --version 2>$null
            if ($dockerVersion) {
                Write-ColorText "Starting MongoDB Docker container..." "Blue"
                try {
                    docker run -d --name ecommerce-mongodb -p 27017:27017 -e MONGO_INITDB_DATABASE=ecommerce mongo:latest 2>$null
                    Write-ColorText "✅ MongoDB Docker container started" "Green"
                    Start-Sleep -Seconds 10
                } catch {
                    Write-ColorText "⚠️  Failed to start MongoDB container" "Yellow"
                }
            } else {
                Write-ColorText "⚠️  MongoDB not found. Please install MongoDB or Docker" "Yellow"
                Write-ColorText "   1. MongoDB Community: https://www.mongodb.com/try/download/community" "Yellow"
                Write-ColorText "   2. Docker Desktop: https://www.docker.com/products/docker-desktop" "Yellow"
            }
        }
    }
}

# Start Backend
Write-ColorText "🔧 Starting backend server..." "Blue"
Set-Location $BackendDir

# Install dependencies if needed
if (!(Test-Path "node_modules")) {
    Write-ColorText "Installing backend dependencies..." "Yellow"
    npm install | Out-Null
}

$backendLog = Join-Path $LogsDir "backend.log"
Write-ColorText "Starting backend on port 5000..." "Blue"
$backendProcess = Start-BackgroundProcess -Command "node" -Arguments "server.js" -WorkingDirectory $BackendDir -LogFile $backendLog

# Wait for backend
if (!(Wait-ForService -Port 5000 -ServiceName "Backend")) {
    Write-ColorText "❌ Failed to start backend" "Red"
    exit 1
}

Set-Location $ProjectRoot

# Frontend Services
$frontendServices = @(
    @{Name="products"; Port=3001},
    @{Name="cart"; Port=3002},
    @{Name="users"; Port=3003},
    @{Name="orders"; Port=3004},
    @{Name="admin"; Port=3005}
)

foreach ($service in $frontendServices) {
    Write-ColorText "📦 Building and serving $($service.Name) service..." "Cyan"
    
    $serviceDir = Join-Path $FrontendDir $service.Name
    Set-Location $serviceDir
    
    if (!(Test-Path "package.json")) {
        Write-ColorText "❌ package.json not found in $serviceDir" "Red"
        continue
    }
    
    # Install dependencies if needed
    if (!(Test-Path "node_modules")) {
        Write-ColorText "Installing dependencies for $($service.Name)..." "Yellow"
        npm install | Out-Null
    }
    
    # Build the service
    if (!$SkipBuild) {
        Write-ColorText "Building $($service.Name)..." "Blue"
        $buildLog = Join-Path $LogsDir "$($service.Name)-build.log"
        npm run build 2>&1 | Out-File -FilePath $buildLog
        if ($LASTEXITCODE -ne 0) {
            Write-ColorText "❌ Build failed for $($service.Name)" "Red"
            Get-Content $buildLog | Write-ColorText -Color "Red"
            continue
        }
    }
    
    # Check if http-server is available
    try {
        http-server --version 2>$null | Out-Null
    } catch {
        Write-ColorText "Installing http-server globally..." "Yellow"
        npm install -g http-server | Out-Null
    }
    
    # Start the service
    Write-ColorText "Starting $($service.Name) on port $($service.Port)..." "Blue"
    $serviceLog = Join-Path $LogsDir "$($service.Name).log"
    $serviceProcess = Start-BackgroundProcess -Command "npx" -Arguments "http-server dist -p $($service.Port) -c-1 --cors" -WorkingDirectory $serviceDir -LogFile $serviceLog
    
    # Wait for service
    Wait-ForService -Port $service.Port -ServiceName $service.Name | Out-Null
    
    Set-Location $ProjectRoot
}

# Wait for services to stabilize
Write-ColorText "⏳ Waiting for all services to stabilize..." "Yellow"
Start-Sleep -Seconds 10

# Verify remotes
Write-ColorText "🔍 Verifying all remote entry points..." "Blue"
foreach ($port in @(3001, 3002, 3003, 3004, 3005)) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$port/remoteEntry.js" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-ColorText "   ✅ Service on port $port is accessible" "Green"
        } else {
            Write-ColorText "   ⚠️  Service on port $port may not be fully ready" "Yellow"
        }
    } catch {
        Write-ColorText "   ⚠️  Service on port $port is not accessible" "Yellow"
    }
}

# Start Shell Application
Write-ColorText "🌐 Starting shell application..." "Cyan"
$shellDir = Join-Path $FrontendDir "shell"
Set-Location $shellDir

# Install dependencies if needed
if (!(Test-Path "node_modules")) {
    Write-ColorText "Installing shell dependencies..." "Yellow"
    npm install | Out-Null
}

# Start shell
Write-ColorText "Starting shell application on port 3000..." "Blue"
$shellLog = Join-Path $LogsDir "shell.log"
$shellProcess = Start-BackgroundProcess -Command "npm" -Arguments "start" -WorkingDirectory $shellDir -LogFile $shellLog

# Wait for shell
Wait-ForService -Port 3000 -ServiceName "Shell" | Out-Null

Set-Location $ProjectRoot

# Success message
Write-Header "🎉 ALL SERVICES RUNNING!"
Write-ColorText "🌐 Main App:     http://localhost:3000" "Green"
Write-ColorText "📦 Products:     http://localhost:3001" "Green"
Write-ColorText "🛒 Cart:         http://localhost:3002" "Green"
Write-ColorText "👤 Users:        http://localhost:3003" "Green"
Write-ColorText "📋 Orders:       http://localhost:3004" "Green"
Write-ColorText "⚙️  Admin:        http://localhost:3005" "Green"
Write-ColorText "🔧 Backend:      http://localhost:5000" "Green"
Write-ColorText "🐳 MongoDB:      Port 27017" "Green"
Write-Header ""

Write-ColorText "🧪 Test the application:" "Cyan"
Write-ColorText "   • Main App: http://localhost:3000" "White"
Write-ColorText "   • Admin Panel: http://localhost:3000 (login: admin@example.com / password123)" "White"
Write-ColorText "   • IoT Dashboard: Available in Admin Panel under IoT Management tab" "White"
Write-Host ""
Write-ColorText "📋 Logs are available in the logs/ directory" "Yellow"
Write-ColorText "💡 Press Ctrl+C to exit monitoring. Services will continue running." "Yellow"
Write-ColorText "💡 To stop all services, run: .\stop-application.ps1" "Yellow"
Write-Host ""

# Monitoring loop
Write-ColorText "🔍 Monitoring services... (Press Ctrl+C to exit)" "Blue"
try {
    while ($true) {
        Start-Sleep -Seconds 30
        
        $servicesOk = $true
        foreach ($port in @(3000, 5000)) {
            if (!(Test-Port -Port $port)) {
                Write-ColorText "❌ Service on port $port has stopped" "Red"
                $servicesOk = $false
            }
        }
        
        if ($servicesOk) {
            Write-ColorText "✅ Core services are running" "Green"
        } else {
            Write-ColorText "⚠️  Some services may have issues. Check logs in $LogsDir" "Yellow"
        }
    }
} catch {
    Write-ColorText "Monitoring stopped by user" "Yellow"
} 