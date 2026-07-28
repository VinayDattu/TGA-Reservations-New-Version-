/**
 * Reservation Service Interface
 * Defines the contract for reservation data operations
 */

import { Reservation } from '@/types';

export interface IReservationService {
  /**
   * Get all reservations
   */
  getAll(): Promise<Reservation[]>;

  /**
   * Get a single reservation by ID
   */
  getById(id: string): Promise<Reservation | null>;

  /**
   * Save a reservation (create or update)
   */
  save(reservation: Reservation): Promise<Reservation>;

  /**
   * Delete a reservation
   */
  delete(id: string): Promise<void>;

  /**
   * Search reservations by confirmation number
   */
  searchByConfirmation(confirmationNumber: string): Promise<Reservation | null>;
}
