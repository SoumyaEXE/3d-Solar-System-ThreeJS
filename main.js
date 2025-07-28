import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { Lensflare, LensflareElement } from "three/examples/jsm/objects/Lensflare.js";

// Scene and Camera Setup
const scene = new THREE.Scene();

// Set a deep space background color instead of pure black
scene.background = new THREE.Color(0x000814); // Very dark blue-black for deep space
scene.fog = new THREE.Fog(0x000814, 180, 250); // Subtle fog for depth

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
console.log("Scene and camera initialized");
console.log("Camera position:", camera.position);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

console.log("Renderer initialized and added to DOM");

// --- Lighting & Rendering Improvements ---
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Controls - Improved for better visual experience
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.rotateSpeed = 0.3;
controls.zoomSpeed = 0.8;
controls.panSpeed = 0.5;

// Texture Loader 
const loader = new THREE.TextureLoader();
loader.manager.onLoad = () => {
  console.log("All textures loaded!");
};
loader.manager.onError = (url) => {
  console.error("Error loading texture:", url);
  // Continue without the texture to prevent black screen
};

// Add error handling for individual texture loads
loader.manager.onProgress = (item, loaded, total) => {
  console.log(`Loading progress: ${loaded}/${total} - ${item}`);
};

// Lighting - cinematic space feel
const ambientLight = new THREE.AmbientLight(new THREE.Color(0.13, 0.13, 0.13), 0.5); // Dark gray ambient
scene.add(ambientLight);

// Sun-like light
const pointLight = new THREE.PointLight(new THREE.Color(1.0, 1.0, 1.0), 10.0, 1000, 0.5); // Pure white
pointLight.position.set(0, 0, 0);
pointLight.castShadow = false;
pointLight.shadow.mapSize.width = 2048;
pointLight.shadow.mapSize.height = 2048;
pointLight.shadow.camera.near = 0.1; 
pointLight.shadow.camera.far = 500;
scene.add(pointLight);

// Optional soft blue fill light (more pronounced)
const fillLight = new THREE.PointLight(new THREE.Color(0.2, 0.4, 1.0), 2.0, 100, 1); // Soft blue
fillLight.position.set(50, 50, -100);
scene.add(fillLight);

// Enhanced Starfield background with better sky
const starTexture = loader.load("/textures/8k_stars.jpg");
const skyTexture = loader.load("/textures/stars.jpg"); // Use the additional stars texture
const starGeo = new THREE.SphereGeometry(200, 64, 64);

// Create enhanced sky material with both textures
const starMat = new THREE.MeshBasicMaterial({
  map: starTexture,
  side: THREE.BackSide,
  toneMapped: false,
  color: new THREE.Color(1.2, 1.2, 1.2), // Slightly brighter
});

const starfield = new THREE.Mesh(starGeo, starMat);
scene.add(starfield);

// Add additional sky layer for more depth
const skyGeo = new THREE.SphereGeometry(190, 64, 64);
const skyMat = new THREE.MeshBasicMaterial({
  map: skyTexture,
  side: THREE.BackSide,
  toneMapped: false,
  transparent: true,
  opacity: 0.3,
  color: new THREE.Color(0.8, 0.9, 1.0), // Slight blue tint
});
const skyfield = new THREE.Mesh(skyGeo, skyMat);
scene.add(skyfield);
scene.add(starfield);

// Enhanced Sun (glowing with stronger Bloom)
const sunMaterial = new THREE.MeshBasicMaterial({
  map: loader.load("/textures/sun.jpg"),
  emissive: new THREE.Color(1.5, 1.2, 0.8), // Stronger warm emission
  emissiveIntensity: 1.8, // Increased intensity for better bloom
  toneMapped: false, 
  color: new THREE.Color(1.2, 1.1, 0.9) // Slightly enhanced base color
});
const sun = new THREE.Mesh(new THREE.SphereGeometry(5, 64, 64), sunMaterial);
scene.add(sun);

// Add lens flare to the sun for enhanced visual effect
const textureLoader = new THREE.TextureLoader();
const textureFlare0 = textureLoader.load("/textures/lensflare0.png");
const textureFlare2 = textureLoader.load("/textures/lensflare2.png");

const lensflare = new Lensflare();
lensflare.addElement(new LensflareElement(textureFlare0, 512, 0, new THREE.Color(1, 0.9, 0.8)));
lensflare.addElement(new LensflareElement(textureFlare2, 128, 0.2, new THREE.Color(1, 1, 0.6)));
lensflare.addElement(new LensflareElement(textureFlare2, 64, 0.4, new THREE.Color(0.8, 0.8, 1)));
lensflare.addElement(new LensflareElement(textureFlare2, 32, 0.6, new THREE.Color(1, 0.8, 0.6)));

sun.add(lensflare);

