import type {
  AiAutoChatConfig,
  AiCharacterConfig,
  AiGlobalConfig,
  AiOutputLanguage,
  AiProtocol,
  AiReplyLength,
  AiTimeFrequency,
  AiTimeMode,
  AiUsagePurpose,
  AiUsageRecord,
  AiUsageState,
  AiUsageTotals,
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
  getMessageDateTime,
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
  timeMode: 'ai_inferred',
  timeFrequency: 'balanced',
  outputLanguage: 'auto',
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
  structuredFileMedia?: ChatFileMedia;
  usageRecords: AiUsageRecord[];
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

export function sanitizeAiTimeFrequency(raw: unknown): AiTimeFrequency {
  if (
    raw === 'high' ||
    raw === 'somewhat_high' ||
    raw === 'balanced' ||
    raw === 'somewhat_low' ||
    raw === 'low'
  ) {
    return raw;
  }
  return 'balanced';
}

export function sanitizeAiOutputLanguage(raw: unknown): AiOutputLanguage {
  if (
    raw === 'auto' ||
    raw === 'zh-CN' ||
    raw === 'zh-TW' ||
    raw === 'en' ||
    raw === 'ja'
  ) {
    return raw;
  }
  return 'auto';
}

export function sanitizeAiGlobalConfig(raw?: Partial<AiGlobalConfig> | null): AiGlobalConfig {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_AI_GLOBAL_CONFIG };
  }
  const protocol = sanitizeAiProtocol(raw.protocol);
  const timeMode: AiTimeMode =
    raw.timeMode === 'realtime'
      ? 'realtime'
      : raw.timeMode === 'ai_inferred'
        ? 'ai_inferred'
        : DEFAULT_AI_GLOBAL_CONFIG.timeMode;
  const timeFrequency = sanitizeAiTimeFrequency(raw.timeFrequency);
  const outputLanguage = sanitizeAiOutputLanguage(raw.outputLanguage);
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
    timeFrequency,
    outputLanguage,
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
  timeFrequency?: AiTimeFrequency;
  outputLanguage?: AiOutputLanguage;
  replyLength?: AiReplyLength;
  lastMessageDateTime?: MessageDateTime | null;
  now?: Date;
  members?: VoiceMember[];
  webSearchEnabled?: boolean;
}

export function buildTimeFrequencyDirective(frequency: AiTimeFrequency): string {
  switch (frequency) {
    case 'high':
      return 'Frequency tendency — HIGH: Favor rapid, continuous back-and-forth exchanges (typically 0–5 minutes apart when conversing actively), with only brief pauses (10–25 minutes) when someone finishes a thought or checks a file.';
    case 'somewhat_high':
      return 'Frequency tendency — SOMEWHAT HIGH: Lean toward frequent, responsive exchanges (often 1–8 minutes apart), mixed occasionally with medium breaks (20–90 minutes) when members focus on tasks.';
    case 'somewhat_low':
      return 'Frequency tendency — SOMEWHAT LOW: Lean toward spaced-out asynchronous check-ins (mostly 30 minutes to several hours apart reflecting busy personal schedules), with only occasional short bursts (2–10 minutes) when two members happen to be active together.';
    case 'low':
      return 'Frequency tendency — LOW: Keep messages sparse across the day or night (often 2–12+ hours apart or jumping to later sessions/next night), reflecting deep focus, sleep, or school/work away from chat, with very rare quick follow-ups.';
    case 'balanced':
    default:
      return 'Frequency tendency — BALANCED: Naturally blend rapid active bursts (1–5 minutes), moderate task pauses (15–60 minutes), and occasional multi-hour jumps (2–6+ hours) according to conversation urgency, character schedules, and topic shifts.';
  }
}

export function buildOutputLanguageDirective(outputLanguage: AiOutputLanguage): string {
  switch (outputLanguage) {
    case 'zh-CN':
      return 'Output language requirement: Write ALL of your reply text strictly in Simplified Chinese (简体中文). Keep every aspect of your character personality, tone, warmth/sharpness, catchphrases, and Nightcord role completely intact.';
    case 'zh-TW':
      return 'Output language requirement: Write ALL of your reply text strictly in Traditional Chinese (繁體中文). Keep every aspect of your character personality, tone, warmth/sharpness, catchphrases, and Nightcord role completely intact.';
    case 'en':
      return 'Output language requirement: Write ALL of your reply text strictly in natural English. Keep every aspect of your character personality, tone, warmth/sharpness, catchphrases, and Nightcord role completely intact.';
    case 'ja':
      return 'Output language requirement: Write ALL of your reply text strictly in natural Japanese (日本語). Keep every aspect of your character personality, tone, warmth/sharpness, catchphrases, and Nightcord role completely intact.';
    case 'auto':
    default:
      return 'Output language requirement (Auto): Match the conversation context and your character’s natural linguistic habits, switching naturally if the user or context shifts languages, while staying true to your Nightcord personality and speaking style.';
  }
}

