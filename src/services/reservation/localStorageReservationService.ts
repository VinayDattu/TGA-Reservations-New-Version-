/**
 * LocalStorage Reservation Service
 * Implementation using localStorage
 */

import { Reservation } from '@/types';
import { STORAGE_KEYS } from '@/constants';
import { MOCK_RESERVATIONS } from '@/mocks/reservations';
import * as storage from '../storage/localStorage.service';
import { IReservationService } from './IReservationService';

class LocalStorageReservationService implements IReservationService {
  private getReservations(): Reservation[] {
    const reservations = storage.getItem<Reservation[]>(STORAGE_KEYS.RESERVATIONS);
    return reservations || MOCK_RESERVATIONS;
  }

  private saveReservations(reservations: Reservation[]): void {
    storage.setItem(STORAGE_KEYS.RESERVATIONS, reservations);
  }

  async getAll(): Promise<Reservation[]> {
    return Promise.resolve(this.getReservations());
  }

  async getById(id: string): Promise<Reservation | null> {
    const reservations = this.getReservations();
    return Promise.resolve(reservations.find((r) => r.id === id) || null);
  }

  async save(reservation: Reservation): Promise<Reservation> {
    const reservations = this.getReservations();
    const index = reservations.findIndex((r) => r.id === reservation.id);

    if (index >= 0) {
      // Update existing
      reservations[index] = reservation;
    } else {
      // Create new
      reservations.unshift(reservation);
    }

    this.saveReservations(reservations);
    return Promise.resolve(reservation);
  }

  async delete(id: string): Promise<void> {
    const reservations = this.getReservations();
    const filtered = reservations.filter((r) => r.id !== id);
    this.saveReservations(filtered);
    return Promise.resolve();
  }

  async searchByConfirmation(confirmationNumber: string): Promise<Reservation | null> {
    const reservations = this.getReservations();
    return Promise.resolve(
      reservations.find(
        (r) => r.confirmationNumber.toLowerCase() === confirmationNumber.toLowerCase()
      ) || null
    );
  }
}

export const localStorageReservationService = new LocalStorageReservationService();
