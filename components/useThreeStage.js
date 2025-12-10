import { useEffect, useRef } from "react";
import * as THREE from "three";
import { STLLoader } from "three/addons/loaders/STLLoader.js";

// Hotspot data - screen offsets stored in window for debug adjustment
const HOTSPOTS = [
  { id: "nose", label: "Nose Cone", specs: ["Carbon fiber composite", "CFD optimized"], desc: "Aerodynamic nose cone designed for minimum drag." },
  { id: "front-wing", label: "Front Wing", specs: ["Multi-element", "Adjustable"], desc: "Generates front downforce for cornering grip." },
  { id: "sidepod", label: "Sidepod", specs: ["Cooling ducts", "Undercut design"], desc: "Houses radiators and manages airflow." },
  { id: "intake", label: "Air Intake", specs: ["Ram air effect", "Filter system"], desc: "Feeds clean air to the engine." },
  { id: "rear-wing", label: "Rear Wing", specs: ["DRS capable", "High downforce"], desc: "Primary downforce generator." },
  { id: "diffuser", label: "Diffuser", specs: ["Ground effect", "7 channels"], desc: "Accelerates underbody airflow." },
];

// Default pin offsets from car center (in pixels) - editable via debug panel
window.pinOffsets = window.pinOffsets || {
  "nose": { x: 180, y: -20 },
  "front-wing": { x: 200, y: 40 },
  "sidepod": { x: 50, y: 30 },
  "intake": { x: -20, y: -60 },
  "rear-wing": { x: -150, y: -50 },
  "diffuser": { x: -180, y: 50 }
};

// Global offset to shift entire scene left (make room for UI panels on right)
const SCENE_X_OFFSET = -3;

// Phase-specific car configurations (user-tuned values)
const PHASE_CONFIGS = {
  hero: {
    carOffset: { x: -8.6, y: 0.2, z: 16 },
    carScale: 2.65,
    carPos: { x: 1.1, y: 1.2, z: 30 },
    showPodium: false,
    cameraPos: { x: 0, y: 3, z: 15 },
    carRotation: -Math.PI / 4,
  },
  engineering: {
    carOffset: { x: 4.7, y: 1.4, z: 10 },
    carScale: 1.95,
    carPos: { x: -4.6, y: 0.9, z: -3.4 },
    showPodium: true,
    cameraPos: { x: 10, y: 2, z: 13 },
    carRotation: -Math.PI / 4,
  },
  garage: {
    carOffset: { x: 5.6, y: 0.6, z: 10 },
    carScale: 1.75,
    carPos: { x: -5.5, y: 1.4, z: -3.8 },
    showPodium: true,
    cameraPos: { x: 10, y: 2, z: 14 },
    carRotation: -Math.PI / 5,
  },
  aero: {
    // Car stays in original position - wind machine moved to right side
    carOffset: { x: 0, y: 1.2, z: 10 },
    carScale: 2.2,
    carPos: { x: -3, y: -0.5, z: -2 },
    showPodium: false,
    cameraPos: { x: 0, y: 3, z: 20 },
    carRotation: -Math.PI / 2, // Original rotation - car nose points right
  },
  sponsors: {
    // Car completely hidden
    carOffset: { x: 0, y: -100, z: 0 },
    carScale: 0,
    carPos: { x: 0, y: -100, z: 0 },
    showPodium: false,
    cameraPos: { x: 0, y: 5, z: 20 },
    carRotation: 0,
    hideCar: true,
  },
  team: {
    // Car completely hidden
    carOffset: { x: 0, y: -100, z: 0 },
    carScale: 0,
    carPos: { x: 0, y: -100, z: 0 },
    showPodium: false,
    cameraPos: { x: 0, y: 5, z: 20 },
    carRotation: 0,
    hideCar: true,
  },
};

