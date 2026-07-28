/**
 * LocalStorage Draft Service
 */

import { Draft } from '@/types';
import { STORAGE_KEYS } from '@/constants';
import * as storage from '../storage/localStorage.service';
import { IDraftService } from './IDraftService';

class LocalStorageDraftService implements IDraftService {
  private getDrafts(): Draft[] {
    return storage.getItem<Draft[]>(STORAGE_KEYS.DRAFTS) || [];
  }

  private saveDrafts(drafts: Draft[]): void {
    storage.setItem(STORAGE_KEYS.DRAFTS, drafts);
  }

  async getAll(): Promise<Draft[]> {
    return Promise.resolve(this.getDrafts());
  }

  async getById(id: string): Promise<Draft | null> {
    const drafts = this.getDrafts();
    return Promise.resolve(drafts.find((d) => d.id === id) || null);
  }

  async save(draft: Draft): Promise<Draft> {
    const drafts = this.getDrafts();
    const index = drafts.findIndex((d) => d.id === draft.id);

    if (index >= 0) {
      // Update existing
      drafts[index] = draft;
    } else {
      // Create new
      drafts.unshift(draft);
    }

    this.saveDrafts(drafts);
    return Promise.resolve(draft);
  }

  async delete(id: string): Promise<void> {
    const drafts = this.getDrafts();
    const filtered = drafts.filter((d) => d.id !== id);
    this.saveDrafts(filtered);
    return Promise.resolve();
  }
}

export const localStorageDraftService = new LocalStorageDraftService();
