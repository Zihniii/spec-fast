# Requirements Document

## Introduction

SpecFast is a focused web tool for indie hackers and vibe coders who use AI builders (Cursor, Lovable, v0, Bolt). It transforms a raw project idea into a structured spec optimized as input for AI coding tools — in under 10 minutes. The product consists of three screens: Intake (conversational questionnaire), Review (editable generated spec), and Export (copy as Markdown or Cursor prompt).

## Glossary

- **Intake_Screen**: The first screen of the application that presents 7 sequential questions to the user in a conversational format to gather project idea details.
- **Review_Screen**: The second screen that displays the generated spec in readable, editable sections.
- **Export_Screen**: The third screen that provides options to copy the final spec in different formats.
- **Spec**: A structured specification document generated from user answers, optimized for consumption by AI coding tools.
- **Progress_Indicator**: A visual element on the Intake Screen showing the user how many questions they have completed and how many remain.
- **Section**: A discrete, labeled block of content within the generated spec (e.g., "Overview", "Features", "Tech Stack").
- **User**: An indie hacker or vibe coder using the application to generate a spec for their project idea.
- **AI_Builder**: An external AI coding tool (such as Cursor, Lovable, v0, or Bolt) that consumes the generated spec as input.
- **Cursor_Prompt_Format**: A formatted version of the spec optimized for pasting directly into Cursor's prompt interface.

## Requirements

### Requirement 1: Conversational Intake Flow

**User Story:** As a User, I want to answer project questions one at a time in a conversational flow, so that I can articulate my idea without feeling overwhelmed by a wall of fields.

#### Acceptance Criteria

1. WHEN the User opens the application, THE Intake_Screen SHALL display the first question.
2. WHEN the User submits a non-empty answer to a question, THE Intake_Screen SHALL advance to the next question.
3. IF the User submits an answer that is empty or contains only whitespace, THEN THE Intake_Screen SHALL remain on the current question and display an error message indicating that an answer is required.
4. THE Intake_Screen SHALL present exactly 7 questions in a fixed sequential order.
5. WHILE the User is on the Intake_Screen, THE Progress_Indicator SHALL display the current question number and the total number of questions in the format "{current} of 7".
6. WHEN the User completes all 7 questions, THE Intake_Screen SHALL display a "Generate my spec" button.
7. THE Intake_Screen SHALL present one question at a time without displaying upcoming or previous questions simultaneously.
8. WHILE the User is on any question after the first, THE Intake_Screen SHALL display a back control that returns the User to the previous question with their previously entered answer preserved.

### Requirement 2: Spec Generation

**User Story:** As a User, I want to generate a structured spec from my answers, so that I have a well-scoped document ready for AI coding tools.

#### Acceptance Criteria

1. WHEN the User activates the "Generate my spec" button, THE Spec_Generator SHALL produce a structured Spec from the 7 answers within 30 seconds.
2. THE Spec_Generator SHALL organize the generated Spec into at least 3 distinct labeled Sections, where each Section contains a heading and body content derived from the User's answers.
3. WHEN the Spec is generated, THE Application SHALL navigate the User to the Review_Screen.
4. WHILE the Spec is being generated, THE Application SHALL display a visible loading indicator to the User and disable the "Generate my spec" button.
5. IF the Spec generation fails, THEN THE Application SHALL display an error message indicating the failure reason, preserve the User's 7 answers, and present a "Retry" control to re-attempt generation.
6. IF any of the 7 answers are missing when the User activates the "Generate my spec" button, THEN THE Application SHALL prevent generation and indicate which answers are incomplete.

### Requirement 3: Spec Review and Inline Editing

**User Story:** As a User, I want to review and edit the generated spec inline, so that I can refine the output before exporting it.

#### Acceptance Criteria

1. THE Review_Screen SHALL display the generated Spec with each Section shown under a visible heading label corresponding to the original question topic.
2. WHEN the User selects a Section for editing, THE Review_Screen SHALL allow inline text editing of that Section's content up to 5,000 characters.
3. WHEN the User saves an inline edit, THE Review_Screen SHALL update the Spec with the modified content and display a visible confirmation that the change was saved.
4. THE Review_Screen SHALL display a "Regenerate" button.
5. WHEN the User activates the "Regenerate" button, THE Spec_Generator SHALL produce a new Spec from the original 7 answers and replace all displayed Sections with the newly generated content.
6. IF the User has unsaved inline edits and activates the "Regenerate" button, THEN THE Review_Screen SHALL prompt the User to confirm before discarding edits and regenerating.
7. IF Spec regeneration fails, THEN THE Review_Screen SHALL display an error message indicating the failure and retain the previously displayed Spec content.

