const STORAGE_KEY = 'route-planner-scores';

/**
 * Bygg en nyckel för en specifik karta/inställningskombination.
 */
function makeKey({ vehicleId, difficulty, obstacles, seed }) {
  return `${vehicleId}-${difficulty}-${obstacles ? 1 : 0}-${seed}`;
}

/**
 * Hämta alla sparade poäng som ett objekt.
 * @returns {Object}
 */
function readAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

/**
 * Spara en poäng. Sparas bara om den är högre än befintlig poäng för samma nyckel.
 * @param {{ vehicleId: string, difficulty: number, obstacles: boolean, seed: number }} key
 * @param {number} score
 */
export function saveScore(key, score) {
  const existing = getScore(key);
  if (existing !== null && existing >= score) return;
  const all = readAll();
  all[makeKey(key)] = {
    score,
    ...key,
    date: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

/**
 * Hämta bästa poäng för en specifik karta. Returnerar null om ingen finns.
 * @param {{ vehicleId: string, difficulty: number, obstacles: boolean, seed: number }} key
 * @returns {number|null}
 */
export function getScore(key) {
  const all = readAll();
  return all[makeKey(key)]?.score ?? null;
}

/**
 * Hämta topplista för ett fordon och svårighetsgrad.
 * @param {string} vehicleId
 * @param {number} difficulty
 * @param {number} [n=10] - antal poster
 * @returns {Array<{ score, seed, date, obstacles }>}
 */
export function getTopScores(vehicleId, difficulty, n = 10) {
  const all = readAll();
  return Object.values(all)
    .filter((e) => e.vehicleId === vehicleId && e.difficulty === difficulty)
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}

/**
 * Rensa alla sparade poäng (används för testning).
 */
export function clearAllScores() {
  localStorage.removeItem(STORAGE_KEY);
}
