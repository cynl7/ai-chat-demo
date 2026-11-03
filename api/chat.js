/*
 * @Description: 处理聊天请求
 * @Version: 1.0
 * @Author: cy
 * @Date: 2026-11-03 16:22:36
 * @LastEditors: cy
 * @LastEditTime: 2026-11-03 16:31:20
 */
// api/chat.js (Vercel Serverless Function)
export default async function handler(req, res) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    // 请求硅基流动 / 智谱的 API
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 这里的 key 稍后在 Vercel 后台配置，千万别写死在前端！
        'Authorization': `Bearer ${process.env.API_KEY}`
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen2.5-7B-Instruct', // 模型名字按你注册的平台填  
        messages: messages,
        stream: true, // 开启流式输出
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    // 设置响应头，告诉前端是流式输出
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 将数据流原样转发给前端
    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
    res.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}