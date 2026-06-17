"use client";

import { useState } from "react";
import TopBar from "@/components/TopBar";
import PrintGrid from "@/components/PrintGrid";
import { useProfile } from "@/lib/useProfile";

export default function ProfilePage() {
  const { uid, displayName, likes, loaded, remove, rename } = useProfile();
  const [editing, setEditing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 1600);
  }

  async function makeShareLink() {
    if (!uid) return;
    setBusy(true);
    try {
      // Make sure the server has our latest likes before minting a link.
      await fetch("/api/profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId: uid, displayName, likes }),
      });
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId: uid }),
      });
      const data = await res.json();
      if (data.shareId) {
        const url = `${window.location.origin}/u/${data.shareId}`;
        setShareUrl(url);
        try {
          await navigator.clipboard.writeText(url);
          flash("Share link copied to clipboard");
        } catch {
          flash("Share link ready");
        }
      } else {
        flash(data.error || "Could not create link");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="app">
      <TopBar likeCount={loaded ? likes.length : undefined} />

      <div className="profile-head">
        <div className="avatar">{(displayName || "M").charAt(0).toUpperCase()}</div>
        <div>
          {editing ? (
            <input
              className="name-input"
              autoFocus
              defaultValue={displayName}
              onBlur={(e) => {
                rename(e.target.value.trim() || "Maker");
                setEditing(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
            />
          ) : (
            <div className="name" onClick={() => setEditing(true)} title="Click to rename">
              {displayName} ✎
            </div>
          )}
          <div className="count">{likes.length} saved print{likes.length === 1 ? "" : "s"}</div>
        </div>
      </div>

      <div className="row" style={{ marginBottom: 12 }}>
        <button className="btn" onClick={makeShareLink} disabled={busy || likes.length === 0}>
          {busy ? "Creating…" : "Share my collection"}
        </button>
      </div>

      {shareUrl && (
        <div className="share-box">
          Public link: <a href={shareUrl}>{shareUrl}</a>
        </div>
      )}

      <PrintGrid models={likes} onRemove={remove} />

      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}
