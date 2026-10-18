import Link from "next/link";
import { notFound } from "next/navigation";
import Shell from "@/app/components/Shell";
import SetupNeeded from "@/app/components/SetupNeeded";
import { getUser } from "@/lib/session";
import { ready, contactBundle } from "@/lib/data";
import { connectOptions, buildEmail, buildLinkedIn } from "@/lib/crva";
import { fmtDate } from "@/app/components/api";
import Outreach from "@/app/components/Outreach";
import NotesPanel from "@/app/components/NotesPanel";
import Tabs from "@/app/components/Tabs";
import ActivityFeed from "@/app/components/ActivityFeed";
import { ContactStrip, ConnectHooks } from "@/app/components/ContactParts";
import { MarkReviewed, PersonBriefEditor } from "@/app/components/AccountActions";

export const dynamic = "force-dynamic";
const initials = n => (n || "?").split(" ").map(x => x[0]).slice(0, 2).join("");

export default async function ContactPage({ params }) {
  const user = await getUser();
  const status = await ready();
  if (!status.ok) return <Shell user={user} active="/accounts"><SetupNeeded status={status} /></Shell>;
  const bundle = await contactBundle(params.id, params.cid);
  if (!bundle) notFound();
  const { account: a, contact: c, myNotes, myCalls, myActivity, signals } = bundle;
  const b = c.brief || {};
  const first = c.name?.split(" ")[0] || "them";
  const Src = ({ n }) => { const s = b.sources?.find(x => x.n === n); return s ? <a className="src" href={s.url} target="_blank" rel="noreferrer" title={s.title} aria-label={`Source ${n}: ${s.title}`}>[{n}]</a> : null; };
  const Tag = ({ l }) => (l.tag === "verified" ? <span className="tag v">✓ verified</span> : <span className="tag i">? inferred</span>);
  const options = connectOptions(c);
  const drafts = {};
  for (const o of options) for (const d of ["GET", "PAIN", "RISK"]) for (const k of ["meeting", "referral"]) drafts[`${o.id}|${d}|${k}`] = buildEmail(a, c, { connectId: o.id, driver: d, ask: k, senderName: user?.name });
  const li = Object.fromEntries(options.map(o => [o.id, buildLinkedIn(a, c, { connectId: o.id })]));
  const scored = myCalls.filter(m => m.score?.total != null);
  const news = signals.filter(s => s.status !== "dismissed").slice(0, 3);
  const openers = b.openers || [], questions = b.questions || [];

  return (
    <Shell user={user} active="/accounts">
      <nav aria-label="Breadcrumb" className="row small"><Link href="/accounts">Accounts</Link><span className="muted" aria-hidden="true">/</span><Link href={`/accounts/${a.id}`}>{a.name}</Link><span className="muted" aria-hidden="true">/</span><span aria-current="page">{c.name || c.title}</span></nav>

      <div className="hero">
        <div className="row" style={{ gap: 14, flexWrap: "nowrap", alignItems: "center", minWidth: 0 }}>
          <span className="avatar" style={{ width: 56, height: 56, fontSize: 18 }} aria-hidden="true">{initials(c.name || c.title)}</span>
          <div style={{ minWidth: 0 }}>
            <h1>{c.name || "Name not on file"}</h1>
            <p className="sub">{c.title} · <Link href={`/accounts/${a.id}`}>{a.name}</Link></p>
            <div className="row small" style={{ gap: 6, marginTop: 6 }}><span className="pill">{c.cs.label}</span>{c.location && <span className="muted">{c.location}</span>}{c.since && <span className="muted">· in role since {c.since.slice(0, 4)}</span>}</div>
          </div>
        </div>
        <div className="actions-bar">
          <Outreach account={{ id: a.id, name: a.name }} contact={{ id: c.id, name: c.name, email: c.email, linkedin_url: c.linkedin_url, title: c.title }} options={options} drafts={drafts} li={li} />
          <Link className="btn accent" href={`/accounts/${a.id}/contacts/${c.id}/mock`} data-guide="mock-call">Practice call</Link>
          <a className="btn secondary" href={`/api/contacts/${c.id}/brief?format=docx`} data-guide="brief-docx">Brief (.docx)</a>
        </div>
      </div>

      <ContactStrip contact={c} lastTouch={c.last_touched_at} />

      <div className="grid-main">
        <div style={{ minWidth: 0 }}>
          <Tabs tabs={[{ id: "prep", label: "Call prep" }, { id: "background", label: "Background" }, { id: "notes", label: "Notes", count: myNotes.length }, { id: "activity", label: "Activity" }]} panels={[
<>
              {b.sharpest && <section className="sharpest" aria-labelledby="h-sharp"><div className="eyebrow" id="h-sharp">Sharpest Signal</div><p style={{ fontSize: 16.5, fontWeight: 500 }}>{b.sharpest.text} {(b.sharpest.src || []).map(n => <Src key={n} n={n} />)}</p><details className="more"><summary>Why it gets the call</summary><p className="small" style={{ margin: "4px 0 0" }}>{b.sharpest.why}</p></details></section>}
              <section className="card stack" aria-labelledby="h-open">
                <h2 id="h-open">Open with</h2>
                {openers[0] && <div className="quote"><span className="pill">{openers[0].driver}</span> “{openers[0].text}”</div>}
                {openers.length > 1 && <details className="more"><summary>{openers.length - 1} more openers</summary><div className="stack" style={{ marginTop: 8 }}>{openers.slice(1).map((o, i) => <div key={i} className="quote"><span className="pill">{o.driver}</span> “{o.text}”</div>)}</div></details>}
              </section>
              <section className="card stack" aria-labelledby="h-ask">
                <h2 id="h-ask">Ask</h2>
                {questions[0] && <div className="quote"><div><b>{questions[0].know}</b> {questions[0].dontKnow}</div><ol className="small muted" style={{ margin: "6px 0 0", paddingLeft: 18 }}>{questions[0].ladder.map((x, j) => <li key={j}>{x}</li>)}</ol></div>}
                {questions.length > 1 && <details className="more"><summary>{questions.length - 1} more questions</summary><div className="stack" style={{ marginTop: 8 }}>{questions.slice(1).map((q, i) => <div key={i} className="quote"><div><b>{q.know}</b> {q.dontKnow}</div><ol className="small muted" style={{ margin: "6px 0 0", paddingLeft: 18 }}>{q.ladder.map((x, j) => <li key={j}>{x}</li>)}</ol></div>)}</div></details>}
              </section>
              {b.talkTrack && <section className="card" aria-labelledby="h-track">
                <h2 id="h-track">Talk track</h2>
                {[["C", "Connect", b.talkTrack.C], ["R", "Reason", b.talkTrack.R], ["V", "Value", b.talkTrack.V.PAIN], ["A", "Ask", b.talkTrack.A]].map(([p, l, t]) => <div key={p} className="draft-line"><span className="p" aria-hidden="true">{p}</span><div><div className="small muted">{l}</div>{t}</div></div>)}
                <details className="more"><summary>Other value angles</summary><ul className="list small" style={{ marginTop: 6 }}><li><b>GET:</b> {b.talkTrack.V.GET}</li><li><b>RISK:</b> {b.talkTrack.V.RISK}</li></ul></details>
              </section>}
            </>,
<>
              <section className="card stack" aria-labelledby="h-who">
                <h2 id="h-who">Who they are</h2>
                <p style={{ margin: 0 }}>{c.why}</p>
                {c.decisions && <p className="small" style={{ margin: 0 }}><b>Decides:</b> {c.decisions}</p>}
                <ul className="timeline small">{(c.career || []).map((r, i) => <li key={i}><b>{r.title}</b>, {r.org} <span className="muted">({r.years})</span>{r.note && <div className="muted">{r.note}</div>}</li>)}</ul>
              </section>
              <section className="card stack" aria-labelledby="h-know">
                <div className="section-title"><h2 id="h-know">What we know</h2><span className="small muted">Ask about anything inferred</span></div>
                <ul className="list">{(b.known || []).map((l, i) => <li key={i}>{l.text} <Tag l={l} /> {l.src ? <Src n={l.src} /> : null}</li>)}</ul>
                {(b.cares || []).length > 0 && <p className="small" style={{ margin: 0 }}><b>Likely cares about:</b> {b.cares.join(" · ")}</p>}
              </section>
              <ConnectHooks contact={c} />
              <details className="card more" style={{ marginTop: 0 }}>
                <summary>Research log and sources</summary>
                <div className="stack small" style={{ marginTop: 8 }}>
                  {b.research && <div>Researched in {b.research.agentMinutes} min, reviewed in {b.research.reviewMinutes} min. Last reviewed {c.refreshed_at ? fmtDate(c.refreshed_at) : "never"}.</div>}
                  {b.research?.gaps?.length > 0 && <ul className="list">{b.research.gaps.map((g, i) => <li key={i}>{g}</li>)}</ul>}
                  <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 4 }}>{(b.sources || []).map(s => <li key={s.n} value={s.n}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a> <span className="muted">({s.date})</span></li>)}</ol>
                  <MarkReviewed id={c.id} kind="contact" />
                </div>
              </details>
              <PersonBriefEditor id={c.id} brief={b} />
            </>,
<NotesPanel accountId={a.id} contactId={c.id} contacts={[{ id: c.id, label: c.name ? `${c.name}, ${c.title}` : c.title }]} notes={myNotes} stage={a.stage} />,
<ActivityFeed items={myActivity} title={`Activity with ${first}`} />
          ]} />
        </div>
        <aside className="stack" style={{ gap: 16 }}>
          <section className="card" aria-labelledby="h-next">
            <h2 id="h-next">Next steps</h2>
            <ol className="list">{c.next.map((n, i) => <li key={i}>{n}</li>)}</ol>
          </section>
          <section className="card stack" aria-labelledby="h-practice">
            <h2 id="h-practice">Practice</h2>
            <p className="small" style={{ margin: 0 }}>{scored.length ? <>Best score <b>{Math.max(...scored.map(m => m.score.total))}/100</b> from {scored.length} practice call{scored.length === 1 ? "" : "s"}.</> : "Not practiced yet."}</p>
            <Link className="btn accent" href={`/accounts/${a.id}/contacts/${c.id}/mock`} style={{ justifyContent: "center" }}>Practice call</Link>
          </section>
          <section className="card stack" aria-labelledby="h-news">
            <h2 id="h-news">{a.name} updates</h2>
            {news.length ? <ul className="timeline small">{news.map(s => <li key={s.id}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a><div className="muted">{s.published_at ? fmtDate(s.published_at) : ""}</div></li>)}</ul> : <p className="muted small" style={{ margin: 0 }}>No recent updates.</p>}
            <Link href={`/accounts/${a.id}`} className="small">Open {a.name}</Link>
          </section>
        </aside>
      </div>
    </Shell>
  );
}
