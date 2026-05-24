'use client';

import { useState, useEffect } from 'react';
import { useAppState } from '@/lib/context';
import { formatAsMarkdown, formatAsCursorPrompt, copyToClipboard } from '@/lib/formatters';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';
import { Markdown } from './ui/markdown';
import { ArrowLeft, Copy, FileText, Check, AlertCircle } from 'lucide-react';

export function ExportScreen() {
  const { state, dispatch } = useAppState();
  const { sections } = state.spec;

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (toast?.type === 'success') {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  async function handleCopyMarkdown() {
    const markdown = formatAsMarkdown(sections);
    const success = await copyToClipboard(markdown);
    if (success) {
      setToast({ type: 'success', message: 'Copied to clipboard!' });
    } else {
      setToast({ type: 'error', message: 'Copy failed. Please select and copy the text manually.' });
    }
  }

  async function handleCopyCursorPrompt() {
    if (sections.length === 0) {
      setToast({ type: 'error', message: 'No spec content available to export.' });
      return;
    }
    const cursorPrompt = formatAsCursorPrompt(sections);
    const success = await copyToClipboard(cursorPrompt);
    if (success) {
      setToast({ type: 'success', message: 'Copied to clipboard!' });
    } else {
      setToast({ type: 'error', message: 'Copy failed. Please select and copy the text manually.' });
    }
  }

  function handleBackToReview() {
    dispatch({ type: 'NAVIGATE', screen: 'review' });
  }

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Export Your Spec
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Copy your spec in the format that works best for your AI builder.
          </p>
        </div>

        {/* Export actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="p-5">
              <button
                type="button"
                onClick={handleCopyMarkdown}
                disabled={sections.length === 0}
                className="w-full text-left space-y-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100">
                    <FileText className="h-4 w-4 text-neutral-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Copy as Markdown</p>
                    <p className="text-xs text-neutral-500">For any AI builder or docs</p>
                  </div>
                </div>
              </button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="p-5">
              <button
                type="button"
                onClick={handleCopyCursorPrompt}
                className="w-full text-left space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100">
                    <Copy className="h-4 w-4 text-neutral-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Copy as Cursor prompt</p>
                    <p className="text-xs text-neutral-500">Optimized for Cursor AI</p>
                  </div>
                </div>
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Toast */}
        {toast && (
          <div
            role={toast.type === 'error' ? 'alert' : 'status'}
            aria-live="polite"
            className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {toast.type === 'success' ? (
              <Check className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            {toast.message}
          </div>
        )}

        {/* Spec preview */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-400 mb-3">
            Preview
          </p>
          <Card>
            <CardContent className="p-6 max-h-[50vh] overflow-y-auto">
              {sections.length === 0 ? (
                <p className="text-sm text-neutral-400 italic">No spec content to preview.</p>
              ) : (
                <div className="space-y-6">
                  {sections.map((section) => (
                    <div key={section.id}>
                      <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 mb-2">
                        {section.heading}
                      </h2>
                      <Markdown content={section.body} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <Separator />
        <div className="flex items-center justify-start">
          <Button variant="ghost" size="sm" onClick={handleBackToReview}>
            <ArrowLeft className="h-4 w-4" />
            Back to Review
          </Button>
        </div>
      </div>
    </div>
  );
}
