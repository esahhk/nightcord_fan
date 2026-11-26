import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type {
  AiCharacterConfig,
  AiGlobalConfig,
  AiOutputLanguage,
  AiProtocol,
  AiReplyLength,
  AiTimeFrequency,
  AiUsageRecord,
  AvatarType,
  CharacterProfile,
  UiLanguage,
  VoiceMember,
} from '../types/nightcord';
import {
  AI_PROTOCOL_METAS,
  clampAiTemperature,
  fetchAiModels,
  getAiCharacterConfig,
  getEligibleAiCharacters,
  getNightcordCharacterPresetPrompt,
  isMemberOnlineForAi,
  resolveEffectiveAiCredentials,
  testAiConnection,
} from '../utils/aiClient';
import { getUiText } from '../utils/i18n';
import { saveLocalMediaBlob } from '../utils/localStorageStore';
import { CharacterAvatar } from './LocalMedia';

const USER_PRESET_AVATARS: AvatarType[] = ['k', 'k-pink', 'yuki', 'enanan', 'amia'];

type SettingsTab = 'profile' | 'chat' | 'api';

interface AiGlobalSettingsModalProps {
  lang: UiLanguage;
  open: boolean;
  globalConfig: AiGlobalConfig;
  characters: CharacterProfile[];
  members?: VoiceMember[];
  characterConfigs: Record<string, AiCharacterConfig>;
  onClose: () => void;
  onExportAiTranscript?: () => void;
  onUsageRecord?: (record: AiUsageRecord) => void;
  onOpenUsageModal?: () => void;
  onSave: (
    nextGlobal: AiGlobalConfig,
    nextCharacterConfigs: Record<string, AiCharacterConfig>
  ) => void;
}

