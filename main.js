import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { Lensflare, LensflareElement } from "three/examples/jsm/objects/Lensflare.js";

// NASA API Key for real-time planet data
const NASA_API_KEY = "CH3TuB34hg317ulEggcZCMlKgCCPYQeTzdzJDNCz";

// Scene and Camera Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000814);
scene.fog = new THREE.Fog(0x000814, 180, 250);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.rotateSpeed = 0.3;
controls.zoomSpeed = 0.8;
controls.panSpeed = 0.5;

// Texture Loader
const loader = new THREE.TextureLoader();
loader.manager.onLoad = () => console.log("All textures loaded!");
loader.manager.onError = (url) => console.error("Error loading texture:", url);

// Lighting
const ambientLight = new THREE.AmbientLight(new THREE.Color(0.13, 0.13, 0.13), 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(new THREE.Color(1.0, 1.0, 1.0), 10.0, 1000, 0.5);
pointLight.position.set(0, 0, 0);
pointLight.castShadow = false;
scene.add(pointLight);

const fillLight = new THREE.PointLight(new THREE.Color(0.2, 0.4, 1.0), 2.0, 100, 1);
fillLight.position.set(50, 50, -100);
scene.add(fillLight);

// Starfield
const starTexture = loader.load("/textures/8k_stars.jpg");
const skyTexture = loader.load("/textures/stars.jpg");
const starGeo = new THREE.SphereGeometry(200, 64, 64);
const starMat = new THREE.MeshBasicMaterial({
  map: starTexture,
  side: THREE.BackSide,
  toneMapped: false,
  color: new THREE.Color(1.2, 1.2, 1.2),
});
const starfield = new THREE.Mesh(starGeo, starMat);
scene.add(starfield);

const skyGeo = new THREE.SphereGeometry(190, 64, 64);
const skyMat = new THREE.MeshBasicMaterial({
  map: skyTexture,
  side: THREE.BackSide,
  toneMapped: false,
  transparent: true,
  opacity: 0.3,
  color: new THREE.Color(0.8, 0.9, 1.0),
});
const skyfield = new THREE.Mesh(skyGeo, skyMat);
scene.add(skyfield);

// Sun
const sunMaterial = new THREE.MeshBasicMaterial({
  map: loader.load("/textures/sun.jpg"),
  emissive: new THREE.Color(1.5, 1.2, 0.8),
  emissiveIntensity: 1.8,
  toneMapped: false,
  color: new THREE.Color(1.2, 1.1, 0.9)
});
const sun = new THREE.Mesh(new THREE.SphereGeometry(5, 64, 64), sunMaterial);
scene.add(sun);

// Lens flare
const textureLoader = new THREE.TextureLoader();
const textureFlare0 = textureLoader.load("/textures/lensflare0.png");
const textureFlare2 = textureLoader.load("/textures/lensflare2.png");
const lensflare = new Lensflare();
lensflare.addElement(new LensflareElement(textureFlare0, 512, 0, new THREE.Color(1, 0.9, 0.8)));
lensflare.addElement(new LensflareElement(textureFlare2, 128, 0.2, new THREE.Color(1, 1, 0.6)));
lensflare.addElement(new LensflareElement(textureFlare2, 64, 0.4, new THREE.Color(0.8, 0.8, 1)));
lensflare.addElement(new LensflareElement(textureFlare2, 32, 0.6, new THREE.Color(1, 0.8, 0.6)));
sun.add(lensflare);

// Fetch asteroid orbital elements from NASA JPL SBDB API
async function fetchAsteroidOrbitalElements(designation = 'Ceres') {
  const url = `https://ssd-api.jpl.nasa.gov/sbdb.api?sstr=${designation}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data && data.orb) {
      const orb = data.orb;
      return {
        a: parseFloat(orb.a),
        e: parseFloat(orb.e),
        i: parseFloat(orb.i),
        om: parseFloat(orb.om),
        w: parseFloat(orb.w),
        ma: parseFloat(orb.ma)
      };
    }
  } catch (err) {
    console.error('Asteroid API error:', err);
  }
  return null;
}

// Compute asteroid position from orbital elements
function keplerToCartesian(orb, epochJD = 2460000) {
  const DEG2RAD = Math.PI / 180;
  const a = orb.a;
  const e = orb.e;
  const i = orb.i * DEG2RAD;
  const om = orb.om * DEG2RAD;
  const w = orb.w * DEG2RAD;
  let M = orb.ma * DEG2RAD;

  let E = M;
  for (let j = 0; j < 10; j++) {
    E = M + e * Math.sin(E);
  }
  const nu = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
  const r = a * (1 - e * Math.cos(E));
  const x_orb = r * Math.cos(nu);
  const y_orb = r * Math.sin(nu);
  const x = x_orb * (Math.cos(w) * Math.cos(om) - Math.sin(w) * Math.sin(om) * Math.cos(i)) - y_orb * (Math.sin(w) * Math.cos(om) + Math.cos(w) * Math.sin(om) * Math.cos(i));
  const y = x_orb * (Math.cos(w) * Math.sin(om) + Math.sin(w) * Math.cos(om) * Math.cos(i)) + y_orb * (Math.cos(w) * Math.cos(om) * Math.cos(i) - Math.sin(w) * Math.sin(om));
  const z = x_orb * Math.sin(w) * Math.sin(i) + y_orb * Math.cos(w) * Math.sin(i);
  return { x, y, z };
}

// Fetch Near-Earth Objects from NASA
async function fetchNEOs() {
  const url = `https://api.nasa.gov/neo/rest/v1/neo/browse?api_key=${NASA_API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.near_earth_objects || [];
  } catch (err) {
    console.error('NEO API error:', err);
    return [];
  }
}

// Fetch Sentry risk objects from JPL
async function fetchSentryObjects() {
  const url = 'https://ssd-api.jpl.nasa.gov/sentry.api';
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.data || [];
  } catch (err) {
    console.error('Sentry API error:', err);
    return [];
  }
}

// Fetch comet data from JPL CAD
async function fetchComets() {
  const url = 'https://ssd-api.jpl.nasa.gov/cad.api?body=COM';
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.data || [];
  } catch (err) {
    console.error('Comet API error:', err);
    return [];
  }
}

// Fetch specific famous asteroids
async function fetchFamousAsteroids() {
  // List of famous/currently notable asteroids
  const famousAsteroids = [
    'Apophis',      // Close approach asteroid
    'Bennu',        // OSIRIS-REx target
    'Ryugu',        // Hayabusa2 target
    'Didymos',      // DART mission target
    'Dimorphos',    // DART mission target moon
    'Itokawa',      // First asteroid sample return
    'Psyche',       // Metal asteroid (future mission)
    'Vesta',        // Large asteroid
    'Ceres',        // Dwarf planet
    'Pallas',       // Large asteroid
    'Hygiea',       // Large asteroid
    'Eros',         // NEAR Shoemaker target
    'Gaspra',       // Galileo mission target
    'Ida',          // Galileo mission target
    'Mathilde',     // NEAR Shoemaker target
    'Steins',       // Rosetta mission target
    'Lutetia',      // Rosetta mission target
    'Dinkinesh',    // Lucy mission target
    'Toutatis',     // Chang'e 2 flyby
    'Florence',     // Large near-Earth asteroid
    'Icarus',       // Mercury-crossing asteroid
    'Geographos',   // Elongated near-Earth asteroid
    'Castalia',     // Near-Earth asteroid
    'Toro',         // Near-Earth asteroid
    'Amor',         // Amor group asteroid
    'Apollo',       // Apollo group asteroid
    'Anteros',      // Near-Earth asteroid
    'Ganymed',      // Large near-Earth asteroid
    'Ivar',         // Binary near-Earth asteroid
    'Daphne',       // Large main belt asteroid
    'Europa',       // Large main belt asteroid
    'Davida',       // Large main belt asteroid
    'Interamnia',   // Large main belt asteroid
    'Hebe',         // Main belt asteroid
    'Iris',         // Bright main belt asteroid
    'Flora',        // Main belt asteroid
    'Metis',        // Main belt asteroid
    'Parthenope',   // Main belt asteroid
    'Eunomia',      // Main belt asteroid
    'Juno',         // Main belt asteroid
    'Astraea',      // Main belt asteroid
    'Thisbe',       // Main belt asteroid
    'Cybele',       // Outer main belt asteroid
    'Herculina',    // Main belt asteroid
    'Sylvia',       // Triple asteroid system
    'Patroclus',    // Jupiter trojan
    'Hektor',       // Large Jupiter trojan
    'Euphrosyne',   // Main belt asteroid
    'Fortuna',      // Main belt asteroid
    'Massalia',     // Main belt asteroid
    'Lutetia',      // Main belt asteroid
    'Kleopatra',    // Metal asteroid with moons
    'Dactyl',       // Moon of Ida
    'Linus',        // Trojan asteroid
    'Eurybates',    // Jupiter trojan (Lucy target)
    'Polymele',     // Jupiter trojan (Lucy target)
    'Leucus',       // Jupiter trojan (Lucy target)
    'Orus',         // Jupiter trojan (Lucy target)
    'Donaldjohanson' // Jupiter trojan (Lucy target)
  ];

  const asteroidData = [];
  for (const asteroid of famousAsteroids) {
    try {
      const orb = await fetchAsteroidOrbitalElements(asteroid);
      if (orb) {
        asteroidData.push({ name: asteroid, orb: orb });
      }
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch (error) {
      console.error(`Error fetching ${asteroid}:`, error);
    }
  }
  return asteroidData;
}

// Real objects arrays
const realAsteroids = [];
const cometObjects = [];
const famousAsteroids = [];

// Add real asteroids to scene
async function addRealAsteroids() {
  try {
    // Fetch famous asteroids first
    const famousData = await fetchFamousAsteroids();
    console.log(`Fetched ${famousData.length} famous asteroids`);
    
    // Add famous asteroids with special visualization
    for (const data of famousData) {
      const pos = keplerToCartesian(data.orb);
      const AU_TO_SCENE = 15;
      
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.2 + Math.random() * 0.1, 12, 12),
        new THREE.MeshStandardMaterial({ 
          color: 0x00ff00, // Green for famous asteroids
          emissive: 0x003300
        })
      );
      
      mesh.position.set(pos.x * AU_TO_SCENE, pos.y * AU_TO_SCENE, pos.z * AU_TO_SCENE);
      mesh.userData = { type: 'famous', name: data.name, data: data };
      scene.add(mesh);
      famousAsteroids.push(mesh);
      
      // Add orbit path
      const orbitPoints = [];
      for (let i = 0; i <= 100; i++) {
        const angle = (i / 100) * Math.PI * 2;
        const fakeOrb = { ...data.orb, ma: angle * 180 / Math.PI };
        const orbitPos = keplerToCartesian(fakeOrb);
        orbitPoints.push(new THREE.Vector3(
          orbitPos.x * AU_TO_SCENE,
          orbitPos.y * AU_TO_SCENE,
          orbitPos.z * AU_TO_SCENE
        ));
      }
      
      const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
      const orbitMaterial = new THREE.LineBasicMaterial({ 
        color: 0x00ff00,
        transparent: true,
        opacity: 0.3
      });
      const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
      scene.add(orbitLine);
    }
    
    // Fetch and add NEOs
    const neoObjects = await fetchNEOs();
    console.log(`Fetched ${neoObjects.length} NEOs`);
    
    for (let i = 0; i < Math.min(30, neoObjects.length); i++) {
      const neo = neoObjects[i];
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.15 + Math.random() * 0.1, 8, 8),
        new THREE.MeshStandardMaterial({ 
          color: 0xff5555, // Red for NEOs
          emissive: 0x330000
        })
      );
      mesh.userData = { type: 'neo', data: neo };
      scene.add(mesh);
      realAsteroids.push(mesh);
    }
    
    // Fetch and add Sentry objects
    const sentryObjects = await fetchSentryObjects();
    console.log(`Fetched ${sentryObjects.length} Sentry objects`);
    
    for (let i = 0; i < Math.min(20, sentryObjects.length); i++) {
      const obj = sentryObjects[i];
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.18 + Math.random() * 0.1, 8, 8),
        new THREE.MeshStandardMaterial({ 
          color: 0xffaa00, // Orange for Sentry
          emissive: 0x332200
        })
      );
      mesh.userData = { type: 'sentry', data: obj };
      scene.add(mesh);
      realAsteroids.push(mesh);
    }
  } catch (error) {
    console.error('Error adding real asteroids:', error);
  }
}

