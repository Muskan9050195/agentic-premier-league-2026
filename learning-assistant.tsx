import { useState, useRef, useEffect } from "react";

const GEMINI_KEY = "AIzaSyCYuzqeRogbJYcud8DE33MqjrqVpQom_JI";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;

const COLORS = {
  bg: "#0d0f1e", card: "#151829", border: "#1f2a45",
  purple: "#7c3aed", pink: "#ec4899", blue: "#3b82f6",
  green: "#10b981", yellow: "#f59e0b", text: "#f1f5f9",
  muted: "#64748b", gradient: "linear-gradient(135deg, #7c3aed, #ec4899)",
};

const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const TOPICS = ["Artificial Intelligence", "Machine Learning", "Python", "Cricket Analytics", "Cloud Computing", "Data Science", "Web Development", "Mathematics"];
const LEVEL_PROMPTS = {
  Beginner: "Use very simple language, analogies, and avoid jargon. Explain like I'm 12 years old. Keep it short and fun.",
  Intermediate: "Use moderate technical depth. Assume basic knowledge. Use examples and some terminology.",
  Advanced: "Use technical depth, proper terminology, edge cases, and go deep into the concept.",
};

async function callGemini(systemPrompt, messages) {
  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: messages.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }))
    })
  });
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, couldn't respond. Try again.";
}

function ProgressBar({ value, color }) {
  return (
    <div style={{ background: "#1a2235", borderRadius: 4, height: 6, overflow: "hidden" }}>
      <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.8s ease" }} />
    </div>
  );
}

function Badge({ label, color }) {
  return (
    <span style={{ background: `${color}22`, color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, letterSpacing: 0.5, border: `1px solid ${color}44`, textTransform: "uppercase" }}>
      {label}
    </span>
  );
}