function formatStandardDateTime(dt: MessageDateTime): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${dt.year}-${pad(dt.month)}-${pad(dt.day)} ${pad(dt.hour)}:${pad(dt.minute)}`;
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
  const timeMode: AiTimeMode = opts.timeMode === 'realtime' ? 'realtime' : 'ai_inferred';
  const timeFrequency: AiTimeFrequency = sanitizeAiTimeFrequency(opts.timeFrequency);
  const outputLanguage: AiOutputLanguage = sanitizeAiOutputLanguage(opts.outputLanguage);
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
    buildOutputLanguageDirective(outputLanguage),
    `Addressing peers: you may occasionally mention another active member or user with "@Name" (for example "@${userDisplayName}" or an online peer's name) when replying specifically to someone, calling them in, or reacting to them—keep @mentions occasional and natural, and do NOT put an @mention in every message.`,
    `Contextual file sharing: judge naturally from the conversation context and your Nightcord role whether and what file to share (e.g. audio rough .mp3, rough MV .mp4, illustration/sketch .jpg, or lyrics/notes .txt). You do not have to wait for someone to explicitly ask; when sharing a file fits the moment, append [[FILE:filename.ext|sizeLabel]] (e.g. [[FILE:nightcord_demo_01.mp3|4MB MP3]] or [[FILE:lyrics_draft.txt|2KB テキスト]]) at the very end of your message. Do NOT attach a file on every message—only occasionally when it feels genuinely fitting.`,
  ];

  if (opts.webSearchEnabled) {
    rules.push(
      'Web search is enabled: when discussing real-world facts, dates, releases, tools, or current topics you are uncertain about, use your web search capability to verify before replying.'
    );
  }

  if (timeMode === 'ai_inferred') {
    const simStartDt = dateToMessageDateTime(now);
    const anchorDt = lastDt ?? simStartDt;
    const prevBadge = formatDateTimeBadge(anchorDt);
    const prevStd = formatStandardDateTime(anchorDt);
    const simStartStd = formatStandardDateTime(simStartDt);
    const recentTimeline = history
      .slice(-6)
      .map((msg) => {
        const dt = getMessageDateTime(msg, now);
        return dt ? `- ${msg.username}: ${formatStandardDateTime(dt)}` : '';
      })
      .filter(Boolean);

    rules.push(
      [
        `Autonomous send timestamp system (STRICT STRUCTURED OUTPUT):`,
        `- Local webpage simulation start time: ${simStartStd}.`,
        lastDt
          ? `- Previous message was sent at ${prevStd} (${prevBadge}). Choose a realistic send_time moving forward at or after ${prevStd}, NEVER earlier.`
          : `- This is the start of the conversation. Choose a realistic initial send_time starting from ${simStartStd} (or shortly after), NEVER earlier.`,
        recentTimeline.length > 0
          ? `- Recent send-time pacing reference (INTERNAL CONTEXT ONLY — NEVER echo or mention these timestamps in your reply text):\n${recentTimeline.join('\n')}`
          : '',
        `- ${buildTimeFrequencyDirective(timeFrequency)}`,
        `- NEVER add a fixed constant interval to every message. Let pacing vary organically (quick consecutive replies vs. tens of minutes vs. multi-hour jumps) based on topic urgency, member status (e.g. active voice call vs. stepping away/sleeping), and time of day.`,
        `- ABSOLUTE PROHIBITION: NEVER write dates, clock times, or timestamps in any form inside your spoken message text or speaker name (e.g. NEVER write "(11/23 8:18)", "[2026-11-24 17:30]", "[[TIME:...]]", or leading timestamps). Deliver "send_time" ("YYYY-MM-DD HH:mm") ONLY via the "set_send_time" tool call or structured JSON "send_time" field.`,
      ]
        .filter(Boolean)
        .join('\n')
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
      const floorDt = prevDt ?? dateToMessageDateTime(now);
      if (dateTimeToEpochMinutes(candidate) < dateTimeToEpochMinutes(floorDt)) {
        return { ...floorDt };
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
      const floorDt = prevDt ?? dateToMessageDateTime(now);
      if (dateTimeToEpochMinutes(candidate) < dateTimeToEpochMinutes(floorDt)) {
        return { ...floorDt };
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

function createStructuredFileMedia(rawFilename: string, customSizeLabel?: string): ChatFileMedia | undefined {
  const safeName = rawFilename.trim().replace(/[/\\]+/g, '_');
  if (!safeName) {
    return undefined;
  }
  const kind = detectFileMediaKind(safeName, '');
  const fallbackMeta = formatNightcordFileMeta(
    buildDefaultDummySizeBytes(kind),
    safeName,
    kind
  );
  return {
    mediaId: '',
    filename: safeName,
    kind,
    sizeLabel: customSizeLabel?.trim() || fallbackMeta.sizeLabel,
    fileType: extractFileType(safeName) || fallbackMeta.fileType,
    displayMode: 'card',
  };
}

export function parseStructuredJsonReply(
  rawText: string,
  characterName: string,
  prevDt?: MessageDateTime | null,
  now: Date = new Date()
): { text: string; sentAt: MessageDateTime | null; fileMedia?: ChatFileMedia } | null {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return null;
  }
  let candidateJson = trimmed;
  if (candidateJson.startsWith('```')) {
    const firstBreak = candidateJson.indexOf('\n');
    const lastFence = candidateJson.lastIndexOf('```');
    if (firstBreak !== -1 && lastFence > firstBreak) {
      candidateJson = candidateJson.slice(firstBreak + 1, lastFence).trim();
    }
  }
  if (!candidateJson.startsWith('{') || !candidateJson.endsWith('}')) {
    return null;
  }
  try {
    const parsed = JSON.parse(candidateJson) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null;
    }
    const msgField =
      typeof parsed.message === 'string'
        ? parsed.message
        : typeof parsed.reply === 'string'
          ? parsed.reply
          : typeof parsed.text === 'string'
            ? parsed.text
            : typeof parsed.content === 'string'
              ? parsed.content
              : null;
    if (msgField === null) {
      return null;
    }
    const timeField =
      typeof parsed.send_time === 'string'
        ? parsed.send_time
        : typeof parsed.sendTime === 'string'
          ? parsed.sendTime
          : typeof parsed.timestamp === 'string'
            ? parsed.timestamp
            : '';
    const sentAt = timeField ? parseAiDateTimeTag(timeField, prevDt, now) : null;
    let fileMedia: ChatFileMedia | undefined;
    const rawFile = parsed.attach_file ?? parsed.file;
    if (rawFile && typeof rawFile === 'object' && !Array.isArray(rawFile)) {
      const fileObj = rawFile as Record<string, unknown>;
      if (typeof fileObj.filename === 'string') {
        fileMedia = createStructuredFileMedia(
          fileObj.filename,
          typeof fileObj.size_label === 'string'
            ? fileObj.size_label
            : typeof fileObj.sizeLabel === 'string'
              ? fileObj.sizeLabel
              : undefined
        );
      }
    } else if (typeof rawFile === 'string' && rawFile.trim()) {
      fileMedia = createStructuredFileMedia(rawFile);
    }
    return {
      text: stripSpeakerPrefix(msgField, characterName),
      sentAt,
      fileMedia,
    };
  } catch {
    return null;
  }
}

export function parseAiModelOutput(
  rawText: string,
  characterName: string
): ParsedAiResponse {
  let working = stripSpeakerPrefix(rawText, characterName);
  let fileMedia: ChatFileMedia | undefined;

  const filePattern = /\[\[FILE:([^|\]]+)(?:\|([^\]]*))?\]\]/i;
  const fileMatch = filePattern.exec(working);
  if (fileMatch) {
    fileMedia = createStructuredFileMedia(fileMatch[1], fileMatch[2]);
    working = working.replace(filePattern, '').trim();
  }

  return {
    text: stripSpeakerPrefix(working, characterName),
    inferredSentAt: null,
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

export function createEmptyUsageTotals(): AiUsageTotals {
  return {
    requestCount: 0,
    knownUsageRequestCount: 0,
    unknownUsageRequestCount: 0,
    inputTokens: null,
    outputTokens: null,
    totalTokens: null,
    thinkingTokens: null,
    cachedTokens: null,
    extraTokens: {},
  };
}

export function createEmptyUsageState(): AiUsageState {
  return {
    session: createEmptyUsageTotals(),
    sessionRecords: [],
    history: createEmptyUsageTotals(),
    historyRecords: [],
  };
}

function toFiniteNonNegInt(val: unknown): number | null {
  if (typeof val !== 'number' || !Number.isFinite(val) || val < 0) {
    return null;
  }
  return Math.round(val);
}

function addNullableTokenSum(current: number | null, incoming: number | null): number | null {
  if (incoming === null) {
    return current;
  }
  return (current ?? 0) + incoming;
}

export function extractProviderUsage(
  protocol: AiProtocol,
  rawData: unknown
): {
  usageKnown: boolean;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  thinkingTokens: number | null;
  cachedTokens: number | null;
  extraTokens: Record<string, number>;
} {
  const empty = {
    usageKnown: false,
    inputTokens: null,
    outputTokens: null,
    totalTokens: null,
    thinkingTokens: null,
    cachedTokens: null,
    extraTokens: {} as Record<string, number>,
  };
  if (!rawData || typeof rawData !== 'object' || Array.isArray(rawData)) {
    return empty;
  }
  const data = rawData as Record<string, unknown>;
  const extraTokens: Record<string, number> = {};

  if (protocol === 'gemini') {
    const meta = data.usageMetadata;
    if (!meta || typeof meta !== 'object' || Array.isArray(meta)) {
      return empty;
    }
    const u = meta as Record<string, unknown>;
    const inputTokens = toFiniteNonNegInt(u.promptTokenCount);
    const outputTokens = toFiniteNonNegInt(u.candidatesTokenCount);
    const totalTokens = toFiniteNonNegInt(u.totalTokenCount);
    const thinkingTokens = toFiniteNonNegInt(u.thoughtsTokenCount);
    const cachedTokens = toFiniteNonNegInt(u.cachedContentTokenCount);
    const toolPromptTokens = toFiniteNonNegInt(u.toolUsePromptTokenCount);
    if (toolPromptTokens !== null) {
      extraTokens.tool_use_prompt_tokens = toolPromptTokens;
    }
    const knownKeys = [
      'promptTokenCount',
      'candidatesTokenCount',
      'totalTokenCount',
      'thoughtsTokenCount',
      'cachedContentTokenCount',
      'toolUsePromptTokenCount',
    ];
    for (const [key, val] of Object.entries(u)) {
      if (knownKeys.includes(key)) {
        continue;
      }
      const num = toFiniteNonNegInt(val);
      if (num !== null) {
        extraTokens[key] = num;
      }
    }
    const usageKnown =
      inputTokens !== null || outputTokens !== null || totalTokens !== null;
    if (!usageKnown) {
      return empty;
    }
    return {
      usageKnown,
      inputTokens,
      outputTokens,
      totalTokens,
      thinkingTokens,
      cachedTokens,
      extraTokens,
    };
  }

  if (protocol === 'anthropic') {
    const usage = data.usage;
    if (!usage || typeof usage !== 'object' || Array.isArray(usage)) {
      return empty;
    }
    const u = usage as Record<string, unknown>;
    const inputTokens = toFiniteNonNegInt(u.input_tokens);
    const outputTokens = toFiniteNonNegInt(u.output_tokens);
    const cachedTokens = toFiniteNonNegInt(u.cache_read_input_tokens);
    const thinkingTokens = toFiniteNonNegInt(u.thinking_tokens);
    const cacheCreationTokens = toFiniteNonNegInt(u.cache_creation_input_tokens);
    if (cacheCreationTokens !== null) {
      extraTokens.cache_creation_input_tokens = cacheCreationTokens;
    }
    const serverToolUse = u.server_tool_use;
    if (serverToolUse && typeof serverToolUse === 'object' && !Array.isArray(serverToolUse)) {
      const searchRequests = toFiniteNonNegInt(
        (serverToolUse as Record<string, unknown>).web_search_requests
      );
      if (searchRequests !== null) {
        extraTokens.web_search_requests = searchRequests;
      }
    }
    const explicitTotal = toFiniteNonNegInt(u.total_tokens);
    const totalTokens =
      explicitTotal !== null
        ? explicitTotal
        : inputTokens !== null && outputTokens !== null
          ? inputTokens + outputTokens
          : null;
    const usageKnown =
      inputTokens !== null || outputTokens !== null || totalTokens !== null;
    if (!usageKnown) {
      return empty;
    }
    return {
      usageKnown,
      inputTokens,
      outputTokens,
      totalTokens,
      thinkingTokens,
      cachedTokens,
      extraTokens,
    };
  }

  const usage = data.usage;
  if (!usage || typeof usage !== 'object' || Array.isArray(usage)) {
    return empty;
  }
  const u = usage as Record<string, unknown>;
  const inputTokens =
    toFiniteNonNegInt(u.prompt_tokens) ?? toFiniteNonNegInt(u.input_tokens);
  const outputTokens =
    toFiniteNonNegInt(u.completion_tokens) ?? toFiniteNonNegInt(u.output_tokens);
  const explicitTotal = toFiniteNonNegInt(u.total_tokens);
  const totalTokens =
    explicitTotal !== null
      ? explicitTotal
      : inputTokens !== null && outputTokens !== null
        ? inputTokens + outputTokens
        : null;

  const compDetails =
    u.completion_tokens_details &&
    typeof u.completion_tokens_details === 'object' &&
    !Array.isArray(u.completion_tokens_details)
      ? (u.completion_tokens_details as Record<string, unknown>)
      : null;
  const promptDetails =
    u.prompt_tokens_details &&
    typeof u.prompt_tokens_details === 'object' &&
    !Array.isArray(u.prompt_tokens_details)
      ? (u.prompt_tokens_details as Record<string, unknown>)
      : null;

  const thinkingTokens =
    toFiniteNonNegInt(compDetails?.reasoning_tokens) ??
    toFiniteNonNegInt(u.reasoning_tokens);
  const cachedTokens =
    toFiniteNonNegInt(promptDetails?.cached_tokens) ??
    toFiniteNonNegInt(u.prompt_cache_hit_tokens) ??
    toFiniteNonNegInt(u.cached_tokens);

  const cacheMissTokens = toFiniteNonNegInt(u.prompt_cache_miss_tokens);
  if (cacheMissTokens !== null) {
    extraTokens.prompt_cache_miss_tokens = cacheMissTokens;
  }
  if (promptDetails) {
    for (const [k, v] of Object.entries(promptDetails)) {
      if (k === 'cached_tokens') {
        continue;
      }
      const num = toFiniteNonNegInt(v);
      if (num !== null && num > 0) {
        extraTokens[`prompt_${k}`] = num;
      }
    }
  }
  if (compDetails) {
    for (const [k, v] of Object.entries(compDetails)) {
      if (k === 'reasoning_tokens') {
        continue;
      }
      const num = toFiniteNonNegInt(v);
      if (num !== null && num > 0) {
        extraTokens[`completion_${k}`] = num;
      }
    }
  }

  const usageKnown =
    inputTokens !== null || outputTokens !== null || totalTokens !== null;
  if (!usageKnown) {
    return empty;
  }
  return {
    usageKnown,
    inputTokens,
    outputTokens,
    totalTokens,
    thinkingTokens,
    cachedTokens,
    extraTokens,
  };
}

export function applyUsageRecordToTotals(
  totals: AiUsageTotals,
  record: AiUsageRecord
): AiUsageTotals {
  const nextExtra: Record<string, number> = { ...totals.extraTokens };
  if (record.extraTokens) {
    for (const [key, val] of Object.entries(record.extraTokens)) {
      if (typeof val === 'number' && Number.isFinite(val)) {
        nextExtra[key] = (nextExtra[key] ?? 0) + val;
      }
    }
  }
  return {
    requestCount: totals.requestCount + 1,
    knownUsageRequestCount: totals.knownUsageRequestCount + (record.usageKnown ? 1 : 0),
    unknownUsageRequestCount: totals.unknownUsageRequestCount + (record.usageKnown ? 0 : 1),
    inputTokens: addNullableTokenSum(totals.inputTokens, record.inputTokens),
    outputTokens: addNullableTokenSum(totals.outputTokens, record.outputTokens),
    totalTokens: addNullableTokenSum(totals.totalTokens, record.totalTokens),
    thinkingTokens: addNullableTokenSum(totals.thinkingTokens, record.thinkingTokens),
    cachedTokens: addNullableTokenSum(totals.cachedTokens, record.cachedTokens),
    extraTokens: nextExtra,
  };
}

export function appendUsageRecordToState(
  state: AiUsageState,
  record: AiUsageRecord,
  maxRecords: number = 200
): AiUsageState {
  return {
    session: applyUsageRecordToTotals(state.session, record),
    sessionRecords: [record, ...state.sessionRecords].slice(0, maxRecords),
    history: applyUsageRecordToTotals(state.history, record),
    historyRecords: [record, ...state.historyRecords].slice(0, maxRecords),
  };
}

export function resetSessionUsageState(state: AiUsageState): AiUsageState {
  return {
    session: createEmptyUsageTotals(),
    sessionRecords: [],
    history: state.history,
    historyRecords: state.historyRecords,
  };
}

function sanitizeUsageTotals(raw: unknown): AiUsageTotals {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return createEmptyUsageTotals();
  }
  const obj = raw as Record<string, unknown>;
  const extraTokens: Record<string, number> = {};
  if (obj.extraTokens && typeof obj.extraTokens === 'object' && !Array.isArray(obj.extraTokens)) {
    for (const [k, v] of Object.entries(obj.extraTokens as Record<string, unknown>)) {
      const n = toFiniteNonNegInt(v);
      if (n !== null) {
        extraTokens[k] = n;
      }
    }
  }
  return {
    requestCount: toFiniteNonNegInt(obj.requestCount) ?? 0,
    knownUsageRequestCount: toFiniteNonNegInt(obj.knownUsageRequestCount) ?? 0,
    unknownUsageRequestCount: toFiniteNonNegInt(obj.unknownUsageRequestCount) ?? 0,
    inputTokens: toFiniteNonNegInt(obj.inputTokens),
    outputTokens: toFiniteNonNegInt(obj.outputTokens),
    totalTokens: toFiniteNonNegInt(obj.totalTokens),
    thinkingTokens: toFiniteNonNegInt(obj.thinkingTokens),
    cachedTokens: toFiniteNonNegInt(obj.cachedTokens),
    extraTokens,
  };
}

function sanitizeUsageRecords(raw: unknown): AiUsageRecord[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const result: AiUsageRecord[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      continue;
    }
    const r = item as Record<string, unknown>;
    if (typeof r.id !== 'string' || typeof r.model !== 'string') {
      continue;
    }
    const extraTokens: Record<string, number> = {};
    if (r.extraTokens && typeof r.extraTokens === 'object' && !Array.isArray(r.extraTokens)) {
      for (const [k, v] of Object.entries(r.extraTokens as Record<string, unknown>)) {
        const n = toFiniteNonNegInt(v);
        if (n !== null) {
          extraTokens[k] = n;
        }
      }
    }
    const purpose: AiUsagePurpose =
      r.purpose === 'follow_up' ||
      r.purpose === 'auto_chat' ||
      r.purpose === 'continue' ||
      r.purpose === 'regenerate' ||
      r.purpose === 'time_analysis' ||
      r.purpose === 'test'
        ? r.purpose
        : 'chat';
    result.push({
      id: r.id,
      timestampIso:
        typeof r.timestampIso === 'string' ? r.timestampIso : new Date().toISOString(),
      protocol: sanitizeAiProtocol(r.protocol),
      model: r.model,
      characterId: typeof r.characterId === 'string' ? r.characterId : '',
      characterName: typeof r.characterName === 'string' ? r.characterName : '',
      purpose,
      status: r.status === 'error' ? 'error' : 'ok',
      usageKnown: Boolean(r.usageKnown),
      inputTokens: toFiniteNonNegInt(r.inputTokens),
      outputTokens: toFiniteNonNegInt(r.outputTokens),
      totalTokens: toFiniteNonNegInt(r.totalTokens),
      thinkingTokens: toFiniteNonNegInt(r.thinkingTokens),
      cachedTokens: toFiniteNonNegInt(r.cachedTokens),
      ...(Object.keys(extraTokens).length > 0 ? { extraTokens } : {}),
      ...(typeof r.latencyMs === 'number' && Number.isFinite(r.latencyMs)
        ? { latencyMs: Math.max(0, Math.round(r.latencyMs)) }
        : {}),
    });
  }
  return result.slice(0, 200);
}

