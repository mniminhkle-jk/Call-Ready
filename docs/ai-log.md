# AI log

**Tools:** Exa (search, signal watch), Retell + OpenAI gpt-4.1-mini (mock-call persona), Granola (meeting notes), Supabase, GitHub, Vercel. Claude helped build the portal during development; it isn't used at runtime.

**Workflow:** company name → Exa searches (company site, press releases, filings, trade press, public job postings; last 90 days) → findings sorted into the fixed brief structure → human picks the Sharpest Signal and checks each verified/inferred label → saved to the shared record and to `briefs/` in GitHub.

**Research time (2026-10-17):** about 2 minutes of agent search per prospect, plus 15–20 minutes of human review per brief.

## Times the AI was confidently wrong

| What | Detail | How we caught it |
|---|---|---|
| Wrong number | A LinkedIn enrichment result said A. O. Smith has "2,000–3,000 employees"; the company's own postings say ~12,000. | Cross-checked the company's own site. Rule: company-reported figures win. |
| Stale source | A 2014 article listed a Pirelli warehouse in Fontana, CA; a 2022 Kuehne+Nagel release says Rialto, CA. | Checked source dates; kept the newest, marked the old article as background only. |
| Stale ownership fact | A June 2026 article gave Sinochem's Pirelli stake as 34.1%; it fell to 20.1% after a July sale. | Compared dates across sources. |
| Misread priority | The agent ranked BlueLinx's earnings headline first; the Trex/RDI/LP rollouts are the real freight signal. | Human judgment: "Would this make a logistics lead take the call?" |
