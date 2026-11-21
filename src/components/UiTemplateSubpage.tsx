import { useEffect, useRef, useState } from 'react';
import type { UiLanguage } from '../types/nightcord';
import { getUiText } from '../utils/i18n';
import { INITIAL_MESSAGES, INITIAL_VOICE_MEMBERS } from '../utils/nightcordState';
import {
  NIGHTCORD_HTML_TEMPLATE,
  NIGHTCORD_PALETTE_TOKENS,
  NIGHTCORD_TSX_TEMPLATE,
} from '../utils/nightcordTemplateCode';
import { NightcordAvatar, WorkChannelIcon } from './NightcordArt';

interface UiTemplateSubpageProps {
  lang: UiLanguage;
  onSelectLanguage: (lang: UiLanguage) => void;
  onBack: () => void;
  onNotify: (text: string) => void;
}

export function UiTemplateSubpage({
  lang,
  onSelectLanguage,
  onBack,
  onNotify,
}: UiTemplateSubpageProps) {
  const t = getUiText(lang);
  const [previewWidth, setPreviewWidth] = useState<'desktop' | 'mobile'>('desktop');
  const [codeTab, setCodeTab] = useState<'tsx' | 'html'>('tsx');
  const [copiedCode, setCopiedCode] = useState(false);
  const copyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setCopiedCode(false);
  }, [codeTab]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const activeSource = codeTab === 'tsx' ? NIGHTCORD_TSX_TEMPLATE : NIGHTCORD_HTML_TEMPLATE;
  const activeFilename =
    codeTab === 'tsx' ? 'NightcordTemplate.tsx' : 'nightcord-ui-template.html';

  const copyText = async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
    }
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      return ok;
    } catch {
      return false;
    }
  };

  const handleCopyCode = async () => {
    const ok = await copyText(activeSource);
    if (ok) {
      setCopiedCode(true);
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = window.setTimeout(() => setCopiedCode(false), 1800);
    }
  };

  const handleCopyColor = async (hex: string) => {
    const ok = await copyText(hex);
    if (ok) {
      onNotify(t.templateCopiedColor(hex));
    }
  };

  const handleDownloadTemplate = () => {
    const mime = codeTab === 'tsx' ? 'text/plain;charset=utf-8' : 'text/html;charset=utf-8';
    const blob = new Blob([activeSource], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      data-testid="ui-template-subpage"
      className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-[#231B30] text-[#EFEBF5]"
    >
      <header className="flex h-[54px] shrink-0 items-center justify-between gap-2 border-b border-[#322745] bg-[#211A2C] px-2.5 sm:gap-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            data-action="template-back"
            onClick={onBack}
            className="flex shrink-0 cursor-pointer items-center gap-1 rounded-[7px] border border-[#4D3F66] bg-[#2E243D] px-2 py-1 text-[11.5px] font-medium text-[#EFEBF5] transition-colors hover:border-[#64D2E6]/60 hover:bg-[#3B2E4E] sm:gap-1.5 sm:px-2.5 sm:py-1.5 sm:text-[12px]"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M10 3.5L5.5 8L10 12.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{t.templateBackBtn}</span>
          </button>
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
            <WorkChannelIcon size={17} />
            <h1 className="truncate text-[13px] font-bold text-white sm:text-[15.5px]">
              {t.templatePageTitle}
            </h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <div className="grid grid-cols-3 gap-0.5 rounded-[7px] border border-[#3C3052] bg-[#1A1324] p-0.5">
            <button
              type="button"
              data-action="template-lang-zh"
              onClick={() => onSelectLanguage('zh')}
              className={`cursor-pointer rounded-[5px] px-1.5 py-1 text-[10.5px] font-medium transition-colors sm:px-2 sm:text-[11px] ${
                lang === 'zh' ? 'bg-[#4C3E65] text-white' : 'text-[#9B90AD] hover:text-white'
              }`}
            >
              中文
            </button>
            <button
              type="button"
              data-action="template-lang-ja"
              onClick={() => onSelectLanguage('ja')}
              className={`cursor-pointer rounded-[5px] px-1.5 py-1 text-[10.5px] font-medium transition-colors sm:px-2 sm:text-[11px] ${
                lang === 'ja' ? 'bg-[#4C3E65] text-white' : 'text-[#9B90AD] hover:text-white'
              }`}
            >
              日本語
            </button>
            <button
              type="button"
              data-action="template-lang-en"
              onClick={() => onSelectLanguage('en')}
              className={`cursor-pointer rounded-[5px] px-1.5 py-1 text-[10.5px] font-medium transition-colors sm:px-2 sm:text-[11px] ${
                lang === 'en' ? 'bg-[#4C3E65] text-white' : 'text-[#9B90AD] hover:text-white'
              }`}
            >
              EN
            </button>
          </div>
          <a
            href="https://github.com/esahhk/nightcord_fan"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 rounded-[7px] border border-[#4D3F66] bg-[#2E243D] px-2.5 py-1.5 text-[12px] font-medium text-[#DCD7E5] transition-colors hover:bg-[#3B2E4E] hover:text-white sm:inline-flex"
          >
            <span>GitHub</span>
          </a>
        </div>
      </header>

      <div className="nc-scroll flex-1 px-4 py-5 sm:px-8 sm:py-7">
        <div className="mx-auto flex w-full max-w-[1040px] flex-col gap-6">
          <section className="rounded-[12px] border border-[#433659] bg-[#2B223B] p-4 sm:p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-[15px] font-bold text-white">{t.templateArchitectureTitle}</h2>
                <p className="mt-1.5 text-[12.5px] leading-[1.65] text-[#C8BFD8]">
                  {t.templatePageSubtitle}
                </p>
                <p className="mt-2 text-[12px] leading-[1.6] text-[#A499B8]">
                  {t.templateArchitectureDesc}
                </p>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-3 rounded-[12px] border border-[#433659] bg-[#2B223B] p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-[14px] font-bold text-white">{t.templatePreviewTitle}</h2>
              <div className="flex items-center gap-1 rounded-[7px] border border-[#3C3052] bg-[#1F172B] p-0.5">
                <button
                  type="button"
                  data-action="template-preview-desktop"
                  onClick={() => setPreviewWidth('desktop')}
                  className={`cursor-pointer rounded-[5px] px-2.5 py-1 text-[11.5px] font-medium transition-colors ${
                    previewWidth === 'desktop'
                      ? 'bg-[#4C3E65] text-white'
                      : 'text-[#9B90AD] hover:text-white'
                  }`}
                >
                  {t.templatePreviewDesktop}
                </button>
                <button
                  type="button"
                  data-action="template-preview-mobile"
                  onClick={() => setPreviewWidth('mobile')}
                  className={`cursor-pointer rounded-[5px] px-2.5 py-1 text-[11.5px] font-medium transition-colors ${
                    previewWidth === 'mobile'
                      ? 'bg-[#4C3E65] text-white'
                      : 'text-[#9B90AD] hover:text-white'
                  }`}
                >
                  {t.templatePreviewMobile}
                </button>
              </div>
            </div>

            <div className="flex justify-center rounded-[10px] border border-[#382C4B] bg-[#191322] p-3 sm:p-4">
              <div
                className={`flex h-[440px] w-full flex-col overflow-hidden rounded-[10px] border border-[#453859] bg-[#3F3352] shadow-[0_16px_42px_rgba(0,0,0,0.55)] transition-all duration-200 ${
                  previewWidth === 'mobile' ? 'max-w-[375px]' : 'max-w-full'
                }`}
              >
                <div className="flex h-[26px] shrink-0 items-center justify-end border-b border-[#191322] bg-[#211A2C] px-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-[10px] w-[10px] rounded-full bg-[#64D2E6]" />
                    <span className="h-[10px] w-[10px] rounded-full bg-[#F6CE71]" />
                    <span className="h-[10px] w-[10px] rounded-full bg-[#EB7F97]" />
                  </div>
                </div>

                <div className="flex min-h-0 flex-1">
                  {previewWidth === 'desktop' && (
                    <div className="hidden w-[210px] shrink-0 flex-col border-r border-[#241B30] bg-[#2E243D] md:flex">
                      <div className="flex h-[46px] shrink-0 items-center justify-between border-b border-[#241B30] px-3.5 text-[12.5px] font-medium text-[#EAE6F1]">
                        <span className="truncate">25時、ナイトコードで。</span>
                        <span className="text-[11px] text-[#9B90AD]">▾</span>
                      </div>
                      <div className="flex-1 overflow-y-auto pt-2.5">
                        <div className="px-2">
                          <div className="flex h-[32px] items-center gap-2 rounded-[6px] bg-[#3E3252] px-2.5 text-[12.5px] font-medium text-white">
                            <WorkChannelIcon size={16} />
                            <span>作業</span>
                          </div>
                        </div>
                        <div className="mt-3 mb-1 px-3 text-[10.5px] font-medium text-[#9E95B0]">
                          &gt; ボイスチャット
                        </div>
                        {INITIAL_VOICE_MEMBERS.map((member) => (
                          <div
                            key={member.id}
                            className="mx-1.5 flex h-[32px] items-center justify-between pl-3 pr-2.5"
                          >
                            <div className="flex items-center gap-2">
                              <NightcordAvatar
                                type={member.avatar}
                                size={22}
                                showOnlineDot={true}
                                isOnline={true}
                              />
                              <span className="text-[12px] font-medium text-[#DCD7E5]">
                                {member.name}
                              </span>
                            </div>
                          </div>
                        ))}
                        <div className="mt-2.5 px-3 text-[10.5px] font-medium text-[#9E95B0]">
                          &gt; オフライン
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex min-w-0 flex-1 flex-col bg-[#3F3352]">
                    <div className="flex h-[46px] shrink-0 items-center gap-2 border-b border-[#2F2540] px-4">
                      <WorkChannelIcon size={18} />
                      <span className="text-[14px] font-bold text-[#EFEBF5]">作業</span>
                    </div>

                    <div className="nc-scroll flex flex-1 flex-col gap-3 px-4 py-3.5">
                      {INITIAL_MESSAGES.slice(3).map((msg) => (
                        <div key={msg.id} className="flex flex-col gap-2">
                          {msg.dividerBefore && (
                            <div className="my-1 flex items-center gap-3">
                              <div className="h-px flex-1 bg-[#504266]" />
                              <span className="text-[10.5px] text-[#9A90A8]">
                                {msg.dividerBefore}
                              </span>
                              <div className="h-px flex-1 bg-[#504266]" />
                            </div>
                          )}
                          <div className="flex items-start gap-3">
                            <NightcordAvatar type={msg.avatar} size={32} />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-baseline gap-2">
                                <span className="text-[12.5px] font-bold text-[#EFEBF5]">
                                  {msg.username}
                                </span>
                                <span className="text-[10px] text-[#9A90A8]">{msg.timestamp}</span>
                              </div>
                              {msg.attachments && (
                                <div className="mt-1.5 flex flex-col gap-1.5">
                                  {msg.attachments.slice(0, 1).map((file) => (
                                    <div
                                      key={file.id}
                                      className="flex h-[48px] max-w-[260px] items-center justify-between rounded-[6px] border border-[#61527A] bg-[#524468] px-3"
                                    >
                                      <div className="flex min-w-0 flex-col">
                                        <span className="truncate text-[12.5px] font-bold text-white">
                                          {file.filename}
                                        </span>
                                        <span className="text-[10px] text-[#9A90A8]">
                                          {file.sizeLabel}
                                        </span>
                                      </div>
                                      <span className="text-[10px] font-bold text-[#C2B8D3]">
                                        {file.fileType}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {msg.text && (
                                <p className="text-[12.5px] leading-[1.42] text-[#E2DCEB]">
                                  {msg.text}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="shrink-0 px-4 pb-3 pt-1">
                      <div className="flex h-[38px] items-center justify-between rounded-[6px] border border-[#453859] bg-[#332844] px-3.5 text-[12px] text-[#857A99]">
                        <span>メッセージを送信</span>
                        <span className="flex items-center gap-2.5 text-[#9A90A8]">
                          <span>@</span>
                          <span>Aa</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-3 rounded-[12px] border border-[#433659] bg-[#2B223B] p-4 sm:p-5">
            <h2 className="text-[14px] font-bold text-white">{t.templatePaletteTitle}</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {NIGHTCORD_PALETTE_TOKENS.map((token) => (
                <button
                  key={token.hex}
                  type="button"
                  onClick={() => handleCopyColor(token.hex)}
                  className="flex cursor-pointer items-center gap-2.5 rounded-[8px] border border-[#3E3154] bg-[#241B32] p-2 text-left transition-colors hover:border-[#64D2E6]/60 hover:bg-[#312645]"
                >
                  <span
                    className="h-7 w-7 shrink-0 rounded-[6px] border border-white/15"
                    style={{ backgroundColor: token.hex }}
                  />
                  <span className="flex min-w-0 flex-col">
                    <span className="font-mono text-[11.5px] font-bold text-white">
                      {token.hex}
                    </span>
                    <span className="truncate text-[10px] text-[#A499B8]">{token.role}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-3 rounded-[12px] border border-[#433659] bg-[#2B223B] p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[14px] font-bold text-white">{t.templateCodeTitle}</h2>
                <div className="flex items-center gap-1 rounded-[7px] border border-[#3C3052] bg-[#1F172B] p-0.5">
                  <button
                    type="button"
                    data-action="template-code-tsx"
                    onClick={() => setCodeTab('tsx')}
                    className={`cursor-pointer rounded-[5px] px-2.5 py-1 text-[11.5px] font-medium transition-colors ${
                      codeTab === 'tsx'
                        ? 'bg-[#4C3E65] text-white'
                        : 'text-[#9B90AD] hover:text-white'
                    }`}
                  >
                    React + Tailwind (.tsx)
                  </button>
                  <button
                    type="button"
                    data-action="template-code-html"
                    onClick={() => setCodeTab('html')}
                    className={`cursor-pointer rounded-[5px] px-2.5 py-1 text-[11.5px] font-medium transition-colors ${
                      codeTab === 'html'
                        ? 'bg-[#4C3E65] text-white'
                        : 'text-[#9B90AD] hover:text-white'
                    }`}
                  >
                    Standalone HTML (.html)
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  data-action="template-copy-code"
                  onClick={handleCopyCode}
                  className="cursor-pointer rounded-[7px] border border-[#524468] bg-[#362B4A] px-3 py-1.5 text-[12px] font-medium text-[#EFEBF5] transition-colors hover:border-[#64D2E6]/60 hover:bg-[#46385F]"
                >
                  {copiedCode ? t.templateCopiedBtn : t.templateCopyCodeBtn}
                </button>
                <button
                  type="button"
                  data-action="template-download-code"
                  onClick={handleDownloadTemplate}
                  className="cursor-pointer rounded-[7px] bg-[#64D2E6] px-3 py-1.5 text-[12px] font-bold text-[#211A2C] transition-colors hover:brightness-110"
                >
                  {t.templateDownloadBtn}
                </button>
              </div>
            </div>

            <pre className="nc-scroll max-h-[380px] overflow-x-auto rounded-[9px] border border-[#382C4B] bg-[#191322] p-3.5 font-mono text-[11.5px] leading-[1.55] text-[#DCD7E5]">
              <code>{activeSource}</code>
            </pre>

            <p className="text-[11.5px] text-[#9A90A8]">{t.templateLicenseNote}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
