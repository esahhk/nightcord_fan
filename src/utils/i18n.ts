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
  emptyConvSub: 'メッセージを送信するとローカルに保存されます',
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
  playbackAnchorTodaySub: '同月の過去は「13日 23:13」、別月・別年は「2021年6月17日」表示',
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
  emptyConvSub: '发送的内容仅保存在本地浏览器中',
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
  playbackAnchorTodaySub: '同月之前显示「13日 23:13」，跨月/跨年显示「2021年6月17日」',
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
  playbackAnchorTodaySub: 'Same month shows "13日 23:13"; other month/year shows "2021年6月17日"',
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
