@echo off
setlocal enabledelayedexpansion
title Nyay AI - Backend Server (Port 8000)
cd /d "%~dp0"

echo ==============================================================================
echo             NYAY AI -- MAHARASHTRA LEGAL RESEARCH ASSISTANT
echo                     Backend Server (FastAPI + ChromaDB)
echo ==============================================================================
echo.

if not exist ".venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment not found. Please run "1_setup_windows.bat" first.
    echo.
    pause
    exit /b 1
)

if not exist ".env" (
    echo [ERROR] .env file not found. Please run "1_setup_windows.bat" first.
    echo.
    pause
    exit /b 1
)

call .venv\Scripts\activate.bat

echo Starting FastAPI server at:
echo   - API Root:      http://127.0.0.1:8000
echo   - Documentation: http://127.0.0.1:8000/docs
echo   - Corpus API:    http://127.0.0.1:8000/corpus
echo.
echo Press CTRL+C to stop the backend.
echo.

python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Backend exited with error code %errorlevel%.
    pause
)
