@echo off
REM Quick start script for Alumni Recommendation System (Windows)

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════════════════════════╗
echo ║                 Alumni Recommendation System - Quick Start                      ║
echo ║                              Windows Setup                                      ║
echo ╚════════════════════════════════════════════════════════════════════════════════╝
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [X] Python not found. Please install Python 3.8 or higher.
    echo    Download from: https://www.python.org/downloads/
    pause
    exit /b 1
)

for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo [✓] Python %PYTHON_VERSION% found
echo.

REM Step 1: Create virtual environment
echo [Step 1] Creating virtual environment...
if not exist "venv" (
    python -m venv venv
    echo [✓] Virtual environment created
) else (
    echo [✓] Virtual environment already exists
)
echo.

REM Step 2: Activate virtual environment
echo [Step 2] Activating virtual environment...
call venv\Scripts\activate.bat
echo [✓] Virtual environment activated
echo.

REM Step 3: Install dependencies
echo [Step 3] Installing dependencies...
python -m pip install --upgrade pip -q
pip install -r requirements.txt -q
echo [✓] Dependencies installed
echo.

REM Step 4: Create directories
echo [Step 4] Creating necessary directories...
if not exist "data" mkdir data
if not exist "models" mkdir models
if not exist "logs" mkdir logs
echo [✓] Directories created
echo.

REM Step 5: Check .env file
echo [Step 5] Checking environment configuration...
if exist ".env" (
    echo [✓] .env file found
) else (
    echo [!] .env file not found. Creating default .env...
    (
        echo MONGODB_URI=mongodb://localhost:27017
        echo DATABASE_NAME=aluminiconnect
        echo MODEL_TYPE=hybrid
        echo MODEL_DIR=./models
        echo DATA_DIR=./data
        echo API_PORT=5000
    ) > .env
    echo [✓] Default .env created. Please update with your settings.
)
echo.

REM Summary
echo ╔════════════════════════════════════════════════════════════════════════════════╗
echo ║                           Setup Complete! [✓]                                  ║
echo ╚════════════════════════════════════════════════════════════════════════════════╝
echo.
echo Next steps:
echo.
echo 1. Update .env with your MongoDB connection string:
echo    notepad .env
echo.
echo 2. Extract data from MongoDB and train the model:
echo    python train.py --model-type hybrid
echo.
echo    Or train from local CSV files (if available^):
echo    python train.py --model-type hybrid --use-local-files
echo.
echo 3. Start the API server:
echo    python app.py
echo.
echo 4. Run tests to validate the model:
echo    python test.py
echo.
echo Note: The virtual environment is already activated.
echo To deactivate later, run: deactivate
echo.
pause
