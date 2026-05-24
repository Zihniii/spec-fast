import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AppShell } from './AppShell';
import { AppProvider } from '@/lib/context';

function renderAppShell() {
  return render(
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

describe('AppShell', () => {
  it('renders IntakeScreen by default (initial state has currentScreen = intake)', () => {
    renderAppShell();
    // IntakeScreen shows the first question
    expect(
      screen.getByText("What's your project idea in one sentence?")
    ).toBeInTheDocument();
  });

  it('renders the progress indicator from IntakeScreen', () => {
    renderAppShell();
    expect(screen.getByText('1 of 7')).toBeInTheDocument();
  });
});
