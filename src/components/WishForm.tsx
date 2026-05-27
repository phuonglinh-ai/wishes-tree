'use client';

import { useState } from 'react';
import { LeafColor, LEAF_COLORS, WishFormData } from '@/types/wish';

interface WishFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const INITIAL: WishFormData = {
  sender_name: '',
  student_name: '',
  message: '',
  leaf_color: 'green',
  _honey: '',
};

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export default function WishForm({ onClose, onSuccess }: WishFormProps) {
  const [form, setForm] = useState<WishFormData>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof WishFormData, string>>>({});
  const [state, setState] = useState<FormState>('idle');
  const [serverError, setServerError] = useState('');

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.sender_name.trim()) e.sender_name = 'Vui lòng nhập tên người gửi.';
    else if (form.sender_name.length > 80) e.sender_name = 'Tối đa 80 ký tự.';
    if (form.student_name && form.student_name.length > 80)
      e.student_name = 'Tối đa 80 ký tự.';
    if (!form.message.trim()) e.message = 'Vui lòng nhập lời chúc.';
    else if (form.message.trim().length < 10) e.message = 'Lời chúc phải có ít nhất 10 ký tự.';
    else if (form.message.length > 300) e.message = 'Lời chúc tối đa 300 ký tự.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setState('submitting');
    setServerError('');

    try {
      const res = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error ?? 'Có lỗi xảy ra. Vui lòng thử lại.');
        setState('error');
      } else {
        setState('success');
        onSuccess();
      }
    } catch {
      setServerError('Không thể kết nối. Vui lòng kiểm tra mạng và thử lại.');
      setState('error');
    }
  };

  const set = (field: keyof WishFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }));
  };

  // ── Success screen ───────────────────────────────
  if (state === 'success') {
    return (
      <>
        <div className="backdrop" onClick={onClose} aria-hidden="true" />
        <div className="drawer" role="dialog" aria-modal="true" aria-label="Gửi lời chúc">
          <button className="drawer-close" onClick={onClose} aria-label="Đóng" id="drawer-close-success">
            ✕
          </button>
          <div className="success-banner">
            <div style={{ fontSize: '3.5rem' }}>🌿</div>
            <h2 className="drawer-title" style={{ textAlign: 'center' }}>Cảm ơn bạn!</h2>
            <p style={{ color: '#4a2c0a', textAlign: 'center', fontSize: '0.95rem' }}>
              Lời chúc của bạn đã được gửi thành công và đang chờ duyệt! Nó sẽ xuất hiện trên cây sau khi được quản trị viên đồng ý.
            </p>
            <button className="btn btn-primary" onClick={onClose} id="close-success-btn">
              Quay lại cây lời chúc
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── Form ──────────────────────────────────────────
  return (
    <>
      <div className="backdrop" onClick={onClose} aria-hidden="true" />
      <div className="drawer" role="dialog" aria-modal="true" aria-label="Gửi lời chúc" id="wish-form-drawer">
        <button className="drawer-close" onClick={onClose} aria-label="Đóng" id="drawer-close-btn">✕</button>

        <h2 className="drawer-title">🍃 Gửi lời chúc</h2>
        <p className="drawer-subtitle">Lời chúc của bạn sẽ trở thành một chiếc lá trên cây.</p>

        <form onSubmit={handleSubmit} noValidate>
          {/* Honeypot — hidden from humans, bots will fill it */}
          <input
            type="text"
            name="_honey"
            value={form._honey}
            onChange={set('_honey')}
            style={{ display: 'none' }}
            aria-hidden="true"
            tabIndex={-1}
            autoComplete="off"
          />

          {/* Sender name */}
          <div style={{ marginBottom: '16px' }}>
            <label className="input-label" htmlFor="sender-name-input">
              Tên người gửi <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              id="sender-name-input"
              className="input"
              type="text"
              placeholder="Ví dụ: Bố mẹ bé Minh, Cô giáo Lan…"
              value={form.sender_name}
              onChange={set('sender_name')}
              maxLength={80}
              autoComplete="name"
            />
            {errors.sender_name && <p className="input-error">{errors.sender_name}</p>}
          </div>

          {/* Recipient */}
          <div style={{ marginBottom: '16px' }}>
            <label className="input-label" htmlFor="student-name-input">
              Gửi tới (học sinh) — không bắt buộc
            </label>
            <input
              id="student-name-input"
              className="input"
              type="text"
              placeholder="Ví dụ: Bé An, Cả lớp 5A…"
              value={form.student_name}
              onChange={set('student_name')}
              maxLength={80}
            />
            {errors.student_name && <p className="input-error">{errors.student_name}</p>}
          </div>

          {/* Message */}
          <div style={{ marginBottom: '16px' }}>
            <label className="input-label" htmlFor="message-input">
              Lời chúc <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <textarea
              id="message-input"
              className="input"
              placeholder="Viết lời chúc của bạn từ trái tim…"
              value={form.message}
              onChange={set('message')}
              maxLength={300}
              rows={5}
              style={{ resize: 'vertical', minHeight: '100px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
              {errors.message
                ? <p className="input-error">{errors.message}</p>
                : <span />}
              <span style={{ fontSize: '0.75rem', color: '#a07850' }}>
                {form.message.length}/300
              </span>
            </div>
          </div>

          {/* Leaf color picker */}
          <div style={{ marginBottom: '24px' }}>
            <label className="input-label">Màu chiếc lá</label>
            <div className="color-picker">
              {LEAF_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  className={`color-option ${form.leaf_color === c.value ? 'selected' : ''}`}
                  style={{ background: c.hex }}
                  onClick={() => setForm((f) => ({ ...f, leaf_color: c.value as LeafColor }))}
                  aria-label={c.label}
                  title={c.label}
                  id={`color-${c.value}`}
                />
              ))}
            </div>
          </div>

          {/* Server error */}
          {state === 'error' && serverError && (
            <div style={{
              background: '#fee2e2', border: '1px solid #fca5a5',
              borderRadius: '8px', padding: '10px 14px',
              fontSize: '0.875rem', color: '#dc2626', marginBottom: '16px',
            }}>
              {serverError}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={state === 'submitting'}
            style={{ width: '100%', padding: '13px' }}
            id="submit-wish-btn"
          >
            {state === 'submitting' ? (
              <>
                <span className="spinner" />
                Đang gửi…
              </>
            ) : (
              '🌿 Gửi lời chúc'
            )}
          </button>
        </form>
      </div>
    </>
  );
}
