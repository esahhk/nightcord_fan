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

export function formatCustomJapaneseTime(day: 'yesterday' | 'today', timeHHMM: string): string | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(timeHHMM.trim());
  if (!match) {
    return null;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }
  const prefix = day === 'yesterday' ? '昨日' : '今日';
  return `${prefix} ${hours}:${String(minutes).padStart(2, '0')}`;
}

export function parseJapaneseTimestampToMinutes(timestamp: string): number | null {
  const match = /^(昨日|今日)\s+(\d{1,2}):(\d{2})$/.exec(timestamp.trim());
  if (!match) {
    return null;
  }
  const dayOffset = match[1] === '昨日' ? 0 : 1440;
  const hours = Number(match[2]);
  const minutes = Number(match[3]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }
  return dayOffset + hours * 60 + minutes;
}

export function getLastMessageTimestamp(messages: ChatMessage[]): string | null {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const ts = messages[i]?.timestamp;
    if (ts && parseJapaneseTimestampToMinutes(ts) !== null) {
      return ts;
    }
  }
  return null;
}

export function isTimestampNotEarlierThanPrevious(
  candidateTimestamp: string,
  messages: ChatMessage[]
): boolean {
  const candidateMinutes = parseJapaneseTimestampToMinutes(candidateTimestamp);
  if (candidateMinutes === null) {
    return false;
  }
  const prevTs = getLastMessageTimestamp(messages);
  if (!prevTs) {
    return true;
  }
  const prevMinutes = parseJapaneseTimestampToMinutes(prevTs);
  if (prevMinutes === null) {
    return true;
  }
  return candidateMinutes >= prevMinutes;
}

export function getSuggestedCustomTime(
  messages: ChatMessage[],
  now: Date = new Date()
): { day: 'yesterday' | 'today'; time: string } {
  const nowStr = formatJapaneseTime(now);
  const nowMinutes = parseJapaneseTimestampToMinutes(nowStr) ?? 1440;
  const prevTs = getLastMessageTimestamp(messages);
  const prevMinutes = prevTs ? parseJapaneseTimestampToMinutes(prevTs) : null;
  const targetMinutes = prevMinutes !== null && prevMinutes > nowMinutes ? prevMinutes : nowMinutes;
  const day: 'yesterday' | 'today' = targetMinutes < 1440 ? 'yesterday' : 'today';
  const dayMinutes = targetMinutes % 1440;
  const hh = String(Math.floor(dayMinutes / 60)).padStart(2, '0');
  const mm = String(dayMinutes % 60).padStart(2, '0');
  return { day, time: `${hh}:${mm}` };
}

export function resolveOutgoingTimestamp(
  messages: ChatMessage[],
  customTime?: { enabled: boolean; day: 'yesterday' | 'today'; time: string },
  now: Date = new Date()
): { ok: true; timestamp: string; dividerBefore?: string } | { ok: false; minTimestamp: string } {
  const prevTs = getLastMessageTimestamp(messages);
  let timestamp: string;

  if (customTime?.enabled) {
    const formatted = formatCustomJapaneseTime(customTime.day, customTime.time);
    if (!formatted || !isTimestampNotEarlierThanPrevious(formatted, messages)) {
      return { ok: false, minTimestamp: prevTs ?? formatJapaneseTime(now) };
    }
    timestamp = formatted;
  } else {
    const autoTs = formatJapaneseTime(now);
    const autoMin = parseJapaneseTimestampToMinutes(autoTs);
    const prevMin = prevTs ? parseJapaneseTimestampToMinutes(prevTs) : null;
    if (prevTs && prevMin !== null && autoMin !== null && autoMin < prevMin) {
      timestamp = prevTs;
    } else {
      timestamp = autoTs;
    }
  }

  const dividerBefore =
    prevTs && prevTs.startsWith('昨日 ') && timestamp.startsWith('今日 ') ? '今日' : undefined;

  return { ok: true, timestamp, dividerBefore };
}

export const MAX_PLAYBACK_INTERVAL_MS = 40000;

export function computePlaybackDelayMs(
  messages: ChatMessage[],
  nextIndex: number,
  pacingMode: 'timeline' | 'even',
  evenIntervalSec: number = 2.5
): number {
  if (pacingMode === 'even') {
    const safeSec = Number.isFinite(evenIntervalSec) ? evenIntervalSec : 2.5;
    return Math.min(MAX_PLAYBACK_INTERVAL_MS, Math.max(500, Math.round(safeSec * 1000)));
  }

  if (nextIndex <= 0 || nextIndex >= messages.length) {
    return 1200;
  }

  const prevMin = parseJapaneseTimestampToMinutes(messages[nextIndex - 1]?.timestamp ?? '');
  const nextMin = parseJapaneseTimestampToMinutes(messages[nextIndex]?.timestamp ?? '');
  if (prevMin === null || nextMin === null) {
    return 2000;
  }

  const diffMin = Math.max(0, nextMin - prevMin);
  if (diffMin === 0) {
    return 1200;
  }

  return Math.min(MAX_PLAYBACK_INTERVAL_MS, Math.max(1000, diffMin * 1000));
}

