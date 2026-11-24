import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { UiLanguage } from '../types/nightcord';
import { getUiText } from '../utils/i18n';

interface CopyAiToMainModalProps {
  open: boolean;
  lang: UiLanguage;
  suggestedTitle: string;
  messageCount: number;
  onCancel: () => void;
  onConfirm: (title: string) => void;
}

export function CopyAiToMainModal({
  open,
  lang,
  suggestedTitle,
  messageCount,
  onCancel,
  onConfirm,
}: CopyAiToMainModalProps) {
  const t = getUiText(lang);
  const [title, setTitle] = useState(suggestedTitle);

  useEffect(() => {
    if (open) {
      setTitle(suggestedTitle);
    }
  }, [open, suggestedTitle]);

  if (!open) {
    return null;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleaned = title.trim();
    if (!cleaned) {
      return;
    }
    onConfirm(cleaned);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.copyAiToMainModalTitle}
      data-testid="copy-ai-to-main-modal"
      onClick={onCancel}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4"
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="nc-modal-enter flex max-h-[90dvh] w-full max-w-[420px] flex-col overflow-hidden rounded-[12px] border border-[#524468] bg-[#241C32] shadow-[0_22px_54px_rgba(0,0,0,0.72)]"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#372B4A] bg-[#211A2C] px-5 py-3.5">
          <div className="min-w-0">
            <h2 className="text-[14.5px] font-bold text-[#EFEBF5]">{t.copyAiToMainModalTitle}</h2>
            <p className="mt-1 text-[11.5px] leading-[1.5] text-[#9E93B3]">
              {t.copyAiToMainModalSub}
            </p>
          </div>
          <button
            type="button"
            data-action="copy-ai-main-close"
            aria-label={t.cancel}
            onClick={onCancel}
            className="cursor-pointer rounded px-2 py-0.5 text-[16px] text-[#9A90A8] transition-colors hover:bg-[#382C4B] hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="space-y-3.5 p-4 sm:p-5">
          <div className="flex items-center justify-between rounded-[8px] border border-[#3E3156] bg-[#2C223D] px-3.5 py-2.5 text-[12px] text-[#D6CFE3]">
            <span>{t.copyAiToMainSummary(messageCount)}</span>
            <span className="rounded bg-[#55D8C1]/15 px-2 py-0.5 text-[10.5px] font-semibold text-[#55D8C1]">
              {t.aiReadyBadge}
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11.5px] font-semibold text-[#D6CFE3]">
              {t.copyAiToMainLabel}
            </label>
            <input
              type="text"
              autoFocus
              data-action="copy-ai-main-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.copyAiToMainPlaceholder}
              className="h-[38px] w-full rounded-[7px] border border-[#4D3F66] bg-[#1E1729] px-3 text-[13px] text-[#EFEBF5] placeholder-[#7C7191] outline-none focus:border-[#64D2E6]"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[#372B4A] bg-[#211A2C] px-5 py-3">
          <button
            type="button"
            data-action="copy-ai-main-cancel"
            onClick={onCancel}
            className="h-[34px] cursor-pointer rounded-[7px] bg-[#362B4A] px-3.5 text-[12px] font-medium text-[#DCD7E5] transition-colors hover:bg-[#47395E]"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            data-action="copy-ai-main-confirm"
            className="h-[34px] cursor-pointer rounded-[7px] bg-[#52436B] px-4 text-[12px] font-semibold text-white transition-colors hover:bg-[#645283] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t.copyAiToMainConfirm}
          </button>
        </div>
      </form>
    </div>
  );
}
