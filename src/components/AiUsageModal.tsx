import { useState } from 'react';
import type {
  AiUsagePurpose,
  AiUsageRecord,
  AiUsageState,
  AiUsageTotals,
  UiLanguage,
} from '../types/nightcord';
import { getUiText } from '../utils/i18n';

interface AiUsageModalProps {
  open: boolean;
  lang: UiLanguage;
  usageState: AiUsageState;
  onClose: () => void;
  onResetSession: () => void;
}

function formatTokenCount(
  value: number | null,
  knownRequests: number,
  unknownRequests: number,
  unknownLabel: string,
  partialNote: (count: number) => string
): string {
  if (value === null || knownRequests === 0) {
    return unknownLabel;
  }
  const formatted = value.toLocaleString();
  if (unknownRequests > 0) {
    return `${formatted} (${partialNote(unknownRequests)})`;
  }
  return formatted;
}

function formatRecordMetric(value: number | null, usageKnown: boolean, unknownLabel: string): string {
  if (!usageKnown || value === null) {
    return unknownLabel;
  }
  return value.toLocaleString();
}

function formatClockTime(iso: string): string {
  try {
    const dt = new Date(iso);
    if (Number.isNaN(dt.getTime())) {
      return iso;
    }
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(
      dt.getMinutes()
    )}:${pad(dt.getSeconds())}`;
  } catch {
    return iso;
  }
}

function getPurposeLabel(purpose: AiUsagePurpose, t: ReturnType<typeof getUiText>): string {
  switch (purpose) {
    case 'follow_up':
      return t.aiUsagePurposeFollowUp;
    case 'auto_chat':
      return t.aiUsagePurposeAutoChat;
    case 'continue':
      return t.aiUsagePurposeContinue;
    case 'regenerate':
      return t.aiUsagePurposeRegenerate;
    case 'time_analysis':
      return t.aiUsagePurposeTimeAnalysis;
    case 'test':
      return t.aiUsagePurposeTest;
    case 'chat':
    default:
      return t.aiUsagePurposeChat;
  }
}

export function AiUsageModal({
  open,
  lang,
  usageState,
  onClose,
  onResetSession,
}: AiUsageModalProps) {
  const t = getUiText(lang);
  const [activeTab, setActiveTab] = useState<'session' | 'history'>('session');

  if (!open) {
    return null;
  }

  const renderSummaryCard = (
    title: string,
    totals: AiUsageTotals,
    accentClass: string,
    testId: string
  ) => {
    const extraEntries = Object.entries(totals.extraTokens).filter(
      ([, v]) => typeof v === 'number' && Number.isFinite(v)
    );
    return (
      <div
        data-testid={testId}
        className="flex flex-col gap-2.5 rounded-[10px] border border-[#3E3156] bg-[#2C223D] p-3.5"
      >
        <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-[#3D3054] pb-2">
          <span className={`text-[12.5px] font-bold ${accentClass}`}>{title}</span>
          <span className="rounded bg-[#211A2C] px-2 py-0.5 text-[10.5px] text-[#BEB5D0]">
            {t.aiUsageRequestsLabel}: {totals.requestCount}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11.5px]">
          <div className="rounded-[7px] bg-[#211A2C] px-2.5 py-2">
            <div className="text-[10px] text-[#9E93B3]">{t.aiUsageInputLabel}</div>
            <div className="mt-0.5 font-semibold text-[#EFEBF5]">
              {formatTokenCount(
                totals.inputTokens,
                totals.knownUsageRequestCount,
                totals.unknownUsageRequestCount,
                t.aiUsageUnknown,
                t.aiUsagePartialUnknownNote
              )}
            </div>
          </div>
          <div className="rounded-[7px] bg-[#211A2C] px-2.5 py-2">
            <div className="text-[10px] text-[#9E93B3]">{t.aiUsageOutputLabel}</div>
            <div className="mt-0.5 font-semibold text-[#EFEBF5]">
              {formatTokenCount(
                totals.outputTokens,
                totals.knownUsageRequestCount,
                totals.unknownUsageRequestCount,
                t.aiUsageUnknown,
                t.aiUsagePartialUnknownNote
              )}
            </div>
          </div>
          <div className="rounded-[7px] bg-[#211A2C] px-2.5 py-2">
            <div className="text-[10px] text-[#9E93B3]">{t.aiUsageTotalLabel}</div>
            <div className="mt-0.5 font-semibold text-[#64D2E6]">
              {formatTokenCount(
                totals.totalTokens,
                totals.knownUsageRequestCount,
                totals.unknownUsageRequestCount,
                t.aiUsageUnknown,
                t.aiUsagePartialUnknownNote
              )}
            </div>
          </div>
          <div className="rounded-[7px] bg-[#211A2C] px-2.5 py-2">
            <div className="text-[10px] text-[#9E93B3]">{t.aiUsageThinkingLabel}</div>
            <div className="mt-0.5 font-semibold text-[#DCD7E5]">
              {totals.thinkingTokens !== null
                ? totals.thinkingTokens.toLocaleString()
                : t.aiUsageUnknown}
            </div>
          </div>
          <div className="rounded-[7px] bg-[#211A2C] px-2.5 py-2">
            <div className="text-[10px] text-[#9E93B3]">{t.aiUsageCachedLabel}</div>
            <div className="mt-0.5 font-semibold text-[#55D8C1]">
              {totals.cachedTokens !== null
                ? totals.cachedTokens.toLocaleString()
                : t.aiUsageUnknown}
            </div>
          </div>
          <div className="rounded-[7px] bg-[#211A2C] px-2.5 py-2">
            <div className="text-[10px] text-[#9E93B3]">{t.aiUsageKnownRequestsLabel}</div>
            <div className="mt-0.5 font-semibold text-[#DCD7E5]">
              {totals.knownUsageRequestCount} / {totals.requestCount}
              {totals.unknownUsageRequestCount > 0
                ? ` (${t.aiUsageUnknownRequestsLabel}: ${totals.unknownUsageRequestCount})`
                : ''}
            </div>
          </div>
        </div>

        {extraEntries.length > 0 && (
          <div className="rounded-[7px] border border-[#3B2F52] bg-[#231B30] px-2.5 py-2">
            <div className="mb-1 text-[10px] font-medium text-[#9E93B3]">
              {t.aiUsageExtraLabel}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {extraEntries.map(([key, val]) => (
                <span
                  key={key}
                  className="rounded bg-[#322647] px-2 py-0.5 text-[10.5px] text-[#D7CFE5]"
                >
                  {key}: {val.toLocaleString()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const displayedRecords: AiUsageRecord[] =
    activeTab === 'session' ? usageState.sessionRecords : usageState.historyRecords;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.aiUsageModalTitle}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="nc-modal-enter flex max-h-[82dvh] w-full max-w-[680px] flex-col overflow-hidden rounded-[12px] border border-[#524468] bg-[#241C32] shadow-[0_22px_54px_rgba(0,0,0,0.72)] sm:max-h-[90dvh]"
      >
        <div className="flex shrink-0 items-start justify-between gap-2 border-b border-[#372B4A] bg-[#211A2C] px-4 py-3 sm:px-5 sm:py-3.5">
          <div className="min-w-0 flex-1">
            <h2 className="text-[15px] font-bold text-[#EFEBF5]">{t.aiUsageModalTitle}</h2>
            <p className="mt-1 text-[11.5px] leading-[1.45] text-[#9E93B3]">
              {t.aiUsageModalSub}
            </p>
          </div>
          <button
            type="button"
            data-action="close-ai-usage-modal"
            aria-label={t.closeModal}
            onClick={onClose}
            className="cursor-pointer rounded px-2 py-0.5 text-[16px] text-[#9A90A8] transition-colors hover:bg-[#382C4B] hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="nc-scroll min-h-0 flex-1 space-y-4 p-4 sm:p-5">
          <div className="rounded-[8px] border border-[#4A3D64] bg-[#2B223D] px-3 py-2 text-[11px] leading-[1.45] text-[#C8BFE0]">
            {t.aiUsageCostNotice}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {renderSummaryCard(
              t.aiUsageSessionTitle,
              usageState.session,
              'text-[#64D2E6]',
              'usage-summary-session'
            )}
            {renderSummaryCard(
              t.aiUsageHistoryTitle,
              usageState.history,
              'text-[#55D8C1]',
              'usage-summary-history'
            )}
          </div>

          <div className="space-y-2 rounded-[10px] border border-[#3E3156] bg-[#2C223D] p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-[12.5px] font-semibold text-[#EFEBF5]">
                {t.aiUsageBreakdownTitle}
              </div>
              <div className="flex items-center gap-1 rounded-[7px] bg-[#1E1729] p-0.5">
                <button
                  type="button"
                  data-action="usage-tab-session"
                  onClick={() => setActiveTab('session')}
                  className={`cursor-pointer rounded-[5px] px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    activeTab === 'session'
                      ? 'bg-[#4A3C63] text-white'
                      : 'text-[#9B90AD] hover:text-white'
                  }`}
                >
                  {t.aiUsageFilterSession} ({usageState.sessionRecords.length})
                </button>
                <button
                  type="button"
                  data-action="usage-tab-history"
                  onClick={() => setActiveTab('history')}
                  className={`cursor-pointer rounded-[5px] px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    activeTab === 'history'
                      ? 'bg-[#4A3C63] text-white'
                      : 'text-[#9B90AD] hover:text-white'
                  }`}
                >
                  {t.aiUsageFilterHistory} ({usageState.historyRecords.length})
                </button>
              </div>
            </div>

            {displayedRecords.length === 0 ? (
              <div className="rounded-[7px] bg-[#211A2C] px-3 py-5 text-center text-[11.5px] text-[#958AA8]">
                {t.aiUsageNoRecords}
              </div>
            ) : (
              <div className="nc-scroll max-h-[250px] space-y-1.5 pr-0.5">
                {displayedRecords.map((rec) => {
                  const recExtras = rec.extraTokens
                    ? Object.entries(rec.extraTokens).filter(([, v]) => v > 0)
                    : [];
                  return (
                    <div
                      key={rec.id}
                      data-testid="usage-record-row"
                      className="rounded-[8px] border border-[#3B2E52] bg-[#211A2C] px-3 py-2 text-[11px]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                          <span className="font-semibold text-[#EFEBF5]">
                            {rec.characterName || rec.characterId}
                          </span>
                          <span className="rounded bg-[#362B4A] px-1.5 py-0.5 text-[9.5px] text-[#DCD7E5]">
                            {getPurposeLabel(rec.purpose, t)}
                          </span>
                          <span className="rounded bg-[#2E2440] px-1.5 py-0.5 text-[9.5px] text-[#A89DBD]">
                            {rec.protocol} · {rec.model}
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[9.5px] font-medium ${
                              rec.status === 'ok'
                                ? 'bg-[#55D8C1]/15 text-[#55D8C1]'
                                : 'bg-[#EB7F97]/20 text-[#FFB6C7]'
                            }`}
                          >
                            {rec.status === 'ok' ? t.aiUsageStatusOk : t.aiUsageStatusError}
                          </span>
                          {typeof rec.latencyMs === 'number' && (
                            <span className="text-[10px] text-[#9B90AD]">{rec.latencyMs}ms</span>
                          )}
                          <span className="text-[10px] text-[#8E83A3]">
                            {formatClockTime(rec.timestampIso)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[10.5px] text-[#BEB5D0]">
                        <span>
                          {t.aiUsageInputLabel}:{' '}
                          <strong className="text-[#EFEBF5]">
                            {formatRecordMetric(rec.inputTokens, rec.usageKnown, t.aiUsageUnknown)}
                          </strong>
                        </span>
                        <span>
                          {t.aiUsageOutputLabel}:{' '}
                          <strong className="text-[#EFEBF5]">
                            {formatRecordMetric(rec.outputTokens, rec.usageKnown, t.aiUsageUnknown)}
                          </strong>
                        </span>
                        <span>
                          {t.aiUsageTotalLabel}:{' '}
                          <strong className="text-[#64D2E6]">
                            {formatRecordMetric(rec.totalTokens, rec.usageKnown, t.aiUsageUnknown)}
                          </strong>
                        </span>
                        {rec.thinkingTokens !== null && (
                          <span>
                            {t.aiUsageThinkingLabel}:{' '}
                            <strong className="text-[#EFEBF5]">
                              {rec.thinkingTokens.toLocaleString()}
                            </strong>
                          </span>
                        )}
                        {rec.cachedTokens !== null && (
                          <span>
                            {t.aiUsageCachedLabel}:{' '}
                            <strong className="text-[#55D8C1]">
                              {rec.cachedTokens.toLocaleString()}
                            </strong>
                          </span>
                        )}
                        {recExtras.map(([k, v]) => (
                          <span key={k}>
                            {k}: <strong className="text-[#EFEBF5]">{v.toLocaleString()}</strong>
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-[#372B4A] bg-[#211A2C] px-4 py-3">
          <button
            type="button"
            data-action="usage-reset-session"
            onClick={onResetSession}
            className="h-[34px] cursor-pointer rounded-[7px] border border-[#5B354B] bg-[#352030] px-3 text-[11.5px] font-medium text-[#FFB6C7] transition-colors hover:border-[#EB7F97]/70 hover:bg-[#48273B] hover:text-white"
          >
            {t.aiUsageResetSessionBtn}
          </button>
          <button
            type="button"
            data-action="usage-modal-close"
            onClick={onClose}
            className="h-[34px] cursor-pointer rounded-[7px] bg-[#52436B] px-4 text-[12px] font-semibold text-white transition-colors hover:bg-[#645283]"
          >
            {t.closeModal}
          </button>
        </div>
      </div>
    </div>
  );
}
