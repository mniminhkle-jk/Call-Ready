import Link from "next/link";
import { notFound } from "next/navigation";
import Shell from "@/app/components/Shell";
import SetupNeeded from "@/app/components/SetupNeeded";
import { getUser } from "@/lib/session";
import { ready, accountBundle } from "@/lib/data";
import { connectOptions, buildEmail, buildLinkedIn } from "@/lib/crva";
import ContactPanel from "@/app/components/ContactPanel";
import Outreach from "@/app/components/Outreach";
import NotesPanel from "@/app/components/NotesPanel";

export const dynamic = "force-dynamic";

export default async function ContactPage({ params }) {
  const user = await getUser();
  const status = await ready();
  if (!status.ok) return <Shell user={user}><SetupNeeded status={status} /></Shell>;
  const bundle = await accountBundle(params.id);
  if (!bundle) notFound();
  const { account: a, contacts, notes, assessment } = bundle;
  const c = contacts.find(x => x.id === params.cid);
  if (!c) notFound();
  const options = connectOptions(a, c);
  // Pre-build every combination so the composer switches instantly without an API call.
  const drafts = {};
  for (const o of options) for (const d of ["GET", "PAIN", "RISK"]) for (const k of ["meeting", "referral"]) drafts[`${o.id}|${d}|${k}`] = buildEmail(a, c, { connectId: o.id, driver: d, ask: k, senderName: user?.name });
  const li = {};
  for (const o of options) li[o.id] = buildLinkedIn(a, c, { connectId: o.id });
  const myNotes = notes.filter(n => n.contact_id === c.id);

  return (
    <Shell user={user}>
      <div className="row small"><Link href={`/accounts/${a.id}`}>← {a.name}</Link><span className={`chip ${assessment.level}`}>{assessment.label}</span><span className="pill">{a.stage}</span></div>
      <div className="stack" style={{ gap: 4 }}>
        <div className="eyebrow">{c.role_type} · {a.name}</div>
        <h1>{c.name || "Name not on file"}</h1>
        <div style={{ fontSize: 17 }}>{c.title}</div>
      </div>

      <div className="grid-main">
        <div className="stack" style={{ gap: 16 }}>
          <section className="card stack">
            <h2>Why they matter</h2>
            <div>{c.why || <span className="muted">Not filled in yet.</span>}</div>
            {c.decisions && <div><b>Decisions they own:</b> {c.decisions}</div>}
            <div className="sharpest" style={{ padding: "12px 14px" }}><div className="eyebrow">Account Sharpest Signal</div><p className="small">{a.brief?.sharpest?.text}</p></div>
          </section>

          <Outreach account={{ id: a.id, name: a.name }} contact={{ id: c.id, name: c.name, email: c.email, linkedin_url: c.linkedin_url, title: c.title }} options={options} drafts={drafts} li={li} />

          <NotesPanel accountId={a.id} contactId={c.id} contacts={[{ id: c.id, label: c.name ? `${c.name}, ${c.title}` : c.title }]} notes={myNotes} stage={a.stage} />
        </div>
        <aside className="stack" style={{ gap: 16 }}>
          <section className="card stack">
            <h2>Practice first</h2>
            <p className="small" style={{ margin: 0 }}>Run a voice mock call against an AI version of this prospect, built from the account brief. You'll get a Call Readiness Score against a visible CRVA rubric.</p>
            <Link className="btn accent" href={`/accounts/${a.id}/contacts/${c.id}/mock`} style={{ justifyContent: "center" }}>Start a mock call</Link>
          </section>
          <ContactPanel contact={c} />
        </aside>
      </div>
    </Shell>
  );
}
