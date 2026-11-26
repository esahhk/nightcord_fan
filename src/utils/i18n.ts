import type { UiLanguage } from '../types/nightcord';

export interface UiText {
  guideTitle: string;
  stepBadges: [string, string, string, string, string, string];
  step1Title: string;
  step1Desc: string;
  step1Note: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  step3Label: string;
  step4Title: string;
  step4Desc: string;
  step4Label: string;
  step5Title: string;
  step5Desc: string;
  step5Label: string;
  step6Title: string;
  step6Desc: string;
  step6Label: string;
  skip: string;
  back: string;
  next: string;
  start: string;
  convListTitle: string;
  templateBadge: string;
  createConvTitle: string;
  createConvPlaceholder: string;
  copyTemplateLabel: string;
  createConvBtn: string;
  langLabel: string;
  editChar: string;
  addChar: string;
  sendImage: string;
  recordVoice: string;
  audioFile: string;
  recording: string;
  send: string;
  stopCancel: string;
  charNamePlaceholder: string;
  chooseImage: string;
  cancel: string;
  save: string;
  add: string;
  imageModalTitle: string;
  imageModeLabel: string;
  imageModeCard: string;
  imageModeCardSub: string;
  imageModeFull: string;
  imageModeFullSub: string;
  imageFilenameLabel: string;
  imageFilenamePlaceholder: string;
  emptyConvTitle: (title: string) => string;
  emptyConvSub: string;
  studioInputPlaceholder: (name: string) => string;
  toastStudioMode: string;
  toastConvCreated: (title: string) => string;
  toastConvDeleted: string;
  toastCharSaved: (name: string) => string;
  toastImageSaved: string;
  toastAudioSaved: string;
  toastVoiceSaved: string;
  toastMicUnsupported: string;
  toastMicDenied: string;
  toastBoldOn: string;
  toastBoldOff: string;
  toastMuted: (name: string) => string;
  toastUnmuted: (name: string) => string;
  toastProfile: (name: string) => string;
  toastDownloading: (filename: string, sizeLabel: string) => string;
  dataSectionTitle: string;
  exportDataBtn: string;
  importDataBtn: string;
  clearCacheBtn: string;
  clearModalTitle: string;
  clearStep1Badge: string;
  clearStep2Badge: string;
  clearStep1Heading: string;
  clearStep1Desc: string;
  clearStep1Next: string;
  clearStep2Heading: string;
  clearStep2Desc: string;
  clearStep2Confirm: string;
  toastExportSuccess: string;
  toastImportSuccess: (count: number, aiCount?: number) => string;
  toastImportInvalid: string;
  toastCacheCleared: string;
  timeBtnLabel: string;
  timeCustomToggle: string;
  timeMinHint: (minTs: string) => string;
  timeAnyHint: string;
  timeEarlierError: (minTs: string) => string;
  timeResetNow: string;
  playbackModalTitle: string;
  playbackModalSub: string;
  playbackPacingLabel: string;
  playbackTimelineTitle: string;
  playbackTimelineSub: string;
  playbackEvenTitle: string;
  playbackEvenSub: string;
  playbackIntervalLabel: (sec: number) => string;
  playbackStartLabel: string;
  playbackStartEmpty: string;
  playbackStartFromMsg: (index: number, username: string, timestamp: string, preview: string) => string;
  playbackNoMessages: string;
  playbackStartBtn: string;
  playbackCapNote: string;
  toastPlaybackDone: string;
  playbackAnchorLabel: string;
  playbackAnchorTodayTitle: string;
  playbackAnchorTodaySub: string;
  playbackAnchorFlowTitle: string;
  playbackAnchorFlowSub: string;
  linksSectionTitle: string;
  reportIssueLabel: string;
  setOfflineBtn: string;
  setOnlineBtn: string;
  toastMemberOnline: (name: string) => string;
  toastMemberOffline: (name: string) => string;
  mentionTargetBtn: (name: string) => string;
  mentionPickerTitle: string;
  deleteMessageBtn: string;
  toastMessageDeleted: string;
  sendMp4: string;
  sendMp3: string;
  sendFile: string;
  fileModalTitle: string;
  toastFileSaved: string;
  yearUnit: string;
  monthUnit: string;
  dayUnit: string;
  statusOnlineBtn: string;
  statusVoiceBtn: string;
  statusOfflineBtn: string;
  toastMemberVoice: (name: string) => string;
  removeCharBtn: string;
  toastCharRemoved: (name: string) => string;
  toastCannotRemoveLastChar: string;
  homepageLabel: string;
  tutorialLabel: string;
  githubLabel: string;
  bilibiliLabel: string;
  playbackTimelineModeLabel: string;
  playbackTimelineExact: string;
  playbackTimelineExactSub: string;
  playbackTimelineProp: string;
  playbackTimelinePropSub: string;
  playbackSpeedLabel: (scale: number) => string;
  videoTutorialSectionLabel: string;
  videoTutorialTitle: string;
  youtubeTutorialTitle: string;
  videoTutorialBtn: string;
  templatePageBtn: string;
  templatePageTitle: string;
  templatePageSubtitle: string;
  templateBackBtn: string;
  templatePreviewTitle: string;
  templatePreviewDesktop: string;
  templatePreviewMobile: string;
  templatePaletteTitle: string;
  templateCodeTitle: string;
  templateCopyCodeBtn: string;
  templateCopiedBtn: string;
  templateDownloadBtn: string;
  templateArchitectureTitle: string;
  templateArchitectureDesc: string;
  templateLicenseNote: string;
  templateCopiedColor: (hex: string) => string;
  statusAddTimeToggle: string;
  statusAddTimeHint: string;
  statusTimeInvalid: string;
  statusTimeSyncBtn: string;
  statusScheduledListLabel: (count: number) => string;
  toastStatusEventAdded: (name: string, statusLabel: string, timeLabel: string) => string;
  toastStatusEventRemoved: string;
  toastStatusEventsCleared: string;
  playbackStatusSyncLabel: string;
  playbackStatusSyncOnTitle: string;
  playbackStatusSyncOnSub: (count: number) => string;
  playbackStatusSyncOffTitle: string;
  playbackStatusSyncOffSub: string;
  playbackStatusEventsManage: (count: number) => string;
  playbackClearStatusEventsBtn: string;
  aiModeBtn: string;
  aiModeBackBtn: string;
  aiModeActiveBadge: string;
  aiCharSettingsBtn: string;
  aiReadyBadge: string;
  aiUnconfiguredBadge: string;
  aiCharModalTitle: (name: string) => string;
  aiProtocolLabel: string;
  aiProtocolOpenai: string;
  aiProtocolDeepseek: string;
  aiProtocolGemini: string;
  aiProtocolAnthropic: string;
  aiBaseUrlLabel: string;
  aiBaseUrlHint: string;
  aiResetDefaultUrl: string;
  aiApiKeyLabel: string;
  aiApiKeyPlaceholder: string;
  aiLocalOnlyNote: string;
  aiUsingGlobalKeyBadge: string;
  aiModelLabel: string;
  aiFetchModelsBtn: string;
  aiFetchingModels: string;
  aiFetchModelsOk: (count: number) => string;
  aiFetchModelsFail: string;
  aiCustomModelPlaceholder: string;
  aiPromptLabel: string;
  aiPromptPlaceholder: string;
  toastAiCharSaved: (name: string) => string;
  aiGlobalModalTitle: string;
  aiGlobalModalSub: string;
  aiGlobalTabProfile: string;
  aiGlobalTabChat: string;
  aiGlobalTabApi: string;
  aiGlobalApiToggle: string;
  aiGlobalApiDesc: string;
  aiFollowUpToggle: string;
  aiFollowUpDesc: string;
  aiFollowUpProbLabel: (prob: number) => string;
  aiUserIdentityTitle: string;
  aiUserNamePlaceholder: string;
  aiUserAvatarLabel: string;
  aiUploadAvatarBtn: string;
  aiResetAvatarBtn: string;
  aiUserPersonaLabel: string;
  aiUserPersonaPlaceholder: string;
  aiWorldviewTitle: string;
  aiWorldviewPlaceholder: string;
  aiTimeModeTitle: string;
  aiTimeModeRealtime: string;
  aiTimeModeRealtimeSub: string;
  aiTimeModeInferred: string;
  aiTimeModeInferredSub: string;
  aiCharPromptSectionTitle: string;
  aiCharPromptSectionDesc: string;
  aiConfiguredCharsCount: (ready: number, total: number) => string;
  toastAiGlobalSaved: string;
  aiEmptyTitle: (title: string) => string;
  aiEmptySub: string;
  aiEmptyReadySummary: (ready: number, total: number) => string;
  aiOpenGlobalQuickBtn: string;
  aiOpenGuideBtn: string;
  aiHeaderGuideBtn: string;
  aiOwnKeyBadge: string;
  aiNoKeyStatusBadge: string;
  aiOfflineStatusBadge: string;
  aiGeneratingStatus: (name: string) => string;
  aiToastBusy: string;
  aiToastNoConfiguredChar: string;
  aiToastAllOffline: string;
  aiToastCharOffline: (name: string) => string;
  aiToastTargetMissingKey: (name: string) => string;
  aiToastRequestFailed: (name: string, reason: string) => string;
  aiGuideTitle: string;
  aiGuideBadges: [string, string, string, string, string];
  aiGuideStep1Title: string;
  aiGuideStep1Desc: string;
  aiGuideStep1Note: string;
  aiGuideStep2Title: string;
  aiGuideStep2Desc: string;
  aiGuideStep3Title: string;
  aiGuideStep3Desc: string;
  aiGuideStep4Title: string;
  aiGuideStep4Desc: string;
  aiGuideStep5Title: string;
  aiGuideStep5Desc: string;
  aiGuideOpenConfigBtn: string;
  editMessageBtn: string;
  regenerateMessageBtn: string;
  saveEditBtn: string;
  toastMessageUpdated: string;
  aiHeaderContinueBtn: string;
  aiHeaderStopBtn: string;
  aiHeaderSettingsBtn: string;
  aiDropdownSettingsBtn: string;
  aiDropdownContinueBtn: string;
  aiDropdownAutoChatBtn: string;
  aiUserAvatarPresetLabel: string;
  aiReplyLengthLabel: string;
  aiReplyLengthShort: string;
  aiReplyLengthNormal: string;
  aiReplyLengthDetailed: string;
  aiTemperatureLabel: (temp: number) => string;
  aiCharTempUseGlobalBtn: string;
  aiFillPresetBtn: string;
  aiToastPresetFilled: (name: string) => string;
  aiTestConnBtn: string;
  aiTestingConnBtn: string;
  aiTestConnOk: (latencyMs: number, model: string) => string;
  aiTestConnFail: (detail: string) => string;
  aiExportTranscriptBtn: string;
  aiToastTranscriptExported: string;
  aiToastAborted: string;
  aiToastPartialOffline: (names: string) => string;
  aiToastPartialMissingKey: (names: string) => string;
  aiWebSearchToggle: string;
  aiWebSearchDesc: string;
  aiGuideMenuBtn: string;
  aiCopyToMainBtn: string;
  copyAiToMainModalTitle: string;
  copyAiToMainModalSub: string;
  copyAiToMainLabel: string;
  copyAiToMainPlaceholder: string;
  copyAiToMainSummary: (count: number) => string;
  copyAiToMainConfirm: string;
  toastCopiedAiToMain: (title: string) => string;
  aiAutoChatModalTitle: string;
  aiAutoChatModalSub: string;
  aiAutoChatRandomPresenceToggle: string;
  aiAutoChatRandomPresenceDesc: string;
  aiAutoChatIntervalLabel: (sec: number) => string;
  aiAutoChatStartBtn: string;
  aiAutoChatToastStarted: string;
  aiAutoChatToastStopped: string;
  aiAutoChatHeaderStopBtn: string;
  aiTimeFrequencyLabel: string;
  aiTimeFreqHigh: string;
  aiTimeFreqHighDesc: string;
  aiTimeFreqSomewhatHigh: string;
  aiTimeFreqSomewhatHighDesc: string;
  aiTimeFreqBalanced: string;
  aiTimeFreqBalancedDesc: string;
  aiTimeFreqSomewhatLow: string;
  aiTimeFreqSomewhatLowDesc: string;
  aiTimeFreqLow: string;
  aiTimeFreqLowDesc: string;
  aiOutputLanguageLabel: string;
  aiOutputLanguageHint: string;
  aiOutputLangAuto: string;
  aiOutputLangZhCn: string;
  aiOutputLangZhTw: string;
  aiOutputLangEn: string;
  aiOutputLangJa: string;
  aiUsageBtn: string;
  aiUsageModalTitle: string;
  aiUsageModalSub: string;
  aiUsageSessionTitle: string;
  aiUsageHistoryTitle: string;
  aiUsageResetSessionBtn: string;
  closeModal: string;
  aiUsageToastSessionReset: string;
  aiUsageRequestsLabel: string;
  aiUsageKnownRequestsLabel: string;
  aiUsageUnknownRequestsLabel: string;
  aiUsageInputLabel: string;
  aiUsageOutputLabel: string;
  aiUsageTotalLabel: string;
  aiUsageThinkingLabel: string;
  aiUsageCachedLabel: string;
  aiUsageExtraLabel: string;
  aiUsageUnknown: string;
  aiUsagePartialUnknownNote: (unknownCount: number) => string;
  aiUsageCostNotice: string;
  aiUsageBreakdownTitle: string;
  aiUsageFilterSession: string;
  aiUsageFilterHistory: string;
  aiUsageNoRecords: string;
  aiUsageStatusOk: string;
  aiUsageStatusError: string;
  aiUsagePurposeChat: string;
  aiUsagePurposeFollowUp: string;
  aiUsagePurposeAutoChat: string;
  aiUsagePurposeContinue: string;
  aiUsagePurposeRegenerate: string;
  aiUsagePurposeTimeAnalysis: string;
  aiUsagePurposeTest: string;
}

