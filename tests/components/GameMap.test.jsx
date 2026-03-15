// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GameMap from '../../src/components/GameMap.jsx';
import { generateMap } from '../../src/game/mapGenerator.js';

const mapData = generateMap({ seed: 42, difficulty: 1, obstacles: false });

const defaultProps = {
  mapData,
  vehicleId: 'garbage',
  onFinish: vi.fn(),
  onBack: vi.fn(),
  lang: 'sv',
};

describe('GameMap', () => {
  it('renderar utan fel', () => {
    render(<GameMap {...defaultProps} />);
  });

  it('renderar SVG-kartan', () => {
    const { container } = render(<GameMap {...defaultProps} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('visar tillbaka-knapp', () => {
    render(<GameMap {...defaultProps} />);
    expect(screen.getByRole('button', { name: /tillbaka/i })).toBeInTheDocument();
  });

  it('anropar onBack vid klick på tillbaka', () => {
    const onBack = vi.fn();
    render(<GameMap {...defaultProps} onBack={onBack} />);
    fireEvent.click(screen.getByRole('button', { name: /tillbaka/i }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('Kör-knappen är inaktiv tills alla stopp valts', () => {
    render(<GameMap {...defaultProps} />);
    const goBtn = screen.getByRole('button', { name: /kör/i });
    expect(goBtn).toBeDisabled();
  });

  it('renderar med hinder aktiverade', () => {
    const mapWithObstacles = generateMap({ seed: 42, difficulty: 1, obstacles: true });
    render(<GameMap {...defaultProps} mapData={mapWithObstacles} />);
    const { container } = render(<GameMap {...defaultProps} mapData={mapWithObstacles} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renderar korrekt med engelska (lang=en)', () => {
    render(<GameMap {...defaultProps} lang="en" />);
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
  });
});
