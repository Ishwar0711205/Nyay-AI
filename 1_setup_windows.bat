@echo off
setlocal enabledelayedexpansion
title Nyay AI - Windows Setup & Dependency Installer
cd /d "%~dp0"

echo ==============================================================================
echo             NYAY AI -- MAHARASHTRA LEGAL RESEARCH ASSISTANT
echo                     First-Time Windows Setup
echo ==============================================================================
echo.

:: 1. Check Python
echo [1/5] Checking Python installation...
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in your system PATH.
    echo Please install Python 3.10 or 3.11 from https://www.python.org/
    echo Make sure to check the box "Add Python to PATH" during installation.
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('python --version 2^>^&1') do set PYTHON_VER=%%i
echo       Detected: !PYTHON_VER!

:: 2. Check Node.js & npm
echo [2/5] Checking Node.js and npm installation...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in your system PATH.
    echo Please install Node.js (LTS version 18 or 20) from https://nodejs.org/
    echo.
    pause
    exit /b 1
)
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please reinstall Node.js.
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
for /f "tokens=*" %%i in ('npm -v') do set NPM_VER=%%i
echo       Detected Node: !NODE_VER!, npm: !NPM_VER!

:: 3. Setup Python Virtual Environment
echo [3/5] Setting up Python virtual environment (.venv)...
if not exist ".venv\Scripts\python.exe" (
    echo       Creating clean virtual environment in .venv...
    python -m venv .venv
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create virtual environment.
        pause
        exit /b 1
    )
) else (
    echo       Existing .venv found.
)

echo       Installing backend requirements...
call .venv\Scripts\activate.bat
python -m pip install --upgrade pip --quiet
python -m pip install -r backend\requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install backend dependencies.
    pause
    exit /b 1
)
echo       Backend dependencies installed successfully.

:: 4. Setup Frontend npm packages
echo [4/5] Installing frontend packages (Vite, React, Icons)...
cd frontend
if not exist "node_modules" (
    call npm install
    if !errorlevel! neq 0 (
        echo [ERROR] Failed to install frontend npm dependencies.
        cd ..
        pause
        exit /b 1
    )
) else (
    echo       node_modules already present in frontend.
)
cd ..

:: 5. Setup Environment Configuration (.env)
echo [5/5] Configuring environment file (.env)...
if not exist ".env" (
    copy .env.example .env >nul
    echo       Created .env from .env.example.
    echo.
    echo ==============================================================================
    echo [ACTION REQUIRED] Please open .env in a text editor (e.g. Notepad)
    echo and set your GEMINI_API_KEY:
    echo.
    echo    GEMINI_API_KEY=your_actual_key_here
    echo.
    echo You can obtain a free Gemini API key at: https://aistudio.google.com/
    echo ==============================================================================
) else (
    echo       Existing .env file preserved.
)

echo.
echo ==============================================================================
echo                  SETUP COMPLETED SUCCESSFULLY!
echo ==============================================================================
echo.
echo Next steps:
echo   1. Verify your GEMINI_API_KEY is saved inside .env
echo   2. Double-click "run_all.bat" (or run "2_run_backend.bat" and "3_run_frontend.bat")
echo   3. Open http://localhost:5173 in your browser
echo.
pause
