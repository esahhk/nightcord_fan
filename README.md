# Nightcord (25時、ナイトコードで。)

[简体中文](#简体中文说明) | [日本語](#日本語ガイド) | [English](#english-guide)

---

## 简体中文说明

一个非盈利的 **「25時、ナイトコードで。」（Nightcord）** 风格同人二次创作网页应用。既还原了经典的夜间聊天界面与成员语音列表，也内置了本地角色扮演创作、自定义发送时间、富媒体卡片以及沉浸式逐条自动播放功能，并额外提供了可独立复用的 **Nightcord 本体开源 UI 模板子页面**。

> 视频教程：[B站（Bilibili）](https://www.bilibili.com/video/BV1EgyWzfEtm) ｜ [YouTube](https://www.youtube.com/watch?v=-9kCDzlmh4s)

### 核心功能一览

1. **三模式切换（右上角三色圆点）**
   - **蓝色圆点（角色切换 / 创作模式）**：
     - 切换当前发言角色（`K`、`雪`、`えななん`、`Amia`），或新建／编辑自定义角色与头像。
     - 发送本地图片（可选「仅显示文件名卡片」以还原原作样式，或「发送原图」）、**MP4**、**MP3** 及文本附件，支持自定义重命名文件名。
     - **自定义发送日期与时间**：支持 `2000–3000` 年任意年/月/日/时分选择，并校验不能早于上一条消息的时间。
     - **快捷手势**：长按底部角色头像或消息头像可快速 `@Ta`；长按已发消息可删除；长按左侧成员列表可切换「在线 / 语音聊天 / 离线」状态，点击右侧麦克风图标切换静音。
   - **黄色圆点（沉浸模式・默认启动模式）**：
     - 隐藏所有编辑按钮并锁定输入框，保持纯净的日文原版 Nightcord 浏览界面（切换中文或英文界面语言时，角色名与沉浸模式正文界面文字均保持日文）。
   - **红色圆点（消息自动播放模式）**：
     - 自动切换为沉浸模式，可选择 **按发送时间流速**（支持「完全按发送时间流速」与「等比例速度 `10×–300×`」）或 **固定时间间隔**（`0.5s – 60s`），所有消息间隔均不低于 `0.5s`。
     - 支持选择 **锚定在今日时间** 或 **不锚定（随播放时间推进跨过 24 点自动切换「昨日 / 今日」）**，并可选择从「没有消息开始」或指定任意起始消息逐条播放。

2. **对话管理与本地数据持久化**
   - 点击左上角 `25時、ナイトコードで。▾` 可切换／新建对话（空白或复制模板）、切换界面语言（`中文` / `日本語` / `EN`）、**导出 / 导入本地 JSON 备份文件**（含本地缓存图片与音视频媒体），以及二步确认的 **一键清空本地缓存**。
   - 所有消息记录、角色设置与上传的本地媒体均保存在浏览器 `localStorage` 与 `IndexedDB` 中，不上传至任何远程服务器。

3. **开源 Nightcord 本体 UI 模板子页面**
   - 为了方便同人作者或前端开发者直接使用干净的 Nightcord 界面壳子（不含创作编辑器与自动播放逻辑），本项目内建了专门的 **UI 模板子页面**。
   - **如何进入查看**：
     - 在主页面点击左上角 `25時、ナイトコードで。▾` 下拉菜单中的 **「开源 UI 模板」** 按钮直接跳转；
     - 或直接访问 URL 后缀 `#template`、`?view=template` 或 `/template`。
   - **模板内容包含**：
     - **实时预览**：支持桌面端与移动端宽度切换预览纯本体 UI。
     - **配色规范（Design Tokens）**：完整色板展示，点击色值即可复制。
     - **双版本开箱即用源码**：提供 **React + Tailwind (`.tsx`)** 组件模板 `NightcordTemplate.tsx` 与零依赖 **单文件 HTML (`.html`)** 模板 `nightcord-ui-template.html`，支持一键复制源码与直接下载文件。

4. **纯静态直连 AI 对话模式（`#ai` / `?view=ai` / `/ai`）**
   - 在左上角 `25時、ナイトコードで。▾` 下拉菜单中点击 **「AI 对话模式」** 即可进入独立 AI 群聊工作区，首次进入提供 5 步专属指引，后续也可随时在同下拉菜单点击 **「AI 新手引导」** 重看。
   - **纯前端直连与隐私**：无需后端或代理，支持 OpenAI / DeepSeek 兼容、Google Gemini、Anthropic Claude 接口，API Key、Base URL 与角色设定均保存在浏览器本地 `localStorage`。
   - **右上角三色圆点与成员设置**：
     - **蓝色圆点（AI 全局设置）**：采用三栏分页（我的档案 / 对话行为 / API 与模型），可配置「我的昵称与人设」、全局共享 API 与模型、输出语言开关（`自动` / `简体中文` / `繁體中文` / `English` / `日本語`）、联网搜索开关、角色随机接话概率、**聊天时间模式**（含「AI 自主决定时间」与可选的独立时间分析补全），以及五档 **聊天频率倾向**（`高频` / `偏高频` / `均衡` / `偏低频` / `低频`）。
     - **黄色圆点（群聊互动 / 随机发言）**：开启后多名在线角色会自动轮流发言互动，可勾选是否随对话进度随机切换成员在线、语音或离线状态；再次点击黄色圆点即可停止。
     - **红色圆点（自动播放）**：在 AI 对话中同样支持按时间戳流速或固定间隔逐条重放。
     - **左侧成员长按 -> AI 设置**：可为每位成员独立配置接口、模型、性格提示词，或查看其当前的「语言通话 / 文字在线 / 静音 / 离线」状态（会实时同步给模型感知）。
   - **贴近原作的群聊机制**：
     - 发送消息即可触发响应（`@角色名` 可指定回复对象），长按任意消息支持 **编辑、重新生成、删除**。
     - AI 会结合语境自主判断何时自然 `@` 其他人或发送文件卡片（图片、音频、视频、文本附件），时间仅作为独立时间戳元数据写入，不会混入正文文本。
   - **API 用量监测与复制到主页面**：
     - 在 `25時、ナイトコードで。▾` 下拉菜单或全局设置底部可打开 **「API 用量监测」**，按真实接口返回字段统计请求次数及输入、输出、思考、缓存、总 Token（区分当前会话与历史累计，支持重置当前会话）。
     - 点击下拉菜单中的 **「会话复制到主页面」**，输入会话名称即可把当前 AI 聊天记录完整拷入主页面新会话中继续排版编辑。

### 本地开发与 Cloudflare Workers 部署

```bash
npm install
npm run dev
npm run build
```

> **Cloudflare Workers 部署说明**：本项目为纯静态前端应用（无代理后端），仓库根目录已配置 `wrangler.jsonc`（`assets.directory: "./dist"` 与 `"not_found_handling": "single-page-application"`）用于 SPA 路由回退，搭配无循环的 `public/_redirects` 规则即可直接通过 Cloudflare Workers Static Assets 托管。如自建自定义兼容接口需注意目标 API 须允许浏览器跨域请求（CORS）。

主要核心文件说明：

- `src/components/Sidebar.tsx`：服务器下拉菜单（含 AI 对话模式、AI 新手引导、复制到主页面、API 用量监测与 UI 模板入口）、频道与成员（在线 / 语音 / 静音 / 离线）侧边栏。
- `src/components/ChatArea.tsx`：消息流、日期分割线、文件卡片、媒体预览与长按菜单（含编辑 / 重新生成 / 删除）。
- `src/components/NightcordArt.tsx` & `src/utils/canvasArt.ts`：Nightcord 图标与角色头像绘制。
- `src/components/CharacterAiModal.tsx`、`src/components/AiGlobalSettingsModal.tsx`、`src/components/AiAutoChatModal.tsx`、`src/components/AiUsageModal.tsx`、`src/components/CopyAiToMainModal.tsx` & `src/utils/aiClient.ts`：纯前端直连 OpenAI / DeepSeek / Gemini / Anthropic 客户端、三栏全局配置、角色独立设置、自动群聊控制、真实 Token 用量监测与会话复制导出。
- `src/components/OnboardingModal.tsx` & `src/components/AiOnboardingModal.tsx`：主界面 6 步新手引导与 AI 对话模式 5 步功能引导。
- `src/components/UiTemplateSubpage.tsx` & `src/utils/nightcordTemplateCode.ts`：开源 UI 模板子页面与独立 TSX / HTML 模板源码。
- `src/components/RoleComposerBar.tsx`、`src/components/PlaybackSetupModal.tsx`：角色编辑器、时间选择与自动播放设置（含定时上下线状态事件）。
- `src/utils/nightcordState.ts`、`src/utils/localStorageStore.ts`：纯状态逻辑（附带 `node:test` 单元测试）与本地备份存储。

---

## 日本語ガイド

非営利の「25時、ナイトコードで。」（Nightcord）風ファンメイドWebアプリです。深夜作業通話チャンネルのUIを再現しつつ、ローカルでの会話作成、キャラクター切替、ファイルカード／動画／音声送信、日時指定、没入モードでの自動再生、さらに**オープンソース向けの純粋な Nightcord 本体 UI テンプレートサブページ**を備えています。

> 動画チュートリアル：[Bilibili](https://www.bilibili.com/video/BV1EgyWzfEtm) ｜ [YouTube](https://www.youtube.com/watch?v=-9kCDzlmh4s)

### 主な機能

1. **右上3色ドットによる3つのモード**
   - **青い点（ロール切替モード）**：
     - 発言キャラクター（`K`・`雪`・`えななん`・`Amia`）の切替、および新規キャラ・カスタムアイコンの作成に対応。
     - 画像（原図非表示のファイル名カード／原図プレビュー選択可）、**MP4**、**MP3**、テキストファイルの送信（ファイル名編集可）。
     - **送信日時の指定**：2000年〜3000年の範囲で年月日・時刻を指定可能（直前のメッセージより前の日時は指定不可）。
     - **長押し操作**：キャラやアバター長押しで `@メンション`、メッセージ長押しで削除、左サイドバーのメンバー長押しで「オンライン／ボイスチャット／オフライン」切替、マイクアイコンでミュート切替。
   - **黄色い点（没入モード・初期起動状態）**：
     - 編集UIをすべて隠し、メッセージ送信を無効化した閲覧専用モードです。操作言語を中国語／英語に切り替えても、キャラクター名や没入モードの画面表示は日本語のまま維持されます。
   - **赤い点（メッセージ自動再生モード）**：
     - 自動で没入モードに入り、設定モーダルから「送信時刻の流速（完全実時間／等比例 `10×–300×`）」または「固定時間間隔（`0.5秒〜60秒`）」を選択して1件ずつ再生します（全間隔最短 `0.5秒`）。
     - 「今日の日時に固定」／「再生中のメッセージ日時を基準（24時跨ぎで昨日・今日が変化）」および開始位置を選択できます。

2. **会話管理とローカル保存**
   - 左上「25時、ナイトコードで。▾」から会話の切替・作成（空またはテンプレート複製）、言語切替（`中文` / `日本語` / `EN`）、JSON バックアップの書き出し／読み込み（ローカル保存メディア含む）、2段階確認付きローカルキャッシュ全消去が可能です。
   - すべてのデータはブラウザの `localStorage` と `IndexedDB` のみに保存されます。

3. **オープンソース向け Nightcord 本体 UI テンプレートサブページ**
   - 制作ツール機能を取り除き、純粋な Nightcord ウィンドウ構成だけを他プロジェクトで再利用できるよう、専用の **UI テンプレートサブページ**を用意しました。
   - **アクセス方法**：
     - 左上「25時、ナイトコードで。▾」メニュー内の **「UI テンプレート」** をクリック；
     - または URL に `#template`、`?view=template`、`/template` を付けてアクセス。
   - **収録内容**：
     - PC／スマホ幅を切り替えられるライブプレビュー。
     - クリックでコピーできる Nightcord カラーパレット一覧。
     - そのまま貼り付けて使える **React + Tailwind (`NightcordTemplate.tsx`)** および単一 **HTML (`nightcord-ui-template.html`)** のコピー＆ダウンロード機能。

4. **ブラウザ直結 AI 会話モード（`#ai` / `?view=ai` / `/ai`）**
   - 左上メニューの **「AI 会話モード」** から専用の AI グループチャット画面へ移動できます（初回は 5 ステップガイドを表示、同メニューの **「AI 初心者ガイド」** からいつでも再確認可能）。
   - **完全静的・ローカル保存**：OpenAI / DeepSeek 互換、Google Gemini、Anthropic Claude へブラウザから直接接続し、API キーや設定は `localStorage` のみに保存されます。
   - **右上3色ドットとメンバー連動**：
     - **青い点（AI 全体設定）**：プロフィール／会話の振る舞い／API・モデルの3タブ構成で、自分の設定、共有 API キー、モデル出力言語（`自動` / `简体中文` / `繁體中文` / `English` / `日本語`）、Web 検索、追い返信確率、送信時刻モード（AI 自律判断＋時刻補完解析）、5段階の**会話頻度**（`高頻度`〜`低頻度`）を設定できます。
     - **黄色い点（ランダム掛け合い）**：設定パネルからメンバーのランダム入退室・通話変化の有無を選んで開始でき、会話中に再クリックで停止します。
     - **赤い点（自動再生）**：AI 会話ログも送信時刻や固定間隔で再生可能です。
     - **メンバー長押し -> AI 設定**：キャラ別の API・プロンプト編集に対応し、「通話中／オンライン／ミュート／オフライン」状態もモデルへ自動共有されます。
   - **自然なチャット挙動・用量モニター・メインへ複製**：
     - メッセージ送信や `@キャラ名` での指名返信、長押しによる **編集・再生成・削除** に加え、文脈に応じた自然なファイルカード送信や `@メンション`、送信時刻の構造化メタデータ記録に対応。
     - **API 使用量モニター** でリクエスト数や入力・出力・思考・キャッシュ・合計トークンを実測集計し、**「メイン画面へ会話をコピー」** から任意の会話名で通常モードへそのまま複製できます。

### ローカル開発・Cloudflare Workers デプロイ

```bash
npm install
npm run dev
npm run build
```

> `wrangler.jsonc`（`assets.not_found_handling: "single-page-application"`）とループのない `public/_redirects` により、`dist/` をそのまま Cloudflare Workers（Static Assets）へデプロイできます。カスタムAPIエンドポイント利用時は対象サーバー側の CORS 許可設定をご確認ください。

---

## English Guide

A non-profit fan-made **"25-ji, Nightcord de."** web application recreating the late-night chat workspace with local roleplay authoring, custom timestamps, Nightcord-style file cards, step-by-step auto-playback, and a dedicated **Open-Source Core UI Template Subpage** for developers who want to reuse the pure Nightcord interface shell.

> Video Tutorials: [Bilibili](https://www.bilibili.com/video/BV1EgyWzfEtm) | [YouTube](https://www.youtube.com/watch?v=-9kCDzlmh4s)

### Key Features

1. **Three Window Modes (Top-Right Dots)**
   - **1st Cyan Dot — Role-Switch / Studio Mode**:
     - Switch active speakers (`K`, `雪`, `えななん`, `Amia`) or create/edit custom characters and avatars.
     - Send local images (either as classic Nightcord filename cards or inline image previews), **MP4**, **MP3**, and text files with editable filenames.
     - **Custom Date & Time**: Pick any date between `2000` and `3000` plus time, validated so new messages cannot precede the previous message.
     - **Long-Press Controls**: Long-press character chips or avatars to `@mention`, long-press messages to delete, long-press sidebar members to switch `Online / Voice Chat / Offline`, and click mic icons to mute/unmute.
   - **2nd Yellow Dot — Immersive Mode (Default on Launch)**:
     - Hides all editing controls and locks sending for an authentic read-only Japanese Nightcord screen. Character names and the Immersive Mode chat interface stay in Japanese regardless of your chosen UI language (`中文` / `日本語` / `EN`).
   - **3rd Red Dot — Auto-Playback Mode**:
     - Switches into Immersive Mode and replays messages one by one using either **Timestamp Flow** (`Exact Real-Time` or `Proportional 10×–300×`) or a **Fixed Interval** (`0.5s – 60s`), with a `0.5s` minimum interval floor.
     - Choose between **Anchor to Today** and **Dynamic Playback Date Rollover**, plus any starting message position.

2. **Local Persistence & Backups**
   - From the top-left `25時、ナイトコードで。▾` dropdown, create/switch conversations, change UI language, **Export / Import JSON backups** (including embedded local media), or perform a two-step **Clear Local Cache**.
   - Everything is stored purely client-side in `localStorage` and `IndexedDB`.

3. **Open-Source Core UI Template Subpage**
   - Want only the clean Nightcord chat window shell without authoring or playback logic? Open the built-in **UI Template Subpage**:
     - Click **UI Template** inside the `25時、ナイトコードで。▾` dropdown;
     - Or navigate directly via `#template`, `?view=template`, or `/template`.
   - **What you get on the template subpage**:
     - Live interactive preview with Desktop / Mobile width toggle.
     - Click-to-copy Nightcord hex color tokens.
     - Ready-to-use **React + Tailwind (`NightcordTemplate.tsx`)** and zero-dependency **Standalone HTML (`nightcord-ui-template.html`)** source tabs with one-click copy and file download.

4. **Pure-Static Direct AI Chat Mode (`#ai` / `?view=ai` / `/ai`)**
   - Click **AI Chat Mode** in the `25時、ナイトコードで。▾` dropdown to enter the AI group chat workspace (with a 5-step guide on first visit, replayable anytime from **AI Beginner Guide** in the same menu).
   - **Zero Backend / Local Storage Only**: Connects directly from the browser to OpenAI / DeepSeek-compatible, Google Gemini, or Anthropic Claude APIs with keys and character prompts stored strictly in `localStorage`.
   - **Top-Right Dots & Member Sync**:
     - **1st Cyan Dot (AI Global Settings)**: Organized into 3 tabs (`My Profile`, `Chat Behavior`, `API & Model`) covering your user persona, shared API key, independent model output language (`Auto` / `简体中文` / `繁體中文` / `English` / `日本語`), web search toggle, follow-up reply chance, autonomous message time inference (with dedicated time-analyzer fallback), and 5-level **Chat Frequency** bias.
     - **2nd Yellow Dot (Autonomous Group Chat)**: Opens the autonomous chat panel (with optional random online/voice presence transitions); click the Yellow Dot again anytime to stop.
     - **3rd Red Dot (Auto-Playback)**: Replays AI chat logs at real-time speed or fixed intervals.
     - **Sidebar Long-Press -> AI Settings**: Configure per-character API overrides and system prompts; each member's live status (`Voice / Online / Muted / Offline`) is automatically passed to the AI context.
   - **Natural Replies, Usage Monitor & Copy to Main**:
     - Reply directly or target speakers with `@Name`; long-press any message to **Edit, Regenerate, or Delete**. Models decide message timestamps as structured metadata (never printed in message body) and may naturally `@mention` members or share contextual file cards.
     - Inspect real API token metrics (requests, input, output, reasoning, cached, and total tokens for session & lifetime) in **API Usage Monitor**, or use **Copy Chat to Main** to transfer an AI session straight into a new conversation in the main editor.

### Local Development & Cloudflare Workers

```bash
npm install
npm run dev
npm run build
```

> Configured via `wrangler.jsonc` (`assets.directory: "./dist"`, `not_found_handling: "single-page-application"`) and loop-free `public/_redirects` rules for Cloudflare Workers Static Assets with zero server proxies or secrets. When using custom third-party endpoints, ensure the upstream API supports browser CORS requests.

---

## 二创声明、开源协议与版权 / 免責事項・ライセンス / Disclaimer, License & Credits

- **Fan-Work Disclaimer / 二创声明 / 二次創作について**：
  - 本项目为非盈利**同人二次创作作品**，仅供个人娱乐、交流与前端学习使用，与官方无任何关联。
  - 本プロジェクトは非営利の**ファンメイド二次創作作品**であり、公式とは一切関係ありません。
  - This project is a non-profit **fan-made derivative work** for personal entertainment and technical study, and is not affiliated with the official rights holders.
- **Original IP Copyright / 原作版权 / 著作権**：
  - 原作中的角色设定、名称、图像原型及 **Nightcord（25時、ナイトコードで。 / ナイトコード）** 相关知识产权与版权均归 **SEGA**（及原著作权方）所有。
  - キャラクター設定・名称・ビジュアル原案および「25時、ナイトコードで。」（Nightcord）に関する権利は **SEGA** および原著作権者に帰属します。
  - Character designs, names, visual motifs, and **Nightcord** intellectual property belong to **SEGA** and the original copyright holders.
- **Open-Source License / 开源协议 / ライセンス**：
  - 本项目自身的原创代码与 UI 模板实现采用 **[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)**（署名-非商业性使用-相同方式共享 4.0 国际许可协议）开源。使用或二次分发时请保留原作者署名、禁止商业用途，并以相同协议共享；此协议不影响 SEGA 对原作内容享有的权利。
  - 本プロジェクトのオリジナルコードおよび UI テンプレート部分は **[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)**（表示 - 非営利 - 継承 4.0 国際）の下で公開されています。
  - Original source code and UI template implementations in this repository are licensed under **[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)** (Attribution-NonCommercial-ShareAlike 4.0 International), without affecting SEGA's rights over the original IP.

### 相关链接 / リンク / Links

- **Homepage / 个人主页 / 個人ページ**：[https://esahhk.xyz](https://esahhk.xyz)
- **GitHub**：[https://github.com/esahhk/nightcord_fan](https://github.com/esahhk/nightcord_fan)
- **Bilibili / B站主页**：[https://space.bilibili.com/2058030122](https://space.bilibili.com/2058030122)
- **Video Tutorial (Bilibili) / B站视频教程 / 動画ガイド（Bilibili）**：[https://www.bilibili.com/video/BV1EgyWzfEtm](https://www.bilibili.com/video/BV1EgyWzfEtm)
- **Video Tutorial (YouTube) / YouTube 视频教程 / 動画ガイド（YouTube）**：[https://www.youtube.com/watch?v=-9kCDzlmh4s](https://www.youtube.com/watch?v=-9kCDzlmh4s)
- **Issue Report / 问题反馈 / お問い合わせ**：[esahhk@outlook.com](mailto:esahhk@outlook.com)
