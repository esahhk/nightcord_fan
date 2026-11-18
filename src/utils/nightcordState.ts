import type { ChatMessage, NightcordActions, VoiceMember } from '../types/nightcord';

export const INITIAL_VOICE_MEMBERS: VoiceMember[] = [
  { id: 'k', name: 'K', avatar: 'k-pink', muted: false, online: true },
  { id: 'yuki', name: '雪', avatar: 'yuki', muted: false, online: true },
  { id: 'enanan', name: 'えななん', avatar: 'enanan', muted: false, online: true },
  { id: 'amia', name: 'Amia', avatar: 'amia', muted: false, online: true },
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

export function formatJapaneseTime(date: Date): string {
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `今日 ${hours}:${minutes}`;
}

export function createOutgoingMessage(rawText: string, now: Date = new Date()): ChatMessage | null {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return null;
  }
  return {
    id: `msg-${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
    memberId: 'k',
    username: 'K',
    avatar: 'k',
    timestamp: formatJapaneseTime(now),
    text: trimmed,
  };
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
