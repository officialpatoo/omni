
"use client";

import React from 'react';
import { useTheme } from '@/hooks/use-theme';
// Removed AuthProvider as authentication is no longer used.
// If PlaceholderAuthProvider from the modified auth-context is used for other global state,
// it could be wrapped here. For now, assuming it's not strictly necessary.

export function AppProviders({ children }: { children: React.ReactNode }) {
  useTheme(); 

  return <>{children}</>;
}
