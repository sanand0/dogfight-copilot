import * as THREE from 'three';

// Game state
const gameState = {
    speed: 100,
    baseSpeed: 100,
    maxSpeed: 400,
    boostSpeed: 300,
    altitude: 500,
    rotation: {
        pitch: 0,
        roll: 0,
        yaw: 0
    },
    velocity: new THREE.Vector3(0, 0, -1),
    isBoosting: false
};

// Input state
const keys = {
    w: false, s: false, a: false, d: false,
    q: false, e: false, space: false,
    arrowUp: false, arrowDown: false, arrowLeft: false, arrowRight: false
};

// Scene setup
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x87CEEB, 500, 3000);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(100, 200, 100);
directionalLight.castShadow = true;
directionalLight.shadow.camera.left = -500;
directionalLight.shadow.camera.right = 500;
directionalLight.shadow.camera.top = 500;
directionalLight.shadow.camera.bottom = -500;
scene.add(directionalLight);

// Skybox
function createSkybox() {
    const skyGeometry = new THREE.SphereGeometry(4000, 32, 32);
    const skyMaterial = new THREE.ShaderMaterial({
        uniforms: {
            topColor: { value: new THREE.Color(0x0077ff) },
            bottomColor: { value: new THREE.Color(0x87CEEB) },
            offset: { value: 400 },
            exponent: { value: 0.6 }
        },
        vertexShader: `
            varying vec3 vWorldPosition;
            void main() {
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 topColor;
            uniform vec3 bottomColor;
            uniform float offset;
            uniform float exponent;
            varying vec3 vWorldPosition;
            void main() {
                float h = normalize(vWorldPosition + offset).y;
                gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
            }
        `,
        side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);
}

createSkybox();

// Ground/Ocean
const groundGeometry = new THREE.PlaneGeometry(10000, 10000, 50, 50);
const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x3498db,
    roughness: 0.3,
    metalness: 0.2
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = 0;
ground.receiveShadow = true;
scene.add(ground);

// Animate ground waves
function animateGround(time) {
    const vertices = ground.geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const z = vertices[i + 1];
        vertices[i + 2] = Math.sin(x * 0.01 + time * 0.5) * 3 + Math.cos(z * 0.01 + time * 0.3) * 3;
    }
    ground.geometry.attributes.position.needsUpdate = true;
    ground.geometry.computeVertexNormals();
}

// Create clouds
const clouds = [];
function createClouds() {
    const cloudGeometry = new THREE.SphereGeometry(50, 8, 8);
    const cloudMaterial = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.7
    });

    for (let i = 0; i < 50; i++) {
        const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
        cloud.position.x = Math.random() * 4000 - 2000;
        cloud.position.y = Math.random() * 500 + 200;
        cloud.position.z = Math.random() * 4000 - 2000;
        cloud.scale.set(
            Math.random() * 2 + 1,
            Math.random() * 0.5 + 0.5,
            Math.random() * 2 + 1
        );
        scene.add(cloud);
        clouds.push(cloud);
    }
}

createClouds();

// Fighter Jet Model
function createJet() {
    const jet = new THREE.Group();

    // Fuselage (main body)
    const fuselageGeometry = new THREE.CylinderGeometry(2, 3, 20, 8);
    const fuselageMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
    const fuselage = new THREE.Mesh(fuselageGeometry, fuselageMaterial);
    fuselage.rotation.z = Math.PI / 2;
    fuselage.castShadow = true;
    jet.add(fuselage);

    // Cockpit
    const cockpitGeometry = new THREE.SphereGeometry(2.5, 8, 8);
    const cockpitMaterial = new THREE.MeshStandardMaterial({
        color: 0x00aaff,
        transparent: true,
        opacity: 0.7,
        metalness: 0.8
    });
    const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
    cockpit.position.x = 6;
    cockpit.scale.set(1, 0.8, 1);
    cockpit.castShadow = true;
    jet.add(cockpit);

    // Nose cone
    const noseGeometry = new THREE.ConeGeometry(2, 6, 8);
    const noseMaterial = new THREE.MeshStandardMaterial({ color: 0xff4444 });
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.rotation.z = -Math.PI / 2;
    nose.position.x = 13;
    nose.castShadow = true;
    jet.add(nose);

    // Wings
    const wingGeometry = new THREE.BoxGeometry(8, 0.5, 20);
    const wingMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });
    const wings = new THREE.Mesh(wingGeometry, wingMaterial);
    wings.position.x = -2;
    wings.castShadow = true;
    jet.add(wings);

    // Tail wing
    const tailWingGeometry = new THREE.BoxGeometry(3, 0.5, 10);
    const tailWing = new THREE.Mesh(tailWingGeometry, wingMaterial);
    tailWing.position.x = -8;
    tailWing.castShadow = true;
    jet.add(tailWing);

    // Vertical stabilizer
    const stabilizerGeometry = new THREE.BoxGeometry(5, 8, 0.5);
    const stabilizer = new THREE.Mesh(stabilizerGeometry, wingMaterial);
    stabilizer.position.x = -8;
    stabilizer.position.y = 4;
    stabilizer.castShadow = true;
    jet.add(stabilizer);

    // Engine exhausts
    const exhaustGeometry = new THREE.CylinderGeometry(1, 1.5, 3, 8);
    const exhaustMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x222222,
        emissive: 0xff6600,
        emissiveIntensity: 0.5
    });
    
    const exhaust1 = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
    exhaust1.rotation.z = Math.PI / 2;
    exhaust1.position.set(-10, 0, 3);
    jet.add(exhaust1);

    const exhaust2 = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
    exhaust2.rotation.z = Math.PI / 2;
    exhaust2.position.set(-10, 0, -3);
    jet.add(exhaust2);

    jet.position.set(0, 500, 0);
    jet.castShadow = true;
    
    return jet;
}

