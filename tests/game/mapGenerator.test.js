import { describe, it, expect } from 'vitest';
import { generateMap } from '../../src/game/mapGenerator.js';
import { buildGraph, isConnected } from '../../src/game/graph.js';
import { isRoutePossible } from '../../src/game/routing.js';

const SEEDS = [1, 42, 100, 999, 12345];

describe('generateMap – structure', () => {
  it('returns required fields', () => {
    const map = generateMap({ seed: 1, difficulty: 1, obstacles: false });
    expect(map).toHaveProperty('nodes');
    expect(map).toHaveProperty('edges');
    expect(map).toHaveProperty('blockedEdges');
    expect(map).toHaveProperty('stops');
    expect(map).toHaveProperty('depot');
    expect(map).toHaveProperty('seed');
  });

  it('seed is preserved in output', () => {
    const map = generateMap({ seed: 77, difficulty: 1, obstacles: false });
    expect(map.seed).toBe(77);
  });
});

describe('generateMap – node counts per difficulty', () => {
  const cases = [
    { difficulty: 1, minNodes: 7, maxNodes: 9, stops: 4 },
    { difficulty: 2, minNodes: 11, maxNodes: 13, stops: 7 },
    { difficulty: 3, minNodes: 14, maxNodes: 17, stops: 10 },
  ];

  for (const { difficulty, minNodes, maxNodes, stops } of cases) {
    it(`difficulty ${difficulty} → ${stops} active stops`, () => {
      for (const seed of SEEDS) {
        const map = generateMap({ seed, difficulty, obstacles: false });
        expect(map.stops).toHaveLength(stops);
        expect(map.nodes.length).toBeGreaterThanOrEqual(minNodes);
        expect(map.nodes.length).toBeLessThanOrEqual(maxNodes);
      }
    });
  }
});

describe('generateMap – graph connectivity', () => {
  it('generated graph is always fully connected', () => {
    for (const difficulty of [1, 2, 3]) {
      for (const seed of SEEDS) {
        const { nodes, edges } = generateMap({ seed, difficulty, obstacles: false });
        const graph = buildGraph(nodes, edges);
        expect(isConnected(graph)).toBe(true);
      }
    }
  });
});

describe('generateMap – determinism', () => {
  it('same seed + difficulty always produces identical map', () => {
    for (const seed of SEEDS) {
      const a = generateMap({ seed, difficulty: 2, obstacles: false });
      const b = generateMap({ seed, difficulty: 2, obstacles: false });
      expect(a.nodes).toEqual(b.nodes);
      expect(a.edges).toEqual(b.edges);
      expect(a.stops).toEqual(b.stops);
      expect(a.depot).toEqual(b.depot);
    }
  });

  it('different seeds produce different maps', () => {
    const a = generateMap({ seed: 1, difficulty: 1, obstacles: false });
    const b = generateMap({ seed: 2, difficulty: 1, obstacles: false });
    // Very unlikely to be identical
    expect(a.nodes.map((n) => n.x)).not.toEqual(b.nodes.map((n) => n.x));
  });
});

describe('generateMap – obstacles', () => {
  it('no blockedEdges when obstacles=false', () => {
    for (const seed of SEEDS) {
      const { blockedEdges } = generateMap({ seed, difficulty: 1, obstacles: false });
      expect(blockedEdges).toHaveLength(0);
    }
  });

  it('has blocked edges when obstacles=true', () => {
    // At least one seed among several should produce obstacles
    const results = SEEDS.map((seed) =>
      generateMap({ seed, difficulty: 2, obstacles: true })
    );
    const hasSomeObstacles = results.some((m) => m.blockedEdges.length > 0);
    expect(hasSomeObstacles).toBe(true);
  });

  it('max 3 blocked edges', () => {
    for (const seed of SEEDS) {
      const { blockedEdges } = generateMap({ seed, difficulty: 2, obstacles: true });
      expect(blockedEdges.length).toBeLessThanOrEqual(3);
    }
  });

  it('graph remains solvable with obstacles', () => {
    for (const seed of SEEDS) {
      for (const difficulty of [1, 2, 3]) {
        const map = generateMap({ seed, difficulty, obstacles: true });
        const graph = buildGraph(map.nodes, map.edges, map.blockedEdges);
        expect(isConnected(graph)).toBe(true);
        expect(isRoutePossible(graph, map.stops, map.depot)).toBe(true);
      }
    }
  });

  it('blockedEdge obstacle types are valid', () => {
    const validTypes = ['broken_bus', 'rockslide', 'fallen_tree'];
    for (const seed of SEEDS) {
      const { blockedEdges } = generateMap({ seed, difficulty: 2, obstacles: true });
      for (const e of blockedEdges) {
        expect(validTypes).toContain(e.obstacleType);
      }
    }
  });
});

describe('generateMap – depot and stops', () => {
  it('depot is not in stops', () => {
    for (const seed of SEEDS) {
      const { stops, depot } = generateMap({ seed, difficulty: 2, obstacles: false });
      expect(stops).not.toContain(depot);
    }
  });

  it('all stop IDs refer to valid nodes', () => {
    for (const seed of SEEDS) {
      const { nodes, stops } = generateMap({ seed, difficulty: 2, obstacles: false });
      const nodeIds = new Set(nodes.map((n) => n.id));
      for (const stopId of stops) {
        expect(nodeIds.has(stopId)).toBe(true);
      }
    }
  });
});
