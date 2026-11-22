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

export type AiProtocol = 'openai' | 'gemini' | 'anthropic';

export interface AiCharacterConfig {
  protocol: AiProtocol;
  baseUrl: string;
  apiKey: string;
  model: string;
  systemPrompt: string;
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
}

export interface NightcordBackupMediaEntry {
  mimeType: string;
  dataBase64: string;
}

export interface NightcordBackupPayload {
  version: 1;
  exportedAt: string;
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
