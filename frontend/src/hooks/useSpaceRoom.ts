import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from '@tanstack/react-router';
import createRoomService from '../services/createRoomService';
import songService from '../services/songService';
import api from '../services/api';
import { useSpaceSocket } from './useSpaceSocket';
import { useToast } from '../contexts/ToastContext';

export interface Song {
  songId: string;
  title: string;
  url: string;
  thumbnail: string;
  addedBy: string;
  votes: number;
}

export interface LeaderMember {
  name: string;
  score: number;
}

export function useSpaceRoom(spaceId: string) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isSignedIn } = useAuth();

  // Guest credentials
  const [guestName, setGuestName] = useState<string | null>(() => localStorage.getItem(`guestName_${spaceId}`));
  const [guestUuid, setGuestUuid] = useState<string | null>(() => localStorage.getItem(`guestUuid_${spaceId}`));

  // Space state
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

  const [dbUser, setDbUser] = useState<any>(null);
  const [hostId, setHostId] = useState<string | null>(null);
  const [creatorName, setCreatorName] = useState<string | null>(null);
  const [timeSynced, setTimeSynced] = useState(false);

  // Sync voted songs in localStorage when queue changes
  const updateQueueAndVotes = (newQueue: Song[]) => {
    setQueue(newQueue);
    setVotedSongIds((prev) => {
      const next = new Set<string>();
      const queueIds = new Set(newQueue.map((s) => s.songId));
      prev.forEach((id) => {
        if (queueIds.has(id)) {
          next.add(id);
        }
      });
      localStorage.setItem(`votedSongs_${spaceId}`, JSON.stringify(Array.from(next)));
      return next;
    });
  };

  // Fetch logged in Clerk user's DB profile
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

  const isHost = !!(dbUser && hostId && dbUser.id === hostId);

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

      // 2. Fetch songs queue (only if guestUuid is set)
      if (guestUuid) {
        const songsRes = await songService.getSpaceSongs(spaceId);
        if (songsRes && songsRes.success && songsRes.data?.songs) {
          updateQueueAndVotes(songsRes.data.songs);
        }
      }
    } catch (err) {
      console.error('Error fetching room details:', err);
    }
  };

  useEffect(() => {
    fetchRoomData();
  }, [spaceId, guestUuid]);

  // Auto-login Host/Creator to bypass nickname/password entry dialog
  useEffect(() => {
    if (dbUser && hostId && dbUser.id === hostId && !guestUuid) {
      const hostName = creatorName || dbUser.name || `${dbUser.firstName || ''} ${dbUser.lastName || ''}`.trim() || 'Host';
      const hostUuid = dbUser.id;
      
      localStorage.setItem(`guestName_${spaceId}`, hostName);
      localStorage.setItem(`guestUuid_${spaceId}`, hostUuid);
      setGuestName(hostName);
      setGuestUuid(hostUuid);
    }
  }, [dbUser, hostId, spaceId, guestUuid, creatorName]);

  // Connect socket
  const socketRef = useSpaceSocket(spaceId, guestUuid, guestName, {
    onQueueUpdated: (newQueue) => {
      updateQueueAndVotes(newQueue);
    },
    onNowPlayingChanged: (song) => {
      setNowPlaying(song);
    },
    onPlaybackStateChanged: () => {
      // Handled inside useYoutubePlayer by listening to socket directly
    },
    onTimeSynced: () => {
      setTimeSynced(true);
    },
  });

  // Keep guest credentials updated in state when localStorage shifts
  useEffect(() => {
    const name = localStorage.getItem(`guestName_${spaceId}`);
    const uuid = localStorage.getItem(`guestUuid_${spaceId}`);
    if (name && uuid) {
      setGuestName(name);
      setGuestUuid(uuid);
    }
  }, [spaceId]);

  // Handlers
  const handleJoinSuccess = (member: { guestName: string; guestUuid: string }) => {
    localStorage.setItem(`guestName_${spaceId}`, member.guestName);
    localStorage.setItem(`guestUuid_${spaceId}`, member.guestUuid);
    setGuestName(member.guestName);
    setGuestUuid(member.guestUuid);
  };

  const handleJoinFallback = () => {
    const fallbackName = 'Listener';
    const fallbackUuid = Math.random().toString(36).substring(2, 15);
    localStorage.setItem(`guestName_${spaceId}`, fallbackName);
    localStorage.setItem(`guestUuid_${spaceId}`, fallbackUuid);
    setGuestName(fallbackName);
    setGuestUuid(fallbackUuid);
  };

  const handleLeave = () => {
    localStorage.removeItem(`guestName_${spaceId}`);
    localStorage.removeItem(`guestUuid_${spaceId}`);
    setGuestName(null);
    setGuestUuid(null);
    navigate({ to: '/dashboard' });
  };

  const handleAddSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeURL.trim() || !guestUuid) return;

    setAdding(true);
    const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    try {
      const res = await songService.addSong(spaceId, guestUuid, youtubeURL, idempotencyKey);
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


  const handleForceRefresh = (playLocalCallback?: () => void) => {
    fetchRoomData();
    if (playLocalCallback) {
      playLocalCallback();
    }
  };

  // Helper to format mock/fallback leaderboard data if real room score stats not ready
  const getLeaderboardData = (): LeaderMember[] => {
    const scoreMap: Record<string, number> = {};
    scoreMap[guestName || 'You'] = 25; // seed active client

    queue.forEach((song) => {
      const author =
        song.addedBy === guestName || song.addedBy === guestUuid
          ? guestName || 'You'
          : /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(song.addedBy)
          ? 'Guest'
          : song.addedBy;
      scoreMap[author] = (scoreMap[author] || 0) + 15 + song.votes * 10;
    });

    return Object.entries(scoreMap)
      .map(([name, score]) => ({ name, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  };

  // Callback wrapper for reporting ended song to socket
  const reportSongEnded = (songId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('song-ended', {
        spaceId,
        songId,
      });
    }
  };

  // Callback wrapper for reporting play duration
  const reportDuration = (songId: string, durationVal: number) => {
    if (socketRef.current) {
      socketRef.current.emit('report-duration', {
        spaceId,
        songId,
        duration: durationVal,
      });
    }
  };

  return {
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
    fetchRoomData,
    handleJoinSuccess,
    handleJoinFallback,
    handleLeave,
    handleAddSong,
    handleUpvote,
    handleForceRefresh,
    getLeaderboardData,
    reportSongEnded,
    reportDuration,
    timeSynced,
  };
}
