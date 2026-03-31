import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { sessionId } = req.query;

  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required" });
  }

  try {
    const indexKey = `legacy:${sessionId}:index`;
    const raw = await redis.get(indexKey);
    const keys = Array.isArray(raw) ? raw : (typeof raw === "string" ? JSON.parse(raw) : []);

    if (!keys.length) {
      return res.status(200).json({ answers: {}, count: 0 });
    }

    const answers = {};
    for (const key of keys) {
      const val = await redis.get(key);
      if (val) {
        // key format: legacy:sessionId:chapterId:questionIndex
        const parts = key.split(":");
        const chapterId = parts[2];
        const questionIndex = parseInt(parts[3], 10);
        const parsed = typeof val === "string" ? JSON.parse(val) : val;
        const answerKey = `${chapterId}_${questionIndex}`;
        answers[answerKey] = parsed.answer;
      }
    }

    return res.status(200).json({ answers, count: Object.keys(answers).length });
  } catch (err) {
    console.error("Redis get error:", err);
    return res.status(200).json({ answers: {}, count: 0, warning: "recovery failed" });
  }
}
