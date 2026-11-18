import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type {
  ChatMessage,
  PlaybackConfig,
  PlaybackPacingMode,
  UiLanguage,
} from '../types/nightcord';
import { getUiText } from '../utils/i18n';
import { WorkChannelIcon } from './NightcordArt';

interface PlaybackSetupModalProps {
  open: boolean;
  lang: UiLanguage;
  messages: ChatMessage[];
  onCancel: () => void;
  onStart: (config: PlaybackConfig) => void;
}

function getMessagePreview(msg: ChatMessage): string {
  if (msg.text) {
    const clean = msg.text.replace(/\s+/g, ' ').trim();
    return clean.length > 16 ? `「${clean.slice(0, 16)}…」` : `「${clean}」`;
  }
  if (msg.imageMedia) {
    return `[${msg.imageMedia.filename}]`;
  }
  if (msg.voiceMedia) {
    return '[Voice]';
  }
  if (msg.attachments && msg.attachments.length > 0) {
    return `[${msg.attachments[0].filename}]`;
  }
  return '';
}

export function PlaybackSetupModal({
  open,
  lang,
  messages,
  onCancel,
  onStart,
}: PlaybackSetupModalProps) {
  const [pacingMode, setPacingMode] = useState<PlaybackPacingMode>('timeline');
  const [evenIntervalSec, setEvenIntervalSec] = useState<number>(2.5);
  const [startIndex, setStartIndex] = useState<number>(0);
  const [anchorToToday, setAnchorToToday] = useState<boolean>(true);

  useEffect(() => {
    if (open) {
      setStartIndex((prev) => (prev < messages.length ? prev : 0));
    }
  }, [open, messages.length]);

  if (!open) {
    return null;
  }

  const t = getUiText(lang);
  const hasMessages = messages.length > 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hasMessages) {
      return;
    }
    onStart({
      pacingMode,
      evenIntervalSec: Math.min(40, Math.max(0.5, evenIntervalSec)),
      startIndex: Math.min(Math.max(0, startIndex), Math.max(0, messages.length - 1)),
      anchorToToday,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="playback-modal-title"
      onClick={onCancel}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4"
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="nc-modal-enter flex max-h-[90dvh] w-full max-w-[430px] flex-col overflow-hidden rounded-[12px] border border-[#524468] bg-[#2E243D] text-[#EFEBF5] shadow-[0_24px_60px_rgba(0,0,0,0.65)]"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#241C30] bg-[#211A2C] px-4 py-3">
          <div className="flex items-center gap-2">
            <WorkChannelIcon size={17} />
            <h2 id="playback-modal-title" className="text-[13.5px] font-bold text-[#EFEBF5]">
              {t.playbackModalTitle}
            </h2>
          </div>
          <span className="h-2.5 w-2.5 rounded-full bg-[#EB7F97]" aria-hidden="true" />
        </div>

        <div className="nc-scroll flex flex-col gap-4 p-4">
          <p className="text-[12.5px] leading-[1.55] text-[#C2B8D3]">{t.playbackModalSub}</p>

          {!hasMessages ? (
            <div className="rounded-[8px] border border-[#524468] bg-[#362B47] px-3.5 py-3 text-[12.5px] text-[#FFD5DF]">
              {t.playbackNoMessages}
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <span className="text-[11.5px] font-bold text-[#9A90A8]">
                  {t.playbackPacingLabel}
                </span>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    data-action="playback-pacing-timeline"
                    aria-pressed={pacingMode === 'timeline'}
                    onClick={() => setPacingMode('timeline')}
                    className={`flex cursor-pointer flex-col items-start rounded-[8px] border p-2.5 text-left transition-colors ${
                      pacingMode === 'timeline'
                        ? 'border-[#64D2E6] bg-[#473A5C] text-white'
                        : 'border-[#524468] bg-[#362B47] text-[#DCD7E5] hover:bg-[#3F3352]'
                    }`}
                  >
                    <span className="text-[12.5px] font-bold">{t.playbackTimelineTitle}</span>
                    <span className="mt-1 text-[11px] leading-[1.4] text-[#B4A9C6]">
                      {t.playbackTimelineSub}
                    </span>
                  </button>

                  <button
                    type="button"
                    data-action="playback-pacing-even"
                    aria-pressed={pacingMode === 'even'}
                    onClick={() => setPacingMode('even')}
                    className={`flex cursor-pointer flex-col items-start rounded-[8px] border p-2.5 text-left transition-colors ${
                      pacingMode === 'even'
                        ? 'border-[#64D2E6] bg-[#473A5C] text-white'
                        : 'border-[#524468] bg-[#362B47] text-[#DCD7E5] hover:bg-[#3F3352]'
                    }`}
                  >
                    <span className="text-[12.5px] font-bold">{t.playbackEvenTitle}</span>
                    <span className="mt-1 text-[11px] leading-[1.4] text-[#B4A9C6]">
                      {t.playbackEvenSub}
                    </span>
                  </button>
                </div>

                {pacingMode === 'even' && (
                  <div className="mt-1 flex flex-col gap-1.5 rounded-[8px] border border-[#453859] bg-[#261D33] px-3 py-2.5">
                    <div className="flex items-center justify-between text-[12px] text-[#EFEBF5]">
                      <span>{t.playbackIntervalLabel(evenIntervalSec)}</span>
                      <span className="text-[11px] text-[#9A90A8]">1s – 40s</span>
                    </div>
                    <input
                      type="range"
                      data-action="playback-interval-range"
                      min={1}
                      max={40}
                      step={0.5}
                      value={evenIntervalSec}
                      onChange={(e) => setEvenIntervalSec(Number(e.target.value))}
                      className="w-full cursor-pointer accent-[#64D2E6]"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[11.5px] font-bold text-[#9A90A8]">
                  {t.playbackAnchorLabel}
                </span>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    data-action="playback-anchor-today"
                    aria-pressed={anchorToToday}
                    onClick={() => setAnchorToToday(true)}
                    className={`flex cursor-pointer flex-col items-start rounded-[8px] border p-2.5 text-left transition-colors ${
                      anchorToToday
                        ? 'border-[#64D2E6] bg-[#473A5C] text-white'
                        : 'border-[#524468] bg-[#362B47] text-[#DCD7E5] hover:bg-[#3F3352]'
                    }`}
                  >
                    <span className="text-[12.5px] font-bold">{t.playbackAnchorTodayTitle}</span>
                    <span className="mt-1 text-[11px] leading-[1.4] text-[#B4A9C6]">
                      {t.playbackAnchorTodaySub}
                    </span>
                  </button>

                  <button
                    type="button"
                    data-action="playback-anchor-flow"
                    aria-pressed={!anchorToToday}
                    onClick={() => setAnchorToToday(false)}
                    className={`flex cursor-pointer flex-col items-start rounded-[8px] border p-2.5 text-left transition-colors ${
                      !anchorToToday
                        ? 'border-[#64D2E6] bg-[#473A5C] text-white'
                        : 'border-[#524468] bg-[#362B47] text-[#DCD7E5] hover:bg-[#3F3352]'
                    }`}
                  >
                    <span className="text-[12.5px] font-bold">{t.playbackAnchorFlowTitle}</span>
                    <span className="mt-1 text-[11px] leading-[1.4] text-[#B4A9C6]">
                      {t.playbackAnchorFlowSub}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="playback-start-select"
                  className="text-[11.5px] font-bold text-[#9A90A8]"
                >
                  {t.playbackStartLabel}
                </label>
                <select
                  id="playback-start-select"
                  data-action="playback-start-select"
                  value={startIndex}
                  onChange={(e) => setStartIndex(Number(e.target.value))}
                  className="w-full cursor-pointer rounded-[6px] border border-[#453859] bg-[#332844] px-3 py-2 text-[12.5px] text-[#EFEBF5] outline-none focus:border-[#64D2E6]"
                >
                  <option value={0}>{t.playbackStartEmpty}</option>
                  {messages.slice(1).map((msg, offset) => {
                    const idx = offset + 1;
                    return (
                      <option key={msg.id} value={idx}>
                        {t.playbackStartFromMsg(
                          idx + 1,
                          msg.username,
                          msg.timestamp,
                          getMessagePreview(msg)
                        )}
                      </option>
                    );
                  })}
                </select>
              </div>

              <p className="text-[11px] leading-[1.5] text-[#9A90A8]">{t.playbackCapNote}</p>
            </>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[#241C30] bg-[#261D33] px-4 py-3">
          <button
            type="button"
            data-action="playback-cancel"
            onClick={onCancel}
            className="cursor-pointer rounded-[6px] px-3.5 py-1.5 text-[12.5px] font-medium text-[#9A90A8] transition-colors hover:text-white"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            data-action="playback-start"
            disabled={!hasMessages}
            className={`rounded-[6px] px-4 py-1.5 text-[12.5px] font-bold transition-colors ${
              hasMessages
                ? 'cursor-pointer bg-[#EB7F97] text-[#211A2C] hover:brightness-110'
                : 'cursor-not-allowed bg-[#453859] text-[#857A99]'
            }`}
          >
            {t.playbackStartBtn}
          </button>
        </div>
      </form>
    </div>
  );
}
