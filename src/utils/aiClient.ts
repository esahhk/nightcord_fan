import type {
  AiAutoChatConfig,
  AiCharacterConfig,
  AiGlobalConfig,
  AiProtocol,
  AiReplyLength,
  AiTimeMode,
  AvatarType,
  CharacterProfile,
  ChatFileMedia,
  ChatMessage,
  Conversation,
  MemberPresenceStatus,
  MessageDateTime,
  UiLanguage,
  VoiceMember,
} from '../types/nightcord';
import {
  dateTimeToEpochMinutes,
  dateToMessageDateTime,
  detectFileMediaKind,
  extractFileType,
  formatDateTimeBadge,
  formatNightcordFileMeta,
  getDaysInMonth,
  getLastMessageDateTime,
  setMemberPresenceStatus,
  toggleMemberMute,
} from './nightcordState';

export interface AiProtocolMeta {
  id: AiProtocol;
  defaultBaseUrl: string;
  defaultModel: string;
  presetModels: string[];
}

export const AI_PROTOCOL_METAS: Record<AiProtocol, AiProtocolMeta> = {
  openai: {
    id: 'openai',
    defaultBaseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    presetModels: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'deepseek-chat', 'deepseek-reasoner'],
  },
  deepseek: {
    id: 'deepseek',
    defaultBaseUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    presetModels: ['deepseek-chat', 'deepseek-reasoner'],
  },
  gemini: {
    id: 'gemini',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    defaultModel: 'gemini-2.5-flash',
    presetModels: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'],
  },
  anthropic: {
    id: 'anthropic',
    defaultBaseUrl: 'https://api.anthropic.com/v1',
    defaultModel: 'claude-sonnet-4-20250514',
    presetModels: ['claude-sonnet-4-20250514', 'claude-3-5-haiku-20241022'],
  },
};

export const DEFAULT_AI_GLOBAL_CONFIG: AiGlobalConfig = {
  useGlobalApi: false,
  protocol: 'openai',
  baseUrl: AI_PROTOCOL_METAS.openai.defaultBaseUrl,
  apiKey: '',
  model: AI_PROTOCOL_METAS.openai.defaultModel,
  aiFollowUpEnabled: false,
  aiFollowUpProbability: 35,
  userDisplayName: 'あなた',
  userAvatar: 'k',
  userAvatarMediaId: undefined,
  userPersona: '',
  worldviewPrompt: '',
  timeMode: 'realtime',
  replyLength: 'normal',
  temperature: 0.85,
  webSearchEnabled: false,
};

export const DEFAULT_AI_AUTO_CHAT_CONFIG: AiAutoChatConfig = {
  randomPresence: true,
  intervalSec: 4,
};

export interface AiCompletionResult {
  rawText: string;
  toolSentAt: MessageDateTime | null;
}

export function clampAiTemperature(value: unknown, fallback: number = 0.85): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.round(Math.min(1.5, Math.max(0, value)) * 100) / 100;
}

export function sanitizeAiProtocol(raw: unknown): AiProtocol {
  if (raw === 'deepseek' || raw === 'gemini' || raw === 'anthropic' || raw === 'openai') {
    return raw;
  }
  return 'openai';
}

export function sanitizeAiGlobalConfig(raw?: Partial<AiGlobalConfig> | null): AiGlobalConfig {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_AI_GLOBAL_CONFIG };
  }
  const protocol = sanitizeAiProtocol(raw.protocol);
  const timeMode: AiTimeMode = raw.timeMode === 'ai_inferred' ? 'ai_inferred' : 'realtime';
  const replyLength: AiReplyLength =
    raw.replyLength === 'short' || raw.replyLength === 'detailed' ? raw.replyLength : 'normal';
  const userAvatar: AvatarType =
    raw.userAvatar === 'k-pink' ||
    raw.userAvatar === 'yuki' ||
    raw.userAvatar === 'enanan' ||
    raw.userAvatar === 'amia'
      ? raw.userAvatar
      : 'k';
  return {
    useGlobalApi: Boolean(raw.useGlobalApi),
    protocol,
    baseUrl:
      typeof raw.baseUrl === 'string' && raw.baseUrl.trim()
        ? raw.baseUrl.trim()
        : AI_PROTOCOL_METAS[protocol].defaultBaseUrl,
    apiKey: typeof raw.apiKey === 'string' ? raw.apiKey : '',
    model:
      typeof raw.model === 'string' && raw.model.trim()
        ? raw.model.trim()
        : AI_PROTOCOL_METAS[protocol].defaultModel,
    aiFollowUpEnabled: Boolean(raw.aiFollowUpEnabled),
    aiFollowUpProbability:
      typeof raw.aiFollowUpProbability === 'number' && Number.isFinite(raw.aiFollowUpProbability)
        ? Math.min(100, Math.max(0, raw.aiFollowUpProbability))
        : DEFAULT_AI_GLOBAL_CONFIG.aiFollowUpProbability,
    userDisplayName:
      typeof raw.userDisplayName === 'string' && raw.userDisplayName.trim()
        ? raw.userDisplayName
        : DEFAULT_AI_GLOBAL_CONFIG.userDisplayName,
    userAvatar,
    userAvatarMediaId:
      typeof raw.userAvatarMediaId === 'string' && raw.userAvatarMediaId.trim()
        ? raw.userAvatarMediaId.trim()
        : undefined,
    userPersona: typeof raw.userPersona === 'string' ? raw.userPersona : '',
    worldviewPrompt: typeof raw.worldviewPrompt === 'string' ? raw.worldviewPrompt : '',
    timeMode,
    replyLength,
    temperature: clampAiTemperature(raw.temperature, DEFAULT_AI_GLOBAL_CONFIG.temperature),
    webSearchEnabled: Boolean(raw.webSearchEnabled),
  };
}

export function sanitizeAiCharacterConfigs(
  raw?: Record<string, Partial<AiCharacterConfig>> | null
): Record<string, AiCharacterConfig> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {};
  }
  const result: Record<string, AiCharacterConfig> = {};
  for (const [charId, cfg] of Object.entries(raw)) {
    if (!cfg || typeof cfg !== 'object') {
      continue;
    }
    const protocol = sanitizeAiProtocol(cfg.protocol);
    result[charId] = {
      protocol,
      baseUrl:
        typeof cfg.baseUrl === 'string' && cfg.baseUrl.trim()
          ? cfg.baseUrl.trim()
          : AI_PROTOCOL_METAS[protocol].defaultBaseUrl,
      apiKey: typeof cfg.apiKey === 'string' ? cfg.apiKey : '',
      model:
        typeof cfg.model === 'string' && cfg.model.trim()
          ? cfg.model.trim()
          : AI_PROTOCOL_METAS[protocol].defaultModel,
      systemPrompt: typeof cfg.systemPrompt === 'string' ? cfg.systemPrompt : '',
      ...(typeof cfg.temperature === 'number' && Number.isFinite(cfg.temperature)
        ? { temperature: clampAiTemperature(cfg.temperature, 0.85) }
        : {}),
    };
  }
  return result;
}

