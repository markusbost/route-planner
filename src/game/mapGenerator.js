import { createRng, randomInt, shuffle } from './random.js';
import { buildGraph, isConnected, edgeKey } from './graph.js';

// Viewport-dimensioner som kartan genereras inom
// Portrait aspect ratio (7:10) fyller mobilskärmar bättre än landskap
export const MAP_WIDTH = 560;
export const MAP_HEIGHT = 800;
const MARGIN = 55;
const MIN_NODE_DISTANCE = 85;

// Antal noder och aktiva stopp per svårighetsgrad
const DIFFICULTY_CONFIG = {
  1: { totalNodes: 6,  activeStops: 3 },
  2: { totalNodes: 9,  activeStops: 5 },
  3: { totalNodes: 13, activeStops: 8 },
};

// Hinderttyper (kosmetiska)
const OBSTACLE_TYPES = ['broken_bus', 'rockslide', 'fallen_tree'];

/**
 * Generera en spelkarta.
 * @param {{ seed: number, difficulty: 1|2|3, obstacles: boolean }} options
 * @returns {{ nodes, edges, blockedEdges, stops, depot, seed }}
 */
export function generateMap({ seed, difficulty = 1, obstacles = false }) {
  const rng = createRng(seed);
  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG[1];

  const nodes = placeNodes(rng, config.totalNodes);
  const edges = buildEdges(nodes);

  // Välj depå och aktiva stopp
  const shuffledIds = shuffle(rng, nodes.map((n) => n.id));
  const depotId = shuffledIds[0];
  const stopIds = shuffledIds.slice(1, 1 + config.activeStops);
  const stops = stopIds;

  let blockedEdges = [];
  if (obstacles) {
    blockedEdges = selectBlockedEdges(rng, nodes, edges, stops, depotId);
  }

  return { nodes, edges, blockedEdges, stops, depot: depotId, seed };
}

// ---------------------------------------------------------------------------
// Interna hjälpfunktioner
// ---------------------------------------------------------------------------

/**
 * Placera `count` noder slumpmässigt inom kartans viewport.
 * Noder placeras med minst MIN_NODE_DISTANCE px mellanrum.
 * @param {() => number} rng
 * @param {number} count
 * @returns {Array<{ id: string, x: number, y: number }>}
 */
function placeNodes(rng, count) {
  const nodes = [];
  let attempts = 0;

  while (nodes.length < count && attempts < count * 50) {
    attempts++;
    const x = randomInt(rng, MARGIN, MAP_WIDTH - MARGIN);
    const y = randomInt(rng, MARGIN, MAP_HEIGHT - MARGIN);

    const tooClose = nodes.some(
      (n) => Math.hypot(n.x - x, n.y - y) < MIN_NODE_DISTANCE
    );
    if (!tooClose) {
      nodes.push({ id: String(nodes.length), x, y });
    }
  }

  return nodes;
}

/**
 * Koppla noder till en sammanhängande graf.
 * Varje nod kopplas till sina 2 närmaste grannar.
 * Om grafen trots detta inte är sammanhängande läggs en extra brygga till.
 * @param {Array<{ id: string, x: number, y: number }>} nodes
 * @returns {Array<{ from: string, to: string, distance: number }>}
 */
function buildEdges(nodes) {
  const edges = [];
  const added = new Set();

  // Koppla varje nod till sina 2 närmaste grannar
  for (let i = 0; i < nodes.length; i++) {
    const sorted = nodes
      .filter((n) => n.id !== nodes[i].id)
      .map((n) => ({ id: n.id, dist: Math.hypot(n.x - nodes[i].x, n.y - nodes[i].y) }))
      .sort((a, b) => a.dist - b.dist);

    for (const neighbor of sorted.slice(0, 2)) {
      const key = edgeKey(nodes[i].id, neighbor.id);
      if (!added.has(key)) {
        added.add(key);
        edges.push({
          from: nodes[i].id,
          to: neighbor.id,
          distance: Math.round(neighbor.dist),
        });
      }
    }
  }

  // Säkerhetskontroll: om grafen inte är sammanhängande, lägg till broar
  const graph = buildGraph(nodes, edges);
  if (!isConnected(graph)) {
    for (let i = 0; i < nodes.length - 1; i++) {
      const key = edgeKey(nodes[i].id, nodes[i + 1].id);
      if (!added.has(key)) {
        added.add(key);
        const dist = Math.round(
          Math.hypot(nodes[i].x - nodes[i + 1].x, nodes[i].y - nodes[i + 1].y)
        );
        edges.push({ from: nodes[i].id, to: nodes[i + 1].id, distance: dist });
      }
    }
  }

  return edges;
}

/**
 * Välj ett slumpmässigt antal kanter (1–3, max 20 % av totalen) att blockera.
 * Varje kandidat valideras: grafen måste förbli sammanhängande och rutten möjlig.
 * Varje blockerad kant tilldelas en slumpmässig `obstacleType` (kosmetisk).
 * @param {() => number} rng
 * @param {Array} nodes
 * @param {Array} edges
 * @param {string[]} stops
 * @param {string} depotId
 * @returns {Array<{ from: string, to: string, distance: number, obstacleType: string }>}
 */
function selectBlockedEdges(rng, nodes, edges, _stops, _depotId) {
  const maxObstacles = Math.min(
    Math.floor(edges.length * 0.2),
    randomInt(rng, 1, 3)
  );

  const candidates = shuffle(rng, [...edges]);
  const blocked = [];

  for (const edge of candidates) {
    if (blocked.length >= maxObstacles) break;

    // Prova att blockera kanten – validera att grafen fortfarande är sammanhängande
    const testBlocked = [...blocked, edge];
    const graph = buildGraph(nodes, edges, testBlocked);

    if (isConnected(graph)) {
      blocked.push({
        ...edge,
        obstacleType: OBSTACLE_TYPES[Math.floor(rng() * OBSTACLE_TYPES.length)],
      });
    }
  }

  return blocked;
}
