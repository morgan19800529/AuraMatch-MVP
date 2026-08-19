// 服务端函数：真正校验并记录一次邀请码兑换（之前是前端本地随便填什么码都能过）。
// 规则：码必须真实存在 · 不能兑换自己的码 · 每台设备一辈子只能成功兑换一次。
import { checkRateLimit } from './_rateLimit.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const rl = checkRateLimit(req, 'referral-redeem', 15, 10 * 60 * 1000);
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

  const { deviceId, code } = req.body || {};
  if (!deviceId || typeof deviceId !== 'string' || deviceId.length < 8) {
    res.status(400).json({ error: 'Invalid deviceId' });
    return;
  }
  const normalizedCode = String(code || '').trim().toUpperCase();
  if (!normalizedCode) {
    res.status(400).json({ error: 'invalid_code', message: 'Please enter an invite code' });
    return;
  }

  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
  };

  try {
    // 1. 码必须真实存在
    const lookup = await fetch(
      `${supabaseUrl}/rest/v1/referral_codes?code=eq.${encodeURIComponent(normalizedCode)}&select=device_id`,
      { headers }
    );
    const rows = await lookup.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      res.status(404).json({ error: 'invalid_code', message: 'Invite code not found' });
      return;
    }
    const inviterDeviceId = rows[0].device_id;

    // 2. 不能兑换自己的码
    if (inviterDeviceId === deviceId) {
      res.status(400).json({ error: 'self_redeem', message: 'Cannot redeem your own code' });
      return;
    }

    // 3. 每台设备一辈子只能成功兑换一次（invitee_device_id 有唯一约束兜底，这里先查一下给出更友好的错误信息）
    const already = await fetch(
      `${supabaseUrl}/rest/v1/referral_redemptions?invitee_device_id=eq.${encodeURIComponent(deviceId)}&select=id`,
      { headers }
    );
    const alreadyRows = await already.json();
    if (Array.isArray(alreadyRows) && alreadyRows.length > 0) {
      res.status(409).json({ error: 'already_redeemed', message: 'You have already redeemed a code' });
      return;
    }

    // 4. 写入兑换记录（唯一约束是最后一道防线，防止并发重复提交）
    const insert = await fetch(`${supabaseUrl}/rest/v1/referral_redemptions`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'return=minimal' },
      body: JSON.stringify({
        code: normalizedCode,
        inviter_device_id: inviterDeviceId,
        invitee_device_id: deviceId,
      }),
    });

    if (!insert.ok) {
      if (insert.status === 409) {
        res.status(409).json({ error: 'already_redeemed', message: 'You have already redeemed a code' });
        return;
      }
      const detail = await insert.text();
      res.status(502).json({ error: 'Supabase error', detail: detail.slice(0, 300) });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error', detail: String(err).slice(0, 300) });
  }
}
