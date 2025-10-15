// api/index.js - Vercel Serverless Function
const axios = require('axios');

// 你的智谱AI密钥
const ZHIPU_API_KEY = '2c1eda49a2204aeeb91a0560f42fe478.UiF2ZqU3iS8CX39I';

module.exports = async (req, res) => {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: '方法不允许' });
    }

    try {
        const { input } = req.body;

        if (!input) {
            return res.json({
                letter: '请先输入一些内容，分享你此刻的想法吧！',
                status: 'error'
            });
        }

        // 调用智谱AI API
        const response = await axios.post(
            'https://open.bigmodel.cn/api/paas/v4/chat/completions',
            {
                model: "glm-4",
                messages: [{
                    role: "user",
                    content: `请你扮演5年后的用户本人，基于用户当前的状态和心情，给现在的他/她写一封温暖、鼓励的完整信件。

用户当前的想法是："${input}"

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

        const letter = response.data.choices[0].message.content;

        res.json({
            letter: letter,
            status: 'success',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('API错误:', error.response?.data || error.message);
        
        // 备用回复
        const fallbackLetters = [
            `亲爱的现在的我，\n\n我是5年后的你。看到你此刻的分享，我想告诉你，生命中的每一个阶段都有其独特的意义。\n\n那些让你思考的时刻，那些让你成长的经历，都在悄悄塑造着更美好的你。相信时间的魔力，保持心灵的开放，未来会以你意想不到的方式展开。\n\n—— 永远相信你的未来我`,

            `嗨！现在的你，\n\n我是未来版本的你！听说你正在思考，这真是太棒了！\n\n每一个真诚的思考都是通向更好未来的钥匙。想象一下，3年后的你在回头看时，会深深感激现在这个勇敢探索的自己。\n\n✨ 与你同行的未来我`
        ];
        
        const randomLetter = fallbackLetters[Math.floor(Math.random() * fallbackLetters.length)];
        
        res.json({
            letter: randomLetter,
            status: 'success',
            mode: 'fallback'
        });
    }
};