export function collectReferencedMediaIds(
  conversations: Conversation[],
  characters: CharacterProfile[]
): string[] {
  const ids = new Set<string>();
  for (const char of characters) {
    if (char.customAvatarMediaId) {
      ids.add(char.customAvatarMediaId);
    }
  }
  for (const conv of conversations) {
    for (const msg of conv.messages) {
      if (msg.customAvatarMediaId) {
        ids.add(msg.customAvatarMediaId);
      }
      if (msg.imageMedia?.mediaId) {
        ids.add(msg.imageMedia.mediaId);
      }
      if (msg.voiceMedia?.mediaId) {
        ids.add(msg.voiceMedia.mediaId);
      }
    }
  }
  return Array.from(ids);
}

export function parseNightcordBackup(rawText: string): {
  conversations: Conversation[];
  characters: CharacterProfile[];
  activeConversationId: string;
  activeCharacterId: string;
  media: Record<string, { mimeType: string; dataBase64: string }>;
} | null {
  try {
    const parsed = JSON.parse(rawText) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    if (!Array.isArray(parsed.conversations) || parsed.conversations.length === 0) {
      return null;
    }

    const validConversations: Conversation[] = [];
    for (const item of parsed.conversations) {
      if (!item || typeof item !== 'object') {
        continue;
      }
      const conv = item as Record<string, unknown>;
      if (
        typeof conv.id === 'string' &&
        conv.id.trim() &&
        typeof conv.title === 'string' &&
        conv.title.trim() &&
        Array.isArray(conv.messages)
      ) {
        validConversations.push({
          id: conv.id,
          title: conv.title,
          isTemplate: Boolean(conv.isTemplate),
          messages: conv.messages as ChatMessage[],
        });
      }
    }

    if (validConversations.length === 0) {
      return null;
    }

    const hasTemplate = validConversations.some((c) => c.id === TEMPLATE_CONVERSATION_ID);
    const conversations = hasTemplate
      ? validConversations
      : [...createInitialConversations(), ...validConversations];

    const validCharacters: CharacterProfile[] = [];
    if (Array.isArray(parsed.characters)) {
      for (const item of parsed.characters) {
        if (!item || typeof item !== 'object') {
          continue;
        }
        const char = item as Record<string, unknown>;
        if (
          typeof char.id === 'string' &&
          char.id.trim() &&
          typeof char.name === 'string' &&
          char.name.trim() &&
          typeof char.avatarType === 'string'
        ) {
          validCharacters.push({
            id: char.id,
            name: char.name,
            avatarType: char.avatarType as AvatarType,
            customAvatarMediaId:
              typeof char.customAvatarMediaId === 'string' ? char.customAvatarMediaId : undefined,
          });
        }
      }
    }
    const characters = validCharacters.length > 0 ? validCharacters : INITIAL_CHARACTERS;

    const requestedConvId =
      typeof parsed.activeConversationId === 'string' ? parsed.activeConversationId : '';
    const activeConversationId = conversations.some((c) => c.id === requestedConvId)
      ? requestedConvId
      : conversations[0].id;

    const requestedCharId =
      typeof parsed.activeCharacterId === 'string' ? parsed.activeCharacterId : '';
    const activeCharacterId = characters.some((c) => c.id === requestedCharId)
      ? requestedCharId
      : characters[0].id;

    const media: Record<string, { mimeType: string; dataBase64: string }> = {};
    if (parsed.media && typeof parsed.media === 'object' && !Array.isArray(parsed.media)) {
      for (const [key, val] of Object.entries(parsed.media as Record<string, unknown>)) {
        if (!val || typeof val !== 'object') {
          continue;
        }
        const entry = val as Record<string, unknown>;
        if (typeof entry.dataBase64 === 'string' && typeof entry.mimeType === 'string') {
          media[key] = {
            mimeType: entry.mimeType,
            dataBase64: entry.dataBase64,
          };
        }
      }
    }

    return {
      conversations,
      characters,
      activeConversationId,
      activeCharacterId,
      media,
    };
  } catch {
    return null;
  }
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

export function extractFileType(filename: string): string {
  const parts = filename.trim().split('.');
  if (parts.length < 2) {
    return 'IMG';
  }
  const ext = parts[parts.length - 1].replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return ext ? ext.slice(0, 4) : 'IMG';
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
  now: Date = new Date(),
  override?: { timestamp?: string; dividerBefore?: string }
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
    timestamp: override?.timestamp ?? formatJapaneseTime(now),
    dividerBefore: override?.dividerBefore,
    text: trimmed,
  };
}

export function createImageMessage(
  imageMedia: ChatImageMedia,
  sender: CharacterProfile,
  caption?: string,
  now: Date = new Date(),
  override?: { timestamp?: string; dividerBefore?: string }
): ChatMessage {
  const trimmed = caption?.trim();
  return {
    id: `msg-${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
    memberId: sender.id,
    username: sender.name,
    avatar: sender.avatarType,
    customAvatarMediaId: sender.customAvatarMediaId,
    timestamp: override?.timestamp ?? formatJapaneseTime(now),
    dividerBefore: override?.dividerBefore,
    text: trimmed || undefined,
    imageMedia,
  };
}

export function createVoiceMessage(
  voiceMedia: ChatVoiceMedia,
  sender: CharacterProfile,
  now: Date = new Date(),
  override?: { timestamp?: string; dividerBefore?: string }
): ChatMessage {
  return {
    id: `msg-${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
    memberId: sender.id,
    username: sender.name,
    avatar: sender.avatarType,
    customAvatarMediaId: sender.customAvatarMediaId,
    timestamp: override?.timestamp ?? formatJapaneseTime(now),
    dividerBefore: override?.dividerBefore,
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
