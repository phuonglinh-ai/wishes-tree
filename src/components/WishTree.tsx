'use client';

import { useEffect, useState } from 'react';
import { Wish } from '@/types/wish';
import WishLeaf from './WishLeaf';

// Fallback demo wishes when DB is empty or not yet configured
const DEMO_WISHES: Wish[] = [
  {
    id: 'demo-1',
    sender_name: 'Bố Mẹ bé An',
    student_name: 'Bé An',
    message:
      'Con đã khép lại những năm tháng tiểu học thật đẹp. Mong con luôn giữ trái tim trong sáng, tinh thần ham học hỏi và lòng tin vào chính mình.',
    leaf_color: 'green',
    status: 'approved',
    created_at: '2026-05-27T03:00:00.000Z',
  },
  {
    id: 'demo-2',
    sender_name: 'Cô giáo Lan',
    student_name: 'Cả lớp 5A',
    message: 'Các con đã lớn rồi! Cô chúc các con luôn vui vẻ, tự tin bước vào trường mới.',
    leaf_color: 'yellow',
    status: 'approved',
    created_at: '2026-05-27T03:00:00.000Z',
  },
  {
    id: 'demo-3',
    sender_name: 'Bà nội',
    student_name: 'Cháu Minh',
    message: 'Bà thương cháu lắm. Học giỏi nhé, cháu yêu!',
    leaf_color: 'pink',
    status: 'approved',
    created_at: '2026-05-27T03:00:00.000Z',
  },
  {
    id: 'demo-4',
    sender_name: 'Chú Hùng',
    student_name: 'Bé Hà',
    message: 'Chúc cháu luôn vui, học giỏi và mạnh khoẻ vào năm học mới.',
    leaf_color: 'orange',
    status: 'approved',
    created_at: '2026-05-27T03:00:00.000Z',
  },
  {
    id: 'demo-5',
    sender_name: 'Dì Thu',
    student_name: null,
    message: 'Tạm biệt tiểu học! Chào đón những điều tuyệt vời phía trước nhé.',
    leaf_color: 'teal',
    status: 'approved',
    created_at: '2026-05-27T03:00:00.000Z',
  },
];

interface WishTreeProps {
  wishes: Wish[];
  searchQuery: string;
}

export default function WishTree({ wishes, searchQuery }: WishTreeProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Combine real wishes with demo wishes so the tree always looks full
  const displayWishes = [...wishes, ...DEMO_WISHES];

  // Find highlighted wish ID(s) from search query
  const highlightedIds = searchQuery.trim()
    ? new Set(
        displayWishes
          .filter((w) =>
            (w.student_name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            w.sender_name.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((w) => w.id)
      )
    : new Set<string>();

  return (
    <div className="tree-section" id="wish-tree-section">
      <div className="tree-canvas" aria-label="Cây lời chúc">
        {/* ── Tree SVG ─────────────────────────── */}
        <svg
          viewBox="0 0 400 500"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
          }}
          aria-hidden="true"
        >
          {/* Ground shadow */}
          <ellipse cx="200" cy="490" rx="90" ry="12" fill="rgba(61,35,20,0.12)" />

          {/* Main trunk */}
          <path
            d="M185 490 C183 440 178 400 175 360 C172 320 170 280 180 240 C185 220 190 210 200 200"
            stroke="#6b3e26" strokeWidth="22" strokeLinecap="round" fill="none"
          />
          <path
            d="M215 490 C217 440 222 400 225 360 C228 320 230 280 220 240 C215 220 210 210 200 200"
            stroke="#8b5a2b" strokeWidth="18" strokeLinecap="round" fill="none"
          />
          {/* Trunk highlight */}
          <path
            d="M197 490 C196 440 194 390 193 350 C192 310 193 270 197 235"
            stroke="#c4874a" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.4"
          />

          {/* Left branch */}
          <path
            d="M185 320 C160 300 130 280 105 255"
            stroke="#6b3e26" strokeWidth="10" strokeLinecap="round" fill="none"
          />
          <path
            d="M105 255 C85 235 70 215 65 195"
            stroke="#8b5a2b" strokeWidth="7" strokeLinecap="round" fill="none"
          />

          {/* Right branch */}
          <path
            d="M215 340 C240 315 270 295 295 270"
            stroke="#6b3e26" strokeWidth="10" strokeLinecap="round" fill="none"
          />
          <path
            d="M295 270 C315 250 330 230 340 210"
            stroke="#8b5a2b" strokeWidth="7" strokeLinecap="round" fill="none"
          />

          {/* Upper left branch */}
          <path
            d="M190 260 C165 240 140 215 120 190"
            stroke="#8b5a2b" strokeWidth="8" strokeLinecap="round" fill="none"
          />

          {/* Upper right branch */}
          <path
            d="M208 255 C230 235 255 215 275 190"
            stroke="#8b5a2b" strokeWidth="8" strokeLinecap="round" fill="none"
          />

          {/* Canopy — back layer (darker, behind) */}
          <ellipse cx="200" cy="160" rx="155" ry="130" fill="#15803d" opacity="0.25" />
          {/* Canopy — mid layer */}
          <ellipse cx="195" cy="150" rx="148" ry="125" fill="#16a34a" opacity="0.35" />
          {/* Canopy — front blobs */}
          <ellipse cx="155" cy="175" rx="85" ry="70" fill="#22c55e" opacity="0.4" />
          <ellipse cx="245" cy="165" rx="90" ry="75" fill="#22c55e" opacity="0.35" />
          <ellipse cx="200" cy="115" rx="100" ry="75" fill="#4ade80" opacity="0.3" />
          {/* Canopy highlight */}
          <ellipse cx="175" cy="100" rx="60" ry="45" fill="#86efac" opacity="0.2" />
        </svg>

        {/* ── Leaves layer ─────────────────────── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 3,
          }}
        >
          {displayWishes.map((wish, idx) => (
            <WishLeaf
              key={wish.id}
              wish={wish}
              index={idx}
              isHighlighted={highlightedIds.has(wish.id)}
              isMobile={isMobile}
            />
          ))}
        </div>


      </div>
    </div>
  );
}
