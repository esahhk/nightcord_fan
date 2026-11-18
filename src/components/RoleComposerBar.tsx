import { useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import type {
  AvatarType,
  CharacterProfile,
  CustomMessageTime,
  MessageDateTime,
  UiLanguage,
} from '../types/nightcord';
import { getUiText } from '../utils/i18n';
import { saveLocalMediaBlob } from '../utils/localStorageStore';
import {
  dateTimeToEpochMinutes,
  formatDateTimeBadge,
  getDaysInMonth,
  parseCustomDateTimeInput,
} from '../utils/nightcordState';
import { CharacterAvatar } from './LocalMedia';
import { NightcordAvatar } from './NightcordArt';

const AVATAR_PRESETS: { type: AvatarType; label: string }[] = [
  { type: 'k', label: 'K（紫）' },
  { type: 'k-pink', label: 'K（桃）' },
  { type: 'yuki', label: '雪' },
  { type: 'enanan', label: 'えななん' },
  { type: 'amia', label: 'Amia' },
];

const YEARS_LIST: number[] = Array.from({ length: 1001 }, (_, idx) => 2000 + idx);
const MONTHS_LIST: number[] = Array.from({ length: 12 }, (_, idx) => idx + 1);

interface RoleComposerBarProps {
  lang: UiLanguage;
  characters: CharacterProfile[];
  activeCharacter: CharacterProfile;
  onSelectCharacter: (character: CharacterProfile) => void;
  onSaveCharacter: (draft: {
    id?: string;
    name: string;
    avatarType: AvatarType;
    customAvatarMediaId?: string;
  }) => void;
  onMentionCharacter: (name: string) => void;
  onTriggerImageUpload: () => void;
  onTriggerVideoUpload: () => void;
  onTriggerAudioUpload: () => void;
  customTime: CustomMessageTime;
  lastMessageDateTime: MessageDateTime | null;
  onChangeCustomTime: (next: CustomMessageTime) => void;
  onSyncCustomTimeNow: () => void;
}

export function RoleComposerBar({
  lang,
  characters,
  activeCharacter,
  onSelectCharacter,
  onSaveCharacter,
  onMentionCharacter,
  onTriggerImageUpload,
  onTriggerVideoUpload,
  onTriggerAudioUpload,
  customTime,
  lastMessageDateTime,
  onChangeCustomTime,
  onSyncCustomTimeNow,
}: RoleComposerBarProps) {
  const t = getUiText(lang);
  const [editorMode, setEditorMode] = useState<'closed' | 'edit' | 'create'>('closed');
  const [timePanelOpen, setTimePanelOpen] = useState(false);
  const [charMenuId, setCharMenuId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftAvatarType, setDraftAvatarType] = useState<AvatarType>('k');
  const [draftCustomMediaId, setDraftCustomMediaId] = useState<string | undefined>(undefined);
  const avatarFileRef = useRef<HTMLInputElement | null>(null);
  const longPressTimerRef = useRef<number | null>(null);

  const daysList = useMemo(
    () => Array.from({ length: getDaysInMonth(customTime.year, customTime.month) }, (_, i) => i + 1),
    [customTime.year, customTime.month]
  );

  const parsedCustom = parseCustomDateTimeInput(customTime);
  const isEarlierThanPrevious =
    customTime.enabled &&
    (!parsedCustom ||
      (lastMessageDateTime !== null &&
        dateTimeToEpochMinutes(parsedCustom) < dateTimeToEpochMinutes(lastMessageDateTime)));
  const minTimeLabel = lastMessageDateTime ? formatDateTimeBadge(lastMessageDateTime) : null;

  const clearLongPress = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const startCharLongPress = (charId: string) => {
    clearLongPress();
    longPressTimerRef.current = window.setTimeout(() => {
      setCharMenuId(charId);
    }, 450);
  };

  const openEdit = () => {
    setDraftName(activeCharacter.name);
    setDraftAvatarType(activeCharacter.avatarType);
    setDraftCustomMediaId(activeCharacter.customAvatarMediaId);
    setEditorMode('edit');
  };

  const openCreate = () => {
    setDraftName('');
    setDraftAvatarType('k');
    setDraftCustomMediaId(undefined);
    setEditorMode('create');
  };

  const handleAvatarFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }
    const mediaId = `avatar-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    await saveLocalMediaBlob(mediaId, file);
    setDraftCustomMediaId(mediaId);
  };

  const handleSave = () => {
    if (!draftName.trim()) {
      return;
    }
    onSaveCharacter({
      id: editorMode === 'edit' ? activeCharacter.id : undefined,
      name: draftName,
      avatarType: draftAvatarType,
      customAvatarMediaId: draftCustomMediaId,
    });
    setEditorMode('closed');
  };

  const updateYearOrMonth = (nextYear: number, nextMonth: number) => {
    const maxDay = getDaysInMonth(nextYear, nextMonth);
    onChangeCustomTime({
      ...customTime,
      enabled: true,
      year: nextYear,
      month: nextMonth,
      day: Math.min(customTime.day, maxDay),
    });
  };

  return (
    <div className="mb-2 flex flex-col gap-2 rounded-[8px] border border-[#4D3F66] bg-[#2E243D] p-2.5">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full min-w-0 items-center gap-1.5 overflow-x-auto pb-0.5 lg:w-auto lg:flex-1">
          {characters.map((char) => {
            const active = char.id === activeCharacter.id;
            return (
              <div key={char.id} className="relative shrink-0">
                <button
                  type="button"
                  data-action={`select-char-${char.id}`}
                  aria-pressed={active}
                  onPointerDown={() => startCharLongPress(char.id)}
                  onPointerUp={clearLongPress}
                  onPointerLeave={clearLongPress}
                  onPointerCancel={clearLongPress}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setCharMenuId(char.id);
                  }}
                  onClick={() => onSelectCharacter(char)}
                  className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-[6px] px-2 py-1 text-[12px] font-medium transition-colors ${
                    active
                      ? 'bg-[#473A5C] text-white ring-1 ring-[#64D2E6]/60'
                      : 'bg-[#362B47] text-[#C2B8D3] hover:bg-[#413455] hover:text-white'
                  }`}
                >
                  <CharacterAvatar
                    avatarType={char.avatarType}
                    customAvatarMediaId={char.customAvatarMediaId}
                    size={18}
                  />
                  <span className="max-w-[90px] truncate">{char.name}</span>
                </button>
                {charMenuId === char.id && (
                  <>
                    <button
                      type="button"
                      aria-label="閉じる"
                      onClick={() => setCharMenuId(null)}
                      className="fixed inset-0 z-40 cursor-default bg-transparent"
                    />
                    <div className="nc-modal-enter absolute bottom-[34px] left-0 z-50 min-w-[116px] rounded-[8px] border border-[#524468] bg-[#211A2C] p-1 shadow-[0_10px_28px_rgba(0,0,0,0.55)]">
                      <button
                        type="button"
                        data-action={`char-mention-${char.id}`}
                        onClick={() => {
                          onMentionCharacter(char.name);
                          setCharMenuId(null);
                        }}
                        className="w-full cursor-pointer rounded-[6px] px-2.5 py-1.5 text-left text-[12px] font-medium text-[#EFEBF5] transition-colors hover:bg-[#473A5C]"
                      >
                        {t.mentionTargetBtn(char.name)}
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 lg:shrink-0">
          <button
            type="button"
            data-action="char-edit"
            onClick={openEdit}
            className="cursor-pointer rounded-[6px] border border-[#524468] bg-[#362B47] px-2 py-1 text-[11.5px] font-medium text-[#DCD7E5] transition-colors hover:bg-[#473A5C] hover:text-white"
          >
            {t.editChar}
          </button>
          <button
            type="button"
            data-action="char-create"
            onClick={openCreate}
            className="cursor-pointer rounded-[6px] border border-[#524468] bg-[#362B47] px-2 py-1 text-[11.5px] font-medium text-[#DCD7E5] transition-colors hover:bg-[#473A5C] hover:text-white"
          >
            {t.addChar}
          </button>
          <button
            type="button"
            data-action="send-image"
            aria-label={t.sendImage}
            onClick={onTriggerImageUpload}
            className="cursor-pointer rounded-[6px] border border-[#524468] bg-[#362B47] px-2 py-1 text-[11.5px] font-medium text-[#DCD7E5] transition-colors hover:bg-[#473A5C] hover:text-white"
          >
            {t.sendImage}
          </button>
          <button
            type="button"
            data-action="send-mp4"
            aria-label={t.sendMp4}
            onClick={onTriggerVideoUpload}
            className="cursor-pointer rounded-[6px] border border-[#524468] bg-[#362B47] px-2 py-1 text-[11.5px] font-medium text-[#DCD7E5] transition-colors hover:bg-[#473A5C] hover:text-white"
          >
            {t.sendMp4}
          </button>
          <button
            type="button"
            data-action="send-mp3"
            aria-label={t.sendMp3}
            onClick={onTriggerAudioUpload}
            className="cursor-pointer rounded-[6px] border border-[#524468] bg-[#362B47] px-2 py-1 text-[11.5px] font-medium text-[#DCD7E5] transition-colors hover:bg-[#473A5C] hover:text-white"
          >
            {t.sendMp3}
          </button>
          <button
            type="button"
            data-action="toggle-custom-time"
            aria-expanded={timePanelOpen}
            onClick={() => setTimePanelOpen((prev) => !prev)}
            className={`cursor-pointer rounded-[6px] border px-2 py-1 text-[11.5px] font-medium transition-colors ${
              isEarlierThanPrevious
                ? 'border-[#EB7F97] bg-[#4B2538] text-[#FFD5DF]'
                : customTime.enabled
                  ? 'border-[#64D2E6]/70 bg-[#473A5C] text-white'
                  : 'border-[#524468] bg-[#362B47] text-[#DCD7E5] hover:bg-[#473A5C] hover:text-white'
            }`}
          >
            {customTime.enabled && parsedCustom
              ? formatDateTimeBadge(parsedCustom)
              : t.timeBtnLabel}
          </button>
        </div>
      </div>

      {timePanelOpen && (
        <div className="flex flex-col gap-2 rounded-[6px] border border-[#453859] bg-[#261D33] px-2.5 py-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="flex cursor-pointer items-center gap-1.5 text-[12px] font-medium text-[#EFEBF5]">
              <input
                type="checkbox"
                data-action="custom-time-enable"
                checked={customTime.enabled}
                onChange={(e) =>
                  onChangeCustomTime({ ...customTime, enabled: e.target.checked })
                }
                className="accent-[#64D2E6]"
              />
              <span>{t.timeCustomToggle}</span>
            </label>

            <div className="flex flex-wrap items-center gap-1.5">
              <select
                data-action="custom-time-year"
                aria-label={t.yearUnit}
                value={customTime.year}
                onChange={(e) => updateYearOrMonth(Number(e.target.value), customTime.month)}
                className="cursor-pointer rounded-[6px] border border-[#4D3F66] bg-[#332844] px-2 py-1 text-[12px] text-[#EFEBF5] outline-none focus:border-[#64D2E6]"
              >
                {YEARS_LIST.map((y) => (
                  <option key={y} value={y}>
                    {y}
                    {t.yearUnit}
                  </option>
                ))}
              </select>

              <select
                data-action="custom-time-month"
                aria-label={t.monthUnit}
                value={customTime.month}
                onChange={(e) => updateYearOrMonth(customTime.year, Number(e.target.value))}
                className="cursor-pointer rounded-[6px] border border-[#4D3F66] bg-[#332844] px-2 py-1 text-[12px] text-[#EFEBF5] outline-none focus:border-[#64D2E6]"
              >
                {MONTHS_LIST.map((m) => (
                  <option key={m} value={m}>
                    {m}
                    {t.monthUnit}
                  </option>
                ))}
              </select>

              <select
                data-action="custom-time-day"
                aria-label={t.dayUnit}
                value={customTime.day}
                onChange={(e) =>
                  onChangeCustomTime({
                    ...customTime,
                    enabled: true,
                    day: Number(e.target.value),
                  })
                }
                className="cursor-pointer rounded-[6px] border border-[#4D3F66] bg-[#332844] px-2 py-1 text-[12px] text-[#EFEBF5] outline-none focus:border-[#64D2E6]"
              >
                {daysList.map((d) => (
                  <option key={d} value={d}>
                    {d}
                    {t.dayUnit}
                  </option>
                ))}
              </select>

              <input
                type="time"
                data-action="custom-time-input"
                aria-label={t.timeCustomToggle}
                value={customTime.time}
                onChange={(e) =>
                  onChangeCustomTime({
                    ...customTime,
                    enabled: true,
                    time: e.target.value,
                  })
                }
                className={`rounded-[6px] border bg-[#332844] px-2 py-1 text-[12px] text-[#EFEBF5] outline-none ${
                  isEarlierThanPrevious
                    ? 'border-[#EB7F97] focus:border-[#EB7F97]'
                    : 'border-[#4D3F66] focus:border-[#64D2E6]'
                }`}
              />

              <button
                type="button"
                data-action="custom-time-sync"
                onClick={onSyncCustomTimeNow}
                className="cursor-pointer rounded-[6px] border border-[#4D3F66] bg-[#332844] px-2 py-1 text-[11px] text-[#C2B8D3] hover:bg-[#473A5C] hover:text-white"
              >
                {t.timeResetNow}
              </button>
            </div>
          </div>

          <div
            className={`text-[11px] ${
              isEarlierThanPrevious ? 'font-medium text-[#FF9EB3]' : 'text-[#9A90A8]'
            }`}
          >
            {isEarlierThanPrevious && minTimeLabel
              ? t.timeEarlierError(minTimeLabel)
              : minTimeLabel
                ? t.timeMinHint(minTimeLabel)
                : t.timeAnyHint}
          </div>
        </div>
      )}

      {editorMode !== 'closed' && (
        <div className="flex flex-col gap-2.5 rounded-[6px] border border-[#453859] bg-[#261D33] p-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <CharacterAvatar
              avatarType={draftAvatarType}
              customAvatarMediaId={draftCustomMediaId}
              size={30}
            />
            <input
              type="text"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              aria-label={t.charNamePlaceholder}
              placeholder={t.charNamePlaceholder}
              className="min-w-[140px] flex-1 rounded-[6px] border border-[#453859] bg-[#332844] px-2.5 py-1.5 text-[13px] text-[#EFEBF5] outline-none focus:border-[#64D2E6]"
            />
            <input
              ref={avatarFileRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarFileChange}
              className="hidden"
            />
            <button
              type="button"
              data-action="char-avatar-upload"
              onClick={() => avatarFileRef.current?.click()}
              className="cursor-pointer rounded-[6px] border border-[#524468] bg-[#362B47] px-2.5 py-1.5 text-[11.5px] text-[#DCD7E5] hover:bg-[#473A5C] hover:text-white"
            >
              {t.chooseImage}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {AVATAR_PRESETS.map((preset) => {
                const selected = !draftCustomMediaId && draftAvatarType === preset.type;
                return (
                  <button
                    key={preset.type}
                    type="button"
                    aria-label={preset.label}
                    onClick={() => {
                      setDraftAvatarType(preset.type);
                      setDraftCustomMediaId(undefined);
                    }}
                    className={`flex cursor-pointer items-center gap-1 rounded-[6px] px-1.5 py-1 text-[11px] transition-colors ${
                      selected
                        ? 'bg-[#473A5C] text-white ring-1 ring-[#64D2E6]'
                        : 'bg-[#332844] text-[#9A90A8] hover:text-white'
                    }`}
                  >
                    <NightcordAvatar type={preset.type} size={18} />
                    <span>{preset.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                data-action="char-editor-cancel"
                onClick={() => setEditorMode('closed')}
                className="cursor-pointer rounded-[6px] px-2.5 py-1 text-[12px] text-[#9A90A8] hover:text-white"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                data-action="char-editor-save"
                onClick={handleSave}
                className="cursor-pointer rounded-[6px] bg-[#5C4D74] px-3 py-1 text-[12px] font-bold text-white hover:bg-[#6D5C8A]"
              >
                {editorMode === 'edit' ? t.save : t.add}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
