/**
 * Team Ekleipsis - Cinematic 3D Experience
 * Advanced WebGL rendering with immersive wind tunnel
 */

import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// ============================================
// GLOBAL STATE
// ============================================
const state = {
    currentSection: 'hero',
    scrollProgress: 0,
    isLoading: true,
    carLoaded: false,
    isDragging: false,
    previousMouseX: 0,
    mouseX: 0,
    mouseY: 0,
    targetRotationY: 0,
    currentRotationY: 0,
    revealedCards: 0
};

// ============================================
// THREE.JS SETUP
// ============================================
let scene, camera, renderer, composer;
let carModel, carGroup;
let tunnelGroup, tunnelParticles, streamlines;
let clock;

// Initialize
document.addEventListener('DOMContentLoaded', init);

async function init() {
    clock = new THREE.Clock();

    setupScene();
    setupLighting();
    setupPostProcessing();
    await loadCarModel();
    createTunnel();
    createParticleSystem();

    setupEventListeners();
    setupScrollTriggers();
    setupTeamCards();
    setupGallery();

    animate();
    hideLoader();
}

// ============================================
// SCENE SETUP
// ============================================
function setupScene() {
    const canvas = document.getElementById('mainCanvas');

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030108);
    scene.fog = new THREE.Fog(0x030108, 200, 1000);

    camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.1,
        2000
    );
    camera.position.set(0, 50, 200);

    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Ground grid
    const gridSize = 1000;
    const gridDivisions = 100;
    const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x6d28d9, 0x1e1b4b);
    gridHelper.position.y = -60;
    gridHelper.material.opacity = 0.15;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Ground plane
    const groundGeom = new THREE.PlaneGeometry(2000, 2000);
    const groundMat = new THREE.MeshStandardMaterial({
        color: 0x030108,
        metalness: 0.9,
        roughness: 0.4
    });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -60;
    ground.receiveShadow = true;
    scene.add(ground);
}

function setupLighting() {
    // Ambient
    const ambient = new THREE.AmbientLight(0x404060, 0.4);
    scene.add(ambient);

    // Main key light
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(100, 150, 100);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 10;
    keyLight.shadow.camera.far = 500;
    keyLight.shadow.camera.left = -100;
    keyLight.shadow.camera.right = 100;
    keyLight.shadow.camera.top = 100;
    keyLight.shadow.camera.bottom = -100;
    scene.add(keyLight);

    // Purple accent lights
    const purpleLight1 = new THREE.PointLight(0x8b5cf6, 2, 300);
    purpleLight1.position.set(-100, 80, 50);
    scene.add(purpleLight1);

    const purpleLight2 = new THREE.PointLight(0xa78bfa, 1.5, 250);
    purpleLight2.position.set(100, 60, -50);
    scene.add(purpleLight2);

    // Rim light
    const rimLight = new THREE.DirectionalLight(0xc4b5fd, 0.5);
    rimLight.position.set(0, 50, -150);
    scene.add(rimLight);

    // Spot for dramatic car lighting
    const spotLight = new THREE.SpotLight(0x8b5cf6, 1);
    spotLight.position.set(0, 200, 0);
    spotLight.angle = Math.PI / 5;
    spotLight.penumbra = 0.5;
    spotLight.decay = 2;
    spotLight.distance = 400;
    spotLight.castShadow = true;
    scene.add(spotLight);
}

function setupPostProcessing() {
    composer = new EffectComposer(renderer);

    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.5,  // strength
        0.4,  // radius
        0.85  // threshold
    );
    composer.addPass(bloomPass);
}

