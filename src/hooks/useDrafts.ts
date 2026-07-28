/**
 * useDrafts Hook
 * Manages draft state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { Draft, ReservationFormData } from '@/types';
import { draftService } from '@/services';
import { generateDraftId } from '@/utils';

export function useDrafts() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load drafts on mount
  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await draftService.getAll();
      setDrafts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load drafts');
      console.error('Error loading drafts:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = useCallback(async (draftId: string, formData: ReservationFormData) => {
    try {
      const draft: Draft = {
        id: draftId,
        updatedAt: new Date().toISOString(),
        formData,
      };
      
      const saved = await draftService.save(draft);
      
      setDrafts((prev) => {
        const index = prev.findIndex((d) => d.id === saved.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = saved;
          return updated;
        }
        return [saved, ...prev];
      });
      
      return saved;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save draft';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const deleteDraft = useCallback(async (id: string) => {
    try {
      await draftService.delete(id);
      setDrafts((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete draft';
      setError(message);
      throw new Error(message);
    }
  }, []);

  const getDraftById = useCallback(
    (id: string): Draft | undefined => {
      return drafts.find((d) => d.id === id);
    },
    [drafts]
  );

  const createNewDraftId = useCallback((): string => {
    return generateDraftId();
  }, []);

  return {
    drafts,
    loading,
    error,
    saveDraft,
    deleteDraft,
    getDraftById,
    createNewDraftId,
    refresh: loadDrafts,
  };
}
