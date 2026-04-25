import { useState, useRef, useEffect } from "react";

const COLORS = {
  bg: "#0a0e1a",
  card: "#111827",
  border: "#1e2d45",
  accent: "#e63946",
  gold: "#f4a261",
  blue: "#457b9d",
  green: "#2a9d8f",
  text: "#e8eaf0",
  muted: "#6b7a99",
};

const zones = [
  { id: "A", name: "North Stand", crowd: 92, wait: 18, status: "high" },
  { id: "B", name: "South Gate", crowd: 45, wait: 4, status: "low" },
  { id: "C", name: "East Pavilion", crowd: 73, wait: 11, status: "medium" },
  { id: "D", name: "West Block", crowd: 61, wait: 7, status: "medium" },
  { id: "E", name: "VIP Lounge", crowd: 38, wait: 2, status: "low" },
  { id: "F", name: "Food Court", crowd: 88, wait: 22, status: "high" },
];

const alerts = [
  { id: 1, type: "warning", msg: "North Stand at 92% — divert via Gate 7", time: "2m ago" },
  { id: 2, type: "info", msg: "Food Court wait reduced — counter 4 reopened", time: "5m ago" },
  { id: 3, type: "success", msg: "Emergency exit B3 now clear", time: "9m ago" },
];

function CrowdBar({ value, status }) {
  const color = status === "high" ? COLORS.accent : status === "medium" ? COLORS.gold : COLORS.green;
  return (
    <div style={{ background: "#1a2235", borderRadius: 4, height: 8, overflow: "hidden" }}>
      <div
        style={{
          width: `${value}%`,
          height: "100%",
          background: color,
          borderRadius: 4,
          transition: "width 1s ease",
          boxShadow: `0 0 8px ${color}88`,
        }}
      />
    </div>
  );
}

function ZoneCard({ zone }) {
  const statusColor = zone.status === "high" ? COLORS.accent : zone.status === "medium" ? COLORS.gold : COLORS.green;
  return (
    <div
      style={{
        background: COLORS.card,
        border: `1px solid ${COLORS.border}`,
        borderLeft: `3px solid ${statusColor}`,
        borderRadius: 10,
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: COLORS.text, fontWeight: 700, fontSize: 14 }}>{zone.name}</span>
        <span
          style={{
            background: `${statusColor}22`,
            color: statusColor,
            fontSize: 10,
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: 20,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {zone.status}
        </span>
      </div>
      <CrowdBar value={zone.crowd} status={zone.status} />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: COLORS.muted, fontSize: 12 }}>Crowd: <b style={{ color: COLORS.text }}>{zone.crowd}%</b></span>
        <span style={{ color: COLORS.muted, fontSize: 12 }}>Wait: <b style={{ color: COLORS.text }}>{zone.wait} min</b></span>
      </div>
    </div>
  );
}

