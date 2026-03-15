import { describe, it, expect } from 'vitest';
import { TRANSLATIONS, getTranslations } from '../../src/i18n.js';

const LANGS = Object.keys(TRANSLATIONS);
const sv = TRANSLATIONS.sv;
const en = TRANSLATIONS.en;

// Collect all leaf key paths from an object (dot-separated)
function leafPaths(obj, prefix = '') {
  const paths = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && typeof obj[key] !== 'function') {
      paths.push(...leafPaths(obj[key], fullKey));
    } else {
      paths.push(fullKey);
    }
  }
  return paths;
}

describe('i18n', () => {
  it('exporterar TRANSLATIONS med sv och en', () => {
    expect(LANGS).toContain('sv');
    expect(LANGS).toContain('en');
  });

  it('sv och en har exakt samma nycklar', () => {
    const svKeys = leafPaths(sv).sort();
    const enKeys = leafPaths(en).sort();
    expect(svKeys).toEqual(enKeys);
  });

  it('alla strängar i sv är icke-tomma', () => {
    const paths = leafPaths(sv);
    for (const path of paths) {
      const parts = path.split('.');
      let val = sv;
      for (const p of parts) val = val[p];
      if (typeof val === 'string') {
        expect(val.trim(), `sv.${path} är tom`).not.toBe('');
      }
    }
  });

  it('alla strängar i en är icke-tomma', () => {
    const paths = leafPaths(en);
    for (const path of paths) {
      const parts = path.split('.');
      let val = en;
      for (const p of parts) val = val[p];
      if (typeof val === 'string') {
        expect(val.trim(), `en.${path} är tom`).not.toBe('');
      }
    }
  });

  it('getTranslations returnerar sv som default', () => {
    const t = getTranslations('sv');
    expect(t).toBe(sv);
  });

  it('getTranslations returnerar en', () => {
    const t = getTranslations('en');
    expect(t).toBe(en);
  });

  it('getTranslations faller tillbaka på sv för okänt språk', () => {
    const t = getTranslations('de');
    expect(t).toBe(sv);
  });

  it('tapStopsHint är en funktion som tar ett emoji-argument', () => {
    expect(typeof sv.tapStopsHint).toBe('function');
    expect(typeof en.tapStopsHint).toBe('function');
    expect(sv.tapStopsHint('🛍️')).toContain('🛍️');
    expect(en.tapStopsHint('🛍️')).toContain('🛍️');
  });

  it('alla fordonsnycklar i sv och en är identiska', () => {
    const svVehicles = Object.keys(sv.vehicles).sort();
    const enVehicles = Object.keys(en.vehicles).sort();
    expect(svVehicles).toEqual(enVehicles);
  });

  it('varje fordon har name, mission och action i båda språken', () => {
    for (const id of Object.keys(sv.vehicles)) {
      expect(sv.vehicles[id].name.trim(), `sv.vehicles.${id}.name`).not.toBe('');
      expect(sv.vehicles[id].mission.trim(), `sv.vehicles.${id}.mission`).not.toBe('');
      expect(sv.vehicles[id].action.trim(), `sv.vehicles.${id}.action`).not.toBe('');
      expect(en.vehicles[id].name.trim(), `en.vehicles.${id}.name`).not.toBe('');
      expect(en.vehicles[id].mission.trim(), `en.vehicles.${id}.mission`).not.toBe('');
      expect(en.vehicles[id].action.trim(), `en.vehicles.${id}.action`).not.toBe('');
    }
  });
});
