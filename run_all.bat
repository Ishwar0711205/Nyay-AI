@echo off
setlocal
title Nyay AI - Master Launcher
cd /d "%~dp0"

echo ==============================================================================
echo             NYAY AI -- MAHARASHTRA LEGAL RESEARCH ASSISTANT
echo                         1-Click Application Launcher
echo ==============================================================================
echo.

if not exist ".venv\Scripts\python.exe" (
    echo [!] First-time setup has not been run yet.
    echo Launching 1_setup_windows.bat...
    call "1_setup_windows.bat"
    if errorlevel 1 exit /b 1
)

if not exist ".env" (
    echo [ERROR] .env file not found. Please create .env and set GEMINI_API_KEY.
    pause
    exit /b 1
)

echo [1/2] Starting Nyay AI Backend in a separate window...
start "Nyay AI - Backend (Port 8000)" cmd /k "call "%~dp02_run_backend.bat""

timeout /t 3 /nobreak >nul

echo [2/2] Starting Nyay AI Frontend in a separate window...
start "Nyay AI - Frontend (Port 5173)" cmd /k "call "%~dp03_run_frontend.bat""

timeout /t 2 /nobreak >nul

echo Opening browser at http://localhost:5173 ...
start http://localhost:5173

echo.
echo ==============================================================================
echo Nyay AI is starting up!
echo   - Frontend: http://localhost:5173
echo   - Backend:  http://127.0.0.1:8000
echo.
echo You can close this launcher window. Keep the Backend and Frontend windows open.
echo ==============================================================================
echo.
pause
