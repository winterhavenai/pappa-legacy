# TheLegacy — Task List

## Task 3 — Upstash Redis Backup (from Lane's task list)
**Status:** NOT STARTED
**Priority:** 1 (only task for this project right now)
**Estimated time:** 2-3 hours

**Background:** localStorage autosave already works (commit c1e21df, 2-second debounce). What's needed is a SERVER-SIDE backup layer so if Pappa clears browser or switches devices, answers can be recovered.

**Implementation:**
1. Create Vercel serverless function at `/api/save-answer`
   - Receives: `{ sessionId, questionId, answer, timestamp }`
   - Writes to Upstash Redis with key pattern `session:{sessionId}:answer:{questionId}`
2. Create `/api/get-answers` function
   - Receives: `{ sessionId }`
   - Returns all saved answers for that session from Redis
3. Hook into existing autosave debounce in the frontend
   - After localStorage update succeeds, also call `/api/save-answer`
   - If Redis call fails, log error but don't block — localStorage is the primary save
4. On app load, check Redis for any answers not in localStorage (recovery flow)

**Notes:**
- Upstash Redis is already configured in the project environment
- This is critical for Pappa — he is elderly and could lose browser data
- localStorage remains the primary save; Redis is the backup/recovery layer
