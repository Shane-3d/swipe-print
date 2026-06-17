"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PrintModel } from "@/lib/types";

const UID_KEY = "swipeprint:uid";
const NAME_KEY = "swipeprint:name";
const LIKES_KEY = "swipeprint:likes";

function getUid(): string {
  if (typeof window === "undefined") return "";
  let uid = localStorage.getItem(UID_KEY);
  if (!uid) {
    uid = "u_" + Math.random().toString(36).slice(2, 12);
    localStorage.setItem(UID_KEY, uid);
  }
  return uid;
}

/**
 * Client-side profile state. Persists likes locally (instant, offline-friendly)
 * and mirrors them to the server so they can be shared via a public link.
 */
export function useProfile() {
  const [uid, setUid] = useState("");
  const [displayName, setDisplayName] = useState("Maker");
  const [likes, setLikes] = useState<PrintModel[]>([]);
  const [loaded, setLoaded] = useState(false);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const id = getUid();
    setUid(id);
    setDisplayName(localStorage.getItem(NAME_KEY) || "Maker");
    try {
      setLikes(JSON.parse(localStorage.getItem(LIKES_KEY) || "[]"));
    } catch {
      setLikes([]);
    }
    setLoaded(true);
  }, []);

  // Debounced sync to server whenever likes/name change.
  const sync = useCallback(
    (nextLikes: PrintModel[], name: string, id: string) => {
      if (!id) return;
      if (syncTimer.current) clearTimeout(syncTimer.current);
      syncTimer.current = setTimeout(() => {
        fetch("/api/profile", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ userId: id, displayName: name, likes: nextLikes }),
        }).catch(() => {});
      }, 600);
    },
    []
  );

  const persist = useCallback(
    (nextLikes: PrintModel[]) => {
      setLikes(nextLikes);
      localStorage.setItem(LIKES_KEY, JSON.stringify(nextLikes));
      sync(nextLikes, displayName, uid);
    },
    [displayName, uid, sync]
  );

  const like = useCallback(
    (model: PrintModel) => {
      setLikes((prev) => {
        if (prev.some((m) => m.id === model.id)) return prev;
        const next = [model, ...prev];
        localStorage.setItem(LIKES_KEY, JSON.stringify(next));
        sync(next, displayName, uid);
        return next;
      });
    },
    [displayName, uid, sync]
  );

  const remove = useCallback(
    (id: string) => {
      setLikes((prev) => {
        const next = prev.filter((m) => m.id !== id);
        localStorage.setItem(LIKES_KEY, JSON.stringify(next));
        sync(next, displayName, uid);
        return next;
      });
    },
    [displayName, uid, sync]
  );

  const rename = useCallback(
    (name: string) => {
      setDisplayName(name);
      localStorage.setItem(NAME_KEY, name);
      sync(likes, name, uid);
    },
    [likes, uid, sync]
  );

  return { uid, displayName, likes, loaded, like, remove, rename, persist };
}
