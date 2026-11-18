import { useEffect, useId, useRef, useState } from 'react';
import type { AvatarType } from '../types/nightcord';
import { drawAvatarByType, drawWorkIcon } from '../utils/canvasArt';

interface WorkIconProps {
  size?: number;
  className?: string;
}

export function WorkChannelIcon({ size = 20, className = '' }: WorkIconProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setCanvasReady(false);
        return;
      }
      const dpr = Math.max(2, window.devicePixelRatio || 2);
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawWorkIcon(ctx, size);
      setCanvasReady(true);
    } catch {
      setCanvasReady(false);
    }
  }, [size]);

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      data-testid="work-channel-icon"
    >
      <canvas
        ref={canvasRef}
        className={`block h-full w-full ${canvasReady ? 'opacity-100' : 'opacity-0'}`}
        aria-hidden="true"
      />
      {!canvasReady && (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          className="absolute inset-0 block h-full w-full"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M 50 7 A 43 43 0 1 0 50 93 A 43 43 0 1 0 50 7 Z M 58.8 17.5 A 32.5 32.5 0 1 1 58.8 82.5 A 32.5 32.5 0 1 1 58.8 17.5 Z"
            fill="#FFFFFF"
          />
          <circle cx="48.3" cy="50" r="5.6" fill="#FFFFFF" />
          <circle cx="69.3" cy="50" r="5.6" fill="#FFFFFF" />
        </svg>
      )}
    </span>
  );
}

interface NightcordAvatarProps {
  type: AvatarType;
  size: number;
  showOnlineDot?: boolean;
  className?: string;
}

export function NightcordAvatar({
  type,
  size,
  showOnlineDot = false,
  className = '',
}: NightcordAvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const clipId = useId();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setCanvasReady(false);
        return;
      }
      const dpr = Math.max(2, window.devicePixelRatio || 2);
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawAvatarByType(ctx, type, size);
      setCanvasReady(true);
    } catch {
      setCanvasReady(false);
    }
  }, [type, size]);

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      data-testid={`avatar-${type}`}
    >
      <span className="relative block h-full w-full overflow-hidden rounded-full">
        <canvas
          ref={canvasRef}
          className={`block h-full w-full ${canvasReady ? 'opacity-100' : 'opacity-0'}`}
          aria-hidden="true"
        />
        {!canvasReady && (
          <FallbackAvatarSvg type={type} clipId={clipId} />
        )}
      </span>
      {showOnlineDot && (
        <span
          className="pointer-events-none absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full border-2 border-[#2E243D] bg-[#55D8C1]"
          aria-hidden="true"
        />
      )}
    </span>
  );
}