const jet = createJet();
scene.add(jet);

// Particle system for exhaust trail
class ParticleTrail {
    constructor() {
        this.particles = [];
        this.maxParticles = 100;
        
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.maxParticles * 3);
        const colors = new Float32Array(this.maxParticles * 3);
        const sizes = new Float32Array(this.maxParticles);
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.PointsMaterial({
            size: 10,
            transparent: true,
            opacity: 0.6,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        this.particleSystem = new THREE.Points(geometry, material);
        scene.add(this.particleSystem);
    }
    
    update(jetPosition, jetQuaternion, isBoosting) {
        // Create new particles
        const exhaustOffset1 = new THREE.Vector3(-10, 0, 3);
        const exhaustOffset2 = new THREE.Vector3(-10, 0, -3);
        exhaustOffset1.applyQuaternion(jetQuaternion);
        exhaustOffset2.applyQuaternion(jetQuaternion);
        
        this.particles.push({
            position: jetPosition.clone().add(exhaustOffset1),
            life: 1.0,
            size: 5
        });
        
        this.particles.push({
            position: jetPosition.clone().add(exhaustOffset2),
            life: 1.0,
            size: 5
        });
        
        // Update existing particles
        const positions = this.particleSystem.geometry.attributes.position.array;
        const colors = this.particleSystem.geometry.attributes.color.array;
        const sizes = this.particleSystem.geometry.attributes.size.array;
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].life -= 0.02;
            this.particles[i].size += 0.5;
            
            if (this.particles[i].life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        // Limit particle count
        while (this.particles.length > this.maxParticles) {
            this.particles.shift();
        }
        
        // Update buffer
        for (let i = 0; i < this.maxParticles; i++) {
            if (i < this.particles.length) {
                const p = this.particles[i];
                positions[i * 3] = p.position.x;
                positions[i * 3 + 1] = p.position.y;
                positions[i * 3 + 2] = p.position.z;
                
                const intensity = isBoosting ? 1.0 : 0.5;
                colors[i * 3] = 1.0 * intensity;     // R
                colors[i * 3 + 1] = 0.5 * p.life * intensity; // G
                colors[i * 3 + 2] = 0.0;             // B
                
                sizes[i] = p.size * p.life;
            } else {
                positions[i * 3] = 0;
                positions[i * 3 + 1] = 0;
                positions[i * 3 + 2] = 0;
                colors[i * 3] = 0;
                colors[i * 3 + 1] = 0;
                colors[i * 3 + 2] = 0;
                sizes[i] = 0;
            }
        }
        
        this.particleSystem.geometry.attributes.position.needsUpdate = true;
        this.particleSystem.geometry.attributes.color.needsUpdate = true;
        this.particleSystem.geometry.attributes.size.needsUpdate = true;
    }
}

const trail = new ParticleTrail();

// Audio setup (using Web Audio API for engine sound)
let audioContext;
let engineOscillator;
let engineGain;

function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create engine sound using oscillators
    engineOscillator = audioContext.createOscillator();
    engineOscillator.type = 'sawtooth';
    engineOscillator.frequency.value = 100;
    
    engineGain = audioContext.createGain();
    engineGain.gain.value = 0.1;
    
    engineOscillator.connect(engineGain);
    engineGain.connect(audioContext.destination);
    
    engineOscillator.start();
}

// Input handling
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'w') keys.w = true;
    if (key === 's') keys.s = true;
    if (key === 'a') keys.a = true;
    if (key === 'd') keys.d = true;
    if (key === 'q') keys.q = true;
    if (key === 'e') keys.e = true;
    if (key === ' ') {
        keys.space = true;
        e.preventDefault();
        if (!audioContext) initAudio();
    }
    if (key === 'arrowup') { keys.arrowUp = true; e.preventDefault(); }
    if (key === 'arrowdown') { keys.arrowDown = true; e.preventDefault(); }
    if (key === 'arrowleft') { keys.arrowLeft = true; e.preventDefault(); }
    if (key === 'arrowright') { keys.arrowRight = true; e.preventDefault(); }
});

