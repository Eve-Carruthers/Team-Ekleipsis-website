import { useEffect, useRef } from "react";
import * as THREE from "three";
import { STLLoader } from "three/addons/loaders/STLLoader.js";

// Hotspot data - screen offsets stored in window for debug adjustment
const HOTSPOTS = [
  { id: "halo", label: "Halo", specs: ["3D Printed PLA", "Mandatory Safety Structure"], desc: "Protective arch mandated by 2025 Technical Regulations." },
  { id: "nose-cone", label: "Nose Cone", specs: ["Separate Assembly", "Streamlined Geometry"], desc: "Redesigned front assembly with reduced frontal area." },
  { id: "front-wing", label: "Front Wing", specs: ["70mm Full-Width Span", "Integrated Endplates"], desc: "Controllable surfaces conditioning boundary layer flow." },
  { id: "rear-wing", label: "Rear Wing", specs: ["Single Unbroken Span", "Behind Ref. Plane B"], desc: "Primary downforce generator with optimized profile." },
  { id: "wheels", label: "Wheel System", specs: ["PEEK Ceramic ZrO2 Bearings", "Carbon Fibre Axle Rods"], desc: "Spoke/turbine design with F1 Bearings precision ceramics." },
  { id: "body", label: "Main Body", specs: ["CNC Machined", "~50g Total Mass"], desc: "Machined from Denford polyurethane block. Integrated CO2 chamber." },
];

const HOTSPOT_PART_MAP = {
  "halo": ["halo"],
  "nose-cone": ["nose_cone"],
  "front-wing": ["front_wing"],
  "rear-wing": ["rear_wing"],
  "wheels": ["wheel_FL", "wheel_FR", "wheel_RL", "wheel_RR"],
  "body": ["main_body"],
};

const BLUEPRINT_LABEL_IDS = ["rear-wing", "halo", "nose-cone", "front-wing"];

window.pinOffsets = window.pinOffsets || {
  "halo": { x: 0, y: 0 },
  "nose-cone": { x: 0, y: 0 },
  "front-wing": { x: 0, y: 0 },
  "rear-wing": { x: 0, y: 0 },
  "wheels": { x: 0, y: 0 },
  "body": { x: 0, y: 0 },
};

// Global offset to shift entire scene left (make room for UI panels on right)
const SCENE_X_OFFSET = -3;

