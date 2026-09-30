import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Compass, Sparkles, MapPin, Footprints, ShieldAlert, Navigation, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface Jeddah3DWorldProps {
  onOpenPreferences: () => void;
  onOpenMap: () => void;
  onOpenProfile: () => void;
  onOpenSurprise: () => void;
  onOpenActiveQuest?: () => void;
  hasActiveQuest?: boolean;
  activeQuestTitle?: string;
}

interface InteractiveBeacon {
  name: string;
  tagline: string;
  icon: string;
  position: THREE.Vector3;
  color: number;
  action: () => void;
  mesh?: THREE.Group;
  halo?: THREE.Mesh;
}

export const Jeddah3DWorld: React.FC<Jeddah3DWorldProps> = ({
  onOpenPreferences,
  onOpenMap,
  onOpenProfile,
  onOpenSurprise,
  onOpenActiveQuest,
  hasActiveQuest,
  activeQuestTitle,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [nearbyBeacon, setNearbyBeacon] = useState<InteractiveBeacon | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const [playerCoords, setPlayerCoords] = useState({ x: 0, z: 0 });

  // References for game loop
  const inputRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    run: false,
    interact: false,
    joystickX: 0,
    joystickY: 0,
  });

  const callbacksRef = useRef({
    onOpenPreferences,
    onOpenMap,
    onOpenProfile,
    onOpenSurprise,
    onOpenActiveQuest,
  });
  callbacksRef.current = {
    onOpenPreferences,
    onOpenMap,
    onOpenProfile,
    onOpenSurprise,
    onOpenActiveQuest,
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // --- Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0e1726); // Twilight sunset atmosphere
    scene.fog = new THREE.FogExp2(0x131f37, 0.012);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // --- Lighting (Warm Hijazi Golden Hour & Twilight) ---
    const ambientLight = new THREE.AmbientLight(0xd9b99b, 0.7);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffa254, 1.8);
    sunLight.position.set(45, 60, 40);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 180;
    sunLight.shadow.camera.left = -60;
    sunLight.shadow.camera.right = 60;
    sunLight.shadow.camera.top = 60;
    sunLight.shadow.camera.bottom = -60;
    scene.add(sunLight);

    const seaFillLight = new THREE.DirectionalLight(0x38bdf8, 0.5);
    seaFillLight.position.set(-60, 20, -50);
    scene.add(seaFillLight);

    // --- Ground & Plaza (Jeddah Waterfront & Al Balad Pavement) ---
    const plazaRadius = 75;
    const groundGeo = new THREE.CylinderGeometry(plazaRadius, plazaRadius + 10, 2, 48);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xdfd3c3,
      roughness: 0.85,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -1;
    ground.receiveShadow = true;
    scene.add(ground);

    // Inner promenade ring with geometric tile pattern feel
    const innerRingGeo = new THREE.RingGeometry(18, 55, 36);
    const innerRingMat = new THREE.MeshStandardMaterial({
      color: 0xc4b29c,
      roughness: 0.9,
      side: THREE.DoubleSide,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = -Math.PI / 2;
    innerRing.position.y = 0.02;
    innerRing.receiveShadow = true;
    scene.add(innerRing);

    // Center compass star medallion
    const centerStarGeo = new THREE.CircleGeometry(10, 8);
    const centerStarMat = new THREE.MeshStandardMaterial({
      color: 0x24324d,
      roughness: 0.4,
      metalness: 0.2,
    });
    const centerStar = new THREE.Mesh(centerStarGeo, centerStarMat);
    centerStar.rotation.x = -Math.PI / 2;
    centerStar.position.y = 0.04;
    centerStar.receiveShadow = true;
    scene.add(centerStar);

    // --- The Red Sea (Water Body along one side) ---
    const seaGeo = new THREE.PlaneGeometry(280, 280, 40, 40);
    const seaMat = new THREE.MeshStandardMaterial({
      color: 0x085374,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.88,
    });
    const sea = new THREE.Mesh(seaGeo, seaMat);
    sea.rotation.x = -Math.PI / 2;
    sea.position.set(0, -1.8, -120);
    scene.add(sea);

    // Sea shoreline wall / Corniche granite railing
    const wallGeo = new THREE.BoxGeometry(160, 2.4, 3);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x5a6978, roughness: 0.6 });
    const seaWall = new THREE.Mesh(wallGeo, wallMat);
    seaWall.position.set(0, 0.2, -58);
    seaWall.castShadow = true;
    seaWall.receiveShadow = true;
    scene.add(seaWall);

    // --- RECOGNIZABLE JEDDAH LANDMARK: KING FAHD'S FOUNTAIN ---
    const fountainGroup = new THREE.Group();
    fountainGroup.position.set(20, -1.5, -135);

    // Base nozzle structure in the sea
    const nozzleGeo = new THREE.CylinderGeometry(4, 7, 6, 16);
    const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
    const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
    nozzle.position.y = 2;
    fountainGroup.add(nozzle);

    // Towering water jet plume
    const waterJetGeo = new THREE.ConeGeometry(3.5, 95, 16);
    const waterJetMat = new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      roughness: 0.1,
      transparent: true,
      opacity: 0.8,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.35,
    });
    const waterJet = new THREE.Mesh(waterJetGeo, waterJetMat);
    waterJet.position.y = 48;
    fountainGroup.add(waterJet);

    // Secondary spray plume
    const sprayGeo = new THREE.ConeGeometry(7, 60, 12);
    const sprayMat = new THREE.MeshStandardMaterial({
      color: 0xbae6fd,
      roughness: 0.3,
      transparent: true,
      opacity: 0.45,
    });
    const spray = new THREE.Mesh(sprayGeo, sprayMat);
    spray.position.y = 30;
    fountainGroup.add(spray);

    // Fountain spotlight
    const fountainLight = new THREE.PointLight(0x7dd3fc, 3.5, 80);
    fountainLight.position.set(0, 10, 0);
    fountainGroup.add(fountainLight);
    scene.add(fountainGroup);

    // --- RECOGNIZABLE LANDMARK: AL-BALAD TRADITIONAL TOWER WITH ROSHAN BALCONIES ---
    const baladTower = new THREE.Group();
    baladTower.position.set(-42, 0, 28);
    baladTower.rotation.y = Math.PI / 5;

    // Coral limestone main tower body
    const towerBodyGeo = new THREE.BoxGeometry(14, 28, 14);
    const coralStoneMat = new THREE.MeshStandardMaterial({
      color: 0xdbcaaf, // Warm coral limestone
      roughness: 0.9,
    });
    const towerBody = new THREE.Mesh(towerBodyGeo, coralStoneMat);
    towerBody.position.y = 14;
    towerBody.castShadow = true;
    towerBody.receiveShadow = true;
    baladTower.add(towerBody);

    // Crenellated rooftop parapet
    for (let c = -6; c <= 6; c += 3) {
      const crenel1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.8, 0.8), coralStoneMat);
      crenel1.position.set(c, 28.9, 6.6);
      baladTower.add(crenel1);
      const crenel2 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.8, 0.8), coralStoneMat);
      crenel2.position.set(c, 28.9, -6.6);
      baladTower.add(crenel2);
    }

    // Wooden Roshan Latticed Bay Windows (Classic Hijazi Roshan)
    const roshanMat = new THREE.MeshStandardMaterial({
      color: 0x4a2e18, // Rich teak wood
      roughness: 0.7,
    });

    const createRoshan = (x: number, y: number, z: number, rotY = 0) => {
      const roshanGroup = new THREE.Group();
      roshanGroup.position.set(x, y, z);
      roshanGroup.rotation.y = rotY;

      // Window box projecting outward
      const box = new THREE.Mesh(new THREE.BoxGeometry(4.2, 5.5, 1.8), roshanMat);
      box.castShadow = true;
      roshanGroup.add(box);

      // Carved canopy on top
      const canopy = new THREE.Mesh(new THREE.ConeGeometry(3.2, 1.5, 4), roshanMat);
      canopy.position.y = 3.4;
      canopy.rotation.y = Math.PI / 4;
      roshanGroup.add(canopy);

      // Support corbels underneath
      const corbel = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.2, 1.2), roshanMat);
      corbel.position.y = -3.2;
      roshanGroup.add(corbel);

      return roshanGroup;
    };

    baladTower.add(createRoshan(0, 18, 7.8));
    baladTower.add(createRoshan(0, 10, 7.8));
    baladTower.add(createRoshan(7.8, 14, 0, Math.PI / 2));
    scene.add(baladTower);

    // --- RECOGNIZABLE LANDMARK: AL-RAHMA FLOATING MOSQUE SILHOUETTE ---
    const mosqueGroup = new THREE.Group();
    mosqueGroup.position.set(-68, -1.2, -105);

    // Platform on stilts
    const platform = new THREE.Mesh(new THREE.BoxGeometry(26, 3, 26), new THREE.MeshStandardMaterial({ color: 0xe2e8f0 }));
    platform.position.y = 1.5;
    mosqueGroup.add(platform);

    // Stilts into water
    for (let sx of [-11, 11]) {
      for (let sz of [-11, 11]) {
        const stilt = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 8), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
        stilt.position.set(sx, -2, sz);
        mosqueGroup.add(stilt);
      }
    }

    // White main prayer hall
    const hall = new THREE.Mesh(new THREE.BoxGeometry(18, 10, 18), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 }));
    hall.position.y = 7.5;
    hall.castShadow = true;
    mosqueGroup.add(hall);

    // Main turquoise dome
    const dome = new THREE.Mesh(new THREE.SphereGeometry(6, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.2 }));
    dome.position.y = 12.5;
    mosqueGroup.add(dome);

    // Minaret
    const minaret = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.8, 26, 12), new THREE.MeshStandardMaterial({ color: 0xf1f5f9 }));
    minaret.position.set(9, 15, 9);
    mosqueGroup.add(minaret);
    const minaretCap = new THREE.Mesh(new THREE.ConeGeometry(1.6, 5, 12), new THREE.MeshStandardMaterial({ color: 0x0ea5e9 }));
    minaretCap.position.set(9, 29.5, 9);
    mosqueGroup.add(minaretCap);

    scene.add(mosqueGroup);

    // --- PALM TREES & CORNICHE LANTERNS ---
    const palmMatTrunk = new THREE.MeshStandardMaterial({ color: 0x6e4726, roughness: 0.9 });
    const palmMatLeaves = new THREE.MeshStandardMaterial({ color: 0x227b4e, roughness: 0.6 });

    const createPalmTree = (x: number, z: number, scale = 1) => {
      const tree = new THREE.Group();
      tree.position.set(x, 0, z);
      tree.scale.set(scale, scale, scale);

      // Curved trunk
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.7, 10, 8), palmMatTrunk);
      trunk.position.y = 5;
      trunk.rotation.z = (Math.random() - 0.5) * 0.15;
      trunk.castShadow = true;
      tree.add(trunk);

      // Palm fronds
      for (let i = 0; i < 7; i++) {
        const frond = new THREE.Mesh(new THREE.ConeGeometry(1.2, 5.5, 4), palmMatLeaves);
        frond.position.set(0, 9.8, 0);
        frond.rotation.y = (i * Math.PI * 2) / 7;
        frond.rotation.z = 1.1;
        frond.castShadow = true;
        tree.add(frond);
      }
      return tree;
    };

    const palmCoords = [
      [-25, -45], [-12, -48], [15, -46], [32, -44],
      [42, -18], [48, 10], [38, 35], [12, 48],
      [-18, 45], [-38, 38], [-48, 5], [-35, -20]
    ];
    palmCoords.forEach(([px, pz]) => scene.add(createPalmTree(px, pz, 0.9 + Math.random() * 0.3)));

    // Lanterns with warm golden glow
    const lanternMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });

    const createLanternPost = (x: number, z: number) => {
      const post = new THREE.Group();
      post.position.set(x, 0, z);

      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 5, 8), lanternMat);
      pole.position.y = 2.5;
      pole.castShadow = true;
      post.add(pole);

      const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.8), glowMat);
      lamp.position.y = 5.2;
      post.add(lamp);

      const light = new THREE.PointLight(0xf59e0b, 1.2, 18);
      light.position.y = 5.2;
      post.add(light);

      return post;
    };

    [[-20, -15], [20, -15], [22, 20], [-20, 20]].forEach(([lx, lz]) => {
      scene.add(createLanternPost(lx, lz));
    });

    // --- 3D HUMAN AVATAR (THE ADVENTURER) ---
    const avatar = new THREE.Group();
    avatar.position.set(0, 0, 0);

    // Torso / Jacket (Terracotta/Navy Hijazi explorer)
    const jacketMat = new THREE.MeshStandardMaterial({ color: 0xc25e2e, roughness: 0.7 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xc68a62, roughness: 0.5 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const bootsMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.6 });
    const backpackMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });

    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.4, 0.7), jacketMat);
    torso.position.y = 2.0;
    torso.castShadow = true;
    avatar.add(torso);

    // Explorer backpack
    const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.0, 0.5), backpackMat);
    backpack.position.set(0, 2.0, -0.55);
    backpack.castShadow = true;
    avatar.add(backpack);

    // Head & Hair
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 16), skinMat);
    head.position.y = 3.0;
    head.castShadow = true;
    avatar.add(head);

    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x1f1f1f }));
    hair.position.y = 3.12;
    avatar.add(hair);

    // Left Arm
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.75, 2.4, 0);
    const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 1.2), jacketMat);
    leftArm.position.y = -0.6;
    leftArmGroup.add(leftArm);
    avatar.add(leftArmGroup);

    // Right Arm
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.75, 2.4, 0);
    const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 1.2), jacketMat);
    rightArm.position.y = -0.6;
    rightArmGroup.add(rightArm);
    avatar.add(rightArmGroup);

    // Left Leg
    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.35, 1.3, 0);
    const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.19, 1.3), pantsMat);
    leftLeg.position.y = -0.65;
    leftLegGroup.add(leftLeg);
    const leftBoot = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, 0.55), bootsMat);
    leftBoot.position.set(0, -1.25, 0.1);
    leftLegGroup.add(leftBoot);
    avatar.add(leftLegGroup);

    // Right Leg
    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.35, 1.3, 0);
    const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.19, 1.3), pantsMat);
    rightLeg.position.y = -0.65;
    rightLegGroup.add(rightLeg);
    const rightBoot = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, 0.55), bootsMat);
    rightBoot.position.set(0, -1.25, 0.1);
    rightLegGroup.add(rightBoot);
    avatar.add(rightLegGroup);

    // Dynamic ground shadow disk
    const shadowGeo = new THREE.CircleGeometry(1.0, 16);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3 });
    const shadowDisk = new THREE.Mesh(shadowGeo, shadowMat);
    shadowDisk.rotation.x = -Math.PI / 2;
    shadowDisk.position.y = 0.05;
    avatar.add(shadowDisk);

    scene.add(avatar);

    // --- INTERACTIVE QUEST PORTALS / BEACONS ---
    const beacons: InteractiveBeacon[] = [
      {
        name: 'Start Side Quest',
        tagline: 'Choose Mood, Time, Budget & Crew',
        icon: '🧭',
        position: new THREE.Vector3(0, 0, -18),
        color: 0xf59e0b, // Amber gold
        action: () => callbacksRef.current.onOpenPreferences(),
      },
      {
        name: 'Adventure Map',
        tagline: 'Explore Real Jeddah Locations',
        icon: '🗺️',
        position: new THREE.Vector3(-22, 0, -4),
        color: 0x06b6d4, // Cyan
        action: () => callbacksRef.current.onOpenMap(),
      },
      {
        name: 'My Journey',
        tagline: 'Verified Badges & Real XP',
        icon: '🎖️',
        position: new THREE.Vector3(22, 0, -4),
        color: 0x8b5cf6, // Violet
        action: () => callbacksRef.current.onOpenProfile(),
      },
      {
        name: 'Surprise Me',
        tagline: 'Instant Spontaneous Adventure',
        icon: '⚡',
        position: new THREE.Vector3(0, 0, 18),
        color: 0xec4899, // Pink
        action: () => callbacksRef.current.onOpenSurprise(),
      },
    ];

    // If active quest exists, add an Active Quest beacon in front of player
    if (hasActiveQuest) {
      beacons.push({
        name: 'Active Quest: ' + (activeQuestTitle || 'In Progress'),
        tagline: 'Real-World Steps & Photo Verification',
        icon: '📍',
        position: new THREE.Vector3(12, 0, 12),
        color: 0x10b981, // Emerald
        action: () => callbacksRef.current.onOpenActiveQuest?.(),
      });
    }

    beacons.forEach((beacon) => {
      const bGroup = new THREE.Group();
      bGroup.position.copy(beacon.position);

      // Glowing crystal / geometric monument
      const crystalGeo = new THREE.OctahedronGeometry(1.6, 0);
      const crystalMat = new THREE.MeshStandardMaterial({
        color: beacon.color,
        emissive: beacon.color,
        emissiveIntensity: 0.6,
        roughness: 0.2,
        metalness: 0.6,
      });
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystal.position.y = 3.2;
      bGroup.add(crystal);

      // Pedestal base
      const pedGeo = new THREE.CylinderGeometry(2.4, 2.8, 1.2, 8);
      const pedMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
      const ped = new THREE.Mesh(pedGeo, pedMat);
      ped.position.y = 0.6;
      ped.receiveShadow = true;
      bGroup.add(ped);

      // Glowing pulse ring on ground
      const ringGeo = new THREE.RingGeometry(2.8, 3.4, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: beacon.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      const halo = new THREE.Mesh(ringGeo, ringMat);
      halo.rotation.x = -Math.PI / 2;
      halo.position.y = 0.06;
      bGroup.add(halo);

      // Light beam
      const beamGeo = new THREE.CylinderGeometry(0.15, 0.4, 20, 8);
      const beamMat = new THREE.MeshBasicMaterial({
        color: beacon.color,
        transparent: true,
        opacity: 0.25,
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.y = 10;
      bGroup.add(beam);

      // Light source
      const pLight = new THREE.PointLight(beacon.color, 1.8, 16);
      pLight.position.y = 3.5;
      bGroup.add(pLight);

      scene.add(bGroup);
      beacon.mesh = bGroup;
      beacon.halo = halo;
    });

    // --- Floating Ambient Red Sea Wind Particles ---
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 120;
      particlePositions[i + 1] = Math.random() * 20 + 0.5;
      particlePositions[i + 2] = (Math.random() - 0.5) * 120;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xfed7aa,
      size: 0.35,
      transparent: true,
      opacity: 0.4,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // --- Controls and Movement Variables ---
    let playerPos = new THREE.Vector3(0, 0, 0);
    let playerRotation = 0;
    let animTime = 0;
    let isMoving = false;

    // Camera target and offset
    const cameraOffset = new THREE.Vector3(0, 7.5, 12);
    let currentCameraPos = new THREE.Vector3(0, 8, 14);

    // Desktop Key Listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') inputRef.current.forward = true;
      if (code === 'KeyS' || code === 'ArrowDown') inputRef.current.backward = true;
      if (code === 'KeyA' || code === 'ArrowLeft') inputRef.current.left = true;
      if (code === 'KeyD' || code === 'ArrowRight') inputRef.current.right = true;
      if (code === 'ShiftLeft' || code === 'ShiftRight') inputRef.current.run = true;
      if (code === 'KeyE' || code === 'Space') {
        inputRef.current.interact = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') inputRef.current.forward = false;
      if (code === 'KeyS' || code === 'ArrowDown') inputRef.current.backward = false;
      if (code === 'KeyA' || code === 'ArrowLeft') inputRef.current.left = false;
      if (code === 'KeyD' || code === 'ArrowRight') inputRef.current.right = false;
      if (code === 'ShiftLeft' || code === 'ShiftRight') inputRef.current.run = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Handle Window Resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // --- Main Game Animation Loop ---
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsedTime = clock.getElapsedTime();

      // Calculate movement vector from keyboard & joystick
      let moveX = 0;
      let moveZ = 0;

      if (inputRef.current.forward) moveZ -= 1;
      if (inputRef.current.backward) moveZ += 1;
      if (inputRef.current.left) moveX -= 1;
      if (inputRef.current.right) moveX += 1;

      // Add touch joystick input
      if (Math.abs(inputRef.current.joystickX) > 0.1 || Math.abs(inputRef.current.joystickY) > 0.1) {
        moveX = inputRef.current.joystickX;
        moveZ = inputRef.current.joystickY;
      }

      const inputLen = Math.hypot(moveX, moveZ);
      const speed = (inputRef.current.run ? 14 : 8.5) * delta;

      if (inputLen > 0.05) {
        isMoving = true;
        moveX = (moveX / inputLen);
        moveZ = (moveZ / inputLen);

        playerPos.x += moveX * speed;
        playerPos.z += moveZ * speed;

        // Keep inside bounds of the large 3D hub
        const distFromCenter = Math.hypot(playerPos.x, playerPos.z);
        if (distFromCenter > plazaRadius - 2) {
          const angle = Math.atan2(playerPos.z, playerPos.x);
          playerPos.x = Math.cos(angle) * (plazaRadius - 2);
          playerPos.z = Math.sin(angle) * (plazaRadius - 2);
        }

        // Target rotation facing movement
        const targetRot = Math.atan2(moveX, moveZ);
        // Smooth rotation interpolation
        let diff = targetRot - playerRotation;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        playerRotation += diff * 12 * delta;

        animTime += delta * (inputRef.current.run ? 16 : 10);
      } else {
        isMoving = false;
        animTime += delta * 2; // slow breathing
      }

      // Update avatar transform
      avatar.position.x = playerPos.x;
      avatar.position.z = playerPos.z;
      avatar.rotation.y = playerRotation;

      // Update state for HUD coordinate indicator
      setPlayerCoords({ x: Math.round(playerPos.x), z: Math.round(playerPos.z) });

      // Procedural Human Animation (Legs & Arms swinging in antiphase)
      if (isMoving) {
        const swing = Math.sin(animTime) * 0.6;
        leftLegGroup.rotation.x = swing;
        rightLegGroup.rotation.x = -swing;
        leftArmGroup.rotation.x = -swing * 0.8;
        rightArmGroup.rotation.x = swing * 0.8;
        // Subtle vertical body bounce
        torso.position.y = 2.0 + Math.abs(Math.sin(animTime * 2)) * 0.12;
        head.position.y = 3.0 + Math.abs(Math.sin(animTime * 2)) * 0.12;
      } else {
        // Idle breathing
        const breath = Math.sin(animTime) * 0.04;
        leftLegGroup.rotation.x = 0;
        rightLegGroup.rotation.x = 0;
        leftArmGroup.rotation.x = 0;
        rightArmGroup.rotation.x = 0;
        torso.position.y = 2.0 + breath;
        head.position.y = 3.0 + breath;
      }

      // Smooth Third-Person Camera Follow
      const desiredCamPos = new THREE.Vector3(
        playerPos.x + cameraOffset.x,
        playerPos.y + cameraOffset.y,
        playerPos.z + cameraOffset.z
      );
      currentCameraPos.lerp(desiredCamPos, 0.08);
      camera.position.copy(currentCameraPos);
      camera.lookAt(playerPos.x, playerPos.y + 2.2, playerPos.z);

      // Animate Beacon Crystals & Rings
      let closestBeacon: InteractiveBeacon | null = null;
      let minDistance = 5.2;

      beacons.forEach((beacon, i) => {
        if (beacon.mesh) {
          // Floating bob and spin
          const crystalMesh = beacon.mesh.children[0];
          if (crystalMesh) {
            crystalMesh.position.y = 3.2 + Math.sin(elapsedTime * 2 + i) * 0.35;
            crystalMesh.rotation.y += delta * 0.8;
            crystalMesh.rotation.x = Math.sin(elapsedTime + i) * 0.2;
          }
        }
        if (beacon.halo) {
          const s = 1.0 + Math.sin(elapsedTime * 3 + i) * 0.12;
          beacon.halo.scale.set(s, s, s);
        }

        const dist = playerPos.distanceTo(beacon.position);
        if (dist < minDistance) {
          closestBeacon = beacon;
        }
      });

      setNearbyBeacon(closestBeacon);

      // Handle interact key triggered
      if (inputRef.current.interact) {
        inputRef.current.interact = false;
        if (closestBeacon) {
          (closestBeacon as InteractiveBeacon).action();
        }
      }

      // Fountain dynamic water motion
      waterJet.scale.y = 0.95 + Math.sin(elapsedTime * 3) * 0.08;
      spray.scale.x = 0.95 + Math.cos(elapsedTime * 2.5) * 0.1;

      // Animate ambient wind particles
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      for (let p = 0; p < particleCount * 3; p += 3) {
        arr[p] += delta * 2; // drift along Red Sea breeze
        if (arr[p] > 60) arr[p] = -60;
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [hasActiveQuest, activeQuestTitle]);

  // Mobile virtual joystick handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setJoystickActive(true);
    updateJoystick(e.touches[0]);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!joystickActive) return;
    updateJoystick(e.touches[0]);
  };

  const handleTouchEnd = () => {
    setJoystickActive(false);
    setJoystickPos({ x: 0, y: 0 });
    inputRef.current.joystickX = 0;
    inputRef.current.joystickY = 0;
  };

  const updateJoystick = (touch: React.Touch) => {
    const rect = touch.target as HTMLElement;
    const parent = rect.parentElement?.getBoundingClientRect();
    if (!parent) return;

    const centerX = parent.left + parent.width / 2;
    const centerY = parent.top + parent.height / 2;
    const maxRadius = parent.width / 2;

    const dx = touch.clientX - centerX;
    const dy = touch.clientY - centerY;
    const distance = Math.hypot(dx, dy);

    const clampedDist = Math.min(distance, maxRadius);
    const angle = Math.atan2(dy, dx);

    const normX = (Math.cos(angle) * clampedDist) / maxRadius;
    const normY = (Math.sin(angle) * clampedDist) / maxRadius;

    setJoystickPos({ x: normX * 36, y: normY * 36 });
    inputRef.current.joystickX = normX;
    inputRef.current.joystickY = normY;
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Atmospheric Vignette & Top Sky Glow */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b0f19]/80 via-transparent to-[#0b0f19]/30" />

      {/* 3D Hub Overlay HUD Header */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-3 bg-slate-900/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/60 shadow-xl">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        <div>
          <div className="text-xs font-bold tracking-wider text-amber-300 uppercase">Jeddah Digital Adventure Hub</div>
          <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
            <Footprints className="w-3 h-3 text-slate-400" />
            <span>X: {playerCoords.x}m · Z: {playerCoords.z}m</span>
          </div>
        </div>
      </div>

      {/* Mini Compass / Orientation */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60">
        <Compass className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '24s' }} />
        <span className="text-xs font-semibold text-slate-200">Red Sea Coastal Vista</span>
      </div>

      {/* Desktop Controls Quick Hint */}
      <div className="hidden md:flex absolute bottom-5 left-5 z-10 items-center gap-4 bg-slate-900/75 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-1">
          <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-amber-300 font-bold">W</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-amber-300 font-bold">A</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-amber-300 font-bold">S</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-amber-300 font-bold">D</span>
          <span className="ml-1 text-slate-400">Move</span>
        </div>
        <div className="h-3 w-[1px] bg-slate-700" />
        <div className="flex items-center gap-1">
          <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-amber-300 font-bold">Shift</span>
          <span className="text-slate-400">Run</span>
        </div>
        <div className="h-3 w-[1px] bg-slate-700" />
        <div className="flex items-center gap-1">
          <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-amber-300 font-bold">E / Space</span>
          <span className="text-slate-400">Interact</span>
        </div>
      </div>

      {/* Interactive Beacon Proximity Prompt */}
      {nearbyBeacon && (
        <div className="absolute bottom-28 md:bottom-20 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <button
            onClick={nearbyBeacon.action}
            className="flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold px-6 py-3 rounded-2xl shadow-2xl shadow-amber-500/40 border-2 border-amber-300 active:scale-95 transition cursor-pointer"
          >
            <span className="text-xl">{nearbyBeacon.icon}</span>
            <div className="text-left">
              <div className="text-sm font-extrabold tracking-wide uppercase">{nearbyBeacon.name}</div>
              <div className="text-[11px] font-medium text-amber-950/80">{nearbyBeacon.tagline}</div>
            </div>
            <span className="ml-2 text-xs px-2 py-0.5 rounded-lg bg-amber-950 text-amber-200 font-mono font-black uppercase">
              {isMobile ? 'TAP' : 'PRESS E'}
            </span>
          </button>
        </div>
      )}

      {/* Mobile Virtual Joystick */}
      {isMobile && (
        <div className="absolute bottom-6 left-6 z-20 touch-none">
          <div
            className="relative w-28 h-28 rounded-full bg-slate-900/60 border border-slate-700/80 backdrop-blur-md flex items-center justify-center shadow-lg"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Direction Arrows */}
            <ArrowUp className="absolute top-1.5 w-3.5 h-3.5 text-slate-500" />
            <ArrowDown className="absolute bottom-1.5 w-3.5 h-3.5 text-slate-500" />
            <ArrowLeft className="absolute left-1.5 w-3.5 h-3.5 text-slate-500" />
            <ArrowRight className="absolute right-1.5 w-3.5 h-3.5 text-slate-500" />

            {/* Thumb Nub */}
            <div
              className="w-12 h-12 rounded-full bg-amber-500/90 border-2 border-amber-300 shadow-md transition-transform"
              style={{
                transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`,
              }}
            />
          </div>
        </div>
      )}

      {/* Mobile Quick Action Buttons */}
      {isMobile && (
        <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-3">
          <button
            onClick={() => {
              inputRef.current.run = !inputRef.current.run;
            }}
            className={`w-13 h-13 rounded-2xl flex items-center justify-center font-bold text-xs shadow-xl border active:scale-90 transition cursor-pointer ${
              inputRef.current.run
                ? 'bg-amber-500 text-slate-950 border-amber-300'
                : 'bg-slate-900/80 text-slate-300 border-slate-700'
            }`}
          >
            ⚡ RUN
          </button>
          {nearbyBeacon && (
            <button
              onClick={nearbyBeacon.action}
              className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-black text-sm shadow-2xl border-2 border-amber-200 active:scale-90 transition flex items-center justify-center cursor-pointer"
            >
              {nearbyBeacon.icon}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
