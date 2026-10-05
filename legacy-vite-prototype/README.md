# Operation Black Relay — preserved Vite prototype

This folder holds the **original Vite + Express prototype** that already existed in
the project root before the Next.js application was built. It was moved here
unchanged so nothing was lost; no source file in this folder was edited.

## What it was

A single-page, read-only story site for Operation Black Relay (NF-219):

| File | Purpose |
| --- | --- |
| `index.html` | Vite entry point |
| `vite.config.js` | Dev server on :5173, proxying `/api` → `localhost:3001` |
| `server/server.js` | Express API serving `/api/story` and `/api/health` |
| `src/App.jsx` | Fetches the story JSON and renders hero, chain, missions, timeline, report |
| `src/main.jsx` | React root |
| `src/styles.css` | Hand-written stylesheet |
| `dist/` | A prior production build of the above |

It presented the case narrative as static content — there were no interactive lab
simulators, no accounts, no XP and no progress tracking.

## Running it

```bash
cd legacy-vite-prototype
npm install
npm run server     # Express API on :3001
npm run dev        # Vite dev server on :5173 (separate terminal)
```

> **Note:** the original `package.json` was replaced during the Next.js setup and
> the old `node_modules` was pruned, so the manifest here was reconstructed from
> the imports in the source. `npm install` restores it. The versions are
> best-effort matches — the original pinned versions are not recoverable.

## Relationship to the Next.js app

The Next.js application in the parent folder supersedes this prototype: it covers
both case files (ECHO-047 and NF-219), and replaces the static story with working
lab simulators, accounts, sequential unlocking and server-validated reporting.

If you would rather keep this Vite version as the primary site, delete the parent
Next.js files and move these back up a level.