export function sanitizeAiUsageState(
  rawHistory?: unknown,
  rawSession?: unknown
): AiUsageState {
  const histObj =
    rawHistory && typeof rawHistory === 'object' && !Array.isArray(rawHistory)
      ? (rawHistory as Record<string, unknown>)
      : {};
  const sessObj =
    rawSession && typeof rawSession === 'object' && !Array.isArray(rawSession)
      ? (rawSession as Record<string, unknown>)
      : {};
  return {
    session: sanitizeUsageTotals(sessObj.session),
    sessionRecords: sanitizeUsageRecords(sessObj.sessionRecords),
    history: sanitizeUsageTotals(histObj.history),
    historyRecords: sanitizeUsageRecords(histObj.historyRecords),
  };
}

function buildUsageRecord(params: {
  protocol: AiProtocol;
  model: string;
  characterId: string;
  characterName: string;
  purpose: AiUsagePurpose;
  status: 'ok' | 'error';
  rawData?: unknown;
  latencyMs?: number;
}): AiUsageRecord {
  const parsed = params.rawData
    ? extractProviderUsage(params.protocol, params.rawData)
    : {
        usageKnown: false,
        inputTokens: null,
        outputTokens: null,
        totalTokens: null,
        thinkingTokens: null,
        cachedTokens: null,
        extraTokens: {},
      };
  return {
    id: `usage-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestampIso: new Date().toISOString(),
    protocol: params.protocol,
    model: params.model,
    characterId: params.characterId,
    characterName: params.characterName,
    purpose: params.purpose,
    status: params.status,
    usageKnown: parsed.usageKnown,
    inputTokens: parsed.inputTokens,
    outputTokens: parsed.outputTokens,
    totalTokens: parsed.totalTokens,
    thinkingTokens: parsed.thinkingTokens,
    cachedTokens: parsed.cachedTokens,
    ...(Object.keys(parsed.extraTokens).length > 0
      ? { extraTokens: parsed.extraTokens }
      : {}),
    ...(typeof params.latencyMs === 'number'
      ? { latencyMs: Math.max(1, Math.round(params.latencyMs)) }
      : {}),
  };
}

const GEMINI_STRUCTURED_REPLY_SCHEMA = {
  type: 'object',
  properties: {
    send_time: {
      type: 'string',
      description: 'Send timestamp in 24-hour YYYY-MM-DD HH:mm format.',
    },
    message: {
      type: 'string',
      description: 'Spoken chat message body only, with zero dates or timestamps inside.',
    },
  },
  required: ['send_time', 'message'],
};

const STRUCTURED_JSON_TIME_INSTRUCTION =
  'Respond strictly as a JSON object with keys "send_time" (string in YYYY-MM-DD HH:mm format) and "message" (string containing ONLY your spoken chat reply with NO timestamps or dates inside).';

const GEMINI_TIME_ONLY_SCHEMA = {
  type: 'object',
  properties: {
    send_time: {
      type: 'string',
      description: 'Send timestamp in 24-hour YYYY-MM-DD HH:mm format.',
    },
  },
  required: ['send_time'],
};

export function parseDedicatedTimeAnalyzerOutput(
  rawText: string,
  prevDt?: MessageDateTime | null,
  now: Date = new Date()
): MessageDateTime | null {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return null;
  }

  let candidateJson = trimmed;
  if (candidateJson.startsWith('```')) {
    const firstBreak = candidateJson.indexOf('\n');
    const lastFence = candidateJson.lastIndexOf('```');
    if (firstBreak !== -1 && lastFence > firstBreak) {
      candidateJson = candidateJson.slice(firstBreak + 1, lastFence).trim();
    }
  }
  const firstBrace = candidateJson.indexOf('{');
  const lastBrace = candidateJson.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const jsonSlice = candidateJson.slice(firstBrace, lastBrace + 1);
    const parsedFromJson = parseToolTimeArg(jsonSlice, prevDt, now);
    if (parsedFromJson) {
      return parsedFromJson;
    }
  }

  const fullMatches = Array.from(
    trimmed.matchAll(/(\d{4}[-/]\d{1,2}[-/]\d{1,2}(?:[T\s]+)\d{1,2}:\d{2})(?::\d{2})?/g)
  );
  if (fullMatches.length > 0) {
    const lastFull = fullMatches[fullMatches.length - 1][1];
    const parsedFull = parseAiDateTimeTag(lastFull, prevDt, now);
    if (parsedFull) {
      return parsedFull;
    }
  }

  const clockMatches = Array.from(trimmed.matchAll(/\b(\d{1,2}:\d{2})(?::\d{2})?\b/g));
  if (clockMatches.length > 0) {
    const lastClock = clockMatches[clockMatches.length - 1][1];
    const parsedClock = parseAiDateTimeTag(lastClock, prevDt, now);
    if (parsedClock) {
      return parsedClock;
    }
  }

  return null;
}

