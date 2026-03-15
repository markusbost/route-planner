// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import RouteResult from '../../src/components/RouteResult.jsx';
import { generateMap } from '../../src/game/mapGenerator.js';

const mapData = generateMap({ seed: 42, difficulty: 1, obstacles: false });
// Construct a minimal valid player route: depot → all stops → depot
const playerRoute = [mapData.depot, ...mapData.stops, mapData.depot];

const defaultProps = {
  mapData,
  playerRoute,
  gameConfig: { vehicleId: 'garbage', difficulty: 1, obstacles: false, seed: 42 },
  onReplay: vi.fn(),
  onNewGame: vi.fn(),
  lang: 'sv',
};

// Helper: render and fast-forward past the vehicle animation
async function renderAndComplete(props = defaultProps) {
  vi.useFakeTimers();
  render(<RouteResult {...props} />);
  await act(async () => {
    // Advance 20 seconds simulation – enough for any route at 120 px/s
    vi.advanceTimersByTime(20000);
  });
  vi.useRealTimers();
}

describe('RouteResult', () => {
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

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renderar utan fel', () => {
    render(<RouteResult {...defaultProps} />);
  });

  it('renderar SVG-kartan', () => {
    const { container } = render(<RouteResult {...defaultProps} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('visar försök-igen-knapp efter animation', async () => {
    await renderAndComplete();
    expect(screen.getByRole('button', { name: /försök igen/i })).toBeInTheDocument();
  });

  it('visar nytt-spel-knapp efter animation', async () => {
    await renderAndComplete();
    expect(screen.getByRole('button', { name: /nytt spel/i })).toBeInTheDocument();
  });

  it('anropar onReplay vid klick på försök igen', async () => {
    const onReplay = vi.fn();
    await renderAndComplete({ ...defaultProps, onReplay });
    fireEvent.click(screen.getByRole('button', { name: /försök igen/i }));
    expect(onReplay).toHaveBeenCalledOnce();
  });

  it('anropar onNewGame vid klick på nytt spel', async () => {
    const onNewGame = vi.fn();
    await renderAndComplete({ ...defaultProps, onNewGame });
    fireEvent.click(screen.getByRole('button', { name: /nytt spel/i }));
    expect(onNewGame).toHaveBeenCalledOnce();
  });

  it('renderar med hinder och annan fordonstyp', () => {
    const mapObs = generateMap({ seed: 7, difficulty: 1, obstacles: true });
    const route = [mapObs.depot, ...mapObs.stops, mapObs.depot];
    const { container } = render(
      <RouteResult
        {...defaultProps}
        mapData={mapObs}
        playerRoute={route}
        gameConfig={{ vehicleId: 'fire', difficulty: 1, obstacles: true, seed: 7 }}
      />
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renderar korrekt med engelska (lang=en)', async () => {
    await renderAndComplete({ ...defaultProps, lang: 'en' });
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
});
