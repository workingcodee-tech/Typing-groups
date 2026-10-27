export interface RacingCar {
  id: string;
  name: string;
  brand: string;
  bodyColor: string;
  stripeColor: string;
  glassColor: string;
  glowColor: string;
  shortLabel: string;
}

export const FAMOUS_CARS: RacingCar[] = [
  {
    id: 'mers',
    name: 'Mercedes-Benz AMG GT',
    brand: 'Mercedes-Benz',
    bodyColor: '#334155',
    stripeColor: '#00E5FF',
    glassColor: '#0F172A',
    glowColor: '#00E5FF',
    shortLabel: 'AMG GT'
  },
  {
    id: 'bmw',
    name: 'BMW M4 Competition',
    brand: 'BMW',
    bodyColor: '#0284C7',
    stripeColor: '#38BDF8',
    glassColor: '#082F49',
    glowColor: '#38BDF8',
    shortLabel: 'BMW M4'
  },
  {
    id: 'porsche',
    name: 'Porsche 911 Turbo S',
    brand: 'Porsche',
    bodyColor: '#EAB308',
    stripeColor: '#CA8A04',
    glassColor: '#1E293B',
    glowColor: '#FACC15',
    shortLabel: '911 Turbo'
  },
  {
    id: 'audi',
    name: 'Audi R8 V10 Performance',
    brand: 'Audi',
    bodyColor: '#64748B',
    stripeColor: '#EF4444',
    glassColor: '#0F172A',
    glowColor: '#F87171',
    shortLabel: 'Audi R8'
  },
  {
    id: 'bugatti',
    name: 'Bugatti Chiron Super Sport',
    brand: 'Bugatti',
    bodyColor: '#1E1B4B',
    stripeColor: '#06B6D4',
    glassColor: '#0F172A',
    glowColor: '#22D3EE',
    shortLabel: 'Bugatti'
  },
  {
    id: 'ferrari',
    name: 'Ferrari F8 Tributo',
    brand: 'Ferrari',
    bodyColor: '#DC2626',
    stripeColor: '#FEF08A',
    glassColor: '#1E293B',
    glowColor: '#EF4444',
    shortLabel: 'Ferrari'
  },
  {
    id: 'mustang',
    name: 'Ford Mustang Shelby GT500',
    brand: 'Mustang',
    bodyColor: '#1D4ED8',
    stripeColor: '#FFFFFF',
    glassColor: '#0F172A',
    glowColor: '#60A5FA',
    shortLabel: 'Mustang'
  },
  {
    id: 'malibu',
    name: 'Chevrolet Malibu Premier',
    brand: 'Malibu',
    bodyColor: '#1E293B',
    stripeColor: '#94A3B8',
    glassColor: '#020617',
    glowColor: '#94A3B8',
    shortLabel: 'Malibu'
  },
  {
    id: 'kia',
    name: 'Kia Stinger GT Line',
    brand: 'Kia',
    bodyColor: '#991B1B',
    stripeColor: '#475569',
    glassColor: '#0F172A',
    glowColor: '#F87171',
    shortLabel: 'Kia Stinger'
  },
  {
    id: 'lamborghini',
    name: 'Lamborghini Huracan EVO',
    brand: 'Lamborghini',
    bodyColor: '#16A34A',
    stripeColor: '#FACC15',
    glassColor: '#0F172A',
    glowColor: '#4ADE80',
    shortLabel: 'Huracan'
  }
];
