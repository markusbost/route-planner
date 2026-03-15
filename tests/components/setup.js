import { vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Mock Web Audio API – inte tillgänglig i happy-dom
vi.mock('../../src/game/audio.js', () => ({
  playClick: vi.fn(),
  playNodeTap: vi.fn(),
  playNodeDeselect: vi.fn(),
  playStopArrival: vi.fn(),
  playRouteComplete: vi.fn(),
  resume: vi.fn(),
}));

// Stub navigator.vibrate
Object.defineProperty(navigator, 'vibrate', {
  value: vi.fn(),
  writable: true,
});

// requestAnimationFrame mock that passes incrementing timestamps
// so animation delta calculations produce finite values
let _rafTime = 0;
globalThis.requestAnimationFrame = (cb) => {
  const id = setTimeout(() => {
    _rafTime += 16;
    cb(_rafTime);
  }, 16);
  return id;
};
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);

// Reset rafTime before each test
beforeEach(() => { _rafTime = 0; });
