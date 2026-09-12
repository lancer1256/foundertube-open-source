# FounderTube

A distraction-free way to surface high-signal videos about building businesses. Many of the best founder interviews are older uploads that YouTube's recommendation feed rarely resurfaces, so FounderTube starts from pre-generated founder and company queries, then adds date and duration filters to find the useful material directly. It keeps the viewing experience focused, without Shorts, homepage recommendations, or other algorithmic distractions.

![FounderTube home screen](demo/foundertube-home.png)

## Features

- Pre-generated searches built around founders, companies, and business topics
- Long-form YouTube search with date and duration filters
- Discovery of older, high-signal interviews that are otherwise difficult to surface
- Focused embedded player
- Browser-local playlists with no account or database required
- Responsive React and Tailwind interface
- Installable PWA

## Run locally

Requirements: Node.js 20+ and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Add your own `VITE_SCRAPINGDOG_API_KEY` for live search. `VITE_YOUTUBE_API_KEY` is optional and adds video/channel metadata to the watch page. The landing page and navigation work without keys.

Because Vite exposes `VITE_` variables to the browser, use a server-side proxy for paid production credentials. If you use a browser-visible YouTube key, restrict it by domain and API in Google Cloud.

## Commands

```bash
npm run build
npm run lint
npm run preview
```

## Project structure

- `src/components/HomePage.tsx` — founder discovery and suggestions
- `src/components/SearchPage.tsx` — filtered search results
- `src/components/VideoPlayer.tsx` — focused playback and metadata
- `src/components/PlaylistsPage.tsx` — local playlist management
- `src/lib/blobPlaylists.ts` — browser-local persistence retained behind the original interface

## License

MIT. YouTube and third-party content remain subject to their respective terms.
