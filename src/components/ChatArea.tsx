import { Fragment, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type {
  AppMode,
  AvatarType,
  CharacterProfile,
  ChatAttachment,
  ChatMessage,
  CustomMessageTime,
  UiLanguage,
} from '../types/nightcord';
import { getUiText } from '../utils/i18n';
import { CharacterAvatar, LocalImageCard, LocalVoicePlayer } from './LocalMedia';
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
  isRecording: boolean;
  recordingSec: number;
  onOpenSidebar: () => void;
  onInputChange: (value: string) => void;
  onSubmitMessage: (event: FormEvent<HTMLFormElement>) => void;
  onChatHeaderClick: () => void;
  onMessageClick: (message: ChatMessage) => void;
  onAvatarClick: (memberId: string, username: string) => void;
  onFileDownload: (file: ChatAttachment) => void;
  onMentionClick: () => void;
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
  onStartRecording: () => void;
  onStopRecording: () => void;
  onCancelRecording: () => void;
  onTriggerAudioFileUpload: () => void;
  customTime: CustomMessageTime;
  lastMessageTimestamp: string | null;
  onChangeCustomTime: (next: CustomMessageTime) => void;
  onSyncCustomTimeNow: () => void;
  isPlaying?: boolean;
  animatedFromIndex?: number | null;
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
  isRecording,
  recordingSec,
  onOpenSidebar,
  onInputChange,
  onSubmitMessage,
  onChatHeaderClick,
  onMessageClick,
  onAvatarClick,
  onFileDownload,
  onMentionClick,
  onFormatClick,
  onEmojiClick,
  onAttachClick,
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
  isPlaying = false,
  animatedFromIndex = null,
}: ChatAreaProps) {
  const t = getUiText(lang);
  const streamRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const prevCountRef = useRef(messages.length);
  const [previewImage, setPreviewImage] = useState<{ url: string; filename: string } | null>(null);

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

  const handleMention = () => {
    onMentionClick();
    inputRef.current?.focus();
  };

  const handleEmoji = () => {
    onEmojiClick();
    inputRef.current?.focus();
  };

  return (
    <main className="flex h-full min-w-0 flex-1 flex-col bg-[#3F3352]">
      <header className="flex h-[52px] shrink-0 items-center gap-2 border-b border-[#322742] bg-[#3F3352] px-3 sm:px-6">
        <button
          type="button"
          data-action="sidebar-toggle"
          aria-label="チャンネル一覧を開く"
          onClick={onOpenSidebar}
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-[#DCD7E5] transition-colors hover:bg-[#4B3D61] hover:text-white md:hidden"
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
          data-action="chat-header-work"
          aria-label={`チャンネルヘッダー：${channelTitle}`}
          onClick={onChatHeaderClick}
          className="flex min-w-0 cursor-pointer items-center gap-2.5 rounded px-1 py-1 text-left transition-opacity hover:opacity-90"
        >
          <WorkChannelIcon size={22} />
          <h1 className="truncate text-[15px] font-bold text-white">{channelTitle}</h1>
        </button>
      </header>

      <div
        ref={streamRef}
        data-testid="message-stream"
        className="nc-scroll flex flex-1 flex-col gap-3.5 px-3.5 pb-4 sm:gap-[15px] sm:px-6"
      >
        {messages.length === 0 ? (
          isPlaying ? null : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 py-12 text-center text-[#9A90A8]">
              <WorkChannelIcon size={34} />
              <div className="text-[13.5px] font-semibold text-[#DCD7E5]">
                {mode === 'studio'
                  ? t.emptyConvTitle(channelTitle)
                  : `${channelTitle} の会話をはじめましょう`}
              </div>
              <div className="text-[12px]">
                {mode === 'studio'
                  ? t.emptyConvSub
                  : 'メッセージを送信するとローカルに保存されます'}
              </div>
            </div>
          )
        ) : (
          messages.map((msg, idx) => {
            const shouldAnimate = animatedFromIndex !== null && idx >= animatedFromIndex;
            return (
              <Fragment key={msg.id}>
                {msg.dividerBefore && (
                  <div
                    className={`my-[3px] flex items-center gap-3.5 ${
                      shouldAnimate ? 'nc-msg-enter' : ''
                    }`}
                  >
                    <div className="h-px flex-1 bg-[#504266]" />
                    <span className="text-[11px] font-medium text-[#9A90A8]">
                      {msg.dividerBefore}
                    </span>
                    <div className="h-px flex-1 bg-[#504266]" />
                  </div>
                )}

                <div
                  className={`flex items-start gap-[13px] rounded-[6px] transition-colors hover:bg-[#2E243D]/30 ${
                    msg.topClipped ? '-mt-[11px]' : ''
                  } ${shouldAnimate ? 'nc-msg-enter' : ''}`}
                >
                <button
                  type="button"
                  data-action={`avatar-${msg.memberId}`}
                  aria-label={`${msg.username}のプロフィール`}
                  onClick={() => onAvatarClick(msg.memberId, msg.username)}
                  className="shrink-0 cursor-pointer rounded-full bg-transparent p-0"
                >
                  <CharacterAvatar
                    avatarType={msg.avatar}
                    customAvatarMediaId={msg.customAvatarMediaId}
                    size={36}
                  />
                </button>

                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-baseline gap-2">
                    <button
                      type="button"
                      data-action={`message-author-${msg.id}`}
                      onClick={() => onMessageClick(msg)}
                      className="cursor-pointer bg-transparent p-0 text-[13.5px] font-bold text-[#EFEBF5] hover:underline"
                    >
                      {msg.username}
                    </button>
                    <span className="text-[10.5px] font-normal text-[#9A90A8]">
                      {msg.timestamp}
                    </span>
                  </div>

                  {msg.text && (
                    <div className="break-words text-[13.5px] leading-[1.44] font-normal text-[#E2DCEB]">
                      {msg.text}
                    </div>
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
                  </div>
                </div>
              </Fragment>
            );
          })
        )}
      </div>

      <footer
        className="shrink-0 bg-[#3F3352] px-3.5 pb-3.5 sm:px-6 sm:pb-[18px]"
        style={{ paddingBottom: 'max(0.875rem, env(safe-area-inset-bottom))' }}
      >
        {mode === 'studio' && (
          <RoleComposerBar
            lang={lang}
            characters={characters}
            activeCharacter={activeCharacter}
            isRecording={isRecording}
            recordingSec={recordingSec}
            onSelectCharacter={onSelectCharacter}
            onSaveCharacter={onSaveCharacter}
            onTriggerImageUpload={onTriggerImageUpload}
            onStartRecording={onStartRecording}
            onStopRecording={onStopRecording}
            onCancelRecording={onCancelRecording}
            onTriggerAudioFileUpload={onTriggerAudioFileUpload}
            customTime={customTime}
            lastMessageTimestamp={lastMessageTimestamp}
            onChangeCustomTime={onChangeCustomTime}
            onSyncCustomTimeNow={onSyncCustomTimeNow}
          />
        )}

        <form
          onSubmit={onSubmitMessage}
          className="flex h-[44px] w-full items-center justify-between gap-2 rounded-[6px] border border-[#453859] bg-[#332844] px-3 transition-colors focus-within:border-[#675882] sm:h-[42px] sm:px-[15px]"
        >
          <input
            ref={inputRef}
            type="text"
            value={mode === 'immersive' ? '' : inputValue}
            readOnly={mode === 'immersive'}
            onChange={(event) => {
              if (mode === 'studio') {
                onInputChange(event.target.value);
              }
            }}
            aria-label="メッセージを送信"
            aria-readonly={mode === 'immersive'}
            placeholder={
              mode === 'studio'
                ? t.studioInputPlaceholder(activeCharacter.name)
                : 'メッセージを送信'
            }
            autoComplete="off"
            className={`min-w-0 flex-1 border-none bg-transparent text-[16px] text-[#EFEBF5] outline-none placeholder:text-[#857A99] sm:text-[13px] ${
              formatActive && mode === 'studio' ? 'font-bold' : 'font-normal'
            } ${mode === 'immersive' ? 'cursor-default select-none' : ''}`}
          />
          <div className="flex shrink-0 select-none items-center gap-3 sm:gap-3.5">
            <button
              type="button"
              data-action="input-mention"
              aria-label="メンション"
              title="メンション"
              onClick={handleMention}
              className={`flex items-center justify-center bg-transparent p-0 text-[13.5px] font-semibold text-[#9A90A8] transition-colors ${
                mode === 'studio' ? 'cursor-pointer hover:text-white' : 'cursor-default'
              }`}
            >
              @
            </button>
            <button
              type="button"
              data-action="input-format"
              aria-label="書式"
              aria-pressed={formatActive && mode === 'studio'}
              title="書式"
              onClick={onFormatClick}
              className={`flex items-center justify-center bg-transparent p-0 text-[13.5px] font-semibold transition-colors ${
                formatActive && mode === 'studio' ? 'text-white' : 'text-[#9A90A8]'
              } ${mode === 'studio' ? 'cursor-pointer hover:text-white' : 'cursor-default'}`}
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
                mode === 'studio' ? 'cursor-pointer hover:text-white' : 'cursor-default'
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
                mode === 'studio' ? 'cursor-pointer hover:text-white' : 'cursor-default'
              }`}
            >
              <svg width="14" height="16" viewBox="0 0 14 16" fill="none" aria-hidden="true">
                <path
                  d="M2 1.5H9L12.5 5V14C12.5 14.55 12.05 15 11.5 15H2C1.45 15 1 14.55 1 14V2.5C1 1.95 1.45 1.5 2 1.5Z"
                  fill="currentColor"
                />
                <path d="M9 1.5V5H12.5" fill="#332844" />
              </svg>
            </button>
          </div>
        </form>
      </footer>

      {previewImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={previewImage.filename}
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[90vh] max-w-[92vw] flex-col overflow-hidden rounded-[10px] border border-[#524468] bg-[#211A2C]"
          >
            <div className="flex items-center justify-between border-b border-[#332844] px-3.5 py-2 text-[12.5px] text-[#EFEBF5]">
              <span className="truncate font-semibold">{previewImage.filename}</span>
              <button
                type="button"
                aria-label="プレビューを閉じる"
                onClick={() => setPreviewImage(null)}
                className="ml-3 cursor-pointer rounded px-2 py-0.5 text-[#9A90A8] hover:text-white"
              >
                ×
              </button>
            </div>
            <img
              src={previewImage.url}
              alt={previewImage.filename}
              className="max-h-[80vh] max-w-full object-contain"
            />
          </div>
        </div>
      )}
    </main>
  );
}
