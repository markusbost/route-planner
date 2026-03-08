import { buildDistanceMatrix } from './graph.js';

/**
 * Beräkna optimal rutt från depå → alla stopp → tillbaka till depå.
 * Brute force för ≤8 stopp, nearest-neighbor-heuristik för fler.
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
  return nearestNeighbor(stops, depotId, matrix);
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

function nearestNeighbor(stops, depotId, matrix) {
  const unvisited = new Set(stops);
  const route = [depotId];
  let current = depotId;

  while (unvisited.size > 0) {
    let nearest = null;
    let nearestDist = Infinity;
    for (const id of unvisited) {
      const d = matrix[current]?.[id] ?? Infinity;
      if (d < nearestDist) {
        nearestDist = d;
        nearest = id;
      }
    }
    if (nearest === null) break;
    route.push(nearest);
    unvisited.delete(nearest);
    current = nearest;
  }

  route.push(depotId);
  return { route, totalDistance: routeDistance(matrix, route) };
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
