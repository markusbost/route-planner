import { useState, useEffect } from 'react';
import GameSetup from './components/GameSetup.jsx';
import GameMap from './components/GameMap.jsx';
import RouteResult from './components/RouteResult.jsx';
import Highscores from './components/Highscores.jsx';
import { generateMap } from './game/mapGenerator.js';
import { generateSeed } from './game/random.js';

function getInitialTheme() {
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialLang() {
  const stored = localStorage.getItem('lang');
  if (stored === 'sv' || stored === 'en') return stored;
  return 'sv';
}

// Skärmlägen för spelet
const SCREEN = {
  SETUP: 'setup',
  GAME: 'game',
  RESULT: 'result',
  HIGHSCORES: 'highscores',
};

export default function App() {
  const [screen, setScreen] = useState(SCREEN.SETUP);
  const [gameConfig, setGameConfig] = useState(null);
  const [mapData, setMapData] = useState(null);
  const [playerRoute, setPlayerRoute] = useState(null);
  const [theme, setTheme] = useState(getInitialTheme);
  const [lang, setLang] = useState(getInitialLang);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    // Keep the browser chrome (address bar, status bar) in sync with the theme
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#1a1a2e' : '#f8fafc');
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  function toggleLang() {
    setLang((l) => {
      const next = l === 'sv' ? 'en' : 'sv';
      localStorage.setItem('lang', next);
      return next;
    });
  }

  function startGame(config) {
    const seed = generateSeed();
    const map = generateMap({ seed, difficulty: config.difficulty, obstacles: config.obstacles });
    setGameConfig({ ...config, seed });
    setMapData(map);
    setPlayerRoute(null);
    setScreen(SCREEN.GAME);
  }

  function replayGame() {
    // Replay with same seed and settings
    const map = generateMap({
      seed: gameConfig.seed,
      difficulty: gameConfig.difficulty,
      obstacles: gameConfig.obstacles,
    });
    setMapData(map);
    setPlayerRoute(null);
    setScreen(SCREEN.GAME);
  }

  function newGame() {
    setScreen(SCREEN.SETUP);
    setGameConfig(null);
    setMapData(null);
    setPlayerRoute(null);
  }

  function replayFromHighscore(entry) {
    const map = generateMap({
      seed: entry.seed,
      difficulty: entry.difficulty,
      obstacles: entry.obstacles,
    });
    setGameConfig({
      vehicleId: entry.vehicleId,
      difficulty: entry.difficulty,
      obstacles: entry.obstacles,
      seed: entry.seed,
    });
    setMapData(map);
    setPlayerRoute(null);
    setScreen(SCREEN.GAME);
  }

  function finishRoute(route) {
    setPlayerRoute(route);
    setScreen(SCREEN.RESULT);
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {screen === SCREEN.SETUP && (
        <GameSetup
          onStart={startGame}
          onHighscores={() => setScreen(SCREEN.HIGHSCORES)}
          theme={theme}
          onToggleTheme={toggleTheme}
          lang={lang}
          onToggleLang={toggleLang}
        />
      )}
      {screen === SCREEN.GAME && mapData && gameConfig && (
        <GameMap
          mapData={mapData}
          vehicleId={gameConfig.vehicleId}
          onFinish={finishRoute}
          onBack={newGame}
          lang={lang}
        />
      )}
      {screen === SCREEN.RESULT && mapData && gameConfig && playerRoute && (
        <RouteResult
          mapData={mapData}
          playerRoute={playerRoute}
          gameConfig={gameConfig}
          onReplay={replayGame}
          onNewGame={newGame}
          lang={lang}
        />
      )}
      {screen === SCREEN.HIGHSCORES && (
        <Highscores onBack={() => setScreen(SCREEN.SETUP)} onReplay={replayFromHighscore} lang={lang} />
      )}
    </div>
  );
}
