# E-Commerce Platform - Stop All Services (PowerShell)
# Requires PowerShell 5.0 or later

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
    Write-ColorText "======================================================================" "Red"
    Write-ColorText "                    $Title                    " "Red"
    Write-ColorText "======================================================================" "Red"
    Write-Host ""
}

function Stop-ProcessOnPort {
    param([int]$Port)
    
    Write-ColorText "Stopping services on port $Port..." "Yellow"
    
    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        
        foreach ($connection in $connections) {
            $processId = $connection.OwningProcess
            $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
            
            if ($process) {
                Write-ColorText "Killing process $($process.ProcessName) (PID: $processId) on port $Port" "Yellow"
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
            }
        }
    } catch {
        # Port might not be in use
        Write-ColorText "No processes found on port $Port" "Blue"
    }
}

function Test-Port {
    param([int]$Port)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue
    return $connection
}

# Main script
Write-Header "🛑 E-Commerce Platform - Stopping All Services"

# Stop all application ports
Write-ColorText "🧹 Stopping all E-Commerce Platform services..." "Blue"
$portsToStop = @(3000, 3001, 3002, 3003, 3004, 3005, 5000)

foreach ($port in $portsToStop) {
    Stop-ProcessOnPort -Port $port
}

# Kill Node.js processes related to our application
Write-ColorText "Stopping Node.js processes..." "Yellow"
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | 
    Where-Object { 
        $_.CommandLine -like "*ecommerce*" -or 
        $_.CommandLine -like "*server.js*" -or 
        $_.CommandLine -like "*webpack*" -or 
        $_.CommandLine -like "*http-server*" 
    }

foreach ($process in $nodeProcesses) {
    Write-ColorText "Stopping Node.js process: $($process.ProcessName) (PID: $($process.Id))" "Yellow"
    Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
}

# Wait for processes to terminate
Start-Sleep -Seconds 3

# Verify ports are free
Write-Host ""
Write-ColorText "🔍 Verifying ports are free..." "Blue"
$allStopped = $true

foreach ($port in $portsToStop) {
    if (Test-Port -Port $port) {
        Write-ColorText "⚠️  Port $port still in use" "Yellow"
        $allStopped = $false
    } else {
        Write-ColorText "✅ Port $port is free" "Green"
    }
}

Write-Host ""
if ($allStopped) {
    Write-ColorText "✅ All services stopped successfully" "Green"
} else {
    Write-ColorText "⚠️  Some services may still be running. You might need to:" "Yellow"
    Write-ColorText "   1. Check Task Manager for remaining Node.js processes" "Yellow"
    Write-ColorText "   2. Restart your computer if processes won't terminate" "Yellow"
    Write-ColorText "   3. Manually kill remaining processes using Task Manager" "Yellow"
}

Write-Host ""
Write-ColorText "📋 Log files are preserved in the logs/ directory" "Cyan"
Write-ColorText "💡 To start the application again, run: .\start-application.ps1" "Cyan"
Write-Host ""

Read-Host "Press Enter to exit" 