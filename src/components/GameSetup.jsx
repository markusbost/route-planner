import { useState } from 'react';
import { VEHICLES } from '../game/vehicles.js';
import { playClick } from '../game/audio.js';
import { DIFFICULTY_CONFIG } from '../game/mapGenerator.js';
import { getTranslations } from '../i18n.js';

/**
 * Startskärm där spelaren väljer fordon, svårighetsgrad och om hinder ska vara aktiva.
 *
 * @param {{ onStart: (config: { vehicleId: string, difficulty: 1|2|3, obstacles: boolean }) => void,
 *           onHighscores: () => void,
 *           theme: 'dark'|'light',
 *           onToggleTheme: () => void }} props
 */
export default function GameSetup({ onStart, onHighscores, theme, onToggleTheme, lang, onToggleLang }) {
  const [vehicleId, setVehicleId] = useState('garbage');
  const [difficulty, setDifficulty] = useState(1);
  const [obstacles, setObstacles] = useState(false);

  const t = getTranslations(lang);
  const vehicles = Object.values(VEHICLES);

  return (
    <div style={styles.container}>
      {/* Top-right controls: language + theme */}
      <div style={styles.topControls}>
        <button
          onClick={() => { playClick(); onToggleLang(); }}
          style={styles.iconBtn}
          title={t.toggleLangTitle}
        >
          {lang === 'sv' ? '🇬🇧' : '🇸🇪'}
        </button>
        <button
          onClick={() => { playClick(); onToggleTheme(); }}
          style={styles.iconBtn}
          title={theme === 'dark' ? t.themeToLight : t.themeToDark}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      <h1 style={styles.title}>{t.appTitle}</h1>

      {/* Vehicle selection */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>{t.chooseVehicle}</h2>
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
              <span style={{ ...styles.vehicleEmoji, display: 'inline-block', transform: v.displayTransform }}>{v.emoji}</span>
              <span style={styles.vehicleName}>{t.vehicles[v.id]?.name ?? v.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Difficulty */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>{t.difficulty}</h2>
        <div style={styles.diffRow}>
          {[
            { level: 1, label: t.diffEasy },
            { level: 2, label: t.diffMedium },
            { level: 3, label: t.diffHard },
          ].map(({ level, label }) => {
            const stops = `${DIFFICULTY_CONFIG[level].activeStops} ${t.stops}`;
            return (
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
          );
          })}
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
          <span>{t.obstacles}: {obstacles ? t.obstaclesOn : t.obstaclesOff}</span>
        </button>
        {obstacles && (
          <p style={styles.obstacleHint}>
            {t.obstaclesHint}
          </p>
        )}
      </section>

      {/* Start */}
      <button
        onClick={() => { playClick(); onStart({ vehicleId, difficulty, obstacles }); }}
        style={{ ...styles.startButton, background: VEHICLES[vehicleId].color }}
      >
        {VEHICLES[vehicleId].emoji} {t.startGame}
      </button>

      <button onClick={() => { playClick(); onHighscores(); }} style={styles.highscoreButton}>
        {t.viewHighscores}
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
    paddingTop: 'max(clamp(16px, 4vw, 28px), env(safe-area-inset-top))',
    paddingBottom: 'calc(clamp(16px, 4vw, 28px) + env(safe-area-inset-bottom))',
    paddingLeft: 'max(clamp(12px, 4vw, 20px), env(safe-area-inset-left))',
    paddingRight: 'max(clamp(12px, 4vw, 20px), env(safe-area-inset-right))',
    gap: 'clamp(8px, 2vh, 18px)',
    overflowY: 'auto',
    position: 'relative',
  },
  topControls: {
    position: 'absolute',
    top: 12,
    right: 12,
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  iconBtn: {
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
    fontSize: 'clamp(13px, 2.5vw, 15px)',
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
    padding: 'clamp(12px, 3vw, 14px) 6px',
    borderRadius: 14,
    border: '3px solid transparent',
    cursor: 'pointer',
    gap: 6,
    minHeight: 'clamp(80px, 18vw, 100px)',
    transition: 'all 0.15s',
  },
  vehicleEmoji: { fontSize: 'clamp(30px, 8vw, 40px)' },
  vehicleName: { fontSize: 'clamp(11px, 2.5vw, 13px)', color: 'var(--c-text)', textAlign: 'center', fontWeight: 600 },
  diffRow: {
    display: 'flex',
    gap: 10,
  },
  diffButton: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 'clamp(10px, 2.5vw, 14px) 6px',
    borderRadius: 10,
    border: 'none',
    cursor: 'pointer',
    gap: 4,
  },
  diffLabel: { fontSize: 'clamp(14px, 3.5vw, 16px)', fontWeight: 700 },
  diffStops: { fontSize: 'clamp(11px, 2.2vw, 13px)', opacity: 0.7 },
  obstacleButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: '16px',
    borderRadius: 12,
    border: '2px solid transparent',
    fontSize: 'clamp(16px, 4vw, 20px)',
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
