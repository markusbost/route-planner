import { useState } from 'react';
import { getVehicle } from '../game/vehicles.js';
import { MAP_WIDTH, MAP_HEIGHT } from '../game/mapGenerator.js';
import { playClick, playNodeTap, playNodeDeselect } from '../game/audio.js';

const OBSTACLE_EMOJIS = {
  broken_bus: '🚌',
  rockslide: '🪨',
  fallen_tree: '🌳',
};

/**
 * Interaktiv SVG-karta där spelaren väljer ordning för stoppbesök.
 * Tryck på ett stopp för att lägga till det i rutten; tryck igen för att avmarkera
 * det och alla stopp som lagts till efter det.
 *
 * @param {{ mapData:   { nodes, edges, blockedEdges, stops: string[], depot: string },
 *           vehicleId: string,
 *           onFinish:  (route: string[]) => void,
 *           onBack:    () => void }} props
 */
export default function GameMap({ mapData, vehicleId, onFinish, onBack }) {
  const { nodes, edges, blockedEdges, stops, depot } = mapData;
  const vehicle = getVehicle(vehicleId);
  const [selectedStops, setSelectedStops] = useState([]);

  const blockedSet = new Set(
    blockedEdges.map((e) => [e.from, e.to].sort().join('|'))
  );
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  function isBlocked(from, to) {
    return blockedSet.has([from, to].sort().join('|'));
  }

  function handleNodePress(nodeId) {
    if (!stops.includes(nodeId)) return;
    setSelectedStops((prev) => {
      if (prev.includes(nodeId)) {
        // Deselect: remove this stop and all after it
        playNodeDeselect();
        return prev.slice(0, prev.indexOf(nodeId));
      }
      playNodeTap();
      return [...prev, nodeId];
    });
  }

  function handleFinish() {
    playClick();
    onFinish([depot, ...selectedStops, depot]);
  }

  const allSelected = selectedStops.length === stops.length;

  return (
    <div className="screen-full" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backBtn}>
          ← Tillbaka
        </button>
        <div style={styles.mission}>
          <span style={{ fontSize: 24 }}>{vehicle.emoji}</span>
          <span>{vehicle.mission}</span>
        </div>
        <div style={styles.counter}>
          {selectedStops.length}/{stops.length}
        </div>
      </div>

      {/* Map */}
      <div style={styles.mapContainer}>
        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          style={styles.svg}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Road edges */}
          {edges.map((edge, i) => {
            const from = nodeMap[edge.from];
            const to = nodeMap[edge.to];
            if (!from || !to) return null;
            const blocked = isBlocked(edge.from, edge.to);
            return (
              <line
                key={i}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                style={{ stroke: blocked ? '#ff5252' : 'var(--c-road)', strokeWidth: blocked ? 4 : 5 }}
                strokeDasharray={blocked ? '12 7' : undefined}
                strokeLinecap="round"
              />
            );
          })}

          {/* Obstacle icons */}
          {blockedEdges.map((edge, i) => {
            const from = nodeMap[edge.from];
            const to = nodeMap[edge.to];
            if (!from || !to) return null;
            return (
              <text
                key={i}
                x={(from.x + to.x) / 2}
                y={(from.y + to.y) / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="22"
              >
                {OBSTACLE_EMOJIS[edge.obstacleType] ?? '🚧'}
              </text>
            );
          })}

          {/* Junction nodes (not stop, not depot) */}
          {nodes
            .filter((n) => n.id !== depot && !stops.includes(n.id))
            .map((n) => (
              <circle
                key={n.id}
                cx={n.x}
                cy={n.y}
                r={8}
                strokeWidth={2}
                style={{ fill: 'var(--c-junction-fill)', stroke: 'var(--c-junction-stroke)' }}
              />
            ))}

          {/* Stop nodes */}
          {stops.map((stopId) => {
            const n = nodeMap[stopId];
            if (!n) return null;
            const idx = selectedStops.indexOf(stopId);
            const selected = idx !== -1;
            return (
              <g
                key={stopId}
                onClick={() => handleNodePress(stopId)}
                style={{ cursor: 'pointer' }}
              >
                {/* Touch target */}
                <circle cx={n.x} cy={n.y} r={36} fill="transparent" />
                {/* Outer ring */}
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={28}
                  style={{ fill: selected ? vehicle.color : 'var(--c-node-bg)' }}
                  stroke={vehicle.color}
                  strokeWidth={3}
                />
                {selected ? (
                  <text
                    x={n.x}
                    y={n.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="22"
                    fontWeight="bold"
                    fill="#fff"
                  >
                    {idx + 1}
                  </text>
                ) : (
                  <text
                    x={n.x}
                    y={n.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="22"
                  >
                    {vehicle.stopEmoji}
                  </text>
                )}
              </g>
            );
          })}

          {/* Depot */}
          {nodeMap[depot] && (
            <g>
              <circle
                cx={nodeMap[depot].x}
                cy={nodeMap[depot].y}
                r={30}
                style={{ fill: 'var(--c-node-bg)' }}
                stroke="#ffd600"
                strokeWidth={4}
              />
              <text
                x={nodeMap[depot].x}
                y={nodeMap[depot].y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="24"
              >
                {vehicle.depotEmoji}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <p style={styles.hint}>
          {allSelected
            ? '✅ Alla stopp valda – tryck Kör!'
            : `Tryck i ordning på ${vehicle.stopEmoji} du ska besöka`}
        </p>
        <button
          onClick={handleFinish}
          disabled={!allSelected}
          style={{
            ...styles.goButton,
            background: allSelected ? vehicle.color : 'var(--c-btn-neutral)',
            color: allSelected ? '#fff' : 'var(--c-btn-neutral-text)',
            opacity: allSelected ? 1 : 0.5,
          }}
        >
          {vehicle.emoji} Kör!
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    background: 'var(--c-surface)',
    flexShrink: 0,
    minHeight: 56,
  },
  backBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--c-text-muted)',
    fontSize: 16,
    cursor: 'pointer',
    padding: '8px 4px',
    minWidth: 80,
  },
  mission: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 'clamp(13px, 3vw, 15px)',
    fontWeight: 700,
    flex: 1,
    justifyContent: 'center',
  },
  counter: {
    fontSize: 'clamp(16px, 4.5vw, 20px)',
    fontWeight: 800,
    color: '#ffd600',
    minWidth: 60,
    textAlign: 'right',
  },
  mapContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    overflow: 'hidden',
    background: 'var(--c-map)',
  },
  svg: {
    width: '100%',
    height: '100%',
    maxWidth: MAP_WIDTH,
    maxHeight: MAP_HEIGHT,
  },
  footer: {
    padding: '12px 16px 20px',
    background: 'var(--c-surface)',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
  },
  hint: {
    fontSize: 'clamp(12px, 3vw, 14px)',
    opacity: 0.75,
    textAlign: 'center',
  },
  goButton: {
    width: '100%',
    maxWidth: 420,
    padding: '18px 0',
    borderRadius: 14,
    border: 'none',
    fontSize: 22,
    fontWeight: 900,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
};
