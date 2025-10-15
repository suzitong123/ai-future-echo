@echo off
chcp 65001 >nul
title AI未来回音 - 本地服务器

echo ===========================================
echo    AI未来回音 - 本地开发服务器
echo ===========================================
echo.

if not exist "package.json" (
    echo ❌ 错误：请在项目根目录运行此脚本
    pause
    exit /b 1
)

echo 📦 检查Node.js模块...
if not exist "node_modules" (
    echo 正在安装依赖包...
    npm install
)

echo.
echo 🚀 启动本地服务器...
echo 📍 本地访问: http://localhost:3000
echo 📱 手机访问: 请确保在同一WiFi下
echo.

node api.js

pause