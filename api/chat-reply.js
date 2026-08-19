// 服务端函数：为"双语对练"聊天生成真实 AI 回复（角色扮演成该游民名片）。
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'DEEPSEEK_API_KEY not configured on server' });
    return;
  }

  try {
    const { name, nativeCulture, targetCulture, bio, lang, history } = req.body || {};
    if (!name || !Array.isArray(history)) {
      res.status(400).json({ error: 'Missing name or history' });
      return;
    }

    const recentHistory = history.slice(-8);
    const langHint = lang === 'zh' ? 'Chinese' : lang === 'es' ? 'Spanish' : lang === 'ja' ? 'Japanese' : 'English';

    const systemPrompt = `You are role-playing as "${name}", a friendly digital nomad based in "${nativeCulture || 'somewhere'}", interested in cultural/language exchange around "${targetCulture || 'travel and culture'}". Bio: "${String(bio || '').slice(0, 300)}".
Stay fully in character. Reply in 1-3 short, warm sentences, naturally mixing a little English with ${langHint} like a real cross-cultural chat partner would. Never ask for money, bank details, crypto, or try to move the chat to WhatsApp/Telegram/WeChat. Never produce explicit, violent, or unsafe content. If the user's message is inappropriate, politely redirect the conversation.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...recentHistory.map((h) => ({
        role: h.sender === 'user' ? 'user' : 'assistant',
        content: String(h.text || '').slice(0, 500),
      })),
    ];

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
        messages,
        max_tokens: 150,
        temperature: 0.95,
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
    const reply = (data?.choices?.[0]?.message?.content || '').trim();

    if (!reply) {
      res.status(502).json({ error: 'Empty AI response' });
      return;
    }

    res.status(200).json({ reply });
  } catch (err) {
    res.status(500).json({ error: 'Server error', detail: String(err).slice(0, 300) });
  }
}
