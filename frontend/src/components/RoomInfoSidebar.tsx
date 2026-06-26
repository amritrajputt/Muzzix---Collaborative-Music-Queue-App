
import { useToast } from '../contexts/ToastContext';

interface RoomInfoSidebarProps {
  spaceName: string;
  spaceId: string;
  guestName: string;
  onLeave: () => void;
}

export const RoomInfoSidebar = ({ spaceName, spaceId, guestName, onLeave }: RoomInfoSidebarProps) => {
  const { showToast } = useToast();

  const handleCopyId = () => {
    navigator.clipboard.writeText(spaceId);
    showToast('Room ID copied to clipboard!', 'success');
  };

  return (
    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl">
      <h2 className="text-xl font-bold tracking-wider text-pink-400 mb-1 uppercase truncate">
        {spaceName}
      </h2>
      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Connected Room
      </div>

      <div className="space-y-4">
        <div>
          <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Room ID</span>
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <code className="text-xs text-purple-300 font-mono truncate mr-2">{spaceId}</code>
            <button
              onClick={handleCopyId}
              className="p-1.5 rounded-md hover:bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            </button>
          </div>
        </div>

        <div>
          <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Your Identity</span>
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="w-6.5 h-6.5 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-xs font-bold text-purple-400">
              {guestName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-semibold text-slate-300 truncate">{guestName}</span>
          </div>
        </div>
      </div>

      <hr className="border-white/[0.06] my-6" />

      <div className="space-y-2">
        <a
          href="/dashboard"
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] text-slate-300 hover:text-white transition-all text-sm font-medium"
        >
          🏠 Dashboard
        </a>
        <button
          onClick={onLeave}
          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/5 text-red-400/80 hover:text-red-400 transition-all text-sm font-medium border-0 bg-transparent text-left cursor-pointer"
        >
          🚪 Leave Room
        </button>
      </div>
    </div>
  );
};
export default RoomInfoSidebar;
