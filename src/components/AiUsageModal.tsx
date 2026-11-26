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

  const renderSummaryBlock = (
    title: string,
    totals: AiUsageTotals,
    dotClass: string,
    testId: string
  ) => {
    const extraEntries = Object.entries(totals.extraTokens).filter(
      ([, v]) => typeof v === 'number' && Number.isFinite(v)
    );
    const rows: { label: string; value: string; highlight?: boolean }[] = [
      {
        label: t.aiUsageTotalLabel,
        value: formatTokenCount(
          totals.totalTokens,
          totals.knownUsageRequestCount,
          totals.unknownUsageRequestCount,
          t.aiUsageUnknown,
          t.aiUsagePartialUnknownNote
        ),
        highlight: true,
      },
      {
        label: t.aiUsageInputLabel,
        value: formatTokenCount(
          totals.inputTokens,
          totals.knownUsageRequestCount,
          totals.unknownUsageRequestCount,
          t.aiUsageUnknown,
          t.aiUsagePartialUnknownNote
        ),
      },
      {
        label: t.aiUsageOutputLabel,
        value: formatTokenCount(
          totals.outputTokens,
          totals.knownUsageRequestCount,
          totals.unknownUsageRequestCount,
          t.aiUsageUnknown,
          t.aiUsagePartialUnknownNote
        ),
      },
      {
        label: t.aiUsageThinkingLabel,
        value:
          totals.thinkingTokens !== null ? totals.thinkingTokens.toLocaleString() : t.aiUsageUnknown,
      },
      {
        label: t.aiUsageCachedLabel,
        value: totals.cachedTokens !== null ? totals.cachedTokens.toLocaleString() : t.aiUsageUnknown,
      },
      {
        label: t.aiUsageKnownRequestsLabel,
        value:
          totals.unknownUsageRequestCount > 0
            ? `${totals.knownUsageRequestCount} / ${totals.requestCount} (${t.aiUsageUnknownRequestsLabel}: ${totals.unknownUsageRequestCount})`
            : `${totals.knownUsageRequestCount} / ${totals.requestCount}`,
      },
    ];

    return (
      <div
        data-testid={testId}
        className="flex flex-col rounded-[8px] border border-[#453859] bg-[#241C32] p-3.5"
      >
        <div className="flex items-center justify-between gap-2 border-b border-[#382C4A] pb-2.5">
          <span className="flex items-center gap-2 text-[12.5px] font-bold text-[#EFEBF5]">
            <span className={`h-2 w-2 rounded-full ${dotClass}`} />
            <span>{title}</span>
          </span>
          <span className="font-mono text-[11px] tabular-nums text-[#9A90A8]">
            {t.aiUsageRequestsLabel} {totals.requestCount}
          </span>
        </div>

        <dl className="mt-2 divide-y divide-[#332844] text-[12px]">
          {rows.map((row) => (
            <div key={row.label} className="flex items-baseline justify-between gap-3 py-1.5">
              <dt className="shrink-0 text-[#9A90A8]">{row.label}</dt>
              <dd
                className={`min-w-0 text-right font-mono text-[11.5px] tabular-nums ${
                  row.highlight ? 'font-bold text-[#64D2E6]' : 'font-medium text-[#EFEBF5]'
                }`}
              >
                {row.value}
              </dd>
            </div>
          ))}
        </dl>

        {extraEntries.length > 0 && (
          <div className="mt-2 border-t border-[#382C4A] pt-2 text-[11px] text-[#9A90A8]">
            <span>{t.aiUsageExtraLabel}: </span>
            <span className="font-mono tabular-nums text-[#DCD7E5]">
              {extraEntries.map(([k, v]) => `${k} ${v.toLocaleString()}`).join(' · ')}
            </span>
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-3 sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="nc-modal-enter flex max-h-[85dvh] w-full max-w-[680px] flex-col overflow-hidden rounded-[12px] border border-[#524468] bg-[#2E243D] shadow-[0_24px_60px_rgba(0,0,0,0.68)] sm:max-h-[90dvh]"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#241C30] bg-[#211A2C] px-4 py-3 sm:px-5 sm:py-3.5">
          <div className="min-w-0 flex-1">
            <h2 className="text-[15px] font-bold text-[#EFEBF5]">{t.aiUsageModalTitle}</h2>
            <p className="mt-1 text-[11.5px] leading-[1.45] text-[#9A90A8]">
              {t.aiUsageModalSub}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 pt-1" aria-hidden="true">
            <span className="h-[9px] w-[9px] rounded-full bg-[#64D2E6]" />
            <span className="h-[9px] w-[9px] rounded-full bg-[#F6CE71]" />
            <span className="h-[9px] w-[9px] rounded-full bg-[#EB7F97]" />
          </div>
        </div>

        <div className="nc-scroll min-h-0 flex-1 space-y-4 p-4 sm:p-5">
          <p className="border-l-2 border-[#64D2E6]/65 bg-[#241C32] px-3 py-2 text-[11.5px] leading-[1.5] text-[#C5BBD6]">
            {t.aiUsageCostNotice}
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {renderSummaryBlock(
              t.aiUsageSessionTitle,
              usageState.session,
              'bg-[#64D2E6]',
              'usage-summary-session'
            )}
            {renderSummaryBlock(
              t.aiUsageHistoryTitle,
              usageState.history,
              'bg-[#F6CE71]',
              'usage-summary-history'
            )}
          </div>

          <div className="space-y-2.5 border-t border-[#3F3352] pt-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-[12.5px] font-semibold text-[#EFEBF5]">
                {t.aiUsageBreakdownTitle}
              </div>
              <div className="flex items-center gap-1 rounded-[6px] bg-[#211A2C] p-0.5">
                <button
                  type="button"
                  data-action="usage-tab-session"
                  onClick={() => setActiveTab('session')}
                  className={`cursor-pointer rounded-[5px] px-2.5 py-1 text-[11px] font-medium tabular-nums transition-colors ${
                    activeTab === 'session'
                      ? 'bg-[#4A3C63] text-white'
                      : 'text-[#9A90A8] hover:text-white'
                  }`}
                >
                  {t.aiUsageFilterSession} ({usageState.sessionRecords.length})
                </button>
                <button
                  type="button"
                  data-action="usage-tab-history"
                  onClick={() => setActiveTab('history')}
                  className={`cursor-pointer rounded-[5px] px-2.5 py-1 text-[11px] font-medium tabular-nums transition-colors ${
                    activeTab === 'history'
                      ? 'bg-[#4A3C63] text-white'
                      : 'text-[#9A90A8] hover:text-white'
                  }`}
                >
                  {t.aiUsageFilterHistory} ({usageState.historyRecords.length})
                </button>
              </div>
            </div>

            {displayedRecords.length === 0 ? (
              <div className="rounded-[7px] border border-[#453859] bg-[#241C32] px-3 py-5 text-center text-[11.5px] text-[#9A90A8]">
                {t.aiUsageNoRecords}
              </div>
            ) : (
              <div className="nc-scroll max-h-[250px] divide-y divide-[#382C4A] rounded-[8px] border border-[#453859] bg-[#241C32]">
                {displayedRecords.map((rec) => {
                  const recExtras = rec.extraTokens
                    ? Object.entries(rec.extraTokens).filter(([, v]) => v > 0)
                    : [];
                  return (
                    <div
                      key={rec.id}
                      data-testid="usage-record-row"
                      className="px-3.5 py-2.5 text-[11.5px]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex min-w-0 flex-wrap items-center gap-1.5 text-[#EFEBF5]">
                          <span
                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                              rec.status === 'ok' ? 'bg-[#64D2E6]' : 'bg-[#EB7F97]'
                            }`}
                          />
                          <span className="font-semibold">
                            {rec.characterName || rec.characterId}
                          </span>
                          <span className="text-[#7C7191]" aria-hidden="true">·</span>
                          <span className="text-[#DCD7E5]">{getPurposeLabel(rec.purpose, t)}</span>
                          <span className="text-[#7C7191]" aria-hidden="true">·</span>
                          <span className="text-[11px] text-[#9A90A8]">
                            {rec.protocol} / {rec.model}
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 font-mono text-[10.5px] tabular-nums text-[#9A90A8]">
                          <span className={rec.status === 'ok' ? 'text-[#64D2E6]' : 'text-[#EB7F97]'}>
                            {rec.status === 'ok' ? t.aiUsageStatusOk : t.aiUsageStatusError}
                          </span>
                          {typeof rec.latencyMs === 'number' && <span>{rec.latencyMs}ms</span>}
                          <span>{formatClockTime(rec.timestampIso)}</span>
                        </div>
                      </div>

                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 pl-3 font-mono text-[11px] tabular-nums text-[#9A90A8]">
                        <span>
                          {t.aiUsageInputLabel}{' '}
                          <strong className="font-medium text-[#DCD7E5]">
                            {formatRecordMetric(rec.inputTokens, rec.usageKnown, t.aiUsageUnknown)}
                          </strong>
                        </span>
                        <span>
                          {t.aiUsageOutputLabel}{' '}
                          <strong className="font-medium text-[#DCD7E5]">
                            {formatRecordMetric(rec.outputTokens, rec.usageKnown, t.aiUsageUnknown)}
                          </strong>
                        </span>
                        <span>
                          {t.aiUsageTotalLabel}{' '}
                          <strong className="font-semibold text-[#64D2E6]">
                            {formatRecordMetric(rec.totalTokens, rec.usageKnown, t.aiUsageUnknown)}
                          </strong>
                        </span>
                        {rec.thinkingTokens !== null && (
                          <span>
                            {t.aiUsageThinkingLabel}{' '}
                            <strong className="font-medium text-[#DCD7E5]">
                              {rec.thinkingTokens.toLocaleString()}
                            </strong>
                          </span>
                        )}
                        {rec.cachedTokens !== null && (
                          <span>
                            {t.aiUsageCachedLabel}{' '}
                            <strong className="font-medium text-[#DCD7E5]">
                              {rec.cachedTokens.toLocaleString()}
                            </strong>
                          </span>
                        )}
                        {recExtras.map(([k, v]) => (
                          <span key={k}>
                            {k}{' '}
                            <strong className="font-medium text-[#DCD7E5]">
                              {v.toLocaleString()}
                            </strong>
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

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-[#241C30] bg-[#261D33] px-4 py-3 sm:px-5">
          <button
            type="button"
            data-action="usage-reset-session"
            onClick={onResetSession}
            className="h-[34px] cursor-pointer rounded-[6px] border border-[#6E3B4E] bg-[#36202E] px-3 text-[11.5px] font-medium text-[#F2B3C2] transition-colors hover:border-[#EB7F97]/75 hover:bg-[#47293B] hover:text-white"
          >
            {t.aiUsageResetSessionBtn}
          </button>
          <button
            type="button"
            data-action="usage-modal-close"
            onClick={onClose}
            className="h-[34px] cursor-pointer rounded-[6px] bg-[#5C4D74] px-4 text-[12px] font-bold text-white transition-colors hover:bg-[#6D5C8A]"
          >
            {t.closeModal}
          </button>
        </div>
      </div>
    </div>
  );
}
