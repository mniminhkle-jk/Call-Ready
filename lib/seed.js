// Seed data for Call Ready. Researched 2026-10-17 with Exa from public sources only
// (company sites, SEC filings, press releases, trade press, public job postings, public LinkedIn profiles).
// Company profile = facts we found. Person profile = analyzed brief (Sharpest Signal, openers, questions, talk track).
// Every line is tagged "verified" (numbered source) or "inferred" (a flagged guess that becomes a discovery question).
// Phone numbers are public company lines only. Direct lines and emails come from the CRM, never from scraping.

export const RESEARCHED_ON = "2026-10-17";
const LI_DATE = "2026-10";
const n = list => list.map((s, i) => ({ n: i + 1, ...s }));

// ───────── Shared source records ─────────
const BXC = {
  q2: { title: "BlueLinx Announces Second Quarter 2026 Results", url: "https://investors.bluelinxco.com/news/news-details/2026/BlueLinx-Announces-Second-Quarter-2026-Results/default.aspx", date: "2026-08-04" },
  trex: { title: "BlueLinx and Trex announce new distribution relationship", url: "https://investors.bluelinxco.com/news/news-details/2026/BlueLinx-and-Trex-Announce-New-Distribution-Relationship-and-Inventory-Landing-Across-Key-U-S--Growth-Markets/default.aspx", date: "2026-09-03" },
  rdi: { title: "BlueLinx expands RDI railing distribution to 21 locations", url: "https://investors.bluelinxco.com/news/news-details/2026/BlueLinx-Expands-RDI-Railing-Distribution-to-21-Locations-Across-Key-U-S--Markets/default.aspx", date: "2026-09-15" },
  lp: { title: "BlueLinx expands LP SmartSide trim & siding offering", url: "https://investors.bluelinxco.com/news/news-details/2026/BlueLinx-Expands-LP-SmartSide-Trim--Siding-Offering-Across-Key-U-S--Markets/default.aspx", date: "2026-09-29" },
  disdero: { title: "BlueLinx acquires Disdero Lumber Company", url: "https://investors.bluelinxco.com/news/news-details/2025/BlueLinx-Acquires-Disdero-Lumber-Company/default.aspx", date: "2025-11-03" },
  lease: { title: "BlueLinx leases 66,000 SF in Portland (The Registry)", url: "https://news.theregistryps.com/bluelinx-leases-66000-sqft-from-clarion-partners-in-portlands-east-columbia-corridor-as-market-leasing-hits-2008-lows/", date: "2026-07-31" },
  trex10k: { title: "Trex 10-K (plants in Winchester VA, Fernley NV; Little Rock decking 2027)", url: "https://www.sec.gov/Archives/edgar/data/1069878/000119312526068732/trex-20251231.htm", date: "2026-02-25" },
  tenk: { title: "BlueLinx 10-K for fiscal 2025 (57 branch cities, HQ, suppliers)", url: "https://www.sec.gov/Archives/edgar/data/1301787/000162828026011136/bxc-20260103.htm", date: "2026-02" },
  contact: { title: "BlueLinx contact page", url: "https://bluelinxco.com/contact-us/", date: "2026" },
  vendor: { title: "BlueLinx supplier portal contact", url: "https://vendor.bluelinxco.com/Home/Contact", date: "2026" },
};
const PIR = {
  board: { title: "Pirelli board approves US multi-year investment plan of ~€1B", url: "https://press.pirelli.com/pirelli-board-of-directors-majority-approves-us-multi-year-investment-plan-of-approximately-1-billion/", date: "2026-09-22" },
  cbs: { title: "Pirelli plans $1.2B expansion at Georgia headquarters (CBS Atlanta)", url: "https://www.cbsnews.com/atlanta/news/italian-tire-company-pirelli-plans-1-2-billion-expansion-at-georgia-headquarters-creating-1000-jobs/", date: "2026-09-23" },
  cyber: { title: "Pirelli will start Cyber Tyre production in Georgia", url: "https://press.pirelli.com/pirelli-will-start-cyber-tyre-production-in-georgia-underlining-the-strategic-importance-of-the-us-market/", date: "2026-05-06" },
  erj: { title: "Pirelli: key role for Mexico plant in tariff-response strategy (ERJ)", url: "https://www.european-rubber-journal.com/article/2097859/mexico-to-support-pirelli-to-mitigate-us-tariff", date: "2025-08-14" },
  erj9m: { title: "Pirelli nine-month results amid tariff headwinds (ERJ)", url: "https://www.european-rubber-journal.com/article/2098307/pirelli-reports-nine-month-growth-as-sales-impacted-by-currency-effects", date: "2025-11-10" },
  kn: { title: "Pirelli and Kuehne+Nagel extend cooperation (McDonough GA, Rialto CA)", url: "https://newsroom.kuehne-nagel.com/almost-two-decades-of-contract-logistics-partnership--pirelli-and-kuehnenagel-extend-cooperation-again/", date: "2022-10-05" },
  al: { title: "Pirelli Tire's logistics team on next-gen WMS/TMS (Automotive Logistics)", url: "https://www.automotivelogistics.media/red-sofa-interviews/john-godfrey-at-pirelli-tire-on-incorporating-next-gen-digital-management-systems/337993", date: "2025-06-19" },
  ustma: { title: "Pirelli Tire LLC member profile (USTMA): facilities, offices, phone", url: "https://www.ustires.org/about-us/members/pirelli-tire-llc", date: "2026" },
  cs: { title: "Pirelli US customer service contact", url: "https://www.pirelli.com/tires/en-us/car/about-us/contact-us", date: "2026" },
  ja: { title: "Pirelli approves €1bn US plant expansion plan (Just Auto)", url: "https://www.just-auto.com/news/pirelli-e1bn-us-plant-expansion-plan/", date: "2026-09-23" },
  usmca: { title: "USMCA Joint Review status (ICPA)", url: "https://www.icpainc.org/usmca-joint-review-steel-aluminum/", date: "2026-07-20" },
};
const AOS = {
  ar: { title: "A. O. Smith 2025 Annual Report / 10-K", url: "https://www.aosmith.com/on/demandware.static/-/Sites-aosmith-Library/default/dw9faf4a3d/pdf/2025-Annual-Report.pdf", date: "2026-02" },
  q2: { title: "A. O. Smith reports second quarter 2026 results", url: "https://investor.aosmith.com/node/23136/pdf", date: "2026-07-30" },
  call: { title: "A. O. Smith Q2 2026 earnings call transcript (Motley Fool)", url: "https://www.fool.com/earnings/call-transcripts/2026/08/03/ao-smith-aos-q2-2026-earnings-call-transcript/", date: "2026-08-03" },
  grove: { title: "A. O. Smith to close Groveport plants, move production (NBC4)", url: "https://www.nbc4i.com/news/local-news/groveport/international-company-to-shutter-groveport-plants-lay-off-nearly-100-employees/", date: "2026-07-19" },
  lv: { title: "A. O. Smith completes acquisition of Leonard Valve", url: "https://investor.aosmith.com/news-releases/news-release-details/o-smith-completes-acquisition-leonard-valve-company", date: "2026-01-06" },
  q1: { title: "A. O. Smith reports first quarter 2026 results (Ashland City storm damage)", url: "https://investor.aosmith.com/news-releases/news-release-details/o-smith-reports-first-quarter-2026-results-and-lowers-full-year", date: "2026-04-30" },
  about: { title: "A. O. Smith About Us: locations and what each makes", url: "https://www.aosmith.com/about-us.html", date: "2026" },
  fac: { title: "A. O. Smith Water Products global facilities (addresses, phones)", url: "https://www.hotwater.com/about-us/global-facilities.html", date: "2026" },
  shafer: { title: "Q&A with A. O. Smith CEO Stephen Shafer (Contractor Magazine)", url: "https://www.contractormag.com/industry-event-news/ahr/article/55355529/direct-from-the-ahr-expo-hall-our-exclusive-qa-with-a-o-smith-ceo-stephen-shafer", date: "2026-02-05" },
  jc: { title: "Distribution Shipping Representative, Johnson City, TN (job posting)", url: "https://jobs.aosmith.com/job/Johnson-City-Distribution-Shipping-Representative-TN-37601/1436948500/", date: "2026-10-05" },
  tca: { title: "Trade Compliance Analyst, Ashland City, TN (job posting)", url: "https://joblume.totalh.net/job/trade-compliance-analyst-job-at-a-o-smith-in-ashland-city-tn", date: "2026-08-20" },
  hwabout: { title: "A. O. Smith Water Products About (Ashland City: world's largest water heater factory)", url: "https://www.hotwater.com/about-us.html", date: "2026" },
  juarez: { title: "A. O. Smith opening third Juárez factory (El Paso Times)", url: "https://www.elpasotimes.com/story/money/business/2024/09/23/water-heater-manufacturer-a-o-smith-juarez-mexico-expansion-to-add-400-jobs-by-2025/75163447007/", date: "2024-09-23" },
};
const li = (name, url) => ({ title: `${name}: public LinkedIn profile`, url, date: LI_DATE });

const BXC_PHONES = [{ label: "BlueLinx corporate (general)", number: "770-953-7000", src: BXC.contact.url }, { label: "BlueLinx vendor relations", number: "770-953-4902", src: BXC.vendor.url }];
const PIR_PHONES = [{ label: "Pirelli Tire LLC, Rome GA (main)", number: "706-368-5800", src: PIR.ustma.url }, { label: "Pirelli customer service", number: "1-800-747-3554", src: PIR.cs.url }];
const AOS_PHONES_TN = [{ label: "A. O. Smith Water Products, Ashland City TN (division HQ)", number: "866-362-9898", src: AOS.fac.url }, { label: "A. O. Smith world HQ, Milwaukee", number: "414-359-4000", src: AOS.fac.url }];

