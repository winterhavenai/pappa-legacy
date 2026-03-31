import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { sessionId, chapterId, questionIndex, answer, timestamp } = req.body;

  if (!sessionId || !chapterId || questionIndex === undefined || !answer) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const key = `legacy:${sessionId}:${chapterId}:${questionIndex}`;
    await redis.set(key, JSON.stringify({ answer, timestamp }), { ex: 60 * 60 * 24 * 365 });

    // Also maintain an index of all keys for this session
    const indexKey = `legacy:${sessionId}:index`;
    const existing = (await redis.get(indexKey)) || [];
    const keys = Array.isArray(existing) ? existing : [];
    if (!keys.includes(key)) {
      keys.push(key);
      await redis.set(indexKey, JSON.stringify(keys), { ex: 60 * 60 * 24 * 365 });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Redis save error:", err);
    // Silent fail — never interrupt the user experience
    return res.status(200).json({ ok: true, warning: "backup failed" });
  }
}
