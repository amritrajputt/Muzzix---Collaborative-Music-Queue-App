import React from 'react';

interface CreateSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  spaceName: string;
  setSpaceName: (val: string) => void;
  spacePassword: string;
  setSpacePassword: (val: string) => void;
  isCreating?: boolean;
}

export function CreateSpaceModal({
  isOpen,
  onClose,
  onSubmit,
  spaceName,
  setSpaceName,
  spacePassword,
  setSpacePassword,
  isCreating = false,
}: CreateSpaceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        onClick={isCreating ? undefined : onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Content */}
      <div className="relative w-full max-w-md rounded-2xl bg-[#09061a] border border-white/[0.1] shadow-2xl p-6 overflow-hidden">
        {/* Top right close button */}
        <button
          onClick={onClose}
          disabled={isCreating}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
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

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Space Name
            </label>
            <input
              type="text"
              required
              disabled={isCreating}
              placeholder="e.g. My Disco Lounge 🪩"
              value={spaceName}
              onChange={(e) => setSpaceName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-purple-500/80 focus:bg-white/[0.07] text-white text-sm outline-none transition-all placeholder-slate-600 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Room Password
            </label>
            <input
              type="password"
              required
              disabled={isCreating}
              placeholder="Password for listeners to join"
              value={spacePassword}
              onChange={(e) => setSpacePassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-purple-500/80 focus:bg-white/[0.07] text-white text-sm outline-none transition-all placeholder-slate-600 disabled:opacity-50"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              disabled={isCreating}
              className="px-4 py-2.5 rounded-lg hover:bg-white/5 border border-transparent text-slate-300 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="px-5 py-2.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold shadow-lg shadow-pink-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {isCreating && (
                <div className="w-3 h-3 border-2 border-t-transparent border-white rounded-full animate-spin" />
              )}
              <span>{isCreating ? 'Creating...' : 'Create Now'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default CreateSpaceModal;
