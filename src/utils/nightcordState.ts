import type {
  AvatarType,
  CharacterProfile,
  ChatFileMedia,
  ChatImageMedia,
  ChatMessage,
  ChatVoiceMedia,
  Conversation,
  FileMediaKind,
  MemberPresenceStatus,
  MessageDateTime,
  NightcordActions,
  VoiceMember,
} from '../types/nightcord';

export const INITIAL_VOICE_MEMBERS: VoiceMember[] = [
  { id: 'k', name: 'K', avatar: 'k-pink', muted: false, online: true, status: 'voice' },
  { id: 'yuki', name: '雪', avatar: 'yuki', muted: false, online: true, status: 'voice' },
  { id: 'enanan', name: 'えななん', avatar: 'enanan', muted: false, online: true, status: 'voice' },
  { id: 'amia', name: 'Amia', avatar: 'amia', muted: false, online: true, status: 'voice' },
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

export function getDaysInMonth(year: number, month: number): number {
  const safeYear = Math.min(3000, Math.max(2000, Math.floor(year)));
  const safeMonth = Math.min(12, Math.max(1, Math.floor(month)));
  return new Date(Date.UTC(safeYear, safeMonth, 0)).getUTCDate();
}

export function dateToMessageDateTime(date: Date): MessageDateTime {
  return {
    year: Math.min(3000, Math.max(2000, date.getFullYear())),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
  };
}

export function dateTimeToEpochMinutes(dt: MessageDateTime): number {
  const utcMs = Date.UTC(dt.year, dt.month - 1, dt.day, dt.hour, dt.minute);
  return Math.floor(utcMs / 60000);
}

export function dayDiffBetween(
  target: { year: number; month: number; day: number },
  ref: { year: number; month: number; day: number }
): number {
  const targetUtc = Date.UTC(target.year, target.month - 1, target.day);
  const refUtc = Date.UTC(ref.year, ref.month - 1, ref.day);
  return Math.round((refUtc - targetUtc) / 86400000);
}

export function formatJapaneseTime(date: Date): string {
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `今日 ${hours}:${minutes}`;
}

export function formatTimestampRelativeToRef(
  dt: MessageDateTime,
  ref: { year: number; month: number; day: number }
): string {
  const mm = String(dt.minute).padStart(2, '0');
  const diff = dayDiffBetween(dt, ref);
  if (diff === 0) {
    return `今日 ${dt.hour}:${mm}`;
  }
  if (diff === 1) {
    return `昨日 ${dt.hour}:${mm}`;
  }
  if (dt.year === ref.year && dt.month === ref.month) {
    return `${dt.day}日 ${dt.hour}:${mm}`;
  }
  return `${dt.year}年${dt.month}月${dt.day}日`;
}

export function formatDateTimeBadge(dt: MessageDateTime): string {
  const mm = String(dt.minute).padStart(2, '0');
  return `${dt.year}/${dt.month}/${dt.day} ${dt.hour}:${mm}`;
}

export function parseCustomDateTimeInput(input: {
  year: number;
  month: number;
  day: number;
  time: string;
}): MessageDateTime | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(input.time.trim());
  if (!match) {
    return null;
  }
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }
  const year = Math.min(3000, Math.max(2000, Math.floor(input.year)));
  const month = Math.min(12, Math.max(1, Math.floor(input.month)));
  const maxDay = getDaysInMonth(year, month);
  const day = Math.min(maxDay, Math.max(1, Math.floor(input.day)));
  return { year, month, day, hour, minute };
}