document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'w') keys.w = false;
    if (key === 's') keys.s = false;
    if (key === 'a') keys.a = false;
    if (key === 'd') keys.d = false;
    if (key === 'q') keys.q = false;
    if (key === 'e') keys.e = false;
    if (key === ' ') keys.space = false;
    if (key === 'arrowup') keys.arrowUp = false;
    if (key === 'arrowdown') keys.arrowDown = false;
    if (key === 'arrowleft') keys.arrowLeft = false;
    if (key === 'arrowright') keys.arrowRight = false;
});

// Update HUD
function updateHUD() {
    document.getElementById('speed-value').textContent = Math.round(gameState.speed);
    document.getElementById('altitude-value').textContent = Math.round(gameState.altitude);
}

// Flight physics
function updatePhysics(deltaTime) {
    const rotationSpeed = 0.02;
    const pitchSpeed = 0.015;
    
    // Handle pitch (up/down)
    if (keys.w || keys.arrowUp) {
        gameState.rotation.pitch += pitchSpeed;
    }
    if (keys.s || keys.arrowDown) {
        gameState.rotation.pitch -= pitchSpeed;
    }
    
    // Handle roll (left/right banking)
    if (keys.a || keys.arrowLeft) {
        gameState.rotation.roll += rotationSpeed;
    }
    if (keys.d || keys.arrowRight) {
        gameState.rotation.roll -= rotationSpeed;
    }
    
    // Handle yaw (turn left/right)
    if (keys.q) {
        gameState.rotation.yaw += rotationSpeed * 0.7;
    }
    if (keys.e) {
        gameState.rotation.yaw -= rotationSpeed * 0.7;
    }
    
    // Handle boost
    if (keys.space) {
        gameState.speed = Math.min(gameState.speed + 5, gameState.boostSpeed);
        gameState.isBoosting = true;
        if (engineGain) engineGain.gain.value = 0.15;
        if (engineOscillator) engineOscillator.frequency.value = 150;
    } else {
        gameState.speed = Math.max(gameState.speed - 2, gameState.baseSpeed);
        gameState.isBoosting = false;
        if (engineGain) engineGain.gain.value = 0.1;
        if (engineOscillator) engineOscillator.frequency.value = 100;
    }
    
    // Damping for smoother controls
    gameState.rotation.pitch *= 0.95;
    gameState.rotation.roll *= 0.92;
    gameState.rotation.yaw *= 0.95;
    
    // Clamp rotations
    gameState.rotation.pitch = Math.max(-0.5, Math.min(0.5, gameState.rotation.pitch));
    gameState.rotation.roll = Math.max(-0.8, Math.min(0.8, gameState.rotation.roll));
    
    // Apply rotations to jet
    jet.rotation.x = gameState.rotation.pitch;
    jet.rotation.z = gameState.rotation.roll;
    jet.rotation.y += gameState.rotation.yaw;
    
    // Calculate forward direction
    const forward = new THREE.Vector3(1, 0, 0);
    forward.applyQuaternion(jet.quaternion);
    
    // Update position
    const speedFactor = gameState.speed * deltaTime * 0.1;
    jet.position.add(forward.multiplyScalar(speedFactor));
    
    // Update altitude (based on pitch)
    gameState.altitude = jet.position.y;
    
    // Keep above ground
    if (jet.position.y < 50) {
        jet.position.y = 50;
        gameState.rotation.pitch = Math.max(0, gameState.rotation.pitch);
    }
    
    // Keep below ceiling
    if (jet.position.y > 1500) {
        jet.position.y = 1500;
        gameState.rotation.pitch = Math.min(0, gameState.rotation.pitch);
    }
}

// Camera follow
function updateCamera() {
    const offset = new THREE.Vector3(-40, 15, 0);
    offset.applyQuaternion(jet.quaternion);
    
    const targetPosition = jet.position.clone().add(offset);
    camera.position.lerp(targetPosition, 0.1);
    
    const lookAtOffset = new THREE.Vector3(20, 0, 0);
    lookAtOffset.applyQuaternion(jet.quaternion);
    const lookAtTarget = jet.position.clone().add(lookAtOffset);
    
    camera.lookAt(lookAtTarget);
}

// Animation loop
let lastTime = 0;
function animate(currentTime) {
    requestAnimationFrame(animate);
    
    const deltaTime = (currentTime - lastTime) / 16.67; // Normalize to 60fps
    lastTime = currentTime;
    
    updatePhysics(Math.min(deltaTime, 2)); // Cap delta to prevent huge jumps
    updateCamera();
    updateHUD();
    
    // Update particles
    trail.update(jet.position, jet.quaternion, gameState.isBoosting);
    
    // Animate ground
    animateGround(currentTime * 0.001);
    
    // Animate clouds (drift slowly)
    clouds.forEach(cloud => {
        cloud.position.x += 0.05;
        if (cloud.position.x > 2000) cloud.position.x = -2000;
    });
    
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start the game
animate(0);
