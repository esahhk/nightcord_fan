import type {
  AiCharacterConfig,
  AiGlobalConfig,
  AiProtocol,
  AiTimeMode,
  CharacterProfile,
  ChatFileMedia,
  ChatMessage,
  MessageDateTime,
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
};

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
  const protocol: AiProtocol =
    existing.protocol === 'deepseek' ||
    existing.protocol === 'gemini' ||
    existing.protocol === 'anthropic'
      ? existing.protocol
      : 'openai';
  return {
    protocol,
    baseUrl: existing.baseUrl || AI_PROTOCOL_METAS[protocol].defaultBaseUrl,
    apiKey: existing.apiKey || '',
    model: existing.model || AI_PROTOCOL_METAS[protocol].defaultModel,
    systemPrompt: existing.systemPrompt || '',
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
} {
  const ownKey = charConfig.apiKey.trim();
  const globalKey = globalConfig.useGlobalApi ? globalConfig.apiKey.trim() : '';

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

export function resolveAiResponder(
  rawText: string,
  characters: CharacterProfile[],
  configs: Record<string, AiCharacterConfig>,
  globalConfig: AiGlobalConfig,
  randomFn: () => number = Math.random,
  members?: VoiceMember[]
): AiResponderResolution {
  const mentioned = extractMentionedCharacters(rawText, characters);
  if (mentioned.length > 0) {
    const firstMentioned = mentioned[0];
    if (!isMemberOnlineForAi(firstMentioned.id, members)) {
      return { kind: 'mentioned_offline', character: firstMentioned };
    }
    const cred = resolveEffectiveAiCredentials(
      getAiCharacterConfig(configs, firstMentioned.id),
      globalConfig
    );
    if (!cred.ready) {
      return { kind: 'mentioned_missing_key', character: firstMentioned };
    }
    return { kind: 'selected', character: firstMentioned };
  }

  const eligible = getEligibleAiCharacters(characters, configs, globalConfig, members);
  if (eligible.length === 0) {
    const configuredAnyStatus = getEligibleAiCharacters(characters, configs, globalConfig);
    if (configuredAnyStatus.length > 0) {
      return { kind: 'none_online' };
    }
    return { kind: 'none_configured' };
  }
  const idx = Math.min(eligible.length - 1, Math.max(0, Math.floor(randomFn() * eligible.length)));
  return { kind: 'selected', character: eligible[idx] };
}

export function pickAiFollowUpResponder(
  firstSpeakerId: string,
  characters: CharacterProfile[],
  configs: Record<string, AiCharacterConfig>,
  globalConfig: AiGlobalConfig,
  randomFn: () => number = Math.random,
  members?: VoiceMember[]
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
  const idx = Math.min(others.length - 1, Math.max(0, Math.floor(randomFn() * others.length)));
  return others[idx];
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

export interface BuildAiPayloadOptions {
  userDisplayName?: string;
  userPersona?: string;
  worldviewPrompt?: string;
  timeMode?: AiTimeMode;
  lastMessageDateTime?: MessageDateTime | null;
  now?: Date;
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
  const now = opts.now ?? new Date();
  const lastDt = opts.lastMessageDateTime ?? getLastMessageDateTime(history, now);

  const peerNames = otherCharacters
    .filter((c) => c.id !== targetCharacter.id)
    .map((c) => c.name)
    .join(', ');

  const rules: string[] = [
    `You are roleplaying as "${targetCharacter.name}" in a Nightcord-style group chat.`,
    peerNames ? `Other characters in this room: ${peerNames}.` : '',
    `The user speaks as "${userDisplayName}".`,
    userPersona ? `User "${userDisplayName}" profile/persona: ${userPersona}` : '',
    worldviewPrompt ? `Shared worldview / setting:\n${worldviewPrompt}` : '',
    `Reply directly in character as "${targetCharacter.name}" only. Do NOT prefix your reply with "${targetCharacter.name}:" or "[${targetCharacter.name}]:". Keep responses natural for a chat message.`,
    `If you want to send a file (such as an audio demo .mp3, rough track .mp4, image .jpg, or lyrics .txt — for example when asked to share a demo or file), append a single tag at the very end of your reply: [[FILE:filename.ext|sizeLabel]] (e.g. [[FILE:nightcord_demo_01.mp3|4MB MP3]] or [[FILE:lyrics_draft.txt|2KB テキスト]]). Only attach a file when it genuinely fits the conversation.`,
  ];

  if (timeMode === 'ai_inferred') {
    const prevLabel = lastDt
      ? formatDateTimeBadge(lastDt)
      : formatDateTimeBadge(dateToMessageDateTime(now));
    rules.push(
      `At the very beginning of your reply, output a timestamp tag [[TIME:YYYY-MM-DD HH:mm]] (24-hour 00:00-23:59) indicating when you send this message. It MUST NOT be earlier than the previous message (${prevLabel}).`
    );
  }

  const baseRules = rules.filter(Boolean).join('\n');

  const combinedSystem = systemPrompt.trim()
    ? `${systemPrompt.trim()}\n\n${baseRules}`
    : baseRules;

  const recent = history.slice(-30);
  const rawTurns: { role: 'user' | 'assistant'; content: string }[] = [];
  for (const msg of recent) {
    const fileLabel = msg.attachments?.length
      ? `[File: ${msg.attachments.map((a) => a.filename).join(', ')}]`
      : msg.imageMedia
        ? `[Image: ${msg.imageMedia.filename}]`
        : msg.fileMedia
          ? `[File: ${msg.fileMedia.filename} (${msg.fileMedia.sizeLabel})]`
          : msg.voiceMedia
            ? `[Voice: ${msg.voiceMedia.filename}]`
            : '';
    const msgText = msg.text?.trim() || '';
    const body = msgText && fileLabel ? `${msgText} ${fileLabel}` : msgText || fileLabel;
    if (!body) {
      continue;
    }
    const timeTag =
      timeMode === 'ai_inferred' && msg.sentAt ? `(${formatDateTimeBadge(msg.sentAt)}) ` : '';
    if (msg.memberId === targetCharacter.id) {
      rawTurns.push({ role: 'assistant', content: `${timeTag}${body}` });
    } else {
      rawTurns.push({ role: 'user', content: `[${msg.username}]${timeTag ? ` ${timeTag.trim()}` : ''}: ${body}` });
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

  const fullMatch = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})\s+(\d{1,2}):(\d{2})$/.exec(cleaned);
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

  const timeOnlyMatch = /^(\d{1,2}):(\d{2})$/.exec(cleaned);
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

  const timePattern = /\[\[TIME:([^\]]+)\]\]/i;
  const timeMatch = timePattern.exec(working);
  if (timeMatch) {
    inferredSentAt = parseAiDateTimeTag(timeMatch[1], prevDt, now);
    working = working.replace(timePattern, '').trim();
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
    const msg = err instanceof Error ? err.message : 'Network error';
    throw new Error(`CORS / Network error: ${msg}`);
  }
}

export async function requestAiCompletion(params: {
  targetCharacter: CharacterProfile;
  charConfig: AiCharacterConfig;
  globalConfig: AiGlobalConfig;
  history: ChatMessage[];
  allCharacters: CharacterProfile[];
}): Promise<string> {
  const creds = resolveEffectiveAiCredentials(params.charConfig, params.globalConfig);
  if (!creds.ready) {
    throw new Error('NO_API_KEY');
  }

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
    }
  );

  const { url } = normalizeAiEndpoint(creds.protocol, creds.baseUrl, creds.model, creds.apiKey);

  if (creds.protocol === 'openai' || creds.protocol === 'deepseek') {
    const response = await safeFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${creds.apiKey}`,
      },
      body: JSON.stringify({
        model: creds.model,
        messages: [{ role: 'system', content: systemInstruction }, ...turns],
      }),
    });
    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status}${errText ? `: ${errText.slice(0, 140)}` : ''}`);
    }
    const data = (await response.json()) as {
      choices?: { message?: { content?: string | { text?: string }[] } }[];
    };
    const rawContent = data.choices?.[0]?.message?.content;
    const text =
      typeof rawContent === 'string'
        ? rawContent
        : Array.isArray(rawContent)
          ? rawContent.map((part) => part.text ?? '').join('')
          : '';
    const cleaned = stripSpeakerPrefix(text, params.targetCharacter.name);
    if (!cleaned) {
      throw new Error('EMPTY_RESPONSE');
    }
    return cleaned;
  }

  if (creds.protocol === 'gemini') {
    const contents = turns.map((turn) => ({
      role: turn.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: turn.content }],
    }));
    const response = await safeFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        contents,
      }),
    });
    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status}${errText ? `: ${errText.slice(0, 140)}` : ''}`);
    }
    const data = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const parts = data.candidates?.[0]?.content?.parts ?? [];
    const text = parts.map((p) => p.text ?? '').join('');
    const cleaned = stripSpeakerPrefix(text, params.targetCharacter.name);
    if (!cleaned) {
      throw new Error('EMPTY_RESPONSE');
    }
    return cleaned;
  }

  const response = await safeFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': creds.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: creds.model,
      max_tokens: 1024,
      system: systemInstruction,
      messages: turns.map((turn) => ({
        role: turn.role,
        content: turn.content,
      })),
    }),
  });
  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status}${errText ? `: ${errText.slice(0, 140)}` : ''}`);
  }
  const data = (await response.json()) as {
    content?: { type?: string; text?: string }[];
  };
  const text = (data.content ?? [])
    .filter((block) => block.type === 'text' || typeof block.text === 'string')
    .map((block) => block.text ?? '')
    .join('');
  const cleaned = stripSpeakerPrefix(text, params.targetCharacter.name);
  if (!cleaned) {
    throw new Error('EMPTY_RESPONSE');
  }
  return cleaned;
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

export function editMessageText(
  messages: ChatMessage[],
  messageId: string,
  nextText: string
): ChatMessage[] {
  const trimmed = nextText.trim();
  if (!trimmed) {
    return messages;
  }
  return messages.map((msg) => (msg.id === messageId ? { ...msg, text: trimmed } : msg));
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
