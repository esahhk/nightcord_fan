import { useEffect, useRef, useState } from 'react';
import type { AvatarType, ChatImageMedia, ChatVoiceMedia } from '../types/nightcord';
import { loadLocalMediaBlob } from '../utils/localStorageStore';
import { formatDuration } from '../utils/nightcordState';
import { NightcordAvatar } from './NightcordArt';

export function useLocalMediaUrl(mediaId?: string): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!mediaId) {
      setUrl(null);
      return;
    }
    let active = true;
    let createdUrl: string | null = null;
    loadLocalMediaBlob(mediaId).then((blob) => {
      if (!active || !blob) {
        return;
      }
      createdUrl = URL.createObjectURL(blob);
      setUrl(createdUrl);
    });
    return () => {
      active = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [mediaId]);

  return url;
}

interface CharacterAvatarProps {
  avatarType: AvatarType;
  customAvatarMediaId?: string;
  size: number;
  showOnlineDot?: boolean;
  className?: string;
}

export function CharacterAvatar({
  avatarType,
  customAvatarMediaId,
  size,
  showOnlineDot = false,
  className = '',
}: CharacterAvatarProps) {
  const customUrl = useLocalMediaUrl(customAvatarMediaId);

  if (customUrl) {
    return (
      <span
        className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <img
          src={customUrl}
          alt=""
          className="h-full w-full rounded-full object-cover"
        />
        {showOnlineDot && (
          <span
            className="pointer-events-none absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full border-2 border-[#2E243D] bg-[#55D8C1]"
            aria-hidden="true"
          />
        )}
      </span>
    );
  }

  return (
    <NightcordAvatar
      type={avatarType}
      size={size}
      showOnlineDot={showOnlineDot}
      className={className}
    />
  );
}

interface LocalImageCardProps {
  media: ChatImageMedia;
  onPreview: (url: string, filename: string) => void;
}

export function LocalImageCard({ media, onPreview }: LocalImageCardProps) {
  const url = useLocalMediaUrl(media.mediaId);

  if (!url) {
    return (
      <div className="mt-1.5 flex h-[120px] w-full max-w-[260px] items-center justify-center rounded-[8px] border border-[#61527A] bg-[#524468] text-[12px] text-[#B4A9C6]">
        ローカル画像を読み込み中...
      </div>
    );
  }

  return (
    <div className="mt-1.5">
      <button
        type="button"
        data-action={`preview-image-${media.mediaId}`}
        aria-label={`${media.filename}を拡大表示`}
        onClick={() => onPreview(url, media.filename)}
        className="group block max-w-[280px] cursor-pointer overflow-hidden rounded-[8px] border border-[#61527A] bg-[#2E243D] text-left transition-colors hover:border-[#8473A3]"
      >
        <img
          src={url}
          alt={media.filename}
          className="max-h-[220px] w-full object-cover transition-transform duration-150 group-hover:scale-[1.01]"
        />
        <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 text-[11px] text-[#C2B8D3]">
          <span className="truncate font-medium">{media.filename}</span>
          <span className="shrink-0 text-[10px] text-[#9A90A8]">{media.sizeLabel}</span>
        </div>
      </button>
    </div>
  );
}

interface LocalVoicePlayerProps {
  media: ChatVoiceMedia;
}

export function LocalVoicePlayer({ media }: LocalVoicePlayerProps) {
  const url = useLocalMediaUrl(media.mediaId);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(media.durationSec || 0);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !url) {
      return;
    }
    if (playing) {
      audio.pause();
    } else {
      audio.play().catch(() => {
        setPlaying(false);
      });
    }
  };

  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="mt-1.5 flex h-[50px] w-full max-w-[270px] items-center gap-3 rounded-[8px] border border-[#61527A] bg-[#524468] px-3">
      {url && (
        <audio
          ref={audioRef}
          src={url}
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => {
            setPlaying(false);
            setCurrentTime(0);
          }}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => {
            if (Number.isFinite(e.currentTarget.duration) && e.currentTarget.duration > 0) {
              setDuration(e.currentTarget.duration);
            }
          }}
        />
      )}
      <button
        type="button"
        data-action={`play-voice-${media.mediaId}`}
        aria-label={playing ? 'ボイスメッセージを一時停止' : 'ボイスメッセージを再生'}
        onClick={togglePlay}
        disabled={!url}
        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#332844] text-[#EFEBF5] transition-colors hover:bg-[#473A5C] disabled:opacity-50"
      >
        {playing ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
            <rect x="2" y="1.5" width="3" height="9" rx="0.8" />
            <rect x="7" y="1.5" width="3" height="9" rx="0.8" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
            <path d="M2.5 1.5L10.5 6L2.5 10.5V1.5Z" />
          </svg>
        )}
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#332844]">
          <div
            className="h-full rounded-full bg-[#EFEBF5] transition-[width] duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10.5px] text-[#C2B8D3]">
          <span className="truncate">ボイスメッセージ</span>
          <span className="shrink-0 tabular-nums">
            {formatDuration(playing ? currentTime : duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
