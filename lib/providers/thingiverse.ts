import type { PrintModel } from "@/lib/types";

/**
 * Thingiverse provider. Requires a free API token in THINGIVERSE_TOKEN.
 * Get one at https://www.thingiverse.com/developers/apps
 * Without a token this returns [] and the aggregator falls back to seed data.
 */
export async function getThingiverseFeed(query?: string): Promise<PrintModel[]> {
  const token = process.env.THINGIVERSE_TOKEN;
  if (!token) return [];

  const endpoint = query
    ? `https://api.thingiverse.com/search/${encodeURIComponent(query)}?type=things&per_page=30`
    : `https://api.thingiverse.com/popular?per_page=30`;

  try {
    const res = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
      // Cache live feed for a minute to stay friendly to the API.
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const hits: any[] = Array.isArray(data) ? data : data.hits ?? [];
    return hits
      .filter((t) => t && t.id)
      .map((t) => ({
        id: `thingiverse:${t.id}`,
        source: "thingiverse" as const,
        title: t.name ?? "Untitled",
        creator: t.creator?.name ?? "Unknown",
        thumbnail: t.thumbnail ?? t.preview_image ?? "",
        sourceUrl: t.public_url ?? `https://www.thingiverse.com/thing:${t.id}`,
        // File download requires an authed follow-up call; we route it through
        // /api/download which uses the server-side token.
        downloadUrl: `/api/download?source=thingiverse&id=${t.id}`,
        license: t.license,
        tags: [],
      }))
      .filter((m: PrintModel) => m.thumbnail);
  } catch {
    return [];
  }
}

/** Resolve the actual STL/file download URL for a Thingiverse thing. */
export async function resolveThingiverseFile(id: string): Promise<string | null> {
  const token = process.env.THINGIVERSE_TOKEN;
  if (!token) return null;
  try {
    const res = await fetch(`https://api.thingiverse.com/things/${id}/files`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const files: any[] = await res.json();
    const file = files?.[0];
    return file?.public_url ?? file?.download_url ?? null;
  } catch {
    return null;
  }
}
