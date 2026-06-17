"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/TopBar";
import SwipeDeck from "@/components/SwipeDeck";
import { useProfile } from "@/lib/useProfile";
import type { PrintModel } from "@/lib/types";

export default function Home() {
  const { likes, like, loaded } = useProfile();
  const [models, setModels] = useState<PrintModel[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/feed")
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        setModels(d.models || []);
        setStatus("ready");
      })
      .catch(() => active && setStatus("error"));
    return () => {
      active = false;
    };
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 1400);
  }

  return (
    <main className="app">
      <TopBar likeCount={loaded ? likes.length : undefined} />

      {status === "loading" && (
        <div className="deck">
          <div className="empty">
            <h2>Pulling prints…</h2>
            <p>Gathering models from across the web.</p>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="deck">
          <div className="empty">
            <h2>Couldn’t load the feed</h2>
            <p>Try refreshing the page.</p>
          </div>
        </div>
      )}

      {status === "ready" && (
        <SwipeDeck
          models={models}
          onLike={(m) => {
            like(m);
            showToast(`Saved “${m.title.slice(0, 24)}…” ♥`);
          }}
          onPass={() => {}}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}
