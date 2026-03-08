import { useMemo, useState, useEffect, useRef } from 'react';
import { buildGraph, buildDistanceMatrix, shortestPath } from '../game/graph.js';
import { optimalRoute, routeDistance } from '../game/routing.js';
import { calculateScore, scoreToStars } from '../game/scoring.js';
import { saveScore } from '../game/highscore.js';
import { getVehicle } from '../game/vehicles.js';
import { MAP_WIDTH, MAP_HEIGHT } from '../game/mapGenerator.js';
import { playStopArrival, playRouteComplete } from '../game/audio.js';

const OBSTACLE_EMOJIS = {
  broken_bus: '🚌',
  rockslide: '🪨',
  fallen_tree: '🌳',
};

function getFeedback(score) {
  if (score === 100) return { text: '🎉 Perfekt rutt! Bästa möjliga väg!', color: '#00e676' };
  if (score >= 90)  return { text: '⭐⭐⭐ Toppen! Nästan kortaste vägen!', color: '#00e676' };
  if (score >= 65)  return { text: '👍 Bra jobbat! Här är kortaste vägen.', color: '#ffd600' };
  return              { text: '💪 Försök igen – kolla kortaste vägen!', color: '#ff7043' };
}

/**
 * Resultatskärm som animerar fordonet längs spelarens rutt, spelar upp ljud vid
 * stoppankomster och visar en jämförelse mot den optimala rutten när animationen
 * är klar.
 *
 * @param {{ mapData:     { nodes, edges, blockedEdges, stops: string[], depot: string },
 *           playerRoute: string[],
 *           gameConfig:  { vehicleId: string, difficulty: number, obstacles: boolean, seed: number },
 *           onReplay:    () => void,
 *           onNewGame:   () => void }} props
 */
