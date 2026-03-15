/**
 * Translations for the Route Planner app.
 * Supported languages: 'sv' (Swedish, default) and 'en' (English).
 */
export const TRANSLATIONS = {
  sv: {
    appTitle: '🗺️ Ruttplaneraren',

    themeToLight: 'Byt till dagsläge',
    themeToDark: 'Byt till mörkt läge',
    toggleLangTitle: 'Switch to English',

    // GameSetup
    chooseVehicle: 'Välj fordon',
    difficulty: 'Svårighetsgrad',
    diffEasy: '⭐ Lätt',
    diffMedium: '⭐⭐ Medel',
    diffHard: '⭐⭐⭐ Svår',
    stops: 'stopp',
    obstacles: 'Hinder på vägen',
    obstaclesOn: 'PÅ',
    obstaclesOff: 'AV',
    obstaclesHint: '🌳 🪨 🚌 \u00a0Några vägar är blockerade!',
    startGame: 'Starta spelet!',
    viewHighscores: '🏆 Visa highscore',

    // GameMap
    back: '← Tillbaka',
    allStopsSelected: '✅ Alla stopp valda – tryck Kör!',
    tapStopsHint: (stopEmoji) => `Tryck i ordning på ${stopEmoji} du ska besöka`,
    go: 'Kör!',
    drivingRoute: 'Kör rutten...',

    // RouteResult
    shortest: '🟢 Kortaste',
    yourRoute: 'Din rutt',
    score: 'Poäng',
    tryAgain: '🔄 Försök igen',
    newMap: '🏠 Nytt spel',
    feedback: {
      perfect: '🎉 Perfekt rutt! Bästa möjliga väg!',
      great: '⭐⭐⭐ Toppen! Nästan kortaste vägen!',
      good: '👍 Bra jobbat! Här är kortaste vägen.',
      tryHarder: '💪 Försök igen – kolla kortaste vägen!',
    },

    // Highscores
    highscoresTitle: '🏆 Highscore',
    noScores: 'Inga poäng ännu!',
    playRound: 'Spela en runda för att komma upp här.',
    withObstacles: '🚧 Med hinder',
    withoutObstacles: '🛣️ Utan hinder',
    replayMap: '🔁 Spela om',
    dateLocale: 'sv-SE',

    // Vehicle names / missions / actions
    vehicles: {
      garbage:     { name: 'Sopbilen',        mission: 'Hämta alla sopor!',           action: 'Soporna hämtades!' },
      mail:        { name: 'Postbilen',        mission: 'Dela ut all post!',           action: 'Posten levererad!' },
      police:      { name: 'Polisbilen',       mission: 'Besök alla platser!',         action: 'Platsen säkrad!' },
      fire:        { name: 'Brandbilen',       mission: 'Släck alla bränder!',         action: 'Branden släckt!' },
      airplane:    { name: 'Flygplanet',       mission: 'Flyg till alla destinationer!', action: 'Destinationen nådd!' },
      train:       { name: 'Tåget',            mission: 'Stanna vid alla stationer!',  action: 'Stationen besökt!' },
      helicopter:  { name: 'Helikoptern',      mission: 'Nå alla landningsplatser!',   action: 'Landning klar!' },
      ambulance:   { name: 'Ambulansen',       mission: 'Hjälp alla patienter!',       action: 'Patienten hjälpt!' },
      schoolbus:   { name: 'Skolbussen',       mission: 'Hämta alla elever!',          action: 'Eleven ombord!' },
      motorcycle:  { name: 'Motorcykeln',      mission: 'Klara alla checkpoint!',      action: 'Checkpoint klarad!' },
      spaceinvader:{ name: 'Rymdinkräktaren',  mission: 'Invadera alla planeter!',     action: 'Planeten invaderad!' },
      pizza:       { name: 'Pizzamopeden',     mission: 'Leverera alla pizzor!',       action: 'Pizzan levererad!' },
    },
  },

  en: {
    appTitle: '🗺️ Route Planner',

    themeToLight: 'Switch to light mode',
    themeToDark: 'Switch to dark mode',
    toggleLangTitle: 'Byt till svenska',

    // GameSetup
    chooseVehicle: 'Choose vehicle',
    difficulty: 'Difficulty',
    diffEasy: '⭐ Easy',
    diffMedium: '⭐⭐ Medium',
    diffHard: '⭐⭐⭐ Hard',
    stops: 'stops',
    obstacles: 'Road obstacles',
    obstaclesOn: 'ON',
    obstaclesOff: 'OFF',
    obstaclesHint: '🌳 🪨 🚌 \u00a0Some roads are blocked!',
    startGame: 'Start game!',
    viewHighscores: '🏆 View highscores',

    // GameMap
    back: '← Back',
    allStopsSelected: '✅ All stops selected – tap Go!',
    tapStopsHint: (stopEmoji) => `Tap the ${stopEmoji} stops in order`,
    go: 'Go!',
    drivingRoute: 'Driving route...',

    // RouteResult
    shortest: '🟢 Shortest',
    yourRoute: 'Your route',
    score: 'Score',
    tryAgain: '🔄 Try again',
    newMap: '🏠 New game',
    feedback: {
      perfect: '🎉 Perfect route! Best possible path!',
      great: '⭐⭐⭐ Excellent! Almost the shortest route!',
      good: '👍 Good job! Here is the shortest route.',
      tryHarder: '💪 Try again – check the shortest route!',
    },

    // Highscores
    highscoresTitle: '🏆 Highscores',
    noScores: 'No scores yet!',
    playRound: 'Play a round to appear here.',
    withObstacles: '🚧 With obstacles',
    withoutObstacles: '🛣️ Without obstacles',
    replayMap: '🔁 Play again',
    dateLocale: 'en-GB',

    // Vehicle names / missions / actions
    vehicles: {
      garbage:     { name: 'Garbage truck',  mission: 'Collect all the garbage!',     action: 'Garbage collected!' },
      mail:        { name: 'Mail van',        mission: 'Deliver all the mail!',        action: 'Mail delivered!' },
      police:      { name: 'Police car',      mission: 'Visit all locations!',         action: 'Location secured!' },
      fire:        { name: 'Fire engine',     mission: 'Put out all fires!',           action: 'Fire extinguished!' },
      airplane:    { name: 'Airplane',        mission: 'Fly to all destinations!',     action: 'Destination reached!' },
      train:       { name: 'Train',           mission: 'Stop at all stations!',        action: 'Station visited!' },
      helicopter:  { name: 'Helicopter',      mission: 'Reach all landing pads!',      action: 'Landing complete!' },
      ambulance:   { name: 'Ambulance',       mission: 'Help all patients!',           action: 'Patient helped!' },
      schoolbus:   { name: 'School bus',      mission: 'Pick up all students!',        action: 'Student on board!' },
      motorcycle:  { name: 'Motorcycle',      mission: 'Clear all checkpoints!',       action: 'Checkpoint cleared!' },
      spaceinvader:{ name: 'Space invader',   mission: 'Invade all planets!',          action: 'Planet invaded!' },
      pizza:       { name: 'Pizza scooter',   mission: 'Deliver all pizzas!',          action: 'Pizza delivered!' },
    },
  },
};

/** @param {'sv'|'en'} lang @returns {typeof TRANSLATIONS.sv} */
export function getTranslations(lang) {
  return TRANSLATIONS[lang] ?? TRANSLATIONS.sv;
}
