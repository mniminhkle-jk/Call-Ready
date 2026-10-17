import Link from "next/link";
import { notFound } from "next/navigation";
import Shell from "@/app/components/Shell";
import SetupNeeded from "@/app/components/SetupNeeded";
import { getUser } from "@/lib/session";
import { ready, contactBundle } from "@/lib/data";
import { connectOptions, buildEmail, buildLinkedIn } from "@/lib/crva";
import { fmtDate, fmtDateTime } from "@/app/components/api";
import ContactPanel from "@/app/components/ContactPanel";
import Outreach from "@/app/components/Outreach";
import NotesPanel from "@/app/components/NotesPanel";
import BriefDownload from "@/app/components/BriefDownload";
import { MarkReviewed, PersonBriefEditor } from "@/app/components/AccountActions";

export const dynamic = "force-dynamic";
const initials = n => (n || "?").split(" ").map(x => x[0]).slice(0, 2).join("");

export default async function ContactPage({ params }) {
  const user = await getUser();
  const status = await ready();
  if (!status.ok) return <Shell user={user} active="/accounts"><SetupNeeded status={status} /></Shell>;
  const bundle = await contactBundle(params.id, params.cid);
  if (!bundle) notFound();
  const { account: a, contact: c, myNotes, myCalls, myActivity } = bundle;
  const b = c.brief || {};
  const Src = ({ n }) => { const s = b.sources?.find(x => x.n === n); return s ? <a className="src" href={s.url} target="_blank" rel="noreferrer" title={s.title}>[{n}]</a> : null; };
  const options = connectOptions(c);
  const drafts = {};
  for (const o of options) for (const d of ["GET", "PAIN", "RISK"]) for (const k of ["meeting", "referral"]) drafts[`${o.id}|${d}|${k}`] = buildEmail(a, c, { connectId: o.id, driver: d, ask: k, senderName: user?.name });
  const li = Object.fromEntries(options.map(o => [o.id, buildLinkedIn(a, c, { connectId: o.id })]));
  const scored = myCalls.filter(m => m.score?.total != null);

  return (
    <Shell user={user} active="/accounts">
      <div className="row small"><Link href="/accounts">Accounts</Link><span className="muted">/</span><Link href={`/accounts/${a.id}`}>{a.name}</Link><span className="muted">/</span><Link href={`/accounts/${a.id}#contacts`}>Contacts</Link></div>
      <div className="row spread" style={{ alignItems: "flex-start" }}>
        <div className="row" style={{ gap: 14, flexWrap: "nowrap", alignItems: "flex-start" }}>
          <span className="avatar" style={{ width: 56, height: 56, fontSize: 18 }} aria-hidden>{initials(c.name || c.title)}</span>
          <div className="stack" style={{ gap: 4 }}>
            <div className="eyebrow">Person profile · {c.role_type}</div>
            <h1>{c.name || "Name not on file"}</h1>
            <div style={{ fontSize: 17 }}>{c.title} · <Link href={`/accounts/${a.id}`}>{a.name}</Link></div>
            <div className="row small muted" style={{ gap: 12 }}>{c.location && <span>{c.location}</span>}{c.since && <span>In role since {c.since}</span>}<span>Brief reviewed {c.refreshed_at ? fmtDate(c.refreshed_at) : "never"}</span></div>
            <div className="row" style={{ gap: 6 }}><span className="pill">{c.cs.label}</span><span className="pill">Account: {a.stage}</span>{c.bestScore != null && <span className="pill">Best practice {c.bestScore}/100</span>}</div>
          </div>
        </div>
        <div className="stack" style={{ alignItems: "flex-end", gap: 8 }}>
          <BriefDownload contactId={c.id} accountId={a.id} name={c.name || c.title} />
          <Link className="btn accent" href={`/accounts/${a.id}/contacts/${c.id}/mock`}>Start a mock call</Link>
        </div>
      </div>

      <div className="grid-main">
        <div className="stack" style={{ gap: 16 }}>
          {b.sharpest && <section className="sharpest"><div className="eyebrow">Sharpest Signal for {c.name?.split(" ")[0] || "this contact"}</div><p style={{ fontSize: 16.5, fontWeight: 500 }}>{b.sharpest.text} {(b.sharpest.src || []).map(n => <Src key={n} n={n} />)}</p><p className="small"><b>Why it gets the call:</b> {b.sharpest.why}</p></section>}

          <section className="card stack">
            <h2>Who they are</h2>
            <div>{c.why}</div>
            {c.decisions && <div><b>Decisions they own:</b> {c.decisions}</div>}
            <ul className="timeline small">{(c.career || []).map((r, i) => <li key={i}><b>{r.title}</b>, {r.org} <span className="muted">({r.years})</span>{r.note && <div className="muted">{r.note}</div>}</li>)}</ul>
          </section>

          <section className="card stack">
            <div className="card-head" style={{ marginBottom: 0 }}><h2>What we know</h2><span className="small muted">Every <span className="tag i">? inferred</span> line is a question to ask, not a fact to state.</span></div>
            <ul className="list">{(b.known || []).map((l, i) => <li key={i}>{l.text} {l.tag === "verified" ? <span className="tag v">✓ verified</span> : <span className="tag i">? inferred</span>} {l.src ? <Src n={l.src} /> : null}</li>)}</ul>
            {(b.cares || []).length > 0 && <div className="small"><b>Likely cares about:</b> {b.cares.join(" · ")}</div>}
          </section>

          <section className="card stack">
            <h2>Openers (CRVA, tied to their signals)</h2>
            {(b.openers || []).map((o, i) => <div key={i} className="quote"><span className="pill">{o.driver}</span> “{o.text}” {(o.src || []).map(n => <Src key={n} n={n} />)}</div>)}
          </section>

          <section className="card stack">
            <h2>Discovery questions</h2>
            <p className="small muted" style={{ margin: 0 }}>“I know ___. What I don't know is ___.” Then follow on three levels deep without changing topic.</p>
            {(b.questions || []).map((q, i) => <div key={i} className="quote"><div><b>{q.know}</b> {q.dontKnow}</div><ol className="small muted" style={{ margin: "6px 0 0", paddingLeft: 18 }}>{q.ladder.map((x, j) => <li key={j}>{x}</li>)}</ol></div>)}
          </section>

          {b.talkTrack && <section className="card">
            <h2>Talk track</h2>
            {[["C", "Connect", b.talkTrack.C], ["R", "Reason", b.talkTrack.R], ["V", "Value", `GET: ${b.talkTrack.V.GET} · PAIN: ${b.talkTrack.V.PAIN} · RISK: ${b.talkTrack.V.RISK}`], ["A", "Ask", b.talkTrack.A]].map(([p, l, t]) => <div key={p} className="draft-line"><span className="p">{p}</span><div><div className="small muted">{l}</div>{t}</div></div>)}
          </section>}

          <div id="outreach"><Outreach account={{ id: a.id, name: a.name }} contact={{ id: c.id, name: c.name, email: c.email, linkedin_url: c.linkedin_url, title: c.title }} options={options} drafts={drafts} li={li} /></div>

          <NotesPanel accountId={a.id} contactId={c.id} contacts={[{ id: c.id, label: c.name ? `${c.name}, ${c.title}` : c.title }]} notes={myNotes} stage={a.stage} />

          <PersonBriefEditor id={c.id} brief={b} />

          <section className="card">
            <h2>Sources</h2>
            <ol className="small" style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 4 }}>{(b.sources || []).map(s => <li key={s.n} value={s.n}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a> <span className="muted">({s.date})</span></li>)}</ol>
          </section>
        </div>
        <aside className="stack" style={{ gap: 16 }}>
          <ContactPanel contact={c} />
          <section className="card">
            <h2>Next steps with {c.name?.split(" ")[0] || "them"}</h2>
            <ol className="list">{c.next.map((n, i) => <li key={i}>{n}</li>)}</ol>
          </section>
          <section className="card stack small">
            <h2>Practice</h2>
            {scored.length ? <ul className="list">{scored.slice(0, 5).map(m => <li key={m.id}><b>{m.score.total}/100</b> · {m.rep} <span className="muted">({fmtDate(m.created_at)}{m.is_sample ? ", sample" : ""})</span></li>)}</ul> : <p className="muted" style={{ margin: 0 }}>No practice calls yet.</p>}
            <Link className="btn accent" href={`/accounts/${a.id}/contacts/${c.id}/mock`} style={{ justifyContent: "center" }}>Start a mock call</Link>
          </section>
          <section className="card stack small">
            <h2>Company snapshot</h2>
            <p style={{ margin: 0 }}>{a.brief?.overview}</p>
            <ul className="list">{(a.brief?.facts || []).slice(0, 3).map((f, i) => <li key={i}><b>{f.label}:</b> {f.text}</li>)}</ul>
            <Link href={`/accounts/${a.id}`}>Open {a.name}</Link>
          </section>
          {b.research && <section className="card stack small">
            <h2>Research log</h2>
            <div>Agent research <b className="mono">{b.research.agentMinutes} min</b> · human review <b className="mono">{b.research.reviewMinutes} min</b></div>
            <ul className="list">{b.research.gaps.map((g, i) => <li key={i}>{g}</li>)}</ul>
            <MarkReviewed id={c.id} kind="contact" />
          </section>}
          <section className="card stack small">
            <h2>Activity with this person</h2>
            {myActivity.length ? <ul className="timeline">{myActivity.slice(0, 12).map(x => <li key={x.id}><b>{x.actor}</b> {x.action.toLowerCase()}{x.detail ? `: ${x.detail}` : ""}<div className="muted">{fmtDateTime(x.created_at)}</div></li>)}</ul> : <p className="muted" style={{ margin: 0 }}>Nothing logged yet.</p>}
          </section>
        </aside>
      </div>
    </Shell>
  );
}
