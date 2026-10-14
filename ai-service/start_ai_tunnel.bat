@echo off
title SmartSchedule AI Service & Cloudflare Tunnel
echo ========================================================
echo   KHOI DONG DICH VU AI & CLOUDFLARE TUNNEL (LOCAL)
echo ========================================================
echo.

start "SmartSchedule AI - FastAPI (Port 8000)" cmd /k "cd /d %~dp0 && python -m uvicorn main:app --host 0.0.0.0 --port 8000"

echo Dang doi AI Service khoi dong trong 5 giay...
timeout /t 5 /nobreak >nul

echo Dang ket noi Cloudflare Tunnel...
echo Copy duong link https://xxxx.trycloudflare.com ben duoi de cap nhat vao Render!
echo.
cd /d %~dp0
.\cloudflared.exe tunnel --url http://localhost:8000
pause
