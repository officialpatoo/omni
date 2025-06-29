
"use client";

import { useState, useEffect, useCallback } from 'react';

type ActiveTheme = 'light' | 'dark';
export type PreferredTheme = 'light' | 'dark' | 'system';

export function useTheme(): [ActiveTheme, (preference: PreferredTheme) => void, PreferredTheme] {
  // State for the user's preferred theme setting ('light', 'dark', or 'system')
  const [preferredThemeSetting, setPreferredThemeSetting] = useState<PreferredTheme>('system');
  // State for the currently active theme ('light' or 'dark')
  const [activeTheme, setActiveTheme] = useState<ActiveTheme>('light');

  // Effect to initialize preferred theme from localStorage (or default to 'system')
  // and then determine and apply the initial active theme.
  useEffect(() => {
    const storedPreferredTheme = localStorage.getItem('patoovision-preferred-theme') as PreferredTheme | null;
    const initialPreference = storedPreferredTheme || 'system';
    setPreferredThemeSetting(initialPreference);

    let currentActiveTheme: ActiveTheme;
    if (initialPreference === 'system') {
      currentActiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      currentActiveTheme = initialPreference;
    }
    setActiveTheme(currentActiveTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(currentActiveTheme);
  }, []);

  // Effect to listen to system theme changes if the preferred theme is 'system'.
  // This updates the active theme when the OS theme changes.
  useEffect(() => {
    if (preferredThemeSetting === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        const newActiveSystemTheme = mediaQuery.matches ? 'dark' : 'light';
        setActiveTheme(newActiveSystemTheme);
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(newActiveSystemTheme);
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [preferredThemeSetting]);

  // Function to update the user's theme preference.
  // This updates localStorage, the preferredThemeSetting state, and the activeTheme state.
  const updateThemePreference = useCallback((preference: PreferredTheme) => {
    setPreferredThemeSetting(preference);
    localStorage.setItem('patoovision-preferred-theme', preference);

    let newActiveTheme: ActiveTheme;
    if (preference === 'system') {
      newActiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      newActiveTheme = preference;
    }
    setActiveTheme(newActiveTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newActiveTheme);
  }, []);

  return [activeTheme, updateThemePreference, preferredThemeSetting];
}
