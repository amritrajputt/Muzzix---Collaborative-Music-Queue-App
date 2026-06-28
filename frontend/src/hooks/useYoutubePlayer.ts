import { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { getServerTime } from './useSpaceSocket';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

interface UseYoutubePlayerProps {
  nowPlaying: any;
  isHost: boolean;
  socketRef: React.MutableRefObject<Socket | null>;
  timeSynced: boolean;
  onSongEnded: (songId: string) => void;
  onReportDuration: (songId: string, duration: number) => void;
}

export function useYoutubePlayer({
  nowPlaying,
  isHost,
  socketRef,
  timeSynced,
  onSongEnded,
  onReportDuration,
}: UseYoutubePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  const playerRef = useRef<any>(null);
  const hasInteractedRef = useRef(false);

  const hasUserInteracted = () => {
    if (typeof navigator !== 'undefined' && navigator.userActivation) {
      return navigator.userActivation.hasBeenActive;
    }
    return hasInteractedRef.current;
  };
  const nowPlayingRef = useRef<any>(nowPlaying);
  const isHostRef = useRef<boolean>(isHost);
  const onSongEndedRef = useRef(onSongEnded);
  const onReportDurationRef = useRef(onReportDuration);

  // Keep callback/parameter refs up to date to prevent stale closure bugs in player event handlers
  useEffect(() => {
    nowPlayingRef.current = nowPlaying;
  }, [nowPlaying]);

  useEffect(() => {
    isHostRef.current = isHost;
  }, [isHost]);

  useEffect(() => {
    onSongEndedRef.current = onSongEnded;
  }, [onSongEnded]);

  useEffect(() => {
    onReportDurationRef.current = onReportDuration;
  }, [onReportDuration]);

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
      if (currentSongId) {
        onSongEndedRef.current(currentSongId);
      }
      return;
    }

    if (elapsedSeconds >= 0 && (!totalDuration || elapsedSeconds < totalDuration)) {
      player.seekTo(elapsedSeconds, true);
    }

    if (isPaused) {
      player.pauseVideo();
    } else {
      if (hasUserInteracted() && typeof player.unMute === 'function') {
        try {
          player.unMute();
        } catch (err) {}
      }

      player.playVideo();

      if (!hasUserInteracted()) {
        setTimeout(() => {
          try {
            const state = player.getPlayerState ? player.getPlayerState() : -1;
            if (state !== window.YT.PlayerState.PLAYING && state !== window.YT.PlayerState.BUFFERING) {
              console.log('[Autoplay] Unmuted playback blocked. Retrying muted...');
              player.mute();
              player.playVideo();
            }
          } catch (err) {
            console.error('[Autoplay Check Error]', err);
          }
        }, 1000);
      }
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
            setIsPlayerReady(true);
            const durationVal = event.target.getDuration();
            const currentSongId = nowPlayingRef.current?.songId;
            if (durationVal && currentSongId) {
              onReportDurationRef.current(currentSongId, durationVal);
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
                if (currentSongId) {
                  onReportDurationRef.current(currentSongId, durationVal);
                }
              }
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            } else if (event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
              const currentSongId = nowPlayingRef.current?.songId;
              if (isHostRef.current && currentSongId) {
                onSongEndedRef.current(currentSongId);
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

  // Load Iframe Script on Mount
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
      setIsPlayerReady(false);
    };
  }, []);

  // Load new video when songId changes
  useEffect(() => {
    console.log('[YT Player Debug] Sync player on song changes effect running', {
      songId: nowPlaying?.songId,
      hasPlayerRef: !!playerRef.current,
      isPlayerReady,
      hasLoadVideo: !!(playerRef.current && typeof playerRef.current.loadVideoById === 'function')
    });
    if (playerRef.current && isPlayerReady && nowPlaying?.songId) {
      if (typeof playerRef.current.loadVideoById === 'function') {
        const isPaused = nowPlaying.isPlaying === false;
        const elapsedSeconds = isPaused
          ? (nowPlaying.pausedAt || 0)
          : (nowPlaying.startedAt ? (getServerTime() - nowPlaying.startedAt) / 1000 : 0);
        const startSecs = elapsedSeconds > 0 ? Math.floor(elapsedSeconds) : 0;

        // Get currently loaded video ID if possible to prevent reloading the same video
        let currentVideoId = "";
        try {
          if (typeof playerRef.current.getVideoData === 'function') {
            currentVideoId = playerRef.current.getVideoData().video_id;
          }
        } catch (e) {}

        if (currentVideoId !== nowPlaying.songId) {
          console.log('[YT Player Debug] Loading video via loadVideoById:', nowPlaying.songId, 'start:', startSecs);
          playerRef.current.loadVideoById({
            videoId: nowPlaying.songId,
            startSeconds: startSecs
          });
          if (isPaused) {
            playerRef.current.pauseVideo();
          } else {
            if (hasUserInteracted() && typeof playerRef.current.unMute === 'function') {
              try {
                playerRef.current.unMute();
              } catch (err) {}
            }

            playerRef.current.playVideo();

            if (!hasUserInteracted()) {
              const p = playerRef.current;
              setTimeout(() => {
                try {
                  const state = p.getPlayerState ? p.getPlayerState() : -1;
                  if (state !== window.YT.PlayerState.PLAYING && state !== window.YT.PlayerState.BUFFERING) {
                    console.log('[Autoplay] Unmuted playback blocked on song change. Retrying muted...');
                    p.mute();
                    p.playVideo();
                  }
                } catch (err) {
                  console.error('[Autoplay Check Error]', err);
                }
              }, 1000);
            }
          }
        }
      } else {
        console.warn('[YT Player Debug] playerRef.current exists but loadVideoById is not a function');
      }
    } else if (nowPlaying?.songId && window.YT && window.YT.Player && !playerRef.current) {
      console.log('[YT Player Debug] Call initYoutubePlayer from song changes effect');
      initYoutubePlayer();
    }
  }, [nowPlaying?.songId, isPlayerReady]);

  // Sync play/pause and seek position on state updates
  useEffect(() => {
    if (!playerRef.current || !isPlayerReady || !nowPlaying?.songId) return;

    // Verify the correct video is loaded before syncing play/pause state
    let currentVideoId = "";
    try {
      if (typeof playerRef.current.getVideoData === 'function') {
        currentVideoId = playerRef.current.getVideoData().video_id;
      }
    } catch (e) {}

    if (currentVideoId !== nowPlaying.songId) return;

    const isPaused = nowPlaying.isPlaying === false;
    const elapsedSeconds = isPaused
      ? (nowPlaying.pausedAt || 0)
      : (nowPlaying.startedAt ? (getServerTime() - nowPlaying.startedAt) / 1000 : 0);

    try {
      if (isPaused) {
        playerRef.current.pauseVideo();
      } else {
        if (hasUserInteracted() && typeof playerRef.current.unMute === 'function') {
          playerRef.current.unMute();
        }
        playerRef.current.playVideo();
      }

      // Sync seeking if drift is significant
      const currentLoc = playerRef.current.getCurrentTime() || 0;
      if (Math.abs(currentLoc - elapsedSeconds) > 2.5) {
        playerRef.current.seekTo(elapsedSeconds, true);
      }
    } catch (err) {
      console.error('[YT Player Debug] Error syncing on metadata change:', err);
    }
  }, [nowPlaying?.startedAt, nowPlaying?.isPlaying, nowPlaying?.pausedAt, timeSynced, isPlayerReady]);

  // Autoplay recovery and auto-unmute on user interaction
  useEffect(() => {
    const handleUserInteraction = () => {
      hasInteractedRef.current = true;
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

  // Listen to socket events for real-time playback state updates (host controls seek/pause/play)
  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket) return;

    const handlePlaybackStateChanged = (data: { isPlaying: boolean; currentTime: number }) => {
      console.log('[YT Player Hook] playback-state-changed received via socket:', data);
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
        console.error('[YT Player Hook] Error handling playback-state-changed:', e);
      }
    };

    socket.on('playback-state-changed', handlePlaybackStateChanged);
    return () => {
      socket.off('playback-state-changed', handlePlaybackStateChanged);
    };
  }, [socketRef.current]);

  return {
    playerRef,
    isPlaying,
    currentTime,
    duration,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    onPlayerContainerMount,
  };
}
