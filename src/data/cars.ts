import bugattiImg from '../assets/images/bugatti_chiron_real_1793284955219.jpg';
import ferrariImg from '../assets/images/ferrari_f8_real_1793284974192.jpg';
import porscheImg from '../assets/images/porsche_911_real_1793284974447.jpg';
import amgImg from '../assets/images/amg_gt_real_1793284975634.jpg';
import bmwImg from '../assets/images/bmw_m4_real_1793284975300.jpg';
import bmwFrontImg from '../assets/images/bmw_m4_real_front_1793285920083.jpg';
import audiImg from '../assets/images/audi_r8_real_1793284992363.jpg';
import lamboImg from '../assets/images/lambo_huracan_real_1793284993014.jpg';
import mustangImg from '../assets/images/mustang_shelby_real_1793284994055.jpg';
import stingerImg from '../assets/images/stinger_gt_real_1793284993019.jpg';
import malibuImg from '../assets/images/malibu_turbo_real_1793285009320.jpg';

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
  realImageUrl: string;
  frontImageUrl?: string;
  flipFacing?: boolean;
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
    powerHp: 1600,
    realImageUrl: bugattiImg,
    flipFacing: true // rasmdagi burun chapda, poygada o'ngga qaratiladi
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
    powerHp: 720,
    realImageUrl: ferrariImg,
    flipFacing: false // rasmdagi burun o'ngda
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
    powerHp: 650,
    realImageUrl: porscheImg,
    flipFacing: true
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
    powerHp: 730,
    realImageUrl: amgImg,
    flipFacing: false
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
    powerHp: 510,
    realImageUrl: bmwImg,
    frontImageUrl: bmwFrontImg,
    flipFacing: false
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
    powerHp: 620,
    realImageUrl: audiImg,
    flipFacing: true
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
    powerHp: 640,
    realImageUrl: lamboImg,
    flipFacing: true
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
    powerHp: 760,
    realImageUrl: mustangImg,
    flipFacing: true
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
    powerHp: 368,
    realImageUrl: stingerImg,
    flipFacing: true
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
    powerHp: 250,
    realImageUrl: malibuImg,
    flipFacing: true
  }
];
