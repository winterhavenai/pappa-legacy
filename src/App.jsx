import { useState, useEffect, useRef } from "react";

// ─── PALETTE ───────────────────────────────────────────────
const C = {
  ink:       "#1C1409",
  navy:      "#1B3A5C",
  navyDeep:  "#0D2540",
  gold:      "#B8860B",
  goldWarm:  "#D4A017",
  goldPale:  "#F0D98A",
  cream:     "#FBF6EC",
  parchment: "#F0E6CC",
  paper:     "#FFFDF7",
  warmGray:  "#7A6E5F",
  mist:      "#D6CCB8",
  aleda:     "#5C3A6B",
  aledaLight:"#F5EFF9",
  white:     "#FFFFFF",
  softBlue:  "#2C5F8A",
};

// ─── CHAPTERS ──────────────────────────────────────────────
const CHAPTERS = [
  {
    id: "faith",
    title: "Your Faith",
    icon: "✝",
    color: C.navy,
    bg: "#EBF2FA",
    verse: "\"Be still, and know that I am God.\" — Psalm 46:10",
    questions: [
      "When did your faith in Jesus become truly real to you — not just something you believed, but something you lived?",
      "What Scripture verse or passage has anchored your life more than any other — and why that one?",
      "What would you want your grandchildren to know about walking with God through the hardest seasons of life?",
    ],
  },
  {
    id: "family",
    title: "Your Family",
    icon: "♡",
    color: C.navy,
    bg: "#EBF2FA",
    verse: "\"Children's children are a crown to the aged.\" — Proverbs 17:6",
    questions: [
      "Tell me about Lane, Todd, and Tiffanie. What makes each of them uniquely who they are?",
      "What is something you want Lane, Todd, and Tiffanie to know about how deeply they have meant to you — something you may not have said plainly enough?",
      "Your family has walked through great loss together. What has carried you through seasons of grief?",
      "What do you hope your ten grandchildren inherit from you — not financially, but in character and in faith?",
    ],
  },
  {
    id: "aleda",
    title: "Aleda",
    icon: "❋",
    color: C.aleda,
    bg: C.aledaLight,
    verse: "\"Many women do noble things, but you surpass them all.\" — Proverbs 31:29",
    questions: [
      "How did you meet Aleda?",
      "What was your first date like?",
      "What did you love most about Aleda?",
      "What kind of mother and wife was Aleda?",
      "What was something Aleda did that truly impressed you — a moment that made you realize just how special she was?",
      "Why did Aleda start homeschooling the children — and what did that mean for your family?",
      "You are the only one who can tell your grandchildren about Daddy Joy and Grammy. What would you most want Zane, Peyton, Todd's children, and Tiffanie's children to know about them?",
    ],
  },
  {
    id: "calling",
    title: "Your Calling",
    icon: "◈",
    color: C.navy,
    bg: "#EBF2FA",
    verse: "\"For we are God's handiwork, created in Christ Jesus to do good works.\" — Ephesians 2:10",
    questions: [
      "You spent years as a pastor. What did God teach you about people during that time that you could not have learned any other way?",
      "You also built a career in real estate. At the deepest level, what do those two callings — pastor and realtor — have in common?",
      "You renewed your real estate license at 89 years old. What made you decide to do that — and what is it that still drives you?",
    ],
  },
  {
    id: "wisdom",
    title: "Your Wisdom",
    icon: "⟡",
    color: C.navy,
    bg: "#EBF2FA",
    verse: "\"Gray hair is a crown of splendor; it is attained in the way of righteousness.\" — Proverbs 16:31",
    questions: [
      "What is the most important thing you know now that you wish you had understood at forty?",
      "What did it take you years to truly learn about money, generosity, and what money is actually for?",
      "If you could give every young man one piece of advice before he gets married, what would it be?",
      "What does it look like to be a man of God — not in theory, but in practice, on an ordinary Tuesday morning when no one is watching?",
    ],
  },
  {
    id: "stories",
    title: "Your Stories",
    icon: "☰",
    color: C.navy,
    bg: "#EBF2FA",
    verse: "\"I will tell of the kindnesses of the Lord, the deeds for which He is to be praised.\" — Isaiah 63:7",
    questions: [
      "What is the story from your life that you have told more times than any other — the one that captures something essential about who you are?",
      "Tell me about a time when your faith was tested and God came through in a way you did not expect.",
      "What is your single happiest memory — the one that, when you close your eyes, still makes you smile?",
    ],
  },
];