// Add comets to scene
async function addComets() {
  try {
    const comets = await fetchComets();
    console.log(`Fetched ${comets.length} comets`);
    
    for (let i = 0; i < Math.min(15, comets.length); i++) {
      const comet = comets[i];
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 8, 8),
        new THREE.MeshStandardMaterial({ 
          color: 0x55aaff, // Blue for comets
          emissive: 0x002233
        })
      );
      
      // Add comet tail
      const tailGeometry = new THREE.ConeGeometry(0.08, 3, 8);
      const tailMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x88ccff,
        transparent: true,
        opacity: 0.7
      });
      const tail = new THREE.Mesh(tailGeometry, tailMaterial);
      tail.rotation.z = Math.PI;
      tail.position.x = -1.5;
      mesh.add(tail);
      
      // Position comet (simplified - in reality would use orbital elements)
      const distance = 30 + Math.random() * 40;
      const angle = Math.random() * Math.PI * 2;
      mesh.position.set(
        Math.cos(angle) * distance,
        (Math.random() - 0.5) * 10,
        Math.sin(angle) * distance
      );
      
      mesh.userData = { type: 'comet', data: comet };
      scene.add(mesh);
      cometObjects.push(mesh);
    }
  } catch (error) {
    console.error('Error adding comets:', error);
  }
}

// Enhanced asteroid belt creation with more asteroids
const asteroidBelts = {
  main: [],
  inner: [],      // Inner belt (closer to Mars)
  outer: [],      // Outer belt (closer to Jupiter)
  middle: [],     // Middle belt
  trojans: [],
  kuiper: [],
  scattered: [],
  oort: []        // Oort cloud objects
};

// Create enhanced Main Asteroid Belt with multiple regions
function createEnhancedAsteroidBelt() {
  // Inner belt (closer to Mars)
  const innerCount = 150;
  const innerInnerRadius = 19.5;
  const innerOuterRadius = 21.5;
  
  for (let i = 0; i < innerCount; i++) {
    const angle = (i / innerCount) * Math.PI * 2 + Math.random() * 0.5;
    const radius = innerInnerRadius + Math.random() * (innerOuterRadius - innerInnerRadius);
    const size = 0.01 + Math.random() * 0.06;
    
    const asteroidType = Math.random();
    let color;
    if (asteroidType < 0.5) {
      color = new THREE.Color(0.4, 0.26, 0.13); // C-type
    } else if (asteroidType < 0.8) {
      color = new THREE.Color(0.6, 0.6, 0.6); // S-type
    } else {
      color = new THREE.Color(0.5, 0.4, 0.3); // M-type
    }
    
    const asteroidGeo = new THREE.SphereGeometry(size, 6, 6);
    const asteroidMat = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color.clone().multiplyScalar(0.1),
      emissiveIntensity: 0.15,
      roughness: 1.0,
      metalness: asteroidType > 0.8 ? 0.3 : 0.1,
      toneMapped: false
    });
    
    const asteroid = new THREE.Mesh(asteroidGeo, asteroidMat);
    asteroid.position.x = Math.cos(angle) * radius;
    asteroid.position.z = Math.sin(angle) * radius;
    asteroid.position.y = (Math.random() - 0.5) * 0.8;
    
    asteroid.rotation.x = Math.random() * Math.PI;
    asteroid.rotation.y = Math.random() * Math.PI;
    asteroid.rotation.z = Math.random() * Math.PI;
    
    scene.add(asteroid);
    asteroidBelts.inner.push({
      mesh: asteroid,
      rotationSpeed: {
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02
      },
      orbitSpeed: 0.003 + Math.random() * 0.002,
      radius: radius,
      angle: angle,
      type: 'inner-belt'
    });
  }
  
  // Middle belt
  const middleCount = 200;
  const middleInnerRadius = 21.5;
  const middleOuterRadius = 23.5;
  
  for (let i = 0; i < middleCount; i++) {
    const angle = (i / middleCount) * Math.PI * 2 + Math.random() * 0.5;
    const radius = middleInnerRadius + Math.random() * (middleOuterRadius - middleInnerRadius);
    const size = 0.01 + Math.random() * 0.07;
    
    const asteroidType = Math.random();
    let color;
    if (asteroidType < 0.4) {
      color = new THREE.Color(0.4, 0.26, 0.13);
    } else if (asteroidType < 0.75) {
      color = new THREE.Color(0.6, 0.6, 0.6);
    } else {
      color = new THREE.Color(0.5, 0.4, 0.3);
    }
    
    const asteroidGeo = new THREE.SphereGeometry(size, 6, 6);
    const asteroidMat = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color.clone().multiplyScalar(0.12),
      emissiveIntensity: 0.18,
      roughness: 1.0,
      metalness: asteroidType > 0.75 ? 0.3 : 0.1,
      toneMapped: false
    });
    
    const asteroid = new THREE.Mesh(asteroidGeo, asteroidMat);
    asteroid.position.x = Math.cos(angle) * radius;
    asteroid.position.z = Math.sin(angle) * radius;
    asteroid.position.y = (Math.random() - 0.5) * 1.0;
    
    asteroid.rotation.x = Math.random() * Math.PI;
    asteroid.rotation.y = Math.random() * Math.PI;
    asteroid.rotation.z = Math.random() * Math.PI;
    
    scene.add(asteroid);
    asteroidBelts.middle.push({
      mesh: asteroid,
      rotationSpeed: {
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02
      },
      orbitSpeed: 0.0025 + Math.random() * 0.002,
      radius: radius,
      angle: angle,
      type: 'middle-belt'
    });
  }
  
  // Outer belt (closer to Jupiter)
  const outerCount = 150;
  const outerInnerRadius = 23.5;
  const outerOuterRadius = 25.5;
  
  for (let i = 0; i < outerCount; i++) {
    const angle = (i / outerCount) * Math.PI * 2 + Math.random() * 0.5;
    const radius = outerInnerRadius + Math.random() * (outerOuterRadius - outerInnerRadius);
    const size = 0.01 + Math.random() * 0.08;
    
    const asteroidType = Math.random();
    let color;
    if (asteroidType < 0.3) {
      color = new THREE.Color(0.4, 0.26, 0.13);
    } else if (asteroidType < 0.7) {
      color = new THREE.Color(0.6, 0.6, 0.6);
    } else {
      color = new THREE.Color(0.5, 0.4, 0.3);
    }
    
    const asteroidGeo = new THREE.SphereGeometry(size, 6, 6);
    const asteroidMat = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color.clone().multiplyScalar(0.1),
      emissiveIntensity: 0.2,
      roughness: 1.0,
      metalness: asteroidType > 0.7 ? 0.3 : 0.1,
      toneMapped: false
    });
    
    const asteroid = new THREE.Mesh(asteroidGeo, asteroidMat);
    asteroid.position.x = Math.cos(angle) * radius;
    asteroid.position.z = Math.sin(angle) * radius;
    asteroid.position.y = (Math.random() - 0.5) * 1.2;
    
    asteroid.rotation.x = Math.random() * Math.PI;
    asteroid.rotation.y = Math.random() * Math.PI;
    asteroid.rotation.z = Math.random() * Math.PI;
    
    scene.add(asteroid);
    asteroidBelts.outer.push({
      mesh: asteroid,
      rotationSpeed: {
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02
      },
      orbitSpeed: 0.002 + Math.random() * 0.0015,
      radius: radius,
      angle: angle,
      type: 'outer-belt'
    });
  }
}