// Planets and Dwarf Planets with accurate positions for July 27, 2025
const celestialBodies = [
  {
    name: "Mercury",
    size: 0.5,
    dist: 8,
    speed: 0.0041, // 88 Earth days orbital period
    initialAngle: 2.1, // Position in radians for July 27, 2025
    texture: "mercury.jpg",
    roughness: 1, 
    metalness: 0.02,
    type: "planet",
    info: "Closest planet to the Sun. Surface temperatures range from -173°C to 427°C. Has no atmosphere and no moons.",
    discoveryYear: "Ancient",
    moons: []
  },
  {
    name: "Venus",
    size: 0.9,
    dist: 11,
    speed: 0.0016, // 225 Earth days orbital period
    initialAngle: 4.8, // Position in radians for July 27, 2025
    texture: "venus.jpg",
    roughness: 0.6,
    metalness: 0.05,
    type: "planet",
    info: "Hottest planet in our solar system with surface temperatures of 462°C. Has a thick, toxic atmosphere of carbon dioxide.",
    discoveryYear: "Ancient",
    moons: []
  },
  {
    name: "Earth",
    size: 1,
    dist: 15,
    speed: 0.001, // 365 Earth days orbital period (reference)
    initialAngle: 3.45, // Position in radians for July 27, 2025 (late July)
    texture: "earth.jpg",
    roughness: 0.5, 
    metalness: 0.01,
    type: "planet",
    info: "The only known planet with life. 71% of surface covered by water. Has one natural satellite.",
    discoveryYear: "N/A",
    moons: [
      { name: "Moon", size: 0.27, dist: 2.5, speed: 0.037, color: new THREE.Color(0.53, 0.53, 0.53), info: "Earth's only natural satellite. Formed 4.5 billion years ago.", initialAngle: 1.2 } // 27.3 days
    ]
  },
  {
    name: "Mars",
    size: 0.8,
    dist: 19,
    speed: 0.00053, // 687 Earth days orbital period
    initialAngle: 0.9, // Position in radians for July 27, 2025
    texture: "mars.jpg",
    roughness: 0.75,
    metalness: 0.02,
    type: "planet",
    info: "The Red Planet. Has the largest volcano (Olympus Mons) and canyon (Valles Marineris) in the solar system.",
    discoveryYear: "Ancient",
    moons: [
      { name: "Phobos", size: 0.05, dist: 1.5, speed: 0.32, color: new THREE.Color(0.4, 0.26, 0.13), info: "Largest moon of Mars. Orbits Mars 3 times per day.", initialAngle: 0.5 }, // 0.32 days
      { name: "Deimos", size: 0.03, dist: 2.2, speed: 0.08, color: new THREE.Color(0.4, 0.26, 0.13), info: "Smaller, outer moon of Mars. Takes 30 hours to orbit Mars.", initialAngle: 2.1 } // 1.26 days
    ]
  },
  // Major Asteroids
  {
    name: "Vesta",
    size: 0.15,
    dist: 20.5,
    speed: 0.00029, // 3.63 years orbital period
    initialAngle: 5.2, // Position in radians for July 27, 2025
    color: new THREE.Color(0.8, 0.8, 0.8), // Light gray
    roughness: 1.0,
    metalness: 0.1,
    type: "asteroid",
    info: "Second-largest asteroid. Has a differentiated interior with basaltic surface. Visited by Dawn spacecraft.",
    discoveryYear: "1807",
    moons: []
  },
  {
    name: "Pallas",
    size: 0.12,
    dist: 21.2,
    speed: 0.00022, // 4.62 years orbital period
    initialAngle: 1.8, // Position in radians for July 27, 2025
    color: new THREE.Color(0.67, 0.67, 0.67), // Medium gray
    roughness: 1.0,
    metalness: 0.05,
    type: "asteroid",
    info: "Third-largest asteroid. Highly inclined orbit. Possibly a protoplanet.",
    discoveryYear: "1802",
    moons: []
  },
  {
    name: "Jupiter",
    size: 2,
    dist: 25,
    speed: 0.000084, // 11.86 years orbital period
    initialAngle: 2.7, // Position in radians for July 27, 2025
    texture: "jupiter.jpg",
    roughness: 0.9,
    metalness: 0.0,
    type: "planet",
    info: "Largest planet in our solar system. Great Red Spot is a storm larger than Earth. Has 95 known moons.",
    discoveryYear: "Ancient",
    moons: [
      { name: "Io", size: 0.15, dist: 3.5, speed: 0.56, color: new THREE.Color(1.0, 1.0, 0.6), info: "Most volcanically active body in the solar system.", initialAngle: 0.8 }, // 1.77 days
      { name: "Europa", size: 0.13, dist: 4.2, speed: 0.28, color: new THREE.Color(0.53, 0.81, 0.92), info: "Ice-covered moon with subsurface ocean. Potential for life.", initialAngle: 1.5 }, // 3.55 days
      { name: "Ganymede", size: 0.22, dist: 5.1, speed: 0.14, color: new THREE.Color(0.55, 0.49, 0.42), info: "Largest moon in the solar system. Has its own magnetic field.", initialAngle: 3.2 }, // 7.15 days
      { name: "Callisto", size: 0.20, dist: 6.0, speed: 0.06, color: new THREE.Color(0.41, 0.41, 0.41), info: "Most heavily cratered body in the solar system.", initialAngle: 4.9 }, // 16.69 days
      { name: "Amalthea", size: 0.08, dist: 2.8, speed: 2.0, color: new THREE.Color(0.6, 0.4, 0.2), info: "Fifth largest moon of Jupiter. Irregular potato shape.", initialAngle: 5.2 }, // 0.5 days
      { name: "Himalia", size: 0.05, dist: 7.5, speed: 0.013, color: new THREE.Color(0.5, 0.5, 0.5), info: "Largest irregular moon of Jupiter.", initialAngle: 2.1 }, // 251 days
      { name: "Lysithea", size: 0.02, dist: 8.2, speed: 0.010, color: new THREE.Color(0.4, 0.4, 0.4), info: "Small irregular moon in Jupiter's prograde group.", initialAngle: 4.7 }, // 259 days
      { name: "Elara", size: 0.03, dist: 8.0, speed: 0.011, color: new THREE.Color(0.45, 0.45, 0.45), info: "Irregular moon discovered in 1905.", initialAngle: 1.8 } // 259 days
    ]
  },
  {
    name: "Saturn",
    size: 1.7,
    dist: 31,
    speed: 0.000034, // 29.46 years orbital period
    initialAngle: 5.8, // Position in radians for July 27, 2025
    texture: "saturn.jpg",
    hasRings: true,
    roughness: 0.9,
    metalness: 0.0,
    type: "planet",
    info: "Famous for its prominent ring system. Less dense than water. Has 146 known moons.",
    discoveryYear: "Ancient",
    moons: [
      { name: "Mimas", size: 0.06, dist: 2.8, speed: 1.05, color: new THREE.Color(0.7, 0.7, 0.7), info: "Death Star-like appearance with giant Herschel crater.", initialAngle: 0.9 }, // 0.94 days
      { name: "Enceladus", size: 0.08, dist: 3.2, speed: 0.73, color: new THREE.Color(0.94, 0.97, 1.0), info: "Ice geysers from south pole. Subsurface ocean.", initialAngle: 4.1 }, // 1.37 days
      { name: "Tethys", size: 0.09, dist: 3.7, speed: 0.52, color: new THREE.Color(0.8, 0.8, 0.85), info: "Heavily cratered icy moon with large Odysseus crater.", initialAngle: 2.7 }, // 1.89 days
      { name: "Dione", size: 0.09, dist: 4.1, speed: 0.37, color: new THREE.Color(0.75, 0.75, 0.8), info: "Ice cliffs and wispy terrain on trailing hemisphere.", initialAngle: 5.5 }, // 2.74 days
      { name: "Rhea", size: 0.12, dist: 4.8, speed: 0.22, color: new THREE.Color(0.7, 0.7, 0.75), info: "Second largest moon of Saturn with thin oxygen atmosphere.", initialAngle: 1.3 }, // 4.52 days
      { name: "Titan", size: 0.21, dist: 5.5, speed: 0.063, color: new THREE.Color(1.0, 0.65, 0.0), info: "Has thick atmosphere and liquid methane lakes.", initialAngle: 2.3 }, // 15.95 days
      { name: "Hyperion", size: 0.04, dist: 6.2, speed: 0.048, color: new THREE.Color(0.6, 0.5, 0.4), info: "Chaotic rotation and sponge-like appearance.", initialAngle: 3.8 }, // 21.28 days
      { name: "Iapetus", size: 0.11, dist: 7.0, speed: 0.014, color: new THREE.Color(0.3, 0.3, 0.3), info: "Two-tone coloration, dark leading hemisphere.", initialAngle: 0.5 }, // 79.33 days
      { name: "Phoebe", size: 0.03, dist: 8.5, speed: 0.006, color: new THREE.Color(0.25, 0.25, 0.25), info: "Retrograde irregular moon, likely captured asteroid.", initialAngle: 4.9 } // 550 days
    ]
  },
  {
    name: "Uranus",
    size: 1.2,
    dist: 37,
    speed: 0.000012, // 84.01 years orbital period
    initialAngle: 1.2, // Position in radians for July 27, 2025
    texture: "uranus.jpg",
    roughness: 0.85,
    metalness: 0.0,
    type: "planet",
    info: "Ice giant tilted on its side (98° axial tilt). Has faint rings and 28 known moons.",
    discoveryYear: "1781",
    moons: [
      { name: "Ariel", size: 0.08, dist: 2.2, speed: 0.39, color: new THREE.Color(0.6, 0.6, 0.65), info: "Youngest surface among Uranian moons with fault valleys.", initialAngle: 2.1 }, // 2.52 days
      { name: "Umbriel", size: 0.08, dist: 2.5, speed: 0.23, color: new THREE.Color(0.4, 0.4, 0.45), info: "Darkest of Uranus's major moons.", initialAngle: 4.8 }, // 4.14 days
      { name: "Titania", size: 0.11, dist: 3.0, speed: 0.12, color: new THREE.Color(0.55, 0.55, 0.6), info: "Largest moon of Uranus with deep canyons.", initialAngle: 1.7 }, // 8.71 days
      { name: "Oberon", size: 0.10, dist: 3.4, speed: 0.075, color: new THREE.Color(0.5, 0.5, 0.55), info: "Outermost major moon with ancient cratered surface.", initialAngle: 5.3 }, // 13.46 days
      { name: "Miranda", size: 0.06, dist: 1.8, speed: 0.67, color: new THREE.Color(0.53, 0.53, 0.53), info: "Most unusual moon with extreme geological features.", initialAngle: 3.7 }, // 1.41 days
      { name: "Puck", size: 0.03, dist: 1.5, speed: 1.18, color: new THREE.Color(0.45, 0.45, 0.5), info: "Small irregular moon discovered by Voyager 2.", initialAngle: 0.8 } // 0.76 days
    ]
  },
  {
    name: "Neptune",
    size: 1.1,
    dist: 42,
    speed: 0.0000061, // 164.8 years orbital period
    initialAngle: 6.1, // Position in radians for July 27, 2025
    texture: "neptune.jpg",
    roughness: 0.85,
    metalness: 0.0,
    type: "planet",
    info: "Windiest planet with speeds up to 2,100 km/h. Deep blue color from methane in atmosphere.",
    discoveryYear: "1846",
    moons: [
      { name: "Triton", size: 0.11, dist: 3.0, speed: 0.17, color: new THREE.Color(0.53, 0.81, 0.92), info: "Largest moon of Neptune. Orbits retrograde. Nitrogen geysers.", initialAngle: 0.9 }, // 5.88 days
      { name: "Nereid", size: 0.02, dist: 4.8, speed: 0.003, color: new THREE.Color(0.5, 0.5, 0.5), info: "Highly eccentric orbit, likely captured Kuiper Belt object.", initialAngle: 3.2 }, // 360 days
      { name: "Proteus", size: 0.03, dist: 2.2, speed: 0.89, color: new THREE.Color(0.4, 0.4, 0.4), info: "Largest irregular-shaped moon of Neptune.", initialAngle: 5.7 }, // 1.12 days
      { name: "Larissa", size: 0.015, dist: 1.8, speed: 1.81, color: new THREE.Color(0.35, 0.35, 0.35), info: "Small inner moon discovered by Voyager 2.", initialAngle: 2.4 } // 0.55 days
    ]
  },
  // Dwarf Planets
  {
    name: "Ceres",
    size: 0.3,
    dist: 22,
    speed: 0.00022, // 4.6 years orbital period
    color: new THREE.Color(0.6, 0.6, 0.6), // Medium gray
    roughness: 1.0,
    metalness: 0.0,
    type: "dwarf",
    info: "Largest object in asteroid belt. Has water ice and possible subsurface ocean. Visited by Dawn spacecraft.",
    discoveryYear: "1801",
    moons: []
  },
  {
    name: "Pluto",
    size: 0.4,
    dist: 48,
    speed: 0.000004, // 248 years orbital period
    initialAngle: 5.3, // Position in radians for July 27, 2025
    color: new THREE.Color(0.82, 0.71, 0.55), // Tan
    roughness: 1.0,
    metalness: 0.0,
    type: "dwarf",
    info: "Former ninth planet. Has heart-shaped nitrogen plains. Binary system with Charon.",
    discoveryYear: "1930",
    moons: [
      { name: "Charon", size: 0.2, dist: 1.8, speed: 0.16, color: new THREE.Color(0.5, 0.5, 0.5), info: "Largest moon relative to its parent planet. Tidally locked to Pluto.", initialAngle: 1.8 } // 6.39 days
    ]
  },
  {
    name: "Eris",
    size: 0.35,
    dist: 52,
    speed: 0.0000018, // 558 years orbital period
    initialAngle: 2.7, // Position in radians for July 27, 2025
    color: new THREE.Color(0.9, 0.9, 0.98), // Lavender
    roughness: 1.0,
    metalness: 0.0,
    type: "dwarf",
    info: "Most massive dwarf planet. Discovery led to Pluto's reclassification. Very reflective surface.",
    discoveryYear: "2005",
    moons: [
      { name: "Dysnomia", size: 0.04, dist: 2.0, speed: 0.067, color: new THREE.Color(0.6, 0.6, 0.6), info: "Only known moon of Eris.", initialAngle: 4.5 } // 15.8 days
    ]
  },
  {
    name: "Makemake",
    size: 0.25,
    dist: 50,
    speed: 0.0000032, // 310 years orbital period
    initialAngle: 1.9, // Position in radians for July 27, 2025
    color: new THREE.Color(0.55, 0.27, 0.07), // Saddle brown
    roughness: 1.0,
    metalness: 0.0,
    type: "dwarf",
    info: "Third-largest dwarf planet. Reddish surface likely due to organic compounds. No atmosphere.",
    discoveryYear: "2005",
    moons: [
      { name: "MK 2", size: 0.02, dist: 1.5, speed: 0.083, color: new THREE.Color(0.4, 0.4, 0.4), info: "Small, dark moon of Makemake.", initialAngle: 0.7 } // 12 days
    ]
  },
  {
    name: "Haumea",
    size: 0.28,
    dist: 51,
    speed: 0.0000035, // 285 years orbital period
    initialAngle: 4.2, // Position in radians for July 27, 2025
    color: new THREE.Color(1.0, 1.0, 1.0), // Pure white
    roughness: 0.8,
    metalness: 0.1,
    type: "dwarf",
    info: "Elongated dwarf planet that spins every 4 hours. Has ring system and crystalline water ice surface.",
    discoveryYear: "2004",
    moons: [
      { name: "Hi'iaka", size: 0.05, dist: 2.2, speed: 0.02, color: new THREE.Color(0.87, 0.87, 0.87), info: "Larger moon of Haumea.", initialAngle: 2.9 }, // 49.12 days
      { name: "Namaka", size: 0.03, dist: 1.8, speed: 0.056, color: new THREE.Color(0.8, 0.8, 0.8), info: "Smaller, inner moon of Haumea.", initialAngle: 5.1 } // 18.28 days
    ]
  },
  // Additional Dwarf Planet Candidates
  {
    name: "Sedna",
    size: 0.2,
    dist: 65,
    speed: 0.00000009, // 11,400 years orbital period
    initialAngle: 0.1, // Position in radians for July 27, 2025
    color: new THREE.Color(0.55, 0.0, 0.0), // Dark red
    roughness: 1.0,
    metalness: 0.0,
    type: "dwarf",
    info: "Extremely distant object in extended scattered disk. Takes 11,400 years to orbit the Sun.",
    discoveryYear: "2003",
    moons: []
  },
  {
    name: "Quaoar",
    size: 0.18,
    dist: 54,
    speed: 0.0000035, // 288 years orbital period
    initialAngle: 3.1, // Position in radians for July 27, 2025
    color: new THREE.Color(0.4, 0.26, 0.13), // Brown
    roughness: 1.0,
    metalness: 0.0,
    type: "dwarf",
    info: "Classical Kuiper Belt object. Has ring system and one known moon.",
    discoveryYear: "2002",
    moons: [
      { name: "Weywot", size: 0.02, dist: 1.6, speed: 0.083, color: new THREE.Color(0.33, 0.33, 0.33), info: "Moon of Quaoar.", initialAngle: 1.3 } // 12 days
    ]
  },
  {
    name: "Orcus",
    size: 0.16,
    dist: 49,
    speed: 0.000004, // 247 years orbital period
    initialAngle: 5.7, // Position in radians for July 27, 2025
    color: new THREE.Color(0.18, 0.31, 0.31), // Dark slate gray
    roughness: 1.0,
    metalness: 0.0,
    type: "dwarf",
    info: "Plutino in 2:3 resonance with Neptune. Sometimes called 'anti-Pluto'.",
    discoveryYear: "2004",
    moons: [
      { name: "Vanth", size: 0.06, dist: 1.9, speed: 0.1, color: new THREE.Color(0.27, 0.27, 0.27), info: "Large moon of Orcus.", initialAngle: 4.8 } // 9.5 days
    ]
  },
  {
    name: "Gonggong",
    size: 0.19,
    dist: 56,
    speed: 0.0000018, // 554 years orbital period
    initialAngle: 2.4, // Position in radians for July 27, 2025
    color: new THREE.Color(0.5, 0.0, 0.13), // Burgundy
    roughness: 1.0,
    metalness: 0.0,
    type: "dwarf",
    info: "Red-colored scattered disk object. Has slow rotation period of 22 hours.",
    discoveryYear: "2007",
    moons: [
      { name: "Xiangliu", size: 0.03, dist: 1.7, speed: 0.1, color: new THREE.Color(0.4, 0.4, 0.4), info: "Moon of Gonggong.", initialAngle: 3.8 } // 25 days
    ]
  },
  // Large Trans-Neptunian Objects
  {
    name: "Varuna",
    size: 0.12,
    dist: 53,
    speed: 0.0000027, // 283 years orbital period
    initialAngle: 4.7, // Position in radians for July 27, 2025
    color: new THREE.Color(0.41, 0.41, 0.41), // Dim gray
    roughness: 1.0,
    metalness: 0.0,
    type: "tno",
    info: "Large classical Kuiper Belt object. Elongated shape with rapid rotation.",
    discoveryYear: "2000",
    moons: []
  },
  {
    name: "Ixion",
    size: 0.11,
    dist: 49.5,
    speed: 0.000004, // 250 years orbital period
    initialAngle: 0.8, // Position in radians for July 27, 2025
    color: new THREE.Color(0.55, 0.27, 0.07), // Saddle brown
    roughness: 1.0,
    metalness: 0.0,
    type: "tno",
    info: "Plutino with very red surface. May have experienced thermal evolution.",
    discoveryYear: "2001",
    moons: []
  },
  {
    name: "Salacia",
    size: 0.13,
    dist: 50.3,
    speed: 0.0000035, // 271 years orbital period
    initialAngle: 2.9, // Position in radians for July 27, 2025
    color: new THREE.Color(0.6, 0.6, 0.65), // Blue-gray
    roughness: 1.0,
    metalness: 0.0,
    type: "tno",
    info: "Large trans-Neptunian object with a known moon.",
    discoveryYear: "2004",
    moons: [
      { name: "Actaea", size: 0.04, dist: 1.4, speed: 0.09, color: new THREE.Color(0.5, 0.5, 0.55), info: "Moon of Salacia, discovered in 2006.", initialAngle: 1.9 } // 5.49 days
    ]
  },
  {
    name: "2007 OR10",
    size: 0.16,
    dist: 55.2,
    speed: 0.0000019, // 549 years orbital period
    initialAngle: 3.7, // Position in radians for July 27, 2025
    color: new THREE.Color(0.45, 0.15, 0.10), // Reddish-brown
    roughness: 1.0,
    metalness: 0.0,
    type: "dwarf",
    info: "One of the largest known dwarf planets, very red in color.",
    discoveryYear: "2007",
    moons: [
      { name: "S/2016 (225088) 1", size: 0.025, dist: 1.6, speed: 0.08, color: new THREE.Color(0.4, 0.4, 0.4), info: "Small moon of 2007 OR10.", initialAngle: 5.1 } // 11 days
    ]
  }
];

