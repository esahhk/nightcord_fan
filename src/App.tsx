import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { ChatArea } from './components/ChatArea';
import { ImageSendModal } from './components/ImageSendModal';
import { WorkChannelIcon } from './components/NightcordArt';
import { OnboardingModal } from './components/OnboardingModal';
import { Sidebar } from './components/Sidebar';
import type {
  AppMode,
  AvatarType,
  CharacterProfile,
  ChatAttachment,
  ChatMessage,
  Conversation,
  NightcordActions,
  UiLanguage,
  VoiceMember,
} from './types/nightcord';
import { getUiText } from './utils/i18n';
import {
  isOnboardingCompleted,
  loadActiveCharacterId,
  loadActiveConversationId,
  loadSavedCharacters,
  loadSavedConversations,
  loadSavedLanguage,
  markOnboardingCompleted,
  saveActiveCharacterId,
  saveActiveConversationId,
  saveCharacters,
  saveConversations,
  saveLanguage,
  saveLocalMediaBlob,
  saveMode,
} from './utils/localStorageStore';
import {
  INITIAL_CHARACTERS,
  INITIAL_VOICE_MEMBERS,
  TEMPLATE_CONVERSATION_ID,
  appendInputToken,
  createImageMessage,
  createInitialConversations,
  createNewConversation,
  createOutgoingMessage,
  createVoiceMessage,
  extractFileType,
  formatFileSize,
  invokeAction,
  toggleMemberMute,
  upsertCharacter,
} from './utils/nightcordState';

interface AppProps {
  actions?: Partial<NightcordActions>;
}

