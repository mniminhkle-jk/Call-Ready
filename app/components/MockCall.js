"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "./api";

export default function MockCall({ accountId, contactId, goals, difficulty, checklist, rubric, budgetCap, model }) {
  const [goal, setGoal] = useState(goals[0]);
  const [diff, setDiff] = useState("busy");
  const [phase, setPhase] = useState("idle"); // idle | connecting | live | scoring | done | error
  const [err, setErr] = useState("");
  const [persona, setPersona] = useState(null);
  const [budget, setBudget] = useState(null);
  const [live, setLive] = useState([]);
  const [result, setResult] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [paste, setPaste] = useState("");
  const client = useRef(null);
  const callId = useRef(null);
  const timer = useRef(null);

  useEffect(() => { api("/api/mock/budget").then(setBudget).catch(() => {}); return () => { try { client.current?.stopCall(); } catch {} clearInterval(timer.current); }; }, []);

  async function start() {
    setErr(""); setResult(null); setLive([]); setPhase("connecting");
    try {
      const r = await api("/api/mock/start", "POST", { account_id: accountId, contact_id: contactId, goal, difficulty: diff });
      setPersona(r.persona); setBudget(r.budget); callId.current = r.call_id;
      const { RetellWebClient } = await import("retell-client-js-sdk");
      const c = new RetellWebClient();
      client.current = c;
      c.on("call_started", () => { setPhase("live"); setSeconds(0); clearInterval(timer.current); timer.current = setInterval(() => setSeconds(s => s + 1), 1000); });
      c.on("update", u => { if (u?.transcript) setLive(u.transcript.slice(-8)); });
      c.on("call_ended", () => { clearInterval(timer.current); finish(); });
      c.on("error", e => { clearInterval(timer.current); setErr(typeof e === "string" ? e : e?.message || "The call connection failed."); try { c.stopCall(); } catch {} finish(); });
      await c.startCall({ accessToken: r.access_token, callId: r.call_id, transport: r.transport, iceServers: r.ice_servers });
    } catch (e) {
      setPhase("error"); setErr(/permission|notallowed/i.test(e.message) ? "Microphone access was blocked. Allow the mic for this site and try again." : e.message);
    }
  }
  function stop() { try { client.current?.stopCall(); } catch {} }
  async function finish() {
    if (!callId.current) return;
    const id = callId.current; callId.current = null;
    setPhase("scoring");
    for (let i = 0; i < 12; i++) {
      try {
        const r = await api(`/api/mock/${id}/finish`, "POST");
        if (!r.pending) { setResult(r); setPhase("done"); api("/api/mock/budget").then(setBudget).catch(() => {}); return; }
      } catch (e) { setErr(e.message); }
      await new Promise(res => setTimeout(res, 2500));
    }
    setPhase("error"); setErr("The call ended but the transcript isn't ready yet. Open this page again in a minute to score it.");
  }
  async function scorePaste() {
    setErr("");
    try { const r = await api("/api/mock/score", "POST", { account_id: accountId, contact_id: contactId, transcript: paste }); setResult(r); setPhase("done"); }
    catch (e) { setErr(e.message); }
  }

  const used = budget ? budget.spent + budget.pending : 0;
  const pct = Math.min(100, Math.round((used / budgetCap) * 100));

  return (
    <div className="stack" style={{ gap: 16 }}>
      <section className="card stack">
        <h2>Set up the call</h2>
        <div className="field-grid">
          <div><label htmlFor="m-goal">Goal of the call</label><select id="m-goal" value={goal} onChange={e => setGoal(e.target.value)} disabled={phase === "live" || phase === "connecting"}>{goals.map(g => <option key={g}>{g}</option>)}</select></div>
          <div><label htmlFor="m-diff">Prospect mood</label><select id="m-diff" value={diff} onChange={e => setDiff(e.target.value)} disabled={phase === "live" || phase === "connecting"}>{difficulty.map(([k, v]) => <option key={k} value={k}>{v.split(":")[0]}</option>)}</select></div>
        </div>
        <div className="stack small" style={{ gap: 6 }}>
          <div className="row spread"><span>Mock-call credit used: <b className="mono">${(used / 100).toFixed(2)}</b> of <span className="mono">${(budgetCap / 100).toFixed(2)}</span> cap</span></div>
          <div className="meter" aria-hidden><span style={{ width: `${pct}%`, background: pct > 85 ? "var(--err)" : pct > 60 ? "var(--warn)" : "var(--ok)" }} /></div>
          
        </div>
        {err && <div className="notice err small" role="alert">{err}</div>}
        <div className="row">
          {phase !== "live" && <button className="btn accent" onClick={start} disabled={phase === "connecting" || phase === "scoring" || (budget && !budget.canStart)}>{phase === "connecting" ? "Connecting…" : phase === "scoring" ? "Scoring…" : "Start voice call"}</button>}
          {phase === "live" && <button className="btn" style={{ background: "var(--err)", color: "#fff" }} onClick={stop}>End call</button>}
          {phase === "live" && <span className="mono">● live {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")} with {persona?.name}</span>}
        </div>
        {phase === "live" && live.length > 0 && <div className="stack small" style={{ gap: 4 }}>{live.map((t, i) => <div key={i}><b>{t.role === "agent" ? persona?.name : "You"}:</b> {t.content}</div>)}</div>}
      </section>

      <section className="card stack">
        <h2>Hit these on the call</h2>
        {checklist.map(x => <div key={x.part + x.title} className="draft-line"><span className="p">{x.part}</span><div><b>{x.title}:</b> {x.hit}{x.say && <div className="small muted" style={{ marginTop: 2 }}>Try: “{x.say}”</div>}</div></div>)}
      </section>

      {result?.score && <section className="card stack">
        <div className="row spread"><h2>Call Readiness Score</h2>{result.cost_cents != null && <span className="small muted mono">{result.duration_s}s · ${(result.cost_cents / 100).toFixed(2)}</span>}</div>
        <div className="row" style={{ gap: 18 }}><span className="score-big">{result.score.total}</span><div><div style={{ fontWeight: 600, fontSize: 18 }}>{result.score.band}</div><div className="small muted">You spoke {result.score.talkRatio}% of the words · {result.score.turns} turns</div></div></div>
        <div className="table-wrap"><table><thead><tr><th>Move</th><th>What we checked</th><th>Result</th><th>Points</th></tr></thead><tbody>
          {result.score.items.map(i => <tr key={i.id}><td><b>{i.part}</b> {i.label}</td><td className="small">{i.test}</td><td><span className={`chip ${i.status === "hit" ? "green" : i.status === "partial" ? "yellow" : "red"}`}>{i.status}</span></td><td className="mono">{i.earned}/{i.points}</td></tr>)}
        </tbody></table></div>
        <h3>Before the real call</h3>
        <ul className="list">{result.score.feedback.map((f, i) => <li key={i}>{f}</li>)}</ul>
        {result.turns?.length > 0 && <details><summary className="small">Transcript</summary><div className="stack small" style={{ gap: 4, marginTop: 8 }}>{result.turns.map((t, i) => <div key={i}><b>{t.role === "rep" ? "You" : "Prospect"}:</b> {t.text}</div>)}</div></details>}
      </section>}
      {result && !result.score && <div className="notice small">The call ended before anyone spoke, so there's nothing to score.</div>}

      <section className="card stack" data-guide="written-practice" tabIndex={-1}>
        <h2>No mic? Score a written practice</h2>
        <p className="small muted" style={{ margin: 0 }}>Role-play with a teammate and paste the lines here. Start each line with “Rep:” or “Prospect:”. This uses no Retell credit, and the score is saved to Training.</p>
        <textarea rows={6} value={paste} onChange={e => setPaste(e.target.value)} aria-label="Practice transcript" placeholder={"Rep: Thanks for taking my call. I saw ...\nProspect: Sure, what's this about?"} />
        <div><button className="btn secondary" onClick={scorePaste}>Score it</button></div>
      </section>
    </div>
  );
}