const planetMeshes = [];
const asteroidBelts = {
  main: [],      // Main asteroid belt (Mars-Jupiter)
  trojans: [],   // Jupiter Trojans (L4 and L5 points)
  kuiper: [],    // Kuiper Belt (beyond Neptune)
  scattered: []  // Scattered Disk (far beyond Neptune)
};

// Create Main Asteroid Belt between Mars and Jupiter
function createMainAsteroidBelt() {
  const asteroidCount = 300;
  const innerRadius = 21;
  const outerRadius = 24;
  
  for (let i = 0; i < asteroidCount; i++) {
    const angle = (i / asteroidCount) * Math.PI * 2 + Math.random() * 0.5;
    const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
    const size = 0.01 + Math.random() * 0.08;
    
    // Different asteroid compositions
    const asteroidType = Math.random();
    let color;
    if (asteroidType < 0.6) {
      color = new THREE.Color(0.4, 0.26, 0.13); // C-type (carbonaceous) - brown
    } else if (asteroidType < 0.85) {
      color = new THREE.Color(0.6, 0.6, 0.6); // S-type (silicaceous) - gray
    } else {
      color = new THREE.Color(0.5, 0.4, 0.3); // M-type (metallic) - darker
    }
    
    const asteroidGeo = new THREE.SphereGeometry(size, 8, 8);
    const asteroidMat = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color.clone().multiplyScalar(0.1), // Subtle glow
      emissiveIntensity: 0.2,
      roughness: 1.0,
      metalness: asteroidType > 0.85 ? 0.3 : 0.1,
      toneMapped: false
    });
    
    const asteroid = new THREE.Mesh(asteroidGeo, asteroidMat);
    asteroid.position.x = Math.cos(angle) * radius;
    asteroid.position.z = Math.sin(angle) * radius;
    asteroid.position.y = (Math.random() - 0.5) * 1.0; // Slightly more vertical spread
    
    asteroid.rotation.x = Math.random() * Math.PI;
    asteroid.rotation.y = Math.random() * Math.PI;
    asteroid.rotation.z = Math.random() * Math.PI;
    
    scene.add(asteroid);
    asteroidBelts.main.push({
      mesh: asteroid,
      rotationSpeed: {
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02
      },
      orbitSpeed: 0.004 + Math.random() * 0.003,
      radius: radius,
      angle: angle,
      type: 'main'
    });
  }
}

