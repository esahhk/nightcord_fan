import { useEffect, useState } from 'react';
import type { UiLanguage } from '../types/nightcord';
import { getUiText } from '../utils/i18n';
import { WorkChannelIcon } from './NightcordArt';

interface AiOnboardingModalProps {
  open: boolean;
  lang: UiLanguage;
  onComplete: () => void;
  onOpenGlobalSettings: () => void;
}

export function AiOnboardingModal({
  open,
  lang,
  onComplete,
  onOpenGlobalSettings,
}: AiOnboardingModalProps) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (open) {
      setStepIndex(0);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const t = getUiText(lang);
  const steps = [
    {
      badge: t.aiGuideBadges[0],
      title: t.aiGuideStep1Title,
      description: t.aiGuideStep1Desc,
      note: t.aiGuideStep1Note,
      visual: 'entry' as const,
    },
    {
      badge: t.aiGuideBadges[1],
      title: t.aiGuideStep2Title,
      description: t.aiGuideStep2Desc,
      note: '',
      visual: 'member' as const,
    },
    {
      badge: t.aiGuideBadges[2],
      title: t.aiGuideStep3Title,
      description: t.aiGuideStep3Desc,
      note: '',
      visual: 'global' as const,
    },
    {
      badge: t.aiGuideBadges[3],
      title: t.aiGuideStep4Title,
      description: t.aiGuideStep4Desc,
      note: '',
      visual: 'chat' as const,
    },
  ];

  const current = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-onboarding-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4"
    >
      <div className="nc-modal-enter flex max-h-[90dvh] w-full max-w-[440px] flex-col overflow-hidden rounded-[12px] border border-[#524468] bg-[#2E243D] text-[#EFEBF5] shadow-[0_24px_60px_rgba(0,0,0,0.68)]">
        <div className="flex shrink-0 items-center justify-between border-b border-[#241C30] bg-[#211A2C] px-4 py-3">
          <div className="flex items-center gap-2">
            <WorkChannelIcon size={18} />
            <span className="text-[13px] font-bold tracking-wide text-[#EFEBF5]">
              {t.aiGuideTitle}
            </span>
          </div>
          <span className="rounded bg-[#3F3352] px-2 py-0.5 text-[11px] font-semibold text-[#64D2E6]">
            {current.badge}
          </span>
        </div>

        <div className="nc-scroll px-5 py-5">
          <div className="mb-4 flex min-h-[82px] items-center justify-center rounded-[8px] border border-[#453859] bg-[#3F3352] px-4 py-3">
            {current.visual === 'entry' && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <div className="flex items-center gap-2 rounded-[6px] border border-[#524468] bg-[#2E243D] px-3 py-1.5 text-[12px] font-bold text-[#EFEBF5]">
                  <span>25時、ナイトコードで。</span>
                  <span className="text-[#64D2E6]">▾</span>
                </div>
                <span className="text-[#9A90A8]">→</span>
                <div className="flex items-center gap-1.5 rounded-[6px] border border-[#64D2E6]/60 bg-[#241C32] px-3 py-1.5 text-[12px] font-semibold text-white">
                  <span className="h-2 w-2 rounded-full bg-[#64D2E6]" />
                  <span>{t.aiModeBtn}</span>
                </div>
              </div>
            )}

            {current.visual === 'member' && (
              <div className="flex w-full items-center justify-between gap-2 rounded-[7px] border border-[#524468] bg-[#241C32] px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-[#9D97AC]" />
                  <span className="text-[12.5px] font-semibold text-[#EFEBF5]">えななん</span>
                </div>
                <span className="rounded-[5px] bg-[#362B4A] px-2.5 py-1 text-[11px] font-semibold text-[#64D2E6]">
                  {t.aiCharSettingsBtn}
                </span>
              </div>
            )}

            {current.visual === 'global' && (
              <div className="flex items-center gap-3">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#64D2E6] ring-4 ring-[#64D2E6]/25" />
                <span className="h-3.5 w-3.5 rounded-full bg-[#F6CE71]/40" />
                <span className="h-3.5 w-3.5 rounded-full bg-[#EB7F97]/40" />
                <span className="ml-1.5 text-[12px] font-semibold text-[#EFEBF5]">
                  {t.aiGlobalModalTitle}
                </span>
              </div>
            )}

            {current.visual === 'chat' && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="rounded-[6px] border border-[#524468] bg-[#211A2C] px-2.5 py-1 text-[11.5px] font-semibold text-[#64D2E6]">
                  @えななん
                </span>
                <span className="rounded-[6px] border border-[#524468] bg-[#211A2C] px-2.5 py-1 text-[11.5px] font-medium text-[#64D2E6]">
                  {t.regenerateMessageBtn}
                </span>
                <span className="rounded-[6px] border border-[#524468] bg-[#211A2C] px-2.5 py-1 text-[11.5px] font-medium text-[#DCD7E5]">
                  {t.editMessageBtn}
                </span>
                <span className="rounded-[6px] border border-[#524468] bg-[#211A2C] px-2.5 py-1 text-[11.5px] font-medium text-[#FFB6C7]">
                  {t.deleteMessageBtn}
                </span>
              </div>
            )}
          </div>

          <h2 id="ai-onboarding-title" className="mb-2 text-[15.5px] font-bold text-white">
            {current.title}
          </h2>
          <p className="text-[13px] leading-[1.65] text-[#DCD7E5]">{current.description}</p>
          {current.note && (
            <p className="mt-2 text-[11.5px] leading-[1.5] text-[#9A90A8]">{current.note}</p>
          )}

          {isLast && (
            <div className="mt-3.5">
              <button
                type="button"
                data-action="ai-onboarding-open-settings"
                onClick={() => {
                  onComplete();
                  onOpenGlobalSettings();
                }}
                className="flex h-[34px] w-full cursor-pointer items-center justify-center gap-2 rounded-[7px] border border-[#64D2E6]/50 bg-[#241C32] px-3 text-[12px] font-semibold text-[#64D2E6] transition-colors hover:border-[#64D2E6] hover:bg-[#342947] hover:text-white"
              >
                <span className="h-2 w-2 rounded-full bg-[#64D2E6]" />
                <span>{t.aiGuideOpenConfigBtn}</span>
              </button>
            </div>
          )}

          <div className="mt-5 flex items-center justify-center gap-1.5">
            {steps.map((step, idx) => (
              <span
                key={step.badge}
                className={`h-1.5 rounded-full transition-all ${
                  idx === stepIndex ? 'w-5 bg-[#64D2E6]' : 'w-1.5 bg-[#524468]'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between border-t border-[#241C30] bg-[#261D33] px-4 py-3">
          <button
            type="button"
            data-action="ai-onboarding-skip"
            onClick={onComplete}
            className="cursor-pointer rounded px-2.5 py-1.5 text-[12px] font-medium text-[#9A90A8] transition-colors hover:text-[#EFEBF5]"
          >
            {t.skip}
          </button>
          <div className="flex items-center gap-2">
            {stepIndex > 0 && (
              <button
                type="button"
                data-action="ai-onboarding-prev"
                onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))}
                className="cursor-pointer rounded-[6px] border border-[#524468] bg-[#332844] px-3 py-1.5 text-[12.5px] font-medium text-[#DCD7E5] transition-colors hover:bg-[#3F3352]"
              >
                {t.back}
              </button>
            )}
            <button
              type="button"
              data-action={isLast ? 'ai-onboarding-finish' : 'ai-onboarding-next'}
              onClick={() => {
                if (isLast) {
                  onComplete();
                } else {
                  setStepIndex((prev) => prev + 1);
                }
              }}
              className="cursor-pointer rounded-[6px] bg-[#5C4D74] px-4 py-1.5 text-[12.5px] font-bold text-white transition-colors hover:bg-[#6D5C8A]"
            >
              {isLast ? t.start : t.next}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
