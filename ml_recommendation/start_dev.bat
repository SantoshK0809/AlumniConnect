@echo off
REM Quick Integration Setup for Windows (Without Training Data)
REM This script sets up mock mode for immediate development

echo.
echo ╔════════════════════════════════════════════════════════════════════════════════╗
echo ║   Alumni Recommendation System - Development Integration Setup (No Training)   ║
echo ╚════════════════════════════════════════════════════════════════════════════════╝
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [X] Python not found
    pause
    exit /b 1
)
echo [✓] Python found

REM Navigate to ML recommendation directory
cd d:\AluminiConnect\ml_recommendation
if errorlevel 1 (
    echo [X] ML recommendation directory not found at d:\AluminiConnect\ml_recommendation
    pause
    exit /b 1
)
echo [✓] ML recommendation directory found

REM Activate virtual environment
if not exist "venv\Scripts\activate.bat" (
    echo [!] Virtual environment not found. Creating...
    python -m venv venv
)
call venv\Scripts\activate.bat
echo [✓] Virtual environment activated

REM Install dependencies if needed
pip list | findstr flask >nul 2>&1
if errorlevel 1 (
    echo [!] Installing dependencies...
    pip install -r requirements.txt -q
)
echo [✓] Dependencies ready

REM Create necessary directories
if not exist "models" mkdir models
if not exist "data" mkdir data
if not exist "logs" mkdir logs
echo [✓] Directories ready

REM Create/update .env with development settings
if not exist ".env" (
    echo [!] Creating .env file with development settings
    (
        echo MONGODB_URI=mongodb://localhost:27017
        echo DATABASE_NAME=aluminiconnect
        echo USE_MOCK_MODE=True
        echo MODEL_TYPE=hybrid
        echo API_PORT=5000
    ) > .env
    echo [✓] .env created
) else (
    echo [✓] .env config found
)

echo.
echo ╔════════════════════════════════════════════════════════════════════════════════╗
echo ║                         Setup Complete! Ready to Start                         ║
echo ╚════════════════════════════════════════════════════════════════════════════════╝
echo.
echo Running Development API in MOCK MODE...
echo (No training data needed - uses realistic test data)
echo.
echo.
python app_dev.py