// Create Jupiter Trojans (L4 and L5 Lagrange points)
function createJupiterTrojans() {
  const asteroidCount = 80;
  const jupiterDistance = 25; // Same as Jupiter's distance
  
  // L4 Trojans (60° ahead of Jupiter)
  for (let i = 0; i < asteroidCount / 2; i++) {
    const baseAngle = Math.PI / 3; // 60° in radians
    const angle = baseAngle + (Math.random() - 0.5) * 0.8; // Spread around L4
    const radius = jupiterDistance + (Math.random() - 0.5) * 3;
    const size = 0.015 + Math.random() * 0.04;
    
    const asteroidGeo = new THREE.SphereGeometry(size, 6, 6);
    const asteroidMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.35, 0.25, 0.15), // Dark reddish-brown
      emissive: new THREE.Color(0.15, 0.1, 0.05), // Subtle warm glow
      emissiveIntensity: 0.15,
      roughness: 1.0,
      metalness: 0.05,
      toneMapped: false
    });
    
    const asteroid = new THREE.Mesh(asteroidGeo, asteroidMat);
    asteroid.position.x = Math.cos(angle) * radius;
    asteroid.position.z = Math.sin(angle) * radius;
    asteroid.position.y = (Math.random() - 0.5) * 0.8;
    
    scene.add(asteroid);
    asteroidBelts.trojans.push({
      mesh: asteroid,
      rotationSpeed: {
        x: (Math.random() - 0.5) * 0.015,
        y: (Math.random() - 0.5) * 0.015,
        z: (Math.random() - 0.5) * 0.015
      },
      orbitSpeed: 0.000084, // Same as Jupiter
      radius: radius,
      angle: angle,
      type: 'trojan-l4'
    });
  }
  
  // L5 Trojans (60° behind Jupiter)
  for (let i = 0; i < asteroidCount / 2; i++) {
    const baseAngle = -Math.PI / 3; // -60° in radians
    const angle = baseAngle + (Math.random() - 0.5) * 0.8; // Spread around L5
    const radius = jupiterDistance + (Math.random() - 0.5) * 3;
    const size = 0.015 + Math.random() * 0.04;
    
    const asteroidGeo = new THREE.SphereGeometry(size, 6, 6);
    const asteroidMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.35, 0.25, 0.15), // Dark reddish-brown
      emissive: new THREE.Color(0.15, 0.1, 0.05), // Subtle warm glow
      emissiveIntensity: 0.15,
      roughness: 1.0,
      metalness: 0.05,
      toneMapped: false
    });
    
    const asteroid = new THREE.Mesh(asteroidGeo, asteroidMat);
    asteroid.position.x = Math.cos(angle) * radius;
    asteroid.position.z = Math.sin(angle) * radius;
    asteroid.position.y = (Math.random() - 0.5) * 0.8;
    
    scene.add(asteroid);
    asteroidBelts.trojans.push({
      mesh: asteroid,
      rotationSpeed: {
        x: (Math.random() - 0.5) * 0.015,
        y: (Math.random() - 0.5) * 0.015,
        z: (Math.random() - 0.5) * 0.015
      },
      orbitSpeed: 0.000084, // Same as Jupiter
      radius: radius,
      angle: angle,
      type: 'trojan-l5'
    });
  }
}

// Create Kuiper Belt (beyond Neptune)
function createKuiperBelt() {
  const asteroidCount = 150;
  const innerRadius = 44;  // Starts around Neptune's orbit
  const outerRadius = 58;  // Extends to about 50 AU
  
  for (let i = 0; i < asteroidCount; i++) {
    const angle = (i / asteroidCount) * Math.PI * 2 + Math.random() * 1.0;
    const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
    const size = 0.02 + Math.random() * 0.06;
    
    // Kuiper Belt objects are often icy
    const asteroidType = Math.random();
    let color;
    if (asteroidType < 0.4) {
      color = new THREE.Color(0.6, 0.7, 0.8); // Icy blue-white
    } else if (asteroidType < 0.7) {
      color = new THREE.Color(0.5, 0.4, 0.3); // Rocky brown
    } else {
      color = new THREE.Color(0.7, 0.5, 0.4); // Reddish (organic compounds)
    }
    
    const asteroidGeo = new THREE.SphereGeometry(size, 6, 6);
    const asteroidMat = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color.clone().multiplyScalar(0.15), // More glow for distant objects
      emissiveIntensity: 0.3,
      roughness: 0.9,
      metalness: 0.05,
      toneMapped: false
    });
    
    const asteroid = new THREE.Mesh(asteroidGeo, asteroidMat);
    asteroid.position.x = Math.cos(angle) * radius;
    asteroid.position.z = Math.sin(angle) * radius;
    asteroid.position.y = (Math.random() - 0.5) * 2.0; // More inclined orbits
    
    asteroid.rotation.x = Math.random() * Math.PI;
    asteroid.rotation.y = Math.random() * Math.PI;
    asteroid.rotation.z = Math.random() * Math.PI;
    
    scene.add(asteroid);
    asteroidBelts.kuiper.push({
      mesh: asteroid,
      rotationSpeed: {
        x: (Math.random() - 0.5) * 0.01,
        y: (Math.random() - 0.5) * 0.01,
        z: (Math.random() - 0.5) * 0.01
      },
      orbitSpeed: 0.000002 + Math.random() * 0.000003,
      radius: radius,
      angle: angle,
      type: 'kuiper'
    });
  }
}

// Create Scattered Disk (very distant objects)
function createScatteredDisk() {
  const asteroidCount = 50;
  const innerRadius = 58;  // Beyond Kuiper Belt
  const outerRadius = 80;  // Very distant
  
  for (let i = 0; i < asteroidCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
    const size = 0.03 + Math.random() * 0.08;
    
    // Scattered disk objects are often reddish
    const color = new THREE.Color(0.6, 0.3, 0.2); // Reddish-brown
    
    const asteroidGeo = new THREE.SphereGeometry(size, 6, 6);
    const asteroidMat = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color.clone().multiplyScalar(0.2), // Strong glow for very distant objects
      emissiveIntensity: 0.4,
      roughness: 1.0,
      metalness: 0.02,
      toneMapped: false
    });
    
    const asteroid = new THREE.Mesh(asteroidGeo, asteroidMat);
    asteroid.position.x = Math.cos(angle) * radius;
    asteroid.position.z = Math.sin(angle) * radius;
    asteroid.position.y = (Math.random() - 0.5) * 8.0; // Highly inclined orbits
    
    asteroid.rotation.x = Math.random() * Math.PI;
    asteroid.rotation.y = Math.random() * Math.PI;
    asteroid.rotation.z = Math.random() * Math.PI;
    
    scene.add(asteroid);
    asteroidBelts.scattered.push({
      mesh: asteroid,
      rotationSpeed: {
        x: (Math.random() - 0.5) * 0.008,
        y: (Math.random() - 0.5) * 0.008,
        z: (Math.random() - 0.5) * 0.008
      },
      orbitSpeed: 0.000001 + Math.random() * 0.000001,
      radius: radius,
      angle: angle,
      type: 'scattered'
    });
  }
}

// Create all asteroid belts
createMainAsteroidBelt();
createJupiterTrojans();
createKuiperBelt();
createScatteredDisk();

