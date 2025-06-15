
"use client";

import React, { createContext, useContext } from 'react';

// This context is now a placeholder as authentication has been removed.
// It can be repurposed or removed entirely if no longer needed for other global states.

interface PlaceholderAuthContextType {
  // Define any non-auth related global state if this context is repurposed
  // For now, it's empty as auth is removed.
}

const PlaceholderAuthContext = createContext<PlaceholderAuthContextType | undefined>(undefined);

export function PlaceholderAuthProvider({ children }: { children: React.ReactNode }) {
  const value = {
    // Provide values for the repurposed context if any
  };

  return (
    <PlaceholderAuthContext.Provider value={value}>
      {children}
    </PlaceholderAuthContext.Provider>
  );
}

export function usePlaceholderAuth() { // Renamed from useAuth
  const context = useContext(PlaceholderAuthContext);
  if (context === undefined) {
    // This error can be removed if the context is not strictly required by all consumers
    // throw new Error('usePlaceholderAuth must be used within a PlaceholderAuthProvider');
    return {}; // Return an empty object or a default state
  }
  return context;
}
