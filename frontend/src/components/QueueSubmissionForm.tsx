import React from 'react';

interface QueueSubmissionFormProps {
  youtubeURL: string;
  setYoutubeURL: (url: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  adding: boolean;
}

export const QueueSubmissionForm = ({
  youtubeURL,
  setYoutubeURL,
  onSubmit,
  adding,
}: QueueSubmissionFormProps) => {
  return (
    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl">
      <h3 className="text-lg font-bold text-white mb-2">Queue a Song</h3>
      <p className="text-xs text-slate-400 mb-4">Paste any YouTube URL below to sync your song with the live queue.</p>

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          type="text"
          required
          disabled={adding}
          placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          value={youtubeURL}
          onChange={(e) => setYoutubeURL(e.target.value)}
          className="flex-1 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-pink-500/60 focus:bg-white/[0.07] outline-none text-white text-sm transition-all placeholder-slate-600"
        />
        <button
          type="submit"
          disabled={adding || !youtubeURL}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-sm font-semibold shadow-lg shadow-pink-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
        >
          {adding ? (
            <div className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add
            </>
          )}
        </button>
      </form>
    </div>
  );
};
export default QueueSubmissionForm;
