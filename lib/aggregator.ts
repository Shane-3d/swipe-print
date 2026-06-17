import type { PrintModel } from "@/lib/types";
import { getSeedFeed } from "@/lib/providers/seed";
import { getThingiverseFeed } from "@/lib/providers/thingiverse";
import { getPrintablesFeed } from "@/lib/providers/printables";

/** Interleave arrays round-robin so the feed mixes sources fairly. */
function interleave(lists: PrintModel[][]): PrintModel[] {
  const out: PrintModel[] = [];
  const max = Math.max(0, ...lists.map((l) => l.length));
  for (let i = 0; i < max; i++) {
    for (const list of lists) {
      if (list[i]) out.push(list[i]);
    }
  }
  return out;
}

function dedupe(models: PrintModel[]): PrintModel[] {
  const seen = new Set<string>();
  return models.filter((m) => (seen.has(m.id) ? false : (seen.add(m.id), true)));
}

/**
 * Aggregate "all available sources". Live providers run in parallel and any
 * that are unconfigured or failing simply contribute nothing; the seed feed is
 * always appended so the deck is never empty.
 */
export async function getFeed(query?: string): Promise<PrintModel[]> {
  const [thingiverse, printables] = await Promise.all([
    getThingiverseFeed(query).catch(() => []),
    getPrintablesFeed().catch(() => []),
  ]);

  const live = interleave([thingiverse, printables]);
  const combined = dedupe([...live, ...getSeedFeed()]);
  return combined;
}