export function buildDedicatedTimeAnalyzerPrompt(params: {
  speakerName: string;
  cleanedReply: string;
  fileMedia?: ChatFileMedia;
  history: ChatMessage[];
  timeFrequency: AiTimeFrequency;
  members?: VoiceMember[];
  allCharacters: CharacterProfile[];
  prevDt?: MessageDateTime | null;
  now?: Date;
}): {
  systemInstruction: string;
  userPrompt: string;
} {
  const now = params.now ?? new Date();
  const simStartDt = dateToMessageDateTime(now);
  const anchorDt = params.prevDt ?? simStartDt;
  const simStartStd = formatStandardDateTime(simStartDt);
  const anchorStd = formatStandardDateTime(anchorDt);
  const anchorBadge = formatDateTimeBadge(anchorDt);
  const members = params.members ?? [];

  const timelineLines = params.history
    .slice(-8)
    .map((msg) => {
      const dt = getMessageDateTime(msg, now);
      const stamp = dt ? formatStandardDateTime(dt) : msg.timestamp;
      const msgText = msg.text?.trim() ?? '';
      const body = msgText
        ? msgText.slice(0, 120)
        : msg.fileMedia
          ? `[File: ${msg.fileMedia.filename}]`
          : msg.imageMedia
            ? `[Image: ${msg.imageMedia.filename}]`
            : msg.voiceMedia
              ? `[Voice: ${msg.voiceMedia.filename}]`
              : '';
      return `- [${stamp}] ${msg.username}: ${body}`;
    })
    .filter(Boolean);

  const presenceLines =
    members.length > 0
      ? params.allCharacters
          .map((c) => {
            const m = members.find((item) => item.id === c.id);
            return `- ${c.name}: ${describeMemberPresenceStatus(m)}`;
          })
          .join('\n')
      : '';

  const replyPreview = [
    params.cleanedReply.trim(),
    params.fileMedia ? `[File: ${params.fileMedia.filename}]` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const systemInstruction = [
    'You are a silent timestamp metadata analyzer for a group chat simulation.',
    'Your ONLY task is to choose a realistic send timestamp for the latest message.',
    'Do NOT write chat dialogue, explanations, or markdown fences.',
    'Respond ONLY with a single JSON object matching {"send_time":"YYYY-MM-DD HH:mm"}.',
  ].join(' ');

  const userPrompt = [
    `Local webpage simulation start time: ${simStartStd}`,
    params.prevDt
      ? `Previous message timestamp (STRICT LOWER BOUND — send_time MUST be >= ${anchorStd}): ${anchorStd} (${anchorBadge})`
      : `Conversation start lower bound (STRICT LOWER BOUND — send_time MUST be >= ${anchorStd}): ${anchorStd}`,
    buildTimeFrequencyDirective(params.timeFrequency),
    'Pacing rule: NEVER add a fixed constant step to every message. Let spacing vary organically (0–5 min bursts, 15–60 min pauses, or multi-hour gaps) based on frequency tendency, topic urgency, member status, and time of day.',
    presenceLines ? `Room member statuses:\n${presenceLines}` : '',
    timelineLines.length > 0 ? `Recent timeline:\n${timelineLines.join('\n')}` : '',
    `Incoming message to timestamp:\n[${params.speakerName}]: ${replyPreview || '(attachment)'}`,
    `Output ONLY {"send_time":"YYYY-MM-DD HH:mm"} at or after ${anchorStd}.`,
  ]
    .filter(Boolean)
    .join('\n\n');

  return { systemInstruction, userPrompt };
}

async function requestDedicatedSendTimeInference(params: {
  targetCharacter: CharacterProfile;
  creds: {
    protocol: AiProtocol;
    baseUrl: string;
    apiKey: string;
    model: string;
  };
  url: string;
  history: ChatMessage[];
  cleanedReply: string;
  fileMedia?: ChatFileMedia;
  globalConfig: AiGlobalConfig;
  allCharacters: CharacterProfile[];
  members?: VoiceMember[];
  prevDt?: MessageDateTime | null;
  now: Date;
  signal?: AbortSignal;
  onUsageRecord?: (record: AiUsageRecord) => void;
}): Promise<MessageDateTime | null> {
  const { systemInstruction, userPrompt } = buildDedicatedTimeAnalyzerPrompt({
    speakerName: params.targetCharacter.name,
    cleanedReply: params.cleanedReply,
    fileMedia: params.fileMedia,
    history: params.history,
    timeFrequency: params.globalConfig.timeFrequency,
    members: params.members,
    allCharacters: params.allCharacters,
    prevDt: params.prevDt,
    now: params.now,
  });

  const emitAnalyzerUsage = (status: 'ok' | 'error', rawData: unknown, latencyMs: number) => {
    const rec = buildUsageRecord({
      protocol: params.creds.protocol,
      model: params.creds.model,
      characterId: params.targetCharacter.id,
      characterName: params.targetCharacter.name,
      purpose: 'time_analysis',
      status,
      rawData,
      latencyMs,
    });
    params.onUsageRecord?.(rec);
  };

  try {
    if (params.creds.protocol === 'openai' || params.creds.protocol === 'deepseek') {
      let useJsonMode = true;
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const payload: Record<string, unknown> = {
          model: params.creds.model,
          temperature: 0.7,
          max_tokens: 256,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: userPrompt },
          ],
        };
        if (useJsonMode) {
          payload.response_format = { type: 'json_object' };
        }
        const startedAt = Date.now();
        const response = await safeFetch(params.url, {
          method: 'POST',
          signal: params.signal,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${params.creds.apiKey}`,
          },
          body: JSON.stringify(payload),
        });
        const latencyMs = Math.max(1, Date.now() - startedAt);
        if (!response.ok) {
          emitAnalyzerUsage('error', undefined, latencyMs);
          if (useJsonMode && (response.status === 400 || response.status === 422)) {
            useJsonMode = false;
            continue;
          }
          return null;
        }
        const data = (await response.json()) as {
          choices?: {
            message?: {
              content?: string | { text?: string }[] | null;
            };
          }[];
        };
        emitAnalyzerUsage('ok', data, latencyMs);
        const rawContent = data.choices?.[0]?.message?.content;
        const text =
          typeof rawContent === 'string'
            ? rawContent
            : Array.isArray(rawContent)
              ? rawContent.map((part) => part.text ?? '').join('')
              : '';
        return parseDedicatedTimeAnalyzerOutput(text, params.prevDt, params.now);
      }
      return null;
    }

    if (params.creds.protocol === 'gemini') {
      let useJsonSchema = true;
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const generationConfig: Record<string, unknown> = {
          temperature: 0.7,
          maxOutputTokens: 256,
        };
        if (useJsonSchema) {
          generationConfig.responseMimeType = 'application/json';
          generationConfig.responseSchema = GEMINI_TIME_ONLY_SCHEMA;
        }
        const startedAt = Date.now();
        const response = await safeFetch(params.url, {
          method: 'POST',
          signal: params.signal,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            generationConfig,
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          }),
        });
        const latencyMs = Math.max(1, Date.now() - startedAt);
        if (!response.ok) {
          emitAnalyzerUsage('error', undefined, latencyMs);
          if (useJsonSchema && (response.status === 400 || response.status === 422)) {
            useJsonSchema = false;
            continue;
          }
          return null;
        }
        const data = (await response.json()) as {
          candidates?: {
            content?: {
              parts?: { text?: string }[];
            };
          }[];
        };
        emitAnalyzerUsage('ok', data, latencyMs);
        const parts = data.candidates?.[0]?.content?.parts ?? [];
        const text = parts
          .filter((p) => typeof p.text === 'string')
          .map((p) => p.text ?? '')
          .join('');
        return parseDedicatedTimeAnalyzerOutput(text, params.prevDt, params.now);
      }
      return null;
    }

    const startedAt = Date.now();
    const response = await safeFetch(params.url, {
      method: 'POST',
      signal: params.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': params.creds.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: params.creds.model,
        max_tokens: 256,
        temperature: 0.7,
        system: systemInstruction,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });
    const latencyMs = Math.max(1, Date.now() - startedAt);
    if (!response.ok) {
      emitAnalyzerUsage('error', undefined, latencyMs);
      return null;
    }
    const data = (await response.json()) as {
      content?: { type?: string; text?: string }[];
    };
    emitAnalyzerUsage('ok', data, latencyMs);
    const text = (data.content ?? [])
      .filter((block) => block.type === 'text' || typeof block.text === 'string')
      .map((block) => block.text ?? '')
      .join('');
    return parseDedicatedTimeAnalyzerOutput(text, params.prevDt, params.now);
  } catch (err) {
    if (
      (err instanceof DOMException && err.name === 'AbortError') ||
      (err instanceof Error && err.name === 'AbortError')
    ) {
      throw err;
    }
    return null;
  }
}

export async function requestAiCompletion(params: {
  targetCharacter: CharacterProfile;
  charConfig: AiCharacterConfig;
  globalConfig: AiGlobalConfig;
  history: ChatMessage[];
  allCharacters: CharacterProfile[];
  members?: VoiceMember[];
  signal?: AbortSignal;
  purpose?: AiUsagePurpose;
  onUsageRecord?: (record: AiUsageRecord) => void;
}): Promise<AiCompletionResult> {
  const creds = resolveEffectiveAiCredentials(params.charConfig, params.globalConfig);
  if (!creds.ready) {
    throw new Error('NO_API_KEY');
  }

  const now = new Date();
  const prevDt = getLastMessageDateTime(params.history, now);
  const needTimeTool = params.globalConfig.timeMode === 'ai_inferred';
  const needWebSearch = Boolean(params.globalConfig.webSearchEnabled);
  const purpose: AiUsagePurpose = params.purpose ?? 'chat';
  const collectedUsageRecords: AiUsageRecord[] = [];

  const emitUsage = (status: 'ok' | 'error', rawData: unknown, latencyMs: number) => {
    const rec = buildUsageRecord({
      protocol: creds.protocol,
      model: creds.model,
      characterId: params.targetCharacter.id,
      characterName: params.targetCharacter.name,
      purpose,
      status,
      rawData,
      latencyMs,
    });
    collectedUsageRecords.push(rec);
    params.onUsageRecord?.(rec);
  };

  const { url } = normalizeAiEndpoint(creds.protocol, creds.baseUrl, creds.model, creds.apiKey);

  const finalizeCompletion = async (
    rawText: string,
    sentAt: MessageDateTime | null,
    fileMedia?: ChatFileMedia
  ): Promise<AiCompletionResult> => {
    let finalSentAt = sentAt;
    if (needTimeTool && !finalSentAt && (rawText || fileMedia)) {
      finalSentAt = await requestDedicatedSendTimeInference({
        targetCharacter: params.targetCharacter,
        creds,
        url,
        history: params.history,
        cleanedReply: rawText,
        fileMedia,
        globalConfig: params.globalConfig,
        allCharacters: params.allCharacters,
        members: params.members,
        prevDt,
        now,
        signal: params.signal,
        onUsageRecord: (rec) => {
          collectedUsageRecords.push(rec);
          params.onUsageRecord?.(rec);
        },
      });
    }
    return {
      rawText,
      toolSentAt: finalSentAt,
      ...(fileMedia ? { structuredFileMedia: fileMedia } : {}),
      usageRecords: collectedUsageRecords,
    };
  };

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
      timeFrequency: params.globalConfig.timeFrequency,
      outputLanguage: params.globalConfig.outputLanguage,
      replyLength: params.globalConfig.replyLength,
      lastMessageDateTime: prevDt,
      now,
      members: params.members,
      webSearchEnabled: needWebSearch,
    }
  );

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
    let jsonModeFallback = false;
    let capturedSentAt: MessageDateTime | null = null;
    let capturedFileMedia: ChatFileMedia | undefined;

    for (let round = 0; round < 3; round += 1) {
      const payload: Record<string, unknown> = {
        model: creds.model,
        temperature: creds.temperature,
        messages,
      };
      if (toolsActive && tools.length > 0) {
        payload.tools = tools;
        payload.tool_choice = 'auto';
      } else if (jsonModeFallback && needTimeTool) {
        payload.response_format = { type: 'json_object' };
      }

      const startedAt = Date.now();
      const response = await safeFetch(url, {
        method: 'POST',
        signal: params.signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${creds.apiKey}`,
        },
        body: JSON.stringify(payload),
      });
      const latencyMs = Math.max(1, Date.now() - startedAt);

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        emitUsage('error', undefined, latencyMs);
        if (toolsActive && (response.status === 400 || response.status === 422) && round === 0) {
          toolsActive = false;
          if (needTimeTool) {
            jsonModeFallback = true;
            messages = [
              {
                role: 'system',
                content: `${systemInstruction}\n${STRUCTURED_JSON_TIME_INSTRUCTION}`,
              },
              ...turns,
            ];
          }
          continue;
        }
        if (jsonModeFallback && (response.status === 400 || response.status === 422)) {
          jsonModeFallback = false;
          messages = [{ role: 'system', content: systemInstruction }, ...turns];
          continue;
        }
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
      emitUsage('ok', data, latencyMs);

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

      const structured = parseStructuredJsonReply(
        text,
        params.targetCharacter.name,
        prevDt,
        now
      );
      if (structured) {
        if (structured.sentAt && !capturedSentAt) {
          capturedSentAt = structured.sentAt;
        }
        if (structured.fileMedia && !capturedFileMedia) {
          capturedFileMedia = structured.fileMedia;
        }
      }
      const cleaned = structured
        ? structured.text
        : stripSpeakerPrefix(text, params.targetCharacter.name);
      const hasSearchCall = toolCalls.some((tc) => tc.function?.name === 'web_search');

      if ((cleaned || capturedFileMedia) && !hasSearchCall) {
        return await finalizeCompletion(cleaned, capturedSentAt, capturedFileMedia);
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
      if (cleaned || capturedFileMedia) {
        return await finalizeCompletion(cleaned, capturedSentAt, capturedFileMedia);
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
    let useStructuredSchema = needTimeTool && useNativeSearch;
    let toolsActive = useNativeSearch || useTimeDecl;
    let capturedSentAt: MessageDateTime | null = null;
    let capturedFileMedia: ChatFileMedia | undefined;

    for (let round = 0; round < 3; round += 1) {
      const generationConfig: Record<string, unknown> = {
        temperature: creds.temperature,
      };
      if (useStructuredSchema) {
        generationConfig.responseMimeType = 'application/json';
        generationConfig.responseSchema = GEMINI_STRUCTURED_REPLY_SCHEMA;
      }
      const payload: Record<string, unknown> = {
        systemInstruction: {
          parts: [
            {
              text: useStructuredSchema
                ? `${systemInstruction}\n${STRUCTURED_JSON_TIME_INSTRUCTION}`
                : systemInstruction,
            },
          ],
        },
        generationConfig,
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

      const startedAt = Date.now();
      const response = await safeFetch(url, {
        method: 'POST',
        signal: params.signal,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const latencyMs = Math.max(1, Date.now() - startedAt);
      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        emitUsage('error', undefined, latencyMs);
        if (useStructuredSchema && (response.status === 400 || response.status === 422)) {
          useStructuredSchema = false;
          continue;
        }
        if (toolsActive && (response.status === 400 || response.status === 422) && round === 0) {
          toolsActive = false;
          if (needTimeTool) {
            useStructuredSchema = true;
          }
          continue;
        }
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
      emitUsage('ok', data, latencyMs);

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
      const structured = parseStructuredJsonReply(
        text,
        params.targetCharacter.name,
        prevDt,
        now
      );
      if (structured) {
        if (structured.sentAt && !capturedSentAt) {
          capturedSentAt = structured.sentAt;
        }
        if (structured.fileMedia && !capturedFileMedia) {
          capturedFileMedia = structured.fileMedia;
        }
      }
      const cleaned = structured
        ? structured.text
        : stripSpeakerPrefix(text, params.targetCharacter.name);
      if (cleaned || capturedFileMedia) {
        return await finalizeCompletion(cleaned, capturedSentAt, capturedFileMedia);
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
  let antJsonFallback = false;
  let capturedSentAt: MessageDateTime | null = null;
  let capturedFileMedia: ChatFileMedia | undefined;

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
      system: antJsonFallback
        ? `${systemInstruction}\n${STRUCTURED_JSON_TIME_INSTRUCTION}`
        : systemInstruction,
      messages: antMessages,
    };
    if (activeTools.length > 0) {
      payload.tools = activeTools;
    }

    const startedAt = Date.now();
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
    const latencyMs = Math.max(1, Date.now() - startedAt);
    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      emitUsage('error', undefined, latencyMs);
      if ((response.status === 400 || response.status === 422) && round === 0 && antToolsMode !== 'none') {
        antToolsMode = antToolsMode === 'all' && needTimeTool && needWebSearch ? 'function_only' : 'none';
        if (antToolsMode === 'none' && needTimeTool) {
          antJsonFallback = true;
        }
        continue;
      }
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
    emitUsage('ok', data, latencyMs);

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
    const structured = parseStructuredJsonReply(
      text,
      params.targetCharacter.name,
      prevDt,
      now
    );
    if (structured) {
      if (structured.sentAt && !capturedSentAt) {
        capturedSentAt = structured.sentAt;
      }
      if (structured.fileMedia && !capturedFileMedia) {
        capturedFileMedia = structured.fileMedia;
      }
    }
    const cleaned = structured
      ? structured.text
      : stripSpeakerPrefix(text, params.targetCharacter.name);
    if (cleaned || capturedFileMedia) {
      return await finalizeCompletion(cleaned, capturedSentAt, capturedFileMedia);
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
  rawModel: string,
  onUsageRecord?: (record: AiUsageRecord) => void
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
      onUsageRecord?.(
        buildUsageRecord({
          protocol,
          model,
          characterId: '__test__',
          characterName: 'Connection Test',
          purpose: 'test',
          status: 'error',
          latencyMs,
        })
      );
      return {
        ok: false,
        latencyMs,
        detail: `HTTP ${response.status}${errText ? `: ${errText.slice(0, 100)}` : ''}`,
      };
    }
    const data = await response.json().catch(() => undefined);
    onUsageRecord?.(
      buildUsageRecord({
        protocol,
        model,
        characterId: '__test__',
        characterName: 'Connection Test',
        purpose: 'test',
        status: 'ok',
        rawData: data,
        latencyMs,
      })
    );
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
