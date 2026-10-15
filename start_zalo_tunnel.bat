@echo off
title SmartSchedule AI - Zalo Bot Cloudflare Tunnel (Port 3000)
echo ======================================================================
echo       KHOI DONG CLOUDFLARE TUNNEL CHO ZALO BOT (BACKEND PORT 3000)
echo ======================================================================
echo.
echo 1. Hay dam bao Backend dang chay tai http://localhost:3000
echo 2. Doi vai giay ben duoi de Cloudflare sinh ra duong link https://xxxx.trycloudflare.com
echo.
echo 3. Lay link do va them duoi:
echo    /api/v1/ai/zalo-webhook
echo.
echo    Vi du: https://xxxx.trycloudflare.com/api/v1/ai/zalo-webhook
echo.
echo 4. Dan vao o "Webhook URL" tren App Zalo Bot Creator va luu lai!
echo ======================================================================
echo.

cd /d "%~dp0ai-service"
.\cloudflared.exe tunnel --url http://localhost:3000
pause
