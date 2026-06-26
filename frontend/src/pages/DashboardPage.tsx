import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import bgVideo from "../assets/7269159-uhd_3840_2160_25fps.mp4";
import createRoomService from "../services/createRoomService";
import { useToast } from "../contexts/ToastContext";

interface Space {
  id: string;
  name: string;
  guestCount: number;
  songCount: number;
  isHost: boolean;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [spaceName, setSpaceName] = useState("");
  const [spacePassword, setSpacePassword] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchSpaces = async () => {
    setLoading(true);
    try {
      const res = await createRoomService.getAllRooms();
      if (res && res.success && res.data && res.data.spaces) {
        const mapped = res.data.spaces.map((s: any) => ({
          id: s.id,
          name: s.spaceName,
          guestCount: s.guestCount ?? 0,
          songCount: s.songCount ?? 0,
          isHost: true,
        }));
        setSpaces(mapped);
      } else {
        setSpaces([]);
      }
    } catch (error) {
      console.error("Failed to fetch spaces:", error);
      setSpaces([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateSpaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spaceName.trim() || !spacePassword.trim()) return;

    try {
      const res = await createRoomService.createRoom(spaceName, spacePassword);
      if (res && res.success) {
        setIsCreateOpen(false);
        setSpaceName("");
        setSpacePassword("");
        showToast("Space created successfully!", "success");
        fetchSpaces();
      } else {
        showToast(res?.message || "Failed to create space. Please try again.", "error");
      }
    } catch (error) {
      console.error("Error creating space:", error);
      showToast("Failed to create space.", "error");
    }
  };

  const handleDeleteSpaceSubmit = async () => {
    if (!deleteConfirmId) return;

    try {
      const res = await createRoomService.deleteRoom(deleteConfirmId);
      if (res && res.success) {
        setDeleteConfirmId(null);
        showToast("Space deleted successfully!", "success");
        fetchSpaces();
      } else {
        showToast(res?.message || "Failed to delete space.", "error");
      }
    } catch (error) {
      console.error("Error deleting space:", error);
      showToast("Failed to delete space.", "error");
    }
  };


  return (
    <div className="min-h-screen bg-[#030014] text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden">
      {/* Background container to prevent scroll overflow from absolute glow elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Background video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        >
          <source src={bgVideo} type="video/mp4" />
        </video>

        {/* Dark overlay for contrast and blur */}
        <div className="absolute inset-0 bg-black/75 backdrop-blur-[3px]" />

        {/* Background glow effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-pink-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10 pb-6 border-b border-white/10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Space Station
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Manage your active collaborative music spaces or create a new one.
            </p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="self-start md:self-center px-5 py-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold shadow-lg shadow-pink-500/25 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center gap-2"
          >
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Space
          </button>
        </div>

        {/* Plan Overview widget */}
        <div className="mb-10 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Free Creator Account</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Basic
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Usage: 3 rooms max, 25 songs limit per queue.</p>
            </div>
          </div>
          <button className="px-4 py-2 text-xs font-semibold rounded-lg bg-white text-black hover:bg-slate-200 transition-colors cursor-pointer">
            Upgrade to Pro
          </button>
        </div>

        {/* Spaces Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white/[0.01] border border-white/[0.04] rounded-2xl backdrop-blur-xl">
              <div className="w-10 h-10 border-4 border-t-pink-500 border-purple-600 rounded-full animate-spin mb-4" />
              <p className="text-sm text-slate-400 font-medium">Contacting the mothership for spaces...</p>
            </div>
          ) : (
            <>
              {spaces.map((space) => (
                <div
                  key={space.id}
                  className="group relative flex flex-col justify-between p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.15] backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/5 hover:-translate-y-0.5"
                >
                  <div>
                    {/* Badge status */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                        {space.id}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Active
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-pink-400 transition-colors line-clamp-1">
                      {space.name}
                    </h3>

                    {/* Details list */}
                    <div className="mt-5 space-y-2 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span>{space.guestCount} listeners online</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                        <span>{space.songCount} songs in queue</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-8 flex items-center justify-between gap-3 pt-4 border-t border-white/[0.05]">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(space.id)}
                        className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] hover:text-white text-slate-400 transition-all cursor-pointer relative"
                        title="Copy space ID"
                      >
                        {copiedId === space.id ? (
                          <span className="text-[10px] text-emerald-400 font-bold">Copied!</span>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        )}
                      </button>
                      {space.isHost && (
                        <button
                          onClick={() => setDeleteConfirmId(space.id)}
                          className="p-2 rounded-lg bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 text-red-400 transition-all cursor-pointer"
                          title="Delete space"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => navigate({ to: `/spaces/${space.id}` })}
                      className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white text-white hover:text-black text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      Enter Room
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

              {/* Create space card trigger */}
              <div
                onClick={() => setIsCreateOpen(true)}
                className="flex flex-col items-center justify-center p-8 rounded-2xl bg-white/[0.01] hover:bg-white/[0.04] border border-dashed border-white/[0.12] hover:border-purple-500/40 transition-all duration-300 cursor-pointer min-h-[220px]"
              >
                <div className="w-12 h-12 rounded-full bg-purple-500/5 hover:bg-purple-500/10 border border-purple-500/10 flex items-center justify-center text-purple-400 mb-4 transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-slate-300">Create a new Space</h3>
                <p className="text-xs text-slate-500 text-center mt-1.5 max-w-[200px]">
                  Set up a room, choose a password, and start queuing songs instantly.
                </p>
              </div>
            </>
          )}
        </div>
      </div>


      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div
            onClick={() => setIsCreateOpen(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Content */}
          <div className="relative w-full max-w-md rounded-2xl bg-[#09061a] border border-white/[0.1] shadow-2xl p-6 overflow-hidden">
            {/* Top right close button */}
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-pink-400">
                Create Collaborative Space
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter details below to create a real-time collaborative queue.
              </p>
            </div>

            <form onSubmit={handleCreateSpaceSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Space Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Disco Lounge 🪩"
                  value={spaceName}
                  onChange={(e) => setSpaceName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-purple-500/80 focus:bg-white/[0.07] text-white text-sm outline-none transition-all placeholder-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Room Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Password for listeners to join"
                  value={spacePassword}
                  onChange={(e) => setSpacePassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-purple-500/80 focus:bg-white/[0.07] text-white text-sm outline-none transition-all placeholder-slate-600"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2.5 rounded-lg hover:bg-white/5 border border-transparent text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold shadow-lg shadow-pink-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  Create Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div
            onClick={() => setDeleteConfirmId(null)}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Content */}
          <div className="relative w-full max-w-sm rounded-2xl bg-[#0d0714] border border-red-500/10 shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-white">Delete Space?</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Are you sure you want to delete space <code className="text-red-300 font-mono">{deleteConfirmId}</code>? This will permanently close the room, end playback, and wipe the collaborative queue.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-lg hover:bg-white/5 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSpaceSubmit}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-lg shadow-red-500/10 active:scale-95 transition-all cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
