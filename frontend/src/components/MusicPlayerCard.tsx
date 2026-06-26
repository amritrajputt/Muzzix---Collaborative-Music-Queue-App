interface MusicPlayerCardProps {
  nowPlaying: any;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  formatTime: (seconds: number) => string;
  onPlayPause: () => void;
  onSkip: () => void;
  onForceRefresh: () => void;
  isHost: boolean;
  onPlayerContainerMount: (el: HTMLDivElement | null) => void;
}

export const MusicPlayerCard = ({
  nowPlaying,
  isPlaying,
  currentTime,
  duration,
  formatTime,
  onPlayPause,
  onSkip,
  onForceRefresh,
  isHost,
  onPlayerContainerMount,
}: MusicPlayerCardProps) => {

  return (
    <div className="p-6 rounded-3xl bg-[#09061a]/95 border border-white/[0.08] shadow-2xl backdrop-blur-xl relative overflow-hidden group flex flex-col items-center text-center">
      {/* YouTube Player Container */}
      <div className="w-full my-4 aspect-video rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl bg-black">
        <div id="youtube-player-element" ref={onPlayerContainerMount} className="w-full h-full" />
        {/* Transparent overlay to block direct clicks/interactions on the YouTube iframe */}
        <div className="absolute inset-0 z-10 bg-transparent cursor-default" />
      </div>

      {/* Song Metadata */}
      <div className="w-full px-2 mb-6">
        <h4 className="text-sm font-bold text-white truncate select-none leading-tight">
          {nowPlaying?.title || 'Nothing Playing'}
        </h4>
        <p className="text-[10px] text-slate-500 mt-1 truncate uppercase font-bold tracking-widest font-mono">
          {nowPlaying ? 'Live Broadcast' : 'Add songs to start'}
        </p>
      </div>

      {/* Progress Slider */}
      <div className="w-full px-1 mb-6">
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden relative cursor-pointer group/bar">
          <div
            className="h-full bg-pink-500 rounded-full group-hover/bar:bg-pink-400 transition-all"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
        <div className="flex justify-between text-[8px] font-bold text-slate-500 font-mono mt-1.5 select-none">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-center gap-5 w-full">
        {/* Upvote current */}
        <button
          disabled={true}
          className="text-slate-600 cursor-not-allowed opacity-35 transition-colors"
          title="Current track cannot be upvoted"
        >
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
        </button>

        {/* Back / Skip previous */}
        <button disabled className="text-slate-600 cursor-not-allowed">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
          </svg>
        </button>

        {/* Play / Pause Button */}
        <button
          onClick={onPlayPause}
          disabled={!nowPlaying}
          className="w-10 h-10 rounded-full bg-pink-500 hover:bg-pink-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/20 transition-transform select-none hover:scale-105 active:scale-95 border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="w-4.5 h-4.5 translate-x-[1px]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Next track (Skip) */}
        <button
          onClick={onSkip}
          disabled={!isHost || !nowPlaying}
          className={`transition-colors border-0 bg-transparent ${
            isHost && nowPlaying ? 'text-slate-300 hover:text-white cursor-pointer' : 'text-slate-600 cursor-not-allowed'
          }`}
          title={isHost ? 'Skip current track' : 'Only host can skip'}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 18l8.5-6L6 6v12zm2-8.14 4.77 3.36-4.77 3.36V9.86zM18 6h-2v12h2z" />
          </svg>
        </button>

        {/* Broadcast Sync */}
        <button
          onClick={onForceRefresh}
          className="text-slate-500 hover:text-pink-400 transition-colors cursor-pointer"
          title="Force refresh queue"
        >
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
          </svg>
        </button>
      </div>
    </div>
  );
};
export default MusicPlayerCard;
