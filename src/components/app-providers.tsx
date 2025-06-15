
"use client";

import React from 'react';
import { useTheme } from '@/hooks/use-theme';
import { AuthProvider } from '@/contexts/auth-context';

export function AppProviders({ children }: { children: React.ReactNode }) {
  useTheme(); 

  return <AuthProvider>{children}</AuthProvider>;
}
