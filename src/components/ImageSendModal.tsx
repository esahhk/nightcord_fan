import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { FileMediaKind, UiLanguage } from '../types/nightcord';
import { getUiText } from '../utils/i18n';
import { detectFileMediaKind, formatNightcordFileMeta } from '../utils/nightcordState';
import { NightcordFileGlyph } from './LocalMedia';
import { WorkChannelIcon } from './NightcordArt';

interface ImageSendModalProps {
  file: File | null;
  forcedKind?: FileMediaKind;
  lang: UiLanguage;
  onCancel: () => void;
  onConfirm: (options: {
    file: File;
    filename: string;
    kind: FileMediaKind;
    displayMode: 'card' | 'image';
  }) => void;
}

export function ImageSendModal({
  file,
  forcedKind,
  lang,
  onCancel,
  onConfirm,
}: ImageSendModalProps) {
  const [displayMode, setDisplayMode] = useState<'card' | 'image'>('card');
  const [filename, setFilename] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    setFilename(file.name || 'file');
    setDisplayMode('card');
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  if (!file) {
    return null;
  }

  const t = getUiText(lang);
  const safeName = filename.trim() || file.name || 'file';
  const kind = forcedKind ?? detectFileMediaKind(safeName, file.type);
  const { sizeLabel, fileType } = formatNightcordFileMeta(file.size, safeName, kind);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onConfirm({
      file,
      filename: safeName,
      kind,
      displayMode: kind === 'image' ? displayMode : 'card',
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-send-modal-title"
      onClick={onCancel}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4"
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="nc-modal-enter flex max-h-[90dvh] w-full max-w-[400px] flex-col overflow-hidden rounded-[12px] border border-[#524468] bg-[#2E243D] text-[#EFEBF5] shadow-[0_24px_60px_rgba(0,0,0,0.65)]"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#241C30] bg-[#211A2C] px-4 py-3">
          <div className="flex items-center gap-2">
            <WorkChannelIcon size={17} />
            <h2 id="image-send-modal-title" className="text-[13.5px] font-bold text-[#EFEBF5]">
              {kind === 'image' ? t.imageModalTitle : t.fileModalTitle}
            </h2>
          </div>
          <button
            type="button"
            aria-label={t.cancel}
            onClick={onCancel}
            className="cursor-pointer rounded px-2 py-0.5 text-[#9A90A8] hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="nc-scroll flex flex-col gap-3.5 p-4">
          <div className="flex items-center justify-center rounded-[8px] border border-[#453859] bg-[#3F3352] p-3">
            {kind === 'image' && displayMode === 'image' ? (
              previewUrl && (
                <img
                  src={previewUrl}
                  alt={safeName}
                  className="max-h-[160px] max-w-full rounded-[6px] border border-[#61527A] object-contain"
                />
              )
            ) : (
              <div className="flex h-[54px] w-full max-w-[290px] items-center justify-between rounded-[6px] border border-[#61527A] bg-[#524468] px-3.5">
                <span className="flex min-w-0 items-center gap-3">
                  <NightcordFileGlyph kind={kind} fileType={fileType} />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-[13.5px] leading-[1.25] font-bold text-white">
                      {safeName}
                    </span>
                    <span className="mt-0.5 text-[10.5px] font-normal text-[#9A90A8]">
                      {sizeLabel}
                    </span>
                  </span>
                </span>
                <span className="flex shrink-0 items-center justify-center p-1 text-[#EFEBF5]">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="M3.5 3.5H12.5L8 9.5L3.5 3.5Z" />
                    <rect x="3" y="11" width="10" height="1.7" rx="0.5" />
                  </svg>
                </span>
              </div>
            )}
          </div>

          {kind === 'image' && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11.5px] font-bold text-[#9A90A8]">{t.imageModeLabel}</span>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  data-action="image-mode-card"
                  aria-pressed={displayMode === 'card'}
                  onClick={() => setDisplayMode('card')}
                  className={`flex cursor-pointer flex-col items-start rounded-[8px] border p-2.5 text-left transition-colors ${
                    displayMode === 'card'
                      ? 'border-[#64D2E6] bg-[#473A5C] text-white'
                      : 'border-[#524468] bg-[#362B47] text-[#DCD7E5] hover:bg-[#3F3352]'
                  }`}
                >
                  <span className="text-[12.5px] font-bold">{t.imageModeCard}</span>
                  <span className="mt-0.5 text-[11px] leading-[1.4] text-[#B4A9C6]">
                    {t.imageModeCardSub}
                  </span>
                </button>
                <button
                  type="button"
                  data-action="image-mode-full"
                  aria-pressed={displayMode === 'image'}
                  onClick={() => setDisplayMode('image')}
                  className={`flex cursor-pointer flex-col items-start rounded-[8px] border p-2.5 text-left transition-colors ${
                    displayMode === 'image'
                      ? 'border-[#64D2E6] bg-[#473A5C] text-white'
                      : 'border-[#524468] bg-[#362B47] text-[#DCD7E5] hover:bg-[#3F3352]'
                  }`}
                >
                  <span className="text-[12.5px] font-bold">{t.imageModeFull}</span>
                  <span className="mt-0.5 text-[11px] leading-[1.4] text-[#B4A9C6]">
                    {t.imageModeFullSub}
                  </span>
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="image-send-filename" className="text-[11.5px] font-bold text-[#9A90A8]">
              {t.imageFilenameLabel}
            </label>
            <input
              id="image-send-filename"
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder={t.imageFilenamePlaceholder}
              className="w-full rounded-[6px] border border-[#453859] bg-[#332844] px-3 py-2 text-[13px] text-[#EFEBF5] outline-none placeholder:text-[#857A99] focus:border-[#64D2E6]"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[#241C30] bg-[#261D33] px-4 py-3">
          <button
            type="button"
            data-action="image-send-cancel"
            onClick={onCancel}
            className="cursor-pointer rounded-[6px] px-3 py-1.5 text-[12.5px] font-medium text-[#9A90A8] hover:text-white"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            data-action="image-send-confirm"
            className="cursor-pointer rounded-[6px] bg-[#5C4D74] px-4 py-1.5 text-[12.5px] font-bold text-white transition-colors hover:bg-[#6D5C8A]"
          >
            {t.send}
          </button>
        </div>
      </form>
    </div>
  );
}
