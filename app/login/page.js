"use client";
import { useState } from "react";
import { PASSWORD_RULES, meetsPolicy } from "@/lib/auth";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [help, setHelp] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    if (!username.trim() || !password) return setErr("Enter your username and password.");
    if (!meetsPolicy(password)) return setErr("That password doesn't meet the policy: 8+ characters, a number, and a special character.");
    setBusy(true);
    const res = await fetch("/api/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ username, password, remember }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setBusy(false); setPassword(""); return setErr(data.error || "Sign-in failed. Try again."); }
    const next = new URLSearchParams(window.location.search).get("next");
    window.location.href = next && next.startsWith("/") ? next : "/";
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "40px max(16px, env(safe-area-inset-right, 0px)) 40px max(16px, env(safe-area-inset-left, 0px))" }}>
      <div className="card" style={{ width: "100%", maxWidth: 380, padding: 32 }}>
        <h1 style={{ fontFamily: "var(--body)", fontSize: 22, fontWeight: 600 }}>Sign in</h1>
        <p className="muted small" style={{ margin: "4px 0 22px" }}>Use the account your admin issued you.</p>
        <form onSubmit={submit} noValidate className="stack" style={{ gap: 16 }}>
          {err && <div className="notice err" role="alert">{err}</div>}
          <div>
            <label htmlFor="username">Username</label>
            <input id="username" type="text" autoComplete="username" autoCapitalize="none" spellCheck="false" value={username} onChange={e => setUsername(e.target.value)} autoFocus />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <div style={{ position: "relative" }}>
              <input id="password" type={show ? "text" : "password"} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight: 64 }} aria-invalid={!!err} />
              <button type="button" className="btn ghost" onClick={() => setShow(s => !s)} aria-pressed={show} style={{ position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)", fontSize: 12.5, color: "var(--muted)" }}>{show ? "Hide" : "Show"}</button>
            </div>
            <ul className="list small" style={{ listStyle: "none", padding: 0, marginTop: 8, gap: 3 }}>
              {PASSWORD_RULES.map(r => {
                const met = r.test(password);
                return <li key={r.id} style={{ color: met ? "var(--ok)" : "var(--muted)", display: "flex", gap: 6, alignItems: "center" }}>
                  <span aria-hidden style={{ width: 7, height: 7, borderRadius: "50%", border: "1.5px solid currentColor", background: met ? "currentColor" : "none" }} />{r.text}
                </li>;
              })}
            </ul>
          </div>
          <label className="row small muted" style={{ gap: 8, fontWeight: 400 }}>
            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ width: 16, height: 16 }} /> Keep me signed in
          </label>
          <button className="btn" type="submit" disabled={busy} style={{ justifyContent: "center", padding: "11px 16px", fontSize: 15 }}>{busy ? "Signing in…" : "Sign in"}</button>
          <div><button type="button" className="btn ghost" style={{ padding: 0, textDecoration: "underline" }} onClick={() => setHelp(h => !h)}>Need help signing in?</button></div>
          {help && <p className="muted small" style={{ margin: 0 }}>Accounts are created by your admin. Ask your sales manager or IT for access or a password reset.</p>}
        </form>
      </div>
    </main>
  );
}
