import { LeafColor } from '@/types/wish';

// ─────────────────────────────────────────────
// Hash-based canopy placement algorithm
// Produces a STABLE (x, y) position from a wish's
// index so leaves always appear in the same spot.
// No position_x / position_y stored in the DB.
// ─────────────────────────────────────────────

// Simple deterministic hash from a string (djb2)
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
}

export interface LeafPosition {
  x: number; // percentage (0–100) relative to canopy container
  y: number; // percentage (0–100) relative to canopy container
  rotation: number; // degrees
  scale: number; // 0.8–1.2
  animationDelay: number; // seconds
}

// Canopy is modelled as an ellipse.
// We use rejection sampling seeded by the hash to keep leaves inside.
export function getLeafPosition(wishId: string, index: number): LeafPosition {
  const seed = hashString(wishId + index.toString());

  // Generate pseudo-random numbers from seed
  const rand = (n: number) => {
    const x = Math.sin(seed + n) * 10000;
    return x - Math.floor(x);
  };

  // Ellipse parameters (cx, cy = centre; rx, ry = radii in %)
  // Canopy occupies ~76% width (12% to 88%), ~52% height (6% to 58%) of the container
  const cx = 50;
  const cy = 32; // shifted UP to match SVG
  const rx = 36;
  const ry = 22; // tighter vertical radius so it doesn't fall out of canopy

  // Sample a point inside the ellipse
  const angle = rand(1) * 2 * Math.PI;
  const rFactor = Math.sqrt(rand(2)); // sqrt for uniform distribution
  const x = cx + rx * rFactor * Math.cos(angle);
  const y = cy + ry * rFactor * Math.sin(angle);

  // Add small per-leaf perturbation so nearby leaves don't stack
  const jitterX = (rand(3) - 0.5) * 6;
  const jitterY = (rand(4) - 0.5) * 6;

  const finalX = Math.max(5, Math.min(95, x + jitterX));
  const finalY = Math.max(5, Math.min(90, y + jitterY));
  const rotation = (rand(5) - 0.5) * 40;
  const scale = 0.85 + rand(6) * 0.35;
  const animationDelay = rand(7) * 3;

  return {
    x: parseFloat(finalX.toFixed(4)),
    y: parseFloat(finalY.toFixed(4)),
    rotation: parseFloat(rotation.toFixed(4)),
    scale: parseFloat(scale.toFixed(4)),
    animationDelay: parseFloat(animationDelay.toFixed(4)),
  };
}

// ─────────────────────────────────────────────
// Leaf colour CSS values
// ─────────────────────────────────────────────
export const LEAF_COLOR_MAP: Record<LeafColor, { fill: string; stroke: string }> = {
  green:  { fill: '#4ade80', stroke: '#16a34a' },
  teal:   { fill: '#2dd4bf', stroke: '#0d9488' },
  lime:   { fill: '#a3e635', stroke: '#65a30d' },
  yellow: { fill: '#fbbf24', stroke: '#d97706' },
  orange: { fill: '#fb923c', stroke: '#ea580c' },
  pink:   { fill: '#f9a8d4', stroke: '#ec4899' },
};

// ─────────────────────────────────────────────
// Date formatting helper
// ─────────────────────────────────────────────
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(date);
}

// ─────────────────────────────────────────────
// Sanitize text — strips HTML tags, trims whitespace
// ─────────────────────────────────────────────
export function sanitizeText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .trim();
}
