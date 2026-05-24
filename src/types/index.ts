export interface Question {
  id: number;
  text: string;
  placeholder: string;
}

export interface SpecSection {
  id: string;
  heading: string;
  body: string;
  isDirty: boolean;
}

export interface IntakeState {
  currentQuestionIndex: number;
  answers: string[];
}

export interface SpecState {
  sections: SpecSection[];
  isGenerating: boolean;
  generationError: string | null;
  hasUnsavedEdits: boolean;
}

export interface AppState {
  currentScreen: 'intake' | 'review' | 'export';
  intake: IntakeState;
  spec: SpecState;
}

export interface GenerateRequest {
  answers: string[];
}

export interface GenerateResponse {
  sections: Array<{
    heading: string;
    body: string;
  }>;
}

export type AppAction =
  | { type: 'SUBMIT_ANSWER'; questionIndex: number; answer: string }
  | { type: 'GO_TO_QUESTION'; questionIndex: number }
  | { type: 'START_GENERATION' }
  | { type: 'GENERATION_SUCCESS'; sections: SpecSection[] }
  | { type: 'GENERATION_FAILURE'; error: string }
  | { type: 'EDIT_SECTION'; sectionId: string; body: string }
  | { type: 'SAVE_SECTION'; sectionId: string }
  | { type: 'NAVIGATE'; screen: 'intake' | 'review' | 'export' }
  | { type: 'CONFIRM_REGENERATE' }
  | { type: 'RESET' };
