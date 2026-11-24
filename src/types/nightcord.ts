export type AvatarType = 'k' | 'k-pink' | 'yuki' | 'enanan' | 'amia';

export type AppMode = 'immersive' | 'studio';

export type UiLanguage = 'ja' | 'zh' | 'en';

export interface CharacterProfile {
  id: string;
  name: string;
  avatarType: AvatarType;
  customAvatarMediaId?: string;
}

export type MemberPresenceStatus = 'online' | 'voice' | 'offline';

export interface VoiceMember {
  id: string;
  name: string;
  avatar: AvatarType;
  customAvatarMediaId?: string;
  muted: boolean;
  online: boolean;
  status: MemberPresenceStatus;
}

export interface MemberStatusEvent {
  id: string;
  memberId: string;
  status: MemberPresenceStatus;
  sentAt: MessageDateTime;
}

export interface ChatAttachment {
  id: string;
  filename: string;
  sizeLabel: string;
  fileType: string;
}

export type FileMediaKind = 'image' | 'video' | 'audio' | 'text';

export interface MessageDateTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

export interface ChatFileMedia {
  mediaId: string;
  filename: string;
  sizeLabel: string;
  fileType: string;
  kind: FileMediaKind;
  displayMode?: 'card' | 'image';
  textPreview?: string;
}

export interface ChatImageMedia {
  mediaId: string;
  filename: string;
  sizeLabel: string;
  fileType: string;
  displayMode: 'card' | 'image';
}

export interface ChatVoiceMedia {
  mediaId: string;
  durationSec: number;
  filename: string;
}

export interface ChatMessage {
  id: string;
  memberId: string;
  username: string;
  avatar: AvatarType;
  customAvatarMediaId?: string;
  timestamp: string;
  sentAt?: MessageDateTime;
  text?: string;
  attachments?: ChatAttachment[];
  imageMedia?: ChatImageMedia;
  voiceMedia?: ChatVoiceMedia;
  fileMedia?: ChatFileMedia;
  topClipped?: boolean;
  dividerBefore?: string;
}

export type PlaybackPacingMode = 'timeline' | 'even';

export type PlaybackTimelineSubMode = 'exact' | 'proportional';

export interface PlaybackConfig {
  pacingMode: PlaybackPacingMode;
  timelineSubMode: PlaybackTimelineSubMode;
  timelineScale: number;
  evenIntervalSec: number;
  startIndex: number;
  anchorToToday: boolean;
  includeStatusEvents: boolean;
}

export interface CustomMessageTime {
  enabled: boolean;
  year: number;
  month: number;
  day: number;
  time: string;
}

export type AiProtocol = 'openai' | 'deepseek' | 'gemini' | 'anthropic';

export type AiTimeMode = 'realtime' | 'ai_inferred';

export type AiTimeFrequency = 'high' | 'somewhat_high' | 'balanced' | 'somewhat_low' | 'low';

export type AiOutputLanguage = 'auto' | 'zh-CN' | 'zh-TW' | 'en' | 'ja';

export type AiReplyLength = 'short' | 'normal' | 'detailed';

export interface AiCharacterConfig {
  protocol: AiProtocol;
  baseUrl: string;
  apiKey: string;
  model: string;
  systemPrompt: string;
  temperature?: number;
}

export interface AiGlobalConfig {
  useGlobalApi: boolean;
  protocol: AiProtocol;
  baseUrl: string;
  apiKey: string;
  model: string;
  aiFollowUpEnabled: boolean;
  aiFollowUpProbability: number;
  userDisplayName: string;
  userAvatar: AvatarType;
  userAvatarMediaId?: string;
  userPersona: string;
  worldviewPrompt: string;
  timeMode: AiTimeMode;
  timeFrequency: AiTimeFrequency;
  outputLanguage: AiOutputLanguage;
  replyLength: AiReplyLength;
  temperature: number;
  webSearchEnabled: boolean;
}

export interface AiAutoChatConfig {
  randomPresence: boolean;
  intervalSec: number;
}

export type AiUsagePurpose =
  | 'chat'
  | 'follow_up'
  | 'auto_chat'
  | 'continue'
  | 'regenerate'
  | 'time_analysis'
  | 'test';

export interface AiUsageRecord {
  id: string;
  timestampIso: string;
  protocol: AiProtocol;
  model: string;
  characterId: string;
  characterName: string;
  purpose: AiUsagePurpose;
  status: 'ok' | 'error';
  usageKnown: boolean;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  thinkingTokens: number | null;
  cachedTokens: number | null;
  extraTokens?: Record<string, number>;
  latencyMs?: number;
}

export interface AiUsageTotals {
  requestCount: number;
  knownUsageRequestCount: number;
  unknownUsageRequestCount: number;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  thinkingTokens: number | null;
  cachedTokens: number | null;
  extraTokens: Record<string, number>;
}

export interface AiUsageState {
  session: AiUsageTotals;
  sessionRecords: AiUsageRecord[];
  history: AiUsageTotals;
  historyRecords: AiUsageRecord[];
}

export interface NightcordBackupMediaEntry {
  mimeType: string;
  dataBase64: string;
}

export interface NightcordBackupPayload {
  version: 1;
  exportedAt: string;
  lang?: UiLanguage;
  conversations: Conversation[];
  aiConversations?: Conversation[];
  characters: CharacterProfile[];
  members?: VoiceMember[];
  activeConversationId?: string;
  activeAiConversationId?: string;
  activeCharacterId?: string;
  aiCharacterConfigs?: Record<string, AiCharacterConfig>;
  aiGlobalConfig?: AiGlobalConfig;
  media: Record<string, NightcordBackupMediaEntry>;
}

export interface Conversation {
  id: string;
  title: string;
  isTemplate?: boolean;
  messages: ChatMessage[];
  statusEvents?: MemberStatusEvent[];
}

export interface NightcordActions {
  onWindowMinimize?: () => void;
  onWindowMaximize?: () => void;
  onWindowClose?: () => void;
  onModeChange?: (mode: AppMode) => void;
  onServerMenuClick?: () => void;
  onConversationSelect?: (conversationId: string) => void;
  onConversationCreate?: (conversation: Conversation) => void;
  onCharacterSelect?: (character: CharacterProfile) => void;
  onCharacterSave?: (character: CharacterProfile) => void;
  onChannelSelect?: (channelId: string) => void;
  onVoiceCategoryToggle?: (expanded: boolean) => void;
  onOfflineCategoryToggle?: (expanded: boolean) => void;
  onMemberClick?: (member: VoiceMember) => void;
  onMicToggle?: (member: VoiceMember, nextMuted: boolean) => void;
  onChatHeaderClick?: (channelId: string) => void;
  onMessageClick?: (message: ChatMessage) => void;
  onAvatarClick?: (memberId: string, username: string) => void;
  onFileDownload?: (file: ChatAttachment) => void;
  onSendMessage?: (text: string, message: ChatMessage) => void;
  onMentionClick?: () => void;
  onFormatClick?: (nextFormatted: boolean) => void;
  onEmojiClick?: () => void;
  onAttachClick?: () => void;
  onSidebarToggle?: (open: boolean) => void;
}

export interface NightcordBridgeApi {
  registerActions: (actions: Partial<NightcordActions>) => void;
  getActions: () => Partial<NightcordActions>;
  sendMessage?: (text: string) => void;
  notify?: (text: string) => void;
}

declare global {
  interface Window {
    NightcordBridge?: NightcordBridgeApi;
  }
}
