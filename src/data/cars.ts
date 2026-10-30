export interface RacingCar {
  id: string;
  name: string;
  brand: string;
  bodyColor: string;
  secondaryColor?: string;
  stripeColor: string;
  glassColor: string;
  glowColor: string;
  caliperColor: string;
  silhouetteType: 'bugatti' | 'ferrari' | 'porsche' | 'amg' | 'bmw' | 'mustang' | 'audi' | 'lambo' | 'sedan';
  shortLabel: string;
  powerHp: number;
}

export const FAMOUS_CARS: RacingCar[] = [
  {
    id: 'bugatti',
    name: 'Bugatti Chiron Super Sport',
    brand: 'Bugatti',
    bodyColor: '#0a192f',
    secondaryColor: '#00d2ff',
    stripeColor: '#38bdf8',
    glassColor: '#020617',
    glowColor: '#00e5ff',
    caliperColor: '#00d2ff',
    silhouetteType: 'bugatti',
    shortLabel: 'Chiron SS',
    powerHp: 1600
  },
  {
    id: 'ferrari',
    name: 'Ferrari F8 Tributo',
    brand: 'Ferrari',
    bodyColor: '#dc2626',
    secondaryColor: '#991b1b',
    stripeColor: '#fef08a',
    glassColor: '#0f172a',
    glowColor: '#ef4444',
    caliperColor: '#eab308',
    silhouetteType: 'ferrari',
    shortLabel: 'F8 Tributo',
    powerHp: 720
  },
  {
    id: 'porsche',
    name: 'Porsche 911 Turbo S',
    brand: 'Porsche',
    bodyColor: '#eab308',
    secondaryColor: '#ca8a04',
    stripeColor: '#1e293b',
    glassColor: '#0f172a',
    glowColor: '#facc15',
    caliperColor: '#eab308',
    silhouetteType: 'porsche',
    shortLabel: '911 Turbo',
    powerHp: 650
  },
  {
    id: 'mers',
    name: 'Mercedes-AMG GT Black Series',
    brand: 'Mercedes-Benz',
    bodyColor: '#334155',
    secondaryColor: '#1e293b',
    stripeColor: '#00e5ff',
    glassColor: '#0f172a',
    glowColor: '#00e5ff',
    caliperColor: '#f59e0b',
    silhouetteType: 'amg',
    shortLabel: 'AMG GT',
    powerHp: 730
  },
  {
    id: 'bmw',
    name: 'BMW M4 Competition',
    brand: 'BMW',
    bodyColor: '#0284c7',
    secondaryColor: '#0369a1',
    stripeColor: '#38bdf8',
    glassColor: '#082f49',
    glowColor: '#38bdf8',
    caliperColor: '#ef4444',
    silhouetteType: 'bmw',
    shortLabel: 'BMW M4',
    powerHp: 510
  },
  {
    id: 'audi',
    name: 'Audi R8 V10 Performance',
    brand: 'Audi',
    bodyColor: '#64748b',
    secondaryColor: '#0f172a',
    stripeColor: '#ef4444',
    glassColor: '#0f172a',
    glowColor: '#f87171',
    caliperColor: '#ef4444',
    silhouetteType: 'audi',
    shortLabel: 'Audi R8',
    powerHp: 620
  },
  {
    id: 'lamborghini',
    name: 'Lamborghini Huracán STO',
    brand: 'Lamborghini',
    bodyColor: '#16a34a',
    secondaryColor: '#14532d',
    stripeColor: '#facc15',
    glassColor: '#0f172a',
    glowColor: '#4ade80',
    caliperColor: '#22c55e',
    silhouetteType: 'lambo',
    shortLabel: 'Huracán',
    powerHp: 640
  },
  {
    id: 'mustang',
    name: 'Ford Mustang Shelby GT500',
    brand: 'Mustang',
    bodyColor: '#1d4ed8',
    secondaryColor: '#1e40af',
    stripeColor: '#ffffff',
    glassColor: '#0f172a',
    glowColor: '#60a5fa',
    caliperColor: '#ef4444',
    silhouetteType: 'mustang',
    shortLabel: 'Mustang GT',
    powerHp: 760
  },
  {
    id: 'kia',
    name: 'Kia Stinger GT Twin-Turbo',
    brand: 'Kia',
    bodyColor: '#991b1b',
    secondaryColor: '#7f1d1d',
    stripeColor: '#cbd5e1',
    glassColor: '#0f172a',
    glowColor: '#f87171',
    caliperColor: '#dc2626',
    silhouetteType: 'sedan',
    shortLabel: 'Stinger GT',
    powerHp: 368
  },
  {
    id: 'malibu',
    name: 'Chevrolet Malibu Premier Turbo',
    brand: 'Malibu',
    bodyColor: '#1e293b',
    secondaryColor: '#0f172a',
    stripeColor: '#94a3b8',
    glassColor: '#020617',
    glowColor: '#94a3b8',
    caliperColor: '#e2e8f0',
    silhouetteType: 'sedan',
    shortLabel: 'Malibu',
    powerHp: 250
  }
];