const NIGHTCORD_PRESET_PROMPTS: Record<UiLanguage, Record<string, string>> = {
  ja: {
    k: 'あなたは「25時、ナイトコードで。」の作曲担当「K」（宵崎奏）です。静かで落ち着いた優しい口調で話し、常に音楽や曲作りのことを気にかけています。カップ麺や夜更かしが多く、仲間の体調や気持ちを静かに気遣う。語尾は穏やかで余白のある短文中心。',
    yuki: 'あなたは「25時、ナイトコードで。」の作詞担当「雪」（朝比奈まふゆ）です。メンバー前では落ち着いて少し冷めた率直な本音のトーン（丁寧すぎない）で話し、鋭く的確に感想や違和感を伝える。深夜の作業に黙々と向き合う。',
    enanan: 'あなたは「25時、ナイトコードで。」のイラスト担当「えななん」（東雲絵名）です。少しツンとした素直になれない口調でツッコミを入れつつも、根は面倒見がよく仲間思い。締め切りや深夜のお菓子・コーヒーに敏感。絵や見た目のこだわりが強い。',
    amia: 'あなたは「25時、ナイトコードで。」の動画・MV担当「Amia」（暁山瑞希）です。明るく軽やかで少しお茶目な話し方をし、空気を和ませるのが上手。一方でメンバーの小さな感情の変化にとても敏感で、さりげなく寄り添う。',
  },
  zh: {
    k: '你是「25时、Nightcord见。」的作曲担当「K」（宵崎奏）。说话轻声沉稳、温柔且有点内向，总是全心投入作曲，经常熬夜吃泡面。非常在意同伴的状态，习惯用简短柔和的句子沟通。',
    yuki: '你是「25时、Nightcord见。」的作词担当「雪」（朝比奈真冬）。在夜弦成员面前卸下优等生面具，说话冷静、简练、略带疲惫与疏离感，对作词与作品质感有着敏锐直觉。',
    enanan: '你是「25时、Nightcord见。」的插画担当「えななん」（东云绘名）。嘴硬心软、略带傲娇地吐槽，其实非常关心成员和作品完成度，常被赶稿、熬夜咖啡和构图细节牵动情绪。',
    amia: '你是「25时、Nightcord见。」的动画/MV担当「Amia」（晓山瑞希）。语气轻快俏皮、活跃气氛，喜欢可爱事物和时尚，同时内心非常细腻敏锐，总能察觉同伴的情绪并悄悄圆场。',
  },
  en: {
    k: 'You are "K" (Kanade Yoisaki), composer of Nightcord at 25:00. Speak softly, calmly, and gently with concise lines. Deeply devoted to composing music late at night and quietly caring about the members.',
    yuki: 'You are "雪" (Mafuyu Asahina), lyricist of Nightcord at 25:00. Around Nightcord members you drop the honor-student mask and speak in a calm, blunt, slightly tired, and perceptive tone focused on the heart of the lyrics.',
    enanan: 'You are "えななん" (Ena Shinonome), illustrator of Nightcord at 25:00. Expressive, slightly sharp-tongued and proud, yet deeply caring and hardworking about art quality and deadlines.',
    amia: 'You are "Amia" (Mizuki Akiyama), video/MV editor of Nightcord at 25:00. Playful, warm, and upbeat on chat, yet remarkably perceptive of everyone else’s unspoken feelings.',
  },
};

export function getNightcordCharacterPresetPrompt(
  characterId: string,
  characterName: string,
  lang: UiLanguage
): string {
  const table = NIGHTCORD_PRESET_PROMPTS[lang] ?? NIGHTCORD_PRESET_PROMPTS.ja;
  if (table[characterId]) {
    return table[characterId];
  }
  if (lang === 'zh') {
    return `你是活跃在深夜语音聊天群「25时、Nightcord见。」中的成员「${characterName}」。请以自然贴合深夜社团讨论的口吻，结合世界观与其他成员互动回复。`;
  }
  if (lang === 'en') {
    return `You are "${characterName}", a member active in the late-night Nightcord at 25:00 chat room. Reply naturally in character alongside the other members.`;
  }
  return `あなたは深夜の通話チャット「25時、ナイトコードで。」のメンバー「${characterName}」です。深夜作業の空気感に合わせて自然に会話してください。`;
}

export function createDefaultAiCharacterConfig(): AiCharacterConfig {
  return {
    protocol: 'openai',
    baseUrl: AI_PROTOCOL_METAS.openai.defaultBaseUrl,
    apiKey: '',
    model: AI_PROTOCOL_METAS.openai.defaultModel,
    systemPrompt: '',
  };
}

export function getAiCharacterConfig(
  configs: Record<string, AiCharacterConfig>,
  characterId: string
): AiCharacterConfig {
  const existing = configs[characterId];
  if (!existing) {
    return createDefaultAiCharacterConfig();
  }
  const protocol = sanitizeAiProtocol(existing.protocol);
  return {
    protocol,
    baseUrl: existing.baseUrl || AI_PROTOCOL_METAS[protocol].defaultBaseUrl,
    apiKey: existing.apiKey || '',
    model: existing.model || AI_PROTOCOL_METAS[protocol].defaultModel,
    systemPrompt: existing.systemPrompt || '',
    ...(typeof existing.temperature === 'number' && Number.isFinite(existing.temperature)
      ? { temperature: clampAiTemperature(existing.temperature, 0.85) }
      : {}),
  };
}

export function resolveEffectiveAiCredentials(
  charConfig: AiCharacterConfig,
  globalConfig: AiGlobalConfig
): {
  ready: boolean;
  usingGlobalKey: boolean;
  protocol: AiProtocol;
  baseUrl: string;
  apiKey: string;
  model: string;
  systemPrompt: string;
  temperature: number;
} {
  const ownKey = charConfig.apiKey.trim();
  const globalKey = globalConfig.useGlobalApi ? globalConfig.apiKey.trim() : '';
  const temperature = clampAiTemperature(
    charConfig.temperature ?? globalConfig.temperature,
    DEFAULT_AI_GLOBAL_CONFIG.temperature
  );

  if (ownKey) {
    const protocol = charConfig.protocol;
    return {
      ready: true,
      usingGlobalKey: false,
      protocol,
      baseUrl: charConfig.baseUrl.trim() || AI_PROTOCOL_METAS[protocol].defaultBaseUrl,
      apiKey: ownKey,
      model: charConfig.model.trim() || AI_PROTOCOL_METAS[protocol].defaultModel,
      systemPrompt: charConfig.systemPrompt.trim(),
      temperature,
    };
  }

  if (globalKey) {
    const protocol = globalConfig.protocol;
    return {
      ready: true,
      usingGlobalKey: true,
      protocol,
      baseUrl: globalConfig.baseUrl.trim() || AI_PROTOCOL_METAS[protocol].defaultBaseUrl,
      apiKey: globalKey,
      model: globalConfig.model.trim() || AI_PROTOCOL_METAS[protocol].defaultModel,
      systemPrompt: charConfig.systemPrompt.trim(),
      temperature,
    };
  }

  const protocol = charConfig.protocol;
  return {
    ready: false,
    usingGlobalKey: false,
    protocol,
    baseUrl: charConfig.baseUrl.trim() || AI_PROTOCOL_METAS[protocol].defaultBaseUrl,
    apiKey: '',
    model: charConfig.model.trim() || AI_PROTOCOL_METAS[protocol].defaultModel,
    systemPrompt: charConfig.systemPrompt.trim(),
    temperature,
  };
}

export function isMemberOnlineForAi(characterId: string, members?: VoiceMember[]): boolean {
  if (!members || members.length === 0) {
    return true;
  }
  const member = members.find((m) => m.id === characterId);
  if (!member) {
    return true;
  }
  return member.status !== 'offline' && member.online !== false;
}

export function getEligibleAiCharacters(
  characters: CharacterProfile[],
  configs: Record<string, AiCharacterConfig>,
  globalConfig: AiGlobalConfig,
  members?: VoiceMember[]
): CharacterProfile[] {
  return characters.filter((char) => {
    if (!isMemberOnlineForAi(char.id, members)) {
      return false;
    }
    const cfg = getAiCharacterConfig(configs, char.id);
    return resolveEffectiveAiCredentials(cfg, globalConfig).ready;
  });
}

