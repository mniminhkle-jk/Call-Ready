// Clearly labeled sample sales and training data so the dashboards and Training tab aren't empty in the prototype.
// Every row carries is_sample = true. In production these come from Salesforce or HubSpot and from real mock calls.
import { SAMPLE_REPS } from "./seed";

const SAMPLE_SHIPPERS = ["Sample: Midwest Cabinet Co.", "Sample: Gulf Coast Paper", "Sample: Ridgeline Steel Fabricators", "Sample: Lakeshore Appliance", "Sample: Prairie Feed & Grain", "Sample: Summit Furniture Mfg.", "Sample: Delta Packaging", "Sample: Harbor Home Goods"];
const MONTHS = ["2026-07", "2026-08", "2026-09", "2026-10"];

// Deterministic pseudo-random so the sample looks the same on every load.
function rng(seed) { let s = seed; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); }

export function sampleDeals(accountIds) {
  const r = rng(42);
  const out = [];
  const perf = { minhkle: 0.82, "rep-avery": 1.08, "rep-sam": 0.71, "rep-taylor": 0.96 };
  for (const rep of SAMPLE_REPS) {
    for (const m of MONTHS) {
      const target = rep.monthly_quota * perf[rep.id] * (m === "2026-10" ? 0.55 : 0.85 + r() * 0.3); // October is month-to-date
      let got = 0, i = 0;
      while (got < target && i < 12) {
        const margin = Math.round(4000 + r() * 9000);
        const loads = Math.max(3, Math.round(margin / (300 + r() * 250)));
        out.push({ name: `${SAMPLE_SHIPPERS[(i + rep.id.length) % SAMPLE_SHIPPERS.length].replace("Sample: ", "")} lanes ${m}`, customer_name: SAMPLE_SHIPPERS[(i + rep.id.length) % SAMPLE_SHIPPERS.length], owner: rep.id, stage: "Active shipper", status: "won", margin, revenue: Math.round(margin / (0.14 + r() * 0.04)), loads, close_date: `${m}-${String(3 + Math.floor(r() * 24)).padStart(2, "0")}`, is_sample: true });
        got += margin; i++;
      }
      if (r() > 0.5) out.push({ name: `${SAMPLE_SHIPPERS[Math.floor(r() * 8)].replace("Sample: ", "")} RFP ${m}`, customer_name: SAMPLE_SHIPPERS[Math.floor(r() * 8)], owner: rep.id, stage: "Closed lost", status: "lost", margin: Math.round(5000 + r() * 8000), revenue: 0, loads: 0, close_date: `${m}-20`, is_sample: true });
    }
  }
  // Open pipeline, including Minh's three real target accounts (values are estimates, labeled as such).
  const open = [
    { account_id: accountIds[0], name: "BlueLinx: Trex inbound lanes (estimate)", owner: "minhkle", stage: "Outreach", margin: 18000, revenue: 120000, loads: 40, close_date: "2026-12-15" },
    { account_id: accountIds[1], name: "Pirelli: Silao cross-border backup (estimate)", owner: "minhkle", stage: "Research", margin: 24000, revenue: 160000, loads: 55, close_date: "2027-01-31" },
    { account_id: accountIds[2], name: "A. O. Smith: Groveport transfer (estimate)", owner: "minhkle", stage: "Discovery", margin: 9000, revenue: 60000, loads: 25, close_date: "2026-11-30" },
    { customer_name: SAMPLE_SHIPPERS[2], name: "Ridgeline Steel: flatbed program", owner: "rep-avery", stage: "Lane test / Quote", margin: 30000, revenue: 210000, loads: 70, close_date: "2026-11-20" },
    { customer_name: SAMPLE_SHIPPERS[4], name: "Prairie Feed: harvest surge", owner: "rep-sam", stage: "Discovery", margin: 12000, revenue: 85000, loads: 30, close_date: "2026-11-10" },
    { customer_name: SAMPLE_SHIPPERS[6], name: "Delta Packaging: dedicated lanes", owner: "rep-taylor", stage: "Lane test / Quote", margin: 42000, revenue: 290000, loads: 90, close_date: "2026-12-05" },
    { customer_name: SAMPLE_SHIPPERS[7], name: "Harbor Home Goods: peak season", owner: "rep-taylor", stage: "Connected", margin: 15000, revenue: 100000, loads: 35, close_date: "2026-12-20" },
  ];
  for (const o of open) out.push({ ...o, status: "open", is_sample: true });
  return out;
}

export const SAMPLE_TRANSCRIPTS = [
  { rep: "Avery Brooks (sample)", quality: "strong", text: `Rep: Hi, thanks for taking my call. I saw {signal}. How is that going?
Prospect: Busy. What's this about?
Rep: I'm calling because we cover new and surge lanes for shippers like you.
Prospect: We have carriers.
Rep: I know you have a core carrier group. What I don't know is which lanes go to spot first when volume spikes?
Prospect: Usually the long inbound ones.
Rep: How far ahead do you book those?
Prospect: A week, sometimes less.
Rep: What does a late load cost you with a customer?
Prospect: A missed order, basically.
Rep: We can back up those lanes so a dropped load doesn't cost you an order, and cut cost per load in peak.
Prospect: Maybe.
Rep: Would you be open to a 15-minute call next Tuesday to look at two lanes?
Prospect: Tuesday works.` },
  { rep: "Sam Ortiz (sample)", quality: "weak", text: `Rep: Hi, this is Sam with a freight brokerage, do you have a minute?
Prospect: Not really.
Rep: We have great rates and lots of trucks.
Prospect: We're covered.
Rep: Ok, can I send you some information?
Prospect: Sure, send an email.` },
  { rep: "Taylor Nguyen (sample)", quality: "middle", text: `Rep: Thanks for taking the call. I saw {signal}.
Prospect: Yes, it's been a lot.
Rep: I'm calling because we help with capacity during changes like that.
Prospect: What kind of capacity?
Rep: Dry van and flatbed. I noticed you've added new locations. Who books those loads today?
Prospect: Our transportation team.
Rep: We can reduce cost per load and back up your carriers.
Prospect: Ok.
Rep: Can I send you a quote?
Prospect: Send it over.` },
  { rep: "Minh Le", quality: "middle-strong", text: `Rep: Hi, thanks for picking up. I saw {signal}. How is the team handling it?
Prospect: It's hectic.
Rep: The reason I'm calling is we cover transfer and surge loads during changes like this.
Prospect: We've got carriers lined up.
Rep: I know you run a core carrier program. What I don't know is how far it stretches before you go to spot?
Prospect: Not far in peak.
Rep: Which lanes break first?
Prospect: The long ones out of state.
Rep: We can back those up so orders stay on time.
Prospect: Could be useful.
Rep: Would you be open to a call next week?
Prospect: Maybe, email me.` },
];
