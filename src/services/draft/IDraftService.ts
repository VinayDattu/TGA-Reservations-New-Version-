/**
 * Draft Service Interface
 */

import { Draft } from '@/types';

export interface IDraftService {
  /**
   * Get all drafts
   */
  getAll(): Promise<Draft[]>;

  /**
   * Get a single draft by ID
   */
  getById(id: string): Promise<Draft | null>;

  /**
   * Save a draft (create or update)
   */
  save(draft: Draft): Promise<Draft>;

  /**
   * Delete a draft
   */
  delete(id: string): Promise<void>;
}
