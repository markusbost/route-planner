/**
 * Bygg en viktad, oriktad graf från noder, kanter och valfria blockerade kanter.
 * @param {Array} nodes - [{ id, x, y, label, type }]
 * @param {Array} edges - [{ from, to, distance }]
 * @param {Array} blockedEdges - [{ from, to }] – dessa kanter exkluderas
 * @returns {{ nodes: Array, adjacency: Object }}
 */
export function buildGraph(nodes, edges, blockedEdges = []) {
  const blockedSet = new Set(blockedEdges.map((e) => edgeKey(e.from, e.to)));
  const adjacency = {};

  for (const node of nodes) {
    adjacency[node.id] = {};
  }

  for (const edge of edges) {
    if (!blockedSet.has(edgeKey(edge.from, edge.to))) {
      adjacency[edge.from][edge.to] = edge.distance;
      adjacency[edge.to][edge.from] = edge.distance;
    }
  }

  return { nodes, adjacency };
}

/**
 * Normaliserad kantnyckel (ordningsoberoende).
 */
export function edgeKey(a, b) {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

/**
 * Dijkstras kortaste väg från en startnod till alla andra.
 * @param {{ nodes: Array, adjacency: Object }} graph
 * @param {string|number} startId
 * @returns {{ dist: Object, prev: Object }}
 */
export function dijkstra(graph, startId) {
  const dist = {};
  const prev = {};
  const visited = new Set();

  for (const node of graph.nodes) {
    dist[node.id] = Infinity;
  }
  dist[startId] = 0;

  // Enkel prioritetskö med array (räcker för små grafer)
  const queue = new Set(graph.nodes.map((n) => n.id));

  while (queue.size > 0) {
    // Välj noden med lägst distans
    let current = null;
    for (const id of queue) {
      if (current === null || dist[id] < dist[current]) current = id;
    }
    queue.delete(current);

    if (dist[current] === Infinity) break;

    for (const [neighbor, weight] of Object.entries(
      graph.adjacency[current] || {}
    )) {
      if (visited.has(neighbor)) continue;
      const newDist = dist[current] + weight;
      if (newDist < dist[neighbor]) {
        dist[neighbor] = newDist;
        prev[neighbor] = current;
      }
    }
    visited.add(current);
  }

  return { dist, prev };
}

/**
 * Kortaste väg (distans + sträcka) mellan två noder.
 * Returnerar { distance: Infinity, path: [] } om det inte finns någon väg.
 */
export function shortestPath(graph, fromId, toId) {
  const { dist, prev } = dijkstra(graph, fromId);
  if (dist[toId] === Infinity) return { distance: Infinity, path: [] };

  const path = [];
  let current = String(toId);
  while (current !== undefined) {
    path.unshift(current);
    current = prev[current];
  }

  return { distance: dist[toId], path };
}

/**
 * Kontrollera om alla noder i grafen är nåbara från den första noden.
 */
export function isConnected(graph) {
  if (graph.nodes.length === 0) return true;
  const start = graph.nodes[0].id;
  const { dist } = dijkstra(graph, start);
  return graph.nodes.every((n) => dist[n.id] < Infinity);
}

/**
 * Bygg en distansmatris med kortaste vägar mellan alla par av nod-IDs.
 * @param {{ nodes: Array, adjacency: Object }} graph
 * @param {Array} nodeIds
 * @returns {Object} matrix[fromId][toId] = distance
 */
export function buildDistanceMatrix(graph, nodeIds) {
  const matrix = {};
  for (const id of nodeIds) {
    const { dist } = dijkstra(graph, id);
    matrix[id] = {};
    for (const otherId of nodeIds) {
      matrix[id][otherId] = dist[otherId] ?? Infinity;
    }
  }
  return matrix;
}
