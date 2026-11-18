import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ChatArea } from './components/ChatArea';
import { WorkChannelIcon } from './components/NightcordArt';
import { Sidebar } from './components/Sidebar';
import type {
  ChatAttachment,
  ChatMessage,
  NightcordActions,
  VoiceMember,
} from './types/nightcord';
import {
  INITIAL_MESSAGES,
  INITIAL_VOICE_MEMBERS,
  appendInputToken,
  createOutgoingMessage,
  invokeAction,
  toggleMemberMute,
} from './utils/nightcordState';

interface AppProps {
  actions?: Partial<NightcordActions>;
}

export default function App({ actions }: AppProps) {
  const [activeChannel, setActiveChannel] = useState('work');
  const [voiceExpanded, setVoiceExpanded] = useState(true);
  const [offlineExpanded, setOfflineExpanded] = useState(false);
  const [members, setMembers] = useState<VoiceMember[]>(INITIAL_VOICE_MEMBERS);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [formatActive, setFormatActive] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [toastText, setToastText] = useState<string | null>(null);

  const actionsRef = useRef<Partial<NightcordActions>>(actions ?? {});
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (actions) {
      actionsRef.current = { ...actionsRef.current, ...actions };
    }
  }, [actions]);

  const showToast = useCallback((text: string) => {
    setToastText(text);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastText(null);
    }, 2400);
  }, []);

  const pushMessage = useCallback(
    (rawText: string) => {
      const nextMsg = createOutgoingMessage(rawText);
      if (!nextMsg) {
        return;
      }
      setMessages((prev) => [...prev, nextMsg]);
      invokeAction(actionsRef.current, 'onSendMessage', nextMsg.text ?? '', nextMsg);
    },
    []
  );

  useEffect(() => {
    window.NightcordBridge = {
      registerActions: (nextActions) => {
        actionsRef.current = { ...actionsRef.current, ...nextActions };
      },
      getActions: () => ({ ...actionsRef.current }),
      sendMessage: pushMessage,
      notify: showToast,
    };
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, [pushMessage, showToast]);

  const handleWindowMinimize = () => {
    invokeAction(actionsRef.current, 'onWindowMinimize');
    showToast('ウィンドウを最小化しました');
  };

  const handleWindowMaximize = () => {
    invokeAction(actionsRef.current, 'onWindowMaximize');
    showToast('ウィンドウサイズを切り替えました');
  };

  const handleWindowClose = () => {
    invokeAction(actionsRef.current, 'onWindowClose');
    showToast('ナイトコードはバックグラウンドで待機中です');
  };

  const handleServerMenuClick = () => {
    invokeAction(actionsRef.current, 'onServerMenuClick');
    showToast('サーバー：25時、ナイトコードで。');
  };

  const handleChannelSelect = (channelId: string) => {
    setActiveChannel(channelId);
    setMobileSidebarOpen(false);
    invokeAction(actionsRef.current, 'onChannelSelect', channelId);
  };

  const handleSetMobileSidebar = (open: boolean) => {
    setMobileSidebarOpen(open);
    invokeAction(actionsRef.current, 'onSidebarToggle', open);
  };

  const handleVoiceToggle = () => {
    setVoiceExpanded((prev) => {
      const next = !prev;
      invokeAction(actionsRef.current, 'onVoiceCategoryToggle', next);
      return next;
    });
  };

  const handleOfflineToggle = () => {
    setOfflineExpanded((prev) => {
      const next = !prev;
      invokeAction(actionsRef.current, 'onOfflineCategoryToggle', next);
      return next;
    });
  };

  const handleMemberClick = (member: VoiceMember) => {
    setSelectedMemberId((prev) => (prev === member.id ? null : member.id));
    invokeAction(actionsRef.current, 'onMemberClick', member);
    showToast(`${member.name} を選択しました`);
  };

  const handleMicToggle = (member: VoiceMember) => {
    const result = toggleMemberMute(members, member.id);
    setMembers(result.members);
    if (result.updated) {
      invokeAction(actionsRef.current, 'onMicToggle', result.updated, result.updated.muted);
      showToast(
        result.updated.muted
          ? `${result.updated.name} をミュートにしました`
          : `${result.updated.name} のミュートを解除しました`
      );
    }
  };

  const handleChatHeaderClick = () => {
    invokeAction(actionsRef.current, 'onChatHeaderClick', activeChannel);
    showToast('チャンネル：作業');
  };

  const handleMessageClick = (message: ChatMessage) => {
    invokeAction(actionsRef.current, 'onMessageClick', message);
  };

  const handleAvatarClick = (memberId: string, username: string) => {
    invokeAction(actionsRef.current, 'onAvatarClick', memberId, username);
    showToast(`${username} のプロフィール`);
  };

  const handleFileDownload = (file: ChatAttachment) => {
    invokeAction(actionsRef.current, 'onFileDownload', file);
    showToast(`${file.filename} (${file.sizeLabel}) をダウンロード中...`);
  };

  const handleSubmitMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!inputValue.trim()) {
      return;
    }
    pushMessage(inputValue);
    setInputValue('');
  };

  const handleMentionClick = () => {
    setInputValue((prev) => appendInputToken(prev, '@えななん '));
    invokeAction(actionsRef.current, 'onMentionClick');
  };

  const handleFormatClick = () => {
    setFormatActive((prev) => {
      const next = !prev;
      invokeAction(actionsRef.current, 'onFormatClick', next);
      showToast(next ? '太字モードをオンにしました' : '太字モードをオフにしました');
      return next;
    });
  };

  const handleEmojiClick = () => {
    setInputValue((prev) => appendInputToken(prev, '♪'));
    invokeAction(actionsRef.current, 'onEmojiClick');
  };

  const handleAttachClick = () => {
    invokeAction(actionsRef.current, 'onAttachClick');
    showToast('添付ファイルを選択してください');
  };

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-[#3F3352] shadow-[0_24px_60px_rgba(0,0,0,0.65)]">
      <div className="flex h-[28px] min-h-[28px] w-full shrink-0 select-none items-center justify-end border-b border-[#191322] bg-[#211A2C] px-3.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-action="window-minimize"
            aria-label="最小化"
            title="最小化"
            onClick={handleWindowMinimize}
            className="h-[11px] w-[11px] cursor-pointer rounded-full bg-[#64D2E6] transition-transform hover:scale-110 hover:brightness-110"
          />
          <button
            type="button"
            data-action="window-maximize"
            aria-label="最大化"
            title="最大化"
            onClick={handleWindowMaximize}
            className="h-[11px] w-[11px] cursor-pointer rounded-full bg-[#F6CE71] transition-transform hover:scale-110 hover:brightness-110"
          />
          <button
            type="button"
            data-action="window-close"
            aria-label="閉じる"
            title="閉じる"
            onClick={handleWindowClose}
            className="h-[11px] w-[11px] cursor-pointer rounded-full bg-[#EB7F97] transition-transform hover:scale-110 hover:brightness-110"
          />
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1">
        <Sidebar
          activeChannel={activeChannel}
          voiceExpanded={voiceExpanded}
          offlineExpanded={offlineExpanded}
          members={members}
          selectedMemberId={selectedMemberId}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => handleSetMobileSidebar(false)}
          onServerMenuClick={handleServerMenuClick}
          onChannelSelect={handleChannelSelect}
          onVoiceToggle={handleVoiceToggle}
          onOfflineToggle={handleOfflineToggle}
          onMemberClick={handleMemberClick}
          onMicToggle={handleMicToggle}
        />
        <ChatArea
          messages={messages}
          inputValue={inputValue}
          formatActive={formatActive}
          onOpenSidebar={() => handleSetMobileSidebar(true)}
          onInputChange={setInputValue}
          onSubmitMessage={handleSubmitMessage}
          onChatHeaderClick={handleChatHeaderClick}
          onMessageClick={handleMessageClick}
          onAvatarClick={handleAvatarClick}
          onFileDownload={handleFileDownload}
          onMentionClick={handleMentionClick}
          onFormatClick={handleFormatClick}
          onEmojiClick={handleEmojiClick}
          onAttachClick={handleAttachClick}
        />
      </div>

      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed bottom-[72px] left-4 right-4 z-50 flex items-center gap-2 rounded-lg border border-[#524468] bg-[#211A2C] px-3.5 py-2 text-[12.5px] text-[#EFEBF5] shadow-[0_8px_24px_rgba(0,0,0,0.48)] transition-all duration-200 sm:left-auto sm:right-7 ${
          toastText ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
      >
        <WorkChannelIcon size={15} />
        <span className="truncate">{toastText ?? ''}</span>
      </div>
    </div>
  );
}
