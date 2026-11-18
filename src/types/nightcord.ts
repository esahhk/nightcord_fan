export type AvatarType = 'k' | 'k-pink' | 'yuki' | 'enanan' | 'amia';

export type AppMode = 'immersive' | 'studio';

export type UiLanguage = 'ja' | 'zh';

export interface CharacterProfile {
  id: string;
  name: string;
  avatarType: AvatarType;
  customAvatarMediaId?: string;
}

export interface VoiceMember {
  id: string;
  name: string;
  avatar: AvatarType;
  muted: boolean;
  online: boolean;
}

export interface ChatAttachment {
  id: string;
  filename: string;
  sizeLabel: string;
  fileType: string;
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
  text?: string;
  attachments?: ChatAttachment[];
  imageMedia?: ChatImageMedia;
  voiceMedia?: ChatVoiceMedia;
  topClipped?: boolean;
  dividerBefore?: string;
}

export type MessageDayKey = 'yesterday' | 'today';

export type PlaybackPacingMode = 'timeline' | 'even';

export interface PlaybackConfig {
  pacingMode: PlaybackPacingMode;
  evenIntervalSec: number;
  startIndex: number;
}

export interface CustomMessageTime {
  enabled: boolean;
  day: MessageDayKey;
  time: string;
}

export interface NightcordBackupMediaEntry {
  mimeType: string;
  dataBase64: string;
}

export interface NightcordBackupPayload {
  version: 1;
  exportedAt: string;
  conversations: Conversation[];
  characters: CharacterProfile[];
  activeConversationId?: string;
  activeCharacterId?: string;
  media: Record<string, NightcordBackupMediaEntry>;
}

export interface Conversation {
  id: string;
  title: string;
  isTemplate?: boolean;
  messages: ChatMessage[];
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