// Create Jupiter Trojans with enhanced detail
function createJupiterTrojans() {
  const asteroidCount = 100;
  const jupiterDistance = 25;
  
  // L4 Trojans (60° ahead of Jupiter)
  for (let i = 0; i < asteroidCount / 2; i++) {
    const baseAngle = Math.PI / 3;
    const angle = baseAngle + (Math.random() - 0.5) * 1.0;
    const radius = jupiterDistance + (Math.random() - 0.5) * 4;
    const size = 0.02 + Math.random() * 0.05;
    
    const asteroidGeo = new THREE.SphereGeometry(size, 6, 6);
    const asteroidMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.35, 0.25, 0.15),
      emissive: new THREE.Color(0.15, 0.1, 0.05),
      emissiveIntensity: 0.2,
      roughness: 1.0,
      metalness: 0.05,
      toneMapped: false
    });
    
    const asteroid = new THREE.Mesh(asteroidGeo, asteroidMat);
    asteroid.position.x = Math.cos(angle) * radius;
    asteroid.position.z = Math.sin(angle) * radius;
    asteroid.position.y = (Math.random() - 0.5) * 1.0;
    
    scene.add(asteroid);
    asteroidBelts.trojans.push({
      mesh: asteroid,
      rotationSpeed: {
        x: (Math.random() - 0.5) * 0.015,
        y: (Math.random() - 0.5) * 0.015,
        z: (Math.random() - 0.5) * 0.015
      },
      orbitSpeed: 0.000084,
      radius: radius,
      angle: angle,
      type: 'trojan-l4'
    });
  }
  
  // L5 Trojans (60° behind Jupiter)
  for (let i = 0; i < asteroidCount / 2; i++) {
    const baseAngle = -Math.PI / 3;
    const angle = baseAngle + (Math.random() - 0.5) * 1.0;
    const radius = jupiterDistance + (Math.random() - 0.5) * 4;
    const size = 0.02 + Math.random() * 0.05;
    
    const asteroidGeo = new THREE.SphereGeometry(size, 6, 6);
    const asteroidMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.35, 0.25, 0.15),
      emissive: new THREE.Color(0.15, 0.1, 0.05),
      emissiveIntensity: 0.2,
      roughness: 1.0,
      metalness: 0.05,
      toneMapped: false
    });
    
    const asteroid = new THREE.Mesh(asteroidGeo, asteroidMat);
    asteroid.position.x = Math.cos(angle) * radius;
    asteroid.position.z = Math.sin(angle) * radius;
    asteroid.position.y = (Math.random() - 0.5) * 1.0;
    
    scene.add(asteroid);
    asteroidBelts.trojans.push({
      mesh: asteroid,
      rotationSpeed: {
        x: (Math.random() - 0.5) * 0.015,
        y: (Math.random() - 0.5) * 0.015,
        z: (Math.random() - 0.5) * 0.015
      },
      orbitSpeed: 0.000084,
      radius: radius,
      angle: angle,
      type: 'trojan-l5'
    });
  }
}

// Create Kuiper Belt with enhanced detail
function createKuiperBelt() {
  const asteroidCount = 200;
  const innerRadius = 44;
  const outerRadius = 58;
  
  for (let i = 0; i < asteroidCount; i++) {
    const angle = (i / asteroidCount) * Math.PI * 2 + Math.random() * 1.0;
    const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
    const size = 0.03 + Math.random() * 0.08;
    
    const asteroidType = Math.random();
    let color;
    if (asteroidType < 0.3) {
      color = new THREE.Color(0.6, 0.7, 0.8); // Icy blue-white
    } else if (asteroidType < 0.6) {
      color = new THREE.Color(0.5, 0.4, 0.3); // Rocky brown
    } else {
      color = new THREE.Color(0.7, 0.5, 0.4); // Reddish
    }
    
    const asteroidGeo = new THREE.SphereGeometry(size, 6, 6);
    const asteroidMat = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color.clone().multiplyScalar(0.2),
      emissiveIntensity: 0.4,
      roughness: 0.9,
      metalness: 0.05,
      toneMapped: false
    });
    
    const asteroid = new THREE.Mesh(asteroidGeo, asteroidMat);
    asteroid.position.x = Math.cos(angle) * radius;
    asteroid.position.z = Math.sin(angle) * radius;
    asteroid.position.y = (Math.random() - 0.5) * 3.0;
    
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
      orbitSpeed: 0.0000015 + Math.random() * 0.000002,
      radius: radius,
      angle: angle,
      type: 'kuiper'
    });
  }
}

// Create Scattered Disk
function createScatteredDisk() {
  const asteroidCount = 80;
  const innerRadius = 58;
  const outerRadius = 80;
  
  for (let i = 0; i < asteroidCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
    const size = 0.04 + Math.random() * 0.1;
    
    const color = new THREE.Color(0.6, 0.3, 0.2);
    
    const asteroidGeo = new THREE.SphereGeometry(size, 6, 6);
    const asteroidMat = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color.clone().multiplyScalar(0.25),
      emissiveIntensity: 0.5,
      roughness: 1.0,
      metalness: 0.02,
      toneMapped: false
    });
    
    const asteroid = new THREE.Mesh(asteroidGeo, asteroidMat);
    asteroid.position.x = Math.cos(angle) * radius;
    asteroid.position.z = Math.sin(angle) * radius;
    asteroid.position.y = (Math.random() - 0.5) * 10.0;
    
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
      orbitSpeed: 0.0000008 + Math.random() * 0.000001,
      radius: radius,
      angle: angle,
      type: 'scattered'
    });
  }
}

// Create Oort Cloud (simplified representation)
function createOortCloud() {
  const asteroidCount = 50;
  const innerRadius = 80;
  const outerRadius = 120;
  
  for (let i = 0; i < asteroidCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
    const size = 0.05 + Math.random() * 0.12;
    
    const color = new THREE.Color(0.8, 0.6, 0.9); // Purple-ish for distant objects
    
    const asteroidGeo = new THREE.SphereGeometry(size, 6, 6);
    const asteroidMat = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color.clone().multiplyScalar(0.3),
      emissiveIntensity: 0.6,
      roughness: 1.0,
      metalness: 0.01,
      toneMapped: false
    });
    
    const asteroid = new THREE.Mesh(asteroidGeo, asteroidMat);
    asteroid.position.x = Math.cos(angle) * radius;
    asteroid.position.z = Math.sin(angle) * radius;
    asteroid.position.y = (Math.random() - 0.5) * 20.0;
    
    asteroid.rotation.x = Math.random() * Math.PI;
    asteroid.rotation.y = Math.random() * Math.PI;
    asteroid.rotation.z = Math.random() * Math.PI;
    
    scene.add(asteroid);
    asteroidBelts.oort.push({
      mesh: asteroid,
      rotationSpeed: {
        x: (Math.random() - 0.5) * 0.005,
        y: (Math.random() - 0.5) * 0.005,
        z: (Math.random() - 0.5) * 0.005
      },
      orbitSpeed: 0.0000003 + Math.random() * 0.0000005,
      radius: radius,
      angle: angle,
      type: 'oort'
    });
  }
}

// Create all asteroid belts
createEnhancedAsteroidBelt();
createJupiterTrojans();
createKuiperBelt();
createScatteredDisk();
createOortCloud();