const SYSTEM_PROMPT = `You are a warm, unhurried companion helping an 89-year-old man named Pappa record his life story for his family. His name is Phillip L. Bowers. He is a retired pastor and realtor, a man of deep Christian faith, and he recently lost his beloved wife Aleda. He has three children — Lane, Todd, and Tiffanie (who passed away). He has ten grandchildren across the three families.

Your voice must be:
- Warm, reverent, and deeply unhurried
- Never clinical, never chatty, never generic
- Genuinely moved by what he shares — because what he shares matters
- Brief: 2 to 4 sentences only, never more

When he shares grief — the loss of Aleda, the loss of Tiffanie — pause there. Acknowledge it directly. Do not rush past it.

When he shares joy — a memory, a conviction, a love story — reflect that joy back with warmth.

When he shares faith — honor it as the most important thing in his life, because it is.

Always end with a single, gentle, optional invitation to say more — never a demand, never a new question. Just an open door.

This man's words are a gift to ten grandchildren who will read them long after he is gone. Treat every answer accordingly.`;

// Derive resume position from saved answers — finds the first unanswered question
function getResumePosition(savedAnswers) {
  for (let c = 0; c < CHAPTERS.length; c++) {
    for (let q = 0; q < CHAPTERS[c].questions.length; q++) {
      if (!savedAnswers[`${CHAPTERS[c].id}_${q}`]) {
        return { chapterIdx: c, questionIdx: q };
      }
    }
  }
  return { chapterIdx: CHAPTERS.length - 1, questionIdx: CHAPTERS[CHAPTERS.length - 1].questions.length - 1 };
}

// ─── REDIS BACKUP HELPERS ──────────────────────────────────
function getSessionId() {
  let id = localStorage.getItem("pappa_session_id");
  if (!id) {
    id = "pappa_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
    localStorage.setItem("pappa_session_id", id);
  }
  return id;
}