celestialBodies.forEach((body) => {
  let material;
  
  if (body.texture) {
    const texturePath = `/textures/${body.texture}`;
    const texture = loader.load(texturePath);
    material = new THREE.MeshStandardMaterial({
      map: texture,
      metalness: body.metalness || 0.05, 
      roughness: body.roughness || 1, 
      emissive: new THREE.Color(0.0, 0.0, 0.0), // No emission for planets
    });
  } else {
    // For dwarf planets without textures, use color
    material = new THREE.MeshStandardMaterial({
      color: body.color,
      metalness: body.metalness || 0.05,
      roughness: body.roughness || 1,
      emissive: new THREE.Color(0.0, 0.0, 0.0), // No emission for dwarf planets
    });
  }

  const geo = new THREE.SphereGeometry(body.size, 64, 64);
  const mesh = new THREE.Mesh(geo, material);

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  const pivot = new THREE.Object3D();
  pivot.add(mesh);
  mesh.position.x = body.dist;
  
  // Set initial position based on July 27, 2025
  if (body.initialAngle !== undefined) {
    pivot.rotation.y = body.initialAngle;
  }
  
  scene.add(pivot);

  // Enhanced glowing orbit rings with distance-based visibility
  const orbitGeo = new THREE.RingGeometry(
    body.dist - 0.05,
    body.dist + 0.05,
    128
  );
  
  // Color coding and glow intensity based on type and distance
  let orbitColor, glowIntensity, baseOpacity;
  
  if (body.type === 'dwarf') {
    orbitColor = new THREE.Color(0.8, 0.6, 0.0); // Softer golden yellow for dwarf planets
    glowIntensity = 0.08;
    baseOpacity = 0.04;
  } else if (body.type === 'asteroid') {
    orbitColor = new THREE.Color(0.6, 0.3, 0.15); // Softer orange for asteroids
    glowIntensity = 0.06;
    baseOpacity = 0.03;
  } else if (body.type === 'tno') {
    orbitColor = new THREE.Color(0.4, 0.15, 0.5); // Softer purple for TNOs
    glowIntensity = 0.1;
    baseOpacity = 0.05;
  } else {
    // Regular planets - distance-based coloring (reduced intensity)
    if (body.dist < 20) {
      orbitColor = new THREE.Color(0.3, 0.5, 0.7); // Softer blue for inner planets
      glowIntensity = 0.03;
      baseOpacity = 0.02;
    } else if (body.dist < 35) {
      orbitColor = new THREE.Color(0.5, 0.4, 0.7); // Softer light purple for mid planets
      glowIntensity = 0.05;
      baseOpacity = 0.03;
    } else {
      orbitColor = new THREE.Color(0.7, 0.3, 0.4); // Softer pink for outer planets
      glowIntensity = 0.07;
      baseOpacity = 0.04;
    }
  }
  
  // Increase visibility for very distant objects (reduced multiplier)
  if (body.dist > 45) {
    glowIntensity *= 1.2;
    baseOpacity *= 1.3;
  }
  
  // Create material with fallback for compatibility
  let orbitMat;
  try {
    orbitMat = new THREE.MeshBasicMaterial({
      color: orbitColor,
      emissive: orbitColor,
      emissiveIntensity: glowIntensity,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: baseOpacity,
      toneMapped: false, // Prevent tone mapping to maintain glow
    });
  } catch (error) {
    console.warn("Emissive material failed, using basic material:", error);
    orbitMat = new THREE.MeshBasicMaterial({
      color: orbitColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: baseOpacity * 2, // Double opacity to compensate for missing glow
    });
  }
  
  const orbit = new THREE.Mesh(orbitGeo, orbitMat);
  orbit.rotation.x = Math.PI / 2;
  orbit.position.y = -0.01;
  
  // Add subtle pulsing effect for distant objects
  if (body.dist > 40) {
    orbit.userData = {
      originalEmissive: glowIntensity,
      pulseSpeed: 0.002 + Math.random() * 0.003,
      pulsePhase: Math.random() * Math.PI * 2
    };
  }
  
  scene.add(orbit);

  // Saturn's ring
  if (body.hasRings) {
    const ringTex = loader.load("/textures/saturn_ring.png");
    const ringGeo = new THREE.RingGeometry(
      body.size + 0.5,
      body.size + 1.2,
      64
    );
    const ringMat = new THREE.MeshBasicMaterial({
      map: ringTex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
      alphaMap: ringTex,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.castShadow = true;
    ring.receiveShadow = true;
    mesh.add(ring);
  }

  // Add moons
  const moons = [];
  if (body.moons && body.moons.length > 0) {
    body.moons.forEach((moonData) => {
      const moonGeo = new THREE.SphereGeometry(moonData.size, 32, 32);
      const moonMat = new THREE.MeshStandardMaterial({
        color: moonData.color,
        roughness: 0.9,
        metalness: 0.1
      });
      const moonMesh = new THREE.Mesh(moonGeo, moonMat);
      
      const moonPivot = new THREE.Object3D();
      moonPivot.add(moonMesh);
      moonMesh.position.x = moonData.dist;
      
      // Set initial moon position
      if (moonData.initialAngle !== undefined) {
        moonPivot.rotation.y = moonData.initialAngle;
      }
      
      mesh.add(moonPivot);
      
      moons.push({
        mesh: moonMesh,
        pivot: moonPivot,
        speed: moonData.speed
      });
    });
  }

  planetMeshes.push({
    mesh,
    pivot,
    speed: body.speed,
    moons: moons,
    type: body.type,
    orbit: orbit // Store orbit reference for pulsing animation
  });
});

// --- Enhanced Post-processing for Bloom Effect ---
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

// Enhanced bloom pass with better settings
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.5,  // Default bloom strength set to 0.5
  0.6,  // Increased bloom radius for wider glow  
  0.05  // Lower threshold to catch more subtle glows
);

// Add bloom controls for dynamic adjustment
bloomPass.strength = 0.5;
bloomPass.radius = 0.6;
bloomPass.threshold = 0.05;

composer.addPass(bloomPass);

// Bloom control settings
let isBloomManual = false; // Track if user is manually controlling bloom
let manualBloomStrength = 0.5; // Store manual bloom value

const outputPass = new OutputPass();
composer.addPass(outputPass);

// Add some distant stars as points
function createDistantStars() {
  const starCount = 1000;
  const starPositions = new Float32Array(starCount * 3);
  
  for (let i = 0; i < starCount * 3; i += 3) {
    const radius = 150 + Math.random() * 50;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    
    starPositions[i] = radius * Math.sin(phi) * Math.cos(theta);
    starPositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
    starPositions[i + 2] = radius * Math.cos(phi);
  }
  
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  
  const starMaterial = new THREE.PointsMaterial({
    color: new THREE.Color(1.0, 1.0, 1.0), // Pure white
    size: 0.5,
    transparent: true,
    opacity: 0.8
  });
  
  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
  return stars;
}

const distantStars = createDistantStars();

console.log("Scene setup complete. Total objects in scene:", scene.children.length);
console.log("Starting animation...");
console.log("Asteroid belts created:", Object.keys(asteroidBelts));
console.log("Main belt asteroids:", asteroidBelts.main.length);
console.log("Planet meshes:", planetMeshes.length);
console.log("🌟 Bloom Effects Status:");
console.log("  - Initial mode: Automatic (dynamic with camera distance)");
console.log("  - Manual control: Use bloom slider or press 'B' key to toggle");
console.log("  - Current strength:", bloomPass.strength);
console.log("  - Available range: 0.0 to 2.0");

// Animation loop variables
let frameCount = 0;
let animationSpeed = 0.4; // Default to 0.4x speed
let isPaused = false;
let currentDate = new Date(); // Use actual current date
let timePerFrame = 1000 * 60 * 60 * 24; // 1 day in milliseconds per frame at 1x speed
let showOrbits = true;
let showAsteroids = true;
let showMoons = true;
let showPlanetLabels = false;
const planetLabels = [];
let followingPlanet = null;
let followOffset = new THREE.Vector3(10, 5, 10);
let lastPlanetPosition = new THREE.Vector3();
let userCameraOffset = new THREE.Vector3();

// Create planet name labels
function createPlanetLabels() {
  planetMeshes.forEach((planetObj, index) => {
    const body = celestialBodies[index];
    const labelDiv = document.createElement('div');
    labelDiv.className = 'planet-label';
    labelDiv.textContent = body.name;
    labelDiv.style.display = 'none';
    document.body.appendChild(labelDiv);
    
    planetLabels.push({
      element: labelDiv,
      planetMesh: planetObj.mesh,
      body: body
    });
  });
}

// Update planet label positions
function updatePlanetLabels() {
  if (!showPlanetLabels) return;
  
  planetLabels.forEach(label => {
    const vector = new THREE.Vector3();
    label.planetMesh.getWorldPosition(vector);
    vector.project(camera);
    
    const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
    const y = (vector.y * -0.5 + 0.5) * window.innerHeight;
    
    label.element.style.left = x + 'px';
    label.element.style.top = (y - 20) + 'px';
    
    // Hide labels that are too far or behind camera
    if (vector.z > 1) {
      label.element.style.display = 'none';
    } else {
      label.element.style.display = showPlanetLabels ? 'block' : 'none';
    }
  });
}

// Create planet labels after scene setup
createPlanetLabels();

// Moon label variables and functions
let showMoonLabels = false;
const moonLabels = [];

// Create moon name labels
function createMoonLabels() {
  planetMeshes.forEach((planetObj, planetIndex) => {
    const body = celestialBodies[planetIndex];
    if (body.moons && body.moons.length > 0) {
      body.moons.forEach((moonData, moonIndex) => {
        const labelDiv = document.createElement('div');
        labelDiv.className = 'moon-label';
        labelDiv.textContent = moonData.name;
        labelDiv.style.display = 'none';
        document.body.appendChild(labelDiv);
        
        moonLabels.push({
          element: labelDiv,
          moonMesh: planetObj.moons[moonIndex].mesh,
          moonData: moonData
        });
      });
    }
  });
}

// Update moon label positions
function updateMoonLabels() {
  if (!showMoonLabels) return;
  
  moonLabels.forEach(label => {
    const vector = new THREE.Vector3();
    label.moonMesh.getWorldPosition(vector);
    vector.project(camera);
    
    const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
    const y = (vector.y * -0.5 + 0.5) * window.innerHeight;
    
    label.element.style.left = x + 'px';
    label.element.style.top = (y - 15) + 'px';
    
    // Hide labels that are too far or behind camera
    if (vector.z > 1) {
      label.element.style.display = 'none';
    } else {
      label.element.style.display = showMoonLabels ? 'block' : 'none';
    }
  });
}

// Create moon labels after scene setup
createMoonLabels();

function animate() {
  requestAnimationFrame(animate);

  // Debug info every 60 frames (roughly once per second at 60fps)
  if (frameCount % 60 === 0) {
    console.log(`Animation running. Frame: ${frameCount}, Paused: ${isPaused}, Speed: ${animationSpeed}`);
  }
  frameCount++;

  if (!isPaused) {
    // At 0x speed, use real Earth time movement (very slow but realistic)
    // At higher speeds, accelerate accordingly
    let realTimeMultiplier = animationSpeed === 0 ? 0.0001 : animationSpeed;
    
    // Update current date based on real time when speed is 0
    if (animationSpeed === 0) {
      currentDate = new Date(); // Always use actual current date at 0x speed
    } else {
      const deltaTime = timePerFrame * realTimeMultiplier / 60; // Adjust for 60fps
      currentDate.setTime(currentDate.getTime() + deltaTime);
    }
    
    sun.rotation.y += 0.002 * realTimeMultiplier;

    // Animate planets and their moons
    planetMeshes.forEach((p) => {
      p.pivot.rotation.y += p.speed * realTimeMultiplier;
      p.mesh.rotation.y += 0.01 * realTimeMultiplier;
      
      // Animate orbit ring pulsing for distant objects
      if (p.orbit && p.orbit.userData && p.orbit.userData.pulseSpeed) {
        try {
          const time = Date.now() * 0.001;
          const pulse = Math.sin(time * p.orbit.userData.pulseSpeed + p.orbit.userData.pulsePhase) * 0.3 + 0.7;
          
          // Only update emissiveIntensity if the material supports it
          if (p.orbit.material.emissiveIntensity !== undefined) {
            p.orbit.material.emissiveIntensity = p.orbit.userData.originalEmissive * pulse;
          }
          
          // Use the original opacity value, don't multiply it each frame
          if (!p.orbit.userData.originalOpacity) {
            p.orbit.userData.originalOpacity = p.orbit.material.opacity;
          }
          p.orbit.material.opacity = p.orbit.userData.originalOpacity * (0.8 + pulse * 0.2);
        } catch (error) {
          console.warn("Orbit pulsing animation error:", error);
        }
      }
      
      // Animate moons with adjusted speeds to prevent too fast movement at 1x
      if (p.moons && p.moons.length > 0) {
        p.moons.forEach((moon) => {
          // Reduce moon speed to make them more realistic at 1x speed
          const adjustedMoonSpeed = moon.speed * 0.1; // Make moons 10x slower
          moon.pivot.rotation.y += adjustedMoonSpeed * realTimeMultiplier;
          moon.mesh.rotation.y += 0.02 * realTimeMultiplier;
        });
      }
    });

    // Animate asteroid belts
    Object.values(asteroidBelts).forEach(belt => {
      belt.forEach((asteroid) => {
        // Rotate individual asteroids
        asteroid.mesh.rotation.x += asteroid.rotationSpeed.x * realTimeMultiplier;
        asteroid.mesh.rotation.y += asteroid.rotationSpeed.y * realTimeMultiplier;
        asteroid.mesh.rotation.z += asteroid.rotationSpeed.z * realTimeMultiplier;
        
        // Orbit around sun
        asteroid.angle += asteroid.orbitSpeed * realTimeMultiplier;
        asteroid.mesh.position.x = Math.cos(asteroid.angle) * asteroid.radius;
        asteroid.mesh.position.z = Math.sin(asteroid.angle) * asteroid.radius;
      });
    });

    // Animate distant stars (subtle rotation)
    distantStars.rotation.y += 0.0001 * realTimeMultiplier;
  }

  controls.update();
  
  // Update camera to follow planet if one is selected
  if (followingPlanet) {
    const planetPos = new THREE.Vector3();
    followingPlanet.mesh.getWorldPosition(planetPos);
    
    // Calculate how much the planet has moved since last frame
    const planetMovement = planetPos.clone().sub(lastPlanetPosition);
    
    // Only update if this isn't the first frame of following
    if (!lastPlanetPosition.equals(new THREE.Vector3(0, 0, 0))) {
      // Move camera and target by the same amount the planet moved
      camera.position.add(planetMovement);
      controls.target.add(planetMovement);
    } else {
      // First frame - set initial positions
      camera.position.copy(planetPos.clone().add(followOffset));
      controls.target.copy(planetPos);
    }
    
    // Store current planet position for next frame
    lastPlanetPosition.copy(planetPos);
  }
  
  // Update planet label positions
  updatePlanetLabels();
  
  // Update moon label positions
  updateMoonLabels();
  
  // Dynamic bloom based on camera distance to sun (only when not in manual mode)
  const distanceToSun = camera.position.distanceTo(sun.position);
  const maxDistance = 100;
  const minDistance = 10;
  const normalizedDistance = Math.max(0, Math.min(1, (distanceToSun - minDistance) / (maxDistance - minDistance)));
  
  // Adjust bloom intensity - closer to sun = stronger bloom (only if not manual)
  if (bloomPass && !isBloomManual) {
    bloomPass.strength = 0.5 + (1 - normalizedDistance) * 1.0; // Range: 0.5 to 1.5
    bloomPass.radius = 0.6 + (1 - normalizedDistance) * 0.4;   // Range: 0.6 to 1.0
  } else if (bloomPass && isBloomManual) {
    // Keep manual settings but allow radius to still be dynamic for better visual effect
    bloomPass.strength = manualBloomStrength;
    bloomPass.radius = 0.6 + (1 - normalizedDistance) * 0.2; // Slight radius variation
  }
  
  // Try composer first, fallback to direct rendering if it fails
  try {
    composer.render();
  } catch (error) {
    console.error("Composer rendering failed, falling back to direct rendering:", error);
    // Force direct rendering without post-processing
    renderer.render(scene, camera);
  }
}

animate();

// Speed control
const speedControl = document.getElementById('speedControl');
const speedValue = document.getElementById('speedValue');
if (speedControl && speedValue) {
  speedControl.addEventListener('input', (e) => {
    animationSpeed = parseFloat(e.target.value);
    if (animationSpeed === 0) {
      speedValue.textContent = '0x Real Earth Time';
    } else if (animationSpeed < 1) {
      speedValue.textContent = animationSpeed.toFixed(1) + 'x Slow';
    } else {
      speedValue.textContent = animationSpeed.toFixed(1) + 'x Fast';
    }
  });
}

// UI Hide/Show functionality
const hideUIBtn = document.getElementById('hideUIBtn');
const showUIBtn = document.getElementById('showUIBtn');
const uiControls = document.getElementById('uiControls');
const celestialPanel = document.querySelector('.celestial-panel');
const infoPanel = document.querySelector('.info');

if (hideUIBtn && showUIBtn && uiControls) {
  hideUIBtn.addEventListener('click', () => {
    // Hide all UI elements
    uiControls.classList.add('ui-hidden');
    if (celestialPanel) celestialPanel.classList.add('ui-hidden');
    if (infoPanel) infoPanel.classList.add('ui-hidden');
    
    // Show the "Show UI" button
    showUIBtn.style.display = 'block';
  });
  
  showUIBtn.addEventListener('click', () => {
    // Show all UI elements
    uiControls.classList.remove('ui-hidden');
    if (celestialPanel) celestialPanel.classList.remove('ui-hidden');
    if (infoPanel) infoPanel.classList.remove('ui-hidden');
    
    // Hide the "Show UI" button
    showUIBtn.style.display = 'none';
  });
}

// Enhanced Bloom control with manual/auto toggle
const bloomControl = document.getElementById('bloomControl');
const bloomValue = document.getElementById('bloomValue');
if (bloomControl && bloomValue) {
  // Force manual mode and set initial bloom to 0.5
  isBloomManual = true;
  manualBloomStrength = 0.5;
  bloomPass.strength = 0.5;
  bloomControl.value = 0.5;
  bloomValue.textContent = '0.5';

  bloomControl.addEventListener('input', (e) => {
    const strength = parseFloat(e.target.value);
    manualBloomStrength = strength;
    isBloomManual = true; // Enable manual mode when user adjusts slider
    bloomPass.strength = strength;
    bloomValue.textContent = strength.toFixed(1);

    // Update bloom mode button if it exists
    const bloomModeBtn = document.getElementById('bloomModeBtn');
    if (bloomModeBtn) {
      bloomModeBtn.textContent = 'Auto Bloom';
      bloomModeBtn.classList.add('active');
    }

    console.log(`🎛️ Manual bloom set to: ${strength}`);
  });
}

// Bloom mode toggle (Auto/Manual)
const bloomModeBtn = document.getElementById('bloomModeBtn');
if (bloomModeBtn) {
  bloomModeBtn.addEventListener('click', () => {
    isBloomManual = !isBloomManual;
    bloomModeBtn.textContent = isBloomManual ? 'Auto Bloom' : 'Manual Bloom';
    bloomModeBtn.classList.toggle('active', isBloomManual);
    
    if (!isBloomManual) {
      console.log('Switched to automatic bloom mode');
    } else {
      console.log('Switched to manual bloom mode');
      bloomPass.strength = manualBloomStrength;
    }
  });
  
  // Set initial state
  bloomModeBtn.textContent = isBloomManual ? 'Auto Bloom' : 'Manual Bloom';
  bloomModeBtn.classList.toggle('active', isBloomManual);
}

// Pause button
const pauseBtn = document.getElementById('pauseBtn');
if (pauseBtn) {
  pauseBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
    pauseBtn.classList.toggle('active', isPaused);
  });
}

