# 🗺️ Ruttplaneraren

Webbaserat ruttplaneringsspel för iPad. Välj ett fordon, klicka ut i vilken ordning stopparna ska besökas och se sedan hur din rutt jämförs med den kortaste möjliga vägen.

## Spelet

1. **Välj fordon** – sopbil, postbil, polisbil eller brandbil, var och en med eget uppdrag och ljud.
2. **Välj svårighetsgrad** – Lätt (3 stopp), Medel (5 stopp) eller Svår (8 stopp).
3. **Valfritt: slå på hinder** – 1–3 blockerade vägar gör kartan mer utmanande.
4. **Planera rutten** – tryck på stopparna i den ordning du vill köra dem.
5. **Se resultatet** – fordonet animeras längs vägarna; din rutt jämförs med den optimala och du får 1–3 stjärnor plus poäng.
6. **Highscore** – bästa poäng per fordon, svårighetsgrad och karta sparas lokalt.

Kartan är procedurmässigt genererad med ett deterministiskt seed – samma seed ger alltid exakt samma karta, vilket möjliggör omspel direkt från highscore-listan.

---

## Kom igång lokalt

### Förutsättningar

- Node.js 22 +
- npm 10 +

```bash
npm install
npm run dev        # startar Vite dev-server på http://localhost:5173
```

### Tester

```bash
npm test           # kör alla enhetstester en gång
npm run test:watch # kör tester i watch-läge
```

69 enhetstester täcker all spellogik: slumpgenerator, graf, kartgenerering, ruttoptimering och poängsättning.

### Produktion-build

```bash
npm run build      # kompilerar till dist/
npm run preview    # preview av produktionsbygget lokalt
```

---

## Dev Container

Projektet innehåller en komplett dev container (`.devcontainer/devcontainer.json`) baserad på Node 22 Bookworm. Öppna mappen i VS Code och välj **"Reopen in Container"**. Port 5173 vidarebefordras automatiskt och webbläsaren öppnas.

Förinstallerade extensions: ESLint, Prettier, Vitest Explorer, GitHub Actions.

---

## Docker

Multi-stage Dockerfile:

| Stage | Image                 | Vad händer                            |
|-------|-----------------------|---------------------------------------|
| build | `node:22-alpine`      | `npm ci && npm run build`             |
| serve | `nginx:1.27-alpine`   | Kopierar `dist/` + `nginx.conf`       |

```bash
docker build -t route-planner .
docker run -p 8080:80 route-planner
# Öppna http://localhost:8080
```

Nginx är konfigurerad med SPA-fallback (`try_files $uri /index.html`), 1 år cache på statiska tillgångar och gzip-komprimering.

---

## CI/CD – GitHub Actions

Workflow-filen: `.github/workflows/ci.yml`

```
push / PR → main
  └── install → test (69 tester) → build
        └── (bara vid push till main)
              └── docker build + push → ghcr.io/<org>/route-planner:latest
```

Docker-imagen taggas med `latest` och `sha-<commit>`. Autentisering sker via `GITHUB_TOKEN`.

---

## Arkitektur

```
src/
├── game/                  # Ren spellogik, inga React-beroenden
│   ├── audio.js           # Web Audio API-syntes (inga ljudfiler)
│   ├── graph.js           # Viktad graf, Dijkstra, distansmatris
│   ├── highscore.js       # localStorage-baserat highscore
│   ├── mapGenerator.js    # Procedurmässig kartgenerering med seed
│   ├── random.js          # Mulberry32 PRNG
│   ├── routing.js         # TSP-optimering (brute force / nearest-neighbor)
│   ├── scoring.js         # Poäng- och stjärnberäkning
│   └── vehicles.js        # Fordonstyper med metadata
│
├── components/
│   ├── GameSetup.jsx      # Startskärm: fordonsval, svårighetsgrad, hinder
│   ├── GameMap.jsx        # Spelskärm: SVG-karta med klickbara stopp
│   ├── RouteResult.jsx    # Resultatskärm: animation, jämförelse, poäng
│   └── Highscores.jsx     # Topplista per fordon och svårighetsgrad
│
├── App.jsx                # Tillståndsmaskin: setup → game → result → highscores
├── main.jsx               # React-rot
└── index.css              # iPad-optimerad global CSS
│
tests/game/                # Vitest-svit för alla spellogik-moduler
```

### Spellogik i korthet

**Kartgenerering** (`mapGenerator.js`)
- Noder placeras slumpmässigt med Mulberry32 PRNG (seed ↔ reproducerbar karta).
- Kanter kopplar varje nod till sina 2 närmaste grannar; en extra brygga läggs till om grafen inte är sammanhängande.
- Hinder: 1–3 kanter blockeras, men alltid med validering att grafen förblir sammanhängande och rutten möjlig.

**Ruttoptimering** (`routing.js`)
- ≤ 8 stopp: exakt brute-force-permutation av alla möjliga ordningar.
- > 8 stopp: nearest-neighbor-heuristik.
- Använder Dijkstra-baserad distansmatris via `buildDistanceMatrix`.

**Poängsättning** (`scoring.js`)
```
score = round((optimalDistance / playerDistance) × 100)   → [1, 100]
```
| Poäng | Stjärnor |
|-------|----------|
| 100   | ⭐⭐⭐ Perfekt |
| 90–99 | ⭐⭐⭐       |
| 65–89 | ⭐⭐        |
| 1–64  | ⭐         |

**Animation** (`RouteResult.jsx`)
- Fordonet följer faktiska vägkanter via `shortestPath` (Dijkstra) mellan varje stop-par.
- `requestAnimationFrame` med konstant hastighet (120 px/s).
- Fordonets emoji roteras och speglas för att peka i färdriktningen.

**Ljud** (`audio.js`)
- Web Audio API, ren syntes – inga externa filer.
- iPad-kompatibelt: `AudioContext` initieras lat och återupptas vid nästa användargest.

---

## Licens

Privat projekt.
