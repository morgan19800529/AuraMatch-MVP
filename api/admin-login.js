// 服务端函数：管理员密码校验。真正的密码只存在于 Vercel 服务端环境变量 ADMIN_PASSWORD 里，
// 不会被打包进浏览器可见的 JS 代码（这是修复"密码硬编码在前端源码里"这个安全漏洞的关键）。
import { checkRateLimit } from './_rateLimit.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // 严格限流，防止有人脚本化暴力猜管理员密码
  const rl = checkRateLimit(req, 'admin-login', 10, 10 * 60 * 1000);
  if (!rl.allowed) {
    res.status(429).json({ ok: false, error: 'Too many attempts, please wait and try again' });
    return;
  }

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    res.status(500).json({ error: 'ADMIN_PASSWORD not configured on server' });
    return;
  }

  const { password } = req.body || {};
  if (password && password === expected) {
    res.status(200).json({ ok: true });
  } else {
    res.status(401).json({ ok: false });
  }
}