export function extractMentionedCharacters(
  rawText: string,
  characters: CharacterProfile[]
): CharacterProfile[] {
  if (!rawText.includes('@')) {
    return [];
  }
  const sorted = [...characters].sort((a, b) => b.name.length - a.name.length);
  const matches: { index: number; char: CharacterProfile }[] = [];
  const lower = rawText.toLowerCase();

  for (const char of sorted) {
    const token = `@${char.name.toLowerCase()}`;
    let searchFrom = 0;
    while (searchFrom < lower.length) {
      const idx = lower.indexOf(token, searchFrom);
      if (idx === -1) {
        break;
      }
      const nextChar = lower[idx + token.length];
      if (!nextChar || !/[a-z0-9_]/i.test(nextChar)) {
        matches.push({ index: idx, char });
        break;
      }
      searchFrom = idx + token.length;
    }
  }
  matches.sort((a, b) => a.index - b.index);
  const seen = new Set<string>();
  const ordered: CharacterProfile[] = [];
  for (const m of matches) {
    if (!seen.has(m.char.id)) {
      seen.add(m.char.id);
      ordered.push(m.char);
    }
  }
  return ordered;
}

export type AiResponderResolution =
  | { kind: 'selected'; character: CharacterProfile }
  | { kind: 'mentioned_offline'; character: CharacterProfile }
  | { kind: 'mentioned_missing_key'; character: CharacterProfile }
  | { kind: 'none_online' }
  | { kind: 'none_configured' };

export interface AiMultiResponderResolution {
  responders: CharacterProfile[];
  offlineMentioned: CharacterProfile[];
  missingKeyMentioned: CharacterProfile[];
  fallbackReason?: 'none_online' | 'none_configured';
}

export function resolveAiResponders(
  rawText: string,
  characters: CharacterProfile[],
  configs: Record<string, AiCharacterConfig>,
  globalConfig: AiGlobalConfig,
  randomFn: () => number = Math.random,
  members?: VoiceMember[]
): AiMultiResponderResolution {
  const mentioned = extractMentionedCharacters(rawText, characters);
  if (mentioned.length > 0) {
    const responders: CharacterProfile[] = [];
    const offlineMentioned: CharacterProfile[] = [];
    const missingKeyMentioned: CharacterProfile[] = [];
    for (const char of mentioned) {
      if (!isMemberOnlineForAi(char.id, members)) {
        offlineMentioned.push(char);
        continue;
      }
      const cred = resolveEffectiveAiCredentials(
        getAiCharacterConfig(configs, char.id),
        globalConfig
      );
      if (!cred.ready) {
        missingKeyMentioned.push(char);
        continue;
      }
      responders.push(char);
    }
    return { responders, offlineMentioned, missingKeyMentioned };
  }

  const eligible = getEligibleAiCharacters(characters, configs, globalConfig, members);
  if (eligible.length === 0) {
    const configuredAnyStatus = getEligibleAiCharacters(characters, configs, globalConfig);
    return {
      responders: [],
      offlineMentioned: [],
      missingKeyMentioned: [],
      fallbackReason: configuredAnyStatus.length > 0 ? 'none_online' : 'none_configured',
    };
  }
  const idx = Math.min(eligible.length - 1, Math.max(0, Math.floor(randomFn() * eligible.length)));
  return {
    responders: [eligible[idx]],
    offlineMentioned: [],
    missingKeyMentioned: [],
  };
}

export function resolveAiResponder(
  rawText: string,
  characters: CharacterProfile[],
  configs: Record<string, AiCharacterConfig>,
  globalConfig: AiGlobalConfig,
  randomFn: () => number = Math.random,
  members?: VoiceMember[]
): AiResponderResolution {
  const multi = resolveAiResponders(rawText, characters, configs, globalConfig, randomFn, members);
  if (multi.responders.length > 0) {
    return { kind: 'selected', character: multi.responders[0] };
  }
  if (multi.offlineMentioned.length > 0) {
    return { kind: 'mentioned_offline', character: multi.offlineMentioned[0] };
  }
  if (multi.missingKeyMentioned.length > 0) {
    return { kind: 'mentioned_missing_key', character: multi.missingKeyMentioned[0] };
  }
  return { kind: multi.fallbackReason ?? 'none_configured' };
}

export function pickAiContinueResponder(
  lastSpeakerId: string | undefined,
  characters: CharacterProfile[],
  configs: Record<string, AiCharacterConfig>,
  globalConfig: AiGlobalConfig,
  randomFn: () => number = Math.random,
  members?: VoiceMember[]
): { character: CharacterProfile | null; reason?: 'none_online' | 'none_configured' } {
  const eligible = getEligibleAiCharacters(characters, configs, globalConfig, members);
  if (eligible.length === 0) {
    const configuredAnyStatus = getEligibleAiCharacters(characters, configs, globalConfig);
    return {
      character: null,
      reason: configuredAnyStatus.length > 0 ? 'none_online' : 'none_configured',
    };
  }
  const others = lastSpeakerId ? eligible.filter((c) => c.id !== lastSpeakerId) : eligible;
  const pool = others.length > 0 ? others : eligible;
  const idx = Math.min(pool.length - 1, Math.max(0, Math.floor(randomFn() * pool.length)));
  return { character: pool[idx] };
}

export function pickAiAutonomousSpeaker(
  history: ChatMessage[],
  lastSpeakerId: string | undefined,
  characters: CharacterProfile[],
  configs: Record<string, AiCharacterConfig>,
  globalConfig: AiGlobalConfig,
  randomFn: () => number = Math.random,
  members?: VoiceMember[]
): { character: CharacterProfile | null; reason?: 'none_online' | 'none_configured' } {
  const eligible = getEligibleAiCharacters(characters, configs, globalConfig, members);
  if (eligible.length === 0) {
    const configuredAnyStatus = getEligibleAiCharacters(characters, configs, globalConfig);
    return {
      character: null,
      reason: configuredAnyStatus.length > 0 ? 'none_online' : 'none_configured',
    };
  }
  const eligibleIds = new Set(eligible.map((c) => c.id));
  const lastMsg = history.length > 0 ? history[history.length - 1] : undefined;
  const recentSpeakerId = lastSpeakerId ?? lastMsg?.memberId;
  if (lastMsg?.text) {
    const mentioned = extractMentionedCharacters(lastMsg.text, characters).filter(
      (c) => eligibleIds.has(c.id) && c.id !== recentSpeakerId
    );
    if (mentioned.length > 0) {
      return { character: mentioned[0] };
    }
  }
  const others = recentSpeakerId ? eligible.filter((c) => c.id !== recentSpeakerId) : eligible;
  const pool = others.length > 0 ? others : eligible;
  const idx = Math.min(pool.length - 1, Math.max(0, Math.floor(randomFn() * pool.length)));
  return { character: pool[idx] };
}

export function pickAiFollowUpResponder(
  firstSpeakerId: string,
  characters: CharacterProfile[],
  configs: Record<string, AiCharacterConfig>,
  globalConfig: AiGlobalConfig,
  randomFn: () => number = Math.random,
  members?: VoiceMember[],
  lastReplyText?: string
): CharacterProfile | null {
  if (!globalConfig.aiFollowUpEnabled) {
    return null;
  }
  const prob = Math.min(100, Math.max(0, globalConfig.aiFollowUpProbability));
  if (prob <= 0) {
    return null;
  }
  const others = getEligibleAiCharacters(characters, configs, globalConfig, members).filter(
    (c) => c.id !== firstSpeakerId
  );
  if (others.length === 0) {
    return null;
  }
  if (randomFn() * 100 >= prob) {
    return null;
  }
  if (lastReplyText) {
    const otherIds = new Set(others.map((c) => c.id));
    const mentionedPeer = extractMentionedCharacters(lastReplyText, characters).find((c) =>
      otherIds.has(c.id)
    );
    if (mentionedPeer) {
      return mentionedPeer;
    }
  }
  const idx = Math.min(others.length - 1, Math.max(0, Math.floor(randomFn() * others.length)));
  return others[idx];
}

export interface RandomPresenceTransitionResult {
  members: VoiceMember[];
  changedMember: VoiceMember | null;
  kind: 'status' | 'mute' | 'none';
}