// Reset view button
const resetBtn = document.getElementById('resetBtn');
if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    // Stop following any planet
    followingPlanet = null;
    lastPlanetPosition.set(0, 0, 0);
    userCameraOffset.set(0, 0, 0);
    
    // Reset camera to original position
    camera.position.set(0, 20, 60);
    controls.target.set(0, 0, 0);
    controls.reset();
  });
}

// Music controls
const spaceMusic = document.getElementById('spaceMusic');
const musicBtn = document.getElementById('musicBtn');
const muteMusicBtn = document.getElementById('muteMusicBtn');
const floatingMusicBtn = document.getElementById('floatingMusicBtn');
const floatingMuteMusicBtn = document.getElementById('floatingMuteMusicBtn');
const volumeControl = document.getElementById('volumeControl');
const volumeValue = document.getElementById('volumeValue');

let isMusicPlaying = false;

// Create atmospheric space audio using Web Audio API as fallback
let audioContext;
let atmosphereGain;
let oscillator1, oscillator2, oscillator3;

function createAtmosphericAudio() {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    atmosphereGain = audioContext.createGain();
    atmosphereGain.connect(audioContext.destination);
    atmosphereGain.gain.value = 0.3;
    
    // Create deep space ambience with multiple oscillators
    oscillator1 = audioContext.createOscillator();
    oscillator1.type = 'sine';
    oscillator1.frequency.setValueAtTime(60, audioContext.currentTime); // Deep bass
    
    oscillator2 = audioContext.createOscillator();
    oscillator2.type = 'triangle';
    oscillator2.frequency.setValueAtTime(120, audioContext.currentTime); // Harmonic
    
    oscillator3 = audioContext.createOscillator();
    oscillator3.type = 'sine';
    oscillator3.frequency.setValueAtTime(40, audioContext.currentTime); // Very deep
    
    // Add some filtering for a more ethereal sound
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, audioContext.currentTime);
    
    // Connect oscillators through filter to gain
    oscillator1.connect(filter);
    oscillator2.connect(filter);
    oscillator3.connect(filter);
    filter.connect(atmosphereGain);
    
    // Start oscillators
    oscillator1.start();
    oscillator2.start();
    oscillator3.start();
    
    // Add subtle frequency modulation for organic feel
    setInterval(() => {
      if (oscillator1 && audioContext.state === 'running') {
        oscillator1.frequency.setValueAtTime(
          60 + Math.sin(Date.now() * 0.001) * 5, 
          audioContext.currentTime
        );
        oscillator2.frequency.setValueAtTime(
          120 + Math.sin(Date.now() * 0.0015) * 8, 
          audioContext.currentTime
        );
      }
    }, 100);
    
    return true;
  } catch (error) {
    console.warn("Web Audio API not supported, using HTML5 audio only");
    return false;
  }
}

