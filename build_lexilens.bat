@echo off
echo ===========================================
echo LexiLens - Quick Installer
echo ===========================================

REM Check for npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] 'npm' was not found in your PATH.
    echo Please download and install Node.js from https://nodejs.org/
    echo After installing, restart your computer and run this script again.
    echo.
    echo If you have installed Node.js, you may need to add it to your PATH environment variable.
    pause
    exit /b 1
)

echo [INFO] Found npm. Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies.
    pause
    exit /b 1
)

echo.
echo [INFO] Dependencies installed successfully.
echo [INFO] Building LexiLens extension...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed.
    pause
    exit /b 1
)

echo.
echo ===========================================
echo [SUCCESS] Build complete!
echo ===========================================
echo The extension is ready in the 'dist' folder.
echo You can now load it in your browser.
pause
