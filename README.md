# FounderTube

A distraction-free YouTube interface for finding and watching long-form founder interviews. FounderTube removes Shorts and algorithm-heavy chrome, adds founder-specific search suggestions, date and duration filters, and lightweight local playlists.

![FounderTube home screen](demo/foundertube-home.png)

The short site-ready preview is in [`demo/foundertube-demo.mp4`](demo/foundertube-demo.mp4).

## Features

- Rotating search ideas built around founders and companies
- Long-form YouTube search with date and duration filters
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
