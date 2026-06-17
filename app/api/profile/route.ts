import { NextRequest, NextResponse } from "next/server";
import { getProfile, saveProfile, type Profile } from "@/lib/store";
import type { PrintModel } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
  const profile = await getProfile(userId);
  return NextResponse.json({ profile });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }
  const incoming = await getProfile(body.userId);
  const next: Profile = {
    ...incoming,
    userId: body.userId,
    displayName: typeof body.displayName === "string" ? body.displayName : incoming.displayName,
    likes: Array.isArray(body.likes) ? (body.likes as PrintModel[]) : incoming.likes,
  };
  const saved = await saveProfile(next);
  return NextResponse.json({ profile: saved });
}