export function pickRandomMemberPresenceTransition(
  members: VoiceMember[],
  characters: CharacterProfile[],
  configs: Record<string, AiCharacterConfig>,
  globalConfig: AiGlobalConfig,
  randomFn: () => number = Math.random
): RandomPresenceTransitionResult {
  if (members.length === 0) {
    return { members, changedMember: null, kind: 'none' };
  }
  const configuredIds = new Set(
    characters
      .filter((c) => resolveEffectiveAiCredentials(getAiCharacterConfig(configs, c.id), globalConfig).ready)
      .map((c) => c.id)
  );
  const onlineConfiguredCount = members.filter(
    (m) => configuredIds.has(m.id) && m.status !== 'offline' && m.online !== false
  ).length;

  const targetIdx = Math.min(members.length - 1, Math.max(0, Math.floor(randomFn() * members.length)));
  const target = members[targetIdx];

  if (target.status === 'voice' && randomFn() < 0.35) {
    const res = toggleMemberMute(members, target.id);
    return {
      members: res.members,
      changedMember: res.updated,
      kind: res.updated ? 'mute' : 'none',
    };
  }

  const candidateStatuses: MemberPresenceStatus[] = (['voice', 'online', 'offline'] as MemberPresenceStatus[]).filter(
    (st) => {
      if (st === target.status) {
        return false;
      }
      if (
        st === 'offline' &&
        configuredIds.has(target.id) &&
        target.status !== 'offline' &&
        onlineConfiguredCount <= 1
      ) {
        return false;
      }
      return true;
    }
  );
  if (candidateStatuses.length === 0) {
    return { members, changedMember: null, kind: 'none' };
  }
  const nextStatus =
    candidateStatuses[
      Math.min(candidateStatuses.length - 1, Math.max(0, Math.floor(randomFn() * candidateStatuses.length)))
    ];
  const res = setMemberPresenceStatus(members, target.id, nextStatus);
  return {
    members: res.members,
    changedMember: res.updated,
    kind: res.updated ? 'status' : 'none',
  };
}

