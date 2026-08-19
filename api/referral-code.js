// 服务端函数：给一个设备（浏览器）颁发/查询它的专属邀请码，真正写进 Supabase，
// 不再是前端随手生成、谁都验证不了的假码。
import { checkRateLimit } from './_rateLimit.js';

function generateCode() {
  return 'AURA' + Math.floor(1000 + Math.random() * 9000);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const rl = checkRateLimit(req, 'referral-code', 30, 10 * 60 * 1000);
  if (!rl.allowed) {
    res.status(429).json({ error: 'Too many requests, please slow down' });
    return;
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.SUPABASE_URL || 'https://idoeuqqfnkbfburpgevw.supabase.co';
  if (!serviceKey) {
    res.status(500).json({ error: 'Server not fully configured' });
    return;
  }

  const { deviceId } = req.body || {};
  if (!deviceId || typeof deviceId !== 'string' || deviceId.length < 8 || deviceId.length > 100) {
    res.status(400).json({ error: 'Invalid deviceId' });
    return;
  }

  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
  };

  try {
    // 1. 先查这个设备是不是已经有码了
    const lookup = await fetch(
      `${supabaseUrl}/rest/v1/referral_codes?device_id=eq.${encodeURIComponent(deviceId)}&select=code`,
      { headers }
    );
    const existing = await lookup.json();
    if (Array.isArray(existing) && existing.length > 0) {
      res.status(200).json({ code: existing[0].code });
      return;
    }

    // 2. 没有就生成一个新码，撞了唯一约束就重试几次
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateCode();
      const insert = await fetch(`${supabaseUrl}/rest/v1/referral_codes`, {
        method: 'POST',
        headers: { ...headers, Prefer: 'return=representation' },
        body: JSON.stringify({ device_id: deviceId, code }),
      });
      if (insert.ok) {
        res.status(200).json({ code });
        return;
      }
      // 409/23505 = 唯一约束冲突（device_id 已存在，或者随机码撞车了），重试
      if (insert.status !== 409) {
        const detail = await insert.text();
        res.status(502).json({ error: 'Supabase error', detail: detail.slice(0, 300) });
        return;
      }
    }
    res.status(500).json({ error: 'Could not allocate a unique code, please retry' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', detail: String(err).slice(0, 300) });
  }
}
