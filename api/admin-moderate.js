// 服务端函数：管理员通过/驳回某张待审核名片。用 service_role key 更新 status，
// 通过 -> approved（才会出现在公开 SELECT 策略允许的范围内），驳回 -> rejected（保留记录，但不会公开展示）。
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const expected = process.env.ADMIN_PASSWORD;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.SUPABASE_URL || 'https://idoeuqqfnkbfburpgevw.supabase.co';

  if (!expected || !serviceKey) {
    res.status(500).json({ error: 'Server not fully configured (ADMIN_PASSWORD / SUPABASE_SERVICE_ROLE_KEY missing)' });
    return;
  }

  const { password, id, action } = req.body || {};
  if (password !== expected) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  if (!id || !['approve', 'reject'].includes(action)) {
    res.status(400).json({ error: 'Missing id or invalid action' });
    return;
  }

  const newStatus = action === 'approve' ? 'approved' : 'rejected';

  try {
    const upstream = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!upstream.ok) {
      const detail = await upstream.text();
      res.status(502).json({ error: 'Supabase error', detail: detail.slice(0, 300) });
      return;
    }
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error', detail: String(err).slice(0, 300) });
  }
}