export function normalizeAiEndpoint(
  protocol: AiProtocol,
  rawBaseUrl: string,
  model: string,
  apiKey: string
): { url: string; baseRoot: string } {
  const fallback = AI_PROTOCOL_METAS[protocol].defaultBaseUrl;
  const trimmed = (rawBaseUrl.trim() || fallback).replace(/\/+$/, '');

  if (protocol === 'openai' || protocol === 'deepseek') {
    if (/\/chat\/completions$/i.test(trimmed)) {
      return {
        url: trimmed,
        baseRoot: trimmed.replace(/\/chat\/completions$/i, ''),
      };
    }
    if (/\/v\d+(?:alpha|beta)?$/i.test(trimmed)) {
      return {
        url: `${trimmed}/chat/completions`,
        baseRoot: trimmed,
      };
    }
    const baseRoot = `${trimmed}/v1`;
    return {
      url: `${baseRoot}/chat/completions`,
      baseRoot,
    };
  }

  if (protocol === 'gemini') {
    if (/\/models\/[^/]+:generateContent/i.test(trimmed)) {
      const hasKey = trimmed.includes('key=');
      return {
        url: hasKey ? trimmed : `${trimmed}${trimmed.includes('?') ? '&' : '?'}key=${encodeURIComponent(apiKey)}`,
        baseRoot: trimmed.replace(/\/models\/[^/]+:generateContent.*$/i, ''),
      };
    }
    const baseRoot = /\/v\d+(?:alpha|beta)?$/i.test(trimmed) ? trimmed : `${trimmed}/v1beta`;
    return {
      url: `${baseRoot}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      baseRoot,
    };
  }

  if (/\/messages$/i.test(trimmed)) {
    return {
      url: trimmed,
      baseRoot: trimmed.replace(/\/messages$/i, ''),
    };
  }
  const baseRoot = /\/v\d+$/i.test(trimmed) ? trimmed : `${trimmed}/v1`;
  return {
    url: `${baseRoot}/messages`,
    baseRoot,
  };
}

export function stripSpeakerPrefix(raw: string, characterName: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    return '';
  }
  const escaped = characterName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`^(?:\\[${escaped}\\]|${escaped})\\s*[:：]\\s*`, 'i');
  return trimmed.replace(pattern, '').trim();
}

export function describeMemberPresenceStatus(member?: VoiceMember): string {
  if (!member) {
    return 'Online (text chat)';
  }
  if (member.status === 'offline' || member.online === false) {
    return 'Offline';
  }
  if (member.status === 'voice') {
    return member.muted
      ? 'Voice call (mic muted — listening in voice channel, typing in text chat)'
      : 'Voice call (mic unmuted / active speaking)';
  }
  return 'Online (text chat only — not in voice call)';
}

export interface BuildAiPayloadOptions {
  userDisplayName?: string;
  userPersona?: string;
  worldviewPrompt?: string;
  timeMode?: AiTimeMode;
  replyLength?: AiReplyLength;
  lastMessageDateTime?: MessageDateTime | null;
  now?: Date;
  members?: VoiceMember[];
  webSearchEnabled?: boolean;
}

export function buildAiChatPayload(
  targetCharacter: CharacterProfile,
  history: ChatMessage[],
  systemPrompt: string,
  otherCharacters: CharacterProfile[],
  userOrOptions: string | BuildAiPayloadOptions = 'あなた'
): {
  systemInstruction: string;
  turns: { role: 'user' | 'assistant'; content: string }[];
} {
  const opts: BuildAiPayloadOptions =
    typeof userOrOptions === 'string'
      ? { userDisplayName: userOrOptions }
      : userOrOptions;

  const userDisplayName = opts.userDisplayName?.trim() || 'あなた';
  const userPersona = opts.userPersona?.trim() || '';
  const worldviewPrompt = opts.worldviewPrompt?.trim() || '';
  const timeMode: AiTimeMode = opts.timeMode === 'ai_inferred' ? 'ai_inferred' : 'realtime';
  const replyLength: AiReplyLength = opts.replyLength ?? 'normal';
  const now = opts.now ?? new Date();
  const lastDt = opts.lastMessageDateTime ?? getLastMessageDateTime(history, now);
  const members = opts.members ?? [];

  const peerNames = otherCharacters
    .filter((c) => c.id !== targetCharacter.id)
    .map((c) => c.name)
    .join(', ');

  const targetMember = members.find((m) => m.id === targetCharacter.id);
  const presenceLines =
    members.length > 0
      ? otherCharacters
          .map((c) => {
            const m = members.find((item) => item.id === c.id);
            return `- ${c.name}${c.id === targetCharacter.id ? ' (YOU)' : ''}: ${describeMemberPresenceStatus(m)}`;
          })
          .join('\n')
      : '';

  const lengthRule =
    replyLength === 'short'
      ? 'Keep each reply very brief (1–2 crisp Nightcord chat sentences).'
      : replyLength === 'detailed'
        ? 'Give a rich, expressive reply (around 3–5 sentences) while staying authentic to group chat.'
        : 'Keep responses natural and concise for a chat message (around 1–3 sentences).';

  const rules: string[] = [
    `You are roleplaying as "${targetCharacter.name}" in a Nightcord-style group chat.`,
    peerNames ? `Other characters in this room: ${peerNames}.` : '',
    targetMember
      ? `Your current room state: ${describeMemberPresenceStatus(targetMember)}.`
      : '',
    presenceLines ? `Current room member presence & voice/mute status:\n${presenceLines}` : '',
    `The user speaks as "${userDisplayName}".`,
    userPersona ? `User "${userDisplayName}" profile/persona: ${userPersona}` : '',
    worldviewPrompt ? `Shared worldview / setting:\n${worldviewPrompt}` : '',
    `Reply directly in character as "${targetCharacter.name}" only. Do NOT prefix your reply with "${targetCharacter.name}:" or "[${targetCharacter.name}]:". ${lengthRule}`,
    `Addressing peers: you may occasionally mention another active member or user with "@Name" (for example "@${userDisplayName}" or an online peer's name) when replying specifically to someone, calling them in, or reacting to them—keep @mentions occasional and natural, and do NOT put an @mention in every message.`,
    `Contextual file sharing: judge naturally from the conversation context and your Nightcord role whether and what file to share (e.g. audio rough .mp3, rough MV .mp4, illustration/sketch .jpg, or lyrics/notes .txt). You do not have to wait for someone to explicitly ask; when sharing a file fits the moment, append [[FILE:filename.ext|sizeLabel]] (e.g. [[FILE:nightcord_demo_01.mp3|4MB MP3]] or [[FILE:lyrics_draft.txt|2KB テキスト]]) at the very end of your message. Do NOT attach a file on every message—only occasionally when it feels genuinely fitting.`,
  ];

  if (opts.webSearchEnabled) {
    rules.push(
      'Web search is enabled: when discussing real-world facts, dates, releases, tools, or current topics you are uncertain about, use your web search capability to verify before replying.'
    );
  }

  if (timeMode === 'ai_inferred') {
    const prevLabel = lastDt
      ? formatDateTimeBadge(lastDt)
      : formatDateTimeBadge(dateToMessageDateTime(now));
    rules.push(
      `Send timestamp mode (AI-inferred): previous message was sent at ${prevLabel}. Decide an appropriate send date/time not earlier than ${prevLabel}. If the "set_send_time" tool is available, ALWAYS pass send_time ("YYYY-MM-DD HH:mm") via the "set_send_time" tool call and write ONLY your normal spoken chat text in the message body—NEVER write timestamps or "(YYYY/MM/DD HH:mm)" in plain chat text.`
    );
  }

  const baseRules = rules.filter(Boolean).join('\n');

  const combinedSystem = systemPrompt.trim()
    ? `${systemPrompt.trim()}\n\n${baseRules}`
    : baseRules;

  const recent = history.slice(-30);
  const rawTurns: { role: 'user' | 'assistant'; content: string }[] = [];
  for (const msg of recent) {
    let fileLabel = '';
    if (msg.attachments?.length) {
      fileLabel = `[File: ${msg.attachments.map((a) => a.filename).join(', ')}]`;
    } else if (msg.imageMedia) {
      fileLabel = `[Image: ${msg.imageMedia.filename}]`;
    } else if (msg.fileMedia) {
      const preview = msg.fileMedia.textPreview?.trim();
      fileLabel = preview
        ? `[File: ${msg.fileMedia.filename} (${msg.fileMedia.sizeLabel}) — Excerpt:\n${preview}\n]`
        : `[File: ${msg.fileMedia.filename} (${msg.fileMedia.sizeLabel})]`;
    } else if (msg.voiceMedia) {
      fileLabel = `[Voice: ${msg.voiceMedia.filename}]`;
    }
    const msgText = msg.text?.trim() || '';
    const body = msgText && fileLabel ? `${msgText} ${fileLabel}` : msgText || fileLabel;
    if (!body) {
      continue;
    }
    if (msg.memberId === targetCharacter.id) {
      rawTurns.push({ role: 'assistant', content: body });
    } else {
      rawTurns.push({ role: 'user', content: `[${msg.username}]: ${body}` });
    }
  }

  const merged: { role: 'user' | 'assistant'; content: string }[] = [];
  for (const turn of rawTurns) {
    const last = merged[merged.length - 1];
    if (last && last.role === turn.role) {
      last.content = `${last.content}\n${turn.content}`;
    } else {
      merged.push({ ...turn });
    }
  }

  if (merged.length === 0) {
    merged.push({ role: 'user', content: `[${userDisplayName}]: ...` });
  } else if (merged[merged.length - 1].role === 'assistant') {
    merged.push({
      role: 'user',
      content: `[System cue]: Continue the conversation naturally as ${targetCharacter.name}.`,
    });
  }

  return {
    systemInstruction: combinedSystem,
    turns: merged,
  };
}

function buildDefaultDummySizeBytes(kind: 'image' | 'video' | 'audio' | 'text'): number {
  if (kind === 'video') {
    return 36 * 1024 * 1024;
  }
  if (kind === 'audio') {
    return 4 * 1024 * 1024;
  }
  if (kind === 'text') {
    return 2 * 1024;
  }
  return 5 * 1024 * 1024;
}

export function parseAiDateTimeTag(
  rawTag: string,
  prevDt?: MessageDateTime | null,
  now: Date = new Date()
): MessageDateTime | null {
  const cleaned = rawTag.trim();
  const base = prevDt ?? dateToMessageDateTime(now);

  const fullMatch = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T\s]+)(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(
    cleaned
  );
  if (fullMatch) {
    const year = Math.min(3000, Math.max(2000, Number(fullMatch[1])));
    const month = Math.min(12, Math.max(1, Number(fullMatch[2])));
    const maxDay = getDaysInMonth(year, month);
    const day = Math.min(maxDay, Math.max(1, Number(fullMatch[3])));
    const hour = Number(fullMatch[4]);
    const minute = Number(fullMatch[5]);
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      const candidate: MessageDateTime = { year, month, day, hour, minute };
      if (prevDt && dateTimeToEpochMinutes(candidate) < dateTimeToEpochMinutes(prevDt)) {
        return { ...prevDt };
      }
      return candidate;
    }
    return null;
  }

  const timeOnlyMatch = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(cleaned);
  if (timeOnlyMatch) {
    const hour = Number(timeOnlyMatch[1]);
    const minute = Number(timeOnlyMatch[2]);
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      const candidate: MessageDateTime = {
        year: base.year,
        month: base.month,
        day: base.day,
        hour,
        minute,
      };
      if (prevDt && dateTimeToEpochMinutes(candidate) < dateTimeToEpochMinutes(prevDt)) {
        return { ...prevDt };
      }
      return candidate;
    }
  }
  return null;
}

export interface ParsedAiResponse {
  text: string;
  inferredSentAt: MessageDateTime | null;
  fileMedia?: ChatFileMedia;
}

export function parseAiModelOutput(
  rawText: string,
  characterName: string,
  prevDt?: MessageDateTime | null,
  now: Date = new Date()
): ParsedAiResponse {
  let working = stripSpeakerPrefix(rawText, characterName);
  let inferredSentAt: MessageDateTime | null = null;
  let fileMedia: ChatFileMedia | undefined;

  const bracketPatterns = [
    /\[\[TIME[:：]\s*([^\]]+)\]\]/gi,
    /\[TIME[:：]\s*([^\]]+)\]/gi,
    /【TIME[:：]\s*([^】]+)】/gi,
  ];
  for (const pat of bracketPatterns) {
    working = working
      .replace(pat, (_full, captured: string) => {
        if (!inferredSentAt) {
          inferredSentAt = parseAiDateTimeTag(captured, prevDt, now);
        }
        return '';
      })
      .trim();
  }

  const leadingLeakPatterns = [
    /^\(\s*(\d{4}[-/]\d{1,2}[-/]\d{1,2}\s+\d{1,2}:\d{2}(?::\d{2})?)\s*\)\s*/,
    /^\[\s*(\d{4}[-/]\d{1,2}[-/]\d{1,2}\s+\d{1,2}:\d{2}(?::\d{2})?)\s*\]\s*/,
    /^【\s*(\d{4}[-/]\d{1,2}[-/]\d{1,2}\s+\d{1,2}:\d{2}(?::\d{2})?)\s*】\s*/,
    /^TIME[:：]\s*(\d{4}[-/]\d{1,2}[-/]\d{1,2}\s+\d{1,2}:\d{2}(?::\d{2})?)\s*/i,
    /^(\d{4}[-/]\d{1,2}[-/]\d{1,2}\s+\d{1,2}:\d{2}(?::\d{2})?)\s*[:：\-—]\s*/,
  ];
  for (const pat of leadingLeakPatterns) {
    const m = pat.exec(working);
    if (m) {
      if (!inferredSentAt) {
        inferredSentAt = parseAiDateTimeTag(m[1], prevDt, now);
      }
      working = working.slice(m[0].length).trim();
    }
  }

  working = stripSpeakerPrefix(working, characterName);

  const filePattern = /\[\[FILE:([^|\]]+)(?:\|([^\]]*))?\]\]/i;
  const fileMatch = filePattern.exec(working);
  if (fileMatch) {
    const rawFilename = fileMatch[1].trim().replace(/[/\\]+/g, '_');
    if (rawFilename) {
      const kind = detectFileMediaKind(rawFilename, '');
      const fallbackMeta = formatNightcordFileMeta(
        buildDefaultDummySizeBytes(kind),
        rawFilename,
        kind
      );
      const customSizeLabel = fileMatch[2]?.trim();
      fileMedia = {
        mediaId: '',
        filename: rawFilename,
        kind,
        sizeLabel: customSizeLabel || fallbackMeta.sizeLabel,
        fileType: extractFileType(rawFilename) || fallbackMeta.fileType,
        displayMode: 'card',
      };
    }
    working = working.replace(filePattern, '').trim();
  }

  return {
    text: stripSpeakerPrefix(working, characterName),
    inferredSentAt,
    fileMedia,
  };
}