// Function to start music (used by both button sets)
function startMusic() {
  if (!isMusicPlaying) {
    // Try to play the HTML5 audio first (your Interstellar soundtrack)
    spaceMusic.play().then(() => {
      console.log("Interstellar soundtrack started");
      isMusicPlaying = true;
      updateMusicButtonStates(true);
    }).catch((error) => {
      console.log("HTML5 audio failed, trying Web Audio API:", error);
      // Fallback to Web Audio API atmospheric sounds
      if (createAtmosphericAudio()) {
        isMusicPlaying = true;
        updateMusicButtonStates(true);
        console.log("Atmospheric audio started");
      } else {
        alert("🎵 Audio not available\n\nFor the best experience, try:\n• Check your browser audio settings\n• Ensure audio is not blocked\n• Try a different browser");
      }
    });
  }
}

// Function to stop music (used by both button sets)
function stopMusic() {
  if (isMusicPlaying) {
    // Stop HTML5 audio
    spaceMusic.pause();
    spaceMusic.currentTime = 0;
    
    // Stop Web Audio API
    if (audioContext && audioContext.state === 'running') {
      audioContext.suspend();
    }
    
    isMusicPlaying = false;
    updateMusicButtonStates(false);
    console.log("Music stopped");
  }
}

// Function to update all music button states
function updateMusicButtonStates(isPlaying) {
  // Update panel music buttons
  if (musicBtn && muteMusicBtn) {
    musicBtn.style.display = isPlaying ? 'none' : 'inline-block';
    muteMusicBtn.style.display = isPlaying ? 'inline-block' : 'none';
    if (isPlaying) {
      musicBtn.classList.add('active');
    } else {
      musicBtn.classList.remove('active');
    }
  }
  
  // Update floating music buttons
  if (floatingMusicBtn && floatingMuteMusicBtn) {
    floatingMusicBtn.style.display = isPlaying ? 'none' : 'flex';
    floatingMuteMusicBtn.style.display = isPlaying ? 'flex' : 'none';
  }
}

// Panel music button events
if (musicBtn) {
  musicBtn.addEventListener('click', startMusic);
}

if (muteMusicBtn) {
  muteMusicBtn.addEventListener('click', stopMusic);
}

// Floating music button events
if (floatingMusicBtn) {
  floatingMusicBtn.addEventListener('click', startMusic);
}

if (floatingMuteMusicBtn) {
  floatingMuteMusicBtn.addEventListener('click', stopMusic);
}

// Volume control
if (volumeControl && volumeValue) {
  volumeControl.addEventListener('input', (e) => {
    const volume = parseFloat(e.target.value);
    
    // Update HTML5 audio volume
    spaceMusic.volume = volume;
    
    // Update Web Audio API volume
    if (atmosphereGain) {
      atmosphereGain.gain.value = volume;
    }
    
    // Update display
    volumeValue.textContent = Math.round(volume * 100) + '%';
  });
  
  // Set initial volume
  spaceMusic.volume = 0.3;
}

// Toggle controls
const orbitsBtn = document.getElementById('orbitsBtn');
if (orbitsBtn) {
  orbitsBtn.addEventListener('click', () => {
    showOrbits = !showOrbits;
    orbitsBtn.classList.toggle('active', showOrbits);
    
    // Toggle visibility for all orbit rings
    planetMeshes.forEach(planet => {
      if (planet.orbit) {
        planet.orbit.visible = showOrbits;
      }
    });
  });
}

// Individual asteroid belt controls
const mainAsteroidsBtn = document.getElementById('mainAsteroidsBtn');
if (mainAsteroidsBtn) {
  mainAsteroidsBtn.addEventListener('click', () => {
    const isVisible = !asteroidBelts.main[0]?.mesh.visible;
    mainAsteroidsBtn.classList.toggle('active', isVisible);
    
    asteroidBelts.main.forEach(asteroid => {
      asteroid.mesh.visible = isVisible;
    });
  });
}

const trojansBtn = document.getElementById('trojansBtn');
if (trojansBtn) {
  trojansBtn.addEventListener('click', () => {
    const isVisible = !asteroidBelts.trojans[0]?.mesh.visible;
    trojansBtn.classList.toggle('active', isVisible);
    
    asteroidBelts.trojans.forEach(asteroid => {
      asteroid.mesh.visible = isVisible;
    });
  });
}

const kuiperBtn = document.getElementById('kuiperBtn');
if (kuiperBtn) {
  kuiperBtn.addEventListener('click', () => {
    const isVisible = !asteroidBelts.kuiper[0]?.mesh.visible;
    kuiperBtn.classList.toggle('active', isVisible);
    
    asteroidBelts.kuiper.forEach(asteroid => {
      asteroid.mesh.visible = isVisible;
    });
  });
}

const scatteredBtn = document.getElementById('scatteredBtn');
if (scatteredBtn) {
  scatteredBtn.addEventListener('click', () => {
    const isVisible = !asteroidBelts.scattered[0]?.mesh.visible;
    scatteredBtn.classList.toggle('active', isVisible);
    
    asteroidBelts.scattered.forEach(asteroid => {
      asteroid.mesh.visible = isVisible;
    });
  });
}

const moonsBtn = document.getElementById('moonsBtn');
if (moonsBtn) {
  moonsBtn.addEventListener('click', () => {
    showMoons = !showMoons;
    moonsBtn.classList.toggle('active', showMoons);
    
    planetMeshes.forEach(planet => {
      if (planet.moons) {
        planet.moons.forEach(moon => {
          moon.mesh.visible = showMoons;
        });
      }
    });
  });
}

// Planet label toggle
const labelToggle = document.getElementById('labelToggle');
if (labelToggle) {
  labelToggle.addEventListener('click', () => {
    showPlanetLabels = !showPlanetLabels;
    labelToggle.classList.toggle('active', showPlanetLabels);
    labelToggle.textContent = showPlanetLabels ? 'Hide Planet Names' : 'Show Planet Names';
    
    planetLabels.forEach(label => {
      label.element.style.display = showPlanetLabels ? 'block' : 'none';
    });
  });
}

// Moon label toggle
const moonLabelToggle = document.getElementById('moonLabelToggle');
if (moonLabelToggle) {
  moonLabelToggle.addEventListener('click', () => {
    showMoonLabels = !showMoonLabels;
    moonLabelToggle.classList.toggle('active', showMoonLabels);
    moonLabelToggle.textContent = showMoonLabels ? 'Hide Moon Names' : 'Show Moon Names';
    
    moonLabels.forEach(label => {
      label.element.style.display = showMoonLabels ? 'block' : 'none';
    });
  });
}

