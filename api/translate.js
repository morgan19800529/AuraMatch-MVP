// 服务端函数：批量把用户自己填写的自由文本（常驻地/游民物种/一句话简介）翻译成目标语言。
// 之前只有一张手写的对照表，只覆盖最早那 11 个预置演示账号，真实用户填的内容/新种子数据
// 一旦不在表里，就算切换到英文/日语/西语，卡片上还是原样显示中文——这里补上兜底的真翻译。
import { checkRateLimit } from './_rateLimit.js';

const LANG_NAME = { en: 'English', es: 'Spanish', ja: 'Japanese' };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const rl = checkRateLimit(req, 'translate', 30, 10 * 60 * 1000);
  if (!rl.allowed) {
    res.status(429).json({ error: 'Too many requests, please slow down' });
    return;
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    res.status(200).json({ translations: {} });
    return;
  }

  const { items, targetLang } = req.body || {};
  const langName = LANG_NAME[targetLang];
  if (!Array.isArray(items) || items.length === 0 || !langName) {
    res.status(200).json({ translations: {} });
    return;
  }

  // 一次最多翻 25 条，防止单次 payload/成本失控；多的前端会分批再调
  const capped = items.slice(0, 25).filter((it) => it && it.key && typeof it.text === 'string' && it.text.trim());
  if (capped.length === 0) {
    res.status(200).json({ translations: {} });
    return;
  }

  const numbered = capped.map((it, i) => `${i + 1}. ${it.text.trim().slice(0, 200)}`).join('\n');
  const prompt = `Translate each numbered line below into natural, concise ${langName}. These are short profile fields (a location, a short tagline, or a one-sentence bio) from a cross-cultural social app — keep any emoji at the start of a line as-is, keep it short and natural, don't add explanations.
Return STRICTLY as compact JSON with no extra text, no markdown fences: {"1": "...", "2": "...", ...} using the same numbers as below.

${numbered}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const upstream = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.3,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!upstream.ok) {
      res.status(200).json({ translations: {} });
      return;
    }

    const data = await upstream.json();
    const raw = data?.choices?.[0]?.message?.content || '';

    let parsed = {};
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(match ? match[0] : raw);
    } catch {
      parsed = {};
    }

    const translations = {};
    capped.forEach((it, i) => {
      const val = parsed[String(i + 1)];
      if (typeof val === 'string' && val.trim()) {
        translations[it.key] = val.trim();
      }
    });

    res.status(200).json({ translations });
  } catch {
    res.status(200).json({ translations: {} });
  }
}