export function parseLegacyJapaneseTimestamp(
  timestamp: string,
  baseNow: Date = new Date()
): MessageDateTime | null {
  const trimmed = timestamp.trim();
  const relMatch = /^(昨日|今日)\s+(\d{1,2}):(\d{2})$/.exec(trimmed);
  if (relMatch) {
    const d = new Date(baseNow.getFullYear(), baseNow.getMonth(), baseNow.getDate());
    if (relMatch[1] === '昨日') {
      d.setDate(d.getDate() - 1);
    }
    return {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
      hour: Number(relMatch[2]),
      minute: Number(relMatch[3]),
    };
  }
  const dayMatch = /^(\d{1,2})[日号]\s+(\d{1,2}):(\d{2})$/.exec(trimmed);
  if (dayMatch) {
    return {
      year: baseNow.getFullYear(),
      month: baseNow.getMonth() + 1,
      day: Number(dayMatch[1]),
      hour: Number(dayMatch[2]),
      minute: Number(dayMatch[3]),
    };
  }
  const fullMatch = /^(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})[日号](?:\s+(\d{1,2}):(\d{2}))?$/.exec(
    trimmed
  );
  if (fullMatch) {
    return {
      year: Number(fullMatch[1]),
      month: Number(fullMatch[2]),
      day: Number(fullMatch[3]),
      hour: fullMatch[4] ? Number(fullMatch[4]) : 0,
      minute: fullMatch[5] ? Number(fullMatch[5]) : 0,
    };
  }
  return null;
}

export function getMessageDateTime(
  msg: ChatMessage,
  baseNow: Date = new Date()
): MessageDateTime | null {
  if (msg.sentAt) {
    return msg.sentAt;
  }
  return parseLegacyJapaneseTimestamp(msg.timestamp, baseNow);
}

export function getLastMessageDateTime(
  messages: ChatMessage[],
  baseNow: Date = new Date()
): MessageDateTime | null {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const dt = getMessageDateTime(messages[i], baseNow);
    if (dt) {
      return dt;
    }
  }
  return null;
}

export function getLastMessageTimestamp(
  messages: ChatMessage[],
  baseNow: Date = new Date()
): string | null {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const msg = messages[i];
    if (msg?.sentAt) {
      return formatTimestampRelativeToRef(msg.sentAt, dateToMessageDateTime(baseNow));
    }
    if (msg?.timestamp) {
      return msg.timestamp;
    }
  }
  return null;
}

export function getSuggestedCustomTime(
  messages: ChatMessage[],
  now: Date = new Date()
): { year: number; month: number; day: number; time: string } {
  const nowDt = dateToMessageDateTime(now);
  const lastDt = getLastMessageDateTime(messages, now);
  const chosen =
    lastDt && dateTimeToEpochMinutes(lastDt) > dateTimeToEpochMinutes(nowDt) ? lastDt : nowDt;
  return {
    year: chosen.year,
    month: chosen.month,
    day: chosen.day,
    time: `${String(chosen.hour).padStart(2, '0')}:${String(chosen.minute).padStart(2, '0')}`,
  };
}

export function resolveOutgoingTimestamp(
  messages: ChatMessage[],
  customTime?: { enabled: boolean; year: number; month: number; day: number; time: string },
  now: Date = new Date()
):
  | { ok: true; timestamp: string; sentAt: MessageDateTime; dividerBefore?: string }
  | { ok: false; minTimestamp: string } {
  const refNow = dateToMessageDateTime(now);
  const prevDt = getLastMessageDateTime(messages, now);
  let sentAt: MessageDateTime;

  if (customTime?.enabled) {
    const parsed = parseCustomDateTimeInput(customTime);
    if (
      !parsed ||
      (prevDt && dateTimeToEpochMinutes(parsed) < dateTimeToEpochMinutes(prevDt))
    ) {
      const minLabel = prevDt ? formatDateTimeBadge(prevDt) : formatDateTimeBadge(refNow);
      return { ok: false, minTimestamp: minLabel };
    }
    sentAt = parsed;
  } else {
    sentAt =
      prevDt && dateTimeToEpochMinutes(refNow) < dateTimeToEpochMinutes(prevDt)
        ? prevDt
        : refNow;
  }

  const timestamp = formatTimestampRelativeToRef(sentAt, refNow);
  let dividerBefore: string | undefined;
  if (
    prevDt &&
    (prevDt.year !== sentAt.year || prevDt.month !== sentAt.month || prevDt.day !== sentAt.day)
  ) {
    const diff = dayDiffBetween(sentAt, refNow);
    if (diff === 0) {
      dividerBefore = '今日';
    } else if (diff === 1) {
      dividerBefore = '昨日';
    } else if (sentAt.year === refNow.year && sentAt.month === refNow.month) {
      dividerBefore = `${sentAt.day}日`;
    } else {
      dividerBefore = `${sentAt.year}年${sentAt.month}月${sentAt.day}日`;
    }
  }

  return { ok: true, timestamp, sentAt, dividerBefore };
}

