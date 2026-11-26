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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-3 sm:p-4"
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="nc-modal-enter flex max-h-[90dvh] w-full max-w-[440px] flex-col overflow-hidden rounded-[12px] border border-[#524468] bg-[#2E243D] shadow-[0_24px_60px_rgba(0,0,0,0.68)]"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#241C30] bg-[#211A2C] px-5 py-3.5">
          <div className="min-w-0">
            <h2 className="text-[14.5px] font-bold text-[#EFEBF5]">{t.aiAutoChatModalTitle}</h2>
            <p className="mt-1 text-[11.5px] leading-[1.5] text-[#9A90A8]">
              {t.aiAutoChatModalSub}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 pt-1" aria-hidden="true">
            <span className="h-[9px] w-[9px] rounded-full bg-[#64D2E6]" />
            <span className="h-[9px] w-[9px] rounded-full bg-[#F6CE71]" />
            <span className="h-[9px] w-[9px] rounded-full bg-[#EB7F97]" />
          </div>
        </div>

        <div className="nc-scroll min-h-0 flex-1 space-y-4 p-4 sm:p-5">
          <div className="flex items-center justify-between border-b border-[#3F3352] pb-3 text-[12px]">
            <span className="flex items-center gap-2 text-[#DCD7E5]">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  readyCount > 0 ? 'bg-[#64D2E6]' : 'bg-[#EB7F97]'
                }`}
              />
              <span className="tabular-nums">{t.aiConfiguredCharsCount(readyCount, totalCount)}</span>
            </span>
            <span className={readyCount > 0 ? 'text-[#64D2E6]' : 'text-[#EB7F97]'}>
              {readyCount > 0 ? t.aiReadyBadge : t.aiUnconfiguredBadge}
            </span>
          </div>

          <label className="flex cursor-pointer items-start gap-2.5 border-b border-[#3F3352] pb-4">
            <input
              type="checkbox"
              data-action="ai-auto-random-presence"
              checked={randomPresence}
              onChange={(e) => setRandomPresence(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#64D2E6]"
            />
            <div className="min-w-0 flex-1">
              <div className="text-[12.5px] font-semibold text-[#EFEBF5]">
                {t.aiAutoChatRandomPresenceToggle}
              </div>
              <p className="mt-1 text-[11px] leading-[1.48] text-[#9A90A8]">
                {t.aiAutoChatRandomPresenceDesc}
              </p>
            </div>
          </label>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[12px] font-medium text-[#DCD7E5]">
              <span className="tabular-nums">{t.aiAutoChatIntervalLabel(intervalSec)}</span>
            </div>
            <input
              type="range"
              min={2}
              max={20}
              step={1}
              data-action="ai-auto-interval-range"
              value={intervalSec}
              onChange={(e) => setIntervalSec(Number(e.target.value))}
              className="w-full cursor-pointer accent-[#64D2E6]"
            />
            <div className="grid grid-cols-4 gap-1.5 pt-0.5">
              {INTERVAL_PRESETS.map((sec) => (
                <button
                  key={sec}
                  type="button"
                  data-action={`ai-auto-interval-preset-${sec}`}
                  onClick={() => setIntervalSec(sec)}
                  className={`cursor-pointer rounded-[6px] border py-1.5 text-[11.5px] font-medium tabular-nums transition-colors ${
                    intervalSec === sec
                      ? 'border-[#64D2E6]/75 bg-[#3F3352] text-white'
                      : 'border-[#493B62] bg-[#241C32] text-[#C5BBD6] hover:bg-[#332844] hover:text-white'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[#241C30] bg-[#261D33] px-5 py-3">
          <button
            type="button"
            data-action="ai-auto-chat-cancel"
            onClick={onClose}
            className="h-[34px] cursor-pointer rounded-[6px] border border-[#524468] bg-[#332844] px-3.5 text-[12px] font-medium text-[#DCD7E5] transition-colors hover:bg-[#3F3352] hover:text-white"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            data-action="ai-auto-chat-start"
            className="h-[34px] cursor-pointer rounded-[6px] bg-[#5C4D74] px-4 text-[12px] font-bold text-white transition-colors hover:bg-[#6D5C8A]"
          >
            {t.aiAutoChatStartBtn}
          </button>
        </div>
      </form>
    </div>
  );
}
