// 服务端函数：邀请人这边查一下"有没有好友刚用我的码兑换成功、还没领奖"，
// 有的话标记为已领取并返回应得的能量数（每次成功邀请 +20）。
// 同时检查是否累计邀请数跨过了新的奖励梯度门槛（3/5/10人），跨过了就一次性追加梯度奖励+解锁徽章。
// 前端在每次打开 App 时调用一次即可，不需要用户手动操作。
import { checkRateLimit } from './_rateLimit.js';

// 邀请奖励梯度：累计成功邀请人数 -> 一次性追加能量 + 解锁徽章
const TIERS = [
  { count: 3, bonus: 50, badge: '🌱 增长新星' },
  { count: 5, bonus: 120, badge: '🚀 增长达人' },
  { count: 10, bonus: 300, badge: '👑 社区领袖' },
];

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
    // 1. 领取还没结算的单次邀请奖励（每人 +20）
    const pending = await fetch(
      `${supabaseUrl}/rest/v1/referral_redemptions?inviter_device_id=eq.${encodeURIComponent(deviceId)}&inviter_claimed=eq.false&select=id`,
      { headers }
    );
    const rows = pending.ok ? await pending.json() : [];
    const newCount = Array.isArray(rows) ? rows.length : 0;
    if (newCount > 0) {
      const ids = rows.map((r) => r.id);
      await fetch(`${supabaseUrl}/rest/v1/referral_redemptions?id=in.(${ids.join(',')})`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ inviter_claimed: true }),
      });
    }
    let rewardEnergy = newCount * 20;

    // 2. 累计成功邀请总数（不管是否已结算过单次奖励），用来判断有没有跨过新的梯度门槛
    let totalInvites = 0;
    let newBadge = null;
    try {
      const totalResp = await fetch(
        `${supabaseUrl}/rest/v1/referral_redemptions?inviter_device_id=eq.${encodeURIComponent(deviceId)}&select=id`,
        { headers: { ...headers, Prefer: 'count=exact' } }
      );
      const contentRange = totalResp.headers.get('content-range'); // e.g. "0-4/5"
      totalInvites = contentRange ? parseInt(contentRange.split('/')[1], 10) || 0 : (await totalResp.json()).length;

      const codeRowResp = await fetch(
        `${supabaseUrl}/rest/v1/referral_codes?device_id=eq.${encodeURIComponent(deviceId)}&select=tier_claimed,badge`,
        { headers }
      );
      const codeRows = codeRowResp.ok ? await codeRowResp.json() : [];
      const tierClaimedSoFar = codeRows[0]?.tier_claimed || 0;

      let tierBonus = 0;
      let highestNewTierCount = tierClaimedSoFar;
      for (const tier of TIERS) {
        if (totalInvites >= tier.count && tier.count > tierClaimedSoFar) {
          tierBonus += tier.bonus;
          newBadge = tier.badge;
          highestNewTierCount = tier.count;
        }
      }
      if (tierBonus > 0) {
        rewardEnergy += tierBonus;
        await fetch(`${supabaseUrl}/rest/v1/referral_codes?device_id=eq.${encodeURIComponent(deviceId)}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ tier_claimed: highestNewTierCount, badge: newBadge }),
        });
      }
    } catch {
      // 梯度奖励计算失败不影响基础邀请奖励的正常发放
    }

    res.status(200).json({ rewardEnergy, totalInvites, newBadge });
  } catch (err) {
    res.status(200).json({ rewardEnergy: 0, note: 'error, will retry next load' });
  }
}
