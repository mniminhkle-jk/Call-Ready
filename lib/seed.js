// Seed accounts for Call Ready. Researched 2026-10-17 with Exa (public sources only).
// Every fact line carries a tag: "verified" (tied to a numbered source) or "inferred" (flagged guess -> becomes a discovery question).
// This file is the version-controlled source of truth for the three sample briefs; the database copy is what reps edit.

export const RESEARCHED_ON = "2026-10-17";

export const SEED_ACCOUNTS = [
  // ───────────────────────────── BlueLinx ─────────────────────────────
  {
    id: "bluelinx",
    name: "BlueLinx",
    segment: "Distributor",
    hq: "Atlanta, GA",
    website: "https://www.bluelinxco.com",
    ticker: "NYSE: BXC",
    stage: "Research",
    brief: {
      oneLiner: "Two-step wholesale distributor of building products (lumber, panels, engineered wood, siding, millwork, outdoor living) serving all 50 states.",
      sharpest: {
        text: "In September 2026 BlueLinx brought three supplier lines into its network at once: Trex inventory landing at 11 Midwest and Southeast DCs, RDI railing added at 8 more DCs, and LP SmartSide stocked in 8 new markets in Texas, South Carolina and Florida. Its Q2 results already named third-party freight as one reason SG&A rose $12.1M.",
        why: "New supplier lines mean new inbound lanes and replenishment cycles that nobody has carrier history on yet. A logistics lead is most open to a backup carrier right when lanes are new.",
        src: [2, 3, 4, 1],
      },
      company: [
        { text: "Q2 2026 net sales $814M, up 4.4% YoY; adjusted EBITDA up 33%.", tag: "verified", src: 1 },
        { text: "Q2 SG&A rose $12.1M, attributed to Disdero, fuel and third-party freight expenses, and employee costs.", tag: "verified", src: 1 },
        { text: "Q3 2026 outlook: average daily sales volumes higher than Q3 2025 and slightly up from Q2.", tag: "verified", src: 1 },
        { text: "Strategy is mix shift to specialty products (engineered wood, siding, millwork, outdoor living), now about 69% of sales.", tag: "verified", src: 1 },
        { text: "Customers: national home centers, pro dealers, co-ops, specialty distributors, local dealers, industrial manufacturers.", tag: "verified", src: 1 },
      ],
      freight: {
        ships: [
          { text: "Lumber, panels, engineered wood, siding, trim, decking and railing: long, heavy, mostly unboxed.", tag: "verified", src: 1 },
          { text: "Equipment implied: flatbed and step-deck for lumber, panels and decking; dry van for millwork and boxed items.", tag: "inferred" },
        ],
        where: [
          { text: "Trex now ships into Indianapolis, St. Louis, Cincinnati, Erwin, Nashville, Atlanta, Birmingham, Memphis, Gulfport, Little Rock and Monroe DCs.", tag: "verified", src: 2 },
          { text: "Trex decking is made in Winchester, VA and Fernley, NV; Little Rock, AR decking production is expected in 2027.", tag: "verified", src: 7 },
          { text: "New LP SmartSide stocking: Charleston SC, Lake City FL, Dallas-Fort Worth, El Paso, Harlingen, Houston, Lubbock, San Antonio.", tag: "verified", src: 4 },
          { text: "Western growth: Portland, OR greenfield DC (2024), Disdero acquisition in Clackamas, OR (Nov 2025), 65,800 sq ft lease in Portland (Jul 2026).", tag: "verified", src: 5 },
        ],
        when: [
          { text: "Peak demand in the spring and summer building season; outdoor living stock-up in late winter.", tag: "inferred" },
          { text: "Trex inventory first landed in September 2026, so the first spring replenishment on these lanes is still ahead.", tag: "inferred" },
        ],
        who: [
          { text: "Runs its own delivery fleet: Q2 equipment additions and $77M of equipment finance leases were 'primarily fleet, facility and technology'.", tag: "verified", src: 1 },
          { text: "Also pays third-party carriers (named as an SG&A cost driver in Q2).", tag: "verified", src: 1 },
          { text: "Likely split: own trucks for last-mile dealer delivery, outside carriers for inbound supplier freight and DC transfers.", tag: "inferred" },
        ],
      },
      openers: [
        { driver: "RISK", text: "I saw Trex inventory started landing at your 11 Midwest and Southeast DCs in September. How has the first replenishment cycle out of Winchester and Fernley gone?", src: [2, 7] },
        { driver: "PAIN", text: "Your Q2 release named third-party freight as part of the SG&A increase. Where is outside freight costing you the most right now: inbound from suppliers or transfers between DCs?", src: [1] },
        { driver: "GET", text: "With LP SmartSide now stocked in seven Texas markets plus Charleston and Lake City, are those new stocking points fed from the mill or from your existing DCs?", src: [4] },
      ],
      questions: [
        { know: "I know you run your own fleet for dealer deliveries.", dontKnow: "What I don't know is how you split inbound supplier freight between your trucks and outside carriers.", ladder: ["Which lanes go to outside carriers first when volume spikes?", "How far ahead do you book flatbed capacity for spring?", "What happens to dealer fill rates when a load gets dropped?"] },
        { know: "I know Trex is now shipping into 11 of your DCs.", dontKnow: "What I don't know is whether Trex ships prepaid or you control that inbound freight.", ladder: ["Who decides the carrier on those inbound loads?", "How many loads a week do you expect per DC in peak season?", "Who signs off on adding a new carrier for those lanes?"] },
        { know: "I know spring is your peak season.", dontKnow: "What I don't know is how you secured flatbed and step-deck capacity last March through May.", ladder: ["Where did you come up short?", "What did a late load cost you with a pro dealer?", "What would a reliable surge carrier be worth on your top three lanes?"] },
      ],
      talkTrack: {
        C: "Thanks for taking the call. I saw Trex inventory landing across your 11 Midwest and Southeast DCs. How's the launch going?",
        R: "I'm calling because we move flatbed and step-deck freight for building-products distributors, and new supplier lanes are where we usually help first.",
        V: { GET: "Add surge capacity for the spring build season without adding trucks to your fleet.", PAIN: "Cut what you spend per load on third-party inbound freight, which you named in Q2.", RISK: "Keep DC fill rates steady when a carrier drops a load in peak season." },
        A: "Would you be open to a 15-minute call next Tuesday or Thursday to look at two or three of your new inbound lanes?",
      },
      crva: {
        reason: "I'm reaching out because we move flatbed and step-deck freight for building-products distributors, and new supplier lanes are usually where we help first.",
        value: {
          GET: "We can add surge flatbed capacity for your spring build season without you adding trucks to the fleet.",
          PAIN: "We can take cost out of third-party inbound freight, which your Q2 release called out as an SG&A driver.",
          RISK: "We can back up your carriers on new lanes so a dropped load doesn't empty a DC's shelf during peak season.",
        },
        asks: {
          meeting: "Would you be open to a 15-minute call next Tuesday or Thursday to look at two or three of your new inbound lanes?",
          referral: "Are you the right person for inbound carrier decisions, or would you point me to who is?",
        },
        companyHook: { text: "Congratulations on bringing Trex into your 11 Midwest and Southeast DCs in September.", src: 2 },
        liValue: "We cover flatbed surges on new supplier lanes.",
      },
      persona: {
        cares: ["DC fill rates and dealer service", "Third-party freight cost per load", "Spring flatbed capacity", "Integrating new supplier lines (Trex, RDI, LP SmartSide)"],
        objections: ["We run our own fleet.", "We already have carriers for that.", "Send me an email.", "Trex controls that freight, not us."],
        valueToUs: "Steady flatbed volume on new inbound lanes and spring surge loads.",
        valueToThem: "Backup capacity and lower cost per load while new supplier lanes settle in.",
      },
      sources: [
        { n: 1, title: "BlueLinx Announces Second Quarter 2026 Results", url: "https://investors.bluelinxco.com/news/news-details/2026/BlueLinx-Announces-Second-Quarter-2026-Results/default.aspx", date: "2026-08-04" },
        { n: 2, title: "BlueLinx and Trex announce new distribution relationship", url: "https://investors.bluelinxco.com/news/news-details/2026/BlueLinx-and-Trex-Announce-New-Distribution-Relationship-and-Inventory-Landing-Across-Key-U-S--Growth-Markets/default.aspx", date: "2026-09-03" },
        { n: 3, title: "BlueLinx expands RDI railing distribution to 21 locations", url: "https://investors.bluelinxco.com/news/news-details/2026/BlueLinx-Expands-RDI-Railing-Distribution-to-21-Locations-Across-Key-U-S--Markets/default.aspx", date: "2026-09-15" },
        { n: 4, title: "BlueLinx expands LP SmartSide trim & siding offering", url: "https://investors.bluelinxco.com/news/news-details/2026/BlueLinx-Expands-LP-SmartSide-Trim--Siding-Offering-Across-Key-U-S--Markets/default.aspx", date: "2026-09-29" },
        { n: 5, title: "BlueLinx acquires Disdero Lumber Company", url: "https://investors.bluelinxco.com/news/news-details/2025/BlueLinx-Acquires-Disdero-Lumber-Company/default.aspx", date: "2025-11-03" },
        { n: 6, title: "BlueLinx leases 66,000 SF in Portland's East Columbia Corridor (The Registry)", url: "https://news.theregistryps.com/bluelinx-leases-66000-sqft-from-clarion-partners-in-portlands-east-columbia-corridor-as-market-leasing-hits-2008-lows/", date: "2026-07-31" },
        { n: 7, title: "Trex 10-K (manufacturing sites; Little Rock decking 2027)", url: "https://www.sec.gov/Archives/edgar/data/1069878/000119312526068732/trex-20251231.htm", date: "2026-02-25" },
      ],
      research: {
        agentMinutes: 2,
        reviewMinutes: 15,
        gaps: [
          "Couldn't find who owns inbound carrier decisions. No public logistics leader name, so contacts are by title.",
          "Couldn't confirm whether Trex freight is prepaid by the supplier or controlled by BlueLinx.",
          "Picking the Sharpest Signal took human judgment: the agent ranked the Q2 earnings headline first, but the Trex/RDI/LP rollout points more directly at new freight.",
        ],
      },
    },
    contacts: [
      { name: "Shyam Reddy", title: "President & Chief Executive Officer", role_type: "Executive", contact_source: "public", why: "Sets the specialty-products growth strategy behind the Trex, RDI and LP rollouts.", decisions: "Approves strategic partners; rarely picks carriers.", hooks: [{ text: "Described BlueLinx's goal as being 'the premier distribution platform for Outdoor Living specialty products' (RDI release, Sep 15, 2026).", type: "professional", src: "https://investors.bluelinxco.com/news/news-details/2026/BlueLinx-Expands-RDI-Railing-Distribution-to-21-Locations-Across-Key-U-S--Markets/default.aspx", confirmed: true, say: "I read your comments on making BlueLinx the premier distribution platform for outdoor living, and the Trex, RDI and LP rollouts since then show it." }] },
      { name: null, title: "VP / Director of Transportation & Logistics", role_type: "Logistics", contact_source: "rep", why: "Owns carrier mix, fleet versus third-party spend, and freight cost per load.", decisions: "Carrier selection, routing guide, surge capacity.", hooks: [] },
      { name: null, title: "Branch / DC Operations Manager (Nashville or Indianapolis)", role_type: "Operations", contact_source: "rep", why: "Feels a missed inbound Trex load first; manages receiving and dealer fill rates.", decisions: "Influences carrier scorecards; can request backup capacity.", hooks: [] },
      { name: null, title: "Category Manager, Outdoor Living (Purchasing)", role_type: "Procurement", contact_source: "rep", why: "Manages the Trex and RDI supplier relationships and inbound terms.", decisions: "Freight terms with suppliers (prepaid vs. collect).", hooks: [] },
    ],
    signals: [
      { title: "LP SmartSide stocking added in 8 markets (TX, SC, FL)", url: "https://investors.bluelinxco.com/news/news-details/2026/BlueLinx-Expands-LP-SmartSide-Trim--Siding-Offering-Across-Key-U-S--Markets/default.aspx", published_at: "2026-09-29", category: "New product line" },
      { title: "RDI railing expanded from 13 to 21 DCs", url: "https://investors.bluelinxco.com/news/news-details/2026/BlueLinx-Expands-RDI-Railing-Distribution-to-21-Locations-Across-Key-U-S--Markets/default.aspx", published_at: "2026-09-15", category: "New product line" },
      { title: "Trex inventory landing at 11 Midwest/Southeast DCs", url: "https://investors.bluelinxco.com/news/news-details/2026/BlueLinx-and-Trex-Announce-New-Distribution-Relationship-and-Inventory-Landing-Across-Key-U-S--Growth-Markets/default.aspx", published_at: "2026-09-03", category: "New supplier lanes" },
      { title: "Q2 2026: sales +4.4%; third-party freight named in SG&A rise", url: "https://investors.bluelinxco.com/news/news-details/2026/BlueLinx-Announces-Second-Quarter-2026-Results/default.aspx", published_at: "2026-08-04", category: "Financial" },
      { title: "65,800 sq ft lease at 4740 NE 166th, Portland", url: "https://news.theregistryps.com/bluelinx-leases-66000-sqft-from-clarion-partners-in-portlands-east-columbia-corridor-as-market-leasing-hits-2008-lows/", published_at: "2026-07-31", category: "Facility" },
    ],
  },

  // ───────────────────────────── Pirelli ─────────────────────────────
  {
    id: "pirelli",
    name: "Pirelli Tire North America",
    segment: "Manufacturer",
    hq: "Rome, GA (US HQ) · Milan, Italy (group)",
    website: "https://www.pirelli.com/tyres/en-us/",
    ticker: "BIT: PIRC",
    stage: "Research",
    brief: {
      oneLiner: "Premium car and motorcycle tire maker; US headquarters and plant in Rome, GA, with most US volume imported from Mexico, Europe and Brazil.",
      sharpest: {
        text: "On Sept 22, 2026 Pirelli's board approved about $1.2B to expand the Rome, GA plant to about 6M car tires a year by 2033, with capacity starting to rise from 2028. In 2025, Rome supplied only about 5% of US demand; the rest came from Silao, Mexico (55%) and Europe/Brazil (40%). Most US volume keeps crossing the border and coming through the ports for years while Rome ramps.",
        why: "It's fresh, it's a public win to congratulate, and it opens a real question: how does logistics change over a multi-year ramp, while USMCA is under annual review?",
        src: [1, 2, 4],
      },
      company: [
        { text: "Board approved a roughly €1B / $1.2B US investment plan on Sept 22, 2026, with phased work starting in 2027.", tag: "verified", src: 1 },
        { text: "About 1,000 new jobs; most hiring expected in 2029; full operations projected for 2033. Rome currently employs 234.", tag: "verified", src: 2 },
        { text: "Cyber Tyre (sensor-equipped connected tire) production started at Rome; announced May 2026.", tag: "verified", src: 3 },
        { text: "The US is about 40% of global High Value tire volume, Pirelli's core segment.", tag: "verified", src: 1 },
        { text: "Sinochem cut its stake from 34.1% to 20.1% in July 2026 after Italy's golden-power decree.", tag: "verified", src: 9 },
      ],
      freight: {
        ships: [
          { text: "Finished car, SUV and motorcycle tires: light, bulky, high cube.", tag: "verified", src: 1 },
          { text: "Equipment implied: 53' dry van and intermodal containers; tires cube out before they weigh out.", tag: "inferred" },
        ],
        where: [
          { text: "2025 US supply mix: about 5% Rome, GA; 55% Silao, Mexico (plant described as 'fully saturated'); 40% Europe and Brazil.", tag: "verified", src: 4 },
          { text: "US warehousing run by Kuehne+Nagel in McDonough, GA and Rialto, CA (800,000 sq ft), where domestic shipments are consolidated.", tag: "verified", src: 6 },
          { text: "Mexico-to-US flows have historically moved by rail through Texas and by truck; ocean imports come in through Savannah/Charleston and LA/Long Beach.", tag: "inferred", src: 8 },
        ],
        when: [
          { text: "Replacement-tire peaks: winter changeover sell-in (Aug–Nov) and spring.", tag: "inferred" },
          { text: "Construction and robotics equipment moving into Rome from 2027 as the expansion phases start.", tag: "inferred" },
        ],
        who: [
          { text: "Uses 3PL Kuehne+Nagel for US warehousing and consolidation (partnership extended in 2022).", tag: "verified", src: 6 },
          { text: "Logistics team is upgrading to third-generation WMS/TMS with barcode scanning and GPS shipment tracking (June 2025).", tag: "verified", src: 7 },
          { text: "Revised logistics flows in 2025 to soften tariffs (15% on EU car tires; Mexico duty-free as USMCA-compliant).", tag: "verified", src: 5 },
        ],
      },
      openers: [
        { driver: "RISK", text: "Congratulations on the board approval for Rome last month. While capacity ramps toward 2033, how is your team planning the Silao and port flows that still cover most of US demand?", src: [1, 4] },
        { driver: "PAIN", text: "I saw your logistics team talk about moving to third-generation WMS with GPS tracking. Which outbound lanes from McDonough have been hardest to get reliable tracking on?", src: [7, 6] },
        { driver: "GET", text: "With winter-tire sell-in running now, where do you need the most extra dry-van capacity out of McDonough and Rialto?", src: [6] },
      ],
      questions: [
        { know: "I know Silao was described as fully saturated and supplies over half of your US demand.", dontKnow: "What I don't know is how those loads cross today: rail, truck, or a mix.", ladder: ["What share goes by truck through Laredo?", "Where does border dwell hurt you most?", "What would a backup cross-border carrier need to prove to you first?"] },
        { know: "I know Kuehne+Nagel runs your McDonough and Rialto warehouses.", dontKnow: "What I don't know is who chooses the outbound truckload carriers: you or K+N.", ladder: ["How is that carrier mix reviewed?", "When does winter sell-in push you over your routing guide?", "Who would need to sign off on adding a carrier?"] },
        { know: "I know the Rome expansion starts in 2027 and ramps capacity from 2028.", dontKnow: "What I don't know is whether Rome will ship more direct to OEMs and dealers or keep consolidating through McDonough.", ladder: ["How will that change your lane plan?", "Who is planning the network for 2028?", "What would make a carrier useful to that plan now?"] },
      ],
      talkTrack: {
        C: "Thanks for taking the call, and congratulations on the board approval for the Rome expansion. How is the team feeling about the ramp?",
        R: "I'm calling because we move dry-van and cross-border freight for tire and auto-parts shippers, especially out of Mexico and the Southeast ports.",
        V: { GET: "Add dry-van capacity for the winter sell-in peak without renegotiating your routing guide.", PAIN: "Cut border dwell and cost per load on Silao-to-Georgia freight.", RISK: "Have a tested backup carrier if USMCA review or port congestion disrupts a lane." },
        A: "Would you be open to a 15-minute call next week to compare notes on one or two of your Silao or McDonough lanes?",
      },
      crva: {
        reason: "I'm reaching out because we move dry-van and cross-border freight for tire and auto-parts shippers, especially out of Mexico and the Southeast ports.",
        value: {
          GET: "We can add dry-van capacity for your winter sell-in peak out of McDonough and Rialto without reworking your routing guide.",
          PAIN: "We can cut border dwell and cost per load on Silao-to-Georgia freight.",
          RISK: "We can be your tested backup carrier if the USMCA review or port congestion disrupts a lane while Rome ramps.",
        },
        asks: {
          meeting: "Would you be open to a 15-minute call next Tuesday or Thursday to compare notes on one or two Silao or McDonough lanes?",
          referral: "Are you the right person for cross-border carrier decisions, or would you point me to who is?",
        },
        companyHook: { text: "Congratulations on the board approval for the Rome, Georgia expansion on September 22.", src: 1 },
        liValue: "We back up Silao and port lanes while Rome ramps.",
      },
      persona: {
        cares: ["Service levels for retail and OEM customers", "Cross-border reliability from Silao", "Tariff and USMCA exposure", "Visibility and GPS tracking", "Winter sell-in peak"],
        objections: ["Kuehne+Nagel handles that.", "We mostly use rail out of Mexico.", "We're locked into contracts until next year.", "Send me your rate sheet."],
        valueToUs: "Peak-season dry-van loads and cross-border lanes.",
        valueToThem: "Backup capacity and visibility during a multi-year network change.",
      },
      sources: [
        { n: 1, title: "Pirelli board approves US multi-year investment plan of ~€1B", url: "https://press.pirelli.com/pirelli-board-of-directors-majority-approves-us-multi-year-investment-plan-of-approximately-1-billion/", date: "2026-09-22" },
        { n: 2, title: "Italian tire company Pirelli plans $1.2B expansion (CBS Atlanta)", url: "https://www.cbsnews.com/atlanta/news/italian-tire-company-pirelli-plans-1-2-billion-expansion-at-georgia-headquarters-creating-1000-jobs/", date: "2026-09-23" },
        { n: 3, title: "Pirelli will start Cyber Tyre production in Georgia", url: "https://press.pirelli.com/pirelli-will-start-cyber-tyre-production-in-georgia-underlining-the-strategic-importance-of-the-us-market/", date: "2026-05-06" },
        { n: 4, title: "Pirelli: key role for Mexico plant in tariff-response strategy (ERJ)", url: "https://www.european-rubber-journal.com/article/2097859/mexico-to-support-pirelli-to-mitigate-us-tariff", date: "2025-08-14" },
        { n: 5, title: "Pirelli nine-month results amid currency, tariff headwinds (ERJ)", url: "https://www.european-rubber-journal.com/article/2098307/pirelli-reports-nine-month-growth-as-sales-impacted-by-currency-effects", date: "2025-11-10" },
        { n: 6, title: "Pirelli and Kuehne+Nagel extend cooperation (McDonough GA, Rialto CA)", url: "https://newsroom.kuehne-nagel.com/almost-two-decades-of-contract-logistics-partnership--pirelli-and-kuehnenagel-extend-cooperation-again/", date: "2022-10-05" },
        { n: 7, title: "Pirelli Tire's logistics team on digitalising warehouse systems (Automotive Logistics)", url: "https://www.automotivelogistics.media/red-sofa-interviews/john-godfrey-at-pirelli-tire-on-incorporating-next-gen-digital-management-systems/337993", date: "2025-06-19" },
        { n: 8, title: "A stronger grip on the market (Automotive Logistics; dated 2014, used for background only)", url: "https://www.automotivelogistics.media/supply-chain/a-stronger-grip-on-the-market/212766", date: "2014-09-22" },
        { n: 9, title: "Pirelli approves €1bn US plant expansion plan (Just Auto)", url: "https://www.just-auto.com/news/pirelli-e1bn-us-plant-expansion-plan/", date: "2026-09-23" },
      ],
      research: {
        agentMinutes: 2,
        reviewMinutes: 20,
        gaps: [
          "The supply mix (5/55/40) is 2025 data. It's labeled with its date because it may have shifted.",
          "The agent surfaced a 2014 article naming a Fontana, CA warehouse; the 2022 Kuehne+Nagel release says Rialto, CA. A human caught the stale source.",
          "Couldn't confirm the current Mexico-to-US mode split (rail vs. truck), so it's left as a discovery question.",
        ],
      },
    },
    contacts: [
      { name: "Claudio Zanardo", title: "CEO, Pirelli North America", role_type: "Executive", contact_source: "public", why: "Public face of the Rome expansion and the 'local for local' strategy.", decisions: "Strategy and network investment; delegates carrier choices.", hooks: [{ text: "Said the Rome expansion 'strengthens our local for local strategy' (Sept 2026 announcement).", type: "professional", src: "https://www.cbsnews.com/atlanta/news/italian-tire-company-pirelli-plans-1-2-billion-expansion-at-georgia-headquarters-creating-1000-jobs/", confirmed: true, say: "I read your comments on how the Rome expansion strengthens Pirelli's local-for-local strategy." }] },
      { name: "John Godfrey", title: "Senior Director, Logistics Operations (as of June 2025; confirm current role)", role_type: "Logistics", contact_source: "public", why: "Owns warehouse and transport systems; leading the WMS/TMS upgrade.", decisions: "3PL and carrier strategy, TMS, network design.", hooks: [{ text: "Spoke at Automotive Logistics & Supply Chain Digital Strategies North America in Nashville about moving to third-gen WMS with GPS tracking (June 2025).", type: "professional", src: "https://www.automotivelogistics.media/red-sofa-interviews/john-godfrey-at-pirelli-tire-on-incorporating-next-gen-digital-management-systems/337993", confirmed: true, say: "I watched your Automotive Logistics interview from Nashville about moving Pirelli to third-generation WMS with GPS tracking." }] },
      { name: null, title: "Transportation / Import Logistics Manager", role_type: "Logistics", contact_source: "rep", why: "Runs day-to-day truckload and cross-border carrier assignments.", decisions: "Load tendering, carrier scorecards, spot coverage.", hooks: [] },
      { name: null, title: "Procurement Manager, Logistics Services", role_type: "Procurement", contact_source: "rep", why: "Runs the carrier and 3PL bid process.", decisions: "Annual RFPs and contract awards.", hooks: [] },
    ],
    signals: [
      { title: "Board approves ~$1.2B Rome, GA expansion to ~6M tires by 2033", url: "https://press.pirelli.com/pirelli-board-of-directors-majority-approves-us-multi-year-investment-plan-of-approximately-1-billion/", published_at: "2026-09-22", category: "Facility expansion" },
      { title: "USMCA not renewed in current form; annual reviews begin (affects Silao duty-free flow)", url: "https://www.icpainc.org/usmca-joint-review-steel-aluminum/", published_at: "2026-07-20", category: "Tariff / trade" },
      { title: "Cyber Tyre production to start at Rome, GA", url: "https://press.pirelli.com/pirelli-will-start-cyber-tyre-production-in-georgia-underlining-the-strategic-importance-of-the-us-market/", published_at: "2026-05-06", category: "New product line" },
    ],
  },

  // ───────────────────────────── A. O. Smith ─────────────────────────────
  {
    id: "aosmith",
    name: "A. O. Smith",
    segment: "Manufacturer",
    hq: "Milwaukee, WI",
    website: "https://www.aosmith.com",
    ticker: "NYSE: AOS",
    stage: "Research",
    brief: {
      oneLiner: "Largest maker of water heaters in North America, plus boilers (Lochinvar) and water treatment; about 78% of sales in North America.",
      sharpest: {
        text: "A. O. Smith is closing its Groveport, OH water-treatment plant and its Lockbourne, OH warehouse by Dec 11, 2026, and moving that work to Appleton, WI and Haltom City, TX. Its water-treatment shipping lanes get redrawn over the next 60 days, including inventory transfers out of Ohio and new outbound lanes from Wisconsin and Texas.",
        why: "A network move has a hard date, new origins and no carrier history on the new lanes. That's the moment a transportation team takes a call about capacity.",
        src: [4],
      },
      company: [
        { text: "Q2 2026 sales about $1B; North America $820.5M, up 5%; boiler sales up 21%; residential water heater volumes down.", tag: "verified", src: 2 },
        { text: "Steel costs up 20% YoY in Q2; water heater price increases of 4–7% landing mid-Q3, with customer pre-buy pulled into Q2.", tag: "verified", src: 3 },
        { text: "Acquired Leonard Valve (Cranston, RI) for $470M in January 2026; about $70M of sales expected in 2026.", tag: "verified", src: 5 },
        { text: "Storm damage at the Ashland City, TN plant constrained production and shipping in Q1 2026.", tag: "verified", src: 6 },
        { text: "Sells through about 800 independent plumbing wholesalers, plus an exclusive Lowe's relationship.", tag: "verified", src: 1 },
      ],
      freight: {
        ships: [
          { text: "Residential water heaters (mostly 40–80 gal), commercial water heaters, boilers, pressure tanks and water-treatment systems.", tag: "verified", src: 1 },
          { text: "Equipment implied: 53' dry van for boxed units (they cube out); LTL for parts and smaller orders.", tag: "inferred" },
        ],
        where: [
          { text: "Water heater plants: Ashland City TN (world's largest), Johnson City TN, Lebanon TN, McBee SC, Juárez MX (3rd plant opened Sept 2024), with an El Paso, TX DC.", tag: "verified", src: 7 },
          { text: "Water treatment moving from Groveport, OH to Appleton, WI and Haltom City, TX by Dec 2026.", tag: "verified", src: 4 },
          { text: "Cross-border flow from Juárez into the El Paso DC, then national distribution.", tag: "inferred" },
        ],
        when: [
          { text: "Replacement demand drives most volume; failures and replacements rise in colder months.", tag: "inferred" },
          { text: "Pre-buy surges before announced price increases (Q2 2026 pulled demand forward ahead of the mid-Q3 increase).", tag: "verified", src: 3 },
          { text: "October 2026 commercial gas regulation change, with a 2029 residential heat-pump change ahead; product-mix shifts change lanes.", tag: "verified", src: 8 },
        ],
        who: [
          { text: "Has an in-house Traffic Department. A Johnson City shipping role (posted Oct 5, 2026) coordinates carriers and daily LTL pickups.", tag: "verified", src: 9 },
          { text: "International freight is bid to carriers, forwarders and brokers (Trade Compliance Analyst posting, Aug 2026).", tag: "verified", src: 10 },
          { text: "Domestic truckload likely uses a core carrier routing guide; broker use for surges is unknown.", tag: "inferred" },
        ],
      },
      openers: [
        { driver: "RISK", text: "I saw the Groveport water-treatment work is moving to Appleton and Haltom City by December. How are you covering the new outbound lanes while the move happens?", src: [4] },
        { driver: "PAIN", text: "Your Q2 call mentioned customer pre-buy ahead of the price increase. When orders spike like that, where does truck capacity get tight first: the Tennessee plants or El Paso?", src: [3, 7] },
        { driver: "GET", text: "With Leonard Valve now part of A. O. Smith, are Cranston's shipments moving onto your carrier network or staying separate?", src: [5] },
      ],
      questions: [
        { know: "I know the Groveport operations move to Appleton and Haltom City by December 11.", dontKnow: "What I don't know is whether the inventory and equipment transfers are already covered.", ladder: ["How many loads are you expecting out of Groveport and Lockbourne?", "Who is planning the new Appleton and Haltom City outbound lanes?", "What happens to dealer orders if a transfer load slips?"] },
        { know: "I know your Traffic Department handles daily LTL pickups at Johnson City.", dontKnow: "What I don't know is how you decide when an LTL order should be a truckload or multi-stop.", ladder: ["How often do you consolidate?", "What does a missed pickup cost you with a wholesaler?", "Who reviews carrier performance each quarter?"] },
        { know: "I know Juárez opened a third plant and feeds your El Paso DC.", dontKnow: "What I don't know is how freight crosses from Juárez today and who handles it.", ladder: ["How long do loads dwell at the border?", "What changes if USMCA terms shift in the annual review?", "Would a second cross-border option be useful?"] },
      ],
      talkTrack: {
        C: "Thanks for taking the call. I saw the Groveport work is moving to Appleton and Haltom City. How is the transition going?",
        R: "I'm calling because we help manufacturers cover new lanes during plant moves, especially dry van out of the Midwest and Texas.",
        V: { GET: "Add capacity for the transfer loads and new outbound lanes without changing your routing guide.", PAIN: "Cut the time your Traffic team spends finding trucks for one-off moves.", RISK: "Keep wholesaler orders on time while Groveport winds down." },
        A: "Would you be open to a 15-minute call next Tuesday or Thursday to look at the Groveport transfer and the new Appleton lanes?",
      },
      crva: {
        reason: "I'm reaching out because we help manufacturers cover new lanes during plant moves, especially dry van out of the Midwest and Texas.",
        value: {
          GET: "We can add capacity for the Groveport transfer loads and the new Appleton and Haltom City lanes without you changing your routing guide.",
          PAIN: "We can save your Traffic team the hours it takes to find trucks for one-off transfer moves.",
          RISK: "We can keep wholesaler orders on time while Groveport winds down by backing up your core carriers.",
        },
        asks: {
          meeting: "Would you be open to a 15-minute call next Tuesday or Thursday to look at the Groveport transfer and the new Appleton lanes?",
          referral: "Are you the right person for the Groveport transfer freight, or would you point me to who is?",
        },
        companyHook: { text: "I saw the Groveport water-treatment operations are moving to Appleton and Haltom City by December.", src: 4 },
        liValue: "We cover transfer loads during plant moves.",
      },
      persona: {
        cares: ["On-time delivery to wholesalers and Lowe's", "Steel and freight cost pressure", "The Groveport transition", "Pre-buy surges before price increases", "USMCA and cross-border reliability"],
        objections: ["We have a core carrier program.", "Our Traffic Department handles that.", "We're in the middle of a transition; call me in Q1.", "We only use asset carriers."],
        valueToUs: "Transfer and surge dry-van loads, plus cross-border freight from Juárez.",
        valueToThem: "Capacity and on-time delivery during a plant move and pre-buy spikes.",
      },
      sources: [
        { n: 1, title: "A. O. Smith 2025 Annual Report / 10-K", url: "https://www.aosmith.com/on/demandware.static/-/Sites-aosmith-Library/default/dw9faf4a3d/pdf/2025-Annual-Report.pdf", date: "2026-02" },
        { n: 2, title: "A. O. Smith reports second quarter 2026 results", url: "https://investor.aosmith.com/node/23136/pdf", date: "2026-07-30" },
        { n: 3, title: "A. O. Smith Q2 2026 earnings call transcript (Motley Fool)", url: "https://www.fool.com/earnings/call-transcripts/2026/08/03/ao-smith-aos-q2-2026-earnings-call-transcript/", date: "2026-08-03" },
        { n: 4, title: "A. O. Smith to shutter Groveport plants, move production (NBC4)", url: "https://www.nbc4i.com/news/local-news/groveport/international-company-to-shutter-groveport-plants-lay-off-nearly-100-employees/", date: "2026-07-19" },
        { n: 5, title: "A. O. Smith completes acquisition of Leonard Valve", url: "https://investor.aosmith.com/news-releases/news-release-details/o-smith-completes-acquisition-leonard-valve-company", date: "2026-01-06" },
        { n: 6, title: "A. O. Smith reports first quarter 2026 results", url: "https://investor.aosmith.com/news-releases/news-release-details/o-smith-reports-first-quarter-2026-results-and-lowers-full-year", date: "2026-04-30" },
        { n: 7, title: "A. O. Smith About Us: locations and what each makes", url: "https://www.aosmith.com/about-us.html", date: "2026" },
        { n: 8, title: "Q&A with A. O. Smith CEO Stephen Shafer (Contractor Magazine)", url: "https://www.contractormag.com/industry-event-news/ahr/article/55355529/direct-from-the-ahr-expo-hall-our-exclusive-qa-with-a-o-smith-ceo-stephen-shafer", date: "2026-02-05" },
        { n: 9, title: "Distribution Shipping Representative, Johnson City, TN (job posting)", url: "https://jobs.aosmith.com/job/Johnson-City-Distribution-Shipping-Representative-TN-37601/1436948500/", date: "2026-10-05" },
        { n: 10, title: "Trade Compliance Analyst, Ashland City, TN (job posting)", url: "https://joblume.totalh.net/job/trade-compliance-analyst-job-at-a-o-smith-in-ashland-city-tn", date: "2026-08-20" },
      ],
      research: {
        agentMinutes: 2,
        reviewMinutes: 15,
        gaps: [
          "A LinkedIn data enrichment result claimed A. O. Smith has '2,000–3,000 employees'; the company's own postings say about 12,000. Rule: company-reported figures win.",
          "Couldn't confirm who handles the Groveport transfer freight or whether it's already contracted.",
          "Domestic broker use is unknown, so it's left as a discovery question.",
        ],
      },
    },
    contacts: [
      { name: "Steve Shafer", title: "Chairman & Chief Executive Officer", role_type: "Executive", contact_source: "public", why: "Frames strategy around flexibility and multi-site manufacturing to manage uncertainty.", decisions: "Strategy; not carrier selection.", hooks: [{ text: "Told Contractor Magazine 'we manufacture in multiple locations to mitigate risk' and named tariffs and supply chain disruption as top uncertainties (Feb 2026).", type: "professional", src: "https://www.contractormag.com/industry-event-news/ahr/article/55355529/direct-from-the-ahr-expo-hall-our-exclusive-qa-with-a-o-smith-ceo-stephen-shafer", confirmed: true, say: "I read your Contractor Magazine Q&A about manufacturing in multiple locations to manage tariff and supply chain risk." }] },
      { name: null, title: "Transportation Manager, North America Water Heating (Nashville)", role_type: "Logistics", contact_source: "rep", why: "Runs the Traffic Department and carrier program for the water heater plants.", decisions: "Routing guide, carrier awards, surge coverage.", hooks: [] },
      { name: null, title: "Logistics / Operations Manager, Water Treatment (Haltom City, TX)", role_type: "Logistics", contact_source: "rep", why: "Haltom City is receiving Groveport's work and handles water-treatment logistics.", decisions: "New outbound lanes from Texas.", hooks: [] },
      { name: null, title: "VP, Global Supply Chain / Procurement", role_type: "Supply Chain", contact_source: "rep", why: "Owns steel, freight and input-cost strategy across plants.", decisions: "Freight budget and logistics sourcing policy.", hooks: [] },
    ],
    signals: [
      { title: "Johnson City, TN shipping rep posting: carriers, daily LTL, Traffic Dept.", url: "https://jobs.aosmith.com/job/Johnson-City-Distribution-Shipping-Representative-TN-37601/1436948500/", published_at: "2026-10-05", category: "Logistics hiring" },
      { title: "Q2 2026: NA sales +5%, boilers +21%, steel +20%; 4–7% price increase mid-Q3", url: "https://investor.aosmith.com/node/23136/pdf", published_at: "2026-07-30", category: "Financial" },
      { title: "Groveport, OH plant and Lockbourne warehouse closing Dec 11; work moving to Appleton WI and Haltom City TX", url: "https://www.nbc4i.com/news/local-news/groveport/international-company-to-shutter-groveport-plants-lay-off-nearly-100-employees/", published_at: "2026-07-19", category: "Facility move" },
      { title: "Leonard Valve acquisition closed ($470M)", url: "https://investor.aosmith.com/news-releases/news-release-details/o-smith-completes-acquisition-leonard-valve-company", published_at: "2026-01-06", category: "Acquisition" },
    ],
  },
];

export const STAGES = ["Research", "Outreach", "Connected", "Discovery", "Lane test / Quote", "Active shipper", "Closed lost"];
export const ROLE_TYPES = ["Executive", "Supply Chain", "Logistics", "Procurement", "Operations"];
export const SEGMENTS = ["Manufacturer", "Distributor", "Retailer"];

// Exa keywords used for the event-trigger staleness rule.
export const SIGNAL_KEYWORDS = [
  "new distribution center", "plant expansion", "new facility", "acquisition", "tariff",
  "logistics manager hiring", "transportation manager", "warehouse lease", "plant closure", "new product line",
];
