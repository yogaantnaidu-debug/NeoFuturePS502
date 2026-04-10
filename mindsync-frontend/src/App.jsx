import { useState, useEffect, useRef, useCallback } from "react";
import LoginScreen from "./screens/LoginScreen";
import OnboardingScreen from "./screens/OnboardingScreen";


// ─── CONFIG ────────────────────────────────────────────────────────────────────
const API_BASE = "http://localhost:5000";   // Node backend
const ML_BASE  = "http://localhost:5001";   // Flask ml_api.py

const api = {
  // Mood endpoints (moodController.js)
  logMood:        (body)   => fetch(`${API_BASE}/api/mood`,          { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) }).then(r=>r.json()),
  getMoodHistory: (userId) => fetch(`${API_BASE}/api/mood/history?user_id=${userId}`).then(r=>r.json()),
  getMoodStats:   (userId) => fetch(`${API_BASE}/api/mood/stats?user_id=${userId}`).then(r=>r.json()),

  // AI endpoints (aiController.js)
  chatAI:         (body)   => fetch(`${API_BASE}/api/ai/chat`,       { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) }).then(r=>r.json()),
  getInsights:    (userId) => fetch(`${API_BASE}/api/ai/insights?user_id=${userId}`).then(r=>r.json()),

  // ML endpoints (ml_api.py via Flask)
  predict:     (body)  => fetch(`${ML_BASE}/predict`,            { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) }).then(r=>r.json()),
  modelInfo:   ()      => fetch(`${ML_BASE}/model-info`).then(r=>r.json()),
};

