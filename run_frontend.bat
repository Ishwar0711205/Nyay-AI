@echo off
cd /d "%~dp0frontend"
echo === Nyay AI Frontend ===
if not exist node_modules (
  echo Installing frontend dependencies [first run only]...
  call npm install
  if errorlevel 1 (pause & exit /b 1)
)
if not exist .env (
  copy .env.example .env >nul
)
echo Starting React/Vite at http://localhost:5173
call npm run dev
