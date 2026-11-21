import { useEffect, useState } from 'react';
import type { UiLanguage } from '../types/nightcord';
import { getUiText } from '../utils/i18n';
import { WorkChannelIcon } from './NightcordArt';

interface OnboardingModalProps {
  open: boolean;
  lang: UiLanguage;
  onSelectLanguage: (lang: UiLanguage) => void;
  onComplete: () => void;
}

export function OnboardingModal({
  open,
  lang,
  onSelectLanguage,
  onComplete,
}: OnboardingModalProps) {
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
      badge: t.stepBadges[0],
      title: t.step1Title,
      description: t.step1Desc,
      note: t.step1Note,
      visual: 'language' as const,
    },
    {
      badge: t.stepBadges[1],
      title: t.step2Title,
      description: t.step2Desc,
      note: '',
      visual: 'dropdown' as const,
    },
    {
      badge: t.stepBadges[2],
      title: t.step3Title,
      description: t.step3Desc,
      note: '',
      visual: 'studio' as const,
    },
    {
      badge: t.stepBadges[3],
      title: t.step4Title,
      description: t.step4Desc,
      note: '',
      visual: 'immersive' as const,
    },
    {
      badge: t.stepBadges[4],
      title: t.step5Title,
      description: t.step5Desc,
      note: '',
      visual: 'playback' as const,
    },
  ];

  const current = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4"
    >
      <div className="flex max-h-[90dvh] w-full max-w-[430px] flex-col overflow-hidden rounded-[12px] border border-[#524468] bg-[#2E243D] text-[#EFEBF5] shadow-[0_24px_60px_rgba(0,0,0,0.65)]">
        <div className="flex shrink-0 items-center justify-between border-b border-[#241C30] bg-[#211A2C] px-4 py-3">
          <div className="flex items-center gap-2">
            <WorkChannelIcon size={18} />
            <span className="text-[13px] font-bold tracking-wide text-[#EFEBF5]">
              {t.guideTitle}
            </span>
          </div>
          <span className="rounded bg-[#3F3352] px-2 py-0.5 text-[11px] font-semibold text-[#C2B8D3]">
            {current.badge}
          </span>
        </div>

        <div className="nc-scroll px-5 py-5">
          <div className="mb-4 flex min-h-[78px] items-center justify-center rounded-[8px] border border-[#453859] bg-[#3F3352] px-4 py-3">
            {current.visual === 'language' && (
              <div className="grid w-full grid-cols-3 gap-2">
                <button
                  type="button"
                  data-action="onboarding-lang-zh"
                  aria-pressed={lang === 'zh'}
                  onClick={() => onSelectLanguage('zh')}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-[8px] border px-2 py-2.5 transition-all ${
                    lang === 'zh'
                      ? 'border-[#64D2E6] bg-[#473A5C] text-white ring-1 ring-[#64D2E6]/60'
                      : 'border-[#524468] bg-[#2E243D] text-[#C2B8D3] hover:bg-[#362B47] hover:text-white'
                  }`}
                >
                  <span className="text-[13.5px] font-bold">中文</span>
                  <span className="mt-0.5 text-[10.5px] text-[#B4A9C6]">简体中文</span>
                </button>
                <button
                  type="button"
                  data-action="onboarding-lang-ja"
                  aria-pressed={lang === 'ja'}
                  onClick={() => onSelectLanguage('ja')}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-[8px] border px-2 py-2.5 transition-all ${
                    lang === 'ja'
                      ? 'border-[#64D2E6] bg-[#473A5C] text-white ring-1 ring-[#64D2E6]/60'
                      : 'border-[#524468] bg-[#2E243D] text-[#C2B8D3] hover:bg-[#362B47] hover:text-white'
                  }`}
                >
                  <span className="text-[13.5px] font-bold">日本語</span>
                  <span className="mt-0.5 text-[10.5px] text-[#B4A9C6]">日本語</span>
                </button>
                <button
                  type="button"
                  data-action="onboarding-lang-en"
                  aria-pressed={lang === 'en'}
                  onClick={() => onSelectLanguage('en')}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-[8px] border px-2 py-2.5 transition-all ${
                    lang === 'en'
                      ? 'border-[#64D2E6] bg-[#473A5C] text-white ring-1 ring-[#64D2E6]/60'
                      : 'border-[#524468] bg-[#2E243D] text-[#C2B8D3] hover:bg-[#362B47] hover:text-white'
                  }`}
                >
                  <span className="text-[13.5px] font-bold">English</span>
                  <span className="mt-0.5 text-[10.5px] text-[#B4A9C6]">English UI</span>
                </button>
              </div>
            )}
            {current.visual === 'dropdown' && (
              <div className="flex items-center gap-2 rounded-[6px] border border-[#524468] bg-[#2E243D] px-3.5 py-2 text-[13px] font-bold text-[#EFEBF5]">
                <span>25時、ナイトコードで。</span>
                <span className="text-[#64D2E6]">▾</span>
              </div>
            )}
            {current.visual === 'studio' && (
              <div className="flex items-center gap-3">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#64D2E6] ring-4 ring-[#64D2E6]/25" />
                <span className="h-3.5 w-3.5 rounded-full bg-[#F6CE71]/40" />
                <span className="h-3.5 w-3.5 rounded-full bg-[#EB7F97]/40" />
                <span className="ml-2 text-[12px] font-semibold text-[#DCD7E5]">
                  {t.step3Label}
                </span>
              </div>
            )}
            {current.visual === 'immersive' && (
              <div className="flex items-center gap-3">
                <span className="h-3.5 w-3.5 rounded-full bg-[#64D2E6]/40" />
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#F6CE71] ring-4 ring-[#F6CE71]/25" />
                <span className="h-3.5 w-3.5 rounded-full bg-[#EB7F97]/40" />
                <span className="ml-2 text-[12px] font-semibold text-[#DCD7E5]">
                  {t.step4Label}
                </span>
              </div>
            )}
            {current.visual === 'playback' && (
              <div className="flex items-center gap-3">
                <span className="h-3.5 w-3.5 rounded-full bg-[#64D2E6]/40" />
                <span className="h-3.5 w-3.5 rounded-full bg-[#F6CE71]/40" />
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#EB7F97] ring-4 ring-[#EB7F97]/25" />
                <span className="ml-2 text-[12px] font-semibold text-[#FFD2DC]">
                  {t.step5Label}
                </span>
              </div>
            )}
          </div>

          <h2 id="onboarding-title" className="mb-2 text-[16px] font-bold text-white">
            {current.title}
          </h2>
          <p className="text-[13px] leading-[1.65] text-[#DCD7E5]">{current.description}</p>
          {current.note && (
            <p className="mt-2 text-[11.5px] leading-[1.5] text-[#9A90A8]">{current.note}</p>
          )}

          {current.visual === 'language' && (
            <div className="mt-3.5 flex flex-col gap-1.5">
              <span className="text-[11px] font-medium text-[#A89DBD]">
                {t.videoTutorialSectionLabel}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="https://www.bilibili.com/video/BV1EgyWzfEtm"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-action="onboarding-bilibili-tutorial"
                  className="flex flex-col justify-between gap-2 rounded-[8px] border border-[#4E3F69] bg-[#362B47] p-2.5 text-[#EFEBF5] transition-colors hover:border-[#EB7F97]/70 hover:bg-[#413358]"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] bg-[#241B30] text-[#EB7F97]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                          d="M7.5 4.2L10 6.8M16.5 4.2L14 6.8"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                        />
                        <rect
                          x="3.2"
                          y="6.8"
                          width="17.6"
                          height="12.6"
                          rx="3.2"
                          stroke="currentColor"
                          strokeWidth="1.75"
                        />
                        <path
                          d="M8.8 11.6V14.2M15.2 11.6V14.2"
                          stroke="currentColor"
                          strokeWidth="1.9"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-[12px] font-bold text-white">
                        {t.videoTutorialTitle}
                      </span>
                      <span className="truncate text-[10px] text-[#A89DBD]">Bilibili</span>
                    </div>
                  </div>
                  <span className="inline-flex w-full items-center justify-between rounded-[5px] bg-[#241B30] px-2 py-1 text-[10.5px] font-medium text-[#FFD2DC]">
                    <span className="truncate">{t.videoTutorialBtn}</span>
                    <span aria-hidden="true">→</span>
                  </span>
                </a>

                <a
                  href="https://www.youtube.com/watch?v=-9kCDzlmh4s"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-action="onboarding-youtube-tutorial"
                  className="flex flex-col justify-between gap-2 rounded-[8px] border border-[#4E3F69] bg-[#362B47] p-2.5 text-[#EFEBF5] transition-colors hover:border-[#FF7575]/70 hover:bg-[#413358]"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] bg-[#241B30] text-[#FF7575]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <rect
                          x="2.8"
                          y="5.2"
                          width="18.4"
                          height="13.6"
                          rx="4"
                          stroke="currentColor"
                          strokeWidth="1.75"
                        />
                        <path d="M10.2 9.2L15.4 12L10.2 14.8V9.2Z" fill="currentColor" />
                      </svg>
                    </span>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-[12px] font-bold text-white">
                        {t.youtubeTutorialTitle}
                      </span>
                      <span className="truncate text-[10px] text-[#A89DBD]">YouTube</span>
                    </div>
                  </div>
                  <span className="inline-flex w-full items-center justify-between rounded-[5px] bg-[#241B30] px-2 py-1 text-[10.5px] font-medium text-[#FFC9C9]">
                    <span className="truncate">{t.videoTutorialBtn}</span>
                    <span aria-hidden="true">→</span>
                  </span>
                </a>
              </div>
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

        <div className="flex items-center justify-between border-t border-[#241C30] bg-[#261D33] px-4 py-3">
          <button
            type="button"
            data-action="onboarding-skip"
            onClick={onComplete}
            className="cursor-pointer rounded px-2.5 py-1.5 text-[12px] font-medium text-[#9A90A8] transition-colors hover:text-[#EFEBF5]"
          >
            {t.skip}
          </button>
          <div className="flex items-center gap-2">
            {stepIndex > 0 && (
              <button
                type="button"
                data-action="onboarding-prev"
                onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))}
                className="cursor-pointer rounded-[6px] border border-[#524468] bg-[#332844] px-3 py-1.5 text-[12.5px] font-medium text-[#DCD7E5] transition-colors hover:bg-[#3F3352]"
              >
                {t.back}
              </button>
            )}
            <button
              type="button"
              data-action={isLast ? 'onboarding-finish' : 'onboarding-next'}
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
