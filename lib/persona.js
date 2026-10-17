// Builds the mock-prospect persona from the account brief and the contact.
const NAMES = { Logistics: ["Dana Whitfield", "Marcus Reyes"], Procurement: ["Priya Natarajan", "Tom Becker"], Operations: ["Luis Ortega", "Kara Simmons"], "Supply Chain": ["Elena Park", "Grant Howell"], Executive: ["Robert Hale", "Diane Moreau"] };

export const GOALS = [
  "Book a 15-minute discovery meeting",
  "Qualify one lane (origin, destination, equipment, volume)",
  "Get a referral to whoever picks carriers",
  "Follow up on a CRVA email they haven't answered",
];
export const DIFFICULTY = {
  receptive: "Receptive: friendly, has a few minutes, mildly curious.",
  busy: "Busy: polite but rushed; gives short answers until the rep earns more.",
  skeptical: "Skeptical: gets broker calls daily; pushes back hard; needs a specific reason to keep talking.",
};

export function buildPersona(account, contact, goal, difficulty) {
  const b = account.brief || {};
  const pool = NAMES[contact.role_type] || NAMES.Logistics;
  const name = contact.name || pool[(contact.id || "").charCodeAt(0) % pool.length || 0];
  const verified = [...(b.company || []), ...Object.values(b.freight || {}).flat()].filter(l => l.tag === "verified").map(l => l.text);
  const practice = Object.values(b.freight || {}).flat().filter(l => l.tag === "inferred").map(l => l.text.replace(/^Likely /, "").replace(/^Equipment implied: /, "Equipment: "));
  const context = `${b.sharpest?.text || ""} Known public facts: ${verified.slice(0, 6).join(" ")} Practice details you may reveal only if asked well (treat them as true for this role-play): ${practice.join(" ")}`;
  return {
    persona_name: name,
    persona_first: name.split(" ")[0],
    persona_title: contact.title.replace(/\s*\(.*\)\s*$/, ""),
    company: account.name,
    company_context: context.slice(0, 2500),
    cares: (b.persona?.cares || []).join("; "),
    value_to_them: b.persona?.valueToThem || "",
    objections: (b.persona?.objections || []).join(" | "),
    call_goal: goal,
    difficulty: DIFFICULTY[difficulty] || DIFFICULTY.busy,
  };
}
