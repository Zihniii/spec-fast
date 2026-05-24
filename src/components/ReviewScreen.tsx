'use client';

import { useState } from 'react';
import { useAppState } from '@/lib/context';
import { EditableSection } from './EditableSection';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { ArrowLeft, ArrowRight, RefreshCw, Loader2 } from 'lucide-react';
import type { SpecSection } from '@/types';

export function ReviewScreen() {
  const { state, dispatch } = useAppState();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const { sections, isGenerating, generationError, hasUnsavedEdits } = state.spec;
  const answers = state.intake.answers;

  async function handleRegenerate() {
    if (hasUnsavedEdits) {
      setShowConfirmDialog(true);
      return;
    }
    await performRegeneration();
  }

  async function handleConfirmRegenerate() {
    setShowConfirmDialog(false);
    await performRegeneration();
  }

  function handleCancelRegenerate() {
    setShowConfirmDialog(false);
  }

  async function performRegeneration() {
    dispatch({ type: 'CONFIRM_REGENERATE' });

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });

      const data = await response.json();

      if (!response.ok) {
        dispatch({
          type: 'GENERATION_FAILURE',
          error: data.error || 'Failed to regenerate spec. Please try again.',
        });
        return;
      }

      const mappedSections: SpecSection[] = data.sections.map(
        (s: { heading: string; body: string }, index: number) => ({
          id: `section-${index}`,
          heading: s.heading,
          body: s.body,
          isDirty: false,
        })
      );

      dispatch({ type: 'GENERATION_SUCCESS', sections: mappedSections });
    } catch {
      dispatch({
        type: 'GENERATION_FAILURE',
        error: 'Network error. Please check your connection and try again.',
      });
    }
  }

  function handleBackToIntake() {
    dispatch({ type: 'NAVIGATE', screen: 'intake' });
  }

  function handleContinueToExport() {
    dispatch({ type: 'NAVIGATE', screen: 'export' });
  }

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
              Review Your Spec
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Click any section to edit. Changes are saved inline.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            {isGenerating ? 'Regenerating…' : 'Regenerate'}
          </Button>
        </div>

        {/* Loading state */}
        {isGenerating && (
          <div className="flex items-center gap-2 text-neutral-500" role="status" aria-live="polite">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Regenerating your spec…</span>
          </div>
        )}

        {/* Error message */}
        {generationError && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {generationError}
          </div>
        )}

        {/* Section list */}
        <div className="space-y-4">
          {sections.map((section) => (
            <EditableSection key={section.id} section={section} />
          ))}
        </div>

        {/* Navigation */}
        <Separator />
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handleBackToIntake}>
            <ArrowLeft className="h-4 w-4" />
            Back to Intake
          </Button>
          <Button onClick={handleContinueToExport} className="gap-2">
            Continue to Export
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Confirmation dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard unsaved edits?</DialogTitle>
            <DialogDescription>
              You have unsaved edits. Regenerating will discard them. Continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelRegenerate}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmRegenerate}>
              Regenerate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