// ============================================
// CAR MODEL
// ============================================
async function loadCarModel() {
    return new Promise((resolve, reject) => {
        const loader = new STLLoader();

        carGroup = new THREE.Group();
        scene.add(carGroup);

        loader.load(
            'EK3 COMBINED.stl',
            (geometry) => {
                geometry.computeBoundingBox();
                geometry.computeVertexNormals();

                const center = new THREE.Vector3();
                geometry.boundingBox.getCenter(center);
                geometry.translate(-center.x, -center.y, -center.z);

                // Create metallic purple material with environment reflections
                const material = new THREE.MeshPhysicalMaterial({
                    color: 0x1a1525,
                    metalness: 0.95,
                    roughness: 0.15,
                    clearcoat: 1.0,
                    clearcoatRoughness: 0.1,
                    reflectivity: 1.0,
                    envMapIntensity: 1.5
                });

                // Create environment map
                const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
                const cubeCamera = new THREE.CubeCamera(1, 1000, cubeRenderTarget);

                // Create simple gradient environment
                const envScene = new THREE.Scene();
                const envGeom = new THREE.SphereGeometry(500, 32, 32);
                const envMat = new THREE.ShaderMaterial({
                    side: THREE.BackSide,
                    uniforms: {
                        topColor: { value: new THREE.Color(0x1e1b4b) },
                        bottomColor: { value: new THREE.Color(0x030108) },
                        offset: { value: 50 },
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
                    `
                });
                envScene.add(new THREE.Mesh(envGeom, envMat));

                // Add lights to env scene
                const envLight1 = new THREE.PointLight(0x8b5cf6, 5, 500);
                envLight1.position.set(100, 100, 100);
                envScene.add(envLight1);

                const envLight2 = new THREE.PointLight(0xc4b5fd, 3, 400);
                envLight2.position.set(-100, 50, -100);
                envScene.add(envLight2);

                cubeCamera.update(renderer, envScene);
                material.envMap = cubeRenderTarget.texture;

                carModel = new THREE.Mesh(geometry, material);
                carModel.castShadow = true;
                carModel.receiveShadow = true;

                // Scale
                const box = new THREE.Box3().setFromObject(carModel);
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 120 / maxDim;
                carModel.scale.set(scale, scale, scale);

                // Position car
                carModel.position.y = -30;

                carGroup.add(carModel);

                // Add subtle edge glow
                const edgeMat = new THREE.LineBasicMaterial({
                    color: 0x8b5cf6,
                    transparent: true,
                    opacity: 0.2
                });
                const edges = new THREE.EdgesGeometry(geometry, 20);
                const edgeMesh = new THREE.LineSegments(edges, edgeMat);
                edgeMesh.scale.copy(carModel.scale);
                edgeMesh.position.copy(carModel.position);
                carGroup.add(edgeMesh);

                state.carLoaded = true;
                updateLoadProgress(100);
                resolve();
            },
            (progress) => {
                const percent = (progress.loaded / progress.total) * 100;
                updateLoadProgress(percent);
            },
            (error) => {
                console.error('Error loading car:', error);
                createPlaceholderCar();
                resolve();
            }
        );
    });
}

function createPlaceholderCar() {
    carGroup = new THREE.Group();

    const material = new THREE.MeshPhysicalMaterial({
        color: 0x1a1525,
        metalness: 0.95,
        roughness: 0.15,
        clearcoat: 1.0
    });

    // Simplified F1 car shape
    // Main body
    const bodyGeom = new THREE.BoxGeometry(100, 15, 35);
    const body = new THREE.Mesh(bodyGeom, material);
    body.position.y = 0;
    carGroup.add(body);

    // Nose
    const noseGeom = new THREE.ConeGeometry(15, 40, 4);
    const nose = new THREE.Mesh(noseGeom, material);
    nose.rotation.z = -Math.PI / 2;
    nose.position.set(60, 0, 0);
    carGroup.add(nose);

    // Cockpit
    const cockpitGeom = new THREE.CylinderGeometry(12, 15, 25, 8);
    const cockpit = new THREE.Mesh(cockpitGeom, material);
    cockpit.rotation.z = Math.PI / 2;
    cockpit.position.set(-10, 12, 0);
    carGroup.add(cockpit);

    // Wings
    const wingMat = new THREE.MeshPhysicalMaterial({
        color: 0x6d28d9,
        metalness: 0.9,
        roughness: 0.2
    });

    const frontWingGeom = new THREE.BoxGeometry(8, 3, 55);
    const frontWing = new THREE.Mesh(frontWingGeom, wingMat);
    frontWing.position.set(50, -5, 0);
    carGroup.add(frontWing);

    const rearWingGeom = new THREE.BoxGeometry(8, 20, 50);
    const rearWing = new THREE.Mesh(rearWingGeom, wingMat);
    rearWing.position.set(-50, 15, 0);
    carGroup.add(rearWing);

    // Wheels
    const wheelGeom = new THREE.CylinderGeometry(12, 12, 10, 32);
    const wheelMat = new THREE.MeshStandardMaterial({
        color: 0x111111,
        metalness: 0.6,
        roughness: 0.4
    });

    const wheelPositions = [
        { x: 35, z: 25 },
        { x: 35, z: -25 },
        { x: -40, z: 25 },
        { x: -40, z: -25 }
    ];

    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeom, wheelMat);
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(pos.x, -8, pos.z);
        carGroup.add(wheel);
    });

    carGroup.position.y = -30;
    carGroup.castShadow = true;

    scene.add(carGroup);
    carModel = carGroup;
    state.carLoaded = true;
}

// ============================================
// WIND TUNNEL
// ============================================
function createTunnel() {
    tunnelGroup = new THREE.Group();
    tunnelGroup.position.x = -500; // Start off-screen left
    tunnelGroup.visible = false;

    const tunnelLength = 800;
    const tunnelWidth = 200;
    const tunnelHeight = 150;

    // Tunnel floor with grid
    const floorGeom = new THREE.PlaneGeometry(tunnelLength, tunnelWidth, 50, 20);
    const floorMat = new THREE.MeshStandardMaterial({
        color: 0x0a0612,
        metalness: 0.9,
        roughness: 0.3,
        transparent: true,
        opacity: 0.9
    });
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -60;
    tunnelGroup.add(floor);

    // Tunnel grid on floor
    const tunnelGrid = new THREE.GridHelper(tunnelLength, 40, 0x6d28d9, 0x1e1b4b);
    tunnelGrid.position.y = -59;
    tunnelGrid.material.opacity = 0.3;
    tunnelGrid.material.transparent = true;
    tunnelGroup.add(tunnelGrid);

    // Tunnel walls - glass-like
    const wallMat = new THREE.MeshPhysicalMaterial({
        color: 0x6d28d9,
        metalness: 0.1,
        roughness: 0.1,
        transparent: true,
        opacity: 0.1,
        transmission: 0.9,
        thickness: 5,
        side: THREE.DoubleSide
    });

    // Left wall
    const wallGeom = new THREE.PlaneGeometry(tunnelLength, tunnelHeight);
    const leftWall = new THREE.Mesh(wallGeom, wallMat);
    leftWall.position.set(0, tunnelHeight / 2 - 60, -tunnelWidth / 2);
    tunnelGroup.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(wallGeom, wallMat);
    rightWall.position.set(0, tunnelHeight / 2 - 60, tunnelWidth / 2);
    rightWall.rotation.y = Math.PI;
    tunnelGroup.add(rightWall);

    // Ceiling
    const ceilingGeom = new THREE.PlaneGeometry(tunnelLength, tunnelWidth);
    const ceiling = new THREE.Mesh(ceilingGeom, wallMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = tunnelHeight - 60;
    tunnelGroup.add(ceiling);

    // Tunnel entrance (circular)
    const entranceGeom = new THREE.RingGeometry(80, 100, 32);
    const entranceMat = new THREE.MeshBasicMaterial({
        color: 0x6d28d9,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5
    });
    const entrance = new THREE.Mesh(entranceGeom, entranceMat);
    entrance.position.set(-tunnelLength / 2, 20, 0);
    entrance.rotation.y = Math.PI / 2;
    tunnelGroup.add(entrance);

    // Exit
    const exit = entrance.clone();
    exit.position.set(tunnelLength / 2, 20, 0);
    tunnelGroup.add(exit);

    // Tunnel lights
    const tunnelLight1 = new THREE.PointLight(0x8b5cf6, 2, 200);
    tunnelLight1.position.set(-200, 60, 0);
    tunnelGroup.add(tunnelLight1);

    const tunnelLight2 = new THREE.PointLight(0xa78bfa, 2, 200);
    tunnelLight2.position.set(0, 60, 0);
    tunnelGroup.add(tunnelLight2);

    const tunnelLight3 = new THREE.PointLight(0x8b5cf6, 2, 200);
    tunnelLight3.position.set(200, 60, 0);
    tunnelGroup.add(tunnelLight3);

    scene.add(tunnelGroup);

    // Create streamlines
    createStreamlines();
}

function createParticleSystem() {
    const particleCount = 5000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
        // Particles start from left
        positions[i * 3] = -400 + Math.random() * 50;
        positions[i * 3 + 1] = -50 + Math.random() * 100;
        positions[i * 3 + 2] = -80 + Math.random() * 160;

        // Velocity based on position (faster in center)
        const speed = 3 + Math.random() * 4;
        velocities.push({
            x: speed,
            y: 0,
            z: 0,
            baseSpeed: speed
        });

        // Color based on speed (red = fast, green = slow)
        const speedNorm = (speed - 3) / 4;
        if (speedNorm > 0.6) {
            // Fast - red
            colors[i * 3] = 0.94;
            colors[i * 3 + 1] = 0.27;
            colors[i * 3 + 2] = 0.27;
        } else if (speedNorm > 0.3) {
            // Medium - orange/yellow
            colors[i * 3] = 0.96;
            colors[i * 3 + 1] = 0.62;
            colors[i * 3 + 2] = 0.04;
        } else {
            // Slow - green
            colors[i * 3] = 0.13;
            colors[i * 3 + 1] = 0.77;
            colors[i * 3 + 2] = 0.33;
        }

        sizes[i] = 1 + Math.random() * 2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
        size: 2,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });

    tunnelParticles = new THREE.Points(geometry, material);
    tunnelParticles.userData.velocities = velocities;
    tunnelParticles.visible = false;
    scene.add(tunnelParticles);
}

function createStreamlines() {
    streamlines = new THREE.Group();
    streamlines.visible = false;

    const lineCount = 40;
    const material = new THREE.LineBasicMaterial({
        color: 0x8b5cf6,
        transparent: true,
        opacity: 0.15
    });

    for (let i = 0; i < lineCount; i++) {
        const points = [];
        const startY = -50 + (i / lineCount) * 100;
        const startZ = -70 + (i % 10) * 14;

        for (let x = -350; x <= 350; x += 10) {
            let y = startY;
            let z = startZ;

            // Simulate flow around car shape
            if (x > -80 && x < 80) {
                const distFromCenterY = Math.abs(startY + 30);
                const distFromCenterZ = Math.abs(startZ);

                if (distFromCenterY < 25 && distFromCenterZ < 25) {
                    // Strong deflection near car
                    const deflection = (25 - distFromCenterY) * 0.8;
                    const phase = (x + 80) / 160;
                    y = startY + deflection * Math.sin(phase * Math.PI);

                    if (startZ > 0) {
                        z = startZ + (25 - distFromCenterZ) * 0.3 * Math.sin(phase * Math.PI);
                    } else {
                        z = startZ - (25 - distFromCenterZ) * 0.3 * Math.sin(phase * Math.PI);
                    }
                }
            }

            points.push(new THREE.Vector3(x, y, z));
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        streamlines.add(line);
    }

    scene.add(streamlines);
}

function animateParticles(delta) {
    if (!tunnelParticles || !tunnelParticles.visible) return;

    const positions = tunnelParticles.geometry.attributes.position.array;
    const colors = tunnelParticles.geometry.attributes.color.array;
    const velocities = tunnelParticles.userData.velocities;

    for (let i = 0; i < velocities.length; i++) {
        const idx = i * 3;
        const x = positions[idx];
        const y = positions[idx + 1];
        const z = positions[idx + 2];

        // Move particle
        positions[idx] += velocities[i].x;

        // Physics around car
        if (x > -100 && x < 100) {
            const distFromCenterY = y + 30;
            const distFromCenterZ = z;
            const dist = Math.sqrt(distFromCenterY * distFromCenterY + distFromCenterZ * distFromCenterZ);

            if (dist < 35) {
                // Strong deflection
                const deflectStrength = (35 - dist) / 35;

                if (distFromCenterY > 0) {
                    positions[idx + 1] += deflectStrength * 2;
                } else {
                    positions[idx + 1] -= deflectStrength * 1.5;
                }

                if (distFromCenterZ > 0) {
                    positions[idx + 2] += deflectStrength * 0.5;
                } else {
                    positions[idx + 2] -= deflectStrength * 0.5;
                }

                // Slow down
                velocities[i].x = velocities[i].baseSpeed * 0.6;

                // Change color to show turbulence (more red)
                colors[idx] = 0.94;
                colors[idx + 1] = 0.27;
                colors[idx + 2] = 0.27;
            } else if (dist < 50) {
                // Mild deflection
                velocities[i].x = velocities[i].baseSpeed * 0.8;
            }
        } else {
            // Reset velocity
            velocities[i].x = velocities[i].baseSpeed;
        }

        // Reset particle if too far
        if (positions[idx] > 400) {
            positions[idx] = -400 + Math.random() * 20;
            positions[idx + 1] = -50 + Math.random() * 100;
            positions[idx + 2] = -80 + Math.random() * 160;

            // Reset color
            const speedNorm = (velocities[i].baseSpeed - 3) / 4;
            if (speedNorm > 0.6) {
                colors[idx] = 0.94;
                colors[idx + 1] = 0.27;
                colors[idx + 2] = 0.27;
            } else if (speedNorm > 0.3) {
                colors[idx] = 0.96;
                colors[idx + 1] = 0.62;
                colors[idx + 2] = 0.04;
            } else {
                colors[idx] = 0.13;
                colors[idx + 1] = 0.77;
                colors[idx + 2] = 0.33;
            }
        }
    }

    tunnelParticles.geometry.attributes.position.needsUpdate = true;
    tunnelParticles.geometry.attributes.color.needsUpdate = true;
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    // Resize
    window.addEventListener('resize', onResize);

    // Mouse move for parallax
    document.addEventListener('mousemove', onMouseMove);

    // Drag rotation for car
    const canvas = document.getElementById('mainCanvas');
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onDrag);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseUp);

    // Touch
    canvas.addEventListener('touchstart', onTouchStart);
    canvas.addEventListener('touchmove', onTouchMove);
    canvas.addEventListener('touchend', onMouseUp);

    // Scroll
    window.addEventListener('scroll', onScroll);

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(item.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(e) {
    state.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    state.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
}

function onMouseDown(e) {
    state.isDragging = true;
    state.previousMouseX = e.clientX;
}

function onDrag(e) {
    if (!state.isDragging) return;

    const deltaX = e.clientX - state.previousMouseX;
    state.targetRotationY += deltaX * 0.005;
    state.previousMouseX = e.clientX;
}

function onMouseUp() {
    state.isDragging = false;
}

function onTouchStart(e) {
    state.isDragging = true;
    state.previousMouseX = e.touches[0].clientX;
}

function onTouchMove(e) {
    if (!state.isDragging) return;

    const deltaX = e.touches[0].clientX - state.previousMouseX;
    state.targetRotationY += deltaX * 0.005;
    state.previousMouseX = e.touches[0].clientX;
}

function onScroll() {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    state.scrollProgress = scrollY / docHeight;

    // Update progress bar
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        progressFill.style.width = `${state.scrollProgress * 100}%`;
    }

    // Update navbar
    const nav = document.getElementById('nav');
    if (scrollY > 100) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }

    // Update active nav item
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight / 2 && rect.bottom > window.innerHeight / 2) {
            const id = section.id;
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.toggle('active', item.getAttribute('href') === `#${id}`);
            });
        }
    });
}

// ============================================
// SCROLL TRIGGERS
// ============================================
function setupScrollTriggers() {
    gsap.registerPlugin(ScrollTrigger);

    // Hero section - car intro
    ScrollTrigger.create({
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        onUpdate: (self) => {
            if (carGroup) {
                // Car comes in from right during hero
                const progress = self.progress;
                carGroup.position.x = 150 - progress * 150;
                carGroup.position.z = 100 - progress * 100;
            }
        }
    });

    // Showcase section - car center view
    ScrollTrigger.create({
        trigger: '#showcase',
        start: 'top center',
        end: 'bottom center',
        onEnter: () => {
            state.currentSection = 'showcase';
            gsap.to(camera.position, {
                x: 0,
                y: 60,
                z: 180,
                duration: 1.5,
                ease: 'power2.out'
            });
            if (tunnelGroup) tunnelGroup.visible = false;
            if (tunnelParticles) tunnelParticles.visible = false;
            if (streamlines) streamlines.visible = false;
        },
        onUpdate: (self) => {
            if (carGroup) {
                carGroup.position.x = 50;
                carGroup.position.z = 0;
            }
        }
    });

    // Tunnel section - wind tunnel experience
    ScrollTrigger.create({
        trigger: '#tunnel',
        start: 'top center',
        end: 'bottom center',
        onEnter: () => {
            state.currentSection = 'tunnel';

            // Move camera for tunnel view
            gsap.to(camera.position, {
                x: -200,
                y: 40,
                z: 250,
                duration: 2,
                ease: 'power2.out'
            });

            // Show tunnel elements
            if (tunnelGroup) {
                tunnelGroup.visible = true;
                gsap.to(tunnelGroup.position, {
                    x: 0,
                    duration: 2,
                    ease: 'power2.out'
                });
            }

            if (tunnelParticles) {
                tunnelParticles.visible = true;
            }

            if (streamlines) {
                streamlines.visible = true;
            }

            // Move car into tunnel
            if (carGroup) {
                gsap.to(carGroup.position, {
                    x: 0,
                    z: 0,
                    duration: 2,
                    ease: 'power2.out'
                });
                gsap.to(carGroup.rotation, {
                    y: -Math.PI / 2,
                    duration: 2,
                    ease: 'power2.out'
                });
            }

            // Animate data rings
            animateDataRings();
        },
        onLeaveBack: () => {
            if (tunnelGroup) {
                tunnelGroup.visible = false;
            }
            if (tunnelParticles) tunnelParticles.visible = false;
            if (streamlines) streamlines.visible = false;

            // Reset car rotation
            if (carGroup) {
                gsap.to(carGroup.rotation, {
                    y: 0,
                    duration: 1
                });
            }
        }
    });

    // Team section - car exits
    ScrollTrigger.create({
        trigger: '#team',
        start: 'top center',
        end: 'bottom center',
        onEnter: () => {
            state.currentSection = 'team';

            // Car accelerates off screen
            if (carGroup) {
                gsap.to(carGroup.position, {
                    x: 500,
                    duration: 1.5,
                    ease: 'power2.in'
                });
            }

            // Hide tunnel
            if (tunnelGroup) tunnelGroup.visible = false;
            if (tunnelParticles) tunnelParticles.visible = false;
            if (streamlines) streamlines.visible = false;

            // Camera pulls back
            gsap.to(camera.position, {
                x: 0,
                y: 50,
                z: 200,
                duration: 1.5
            });
        },
        onLeaveBack: () => {
            // Bring car back
            if (carGroup) {
                gsap.to(carGroup.position, {
                    x: 0,
                    duration: 1
                });
            }
        }
    });

    // Animate hero elements
    gsap.from('.hero-badge', {
        y: 30,
        opacity: 0,
        duration: 1,
        delay: 0.5
    });

    gsap.from('.title-word', {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        delay: 0.7
    });

    gsap.from('.hero-description', {
        y: 30,
        opacity: 0,
        duration: 1,
        delay: 1.2
    });

    gsap.from('.hero-stats', {
        y: 30,
        opacity: 0,
        duration: 1,
        delay: 1.4
    });

    gsap.from('.scroll-hint', {
        opacity: 0,
        duration: 1,
        delay: 2
    });

    // Animate section headers on scroll
    gsap.utils.toArray('.section-number, .section-title, .section-desc').forEach(el => {
        gsap.from(el, {
            scrollTrigger: {
                trigger: el,
                start: 'top 80%'
            },
            y: 30,
            opacity: 0,
            duration: 0.8
        });
    });

    // Hotspot items
    gsap.utils.toArray('.hotspot-item').forEach((el, i) => {
        gsap.from(el, {
            scrollTrigger: {
                trigger: el,
                start: 'top 85%'
            },
            x: -50,
            opacity: 0,
            duration: 0.6,
            delay: i * 0.1
        });
    });

    // Info cards
    gsap.utils.toArray('.info-card').forEach((el, i) => {
        gsap.from(el, {
            scrollTrigger: {
                trigger: el,
                start: 'top 85%'
            },
            x: 50,
            opacity: 0,
            duration: 0.6,
            delay: i * 0.1
        });
    });

    // Sponsor cards
    gsap.utils.toArray('.sponsor-card').forEach((el, i) => {
        gsap.from(el, {
            scrollTrigger: {
                trigger: el,
                start: 'top 85%'
            },
            y: 30,
            opacity: 0,
            duration: 0.5,
            delay: i * 0.05
        });
    });

    // Gallery items
    gsap.utils.toArray('.gallery-item').forEach((el, i) => {
        gsap.from(el, {
            scrollTrigger: {
                trigger: el,
                start: 'top 85%'
            },
            y: 40,
            opacity: 0,
            duration: 0.6,
            delay: i * 0.1
        });
    });
}

function animateDataRings() {
    document.querySelectorAll('.ring-fill').forEach(ring => {
        const percent = parseInt(ring.getAttribute('data-percent')) || 0;
        const circumference = 2 * Math.PI * 54;
        const offset = circumference - (percent / 100) * circumference;

        gsap.to(ring, {
            strokeDashoffset: offset,
            duration: 1.5,
            ease: 'power2.out'
        });
    });
}

// ============================================
// TEAM CARDS
// ============================================
function setupTeamCards() {
    const cards = document.querySelectorAll('.member-card');

    cards.forEach(card => {
        card.addEventListener('click', () => {
            if (card.classList.contains('revealed')) return;

            card.classList.add('revealed');
            state.revealedCards++;

            // Update remaining cards
            updateCardDeck();

            if (state.revealedCards >= 3) {
                document.getElementById('deckInstruction').textContent = 'Meet the team!';
            }
        });
    });
}

function updateCardDeck() {
    const unrevealed = document.querySelectorAll('.member-card:not(.revealed)');
    unrevealed.forEach((card, i) => {
        const scale = 1 - (i * 0.04);
        const translateY = i * 15;
        card.style.transform = `translateY(${translateY}px) scale(${scale})`;
        card.style.zIndex = 3 - i;
    });
}

// ============================================
// GALLERY
// ============================================
function setupGallery() {
    const filters = document.querySelectorAll('.filter');
    const items = document.querySelectorAll('.gallery-item');

    filters.forEach(filter => {
        filter.addEventListener('click', () => {
            filters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');

            const category = filter.getAttribute('data-filter');

            items.forEach(item => {
                if (category === 'all' || item.getAttribute('data-category') === category) {
                    gsap.to(item, {
                        opacity: 1,
                        scale: 1,
                        duration: 0.4,
                        display: 'block'
                    });
                } else {
                    gsap.to(item, {
                        opacity: 0,
                        scale: 0.9,
                        duration: 0.4,
                        onComplete: () => {
                            item.style.display = 'none';
                        }
                    });
                }
            });
        });
    });

    // Lightbox
    const lightbox = document.getElementById('lightbox');
    const lightboxClose = document.querySelector('.lightbox-close');

    items.forEach(item => {
        item.addEventListener('click', () => {
            const title = item.querySelector('h4').textContent;
            const desc = item.querySelector('p').textContent;

            document.getElementById('lightboxTitle').textContent = title;
            document.getElementById('lightboxDesc').textContent = desc;

            lightbox.classList.add('active');
        });
    });

    lightboxClose.addEventListener('click', () => {
        lightbox.classList.remove('active');
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.classList.remove('active');
        }
    });
}

// ============================================
// LOADER
// ============================================
function updateLoadProgress(percent) {
    const bar = document.querySelector('.preloader-bar');
    if (bar) {
        bar.style.width = `${percent}%`;
    }
}

function hideLoader() {
    setTimeout(() => {
        const preloader = document.getElementById('preloader');
        preloader.classList.add('loaded');
        state.isLoading = false;
    }, 1500);
}

// ============================================
// ANIMATION LOOP
// ============================================
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    // Auto-rotate car when not dragging (showcase section)
    if (!state.isDragging && state.currentSection === 'showcase') {
        state.targetRotationY += 0.002;
    }

    // Smooth rotation interpolation
    state.currentRotationY += (state.targetRotationY - state.currentRotationY) * 0.05;

    if (carGroup && state.currentSection !== 'tunnel') {
        carGroup.rotation.y = state.currentRotationY;
    }

    // Subtle camera movement based on mouse (parallax)
    if (state.currentSection === 'hero' || state.currentSection === 'showcase') {
        camera.position.x += (state.mouseX * 10 - camera.position.x) * 0.02;
        camera.position.y += (-state.mouseY * 5 + 60 - camera.position.y) * 0.02;
    }

    // Animate particles in tunnel
    if (state.currentSection === 'tunnel') {
        animateParticles(delta);
    }

    // Floating animation for car
    if (carGroup && state.currentSection !== 'team') {
        carGroup.position.y = -30 + Math.sin(time * 0.5) * 2;
    }

    // Render
    composer.render();
}