export default function App() {
  const [screen, setScreen] = useState("onboard");
  const [topic, setTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [understood, setUnderstood] = useState(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const finalTopic = customTopic.trim() || topic;

  const systemPrompt = `You are AdaptLearn AI, a world-class personalized tutor powered by Google Gemini.
The student is learning: "${finalTopic}"
Their current level: ${level}
Instruction style: ${LEVEL_PROMPTS[level]}

Rules:
- Teach in small digestible chunks (max 150 words per response)
- End EVERY response with exactly ONE follow-up question to check understanding
- If student didn't understand, simplify and use a different analogy
- If they understood, go slightly deeper or move to the next concept
- Be encouraging and warm
- Format key terms in **bold**`;

  async function startLearning() {
    if (!finalTopic) return;
    setScreen("learn");
    setLoading(true);
    const intro = `Hi! I want to learn about "${finalTopic}". I'm a ${level}. Please start teaching me from the very beginning.`;
    const msgs = [{ role: "user", content: intro }];
    const reply = await callGemini(systemPrompt, msgs);
    setMessages([{ role: "user", content: intro, hidden: true }, { role: "assistant", content: reply }]);
    setLoading(false);
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);
    setUnderstood(null);
    const reply = await callGemini(systemPrompt, newMsgs.filter(m => !m.hidden));
    setMessages([...newMsgs, { role: "assistant", content: reply }]);
    setXp(x => x + 10);
    setStreak(s => s + 1);
    setLoading(false);
  }

  async function handleUnderstood(yes) {
    setUnderstood(yes);
    const msg = yes ? "Yes, I understood! Please continue to the next concept." : "I didn't understand. Can you explain it differently with a simpler example?";
    if (yes) { setXp(x => x + 20); setStreak(s => s + 1); } else { setStreak(0); }
    const userMsg = { role: "user", content: msg };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setLoading(true);
    setUnderstood(null);
    const reply = await callGemini(systemPrompt, newMsgs.filter(m => !m.hidden));
    setMessages([...newMsgs, { role: "assistant", content: reply }]);
    setLoading(false);
  }

  async function generateQuiz() {
    setQuizOpen(true);
    setQuizLoading(true);
    setQuizData(null);
    setQuizAnswer(null);
    const quizSystem = `Generate a multiple choice quiz question about "${finalTopic}" for a ${level} student. Return ONLY valid JSON with no markdown, no backticks, no extra text: {"question":"...","options":["A) ...","B) ...","C) ...","D) ..."],"answer":"A","explanation":"..."}`;
    try {
      const text = await callGemini(quizSystem, [{ role: "user", content: "Generate now." }]);
      const clean = text.replace(/```json|```/g, "").trim();
      setQuizData(JSON.parse(clean));
    } catch {
      setQuizData({ question: `What is the main purpose of ${finalTopic}?`, options: ["A) Error — tap retry", "B) ...", "C) ...", "D) ..."], answer: "A", explanation: "Please try again." });
    }
    setQuizLoading(false);
  }

  function checkAnswer(opt) {
    setQuizAnswer(opt);
    if (opt.startsWith(quizData.answer)) { setXp(x => x + 30); setStreak(s => s + 1); }
    else { setStreak(0); }
  }

  const levelColor = level === "Beginner" ? COLORS.green : level === "Intermediate" ? COLORS.yellow : COLORS.pink;

  // ONBOARDING
  if (screen === "onboard") return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "system-ui,sans-serif", color: COLORS.text, padding: "30px 20px" }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}input,button{font-family:inherit}`}</style>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🧠</div>
          <div style={{ fontSize: 26, fontWeight: 900, background: COLORS.gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AdaptLearn AI</div>
          <div style={{ color: COLORS.muted, fontSize: 13, marginTop: 6 }}>Powered by Google Gemini ✨ · Learns at YOUR pace</div>
        </div>

        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <div style={{ color: COLORS.muted, fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 12, textTransform: "uppercase" }}>What do you want to learn?</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            {TOPICS.map(t => (
              <button key={t} onClick={() => { setTopic(t); setCustomTopic(""); }} style={{
                padding: "7px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontWeight: 600,
                background: topic === t && !customTopic ? `${COLORS.purple}33` : "transparent",
                border: `1px solid ${topic === t && !customTopic ? COLORS.purple : COLORS.border}`,
                color: topic === t && !customTopic ? COLORS.purple : COLORS.muted,
              }}>{t}</button>
            ))}
          </div>
          <input value={customTopic} onChange={e => { setCustomTopic(e.target.value); setTopic(""); }}
            placeholder="Or type your own topic..."
            style={{ width: "100%", background: "#0d0f1e", border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "10px 14px", color: COLORS.text, fontSize: 14, outline: "none" }} />
        </div>

        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20, marginBottom: 24 }}>
          <div style={{ color: COLORS.muted, fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 12, textTransform: "uppercase" }}>Your current level</div>
          <div style={{ display: "flex", gap: 10 }}>
            {LEVELS.map(l => {
              const c = l === "Beginner" ? COLORS.green : l === "Intermediate" ? COLORS.yellow : COLORS.pink;
              return (
                <button key={l} onClick={() => setLevel(l)} style={{
                  flex: 1, padding: "12px 8px", borderRadius: 12, cursor: "pointer", fontWeight: 700, fontSize: 13,
                  background: level === l ? `${c}22` : "transparent",
                  border: `2px solid ${level === l ? c : COLORS.border}`,
                  color: level === l ? c : COLORS.muted,
                }}>{l === "Beginner" ? "🌱" : l === "Intermediate" ? "🔥" : "⚡"}<br />{l}</button>
              );
            })}
          </div>
        </div>

        <button onClick={startLearning} disabled={!finalTopic} style={{
          width: "100%", padding: 16, borderRadius: 14, border: "none", cursor: finalTopic ? "pointer" : "default",
          background: finalTopic ? COLORS.gradient : COLORS.border,
          color: "#fff", fontSize: 16, fontWeight: 800,
        }}>🚀 Start Learning with Gemini</button>
      </div>
    </div>
  );

  // LEARN SCREEN
  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "system-ui,sans-serif", color: COLORS.text, display: "flex", flexDirection: "column" }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}input,button{font-family:inherit}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#1f2a45;border-radius:2px}@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}`}</style>

      {/* Header */}
      <div style={{ background: COLORS.card, borderBottom: `1px solid ${COLORS.border}`, padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <button onClick={() => setScreen("onboard")} style={{ background: "none", border: "none", color: COLORS.muted, cursor: "pointer", fontSize: 18 }}>←</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800 }}>🧠 {finalTopic}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
              <Badge label={level} color={levelColor} />
              <Badge label={`⚡ ${xp} XP`} color={COLORS.purple} />
              <Badge label={`🔥 ${streak} streak`} color={COLORS.yellow} />
            </div>
          </div>
          <button onClick={generateQuiz} style={{ background: `${COLORS.pink}22`, border: `1px solid ${COLORS.pink}44`, color: COLORS.pink, borderRadius: 10, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            📝 Quiz Me
          </button>
        </div>
        <ProgressBar value={Math.min(xp, 100)} color={COLORS.purple} />
        <div style={{ color: COLORS.muted, fontSize: 10, marginTop: 4 }}>{xp}/100 XP to next level</div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
        {messages.filter(m => !m.hidden).map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            {m.role === "assistant" && (
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: COLORS.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, marginRight: 8, flexShrink: 0 }}>🧠</div>
            )}
            <div style={{
              maxWidth: "80%",
              background: m.role === "user" ? COLORS.gradient : COLORS.card,
              border: m.role === "assistant" ? `1px solid ${COLORS.border}` : "none",
              borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              padding: "12px 16px", color: COLORS.text, fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap"
            }}>
              {m.content.split(/(\*\*.*?\*\*)/).map((part, j) =>
                part.startsWith("**") ? <strong key={j} style={{ color: COLORS.yellow }}>{part.slice(2, -2)}</strong> : part
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: COLORS.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🧠</div>
            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: "18px 18px 18px 4px", padding: "12px 16px", display: "flex", gap: 6, alignItems: "center" }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.purple, animation: "bounce 1s ease infinite", animationDelay: `${i*0.2}s` }} />)}
            </div>
          </div>
        )}

        {!loading && messages.length > 1 && understood === null && (
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button onClick={() => handleUnderstood(false)} style={{ padding: "8px 18px", borderRadius: 20, border: `1px solid #e6394644`, background: "transparent", color: "#e63946", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              😕 Didn't get it
            </button>
            <button onClick={() => handleUnderstood(true)} style={{ padding: "8px 18px", borderRadius: 20, border: `1px solid ${COLORS.green}44`, background: `${COLORS.green}22`, color: COLORS.green, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              ✅ Got it! Continue
            </button>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "12px 16px", background: COLORS.card, borderTop: `1px solid ${COLORS.border}`, display: "flex", gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Ask a question or say what confused you..."
          style={{ flex: 1, background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 24, padding: "10px 16px", color: COLORS.text, fontSize: 14, outline: "none" }} />
        <button onClick={sendMessage} disabled={loading || !input.trim()} style={{
          width: 42, height: 42, borderRadius: "50%", border: "none", cursor: "pointer",
          background: loading || !input.trim() ? COLORS.border : COLORS.gradient,
          fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
        }}>➤</button>
      </div>

      {/* QUIZ OVERLAY */}
      {quizOpen && (
        <div style={{ position: "fixed", inset: 0, background: "#000000cc", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 100 }}>
          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: 24, maxWidth: 440, width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>📝 Gemini Quiz</div>
              <button onClick={() => setQuizOpen(false)} style={{ background: "none", border: "none", color: COLORS.muted, cursor: "pointer", fontSize: 20 }}>✕</button>
            </div>

            {quizLoading && <div style={{ textAlign: "center", color: COLORS.muted, padding: 40 }}>Gemini is generating your question... 🧠</div>}

            {quizData && !quizLoading && (
              <>
                <div style={{ color: COLORS.text, fontSize: 15, lineHeight: 1.6, marginBottom: 16, fontWeight: 600 }}>{quizData.question}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {quizData.options.map((opt, i) => {
                    const isCorrect = opt.startsWith(quizData.answer);
                    const isSelected = quizAnswer === opt;
                    const revealed = quizAnswer !== null;
                    return (
                      <button key={i} onClick={() => !quizAnswer && checkAnswer(opt)} style={{
                        padding: "12px 16px", borderRadius: 12, fontSize: 14, textAlign: "left", cursor: quizAnswer ? "default" : "pointer", fontWeight: isSelected || (revealed && isCorrect) ? 700 : 400,
                        border: `1px solid ${!revealed ? COLORS.border : isCorrect ? COLORS.green : isSelected ? "#e63946" : COLORS.border}`,
                        background: !revealed ? "transparent" : isCorrect ? `${COLORS.green}22` : isSelected ? "#e6394622" : "transparent",
                        color: !revealed ? COLORS.text : isCorrect ? COLORS.green : isSelected ? "#e63946" : COLORS.muted,
                        transition: "all 0.3s"
                      }}>
                        {opt} {revealed && isCorrect ? "✅" : revealed && isSelected && !isCorrect ? "❌" : ""}
                      </button>
                    );
                  })}
                </div>
                {quizAnswer && (
                  <div style={{ marginTop: 16, background: `${COLORS.blue}11`, border: `1px solid ${COLORS.blue}33`, borderRadius: 10, padding: 14 }}>
                    <div style={{ color: COLORS.blue, fontWeight: 700, fontSize: 13, marginBottom: 4 }}>💡 Explanation</div>
                    <div style={{ color: COLORS.text, fontSize: 13, lineHeight: 1.5 }}>{quizData.explanation}</div>
                    <button onClick={generateQuiz} style={{ marginTop: 12, padding: "8px 20px", borderRadius: 20, border: "none", background: COLORS.gradient, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                      Next Question →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
