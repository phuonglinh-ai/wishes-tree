export type WishStatus = 'pending' | 'approved' | 'hidden';

export interface Wish {
  id: string;
  sender_name: string;
  student_name: string | null;
  message: string;
  leaf_color: LeafColor;
  status: WishStatus;
  created_at: string;
}

export type LeafColor = 'green' | 'yellow' | 'orange' | 'pink' | 'teal' | 'lime';

export const LEAF_COLORS: { value: LeafColor; label: string; hex: string }[] = [
  { value: 'green',  label: 'Xanh lá',   hex: '#4ade80' },
  { value: 'teal',   label: 'Xanh ngọc', hex: '#2dd4bf' },
  { value: 'lime',   label: 'Xanh nõn',  hex: '#a3e635' },
  { value: 'yellow', label: 'Vàng nắng', hex: '#fbbf24' },
  { value: 'orange', label: 'Cam ấm',    hex: '#fb923c' },
  { value: 'pink',   label: 'Hồng nhạt', hex: '#f9a8d4' },
];

export interface WishFormData {
  sender_name: string;
  student_name: string;
  message: string;
  leaf_color: LeafColor;
  _honey?: string; // honeypot field
}
