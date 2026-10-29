import * as THREE from 'three';
import { RacingCar } from '../data/cars';

/**
 * REAL-LIFE AUTOMOTIVE 3D BUILDER
 * Haqiqiy hayotdagi superkarlar va sport avtomobillari dizayniga 100% moslashgan
 * yuqori sifatli procedural 3D model generatori.
 */

// Procedural Karbon mato teksturasi (Carbon Fiber Weave Texture)
function createCarbonTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#0f172a';
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
  tex.repeat.set(4, 4);
  return tex;
}

// Teshikli tormoz diski teksturasi (Cross-drilled brake rotor)
function createBrakeRotorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 20, 64, 64, 64);
  grad.addColorStop(0, '#94a3b8');
  grad.addColorStop(0.7, '#64748b');
  grad.addColorStop(1, '#334155');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  ctx.fillStyle = '#0f172a';
  for (let r = 28; r < 56; r += 7) {
    const count = Math.floor(r / 3);
    for (let a = 0; a < Math.PI * 2; a += (Math.PI * 2) / count) {
      const x = 64 + Math.cos(a) * r;
      const y = 64 + Math.sin(a) * r;
      ctx.beginPath();
      ctx.arc(x, y, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

export function build3DCar(car: RacingCar): {
  carGroup: THREE.Group;
  wheels: THREE.Group[];
  materialsToDispose: THREE.Material[];
  geometriesToDispose: THREE.BufferGeometry[];
} {
  const carGroup = new THREE.Group();
  const wheels: THREE.Group[] = [];
  const materialsToDispose: THREE.Material[] = [];
  const geometriesToDispose: THREE.BufferGeometry[] = [];

  const bodyColorHex = parseInt(car.bodyColor.replace('#', '0x'), 16);
  const secondaryColorHex = parseInt((car.secondaryColor || car.bodyColor).replace('#', '0x'), 16);
  const caliperColorHex = parseInt((car.caliperColor || '#ef4444').replace('#', '0x'), 16);
  const glowColorHex = parseInt((car.glowColor || '#00e5ff').replace('#', '0x'), 16);

  // 1. REALISTIK PBR BO'YOQ (Luxury Automotive Metallic Paint)
  const carPaintMat = new THREE.MeshPhysicalMaterial({
    color: bodyColorHex,
    metalness: 0.9,
    roughness: 0.15,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    reflectivity: 0.95,
  });
  materialsToDispose.push(carPaintMat);

  const secondaryPaintMat = new THREE.MeshPhysicalMaterial({
    color: secondaryColorHex,
    metalness: 0.88,
    roughness: 0.18,
    clearcoat: 0.9,
    clearcoatRoughness: 0.06,
  });
  materialsToDispose.push(secondaryPaintMat);

  // Karbon Tolasi (Real Carbon Fiber with pattern)
  const carbonTex = createCarbonTexture();
  const carbonMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    map: carbonTex,
    roughness: 0.35,
    metalness: 0.6,
  });
  materialsToDispose.push(carbonMat);

  // Chuqur Qora Matoviy Plastik (Aero trim)
  const blackTrimMat = new THREE.MeshStandardMaterial({
    color: 0x090d16,
    roughness: 0.7,
    metalness: 0.2,
  });
  materialsToDispose.push(blackTrimMat);

  // Qoraytirilgan Optik Oyna (Smoked Glass)
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x031024,
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.72,
    thickness: 0.5,
    transparent: true,
    opacity: 0.88,
    ior: 1.52,
  });
  materialsToDispose.push(glassMat);

  // Xrom va Alyuminiy (Mirror Chrome for Exhaust & Rims)
  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    metalness: 0.98,
    roughness: 0.08,
  });
  materialsToDispose.push(chromeMat);

  // Tormoz Rotori
  const rotorTex = createBrakeRotorTexture();
  const brakeRotorMat = new THREE.MeshStandardMaterial({
    map: rotorTex,
    metalness: 0.9,
    roughness: 0.25,
  });
  materialsToDispose.push(brakeRotorMat);

  // Sport Tormoz Kaliperi (Brembo Racing)
  const caliperMat = new THREE.MeshStandardMaterial({
    color: caliperColorHex,
    metalness: 0.5,
    roughness: 0.2,
  });
  materialsToDispose.push(caliperMat);

  // Sport Kauchuk Shina (Pirelli P-Zero)
  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x090d16,
    roughness: 0.92,
    metalness: 0.04,
  });
  materialsToDispose.push(tireMat);

  // LED Faralar (Matrix Projector LED)
  const headlightMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x7dd3fc,
    emissiveIntensity: 2.8,
    roughness: 0.1,
  });
  materialsToDispose.push(headlightMat);

  // Orqa Qizil LED Chiroqlar (Laser OLED Tailbar)
  const taillightMat = new THREE.MeshStandardMaterial({
    color: 0xff002b,
    emissive: 0xff002b,
    emissiveIntensity: 3.0,
    roughness: 0.15,
  });
  materialsToDispose.push(taillightMat);

  // =========================================================
  // MODELGA XOS HAQIQIY KUZOV DIZAYNI (REAL-WORLD SILHOUETTES)
  // =========================================================
  const sType = car.silhouetteType || 'amg';

  // 1. Asosiy Pastki Shassi (Sculpted Lower Floor & Rockers)
  const chassisGeo = new THREE.BoxGeometry(4.3, 0.38, 1.95);
  geometriesToDispose.push(chassisGeo);
  const chassis = new THREE.Mesh(chassisGeo, carPaintMat);
  chassis.position.y = 0.42;
  chassis.castShadow = true;
  chassis.receiveShadow = true;
  carGroup.add(chassis);

  // Yon Karbon Qoplama (Side Skirts)
  const sideSkirtGeo = new THREE.BoxGeometry(2.6, 0.08, 2.05);
  geometriesToDispose.push(sideSkirtGeo);
  const sideSkirt = new THREE.Mesh(sideSkirtGeo, carbonMat);
  sideSkirt.position.set(0, 0.25, 0);
  carGroup.add(sideSkirt);

  // 2. Old Qanotlar va Kapot (Sculpted Hood & Fenders)
  const hoodLength = sType === 'amg' || sType === 'mustang' ? 1.6 : 1.35;
  const hoodGeo = new THREE.BoxGeometry(hoodLength, 0.28, 1.86);
  geometriesToDispose.push(hoodGeo);
  const hood = new THREE.Mesh(hoodGeo, carPaintMat);
  hood.position.set(1.42, 0.52, 0);
  hood.rotation.z = -0.07;
  carGroup.add(hood);

  // Kapotdagi agressiv havo o'tkazgichlar (Hood Air Vents)
  const ventGeo = new THREE.BoxGeometry(0.5, 0.04, 0.45);
  geometriesToDispose.push(ventGeo);
  const leftVent = new THREE.Mesh(ventGeo, carbonMat);
  leftVent.position.set(1.3, 0.65, 0.45);
  leftVent.rotation.z = -0.07;
  const rightVent = leftVent.clone();
  rightVent.position.set(1.3, 0.65, -0.45);
  carGroup.add(leftVent);
  carGroup.add(rightVent);

  // Old Sport Splitter va Bamper (Front Bumper Aerodynamics)
  const frontBumperGeo = new THREE.BoxGeometry(0.65, 0.32, 1.92);
  geometriesToDispose.push(frontBumperGeo);
  const frontBumper = new THREE.Mesh(frontBumperGeo, carPaintMat);
  frontBumper.position.set(2.1, 0.38, 0);
  carGroup.add(frontBumper);

  // Pastki Karbon Splitter va Qanotlar (Canards)
  const splitterGeo = new THREE.BoxGeometry(0.45, 0.06, 2.06);
  geometriesToDispose.push(splitterGeo);
  const splitter = new THREE.Mesh(splitterGeo, carbonMat);
  splitter.position.set(2.26, 0.22, 0);
  carGroup.add(splitter);

  // 3. MODELGA XOS REAL RADYATOR PANJARASI (ICONIC FRONT GRILLE)
  if (sType === 'bugatti') {
    // Bugatti ramziy taqa (Horseshoe Grille)
    const horseshoeGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.25, 20, 1, false, 0, Math.PI);
    geometriesToDispose.push(horseshoeGeo);
    const horseshoe = new THREE.Mesh(horseshoeGeo, chromeMat);
    horseshoe.rotation.z = -Math.PI / 2;
    horseshoe.rotation.x = Math.PI / 2;
    horseshoe.position.set(2.38, 0.42, 0);
    carGroup.add(horseshoe);

    // Bugatti C-Line yon havo qabul qilgichi (Signature C-Line Sweep)
    const cLineTorusGeo = new THREE.TorusGeometry(0.6, 0.04, 12, 32, Math.PI * 1.3);
    geometriesToDispose.push(cLineTorusGeo);
    const cLineLeft = new THREE.Mesh(cLineTorusGeo, secondaryPaintMat);
    cLineLeft.position.set(-0.1, 0.75, 0.99);
    cLineLeft.rotation.y = Math.PI / 2;
    const cLineRight = cLineLeft.clone();
    cLineRight.position.set(-0.1, 0.75, -0.99);
    carGroup.add(cLineLeft);
    carGroup.add(cLineRight);
  } else if (sType === 'bmw') {
    // BMW M4 egizak radiator panjarasi (Twin M Kidney Grille)
    const kidneyGeo = new THREE.BoxGeometry(0.08, 0.26, 0.28);
    geometriesToDispose.push(kidneyGeo);
    const kidneyLeft = new THREE.Mesh(kidneyGeo, blackTrimMat);
    kidneyLeft.position.set(2.4, 0.42, 0.2);
    const kidneyRight = kidneyLeft.clone();
    kidneyRight.position.set(2.4, 0.42, -0.2);
    carGroup.add(kidneyLeft);
    carGroup.add(kidneyRight);
  } else if (sType === 'amg') {
    // Mercedes-AMG Panamericana Grille (Vertikal xrom qovurg'alar)
    const amgGrilleGeo = new THREE.BoxGeometry(0.1, 0.28, 0.85);
    geometriesToDispose.push(amgGrilleGeo);
    const amgGrille = new THREE.Mesh(amgGrilleGeo, blackTrimMat);
    amgGrille.position.set(2.4, 0.42, 0);
    carGroup.add(amgGrille);

    // Katta AMG yulduz nishoni
    const starGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.06, 16);
    geometriesToDispose.push(starGeo);
    const starMesh = new THREE.Mesh(starGeo, chromeMat);
    starMesh.rotation.z = Math.PI / 2;
    starMesh.position.set(2.45, 0.42, 0);
    carGroup.add(starMesh);
  } else if (sType === 'audi') {
    // Audi Singleframe Katta Oltiburchak Grille
    const audiGrilleGeo = new THREE.BoxGeometry(0.1, 0.32, 0.95);
    geometriesToDispose.push(audiGrilleGeo);
    const audiGrille = new THREE.Mesh(audiGrilleGeo, blackTrimMat);
    audiGrille.position.set(2.4, 0.4, 0);
    carGroup.add(audiGrille);

    // Audi R8 ramziy 'Side-Blade' karbon paneli (Eshik orqasidagi qora qoplama)
    const bladeGeo = new THREE.BoxGeometry(0.5, 0.7, 0.06);
    geometriesToDispose.push(bladeGeo);
    const bladeLeft = new THREE.Mesh(bladeGeo, carbonMat);
    bladeLeft.position.set(-0.55, 0.65, 0.98);
    const bladeRight = bladeLeft.clone();
    bladeRight.position.set(-0.55, 0.65, -0.98);
    carGroup.add(bladeLeft);
    carGroup.add(bladeRight);
  } else if (sType === 'mustang') {
    // Shelby GT500 Katta mushakdor havo olish tuynugi (Hood Scoop)
    const scoopGeo = new THREE.BoxGeometry(0.65, 0.1, 0.6);
    geometriesToDispose.push(scoopGeo);
    const scoop = new THREE.Mesh(scoopGeo, carbonMat);
    scoop.position.set(1.4, 0.72, 0);
    carGroup.add(scoop);
  }

  // 4. KOKPIT / SALON VA ICHKI QISM (AERODYNAMIC GREENHOUSE & INTERIOR)
  const cabinLength = sType === 'sedan' ? 2.3 : 1.75;
  const cabinHeight = sType === 'sedan' ? 0.72 : 0.62;
  const cabinGeo = new THREE.BoxGeometry(cabinLength, cabinHeight, 1.56);
  geometriesToDispose.push(cabinGeo);
  const cabin = new THREE.Mesh(cabinGeo, carPaintMat);
  cabin.position.set(-0.16, 0.88, 0);
  carGroup.add(cabin);

  // Karbon Tom (Lightweight Carbon Fiber Roof)
  const roofGeo = new THREE.BoxGeometry(cabinLength * 0.95, 0.04, 1.48);
  geometriesToDispose.push(roofGeo);
  const roof = new THREE.Mesh(roofGeo, carbonMat);
  roof.position.set(-0.16, 1.2, 0);
  carGroup.add(roof);

  // Old Shamol Oynasi (Windshield)
  const windshieldGeo = new THREE.PlaneGeometry(1.42, 0.78);
  geometriesToDispose.push(windshieldGeo);
  const windshield = new THREE.Mesh(windshieldGeo, glassMat);
  windshield.position.set(0.72, 0.91, 0);
  windshield.rotation.y = Math.PI / 2;
  windshield.rotation.x = -0.56;
  carGroup.add(windshield);

  // Yon Oynalar (Side Windows)
  const sideWinGeo = new THREE.PlaneGeometry(1.35, 0.46);
  geometriesToDispose.push(sideWinGeo);
  const leftWindow = new THREE.Mesh(sideWinGeo, glassMat);
  leftWindow.position.set(-0.16, 0.93, 0.79);
  carGroup.add(leftWindow);

  const rightWindow = leftWindow.clone();
  rightWindow.position.set(-0.16, 0.93, -0.79);
  rightWindow.rotation.y = Math.PI;
  carGroup.add(rightWindow);

  // Orqa Oyna (Rear Glass)
  const rearWindowGeo = new THREE.PlaneGeometry(1.38, 0.7);
  geometriesToDispose.push(rearWindowGeo);
  const rearWindow = new THREE.Mesh(rearWindowGeo, glassMat);
  rearWindow.position.set(-0.98, 0.9, 0);
  rearWindow.rotation.y = -Math.PI / 2;
  rearWindow.rotation.x = -0.48;
  carGroup.add(rearWindow);

  // Salon ichida ko'rinuvchi 3D Sport Rul (Racing Steering Wheel)
  const wheelGeo = new THREE.TorusGeometry(0.12, 0.02, 8, 16);
  geometriesToDispose.push(wheelGeo);
  const interiorWheel = new THREE.Mesh(wheelGeo, blackTrimMat);
  interiorWheel.rotation.y = Math.PI / 2;
  interiorWheel.position.set(0.25, 0.86, 0.35);
  carGroup.add(interiorWheel);

  // Salon ichida 2 ta Sport O'rindiq Bosh suyanchig'i (Recaro Bucket Seat Headrests)
  const headrestGeo = new THREE.BoxGeometry(0.18, 0.22, 0.28);
  geometriesToDispose.push(headrestGeo);
  const headrestLeft = new THREE.Mesh(headrestGeo, blackTrimMat);
  headrestLeft.position.set(-0.25, 0.96, 0.35);
  const headrestRight = headrestLeft.clone();
  headrestRight.position.set(-0.25, 0.96, -0.35);
  carGroup.add(headrestLeft);
  carGroup.add(headrestRight);

  // Aerodinamik Yon Ko'zgular (Aero Side Mirrors)
  const mirrorGeo = new THREE.BoxGeometry(0.2, 0.1, 0.16);
  geometriesToDispose.push(mirrorGeo);
  const mirrorLeft = new THREE.Mesh(mirrorGeo, carbonMat);
  mirrorLeft.position.set(0.65, 0.85, 0.96);
  const mirrorRight = mirrorLeft.clone();
  mirrorRight.position.set(0.65, 0.85, -0.96);
  carGroup.add(mirrorLeft);
  carGroup.add(mirrorRight);

  // 5. ORQA QISM: DIFFUZOR, EGZOZ VA SPORT QANOTI (REAR DIFFUSER & SPOILER)
  const diffuserGeo = new THREE.BoxGeometry(0.7, 0.26, 1.88);
  geometriesToDispose.push(diffuserGeo);
  const diffuser = new THREE.Mesh(diffuserGeo, carbonMat);
  diffuser.position.set(-2.08, 0.34, 0);
  carGroup.add(diffuser);

  // Diffuzordagi 4 ta vertikal poyga qanotchalari (Diffuser Aero Fins)
  for (let f = -0.6; f <= 0.6; f += 0.4) {
    const finGeo = new THREE.BoxGeometry(0.5, 0.14, 0.04);
    geometriesToDispose.push(finGeo);
    const fin = new THREE.Mesh(finGeo, carbonMat);
    fin.position.set(-2.25, 0.26, f);
    carGroup.add(fin);
  }

  // 4 ta Xrom / Titan Egzoz Quvurlari (Quad Chrome Exhaust Pipes)
  const exhaustGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.22, 16);
  geometriesToDispose.push(exhaustGeo);
  const ex1 = new THREE.Mesh(exhaustGeo, chromeMat);
  ex1.rotation.z = Math.PI / 2;
  ex1.position.set(-2.22, 0.32, 0.45);
  const ex2 = ex1.clone();
  ex2.position.set(-2.22, 0.32, 0.3);
  const ex3 = ex1.clone();
  ex3.position.set(-2.22, 0.32, -0.3);
  const ex4 = ex1.clone();
  ex4.position.set(-2.22, 0.32, -0.45);
  carGroup.add(ex1);
  carGroup.add(ex2);
  carGroup.add(ex3);
  carGroup.add(ex4);

  // Superkar Orqa Qanoti (GT Carbon Wing)
  if (sType !== 'sedan') {
    const wingWidth = sType === 'amg' || sType === 'lambo' ? 2.05 : 1.82;
    const wingGeo = new THREE.BoxGeometry(0.38, 0.05, wingWidth);
    geometriesToDispose.push(wingGeo);
    const wing = new THREE.Mesh(wingGeo, carbonMat);
    const wingHeight = sType === 'lambo' || sType === 'amg' ? 1.25 : 1.15;
    wing.position.set(-1.88, wingHeight, 0);
    wing.rotation.z = 0.05;
    carGroup.add(wing);

    // Qanot Yon Quloqchalari (Endplates)
    const endplateGeo = new THREE.BoxGeometry(0.42, 0.22, 0.04);
    geometriesToDispose.push(endplateGeo);
    const epLeft = new THREE.Mesh(endplateGeo, carbonMat);
    epLeft.position.set(-1.88, wingHeight, wingWidth / 2);
    const epRight = epLeft.clone();
    epRight.position.set(-1.88, wingHeight, -wingWidth / 2);
    carGroup.add(epLeft);
    carGroup.add(epRight);

    // Qanot Alyuminiy Ustunlari (Aluminum Stanchions)
    const stanchionGeo = new THREE.BoxGeometry(0.05, wingHeight - 0.72, 0.05);
    geometriesToDispose.push(stanchionGeo);
    const st1 = new THREE.Mesh(stanchionGeo, chromeMat);
    st1.position.set(-1.86, (wingHeight + 0.72) / 2, 0.48);
    const st2 = st1.clone();
    st2.position.set(-1.86, (wingHeight + 0.72) / 2, -0.48);
    carGroup.add(st1);
    carGroup.add(st2);
  }

  // 6. KRISTALL LED FARALAR VA ORQA YORUG'LIK NURLARI (LIGHTING OPTICS)
  const headlightGeo = new THREE.BoxGeometry(0.22, 0.12, 0.42);
  geometriesToDispose.push(headlightGeo);
  const leftHeadlight = new THREE.Mesh(headlightGeo, headlightMat);
  leftHeadlight.position.set(2.1, 0.52, 0.68);
  leftHeadlight.rotation.y = -0.12;
  const rightHeadlight = leftHeadlight.clone();
  rightHeadlight.position.set(2.1, 0.52, -0.68);
  rightHeadlight.rotation.y = 0.12;
  carGroup.add(leftHeadlight);
  carGroup.add(rightHeadlight);

  // Orqa Qizil Laser OLED Chiroq (Slim Full-Width Taillight)
  const taillightGeo = new THREE.BoxGeometry(0.12, 0.08, 1.75);
  geometriesToDispose.push(taillightGeo);
  const taillight = new THREE.Mesh(taillightGeo, taillightMat);
  taillight.position.set(-2.14, 0.56, 0);
  carGroup.add(taillight);

  // 7. 4 TA REALISTIK 3D G'ILDIRAK (3D ALLOY WHEELS, VENTED DISCS & BREMBO CALIPERS)
  const wheelPositions = [
    { x: 1.36, z: 0.98 },   // Old chap
    { x: 1.36, z: -0.98 },  // Old o'ng
    { x: -1.36, z: 1.0 },   // Orqa chap (kengroq)
    { x: -1.36, z: -1.0 },  // Orqa o'ng (kengroq)
  ];

  wheelPositions.forEach((pos) => {
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(pos.x, 0.36, pos.z);

    // Kauchuk Shina (Pirelli P-Zero Sport Tire)
    const tireGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.3, 32);
    geometriesToDispose.push(tireGeo);
    const tireMesh = new THREE.Mesh(tireGeo, tireMat);
    tireMesh.rotation.x = Math.PI / 2;
    tireMesh.castShadow = true;
    wheelGroup.add(tireMesh);

    // Qotishma Alyuminiy Disk (Forged Alloy Rim)
    const rimGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.31, 24);
    geometriesToDispose.push(rimGeo);
    const rimMesh = new THREE.Mesh(rimGeo, chromeMat);
    rimMesh.rotation.x = Math.PI / 2;
    wheelGroup.add(rimMesh);

    // Markaziy Sport Spitsalari (Y-Spoke Alloy Design)
    for (let s = 0; s < 5; s++) {
      const spokeGeo = new THREE.BoxGeometry(0.045, 0.44, 0.035);
      geometriesToDispose.push(spokeGeo);
      const spoke = new THREE.Mesh(spokeGeo, chromeMat);
      spoke.rotation.z = (s * Math.PI) / 2.5;
      spoke.position.z = pos.z > 0 ? 0.15 : -0.15;
      wheelGroup.add(spoke);
    }

    // Markaziy Qotishma Qopqoq (Center Hub Cap)
    const capGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.05, 16);
    geometriesToDispose.push(capGeo);
    const cap = new THREE.Mesh(capGeo, blackTrimMat);
    cap.rotation.x = Math.PI / 2;
    cap.position.z = pos.z > 0 ? 0.16 : -0.16;
    wheelGroup.add(cap);

    // Teshikli Tormoz Rotori (Cross-Drilled Steel Rotor)
    const rotorGeo = new THREE.CylinderGeometry(0.23, 0.23, 0.04, 20);
    geometriesToDispose.push(rotorGeo);
    const rotor = new THREE.Mesh(rotorGeo, brakeRotorMat);
    rotor.rotation.x = Math.PI / 2;
    wheelGroup.add(rotor);

    // Brembo Sport Kaliperi (Multi-Piston Racing Caliper)
    const caliperGeo = new THREE.BoxGeometry(0.14, 0.16, 0.12);
    geometriesToDispose.push(caliperGeo);
    const caliper = new THREE.Mesh(caliperGeo, caliperMat);
    caliper.position.set(0.12, 0.14, pos.z > 0 ? 0.03 : -0.03);
    wheelGroup.add(caliper);

    carGroup.add(wheelGroup);
    wheels.push(wheelGroup);
  });

  // 8. ZAMIN SOYASI (REALISTIC CONTACT SHADOW)
  const shadowGeo = new THREE.PlaneGeometry(5.2, 2.5);
  geometriesToDispose.push(shadowGeo);
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 128;
  shadowCanvas.height = 128;
  const sCtx = shadowCanvas.getContext('2d');
  if (sCtx) {
    const radGrad = sCtx.createRadialGradient(64, 64, 12, 64, 64, 64);
    radGrad.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
    radGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.5)');
    radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = radGrad;
    sCtx.fillRect(0, 0, 128, 128);
  }
  const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
  });
  materialsToDispose.push(shadowMat);
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = 0.01;
  carGroup.add(shadowMesh);

  // 9. NEON UNDERGLOW NUR (GLOW LIGHT)
  const underglowLight = new THREE.PointLight(glowColorHex, 2.8, 3.5);
  underglowLight.position.set(0, 0.12, 0);
  carGroup.add(underglowLight);

  return { carGroup, wheels, materialsToDispose, geometriesToDispose };
}
