import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSpaceSocketCallbacks {
  onQueueUpdated: (queue: any[]) => void;
  onNowPlayingChanged: (song: any) => void;
  onPlaybackStateChanged: (data: { isPlaying: boolean; currentTime: number }) => void;
}

export function useSpaceSocket(
  spaceId: string,
  guestUuid: string | null,
  guestName: string | null,
  callbacks: UseSpaceSocketCallbacks
) {
  const socketRef = useRef<Socket | null>(null);

  // Keep callback refs updated to avoid re-triggering the socket connection effect on callback changes
  const callbacksRef = useRef<UseSpaceSocketCallbacks>(callbacks);
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    if (!spaceId || !guestUuid || !guestName) return;

    const socketUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    const socket = io(socketUrl);
    socketRef.current = socket;

    // Join the space room in WS
    socket.emit('join-space', { spaceId, guestName, guestUuid });

    // Handle events
    socket.on('queueUpdated', (data: { queue: any[] }) => {
      callbacksRef.current.onQueueUpdated(data.queue);
    });

    socket.on('nowPlayingChanged', (data: { song?: any }) => {
      callbacksRef.current.onNowPlayingChanged(data?.song || null);
    });

    socket.on('playback-state-changed', (data: { isPlaying: boolean; currentTime: number }) => {
      callbacksRef.current.onPlaybackStateChanged(data);
    });

    // Clean up
    return () => {
      socket.emit('leave-space', { spaceId, guestName, guestUuid });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [spaceId, guestUuid, guestName]);

  return socketRef;
}
