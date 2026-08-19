import React, { useEffect, useState } from 'react';

interface PendingRow {
  id: string;
  full_name: string;
  age: number | null;
  native_culture: string | null;
  target_culture: string | null;
  bio: string | null;
  interests: string[] | null;
  avatar_url: string | null;
  created_at: string;
}

export default function AdminDashboard() {
  const [rows, setRows] = useState<PendingRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actingId, setActingId] = useState<string | null>(null);

  const pwd = () => sessionStorage.getItem('aura_admin_pwd') || '';

  const loadPending = async () => {
    setLoading(true);
    setError('');
    try {
      const resp = await fetch('/api/admin-pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd() }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data.error || '加载失败');
        setRows([]);
        return;
      }
      setRows(data.rows || []);
    } catch {
      setError('网络错误，加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const act = async (id: string, action: 'approve' | 'reject') => {
    setActingId(id);
    try {
      const resp = await fetch('/api/admin-moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd(), id, action }),
      });
      if (resp.ok) {
        setRows((prev) => prev.filter((r) => r.id !== id));
      } else {
        const data = await resp.json();
        alert(data.error || '操作失败');
      }
    } catch {
      alert('网络错误，操作失败');
    } finally {
      setActingId(null);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('aura_admin_auth');
    sessionStorage.removeItem('aura_admin_pwd');
    window.location.reload();
  };

  return (
    <div style={{ padding: '24px 16px', color: '#f8fafc', background: '#020617', minHeight: '100dvh', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <h1 style={{ fontSize: 18, margin: 0 }}>🛠️ 名片审核后台</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={loadPending} style={btnStyle('#1e293b')}>🔄 刷新</button>
          <button onClick={logout} style={btnStyle('#7f1d1d')}>退出登录</button>
        </div>
      </div>

      <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>
        真实用户提交的名片会先进入这里（status = pending），只有点击"通过"之后才会出现在公开卡池里；种子/演示账号不受影响。
      </p>

      {loading && <div style={{ color: '#94a3b8', fontSize: 13 }}>加载中…</div>}
      {error && <div style={{ color: '#f87171', fontSize: 13, marginBottom: 12 }}>⚠️ {error}</div>}
      {!loading && !error && rows.length === 0 && (
        <div style={{ color: '#64748b', fontSize: 13 }}>✅ 目前没有待审核的名片。</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {rows.map((row) => (
          <div key={row.id} style={{ border: '1px solid #334155', borderRadius: 14, padding: 14, background: '#0f172a', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {row.avatar_url && (
              <img
                src={row.avatar_url}
                alt={row.full_name}
                style={{ width: 84, height: 100, objectFit: 'cover', borderRadius: 10, background: '#000', flexShrink: 0 }}
              />
            )}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontWeight: 'bold', fontSize: 14 }}>
                {row.full_name} {row.age ? `· ${row.age}` : ''}
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0' }}>
                📍 {row.native_culture || '-'} → 🎯 {row.target_culture || '-'}
              </div>
              <div style={{ fontSize: 12, color: '#e2e8f0', margin: '4px 0' }}>{row.bio}</div>
              {Array.isArray(row.interests) && row.interests.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                  {row.interests.map((tag) => (
                    <span key={tag} style={{ fontSize: 10, color: '#94a3b8', border: '1px solid #334155', borderRadius: 6, padding: '2px 6px' }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              <div style={{ fontSize: 10, color: '#64748b', marginTop: 6 }}>{new Date(row.created_at).toLocaleString()}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center' }}>
              <button
                disabled={actingId === row.id}
                onClick={() => act(row.id, 'approve')}
                style={btnStyle('#065f46', actingId === row.id)}
              >
                ✅ 通过
              </button>
              <button
                disabled={actingId === row.id}
                onClick={() => act(row.id, 'reject')}
                style={btnStyle('#7f1d1d', actingId === row.id)}
              >
                ❌ 驳回
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function btnStyle(bg: string, disabled = false): React.CSSProperties {
  return {
    padding: '8px 12px',
    borderRadius: 8,
    border: 'none',
    background: bg,
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
  };
}
