@echo off
echo Iniciando servidor de ITAM...
cd /d D:\Antigravity\itam-app
set PATH=C:\Windows\System32\WindowsPowerShell\v1.0;C:\Windows\system32;C:\Windows;D:\Antigravity;%PATH%
npm run dev -- --port 3001
pause