export default function App({ actions }: AppProps) {
  const [conversations, setConversations] = useState<Conversation[]>(
    () => loadSavedConversations() ?? createInitialConversations()
  );
  const [activeConversationId, setActiveConversationId] = useState<string>(() => {
    const saved = loadActiveConversationId();
    const list = loadSavedConversations() ?? createInitialConversations();
    if (saved && list.some((c) => c.id === saved)) {
      return saved;
    }
    return list[0].id;
  });
  const [characters, setCharacters] = useState<CharacterProfile[]>(
    () => loadSavedCharacters() ?? INITIAL_CHARACTERS
  );
  const [activeCharacterId, setActiveCharacterId] = useState<string>(() => {
    const saved = loadActiveCharacterId();
    const list = loadSavedCharacters() ?? INITIAL_CHARACTERS;
    if (saved && list.some((c) => c.id === saved)) {
      return saved;
    }
    return list[0].id;
  });
  const [mode, setMode] = useState<AppMode>('immersive');
  const [lang, setLang] = useState<UiLanguage>(() => loadSavedLanguage());
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        return false;
      }
    }
    return !isOnboardingCompleted();
  });
  const t = useMemo(() => getUiText(lang), [lang]);

  const [voiceExpanded, setVoiceExpanded] = useState(true);
  const [offlineExpanded, setOfflineExpanded] = useState(false);
  const [members, setMembers] = useState<VoiceMember[]>(INITIAL_VOICE_MEMBERS);
  const [inputValue, setInputValue] = useState('');
  const [formatActive, setFormatActive] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [serverMenuOpen, setServerMenuOpen] = useState(false);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [toastText, setToastText] = useState<string | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingSec, setRecordingSec] = useState(0);

  const actionsRef = useRef<Partial<NightcordActions>>(actions ?? {});
  const toastTimerRef = useRef<number | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<number | null>(null);
  const recordingStartedAtRef = useRef<number>(0);
  const recordingCancelRef = useRef<boolean>(false);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId) ?? conversations[0],
    [conversations, activeConversationId]
  );

  const activeCharacter = useMemo(
    () => characters.find((c) => c.id === activeCharacterId) ?? characters[0],
    [characters, activeCharacterId]
  );

  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    saveActiveConversationId(activeConversationId);
  }, [activeConversationId]);

  useEffect(() => {
    saveCharacters(characters);
  }, [characters]);

  useEffect(() => {
    saveActiveCharacterId(activeCharacterId);
  }, [activeCharacterId]);

  useEffect(() => {
    saveMode(mode);
  }, [mode]);

  useEffect(() => {
    saveLanguage(lang);
  }, [lang]);

  useEffect(() => {
    if (actions) {
      actionsRef.current = { ...actionsRef.current, ...actions };
    }
  }, [actions]);

  const showToast = useCallback((text: string) => {
    setToastText(text);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastText(null);
    }, 2400);
  }, []);

  const appendMessageToActive = useCallback(
    (msg: ChatMessage) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversation.id
            ? { ...conv, messages: [...conv.messages, msg] }
            : conv
        )
      );
    },
    [activeConversation.id]
  );

  const pushMessage = useCallback(
    (rawText: string) => {
      const nextMsg = createOutgoingMessage(rawText, activeCharacter);
      if (!nextMsg) {
        return;
      }
      appendMessageToActive(nextMsg);
      invokeAction(actionsRef.current, 'onSendMessage', nextMsg.text ?? '', nextMsg);
    },
    [activeCharacter, appendMessageToActive]
  );

  useEffect(() => {
    window.NightcordBridge = {
      registerActions: (nextActions) => {
        actionsRef.current = { ...actionsRef.current, ...nextActions };
      },
      getActions: () => ({ ...actionsRef.current }),
      sendMessage: pushMessage,
      notify: showToast,
    };
  }, [pushMessage, showToast]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
      if (recordingIntervalRef.current !== null) {
        window.clearInterval(recordingIntervalRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        recordingCancelRef.current = true;
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setServerMenuOpen(false);
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleCompleteOnboarding = () => {
    markOnboardingCompleted();
    setShowOnboarding(false);
  };

  const handleSwitchStudioMode = () => {
    setMode('studio');
    invokeAction(actionsRef.current, 'onWindowMinimize');
    invokeAction(actionsRef.current, 'onModeChange', 'studio');
    showToast(t.toastStudioMode);
  };

  const handleSwitchImmersiveMode = () => {
    setMode('immersive');
    setServerMenuOpen(false);
    invokeAction(actionsRef.current, 'onWindowMaximize');
    invokeAction(actionsRef.current, 'onModeChange', 'immersive');
  };

  const handleReservedRedDot = () => {
    invokeAction(actionsRef.current, 'onWindowClose');
  };

  const handleToggleServerMenu = () => {
    setServerMenuOpen((prev) => !prev);
    invokeAction(actionsRef.current, 'onServerMenuClick');
  };

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    setServerMenuOpen(false);
    setMobileSidebarOpen(false);
    invokeAction(actionsRef.current, 'onConversationSelect', conversationId);
  };

  const handleCreateConversation = (title: string, fromTemplate: boolean) => {
    const created = createNewConversation(title, fromTemplate);
    if (!created) {
      return;
    }
    setConversations((prev) => [...prev, created]);
    setActiveConversationId(created.id);
    setServerMenuOpen(false);
    setMobileSidebarOpen(false);
    invokeAction(actionsRef.current, 'onConversationCreate', created);
    showToast(t.toastConvCreated(created.title));
  };

  const handleDeleteConversation = (conversationId: string) => {
    if (conversationId === TEMPLATE_CONVERSATION_ID) {
      return;
    }
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== conversationId);
      if (activeConversationId === conversationId) {
        setActiveConversationId(next[0]?.id ?? TEMPLATE_CONVERSATION_ID);
      }
      return next;
    });
    showToast(t.toastConvDeleted);
  };

  const handleChannelSelect = (channelId: string) => {
    setMobileSidebarOpen(false);
    setServerMenuOpen(false);
    invokeAction(actionsRef.current, 'onChannelSelect', channelId);
  };

  const handleSetMobileSidebar = (open: boolean) => {
    setMobileSidebarOpen(open);
    if (!open) {
      setServerMenuOpen(false);
    }
    invokeAction(actionsRef.current, 'onSidebarToggle', open);
  };

  const handleVoiceToggle = () => {
    setVoiceExpanded((prev) => {
      const next = !prev;
      invokeAction(actionsRef.current, 'onVoiceCategoryToggle', next);
      return next;
    });
  };

  const handleOfflineToggle = () => {
    setOfflineExpanded((prev) => {
      const next = !prev;
      invokeAction(actionsRef.current, 'onOfflineCategoryToggle', next);
      return next;
    });
  };

  const handleMicToggle = (member: VoiceMember) => {
    const result = toggleMemberMute(members, member.id);
    setMembers(result.members);
    if (result.updated) {
      invokeAction(actionsRef.current, 'onMicToggle', result.updated, result.updated.muted);
      if (mode === 'studio') {
        showToast(
          result.updated.muted
            ? t.toastMuted(result.updated.name)
            : t.toastUnmuted(result.updated.name)
        );
      }
    }
  };

  const handleChatHeaderClick = () => {
    invokeAction(actionsRef.current, 'onChatHeaderClick', activeConversation.id);
  };

  const handleMessageClick = (message: ChatMessage) => {
    invokeAction(actionsRef.current, 'onMessageClick', message);
  };

  const handleAvatarClick = (memberId: string, username: string) => {
    invokeAction(actionsRef.current, 'onAvatarClick', memberId, username);
    if (mode === 'studio') {
      showToast(t.toastProfile(username));
    }
  };

  const handleFileDownload = (file: ChatAttachment) => {
    invokeAction(actionsRef.current, 'onFileDownload', file);
    showToast(
      mode === 'studio'
        ? t.toastDownloading(file.filename, file.sizeLabel)
        : `${file.filename} (${file.sizeLabel}) をダウンロード中...`
    );
  };

  const handleSubmitMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mode !== 'studio') {
      return;
    }
    if (!inputValue.trim()) {
      return;
    }
    pushMessage(inputValue);
    setInputValue('');
  };

  const handleSelectCharacter = (character: CharacterProfile) => {
    setActiveCharacterId(character.id);
    invokeAction(actionsRef.current, 'onCharacterSelect', character);
  };

  const handleSaveCharacter = (draft: {
    id?: string;
    name: string;
    avatarType: AvatarType;
    customAvatarMediaId?: string;
  }) => {
    const res = upsertCharacter(characters, draft);
    if (!res.saved) {
      return;
    }
    setCharacters(res.characters);
    setActiveCharacterId(res.saved.id);
    invokeAction(actionsRef.current, 'onCharacterSave', res.saved);
    showToast(t.toastCharSaved(res.saved.name));
  };

  const handleImageFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || mode !== 'studio') {
      return;
    }
    setPendingImageFile(file);
  };

  const handleConfirmImageSend = async (options: {
    file: File;
    filename: string;
    displayMode: 'card' | 'image';
  }) => {
    const mediaId = `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    await saveLocalMediaBlob(mediaId, options.file);
    const fileType = extractFileType(options.filename);
    const msg = createImageMessage(
      {
        mediaId,
        filename: options.filename,
        sizeLabel: `${formatFileSize(options.file.size)} ${fileType}`,
        fileType,
        displayMode: options.displayMode,
      },
      activeCharacter,
      inputValue
    );
    appendMessageToActive(msg);
    setInputValue('');
    setPendingImageFile(null);
    invokeAction(actionsRef.current, 'onSendMessage', msg.text ?? '', msg);
    showToast(t.toastImageSaved);
  };

  const handleAudioFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }
    const mediaId = `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    await saveLocalMediaBlob(mediaId, file);
    const msg = createVoiceMessage(
      {
        mediaId,
        durationSec: 0,
        filename: file.name || 'voice.webm',
      },
      activeCharacter
    );
    appendMessageToActive(msg);
    invokeAction(actionsRef.current, 'onSendMessage', '', msg);
    showToast(t.toastAudioSaved);
  };

  const clearRecordingTimer = () => {
    if (recordingIntervalRef.current !== null) {
      window.clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
  };

  const handleStartRecording = async () => {
    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === 'undefined'
    ) {
      showToast(t.toastMicUnsupported);
      audioInputRef.current?.click();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recordingChunksRef.current = [];
      recordingCancelRef.current = false;
      recordingStartedAtRef.current = Date.now();
      setRecordingSec(0);
      setIsRecording(true);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordingChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        clearRecordingTimer();
        stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
        if (recordingCancelRef.current || recordingChunksRef.current.length === 0) {
          return;
        }
        const blob = new Blob(recordingChunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });
        const durationSec = Math.max(
          1,
          Math.round((Date.now() - recordingStartedAtRef.current) / 1000)
        );
        const mediaId = `rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        await saveLocalMediaBlob(mediaId, blob);
        const msg = createVoiceMessage(
          {
            mediaId,
            durationSec,
            filename: 'voice.webm',
          },
          activeCharacter
        );
        appendMessageToActive(msg);
        invokeAction(actionsRef.current, 'onSendMessage', '', msg);
        showToast(t.toastVoiceSaved);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      clearRecordingTimer();
      recordingIntervalRef.current = window.setInterval(() => {
        setRecordingSec(Math.floor((Date.now() - recordingStartedAtRef.current) / 1000));
      }, 500);
    } catch {
      showToast(t.toastMicDenied);
      audioInputRef.current?.click();
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      recordingCancelRef.current = false;
      mediaRecorderRef.current.stop();
    }
  };

  const handleCancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      recordingCancelRef.current = true;
      mediaRecorderRef.current.stop();
    } else {
      clearRecordingTimer();
      setIsRecording(false);
    }
  };

  const handleMentionClick = () => {
    if (mode !== 'studio') {
      return;
    }
    setInputValue((prev) => appendInputToken(prev, '@えななん '));
    invokeAction(actionsRef.current, 'onMentionClick');
  };

  const handleFormatClick = () => {
    if (mode !== 'studio') {
      return;
    }
    setFormatActive((prev) => {
      const next = !prev;
      invokeAction(actionsRef.current, 'onFormatClick', next);
      showToast(next ? t.toastBoldOn : t.toastBoldOff);
      return next;
    });
  };

  const handleEmojiClick = () => {
    if (mode !== 'studio') {
      return;
    }
    setInputValue((prev) => appendInputToken(prev, '♪'));
    invokeAction(actionsRef.current, 'onEmojiClick');
  };

  const handleAttachClick = () => {
    if (mode !== 'studio') {
      return;
    }
    invokeAction(actionsRef.current, 'onAttachClick');
    imageInputRef.current?.click();
  };

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-[#3F3352] shadow-[0_24px_60px_rgba(0,0,0,0.65)]">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageFileChange}
        className="hidden"
      />
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        onChange={handleAudioFileChange}
        className="hidden"
      />

      <div className="flex h-[28px] min-h-[28px] w-full shrink-0 select-none items-center justify-end border-b border-[#191322] bg-[#211A2C] px-3.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-action="mode-studio"
            aria-label="ロール切替モード"
            aria-pressed={mode === 'studio'}
            title="ロール切替モード"
            onClick={handleSwitchStudioMode}
            className="h-[11px] w-[11px] cursor-pointer rounded-full bg-[#64D2E6] transition-transform hover:scale-110 hover:brightness-110"
          />
          <button
            type="button"
            data-action="mode-immersive"
            aria-label="没入モード"
            aria-pressed={mode === 'immersive'}
            title="没入モード"
            onClick={handleSwitchImmersiveMode}
            className="h-[11px] w-[11px] cursor-pointer rounded-full bg-[#F6CE71] transition-transform hover:scale-110 hover:brightness-110"
          />
          <button
            type="button"
            data-action="window-close"
            aria-label="予約ボタン"
            onClick={handleReservedRedDot}
            className="h-[11px] w-[11px] cursor-pointer rounded-full bg-[#EB7F97] transition-transform hover:scale-110 hover:brightness-110"
          />
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1">
        <Sidebar
          lang={lang}
          conversations={conversations}
          activeConversationId={activeConversation.id}
          activeChannelTitle={activeConversation.title}
          voiceExpanded={voiceExpanded}
          offlineExpanded={offlineExpanded}
          members={members}
          mobileOpen={mobileSidebarOpen}
          serverMenuOpen={serverMenuOpen}
          onSelectLanguage={setLang}
          onCloseMobile={() => handleSetMobileSidebar(false)}
          onToggleServerMenu={handleToggleServerMenu}
          onCloseServerMenu={() => setServerMenuOpen(false)}
          onSelectConversation={handleSelectConversation}
          onCreateConversation={handleCreateConversation}
          onDeleteConversation={handleDeleteConversation}
          onChannelSelect={handleChannelSelect}
          onVoiceToggle={handleVoiceToggle}
          onOfflineToggle={handleOfflineToggle}
          onMicToggle={handleMicToggle}
        />
        <ChatArea
          lang={lang}
          channelTitle={activeConversation.title}
          mode={mode}
          messages={activeConversation.messages}
          characters={characters}
          activeCharacter={activeCharacter}
          inputValue={inputValue}
          formatActive={formatActive}
          isRecording={isRecording}
          recordingSec={recordingSec}
          onOpenSidebar={() => handleSetMobileSidebar(true)}
          onInputChange={setInputValue}
          onSubmitMessage={handleSubmitMessage}
          onChatHeaderClick={handleChatHeaderClick}
          onMessageClick={handleMessageClick}
          onAvatarClick={handleAvatarClick}
          onFileDownload={handleFileDownload}
          onMentionClick={handleMentionClick}
          onFormatClick={handleFormatClick}
          onEmojiClick={handleEmojiClick}
          onAttachClick={handleAttachClick}
          onSelectCharacter={handleSelectCharacter}
          onSaveCharacter={handleSaveCharacter}
          onTriggerImageUpload={() => imageInputRef.current?.click()}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          onCancelRecording={handleCancelRecording}
          onTriggerAudioFileUpload={() => audioInputRef.current?.click()}
        />
      </div>

      <ImageSendModal
        file={pendingImageFile}
        lang={lang}
        onCancel={() => setPendingImageFile(null)}
        onConfirm={handleConfirmImageSend}
      />

      <OnboardingModal
        open={showOnboarding}
        lang={lang}
        onSelectLanguage={setLang}
        onComplete={handleCompleteOnboarding}
      />

      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed right-3.5 top-[38px] z-50 flex max-w-[calc(100vw-28px)] items-center gap-2 rounded-lg border border-[#524468] bg-[#211A2C] px-3.5 py-2 text-[12.5px] text-[#EFEBF5] shadow-[0_8px_24px_rgba(0,0,0,0.48)] transition-all duration-200 sm:right-6 ${
          toastText ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
        }`}
      >
        <WorkChannelIcon size={15} />
        <span className="truncate">{toastText ?? ''}</span>
      </div>
    </div>
  );
}
