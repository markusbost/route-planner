/**
 * Mulberry32 – seedad deterministisk pseudo-slumpgenerator.
 * Samma seed ger alltid exakt samma sekvens av tal.
 * @param {number} seed - 32-bitars heltal
 * @returns {() => number} rng – returnerar tal i intervallet [0, 1)
 */
export function createRng(seed) {
  let state = seed >>> 0;
  return function rng() {
    state = (state + 0x6d2b79f5) >>> 0;
    let z = Math.imul(state ^ (state >>> 15), 1 | state);
    z = (z + Math.imul(z ^ (z >>> 7), 61 | z)) ^ z;
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generera ett slumpmässigt seed baserat på aktuell tid.
 * @returns {number}
 */
export function generateSeed() {
  return (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0;
}

/**
 * Returnera ett slumpmässigt heltal i intervallet [min, max] (inkluderande).
 * @param {() => number} rng
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function randomInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/**
 * Blanda en array med Fisher-Yates shuffle (in-place).
 * @param {() => number} rng
 * @param {Array} arr
 * @returns {Array}
 */
export function shuffle(rng, arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
