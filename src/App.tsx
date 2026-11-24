import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { AiAutoChatModal } from './components/AiAutoChatModal';
import { AiGlobalSettingsModal } from './components/AiGlobalSettingsModal';
import { AiOnboardingModal } from './components/AiOnboardingModal';
import { AiUsageModal } from './components/AiUsageModal';
import { CharacterAiModal } from './components/CharacterAiModal';
import { ChatArea } from './components/ChatArea';
import { ClearCacheModal } from './components/ClearCacheModal';
import { CopyAiToMainModal } from './components/CopyAiToMainModal';
import { ImageSendModal } from './components/ImageSendModal';
import { WorkChannelIcon } from './components/NightcordArt';
import { OnboardingModal } from './components/OnboardingModal';
import { PlaybackSetupModal } from './components/PlaybackSetupModal';
import { Sidebar } from './components/Sidebar';
import { UiTemplateSubpage } from './components/UiTemplateSubpage';
import type {
  AiAutoChatConfig,
  AiCharacterConfig,
  AiGlobalConfig,
  AiUsageRecord,
  AiUsageState,
  AppMode,
  AvatarType,
  CharacterProfile,
  ChatAttachment,
  ChatFileMedia,
  ChatMessage,
  Conversation,
  CustomMessageTime,
  FileMediaKind,
  MemberPresenceStatus,
  MemberStatusEvent,
  MessageDateTime,
  NightcordActions,
  NightcordBackupPayload,
  PlaybackConfig,
  UiLanguage,
  VoiceMember,
} from './types/nightcord';
import {
  DEFAULT_AI_AUTO_CHAT_CONFIG,
  DEFAULT_AI_GLOBAL_CONFIG,
  appendUsageRecordToState,
  createEmptyUsageState,
  editMessageText,
  formatAiConversationTranscript,
  getAiCharacterConfig,
  getEligibleAiCharacters,
  isMemberOnlineForAi,
  parseAiModelOutput,
  pickAiAutonomousSpeaker,
  pickAiContinueResponder,
  pickAiFollowUpResponder,
  pickRandomMemberPresenceTransition,
  prepareRegenerateTarget,
  requestAiCompletion,
  resetSessionUsageState,
  resolveAiResponders,
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
  loadAiUsageState,
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
  saveAiUsageState,
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
  resolveClampedOutgoingTimestamp,
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
  const [aiUsageModalOpen, setAiUsageModalOpen] = useState(false);
  const [aiUsageState, setAiUsageState] = useState<AiUsageState>(() => loadAiUsageState());
  const [aiAutoChatOpen, setAiAutoChatOpen] = useState(false);
  const [aiAutoChatRunning, setAiAutoChatRunning] = useState(false);
  const [aiAutoChatConfig, setAiAutoChatConfig] = useState<AiAutoChatConfig>(() => ({
    ...DEFAULT_AI_AUTO_CHAT_CONFIG,
  }));
  const [pendingCopyAiToMain, setPendingCopyAiToMain] = useState<{
    suggestedTitle: string;
    messages: ChatMessage[];
    statusEvents: MemberStatusEvent[];
  } | null>(null);
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
  const aiAbortControllerRef = useRef<AbortController | null>(null);
  const aiAutoChatRunningRef = useRef(false);
  const aiAutoChatTimerRef = useRef<number | null>(null);
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

  const latestAutoChatContextRef = useRef({
    isAiMode,
    aiActiveConversation,
    characters,
    members,
    aiCharacterConfigs,
    aiGlobalConfig,
    aiAutoChatConfig,
    t,
  });
  latestAutoChatContextRef.current = {
    isAiMode,
    aiActiveConversation,
    characters,
    members,
    aiCharacterConfigs,
    aiGlobalConfig,
    aiAutoChatConfig,
    t,
  };

  const aiReadyMemberIds = useMemo(
    () =>
      new Set(
        getEligibleAiCharacters(characters, aiCharacterConfigs, aiGlobalConfig, members).map(
          (c) => c.id
        )
      ),
    [characters, aiCharacterConfigs, aiGlobalConfig, members]
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
    saveAiUsageState(aiUsageState);
  }, [aiUsageState]);

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

  const handleRecordAiUsage = useCallback((record: AiUsageRecord) => {
    setAiUsageState((prev) => appendUsageRecordToState(prev, record));
  }, []);

  const handleResetAiSessionUsage = useCallback(() => {
    setAiUsageState((prev) => resetSessionUsageState(prev));
    showToast(t.aiUsageToastSessionReset);
  }, [showToast, t.aiUsageToastSessionReset]);

  const appendMessageToActive = useCallback(
    (msg: ChatMessage) => {
      const now = new Date();
      const updater = (prev: Conversation[]) =>
        prev.map((conv) =>
          conv.id === activeConversation.id
            ? {
                ...conv,
                messages: [...hydrateLegacyMessagesSentAt(conv.messages, now), msg],
              }
            : conv
        );
      if (isAiMode) {
        setAiConversations(updater);
      } else {
        setConversations(updater);
      }
    },
    [activeConversation.id, isAiMode]
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
      aiAutoChatRunningRef.current = false;
      if (aiAutoChatTimerRef.current !== null) {
        window.clearTimeout(aiAutoChatTimerRef.current);
      }
      aiAbortControllerRef.current?.abort();
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
        setAiUsageModalOpen(false);
        setAiAutoChatOpen(false);
        setPendingCopyAiToMain(null);
        setShowOnboarding(false);
        setShowAiOnboarding(false);
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

  const stopAiAutoChat = useCallback(
    (showStoppedToast: boolean = false) => {
      if (aiAutoChatTimerRef.current !== null) {
        window.clearTimeout(aiAutoChatTimerRef.current);
        aiAutoChatTimerRef.current = null;
      }
      aiAutoChatRunningRef.current = false;
      setAiAutoChatRunning(false);
      if (aiAbortControllerRef.current) {
        aiAbortControllerRef.current.abort();
        aiAbortControllerRef.current = null;
      }
      aiBusyRef.current = false;
      setAiGeneratingName(null);
      if (showStoppedToast) {
        showToast(t.aiAutoChatToastStopped);
      }
    },
    [showToast, t.aiAutoChatToastStopped]
  );

  const handleExitAiMode = useCallback(() => {
    stopAiAutoChat(false);
    stopPlayback();
    setAiCharModalTargetId(null);
    setAiGlobalModalOpen(false);
    setAiUsageModalOpen(false);
    setAiAutoChatOpen(false);
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
  }, [stopAiAutoChat, stopPlayback]);

  useEffect(() => {
    if (activeView !== 'ai') {
      stopAiAutoChat(false);
      setAiCharModalTargetId(null);
      setAiGlobalModalOpen(false);
      setAiUsageModalOpen(false);
      setAiAutoChatOpen(false);
    }
  }, [activeView, stopAiAutoChat]);

  const handleSwitchStudioMode = () => {
    setServerMenuOpen(false);
    setMobileSidebarOpen(false);
    if (isAiMode) {
      stopPlayback();
      setPlaybackModalOpen(false);
      setAiUsageModalOpen(false);
      setAiAutoChatOpen(false);
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
    setServerMenuOpen(false);
    setMobileSidebarOpen(false);
    if (isAiMode) {
      stopPlayback();
      setPlaybackModalOpen(false);
      setAiGlobalModalOpen(false);
      setAiUsageModalOpen(false);
      setAiCharModalTargetId(null);
      if (aiAutoChatRunningRef.current) {
        stopAiAutoChat(true);
      } else {
        setAiAutoChatOpen((prev) => !prev);
      }
      return;
    }
    if (activeView === 'template') {
      handleCloseTemplatePage();
    }
    stopPlayback();
    setPlaybackModalOpen(false);
    setPendingUpload(null);
    setMode('immersive');
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
      stopAiAutoChat(false);
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
      stopAiAutoChat(false);
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
      stopAiAutoChat(false);
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

  const handleCopyAiToMain = useCallback(() => {
    const snapshotMessages = aiActiveConversation.messages.map((m) => ({
      ...m,
      attachments: m.attachments ? m.attachments.map((a) => ({ ...a })) : undefined,
      imageMedia: m.imageMedia ? { ...m.imageMedia } : undefined,
      fileMedia: m.fileMedia ? { ...m.fileMedia } : undefined,
      voiceMedia: m.voiceMedia ? { ...m.voiceMedia } : undefined,
      sentAt: m.sentAt ? { ...m.sentAt } : undefined,
    }));
    const snapshotEvents = (aiActiveConversation.statusEvents ?? []).map((ev) => ({
      ...ev,
      sentAt: { ...ev.sentAt },
    }));
    const baseTitle = aiActiveConversation.title.trim() || 'Nightcord';
    handleExitAiMode();
    setPendingCopyAiToMain({
      suggestedTitle: `${baseTitle} (AI)`,
      messages: snapshotMessages,
      statusEvents: snapshotEvents,
    });
  }, [aiActiveConversation, handleExitAiMode]);

  const handleConfirmCopyAiToMain = (rawTitle: string) => {
    if (!pendingCopyAiToMain) {
      return;
    }
    const created = createNewConversation(rawTitle, false);
    if (!created) {
      return;
    }
    const baseStamp = Date.now();
    const clonedMessages = pendingCopyAiToMain.messages.map((msg, idx) => ({
      ...msg,
      id: `msg-copy-${baseStamp}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
    }));
    const clonedEvents = pendingCopyAiToMain.statusEvents.map((ev, idx) => ({
      ...ev,
      id: `st-copy-${baseStamp}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
    }));
    const filledConversation: Conversation = {
      ...created,
      messages: clonedMessages,
      statusEvents: clonedEvents,
    };
    setConversations((prev) => [...prev, filledConversation]);
    setActiveConversationId(filledConversation.id);
    setPendingCopyAiToMain(null);
    setServerMenuOpen(false);
    setMobileSidebarOpen(false);
    invokeAction(actionsRef.current, 'onConversationCreate', filledConversation);
    showToast(t.toastCopiedAiToMain(filledConversation.title));
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
      rawReply: string,
      historySnapshot: ChatMessage[],
      timeMode: AiGlobalConfig['timeMode'],
      toolSentAt?: MessageDateTime | null,
      structuredFileMedia?: ChatFileMedia
    ): ChatMessage | null => {
      const now = new Date();
      const parsed = parseAiModelOutput(rawReply, speaker.name);
      const effectiveFileMedia = structuredFileMedia ?? parsed.fileMedia;
      if (!parsed.text && !effectiveFileMedia) {
        return null;
      }
      const preferredDt = timeMode === 'ai_inferred' ? (toolSentAt ?? undefined) : undefined;
      const resolved = resolveClampedOutgoingTimestamp(historySnapshot, preferredDt, now);
      const createdMsg = effectiveFileMedia
        ? createFileMessage(effectiveFileMedia, speaker, parsed.text, now, {
            timestamp: resolved.timestamp,
            sentAt: resolved.sentAt,
            dividerBefore: resolved.dividerBefore,
          })
        : createOutgoingMessage(parsed.text, speaker, now, {
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

  const isAbortErr = (err: unknown): boolean =>
    (err instanceof DOMException && err.name === 'AbortError') ||
    (err instanceof Error && err.name === 'AbortError');

  const handleStopAiGeneration = useCallback(() => {
    if (aiAutoChatRunningRef.current) {
      stopAiAutoChat(false);
    } else if (aiAbortControllerRef.current) {
      aiAbortControllerRef.current.abort();
      aiAbortControllerRef.current = null;
    }
    showToast(t.aiToastAborted);
  }, [showToast, stopAiAutoChat, t.aiToastAborted]);

  const runAiReplyTurn = useCallback(
    async (convId: string, historyBeforeReply: ChatMessage[], triggerText: string) => {
      const resolution = resolveAiResponders(
        triggerText,
        characters,
        aiCharacterConfigs,
        aiGlobalConfig,
        Math.random,
        members
      );

      if (resolution.responders.length === 0) {
        if (resolution.offlineMentioned.length > 0) {
          showToast(t.aiToastCharOffline(resolution.offlineMentioned[0].name));
        } else if (resolution.missingKeyMentioned.length > 0) {
          showToast(t.aiToastTargetMissingKey(resolution.missingKeyMentioned[0].name));
        } else if (resolution.fallbackReason === 'none_online') {
          showToast(t.aiToastAllOffline);
        } else {
          showToast(t.aiToastNoConfiguredChar);
        }
        return;
      }

      if (resolution.offlineMentioned.length > 0) {
        showToast(
          t.aiToastPartialOffline(resolution.offlineMentioned.map((c) => c.name).join(', '))
        );
      } else if (resolution.missingKeyMentioned.length > 0) {
        showToast(
          t.aiToastPartialMissingKey(resolution.missingKeyMentioned.map((c) => c.name).join(', '))
        );
      }

      const controller = new AbortController();
      aiAbortControllerRef.current = controller;
      aiBusyRef.current = true;
      let rollingHistory = historyBeforeReply;
      let lastSpeaker = resolution.responders[0];
      let lastReplyText = '';

      try {
        for (const speaker of resolution.responders) {
          if (controller.signal.aborted) {
            break;
          }
          lastSpeaker = speaker;
          setAiGeneratingName(speaker.name);
          try {
            const completion = await requestAiCompletion({
              targetCharacter: speaker,
              charConfig: getAiCharacterConfig(aiCharacterConfigs, speaker.id),
              globalConfig: aiGlobalConfig,
              history: rollingHistory,
              allCharacters: characters,
              members,
              signal: controller.signal,
              purpose: 'chat',
              onUsageRecord: handleRecordAiUsage,
            });
            if (controller.signal.aborted) {
              break;
            }
            const nextMsg = appendAiCharacterReply(
              convId,
              speaker,
              completion.rawText,
              rollingHistory,
              aiGlobalConfig.timeMode,
              completion.toolSentAt,
              completion.structuredFileMedia
            );
            lastReplyText = nextMsg?.text ?? completion.rawText;
            if (nextMsg) {
              rollingHistory = [...rollingHistory, nextMsg];
            }
          } catch (err) {
            if (isAbortErr(err) || controller.signal.aborted) {
              break;
            }
            const reason = err instanceof Error ? err.message : 'Error';
            showToast(t.aiToastRequestFailed(speaker.name, reason));
          }
        }

        if (!controller.signal.aborted && resolution.responders.length === 1) {
          const secondSpeaker = pickAiFollowUpResponder(
            lastSpeaker.id,
            characters,
            aiCharacterConfigs,
            aiGlobalConfig,
            Math.random,
            members,
            lastReplyText
          );
          if (secondSpeaker) {
            setAiGeneratingName(secondSpeaker.name);
            try {
              const followUp = await requestAiCompletion({
                targetCharacter: secondSpeaker,
                charConfig: getAiCharacterConfig(aiCharacterConfigs, secondSpeaker.id),
                globalConfig: aiGlobalConfig,
                history: rollingHistory,
                allCharacters: characters,
                members,
                signal: controller.signal,
                purpose: 'follow_up',
                onUsageRecord: handleRecordAiUsage,
              });
              if (!controller.signal.aborted) {
                appendAiCharacterReply(
                  convId,
                  secondSpeaker,
                  followUp.rawText,
                  rollingHistory,
                  aiGlobalConfig.timeMode,
                  followUp.toolSentAt,
                  followUp.structuredFileMedia
                );
              }
            } catch (err) {
              if (!isAbortErr(err) && !controller.signal.aborted) {
                const reason = err instanceof Error ? err.message : 'Error';
                showToast(t.aiToastRequestFailed(secondSpeaker.name, reason));
              }
            }
          }
        }
      } finally {
        if (aiAbortControllerRef.current === controller) {
          aiAbortControllerRef.current = null;
        }
        setAiGeneratingName(null);
        aiBusyRef.current = false;
      }
    },
    [
      aiCharacterConfigs,
      aiGlobalConfig,
      appendAiCharacterReply,
      characters,
      handleRecordAiUsage,
      members,
      showToast,
      t,
    ]
  );

  const runAutonomousCycle = useCallback(
    async (lastSpeakerId?: string, overrideCfg?: AiAutoChatConfig) => {
      if (!aiAutoChatRunningRef.current) {
        return;
      }
      if (aiBusyRef.current) {
        const latestCfg = latestAutoChatContextRef.current.aiAutoChatConfig;
        const retryMs = Math.max(2, Math.min(20, latestCfg.intervalSec)) * 1000;
        aiAutoChatTimerRef.current = window.setTimeout(() => {
          aiAutoChatTimerRef.current = null;
          void runAutonomousCycle(lastSpeakerId);
        }, retryMs);
        return;
      }
      const ctx = latestAutoChatContextRef.current;
      if (!ctx.isAiMode) {
        stopAiAutoChat(false);
        return;
      }
      const cfg = overrideCfg ?? ctx.aiAutoChatConfig;
      const convId = ctx.aiActiveConversation.id;
      let activeMembers = ctx.members;

      if (cfg.randomPresence && lastSpeakerId !== undefined) {
        const transition = pickRandomMemberPresenceTransition(
          activeMembers,
          ctx.characters,
          ctx.aiCharacterConfigs,
          ctx.aiGlobalConfig,
          Math.random
        );
        if (transition.changedMember) {
          activeMembers = transition.members;
          setMembers(transition.members);
          if (transition.kind === 'status' && transition.changedMember.status === 'offline') {
            setOfflineExpanded(true);
          } else if (transition.kind === 'status' && transition.changedMember.status === 'voice') {
            setVoiceExpanded(true);
          }
        }
      }

      const picked = pickAiAutonomousSpeaker(
        ctx.aiActiveConversation.messages,
        lastSpeakerId,
        ctx.characters,
        ctx.aiCharacterConfigs,
        ctx.aiGlobalConfig,
        Math.random,
        activeMembers
      );
      if (!picked.character) {
        showToast(
          picked.reason === 'none_online' ? ctx.t.aiToastAllOffline : ctx.t.aiToastNoConfiguredChar
        );
        stopAiAutoChat(false);
        return;
      }

      const speaker = picked.character;
      const controller = new AbortController();
      aiAbortControllerRef.current = controller;
      aiBusyRef.current = true;
      setAiGeneratingName(speaker.name);
      const nextSpeakerAnchor = speaker.id;

      try {
        const completion = await requestAiCompletion({
          targetCharacter: speaker,
          charConfig: getAiCharacterConfig(ctx.aiCharacterConfigs, speaker.id),
          globalConfig: ctx.aiGlobalConfig,
          history: ctx.aiActiveConversation.messages,
          allCharacters: ctx.characters,
          members: activeMembers,
          signal: controller.signal,
          purpose: 'auto_chat',
          onUsageRecord: handleRecordAiUsage,
        });
        if (controller.signal.aborted || !aiAutoChatRunningRef.current) {
          return;
        }
        appendAiCharacterReply(
          convId,
          speaker,
          completion.rawText,
          ctx.aiActiveConversation.messages,
          ctx.aiGlobalConfig.timeMode,
          completion.toolSentAt,
          completion.structuredFileMedia
        );
      } catch (err) {
        if (isAbortErr(err) || controller.signal.aborted || !aiAutoChatRunningRef.current) {
          return;
        }
        const reason = err instanceof Error ? err.message : 'Error';
        showToast(ctx.t.aiToastRequestFailed(speaker.name, reason));
      } finally {
        if (aiAbortControllerRef.current === controller) {
          aiAbortControllerRef.current = null;
        }
        aiBusyRef.current = false;
        setAiGeneratingName(null);
      }

      if (!aiAutoChatRunningRef.current) {
        return;
      }
      const latestCfg = latestAutoChatContextRef.current.aiAutoChatConfig;
      const delayMs = Math.max(2, Math.min(20, latestCfg.intervalSec)) * 1000;
      aiAutoChatTimerRef.current = window.setTimeout(() => {
        aiAutoChatTimerRef.current = null;
        void runAutonomousCycle(nextSpeakerAnchor);
      }, delayMs);
    },
    [appendAiCharacterReply, handleRecordAiUsage, showToast, stopAiAutoChat]
  );

  const handleStartAiAutoChat = useCallback(
    (nextCfg: AiAutoChatConfig) => {
      setAiAutoChatConfig(nextCfg);
      const onlineEligible = getEligibleAiCharacters(
        characters,
        aiCharacterConfigs,
        aiGlobalConfig,
        members
      );
      if (onlineEligible.length === 0) {
        const configuredAny = getEligibleAiCharacters(characters, aiCharacterConfigs, aiGlobalConfig);
        showToast(configuredAny.length > 0 ? t.aiToastAllOffline : t.aiToastNoConfiguredChar);
        return;
      }
      if (aiBusyRef.current) {
        showToast(t.aiToastBusy);
        return;
      }
      setAiAutoChatOpen(false);
      if (aiAutoChatTimerRef.current !== null) {
        window.clearTimeout(aiAutoChatTimerRef.current);
        aiAutoChatTimerRef.current = null;
      }
      aiAutoChatRunningRef.current = true;
      setAiAutoChatRunning(true);
      showToast(t.aiAutoChatToastStarted);
      void runAutonomousCycle(undefined, nextCfg);
    },
    [
      aiCharacterConfigs,
      aiGlobalConfig,
      characters,
      members,
      runAutonomousCycle,
      showToast,
      t.aiAutoChatToastStarted,
      t.aiToastAllOffline,
      t.aiToastBusy,
      t.aiToastNoConfiguredChar,
    ]
  );

  const handleAiContinueTurn = useCallback(async () => {
    if (!isAiMode) {
      return;
    }
    if (aiBusyRef.current || aiAutoChatRunningRef.current) {
      showToast(t.aiToastBusy);
      return;
    }
    const conv = activeConversation;
    const lastNonUser = [...conv.messages]
      .reverse()
      .find((m) => m.memberId !== '__user__')?.memberId;
    const picked = pickAiContinueResponder(
      lastNonUser,
      characters,
      aiCharacterConfigs,
      aiGlobalConfig,
      Math.random,
      members
    );
    if (!picked.character) {
      showToast(
        picked.reason === 'none_online' ? t.aiToastAllOffline : t.aiToastNoConfiguredChar
      );
      return;
    }
    const speaker = picked.character;
    const controller = new AbortController();
    aiAbortControllerRef.current = controller;
    aiBusyRef.current = true;
    setAiGeneratingName(speaker.name);
    try {
      const completion = await requestAiCompletion({
        targetCharacter: speaker,
        charConfig: getAiCharacterConfig(aiCharacterConfigs, speaker.id),
        globalConfig: aiGlobalConfig,
        history: conv.messages,
        allCharacters: characters,
        members,
        signal: controller.signal,
        purpose: 'continue',
        onUsageRecord: handleRecordAiUsage,
      });
      if (!controller.signal.aborted) {
        appendAiCharacterReply(
          conv.id,
          speaker,
          completion.rawText,
          conv.messages,
          aiGlobalConfig.timeMode,
          completion.toolSentAt,
          completion.structuredFileMedia
        );
      }
    } catch (err) {
      if (!isAbortErr(err) && !controller.signal.aborted) {
        const reason = err instanceof Error ? err.message : 'Error';
        showToast(t.aiToastRequestFailed(speaker.name, reason));
      }
    } finally {
      if (aiAbortControllerRef.current === controller) {
        aiAbortControllerRef.current = null;
      }
      setAiGeneratingName(null);
      aiBusyRef.current = false;
    }
  }, [
    activeConversation,
    aiCharacterConfigs,
    aiGlobalConfig,
    appendAiCharacterReply,
    characters,
    handleRecordAiUsage,
    isAiMode,
    members,
    showToast,
    t,
  ]);

  const handleRegenerateMessage = useCallback(
    async (messageId: string) => {
      if (!isAiMode) {
        return;
      }
      if (aiBusyRef.current || aiAutoChatRunningRef.current) {
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
        if (!isMemberOnlineForAi(speaker.id, members)) {
          showToast(t.aiToastCharOffline(speaker.name));
          return;
        }
        const cred = resolveEffectiveAiCredentials(
          getAiCharacterConfig(aiCharacterConfigs, speaker.id),
          aiGlobalConfig
        );
        if (!cred.ready) {
          showToast(t.aiToastTargetMissingKey(speaker.name));
          return;
        }
        const controller = new AbortController();
        aiAbortControllerRef.current = controller;
        aiBusyRef.current = true;
        setAiGeneratingName(speaker.name);
        try {
          const completion = await requestAiCompletion({
            targetCharacter: speaker,
            charConfig: getAiCharacterConfig(aiCharacterConfigs, speaker.id),
            globalConfig: aiGlobalConfig,
            history: target.historyBeforeTarget,
            allCharacters: characters,
            members,
            signal: controller.signal,
            purpose: 'regenerate',
            onUsageRecord: handleRecordAiUsage,
          });
          if (controller.signal.aborted) {
            return;
          }
          const now = new Date();
          const parsed = parseAiModelOutput(completion.rawText, speaker.name);
          const effectiveFileMedia = completion.structuredFileMedia ?? parsed.fileMedia;
          if (!parsed.text && !effectiveFileMedia) {
            throw new Error('EMPTY_RESPONSE');
          }
          const preferredDt =
            aiGlobalConfig.timeMode === 'ai_inferred' ? completion.toolSentAt : null;
          const resolvedTime = preferredDt
            ? resolveClampedOutgoingTimestamp(target.historyBeforeTarget, preferredDt, now)
            : null;
          setAiConversations((prev) =>
            prev.map((item) =>
              item.id === conv.id
                ? {
                    ...item,
                    messages: item.messages.map((m) =>
                      m.id === messageId
                        ? {
                            ...m,
                            text: parsed.text || undefined,
                            attachments: undefined,
                            fileMedia: effectiveFileMedia,
                            ...(resolvedTime
                              ? {
                                  timestamp: resolvedTime.timestamp,
                                  sentAt: resolvedTime.sentAt,
                                  dividerBefore: resolvedTime.dividerBefore,
                                }
                              : {}),
                          }
                        : m
                    ),
                  }
                : item
            )
          );
          showToast(t.toastMessageUpdated);
        } catch (err) {
          if (!isAbortErr(err) && !controller.signal.aborted) {
            const reason = err instanceof Error ? err.message : 'Error';
            showToast(t.aiToastRequestFailed(speaker.name, reason));
          }
        } finally {
          if (aiAbortControllerRef.current === controller) {
            aiAbortControllerRef.current = null;
          }
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
      handleRecordAiUsage,
      isAiMode,
      members,
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
        members,
        [aiGlobalConfig.userAvatarMediaId]
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
        lang,
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

  const handleExportAiTranscript = () => {
    const content = formatAiConversationTranscript(aiActiveConversation);
    const txtBlob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(txtBlob);
    const a = document.createElement('a');
    const safeTitle = (aiActiveConversation.title || 'nightcord-ai').replace(/[/\\:*?"<>|]/g, '_');
    a.href = url;
    a.download = `${safeTitle}-ai-chat.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(t.aiToastTranscriptExported);
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
      stopAiAutoChat(false);
      stopPlayback();
      setAiCharModalTargetId(null);
      setAiGlobalModalOpen(false);
      setAiAutoChatOpen(false);
      setPendingCopyAiToMain(null);
      setConversations(parsed.conversations);
      let importedAiCount = 0;
      if (parsed.aiConversations && parsed.aiConversations.length > 0) {
        importedAiCount = parsed.aiConversations.length;
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
      if (parsed.lang) {
        setLang(parsed.lang);
      }
      setCharacters(parsed.characters);
      setMembers(parsed.members);
      setActiveConversationId(parsed.activeConversationId);
      setActiveCharacterId(parsed.activeCharacterId);
      setServerMenuOpen(false);
      setMobileSidebarOpen(false);
      const nextActive = isAiMode && parsed.aiConversations?.length
        ? (parsed.aiConversations.find((c) => c.id === parsed.activeAiConversationId) ??
          parsed.aiConversations[0])
        : (parsed.conversations.find((c) => c.id === parsed.activeConversationId) ??
          parsed.conversations[0]);
      setCustomTime({
        enabled: false,
        ...getSuggestedCustomTime(nextActive.messages),
      });
      const nextUiText = getUiText(parsed.lang ?? lang);
      showToast(nextUiText.toastImportSuccess(parsed.conversations.length, importedAiCount));
    } catch {
      showToast(t.toastImportInvalid);
    }
  };

  const handleConfirmClearCache = async () => {
    stopAiAutoChat(false);
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
    setAiUsageState(createEmptyUsageState());
    setAiUsageModalOpen(false);
    setAiAutoChatConfig({ ...DEFAULT_AI_AUTO_CHAT_CONFIG });
    setAiAutoChatOpen(false);
    setPendingCopyAiToMain(null);
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
    setServerMenuOpen(false);
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
    const updater = (prev: Conversation[]) =>
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
      });
    if (isAiMode) {
      setAiConversations(updater);
    } else {
      setConversations(updater);
    }
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
    stopAiAutoChat(false);
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
      const resolved = resolveClampedOutgoingTimestamp(activeConversation.messages, undefined, now);
      const userSender: CharacterProfile = {
        id: '__user__',
        name: aiGlobalConfig.userDisplayName.trim() || 'あなた',
        avatarType: aiGlobalConfig.userAvatar || 'k',
        customAvatarMediaId: aiGlobalConfig.userAvatarMediaId,
      };
      const userMsg = createOutgoingMessage(rawText, userSender, now, {
        timestamp: resolved.timestamp,
        sentAt: resolved.sentAt,
        dividerBefore: resolved.dividerBefore,
      });
      if (!userMsg) {
        return;
      }
      const hydratedHistory = hydrateLegacyMessagesSentAt(activeConversation.messages, now);
      const updatedHistory = [...hydratedHistory, userMsg];
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
    if (!file || (mode !== 'studio' && !isAiMode)) {
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
    if (isAiMode && aiBusyRef.current) {
      showToast(t.aiToastBusy);
      return;
    }
    const now = new Date();
    let resolvedStamp: { timestamp: string; sentAt: MessageDateTime; dividerBefore?: string };
    if (isAiMode) {
      resolvedStamp = resolveClampedOutgoingTimestamp(activeConversation.messages, undefined, now);
    } else {
      const checked = resolveOutgoingTimestamp(activeConversation.messages, customTime, now);
      if (!checked.ok) {
        showToast(t.timeEarlierError(checked.minTimestamp));
        return;
      }
      resolvedStamp = checked;
    }
    const mediaId = `${options.kind}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    await saveLocalMediaBlob(mediaId, options.file);
    let textPreview: string | undefined;
    if (options.kind === 'text') {
      const rawText = await options.file.text().catch(() => '');
      const sliced = rawText.slice(0, 4000).trim();
      if (sliced) {
        textPreview = sliced;
      }
    }
    const meta = formatNightcordFileMeta(options.file.size, options.filename, options.kind);
    const sender: CharacterProfile = isAiMode
      ? {
          id: '__user__',
          name: aiGlobalConfig.userDisplayName.trim() || 'あなた',
          avatarType: aiGlobalConfig.userAvatar || 'k',
          customAvatarMediaId: aiGlobalConfig.userAvatarMediaId,
        }
      : activeCharacter;
    const caption = inputValue;
    const msg = createFileMessage(
      {
        mediaId,
        kind: options.kind,
        filename: options.filename,
        sizeLabel: meta.sizeLabel,
        fileType: meta.fileType,
        displayMode: options.kind === 'image' ? options.displayMode : 'card',
        ...(textPreview ? { textPreview } : {}),
      },
      sender,
      caption,
      now,
      {
        timestamp: resolvedStamp.timestamp,
        sentAt: resolvedStamp.sentAt,
        dividerBefore: resolvedStamp.dividerBefore,
      }
    );
    const updatedHistory = [...activeConversation.messages, msg];
    appendMessageToActive(msg);
    setInputValue('');
    setPendingUpload(null);
    invokeAction(actionsRef.current, 'onSendMessage', msg.text ?? '', msg);
    showToast(t.toastFileSaved);
    if (isAiMode) {
      void runAiReplyTurn(
        activeConversation.id,
        updatedHistory,
        `${caption} ${options.filename}`.trim()
      );
    }
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
    if (mode !== 'studio' && !isAiMode) {
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
            aria-label={
              isAiMode
                ? aiAutoChatRunning
                  ? t.aiAutoChatHeaderStopBtn
                  : t.aiAutoChatModalTitle
                : '没入モード'
            }
            aria-pressed={isAiMode ? aiAutoChatRunning : mode === 'immersive'}
            title={
              isAiMode
                ? aiAutoChatRunning
                  ? t.aiAutoChatHeaderStopBtn
                  : t.aiAutoChatModalTitle
                : '没入モード'
            }
            onClick={handleSwitchImmersiveMode}
            className={`h-[11px] w-[11px] cursor-pointer rounded-full bg-[#F6CE71] transition-transform hover:scale-110 hover:brightness-110 ${
              isAiMode && aiAutoChatRunning ? 'animate-pulse ring-2 ring-[#F6CE71]/55' : ''
            }`}
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
          onCopyAiToMain={handleCopyAiToMain}
          onOpenMemberAiSettings={(member) => {
            setAiCharModalTargetId(member.id);
          }}
          aiGeneratingName={aiGeneratingName}
          aiAutoChatRunning={aiAutoChatRunning}
          onOpenAiGlobalSettings={() => {
            setServerMenuOpen(false);
            setMobileSidebarOpen(false);
            setAiGlobalModalOpen(true);
          }}
          onOpenAiUsage={() => {
            setServerMenuOpen(false);
            setMobileSidebarOpen(false);
            setAiUsageModalOpen(true);
          }}
          aiSessionRequestCount={aiUsageState.session.requestCount}
          onContinueAi={() => {
            setServerMenuOpen(false);
            setMobileSidebarOpen(false);
            void handleAiContinueTurn();
          }}
          onStopAi={() => {
            setServerMenuOpen(false);
            setMobileSidebarOpen(false);
            handleStopAiGeneration();
          }}
          onOpenAiAutoChat={() => {
            setServerMenuOpen(false);
            setMobileSidebarOpen(false);
            setAiAutoChatOpen(true);
          }}
          onStopAiAutoChat={() => {
            setServerMenuOpen(false);
            setMobileSidebarOpen(false);
            stopAiAutoChat(true);
          }}
        />
        <ChatArea
          lang={lang}
          channelTitle={activeConversation.title}
          mode={mode}
          aiMode={isAiMode}
          aiGeneratingName={aiGeneratingName}
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
          onStopAi={handleStopAiGeneration}
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
        isOnline={
          aiCharModalTarget ? isMemberOnlineForAi(aiCharModalTarget.id, members) : true
        }
        initialConfig={
          aiCharModalTarget
            ? getAiCharacterConfig(aiCharacterConfigs, aiCharModalTarget.id)
            : getAiCharacterConfig(aiCharacterConfigs, '')
        }
        globalConfig={aiGlobalConfig}
        onClose={() => setAiCharModalTargetId(null)}
        onUsageRecord={handleRecordAiUsage}
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
        members={members}
        characterConfigs={aiCharacterConfigs}
        onClose={() => setAiGlobalModalOpen(false)}
        onExportAiTranscript={handleExportAiTranscript}
        onUsageRecord={handleRecordAiUsage}
        onOpenUsageModal={() => setAiUsageModalOpen(true)}
        onSave={(nextGlobal, nextCharConfigs) => {
          setAiGlobalConfig(nextGlobal);
          setAiCharacterConfigs(nextCharConfigs);
          setAiConversations((prev) =>
            prev.map((conv) => ({
              ...conv,
              messages: conv.messages.map((m) =>
                m.memberId === '__user__'
                  ? {
                      ...m,
                      username: nextGlobal.userDisplayName || 'あなた',
                      avatar: nextGlobal.userAvatar || 'k',
                      customAvatarMediaId: nextGlobal.userAvatarMediaId,
                    }
                  : m
              ),
            }))
          );
          showToast(t.toastAiGlobalSaved);
        }}
      />

      <AiUsageModal
        open={aiUsageModalOpen}
        lang={lang}
        usageState={aiUsageState}
        onClose={() => setAiUsageModalOpen(false)}
        onResetSession={handleResetAiSessionUsage}
      />

      <AiAutoChatModal
        open={aiAutoChatOpen}
        lang={lang}
        initialConfig={aiAutoChatConfig}
        readyCount={aiReadyMemberIds.size}
        totalCount={characters.length}
        onClose={() => setAiAutoChatOpen(false)}
        onStart={handleStartAiAutoChat}
      />

      <CopyAiToMainModal
        open={pendingCopyAiToMain !== null}
        lang={lang}
        suggestedTitle={pendingCopyAiToMain?.suggestedTitle ?? ''}
        messageCount={pendingCopyAiToMain?.messages.length ?? 0}
        onCancel={() => setPendingCopyAiToMain(null)}
        onConfirm={handleConfirmCopyAiToMain}
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
