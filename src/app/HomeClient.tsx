'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Wish } from '@/types/wish';
import WishTree from '@/components/WishTree';
import WishForm from '@/components/WishForm';

// Dynamic imports for non-critical components
const FallingLeaves = dynamic(() => import('@/components/FallingLeaves'), { ssr: false });
const BackgroundMusic = dynamic(() => import('@/components/BackgroundMusic'), { ssr: false });

interface HomeClientProps {
  initialWishes: Wish[];
}

export default function HomeClient({ initialWishes }: HomeClientProps) {
  const [wishes, setWishes] = useState<Wish[]>(initialWishes);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Refresh wishes from the server
  const refreshWishes = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/wishes');
      if (res.ok) {
        const json = await res.json();
        setWishes(json.wishes ?? []);
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Prevent scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = showForm ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showForm]);

  return (
    <>
      {/* Background */}
      <div className="page-bg" aria-hidden="true" />
      <FallingLeaves />
      <BackgroundMusic />

      {/* Main content */}
      <main style={{ position: 'relative', zIndex: 1, paddingBottom: '100px' }}>

        {/* ── Hero ──────────────────────────────── */}
        <section className="hero" id="hero-section">
          <div className="hero-badge">
            🎓 Tốt nghiệp Tiểu học 2025
          </div>
          <h1>Cây Lời Chúc</h1>
          <p className="hero-subtitle">
            Tạm biệt tiểu học, chào hành trình mới
          </p>
          <p className="hero-desc">
            Mỗi chiếc lá là một lời yêu thương gửi tới các con trong ngày khép lại những năm tháng tiểu học.
          </p>
        </section>

        {/* ── Controls bar ──────────────────────── */}
        <div className="controls-bar" id="controls-bar">
          {/* Search */}
          <div className="search-wrapper">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              id="search-input"
              className="input"
              type="search"
              placeholder="Tìm tên học sinh…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Tìm kiếm tên học sinh"
            />
          </div>

          {/* Refresh */}
          <button
            className="btn btn-secondary"
            onClick={refreshWishes}
            disabled={refreshing}
            id="refresh-tree-btn"
            aria-label="Tải lại cây lời chúc"
            title="Tải lại cây"
          >
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
              style={{ animation: refreshing ? 'spin 0.7s linear infinite' : undefined }}
            >
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            {refreshing ? 'Đang tải…' : 'Tải lại cây'}
          </button>

          {/* Wish count */}
          {wishes.length > 0 && (
            <span style={{ fontSize: '0.85rem', color: '#7c5228' }}>
              🍃 {wishes.length} lời chúc
            </span>
          )}
        </div>

        {/* ── Wish Tree ─────────────────────────── */}
        <WishTree wishes={wishes} searchQuery={searchQuery} />

      </main>

      {/* ── FAB — send wish ───────────────────── */}
      <button
        className="btn btn-primary fab-send"
        onClick={() => setShowForm(true)}
        id="fab-send-wish-btn"
        aria-label="Gửi lời chúc"
      >
        🍃 Gửi lời chúc của bạn
      </button>

      {/* ── Form drawer ───────────────────────── */}
      {showForm && (
        <WishForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            // Quietly refresh so the sender can see the tree update
            // (their wish is pending, won't appear until approved)
          }}
        />
      )}

      {/* ── Footer ────────────────────────────── */}
      <footer style={{
        textAlign: 'center',
        padding: '16px',
        fontSize: '0.78rem',
        color: '#a07850',
        position: 'relative',
        zIndex: 1,
      }}>
        Cây Lời Chúc · Tốt nghiệp Tiểu học 2025 ·{' '}
        <a href="/admin" style={{ color: '#a07850', opacity: 0.6 }}>Admin</a>
      </footer>
    </>
  );
}
