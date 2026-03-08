import { describe, it, expect } from 'vitest';
import { optimalRoute, routeDistance, isRoutePossible } from '../../src/game/routing.js';
import { buildGraph, buildDistanceMatrix } from '../../src/game/graph.js';

// Linear graph: A -10- B -10- C -10- D
function linearGraph() {
  const nodes = [
    { id: 'A', x: 0, y: 0 },
    { id: 'B', x: 100, y: 0 },
    { id: 'C', x: 200, y: 0 },
    { id: 'D', x: 300, y: 0 },
  ];
  const edges = [
    { from: 'A', to: 'B', distance: 10 },
    { from: 'B', to: 'C', distance: 10 },
    { from: 'C', to: 'D', distance: 10 },
  ];
  return buildGraph(nodes, edges);
}

// Complete graph: depot + 3 stops, all direct connections
function completeGraph() {
  const nodes = [
    { id: 'depot', x: 0, y: 0 },
    { id: 'S1', x: 100, y: 0 },
    { id: 'S2', x: 0, y: 100 },
    { id: 'S3', x: 100, y: 100 },
  ];
  const edges = [
    { from: 'depot', to: 'S1', distance: 10 },
    { from: 'depot', to: 'S2', distance: 20 },
    { from: 'depot', to: 'S3', distance: 30 },
    { from: 'S1', to: 'S2', distance: 15 },
    { from: 'S1', to: 'S3', distance: 5 },
    { from: 'S2', to: 'S3', distance: 10 },
  ];
  return buildGraph(nodes, edges);
}

describe('routeDistance', () => {
  it('calculates total distance along a known route', () => {
    const graph = linearGraph();
    const matrix = buildDistanceMatrix(graph, ['A', 'B', 'C', 'D']);
    // A→B→C→A: 10 + 10 + 20 = 40
    expect(routeDistance(matrix, ['A', 'B', 'C', 'A'])).toBe(40);
  });

  it('returns 0 for a single-node route', () => {
    const graph = linearGraph();
    const matrix = buildDistanceMatrix(graph, ['A']);
    expect(routeDistance(matrix, ['A'])).toBe(0);
  });

  it('returns Infinity when no path exists between nodes', () => {
    const nodes = [
      { id: 'X', x: 0, y: 0 },
      { id: 'Y', x: 100, y: 0 },
    ];
    const graph = buildGraph(nodes, []);
    const matrix = buildDistanceMatrix(graph, ['X', 'Y']);
    expect(routeDistance(matrix, ['X', 'Y', 'X'])).toBe(Infinity);
  });
});

describe('optimalRoute', () => {
  it('handles zero stops – returns depot only', () => {
    const graph = linearGraph();
    const result = optimalRoute(graph, [], 'A');
    expect(result.route).toEqual(['A']);
    expect(result.totalDistance).toBe(0);
  });

  it('handles single stop', () => {
    const graph = linearGraph();
    const result = optimalRoute(graph, ['B'], 'A');
    // A→B→A = 10+10 = 20
    expect(result.totalDistance).toBe(20);
    expect(result.route).toEqual(['A', 'B', 'A']);
  });

  it('finds optimal 3-stop route on complete graph', () => {
    const graph = completeGraph();
    const result = optimalRoute(graph, ['S1', 'S2', 'S3'], 'depot');
    // Optimal: depot→S1→S3→S2→depot = 10+5+10+20 = 45
    expect(result.totalDistance).toBe(45);
    expect(result.route[0]).toBe('depot');
    expect(result.route[result.route.length - 1]).toBe('depot');
  });

  it('route starts and ends at depot', () => {
    const graph = completeGraph();
    const result = optimalRoute(graph, ['S1', 'S2', 'S3'], 'depot');
    expect(result.route[0]).toBe('depot');
    expect(result.route[result.route.length - 1]).toBe('depot');
  });

  it('route visits all stops exactly once', () => {
    const graph = completeGraph();
    const stops = ['S1', 'S2', 'S3'];
    const result = optimalRoute(graph, stops, 'depot');
    // Middle of route (excluding first and last depot) should contain all stops
    const routeMiddle = result.route.slice(1, -1);
    expect(routeMiddle.sort()).toEqual(stops.sort());
  });

  it('brute force result matches for ≤8 stops', () => {
    // On a linear graph, the only valid order is sequential
    const graph = linearGraph();
    const result = optimalRoute(graph, ['B', 'C', 'D'], 'A');
    // A→B→C→D→A = 10+10+10+30 = 60
    expect(result.totalDistance).toBe(60);
  });

  it('respects blocked edges via graph', () => {
    const nodes = [
      { id: 'depot', x: 0, y: 0 },
      { id: 'S1', x: 100, y: 0 },
      { id: 'S2', x: 200, y: 0 },
    ];
    const edges = [
      { from: 'depot', to: 'S1', distance: 10 },
      { from: 'S1', to: 'S2', distance: 10 },
      { from: 'depot', to: 'S2', distance: 100 }, // long direct path
    ];
    const blockedEdges = [{ from: 'depot', to: 'S1' }];
    const graph = buildGraph(nodes, edges, blockedEdges);
    const result = optimalRoute(graph, ['S1', 'S2'], 'depot');
    // With depot→S1 blocked, must go via depot→S2→S1
    expect(result.totalDistance).toBeGreaterThan(20);
  });
});

