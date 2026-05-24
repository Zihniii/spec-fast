import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { IntakeScreen } from './IntakeScreen';
import { AppProvider } from '@/lib/context';

function renderIntakeScreen() {
  return render(
    <AppProvider>
      <IntakeScreen />
    </AppProvider>
  );
}

describe('IntakeScreen', () => {
  it('displays the first question on initial render', () => {
    renderIntakeScreen();
    expect(
      screen.getByText("What's your project idea in one sentence?")
    ).toBeInTheDocument();
  });

  it('shows progress indicator as "1 of 7" initially', () => {
    renderIntakeScreen();
    expect(screen.getByText('1 of 7')).toBeInTheDocument();
  });

  it('does not show back button on the first question', () => {
    renderIntakeScreen();
    expect(screen.queryByText('Back')).not.toBeInTheDocument();
  });

  it('shows inline error when submitting empty answer', () => {
    renderIntakeScreen();
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'An answer is required.'
    );
  });

  it('shows inline error when submitting whitespace-only answer', () => {
    renderIntakeScreen();
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '   ' } });
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'An answer is required.'
    );
  });

  it('advances to next question on valid answer submission', () => {
    renderIntakeScreen();
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'A habit tracker app' } });
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('2 of 7')).toBeInTheDocument();
    expect(
      screen.getByText('Who is this for? Describe your target user.')
    ).toBeInTheDocument();
  });

  it('shows back button on question 2 and navigates back preserving answer', () => {
    renderIntakeScreen();
    // Answer question 1
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'A habit tracker app' } });
    fireEvent.click(screen.getByText('Next'));

    // Now on question 2, back button should be visible
    expect(screen.getByText('Back')).toBeInTheDocument();

    // Click back
    fireEvent.click(screen.getByText('Back'));
    expect(screen.getByText('1 of 7')).toBeInTheDocument();

    // Previous answer should be preserved in the textarea
    const textareaAfterBack = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textareaAfterBack.value).toBe('A habit tracker app');
  });

  it('clears error message when user starts typing', () => {
    renderIntakeScreen();
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'a' } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows "Generate my spec" button only after all 7 answers are filled', () => {
    renderIntakeScreen();

    // Answer all 7 questions
    for (let i = 0; i < 7; i++) {
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: `Answer ${i + 1}` } });
      fireEvent.click(screen.getByText('Next'));
    }

    // After answering question 7, we should still be on question 7 (index 6)
    // and the "Generate my spec" button should appear
    expect(screen.getByText('Generate my spec')).toBeInTheDocument();
  });

  it('does not show "Generate my spec" button when not all answers are filled', () => {
    renderIntakeScreen();
    // Only answer question 1
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Answer 1' } });
    fireEvent.click(screen.getByText('Next'));

    expect(screen.queryByText('Generate my spec')).not.toBeInTheDocument();
  });
});
