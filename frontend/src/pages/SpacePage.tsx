import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import LeaderBoard from '../components/LeaderBoard';
import RoomJoinForm from '../components/RoomJoinForm';
import createRoomService from '../services/createRoomService';
import songService from '../services/songService';
import api from '../services/api';
import { useSpaceSocket, getServerTime } from '../hooks/useSpaceSocket';
import RoomInfoSidebar from '../components/RoomInfoSidebar';
import QueueSubmissionForm from '../components/QueueSubmissionForm';
import QueueList from '../components/QueueList';
import MusicPlayerCard from '../components/MusicPlayerCard';
import bgVideo from '../assets/171912-846103594.mp4';
import { useToast } from '../contexts/ToastContext';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

interface SpacePageProps {
  spaceId: string;
}

interface Song {
  songId: string;
  title: string;
  url: string;
  thumbnail: string;
  addedBy: string;
  votes: number;
}

interface LeaderMember {
  name: string;
  score: number;
}

export function SpacePage({ spaceId }: SpacePageProps) {
  const { showToast } = useToast();
  // Session credentials
  const [guestName, setGuestName] = useState<string | null>(() => localStorage.getItem(`guestName_${spaceId}`));
  const [guestUuid, setGuestUuid] = useState<string | null>(() => localStorage.getItem(`guestUuid_${spaceId}`));

  // Component States
  const [spaceName, setSpaceName] = useState<string>('Music Room');
  const [queue, setQueue] = useState<Song[]>([]);
  const [nowPlaying, setNowPlaying] = useState<any>(null);
  const [youtubeURL, setYoutubeURL] = useState('');
  const [adding, setAdding] = useState(false);
  const [upvotingIds, setUpvotingIds] = useState<Set<string>>(new Set());
  const [votedSongIds, setVotedSongIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(`votedSongs_${spaceId}`);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const updateQueueAndVotes = (newQueue: Song[]) => {
    setQueue(newQueue);
    setVotedSongIds((prev) => {
      const next = new Set<string>();
      const queueIds = new Set(newQueue.map(s => s.songId));
      prev.forEach((id) => {
        if (queueIds.has(id)) {
          next.add(id);
        }
      });
      localStorage.setItem(`votedSongs_${spaceId}`, JSON.stringify(Array.from(next)));
      return next;
    });
  };

  // Clerk authentication
  const { isSignedIn } = useAuth();
  const [dbUser, setDbUser] = useState<any>(null);
  const [hostId, setHostId] = useState<string | null>(null);
  const [creatorName, setCreatorName] = useState<string | null>(null);

  // Playback & Progress States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Player reference, and Ref to avoid stale closures
  const playerRef = useRef<any>(null);
  const nowPlayingRef = useRef<any>(null);

  useEffect(() => {
    nowPlayingRef.current = nowPlaying;
  }, [nowPlaying]);

  // Fetch logged in user's DB info
  useEffect(() => {
    if (isSignedIn) {
      api.get('/auth/me')
        .then((res) => {
          if (res.data && res.data.success && res.data.data) {
            setDbUser(res.data.data);
          }
        })
        .catch((err) => {
          console.error('Error fetching current user:', err);
        });
    }
  }, [isSignedIn]);

  const isHost = dbUser && hostId && dbUser.id === hostId;

  const isHostRef = useRef<boolean>(false);
  useEffect(() => {
    isHostRef.current = !!isHost;
  }, [isHost]);

  // Sync playback position to server's startedAt
  const syncPlaybackWithServer = (player: any) => {
    if (!nowPlayingRef.current || !nowPlayingRef.current.startedAt) return;
    const isPaused = nowPlayingRef.current.isPlaying === false;
    const elapsedSeconds = isPaused
      ? (nowPlayingRef.current.pausedAt || 0)
      : (getServerTime() - nowPlayingRef.current.startedAt) / 1000;
    const totalDuration = nowPlayingRef.current.duration || (player.getDuration ? player.getDuration() : 0);

    if (isHostRef.current && !isPaused && totalDuration > 0 && elapsedSeconds >= totalDuration) {
      console.log('[YT Player Debug] Elapsed time exceeds duration, emitting song-ended');
      const currentSongId = nowPlayingRef.current?.songId;
      if (socketRef.current && currentSongId) {
        socketRef.current.emit('song-ended', {
          spaceId,
          songId: currentSongId,
        });
      }
      return;
    }

    if (elapsedSeconds >= 0 && (!totalDuration || elapsedSeconds < totalDuration)) {
      player.seekTo(elapsedSeconds, true);
    }

    if (isPaused) {
      player.pauseVideo();
    } else {
      player.playVideo();
      // Fallback for autoplay block: if player fails to start unmuted within 150ms, play muted.
      setTimeout(() => {
        try {
          if (player.getPlayerState && player.getPlayerState() !== window.YT.PlayerState.PLAYING) {
            console.log('[Autoplay] Unmuted playback blocked. Retrying muted...');
            player.mute();
            player.playVideo();
          }
        } catch (err) {
          console.error('[Autoplay Check Error]', err);
        }
      }, 150);
    }
  };

  // Initialize YouTube Iframe Player API
  const initYoutubePlayer = () => {
    const currentSong = nowPlayingRef.current;
    console.log('[YT Player Debug] initYoutubePlayer called', {
      nowPlayingSongId: currentSong?.songId,
      hasPlayerRef: !!playerRef.current,
      hasYT: !!window.YT,
      hasYTPlayer: !!(window.YT && window.YT.Player),
      domElementExists: !!document.getElementById('youtube-player-element')
    });

    if (!currentSong?.songId || playerRef.current || !window.YT || !window.YT.Player) {
      console.log('[YT Player Debug] initYoutubePlayer early exit conditions met');
      return;
    }

    const targetEl = document.getElementById('youtube-player-element');
    if (!targetEl) {
      console.error('[YT Player Debug] Target element #youtube-player-element not found in DOM!');
      return;
    }

    try {
      const isPaused = currentSong.isPlaying === false;
      const elapsedSeconds = isPaused
        ? (currentSong.pausedAt || 0)
        : (currentSong.startedAt ? (getServerTime() - currentSong.startedAt) / 1000 : 0);
      const startSec = elapsedSeconds > 0 ? Math.floor(elapsedSeconds) : 0;

      console.log('[YT Player Debug] Instantiating window.YT.Player with videoId:', currentSong.songId, 'startSec:', startSec);
      playerRef.current = new window.YT.Player('youtube-player-element', {
        height: '100%',
        width: '100%',
        videoId: currentSong.songId,
        playerVars: {
          autoplay: isPaused ? 0 : 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          start: startSec,
        },
        events: {
          onReady: (event: any) => {
            console.log('[YT Player Debug] onReady fired');
            const durationVal = event.target.getDuration();
            const currentSongId = nowPlayingRef.current?.songId;
            if (durationVal && socketRef.current && currentSongId) {
              socketRef.current.emit('report-duration', {
                spaceId,
                songId: currentSongId,
                duration: durationVal,
              });
            }
            syncPlaybackWithServer(event.target);
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              const durationVal = event.target.getDuration();
              const currentSongId = nowPlayingRef.current?.songId;
              if (durationVal) {
                setDuration(durationVal);
                if (socketRef.current && currentSongId) {
                  socketRef.current.emit('report-duration', {
                    spaceId,
                    songId: currentSongId,
                    duration: durationVal,
                  });
                }
              }
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            } else if (event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
              const currentSongId = nowPlayingRef.current?.songId;
              if (isHostRef.current && socketRef.current && currentSongId) {
                socketRef.current.emit('song-ended', {
                  spaceId,
                  songId: currentSongId,
                });
              }
            }
          },
        },
      });
    } catch (err) {
      console.error('Error creating YouTube player instance:', err);
    }
  };

  // Ref Callback for when player element mounts
  const onPlayerContainerMount = (el: HTMLDivElement | null) => {
    console.log('[YT Player Debug] onPlayerContainerMount called', {
      hasElement: !!el,
      nowPlayingSongId: nowPlayingRef.current?.songId,
      hasPlayerRef: !!playerRef.current,
      hasYTPlayer: !!(window.YT && window.YT.Player)
    });
    if (el && nowPlayingRef.current?.songId && window.YT && window.YT.Player && !playerRef.current) {
      console.log('[YT Player Debug] onPlayerContainerMount initializing player');
      initYoutubePlayer();
    }
  };

  // Load Iframe Script
  useEffect(() => {
    console.log('[YT Player Debug] Load Iframe Script effect running', { hasYT: !!window.YT });
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        console.log('[YT Player Debug] onYouTubeIframeAPIReady fired');
        initYoutubePlayer();
      };
    } else {
      console.log('[YT Player Debug] window.YT already defined, calling initYoutubePlayer');
      initYoutubePlayer();
    }

    return () => {
      console.log('[YT Player Debug] Load Iframe Script effect clean up');
      if (playerRef.current) {
        try {
          console.log('[YT Player Debug] Destroying playerRef.current');
          playerRef.current.destroy();
        } catch (e) {
          console.error(e);
        }
        playerRef.current = null;
      }
    };
  }, []);

  // Sync player on song changes
  useEffect(() => {
    console.log('[YT Player Debug] Sync player on song changes effect running', {
      songId: nowPlaying?.songId,
      hasPlayerRef: !!playerRef.current,
      hasLoadVideo: !!(playerRef.current && typeof playerRef.current.loadVideoById === 'function')
    });
    if (playerRef.current && nowPlaying?.songId) {
      if (typeof playerRef.current.loadVideoById === 'function') {
        const isPaused = nowPlaying.isPlaying === false;
        const elapsedSeconds = isPaused
          ? (nowPlaying.pausedAt || 0)
          : (nowPlaying.startedAt ? (getServerTime() - nowPlaying.startedAt) / 1000 : 0);
        const startSecs = elapsedSeconds > 0 ? Math.floor(elapsedSeconds) : 0;
        console.log('[YT Player Debug] Loading video via loadVideoById:', nowPlaying.songId, 'start:', startSecs);
        playerRef.current.loadVideoById({
          videoId: nowPlaying.songId,
          startSeconds: startSecs
        });
        if (isPaused) {
          playerRef.current.pauseVideo();
        } else {
          playerRef.current.playVideo();
          const p = playerRef.current;
          setTimeout(() => {
            try {
              if (p.getPlayerState && p.getPlayerState() !== window.YT.PlayerState.PLAYING) {
                console.log('[Autoplay] Unmuted playback blocked on song change. Retrying muted...');
                p.mute();
                p.playVideo();
              }
            } catch (err) {
              console.error('[Autoplay Check Error]', err);
            }
          }, 150);
        }
      } else {
        console.warn('[YT Player Debug] playerRef.current exists but loadVideoById is not a function');
      }
    } else if (nowPlaying?.songId && window.YT && window.YT.Player) {
      console.log('[YT Player Debug] Call initYoutubePlayer from song changes effect');
      initYoutubePlayer();
    }
  }, [nowPlaying?.songId, nowPlaying?.startedAt, nowPlaying?.isPlaying, nowPlaying?.pausedAt]);

  // Autoplay recovery and auto-unmute on user interaction
  useEffect(() => {
    const handleUserInteraction = () => {
      if (playerRef.current) {
        try {
          if (typeof playerRef.current.isMuted === 'function' && playerRef.current.isMuted()) {
            playerRef.current.unMute();
            console.log('[Autoplay Recovery] User interacted, unmuting player.');
          }
          if (nowPlaying?.isPlaying && !isPlaying) {
            if (typeof playerRef.current.playVideo === 'function') {
              playerRef.current.playVideo();
              console.log('[Autoplay Recovery] User interacted, resuming video.');
            }
          }
        } catch (e) {
          console.error('[Autoplay Recovery] Failed during interaction:', e);
        }
      }
    };

    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);
    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };
  }, [nowPlaying, isPlaying]);

  // Poll current time, duration and isPlaying state from player instance
  useEffect(() => {
    let interval: any;
    if (nowPlaying) {
      interval = setInterval(() => {
        try {
          if (playerRef.current) {
            if (typeof playerRef.current.getCurrentTime === 'function') {
              setCurrentTime(playerRef.current.getCurrentTime());
            }
            if (typeof playerRef.current.getDuration === 'function') {
              const dur = playerRef.current.getDuration();
              if (dur > 0) setDuration(dur);
            }
            if (typeof playerRef.current.getPlayerState === 'function') {
              const state = playerRef.current.getPlayerState();
              setIsPlaying(state === window.YT.PlayerState.PLAYING);
            }
          }
        } catch (e) {
          // ignore
        }
      }, 500);
    } else {
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [nowPlaying]);

  // Sync state with local storage on load
  useEffect(() => {
    const name = localStorage.getItem(`guestName_${spaceId}`);
    const uuid = localStorage.getItem(`guestUuid_${spaceId}`);
    if (name && uuid) {
      setGuestName(name);
      setGuestUuid(uuid);
    }
  }, [spaceId]);

  // Fetch Room Info & Queue
  const fetchRoomData = async () => {
    try {
      // 1. Fetch space details
      const roomRes = await createRoomService.getRoomDetails(spaceId);
      if (roomRes && roomRes.success && roomRes.data?.space) {
        setSpaceName(roomRes.data.space.spaceName);
        setHostId(roomRes.data.space.userId);
        setCreatorName(roomRes.data.space.creatorName || null);
      }

      // 2. Fetch songs queue
      const songsRes = await songService.getSpaceSongs(spaceId);
      if (songsRes && songsRes.success && songsRes.data?.songs) {
        updateQueueAndVotes(songsRes.data.songs);
      }
    } catch (err) {
      console.error('Error fetching room details:', err);
    }
  };

  useEffect(() => {
    if (guestUuid) {
      fetchRoomData();
    }
  }, [spaceId, guestUuid]);

  // Socket Connection setup via useSpaceSocket hook
  const socketRef = useSpaceSocket(spaceId, guestUuid, guestName, {
    onQueueUpdated: (newQueue) => {
      updateQueueAndVotes(newQueue);
    },
    onNowPlayingChanged: (song) => {
      setNowPlaying(song);
    },
    onPlaybackStateChanged: (data) => {
      console.log('[YT Player Debug] playback-state-changed received:', data);
      if (!playerRef.current) return;
      try {
        const playerState = playerRef.current.getPlayerState();
        const localIsPlaying = (playerState === window.YT.PlayerState.PLAYING);

        if (data.isPlaying) {
          if (!localIsPlaying) {
            playerRef.current.playVideo();
          }
          const currentLoc = playerRef.current.getCurrentTime() || 0;
          if (Math.abs(currentLoc - data.currentTime) > 2.5) {
            playerRef.current.seekTo(data.currentTime, true);
          }
        } else {
          if (localIsPlaying) {
            playerRef.current.pauseVideo();
          }
        }
      } catch (e) {
        console.error('Error handling playback-state-changed:', e);
      }
    }
  });

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle play/pause (creator pauses globally, listeners pause locally)
  const handlePlayPause = async () => {
    if (!playerRef.current) return;
    try {
      const state = playerRef.current.getPlayerState();
      const nextIsPlaying = (state !== window.YT.PlayerState.PLAYING);

      const isServerPaused = nowPlaying?.isPlaying === false;
      const expectedServerTime = isServerPaused
        ? (nowPlaying?.pausedAt || 0)
        : (nowPlaying?.startedAt ? (getServerTime() - nowPlaying.startedAt) / 1000 : 0);

      const currentTimeVal = playerRef.current.getCurrentTime() || 0;

      // Optimistically update local player state for responsiveness
      if (nextIsPlaying) {
        if (!isHost) {
          playerRef.current.seekTo(expectedServerTime, true);
        }
        playerRef.current.playVideo();
        setIsPlaying(true);
      } else {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      }

      // Only host triggers global synchronization
      if (isHost) {
        if (nextIsPlaying && !isServerPaused) {
          // If the server is already playing, the host just resumed locally due to autoplay block/lag.
          // Seek to the expected server time and play locally.
          playerRef.current.seekTo(expectedServerTime, true);
          return;
        }

        await api.post(`/spaces/${spaceId}/playback`, {
          isPlaying: nextIsPlaying,
          currentTime: nextIsPlaying ? expectedServerTime : currentTimeVal
        });
      }
    } catch (e) {
      console.error('Error toggling play/pause:', e);
    }
  };

  // Skip song (host-only)
  const handleSkip = async () => {
    if (!isHost) return;
    try {
      const res = await api.post(`/spaces/${spaceId}/next`);
      if (res.data && res.data.success) {
        fetchRoomData();
      }
    } catch (err) {
      console.error('Failed to skip song:', err);
      showToast('Failed to skip song. Only the host is allowed to skip.', 'error');
    }
  };

  // Force sync / refresh room data
  const handleForceRefresh = () => {
    fetchRoomData();
    if (playerRef.current) {
      try {
        if (typeof playerRef.current.playVideo === 'function') {
          playerRef.current.playVideo();
        }
      } catch (e) {
        console.error('Error starting player during force sync:', e);
      }
    }
  };

  // Add song to queue
  const handleAddSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeURL.trim() || !guestUuid) return;

    setAdding(true);
    try {
      const res = await songService.addSong(spaceId, guestUuid, youtubeURL);
      if (res && res.success) {
        setYoutubeURL('');
        fetchRoomData();
      } else {
        showToast(res?.message || 'Failed to add song.', 'error');
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to add song. Ensure it is a valid YouTube link.', 'error');
    } finally {
      setAdding(false);
    }
  };

  // Upvote a song
  const handleUpvote = async (songId: string) => {
    if (!guestUuid || upvotingIds.has(songId) || votedSongIds.has(songId)) return;

    setUpvotingIds((prev) => {
      const next = new Set(prev);
      next.add(songId);
      return next;
    });

    try {
      const res = await songService.upvoteSong(spaceId, songId, guestUuid);
      if (res && res.success) {
        setVotedSongIds((prev) => {
          const next = new Set(prev);
          next.add(songId);
          localStorage.setItem(`votedSongs_${spaceId}`, JSON.stringify(Array.from(next)));
          return next;
        });
        fetchRoomData();
      }
    } catch (err) {
      console.error('Failed to upvote song:', err);
    } finally {
      setUpvotingIds((prev) => {
        const next = new Set(prev);
        next.delete(songId);
        return next;
      });
    }
  };

  // Calculate mock leaderboard members based on queue authors if real stats not ready
  const getLeaderboardData = (): LeaderMember[] => {
    const scoreMap: Record<string, number> = {};
    scoreMap[guestName || 'You'] = 25; // default active user score seed

    queue.forEach((song) => {
      // Seed scores based on items queued and votes received
      const author = song.addedBy === guestName || song.addedBy === guestUuid
        ? (guestName || 'You')
        : (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(song.addedBy) ? 'Guest' : song.addedBy);
      scoreMap[author] = (scoreMap[author] || 0) + 15 + (song.votes * 10);
    });

    return Object.entries(scoreMap)
      .map(([name, score]) => ({ name, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  };

  // Render Join Form overlay if guest credentials do not exist
  if (!guestUuid || !guestName) {
    return (
      <div className="min-h-screen bg-[#030014] text-white flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-30 z-0"
        >
          <source src={bgVideo} type="video/mp4" />
        </video>

        {/* Dark overlay for contrast and blur */}
        <div className="absolute inset-0 bg-black/75 backdrop-blur-[3px] z-0 pointer-events-none" />

        {/* Glow lights */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-pink-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <RoomJoinForm
            initialSpaceId={spaceId}
            onSuccess={(res) => {
              const member = res.data?.space;
              if (member) {
                localStorage.setItem(`guestName_${spaceId}`, member.guestName);
                localStorage.setItem(`guestUuid_${spaceId}`, member.guestUuid);
                setGuestName(member.guestName);
                setGuestUuid(member.guestUuid);
              } else {
                // fallback if structure differs
                const fallbackName = 'Listener';
                const fallbackUuid = Math.random().toString(36).substring(2, 15);
                localStorage.setItem(`guestName_${spaceId}`, fallbackName);
                localStorage.setItem(`guestUuid_${spaceId}`, fallbackUuid);
                setGuestName(fallbackName);
                setGuestUuid(fallbackUuid);
              }
            }}
          />
        </div>
      </div>
    );
  }

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
            onLeave={() => {
              localStorage.removeItem(`guestName_${spaceId}`);
              localStorage.removeItem(`guestUuid_${spaceId}`);
              setGuestName(null);
              setGuestUuid(null);
            }}
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
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            formatTime={formatTime}
            onPlayPause={handlePlayPause}
            onSkip={handleSkip}
            onForceRefresh={handleForceRefresh}
            isHost={isHost}
            onPlayerContainerMount={onPlayerContainerMount}
          />
        </div>

      </div>
    </div>
  );
}