// Phase-specific car configurations (user-tuned values)
const PHASE_CONFIGS = {
  hero: {
    carOffset: { x: 0.8, y: 0.9, z: 4.2 },
    carScale: 1.43,
    carPos: { x: 14.9, y: 0.9, z: 4 },
    showPodium: false,
    cameraPos: { x: 2.0, y: 2.8, z: 26.5 },
    carRotation: -1.361357,
  },
  integration: {
    carOffset: { x: 1.6, y: 0.94, z: 6.2 },
    carScale: 1.15,
    carPos: { x: 0.4, y: -0.22, z: -1.0 },
    showPodium: false,
    cameraPos: { x: -0.4, y: 2.9, z: 24.0 },
    carRotation: Math.PI * 2 / 3,
  },
  engineering: {
    carOffset: { x: 0.6, y: 0.88, z: 4.0 },
    carScale: 0.78,
    carPos: { x: 5.6, y: -0.12, z: -1.2 },
    showPodium: true,
    cameraPos: { x: 1.1, y: 2.9, z: 27.5 },
    carRotation: -Math.PI / 4,
  },
  aero: {
    // Car stays in original position - wind machine moved to right side
    carOffset: { x: 0.8, y: 0.9, z: 6.4 },
    carScale: 1.2,
    carPos: { x: 2.8, y: -0.42, z: -1.6 },
    showPodium: false,
    cameraPos: { x: 0, y: 3.8, z: 19.0 },
    carRotation: -Math.PI / 2 + 0.08,
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
  achievements: {
    carOffset: { x: 0, y: -100, z: 0 },
    carScale: 0,
    carPos: { x: 0, y: -100, z: 0 },
    showPodium: false,
    cameraPos: { x: 0, y: 5, z: 20 },
    carRotation: 0,
    hideCar: true,
  },
};

const ASSEMBLY_STAGGER_NORMALIZED = 0.42;
const ASSEMBLY_MIN_OPACITY = 0.06;
const EASE_OUT_BACK_C1 = 1.70158;
const AUTO_ASSEMBLY_STEP_SECONDS = 1.0;
const ROTATION_ENABLED_PHASES = new Set(["hero", "integration", "engineering"]);

const PART_COLOR_MAP = {
  main_body: 0x1a2130,
  nose_cone: 0xba6a2d,
  front_wing: 0x161922,
  rear_wing: 0x141821,
  halo: 0x252d3f,
  front_suspension: 0x1f2533,
  rear_suspension: 0x1f2533,
  wheel_FL: 0x101114,
  wheel_FR: 0x101114,
  wheel_RL: 0x101114,
  wheel_RR: 0x101114,
};

const HERO_LOOK_BIAS_DEFAULT = -4.4;
const HERO_PLACEMENT_DEFAULT = {
  carPosX: PHASE_CONFIGS.hero.carPos.x,
  carPosY: PHASE_CONFIGS.hero.carPos.y,
  carPosZ: PHASE_CONFIGS.hero.carPos.z,
  carScale: PHASE_CONFIGS.hero.carScale,
  carRotation: PHASE_CONFIGS.hero.carRotation,
  lookBiasX: HERO_LOOK_BIAS_DEFAULT,
};

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function easeOutBack(t) {
  const c3 = EASE_OUT_BACK_C1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + EASE_OUT_BACK_C1 * Math.pow(t - 1, 2);
}

function clonePhaseConfig(baseConfig) {
  return {
    ...baseConfig,
    carOffset: { ...baseConfig.carOffset },
    carPos: { ...baseConfig.carPos },
    cameraPos: { ...baseConfig.cameraPos },
  };
}

function getPartIdFromFile(file) {
  const match = /([^/\\]+)\.stl$/i.exec(file || "");
  return match ? match[1] : "";
}

function getPartColor(partId) {
  return PART_COLOR_MAP[partId] || 0x20242d;
}

function isPartMatch(partId, targetId) {
  if (!targetId) return false;
  if (partId === targetId) return true;
  if (targetId === "wheel_system") return /^wheel_/i.test(partId);
  return false;
}

function computeHotspotAnchors(parts) {
  const partCenters = {};
  const fallbackCenter = new THREE.Vector3(0, 0, 0);
  let fallbackCount = 0;

  parts.forEach((part) => {
    const partId = getPartIdFromFile(part.file);
    if (!partId || !part.geometry) return;

    part.geometry.computeBoundingBox();
    if (!part.geometry.boundingBox) return;

    const center = part.geometry.boundingBox.getCenter(new THREE.Vector3());
    partCenters[partId] = center;
    fallbackCenter.add(center);
    fallbackCount++;
  });

  if (fallbackCount > 0) fallbackCenter.multiplyScalar(1 / fallbackCount);

  const anchors = {};
  HOTSPOTS.forEach((hotspot) => {
    const mappedParts = HOTSPOT_PART_MAP[hotspot.id] || [];
    const collected = mappedParts
      .map((partId) => partCenters[partId])
      .filter(Boolean);

    if (collected.length > 0) {
      const anchor = new THREE.Vector3();
      collected.forEach((vec) => anchor.add(vec));
      anchor.multiplyScalar(1 / collected.length);
      anchors[hotspot.id] = anchor;
      return;
    }

    anchors[hotspot.id] = fallbackCenter.clone();
  });

  return anchors;
}

function getPhaseConfigForViewport(phaseName, baseConfig) {
  const config = clonePhaseConfig(baseConfig);
  if (phaseName !== "hero") return config;
  return config;
}

export default function useThreeStage({
  canvasRef, pinOverlayRef, setHud, phase, theme,
  viewMode, isolatedPart, setIsolatedPart
}) {
  const phaseRef = useRef(phase);
  const themeRef = useRef(theme);
  const viewModeRef = useRef(viewMode || "render");
  const dragOrbitRef = useRef({
    active: false,
    pointerId: null,
    lastX: 0,
    lastY: 0,
    yaw: 0,
    pitch: 0,
    targetYaw: 0,
    targetPitch: 0,
  });
  const zoomRef = useRef({ value: 0, target: 0 });

  const aeroRotationRef = useRef(0);
  const aeroPresetRef = useRef("normal");
  const heroPlacementRef = useRef({ ...HERO_PLACEMENT_DEFAULT });
  const heroPlacementLockedRef = useRef(false);

  // Scene object refs
  const sceneObjectsRef = useRef({});
  const rafRef = useRef(0);
  const pinsAdded = useRef(false);

  // Update refs when props change
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { themeRef.current = theme; }, [theme]);
  useEffect(() => { viewModeRef.current = viewMode; }, [viewMode]);

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

    function getOrCreateAssemblyState() {
      if (!sceneObjectsRef.current.assemblyState) {
        sceneObjectsRef.current.assemblyState = {
          active: false,
          mode: "build",
          selectedPart: "main_body",
          placedParts: new Set(),
          autoRunning: false,
          autoStartTime: 0,
          autoCompleted: false,
        };
      }
      return sceneObjectsRef.current.assemblyState;
    }

    const onIntegrationModeChange = (evt) => {
      const mode = evt.detail?.mode === "auto" ? "auto" : "build";
      const state = getOrCreateAssemblyState();
      state.mode = mode;
      state.selectedPart = mode === "build" ? (state.selectedPart || "main_body") : null;
      state.autoRunning = false;
      state.autoCompleted = false;
      state.placedParts = new Set();
    };

    const onIntegrationReset = () => {
      const state = getOrCreateAssemblyState();
      state.autoRunning = false;
      state.autoCompleted = false;
      state.placedParts = new Set();
    };

    const onIntegrationSelectPart = (evt) => {
      const state = getOrCreateAssemblyState();
      state.selectedPart = evt.detail?.partId || null;
    };

    const onIntegrationPlacePart = (evt) => {
      const partId = evt.detail?.partId;
      if (!partId) return;
      const state = getOrCreateAssemblyState();
      state.mode = "build";
      state.autoRunning = false;
      if (partId === "wheel_system") {
        state.placedParts.add("wheel_FL");
        state.placedParts.add("wheel_FR");
        state.placedParts.add("wheel_RL");
        state.placedParts.add("wheel_RR");
        return;
      }
      state.placedParts.add(partId);
    };

    const onIntegrationStartAuto = () => {
      const state = getOrCreateAssemblyState();
      state.mode = "auto";
      state.autoRunning = true;
      state.autoCompleted = false;
      state.autoStartTime = clock.getElapsedTime();
      state.placedParts = new Set();
      state.selectedPart = null;
    };

    const sendHeroPlacementSync = () => {
      const tune = heroPlacementRef.current || HERO_PLACEMENT_DEFAULT;
      window.dispatchEvent(
        new CustomEvent("hero-placement-sync", {
          detail: {
            carPosX: tune.carPosX,
            carPosY: tune.carPosY,
            carPosZ: tune.carPosZ,
            carScale: tune.carScale,
            carRotation: tune.carRotation,
            carRotationDeg: (tune.carRotation * 180) / Math.PI,
            lookBiasX: tune.lookBiasX,
            locked: !!heroPlacementLockedRef.current,
          },
        })
      );
    };

    const onHeroPlacementSet = (evt) => {
      const detail = evt.detail || {};
      const currentTune = heroPlacementRef.current || HERO_PLACEMENT_DEFAULT;
      const nextTune = { ...currentTune };

      if (Number.isFinite(detail.carPosX)) nextTune.carPosX = detail.carPosX;
      if (Number.isFinite(detail.carPosY)) nextTune.carPosY = detail.carPosY;
      if (Number.isFinite(detail.carPosZ)) nextTune.carPosZ = detail.carPosZ;
      if (Number.isFinite(detail.carScale)) nextTune.carScale = detail.carScale;
      if (Number.isFinite(detail.lookBiasX)) nextTune.lookBiasX = detail.lookBiasX;
      if (Number.isFinite(detail.carRotation)) {
        nextTune.carRotation = detail.carRotation;
      } else if (Number.isFinite(detail.carRotationDeg)) {
        nextTune.carRotation = (detail.carRotationDeg * Math.PI) / 180;
      }

      heroPlacementRef.current = nextTune;
    };

    const onHeroPlacementLock = (evt) => {
      heroPlacementLockedRef.current = !!evt.detail?.locked;
      sendHeroPlacementSync();
    };

    const onHeroPlacementReset = () => {
      heroPlacementRef.current = { ...HERO_PLACEMENT_DEFAULT };
      heroPlacementLockedRef.current = false;
      sendHeroPlacementSync();
    };

    window.addEventListener("integration-mode-change", onIntegrationModeChange);
    window.addEventListener("integration-reset", onIntegrationReset);
    window.addEventListener("integration-select-part", onIntegrationSelectPart);
    window.addEventListener("integration-place-part", onIntegrationPlacePart);
    window.addEventListener("integration-start-auto", onIntegrationStartAuto);
    window.addEventListener("hero-placement-set", onHeroPlacementSet);
    window.addEventListener("hero-placement-lock", onHeroPlacementLock);
    window.addEventListener("hero-placement-reset", onHeroPlacementReset);
    sendHeroPlacementSync();

    const shouldAllowOrbit = () => ROTATION_ENABLED_PHASES.has(phaseRef.current);

    const onPointerDown = (evt) => {
      if (!shouldAllowOrbit()) return;
      dragOrbitRef.current.active = true;
      dragOrbitRef.current.pointerId = evt.pointerId;
      dragOrbitRef.current.lastX = evt.clientX;
      dragOrbitRef.current.lastY = evt.clientY;
      canvas.style.cursor = "grabbing";
      if (canvas.setPointerCapture) canvas.setPointerCapture(evt.pointerId);
    };

    const onPointerMove = (evt) => {
      const drag = dragOrbitRef.current;
      if (!drag.active) return;
      const dx = evt.clientX - drag.lastX;
      const dy = evt.clientY - drag.lastY;
      drag.lastX = evt.clientX;
      drag.lastY = evt.clientY;
      drag.targetYaw += dx * 0.006;
      drag.targetPitch = THREE.MathUtils.clamp(drag.targetPitch + dy * 0.0038, -0.45, 0.45);
    };

    const onPointerUp = (evt) => {
      if (!dragOrbitRef.current.active) return;
      dragOrbitRef.current.active = false;
      if (canvas.releasePointerCapture && dragOrbitRef.current.pointerId != null) {
        try { canvas.releasePointerCapture(dragOrbitRef.current.pointerId); } catch (err) { /* noop */ }
      }
      dragOrbitRef.current.pointerId = null;
      canvas.style.cursor = shouldAllowOrbit() ? "grab" : "default";
    };

    const onWheel = (evt) => {
      if (phaseRef.current !== "engineering") return;
      evt.preventDefault();
      const next = zoomRef.current.target + evt.deltaY * 0.01;
      zoomRef.current.target = THREE.MathUtils.clamp(next, -5.5, 8.5);
    };

    canvas.style.cursor = shouldAllowOrbit() ? "grab" : "default";
    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });


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
      color: 0xffffff,
      vertexColors: true,
      metalness: 0.78,
      roughness: 0.22,
      clearcoat: 1.0,
      clearcoatRoughness: 0.12,
      reflectivity: 0.85,
      envMapIntensity: 1.1,
    });
    sceneObjectsRef.current.bodyMaterial = bodyMaterial;

    const accentMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x13161c,
      metalness: 0.92,
      roughness: 0.18,
      clearcoat: 0.84,
      emissive: 0x000000,
      emissiveIntensity: 0,
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

    // ========== LOAD CAR MODEL (Multi-part EK5) ==========
    let carMesh = null;
    let wireframe = null;
    let vertexPoints = null;
    const pins = [];

    const PART_FILES = [
      '3D Assets/EK5_parts/main_body.stl',
      '3D Assets/EK5_parts/nose_cone.stl',
      '3D Assets/EK5_parts/front_wing.stl',
      '3D Assets/EK5_parts/rear_wing.stl',
      '3D Assets/EK5_parts/halo.stl',
      '3D Assets/EK5_parts/wheel_FL.stl',
      '3D Assets/EK5_parts/wheel_FR.stl',
      '3D Assets/EK5_parts/wheel_RL.stl',
      '3D Assets/EK5_parts/wheel_RR.stl',
      '3D Assets/EK5_parts/front_suspension.stl',
      '3D Assets/EK5_parts/rear_suspension.stl',
    ];

    const loader = new STLLoader();
    const loadedParts = new Array(PART_FILES.length);
    let partsLoaded = 0;

    PART_FILES.forEach((file, index) => {
      loader.load(file, (geometry) => {
        loadedParts[index] = { file, geometry };
        partsLoaded++;
        console.log(`Loaded ${partsLoaded}/${PART_FILES.length}: ${file}`);

        if (partsLoaded === PART_FILES.length) {
          const centeredParts = centerPartGeometries(loadedParts);
          sceneObjectsRef.current.hotspotAnchors = computeHotspotAnchors(centeredParts);

          // Merge all parts for stable engineering/wireframe modes.
          const mergedGeometry = mergeGeometries(centeredParts);
          mergedGeometry.computeVertexNormals();

          carMesh = new THREE.Mesh(mergedGeometry, bodyMaterial);
          carMesh.castShadow = true;
          carMesh.receiveShadow = true;

          // Scale to fill podium (same as old code)
          const box = new THREE.Box3().setFromObject(carMesh);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 14 / maxDim;
          carMesh.scale.setScalar(scale);
          carMesh.userData.baseScale = scale;
          // EK5 STL: Z = front-to-back, Y = up. Rotate to face left for wind tunnel.
          carMesh.rotation.y = -Math.PI / 2;
          carMesh.position.y = 0;

          carGroup.add(carMesh);
          sceneObjectsRef.current.carMesh = carMesh;

          const assemblyGroup = new THREE.Group();
          assemblyGroup.visible = false;
          carGroup.add(assemblyGroup);
          sceneObjectsRef.current.assemblyGroup = assemblyGroup;

          sceneObjectsRef.current.assemblyMeshes = buildAssemblyMeshes(
            centeredParts,
            carMesh,
            assemblyGroup,
            bodyMaterial,
            accentMaterial
          );
          sceneObjectsRef.current.assemblyState = {
            active: false,
            mode: "build",
            selectedPart: "main_body",
            placedParts: new Set(),
            autoRunning: false,
            autoStartTime: 0,
            autoCompleted: false,
          };

          // Wireframe for engineering view
          const edgesGeometry = new THREE.EdgesGeometry(mergedGeometry, 15);
          wireframe = new THREE.LineSegments(edgesGeometry, wireMaterial);
          wireframe.scale.copy(carMesh.scale);
          wireframe.rotation.copy(carMesh.rotation);
          wireframe.position.copy(carMesh.position);
          carGroup.add(wireframe);
          sceneObjectsRef.current.wireframe = wireframe;

          // Vertex points for engineering view
          vertexPoints = new THREE.Points(mergedGeometry, pointMaterial);
          vertexPoints.scale.copy(carMesh.scale);
          vertexPoints.rotation.copy(carMesh.rotation);
          vertexPoints.position.copy(carMesh.position);
          carGroup.add(vertexPoints);
          sceneObjectsRef.current.vertexPoints = vertexPoints;

          // Setup hotspot pins (same as old code)
          if (pinOverlayRef.current && !pinsAdded.current) {
            pinOverlayRef.current.innerHTML = "";
            HOTSPOTS.forEach((h) => {
              const el = document.createElement("div");
              el.className = "hotspot-pin";
              el.setAttribute("data-label", h.label);
              el.setAttribute("data-hotspot-id", h.id);
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
            setTimeout(() => {
              if (typeof setupPinDragging === "function") setupPinDragging();
            }, 100);
          }
        }
      });
    });

    function centerPartGeometries(parts) {
      const sourceParts = parts.filter(Boolean);
      const worldBox = new THREE.Box3();

      sourceParts.forEach(({ geometry }) => {
        geometry.computeBoundingBox();
        if (geometry.boundingBox) worldBox.union(geometry.boundingBox);
      });

      const center = worldBox.getCenter(new THREE.Vector3());
      return sourceParts.map((part) => {
        const geometry = part.geometry.clone();
        geometry.translate(-center.x, -center.y, -center.z);
        geometry.computeVertexNormals();
        return { file: part.file, geometry };
      });
    }

    // Helper: merge multiple BufferGeometry into one with per-part vertex colors.
    function mergeGeometries(parts) {
      let totalVertices = 0;
      parts.forEach((part) => { totalVertices += part.geometry.attributes.position.count; });

      const positions = new Float32Array(totalVertices * 3);
      const normals = new Float32Array(totalVertices * 3);
      const colors = new Float32Array(totalVertices * 3);
      let offset = 0;

      parts.forEach((part) => {
        const g = part.geometry;
        const pos = g.attributes.position.array;
        const norm = g.attributes.normal ? g.attributes.normal.array : null;
        const partId = getPartIdFromFile(part.file);
        const color = new THREE.Color(getPartColor(partId));
        positions.set(pos, offset * 3);
        if (norm) normals.set(norm, offset * 3);
        const count = g.attributes.position.count;
        for (let i = 0; i < count; i++) {
          const base = (offset + i) * 3;
          colors[base] = color.r;
          colors[base + 1] = color.g;
          colors[base + 2] = color.b;
        }
        offset += g.attributes.position.count;
      });

      const merged = new THREE.BufferGeometry();
      merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
      merged.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      return merged;
    }

    function seededUnit(seed) {
      const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
      return x - Math.floor(x);
    }

    function createPartMaterial(file, bodyMat, accentMat) {
      const partId = getPartIdFromFile(file);
      const darkPart = /wheel|suspension|wing|halo/i.test(partId);
      const source = darkPart ? accentMat : bodyMat;
      const material = source.clone();
      material.vertexColors = false;
      const baseColorHex = getPartColor(partId);
      material.color.setHex(baseColorHex);
      material.transparent = true;
      material.opacity = 0;
      material.emissive = new THREE.Color(0x000000);
      material.emissiveIntensity = 0;
      material.userData = { ...(material.userData || {}), baseColorHex };
      return material;
    }

    function buildAssemblyMeshes(parts, targetMesh, group, bodyMat, accentMat) {
      const assemblyMeshes = [];

      parts.forEach((part, i) => {
        const partId = getPartIdFromFile(part.file);
        const mesh = new THREE.Mesh(part.geometry, createPartMaterial(part.file, bodyMat, accentMat));
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.scale.copy(targetMesh.scale);
        mesh.rotation.copy(targetMesh.rotation);
        mesh.position.copy(targetMesh.position);

        const r1 = seededUnit(i + 1.71);
        const r2 = seededUnit(i + 8.33);
        const r3 = seededUnit(i + 23.57);
        const spread = 3.8 + r1 * 4.6;
        const angle = (i / Math.max(1, parts.length)) * Math.PI * 2 + r2 * 0.6;
        const lift = -1.4 + r3 * 4.8;
        const depth = 2.2 + r2 * 5.1;

        const startPosition = mesh.position.clone().add(
          new THREE.Vector3(Math.cos(angle) * spread, lift, Math.sin(angle) * spread + depth)
        );
        const startRotation = new THREE.Euler(
          mesh.rotation.x + (r1 - 0.5) * 2.2,
          mesh.rotation.y + (r2 - 0.5) * 2.4,
          mesh.rotation.z + (r3 - 0.5) * 1.4
        );
        const startScale = mesh.scale.clone().multiplyScalar(0.56 + r1 * 0.28);

        mesh.userData.finalPosition = mesh.position.clone();
        mesh.userData.finalRotation = mesh.rotation.clone();
        mesh.userData.finalScale = mesh.scale.clone();
        mesh.userData.partId = partId;
        mesh.userData.startPosition = startPosition;
        mesh.userData.startRotation = startRotation;
        mesh.userData.startScale = startScale;
        const normalizedIndex = parts.length > 1 ? i / (parts.length - 1) : 0;
        mesh.userData.delayNormalized = normalizedIndex * ASSEMBLY_STAGGER_NORMALIZED;

        mesh.position.copy(startPosition);
        mesh.rotation.copy(startRotation);
        mesh.scale.copy(startScale);

        group.add(mesh);
        assemblyMeshes.push(mesh);
      });

      return assemblyMeshes;
    }

    // ========== WIND TUNNEL EQUIPMENT (positioned around the car) ==========
    const windTunnelGroup = new THREE.Group();
    windTunnelGroup.position.set(-3 + SCENE_X_OFFSET, 0, 0);
    windTunnelGroup.visible = false;
    scene.add(windTunnelGroup);

    // Industrial fan/blower machine (on the LEFT side for left-to-right flow)
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

    // Wind machine on the LEFT side - wind blows RIGHT toward the car
    fanGroup.position.set(-28, 1, 0);
    fanGroup.rotation.y = 0;
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

    // ========== AIRFLOW PARTICLES (flow from LEFT to RIGHT - toward car) ==========
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
      // Start from LEFT side and flow RIGHT
      particlePositions[i * 3] = -30 - Math.random() * 6;
      particlePositions[i * 3 + 1] = -1.5 + Math.random() * 3.2;
      particlePositions[i * 3 + 2] = -2.4 + Math.random() * 4.8;
      particleOriginalY[i] = particlePositions[i * 3 + 1];
      particleOriginalZ[i] = particlePositions[i * 3 + 2];
      particlePhase[i] = Math.random() * Math.PI * 2;
      particleSpeeds[i] = 0.18 + Math.random() * 0.2;
    }

    for (let i = 0; i < particleCount; i++) {
      initParticle(i);
      // Spread particles across the whole tunnel initially
      particlePositions[i * 3] = -24 + Math.random() * 48;
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
    const podiumBounds = new THREE.Box3();
    const podiumTargetCenter = new THREE.Vector3();

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

        let screenX = carCenterScreen.x;
        let screenY = carCenterScreen.y;
        const anchor = sceneObjectsRef.current.hotspotAnchors?.[p.id];
        if (sceneObjectsRef.current.carMesh && anchor) {
          const worldPoint = anchor.clone();
          sceneObjectsRef.current.carMesh.updateMatrixWorld(true);
          worldPoint.applyMatrix4(sceneObjectsRef.current.carMesh.matrixWorld);
          worldPoint.project(camera);
          screenX = (worldPoint.x * 0.5 + 0.5) * window.innerWidth;
          screenY = (-worldPoint.y * 0.5 + 0.5) * window.innerHeight;
        }

        const offset = window.pinOffsets[p.id] || { x: 0, y: 0 };
        p.el.style.left = `${screenX + offset.x}px`;
        p.el.style.top = `${screenY + offset.y}px`;
        p.el.style.display = "block";
      });
    }

    function updateHeroBlueprintAnchors(currentPhase) {
      const showBlueprint = currentPhase === "hero";
      if (!showBlueprint) {
        window.dispatchEvent(
          new CustomEvent("three-blueprint-anchors", {
            detail: { visible: false, points: {} },
          })
        );
        return;
      }

      const anchorMap = sceneObjectsRef.current.hotspotAnchors;
      const mesh = sceneObjectsRef.current.carMesh;
      if (!anchorMap || !mesh) return;

      mesh.updateMatrixWorld(true);
      const points = {};

      BLUEPRINT_LABEL_IDS.forEach((id) => {
        const anchor = anchorMap[id];
        if (!anchor) return;
        const worldPoint = anchor.clone().applyMatrix4(mesh.matrixWorld);
        worldPoint.project(camera);
        points[id] = {
          x: (worldPoint.x * 0.5 + 0.5) * window.innerWidth,
          y: (-worldPoint.y * 0.5 + 0.5) * window.innerHeight,
        };
      });

      window.dispatchEvent(
        new CustomEvent("three-blueprint-anchors", {
          detail: { visible: true, points },
        })
      );
    }

    // Make pins draggable
    function setupPinDragging() {
      pins.forEach((p) => {
        let isDragging = false;
        let startX, startY, startOffsetX, startOffsetY;
        let dragStartLeft = 0;
        let dragStartTop = 0;

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
            dragStartLeft = parseFloat(p.el.style.left || "0");
            dragStartTop = parseFloat(p.el.style.top || "0");
            p.el.style.cursor = "grabbing";
          }
        });

        window.addEventListener("mousemove", (e) => {
          if (!isDragging) return;
          const dx = e.clientX - startX;
          const dy = e.clientY - startY;
          window.pinOffsets[p.id].x = startOffsetX + dx;
          window.pinOffsets[p.id].y = startOffsetY + dy;
          p.el.style.left = `${dragStartLeft + dx}px`;
          p.el.style.top = `${dragStartTop + dy}px`;
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

      if (sceneObjectsRef.current.carMesh?.material) {
        const meshMaterial = sceneObjectsRef.current.carMesh.material;
        meshMaterial.vertexColors = isLight;
        meshMaterial.color.setHex(isLight ? 0xffffff : 0xf6f8ff);
        meshMaterial.emissive.setHex(isLight ? 0x000000 : 0x101218);
        meshMaterial.emissiveIntensity = isLight ? 0 : 0.06;
        meshMaterial.needsUpdate = true;
      }

      const assemblyThemeColor = isLight ? null : 0xf6f8ff;
      (sceneObjectsRef.current.assemblyMeshes || []).forEach((assemblyMesh) => {
        const material = assemblyMesh.material;
        if (!material) return;
        const baseColorHex = material.userData?.baseColorHex || getPartColor(assemblyMesh.userData.partId);
        material.color.setHex(assemblyThemeColor || baseColorHex);
      });

      const currentPhase = phaseRef.current;

      // ===== VIEW MODE (Engineering only) =====
      const mode = currentPhase === "engineering"
        ? (viewModeRef.current || "render")
        : "render";
      if (sceneObjectsRef.current.carMesh) {
        const mesh = sceneObjectsRef.current.carMesh;
        const wire = sceneObjectsRef.current.wireframe;
        const points = sceneObjectsRef.current.vertexPoints;

        if (mode === "render") {
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
      const sceneOffsetX = currentPhase === "engineering"
        ? 1.6
        : (currentPhase === "integration" ? -1.8 : SCENE_X_OFFSET);
      const orbitState = dragOrbitRef.current;
      orbitState.yaw += (orbitState.targetYaw - orbitState.yaw) * 0.14;
      orbitState.pitch += (orbitState.targetPitch - orbitState.pitch) * 0.14;
      if (!ROTATION_ENABLED_PHASES.has(currentPhase) && !orbitState.active) {
        orbitState.targetYaw *= 0.92;
        orbitState.targetPitch *= 0.92;
      }
      canvas.style.cursor = ROTATION_ENABLED_PHASES.has(currentPhase)
        ? (orbitState.active ? "grabbing" : "grab")
        : "default";

      // Debug: log phase changes
      if (!window._lastPhase || window._lastPhase !== currentPhase) {
        console.log("Phase changed to:", currentPhase);
        window._lastPhase = currentPhase;
        // Reset aero debug flag on phase change
        window._aeroDebugLogged = false;
      }

      // Get phase-specific config (fallback to engineering if unknown phase).
      // Hero config is adapted to viewport width to keep the car in frame.
      const basePhaseConfig = PHASE_CONFIGS[currentPhase] || PHASE_CONFIGS.engineering;
      const phaseConfig = getPhaseConfigForViewport(currentPhase, basePhaseConfig);
      if (currentPhase === "hero") {
        const heroTune = heroPlacementRef.current || HERO_PLACEMENT_DEFAULT;
        phaseConfig.carPos.x = heroTune.carPosX;
        phaseConfig.carPos.y = heroTune.carPosY;
        phaseConfig.carPos.z = heroTune.carPosZ;
        phaseConfig.carScale = heroTune.carScale;
        phaseConfig.carRotation = heroTune.carRotation;
      }

      // Apply phase config to car mesh
      if (sceneObjectsRef.current.carMesh) {
        const finalOffset = {
          x: phaseConfig.carOffset.x,
          y: phaseConfig.carOffset.y,
          z: phaseConfig.carOffset.z,
        };
        sceneObjectsRef.current.carMesh.position.set(finalOffset.x, finalOffset.y, finalOffset.z);

        const baseScale = sceneObjectsRef.current.carMesh.userData.baseScale || 1;
        const finalScale = baseScale * phaseConfig.carScale;
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

      const assemblyState = sceneObjectsRef.current.assemblyState;
      const assemblyGroup = sceneObjectsRef.current.assemblyGroup;
      const assemblyMeshes = sceneObjectsRef.current.assemblyMeshes || [];

      if (assemblyState && assemblyMeshes.length && sceneObjectsRef.current.carMesh) {
        const targetMesh = sceneObjectsRef.current.carMesh;
        const integrationPhase = currentPhase === "integration";
        assemblyState.active = integrationPhase;
        if (!(assemblyState.placedParts instanceof Set)) {
          assemblyState.placedParts = new Set();
        }

        assemblyMeshes.forEach((mesh) => {
          mesh.userData.finalPosition.copy(targetMesh.position);
          mesh.userData.finalRotation.copy(targetMesh.rotation);
          mesh.userData.finalScale.copy(targetMesh.scale);
        });

        const applyAssemblyTransform = (mesh, t) => {
          const eased = clamp01(t);
          const posT = easeOutBack(eased);
          const rotT = easeOutCubic(eased);
          const scaleT = easeOutBack(eased);
          mesh.position.lerpVectors(mesh.userData.startPosition, mesh.userData.finalPosition, posT);
          mesh.scale.lerpVectors(mesh.userData.startScale, mesh.userData.finalScale, scaleT);
          mesh.rotation.x = THREE.MathUtils.lerp(mesh.userData.startRotation.x, mesh.userData.finalRotation.x, rotT);
          mesh.rotation.y = THREE.MathUtils.lerp(mesh.userData.startRotation.y, mesh.userData.finalRotation.y, rotT);
          mesh.rotation.z = THREE.MathUtils.lerp(mesh.userData.startRotation.z, mesh.userData.finalRotation.z, rotT);
          if (mesh.material && mesh.material.transparent) {
            mesh.material.opacity = ASSEMBLY_MIN_OPACITY + (1 - ASSEMBLY_MIN_OPACITY) * eased;
          }
        };

        const applyStagedFloat = (mesh, index, now) => {
          const floatT = now * 1.25 + index * 0.67;
          const sx = mesh.userData.startPosition.x;
          const sy = mesh.userData.startPosition.y;
          const sz = mesh.userData.startPosition.z;

          mesh.position.set(
            sx + Math.sin(floatT) * 0.35,
            sy + Math.cos(floatT * 1.2) * 0.24,
            sz + Math.sin(floatT * 0.78) * 0.32
          );

          const pulse = 1.02 + Math.sin(floatT * 1.5) * 0.03;
          mesh.scale.copy(mesh.userData.startScale).multiplyScalar(pulse);

          mesh.rotation.x = mesh.userData.startRotation.x + Math.sin(floatT * 1.1) * 0.12;
          mesh.rotation.y = mesh.userData.startRotation.y + Math.cos(floatT * 0.95) * 0.16;
          mesh.rotation.z = mesh.userData.startRotation.z + Math.sin(floatT * 1.35) * 0.1;
        };

        if (integrationPhase) {
          if (assemblyGroup) assemblyGroup.visible = true;

          if (assemblyState.mode === "auto") {
            const running = !!assemblyState.autoRunning;
            const completed = !!assemblyState.autoCompleted;
            const startTime = assemblyState.autoStartTime || time;
            const elapsed = running ? Math.max(0, time - startTime) : 0;
            const totalDuration = assemblyMeshes.length * AUTO_ASSEMBLY_STEP_SECONDS;

            assemblyMeshes.forEach((mesh, index) => {
              const partStart = index * AUTO_ASSEMBLY_STEP_SECONDS;
              if (running) {
                if (elapsed < partStart) {
                  applyStagedFloat(mesh, index, time);
                } else {
                  const local = clamp01((elapsed - partStart) / 0.92);
                  applyAssemblyTransform(mesh, local);
                }
              } else if (completed) {
                applyAssemblyTransform(mesh, 1);
              } else {
                applyStagedFloat(mesh, index, time);
              }

              if (mesh.material) {
                const staged = !completed && (!running || elapsed < partStart);
                mesh.material.emissive.setHex(staged ? 0x0f4f8e : 0x000000);
                mesh.material.emissiveIntensity = staged
                  ? 0.12 + (Math.sin(time * 4 + index) * 0.08 + 0.08)
                  : 0;
                if (mesh.material.transparent && staged) {
                  mesh.material.opacity = 0.86;
                }
              }
            });

            if (running && elapsed >= totalDuration + 0.2 && !assemblyState.autoCompleted) {
              assemblyState.autoRunning = false;
              assemblyState.autoCompleted = true;
              assemblyState.placedParts = new Set(
                assemblyMeshes.map((mesh) => mesh.userData.partId).filter(Boolean)
              );
              window.dispatchEvent(new CustomEvent("integration-auto-complete"));
            }
          } else {
            // BUILD mode - smooth click-to-place animation
            assemblyMeshes.forEach((mesh, index) => {
              const partId = mesh.userData.partId;
              const placed = partId ? assemblyState.placedParts.has(partId) : false;
              const targetT = placed ? 1 : 0;

              // Initialize placement progress
              if (mesh.userData.placementT === undefined) mesh.userData.placementT = 0;

              // Smooth lerp toward target
              mesh.userData.placementT += (targetT - mesh.userData.placementT) * 0.065;
              if (Math.abs(mesh.userData.placementT - targetT) < 0.003) {
                mesh.userData.placementT = targetT;
              }

              const t = mesh.userData.placementT;

              if (t < 0.01) {
                // Not placed - floating animation
                applyStagedFloat(mesh, index, time);
              } else if (t > 0.99) {
                // Fully placed
                applyAssemblyTransform(mesh, 1);
              } else {
                // Animating placement - blend from float to final
                applyAssemblyTransform(mesh, t);
              }

              if (mesh.material) {
                const notPlaced = !placed;
                const animating = t > 0.01 && t < 0.99;
                mesh.material.emissive.setHex(
                  animating ? 0x4db5ff : (notPlaced ? 0x0f4f8e : 0x000000)
                );
                mesh.material.emissiveIntensity = animating
                  ? 0.35
                  : (notPlaced ? 0.12 + (Math.sin(time * 4 + index) * 0.08 + 0.08) : 0);
                if (mesh.material.transparent) {
                  mesh.material.opacity = notPlaced ? 0.75 : (animating ? 0.85 + t * 0.15 : 1);
                }
              }
            });
          }
        } else {
          if (assemblyGroup) assemblyGroup.visible = false;
          assemblyMeshes.forEach((mesh) => {
            applyAssemblyTransform(mesh, 1);
            if (mesh.material) {
              mesh.material.emissive.setHex(0x000000);
              mesh.material.emissiveIntensity = 0;
            }
          });
        }
      }

      // Position car container based on phase config + global offset
      carContainer.position.set(
        phaseConfig.carPos.x + sceneOffsetX,
        phaseConfig.carPos.y,
        phaseConfig.carPos.z
      );

      if (currentPhase === "engineering" && sceneObjectsRef.current.carMesh) {
        podiumBounds.setFromObject(sceneObjectsRef.current.carMesh);
        podiumBounds.getCenter(podiumTargetCenter);
        podiumGroup.position.x = podiumTargetCenter.x;
        podiumGroup.position.z = podiumTargetCenter.z;
      } else {
        podiumGroup.position.x = -3 + SCENE_X_OFFSET;
        podiumGroup.position.z = 0;
      }

      // Show/hide elements based on phase config
      podiumGroup.visible = phaseConfig.showPodium;
      windTunnelGroup.visible = currentPhase === "aero";

      // Camera position based on phase config
      // Skip lerp for aero phase - orbit camera is handled in aero section
      if (currentPhase !== "aero") {
        zoomRef.current.value += (zoomRef.current.target - zoomRef.current.value) * 0.14;
        const engineeringZoom = currentPhase === "engineering" ? zoomRef.current.value : 0;
        const targetCameraPos = new THREE.Vector3(
          phaseConfig.cameraPos.x,
          phaseConfig.cameraPos.y,
          phaseConfig.cameraPos.z + engineeringZoom
        );
        camera.position.lerp(targetCameraPos, 0.02);
      }

      // Hide car in sponsors and team phases, show in others
      const carVisible = currentPhase !== "sponsors" && currentPhase !== "team" && currentPhase !== "achievements";
      const assemblySequenceActive = currentPhase === "integration";
      if (sceneObjectsRef.current.carMesh) {
        sceneObjectsRef.current.carMesh.visible =
          sceneObjectsRef.current.carMesh.visible && carVisible && !assemblySequenceActive;
      }
      if (sceneObjectsRef.current.wireframe) {
        sceneObjectsRef.current.wireframe.visible =
          sceneObjectsRef.current.wireframe.visible && carVisible && !assemblySequenceActive;
      }
      if (sceneObjectsRef.current.vertexPoints) {
        sceneObjectsRef.current.vertexPoints.visible =
          sceneObjectsRef.current.vertexPoints.visible && carVisible && !assemblySequenceActive;
      }
      if (sceneObjectsRef.current.assemblyGroup) {
        sceneObjectsRef.current.assemblyGroup.visible = carVisible && assemblySequenceActive;
      }

      // Update Spotlight
      if (currentPhase === 'hero' || currentPhase === 'engineering') {
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
        carGroup.rotation.y = phaseConfig.carRotation + orbitState.yaw;
        carGroup.rotation.x = orbitState.pitch * 0.4;
      }
      else if (currentPhase === "engineering") {
        carGroup.rotation.y = phaseConfig.carRotation + orbitState.yaw;
        carGroup.rotation.x = orbitState.pitch * 0.42;
      }
      else if (currentPhase === "integration") {
        carGroup.rotation.y = phaseConfig.carRotation + orbitState.yaw;
        carGroup.rotation.x = orbitState.pitch * 0.36;
      }
      else if (currentPhase === "aero") {
        // Car stays at fixed rotation
        carGroup.rotation.y = phaseConfig.carRotation;
        carGroup.rotation.x = 0;

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

        const centerX = phaseConfig.carPos.x + sceneOffsetX;
        const centerZ = phaseConfig.carPos.z;
        // Side view camera - particles flow left-to-right across screen
        const targetCam = new THREE.Vector3(centerX - 2, 2.8, centerZ + 24);
        camera.position.lerp(targetCam, 0.08);
        camera.lookAt(centerX - 1, 0.3, centerZ);

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

            // Move particles from LEFT to RIGHT
            positions[i * 3] += particleSpeeds[i] * speedMult;

            // Turbulence based on preset
            const turbulence = isExtreme ? 0.14 : (isNull ? 0.02 : 0.06);
            positions[i * 3 + 1] = origY[i] + Math.sin(time * 4 + phases[i]) * turbulence;
            positions[i * 3 + 2] = origZ[i] + Math.cos(time * 3 + phases[i] * 0.7) * turbulence * 0.5;

            // Check if particle is near car (collision/heat zone)
            const inCarZone = x > bounds.minX && x < bounds.maxX &&
                             y > bounds.minY && y < bounds.maxY &&
                             z > bounds.minZ && z < bounds.maxZ;

            if (inCarZone) {
              // HEAT EFFECT - particles turn red/orange when hitting the car
              const heatFactor = Math.min(1, (x - bounds.minX) / (bounds.maxX - bounds.minX));

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
              const deflect = isExtreme ? 0.06 : 0.028;
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

            // Reset particle when it exits right
            if (positions[i * 3] > 24) {
              initP(i);
            }
          }
          particles.geometry.attributes.position.needsUpdate = true;
          particles.geometry.attributes.color.needsUpdate = true;
        }
      }
      else if (currentPhase === "sponsors" || currentPhase === "team" || currentPhase === "achievements") {
        // Hide car completely for sponsors and team sections
        if (sceneObjectsRef.current.carMesh) {
          sceneObjectsRef.current.carMesh.visible = false;
        }
        if (sceneObjectsRef.current.wireframe) {
          sceneObjectsRef.current.wireframe.visible = false;
        }
        if (sceneObjectsRef.current.vertexPoints) {
          sceneObjectsRef.current.vertexPoints.visible = false;
        }
        if (sceneObjectsRef.current.assemblyGroup) {
          sceneObjectsRef.current.assemblyGroup.visible = false;
        }
        podiumGroup.visible = false;
        windTunnelGroup.visible = false;
        if (particles) particles.visible = false;
      }

      // Camera looks at where the car is positioned (with global offset)
      // Skip for aero phase - orbit camera is handled above
      if (currentPhase !== "aero") {
        const lookBiasX = currentPhase === "hero"
          ? (heroPlacementRef.current?.lookBiasX ?? HERO_LOOK_BIAS_DEFAULT)
          : (currentPhase === "engineering" ? 0 : 0);
        const carLookAt = new THREE.Vector3(
          phaseConfig.carPos.x + sceneOffsetX + lookBiasX,
          phaseConfig.carPos.y + 1, // Slightly above car center
          phaseConfig.carPos.z
        );
        camera.lookAt(carLookAt);
      }

      updatePins();
      updateHeroBlueprintAnchors(currentPhase);
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
      window.removeEventListener("integration-mode-change", onIntegrationModeChange);
      window.removeEventListener("integration-reset", onIntegrationReset);
      window.removeEventListener("integration-select-part", onIntegrationSelectPart);
      window.removeEventListener("integration-place-part", onIntegrationPlacePart);
      window.removeEventListener("integration-start-auto", onIntegrationStartAuto);
      window.removeEventListener("hero-placement-set", onHeroPlacementSet);
      window.removeEventListener("hero-placement-lock", onHeroPlacementLock);
      window.removeEventListener("hero-placement-reset", onHeroPlacementReset);
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("wheel", onWheel);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      renderer.dispose();
    };
  }, [canvasRef, pinOverlayRef, setHud]);
}