// Planets and Dwarf Planets
const celestialBodies = [
  {
    name: "Mercury",
    size: 0.5,
    dist: 8,
    speed: 0.0041,
    initialAngle: 2.1,
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
    speed: 0.0016,
    initialAngle: 4.8,
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
    speed: 0.001,
    initialAngle: 3.45,
    texture: "earth.jpg",
    roughness: 0.5, 
    metalness: 0.01,
    type: "planet",
    info: "The only known planet with life. 71% of surface covered by water. Has one natural satellite.",
    discoveryYear: "N/A",
    moons: [
      { name: "Moon", size: 0.27, dist: 2.5, speed: 0.037, color: new THREE.Color(0.53, 0.53, 0.53), info: "Earth's only natural satellite. Formed 4.5 billion years ago.", initialAngle: 1.2 }
    ]
  },
  {
    name: "Mars",
    size: 0.8,
    dist: 19,
    speed: 0.00053,
    initialAngle: 0.9,
    texture: "mars.jpg",
    roughness: 0.75,
    metalness: 0.02,
    type: "planet",
    info: "The Red Planet. Has the largest volcano (Olympus Mons) and canyon (Valles Marineris) in the solar system.",
    discoveryYear: "Ancient",
    moons: [
      { name: "Phobos", size: 0.05, dist: 1.5, speed: 0.32, color: new THREE.Color(0.4, 0.26, 0.13), info: "Largest moon of Mars. Orbits Mars 3 times per day.", initialAngle: 0.5 },
      { name: "Deimos", size: 0.03, dist: 2.2, speed: 0.08, color: new THREE.Color(0.4, 0.26, 0.13), info: "Smaller, outer moon of Mars. Takes 30 hours to orbit Mars.", initialAngle: 2.1 }
    ]
  },
  {
    name: "Vesta",
    size: 0.15,
    dist: 20.5,
    speed: 0.00029,
    initialAngle: 5.2,
    color: new THREE.Color(0.8, 0.8, 0.8),
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
    speed: 0.00022,
    initialAngle: 1.8,
    color: new THREE.Color(0.67, 0.67, 0.67),
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
    speed: 0.000084,
    initialAngle: 2.7,
    texture: "jupiter.jpg",
    roughness: 0.9,
    metalness: 0.0,
    type: "planet",
    info: "Largest planet in our solar system. Great Red Spot is a storm larger than Earth. Has 95 known moons.",
    discoveryYear: "Ancient",
    moons: [
      { name: "Io", size: 0.15, dist: 3.5, speed: 0.56, color: new THREE.Color(1.0, 1.0, 0.6), info: "Most volcanically active body in the solar system.", initialAngle: 0.8 },
      { name: "Europa", size: 0.13, dist: 4.2, speed: 0.28, color: new THREE.Color(0.53, 0.81, 0.92), info: "Ice-covered moon with subsurface ocean. Potential for life.", initialAngle: 1.5 },
      { name: "Ganymede", size: 0.22, dist: 5.1, speed: 0.14, color: new THREE.Color(0.55, 0.49, 0.42), info: "Largest moon in the solar system. Has its own magnetic field.", initialAngle: 3.2 },
      { name: "Callisto", size: 0.20, dist: 6.0, speed: 0.06, color: new THREE.Color(0.41, 0.41, 0.41), info: "Most heavily cratered body in the solar system.", initialAngle: 4.9 },
      { name: "Amalthea", size: 0.08, dist: 2.8, speed: 2.0, color: new THREE.Color(0.6, 0.4, 0.2), info: "Fifth largest moon of Jupiter. Irregular potato shape.", initialAngle: 5.2 },
      { name: "Himalia", size: 0.05, dist: 7.5, speed: 0.013, color: new THREE.Color(0.5, 0.5, 0.5), info: "Largest irregular moon of Jupiter.", initialAngle: 2.1 },
      { name: "Lysithea", size: 0.02, dist: 8.2, speed: 0.010, color: new THREE.Color(0.4, 0.4, 0.4), info: "Small irregular moon in Jupiter's prograde group.", initialAngle: 4.7 },
      { name: "Elara", size: 0.03, dist: 8.0, speed: 0.011, color: new THREE.Color(0.45, 0.45, 0.45), info: "Irregular moon discovered in 1905.", initialAngle: 1.8 }
    ]
  },
  {
    name: "Saturn",
    size: 1.7,
    dist: 31,
    speed: 0.000034,
    initialAngle: 5.8,
    texture: "saturn.jpg",
    hasRings: true,
    roughness: 0.9,
    metalness: 0.0,
    type: "planet",
    info: "Famous for its prominent ring system. Less dense than water. Has 146 known moons.",
    discoveryYear: "Ancient",
    moons: [
      { name: "Mimas", size: 0.06, dist: 2.8, speed: 1.05, color: new THREE.Color(0.7, 0.7, 0.7), info: "Death Star-like appearance with giant Herschel crater.", initialAngle: 0.9 },
      { name: "Enceladus", size: 0.08, dist: 3.2, speed: 0.73, color: new THREE.Color(0.94, 0.97, 1.0), info: "Ice geysers from south pole. Subsurface ocean.", initialAngle: 4.1 },
      { name: "Tethys", size: 0.09, dist: 3.7, speed: 0.52, color: new THREE.Color(0.8, 0.8, 0.85), info: "Heavily cratered icy moon with large Odysseus crater.", initialAngle: 2.7 },
      { name: "Dione", size: 0.09, dist: 4.1, speed: 0.37, color: new THREE.Color(0.75, 0.75, 0.8), info: "Ice cliffs and wispy terrain on trailing hemisphere.", initialAngle: 5.5 },
      { name: "Rhea", size: 0.12, dist: 4.8, speed: 0.22, color: new THREE.Color(0.7, 0.7, 0.75), info: "Second largest moon of Saturn with thin oxygen atmosphere.", initialAngle: 1.3 },
      { name: "Titan", size: 0.21, dist: 5.5, speed: 0.063, color: new THREE.Color(1.0, 0.65, 0.0), info: "Has thick atmosphere and liquid methane lakes.", initialAngle: 2.3 },
      { name: "Hyperion", size: 0.04, dist: 6.2, speed: 0.048, color: new THREE.Color(0.6, 0.5, 0.4), info: "Chaotic rotation and sponge-like appearance.", initialAngle: 3.8 },
      { name: "Iapetus", size: 0.11, dist: 7.0, speed: 0.014, color: new THREE.Color(0.3, 0.3, 0.3), info: "Two-tone coloration, dark leading hemisphere.", initialAngle: 0.5 },
      { name: "Phoebe", size: 0.03, dist: 8.5, speed: 0.006, color: new THREE.Color(0.25, 0.25, 0.25), info: "Retrograde irregular moon, likely captured asteroid.", initialAngle: 4.9 }
    ]
  },
  {
    name: "Uranus",
    size: 1.2,
    dist: 37,
    speed: 0.000012,
    initialAngle: 1.2,
    texture: "uranus.jpg",
    roughness: 0.85,
    metalness: 0.0,
    type: "planet",
    info: "Ice giant tilted on its side (98° axial tilt). Has faint rings and 28 known moons.",
    discoveryYear: "1781",
    moons: [
      { name: "Ariel", size: 0.08, dist: 2.2, speed: 0.39, color: new THREE.Color(0.6, 0.6, 0.65), info: "Youngest surface among Uranian moons with fault valleys.", initialAngle: 2.1 },
      { name: "Umbriel", size: 0.08, dist: 2.5, speed: 0.23, color: new THREE.Color(0.4, 0.4, 0.45), info: "Darkest of Uranus's major moons.", initialAngle: 4.8 },
      { name: "Titania", size: 0.11, dist: 3.0, speed: 0.12, color: new THREE.Color(0.55, 0.55, 0.6), info: "Largest moon of Uranus with deep canyons.", initialAngle: 1.7 },
      { name: "Oberon", size: 0.10, dist: 3.4, speed: 0.075, color: new THREE.Color(0.5, 0.5, 0.55), info: "Outermost major moon with ancient cratered surface.", initialAngle: 5.3 },
      { name: "Miranda", size: 0.06, dist: 1.8, speed: 0.67, color: new THREE.Color(0.53, 0.53, 0.53), info: "Most unusual moon with extreme geological features.", initialAngle: 3.7 },
      { name: "Puck", size: 0.03, dist: 1.5, speed: 1.18, color: new THREE.Color(0.45, 0.45, 0.5), info: "Small irregular moon discovered by Voyager 2.", initialAngle: 0.8 }
    ]
  },
  {
    name: "Neptune",
    size: 1.1,
    dist: 42,
    speed: 0.0000061,
    initialAngle: 6.1,
    texture: "neptune.jpg",
    roughness: 0.85,
    metalness: 0.0,
    type: "planet",
    info: "Windiest planet with speeds up to 2,100 km/h. Deep blue color from methane in atmosphere.",
    discoveryYear: "1846",
    moons: [
      { name: "Triton", size: 0.11, dist: 3.0, speed: 0.17, color: new THREE.Color(0.53, 0.81, 0.92), info: "Largest moon of Neptune. Orbits retrograde. Nitrogen geysers.", initialAngle: 0.9 },
      { name: "Nereid", size: 0.02, dist: 4.8, speed: 0.003, color: new THREE.Color(0.5, 0.5, 0.5), info: "Highly eccentric orbit, likely captured Kuiper Belt object.", initialAngle: 3.2 },
      { name: "Proteus", size: 0.03, dist: 2.2, speed: 0.89, color: new THREE.Color(0.4, 0.4, 0.4), info: "Largest irregular-shaped moon of Neptune.", initialAngle: 5.7 },
      { name: "Larissa", size: 0.015, dist: 1.8, speed: 1.81, color: new THREE.Color(0.35, 0.35, 0.35), info: "Small inner moon discovered by Voyager 2.", initialAngle: 2.4 }
    ]
  },
  {
    name: "Ceres",
    size: 0.3,
    dist: 22,
    speed: 0.00022,
    color: new THREE.Color(0.6, 0.6, 0.6),
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
    speed: 0.000004,
    initialAngle: 5.3,
    color: new THREE.Color(0.82, 0.71, 0.55),
    roughness: 1.0,
    metalness: 0.0,
    type: "dwarf",
    info: "Former ninth planet. Has heart-shaped nitrogen plains. Binary system with Charon.",
    discoveryYear: "1930",
    moons: [
      { name: "Charon", size: 0.2, dist: 1.8, speed: 0.16, color: new THREE.Color(0.5, 0.5, 0.5), info: "Largest moon relative to its parent planet. Tidally locked to Pluto.", initialAngle: 1.8 }
    ]
  },
  {
    name: "Eris",
    size: 0.35,
    dist: 52,
    speed: 0.0000018,
    initialAngle: 2.7,
    color: new THREE.Color(0.9, 0.9, 0.98),
    roughness: 1.0,
    metalness: 0.0,
    type: "dwarf",
    info: "Most massive dwarf planet. Discovery led to Pluto's reclassification. Very reflective surface.",
    discoveryYear: "2005",
    moons: [
      { name: "Dysnomia", size: 0.04, dist: 2.0, speed: 0.067, color: new THREE.Color(0.6, 0.6, 0.6), info: "Only known moon of Eris.", initialAngle: 4.5 }
    ]
  },
  {
    name: "Makemake",
    size: 0.25,
    dist: 50,
    speed: 0.0000032,
    initialAngle: 1.9,
    color: new THREE.Color(0.55, 0.27, 0.07),
    roughness: 1.0,
    metalness: 0.0,
    type: "dwarf",
    info: "Third-largest dwarf planet. Reddish surface likely due to organic compounds. No atmosphere.",
    discoveryYear: "2005",
    moons: [
      { name: "MK 2", size: 0.02, dist: 1.5, speed: 0.083, color: new THREE.Color(0.4, 0.4, 0.4), info: "Small, dark moon of Makemake.", initialAngle: 0.7 }
    ]
  },
  {
    name: "Haumea",
    size: 0.28,
    dist: 51,
    speed: 0.0000035,
    initialAngle: 4.2,
    color: new THREE.Color(1.0, 1.0, 1.0),
    roughness: 0.8,
    metalness: 0.1,
    type: "dwarf",
    info: "Elongated dwarf planet that spins every 4 hours. Has ring system and crystalline water ice surface.",
    discoveryYear: "2004",
    moons: [
      { name: "Hi'iaka", size: 0.05, dist: 2.2, speed: 0.02, color: new THREE.Color(0.87, 0.87, 0.87), info: "Larger moon of Haumea.", initialAngle: 2.9 },
      { name: "Namaka", size: 0.03, dist: 1.8, speed: 0.056, color: new THREE.Color(0.8, 0.8, 0.8), info: "Smaller, inner moon of Haumea.", initialAngle: 5.1 }
    ]
  },
  {
    name: "Sedna",
    size: 0.2,
    dist: 65,
    speed: 0.00000009,
    initialAngle: 0.1,
    color: new THREE.Color(0.55, 0.0, 0.0),
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
    speed: 0.0000035,
    initialAngle: 3.1,
    color: new THREE.Color(0.4, 0.26, 0.13),
    roughness: 1.0,
    metalness: 0.0,
    type: "dwarf",
    info: "Classical Kuiper Belt object. Has ring system and one known moon.",
    discoveryYear: "2002",
    moons: [
      { name: "Weywot", size: 0.02, dist: 1.6, speed: 0.083, color: new THREE.Color(0.33, 0.33, 0.33), info: "Moon of Quaoar.", initialAngle: 1.3 }
    ]
  },
  {
    name: "Orcus",
    size: 0.16,
    dist: 49,
    speed: 0.000004,
    initialAngle: 5.7,
    color: new THREE.Color(0.18, 0.31, 0.31),
    roughness: 1.0,
    metalness: 0.0,
    type: "dwarf",
    info: "Plutino in 2:3 resonance with Neptune. Sometimes called 'anti-Pluto'.",
    discoveryYear: "2004",
    moons: [
      { name: "Vanth", size: 0.06, dist: 1.9, speed: 0.1, color: new THREE.Color(0.27, 0.27, 0.27), info: "Large moon of Orcus.", initialAngle: 4.8 }
    ]
  },
  {
    name: "Gonggong",
    size: 0.19,
    dist: 56,
    speed: 0.0000018,
    initialAngle: 2.4,
    color: new THREE.Color(0.5, 0.0, 0.13),
    roughness: 1.0,
    metalness: 0.0,
    type: "dwarf",
    info: "Red-colored scattered disk object. Has slow rotation period of 22 hours.",
    discoveryYear: "2007",
    moons: [
      { name: "Xiangliu", size: 0.03, dist: 1.7, speed: 0.1, color: new THREE.Color(0.4, 0.4, 0.4), info: "Moon of Gonggong.", initialAngle: 3.8 }
    ]
  },
  {
    name: "Varuna",
    size: 0.12,
    dist: 53,
    speed: 0.0000027,
    initialAngle: 4.7,
    color: new THREE.Color(0.41, 0.41, 0.41),
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
    speed: 0.000004,
    initialAngle: 0.8,
    color: new THREE.Color(0.55, 0.27, 0.07),
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
    speed: 0.0000035,
    initialAngle: 2.9,
    color: new THREE.Color(0.6, 0.6, 0.65),
    roughness: 1.0,
    metalness: 0.0,
    type: "tno",
    info: "Large trans-Neptunian object with a known moon.",
    discoveryYear: "2004",
    moons: [
      { name: "Actaea", size: 0.04, dist: 1.4, speed: 0.09, color: new THREE.Color(0.5, 0.5, 0.55), info: "Moon of Salacia, discovered in 2006.", initialAngle: 1.9 }
    ]
  },
  {
    name: "2007 OR10",
    size: 0.16,
    dist: 55.2,
    speed: 0.0000019,
    initialAngle: 3.7,
    color: new THREE.Color(0.45, 0.15, 0.10),
    roughness: 1.0,
    metalness: 0.0,
    type: "dwarf",
    info: "One of the largest known dwarf planets, very red in color.",
    discoveryYear: "2007",
    moons: [
      { name: "S/2016 (225088) 1", size: 0.025, dist: 1.6, speed: 0.08, color: new THREE.Color(0.4, 0.4, 0.4), info: "Small moon of 2007 OR10.", initialAngle: 5.1 }
    ]
  }
];

