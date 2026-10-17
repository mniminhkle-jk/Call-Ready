import Shell from "../components/Shell";
import NewAccount from "../components/NewAccount";
import { getUser } from "@/lib/session";
export default async function NewPage() {
  const user = await getUser();
  return (
    <Shell user={user} active="/new">
      <div className="stack" style={{ gap: 4 }}>
        <div className="eyebrow">Add account</div>
        <h1>Start a brief from a company name</h1>
        <p className="muted" style={{ margin: 0, maxWidth: 680 }}>The Exa check searches public sources from the last 90 days for facility news, expansions, acquisitions, tariff impact and logistics hiring. You then pick the Sharpest Signal and label each line verified or inferred.</p>
      </div>
      <NewAccount />
    </Shell>
  );
}
