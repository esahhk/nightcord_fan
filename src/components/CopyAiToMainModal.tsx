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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-3 sm:p-4"
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="nc-modal-enter flex max-h-[90dvh] w-full max-w-[420px] flex-col overflow-hidden rounded-[12px] border border-[#524468] bg-[#2E243D] shadow-[0_24px_60px_rgba(0,0,0,0.68)]"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#241C30] bg-[#211A2C] px-5 py-3.5">
          <div className="min-w-0">
            <h2 className="text-[14.5px] font-bold text-[#EFEBF5]">{t.copyAiToMainModalTitle}</h2>
            <p className="mt-1 text-[11.5px] leading-[1.5] text-[#9A90A8]">
              {t.copyAiToMainModalSub}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 pt-1" aria-hidden="true">
            <span className="h-[9px] w-[9px] rounded-full bg-[#64D2E6]" />
            <span className="h-[9px] w-[9px] rounded-full bg-[#F6CE71]" />
            <span className="h-[9px] w-[9px] rounded-full bg-[#EB7F97]" />
          </div>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <div className="flex items-center gap-2 rounded-[7px] border border-[#453859] bg-[#241C32] px-3.5 py-2.5 text-[12px] text-[#DCD7E5]">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#64D2E6]" />
            <span className="tabular-nums">{t.copyAiToMainSummary(messageCount)}</span>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11.5px] font-medium text-[#C5BBD6]">
              {t.copyAiToMainLabel}
            </label>
            <input
              type="text"
              autoFocus
              data-action="copy-ai-main-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.copyAiToMainPlaceholder}
              className="h-[38px] w-full rounded-[6px] border border-[#493B62] bg-[#241C32] px-3 text-[13px] text-[#EFEBF5] placeholder-[#7C7191] outline-none focus:border-[#64D2E6]"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[#241C30] bg-[#261D33] px-5 py-3">
          <button
            type="button"
            data-action="copy-ai-main-cancel"
            onClick={onCancel}
            className="h-[34px] cursor-pointer rounded-[6px] border border-[#524468] bg-[#332844] px-3.5 text-[12px] font-medium text-[#DCD7E5] transition-colors hover:bg-[#3F3352] hover:text-white"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            data-action="copy-ai-main-confirm"
            className="h-[34px] cursor-pointer rounded-[6px] bg-[#5C4D74] px-4 text-[12px] font-bold text-white transition-colors hover:bg-[#6D5C8A] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t.copyAiToMainConfirm}
          </button>
        </div>
      </form>
    </div>
  );
}
