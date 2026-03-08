import { describe, it, expect } from 'vitest';
import { createRng, generateSeed, randomInt, shuffle } from '../../src/game/random.js';

describe('createRng', () => {
  it('same seed always produces the same sequence', () => {
    const rng1 = createRng(42);
    const rng2 = createRng(42);
    for (let i = 0; i < 20; i++) {
      expect(rng1()).toBe(rng2());
    }
  });

  it('different seeds produce different sequences', () => {
    const rng1 = createRng(1);
    const rng2 = createRng(2);
    const seq1 = Array.from({ length: 10 }, () => rng1());
    const seq2 = Array.from({ length: 10 }, () => rng2());
    expect(seq1).not.toEqual(seq2);
  });

  it('returns values in [0, 1)', () => {
    const rng = createRng(999);
    for (let i = 0; i < 100; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('seed 0 does not crash', () => {
    const rng = createRng(0);
    expect(() => rng()).not.toThrow();
  });
});

describe('generateSeed', () => {
  it('returns a positive 32-bit integer', () => {
    const seed = generateSeed();
    expect(typeof seed).toBe('number');
    expect(seed).toBeGreaterThanOrEqual(0);
    expect(seed).toBeLessThanOrEqual(0xffffffff);
  });

  it('two consecutive seeds are likely different', () => {
    const a = generateSeed();
    const b = generateSeed();
    // Very unlikely to be equal given time + random component
    expect(a).not.toBe(b);
  });
});

describe('randomInt', () => {
  it('returns values within [min, max] inclusive', () => {
    const rng = createRng(7);
    for (let i = 0; i < 200; i++) {
      const v = randomInt(rng, 3, 8);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(8);
    }
  });

  it('returns integer values only', () => {
    const rng = createRng(7);
    for (let i = 0; i < 50; i++) {
      expect(Number.isInteger(randomInt(rng, 0, 100))).toBe(true);
    }
  });

  it('min === max always returns that value', () => {
    const rng = createRng(1);
    for (let i = 0; i < 10; i++) {
      expect(randomInt(rng, 5, 5)).toBe(5);
    }
  });
});

describe('shuffle', () => {
  it('returns array with same elements', () => {
    const rng = createRng(1);
    const arr = [1, 2, 3, 4, 5];
    const result = shuffle(rng, arr);
    expect(result.sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('does not mutate original array', () => {
    const rng = createRng(1);
    const arr = [1, 2, 3, 4, 5];
    shuffle(rng, arr);
    expect(arr).toEqual([1, 2, 3, 4, 5]);
  });

  it('same seed produces same shuffle', () => {
    const arr = [10, 20, 30, 40, 50];
    expect(shuffle(createRng(123), arr)).toEqual(shuffle(createRng(123), arr));
  });

  it('handles empty array', () => {
    const rng = createRng(1);
    expect(shuffle(rng, [])).toEqual([]);
  });
});
