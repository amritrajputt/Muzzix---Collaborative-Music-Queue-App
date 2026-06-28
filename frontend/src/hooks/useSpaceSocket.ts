import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { getBackendUrl } from '../services/api';

// Cache the offset: serverTime - clientTime
let serverTimeOffset = 0;

export const getServerTime = (): number => {
  return Date.now() + serverTimeOffset;
};

interface UseSpaceSocketCallbacks {
  onQueueUpdated: (queue: any[]) => void;
  onNowPlayingChanged: (song: any) => void;
  onTimeSynced?: () => void;
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

    const socketUrl = getBackendUrl();
    const socket = io(socketUrl);
    socketRef.current = socket;

    // Handle time sync
    const requestTimeSync = () => {
      socket.emit('ping-server-time', { clientSentAt: Date.now() });
    };

    socket.on('connect', requestTimeSync);
    
    // If already connected
    if (socket.connected) {
      requestTimeSync();
    }

    socket.on('pong-server-time', (data: { clientSentAt: number; serverTime: number }) => {
      const clientReceivedAt = Date.now();
      const rtt = clientReceivedAt - data.clientSentAt;
      const oneWayDelay = rtt / 2;
      const estimatedServerTimeAtReceive = data.serverTime + oneWayDelay;
      serverTimeOffset = estimatedServerTimeAtReceive - clientReceivedAt;
      if (callbacksRef.current.onTimeSynced) {
        callbacksRef.current.onTimeSynced();
      }
    });

    // Join the space room in WS
    socket.emit('join-space', { spaceId, guestName, guestUuid });

    // Handle events
    socket.on('queueUpdated', (data: { queue: any[] }) => {
      callbacksRef.current.onQueueUpdated(data.queue);
    });

    socket.on('nowPlayingChanged', (data: { song?: any }) => {
      callbacksRef.current.onNowPlayingChanged(data?.song || null);
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
