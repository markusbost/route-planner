import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveScore, getScore, getTopScores, clearAllScores } from '../../src/game/highscore.js';

// ---------------------------------------------------------------------------
// localStorage mock (node environment has no DOM)
// ---------------------------------------------------------------------------
const store = {};
const localStorageMock = {
  getItem: (k) => store[k] ?? null,
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
  clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
};
vi.stubGlobal('localStorage', localStorageMock);

// Helper – a valid key descriptor
const KEY = { vehicleId: 'garbage', difficulty: 1, obstacles: false, seed: 42 };

beforeEach(() => {
  clearAllScores();
});

// ---------------------------------------------------------------------------

describe('getScore', () => {
  it('returns null when no score exists', () => {
    expect(getScore(KEY)).toBeNull();
  });

  it('returns the saved score after saving', () => {
    saveScore(KEY, 75);
    expect(getScore(KEY)).toBe(75);
  });

  it('returns null for a different key than what was saved', () => {
    saveScore(KEY, 75);
    expect(getScore({ ...KEY, seed: 99 })).toBeNull();
  });
});

describe('saveScore', () => {
  it('saves a new score', () => {
    saveScore(KEY, 60);
    expect(getScore(KEY)).toBe(60);
  });

  it('overwrites a lower score with a higher one', () => {
    saveScore(KEY, 60);
    saveScore(KEY, 80);
    expect(getScore(KEY)).toBe(80);
  });

  it('does NOT overwrite a higher score with a lower one', () => {
    saveScore(KEY, 80);
    saveScore(KEY, 60);
    expect(getScore(KEY)).toBe(80);
  });

  it('does NOT overwrite with an equal score', () => {
    saveScore(KEY, 70);
    const before = JSON.parse(localStorageMock.getItem('route-planner-scores'));
    saveScore(KEY, 70);
    const after = JSON.parse(localStorageMock.getItem('route-planner-scores'));
    // date should not have changed (entry not re-written)
    expect(before[Object.keys(before)[0]].date).toBe(after[Object.keys(after)[0]].date);
  });

  it('keys are keyed on vehicleId, difficulty, obstacles and seed together', () => {
    saveScore(KEY, 50);
    saveScore({ ...KEY, seed: 100 }, 90);
    expect(getScore(KEY)).toBe(50);
    expect(getScore({ ...KEY, seed: 100 })).toBe(90);
  });

  it('distinguishes obstacles=true from obstacles=false', () => {
    saveScore(KEY, 50);
    saveScore({ ...KEY, obstacles: true }, 80);
    expect(getScore(KEY)).toBe(50);
    expect(getScore({ ...KEY, obstacles: true })).toBe(80);
  });
});

describe('getTopScores', () => {
  it('returns empty array when nothing saved', () => {
    expect(getTopScores('garbage', 1)).toEqual([]);
  });

  it('returns scores for matching vehicleId and difficulty only', () => {
    saveScore({ vehicleId: 'garbage', difficulty: 1, obstacles: false, seed: 1 }, 70);
    saveScore({ vehicleId: 'mail', difficulty: 1, obstacles: false, seed: 2 }, 95);
    saveScore({ vehicleId: 'garbage', difficulty: 2, obstacles: false, seed: 3 }, 85);

    const result = getTopScores('garbage', 1);
    expect(result).toHaveLength(1);
    expect(result[0].score).toBe(70);
    expect(result[0].vehicleId).toBe('garbage');
  });

  it('returns results sorted descending by score', () => {
    for (let seed = 1; seed <= 5; seed++) {
      saveScore({ vehicleId: 'garbage', difficulty: 1, obstacles: false, seed }, seed * 10);
    }
    const scores = getTopScores('garbage', 1).map((e) => e.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });

  it('returns at most n entries (default 10)', () => {
    for (let seed = 1; seed <= 15; seed++) {
      saveScore({ vehicleId: 'garbage', difficulty: 1, obstacles: false, seed }, seed);
    }
    expect(getTopScores('garbage', 1)).toHaveLength(10);
  });

  it('respects custom n parameter', () => {
    for (let seed = 1; seed <= 5; seed++) {
      saveScore({ vehicleId: 'garbage', difficulty: 1, obstacles: false, seed }, seed * 10);
    }
    expect(getTopScores('garbage', 1, 3)).toHaveLength(3);
  });
});

describe('clearAllScores', () => {
  it('removes all saved scores', () => {
    saveScore(KEY, 77);
    clearAllScores();
    expect(getScore(KEY)).toBeNull();
    expect(getTopScores('garbage', 1)).toEqual([]);
  });
});
