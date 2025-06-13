"use client";

import React, { useEffect } from 'react';
import { useTheme } from '@/hooks/use-theme';

export function AppProviders({ children }: { children: React.ReactNode }) {
  // Initialize theme
  useTheme(); 

  // This component can be expanded with more providers if needed
  return <>{children}</>;
}
