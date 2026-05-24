import { describe, it, expect } from 'vitest';
import { appReducer, initialState } from './reducer';
import type { AppState, SpecSection } from '@/types';

describe('appReducer', () => {
  describe('initial state', () => {
    it('should have intake screen as current screen', () => {
      expect(initialState.currentScreen).toBe('intake');
    });

    it('should have 7 empty answers', () => {
      expect(initialState.intake.answers).toHaveLength(7);
      expect(initialState.intake.answers.every((a) => a === '')).toBe(true);
    });

    it('should start at question index 0', () => {
      expect(initialState.intake.currentQuestionIndex).toBe(0);
    });

    it('should have empty sections', () => {
      expect(initialState.spec.sections).toEqual([]);
    });

    it('should not be generating', () => {
      expect(initialState.spec.isGenerating).toBe(false);
    });

    it('should have no generation error', () => {
      expect(initialState.spec.generationError).toBeNull();
    });
  });

  describe('SUBMIT_ANSWER', () => {
    it('should store a valid answer and advance the question index', () => {
      const result = appReducer(initialState, {
        type: 'SUBMIT_ANSWER',
        questionIndex: 0,
        answer: 'My project idea',
      });
      expect(result.intake.answers[0]).toBe('My project idea');
      expect(result.intake.currentQuestionIndex).toBe(1);
    });

    it('should not advance past index 6', () => {
      const state: AppState = {
        ...initialState,
        intake: { ...initialState.intake, currentQuestionIndex: 6 },
      };
      const result = appReducer(state, {
        type: 'SUBMIT_ANSWER',
        questionIndex: 6,
        answer: 'Final answer',
      });
      expect(result.intake.currentQuestionIndex).toBe(6);
      expect(result.intake.answers[6]).toBe('Final answer');
    });

    it('should reject empty answers', () => {
      const result = appReducer(initialState, {
        type: 'SUBMIT_ANSWER',
        questionIndex: 0,
        answer: '',
      });
      expect(result).toBe(initialState);
    });

    it('should reject whitespace-only answers', () => {
      const result = appReducer(initialState, {
        type: 'SUBMIT_ANSWER',
        questionIndex: 0,
        answer: '   \t\n  ',
      });
      expect(result).toBe(initialState);
    });
  });

  describe('GO_TO_QUESTION', () => {
    it('should set the current question index', () => {
      const state: AppState = {
        ...initialState,
        intake: { ...initialState.intake, currentQuestionIndex: 3 },
      };
      const result = appReducer(state, {
        type: 'GO_TO_QUESTION',
        questionIndex: 1,
      });
      expect(result.intake.currentQuestionIndex).toBe(1);
    });
  });

  describe('START_GENERATION', () => {
    it('should set isGenerating to true and clear error', () => {
      const state: AppState = {
        ...initialState,
        spec: { ...initialState.spec, generationError: 'previous error' },
      };
      const result = appReducer(state, { type: 'START_GENERATION' });
      expect(result.spec.isGenerating).toBe(true);
      expect(result.spec.generationError).toBeNull();
    });
  });

  describe('GENERATION_SUCCESS', () => {
    it('should store sections, navigate to review, and stop generating', () => {
      const sections: SpecSection[] = [
        { id: '1', heading: 'Overview', body: 'Content', isDirty: false },
        { id: '2', heading: 'Features', body: 'Content', isDirty: false },
        { id: '3', heading: 'Stack', body: 'Content', isDirty: false },
      ];
      const state: AppState = {
        ...initialState,
        spec: { ...initialState.spec, isGenerating: true },
      };
      const result = appReducer(state, {
        type: 'GENERATION_SUCCESS',
        sections,
      });
      expect(result.currentScreen).toBe('review');
      expect(result.spec.isGenerating).toBe(false);
      expect(result.spec.sections).toHaveLength(3);
      expect(result.spec.sections.every((s) => !s.isDirty)).toBe(true);
    });
  });

  describe('GENERATION_FAILURE', () => {
    it('should set error, stop generating, and preserve answers', () => {
      const state: AppState = {
        ...initialState,
        intake: {
          ...initialState.intake,
          answers: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
        },
        spec: { ...initialState.spec, isGenerating: true },
      };
      const result = appReducer(state, {
        type: 'GENERATION_FAILURE',
        error: 'API timeout',
      });
      expect(result.spec.isGenerating).toBe(false);
      expect(result.spec.generationError).toBe('API timeout');
      expect(result.intake.answers).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
    });
  });

  describe('EDIT_SECTION', () => {
    it('should update section body and set isDirty', () => {
      const state: AppState = {
        ...initialState,
        spec: {
          ...initialState.spec,
          sections: [
            { id: '1', heading: 'Test', body: 'Original', isDirty: false },
          ],
        },
      };
      const result = appReducer(state, {
        type: 'EDIT_SECTION',
        sectionId: '1',
        body: 'Updated content',
      });
      expect(result.spec.sections[0].body).toBe('Updated content');
      expect(result.spec.sections[0].isDirty).toBe(true);
      expect(result.spec.hasUnsavedEdits).toBe(true);
    });

    it('should truncate body at 5000 characters', () => {
      const state: AppState = {
        ...initialState,
        spec: {
          ...initialState.spec,
          sections: [
            { id: '1', heading: 'Test', body: 'Original', isDirty: false },
          ],
        },
      };
      const longBody = 'x'.repeat(6000);
      const result = appReducer(state, {
        type: 'EDIT_SECTION',
        sectionId: '1',
        body: longBody,
      });
      expect(result.spec.sections[0].body).toHaveLength(5000);
    });
  });

  describe('SAVE_SECTION', () => {
    it('should set isDirty to false for the section', () => {
      const state: AppState = {
        ...initialState,
        spec: {
          ...initialState.spec,
          sections: [
            { id: '1', heading: 'Test', body: 'Edited', isDirty: true },
          ],
          hasUnsavedEdits: true,
        },
      };
      const result = appReducer(state, {
        type: 'SAVE_SECTION',
        sectionId: '1',
      });
      expect(result.spec.sections[0].isDirty).toBe(false);
      expect(result.spec.hasUnsavedEdits).toBe(false);
    });
  });

  describe('NAVIGATE', () => {
    it('should change the current screen', () => {
      const result = appReducer(initialState, {
        type: 'NAVIGATE',
        screen: 'export',
      });
      expect(result.currentScreen).toBe('export');
    });

    it('should preserve all state when navigating', () => {
      const state: AppState = {
        ...initialState,
        intake: {
          ...initialState.intake,
          answers: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
        },
        spec: {
          ...initialState.spec,
          sections: [
            { id: '1', heading: 'Test', body: 'Content', isDirty: false },
          ],
        },
      };
      const result = appReducer(state, {
        type: 'NAVIGATE',
        screen: 'export',
      });
      expect(result.intake.answers).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
      expect(result.spec.sections).toHaveLength(1);
    });
  });

  describe('CONFIRM_REGENERATE', () => {
    it('should set isGenerating to true', () => {
      const result = appReducer(initialState, { type: 'CONFIRM_REGENERATE' });
      expect(result.spec.isGenerating).toBe(true);
    });
  });
});
