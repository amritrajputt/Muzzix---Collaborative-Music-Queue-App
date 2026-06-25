
interface Song {
  songId: string;
  title: string;
  url: string;
  thumbnail: string;
  addedBy: string;
  votes: number;
}

interface QueueListProps {
  queue: Song[];
  guestUuid: string | null;
  upvotingIds: Set<string>;
  votedSongIds: Set<string>;
  onUpvote: (songId: string) => void;
}

export const QueueList = ({ queue, guestUuid, upvotingIds, votedSongIds, onUpvote }: QueueListProps) => {
  return (
    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white uppercase tracking-wider">Play Queue</h3>
        <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded border border-purple-500/20 uppercase tracking-widest font-mono">
          {queue.length} Songs Queued
        </span>
      </div>

      {queue.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-slate-500 mb-4">
            🎵
          </div>
          <h4 className="text-sm font-semibold text-slate-300">The queue is empty</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-[240px]">
            Be the first to paste a YouTube URL and get the room groove started!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {queue.map((song, idx) => (
            <div
              key={song.songId}
              className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all group"
            >
              {/* Index */}
              <span className="text-xs font-mono font-bold text-slate-600 w-4.5 text-center">
                {(idx + 1).toString().padStart(2, '0')}
              </span>

              {/* Thumbnail */}
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-900 border border-white/[0.06] flex-shrink-0 relative">
                <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate group-hover:text-pink-400 transition-colors">
                  {song.title}
                </h4>
                <p className="text-[10px] text-slate-500 mt-1 truncate">
                  Queued by:{' '}
                  <span className="text-slate-400 font-medium">
                    {song.addedBy === guestUuid ? 'You' : `User_${song.addedBy.substring(0, 4)}`}
                  </span>
                </p>
              </div>

              {/* Votes & Actions */}
              <button
                onClick={() => onUpvote(song.songId)}
                disabled={upvotingIds.has(song.songId) || votedSongIds.has(song.songId)}
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all border cursor-pointer ${
                  votedSongIds.has(song.songId)
                    ? 'bg-pink-500/20 text-pink-400 border-pink-500/30'
                    : song.addedBy === guestUuid
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/25 hover:bg-purple-500/20'
                      : 'bg-white/[0.02] text-slate-400 border-white/[0.06] hover:border-pink-500/30 hover:text-pink-400 hover:bg-pink-500/5'
                }`}
              >
                {upvotingIds.has(song.songId) ? (
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                )}
                <span className="text-xs font-mono font-black">{song.votes}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default QueueList;
