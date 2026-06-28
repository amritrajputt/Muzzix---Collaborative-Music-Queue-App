import { useState, useEffect, useRef } from 'react';
import createRoomService from '../services/createRoomService';
import { useToast } from '../contexts/ToastContext';
import type { Space } from '../components/dashboard/SpaceCard';

export function useDashboard(onCreated?: (spaceId: string) => void) {
  const { showToast } = useToast();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [spaceName, setSpaceName] = useState('');
  const [spacePassword, setSpacePassword] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Generate a single idempotency key when the modal is opened
  const idempotencyKeyRef = useRef<string>('');

  useEffect(() => {
    if (isCreateOpen) {
      idempotencyKeyRef.current = typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2, 15);
    }
  }, [isCreateOpen]);

  const fetchSpaces = async () => {
    setLoading(true);
    try {
      const res = await createRoomService.getAllRooms();
      if (res && res.success && res.data && res.data.spaces) {
        const mapped = res.data.spaces.map((s: any) => ({
          id: s.id,
          name: s.spaceName,
          guestCount: s.guestCount ?? 0,
          songCount: s.songCount ?? 0,
          isHost: true,
        }));
        setSpaces(mapped);
      } else {
        setSpaces([]);
      }
    } catch (error) {
      console.error('Failed to fetch spaces:', error);
      setSpaces([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateSpaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spaceName.trim() || !spacePassword.trim() || creating) return;

    setCreating(true);
    try {
      const res = await createRoomService.createRoom(spaceName, spacePassword, idempotencyKeyRef.current);
      if (res && res.success && res.data?.space) {
        setIsCreateOpen(false);
        setSpaceName('');
        setSpacePassword('');
        showToast('Space created successfully!', 'success');

        // Pre-authenticate the host inside localStorage to bypass Join Room dialog
        const spaceId = res.data.space.id;
        const hostName = res.data.space.creatorName || 'Host';
        const hostUuid = res.data.space.userId;
        localStorage.setItem(`guestName_${spaceId}`, hostName);
        localStorage.setItem(`guestUuid_${spaceId}`, hostUuid);

        if (onCreated) {
          onCreated(spaceId);
        } else {
          fetchSpaces();
        }
      } else {
        showToast(res?.message || 'Failed to create space. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error creating space:', error);
      showToast('Failed to create space.', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteSpaceSubmit = async () => {
    if (!deleteConfirmId) return;

    try {
      const res = await createRoomService.deleteRoom(deleteConfirmId);
      if (res && res.success) {
        setDeleteConfirmId(null);
        showToast('Space deleted successfully!', 'success');
        fetchSpaces();
      } else {
        showToast(res?.message || 'Failed to delete space.', 'error');
      }
    } catch (error) {
      console.error('Error deleting space:', error);
      showToast('Failed to delete space.', 'error');
    }
  };

  return {
    spaces,
    loading,
    isCreateOpen,
    setIsCreateOpen,
    isCreating: creating,
    deleteConfirmId,
    setDeleteConfirmId,
    spaceName,
    setSpaceName,
    spacePassword,
    setSpacePassword,
    copiedId,
    handleCopy,
    handleCreateSpaceSubmit,
    handleDeleteSpaceSubmit,
  };
}
