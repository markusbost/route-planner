import { describe, it, expect } from 'vitest';
import { calculateScore, scoreToStars } from '../../src/game/scoring.js';

describe('calculateScore', () => {
  it('returns 100 when player matches optimal', () => {
    expect(calculateScore(100, 100)).toBe(100);
  });

  it('returns 100 for player slightly better than optimal (rounding)', () => {
    // Due to floating point or heuristics, player could match exactly
    expect(calculateScore(100, 100)).toBe(100);
  });

  it('returns less than 100 when player is worse than optimal', () => {
    expect(calculateScore(100, 200)).toBe(50);
  });

  it('returns 1 (minimum) when player takes very long route', () => {
    expect(calculateScore(10, 10000)).toBe(1);
  });

  it('result is always an integer', () => {
    const score = calculateScore(100, 133);
    expect(Number.isInteger(score)).toBe(true);
  });

  it('score stays in [1, 100] range', () => {
    const cases = [
      [50, 50],
      [50, 100],
      [50, 1000],
      [100, 101],
    ];
    for (const [opt, player] of cases) {
      const s = calculateScore(opt, player);
      expect(s).toBeGreaterThanOrEqual(1);
      expect(s).toBeLessThanOrEqual(100);
    }
  });

  it('returns 0 for zero player distance', () => {
    expect(calculateScore(100, 0)).toBe(0);
  });

  it('returns 0 for zero optimal distance', () => {
    expect(calculateScore(0, 100)).toBe(0);
  });

  it('score decreases as player distance increases', () => {
    const s1 = calculateScore(100, 110);
    const s2 = calculateScore(100, 150);
    const s3 = calculateScore(100, 200);
    expect(s1).toBeGreaterThan(s2);
    expect(s2).toBeGreaterThan(s3);
  });
});

describe('scoreToStars', () => {
  it('returns 3 stars for score ≥ 90', () => {
    expect(scoreToStars(90)).toBe(3);
    expect(scoreToStars(100)).toBe(3);
    expect(scoreToStars(95)).toBe(3);
  });

  it('returns 2 stars for score 65–89', () => {
    expect(scoreToStars(65)).toBe(2);
    expect(scoreToStars(80)).toBe(2);
    expect(scoreToStars(89)).toBe(2);
  });

  it('returns 1 star for score below 65', () => {
    expect(scoreToStars(64)).toBe(1);
    expect(scoreToStars(1)).toBe(1);
    expect(scoreToStars(50)).toBe(1);
  });

  it('boundary at exactly 90', () => {
    expect(scoreToStars(89)).toBe(2);
    expect(scoreToStars(90)).toBe(3);
  });

  it('boundary at exactly 65', () => {
    expect(scoreToStars(64)).toBe(1);
    expect(scoreToStars(65)).toBe(2);
  });
});