describe('nearestNeighbor (>8 stops)', () => {
  // Build a fully-connected graph with depot + n stops, all edges distance 1
  function starGraph(n) {
    const nodes = [{ id: 'depot', x: 0, y: 0 }];
    const edges = [];
    for (let i = 1; i <= n; i++) {
      nodes.push({ id: `S${i}`, x: i * 10, y: 0 });
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        edges.push({ from: nodes[i].id, to: nodes[j].id, distance: 1 });
      }
    }
    return buildGraph(nodes, edges);
  }

  it('returns a route that starts and ends at depot for 9 stops', () => {
    const graph = starGraph(9);
    const stops = Array.from({ length: 9 }, (_, i) => `S${i + 1}`);
    const result = optimalRoute(graph, stops, 'depot');
    expect(result.route[0]).toBe('depot');
    expect(result.route[result.route.length - 1]).toBe('depot');
  });

  it('visits all 9 stops exactly once', () => {
    const graph = starGraph(9);
    const stops = Array.from({ length: 9 }, (_, i) => `S${i + 1}`);
    const result = optimalRoute(graph, stops, 'depot');
    const middle = result.route.slice(1, -1);
    expect(middle.sort()).toEqual([...stops].sort());
  });

  it('returns finite totalDistance for 9 stops', () => {
    const graph = starGraph(9);
    const stops = Array.from({ length: 9 }, (_, i) => `S${i + 1}`);
    const result = optimalRoute(graph, stops, 'depot');
    expect(result.totalDistance).toBe(10); // depot+9 stops, all edges=1: 10 steps
  });

  it('falls back gracefully when a nearest neighbor is unreachable (null branch)', () => {
    // Single isolated stop – nearest=null triggers the break
    const nodes = [
      { id: 'depot', x: 0, y: 0 },
      ...Array.from({ length: 9 }, (_, i) => ({ id: `S${i + 1}`, x: i * 10, y: 0 })),
    ];
    // Connect depot to all S nodes but leave S5 with no outgoing edges to others
    const edges = [];
    for (let i = 1; i <= 9; i++) edges.push({ from: 'depot', to: `S${i}`, distance: 1 });
    // Only connect S nodes to depot (not to each other) — once we leave depot,
    // nearest neighbor from S1 can't reach S2 etc. directly → falls back
    const graph = buildGraph(nodes, edges);
    const stops = Array.from({ length: 9 }, (_, i) => `S${i + 1}`);
    const result = optimalRoute(graph, stops, 'depot');
    // Route should still start and end at depot
    expect(result.route[0]).toBe('depot');
    expect(result.route[result.route.length - 1]).toBe('depot');
  });
});

describe('isRoutePossible', () => {
  it('returns true when all stops reachable', () => {
    const graph = completeGraph();
    expect(isRoutePossible(graph, ['S1', 'S2', 'S3'], 'depot')).toBe(true);
  });

  it('returns false when a stop is not reachable', () => {
    const nodes = [
      { id: 'depot', x: 0, y: 0 },
      { id: 'S1', x: 100, y: 0 },
      { id: 'isolated', x: 500, y: 500 }, // no edges
    ];
    const edges = [{ from: 'depot', to: 'S1', distance: 10 }];
    const graph = buildGraph(nodes, edges);
    expect(isRoutePossible(graph, ['S1', 'isolated'], 'depot')).toBe(false);
  });

  it('returns true for empty stops list', () => {
    const graph = linearGraph();
    expect(isRoutePossible(graph, [], 'A')).toBe(true);
  });
});
