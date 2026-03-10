import { describe, it, expect } from 'vitest';
import { VEHICLES, getVehicleIds, getVehicle } from '../../src/game/vehicles.js';

const EXPECTED_IDS = ['garbage', 'mail', 'police', 'fire', 'airplane', 'train', 'helicopter', 'ambulance', 'schoolbus', 'motorcycle', 'containership', 'pizza'];

describe('VEHICLES', () => {
  it('contains exactly the expected vehicle IDs', () => {
    expect(Object.keys(VEHICLES).sort()).toEqual([...EXPECTED_IDS].sort());
  });

  it.each(EXPECTED_IDS)('%s has all required fields', (id) => {
    const v = VEHICLES[id];
    expect(v).toHaveProperty('id', id);
    expect(v).toHaveProperty('name');
    expect(v).toHaveProperty('emoji');
    expect(v).toHaveProperty('stopEmoji');
    expect(v).toHaveProperty('completedEmoji');
    expect(v).toHaveProperty('color');
    expect(v).toHaveProperty('depotEmoji');
    expect(v).toHaveProperty('mission');
    expect(v).toHaveProperty('action');
  });

  it.each(EXPECTED_IDS)('%s color is a valid CSS hex string', (id) => {
    expect(VEHICLES[id].color).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it.each(EXPECTED_IDS)('%s string fields are non-empty', (id) => {
    const v = VEHICLES[id];
    for (const field of ['name', 'emoji', 'stopEmoji', 'completedEmoji', 'depotEmoji', 'mission', 'action']) {
      expect(typeof v[field]).toBe('string');
      expect(v[field].length).toBeGreaterThan(0);
    }
  });

  it.each(EXPECTED_IDS)('%s emoji fields contain no corrupted characters (U+FFFD)', (id) => {
    const v = VEHICLES[id];
    for (const field of ['emoji', 'stopEmoji', 'completedEmoji', 'depotEmoji']) {
      expect(v[field]).not.toContain('\uFFFD');
    }
  });

  it.each(EXPECTED_IDS)('%s has unique emojis across emoji, stopEmoji, completedEmoji and depotEmoji', (id) => {
    const v = VEHICLES[id];
    const emojis = [v.emoji, v.stopEmoji, v.completedEmoji, v.depotEmoji];
    const unique = new Set(emojis);
    expect(unique.size).toBe(emojis.length);
  });

  it.each(EXPECTED_IDS)('%s depotEmoji differs from stopEmoji', (id) => {
    const v = VEHICLES[id];
    expect(v.depotEmoji).not.toBe(v.stopEmoji);
  });

  it.each(EXPECTED_IDS)('%s completedEmoji differs from stopEmoji', (id) => {
    const v = VEHICLES[id];
    expect(v.completedEmoji).not.toBe(v.stopEmoji);
  });
});

describe('getVehicleIds', () => {
  it('returns the correct list of IDs', () => {
    expect(getVehicleIds().sort()).toEqual([...EXPECTED_IDS].sort());
  });

  it('returns an array of strings', () => {
    getVehicleIds().forEach((id) => expect(typeof id).toBe('string'));
  });
});

describe('getVehicle', () => {
  it.each(EXPECTED_IDS)('returns the correct vehicle for id "%s"', (id) => {
    expect(getVehicle(id)).toBe(VEHICLES[id]);
  });

  it('returns null for an unknown id', () => {
    expect(getVehicle('unknown')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(getVehicle('')).toBeNull();
  });
});
