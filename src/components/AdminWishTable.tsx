'use client';

import { Wish, WishStatus } from '@/types/wish';
import { formatDate } from '@/lib/utils';
import { useState, useCallback } from 'react';

interface AdminWishTableProps {
  adminPassword: string;
}

type SortedWish = Wish & { status: WishStatus };

const STATUS_LABELS: Record<WishStatus, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  hidden: 'Bị ẩn',
};

export default function AdminWishTable({ adminPassword }: AdminWishTableProps) {
  const [wishes, setWishes] = useState<SortedWish[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<WishStatus | 'all'>('all');
  const LIMIT = 20;

  const fetchWishes = useCallback(async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/wishes?admin=1&page=${p}`, {
        headers: { 'x-admin-password': adminPassword },
      });
      if (!res.ok) throw new Error('Không thể tải danh sách lời chúc.');
      const json = await res.json();
      setWishes(json.wishes ?? []);
      setTotal(json.total ?? 0);
      setPage(p);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Lỗi không xác định.');
    } finally {
      setLoading(false);
    }
  }, [adminPassword]);

  // Load on first render
  useState(() => { fetchWishes(1); });

  const updateStatus = async (id: string, status: WishStatus) => {
    setActionLoading(id + status);
    try {
      const res = await fetch(`/api/wishes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setWishes((prev) =>
        prev.map((w) => (w.id === id ? { ...w, status } : w))
      );
    } catch {
      alert('Không thể cập nhật trạng thái. Vui lòng thử lại.');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteWish = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa lời chúc này không?')) return;
    setActionLoading(id + 'delete');
    try {
      const res = await fetch(`/api/wishes/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-password': adminPassword },
      });
      if (!res.ok) throw new Error();
      setWishes((prev) => prev.filter((w) => w.id !== id));
      setTotal((t) => t - 1);
    } catch {
      alert('Không thể xóa lời chúc. Vui lòng thử lại.');
    } finally {
      setActionLoading(null);
    }
  };

  const displayWishes = filterStatus === 'all'
    ? wishes
    : wishes.filter((w) => w.status === filterStatus);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
        <select
          className="input"
          style={{ width: 'auto' }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as WishStatus | 'all')}
          id="admin-filter-status"
        >
          <option value="all">Tất cả ({total})</option>
          <option value="pending">Chờ duyệt</option>
          <option value="approved">Đã duyệt</option>
          <option value="hidden">Bị ẩn</option>
        </select>
        <button
          className="btn btn-secondary"
          onClick={() => fetchWishes(page)}
          disabled={loading}
          id="admin-refresh-btn"
        >
          {loading ? <span className="spinner" style={{ borderTopColor: '#6b3e26' }} /> : '↻'} Tải lại
        </button>
      </div>

      {error && (
        <div style={{
          background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px',
          padding: '10px 14px', color: '#dc2626', marginBottom: '16px',
        }}>
          {error}
        </div>
      )}

      <div className="admin-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Người gửi</th>
              <th>Gửi tới</th>
              <th>Lời chúc</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#a07850' }}>
                  Đang tải…
                </td>
              </tr>
            )}
            {!loading && displayWishes.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#a07850' }}>
                  Không có lời chúc nào.
                </td>
              </tr>
            )}
            {displayWishes.map((wish) => (
              <tr key={wish.id}>
                <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                  {formatDate(wish.created_at)}
                </td>
                <td><strong>{wish.sender_name}</strong></td>
                <td>{wish.student_name ?? '—'}</td>
                <td style={{ maxWidth: '260px' }}>
                  <span style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
                    {wish.message}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${wish.status}`}>
                    {STATUS_LABELS[wish.status]}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {wish.status !== 'approved' && (
                      <button
                        className="btn btn-approve"
                        style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                        onClick={() => updateStatus(wish.id, 'approved')}
                        disabled={actionLoading === wish.id + 'approved'}
                        id={`approve-${wish.id}`}
                      >
                        ✓ Duyệt
                      </button>
                    )}
                    {wish.status !== 'hidden' && (
                      <button
                        className="btn btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                        onClick={() => updateStatus(wish.id, 'hidden')}
                        disabled={actionLoading === wish.id + 'hidden'}
                        id={`hide-${wish.id}`}
                      >
                        Ẩn
                      </button>
                    )}
                    {wish.status !== 'pending' && (
                      <button
                        className="btn btn-ghost"
                        style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                        onClick={() => updateStatus(wish.id, 'pending')}
                        disabled={actionLoading === wish.id + 'pending'}
                        id={`pending-${wish.id}`}
                      >
                        Chờ
                      </button>
                    )}
                    <button
                      className="btn btn-danger"
                      style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                      onClick={() => deleteWish(wish.id)}
                      disabled={actionLoading === wish.id + 'delete'}
                      id={`delete-${wish.id}`}
                    >
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-secondary"
            onClick={() => fetchWishes(page - 1)}
            disabled={page <= 1 || loading}
            id="admin-prev-page"
          >
            ← Trước
          </button>
          <span style={{ fontSize: '0.875rem', color: '#6b3e26' }}>
            Trang {page} / {totalPages}
          </span>
          <button
            className="btn btn-secondary"
            onClick={() => fetchWishes(page + 1)}
            disabled={page >= totalPages || loading}
            id="admin-next-page"
          >
            Tiếp →
          </button>
        </div>
      )}
    </div>
  );
}
