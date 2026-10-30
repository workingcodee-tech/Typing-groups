import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RacingCar } from '../data/cars';
import { createRealistic3DCar, BuiltCarModel } from '../utils/threeCarGenerator';
import { Zap, RotateCw, Flame, Eye, Sparkles, Compass } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface ThreeCarShowcaseProps {
  car: RacingCar;
  playerName: string;
}

const CAR_SPECS: Record<string, { engine: string; zeroToHundred: string; topSpeed: string; drive: string }> = {
  bugatti: { engine: '8.0L W16 Quad-Turbo', zeroToHundred: '2.4s', topSpeed: '440 km/h', drive: 'AWD' },
  ferrari: { engine: '3.9L V8 Twin-Turbo', zeroToHundred: '2.9s', topSpeed: '340 km/h', drive: 'RWD' },
  porsche: { engine: '3.7L Flat-6 Twin-Turbo', zeroToHundred: '2.7s', topSpeed: '330 km/h', drive: 'AWD' },
  mers: { engine: '4.0L V8 Biturbo Flat-Plane', zeroToHundred: '3.1s', topSpeed: '325 km/h', drive: 'RWD' },
  bmw: { engine: '3.0L M TwinPower Turbo I6', zeroToHundred: '3.5s', topSpeed: '290 km/h', drive: 'RWD' },
  audi: { engine: '5.2L V10 Naturally Aspirated', zeroToHundred: '3.1s', topSpeed: '331 km/h', drive: 'AWD' },
  lamborghini: { engine: '5.2L V10 Super Trofeo', zeroToHundred: '3.0s', topSpeed: '310 km/h', drive: 'RWD' },
  mustang: { engine: '5.2L Supercharged Cross-Plane V8', zeroToHundred: '3.3s', topSpeed: '290 km/h', drive: 'RWD' },
  kia: { engine: '3.3L Twin-Turbo V6', zeroToHundred: '4.7s', topSpeed: '270 km/h', drive: 'AWD' },
  malibu: { engine: '2.0L Turbocharged ECOTEC', zeroToHundred: '5.7s', topSpeed: '250 km/h', drive: 'FWD' },
};

