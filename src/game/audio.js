/**
 * Spelljud via Web Audio API – ren syntes, inga ljudfiler, fungerar offline.
 * På iPad/Safari måste AudioContext startas efter en användargest;
 * detta löses automatiskt genom att alltid anropa ctx.resume() före uppspelning.
 */

let ctx = null;

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return ctx;
}

/**
 * Spela en sinuston (eller annan typ) med mjuk avklingning.
 * @param {number} freq      - Frekvens i Hz
 * @param {number} duration  - Längd i sekunder
 * @param {string} type      - OscillatorNode.type ('sine'|'square'|'triangle'|'sawtooth')
 * @param {number} volume    - Maxvolym [0, 1]
 * @param {number} delay     - Fördröjning i sekunder relativt currentTime
 */
function tone(freq, duration, type = 'sine', volume = 0.35, delay = 0) {
  const ac = getCtx();
  const t = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

async function resume() {
  const ac = getCtx();
  if (ac.state === 'suspended') await ac.resume();
}

// ─── Publik API ───────────────────────────────────────────────────────────────

/** Klick-ljud för knappar och menyer */
export async function playClick() {
  await resume();
  tone(900, 0.04, 'square', 0.12);
}

/** Tapp på en stopppunkt i kartan */
export async function playNodeTap() {
  await resume();
  tone(660, 0.06, 'sine', 0.25);
  tone(880, 0.08, 'sine', 0.18, 0.06);
}

/** Avmarkering av en stopppunkt */
export async function playNodeDeselect() {
  await resume();
  tone(440, 0.07, 'sine', 0.2);
  tone(330, 0.1,  'sine', 0.15, 0.07);
}

/** Fordonet anländer till ett stopp under animationen */
export async function playStopArrival() {
  await resume();
  // Uppåtgående dur-arpeggio: C5 – E5 – G5
  tone(523, 0.12, 'sine', 0.40, 0.00);
  tone(659, 0.12, 'sine', 0.35, 0.11);
  tone(784, 0.22, 'sine', 0.40, 0.22);
}

/**
 * Fanfar när animationen är klar.
 * Skalan anpassas efter poäng:
 *   100      → perfekt fanfar (C–E–G–C')
 *   ≥ 90     → tre stigande toner
 *   ≥ 65     → två toner
 *   < 65     → fallande tröst-tonpar
 */
export async function playRouteComplete(score) {
  await resume();
  if (score === 100) {
    // Perfekt – glädjefull fanfar
    tone(523,  0.15, 'sine', 0.40, 0.00);
    tone(659,  0.15, 'sine', 0.40, 0.16);
    tone(784,  0.15, 'sine', 0.40, 0.32);
    tone(1047, 0.50, 'sine', 0.50, 0.48);
  } else if (score >= 90) {
    // Tre stigande toner
    tone(523, 0.15, 'sine', 0.35, 0.00);
    tone(659, 0.15, 'sine', 0.35, 0.16);
    tone(784, 0.35, 'sine', 0.40, 0.32);
  } else if (score >= 65) {
    // Två toner – bra jobbat
    tone(440, 0.15, 'sine', 0.30, 0.00);
    tone(523, 0.30, 'sine', 0.30, 0.16);
  } else {
    // Fallande par – tröst / försök igen
    tone(440, 0.20, 'sine', 0.25, 0.00);
    tone(370, 0.30, 'sine', 0.25, 0.20);
  }
}
