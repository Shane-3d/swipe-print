import type { PrintModel } from "@/lib/types";

/**
 * Printables provider (best-effort, unofficial public GraphQL endpoint).
 * No API key required, but the endpoint is not officially documented and may
 * change, so every failure is swallowed and the aggregator falls back to seed.
 * Set PRINTABLES_ENABLED=1 to opt in (off by default to avoid surprise traffic).
 */
const GQL = "https://api.printables.com/graphql/";

const QUERY = `
query Feed($limit: Int!) {
  morePrints(limit: $limit, ordering: "-popularity", printType: "print") {
    items {
      id
      name
      slug
      image { filePath }
      user { publicUsername }
    }
  }
}`;

export async function getPrintablesFeed(): Promise<PrintModel[]> {
  if (process.env.PRINTABLES_ENABLED !== "1") return [];
  try {
    const res = await fetch(GQL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: QUERY, variables: { limit: 30 } }),
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const items: any[] = json?.data?.morePrints?.items ?? [];
    return items
      .filter((p) => p && p.id)
      .map((p) => {
        const img = p.image?.filePath
          ? `https://media.printables.com/${p.image.filePath}`
          : "";
        return {
          id: `printables:${p.id}`,
          source: "printables" as const,
          title: p.name ?? "Untitled",
          creator: p.user?.publicUsername ?? "Unknown",
          thumbnail: img,
          sourceUrl: `https://www.printables.com/model/${p.id}-${p.slug ?? ""}`,
          downloadUrl: undefined, // Printables downloads require login on the source site.
          license: "See source",
          tags: [],
        } as PrintModel;
      })
      .filter((m) => m.thumbnail);
  } catch {
    return [];
  }
}
