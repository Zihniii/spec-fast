# Implementation Plan: SpecFast — Spec Generator

## Overview

Implement a three-screen Next.js SPA (Intake → Review → Export) that transforms a raw project idea into a structured spec optimized for AI coding tools. The app uses React Context + useReducer for state management, Tailwind CSS for styling, a Next.js API route for LLM-powered spec generation via Groq, and Vitest + fast-check for testing.

## Tasks

- [x] 1. Set up project structure and core interfaces
  - [x] 1.1 Initialize Next.js project with TypeScript and Tailwind CSS
    - Run `create-next-app` with App Router, TypeScript, and Tailwind CSS
    - Install dependencies: `vitest`, `fast-check`, `@testing-library/react`
    - Configure Vitest in `vitest.config.ts`
    - Create base directory structure: `src/app`, `src/components`, `src/lib`, `src/types`
    - _Requirements: 7.4_

  - [x] 1.2 Define core TypeScript interfaces and types
    - Create `src/types/index.ts` with `AppState`, `IntakeState`, `SpecState`, `SpecSection`, `Question`, `GenerateRequest`, `GenerateResponse`, and `AppAction` types as defined in the design
    - Create `src/lib/questions.ts` with the static `QUESTIONS` configuration array (7 questions)
    - Create `src/lib/constants.ts` with `CURSOR_PROMPT_TEMPLATE` (preamble and closing)
    - _Requirements: 1.4, 2.2, 5.3_

  - [x] 1.3 Implement app state reducer and context provider
    - Create `src/lib/reducer.ts` with `appReducer` handling all `AppAction` types
    - Implement initial state: `currentScreen: 'intake'`, empty answers array of length 7, empty sections
    - Create `src/lib/context.tsx` with `AppProvider` component using `useReducer` and React Context
    - Wire `AppProvider` into `src/app/layout.tsx`
    - _Requirements: 1.2, 1.3, 1.8, 2.5, 3.5, 6.1, 6.3, 6.4_

- [x] 2. Implement Intake Screen
  - [x] 2.1 Build QuestionCard and ProgressIndicator components
    - Create `src/components/QuestionCard.tsx` displaying current question text, a textarea input, and placeholder
    - Create `src/components/ProgressIndicator.tsx` rendering "{current} of 7" format
    - Ensure only one question is visible at a time
    - _Requirements: 1.1, 1.4, 1.5, 1.7_

  - [x]* 2.2 Write property test for progress indicator formatting
    - **Property 3: Progress indicator formatting**
    - **Validates: Requirements 1.5**

  - [x] 2.3 Implement IntakeScreen with navigation and validation
    - Create `src/components/IntakeScreen.tsx` composing QuestionCard, ProgressIndicator, and navigation controls
    - Implement answer submission: validate non-empty/non-whitespace, advance to next question on valid submit
    - Show inline error message for empty/whitespace-only submissions
    - Display back button for questions 2–7 that preserves previous answers
    - Display "Generate my spec" button only after all 7 questions are answered
    - _Requirements: 1.1, 1.2, 1.3, 1.6, 1.7, 1.8_

  - [x]* 2.4 Write property tests for answer submission logic
    - **Property 1: Non-empty answer advances question**
    - **Validates: Requirements 1.2**

  - [x]* 2.5 Write property test for whitespace rejection
    - **Property 2: Whitespace-only answers are rejected**
    - **Validates: Requirements 1.3**

