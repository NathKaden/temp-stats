@echo off
setlocal enabledelayedexpansion

:: 1. Setup .env if it doesn't exist
if not exist .env (
    copy .env.example .env
    echo Created .env from .env.example
)

:MENU
cls
echo =============================================
echo       NUC Stats Monitor - Windows Dev        
echo =============================================
echo 1. Start Dev Environment with Docker Compose (Recommended)
echo 2. Start Dev Environment Locally (Spawns separate terminals)
echo 3. Stop Docker Containers
echo 4. Exit
echo =============================================
set /p choice=Select an option [1-4]: 

if "%choice%"=="1" goto DOCKER_UP
if "%choice%"=="2" goto LOCAL_DEV
if "%choice%"=="3" goto DOCKER_DOWN
if "%choice%"=="4" goto EXIT

echo Invalid option, please choose 1, 2, 3, or 4.
ping 127.0.0.1 -n 2 >nul
goto MENU

:DOCKER_UP
echo.
echo Starting Docker Compose Dev...
docker compose -f docker-compose.dev.yml up -d --build
echo.
echo Started! Server API is at http://localhost:8001, Client is at http://localhost:3001
pause
goto MENU

:LOCAL_DEV
echo.
echo Starting Local Dev (spawning backend and frontend terminals)...

:: Create Virtual Environment if it does not exist
if not exist server\.venv (
    echo Creating virtual environment in server\.venv...
    python -m venv server\.venv
)

:: Spawn Backend
echo Launching Backend (FastAPI)...
start "Backend (FastAPI)" cmd /k "cd server && call .venv\Scripts\activate.bat && python -m pip install --upgrade pip && pip install -r requirements.txt && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

:: Spawn Frontend
echo Launching Frontend (Next.js)...
start "Frontend (Next.js)" cmd /k "cd client && npm install && npm run dev -- -p 3000"

echo.
echo Terminals launched! Backend will be at http://localhost:8000 and Frontend at http://localhost:3000
pause
goto MENU

:DOCKER_DOWN
echo.
echo Stopping Docker containers...
docker compose -f docker-compose.dev.yml down
echo Docker containers stopped.
pause
goto MENU

:EXIT
echo Goodbye!
exit /b 0
