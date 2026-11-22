export interface PaletteToken {
  hex: string;
  role: string;
}

export const NIGHTCORD_PALETTE_TOKENS: PaletteToken[] = [
  { hex: '#211A2C', role: 'Window Chrome / Modal Header' },
  { hex: '#2E243D', role: 'Sidebar / Surface Panel' },
  { hex: '#3F3352', role: 'Chat Stream Canvas' },
  { hex: '#524468', role: 'File Card / Elevated Border' },
  { hex: '#332844', role: 'Composer Input Field' },
  { hex: '#64D2E6', role: 'Accent Cyan / Active Ring' },
  { hex: '#F6CE71', role: 'Immersive Dot' },
  { hex: '#EB7F97', role: 'Accent Pink / Playback Dot' },
  { hex: '#55D8C1', role: 'Online Status Indicator' },
  { hex: '#EFEBF5', role: 'Primary Text' },
  { hex: '#9A90A8', role: 'Muted Timestamp / Meta' },
];

export function isTemplateSubpageLocation(loc: {
  pathname: string;
  search: string;
  hash: string;
}): boolean {
  const params = new URLSearchParams(loc.search);
  if (params.get('view') === 'template') {
    return true;
  }
  const normalizedHash = loc.hash.replace(/^#\/?/, '').toLowerCase();
  if (normalizedHash === 'template') {
    return true;
  }
  const normalizedPath = loc.pathname.replace(/\/+$/, '').toLowerCase();
  return normalizedPath === '/template';
}

export function isAiSubpageLocation(loc: {
  pathname: string;
  search: string;
  hash: string;
}): boolean {
  const params = new URLSearchParams(loc.search);
  if (params.get('view') === 'ai') {
    return true;
  }
  const normalizedHash = loc.hash.replace(/^#\/?/, '').toLowerCase();
  if (normalizedHash === 'ai') {
    return true;
  }
  const normalizedPath = loc.pathname.replace(/\/+$/, '').toLowerCase();
  return normalizedPath === '/ai';
}

export const NIGHTCORD_TSX_TEMPLATE = `import { useState } from 'react';
import type { FormEvent } from 'react';

export interface TemplateMember {
  id: string;
  name: string;
  status: 'online' | 'voice' | 'offline';
  muted?: boolean;
  avatarBg: string;
}

export interface TemplateAttachment {
  id: string;
  filename: string;
  sizeLabel: string;
  fileType: string;
}

export interface TemplateMessage {
  id: string;
  username: string;
  avatarBg: string;
  timestamp: string;
  dividerBefore?: string;
  text?: string;
  attachments?: TemplateAttachment[];
}

export interface NightcordTemplateProps {
  serverTitle?: string;
  channelTitle?: string;
  members?: TemplateMember[];
  initialMessages?: TemplateMessage[];
  onSendMessage?: (text: string) => void;
}

const DEFAULT_MEMBERS: TemplateMember[] = [
  { id: 'k', name: 'K', status: 'voice', muted: false, avatarBg: '#C65886' },
  { id: 'yuki', name: '雪', status: 'voice', muted: false, avatarBg: '#8381C4' },
  { id: 'enanan', name: 'えななん', status: 'voice', muted: false, avatarBg: '#9D97AC' },
  { id: 'amia', name: 'Amia', status: 'voice', muted: false, avatarBg: '#F5B8D2' },
];

const DEFAULT_MESSAGES: TemplateMessage[] = [
  { id: '1', username: 'Amia', avatarBg: '#F5B8D2', timestamp: '昨日 16:13', text: 'ありがと！' },
  { id: '2', username: '雪', avatarBg: '#8381C4', timestamp: '昨日 16:15', text: '聴いとくね' },
  { id: '3', username: 'えななん', avatarBg: '#9D97AC', timestamp: '昨日 20:36', text: 'じゃ、一旦落ちる' },
  { id: '4', username: 'K', avatarBg: '#8E4390', timestamp: '昨日 20:38', text: 'うん。また25時に' },
  {
    id: '5',
    username: 'えななん',
    avatarBg: '#9D97AC',
    timestamp: '今日 1:36',
    dividerBefore: '今日',
    attachments: [
      { id: 'f1', filename: 'ラフA.jpg', sizeLabel: '5MB JPG', fileType: 'JPG' },
      { id: 'f2', filename: 'ラフB.jpg', sizeLabel: '3MB JPG', fileType: 'JPG' },
    ],
  },
];

export function NightcordTemplate({
  serverTitle = '25時、ナイトコードで。',
  channelTitle = '作業',
  members = DEFAULT_MEMBERS,
  initialMessages = DEFAULT_MESSAGES,
  onSendMessage,
}: NightcordTemplateProps) {
  const [messages, setMessages] = useState<TemplateMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [voiceOpen, setVoiceOpen] = useState(true);
  const [offlineOpen, setOfflineOpen] = useState(true);

  const onlineList = members.filter((m) => m.status === 'online');
  const voiceList = members.filter((m) => m.status === 'voice');
  const offlineList = members.filter((m) => m.status === 'offline');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) {
      return;
    }
    const now = new Date();
    const ts = \`今日 \${now.getHours()}:\${String(now.getMinutes()).padStart(2, '0')}\`;
    setMessages((prev) => [
      ...prev,
      { id: String(Date.now()), username: 'K', avatarBg: '#8E4390', timestamp: ts, text: trimmed },
    ]);
    onSendMessage?.(trimmed);
    setInputValue('');
  };

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-[#3F3352] text-[#EFEBF5]">
      <div className="flex h-[28px] shrink-0 items-center justify-end border-b border-[#191322] bg-[#211A2C] px-3.5">
        <div className="flex items-center gap-2">
          <span className="h-[11px] w-[11px] rounded-full bg-[#64D2E6]" />
          <span className="h-[11px] w-[11px] rounded-full bg-[#F6CE71]" />
          <span className="h-[11px] w-[11px] rounded-full bg-[#EB7F97]" />
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[228px] shrink-0 flex-col border-r border-[#241B30] bg-[#2E243D]">
          <div className="flex h-[54px] shrink-0 items-center justify-between border-b border-[#241B30] px-4 text-[13.5px] font-medium text-[#EAE6F1]">
            <span className="truncate">{serverTitle}</span>
            <span className="text-[11px] text-[#9B90AD]">▾</span>
          </div>

          <div className="flex-1 overflow-y-auto pt-3">
            <div className="px-2.5">
              <div className="flex h-[34px] items-center gap-2.5 rounded-[6px] bg-[#3E3252] px-2.5 text-[13.5px] font-medium text-white">
                <span className="inline-block h-4 w-4 rounded-full border-2 border-white" />
                <span className="truncate">{channelTitle}</span>
              </div>
            </div>

            {onlineList.map((member) => (
              <div key={member.id} className="mx-1.5 mt-2 flex h-[36px] items-center gap-2.5 pl-4 pr-3">
                <span
                  className="relative h-[25px] w-[25px] shrink-0 rounded-full"
                  style={{ backgroundColor: member.avatarBg }}
                >
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#2E243D] bg-[#55D8C1]" />
                </span>
                <span className="truncate text-[13px] font-medium text-[#ECE8F4]">{member.name}</span>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setVoiceOpen((prev) => !prev)}
              className="mt-4 mb-1.5 flex w-full items-center gap-1.5 px-3.5 text-left text-[11px] font-medium text-[#9E95B0]"
            >
              <span>{voiceOpen ? '>' : 'v'}</span>
              <span>ボイスチャット</span>
            </button>

            {voiceOpen &&
              voiceList.map((member) => (
                <div key={member.id} className="mx-1.5 flex h-[36px] items-center justify-between pl-4 pr-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="relative h-[25px] w-[25px] shrink-0 rounded-full"
                      style={{ backgroundColor: member.avatarBg }}
                    >
                      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#2E243D] bg-[#55D8C1]" />
                    </span>
                    <span className="text-[13px] font-medium text-[#DCD7E5]">{member.name}</span>
                  </div>
                </div>
              ))}

            <button
              type="button"
              onClick={() => setOfflineOpen((prev) => !prev)}
              className="mt-2 mb-1.5 flex w-full items-center gap-1.5 px-3.5 text-left text-[11px] font-medium text-[#9E95B0]"
            >
              <span>{offlineOpen ? '>' : 'v'}</span>
              <span>オフライン</span>
            </button>

            {offlineOpen &&
              offlineList.map((member) => (
                <div key={member.id} className="mx-1.5 flex h-[36px] items-center gap-2.5 pl-4 pr-3 opacity-60">
                  <span
                    className="h-[25px] w-[25px] shrink-0 rounded-full"
                    style={{ backgroundColor: member.avatarBg }}
                  />
                  <span className="text-[13px] font-medium text-[#8B819F]">{member.name}</span>
                </div>
              ))}
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col bg-[#3F3352]">
          <header className="flex h-[52px] shrink-0 items-center gap-2.5 border-b border-[#2F2540] px-5">
            <span className="inline-block h-4 w-4 rounded-full border-2 border-white" />
            <h1 className="text-[15px] font-bold text-[#EFEBF5]">{channelTitle}</h1>
          </header>

          <div className="flex flex-1 flex-col gap-[15px] overflow-y-auto px-6 py-4">
            {messages.map((msg) => (
              <div key={msg.id}>
                {msg.dividerBefore && (
                  <div className="my-2 flex items-center gap-3.5">
                    <div className="h-px flex-1 bg-[#504266]" />
                    <span className="text-[11px] font-medium text-[#9A90A8]">{msg.dividerBefore}</span>
                    <div className="h-px flex-1 bg-[#504266]" />
                  </div>
                )}
                <div className="flex items-start gap-[13px]">
                  <span
                    className="h-9 w-9 shrink-0 rounded-full"
                    style={{ backgroundColor: msg.avatarBg }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-baseline gap-2">
                      <span className="text-[13.5px] font-bold text-[#EFEBF5]">{msg.username}</span>
                      <span className="text-[10.5px] text-[#9A90A8]">{msg.timestamp}</span>
                    </div>
                    {msg.attachments && (
                      <div className="mt-1.5 flex flex-col gap-2">
                        {msg.attachments.map((file) => (
                          <div
                            key={file.id}
                            className="flex h-[54px] max-w-[310px] items-center justify-between rounded-[6px] border border-[#61527A] bg-[#524468] px-3.5"
                          >
                            <div className="flex min-w-0 flex-col">
                              <span className="truncate text-[13.5px] font-bold text-white">
                                {file.filename}
                              </span>
                              <span className="text-[10.5px] text-[#9A90A8]">{file.sizeLabel}</span>
                            </div>
                            <span className="text-[11px] font-bold text-[#C2B8D3]">{file.fileType}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {msg.text && <p className="text-[13.5px] leading-[1.44] text-[#E2DCEB]">{msg.text}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="px-5 pb-4 pt-1">
            <div className="flex h-[42px] items-center rounded-[6px] border border-[#453859] bg-[#332844] px-[15px]">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="メッセージを送信"
                className="w-full bg-transparent text-[13px] text-[#EFEBF5] outline-none placeholder:text-[#857A99]"
              />
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
`;

export const NIGHTCORD_HTML_TEMPLATE = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>nightcord</title>
    <style>
      * { box-sizing: border-box; }
      html, body {
        margin: 0;
        padding: 0;
        height: 100%;
        background: #3F3352;
        color: #EFEBF5;
        font-family: Inter, "Noto Sans JP", sans-serif;
      }
      .app { display: flex; flex-direction: column; height: 100dvh; overflow: hidden; }
      .titlebar {
        height: 28px;
        background: #211A2C;
        border-bottom: 1px solid #191322;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding: 0 14px;
        gap: 8px;
        flex-shrink: 0;
      }
      .dot { width: 11px; height: 11px; border-radius: 50%; }
      .body { display: flex; flex: 1; min-height: 0; }
      .sidebar {
        width: 228px;
        background: #2E243D;
        border-right: 1px solid #241B30;
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
      }
      .server-head {
        height: 54px;
        border-bottom: 1px solid #241B30;
        padding: 0 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 13.5px;
        font-weight: 600;
      }
      .channel-item {
        margin: 12px 10px 0;
        height: 34px;
        border-radius: 6px;
        background: #3E3252;
        padding: 0 10px;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 13.5px;
        font-weight: 600;
        color: #FFFFFF;
      }
      .cat-title {
        margin: 16px 0 6px;
        padding: 0 14px;
        font-size: 11px;
        color: #9E95B0;
      }
      .member {
        margin: 0 6px;
        height: 36px;
        padding: 0 12px 0 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 13px;
        color: #DCD7E5;
      }
      .member-left { display: flex; align-items: center; gap: 10px; }
      .avatar-sm {
        width: 25px;
        height: 25px;
        border-radius: 50%;
        position: relative;
        flex-shrink: 0;
      }
      .online-dot {
        position: absolute;
        right: -2px;
        bottom: -2px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #55D8C1;
        border: 2px solid #2E243D;
      }
      .main { flex: 1; display: flex; flex-direction: column; min-width: 0; background: #3F3352; }
      .chat-head {
        height: 52px;
        border-bottom: 1px solid #2F2540;
        padding: 0 20px;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 15px;
        font-weight: 700;
        flex-shrink: 0;
      }
      .stream {
        flex: 1;
        overflow-y: auto;
        padding: 16px 24px;
        display: flex;
        flex-direction: column;
        gap: 15px;
      }
      .msg { display: flex; align-items: flex-start; gap: 13px; }
      .avatar-md { width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0; }
      .meta { display: flex; align-items: baseline; gap: 8px; margin-bottom: 2px; }
      .author { font-size: 13.5px; font-weight: 700; }
      .time { font-size: 10.5px; color: #9A90A8; }
      .text { font-size: 13.5px; line-height: 1.44; color: #E2DCEB; }
      .divider { display: flex; align-items: center; gap: 14px; margin: 4px 0; }
      .divider-line { flex: 1; height: 1px; background: #504266; }
      .divider-label { font-size: 11px; color: #9A90A8; }
      .file-card {
        margin-top: 6px;
        height: 54px;
        max-width: 310px;
        border-radius: 6px;
        border: 1px solid #61527A;
        background: #524468;
        padding: 0 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .composer { padding: 4px 20px 16px; flex-shrink: 0; }
      .input-box {
        height: 42px;
        border-radius: 6px;
        border: 1px solid #453859;
        background: #332844;
        padding: 0 15px;
        display: flex;
        align-items: center;
      }
      .input-box input {
        width: 100%;
        border: none;
        outline: none;
        background: transparent;
        color: #EFEBF5;
        font-size: 13px;
      }
      @media (max-width: 720px) { .sidebar { display: none; } }
    </style>
  </head>
  <body>
    <div class="app">
      <div class="titlebar">
        <span class="dot" style="background:#64D2E6;"></span>
        <span class="dot" style="background:#F6CE71;"></span>
        <span class="dot" style="background:#EB7F97;"></span>
      </div>
      <div class="body">
        <aside class="sidebar">
          <div class="server-head"><span>25時、ナイトコードで。</span><span>▾</span></div>
          <div class="channel-item">
            <svg width="18" height="18" viewBox="0 0 100 100">
              <path fill-rule="evenodd" d="M 50 7 A 43 43 0 1 0 50 93 A 43 43 0 1 0 50 7 Z M 58.8 17.5 A 32.5 32.5 0 1 1 58.8 82.5 A 32.5 32.5 0 1 1 58.8 17.5 Z" fill="#FFFFFF"/>
              <circle cx="48.3" cy="50" r="5.6" fill="#FFFFFF"/>
              <circle cx="69.3" cy="50" r="5.6" fill="#FFFFFF"/>
            </svg>
            <span>作業</span>
          </div>
          <div class="cat-title">&gt; ボイスチャット</div>
          <div class="member"><div class="member-left"><span class="avatar-sm" style="background:#C65886;"><span class="online-dot"></span></span><span>K</span></div></div>
          <div class="member"><div class="member-left"><span class="avatar-sm" style="background:#8381C4;"><span class="online-dot"></span></span><span>雪</span></div></div>
          <div class="member"><div class="member-left"><span class="avatar-sm" style="background:#9D97AC;"><span class="online-dot"></span></span><span>えななん</span></div></div>
          <div class="member"><div class="member-left"><span class="avatar-sm" style="background:#F5B8D2;"><span class="online-dot"></span></span><span>Amia</span></div></div>
          <div class="cat-title">&gt; オフライン</div>
        </aside>
        <main class="main">
          <header class="chat-head">
            <svg width="20" height="20" viewBox="0 0 100 100">
              <path fill-rule="evenodd" d="M 50 7 A 43 43 0 1 0 50 93 A 43 43 0 1 0 50 7 Z M 58.8 17.5 A 32.5 32.5 0 1 1 58.8 82.5 A 32.5 32.5 0 1 1 58.8 17.5 Z" fill="#FFFFFF"/>
              <circle cx="48.3" cy="50" r="5.6" fill="#FFFFFF"/>
              <circle cx="69.3" cy="50" r="5.6" fill="#FFFFFF"/>
            </svg>
            <span>作業</span>
          </header>
          <div class="stream">
            <div class="msg">
              <span class="avatar-md" style="background:#F5B8D2;"></span>
              <div>
                <div class="meta"><span class="author">Amia</span><span class="time">昨日 16:13</span></div>
                <div class="text">ありがと！</div>
              </div>
            </div>
            <div class="msg">
              <span class="avatar-md" style="background:#8381C4;"></span>
              <div>
                <div class="meta"><span class="author">雪</span><span class="time">昨日 16:15</span></div>
                <div class="text">聴いとくね</div>
              </div>
            </div>
            <div class="msg">
              <span class="avatar-md" style="background:#8E4390;"></span>
              <div>
                <div class="meta"><span class="author">K</span><span class="time">昨日 20:38</span></div>
                <div class="text">うん。また25時に</div>
              </div>
            </div>
            <div class="divider">
              <div class="divider-line"></div>
              <span class="divider-label">今日</span>
              <div class="divider-line"></div>
            </div>
            <div class="msg">
              <span class="avatar-md" style="background:#9D97AC;"></span>
              <div style="flex:1;">
                <div class="meta"><span class="author">えななん</span><span class="time">今日 1:36</span></div>
                <div class="file-card">
                  <div>
                    <div style="font-size:13.5px;font-weight:700;">ラフA.jpg</div>
                    <div style="font-size:10.5px;color:#9A90A8;">5MB JPG</div>
                  </div>
                  <span style="font-size:11px;font-weight:700;color:#C2B8D3;">JPG</span>
                </div>
              </div>
            </div>
          </div>
          <div class="composer">
            <div class="input-box">
              <input type="text" placeholder="メッセージを送信" readonly />
            </div>
          </div>
        </main>
      </div>
    </div>
  </body>
</html>
`;
