// 服务端函数：用 Supabase service_role key 读取所有"待审核"名片（anon key 现在已经读不到 pending 行了）。
// 每次请求都要重新带上管理员密码，避免只在登录那一刻验证、之后无限信任前端。
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

  const { password } = req.body || {};
  if (password !== expected) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const url = `${supabaseUrl}/rest/v1/profiles?status=eq.pending&select=id,full_name,age,native_culture,target_culture,bio,interests,avatar_url,created_at&order=created_at.desc`;
    const upstream = await fetch(url, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    });
    if (!upstream.ok) {
      const detail = await upstream.text();
      res.status(502).json({ error: 'Supabase error', detail: detail.slice(0, 300) });
      return;
    }
    const rows = await upstream.json();
    res.status(200).json({ rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error', detail: String(err).slice(0, 300) });
  }
}
