import { describe, it, expect } from 'vitest';
import {
  buildGraph,
  edgeKey,
  dijkstra,
  shortestPath,
  isConnected,
  buildDistanceMatrix,
} from '../../src/game/graph.js';

// Helper: build a simple triangle graph A-B-C
function triangle() {
  const nodes = [
    { id: 'A', x: 0, y: 0 },
    { id: 'B', x: 100, y: 0 },
    { id: 'C', x: 50, y: 100 },
  ];
  const edges = [
    { from: 'A', to: 'B', distance: 10 },
    { from: 'B', to: 'C', distance: 20 },
    { from: 'A', to: 'C', distance: 50 },
  ];
  return { nodes, edges };
}

describe('edgeKey', () => {
  it('is order-independent', () => {
    expect(edgeKey('A', 'B')).toBe(edgeKey('B', 'A'));
  });

  it('produces unique keys for different pairs', () => {
    expect(edgeKey('A', 'B')).not.toBe(edgeKey('A', 'C'));
  });
});

describe('buildGraph', () => {
  it('builds adjacency correctly', () => {
    const { nodes, edges } = triangle();
    const g = buildGraph(nodes, edges);
    expect(g.adjacency['A']['B']).toBe(10);
    expect(g.adjacency['B']['A']).toBe(10);
    expect(g.adjacency['A']['C']).toBe(50);
  });

  it('excludes blocked edges', () => {
    const { nodes, edges } = triangle();
    const g = buildGraph(nodes, edges, [{ from: 'A', to: 'B' }]);
    expect(g.adjacency['A']['B']).toBeUndefined();
    expect(g.adjacency['B']['A']).toBeUndefined();
    // Other edges still present
    expect(g.adjacency['B']['C']).toBe(20);
  });

  it('blockedEdge exclusion is order-independent', () => {
    const { nodes, edges } = triangle();
    const g = buildGraph(nodes, edges, [{ from: 'B', to: 'A' }]);
    expect(g.adjacency['A']['B']).toBeUndefined();
  });
});

describe('dijkstra', () => {
  it('finds shortest distances from start', () => {
    const { nodes, edges } = triangle();
    const g = buildGraph(nodes, edges);
    const { dist } = dijkstra(g, 'A');
    expect(dist['A']).toBe(0);
    expect(dist['B']).toBe(10);
    expect(dist['C']).toBe(30); // A→B→C = 30, cheaper than A→C = 50
  });

  it('returns Infinity for unreachable nodes', () => {
    const nodes = [
      { id: 'X', x: 0, y: 0 },
      { id: 'Y', x: 100, y: 0 },
      { id: 'Z', x: 200, y: 0 },
    ];
    const edges = [{ from: 'X', to: 'Y', distance: 5 }]; // Z is isolated
    const g = buildGraph(nodes, edges);
    const { dist } = dijkstra(g, 'X');
    expect(dist['Z']).toBe(Infinity);
  });
});

describe('shortestPath', () => {
  it('returns correct distance and path', () => {
    const { nodes, edges } = triangle();
    const g = buildGraph(nodes, edges);
    const result = shortestPath(g, 'A', 'C');
    expect(result.distance).toBe(30);
    expect(result.path).toEqual(['A', 'B', 'C']);
  });

  it('returns Infinity and empty path when no route exists', () => {
    const nodes = [
      { id: 'X', x: 0, y: 0 },
      { id: 'Y', x: 100, y: 0 },
    ];
    const g = buildGraph(nodes, []);
    const result = shortestPath(g, 'X', 'Y');
    expect(result.distance).toBe(Infinity);
    expect(result.path).toEqual([]);
  });
});

describe('isConnected', () => {
  it('returns true for fully connected graph', () => {
    const { nodes, edges } = triangle();
    expect(isConnected(buildGraph(nodes, edges))).toBe(true);
  });

  it('returns false when a node is isolated', () => {
    const nodes = [
      { id: 'A', x: 0, y: 0 },
      { id: 'B', x: 100, y: 0 },
      { id: 'C', x: 200, y: 0 }, // isolated
    ];
    const edges = [{ from: 'A', to: 'B', distance: 10 }];
    expect(isConnected(buildGraph(nodes, edges))).toBe(false);
  });

  it('returns true for single-node graph', () => {
    const nodes = [{ id: 'A', x: 0, y: 0 }];
    expect(isConnected(buildGraph(nodes, []))).toBe(true);
  });
});

describe('buildDistanceMatrix', () => {
  it('computes all pairwise shortest distances', () => {
    const { nodes, edges } = triangle();
    const g = buildGraph(nodes, edges);
    const matrix = buildDistanceMatrix(g, ['A', 'B', 'C']);
    expect(matrix['A']['C']).toBe(30);
    expect(matrix['C']['A']).toBe(30);
    expect(matrix['A']['A']).toBe(0);
  });

  it('returns Infinity for unreachable pairs', () => {
    const nodes = [
      { id: 'A', x: 0, y: 0 },
      { id: 'B', x: 100, y: 0 },
    ];
    const g = buildGraph(nodes, []);
    const matrix = buildDistanceMatrix(g, ['A', 'B']);
    expect(matrix['A']['B']).toBe(Infinity);
  });
});
