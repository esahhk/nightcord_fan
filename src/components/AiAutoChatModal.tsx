import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { AiAutoChatConfig, UiLanguage } from '../types/nightcord';
import { getUiText } from '../utils/i18n';

interface AiAutoChatModalProps {
  open: boolean;
  lang: UiLanguage;
  initialConfig: AiAutoChatConfig;
  readyCount: number;
  totalCount: number;
  onClose: () => void;
  onStart: (config: AiAutoChatConfig) => void;
}

const INTERVAL_PRESETS = [2, 4, 8, 12];

export function AiAutoChatModal({
  open,
  lang,
  initialConfig,
  readyCount,
  totalCount,
  onClose,
  onStart,
}: AiAutoChatModalProps) {
  const t = getUiText(lang);
  const [randomPresence, setRandomPresence] = useState(initialConfig.randomPresence);
  const [intervalSec, setIntervalSec] = useState(initialConfig.intervalSec);

  useEffect(() => {
    if (!open) {
      return;
    }
    setRandomPresence(initialConfig.randomPresence);
    setIntervalSec(initialConfig.intervalSec);
  }, [open, initialConfig]);

  if (!open) {
    return null;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onStart({
      randomPresence,
      intervalSec: Math.min(20, Math.max(2, Math.round(intervalSec))),
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.aiAutoChatModalTitle}
      data-testid="ai-auto-chat-modal"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4"
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="nc-modal-enter flex max-h-[90dvh] w-full max-w-[440px] flex-col overflow-hidden rounded-[12px] border border-[#524468] bg-[#241C32] shadow-[0_22px_54px_rgba(0,0,0,0.72)]"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#372B4A] bg-[#211A2C] px-5 py-3.5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#F6CE71]" />
              <h2 className="text-[14.5px] font-bold text-[#EFEBF5]">{t.aiAutoChatModalTitle}</h2>
            </div>
            <p className="mt-1 text-[11.5px] leading-[1.5] text-[#9E93B3]">
              {t.aiAutoChatModalSub}
            </p>
          </div>
          <button
            type="button"
            data-action="ai-auto-chat-close"
            aria-label={t.cancel}
            onClick={onClose}
            className="cursor-pointer rounded px-2 py-0.5 text-[16px] text-[#9A90A8] transition-colors hover:bg-[#382C4B] hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="nc-scroll min-h-0 flex-1 space-y-4 p-4 sm:p-5">
          <div className="flex items-center justify-between rounded-[8px] border border-[#3E3156] bg-[#2C223D] px-3.5 py-2.5">
            <span className="text-[12px] font-medium text-[#D6CFE3]">
              {t.aiConfiguredCharsCount(readyCount, totalCount)}
            </span>
            <span
              className={`rounded-[5px] px-2 py-0.5 text-[11px] font-semibold ${
                readyCount > 0
                  ? 'bg-[#55D8C1]/15 text-[#55D8C1]'
                  : 'bg-[#3E2A3A] text-[#FFB6C7]'
              }`}
            >
              {readyCount > 0 ? t.aiReadyBadge : t.aiUnconfiguredBadge}
            </span>
          </div>

          <div className="rounded-[9px] border border-[#3E3156] bg-[#2C223D] p-3.5">
            <label className="flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                data-action="ai-auto-random-presence"
                checked={randomPresence}
                onChange={(e) => setRandomPresence(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#F6CE71]"
              />
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] font-semibold text-[#EFEBF5]">
                  {t.aiAutoChatRandomPresenceToggle}
                </div>
                <p className="mt-1 text-[11px] leading-[1.48] text-[#A499B8]">
                  {t.aiAutoChatRandomPresenceDesc}
                </p>
              </div>
            </label>
          </div>

          <div className="space-y-2.5 rounded-[9px] border border-[#3E3156] bg-[#2C223D] p-3.5">
            <div className="flex items-center justify-between text-[12px] font-medium text-[#D6CFE3]">
              <span>{t.aiAutoChatIntervalLabel(intervalSec)}</span>
            </div>
            <input
              type="range"
              min={2}
              max={20}
              step={1}
              data-action="ai-auto-interval-range"
              value={intervalSec}
              onChange={(e) => setIntervalSec(Number(e.target.value))}
              className="w-full cursor-pointer accent-[#F6CE71]"
            />
            <div className="grid grid-cols-4 gap-1.5 pt-0.5">
              {INTERVAL_PRESETS.map((sec) => (
                <button
                  key={sec}
                  type="button"
                  data-action={`ai-auto-interval-preset-${sec}`}
                  onClick={() => setIntervalSec(sec)}
                  className={`cursor-pointer rounded-[6px] border py-1 text-[11.5px] font-medium transition-colors ${
                    intervalSec === sec
                      ? 'border-[#F6CE71] bg-[#3B2E52] text-[#F6CE71]'
                      : 'border-[#46385C] bg-[#241C32] text-[#CFC7DD] hover:bg-[#322745]'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[#372B4A] bg-[#211A2C] px-5 py-3">
          <button
            type="button"
            data-action="ai-auto-chat-cancel"
            onClick={onClose}
            className="h-[34px] cursor-pointer rounded-[7px] bg-[#362B4A] px-3.5 text-[12px] font-medium text-[#DCD7E5] transition-colors hover:bg-[#47395E]"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            data-action="ai-auto-chat-start"
            className="h-[34px] cursor-pointer rounded-[7px] bg-[#5C4B2C] px-4 text-[12px] font-semibold text-[#F6CE71] transition-colors hover:bg-[#705B35] hover:text-white"
          >
            {t.aiAutoChatStartBtn}
          </button>
        </div>
      </form>
    </div>
  );
}
