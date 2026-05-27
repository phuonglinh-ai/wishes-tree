'use client';

import { useEffect, useRef, useState } from 'react';

export default function BackgroundMusic() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Loads local bg-music.mp3 from the public/ folder
    // You can replace the file in public/bg-music.mp3 with your own music!
    //const audio = new Audio('/bg-music.mp3');
    const audio = new Audio('https://www.no-copyright-music.com/wp-content/uploads/2021/09/01-Amazing-Full-Track-1.mp3');
    audio.loop = true;
    audio.volume = 0.25;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().catch(() => { });
      setPlaying(true);
    }
  };

  return (
    <button
      className={`music-btn ${playing ? 'playing' : ''}`}
      onClick={toggle}
      aria-label={playing ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
      title={playing ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
      id="music-toggle-btn"
    >
      {playing ? (
        /* Speaker with waves */
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      ) : (
        /* Speaker muted */
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      )}
    </button>
  );
}
