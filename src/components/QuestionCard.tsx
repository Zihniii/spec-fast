'use client';

import type { Question } from '@/types';
import { Textarea } from './ui/textarea';

interface QuestionCardProps {
  /** The current question to display */
  question: Question;
  /** The current answer value */
  value: string;
  /** Callback when the textarea value changes */
  onChange: (value: string) => void;
}

export function QuestionCard({ question, value, onChange }: QuestionCardProps) {
  return (
    <div className="w-full space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
        {question.text}
      </h2>
      <Textarea
        placeholder={question.placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={question.text}
        className="min-h-[140px] text-base"
      />
    </div>
  );
}
