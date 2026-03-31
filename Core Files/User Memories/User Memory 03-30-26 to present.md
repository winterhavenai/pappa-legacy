# TheLegacy — User Memory (Permanent)

> Never pruned by auto-dream. Append only.

---

## Project Context
- Family legacy project — Pappa (Lane's elderly father) tells his life stories
- Emotional value is real — data loss is unacceptable
- localStorage autosave works (commit c1e21df, 2-second debounce)
- Upstash Redis configured but server-side backup not implemented yet
- Shared repo: winterhavenai/pappa-legacy

## Key People
- **Pappa** — Elderly, the interview subject. UX must be simple and forgiving.
- **Lane Bowers** — Dad, project lead
- **Zane Bowers** — Technical developer

## Technical Facts
- localStorage is primary save mechanism
- Redis is backup/recovery layer (not yet built)
- Session IDs needed for Redis key pattern
- On app load, should check Redis for answers not in localStorage

---

*Add new entries below this line. Date all entries.*
