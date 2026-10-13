@echo off
cd /d "%~dp0"
set ELECTRON_RUN_AS_NODE=
set NODE_ENV=production
set NATIVELY_CORE_SMOKE=1
echo Starting Natively (100%% Free Local Mode)...
call npx electron .
