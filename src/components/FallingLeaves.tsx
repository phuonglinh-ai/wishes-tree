'use client';

import { useEffect, useRef } from 'react';

interface FallingLeaf {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  rot: number;
  rotSpeed: number;
  color: string;
  opacity: number;
}

const COLORS = ['#4ade80', '#a3e635', '#fbbf24', '#fb923c', '#f9a8d4', '#2dd4bf'];

export default function FallingLeaves() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const leaves: FallingLeaf[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Spawn a leaf
    const spawn = (): FallingLeaf => ({
      x: Math.random() * window.innerWidth,
      y: -40,
      size: 8 + Math.random() * 10,
      speed: 0.6 + Math.random() * 0.8,
      drift: (Math.random() - 0.5) * 1.2,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.04,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: 0.5 + Math.random() * 0.4,
    });

    // Initial leaves
    for (let i = 0; i < 12; i++) {
      const leaf = spawn();
      leaf.y = Math.random() * window.innerHeight;
      leaves.push(leaf);
    }

    const drawLeaf = (l: FallingLeaf) => {
      ctx.save();
      ctx.translate(l.x, l.y);
      ctx.rotate(l.rot);
      ctx.globalAlpha = l.opacity;
      ctx.fillStyle = l.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, l.size, l.size * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      // Vein
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(-l.size, 0);
      ctx.lineTo(l.size, 0);
      ctx.stroke();
      ctx.restore();
    };

    let spawnTimer = 0;

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn new leaves slowly
      spawnTimer++;
      if (spawnTimer > 90 && leaves.length < 20) {
        leaves.push(spawn());
        spawnTimer = 0;
      }

      for (let i = leaves.length - 1; i >= 0; i--) {
        const l = leaves[i];
        l.y += l.speed;
        l.x += l.drift + Math.sin(l.y * 0.02) * 0.5;
        l.rot += l.rotSpeed;

        if (l.y > canvas.height + 40) {
          leaves.splice(i, 1);
        } else {
          drawLeaf(l);
        }
      }

      animId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="falling-leaves-canvas" aria-hidden="true" />;
}