export function computeDisplayMessagesForPlayback(
  visibleMessages: ChatMessage[],
  anchorToToday: boolean,
  baseNow: Date = new Date()
): ChatMessage[] {
  if (visibleMessages.length === 0) {
    return [];
  }
  const refDate = anchorToToday
    ? dateToMessageDateTime(baseNow)
    : (getMessageDateTime(visibleMessages[visibleMessages.length - 1], baseNow) ??
      dateToMessageDateTime(baseNow));

  let prevDayKey: string | null = null;
  return visibleMessages.map((msg) => {
    const dt = getMessageDateTime(msg, baseNow);
    if (!dt) {
      return msg;
    }
    const dayKey = `${dt.year}-${dt.month}-${dt.day}`;
    let dividerBefore: string | undefined;
    if (prevDayKey !== null && prevDayKey !== dayKey) {
      const diff = dayDiffBetween(dt, refDate);
      if (diff === 0) {
        dividerBefore = '今日';
      } else if (diff === 1) {
        dividerBefore = '昨日';
      } else if (dt.year === refDate.year && dt.month === refDate.month) {
        dividerBefore = `${dt.day}日`;
      } else {
        dividerBefore = `${dt.year}年${dt.month}月${dt.day}日`;
      }
    }
    prevDayKey = dayKey;
    return {
      ...msg,
      timestamp: formatTimestampRelativeToRef(dt, refDate),
      dividerBefore,
    };
  });
}

export const MAX_PLAYBACK_INTERVAL_MS = 40000;

export function computePlaybackDelayMs(
  messages: ChatMessage[],
  nextIndex: number,
  pacingMode: 'timeline' | 'even',
  evenIntervalSec: number = 2.5,
  baseNow: Date = new Date()
): number {
  if (pacingMode === 'even') {
    const safeSec = Number.isFinite(evenIntervalSec) ? evenIntervalSec : 2.5;
    return Math.min(MAX_PLAYBACK_INTERVAL_MS, Math.max(500, Math.round(safeSec * 1000)));
  }

  if (nextIndex <= 0 || nextIndex >= messages.length) {
    return 1200;
  }

  const prevDt = getMessageDateTime(messages[nextIndex - 1], baseNow);
  const nextDt = getMessageDateTime(messages[nextIndex], baseNow);
  if (!prevDt || !nextDt) {
    return 2000;
  }

  const diffMin = Math.max(0, dateTimeToEpochMinutes(nextDt) - dateTimeToEpochMinutes(prevDt));
  if (diffMin === 0) {
    return 1200;
  }

  return Math.min(MAX_PLAYBACK_INTERVAL_MS, Math.max(1000, diffMin * 1000));
}

export function detectFileMediaKind(filename: string, mimeType: string = ''): FileMediaKind {
  const lowerName = filename.toLowerCase();
  const lowerMime = mimeType.toLowerCase();
  if (lowerMime.startsWith('video/') || /\.(mp4|mov|webm|mkv)$/.test(lowerName)) {
    return 'video';
  }
  if (lowerMime.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|flac)$/.test(lowerName)) {
    return 'audio';
  }
  if (lowerMime.startsWith('text/') || /\.(txt|md|log|csv)$/.test(lowerName)) {
    return 'text';
  }
  return 'image';
}