const planetMeshes = [];

// Create planets
celestialBodies.forEach((body) => {
  let material;
  
  if (body.texture) {
    const texturePath = `/textures/${body.texture}`;
    const texture = loader.load(texturePath);
    material = new THREE.MeshStandardMaterial({
      map: texture,
      metalness: body.metalness || 0.05, 
      roughness: body.roughness || 1, 
      emissive: new THREE.Color(0.0, 0.0, 0.0),
    });
  } else {
    material = new THREE.MeshStandardMaterial({
      color: body.color,
      metalness: body.metalness || 0.05,
      roughness: body.roughness || 1,
      emissive: new THREE.Color(0.0, 0.0, 0.0),
    });
  }

  const geo = new THREE.SphereGeometry(body.size, 64, 64);
  const mesh = new THREE.Mesh(geo, material);

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  const pivot = new THREE.Object3D();
  pivot.add(mesh);
  mesh.position.x = body.dist;
  
  if (body.initialAngle !== undefined) {
    pivot.rotation.y = body.initialAngle;
  }
  
  scene.add(pivot);

  const orbitGeo = new THREE.RingGeometry(
    body.dist - 0.05,
    body.dist + 0.05,
    128
  );
  
  let orbitColor, glowIntensity, baseOpacity;
  
  if (body.type === 'dwarf') {
    orbitColor = new THREE.Color(0.8, 0.6, 0.0);
    glowIntensity = 0.08;
    baseOpacity = 0.04;
  } else if (body.type === 'asteroid') {
    orbitColor = new THREE.Color(0.6, 0.3, 0.15);
    glowIntensity = 0.06;
    baseOpacity = 0.03;
  } else if (body.type === 'tno') {
    orbitColor = new THREE.Color(0.4, 0.15, 0.5);
    glowIntensity = 0.1;
    baseOpacity = 0.05;
  } else {
    if (body.dist < 20) {
      orbitColor = new THREE.Color(0.3, 0.5, 0.7);
      glowIntensity = 0.03;
      baseOpacity = 0.02;
    } else if (body.dist < 35) {
      orbitColor = new THREE.Color(0.5, 0.4, 0.7);
      glowIntensity = 0.05;
      baseOpacity = 0.03;
    } else {
      orbitColor = new THREE.Color(0.7, 0.3, 0.4);
      glowIntensity = 0.07;
      baseOpacity = 0.04;
    }
  }
  
  if (body.dist > 45) {
    glowIntensity *= 1.2;
    baseOpacity *= 1.3;
  }
  
  let orbitMat;
  try {
    orbitMat = new THREE.MeshBasicMaterial({
      color: orbitColor,
      emissive: orbitColor,
      emissiveIntensity: glowIntensity,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: baseOpacity,
      toneMapped: false,
    });
  } catch (error) {
    console.warn("Emissive material failed, using basic material:", error);
    orbitMat = new THREE.MeshBasicMaterial({
      color: orbitColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: baseOpacity * 2,
    });
  }
  
  const orbit = new THREE.Mesh(orbitGeo, orbitMat);
  orbit.rotation.x = Math.PI / 2;
  orbit.position.y = -0.01;
  
  if (body.dist > 40) {
    orbit.userData = {
      originalEmissive: glowIntensity,
      pulseSpeed: 0.002 + Math.random() * 0.003,
      pulsePhase: Math.random() * Math.PI * 2
    };
  }
  
  scene.add(orbit);

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
    orbit: orbit
  });
});

// Post-processing
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.5,
  0.6,
  0.05
);

bloomPass.strength = 0.5;
bloomPass.radius = 0.6;
bloomPass.threshold = 0.05;

composer.addPass(bloomPass);

const outputPass = new OutputPass();
composer.addPass(outputPass);

// Distant stars
function createDistantStars() {
  const starCount = 1500;
  const starPositions = new Float32Array(starCount * 3);
  
  for (let i = 0; i < starCount * 3; i += 3) {
    const radius = 150 + Math.random() * 100;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    
    starPositions[i] = radius * Math.sin(phi) * Math.cos(theta);
    starPositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
    starPositions[i + 2] = radius * Math.cos(phi);
  }
  
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  
  const starMaterial = new THREE.PointsMaterial({
    color: new THREE.Color(1.0, 1.0, 1.0),
    size: 0.7,
    transparent: true,
    opacity: 0.9
  });
  
  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
  return stars;
}

const distantStars = createDistantStars();

// Animation variables
let frameCount = 0;
let animationSpeed = 0.4;
let isPaused = false;
let currentDate = new Date();
let timePerFrame = 1000 * 60 * 60 * 24;
let showOrbits = true;
let showAsteroids = true;
let showMoons = true;
let showPlanetLabels = false;
const planetLabels = [];
let followingPlanet = null;
let followOffset = new THREE.Vector3(10, 5, 10);
let lastPlanetPosition = new THREE.Vector3();
let userCameraOffset = new THREE.Vector3();