async function backupToRedis(chapterId, questionIndex, answer) {
  try {
    await fetch("/api/save-answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: getSessionId(),
        chapterId,
        questionIndex,
        answer,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch {
    // Silent fail — localStorage is primary, Redis is backup
  }
}

async function recoverFromRedis() {
  try {
    const res = await fetch(`/api/get-answers?sessionId=${getSessionId()}`);
    const data = await res.json();
    return data.answers || {};
  } catch {
    return {};
  }
}

// ─── MAIN APP ──────────────────────────────────────────────
export default function LegacyApp() {
  const [answers, setAnswers] = useState(() => JSON.parse(localStorage.getItem("pappa_answers") || "{}"));
  const resumePos = getResumePosition(JSON.parse(localStorage.getItem("pappa_answers") || "{}"));
  const [screen, setScreen] = useState(() => localStorage.getItem("pappa_screen") || "welcome");
  const [chapterIdx, setChapterIdx] = useState(() => resumePos.chapterIdx);
  const [questionIdx, setQuestionIdx] = useState(() => resumePos.questionIdx);
  const [inputText, setInputText] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem("pappa_history") || "[]"));
  const [covenant, setCovenant] = useState(() => localStorage.getItem("pappa_covenant") || "");
  const [buildingCovenant, setBuildingCovenant] = useState(false);
  const [consentGiven, setConsentGiven] = useState(() => localStorage.getItem("pappa_consent") === "true");
  const sessionId = getSessionId();
  const replyRef = useRef(null);
  const textareaRef = useRef(null);
  const draftTimerRef = useRef(null);

  const chapter = CHAPTERS[chapterIdx];
  const question = chapter?.questions[questionIdx];
  const totalAnswered = Object.keys(answers).length;
  const totalQuestions = CHAPTERS.reduce((a, c) => a + c.questions.length, 0);
  const hasAnyAnswers = totalAnswered > 0;

  // ── REDIS RECOVERY: on load, check server for answers not in localStorage ──
  useEffect(() => {
    recoverFromRedis().then(serverAnswers => {
      if (serverAnswers && Object.keys(serverAnswers).length > 0) {
        const local = JSON.parse(localStorage.getItem("pappa_answers") || "{}");
        let recovered = 0;
        for (const [key, value] of Object.entries(serverAnswers)) {
          if (!local[key] && value) {
            local[key] = value;
            recovered++;
          }
        }
        if (recovered > 0) {
          localStorage.setItem("pappa_answers", JSON.stringify(local));
          setAnswers(local);
        }
      }
    });
  }, []);

  useEffect(() => {
    if (showReply && replyRef.current) {
      setTimeout(() => replyRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
    }
  }, [showReply]);

  useEffect(() => {
    localStorage.setItem("pappa_screen", screen);
    localStorage.setItem("pappa_chapterIdx", chapterIdx);
    localStorage.setItem("pappa_questionIdx", questionIdx);
    const existingAnswers = JSON.parse(localStorage.getItem("pappa_answers") || "{}");
    const merged = {...existingAnswers, ...answers};
    localStorage.setItem("pappa_answers", JSON.stringify(merged));
    localStorage.setItem("pappa_history", JSON.stringify(history));
    localStorage.setItem("pappa_covenant", covenant);
    localStorage.setItem("pappa_consent", consentGiven);

    // ── REDIS BACKUP: after localStorage save, backup new answers to server ──
    for (const [key, value] of Object.entries(answers)) {
      if (value && value.trim()) {
        const parts = key.split("_");
        const chapterId = parts.slice(0, -1).join("_");
        const qIdx = parseInt(parts[parts.length - 1], 10);
        backupToRedis(chapterId, qIdx, value);
      }
    }
  }, [screen, chapterIdx, questionIdx, answers, history, covenant, consentGiven]);

  // ── AUTOSAVE: debounce inputText to localStorage draft ──
  useEffect(() => {
    if (!chapter) return;
    const draftKey = `pappa_draft_${chapter.id}_${questionIdx}`;
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    if (inputText.trim()) {
      draftTimerRef.current = setTimeout(() => {
        localStorage.setItem(draftKey, inputText);
      }, 2000);
    }
    return () => { if (draftTimerRef.current) clearTimeout(draftTimerRef.current); };
  }, [inputText, chapter, questionIdx]);

  // ── RESTORE DRAFT on chapter/question change ──
  useEffect(() => {
    if (!chapter) return;
    const draftKey = `pappa_draft_${chapter.id}_${questionIdx}`;
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      setInputText(saved);
    } else {
      setInputText("");
    }
  }, [chapterIdx, questionIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── BEFOREUNLOAD guard when inputText has content ──
  useEffect(() => {
    const handler = (e) => {
      if (inputText.trim()) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [inputText]);

  // Navigation guard helper
  const confirmIfUnsaved = (action) => {
    if (inputText.trim()) {
      const ok = window.confirm(
        "You have typed an answer that hasn't been submitted yet. Are you sure you want to leave this question? Your draft will be saved automatically."
      );
      if (!ok) return;
    }
    action();
  };

  const collectData = async (chId, qIdx, qText, answerLen) => {
    if (!consentGiven) return;
    try {
      await fetch("/api/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          chapterId: chId,
          questionIndex: qIdx,
          questionText: qText,
          answerLength: answerLen,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch {
      // Silent fail
    }
  };

  const submitAnswer = async () => {
    if (!inputText.trim()) return;
    const ans = inputText.trim();
    const key = `${chapter.id}_${questionIdx}`;
    const draftKey = `pappa_draft_${chapter.id}_${questionIdx}`;
    setAnswers(p => ({ ...p, [key]: ans }));
    setInputText("");
    localStorage.removeItem(draftKey);
    setLoading(true);
    setShowReply(false);
    collectData(chapter.id, questionIdx, question, ans.length); // fire-and-forget — don't delay AI response
    try {
      const msgs = [
        ...history,
        { role: "user", content: `Chapter: ${chapter.title}\nQuestion: "${question}"\nHis answer: "${ans}"` }
      ];
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: msgs, system: SYSTEM_PROMPT }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Thank you, Pappa. That means more than you know.";
      setAiReply(reply);
      setHistory(p => [
        ...p,
        { role: "user", content: `Chapter: ${chapter.title}\nQuestion: "${question}"\nAnswer: "${ans}"` },
        { role: "assistant", content: reply },
      ]);
    } catch {
      setAiReply("Thank you, Pappa. That means more than you know. Please continue when you're ready.");
    }
    setLoading(false);
    setShowReply(true);
  };

  const goNext = () => {
    setShowReply(false);
    setAiReply("");
    setInputText("");
    const nextQ = questionIdx + 1;
    if (nextQ < chapter.questions.length) {
      setQuestionIdx(nextQ);
    } else {
      const nextC = chapterIdx + 1;
      if (nextC < CHAPTERS.length) {
        setChapterIdx(nextC);
        setQuestionIdx(0);
      } else {
        setScreen("complete");
      }
    }
    setTimeout(() => textareaRef.current?.focus(), 200);
  };

  const buildCovenant = async () => {
    setBuildingCovenant(true);
    const allAnswers = CHAPTERS.flatMap(ch =>
      ch.questions.map((q, i) => {
        const ans = answers[`${ch.id}_${i}`];
        return ans ? `[${ch.title}]\nQ: ${q}\nA: ${ans}` : null;
      }).filter(Boolean)
    ).join("\n\n");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: `You are writing a personal legacy covenant for Phillip L. Bowers, an 89-year-old pastor and realtor, written entirely in his first person voice. Structure it with these sections: My Faith, Aleda, My Family, My Calling, My Wisdom, and My Charge to You. Write with dignity, warmth, and deep Christian faith. Include a personal charge at the end to his ten grandchildren. 500-700 words. Use section headers. This will be printed and kept by his family forever.`,
          messages: [{ role: "user", content: `Here are my interview answers. Please write my Legacy Covenant:\n\n${allAnswers}` }],
        }),
      });
      const data = await res.json();
      setCovenant(data.content?.[0]?.text || "");
    } catch {
      setCovenant("There was an error. Please try again.");
    }
    setBuildingCovenant(false);
  };

  // ── REVIEW SCREEN ─────────────────────────────────────
  if (screen === "review") {
    return (
      <div style={{
        minHeight: "100vh",
        background: `radial-gradient(ellipse at 30% 20%, #2A4A6B 0%, ${C.navyDeep} 60%, #080F1A 100%)`,
        fontFamily: "Georgia, 'Times New Roman', serif",
        paddingBottom: 60,
      }}>
        {/* Header */}
        <div style={{
          background: "rgba(0,0,0,0.3)",
          borderBottom: `1px solid rgba(212,160,23,0.2)`,
          padding: "20px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 100,
        }}>
          <button
            onClick={() => setScreen("welcome")}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: C.cream, fontSize: 17, fontFamily: "Georgia, serif",
              padding: "10px 20px", borderRadius: 10, cursor: "pointer",
            }}
          >
            ← Back
          </button>
          <div style={{ color: C.goldWarm, fontSize: 15, letterSpacing: 2, textTransform: "uppercase" }}>
            My Answers
          </div>
          <div style={{ color: C.warmGray, fontSize: 15 }}>
            {totalAnswered} of {totalQuestions}
          </div>
        </div>

        <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 20px" }}>

          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>✦</div>
            <h2 style={{ fontSize: 30, color: C.cream, fontWeight: "normal", margin: "0 0 8px" }}>
              Your Words, Pappa
            </h2>
            <p style={{ color: "#A8C4DC", fontSize: 16, fontStyle: "italic", margin: 0 }}>
              Every answer below is saved and will become part of your Legacy Covenant.
            </p>
          </div>

          {CHAPTERS.map((ch) => {
            const chapterAnswers = ch.questions.map((q, i) => ({
              question: q,
              answer: answers[`${ch.id}_${i}`] || null,
            }));
            const answeredCount = chapterAnswers.filter(a => a.answer).length;
            if (answeredCount === 0) return null;

            const isAleda = ch.id === "aleda";
            const accentColor = isAleda ? C.aleda : C.navy;
            const borderColor = isAleda ? "rgba(92,58,107,0.4)" : "rgba(27,58,92,0.3)";

            return (
              <div key={ch.id} style={{ marginBottom: 36 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: accentColor,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, color: C.goldPale, flexShrink: 0,
                  }}>
                    {ch.icon}
                  </div>
                  <div>
                    <div style={{ color: C.cream, fontSize: 20 }}>{ch.title}</div>
                    <div style={{ color: C.warmGray, fontSize: 14 }}>
                      {answeredCount} of {ch.questions.length} answered
                    </div>
                  </div>
                </div>

                {chapterAnswers.map(({ question, answer }, i) => {
                  if (!answer) return null;
                  return (
                    <div key={i} style={{
                      background: "rgba(255,255,255,0.06)",
                      border: `1px solid ${borderColor}`,
                      borderRadius: 14, padding: "22px 24px",
                      marginBottom: 14,
                    }}>
                      <p style={{
                        fontSize: 15, color: "#A8C4DC",
                        fontStyle: "italic", margin: "0 0 12px",
                        lineHeight: 1.6,
                        borderBottom: `1px solid rgba(255,255,255,0.08)`,
                        paddingBottom: 12,
                      }}>
                        {question}
                      </p>
                      <p style={{ fontSize: 18, color: C.cream, lineHeight: 1.75, margin: 0 }}>
                        {answer}
                      </p>
                    </div>
                  );
                })}
              </div>
            );
          })}

          <button
            onClick={() => setScreen("interview")}
            style={{
              width: "100%", padding: "22px",
              fontSize: 22, fontFamily: "Georgia, serif",
              background: `linear-gradient(135deg, ${C.gold}, ${C.goldWarm})`,
              color: C.white, border: "none", borderRadius: 14,
              cursor: "pointer", marginTop: 12,
              boxShadow: `0 8px 32px rgba(184,134,11,0.4)`,
            }}
          >
            Continue My Interview →
          </button>
        </div>
      </div>
    );
  }

  // ── WELCOME ────────────────────────────────────────────
  if (screen === "welcome") {
    return (
      <div style={{
        minHeight: "100vh",
        background: `radial-gradient(ellipse at 30% 20%, #2A4A6B 0%, ${C.navyDeep} 60%, #080F1A 100%)`,
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: "32px 24px",
        fontFamily: "'Georgia', 'Times New Roman', serif",
      }}>
        <div style={{ maxWidth: 560, width: "100%", textAlign: "center" }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 13, color: C.goldWarm, letterSpacing: 8, textTransform: "uppercase", marginBottom: 10 }}>
              A Gift From Lane
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "center" }}>
              <div style={{ height: 1, width: 60, background: `linear-gradient(to right, transparent, ${C.gold})` }} />
              <span style={{ color: C.goldWarm, fontSize: 28 }}>✦</span>
              <div style={{ height: 1, width: 60, background: `linear-gradient(to left, transparent, ${C.gold})` }} />
            </div>
          </div>

          <h1 style={{ fontSize: "clamp(40px, 9vw, 62px)", color: C.cream, fontWeight: "normal", lineHeight: 1.1, marginBottom: 8 }}>
            The Legacy
          </h1>
          <h2 style={{ fontSize: "clamp(40px, 9vw, 62px)", color: C.goldWarm, fontWeight: "bold", lineHeight: 1.1, marginBottom: 32 }}>
            Interview
          </h2>

          <p style={{ fontSize: 19, color: "#A8C4DC", lineHeight: 1.75, marginBottom: 8 }}>
            Six chapters. Your voice. Your life.
          </p>
          <p style={{ fontSize: 16, color: C.warmGray, fontStyle: "italic", lineHeight: 1.7, marginBottom: 40 }}>
            "Even to your old age and gray hairs I am He who will sustain you."<br/>— Isaiah 46:4
          </p>

          {/* Chapter pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 44 }}>
            {CHAPTERS.map(ch => (
              <div key={ch.id} style={{
                padding: "8px 18px", borderRadius: 24,
                border: `1px solid rgba(212,160,23,0.3)`,
                background: "rgba(255,255,255,0.06)",
                color: "#C8D8E8", fontSize: 16,
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{ color: ch.id === "aleda" ? "#C8A4D8" : C.goldWarm }}>{ch.icon}</span>
                {ch.title}
              </div>
            ))}
          </div>

          {/* Consent checkbox */}
          <div style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(212,160,23,0.2)",
            borderRadius: 12, padding: "20px 24px",
            marginBottom: 24, textAlign: "left",
          }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 14, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={e => setConsentGiven(e.target.checked)}
                style={{ width: 22, height: 22, marginTop: 2, accentColor: C.goldWarm, flexShrink: 0, cursor: "pointer" }}
              />
              <span style={{ color: "#A8C4DC", fontSize: 16, lineHeight: 1.65 }}>
                <strong style={{ color: C.cream }}>Optional:</strong> You may use my anonymized answers — never my name — to help improve this experience for other seniors. I can complete this privately at any time.
              </span>
            </label>
          </div>

          {/* Primary CTA — label changes if answers exist */}
          <button
            onClick={() => setScreen("interview")}
            style={{
              width: "100%", padding: "22px 32px",
              fontSize: 24, fontFamily: "Georgia, serif",
              background: `linear-gradient(135deg, ${C.gold}, ${C.goldWarm})`,
              color: C.white, border: "none", borderRadius: 14,
              cursor: "pointer", letterSpacing: 0.5,
              boxShadow: `0 8px 32px rgba(184,134,11,0.4)`,
              marginBottom: hasAnyAnswers ? 14 : 0,
            }}
          >
            {hasAnyAnswers ? "Continue My Interview →" : "I'm Ready — Let's Begin →"}
          </button>

          {/* Review answers — only visible when answers exist */}
          {hasAnyAnswers && (
            <button
              onClick={() => setScreen("review")}
              style={{
                width: "100%", padding: "18px 32px",
                fontSize: 20, fontFamily: "Georgia, serif",
                background: "transparent",
                color: C.goldWarm,
                border: `2px solid rgba(212,160,23,0.4)`,
                borderRadius: 14, cursor: "pointer",
              }}
            >
              ✦ Review My Answers ({totalAnswered} saved)
            </button>
          )}

          <p style={{ color: C.warmGray, fontSize: 15, marginTop: 16, fontStyle: "italic" }}>
            Take your time. There is no rush. Your words matter.
          </p>
        </div>
      </div>
    );
  }

  // ── COMPLETE / COVENANT ───────────────────────────────
  if (screen === "complete") {
    return (
      <div style={{
        minHeight: "100vh",
        background: `radial-gradient(ellipse at top, #2A1F14 0%, ${C.navyDeep} 100%)`,
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "48px 24px", fontFamily: "Georgia, serif",
      }}>
        <div style={{ maxWidth: 680, width: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>❧</div>
            <h2 style={{ fontSize: 40, color: C.cream, fontWeight: "normal", marginBottom: 12 }}>
              Pappa, you did it.
            </h2>
            <p style={{ fontSize: 20, color: "#A8C4DC", lineHeight: 1.7, maxWidth: 480, margin: "0 auto 8px" }}>
              {totalAnswered} answers across six chapters of your life.
            </p>
            <p style={{ fontSize: 18, color: C.warmGray, fontStyle: "italic" }}>
              Your family will keep these words forever.
            </p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 40 }}>
            {CHAPTERS.map(ch => {
              const count = ch.questions.filter((_, i) => answers[`${ch.id}_${i}`]).length;
              return (
                <div key={ch.id} style={{
                  padding: "10px 20px", borderRadius: 28,
                  background: count > 0 ? (ch.id === "aleda" ? "rgba(92,58,107,0.6)" : "rgba(27,58,92,0.6)") : "rgba(255,255,255,0.07)",
                  border: `1px solid ${count > 0 ? (ch.id === "aleda" ? C.aleda : C.gold) : "rgba(255,255,255,0.15)"}`,
                  color: C.cream, fontSize: 16,
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span>{ch.icon}</span> {ch.title}
                  <span style={{ color: C.goldWarm, fontSize: 14 }}>{count}/{ch.questions.length}</span>
                </div>
              );
            })}
          </div>

          {/* Review on complete screen */}
          <button
            onClick={() => setScreen("review")}
            style={{
              width: "100%", padding: "16px 32px",
              fontSize: 19, fontFamily: "Georgia, serif",
              background: "transparent", color: C.goldWarm,
              border: `2px solid rgba(212,160,23,0.4)`,
              borderRadius: 14, cursor: "pointer", marginBottom: 24,
            }}
          >
            ✦ Review All My Answers
          </button>

          {!covenant && !buildingCovenant && (
            <div style={{
              background: "rgba(255,255,255,0.07)", borderRadius: 18,
              padding: "40px 44px", border: `1px solid rgba(212,160,23,0.35)`,
              textAlign: "center", marginBottom: 24,
            }}>
              <div style={{ fontSize: 32, marginBottom: 16, color: C.goldWarm }}>✦</div>
              <p style={{ color: C.cream, fontSize: 20, lineHeight: 1.75, marginBottom: 28 }}>
                Ready to turn your answers into a Legacy Covenant? Your words will become a document your family can print, frame, and keep for generations.
              </p>
              <button
                onClick={buildCovenant}
                style={{
                  padding: "20px 48px", fontSize: 22, fontFamily: "Georgia, serif",
                  background: `linear-gradient(135deg, ${C.gold}, ${C.goldWarm})`,
                  color: C.white, border: "none", borderRadius: 12,
                  cursor: "pointer", boxShadow: `0 6px 24px rgba(184,134,11,0.4)`,
                }}
              >
                ✦ Create My Legacy Covenant
              </button>
            </div>
          )}

          {buildingCovenant && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ fontSize: 40, color: C.goldWarm, marginBottom: 20 }}>✦</div>
              <p style={{ color: "#A8C4DC", fontSize: 22, fontStyle: "italic" }}>
                Weaving your covenant together, Pappa...
              </p>
            </div>
          )}

          {covenant && (
            <div>
              <div style={{
                background: C.paper, borderRadius: 14,
                padding: "52px 56px", border: `3px solid ${C.gold}`,
                marginBottom: 28, lineHeight: 2,
                fontSize: 19, color: C.ink,
                whiteSpace: "pre-wrap", fontFamily: "Georgia, serif",
                boxShadow: "0 8px 40px rgba(0,0,0,0.3)",
              }}>
                {covenant}
              </div>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <button
                  onClick={() => {
                    const el = document.createElement("a");
                    el.href = "data:text/plain;charset=utf-8," + encodeURIComponent(covenant);
                    el.download = "Pappa_Legacy_Covenant.txt";
                    el.click();
                  }}
                  style={{
                    flex: 1, minWidth: 200, padding: "18px 24px",
                    fontSize: 19, fontFamily: "Georgia, serif",
                    background: C.gold, color: C.white,
                    border: "none", borderRadius: 10, cursor: "pointer",
                  }}
                >
                  ↓ Save My Covenant
                </button>
                <button
                  onClick={() => window.print()}
                  style={{
                    flex: 1, minWidth: 200, padding: "18px 24px",
                    fontSize: 19, fontFamily: "Georgia, serif",
                    background: C.navy, color: C.white,
                    border: "none", borderRadius: 10, cursor: "pointer",
                  }}
                >
                  🖨 Print for My Family
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── INTERVIEW ─────────────────────────────────────────
  const isAleda = chapter.id === "aleda";
  const accentColor = isAleda ? C.aleda : C.navy;
  const accentGold = isAleda ? "#9B6BB5" : C.goldWarm;
  const overallProgress = (totalAnswered / totalQuestions) * 100;

  return (
    <div style={{ minHeight: "100vh", background: chapter.bg, fontFamily: "Georgia, 'Times New Roman', serif" }}>

      {/* Top bar */}
      <div style={{
        background: accentColor, padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 64, position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {CHAPTERS.map((ch, i) => {
            const done = i < chapterIdx;
            const active = i === chapterIdx;
            return (
              <div key={ch.id} title={ch.title}
                style={{
                  width: active ? 36 : 10, height: 10, borderRadius: 5,
                  background: done ? C.goldWarm : active ? C.goldPale : "rgba(255,255,255,0.25)",
                  transition: "all 0.4s ease",
                  cursor: done ? "pointer" : "default",
                }}
                onClick={() => done && confirmIfUnsaved(() => { setChapterIdx(i); setQuestionIdx(0); setShowReply(false); })}
              />
            );
          })}
        </div>
        {/* My Answers button in top bar */}
        {hasAnyAnswers && (
          <button
            onClick={() => confirmIfUnsaved(() => setScreen("review"))}
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.25)",
              color: C.goldPale, fontSize: 14, fontFamily: "Georgia, serif",
              padding: "7px 14px", borderRadius: 8, cursor: "pointer",
            }}
          >
            My Answers
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: C.mist }}>
        <div style={{
          height: "100%", width: `${overallProgress}%`,
          background: `linear-gradient(to right, ${C.gold}, ${C.goldWarm})`,
          transition: "width 0.5s ease",
        }} />
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "36px 24px 80px" }}>

        {/* Chapter header */}
        <div style={{ marginBottom: 32, display: "flex", alignItems: "flex-start", gap: 18 }}>
          <div style={{
            width: 60, height: 60, borderRadius: "50%", background: accentColor,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, color: C.goldPale, flexShrink: 0,
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          }}>
            {chapter.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: C.warmGray, letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>
              Chapter {chapterIdx + 1} of {CHAPTERS.length}
            </div>
            <h2 style={{ fontSize: 30, color: accentColor, margin: "0 0 6px", lineHeight: 1 }}>
              {chapter.title}
            </h2>
            <p style={{ fontSize: 14, color: C.warmGray, fontStyle: "italic", margin: 0, lineHeight: 1.6 }}>
              {chapter.verse}
            </p>
          </div>
          <div style={{
            fontSize: 15, color: C.warmGray,
            background: "rgba(0,0,0,0.06)",
            padding: "6px 14px", borderRadius: 20, flexShrink: 0, marginTop: 4,
          }}>
            {questionIdx + 1} / {chapter.questions.length}
          </div>
        </div>

        {/* Question card */}
        <div style={{
          background: C.paper, borderRadius: 18, padding: "36px 40px",
          border: `2px solid ${isAleda ? "rgba(92,58,107,0.2)" : "rgba(27,58,92,0.12)"}`,
          boxShadow: "0 4px 28px rgba(0,0,0,0.07)", marginBottom: 24,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: 0, right: 0, width: 80, height: 80,
            background: `linear-gradient(225deg, ${isAleda ? "rgba(92,58,107,0.08)" : "rgba(27,58,92,0.06)"} 0%, transparent 70%)`,
            borderRadius: "0 18px 0 80px",
          }} />
          <p style={{ fontSize: "clamp(20px, 3vw, 26px)", color: C.ink, lineHeight: 1.65, margin: 0 }}>
            {question}
          </p>
        </div>

        {/* AI reply */}
        {(loading || showReply) && (
          <div ref={replyRef} style={{
            borderLeft: `4px solid ${accentGold}`,
            background: isAleda ? "rgba(92,58,107,0.07)" : "rgba(27,58,92,0.06)",
            borderRadius: "0 14px 14px 0",
            padding: "22px 26px", marginBottom: 24,
          }}>
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 18, color: accentGold }}>✦</span>
                <span style={{ color: C.warmGray, fontSize: 19, fontStyle: "italic" }}>Listening...</span>
              </div>
            ) : (
              <p style={{ fontSize: 20, color: accentColor, lineHeight: 1.8, margin: 0 }}>{aiReply}</p>
            )}
          </div>
        )}

        {/* Text input */}
        {!showReply && !loading && (
          <div>
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Speak from your heart. Take all the time you need."
              rows={6}
              style={{
                width: "100%", padding: "22px 26px", fontSize: 20, lineHeight: 1.75,
                fontFamily: "Georgia, serif", color: C.ink, background: C.paper,
                border: `2px solid ${isAleda ? "rgba(92,58,107,0.25)" : C.mist}`,
                borderRadius: 14, resize: "vertical",
                boxSizing: "border-box", outline: "none",
                boxShadow: "inset 0 2px 8px rgba(0,0,0,0.03)",
                marginBottom: 14, transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = accentGold}
              onBlur={e => e.target.style.borderColor = isAleda ? "rgba(92,58,107,0.25)" : C.mist}
            />
            <button
              onClick={submitAnswer}
              disabled={!inputText.trim()}
              style={{
                width: "100%", padding: "22px", fontSize: 22, fontFamily: "Georgia, serif",
                background: inputText.trim()
                  ? `linear-gradient(135deg, ${accentColor}, ${isAleda ? "#7A4A8A" : C.softBlue})`
                  : C.mist,
                color: inputText.trim() ? C.white : C.warmGray,
                border: "none", borderRadius: 12,
                cursor: inputText.trim() ? "pointer" : "not-allowed",
                transition: "all 0.2s",
                boxShadow: inputText.trim() ? "0 4px 20px rgba(0,0,0,0.15)" : "none",
              }}
            >
              Share My Answer →
            </button>
          </div>
        )}

        {/* After-reply nav */}
        {showReply && !loading && (
          <div style={{ display: "flex", gap: 14, position: "relative" }}>
            <button
              onClick={() => { setShowReply(false); setAiReply(""); }}
              style={{
                flex: 1, padding: "18px", fontSize: 19, fontFamily: "Georgia, serif",
                background: C.paper, color: accentColor,
                border: `2px solid ${accentColor}`, borderRadius: 12, cursor: "pointer",
              }}
            >
              ← Add More
            </button>
            <div style={{position:"absolute",top:-24,left:0,fontSize:13,color:"#6b8e6b",fontStyle:"italic"}}>Your answer is saved</div>
            <button
              onClick={goNext}
              style={{
                flex: 2, padding: "18px", fontSize: 19, fontFamily: "Georgia, serif",
                background: accentColor, color: C.white,
                border: "none", borderRadius: 12, cursor: "pointer",
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              }}
            >
              {questionIdx < chapter.questions.length - 1
                ? "Next Question →"
                : chapterIdx < CHAPTERS.length - 1
                ? `Continue to ${CHAPTERS[chapterIdx + 1].title} →`
                : "Complete My Legacy →"}
            </button>
          </div>
        )}

        {/* Dot progress */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 44 }}>
          {chapter.questions.map((_, i) => (
            <div key={i} style={{
              height: 8, borderRadius: 4,
              width: i === questionIdx ? 28 : 8,
              background: i < questionIdx ? accentGold : i === questionIdx ? accentColor : C.mist,
              transition: "all 0.3s ease",
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}
