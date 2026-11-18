import { useEffect, useState } from 'react';
import type { UiLanguage } from '../types/nightcord';
import { getUiText } from '../utils/i18n';
import { WorkChannelIcon } from './NightcordArt';

interface ClearCacheModalProps {
  open: boolean;
  lang: UiLanguage;
  onCancel: () => void;
  onConfirmClear: () => void;
}

export function ClearCacheModal({
  open,
  lang,
  onCancel,
  onConfirmClear,
}: ClearCacheModalProps) {
  const [step, setStep] = useState<1 | 2>(1);

  useEffect(() => {
    if (open) {
      setStep(1);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const t = getUiText(lang);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="clear-cache-modal-title"
      onClick={onCancel}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90dvh] w-full max-w-[390px] flex-col overflow-hidden rounded-[12px] border border-[#524468] bg-[#2E243D] text-[#EFEBF5] shadow-[0_24px_60px_rgba(0,0,0,0.65)]"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#241C30] bg-[#211A2C] px-4 py-3">
          <div className="flex items-center gap-2">
            <WorkChannelIcon size={17} />
            <h2 id="clear-cache-modal-title" className="text-[13.5px] font-bold text-[#EFEBF5]">
              {t.clearModalTitle}
            </h2>
          </div>
          <span
            className={`rounded px-2 py-0.5 text-[11px] font-semibold ${
              step === 2
                ? 'bg-[#4B2538] text-[#FFB6C7]'
                : 'bg-[#362B47] text-[#C2B8D3]'
            }`}
          >
            {step === 1 ? t.clearStep1Badge : t.clearStep2Badge}
          </span>
        </div>

        <div className="nc-scroll flex flex-col gap-3 px-5 py-4">
          <h3
            className={`text-[15px] font-bold ${
              step === 2 ? 'text-[#FFB6C7]' : 'text-white'
            }`}
          >
            {step === 1 ? t.clearStep1Heading : t.clearStep2Heading}
          </h3>
          <p className="text-[13px] leading-[1.6] text-[#DCD7E5]">
            {step === 1 ? t.clearStep1Desc : t.clearStep2Desc}
          </p>
        </div>

        <div className="flex shrink-0 items-center justify-between border-t border-[#241C30] bg-[#261D33] px-4 py-3">
          {step === 1 ? (
            <button
              type="button"
              data-action="clear-cache-cancel"
              onClick={onCancel}
              className="cursor-pointer rounded-[6px] px-3 py-1.5 text-[12.5px] font-medium text-[#9A90A8] hover:text-white"
            >
              {t.cancel}
            </button>
          ) : (
            <button
              type="button"
              data-action="clear-cache-back"
              onClick={() => setStep(1)}
              className="cursor-pointer rounded-[6px] px-3 py-1.5 text-[12.5px] font-medium text-[#C2B8D3] hover:text-white"
            >
              {t.back}
            </button>
          )}

          {step === 1 ? (
            <button
              type="button"
              data-action="clear-cache-step1-next"
              onClick={() => setStep(2)}
              className="cursor-pointer rounded-[6px] border border-[#EB7F97]/60 bg-[#472A3E] px-4 py-1.5 text-[12.5px] font-bold text-[#FFD5DF] transition-colors hover:bg-[#5A324D]"
            >
              {t.clearStep1Next}
            </button>
          ) : (
            <button
              type="button"
              data-action="clear-cache-confirm"
              onClick={onConfirmClear}
              className="cursor-pointer rounded-[6px] bg-[#EB7F97] px-4 py-1.5 text-[12.5px] font-bold text-[#211A2C] transition-colors hover:brightness-110"
            >
              {t.clearStep2Confirm}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