export function AiGlobalSettingsModal({
  lang,
  open,
  globalConfig,
  characters,
  members,
  characterConfigs,
  onClose,
  onExportAiTranscript,
  onUsageRecord,
  onOpenUsageModal,
  onSave,
}: AiGlobalSettingsModalProps) {
  const t = getUiText(lang);
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [draftGlobal, setDraftGlobal] = useState<AiGlobalConfig>(globalConfig);
  const [draftCharConfigs, setDraftCharConfigs] = useState<Record<string, AiCharacterConfig>>(
    characterConfigs
  );
  const [selectedCharId, setSelectedCharId] = useState<string>(characters[0]?.id ?? '');
  const [showGlobalKey, setShowGlobalKey] = useState(false);
  const [fetchedModels, setFetchedModels] = useState<string[]>([]);
  const [fetchingModels, setFetchingModels] = useState(false);
  const [fetchStatus, setFetchStatus] = useState<string | null>(null);
  const [testingGlobalConn, setTestingGlobalConn] = useState(false);
  const [globalConnStatus, setGlobalConnStatus] = useState<{ ok: boolean; text: string } | null>(
    null
  );
  const [showCharKey, setShowCharKey] = useState(false);
  const [charFetchedModels, setCharFetchedModels] = useState<string[]>([]);
  const [charFetchingModels, setCharFetchingModels] = useState(false);
  const [charFetchStatus, setCharFetchStatus] = useState<string | null>(null);
  const [testingCharConn, setTestingCharConn] = useState(false);
  const [charConnStatus, setCharConnStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const avatarFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    setDraftGlobal({ ...globalConfig });
    const cloned: Record<string, AiCharacterConfig> = {};
    for (const char of characters) {
      cloned[char.id] = { ...getAiCharacterConfig(characterConfigs, char.id) };
    }
    setDraftCharConfigs(cloned);
    setSelectedCharId((prev) =>
      characters.some((c) => c.id === prev) ? prev : characters[0]?.id ?? ''
    );
    setFetchedModels([]);
    setFetchStatus(null);
    setGlobalConnStatus(null);
    setShowGlobalKey(false);
    setCharFetchedModels([]);
    setCharFetchStatus(null);
    setCharConnStatus(null);
    setShowCharKey(false);
  }, [open, globalConfig, characterConfigs, characters]);

  if (!open) {
    return null;
  }

  const selectedChar = characters.find((c) => c.id === selectedCharId) ?? characters[0];
  const selectedCharCfg = selectedChar
    ? getAiCharacterConfig(draftCharConfigs, selectedChar.id)
    : null;

  const readyCharacters = getEligibleAiCharacters(
    characters,
    draftCharConfigs,
    draftGlobal,
    members
  );

  const handleGlobalProtocolChange = (nextProtocol: AiProtocol) => {
    const prevDefaultUrl = AI_PROTOCOL_METAS[draftGlobal.protocol].defaultBaseUrl;
    const prevDefaultModel = AI_PROTOCOL_METAS[draftGlobal.protocol].defaultModel;
    setDraftGlobal((prev) => ({
      ...prev,
      protocol: nextProtocol,
      baseUrl:
        !prev.baseUrl.trim() || prev.baseUrl.trim() === prevDefaultUrl
          ? AI_PROTOCOL_METAS[nextProtocol].defaultBaseUrl
          : prev.baseUrl,
      model:
        !prev.model.trim() || prev.model.trim() === prevDefaultModel
          ? AI_PROTOCOL_METAS[nextProtocol].defaultModel
          : prev.model,
    }));
    setFetchedModels([]);
    setFetchStatus(null);
  };

  const handleFetchGlobalModels = async () => {
    if (!draftGlobal.apiKey.trim()) {
      setFetchStatus(t.aiFetchModelsFail);
      return;
    }
    setFetchingModels(true);
    setFetchStatus(null);
    try {
      const list = await fetchAiModels(
        draftGlobal.protocol,
        draftGlobal.baseUrl,
        draftGlobal.apiKey
      );
      setFetchedModels(list);
      if (list.length > 0 && !list.includes(draftGlobal.model)) {
        setDraftGlobal((prev) => ({ ...prev, model: list[0] }));
      }
      setFetchStatus(t.aiFetchModelsOk(list.length));
    } catch {
      setFetchStatus(t.aiFetchModelsFail);
    } finally {
      setFetchingModels(false);
    }
  };

  const updateSelectedCharConfig = (patch: Partial<AiCharacterConfig>) => {
    if (!selectedChar) {
      return;
    }
    setDraftCharConfigs((prev) => ({
      ...prev,
      [selectedChar.id]: {
        ...getAiCharacterConfig(prev, selectedChar.id),
        ...patch,
      },
    }));
  };

  const handleCharProtocolChange = (nextProtocol: AiProtocol) => {
    if (!selectedCharCfg) {
      return;
    }
    const prevDefaultUrl = AI_PROTOCOL_METAS[selectedCharCfg.protocol].defaultBaseUrl;
    const prevDefaultModel = AI_PROTOCOL_METAS[selectedCharCfg.protocol].defaultModel;
    const nextBaseUrl =
      !selectedCharCfg.baseUrl.trim() || selectedCharCfg.baseUrl.trim() === prevDefaultUrl
        ? AI_PROTOCOL_METAS[nextProtocol].defaultBaseUrl
        : selectedCharCfg.baseUrl;
    const nextModel =
      !selectedCharCfg.model.trim() || selectedCharCfg.model.trim() === prevDefaultModel
        ? AI_PROTOCOL_METAS[nextProtocol].defaultModel
        : selectedCharCfg.model;
    updateSelectedCharConfig({
      protocol: nextProtocol,
      baseUrl: nextBaseUrl,
      model: nextModel,
    });
    setCharFetchedModels([]);
    setCharFetchStatus(null);
  };

  const handleTestGlobalConn = async () => {
    setTestingGlobalConn(true);
    setGlobalConnStatus(null);
    try {
      const res = await testAiConnection(
        draftGlobal.protocol,
        draftGlobal.baseUrl,
        draftGlobal.apiKey,
        draftGlobal.model,
        onUsageRecord
      );
      if (res.ok) {
        setGlobalConnStatus({ ok: true, text: t.aiTestConnOk(res.latencyMs, res.detail) });
      } else {
        setGlobalConnStatus({
          ok: false,
          text: t.aiTestConnFail(res.detail === 'NO_API_KEY' ? t.aiUnconfiguredBadge : res.detail),
        });
      }
    } finally {
      setTestingGlobalConn(false);
    }
  };

  const handleTestCharConn = async () => {
    if (!selectedCharCfg) {
      return;
    }
    const ownKey = selectedCharCfg.apiKey.trim();
    const effectiveKey = ownKey || (draftGlobal.useGlobalApi ? draftGlobal.apiKey.trim() : '');
    const testProtocol = ownKey ? selectedCharCfg.protocol : draftGlobal.useGlobalApi ? draftGlobal.protocol : selectedCharCfg.protocol;
    const testUrl = ownKey ? selectedCharCfg.baseUrl : draftGlobal.useGlobalApi ? draftGlobal.baseUrl : selectedCharCfg.baseUrl;
    const testModel = ownKey ? selectedCharCfg.model : draftGlobal.useGlobalApi ? draftGlobal.model : selectedCharCfg.model;

    setTestingCharConn(true);
    setCharConnStatus(null);
    try {
      const res = await testAiConnection(
        testProtocol,
        testUrl,
        effectiveKey,
        testModel,
        onUsageRecord
      );
      if (res.ok) {
        setCharConnStatus({ ok: true, text: t.aiTestConnOk(res.latencyMs, res.detail) });
      } else {
        setCharConnStatus({
          ok: false,
          text: t.aiTestConnFail(res.detail === 'NO_API_KEY' ? t.aiUnconfiguredBadge : res.detail),
        });
      }
    } finally {
      setTestingCharConn(false);
    }
  };

  const handleFetchCharModels = async () => {
    if (!selectedCharCfg) {
      return;
    }
    const effectiveKey =
      selectedCharCfg.apiKey.trim() ||
      (draftGlobal.useGlobalApi ? draftGlobal.apiKey.trim() : '');
    if (!effectiveKey) {
      setCharFetchStatus(t.aiFetchModelsFail);
      return;
    }
    setCharFetchingModels(true);
    setCharFetchStatus(null);
    try {
      const list = await fetchAiModels(
        selectedCharCfg.protocol,
        selectedCharCfg.baseUrl,
        effectiveKey
      );
      setCharFetchedModels(list);
      if (list.length > 0 && !list.includes(selectedCharCfg.model)) {
        updateSelectedCharConfig({ model: list[0] });
      }
      setCharFetchStatus(t.aiFetchModelsOk(list.length));
    } catch {
      setCharFetchStatus(t.aiFetchModelsFail);
    } finally {
      setCharFetchingModels(false);
    }
  };

  const handleUserAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }
    const mediaId = `ai-user-avatar-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    await saveLocalMediaBlob(mediaId, file);
    setDraftGlobal((prev) => ({
      ...prev,
      userAvatarMediaId: mediaId,
    }));
  };

  const globalModelChoices = Array.from(
    new Set([
      ...fetchedModels,
      ...AI_PROTOCOL_METAS[draftGlobal.protocol].presetModels,
      ...(draftGlobal.model.trim() ? [draftGlobal.model.trim()] : []),
    ])
  );

  const charModelChoices = selectedCharCfg
    ? Array.from(
        new Set([
          ...charFetchedModels,
          ...AI_PROTOCOL_METAS[selectedCharCfg.protocol].presetModels,
          ...(selectedCharCfg.model.trim() ? [selectedCharCfg.model.trim()] : []),
        ])
      )
    : [];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanedCharConfigs: Record<string, AiCharacterConfig> = {};
    for (const [charId, cfg] of Object.entries(draftCharConfigs)) {
      cleanedCharConfigs[charId] = {
        ...cfg,
        baseUrl: cfg.baseUrl.trim() || AI_PROTOCOL_METAS[cfg.protocol].defaultBaseUrl,
        apiKey: cfg.apiKey.trim(),
        model: cfg.model.trim() || AI_PROTOCOL_METAS[cfg.protocol].defaultModel,
      };
    }
    onSave(
      {
        ...draftGlobal,
        baseUrl:
          draftGlobal.baseUrl.trim() || AI_PROTOCOL_METAS[draftGlobal.protocol].defaultBaseUrl,
        apiKey: draftGlobal.apiKey.trim(),
        model: draftGlobal.model.trim() || AI_PROTOCOL_METAS[draftGlobal.protocol].defaultModel,
        userDisplayName: draftGlobal.userDisplayName.trim() || 'あなた',
        userPersona: draftGlobal.userPersona.trim(),
        worldviewPrompt: draftGlobal.worldviewPrompt.trim(),
      },
      cleanedCharConfigs
    );
    onClose();
  };

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'profile', label: t.aiGlobalTabProfile },
    { id: 'chat', label: t.aiGlobalTabChat },
    { id: 'api', label: t.aiGlobalTabApi },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.aiGlobalModalTitle}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-3 sm:p-4"
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="nc-modal-enter flex max-h-[92dvh] w-full max-w-[560px] flex-col overflow-hidden rounded-[12px] border border-[#524468] bg-[#2E243D] shadow-[0_24px_60px_rgba(0,0,0,0.68)]"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#241C30] bg-[#211A2C] px-4 py-3 sm:px-5 sm:py-3.5">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
              <h2 className="text-[15px] font-bold text-[#EFEBF5]">{t.aiGlobalModalTitle}</h2>
              <span className="text-[11px] text-[#64D2E6] tabular-nums">
                {t.aiConfiguredCharsCount(readyCharacters.length, characters.length)}
              </span>
            </div>
            <p className="mt-0.5 text-[11.5px] leading-[1.45] text-[#9A90A8]">
              {t.aiGlobalModalSub}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 pt-1" aria-hidden="true">
            <span className="h-[9px] w-[9px] rounded-full bg-[#64D2E6]" />
            <span className="h-[9px] w-[9px] rounded-full bg-[#F6CE71]" />
            <span className="h-[9px] w-[9px] rounded-full bg-[#EB7F97]" />
          </div>
        </div>

        <div className="grid shrink-0 grid-cols-3 border-b border-[#241C30] bg-[#261D33] px-3 sm:px-5">
          {tabs.map((tab) => {
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                data-action={`global-ai-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`relative cursor-pointer px-2 py-2.5 text-center text-[12px] font-medium transition-colors ${
                  selected ? 'font-semibold text-white' : 'text-[#9A90A8] hover:text-[#DCD7E5]'
                }`}
              >
                <span className="block truncate">{tab.label}</span>
                {selected && (
                  <span className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-[#64D2E6]" />
                )}
              </button>
            );
          })}
        </div>

        <div className="nc-scroll min-h-0 flex-1 space-y-4 p-4 sm:p-5">
          {activeTab === 'profile' && (
            <>
              <div className="space-y-3">
                <div className="text-[12.5px] font-semibold text-[#EFEBF5]">
                  {t.aiUserIdentityTitle}
                </div>
                <div className="flex flex-wrap items-start gap-3">
                  <CharacterAvatar
                    avatarType={draftGlobal.userAvatar || 'k'}
                    customAvatarMediaId={draftGlobal.userAvatarMediaId}
                    size={42}
                  />
                  <div className="min-w-0 flex-1 space-y-2">
                    <input
                      type="text"
                      data-action="global-ai-user-name"
                      value={draftGlobal.userDisplayName}
                      onChange={(e) =>
                        setDraftGlobal((prev) => ({ ...prev, userDisplayName: e.target.value }))
                      }
                      placeholder={t.aiUserNamePlaceholder}
                      className="h-[34px] w-full rounded-[6px] border border-[#493B62] bg-[#241C32] px-2.5 text-[12.5px] text-[#EFEBF5] placeholder-[#7C7191] outline-none focus:border-[#64D2E6]"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        ref={avatarFileInputRef}
                        type="file"
                        accept="image/*"
                        data-action="global-ai-user-avatar-input"
                        onChange={handleUserAvatarUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        data-action="global-ai-user-avatar-upload"
                        onClick={() => avatarFileInputRef.current?.click()}
                        className="cursor-pointer rounded-[6px] border border-[#524468] bg-[#332844] px-2.5 py-1 text-[11px] font-medium text-[#EFEBF5] transition-colors hover:bg-[#3F3352]"
                      >
                        {t.aiUploadAvatarBtn}
                      </button>
                      {draftGlobal.userAvatarMediaId && (
                        <button
                          type="button"
                          data-action="global-ai-user-avatar-reset"
                          onClick={() =>
                            setDraftGlobal((prev) => ({ ...prev, userAvatarMediaId: undefined }))
                          }
                          className="cursor-pointer text-[11px] text-[#9A90A8] hover:text-white"
                        >
                          {t.aiResetAvatarBtn}
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-[11px] text-[#9A90A8]">{t.aiUserAvatarPresetLabel}:</span>
                      {USER_PRESET_AVATARS.map((preset) => {
                        const selected =
                          !draftGlobal.userAvatarMediaId && draftGlobal.userAvatar === preset;
                        return (
                          <button
                            key={preset}
                            type="button"
                            data-action={`global-ai-avatar-preset-${preset}`}
                            onClick={() =>
                              setDraftGlobal((prev) => ({
                                ...prev,
                                userAvatar: preset,
                                userAvatarMediaId: undefined,
                              }))
                            }
                            className={`cursor-pointer rounded-full p-0.5 transition-all ${
                              selected
                                ? 'ring-2 ring-[#64D2E6] ring-offset-1 ring-offset-[#2E243D]'
                                : 'opacity-70 hover:opacity-100'
                            }`}
                          >
                            <CharacterAvatar avatarType={preset} size={22} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="block text-[11.5px] font-medium text-[#DCD7E5]">
                    {t.aiUserPersonaLabel}
                  </label>
                  <textarea
                    data-action="global-ai-user-persona"
                    value={draftGlobal.userPersona}
                    onChange={(e) =>
                      setDraftGlobal((prev) => ({ ...prev, userPersona: e.target.value }))
                    }
                    rows={3}
                    placeholder={t.aiUserPersonaPlaceholder}
                    className="nc-scroll w-full resize-y rounded-[6px] border border-[#493B62] bg-[#241C32] px-3 py-2 text-[12px] leading-[1.5] text-[#EFEBF5] placeholder-[#7C7191] outline-none focus:border-[#64D2E6]"
                  />
                </div>
              </div>

              <div className="space-y-1.5 border-t border-[#3F3352] pt-4">
                <label className="block text-[12.5px] font-semibold text-[#EFEBF5]">
                  {t.aiWorldviewTitle}
                </label>
                <textarea
                  data-action="global-ai-worldview"
                  value={draftGlobal.worldviewPrompt}
                  onChange={(e) =>
                    setDraftGlobal((prev) => ({ ...prev, worldviewPrompt: e.target.value }))
                  }
                  rows={4}
                  placeholder={t.aiWorldviewPlaceholder}
                  className="nc-scroll w-full resize-y rounded-[6px] border border-[#493B62] bg-[#241C32] px-3 py-2 text-[12px] leading-[1.5] text-[#EFEBF5] placeholder-[#7C7191] outline-none focus:border-[#64D2E6]"
                />
              </div>
            </>
          )}

          {activeTab === 'chat' && (
            <>
              <div className="space-y-2.5">
                <div className="text-[12.5px] font-semibold text-[#EFEBF5]">
                  {t.aiTimeModeTitle}
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    data-action="global-ai-time-realtime"
                    onClick={() => setDraftGlobal((prev) => ({ ...prev, timeMode: 'realtime' }))}
                    className={`flex cursor-pointer flex-col items-start rounded-[7px] border px-3 py-2.5 text-left transition-colors ${
                      draftGlobal.timeMode === 'realtime'
                        ? 'border-[#64D2E6]/75 bg-[#3B2F52] text-white'
                        : 'border-[#453859] bg-[#241C32] text-[#DCD7E5] hover:bg-[#332844]'
                    }`}
                  >
                    <span className="text-[12px] font-semibold">{t.aiTimeModeRealtime}</span>
                    <span className="mt-0.5 text-[11px] leading-[1.4] text-[#9A90A8]">
                      {t.aiTimeModeRealtimeSub}
                    </span>
                  </button>
                  <button
                    type="button"
                    data-action="global-ai-time-inferred"
                    onClick={() =>
                      setDraftGlobal((prev) => ({ ...prev, timeMode: 'ai_inferred' }))
                    }
                    className={`flex cursor-pointer flex-col items-start rounded-[7px] border px-3 py-2.5 text-left transition-colors ${
                      draftGlobal.timeMode === 'ai_inferred'
                        ? 'border-[#64D2E6]/75 bg-[#3B2F52] text-white'
                        : 'border-[#453859] bg-[#241C32] text-[#DCD7E5] hover:bg-[#332844]'
                    }`}
                  >
                    <span className="text-[12px] font-semibold">{t.aiTimeModeInferred}</span>
                    <span className="mt-0.5 text-[11px] leading-[1.4] text-[#9A90A8]">
                      {t.aiTimeModeInferredSub}
                    </span>
                  </button>
                </div>

                {draftGlobal.timeMode === 'ai_inferred' && (
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[11.5px] font-medium text-[#DCD7E5]">
                      {t.aiTimeFrequencyLabel}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-5">
                      {(
                        [
                          { id: 'high', label: t.aiTimeFreqHigh },
                          { id: 'somewhat_high', label: t.aiTimeFreqSomewhatHigh },
                          { id: 'balanced', label: t.aiTimeFreqBalanced },
                          { id: 'somewhat_low', label: t.aiTimeFreqSomewhatLow },
                          { id: 'low', label: t.aiTimeFreqLow },
                        ] as { id: AiTimeFrequency; label: string }[]
                      ).map((freq) => (
                        <button
                          key={freq.id}
                          type="button"
                          data-action={`global-ai-freq-${freq.id}`}
                          onClick={() =>
                            setDraftGlobal((prev) => ({ ...prev, timeFrequency: freq.id }))
                          }
                          className={`cursor-pointer rounded-[6px] border px-1.5 py-1.5 text-[11px] font-medium transition-colors ${
                            draftGlobal.timeFrequency === freq.id
                              ? 'border-[#64D2E6]/75 bg-[#3B2F52] text-white'
                              : 'border-[#453859] bg-[#241C32] text-[#C5BBD6] hover:bg-[#332844]'
                          }`}
                        >
                          {freq.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] leading-[1.45] text-[#9A90A8]">
                      {draftGlobal.timeFrequency === 'high'
                        ? t.aiTimeFreqHighDesc
                        : draftGlobal.timeFrequency === 'somewhat_high'
                          ? t.aiTimeFreqSomewhatHighDesc
                          : draftGlobal.timeFrequency === 'somewhat_low'
                            ? t.aiTimeFreqSomewhatLowDesc
                            : draftGlobal.timeFrequency === 'low'
                              ? t.aiTimeFreqLowDesc
                              : t.aiTimeFreqBalancedDesc}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2 border-t border-[#3F3352] pt-4">
                <div className="text-[12.5px] font-semibold text-[#EFEBF5]">
                  {t.aiOutputLanguageLabel}
                </div>
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-5">
                  {(
                    [
                      { id: 'auto', label: t.aiOutputLangAuto },
                      { id: 'zh-CN', label: t.aiOutputLangZhCn },
                      { id: 'zh-TW', label: t.aiOutputLangZhTw },
                      { id: 'en', label: t.aiOutputLangEn },
                      { id: 'ja', label: t.aiOutputLangJa },
                    ] as { id: AiOutputLanguage; label: string }[]
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      data-action={`global-ai-output-lang-${item.id}`}
                      onClick={() =>
                        setDraftGlobal((prev) => ({ ...prev, outputLanguage: item.id }))
                      }
                      className={`cursor-pointer rounded-[6px] border px-2 py-1.5 text-[11px] font-medium transition-colors ${
                        draftGlobal.outputLanguage === item.id
                          ? 'border-[#64D2E6]/75 bg-[#3B2F52] text-white'
                          : 'border-[#453859] bg-[#241C32] text-[#C5BBD6] hover:bg-[#332844]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] leading-[1.45] text-[#9A90A8]">
                  {t.aiOutputLanguageHint}
                </p>
              </div>

              <div className="space-y-2 border-t border-[#3F3352] pt-4">
                <div className="text-[12.5px] font-semibold text-[#EFEBF5]">
                  {t.aiReplyLengthLabel}
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: 'short', label: t.aiReplyLengthShort },
                      { id: 'normal', label: t.aiReplyLengthNormal },
                      { id: 'detailed', label: t.aiReplyLengthDetailed },
                    ] as { id: AiReplyLength; label: string }[]
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      data-action={`global-ai-length-${opt.id}`}
                      onClick={() => setDraftGlobal((prev) => ({ ...prev, replyLength: opt.id }))}
                      className={`cursor-pointer rounded-[6px] border py-1.5 text-[11.5px] font-medium transition-colors ${
                        draftGlobal.replyLength === opt.id
                          ? 'border-[#64D2E6]/75 bg-[#3B2F52] text-white'
                          : 'border-[#453859] bg-[#241C32] text-[#C5BBD6] hover:bg-[#332844]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-1 pt-2">
                  <div className="flex items-center justify-between text-[11.5px] tabular-nums text-[#DCD7E5]">
                    <span>{t.aiTemperatureLabel(clampAiTemperature(draftGlobal.temperature))}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1.5}
                    step={0.05}
                    data-action="global-ai-temp-range"
                    value={clampAiTemperature(draftGlobal.temperature)}
                    onChange={(e) =>
                      setDraftGlobal((prev) => ({
                        ...prev,
                        temperature: clampAiTemperature(Number(e.target.value)),
                      }))
                    }
                    className="w-full cursor-pointer accent-[#64D2E6]"
                  />
                </div>
              </div>

              <div className="space-y-3 border-t border-[#3F3352] pt-4">
                <label className="flex cursor-pointer items-start gap-2.5">
                  <input
                    type="checkbox"
                    data-action="global-ai-follow-up-toggle"
                    checked={draftGlobal.aiFollowUpEnabled}
                    onChange={(e) =>
                      setDraftGlobal((prev) => ({
                        ...prev,
                        aiFollowUpEnabled: e.target.checked,
                      }))
                    }
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[#64D2E6]"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] font-semibold text-[#EFEBF5]">
                      {t.aiFollowUpToggle}
                    </div>
                    <p className="mt-0.5 text-[11px] leading-[1.45] text-[#9A90A8]">
                      {t.aiFollowUpDesc}
                    </p>
                  </div>
                </label>

                {draftGlobal.aiFollowUpEnabled && (
                  <div className="space-y-1 pl-6">
                    <div className="flex items-center justify-between text-[11.5px] tabular-nums text-[#DCD7E5]">
                      <span>{t.aiFollowUpProbLabel(draftGlobal.aiFollowUpProbability)}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      data-action="global-ai-follow-up-range"
                      value={draftGlobal.aiFollowUpProbability}
                      onChange={(e) =>
                        setDraftGlobal((prev) => ({
                          ...prev,
                          aiFollowUpProbability: Number(e.target.value),
                        }))
                      }
                      className="w-full cursor-pointer accent-[#64D2E6]"
                    />
                  </div>
                )}

                <label className="flex cursor-pointer items-start gap-2.5 border-t border-[#3F3352] pt-3">
                  <input
                    type="checkbox"
                    data-action="global-ai-web-search-toggle"
                    checked={draftGlobal.webSearchEnabled}
                    onChange={(e) =>
                      setDraftGlobal((prev) => ({
                        ...prev,
                        webSearchEnabled: e.target.checked,
                      }))
                    }
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[#64D2E6]"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] font-semibold text-[#EFEBF5]">
                      {t.aiWebSearchToggle}
                    </div>
                    <p className="mt-0.5 text-[11px] leading-[1.45] text-[#9A90A8]">
                      {t.aiWebSearchDesc}
                    </p>
                  </div>
                </label>
              </div>
            </>
          )}

          {activeTab === 'api' && (
            <>
              <div>
                <label className="flex cursor-pointer items-start gap-2.5">
                  <input
                    type="checkbox"
                    data-action="global-ai-key-toggle"
                    checked={draftGlobal.useGlobalApi}
                    onChange={(e) =>
                      setDraftGlobal((prev) => ({
                        ...prev,
                        useGlobalApi: e.target.checked,
                      }))
                    }
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[#64D2E6]"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] font-semibold text-[#EFEBF5]">
                      {t.aiGlobalApiToggle}
                    </div>
                    <p className="mt-0.5 text-[11px] leading-[1.45] text-[#9A90A8]">
                      {t.aiGlobalApiDesc}
                    </p>
                  </div>
                </label>

                {draftGlobal.useGlobalApi && (
                  <div className="mt-3 space-y-2.5 border-t border-[#3F3352] pt-3">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-medium text-[#C5BBD6]">
                          {t.aiProtocolLabel}
                        </label>
                        <select
                          data-action="global-ai-protocol"
                          value={draftGlobal.protocol}
                          onChange={(e) => handleGlobalProtocolChange(e.target.value as AiProtocol)}
                          className="h-[34px] w-full cursor-pointer rounded-[6px] border border-[#493B62] bg-[#332844] px-2 text-[12px] text-[#EFEBF5] outline-none focus:border-[#64D2E6]"
                        >
                          <option value="openai">{t.aiProtocolOpenai}</option>
                          <option value="deepseek">{t.aiProtocolDeepseek}</option>
                          <option value="gemini">{t.aiProtocolGemini}</option>
                          <option value="anthropic">{t.aiProtocolAnthropic}</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="block text-[11px] font-medium text-[#C5BBD6]">
                            {t.aiModelLabel}
                          </label>
                          <button
                            type="button"
                            data-action="global-ai-fetch-models"
                            disabled={fetchingModels}
                            onClick={handleFetchGlobalModels}
                            className="cursor-pointer text-[11px] text-[#64D2E6] hover:underline disabled:opacity-50"
                          >
                            {fetchingModels ? t.aiFetchingModels : t.aiFetchModelsBtn}
                          </button>
                        </div>
                        <select
                          data-action="global-ai-model-select"
                          value={
                            globalModelChoices.includes(draftGlobal.model) ? draftGlobal.model : ''
                          }
                          onChange={(e) => {
                            if (e.target.value) {
                              setDraftGlobal((prev) => ({ ...prev, model: e.target.value }));
                            }
                          }}
                          className="h-[34px] w-full cursor-pointer rounded-[6px] border border-[#493B62] bg-[#332844] px-2 text-[12px] text-[#EFEBF5] outline-none focus:border-[#64D2E6]"
                        >
                          {globalModelChoices.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        data-action="global-ai-baseurl"
                        value={draftGlobal.baseUrl}
                        onChange={(e) =>
                          setDraftGlobal((prev) => ({ ...prev, baseUrl: e.target.value }))
                        }
                        placeholder={AI_PROTOCOL_METAS[draftGlobal.protocol].defaultBaseUrl}
                        className="h-[34px] min-w-0 flex-1 rounded-[6px] border border-[#493B62] bg-[#241C32] px-2.5 text-[12px] text-[#EFEBF5] placeholder-[#7C7191] outline-none focus:border-[#64D2E6]"
                      />
                      <button
                        type="button"
                        data-action="global-ai-reset-url"
                        onClick={() =>
                          setDraftGlobal((prev) => ({
                            ...prev,
                            baseUrl: AI_PROTOCOL_METAS[prev.protocol].defaultBaseUrl,
                          }))
                        }
                        className="h-[34px] shrink-0 cursor-pointer rounded-[6px] border border-[#493B62] bg-[#332844] px-2.5 text-[11px] text-[#DCD7E5] transition-colors hover:bg-[#3F3352] hover:text-white"
                      >
                        {t.aiResetDefaultUrl}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <input
                        type={showGlobalKey ? 'text' : 'password'}
                        data-action="global-ai-apikey"
                        value={draftGlobal.apiKey}
                        onChange={(e) =>
                          setDraftGlobal((prev) => ({ ...prev, apiKey: e.target.value }))
                        }
                        placeholder={t.aiApiKeyPlaceholder}
                        autoComplete="off"
                        className="h-[34px] min-w-0 flex-1 rounded-[6px] border border-[#493B62] bg-[#241C32] px-2.5 text-[12px] text-[#EFEBF5] placeholder-[#7C7191] outline-none focus:border-[#64D2E6]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowGlobalKey((prev) => !prev)}
                        className="flex h-[34px] shrink-0 cursor-pointer items-center justify-center rounded-[6px] border border-[#493B62] bg-[#332844] px-2.5 text-[11px] text-[#DCD7E5] hover:bg-[#3F3352] hover:text-white"
                      >
                        {showGlobalKey ? '🙈' : '👁'}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <input
                        type="text"
                        data-action="global-ai-model-input"
                        value={draftGlobal.model}
                        onChange={(e) =>
                          setDraftGlobal((prev) => ({ ...prev, model: e.target.value }))
                        }
                        placeholder={t.aiCustomModelPlaceholder}
                        className="h-[34px] min-w-0 flex-1 rounded-[6px] border border-[#493B62] bg-[#241C32] px-2.5 text-[12px] text-[#EFEBF5] placeholder-[#7C7191] outline-none focus:border-[#64D2E6]"
                      />
                      <button
                        type="button"
                        data-action="global-ai-test-conn"
                        disabled={testingGlobalConn}
                        onClick={handleTestGlobalConn}
                        className="h-[34px] shrink-0 cursor-pointer rounded-[6px] border border-[#493B62] bg-[#332844] px-3 text-[11px] font-medium text-[#EFEBF5] transition-colors hover:border-[#64D2E6]/60 hover:bg-[#3F3352] disabled:opacity-50"
                      >
                        {testingGlobalConn ? t.aiTestingConnBtn : t.aiTestConnBtn}
                      </button>
                    </div>
                    {fetchStatus && <p className="text-[11px] text-[#64D2E6]">{fetchStatus}</p>}
                    {globalConnStatus && (
                      <p
                        data-testid="global-ai-conn-status"
                        className={`text-[11px] ${
                          globalConnStatus.ok ? 'text-[#64D2E6]' : 'text-[#EB7F97]'
                        }`}
                      >
                        {globalConnStatus.text}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {selectedChar && selectedCharCfg && (
                <div className="space-y-3 border-t border-[#3F3352] pt-4">
                  <div>
                    <div className="text-[12.5px] font-semibold text-[#EFEBF5]">
                      {t.aiCharPromptSectionTitle}
                    </div>
                    <p className="mt-0.5 text-[11px] leading-[1.45] text-[#9A90A8]">
                      {t.aiCharPromptSectionDesc}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {characters.map((char) => {
                      const cfg = getAiCharacterConfig(draftCharConfigs, char.id);
                      const cred = resolveEffectiveAiCredentials(cfg, draftGlobal);
                      const online = isMemberOnlineForAi(char.id, members);
                      const active = char.id === selectedChar.id;
                      return (
                        <button
                          key={char.id}
                          type="button"
                          data-action={`global-ai-select-char-${char.id}`}
                          onClick={() => {
                            setSelectedCharId(char.id);
                            setCharFetchedModels([]);
                            setCharFetchStatus(null);
                            setCharConnStatus(null);
                          }}
                          className={`flex cursor-pointer items-center gap-1.5 rounded-[7px] border px-2.5 py-1 text-[11.5px] font-medium transition-colors ${
                            active
                              ? 'border-[#64D2E6]/75 bg-[#3B2F52] text-white'
                              : 'border-[#453859] bg-[#241C32] text-[#C5BBD6] hover:bg-[#332844] hover:text-white'
                          } ${!online ? 'opacity-65' : ''}`}
                        >
                          <CharacterAvatar
                            avatarType={char.avatarType}
                            customAvatarMediaId={char.customAvatarMediaId}
                            size={17}
                          />
                          <span className="max-w-[84px] truncate">{char.name}</span>
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              !online
                                ? 'bg-[#EB7F97]'
                                : cred.ready
                                  ? 'bg-[#64D2E6]'
                                  : 'bg-[#7A708D]'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-2.5 border-t border-[#382C4A] pt-3">
                    {(() => {
                      const selectedCred = resolveEffectiveAiCredentials(
                        selectedCharCfg,
                        draftGlobal
                      );
                      const online = isMemberOnlineForAi(selectedChar.id, members);
                      return (
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[11.5px]">
                          <span className="font-semibold text-[#EFEBF5]">{selectedChar.name}</span>
                          <span className="flex items-center gap-1.5 text-[#9A90A8]">
                            {!online && (
                              <>
                                <span className="text-[#EB7F97]">{t.aiOfflineStatusBadge}</span>
                                <span aria-hidden="true">·</span>
                              </>
                            )}
                            <span
                              className={selectedCred.ready ? 'text-[#64D2E6]' : 'text-[#9A90A8]'}
                            >
                              {selectedCred.ready
                                ? selectedCred.usingGlobalKey
                                  ? t.aiUsingGlobalKeyBadge
                                  : t.aiOwnKeyBadge
                                : t.aiNoKeyStatusBadge}
                            </span>
                          </span>
                        </div>
                      );
                    })()}

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-medium text-[#C5BBD6]">
                          {t.aiProtocolLabel}
                        </label>
                        <select
                          data-action="global-ai-char-protocol"
                          value={selectedCharCfg.protocol}
                          onChange={(e) => handleCharProtocolChange(e.target.value as AiProtocol)}
                          className="h-[34px] w-full cursor-pointer rounded-[6px] border border-[#493B62] bg-[#332844] px-2 text-[12px] text-[#EFEBF5] outline-none focus:border-[#64D2E6]"
                        >
                          <option value="openai">{t.aiProtocolOpenai}</option>
                          <option value="deepseek">{t.aiProtocolDeepseek}</option>
                          <option value="gemini">{t.aiProtocolGemini}</option>
                          <option value="anthropic">{t.aiProtocolAnthropic}</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="block text-[11px] font-medium text-[#C5BBD6]">
                            {t.aiModelLabel}
                          </label>
                          <button
                            type="button"
                            data-action="global-ai-char-fetch-models"
                            disabled={charFetchingModels}
                            onClick={handleFetchCharModels}
                            className="cursor-pointer text-[11px] text-[#64D2E6] hover:underline disabled:opacity-50"
                          >
                            {charFetchingModels ? t.aiFetchingModels : t.aiFetchModelsBtn}
                          </button>
                        </div>
                        <select
                          data-action="global-ai-char-model-select"
                          value={
                            charModelChoices.includes(selectedCharCfg.model)
                              ? selectedCharCfg.model
                              : ''
                          }
                          onChange={(e) => {
                            if (e.target.value) {
                              updateSelectedCharConfig({ model: e.target.value });
                            }
                          }}
                          className="h-[34px] w-full cursor-pointer rounded-[6px] border border-[#493B62] bg-[#332844] px-2 text-[12px] text-[#EFEBF5] outline-none focus:border-[#64D2E6]"
                        >
                          {charModelChoices.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        data-action="global-ai-char-baseurl"
                        value={selectedCharCfg.baseUrl}
                        onChange={(e) => updateSelectedCharConfig({ baseUrl: e.target.value })}
                        placeholder={AI_PROTOCOL_METAS[selectedCharCfg.protocol].defaultBaseUrl}
                        className="h-[34px] min-w-0 flex-1 rounded-[6px] border border-[#493B62] bg-[#241C32] px-2.5 text-[12px] text-[#EFEBF5] placeholder-[#7C7191] outline-none focus:border-[#64D2E6]"
                      />
                      <button
                        type="button"
                        data-action="global-ai-char-reset-url"
                        onClick={() =>
                          updateSelectedCharConfig({
                            baseUrl: AI_PROTOCOL_METAS[selectedCharCfg.protocol].defaultBaseUrl,
                          })
                        }
                        className="h-[34px] shrink-0 cursor-pointer rounded-[6px] border border-[#493B62] bg-[#332844] px-2.5 text-[11px] text-[#DCD7E5] transition-colors hover:bg-[#3F3352] hover:text-white"
                      >
                        {t.aiResetDefaultUrl}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <input
                        type={showCharKey ? 'text' : 'password'}
                        data-action="global-ai-char-apikey"
                        value={selectedCharCfg.apiKey}
                        onChange={(e) => updateSelectedCharConfig({ apiKey: e.target.value })}
                        placeholder={`${selectedChar.name} API Key`}
                        autoComplete="off"
                        className="h-[34px] min-w-0 flex-1 rounded-[6px] border border-[#493B62] bg-[#241C32] px-2.5 text-[12px] text-[#EFEBF5] placeholder-[#7C7191] outline-none focus:border-[#64D2E6]"
                      />
                      <button
                        type="button"
                        data-action="global-ai-char-toggle-key"
                        onClick={() => setShowCharKey((prev) => !prev)}
                        className="flex h-[34px] shrink-0 cursor-pointer items-center justify-center rounded-[6px] border border-[#493B62] bg-[#332844] px-2.5 text-[11px] text-[#DCD7E5] hover:bg-[#3F3352] hover:text-white"
                      >
                        {showCharKey ? '🙈' : '👁'}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <input
                        type="text"
                        data-action="global-ai-char-model"
                        value={selectedCharCfg.model}
                        onChange={(e) => updateSelectedCharConfig({ model: e.target.value })}
                        placeholder={t.aiCustomModelPlaceholder}
                        className="h-[34px] min-w-0 flex-1 rounded-[6px] border border-[#493B62] bg-[#241C32] px-2.5 text-[12px] text-[#EFEBF5] placeholder-[#7C7191] outline-none focus:border-[#64D2E6]"
                      />
                      <button
                        type="button"
                        data-action="global-ai-char-test-conn"
                        disabled={testingCharConn}
                        onClick={handleTestCharConn}
                        className="h-[34px] shrink-0 cursor-pointer rounded-[6px] border border-[#493B62] bg-[#332844] px-3 text-[11px] font-medium text-[#EFEBF5] transition-colors hover:border-[#64D2E6]/60 hover:bg-[#3F3352] disabled:opacity-50"
                      >
                        {testingCharConn ? t.aiTestingConnBtn : t.aiTestConnBtn}
                      </button>
                    </div>
                    {charFetchStatus && (
                      <p className="text-[11px] text-[#64D2E6]">{charFetchStatus}</p>
                    )}
                    {charConnStatus && (
                      <p
                        data-testid="global-ai-char-conn-status"
                        className={`text-[11px] ${
                          charConnStatus.ok ? 'text-[#64D2E6]' : 'text-[#EB7F97]'
                        }`}
                      >
                        {charConnStatus.text}
                      </p>
                    )}

                    <div className="space-y-1 pt-1">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] tabular-nums text-[#DCD7E5]">
                        <span>
                          {t.aiTemperatureLabel(
                            clampAiTemperature(
                              selectedCharCfg.temperature ?? draftGlobal.temperature
                            )
                          )}
                        </span>
                        {typeof selectedCharCfg.temperature === 'number' && (
                          <button
                            type="button"
                            data-action="global-ai-char-temp-reset"
                            onClick={() => updateSelectedCharConfig({ temperature: undefined })}
                            className="cursor-pointer text-[11px] text-[#64D2E6] hover:underline"
                          >
                            {t.aiCharTempUseGlobalBtn}
                          </button>
                        )}
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={1.5}
                        step={0.05}
                        data-action="global-ai-char-temp-range"
                        value={clampAiTemperature(
                          selectedCharCfg.temperature ?? draftGlobal.temperature
                        )}
                        onChange={(e) =>
                          updateSelectedCharConfig({
                            temperature: clampAiTemperature(Number(e.target.value)),
                          })
                        }
                        className="w-full cursor-pointer accent-[#64D2E6]"
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <span className="text-[11px] font-medium text-[#C5BBD6]">
                        {t.aiPromptLabel}
                      </span>
                      <button
                        type="button"
                        data-action="global-ai-char-fill-preset"
                        onClick={() => {
                          const preset = getNightcordCharacterPresetPrompt(
                            selectedChar.id,
                            selectedChar.name,
                            lang
                          );
                          updateSelectedCharConfig({ systemPrompt: preset });
                        }}
                        className="cursor-pointer text-[11px] font-medium text-[#64D2E6] hover:underline"
                      >
                        {t.aiFillPresetBtn}
                      </button>
                    </div>

                    <textarea
                      data-action="global-ai-char-prompt"
                      value={selectedCharCfg.systemPrompt}
                      onChange={(e) => updateSelectedCharConfig({ systemPrompt: e.target.value })}
                      rows={3}
                      placeholder={t.aiPromptPlaceholder}
                      className="nc-scroll w-full resize-y rounded-[6px] border border-[#493B62] bg-[#241C32] px-2.5 py-2 text-[12px] leading-[1.45] text-[#EFEBF5] placeholder-[#7C7191] outline-none focus:border-[#64D2E6]"
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-[#241C30] bg-[#261D33] px-4 py-3 sm:px-5">
          <div className="flex flex-wrap items-center gap-2">
            {onExportAiTranscript && (
              <button
                type="button"
                data-action="global-ai-export-transcript"
                onClick={onExportAiTranscript}
                className="h-[34px] cursor-pointer rounded-[6px] border border-[#493B62] bg-[#332844] px-3 text-[11.5px] font-medium text-[#DCD7E5] transition-colors hover:bg-[#3F3352] hover:text-white"
              >
                {t.aiExportTranscriptBtn}
              </button>
            )}
            {onOpenUsageModal && (
              <button
                type="button"
                data-action="global-ai-open-usage"
                onClick={() => {
                  onClose();
                  onOpenUsageModal();
                }}
                className="h-[34px] cursor-pointer rounded-[6px] border border-[#493B62] bg-[#332844] px-3 text-[11.5px] font-medium text-[#DCD7E5] transition-colors hover:bg-[#3F3352] hover:text-white"
              >
                {t.aiUsageBtn}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-action="global-ai-cancel"
              onClick={onClose}
              className="h-[34px] cursor-pointer rounded-[6px] border border-[#524468] bg-[#332844] px-3.5 text-[12px] font-medium text-[#DCD7E5] transition-colors hover:bg-[#3F3352] hover:text-white"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              data-action="global-ai-save"
              className="h-[34px] cursor-pointer rounded-[6px] bg-[#5C4D74] px-4 text-[12px] font-bold text-white transition-colors hover:bg-[#6D5C8A]"
            >
              {t.save}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
