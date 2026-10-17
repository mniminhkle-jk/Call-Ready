import Shell from "../components/Shell";
import { getUser } from "@/lib/session";
import { STALE_RULES } from "@/lib/rules";
import { RUBRIC } from "@/lib/score";
import { SEED_ACCOUNTS } from "@/lib/seed";

export const metadata = { title: "How it works · Call Ready" };

const AI_LOG = [
  { what: "Confidently wrong number", detail: "A LinkedIn data-enrichment result returned by the search said A. O. Smith has “2,000–3,000 employees.” The company's own job postings say about 12,000.", caught: "Cross-checked against the company's own site. Rule added: company-reported figures beat enrichment data." },
  { what: "Stale source", detail: "A 2014 trade article listed a Pirelli warehouse in Fontana, CA. A 2022 Kuehne+Nagel release says the West Coast site is Rialto, CA.", caught: "Checked the source date. The brief uses the newest source and marks the older article as background only." },
  { what: "Stale ownership fact", detail: "A June 2026 article gave Sinochem's Pirelli stake as 34.1%. A September article says it fell to 20.1% after a July sale.", caught: "Compared the dates of the two sources and kept the later figure." },
  { what: "Stale person record", detail: "One profile showed John Mears as A. O. Smith's Director of Logistics, \"current since 1996.\" A second profile shows he left for Regal Beloit in 2011.", caught: "Cross-checked people against a second source before adding them. He was left out." },
  { what: "Conflicting titles", detail: "Ted Karamanos's headline says \"Director of Global Logistics\"; his experience says \"Director of Distribution.\"", caught: "Flagged on his profile: confirm the title before calling." },
  { what: "Personal contact info in public profiles", detail: "Two public profiles listed personal emails and a personal phone number.", caught: "Not stored. The portal keeps public company lines only; direct lines and emails come from the CRM." },
  { what: "Misread signal priority", detail: "The agent ranked BlueLinx's Q2 earnings headline as the top signal. The Trex, RDI and LP SmartSide rollouts point much more directly at new freight.", caught: "Human judgment on the Sharpest Signal: “Would this make a logistics lead take the call?”" },
];

