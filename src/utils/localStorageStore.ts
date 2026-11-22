import type {
  AiCharacterConfig,
  AiGlobalConfig,
  AppMode,
  CharacterProfile,
  Conversation,
  UiLanguage,
  VoiceMember,
} from '../types/nightcord';
import { DEFAULT_AI_GLOBAL_CONFIG } from './aiClient';

const STORAGE_KEYS = {
  conversations: 'nightcord_conversations_v1',
  activeConversationId: 'nightcord_active_conv_v1',
  aiConversations: 'nightcord_ai_conversations_v1',
  activeAiConversationId: 'nightcord_active_ai_conv_v1',
  aiCharacterConfigs: 'nightcord_ai_char_configs_v1',
  aiGlobalConfig: 'nightcord_ai_global_config_v1',
  characters: 'nightcord_characters_v1',
  activeCharacterId: 'nightcord_active_char_v1',
  members: 'nightcord_members_v1',
  mode: 'nightcord_mode_v1',
  language: 'nightcord_lang_v1',
  onboardingDone: 'nightcord_onboarding_done_v2',
  aiOnboardingDone: 'nightcord_ai_onboarding_done_v1',
} as const;

const DB_NAME = 'nightcord_local_media_v1';
const STORE_NAME = 'blobs';

function openMediaDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

const memoryBlobFallback = new Map<string, Blob>();

export async function saveLocalMediaBlob(mediaId: string, blob: Blob): Promise<void> {
  memoryBlobFallback.set(mediaId, blob);
  const db = await openMediaDb();
  if (!db) {
    return;
  }
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(blob, mediaId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function loadLocalMediaBlob(mediaId: string): Promise<Blob | null> {
  const cached = memoryBlobFallback.get(mediaId);
  if (cached) {
    return cached;
  }
  const db = await openMediaDb();
  if (!db) {
    return null;
  }
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(mediaId);
      req.onsuccess = () => {
        const result = req.result;
        if (result instanceof Blob) {
          memoryBlobFallback.set(mediaId, result);
          resolve(result);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
  }
}

export function loadSavedConversations(): Conversation[] | null {
  const data = readJson<Conversation[]>(STORAGE_KEYS.conversations);
  return Array.isArray(data) && data.length > 0 ? data : null;
}

export function saveConversations(conversations: Conversation[]): void {
  writeJson(STORAGE_KEYS.conversations, conversations);
}

export function loadActiveConversationId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.activeConversationId);
  } catch {
    return null;
  }
}

export function saveActiveConversationId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.activeConversationId, id);
  } catch {
  }
}

export function loadSavedCharacters(): CharacterProfile[] | null {
  const data = readJson<CharacterProfile[]>(STORAGE_KEYS.characters);
  return Array.isArray(data) && data.length > 0 ? data : null;
}

export function saveCharacters(characters: CharacterProfile[]): void {
  writeJson(STORAGE_KEYS.characters, characters);
}

export function loadActiveCharacterId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.activeCharacterId);
  } catch {
    return null;
  }
}

export function saveActiveCharacterId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.activeCharacterId, id);
  } catch {
  }
}

export function loadSavedMode(): AppMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.mode);
    return raw === 'studio' ? 'studio' : 'immersive';
  } catch {
    return 'immersive';
  }
}

export function saveMode(mode: AppMode): void {
  try {
    localStorage.setItem(STORAGE_KEYS.mode, mode);
  } catch {
  }
}

export function isOnboardingCompleted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.onboardingDone) === '1';
  } catch {
    return false;
  }
}

export function markOnboardingCompleted(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.onboardingDone, '1');
  } catch {
  }
}

export function isAiOnboardingCompleted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.aiOnboardingDone) === '1';
  } catch {
    return false;
  }
}

export function markAiOnboardingCompleted(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.aiOnboardingDone, '1');
  } catch {
  }
}

export function loadSavedLanguage(): UiLanguage {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.language);
    if (raw === 'zh' || raw === 'en' || raw === 'ja') {
      return raw;
    }
    return 'ja';
  } catch {
    return 'ja';
  }
}