export const SEED_ACCOUNTS = [
  // ═════════════════════════════ BlueLinx ═════════════════════════════
  {
    id: "bluelinx", name: "BlueLinx", segment: "Distributor", hq: "Marietta, GA", website: "https://www.bluelinxco.com", ticker: "NYSE: BXC", stage: "Research",
    phones: BXC_PHONES,
    brief: {
      overview: "Two-step wholesale distributor of residential and commercial building products (lumber, panels, engineered wood, siding, millwork, outdoor living) serving all 50 states from branches in 57 cities.",
      address: "1950 Spectrum Circle, Suite 300, Marietta, GA 30067",
      facts: [
        { label: "Revenue", text: "Q2 2026 net sales $814M, up 4.4% YoY; adjusted EBITDA up 33%.", src: 1 },
        { label: "Mix", text: "Specialty products (engineered wood, siding, millwork, outdoor living) were $564M of Q2 sales, about 69%.", src: 1 },
        { label: "Footprint", text: "Branches in 57 cities; serves all 50 states.", src: 8 },
        { label: "Customers", text: "National home centers, pro dealers, co-ops, specialty distributors, regional and local dealers, industrial manufacturers.", src: 8 },
        { label: "Key suppliers", text: "Allura, Arauco, Fiberon, Georgia-Pacific, Huber, Louisiana-Pacific, Oldcastle APG, Ply Gem, Roseburg, Westlake Royal; Trex added Sept 2026.", src: 8 },
        { label: "Outlook", text: "Q3 2026 average daily sales volumes expected higher than Q3 2025 and slightly up from Q2.", src: 1 },
      ],
      freight: [
        { label: "Ships", text: "Lumber, panels, engineered wood, siding, trim, decking and railing.", src: 8 },
        { label: "Fleet", text: "Q2 equipment additions and $77M of equipment finance leases were 'primarily fleet, facility and technology'.", src: 1 },
        { label: "Outside carriers", text: "Third-party freight named as one driver of the $12.1M Q2 SG&A increase.", src: 1 },
        { label: "New inbound", text: "Trex inventory landing at 11 DCs (Indianapolis, St. Louis, Cincinnati, Erwin, Nashville, Atlanta, Birmingham, Memphis, Gulfport, Little Rock, Monroe) from Sept 2026.", src: 2 },
        { label: "Supplier plants", text: "Trex makes decking in Winchester, VA and Fernley, NV; Little Rock, AR decking expected 2027.", src: 7 },
      ],
      locations: [
        { text: "RDI railing added in Denver, Tulsa, Oklahoma City, Omaha, Raleigh, Bellingham MA, Portland ME, Burlington VT (21 DCs total).", src: 3 },
        { text: "LP SmartSide stocking added in Charleston SC, Lake City FL, Dallas-Fort Worth, El Paso, Harlingen, Houston, Lubbock, San Antonio.", src: 4 },
        { text: "Pacific Northwest: Portland greenfield DC (2024), Disdero in Clackamas, OR (acquired Nov 2025), 65,800 sq ft Portland lease (Jul 2026).", src: 5 },
      ],
      leadership: [{ name: "Shyam Reddy", title: "President & CEO", src: 3 }],
      sources: n([BXC.q2, BXC.trex, BXC.rdi, BXC.lp, BXC.disdero, BXC.lease, BXC.trex10k, BXC.tenk, BXC.contact, BXC.vendor]),
    },
    signals: [
      { title: "LP SmartSide stocking added in 8 markets (TX, SC, FL)", url: BXC.lp.url, published_at: "2026-09-29", category: "New product line" },
      { title: "RDI railing expanded from 13 to 21 DCs", url: BXC.rdi.url, published_at: "2026-09-15", category: "New product line" },
      { title: "Trex inventory landing at 11 Midwest/Southeast DCs", url: BXC.trex.url, published_at: "2026-09-03", category: "New supplier lanes" },
      { title: "Q2 2026: sales +4.4%; third-party freight named in SG&A rise", url: BXC.q2.url, published_at: "2026-08-04", category: "Financial" },
      { title: "65,800 sq ft lease at 4740 NE 166th, Portland", url: BXC.lease.url, published_at: "2026-07-31", category: "Facility" },
    ],
    contacts: [
      {
        name: "Brad Zwigart", title: "Senior Director of Logistics Operations", role_type: "Logistics", location: "Atlanta, GA", since: "2024-04", linkedin_url: "https://linkedin.com/in/brad-zwigart", contact_source: "public",
        why: "Runs logistics operations across 50+ BlueLinx distribution sites and owns the Oracle TMS (OTM) rollout.",
        decisions: "Carrier process and standards, TMS adoption, route efficiency and cost targets across the network.",
        career: [
          { title: "Senior Director of Logistics Operations", org: "BlueLinx", years: "Apr 2024 – present", note: "Leads logistics operations across 50+ sites; drives OTM, WMS and automation adoption." },
          { title: "Vice President Operations", org: "S.P. Richards", years: "2020 – 2021" },
          { title: "Vice President of Logistics", org: "S.P. Richards", years: "2016 – 2020" },
        ],
        hooks: [
          { text: "Posted (Feb 4, 2026) that BlueLinx is now live on Oracle Transportation Management across nearly 60 sites; next step is 'capturing the efficiency and savings this platform enables.'", say: "I read your post about going live on OTM across nearly 60 sites. Congratulations to the team.", type: "professional", src: "https://www.linkedin.com/posts/brad-zwigart_logistics-transportationmanagement-continuousimprovement-activity-7424937438348750849-jA0G", confirmed: true },
          { text: "Posted (Sept 18, 2026) that BlueLinx is hiring a Director of Operational Excellence to own OTIF governance and standard work across the branch network.", say: "I saw you're hiring a Director of Operational Excellence focused on OTIF.", type: "professional", src: "https://linkedin.com/in/brad-zwigart", confirmed: true },
        ],
        brief: {
          sharpest: { text: "BlueLinx went live on Oracle TMS across nearly 60 sites this year, and Brad's next stated goal is capturing the savings. In the same months, Trex, RDI and LP SmartSide added new inbound lanes with no carrier history.", why: "He's in the 'make the new system pay off' phase. A carrier that tenders cleanly through OTM and reports OTIF fits exactly what he's measuring now.", src: [1, 3, 4] },
          known: [
            { text: "Leads logistics operations across 50+ distribution sites.", tag: "verified", src: 1 },
            { text: "Live on Oracle TMS across nearly 60 sites (Feb 2026 post).", tag: "verified", src: 3 },
            { text: "Hiring a Director of Operational Excellence to own OTIF governance (Sept 2026 post).", tag: "verified", src: 1 },
            { text: "Previously VP of Logistics at S.P. Richards, another Atlanta distributor.", tag: "verified", src: 1 },
            { text: "Outside carriers are tendered through OTM, so a new carrier has to be set up in OTM to get loads.", tag: "inferred" },
            { text: "OTIF is likely the scorecard metric he'll judge carriers on.", tag: "inferred" },
          ],
          cares: ["Savings from the OTM rollout", "OTIF and standard work across branches", "Carrier performance data", "New Trex/RDI/LP inbound lanes"],
          openers: [
            { driver: "GET", text: "Congratulations on going live on OTM across nearly 60 sites. Now that you're in the savings phase, which lanes are you looking at first?", src: [3] },
            { driver: "RISK", text: "With Trex now landing at 11 DCs, how are the new inbound lanes performing on OTIF so far?", src: [4] },
            { driver: "PAIN", text: "Your Q2 release named third-party freight as an SG&A driver. Is OTM showing you where that spend is concentrated?", src: [2] },
          ],
          questions: [
            { know: "I know you're live on OTM across nearly 60 sites.", dontKnow: "What I don't know is how a new carrier gets set up to receive tenders in it.", ladder: ["Who approves a new carrier in OTM?", "What data do you need from a carrier on day one?", "How fast can a carrier go from approved to tendered?"] },
            { know: "I know you're hiring someone to own OTIF governance.", dontKnow: "What I don't know is what OTIF target you hold outside carriers to today.", ladder: ["Where are you falling short of it?", "Which lanes drag it down?", "What happens to a carrier that misses it two months in a row?"] },
            { know: "I know Trex inventory started landing at 11 DCs in September.", dontKnow: "What I don't know is whether BlueLinx or Trex controls that inbound freight.", ladder: ["If it's yours, which lanes are tendered through OTM?", "How many loads a week per DC in spring?", "Who owns the carrier choice on those lanes?"] },
          ],
          talkTrack: {
            C: "Thanks for taking the call, Brad. I read your post about going live on OTM across nearly 60 sites. How's the stabilization going?",
            R: "I'm calling because we're a freight broker that tenders through OTM for building-products shippers, and new inbound lanes are usually where we help first.",
            V: { GET: "Add vetted flatbed capacity your team can tender in OTM on day one.", PAIN: "Take cost out of third-party inbound freight, the SG&A line you called out in Q2.", RISK: "Protect OTIF on the new Trex and RDI lanes when a core carrier drops a load in spring." },
            A: "Would you be open to a 15-minute call next Tuesday or Thursday to look at two of your new inbound lanes?",
          },
          crva: {
            reason: "I'm reaching out because we're a freight broker that tenders through Oracle TMS for building-products shippers, and new inbound lanes are usually where we help first.",
            value: { GET: "We can add vetted flatbed capacity your team can tender in OTM on day one, without adding trucks to the fleet.", PAIN: "We can take cost out of third-party inbound freight, which your Q2 release called out as an SG&A driver.", RISK: "We can protect OTIF on the new Trex and RDI lanes by backing up your core carriers in peak season." },
            asks: { meeting: "Would you be open to a 15-minute call next Tuesday or Thursday to look at two of your new inbound lanes?", referral: "Is carrier onboarding in OTM something you own, or would you point me to who does?" },
            companyHook: { text: "Congratulations on going live on Oracle TMS across nearly 60 sites.", src: 3 },
            liShort: "Congrats on going live on OTM across ~60 sites.",
            liValue: "We tender through OTM for building-products shippers.",
          },
          persona: { objections: ["We already have core carriers in OTM.", "We're still stabilizing the system. Call me next quarter.", "Send me your SmartWay and insurance docs first.", "Trex controls that freight."], valueToUs: "Steady flatbed loads on new inbound lanes, tendered through OTM.", valueToThem: "Backup capacity that protects OTIF while the new system pays off." },
          sources: n([li("Brad Zwigart", "https://linkedin.com/in/brad-zwigart"), BXC.q2, { title: "Brad Zwigart: OTM go-live post (Feb 2026)", url: "https://www.linkedin.com/posts/brad-zwigart_logistics-transportationmanagement-continuousimprovement-activity-7424937438348750849-jA0G", date: "2026-02-04" }, BXC.trex]),
          research: { agentMinutes: 2, reviewMinutes: 10, gaps: ["The OTIF target and how outside carriers are scored aren't public, so they're questions."] },
        },
      },
      {
        name: "Chad Lee", title: "Vice President, Distribution & Operations", role_type: "Executive", location: "Marietta, GA", since: "2023-11", linkedin_url: "https://linkedin.com/in/e-chad-lee", contact_source: "public",
        why: "Executive over distribution and operations; ran freight RFPs and a $100M+ transportation budget in a prior role.",
        decisions: "Network, DC operations and logistics budget; approves major carrier and 3PL decisions.",
        career: [
          { title: "Vice President, Distribution & Operations", org: "BlueLinx", years: "Nov 2023 – present" },
          { title: "EVP / SVP Operations and Logistics", org: "S.P. Richards", years: "2017 – 2020", note: "Oversaw 37 DCs and logistics for a $1.5B business." },
          { title: "Vice President Logistics", org: "S.P. Richards", years: "2010 – 2013", note: "$100M+ transportation spend; annual freight RFPs cut costs 4%." },
        ],
        hooks: [{ text: "His profile credits leveraged annual freight RFPs at S.P. Richards with cutting costs 4% and raising efficiency 3%.", say: "I saw that you used annual freight RFPs at S.P. Richards to take 4% out of freight costs.", type: "professional", src: "https://linkedin.com/in/e-chad-lee", confirmed: true }],
        brief: {
          sharpest: { text: "Chad owns BlueLinx distribution as three supplier lines (Trex, RDI, LP SmartSide) land in new DCs, and Q2 named third-party freight as a cost driver. He has run freight RFPs that cut costs 4% before.", why: "He thinks in RFP cycles and cost per load. A broker that can bid the new lanes fits how he already buys freight.", src: [1, 2, 3] },
          known: [
            { text: "VP, Distribution & Operations at BlueLinx since Nov 2023.", tag: "verified", src: 1 },
            { text: "Ran $100M+ in transportation spend and annual freight RFPs at S.P. Richards (2010–2013).", tag: "verified", src: 1 },
            { text: "Q2 2026 SG&A rose $12.1M, partly on fuel and third-party freight.", tag: "verified", src: 2 },
            { text: "BlueLinx likely runs an annual or semi-annual freight bid; timing unknown.", tag: "inferred" },
          ],
          cares: ["Cost per load and SG&A", "DC service levels", "Bid discipline", "Integrating new supplier lines"],
          openers: [
            { driver: "PAIN", text: "Your Q2 release named third-party freight in the SG&A increase. When's the next time those lanes go out to bid?", src: [2] },
            { driver: "RISK", text: "With Trex, RDI and LP all landing new lines this fall, which DCs are you most worried about for spring coverage?", src: [3] },
            { driver: "GET", text: "I saw you cut freight costs 4% with RFPs at S.P. Richards. Are you running a similar bid at BlueLinx?", src: [1] },
          ],
          questions: [
            { know: "I know third-party freight showed up in Q2 SG&A.", dontKnow: "What I don't know is which lanes drive most of that spend.", ladder: ["Inbound from suppliers or transfers between DCs?", "How is that trending this quarter?", "What would a 4% cut be worth to you this year?"] },
            { know: "I know you've run annual freight RFPs before.", dontKnow: "What I don't know is when BlueLinx's next bid opens.", ladder: ["Who builds the lane list?", "Do brokers participate?", "What did the last award miss?"] },
          ],
          talkTrack: { C: "Thanks for the time, Chad. I saw the Trex, RDI and LP rollouts this fall. That's a lot of new freight at once.", R: "I'm calling because we bid and cover flatbed lanes for building-products distributors, especially new supplier lanes.", V: { GET: "Add surge capacity for spring without adding fleet.", PAIN: "Lower cost per load on third-party inbound freight.", RISK: "Keep DC fill rates up when core carriers reject tenders." }, A: "Would you be open to including us in your next lane bid, or a 15-minute call next week to see if we fit?" },
          crva: {
            reason: "I'm reaching out because we bid and cover flatbed lanes for building-products distributors, especially new supplier lanes like Trex and RDI.",
            value: { GET: "We can add surge flatbed capacity for spring without you adding trucks.", PAIN: "We can lower cost per load on third-party inbound freight, which your Q2 release named as an SG&A driver.", RISK: "We can keep DC fill rates up when core carriers reject tenders in peak season." },
            asks: { meeting: "Would you be open to a 15-minute call next Tuesday or Thursday to see whether we fit your next lane bid?", referral: "Is the freight bid something you run, or would you point me to who builds the lane list?" },
            companyHook: { text: "Congratulations on bringing Trex, RDI and LP SmartSide into new BlueLinx DCs this fall.", src: 3 },
            liShort: "Congrats on the Trex, RDI and LP rollouts this fall.",
            liValue: "We bid flatbed lanes for building-products distributors.",
          },
          persona: { objections: ["We just finished our bid.", "Talk to my logistics team.", "We run our own fleet.", "Send me a rate sheet."], valueToUs: "A seat in the next lane bid.", valueToThem: "Lower cost per load and spring coverage." },
          sources: n([li("Chad Lee", "https://linkedin.com/in/e-chad-lee"), BXC.q2, BXC.trex]),
          research: { agentMinutes: 2, reviewMinutes: 8, gaps: ["BlueLinx's bid timing isn't public."] },
        },
      },
      {
        name: "Derek Stoffel", title: "Logistics Manager, Western US", role_type: "Logistics", location: "Englewood, CO", since: "2008-01", linkedin_url: "https://www.linkedin.com/in/derek-stoffel-04990b2b", contact_source: "public",
        why: "Runs the transportation department supporting 21 site managers in the Western US.",
        decisions: "Day-to-day carrier selection, OTR contracts and rates for Western sites.",
        career: [
          { title: "Logistics Manager", org: "BlueLinx", years: "2008 – present", note: "Transportation for 200+ internal customers and 21 Western site managers." },
          { title: "Operations Manager", org: "BlueLinx", years: "2004 – 2008", note: "Load planners dispatched 30,000+ truckloads a year; OTR contracts and rates; 300+ contract carriers." },
        ],
        hooks: [{ text: "His profile says his team once dispatched over 30,000 truckloads a year and handled compliance for 300+ contract carriers.", say: "I saw your team used to dispatch 30,000-plus truckloads a year across 300 contract carriers.", type: "professional", src: "https://www.linkedin.com/in/derek-stoffel-04990b2b", confirmed: true }],
        brief: {
          sharpest: { text: "The West is where BlueLinx is growing: a Portland DC (2024), Disdero in Clackamas (Nov 2025), a 65,800 sq ft Portland lease (Jul 2026), and RDI railing added in Denver, Derek's home market, in Sept 2026.", why: "He picks carriers lane by lane. New Western volume with no carrier history is the opening.", src: [2, 3, 4] },
          known: [
            { text: "Logistics Manager for BlueLinx's Western US sites since 2008.", tag: "verified", src: 1 },
            { text: "Handles OTR contract and rate negotiations; previously 300+ contract carriers.", tag: "verified", src: 1 },
            { text: "RDI railing added in Denver, Omaha, Tulsa and Oklahoma City (Sept 2026).", tag: "verified", src: 4 },
            { text: "Disdero premium lumber ships from Clackamas, OR to nearly all 50 states.", tag: "verified", src: 2 },
            { text: "Disdero's outbound may still run on its own pre-acquisition carriers.", tag: "inferred" },
          ],
          cares: ["Reliable OTR carriers in the Mountain West", "Rate discipline", "Disdero integration", "New Denver RDI volume"],
          openers: [
            { driver: "GET", text: "I saw RDI railing just landed in Denver. Is that inbound coming to you as truckload or LTL?", src: [4] },
            { driver: "RISK", text: "With Disdero shipping premium lumber from Clackamas to nearly every state, has that freight moved onto your carrier base yet?", src: [2] },
            { driver: "PAIN", text: "Which Western lanes are hardest to keep covered at your contract rate right now?", src: [1] },
          ],
          questions: [
            { know: "I know Disdero ships from Clackamas into nearly all 50 states.", dontKnow: "What I don't know is whether that freight runs through your team yet.", ladder: ["Who books it today?", "What equipment does clear lumber need?", "Where does it get expensive?"] },
            { know: "I know RDI just added Denver.", dontKnow: "What I don't know is how that inbound reaches you.", ladder: ["From which plant?", "How often?", "Who chooses the carrier?"] },
          ],
          talkTrack: { C: "Thanks for picking up, Derek. I saw RDI railing just landed in Denver. How's the rollout?", R: "I'm calling because we cover flatbed and step-deck lanes in the Mountain West and Pacific Northwest for building-products distributors.", V: { GET: "More carrier options on Western lanes without new contracts.", PAIN: "Fewer hours chasing trucks for hard-to-cover lanes.", RISK: "Backup when a contract carrier rejects a load." }, A: "Would you be open to sending me two lanes that are hard to cover, so I can quote them this week?" },
          crva: {
            reason: "I'm reaching out because we cover flatbed and step-deck lanes in the Mountain West and Pacific Northwest for building-products distributors.",
            value: { GET: "We can give you more carrier options on Western lanes without new contracts.", PAIN: "We can save your team hours chasing trucks on hard-to-cover lanes.", RISK: "We can back you up when a contract carrier rejects a load." },
            asks: { meeting: "Would you be open to sending me two hard-to-cover lanes so I can quote them this week?", referral: "Are you the right person for Disdero's outbound freight, or would you point me to who is?" },
            companyHook: { text: "I saw RDI railing just landed in Denver and BlueLinx keeps growing in the Pacific Northwest.", src: 4 },
            liShort: "Saw RDI just landed in Denver.",
            liValue: "We cover hard Western flatbed lanes.",
          },
          persona: { objections: ["I've got 300 carriers already.", "Our rates are locked.", "Email me your lanes.", "Disdero handles their own freight."], valueToUs: "Spot and backup loads on Western lanes.", valueToThem: "Coverage on hard lanes without renegotiating contracts." },
          sources: n([li("Derek Stoffel", "https://www.linkedin.com/in/derek-stoffel-04990b2b"), BXC.disdero, BXC.lease, BXC.rdi]),
          research: { agentMinutes: 2, reviewMinutes: 8, gaps: ["No recent public posts from Derek, so the Connect relies on company news."] },
        },
      },
      {
        name: "Tracy Powell", title: "Director, Regional Logistics – Southwest", role_type: "Logistics", location: "United States (Southwest region)", since: "2000-05", linkedin_url: "https://linkedin.com/in/tracy-powell-27823245", contact_source: "public",
        why: "Directs regional logistics for BlueLinx's Southwest, where LP SmartSide just added seven Texas stocking markets.",
        decisions: "Regional carrier mix and coverage for Southwest DCs.",
        career: [{ title: "Director Regional Logistics Southwest", org: "BlueLinx", years: "May 2000 – present (per profile)" }],
        hooks: [],
        brief: {
          sharpest: { text: "On Sept 29, 2026 BlueLinx added LP SmartSide stocking in Dallas-Fort Worth, El Paso, Harlingen, Houston, Lubbock and San Antonio, and RDI railing landed in Tulsa and Oklahoma City two weeks earlier. That's new inbound in Tracy's region.", why: "Seven new stocking points means new inbound lanes from LP mills that need coverage now.", src: [2, 3] },
          known: [
            { text: "Director of Regional Logistics, Southwest (long-tenured per profile).", tag: "verified", src: 1 },
            { text: "LP SmartSide added in six Texas markets (Sept 2026).", tag: "verified", src: 2 },
            { text: "RDI railing added in Tulsa and Oklahoma City (Sept 2026).", tag: "verified", src: 3 },
            { text: "LP SmartSide likely ships from LP siding mills outside Texas, so these are long inbound lanes.", tag: "inferred" },
          ],
          cares: ["Coverage for new Texas stocking points", "Cross-dock and transfer efficiency", "Spring builder demand in Texas"],
          openers: [
            { driver: "GET", text: "I saw LP SmartSide is now stocked in six Texas markets. Is that inbound coming straight from the mill or through an existing DC?", src: [2] },
            { driver: "RISK", text: "With Texas building season picking up in spring, which of the new stocking points worries you most for coverage?", src: [2] },
          ],
          questions: [
            { know: "I know LP SmartSide is now stocked in Houston, San Antonio and DFW.", dontKnow: "What I don't know is how often those markets get replenished.", ladder: ["Truckload or partials?", "Who books the inbound?", "What happens when a load is late?"] },
          ],
          talkTrack: { C: "Thanks for taking the call, Tracy. I saw LP SmartSide just landed in six Texas markets.", R: "I'm calling because we cover flatbed and dry-van lanes into Texas for building-products distributors.", V: { GET: "Capacity for the new stocking points.", PAIN: "Fewer last-minute load searches.", RISK: "Backup coverage in spring." }, A: "Would you be open to a 15-minute call next week to look at the new Texas lanes?" },
          crva: {
            reason: "I'm reaching out because we cover flatbed and dry-van lanes into Texas for building-products distributors.",
            value: { GET: "We can add capacity for the new LP SmartSide stocking points.", PAIN: "We can cut the last-minute load searches when new lanes start.", RISK: "We can back up your carriers during the Texas spring build season." },
            asks: { meeting: "Would you be open to a 15-minute call next week to look at the new Texas lanes?", referral: "Are you the right person for the new Texas inbound lanes, or would you point me to who is?" },
            companyHook: { text: "I saw LP SmartSide is now stocked in six Texas markets.", src: 2 },
            liShort: "Saw LP SmartSide just landed in six Texas markets.",
            liValue: "We cover flatbed lanes into Texas.",
          },
          persona: { objections: ["We're covered.", "Talk to corporate logistics.", "Send me an email."], valueToUs: "Inbound lanes into new Texas stocking points.", valueToThem: "Coverage as new lines ramp." },
          sources: n([li("Tracy Powell", "https://linkedin.com/in/tracy-powell-27823245"), BXC.lp, BXC.rdi]),
          research: { agentMinutes: 1, reviewMinutes: 8, gaps: ["Thin public profile: tenure dates look inconsistent with BlueLinx's 2004 founding (likely includes predecessor Georgia-Pacific). Confirm the title before calling."] },
        },
      },
    ],
  },

  // ═════════════════════════════ Pirelli ═════════════════════════════
  {
    id: "pirelli", name: "Pirelli Tire North America", segment: "Manufacturer", hq: "Rome, GA", website: "https://www.pirelli.com/tyres/en-us/", ticker: "BIT: PIRC", stage: "Research",
    phones: PIR_PHONES,
    brief: {
      overview: "Premium car and motorcycle tire maker. US headquarters, MIRS robotized plant and R&D center in Rome, GA; plant in Silao, Mexico; sales offices in New York, Los Angeles, Detroit, Montreal and Atlanta.",
      address: "100 Pirelli Drive, Rome, GA 30161",
      facts: [
        { label: "Expansion", text: "Board approved ~€1B (~$1.2B) on Sept 22, 2026 to grow Rome to ~6M car tires a year by 2033; capacity rises from 2028.", src: 1 },
        { label: "Jobs", text: "~1,000 new jobs, mostly hired in 2029; Rome employs 234 today.", src: 2 },
        { label: "New product", text: "Cyber Tyre (sensor-equipped tires) production started at Rome (announced May 2026).", src: 3 },
        { label: "US supply (2025)", text: "About 5% from Rome, 55% from Silao (described as 'fully saturated'), 40% from Europe and Brazil.", src: 4 },
        { label: "Tariffs", text: "EU car tires 15% from Aug 2025; Brazil +25%; Mexico duty-free as USMCA-compliant; Pirelli 'revised logistics flows.'", src: 5 },
        { label: "Ownership", text: "Sinochem cut its stake from 34.1% to 20.1% in July 2026.", src: 9 },
      ],
      freight: [
        { label: "Ships", text: "Finished car, SUV, motorcycle and cycling tires to OEM plants and replacement dealers.", src: 8 },
        { label: "Warehousing", text: "Kuehne+Nagel runs US warehouses in McDonough, GA and Rialto, CA (800,000 sq ft), consolidating domestic shipments.", src: 6 },
        { label: "Systems", text: "Moving to third-generation WMS/TMS with barcode scanning and GPS tracking (June 2025).", src: 7 },
        { label: "Trade", text: "USMCA wasn't renewed in its current form on July 1, 2026; annual reviews now apply.", src: 10 },
      ],
      locations: [
        { text: "Rome, GA: US HQ, MIRS plant, R&D center.", src: 8 },
        { text: "Silao, Guanajuato, Mexico: car tire plant.", src: 8 },
        { text: "Sales offices: New York, Los Angeles, Detroit, Montreal, Atlanta.", src: 8 },
      ],
      leadership: [{ name: "Claudio Zanardo", title: "CEO, Pirelli North America", src: 2 }],
      sources: n([PIR.board, PIR.cbs, PIR.cyber, PIR.erj, PIR.erj9m, PIR.kn, PIR.al, PIR.ustma, PIR.ja, PIR.usmca]),
    },
    signals: [
      { title: "Board approves ~$1.2B Rome, GA expansion to ~6M tires by 2033", url: PIR.board.url, published_at: "2026-09-22", category: "Facility expansion" },
      { title: "USMCA not renewed in current form; annual reviews begin", url: PIR.usmca.url, published_at: "2026-07-20", category: "Tariff / trade" },
      { title: "Cyber Tyre production to start at Rome, GA", url: PIR.cyber.url, published_at: "2026-05-06", category: "New product line" },
    ],
    contacts: [
      {
        name: "Rodolfo Giotto", title: "North America Logistics Director", role_type: "Logistics", location: "Rome, GA", since: "2018-07", linkedin_url: "https://linkedin.com/in/rodolfogiotto", contact_source: "public",
        why: "Leads North America logistics and buys logistics services: carriers, steamship lines and 3PLs.",
        decisions: "Carrier, ocean and 3PL purchasing; distribution strategy for North America.",
        career: [
          { title: "North America Logistics Director", org: "Pirelli", years: "Jul 2018 – present" },
          { title: "Operations Manager, Logistics LATAM", org: "Pirelli", years: "2017 – 2018" },
          { title: "Transportation Manager Latin America", org: "Pirelli", years: "2013 – 2017", note: "Contracted and managed all transport modes in South America." },
        ],
        hooks: [{ text: "His profile highlights 'vast logistics purchase experience' and long-term relationships with carriers, steamship lines and 3PLs; fluent in English, Spanish, Italian and Portuguese.", say: "Your background buying freight across Latin America and North America stood out to me.", type: "professional", src: "https://linkedin.com/in/rodolfogiotto", confirmed: true }],
        brief: {
          sharpest: { text: "Pirelli approved ~$1.2B to expand Rome on Sept 22, but Rome supplied only ~5% of US demand in 2025. For years, most volume still comes from Silao and through the ports, and Rodolfo is the person who buys that logistics.", why: "He owns carrier and 3PL purchasing, and a multi-year network change is when he adds capacity partners.", src: [2, 3, 4] },
          known: [
            { text: "North America Logistics Director since July 2018.", tag: "verified", src: 1 },
            { text: "Buys from carriers, steamship lines and 3PLs.", tag: "verified", src: 1 },
            { text: "Previously ran transportation for Pirelli in Latin America.", tag: "verified", src: 1 },
            { text: "Rome expansion approved Sept 22, 2026; capacity from 2028.", tag: "verified", src: 2 },
            { text: "2025 supply: ~55% Silao, ~40% Europe/Brazil, ~5% Rome.", tag: "verified", src: 4 },
            { text: "Cross-border Silao freight likely mixes rail and truck through Laredo.", tag: "inferred" },
          ],
          cares: ["Cost and reliability of Silao cross-border flows", "Port drayage at Savannah and Charleston", "3PL performance", "Planning for the Rome ramp"],
          openers: [
            { driver: "RISK", text: "Congratulations on the Rome approval. While capacity ramps toward 2033, how are you planning the Silao and port flows that still cover most of US demand?", src: [2, 4] },
            { driver: "PAIN", text: "Where does border dwell on Silao freight cost you the most today?", src: [4] },
            { driver: "GET", text: "With winter-tire sell-in running now, where do you need extra dry-van capacity out of McDonough and Rialto?", src: [5] },
          ],
          questions: [
            { know: "I know Silao supplied over half of your US demand last year.", dontKnow: "What I don't know is how those loads cross today: rail, truck, or a mix.", ladder: ["What share goes by truck through Laredo?", "Where does dwell hurt most?", "What would a backup cross-border carrier need to prove?"] },
            { know: "I know Kuehne+Nagel runs McDonough and Rialto.", dontKnow: "What I don't know is who picks the outbound truckload carriers: you or K+N.", ladder: ["How is that mix reviewed?", "When does sell-in push you past the routing guide?", "Who signs off on a new carrier?"] },
          ],
          talkTrack: { C: "Thanks for taking the call, Rodolfo, and congratulations on the Rome approval.", R: "I'm calling because we move dry-van and cross-border freight for tire and auto-parts shippers, especially out of Mexico and the Southeast ports.", V: { GET: "Extra capacity for winter sell-in without reworking the routing guide.", PAIN: "Less border dwell and cost per load on Silao freight.", RISK: "A tested backup if USMCA changes or port congestion hits a lane." }, A: "Would you be open to a 15-minute call next Tuesday or Thursday to compare notes on one Silao lane?" },
          crva: {
            reason: "I'm reaching out because we move dry-van and cross-border freight for tire and auto-parts shippers, especially out of Mexico and the Southeast ports.",
            value: { GET: "We can add dry-van capacity for winter sell-in out of McDonough and Rialto without reworking your routing guide.", PAIN: "We can cut border dwell and cost per load on Silao-to-Georgia freight.", RISK: "We can be your tested backup if the USMCA review or port congestion disrupts a lane while Rome ramps." },
            asks: { meeting: "Would you be open to a 15-minute call next Tuesday or Thursday to compare notes on one Silao lane?", referral: "Are you the right person for cross-border carrier decisions, or would you point me to who is?" },
            companyHook: { text: "Congratulations on the board approval for the Rome, Georgia expansion on September 22.", src: 2 },
            liShort: "Congrats on the Rome, GA expansion approval.",
            liValue: "We back up Silao and port lanes while Rome ramps.",
          },
          persona: { objections: ["Kuehne+Nagel handles that.", "We mostly use rail out of Mexico.", "Our contracts run until next year.", "Send me your rate sheet."], valueToUs: "Cross-border and peak-season dry-van loads.", valueToThem: "Backup capacity and lower dwell during a multi-year network change." },
          sources: n([li("Rodolfo Giotto", "https://linkedin.com/in/rodolfogiotto"), PIR.board, PIR.cbs, PIR.erj, PIR.kn]),
          research: { agentMinutes: 2, reviewMinutes: 10, gaps: ["His experience lists Savannah while the profile shows Rome. Confirm which office he works from."] },
        },
      },
      {
        name: "John Godfrey", title: "Senior Director, Logistics Operations", role_type: "Logistics", location: "Atlanta, GA", since: "2021-10", linkedin_url: "https://linkedin.com/in/johnmgodfreyjr", contact_source: "public",
        why: "Owns logistics operations and systems; previously built Pirelli's Mexico cross-border strategy as VP Logistics, NAFTA.",
        decisions: "3PL and carrier strategy, TMS/WMS, network design.",
        career: [
          { title: "Senior Director Logistics Operations", org: "Pirelli", years: "Oct 2021 – present" },
          { title: "VP, Logistics / Supply Chain, NAFTA", org: "Pirelli", years: "2014 – 2018", note: "Cross-border multimodal export strategy out of Mexico (>$1M/yr savings); opened a Pennsylvania warehouse in under 3 months; near-100% SmartWay carrier compliance." },
          { title: "Logistics Manager", org: "Pirelli (Rome, GA)", years: "2002 – 2004", note: "Set up production requirements for the Rome JIT plant." },
        ],
        hooks: [{ text: "Spoke at Automotive Logistics & Supply Chain Digital Strategies North America (Nashville, June 2025) about moving to third-generation WMS with GPS tracking.", say: "I watched your Automotive Logistics interview from Nashville about moving Pirelli to third-generation WMS with GPS tracking.", type: "professional", src: PIR.al.url, confirmed: true }],
        brief: {
          sharpest: { text: "John built Pirelli's Mexico cross-border strategy and helped set up the Rome plant in 2002. The Sept 22 approval to expand Rome to ~6M tires means he'll redesign the network again, and he's already pushing GPS tracking into the TMS.", why: "He values carriers that share real-time tracking and meet SmartWay. Lead with visibility, not price.", src: [1, 2, 3] },
          known: [
            { text: "Senior Director Logistics Operations since Oct 2021.", tag: "verified", src: 1 },
            { text: "Built the cross-border multimodal export strategy out of Mexico (2014–2018).", tag: "verified", src: 1 },
            { text: "Required near-100% SmartWay-certified carriers.", tag: "verified", src: 1 },
            { text: "Upgrading to third-gen WMS/TMS with GPS tracking (June 2025).", tag: "verified", src: 3 },
            { text: "A new carrier will likely need to feed GPS tracking into Pirelli's TMS.", tag: "inferred" },
          ],
          cares: ["Real-time visibility", "SmartWay compliance", "Network design for the Rome ramp", "Cost without losing service"],
          openers: [
            { driver: "RISK", text: "I saw your interview about third-gen WMS and GPS tracking. Which outbound lanes are hardest to get reliable tracking on today?", src: [3] },
            { driver: "GET", text: "You built the Mexico cross-border strategy. With Rome expanding, how do you expect the Silao flows to change by 2028?", src: [1, 2] },
          ],
          questions: [
            { know: "I know you require SmartWay carriers and are adding GPS tracking.", dontKnow: "What I don't know is what tracking data a carrier has to send your TMS today.", ladder: ["API or EDI?", "How often?", "What happens when a carrier can't provide it?"] },
            { know: "I know Rome capacity starts rising in 2028.", dontKnow: "What I don't know is whether Rome will ship direct to OEMs and dealers or keep consolidating through McDonough.", ladder: ["Who's planning that network?", "When will lanes be decided?", "What would make a carrier useful now?"] },
          ],
          talkTrack: { C: "Thanks for taking the call, John. I watched your Automotive Logistics interview on GPS tracking.", R: "I'm calling because we're a SmartWay broker that feeds live tracking into shipper TMS platforms, especially on cross-border and port lanes.", V: { GET: "Live GPS tracking on every load we move for you.", PAIN: "Less time chasing status on outbound loads.", RISK: "A visible backup on Silao lanes during the Rome ramp." }, A: "Would you be open to a 15-minute call next week to see if our tracking feed fits your TMS?" },
          crva: {
            reason: "I'm reaching out because we're a SmartWay broker that feeds live tracking into shipper TMS platforms, especially on cross-border and port lanes.",
            value: { GET: "We can send live GPS tracking on every load straight into your TMS.", PAIN: "We can cut the time your team spends chasing status on outbound loads.", RISK: "We can be a visible, SmartWay backup on Silao lanes while Rome ramps." },
            asks: { meeting: "Would you be open to a 15-minute call next week to see if our tracking feed fits your TMS?", referral: "Is carrier tracking integration something you own, or would you point me to who does?" },
            companyHook: { text: "Congratulations on the board approval for the Rome, Georgia expansion on September 22.", src: 2 },
            liShort: "Enjoyed your talk on third-gen WMS and GPS tracking.",
            liValue: "We feed live tracking into shipper TMS.",
          },
          persona: { objections: ["Are you SmartWay certified?", "Kuehne+Nagel picks those carriers.", "We're mid-implementation.", "Send me your tracking specs."], valueToUs: "Tracked dry-van and cross-border loads.", valueToThem: "Visibility and SmartWay compliance during a network redesign." },
          sources: n([li("John Godfrey", "https://linkedin.com/in/johnmgodfreyjr"), PIR.board, PIR.al]),
          research: { agentMinutes: 2, reviewMinutes: 12, gaps: ["His public profile lists a personal email and phone. The portal doesn't store them: personal contact info stays out, and reps use CRM records."] },
        },
      },
      {
        name: "Michael Jones", title: "Outbound Logistics Manager", role_type: "Logistics", location: "Rome, GA", since: "2024-08", linkedin_url: "https://linkedin.com/in/michael-jones-904514134", contact_source: "public",
        why: "Manages outbound logistics and carrier performance from Rome; built Pirelli's centralized control tower.",
        decisions: "Day-to-day outbound carrier assignment, carrier scorecards and KPIs.",
        career: [
          { title: "Outbound Logistics Manager", org: "Pirelli", years: "Aug 2024 – present" },
          { title: "Outbound Logistics Specialist", org: "Pirelli", years: "Oct 2019 – Aug 2024" },
        ],
        hooks: [{ text: "His profile says he led a centralized transportation control tower and outbound optimization at Pirelli, and earned his CSCP in Feb 2025.", say: "I saw you led the build-out of Pirelli's transportation control tower.", type: "professional", src: "https://linkedin.com/in/michael-jones-904514134", confirmed: true }],
        brief: {
          sharpest: { text: "Michael runs outbound from Rome and built the control tower that scores carriers on KPIs. Winter-tire sell-in is running now, and Cyber Tyre production just started in Rome.", why: "He decides who gets outbound loads based on performance data. Offer a trial lane he can score.", src: [1, 2] },
          known: [
            { text: "Outbound Logistics Manager in Rome since Aug 2024.", tag: "verified", src: 1 },
            { text: "Built a centralized control tower; manages vendor and carrier performance KPIs.", tag: "verified", src: 1 },
            { text: "CSCP certified (Feb 2025); builds SAP and Power Query reporting.", tag: "verified", src: 1 },
            { text: "Cyber Tyre production started at Rome in 2026.", tag: "verified", src: 2 },
            { text: "Winter sell-in (Aug–Nov) is likely his peak for outbound volume.", tag: "inferred" },
          ],
          cares: ["On-time pickup and delivery KPIs", "Carrier scorecards", "Peak-season coverage", "Clean data for his control tower"],
          openers: [
            { driver: "GET", text: "I saw you built Pirelli's control tower. During winter sell-in, which outbound lanes fall below your on-time target first?", src: [1] },
            { driver: "RISK", text: "With Cyber Tyre production starting in Rome, are those shipments going on your existing outbound carriers?", src: [2] },
          ],
          questions: [
            { know: "I know you score carriers through the control tower.", dontKnow: "What I don't know is which KPI decides who gets the next load.", ladder: ["On-time pickup or delivery?", "What's the target?", "How does a new carrier earn volume?"] },
          ],
          talkTrack: { C: "Thanks for picking up, Michael. I saw you built Pirelli's control tower.", R: "I'm calling because we cover outbound dry-van lanes for tire and auto-parts shippers and report every load against your KPIs.", V: { GET: "Extra trucks for winter sell-in.", PAIN: "Less time chasing status.", RISK: "A scored backup when a core carrier slips." }, A: "Would you give us one trial lane next week and score us like any other carrier?" },
          crva: {
            reason: "I'm reaching out because we cover outbound dry-van lanes for tire and auto-parts shippers and report every load against your KPIs.",
            value: { GET: "We can add trucks for winter sell-in out of Rome.", PAIN: "We can send status data your control tower can use without phone calls.", RISK: "We can be a scored backup when a core carrier slips." },
            asks: { meeting: "Would you give us one trial lane next week and score us like any other carrier?", referral: "Are you the right person for outbound carrier trials, or would you point me to who is?" },
            companyHook: { text: "I saw you led the build-out of Pirelli's transportation control tower.", src: 1 },
            liShort: "Saw you built Pirelli's transportation control tower.",
            liValue: "We report every load against your KPIs.",
          },
          persona: { objections: ["We have a routing guide.", "New carriers go through procurement.", "What's your on-time percentage?"], valueToUs: "Outbound trial lanes from Rome.", valueToThem: "Peak capacity that shows up in his KPIs." },
          sources: n([li("Michael Jones", "https://linkedin.com/in/michael-jones-904514134"), PIR.cyber]),
          research: { agentMinutes: 1, reviewMinutes: 8, gaps: ["A common name. The profile was matched on Pirelli and Rome, GA; confirm before calling."] },
        },
      },
      {
        name: "Bruno Piccioli", title: "VP Supply Chain, North America", role_type: "Supply Chain", location: "Atlanta metro, GA", since: "2020-06", linkedin_url: "https://linkedin.com/in/bruno-piccioli", contact_source: "public",
        why: "Executive over North America supply chain and network distribution.",
        decisions: "Supply network strategy, supplier mix (Rome vs. Silao vs. imports), logistics budget.",
        career: [
          { title: "VP Supply Chain, North America", org: "Pirelli", years: "Jun 2020 – present" },
          { title: "Supply Chain Director, LATAM", org: "Pirelli", years: "2017 – 2020" },
          { title: "Head of Car Supply Chain Planning and Network Distribution", org: "Pirelli (Milan)", years: "2014 – 2016" },
        ],
        hooks: [{ text: "Publicly liked Pirelli CEO Andrea Casaluci's Sept 23, 2026 post announcing the ~€1B Rome expansion.", say: "Congratulations on the Rome expansion. It must be a big moment for your supply chain team.", type: "professional", src: "https://linkedin.com/in/bruno-piccioli", confirmed: true }],
        brief: {
          sharpest: { text: "Bruno owns North America supply chain as Pirelli commits ~$1.2B to Rome and shifts its 'local for local' mix away from imports. He previously ran network distribution planning in Milan.", why: "He's the executive sponsor. The right ask is a referral and permission to bring ideas to his logistics team.", src: [1, 2] },
          known: [
            { text: "VP Supply Chain, North America since June 2020.", tag: "verified", src: 1 },
            { text: "Previously Head of Car Supply Chain Planning and Network Distribution (Milan).", tag: "verified", src: 1 },
            { text: "Rome expansion approved Sept 22, 2026 to support 'local for local'.", tag: "verified", src: 2 },
            { text: "He'll likely set the logistics budget for the ramp years.", tag: "inferred" },
          ],
          cares: ["Local-for-local supply strategy", "Tariff and USMCA exposure", "Network cost during the ramp"],
          openers: [{ driver: "RISK", text: "Congratulations on the Rome approval. As more supply shifts to local production, what does that change for your logistics network over the next two years?", src: [2] }],
          questions: [{ know: "I know the plan shifts Pirelli toward local-for-local supply.", dontKnow: "What I don't know is how much import volume you expect to replace by 2028.", ladder: ["Which lanes go away first?", "Which new ones appear?", "Who on your team is planning them?"] }],
          talkTrack: { C: "Thanks for the time, Bruno, and congratulations on the Rome approval.", R: "I'm calling because we help tire shippers keep freight costs predictable while their networks change.", V: { GET: "Flexible capacity as lanes shift.", PAIN: "Predictable cost per load during the ramp.", RISK: "A backup if USMCA terms change." }, A: "Who on your logistics team would be the right person for me to share a cross-border coverage idea with?" },
          crva: {
            reason: "I'm reaching out because we help tire shippers keep freight costs predictable while their networks change.",
            value: { GET: "We can add flexible capacity as lanes shift from imports to Rome.", PAIN: "We can keep cost per load predictable during the ramp.", RISK: "We can back up cross-border lanes if USMCA terms change." },
            asks: { meeting: "Would you be open to a 15-minute call next week about the ramp years?", referral: "Who on your logistics team should I share a cross-border coverage idea with?" },
            companyHook: { text: "Congratulations on the board approval for the Rome, Georgia expansion on September 22.", src: 2 },
            liShort: "Congrats on the Rome, GA expansion approval.",
            liValue: "We keep freight predictable while networks change.",
          },
          persona: { objections: ["Talk to Rodolfo's team.", "We're not changing carriers now.", "Send me something to read."], valueToUs: "An executive referral into logistics.", valueToThem: "Predictable freight cost during the ramp." },
          sources: n([li("Bruno Piccioli", "https://linkedin.com/in/bruno-piccioli"), PIR.board]),
          research: { agentMinutes: 1, reviewMinutes: 6, gaps: ["The experience entry lists São Paulo while the profile shows Atlanta. Confirm his base."] },
        },
      },
    ],
  },

  // ═════════════════════════════ A. O. Smith ═════════════════════════════
  {
    id: "aosmith", name: "A. O. Smith", segment: "Manufacturer", hq: "Milwaukee, WI", website: "https://www.aosmith.com", ticker: "NYSE: AOS", stage: "Research",
    phones: AOS_PHONES_TN,
    brief: {
      overview: "Largest maker of water heaters in North America, plus boilers (Lochinvar), water treatment and, since Jan 2026, Leonard Valve. North America is about 78% of sales.",
      address: "11270 West Park Place, Suite 170, Milwaukee, WI 53224",
      facts: [
        { label: "Revenue", text: "Q2 2026 sales about $1B; North America $820.5M, up 5%; boilers up 21%; residential water heater volumes down.", src: 2 },
        { label: "Costs", text: "Steel up 20% YoY in Q2; 4–7% water heater price increases from mid-Q3, with customer pre-buy in Q2.", src: 3 },
        { label: "Footprint", text: "23 manufacturing and assembly plants in North America across 13 states and 2 other countries.", src: 1 },
        { label: "Channels", text: "About 800 independent plumbing wholesalers, plus an exclusive Lowe's relationship.", src: 1 },
        { label: "Acquisition", text: "Leonard Valve (Cranston, RI) acquired for $470M in Jan 2026; about $70M of 2026 sales expected.", src: 5 },
        { label: "Disruption", text: "Storm damage at the Ashland City, TN plant constrained production and shipping in Q1 2026.", src: 6 },
      ],
      freight: [
        { label: "Ships", text: "Residential and commercial water heaters, boilers, pressure tanks, water-treatment systems.", src: 1 },
        { label: "Network change", text: "Groveport, OH plant and Lockbourne warehouse close by Dec 11, 2026; work moves to Appleton, WI and Haltom City, TX.", src: 4 },
        { label: "Traffic dept.", text: "Johnson City shipping role (Oct 2026) coordinates carriers, daily LTL pickups and DOT bills of lading.", src: 9 },
        { label: "International", text: "Freight bid to carriers, forwarders and brokers; USMCA origin work (Aug 2026 posting).", src: 10 },
      ],
      locations: [
        { text: "Water heaters: Ashland City TN, Johnson City TN, Lebanon TN, McBee SC, Juárez MX (3rd plant opened Sept 2024).", src: 7 },
        { text: "Distribution: El Paso, TX DC; Fergus, Ontario DC; Rancho Cucamonga, CA DC.", src: 7 },
        { text: "Water treatment: Appleton WI, Haltom City TX, Ontario CA, Pottstown PA (Groveport closing).", src: 7 },
      ],
      leadership: [{ name: "Steve Shafer", title: "Chairman & CEO", src: 8 }],
      sources: n([AOS.ar, AOS.q2, AOS.call, AOS.grove, AOS.lv, AOS.q1, AOS.about, AOS.shafer, AOS.jc, AOS.tca, AOS.fac]),
    },
    signals: [
      { title: "Johnson City, TN shipping rep posting: carriers, daily LTL, Traffic Dept.", url: AOS.jc.url, published_at: "2026-10-05", category: "Logistics hiring" },
      { title: "Q2 2026: NA sales +5%, boilers +21%, steel +20%; 4–7% price increase mid-Q3", url: AOS.q2.url, published_at: "2026-07-30", category: "Financial" },
      { title: "Groveport, OH plant and Lockbourne warehouse closing Dec 11; work moving to Appleton WI and Haltom City TX", url: AOS.grove.url, published_at: "2026-07-19", category: "Facility move" },
      { title: "Leonard Valve acquisition closed ($470M)", url: AOS.lv.url, published_at: "2026-01-06", category: "Acquisition" },
    ],
    contacts: [
      {
        name: "Patrick Williams", title: "Transportation Manager", role_type: "Logistics", location: "Nashville, TN", since: "2022-05", linkedin_url: "https://linkedin.com/in/patrick-williams-mba-0a898721", contact_source: "public",
        why: "Manages transportation for A. O. Smith out of Nashville; has worked on the broker/3PL side as a GEODIS transportation planner.",
        decisions: "Carrier assignment, routing guide and surge coverage.",
        career: [
          { title: "Transportation Manager", org: "A. O. Smith", years: "May 2022 – present" },
          { title: "National Distribution & Logistics Manager", org: "Hankook Tire America", years: "2021 – 2022" },
          { title: "Logistics Analyst", org: "Bridgestone Americas", years: "2016 – 2022" },
          { title: "Transportation Planner", org: "GEODIS", years: "2011 – 2013", note: "Assigned carriers to loads, planned routing, tracked and recovered shipments." },
        ],
        hooks: [{ text: "Started as a GEODIS transportation planner assigning carriers to loads (2011–2013), so he has worked the 3PL side.", say: "I saw you started as a transportation planner at GEODIS, so you know the broker side of the desk.", type: "professional", src: "https://linkedin.com/in/patrick-williams-mba-0a898721", confirmed: true }],
        brief: {
          sharpest: { text: "Groveport, OH closes by Dec 11 and its work moves to Appleton, WI and Haltom City, TX. Patrick's team has to cover transfer loads out of Ohio and new outbound lanes in the next 60 days, on top of pre-buy surges before the 4–7% price increase.", why: "A hard deadline with new origins is when a transportation manager adds a broker. He has sat in a 3PL planner's seat, so talk lanes, not pitch.", src: [2, 3] },
          known: [
            { text: "Transportation Manager in Nashville since May 2022.", tag: "verified", src: 1 },
            { text: "Former GEODIS transportation planner; also Hankook and Bridgestone logistics.", tag: "verified", src: 1 },
            { text: "Groveport and Lockbourne close by Dec 11; work moves to Appleton and Haltom City.", tag: "verified", src: 2 },
            { text: "Customer pre-buy pulled demand into Q2 ahead of price increases.", tag: "verified", src: 3 },
            { text: "The Groveport transfer freight may not be fully contracted yet.", tag: "inferred" },
          ],
          cares: ["Covering the Groveport transfer on time", "Surges before price increases", "Routing guide compliance", "Cost per load as steel costs rise"],
          openers: [
            { driver: "RISK", text: "I saw Groveport's work moves to Appleton and Haltom City by December. How are you covering the transfer loads out of Ohio?", src: [2] },
            { driver: "PAIN", text: "When customers pre-bought ahead of the price increase in Q2, where did truck capacity get tight first?", src: [3] },
            { driver: "GET", text: "You've worked the GEODIS side. What would make a broker actually useful to your routing guide?", src: [1] },
          ],
          questions: [
            { know: "I know Groveport closes December 11.", dontKnow: "What I don't know is whether the transfer and new outbound lanes are already covered.", ladder: ["How many loads out of Groveport and Lockbourne?", "Who's planning the Appleton and Haltom City lanes?", "What happens if a transfer slips past the 11th?"] },
            { know: "I know pre-buy surges hit in Q2.", dontKnow: "What I don't know is how far your routing guide stretches before you go to spot.", ladder: ["Which plants hit it first?", "What did spot cost you?", "Would a pre-booked surge carrier have helped?"] },
          ],
          talkTrack: { C: "Thanks for taking the call, Patrick. I saw you started at GEODIS, so I'll keep this lane-specific.", R: "I'm calling because we cover transfer and surge dry-van loads for manufacturers during plant moves.", V: { GET: "Capacity for the Groveport transfer without changing your routing guide.", PAIN: "Fewer hours finding trucks for one-off moves.", RISK: "Wholesaler orders stay on time while Groveport winds down." }, A: "Would you be open to a 15-minute call next Tuesday or Thursday to look at the Groveport transfer lanes?" },
          crva: {
            reason: "I'm reaching out because we cover transfer and surge dry-van loads for manufacturers during plant moves, especially out of the Midwest and Texas.",
            value: { GET: "We can add capacity for the Groveport transfer and the new Appleton and Haltom City lanes without changing your routing guide.", PAIN: "We can save your team the hours it takes to find trucks for one-off transfer moves.", RISK: "We can keep wholesaler orders on time while Groveport winds down by backing up your core carriers." },
            asks: { meeting: "Would you be open to a 15-minute call next Tuesday or Thursday to look at the Groveport transfer lanes?", referral: "Are you the right person for the Groveport transfer freight, or would you point me to who is?" },
            companyHook: { text: "I saw the Groveport water-treatment operations are moving to Appleton and Haltom City by December.", src: 2 },
            liShort: "Saw Groveport is moving to Appleton and Haltom City.",
            liValue: "We cover transfer loads during plant moves.",
          },
          persona: { objections: ["We have a core carrier program.", "We're mid-transition. Call me in Q1.", "We only use asset carriers.", "What's your rate Groveport to Appleton?"], valueToUs: "Transfer and surge dry-van loads.", valueToThem: "On-time coverage through a plant move." },
          sources: n([li("Patrick Williams", "https://linkedin.com/in/patrick-williams-mba-0a898721"), AOS.grove, AOS.call]),
          research: { agentMinutes: 2, reviewMinutes: 10, gaps: ["The profile shows Hankook and Bridgestone dates overlapping; career order needs a human check."] },
        },
      },
      {
        name: "Eric Trott", title: "Vice President of Global Supply Chain", role_type: "Supply Chain", location: "Nashville, TN", since: "2025-01", linkedin_url: "https://linkedin.com/in/erictrott", contact_source: "public",
        why: "Executive over global supply chain; came up through commodity management and global sourcing.",
        decisions: "Supply chain strategy, sourcing and logistics budget.",
        career: [
          { title: "Vice President of Global Supply Chain", org: "A. O. Smith", years: "Jan 2025 – present" },
          { title: "Senior Director / Director of Global Sourcing", org: "A. O. Smith", years: "2022 – 2025" },
          { title: "Commodity Manager", org: "A. O. Smith", years: "2017 – 2022" },
          { title: "Supply Chain Director", org: "Cargill (steel processing)", years: "2015 – 2017" },
        ],
        hooks: [{ text: "Came up through commodity and global sourcing roles, including steel at Cargill; Lean Six Sigma Green Belt.", say: "With your background in steel sourcing, the 20% steel increase must be front and center for you.", type: "professional", src: "https://linkedin.com/in/erictrott", confirmed: true }],
        brief: {
          sharpest: { text: "Steel costs rose 20% YoY in Q2 and squeezed North America margins, while the Groveport plant consolidates into Appleton and Haltom City. Eric is a former steel commodity manager now running global supply chain, and freight is a cost lever he can still pull.", why: "He thinks in cost and sourcing. Frame freight as a commodity he can buy better, then ask for a referral to transportation.", src: [2, 3] },
          known: [
            { text: "VP of Global Supply Chain since Jan 2025.", tag: "verified", src: 1 },
            { text: "Former commodity manager and Cargill steel supply chain director.", tag: "verified", src: 1 },
            { text: "Steel up 20% YoY in Q2 2026; NA adjusted margin down 100 bps.", tag: "verified", src: 3 },
            { text: "Groveport consolidation is part of a water-treatment restructuring worth $6–8M a year from 2027.", tag: "verified", src: 2 },
            { text: "Freight savings may count toward the same restructuring targets.", tag: "inferred" },
          ],
          cares: ["Input cost inflation (steel, freight)", "Restructuring savings", "Supply resilience across plants"],
          openers: [{ driver: "PAIN", text: "With steel up 20% this year, is freight one of the levers you're pulling to protect margin?", src: [3] }],
          questions: [{ know: "I know steel is up 20% and pricing only partly offsets it.", dontKnow: "What I don't know is how freight is managed: as a sourced commodity or run by operations.", ladder: ["Who owns the freight budget?", "When is it bid?", "What savings target is it carrying this year?"] }],
          talkTrack: { C: "Thanks for the time, Eric. With your steel sourcing background, this year's 20% increase must be front of mind.", R: "I'm calling because we help manufacturers buy truckload capacity more like a commodity: competitive, flexible and measured.", V: { GET: "Market-rate capacity when you need it.", PAIN: "Lower cost per load on transfer and surge freight.", RISK: "Coverage during the Groveport consolidation." }, A: "Who on your transportation team would be the right person for me to show a Groveport lane comparison?" },
          crva: {
            reason: "I'm reaching out because we help manufacturers buy truckload capacity more like a commodity: competitive, flexible and measured.",
            value: { GET: "We can give you market-rate capacity when demand surges.", PAIN: "We can lower cost per load on transfer and surge freight while steel squeezes margin.", RISK: "We can keep the Groveport consolidation on schedule with backup coverage." },
            asks: { meeting: "Would you be open to a 15-minute call next week to compare freight costs on two lanes?", referral: "Who on your transportation team should I show a Groveport lane comparison?" },
            companyHook: { text: "I saw the Groveport water-treatment operations are moving to Appleton and Haltom City by December.", src: 2 },
            liShort: "Saw Groveport is moving to Appleton and Haltom City.",
            liValue: "We help buy truckload like a commodity.",
          },
          persona: { objections: ["Transportation reports to operations.", "We bid freight annually.", "Send it to Patrick."], valueToUs: "An executive referral to transportation.", valueToThem: "Measurable freight savings while steel costs rise." },
          sources: n([li("Eric Trott", "https://linkedin.com/in/erictrott"), AOS.q2, AOS.call]),
          research: { agentMinutes: 1, reviewMinutes: 8, gaps: ["The profile lists a personal email in its About section. The portal doesn't store it."] },
        },
      },
      {
        name: "Joshua Potts", title: "Senior North American Distribution Manager", role_type: "Operations", location: "Nashville metro, TN", since: "2023-06", linkedin_url: "https://linkedin.com/in/joshuarpotts", contact_source: "public",
        why: "Runs North American distribution; came up through the Ashland City DC.",
        decisions: "DC operations, dock schedules, outbound readiness; influences carrier performance reviews.",
        career: [
          { title: "Senior North American Distribution Manager", org: "A. O. Smith", years: "Jun 2023 – present" },
          { title: "Distribution Manager / Distribution Operations Manager", org: "A. O. Smith (Ashland City)", years: "2019 – 2023" },
          { title: "Distribution Supervisor", org: "A. O. Smith (Ashland City)", years: "2016 – 2019" },
        ],
        hooks: [
          { text: "Started at the Ashland City DC as a forklift operator (2013) and rose to Senior North American Distribution Manager; earned a BS in Operations Management (Transportation & Logistics), summa cum laude, in 2021.", say: "I saw you came up through the Ashland City DC. That's a rare view of the operation.", type: "personal", src: "https://linkedin.com/in/joshuarpotts", confirmed: false },
        ],
        brief: {
          sharpest: { text: "Storm damage at Ashland City, the world's largest water heater plant, constrained production and shipping in Q1 2026. Joshua runs North American distribution and has worked every role in that DC.", why: "He feels a missed pickup on the dock first. Offer backup capacity for the next disruption and for pre-buy surges.", src: [2, 3] },
          known: [
            { text: "Senior North American Distribution Manager since June 2023.", tag: "verified", src: 1 },
            { text: "Previously ran Ashland City DC operations.", tag: "verified", src: 1 },
            { text: "Q1 2026 storm damage at Ashland City constrained shipping.", tag: "verified", src: 2 },
            { text: "Ashland City is the world's largest water heater factory.", tag: "verified", src: 3 },
            { text: "Dock capacity, not carriers, may be his tightest constraint at peak.", tag: "inferred" },
          ],
          cares: ["Dock flow and on-time pickups", "Recovering from disruptions", "Pre-buy surges", "Carrier reliability at the DC"],
          openers: [
            { driver: "RISK", text: "I read that the storm at Ashland City constrained shipping in Q1. When that happened, how did you keep wholesaler orders moving?", src: [2] },
            { driver: "PAIN", text: "During the Q2 pre-buy, was the constraint trucks or dock time?", src: [2] },
          ],
          questions: [{ know: "I know Q1 storm damage at Ashland City constrained shipping.", dontKnow: "What I don't know is how you sourced extra trucks to catch up.", ladder: ["How long did recovery take?", "Which carriers came through?", "What would you do differently next time?"] }],
          talkTrack: { C: "Thanks for taking the call, Joshua. I read about the storm at Ashland City earlier this year.", R: "I'm calling because we give manufacturers backup dry-van capacity for disruptions and surges.", V: { GET: "Trucks on short notice after a disruption.", PAIN: "Fewer missed pickups clogging the dock.", RISK: "Wholesaler orders stay on time during pre-buy spikes." }, A: "Would you be open to a 15-minute call next week about a backup plan for Ashland City?" },
          crva: {
            reason: "I'm reaching out because we give manufacturers backup dry-van capacity for disruptions and demand surges.",
            value: { GET: "We can put trucks at your dock on short notice after a disruption.", PAIN: "We can cut missed pickups that clog the dock during pre-buy spikes.", RISK: "We can keep wholesaler orders on time when your core carriers run short." },
            asks: { meeting: "Would you be open to a 15-minute call next week about a backup plan for Ashland City?", referral: "Is carrier backup planning something you own, or should I talk with transportation?" },
            companyHook: { text: "I read that storm damage at Ashland City constrained shipping earlier this year.", src: 2 },
            liShort: "Read about the Ashland City recovery this year.",
            liValue: "We back up DCs with trucks on short notice.",
          },
          persona: { objections: ["Transportation picks carriers, not me.", "We recovered fine.", "Dock space is the issue, not trucks."], valueToUs: "An operations ally who influences carrier reviews.", valueToThem: "Fewer missed pickups and faster recovery." },
          sources: n([li("Joshua Potts", "https://linkedin.com/in/joshuarpotts"), AOS.q1, AOS.hwabout]),
          research: { agentMinutes: 1, reviewMinutes: 8, gaps: ["His career story is a strong Connect but personal; it stays locked until a rep confirms it's appropriate to mention."] },
        },
      },
      {
        name: "Ted Karamanos", title: "Director of Distribution (headline: Director of Global Logistics)", role_type: "Logistics", location: "Ashland City, TN", since: "2015-08", linkedin_url: "https://linkedin.com/in/ted-karamanos-519263bb", contact_source: "public",
        why: "Long-tenured distribution/logistics director at the Ashland City division HQ.",
        decisions: "Distribution network and DC strategy; likely El Paso and cross-border flows.",
        career: [{ title: "Director of Distribution", org: "A. O. Smith (Ashland City)", years: "Aug 2015 – present", note: "Profile headline says 'Director of Global Logistics'." }],
        hooks: [],
        brief: {
          sharpest: { text: "A. O. Smith opened a third Juárez plant in Sept 2024 that makes tankless and heat pump water heaters, feeding its El Paso DC. Ted's headline says he directs global logistics from Ashland City.", why: "Cross-border Juárez–El Paso flow is growing and needs reliable coverage. Confirm his scope first.", src: [2, 3] },
          known: [
            { text: "Director of Distribution at Ashland City since Aug 2015; headline says Director of Global Logistics.", tag: "verified", src: 1 },
            { text: "Third Juárez plant opened Sept 2024 (tankless, heat pump water heaters).", tag: "verified", src: 2 },
            { text: "El Paso, TX DC distributes residential water heaters and heat pumps.", tag: "verified", src: 3 },
            { text: "Juárez output crosses at El Paso and moves to the DC by drayage or short-haul.", tag: "inferred" },
          ],
          cares: ["Cross-border reliability", "DC network balance", "Heat pump growth ahead of 2029 rules"],
          openers: [{ driver: "GET", text: "With the third Juárez plant producing tankless and heat pump units, how is the El Paso flow keeping up?", src: [2] }],
          questions: [{ know: "I know Juárez feeds the El Paso DC.", dontKnow: "What I don't know is who handles the border crossing today.", ladder: ["Drayage or through-trailer?", "How long is dwell?", "What breaks when volume spikes?"] }],
          talkTrack: { C: "Thanks for the time, Ted. I saw the third Juárez plant is producing tankless and heat pump units now.", R: "I'm calling because we cover cross-border and outbound lanes for manufacturers at El Paso.", V: { GET: "Capacity as Juárez volume grows.", PAIN: "Less border dwell.", RISK: "Backup coverage if USMCA terms shift." }, A: "Would you be open to a 15-minute call next week about the El Paso lanes?" },
          crva: {
            reason: "I'm reaching out because we cover cross-border and outbound lanes for manufacturers at El Paso.",
            value: { GET: "We can add capacity as Juárez volume grows.", PAIN: "We can cut border dwell on Juárez-to-El Paso freight.", RISK: "We can back up cross-border lanes if USMCA terms change." },
            asks: { meeting: "Would you be open to a 15-minute call next week about the El Paso lanes?", referral: "Is Juárez cross-border freight in your scope, or would you point me to who owns it?" },
            companyHook: { text: "I saw the third Juárez plant is now producing tankless and heat pump water heaters.", src: 2 },
            liShort: "Saw the third Juárez plant is producing heat pumps.",
            liValue: "We cover cross-border lanes at El Paso.",
          },
          persona: { objections: ["That's handled by our Mexico team.", "We use a customs broker.", "Send me an email."], valueToUs: "Cross-border and El Paso outbound lanes.", valueToThem: "Reliable coverage as Juárez grows." },
          sources: n([li("Ted Karamanos", "https://linkedin.com/in/ted-karamanos-519263bb"), AOS.juarez, AOS.about]),
          research: { agentMinutes: 1, reviewMinutes: 8, gaps: ["Title conflict: the headline says Global Logistics, the experience says Distribution. Confirm before calling."] },
        },
      },
    ],
  },
];

export const STAGES = ["Research", "Outreach", "Connected", "Discovery", "Lane test / Quote", "Active shipper", "Closed lost"];
export const ROLE_TYPES = ["Executive", "Supply Chain", "Logistics", "Procurement", "Operations"];
export const SEGMENTS = ["Manufacturer", "Distributor", "Retailer"];
export const SIGNAL_KEYWORDS = ["new distribution center", "plant expansion", "new facility", "acquisition", "tariff", "logistics manager hiring", "transportation manager", "warehouse lease", "plant closure", "new product line"];

// ───────── Sample sales data (clearly labeled). Production pulls these from Salesforce / HubSpot. ─────────
export const SAMPLE_REPS = [
  { id: "minhkle", name: "Minh Le", role: "Sales Rep", monthly_quota: 60000, is_sample: false },
  { id: "rep-avery", name: "Avery Brooks", role: "Sales Rep", monthly_quota: 60000, is_sample: true },
  { id: "rep-sam", name: "Sam Ortiz", role: "Sales Rep", monthly_quota: 55000, is_sample: true },
  { id: "rep-taylor", name: "Taylor Nguyen", role: "Senior Rep", monthly_quota: 75000, is_sample: true },
];
