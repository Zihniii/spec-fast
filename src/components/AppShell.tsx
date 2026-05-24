'use client';

import { useAppState } from '@/lib/context';
import { IntakeScreen } from './IntakeScreen';
import { ReviewScreen } from './ReviewScreen';
import { ExportScreen } from './ExportScreen';

export function AppShell() {
  const { state, dispatch } = useAppState();

  function handleReset() {
    dispatch({ type: 'RESET' });
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Minimal header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-200/60">
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-2 hover:opacity-70 transition-opacity"
        >
          <span className="text-sm font-semibold tracking-tight text-neutral-900">
            SpecFast
          </span>
        </button>
        <span className="text-xs text-neutral-400 capitalize">
          {state.currentScreen}
        </span>
      </header>

      {/* Screen content */}
      <main className="flex-1">
        {(() => {
          switch (state.currentScreen) {
            case 'intake':
              return <IntakeScreen />;
            case 'review':
              return <ReviewScreen />;
            case 'export':
              return <ExportScreen />;
          }
        })()}
      </main>
    </div>
  );
}
