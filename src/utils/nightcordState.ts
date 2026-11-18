import type {
  AvatarType,
  CharacterProfile,
  ChatImageMedia,
  ChatMessage,
  ChatVoiceMedia,
  Conversation,
  NightcordActions,
  VoiceMember,
} from '../types/nightcord';

export const INITIAL_VOICE_MEMBERS: VoiceMember[] = [
  { id: 'k', name: 'K', avatar: 'k-pink', muted: false, online: true },
  { id: 'yuki', name: '雪', avatar: 'yuki', muted: false, online: true },
  { id: 'enanan', name: 'えななん', avatar: 'enanan', muted: false, online: true },
  { id: 'amia', name: 'Amia', avatar: 'amia', muted: false, online: true },
];

export const INITIAL_CHARACTERS: CharacterProfile[] = [
  { id: 'k', name: 'K', avatarType: 'k' },
  { id: 'yuki', name: '雪', avatarType: 'yuki' },
  { id: 'enanan', name: 'えななん', avatarType: 'enanan' },
  { id: 'amia', name: 'Amia', avatarType: 'amia' },
];

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    memberId: 'amia',
    username: 'Amia',
    avatar: 'amia',
    timestamp: '昨日 16:13',
    text: 'ありがと！',
    topClipped: true,
  },
  {
    id: 'msg-2',
    memberId: 'yuki',
    username: '雪',
    avatar: 'yuki',
    timestamp: '昨日 16:15',
    text: '聴いとくね',
  },
  {
    id: 'msg-3',
    memberId: 'enanan',
    username: 'えななん',
    avatar: 'enanan',
    timestamp: '昨日 20:36',
    text: 'じゃ、一旦落ちる',
  },
  {
    id: 'msg-4',
    memberId: 'k',
    username: 'K',
    avatar: 'k',
    timestamp: '昨日 20:38',
    text: 'うん。また25時に',
  },
  {
    id: 'msg-5',
    memberId: 'enanan',
    username: 'えななん',
    avatar: 'enanan',
    timestamp: '昨日 20:39',
    text: 'はーい',
  },
  {
    id: 'msg-6',
    memberId: 'amia',
    username: 'Amia',
    avatar: 'amia',
    timestamp: '昨日 23:45',
    text: '誰かいるー？',
  },
  {
    id: 'msg-7',
    memberId: 'k',
    username: 'K',
    avatar: 'k',
    timestamp: '昨日 23:46',
    text: 'いるよ',
  },
  {
    id: 'msg-8',
    memberId: 'enanan',
    username: 'えななん',
    avatar: 'enanan',
    timestamp: '今日 1:36',
    dividerBefore: '今日',
    attachments: [
      { id: 'file-a', filename: 'ラフA.jpg', sizeLabel: '5MB JPG', fileType: 'JPG' },
      { id: 'file-b', filename: 'ラフB.jpg', sizeLabel: '3MB JPG', fileType: 'JPG' },
    ],
  },
];

export const TEMPLATE_CONVERSATION_ID = 'template-work';

export function createInitialConversations(): Conversation[] {
  return [
    {
      id: TEMPLATE_CONVERSATION_ID,
      title: '作業',
      isTemplate: true,
      messages: INITIAL_MESSAGES,
    },
  ];
}

export function createNewConversation(
  rawTitle: string,
  fromTemplate: boolean = false,
  now: Date = new Date()
): Conversation | null {
  const title = rawTitle.trim();
  if (!title) {
    return null;
  }
  return {
    id: `conv-${now.getTime()}-${Math.random().toString(36).slice(2, 6)}`,
    title,
    isTemplate: false,
    messages: fromTemplate ? INITIAL_MESSAGES.map((m) => ({ ...m })) : [],
  };
}

export function formatJapaneseTime(date: Date): string {
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `今日 ${hours}:${minutes}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes}B`;
  }
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))}KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function formatDuration(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export function createOutgoingMessage(
  rawText: string,
  sender: CharacterProfile = INITIAL_CHARACTERS[0],
  now: Date = new Date()
): ChatMessage | null {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return null;
  }
  return {
    id: `msg-${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
    memberId: sender.id,
    username: sender.name,
    avatar: sender.avatarType,
    customAvatarMediaId: sender.customAvatarMediaId,
    timestamp: formatJapaneseTime(now),
    text: trimmed,
  };
}

export function createImageMessage(
  imageMedia: ChatImageMedia,
  sender: CharacterProfile,
  caption?: string,
  now: Date = new Date()
): ChatMessage {
  const trimmed = caption?.trim();
  return {
    id: `msg-${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
    memberId: sender.id,
    username: sender.name,
    avatar: sender.avatarType,
    customAvatarMediaId: sender.customAvatarMediaId,
    timestamp: formatJapaneseTime(now),
    text: trimmed || undefined,
    imageMedia,
  };
}

export function createVoiceMessage(
  voiceMedia: ChatVoiceMedia,
  sender: CharacterProfile,
  now: Date = new Date()
): ChatMessage {
  return {
    id: `msg-${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
    memberId: sender.id,
    username: sender.name,
    avatar: sender.avatarType,
    customAvatarMediaId: sender.customAvatarMediaId,
    timestamp: formatJapaneseTime(now),
    voiceMedia,
  };
}

export function upsertCharacter(
  characters: CharacterProfile[],
  draft: {
    id?: string;
    name: string;
    avatarType: AvatarType;
    customAvatarMediaId?: string;
  },
  now: Date = new Date()
): { characters: CharacterProfile[]; saved: CharacterProfile | null } {
  const trimmedName = draft.name.trim();
  if (!trimmedName) {
    return { characters, saved: null };
  }
  if (draft.id) {
    let saved: CharacterProfile | null = null;
    const next = characters.map((item) => {
      if (item.id !== draft.id) {
        return item;
      }
      saved = {
        ...item,
        name: trimmedName,
        avatarType: draft.avatarType,
        customAvatarMediaId: draft.customAvatarMediaId,
      };
      return saved;
    });
    if (saved) {
      return { characters: next, saved };
    }
  }
  const created: CharacterProfile = {
    id: `char-${now.getTime()}-${Math.random().toString(36).slice(2, 6)}`,
    name: trimmedName,
    avatarType: draft.avatarType,
    customAvatarMediaId: draft.customAvatarMediaId,
  };
  return { characters: [...characters, created], saved: created };
}

export function toggleMemberMute(members: VoiceMember[], memberId: string): {
  members: VoiceMember[];
  updated: VoiceMember | null;
} {
  let updated: VoiceMember | null = null;
  const next = members.map((member) => {
    if (member.id !== memberId) {
      return member;
    }
    const nextMember = { ...member, muted: !member.muted };
    updated = nextMember;
    return nextMember;
  });
  return { members: next, updated };
}

export function appendInputToken(current: string, token: string): string {
  if (!current) {
    return token;
  }
  return `${current}${token}`;
}

export function invokeAction<K extends keyof NightcordActions>(
  actions: Partial<NightcordActions>,
  key: K,
  ...args: Parameters<NonNullable<NightcordActions[K]>>
): boolean {
  const handler = actions[key] as ((...params: unknown[]) => void) | undefined;
  if (typeof handler === 'function') {
    handler(...args);
    return true;
  }
  return false;
}
