import { Fragment, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type {
  AppMode,
  AvatarType,
  CharacterProfile,
  ChatAttachment,
  ChatMessage,
  CustomMessageTime,
  MessageDateTime,
  UiLanguage,
} from '../types/nightcord';
import { getUiText } from '../utils/i18n';
import {
  CharacterAvatar,
  LocalFileMediaCard,
  LocalImageCard,
  LocalVoicePlayer,
} from './LocalMedia';
import { WorkChannelIcon } from './NightcordArt';
import { RoleComposerBar } from './RoleComposerBar';

interface ChatAreaProps {
  lang: UiLanguage;
  channelTitle: string;
  mode: AppMode;
  messages: ChatMessage[];
  characters: CharacterProfile[];
  activeCharacter: CharacterProfile;
  inputValue: string;
  formatActive: boolean;
  onOpenSidebar: () => void;
  onInputChange: (value: string) => void;
  onSubmitMessage: (event: FormEvent<HTMLFormElement>) => void;
  onChatHeaderClick: () => void;
  onMessageClick: (message: ChatMessage) => void;
  onDeleteMessage: (messageId: string) => void;
  onAvatarClick: (memberId: string, username: string) => void;
  onFileDownload: (file: ChatAttachment) => void;
  onMentionCharacter: (name: string) => void;
  onFormatClick: () => void;
  onEmojiClick: () => void;
  onAttachClick: () => void;
  onSelectCharacter: (character: CharacterProfile) => void;
  onSaveCharacter: (draft: {
    id?: string;
    name: string;
    avatarType: AvatarType;
    customAvatarMediaId?: string;
  }) => void;
  onTriggerImageUpload: () => void;
  onTriggerVideoUpload: () => void;
  onTriggerAudioUpload: () => void;
  customTime: CustomMessageTime;
  lastMessageDateTime: MessageDateTime | null;
  onChangeCustomTime: (next: CustomMessageTime) => void;
  onSyncCustomTimeNow: () => void;
  isPlaying?: boolean;
  animatedFromIndex?: number | null;
  aiMode?: boolean;
  aiGeneratingName?: string | null;
  onEditMessage?: (messageId: string, nextText: string) => void;
  onRegenerateMessage?: (messageId: string) => void;
  onStopAi?: () => void;
}

export function ChatArea({
  lang,
  channelTitle,
  mode,
  messages,
  characters,
  activeCharacter,
  inputValue,
  formatActive,
  onOpenSidebar,
  onInputChange,
  onSubmitMessage,
  onChatHeaderClick,
  onMessageClick,
  onDeleteMessage,
  onAvatarClick,
  onFileDownload,
  onMentionCharacter,
  onFormatClick,
  onEmojiClick,
  onAttachClick,
  onSelectCharacter,
  onSaveCharacter,
  onTriggerImageUpload,
  onTriggerVideoUpload,
  onTriggerAudioUpload,
  customTime,
  lastMessageDateTime,
  onChangeCustomTime,
  onSyncCustomTimeNow,
  isPlaying = false,
  animatedFromIndex = null,
  aiMode = false,
  aiGeneratingName = null,
  onEditMessage,
  onRegenerateMessage,
  onStopAi,
}: ChatAreaProps) {
  const t = getUiText(lang);
  const canCompose = mode === 'studio' || aiMode;
  const streamRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const prevCountRef = useRef(messages.length);
  const longPressTimerRef = useRef<number | null>(null);

  const [previewImage, setPreviewImage] = useState<{ url: string; filename: string } | null>(null);
  const [previewVideo, setPreviewVideo] = useState<{ url: string; filename: string } | null>(null);
  const [mentionPickerOpen, setMentionPickerOpen] = useState(false);
  const [avatarMenuMsgId, setAvatarMenuMsgId] = useState<string | null>(null);
  const [avatarMenuFlipUp, setAvatarMenuFlipUp] = useState(false);
  const [deleteMenuMsgId, setDeleteMenuMsgId] = useState<string | null>(null);
  const [deleteMenuFlipUp, setDeleteMenuFlipUp] = useState(false);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState('');

  useEffect(() => {
    if (messages.length > prevCountRef.current && streamRef.current) {
      if (isPlaying) {
        streamRef.current.scrollTo({
          top: streamRef.current.scrollHeight,
          behavior: 'smooth',
        });
      } else {
        streamRef.current.scrollTop = streamRef.current.scrollHeight;
      }
    }
    prevCountRef.current = messages.length;
  }, [messages.length, isPlaying]);

  useEffect(() => {
    if (!canCompose) {
      setMentionPickerOpen(false);
      setAvatarMenuMsgId(null);
      setDeleteMenuMsgId(null);
      setEditingMsgId(null);
    }
  }, [canCompose]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPreviewImage(null);
        setPreviewVideo(null);
        setMentionPickerOpen(false);
        setAvatarMenuMsgId(null);
        setDeleteMenuMsgId(null);
        setEditingMsgId(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const pressOriginRef = useRef<{ x: number; y: number } | null>(null);
  const longPressTriggeredRef = useRef(false);

  const clearLongPress = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    pressOriginRef.current = null;
  };

  const handleLongPressMove = (x: number, y: number) => {
    const origin = pressOriginRef.current;
    if (!origin) {
      return;
    }
    if (Math.hypot(x - origin.x, y - origin.y) > 8) {
      clearLongPress();
    }
  };

  const shouldFlipMenuUp = (targetEl: HTMLElement | null, neededHeight: number): boolean => {
    if (!targetEl) {
      return false;
    }
    const rect = targetEl.getBoundingClientRect();
    const containerBottom = streamRef.current
      ? streamRef.current.getBoundingClientRect().bottom
      : window.innerHeight;
    const containerTop = streamRef.current
      ? streamRef.current.getBoundingClientRect().top
      : 0;
    const spaceBelow = containerBottom - rect.bottom;
    const spaceAbove = rect.top - containerTop;
    return spaceBelow < neededHeight && spaceAbove > spaceBelow;
  };

  const startLongPress = (callback: () => void, x: number, y: number) => {
    if (!canCompose) {
      return;
    }
    clearLongPress();
    longPressTriggeredRef.current = false;
    pressOriginRef.current = { x, y };
    longPressTimerRef.current = window.setTimeout(() => {
      window.getSelection?.()?.removeAllRanges();
      longPressTriggeredRef.current = true;
      callback();
      pressOriginRef.current = null;
    }, 450);
  };

  const handleMentionPick = (name: string) => {
    onMentionCharacter(name);
    setMentionPickerOpen(false);
    setAvatarMenuMsgId(null);
    inputRef.current?.focus();
  };

  const handleEmoji = () => {
    onEmojiClick();
    inputRef.current?.focus();
  };

  return (
    <main className="flex min-w-0 flex-1 flex-col bg-[#3F3352]">
      <header className="flex h-[52px] min-h-[52px] w-full shrink-0 select-none items-center justify-between gap-2 border-b border-[#2F2540] px-2.5 sm:px-5">
        <div className="flex min-w-0 items-center gap-1">
          <button
            type="button"
            data-action="sidebar-open"
            aria-label="チャンネル一覧を開く"
            onClick={onOpenSidebar}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md text-[#DCD7E5] transition-colors hover:bg-[#473A5C] hover:text-white md:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path
                d="M2.5 4.5H15.5M2.5 9H15.5M2.5 13.5H15.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button
            type="button"
            data-action="chat-header"
            aria-label={`チャンネルヘッダー：${channelTitle}`}
            onClick={onChatHeaderClick}
            className="flex min-w-0 cursor-pointer items-center gap-2.5 rounded-md bg-transparent px-1 py-1 text-left transition-opacity hover:opacity-85"
          >
            <WorkChannelIcon size={22} />
            <h1 className="truncate text-[15px] font-bold text-[#EFEBF5]">{channelTitle}</h1>
          </button>
        </div>
      </header>

      <div
        ref={streamRef}
        data-testid="message-stream"
        className="nc-scroll flex flex-1 flex-col gap-3.5 px-3.5 pt-3.5 pb-4 sm:gap-[15px] sm:px-6 sm:pt-4"
      >
        {messages.length === 0 ? (
          isPlaying ? null : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2.5 py-12 text-center text-[#9A90A8]">
              <WorkChannelIcon size={34} />
              <div className="text-[13.5px] font-semibold text-[#DCD7E5]">
                {aiMode ? t.aiEmptyTitle(channelTitle) : t.emptyConvTitle(channelTitle)}
              </div>
              <div className="max-w-[380px] px-4 text-[12px] leading-[1.5]">
                {aiMode ? t.aiEmptySub : t.emptyConvSub}
              </div>
            </div>
          )
        ) : (
          messages.map((msg, idx) => {
            const shouldAnimate = animatedFromIndex !== null && idx >= animatedFromIndex;
            const hasMedia = Boolean(
              msg.fileMedia || msg.imageMedia || msg.voiceMedia || (msg.attachments && msg.attachments.length > 0)
            );
            return (
              <Fragment key={msg.id}>
                {msg.dividerBefore && (
                  <div
                    className={`my-[3px] flex items-center gap-3.5 ${
                      shouldAnimate ? 'nc-msg-enter' : ''
                    }`}
                  >
                    <div className="h-px flex-1 bg-[#504266]" />
                    <span className="shrink-0 whitespace-nowrap text-[11px] font-medium text-[#9A90A8]">
                      {msg.dividerBefore}
                    </span>
                    <div className="h-px flex-1 bg-[#504266]" />
                  </div>
                )}

                <div
                  data-message-id={msg.id}
                  onPointerDown={(e) => {
                    const rowEl = e.currentTarget;
                    startLongPress(
                      () => {
                        setAvatarMenuMsgId(null);
                        setDeleteMenuFlipUp(shouldFlipMenuUp(rowEl, 130));
                        setDeleteMenuMsgId(msg.id);
                      },
                      e.clientX,
                      e.clientY
                    );
                  }}
                  onPointerMove={(e) => handleLongPressMove(e.clientX, e.clientY)}
                  onPointerUp={clearLongPress}
                  onPointerLeave={clearLongPress}
                  onPointerCancel={clearLongPress}
                  onContextMenu={(e) => {
                    if (canCompose) {
                      e.preventDefault();
                      window.getSelection?.()?.removeAllRanges();
                      setAvatarMenuMsgId(null);
                      setDeleteMenuFlipUp(shouldFlipMenuUp(e.currentTarget, 130));
                      setDeleteMenuMsgId(msg.id);
                    }
                  }}
                  className={`relative flex touch-manipulation select-none items-start gap-[13px] rounded-[6px] transition-colors hover:bg-[#2E243D]/30 ${
                    shouldAnimate ? 'nc-msg-enter' : ''
                  }`}
                >
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      data-action={`avatar-${msg.memberId}`}
                      aria-label={`${msg.username}のプロフィール`}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        if (msg.memberId === '__user__') {
                          return;
                        }
                        const btnEl = e.currentTarget;
                        startLongPress(
                          () => {
                            setDeleteMenuMsgId(null);
                            setAvatarMenuFlipUp(shouldFlipMenuUp(btnEl, 64));
                            setAvatarMenuMsgId(msg.id);
                          },
                          e.clientX,
                          e.clientY
                        );
                      }}
                      onPointerMove={(e) => {
                        e.stopPropagation();
                        handleLongPressMove(e.clientX, e.clientY);
                      }}
                      onPointerUp={(e) => {
                        e.stopPropagation();
                        clearLongPress();
                      }}
                      onPointerLeave={clearLongPress}
                      onPointerCancel={clearLongPress}
                      onContextMenu={(e) => {
                        if (canCompose && msg.memberId !== '__user__') {
                          e.preventDefault();
                          e.stopPropagation();
                          window.getSelection?.()?.removeAllRanges();
                          setDeleteMenuMsgId(null);
                          setAvatarMenuFlipUp(shouldFlipMenuUp(e.currentTarget, 64));
                          setAvatarMenuMsgId(msg.id);
                        }
                      }}
                      onClick={() => {
                        if (longPressTriggeredRef.current) {
                          longPressTriggeredRef.current = false;
                          return;
                        }
                        onAvatarClick(msg.memberId, msg.username);
                      }}
                      className="shrink-0 cursor-pointer touch-manipulation select-none rounded-full bg-transparent p-0"
                    >
                      <CharacterAvatar
                        avatarType={msg.avatar}
                        customAvatarMediaId={msg.customAvatarMediaId}
                        size={36}
                      />
                    </button>

                    {canCompose && avatarMenuMsgId === msg.id && (
                      <>
                        <button
                          type="button"
                          aria-label="閉じる"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAvatarMenuMsgId(null);
                          }}
                          className="fixed inset-0 z-40 cursor-default bg-transparent"
                        />
                        <div
                          className={`nc-modal-enter absolute left-0 z-50 min-w-[120px] max-w-[calc(100vw-32px)] rounded-[8px] border border-[#524468] bg-[#211A2C] p-1 shadow-[0_10px_28px_rgba(0,0,0,0.55)] ${
                            avatarMenuFlipUp ? 'bottom-[40px]' : 'top-[40px]'
                          }`}
                        >
                          <button
                            type="button"
                            data-action={`avatar-mention-${msg.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMentionPick(msg.username);
                            }}
                            className="w-full cursor-pointer rounded-[6px] px-2.5 py-1.5 text-left text-[12px] font-medium text-[#EFEBF5] transition-colors hover:bg-[#473A5C]"
                          >
                            {t.mentionTargetBtn(msg.username)}
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <button
                        type="button"
                        data-action={`message-author-${msg.id}`}
                        onClick={() => onMessageClick(msg)}
                        className="cursor-pointer bg-transparent p-0 text-[13.5px] font-bold text-[#EFEBF5] hover:underline"
                      >
                        {msg.username}
                      </button>
                      <span className="shrink-0 whitespace-nowrap text-[10.5px] font-normal text-[#9A90A8]">
                        {msg.timestamp}
                      </span>
                    </div>

                    {msg.fileMedia && (
                      <LocalFileMediaCard
                        media={msg.fileMedia}
                        onPreviewImage={(url, filename) => setPreviewImage({ url, filename })}
                        onPreviewVideo={(url, filename) => setPreviewVideo({ url, filename })}
                      />
                    )}

                    {msg.imageMedia && (
                      <LocalImageCard
                        media={msg.imageMedia}
                        onPreview={(url, filename) => setPreviewImage({ url, filename })}
                      />
                    )}

                    {msg.voiceMedia && <LocalVoicePlayer media={msg.voiceMedia} />}

                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-1.5 flex flex-col gap-2">
                        {msg.attachments.map((file) => (
                          <button
                            key={file.id}
                            type="button"
                            data-action={`download-${file.id}`}
                            aria-label={`${file.filename}をダウンロード`}
                            onClick={() => onFileDownload(file)}
                            className="flex h-[54px] w-full max-w-[310px] cursor-pointer items-center justify-between rounded-[6px] border border-[#61527A] bg-[#524468] px-3.5 text-left transition-all hover:bg-[#5C4D74] active:scale-[0.99]"
                          >
                            <span className="flex min-w-0 items-center gap-3">
                              <svg
                                width="26"
                                height="32"
                                viewBox="0 0 26 32"
                                fill="none"
                                className="shrink-0"
                                aria-hidden="true"
                              >
                                <path
                                  d="M3 1.5H17.5L23.5 7.5V29.5C23.5 30.1 23.0 30.5 22.4 30.5H3C2.4 30.5 2 30.1 2 29.5V2.5C2 1.9 2.4 1.5 3 1.5Z"
                                  stroke="#C2B8D3"
                                  strokeWidth="1.5"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M17.5 1.5V7.5H23.5"
                                  stroke="#C2B8D3"
                                  strokeWidth="1.5"
                                  strokeLinejoin="round"
                                />
                                <text
                                  x="12.8"
                                  y="21.5"
                                  textAnchor="middle"
                                  fill="#C2B8D3"
                                  fontSize="7"
                                  fontWeight="700"
                                  fontFamily="Inter, sans-serif"
                                >
                                  {file.fileType}
                                </text>
                              </svg>
                              <span className="flex min-w-0 flex-col">
                                <span className="truncate text-[13.5px] leading-[1.25] font-bold text-white">
                                  {file.filename}
                                </span>
                                <span className="mt-0.5 text-[10.5px] font-normal text-[#9A90A8]">
                                  {file.sizeLabel}
                                </span>
                              </span>
                            </span>
                            <span className="flex shrink-0 items-center justify-center p-1 text-[#EFEBF5]">
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="currentColor"
                                aria-hidden="true"
                              >
                                <path d="M3.5 3.5H12.5L8 9.5L3.5 3.5Z" />
                                <rect x="3" y="11" width="10" height="1.7" rx="0.5" />
                              </svg>
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {editingMsgId === msg.id ? (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="mt-1 flex flex-col gap-1.5 rounded-[7px] border border-[#524468] bg-[#2D233E] p-2"
                      >
                        <textarea
                          autoFocus
                          data-action={`edit-message-input-${msg.id}`}
                          value={editingDraft}
                          onChange={(e) => setEditingDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              e.stopPropagation();
                              setEditingMsgId(null);
                              return;
                            }
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              if ((editingDraft.trim() || hasMedia) && onEditMessage) {
                                onEditMessage(msg.id, editingDraft);
                              }
                              setEditingMsgId(null);
                            }
                          }}
                          rows={2}
                          className="nc-scroll w-full resize-y rounded-[5px] border border-[#4D3F66] bg-[#1E1729] px-2.5 py-1.5 text-[13px] text-[#EFEBF5] outline-none focus:border-[#64D2E6]"
                        />
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            data-action={`edit-message-cancel-${msg.id}`}
                            onClick={() => setEditingMsgId(null)}
                            className="cursor-pointer rounded-[5px] bg-[#362B4A] px-2.5 py-1 text-[11px] font-medium text-[#CFC7DD] hover:bg-[#493B62]"
                          >
                            {t.cancel}
                          </button>
                          <button
                            type="button"
                            data-action={`edit-message-save-${msg.id}`}
                            onClick={() => {
                              if ((editingDraft.trim() || hasMedia) && onEditMessage) {
                                onEditMessage(msg.id, editingDraft);
                              }
                              setEditingMsgId(null);
                            }}
                            className="cursor-pointer rounded-[5px] bg-[#52436B] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#645283]"
                          >
                            {t.saveEditBtn}
                          </button>
                        </div>
                      </div>
                    ) : (
                      msg.text && (
                        <div
                          className={`break-words text-[13.5px] leading-[1.44] font-normal text-[#E2DCEB] ${
                            msg.fileMedia || msg.imageMedia || msg.attachments?.length ? 'mt-2' : ''
                          }`}
                        >
                          {msg.text}
                        </div>
                      )
                    )}
                  </div>

                  {canCompose && deleteMenuMsgId === msg.id && (
                    <>
                      <button
                        type="button"
                        aria-label="閉じる"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteMenuMsgId(null);
                        }}
                        className="fixed inset-0 z-40 cursor-default bg-transparent"
                      />
                      <div
                        className={`nc-modal-enter absolute right-2 z-50 min-w-[126px] max-w-[calc(100vw-32px)] rounded-[8px] border border-[#524468] bg-[#211A2C] p-1 shadow-[0_10px_28px_rgba(0,0,0,0.55)] ${
                          deleteMenuFlipUp ? 'bottom-8' : 'top-1'
                        }`}
                      >
                        {aiMode && onRegenerateMessage && (
                          <button
                            type="button"
                            disabled={Boolean(aiGeneratingName)}
                            data-action={`regenerate-message-${msg.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onRegenerateMessage(msg.id);
                              setDeleteMenuMsgId(null);
                            }}
                            className="w-full cursor-pointer rounded-[6px] px-2.5 py-1.5 text-left text-[12px] font-medium text-[#64D2E6] transition-colors hover:bg-[#342947] hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
                          >
                            {t.regenerateMessageBtn}
                          </button>
                        )}
                        {aiMode && onEditMessage && (
                          <button
                            type="button"
                            data-action={`edit-message-${msg.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingMsgId(msg.id);
                              setEditingDraft(msg.text ?? '');
                              setDeleteMenuMsgId(null);
                            }}
                            className="w-full cursor-pointer rounded-[6px] px-2.5 py-1.5 text-left text-[12px] font-medium text-[#DCD7E5] transition-colors hover:bg-[#342947] hover:text-white"
                          >
                            {t.editMessageBtn}
                          </button>
                        )}
                        <button
                          type="button"
                          data-action={`delete-message-${msg.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteMessage(msg.id);
                            setDeleteMenuMsgId(null);
                          }}
                          className="w-full cursor-pointer rounded-[6px] px-2.5 py-1.5 text-left text-[12px] font-medium text-[#FFB6C7] transition-colors hover:bg-[#4B2538] hover:text-white"
                        >
                          {t.deleteMessageBtn}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </Fragment>
            );
          })
        )}

        {aiMode && aiGeneratingName && (
          <div
            data-testid="ai-generating-indicator"
            className="nc-msg-enter flex items-center justify-between gap-2 px-1 py-1 text-[12px] text-[#B8AED0]"
          >
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#64D2E6]" />
              <span>{t.aiGeneratingStatus(aiGeneratingName)}</span>
            </span>
            {onStopAi && (
              <button
                type="button"
                data-action="ai-inline-stop"
                onClick={onStopAi}
                className="cursor-pointer rounded-[5px] border border-[#EB7F97]/55 bg-[#3A2233] px-2 py-0.5 text-[11px] font-medium text-[#FFB6C7] transition-colors hover:border-[#EB7F97] hover:text-white"
              >
                {t.aiHeaderStopBtn}
              </button>
            )}
          </div>
        )}
      </div>

      <div
        className="relative shrink-0 px-3 pt-1.5 sm:px-5 sm:pb-4 sm:pt-1"
        style={{ paddingBottom: 'max(0.875rem, env(safe-area-inset-bottom))' }}
      >
        {mode === 'studio' && !aiMode && (
          <RoleComposerBar
            lang={lang}
            characters={characters}
            activeCharacter={activeCharacter}
            onSelectCharacter={onSelectCharacter}
            onSaveCharacter={onSaveCharacter}
            onMentionCharacter={handleMentionPick}
            onTriggerImageUpload={onTriggerImageUpload}
            onTriggerVideoUpload={onTriggerVideoUpload}
            onTriggerAudioUpload={onTriggerAudioUpload}
            customTime={customTime}
            lastMessageDateTime={lastMessageDateTime}
            onChangeCustomTime={onChangeCustomTime}
            onSyncCustomTimeNow={onSyncCustomTimeNow}
          />
        )}

        {canCompose && mentionPickerOpen && (
          <>
            <button
              type="button"
              aria-label="閉じる"
              onClick={() => setMentionPickerOpen(false)}
              className="fixed inset-0 z-40 cursor-default bg-transparent"
            />
            <div className="nc-modal-enter absolute bottom-[62px] right-4 z-50 min-w-[165px] rounded-[8px] border border-[#524468] bg-[#211A2C] p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.6)] sm:right-6">
              <div className="mb-1 px-2 text-[11px] font-bold text-[#9A90A8]">
                {t.mentionPickerTitle}
              </div>
              <div className="flex flex-col gap-0.5">
                {characters.map((char) => (
                  <button
                    key={char.id}
                    type="button"
                    data-action={`mention-option-${char.id}`}
                    onClick={() => handleMentionPick(char.name)}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-[6px] px-2 py-1.5 text-left text-[12.5px] font-medium text-[#EFEBF5] transition-colors hover:bg-[#473A5C]"
                  >
                    <CharacterAvatar
                      avatarType={char.avatarType}
                      customAvatarMediaId={char.customAvatarMediaId}
                      size={18}
                    />
                    <span className="truncate">@{char.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <form
          onSubmit={onSubmitMessage}
          className="flex h-[44px] w-full items-center justify-between gap-2 rounded-[6px] border border-[#453859] bg-[#332844] px-3 transition-colors focus-within:border-[#675882] sm:h-[42px] sm:px-[15px]"
        >
          <input
            ref={inputRef}
            type="text"
            value={canCompose ? inputValue : ''}
            readOnly={!canCompose}
            onChange={(event) => {
              if (canCompose) {
                onInputChange(event.target.value);
              }
            }}
            aria-label="メッセージを送信"
            aria-readonly={!canCompose}
            placeholder={
              aiMode
                ? 'メッセージを送信'
                : mode === 'studio'
                  ? t.studioInputPlaceholder(activeCharacter.name)
                  : 'メッセージを送信'
            }
            autoComplete="off"
            className={`min-w-0 flex-1 border-none bg-transparent text-[16px] text-[#EFEBF5] outline-none placeholder:text-[#857A99] sm:text-[13px] ${
              formatActive && canCompose ? 'font-bold' : 'font-normal'
            } ${!canCompose ? 'cursor-default select-none' : ''}`}
          />
          <div className="flex shrink-0 select-none items-center gap-3 sm:gap-3.5">
            <button
              type="button"
              data-action="input-mention"
              aria-label="メンション"
              aria-expanded={canCompose && mentionPickerOpen}
              title="メンション"
              onClick={() => {
                if (canCompose) {
                  setMentionPickerOpen((prev) => !prev);
                }
              }}
              className={`flex items-center justify-center bg-transparent p-0 text-[13.5px] font-semibold transition-colors ${
                canCompose && mentionPickerOpen ? 'text-[#64D2E6]' : 'text-[#9A90A8]'
              } ${canCompose ? 'cursor-pointer hover:text-white' : 'cursor-default'}`}
            >
              @
            </button>
            <button
              type="button"
              data-action="input-format"
              aria-label="書式"
              aria-pressed={formatActive && canCompose}
              title="書式"
              onClick={onFormatClick}
              className={`flex items-center justify-center bg-transparent p-0 text-[13.5px] font-semibold transition-colors ${
                formatActive && canCompose ? 'text-white' : 'text-[#9A90A8]'
              } ${canCompose ? 'cursor-pointer hover:text-white' : 'cursor-default'}`}
            >
              Aa
            </button>
            <button
              type="button"
              data-action="input-emoji"
              aria-label="絵文字"
              title="絵文字"
              onClick={handleEmoji}
              className={`flex items-center justify-center bg-transparent p-0 text-[#E2DCEB] transition-colors ${
                canCompose ? 'cursor-pointer hover:text-white' : 'cursor-default'
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="8.5" fill="currentColor" />
                <circle cx="7.2" cy="8.2" r="1.15" fill="#332844" />
                <circle cx="12.8" cy="8.2" r="1.15" fill="#332844" />
                <path
                  d="M6.8 11.8C7.5 13.3 8.7 14 10 14C11.3 14 12.5 13.3 13.2 11.8"
                  stroke="#332844"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <button
              type="button"
              data-action="input-attach"
              aria-label="ファイルを添付"
              title="ファイルを添付"
              onClick={onAttachClick}
              className={`flex items-center justify-center bg-transparent p-0 text-[#B4A9C6] transition-colors ${
                canCompose ? 'cursor-pointer hover:text-white' : 'cursor-default'
              }`}
            >
              <svg width="15" height="16" viewBox="0 0 16 18" fill="none" aria-hidden="true">
                <path
                  d="M2.5 1.5H10.2L14 5.3V16C14 16.55 13.55 17 13 17H2.5C1.95 17 1.5 16.55 1.5 16V2.5C1.5 1.95 1.95 1.5 2.5 1.5Z"
                  fill="currentColor"
                />
                <path d="M10 1.5V5.5H14" fill="#332844" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {previewImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={previewImage.filename}
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[90vh] max-w-[92vw] flex-col overflow-hidden rounded-[10px] border border-[#524468] bg-[#211A2C]"
          >
            <div className="flex items-center justify-between border-b border-[#332844] px-3.5 py-2 text-[12.5px] text-[#EFEBF5]">
              <span className="truncate">{previewImage.filename}</span>
              <button
                type="button"
                aria-label="閉じる"
                onClick={() => setPreviewImage(null)}
                className="cursor-pointer rounded px-2 py-0.5 text-[#9A90A8] hover:text-white"
              >
                ×
              </button>
            </div>
            <img
              src={previewImage.url}
              alt={previewImage.filename}
              className="max-h-[80vh] max-w-[88vw] object-contain"
            />
          </div>
        </div>
      )}

      {previewVideo && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={previewVideo.filename}
          onClick={() => setPreviewVideo(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[90vh] max-w-[92vw] flex-col overflow-hidden rounded-[10px] border border-[#524468] bg-[#211A2C]"
          >
            <div className="flex items-center justify-between border-b border-[#332844] px-3.5 py-2 text-[12.5px] text-[#EFEBF5]">
              <span className="truncate">{previewVideo.filename}</span>
              <button
                type="button"
                aria-label="閉じる"
                onClick={() => setPreviewVideo(null)}
                className="cursor-pointer rounded px-2 py-0.5 text-[#9A90A8] hover:text-white"
              >
                ×
              </button>
            </div>
            <video
              src={previewVideo.url}
              controls
              autoPlay
              className="max-h-[80vh] max-w-[88vw] bg-black"
            />
          </div>
        </div>
      )}
    </main>
  );
}
