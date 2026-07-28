/**
 * useTheme Hook
 * Manages theme state
 */

import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '@/constants';

export type ThemeType = 'navy' | 'emerald' | 'purple' | 'slate';

export function useTheme() {
  const [theme, setTheme] = useLocalStorage<ThemeType>(STORAGE_KEYS.THEME, 'navy');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return { theme, setTheme };
}