const JA_TEXT: UiText = {
  guideTitle: 'nightcord ガイド',
  stepBadges: [
    'ステップ 1 / 6',
    'ステップ 2 / 6',
    'ステップ 3 / 6',
    'ステップ 4 / 6',
    'ステップ 5 / 6',
    'ステップ 6 / 6',
  ],
  step1Title: 'ガイドと操作UIの言語を選択',
  step1Desc:
    'ガイドと編集メニューの表示言語を選択してください。選択はローカルに保存されます。',
  step1Note:
    '※ 初期状態は「没入モード（閲覧専用・メッセージ送信不可）」で起動します。キャラクター名や没入モードの画面テキストは日本語のまま保持されます。',
  step2Title: '会話切替・AIモード・UIテンプレート',
  step2Desc:
    '左上の「25時、ナイトコードで。▾」から会話の切替／新規作成、AIチャットモードへの移動、UIテンプレートの閲覧、ローカルデータの書き出し／読み込みができます。',
  step3Title: 'キャラ切替・メディア送信・状態予約',
  step3Desc:
    '右上の青い点（1番目）を押すとロール切替モードになり、メッセージ送信が可能になります。キャラ追加・画像/MP4/MP3送信・日時指定・メンバー長押しでの状態変更や「状態切替に時間を設定」が使えます。',
  step3Label: 'ロール切替・送信可能',
  step4Title: '没入モード（閲覧専用）に切り替え',
  step4Desc:
    '右上の黄色い点（2番目）を押すと編集ボタンがすべて隠れ、メッセージ送信も無効になった没入モードに戻ります。',
  step4Label: '没入モード・送信不可',
  step5Title: '自動再生モード（赤い点）',
  step5Desc:
    '右上の赤い点（3番目）を押すと自動で没入モードに切り替わり、メッセージやメンバーのオンライン切替を1件ずつ順番に再生できます。流速や固定間隔（0.5秒〜60秒）、日時基準を設定できます。',
  step5Label: '自動再生モード',
  step6Title: 'AIチャットモード（完全ローカル直連）',
  step6Desc:
    'メニューの「AIチャットモード」に入ると、没入モードのまま直接送信してAIキャラと会話できます。DeepSeek等のAPI設定、Web検索、通話/テキスト/ミュート状態連動、自分のプロフィール＆世界観、頻度別AI時刻ツール、出力言語切替、API使用量モニター、黄色い点での自動フリートーク、通常モードへの会話コピーを備えています。',
  step6Label: 'AIチャットモード',
  skip: 'スキップ',
  back: '戻る',
  next: '次へ',
  start: 'はじめる',
  convListTitle: '会話一覧',
  templateBadge: 'テンプレ',
  createConvTitle: '新しい会話を作成',
  createConvPlaceholder: '会話名を入力（例：雑談）',
  copyTemplateLabel: 'テンプレートの会話をコピー',
  createConvBtn: '+ 会話を追加',
  langLabel: '操作言語',
  editChar: '編集',
  addChar: '+ キャラ追加',
  sendImage: '画像',
  recordVoice: '録音',
  audioFile: '音声ファイル',
  recording: '録音中',
  send: '送信',
  stopCancel: '中止',
  charNamePlaceholder: 'キャラクター名を入力',
  chooseImage: '画像を選択',
  cancel: 'キャンセル',
  save: '保存',
  add: '追加',
  imageModalTitle: '画像の送信形式を選択',
  imageModeLabel: '表示スタイル',
  imageModeCard: 'ファイル名カードのみ',
  imageModeCardSub: '原図を隠して元の画面と同じカードで表示',
  imageModeFull: '原図をそのまま表示',
  imageModeFullSub: 'チャット内に画像プレビューを表示',
  imageFilenameLabel: 'ファイル名',
  imageFilenamePlaceholder: '例：ラフC.jpg',
  emptyConvTitle: (title) => `${title} の会話をはじめましょう`,
  emptyConvSub: '右上の青い点（1番目）でロール切替モードにするとメッセージを送信できます',
  studioInputPlaceholder: (name) => `${name} としてメッセージを送信`,
  toastStudioMode: 'ロール切替モードに切り替えました',
  toastConvCreated: (title) => `会話「${title}」を作成しました`,
  toastConvDeleted: '会話を削除しました',
  toastCharSaved: (name) => `キャラクター「${name}」を保存しました`,
  toastImageSaved: '画像をローカルに保存して送信しました',
  toastAudioSaved: '音声をローカルに保存して送信しました',
  toastVoiceSaved: 'ボイスメッセージをローカルに保存しました',
  toastMicUnsupported: '録音非対応のため音声ファイルを選択してください',
  toastMicDenied: 'マイク許可がないため音声ファイルを選択してください',
  toastBoldOn: '太字モードをオンにしました',
  toastBoldOff: '太字モードをオフにしました',
  toastMuted: (name) => `${name} をミュートにしました`,
  toastUnmuted: (name) => `${name} のミュートを解除しました`,
  toastProfile: (name) => `${name} のプロフィール`,
  toastDownloading: (filename, sizeLabel) => `${filename} (${sizeLabel}) をダウンロード中...`,
  dataSectionTitle: 'ローカルデータ管理',
  exportDataBtn: '書出し',
  importDataBtn: '読込み',
  clearCacheBtn: 'ローカルキャッシュを全消去',
  clearModalTitle: 'ローカルキャッシュの消去',
  clearStep1Badge: '確認 1 / 2',
  clearStep2Badge: '最終確認 2 / 2',
  clearStep1Heading: 'ローカル保存データを初期化しますか？',
  clearStep1Desc:
    '作成した会話・送信したメッセージ・カスタムキャラ・ローカル保存の画像や音声がすべて削除され、初期テンプレートに戻ります。',
  clearStep1Next: '次へ進む',
  clearStep2Heading: '本当にすべて削除しますか？',
  clearStep2Desc:
    'この操作は取り消せません。必要なデータがある場合は、先に「ファイルに書き出し」でバックアップしてください。',
  clearStep2Confirm: '完全に消去する',
  toastExportSuccess: '会話・AI設定・ローカルメディアをバックアップファイルに書き出しました',
  toastImportSuccess: (count, aiCount = 0) =>
    aiCount > 0
      ? `ローカルデータを読み込みました（通常 ${count}件 / AI ${aiCount}件）`
      : `ローカルデータを読み込みました（${count}件の会話）`,
  toastImportInvalid: 'ファイルの形式が正しくありません',
  toastCacheCleared: 'ローカルキャッシュを消去しました',
  timeBtnLabel: '時刻',
  timeCustomToggle: '送信時刻を指定',
  timeMinHint: (minTs) => `${minTs} 以降のみ指定できます`,
  timeAnyHint: '任意の時刻を指定できます',
  timeEarlierError: (minTs) => `前のメッセージ（${minTs}）より前の時刻は指定できません`,
  timeResetNow: '現在時刻に合わせる',
  playbackModalTitle: 'メッセージ自動再生',
  playbackModalSub: '没入モードでメッセージを1件ずつ順番に表示します。',
  playbackPacingLabel: '送信ペース',
  playbackTimelineTitle: '送信時刻の流速で送信',
  playbackTimelineSub: '完全実時間または等比例スピードで時間差を再現',
  playbackEvenTitle: '固定時間間隔で送信',
  playbackEvenSub: 'すべてのメッセージを一定の間隔で再生（0.5秒〜60秒）',
  playbackIntervalLabel: (sec) => `固定送信間隔：${sec}秒`,
  playbackStartLabel: '開始位置',
  playbackStartEmpty: 'メッセージなし（最初から順番に表示）',
  playbackStartFromMsg: (index, username, timestamp, preview) =>
    `${index}件目から開始（${username}・${timestamp}）${preview}`,
  playbackNoMessages: '再生できるメッセージがありません。先にロール切替モードで作成してください。',
  playbackStartBtn: '開始',
  playbackCapNote: '※ すべての送信間隔は最短0.5秒です。再生中に赤い点をもう一度押すと設定を開き直せます。',
  toastPlaybackDone: 'メッセージの自動再生が完了しました',
  playbackAnchorLabel: '日時の基準',
  playbackAnchorTodayTitle: '今日の日時に固定する',
  playbackAnchorTodaySub: '同月の過去は「13日 23:13」、別月・別年は「2021年6月17日 15:30」表示',
  playbackAnchorFlowTitle: '再生中のメッセージ日時を基準',
  playbackAnchorFlowSub: '開始メッセージを「今日」とし、24時を過ぎると前日が「昨日」に変化',
  linksSectionTitle: 'リンク・お問い合わせ',
  reportIssueLabel: '不具合報告',
  setOfflineBtn: 'オフラインにする',
  setOnlineBtn: 'オンラインにする',
  toastMemberOnline: (name) => `${name} をオンラインにしました`,
  toastMemberOffline: (name) => `${name} をオフラインにしました`,
  mentionTargetBtn: (name) => `@${name} をメンション`,
  mentionPickerTitle: 'メンション相手を選択',
  deleteMessageBtn: 'メッセージを削除',
  toastMessageDeleted: 'メッセージを削除しました',
  sendMp4: 'MP4',
  sendMp3: 'MP3',
  sendFile: 'ファイル',
  fileModalTitle: 'ファイル送信設定',
  toastFileSaved: 'ファイルをローカルに保存して送信しました',
  yearUnit: '年',
  monthUnit: '月',
  dayUnit: '日',
  statusOnlineBtn: 'オンライン',
  statusVoiceBtn: 'ボイスチャット',
  statusOfflineBtn: 'オフライン',
  toastMemberVoice: (name) => `${name} をボイスチャットに移動しました`,
  removeCharBtn: 'キャラクターを削除',
  toastCharRemoved: (name) => `キャラクター「${name}」を削除しました`,
  toastCannotRemoveLastChar: '最低1人のキャラクターが必要です',
  homepageLabel: '個人ページ',
  tutorialLabel: 'ガイド',
  githubLabel: 'GitHub',
  bilibiliLabel: 'Bilibili',
  playbackTimelineModeLabel: '時間流速モード',
  playbackTimelineExact: '完全に実時間流速',
  playbackTimelineExactSub: '設定した分差をそのまま実時間で待機（最短 0.5 秒）',
  playbackTimelineProp: '等比例スピード',
  playbackTimelinePropSub: '時間差を倍率で圧縮して再生（0.5 秒〜1 分）',
  playbackSpeedLabel: (scale) => `等比例倍率：${scale}×`,
  videoTutorialSectionLabel: '動画チュートリアル',
  videoTutorialTitle: 'Bilibili 動画',
  youtubeTutorialTitle: 'YouTube 動画',
  videoTutorialBtn: '動画を見る',
  templatePageBtn: 'UI テンプレート',
  templatePageTitle: 'Nightcord 本体 UI オープンソーステンプレート',
  templatePageSubtitle:
    '現在の「25時、ナイトコードで。」本体 UI（タイトルバー・サイドバー・チャット画面・ファイルカード）を純粋な再利用テンプレートとして切り出しました。',
  templateBackBtn: '本体に戻る',
  templatePreviewTitle: '本体 UI ライブプレビュー',
  templatePreviewDesktop: 'PC 表示',
  templatePreviewMobile: 'スマホ幅',
  templatePaletteTitle: 'カラーパレット（クリックでコピー）',
  templateCodeTitle: 'そのまま使えるテンプレートコード',
  templateCopyCodeBtn: 'コードをコピー',
  templateCopiedBtn: 'コピーしました',
  templateDownloadBtn: 'ファイルをダウンロード',
  templateArchitectureTitle: 'コア構成と拡張ポイント',
  templateArchitectureDesc:
    '本体 UI は ウィンドウ上部バー（3色ドット）＋ サイドバー（サーバー切替・作業チャンネル・ボイスチャット／オフライン）＋ チャット領域（日付区切り・アバター・ファイルカード・入力欄）で構成されています。編集機能や自動再生が不要な場合は、以下の TSX または単一 HTML をそのままプロジェクトに組み込めます。',
  templateLicenseNote:
    'CC BY-NC-SA 4.0（オリジナルコード部分）／ キャラクターおよび Nightcord の著作権は SEGA に帰属します。',
  templateCopiedColor: (hex) => `カラーコード ${hex} をコピーしました`,
  statusAddTimeToggle: '状態切替に時間を設定',
  statusAddTimeHint: '画面には表示せず、自動再生時にチャットと同期して切り替えます。',
  statusTimeInvalid: '正しい時刻（HH:MM）を入力してください',
  statusTimeSyncBtn: '最新時刻',
  statusScheduledListLabel: (count) => `予約済みの切替（${count}件）`,
  toastStatusEventAdded: (name, statusLabel, timeLabel) =>
    `${name} の「${statusLabel}」切替を ${timeLabel} に予約しました（自動再生時に反映）`,
  toastStatusEventRemoved: '予約済みの状態切替を削除しました',
  toastStatusEventsCleared: 'この会話の状態切替予約をすべて消去しました',
  playbackStatusSyncLabel: '左メンバーの状態連動',
  playbackStatusSyncOnTitle: 'オンライン／オフライン切替も再生',
  playbackStatusSyncOnSub: (count) =>
    count > 0
      ? `予約済みの ${count} 件の切替を右側メッセージと同時再生`
      : '左メンバー長押しで予約した時刻に合わせて状態を同期切替',
  playbackStatusSyncOffTitle: '右側のメッセージのみ再生',
  playbackStatusSyncOffSub: '左メンバー欄の状態は現在のまま固定して再生',
  playbackStatusEventsManage: (count) => `予約済みの状態切替を確認（${count}件）`,
  playbackClearStatusEventsBtn: 'すべて削除',
  aiModeBtn: 'AI チャットモード',
  aiModeBackBtn: '通常モードへ戻る',
  aiModeActiveBadge: '使用中',
  aiCharSettingsBtn: 'AI 設定',
  aiReadyBadge: '利用可',
  aiUnconfiguredBadge: '未設定',
  aiCharModalTitle: (name) => `${name} の設定`,
  aiProtocolLabel: '接続方式',
  aiProtocolOpenai: 'OpenAI 互換（汎用）',
  aiProtocolDeepseek: 'DeepSeek 公式 (api.deepseek.com)',
  aiProtocolGemini: 'Google Gemini API',
  aiProtocolAnthropic: 'Anthropic Claude API',
  aiBaseUrlLabel: '接続先 URL',
  aiBaseUrlHint: 'ブラウザから直接接続します。公式または互換アドレスを入力してください。',
  aiResetDefaultUrl: '初期値に戻す',
  aiApiKeyLabel: 'API Key',
  aiApiKeyPlaceholder: 'sk-... または各サービスのキー',
  aiLocalOnlyNote: 'キーはこのブラウザ内だけに保存され、外部サーバーへは送信されません。',
  aiUsingGlobalKeyBadge: '共通キーを使用中',
  aiModelLabel: 'モデル',
  aiFetchModelsBtn: '一覧を取得',
  aiFetchingModels: '取得中...',
  aiFetchModelsOk: (count) => `${count} 件のモデルを読み込みました`,
  aiFetchModelsFail: '取得できませんでした。手入力もできます',
  aiCustomModelPlaceholder: 'モデル名を入力（例：deepseek-chat / gpt-4o-mini）',
  aiPromptLabel: 'キャラクター設定・口調メモ',
  aiPromptPlaceholder: '性格や口調、関係性などを自由に入力...',
  toastAiCharSaved: (name) => `「${name}」の設定を保存しました`,
  aiGlobalModalTitle: 'AI チャット設定',
  aiGlobalModalSub: '自分の設定や共通の背景、時刻・言語、API 接続をまとめて管理します。',
  aiGlobalTabProfile: 'プロフィール・背景',
  aiGlobalTabChat: '会話・時刻・言語',
  aiGlobalTabApi: '接続・メンバー',
  aiGlobalApiToggle: '共通の API Key を使う',
  aiGlobalApiDesc: 'オンにすると、個別キーが未設定のメンバーもこの設定で返信できるようになります。',
  aiFollowUpToggle: '会話のあと別のメンバーも続けて反応する',
  aiFollowUpDesc: '誰かが返信したあと、設定した確率で別のオンラインメンバーが1回だけ言葉を返します。',
  aiFollowUpProbLabel: (prob) => `続けて反応する確率：${prob}%`,
  aiUserIdentityTitle: '自分のプロフィール',
  aiUserNamePlaceholder: '表示名（初期値：あなた）',
  aiUserAvatarLabel: 'アイコン',
  aiUploadAvatarBtn: '画像をアップロード',
  aiResetAvatarBtn: '初期画像に戻す',
  aiUserPersonaLabel: '自分の立場・メモ',
  aiUserPersonaPlaceholder: '例：ナイトコードの作曲担当や友人として会話に参加...',
  aiWorldviewTitle: '共通の舞台・世界観',
  aiWorldviewPlaceholder: 'メンバー全員に共有したい背景や、今夜の作業状況など...',
  aiTimeModeTitle: 'メッセージの時刻',
  aiTimeModeRealtime: '端末の現在時刻を使う',
  aiTimeModeRealtimeSub: '送信時の現在時刻を記録し、前のメッセージより戻らないよう揃えます。',
  aiTimeModeInferred: '場面に合わせて AI が時刻を決める',
  aiTimeModeInferredSub: '会話の流れに自然な日付と時刻を付け、時系列は必ず前に進めます。',
  aiCharPromptSectionTitle: 'メンバーごとの接続・設定',
  aiCharPromptSectionDesc: '左のメンバー長押しで開く画面と同じ内容を編集できます（オフライン時はお休み）。',
  aiConfiguredCharsCount: (ready, total) => `オンライン ${ready} / ${total}`,
  toastAiGlobalSaved: 'AI 設定を保存しました',
  aiEmptyTitle: (title) => `${title} のチャット`,
  aiEmptySub: '下の入力欄からそのまま送信できます。設定は「25時▾」か右上の青い点、自動会話は黄色い点から開けます。',
  aiEmptyReadySummary: (ready, total) => `話せるメンバー：${ready} / ${total}`,
  aiOpenGlobalQuickBtn: 'AI 設定を開く',
  aiOpenGuideBtn: 'ガイドを見る',
  aiHeaderGuideBtn: 'ガイド',
  aiOwnKeyBadge: '個別キー使用',
  aiNoKeyStatusBadge: 'キー未設定',
  aiOfflineStatusBadge: 'オフライン',
  aiGeneratingStatus: (name) => `${name} が入力中...`,
  aiToastBusy: '返信の生成中です。少しお待ちください',
  aiToastNoConfiguredChar: 'オンラインでキー設定済みのメンバーがいません。メンバー長押しか「25時▾」の AI 設定から登録してください。',
  aiToastAllOffline: '設定済みのメンバーが全員オフラインです。左側のリストでオンラインか通話中にしてください。',
  aiToastCharOffline: (name) => `「${name}」は今オフラインです`,
  aiToastTargetMissingKey: (name) => `「${name}」の API Key がまだ設定されていません`,
  aiToastRequestFailed: (name, reason) => `${name} の返信に失敗しました（${reason}）`,
  aiGuideTitle: 'AI チャットガイド',
  aiGuideBadges: ['1 / 5', '2 / 5', '3 / 5', '4 / 5', '5 / 5'],
  aiGuideStep1Title: '見た目そのまま・自分の設定と Web 検索',
  aiGuideStep1Desc:
    '画面の雰囲気は通常の Nightcord のまま、下の入力欄から直接話しかけられます。右上の青い点または左上の「25時、ナイトコードで。▾」から自分のプロフィールや世界観、Web 検索を設定できます。',
  aiGuideStep1Note: 'メニューや設定パネルはこの「AI チャットガイド」も含めて「25時、ナイトコードで。▾」にまとまっています。',
  aiGuideStep2Title: 'DeepSeek 対応・メンバーごとの API 設定',
  aiGuideStep2Desc:
    '左側のメンバーを長押し（または右クリック）するか全体設定から、OpenAI 互換・DeepSeek・Gemini・Claude の接続情報と口調メモをメンバー別に設定できます。',
  aiGuideStep3Title: '通話状態の共有と自然な時刻ペース',
  aiGuideStep3Desc:
    'オンライン・通話中・ミュート・オフラインの状態は AI にも伝わります。時刻推論をオンにすると5段階の頻度ペースに沿って裏側の時刻欄だけが更新され、本文に時刻が混ざることはありません。',
  aiGuideStep4Title: '返信言語・ファイル送信・黄色い点の自動会話',
  aiGuideStep4Desc:
    'キャラクターの口調を残したまま返信の言語（自動・簡体字・繁体字・EN・日本語）を選べます。場面に応じてファイルや @メンションを送ることもあり、右上の黄色い点からメンバー同士の自動会話も楽しめます。',
  aiGuideStep5Title: '使用量モニター・長押し操作・通常会話へコピー',
  aiGuideStep5Desc:
    '「25時▾」の「API 使用量モニター」で今セッションと累計のトークン数を確認できます。発言を長押しすると編集・やり直し・削除ができ、「通常会話へコピー」やこのガイドの再表示も可能です。',
  aiGuideOpenConfigBtn: 'AI 設定を開く',
  editMessageBtn: '編集',
  regenerateMessageBtn: 'やり直す',
  saveEditBtn: '保存',
  toastMessageUpdated: 'メッセージを更新しました',
  aiHeaderContinueBtn: '続けて話す',
  aiHeaderStopBtn: '停止',
  aiHeaderSettingsBtn: 'AI 設定',
  aiDropdownSettingsBtn: 'AI チャット設定',
  aiDropdownContinueBtn: '続けて話す',
  aiDropdownAutoChatBtn: '自動会話',
  aiUserAvatarPresetLabel: '既定アイコン',
  aiReplyLengthLabel: '返信の長さ',
  aiReplyLengthShort: '短め',
  aiReplyLengthNormal: 'ふつう',
  aiReplyLengthDetailed: 'くわしく',
  aiTemperatureLabel: (temp) => `ゆらぎ (Temperature)：${temp.toFixed(2)}`,
  aiCharTempUseGlobalBtn: '共通設定に戻す',
  aiFillPresetBtn: 'Nightcord 初期設定を入れる',
  aiToastPresetFilled: (name) => `${name} の初期設定を入れました`,
  aiTestConnBtn: '接続テスト',
  aiTestingConnBtn: '確認中...',
  aiTestConnOk: (latencyMs, model) => `接続できました（${latencyMs}ms · ${model}）`,
  aiTestConnFail: (detail) => `接続できませんでした：${detail}`,
  aiExportTranscriptBtn: '会話ログを保存 (.txt)',
  aiToastTranscriptExported: '会話ログをテキストで保存しました',
  aiToastAborted: '生成を止めました',
  aiToastPartialOffline: (names) => `オフラインのためスキップ：${names}`,
  aiToastPartialMissingKey: (names) => `キー未設定のためスキップ：${names}`,
  aiWebSearchToggle: 'Web 検索を使う',
  aiWebSearchDesc: '調べものや最近の話題が出たとき、検索機能を使って確認できるようにします。',
  aiGuideMenuBtn: 'AI チャットガイド',
  aiCopyToMainBtn: '通常会話へコピー',
  copyAiToMainModalTitle: '通常ページへコピー',
  copyAiToMainModalSub: '新しい会話名を入力すると、これまでのやり取りをメインページの会話として保存します。',
  copyAiToMainLabel: '新しい会話名',
  copyAiToMainPlaceholder: '例：深夜の打ち合わせ',
  copyAiToMainSummary: (count) => `コピーするメッセージ：${count} 件`,
  copyAiToMainConfirm: '作成してコピー',
  toastCopiedAiToMain: (title) => `「${title}」としてメインページにコピーしました`,
  aiAutoChatModalTitle: 'メンバー同士の自動会話',
  aiAutoChatModalSub: '開始するとオンラインのメンバー同士が順番に話し続けます。止めたいときはもう一度右上の黄色い点を押してください。',
  aiAutoChatRandomPresenceToggle: '会話の合間に参加メンバーや通話状態をランダムに入れ替える',
  aiAutoChatRandomPresenceDesc: 'オンライン・通話中・ミュート・オフラインをときどき切り替えながら進めます（最低1人はオンラインに残ります）。',
  aiAutoChatIntervalLabel: (sec) => `発言の間隔：${sec} 秒`,
  aiAutoChatStartBtn: 'はじめる',
  aiAutoChatToastStarted: '自動会話をはじめました（もう一度黄色い点で停止）',
  aiAutoChatToastStopped: '自動会話を止めました',
  aiAutoChatHeaderStopBtn: '自動会話を止める',
  aiTimeFrequencyLabel: '会話のペース傾向',
  aiTimeFreqHigh: '高頻度',
  aiTimeFreqHighDesc: '数分おきのテンポよいやり取りが中心になります。',
  aiTimeFreqSomewhatHigh: 'やや高頻度',
  aiTimeFreqSomewhatHighDesc: '短い間隔が多めで、ときどき長めの間が空きます。',
  aiTimeFreqBalanced: 'バランス',
  aiTimeFreqBalancedDesc: 'テンポよく続く場面と時間を空けて再開する場面が自然に混ざります。',
  aiTimeFreqSomewhatLow: 'やや低頻度',
  aiTimeFreqSomewhatLowDesc: '数十分〜数時間おきが中心で、たまに続けて話します。',
  aiTimeFreqLow: '低頻度',
  aiTimeFreqLowDesc: '落ち着いた頻度で、数時間以上あけて話すことが多くなります。',
  aiOutputLanguageLabel: '返信の言語',
  aiOutputLanguageHint: 'キャラの性格や画面のUI言語は変えず、返ってくる文章の言語だけを切り替えます。',
  aiOutputLangAuto: '自動',
  aiOutputLangZhCn: '简体中文',
  aiOutputLangZhTw: '繁體中文',
  aiOutputLangEn: 'English',
  aiOutputLangJa: '日本語',
  aiUsageBtn: 'API 使用量モニター',
  aiUsageModalTitle: 'API 使用量モニター',
  aiUsageModalSub: 'API の応答に含まれる実トークン数だけを集計しています（確認のための追加通信はありません）。',
  aiUsageSessionTitle: '今のセッション',
  aiUsageHistoryTitle: 'これまでの累計',
  aiUsageResetSessionBtn: '今のセッションをリセット',
  closeModal: '閉じる',
  aiUsageToastSessionReset: '今のセッションの統計をリセットしました',
  aiUsageRequestsLabel: 'リクエスト',
  aiUsageKnownRequestsLabel: '集計できた回数',
  aiUsageUnknownRequestsLabel: '内訳なし',
  aiUsageInputLabel: '入力',
  aiUsageOutputLabel: '出力',
  aiUsageTotalLabel: '合計',
  aiUsageThinkingLabel: '思考',
  aiUsageCachedLabel: 'キャッシュ',
  aiUsageExtraLabel: 'その他',
  aiUsageUnknown: '未知',
  aiUsagePartialUnknownNote: (unknownCount) => `内 ${unknownCount} 件は未返却`,
  aiUsageCostNotice: '表示されるのは API が返した実際のトークン数のみ（料金計算とは別）です。返却されない項目は「未知」と表示します。',
  aiUsageBreakdownTitle: '通信履歴',
  aiUsageFilterSession: '今のセッション',
  aiUsageFilterHistory: 'すべて',
  aiUsageNoRecords: 'まだ記録がありません。',
  aiUsageStatusOk: '成功',
  aiUsageStatusError: '失敗',
  aiUsagePurposeChat: '返信',
  aiUsagePurposeFollowUp: '追撃',
  aiUsagePurposeAutoChat: '自動会話',
  aiUsagePurposeContinue: '続けて話す',
  aiUsagePurposeRegenerate: 'やり直し',
  aiUsagePurposeTimeAnalysis: '時刻推算',
  aiUsagePurposeTest: '接続テスト',
};

