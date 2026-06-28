import { useSpaceRoom } from '../hooks/useSpaceRoom';
import { useYoutubePlayer } from '../hooks/useYoutubePlayer';
import LeaderBoard from '../components/LeaderBoard';
import RoomJoinForm from '../components/RoomJoinForm';
import RoomInfoSidebar from '../components/RoomInfoSidebar';
import QueueSubmissionForm from '../components/QueueSubmissionForm';
import QueueList from '../components/QueueList';
import MusicPlayerCard from '../components/MusicPlayerCard';
import bgVideo from '../assets/171912-846103594.mp4';

interface SpacePageProps {
  spaceId: string;
}

export function SpacePage({ spaceId }: SpacePageProps) {
  const {
    guestName,
    guestUuid,
    spaceName,
    queue,
    nowPlaying,
    youtubeURL,
    setYoutubeURL,
    adding,
    upvotingIds,
    votedSongIds,
    isHost,
    creatorName,
    socketRef,
    handleJoinSuccess,
    handleJoinFallback,
    handleLeave,
    handleAddSong,
    handleUpvote,
    getLeaderboardData,
    reportSongEnded,
    reportDuration,
    timeSynced,
  } = useSpaceRoom(spaceId);

  const {
    currentTime,
    duration,
    onPlayerContainerMount,
  } = useYoutubePlayer({
    nowPlaying,
    isHost,
    socketRef,
    timeSynced,
    onSongEnded: reportSongEnded,
    onReportDuration: reportDuration,
  });

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Render Join Form overlay if guest credentials do not exist
  if (!guestUuid || !guestName) {
    return (
      <div className="min-h-screen bg-[#030014] text-white flex items-center justify-center p-4 relative overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-30 z-0"
        >
          <source src={bgVideo} type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-black/75 backdrop-blur-[3px] z-0 pointer-events-none" />

        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-pink-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <RoomJoinForm
            initialSpaceId={spaceId}
            onSuccess={(res) => {
              const member = res.data?.space;
              if (member) {
                handleJoinSuccess(member);
              } else {
                handleJoinFallback();
              }
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030014] text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        >
          <source src={bgVideo} type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-black/75 backdrop-blur-[3px]" />

        <div className="absolute top-[-10%] left-[-15%] w-[45%] h-[45%] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-15%] w-[45%] h-[45%] bg-pink-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* LEFT COLUMN: Sidebar Navigation & Room Settings */}
        <div className="lg:col-span-3 space-y-6">
          <RoomInfoSidebar
            spaceName={spaceName}
            spaceId={spaceId}
            guestName={guestName}
            creatorName={creatorName}
            onLeave={handleLeave}
          />
        </div>

        {/* CENTER COLUMN: Music Submission Form & Song Queue */}
        <div className="lg:col-span-6 space-y-6">
          <QueueSubmissionForm
            youtubeURL={youtubeURL}
            setYoutubeURL={setYoutubeURL}
            onSubmit={handleAddSong}
            adding={adding}
          />
          <QueueList
            queue={queue}
            guestUuid={guestUuid}
            guestName={guestName}
            upvotingIds={upvotingIds}
            votedSongIds={votedSongIds}
            onUpvote={handleUpvote}
          />
        </div>

        {/* RIGHT COLUMN: Leaderboard & Player */}
        <div className="lg:col-span-3 space-y-6 flex flex-col">
          <div className="w-full">
            <LeaderBoard leaderBoard={getLeaderboardData()} />
          </div>
          <MusicPlayerCard
            nowPlaying={nowPlaying}
            currentTime={currentTime}
            duration={duration}
            formatTime={formatTime}
            onPlayerContainerMount={onPlayerContainerMount}
          />
        </div>
      </div>
    </div>
  );
}
