import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import joinRoomService from '../services/joinRoomService';
import { useToast } from '../contexts/ToastContext';

interface RoomJoinFormProps {
  initialSpaceId?: string;
  onSuccess?: (spaceMember: any) => void;
  onCancel?: () => void;
}

const RoomJoinForm = ({ initialSpaceId = '', onSuccess, onCancel }: RoomJoinFormProps) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [spaceId, setSpaceId] = useState(initialSpaceId);
  const [name, setName] = useState('');
  const [spacePassword, setSpacePassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spaceId.trim() || !name.trim() || !spacePassword.trim()) {
      setError("Please fill out all fields.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await joinRoomService.joinRoom(spaceId, name, spacePassword);
      if (res) {
        const member = res.data?.space;
        if (member?.guestName && member?.guestUuid) {
          localStorage.setItem(`guestName_${spaceId}`, member.guestName);
          localStorage.setItem(`guestUuid_${spaceId}`, member.guestUuid);
        }
        if (onSuccess) {
          onSuccess(res);
        } else {
          showToast("Joined space successfully!", "success");
          navigate({ to: `/spaces/${spaceId}` });
        }
      } else {
        setError("Invalid Room ID or Password. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to join the room. Please verify network or credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#09061a]/95 border border-white/[0.08] shadow-2xl backdrop-blur-xl relative overflow-hidden group">
      {/* Close button if onCancel is provided */}
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Decorative ambient background glows */}
      <div className="absolute -left-10 -top-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none transition-all duration-500 group-hover:bg-purple-500/15" />
      <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl pointer-events-none transition-all duration-500 group-hover:bg-pink-500/15" />

      <div className="text-center mb-6 sm:mb-8 relative z-10">
        <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
          Listening Space Gate
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-white mt-3 sm:mt-4 tracking-wide uppercase">
          Join Music Room
        </h2>
        <p className="text-[11px] sm:text-xs text-slate-400 mt-1.5 sm:mt-2">
          Enter details below to sync with the room's live queue.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 text-center font-medium relative z-10">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 relative z-10">
        <div>
          <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-2">
            Space ID / Room ID
          </label>
          <input
            type="text"
            required
            placeholder="Paste Space ID here"
            value={spaceId}
            onChange={(e) => setSpaceId(e.target.value)}
            className="w-full px-4 py-3 text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-purple-500/80 focus:bg-white/[0.07] outline-none text-white transition-all placeholder-slate-600 focus:shadow-[0_0_15px_rgba(168,85,247,0.15)]"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-2">
            Your Nickname
          </label>
          <input
            type="text"
            required
            placeholder="e.g. DJ DiscoCat 🐱"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-purple-500/80 focus:bg-white/[0.07] outline-none text-white transition-all placeholder-slate-600 focus:shadow-[0_0_15px_rgba(168,85,247,0.15)]"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-2">
            Room Password
          </label>
          <input
            type="password"
            required
            placeholder="Ask the host for the password"
            value={spacePassword}
            onChange={(e) => setSpacePassword(e.target.value)}
            className="w-full px-4 py-3 text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-pink-500/80 focus:bg-white/[0.07] outline-none text-white transition-all placeholder-slate-600 focus:shadow-[0_0_15px_rgba(236,72,153,0.15)]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 py-3.5 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-xl shadow-lg shadow-pink-500/20 hover:shadow-pink-500/30 active:scale-95 transition-all cursor-pointer text-sm tracking-wide uppercase flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Join Room"
          )}
        </button>
      </form>
    </div>
  )
}

export default RoomJoinForm