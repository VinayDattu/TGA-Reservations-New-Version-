/**
 * useReservations Hook
 * Manages reservation state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { Reservation } from '@/types';
import { reservationService } from '@/services';
import { hasConflict as checkConflict } from '@/utils';

export function useReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load reservations on mount
  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reservationService.getAll();
      setReservations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reservations');
      console.error('Error loading reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveReservation = useCallback(async (reservation: Reservation) => {
    try {
      const saved = await reservationService.save(reservation);
      setReservations((prev) => {
        const index = prev.findIndex((r) => r.id === saved.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = saved;
          return updated;
        }
        return [saved, ...prev];
      });
      return saved;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save reservation';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const deleteReservation = useCallback(async (id: string) => {
    try {
      await reservationService.delete(id);
      setReservations((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete reservation';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const getReservationById = useCallback(
    (id: string): Reservation | undefined => {
      return reservations.find((r) => r.id === id);
    },
    [reservations]
  );

  const searchByConfirmation = useCallback(
    async (confirmationNumber: string): Promise<Reservation | null> => {
      try {
        return await reservationService.searchByConfirmation(confirmationNumber);
      } catch (err) {
        console.error('Error searching reservation:', err);
        return null;
      }
    },
    []
  );

  const hasConflict = useCallback(
    (newReservation: { room: string; date: string; time: string }, excludeId?: string): boolean => {
      return checkConflict(newReservation, reservations, excludeId);
    },
    [reservations]
  );

  return {
    reservations,
    loading,
    error,
    saveReservation,
    deleteReservation,
    getReservationById,
    searchByConfirmation,
    hasConflict,
    refresh: loadReservations,
  };
}
