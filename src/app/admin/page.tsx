'use client';

import { useState } from 'react';
import AdminWishTable from '@/components/AdminWishTable';

const SESSION_KEY = 'cwlc_admin_auth';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Restore from sessionStorage
  const [authed, setAuthed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !!sessionStorage.getItem(SESSION_KEY);
  });
  const [savedPw, setSavedPw] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return sessionStorage.getItem(SESSION_KEY) ?? '';
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Verify against API — if wrong password, API returns 401
    try {
      const res = await fetch('/api/wishes?admin=1&page=1', {
        headers: { 'x-admin-password': input },
      });
      if (res.status === 401) {
        setError('Mật khẩu không đúng. Vui lòng thử lại.');
      } else if (!res.ok) {
        setError('Có lỗi xảy ra. Vui lòng thử lại.');
      } else {
        sessionStorage.setItem(SESSION_KEY, input);
        setSavedPw(input);
        setPassword(input);
        setAuthed(true);
      }
    } catch {
      setError('Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
    setSavedPw('');
    setPassword('');
    setInput('');
  };

  // ── Login screen ───────────────────────────────
  if (!authed) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'var(--cream)',
      }}>
        <div className="glass" style={{ maxWidth: '380px', width: '100%', padding: '40px 32px' }}>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '6px', textAlign: 'center' }}>
            🔐 Trang Admin
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#7c5228', textAlign: 'center', marginBottom: '32px' }}>
            Nhập mật khẩu để quản lý lời chúc
          </p>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label className="input-label" htmlFor="admin-password-input">Mật khẩu admin</label>
              <input
                id="admin-password-input"
                className="input"
                type="password"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập mật khẩu…"
                autoFocus
                autoComplete="current-password"
              />
            </div>
            {error && (
              <div style={{
                background: '#fee2e2', border: '1px solid #fca5a5',
                borderRadius: '8px', padding: '10px 14px',
                color: '#dc2626', fontSize: '0.875rem', marginBottom: '16px',
              }}>
                {error}
              </div>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
              disabled={loading || !input}
              id="admin-login-btn"
            >
              {loading ? <><span className="spinner" /> Đang kiểm tra…</> : 'Đăng nhập'}
            </button>
          </form>
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <a href="/" style={{ fontSize: '0.85rem', color: '#7c5228', textDecoration: 'none' }}>
              ← Quay lại Cây lời chúc
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Admin dashboard ──────────────────────────────
  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '4px' }}>🌿 Quản lý Lời chúc</h1>
          <p style={{ color: '#7c5228', fontSize: '0.875rem' }}>
            Duyệt, ẩn hoặc xóa lời chúc để cây hiển thị đúng nội dung.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <a href="/" className="btn btn-secondary" id="admin-back-btn">
            ← Xem cây
          </a>
          <button className="btn btn-ghost" onClick={handleLogout} id="admin-logout-btn">
            Đăng xuất
          </button>
        </div>
      </div>
      <AdminWishTable adminPassword={savedPw} />
    </div>
  );
}
