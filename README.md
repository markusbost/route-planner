# 🗺️ Route Planner

A web-based route-planning game optimised for iPad. Pick a vehicle, tap the stops in the order you want to visit them, then watch how your route compares to the shortest possible path.

## Gameplay

1. **Choose a vehicle** – garbage truck, mail van, police car, or fire engine, each with its own mission and sound effects.
2. **Choose difficulty** – Easy (3 stops), Medium (5 stops), or Hard (8 stops).
3. **Optional: enable obstacles** – 1–3 blocked roads make the map more challenging.
4. **Plan your route** – tap the stops in the order you want to drive them.
5. **See the result** – the vehicle animates along the roads; your route is compared to the optimal one and you earn 1–3 stars plus a score.
6. **Highscores** – best score per vehicle, difficulty, and map is saved locally.

The map is procedurally generated with a deterministic seed – the same seed always produces exactly the same map, enabling replays directly from the highscore list.

---

## Getting started

### Prerequisites

- Node.js 22+
- npm 10+

```bash
npm install
npm run dev        # starts the Vite dev server at http://localhost:5173
```

### Tests

```bash
npm test               # run all unit tests once
npm run test:watch     # run tests in watch mode
```

125 unit tests cover all game logic: RNG, graph algorithms, map generation, route optimisation, scoring, highscores, and vehicle metadata.

### Production build

```bash
npm run build      # compiles to dist/
npm run preview    # local preview of the production build
```

---

## Dev Container

The project includes a complete dev container (`.devcontainer/devcontainer.json`) based on Node 22 Bookworm. Open the folder in VS Code and choose **"Reopen in Container"**. Port 5173 is forwarded automatically and the browser opens.

Pre-installed extensions: ESLint, Prettier, Vitest Explorer, GitHub Actions.

---

## Docker

Multi-stage Dockerfile:

| Stage | Image               | What it does                          |
|-------|---------------------|---------------------------------------|
| build | `node:22-alpine`    | `npm ci && npm run build`             |
| serve | `nginx:1.27-alpine` | Copies `dist/` + `nginx.conf`         |

```bash
docker build -t route-planner .
docker run -p 8080:80 route-planner
# Open http://localhost:8080
```

Nginx is configured with an SPA fallback (`try_files $uri /index.html`), 1-year cache headers on static assets, and gzip compression.

---

## CI/CD – GitHub Actions

Workflow file: `.github/workflows/ci.yml`

```
push / PR → main
  └── install → test (109 tests) → build
        └── (push to main only)
              └── docker build + push → ghcr.io/<org>/route-planner:latest
```

The Docker image is tagged with `latest` and `sha-<commit>`. Authentication uses `GITHUB_TOKEN`.

---

## Architecture

```
src/
├── game/                  # Pure game logic – no React dependencies
│   ├── audio.js           # Web Audio API synthesis (no audio files)
│   ├── graph.js           # Weighted graph, Dijkstra, distance matrix
│   ├── highscore.js       # localStorage-based highscore persistence
│   ├── mapGenerator.js    # Procedural seeded map generation
│   ├── random.js          # Mulberry32 PRNG
│   ├── routing.js         # TSP solver (brute force / nearest-neighbour)
│   ├── scoring.js         # Score and star calculation
│   └── vehicles.js        # Vehicle types with metadata
│
├── components/
│   ├── GameSetup.jsx      # Start screen: vehicle, difficulty, obstacles
│   ├── GameMap.jsx        # Play screen: SVG map with tappable stops
│   ├── RouteResult.jsx    # Result screen: animation, comparison, score
│   └── Highscores.jsx     # Top-10 list per vehicle and difficulty
│
├── App.jsx                # State machine: setup → game → result → highscores
├── main.jsx               # React root
└── index.css              # Responsive global CSS with dark/light theme tokens
│
tests/game/                # Vitest suite for all game-logic modules
```

### Game logic summary

**Map generation** (`mapGenerator.js`)
- Nodes are placed pseudo-randomly using the Mulberry32 PRNG (seed → reproducible map).
- Edges connect each node to its 2 nearest neighbours; an extra bridge is added if the graph is not fully connected.
- Obstacles: 1–3 edges are blocked, always validated to keep the graph connected and the route solvable.

**Route optimisation** (`routing.js`)
- ≤ 8 stops: exact brute-force permutation of all possible orderings.
- > 8 stops: nearest-neighbour heuristic.
- Uses a Dijkstra-based distance matrix via `buildDistanceMatrix`.

**Scoring** (`scoring.js`)
```
score = round((optimalDistance / playerDistance) × 100)   → [1, 100]
```
| Score  | Stars           |
|--------|-----------------|
| 100    | ⭐⭐⭐ Perfect   |
| 90–99  | ⭐⭐⭐           |
| 65–89  | ⭐⭐            |
| 1–64   | ⭐             |

**Animation** (`RouteResult.jsx`)
- The vehicle follows actual road edges via `shortestPath` (Dijkstra) between each stop pair.
- `requestAnimationFrame` with a constant speed (120 px/s).
- The vehicle emoji is rotated and mirrored to face the direction of travel.

**Sound** (`audio.js`)
- Web Audio API, pure synthesis – no external files.
- iPad-compatible: `AudioContext` is initialised lazily and resumed on the next user gesture.

---

## License

[MIT](LICENSE)
