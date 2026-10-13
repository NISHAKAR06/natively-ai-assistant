@echo off
set "APP_DIR=c:\Users\NISHAKART\OneDrive\Documents\NISHAKAR\AI_assistent\natively-cluely-ai-assistant"
if /I "%~1"=="stop" (
    call "%APP_DIR%\stop-natively.bat"
    exit /b 0
)
set ELECTRON_RUN_AS_NODE=
set NODE_ENV=production
set NATIVELY_CORE_SMOKE=1
start "" /D "%APP_DIR%" "%APP_DIR%\node_modules\electron\dist\electron.exe" "%APP_DIR%"
echo Natively launched in standalone background mode (no dev server or open terminal needed).
