import { promises as fs } from "fs";
import path from "path";
import type { PrintModel } from "@/lib/types";

/**
 * Tiny JSON-file persistence — no database/native deps required. Good enough
 * for a single-instance app; swap for a real DB to scale horizontally.
 */
export type Profile = {
  userId: string;
  displayName: string;
  likes: PrintModel[];
  shareId?: string;
  updatedAt: number;
};

type DB = {
  profiles: Record<string, Profile>;
  shares: Record<string, string>; // shareId -> userId
};

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

async function read(): Promise<DB> {
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    return JSON.parse(raw) as DB;
  } catch {
    return { profiles: {}, shares: {} };
  }
}

async function write(db: DB): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

export async function getProfile(userId: string): Promise<Profile> {
  const db = await read();
  return (
    db.profiles[userId] ?? {
      userId,
      displayName: "Maker",
      likes: [],
      updatedAt: Date.now(),
    }
  );
}

export async function saveProfile(profile: Profile): Promise<Profile> {
  const db = await read();
  profile.updatedAt = Date.now();
  db.profiles[profile.userId] = profile;
  await write(db);
  return profile;
}

function randId(): string {
  return Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 6);
}

/** Create (or reuse) a public share id for a user's profile. */
export async function ensureShare(userId: string): Promise<string> {
  const db = await read();
  const profile = db.profiles[userId];
  if (!profile) throw new Error("no profile");
  if (profile.shareId && db.shares[profile.shareId] === userId) {
    return profile.shareId;
  }
  const shareId = randId();
  profile.shareId = shareId;
  db.shares[shareId] = userId;
  db.profiles[userId] = profile;
  await write(db);
  return shareId;
}

export async function getProfileByShareId(shareId: string): Promise<Profile | null> {
  const db = await read();
  const userId = db.shares[shareId];
  if (!userId) return null;
  return db.profiles[userId] ?? null;
}