### Requirement 4: Export as Markdown

**User Story:** As a User, I want to copy my spec as Markdown, so that I can paste it into any AI builder or documentation tool.

#### Acceptance Criteria

1. THE Export_Screen SHALL display a "Copy as Markdown" button.
2. IF no Spec content has been generated, THEN THE Export_Screen SHALL display the "Copy as Markdown" button in a disabled state.
3. WHEN the User activates the "Copy as Markdown" button, THE Application SHALL copy all Spec sections including their headings and body text in Markdown format to the system clipboard.
4. WHEN the copy operation completes successfully, THE Application SHALL display a confirmation message to the User for between 2 and 5 seconds.
5. IF the clipboard copy fails, THEN THE Application SHALL display an error message indicating the copy did not succeed, and the Spec content SHALL remain accessible on screen.

### Requirement 5: Export as Cursor Prompt

**User Story:** As a User, I want to copy my spec formatted as a Cursor prompt, so that I can paste it directly into Cursor and start building immediately.

#### Acceptance Criteria

1. THE Export_Screen SHALL display a "Copy as Cursor prompt" button.
2. WHEN the User activates the "Copy as Cursor prompt" button, THE Application SHALL copy the Spec content in Cursor_Prompt_Format to the system clipboard.
3. THE Cursor_Prompt_Format SHALL wrap the Spec content with a preamble that instructs the AI assistant to implement the spec, followed by the full Spec content in Markdown, followed by a closing instruction to confirm understanding and ask clarifying questions before proceeding.
4. WHEN the copy operation completes successfully, THE Application SHALL display a confirmation message to the User for a duration of 3 seconds.
5. IF the clipboard copy fails, THEN THE Application SHALL display an error message indicating the clipboard operation was unsuccessful.
6. IF the User activates the "Copy as Cursor prompt" button and the Spec content is empty, THEN THE Application SHALL display an error message indicating that no spec content is available to export.

### Requirement 6: Screen Navigation

**User Story:** As a User, I want to navigate between the three screens, so that I can move through the intake-review-export workflow.

#### Acceptance Criteria

1. WHEN spec generation completes successfully, THE Application SHALL automatically navigate from the Intake_Screen to the Review_Screen.
2. WHILE the Review_Screen is displayed, THE Application SHALL provide a navigation control that, WHEN activated by the User, navigates to the Export_Screen.
3. WHILE the Export_Screen is displayed, THE Application SHALL provide a back-navigation control that, WHEN activated by the User, navigates to the Review_Screen with all previously displayed review content preserved.
4. WHILE the Review_Screen is displayed, THE Application SHALL provide a back-navigation control that, WHEN activated by the User, navigates to the Intake_Screen with the User's previous intake responses preserved.
5. IF spec generation fails, THEN THE Application SHALL remain on the Intake_Screen and display an error message indicating the generation failure.

### Requirement 7: Time-to-Spec Performance

**User Story:** As a User, I want the entire intake-to-export flow to complete in under 10 minutes, so that I can quickly move from idea to building.

#### Acceptance Criteria

1. THE Intake_Screen SHALL allow a User to answer all 7 questions and activate "Generate my spec" within 5 minutes, assuming each answer is 1–3 sentences in length.
2. WHEN the User activates "Generate my spec", THE Spec_Generator SHALL produce and display the Spec on the Review screen within 30 seconds.
3. WHEN the User navigates from the Intake_Screen to the Export screen (including review and any inline edits of up to 2 sections), THE Application SHALL support completion of the entire workflow within 10 minutes, measured from first question appearance to successful export action.
4. WHEN the User transitions between screens or between questions within the Intake_Screen, THE Application SHALL complete the transition and render the next view within 2 seconds.
5. WHEN the User activates a copy action on the Export screen, THE Application SHALL copy the content to the clipboard within 1 second.