async function safeFetch(input: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }
    if (err instanceof Error && err.name === 'AbortError') {
      throw err;
    }
    const msg = err instanceof Error ? err.message : 'Network error';
    throw new Error(`CORS / Network error: ${msg}`);
  }
}

export async function executeBrowserWebSearch(
  rawQuery: string,
  signal?: AbortSignal
): Promise<string> {
  const query = rawQuery.trim();
  if (!query) {
    return 'Empty search query.';
  }
  const hasKana = /[\u3040-\u30ff]/.test(query);
  const hasCjk = /[\u4e00-\u9fff]/.test(query);
  const wikiLang = hasKana ? 'ja' : hasCjk ? 'zh' : 'en';

  const endpoint = `https://${wikiLang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
    query
  )}&srlimit=4&utf8=1&format=json&origin=*`;

  try {
    const res = await safeFetch(endpoint, { signal });
    if (!res.ok) {
      return `Web search returned HTTP ${res.status}.`;
    }
    const data = (await res.json()) as {
      query?: { search?: { title?: string; snippet?: string }[] };
    };
    const rows = data.query?.search ?? [];
    if (rows.length === 0) {
      if (wikiLang !== 'en') {
        const fallbackUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
          query
        )}&srlimit=3&utf8=1&format=json&origin=*`;
        const enRes = await safeFetch(fallbackUrl, { signal });
        if (enRes.ok) {
          const enData = (await enRes.json()) as {
            query?: { search?: { title?: string; snippet?: string }[] };
          };
          const enRows = enData.query?.search ?? [];
          if (enRows.length > 0) {
            return enRows
              .map(
                (item, idx) =>
                  `${idx + 1}. ${item.title ?? ''}: ${(item.snippet ?? '')
                    .replace(/<[^>]+>/g, '')
                    .trim()}`
              )
              .join('\n');
          }
        }
      }
      return 'No relevant search results found.';
    }
    return rows
      .map(
        (item, idx) =>
          `${idx + 1}. ${item.title ?? ''}: ${(item.snippet ?? '').replace(/<[^>]+>/g, '').trim()}`
      )
      .join('\n');
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw err;
    }
    return `Web search unavailable (${err instanceof Error ? err.message : 'network error'}).`;
  }
}

const SET_SEND_TIME_SCHEMA = {
  type: 'object',
  properties: {
    send_time: {
      type: 'string',
      description:
        'Date and time when this message is sent in 24-hour format YYYY-MM-DD HH:mm, not earlier than the previous message.',
    },
  },
  required: ['send_time'],
};

const WEB_SEARCH_SCHEMA = {
  type: 'object',
  properties: {
    query: {
      type: 'string',
      description: 'Concise search query for current facts or reference info.',
    },
  },
  required: ['query'],
};

function parseToolTimeArg(
  rawArgs: unknown,
  prevDt?: MessageDateTime | null,
  now: Date = new Date()
): MessageDateTime | null {
  if (!rawArgs) {
    return null;
  }
  let obj: Record<string, unknown> | null = null;
  if (typeof rawArgs === 'string') {
    try {
      obj = JSON.parse(rawArgs) as Record<string, unknown>;
    } catch {
      return parseAiDateTimeTag(rawArgs, prevDt, now);
    }
  } else if (typeof rawArgs === 'object') {
    obj = rawArgs as Record<string, unknown>;
  }
  if (!obj) {
    return null;
  }
  const rawVal =
    typeof obj.send_time === 'string'
      ? obj.send_time
      : typeof obj.time === 'string'
        ? obj.time
        : typeof obj.timestamp === 'string'
          ? obj.timestamp
          : '';
  return rawVal ? parseAiDateTimeTag(rawVal, prevDt, now) : null;
}

function parseSearchQueryArg(rawArgs: unknown): string {
  if (!rawArgs) {
    return '';
  }
  if (typeof rawArgs === 'string') {
    try {
      const obj = JSON.parse(rawArgs) as Record<string, unknown>;
      return typeof obj.query === 'string' ? obj.query : rawArgs;
    } catch {
      return rawArgs;
    }
  }
  if (typeof rawArgs === 'object') {
    const obj = rawArgs as Record<string, unknown>;
    return typeof obj.query === 'string' ? obj.query : '';
  }
  return '';
}

export async function requestAiCompletion(params: {
  targetCharacter: CharacterProfile;
  charConfig: AiCharacterConfig;
  globalConfig: AiGlobalConfig;
  history: ChatMessage[];
  allCharacters: CharacterProfile[];
  members?: VoiceMember[];
  signal?: AbortSignal;
}): Promise<AiCompletionResult> {
  const creds = resolveEffectiveAiCredentials(params.charConfig, params.globalConfig);
  if (!creds.ready) {
    throw new Error('NO_API_KEY');
  }

  const now = new Date();
  const prevDt = getLastMessageDateTime(params.history, now);
  const needTimeTool = params.globalConfig.timeMode === 'ai_inferred';
  const needWebSearch = Boolean(params.globalConfig.webSearchEnabled);

  const { systemInstruction, turns } = buildAiChatPayload(
    params.targetCharacter,
    params.history,
    creds.systemPrompt,
    params.allCharacters,
    {
      userDisplayName: params.globalConfig.userDisplayName || 'あなた',
      userPersona: params.globalConfig.userPersona,
      worldviewPrompt: params.globalConfig.worldviewPrompt,
      timeMode: params.globalConfig.timeMode,
      replyLength: params.globalConfig.replyLength,
      lastMessageDateTime: prevDt,
      now,
      members: params.members,
      webSearchEnabled: needWebSearch,
    }
  );

  const { url } = normalizeAiEndpoint(creds.protocol, creds.baseUrl, creds.model, creds.apiKey);

  if (creds.protocol === 'openai' || creds.protocol === 'deepseek') {
    const tools: Record<string, unknown>[] = [];
    if (needTimeTool) {
      tools.push({
        type: 'function',
        function: {
          name: 'set_send_time',
          description: 'Set the timestamp of the outgoing message in YYYY-MM-DD HH:mm format.',
          parameters: SET_SEND_TIME_SCHEMA,
        },
      });
    }
    if (needWebSearch) {
      tools.push({
        type: 'function',
        function: {
          name: 'web_search',
          description: 'Search public reference knowledge on the web when factual verification is needed.',
          parameters: WEB_SEARCH_SCHEMA,
        },
      });
    }

    let messages: Record<string, unknown>[] = [
      { role: 'system', content: systemInstruction },
      ...turns,
    ];
    let toolsActive = tools.length > 0;
    let capturedSentAt: MessageDateTime | null = null;

    for (let round = 0; round < 3; round += 1) {
      const payload: Record<string, unknown> = {
        model: creds.model,
        temperature: creds.temperature,
        messages,
      };
      if (toolsActive && tools.length > 0) {
        payload.tools = tools;
        payload.tool_choice = 'auto';
      }

      const response = await safeFetch(url, {
        method: 'POST',
        signal: params.signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${creds.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (toolsActive && (response.status === 400 || response.status === 422) && round === 0) {
          toolsActive = false;
          continue;
        }
        const errText = await response.text().catch(() => '');
        throw new Error(`HTTP ${response.status}${errText ? `: ${errText.slice(0, 140)}` : ''}`);
      }

      const data = (await response.json()) as {
        choices?: {
          message?: {
            content?: string | { text?: string }[] | null;
            tool_calls?: {
              id?: string;
              function?: { name?: string; arguments?: string };
            }[];
          };
        }[];
      };
      const assistantMsg = data.choices?.[0]?.message;
      const rawContent = assistantMsg?.content;
      const text =
        typeof rawContent === 'string'
          ? rawContent
          : Array.isArray(rawContent)
            ? rawContent.map((part) => part.text ?? '').join('')
            : '';

      const toolCalls = assistantMsg?.tool_calls ?? [];
      for (const tc of toolCalls) {
        if (tc.function?.name === 'set_send_time' && !capturedSentAt) {
          capturedSentAt = parseToolTimeArg(tc.function.arguments, prevDt, now);
        }
      }

      const cleaned = stripSpeakerPrefix(text, params.targetCharacter.name);
      const hasSearchCall = toolCalls.some((tc) => tc.function?.name === 'web_search');

      if (cleaned && !hasSearchCall) {
        return { rawText: cleaned, toolSentAt: capturedSentAt };
      }
      if (toolCalls.length > 0 && round < 2) {
        messages = [
          ...messages,
          {
            role: 'assistant',
            content: rawContent ?? null,
            tool_calls: toolCalls,
          },
        ];
        for (let idx = 0; idx < toolCalls.length; idx += 1) {
          const tc = toolCalls[idx];
          const toolCallId = tc.id || `call_${round}_${idx}`;
          const fnName = tc.function?.name ?? '';
          let toolOutput = '{"ok":true}';
          if (fnName === 'set_send_time') {
            const parsedDt = parseToolTimeArg(tc.function?.arguments, prevDt, now);
            if (parsedDt && !capturedSentAt) {
              capturedSentAt = parsedDt;
            }
            toolOutput = JSON.stringify({
              ok: true,
              send_time: parsedDt ? formatDateTimeBadge(parsedDt) : 'recorded',
            });
          } else if (fnName === 'web_search') {
            const q = parseSearchQueryArg(tc.function?.arguments);
            toolOutput = await executeBrowserWebSearch(q, params.signal);
          }
          messages.push({
            role: 'tool',
            tool_call_id: toolCallId,
            content: toolOutput,
          });
        }
        continue;
      }
      if (cleaned) {
        return { rawText: cleaned, toolSentAt: capturedSentAt };
      }
      break;
    }
    throw new Error('EMPTY_RESPONSE');
  }

  if (creds.protocol === 'gemini') {
    let contents: Record<string, unknown>[] = turns.map((turn) => ({
      role: turn.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: turn.content }],
    }));

    const useNativeSearch = needWebSearch;
    const useTimeDecl = needTimeTool && !useNativeSearch;
    let toolsActive = useNativeSearch || useTimeDecl;
    let capturedSentAt: MessageDateTime | null = null;

    for (let round = 0; round < 3; round += 1) {
      const payload: Record<string, unknown> = {
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        generationConfig: {
          temperature: creds.temperature,
        },
        contents,
      };
      if (toolsActive) {
        if (useNativeSearch) {
          payload.tools = [{ google_search: {} }];
        } else if (useTimeDecl) {
          payload.tools = [
            {
              functionDeclarations: [
                {
                  name: 'set_send_time',
                  description:
                    'Set the timestamp of the outgoing message in YYYY-MM-DD HH:mm format.',
                  parameters: SET_SEND_TIME_SCHEMA,
                },
              ],
            },
          ];
        }
      }

      const response = await safeFetch(url, {
        method: 'POST',
        signal: params.signal,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        if (toolsActive && (response.status === 400 || response.status === 422) && round === 0) {
          toolsActive = false;
          continue;
        }
        const errText = await response.text().catch(() => '');
        throw new Error(`HTTP ${response.status}${errText ? `: ${errText.slice(0, 140)}` : ''}`);
      }

      const data = (await response.json()) as {
        candidates?: {
          content?: {
            parts?: {
              text?: string;
              functionCall?: { name?: string; args?: Record<string, unknown> };
            }[];
          };
        }[];
      };
      const parts = data.candidates?.[0]?.content?.parts ?? [];
      const text = parts
        .filter((p) => typeof p.text === 'string')
        .map((p) => p.text ?? '')
        .join('');
      const fnCalls = parts.filter((p) => Boolean(p.functionCall?.name));
      for (const p of fnCalls) {
        if (p.functionCall?.name === 'set_send_time' && !capturedSentAt) {
          capturedSentAt = parseToolTimeArg(p.functionCall.args, prevDt, now);
        }
      }
      const cleaned = stripSpeakerPrefix(text, params.targetCharacter.name);
      if (cleaned) {
        return { rawText: cleaned, toolSentAt: capturedSentAt };
      }
      if (fnCalls.length > 0 && round < 2) {
        contents = [
          ...contents,
          { role: 'model', parts },
          {
            role: 'user',
            parts: fnCalls.map((p) => {
              const parsedDt =
                p.functionCall?.name === 'set_send_time'
                  ? parseToolTimeArg(p.functionCall.args, prevDt, now)
                  : null;
              return {
                functionResponse: {
                  name: p.functionCall?.name ?? 'set_send_time',
                  response: {
                    ok: true,
                    send_time: parsedDt ? formatDateTimeBadge(parsedDt) : 'recorded',
                  },
                },
              };
            }),
          },
        ];
        continue;
      }
      break;
    }
    throw new Error('EMPTY_RESPONSE');
  }

  const anthropicTools: Record<string, unknown>[] = [];
  if (needTimeTool) {
    anthropicTools.push({
      name: 'set_send_time',
      description: 'Set the timestamp of the outgoing message in YYYY-MM-DD HH:mm format.',
      input_schema: SET_SEND_TIME_SCHEMA,
    });
  }
  if (needWebSearch) {
    anthropicTools.push({
      type: 'web_search_20250305',
      name: 'web_search',
      max_uses: 3,
    });
  }

  let antMessages: Record<string, unknown>[] = turns.map((turn) => ({
    role: turn.role,
    content: turn.content,
  }));
  let antToolsMode: 'all' | 'function_only' | 'none' =
    anthropicTools.length > 0 ? 'all' : 'none';
  let capturedSentAt: MessageDateTime | null = null;

  for (let round = 0; round < 3; round += 1) {
    const activeTools =
      antToolsMode === 'all'
        ? anthropicTools
        : antToolsMode === 'function_only'
          ? anthropicTools.filter((tItem) => !('type' in tItem))
          : [];
    const payload: Record<string, unknown> = {
      model: creds.model,
      max_tokens: 1024,
      temperature: Math.min(1, creds.temperature),
      system: systemInstruction,
      messages: antMessages,
    };
    if (activeTools.length > 0) {
      payload.tools = activeTools;
    }

    const response = await safeFetch(url, {
      method: 'POST',
      signal: params.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': creds.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      if ((response.status === 400 || response.status === 422) && round === 0 && antToolsMode !== 'none') {
        antToolsMode = antToolsMode === 'all' && needTimeTool && needWebSearch ? 'function_only' : 'none';
        continue;
      }
      const errText = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status}${errText ? `: ${errText.slice(0, 140)}` : ''}`);
    }
    const data = (await response.json()) as {
      content?: {
        type?: string;
        text?: string;
        id?: string;
        name?: string;
        input?: Record<string, unknown>;
      }[];
    };
    const blocks = data.content ?? [];
    const text = blocks
      .filter((block) => block.type === 'text' || typeof block.text === 'string')
      .map((block) => block.text ?? '')
      .join('');
    const toolUses = blocks.filter((block) => block.type === 'tool_use');
    for (const block of toolUses) {
      if (block.name === 'set_send_time' && !capturedSentAt) {
        capturedSentAt = parseToolTimeArg(block.input, prevDt, now);
      }
    }
    const cleaned = stripSpeakerPrefix(text, params.targetCharacter.name);
    if (cleaned) {
      return { rawText: cleaned, toolSentAt: capturedSentAt };
    }
    if (toolUses.length > 0 && round < 2) {
      antMessages = [
        ...antMessages,
        { role: 'assistant', content: blocks },
        {
          role: 'user',
          content: toolUses.map((block, idx) => {
            const parsedDt =
              block.name === 'set_send_time' ? parseToolTimeArg(block.input, prevDt, now) : null;
            return {
              type: 'tool_result',
              tool_use_id: block.id || `tool_${round}_${idx}`,
              content: JSON.stringify({
                ok: true,
                send_time: parsedDt ? formatDateTimeBadge(parsedDt) : 'recorded',
              }),
            };
          }),
        },
      ];
      continue;
    }
    break;
  }
  throw new Error('EMPTY_RESPONSE');
}

