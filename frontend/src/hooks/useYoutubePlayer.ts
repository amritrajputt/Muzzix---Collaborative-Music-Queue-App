import { useState, useEffect, useRef, useCallback } from 'react';
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
  timeSynced: boolean;
  onSongEnded: (songId: string) => void;
  onReportDuration: (songId: string, duration: number) => void;
}

export function useYoutubePlayer({
  nowPlaying,
  isHost,
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

  // Refs for callbacks/states to prevent dependency recalculation issues
  const onSongEndedRef = useRef(onSongEnded);
  const onReportDurationRef = useRef(onReportDuration);
  const nowPlayingRef = useRef(nowPlaying);
  const isHostRef = useRef(isHost);

  useEffect(() => {
    onSongEndedRef.current = onSongEnded;
    onReportDurationRef.current = onReportDuration;
    nowPlayingRef.current = nowPlaying;
    isHostRef.current = isHost;
  }, [onSongEnded, onReportDuration, nowPlaying, isHost]);

  const hasUserInteracted = () => hasInteractedRef.current;

  // Sync playback position to server's startedAt
  const syncPlaybackWithServer = (player: any) => {
    if (!nowPlayingRef.current || !nowPlayingRef.current.startedAt) return;
    const elapsedSeconds = (getServerTime() - nowPlayingRef.current.startedAt) / 1000;
    const totalDuration = nowPlayingRef.current.duration || (player.getDuration ? player.getDuration() : 0);

    if (isHostRef.current && totalDuration > 0 && elapsedSeconds >= totalDuration) {
      const currentSongId = nowPlayingRef.current?.songId;
      if (currentSongId) {
        onSongEndedRef.current(currentSongId);
      }
      return;
    }

    if (elapsedSeconds >= 0 && (!totalDuration || elapsedSeconds < totalDuration)) {
      player.seekTo(elapsedSeconds, true);
    }

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
            player.mute();
            player.playVideo();
          }
        } catch (err) {
          console.error('[Autoplay Check Error]', err);
        }
      }, 1000);
    }
  };

  // Initialize YouTube Iframe Player API
  const initYoutubePlayer = () => {
    const currentSong = nowPlayingRef.current;

    if (!currentSong?.songId || playerRef.current || !window.YT || !window.YT.Player) {
      return;
    }

    const targetEl = document.getElementById('youtube-player-element');
    if (!targetEl) {
      console.error('[YT Player Debug] Target element #youtube-player-element not found in DOM!');
      return;
    }

    try {
      const elapsedSeconds = currentSong.startedAt ? (getServerTime() - currentSong.startedAt) / 1000 : 0;
      const startSec = elapsedSeconds > 0 ? Math.floor(elapsedSeconds) : 0;

      playerRef.current = new window.YT.Player('youtube-player-element', {
        height: '100%',
        width: '100%',
        videoId: currentSong.songId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          start: startSec,
        },
        events: {
          onReady: (event: any) => {
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
  const onPlayerContainerMount = useCallback((el: HTMLDivElement | null) => {
    if (el && nowPlayingRef.current?.songId && window.YT && window.YT.Player && !playerRef.current) {
      initYoutubePlayer();
    }
  }, []);

  // Load Iframe Script on Mount
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initYoutubePlayer();
      };
    } else {
      initYoutubePlayer();
    }

    return () => {
      if (playerRef.current) {
        try {
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
    if (playerRef.current && isPlayerReady && nowPlaying?.songId) {
      if (typeof playerRef.current.loadVideoById === 'function') {
        const elapsedSeconds = nowPlaying.startedAt ? (getServerTime() - nowPlaying.startedAt) / 1000 : 0;
        const startSecs = elapsedSeconds > 0 ? Math.floor(elapsedSeconds) : 0;

        // Get currently loaded video ID if possible to prevent reloading the same video
        let currentVideoId = "";
        try {
          if (typeof playerRef.current.getVideoData === 'function') {
            currentVideoId = playerRef.current.getVideoData().video_id;
          }
        } catch (e) {}

        if (currentVideoId !== nowPlaying.songId) {
          playerRef.current.loadVideoById({
            videoId: nowPlaying.songId,
            startSeconds: startSecs
          });
          
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
                  p.mute();
                  p.playVideo();
                }
              } catch (err) {
                console.error('[Autoplay Check Error]', err);
              }
            }, 1000);
          }
        }
      } else {
        console.warn('[YT Player Debug] playerRef.current exists but loadVideoById is not a function');
      }
    } else if (nowPlaying?.songId && window.YT && window.YT.Player && !playerRef.current) {
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

    const elapsedSeconds = nowPlaying.startedAt ? (getServerTime() - nowPlaying.startedAt) / 1000 : 0;

    try {
      if (hasUserInteracted() && typeof playerRef.current.unMute === 'function') {
        playerRef.current.unMute();
      }
      playerRef.current.playVideo();

      // Sync seeking if drift is significant
      const currentLoc = playerRef.current.getCurrentTime() || 0;
      if (Math.abs(currentLoc - elapsedSeconds) > 2.5) {
        playerRef.current.seekTo(elapsedSeconds, true);
      }
    } catch (err) {
      console.error('[YT Player Debug] Error syncing on metadata change:', err);
    }
  }, [nowPlaying?.startedAt, timeSynced, isPlayerReady]);

  // Autoplay recovery and auto-unmute on user interaction
  useEffect(() => {
    const handleUserInteraction = () => {
      hasInteractedRef.current = true;
      if (playerRef.current) {
        try {
          if (typeof playerRef.current.isMuted === 'function' && playerRef.current.isMuted()) {
            playerRef.current.unMute();
          }
          if (typeof playerRef.current.playVideo === 'function') {
            playerRef.current.playVideo();
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
