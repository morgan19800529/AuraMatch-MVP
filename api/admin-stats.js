// 服务端函数：管理后台的数据看板统计。用 service_role key 一次性拉全表统计
// （anon key 现在因为 RLS 只能看到 approved 的行，看不到 pending/rejected，所以必须走这里）。
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
    const url = `${supabaseUrl}/rest/v1/profiles?select=status,is_ai_agent,created_at`;
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

    const byStatus = { approved: 0, pending: 0, rejected: 0 };
    let realUsers = 0;
    let seedUsers = 0;
    const byDay = {};

    for (const row of rows) {
      const status = row.status || 'approved';
      byStatus[status] = (byStatus[status] || 0) + 1;

      if (row.is_ai_agent) {
        seedUsers++;
      } else {
        realUsers++;
        const day = (row.created_at || '').slice(0, 10);
        if (day) byDay[day] = (byDay[day] || 0) + 1;
      }
    }

    const dailySignups = Object.entries(byDay)
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .slice(0, 14)
      .reverse()
      .map(([date, count]) => ({ date, count }));

    res.status(200).json({
      total: rows.length,
      byStatus,
      realUsers,
      seedUsers,
      dailySignups,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error', detail: String(err).slice(0, 300) });
  }
}
