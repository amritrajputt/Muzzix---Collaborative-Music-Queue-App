interface MusicPlayerCardProps {
  nowPlaying: any;
  currentTime: number;
  duration: number;
  formatTime: (seconds: number) => string;
  onPlayerContainerMount: (el: HTMLDivElement | null) => void;
}

export const MusicPlayerCard = ({
  nowPlaying,
  currentTime,
  duration,
  formatTime,
  onPlayerContainerMount,
}: MusicPlayerCardProps) => {

  return (
    <div className="p-6 rounded-3xl bg-[#09061a]/95 border border-white/[0.08] shadow-2xl backdrop-blur-xl relative overflow-hidden group flex flex-col items-center text-center">
      {/* GLOW DECORATIONS */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-pink-500/10 rounded-full blur-[60px] pointer-events-none group-hover:bg-pink-500/15 transition-all duration-500" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none group-hover:bg-purple-500/15 transition-all duration-500" />

      {/* Embedded Player frame container */}
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
    </div>
  );
};
export default MusicPlayerCard;
