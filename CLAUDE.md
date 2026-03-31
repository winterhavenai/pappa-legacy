# TheLegacy — Pappa's Interview & Legacy App

> **BEFORE ANY WORK:** Read the governance files in this order:
> 1. `Core Files/Rules.md`
> 2. `Core Files/Context.md`
> 3. `Core Files/Planning/Tasks.md`
> 4. `Core Files/User Memories/User Memory current.md`
> 5. `/Users/zanebowers/Desktop/Zane's Agents/Core Files/Rules.md` (ecosystem rules)
> 6. `/Users/zanebowers/Desktop/Zane's Agents/Core Files/Preferences.md` (Zane's preferences)

## What This Is
Pappa's legacy interview app. Guides Pappa (Lane's elderly father) through life interview questions and saves his answers. Built with the same stack as The Force Multiplier. The app preserves family stories and memories.

## Project Location
- Local: `/Users/zanebowers/Desktop/Zane's Agents/TheLegacy/`
- GitHub: `winterhavenai/pappa-legacy` (collaboration repo — Zane is collaborator)
- Live: `pappa-legacy.vercel.app`

## Tech Stack
- React + Vite (frontend)
- Vercel serverless functions (backend/API)
- Anthropic API (claude-sonnet-4-20250514)
- Upstash Redis (session storage — needs server-side backup implementation)
- Resend (email)
- localStorage (autosave — already implemented, commit c1e21df)

## Architecture
```
src/                           # React frontend
├── App.jsx                    # Main app with interview flow
├── components/                # UI components
└── ...

api/                           # Vercel serverless functions
└── ...
```

## Key Context
- Pappa is ELDERLY — UX must be simple, forgiving, accessible
- localStorage autosave already works (2-second debounce)
- Server-side Redis backup is the main pending task
- This is a family project with real emotional value

## Collaboration Rules
- Same rules as TheForceMultiplier — shared repo with Lane
- Zane's scope is technical only
- Always create handoff docs
- Deploy with `vercel --prod`

## Related Project
- TheForceMultiplier (theforcemultiplier.ai) — K-12 AI literacy platform

## Owner
Zane Bowers (technical), Lane Bowers (project lead)