export default async function How() {
  const user = await getUser();
  return (
    <Shell user={user} active="/how-it-works">
      <div className="stack" style={{ gap: 4, maxWidth: 820 }}>
        <div className="eyebrow">How it works</div>
        <h1>From a company name to a brief a rep trusts in two minutes</h1>
        <p className="muted" style={{ margin: 0 }}>Public sources only: no logins, no scraping behind walls, no invented facts. Every claim is labeled verified (with a numbered source) or inferred. Every inferred line becomes a discovery question.</p>
      </div>

      <section className="card stack">
        <h2>1 · The reusable build</h2>
        <ol className="list">
          <li><b>Research:</b> Exa searches company sites, press releases, trade press, filings and public job postings for the last 90 days, using freight keywords (new DC, expansion, acquisition, closure, tariff, logistics hiring).</li>
          <li><b>Company profile:</b> the facts we found (overview, revenue, footprint, freight facts, locations, public phone lines, news), each with a source. No guessing at the company level.</li>
          <li><b>Person brief:</b> 3–4 people per company from public profiles, each with a Sharpest Signal, what we know (verified or inferred), openers, “I know / I don't know” questions, a talk track, a one-page .docx and a mock call.</li>
          <li><b>Human check:</b> a rep confirms the Sharpest Signal and the verified/inferred labels. Point it at any new prospect from <a href="/new">Add account</a>.</li>
        </ol>
        <div className="table-wrap"><table><thead><tr><th>Person</th><th>Company</th><th>Agent research</th><th>Human review</th><th>Where the agent fell short</th></tr></thead><tbody>
          {SEED_ACCOUNTS.flatMap(a => a.contacts.map(c => <tr key={c.name}><td>{c.name}</td><td>{a.name}</td><td className="mono">{c.brief.research.agentMinutes} min</td><td className="mono">{c.brief.research.reviewMinutes} min</td><td className="small">{c.brief.research.gaps[0]}</td></tr>))}
        </tbody></table></div>
      </section>

      <section className="card stack">
        <h2>2 · Shared save format</h2>
        <p style={{ margin: 0 }}>Each account is one shared record. The brief, contacts, signals and notes are all attached to it, so the next rep starts where the last one stopped. Briefs are also kept as markdown in GitHub, where every refresh is a commit you can compare with the last one. In production, this record maps onto the broker's CRM.</p>
        <h3>Call note template (PRN with CQPPPIN)</h3>
        <pre className="mono small" style={{ background: "var(--panel-2)", border: "1px solid var(--line)", borderRadius: 6, padding: 12, overflowX: "auto" }}>{`P · Purpose: one sentence, matches the CRVA Reason. Entered before the call.
R · Results (method: phone / Zoom / F2F · contacts and titles met)
   Clarify      What did they really mean? Who owns carrier decisions?
   Quantify     Loads per week, lanes, equipment, by when
   Process      How freight moves today: fleet, carriers, brokers, TMS
   Progress     How they're doing against their goals
   Problem      What's broken: late loads, rejected tenders, cost
   Implication  What happens if it continues
   Needs-payoff What would be better if solved
N · Next steps: dated, with an owner · who else to loop in · what we owe them · still unclear`}</pre>
        <p className="small muted" style={{ margin: 0 }}>Notes are append-only. New notes never overwrite old ones, and the brief shows the newest learnings with duplicates removed. Brief edits save the previous version first.</p>
      </section>

      <section className="card stack">
        <h2>3 · When a brief goes stale</h2>
        <ul className="list">
          <li><b>Time:</b> brief not reviewed in {STALE_RULES.briefYellowDays} days turns yellow; {STALE_RULES.briefRedDays} days turns red.</li>
          <li><b>Event:</b> the Exa watch finds a new freight signal in the last {STALE_RULES.freshSignalDays} days that nobody has reviewed.</li>
          <li><b>Activity:</b> no logged touch in {STALE_RULES.contactGapDays} days ({STALE_RULES.activeStageGapDays} for active deals), or a PRN next step is overdue. Any logged call or sent email resets “last touched.”</li>
        </ul>
        <p className="small muted" style={{ margin: 0 }}>The account shows green, yellow or red with the rule that fired, so the reason is never a black box.</p>
      </section>

      <section className="card stack">
        <h2>4 · Outreach and practice</h2>
        <ul className="list">
          <li><b>CRVA drafts:</b> email and LinkedIn notes (under 200 characters) are assembled from sourced brief lines, with each line showing where it came from. The rep edits and sends from their own email. Nothing sends automatically.</li>
          <li><b>Personal hooks</b> (a past career, a hometown) are locked until a rep confirms the person shared it publicly. Curious, not creepy.</li>
          <li><b>Mock calls:</b> Retell voice agent (OpenAI model) playing a persona built from the brief. Capped at 5 minutes per call, and no new calls start once committed spend could pass the $9 cap, which keeps usage under the $10 free credit.</li>
        </ul>
        <div className="table-wrap"><table><thead><tr><th>Call Readiness rubric</th><th>Points</th></tr></thead><tbody>{RUBRIC.map(r => <tr key={r.id}><td><b>{r.part} · {r.label}</b><div className="small muted">{r.test}</div></td><td className="mono">{r.points}</td></tr>)}</tbody></table></div>
      </section>

      <section className="card stack">
        <h2>5 · AI log: where the AI was confidently wrong</h2>
        <div className="table-wrap"><table><thead><tr><th>What</th><th>Detail</th><th>How we caught it</th></tr></thead><tbody>
          {AI_LOG.map((x, i) => <tr key={i}><td><b>{x.what}</b></td><td className="small">{x.detail}</td><td className="small">{x.caught}</td></tr>)}
        </tbody></table></div>
        <p className="small muted" style={{ margin: 0 }}>Tools: Exa (search and the signal watch), Retell (voice and OpenAI persona), Granola (meeting notes), Supabase (shared record), GitHub (versioned briefs), Vercel (hosting). Drafts, scoring and staleness are rule-based, so every output traces to a source or a rule.</p>
      </section>
    </Shell>
  );
}