// Planet list population
const planetList = document.getElementById('planetList');
if (planetList) {
  // Group objects by type
  const groupedBodies = {
    planet: celestialBodies.filter(b => b.type === 'planet'),
    dwarf: celestialBodies.filter(b => b.type === 'dwarf'),
    asteroid: celestialBodies.filter(b => b.type === 'asteroid'),
    tno: celestialBodies.filter(b => b.type === 'tno')
  };

  const typeLabels = {
    planet: '🪐 PLANETS',
    dwarf: '🌍 DWARF PLANETS', 
    asteroid: '☄️ MAJOR ASTEROIDS',
    tno: '🌌 TRANS-NEPTUNIAN OBJECTS'
  };

  Object.entries(groupedBodies).forEach(([type, bodies]) => {
    if (bodies.length === 0) return;
    
    // Create category header
    const categoryHeader = document.createElement('div');
    categoryHeader.className = 'category-header';
    categoryHeader.innerHTML = `<strong>${typeLabels[type]}</strong>`;
    planetList.appendChild(categoryHeader);

    bodies.forEach((body, localIndex) => {
      const globalIndex = celestialBodies.indexOf(body);
      const planetItem = document.createElement('div');
      planetItem.className = `planet-item ${body.type}`;
      
      const moonText = body.moons && body.moons.length > 0 ? 
        `<br><small>🌙 Moons: ${body.moons.length}</small>` : '';
      
      planetItem.innerHTML = `
        <strong>${body.name}</strong>
        <br><small>📏 Distance: ${body.dist} AU | Size: ${body.size}</small>
        <br><small>🗓️ Discovered: ${body.discoveryYear}</small>
        ${moonText}
      `;
      
      planetItem.addEventListener('click', () => {
        // Start following the selected planet
        const planet = planetMeshes[globalIndex];
        if (planet) {
          followingPlanet = planet;
          
          // Set initial follow offset based on planet size
          const distance = Math.max(body.size * 8, 15);
          followOffset.set(distance, distance * 0.5, distance);
          
          // Reset tracking variables
          lastPlanetPosition.set(0, 0, 0);
          userCameraOffset.set(0, 0, 0);
          
          // Initial camera positioning
          const planetPos = new THREE.Vector3();
          planet.mesh.getWorldPosition(planetPos);
          
          camera.position.copy(planetPos.clone().add(followOffset));
          controls.target.copy(planetPos);
          controls.update();
        }
      });
      
      planetList.appendChild(planetItem);
    });
  });
}

// Raycaster for planet clicking
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
  // Don't process clicks if they're on UI elements
  if (event.target.closest('.controls') || event.target.closest('.celestial-panel') || event.target.closest('.info')) {
    return;
  }
  
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  
  const planetMeshObjects = planetMeshes.map(p => p.mesh);
  const intersects = raycaster.intersectObjects(planetMeshObjects);
  
  if (intersects.length > 0) {
    const intersectedObject = intersects[0].object;
    const planetIndex = planetMeshObjects.indexOf(intersectedObject);
    
    if (planetIndex !== -1) {
      const body = celestialBodies[planetIndex];
      const planet = planetMeshes[planetIndex];
      
      // Start following the clicked planet
      followingPlanet = planet;
      
      // Set follow offset based on planet size
      const distance = Math.max(body.size * 8, 15);
      followOffset.set(distance, distance * 0.5, distance);
      
      // Reset tracking variables
      lastPlanetPosition.set(0, 0, 0);
      userCameraOffset.set(0, 0, 0);
      
      // Show enhanced planet info
      const moonInfo = body.moons && body.moons.length > 0 ? 
        `\n🌙 Moons: ${body.moons.length}` : '\n🌙 Moons: None';
      
      alert(`🌟 Now following: ${body.name}\n\n` +
            `📂 Type: ${body.type === 'dwarf' ? 'Dwarf Planet' : 
                      body.type === 'planet' ? 'Planet' : 
                      body.type === 'asteroid' ? 'Major Asteroid' : 
                      'Trans-Neptunian Object'}\n` +
            `📏 Distance: ${body.dist} AU\n` +
            `🗓️ Discovery: ${body.discoveryYear}${moonInfo}\n\n` +
            `ℹ️ ${body.info}\n\n` +
            `✨ Enhanced Features:\n` +
            `• Glowing orbit rings for visibility\n` +
            `• Color-coded by object type\n` +
            `• Pulsing effect for distant objects\n\n` +
            `🎮 Controls:\n` +
            `• Mouse: Orbit around object\n` +
            `• Scroll: Zoom in/out\n` +
            `• R key or Reset: Stop following\n` +
            `• O key: Toggle glowing orbits`);
    }
  }
}

window.addEventListener('click', onMouseClick);

// Keyboard shortcuts
window.addEventListener('keydown', (event) => {
  switch(event.key.toLowerCase()) {
    case ' ': // Spacebar to pause/resume
      event.preventDefault();
      const pauseBtn = document.getElementById('pauseBtn');
      if (pauseBtn) pauseBtn.click();
      break;
    case 'r': // R to reset view
      const resetBtn = document.getElementById('resetBtn');
      if (resetBtn) resetBtn.click();
      break;
    case 'f': // F to stop following planet
      followingPlanet = null;
      lastPlanetPosition.set(0, 0, 0);
      userCameraOffset.set(0, 0, 0);
      break;
    case 'o': // O to toggle orbits
      const orbitsBtn = document.getElementById('orbitsBtn');
      if (orbitsBtn) orbitsBtn.click();
      break;
    case 'a': // A to cycle through asteroid belt types
      const asteroidButtons = [
        document.getElementById('mainAsteroidsBtn'),
        document.getElementById('trojansBtn'),
        document.getElementById('kuiperBtn'),
        document.getElementById('scatteredBtn')
      ];
      
      // Find the first visible belt and toggle to next one
      let foundVisible = false;
      for (let i = 0; i < asteroidButtons.length; i++) {
        if (asteroidButtons[i] && asteroidButtons[i].classList.contains('active')) {
          asteroidButtons[i].click(); // Turn off current
          const nextIndex = (i + 1) % asteroidButtons.length;
          if (asteroidButtons[nextIndex]) {
            asteroidButtons[nextIndex].click(); // Turn on next
          }
          foundVisible = true;
          break;
        }
      }
      
      // If none were visible, turn on the first one
      if (!foundVisible && asteroidButtons[0]) {
        asteroidButtons[0].click();
      }
      break;
    case 'm': // M to toggle moons
      const moonsBtn = document.getElementById('moonsBtn');
      if (moonsBtn) moonsBtn.click();
      break;
    case 'h': // H to toggle UI visibility
      const hideUIBtn = document.getElementById('hideUIBtn');
      const showUIBtn = document.getElementById('showUIBtn');
      if (hideUIBtn && showUIBtn) {
        if (showUIBtn.style.display === 'block') {
          showUIBtn.click();
        } else {
          hideUIBtn.click();
        }
      }
      break;
    case 'p': // P to toggle music (Play/Pause)
      const musicBtn = document.getElementById('musicBtn');
      const muteMusicBtn = document.getElementById('muteMusicBtn');
      if (isMusicPlaying && muteMusicBtn) {
        muteMusicBtn.click();
      } else if (!isMusicPlaying && musicBtn) {
        musicBtn.click();
      }
      break;
    case '+':
    case '=': // Increase speed
      event.preventDefault();
      const speedControl = document.getElementById('speedControl');
      if (speedControl) {
        const currentSpeed = parseFloat(speedControl.value);
        const newSpeed = Math.min(10, currentSpeed + 0.5); // Max 10x speed, increment by 0.5
        speedControl.value = newSpeed;
        speedControl.dispatchEvent(new Event('input'));
      }
      break;
    case '-': // Decrease speed
      event.preventDefault();
      const speedControlDec = document.getElementById('speedControl');
      if (speedControlDec) {
        const currentSpeed = parseFloat(speedControlDec.value);
        const newSpeed = Math.max(0, currentSpeed - 0.5); // Min 0x speed, decrement by 0.5
        speedControlDec.value = newSpeed;
        speedControlDec.dispatchEvent(new Event('input'));
      }
      break;
    case 'b': // B to toggle bloom mode (Auto/Manual)
      event.preventDefault();
      isBloomManual = !isBloomManual;
      const bloomModeBtn = document.getElementById('bloomModeBtn');
      if (bloomModeBtn) {
        bloomModeBtn.textContent = isBloomManual ? 'Auto Bloom' : 'Manual Bloom';
        bloomModeBtn.classList.toggle('active', isBloomManual);
      }
      
      if (!isBloomManual) {
        console.log('🌟 Switched to automatic bloom mode (dynamic with distance)');
      } else {
        console.log('🎛️ Switched to manual bloom mode (slider control)');
        bloomPass.strength = manualBloomStrength;
      }
      break;
  }
});

// Enhanced camera controls - Smooth and cinematic
controls.enablePan = true;
controls.enableZoom = true;
controls.enableRotate = true;
controls.minDistance = 8;
controls.maxDistance = 150;
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI;
controls.autoRotate = false;
controls.autoRotateSpeed = 0.3;
controls.target.set(0, 0, 0);

// Set initial camera position for better view
camera.position.set(0, 20, 60);

// Handle resizing
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  
  // Update planet labels on resize
  updatePlanetLabels();
  
  // Update moon labels on resize
  updateMoonLabels();
});


