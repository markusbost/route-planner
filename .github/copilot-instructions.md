# GitHub Copilot instructions

## Project overview
Route Planner is a React 18 + Vite 5 single-page game optimised for iPad. Players pick a vehicle and tap stops on a procedurally generated SVG map; their route is scored against the optimal TSP solution.

## Architecture
- `src/game/` – pure ES-module game logic, **no React imports**. All algorithmic work lives here.
- `src/components/` – four React components that consume the game modules.
- `src/App.jsx` – state machine cycling through `setup → game → result → highscores`.
- `tests/game/` – Vitest unit tests for every module in `src/game/`.

## Coding conventions
- **ES modules** (`import`/`export`), no CommonJS.
- **No external runtime dependencies** beyond React. Algorithms are hand-rolled (Dijkstra, Mulberry32 PRNG, TSP brute-force).
- Inline styles via JS objects in components (no CSS-in-JS library, no Tailwind).
- CSS custom properties (`var(--c-*)`) defined in `src/index.css` for all colours – never hardcode hex values in components.
- `--c-btn-neutral-text` must be used for text on `--c-btn-neutral` backgrounds (light mode contrast).
- Sound: Web Audio API synthesis only (`src/game/audio.js`). No audio files. Always call `await resume()` before playing to keep iOS happy.

## Testing rules
- Every function exported from `src/game/` must have unit tests in `tests/game/<module>.test.js`.
- Test environment is `node` (see `vite.config.js`). Mock `localStorage` with `vi.stubGlobal` when needed.
- Run `npm test` after every change. All 109 tests must stay green.
- `audio.js` is exempt – Web Audio API is not available in Node.

## Theming
- Default theme is **dark**. Light mode is toggled via `data-theme="light"` on `<html>`.
- Light mode palette uses Tailwind Slate scale (slate-50 → slate-900).
- SVG `fill`/`stroke` attributes cannot resolve CSS variables; always use `style={{ fill: 'var(--c-…)' }}`.

## Branching & CI
- `main` → production Docker image tagged `:latest`
- `dev` → staging Docker image tagged `:dev`
- PRs go to `dev`; Dependabot PRs also target `dev`.
- CI pipeline: `test` job (Node 22, npm cache) → `docker` job (BuildKit + GHA layer cache).
