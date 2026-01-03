@echo off
setlocal
set "NODE_DIR=%~dp0.node_runtime\node-v20.10.0-win-x64"
set "PATH=%NODE_DIR%;%PATH%"

echo ========================================
echo LexiLens - Automated Setup (Portable)
echo ========================================

echo [INFO] Verifying portable Node.js environment...
call node --version
if %errorlevel% neq 0 (
    echo [ERROR] Could not find portable node.exe. Setup failed.
    exit /b 1
)
call npm --version

echo.
echo [INFO] Installing project dependencies...
echo (This may take a few minutes)
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install failed.
    exit /b 1
)

echo.
echo [INFO] Building extension...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] build failed.
    exit /b 1
)

echo.
echo ========================================
echo [SUCCESS] Extension built in 'dist' folder!
echo ========================================
echo You can now load the 'dist' folder in Chrome.
