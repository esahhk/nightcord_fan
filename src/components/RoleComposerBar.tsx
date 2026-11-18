import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import type {
  AvatarType,
  CharacterProfile,
  CustomMessageTime,
  UiLanguage,
} from '../types/nightcord';
import { getUiText } from '../utils/i18n';
import { saveLocalMediaBlob } from '../utils/localStorageStore';
import {
  formatCustomJapaneseTime,
  formatDuration,
  parseJapaneseTimestampToMinutes,
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

interface RoleComposerBarProps {
  lang: UiLanguage;
  characters: CharacterProfile[];
  activeCharacter: CharacterProfile;
  isRecording: boolean;
  recordingSec: number;
  onSelectCharacter: (character: CharacterProfile) => void;
  onSaveCharacter: (draft: {
    id?: string;
    name: string;
    avatarType: AvatarType;
    customAvatarMediaId?: string;
  }) => void;
  onTriggerImageUpload: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onCancelRecording: () => void;
  onTriggerAudioFileUpload: () => void;
  customTime: CustomMessageTime;
  lastMessageTimestamp: string | null;
  onChangeCustomTime: (next: CustomMessageTime) => void;
  onSyncCustomTimeNow: () => void;
}

export function RoleComposerBar({
  lang,
  characters,
  activeCharacter,
  isRecording,
  recordingSec,
  onSelectCharacter,
  onSaveCharacter,
  onTriggerImageUpload,
  onStartRecording,
  onStopRecording,
  onCancelRecording,
  onTriggerAudioFileUpload,
  customTime,
  lastMessageTimestamp,
  onChangeCustomTime,
  onSyncCustomTimeNow,
}: RoleComposerBarProps) {
  const t = getUiText(lang);
  const [editorMode, setEditorMode] = useState<'closed' | 'edit' | 'create'>('closed');
  const [timePanelOpen, setTimePanelOpen] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftAvatarType, setDraftAvatarType] = useState<AvatarType>('k');
  const [draftCustomMediaId, setDraftCustomMediaId] = useState<string | undefined>(undefined);
  const avatarFileRef = useRef<HTMLInputElement | null>(null);

  const formattedCustomTs = formatCustomJapaneseTime(customTime.day, customTime.time);
  const customMin = formattedCustomTs ? parseJapaneseTimestampToMinutes(formattedCustomTs) : null;
  const lastMin = lastMessageTimestamp
    ? parseJapaneseTimestampToMinutes(lastMessageTimestamp)
    : null;
  const isEarlierThanPrevious =
    customTime.enabled &&
    (customMin === null || (lastMin !== null && customMin < lastMin));

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

  return (
    <div className="mb-2 flex flex-col gap-2 rounded-[8px] border border-[#4D3F66] bg-[#2E243D] p-2.5">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full min-w-0 items-center gap-1.5 overflow-x-auto pb-0.5 lg:w-auto lg:flex-1">
          {characters.map((char) => {
            const active = char.id === activeCharacter.id;
            return (
              <button
                key={char.id}
                type="button"
                data-action={`select-char-${char.id}`}
                aria-pressed={active}
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
          {!isRecording ? (
            <>
              <button
                type="button"
                data-action="record-voice"
                aria-label={t.recordVoice}
                onClick={onStartRecording}
                className="cursor-pointer rounded-[6px] border border-[#524468] bg-[#362B47] px-2 py-1 text-[11.5px] font-medium text-[#DCD7E5] transition-colors hover:bg-[#473A5C] hover:text-white"
              >
                {t.recordVoice}
              </button>
              <button
                type="button"
                data-action="upload-audio"
                aria-label={t.audioFile}
                onClick={onTriggerAudioFileUpload}
                className="cursor-pointer rounded-[6px] border border-[#524468] bg-[#362B47] px-2 py-1 text-[11.5px] font-medium text-[#DCD7E5] transition-colors hover:bg-[#473A5C] hover:text-white"
              >
                {t.audioFile}
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
                {customTime.enabled && formattedCustomTs ? formattedCustomTs : t.timeBtnLabel}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1.5 rounded-[6px] border border-[#EB7F97]/60 bg-[#3B2335] px-2 py-1 text-[11.5px] text-[#FFE4EA]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#EB7F97]" />
              <span className="tabular-nums">
                {t.recording} {formatDuration(recordingSec)}
              </span>
              <button
                type="button"
                data-action="stop-record-voice"
                onClick={onStopRecording}
                className="cursor-pointer rounded bg-[#EB7F97] px-2 py-0.5 text-[11px] font-bold text-[#211A2C] hover:brightness-110"
              >
                {t.send}
              </button>
              <button
                type="button"
                data-action="cancel-record-voice"
                onClick={onCancelRecording}
                className="cursor-pointer rounded px-1.5 py-0.5 text-[11px] text-[#DCD7E5] hover:text-white"
              >
                {t.stopCancel}
              </button>
            </div>
          )}
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
              <div className="flex overflow-hidden rounded-[6px] border border-[#4D3F66] bg-[#332844]">
                <button
                  type="button"
                  data-action="custom-time-day-yesterday"
                  aria-pressed={customTime.day === 'yesterday'}
                  onClick={() =>
                    onChangeCustomTime({ ...customTime, enabled: true, day: 'yesterday' })
                  }
                  className={`cursor-pointer px-2 py-1 text-[11.5px] font-medium transition-colors ${
                    customTime.day === 'yesterday'
                      ? 'bg-[#473A5C] text-white'
                      : 'text-[#9A90A8] hover:text-white'
                  }`}
                >
                  昨日
                </button>
                <button
                  type="button"
                  data-action="custom-time-day-today"
                  aria-pressed={customTime.day === 'today'}
                  onClick={() =>
                    onChangeCustomTime({ ...customTime, enabled: true, day: 'today' })
                  }
                  className={`cursor-pointer px-2 py-1 text-[11.5px] font-medium transition-colors ${
                    customTime.day === 'today'
                      ? 'bg-[#473A5C] text-white'
                      : 'text-[#9A90A8] hover:text-white'
                  }`}
                >
                  今日
                </button>
              </div>

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
            {isEarlierThanPrevious && lastMessageTimestamp
              ? t.timeEarlierError(lastMessageTimestamp)
              : lastMessageTimestamp
                ? t.timeMinHint(lastMessageTimestamp)
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
