'use client';

import { useState, useCallback } from 'react';
import { PropertyVRTour, Room } from '@/lib/vr-property-config';

interface UseVRTourOptions {
  onTourStart?: (propertyId: string) => void;
  onTourEnd?: (propertyId: string) => void;
  onRoomChange?: (roomId: string, roomName: string) => void;
  onBuyClick?: (propertyId: string, propertyPrice: number) => void;
}

export const useVRTour = (options: UseVRTourOptions = {}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTour, setCurrentTour] = useState<PropertyVRTour | null>(null);
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);

  const openTour = useCallback(
    (tour: PropertyVRTour) => {
      setCurrentTour(tour);
      setIsOpen(true);
      setCurrentRoomIndex(0);
      options.onTourStart?.(tour.propertyId);
    },
    [options]
  );

  const closeTour = useCallback(() => {
    const propertyId = currentTour?.propertyId;
    setIsOpen(false);
    setTimeout(() => {
      setCurrentTour(null);
      propertyId && options.onTourEnd?.(propertyId);
    }, 300);
  }, [currentTour, options]);

  const navigateToRoom = useCallback(
    (roomId: string) => {
      if (!currentTour) return;

      const roomIndex = currentTour.rooms.findIndex((r) => r.id === roomId);
      if (roomIndex !== -1) {
        setCurrentRoomIndex(roomIndex);
        options.onRoomChange?.(roomId, currentTour.rooms[roomIndex].name);
      }
    },
    [currentTour, options]
  );

  const navigateByIndex = useCallback(
    (index: number) => {
      if (!currentTour || index < 0 || index >= currentTour.rooms.length) return;

      setCurrentRoomIndex(index);
      const room = currentTour.rooms[index];
      options.onRoomChange?.(room.id, room.name);
    },
    [currentTour, options]
  );

  const nextRoom = useCallback(() => {
    if (!currentTour) return;
    const nextIndex = (currentRoomIndex + 1) % currentTour.rooms.length;
    navigateByIndex(nextIndex);
  }, [currentTour, currentRoomIndex, navigateByIndex]);

  const previousRoom = useCallback(() => {
    if (!currentTour) return;
    const prevIndex = (currentRoomIndex - 1 + currentTour.rooms.length) % currentTour.rooms.length;
    navigateByIndex(prevIndex);
  }, [currentTour, currentRoomIndex, navigateByIndex]);

  const handleBuyClick = useCallback(() => {
    if (!currentTour) return;
    options.onBuyClick?.(currentTour.propertyId, 250000); // Default price
  }, [currentTour, options]);

  return {
    isOpen,
    currentTour,
    currentRoomIndex,
    currentRoom: currentTour?.rooms[currentRoomIndex],
    openTour,
    closeTour,
    navigateToRoom,
    navigateByIndex,
    nextRoom,
    previousRoom,
    handleBuyClick,
  };
};
