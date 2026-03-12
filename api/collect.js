// Anonymous data collection endpoint
// Stores anonymized legacy interview responses for product improvement
// Setup: Add Vercel KV in your Vercel dashboard (Storage tab → KV → Create)
// Then add KV_REST_API_URL and KV_REST_API_TOKEN to your environment variables

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { chapterId, questionIndex, questionText, answerLength, sessionId, timestamp } = req.body;

  // We never store the actual answer — only metadata about engagement
  // This tells us: which questions resonate, which get long answers, which get skipped
  const anonymizedRecord = {
    sessionId,          // random ID generated client-side, no personal info
    chapterId,          // e.g. "aleda", "faith", "wisdom"
    questionIndex,
    questionText,       // the question asked
    answerLength,       // character count only — never the answer itself
    timestamp,
    productVersion: "1.0",
  };

  try {
    // ── VERCEL KV STORAGE ──────────────────────────────────────────────
    // Uncomment once you've added Vercel KV in your dashboard:
    //
    // import { kv } from "@vercel/kv";
    // const key = `response:${sessionId}:${chapterId}:${questionIndex}`;
    // await kv.set(key, anonymizedRecord, { ex: 60 * 60 * 24 * 365 }); // 1 year TTL
    //
    // ──────────────────────────────────────────────────────────────────

    // For now: log to Vercel's built-in logging (visible in your Vercel dashboard)
    console.log("LEGACY_RESPONSE", JSON.stringify(anonymizedRecord));

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Collection error:", err);
    // Silently fail — never interrupt the user experience for analytics
    return res.status(200).json({ ok: true });
  }
}
