# Route Planner Game – Plan

Webbaserat ruttplaneringsspel för iPad, byggt med React + Vite. Ett barn väljer fordon och pekar ut i vilken ordning stopp ska besökas. Spelet jämför barnets rutt mot den optimala.

## Teknisk stack
- **React + Vite** – UI och byggverktyg
- **Vitest** – enhetstester
- **Docker + Nginx** – serving av statiska filer
- **GitHub Actions** – CI: test → build → push Docker-image till ghcr.io

## Status

### ✅ Klart
- Dev container (`.devcontainer/devcontainer.json`)
- Projektstruktur (Vite + React + package.json)
- `src/game/random.js` – Mulberry32 PRNG, `createRng(seed)`, `generateSeed()`, `randomInt()`, `shuffle()`
- `src/game/graph.js` – `buildGraph()`, `dijkstra()`, `shortestPath()`, `isConnected()`, `buildDistanceMatrix()`
- `src/game/mapGenerator.js` – `generateMap({ seed, difficulty, obstacles })`, returnerar `{ nodes, edges, blockedEdges, stops, depot, seed }`
- `src/game/routing.js` – `optimalRoute()`, `routeDistance()`, `isRoutePossible()`, brute force ≤8 stopp + nearest-neighbor för fler
- `src/game/scoring.js` – `calculateScore()`, `scoreToStars()`
- `src/game/vehicles.js` – sopbil, postbil, polisbil, brandbil
- `src/game/highscore.js` – `saveScore()`, `getScore()`, `getTopScores()`, `clearAllScores()` via localStorage

### ✅ Klart – React-komponenter
- `src/components/GameSetup.jsx` – fordonsval, difficulty 1–3, hindertoggle
- `src/components/GameMap.jsx` – SVG-karta, klickbara noder, numrerade stopp, blockerade kanter med hinderikon
- `src/components/RouteResult.jsx` – animerar fordon, visar spelarens vs optimal distans, poäng, stjärnbetyg, "Försök igen" / "Ny karta"
- `src/components/Highscores.jsx` – topplista per fordon + difficulty med medaljer
- `src/App.jsx` – spelflöde: `setup → game → result → highscores`
- `src/index.css` – iPad-optimerad styling, touch-vänlig, liggande läge

### ✅ Klart – Enhetstester (69/69 gröna)
- `tests/game/random.test.js` – 13 tester
- `tests/game/graph.test.js` – 14 tester
- `tests/game/mapGenerator.test.js` – 15 tester
- `tests/game/routing.test.js` – 13 tester
- `tests/game/scoring.test.js` – 14 tester

### ✅ Klart – CI/CD
- `Dockerfile` – multi-stage: Node 22 build → Nginx 1.27 serve
- `nginx.conf` – SPA fallback, asset caching, gzip
- `.dockerignore`
- `.github/workflows/ci.yml` – install → test → build → Docker push till ghcr.io (vid push till main)

## Spellogik – nyckeldetaljer

### Kartgenerering
- Difficulty 1: 6 noder, 3 aktiva stopp
- Difficulty 2: 9 noder, 5 aktiva stopp
- Difficulty 3: 13 noder, 8 aktiva stopp
- Hinder: 1–3 blockerade kanter, valideras alltid så kartan förblir lösbar
- Hindertyper (kosmetiska): `broken_bus`, `rockslide`, `fallen_tree`

### Ruttoptimering
- Brute force permutation för ≤8 stopp (exakt optimal)
- Nearest-neighbor-heuristik för fler stopp
- Använder Dijkstra-baserad distansmatris (hanterar att alla kopplingar inte är direkta)

### Poängsättning
- `score = round((optimalDistance / playerDistance) × 100)`
- ⭐⭐⭐ = 90–100, ⭐⭐ = 65–89, ⭐ = 1–64

### Highscore
- Nyckel: `{ vehicleId, difficulty, obstacles, seed }`
- Seed sparas → samma karta kan spelas om från highscore-listan