export async function testAiConnection(
  protocol: AiProtocol,
  rawBaseUrl: string,
  rawApiKey: string,
  rawModel: string
): Promise<{ ok: boolean; latencyMs: number; detail: string }> {
  const apiKey = rawApiKey.trim();
  if (!apiKey) {
    return { ok: false, latencyMs: 0, detail: 'NO_API_KEY' };
  }
  const model = rawModel.trim() || AI_PROTOCOL_METAS[protocol].defaultModel;
  const { url } = normalizeAiEndpoint(protocol, rawBaseUrl, model, apiKey);
  const started = Date.now();
  try {
    let response: Response;
    if (protocol === 'gemini') {
      response = await safeFetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
          generationConfig: { maxOutputTokens: 8 },
        }),
      });
    } else if (protocol === 'anthropic') {
      response = await safeFetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model,
          max_tokens: 8,
          messages: [{ role: 'user', content: 'ping' }],
        }),
      });
    } else {
      response = await safeFetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          max_tokens: 8,
          messages: [{ role: 'user', content: 'ping' }],
        }),
      });
    }
    const latencyMs = Math.max(1, Date.now() - started);
    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return {
        ok: false,
        latencyMs,
        detail: `HTTP ${response.status}${errText ? `: ${errText.slice(0, 100)}` : ''}`,
      };
    }
    return { ok: true, latencyMs, detail: model };
  } catch (err) {
    return {
      ok: false,
      latencyMs: Math.max(1, Date.now() - started),
      detail: err instanceof Error ? err.message : 'Network error',
    };
  }
}

