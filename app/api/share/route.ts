import { NextRequest, NextResponse } from "next/server";
import { ensureShare } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }
  try {
    const shareId = await ensureShare(body.userId);
    return NextResponse.json({ shareId });
  } catch {
    return NextResponse.json({ error: "save your profile first" }, { status: 400 });
  }
}
