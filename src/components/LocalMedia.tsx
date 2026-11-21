import { useEffect, useRef, useState } from 'react';
import type {
  AvatarType,
  ChatFileMedia,
  ChatImageMedia,
  ChatVoiceMedia,
  FileMediaKind,
} from '../types/nightcord';
import { loadLocalMediaBlob } from '../utils/localStorageStore';
import { formatDuration } from '../utils/nightcordState';
import { NightcordAvatar } from './NightcordArt';

export function useLocalMediaUrl(mediaId?: string): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    setUrl(null);
    if (!mediaId) {
      return;
    }
    let active = true;
    let createdUrl: string | null = null;
    loadLocalMediaBlob(mediaId).then((blob) => {
      if (!active) {
        return;
      }
      if (!blob) {
        setUrl(null);
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

export function NightcordFileGlyph({
  kind,
  fileType,
}: {
  kind: FileMediaKind;
  fileType: string;
}) {
  return (
    <svg width="26" height="32" viewBox="0 0 26 32" fill="none" className="shrink-0" aria-hidden="true">
      <path
        d="M3 1.5H17.5L23.5 7.5V29.5C23.5 30.1 23.0 30.5 22.4 30.5H3C2.4 30.5 2 30.1 2 29.5V2.5C2 1.9 2.4 1.5 3 1.5Z"
        stroke="#C2B8D3"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M17.5 1.5V7.5H23.5"
        stroke="#C2B8D3"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {kind === 'video' && (
        <path
          d="M10.2 14.2L17.4 18.6L10.2 23V14.2Z"
          stroke="#C2B8D3"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      )}
      {kind === 'audio' && (
        <g stroke="#C2B8D3" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.2 22.4V13.8L17.4 15.6V17.9L12.2 16.1" />
          <circle cx="10.2" cy="22.4" r="2.1" />
        </g>
      )}
      {kind === 'text' && (
        <g stroke="#C2B8D3" strokeWidth="1.45" strokeLinecap="round">
          <line x1="7.2" y1="14.5" x2="18.6" y2="14.5" />
          <line x1="7.2" y1="18.5" x2="18.6" y2="18.5" />
          <line x1="7.2" y1="22.5" x2="15.2" y2="22.5" />
        </g>
      )}
      {kind === 'image' && (
        <text
          x="12.8"
          y="21.5"
          textAnchor="middle"
          fill="#C2B8D3"
          fontSize="7"
          fontWeight="700"
          fontFamily="Inter, sans-serif"
        >
          {fileType || 'JPG'}
        </text>
      )}
    </svg>
  );
}

interface CharacterAvatarProps {
  avatarType: AvatarType;
  customAvatarMediaId?: string;
  size: number;
  showOnlineDot?: boolean;
  isOnline?: boolean;
  className?: string;
}

export function CharacterAvatar({
  avatarType,
  customAvatarMediaId,
  size,
  showOnlineDot = false,
  isOnline = true,
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
            data-status={isOnline ? 'online' : 'offline'}
            className={`pointer-events-none absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full border-2 border-[#2E243D] transition-colors ${
              isOnline ? 'bg-[#55D8C1]' : 'bg-[#857A99]'
            }`}
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
      isOnline={isOnline}
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

  if (media.displayMode === 'card') {
    const handleDownload = () => {
      if (!url) {
        return;
      }
      const link = document.createElement('a');
      link.href = url;
      link.download = media.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    return (
      <div className="mt-1.5">
        <button
          type="button"
          data-action={`download-local-${media.mediaId}`}
          aria-label={`${media.filename}をダウンロード`}
          onClick={handleDownload}
          className="flex h-[54px] w-full max-w-[310px] cursor-pointer items-center justify-between rounded-[6px] border border-[#61527A] bg-[#524468] px-3.5 text-left transition-all hover:bg-[#5C4D74] active:scale-[0.99]"
        >
          <span className="flex min-w-0 items-center gap-3">
            <NightcordFileGlyph kind="image" fileType={media.fileType || 'JPG'} />
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-[13.5px] leading-[1.25] font-bold text-white">
                {media.filename}
              </span>
              <span className="mt-0.5 text-[10.5px] font-normal text-[#9A90A8]">
                {media.sizeLabel}
              </span>
            </span>
          </span>
          <span className="flex shrink-0 items-center justify-center p-1 text-[#EFEBF5]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M3.5 3.5H12.5L8 9.5L3.5 3.5Z" />
              <rect x="3" y="11" width="10" height="1.7" rx="0.5" />
            </svg>
          </span>
        </button>
      </div>
    );
  }

  if (!url) {
    return (
      <div className="mt-1.5 flex h-[120px] w-full max-w-[260px] items-center justify-center rounded-[8px] border border-[#61527A] bg-[#524468] text-[12px] text-[#B4A9C6]">
        ...
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

interface LocalFileMediaCardProps {
  media: ChatFileMedia;
  onPreviewImage: (url: string, filename: string) => void;
  onPreviewVideo: (url: string, filename: string) => void;
}

export function LocalFileMediaCard({
  media,
  onPreviewImage,
  onPreviewVideo,
}: LocalFileMediaCardProps) {
  const url = useLocalMediaUrl(media.mediaId);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingAudio, setPlayingAudio] = useState(false);

  if (media.kind === 'image' && media.displayMode === 'image') {
    return (
      <LocalImageCard
        media={{
          mediaId: media.mediaId,
          filename: media.filename,
          sizeLabel: media.sizeLabel,
          fileType: media.fileType,
          displayMode: 'image',
        }}
        onPreview={onPreviewImage}
      />
    );
  }

  const triggerDownload = () => {
    if (!url) {
      return;
    }
    const link = document.createElement('a');
    link.href = url;
    link.download = media.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCardClick = () => {
    if (!url) {
      return;
    }
    if (media.kind === 'video') {
      onPreviewVideo(url, media.filename);
      return;
    }
    if (media.kind === 'audio' && audioRef.current) {
      if (playingAudio) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {
          setPlayingAudio(false);
        });
      }
      return;
    }
    triggerDownload();
  };

  return (
    <div className="mt-1.5">
      {media.kind === 'audio' && url && (
        <audio
          ref={audioRef}
          src={url}
          preload="metadata"
          onPlay={() => setPlayingAudio(true)}
          onPause={() => setPlayingAudio(false)}
          onEnded={() => setPlayingAudio(false)}
        />
      )}
      <div className="flex h-[54px] w-full max-w-[310px] items-center justify-between rounded-[6px] border border-[#61527A] bg-[#524468] px-3.5 transition-all hover:bg-[#5C4D74]">
        <button
          type="button"
          data-action={`open-local-file-${media.mediaId}`}
          aria-label={media.filename}
          onClick={handleCardClick}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 bg-transparent text-left"
        >
          <NightcordFileGlyph kind={media.kind} fileType={media.fileType} />
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-[13.5px] leading-[1.25] font-bold text-white">
              {media.filename}
            </span>
            <span className="mt-0.5 flex items-center gap-1.5 text-[10.5px] font-normal text-[#9A90A8]">
              <span>{media.sizeLabel}</span>
              {media.kind === 'audio' && playingAudio && (
                <span className="text-[#64D2E6]">▶</span>
              )}
            </span>
          </span>
        </button>
        <button
          type="button"
          data-action={`download-local-${media.mediaId}`}
          aria-label={`${media.filename}をダウンロード`}
          onClick={triggerDownload}
          className="flex shrink-0 cursor-pointer items-center justify-center rounded p-1 text-[#EFEBF5] hover:bg-[#61527A]"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M3.5 3.5H12.5L8 9.5L3.5 3.5Z" />
            <rect x="3" y="11" width="10" height="1.7" rx="0.5" />
          </svg>
        </button>
      </div>
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
