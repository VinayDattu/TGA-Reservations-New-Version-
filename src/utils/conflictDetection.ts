/**
 * Conflict Detection Utilities
 */

import { Reservation } from '@/types';

/**
 * Check if a reservation conflicts with existing reservations
 */
export function hasConflict(
  newReservation: {
    room: string;
    date: string;
    time: string;
  },
  existingReservations: Reservation[],
  excludeId?: string
): boolean {
  return existingReservations.some((existing) => {
    // Skip if we're editing the same reservation
    if (excludeId && existing.id === excludeId) {
      return false;
    }

    // Check for same room, date, and time
    return (
      existing.room === newReservation.room &&
      existing.date === newReservation.date &&
      existing.time === newReservation.time &&
      existing.status !== 'Cancelled'
    );
  });
}

/**
 * Get conflicting reservation
 */
export function getConflictingReservation(
  newReservation: {
    room: string;
    date: string;
    time: string;
  },
  existingReservations: Reservation[],
  excludeId?: string
): Reservation | null {
  return (
    existingReservations.find((existing) => {
      if (excludeId && existing.id === excludeId) {
        return false;
      }
      return (
        existing.room === newReservation.room &&
        existing.date === newReservation.date &&
        existing.time === newReservation.time &&
        existing.status !== 'Cancelled'
      );
    }) || null
  );
}

/**
 * Generate conflict error message
 */
export function getConflictMessage(reservation: {
  room: string;
  date: string;
  time: string;
}): string {
  return `The room "${reservation.room}" is already reserved for ${reservation.date} at ${reservation.time}. Please select a different time or room.`;
}
