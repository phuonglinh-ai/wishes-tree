'use client';

import { useRef, useState } from 'react';
import { Wish } from '@/types/wish';
import { getLeafPosition, LEAF_COLOR_MAP } from '@/lib/utils';
import WishTooltip, { WishBottomSheet } from './WishTooltip';

interface WishLeafProps {
  wish: Wish;
  index: number;
  isHighlighted: boolean;
  isMobile: boolean;
}

export default function WishLeaf({ wish, index, isHighlighted, isMobile }: WishLeafProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const leafRef = useRef<HTMLDivElement>(null);

  const pos = getLeafPosition(wish.id, index);
  const color = LEAF_COLOR_MAP[wish.leaf_color] ?? LEAF_COLOR_MAP.green;

  const handleMouseEnter = () => {
    if (isMobile) return;
    const rect = leafRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltipPos({
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
    }
    setShowTooltip(true);
  };

  const handleClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    if ('key' in e && e.key !== 'Enter' && e.key !== ' ') return;
    e.stopPropagation();

    if (isMobile) {
      setShowSheet(true);
    } else {
      handleMouseEnter();
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) setShowTooltip(false);
  };

  const leafSize = Math.round(28 + pos.scale * 14); // 28–42px, min 28px for touch

  return (
    <>
      <div
        ref={leafRef}
        className={`leaf-wrapper ${isHighlighted ? 'highlighted' : ''}`}
        style={{
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          '--leaf-rot': `${pos.rotation}deg`,
          '--leaf-scale': pos.scale,
          animationDelay: `${pos.animationDelay}s`,
          animationDuration: `${3 + pos.animationDelay}s`,
        } as React.CSSProperties}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleClick}
        role="button"
        tabIndex={0}
        aria-label={`Lời chúc từ ${wish.sender_name}${wish.student_name ? ` gửi tới ${wish.student_name}` : ''}`}
        id={`leaf-${wish.id}`}
      >
        {/* Leaf SVG */}
        <svg
          width={leafSize}
          height={Math.round(leafSize * 0.7)}
          viewBox="0 0 60 42"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'block', filter: isHighlighted ? 'drop-shadow(0 0 6px ' + color.fill + ')' : undefined }}
        >
          <ellipse
            cx="30" cy="21"
            rx="29" ry="18"
            fill={color.fill}
            stroke={color.stroke}
            strokeWidth="1.5"
          />
          {/* Central vein */}
          <line x1="2" y1="21" x2="58" y2="21" stroke={color.stroke} strokeWidth="1" opacity="0.6" />
          {/* Side veins */}
          <line x1="30" y1="21" x2="15" y2="10" stroke={color.stroke} strokeWidth="0.7" opacity="0.4" />
          <line x1="30" y1="21" x2="15" y2="32" stroke={color.stroke} strokeWidth="0.7" opacity="0.4" />
          <line x1="30" y1="21" x2="45" y2="10" stroke={color.stroke} strokeWidth="0.7" opacity="0.4" />
          <line x1="30" y1="21" x2="45" y2="32" stroke={color.stroke} strokeWidth="0.7" opacity="0.4" />
        </svg>

        {/* Desktop tooltip */}
        {!isMobile && showTooltip && (
          <WishTooltip wish={wish} x={tooltipPos.x} y={tooltipPos.y} />
        )}
      </div>

      {/* Mobile bottom sheet (portal-like, rendered in body flow) */}
      {isMobile && showSheet && (
        <WishBottomSheet wish={wish} onClose={() => setShowSheet(false)} />
      )}
    </>
  );
}
