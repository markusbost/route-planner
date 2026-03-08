import { buildDistanceMatrix } from './graph.js';

/**
 * Beräkna optimal rutt från depå → alla stopp → tillbaka till depå.
 * Brute force för ≤8 stopp, Held-Karp DP (exakt) för fler.
 *
 * @param {{ nodes, adjacency }} graph
 * @param {string[]} stops - nod-IDs som ska besökas
 * @param {string} depotId - start- och slutnod
 * @returns {{ route: string[], totalDistance: number }}
 */
export function optimalRoute(graph, stops, depotId) {
  if (stops.length === 0) return { route: [depotId], totalDistance: 0 };

  const allIds = [depotId, ...stops];
  const matrix = buildDistanceMatrix(graph, allIds);

  if (stops.length <= 8) {
    return bruteForce(stops, depotId, matrix);
  }
  return heldKarp(stops, depotId, matrix);
}

/**
 * Beräkna total distans för en given rutt (depå → stopp i ordning → depå).
 * Returnerar Infinity om något steg saknar väg.
 *
 * @param {Object} matrix - distansmatris från buildDistanceMatrix
 * @param {string[]} route - [depotId, ...stops, depotId]
 * @returns {number}
 */
export function routeDistance(matrix, route) {
  let total = 0;
  for (let i = 0; i < route.length - 1; i++) {
    const d = matrix[route[i]]?.[route[i + 1]] ?? Infinity;
    if (d === Infinity) return Infinity;
    total += d;
  }
  return total;
}

/**
 * Kontrollera om det finns en giltig rutt som täcker alla stopp.
 */
export function isRoutePossible(graph, stops, depotId) {
  const allIds = [depotId, ...stops];
  const matrix = buildDistanceMatrix(graph, allIds);
  return allIds.every((a) =>
    allIds.every((b) => a === b || (matrix[a]?.[b] ?? Infinity) < Infinity)
  );
}

// ---------------------------------------------------------------------------
// Interna algoritmer
// ---------------------------------------------------------------------------

function bruteForce(stops, depotId, matrix) {
  const perms = permutations(stops);
  let best = null;
  let bestDist = Infinity;

  for (const perm of perms) {
    const route = [depotId, ...perm, depotId];
    const dist = routeDistance(matrix, route);
    if (dist < bestDist) {
      bestDist = dist;
      best = route;
    }
  }

  return { route: best ?? [depotId], totalDistance: bestDist };
}

/**
 * Held-Karp exakt TSP-lösare med bitmask-DP. O(2^n · n²).
 * Ger garanterat optimal lösning för alla stopp-antal.
 */
function heldKarp(stops, depotId, matrix) {
  const n = stops.length;
  const INF = Infinity;

  // dp[mask][i] = kortaste distans från depå, besöker exakt stoppen i mask, slutar på stops[i]
  const dp = Array.from({ length: 1 << n }, () => new Array(n).fill(INF));
  const parent = Array.from({ length: 1 << n }, () => new Array(n).fill(-1));

  for (let i = 0; i < n; i++) {
    const d = matrix[depotId]?.[stops[i]] ?? INF;
    if (d < INF) dp[1 << i][i] = d;
  }

  for (let mask = 1; mask < (1 << n); mask++) {
    for (let last = 0; last < n; last++) {
      if (!(mask & (1 << last))) continue;
      if (dp[mask][last] === INF) continue;
      for (let next = 0; next < n; next++) {
        if (mask & (1 << next)) continue;
        const d = matrix[stops[last]]?.[stops[next]] ?? INF;
        if (d === INF) continue;
        const newMask = mask | (1 << next);
        const newDist = dp[mask][last] + d;
        if (newDist < dp[newMask][next]) {
          dp[newMask][next] = newDist;
          parent[newMask][next] = last;
        }
      }
    }
  }

  const fullMask = (1 << n) - 1;
  let bestDist = INF;
  let bestLast = -1;
  for (let i = 0; i < n; i++) {
    if (dp[fullMask][i] === INF) continue;
    const d = matrix[stops[i]]?.[depotId] ?? INF;
    if (d === INF) continue;
    const total = dp[fullMask][i] + d;
    if (total < bestDist) {
      bestDist = total;
      bestLast = i;
    }
  }

  if (bestLast === -1) return { route: [depotId], totalDistance: INF };

  // Rekonstruera rutt
  const routeStops = [];
  let mask = fullMask;
  let last = bestLast;
  while (last !== -1) {
    routeStops.unshift(stops[last]);
    const prevLast = parent[mask][last];
    mask = mask ^ (1 << last);
    last = prevLast;
  }

  return { route: [depotId, ...routeStops, depotId], totalDistance: bestDist };
}

function permutations(arr) {
  if (arr.length <= 1) return [arr];
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const perm of permutations(rest)) {
      result.push([arr[i], ...perm]);
    }
  }
  return result;
}
