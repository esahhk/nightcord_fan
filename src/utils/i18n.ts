import type { UiLanguage } from '../types/nightcord';

export interface UiText {
  guideTitle: string;
  stepBadges: [string, string, string, string, string];
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
}

const JA_TEXT: UiText = {
  guideTitle: 'nightcord ガイド',
  stepBadges: ['ステップ 1 / 5', 'ステップ 2 / 5', 'ステップ 3 / 5', 'ステップ 4 / 5', 'ステップ 5 / 5'],
  step1Title: 'ガイドと操作UIの言語を選択',
  step1Desc:
    'ガイドと編集メニューの表示言語を選択してください。選択はローカルに保存されます。',
  step1Note:
    '※ 初期状態は「没入モード（閲覧専用・メッセージ送信不可）」で起動します。キャラクター名や没入モードの画面テキストは日本語のまま保持されます。',
  step2Title: '会話を切り替え・新規作成',
  step2Desc:
    '左上の「25時、ナイトコードで。▾」をクリックするとメニューが開きます。元の会話をテンプレートとして残したまま、新しい会話の追加・切替やローカルデータの書き出し／読み込みができます。',
  step3Title: 'キャラ切替・メディア送信・状態変更',
  step3Desc:
    '右上の青い点（1番目）を押すとロール切替モードになり、メッセージ送信が可能になります。キャラ作成、画像／MP4／MP3送信、日時指定、メンバー長押しでのオンライン／通話／オフライン切替（すべてローカル保存）が使えます。',
  step3Label: 'ロール切替・送信可能',
  step4Title: '没入モード（閲覧専用）に切り替え',
  step4Desc:
    '右上の黄色い点（2番目）を押すと編集ボタンがすべて隠れ、メッセージ送信も無効になった没入モードに戻ります。',
  step4Label: '没入モード・送信不可',
  step5Title: '自動再生モード（赤い点）',
  step5Desc:
    '右上の赤い点（3番目）を押すと自動で没入モードに切り替わり、メッセージを1件ずつ順番に再生できます。送信時刻の流速（完全実時間／等比例）や固定間隔（0.5秒〜60秒）、日時の基準や開始位置を自由に設定できます。',
  step5Label: '自動再生モード',
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
};

const ZH_TEXT: UiText = {
  guideTitle: 'nightcord 使用引导',
  stepBadges: ['步骤 1 / 5', '步骤 2 / 5', '步骤 3 / 5', '步骤 4 / 5', '步骤 5 / 5'],
  step1Title: '选择引导与操作界面语言',
  step1Desc: '请先选择后续引导及编辑按钮的显示语言，选择后会自动保存在本地。',
  step1Note:
    '※ 进入后默认处于「沉浸模式（仅浏览，无法发送消息）」。角色名称及沉浸模式中的聊天界面文本均保持日文原版显示。',
  step2Title: '切换与新建对话',
  step2Desc:
    '点击左上角的「25時、ナイトコードで。▾」即可展开菜单。原有对话会作为模板保留，你可以随时新建对话、导入/导出本地备份或重新打开新手教程。',
  step3Title: '角色切换、媒体发送与状态管理',
  step3Desc:
    '点击右上角第 1 个蓝色圆点进入角色切换模式后才能发送消息。支持自定义角色、发送图片/MP4/MP3（可编辑文件名）、自定义发送日期时间、长按头像 @ 角色、长按消息删除以及长按左侧成员切换在线/语音聊天/离线状态。',
  step3Label: '角色切换・可发消息',
  step4Title: '切换为沉浸模式（禁止发送）',
  step4Desc:
    '点击右上角第 2 个黄色圆点即可隐藏所有编辑按钮并禁止发送消息，回到纯净的沉浸浏览模式。',
  step4Label: '沉浸模式・禁止发送',
  step5Title: '消息自动播放模式（红色圆点）',
  step5Desc:
    '点击右上角第 3 个红色圆点后默认进入沉浸模式并弹出设置框，可按发送时间流速（完全真实流速或等比例倍率）或固定时间间隔（0.5 秒 – 60 秒）逐条自动发送消息，并可自由设定时间基准与起始位置。',
  step5Label: '自动播放模式',
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
};

const EN_TEXT: UiText = {
  guideTitle: 'nightcord Guide',
  stepBadges: ['Step 1 / 5', 'Step 2 / 5', 'Step 3 / 5', 'Step 4 / 5', 'Step 5 / 5'],
  step1Title: 'Choose Guide & Control Language',
  step1Desc:
    'Select the language for this tutorial and editing controls. Your preference is saved locally.',
  step1Note:
    '* The app launches in Immersive Mode (read-only). Character names and the Immersive Mode chat interface stay in the original Japanese.',
  step2Title: 'Switch & Create Conversations',
  step2Desc:
    'Click "25時、ナイトコードで。▾" in the top-left to switch or create conversations, export/import local backups, or reopen this tutorial anytime.',
  step3Title: 'Role-Switch Mode & Local Media',
  step3Desc:
    'Click the 1st cyan dot (top-right) to enter Role-Switch Mode and send messages. Customize characters, upload local images/MP4/MP3 with editable filenames, set custom dates, long-press avatars to @mention, long-press messages to delete, or long-press members to toggle Online / Voice / Offline.',
  step3Label: 'Role-Switch · Editable',
  step4Title: 'Immersive Mode (Read-Only)',
  step4Desc:
    'Click the 2nd yellow dot (top-right) to hide all editing controls and lock message sending for a clean, distraction-free view.',
  step4Label: 'Immersive · Read-Only',
  step5Title: 'Auto-Playback Mode (Red Dot)',
  step5Desc:
    'Click the 3rd red dot (top-right) to enter Immersive Mode and replay messages one by one. Choose timeline flow (exact real-time or proportional speed) or a fixed interval (0.5s – 60s), plus date anchor mode and starting message.',
  step5Label: 'Auto-Playback Mode',
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
