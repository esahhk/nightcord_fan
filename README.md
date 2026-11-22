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
   - 在左上角 `25時、ナイトコードで。▾` 下拉菜单中「对话列表」下方、「界面语言」上方可点击 **「AI 对话模式」** 进入独立空白 AI 对话子页面。
   - **纯前端直连与隐私**：无需任何后端或代理，API Key、Base URL 与提示词仅保存在浏览器本地 `localStorage`（建议直接部署在 Cloudflare Workers 静态资源上，零服务端密钥风险；首次进入提供 4 步专属功能引导）。
   - **角色独立配置 & 全局共享 Key**：
     - 长按左侧成员头像 -> 点击 **「AI 对话设置」**，即可为该角色选择协议（OpenAI 兼容 / Google Gemini / Anthropic Claude）、接口地址（未填时自动使用对应协议默认地址）、API Key、拉取或填写模型，以及编写角色预设提示词。
     - 点击顶部第一个蓝色圆点打开 **「AI 全局设置」**，可开启全局共享 API Key / 协议 / 模型，一键切换不同角色并编辑提示词（与左侧角色菜单双向实时互通），并配置 **AI 概率追问回复**（一条回复后由另一位已配置 Key 的角色接话）。
   - **对话交互**：沉浸模式下自己可直接发消息；`@角色名` 定向指定回复，未 `@` 时从已填写 Key（或全局 Key）的角色中随机回复；长按任意消息支持 **编辑、重新生成、删除**。

### 本地开发与 Cloudflare Workers 部署

```bash
npm install
npm run dev
npm run build
```

> **Cloudflare Workers 部署说明**：本项目为纯静态前端应用（无代理后端），仓库根目录已配置 `wrangler.jsonc`（`assets.directory: "./dist"` 与 `"not_found_handling": "single-page-application"`）用于 SPA 路由回退，搭配无循环的 `public/_redirects` 规则即可直接通过 Cloudflare Workers Static Assets 托管。如自建自定义兼容接口需注意目标 API 须允许浏览器跨域请求（CORS）。

主要核心文件说明：

- `src/components/Sidebar.tsx`：服务器下拉菜单（含 AI 对话模式与 UI 模板入口）、频道与三态成员（在线 / 语音 / 离线）侧边栏。
- `src/components/ChatArea.tsx`：消息流、日期分割线、文件卡片、媒体预览与长按菜单（含编辑 / 重新生成 / 删除）。
- `src/components/NightcordArt.tsx` & `src/utils/canvasArt.ts`：Nightcord 图标与角色头像绘制。
- `src/components/CharacterAiModal.tsx` & `src/components/AiGlobalSettingsModal.tsx` & `src/utils/aiClient.ts`：纯前端直连 OpenAI / Gemini / Anthropic 客户端、单角色与全局 AI 设置面板。
- `src/components/OnboardingModal.tsx` & `src/components/AiOnboardingModal.tsx`：主界面 6 步新手引导与 AI 对话模式 4 步功能引导。
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
   - 左上メニューのチャット一覧の下・言語設定の上にある **「AI 会話モード」** から、専用の空白 AI 会話ページ（初回4ステップガイド付き）へ移動できます。
   - **完全静的・ローカル保存**：サーバーやプロキシを介さず、API キー・プロトコル・プロンプトはブラウザの `localStorage` のみに保存されます。OpenAI 互換 / Google Gemini / Anthropic Claude プロトコルに対応し、左サイドバーのメンバー長押しでキャラ別設定、上部の青いドットでグローバル API キー・プロンプト一括切替・連続追い返信確率を設定可能です。
   - **返信と操作**：没入モードのまま自分が送信でき、`@キャラ名` で返信キャラを指名（未指定時はキー設定済みキャラからランダム）。メッセージ長押しで **編集・再生成・削除** が行えます。

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
   - Click **AI Chat Mode** (between Conversations and Interface Language in the `25時、ナイトコードで。▾` menu) to open the blank AI conversation workspace, complete with a dedicated 4-step feature guide on first visit.
   - **Zero Backend / Local Storage Only**: Requests go directly from your browser to OpenAI-compatible, Google Gemini, or Anthropic Claude endpoints with API keys and character prompts stored strictly in `localStorage`. Long-press any left-sidebar member for per-character AI settings, or click the top-right Cyan Dot for **AI Global Settings** (shared API key toggle, quick per-character prompt switcher, and probabilistic follow-up AI reply).
   - **Interaction**: Send messages directly in Immersive Mode, target a specific speaker via `@Name` (or get a random reply from characters with an active key), and long-press any message to **Edit, Regenerate, or Delete**.

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
