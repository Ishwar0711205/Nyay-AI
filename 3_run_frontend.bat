@echo off
setlocal enabledelayedexpansion
title Nyay AI - Frontend Application (Port 5173)
cd /d "%~dp0frontend"

echo ==============================================================================
echo             NYAY AI -- MAHARASHTRA LEGAL RESEARCH ASSISTANT
echo                     Frontend Server (React 18 + Vite)
echo ==============================================================================
echo.

if not exist "node_modules" (
    echo [ERROR] Frontend node_modules not found. Please run "1_setup_windows.bat" first.
    echo.
    pause
    exit /b 1
)

echo Starting Vite development server...
echo   - Local Portal: http://localhost:5173
echo.
echo Press CTRL+C to stop the frontend.
echo.

call npm run dev
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Frontend exited with error code %errorlevel%.
    pause
)