- [x] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement Spec Generation API
  - [x] 4.1 Create the `/api/generate` route
    - Create `src/app/api/generate/route.ts` with POST handler
    - Validate request body: exactly 7 non-empty strings
    - Construct structured LLM prompt from answers instructing Groq to return JSON with labeled sections
    - Call Groq API (Llama 3.1 70B) with the prompt
    - Validate response shape (3+ sections, each with non-empty heading and body)
    - Implement retry logic: retry once on malformed LLM response
    - Return appropriate error codes: 400 (invalid input), 429 (rate limit), 504 (timeout), 500 (config/other)
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 2.6, 7.2_

  - [x]* 4.2 Write property test for incomplete answer validation
    - **Property 4: Incomplete answer validation**
    - **Validates: Requirements 2.6, 1.6**

  - [x]* 4.3 Write property test for spec response validation
    - **Property 5: Spec response validation requires 3+ sections**
    - **Validates: Requirements 2.2**

  - [x] 4.4 Wire generation into IntakeScreen
    - Dispatch `START_GENERATION` on "Generate my spec" click
    - Show loading indicator and disable button while `isGenerating` is true
    - On success: dispatch `GENERATION_SUCCESS`, navigate to Review Screen
    - On failure: dispatch `GENERATION_FAILURE`, show error message with Retry button, preserve answers
    - _Requirements: 2.1, 2.3, 2.4, 2.5, 6.1, 6.5_

  - [x]* 4.5 Write property test for generation failure preserving answers
    - **Property 6: Generation failure preserves all intake answers**
    - **Validates: Requirements 2.5**

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement Review Screen
  - [x] 6.1 Build EditableSection component
    - Create `src/components/EditableSection.tsx` displaying section heading and body
    - Implement inline editing: click to edit, textarea with character count
    - Enforce 5,000 character limit (truncate input beyond limit)
    - Show save confirmation on edit save, set `isDirty` flag appropriately
    - _Requirements: 3.1, 3.2, 3.3_

  - [x]* 6.2 Write property test for section edit character limit
    - **Property 7: Section edit character limit**
    - **Validates: Requirements 3.2**

  - [x]* 6.3 Write property test for save edit updates section body
    - **Property 8: Save edit updates section body**
    - **Validates: Requirements 3.3**

  - [x] 6.4 Build ReviewScreen with regeneration and navigation
    - Create `src/components/ReviewScreen.tsx` composing SectionList of EditableSection components
    - Display "Regenerate" button; show confirmation dialog if any section has `isDirty === true`
    - On regenerate confirm: call `/api/generate` with original answers, replace all sections on success
    - On regeneration failure: show error message, retain existing sections
    - Add navigation controls: "Back to Intake" (preserves answers), "Continue to Export"
    - _Requirements: 3.1, 3.4, 3.5, 3.6, 3.7, 6.2, 6.4_

  - [x]* 6.5 Write property test for regeneration success replacing sections
    - **Property 9: Regeneration success replaces all sections**
    - **Validates: Requirements 3.5**

  - [x]* 6.6 Write property test for dirty sections requiring confirmation
    - **Property 10: Dirty sections require regeneration confirmation**
    - **Validates: Requirements 3.6**

  - [x]* 6.7 Write property test for regeneration failure preserving sections
    - **Property 11: Regeneration failure preserves existing sections**
    - **Validates: Requirements 3.7**

- [x] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement Export Screen
  - [x] 8.1 Implement export formatter functions
    - Create `src/lib/formatters.ts` with `formatAsMarkdown(sections)` — outputs each section as `## heading\n\nbody\n\n`
    - Implement `formatAsCursorPrompt(sections)` — wraps `formatAsMarkdown` output with preamble and closing from `CURSOR_PROMPT_TEMPLATE`
    - Implement `copyToClipboard(text)` wrapper using `navigator.clipboard.writeText`
    - _Requirements: 4.3, 5.2, 5.3_

  - [x]* 8.2 Write property test for Markdown formatter
    - **Property 12: Markdown formatter includes all content**
    - **Validates: Requirements 4.3**

  - [x]* 8.3 Write property test for Cursor prompt format
    - **Property 13: Cursor prompt format structure**
    - **Validates: Requirements 5.2, 5.3**

  - [x] 8.4 Build ExportScreen component
    - Create `src/components/ExportScreen.tsx` with read-only spec preview
    - Add "Copy as Markdown" button — disabled when no spec exists, copies formatted Markdown to clipboard
    - Add "Copy as Cursor prompt" button — shows error if spec is empty, copies Cursor-formatted text to clipboard
    - Show success confirmation toast for 3 seconds on successful copy
    - Show error message on clipboard failure
    - Add "Back to Review" navigation control
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.4, 5.5, 5.6, 6.3_

- [x] 9. Implement Screen Navigation and Final Wiring
  - [x] 9.1 Wire all screens together with navigation logic
    - Create `src/components/AppShell.tsx` that conditionally renders IntakeScreen, ReviewScreen, or ExportScreen based on `currentScreen` state
    - Ensure screen transitions complete within 2 seconds
    - Verify all navigation preserves state: intake answers and spec sections persist across screen changes
    - Wire AppShell into `src/app/page.tsx`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.4_

  - [x]* 9.2 Write property test for navigation preserving state
    - **Property 14: Navigation preserves application state**
    - **Validates: Requirements 6.3, 6.4, 1.8**

  - [x]* 9.3 Write integration tests for full workflow
    - Test full generation flow: submit 7 answers → call API (mocked) → receive spec → navigate to Review
    - Test regeneration flow: edit sections → regenerate → verify replacement
    - Test export flow: generate spec → navigate to Export → copy as Markdown → verify clipboard content
    - _Requirements: 2.1, 2.3, 3.5, 4.3, 6.1, 6.2_

- [x] 10. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The app uses session-only state (no persistence) — refreshing loses progress, which is acceptable for v1
- Groq API key must be configured as `GROQ_API_KEY` environment variable for the generation API route

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["2.1", "4.1"] },
    { "id": 3, "tasks": ["2.2", "2.3", "4.2", "4.3"] },
    { "id": 4, "tasks": ["2.4", "2.5", "4.4", "6.1"] },
    { "id": 5, "tasks": ["4.5", "6.2", "6.3", "6.4", "8.1"] },
    { "id": 6, "tasks": ["6.5", "6.6", "6.7", "8.2", "8.3", "8.4"] },
    { "id": 7, "tasks": ["9.1"] },
    { "id": 8, "tasks": ["9.2", "9.3"] }
  ]
}
```