export default function useThreeStage({
  canvasRef, pinOverlayRef, setHud, phase, theme,
  carColor, carPos, carOffset, carScale,
  bodyColor, accentColor, wheelColor, viewMode, showBox,
  aeroRotation, aeroPreset
}) {
  const phaseRef = useRef(phase);
  const themeRef = useRef(theme);
  const viewModeRef = useRef(viewMode || "render");

  // Car colors
  const bodyColorRef = useRef(bodyColor || "#555555");
  const accentColorRef = useRef(accentColor || "#222222");
  const wheelColorRef = useRef(wheelColor || "#111111");

  // Position refs
  const carPosRef = useRef(carPos);
  const carOffsetRef = useRef(carOffset);
  const carScaleRef = useRef(carScale);
  const aeroRotationRef = useRef(aeroRotation || 0);
  const aeroPresetRef = useRef(aeroPreset || "normal");

  // Scene object refs
  const sceneObjectsRef = useRef({});
  const rafRef = useRef(0);
  const pinsAdded = useRef(false);

  // Update refs when props change
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { themeRef.current = theme; }, [theme]);
  useEffect(() => { viewModeRef.current = viewMode; }, [viewMode]);
  useEffect(() => { carPosRef.current = carPos; }, [carPos]);
  useEffect(() => { carOffsetRef.current = carOffset; }, [carOffset]);
  useEffect(() => { carScaleRef.current = carScale; }, [carScale]);
  useEffect(() => { aeroRotationRef.current = aeroRotation || 0; }, [aeroRotation]);
  useEffect(() => { aeroPresetRef.current = aeroPreset || "normal"; }, [aeroPreset]);

  useEffect(() => {
    bodyColorRef.current = bodyColor;
    if (sceneObjectsRef.current.bodyMaterial) {
      sceneObjectsRef.current.bodyMaterial.color.set(bodyColor);
    }
  }, [bodyColor]);

  useEffect(() => {
    accentColorRef.current = accentColor;
    if (sceneObjectsRef.current.accentMaterial) {
      sceneObjectsRef.current.accentMaterial.color.set(accentColor);
    }
  }, [accentColor]);

  useEffect(() => {
    wheelColorRef.current = wheelColor;
    // Wheel color kept for future use when separate wheel parts are available
  }, [wheelColor]);

  // Show/hide container helper box
  useEffect(() => {
    if (sceneObjectsRef.current.containerHelper) {
      sceneObjectsRef.current.containerHelper.visible = showBox;
    }
  }, [showBox]);

  // Legacy carColor support
  useEffect(() => {
    if (carColor && sceneObjectsRef.current.bodyMaterial) {
      sceneObjectsRef.current.bodyMaterial.color.set(carColor);
    }
  }, [carColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ========== RENDERER ==========
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // ========== SCENE ==========
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x0a0a0a, 30, 80);

    // ========== CAMERA ==========
    // Camera positioned to view car from the right side (car on left of screen)
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(6, 3, 12);
    camera.lookAt(-2, 0, 0); // Look slightly left where car is

    // ========== LIGHTING ==========
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(10, 15, 10);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 50;
    keyLight.shadow.camera.left = -15;
    keyLight.shadow.camera.right = 15;
    keyLight.shadow.camera.top = 15;
    keyLight.shadow.camera.bottom = -15;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x4488ff, 0.8);
    fillLight.position.set(-10, 8, 5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xff8844, 0.6);
    rimLight.position.set(0, 5, -15);
    scene.add(rimLight);

    // Interactive Spotlight
    const spotLight = new THREE.SpotLight(0xffffff, 100);
    spotLight.position.set(0, 10, 5);
    spotLight.angle = Math.PI / 6;
    spotLight.penumbra = 0.5;
    spotLight.decay = 2;
    spotLight.distance = 50;
    spotLight.castShadow = true;
    spotLight.shadow.bias = -0.0001;
    scene.add(spotLight);
    scene.add(spotLight.target);

    // Mouse tracking for spotlight
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const planeIntersect = new THREE.Vector3();

    const updateSpotlight = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.intersectPlane(plane, planeIntersect);
      
      // Smoothly move target
      // We'll do the actual movement in the animate loop using a target vector
    };
    window.addEventListener('mousemove', updateSpotlight);


    // ========== GROUND / FLOOR ==========
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    ground.receiveShadow = true;
    scene.add(ground);

    // ========== PODIUM (positioned under the car) ==========
    const podiumGroup = new THREE.Group();
    podiumGroup.position.set(-3 + SCENE_X_OFFSET, 0, 0); // Shifted left with scene

    const podiumMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.3,
      metalness: 0.7
    });
    const podiumBase = new THREE.Mesh(
      new THREE.CylinderGeometry(7, 8, 1.2, 64),
      podiumMaterial
    );
    podiumBase.position.y = -1.6;
    podiumBase.receiveShadow = true;
    podiumBase.castShadow = true;
    podiumGroup.add(podiumBase);

    // Podium ring light
    const ringGeometry = new THREE.TorusGeometry(7.5, 0.06, 16, 100);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x444444 });
    const podiumRing = new THREE.Mesh(ringGeometry, ringMaterial);
    podiumRing.rotation.x = Math.PI / 2;
    podiumRing.position.y = -1.0;
    podiumGroup.add(podiumRing);

    scene.add(podiumGroup);

    // ========== CAR CONTAINER ==========
    // Position is set per-phase in animation loop
    const carContainer = new THREE.Group();
    scene.add(carContainer);

    // Debug helper: visible box to see the container bounds
    const containerHelper = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(14, 5, 7)),
      new THREE.LineBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 })
    );
    containerHelper.visible = false;
    carContainer.add(containerHelper);
    sceneObjectsRef.current.containerHelper = containerHelper;

    // The car group sits inside the container (for rotation only)
    const carGroup = new THREE.Group();
    carContainer.add(carGroup);
    sceneObjectsRef.current.carContainer = carContainer;

    // ========== MATERIALS ==========
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: bodyColorRef.current || 0x555555,
      metalness: 0.8,
      roughness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9,
    });
    sceneObjectsRef.current.bodyMaterial = bodyMaterial;

    const accentMaterial = new THREE.MeshPhysicalMaterial({
      color: accentColorRef.current || 0x222222,
      metalness: 0.9,
      roughness: 0.15,
      clearcoat: 0.8,
    });
    sceneObjectsRef.current.accentMaterial = accentMaterial;

    // Wire/mesh materials for engineering view
    const wireMaterial = new THREE.LineBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0
    });
    const pointMaterial = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.03,
      transparent: true,
      opacity: 0
    });

    // ========== LOAD CAR MODEL ==========
    let carMesh = null;
    let wireframe = null;
    let vertexPoints = null;
    const pins = [];

    const loader = new STLLoader();
    loader.load(
      "EK3 COMBINED.stl",
      (geometry) => {
        geometry.center();
        geometry.computeVertexNormals();

        carMesh = new THREE.Mesh(geometry, bodyMaterial);
        carMesh.castShadow = true;
        carMesh.receiveShadow = true;

        // Scale to fill 90% of podium (podium radius is ~8, so car should span ~14-15 units)
        const box = new THREE.Box3().setFromObject(carMesh);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 14 / maxDim;  // Much bigger - fills podium
        carMesh.scale.setScalar(scale);
        carMesh.userData.baseScale = scale;
        carMesh.rotation.y = -Math.PI / 2;
        carMesh.position.y = 0;

        carGroup.add(carMesh);
        sceneObjectsRef.current.carMesh = carMesh;

        // Wireframe for engineering view
        const edgesGeometry = new THREE.EdgesGeometry(geometry, 15);
        wireframe = new THREE.LineSegments(edgesGeometry, wireMaterial);
        wireframe.scale.copy(carMesh.scale);
        wireframe.rotation.copy(carMesh.rotation);
        wireframe.position.copy(carMesh.position);
        carGroup.add(wireframe);
        sceneObjectsRef.current.wireframe = wireframe;

        // Vertex points for engineering view
        vertexPoints = new THREE.Points(geometry, pointMaterial);
        vertexPoints.scale.copy(carMesh.scale);
        vertexPoints.rotation.copy(carMesh.rotation);
        vertexPoints.position.copy(carMesh.position);
        carGroup.add(vertexPoints);
        sceneObjectsRef.current.vertexPoints = vertexPoints;

        // Setup hotspot pins
        if (pinOverlayRef.current && !pinsAdded.current) {
          pinOverlayRef.current.innerHTML = "";
          HOTSPOTS.forEach((h) => {
            const el = document.createElement("div");
            el.className = "hotspot-pin";
            el.setAttribute("data-label", h.label);
            el.addEventListener("click", (evt) => {
              evt.stopPropagation();
              setHud({
                visible: true,
                title: h.label,
                specs: h.specs,
                desc: h.desc,
                x: evt.clientX,
                y: evt.clientY,
              });
            });
            pinOverlayRef.current.appendChild(el);
            pins.push({ ...h, el });
          });
          pinsAdded.current = true;
          // Setup drag after a short delay to ensure functions are defined
          setTimeout(() => {
            if (typeof setupPinDragging === "function") setupPinDragging();
          }, 100);
        }
      },
      (progress) => {
        console.log("Loading:", (progress.loaded / progress.total * 100).toFixed(1) + "%");
      },
      (error) => {
        console.error("STL load error:", error);
        // Fallback box
        const fallback = new THREE.Mesh(
          new THREE.BoxGeometry(6, 1.5, 3),
          bodyMaterial
        );
        fallback.position.y = 0.5;
        carGroup.add(fallback);
      }
    );

    // ========== WIND TUNNEL EQUIPMENT (positioned around the car) ==========
    const windTunnelGroup = new THREE.Group();
    windTunnelGroup.position.set(-3 + SCENE_X_OFFSET, 0, 0);
    windTunnelGroup.visible = false;
    scene.add(windTunnelGroup);

    // Industrial fan/blower machine (on the RIGHT side - car faces INTO the wind)
    const fanGroup = new THREE.Group();

    // Fan housing - larger industrial look
    const fanHousingMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.85, roughness: 0.25 });
    const fanHousing = new THREE.Mesh(
      new THREE.CylinderGeometry(3.5, 4, 2, 32),
      fanHousingMat
    );
    fanHousing.rotation.z = Math.PI / 2;
    fanGroup.add(fanHousing);

    // Outer ring
    const outerRingMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.9, roughness: 0.2 });
    const outerRing = new THREE.Mesh(
      new THREE.TorusGeometry(3.8, 0.3, 16, 32),
      outerRingMat
    );
    outerRing.rotation.y = Math.PI / 2;
    outerRing.position.x = -1;
    fanGroup.add(outerRing);

    // Fan blades - more industrial
    const bladesGroup = new THREE.Group();
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.9, roughness: 0.15 });
    for (let i = 0; i < 8; i++) {
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 2.8, 0.06),
        bladeMat
      );
      blade.position.y = 1.4;
      const bladeWrapper = new THREE.Group();
      bladeWrapper.add(blade);
      bladeWrapper.rotation.z = (i * Math.PI * 2) / 8;
      bladesGroup.add(bladeWrapper);
    }
    bladesGroup.rotation.z = Math.PI / 2;
    bladesGroup.position.x = -1.2;
    fanGroup.add(bladesGroup);
    sceneObjectsRef.current.fanBlades = bladesGroup;

    // Fan stand - heavier industrial base
    const standMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.6, roughness: 0.4 });
    const stand = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 4, 2),
      standMat
    );
    stand.position.y = -2;
    fanGroup.add(stand);

    // Base plate
    const basePlate = new THREE.Mesh(
      new THREE.BoxGeometry(3, 0.3, 3),
      standMat
    );
    basePlate.position.y = -4;
    fanGroup.add(basePlate);

    // Wind machine on the RIGHT side - wind blows LEFT toward car front
    fanGroup.position.set(18, 1, 0);
    fanGroup.rotation.y = Math.PI; // Face toward the car
    windTunnelGroup.add(fanGroup);

    // Track/Road under car (replaces podium in aero mode)
    const trackGroup = new THREE.Group();

    // Main track surface
    const trackMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.7,
      metalness: 0.3
    });
    const track = new THREE.Mesh(
      new THREE.BoxGeometry(30, 0.25, 5),
      trackMat
    );
    track.position.y = -1.6;
    track.receiveShadow = true;
    trackGroup.add(track);

    // Track center line
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0x444444 });
    for (let i = -12; i < 12; i += 1.5) {
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.02, 0.1),
        stripeMat
      );
      stripe.position.set(i, -1.47, 0);
      trackGroup.add(stripe);
    }

    windTunnelGroup.add(trackGroup);
    sceneObjectsRef.current.windTunnelGroup = windTunnelGroup;

    // ========== AIRFLOW PARTICLES (flow from RIGHT to LEFT - toward car) ==========
    let particles = null;
    const particleCount = 10000;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);
    const particleOriginalY = new Float32Array(particleCount);
    const particleOriginalZ = new Float32Array(particleCount);
    const particlePhase = new Float32Array(particleCount);

    // Car bounding box for collision/heat detection
    const carBounds = { minX: -8, maxX: 6, minY: -1.5, maxY: 3, minZ: -3, maxZ: 3 };

    function initParticle(i) {
      // Start from RIGHT side and flow LEFT
      particlePositions[i * 3] = 15 + Math.random() * 8;
      particlePositions[i * 3 + 1] = -2 + Math.random() * 5;
      particlePositions[i * 3 + 2] = -4 + Math.random() * 8;
      particleOriginalY[i] = particlePositions[i * 3 + 1];
      particleOriginalZ[i] = particlePositions[i * 3 + 2];
      particlePhase[i] = Math.random() * Math.PI * 2;
      particleSpeeds[i] = 0.08 + Math.random() * 0.25;
    }

    for (let i = 0; i < particleCount; i++) {
      initParticle(i);
      // Spread particles across the whole tunnel initially
      particlePositions[i * 3] = -15 + Math.random() * 35;
      // Initial colors - cyan/blue
      particleColors[i * 3] = 0.0;
      particleColors[i * 3 + 1] = 0.7;
      particleColors[i * 3 + 2] = 1.0;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(particleGeometry, particleMaterial);
    particles.visible = false;
    windTunnelGroup.add(particles);

    sceneObjectsRef.current.particles = particles;
    sceneObjectsRef.current.particleSpeeds = particleSpeeds;
    sceneObjectsRef.current.particleOriginalY = particleOriginalY;
    sceneObjectsRef.current.particleOriginalZ = particleOriginalZ;
    sceneObjectsRef.current.particlePhase = particlePhase;
    sceneObjectsRef.current.carBounds = carBounds;
    sceneObjectsRef.current.initParticle = initParticle;

    // ========== ANIMATION LOOP ==========
    const clock = new THREE.Clock();

    // Store car center for pin positioning
    let carCenterScreen = { x: 0, y: 0 };
    const spotlightTargetPos = new THREE.Vector3();

    function updatePins() {
      const currentPhase = phaseRef.current;
      const showPins = currentPhase === "engineering";

      if (pins.length === 0) return;

      // Get car center in screen space
      if (carMesh && carContainer) {
        const carCenter = new THREE.Vector3();
        carContainer.getWorldPosition(carCenter);
        carCenter.project(camera);
        carCenterScreen.x = (carCenter.x * 0.5 + 0.5) * window.innerWidth;
        carCenterScreen.y = (-carCenter.y * 0.5 + 0.5) * window.innerHeight;
      }

      pins.forEach((p) => {
        if (!showPins) {
          p.el.style.display = "none";
          return;
        }

        // Skip if being dragged
        if (p.el.dataset.dragging === "true") return;

        const offset = window.pinOffsets[p.id] || { x: 0, y: 0 };
        p.el.style.left = `${carCenterScreen.x + offset.x}px`;
        p.el.style.top = `${carCenterScreen.y + offset.y}px`;
        p.el.style.display = "block";
      });
    }

    // Make pins draggable
    function setupPinDragging() {
      pins.forEach((p) => {
        let isDragging = false;
        let startX, startY, startOffsetX, startOffsetY;

        p.el.addEventListener("mousedown", (e) => {
          if (e.shiftKey) { // Hold Shift to drag
            e.preventDefault();
            e.stopPropagation();
            isDragging = true;
            p.el.dataset.dragging = "true";
            startX = e.clientX;
            startY = e.clientY;
            startOffsetX = window.pinOffsets[p.id].x;
            startOffsetY = window.pinOffsets[p.id].y;
            p.el.style.cursor = "grabbing";
          }
        });

        window.addEventListener("mousemove", (e) => {
          if (!isDragging) return;
          const dx = e.clientX - startX;
          const dy = e.clientY - startY;
          window.pinOffsets[p.id].x = startOffsetX + dx;
          window.pinOffsets[p.id].y = startOffsetY + dy;
          p.el.style.left = `${carCenterScreen.x + window.pinOffsets[p.id].x}px`;
          p.el.style.top = `${carCenterScreen.y + window.pinOffsets[p.id].y}px`;
        });

        window.addEventListener("mouseup", () => {
          if (isDragging) {
            isDragging = false;
            p.el.dataset.dragging = "false";
            p.el.style.cursor = "pointer";
            console.log(`Pin "${p.id}" offset:`, window.pinOffsets[p.id]);
          }
        });
      });
    }

    function animate() {
      rafRef.current = requestAnimationFrame(animate);

      try {
      const time = clock.getElapsedTime();
      const delta = clock.getDelta();

      // ===== THEME COLORS =====
      const isLight = themeRef.current === "light";
      scene.background.set(isLight ? 0xf5f5f5 : 0x0a0a0a);
      scene.fog.color.set(isLight ? 0xf5f5f5 : 0x0a0a0a);
      groundMaterial.color.set(isLight ? 0xdddddd : 0x111111);
      podiumMaterial.color.set(isLight ? 0xcccccc : 0x1a1a1a);
      ringMaterial.color.set(isLight ? 0x888888 : 0x444444);

      // ===== VIEW MODE (Engineering) =====
      // Check phase first - hide car completely in sponsors/team phases
      const currentPhaseForView = phaseRef.current;
      const shouldHideCar = currentPhaseForView === "sponsors" || currentPhaseForView === "team";

      const mode = viewModeRef.current || "render";
      if (sceneObjectsRef.current.carMesh) {
        const mesh = sceneObjectsRef.current.carMesh;
        const wire = sceneObjectsRef.current.wireframe;
        const points = sceneObjectsRef.current.vertexPoints;

        // Force hide in sponsors/team phases
        if (shouldHideCar) {
          mesh.visible = false;
          if (wire) wire.visible = false;
          if (points) points.visible = false;
        } else if (mode === "render") {
          mesh.material.opacity = 1;
          mesh.material.transparent = false;
          mesh.visible = true;
          if (wire) { wire.material.opacity = 0; wire.visible = false; }
          if (points) { points.material.opacity = 0; points.visible = false; }
        } else if (mode === "mesh") {
          mesh.visible = false;
          if (wire) { wire.material.opacity = 1; wire.visible = true; }
          if (points) { points.material.opacity = 0; points.visible = false; }
        } else if (mode === "vertex") {
          mesh.visible = false;
          if (wire) { wire.material.opacity = 0.3; wire.visible = true; }
          if (points) { points.material.opacity = 1; points.visible = true; }
        } else if (mode === "blueprint") {
          mesh.material.opacity = 0.3;
          mesh.material.transparent = true;
          mesh.visible = true;
          if (wire) { wire.material.opacity = 0.8; wire.visible = true; wire.material.color.set(0x0088ff); }
          if (points) { points.material.opacity = 0; points.visible = false; }
        }
      }

      // ===== PHASE-BASED SCENE =====
      const currentPhase = phaseRef.current;

      // Debug: log phase changes
      if (!window._lastPhase || window._lastPhase !== currentPhase) {
        console.log("Phase changed to:", currentPhase);
        window._lastPhase = currentPhase;
        // Reset aero debug flag on phase change
        window._aeroDebugLogged = false;
      }

      // Get phase-specific config (fallback to engineering if unknown phase)
      const phaseConfig = PHASE_CONFIGS[currentPhase] || PHASE_CONFIGS.engineering;

      // Debug controls ADD to phase config (for fine-tuning)
      const debugOffset = carOffsetRef.current || { x: 0, y: 0, z: 0 };
      const debugScale = carScaleRef.current || 1;
      const debugPos = carPosRef.current || { x: 0, y: 0, z: 0 };

      // Apply phase config + debug offset to car mesh
      if (sceneObjectsRef.current.carMesh) {
        const finalOffset = {
          x: phaseConfig.carOffset.x + debugOffset.x,
          y: phaseConfig.carOffset.y + debugOffset.y,
          z: phaseConfig.carOffset.z + debugOffset.z,
        };
        sceneObjectsRef.current.carMesh.position.set(finalOffset.x, finalOffset.y, finalOffset.z);

        const baseScale = sceneObjectsRef.current.carMesh.userData.baseScale || 1;
        const finalScale = baseScale * phaseConfig.carScale * debugScale;
        sceneObjectsRef.current.carMesh.scale.setScalar(finalScale);

        // Sync wireframe and vertex points with car mesh
        if (sceneObjectsRef.current.wireframe) {
          sceneObjectsRef.current.wireframe.position.copy(sceneObjectsRef.current.carMesh.position);
          sceneObjectsRef.current.wireframe.scale.setScalar(finalScale);
        }
        if (sceneObjectsRef.current.vertexPoints) {
          sceneObjectsRef.current.vertexPoints.position.copy(sceneObjectsRef.current.carMesh.position);
          sceneObjectsRef.current.vertexPoints.scale.setScalar(finalScale);
        }
      }

      // Position car container based on phase config + debug adjustment + global offset
      carContainer.position.set(
        phaseConfig.carPos.x + debugPos.x + SCENE_X_OFFSET,
        phaseConfig.carPos.y + debugPos.y,
        phaseConfig.carPos.z + debugPos.z
      );

      // Show/hide elements based on phase config
      podiumGroup.visible = phaseConfig.showPodium;
      windTunnelGroup.visible = currentPhase === "aero";

      // Camera position based on phase config
      // Skip lerp for aero phase - orbit camera is handled in aero section
      if (currentPhase !== "aero") {
        const targetCameraPos = new THREE.Vector3(
          phaseConfig.cameraPos.x,
          phaseConfig.cameraPos.y,
          phaseConfig.cameraPos.z
        );
        camera.position.lerp(targetCameraPos, 0.02);
      }

      // Hide car in sponsors and team phases, show in others
      const carVisible = currentPhase !== "sponsors" && currentPhase !== "team";
      if (sceneObjectsRef.current.carMesh) {
        sceneObjectsRef.current.carMesh.visible = carVisible;
      }
      if (sceneObjectsRef.current.wireframe) {
        sceneObjectsRef.current.wireframe.visible = carVisible;
      }
      if (sceneObjectsRef.current.vertexPoints) {
        sceneObjectsRef.current.vertexPoints.visible = carVisible;
      }

      // Update Spotlight
      if (currentPhase === 'hero' || currentPhase === 'engineering' || currentPhase === 'garage') {
         spotLight.intensity = 100;
         // Lerp the spotlight target to the mouse position on the ground plane
         // The planeIntersect is updated in the mousemove listener, but we need to do it here properly if camera moves
         raycaster.setFromCamera(mouse, camera);
         if (raycaster.ray.intersectPlane(plane, planeIntersect)) {
             spotlightTargetPos.lerp(planeIntersect, 0.1);
             spotLight.target.position.copy(spotlightTargetPos);
             // Move the light source slightly to follow but stay above
             spotLight.position.x += (planeIntersect.x - spotLight.position.x) * 0.05;
             spotLight.position.z += (planeIntersect.z + 5 - spotLight.position.z) * 0.05;
         }
      } else {
         spotLight.intensity = 0; // Hide in other phases
      }

      // Car rotation based on phase
      if (currentPhase === "hero") {
        // Static position for hero - no auto rotation
        carGroup.rotation.y = phaseConfig.carRotation;
      }
      else if (currentPhase === "engineering") {
        carGroup.rotation.y = phaseConfig.carRotation;
      }
      else if (currentPhase === "garage") {
        // Static for garage too
        carGroup.rotation.y = phaseConfig.carRotation;
      }
      else if (currentPhase === "aero") {
        // Car stays at fixed rotation
        carGroup.rotation.y = phaseConfig.carRotation;

        // Ensure wind tunnel is visible
        windTunnelGroup.visible = true;

        // Debug logging for aero phase
        if (!window._aeroDebugLogged) {
          console.log("AERO DEBUG:", {
            windTunnelVisible: windTunnelGroup.visible,
            windTunnelInScene: scene.children.includes(windTunnelGroup),
            windTunnelPosition: windTunnelGroup.position.toArray(),
            fanBlades: !!sceneObjectsRef.current.fanBlades,
            particles: !!particles,
            particlesVisible: particles ? particles.visible : 'N/A'
          });
          window._aeroDebugLogged = true;
        }

        // 360 degree CAMERA orbit around the scene
        const orbitAngle = aeroRotationRef.current || 0;
        const orbitRadius = 18;
        const orbitHeight = 5;
        const centerX = phaseConfig.carPos.x + SCENE_X_OFFSET;
        const centerZ = phaseConfig.carPos.z;

        // Calculate camera position orbiting around the center
        const camX = centerX + Math.sin(orbitAngle) * orbitRadius;
        const camZ = centerZ + Math.cos(orbitAngle) * orbitRadius;
        camera.position.set(camX, orbitHeight, camZ);

        // Camera always looks at the center of the scene (car area)
        camera.lookAt(centerX, 0.5, centerZ);

        // Get current preset for visual effects
        const currentPreset = aeroPresetRef.current || "normal";
        const isExtreme = currentPreset === "extreme";
        const isNull = currentPreset === "null";

        // Speed multiplier based on preset
        const speedMult = isExtreme ? 2.5 : (isNull ? 0.3 : 1.0);
        const fanSpeed = isExtreme ? 0.6 : (isNull ? 0.1 : 0.3);

        // Animate fan blades
        if (sceneObjectsRef.current.fanBlades) {
          sceneObjectsRef.current.fanBlades.rotation.x += fanSpeed;
        }

        // Ensure particles are visible in aero mode
        if (particles) {
          particles.visible = true;
        }

        // Animate particles with preset-based effects
        if (particles && particles.geometry) {
          const positions = particles.geometry.attributes.position.array;
          const colors = particles.geometry.attributes.color.array;
          const bounds = sceneObjectsRef.current.carBounds;
          const origY = sceneObjectsRef.current.particleOriginalY;
          const origZ = sceneObjectsRef.current.particleOriginalZ;
          const phases = sceneObjectsRef.current.particlePhase;
          const initP = sceneObjectsRef.current.initParticle;

          // Update particle material size based on preset
          particles.material.size = isExtreme ? 0.12 : (isNull ? 0.04 : 0.08);

          for (let i = 0; i < particleCount; i++) {
            const x = positions[i * 3];
            const y = positions[i * 3 + 1];
            const z = positions[i * 3 + 2];

            // Move particles from RIGHT to LEFT
            positions[i * 3] -= particleSpeeds[i] * speedMult;

            // Turbulence based on preset
            const turbulence = isExtreme ? 0.3 : (isNull ? 0.05 : 0.12);
            positions[i * 3 + 1] = origY[i] + Math.sin(time * 4 + phases[i]) * turbulence;
            positions[i * 3 + 2] = origZ[i] + Math.cos(time * 3 + phases[i] * 0.7) * turbulence * 0.5;

            // Check if particle is near car (collision/heat zone)
            const inCarZone = x > bounds.minX && x < bounds.maxX &&
                             y > bounds.minY && y < bounds.maxY &&
                             z > bounds.minZ && z < bounds.maxZ;

            if (inCarZone) {
              // HEAT EFFECT - particles turn red/orange when hitting the car
              const heatFactor = Math.min(1, (bounds.maxX - x) / (bounds.maxX - bounds.minX));

              if (isExtreme) {
                // Extreme mode: intense red/orange heat
                colors[i * 3] = 1.0;
                colors[i * 3 + 1] = 0.1 + heatFactor * 0.2;
                colors[i * 3 + 2] = 0.0;
              } else {
                // Normal mode: yellow to orange heat
                colors[i * 3] = 1.0;
                colors[i * 3 + 1] = 0.3 + heatFactor * 0.4;
                colors[i * 3 + 2] = heatFactor * 0.1;
              }

              // Deflect around car body
              const deflect = isExtreme ? 0.15 : 0.08;
              positions[i * 3 + 2] += (z > 0 ? deflect : -deflect);
              positions[i * 3 + 1] += (y > 1 ? deflect * 0.7 : -deflect * 0.7);
            } else {
              // Color based on preset when not near car
              if (isExtreme) {
                // Extreme: red/orange waves
                const wave = Math.sin(x * 0.3 + time * 5) * 0.5 + 0.5;
                colors[i * 3] = 0.8 + wave * 0.2;
                colors[i * 3 + 1] = 0.2 + wave * 0.3;
                colors[i * 3 + 2] = 0.0;
              } else if (isNull) {
                // Null: very faint blue
                colors[i * 3] = 0.2;
                colors[i * 3 + 1] = 0.4;
                colors[i * 3 + 2] = 0.6;
              } else {
                // Normal: cyan to green gradient
                const speedRatio = particleSpeeds[i] / 0.33;
                colors[i * 3] = 0.0;
                colors[i * 3 + 1] = 0.5 + speedRatio * 0.3;
                colors[i * 3 + 2] = 1.0 - speedRatio * 0.3;
              }
            }

            // Reset particle when it exits left
            if (positions[i * 3] < -20) {
              initP(i);
            }
          }
          particles.geometry.attributes.position.needsUpdate = true;
          particles.geometry.attributes.color.needsUpdate = true;
        }
      }
      else if (currentPhase === "sponsors" || currentPhase === "team") {
        // Hide EVERYTHING for sponsors and team sections - completely blank 3D scene
        if (sceneObjectsRef.current.carMesh) {
          sceneObjectsRef.current.carMesh.visible = false;
        }
        if (sceneObjectsRef.current.wireframe) {
          sceneObjectsRef.current.wireframe.visible = false;
        }
        if (sceneObjectsRef.current.vertexPoints) {
          sceneObjectsRef.current.vertexPoints.visible = false;
        }
        podiumGroup.visible = false;
        windTunnelGroup.visible = false;
        if (particles) particles.visible = false;
        // Hide ground plane too
        ground.visible = false;
        // Hide car container/group
        carContainer.visible = false;
        carGroup.visible = false;
        // Turn off all lights
        spotLight.intensity = 0;
      } else {
        // Restore ground visibility for other phases
        ground.visible = true;
        carContainer.visible = true;
        carGroup.visible = true;
      }

      // Camera looks at where the car is positioned (with global offset)
      // Skip for aero phase - orbit camera is handled above
      if (currentPhase !== "aero") {
        const carLookAt = new THREE.Vector3(
          phaseConfig.carPos.x + debugPos.x + SCENE_X_OFFSET,
          phaseConfig.carPos.y + debugPos.y + 1, // Slightly above car center
          phaseConfig.carPos.z + debugPos.z
        );
        camera.lookAt(carLookAt);
      }

      updatePins();
      renderer.render(scene, camera);
      } catch (err) {
        console.error("Animation loop error:", err);
      }
    }

    animate();

    // ========== RESIZE HANDLER ==========
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    // ========== CLEANUP ==========
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener('mousemove', updateSpotlight);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      renderer.dispose();
    };
  }, [canvasRef, pinOverlayRef, setHud]);
}
