export type AvatarType = 'k' | 'k-pink' | 'yuki' | 'enanan' | 'amia';

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

export interface ChatMessage {
  id: string;
  memberId: string;
  username: string;
  avatar: AvatarType;
  timestamp: string;
  text?: string;
  attachments?: ChatAttachment[];
  topClipped?: boolean;
  dividerBefore?: string;
}

export interface NightcordActions {
  onWindowMinimize?: () => void;
  onWindowMaximize?: () => void;
  onWindowClose?: () => void;
  onServerMenuClick?: () => void;
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
