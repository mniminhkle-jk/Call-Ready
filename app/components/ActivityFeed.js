"use client";
import { useState } from "react";
import { fmtDateTime } from "./api";

const TYPES = [["all", "All"], ["calls", "Calls & notes"], ["emails", "Emails"], ["stage", "Stage & deals"]];
const typeOf = a => (/note|call|granola|practice/i.test(a.action) ? "calls" : /email|linkedin/i.test(a.action) ? "emails" : /stage|deal|opportunit|owner/i.test(a.action) ? "stage" : "other");
const SRC = { salesforce: "Salesforce", hubspot: "HubSpot", call_ready: "Call Ready" };

export default function ActivityFeed({ items, deals = [], max = 8, showFilter = true, title = "Activity" }) {
  const [t, setT] = useState("all");
  const list = items.filter(a => t === "all" || typeOf(a) === t);
  const open = deals.filter(d => d.status === "open");
  return (
    <section className="card stack" aria-labelledby="h-activity">
      <div className="section-title"><h2 id="h-activity">{title}</h2></div>
      {open.map(d => <div key={d.id} className="small"><b>Open deal:</b> {d.name} · {d.stage} · ${Math.round(d.margin).toLocaleString("en-US")} est. margin</div>)}
      {showFilter && items.length > 5 && <div className="row" role="group" aria-label="Filter activity" style={{ gap: 6 }}>{TYPES.map(([k, l]) => <button key={k} type="button" className={`chip plain${t === k ? " is-on" : ""}`} aria-pressed={t === k} onClick={() => setT(k)} style={{ cursor: "pointer", minHeight: 32, ...(t === k ? { background: "var(--btn)", color: "var(--btn-ink)", borderColor: "var(--btn)" } : {}) }}>{l}</button>)}</div>}
      {list.length === 0 ? <p className="muted small" style={{ margin: 0 }}>Nothing here yet.</p> :
        <ul className="timeline small">{list.slice(0, max).map(x => <li key={x.id}>
          <div className="row" style={{ gap: 6 }}><span className={`src-chip ${x.source || "call_ready"}`}>{SRC[x.source] || "Call Ready"}</span><span className="muted">{fmtDateTime(x.created_at)}</span></div>
          <div><b>{x.action}</b>{x.detail ? `: ${x.detail}` : ""}</div>
          {x.source === "call_ready" && x.actor && <div className="muted">{x.actor}</div>}
        </li>)}</ul>}
      {list.length > max && <details className="more"><summary>Show {list.length - max} more</summary><ul className="timeline small">{list.slice(max).map(x => <li key={x.id}><div className="row" style={{ gap: 6 }}><span className={`src-chip ${x.source || "call_ready"}`}>{SRC[x.source] || "Call Ready"}</span><span className="muted">{fmtDateTime(x.created_at)}</span></div><div><b>{x.action}</b>{x.detail ? `: ${x.detail}` : ""}</div></li>)}</ul></details>}
    </section>
  );
}
