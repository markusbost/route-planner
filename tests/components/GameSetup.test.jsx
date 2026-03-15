// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GameSetup from '../../src/components/GameSetup.jsx';
import { VEHICLES } from '../../src/game/vehicles.js';
import { DIFFICULTY_CONFIG } from '../../src/game/mapGenerator.js';

const defaultProps = {
  onStart: vi.fn(),
  onHighscores: vi.fn(),
  theme: 'dark',
  onToggleTheme: vi.fn(),
  lang: 'sv',
  onToggleLang: vi.fn(),
};

describe('GameSetup', () => {
  it('renderar utan fel', () => {
    render(<GameSetup {...defaultProps} />);
  });

  it('visar en knapp för varje fordon', () => {
    render(<GameSetup {...defaultProps} />);
    const vehicleIds = Object.keys(VEHICLES);
    vehicleIds.forEach((id) => {
      // Match by vehicle name text (more reliable than emoji regex)
      expect(
        screen.getByRole('button', { name: new RegExp(VEHICLES[id].name) })
      ).toBeInTheDocument();
    });
  });

  it('visar svårighetsknappar för alla nivåer', () => {
    render(<GameSetup {...defaultProps} />);
    Object.keys(DIFFICULTY_CONFIG).forEach((level) => {
      // Each difficulty level has a button with its stop count
      const stops = DIFFICULTY_CONFIG[level].activeStops;
      expect(screen.getByText(new RegExp(String(stops)))).toBeInTheDocument();
    });
  });

  it('anropar onStart när spelet startas', () => {
    const onStart = vi.fn();
    render(<GameSetup {...defaultProps} onStart={onStart} />);
    fireEvent.click(screen.getByRole('button', { name: /starta/i }));
    expect(onStart).toHaveBeenCalledOnce();
    expect(onStart).toHaveBeenCalledWith(
      expect.objectContaining({ vehicleId: expect.any(String), difficulty: expect.any(Number) })
    );
  });

  it('anropar onHighscores vid klick på highscore-knapp', () => {
    const onHighscores = vi.fn();
    render(<GameSetup {...defaultProps} onHighscores={onHighscores} />);
    fireEvent.click(screen.getByRole('button', { name: /highscore/i }));
    expect(onHighscores).toHaveBeenCalledOnce();
  });

  it('anropar onToggleTheme vid klick på temabyte', () => {
    const onToggleTheme = vi.fn();
    render(<GameSetup {...defaultProps} onToggleTheme={onToggleTheme} />);
    fireEvent.click(screen.getByTitle(/byt till/i));
    expect(onToggleTheme).toHaveBeenCalledOnce();
  });

  it('renderar korrekt med engelska (lang=en)', () => {
    render(<GameSetup {...defaultProps} lang="en" />);
    expect(screen.getByRole('button', { name: /start game/i })).toBeInTheDocument();
  });
});
