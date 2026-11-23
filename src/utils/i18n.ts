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
  toastImportSuccess: (count: number) => string;
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
    'メニューの「AIチャットモード」に入ると、没入モードのまま直接送信してAIキャラと会話できます。DeepSeek等のAPI設定、世界観・自分のプロフィール／アバター、送信時刻ルール（リアルタイム／AI推定）、オンライン限定返信、ダミーファイル送信、画面上部のガイドボタンを備えています。',
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
  toastExportSuccess: 'ローカルデータをファイルに書き出しました',
  toastImportSuccess: (count) => `ローカルデータを読み込みました（${count}件の会話）`,
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
  aiModeBtn: 'AIチャットモード',
  aiModeBackBtn: '通常モードに戻る',
  aiModeActiveBadge: 'AI実行中',
  aiCharSettingsBtn: 'AIチャット設定',
  aiReadyBadge: '設定済み',
  aiUnconfiguredBadge: 'Key未設定',
  aiCharModalTitle: (name) => `${name} のAIチャット設定`,
  aiProtocolLabel: 'AIプロトコル',
  aiProtocolOpenai: 'OpenAI 互換（汎用デフォルト）',
  aiProtocolDeepseek: 'DeepSeek 公式 (api.deepseek.com)',
  aiProtocolGemini: 'Google Gemini API',
  aiProtocolAnthropic: 'Anthropic Claude API',
  aiBaseUrlLabel: 'リンク先 URL（未変更時はデフォルト使用）',
  aiBaseUrlHint: 'ブラウザから直接リクエストします。一般的なOpenAI互換プロキシにも対応。',
  aiResetDefaultUrl: 'デフォルトに戻す',
  aiApiKeyLabel: 'API Key（このブラウザのローカルのみに保存）',
  aiApiKeyPlaceholder: 'sk-... または各サービスのAPI Key',
  aiLocalOnlyNote: '※ サーバーへ送信・保存されず、この端末のローカルストレージにのみ保存されます。',
  aiUsingGlobalKeyBadge: 'グローバルAPI Keyで動作可能',
  aiModelLabel: 'モデル選択',
  aiFetchModelsBtn: 'モデル取得',
  aiFetchingModels: '取得中...',
  aiFetchModelsOk: (count) => `${count}件のモデルを取得しました`,
  aiFetchModelsFail: '取得に失敗しました。手入力も可能です',
  aiCustomModelPlaceholder: 'カスタムモデル名を手入力（例：deepseek-chat / gpt-4o-mini）',
  aiPromptLabel: 'プリセットプロンプト（システム設定）',
  aiPromptPlaceholder: 'キャラクターの性格・口調・関係性・返信ルールなどを入力...',
  toastAiCharSaved: (name) => `「${name}」のAI設定をローカルに保存しました`,
  aiGlobalModalTitle: 'AI グローバル設定',
  aiGlobalModalSub: '自分の設定・世界観・時刻ルール・全体APIや全キャラの個別API設定をまとめて管理できます。',
  aiGlobalApiToggle: 'グローバル API Key を有効にする',
  aiGlobalApiDesc: 'オンにすると、個別Key未設定のキャラも共通のプロトコル（OpenAI / DeepSeek / Gemini / Anthropic）・URL・Keyで返信できます。',
  aiFollowUpToggle: 'AI同士の確率追撃返信',
  aiFollowUpDesc: 'あるAIの返信後、設定確率で別のオンライン・設定済みAIが1回だけ続けて反応します。',
  aiFollowUpProbLabel: (prob) => `追撃発生確率：${prob}%`,
  aiUserIdentityTitle: '自分のプロフィール設定',
  aiUserNamePlaceholder: '表示名（デフォルト：あなた）',
  aiUserAvatarLabel: '自分のアバター',
  aiUploadAvatarBtn: '画像をアップロード',
  aiResetAvatarBtn: 'デフォルトに戻す',
  aiUserPersonaLabel: '自分の設定・立場（AIへ共有）',
  aiUserPersonaPlaceholder: '例：ナイトコードに曲や依頼を持ち込む作曲担当／友人、口調や関係性など...',
  aiWorldviewTitle: '共通の世界観・背景設定',
  aiWorldviewPlaceholder: 'すべてのAIキャラクターに共通で渡す世界観・舞台設定・深夜の作業状況などを入力...',
  aiTimeModeTitle: 'AI返信の送信時刻ルール',
  aiTimeModeRealtime: 'ローカル実時刻（リアルタイム）',
  aiTimeModeRealtimeSub: '送信時点の端末の現在時刻を使用し、直前メッセージより前にならないよう補正します。',
  aiTimeModeInferred: 'AIが時刻を自動推論（時系列保証）',
  aiTimeModeInferredSub: '直前メッセージ以降の範囲で、物語や深夜会話に自然な日時・時刻をAIが自動で付けます。',
  aiCharPromptSectionTitle: 'キャラ別 API・プロンプト設定（完全同期）',
  aiCharPromptSectionDesc: 'プロトコル・URL・API Key・モデル・プロンプトをフル編集でき、左メンバー長押しとリアルタイム同期します（オフラインメンバーは返信対象外）。',
  aiConfiguredCharsCount: (ready, total) => `オンライン返信可能：${ready} / ${total} 名`,
  toastAiGlobalSaved: 'AIグローバル設定をローカルに保存しました',
  aiEmptyTitle: (title) => `「${title}」空白 AIチャットテンプレート`,
  aiEmptySub: '下の入力欄から直接送信できます。オンライン＆API設定済みキャラからランダム返信、@キャラ名で指名返信、デモ曲などのファイルカード送信にも対応します。',
  aiEmptyReadySummary: (ready, total) => `現在の返信可能（オンライン）キャラ：${ready} / ${total} 名`,
  aiOpenGlobalQuickBtn: 'AI グローバル設定を開く',
  aiOpenGuideBtn: '使い方ガイドを見る',
  aiHeaderGuideBtn: 'ガイド',
  aiOwnKeyBadge: '個別API Key使用中',
  aiNoKeyStatusBadge: 'Key未設定（返信対象外）',
  aiOfflineStatusBadge: 'オフライン中（返信対象外）',
  aiGeneratingStatus: (name) => `${name} が入力中...`,
  aiToastBusy: 'AIが返信を生成中です。少しお待ちください',
  aiToastNoConfiguredChar: 'API Key設定済みかつオンラインのキャラがいません。左のキャラ長押しまたは右上の青い点から設定してください。',
  aiToastAllOffline: '設定済みのキャラがすべてオフラインです。左メンバー長押しで「オンライン」または「通話中」にすると返信できます。',
  aiToastCharOffline: (name) => `「${name}」は現在オフラインのため返信できません`,
  aiToastTargetMissingKey: (name) => `「${name}」はAPI Key未設定のため返信できません`,
  aiToastRequestFailed: (name, reason) => `${name} のAI返信に失敗しました（${reason}）`,
  aiGuideTitle: 'AIチャットモード ガイド',
  aiGuideBadges: ['ガイド 1 / 5', 'ガイド 2 / 5', 'ガイド 3 / 5', 'ガイド 4 / 5', 'ガイド 5 / 5'],
  aiGuideStep1Title: '完全静的直連・自分のプロフィール＆世界観',
  aiGuideStep1Desc:
    '元のNightcordUIのまま、ブラウザからAPIへ直接リクエストします。右上の青い点（グローバル設定）で「自分の名前・アバター・設定」と全AI共通の「世界観」を設定できます。',
  aiGuideStep1Note: '※ 画面右上の「ガイド」ボタンや左上メニューからいつでもこの説明を開けます。',
  aiGuideStep2Title: 'DeepSeekプリセット＆キャラ別フルAPI設定',
  aiGuideStep2Desc:
    '左メンバー長押し（右クリック）でもグローバル設定内でも、OpenAI互換・DeepSeek公式プリセット・Gemini・Claudeの全プロトコル、URL、API Key、モデル取得、プロンプトを個別に設定できます。',
  aiGuideStep3Title: 'オフライン状態連動＆AI時刻モード',
  aiGuideStep3Desc:
    '左側で「オフライン」になっているキャラは自動抽選・追撃・@指名のいずれでも返信しません。また返信時刻は「ローカル実時刻」か「AIが会話に合わせて推定（直前より前にはならない）」から選べます。',
  aiGuideStep4Title: '直接送信・@指名・AIファイル送信カード',
  aiGuideStep4Desc:
    '下部から直接送信し、@キャラ名 で指名できます。たとえば「@K デモ作って送って」と頼むとAIが「.mp3」などのファイル風カード（表示専用ダミー）も会話に送信できます。',
  aiGuideStep5Title: 'メッセージ長押しで再生成・編集・削除',
  aiGuideStep5Desc:
    '送信済みの発言は長押し（右クリック）で「再生成」「編集」「削除」が可能。AI同士の確率追撃返信をオンにすれば、返信後に別のオンラインキャラが自動で一言反応します。',
  aiGuideOpenConfigBtn: '今すぐAIグローバル設定を開く',
  editMessageBtn: '編集',
  regenerateMessageBtn: '再生成',
  saveEditBtn: '保存',
  toastMessageUpdated: 'メッセージを更新しました',
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
  step6Title: 'AI 对话模式（纯静态本地直连）',
  step6Desc:
    '在左侧菜单点击「AI 对话模式」进入全新对话页。内置 DeepSeek 等多协议预设，可点击右上角小蓝点设置自己的名字/头像/人设、全局世界观、发送时间模式（本地实时或 AI 推演）与完整单角色 API；支持离线角色屏蔽回复、AI 发送文件空壳卡片（如 .mp3），页面顶部还配有独立使用引导。',
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
  toastExportSuccess: '已将本地对话与消息导出为文件',
  toastImportSuccess: (count) => `已导入本地文件（共 ${count} 个对话）`,
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
  aiCharSettingsBtn: 'AI 对话设置',
  aiReadyBadge: '已就绪',
  aiUnconfiguredBadge: '未填Key',
  aiCharModalTitle: (name) => `${name} 的 AI 对话设置`,
  aiProtocolLabel: 'AI 协议',
  aiProtocolOpenai: 'OpenAI 兼容协议（通用默认）',
  aiProtocolDeepseek: 'DeepSeek 官方 (api.deepseek.com)',
  aiProtocolGemini: 'Google Gemini 原生协议',
  aiProtocolAnthropic: 'Anthropic Claude 协议',
  aiBaseUrlLabel: '链接地址（不修改则默认通用地址）',
  aiBaseUrlHint: '纯静态浏览器直连请求，支持官方地址或支持浏览器 CORS 的第三方兼容地址。',
  aiResetDefaultUrl: '恢复默认',
  aiApiKeyLabel: 'API Key（仅保存在本地）',
  aiApiKeyPlaceholder: '输入你的 API Key（不填且未开全局Key则不会回复）',
  aiLocalOnlyNote: '※ 仅保存在当前浏览器的本地存储中，不经过任何后端代理服务器。',
  aiUsingGlobalKeyBadge: '已启用全局 API Key 兜底',
  aiModelLabel: '选择或输入模型',
  aiFetchModelsBtn: '拉取模型',
  aiFetchingModels: '拉取中...',
  aiFetchModelsOk: (count) => `已拉取 ${count} 个模型`,
  aiFetchModelsFail: '拉取失败，可直接选择预设或手动填写模型名',
  aiCustomModelPlaceholder: '手动输入模型 ID（例：deepseek-chat / gpt-4o-mini）',
  aiPromptLabel: '预设提示词',
  aiPromptPlaceholder: '输入该角色的性格设定、口癖、背景与回复要求...',
  toastAiCharSaved: (name) => `已保存「${name}」的 AI 设置`,
  aiGlobalModalTitle: 'AI 全局设置面板',
  aiGlobalModalSub: '管理全局 API、自己的身份/头像/设定、全局世界观、时间规则，以及完整单角色 API 配置。',
  aiGlobalApiToggle: '开启全局 API Key',
  aiGlobalApiDesc: '开启后，未单独填写 API Key 的角色也会使用下方通用协议（OpenAI / DeepSeek / Gemini / Anthropic）与全局 Key 回复。',
  aiFollowUpToggle: 'AI 概率回复一次其他 AI 的发言',
  aiFollowUpDesc: '某个 AI 回复后，按设定概率再随机触发另一名在线且已就绪的 AI 接话回复一次。',
  aiFollowUpProbLabel: (prob) => `概率回复触发率：${prob}%`,
  aiUserIdentityTitle: '我的个人设定（名字 / 头像 / 人设）',
  aiUserNamePlaceholder: '显示名称（默认：あなた）',
  aiUserAvatarLabel: '我的头像',
  aiUploadAvatarBtn: '上传头像',
  aiResetAvatarBtn: '恢复默认',
  aiUserPersonaLabel: '我的设定 / 身份简介（发给 AI）',
  aiUserPersonaPlaceholder: '例：擅长编曲或作词的社团成员，性格温和或毒舌，与众人的关系说明...',
  aiWorldviewTitle: '全局世界观设定（发给所有 AI）',
  aiWorldviewPlaceholder: '输入共通世界观、深夜连线背景、当前活动设定或全员共识...',
  aiTimeModeTitle: '发送时间推演方式',
  aiTimeModeRealtime: '按本地实时时间',
  aiTimeModeRealtimeSub: '以当前设备本地时间为准，自动保证不早于上一条消息的时间。',
  aiTimeModeInferred: '让 AI 推演合适时间（不早于前条）',
  aiTimeModeInferredSub: '由 AI 根据上下文自行判断合理的发送日期与时间，且严格限制不早于上一条消息。',
  aiCharPromptSectionTitle: '单角色完整 API 与提示词设置（实时互通）',
  aiCharPromptSectionDesc: '与左侧长按角色面板拥有完整一致的协议、URL、API Key、模型与提示词设置，并实时同步；离线角色不会参与回复。',
  aiConfiguredCharsCount: (ready, total) => `在线可回复：${ready} / ${total}`,
  toastAiGlobalSaved: '已保存 AI 全局设置',
  aiEmptyTitle: (title) => `「${title}」空白 AI 对话模板`,
  aiEmptySub: '底部可直接发送消息！在线且已就绪的角色会参与随机回复，输入 @角色名 可指定回复，AI 还能发出 .mp3/.mp4 等文件卡片空壳。',
  aiEmptyReadySummary: (ready, total) => `当前在线可回复角色：${ready} / ${total}`,
  aiOpenGlobalQuickBtn: '打开 AI 全局设置',
  aiOpenGuideBtn: '查看使用引导',
  aiHeaderGuideBtn: '使用引导',
  aiOwnKeyBadge: '使用独立 API Key',
  aiNoKeyStatusBadge: '未填 Key（不会参与回复）',
  aiOfflineStatusBadge: '当前离线（不会回复）',
  aiGeneratingStatus: (name) => `${name} 正在思考回复...`,
  aiToastBusy: 'AI 正在生成回复，请稍候…',
  aiToastNoConfiguredChar: '当前没有在线且已填 API Key 的角色，请长按左侧角色或点击右上角小蓝点设置。',
  aiToastAllOffline: '已填 Key 的角色目前全部处于离线状态，请在左侧切换为「在线」或「语音中」后再试。',
  aiToastCharOffline: (name) => `角色「${name}」目前处于离线状态，不会回复`,
  aiToastTargetMissingKey: (name) => `角色「${name}」尚未填写 API Key，无法回复`,
  aiToastRequestFailed: (name, reason) => `${name} 请求 AI 失败（${reason}）`,
  aiGuideTitle: 'AI 对话模式使用引导',
  aiGuideBadges: ['引导 1 / 5', '引导 2 / 5', '引导 3 / 5', '引导 4 / 5', '引导 5 / 5'],
  aiGuideStep1Title: '纯静态直连 · 我的设定与全局世界观',
  aiGuideStep1Desc:
    '保留原版 Nightcord 界面并开放底部直发，请求全部由浏览器本地直连发出。点右上角第 1 个小蓝点即可设置「我的名字、头像、人设」和共享给所有 AI 的「全局世界观」。',
  aiGuideStep1Note: '※ 聊天标题栏右上角随时提供「使用引导」按钮，也可从左上菜单返回主页面。',
  aiGuideStep2Title: 'DeepSeek 预设 · 完整单角色 API 设置',
  aiGuideStep2Desc:
    '无论是长按（右键）左侧角色，还是在右上小蓝点全局面板内切换角色，都可以完整设置协议（OpenAI / DeepSeek 官方预设 / Gemini / Claude）、链接地址、API Key、拉取模型与预设提示词，两边数据实时互通。',
  aiGuideStep3Title: '离线角色不回复 · 两种时间控制模式',
  aiGuideStep3Desc:
    '左侧栏处于「离线」状态的角色不会参与随机抽选、概率追击或 @点名回复。时间方面可在全局面板选择「本地实时时间」或「AI 推演合适时间」，系统会保证任何新消息都不早于上一条。',
  aiGuideStep4Title: '直接发消息 · @点名 · AI 发送文件卡片',
  aiGuideStep4Desc:
    '直接发消息可 @角色名 定向对话；当你让角色“做完 demo 发群里”时，AI 会自动在聊天中发出一张 Nightcord 风格的 .mp3 / .txt / .mp4 文件卡片空壳（纯展示，无需真实文件）。',
  aiGuideStep5Title: '长按消息重生成／编辑 · 概率接话',
  aiGuideStep5Desc:
    '长按或右键任意一条消息可选择「重新生成」、「编辑」或「删除」。开启全局「概率接话」后，每条 AI 回复还有机会触发另一位在线角色顺口接一句。',
  aiGuideOpenConfigBtn: '立即打开 AI 全局设置',
  editMessageBtn: '编辑',
  regenerateMessageBtn: '重新生成',
  saveEditBtn: '保存修改',
  toastMessageUpdated: '已保存消息修改',
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
  step6Title: 'AI Chat Mode (Direct Browser Fetch)',
  step6Desc:
    'Open "AI Chat Mode" from the server menu to chat directly in Immersive Mode. Supports DeepSeek & multi-protocol presets, your avatar/name/persona, shared worldview, full per-character API settings, online-only gating, realtime or AI-inferred timestamps, dummy file cards (e.g. .mp3), and a standalone top-bar guide.',
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
  toastExportSuccess: 'Exported local backup file',
  toastImportSuccess: (count) => `Imported local backup (${count} conversations)`,
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
  aiCharSettingsBtn: 'AI Chat Settings',
  aiReadyBadge: 'Ready',
  aiUnconfiguredBadge: 'No Key',
  aiCharModalTitle: (name) => `AI Settings · ${name}`,
  aiProtocolLabel: 'AI Protocol',
  aiProtocolOpenai: 'OpenAI Compatible (Default)',
  aiProtocolDeepseek: 'DeepSeek Official (api.deepseek.com)',
  aiProtocolGemini: 'Google Gemini API',
  aiProtocolAnthropic: 'Anthropic Claude API',
  aiBaseUrlLabel: 'Base URL (Defaults to Generic Endpoint)',
  aiBaseUrlHint: 'Direct browser fetch; works with official APIs or CORS-enabled compatible endpoints.',
  aiResetDefaultUrl: 'Reset Default',
  aiApiKeyLabel: 'API Key (Saved Locally Only)',
  aiApiKeyPlaceholder: 'Enter API Key (required unless Global Key is on)',
  aiLocalOnlyNote: '* Stored strictly in local browser storage; never uploaded to a backend.',
  aiUsingGlobalKeyBadge: 'Fallback to Global API Key active',
  aiModelLabel: 'Model Selection',
  aiFetchModelsBtn: 'Fetch Models',
  aiFetchingModels: 'Fetching...',
  aiFetchModelsOk: (count) => `Loaded ${count} models`,
  aiFetchModelsFail: 'Could not fetch models; pick a preset or type manually',
  aiCustomModelPlaceholder: 'Enter model ID (e.g. deepseek-chat / gpt-4o-mini)',
  aiPromptLabel: 'Preset System Prompt',
  aiPromptPlaceholder: 'Describe character persona, tone, catchphrases, and reply rules...',
  toastAiCharSaved: (name) => `Saved AI settings for "${name}"`,
  aiGlobalModalTitle: 'AI Global Settings',
  aiGlobalModalSub: 'Configure your profile & avatar, worldview, timestamp mode, global API, and complete per-character APIs.',
  aiGlobalApiToggle: 'Enable Global API Key',
  aiGlobalApiDesc: 'Allow characters without their own API Key to use this shared protocol (OpenAI / DeepSeek / Gemini / Anthropic), URL, and key.',
  aiFollowUpToggle: 'Probabilistic AI Follow-up Reply',
  aiFollowUpDesc: 'After an AI replies, roll the probability once for another online & ready AI to respond.',
  aiFollowUpProbLabel: (prob) => `Follow-up probability: ${prob}%`,
  aiUserIdentityTitle: 'Your Profile (Name / Avatar / Persona)',
  aiUserNamePlaceholder: 'Default: あなた',
  aiUserAvatarLabel: 'Your Avatar',
  aiUploadAvatarBtn: 'Upload Avatar',
  aiResetAvatarBtn: 'Reset Default',
  aiUserPersonaLabel: 'Your Persona / Role (Shared with AI)',
  aiUserPersonaPlaceholder: 'Describe who you are in this group chat, tone, and relationship with members...',
  aiWorldviewTitle: 'Shared Worldview / Setting',
  aiWorldviewPlaceholder: 'Enter shared worldview, setting rules, or current Nightcord session context passed to all AI models...',
  aiTimeModeTitle: 'Message Timestamp Mode',
  aiTimeModeRealtime: 'Local Real-Time Clock',
  aiTimeModeRealtimeSub: 'Uses your local device clock while guaranteeing timestamps never go earlier than the previous message.',
  aiTimeModeInferred: 'AI-Inferred Story Time (>= Prev)',
  aiTimeModeInferredSub: 'Let AI choose a fitting send date/time for each reply, strictly clamped at or after the previous message.',
  aiCharPromptSectionTitle: 'Complete Per-Character API & Prompt Settings',
  aiCharPromptSectionDesc: 'Full Protocol, URL, API Key, Model, and Prompt controls synced live with sidebar long-press settings; offline roles stay silent.',
  aiConfiguredCharsCount: (ready, total) => `Online & ready: ${ready} / ${total}`,
  toastAiGlobalSaved: 'Saved AI global settings',
  aiEmptyTitle: (title) => `Blank AI Chat Template · ${title}`,
  aiEmptySub: 'Send messages directly below! Online & configured roles reply randomly unless @mentioned, and can send Nightcord-style file shells (e.g. .mp3 demos).',
  aiEmptyReadySummary: (ready, total) => `Online & ready roles: ${ready} / ${total}`,
  aiOpenGlobalQuickBtn: 'Open AI Global Settings',
  aiOpenGuideBtn: 'Usage Guide',
  aiHeaderGuideBtn: 'Guide',
  aiOwnKeyBadge: 'Using own API Key',
  aiNoKeyStatusBadge: 'No API Key (inactive)',
  aiOfflineStatusBadge: 'Offline (will not reply)',
  aiGeneratingStatus: (name) => `${name} is typing...`,
  aiToastBusy: 'AI is generating a reply, please wait...',
  aiToastNoConfiguredChar: 'No online character has an API Key configured yet. Long-press a sidebar role or click the cyan dot.',
  aiToastAllOffline: 'All configured characters are currently Offline. Switch a member Online or to Voice in the sidebar.',
  aiToastCharOffline: (name) => `Character "${name}" is currently Offline and cannot reply`,
  aiToastTargetMissingKey: (name) => `Character "${name}" has no API Key configured`,
  aiToastRequestFailed: (name, reason) => `${name} failed to reply (${reason})`,
  aiGuideTitle: 'AI Chat Mode Guide',
  aiGuideBadges: ['Guide 1 / 5', 'Guide 2 / 5', 'Guide 3 / 5', 'Guide 4 / 5', 'Guide 5 / 5'],
  aiGuideStep1Title: 'Direct Browser Fetch · Profile & Worldview',
  aiGuideStep1Desc:
    'Chat inside the authentic Nightcord UI with direct browser API requests. Click the 1st cyan dot (top-right) to set your Name, Avatar, Persona, and the shared Worldview passed to every AI character.',
  aiGuideStep1Note: '* Open this guide anytime via the "Guide" button in the top chat header or return home from the server menu.',
  aiGuideStep2Title: 'DeepSeek Preset & Complete Per-Character APIs',
  aiGuideStep2Desc:
    'Both sidebar long-press and the Global Settings panel let you configure full Protocol (OpenAI / DeepSeek Official / Gemini / Anthropic), Base URL, API Key, Model fetch, and Prompt—kept in live sync.',
  aiGuideStep3Title: 'Offline Gating & Two Timestamp Modes',
  aiGuideStep3Desc:
    'Sidebar members marked Offline cannot be picked, @mentioned, or triggered for follow-ups. Pick Local Real-Time or AI-Inferred timestamps (clamped never to precede the previous message).',
  aiGuideStep4Title: 'Direct Send · @Mention · AI File Card Shells',
  aiGuideStep4Desc:
    'Send directly below or @mention a role. Asking someone to share a demo (e.g. @K send the demo mp3) lets the AI post a non-clickable Nightcord file card shell right in the chat.',
  aiGuideStep5Title: 'Long-Press to Regenerate, Edit & Follow-Up',
  aiGuideStep5Desc:
    'Long-press (or right-click) any message to Regenerate, Edit, or Delete. Enable probabilistic follow-ups in Global Settings so another online role may chime in automatically.',
  aiGuideOpenConfigBtn: 'Open AI Settings Now',
  editMessageBtn: 'Edit',
  regenerateMessageBtn: 'Regenerate',
  saveEditBtn: 'Save',
  toastMessageUpdated: 'Message updated',
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
