import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { AiGlobalSettingsModal } from './components/AiGlobalSettingsModal';
import { AiOnboardingModal } from './components/AiOnboardingModal';
import { CharacterAiModal } from './components/CharacterAiModal';
import { ChatArea } from './components/ChatArea';
import { ClearCacheModal } from './components/ClearCacheModal';
import { ImageSendModal } from './components/ImageSendModal';
import { WorkChannelIcon } from './components/NightcordArt';
import { OnboardingModal } from './components/OnboardingModal';
import { PlaybackSetupModal } from './components/PlaybackSetupModal';
import { Sidebar } from './components/Sidebar';
import { UiTemplateSubpage } from './components/UiTemplateSubpage';
import type {
  AiCharacterConfig,
  AiGlobalConfig,
  AppMode,
  AvatarType,
  CharacterProfile,
  ChatAttachment,
  ChatMessage,
  Conversation,
  CustomMessageTime,
  FileMediaKind,
  MemberPresenceStatus,
  MessageDateTime,
  NightcordActions,
  NightcordBackupPayload,
  PlaybackConfig,
  UiLanguage,
  VoiceMember,
} from './types/nightcord';
import {
  DEFAULT_AI_GLOBAL_CONFIG,
  editMessageText,
  getAiCharacterConfig,
  getEligibleAiCharacters,
  pickAiFollowUpResponder,
  prepareRegenerateTarget,
  requestAiCompletion,
  resolveAiResponder,
  resolveEffectiveAiCredentials,
} from './utils/aiClient';
import { getUiText } from './utils/i18n';
import {
  base64ToBlob,
  blobToBase64,
  clearLocalCacheData,
  isAiOnboardingCompleted,
  isOnboardingCompleted,
  loadActiveAiConversationId,
  loadActiveCharacterId,
  loadActiveConversationId,
  loadAiCharacterConfigs,
  loadAiGlobalConfig,
  loadLocalMediaBlob,
  loadSavedAiConversations,
  loadSavedCharacters,
  loadSavedConversations,
  loadSavedLanguage,
  loadSavedMembers,
  markAiOnboardingCompleted,
  markOnboardingCompleted,
  saveActiveAiConversationId,
  saveActiveCharacterId,
  saveActiveConversationId,
  saveAiCharacterConfigs,
  saveAiConversations,
  saveAiGlobalConfig,
  saveCharacters,
  saveConversations,
  saveLanguage,
  saveLocalMediaBlob,
  saveMembers,
  saveMode,
} from './utils/localStorageStore';
import {
  AI_TEMPLATE_CONVERSATION_ID,
  INITIAL_CHARACTERS,
  INITIAL_VOICE_MEMBERS,
  TEMPLATE_CONVERSATION_ID,
  addMemberStatusEvent,
  appendInputToken,
  buildPlaybackTimeline,
  collectReferencedMediaIds,
  computeDisplayMessagesForPlayback,
  computePlaybackStepDelayMs,
  computePlaybackStepState,
  createFileMessage,
  createInitialAiConversations,
  createInitialConversations,
  createNewConversation,
  createOutgoingMessage,
  deleteMessageAndRebuildDividers,
  formatDateTimeBadge,
  formatNightcordFileMeta,
  getInitialPlaybackCursor,
  getLastMessageDateTime,
  getSuggestedCustomTime,
  getSuggestedStatusEventTime,
  hydrateLegacyMessagesSentAt,
  invokeAction,
  parseNightcordBackup,
  removeCharacterAndMember,
  removeMemberStatusEvent,
  resolveOutgoingTimestamp,
  setMemberPresenceStatus,
  syncMembersWithCharacters,
  syncUpsertMemberFromCharacter,
  toggleMemberMute,
  upsertCharacter,
} from './utils/nightcordState';
import { isAiSubpageLocation, isTemplateSubpageLocation } from './utils/nightcordTemplateCode';

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
  const [aiConversations, setAiConversations] = useState<Conversation[]>(
    () => loadSavedAiConversations() ?? createInitialAiConversations()
  );
  const [activeAiConversationId, setActiveAiConversationId] = useState<string>(() => {
    const saved = loadActiveAiConversationId();
    const list = loadSavedAiConversations() ?? createInitialAiConversations();
    if (saved && list.some((c) => c.id === saved)) {
      return saved;
    }
    return list[0].id;
  });
  const [aiCharacterConfigs, setAiCharacterConfigs] = useState<Record<string, AiCharacterConfig>>(
    () => loadAiCharacterConfigs()
  );
  const [aiGlobalConfig, setAiGlobalConfig] = useState<AiGlobalConfig>(() => loadAiGlobalConfig());
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
  const [activeView, setActiveView] = useState<'app' | 'template' | 'ai'>(() => {
    if (typeof window !== 'undefined') {
      if (isTemplateSubpageLocation(window.location)) {
        return 'template';
      }
      if (isAiSubpageLocation(window.location)) {
        return 'ai';
      }
    }
    return 'app';
  });
  const isAiMode = activeView === 'ai';
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      if (isTemplateSubpageLocation(window.location) || isAiSubpageLocation(window.location)) {
        return false;
      }
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        return false;
      }
    }
    return !isOnboardingCompleted();
  });
  const t = useMemo(() => getUiText(lang), [lang]);

  const [voiceExpanded, setVoiceExpanded] = useState(true);
  const [members, setMembers] = useState<VoiceMember[]>(() =>
    syncMembersWithCharacters(
      loadSavedMembers() ?? INITIAL_VOICE_MEMBERS,
      loadSavedCharacters() ?? INITIAL_CHARACTERS
    )
  );
  const [offlineExpanded, setOfflineExpanded] = useState<boolean>(() => {
    const saved = loadSavedMembers() ?? INITIAL_VOICE_MEMBERS;
    return saved.some((m) => m.status === 'offline');
  });
  const [inputValue, setInputValue] = useState('');
  const [formatActive, setFormatActive] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [serverMenuOpen, setServerMenuOpen] = useState(false);
  const [pendingUpload, setPendingUpload] = useState<{
    file: File;
    forcedKind?: FileMediaKind;
  } | null>(null);
  const [clearCacheOpen, setClearCacheOpen] = useState(false);
  const [playbackModalOpen, setPlaybackModalOpen] = useState(false);
  const [playbackConfig, setPlaybackConfig] = useState<PlaybackConfig | null>(null);
  const [playbackCursor, setPlaybackCursor] = useState<number | null>(null);
  const [playbackBaseNow, setPlaybackBaseNow] = useState<Date | null>(null);
  const [clockNow, setClockNow] = useState<Date>(() => new Date());
  const [toastText, setToastText] = useState<string | null>(null);
  const [aiCharModalTargetId, setAiCharModalTargetId] = useState<string | null>(null);
  const [aiGlobalModalOpen, setAiGlobalModalOpen] = useState(false);
  const [aiGeneratingName, setAiGeneratingName] = useState<string | null>(null);
  const [showAiOnboarding, setShowAiOnboarding] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        return false;
      }
      if (isAiSubpageLocation(window.location)) {
        return !isAiOnboardingCompleted();
      }
    }
    return false;
  });

  const actionsRef = useRef<Partial<NightcordActions>>(actions ?? {});
  const aiBusyRef = useRef(false);
  const toastTimerRef = useRef<number | null>(null);
  const playbackTimerRef = useRef<number | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const anyFileInputRef = useRef<HTMLInputElement | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const mainActiveConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId) ?? conversations[0],
    [conversations, activeConversationId]
  );

  const aiActiveConversation = useMemo(
    () => aiConversations.find((c) => c.id === activeAiConversationId) ?? aiConversations[0],
    [aiConversations, activeAiConversationId]
  );

  const activeConversation = isAiMode ? aiActiveConversation : mainActiveConversation;
  const displayedConversations = isAiMode ? aiConversations : conversations;

  const activeCharacter = useMemo(
    () => characters.find((c) => c.id === activeCharacterId) ?? characters[0],
    [characters, activeCharacterId]
  );

  const aiReadyMemberIds = useMemo(
    () =>
      new Set(
        getEligibleAiCharacters(characters, aiCharacterConfigs, aiGlobalConfig).map((c) => c.id)
      ),
    [characters, aiCharacterConfigs, aiGlobalConfig]
  );

  const aiCharModalTarget = useMemo(() => {
    if (!aiCharModalTargetId) {
      return null;
    }
    const found = characters.find((c) => c.id === aiCharModalTargetId);
    if (found) {
      return found;
    }
    const member = members.find((m) => m.id === aiCharModalTargetId);
    if (!member) {
      return null;
    }
    return {
      id: member.id,
      name: member.name,
      avatarType: member.avatar === 'k-pink' ? 'k' : member.avatar,
      customAvatarMediaId: member.customAvatarMediaId,
    } satisfies CharacterProfile;
  }, [aiCharModalTargetId, characters, members]);

  const lastMessageDateTime = useMemo(
    () => getLastMessageDateTime(activeConversation.messages),
    [activeConversation.messages]
  );

  const suggestedStatusTime = useMemo(
    () =>
      getSuggestedStatusEventTime(
        activeConversation.messages,
        activeConversation.statusEvents ?? [],
        clockNow
      ),
    [activeConversation.messages, activeConversation.statusEvents, clockNow]
  );

  const [customTime, setCustomTime] = useState<CustomMessageTime>(() => ({
    enabled: false,
    ...getSuggestedCustomTime(activeConversation.messages),
  }));

  const stopPlayback = useCallback(() => {
    if (playbackTimerRef.current !== null) {
      window.clearTimeout(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
    setPlaybackConfig(null);
    setPlaybackCursor(null);
    setPlaybackBaseNow(null);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setClockNow(new Date()), 60000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    stopPlayback();
    setCustomTime({
      enabled: false,
      ...getSuggestedCustomTime(activeConversation.messages),
    });
  }, [activeConversation.id, stopPlayback]);

  useEffect(() => {
    setCustomTime((prev) => {
      if (prev.enabled) {
        return prev;
      }
      return {
        enabled: false,
        ...getSuggestedCustomTime(activeConversation.messages),
      };
    });
  }, [activeConversation.messages]);

  useEffect(() => {
    const syncViewFromLocation = () => {
      if (isTemplateSubpageLocation(window.location)) {
        setActiveView('template');
      } else if (isAiSubpageLocation(window.location)) {
        setActiveView('ai');
      } else {
        setActiveView('app');
      }
    };
    window.addEventListener('popstate', syncViewFromLocation);
    window.addEventListener('hashchange', syncViewFromLocation);
    return () => {
      window.removeEventListener('popstate', syncViewFromLocation);
      window.removeEventListener('hashchange', syncViewFromLocation);
    };
  }, []);

  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    saveActiveConversationId(activeConversationId);
  }, [activeConversationId]);

  useEffect(() => {
    saveAiConversations(aiConversations);
  }, [aiConversations]);

  useEffect(() => {
    saveActiveAiConversationId(activeAiConversationId);
  }, [activeAiConversationId]);

  useEffect(() => {
    saveAiCharacterConfigs(aiCharacterConfigs);
  }, [aiCharacterConfigs]);

  useEffect(() => {
    saveAiGlobalConfig(aiGlobalConfig);
  }, [aiGlobalConfig]);

  useEffect(() => {
    saveCharacters(characters);
  }, [characters]);

  useEffect(() => {
    saveActiveCharacterId(activeCharacterId);
  }, [activeCharacterId]);

  useEffect(() => {
    saveMembers(members);
  }, [members]);

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
      const now = new Date();
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversation.id
            ? {
                ...conv,
                messages: [...hydrateLegacyMessagesSentAt(conv.messages, now), msg],
              }
            : conv
        )
      );
    },
    [activeConversation.id]
  );

  const pushMessage = useCallback(
    (rawText: string): boolean => {
      const resolved = resolveOutgoingTimestamp(activeConversation.messages, customTime);
      if (!resolved.ok) {
        showToast(t.timeEarlierError(resolved.minTimestamp));
        return false;
      }
      const nextMsg = createOutgoingMessage(rawText, activeCharacter, new Date(), {
        timestamp: resolved.timestamp,
        sentAt: resolved.sentAt,
        dividerBefore: resolved.dividerBefore,
      });
      if (!nextMsg) {
        return false;
      }
      appendMessageToActive(nextMsg);
      invokeAction(actionsRef.current, 'onSendMessage', nextMsg.text ?? '', nextMsg);
      return true;
    },
    [activeCharacter, activeConversation.messages, appendMessageToActive, customTime, showToast, t]
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

  const playbackTimeline = useMemo(() => {
    if (!playbackConfig) {
      return [];
    }
    return buildPlaybackTimeline(
      activeConversation.messages,
      activeConversation.statusEvents ?? [],
      playbackConfig.includeStatusEvents,
      playbackBaseNow ?? clockNow
    );
  }, [
    playbackConfig,
    activeConversation.messages,
    activeConversation.statusEvents,
    playbackBaseNow,
    clockNow,
  ]);

  useEffect(() => {
    if (!playbackConfig || playbackCursor === null) {
      return;
    }
    if (playbackCursor >= playbackTimeline.length) {
      playbackTimerRef.current = window.setTimeout(() => {
        setPlaybackConfig(null);
        setPlaybackCursor(null);
        setPlaybackBaseNow(null);
        showToast(t.toastPlaybackDone);
      }, 450);
      return () => {
        if (playbackTimerRef.current !== null) {
          window.clearTimeout(playbackTimerRef.current);
          playbackTimerRef.current = null;
        }
      };
    }

    const delayMs = computePlaybackStepDelayMs(
      playbackTimeline,
      playbackCursor,
      playbackConfig.pacingMode,
      playbackConfig.evenIntervalSec,
      playbackConfig.timelineSubMode,
      playbackConfig.timelineScale
    );

    playbackTimerRef.current = window.setTimeout(() => {
      setPlaybackCursor((prev) => (prev === null ? null : prev + 1));
    }, delayMs);

    return () => {
      if (playbackTimerRef.current !== null) {
        window.clearTimeout(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
    };
  }, [playbackConfig, playbackCursor, playbackTimeline, showToast, t.toastPlaybackDone]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
      if (playbackTimerRef.current !== null) {
        window.clearTimeout(playbackTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setServerMenuOpen(false);
        setMobileSidebarOpen(false);
        setPlaybackModalOpen(false);
        setPendingUpload(null);
        setClearCacheOpen(false);
        setAiCharModalTargetId(null);
        setAiGlobalModalOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const playbackStepState = useMemo(() => {
    if (playbackCursor !== null && playbackConfig) {
      return computePlaybackStepState(
        playbackTimeline,
        playbackCursor,
        activeConversation.messages,
        members,
        playbackConfig.anchorToToday,
        playbackBaseNow ?? clockNow
      );
    }
    return {
      messages: computeDisplayMessagesForPlayback(activeConversation.messages, true, clockNow),
      members,
      hasVoiceTransition: false,
      hasOfflineTransition: false,
    };
  }, [
    playbackCursor,
    playbackConfig,
    playbackTimeline,
    activeConversation.messages,
    members,
    playbackBaseNow,
    clockNow,
  ]);

  const displayedMessages = playbackStepState.messages;
  const displayedMembers = playbackStepState.members;
  const effectiveVoiceExpanded =
    playbackConfig !== null && playbackConfig.includeStatusEvents
      ? voiceExpanded || playbackStepState.hasVoiceTransition
      : voiceExpanded;
  const effectiveOfflineExpanded =
    playbackConfig !== null && playbackConfig.includeStatusEvents
      ? offlineExpanded || playbackStepState.hasOfflineTransition
      : offlineExpanded;

  const handleCompleteOnboarding = () => {
    markOnboardingCompleted();
    setShowOnboarding(false);
  };

  const handleCloseTemplatePage = useCallback(() => {
    setActiveView('app');
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get('view') === 'template' || url.searchParams.get('view') === 'ai') {
        url.searchParams.delete('view');
      }
      const normPath = url.pathname.replace(/\/+$/, '').toLowerCase();
      if (normPath === '/template' || normPath === '/ai') {
        url.pathname = '/';
      }
      url.hash = '';
      window.history.pushState(null, '', url.toString());
    } catch {
    }
  }, []);

  const handleCompleteAiOnboarding = () => {
    markAiOnboardingCompleted();
    setShowAiOnboarding(false);
  };

  const handleOpenAiMode = useCallback(() => {
    stopPlayback();
    setPendingUpload(null);
    setPlaybackModalOpen(false);
    setServerMenuOpen(false);
    setMobileSidebarOpen(false);
    setMode('immersive');
    setActiveView('ai');
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get('view') === 'template') {
        url.searchParams.delete('view');
      }
      url.hash = '#ai';
      window.history.pushState(null, '', url.toString());
      if (url.searchParams.get('autostart') !== '1' && !isAiOnboardingCompleted()) {
        setShowAiOnboarding(true);
      }
    } catch {
      if (!isAiOnboardingCompleted()) {
        setShowAiOnboarding(true);
      }
    }
  }, [stopPlayback]);

  const handleExitAiMode = useCallback(() => {
    stopPlayback();
    setAiCharModalTargetId(null);
    setAiGlobalModalOpen(false);
    setServerMenuOpen(false);
    setMobileSidebarOpen(false);
    setActiveView('app');
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get('view') === 'ai') {
        url.searchParams.delete('view');
      }
      if (url.pathname.replace(/\/+$/, '').toLowerCase() === '/ai') {
        url.pathname = '/';
      }
      url.hash = '';
      window.history.pushState(null, '', url.toString());
    } catch {
    }
  }, [stopPlayback]);

  const handleSwitchStudioMode = () => {
    if (isAiMode) {
      stopPlayback();
      setPlaybackModalOpen(false);
      setAiGlobalModalOpen((prev) => !prev);
      return;
    }
    if (activeView === 'template') {
      handleCloseTemplatePage();
    }
    stopPlayback();
    setPlaybackModalOpen(false);
    setMode('studio');
    invokeAction(actionsRef.current, 'onWindowMinimize');
    invokeAction(actionsRef.current, 'onModeChange', 'studio');
    showToast(t.toastStudioMode);
  };

  const handleSwitchImmersiveMode = () => {
    if (isAiMode) {
      stopPlayback();
      setPlaybackModalOpen(false);
      setAiGlobalModalOpen(false);
      setAiCharModalTargetId(null);
      return;
    }
    if (activeView === 'template') {
      handleCloseTemplatePage();
    }
    stopPlayback();
    setPlaybackModalOpen(false);
    setPendingUpload(null);
    setMode('immersive');
    setServerMenuOpen(false);
    invokeAction(actionsRef.current, 'onWindowMaximize');
    invokeAction(actionsRef.current, 'onModeChange', 'immersive');
  };

  const handlePlaybackTrigger = () => {
    if (activeView === 'template') {
      handleCloseTemplatePage();
    }
    stopPlayback();
    setPendingUpload(null);
    setMode('immersive');
    setServerMenuOpen(false);
    setMobileSidebarOpen(false);
    setPlaybackModalOpen(true);
    invokeAction(actionsRef.current, 'onWindowClose');
    invokeAction(actionsRef.current, 'onModeChange', 'immersive');
  };

  const handleStartPlayback = (config: PlaybackConfig) => {
    const now = new Date();
    const timeline = buildPlaybackTimeline(
      activeConversation.messages,
      activeConversation.statusEvents ?? [],
      config.includeStatusEvents,
      now
    );
    const initialCursor = getInitialPlaybackCursor(timeline, config.startIndex);
    setMode('immersive');
    setPlaybackModalOpen(false);
    setPlaybackBaseNow(now);
    setPlaybackConfig(config);
    setPlaybackCursor(initialCursor);
  };

  const handleToggleServerMenu = () => {
    setServerMenuOpen((prev) => !prev);
    invokeAction(actionsRef.current, 'onServerMenuClick');
  };

  const handleSelectConversation = (conversationId: string) => {
    if (isAiMode) {
      setActiveAiConversationId(conversationId);
    } else {
      setActiveConversationId(conversationId);
    }
    setServerMenuOpen(false);
    setMobileSidebarOpen(false);
    invokeAction(actionsRef.current, 'onConversationSelect', conversationId);
  };

  const handleCreateConversation = (title: string, fromTemplate: boolean) => {
    const created = createNewConversation(title, isAiMode ? false : fromTemplate);
    if (!created) {
      return;
    }
    if (isAiMode) {
      if (fromTemplate) {
        created.messages = activeConversation.messages.map((m) => ({ ...m }));
      }
      setAiConversations((prev) => [...prev, created]);
      setActiveAiConversationId(created.id);
    } else {
      setConversations((prev) => [...prev, created]);
      setActiveConversationId(created.id);
    }
    setServerMenuOpen(false);
    setMobileSidebarOpen(false);
    invokeAction(actionsRef.current, 'onConversationCreate', created);
    showToast(t.toastConvCreated(created.title));
  };

  const handleDeleteConversation = (conversationId: string) => {
    if (isAiMode) {
      if (conversationId === AI_TEMPLATE_CONVERSATION_ID) {
        return;
      }
      setAiConversations((prev) => {
        const next = prev.filter((c) => c.id !== conversationId);
        if (activeAiConversationId === conversationId) {
          setActiveAiConversationId(next[0]?.id ?? AI_TEMPLATE_CONVERSATION_ID);
        }
        return next;
      });
      showToast(t.toastConvDeleted);
      return;
    }
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

  const handleDeleteMessage = (messageId: string) => {
    if (mode !== 'studio' && !isAiMode) {
      return;
    }
    if (isAiMode) {
      setAiConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversation.id
            ? { ...conv, messages: deleteMessageAndRebuildDividers(conv.messages, messageId) }
            : conv
        )
      );
    } else {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversation.id
            ? { ...conv, messages: deleteMessageAndRebuildDividers(conv.messages, messageId) }
            : conv
        )
      );
    }
    showToast(t.toastMessageDeleted);
  };

  const handleEditMessage = (messageId: string, nextText: string) => {
    if (!isAiMode && mode !== 'studio') {
      return;
    }
    const updateConv = (conv: Conversation) =>
      conv.id === activeConversation.id
        ? { ...conv, messages: editMessageText(conv.messages, messageId, nextText) }
        : conv;
    if (isAiMode) {
      setAiConversations((prev) => prev.map(updateConv));
    } else {
      setConversations((prev) => prev.map(updateConv));
    }
    showToast(t.toastMessageUpdated);
  };

  const appendAiCharacterReply = useCallback(
    (
      convId: string,
      speaker: CharacterProfile,
      replyText: string,
      historySnapshot: ChatMessage[]
    ): ChatMessage | null => {
      const now = new Date();
      const resolved = resolveOutgoingTimestamp(historySnapshot, undefined, now);
      if (!resolved.ok) {
        return null;
      }
      const createdMsg = createOutgoingMessage(replyText, speaker, now, {
        timestamp: resolved.timestamp,
        sentAt: resolved.sentAt,
        dividerBefore: resolved.dividerBefore,
      });
      if (!createdMsg) {
        return null;
      }
      setAiConversations((prev) =>
        prev.map((conv) =>
          conv.id === convId
            ? {
                ...conv,
                messages: [...conv.messages, createdMsg],
              }
            : conv
        )
      );
      return createdMsg;
    },
    []
  );

  const runAiReplyTurn = useCallback(
    async (convId: string, historyBeforeReply: ChatMessage[], triggerText: string) => {
      const selection = resolveAiResponder(
        triggerText,
        characters,
        aiCharacterConfigs,
        aiGlobalConfig
      );
      if (selection.kind === 'none_configured') {
        showToast(t.aiToastNoConfiguredChar);
        return;
      }
      if (selection.kind === 'mentioned_missing_key') {
        showToast(t.aiToastTargetMissingKey(selection.character.name));
        return;
      }

      aiBusyRef.current = true;
      const firstSpeaker = selection.character;
      setAiGeneratingName(firstSpeaker.name);
      try {
        const replyText = await requestAiCompletion({
          targetCharacter: firstSpeaker,
          charConfig: getAiCharacterConfig(aiCharacterConfigs, firstSpeaker.id),
          globalConfig: aiGlobalConfig,
          history: historyBeforeReply,
          allCharacters: characters,
        });
        const firstMsg = appendAiCharacterReply(
          convId,
          firstSpeaker,
          replyText,
          historyBeforeReply
        );
        const historyAfterFirst = firstMsg
          ? [...historyBeforeReply, firstMsg]
          : historyBeforeReply;

        const secondSpeaker = pickAiFollowUpResponder(
          firstSpeaker.id,
          characters,
          aiCharacterConfigs,
          aiGlobalConfig
        );
        if (secondSpeaker) {
          setAiGeneratingName(secondSpeaker.name);
          try {
            const followUpText = await requestAiCompletion({
              targetCharacter: secondSpeaker,
              charConfig: getAiCharacterConfig(aiCharacterConfigs, secondSpeaker.id),
              globalConfig: aiGlobalConfig,
              history: historyAfterFirst,
              allCharacters: characters,
            });
            appendAiCharacterReply(convId, secondSpeaker, followUpText, historyAfterFirst);
          } catch (err) {
            const reason = err instanceof Error ? err.message : 'Error';
            showToast(t.aiToastRequestFailed(secondSpeaker.name, reason));
          }
        }
      } catch (err) {
        const reason = err instanceof Error ? err.message : 'Error';
        showToast(t.aiToastRequestFailed(firstSpeaker.name, reason));
      } finally {
        setAiGeneratingName(null);
        aiBusyRef.current = false;
      }
    },
    [aiCharacterConfigs, aiGlobalConfig, appendAiCharacterReply, characters, showToast, t]
  );

  const handleRegenerateMessage = useCallback(
    async (messageId: string) => {
      if (!isAiMode) {
        return;
      }
      if (aiBusyRef.current) {
        showToast(t.aiToastBusy);
        return;
      }
      const conv = activeConversation;
      const target = prepareRegenerateTarget(conv.messages, messageId, characters, '__user__');
      if (!target) {
        return;
      }
      if (target.mode === 'replace_ai' && target.targetCharacter) {
        const speaker = target.targetCharacter;
        const cred = resolveEffectiveAiCredentials(
          getAiCharacterConfig(aiCharacterConfigs, speaker.id),
          aiGlobalConfig
        );
        if (!cred.ready) {
          showToast(t.aiToastTargetMissingKey(speaker.name));
          return;
        }
        aiBusyRef.current = true;
        setAiGeneratingName(speaker.name);
        try {
          const nextReply = await requestAiCompletion({
            targetCharacter: speaker,
            charConfig: getAiCharacterConfig(aiCharacterConfigs, speaker.id),
            globalConfig: aiGlobalConfig,
            history: target.historyBeforeTarget,
            allCharacters: characters,
          });
          setAiConversations((prev) =>
            prev.map((item) =>
              item.id === conv.id
                ? {
                    ...item,
                    messages: editMessageText(item.messages, messageId, nextReply),
                  }
                : item
            )
          );
          showToast(t.toastMessageUpdated);
        } catch (err) {
          const reason = err instanceof Error ? err.message : 'Error';
          showToast(t.aiToastRequestFailed(speaker.name, reason));
        } finally {
          setAiGeneratingName(null);
          aiBusyRef.current = false;
        }
        return;
      }

      setAiConversations((prev) =>
        prev.map((item) =>
          item.id === conv.id ? { ...item, messages: target.historyBeforeTarget } : item
        )
      );
      await runAiReplyTurn(conv.id, target.historyBeforeTarget, target.triggerText);
    },
    [
      activeConversation,
      aiCharacterConfigs,
      aiGlobalConfig,
      characters,
      isAiMode,
      runAiReplyTurn,
      showToast,
      t,
    ]
  );

  const handleExportData = async () => {
    try {
      const mediaIds = collectReferencedMediaIds(
        [...conversations, ...aiConversations],
        characters,
        members
      );
      const media: NightcordBackupPayload['media'] = {};
      for (const mediaId of mediaIds) {
        const blob = await loadLocalMediaBlob(mediaId);
        if (!blob) {
          continue;
        }
        const dataBase64 = await blobToBase64(blob);
        media[mediaId] = {
          mimeType: blob.type || 'application/octet-stream',
          dataBase64,
        };
      }
      const payload: NightcordBackupPayload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        conversations,
        aiConversations,
        characters,
        members,
        activeConversationId: mainActiveConversation.id,
        activeAiConversationId: aiActiveConversation.id,
        activeCharacterId: activeCharacter.id,
        aiCharacterConfigs,
        aiGlobalConfig,
        media,
      };
      const jsonBlob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(jsonBlob);
      const now = new Date();
      const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
        now.getDate()
      ).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(
        now.getMinutes()
      ).padStart(2, '0')}`;
      const a = document.createElement('a');
      a.href = url;
      a.download = `nightcord-backup-${stamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setServerMenuOpen(false);
      showToast(t.toastExportSuccess);
    } catch {
      showToast(t.toastImportInvalid);
    }
  };

  const handleImportFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }
    try {
      const text = await file.text();
      const parsed = parseNightcordBackup(text);
      if (!parsed) {
        showToast(t.toastImportInvalid);
        return;
      }
      for (const [mediaId, entry] of Object.entries(parsed.media)) {
        const blob = base64ToBlob(entry.dataBase64, entry.mimeType);
        await saveLocalMediaBlob(mediaId, blob);
      }
      stopPlayback();
      setAiCharModalTargetId(null);
      setAiGlobalModalOpen(false);
      setConversations(parsed.conversations);
      if (parsed.aiConversations && parsed.aiConversations.length > 0) {
        setAiConversations(parsed.aiConversations);
        const importedAiActive =
          parsed.activeAiConversationId &&
          parsed.aiConversations.some((c) => c.id === parsed.activeAiConversationId)
            ? parsed.activeAiConversationId
            : parsed.aiConversations[0].id;
        setActiveAiConversationId(importedAiActive);
      }
      if (parsed.aiCharacterConfigs) {
        setAiCharacterConfigs(parsed.aiCharacterConfigs);
      }
      if (parsed.aiGlobalConfig) {
        setAiGlobalConfig(parsed.aiGlobalConfig);
      }
      setCharacters(parsed.characters);
      setMembers(parsed.members);
      setActiveConversationId(parsed.activeConversationId);
      setActiveCharacterId(parsed.activeCharacterId);
      setServerMenuOpen(false);
      setMobileSidebarOpen(false);
      const nextActive =
        parsed.conversations.find((c) => c.id === parsed.activeConversationId) ??
        parsed.conversations[0];
      setCustomTime({
        enabled: false,
        ...getSuggestedCustomTime(nextActive.messages),
      });
      showToast(t.toastImportSuccess(parsed.conversations.length));
    } catch {
      showToast(t.toastImportInvalid);
    }
  };

  const handleConfirmClearCache = async () => {
    stopPlayback();
    await clearLocalCacheData();
    const initialConvs = createInitialConversations();
    const initialAiConvs = createInitialAiConversations();
    setConversations(initialConvs);
    setActiveConversationId(TEMPLATE_CONVERSATION_ID);
    setAiConversations(initialAiConvs);
    setActiveAiConversationId(AI_TEMPLATE_CONVERSATION_ID);
    setAiCharacterConfigs({});
    setAiGlobalConfig({ ...DEFAULT_AI_GLOBAL_CONFIG });
    setCharacters(INITIAL_CHARACTERS);
    setActiveCharacterId(INITIAL_CHARACTERS[0].id);
    setMembers(INITIAL_VOICE_MEMBERS);
    setVoiceExpanded(true);
    setOfflineExpanded(false);
    setFormatActive(false);
    setInputValue('');
    setClearCacheOpen(false);
    setServerMenuOpen(false);
    setMobileSidebarOpen(false);
    setCustomTime({
      enabled: false,
      ...getSuggestedCustomTime(initialConvs[0].messages),
    });
    showToast(t.toastCacheCleared);
  };

  const handleSyncCustomTimeNow = () => {
    setCustomTime({
      enabled: true,
      ...getSuggestedCustomTime(activeConversation.messages),
    });
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

  const handleSetMemberStatus = (member: VoiceMember, status: MemberPresenceStatus) => {
    const result = setMemberPresenceStatus(members, member.id, status);
    setMembers(result.members);
    if (status === 'offline') {
      setOfflineExpanded(true);
    } else if (status === 'voice') {
      setVoiceExpanded(true);
    }
    if (result.updated) {
      if (status === 'online') {
        showToast(t.toastMemberOnline(result.updated.name));
      } else if (status === 'voice') {
        showToast(t.toastMemberVoice(result.updated.name));
      } else {
        showToast(t.toastMemberOffline(result.updated.name));
      }
    }
  };

  const handleScheduleMemberStatus = (
    member: VoiceMember,
    status: MemberPresenceStatus,
    sentAt: MessageDateTime
  ) => {
    const now = new Date();
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id !== activeConversation.id) {
          return conv;
        }
        const hydratedMessages = hydrateLegacyMessagesSentAt(conv.messages, now);
        const { events } = addMemberStatusEvent(
          conv.statusEvents ?? [],
          member.id,
          status,
          sentAt,
          now
        );
        return {
          ...conv,
          messages: hydratedMessages,
          statusEvents: events,
        };
      })
    );
    const statusLabel =
      status === 'online'
        ? t.statusOnlineBtn
        : status === 'voice'
          ? t.statusVoiceBtn
          : t.statusOfflineBtn;
    showToast(t.toastStatusEventAdded(member.name, statusLabel, formatDateTimeBadge(sentAt)));
  };

  const handleDeleteStatusEvent = (eventId: string) => {
    const updater = (prev: Conversation[]) =>
      prev.map((conv) =>
        conv.id === activeConversation.id
          ? {
              ...conv,
              statusEvents: removeMemberStatusEvent(conv.statusEvents ?? [], eventId),
            }
          : conv
      );
    if (isAiMode) {
      setAiConversations(updater);
    } else {
      setConversations(updater);
    }
    showToast(t.toastStatusEventRemoved);
  };

  const handleClearStatusEvents = () => {
    const updater = (prev: Conversation[]) =>
      prev.map((conv) =>
        conv.id === activeConversation.id ? { ...conv, statusEvents: [] } : conv
      );
    if (isAiMode) {
      setAiConversations(updater);
    } else {
      setConversations(updater);
    }
    showToast(t.toastStatusEventsCleared);
  };

  const handleRemoveCharacter = (member: VoiceMember) => {
    const res = removeCharacterAndMember(characters, members, activeCharacterId, member.id);
    if (!res.removed) {
      showToast(t.toastCannotRemoveLastChar);
      return;
    }
    setCharacters(res.characters);
    setMembers(res.members);
    setActiveCharacterId(res.activeCharacterId);
    setAiCharacterConfigs((prev) => {
      if (!(member.id in prev)) {
        return prev;
      }
      const next = { ...prev };
      delete next[member.id];
      return next;
    });
    const stripEvents = (prev: Conversation[]) =>
      prev.map((conv) =>
        conv.statusEvents?.some((ev) => ev.memberId === member.id)
          ? {
              ...conv,
              statusEvents: conv.statusEvents.filter((ev) => ev.memberId !== member.id),
            }
          : conv
      );
    setConversations(stripEvents);
    setAiConversations(stripEvents);
    showToast(t.toastCharRemoved(member.name));
  };

  const handleOpenTutorial = () => {
    setServerMenuOpen(false);
    setMobileSidebarOpen(false);
    if (isAiMode) {
      setShowAiOnboarding(true);
    } else {
      setShowOnboarding(true);
    }
  };

  const handleOpenTemplatePage = () => {
    stopPlayback();
    setServerMenuOpen(false);
    setMobileSidebarOpen(false);
    setActiveView('template');
    try {
      const url = new URL(window.location.href);
      url.hash = '#template';
      window.history.pushState(null, '', url.toString());
    } catch {
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
    if (!inputValue.trim()) {
      return;
    }
    if (isAiMode) {
      if (aiBusyRef.current) {
        showToast(t.aiToastBusy);
        return;
      }
      const rawText = inputValue;
      const now = new Date();
      const convId = activeConversation.id;
      const resolved = resolveOutgoingTimestamp(activeConversation.messages, undefined, now);
      if (!resolved.ok) {
        return;
      }
      const userSender: CharacterProfile = {
        id: '__user__',
        name: aiGlobalConfig.userDisplayName.trim() || 'あなた',
        avatarType: aiGlobalConfig.userAvatar || 'k',
      };
      const userMsg = createOutgoingMessage(rawText, userSender, now, {
        timestamp: resolved.timestamp,
        sentAt: resolved.sentAt,
        dividerBefore: resolved.dividerBefore,
      });
      if (!userMsg) {
        return;
      }
      const updatedHistory = [...activeConversation.messages, userMsg];
      setAiConversations((prev) =>
        prev.map((conv) => (conv.id === convId ? { ...conv, messages: updatedHistory } : conv))
      );
      setInputValue('');
      void runAiReplyTurn(convId, updatedHistory, rawText);
      return;
    }
    if (mode !== 'studio') {
      return;
    }
    if (pushMessage(inputValue)) {
      setInputValue('');
    }
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
    const savedChar = res.saved;
    setCharacters(res.characters);
    setMembers((prev) => syncUpsertMemberFromCharacter(prev, savedChar));
    setActiveCharacterId(savedChar.id);
    invokeAction(actionsRef.current, 'onCharacterSave', savedChar);
    showToast(t.toastCharSaved(savedChar.name));
  };

  const openPendingUpload = (file: File | undefined, forcedKind?: FileMediaKind) => {
    if (!file || mode !== 'studio') {
      return;
    }
    setPendingUpload({ file, forcedKind });
  };

  const handleImageFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    openPendingUpload(file, 'image');
  };

  const handleVideoFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    openPendingUpload(file, 'video');
  };

  const handleAudioFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    openPendingUpload(file, 'audio');
  };

  const handleAnyFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    openPendingUpload(file);
  };

  const handleConfirmFileSend = async (options: {
    file: File;
    filename: string;
    kind: FileMediaKind;
    displayMode: 'card' | 'image';
  }) => {
    const resolved = resolveOutgoingTimestamp(activeConversation.messages, customTime);
    if (!resolved.ok) {
      showToast(t.timeEarlierError(resolved.minTimestamp));
      return;
    }
    const mediaId = `${options.kind}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    await saveLocalMediaBlob(mediaId, options.file);
    const meta = formatNightcordFileMeta(options.file.size, options.filename, options.kind);
    const msg = createFileMessage(
      {
        mediaId,
        kind: options.kind,
        filename: options.filename,
        sizeLabel: meta.sizeLabel,
        fileType: meta.fileType,
        displayMode: options.kind === 'image' ? options.displayMode : 'card',
      },
      activeCharacter,
      inputValue,
      new Date(),
      {
        timestamp: resolved.timestamp,
        sentAt: resolved.sentAt,
        dividerBefore: resolved.dividerBefore,
      }
    );
    appendMessageToActive(msg);
    setInputValue('');
    setPendingUpload(null);
    invokeAction(actionsRef.current, 'onSendMessage', msg.text ?? '', msg);
    showToast(t.toastFileSaved);
  };

  const handleMentionCharacter = (name: string) => {
    if (mode !== 'studio' && !isAiMode) {
      return;
    }
    setInputValue((prev) => appendInputToken(prev, `@${name} `));
    invokeAction(actionsRef.current, 'onMentionClick');
  };

  const handleFormatClick = () => {
    if (mode !== 'studio' && !isAiMode) {
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
    if (mode !== 'studio' && !isAiMode) {
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
    anyFileInputRef.current?.click();
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
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/*"
        onChange={handleVideoFileChange}
        className="hidden"
      />
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/mpeg,.mp3,audio/*"
        onChange={handleAudioFileChange}
        className="hidden"
      />
      <input
        ref={anyFileInputRef}
        type="file"
        accept="image/*,video/mp4,video/*,audio/mpeg,.mp3,audio/*,.txt,.md,text/plain"
        onChange={handleAnyFileChange}
        className="hidden"
      />
      <input
        ref={importInputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleImportFileChange}
        className="hidden"
      />

      <div className="flex h-[28px] min-h-[28px] w-full shrink-0 select-none items-center justify-end border-b border-[#191322] bg-[#211A2C] px-3.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-action="mode-studio"
            aria-label={isAiMode ? t.aiGlobalModalTitle : 'ロール切替モード'}
            aria-pressed={isAiMode ? aiGlobalModalOpen : mode === 'studio'}
            title={isAiMode ? t.aiGlobalModalTitle : 'ロール切替モード'}
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
            aria-label={t.playbackModalTitle}
            aria-pressed={playbackConfig !== null}
            title={t.playbackModalTitle}
            onClick={handlePlaybackTrigger}
            className={`h-[11px] w-[11px] cursor-pointer rounded-full bg-[#EB7F97] transition-transform hover:scale-110 hover:brightness-110 ${
              playbackConfig !== null ? 'animate-pulse ring-2 ring-[#EB7F97]/50' : ''
            }`}
          />
        </div>
      </div>

      {activeView === 'template' ? (
        <UiTemplateSubpage
          lang={lang}
          onSelectLanguage={setLang}
          onBack={handleCloseTemplatePage}
          onNotify={showToast}
        />
      ) : (
        <div className="relative flex min-h-0 flex-1">
        <Sidebar
          lang={lang}
          mode={mode}
          aiMode={isAiMode}
          aiReadyMemberIds={aiReadyMemberIds}
          conversations={displayedConversations}
          activeConversationId={activeConversation.id}
          activeChannelTitle={activeConversation.title}
          voiceExpanded={effectiveVoiceExpanded}
          offlineExpanded={effectiveOfflineExpanded}
          members={displayedMembers}
          mobileOpen={mobileSidebarOpen}
          serverMenuOpen={serverMenuOpen}
          suggestedStatusTime={suggestedStatusTime}
          activeStatusEvents={activeConversation.statusEvents ?? []}
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
          onSetMemberStatus={handleSetMemberStatus}
          onScheduleMemberStatus={handleScheduleMemberStatus}
          onDeleteStatusEvent={handleDeleteStatusEvent}
          canRemoveCharacter={characters.length > 1 && members.length > 1}
          onRemoveCharacter={handleRemoveCharacter}
          onExportData={handleExportData}
          onTriggerImportData={() => importInputRef.current?.click()}
          onRequestClearCache={() => {
            setServerMenuOpen(false);
            setClearCacheOpen(true);
          }}
          onOpenTutorial={handleOpenTutorial}
          onOpenTemplatePage={handleOpenTemplatePage}
          onOpenAiMode={handleOpenAiMode}
          onExitAiMode={handleExitAiMode}
          onOpenMemberAiSettings={(member) => {
            setAiCharModalTargetId(member.id);
          }}
        />
        <ChatArea
          lang={lang}
          channelTitle={activeConversation.title}
          mode={mode}
          aiMode={isAiMode}
          aiGeneratingName={aiGeneratingName}
          aiReadyCount={aiReadyMemberIds.size}
          messages={displayedMessages}
          isPlaying={playbackConfig !== null}
          animatedFromIndex={playbackConfig ? playbackConfig.startIndex : null}
          characters={characters}
          activeCharacter={activeCharacter}
          inputValue={inputValue}
          formatActive={formatActive}
          onOpenSidebar={() => handleSetMobileSidebar(true)}
          onInputChange={setInputValue}
          onSubmitMessage={handleSubmitMessage}
          onChatHeaderClick={handleChatHeaderClick}
          onMessageClick={handleMessageClick}
          onDeleteMessage={handleDeleteMessage}
          onEditMessage={handleEditMessage}
          onRegenerateMessage={handleRegenerateMessage}
          onOpenAiGlobalSettings={() => setAiGlobalModalOpen(true)}
          onOpenAiGuide={() => setShowAiOnboarding(true)}
          onAvatarClick={handleAvatarClick}
          onFileDownload={handleFileDownload}
          onMentionCharacter={handleMentionCharacter}
          onFormatClick={handleFormatClick}
          onEmojiClick={handleEmojiClick}
          onAttachClick={handleAttachClick}
          onSelectCharacter={handleSelectCharacter}
          onSaveCharacter={handleSaveCharacter}
          onTriggerImageUpload={() => imageInputRef.current?.click()}
          onTriggerVideoUpload={() => videoInputRef.current?.click()}
          onTriggerAudioUpload={() => audioInputRef.current?.click()}
          customTime={customTime}
          lastMessageDateTime={lastMessageDateTime}
          onChangeCustomTime={setCustomTime}
          onSyncCustomTimeNow={handleSyncCustomTimeNow}
        />
        </div>
      )}

      <PlaybackSetupModal
        open={playbackModalOpen}
        lang={lang}
        messages={activeConversation.messages}
        statusEvents={activeConversation.statusEvents ?? []}
        members={members}
        onDeleteStatusEvent={handleDeleteStatusEvent}
        onClearStatusEvents={handleClearStatusEvents}
        onCancel={() => setPlaybackModalOpen(false)}
        onStart={handleStartPlayback}
      />

      <ImageSendModal
        file={pendingUpload?.file ?? null}
        forcedKind={pendingUpload?.forcedKind}
        lang={lang}
        onCancel={() => setPendingUpload(null)}
        onConfirm={handleConfirmFileSend}
      />

      <ClearCacheModal
        open={clearCacheOpen}
        lang={lang}
        onCancel={() => setClearCacheOpen(false)}
        onConfirmClear={handleConfirmClearCache}
      />

      <OnboardingModal
        open={showOnboarding}
        lang={lang}
        onSelectLanguage={setLang}
        onComplete={handleCompleteOnboarding}
      />

      <AiOnboardingModal
        open={showAiOnboarding}
        lang={lang}
        onComplete={handleCompleteAiOnboarding}
        onOpenGlobalSettings={() => setAiGlobalModalOpen(true)}
      />

      <CharacterAiModal
        lang={lang}
        open={aiCharModalTarget !== null}
        character={aiCharModalTarget}
        initialConfig={
          aiCharModalTarget
            ? getAiCharacterConfig(aiCharacterConfigs, aiCharModalTarget.id)
            : getAiCharacterConfig(aiCharacterConfigs, '')
        }
        globalConfig={aiGlobalConfig}
        onClose={() => setAiCharModalTargetId(null)}
        onSave={(charId, nextCfg) => {
          setAiCharacterConfigs((prev) => ({
            ...prev,
            [charId]: nextCfg,
          }));
          const charName = characters.find((c) => c.id === charId)?.name ?? charId;
          showToast(t.toastAiCharSaved(charName));
        }}
      />

      <AiGlobalSettingsModal
        lang={lang}
        open={aiGlobalModalOpen}
        globalConfig={aiGlobalConfig}
        characters={characters}
        characterConfigs={aiCharacterConfigs}
        onClose={() => setAiGlobalModalOpen(false)}
        onSave={(nextGlobal, nextCharConfigs) => {
          setAiGlobalConfig(nextGlobal);
          setAiCharacterConfigs(nextCharConfigs);
          showToast(t.toastAiGlobalSaved);
        }}
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
