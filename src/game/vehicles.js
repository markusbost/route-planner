/**
 * Fordonstyper med tillhörande metadata.
 * color används för kartan och UI-accenter.
 */
export const VEHICLES = {
  garbage: {
    id: 'garbage',
    name: 'Sopbilen',
    emoji: '🚛',
    stopEmoji: '🗑️',
    completedEmoji: '✅',
    color: '#4caf50',
    depotEmoji: '🏭',
    mission: 'Hämta alla sopor!',
    action: 'Soporna hämtades!',
  },
  mail: {
    id: 'mail',
    name: 'Postbilen',
    emoji: '🚐',
    stopEmoji: '📬',
    completedEmoji: '📨',
    color: '#2196f3',
    depotEmoji: '🏢',
    mission: 'Dela ut all post!',
    action: 'Posten levererad!',
  },
  police: {
    id: 'police',
    name: 'Polisbilen',
    emoji: '🚓',
    stopEmoji: '📍',
    completedEmoji: '🚨',
    color: '#1565c0',
    depotEmoji: '🚔',
    mission: 'Besök alla platser!',
    action: 'Platsen säkrad!',
  },
  fire: {
    id: 'fire',
    name: 'Brandbilen',
    emoji: '🚒',
    stopEmoji: '🔥',
    completedEmoji: '💧',
    color: '#f44336',
    depotEmoji: '🏚️',
    mission: 'Släck alla bränder!',
    action: 'Branden släckt!',
  },
  airplane: {
    id: 'airplane',
    name: 'Flygplanet',
    emoji: '🛩️',
    stopEmoji: '🏝️',
    completedEmoji: '🛬',
    color: '#00bcd4',
    depotEmoji: '🛫',
    mission: 'Flyg till alla destinationer!',
    action: 'Destinationen nådd!',
    facingAngle: 0,
    displayTransform: 'scaleX(-1)',
  },
  train: {
    id: 'train',
    name: 'Tåget',
    emoji: '🚂',
    stopEmoji: '🚉',
    completedEmoji: '🎫',
    color: '#9c27b0',
    depotEmoji: '🏗️',
    mission: 'Stanna vid alla stationer!',
    action: 'Stationen besökt!',
  },
  helicopter: {
    id: 'helicopter',
    name: 'Helikoptern',
    emoji: '🚁',
    stopEmoji: '🎯',
    completedEmoji: '✅',
    color: '#ff9800',
    depotEmoji: '🛬',
    mission: 'Nå alla landningsplatser!',
    action: 'Landning klar!',
  },
  ambulance: {
    id: 'ambulance',
    name: 'Ambulansen',
    emoji: '🚑',
    stopEmoji: '🏥',
    completedEmoji: '❤️',
    color: '#e91e63',
    depotEmoji: '🏨',
    mission: 'Hjälp alla patienter!',
    action: 'Patienten hjälpt!',
  },
};

/** @returns {string[]} lista med alla fordons-IDs */
export function getVehicleIds() {
  return Object.keys(VEHICLES);
}

/** @param {string} id @returns {Object} */
export function getVehicle(id) {
  return VEHICLES[id] ?? null;
}