// Create planet labels
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

// Update planet labels
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
    
    if (vector.z > 1) {
      label.element.style.display = 'none';
    } else {
      label.element.style.display = showPlanetLabels ? 'block' : 'none';
    }
  });
}

// Moon labels
let showMoonLabels = false;
const moonLabels = [];

// Create moon labels
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

// Update moon labels
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
    
    if (vector.z > 1) {
      label.element.style.display = 'none';
    } else {
      label.element.style.display = showMoonLabels ? 'block' : 'none';
    }
  });
}

// Create labels
createPlanetLabels();
createMoonLabels();

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  if (frameCount % 60 === 0) {
    console.log(`Animation running. Frame: ${frameCount}, Paused: ${isPaused}, Speed: ${animationSpeed}`);
  }
  frameCount++;

  if (!isPaused) {
    let realTimeMultiplier = animationSpeed === 0 ? 0.0001 : animationSpeed;
    
    if (animationSpeed === 0) {
      currentDate = new Date();
    } else {
      const deltaTime = timePerFrame * realTimeMultiplier / 60;
      currentDate.setTime(currentDate.getTime() + deltaTime);
    }
    
    sun.rotation.y += 0.002 * realTimeMultiplier;

    planetMeshes.forEach((p) => {
      p.pivot.rotation.y += p.speed * realTimeMultiplier;
      p.mesh.rotation.y += 0.01 * realTimeMultiplier;
      
      if (p.orbit && p.orbit.userData && p.orbit.userData.pulseSpeed) {
        try {
          const time = Date.now() * 0.001;
          const pulse = Math.sin(time * p.orbit.userData.pulseSpeed + p.orbit.userData.pulsePhase) * 0.3 + 0.7;
          
          if (p.orbit.material.emissiveIntensity !== undefined) {
            p.orbit.material.emissiveIntensity = p.orbit.userData.originalEmissive * pulse;
          }
          
          if (!p.orbit.userData.originalOpacity) {
            p.orbit.userData.originalOpacity = p.orbit.material.opacity;
          }
          p.orbit.material.opacity = p.orbit.userData.originalOpacity * (0.8 + pulse * 0.2);
        } catch (error) {
          console.warn("Orbit pulsing animation error:", error);
        }
      }
      
      if (p.moons && p.moons.length > 0) {
        p.moons.forEach((moon) => {
          const adjustedMoonSpeed = moon.speed * 0.1;
          moon.pivot.rotation.y += adjustedMoonSpeed * realTimeMultiplier;
          moon.mesh.rotation.y += 0.02 * realTimeMultiplier;
        });
      }
    });

    // Animate all asteroid belts
    Object.values(asteroidBelts).forEach(belt => {
      belt.forEach((asteroid) => {
        asteroid.mesh.rotation.x += asteroid.rotationSpeed.x * realTimeMultiplier;
        asteroid.mesh.rotation.y += asteroid.rotationSpeed.y * realTimeMultiplier;
        asteroid.mesh.rotation.z += asteroid.rotationSpeed.z * realTimeMultiplier;
        
        asteroid.angle += asteroid.orbitSpeed * realTimeMultiplier;
        asteroid.mesh.position.x = Math.cos(asteroid.angle) * asteroid.radius;
        asteroid.mesh.position.z = Math.sin(asteroid.angle) * asteroid.radius;
      });
    });

    distantStars.rotation.y += 0.0001 * realTimeMultiplier;
  }

  controls.update();
  
  if (followingPlanet) {
    const planetPos = new THREE.Vector3();
    followingPlanet.mesh.getWorldPosition(planetPos);
    
    if (followingType === 'sun') {
      // For Sun following, allow zoom but maintain target
      controls.target.copy(planetPos);
      // Don't override camera position - let controls handle zoom
    } else {
      // For planets and moons, use original behavior
      const planetMovement = planetPos.clone().sub(lastPlanetPosition);
      
      if (!lastPlanetPosition.equals(new THREE.Vector3(0, 0, 0))) {
        camera.position.add(planetMovement);
        controls.target.add(planetMovement);
      } else {
        camera.position.copy(planetPos.clone().add(followOffset));
        controls.target.copy(planetPos);
      }
    }
    
    lastPlanetPosition.copy(planetPos);
  }
  
  updatePlanetLabels();
  updateMoonLabels();
  
  const distanceToSun = camera.position.distanceTo(sun.position);
  const maxDistance = 100;
  const minDistance = 10;
  const normalizedDistance = Math.max(0, Math.min(1, (distanceToSun - minDistance) / (maxDistance - minDistance)));
  
  if (bloomPass && !isBloomManual) {
    bloomPass.strength = 0.5 + (1 - normalizedDistance) * 1.0;
    bloomPass.radius = 0.6 + (1 - normalizedDistance) * 0.4;
  } else if (bloomPass && isBloomManual) {
    bloomPass.strength = manualBloomStrength;
    bloomPass.radius = 0.6 + (1 - normalizedDistance) * 0.2;
  }
  
  try {
    composer.render();
  } catch (error) {
    console.error("Composer rendering failed, falling back to direct rendering:", error);
    renderer.render(scene, camera);
  }
}

// Initialize real objects with error handling
async function initializeRealObjects() {
  try {
    console.log("Initializing real-time NASA data...");
    await addRealAsteroids();
    await addComets();
    console.log("Real-time NASA data initialization complete");
  } catch (error) {
    console.error("Error initializing real objects:", error);
  }
}

// Start animation and real object initialization after a small delay
setTimeout(() => {
  animate();
  initializeRealObjects();
}, 200);

// UI Controls (only if elements exist)
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

const hideUIBtn = document.getElementById('hideUIBtn');
const showUIBtn = document.getElementById('showUIBtn');
const uiControls = document.getElementById('uiControls');
const celestialPanel = document.querySelector('.celestial-panel');
const infoPanel = document.querySelector('.info');

if (hideUIBtn && showUIBtn && uiControls) {
  hideUIBtn.addEventListener('click', () => {
    uiControls.classList.add('ui-hidden');
    if (celestialPanel) celestialPanel.classList.add('ui-hidden');
    if (infoPanel) infoPanel.classList.add('ui-hidden');
    showUIBtn.style.display = 'block';
  });
  
  showUIBtn.addEventListener('click', () => {
    uiControls.classList.remove('ui-hidden');
    if (celestialPanel) celestialPanel.classList.remove('ui-hidden');
    if (infoPanel) infoPanel.classList.remove('ui-hidden');
    showUIBtn.style.display = 'none';
  });
}

let isBloomManual = false;
let manualBloomStrength = 0.5;

const bloomControl = document.getElementById('bloomControl');
const bloomValue = document.getElementById('bloomValue');
if (bloomControl && bloomValue) {
  isBloomManual = true;
  manualBloomStrength = 0.5;
  bloomPass.strength = 0.5;
  bloomControl.value = 0.5;
  bloomValue.textContent = '0.5';

  bloomControl.addEventListener('input', (e) => {
    const strength = parseFloat(e.target.value);
    manualBloomStrength = strength;
    isBloomManual = true;
    bloomPass.strength = strength;
    bloomValue.textContent = strength.toFixed(1);
    const bloomModeBtn = document.getElementById('bloomModeBtn');
    if (bloomModeBtn) {
      bloomModeBtn.textContent = 'Auto Bloom';
      bloomModeBtn.classList.add('active');
    }
    console.log(`🎛️ Manual bloom set to: ${strength}`);
  });
}

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
  
  bloomModeBtn.textContent = isBloomManual ? 'Auto Bloom' : 'Manual Bloom';
  bloomModeBtn.classList.toggle('active', isBloomManual);
}

const pauseBtn = document.getElementById('pauseBtn');
if (pauseBtn) {
  pauseBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
    pauseBtn.classList.toggle('active', isPaused);
  });
}

const resetBtn = document.getElementById('resetBtn');
if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    stopFollowingPlanet();
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

let audioContext;
let atmosphereGain;
let oscillator1, oscillator2, oscillator3;

function createAtmosphericAudio() {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    atmosphereGain = audioContext.createGain();
    atmosphereGain.connect(audioContext.destination);
    atmosphereGain.gain.value = 0.3;
    
    oscillator1 = audioContext.createOscillator();
    oscillator1.type = 'sine';
    oscillator1.frequency.setValueAtTime(60, audioContext.currentTime);
    
    oscillator2 = audioContext.createOscillator();
    oscillator2.type = 'triangle';
    oscillator2.frequency.setValueAtTime(120, audioContext.currentTime);
    
    oscillator3 = audioContext.createOscillator();
    oscillator3.type = 'sine';
    oscillator3.frequency.setValueAtTime(40, audioContext.currentTime);
    
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, audioContext.currentTime);
    
    oscillator1.connect(filter);
    oscillator2.connect(filter);
    oscillator3.connect(filter);
    filter.connect(atmosphereGain);
    
    oscillator1.start();
    oscillator2.start();
    oscillator3.start();
    
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