const ZH_TEXT: UiText = {
  guideTitle: 'nightcord 使用引导',
  stepBadges: ['步骤 1 / 6', '步骤 2 / 6', '步骤 3 / 6', '步骤 4 / 6', '步骤 5 / 6', '步骤 6 / 6'],
  step1Title: '选择引导与操作界面语言',
  step1Desc: '请先选择后续引导及编辑按钮的显示语言，选择后会自动保存在本地。',
  step1Note:
    '※ 进入后默认处于「沉浸模式（仅浏览，无法发送消息）」。角色名称及沉浸模式中的聊天界面文本均保持日文原版显示。',
  step2Title: '切换对话、AI 模式与 UI 模板',
  step2Desc:
    '点击左上角的「25時、ナイトコードで。▾」即可切换或新建对话、进入「AI 对话模式」、查看开源 UI 模板、导出/导入本地备份，或重新打开功能引导。',
  step3Title: '角色切换、媒体发送与定时状态',
  step3Desc:
    '点击右上角第 1 个蓝色圆点进入角色切换模式即可发送消息。支持自定义角色、图片/MP4/MP3、自定义时间、长按消息删除，以及长按左侧成员切换状态或勾选「为状态切换添加时间」。',
  step3Label: '角色切换・可发消息',
  step4Title: '切换为沉浸模式（禁止发送）',
  step4Desc:
    '点击右上角第 2 个黄色圆点即可隐藏所有编辑按钮并禁止发送消息，回到纯净的沉浸浏览模式。',
  step4Label: '沉浸模式・禁止发送',
  step5Title: '消息自动播放模式（红色圆点）',
  step5Desc:
    '点击右上角第 3 个红色圆点后默认进入沉浸模式并弹出设置框，支持按发送时间流速或固定间隔（0.5 秒 – 60 秒）逐条自动播放消息，并可选同步播放左侧成员的定时上下线切换。',
  step5Label: '自动播放模式',
  step6Title: 'AI 对话模式',
  step6Desc:
    '从左侧菜单进入「AI 对话模式」后，就能在原版界面里直接发消息和大家聊天。支持 DeepSeek 等主流接口、联网搜索、语音与静音状态感知、5 档节奏的 AI 时间、回复语言切换、API 用量统计、小黄点自动群聊以及复制到主页面，随时可在左上角「25時▾」重看 AI 引导。',
  step6Label: 'AI 对话模式',
  skip: '跳过',
  back: '上一步',
  next: '下一步',
  start: '开始使用',
  convListTitle: '对话列表',
  templateBadge: '模板',
  createConvTitle: '新建对话',
  createConvPlaceholder: '输入对话名称（例：雑談）',
  copyTemplateLabel: '复制模板对话内容',
  createConvBtn: '+ 添加对话',
  langLabel: '界面语言',
  editChar: '编辑',
  addChar: '+ 添加角色',
  sendImage: '图片',
  recordVoice: '录音',
  audioFile: '音频文件',
  recording: '录音中',
  send: '发送',
  stopCancel: '取消',
  charNamePlaceholder: '输入角色名称',
  chooseImage: '选择本地图片',
  cancel: '取消',
  save: '保存',
  add: '添加',
  imageModalTitle: '选择图片发送方式',
  imageModeLabel: '显示方式',
  imageModeCard: '仅显示文件名卡片',
  imageModeCardSub: '不显示原图，按原网页文件卡片样式展示',
  imageModeFull: '发送原图',
  imageModeFullSub: '在聊天中直接显示本地图片预览',
  imageFilenameLabel: '文件名（可编辑）',
  imageFilenamePlaceholder: '例如：ラフC.jpg',
  emptyConvTitle: (title) => `开始「${title}」的对话吧`,
  emptyConvSub: '点击右上角第 1 个蓝色圆点进入角色切换模式即可发送消息（仅本地保存）',
  studioInputPlaceholder: (name) => `以 ${name} 的身份发送消息`,
  toastStudioMode: '已切换到角色切换模式',
  toastConvCreated: (title) => `已创建对话「${title}」`,
  toastConvDeleted: '已删除该对话',
  toastCharSaved: (name) => `已保存角色「${name}」`,
  toastImageSaved: '图片已保存至本地并发送',
  toastAudioSaved: '音频已保存至本地并发送',
  toastVoiceSaved: '语音消息已保存至本地',
  toastMicUnsupported: '当前环境不支持录音，请选择本地音频文件',
  toastMicDenied: '未获取麦克风权限，请选择本地音频文件',
  toastBoldOn: '已开启加粗输入',
  toastBoldOff: '已关闭加粗输入',
  toastMuted: (name) => `已将 ${name} 静音`,
  toastUnmuted: (name) => `已取消 ${name} 静音`,
  toastProfile: (name) => `${name} 的资料`,
  toastDownloading: (filename, sizeLabel) => `正在下载 ${filename} (${sizeLabel})...`,
  dataSectionTitle: '本地数据管理',
  exportDataBtn: '导出',
  importDataBtn: '导入',
  clearCacheBtn: '一键清空本地缓存',
  clearModalTitle: '清空本地缓存',
  clearStep1Badge: '确认 1 / 2',
  clearStep2Badge: '最终确认 2 / 2',
  clearStep1Heading: '确定要清空本地缓存的消息吗？',
  clearStep1Desc:
    '这将删除你创建的全部对话、发送的消息、自定义角色以及本地缓存的图片和语音，并恢复为默认模板。',
  clearStep1Next: '下一步',
  clearStep2Heading: '再次确认：彻底清空全部缓存？',
  clearStep2Desc:
    '此操作无法撤销。如需保留记录，请先在菜单中使用「导出本地文件」进行备份。',
  clearStep2Confirm: '确认清空',
  toastExportSuccess: '已将对话、AI 设定与本地媒体完整导出为文件',
  toastImportSuccess: (count, aiCount = 0) =>
    aiCount > 0
      ? `已导入本地备份（普通对话 ${count} 个 / AI 对话 ${aiCount} 个）`
      : `已导入本地文件（共 ${count} 个对话）`,
  toastImportInvalid: '导入失败：文件格式无效',
  toastCacheCleared: '已清空本地缓存并恢复默认模板',
  timeBtnLabel: '时间',
  timeCustomToggle: '自定义发送时间',
  timeMinHint: (minTs) => `不能早于上一条消息（${minTs}）`,
  timeAnyHint: '可自由设置发送时间',
  timeEarlierError: (minTs) => `时间不能早于上一条消息（${minTs}）`,
  timeResetNow: '同步当前时间',
  playbackModalTitle: '消息自动播放设置',
  playbackModalSub: '当前已自动切换为沉浸模式，将按设定节奏逐条展示消息。',
  playbackPacingLabel: '发送节奏',
  playbackTimelineTitle: '按发送时间流速发送',
  playbackTimelineSub: '支持完全按发送时间流速或按等比例速度推进',
  playbackEvenTitle: '固定时间间隔发送',
  playbackEvenSub: '所有消息按固定时间间隔依次发送（0.5 秒 – 60 秒）',
  playbackIntervalLabel: (sec) => `固定发送间隔：${sec} 秒`,
  playbackStartLabel: '起始消息位置',
  playbackStartEmpty: '从没有消息开始（从头逐条发送）',
  playbackStartFromMsg: (index, username, timestamp, preview) =>
    `从第 ${index} 条开始（${username}・${timestamp}）${preview}`,
  playbackNoMessages: '当前对话暂无可播放的消息，请先在角色切换模式下添加消息。',
  playbackStartBtn: '开始',
  playbackCapNote: '※ 每次发送间隔均不少于 0.5 秒。播放中再次点击红点可重新设置或取消。',
  toastPlaybackDone: '消息逐条播放已完成',
  playbackAnchorLabel: '时间基准',
  playbackAnchorTodayTitle: '锚定在今日时间',
  playbackAnchorTodaySub: '同月之前显示「13日 23:13」，跨月/跨年显示「2021年6月17日 15:30」',
  playbackAnchorFlowTitle: '不锚定（随播放时间推进）',
  playbackAnchorFlowSub: '以播放消息的时间为「今日」，跨过 24 点后之前的消息自动变为「昨日」',
  linksSectionTitle: '相关链接与反馈',
  reportIssueLabel: '报告问题',
  setOfflineBtn: '设为离线',
  setOnlineBtn: '设为在线',
  toastMemberOnline: (name) => `已将 ${name} 设为在线`,
  toastMemberOffline: (name) => `已将 ${name} 设为离线`,
  mentionTargetBtn: (name) => `@${name}`,
  mentionPickerTitle: '选择要 @ 的角色',
  deleteMessageBtn: '删除消息',
  toastMessageDeleted: '已删除该消息',
  sendMp4: 'MP4',
  sendMp3: 'MP3',
  sendFile: '文件',
  fileModalTitle: '文件发送设置',
  toastFileSaved: '文件已保存至本地并发送',
  yearUnit: '年',
  monthUnit: '月',
  dayUnit: '日',
  statusOnlineBtn: '在线',
  statusVoiceBtn: '语音聊天',
  statusOfflineBtn: '离线',
  toastMemberVoice: (name) => `已将 ${name} 设为语音聊天`,
  removeCharBtn: '移除角色',
  toastCharRemoved: (name) => `已移除角色「${name}」`,
  toastCannotRemoveLastChar: '至少需要保留 1 个角色',
  homepageLabel: '个人主页',
  tutorialLabel: '新手教程',
  githubLabel: 'GitHub',
  bilibiliLabel: 'B站',
  playbackTimelineModeLabel: '时间流速方式',
  playbackTimelineExact: '完全按发送时间流速',
  playbackTimelineExactSub: '严格按两条消息的真实时间差等待（最少 0.5 秒）',
  playbackTimelineProp: '等比例速度',
  playbackTimelinePropSub: '按倍率等比例缩放时间差（0.5 秒 – 1 分钟）',
  playbackSpeedLabel: (scale) => `等比例倍率：${scale}×`,
  videoTutorialSectionLabel: '视频教程',
  videoTutorialTitle: 'B站视频教程',
  youtubeTutorialTitle: 'YouTube 教程',
  videoTutorialBtn: '前往观看',
  templatePageBtn: '开源 UI 模板',
  templatePageTitle: 'Nightcord 本体 UI 开源模板',
  templatePageSubtitle:
    '将当前 Nightcord（25時、ナイトコードで。）本体界面（顶部三点栏、左侧成员栏、聊天消息流、文件卡片与底部输入框）抽离为纯净、可直接复用的开源前端模板。',
  templateBackBtn: '返回主应用',
  templatePreviewTitle: 'Nightcord 本体 UI 实时预览',
  templatePreviewDesktop: '桌面视图',
  templatePreviewMobile: '移动端宽度',
  templatePaletteTitle: 'Nightcord 配色规范（点击色值复制）',
  templateCodeTitle: '开箱即用模板源码',
  templateCopyCodeBtn: '复制代码',
  templateCopiedBtn: '已复制',
  templateDownloadBtn: '下载模板文件',
  templateArchitectureTitle: 'UI 结构与开源复用说明',
  templateArchitectureDesc:
    '本体 UI 由「顶部窗口栏（#211A2C）」「左侧频道与语音成员栏（#2E243D）」「中间消息流与文件卡片（#3F3352）」以及「底部输入框（#332844）」四部分组成。若只需干净的 Nightcord 聊天界面壳子，可直接复制或下载下方 React + Tailwind TSX 组件或单文件纯 HTML 模板。',
  templateLicenseNote:
    '原创代码与 UI 模板采用 CC BY-NC-SA 4.0 协议开源；角色与 Nightcord 原作版权归 SEGA 所有。',
  templateCopiedColor: (hex) => `已复制色值 ${hex}`,
  statusAddTimeToggle: '为状态切换添加时间',
  statusAddTimeHint: '不会直接显示在界面中，自动播放时按该时间与右侧消息同步切换。',
  statusTimeInvalid: '请输入有效时间（HH:MM）',
  statusTimeSyncBtn: '同步时间',
  statusScheduledListLabel: (count) => `已添加的定时切换（${count}）`,
  toastStatusEventAdded: (name, statusLabel, timeLabel) =>
    `已记录 ${name} 在 ${timeLabel} 切换为「${statusLabel}」（自动播放时同步生效）`,
  toastStatusEventRemoved: '已删除该定时状态切换',
  toastStatusEventsCleared: '已清空当前对话的所有状态切换记录',
  playbackStatusSyncLabel: '左侧角色上下线同步',
  playbackStatusSyncOnTitle: '播放角色上下线状态',
  playbackStatusSyncOnSub: (count) =>
    count > 0
      ? `按设定时间与右侧消息同步切换（已记录 ${count} 条）`
      : '若长按左侧角色记录了切换时间，播放时会同步切换状态',
  playbackStatusSyncOffTitle: '仅播放右侧消息',
  playbackStatusSyncOffSub: '保持左侧角色栏当前状态不变，只逐条展示聊天消息',
  playbackStatusEventsManage: (count) => `管理已记录的状态切换（${count} 条）`,
  playbackClearStatusEventsBtn: '全部清空',
  aiModeBtn: 'AI 对话模式',
  aiModeBackBtn: '返回主页面',
  aiModeActiveBadge: '当前',
  aiCharSettingsBtn: 'AI 设置',
  aiReadyBadge: '已就绪',
  aiUnconfiguredBadge: '未填 Key',
  aiCharModalTitle: (name) => `${name} 的设定`,
  aiProtocolLabel: '接口协议',
  aiProtocolOpenai: 'OpenAI 兼容（通用）',
  aiProtocolDeepseek: 'DeepSeek 官方 (api.deepseek.com)',
  aiProtocolGemini: 'Google Gemini API',
  aiProtocolAnthropic: 'Anthropic Claude API',
  aiBaseUrlLabel: '接口地址',
  aiBaseUrlHint: '浏览器直接请求，填官方地址或支持跨域的兼容地址即可。',
  aiResetDefaultUrl: '恢复默认',
  aiApiKeyLabel: 'API Key',
  aiApiKeyPlaceholder: '填入你的 API Key',
  aiLocalOnlyNote: '仅保存在你的浏览器本地，不会上传到任何服务器。',
  aiUsingGlobalKeyBadge: '正使用全局 Key',
  aiModelLabel: '模型',
  aiFetchModelsBtn: '获取列表',
  aiFetchingModels: '获取中...',
  aiFetchModelsOk: (count) => `已加载 ${count} 个模型`,
  aiFetchModelsFail: '获取失败，可以直接手填模型名',
  aiCustomModelPlaceholder: '输入模型名称（如 deepseek-chat / gpt-4o-mini）',
  aiPromptLabel: '角色人设与说话习惯',
  aiPromptPlaceholder: '写下角色的性格、口吻、和你的关系...',
  toastAiCharSaved: (name) => `已保存「${name}」的设定`,
  aiGlobalModalTitle: 'AI 全局设置',
  aiGlobalModalSub: '在这里安排你的身份、大家的世界观、聊天节奏和接口连接。',
  aiGlobalTabProfile: '身份与背景',
  aiGlobalTabChat: '对话与时间',
  aiGlobalTabApi: '接口与成员',
  aiGlobalApiToggle: '启用共享 API Key',
  aiGlobalApiDesc: '开启后，没单独填 Key 的角色也会直接使用这里配置好的接口回复。',
  aiFollowUpToggle: '偶尔让其他成员接话',
  aiFollowUpDesc: '一位成员说完后，有几率再触发另一位在线成员顺着接一句。',
  aiFollowUpProbLabel: (prob) => `接话几率：${prob}%`,
  aiUserIdentityTitle: '我的资料',
  aiUserNamePlaceholder: '显示昵称（默认：あなた）',
  aiUserAvatarLabel: '我的头像',
  aiUploadAvatarBtn: '上传头像',
  aiResetAvatarBtn: '恢复默认',
  aiUserPersonaLabel: '我的身份 / 个人简介',
  aiUserPersonaPlaceholder: '比如：负责编曲的社团成员、认识很久的朋友...',
  aiWorldviewTitle: '共同世界观与背景',
  aiWorldviewPlaceholder: '写下大家共享的世界观、深夜连线的缘由或眼下的剧情背景...',
  aiTimeModeTitle: '消息发送时间',
  aiTimeModeRealtime: '按设备当前时间',
  aiTimeModeRealtimeSub: '以你电脑或手机的当前时间为准，自动顺延避免时间倒退。',
  aiTimeModeInferred: '由 AI 根据对话推算时间',
  aiTimeModeInferredSub: '结合聊天氛围和作息决定每条消息的时间，只往未来推进。',
  aiCharPromptSectionTitle: '成员单独设定',
  aiCharPromptSectionDesc: '和长按左侧成员打开的界面互通；处于离线状态的成员不会发言。',
  aiConfiguredCharsCount: (ready, total) => `在线可聊 ${ready} / ${total}`,
  toastAiGlobalSaved: '已保存设置',
  aiEmptyTitle: (title) => `${title}`,
  aiEmptySub: '直接在底部输入框发送消息就可以聊起来。右上角蓝点或左上角「25時▾」可调整设置，黄点可开启成员自由互动。',
  aiEmptyReadySummary: (ready, total) => `在线成员 ${ready} / ${total}`,
  aiOpenGlobalQuickBtn: '打开 AI 设置',
  aiOpenGuideBtn: '查看新手引导',
  aiHeaderGuideBtn: '引导',
  aiOwnKeyBadge: '独立 Key',
  aiNoKeyStatusBadge: '未填 Key',
  aiOfflineStatusBadge: '离线中',
  aiGeneratingStatus: (name) => `${name} 正在输入...`,
  aiToastBusy: '对方还在输入中，稍等一下…',
  aiToastNoConfiguredChar: '还没有在线且填好 Key 的成员。长按左侧头像，或从左上角「25時▾」打开设置配好接口吧。',
  aiToastAllOffline: '填好 Key 的成员现在都离线了，在左侧把至少一位切成「在线」或「语音聊天」吧。',
  aiToastCharOffline: (name) => `${name} 现在离线中`,
  aiToastTargetMissingKey: (name) => `${name} 还没填 API Key`,
  aiToastRequestFailed: (name, reason) => `${name} 回复失败（${reason}）`,
  aiGuideTitle: 'AI 新手引导',
  aiGuideBadges: ['1 / 5', '2 / 5', '3 / 5', '4 / 5', '5 / 5'],
  aiGuideStep1Title: '清爽主页与个人设定',
  aiGuideStep1Desc:
    '聊天画面保持和原版一样简洁，底部输入框直接就能发消息。点右上角小蓝点，或者展开左上角「25時、ナイトコードで。▾」，可以设置你的名字、头像、世界观和联网搜索。',
  aiGuideStep1Note: '所有 AI 设置、用量查看和这个新手引导都收在左上角「25時、ナイトコードで。▾」菜单里，随时可以点回来重看。',
  aiGuideStep2Title: '支持 DeepSeek 与分角色连接',
  aiGuideStep2Desc:
    '既可以在全球设置里共用一套 Key，也能长按（右键）左侧头像给每个角色单独配置 OpenAI 兼容、DeepSeek 官方、Gemini 或 Claude 接口和人设，两边随时同步。',
  aiGuideStep3Title: '状态感知与聊天节奏时间',
  aiGuideStep3Desc:
    '成员是在语音通话、开了静音、纯打字还是离线，AI 都能实时感知。开启时间推算后，还能选 5 档聊天频率，消息时间会直接写入系统时间戳，绝不会混进文字里。',
  aiGuideStep4Title: '切换回复语言与小黄点自由聊天',
  aiGuideStep4Desc:
    '可以单独指定 AI 用简体中文、繁体中文、English、日本語或自动切换来回复，不会改变角色性格和网页界面语言。想看成员自己聊天，点右上角小黄点就能开始，再点一下就会停。',
  aiGuideStep5Title: '用量统计、长按重发与复制到主页',
  aiGuideStep5Desc:
    '在「25時▾」打开「API 用量监测」可以查看本次和历史实际消耗的 Token（接口未返回时会写未知）。长按任意消息能编辑、重生成或删除，也能把整段对话复制到主页面保存。',
  aiGuideOpenConfigBtn: '去配置 AI 设置',
  editMessageBtn: '编辑',
  regenerateMessageBtn: '重新生成',
  saveEditBtn: '保存',
  toastMessageUpdated: '已更新消息',
  aiHeaderContinueBtn: '续聊',
  aiHeaderStopBtn: '停止',
  aiHeaderSettingsBtn: 'AI 设置',
  aiDropdownSettingsBtn: 'AI 全局设置',
  aiDropdownContinueBtn: '续聊',
  aiDropdownAutoChatBtn: '随机发言',
  aiUserAvatarPresetLabel: '快捷头像',
  aiReplyLengthLabel: '回复长度',
  aiReplyLengthShort: '简短',
  aiReplyLengthNormal: '适中',
  aiReplyLengthDetailed: '详细',
  aiTemperatureLabel: (temp) => `随机度 (Temperature)：${temp.toFixed(2)}`,
  aiCharTempUseGlobalBtn: '跟随全局',
  aiFillPresetBtn: '填入 Nightcord 预设',
  aiToastPresetFilled: (name) => `已填入「${name}」的预设人设`,
  aiTestConnBtn: '测试连接',
  aiTestingConnBtn: '连接中...',
  aiTestConnOk: (latencyMs, model) => `连接成功（${latencyMs}ms · ${model}）`,
  aiTestConnFail: (detail) => `连接失败：${detail}`,
  aiExportTranscriptBtn: '导出对话 (.txt)',
  aiToastTranscriptExported: '已导出对话记录',
  aiToastAborted: '已停止回复',
  aiToastPartialOffline: (names) => `已跳过离线成员：${names}`,
  aiToastPartialMissingKey: (names) => `已跳过未配 Key 的成员：${names}`,
  aiWebSearchToggle: '允许联网搜索',
  aiWebSearchDesc: '聊到近况、冷知识或需要查资料的话题时，AI 可以联网检索参考。',
  aiGuideMenuBtn: 'AI 新手引导',
  aiCopyToMainBtn: '会话复制到主页面',
  copyAiToMainModalTitle: '复制到主页面',
  copyAiToMainModalSub: '输入新对话的名称，把刚刚聊的内容存成主页面里的一条常规会话。',
  copyAiToMainLabel: '新对话名称',
  copyAiToMainPlaceholder: '比如：深夜随便聊聊',
  copyAiToMainSummary: (count) => `共包含 ${count} 条消息`,
  copyAiToMainConfirm: '保存并复制',
  toastCopiedAiToMain: (title) => `已保存到主页面对话「${title}」`,
  aiAutoChatModalTitle: '成员自由互动',
  aiAutoChatModalSub: '开始后，在线的成员会自己轮流聊下去；想停下时，再点一下右上角小黄点就行。',
  aiAutoChatRandomPresenceToggle: '过程中随机切换上下线与通话状态',
  aiAutoChatRandomPresenceDesc: '轮流说话的间隙，随机让成员进出语音频道、静音或下线（会至少保留 1 位在线）。',
  aiAutoChatIntervalLabel: (sec) => `每轮间隔：${sec} 秒`,
  aiAutoChatStartBtn: '开始互动',
  aiAutoChatToastStarted: '自由互动已开始（再点一下右上角小黄点结束）',
  aiAutoChatToastStopped: '已停止自由互动',
  aiAutoChatHeaderStopBtn: '结束互动',
  aiTimeFrequencyLabel: '聊天频率倾向',
  aiTimeFreqHigh: '高频',
  aiTimeFreqHighDesc: '多为几分钟内的连续互动，偶尔稍作停顿。',
  aiTimeFreqSomewhatHigh: '偏高频',
  aiTimeFreqSomewhatHighDesc: '短间隔聊天较多，偶尔隔几十分钟到几小时。',
  aiTimeFreqBalanced: '均衡',
  aiTimeFreqBalancedDesc: '连聊、短歇和隔几小时再上线自然交替。',
  aiTimeFreqSomewhatLow: '偏低频',
  aiTimeFreqSomewhatLowDesc: '多为中长间隔，偶尔连着说几句。',
  aiTimeFreqLow: '低频',
  aiTimeFreqLowDesc: '对话比较稀疏，常常隔上几个小时再接着聊。',
  aiOutputLanguageLabel: '回复语言',
  aiOutputLanguageHint: '只决定 AI 回复用哪种语言写，不会改动角色性格和网页本身语言。',
  aiOutputLangAuto: '自动',
  aiOutputLangZhCn: '简体中文',
  aiOutputLangZhTw: '繁体中文',
  aiOutputLangEn: 'English',
  aiOutputLangJa: '日本語',
  aiUsageBtn: 'API 用量监测',
  aiUsageModalTitle: 'API 用量监测',
  aiUsageModalSub: '直接记录每次接口返回里的实际用量，不会为了统计而多发请求。',
  aiUsageSessionTitle: '本次会话',
  aiUsageHistoryTitle: '历史累计',
  aiUsageResetSessionBtn: '重置本次统计',
  closeModal: '关闭',
  aiUsageToastSessionReset: '已清零本次统计，历史累计保留',
  aiUsageRequestsLabel: '请求次数',
  aiUsageKnownRequestsLabel: '含用量数据',
  aiUsageUnknownRequestsLabel: '未返回',
  aiUsageInputLabel: '输入',
  aiUsageOutputLabel: '输出',
  aiUsageTotalLabel: '总计',
  aiUsageThinkingLabel: '思考',
  aiUsageCachedLabel: '缓存',
  aiUsageExtraLabel: '其他',
  aiUsageUnknown: '未知',
  aiUsagePartialUnknownNote: (unknownCount) => `另有 ${unknownCount} 次未返回`,
  aiUsageCostNotice: '这里统计的是接口实际返回的 Token 数，与计费账单不同；如果接口没返回某项数据会显示“未知”，不会估算。',
  aiUsageBreakdownTitle: '请求明细',
  aiUsageFilterSession: '本次会话',
  aiUsageFilterHistory: '全部历史',
  aiUsageNoRecords: '还没有接口调用记录。',
  aiUsageStatusOk: '成功',
  aiUsageStatusError: '失败',
  aiUsagePurposeChat: '对话',
  aiUsagePurposeFollowUp: '接话',
  aiUsagePurposeAutoChat: '自由互动',
  aiUsagePurposeContinue: '续聊',
  aiUsagePurposeRegenerate: '重新生成',
  aiUsagePurposeTimeAnalysis: '时间推算',
  aiUsagePurposeTest: '测试连接',
};