export function saveLanguage(lang: UiLanguage): void {
  try {
    localStorage.setItem(STORAGE_KEYS.language, lang);
  } catch {
  }
}

export function loadSavedMembers(): VoiceMember[] | null {
  const data = readJson<VoiceMember[]>(STORAGE_KEYS.members);
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }
  return data.map((member) => {
    const status =
      member.status === 'online' || member.status === 'voice' || member.status === 'offline'
        ? member.status
        : member.online === false
          ? 'offline'
          : 'voice';
    return {
      ...member,
      status,
      online: status !== 'offline',
    };
  });
}

export function saveMembers(members: VoiceMember[]): void {
  writeJson(STORAGE_KEYS.members, members);
}

export function loadSavedAiConversations(): Conversation[] | null {
  const data = readJson<Conversation[]>(STORAGE_KEYS.aiConversations);
  return Array.isArray(data) && data.length > 0 ? data : null;
}

export function saveAiConversations(conversations: Conversation[]): void {
  writeJson(STORAGE_KEYS.aiConversations, conversations);
}

export function loadActiveAiConversationId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.activeAiConversationId);
  } catch {
    return null;
  }
}

export function saveActiveAiConversationId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.activeAiConversationId, id);
  } catch {
  }
}

export function loadAiCharacterConfigs(): Record<string, AiCharacterConfig> {
  const data = readJson<Record<string, AiCharacterConfig>>(STORAGE_KEYS.aiCharacterConfigs);
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return {};
  }
  return data;
}

export function saveAiCharacterConfigs(configs: Record<string, AiCharacterConfig>): void {
  writeJson(STORAGE_KEYS.aiCharacterConfigs, configs);
}

export function loadAiGlobalConfig(): AiGlobalConfig {
  const data = readJson<Partial<AiGlobalConfig>>(STORAGE_KEYS.aiGlobalConfig);
  if (!data || typeof data !== 'object') {
    return { ...DEFAULT_AI_GLOBAL_CONFIG };
  }
  return {
    ...DEFAULT_AI_GLOBAL_CONFIG,
    ...data,
    aiFollowUpProbability:
      typeof data.aiFollowUpProbability === 'number' && Number.isFinite(data.aiFollowUpProbability)
        ? Math.min(100, Math.max(0, data.aiFollowUpProbability))
        : DEFAULT_AI_GLOBAL_CONFIG.aiFollowUpProbability,
    userDisplayName:
      typeof data.userDisplayName === 'string' && data.userDisplayName.trim()
        ? data.userDisplayName
        : DEFAULT_AI_GLOBAL_CONFIG.userDisplayName,
  };
}

export function saveAiGlobalConfig(config: AiGlobalConfig): void {
  writeJson(STORAGE_KEYS.aiGlobalConfig, config);
}

export async function clearLocalCacheData(): Promise<void> {
  memoryBlobFallback.clear();
  try {
    localStorage.removeItem(STORAGE_KEYS.conversations);
    localStorage.removeItem(STORAGE_KEYS.activeConversationId);
    localStorage.removeItem(STORAGE_KEYS.aiConversations);
    localStorage.removeItem(STORAGE_KEYS.activeAiConversationId);
    localStorage.removeItem(STORAGE_KEYS.aiCharacterConfigs);
    localStorage.removeItem(STORAGE_KEYS.aiGlobalConfig);
    localStorage.removeItem(STORAGE_KEYS.characters);
    localStorage.removeItem(STORAGE_KEYS.activeCharacterId);
    localStorage.removeItem(STORAGE_KEYS.members);
    localStorage.removeItem(STORAGE_KEYS.onboardingDone);
    localStorage.removeItem(STORAGE_KEYS.aiOnboardingDone);
  } catch {
  }
  const db = await openMediaDb();
  if (!db) {
    return;
  }
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const commaIndex = result.indexOf(',');
      resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
    };
    reader.onerror = () => reject(new Error('blob-read-failed'));
    reader.readAsDataURL(blob);
  });
}

export function base64ToBlob(dataBase64: string, mimeType: string): Blob {
  const binary = atob(dataBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType || 'application/octet-stream' });
}
