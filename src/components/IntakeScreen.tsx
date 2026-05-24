'use client';

import { useState, useCallback } from 'react';
import { useAppState } from '@/lib/context';
import { QUESTIONS } from '@/lib/questions';
import { QuestionCard } from './QuestionCard';
import { ProgressIndicator } from './ProgressIndicator';
import { Button } from './ui/button';
import { Loader2, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import type { SpecSection } from '@/types';

export function IntakeScreen() {
  const { state, dispatch } = useAppState();
  const { currentQuestionIndex, answers } = state.intake;
  const { isGenerating, generationError } = state.spec;

  const [currentAnswer, setCurrentAnswer] = useState(
    answers[currentQuestionIndex] || ''
  );
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const allAnswered = answers.every((a) => a.trim().length > 0);

  const handleGenerate = useCallback(async () => {
    dispatch({ type: 'START_GENERATION' });

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
          error: data.error || 'Failed to generate spec. Please try again.',
        });
        return;
      }

      const sections: SpecSection[] = data.sections.map(
        (s: { heading: string; body: string }, index: number) => ({
          id: `section-${index}`,
          heading: s.heading,
          body: s.body,
          isDirty: false,
        })
      );

      dispatch({ type: 'GENERATION_SUCCESS', sections });
    } catch {
      dispatch({
        type: 'GENERATION_FAILURE',
        error: 'Failed to generate spec. Please try again.',
      });
    }
  }, [answers, dispatch]);

  function handleSubmit() {
    const trimmed = currentAnswer.trim();
    if (trimmed.length === 0) {
      setError('An answer is required.');
      return;
    }

    setError(null);
    dispatch({
      type: 'SUBMIT_ANSWER',
      questionIndex: currentQuestionIndex,
      answer: currentAnswer,
    });

    if (currentQuestionIndex < 6) {
      setCurrentAnswer(answers[currentQuestionIndex + 1] || '');
    }
  }

  function handleBack() {
    if (currentQuestionIndex > 0) {
      setError(null);
      dispatch({
        type: 'GO_TO_QUESTION',
        questionIndex: currentQuestionIndex - 1,
      });
      setCurrentAnswer(answers[currentQuestionIndex - 1] || '');
    }
  }

  function handleAnswerChange(value: string) {
    setCurrentAnswer(value);
    if (error) {
      setError(null);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      <div className="w-full max-w-xl space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <ProgressIndicator currentIndex={currentQuestionIndex} />
        </div>

        {/* Question */}
        <QuestionCard
          question={currentQuestion}
          value={currentAnswer}
          onChange={handleAnswerChange}
        />

        {/* Validation Error */}
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        {/* Generation Error */}
        {generationError && (
          <div className="flex items-center justify-between rounded-lg bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700" role="alert">
              {generationError}
            </p>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Loading */}
        {isGenerating && (
          <div className="flex items-center gap-2 text-neutral-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Generating your spec...</span>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          {currentQuestionIndex > 0 ? (
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {allAnswered && currentQuestionIndex === 6 ? (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Generate my spec
            </Button>
          ) : (
            <Button onClick={handleSubmit}>
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
