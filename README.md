# Call Ready

Prospect intelligence for freight brokerage sales reps. Built for the Neeley AI Forward case "Call Ready: A Sales Intelligence Agent for Freight Brokerage."

A rep searches a prospect, opens a one-page brief they can read in under two minutes, drafts CRVA outreach, practices the call with a voice mock prospect, and logs PRN notes that every rep can see.

## What's in it

| Area | How it works |
|---|---|
| Briefs | Sharpest Signal, freight profile (ships / where / when / who moves it), openers, "I know / I don't know" questions, talk track, sources. Every line is labeled **verified** (numbered source) or **inferred**. |
| Sample accounts | BlueLinx (distributor), Pirelli Tire North America (manufacturer), A. O. Smith (manufacturer). See `briefs/`. |
| Research | Exa search on public sources only, last 90 days, freight keywords. Add a new account from a company name. |
| Staleness | Rule-based: time (brief age 60/90 days), event (new unreviewed Exa signal), activity (no touch in 30 days, 14 on active deals, overdue next steps). |
| Outreach | CRVA email and LinkedIn note (<200 chars) assembled from sourced lines; each line shows its source; rep edits and sends. No auto-send. Personal hooks are locked until a rep confirms them. |
| Notes | PRN with CQPPPIN, append-only. Granola meetings can be imported and sorted into PRN buckets for the rep to review. |
| Mock calls | Retell voice agent on an OpenAI model (gpt-4.1-mini), persona built from the brief. 5-minute cap per call; new calls are blocked before $9 of spend so the $10 free credit can't be exceeded. Graded with a visible Call Readiness rubric. |
| Export | One-page .docx and markdown brief per account, merged with the latest signals and notes (no duplicates). |
| Team | Shared record per account, activity feed and pipeline view for managers. |

No Anthropic or Google AI is used. Drafts, scoring and staleness are rule-based.

## Stack

Next.js 14 (App Router) on Vercel · Supabase Postgres (shared record; row-level security on, server-only access) · Exa · Retell · Granola · GitHub (versioned briefs).

## Setup

1. Run `supabase/migrations/20261017000000_init.sql` in the Supabase SQL editor (or let the Supabase GitHub integration apply it). The app shows the SQL if tables are missing.
2. Environment variables on Vercel: `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `EXA_API_KEY`, `RETELL_API_KEY`, `GRANOLA_API_KEY`, `SESSION_SECRET`, `PORTAL_USERNAME`, `PORTAL_PASSWORD_SHA256`, optional `RETELL_BUDGET_CENTS` (default 900), `RETELL_MODEL` (default gpt-4.1-mini).
3. First page load seeds the three sample accounts.

`npm run briefs` regenerates `briefs/*.md` from `lib/seed.js`.

See `docs/` for the shared save format and the AI log.
