// server.js - 纯净版（无图片生成）+ NFC支持
const express = require('express');
const axios = require('axios');
const app = express();

// 中间件
app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// ==================== 新增：NFC支持 ====================
// 静态文件服务
app.use(express.static(__dirname));

// 动态获取当前域名的主页面
app.get('/', (req, res) => {
    const host = req.get('host');
    const isServeo = host.includes('serveo.net');
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
    
    if (isServeo) {
        // Serveo访问返回NFC优化页面
        console.log('📱 Serveo访问，返回NFC入口页');
        res.sendFile(__dirname + '/nfc-entry.html');
    } else if (isLocal) {
        // 本地访问返回健康检查
        console.log('💻 本地访问，跳转到健康检查');
        res.redirect('/health');
    } else {
        // 其他访问（如IP直连）返回主应用
        console.log('🌐 IP直连访问，返回主应用');
        res.sendFile(__dirname + '/index.html');
    }
});

// NFC设置页面
app.get('/nfc-help', (req, res) => {
    const currentUrl = `${req.protocol}://${req.get('host')}`;
    
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>NFC设置帮助</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: Arial; padding: 20px; max-width: 600px; margin: 0 auto; }
            .url-box { background: #f0f8ff; padding: 15px; border-radius: 10px; margin: 15px 0; }
            button { background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 5px; margin: 5px; cursor: pointer; }
            .step { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #667eea; }
            .tip { background: #fff3cd; padding: 10px; border-radius: 5px; margin: 10px 0; }
        </style>
    </head>
    <body>
        <h2>📱 NFC设置帮助</h2>
        
        <div class="url-box">
            <h3>📍 当前服务地址：</h3>
            <p style="background: white; padding: 10px; border-radius: 5px; font-family: monospace; word-break: break-all;">
                ${currentUrl}
            </p>
            <button onclick="copyUrl()">📋 复制URL</button>
            <button onclick="testUrl()">🔗 测试访问</button>
        </div>
        
        <div class="tip">
            <strong>💡 提示：</strong> 
            如果使用Serveo，每次启动地址可能变化，建议使用本地IP地址获得稳定体验。
        </div>
        
        <div class="step">
            <h3>1️⃣ 安装NFC Tools</h3>
            <p>在手机应用商店搜索"<strong>NFC Tools</strong>"并安装</p>
        </div>
        
        <div class="step">
            <h3>2️⃣ 写入NFC标签</h3>
            <p>• 打开NFC Tools → <strong>写入</strong></p>
            <p>• 添加记录 → <strong>URL/URI</strong></p>
            <p>• 粘贴上方URL → <strong>写入标签</strong></p>
        </div>
        
        <div class="step">
            <h3>3️⃣ 测试使用</h3>
            <p>手机触碰NFC标签，自动打开应用</p>
            <p>首次使用建议先点击上方"测试访问"按钮</p>
        </div>

        <script>
            function copyUrl() {
                navigator.clipboard.writeText('${currentUrl}').then(() => {
                    alert('✅ 已复制URL到剪贴板！\\n\\n请粘贴到NFC Tools中进行写入');
                });
            }
            
            function testUrl() {
                window.open('${currentUrl}', '_blank');
            }
            
            // 自动尝试获取本地IP
            window.addEventListener('load', function() {
                fetch('/local-ip').then(r => r.json()).then(data => {
                    if (data.ip) {
                        const localUrl = 'http://' + data.ip + ':3000';
                        const helpDiv = document.querySelector('.tip');
                        helpDiv.innerHTML += '<br><strong>本地IP地址：</strong>' + localUrl + 
                                            ' <button onclick="copyLocalIp()">复制本地地址</button>';
                    }
                });
            });
            
            function copyLocalIp() {
                const localUrl = 'http://' + document.querySelector('.tip').innerText.match(/[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+/)[0] + ':3000';
                navigator.clipboard.writeText(localUrl).then(() => {
                    alert('✅ 已复制本地地址：' + localUrl);
                });
            }
        </script>
    </body>
    </html>
    `);
});

// 获取本地IP地址的接口
app.get('/local-ip', (req, res) => {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return res.json({ ip: net.address });
            }
        }
    }
    res.json({ ip: null });
});

// NFC入口页面路由
app.get('/nfc-entry', (req, res) => {
    res.sendFile(__dirname + '/nfc-entry.html');
});

// 主应用页面
app.get('/app', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
// ==================== NFC支持添加结束 ====================
// ==================== 新增：测试路由 ====================
// 添加手机测试页面路由
app.get('/mobile-test', (req, res) => {
    res.sendFile(__dirname + '/mobile-test.html');
});

// 添加网络诊断接口
app.get('/network-info', (req, res) => {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    const interfaces = [];
    
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                interfaces.push({
                    interface: name,
                    address: net.address,
                    mac: net.mac,
                    cidr: net.cidr
                });
            }
        }
    }
    
    res.json({
        serverTime: new Date().toISOString(),
        interfaces: interfaces,
        host: req.get('host'),
        headers: req.headers
    });
});

// 简单连接测试
app.get('/ping', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: '服务正常运行',
        timestamp: new Date().toISOString(),
        clientIp: req.ip
    });
});

// ==================== 测试路由添加结束 ====================
// 你的智谱AI密钥 - 请替换为你的真实密钥
const ZHIPU_API_KEY = '密钥';

// 主接口 - 仅信件生成
app.post('/generate-capsule', async (req, res) => {
    console.log('📨 收到请求，用户输入:', req.body.input ? req.body.input.substring(0, 50) + '...' : '空输入');
    
    try {
        const userInput = req.body.input;
        
        if (!userInput) {
            return res.json({
                letter: '请先输入一些内容，分享你此刻的想法吧！',
                voiceText: '请先输入一些内容，分享你此刻的想法吧',
                status: 'error'
            });
        }

        // 1. 生成AI信件
        console.log('🤖 开始调用智谱AI生成信件...');
        const letterResponse = await axios.post(
            'https://open.bigmodel.cn/api/paas/v4/chat/completions',
            {
                model: "glm-4",
                messages: [{
                    role: "user",
                    content: `请你扮演5年后的用户本人，基于用户当前的状态和心情，给现在的他/她写一封温暖、鼓励的完整信件。

用户当前的想法是："${userInput}"

写作要求：
1. 身份：你是【5年后的用户】，用第一人称"我"来写
2. 口吻：亲切、真诚、充满希望，像朋友间的私密信件
3. 内容结构：
   - 开头：亲切称呼，回应用户当前的情绪
   - 主体：分享2-3个未来可能的积极变化和成长
   - 结尾：给予具体的鼓励和建议，温暖的祝福
4. 长度：250-350字，确保内容完整充实
5. 风格：自然流畅，避免官方套话

现在请开始写信：`
                }],
                temperature: 0.8,
                max_tokens: 800
            },
            {
                headers: {
                    'Authorization': `Bearer ${ZHIPU_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        const letter = letterResponse.data.choices[0].message.content;
        console.log('✅ AI信件生成成功，长度:', letter.length, '字');

        // 2. 语音文本 - 使用完整的信件内容
        const voiceText = optimizeTextForSpeech(letter);
        console.log('🎙️ 语音文本优化完成，长度:', voiceText.length, '字');

        // 返回结果
        const result = {
            letter: letter,
            voiceText: voiceText,
            letterStyle: "AI生成",
            status: 'success',
            letterLength: letter.length,
            voiceLength: voiceText.length,
            timestamp: new Date().toISOString()
        };

        console.log('📦 返回结果 - 信件:', letter.length + '字', '语音:', voiceText.length + '字');
        res.json(result);

    } catch (error) {
        console.error('❌ 生成失败:', error.response?.data || error.message);
        
        // 友好的错误回复
        const fallbackData = generateFallbackData(req.body.input);
        
        res.json({
            letter: fallbackData.letter,
            voiceText: fallbackData.voiceText,
            letterStyle: "温暖鼓励",
            status: 'success',
            mode: 'fallback'
        });
    }
});

// 优化文本用于语音朗读
function optimizeTextForSpeech(text) {
    if (!text) return '';
    
    return text
        .replace(/\n+/g, '，') // 将换行转换为逗号停顿
        .replace(/[！!]/g, '。') // 统一感叹号为句号
        .replace(/[？?]/g, '。') // 统一问号为句号
        .replace(/[ ]+/g, '')   // 去除多余空格
        .replace(/，，+/g, '，') // 去除重复逗号
        .trim();
}

// 生成备用数据
function generateFallbackData(userInput) {
    const input = userInput || '此刻的想法';
    
    const fallbackLetters = [
        `亲爱的现在的我，\n\n我是5年后的你。看到你此刻的分享："${input}"，我想告诉你，生命中的每一个阶段都有其独特的意义。\n\n那些让你思考的时刻，那些让你成长的经历，都在悄悄塑造着更美好的你。相信时间的魔力，保持心灵的开放，未来会以你意想不到的方式展开。\n\n记住，最美好的风景往往在路上，而不只是在目的地。\n\n—— 永远相信你的未来我`,

        `嗨！现在的你，\n\n我是未来版本的你！听说你正在思考关于"${input}"，这真是太棒了！\n\n每一个真诚的思考都是通向更好未来的钥匙。想象一下，3年后的你在回头看时，会深深感激现在这个勇敢探索的自己。\n\n保持好奇心，继续前行，你拥有的潜力超乎你的想象！\n\n✨ 与你同行的未来我`,

        `致此刻正在思考的你：\n\n作为从未来回来的观察者，我想悄悄告诉你：你此刻关于"${input}"的每一个想法，都在创造着令人惊喜的可能性。\n\n我看到未来的你，眼中有着坚定而温柔的光芒。那些现在让你思考的十字路口，最终都成为了生命中最珍贵的转折点。\n\n前路灿烂，请轻装前行！\n\n🌙 时间旅行者敬上`
    ];
    
    const randomLetter = fallbackLetters[Math.floor(Math.random() * fallbackLetters.length)];
    
    return {
        letter: randomLetter,
        voiceText: optimizeTextForSpeech(randomLetter)
    };
}

// 健康检查接口 - 更新显示NFC信息
app.get('/health', (req, res) => {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    let localIp = '无法获取';
    
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                localIp = net.address;
                break;
            }
        }
    }
    
    res.json({ 
        status: 'ok', 
        message: 'AI未来回音服务运行正常',
        features: [
            '智能AI信件生成',
            '完整信件语音朗读',
            'NFC触碰支持'
        ],
        nfc: {
            help: 'http://' + req.get('host') + '/nfc-help',
            localAccess: 'http://' + localIp + ':3000',
            serveoAccess: '通过Serveo访问自动进入NFC模式'
        },
        timestamp: new Date().toISOString(),
        hasApiKey: !!ZHIPU_API_KEY && ZHIPU_API_KEY !== '你的智谱AI密钥'
    });
});


// 修改服务器启动部分
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {  // 关键：绑定到所有网络接口
    console.log('===========================================');
    console.log('🚀 AI未来回音服务器已启动!');
    console.log('📍 本地访问: http://localhost:' + PORT);
    console.log('📱 手机访问: http://你的IP:' + PORT);
    console.log('💡 健康检查: http://localhost:' + PORT + '/health');
    console.log('===========================================');
});
// 优雅关闭处理
process.on('SIGINT', () => {
    console.log('\n👋 收到关闭信号，正在优雅退出...');
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    console.error('❌ 未捕获异常:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ 未处理的Promise拒绝:', reason);
});