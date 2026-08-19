// 服务端函数：真实调用 DeepSeek 生成破冰词。
// DEEPSEEK_API_KEY 只存在于 Vercel 服务端环境变量里，浏览器永远拿不到。
import { checkRateLimit } from './_rateLimit.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // 简单按 IP 限流，防止脚本高频调用刷爆 DeepSeek 账单/函数调用额度
  const rl = checkRateLimit(req, 'icebreaker', 20, 10 * 60 * 1000);
  if (!rl.allowed) {
    res.status(429).json({ error: 'Too many requests, please slow down' });
    return;
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'DEEPSEEK_API_KEY not configured on server' });
    return;
  }

  try {
    const { name, nativeCulture, targetCulture, bio } = req.body || {};
    if (!name) {
      res.status(400).json({ error: 'Missing name' });
      return;
    }

    const prompt = `You are helping a user on a cross-cultural social app called AuraMatch write a short, warm, specific icebreaker message to a person named "${name}", based in "${nativeCulture || 'unknown'}", interested in "${targetCulture || 'unknown'}". Their bio: "${String(bio || '').slice(0, 300)}".
Write:
1. An English icebreaker, 1-2 sentences, friendly and specific (reference something from their bio or location if possible), never generic like "hi how are you".
2. A natural Chinese translation of it.
Return STRICTLY as compact JSON with no extra text, no markdown fences: {"en": "...", "zh": "..."}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const upstream = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.9,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!upstream.ok) {
      const detail = await upstream.text();
      res.status(502).json({ error: 'DeepSeek upstream error', detail: detail.slice(0, 300) });
      return;
    }

    const data = await upstream.json();
    const raw = data?.choices?.[0]?.message?.content || '';

    let en = '';
    let zh = '';
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(match ? match[0] : raw);
      en = parsed.en || '';
      zh = parsed.zh || '';
    } catch {
      en = raw.trim();
    }

    if (!en) {
      res.status(502).json({ error: 'Empty AI response' });
      return;
    }

    res.status(200).json({ en, zh });
  } catch (err) {
    res.status(500).json({ error: 'Server error', detail: String(err).slice(0, 300) });
  }
}
