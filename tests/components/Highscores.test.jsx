// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Highscores from '../../src/components/Highscores.jsx';
import { saveScore } from '../../src/game/highscore.js';

const defaultProps = {
  onBack: vi.fn(),
  onReplay: vi.fn(),
  lang: 'sv',
};

describe('Highscores', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', (() => {
      let store = {};
      return {
        getItem: (k) => store[k] ?? null,
        setItem: (k, v) => { store[k] = v; },
        removeItem: (k) => { delete store[k]; },
        clear: () => { store = {}; },
      };
    })());
  });

  it('renderar utan fel', () => {
    render(<Highscores {...defaultProps} />);
  });

  it('visar tom-state när inga poäng finns', () => {
    render(<Highscores {...defaultProps} />);
    expect(screen.getByText(/inga poäng/i)).toBeInTheDocument();
  });

  it('visar highscore-rubrik', () => {
    render(<Highscores {...defaultProps} />);
    expect(screen.getByRole('heading', { name: /highscore/i })).toBeInTheDocument();
  });

  it('anropar onBack vid klick på tillbaka-knapp', () => {
    const onBack = vi.fn();
    render(<Highscores {...defaultProps} onBack={onBack} />);
    fireEvent.click(screen.getByRole('button', { name: /tillbaka/i }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('visar sparade poäng', () => {
    saveScore({ vehicleId: 'garbage', difficulty: 1, obstacles: false, seed: 123 }, 87);
    render(<Highscores {...defaultProps} />);
    expect(screen.getByText('87%')).toBeInTheDocument();
  });

  it('visar replay-knapp för sparade poster', () => {
    saveScore({ vehicleId: 'garbage', difficulty: 1, obstacles: false, seed: 123 }, 87);
    render(<Highscores {...defaultProps} />);
    expect(screen.getByTitle(/spela om/i)).toBeInTheDocument();
  });

  it('anropar onReplay med rätt entry-data', () => {
    const onReplay = vi.fn();
    saveScore({ vehicleId: 'garbage', difficulty: 1, obstacles: false, seed: 999 }, 75);
    render(<Highscores {...defaultProps} onReplay={onReplay} />);
    fireEvent.click(screen.getByTitle(/spela om/i));
    expect(onReplay).toHaveBeenCalledWith(
      expect.objectContaining({ seed: 999, vehicleId: 'garbage', difficulty: 1 })
    );
  });

  it('renderar korrekt med engelska (lang=en)', () => {
    render(<Highscores {...defaultProps} lang="en" />);
    expect(screen.getByText(/no scores yet/i)).toBeInTheDocument();
  });

  it('visar svårighetsväljar-knappar', () => {
    render(<Highscores {...defaultProps} />);
    expect(screen.getByRole('button', { name: /lätt/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /medel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /svår/i })).toBeInTheDocument();
  });
});
