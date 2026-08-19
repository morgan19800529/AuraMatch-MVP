import React, { useState } from 'react';

interface AdminGuardProps {
  children: React.ReactNode;
}

// 密码校验挪到了服务端 /api/admin-login（对比 process.env.ADMIN_PASSWORD），
// 前端源码里不再出现真实密码明文——之前 ADMIN_SECRET_KEY 硬编码在这里，
// 任何人打开浏览器 devtools 看打包后的 JS 都能直接读到,是必须堵上的安全漏洞。
export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('aura_admin_auth') === 'true';
  });
  const [inputPwd, setInputPwd] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    setError(false);
    try {
      const resp = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: inputPwd }),
      });
      const data = await resp.json();
      if (resp.ok && data.ok) {
        setIsAuthenticated(true);
        // 只存"是否已登录"这个布尔标记，真实密码另存一份供后续管理操作复用（每次特权操作都会重新校验）
        sessionStorage.setItem('aura_admin_auth', 'true');
        sessionStorage.setItem('aura_admin_pwd', inputPwd);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setChecking(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{
        height: '100dvh',
        width: '100vw',
        backgroundColor: '#020617',
        color: '#f8fafc',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
      }}>
        <form onSubmit={handleLogin} style={{
          background: '#0f172a',
          padding: 24,
          borderRadius: 16,
          width: '100%',
          maxWidth: 360,
          border: '1px solid #334155',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
        }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: 18, color: '#38bdf8' }}>🛡️ AuraMatch 安全管理后台</h2>
          <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>请输入管理员通行密码以继续操作：</p>

          <input
            type="password"
            placeholder="请输入通行密码"
            value={inputPwd}
            onChange={(e) => setInputPwd(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: error ? '1px solid #e11d48' : '1px solid #334155',
              background: '#1e293b',
              color: '#fff',
              fontSize: 14,
              boxSizing: 'border-box',
              marginBottom: 12
            }}
          />

          {error && <div style={{ color: '#e11d48', fontSize: 11, marginBottom: 12 }}>❌ 密码错误，请重新输入</div>}

          <button type="submit" disabled={checking} style={{
            width: '100%',
            padding: 10,
            background: 'linear-gradient(135deg,#38bdf8,#6366f1)',
            color: '#020617',
            border: 'none',
            borderRadius: 8,
            fontWeight: 'bold',
            cursor: checking ? 'not-allowed' : 'pointer',
            opacity: checking ? 0.7 : 1
          }}>
            {checking ? '验证中…' : '验证并进入后台'}
          </button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
};
