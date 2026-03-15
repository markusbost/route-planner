import { useState } from 'react';
import { VEHICLES, getVehicle } from '../game/vehicles.js';
import { getTopScores } from '../game/highscore.js';
import { scoreToStars } from '../game/scoring.js';
import { getTranslations } from '../i18n.js';

/**
 * Visar topplista (max 10 poster) för valt fordon och svårighetsgrad.
 * Poäng hämtas från localStorage via `getTopScores`.
 *
 * @param {{ onBack: () => void }} props
 */
export default function Highscores({ onBack, lang }) {
  const vehicles = Object.values(VEHICLES);
  const [vehicleId, setVehicleId] = useState('garbage');
  const [difficulty, setDifficulty] = useState(1);

  const t = getTranslations(lang);
  const vehicle = getVehicle(vehicleId);
  const scores = getTopScores(vehicleId, difficulty, 10);

  return (
    <div className="screen-full" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backBtn}>
          {t.back}
        </button>
        <h1 style={styles.title}>{t.highscoresTitle}</h1>
        <div style={{ width: 80 }} />
      </div>

      {/* Vehicle tabs */}
      <div style={styles.tabs}>
        {vehicles.map((v) => (
          <button
            key={v.id}
            onClick={() => setVehicleId(v.id)}
            style={{
              ...styles.tab,
              borderBottom:
                vehicleId === v.id
                  ? `4px solid ${v.color}`
                  : '4px solid transparent',
              opacity: vehicleId === v.id ? 1 : 0.5,
            }}
          >
            {v.emoji}
          </button>
        ))}
      </div>

      {/* Difficulty */}
      <div style={styles.diffRow}>
        {[
          { level: 1, label: t.diffEasy },
          { level: 2, label: t.diffMedium },
          { level: 3, label: t.diffHard },
        ].map(({ level, label }) => (
          <button
            key={level}
            onClick={() => setDifficulty(level)}
            style={{
              ...styles.diffBtn,
              background: difficulty === level ? vehicle.color : 'var(--c-card)',
              color: 'var(--c-text)',
              fontWeight: difficulty === level ? 800 : 400,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Score list */}
      <div style={styles.list}>
        {scores.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ fontSize: 40, marginBottom: 12, display: 'inline-block', transform: vehicle.displayTransform }}>{vehicle.emoji}</p>
            <p>{t.noScores}</p>
            <p style={{ opacity: 0.5, fontSize: 14, marginTop: 6 }}>
              {t.playRound}
            </p>
          </div>
        ) : (
          scores.map((entry, i) => {
            const stars = scoreToStars(entry.score);
            const medals = ['🥇', '🥈', '🥉'];
            return (
              <div key={i} style={styles.row}>
                <span style={styles.medal}>{medals[i] ?? `${i + 1}.`}</span>
                <div style={styles.rowInfo}>
                  <div style={styles.rowTop}>
                    <span style={{ ...styles.scoreText, color: vehicle.color }}>
                      {entry.score}%
                    </span>
                    <span style={{ fontSize: 18 }}>
                      {'⭐'.repeat(stars)}
                      {'☆'.repeat(3 - stars)}
                    </span>
                  </div>
                  <div style={styles.rowMeta}>
                    <span>{entry.obstacles ? t.withObstacles : t.withoutObstacles}</span>
                    <span style={{ opacity: 0.4 }}>
                      {new Date(entry.date).toLocaleDateString(t.dateLocale)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
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
    paddingTop: 'max(12px, env(safe-area-inset-top))',
    paddingBottom: 12,
    paddingLeft: 'max(16px, env(safe-area-inset-left))',
    paddingRight: 'max(16px, env(safe-area-inset-right))',
    background: 'var(--c-surface)',
    flexShrink: 0,
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
  title: {
    fontSize: 22,
    fontWeight: 900,
  },
  tabs: {
    display: 'flex',
    justifyContent: 'center',
    gap: 0,
    background: 'var(--c-surface)',
    flexShrink: 0,
    paddingBottom: 0,
  },
  tab: {
    flex: 1,
    maxWidth: 100,
    background: 'transparent',
    border: 'none',
    fontSize: 34,
    cursor: 'pointer',
    padding: '10px 0 8px',
    transition: 'all 0.15s',
  },
  diffRow: {
    display: 'flex',
    gap: 8,
    padding: '12px 16px',
    background: 'var(--c-surface2)',
    flexShrink: 0,
  },
  diffBtn: {
    flex: 1,
    padding: '10px 4px',
    borderRadius: 8,
    border: 'none',
    fontSize: 13,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    paddingTop: 12,
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
  },
  empty: {
    textAlign: 'center',
    marginTop: 60,
    fontSize: 18,
    opacity: 0.6,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 16px',
    background: 'var(--c-card-alt)',
    borderRadius: 12,
    marginBottom: 8,
  },
  medal: {
    fontSize: 28,
    width: 36,
    textAlign: 'center',
    flexShrink: 0,
  },
  rowInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  rowTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreText: {
    fontSize: 26,
    fontWeight: 900,
  },
  rowMeta: {
    display: 'flex',
    gap: 12,
    fontSize: 12,
    opacity: 0.6,
  },
};
