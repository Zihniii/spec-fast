import { describe, it, expect, vi } from 'vitest';
import { formatAsMarkdown, formatAsCursorPrompt, copyToClipboard } from './formatters';
import { CURSOR_PROMPT_TEMPLATE } from './constants';
import { SpecSection } from '@/types';

function makeSection(overrides: Partial<SpecSection> = {}): SpecSection {
  return {
    id: '1',
    heading: 'Test Heading',
    body: 'Test body content.',
    isDirty: false,
    ...overrides,
  };
}

describe('formatAsMarkdown', () => {
  it('returns empty string for empty sections array', () => {
    expect(formatAsMarkdown([])).toBe('');
  });

  it('formats a single section correctly', () => {
    const sections = [makeSection({ heading: 'Overview', body: 'This is the overview.' })];
    expect(formatAsMarkdown(sections)).toBe('## Overview\n\nThis is the overview.\n\n');
  });

  it('formats multiple sections with correct separation', () => {
    const sections = [
      makeSection({ id: '1', heading: 'First', body: 'First body.' }),
      makeSection({ id: '2', heading: 'Second', body: 'Second body.' }),
      makeSection({ id: '3', heading: 'Third', body: 'Third body.' }),
    ];
    const result = formatAsMarkdown(sections);
    expect(result).toBe(
      '## First\n\nFirst body.\n\n## Second\n\nSecond body.\n\n## Third\n\nThird body.\n\n'
    );
  });

  it('preserves section body content exactly', () => {
    const body = 'Line 1\nLine 2\n\n- bullet\n- bullet 2';
    const sections = [makeSection({ heading: 'Content', body })];
    expect(formatAsMarkdown(sections)).toBe(`## Content\n\n${body}\n\n`);
  });
});

describe('formatAsCursorPrompt', () => {
  it('wraps markdown output with preamble and closing', () => {
    const sections = [makeSection({ heading: 'Overview', body: 'Body text.' })];
    const result = formatAsCursorPrompt(sections);

    expect(result).toBe(
      CURSOR_PROMPT_TEMPLATE.preamble +
        '## Overview\n\nBody text.\n\n' +
        CURSOR_PROMPT_TEMPLATE.closing
    );
  });

  it('starts with the preamble', () => {
    const sections = [makeSection()];
    const result = formatAsCursorPrompt(sections);
    expect(result.startsWith(CURSOR_PROMPT_TEMPLATE.preamble)).toBe(true);
  });

  it('ends with the closing', () => {
    const sections = [makeSection()];
    const result = formatAsCursorPrompt(sections);
    expect(result.endsWith(CURSOR_PROMPT_TEMPLATE.closing)).toBe(true);
  });

  it('contains the markdown content between preamble and closing', () => {
    const sections = [
      makeSection({ id: '1', heading: 'A', body: 'Alpha' }),
      makeSection({ id: '2', heading: 'B', body: 'Beta' }),
    ];
    const result = formatAsCursorPrompt(sections);
    const markdown = formatAsMarkdown(sections);

    expect(result).toContain(markdown);
  });

  it('returns preamble + closing for empty sections', () => {
    const result = formatAsCursorPrompt([]);
    expect(result).toBe(CURSOR_PROMPT_TEMPLATE.preamble + CURSOR_PROMPT_TEMPLATE.closing);
  });
});

describe('copyToClipboard', () => {
  it('returns true on successful copy', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });

    const result = await copyToClipboard('hello');
    expect(result).toBe(true);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hello');
  });

  it('returns false when clipboard write fails', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    });

    const result = await copyToClipboard('hello');
    expect(result).toBe(false);
  });
});
