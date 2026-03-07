@echo off
echo ===================================================
echo     Piano Project - Windows Setup and Run Script
echo ===================================================
echo.

:: 1. Backend Setup and Run
echo [1/2] Setting up Backend...
cd piano-backend

:: Check if virtual environment exists, if not create it
if not exist "venv\" (
    echo Creating Python virtual environment...
    python -m venv venv
)

:: Activate virtual environment
call venv\Scripts\activate.bat

:: Install backend requirements
echo Installing backend dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt

:: Apply database migrations
echo Applying database migrations...
python manage.py migrate

:: Start Django backend in a new command window
echo Starting Django Backend...
start cmd /k "title Piano Backend && call venv\Scripts\activate.bat && python manage.py runserver"

:: Return to the project root directory
cd ..

:: 2. Frontend Setup and Run
echo.
echo [2/2] Setting up Frontend...
cd piano-frontend

:: Install frontend dependencies
echo Installing frontend dependencies...
call npm install

:: Start Vue frontend in a new command window
echo Starting Vue Frontend...
start cmd /k "title Piano Frontend && npm run dev"

:: Return to the project root directory
cd ..

echo.
echo ===================================================
echo     Servers are starting in separate windows!
echo     - Backend will run on http://127.0.0.1:8000
echo     - Frontend will run on http://localhost:5173
echo.
echo     Keep the new terminal windows open to keep
echo     the servers running. You can close this window.
echo ===================================================
pause
