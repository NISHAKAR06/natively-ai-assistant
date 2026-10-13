@echo off
echo Stopping Natively...
powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name = 'electron.exe'\" | Where-Object { $_.ExecutablePath -like '*natively-cluely-ai-assistant*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"
echo Natively stopped.