// ─── STYLES ────────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --purple:    #6C5CE7;
    --purple-lt: #a29bfe;
    --purple-dk: #4834d4;
    --teal:      #00b894;
    --coral:     #fd7979;
    --amber:     #fdcb6e;
    --bg:        #0d0d12;
    --bg2:       #13131a;
    --bg3:       #1a1a24;
    --border:    rgba(255,255,255,0.06);
    --border2:   rgba(255,255,255,0.12);
    --text:      #f0eeff;
    --text2:     rgba(240,238,255,0.55);
    --text3:     rgba(240,238,255,0.28);
    --font-disp: 'DM Serif Display', serif;
    --font-body: 'DM Sans', sans-serif;
    --radius:    14px;
    --radius-sm: 8px;
  }

  html, body, #root { height: 100%; background: var(--bg); font-family: var(--font-body); color: var(--text); }

  /* Layout */
  .app { display: grid; grid-template-columns: 240px 1fr; min-height: 100vh; }

  /* Sidebar */
  .sidebar {
    background: var(--bg2);
    border-right: 1px solid var(--border);
    padding: 28px 16px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    position: sticky;
    top: 0;
    height: 100vh;
  }
  .logo {
    font-family: var(--font-disp);
    font-size: 22px;
    letter-spacing: -0.5px;
    color: var(--text);
    padding: 0 12px 28px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .logo-mark {
    width: 28px; height: 28px;
    border-radius: 8px;
    background: linear-gradient(135deg, var(--purple), var(--teal));
    display: flex; align-items: center; justify-content: center;
    font-size: 13px;
  }
  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px;
    border-radius: var(--radius-sm);
    font-size: 14px;
    color: var(--text2);
    cursor: pointer;
    border: none; background: transparent;
    width: 100%; text-align: left;
    font-family: var(--font-body);
    transition: background 0.15s, color 0.15s;
    letter-spacing: 0.01em;
  }
  .nav-item:hover { background: rgba(255,255,255,0.04); color: var(--text); }
  .nav-item.active { background: rgba(108,92,231,0.18); color: var(--purple-lt); }
  .nav-icon { font-size: 16px; width: 20px; text-align: center; opacity: 0.85; }
  .nav-spacer { flex: 1; }
  .status-badge {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 12px;
    background: rgba(0,184,148,0.08);
    border: 1px solid rgba(0,184,148,0.2);
    border-radius: var(--radius-sm);
    font-size: 12px;
    color: var(--teal);
    margin-top: 8px;
  }
  .status-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--teal); animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

  /* Main */
  .main { padding: 40px 44px; overflow-y: auto; }
  .page { display: none; flex-direction: column; gap: 24px; animation: fadeIn 0.2s ease; }
  .page.active { display: flex; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }

  /* Page header */
  .page-header { margin-bottom: 4px; }
  .page-title { font-family: var(--font-disp); font-size: 32px; letter-spacing: -0.5px; }
  .page-sub { font-size: 14px; color: var(--text2); margin-top: 4px; font-weight: 300; }

  /* Cards */
  .card {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px 22px;
  }
  .card-title { font-size: 11px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text3); margin-bottom: 16px; }

  /* Grids */
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .grid3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
  .grid4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }

  /* Metric cards */
  .metric { background: var(--bg3); border-radius: var(--radius-sm); padding: 16px 18px; border: 1px solid var(--border); }
  .metric-label { font-size: 11px; color: var(--text3); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 8px; }
  .metric-value { font-family: var(--font-disp); font-size: 28px; }
  .metric-sub { font-size: 12px; color: var(--text3); margin-top: 4px; font-weight: 300; }

  /* Buttons */
  .btn {
    padding: 9px 18px; border-radius: var(--radius-sm);
    border: 1px solid var(--border2);
    background: transparent; color: var(--text);
    cursor: pointer; font-size: 14px;
    font-family: var(--font-body);
    transition: background 0.15s, border-color 0.15s;
    letter-spacing: 0.01em;
  }
  .btn:hover { background: rgba(255,255,255,0.06); }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-primary {
    background: var(--purple); border-color: var(--purple); color: #fff;
  }
  .btn-primary:hover { background: var(--purple-dk); border-color: var(--purple-dk); }
  .btn-sm { padding: 6px 12px; font-size: 13px; }

  /* Inputs */
  input[type=text], input[type=number], input[type=email], input[type=password], textarea, select {
    background: var(--bg3); border: 1px solid var(--border2);
    border-radius: var(--radius-sm); color: var(--text);
    font-family: var(--font-body); font-size: 14px;
    outline: none; width: 100%;
    transition: border-color 0.15s;
  }
  input[type=text], input[type=number], input[type=email], input[type=password] { padding: 9px 12px; }
  textarea { padding: 10px 12px; resize: vertical; line-height: 1.6; }
  input[type=text]:focus, input[type=email]:focus, input[type=password]:focus, textarea:focus { border-color: var(--purple); }
  
  /* Fix Browser Autofill styling to match Dark background */
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px var(--bg3) inset !important;
    -webkit-text-fill-color: var(--text) !important;
    transition: background-color 5000s ease-in-out 0s;
  }

  input[type=range] { accent-color: var(--purple); }

  /* Mood buttons */
  .mood-grid { display: grid; grid-template-columns: repeat(5,1fr); gap: 10px; margin-bottom: 16px; }
  .mood-btn {
    padding: 14px 6px; border-radius: var(--radius-sm);
    border: 1px solid var(--border2);
    background: var(--bg3); cursor: pointer;
    text-align: center; transition: all 0.15s;
    font-family: var(--font-body);
  }
  .mood-btn:hover { border-color: var(--purple); background: rgba(108,92,231,0.12); }
  .mood-btn.selected { border-color: var(--purple); background: rgba(108,92,231,0.22); }
  .mood-emoji { font-size: 24px; display: block; margin-bottom: 6px; }
  .mood-label { font-size: 12px; color: var(--text2); }

  /* Tags */
  .tag { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; margin: 3px; cursor: pointer; border: 1px solid transparent; transition: all 0.15s; }
  .tag-purple { background: rgba(108,92,231,0.15); color: var(--purple-lt); border-color: rgba(108,92,231,0.3); }
  .tag-teal { background: rgba(0,184,148,0.12); color: #55efc4; border-color: rgba(0,184,148,0.3); }
  .tag-coral { background: rgba(253,121,121,0.12); color: #fab1a0; border-color: rgba(253,121,121,0.3); }
  .tag-amber { background: rgba(253,203,110,0.12); color: var(--amber); border-color: rgba(253,203,110,0.3); }

  /* Bar chart */
  .chart-bars { display: flex; align-items: flex-end; gap: 8px; height: 100px; }
  .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .bar { width: 100%; border-radius: 4px 4px 0 0; transition: height 0.5s ease; }
  .bar-day { font-size: 10px; color: var(--text3); letter-spacing: 0.05em; }
  .bar-val { font-size: 10px; color: var(--text3); }

  /* Progress bars */
  .prog-track { height: 6px; background: var(--bg3); border-radius: 3px; overflow: hidden; flex: 1; }
  .prog-fill { height: 100%; border-radius: 3px; transition: width 0.6s ease; }
  .prog-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
  .prog-label { font-size: 12px; color: var(--text2); width: 70px; flex-shrink: 0; }
  .prog-val { font-size: 12px; font-weight: 500; width: 32px; text-align: right; flex-shrink: 0; }

  /* Insight rows */
  .insight-item { display: flex; gap: 14px; padding: 14px 0; border-bottom: 1px solid var(--border); align-items: flex-start; }
  .insight-item:last-child { border-bottom: none; padding-bottom: 0; }
  .insight-icon { width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }
  .insight-text { font-size: 14px; line-height: 1.55; }
  .insight-meta { font-size: 12px; color: var(--text3); margin-top: 3px; }

  /* History */
  .history-item { display: flex; gap: 14px; align-items: flex-start; padding: 13px 0; border-bottom: 1px solid var(--border); }
  .history-item:last-child { border-bottom: none; }
  .history-avatar { width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
  .history-note { font-size: 14px; margin-top: 2px; line-height: 1.45; color: var(--text2); }
  .history-date { font-size: 11px; color: var(--text3); letter-spacing: 0.04em; }

  /* Chat */
  .chat-area { display: flex; flex-direction: column; gap: 12px; height: 320px; overflow-y: auto; margin-bottom: 14px; scroll-behavior: smooth; }
  .chat-area::-webkit-scrollbar { width: 4px; }
  .chat-area::-webkit-scrollbar-track { background: transparent; }
  .chat-area::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }
  .bubble-ai { background: var(--bg3); border: 1px solid var(--border); border-radius: 14px 14px 14px 4px; padding: 12px 14px; font-size: 14px; line-height: 1.55; max-width: 84%; }
  .bubble-user { background: rgba(108,92,231,0.2); border: 1px solid rgba(108,92,231,0.35); border-radius: 14px 14px 4px 14px; padding: 12px 14px; font-size: 14px; line-height: 1.55; max-width: 84%; align-self: flex-end; }
  .bubble-sender { font-size: 11px; color: var(--text3); letter-spacing: 0.06em; margin-bottom: 5px; text-transform: uppercase; }
  .chat-input-row { display: flex; gap: 10px; }
  .chat-input-row input { border-radius: var(--radius-sm); }

  /* Predict */
  .pred-box { background: var(--bg3); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 16px 18px; }
  .pred-class { font-family: var(--font-disp); font-size: 26px; margin: 4px 0 2px; }
  .big-conf { font-family: var(--font-disp); font-size: 26px; }

  /* Spinner */
  .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.15); border-top-color: var(--purple-lt); border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; vertical-align: middle; margin-right: 8px; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Error */
  .error-msg { background: rgba(253,121,121,0.1); border: 1px solid rgba(253,121,121,0.25); border-radius: var(--radius-sm); padding: 10px 14px; font-size: 13px; color: #fab1a0; margin-top: 10px; }
  .success-msg { background: rgba(0,184,148,0.1); border: 1px solid rgba(0,184,148,0.25); border-radius: var(--radius-sm); padding: 10px 14px; font-size: 13px; color: #55efc4; margin-top: 10px; }

  /* Slider row */
  .slider-row { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
  .slider-label { font-size: 13px; color: var(--text2); width: 90px; flex-shrink: 0; }
  .slider-val { font-size: 13px; font-weight: 500; color: var(--purple-lt); width: 20px; flex-shrink: 0; }

  /* Responsive */
  @media (max-width: 900px) {
    .app { grid-template-columns: 1fr; }
    .sidebar { display: none; }
    .main { padding: 24px 20px; }
    .grid3, .grid4 { grid-template-columns: 1fr 1fr; }
    .mood-grid { grid-template-columns: repeat(3, 1fr); }
  }
  @media (max-width: 600px) {
    .grid2, .grid3, .grid4 { grid-template-columns: 1fr; }
  }
`;

// ─── COMPONENTS ────────────────────────────────────────────────────────────────

function Spinner() {
  return <span className="spinner" aria-hidden="true" />;
}

function NavItem({ icon, label, id, activePage, onClick }) {
  return (
    <button
      className={`nav-item ${activePage === id ? "active" : ""}`}
      onClick={() => onClick(id)}
    >
      <span className="nav-icon">{icon}</span>
      {label}
    </button>
  );
}

// ─── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({ user }) {
  const [stats, setStats] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getMoodStats(user?.id), api.getInsights(user?.id)])
      .then(([s, i]) => {
        setStats(s);
        setInsights(Array.isArray(i) ? i : i.insights || []);
      })
      .catch(() => setError("Could not load dashboard data. Is the server running?"))
      .finally(() => setLoading(false));
  }, []);

  const days = stats?.weeklyDays || ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Today"];
  const weekScores = stats?.weeklyScores || [0, 0, 0, 0, 0, 0, 0];
  const maxScore = Math.max(...weekScores, 1);

  const drivers = stats?.moodDrivers || [];

  const displayInsights = insights;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Good morning</div>
        <div className="page-sub">Your wellness overview</div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {loading ? (
        <div style={{ color: "var(--text2)", fontSize: 14, padding: "20px 0" }}><Spinner />Loading dashboard…</div>
      ) : (
        <>
          <div className="grid4">
            <div className="metric">
              <div className="metric-label">Mood score</div>
              <div className="metric-value" style={{ color: "var(--purple-lt)" }}>{stats?.avgScore ?? "0.0"}</div>
              <div className="metric-sub">Average</div>
            </div>
            <div className="metric">
              <div className="metric-label">Streak</div>
              <div className="metric-value" style={{ color: "var(--teal)" }}>{stats?.streak ?? 0}<span style={{ fontSize: 14, marginLeft: 4, color: "var(--text3)" }}>days</span></div>
              <div className="metric-sub">Personal best: {stats?.bestStreak ?? 0}</div>
            </div>
            <div className="metric">
              <div className="metric-label">Total entries</div>
              <div className="metric-value">{stats?.totalEntries ?? 0}</div>
              <div className="metric-sub">Since {stats?.since ?? "Today"}</div>
            </div>
            <div className="metric">
              <div className="metric-label">Model confidence</div>
              <div className="metric-value" style={{ color: "var(--amber)" }}>{stats?.modelConfidence ?? "0"}%</div>
              <div className="metric-sub">XGBoost API</div>
            </div>
          </div>

          <div className="grid2">
            <div className="card">
              <div className="card-title">Weekly mood trend</div>
              <div className="chart-bars">
                {weekScores.map((s, i) => (
                  <div key={i} className="bar-col">
                    <div className="bar-val" style={{ color: "var(--purple-lt)", fontSize: 10 }}>{s > 0 ? s : ''}</div>
                    <div className="bar" style={{ height: `${s === 0 ? 4 : (s / maxScore) * 72}px`, background: i === 6 ? "var(--purple)" : "var(--bg3)", border: "1px solid rgba(162,155,254,0.25)" }} />
                    <div className="bar-day">{days[i]}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-title">Mood drivers</div>
              {drivers.length === 0 ? (
                <div style={{ color: 'var(--text3)', fontSize: 13, padding: '10px 0' }}>Not enough data to determine primary drivers yet. Focus on consistently tracking your sleep and stress!</div>
              ) : drivers.map((d, i) => (
                <div key={i} className="prog-row">
                  <div className="prog-label">{d.label}</div>
                  <div className="prog-track"><div className="prog-fill" style={{ width: `${d.pct}%`, background: d.color }} /></div>
                  <div className="prog-val" style={{ color: d.color }}>{d.pct}%</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-title">AI insights</div>
            {displayInsights.length === 0 ? (
                <div style={{ color: 'var(--text3)', fontSize: 13, padding: '10px 0' }}>It's quiet in here. As you log more context, VitalAI will recognize patterns and offer personalized, data-driven daily insights!</div>
            ) : displayInsights.map((ins, i) => (
              <div key={i} className="insight-item">
                <div className="insight-icon" style={{ background: ins.bg, color: ins.color }}>{ins.icon}</div>
                <div>
                  <div className="insight-text">{ins.text}</div>
                  <div className="insight-meta">{ins.meta || ins.source}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── LOG MOOD ──────────────────────────────────────────────────────────────────
function LogMood({ user }) {
  const MOODS = [
    { emoji: "😔", label: "Low",   score: 2 },
    { emoji: "😕", label: "Meh",   score: 4 },
    { emoji: "😊", label: "Okay",  score: 6 },
    { emoji: "😄", label: "Good",  score: 8 },
    { emoji: "🤩", label: "Great", score: 10 },
  ];
  const TAGS = ["work", "sleep", "social", "exercise", "anxiety", "gratitude"];

  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState("");
  const [tags, setTags] = useState([]);
  const [sleep, setSleep] = useState(6);
  const [stress, setStress] = useState(4);
  const [energy, setEnergy] = useState(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  function toggleTag(t) {
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  }

  async function handleSubmit() {
    if (!selectedMood) { setError("Please select a mood."); return; }
    setLoading(true); setError(null); setSuccess(false);
    try {
      await api.logMood({
        user_id: user?.id,
        mood: selectedMood.label,
        score: selectedMood.score,
        note,     // keep frontend's expectation
        text: note, // mapped for backend
        tags,
        factors: { sleep, stress, energy }, // keep frontend's expectation
        stress,   // mapped for backend
        sleepHours: sleep, // mapped for backend
        age: 25,  // mapped for backend XGBoost
        timestamp: new Date().toISOString(),
      });
      setSuccess(true);
      setNote(""); setTags([]); setSelectedMood(null);
      setSleep(6); setStress(4); setEnergy(7);
    } catch (e) {
      setError("Failed to save entry. Check your connection to the backend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Log your mood</div>
        <div className="page-sub">Track how you're feeling right now</div>
      </div>

      <div className="card">
        <div className="card-title">How are you feeling?</div>
        <div className="mood-grid">
          {MOODS.map(m => (
            <button key={m.label} className={`mood-btn ${selectedMood?.label === m.label ? "selected" : ""}`} onClick={() => setSelectedMood(m)}>
              <span className="mood-emoji">{m.emoji}</span>
              <span className="mood-label">{m.label}</span>
            </button>
          ))}
        </div>
        {selectedMood && (
          <div style={{ fontSize: 13, color: "var(--purple-lt)", marginBottom: 14 }}>
            {selectedMood.emoji} {selectedMood.label} · Score {selectedMood.score}/10
          </div>
        )}

        <div className="card-title">Journal entry</div>
        <textarea
          rows={4}
          placeholder="Write anything — thoughts, events, how your day went…"
          value={note}
          onChange={e => setNote(e.target.value)}
        />

        <div style={{ marginTop: 12, marginBottom: 4, fontSize: 11, color: "var(--text3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Quick tags</div>
        <div>
          {TAGS.map((t, i) => {
            const cls = ["tag-purple","tag-teal","tag-coral","tag-amber","tag-coral","tag-teal"][i % 4];
            return (
              <span key={t} className={`tag ${cls}`} style={{ opacity: tags.includes(t) ? 1 : 0.6 }} onClick={() => toggleTag(t)}>
                {tags.includes(t) ? "✓ " : "+ "}{t}
              </span>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Contributing factors</div>
        {[
          { label: "Sleep quality", value: sleep, set: setSleep, id: "sleep" },
          { label: "Stress level",  value: stress, set: setStress, id: "stress" },
          { label: "Energy",        value: energy, set: setEnergy, id: "energy" },
        ].map(f => (
          <div key={f.id} className="slider-row">
            <div className="slider-label">{f.label}</div>
            <input type="range" min="0" max="10" step="1" value={f.value} onChange={e => f.set(Number(e.target.value))} style={{ flex: 1 }} />
            <div className="slider-val">{f.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button className="btn" onClick={() => { setNote(""); setTags([]); setSelectedMood(null); setError(null); setSuccess(false); }}>Clear</button>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading && <Spinner />}{loading ? "Saving…" : "Save entry"}
        </button>
      </div>

      {error   && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">✓ Entry saved and queued for ML analysis.</div>}
    </div>
  );
}

// ─── ML PREDICT ────────────────────────────────────────────────────────────────
function MLPredict() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);

  useEffect(() => {
    api.modelInfo()
      .then(setModelInfo)
      .catch(() => setModelInfo(null));
  }, []);

  async function handlePredict() {
    if (!text.trim()) { setError("Please enter some text."); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const data = await api.predict({ text });
      
      // Normalize backend response to match frontend expectations
      if (data.predicted_mood && !data.predicted_class) {
        data.predicted_class = data.predicted_mood.charAt(0).toUpperCase() + data.predicted_mood.slice(1);
      }
      if (data.probabilities) {
        const capitalizedProbs = {};
        for (const [k, v] of Object.entries(data.probabilities)) {
          capitalizedProbs[k.charAt(0).toUpperCase() + k.slice(1)] = v;
        }
        data.probabilities = capitalizedProbs;
      }
      
      setResult(data);
    } catch {
      setError("Could not reach the ML API. Make sure ml_api.py (Flask) is running on port 5001.");
    } finally {
      setLoading(false);
    }
  }

  const CLASS_COLORS = {
    Positive: { bg: "rgba(0,184,148,0.12)", text: "#55efc4", bar: "var(--teal)" },
    Neutral:  { bg: "rgba(162,155,254,0.12)", text: "var(--purple-lt)", bar: "var(--purple)" },
    Negative: { bg: "rgba(253,121,121,0.12)", text: "#fab1a0", bar: "var(--coral)" },
  };
  const cls = result ? (CLASS_COLORS[result.predicted_class] || CLASS_COLORS.Neutral) : {};

  return (
    <div>
      <div className="page-header">
        <div className="page-title">XGBoost prediction</div>
        <div className="page-sub">Run text through your trained model</div>
      </div>

      {modelInfo && (
        <div className="grid3" style={{ gap: 12 }}>
          <div className="metric">
            <div className="metric-label">Model</div>
            <div className="metric-value" style={{ fontSize: 16 }}>{modelInfo.model || "XGBoost"}</div>
          </div>
          <div className="metric">
            <div className="metric-label">Accuracy</div>
            <div className="metric-value" style={{ fontSize: 20, color: "var(--teal)" }}>{modelInfo.accuracy ?? "—"}</div>
          </div>
          <div className="metric">
            <div className="metric-label">Features</div>
            <div className="metric-value" style={{ fontSize: 20 }}>{modelInfo.n_features ?? "—"}</div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-title">Input text</div>
        <textarea
          rows={5}
          placeholder="Paste a journal entry or describe how you feel in detail…"
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
          <button className="btn btn-primary" onClick={handlePredict} disabled={loading || !text.trim()}>
            {loading && <Spinner />}{loading ? "Analysing…" : "Run model"}
          </button>
        </div>
        {error && <div className="error-msg">{error}</div>}
      </div>

      {result && (
        <>
          <div className="grid2">
            <div className="pred-box" style={{ background: cls.bg, border: `1px solid ${cls.bar}33` }}>
              <div className="card-title">Predicted class</div>
              <div className="pred-class" style={{ color: cls.text }}>{result.predicted_class}</div>
              <div style={{ fontSize: 12, color: "var(--text3)" }}>XGBoost classifier · TF-IDF features</div>
            </div>
            <div className="pred-box">
              <div className="card-title">Confidence</div>
              <div className="big-conf" style={{ color: cls.text }}>{result.confidence != null ? `${Math.round(result.confidence * 100)}%` : "—"}</div>
              <div className="prog-track" style={{ marginTop: 10 }}>
                <div className="prog-fill" style={{ width: `${Math.round((result.confidence ?? 0) * 100)}%`, background: cls.bar }} />
              </div>
            </div>
          </div>

          {result.probabilities && (
            <div className="card">
              <div className="card-title">Class probabilities</div>
              {Object.entries(result.probabilities).map(([cls_name, prob]) => {
                const c = CLASS_COLORS[cls_name] || CLASS_COLORS.Neutral;
                const pct = Math.round(prob * 100);
                return (
                  <div key={cls_name} className="prog-row">
                    <div className="prog-label">{cls_name}</div>
                    <div className="prog-track"><div className="prog-fill" style={{ width: `${pct}%`, background: c.bar }} /></div>
                    <div className="prog-val" style={{ color: c.text }}>{pct}%</div>
                  </div>
                );
              })}
            </div>
          )}

          {result.top_features && result.top_features.length > 0 && (
            <div className="card">
              <div className="card-title">Top TF-IDF features</div>
              <div>
                {result.top_features.map((f, i) => {
                  const clss = ["tag-purple","tag-teal","tag-amber","tag-coral"][i % 4];
                  return <span key={i} className={`tag ${clss}`}>{typeof f === "string" ? f : f.word} {f.weight ? `· ${f.weight.toFixed(3)}` : ""}</span>;
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── AI CHAT ───────────────────────────────────────────────────────────────────
function AIChat({ user }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I'm your MindSync AI companion. How are you feeling today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  async function sendMessage() {
    const msg = input.trim();
    if (!msg || loading) return;
    const next = [...messages, { role: "user", text: msg }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const data = await api.chatAI({
        user_id: user?.id,
        aiPersonality: user?.aiPersonality,
        profile: user,
        message: msg,
        history: messages.map(m => ({ role: m.role, content: m.text })),
      });
      if (data.error || (data.reply && data.reply.includes("because my AI service failed"))) {
        // Fallback simulated response
        const fallbackReplies = [
          "I hear you. Taking a moment to breathe deeply can help center your thoughts.",
          "It's completely normal to feel that way. Be kind to yourself today.",
          "I'm here for you. Have you tried doing something small that brings you joy?",
          "Stress can accumulate quietly. A short walk might clear your head.",
        ];
        const randomReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
        setMessages([...next, { role: "assistant", text: randomReply }]);
      } else {
        const reply = data.reply || data.message || data.response || "I received your message.";
        setMessages([...next, { role: "assistant", text: reply }]);
      }
    } catch {
      const fallbackReplies = [
        "I hear you. Taking a moment to breathe deeply can help center your thoughts.",
        "It's completely normal to feel that way. Be kind to yourself today."
      ];
      setMessages([...next, { role: "assistant", text: fallbackReplies[0] }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">AI wellness chat</div>
        <div className="page-sub">Talk to your AI companion about how you're feeling</div>
      </div>

      <div className="card">
        <div className="chat-area" ref={chatRef}>
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "bubble-user" : "bubble-ai"}>
              <div className="bubble-sender">{m.role === "user" ? "You" : "MindSync AI"}</div>
              {m.text}
            </div>
          ))}
          {loading && (
            <div className="bubble-ai">
              <div className="bubble-sender">MindSync AI</div>
              <Spinner />Thinking…
            </div>
          )}
        </div>
        <div className="chat-input-row">
          <input
            type="text"
            placeholder="Type a message… (Enter to send)"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={loading}
          />
          <button className="btn btn-primary btn-sm" onClick={sendMessage} disabled={loading || !input.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── HISTORY ───────────────────────────────────────────────────────────────────
function History({ user }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getMoodHistory(user?.id)
      .then(data => setEntries(Array.isArray(data) ? data : data.entries || []))
      .catch(() => setError("Could not load history. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  const MOOD_META = {
    Low:   { emoji: "😔", bg: "rgba(253,121,121,0.15)" },
    Meh:   { emoji: "😕", bg: "rgba(253,203,110,0.15)" },
    Okay:  { emoji: "😊", bg: "rgba(162,155,254,0.15)" },
    Good:  { emoji: "😄", bg: "rgba(0,184,148,0.15)" },
    Great: { emoji: "🤩", bg: "rgba(108,92,231,0.2)" },
  };

  const display = entries;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Mood history</div>
        <div className="page-sub">Your past entries and trends</div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="card">
        <div className="card-title">Recent entries</div>
        {loading
          ? <div style={{ color: "var(--text2)", fontSize: 14 }}><Spinner />Loading…</div>
          : display.length === 0 
            ? <div style={{ color: "var(--text3)", fontSize: 14, padding: "20px 0" }}>No history yet. Head over to 'Log Mood' to start your journey!</div>
            : display.map((e, i) => {
            const meta = MOOD_META[e.mood] || { emoji: "😐", bg: "rgba(162,155,254,0.15)" };
            const rawDate = e.date || e.timestamp;
            const safeDateStr = (rawDate && !rawDate.includes('Z')) ? rawDate + 'Z' : rawDate;
            const date = new Date(safeDateStr);
            const dateOptions = { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true };
            const formatter = new Intl.DateTimeFormat("en-IN", dateOptions);
            const dateStr = isNaN(date.getTime()) ? safeDateStr : formatter.format(date);
            return (
              <div key={i} className="history-item">
                <div className="history-avatar" style={{ background: meta.bg }}>{meta.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontWeight: 500, fontSize: 14 }}>{e.mood} <span style={{ color: "var(--text3)", fontSize: 12 }}>· {e.score}/10</span></span>
                    <span className="history-date">{dateStr}</span>
                  </div>
                  <div className="history-note">{e.note}</div>
                  {e.tags?.length > 0 && (
                    <div style={{ marginTop: 6 }}>
                      {e.tags.map(t => <span key={t} className="tag tag-purple" style={{ fontSize: 11 }}>{t}</span>)}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        }
      </div>
    </div>
  );
}

// ─── APP ROOT ──────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("dashboard");
  
  // Lazy initialize to avoid useEffect cascaded updates
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem("mindsync_user");
    return cached ? JSON.parse(cached) : null;
  });
  
  const [isInitializing, setIsInitializing] = useState(true);
  
  const [needsOnboarding, setNeedsOnboarding] = useState(() => {
    const cached = localStorage.getItem("mindsync_user");
    if (cached) {
      const parsed = JSON.parse(cached);
      return !parsed.goal || !parsed.aiPersonality;
    }
    return false;
  });

  useEffect(() => {
    setIsInitializing(false);
  }, []);

  const handleLogin = (userData, isNewUser) => {
    setUser(userData);
    if (isNewUser || !userData.goal || !userData.aiPersonality) {
      setNeedsOnboarding(true);
    }
  };

  const handleOnboardingComplete = (updatedUser) => {
    setUser(updatedUser);
    setNeedsOnboarding(false);
  };

  if (isInitializing) return <div style={{ color: 'var(--text)', padding: 40 }}><Spinner /> Loading...</div>;

  if (!user) {
    return (
      <>
        <style>{STYLES}</style>
        <LoginScreen onLogin={handleLogin} />
      </>
    );
  }

  if (needsOnboarding) {
    return (
      <>
        <style>{STYLES}</style>
        <OnboardingScreen user={user} onComplete={handleOnboardingComplete} />
      </>
    );
  }

  const NAV = [
    { id: "dashboard", icon: "◈", label: "Dashboard" },
    { id: "log",       icon: "✎", label: "Log mood" },
    { id: "predict",   icon: "◎", label: "ML predict" },
    { id: "ai",        icon: "✦", label: "AI chat" },
    { id: "history",   icon: "◷", label: "History" },
  ];

  const PAGES = { dashboard: Dashboard, log: LogMood, predict: MLPredict, ai: AIChat, history: History };
  const ActivePage = PAGES[page];

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <aside className="sidebar">
          <div className="logo">
            <div className="logo-mark">✦</div>
            MindSync
          </div>
          {NAV.map(n => (
            <NavItem key={n.id} {...n} activePage={page} onClick={setPage} />
          ))}
          <div className="nav-spacer" />
          <div className="status-badge" style={{ cursor: "pointer" }} onClick={() => { localStorage.clear(); window.location.reload(); }}>
            <div className="status-dot" style={{ background: "var(--coral)", animation: "none" }} />
            Log out ({user.name?.split(' ')[0]})
          </div>
        </aside>

        <main className="main">
          {NAV.map(n => (
            <div key={n.id} className={`page ${page === n.id ? "active" : ""}`}>
              {page === n.id && <ActivePage user={user} />}
            </div>
          ))}
        </main>
      </div>
    </>
  );
}
