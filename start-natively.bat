@echo off
set "APP_DIR=%~dp0"
if "%APP_DIR:~-1%"=="\" set "APP_DIR=%APP_DIR:~0,-1%"
if /I "%~1"=="stop" (
    call "%APP_DIR%\stop-natively.bat"
    exit /b 0
)
set ELECTRON_RUN_AS_NODE=
set NODE_ENV=production
set NATIVELY_CORE_SMOKE=1
if not defined USE_OLLAMA set USE_OLLAMA=true
if not defined OLLAMA_MODEL set OLLAMA_MODEL=qwen2.5-coder:7b
start "" /D "%APP_DIR%" "%APP_DIR%\node_modules\electron\dist\electron.exe" "%APP_DIR%"
echo Natively launched in standalone background mode (100% free local AI + STT).
echo N       N
echo NN      N
echo N N     N
echo N  N    N
echo N   N   N
echo N    N  N
echo N     N N
echo N      NN
echo N       N