import type { Question } from '@/types';

export const QUESTIONS: Question[] = [
  { id: 1, text: "What's your project idea in one sentence?", placeholder: "e.g., A habit tracker for remote workers..." },
  { id: 2, text: "Who is this for? Describe your target user.", placeholder: "e.g., Freelance designers who..." },
  { id: 3, text: "What are the 3-5 core features?", placeholder: "e.g., 1. Dashboard 2. Notifications..." },
  { id: 4, text: "What tech stack or platform preference do you have?", placeholder: "e.g., React + Supabase, or 'no preference'..." },
  { id: 5, text: "Are there any design or UX constraints?", placeholder: "e.g., Mobile-first, dark mode, minimal..." },
  { id: 6, text: "What's the MVP scope — what can you cut?", placeholder: "e.g., No auth for v1, single user only..." },
  { id: 7, text: "Anything else the AI builder should know?", placeholder: "e.g., Must integrate with Stripe, use shadcn/ui..." },
];
