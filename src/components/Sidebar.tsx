import type { VoiceMember } from '../types/nightcord';
import { NightcordAvatar, WorkChannelIcon } from './NightcordArt';

interface SidebarProps {
  activeChannel: string;
  voiceExpanded: boolean;
  offlineExpanded: boolean;
  members: VoiceMember[];
  selectedMemberId: string | null;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onServerMenuClick: () => void;
  onChannelSelect: (channelId: string) => void;
  onVoiceToggle: () => void;
  onOfflineToggle: () => void;
  onMemberClick: (member: VoiceMember) => void;
  onMicToggle: (member: VoiceMember) => void;
}

export function Sidebar({
  activeChannel,
  voiceExpanded,
  offlineExpanded,
  members,
  selectedMemberId,
  mobileOpen,
  onCloseMobile,
  onServerMenuClick,
  onChannelSelect,
  onVoiceToggle,
  onOfflineToggle,
  onMemberClick,
  onMicToggle,
}: SidebarProps) {
  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="サイドバーを閉じる"
          onClick={onCloseMobile}
          className="fixed inset-x-0 bottom-0 top-[28px] z-30 bg-black/50 md:hidden"
        />
      )}
      <aside
        className={`fixed bottom-0 left-0 top-[28px] z-40 flex w-[265px] max-w-[82vw] shrink-0 select-none flex-col border-r border-[#241C30] bg-[#2E243D] transition-transform duration-200 ease-out md:static md:top-auto md:z-auto md:h-full md:w-[230px] md:max-w-none md:translate-x-0 lg:w-[255px] ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="flex h-[52px] w-full shrink-0 items-center justify-between border-b border-[#241C30]">
          <button
            type="button"
            data-action="server-menu"
            aria-label="サーバーメニュー：25時、ナイトコードで。"
            onClick={onServerMenuClick}
            className="flex h-full min-w-0 flex-1 cursor-pointer items-center gap-2 px-4 text-left transition-colors hover:bg-[#362B47]"
          >
            <span className="truncate text-[14px] font-bold tracking-[0.01em] text-[#EFEBF5]">
              25時、ナイトコードで。
            </span>
            <span className="inline-flex shrink-0 items-center text-[#9A90A8]">
              <svg width="11" height="7" viewBox="0 0 11 7" fill="none" aria-hidden="true">
                <path
                  d="M1.5 1.5L5.5 5.5L9.5 1.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>
          <button
            type="button"
            data-action="sidebar-close"
            aria-label="メニューを閉じる"
            onClick={onCloseMobile}
            className="mr-2 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-[#9A90A8] transition-colors hover:bg-[#362B47] hover:text-white md:hidden"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M4 4L12 12M12 4L4 12"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="nc-scroll flex-1 pb-4">
          <div className="mx-2.5 my-3">
            <button
              type="button"
              data-action="channel-work"
              aria-label="チャンネル：作業"
              aria-current={activeChannel === 'work' ? 'page' : undefined}
              onClick={() => onChannelSelect('work')}
              className={`flex h-[38px] w-full cursor-pointer items-center gap-2.5 rounded-[6px] px-3 text-left transition-colors ${
                activeChannel === 'work'
                  ? 'bg-[#473A5C] text-white'
                  : 'bg-transparent text-[#DCD7E5] hover:bg-[#3A2F4D]'
              }`}
            >
              <WorkChannelIcon size={22} />
              <span className="text-[14px] font-semibold">作業</span>
            </button>
          </div>

        <button
          type="button"
          data-action="toggle-voice-category"
          aria-expanded={voiceExpanded}
          onClick={onVoiceToggle}
          className="flex w-full cursor-pointer items-center gap-1.5 px-4 pb-1.5 pt-2.5 text-left text-[11px] font-bold text-[#9A90A8] transition-colors hover:text-[#DCD7E5]"
        >
          <span
            className="inline-block transition-transform duration-150"
            style={{ transform: voiceExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}
            aria-hidden="true"
          >
            &gt;
          </span>
          <span>ボイスチャット</span>
        </button>

        {voiceExpanded && (
          <div className="mb-3 flex flex-col gap-0.5">
            {members.map((member) => {
              const isSelected = selectedMemberId === member.id;
              return (
                <div
                  key={member.id}
                  className={`mx-1.5 flex h-[36px] items-center justify-between rounded-[6px] pl-4 pr-3 transition-colors ${
                    isSelected ? 'bg-[#3C3050]' : 'hover:bg-[#382D4A]'
                  }`}
                >
                  <button
                    type="button"
                    data-action={`member-${member.id}`}
                    aria-label={`メンバー：${member.name}`}
                    onClick={() => onMemberClick(member)}
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 bg-transparent py-1 text-left"
                  >
                    <NightcordAvatar type={member.avatar} size={25} showOnlineDot={member.online} />
                    <span className="truncate text-[13px] font-medium text-[#DCD7E5]">
                      {member.name}
                    </span>
                  </button>
                  <button
                    type="button"
                    data-action={`mic-${member.id}`}
                    aria-label={`${member.name}のマイク切替`}
                    aria-pressed={member.muted}
                    title="マイク切替"
                    onClick={() => onMicToggle(member)}
                    className={`flex cursor-pointer items-center justify-center rounded p-1 transition-colors ${
                      member.muted
                        ? 'text-[#EB7F97] hover:text-[#F49EB2]'
                        : 'text-[#8C829C] hover:text-[#EFEBF5]'
                    }`}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
                      <path d="M7 1.5C5.9 1.5 5 2.4 5 3.5V7.5C5 8.6 5.9 9.5 7 9.5C8.1 9.5 9 8.6 9 7.5V3.5C9 2.4 8.1 1.5 7 1.5Z" />
                      <path d="M3.2 6.8V7.5C3.2 9.4 4.6 11.0 6.4 11.2V13H7.6V11.2C9.4 11.0 10.8 9.4 10.8 7.5V6.8H9.6V7.5C9.6 8.9 8.4 10.1 7 10.1C5.6 10.1 4.4 8.9 4.4 7.5V6.8H3.2Z" />
                      {member.muted && (
                        <line
                          x1="2"
                          y1="2"
                          x2="12"
                          y2="12"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      )}
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <button
          type="button"
          data-action="toggle-offline-category"
          aria-expanded={offlineExpanded}
          onClick={onOfflineToggle}
          className="flex w-full cursor-pointer items-center gap-1.5 px-4 pb-1.5 pt-2.5 text-left text-[11px] font-bold text-[#9A90A8] transition-colors hover:text-[#DCD7E5]"
        >
          <span
            className="inline-block transition-transform duration-150"
            style={{ transform: offlineExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
            aria-hidden="true"
          >
            &gt;
          </span>
          <span>オフライン</span>
        </button>

        {offlineExpanded && (
          <div className="px-6 py-1.5 text-[12px] text-[#857A99]">
            オフラインのメンバーはいません
          </div>
        )}
        </div>
      </aside>
    </>
  );
}
