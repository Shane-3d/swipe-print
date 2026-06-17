import Link from "next/link";

export default function TopBar({ likeCount }: { likeCount?: number }) {
  return (
    <div className="topbar">
      <Link href="/" className="brand" style={{ color: "var(--text)" }}>
        <span className="dot">◆</span> Swipe<span style={{ color: "var(--accent)" }}>Print</span>
      </Link>
      <nav className="nav">
        <Link href="/">Discover</Link>
        <Link href="/profile">
          Saved{typeof likeCount === "number" ? ` (${likeCount})` : ""}
        </Link>
      </nav>
    </div>
  );
}
