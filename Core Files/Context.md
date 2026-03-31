# TheLegacy — Context

## What It Is
Pappa's legacy interview app — guides Lane's elderly father through life interview questions and preserves his answers. A family project with real emotional value.

## Current State (March 30, 2026)
- Live at pappa-legacy.vercel.app
- localStorage autosave deployed and working (commit c1e21df, 2-second debounce)
- Server-side Redis backup NOT yet implemented (main pending task)
- Upstash Redis is configured in the project — just needs the backup implementation

## What Needs to Be Built
1. Vercel serverless function at `/api/save-answer` — writes to Upstash Redis
2. `/api/get-answers` — retrieves saved answers by session ID
3. Hook into existing autosave debounce — after localStorage update, also call `/api/save-answer`

## Tech Stack
- React + Vite
- Vercel serverless functions
- Anthropic API (claude-sonnet-4-20250514)
- Upstash Redis (configured, needs implementation)
- Resend email
- localStorage (autosave working)

## Key People
- **Pappa** — Lane's father, elderly, the interview subject
- **Lane Bowers** — Project lead, Pappa's son
- **Zane Bowers** — Technical developer