const EN_TEXT: UiText = {
  guideTitle: 'nightcord Guide',
  stepBadges: ['Step 1 / 6', 'Step 2 / 6', 'Step 3 / 6', 'Step 4 / 6', 'Step 5 / 6', 'Step 6 / 6'],
  step1Title: 'Choose Guide & Control Language',
  step1Desc:
    'Select the language for this tutorial and editing controls. Your preference is saved locally.',
  step1Note:
    '* The app launches in Immersive Mode (read-only). Character names and the Immersive Mode chat interface stay in the original Japanese.',
  step2Title: 'Chats, AI Mode & UI Template',
  step2Desc:
    'Click "25時、ナイトコードで。▾" in the top-left to switch/create conversations, enter AI Chat Mode, inspect the open-source UI Template, or export/import local JSON backups.',
  step3Title: 'Role-Switch Mode & Scheduled Status',
  step3Desc:
    'Click the 1st cyan dot (top-right) to enter Role-Switch Mode. Customize roles, send local images/MP4/MP3, set custom dates, long-press messages to delete, or long-press sidebar members to switch status & schedule timed transitions.',
  step3Label: 'Role-Switch · Editable',
  step4Title: 'Immersive Mode (Read-Only)',
  step4Desc:
    'Click the 2nd yellow dot (top-right) to hide all editing controls and lock message sending for a clean, distraction-free view.',
  step4Label: 'Immersive · Read-Only',
  step5Title: 'Auto-Playback Mode (Red Dot)',
  step5Desc:
    'Click the 3rd red dot (top-right) to replay messages one by one (with optional synced sidebar status transitions) using Timestamp Flow or Fixed Interval (0.5s – 60s).',
  step5Label: 'Auto-Playback Mode',
  step6Title: 'AI Chat Mode',
  step6Desc:
    'Open "AI Chat Mode" from the top-left menu to chat in the clean Nightcord layout. Includes DeepSeek and other API presets, web search, voice/mute presence sync, 5-tier AI timing, reply language switch, API usage tracking, yellow-dot auto group chat, and copy-to-main.',
  step6Label: 'AI Chat Mode',
  skip: 'Skip',
  back: 'Back',
  next: 'Next',
  start: 'Get Started',
  convListTitle: 'Conversations',
  templateBadge: 'Template',
  createConvTitle: 'New Chat',
  createConvPlaceholder: 'Chat name (e.g. Casual)',
  copyTemplateLabel: 'Copy template messages',
  createConvBtn: '+ Add Conversation',
  langLabel: 'UI Language',
  editChar: 'Edit',
  addChar: '+ Add Role',
  sendImage: 'Image',
  recordVoice: 'Voice',
  audioFile: 'Audio',
  recording: 'Recording',
  send: 'Send',
  stopCancel: 'Cancel',
  charNamePlaceholder: 'Character name',
  chooseImage: 'Choose Image',
  cancel: 'Cancel',
  save: 'Save',
  add: 'Add',
  imageModalTitle: 'Image Send Options',
  imageModeLabel: 'Display Style',
  imageModeCard: 'File Card Only',
  imageModeCardSub: 'Matches Nightcord card style with editable filename',
  imageModeFull: 'Send Raw Image',
  imageModeFullSub: 'Shows image preview directly in chat (tap to zoom)',
  imageFilenameLabel: 'Filename (Editable)',
  imageFilenamePlaceholder: 'e.g. rough_01.jpg',
  emptyConvTitle: (title) => `Start chatting in "${title}"`,
  emptyConvSub:
    'Click the top-right cyan dot to switch into Role-Switch Mode and send messages or local media.',
  studioInputPlaceholder: (name) => `Message as ${name}`,
  toastStudioMode: 'Switched to Role-Switch Mode',
  toastConvCreated: (title) => `Created conversation "${title}"`,
  toastConvDeleted: 'Conversation deleted',
  toastCharSaved: (name) => `Saved character "${name}"`,
  toastImageSaved: 'Image saved locally and sent',
  toastAudioSaved: 'Audio saved locally and sent',
  toastVoiceSaved: 'Voice saved locally and sent',
  toastMicUnsupported: 'Microphone unavailable; pick a local audio file instead',
  toastMicDenied: 'Microphone permission denied; pick a local audio file instead',
  toastBoldOn: 'Bold text enabled',
  toastBoldOff: 'Bold text disabled',
  toastMuted: (name) => `Muted ${name}`,
  toastUnmuted: (name) => `Unmuted ${name}`,
  toastProfile: (name) => `${name}'s profile`,
  toastDownloading: (filename, sizeLabel) => `Downloading ${filename} (${sizeLabel})...`,
  dataSectionTitle: 'Local Data',
  exportDataBtn: 'Export',
  importDataBtn: 'Import',
  clearCacheBtn: 'Clear Local Cache',
  clearModalTitle: 'Clear Local Cache',
  clearStep1Badge: 'Confirm 1 / 2',
  clearStep2Badge: 'Confirm 2 / 2',
  clearStep1Heading: 'Clear all local cache data?',
  clearStep1Desc:
    'All created conversations, sent messages, custom characters, and locally saved media will be deleted and reset to the default template.',
  clearStep1Next: 'Continue',
  clearStep2Heading: 'Are you sure you want to delete everything?',
  clearStep2Desc:
    'This action cannot be undone. Export a backup first if you want to keep your conversations.',
  clearStep2Confirm: 'Confirm & Clear',
  toastExportSuccess: 'Exported chats, AI settings & media backup',
  toastImportSuccess: (count, aiCount = 0) =>
    aiCount > 0
      ? `Imported backup (${count} chats, ${aiCount} AI chats)`
      : `Imported local backup (${count} conversations)`,
  toastImportInvalid: 'Import failed: invalid backup file',
  toastCacheCleared: 'Local cache cleared and template restored',
  timeBtnLabel: 'Time',
  timeCustomToggle: 'Custom Send Time',
  timeMinHint: (minTs) => `Cannot be earlier than previous (${minTs})`,
  timeAnyHint: 'Set any date & time freely',
  timeEarlierError: (minTs) => `Time cannot be earlier than previous message (${minTs})`,
  timeResetNow: 'Sync Now',
  playbackModalTitle: 'Auto-Playback Setup',
  playbackModalSub:
    'Automatically switches to Immersive Mode and reveals messages one by one.',
  playbackPacingLabel: 'Pacing Mode',
  playbackTimelineTitle: 'Follow Message Timestamps',
  playbackTimelineSub: 'Replay at exact real-time gaps or proportional speed',
  playbackEvenTitle: 'Fixed Time Interval',
  playbackEvenSub: 'Send every message at a fixed interval (0.5s – 60s)',
  playbackIntervalLabel: (sec) => `Fixed interval: ${sec}s`,
  playbackStartLabel: 'Starting Position',
  playbackStartEmpty: 'Start from empty (replay all messages)',
  playbackStartFromMsg: (index, username, timestamp, preview) =>
    `Start from #${index} (${username} · ${timestamp}) ${preview}`,
  playbackNoMessages: 'No messages in this conversation. Add messages in Role-Switch Mode first.',
  playbackStartBtn: 'Start',
  playbackCapNote:
    '* Minimum interval is 0.5s. Click the red dot again while playing to reconfigure or stop.',
  toastPlaybackDone: 'Auto-playback finished',
  playbackAnchorLabel: 'Date Reference',
  playbackAnchorTodayTitle: 'Anchor to Today',
  playbackAnchorTodaySub: 'Same month shows "13日 23:13"; other month/year shows "2021年6月17日 15:30"',
  playbackAnchorFlowTitle: 'Dynamic (Follow Playback)',
  playbackAnchorFlowSub: 'Treats current playing message as "今日"; crossing midnight shifts older ones to "昨日"',
  linksSectionTitle: 'Links & Contact',
  reportIssueLabel: 'Report',
  setOfflineBtn: 'Set Offline',
  setOnlineBtn: 'Set Online',
  toastMemberOnline: (name) => `${name} is now Online`,
  toastMemberOffline: (name) => `${name} is now Offline`,
  mentionTargetBtn: (name) => `@${name}`,
  mentionPickerTitle: 'Mention a Character',
  deleteMessageBtn: 'Delete Message',
  toastMessageDeleted: 'Message deleted',
  sendMp4: 'MP4',
  sendMp3: 'MP3',
  sendFile: 'File',
  fileModalTitle: 'File Send Settings',
  toastFileSaved: 'File saved locally and sent',
  yearUnit: 'Y',
  monthUnit: 'M',
  dayUnit: 'D',
  statusOnlineBtn: 'Online',
  statusVoiceBtn: 'Voice Chat',
  statusOfflineBtn: 'Offline',
  toastMemberVoice: (name) => `${name} moved to Voice Chat`,
  removeCharBtn: 'Remove Character',
  toastCharRemoved: (name) => `Removed character "${name}"`,
  toastCannotRemoveLastChar: 'At least one character must remain',
  homepageLabel: 'Home',
  tutorialLabel: 'Guide',
  githubLabel: 'GitHub',
  bilibiliLabel: 'Bilibili',
  playbackTimelineModeLabel: 'Timeline Flow Mode',
  playbackTimelineExact: 'Exact Real-Time Flow',
  playbackTimelineExactSub: 'Wait the exact minute difference between messages (min 0.5s)',
  playbackTimelineProp: 'Proportional Speed',
  playbackTimelinePropSub: 'Scale message gaps proportionally (0.5s – 60s)',
  playbackSpeedLabel: (scale) => `Speed scale: ${scale}×`,
  videoTutorialSectionLabel: 'Video Tutorials',
  videoTutorialTitle: 'Bilibili',
  youtubeTutorialTitle: 'YouTube',
  videoTutorialBtn: 'Watch',
  templatePageBtn: 'UI Template',
  templatePageTitle: 'Nightcord Core UI Open-Source Template',
  templatePageSubtitle:
    'A clean, standalone UI template extracted from this Nightcord app (window chrome, sidebar member list, chat stream, file cards, and composer bar) ready for reuse in open-source projects.',
  templateBackBtn: 'Back to App',
  templatePreviewTitle: 'Live Core UI Preview',
  templatePreviewDesktop: 'Desktop',
  templatePreviewMobile: 'Mobile Width',
  templatePaletteTitle: 'Color Tokens (Click to Copy)',
  templateCodeTitle: 'Ready-to-Use Template Source',
  templateCopyCodeBtn: 'Copy Code',
  templateCopiedBtn: 'Copied',
  templateDownloadBtn: 'Download File',
  templateArchitectureTitle: 'Structure & Reuse Guide',
  templateArchitectureDesc:
    'The core UI consists of four clean layers: top 3-dot bar (#211A2C), sidebar with channel & voice/offline lists (#2E243D), message stream with file cards (#3F3352), and bottom input bar (#332844). Grab either the React + Tailwind TSX component or the zero-dependency single-file HTML template below.',
  templateLicenseNote:
    'Original code & UI template licensed under CC BY-NC-SA 4.0; characters & Nightcord IP belong to SEGA.',
  templateCopiedColor: (hex) => `Copied color ${hex}`,
  statusAddTimeToggle: 'Add time to status switch',
  statusAddTimeHint: 'Hidden from view; replays in sync with chat messages during auto-playback.',
  statusTimeInvalid: 'Enter a valid time (HH:MM)',
  statusTimeSyncBtn: 'Sync Time',
  statusScheduledListLabel: (count) => `Scheduled switches (${count})`,
  toastStatusEventAdded: (name, statusLabel, timeLabel) =>
    `Scheduled ${name} -> "${statusLabel}" at ${timeLabel} (plays during auto-playback)`,
  toastStatusEventRemoved: 'Removed scheduled status switch',
  toastStatusEventsCleared: 'Cleared all scheduled status switches for this chat',
  playbackStatusSyncLabel: 'Sidebar Member Status Sync',
  playbackStatusSyncOnTitle: 'Play Member Status Switches',
  playbackStatusSyncOnSub: (count) =>
    count > 0
      ? `Replay ${count} recorded sidebar switch(es) alongside chat messages`
      : 'Sync Online / Voice / Offline switches scheduled on sidebar members',
  playbackStatusSyncOffTitle: 'Messages Only',
  playbackStatusSyncOffSub: 'Keep sidebar member statuses fixed while replaying chat messages',
  playbackStatusEventsManage: (count) => `Manage scheduled switches (${count})`,
  playbackClearStatusEventsBtn: 'Clear All',
  aiModeBtn: 'AI Chat Mode',
  aiModeBackBtn: 'Back to Main Page',
  aiModeActiveBadge: 'Active',
  aiCharSettingsBtn: 'AI Settings',
  aiReadyBadge: 'Ready',
  aiUnconfiguredBadge: 'No Key',
  aiCharModalTitle: (name) => `${name} · Settings`,
  aiProtocolLabel: 'Protocol',
  aiProtocolOpenai: 'OpenAI Compatible',
  aiProtocolDeepseek: 'DeepSeek Official (api.deepseek.com)',
  aiProtocolGemini: 'Google Gemini API',
  aiProtocolAnthropic: 'Anthropic Claude API',
  aiBaseUrlLabel: 'Base URL',
  aiBaseUrlHint: 'Sent straight from your browser. Use an official or CORS-friendly endpoint.',
  aiResetDefaultUrl: 'Default',
  aiApiKeyLabel: 'API Key',
  aiApiKeyPlaceholder: 'Paste your API Key',
  aiLocalOnlyNote: 'Saved only in this browser. Never uploaded to any server.',
  aiUsingGlobalKeyBadge: 'Using shared key',
  aiModelLabel: 'Model',
  aiFetchModelsBtn: 'Fetch List',
  aiFetchingModels: 'Loading...',
  aiFetchModelsOk: (count) => `Loaded ${count} models`,
  aiFetchModelsFail: 'Could not load list; pick a preset or enter a model ID',
  aiCustomModelPlaceholder: 'Model ID (e.g. deepseek-chat / gpt-4o-mini)',
  aiPromptLabel: 'Character Notes & Tone',
  aiPromptPlaceholder: 'Personality, quirks, tone, and how they talk with you...',
  toastAiCharSaved: (name) => `Saved settings for "${name}"`,
  aiGlobalModalTitle: 'AI Settings',
  aiGlobalModalSub: 'Set up your profile, shared context, chat pacing, and API connections.',
  aiGlobalTabProfile: 'Profile & World',
  aiGlobalTabChat: 'Chat & Timing',
  aiGlobalTabApi: 'API & Members',
  aiGlobalApiToggle: 'Use a shared API Key',
  aiGlobalApiDesc: 'Lets members without their own key reply using this connection.',
  aiFollowUpToggle: 'Let another member chime in occasionally',
  aiFollowUpDesc: 'After one member replies, another online member may follow up once at the set chance.',
  aiFollowUpProbLabel: (prob) => `Chime-in chance: ${prob}%`,
  aiUserIdentityTitle: 'Your Profile',
  aiUserNamePlaceholder: 'Display name (default: あなた)',
  aiUserAvatarLabel: 'Your Avatar',
  aiUploadAvatarBtn: 'Upload Avatar',
  aiResetAvatarBtn: 'Reset Default',
  aiUserPersonaLabel: 'About You',
  aiUserPersonaPlaceholder: 'Who you are in this group, how you write or work together...',
  aiWorldviewTitle: 'Shared Setting & Context',
  aiWorldviewPlaceholder: 'Shared background, late-night session context, or story notes...',
  aiTimeModeTitle: 'Message Timestamps',
  aiTimeModeRealtime: 'Device Clock',
  aiTimeModeRealtimeSub: 'Uses your current local time and keeps messages moving forward.',
  aiTimeModeInferred: 'AI Picks Fitting Times',
  aiTimeModeInferredSub: 'Chooses natural dates and times for the scene without ever going backwards.',
  aiCharPromptSectionTitle: 'Per-Member Setup',
  aiCharPromptSectionDesc: 'Synced live with sidebar long-press settings; offline members stay quiet.',
  aiConfiguredCharsCount: (ready, total) => `${ready} / ${total} ready`,
  toastAiGlobalSaved: 'Saved AI settings',
  aiEmptyTitle: (title) => `${title}`,
  aiEmptySub: 'Type below to start chatting. Use the cyan dot or "25時▾" for settings, and the yellow dot for group auto-chat.',
  aiEmptyReadySummary: (ready, total) => `Online & ready: ${ready} / ${total}`,
  aiOpenGlobalQuickBtn: 'Open AI Settings',
  aiOpenGuideBtn: 'Beginner Guide',
  aiHeaderGuideBtn: 'Guide',
  aiOwnKeyBadge: 'Own key',
  aiNoKeyStatusBadge: 'No key',
  aiOfflineStatusBadge: 'Offline',
  aiGeneratingStatus: (name) => `${name} is typing...`,
  aiToastBusy: 'Waiting for the current reply to finish...',
  aiToastNoConfiguredChar: 'No online member has a key yet. Long-press a member on the left or open AI Settings in "25時▾".',
  aiToastAllOffline: 'All configured members are offline. Switch someone to Online or Voice Chat in the sidebar.',
  aiToastCharOffline: (name) => `${name} is offline right now`,
  aiToastTargetMissingKey: (name) => `${name} needs an API Key first`,
  aiToastRequestFailed: (name, reason) => `${name} could not reply (${reason})`,
  aiGuideTitle: 'AI Beginner Guide',
  aiGuideBadges: ['1 / 5', '2 / 5', '3 / 5', '4 / 5', '5 / 5'],
  aiGuideStep1Title: 'Clean View, Profile & Web Search',
  aiGuideStep1Desc:
    'The main screen stays true to Nightcord while letting you message right away. Open "25時、ナイトコードで。▾" or click the cyan dot to set your profile, worldview, and web search.',
  aiGuideStep1Note: 'Everything—including settings, usage tracking, and this guide—is tucked inside the "25時、ナイトコードで。▾" menu.',
  aiGuideStep2Title: 'DeepSeek & Per-Member Connections',
  aiGuideStep2Desc:
    'Use a shared key or long-press any member on the left to configure OpenAI-compatible, DeepSeek, Gemini, or Claude endpoints and character notes in real time.',
  aiGuideStep3Title: 'Presence Awareness & Natural Pacing',
  aiGuideStep3Desc:
    'Voice, muted, text-only, and offline states sync directly to the AI. With AI timing enabled, 5 frequency levels shape natural gaps via metadata—never pasted into chat text.',
  aiGuideStep4Title: 'Reply Language & Yellow-Dot Auto Chat',
  aiGuideStep4Desc:
    'Pick a reply language (Auto, 简体中文, 繁體中文, English, or 日本語) without changing character personality or UI text. Click the yellow dot to let members chat on their own, and click it again to stop.',
  aiGuideStep5Title: 'Usage Monitor, Message Actions & Copy to Main',
  aiGuideStep5Desc:
    'Check real token counts in "API Usage Monitor" ("Unknown" when a provider omits them). Long-press messages to edit, regenerate, or delete, or copy the chat back to the main page.',
  aiGuideOpenConfigBtn: 'Open AI Settings',
  editMessageBtn: 'Edit',
  regenerateMessageBtn: 'Regenerate',
  saveEditBtn: 'Save',
  toastMessageUpdated: 'Message updated',
  aiHeaderContinueBtn: 'Continue',
  aiHeaderStopBtn: 'Stop',
  aiHeaderSettingsBtn: 'Settings',
  aiDropdownSettingsBtn: 'AI Settings',
  aiDropdownContinueBtn: 'Continue',
  aiDropdownAutoChatBtn: 'Auto Chat',
  aiUserAvatarPresetLabel: 'Quick Avatar',
  aiReplyLengthLabel: 'Reply Length',
  aiReplyLengthShort: 'Short',
  aiReplyLengthNormal: 'Normal',
  aiReplyLengthDetailed: 'Detailed',
  aiTemperatureLabel: (temp) => `Temperature: ${temp.toFixed(2)}`,
  aiCharTempUseGlobalBtn: 'Use Global',
  aiFillPresetBtn: 'Use Nightcord Preset',
  aiToastPresetFilled: (name) => `Loaded preset for ${name}`,
  aiTestConnBtn: 'Test Connection',
  aiTestingConnBtn: 'Testing...',
  aiTestConnOk: (latencyMs, model) => `Connected (${latencyMs}ms · ${model})`,
  aiTestConnFail: (detail) => `Failed: ${detail}`,
  aiExportTranscriptBtn: 'Export Chat (.txt)',
  aiToastTranscriptExported: 'Saved chat transcript',
  aiToastAborted: 'Stopped reply',
  aiToastPartialOffline: (names) => `Skipped offline: ${names}`,
  aiToastPartialMissingKey: (names) => `Skipped unconfigured: ${names}`,
  aiWebSearchToggle: 'Allow Web Search',
  aiWebSearchDesc: 'Lets members look up recent facts or references when the topic calls for it.',
  aiGuideMenuBtn: 'AI Beginner Guide',
  aiCopyToMainBtn: 'Copy Chat to Main',
  copyAiToMainModalTitle: 'Copy to Main Page',
  copyAiToMainModalSub: 'Name the new conversation to save this chat history on the main page.',
  copyAiToMainLabel: 'Conversation Name',
  copyAiToMainPlaceholder: 'e.g. Late Night Session',
  copyAiToMainSummary: (count) => `${count} message(s) will be copied`,
  copyAiToMainConfirm: 'Create & Copy',
  toastCopiedAiToMain: (title) => `Saved copy to "${title}"`,
  aiAutoChatModalTitle: 'Group Auto-Chat',
  aiAutoChatModalSub: 'Online members keep talking turn by turn. Click the top-right yellow dot again anytime to stop.',
  aiAutoChatRandomPresenceToggle: 'Vary online, voice & mute status',
  aiAutoChatRandomPresenceDesc: 'Occasionally switches member status between turns while keeping at least one ready member online.',
  aiAutoChatIntervalLabel: (sec) => `Pace: ${sec}s`,
  aiAutoChatStartBtn: 'Start',
  aiAutoChatToastStarted: 'Group auto-chat started (click yellow dot to stop)',
  aiAutoChatToastStopped: 'Stopped group auto-chat',
  aiAutoChatHeaderStopBtn: 'Stop Auto',
  aiTimeFrequencyLabel: 'Chat Frequency',
  aiTimeFreqHigh: 'High',
  aiTimeFreqHighDesc: 'Quick replies within minutes, with rare brief pauses.',
  aiTimeFreqSomewhatHigh: 'Moderately High',
  aiTimeFreqSomewhatHighDesc: 'Mostly short gaps with occasional longer breaks.',
  aiTimeFreqBalanced: 'Balanced',
  aiTimeFreqBalancedDesc: 'Natural mix of quick back-and-forth and multi-hour gaps.',
  aiTimeFreqSomewhatLow: 'Moderately Low',
  aiTimeFreqSomewhatLowDesc: 'Longer pauses with occasional bursts of replies.',
  aiTimeFreqLow: 'Low',
  aiTimeFreqLowDesc: 'Spaced-out check-ins, often hours apart.',
  aiOutputLanguageLabel: 'Reply Language',
  aiOutputLanguageHint: 'Sets only the language used in replies without changing personality or UI language.',
  aiOutputLangAuto: 'Auto',
  aiOutputLangZhCn: '简体中文',
  aiOutputLangZhTw: '繁體中文',
  aiOutputLangEn: 'English',
  aiOutputLangJa: '日本語',
  aiUsageBtn: 'API Usage Monitor',
  aiUsageModalTitle: 'API Usage Monitor',
  aiUsageModalSub: 'Counts actual tokens reported by provider responses without making extra requests.',
  aiUsageSessionTitle: 'This Session',
  aiUsageHistoryTitle: 'All-Time Saved',
  aiUsageResetSessionBtn: 'Reset Session',
  closeModal: 'Close',
  aiUsageToastSessionReset: 'Cleared session counts (saved history kept)',
  aiUsageRequestsLabel: 'Requests',
  aiUsageKnownRequestsLabel: 'Reported',
  aiUsageUnknownRequestsLabel: 'No data',
  aiUsageInputLabel: 'Input',
  aiUsageOutputLabel: 'Output',
  aiUsageTotalLabel: 'Total',
  aiUsageThinkingLabel: 'Thinking',
  aiUsageCachedLabel: 'Cached',
  aiUsageExtraLabel: 'Other',
  aiUsageUnknown: 'Unknown',
  aiUsagePartialUnknownNote: (unknownCount) => `+${unknownCount} without data`,
  aiUsageCostNotice: 'Shows raw token counts from API responses only (separate from billing). Omitted fields stay labeled "Unknown".',
  aiUsageBreakdownTitle: 'Request Log',
  aiUsageFilterSession: 'Session',
  aiUsageFilterHistory: 'All History',
  aiUsageNoRecords: 'No API requests recorded yet.',
  aiUsageStatusOk: 'OK',
  aiUsageStatusError: 'Error',
  aiUsagePurposeChat: 'Reply',
  aiUsagePurposeFollowUp: 'Follow-up',
  aiUsagePurposeAutoChat: 'Auto Chat',
  aiUsagePurposeContinue: 'Continue',
  aiUsagePurposeRegenerate: 'Regenerate',
  aiUsagePurposeTimeAnalysis: 'Time Check',
  aiUsagePurposeTest: 'Test',
};

export function getUiText(lang: UiLanguage): UiText {
  if (lang === 'zh') {
    return ZH_TEXT;
  }
  if (lang === 'en') {
    return EN_TEXT;
  }
  return JA_TEXT;
}
