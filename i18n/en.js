// i18n/en.js - English Translations

export const en = {
  // UI Controls and Buttons
  ui: {
    controls: {
      missionControl: "Mission Control",
      speed: "Speed (Earth Time)",     
      pause: "Pause",
      resume: "Resume",
      reset: "Reset",
      hideUI: "Hide UI",
      showUI: "Show UI",
      cameraControl: "Camera Control",     
      atmosphere: "Atmosphere",
      music: "🎵 Music",
      mute: "🔇 Mute",
      toggle: "Toggle",
      orbits: "Orbits",
      moons: "Moons",
      bloom: "Bloom",
      realAsteroids: "Real Asteroids",
      comets: "Comets",
      asteroidBelts: "Asteroid Belts",
      allBelts: "All Belts",
      mainBelt: "Main Belt",
      trojans: "Trojans",
      kuiper: "Kuiper",
      scattered: "Scattered",
      autoBloom: "Auto Bloom",
      manualBloom: "Manual Bloom",
      language: "Language"
    },
    labels: {
        realearthtime: "0x Real Earth Time",
        slowearthtime: "x Slow",
        fastearthtime: "x Fast",
        discovered: "Discovered",
        distance: "Distance",
        size: "Size",
        unknown: "Unknown",
        planetRadii: 'planet radii',
        follow: "Follow"
    },

    celestialBodies: "Celestial Bodies",
    showPlanetNames: "Show Planet Names",
    hidePlanetNames: "Hide Planet Names",
    showMoonNames: "Show Moon Names",
    hideMoonNames: "Hide Moon Names",
    
    categories: {
      planets: "🪐 PLANETS",
      dwarfPlanets: "🌍 DWARF PLANETS",
      majorAsteroids: "☄️ MAJOR ASTEROIDS",
      transNeptunianObjects: "🌌 TRANS-NEPTUNIAN OBJECTS"
    },
    
    categoriesNoEmoji: {
      planets: "PLANETS",
      dwarfPlanets: "DWARF PLANETS",
      majorAsteroids: "MAJOR ASTEROIDS",
      transNeptunianObjects: "TRANS-NEPTUNIAN OBJECTS",
      celestialBody: "CELESTIAL BODY"
    },

    planetInfo: {
      orbitalPeriod: "Orbital Period",
      sizeRelative: "Size (Relative to Earth)",
      distanceFromSun: "Distance from Sun",
      discoveryYear: "Discovery Year",
      controls: "🎮 Controls",
      followPlanet: "🎯 FOLLOW PLANET",
      stopFollowing: "🛑 STOP FOLLOWING",
      followSun: "☀️ Follow Sun",
      
      controlsInfo: {
        mouse: "Mouse: Orbit around object",
        scroll: "Scroll: Zoom in/out", 
        reset: "R key or Reset: Stop following",
        orbits: "O key: Toggle glowing orbits"
      }
    }
  },
  
  // Planet and celestial body information
  planets: {
    sun: {
      name: "Sun",
      info: "The Sun is the star at the center of the Solar System."
    },
    
    mercury: {
      name: "Mercury",
      info: "Closest planet to the Sun. Surface temperatures range from -173°C to 427°C. Has no atmosphere and no moons."
    },
    
    venus: {
      name: "Venus", 
      info: "Hottest planet in our solar system with surface temperatures of 462°C. Has a thick, toxic atmosphere of carbon dioxide."
    },
    
    earth: {
      name: "Earth",
      info: "The only known planet with life. 71% of surface covered by water. Has one natural satellite."
    },
    
    mars: {
      name: "Mars",
      info: "The Red Planet. Has the largest volcano (Olympus Mons) and canyon (Valles Marineris) in the solar system."
    },
    
    jupiter: {
      name: "Jupiter",
      info: "Largest planet in our solar system. Great Red Spot is a storm larger than Earth. Has 95 known moons."
    },
    
    saturn: {
      name: "Saturn",
      info: "Famous for its prominent ring system. Less dense than water. Has 146 known moons."
    },
    
    uranus: {
      name: "Uranus",
      info: "Ice giant tilted on its side (98° axial tilt). Has faint rings and 28 known moons."
    },
    
    neptune: {
      name: "Neptune",
      info: "Windiest planet with speeds up to 2,100 km/h. Deep blue color from methane in atmosphere."
    },
    
    // Dwarf Planets
    ceres: {
      name: "Ceres",
      info: "Largest object in asteroid belt. Has water ice and possible subsurface ocean. Visited by Dawn spacecraft."
    },
    
    pluto: {
      name: "Pluto",
      info: "Former ninth planet. Has heart-shaped nitrogen plains. Binary system with Charon."
    },
    
    eris: {
      name: "Eris",
      info: "Most massive dwarf planet. Discovery led to Pluto's reclassification. Very reflective surface."
    },
    
    makemake: {
      name: "Makemake",
      info: "Third-largest dwarf planet. Reddish surface likely due to organic compounds. No atmosphere."
    },
    
    haumea: {
      name: "Haumea",
      info: "Elongated dwarf planet that spins every 4 hours. Has ring system and crystalline water ice surface."
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
    }
  },
  
  // Moon information
  moons: {
    moon: {
      name: "Moon",
      info: "Earth's only natural satellite. Formed 4.5 billion years ago."
    },
    
    phobos: {
      name: "Phobos",
      info: "Largest moon of Mars. Orbits Mars 3 times per day."
    },
    
    deimos: {
      name: "Deimos", 
      info: "Smaller, outer moon of Mars. Takes 30 hours to orbit Mars."
    },
    
    io: {
      name: "Io",
      info: "Most volcanically active body in the solar system."
    },
    
    europa: {
      name: "Europa",
      info: "Ice-covered moon with subsurface ocean. Potential for life."
    },
    
    ganymede: {
      name: "Ganymede",
      info: "Largest moon in the solar system. Has its own magnetic field."
    },
    
    callisto: {
      name: "Callisto",
      info: "Most heavily cratered body in the solar system."
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
      info: "Has thick atmosphere and liquid methane lakes."
    },
    
    enceladus: {
      name: "Enceladus",
      info: "Ice geysers from south pole. Subsurface ocean."
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
      info: "Largest moon of Neptune. Orbits retrograde. Nitrogen geysers."
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
    au: "AU",
    years: "years",
    days: "days",
    period: "period",
    earthMass: "Earth",
    volume: "Volume"
  },
  
  // Messages and notifications
  messages: {
    allTexturesLoaded: "All textures loaded!",
    errorLoadingTexture: "Error loading texture:",
    neoApiError: "NEO API error:",
    sentryApiError: "Sentry API error:",
    cometApiError: "Comet API error:",
    musicStarted: "Interstellar soundtrack started",
    musicStopped: "Music stopped",
    atmosphericAudioStarted: "Atmospheric audio started",
    nowFollowing: "Now following {planet}",
    stoppedFollowing: "Stopped following and reset view",
    followingSun: "Now following the Sun (zoom enabled)",
    audioNotAvailable: "🎵 Audio not available\n\nFor the best experience, try:\n• Check your browser audio settings\n• Ensure audio is not blocked\n• Try a different browser"
  },
  
  // Keyboard shortcuts
  keyboard: {
    spacebar: "Spacebar to pause/resume",
    r: "R to reset view", 
    f: "F to stop following planet",
    o: "O to toggle orbits",
    a: "A to cycle through asteroid belt types",
    m: "M to toggle moons",
    h: "H to toggle UI visibility",
    p: "P to toggle music",
    plus: "+ to increase speed",
    minus: "- to decrease speed",
    b: "B to toggle bloom mode"
  },
  
  // Info panel
  info: {
    title: "NASA SOLAR EXPLORER",
    stats: {
      planets: "🪐 8 Planets",
      dwarfPlanets: "🌍 11 Dwarf Planets", 
      asteroidBelts: "☄️ 4 Asteroid Belts",
      transNeptunianObjects: "🌌 Trans-Neptunian Objects",
      moons: "🌙 50+ Moons",
      glowingOrbits: "✨ Glowing Orbit Rings",
      atmosphericMusic: "🎵 Atmospheric Music",
      realTimeData: "🛰️ Real-time NASA Data"
    }
  },
  
  // Footer
  footer: {
    madeWith: "Made With 💙 By",
    developers: "Soumya X Subarna"
  }
};