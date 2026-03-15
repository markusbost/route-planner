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
- Every component in `src/components/` must have component tests in `tests/components/<Component>.test.jsx` using React Testing Library + happy-dom.
- `src/App.jsx` must be tested in `tests/components/App.test.jsx` – cover all screen transitions and key user flows.
- `src/i18n.js` must be tested in `tests/game/i18n.test.js` – verify that both languages export identical keys and that all translation functions return non-empty strings.
- Test environment is `node` for game tests and `happy-dom` for component/JSX tests (see `vite.config.js`). Mock `localStorage` with `vi.stubGlobal` when needed.
- Run `npm test` after every change. All tests must stay green.
- `audio.js` is exempt – Web Audio API is not available in Node.

## Theming
- Default theme is **dark**. Light mode is toggled via `data-theme="light"` on `<html>`.
- Light mode palette uses Tailwind Slate scale (slate-50 → slate-900).
- SVG `fill`/`stroke` attributes cannot resolve CSS variables; always use `style={{ fill: 'var(--c-…)' }}`.

## Keeping documentation in sync
When making changes, update the relevant docs in the same commit:
- New or renamed `src/game/` export → update `AGENTS.md` repository map and `README.md` architecture section.
- New vehicle or difficulty → follow the step-by-step recipes in `AGENTS.md`.
- New `--c-*` CSS token → mention it in the Theming section of this file if it carries a usage rule.
- Test count changes → update the stated count in `README.md` and `AGENTS.md`.
- CI/CD changes → update the pipeline description in `README.md`.

## Branching & CI
- `main` → production Docker image tagged `:latest`
- Feature branches (`feature/…`) → PR → `main`.
- Dependabot PRs also target `main`.
- CI pipeline: `test` job (Node 22, npm cache) → `docker` job (BuildKit + GHA layer cache).
