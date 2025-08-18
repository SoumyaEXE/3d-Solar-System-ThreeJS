// i18n/fr.js - French Translations

export const fr = {
  // UI Controls and Buttons
  ui: {
    controls: {
      missionControl: "Contrôle Mission",
      speed: "Vitesse (Temps Terrestre)",      
      pause: "Pause",
      resume: "Reprendre",
      reset: "Réinitialiser",
      hideUI: "Masquer Interface",
      showUI: "Afficher Interface",
      cameraControl: "Contrôle Caméra",     
      atmosphere: "Atmosphère",
      music: "🎵 Musique",
      mute: "🔇 Muet",
      toggle: "Basculer",
      orbits: "Orbites",
      moons: "Lunes",
      bloom: "Luminosité",
      realAsteroids: "Astéroïdes Réels",
      comets: "Comètes",
      asteroidBelts: "Ceintures d'Astéroïdes",
      allBelts: "Toutes les Ceintures",
      mainBelt: "Ceinture Principale",
      trojans: "Troyens",
      kuiper: "Kuiper",
      scattered: "Dispersés",
      autoBloom: "Luminosité Auto",
      manualBloom: "Luminosité Manuelle",
      language: "Langue"
    },
    labels: {
        realearthtime: "0x Temps Terrestre Réel",
        slowearthtime: "x Lent",
        fastearthtime: "x Rapide",
        discovered: "Découvert",
        distance: "Distance",
        size: "Taille",
        unknown: "Inconnu",
        planetRadii: 'rayon de planète',
        follow: "Suivre"
    },

    celestialBodies: "Corps Célestes",
    showPlanetNames: "Afficher Noms Planètes",
    hidePlanetNames: "Masquer Noms Planètes",
    showMoonNames: "Afficher Noms Lunes",
    hideMoonNames: "Masquer Noms Lunes",
    
    categories: {
      planets: "🪐 PLANÈTES",
      dwarfPlanets: "🌍 PLANÈTES NAINES",
      majorAsteroids: "☄️ ASTÉROÏDES MAJEURS",
      transNeptunianObjects: "🌌 OBJETS TRANS-NEPTUNIENS"
    },
    
    categoriesNoEmoji: {
      planets: "PLANÈTES",
      dwarfPlanets: "PLANÈTES NAINES",
      majorAsteroids: "ASTÉROÏDES PRINCIPAUX",
      transNeptunianObjects: "OBJETS TRANS-NEPTUNIENS",
      celestialBody: "OBJET CELESTE"
    },

    planetInfo: {
      orbitalPeriod: "Période Orbitale",
      sizeRelative: "Taille (Relative à la Terre)",
      distanceFromSun: "Distance du Soleil",
      discoveryYear: "Année de Découverte",
      controls: "🎮 Contrôles",
      followPlanet: "🎯 SUIVRE PLANÈTE",
      stopFollowing: "🛑 ARRÊTER SUIVI",
      followSun: "☀️ Suivre Soleil",
      
      controlsInfo: {
        mouse: "Souris : Tourner autour de l'objet",
        scroll: "Molette : Zoomer/Dézoomer",
        reset: "Touche R ou Reset : Arrêter le suivi",
        orbits: "Touche O : Basculer orbites lumineuses"
      }
    }
  },
  
  // Planet and celestial body information
  planets: {
    sun: {
      name: "Soleil",
      info: "Le Soleil est l'étoile au centre du système solaire."
    },
    
    mercury: {
      name: "Mercure",
      info: "Planète la plus proche du Soleil. Températures de surface de -173°C à 427°C. N'a pas d'atmosphère ni de lunes."
    },
    
    venus: {
      name: "Vénus",
      info: "Planète la plus chaude de notre système solaire avec des températures de 462°C. Possède une atmosphère épaisse et toxique de dioxyde de carbone."
    },
    
    earth: {
      name: "Terre",
      info: "La seule planète connue avec la vie. 71% de la surface couverte d'eau. Possède un satellite naturel."
    },
    
    mars: {
      name: "Mars",
      info: "La Planète Rouge. Possède le plus grand volcan (Olympus Mons) et canyon (Valles Marineris) du système solaire."
    },
    
    jupiter: {
      name: "Jupiter",
      info: "Plus grande planète de notre système solaire. La Grande Tache Rouge est une tempête plus grande que la Terre. Possède 95 lunes connues."
    },
    
    saturn: {
      name: "Saturne",
      info: "Célèbre pour son système d'anneaux proéminent. Moins dense que l'eau. Possède 146 lunes connues."
    },
    
    uranus: {
      name: "Uranus",
      info: "Géante de glace inclinée sur le côté (inclinaison axiale de 98°). Possède des anneaux faibles et 28 lunes connues."
    },
    
    neptune: {
      name: "Neptune",
      info: "Planète la plus venteuse avec des vitesses jusqu'à 2 100 km/h. Couleur bleu profond due au méthane dans l'atmosphère."
    },
    
    // Dwarf Planets
    ceres: {
      name: "Cérès",
      info: "Plus gros objet de la ceinture d'astéroïdes. Possède de la glace d'eau et possiblement un océan souterrain. Visitée par la sonde Dawn."
    },
    
    pluto: {
      name: "Pluton",
      info: "Ancienne neuvième planète. Possède des plaines d'azote en forme de cœur. Système binaire avec Charon."
    },
    
    eris: {
      name: "Éris",
      info: "Planète naine la plus massive. Sa découverte a mené à la reclassification de Pluton. Surface très réfléchissante."
    },
    
    makemake: {
      name: "Makemake",
      info: "Troisième plus grande planète naine. Surface rougeâtre probablement due aux composés organiques. Pas d'atmosphère."
    },
    
    haumea: {
      name: "Haumea",
      info: "Planète naine allongée qui tourne toutes les 4 heures. Possède un système d'anneaux et une surface de glace d'eau cristalline."
    },

     sedna: {
      name: "Sedna",
      info: "Extremely distant object in extended scattered disk. Takes 11,400 years to orbit the Sun."
    },

    quaoar: {
      name: "Quaoar",
      info: "Classical Kuiper Belt object. Has ring system and one known moon."
    },

    orcus: {
      name: "Orcus",
      info: "Plutino in 2:3 resonance with Neptune. Sometimes called 'anti-Pluto'."
    },

    gonggong: {
      name: "Gonggong",
      info: "Red-colored scattered disk object. Has slow rotation period of 22 hours."
    },

    varuna: {
      name: "Varuna",
      info: "Large classical Kuiper Belt object. Elongated shape with rapid rotation."
    },

    ixion: {
      name: "Ixion",
      info: "Plutino with very red surface. May have experienced thermal evolution."
    },

    salacia: {
      name: "Salacia",
      info: "Large trans-Neptunian object with a known moon."
    },

    or10: {
      name: "2007 OR10",
      info: "One of the largest known dwarf planets, very red in color."
    },

    vesta: {
      name: "Vesta",
      info: "Second-largest asteroid. Has a differentiated interior with basaltic surface. Visited by Dawn spacecraft."
    },

    pallas: {
      name: "Pallas",
      info: "Third-largest asteroid. Highly inclined orbit. Possibly a protoplanet."
    },
  },
  
  // Moon information  
  moons: {
    moon: {
      name: "Lune",
      info: "Seul satellite naturel de la Terre. Formée il y a 4,5 milliards d'années."
    },
    
    phobos: {
      name: "Phobos",
      info: "Plus grande lune de Mars. Orbite Mars 3 fois par jour."
    },
    
    deimos: {
      name: "Déimos",
      info: "Lune plus petite et extérieure de Mars. Prend 30 heures pour orbiter Mars."
    },
    
    io: {
      name: "Io",
      info: "Corps le plus volcaniquement actif du système solaire."
    },
    
    europa: {
      name: "Europe",
      info: "Lune couverte de glace avec océan souterrain. Potentiel pour la vie."
    },
    
    ganymede: {
      name: "Ganymède",
      info: "Plus grande lune du système solaire. Possède son propre champ magnétique."
    },
    
    callisto: {
      name: "Callisto",
      info: "Corps le plus criblé de cratères du système solaire."
    },
    
     amalthea: {
      name: "Amalthea",
      info: "Fifth largest moon of Jupiter. Irregular potato shape."
    },

    himalia: {
      name: "Himalia",
      info: "Largest irregular moon of Jupiter."
    },

    lysithea: {
      name: "Lysithea",
      info: "Small irregular moon in Jupiter's prograde group."
    },

    elara: {
      name: "Elara",
      info: "Irregular moon discovered in 1905."
    },

    mimas: {
      name: "Mimas",
      info: "Death Star-like appearance with giant Herschel crater."
    },

    titan: {
      name: "Titan",
      info: "Possède une atmosphère épaisse et des lacs de méthane liquide."
    },
    
    enceladus: {
      name: "Encelade",
      info: "Geysers de glace du pôle sud. Océan souterrain."
    },
    
    tethys: {
      name: "Tethys",
      info: "Heavily cratered icy moon with large Odysseus crater."
    },

    dione: {
      name: "Dione",
      info: "Ice cliffs and wispy terrain on trailing hemisphere."
    },

    rhea: {
      name: "Rhea",
      info: "Second largest moon of Saturn with thin oxygen atmosphere."
    },

    hyperion: {
      name: "Hyperion",
      info: "Chaotic rotation and sponge-like appearance."
    },

    iapetus: {
      name: "Iapetus",
      info: "Two-tone coloration, dark leading hemisphere."
    },

    phoebe: {
      name: "Phoebe",
      info: "Retrograde irregular moon, likely captured asteroid."
    },

    ariel: {
      name: "Ariel",
      info: "Youngest surface among Uranian moons with fault valleys."
    },

    umbriel: {
      name: "Umbriel",
      info: "Darkest of Uranus's major moons."
    },

    titania: {
      name: "Titania",
      info: "Largest moon of Uranus with deep canyons."
    },

    oberon: {
      name: "Oberon",
      info: "Outermost major moon with ancient cratered surface."
    },
    
    miranda: {
      name: "Miranda",
      info: "Most unusual moon with extreme geological features."
    },
    
    puck: {
      name: "Puck",
      info: "Small irregular moon discovered by Voyager 2."
    },

    triton: {
      name: "Triton",
      info: "Plus grande lune de Neptune. Orbite rétrograde. Geysers d'azote."
    },

    nereid: {
      name: "Nereid", 
      info: "Highly eccentric orbit, likely captured Kuiper Belt object."
    },

    proteus: {
      name: "Proteus", 
      info: "Largest irregular-shaped moon of Neptune."
    },

    larissa: {
      name: "Larissa", 
      info: "Small inner moon discovered by Voyager 2."
    },

    charon: {
      name: "Charon", 
      info: "Largest moon relative to its parent planet. Tidally locked to Pluto."
    },

    dysnomia: {
      name: "Dysnomia", 
      info: "Only known moon of Eris."
    },

    mk2: {
      name: "MK 2", 
      info: "Small, dark moon of Makemake."
    },

    hiiaka: {
      name: "Hi'iaka", 
      info: "Larger moon of Haumea."
    },

    namaka: {
      name: "Namaka", 
      info: "Smaller, inner moon of Haumea."
    },

    weywot: {
      name: "Weywot", 
      info: "Moon of Quaoar."
    },

    vanth: {
      name: "Vanth", 
      info: "Large moon of Orcus."
    },

    xiangliu: {
      name: "Xiangliu", 
      info: "Moon of Gonggong."
    },

    actaea: {
      name: "Actaea", 
      info: "Moon of Salacia, discovered in 2006."
    },

    s2016: {
      name: "S/2016 (225088) 1", 
      info: "Small moon of 2007 OR10."
    }
  },
  
  // Units and measurements
  units: {
    au: "UA",
    years: "années",
    days: "jours", 
    period: "période",
    earthMass: "Terre",
    volume: "Volume"
  },
  
  // Messages and notifications
  messages: {
    allTexturesLoaded: "Toutes les textures chargées !",
    errorLoadingTexture: "Erreur lors du chargement de la texture :",
    neoApiError: "Erreur API NEO :",
    sentryApiError: "Erreur API Sentry :",
    cometApiError: "Erreur API comète :",
    musicStarted: "Bande sonore Interstellar démarrée",
    musicStopped: "Musique arrêtée",
    atmosphericAudioStarted: "Audio atmosphérique démarré",
    nowFollowing: "Maintenant en train de suivre {planet}",
    stoppedFollowing: "Arrêt du suivi et réinitialisation de la vue",
    followingSun: "Maintenant en train de suivre le Soleil (zoom activé)",
    audioNotAvailable: "🎵 Audio non disponible\n\nPour une meilleure expérience, essayez :\n• Vérifiez les paramètres audio de votre navigateur\n• Assurez-vous que l'audio n'est pas bloqué\n• Essayez un autre navigateur"
  },
  
  // Keyboard shortcuts
  keyboard: {
    spacebar: "Barre d'espace pour pause/reprendre",
    r: "R pour réinitialiser la vue",
    f: "F pour arrêter de suivre la planète",
    o: "O pour basculer les orbites",
    a: "A pour parcourir les types de ceintures d'astéroïdes",
    m: "M pour basculer les lunes",
    h: "H pour basculer la visibilité de l'interface",
    p: "P pour basculer la musique",
    plus: "+ pour augmenter la vitesse",
    minus: "- pour diminuer la vitesse",
    b: "B pour basculer le mode luminosité"
  },
  
  // Info panel
  info: {
    title: "EXPLORATEUR SOLAIRE NASA",
    stats: {
      planets: "🪐 8 Planètes",
      dwarfPlanets: "🌍 11 Planètes Naines",
      asteroidBelts: "☄️ 4 Ceintures d'Astéroïdes",
      transNeptunianObjects: "🌌 Objets Trans-Neptuniens",
      moons: "🌙 50+ Lunes",
      glowingOrbits: "✨ Anneaux d'Orbite Lumineux",
      atmosphericMusic: "🎵 Musique Atmosphérique",
      realTimeData: "🛰️ Données NASA en Temps Réel"
    }
  },
  
  // Footer
  footer: {
    madeWith: "Crée avec 💙 Par",
    developers: "Soumya X Subarna"
  }
};