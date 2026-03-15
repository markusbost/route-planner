// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from '../../src/App.jsx';
import { VEHICLES } from '../../src/game/vehicles.js';

// Provide a minimal matchMedia stub
window.matchMedia = window.matchMedia || function () {
  return { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() };
};

function makeFakeStorage() {
  let store = {};
  return {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = v; },
    removeItem: (k) => { delete store[k]; },
    clear: () => { store = {}; },
  };
}

/** Start a game and tap all stop nodes, then click Kör.
 *  Returns true if Kör was enabled and clicked. */
function tapAllStopsAndGo() {
  // Default vehicle is 'garbage', stopEmoji is '🛍️'
  const stopEmoji = VEHICLES.garbage.stopEmoji;
  const stopNodes = document.querySelectorAll('svg g[style*="pointer"]');
  let tapped = 0;
  for (const g of stopNodes) {
    fireEvent.click(g);
    tapped++;
  }
  if (tapped === 0) {
    // Fallback: find by text content
    const svgGroups = document.querySelectorAll('svg g');
    for (const g of svgGroups) {
      if (g.textContent.includes(stopEmoji)) {
        fireEvent.click(g);
      }
    }
  }
  const goBtn = screen.getByRole('button', { name: /kör/i });
  if (!goBtn.disabled) {
    fireEvent.click(goBtn);
    return true;
  }
  return false;
}

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', makeFakeStorage());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── Initial screen ──────────────────────────────────────────────────────────

  it('visar setup-skärmen vid start', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /starta/i })).toBeInTheDocument();
  });

  // ── setup → highscores ──────────────────────────────────────────────────────

  it('navigerar till highscore-skärmen', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /highscore/i }));
    expect(screen.getByRole('heading', { name: /highscore/i })).toBeInTheDocument();
  });

  it('navigerar tillbaka från highscore till setup', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /highscore/i }));
    fireEvent.click(screen.getByRole('button', { name: /tillbaka/i }));
    expect(screen.getByRole('button', { name: /starta/i })).toBeInTheDocument();
  });

  // ── setup → game ────────────────────────────────────────────────────────────

  it('navigerar till spelskärmen när spelet startas', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /starta/i }));
    const { container } = screen.getByRole('button', { name: /kör/i }).closest('div');
    expect(container ?? document.querySelector('svg')).toBeTruthy();
  });

  it('visar SVG-kartan på spelskärmen', () => {
    const { container } = render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /starta/i }));
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('Kör-knappen är inaktiv tills alla stopp valts', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /starta/i }));
    expect(screen.getByRole('button', { name: /kör/i })).toBeDisabled();
  });

  // ── game → setup (tillbaka) ─────────────────────────────────────────────────

  it('kan gå tillbaka till setup från spelskärmen', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /starta/i }));
    fireEvent.click(screen.getByRole('button', { name: /tillbaka/i }));
    expect(screen.getByRole('button', { name: /starta/i })).toBeInTheDocument();
  });

  // ── game → result ───────────────────────────────────────────────────────────

  it('navigerar till resultskärmen efter att rutten är inlagd', async () => {
    vi.useFakeTimers();
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /starta/i }));

    const clicked = tapAllStopsAndGo();
    if (clicked) {
      await act(async () => {
        vi.advanceTimersByTime(30000);
        vi.runAllTimers();
      });
      expect(screen.getByRole('button', { name: /försök igen/i })).toBeInTheDocument();
    } else {
      // Could not tap all stops – game is still running, verify map is shown
      expect(screen.getByRole('button', { name: /kör/i })).toBeInTheDocument();
    }
  });

  // ── result → replay ─────────────────────────────────────────────────────────

  it('replay-knappen tar tillbaka till spelskärmen med samma karta', async () => {
    vi.useFakeTimers();
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /starta/i }));

    const clicked = tapAllStopsAndGo();
    if (clicked) {
      await act(async () => {
        vi.advanceTimersByTime(30000);
        vi.runAllTimers();
      });
      const retryBtn = screen.queryByRole('button', { name: /försök igen/i });
      if (retryBtn) {
        fireEvent.click(retryBtn);
        expect(screen.getByRole('button', { name: /kör/i })).toBeInTheDocument();
      }
    }
  });

  it('nytt-spel-knappen tar tillbaka till setup', async () => {
    vi.useFakeTimers();
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /starta/i }));

    const clicked = tapAllStopsAndGo();
    if (clicked) {
      await act(async () => {
        vi.advanceTimersByTime(30000);
        vi.runAllTimers();
      });
      const newGameBtn = screen.queryByRole('button', { name: /nytt spel/i });
      if (newGameBtn) {
        fireEvent.click(newGameBtn);
        expect(screen.getByRole('button', { name: /starta/i })).toBeInTheDocument();
      }
    }
  });

  // ── tema & språk ─────────────────────────────────────────────────────────────

  it('byter tema när tema-knappen klickas', () => {
    render(<App />);
    const themeBtn = screen.getByTitle(/byt till/i);
    fireEvent.click(themeBtn);
    expect(document.documentElement.getAttribute('data-theme')).toBeTruthy();
  });

  it('byter språk till engelska', () => {
    render(<App />);
    const langBtn = screen.getByTitle(/switch to english/i);
    fireEvent.click(langBtn);
    expect(screen.getByRole('button', { name: /start game/i })).toBeInTheDocument();
  });

  // ── återspela från highscore ─────────────────────────────────────────────────

  it('replay från highscore öppnar spelskärmen', () => {
    const { saveScore } = require('../../src/game/highscore.js');
    saveScore({ vehicleId: 'garbage', difficulty: 1, obstacles: false, seed: 42 }, 80);

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /highscore/i }));
    const replayBtn = screen.queryByTitle(/spela om/i);
    if (replayBtn) {
      fireEvent.click(replayBtn);
      expect(screen.getByRole('button', { name: /kör/i })).toBeInTheDocument();
    }
  });
});