export default function RouteResult({
  mapData,
  playerRoute,
  gameConfig,
  onReplay,
  onNewGame,
}) {
  const { nodes, edges, blockedEdges, stops, depot } = mapData;
  const vehicle = getVehicle(gameConfig.vehicleId);
  const [showResult, setShowResult] = useState(false);
  // vehiclePos: smoothly interpolated {x, y} along actual road edges
  const [vehiclePos, setVehiclePos] = useState(null);
  // vehicleAngle: rotation angle in degrees so emoji faces direction of travel
  const [vehicleAngle, setVehicleAngle] = useState(0);
  // travelledSegments: set of 'fromId|toId' edges drawn so far
  const [travelledSegments, setTravelledSegments] = useState([]);
  // visitedStops: stop IDs the vehicle has reached
  const [visitedStops, setVisitedStops] = useState(new Set());
  // stopEvent: brief popup shown when vehicle arrives at a stop
  const [stopEvent, setStopEvent] = useState(null); // { x, y, text }
  const rafRef = useRef(null);
  const progressRef = useRef(0); // float index into expandedPath
  const prevNodeIdxRef = useRef(-1); // track last whole-node index to detect arrivals
  const visitedRef = useRef(new Set()); // mirror of visitedStops for use inside rAF
  const nextStopIdxRef = useRef(1); // index into playerRoute for the next expected stop

  const nodeMap = useMemo(
    () => Object.fromEntries(nodes.map((n) => [n.id, n])),
    [nodes]
  );

  const { graph, matrix, optimal, playerDistance, score, stars } = useMemo(() => {
    const graph = buildGraph(nodes, edges, blockedEdges);
    const allIds = [...new Set([depot, ...stops])];
    const matrix = buildDistanceMatrix(graph, allIds);
    const optimal = optimalRoute(graph, stops, depot);
    const playerDistance = routeDistance(matrix, playerRoute);
    const score = calculateScore(optimal.totalDistance, playerDistance);
    const stars = scoreToStars(score);

    saveScore(
      {
        vehicleId: gameConfig.vehicleId,
        difficulty: gameConfig.difficulty,
        obstacles: gameConfig.obstacles,
        seed: gameConfig.seed,
      },
      score
    );

    return { graph, matrix, optimal, playerDistance, score, stars };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Expand playerRoute into full node sequence along actual roads
  const expandedPath = useMemo(() => {
    const full = [];
    for (let i = 0; i < playerRoute.length - 1; i++) {
      const { path } = shortestPath(graph, playerRoute[i], playerRoute[i + 1]);
      if (path.length === 0) continue;
      if (i === 0) {
        full.push(...path);
      } else {
        full.push(...path.slice(1)); // skip duplicate node at junction
      }
    }
    return full;
  }, [graph, playerRoute]);

  // Optimal route expanded along actual roads (same technique as expandedPath)
  const expandedOptimalPath = useMemo(() => {
    const route = optimal.route;
    const full = [];
    for (let i = 0; i < route.length - 1; i++) {
      const { path } = shortestPath(graph, route[i], route[i + 1]);
      if (path.length === 0) continue;
      if (i === 0) {
        full.push(...path);
      } else {
        full.push(...path.slice(1));
      }
    }
    return full;
  }, [graph, optimal.route]);

  // Pixels per second the vehicle travels
  const SPEED = 120;

  useEffect(() => {
    if (expandedPath.length < 2) {
      setShowResult(true);
      return;
    }

    const firstNode = nodeMap[expandedPath[0]];
    if (firstNode) setVehiclePos({ x: firstNode.x, y: firstNode.y });
    progressRef.current = 0;
    prevNodeIdxRef.current = -1;
    visitedRef.current = new Set();
    nextStopIdxRef.current = 1;
    setVisitedStops(new Set());
    setStopEvent(null);
    let lastTime = null;

    function frame(timestamp) {
      if (lastTime === null) lastTime = timestamp;
      const delta = (timestamp - lastTime) / 1000; // seconds
      lastTime = timestamp;

      const prev = progressRef.current;
      const maxIndex = expandedPath.length - 1;

      // Advance progress based on distance between current and next node
      const fromNode = nodeMap[expandedPath[Math.floor(prev)]];
      const nextIdx = Math.min(Math.floor(prev) + 1, maxIndex);
      const toNode = nodeMap[expandedPath[nextIdx]];

      let advance = 0;
      if (fromNode && toNode) {
        const segLen = Math.hypot(toNode.x - fromNode.x, toNode.y - fromNode.y);
        // Normalise: SPEED px/s over segLen px = fraction/s
        advance = segLen > 0 ? (SPEED * delta) / segLen : SPEED * delta;
      }

      const next = Math.min(prev + advance, maxIndex);
      progressRef.current = next;

      // Interpolate position
      const segIdx = Math.floor(next);
      const t = next - segIdx;
      const fn = nodeMap[expandedPath[segIdx]];
      const tn = nodeMap[expandedPath[Math.min(segIdx + 1, maxIndex)]];
      if (fn && tn) {
        setVehiclePos({ x: fn.x + (tn.x - fn.x) * t, y: fn.y + (tn.y - fn.y) * t });
        // Angle so the emoji faces direction of travel
        const dx = tn.x - fn.x;
        const dy = tn.y - fn.y;
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
          setVehicleAngle(Math.atan2(dy, dx) * (180 / Math.PI));
        }
      }

      // Detect arrival at a new node (integer crossing)
      const currentNodeIdx = Math.floor(next);
      if (currentNodeIdx !== prevNodeIdxRef.current && currentNodeIdx < expandedPath.length) {
        prevNodeIdxRef.current = currentNodeIdx;
        const arrivedId = expandedPath[currentNodeIdx];
        const expectedStopId = playerRoute[nextStopIdxRef.current];
        if (arrivedId === expectedStopId && stops.includes(arrivedId) && !visitedRef.current.has(arrivedId)) {
          visitedRef.current.add(arrivedId);
          nextStopIdxRef.current += 1;
          const arrivedNode = nodeMap[arrivedId];
          setVisitedStops(new Set(visitedRef.current));
          if (arrivedNode) {
            playStopArrival();
            setStopEvent({ x: arrivedNode.x, y: arrivedNode.y - 60, text: vehicle.action });
            setTimeout(() => setStopEvent(null), 1500);
          }
        }
      }

      // Build list of fully-traversed segments for trail drawing
      const segs = [];
      for (let i = 0; i < Math.floor(next); i++) {
        segs.push(`${expandedPath[i]}|${expandedPath[i + 1]}`);
      }
      setTravelledSegments(segs);

      if (next >= maxIndex) {
        setTimeout(() => { setShowResult(true); playRouteComplete(score); }, 400);
        return;
      }
      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [expandedPath, nodeMap]);

  const blockedSet = new Set(
    blockedEdges.map((e) => [e.from, e.to].sort().join('|'))
  );
  const feedback = getFeedback(score);
  // Only render optimal route overlay when player didn't find the perfect route
  const showOptimal = showResult && score < 100;

  return (
    <div className="screen-full" style={styles.container}>
      {/* Map */}
      <div style={styles.mapContainer}>
        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          style={styles.svg}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Edges */}
          {edges.map((edge, i) => {
            const from = nodeMap[edge.from];
            const to = nodeMap[edge.to];
            if (!from || !to) return null;
            const blocked = blockedSet.has([edge.from, edge.to].sort().join('|'));
            return (
              <line
                key={i}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                style={{ stroke: blocked ? '#ff5252' : 'var(--c-road)', strokeWidth: blocked ? 4 : 4 }}
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
                fontSize="20"
              >
                {OBSTACLE_EMOJIS[edge.obstacleType] ?? '🚧'}
              </text>
            );
          })}

          {/* Optimal route (shown after animation) – follows actual roads */}
          {showOptimal &&
            expandedOptimalPath.map((nodeId, i) => {
              if (i === 0) return null;
              const from = nodeMap[expandedOptimalPath[i - 1]];
              const to = nodeMap[nodeId];
              if (!from || !to) return null;
              return (
                <line
                  key={`opt${i}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="#00e676"
                  strokeWidth={4}
                  strokeDasharray="10 5"
                  strokeLinecap="round"
                  opacity={0.75}
                />
              );
            })}

          {/* Player route trail – fully traversed segments */}
          {travelledSegments.map((seg, i) => {
            const [fromId, toId] = seg.split('|');
            const from = nodeMap[fromId];
            const to = nodeMap[toId];
            if (!from || !to) return null;
            return (
              <line
                key={`trail${i}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={vehicle.color}
                strokeWidth={5}
                strokeLinecap="round"
                opacity={0.9}
              />
            );
          })}

          {/* Partial current segment – from last node to vehicle */}
          {vehiclePos && travelledSegments.length < expandedPath.length - 1 && (() => {
            const lastNodeId = expandedPath[travelledSegments.length];
            const lastNode = nodeMap[lastNodeId];
            if (!lastNode) return null;
            return (
              <line
                x1={lastNode.x}
                y1={lastNode.y}
                x2={vehiclePos.x}
                y2={vehiclePos.y}
                stroke={vehicle.color}
                strokeWidth={5}
                strokeLinecap="round"
                opacity={0.7}
              />
            );
          })()}

          {/* Junction nodes */}
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

          {/* Stop nodes – change appearance when visited */}
          {stops.map((stopId) => {
            const n = nodeMap[stopId];
            if (!n) return null;
            const visited = visitedStops.has(stopId);
            return (
              <g key={stopId}>
                {/* outer ring */}
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={26}
                  fill={visited ? vehicle.color : vehicle.color + '33'}
                  stroke={vehicle.color}
                  strokeWidth={3}
                />
                {/* white inner background for emoji contrast */}
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={18}
                  fill={visited ? '#fff' : 'none'}
                  opacity={visited ? 0.9 : 0}
                />
                <text
                  x={n.x}
                  y={n.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="18"
                >
                  {visited ? vehicle.completedEmoji : vehicle.stopEmoji}
                </text>
              </g>
            );
          })}

          {/* Depot */}
          {nodeMap[depot] && (
            <g>
              <circle
                cx={nodeMap[depot].x}
                cy={nodeMap[depot].y}
                r={28}
                style={{ fill: 'var(--c-node-bg)' }}
                stroke="#ffd600"
                strokeWidth={4}
              />
              <text
                x={nodeMap[depot].x}
                y={nodeMap[depot].y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="22"
              >
                {vehicle.depotEmoji}
              </text>
            </g>
          )}

          {/* Moving vehicle – follows road smoothly, rotated to face direction */}
          {vehiclePos && !showResult && (() => {
            // All vehicle emojis (🚛🚐🚓🚒) face LEFT by default (≈ 180°).
            // Strategy: keep emoji upright (not upside-down) and mirror when needed.
            //
            // Left-facing travel (angle > 90° or < -90°):
            //   Emoji already faces left → just tilt: rotate(angle - 180°). No mirror.
            //
            // Right-facing travel (|angle| ≤ 90°):
            //   Mirror horizontally: scale(-1, 1)  →  emoji now faces right.
            //   SVG applies inner transform first, so after scale the point (−1,0)
            //   rotates to (−cos r, −sin r). We want (cos α, sin α), so r = α.
            //   → rotate(angle) with scale(-1,1).
            const flip = !(vehicleAngle > 90 || vehicleAngle < -90); // flip when going right
            const rotAngle = flip ? vehicleAngle : vehicleAngle - 180;
            return (
              <g transform={`translate(${vehiclePos.x}, ${vehiclePos.y - 22})`}>
                <g transform={`rotate(${rotAngle})`}>
                  <g transform={flip ? 'scale(-1, 1)' : undefined}>
                    <text
                      x={0}
                      y={0}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="30"
                    >
                      {vehicle.emoji}
                    </text>
                  </g>
                </g>
              </g>
            );
          })()}

          {/* Stop action popup – rendered LAST so always above everything */}
          {stopEvent && (
            <g>
              <rect
                x={stopEvent.x - 90}
                y={stopEvent.y - 22}
                width={180}
                height={44}
                rx={12}
                style={{ fill: 'var(--c-popup-bg)' }}
                stroke={vehicle.color}
                strokeWidth={3}
              />
              <text
                x={stopEvent.x}
                y={stopEvent.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="17"
                fontWeight="bold"
                fill="#ffffff"
              >
                {stopEvent.text}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Result panel */}
      {showResult ? (
        <div style={styles.resultPanel}>
          <div style={styles.starsRow}>
            {[1, 2, 3].map((s) => (
              <span key={s} style={{ fontSize: 32, opacity: s <= stars ? 1 : 0.25 }}>
                ⭐
              </span>
            ))}
          </div>
          <p style={{ ...styles.feedback, color: feedback.color }}>
            {feedback.text}
          </p>
          <div style={styles.distances}>
            <div style={styles.distBox}>
              <span style={{ color: vehicle.color, fontSize: 13 }}>● Din rutt</span>
              <strong style={styles.distValue}>{playerDistance} m</strong>
            </div>
            <div style={styles.divider} />
            <div style={styles.distBox}>
              <span style={{ color: '#00e676', fontSize: 13 }}>● Kortaste</span>
              <strong style={styles.distValue}>{optimal.totalDistance} m</strong>
            </div>
            <div style={styles.divider} />
            <div style={styles.distBox}>
              <span style={{ fontSize: 13, opacity: 0.7 }}>Poäng</span>
              <strong style={{ ...styles.distValue, color: feedback.color }}>
                {score}%
              </strong>
            </div>
          </div>
          <div style={styles.buttons}>
            <button
              onClick={onReplay}
              style={{ ...styles.btn, background: vehicle.color, color: '#fff' }}
            >
              🔄 Försök igen
            </button>
            <button onClick={onNewGame} style={{ ...styles.btn, background: 'var(--c-btn-neutral)' }}>
              🗺️ Ny karta
            </button>
          </div>
        </div>
      ) : (
        <div style={styles.animBar}>
          <span style={styles.animText}>{vehicle.emoji} Kör rutten...</span>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
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
  resultPanel: {
    padding: '14px 16px 20px',
    background: 'var(--c-surface)',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  starsRow: {
    display: 'flex',
    gap: 4,
  },
  feedback: {
    fontSize: 'clamp(13px, 3.5vw, 17px)',
    fontWeight: 700,
    textAlign: 'center',
  },
  distances: {
    display: 'flex',
    gap: 0,
    background: 'var(--c-card)',
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 400,
  },
  distBox: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
    padding: '10px 0',
  },
  distValue: {
    fontSize: 20,
    fontWeight: 800,
  },
  divider: {
    width: 1,
    background: 'var(--c-divider)',
    flexShrink: 0,
  },
  buttons: {
    display: 'flex',
    gap: 10,
    width: '100%',
    maxWidth: 400,
  },
  btn: {
    flex: 1,
    padding: 'clamp(11px, 3vw, 15px) 0',
    borderRadius: 12,
    border: 'none',
    color: 'var(--c-btn-neutral-text)',
    fontSize: 'clamp(13px, 3.5vw, 16px)',
    fontWeight: 800,
    cursor: 'pointer',
  },
  animBar: {
    padding: '20px',
    background: 'var(--c-surface)',
    textAlign: 'center',
    flexShrink: 0,
  },
  animText: {
    fontSize: 18,
    opacity: 0.7,
  },
};
