import { useState } from 'react';
import { VEHICLES } from '../game/vehicles.js';
import { playClick } from '../game/audio.js';

/**
 * Startskärm där spelaren väljer fordon, svårighetsgrad och om hinder ska vara aktiva.
 *
 * @param {{ onStart: (config: { vehicleId: string, difficulty: 1|2|3, obstacles: boolean }) => void,
 *           onHighscores: () => void,
 *           theme: 'dark'|'light',
 *           onToggleTheme: () => void }} props
 */
export default function GameSetup({ onStart, onHighscores, theme, onToggleTheme }) {
  const [vehicleId, setVehicleId] = useState('garbage');
  const [difficulty, setDifficulty] = useState(1);
  const [obstacles, setObstacles] = useState(false);

  const vehicles = Object.values(VEHICLES);

  return (
    <div style={styles.container}>
      {/* Theme toggle */}
      <button
        onClick={() => { playClick(); onToggleTheme(); }}
        style={styles.themeToggle}
        title={theme === 'dark' ? 'Byt till dagsläge' : 'Byt till mörkt läge'}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      <h1 style={styles.title}>🗺️ Ruttplaneraren</h1>

      {/* Vehicle selection */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Välj fordon</h2>
        <div className="vehicle-grid">
          {vehicles.map((v) => (
            <button
              key={v.id}
              onClick={() => { playClick(); setVehicleId(v.id); }}
              style={{
                ...styles.vehicleButton,
                borderColor: vehicleId === v.id ? v.color : 'transparent',
                background: vehicleId === v.id ? v.color + '33' : 'var(--c-card)',
              }}
            >
              <span style={styles.vehicleEmoji}>{v.emoji}</span>
              <span style={styles.vehicleName}>{v.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Difficulty */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Svårighetsgrad</h2>
        <div style={styles.diffRow}>
          {[
            { level: 1, label: '⭐ Lätt', stops: '3 stopp' },
            { level: 2, label: '⭐⭐ Medel', stops: '5 stopp' },
            { level: 3, label: '⭐⭐⭐ Svår', stops: '8 stopp' },
          ].map(({ level, label, stops }) => (
            <button
              key={level}
              onClick={() => { playClick(); setDifficulty(level); }}
              style={{
                ...styles.diffButton,
                background: difficulty === level ? '#f0a500' : 'var(--c-card)',
                color: difficulty === level ? '#000' : 'var(--c-text)',
              }}
            >
              <span style={styles.diffLabel}>{label}</span>
              <span style={styles.diffStops}>{stops}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Obstacles */}
      <section style={styles.section}>
        <button
          onClick={() => { playClick(); setObstacles((o) => !o); }}
          style={{
            ...styles.obstacleButton,
            background: obstacles ? '#c62828' : 'var(--c-card)',
            borderColor: obstacles ? '#ef5350' : 'var(--c-border)',
            color: obstacles ? '#fff' : 'var(--c-text)',
          }}
        >
          <span style={{ fontSize: 22 }}>{obstacles ? '🚧' : '🛣️'}</span>
          <span>Hinder på vägen: {obstacles ? 'PÅ' : 'AV'}</span>
        </button>
        {obstacles && (
          <p style={styles.obstacleHint}>
            🌳 🪨 🚌 &nbsp;Några vägar är blockerade!
          </p>
        )}
      </section>

      {/* Start */}
      <button
        onClick={() => { playClick(); onStart({ vehicleId, difficulty, obstacles }); }}
        style={{ ...styles.startButton, background: VEHICLES[vehicleId].color }}
      >
        {VEHICLES[vehicleId].emoji} Starta spelet!
      </button>

      <button onClick={() => { playClick(); onHighscores(); }} style={styles.highscoreButton}>
        🏆 Visa highscore
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: '100dvh',
    padding: 'clamp(16px, 4vw, 28px) clamp(12px, 4vw, 20px)',
    gap: 'clamp(12px, 3vw, 18px)',
    overflowY: 'auto',
    position: 'relative',
  },
  themeToggle: {
    position: 'absolute',
    top: 12,
    right: 12,
    background: 'var(--c-card)',
    border: '1px solid var(--c-border)',
    borderRadius: '50%',
    width: 42,
    height: 42,
    fontSize: 20,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: {
    fontSize: 'clamp(22px, 6vw, 34px)',
    fontWeight: 900,
    letterSpacing: '-0.5px',
  },
  section: {
    width: '100%',
    maxWidth: 500,
  },
  sectionTitle: {
    fontSize: 'clamp(11px, 2.5vw, 14px)',
    fontWeight: 600,
    marginBottom: 10,
    textAlign: 'center',
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  vehicleGrid: {},  /* layout handled by .vehicle-grid CSS class */
  vehicleButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 'clamp(10px, 3vw, 14px) 6px',
    borderRadius: 14,
    border: '3px solid transparent',
    cursor: 'pointer',
    gap: 6,
    minHeight: 'clamp(70px, 15vw, 90px)',
    transition: 'all 0.15s',
  },
  vehicleEmoji: { fontSize: 'clamp(26px, 7vw, 38px)' },
  vehicleName: { fontSize: 'clamp(9px, 2.2vw, 11px)', color: 'var(--c-text)', textAlign: 'center', fontWeight: 600 },
  diffRow: {
    display: 'flex',
    gap: 10,
  },
  diffButton: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 'clamp(8px, 2.5vw, 12px) 6px',
    borderRadius: 10,
    border: 'none',
    cursor: 'pointer',
    gap: 4,
  },
  diffLabel: { fontSize: 'clamp(12px, 3.5vw, 15px)', fontWeight: 700 },
  diffStops: { fontSize: 'clamp(9px, 2vw, 11px)', opacity: 0.7 },
  obstacleButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: '14px',
    borderRadius: 12,
    border: '2px solid transparent',
    fontSize: 18,
    cursor: 'pointer',
    fontWeight: 700,
    transition: 'all 0.15s',
  },
  obstacleHint: {
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.6,
    fontSize: 14,
  },
  startButton: {
    width: '100%',
    maxWidth: 500,
    padding: 'clamp(14px, 4vw, 20px) 0',
    borderRadius: 16,
    border: 'none',
    fontSize: 'clamp(17px, 5vw, 24px)',
    fontWeight: 900,
    color: '#fff',
    cursor: 'pointer',
    marginTop: 4,
    letterSpacing: '0.02em',
  },
  highscoreButton: {
    background: 'transparent',
    border: 'none',
    color: 'var(--c-text-faint)',
    fontSize: 16,
    cursor: 'pointer',
    padding: '10px 20px',
  },
};