function startMusic() {
  if (!isMusicPlaying) {
    spaceMusic.play().then(() => {
      console.log("Interstellar soundtrack started");
      isMusicPlaying = true;
      updateMusicButtonStates(true);
    }).catch((error) => {
      console.log("HTML5 audio failed, trying Web Audio API:", error);
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

function stopMusic() {
  if (isMusicPlaying) {
    spaceMusic.pause();
    spaceMusic.currentTime = 0;
    
    if (audioContext && audioContext.state === 'running') {
      audioContext.suspend();
    }
    
    isMusicPlaying = false;
    updateMusicButtonStates(false);
    console.log("Music stopped");
  }
}

function updateMusicButtonStates(isPlaying) {
  if (musicBtn && muteMusicBtn) {
    musicBtn.style.display = isPlaying ? 'none' : 'inline-block';
    muteMusicBtn.style.display = isPlaying ? 'inline-block' : 'none';
    if (isPlaying) {
      musicBtn.classList.add('active');
    } else {
      musicBtn.classList.remove('active');
    }
  }
  
  if (floatingMusicBtn && floatingMuteMusicBtn) {
    floatingMusicBtn.style.display = isPlaying ? 'none' : 'flex';
    floatingMuteMusicBtn.style.display = isPlaying ? 'flex' : 'none';
  }
}

if (musicBtn) {
  musicBtn.addEventListener('click', startMusic);
}

if (muteMusicBtn) {
  muteMusicBtn.addEventListener('click', stopMusic);
}

if (floatingMusicBtn) {
  floatingMusicBtn.addEventListener('click', startMusic);
}

if (floatingMuteMusicBtn) {
  floatingMuteMusicBtn.addEventListener('click', stopMusic);
}

if (volumeControl && volumeValue) {
  volumeControl.addEventListener('input', (e) => {
    const volume = parseFloat(e.target.value);
    spaceMusic.volume = volume;
    if (atmosphereGain) {
      atmosphereGain.gain.value = volume;
    }
    volumeValue.textContent = Math.round(volume * 100) + '%';
  });
  spaceMusic.volume = 0.3;
}

const orbitsBtn = document.getElementById('orbitsBtn');
if (orbitsBtn) {
  orbitsBtn.addEventListener('click', () => {
    showOrbits = !showOrbits;
    orbitsBtn.classList.toggle('active', showOrbits);
    
    planetMeshes.forEach(planet => {
      if (planet.orbit) {
        planet.orbit.visible = showOrbits;
      }
    });
  });
}

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

// Toggle real asteroids
const realAsteroidsBtn = document.getElementById('realAsteroidsBtn');
if (realAsteroidsBtn) {
  realAsteroidsBtn.addEventListener('click', () => {
    const isVisible = !realAsteroids[0]?.visible;
    realAsteroidsBtn.classList.toggle('active', isVisible);
    
    realAsteroids.forEach(asteroid => {
      asteroid.visible = isVisible;
    });
  });
}

// Toggle comets
const cometsBtn = document.getElementById('cometsBtn');
if (cometsBtn) {
  cometsBtn.addEventListener('click', () => {
    const isVisible = !cometObjects[0]?.visible;
    cometsBtn.classList.toggle('active', isVisible);
    
    cometObjects.forEach(comet => {
      comet.visible = isVisible;
    });
  });
}

// All asteroids button
const allAsteroidsBtn = document.getElementById('allAsteroidsBtn');
if (allAsteroidsBtn) {
  allAsteroidsBtn.addEventListener('click', () => {
    const allVisible = !asteroidBelts.inner[0]?.mesh.visible ||
                       !asteroidBelts.middle[0]?.mesh.visible ||
                       !asteroidBelts.outer[0]?.mesh.visible ||
                       !asteroidBelts.trojans[0]?.mesh.visible ||
                       !asteroidBelts.kuiper[0]?.mesh.visible ||
                       !asteroidBelts.scattered[0]?.mesh.visible ||
                       !asteroidBelts.oort[0]?.mesh.visible;
    
    allAsteroidsBtn.classList.toggle('active', allVisible);
    
    // Toggle all asteroid belts
    Object.values(asteroidBelts).forEach(belt => {
      belt.forEach(asteroid => {
        asteroid.mesh.visible = allVisible;
      });
    });
    
    // Update individual buttons
    if (mainAsteroidsBtn) mainAsteroidsBtn.classList.toggle('active', allVisible);
    if (trojansBtn) trojansBtn.classList.toggle('active', allVisible);
    if (kuiperBtn) kuiperBtn.classList.toggle('active', allVisible);
    if (scatteredBtn) scatteredBtn.classList.toggle('active', allVisible);
  });
}

// Planet list
const planetList = document.getElementById('planetList');
if (planetList) {
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
        const planet = planetMeshes[globalIndex];
        if (planet) {
          followingPlanet = planet;
          const distance = Math.max(body.size * 8, 15);
          followOffset.set(distance, distance * 0.5, distance);
          lastPlanetPosition.set(0, 0, 0);
          userCameraOffset.set(0, 0, 0);
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

// Planet Information Card Functions
function showPlanetInfoCard(body, planetIndex) {
  const card = document.getElementById('planetInfoCard');
  const planetName = document.getElementById('planetName');
  const planetIcon = document.getElementById('planetIcon');
  const planetTypeBadge = document.getElementById('planetTypeBadge');
  const orbitalPeriod = document.getElementById('orbitalPeriod');
  const sizeRelative = document.getElementById('sizeRelative');
  const distanceFromSun = document.getElementById('distanceFromSun');
  const discoveryYear = document.getElementById('discoveryYear');
  const planetDescription = document.getElementById('planetDescription');
  const moonsSection = document.getElementById('moonsSection');
  const moonCount = document.getElementById('moonCount');
  const moonsContainer = document.getElementById('moonsContainer');

  // Set planet icon based on type and name
  const planetIcons = {
    'Mercury': '☿️',
    'Venus': '♀️',
    'Earth': '🌍',
    'Mars': '♂️',
    'Jupiter': '♃',
    'Saturn': '🪐',
    'Uranus': '⛢',
    'Neptune': '♆',
    'Pluto': '♇',
    'Ceres': '⚳',
    'Eris': '⚫',
    'Makemake': '🔴',
    'Haumea': '⚪',
    'Sedna': '🔴'
  };

  // Set planet info
  planetIcon.textContent = planetIcons[body.name] || (body.type === 'planet' ? '🪐' : 
                           body.type === 'dwarf' ? '⚪' : '🪨');
  planetName.textContent = body.name.toUpperCase();
  
  // Set type badge
  const typeLabels = {
    'planet': 'PLANET',
    'dwarf': 'DWARF PLANET',
    'asteroid': 'ASTEROID',
    'tno': 'TNO'
  };
  planetTypeBadge.textContent = typeLabels[body.type] || 'CELESTIAL BODY';

  // Calculate orbital period in years (simplified calculation)
  const orbitalPeriodYears = Math.sqrt(Math.pow(body.dist, 3));
  if (orbitalPeriodYears < 1) {
    orbitalPeriod.textContent = `${Math.round(orbitalPeriodYears * 365)} days`;
  } else if (orbitalPeriodYears < 10) {
    orbitalPeriod.textContent = `${orbitalPeriodYears.toFixed(1)} years`;
  } else {
    orbitalPeriod.textContent = `${Math.round(orbitalPeriodYears)} years`;
  }

  sizeRelative.textContent = `${body.size}x Earth`;
  distanceFromSun.textContent = `${body.dist} AU`;
  discoveryYear.textContent = body.discoveryYear;
  planetDescription.textContent = body.info;

  // Handle moons section
  if (body.moons && body.moons.length > 0) {
    moonsSection.style.display = 'block';
    moonCount.textContent = body.moons.length;
    
    // Clear existing moons
    moonsContainer.innerHTML = '';
    
    // Add each moon
    body.moons.forEach((moon, moonIndex) => {
      const moonItem = document.createElement('div');
      moonItem.className = 'moon-item';
      
      const orbitalPeriodDays = moon.speed > 0 ? (2 * Math.PI / moon.speed).toFixed(1) : 'Unknown';
      
      moonItem.innerHTML = `
        <div class="moon-name">🌙 ${moon.name}</div>
        <div class="moon-info">
          Size: ${moon.size}x Earth<br>
          Distance: ${moon.dist} planet radii<br>
          Period: ${orbitalPeriodDays} days
        </div>
        <div class="moon-follow-btn">
          <button class="follow-moon-btn">🎯 Follow</button>
        </div>
      `;
      
      // Add click event to show moon description and follow functionality
      moonItem.style.cursor = 'pointer';
      const moonNameDiv = moonItem.querySelector('.moon-name');
      const moonInfoDiv = moonItem.querySelector('.moon-info');
      
      moonNameDiv.addEventListener('click', () => {
        if (moon.info) {
          alert(`🌙 ${moon.name}\n\n${moon.info}`);
        }
      });
      
      moonInfoDiv.addEventListener('click', () => {
        if (moon.info) {
          alert(`🌙 ${moon.name}\n\n${moon.info}`);
        }
      });
      
      // Add follow moon functionality
      const followMoonBtn = moonItem.querySelector('.follow-moon-btn');
      followMoonBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const planetObj = planetMeshes[planetIndex];
        if (planetObj.moons && planetObj.moons[moonIndex]) {
          followMoon(planetObj.moons[moonIndex].mesh, moon, body.name);
          hidePlanetInfoCard();
        }
      });
      
      moonsContainer.appendChild(moonItem);
    });
  } else {
    moonsSection.style.display = 'none';
  }

  // Show the card
  card.style.display = 'block';

  // Update follow button state
  updateFollowButtonState(planetIndex);
}

// Variables to track current planet being displayed in info card
let currentPlanetIndex = null;
let followingTarget = null; // Can be planet, moon, or sun
let followingType = null; // 'planet', 'moon', or 'sun'

// Update follow button state based on current following status
function updateFollowButtonState(planetIndex) {
  const followBtn = document.getElementById('followPlanetBtn');
  const stopFollowBtn = document.getElementById('stopFollowBtn');
  const currentPlanet = planetMeshes[planetIndex];
  
  currentPlanetIndex = planetIndex;
  
  if (followingTarget === currentPlanet && followingType === 'planet') {
    followBtn.textContent = '🛑 STOP FOLLOWING';
    followBtn.classList.add('following');
    if (stopFollowBtn) {
      stopFollowBtn.style.display = 'block';
      stopFollowBtn.classList.add('active');
    }
  } else {
    followBtn.textContent = '🎯 FOLLOW PLANET';
    followBtn.classList.remove('following');
    if (stopFollowBtn && !followingTarget) {
      stopFollowBtn.style.display = 'none';
      stopFollowBtn.classList.remove('active');
    }
  }
}

// Follow planet function
function followPlanet(planetIndex) {
  const body = celestialBodies[planetIndex];
  const planet = planetMeshes[planetIndex];
  
  // Set camera to follow planet
  followingTarget = planet;
  followingType = 'planet';
  followingPlanet = planet; // Keep for backward compatibility
  const distance = Math.max(body.size * 8, 15);
  followOffset.set(distance, distance * 0.5, distance);
  lastPlanetPosition.set(0, 0, 0);
  userCameraOffset.set(0, 0, 0);
  
  // Standard follow mode for planets (limited zoom)
  controls.enableZoom = true;
  controls.minDistance = distance * 0.5;
  controls.maxDistance = distance * 3;
  
  // Update button states
  updateFollowButtonState(planetIndex);
  
  console.log(`Now following ${body.name}`);
}

// Follow moon function
function followMoon(moonMesh, moonData, parentPlanetName) {
  followingTarget = moonMesh;
  followingType = 'moon';
  followingPlanet = { mesh: moonMesh }; // For compatibility with existing animation loop
  const distance = Math.max(moonData.size * 12, 8);
  followOffset.set(distance, distance * 0.5, distance);
  lastPlanetPosition.set(0, 0, 0);
  userCameraOffset.set(0, 0, 0);
  
  // Standard follow mode for moons (limited zoom)
  controls.enableZoom = true;
  controls.minDistance = distance * 0.3;
  controls.maxDistance = distance * 4;
  
  // Update stop follow button
  const stopFollowBtn = document.getElementById('stopFollowBtn');
  if (stopFollowBtn) {
    stopFollowBtn.style.display = 'block';
    stopFollowBtn.classList.add('active');
  }
  
  console.log(`Now following ${moonData.name} of ${parentPlanetName}`);
}

// Follow sun function
function followSun() {
  followingTarget = sun;
  followingType = 'sun';
  followingPlanet = { mesh: sun }; // For compatibility with existing animation loop
  
  // Set initial camera position
  const sunPos = new THREE.Vector3();
  sun.getWorldPosition(sunPos);
  
  // Position camera at a good distance from Sun
  camera.position.set(sunPos.x + 25, sunPos.y + 12, sunPos.z + 25);
  controls.target.copy(sunPos);
  
  // Enable zoom controls for Sun following
  controls.enableZoom = true;
  controls.minDistance = 10;  // Minimum zoom distance
  controls.maxDistance = 100; // Maximum zoom distance
  
  // Reset follow offset tracking
  lastPlanetPosition.set(0, 0, 0);
  userCameraOffset.set(0, 0, 0);
  
  // Update stop follow button
  const stopFollowBtn = document.getElementById('stopFollowBtn');
  if (stopFollowBtn) {
    stopFollowBtn.style.display = 'block';
    stopFollowBtn.classList.add('active');
  }
  
  console.log('Now following the Sun (zoom enabled)');
}

// Stop following planet function
function stopFollowingPlanet() {
  followingPlanet = null;
  followingTarget = null;
  followingType = null;
  lastPlanetPosition.set(0, 0, 0);
  userCameraOffset.set(0, 0, 0);
  
  // Reset camera position like pressing R key
  camera.position.set(0, 30, 70);
  controls.target.set(0, 0, 0);
  controls.reset();
  
  // Reset zoom controls to default
  controls.enableZoom = true;
  controls.minDistance = 0.1;
  controls.maxDistance = 1000;
  
  // Hide planet info card
  hidePlanetInfoCard();
  
  // Update button states
  const followBtn = document.getElementById('followPlanetBtn');
  const stopFollowBtn = document.getElementById('stopFollowBtn');
  
  if (followBtn) {
    followBtn.textContent = '🎯 FOLLOW PLANET';
    followBtn.classList.remove('following');
  }
  
  if (stopFollowBtn) {
    stopFollowBtn.style.display = 'none';
    stopFollowBtn.classList.remove('active');
  }
  
  console.log('Stopped following and reset view');
}

function hidePlanetInfoCard() {
  const card = document.getElementById('planetInfoCard');
  card.style.display = 'none';
}

// Enhanced planet interaction
function onMouseClick(event) {
  if (event.target.closest('.controls') || 
      event.target.closest('.celestial-panel') || 
      event.target.closest('.info') ||
      event.target.closest('.planet-info-card')) {
    return;
  }
  
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  
  // Collect all clickable objects
  let clickableObjects = [];
  
  // Add planet meshes
  const planetMeshObjects = planetMeshes.map(p => p.mesh);
  clickableObjects = clickableObjects.concat(planetMeshObjects);
  
  // Do NOT add moon meshes to clickableObjects, so moons are not clickable
  let moonMeshes = [];
  planetMeshes.forEach((planetObj, planetIndex) => {
    if (planetObj.moons && planetObj.moons.length > 0) {
      planetObj.moons.forEach(moon => {
        moonMeshes.push({
          mesh: moon.mesh,
          moonData: moon,
          planetIndex: planetIndex,
          planetName: celestialBodies[planetIndex].name
        });
        // clickableObjects.push(moon.mesh); // DISABLED: moons not clickable
      });
    }
  });
  
  // Add sun
  clickableObjects.push(sun);
  
  const intersects = raycaster.intersectObjects(clickableObjects);
  
  if (intersects.length > 0) {
    const intersectedObject = intersects[0].object;
    
    // Check if it's the sun
    if (intersectedObject === sun) {
      followSun();
      return;
    }
    
    // Check if it's a moon (DISABLED: moons not clickable)
    // const moonData = moonMeshes.find(m => m.mesh === intersectedObject);
    // if (moonData) {
    //   followMoon(moonData.mesh, moonData.moonData, moonData.planetName);
    //   return;
    // }
    
    // Check if it's a planet
    const planetIndex = planetMeshObjects.indexOf(intersectedObject);
    if (planetIndex !== -1) {
      const body = celestialBodies[planetIndex];
      
      // Show information card
      showPlanetInfoCard(body, planetIndex);
    }
  } else {
    // Hide info card if clicking on empty space
    hidePlanetInfoCard();
  }
}

// Raycaster for planet clicking
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', onMouseClick);

// Add event listener for closing planet info card
document.getElementById('closePlanetInfo').addEventListener('click', hidePlanetInfoCard);

// Add event listener for follow planet button
document.getElementById('followPlanetBtn').addEventListener('click', () => {
  if (currentPlanetIndex !== null) {
    if (followingTarget === planetMeshes[currentPlanetIndex] && followingType === 'planet') {
      stopFollowingPlanet();
    } else {
      followPlanet(currentPlanetIndex);
    }
  }
});

// Add event listener for stop follow button in control panel
const stopFollowBtn = document.getElementById('stopFollowBtn');
if (stopFollowBtn) {
  stopFollowBtn.addEventListener('click', () => {
    stopFollowingPlanet();
  });
}

// Add event listener for follow sun button
const followSunBtn = document.getElementById('followSunBtn');
if (followSunBtn) {
  followSunBtn.addEventListener('click', () => {
    followSun();
  });
}

// Update planet list click handlers to also show info card
document.addEventListener('DOMContentLoaded', () => {
  const originalPlanetItemHandler = planetItem => {
    const originalHandler = planetItem.onclick;
    planetItem.onclick = function(event) {
      if (originalHandler) originalHandler.call(this, event);
      
      // Find the planet index from the element
      const planetName = this.querySelector('strong').textContent;
      const planetIndex = celestialBodies.findIndex(body => body.name === planetName);
      if (planetIndex !== -1) {
        showPlanetInfoCard(celestialBodies[planetIndex], planetIndex);
      }
    };
  };
});

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
      stopFollowingPlanet();
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
      
      let foundVisible = false;
      for (let i = 0; i < asteroidButtons.length; i++) {
        if (asteroidButtons[i] && asteroidButtons[i].classList.contains('active')) {
          asteroidButtons[i].click();
          const nextIndex = (i + 1) % asteroidButtons.length;
          if (asteroidButtons[nextIndex]) {
            asteroidButtons[nextIndex].click();
          }
          foundVisible = true;
          break;
        }
      }
      
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
        const newSpeed = Math.min(10, currentSpeed + 0.5);
        speedControl.value = newSpeed;
        speedControl.dispatchEvent(new Event('input'));
      }
      break;
    case '-': // Decrease speed
      event.preventDefault();
      const speedControlDec = document.getElementById('speedControl');
      if (speedControlDec) {
        const currentSpeed = parseFloat(speedControlDec.value);
        const newSpeed = Math.max(0, currentSpeed - 0.5);
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

// Enhanced camera controls
controls.enablePan = true;
controls.enableZoom = true;
controls.enableRotate = true;
controls.minDistance = 8;
controls.maxDistance = 200;
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI;
controls.autoRotate = false;
controls.autoRotateSpeed = 0.3;
controls.target.set(0, 0, 0);

// Set initial camera position
camera.position.set(0, 30, 70);

// Handle resizing
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  updatePlanetLabels();
  updateMoonLabels();
});