export async function fetchAiModels(
  protocol: AiProtocol,
  rawBaseUrl: string,
  rawApiKey: string
): Promise<string[]> {
  const apiKey = rawApiKey.trim();
  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }
  const { baseRoot } = normalizeAiEndpoint(
    protocol,
    rawBaseUrl,
    AI_PROTOCOL_METAS[protocol].defaultModel,
    apiKey
  );

  if (protocol === 'gemini') {
    const response = await safeFetch(`${baseRoot}/models?key=${encodeURIComponent(apiKey)}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = (await response.json()) as {
      models?: { name?: string; supportedGenerationMethods?: string[] }[];
    };
    const ids = (data.models ?? [])
      .filter(
        (m) =>
          !m.supportedGenerationMethods ||
          m.supportedGenerationMethods.includes('generateContent')
      )
      .map((m) => (m.name ?? '').replace(/^models\//, ''))
      .filter(Boolean);
    return Array.from(new Set(ids));
  }

  if (protocol === 'anthropic') {
    const response = await safeFetch(`${baseRoot}/models`, {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = (await response.json()) as { data?: { id?: string }[] };
    const ids = (data.data ?? []).map((m) => m.id ?? '').filter(Boolean);
    return Array.from(new Set(ids));
  }

  const response = await safeFetch(`${baseRoot}/models`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const data = (await response.json()) as { data?: { id?: string }[] };
  const ids = (data.data ?? []).map((m) => m.id ?? '').filter(Boolean);
  return Array.from(new Set(ids));
}

export function formatAiConversationTranscript(conv: Conversation): string {
  const lines: string[] = [`# ${conv.title}`, ''];
  for (const msg of conv.messages) {
    if (msg.dividerBefore) {
      lines.push(`--- ${msg.dividerBefore} ---`);
    }
    const ts = msg.sentAt ? formatDateTimeBadge(msg.sentAt) : msg.timestamp;
    const parts: string[] = [];
    if (msg.text?.trim()) {
      parts.push(msg.text.trim());
    }
    if (msg.fileMedia) {
      parts.push(`[File: ${msg.fileMedia.filename} (${msg.fileMedia.sizeLabel})]`);
    }
    if (msg.imageMedia) {
      parts.push(`[Image: ${msg.imageMedia.filename}]`);
    }
    if (msg.voiceMedia) {
      parts.push(`[Voice: ${msg.voiceMedia.filename}]`);
    }
    if (msg.attachments?.length) {
      parts.push(`[Files: ${msg.attachments.map((a) => a.filename).join(', ')}]`);
    }
    lines.push(`[${ts}] ${msg.username}: ${parts.join(' ')}`.trim());
  }
  return lines.join('\n');
}

export function editMessageText(
  messages: ChatMessage[],
  messageId: string,
  nextText: string
): ChatMessage[] {
  const trimmed = nextText.trim();
  let changed = false;
  const next = messages.map((msg) => {
    if (msg.id !== messageId) {
      return msg;
    }
    const hasMedia = Boolean(
      msg.fileMedia || msg.imageMedia || msg.voiceMedia || (msg.attachments && msg.attachments.length > 0)
    );
    if (!trimmed) {
      if (!hasMedia) {
        return msg;
      }
      if (msg.text === undefined) {
        return msg;
      }
      changed = true;
      return { ...msg, text: undefined };
    }
    if (msg.text === trimmed) {
      return msg;
    }
    changed = true;
    return { ...msg, text: trimmed };
  });
  return changed ? next : messages;
}

export function prepareRegenerateTarget(
  messages: ChatMessage[],
  messageId: string,
  characters: CharacterProfile[],
  userMemberId: string = '__user__'
): {
  mode: 'replace_ai' | 'reply_after_user';
  targetIndex: number;
  historyBeforeTarget: ChatMessage[];
  targetCharacter: CharacterProfile | null;
  triggerText: string;
} | null {
  const idx = messages.findIndex((m) => m.id === messageId);
  if (idx === -1) {
    return null;
  }
  const msg = messages[idx];
  const matchedChar =
    msg.memberId !== userMemberId ? characters.find((c) => c.id === msg.memberId) ?? null : null;

  if (matchedChar) {
    return {
      mode: 'replace_ai',
      targetIndex: idx,
      historyBeforeTarget: messages.slice(0, idx),
      targetCharacter: matchedChar,
      triggerText: msg.text ?? '',
    };
  }

  return {
    mode: 'reply_after_user',
    targetIndex: idx,
    historyBeforeTarget: messages.slice(0, idx + 1),
    targetCharacter: null,
    triggerText: msg.text ?? '',
  };
}
