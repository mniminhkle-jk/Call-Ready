import Link from "next/link";
import SignOut from "./SignOut";

export default function Shell({ user, active, children }) {
  const items = [["/", "Accounts"], ["/new", "Add account"], ["/team", "Team activity"], ["/how-it-works", "How it works"]];
  return (
    <>
      <header className="topbar">
        <div className="topbar-in">
          <Link href="/" className="mark" aria-label="Call Ready home">
            <svg width="26" height="26" viewBox="0 0 30 30" fill="none" aria-hidden><rect x="1" y="1" width="28" height="28" rx="6" stroke="currentColor" strokeWidth="2" /><path d="M8 19h8l3-8h3" stroke="#e08a1e" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /><circle cx="8" cy="19" r="2.2" fill="#e08a1e" /></svg>
            Call Ready
          </Link>
          <nav className="nav" aria-label="Main">
            {items.map(([href, label]) => <Link key={href} href={href} aria-current={active === href ? "page" : undefined}>{label}</Link>)}
          </nav>
          <div className="who"><span>{user?.name}</span><SignOut /></div>
        </div>
      </header>
      <main className="page">{children}</main>
    </>
  );
}
