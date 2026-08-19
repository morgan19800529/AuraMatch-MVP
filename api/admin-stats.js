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
    const url = `${supabaseUrl}/rest/v1/profiles?select=status,is_ai_agent,created_at,acquisition_source`;
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

    // 顺带查一下真实裂变数据：发出去多少个邀请码、成功兑换了多少次
    let referralCodesIssued = 0;
    let referralRedemptions = 0;
    try {
      const [codesResp, redemptionsResp] = await Promise.all([
        fetch(`${supabaseUrl}/rest/v1/referral_codes?select=device_id`, { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, Prefer: 'count=exact' } }),
        fetch(`${supabaseUrl}/rest/v1/referral_redemptions?select=id`, { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, Prefer: 'count=exact' } }),
      ]);
      const codesCountHeader = codesResp.headers.get('content-range');
      const redemptionsCountHeader = redemptionsResp.headers.get('content-range');
      referralCodesIssued = codesCountHeader ? Number(codesCountHeader.split('/')[1]) || 0 : 0;
      referralRedemptions = redemptionsCountHeader ? Number(redemptionsCountHeader.split('/')[1]) || 0 : 0;
    } catch {
      // 裂变统计拉取失败不影响主统计返回
    }

    const byStatus = { approved: 0, pending: 0, rejected: 0 };
    let realUsers = 0;
    let seedUsers = 0;
    const byDay = {};
    const bySource = {};

    for (const row of rows) {
      const status = row.status || 'approved';
      byStatus[status] = (byStatus[status] || 0) + 1;

      if (row.is_ai_agent) {
        seedUsers++;
      } else {
        realUsers++;
        const day = (row.created_at || '').slice(0, 10);
        if (day) byDay[day] = (byDay[day] || 0) + 1;

        const source = row.acquisition_source || '直接访问/未知';
        bySource[source] = (bySource[source] || 0) + 1;
      }
    }

    const dailySignups = Object.entries(byDay)
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .slice(0, 14)
      .reverse()
      .map(([date, count]) => ({ date, count }));

    const acquisitionSources = Object.entries(bySource)
      .sort((a, b) => b[1] - a[1])
      .map(([source, count]) => ({ source, count }));

    res.status(200).json({
      total: rows.length,
      byStatus,
      realUsers,
      seedUsers,
      dailySignups,
      acquisitionSources,
      referralCodesIssued,
      referralRedemptions,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error', detail: String(err).slice(0, 300) });
  }
}
