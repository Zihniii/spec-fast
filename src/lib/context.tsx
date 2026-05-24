'use client';

import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { AppState, AppAction } from '@/types';
import { appReducer, initialState } from './reducer';

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
}
