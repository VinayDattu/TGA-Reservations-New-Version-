/**
 * Service Factory
 * Creates the appropriate service instances based on configuration
 */

import ENV from '@/config/environment';
import { IReservationService } from './reservation/IReservationService';
import { IDraftService } from './draft/IDraftService';
import { localStorageReservationService } from './reservation/localStorageReservationService';
import { localStorageDraftService } from './draft/localStorageDraftService';

// TODO: When backend is ready, import API services here
// import { apiReservationService } from './reservation/apiReservationService';
// import { apiDraftService } from './draft/apiDraftService';

/**
 * Get the appropriate reservation service
 */
export function getReservationService(): IReservationService {
  if (ENV.IS_MOCK) {
    return localStorageReservationService;
  }
  
  // TODO: Return API service when backend is ready
  // return apiReservationService;
  
  return localStorageReservationService;
}

/**
 * Get the appropriate draft service
 */
export function getDraftService(): IDraftService {
  if (ENV.IS_MOCK) {
    return localStorageDraftService;
  }
  
  // TODO: Return API service when backend is ready
  // return apiDraftService;
  
  return localStorageDraftService;
}

// Export singleton instances
export const reservationService = getReservationService();
export const draftService = getDraftService();
