import * as THREE from 'three';
import { RacingCar } from '../data/cars';

/**
 * PRODUCTION-GRADE 3D AERODYNAMIC SUPERCAR GENERATOR
 * Three.js WebGL kutubxonasi yordamida haqiqiy silliq, aerodinamik sportkar
 * 3D geometriyasini, PBR metallik bo'yog'ini va interaktiv g'ildiraklarini yaratadi.
 */

export interface BuiltCarModel {
  group: THREE.Group;
  wheels: THREE.Group[];
  exhaustPipes: THREE.Mesh[];
  lights: THREE.Light[];
  disposables: { geometries: THREE.BufferGeometry[]; materials: THREE.Material[]; textures: THREE.Texture[] };
}

// Procedural Karbon tolasi teksturasi
function createCarbonFiberTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#0a0f1d';
  ctx.fillRect(0, 0, 64, 64);
  ctx.fillStyle = '#1e293b';
  for (let i = 0; i < 64; i += 8) {
    for (let j = 0; j < 64; j += 8) {
      if ((i + j) % 16 === 0) {
        ctx.fillRect(i, j, 8, 8);
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);
  return tex;
}

export function createRealistic3DCar(car: RacingCar): BuiltCarModel {
  const group = new THREE.Group();
  const wheels: THREE.Group[] = [];
  const exhaustPipes: THREE.Mesh[] = [];
  const sceneLights: THREE.Light[] = [];

  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const textures: THREE.Texture[] = [];

  const bodyColorHex = parseInt(car.bodyColor.replace('#', '0x'), 16);
  const secondaryHex = parseInt((car.secondaryColor || car.bodyColor).replace('#', '0x'), 16);
  const caliperHex = parseInt((car.caliperColor || '#eab308').replace('#', '0x'), 16);
  const glowHex = parseInt((car.glowColor || '#00e5ff').replace('#', '0x'), 16);

  // 1. PBR HAQIQIY AVTOMOBIL BO'YOG'I (Luxury Clearcoat Metallic Paint)
  const bodyPaint = new THREE.MeshPhysicalMaterial({
    color: bodyColorHex,
    metalness: 0.88,
    roughness: 0.16,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    reflectivity: 0.95,
  });
  materials.push(bodyPaint);

  const secondaryPaint = new THREE.MeshPhysicalMaterial({
    color: secondaryHex,
    metalness: 0.85,
    roughness: 0.18,
    clearcoat: 0.9,
    clearcoatRoughness: 0.05,
  });
  materials.push(secondaryPaint);

  // Karbon tolasi
  const carbonTex = createCarbonFiberTexture();
  textures.push(carbonTex);
  const carbonMaterial = new THREE.MeshStandardMaterial({
    color: 0x111827,
    map: carbonTex,
    roughness: 0.35,
    metalness: 0.6,
  });
  materials.push(carbonMaterial);

  // Qoraytirilgan oynalar (Tinted automotive glass)
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x050c18,
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.75,
    thickness: 0.4,
    transparent: true,
    opacity: 0.85,
    ior: 1.52,
  });
  materials.push(glassMaterial);

  // Xrom va sayqallangan metall (Chrome exhaust & rim accents)
  const chromeMaterial = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    metalness: 0.98,
    roughness: 0.08,
  });
  materials.push(chromeMaterial);

  // Shina kauchuki
  const tireMaterial = new THREE.MeshStandardMaterial({
    color: 0x111622,
    roughness: 0.85,
    metalness: 0.1,
  });
  materials.push(tireMaterial);

  // Alyuminiy disk qotishmasi
  const rimMaterial = new THREE.MeshStandardMaterial({
    color: 0xcfd8dc,
    metalness: 0.92,
    roughness: 0.2,
  });
  materials.push(rimMaterial);

  // Tormoz kaliperi
  const caliperMaterial = new THREE.MeshStandardMaterial({
    color: caliperHex,
    metalness: 0.5,
    roughness: 0.25,
  });
  materials.push(caliperMaterial);

  // =========================================================================
  // 2. ASOSIY AERODINAMIK SILUET (Curved Aerodynamic Supercar Hull)
  // =========================================================================
  // Sportkar yon profil egri chizig'i (Smooth Bezier Profile)
  const bodyShape = new THREE.Shape();
  // Old pastki splitter
  bodyShape.moveTo(2.1, 0.12);
  bodyShape.lineTo(2.0, 0.28);
  // Pastki burun va kapot
  bodyShape.quadraticCurveTo(1.7, 0.42, 1.3, 0.46);
  bodyShape.quadraticCurveTo(0.9, 0.52, 0.7, 0.56);
  // Old oyna (Raked Windshield)
  bodyShape.quadraticCurveTo(0.4, 0.86, 0.15, 0.94);
  // Tom (Aerodynamic Roofline)
  bodyShape.quadraticCurveTo(-0.35, 0.95, -0.65, 0.88);
  // Orqa oyna va motor qopqog'i (Fastback Slope)
  bodyShape.quadraticCurveTo(-1.15, 0.72, -1.6, 0.58);
  // Orqa faol qanot va bamper
  bodyShape.lineTo(-1.95, 0.54);
  bodyShape.lineTo(-2.05, 0.35);
  bodyShape.lineTo(-2.0, 0.14);
  // Orqa g'ildirak arkasi
  bodyShape.lineTo(-1.55, 0.14);
  bodyShape.absarc(-1.25, 0.14, 0.38, Math.PI, 0, true);
  bodyShape.lineTo(0.95, 0.14);
  // Old g'ildirak arkasi
  bodyShape.absarc(1.25, 0.14, 0.38, Math.PI, 0, true);
  bodyShape.lineTo(2.1, 0.12);

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    steps: 2,
    depth: 1.5,
    bevelEnabled: true,
    bevelThickness: 0.12,
    bevelSize: 0.12,
    bevelOffset: 0,
    bevelSegments: 5,
  };

  const bodyGeom = new THREE.ExtrudeGeometry(bodyShape, extrudeSettings);
  // Markazlashtirish (Z bo'yicha markazga surish)
  bodyGeom.translate(0, 0.2, -0.75);
  geometries.push(bodyGeom);

  const mainBodyMesh = new THREE.Mesh(bodyGeom, bodyPaint);
  mainBodyMesh.castShadow = true;
  mainBodyMesh.receiveShadow = true;
  group.add(mainBodyMesh);

  // =========================================================================
  // 3. KOKPIT VA OYNALAR (Glass Canopy & Windshield)
  // =========================================================================
  const cabinShape = new THREE.Shape();
  cabinShape.moveTo(0.65, 0.58);
  cabinShape.quadraticCurveTo(0.38, 0.85, 0.15, 0.92);
  cabinShape.quadraticCurveTo(-0.35, 0.93, -0.62, 0.86);
  cabinShape.quadraticCurveTo(-1.08, 0.72, -1.45, 0.6);
  cabinShape.lineTo(-1.4, 0.58);
  cabinShape.lineTo(0.65, 0.58);

  const cabinGeom = new THREE.ExtrudeGeometry(cabinShape, {
    steps: 1,
    depth: 1.34,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.06,
    bevelSegments: 4,
  });
  cabinGeom.translate(0, 0.21, -0.67);
  geometries.push(cabinGeom);

  const cabinMesh = new THREE.Mesh(cabinGeom, glassMaterial);
  cabinMesh.castShadow = true;
  group.add(cabinMesh);

  // Kokpit ichidagi sport ruli
  const steerGeom = new THREE.TorusGeometry(0.12, 0.02, 8, 18);
  const steerMesh = new THREE.Mesh(steerGeom, carbonMaterial);
  steerMesh.position.set(0.3, 0.76, 0.25);
  steerMesh.rotation.y = Math.PI / 2;
  steerMesh.rotation.x = -Math.PI / 6;
  geometries.push(steerGeom);
  group.add(steerMesh);

  // Sport o'rindiqlari (Recaro Bucket Seats)
  const seatGeom = new THREE.BoxGeometry(0.35, 0.45, 0.32);
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 });
  geometries.push(seatGeom);
  materials.push(seatMat);

  const leftSeat = new THREE.Mesh(seatGeom, seatMat);
  leftSeat.position.set(-0.15, 0.68, 0.25);
  group.add(leftSeat);

  const rightSeat = new THREE.Mesh(seatGeom, seatMat);
  rightSeat.position.set(-0.15, 0.68, -0.25);
  group.add(rightSeat);

  // =========================================================================
  // 4. OLD VA ORQA AERODINAMIK DETALLAR (Diffusers, Splitter, Spoilers)
  // =========================================================================
  // Old Karbon Splitter
  const splitterGeom = new THREE.BoxGeometry(0.35, 0.04, 1.72);
  geometries.push(splitterGeom);
  const frontSplitter = new THREE.Mesh(splitterGeom, carbonMaterial);
  frontSplitter.position.set(2.0, 0.33, 0);
  frontSplitter.castShadow = true;
  group.add(frontSplitter);

  // Orqa Katta GT Karbon Qanot (Swan-Neck Carbon Wing)
  const wingGeom = new THREE.BoxGeometry(0.38, 0.04, 1.78);
  geometries.push(wingGeom);
  const rearWing = new THREE.Mesh(wingGeom, carbonMaterial);
  rearWing.position.set(-1.85, 1.05, 0);
  rearWing.rotation.z = -0.06;
  rearWing.castShadow = true;
  group.add(rearWing);

  // Qanot ustunlari (Struts)
  const strutGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.35, 8);
  geometries.push(strutGeom);
  const leftStrut = new THREE.Mesh(strutGeom, carbonMaterial);
  leftStrut.position.set(-1.8, 0.9, 0.45);
  group.add(leftStrut);
  const rightStrut = new THREE.Mesh(strutGeom, carbonMaterial);
  rightStrut.position.set(-1.8, 0.9, -0.45);
  group.add(rightStrut);

  // Orqa Karbon Diffuzor
  const diffuserGeom = new THREE.BoxGeometry(0.45, 0.08, 1.55);
  geometries.push(diffuserGeom);
  const rearDiffuser = new THREE.Mesh(diffuserGeom, carbonMaterial);
  rearDiffuser.position.set(-1.92, 0.35, 0);
  group.add(rearDiffuser);

  // Xrom Egzoz quvurlari (Quad Exhaust Pipes)
  const exhaustGeom = new THREE.CylinderGeometry(0.065, 0.065, 0.15, 16);
  geometries.push(exhaustGeom);

  const exhaustOffsets = [0.38, 0.22, -0.22, -0.38];
  exhaustOffsets.forEach((z) => {
    const pipe = new THREE.Mesh(exhaustGeom, chromeMaterial);
    pipe.rotation.z = Math.PI / 2;
    pipe.position.set(-2.06, 0.42, z);
    exhaustPipes.push(pipe);
    group.add(pipe);
  });

  // =========================================================================
  // 5. YORUG'LIK DETALLARI (LED Matrix Headlights & Taillights)
  // =========================================================================
  // Old Fara Kristallari
  const headlightMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x90e0ef,
    emissiveIntensity: 1.2,
    roughness: 0.1,
  });
  materials.push(headlightMat);

  const headlightGeom = new THREE.BoxGeometry(0.22, 0.08, 0.28);
  geometries.push(headlightGeom);

  const leftHeadlight = new THREE.Mesh(headlightGeom, headlightMat);
  leftHeadlight.position.set(1.9, 0.56, 0.62);
  group.add(leftHeadlight);

  const rightHeadlight = new THREE.Mesh(headlightGeom, headlightMat);
  rightHeadlight.position.set(1.9, 0.56, -0.62);
  group.add(rightHeadlight);

  // Orqa Qizil LED Chiziq (Full-width Taillight Bar)
  const taillightMat = new THREE.MeshStandardMaterial({
    color: 0xff1744,
    emissive: 0xff1744,
    emissiveIntensity: 1.5,
    roughness: 0.2,
  });
  materials.push(taillightMat);

  const taillightGeom = new THREE.BoxGeometry(0.08, 0.06, 1.45);
  geometries.push(taillightGeom);
  const taillightBar = new THREE.Mesh(taillightGeom, taillightMat);
  taillightBar.position.set(-2.05, 0.68, 0);
  group.add(taillightBar);

  // Yon Ko'zgu (Side Aerodynamic Mirrors)
  const mirrorGeom = new THREE.BoxGeometry(0.12, 0.08, 0.2);
  geometries.push(mirrorGeom);
  const leftMirror = new THREE.Mesh(mirrorGeom, carbonMaterial);
  leftMirror.position.set(0.65, 0.8, 0.78);
  group.add(leftMirror);

  const rightMirror = new THREE.Mesh(mirrorGeom, carbonMaterial);
  rightMirror.position.set(0.65, 0.8, -0.78);
  group.add(rightMirror);

  // =========================================================================
  // 6. HAQIQIY 3D SPORT G'ILDIRAKLARI (Pirelli Rubber Tires & Alloy Rims)
  // =========================================================================
  const wheelPositions = [
    { x: 1.25, y: 0.34, z: 0.8 },    // Old o'ng
    { x: 1.25, y: 0.34, z: -0.8 },   // Old chap
    { x: -1.25, y: 0.34, z: 0.8 },   // Orqa o'ng
    { x: -1.25, y: 0.34, z: -0.8 },  // Orqa chap
  ];

  // Shina geometriyasi (Kauchuk silindr)
  const tireGeom = new THREE.CylinderGeometry(0.34, 0.34, 0.24, 32);
  geometries.push(tireGeom);

  // Qotishma disk asosi
  const rimBaseGeom = new THREE.CylinderGeometry(0.24, 0.24, 0.25, 24);
  geometries.push(rimBaseGeom);

  // Tormoz rotori (Po'lat disk)
  const rotorGeom = new THREE.CylinderGeometry(0.2, 0.2, 0.04, 24);
  geometries.push(rotorGeom);

  // Brembo tormoz kaliperi
  const caliperGeom = new THREE.BoxGeometry(0.08, 0.12, 0.08);
  geometries.push(caliperGeom);

  // Disk spitsalari
  const spokeGeom = new THREE.BoxGeometry(0.03, 0.22, 0.25);
  geometries.push(spokeGeom);

  wheelPositions.forEach((pos) => {
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(pos.x, pos.y, pos.z);

    // Shina (Z o'qi bo'yicha yotqizish)
    const tire = new THREE.Mesh(tireGeom, tireMaterial);
    tire.rotation.x = Math.PI / 2;
    tire.castShadow = true;
    wheelGroup.add(tire);

    // Disk
    const rim = new THREE.Mesh(rimBaseGeom, rimMaterial);
    rim.rotation.x = Math.PI / 2;
    wheelGroup.add(rim);

    // 5 ta ikkitalik sport spitsa
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      const spoke = new THREE.Mesh(spokeGeom, chromeMaterial);
      spoke.rotation.z = angle;
      wheelGroup.add(spoke);
    }

    // Tormoz rotori
    const rotor = new THREE.Mesh(rotorGeom, chromeMaterial);
    rotor.rotation.x = Math.PI / 2;
    wheelGroup.add(rotor);

    // Kaliper
    const caliper = new THREE.Mesh(caliperGeom, caliperMaterial);
    caliper.position.set(0, 0.14, 0.06 * (pos.z > 0 ? 1 : -1));
    wheelGroup.add(caliper);

    wheels.push(wheelGroup);
    group.add(wheelGroup);
  });

  // =========================================================================
  // 7. ZAMIN MAYDONI VA NEON UNDERGLOW SOYASI
  // =========================================================================
  // Asfalt ustidagi kontakt soya
  const shadowPlaneGeom = new THREE.PlaneGeometry(4.2, 2.0);
  geometries.push(shadowPlaneGeom);
  const shadowPlaneMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
  });
  materials.push(shadowPlaneMat);

  const shadowPlane = new THREE.Mesh(shadowPlaneGeom, shadowPlaneMat);
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0.02;
  group.add(shadowPlane);

  // Neon Underglow Yorug'ligi (Pastki sport nurlanish)
  const underglowLight = new THREE.PointLight(glowHex, 2.5, 4.5);
  underglowLight.position.set(0, 0.15, 0);
  sceneLights.push(underglowLight);
  group.add(underglowLight);

  return {
    group,
    wheels,
    exhaustPipes,
    lights: sceneLights,
    disposables: { geometries, materials, textures },
  };
}
