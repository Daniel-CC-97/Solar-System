import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Create a scene
const scene = new THREE.Scene();

// Set up a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 20;

// Create a renderer and attach it to the document
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Enable shadow mapping
document.body.appendChild(renderer.domElement);

// Add an ambient light
const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
scene.add(ambientLight);

// Add a PointLight to simulate sunlight
const sunLight = new THREE.PointLight(0xffffff, 2, 100); // Color, intensity, distance
sunLight.castShadow = true; // Enable shadows
scene.add(sunLight);

// Load textures with debug
const textureLoader = new THREE.TextureLoader();

const textures = {
    mercury: textureLoader.load(
        require('./textures/mercury.jpg').default,
        texture => console.log('Mercury texture loaded', texture),
        undefined,
        err => console.error('Error loading Mercury texture', err)
    ),
    venus: textureLoader.load(
        require('./textures/venus.jpg').default,
        texture => console.log('Venus texture loaded', texture),
        undefined,
        err => console.error('Error loading Venus texture', err)
    ),
    earth: textureLoader.load(
        require('./textures/earth.jpg').default,
        texture => console.log('Earth texture loaded', texture),
        undefined,
        err => console.error('Error loading Earth texture', err)
    ),
    mars: textureLoader.load(
        require('./textures/mars.jpg').default,
        texture => console.log('Mars texture loaded', texture),
        undefined,
        err => console.error('Error loading Mars texture', err)
    ),
    jupiter: textureLoader.load(
        require('./textures/jupiter.jpg').default,
        texture => console.log('Jupiter texture loaded', texture),
        undefined,
        err => console.error('Error loading Jupiter texture', err)
    ),
    saturn: textureLoader.load(
        require('./textures/saturn.jpg').default,
        texture => console.log('Saturn texture loaded', texture),
        undefined,
        err => console.error('Error loading Saturn texture', err)
    ),
    uranus: textureLoader.load(
        require('./textures/uranus.jpg').default,
        texture => console.log('Uranus texture loaded', texture),
        undefined,
        err => console.error('Error loading Uranus texture', err)
    ),
    neptune: textureLoader.load(
        require('./textures/neptune.jpg').default,
        texture => console.log('Neptune texture loaded', texture),
        undefined,
        err => console.error('Error loading Neptune texture', err)
    ),
    sun: textureLoader.load(
        require('./textures/sun.jpg').default,
        texture => console.log('Sun texture loaded', texture),
        undefined,
        err => console.error('Error loading Sun texture', err)
    ),
    stars: textureLoader.load(
        require('./textures/stars.jpg').default,
        texture => console.log('Stars texture loaded', texture),
        undefined,
        err => console.error('Error loading Stars texture', err)
    )
};

// Function to create a planet with texture
function createPlanet(size, texture, distance, orbitSpeed, rotationSpeed) {
    console.log('texture: ', texture);
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const material = new THREE.MeshStandardMaterial({ map: texture }); // Apply texture
    console.log('material: ', material);
    const planet = new THREE.Mesh(geometry, material);

    // Create an empty object to act as the orbit center
    const orbitObject = new THREE.Object3D();
    orbitObject.position.set(distance, 0, 0); // Set initial position of orbit object
    orbitObject.add(planet); // Add the planet to the orbit object

    orbitObject.orbitSpeed = orbitSpeed; // Speed of orbit
    planet.rotationSpeed = rotationSpeed; // Speed of rotation

    return orbitObject;
}

// Create the Sun with texture and a separate light effect
const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
const sunMaterial = new THREE.MeshStandardMaterial({
    map: textures.sun, // Apply texture
    emissive: new THREE.Color(0xffff00), // Color for glow
    emissiveIntensity: 0.7, // Emissive intensity
    side: THREE.DoubleSide // Ensure both sides of the geometry are rendered
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Position the PointLight at the Sun
sunLight.position.copy(sun.position); // Make sure the light follows the Sun's position

// Create a central Object3D for the Sun
const sunObject = new THREE.Object3D();
sunObject.add(sun);
scene.add(sunObject);

// Create planets with textures and assign them different orbit and rotation speeds
const planets = [
    createPlanet(0.5, textures.mercury, 5, 0.05, 0.01), // Mercury
    createPlanet(0.8, textures.venus, 8, 0.03, 0.008), // Venus
    createPlanet(1, textures.earth, 11, 0.02, 0.005), // Earth
    createPlanet(0.7, textures.mars, 14, 0.015, 0.006), // Mars
    createPlanet(1.2, textures.jupiter, 20, 0.01, 0.004), // Jupiter
    createPlanet(1.1, textures.saturn, 25, 0.008, 0.003), // Saturn
    createPlanet(0.9, textures.uranus, 30, 0.007, 0.002), // Uranus
    createPlanet(0.8, textures.neptune, 35, 0.006, 0.002) // Neptune
];

// Add planets to the central sunObject
planets.forEach(planet => {
    sunObject.add(planet); // Add each orbit object to the sunObject
});

// Create a ground plane
const planeGeometry = new THREE.PlaneGeometry(200, 200);
const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.5 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = - Math.PI / 2;
plane.position.y = -5;
plane.receiveShadow = true;
scene.add(plane);

// Create a background sphere for the stars texture
const backgroundGeometry = new THREE.SphereGeometry(100, 32, 32); // Large sphere
const backgroundMaterial = new THREE.MeshBasicMaterial({
    map: textures.stars,
    side: THREE.BackSide // Render the sphere from the inside
});
const backgroundSphere = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
scene.add(backgroundSphere);

// Handle window resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;

// Manage planet focus
let currentPlanetIndex = 0;

// Function to update camera position around the selected planet
function updateCameraTarget() {
    const targetPlanet = planets[currentPlanetIndex];
    controls.target.copy(targetPlanet.position);
    camera.position.set(targetPlanet.position.x + 10, targetPlanet.position.y + 5, targetPlanet.position.z + 10);
    controls.update();
}

// Handle button clicks
document.getElementById('next').addEventListener('click', () => {
    currentPlanetIndex = (currentPlanetIndex + 1) % planets.length;
    updateCameraTarget();
});

document.getElementById('previous').addEventListener('click', () => {
    currentPlanetIndex = (currentPlanetIndex - 1 + planets.length) % planets.length;
    updateCameraTarget();
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate each planet around the Sun
    const time = Date.now() * 0.001; // Increase the multiplier for faster rotation
    planets.forEach(planet => {
        const radius = planet.position.length(); // Distance from the Sun
        const angle = time * planet.orbitSpeed; // Compute the current angle
        planet.position.x = Math.cos(angle) * radius; // Update X position
        planet.position.z = Math.sin(angle) * radius; // Update Z position
        
        // Rotate the planet on its own axis
        planet.children[0].rotation.y += planet.children[0].rotationSpeed;
    });

    // Update controls
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Initial camera target
updateCameraTarget();
