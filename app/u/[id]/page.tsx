import Link from "next/link";
import PrintGrid from "@/components/PrintGrid";
import { getProfileByShareId } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function SharedProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfileByShareId(id);

  if (!profile) {
    return (
      <main className="app">
        <div className="topbar">
          <Link href="/" className="brand" style={{ color: "var(--text)" }}>
            <span className="dot">◆</span> Swipe<span style={{ color: "var(--accent)" }}>Print</span>
          </Link>
        </div>
        <div className="empty">
          <h2>Collection not found</h2>
          <p>This share link is invalid or was removed.</p>
          <Link className="btn" href="/" style={{ display: "inline-block", marginTop: 12 }}>
            Start swiping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="app">
      <div className="topbar">
        <Link href="/" className="brand" style={{ color: "var(--text)" }}>
          <span className="dot">◆</span> Swipe<span style={{ color: "var(--accent)" }}>Print</span>
        </Link>
        <nav className="nav">
          <Link href="/">Start swiping</Link>
        </nav>
      </div>

      <div className="profile-head">
        <div className="avatar">{(profile.displayName || "M").charAt(0).toUpperCase()}</div>
        <div>
          <div className="name">{profile.displayName}’s collection</div>
          <div className="count">{profile.likes.length} saved print{profile.likes.length === 1 ? "" : "s"}</div>
        </div>
      </div>

      <PrintGrid models={profile.likes} />
    </main>
  );
}
