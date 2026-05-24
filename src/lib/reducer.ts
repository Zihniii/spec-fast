import type { AppState, AppAction } from '@/types';

export const initialState: AppState = {
  currentScreen: 'intake',
  intake: {
    currentQuestionIndex: 0,
    answers: ['', '', '', '', '', '', ''],
  },
  spec: {
    sections: [],
    isGenerating: false,
    generationError: null,
    hasUnsavedEdits: false,
  },
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SUBMIT_ANSWER': {
      const trimmed = action.answer.trim();
      if (trimmed.length === 0) {
        return state;
      }
      const newAnswers = [...state.intake.answers];
      newAnswers[action.questionIndex] = action.answer;
      const newIndex =
        state.intake.currentQuestionIndex < 6
          ? state.intake.currentQuestionIndex + 1
          : state.intake.currentQuestionIndex;
      return {
        ...state,
        intake: {
          ...state.intake,
          answers: newAnswers,
          currentQuestionIndex: newIndex,
        },
      };
    }

    case 'GO_TO_QUESTION': {
      return {
        ...state,
        intake: {
          ...state.intake,
          currentQuestionIndex: action.questionIndex,
        },
      };
    }

    case 'START_GENERATION': {
      return {
        ...state,
        spec: {
          ...state.spec,
          isGenerating: true,
          generationError: null,
        },
      };
    }

    case 'GENERATION_SUCCESS': {
      const sections = action.sections.map((s) => ({
        ...s,
        isDirty: false,
      }));
      return {
        ...state,
        currentScreen: 'review',
        spec: {
          sections,
          isGenerating: false,
          generationError: null,
          hasUnsavedEdits: false,
        },
      };
    }

    case 'GENERATION_FAILURE': {
      return {
        ...state,
        spec: {
          ...state.spec,
          isGenerating: false,
          generationError: action.error,
        },
      };
    }

    case 'EDIT_SECTION': {
      const truncatedBody = action.body.slice(0, 5000);
      const newSections = state.spec.sections.map((section) =>
        section.id === action.sectionId
          ? { ...section, body: truncatedBody, isDirty: true }
          : section
      );
      return {
        ...state,
        spec: {
          ...state.spec,
          sections: newSections,
          hasUnsavedEdits: newSections.some((s) => s.isDirty),
        },
      };
    }

    case 'SAVE_SECTION': {
      const newSections = state.spec.sections.map((section) =>
        section.id === action.sectionId
          ? { ...section, isDirty: false }
          : section
      );
      return {
        ...state,
        spec: {
          ...state.spec,
          sections: newSections,
          hasUnsavedEdits: newSections.some((s) => s.isDirty),
        },
      };
    }

    case 'NAVIGATE': {
      return {
        ...state,
        currentScreen: action.screen,
      };
    }

    case 'CONFIRM_REGENERATE': {
      return {
        ...state,
        spec: {
          ...state.spec,
          isGenerating: true,
        },
      };
    }

    case 'RESET': {
      return initialState;
    }

    default:
      return state;
  }
}