export function formatNightcordFileMeta(
  bytes: number,
  filename: string,
  kind: FileMediaKind
): { sizeLabel: string; fileType: string } {
  const size = formatFileSize(bytes);
  const ext = extractFileType(filename);
  if (kind === 'video') {
    const labelType = ext === 'IMG' ? 'MP4' : ext;
    return { sizeLabel: `${size} ${labelType} ビデオ`, fileType: labelType };
  }
  if (kind === 'audio') {
    const labelType = ext === 'IMG' ? 'MP3' : ext;
    return { sizeLabel: `${size} ${labelType}`, fileType: labelType };
  }
  if (kind === 'text') {
    const labelType = ext === 'IMG' ? 'TXT' : ext;
    return { sizeLabel: `${size} テキスト`, fileType: labelType };
  }
  return { sizeLabel: `${size} ${ext}`, fileType: ext };
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
      if (msg.fileMedia?.mediaId) {
        ids.add(msg.fileMedia.mediaId);
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
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1).replace(/\.0$/, '')}MB`;
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
  override?: { timestamp?: string; sentAt?: MessageDateTime; dividerBefore?: string }
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
    sentAt: override?.sentAt ?? dateToMessageDateTime(now),
    dividerBefore: override?.dividerBefore,
    text: trimmed,
  };
}

export function createImageMessage(
  imageMedia: ChatImageMedia,
  sender: CharacterProfile,
  caption?: string,
  now: Date = new Date(),
  override?: { timestamp?: string; sentAt?: MessageDateTime; dividerBefore?: string }
): ChatMessage {
  const trimmed = caption?.trim();
  return {
    id: `msg-${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
    memberId: sender.id,
    username: sender.name,
    avatar: sender.avatarType,
    customAvatarMediaId: sender.customAvatarMediaId,
    timestamp: override?.timestamp ?? formatJapaneseTime(now),
    sentAt: override?.sentAt ?? dateToMessageDateTime(now),
    dividerBefore: override?.dividerBefore,
    text: trimmed || undefined,
    imageMedia,
  };
}

export function createFileMessage(
  fileMedia: ChatFileMedia,
  sender: CharacterProfile,
  caption?: string,
  now: Date = new Date(),
  override?: { timestamp?: string; sentAt?: MessageDateTime; dividerBefore?: string }
): ChatMessage {
  const trimmed = caption?.trim();
  return {
    id: `msg-${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
    memberId: sender.id,
    username: sender.name,
    avatar: sender.avatarType,
    customAvatarMediaId: sender.customAvatarMediaId,
    timestamp: override?.timestamp ?? formatJapaneseTime(now),
    sentAt: override?.sentAt ?? dateToMessageDateTime(now),
    dividerBefore: override?.dividerBefore,
    text: trimmed || undefined,
    fileMedia,
  };
}

export function createVoiceMessage(
  voiceMedia: ChatVoiceMedia,
  sender: CharacterProfile,
  now: Date = new Date(),
  override?: { timestamp?: string; sentAt?: MessageDateTime; dividerBefore?: string }
): ChatMessage {
  return {
    id: `msg-${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
    memberId: sender.id,
    username: sender.name,
    avatar: sender.avatarType,
    customAvatarMediaId: sender.customAvatarMediaId,
    timestamp: override?.timestamp ?? formatJapaneseTime(now),
    sentAt: override?.sentAt ?? dateToMessageDateTime(now),
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

export function setMemberPresenceStatus(
  members: VoiceMember[],
  memberId: string,
  status: MemberPresenceStatus
): {
  members: VoiceMember[];
  updated: VoiceMember | null;
} {
  let updated: VoiceMember | null = null;
  const next = members.map((member) => {
    if (member.id !== memberId) {
      return member;
    }
    const nextMember: VoiceMember = {
      ...member,
      status,
      online: status !== 'offline',
    };
    updated = nextMember;
    return nextMember;
  });
  return { members: next, updated };
}

export function setMemberOnlineStatus(
  members: VoiceMember[],
  memberId: string,
  online: boolean
): {
  members: VoiceMember[];
  updated: VoiceMember | null;
} {
  return setMemberPresenceStatus(members, memberId, online ? 'voice' : 'offline');
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