export const ThreeCarShowcase: React.FC<ThreeCarShowcaseProps> = ({ car, playerName }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  // Standart holatda foydalanuvchiga haqiqiy, mukammal 8K avtomobil ochiladi
  const [viewMode, setViewMode] = useState<'photo' | '3d'>('photo');
  const [selectedAngle, setSelectedAngle] = useState<'front' | 'side'>('front');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [isRevving, setIsRevving] = useState<boolean>(false);

  // 3D Parallax & Tilt holati
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  const specs = CAR_SPECS[car.id] || CAR_SPECS.bmw;
  const displayImage = selectedAngle === 'front' && car.frontImageUrl ? car.frontImageUrl : car.realImageUrl;

  // WebGL 3D Mesh rejimida Three.js sahnasini yuklash
  useEffect(() => {
    if (viewMode !== '3d') return;

    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 280;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(4.2, 1.8, 3.8);
    camera.lookAt(0, 0.5, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 2.5;
    controls.maxDistance = 7.5;
    controls.target.set(0, 0.5, 0);
    controlsRef.current = controls;

    // Yoritgichlar
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(5, 7, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 3.0);
    rimLight.position.set(-6, 5, -5);
    scene.add(rimLight);

    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x050b14, 1.2);
    scene.add(hemiLight);

    // Podium
    const floorGeom = new THREE.CylinderGeometry(3.6, 3.6, 0.08, 48);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0a101d,
      roughness: 0.25,
      metalness: 0.8,
    });
    const floorMesh = new THREE.Mesh(floorGeom, floorMat);
    floorMesh.position.y = -0.04;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    const ringGeom = new THREE.RingGeometry(3.52, 3.62, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: parseInt((car.glowColor || '#00e5ff').replace('#', '0x'), 16),
      side: THREE.DoubleSide,
    });
    const ringMesh = new THREE.Mesh(ringGeom, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = 0.01;
    scene.add(ringMesh);

    const builtModel: BuiltCarModel = createRealistic3DCar(car);
    scene.add(builtModel.group);

    let animationFrameId: number;
    const clock = new THREE.Clock();

    let isUserInteracting = false;
    controls.addEventListener('start', () => {
      isUserInteracting = true;
    });
    controls.addEventListener('end', () => {
      isUserInteracting = false;
    });

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (autoRotate && !isUserInteracting) {
        builtModel.group.rotation.y += delta * 0.45;
        builtModel.wheels.forEach((w) => {
          w.rotation.x += delta * 2.2;
        });
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 600;
      const newH = container.clientHeight || 280;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      builtModel.disposables.geometries.forEach((g) => g.dispose());
      builtModel.disposables.materials.forEach((m) => m.dispose());
      builtModel.disposables.textures.forEach((t) => t.dispose());
      floorGeom.dispose();
      floorMat.dispose();
      ringGeom.dispose();
      ringMat.dispose();
      renderer.dispose();
    };
  }, [car, viewMode, autoRotate]);

  // Sichqoncha harakati orqali 3D parallaks va perspektivani o'zgartirish
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setTilt({ x: -y * 12, y: x * 18 });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  // Motor gazini bosish (Rev Engine)
  const handleRevEngine = () => {
    setIsRevving(true);
    sounds.playEngineRev();
    setTimeout(() => {
      setIsRevving(false);
    }, 800);
  };

  return (
    <div className="relative w-full flex flex-col items-center justify-center py-1 select-none">
      {/* 1. Avtomobil Nomi va Texnik Ma'lumotlari */}
      <div className="text-center mb-1 z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900/90 border border-slate-800 rounded-full text-xs font-mono mb-1 shadow-lg backdrop-blur-md">
          <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: car.bodyColor }} />
          <span className="text-slate-400 font-bold uppercase tracking-wider">{car.brand}</span>
          <span className="text-slate-600">•</span>
          <span className="text-amber-400 font-black flex items-center gap-1">
            <Zap className="w-3 h-3 fill-current" />
            {car.powerHp} HP
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400 font-bold">{specs.engine}</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
          {car.name}
        </h2>
        <p className="text-xs text-cyan-400 font-mono tracking-widest uppercase mt-0.5 font-bold flex items-center justify-center gap-2">
          <span>0-100: <strong className="text-white">{specs.zeroToHundred}</strong></span>
          <span className="text-slate-600">•</span>
          <span>MAX: <strong className="text-white">{specs.topSpeed}</strong></span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-300">{specs.drive}</span>
        </p>
      </div>

      {/* 2. Asosiy 3D Studiya Konteyneri */}
      <div
        className="relative w-full max-w-2xl h-56 sm:h-72 flex items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-b from-transparent via-[#060b14]/85 to-[#02050b] border border-cyan-500/25 shadow-[0_15px_40px_rgba(0,0,0,0.9)]"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
        {/* Studiya Projektor Nurlari */}
        <div className="absolute top-0 inset-x-0 h-32 pointer-events-none opacity-45 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-400/30 via-sky-600/10 to-transparent" />

        {viewMode === 'photo' ? (
          /* HAQIQIY FOTOREALISTIK 3D STUDIYA PERSPEKTIVASI */
          <div
            className="relative w-full h-full flex items-center justify-center p-3"
            style={{
              perspective: 1200,
              perspectiveOrigin: 'center center',
            }}
          >
            {/* Studiya Aylanuvchi Metall Podiumi */}
            <div
              className="absolute bottom-4 sm:bottom-5 w-80 sm:w-[500px] h-14 rounded-[100%] border border-cyan-500/30 shadow-[0_0_35px_rgba(6,182,212,0.3)] pointer-events-none transition-transform duration-300 ease-out"
              style={{
                transform: `rotateX(72deg) rotateZ(${tilt.y * 0.3}deg)`,
                background: `radial-gradient(ellipse at center, ${car.glowColor}30 0%, #050b14 65%, transparent 100%)`,
              }}
            />

            {/* Haqiqiy Avtomobil (3D Interaktiv Giroskopik Burilish bilan) */}
            <div
              className={`relative max-w-[90%] sm:max-w-[82%] h-auto flex items-center justify-center transition-transform duration-200 ease-out ${
                isRevving ? 'scale-105 animate-bounce' : ''
              }`}
              style={{
                transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.03 : 1})`,
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Gaz bosilganda egzoz alangasi */}
              {isRevving && (
                <div className="absolute -left-6 bottom-6 flex items-center pointer-events-none z-30 animate-pulse">
                  <span className="w-8 h-3 bg-gradient-to-l from-cyan-400 via-blue-500 to-transparent rounded-full blur-[1px] shadow-[0_0_15px_#38bdf8]" />
                </div>
              )}

              {/* Pol ustidagi yumshoq qora soya */}
              <div className="absolute -bottom-2 inset-x-8 h-4 bg-black/95 rounded-full blur-[4px] pointer-events-none" />

              {/* Haqiqiy Fotorealistik Avtomobil Fotosurati */}
              <img
                src={displayImage}
                alt={car.name}
                className="w-full h-auto object-contain max-h-44 sm:max-h-56 filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.95)] pointer-events-none transition-all duration-300"
                loading="eager"
              />
            </div>
          </div>
        ) : (
          /* 3D WEBGL POLIGONAL MESH (THREE.JS ORBITCONTROLS) */
          <div
            ref={mountRef}
            className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center"
            title="Mesh modelni 360° aylantirish uchun suring"
          />
        )}

        {/* 3. Yuqori burchak: Rejimlar Almashtirgichi (Standart: Haqiqiy Avtomobil) */}
        <div className="absolute top-2.5 right-3 flex items-center gap-1 bg-slate-950/85 p-1 border border-slate-800 rounded-xl backdrop-blur-md z-20">
          <button
            type="button"
            onClick={() => setViewMode('photo')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
              viewMode === 'photo'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Haqiqiy BMW M4</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('3d')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
              viewMode === '3d'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Eksperimental 3D Mesh"
          >
            <Compass className="w-3 h-3" />
            <span>3D Mesh</span>
          </button>
        </div>

        {/* 4. Pastki Panel: Gazni Bosish va Kamera burchagi */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 bg-slate-950/90 border border-slate-800 rounded-full text-[11px] font-mono text-slate-300 backdrop-blur-md shadow-xl pointer-events-auto z-20">
          {/* Gazni bosish tugmasi */}
          <button
            type="button"
            onClick={handleRevEngine}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              isRevving
                ? 'bg-rose-600 text-white shadow-[0_0_12px_#ef4444]'
                : 'bg-gradient-to-r from-amber-500/30 to-orange-500/30 hover:from-amber-500 hover:to-orange-500 text-amber-300 hover:text-slate-950 border border-amber-500/50'
            }`}
            title="Dvigatel gazini bosish"
          >
            <Flame className={`w-3.5 h-3.5 ${isRevving ? 'animate-bounce' : ''}`} />
            <span>Gaz (Rev)</span>
          </button>

          {/* Agar avtomobilda old 3/4 panjara rasmi mavjud bo'lsa burchak tugmasi */}
          {car.frontImageUrl && viewMode === 'photo' && (
            <>
              <span className="text-slate-700">|</span>
              <button
                type="button"
                onClick={() => setSelectedAngle(selectedAngle === 'front' ? 'side' : 'front')}
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 text-[10px] cursor-pointer"
              >
                <span>🔄</span>
                <span>{selectedAngle === 'front' ? '3/4 Old Panjara' : 'Yon Profil'}</span>
              </button>
            </>
          )}

          {viewMode === 'photo' && (
            <>
              <span className="text-slate-700 hidden sm:inline">|</span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">
                🖱️ Sichqonchani suring (3D Burilish)
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
