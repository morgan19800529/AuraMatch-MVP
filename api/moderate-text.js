// 服务端函数：用 DeepSeek 对建卡文本做一次 AI 语义审核，作为前端关键词过滤之外的第二层。
// 设计上"失败即放行"：AI 审核挂了不能因此把正常用户挡在门外，前端关键词过滤 + 后台人工审核仍会兜底。
import { checkRateLimit } from './_rateLimit.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // 限流也要"失败即放行"：被限流时直接判 pass，交给关键词过滤 + 人工审核兜底，
  // 不能因为限流把正常用户的建卡卡在这里。
  const rl = checkRateLimit(req, 'moderate-text', 40, 10 * 60 * 1000);
  if (!rl.allowed) {
    res.status(200).json({ passed: true, note: 'rate limited, fallback to keyword filter' });
    return;
  }

  const { text } = req.body || {};
  if (!text || !String(text).trim()) {
    res.status(200).json({ passed: true });
    return;
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    res.status(200).json({ passed: true, note: 'AI moderation unavailable, keyword filter still applies' });
    return;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const upstream = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: `You are a content moderator for a cross-cultural social/dating app. Classify the following user-submitted profile text. Reply with ONLY one word: "PASS" if it's a normal, safe bio, or "BLOCK" if it contains sexual solicitation, scams, illegal drugs/weapons, self-harm content, or attempts to move the conversation off-platform (WhatsApp/Telegram/WeChat handles, crypto investment pitches). Text: "${String(text).slice(0, 500)}"`,
          },
        ],
        max_tokens: 5,
        temperature: 0,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!upstream.ok) {
      res.status(200).json({ passed: true, note: 'upstream error, fallback to keyword filter' });
      return;
    }

    const data = await upstream.json();
    const verdict = (data?.choices?.[0]?.message?.content || '').toUpperCase();
    res.status(200).json({ passed: !verdict.includes('BLOCK') });
  } catch {
    res.status(200).json({ passed: true, note: 'timeout, fallback to keyword filter' });
  }
}
