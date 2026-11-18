import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { AppMode, Conversation, UiLanguage, VoiceMember } from '../types/nightcord';
import { getUiText } from '../utils/i18n';
import { NightcordAvatar, WorkChannelIcon } from './NightcordArt';

interface SidebarProps {
  lang: UiLanguage;
  mode: AppMode;
  conversations: Conversation[];
  activeConversationId: string;
  activeChannelTitle: string;
  voiceExpanded: boolean;
  offlineExpanded: boolean;
  members: VoiceMember[];
  mobileOpen: boolean;
  serverMenuOpen: boolean;
  onSelectLanguage: (lang: UiLanguage) => void;
  onCloseMobile: () => void;
  onToggleServerMenu: () => void;
  onCloseServerMenu: () => void;
  onSelectConversation: (conversationId: string) => void;
  onCreateConversation: (title: string, fromTemplate: boolean) => void;
  onDeleteConversation: (conversationId: string) => void;
  onChannelSelect: (channelId: string) => void;
  onVoiceToggle: () => void;
  onOfflineToggle: () => void;
  onMicToggle: (member: VoiceMember) => void;
  onSetMemberOnline: (member: VoiceMember, online: boolean) => void;
  onExportData: () => void;
  onTriggerImportData: () => void;
  onRequestClearCache: () => void;
}

