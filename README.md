# SpecFast

**Idea to spec in minutes.** SpecFast transforms a raw project idea into a structured, AI-builder-ready specification through a guided 7-question intake flow — optimized for pasting directly into Cursor, Lovable, v0, or Bolt.

## What It Does

1. **Intake** — Answer 7 focused questions about your project idea, one at a time
2. **Generate** — AI produces a structured spec with 8 sections (overview, problem, persona, scope, metrics, assumptions, and a paste-ready prompt)
3. **Review** — Edit any section inline with Markdown rendering
4. **Export** — Copy as raw Markdown or as a Cursor-optimized prompt

The entire flow takes under 10 minutes. No sign-up, no persistence, no fluff.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 + shadcn/ui components |
| State | React Context + useReducer |
| LLM | Groq API (Qwen 3 32B) |
| Rate Limiting | Upstash Redis |
| Testing | Vitest + fast-check |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A [Groq](https://console.groq.com) API key
- An [Upstash](https://upstash.com) Redis database (for rate limiting)

### Installation

```bash
git clone https://github.com/Zihniii/spec-fast.git
cd spec-fast
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key_here
UPSTASH_REDIS_REST_URL=your_upstash_redis_url_here
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token_here
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Testing

```bash
npm test          # Run all tests once
npm run test:watch  # Watch mode
```

### Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts        # POST /api/generate — LLM spec generation
│   ├── globals.css             # Tailwind + design tokens
│   ├── layout.tsx              # Root layout with AppProvider
│   └── page.tsx                # Entry point → AppShell
├── components/
│   ├── ui/                     # shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── markdown.tsx        # Markdown renderer with artifact stripping
│   │   ├── separator.tsx
│   │   └── textarea.tsx
│   ├── AppShell.tsx            # Screen router (intake/review/export)
│   ├── EditableSection.tsx     # Inline-editable spec section
│   ├── ExportScreen.tsx        # Copy as Markdown / Cursor prompt
│   ├── IntakeScreen.tsx        # 7-question conversational flow
│   ├── ProgressIndicator.tsx   # Animated dot progress bar
│   ├── QuestionCard.tsx        # Single question display
│   └── ReviewScreen.tsx        # Section list + regenerate
├── lib/
│   ├── constants.ts            # Cursor prompt template
│   ├── context.tsx             # React Context + useReducer provider
│   ├── formatters.ts           # Markdown/Cursor export formatters
│   ├── questions.ts            # 7 intake questions config
│   ├── rate-limit.ts           # Upstash rate limiter (10 req/min/IP)
│   ├── reducer.ts              # App state reducer (all actions)
│   └── utils.ts                # cn() utility for Tailwind class merging
└── types/
    └── index.ts                # TypeScript interfaces (AppState, actions, etc.)
```

## Rate Limiting

The app uses Upstash Redis with a sliding window algorithm:

- **Limit:** 10 requests per IP per minute
- **Identifier:** `x-forwarded-for` header (falls back to "anonymous")
- **Response on limit:** 429 with user-friendly error message

This protects Groq API quota from abuse without requiring user authentication.

## License

MIT
