/**
 * ID Generation Utilities
 */

import { CONFIRMATION_PREFIXES } from '@/constants';

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

/**
 * Generate a confirmation number based on department
 */
export function generateConfirmationNumber(
  department: 'Senate' | 'House' | 'Joint'
): string {
  const prefix = CONFIRMATION_PREFIXES[department];
  const number = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${number}`;
}

/**
 * Generate a draft ID
 */
export function generateDraftId(): string {
  return `draft-${generateId()}`;
}
