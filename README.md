# ◆ Swipe Print

Tinder, but for 3D printable models. Swipe through prints pulled from across the
web, swipe right to save the ones you like, and share your collection with a
public link.

## Features

- **Swipe deck** — drag a card right to like, left to pass (or use the buttons).
- **Aggregated feed** — pulls models from multiple sources via a pluggable
  provider layer. Ships with a built-in seed feed so it runs with zero config,
  and adds live sources when you provide keys.
- **Saved prints** — liked models are saved to your profile (instant local
  storage + server sync).
- **Shareable profile** — mint a public read-only link to your collection at
  `/u/<id>`.
- **Source-respecting downloads** — each card links to the original model page,
  and to a direct file download where the source's API allows it.

## Run it

```bash
npm install
npm run dev       # http://localhost:3000
```

Production:

```bash
npm run build && npm start
```

## Live sources (optional)

Copy `.env.example` to `.env.local`:

| Variable             | What it enables                                            |
| -------------------- | ---------------------------------------------------------- |
| `THINGIVERSE_TOKEN`  | Live Thingiverse popular/search feed + file downloads.     |
| `PRINTABLES_ENABLED` | Best-effort Printables feed (unofficial public GraphQL).   |

Without these, the app falls back to the built-in seed feed.

## Architecture

```
app/
  page.tsx              Swipe deck screen
  profile/page.tsx      Your saved prints + share button
  u/[id]/page.tsx       Public shared collection
  api/feed              Aggregated model feed
  api/profile           Get/save a user's profile (likes)
  api/share             Mint a public share id
  api/download          Resolve a real file download (server-side auth)
components/             SwipeDeck, PrintGrid, TopBar
lib/
  aggregator.ts         Combines all providers
  providers/            seed | thingiverse | printables
  store.ts              JSON-file persistence (swap for a DB to scale)
  useProfile.ts         Client like/save state + server sync
```

### Adding a source

Add `lib/providers/<name>.ts` exporting `async function get<Name>Feed(): Promise<PrintModel[]>`,
then call it from `lib/aggregator.ts`. Map each result to the `PrintModel` shape
in `lib/types.ts`.

## Notes on files & licensing

Models are surfaced with a link to their original source page and creator
credit. Direct downloads are resolved through the source's own API (e.g.
Thingiverse) rather than rehosting files, so creator licensing and attribution
stay intact. Respect each model's license before printing or redistributing.
