import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type {
  AppMode,
  Conversation,
  MemberPresenceStatus,
  MemberStatusEvent,
  MessageDateTime,
  UiLanguage,
  VoiceMember,
} from '../types/nightcord';
import { getUiText } from '../utils/i18n';
import {
  formatDateTimeBadge,
  getDaysInMonth,
  parseCustomDateTimeInput,
} from '../utils/nightcordState';
import { CharacterAvatar } from './LocalMedia';
import { WorkChannelIcon } from './NightcordArt';

const STATUS_YEARS: number[] = Array.from({ length: 1001 }, (_, idx) => 2000 + idx);
const STATUS_MONTHS: number[] = Array.from({ length: 12 }, (_, idx) => idx + 1);

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
  suggestedStatusTime: { year: number; month: number; day: number; time: string };
  activeStatusEvents: MemberStatusEvent[];
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
  onSetMemberStatus: (member: VoiceMember, status: MemberPresenceStatus) => void;
  onScheduleMemberStatus: (
    member: VoiceMember,
    status: MemberPresenceStatus,
    sentAt: MessageDateTime
  ) => void;
  onDeleteStatusEvent: (eventId: string) => void;
  canRemoveCharacter: boolean;
  onRemoveCharacter: (member: VoiceMember) => void;
  onExportData: () => void;
  onTriggerImportData: () => void;
  onRequestClearCache: () => void;
  onOpenTutorial: () => void;
  onOpenTemplatePage: () => void;
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
  suggestedStatusTime,
  activeStatusEvents,
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
  onSetMemberStatus,
  onScheduleMemberStatus,
  onDeleteStatusEvent,
  canRemoveCharacter,
  onRemoveCharacter,
  onExportData,
  onTriggerImportData,
  onRequestClearCache,
  onOpenTutorial,
  onOpenTemplatePage,
}: SidebarProps) {
  const t = getUiText(lang);
  const [newTitle, setNewTitle] = useState('');
  const [fromTemplate, setFromTemplate] = useState(false);
  const [createExpanded, setCreateExpanded] = useState(false);
  const [memberMenuId, setMemberMenuId] = useState<string | null>(null);
  const [memberMenuFlipUp, setMemberMenuFlipUp] = useState(false);
  const [statusTimeEnabled, setStatusTimeEnabled] = useState(false);
  const [statusTimeYear, setStatusTimeYear] = useState(suggestedStatusTime.year);
  const [statusTimeMonth, setStatusTimeMonth] = useState(suggestedStatusTime.month);
  const [statusTimeDay, setStatusTimeDay] = useState(suggestedStatusTime.day);
  const [statusTimeClock, setStatusTimeClock] = useState(suggestedStatusTime.time);
  const [statusTimeError, setStatusTimeError] = useState<string | null>(null);
  const activeMemberRowRef = useRef<HTMLElement | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const pressOriginRef = useRef<{ x: number; y: number } | null>(null);
  const longPressTriggeredRef = useRef(false);

  const onlineMembers = members.filter((m) => m.status === 'online');
  const voiceMembers = members.filter((m) => m.status === 'voice');
  const offlineMembers = members.filter((m) => m.status === 'offline');

  const statusDaysList = useMemo(
    () => Array.from({ length: getDaysInMonth(statusTimeYear, statusTimeMonth) }, (_, i) => i + 1),
    [statusTimeYear, statusTimeMonth]
  );

  useEffect(() => {
    if (mode !== 'studio') {
      setMemberMenuId(null);
      setStatusTimeEnabled(false);
      setStatusTimeError(null);
    }
  }, [mode]);

  useEffect(() => {
    if (!serverMenuOpen) {
      setCreateExpanded(false);
    }
  }, [serverMenuOpen]);

  useEffect(() => {
    if (!memberMenuId && !createExpanded) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMemberMenuId(null);
        setCreateExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [memberMenuId, createExpanded]);

  const clearLongPress = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    pressOriginRef.current = null;
  };

  const handleMemberPointerMove = (x: number, y: number) => {
    const origin = pressOriginRef.current;
    if (!origin) {
      return;
    }
    if (Math.hypot(x - origin.x, y - origin.y) > 8) {
      clearLongPress();
    }
  };

  const computeFlipUp = (rowEl: HTMLElement | null, expanded: boolean): boolean => {
    if (!rowEl) {
      return false;
    }
    const rect = rowEl.getBoundingClientRect();
    const neededHeight = expanded ? 340 : 210;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    return spaceBelow < neededHeight && spaceAbove > spaceBelow;
  };

  const openMemberMenu = (memberId: string, rowEl: HTMLElement | null) => {
    activeMemberRowRef.current = rowEl;
    setStatusTimeYear(suggestedStatusTime.year);
    setStatusTimeMonth(suggestedStatusTime.month);
    setStatusTimeDay(suggestedStatusTime.day);
    setStatusTimeClock(suggestedStatusTime.time);
    setStatusTimeError(null);
    setMemberMenuFlipUp(computeFlipUp(rowEl, statusTimeEnabled));
    setMemberMenuId(memberId);
  };

  const startMemberLongPress = (
    memberId: string,
    x: number,
    y: number,
    rowEl: HTMLElement | null
  ) => {
    if (mode !== 'studio') {
      return;
    }
    clearLongPress();
    longPressTriggeredRef.current = false;
    pressOriginRef.current = { x, y };
    longPressTimerRef.current = window.setTimeout(() => {
      window.getSelection?.()?.removeAllRanges();
      longPressTriggeredRef.current = true;
      openMemberMenu(memberId, rowEl);
      pressOriginRef.current = null;
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
    setCreateExpanded(false);
  };

  const updateStatusYearOrMonth = (nextYear: number, nextMonth: number) => {
    const maxDay = getDaysInMonth(nextYear, nextMonth);
    setStatusTimeYear(nextYear);
    setStatusTimeMonth(nextMonth);
    setStatusTimeDay((prev) => Math.min(prev, maxDay));
    setStatusTimeError(null);
  };

  const getStatusLabel = (status: MemberPresenceStatus): string => {
    if (status === 'online') {
      return t.statusOnlineBtn;
    }
    if (status === 'voice') {
      return t.statusVoiceBtn;
    }
    return t.statusOfflineBtn;
  };

  const renderStatusPopover = (member: VoiceMember) => {
    if (mode !== 'studio' || memberMenuId !== member.id) {
      return null;
    }
    const options: { value: MemberPresenceStatus; label: string; dotClass: string }[] = [
      { value: 'online', label: t.statusOnlineBtn, dotClass: 'bg-[#55D8C1]' },
      { value: 'voice', label: t.statusVoiceBtn, dotClass: 'bg-[#64D2E6]' },
      { value: 'offline', label: t.statusOfflineBtn, dotClass: 'bg-[#857A99]' },
    ];
    const memberEvents = activeStatusEvents.filter((ev) => ev.memberId === member.id);

    return (
      <div
        role="menu"
        className={`nc-modal-enter nc-scroll absolute left-1.5 z-50 max-h-[min(68dvh,360px)] w-[216px] overflow-y-auto rounded-[9px] border border-[#524468] bg-[#211A2C] p-1.5 shadow-[0_12px_28px_rgba(0,0,0,0.68)] ${
          memberMenuFlipUp ? 'bottom-[38px]' : 'top-[38px]'
        }`}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {options.map((opt) => {
          const isCurrent = member.status === opt.value && !statusTimeEnabled;
          return (
            <button
              key={opt.value}
              type="button"
              data-action={`set-member-status-${opt.value}`}
              onClick={() => {
                if (statusTimeEnabled) {
                  const parsed = parseCustomDateTimeInput({
                    year: statusTimeYear,
                    month: statusTimeMonth,
                    day: statusTimeDay,
                    time: statusTimeClock,
                  });
                  if (!parsed) {
                    setStatusTimeError(t.statusTimeInvalid);
                    return;
                  }
                  onScheduleMemberStatus(member, opt.value, parsed);
                  setStatusTimeError(null);
                  setMemberMenuId(null);
                  return;
                }
                onSetMemberStatus(member, opt.value);
                setMemberMenuId(null);
              }}
              className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-[6px] px-2.5 py-1.5 text-left text-[12px] transition-colors ${
                isCurrent
                  ? 'bg-[#3C2F52] font-medium text-white'
                  : 'text-[#DCD7E5] hover:bg-[#342946] hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${opt.dotClass}`} />
                <span>{opt.label}</span>
              </span>
              {isCurrent && <span className="text-[10px] text-[#64D2E6]">✓</span>}
            </button>
          );
        })}

        <div className="my-1 h-px w-full bg-[#362B49]" />

        <div className="rounded-[6px] px-1 py-1">
          <label className="flex cursor-pointer items-start gap-2 px-1.5 py-0.5 text-[11.5px] font-medium text-[#DCD7E5] hover:text-white">
            <input
              type="checkbox"
              data-action="toggle-member-status-time"
              checked={statusTimeEnabled}
              onChange={(e) => {
                const next = e.target.checked;
                setStatusTimeEnabled(next);
                setStatusTimeError(null);
                setMemberMenuFlipUp(computeFlipUp(activeMemberRowRef.current, next));
              }}
              className="mt-0.5 shrink-0 accent-[#64D2E6]"
            />
            <span className="leading-[1.35]">{t.statusAddTimeToggle}</span>
          </label>

          {statusTimeEnabled && (
            <div className="mt-1.5 flex flex-col gap-1.5 rounded-[6px] border border-[#3E3254] bg-[#292038] p-2">
              <p className="text-[10px] leading-[1.35] text-[#A499B8]">{t.statusAddTimeHint}</p>
              <div className="grid grid-cols-[1.3fr_0.9fr_0.8fr] gap-1">
                <select
                  data-action="member-status-year"
                  aria-label={t.yearUnit}
                  value={statusTimeYear}
                  onChange={(e) => updateStatusYearOrMonth(Number(e.target.value), statusTimeMonth)}
                  className="cursor-pointer rounded-[5px] border border-[#4D3F66] bg-[#332844] px-1 py-0.5 text-[10.5px] text-[#EFEBF5] outline-none focus:border-[#64D2E6]"
                >
                  {STATUS_YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <select
                  data-action="member-status-month"
                  aria-label={t.monthUnit}
                  value={statusTimeMonth}
                  onChange={(e) => updateStatusYearOrMonth(statusTimeYear, Number(e.target.value))}
                  className="cursor-pointer rounded-[5px] border border-[#4D3F66] bg-[#332844] px-1 py-0.5 text-[10.5px] text-[#EFEBF5] outline-none focus:border-[#64D2E6]"
                >
                  {STATUS_MONTHS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                      {t.monthUnit}
                    </option>
                  ))}
                </select>
                <select
                  data-action="member-status-day"
                  aria-label={t.dayUnit}
                  value={statusTimeDay}
                  onChange={(e) => {
                    setStatusTimeDay(Number(e.target.value));
                    setStatusTimeError(null);
                  }}
                  className="cursor-pointer rounded-[5px] border border-[#4D3F66] bg-[#332844] px-1 py-0.5 text-[10.5px] text-[#EFEBF5] outline-none focus:border-[#64D2E6]"
                >
                  {statusDaysList.map((d) => (
                    <option key={d} value={d}>
                      {d}
                      {t.dayUnit}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="time"
                  data-action="member-status-time-input"
                  aria-label={t.statusAddTimeToggle}
                  value={statusTimeClock}
                  onChange={(e) => {
                    setStatusTimeClock(e.target.value);
                    setStatusTimeError(null);
                  }}
                  className="min-w-0 flex-1 rounded-[5px] border border-[#4D3F66] bg-[#332844] px-1.5 py-0.5 text-[11px] text-[#EFEBF5] outline-none focus:border-[#64D2E6]"
                />
                <button
                  type="button"
                  data-action="member-status-time-sync"
                  onClick={() => {
                    setStatusTimeYear(suggestedStatusTime.year);
                    setStatusTimeMonth(suggestedStatusTime.month);
                    setStatusTimeDay(suggestedStatusTime.day);
                    setStatusTimeClock(suggestedStatusTime.time);
                    setStatusTimeError(null);
                  }}
                  className="shrink-0 cursor-pointer rounded-[5px] border border-[#4D3F66] bg-[#332844] px-1.5 py-0.5 text-[10px] text-[#C2B8D3] hover:bg-[#473A5C] hover:text-white"
                >
                  {t.statusTimeSyncBtn}
                </button>
              </div>
              {statusTimeError && (
                <div className="text-[10px] font-medium text-[#FF9EB3]">{statusTimeError}</div>
              )}
              {memberEvents.length > 0 && (
                <div className="mt-0.5 flex flex-col gap-1 border-t border-[#3B2F50] pt-1.5">
                  <span className="text-[10px] font-medium text-[#9B90AD]">
                    {t.statusScheduledListLabel(memberEvents.length)}
                  </span>
                  {memberEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="flex items-center justify-between gap-1 rounded-[4px] bg-[#211A2C] px-1.5 py-1 text-[10px] text-[#DCD7E5]"
                    >
                      <span className="truncate">
                        {formatDateTimeBadge(ev.sentAt)} · {getStatusLabel(ev.status)}
                      </span>
                      <button
                        type="button"
                        data-action={`delete-status-event-${ev.id}`}
                        aria-label={t.cancel}
                        onClick={() => onDeleteStatusEvent(ev.id)}
                        className="shrink-0 cursor-pointer px-1 text-[#9B90AD] hover:text-[#FF9EB3]"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="my-1 h-px w-full bg-[#362B49]" />
        <button
          type="button"
          data-action="remove-member-character"
          aria-disabled={!canRemoveCharacter}
          onClick={() => {
            onRemoveCharacter(member);
            setMemberMenuId(null);
          }}
          className={`flex w-full cursor-pointer items-center gap-2 rounded-[6px] px-2.5 py-1.5 text-left text-[12px] font-medium transition-colors ${
            canRemoveCharacter
              ? 'text-[#FFB6C7] hover:bg-[#4B2538] hover:text-white'
              : 'text-[#8B7D9B] opacity-70 hover:bg-[#342946]'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-[#EB7F97]" />
          <span>{t.removeCharBtn}</span>
        </button>
      </div>
    );
  };

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="サイドバーを閉じる"
          onClick={onCloseMobile}
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
        />
      )}

      {(serverMenuOpen || memberMenuId) && (
        <div
          aria-hidden="true"
          onClick={() => {
            if (serverMenuOpen) {
              onCloseServerMenu();
            }
            if (memberMenuId) {
              setMemberMenuId(null);
            }
          }}
          className="fixed inset-0 z-30 bg-transparent"
        />
      )}

      <aside
        onClick={() => {
          if (longPressTriggeredRef.current) {
            longPressTriggeredRef.current = false;
            return;
          }
          if (serverMenuOpen) {
            onCloseServerMenu();
          }
          if (memberMenuId) {
            setMemberMenuId(null);
          }
        }}
        className={`fixed bottom-0 left-0 top-[28px] z-40 flex w-[238px] max-w-[82vw] shrink-0 flex-col border-r border-[#241B30] bg-[#2E243D] transition-transform duration-200 md:relative md:top-0 md:z-40 md:w-[228px] md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative flex h-[54px] shrink-0 items-center border-b border-[#241B30] px-4"
        >
          <button
            type="button"
            data-action="server-menu"
            aria-label="サーバーメニュー：25時、ナイトコードで。"
            aria-expanded={serverMenuOpen}
            onClick={onToggleServerMenu}
            className="flex w-full cursor-pointer items-center justify-between gap-2 text-left text-[13.5px] font-medium tracking-[0.02em] text-[#EAE6F1] transition-colors hover:text-white"
          >
            <span className="truncate">25時、ナイトコードで。</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className={`shrink-0 text-[#9B90AD] transition-transform duration-150 ${
                serverMenuOpen ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            >
              <path
                d="M2.4 4.3L6 7.9L9.6 4.3"
                stroke="currentColor"
                strokeWidth="1.35"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {serverMenuOpen && (
            <div
              role="menu"
              data-testid="server-dropdown"
              onClick={(e) => e.stopPropagation()}
              className="nc-modal-enter nc-scroll absolute left-2 right-2 top-[56px] z-50 max-h-[calc(100dvh-96px)] rounded-[10px] border border-[#46385C] bg-[#241C32] p-3 shadow-[0_18px_42px_rgba(0,0,0,0.62)]"
            >
              <div className="mb-2 flex items-center justify-between gap-1 px-0.5">
                <span className="truncate text-[11px] font-medium tracking-[0.04em] text-[#9E93B3]">
                  {t.convListTitle}
                </span>
                <button
                  type="button"
                  data-action="open-create-conv"
                  onClick={() => setCreateExpanded((prev) => !prev)}
                  className="shrink-0 cursor-pointer rounded-[6px] bg-[#362B4A] px-2 py-0.5 text-[10.5px] font-medium text-[#DCD7E5] transition-colors hover:bg-[#493B62] hover:text-white"
                >
                  {createExpanded ? t.cancel : `+ ${t.createConvTitle}`}
                </button>
              </div>

              <div className="nc-scroll max-h-[144px] space-y-1 pr-0.5">
                {conversations.map((conv) => {
                  const active = conv.id === activeConversationId;
                  return (
                    <div
                      key={conv.id}
                      className={`group flex items-center justify-between gap-1.5 rounded-[7px] px-2.5 py-2 text-[12.5px] transition-colors ${
                        active
                          ? 'bg-[#463A5D] text-white'
                          : 'text-[#CFC7DD] hover:bg-[#332846] hover:text-white'
                      }`}
                    >
                      <button
                        type="button"
                        data-action={`select-conv-${conv.id}`}
                        onClick={() => onSelectConversation(conv.id)}
                        className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left"
                      >
                        <WorkChannelIcon size={14} />
                        <span className="truncate font-medium">{conv.title}</span>
                        {conv.isTemplate && (
                          <span className="shrink-0 rounded bg-[#2A213B] px-1.5 py-0.5 text-[9.5px] text-[#ACA1C2]">
                            {t.templateBadge}
                          </span>
                        )}
                      </button>
                      {!conv.isTemplate && (
                        <button
                          type="button"
                          aria-label={`${t.deleteMessageBtn}: ${conv.title}`}
                          onClick={() => onDeleteConversation(conv.id)}
                          className="shrink-0 cursor-pointer rounded p-0.5 text-[#9B90AD] opacity-70 transition-colors hover:bg-[#4F3B5F] hover:text-[#EB7F97] hover:opacity-100"
                        >
                          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                            <path
                              d="M3 3L9 9M9 3L3 9"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {createExpanded && (
                <form
                  onSubmit={handleCreateSubmit}
                  className="mt-2.5 space-y-2 rounded-[9px] border border-[#3C3052] bg-[#2D233E] p-2.5"
                >
                  <input
                    type="text"
                    data-action="new-conv-title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder={t.createConvPlaceholder}
                    className="h-[32px] w-full rounded-[6px] border border-[#47395E] bg-[#1E1729] px-2.5 text-[12px] text-[#EFEBF5] placeholder-[#827798] outline-none focus:border-[#64D2E6]/70"
                  />
                  <label className="flex cursor-pointer items-center gap-2 text-[11px] text-[#BEB5D0]">
                    <input
                      type="checkbox"
                      checked={fromTemplate}
                      onChange={(e) => setFromTemplate(e.target.checked)}
                      className="h-3.5 w-3.5 rounded accent-[#64D2E6]"
                    />
                    <span>{t.copyTemplateLabel}</span>
                  </label>
                  <button
                    type="submit"
                    data-action="confirm-create-conv"
                    className="h-[30px] w-full cursor-pointer rounded-[6px] bg-[#52436B] text-[12px] font-medium text-white transition-colors hover:bg-[#625180]"
                  >
                    {t.createConvBtn}
                  </button>
                </form>
              )}

              <div className="mt-3 space-y-2.5 rounded-[9px] border border-[#362B49] bg-[#2C223C]/80 p-2.5">
                <div className="space-y-1.5">
                  <span className="block text-[10.5px] font-medium text-[#A499B8]">
                    {t.langLabel}
                  </span>
                  <div className="grid grid-cols-3 gap-0.5 rounded-[6px] bg-[#1E172A] p-0.5">
                    <button
                      type="button"
                      data-action="lang-zh"
                      onClick={() => onSelectLanguage('zh')}
                      className={`cursor-pointer whitespace-nowrap rounded-[5px] px-1.5 py-1 text-center text-[10.5px] font-medium transition-colors ${
                        lang === 'zh'
                          ? 'bg-[#4C3E65] text-white'
                          : 'text-[#9B90AD] hover:text-white'
                      }`}
                    >
                      中文
                    </button>
                    <button
                      type="button"
                      data-action="lang-ja"
                      onClick={() => onSelectLanguage('ja')}
                      className={`cursor-pointer whitespace-nowrap rounded-[5px] px-1.5 py-1 text-center text-[10.5px] font-medium transition-colors ${
                        lang === 'ja'
                          ? 'bg-[#4C3E65] text-white'
                          : 'text-[#9B90AD] hover:text-white'
                      }`}
                    >
                      日本語
                    </button>
                    <button
                      type="button"
                      data-action="lang-en"
                      onClick={() => onSelectLanguage('en')}
                      className={`cursor-pointer whitespace-nowrap rounded-[5px] px-1.5 py-1 text-center text-[10.5px] font-medium transition-colors ${
                        lang === 'en'
                          ? 'bg-[#4C3E65] text-white'
                          : 'text-[#9B90AD] hover:text-white'
                      }`}
                    >
                      EN
                    </button>
                  </div>
                </div>

                <div className="h-px w-full bg-[#3A2E4F]" />

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    data-action="export-local-data"
                    onClick={onExportData}
                    className="flex h-[30px] cursor-pointer items-center justify-center gap-1.5 rounded-[6px] bg-[#362B4A] px-2 text-[11.5px] font-medium text-[#E0DBEB] transition-colors hover:bg-[#46385F] hover:text-white"
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path
                        d="M8 2.5V10.5M8 10.5L5 7.5M8 10.5L11 7.5M3 13H13"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="truncate">{t.exportDataBtn}</span>
                  </button>
                  <button
                    type="button"
                    data-action="import-local-data"
                    onClick={onTriggerImportData}
                    className="flex h-[30px] cursor-pointer items-center justify-center gap-1.5 rounded-[6px] bg-[#362B4A] px-2 text-[11.5px] font-medium text-[#E0DBEB] transition-colors hover:bg-[#46385F] hover:text-white"
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path
                        d="M8 10.5V2.5M8 2.5L5 5.5M8 2.5L11 5.5M3 13H13"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="truncate">{t.importDataBtn}</span>
                  </button>
                </div>

                <button
                  type="button"
                  data-action="clear-local-cache"
                  onClick={onRequestClearCache}
                  className="flex h-[28px] w-full cursor-pointer items-center justify-center gap-1.5 rounded-[6px] border border-[#5B354B]/70 bg-[#352030]/60 text-[11px] font-medium text-[#E7A3B4] transition-colors hover:border-[#EB7F97]/60 hover:bg-[#48273B] hover:text-[#FFD2DC]"
                >
                  <span>{t.clearCacheBtn}</span>
                </button>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <a
                  href="https://github.com/esahhk/nightcord_fan"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-action="link-github"
                  className="flex flex-col items-center justify-center gap-1.5 rounded-[8px] border border-[#382D4C] bg-[#2D233E]/85 px-2 py-2.5 text-[#DCD7E5] transition-colors hover:border-[#594A75] hover:bg-[#3A2D50] hover:text-white"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.55-1.14-4.55-5.08 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.05A9.38 9.38 0 0 1 12 6.84c.85 0 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.46.1 2.72.64.72 1.03 1.64 1.03 2.76 0 3.95-2.34 4.82-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.6.69.49A10.22 10.22 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z" />
                  </svg>
                  <span className="text-[10.5px] font-medium leading-none text-[#BEB5D0]">
                    {t.githubLabel}
                  </span>
                </a>

                <a
                  href="https://space.bilibili.com/2058030122"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-action="link-bilibili"
                  className="flex flex-col items-center justify-center gap-1.5 rounded-[8px] border border-[#382D4C] bg-[#2D233E]/85 px-2 py-2.5 text-[#DCD7E5] transition-colors hover:border-[#EB7F97]/55 hover:bg-[#3A2D50] hover:text-white"
                >
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
                  <span className="text-[10.5px] font-medium leading-none text-[#BEB5D0]">
                    {t.bilibiliLabel}
                  </span>
                </a>

                <a
                  href="https://esahhk.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-action="link-homepage"
                  className="flex flex-col items-center justify-center gap-1.5 rounded-[8px] border border-[#382D4C] bg-[#2D233E]/85 px-2 py-2.5 text-[#DCD7E5] transition-colors hover:border-[#594A75] hover:bg-[#3A2D50] hover:text-white"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
                    <path
                      d="M3.5 12H20.5M12 3C14.5 5.4 15.8 8.5 15.8 12C15.8 15.5 14.5 18.6 12 21C9.5 18.6 8.2 15.5 8.2 12C8.2 8.5 9.5 5.4 12 3Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-[10.5px] font-medium leading-none text-[#BEB5D0]">
                    {t.homepageLabel}
                  </span>
                </a>

                <button
                  type="button"
                  data-action="open-tutorial"
                  onClick={onOpenTutorial}
                  className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[8px] border border-[#382D4C] bg-[#2D233E]/85 px-2 py-2.5 text-[#DCD7E5] transition-colors hover:border-[#64D2E6]/60 hover:bg-[#3A2D50] hover:text-white"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M4.5 6.5C4.5 5.4 5.4 4.5 6.5 4.5H11.5C12.6 4.5 13.5 5.4 13.5 6.5V19.5C13.5 18.7 12.8 18 12 18H6.5C5.4 18 4.5 17.1 4.5 16V6.5Z"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M19.5 6.5C19.5 5.4 18.6 4.5 17.5 4.5H15C14.2 4.5 13.5 5.2 13.5 6V19.5C13.5 18.7 14.2 18 15 18H17.5C18.6 18 19.5 17.1 19.5 16V6.5Z"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-[10.5px] font-medium leading-none text-[#BEB5D0]">
                    {t.tutorialLabel}
                  </span>
                </button>
              </div>

              <button
                type="button"
                data-action="open-ui-template"
                onClick={onOpenTemplatePage}
                className="mt-2 flex h-[32px] w-full cursor-pointer items-center justify-between rounded-[8px] border border-[#382D4C] bg-[#2D233E]/85 px-2.5 text-[11.5px] font-medium text-[#DCD7E5] transition-colors hover:border-[#64D2E6]/60 hover:bg-[#3A2D50] hover:text-white"
              >
                <span className="flex items-center gap-2 truncate">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M8.5 8L4.5 12L8.5 16M15.5 8L19.5 12L15.5 16M13.5 6L10.5 18"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="truncate">{t.templatePageBtn}</span>
                </span>
                <span className="shrink-0 text-[11px] text-[#64D2E6]">→</span>
              </button>

              <div className="mt-2.5 flex items-center justify-center gap-1.5 border-t border-[#342946] pt-2 text-[10.5px] text-[#8E83A3]">
                <span>{t.reportIssueLabel}:</span>
                <a
                  href="mailto:esahhk@outlook.com"
                  className="text-[#AEA3C4] underline decoration-[#594B72] underline-offset-2 transition-colors hover:text-white"
                >
                  esahhk@outlook.com
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="nc-scroll flex flex-1 flex-col pt-3 pb-16">
          <div className="px-2.5">
            <button
              type="button"
              data-action="channel-work"
              aria-label={`チャンネル：${activeChannelTitle}`}
              onClick={() => onChannelSelect(activeConversationId)}
              className="flex h-[34px] w-full cursor-pointer items-center gap-2.5 rounded-[6px] bg-[#3E3252] px-2.5 text-left text-[13.5px] font-medium text-[#FFFFFF] transition-colors hover:bg-[#493B5E]"
            >
              <WorkChannelIcon size={19} />
              <span className="truncate">{activeChannelTitle}</span>
            </button>
          </div>

          {onlineMembers.length > 0 && (
            <div className="mt-2.5 flex flex-col gap-0.5">
              {onlineMembers.map((member) => (
                <div
                  key={member.id}
                  data-member-row={member.id}
                  data-member-status={member.status}
                  onPointerDown={(e) =>
                    startMemberLongPress(member.id, e.clientX, e.clientY, e.currentTarget)
                  }
                  onPointerMove={(e) => handleMemberPointerMove(e.clientX, e.clientY)}
                  onPointerUp={clearLongPress}
                  onPointerLeave={clearLongPress}
                  onPointerCancel={clearLongPress}
                  onContextMenu={(e) => {
                    if (mode === 'studio') {
                      e.preventDefault();
                      window.getSelection?.()?.removeAllRanges();
                      openMemberMenu(member.id, e.currentTarget);
                    }
                  }}
                  className={`relative mx-1.5 flex h-[36px] touch-manipulation select-none items-center justify-between rounded-[6px] pl-4 pr-3 ${
                    memberMenuId === member.id ? 'z-40' : ''
                  }`}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2.5 py-1">
                    <CharacterAvatar
                      avatarType={member.avatar}
                      customAvatarMediaId={member.customAvatarMediaId}
                      size={25}
                      showOnlineDot={true}
                      isOnline={true}
                    />
                    <span className="truncate text-[13px] font-medium text-[#ECE8F4]">
                      {member.name}
                    </span>
                  </div>
                  {renderStatusPopover(member)}
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            data-action="voice-category"
            aria-expanded={voiceExpanded}
            onClick={onVoiceToggle}
            className="mt-4 mb-1.5 flex w-full cursor-pointer items-center gap-1.5 px-3.5 text-left text-[11px] font-medium tracking-[0.02em] text-[#9E95B0] transition-colors hover:text-[#CFC8DC]"
          >
            <span
              className={`inline-block text-[10px] transition-transform duration-150 ${
                voiceExpanded ? 'rotate-0' : '-rotate-90'
              }`}
              aria-hidden="true"
            >
              &gt;
            </span>
            <span>ボイスチャット</span>
          </button>

          {voiceExpanded && (
            <div className="mb-3 flex flex-col gap-0.5">
              {voiceMembers.map((member) => (
                <div
                  key={member.id}
                  data-member-row={member.id}
                  data-member-status={member.status}
                  onPointerDown={(e) =>
                    startMemberLongPress(member.id, e.clientX, e.clientY, e.currentTarget)
                  }
                  onPointerMove={(e) => handleMemberPointerMove(e.clientX, e.clientY)}
                  onPointerUp={clearLongPress}
                  onPointerLeave={clearLongPress}
                  onPointerCancel={clearLongPress}
                  onContextMenu={(e) => {
                    if (mode === 'studio') {
                      e.preventDefault();
                      window.getSelection?.()?.removeAllRanges();
                      openMemberMenu(member.id, e.currentTarget);
                    }
                  }}
                  className={`relative mx-1.5 flex h-[36px] touch-manipulation select-none items-center justify-between rounded-[6px] pl-4 pr-3 ${
                    memberMenuId === member.id ? 'z-40' : ''
                  }`}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2.5 py-1">
                    <CharacterAvatar
                      avatarType={member.avatar}
                      customAvatarMediaId={member.customAvatarMediaId}
                      size={25}
                      showOnlineDot={true}
                      isOnline={true}
                    />
                    <span className="truncate text-[13px] font-medium text-[#DCD7E5]">
                      {member.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    data-action={`mic-${member.id}`}
                    aria-label={`${member.name}のマイク切替`}
                    aria-pressed={member.muted}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => onMicToggle(member)}
                    className={`flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded transition-colors ${
                      member.muted
                        ? 'text-[#EB7F97] hover:bg-[#3A2E4D]'
                        : 'text-[#8F85A3] hover:bg-[#3A2E4D] hover:text-[#D5CEE2]'
                    }`}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="9" y="2.5" width="6" height="11.5" rx="3" fill="currentColor" />
                      <path
                        d="M5.5 11.5a6.5 6.5 0 0 0 13 0"
                        stroke="currentColor"
                        strokeWidth="2.1"
                        strokeLinecap="round"
                      />
                      <line
                        x1="12"
                        y1="18"
                        x2="12"
                        y2="21.5"
                        stroke="currentColor"
                        strokeWidth="2.1"
                        strokeLinecap="round"
                      />
                      <line
                        x1="8.5"
                        y1="21.5"
                        x2="15.5"
                        y2="21.5"
                        stroke="currentColor"
                        strokeWidth="2.1"
                        strokeLinecap="round"
                      />
                      {member.muted && (
                        <line
                          x1="4"
                          y1="4"
                          x2="20"
                          y2="20"
                          stroke="#EB7F97"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                        />
                      )}
                    </svg>
                  </button>
                  {renderStatusPopover(member)}
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            data-action="offline-category"
            aria-expanded={offlineExpanded}
            onClick={onOfflineToggle}
            className="mt-1 mb-1.5 flex w-full cursor-pointer items-center gap-1.5 px-3.5 text-left text-[11px] font-medium tracking-[0.02em] text-[#9E95B0] transition-colors hover:text-[#CFC8DC]"
          >
            <span
              className={`inline-block text-[10px] transition-transform duration-150 ${
                offlineExpanded ? 'rotate-0' : '-rotate-90'
              }`}
              aria-hidden="true"
            >
              &gt;
            </span>
            <span>オフライン</span>
          </button>

          {offlineExpanded && offlineMembers.length > 0 && (
            <div className="mb-3 flex flex-col gap-0.5">
              {offlineMembers.map((member) => (
                <div
                  key={member.id}
                  data-member-row={member.id}
                  data-member-status={member.status}
                  onPointerDown={(e) =>
                    startMemberLongPress(member.id, e.clientX, e.clientY, e.currentTarget)
                  }
                  onPointerMove={(e) => handleMemberPointerMove(e.clientX, e.clientY)}
                  onPointerUp={clearLongPress}
                  onPointerLeave={clearLongPress}
                  onPointerCancel={clearLongPress}
                  onContextMenu={(e) => {
                    if (mode === 'studio') {
                      e.preventDefault();
                      window.getSelection?.()?.removeAllRanges();
                      openMemberMenu(member.id, e.currentTarget);
                    }
                  }}
                  className={`relative mx-1.5 flex h-[36px] touch-manipulation select-none items-center justify-between rounded-[6px] pl-4 pr-3 ${
                    memberMenuId === member.id ? 'z-40' : ''
                  }`}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2.5 py-1">
                    <CharacterAvatar
                      avatarType={member.avatar}
                      customAvatarMediaId={member.customAvatarMediaId}
                      size={25}
                      showOnlineDot={false}
                      isOnline={false}
                      className="opacity-50"
                    />
                    <span className="truncate text-[13px] font-medium text-[#8B819F]">
                      {member.name}
                    </span>
                  </div>
                  {renderStatusPopover(member)}
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
