# Call Ready

Prospect intelligence for freight brokerage sales reps. Built for the Neeley AI Forward case "Call Ready: A Sales Intelligence Agent for Freight Brokerage."

A rep searches a prospect, opens a one-page brief they can read in under two minutes, drafts CRVA outreach, practices the call with a voice mock prospect, and logs PRN notes that every rep can see.

## What's in it

| Area | How it works |
|---|---|
| Tabs | **Main Hub** (who to reach out to, follow-ups, practice), **Accounts** (search companies and people), **Training** (mock-call results), **Dashboards** (quota attainment, margin trend, pipeline, rep scorecard). |
| Company profile | Facts found with sources: overview, address, public phone lines, revenue, footprint, freight facts, locations, leadership, news. No guessing at company level. |
| Person profile | 3–4 people per company from public profiles: contact info (direct phone and email left blank unless they come from Salesforce/HubSpot or a rep logs them; company switchboards stay on the company profile), career, Connect hooks, Sharpest Signal, what we know (verified/inferred), openers, "I know / I don't know" questions, talk track, one-page .docx, mock call, CRVA drafts, PRN notes. |
| Sample accounts | BlueLinx, Pirelli Tire North America, A. O. Smith, 12 people total. See `briefs/<company>/`. |
| Activity | One feed per account and per person: stage changes, opportunities, emails and calls from Salesforce and HubSpot, plus everything logged in Call Ready. Each row shows its source. |
| CRM data | No CRM screen for reps. Every record carries `sf_id` / `hubspot_id`; `lib/crm.js` and `/api/crm/*` export, import and push/pull in each CRM's format. Quota, deals and activity in the prototype come from the seeded database. |
| Guide | A chat helper (bottom right) that suggests the next thing to do based on the page you're on and answers "how do I…" questions by pointing to the right button. |
| Research | Exa search on public sources only, last 90 days, freight keywords. Add a new account from a company name. |
| Staleness | Rule-based: time (brief age 60/90 days), event (new unreviewed Exa signal), activity (no touch in 30 days, 14 on active deals, overdue next steps). |
| Outreach | CRVA email and LinkedIn note (<200 chars) assembled from sourced lines; each line shows its source; rep edits and sends. No auto-send. Personal hooks are locked until a rep confirms them. |
| Notes | PRN with CQPPPIN, append-only. A note needs a purpose, at least 3 of the 7 CQPPPIN results, and a dated next step (checked in the form and on the server). Granola meetings can be imported and sorted into PRN buckets for the rep to review. |
| Mock calls | Retell voice agent on an OpenAI model (gpt-4.1-mini), persona built from the brief. 5-minute cap per call; new calls are blocked before $9 of spend so the $10 free credit can't be exceeded. Graded with a visible Call Readiness rubric. |
| Export | One-page .docx and markdown brief per account, merged with the latest signals and notes (no duplicates). |

No Anthropic or Google AI is used. Drafts, scoring and staleness are rule-based.

## Stack

Next.js 14 (App Router) on Vercel · Supabase Postgres (shared record; row-level security on, server-only access) · Exa · Retell · Granola · GitHub (versioned briefs).

## Setup

1. Run `supabase/migrations/20261017000000_init.sql` in the Supabase SQL editor (or let the Supabase GitHub integration apply it). The app shows the SQL if tables are missing.
2. Environment variables on Vercel: `HUBSPOT_ACCESS_TOKEN` and/or `SALESFORCE_INSTANCE_URL` + `SALESFORCE_ACCESS_TOKEN` (optional, for live CRM sync), `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `EXA_API_KEY`, `RETELL_API_KEY`, `GRANOLA_API_KEY`, `SESSION_SECRET`, `PORTAL_USERNAME`, `PORTAL_PASSWORD_SHA256`, optional `RETELL_BUDGET_CENTS` (default 900), `RETELL_MODEL` (default gpt-4.1-mini).
3. First page load seeds the three sample accounts.

`npm run briefs` regenerates `briefs/<company>/*.md` from `lib/seed.js`. Run locally without a database with `DEMO_MODE=1 npm run dev`.

Sales and some practice data in the prototype are seeded sample rows (`is_sample = true` in the database, not shown as labels in the UI); production pulls deals, quotas and activity from the CRM.

See `docs/` for the shared save format, the AI log and the usability audit (`docs/usability-audit.md`).
