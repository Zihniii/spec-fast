'use client';

import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface MarkdownProps {
  content: string;
  className?: string;
}

/**
 * Renders Markdown content with styled typography.
 * Strips common LLM artifacts like [HYPOTHESIS ...] and [NOTE ...] tags.
 */
export function Markdown({ content, className }: MarkdownProps) {
  // Strip LLM meta-instructions/artifacts that leak into output.
  // Catches patterns like [HYPOTHESIS ...], [ASSUMPTION: ...], [Single-user focus for v1], etc.
  // Preserves markdown link syntax [text](url) by only stripping brackets without parens after.
  const cleaned = content
    .replace(/\[([^\]]*)\](?!\()/g, (match, inner: string) => {
      // Keep if it looks like a markdown checkbox [ ] or [x]
      if (inner === '' || inner === 'x' || inner === ' ') return match;
      // Keep if it's a short single word that's likely intentional (e.g., [v1])
      if (/^[a-z0-9]{1,3}$/i.test(inner.trim())) return match;
      // Strip everything else in brackets
      return '';
    })
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return (
    <div className={cn('max-w-none', className)}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-lg font-semibold text-neutral-900 mt-4 mb-2">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-semibold text-neutral-900 mt-3 mb-1.5">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold text-neutral-900 mt-2 mb-1">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-sm leading-relaxed text-neutral-700 mb-2 last:mb-0">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-neutral-900">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-neutral-600">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-4 space-y-1 mb-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-4 space-y-1 mb-2">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-sm text-neutral-700">{children}</li>
          ),
          code: ({ children }) => (
            <code className="text-xs bg-neutral-100 px-1.5 py-0.5 rounded font-mono text-neutral-800">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 overflow-x-auto mb-2">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-neutral-300 pl-3 italic text-neutral-600 mb-2">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="border-neutral-200 my-3" />,
        }}
      >
        {cleaned}
      </ReactMarkdown>
    </div>
  );
}
