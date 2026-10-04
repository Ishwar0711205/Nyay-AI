@echo off
cd /d "%~dp0"
echo === Nyay AI Backend ===
if not exist .env (
  echo ERROR: .env not found.
  echo Copy .env.example to .env and add GEMINI_API_KEY and JWT_SECRET.
  pause
  exit /b 1
)
if not exist .backend_ready (
  echo Installing Python dependencies [first run only]...
  python -m pip install -r backend\requirements.txt
  if errorlevel 1 (pause & exit /b 1)
  type nul > .backend_ready
)
echo Starting FastAPI at http://localhost:8000
python -m uvicorn backend.app:app --reload --port 8000
pause
