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
  clampAiTemperature,
  fetchAiModels,
  getNightcordCharacterPresetPrompt,
  resolveEffectiveAiCredentials,
  testAiConnection,
} from '../utils/aiClient';
import { getUiText } from '../utils/i18n';
import { CharacterAvatar } from './LocalMedia';

interface CharacterAiModalProps {
  lang: UiLanguage;
  open: boolean;
  character: CharacterProfile | null;
  isOnline?: boolean;
  initialConfig: AiCharacterConfig;
  globalConfig: AiGlobalConfig;
  onClose: () => void;
  onSave: (characterId: string, config: AiCharacterConfig) => void;
}

export function CharacterAiModal({
  lang,
  open,
  character,
  isOnline = true,
  initialConfig,
  globalConfig,
  onClose,
  onSave,
}: CharacterAiModalProps) {
  const t = getUiText(lang);
  const [protocol, setProtocol] = useState<AiProtocol>(initialConfig.protocol);
  const [baseUrl, setBaseUrl] = useState(initialConfig.baseUrl);
  const [apiKey, setApiKey] = useState(initialConfig.apiKey);
  const [model, setModel] = useState(initialConfig.model);
  const [systemPrompt, setSystemPrompt] = useState(initialConfig.systemPrompt);
  const [temperature, setTemperature] = useState<number | undefined>(initialConfig.temperature);
  const [showKey, setShowKey] = useState(false);
  const [fetchedModels, setFetchedModels] = useState<string[]>([]);
  const [fetchingModels, setFetchingModels] = useState(false);
  const [fetchStatus, setFetchStatus] = useState<string | null>(null);
  const [testingConn, setTestingConn] = useState(false);
  const [connStatus, setConnStatus] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    setProtocol(initialConfig.protocol);
    setBaseUrl(initialConfig.baseUrl || AI_PROTOCOL_METAS[initialConfig.protocol].defaultBaseUrl);
    setApiKey(initialConfig.apiKey);
    setModel(initialConfig.model || AI_PROTOCOL_METAS[initialConfig.protocol].defaultModel);
    setSystemPrompt(initialConfig.systemPrompt);
    setTemperature(initialConfig.temperature);
    setFetchedModels([]);
    setFetchStatus(null);
    setConnStatus(null);
    setShowKey(false);
  }, [open, character?.id, initialConfig]);

  if (!open || !character) {
    return null;
  }

  const handleProtocolChange = (nextProtocol: AiProtocol) => {
    const prevDefaultUrl = AI_PROTOCOL_METAS[protocol].defaultBaseUrl;
    const prevDefaultModel = AI_PROTOCOL_METAS[protocol].defaultModel;
    setProtocol(nextProtocol);
    if (!baseUrl.trim() || baseUrl.trim() === prevDefaultUrl) {
      setBaseUrl(AI_PROTOCOL_METAS[nextProtocol].defaultBaseUrl);
    }
    if (!model.trim() || model.trim() === prevDefaultModel) {
      setModel(AI_PROTOCOL_METAS[nextProtocol].defaultModel);
    }
    setFetchedModels([]);
    setFetchStatus(null);
  };

  const handleFetchModels = async () => {
    const effectiveKey = apiKey.trim() || (globalConfig.useGlobalApi ? globalConfig.apiKey.trim() : '');
    if (!effectiveKey) {
      setFetchStatus(t.aiFetchModelsFail);
      return;
    }
    setFetchingModels(true);
    setFetchStatus(null);
    try {
      const list = await fetchAiModels(protocol, baseUrl, effectiveKey);
      setFetchedModels(list);
      if (list.length > 0 && !list.includes(model)) {
        setModel(list[0]);
      }
      setFetchStatus(t.aiFetchModelsOk(list.length));
    } catch {
      setFetchStatus(t.aiFetchModelsFail);
    } finally {
      setFetchingModels(false);
    }
  };

  const handleTestConnection = async () => {
    const effectiveKey = apiKey.trim() || (globalConfig.useGlobalApi ? globalConfig.apiKey.trim() : '');
    const testProtocol = apiKey.trim()
      ? protocol
      : globalConfig.useGlobalApi
        ? globalConfig.protocol
        : protocol;
    const testUrl = apiKey.trim()
      ? baseUrl
      : globalConfig.useGlobalApi
        ? globalConfig.baseUrl
        : baseUrl;
    const testModel = apiKey.trim()
      ? model
      : globalConfig.useGlobalApi
        ? globalConfig.model
        : model;

    setTestingConn(true);
    setConnStatus(null);
    try {
      const res = await testAiConnection(testProtocol, testUrl, effectiveKey, testModel);
      if (res.ok) {
        setConnStatus({ ok: true, text: t.aiTestConnOk(res.latencyMs, res.detail) });
      } else {
        setConnStatus({
          ok: false,
          text: t.aiTestConnFail(res.detail === 'NO_API_KEY' ? t.aiUnconfiguredBadge : res.detail),
        });
      }
    } finally {
      setTestingConn(false);
    }
  };

  const modelChoices = Array.from(
    new Set([
      ...fetchedModels,
      ...AI_PROTOCOL_METAS[protocol].presetModels,
      ...(model.trim() ? [model.trim()] : []),
    ])
  );

  const effectiveTemp = clampAiTemperature(temperature ?? globalConfig.temperature, 0.85);
  const effectiveCred = resolveEffectiveAiCredentials(
    { protocol, baseUrl, apiKey, model, systemPrompt, temperature },
    globalConfig
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave(character.id, {
      protocol,
      baseUrl: baseUrl.trim() || AI_PROTOCOL_METAS[protocol].defaultBaseUrl,
      apiKey: apiKey.trim(),
      model: model.trim() || AI_PROTOCOL_METAS[protocol].defaultModel,
      systemPrompt,
      ...(typeof temperature === 'number' ? { temperature } : {}),
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.aiCharModalTitle(character.name)}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4"
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="nc-modal-enter flex max-h-[90dvh] w-full max-w-[460px] flex-col overflow-hidden rounded-[12px] border border-[#524468] bg-[#241C32] shadow-[0_22px_54px_rgba(0,0,0,0.72)]"
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#372B4A] bg-[#211A2C] px-5 py-3.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <CharacterAvatar
              avatarType={character.avatarType}
              customAvatarMediaId={character.customAvatarMediaId}
              size={28}
            />
            <div className="min-w-0">
              <h2 className="truncate text-[14.5px] font-bold text-[#EFEBF5]">
                {t.aiCharModalTitle(character.name)}
              </h2>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {!isOnline && (
              <span className="rounded-[5px] bg-[#3E2A3A] px-2 py-0.5 text-[10.5px] font-medium text-[#FFB6C7]">
                {t.aiOfflineStatusBadge}
              </span>
            )}
            <span
              className={`rounded-[5px] px-2 py-0.5 text-[10.5px] font-medium ${
                effectiveCred.ready
                  ? 'bg-[#55D8C1]/15 text-[#55D8C1]'
                  : 'bg-[#46385C]/60 text-[#A89DBD]'
              }`}
            >
              {effectiveCred.ready ? t.aiReadyBadge : t.aiUnconfiguredBadge}
            </span>
            <button
              type="button"
              data-action="close-char-ai-modal"
              aria-label={t.cancel}
              onClick={onClose}
              className="cursor-pointer rounded px-2 py-0.5 text-[16px] text-[#9A90A8] transition-colors hover:bg-[#382C4B] hover:text-white"
            >
              ×
            </button>
          </div>
        </div>

        <div className="nc-scroll min-h-0 flex-1 space-y-4 p-4 sm:p-5">
          <div className="space-y-1.5">
            <label className="block text-[11.5px] font-semibold text-[#D6CFE3]">
              {t.aiProtocolLabel}
            </label>
            <select
              data-action="char-ai-protocol"
              value={protocol}
              onChange={(e) => handleProtocolChange(e.target.value as AiProtocol)}
              className="h-[36px] w-full cursor-pointer rounded-[7px] border border-[#4D3F66] bg-[#332844] px-2.5 text-[12.5px] text-[#EFEBF5] outline-none focus:border-[#64D2E6]"
            >
              <option value="openai">{t.aiProtocolOpenai}</option>
              <option value="deepseek">{t.aiProtocolDeepseek}</option>
              <option value="gemini">{t.aiProtocolGemini}</option>
              <option value="anthropic">{t.aiProtocolAnthropic}</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label className="block text-[11.5px] font-semibold text-[#D6CFE3]">
                {t.aiBaseUrlLabel}
              </label>
              <button
                type="button"
                data-action="char-ai-reset-url"
                onClick={() => setBaseUrl(AI_PROTOCOL_METAS[protocol].defaultBaseUrl)}
                className="cursor-pointer rounded-[5px] bg-[#362B4A] px-2 py-0.5 text-[10.5px] text-[#BEB5D0] transition-colors hover:bg-[#493B62] hover:text-white"
              >
                {t.aiResetDefaultUrl}
              </button>
            </div>
            <input
              type="text"
              data-action="char-ai-baseurl"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder={AI_PROTOCOL_METAS[protocol].defaultBaseUrl}
              className="h-[36px] w-full rounded-[7px] border border-[#4D3F66] bg-[#1E1729] px-3 text-[12.5px] text-[#EFEBF5] placeholder-[#7C7191] outline-none focus:border-[#64D2E6]"
            />
            <p className="text-[10.5px] leading-[1.4] text-[#9B90AD]">{t.aiBaseUrlHint}</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label className="block text-[11.5px] font-semibold text-[#D6CFE3]">
                {t.aiApiKeyLabel}
              </label>
              {globalConfig.useGlobalApi && globalConfig.apiKey.trim() && !apiKey.trim() && (
                <span className="rounded bg-[#64D2E6]/15 px-1.5 py-0.5 text-[10px] text-[#64D2E6]">
                  {t.aiUsingGlobalKeyBadge}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type={showKey ? 'text' : 'password'}
                data-action="char-ai-apikey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={t.aiApiKeyPlaceholder}
                autoComplete="off"
                className="h-[36px] min-w-0 flex-1 rounded-[7px] border border-[#4D3F66] bg-[#1E1729] px-3 text-[12.5px] text-[#EFEBF5] placeholder-[#7C7191] outline-none focus:border-[#64D2E6]"
              />
              <button
                type="button"
                data-action="char-ai-toggle-key"
                onClick={() => setShowKey((prev) => !prev)}
                className="flex h-[36px] shrink-0 cursor-pointer items-center justify-center rounded-[7px] border border-[#4D3F66] bg-[#332844] px-2.5 text-[11.5px] text-[#CFC7DD] hover:bg-[#44365B] hover:text-white"
              >
                {showKey ? '🙈' : '👁'}
              </button>
            </div>
            <p className="text-[10.5px] leading-[1.4] text-[#9B90AD]">{t.aiLocalOnlyNote}</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-[11.5px] font-semibold text-[#D6CFE3]">
                {t.aiModelLabel}
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  data-action="char-ai-test-conn"
                  disabled={testingConn}
                  onClick={handleTestConnection}
                  className="cursor-pointer rounded-[5px] bg-[#362B4A] px-2.5 py-0.5 text-[10.5px] font-medium text-[#55D8C1] transition-colors hover:bg-[#493B62] disabled:opacity-50"
                >
                  {testingConn ? t.aiTestingConnBtn : t.aiTestConnBtn}
                </button>
                <button
                  type="button"
                  data-action="char-ai-fetch-models"
                  disabled={fetchingModels}
                  onClick={handleFetchModels}
                  className="cursor-pointer rounded-[5px] bg-[#362B4A] px-2.5 py-0.5 text-[10.5px] font-medium text-[#64D2E6] transition-colors hover:bg-[#493B62] disabled:opacity-50"
                >
                  {fetchingModels ? t.aiFetchingModels : t.aiFetchModelsBtn}
                </button>
              </div>
            </div>
            <select
              data-action="char-ai-model-select"
              value={modelChoices.includes(model) ? model : ''}
              onChange={(e) => {
                if (e.target.value) {
                  setModel(e.target.value);
                }
              }}
              className="h-[36px] w-full cursor-pointer rounded-[7px] border border-[#4D3F66] bg-[#332844] px-2.5 text-[12.5px] text-[#EFEBF5] outline-none focus:border-[#64D2E6]"
            >
              {modelChoices.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <input
              type="text"
              data-action="char-ai-model-input"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder={t.aiCustomModelPlaceholder}
              className="h-[34px] w-full rounded-[7px] border border-[#4D3F66] bg-[#1E1729] px-3 text-[12px] text-[#EFEBF5] placeholder-[#7C7191] outline-none focus:border-[#64D2E6]"
            />
            {fetchStatus && <p className="text-[10.5px] text-[#64D2E6]">{fetchStatus}</p>}
            {connStatus && (
              <p
                data-testid="char-ai-conn-status"
                className={`text-[10.5px] ${connStatus.ok ? 'text-[#55D8C1]' : 'text-[#FFB6C7]'}`}
              >
                {connStatus.text}
              </p>
            )}
          </div>

          <div className="space-y-1.5 rounded-[7px] border border-[#3E3156] bg-[#2C223D]/60 p-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-[#D6CFE3]">
                {t.aiTemperatureLabel(effectiveTemp)}
              </span>
              {typeof temperature === 'number' && (
                <button
                  type="button"
                  data-action="char-ai-temp-reset"
                  onClick={() => setTemperature(undefined)}
                  className="cursor-pointer rounded bg-[#362B4A] px-2 py-0.5 text-[10px] text-[#BEB5D0] hover:bg-[#493B62] hover:text-white"
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
              data-action="char-ai-temp-range"
              value={effectiveTemp}
              onChange={(e) => setTemperature(clampAiTemperature(Number(e.target.value)))}
              className="w-full cursor-pointer accent-[#64D2E6]"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-[11.5px] font-semibold text-[#D6CFE3]">
                {t.aiPromptLabel}
              </label>
              <button
                type="button"
                data-action="char-ai-fill-preset"
                onClick={() => {
                  const preset = getNightcordCharacterPresetPrompt(
                    character.id,
                    character.name,
                    lang
                  );
                  setSystemPrompt(preset);
                }}
                className="cursor-pointer rounded-[5px] bg-[#362B4A] px-2 py-0.5 text-[10.5px] font-medium text-[#64D2E6] transition-colors hover:bg-[#493B62] hover:text-white"
              >
                {t.aiFillPresetBtn}
              </button>
            </div>
            <textarea
              data-action="char-ai-prompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={4}
              placeholder={t.aiPromptPlaceholder}
              className="nc-scroll w-full resize-y rounded-[7px] border border-[#4D3F66] bg-[#1E1729] px-3 py-2 text-[12.5px] leading-[1.5] text-[#EFEBF5] placeholder-[#7C7191] outline-none focus:border-[#64D2E6]"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[#372B4A] bg-[#211A2C] px-4 py-3">
          <button
            type="button"
            data-action="char-ai-cancel"
            onClick={onClose}
            className="h-[34px] cursor-pointer rounded-[7px] bg-[#362B4A] px-3.5 text-[12px] font-medium text-[#DCD7E5] transition-colors hover:bg-[#47395E]"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            data-action="char-ai-save"
            className="h-[34px] cursor-pointer rounded-[7px] bg-[#52436B] px-4 text-[12px] font-semibold text-white transition-colors hover:bg-[#645283]"
          >
            {t.save}
          </button>
        </div>
      </form>
    </div>
  );
}
