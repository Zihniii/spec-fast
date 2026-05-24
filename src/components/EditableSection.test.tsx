import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EditableSection } from './EditableSection';
import type { SpecSection } from '@/types';

// Mock the context
const mockDispatch = vi.fn();
vi.mock('@/lib/context', () => ({
  useAppState: () => ({ dispatch: mockDispatch }),
}));

function createSection(overrides: Partial<SpecSection> = {}): SpecSection {
  return {
    id: 'test-section',
    heading: 'Test Heading',
    body: 'Test body content',
    isDirty: false,
    ...overrides,
  };
}

describe('EditableSection', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('displays section heading as h3', () => {
    render(<EditableSection section={createSection()} />);
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveTextContent('Test Heading');
  });

  it('displays section body as read-only text by default', () => {
    render(<EditableSection section={createSection()} />);
    expect(screen.getByText('Test body content')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('enters edit mode when body is clicked', () => {
    render(<EditableSection section={createSection()} />);
    fireEvent.click(screen.getByText('Test body content'));
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('Test body content');
  });

  it('shows character count while editing', () => {
    render(<EditableSection section={createSection({ body: 'Hello' })} />);
    fireEvent.click(screen.getByText('Hello'));
    expect(screen.getByText('5 / 5000')).toBeInTheDocument();
  });

  it('enforces 5000 character limit by truncating', () => {
    render(<EditableSection section={createSection({ body: 'short' })} />);
    fireEvent.click(screen.getByText('short'));

    const textarea = screen.getByRole('textbox');
    const longText = 'a'.repeat(5500);
    fireEvent.change(textarea, { target: { value: longText } });

    expect(textarea).toHaveValue('a'.repeat(5000));
    expect(screen.getByText('5000 / 5000')).toBeInTheDocument();
  });

  it('dispatches EDIT_SECTION and SAVE_SECTION on save', () => {
    render(<EditableSection section={createSection()} />);
    fireEvent.click(screen.getByText('Test body content'));

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Updated content' } });
    fireEvent.click(screen.getByText('Save'));

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'EDIT_SECTION',
      sectionId: 'test-section',
      body: 'Updated content',
    });
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SAVE_SECTION',
      sectionId: 'test-section',
    });
  });

  it('shows "Saved!" confirmation after save', () => {
    render(<EditableSection section={createSection()} />);
    fireEvent.click(screen.getByText('Test body content'));
    fireEvent.click(screen.getByText('Save'));

    expect(screen.getByText('Saved!')).toBeInTheDocument();
  });

  it('hides "Saved!" confirmation after 2 seconds', () => {
    render(<EditableSection section={createSection()} />);
    fireEvent.click(screen.getByText('Test body content'));
    fireEvent.click(screen.getByText('Save'));

    expect(screen.getByText('Saved!')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.queryByText('Saved!')).not.toBeInTheDocument();
  });

  it('exits edit mode without saving on cancel', () => {
    render(<EditableSection section={createSection()} />);
    fireEvent.click(screen.getByText('Test body content'));

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Changed but not saved' } });
    fireEvent.click(screen.getByText('Cancel'));

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(mockDispatch).not.toHaveBeenCalled();
    expect(screen.getByText('Test body content')).toBeInTheDocument();
  });

  it('exits edit mode after save', () => {
    render(<EditableSection section={createSection()} />);
    fireEvent.click(screen.getByText('Test body content'));
    fireEvent.click(screen.getByText('Save'));

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
