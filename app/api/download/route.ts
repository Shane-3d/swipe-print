import { NextRequest, NextResponse } from "next/server";
import { resolveThingiverseFile } from "@/lib/providers/thingiverse";

export const dynamic = "force-dynamic";

/**
 * Resolves a model's real file download and redirects to it. Keeps source
 * credentials (e.g. the Thingiverse token) on the server. For sources that
 * require user login on their own site, this falls back to an error and the UI
 * links to the source page instead.
 */
export async function GET(req: NextRequest) {
  const source = req.nextUrl.searchParams.get("source");
  const id = req.nextUrl.searchParams.get("id");
  if (!source || !id) {
    return NextResponse.json({ error: "source and id required" }, { status: 400 });
  }

  if (source === "thingiverse") {
    const url = await resolveThingiverseFile(id);
    if (url) return NextResponse.redirect(url);
    return NextResponse.json(
      { error: "Could not resolve file. Set THINGIVERSE_TOKEN or open the source page." },
      { status: 404 }
    );
  }

  return NextResponse.json({ error: `Unsupported source: ${source}` }, { status: 400 });
}
