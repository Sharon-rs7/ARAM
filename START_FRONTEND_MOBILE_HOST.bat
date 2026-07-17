@echo off
title ARAM Frontend - LAN Host
cd /d "%~dp0"
npm run dev -- --host 0.0.0.0
pause
