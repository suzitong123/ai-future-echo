@echo off
chcp 65001
title AI未来回音 - Serveo公网方案

echo 🌐 使用Serveo公网地址 - 最稳定方案
echo.

echo 步骤1: 检查Node.js服务...
tasklist /fi "imagename eq node.exe" | find /i "node.exe" >nul
if errorlevel 1 (
    echo 🚀 启动Node.js服务...
    start "AI服务" /B node server.js
    timeout /t 5 /nobreak >nul
) else (
    echo ✅ Node.js服务已在运行
)

echo 步骤2: 测试本地服务...
curl -s http://localhost:3000/health >nul 2>&1
if errorlevel 1 (
    echo ❌ 本地服务未就绪，重新启动...
    taskkill /f /im node.exe >nul 2>&1
    start "AI服务" /B node server.js
    timeout /t 5 /nobreak >nul
)

echo 步骤3: 获取公网地址...
echo ⏳ 正在连接Serveo获取公网地址...
echo 💡 这可能需要10-20秒，请耐心等待...
echo.

:: 清理旧文件
del serveo-url.txt >nul 2>&1

:: 启动Serveo并保存输出
start "Serveo公网隧道" /B cmd /c "ssh -o StrictHostKeyChecking=no -R 80:localhost:3000 serveo.net > serveo-url.txt 2>&1"

echo 等待Serveo连接建立...
timeout /t 15 /nobreak >nul

echo 步骤4: 提取公网地址...
set SERVEO_URL=
for /f "tokens=2" %%i in ('findstr /C:"Forwarding" serveo-url.txt') do (
    set SERVEO_URL=%%i
)

if "%SERVEO_URL%"=="" (
    echo ❌ 获取Serveo地址失败，重试中...
    timeout /t 5 /nobreak >nul
    for /f "tokens=2" %%i in ('findstr /C:"Forwarding" serveo-url.txt') do (
        set SERVEO_URL=%%i
    )
)

if "%SERVEO_URL%"=="" (
    echo ❌ 无法获取Serveo地址，请检查网络
    echo 💡 可能的原因：
    echo   - 网络连接问题
    echo   - Serveo服务暂时不可用
    echo   - 防火墙阻止SSH连接
    goto :error
)

echo 🎉 Serveo公网地址获取成功！
echo.

echo 步骤5: 生成NFC写入页面...
(
echo ^<html^>
echo ^<head^>
echo ^<meta charset="UTF-8"^>
echo ^<meta name="viewport" content="width=device-width, initial-scale=1.0"^>
echo ^<title^>NFC写入 - Serveo公网地址^</title^>
echo ^<style^>
echo body { font-family: Arial, sans-serif; padding: 20px; text-align: center; max-width: 600px; margin: 0 auto; }
echo .url-box { background: #f0f8ff; padding: 20px; border-radius: 10px; margin: 20px 0; border: 2px solid #667eea; }
echo .url { background: white; padding: 15px; border-radius: 5px; font-family: monospace; word-break: break-all; font-size: 16px; margin: 15px 0; }
echo button { background: #667eea; color: white; border: none; padding: 12px 24px; border-radius: 8px; margin: 10px; font-size: 16px; cursor: pointer; }
echo .steps { text-align: left; margin: 20px 0; }
echo .step { margin: 15px 0; padding: 10px; background: white; border-radius: 5px; }
echo ^</style^>
echo ^</head^>
echo ^<body^>
echo ^<h1^>🌐 Serveo公网NFC设置^</h1^>
echo ^<p^>使用公网地址，手机在任何网络都能访问！^</p^>
echo.
echo ^<div class="url-box"^>
echo ^<h3^>📍 公网访问地址^</h3^>
echo ^<div class="url" id="serveo-url"^>%SERVEO_URL%^</div^>
echo ^<button onclick="copyUrl()"^>📋 复制公网地址^</button^>
echo ^<button onclick="testUrl()"^>🔗 测试访问^</button^>
echo ^</div^>
echo.
echo ^<div class="steps"^>
echo ^<h3^>📝 NFC写入步骤^</h3^>
echo ^<div class="step"^>1. 安装 <strong^>NFC Tools^</strong^> App^</div^>
echo ^<div class="step"^>2. 打开应用 → <strong^>写入^</strong^> → 添加记录 → <strong^>URL/URI^</strong^>^</div^>
echo ^<div class="step"^>3. 粘贴上方的公网地址^</div^>
echo ^<div class="step"^>4. NFC标签贴近手机背部^</div^>
echo ^<div class="step"^>5. 点击"<strong^>写入^</strong^>"完成^</div^>
echo ^</div^>
echo.
echo ^<div style="background: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;"^>
echo ^<h3^>💡 优势^</h3^>
echo ^<ul style="text-align: left;"^>
echo ^<li^>✅ 手机在任何WiFi或移动网络都能访问^</li^>
echo ^<li^>✅ 无需担心本地网络问题^</li^>
echo ^<li^>✅ 地址稳定（重启服务可能会变化）^</li^>
echo ^<li^>✅ 支持NFC快速访问^</li^>
echo ^</ul^>
echo ^</div^>
echo.
echo ^<script^>
echo function copyUrl() {
echo   var url = document.getElementById('serveo-url').textContent;
echo   navigator.clipboard.writeText(url).then(function() {
echo     alert('✅ 已复制公网地址！\\n\\n' + url + '\\n\\n请在NFC Tools中粘贴此地址');
echo   });
echo }
echo.
echo function testUrl() {
echo   var url = document.getElementById('serveo-url').textContent;
echo   window.open(url, '_blank');
echo }
echo.
echo // 自动测试连接
echo window.addEventListener('load', function() {
echo   setTimeout(function() {
echo     var statusDiv = document.createElement('div');
echo     statusDiv.style.margin = '10px 0';
echo     statusDiv.style.padding = '10px';
echo     statusDiv.style.borderRadius = '5px';
echo     statusDiv.innerHTML = '🔄 测试公网连接...';
echo     document.querySelector('.url-box').appendChild(statusDiv);
echo     .
echo     fetch('^%SERVEO_URL%^/health').then(function(response) {
echo       return response.json();
echo     }).then(function(data) {
echo       statusDiv.style.background = '#d4edda';
echo       statusDiv.style.color = '#155724';
echo       statusDiv.innerHTML = '✅ 公网连接正常！服务运行中';
echo     }).catch(function(error) {
echo       statusDiv.style.background = '#f8d7da';
echo       statusDiv.style.color = '#721c24';
echo       statusDiv.innerHTML = '❌ 公网连接测试失败，但NFC可能仍能工作';
echo     });
echo   }, 2000);
echo });
echo ^</script^>
echo ^</body^>
echo ^</html^>
) > serveo-nfc-guide.html

start serveo-nfc-guide.html

echo.
echo ===========================================
echo 🌐 Serveo公网方案启动完成！
echo ===========================================
echo 📍 公网地址: %SERVEO_URL%
echo 📱 手机访问: %SERVEO_URL%
echo 📝 NFC写入: %SERVEO_URL%
echo 💡 优势: 手机在任何网络都能访问！
echo.
echo 🎯 下一步操作:
echo 1. 复制上面的公网地址
echo 2. 在NFC Tools中写入此地址
echo 3. 手机触碰NFC标签测试
echo.
echo ⚠️  注意:
echo - 服务重启后地址可能变化
echo - 如需固定地址，可考虑使用付费服务
echo - Serveo窗口不要关闭，保持隧道连接
echo.

:error
pause