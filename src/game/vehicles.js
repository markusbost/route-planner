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
};

/** @returns {string[]} lista med alla fordons-IDs */
export function getVehicleIds() {
  return Object.keys(VEHICLES);
}

/** @param {string} id @returns {Object} */
export function getVehicle(id) {
  return VEHICLES[id] ?? null;
}