function FallbackAvatarSvg({ type, clipId }: { type: AvatarType; clipId: string }) {
  if (type === 'k' || type === 'k-pink') {
    const bg = type === 'k-pink' ? '#C65886' : '#8E4390';
    return (
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full" aria-hidden="true">
        <circle cx="50" cy="50" r="50" fill={bg} />
        <path
          fillRule="evenodd"
          d="M 50 15.5 A 34.5 34.5 0 1 0 50 84.5 A 34.5 34.5 0 1 0 50 15.5 Z M 57.2 24.2 A 25.8 25.8 0 1 1 57.2 75.8 A 25.8 25.8 0 1 1 57.2 24.2 Z"
          fill="#FFFFFF"
        />
        <circle cx="48.4" cy="50" r="4.4" fill="#FFFFFF" />
        <circle cx="66" cy="50" r="4.4" fill="#FFFFFF" />
      </svg>
    );
  }

  if (type === 'yuki') {
    return (
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full" aria-hidden="true">
        <circle cx="50" cy="50" r="50" fill="#8381C4" />
        <g stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <circle cx="50" cy="50" r="5.6" />
          {[0, 60, 120].map((angle) => (
            <g key={angle} transform={`rotate(${angle} 50 50)`}>
              <line x1="50" y1="15.5" x2="50" y2="84.5" />
              <polyline points="42.5,24 50,31.5 57.5,24" />
              <polyline points="44.8,33 50,38.2 55.2,33" />
              <polyline points="42.5,76 50,68.5 57.5,76" />
              <polyline points="44.8,67 50,61.8 55.2,67" />
            </g>
          ))}
        </g>
      </svg>
    );
  }

  if (type === 'amia') {
    return (
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full" aria-hidden="true">
        <circle cx="50" cy="50" r="50" fill="#9CD5EB" />
        <circle cx="50" cy="50" r="41" fill="#F5B8D2" />
        <circle cx="50" cy="50" r="37" fill="none" stroke="#E699B9" strokeWidth="5" strokeDasharray="4 4" />
        <circle cx="50" cy="50" r="29.5" fill="#FFFFFF" />
        <circle cx="50" cy="50" r="27" fill="none" stroke="#E8A8C4" strokeWidth="1.5" strokeDasharray="2.5 2.2" />
        <path
          d="M 32 62.5 C 34.5 63.5, 38 61.5, 41.5 54 L 54 31.5 C 55 29.8, 56.2 30, 56 32.2 L 54.5 60 C 54.3 62.5, 56.2 63.5, 58.8 62.2 M 38.8 51.5 Q 49 49.8 59.8 50.8"
          fill="none"
          stroke="#6D5B7B"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 34.2 43.5 C 32.2 38.5, 37.2 33, 45.2 34.8"
          fill="none"
          stroke="#6D5B7B"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full" aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <circle cx="50" cy="50" r="50" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect width="100" height="100" fill="#B8DFF2" />
        <ellipse cx="42" cy="16" rx="44" ry="18" fill="#FFFFFF" />
        <polygon points="64,14 100,8 100,52 68,54" fill="#8F9AA8" />
        <polygon points="70,52 100,48 100,84 64,86" fill="#D4DA74" />
        <polygon points="0,72 36,70 36,100 0,100" fill="#A8BCD0" />
        <path d="M 8 94 C 10 62, 18 22, 42 13 Q 52 10 64 16 C 84 26, 90 58, 94 86 L 78 100 L 22 100 Z" fill="#DDD9E7" />
        <polygon points="33,100 40,63 60,63 68,100" fill="#7E8FA3" />
        <rect x="46" y="53" width="8" height="12" fill="#9D99A8" />
        <path d="M 41 37 C 41 48, 45 56, 50 56.5 C 55 56, 59 48, 59 37 C 59 29, 55 26, 50 26 C 45 26, 41 29, 41 37 Z" fill="#C4C0CC" />
        <ellipse cx="46.2" cy="42.5" rx="1.8" ry="2.2" fill="#625D6E" />
        <ellipse cx="53.8" cy="42.5" rx="1.8" ry="2.2" fill="#625D6E" />
        <path d="M 48 14 Q 30 24 20 46 Q 14 66 9 82 Q 20 72 28 52 Q 36 32 48 22 Z" fill="#FFFFFF" stroke="#9D97AC" strokeWidth="1.5" />
        <path d="M 47 19 Q 36 36 28 62 Q 23 82 20 98 Q 31 84 36 64 Q 41 42 47 27 Z" fill="#FFFFFF" stroke="#8E889E" strokeWidth="1.5" />
        <path d="M 52 14 Q 70 24 80 46 Q 87 66 92 82 Q 80 72 72 52 Q 64 32 52 22 Z" fill="#FFFFFF" stroke="#9D97AC" strokeWidth="1.5" />
        <path d="M 53 19 Q 64 36 72 62 Q 78 82 84 94 Q 71 82 64 62 Q 59 42 53 27 Z" fill="#FFFFFF" stroke="#8E889E" strokeWidth="1.5" />
        <ellipse cx="84" cy="76" rx="5.5" ry="3.2" fill="#F4C6DA" opacity="0.8" />
      </g>
    </svg>
  );
}
