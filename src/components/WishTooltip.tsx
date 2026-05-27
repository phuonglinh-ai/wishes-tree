'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Wish } from '@/types/wish';
import { formatDate } from '@/lib/utils';

interface WishTooltipProps {
  wish: Wish;
  // Position relative to viewport (for desktop tooltip)
  x?: number;
  y?: number;
  // For mobile, render as bottom sheet (handled by parent)
}

export function WishTooltipContent({ wish }: { wish: Wish }) {
  return (
    <>
      <p className="tooltip-sender">
        🌿 {wish.sender_name}
      </p>
      {wish.student_name && (
        <p className="tooltip-recipient">
          Gửi tới: <strong>{wish.student_name}</strong>
        </p>
      )}
      <p className="tooltip-message">&ldquo;{wish.message}&rdquo;</p>
      <p style={{ fontSize: '0.72rem', color: '#a07850', marginTop: '8px' }}>
        {formatDate(wish.created_at)}
      </p>
    </>
  );
}

export default function WishTooltip({
  wish,
  x = 0,
  y = 0,
}: WishTooltipProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Clamp position so tooltip doesn't overflow viewport
  const tipWidth = 240;
  const tipHeight = 140;
  const margin = 12;

  const left = Math.min(
    Math.max(margin, x - tipWidth / 2),
    typeof window !== 'undefined' ? window.innerWidth - tipWidth - margin : margin
  );
  const top = y < tipHeight + 60
    ? y + 30   // below leaf
    : y - tipHeight - 10; // above leaf

  if (!mounted) return null;

  return createPortal(
    <div
      className="tooltip"
      style={{ left, top, width: tipWidth, position: 'fixed', zIndex: 9999 }}
      role="tooltip"
    >
      <WishTooltipContent wish={wish} />
    </div>,
    document.body
  );
}

// ─── Bottom Sheet (mobile) ────────────────────
export function WishBottomSheet({
  wish,
  onClose,
}: {
  wish: Wish;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <>
      <div className="backdrop" onClick={onClose} aria-hidden="true" style={{ zIndex: 9998 }} />
      <div
        className="bottom-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Chi tiết lời chúc"
        id="wish-bottom-sheet"
        style={{ zIndex: 9999 }}
      >
        <div className="bottom-sheet-handle" />
        <WishTooltipContent wish={wish} />
        <button
          className="btn btn-secondary"
          style={{ width: '100%', marginTop: '16px' }}
          onClick={onClose}
          id="close-bottom-sheet-btn"
        >
          Đóng
        </button>
      </div>
    </>,
    document.body
  );
}
