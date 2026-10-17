# Shared save format

One record per account, shared by every rep. Production maps this onto the broker's CRM (account, contacts, activities).

## Brief (account.brief)
- `sharpest` — {text, why, src[]}: the single most freight-relevant finding and why it gets the call.
- `freight.ships | where | when | who` — lines of {text, tag: verified|inferred, src}.
- `company` — what's happening now (financials, deals, facilities).
- `openers` — 2–3 CRVA openers tied to signals, each with its GET/PAIN/RISK driver.
- `questions` — {know, dontKnow, ladder[3]}, built from inferred lines.
- `talkTrack` — C, R, V{GET,PAIN,RISK}, A.
- `sources` — numbered list {n, title, url, date}.

Every edit saves the previous version to `brief_history` first.

## Call note (PRN with CQPPPIN)
```
P · Purpose: one sentence (matches the CRVA Reason), entered before the call
R · Results (method; contacts and titles met; decision maker)
    Clarify / Quantify / Process / Progress / Problem / Implication / Needs-payoff
N · Next steps: dated, with an owner · who to loop in · what we owe · still unclear
```
Notes are append-only. The brief shows the newest learnings, with duplicates removed.

## Staleness rules
- Time: brief not reviewed in 60 days = yellow, 90 = red.
- Event: an unreviewed Exa signal in the last 30 days matching freight keywords (new DC, expansion, acquisition, closure, tariff, logistics hiring).
- Activity: no touch in 30 days (14 for Connected / Discovery / Lane test), or an overdue next step. Logged calls and sent emails reset "last touched."
