// Builds the mock-prospect persona from the person brief and the company profile.
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
  const b = contact.brief || {};
  const name = contact.name || "Sam Carter";
  const verified = (b.known || []).filter(l => l.tag === "verified").map(l => l.text);
  const practice = (b.known || []).filter(l => l.tag === "inferred").map(l => l.text);
  const facts = (account.brief?.facts || []).slice(0, 4).map(f => f.text);
  const career = (contact.career || []).slice(0, 3).map(c => `${c.title} at ${c.org} (${c.years})`).join("; ");
  const context = `${b.sharpest?.text || ""} About you: ${career}. Known public facts: ${verified.join(" ")} Company: ${facts.join(" ")} Practice details you may reveal only if asked well (treat them as true for this role-play): ${practice.join(" ")}`;
  return {
    persona_name: name,
    persona_first: name.split(" ")[0],
    persona_title: contact.title.replace(/\s*\(.*\)\s*$/, ""),
    company: account.name,
    company_context: context.slice(0, 3000),
    cares: (b.cares || []).join("; "),
    value_to_them: b.persona?.valueToThem || "",
    objections: (b.persona?.objections || []).join(" | "),
    call_goal: goal,
    difficulty: DIFFICULTY[difficulty] || DIFFICULTY.busy,
  };
}
