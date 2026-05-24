import { SpecSection } from '@/types';
import { CURSOR_PROMPT_TEMPLATE } from './constants';

/**
 * Formats spec sections as Markdown with ## headings.
 * Each section outputs as: ## heading\n\nbody\n\n
 */
export function formatAsMarkdown(sections: SpecSection[]): string {
  return sections.map((section) => `## ${section.heading}\n\n${section.body}\n\n`).join('');
}

/**
 * Formats spec sections as a Cursor-compatible prompt by wrapping
 * the Markdown output with preamble and closing text.
 */
export function formatAsCursorPrompt(sections: SpecSection[]): string {
  return (
    CURSOR_PROMPT_TEMPLATE.preamble +
    formatAsMarkdown(sections) +
    CURSOR_PROMPT_TEMPLATE.closing
  );
}

/**
 * Copies text to the clipboard using the Clipboard API.
 * Returns true on success, false on failure.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
