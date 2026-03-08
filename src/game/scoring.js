/**
 * Beräkna poäng baserat på spelarens rutt jämfört med optimal.
 * 100 = perfekt. Returnerar alltid ett heltal i intervallet [1, 100].
 *
 * @param {number} optimalDistance
 * @param {number} playerDistance
 * @returns {number} poäng 1–100
 */
export function calculateScore(optimalDistance, playerDistance) {
  if (playerDistance <= 0 || optimalDistance <= 0) return 0;
  const raw = (optimalDistance / playerDistance) * 100;
  return Math.max(1, Math.min(100, Math.round(raw)));
}

/**
 * Konvertera poäng till stjärnbetyg (1–3).
 * @param {number} score
 * @returns {1|2|3}
 */
export function scoreToStars(score) {
  if (score >= 90) return 3;
  if (score >= 65) return 2;
  return 1;
}
