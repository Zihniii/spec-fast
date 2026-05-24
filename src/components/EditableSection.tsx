'use client';

import { useState } from 'react';
import { useAppState } from '@/lib/context';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Markdown } from './ui/markdown';
import { Check, Pencil, X } from 'lucide-react';
import type { SpecSection } from '@/types';

const MAX_CHARS = 5000;

interface EditableSectionProps {
  section: SpecSection;
}

export function EditableSection({ section }: EditableSectionProps) {
  const { dispatch } = useAppState();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(section.body);
  const [showSaved, setShowSaved] = useState(false);

  function handleEditClick() {
    setEditValue(section.body);
    setIsEditing(true);
  }

  function handleChange(value: string) {
    const truncated = value.slice(0, MAX_CHARS);
    setEditValue(truncated);
  }

  function handleSave() {
    dispatch({ type: 'EDIT_SECTION', sectionId: section.id, body: editValue });
    dispatch({ type: 'SAVE_SECTION', sectionId: section.id });
    setIsEditing(false);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  }

  function handleCancel() {
    setIsEditing(false);
    setEditValue(section.body);
  }

  return (
    <div className="group rounded-xl border border-neutral-200 bg-white p-5 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          {section.heading}
        </h3>
        <div className="flex items-center gap-2">
          {showSaved && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium" role="status">
              <Check className="h-3 w-3" />
              Saved!
            </span>
          )}
          {!isEditing && (
            <button
              type="button"
              onClick={handleEditClick}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-neutral-100"
              aria-label={`Edit ${section.heading}`}
            >
              <Pencil className="h-3.5 w-3.5 text-neutral-400" />
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <Textarea
            value={editValue}
            onChange={(e) => handleChange(e.target.value)}
            className="min-h-[160px] text-sm"
            aria-label={`Edit ${section.heading}`}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 tabular-nums">
              {editValue.length} / {MAX_CHARS}
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="h-3.5 w-3.5" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Check className="h-3.5 w-3.5" />
                Save
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={handleEditClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleEditClick();
            }
          }}
          role="button"
          tabIndex={0}
          className="cursor-pointer rounded-lg p-2 -m-2 hover:bg-neutral-50 transition-colors"
          aria-label={`Click to edit ${section.heading}`}
        >
          {section.body ? (
            <Markdown content={section.body} />
          ) : (
            <span className="text-sm text-neutral-400 italic">No content</span>
          )}
        </div>
      )}
    </div>
  );
}