function Dashboard() {
  const totalAttendees = 47820;
  const avgWait = Math.round(zones.reduce((s, z) => s + z.wait, 0) / zones.length);
  const highZones = zones.filter((z) => z.status === "high").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        {[
          { label: "Attendees", value: totalAttendees.toLocaleString(), icon: "👥", color: COLORS.blue },
          { label: "Avg Wait", value: `${avgWait} min`, icon: "⏱", color: COLORS.gold },
          { label: "Hot Zones", value: highZones, icon: "🔥", color: COLORS.accent },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12,
              padding: "16px 12px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 22 }}>{stat.icon}</div>
            <div style={{ color: stat.color, fontSize: 22, fontWeight: 800, lineHeight: 1.2 }}>{stat.value}</div>
            <div style={{ color: COLORS.muted, fontSize: 11, marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      <div>
        <div style={{ color: COLORS.muted, fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 10, textTransform: "uppercase" }}>
          Live Alerts
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {alerts.map((a) => {
            const color = a.type === "warning" ? COLORS.accent : a.type === "info" ? COLORS.blue : COLORS.green;
            const icon = a.type === "warning" ? "⚠️" : a.type === "info" ? "ℹ️" : "✅";
            return (
              <div
                key={a.id}
                style={{
                  background: `${color}11`,
                  border: `1px solid ${color}44`,
                  borderRadius: 8,
                  padding: "10px 14px",
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                }}
              >
                <span style={{ fontSize: 14 }}>{icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: COLORS.text, fontSize: 13 }}>{a.msg}</div>
                  <div style={{ color: COLORS.muted, fontSize: 11, marginTop: 2 }}>{a.time}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Zones */}
      <div>
        <div style={{ color: COLORS.muted, fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 10, textTransform: "uppercase" }}>
          Zone Status
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {zones.map((z) => <ZoneCard key={z.id} zone={z} />)}
        </div>
      </div>
    </div>
  );
}

function ChatBot() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm your StadiumAI assistant 🏟️ Ask me about wait times, directions, food stalls, or anything about your experience today!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const GEMINI_KEY = "AIzaSyCYuzqeRogbJYcud8DE33MqjrqVpQom_JI";
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;

  const systemPrompt = `You are StadiumAI, an intelligent assistant for a large cricket stadium hosting an IPL match powered by Google Gemini.
You help attendees with:
- Finding shortest queues and wait times (Food Court: 22 min, North Stand: 18 min, East Pavilion: 11 min, West Block: 7 min, South Gate: 4 min, VIP Lounge: 2 min)
- Navigation and directions inside the stadium
- Crowd density info (North Stand: 92%, Food Court: 88%, East Pavilion: 73%, West Block: 61%, South Gate: 45%, VIP Lounge: 38%)
- Real-time alerts (North Stand is congested — recommend Gate 7, Food Court counter 4 just reopened)
- General stadium info, facilities, safety exits

Be concise, friendly, and helpful. Use emojis sparingly. Always give a specific actionable recommendation.`;

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: newMessages.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
        }),
      });
      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process that.";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Connection error. Please try again." }]);
    }
    setLoading(false);
  }

  const suggestions = ["Shortest food queue?", "Where's gate 7?", "Is North Stand crowded?", "Nearest restroom?"];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 200px)", minHeight: 400 }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingBottom: 12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div
              style={{
                maxWidth: "80%",
                background: m.role === "user" ? COLORS.accent : COLORS.card,
                border: m.role === "assistant" ? `1px solid ${COLORS.border}` : "none",
                borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                padding: "10px 14px",
                color: COLORS.text,
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 5, padding: "10px 14px" }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: COLORS.muted,
                  animation: "pulse 1.2s ease-in-out infinite",
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => setInput(s)}
              style={{
                background: "transparent",
                border: `1px solid ${COLORS.border}`,
                borderRadius: 20,
                padding: "5px 12px",
                color: COLORS.muted,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask anything about the stadium..."
          style={{
            flex: 1,
            background: COLORS.card,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 24,
            padding: "10px 18px",
            color: COLORS.text,
            fontSize: 14,
            outline: "none",
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            background: loading || !input.trim() ? COLORS.border : COLORS.accent,
            border: "none",
            borderRadius: "50%",
            width: 42,
            height: 42,
            cursor: loading || !input.trim() ? "default" : "pointer",
            fontSize: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}

function Navigation() {
  const gates = [
    { id: "Gate 1", status: "Open", crowd: "Low", time: "2 min walk", color: COLORS.green },
    { id: "Gate 3", status: "Open", crowd: "Medium", time: "4 min walk", color: COLORS.gold },
    { id: "Gate 5", status: "Congested", crowd: "High", time: "12 min walk", color: COLORS.accent },
    { id: "Gate 7", status: "Open", crowd: "Low", time: "3 min walk", color: COLORS.green },
    { id: "Gate 9", status: "Staff Only", crowd: "—", time: "—", color: COLORS.muted },
  ];
  const facilities = [
    { name: "Food Court A", icon: "🍔", wait: "22 min", tip: "Try Section B — only 8 min" },
    { name: "Restrooms (North)", icon: "🚻", wait: "5 min", tip: "Section C is closer & less busy" },
    { name: "First Aid", icon: "🏥", wait: "Immediate", tip: "Near Gate 3 entrance" },
    { name: "ATM", icon: "💳", wait: "None", tip: "2 machines near VIP entrance" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ color: COLORS.muted, fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 10, textTransform: "uppercase" }}>Gates</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {gates.map((g) => (
            <div key={g.id} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: g.color, boxShadow: `0 0 6px ${g.color}` }} />
                <div>
                  <div style={{ color: COLORS.text, fontWeight: 600, fontSize: 14 }}>{g.id}</div>
                  <div style={{ color: COLORS.muted, fontSize: 12 }}>{g.time}</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: g.color, fontSize: 12, fontWeight: 700 }}>{g.status}</div>
                <div style={{ color: COLORS.muted, fontSize: 12 }}>Crowd: {g.crowd}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={{ color: COLORS.muted, fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 10, textTransform: "uppercase" }}>Facilities</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {facilities.map((f) => (
            <div key={f.name} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ color: COLORS.text, fontWeight: 600, fontSize: 14 }}>{f.icon} {f.name}</span>
                <span style={{ color: COLORS.gold, fontSize: 12, fontWeight: 700 }}>⏱ {f.wait}</span>
              </div>
              <div style={{ color: COLORS.muted, fontSize: 12 }}>💡 {f.tip}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("dashboard");

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "chat", label: "AI Chat", icon: "🤖" },
    { id: "navigate", label: "Navigate", icon: "🗺️" },
  ];

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "'Trebuchet MS', sans-serif", color: COLORS.text }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e2d45; border-radius: 2px; }
        @keyframes pulse { 0%,100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.1); } }
      `}</style>

      {/* Header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${COLORS.accent}22 0%, transparent 60%)`,
          borderBottom: `1px solid ${COLORS.border}`,
          padding: "16px 20px 12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36, height: 36,
              background: COLORS.accent,
              borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18,
            }}
          >
            🏟️
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: 0.5, color: COLORS.text }}>StadiumAI</div>
            <div style={{ fontSize: 11, color: COLORS.muted }}>Agentic Premier League · Live</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.green, boxShadow: `0 0 6px ${COLORS.green}` }} />
            <span style={{ fontSize: 11, color: COLORS.green, fontWeight: 600 }}>LIVE</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "20px 16px 100px" }}>
        {tab === "dashboard" && <Dashboard />}
        {tab === "chat" && <ChatBot />}
        {tab === "navigate" && <Navigation />}
      </div>

      {/* Tab bar */}
      <div
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          background: COLORS.card,
          borderTop: `1px solid ${COLORS.border}`,
          display: "flex",
          padding: "8px 0 16px",
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1, background: "none", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              padding: "6px 0",
            }}
          >
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span
              style={{
                fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
                color: tab === t.id ? COLORS.accent : COLORS.muted,
                textTransform: "uppercase",
              }}
            >
              {t.label}
            </span>
            {tab === t.id && (
              <div style={{ width: 20, height: 2, background: COLORS.accent, borderRadius: 1 }} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
