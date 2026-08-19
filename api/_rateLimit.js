// 极简的按 IP 限流（内存版）。Vercel 的 serverless 实例是"温启动复用"的，
// 同一个热实例在短时间内会复用这个 Map，能挡住脚本化的高频刷调用；
// 不同实例之间不共享状态，所以不是绝对精确的限流，但足以防止个位数脚本
// 把 DeepSeek 账单刷爆或把函数调用量刷爆。真正大规模防刷建议接 Upstash/Redis。
const buckets = new Map();

// 定期清理，避免内存无限增长
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of buckets.entries()) {
    if (now - entry.windowStart > 10 * 60 * 1000) buckets.delete(key);
  }
}, 5 * 60 * 1000).unref?.();

export function getClientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length > 0) return fwd.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

// limit: 时间窗口内允许的最大请求数；windowMs: 时间窗口长度
export function checkRateLimit(req, routeName, limit = 20, windowMs = 10 * 60 * 1000) {
  const ip = getClientIp(req);
  const key = `${routeName}:${ip}`;
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    buckets.set(key, { windowStart: now, count: 1 });
    return { allowed: true };
  }

  entry.count += 1;
  if (entry.count > limit) {
    return { allowed: false, retryAfterMs: windowMs - (now - entry.windowStart) };
  }
  return { allowed: true };
}
