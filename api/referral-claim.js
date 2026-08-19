// 服务端函数：邀请人这边查一下"有没有好友刚用我的码兑换成功、还没领奖"，
// 有的话标记为已领取并返回应得的能量数（每次成功邀请 +20）。
// 前端在每次打开 App 时调用一次即可，不需要用户手动操作。
import { checkRateLimit } from './_rateLimit.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const rl = checkRateLimit(req, 'referral-claim', 30, 10 * 60 * 1000);
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
  if (!deviceId || typeof deviceId !== 'string' || deviceId.length < 8) {
    res.status(400).json({ error: 'Invalid deviceId' });
    return;
  }

  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
  };

  try {
    const pending = await fetch(
      `${supabaseUrl}/rest/v1/referral_redemptions?inviter_device_id=eq.${encodeURIComponent(deviceId)}&inviter_claimed=eq.false&select=id`,
      { headers }
    );
    if (!pending.ok) {
      res.status(200).json({ rewardEnergy: 0 });
      return;
    }
    const rows = await pending.json();
    const count = Array.isArray(rows) ? rows.length : 0;
    if (count === 0) {
      res.status(200).json({ rewardEnergy: 0 });
      return;
    }

    const ids = rows.map((r) => r.id);
    await fetch(`${supabaseUrl}/rest/v1/referral_redemptions?id=in.(${ids.join(',')})`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ inviter_claimed: true }),
    });

    res.status(200).json({ rewardEnergy: count * 20 });
  } catch (err) {
    res.status(200).json({ rewardEnergy: 0, note: 'error, will retry next load' });
  }
}
