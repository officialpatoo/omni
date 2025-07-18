
"use client";

import { useState, useEffect, useCallback } from 'react';

type ActiveTheme = 'light' | 'dark';
export type PreferredTheme = 'light' | 'dark' | 'system';

// Consistent key for storing theme preference
const THEME_STORAGE_KEY = 'patooworld_preferred_theme';

export function useTheme() {
  const [preferredTheme, setPreferredTheme] = useState<PreferredTheme>('system');
  const [activeTheme, setActiveTheme] = useState<ActiveTheme>('light');

  // Function to apply the theme to the document
  const applyTheme = (theme: ActiveTheme) => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    setActiveTheme(theme);
  };

  // Function to determine the active theme based on preference
  const getActiveTheme = (preference: PreferredTheme): ActiveTheme => {
    if (preference === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return preference;
  };

  // Initialize theme from localStorage on component mount
  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as PreferredTheme | null;
    const initialPreference = storedTheme || 'system';
    setPreferredTheme(initialPreference);
    applyTheme(getActiveTheme(initialPreference));
  }, []);

  // Listen for system theme changes if preference is 'system'
  useEffect(() => {
    if (preferredTheme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      applyTheme(mediaQuery.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [preferredTheme]);

  // Public function to update the theme preference
  const updateThemePreference = useCallback((preference: PreferredTheme) => {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
    setPreferredTheme(preference);
    applyTheme(getActiveTheme(preference));
  }, []);

  return { activeTheme, preferredTheme, setPreferredTheme: updateThemePreference };
}