export function Sidebar({
  lang,
  mode,
  conversations,
  activeConversationId,
  activeChannelTitle,
  voiceExpanded,
  offlineExpanded,
  members,
  mobileOpen,
  serverMenuOpen,
  onSelectLanguage,
  onCloseMobile,
  onToggleServerMenu,
  onCloseServerMenu,
  onSelectConversation,
  onCreateConversation,
  onDeleteConversation,
  onChannelSelect,
  onVoiceToggle,
  onOfflineToggle,
  onMicToggle,
  onSetMemberOnline,
  onExportData,
  onTriggerImportData,
  onRequestClearCache,
}: SidebarProps) {
  const t = getUiText(lang);
  const [newTitle, setNewTitle] = useState('');
  const [fromTemplate, setFromTemplate] = useState(false);
  const [memberMenuId, setMemberMenuId] = useState<string | null>(null);
  const longPressTimerRef = useRef<number | null>(null);

  const clearLongPress = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const startMemberLongPress = (memberId: string) => {
    if (mode !== 'studio') {
      return;
    }
    clearLongPress();
    longPressTimerRef.current = window.setTimeout(() => {
      setMemberMenuId(memberId);
    }, 450);
  };

  const handleCreateSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newTitle.trim()) {
      return;
    }
    onCreateConversation(newTitle, fromTemplate);
    setNewTitle('');
    setFromTemplate(false);
  };

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="サイドバーを閉じる"
          onClick={onCloseMobile}
          className="fixed inset-x-0 bottom-0 top-[28px] z-30 bg-black/50 md:hidden"
        />
      )}
      <aside
        className={`fixed bottom-0 left-0 top-[28px] z-40 flex w-[265px] max-w-[82vw] shrink-0 select-none flex-col border-r border-[#241C30] bg-[#2E243D] transition-transform duration-200 ease-out md:static md:top-auto md:z-auto md:h-full md:w-[230px] md:max-w-none md:translate-x-0 lg:w-[255px] ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="relative flex h-[52px] w-full shrink-0 items-center justify-between border-b border-[#241C30]">
          <button
            type="button"
            data-action="server-menu"
            aria-label="サーバーメニュー：25時、ナイトコードで。"
            aria-expanded={serverMenuOpen}
            onClick={onToggleServerMenu}
            className="flex h-full min-w-0 flex-1 cursor-pointer items-center gap-2 px-4 text-left transition-colors hover:bg-[#362B47]"
          >
            <span className="truncate text-[14px] font-bold tracking-[0.01em] text-[#EFEBF5]">
              25時、ナイトコードで。
            </span>
            <span
              className="inline-flex shrink-0 items-center text-[#9A90A8] transition-transform duration-150"
              style={{ transform: serverMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              <svg width="11" height="7" viewBox="0 0 11 7" fill="none" aria-hidden="true">
                <path
                  d="M1.5 1.5L5.5 5.5L9.5 1.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>
          <button
            type="button"
            data-action="sidebar-close"
            aria-label="メニューを閉じる"
            onClick={onCloseMobile}
            className="mr-2 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-[#9A90A8] transition-colors hover:bg-[#362B47] hover:text-white md:hidden"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M4 4L12 12M12 4L4 12"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {serverMenuOpen && (
            <>
              <button
                type="button"
                aria-label="閉じる"
                onClick={onCloseServerMenu}
                className="fixed inset-0 z-40 cursor-default bg-transparent"
              />
              <div
                role="region"
                aria-label={t.convListTitle}
                className="nc-scroll absolute left-2 right-2 top-[56px] z-50 max-h-[calc(100dvh-100px)] rounded-[8px] border border-[#524468] bg-[#211A2C] p-2.5 shadow-[0_14px_34px_rgba(0,0,0,0.6)]"
              >
              <div className="mb-1.5 px-1 text-[11px] font-bold text-[#9A90A8]">
                {t.convListTitle}
              </div>
              <div className="nc-scroll mb-2.5 flex max-h-[180px] flex-col gap-1">
                {conversations.map((conv) => {
                  const isActive = conv.id === activeConversationId;
                  return (
                    <div
                      key={conv.id}
                      className={`flex items-center justify-between gap-1 rounded-[6px] px-2 py-1.5 transition-colors ${
                        isActive ? 'bg-[#473A5C] text-white' : 'text-[#DCD7E5] hover:bg-[#332844]'
                      }`}
                    >
                      <button
                        type="button"
                        data-action={`conv-select-${conv.id}`}
                        onClick={() => onSelectConversation(conv.id)}
                        className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 bg-transparent text-left text-[12.5px] font-medium"
                      >
                        <WorkChannelIcon size={15} />
                        <span className="truncate">{conv.title}</span>
                        {conv.isTemplate && (
                          <span className="shrink-0 rounded bg-[#2E243D] px-1.5 py-0.5 text-[9.5px] text-[#C2B8D3]">
                            {t.templateBadge}
                          </span>
                        )}
                      </button>
                      {!conv.isTemplate && (
                        <button
                          type="button"
                          data-action={`conv-delete-${conv.id}`}
                          aria-label={`${conv.title}を削除`}
                          onClick={() => onDeleteConversation(conv.id)}
                          className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded text-[#9A90A8] hover:bg-[#2E243D] hover:text-[#EB7F97]"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <form
                onSubmit={handleCreateSubmit}
                className="flex flex-col gap-2 border-t border-[#332844] pt-2.5"
              >
                <div className="px-1 text-[11px] font-bold text-[#9A90A8]">
                  {t.createConvTitle}
                </div>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  aria-label={t.createConvTitle}
                  placeholder={t.createConvPlaceholder}
                  className="w-full rounded-[6px] border border-[#453859] bg-[#332844] px-2.5 py-1.5 text-[12.5px] text-[#EFEBF5] outline-none placeholder:text-[#857A99] focus:border-[#64D2E6]"
                />
                <label className="flex cursor-pointer items-center gap-1.5 px-1 text-[11.5px] text-[#C2B8D3]">
                  <input
                    type="checkbox"
                    checked={fromTemplate}
                    onChange={(e) => setFromTemplate(e.target.checked)}
                    className="accent-[#64D2E6]"
                  />
                  <span>{t.copyTemplateLabel}</span>
                </label>
                <button
                  type="submit"
                  data-action="conv-create-submit"
                  className="w-full cursor-pointer rounded-[6px] bg-[#524468] py-1.5 text-[12px] font-bold text-white transition-colors hover:bg-[#61527A]"
                >
                  {t.createConvBtn}
                </button>
              </form>

              <div className="mt-2.5 flex flex-col gap-1.5 border-t border-[#332844] pt-2.5">
                <div className="px-1 text-[11px] font-bold text-[#9A90A8]">
                  {t.dataSectionTitle}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    data-action="data-export"
                    onClick={onExportData}
                    className="cursor-pointer rounded-[6px] border border-[#4D3F66] bg-[#332844] px-2 py-1.5 text-[11.5px] font-medium text-[#DCD7E5] transition-colors hover:bg-[#473A5C] hover:text-white"
                  >
                    {t.exportDataBtn}
                  </button>
                  <button
                    type="button"
                    data-action="data-import"
                    onClick={onTriggerImportData}
                    className="cursor-pointer rounded-[6px] border border-[#4D3F66] bg-[#332844] px-2 py-1.5 text-[11.5px] font-medium text-[#DCD7E5] transition-colors hover:bg-[#473A5C] hover:text-white"
                  >
                    {t.importDataBtn}
                  </button>
                </div>
                <button
                  type="button"
                  data-action="open-clear-cache"
                  onClick={onRequestClearCache}
                  className="w-full cursor-pointer rounded-[6px] border border-[#EB7F97]/40 bg-[#3B2335] px-2 py-1.5 text-[11.5px] font-medium text-[#FFB6C7] transition-colors hover:bg-[#4E2C45] hover:text-white"
                >
                  {t.clearCacheBtn}
                </button>
              </div>

              <div className="mt-2.5 flex items-center justify-between border-t border-[#332844] pt-2">
                <span className="px-1 text-[11px] text-[#9A90A8]">{t.langLabel}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    data-action="lang-zh"
                    aria-pressed={lang === 'zh'}
                    onClick={() => onSelectLanguage('zh')}
                    className={`cursor-pointer rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                      lang === 'zh'
                        ? 'bg-[#473A5C] text-white'
                        : 'text-[#9A90A8] hover:text-white'
                    }`}
                  >
                    中文
                  </button>
                  <button
                    type="button"
                    data-action="lang-ja"
                    aria-pressed={lang === 'ja'}
                    onClick={() => onSelectLanguage('ja')}
                    className={`cursor-pointer rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                      lang === 'ja'
                        ? 'bg-[#473A5C] text-white'
                        : 'text-[#9A90A8] hover:text-white'
                    }`}
                  >
                    日本語
                  </button>
                </div>
              </div>

              <div className="mt-2 flex flex-col gap-1.5 border-t border-[#332844] pt-2 text-[11px]">
                <div className="px-1 font-bold text-[#9A90A8]">{t.linksSectionTitle}</div>
                <div className="flex flex-wrap items-center gap-1.5 px-1">
                  <a
                    href="https://esahhk.xyz"
                    target="_blank"
                    rel="noopener noreferrer"
                    data-action="link-esahhk"
                    className="rounded border border-[#4D3F66] bg-[#332844] px-2 py-0.5 text-[#64D2E6] transition-colors hover:bg-[#473A5C] hover:text-white"
                  >
                    esahhk.xyz
                  </a>
                  <a
                    href="https://github.com/esahhk/nightcord_fan"
                    target="_blank"
                    rel="noopener noreferrer"
                    data-action="link-github"
                    className="rounded border border-[#4D3F66] bg-[#332844] px-2 py-0.5 text-[#DCD7E5] transition-colors hover:bg-[#473A5C] hover:text-white"
                  >
                    GitHub
                  </a>
                </div>
                <div className="px-1 text-[10.5px] text-[#9A90A8]">
                  <span>{t.reportIssueLabel}: </span>
                  <a
                    href="mailto:esahhk@outlook.com"
                    data-action="link-email"
                    className="text-[#C2B8D3] underline hover:text-white"
                  >
                    esahhk@outlook.com
                  </a>
                </div>
              </div>
            </div>
            </>
          )}
        </div>

        <div className="nc-scroll flex-1 pb-4">
          <div className="mx-2.5 my-3">
            <button
              type="button"
              data-action="channel-work"
              aria-label={`チャンネル：${activeChannelTitle}`}
              aria-current="page"
              onClick={() => onChannelSelect(activeConversationId)}
              className="flex h-[38px] w-full cursor-pointer items-center gap-2.5 rounded-[6px] bg-[#473A5C] px-3 text-left text-white transition-colors"
            >
              <WorkChannelIcon size={22} />
              <span className="truncate text-[14px] font-semibold">{activeChannelTitle}</span>
            </button>
          </div>

          <button
            type="button"
            data-action="toggle-voice-category"
            aria-expanded={voiceExpanded}
            onClick={onVoiceToggle}
            className="flex w-full cursor-pointer items-center gap-1.5 px-4 pb-1.5 pt-2.5 text-left text-[11px] font-bold text-[#9A90A8] transition-colors hover:text-[#DCD7E5]"
          >
            <span
              className="inline-block transition-transform duration-150"
              style={{ transform: voiceExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}
              aria-hidden="true"
            >
              &gt;
            </span>
            <span>ボイスチャット</span>
          </button>

          {voiceExpanded && (
            <div className="mb-3 flex flex-col gap-0.5">
              {members.map((member) => (
                <div
                  key={member.id}
                  data-member-row={member.id}
                  onPointerDown={() => startMemberLongPress(member.id)}
                  onPointerUp={clearLongPress}
                  onPointerLeave={clearLongPress}
                  onPointerCancel={clearLongPress}
                  onContextMenu={(e) => {
                    if (mode === 'studio') {
                      e.preventDefault();
                      setMemberMenuId(member.id);
                    }
                  }}
                  className="relative mx-1.5 flex h-[36px] items-center justify-between rounded-[6px] pl-4 pr-3"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2.5 py-1">
                    <NightcordAvatar
                      type={member.avatar}
                      size={25}
                      showOnlineDot={true}
                      isOnline={member.online}
                    />
                    <span
                      className={`truncate text-[13px] font-medium ${
                        member.online ? 'text-[#DCD7E5]' : 'text-[#857A99]'
                      }`}
                    >
                      {member.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    data-action={`mic-${member.id}`}
                    aria-label={`${member.name}のマイク切替`}
                    aria-pressed={member.muted}
                    title="マイク切替"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => onMicToggle(member)}
                    className={`flex cursor-pointer items-center justify-center rounded p-1 transition-colors ${
                      member.muted
                        ? 'text-[#EB7F97] hover:text-[#F49EB2]'
                        : 'text-[#8C829C] hover:text-[#EFEBF5]'
                    }`}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
                      <path d="M7 1.5C5.9 1.5 5 2.4 5 3.5V7.5C5 8.6 5.9 9.5 7 9.5C8.1 9.5 9 8.6 9 7.5V3.5C9 2.4 8.1 1.5 7 1.5Z" />
                      <path d="M3.2 6.8V7.5C3.2 9.4 4.6 11.0 6.4 11.2V13H7.6V11.2C9.4 11.0 10.8 9.4 10.8 7.5V6.8H9.6V7.5C9.6 8.9 8.4 10.1 7 10.1C5.6 10.1 4.4 8.9 4.4 7.5V6.8H3.2Z" />
                      {member.muted && (
                        <line
                          x1="2"
                          y1="2"
                          x2="12"
                          y2="12"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      )}
                    </svg>
                  </button>

                  {mode === 'studio' && memberMenuId === member.id && (
                    <>
                      <button
                        type="button"
                        aria-label="閉じる"
                        onClick={() => setMemberMenuId(null)}
                        className="fixed inset-0 z-40 cursor-default bg-transparent"
                      />
                      <div className="nc-modal-enter absolute left-3 top-[38px] z-50 min-w-[130px] rounded-[8px] border border-[#524468] bg-[#211A2C] p-1 shadow-[0_10px_28px_rgba(0,0,0,0.55)]">
                        <button
                          type="button"
                          data-action={`member-toggle-online-${member.id}`}
                          onClick={() => {
                            onSetMemberOnline(member, !member.online);
                            setMemberMenuId(null);
                          }}
                          className="flex w-full cursor-pointer items-center gap-2 rounded-[6px] px-2.5 py-1.5 text-left text-[12px] font-medium text-[#EFEBF5] transition-colors hover:bg-[#473A5C]"
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              member.online ? 'bg-[#857A99]' : 'bg-[#55D8C1]'
                            }`}
                          />
                          <span>{member.online ? t.setOfflineBtn : t.setOnlineBtn}</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            data-action="toggle-offline-category"
            aria-expanded={offlineExpanded}
            onClick={onOfflineToggle}
            className="flex w-full cursor-pointer items-center gap-1.5 px-4 pb-1.5 pt-2.5 text-left text-[11px] font-bold text-[#9A90A8] transition-colors hover:text-[#DCD7E5]"
          >
            <span
              className="inline-block transition-transform duration-150"
              style={{ transform: offlineExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
              aria-hidden="true"
            >
              &gt;
            </span>
            <span>オフライン</span>
          </button>

          {offlineExpanded && (
            <div className="flex flex-col gap-0.5 px-4 py-1.5 text-[12px] text-[#857A99]">
              {members.filter((m) => !m.online).length === 0 ? (
                <div className="px-2">オフラインのメンバーはいません</div>
              ) : (
                members
                  .filter((m) => !m.online)
                  .map((m) => (
                    <div key={m.id} className="flex items-center gap-2 px-2 py-1">
                      <NightcordAvatar type={m.avatar} size={20} showOnlineDot={true} isOnline={false} />
                      <span className="truncate">{m.name}</span>
                    </div>
                  ))
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
