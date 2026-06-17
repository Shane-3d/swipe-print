import { NextRequest, NextResponse } from "next/server";
import { getFeed } from "@/lib/aggregator";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q") || undefined;
  const feed = await getFeed(query);
  return NextResponse.json({ models: feed });
}
