import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ReviewScreen } from './ReviewScreen';
import { AppProvider } from '@/lib/context';

function renderReviewScreen() {
  return render(
    <AppProvider>
      <ReviewScreen />
    </AppProvider>
  );
}

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ReviewScreen', () => {
  it('renders the heading and navigation buttons', () => {
    renderReviewScreen();
    expect(screen.getByText('Review Your Spec')).toBeInTheDocument();
    expect(screen.getByText('Regenerate')).toBeInTheDocument();
    expect(screen.getByText('Back to Intake')).toBeInTheDocument();
    expect(screen.getByText('Continue to Export')).toBeInTheDocument();
  });

  it('renders no sections when state is empty', () => {
    renderReviewScreen();
    expect(screen.queryByRole('button', { name: /Click to edit/ })).not.toBeInTheDocument();
  });

  it('shows regenerate button enabled by default', () => {
    renderReviewScreen();
    const btn = screen.getByText('Regenerate');
    expect(btn).toBeInTheDocument();
    expect(btn).not.toBeDisabled();
  });

  it('dispatches NAVIGATE to intake when Back to Intake is clicked', () => {
    renderReviewScreen();
    const backBtn = screen.getByText('Back to Intake');
    fireEvent.click(backBtn);
    expect(backBtn).toBeInTheDocument();
  });

  it('dispatches NAVIGATE to export when Continue to Export is clicked', () => {
    renderReviewScreen();
    const exportBtn = screen.getByText('Continue to Export');
    fireEvent.click(exportBtn);
    expect(exportBtn).toBeInTheDocument();
  });

  it('calls /api/generate on regenerate when no unsaved edits', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        sections: [
          { heading: 'Overview', body: 'Test overview' },
          { heading: 'Features', body: 'Test features' },
          { heading: 'Tech', body: 'Test tech' },
        ],
      }),
    });

    renderReviewScreen();
    fireEvent.click(screen.getByText('Regenerate'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/generate', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }));
    });
  });

  it('shows error message when regeneration fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Generation timed out. Please try again.' }),
    });

    renderReviewScreen();
    fireEvent.click(screen.getByText('Regenerate'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Generation timed out. Please try again.');
    });
  });

  it('shows loading state during regeneration', async () => {
    mockFetch.mockImplementationOnce(() => new Promise(() => {}));

    renderReviewScreen();
    fireEvent.click(screen.getByText('Regenerate'));

    await waitFor(() => {
      expect(screen.getByText('Regenerating…')).toBeInTheDocument();
      expect(screen.getByText('Regenerating your spec…')).toBeInTheDocument();
    });
  });

  it('shows network error when fetch throws', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    renderReviewScreen();
    fireEvent.click(screen.getByText('Regenerate'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Network error. Please check your connection and try again.'
      );
    });
  });
});
