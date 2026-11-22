import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type {
  AiCharacterConfig,
  AiGlobalConfig,
  AiProtocol,
  CharacterProfile,
  UiLanguage,
} from '../types/nightcord';
import {
  AI_PROTOCOL_METAS,
  fetchAiModels,
  getAiCharacterConfig,
  getEligibleAiCharacters,
  resolveEffectiveAiCredentials,
} from '../utils/aiClient';
import { getUiText } from '../utils/i18n';
import { CharacterAvatar } from './LocalMedia';

interface AiGlobalSettingsModalProps {
  lang: UiLanguage;
  open: boolean;
  globalConfig: AiGlobalConfig;
  characters: CharacterProfile[];
  characterConfigs: Record<string, AiCharacterConfig>;
  onClose: () => void;
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
  characterConfigs,
  onClose,
  onSave,
}: AiGlobalSettingsModalProps) {
  const t = getUiText(lang);
  const [draftGlobal, setDraftGlobal] = useState<AiGlobalConfig>(globalConfig);
  const [draftCharConfigs, setDraftCharConfigs] = useState<Record<string, AiCharacterConfig>>(
    characterConfigs
  );
  const [selectedCharId, setSelectedCharId] = useState<string>(characters[0]?.id ?? '');
  const [showGlobalKey, setShowGlobalKey] = useState(false);
  const [fetchedModels, setFetchedModels] = useState<string[]>([]);
  const [fetchingModels, setFetchingModels] = useState(false);
  const [fetchStatus, setFetchStatus] = useState<string | null>(null);

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
    setShowGlobalKey(false);
  }, [open, globalConfig, characterConfigs, characters]);

  if (!open) {
    return null;
  }

  const selectedChar = characters.find((c) => c.id === selectedCharId) ?? characters[0];
  const selectedCharCfg = selectedChar
    ? getAiCharacterConfig(draftCharConfigs, selectedChar.id)
    : null;

  const readyCharacters = getEligibleAiCharacters(characters, draftCharConfigs, draftGlobal);

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

  const globalModelChoices = Array.from(
    new Set([
      ...fetchedModels,
      ...AI_PROTOCOL_METAS[draftGlobal.protocol].presetModels,
      ...(draftGlobal.model.trim() ? [draftGlobal.model.trim()] : []),
    ])
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave(
      {
        ...draftGlobal,
        baseUrl:
          draftGlobal.baseUrl.trim() || AI_PROTOCOL_METAS[draftGlobal.protocol].defaultBaseUrl,
        apiKey: draftGlobal.apiKey.trim(),
        model: draftGlobal.model.trim() || AI_PROTOCOL_METAS[draftGlobal.protocol].defaultModel,
        userDisplayName: draftGlobal.userDisplayName.trim() || 'あなた',
      },
      draftCharConfigs
    );
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.aiGlobalModalTitle}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4"
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="nc-modal-enter flex max-h-[92dvh] w-full max-w-[520px] flex-col overflow-hidden rounded-[12px] border border-[#524468] bg-[#241C32] shadow-[0_22px_54px_rgba(0,0,0,0.72)]"
      >
        <div className="flex shrink-0 items-start justify-between gap-2 border-b border-[#372B4A] bg-[#211A2C] px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-[14.5px] font-bold text-[#EFEBF5]">{t.aiGlobalModalTitle}</h2>
            <p className="mt-0.5 text-[11px] leading-[1.4] text-[#9E93B3]">
              {t.aiGlobalModalSub}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="rounded-[5px] bg-[#362B4A] px-2 py-0.5 text-[10.5px] font-medium text-[#64D2E6]">
              {t.aiConfiguredCharsCount(readyCharacters.length, characters.length)}
            </span>
            <button
              type="button"
              data-action="close-ai-global-modal"
              aria-label={t.cancel}
              onClick={onClose}
              className="cursor-pointer rounded px-2 py-0.5 text-[16px] text-[#9A90A8] transition-colors hover:bg-[#382C4B] hover:text-white"
            >
              ×
            </button>
          </div>
        </div>

        <div className="nc-scroll min-h-0 flex-1 space-y-4 p-4">
          <div className="rounded-[9px] border border-[#3E3156] bg-[#2C223D] p-3">
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
                <p className="mt-0.5 text-[11px] leading-[1.4] text-[#A499B8]">
                  {t.aiFollowUpDesc}
                </p>
              </div>
            </label>

            {draftGlobal.aiFollowUpEnabled && (
              <div className="mt-3 space-y-1.5 border-t border-[#3E3156] pt-2.5">
                <div className="flex items-center justify-between text-[11.5px] text-[#D6CFE3]">
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
          </div>

          <div className="rounded-[9px] border border-[#3E3156] bg-[#2C223D] p-3">
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
                <p className="mt-0.5 text-[11px] leading-[1.4] text-[#A499B8]">
                  {t.aiGlobalApiDesc}
                </p>
              </div>
            </label>

            {draftGlobal.useGlobalApi && (
              <div className="mt-3 space-y-2.5 border-t border-[#3E3156] pt-3">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-[#C5BBD6]">
                      {t.aiProtocolLabel}
                    </label>
                    <select
                      data-action="global-ai-protocol"
                      value={draftGlobal.protocol}
                      onChange={(e) => handleGlobalProtocolChange(e.target.value as AiProtocol)}
                      className="h-[34px] w-full cursor-pointer rounded-[6px] border border-[#4D3F66] bg-[#332844] px-2 text-[12px] text-[#EFEBF5] outline-none focus:border-[#64D2E6]"
                    >
                      <option value="openai">{t.aiProtocolOpenai}</option>
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
                        className="cursor-pointer text-[10.5px] text-[#64D2E6] hover:underline disabled:opacity-50"
                      >
                        {fetchingModels ? t.aiFetchingModels : t.aiFetchModelsBtn}
                      </button>
                    </div>
                    <select
                      data-action="global-ai-model-select"
                      value={globalModelChoices.includes(draftGlobal.model) ? draftGlobal.model : ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          setDraftGlobal((prev) => ({ ...prev, model: e.target.value }));
                        }
                      }}
                      className="h-[34px] w-full cursor-pointer rounded-[6px] border border-[#4D3F66] bg-[#332844] px-2 text-[12px] text-[#EFEBF5] outline-none focus:border-[#64D2E6]"
                    >
                      {globalModelChoices.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <input
                    type="text"
                    data-action="global-ai-baseurl"
                    value={draftGlobal.baseUrl}
                    onChange={(e) =>
                      setDraftGlobal((prev) => ({ ...prev, baseUrl: e.target.value }))
                    }
                    placeholder={AI_PROTOCOL_METAS[draftGlobal.protocol].defaultBaseUrl}
                    className="h-[34px] w-full rounded-[6px] border border-[#4D3F66] bg-[#1E1729] px-2.5 text-[12px] text-[#EFEBF5] placeholder-[#7C7191] outline-none focus:border-[#64D2E6]"
                  />
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
                    className="h-[34px] min-w-0 flex-1 rounded-[6px] border border-[#4D3F66] bg-[#1E1729] px-2.5 text-[12px] text-[#EFEBF5] placeholder-[#7C7191] outline-none focus:border-[#64D2E6]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGlobalKey((prev) => !prev)}
                    className="flex h-[34px] shrink-0 cursor-pointer items-center justify-center rounded-[6px] border border-[#4D3F66] bg-[#332844] px-2.5 text-[11px] text-[#CFC7DD] hover:bg-[#44365B] hover:text-white"
                  >
                    {showGlobalKey ? '🙈' : '👁'}
                  </button>
                </div>

                <input
                  type="text"
                  data-action="global-ai-model-input"
                  value={draftGlobal.model}
                  onChange={(e) =>
                    setDraftGlobal((prev) => ({ ...prev, model: e.target.value }))
                  }
                  placeholder={t.aiCustomModelPlaceholder}
                  className="h-[32px] w-full rounded-[6px] border border-[#4D3F66] bg-[#1E1729] px-2.5 text-[11.5px] text-[#EFEBF5] placeholder-[#7C7191] outline-none focus:border-[#64D2E6]"
                />
                {fetchStatus && <p className="text-[10.5px] text-[#64D2E6]">{fetchStatus}</p>}
              </div>
            )}
          </div>

          <div className="rounded-[9px] border border-[#3E3156] bg-[#2C223D] p-3">
            <label className="mb-1.5 block text-[11.5px] font-semibold text-[#D6CFE3]">
              {t.aiUserIdentityTitle}
            </label>
            <input
              type="text"
              data-action="global-ai-user-name"
              value={draftGlobal.userDisplayName}
              onChange={(e) =>
                setDraftGlobal((prev) => ({ ...prev, userDisplayName: e.target.value }))
              }
              placeholder={t.aiUserNamePlaceholder}
              className="h-[34px] w-full rounded-[6px] border border-[#4D3F66] bg-[#1E1729] px-2.5 text-[12px] text-[#EFEBF5] placeholder-[#7C7191] outline-none focus:border-[#64D2E6]"
            />
          </div>

          {selectedChar && selectedCharCfg && (
            <div className="rounded-[9px] border border-[#3E3156] bg-[#2C223D] p-3">
              <div className="mb-2">
                <div className="text-[12.5px] font-semibold text-[#EFEBF5]">
                  {t.aiCharPromptSectionTitle}
                </div>
                <p className="mt-0.5 text-[10.5px] text-[#A499B8]">
                  {t.aiCharPromptSectionDesc}
                </p>
              </div>

              <div className="mb-2.5 flex flex-wrap gap-1.5">
                {characters.map((char) => {
                  const cfg = getAiCharacterConfig(draftCharConfigs, char.id);
                  const cred = resolveEffectiveAiCredentials(cfg, draftGlobal);
                  const active = char.id === selectedChar.id;
                  return (
                    <button
                      key={char.id}
                      type="button"
                      data-action={`global-ai-select-char-${char.id}`}
                      onClick={() => setSelectedCharId(char.id)}
                      className={`flex cursor-pointer items-center gap-1.5 rounded-[7px] border px-2 py-1 text-[11.5px] font-medium transition-colors ${
                        active
                          ? 'border-[#64D2E6] bg-[#43355C] text-white'
                          : 'border-[#46385C] bg-[#241C32] text-[#CFC7DD] hover:bg-[#342947] hover:text-white'
                      }`}
                    >
                      <CharacterAvatar
                        avatarType={char.avatarType}
                        customAvatarMediaId={char.customAvatarMediaId}
                        size={17}
                      />
                      <span className="max-w-[84px] truncate">{char.name}</span>
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          cred.ready ? 'bg-[#55D8C1]' : 'bg-[#7A708D]'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2">
                {(() => {
                  const selectedCred = resolveEffectiveAiCredentials(selectedCharCfg, draftGlobal);
                  return (
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="font-semibold text-[#DCD7E5]">{selectedChar.name}</span>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-medium ${
                          selectedCred.ready
                            ? selectedCred.usingGlobalKey
                              ? 'bg-[#64D2E6]/15 text-[#64D2E6]'
                              : 'bg-[#55D8C1]/15 text-[#55D8C1]'
                            : 'bg-[#241C32] text-[#9A90A8]'
                        }`}
                      >
                        {selectedCred.ready
                          ? selectedCred.usingGlobalKey
                            ? t.aiUsingGlobalKeyBadge
                            : t.aiOwnKeyBadge
                          : t.aiNoKeyStatusBadge}
                      </span>
                    </div>
                  );
                })()}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <input
                    type="password"
                    data-action="global-ai-char-apikey"
                    value={selectedCharCfg.apiKey}
                    onChange={(e) => updateSelectedCharConfig({ apiKey: e.target.value })}
                    placeholder={`${selectedChar.name} API Key`}
                    autoComplete="off"
                    className="h-[32px] w-full rounded-[6px] border border-[#4D3F66] bg-[#1E1729] px-2.5 text-[11.5px] text-[#EFEBF5] placeholder-[#7C7191] outline-none focus:border-[#64D2E6]"
                  />
                  <input
                    type="text"
                    data-action="global-ai-char-model"
                    value={selectedCharCfg.model}
                    onChange={(e) => updateSelectedCharConfig({ model: e.target.value })}
                    placeholder={t.aiCustomModelPlaceholder}
                    className="h-[32px] w-full rounded-[6px] border border-[#4D3F66] bg-[#1E1729] px-2.5 text-[11.5px] text-[#EFEBF5] placeholder-[#7C7191] outline-none focus:border-[#64D2E6]"
                  />
                </div>
                <textarea
                  data-action="global-ai-char-prompt"
                  value={selectedCharCfg.systemPrompt}
                  onChange={(e) => updateSelectedCharConfig({ systemPrompt: e.target.value })}
                  rows={3}
                  placeholder={t.aiPromptPlaceholder}
                  className="nc-scroll w-full resize-y rounded-[6px] border border-[#4D3F66] bg-[#1E1729] px-2.5 py-2 text-[12px] leading-[1.45] text-[#EFEBF5] placeholder-[#7C7191] outline-none focus:border-[#64D2E6]"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[#372B4A] bg-[#211A2C] px-4 py-3">
          <button
            type="button"
            data-action="global-ai-cancel"
            onClick={onClose}
            className="h-[34px] cursor-pointer rounded-[7px] bg-[#362B4A] px-3.5 text-[12px] font-medium text-[#DCD7E5] transition-colors hover:bg-[#47395E]"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            data-action="global-ai-save"
            className="h-[34px] cursor-pointer rounded-[7px] bg-[#52436B] px-4 text-[12px] font-semibold text-white transition-colors hover:bg-[#645283]"
          >
            {t.save}
          </button>
        </div>
      </form>
    </div>
  );
}
