# AGENTS.md – Route Planner

Instructions for AI coding agents (OpenAI Codex, Copilot Workspace, etc.) working autonomously on this repository.

## Setup

```bash
npm install        # install all dependencies
npm run dev        # dev server on http://localhost:5173 (LAN-visible via --host)
npm run build      # production build to dist/
```

## Verification – run after every change

```bash
npm test           # 192 unit tests must all pass
npm run build      # build must succeed with no errors
```

Never submit a change that breaks either command.

## Repository map

```
src/game/          Pure game logic – no React. One test file per module.
  audio.js         Web Audio API synthesis. Not unit-tested (Node has no AudioContext).
  graph.js         Weighted graph, Dijkstra, buildDistanceMatrix.
  highscore.js     localStorage persistence. Mock with vi.stubGlobal in tests.
  mapGenerator.js  Seeded procedural map: placeNodes → buildEdges → selectBlockedEdges.
  random.js        Mulberry32 PRNG: createRng(seed), randomInt(), shuffle().
  routing.js       TSP: brute-force ≤8 stops, nearest-neighbour >8 stops.
  scoring.js       calculateScore(), scoreToStars().
  vehicles.js      VEHICLES object + getVehicleIds() + getVehicle(id).

src/components/    React UI. Inline JS-object styles only. No Tailwind.
  GameSetup.jsx    Vehicle selector, difficulty, obstacle toggle, theme toggle.
  GameMap.jsx      SVG map, tappable stop nodes, animated route.
  RouteResult.jsx  Vehicle animation (requestAnimationFrame), score display.
  Highscores.jsx   Top-10 list per vehicle + difficulty.

src/App.jsx        State machine: setup | game | result | highscores.
src/index.css      CSS custom property tokens (--c-*). Dark default, light via data-theme="light".

tests/game/        Vitest unit tests. Environment: node. One file per src/game/ module.
```

## Key constraints

1. **No new runtime dependencies** without a strong reason. All algorithms are intentional hand-rolls.
2. **Colour tokens only** – never write hex values in component files. Use `var(--c-*)` tokens. For SVG elements use `style={{ stroke: 'var(--c-road)' }}` (not `stroke="..."` attributes).
3. **iOS Audio** – always call `await resume()` (re-exports `ctx.resume()`) before any tone in `audio.js`.
4. **Determinism** – `generateMap` must be deterministic for a given `{ seed, difficulty, obstacles }`. Do not introduce `Math.random()` anywhere in `src/game/`.
5. **localStorage** is the only persistence layer. No backend, no network calls from the game itself.

## Keeping documentation in sync

Update docs **in the same commit** as the code change:

| What changed | What to update |
|---|---|
| New/renamed export in `src/game/` | Repository map in this file + architecture section in `README.md` |
| Test count changed | `README.md` ("192 unit tests") + verification section in this file ("192 unit tests must all pass") |
| New vehicle | `VEHICLES` in `vehicles.js`, optionally `audio.js`, then run `npm test` |
| New difficulty level | `DIFFICULTY_CONFIG` in `mapGenerator.js`, `GameSetup.jsx`, `mapGenerator.test.js` |
| New `--c-*` token | Note any usage rule in `.github/copilot-instructions.md` Theming section |
| CI/CD change | Update pipeline description in `README.md` |

## Branching convention

| Branch | Purpose | Docker tag |
|--------|---------|------------|
| `main` | Production | `:latest` |
| `feature/*` | Active development | – |

All PRs (including Dependabot) target `main`.

## Adding a new vehicle

1. Add an entry to `VEHICLES` in `src/game/vehicles.js` with all required fields: `id, name, emoji, stopEmoji, completedEmoji, color, depotEmoji, mission, action`.
2. Add sound variants to `playRouteComplete()` in `src/game/audio.js` if desired.
3. Run `npm test` – the `vehicles.test.js` suite will automatically validate the new entry.

### Emoji rules (enforced by tests)

All four emoji fields must obey these constraints – the test suite checks them automatically:

| Rule | Fields involved |
|------|----------------|
| All four emojis must be unique | `emoji`, `stopEmoji`, `completedEmoji`, `depotEmoji` |
| Depot must differ from stop | `depotEmoji` ≠ `stopEmoji` |
| Completed must differ from stop | `completedEmoji` ≠ `stopEmoji` (so players can see which stops are done) |

Additional conventions (not enforced by tests but should be followed):
- `emoji` is the moving vehicle itself (shown on the card and during animation).
- `stopEmoji` is shown at unvisited stops on the map.
- `completedEmoji` replaces the stop marker once visited.
- `depotEmoji` marks the start/end depot.
- Prefer emojis that face **left or are symmetric** – emojis that naturally point upward (e.g. 🚀) break the animation rotation logic and should be avoided.

## Adding a new difficulty level

1. Update the node-count map in `mapGenerator.js` (`DIFFICULTY_CONFIG`).
2. Add the new level to the `difficultyLevels` array in `GameSetup.jsx`.
3. Update `mapGenerator.test.js` to cover the new difficulty.
