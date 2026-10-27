import React from 'react';
import { FAMOUS_CARS, RacingCar } from '../data/cars';

interface CarSpriteProps {
  carId: string;
  playerName: string;
  currentWpm: number;
  isUser: boolean;
  rank?: number;
}

export const CarSprite: React.FC<CarSpriteProps> = ({
  carId,
  playerName,
  currentWpm,
  isUser,
  rank = 1
}) => {
  const car: RacingCar = FAMOUS_CARS.find((c) => c.id === carId) || FAMOUS_CARS[0];

  return (
    <div className="relative flex flex-col items-center select-none pointer-events-none">
      {/* Foydalanuvchi mashinasi ustidagi jonli o'rin nishoni (Aynan foydalanuvchining o'ziga ko'rinadi) */}
      {isUser && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center z-30 animate-pulse whitespace-nowrap">
          <div className="px-2 py-0.5 bg-emerald-400 text-slate-950 font-black text-[10px] font-mono rounded-full shadow-[0_0_10px_#34d399] flex items-center gap-1 border border-emerald-300">
            <span>{rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '🏎️'}</span>
            <span>Siz: {rank}-oʻrin</span>
          </div>
        </div>
      )}

      {/* Yon tomondan ko'rinuvchi haqiqiy arcade sport avtomobili (Side-view Sports Car) */}
      <div className="relative w-24 h-10 sm:w-28 sm:h-11 flex items-center justify-center filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
        {/* Tezlik tutuni / Speed smoke trails */}
        {currentWpm > 0 && (
          <div className="absolute -left-5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none opacity-80">
            <span className="w-4 h-1 bg-gradient-to-l from-white/60 to-transparent rounded-full animate-ping" />
            <span className="w-3 h-1.5 bg-gradient-to-l from-cyan-400/50 to-transparent rounded-full ml-1" />
          </div>
        )}

        <svg
          viewBox="0 0 200 80"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Wheel Rim Gradient */}
            <radialGradient id={`wheelRim-${car.id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="40%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#1e293b" />
            </radialGradient>

            {/* Glass Gradient */}
            <linearGradient id={`glassGrad-${car.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.95" />
            </linearGradient>

            {/* Body Shading Gradient */}
            <linearGradient id={`bodyGrad-${car.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
              <stop offset="30%" stopColor={car.bodyColor} />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Under-glow Neon */}
          {isUser && (
            <ellipse
              cx="100"
              cy="74"
              rx="75"
              ry="6"
              fill={car.glowColor || '#00e5ff'}
              opacity="0.5"
              filter="blur(2px)"
            />
          )}

          {/* Exhaust Pipe Flame if moving */}
          {currentWpm > 15 && (
            <path
              d="M 12 55 Q 0 57 2 60 Q 5 62 12 60 Z"
              fill="#38bdf8"
              opacity="0.9"
            />
          )}

          {/* Car Rear Spoiler */}
          <path
            d="M 14 36 L 24 36 L 28 42 L 18 42 Z"
            fill="#090d16"
            stroke="#1e293b"
            strokeWidth="1"
          />
          <path
            d="M 16 36 L 18 48 L 22 48 L 22 36 Z"
            fill="#090d16"
          />

          {/* Aerodynamic Sports Car Chassis (Side Profile) */}
          <path
            d="M 18 58 
               L 18 45 
               Q 22 42 34 42 
               L 52 42 
               Q 65 24 95 23 
               L 134 24 
               Q 158 35 174 46 
               L 188 50 
               Q 192 53 192 60 
               L 190 64 
               L 165 64 
               A 18 18 0 0 0 131 64 
               L 75 64 
               A 18 18 0 0 0 41 64 
               L 18 64 Z"
            fill={car.bodyColor}
            stroke="#090d16"
            strokeWidth="1.5"
          />
          {/* Overlay gradient for metallic curvature */}
          <path
            d="M 18 58 
               L 18 45 
               Q 22 42 34 42 
               L 52 42 
               Q 65 24 95 23 
               L 134 24 
               Q 158 35 174 46 
               L 188 50 
               Q 192 53 192 60 
               L 190 64 
               L 165 64 
               A 18 18 0 0 0 131 64 
               L 75 64 
               A 18 18 0 0 0 41 64 
               L 18 64 Z"
            fill={`url(#bodyGrad-${car.id})`}
            opacity="0.8"
          />

          {/* Racing Stripe */}
          <path
            d="M 32 46 L 186 52 L 185 55 L 30 49 Z"
            fill={car.stripeColor || '#ffffff'}
            opacity="0.9"
          />

          {/* Cockpit Windows (Cabin Glass) */}
          <path
            d="M 68 40 
               Q 78 27 98 26 
               L 130 27 
               Q 148 35 158 40 
               L 110 40 Z"
            fill={`url(#glassGrad-${car.id})`}
            stroke="#090d16"
            strokeWidth="1"
          />
          <path
            d="M 68 40 L 106 40 L 105 27 Q 82 27 68 40 Z"
            fill="#082f49"
            opacity="0.75"
          />
          {/* Window Pillar */}
          <line x1="108" y1="27" x2="110" y2="40" stroke="#090d16" strokeWidth="2.5" />

          {/* Driver Silhouette Inside */}
          <circle cx="94" cy="34" r="5" fill="#f8fafc" />
          <circle cx="96" cy="34" r="3" fill="#0284c7" />

          {/* Door Cutline */}
          <path
            d="M 72 41 L 68 59 L 122 59 L 128 41"
            fill="none"
            stroke="#090d16"
            strokeWidth="1.2"
            opacity="0.5"
          />
          {/* Door Handle */}
          <rect x="78" y="44" width="8" height="2" rx="1" fill="#090d16" />

          {/* Front Headlight */}
          <polygon
            points="180,48 190,52 184,55 176,51"
            fill="#ffffff"
          />
          <polygon
            points="184,50 196,53 194,56 182,53"
            fill="#38bdf8"
            opacity="0.8"
          />

          {/* Rear Taillight */}
          <rect x="18" y="46" width="4" height="6" rx="1" fill="#ef4444" />

          {/* Wheel Wells (Fenders) */}
          <path d="M 37 64 A 16 16 0 0 1 73 64 Z" fill="#090d16" />
          <path d="M 127 64 A 16 16 0 0 1 163 64 Z" fill="#090d16" />

          {/* Rear Wheel */}
          <circle cx="55" cy="64" r="14" fill="#090d16" stroke="#1e293b" strokeWidth="1" />
          <circle cx="55" cy="64" r="9" fill={`url(#wheelRim-${car.id})`} />
          <circle cx="55" cy="64" r="4" fill="#0f172a" />
          {/* Wheel Spokes */}
          <line x1="55" y1="55" x2="55" y2="73" stroke="#e2e8f0" strokeWidth="1.2" />
          <line x1="46" y1="64" x2="64" y2="64" stroke="#e2e8f0" strokeWidth="1.2" />

          {/* Front Wheel */}
          <circle cx="145" cy="64" r="14" fill="#090d16" stroke="#1e293b" strokeWidth="1" />
          <circle cx="145" cy="64" r="9" fill={`url(#wheelRim-${car.id})`} />
          <circle cx="145" cy="64" r="4" fill="#0f172a" />
          {/* Wheel Spokes */}
          <line x1="145" y1="55" x2="145" y2="73" stroke="#e2e8f0" strokeWidth="1.2" />
          <line x1="136" y1="64" x2="154" y2="64" stroke="#e2e8f0" strokeWidth="1.2" />
        </svg>
      </div>

      {/* Foydalanuvchining ismi mashina ostida (rasmdagidek toza oq shriftda) */}
      <div className="mt-0.5 text-center">
        <span className={`text-[10px] sm:text-[11px] font-bold tracking-tight font-sans drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] truncate max-w-[90px] block ${
          isUser ? 'text-white' : 'text-slate-300'
        }`}>
          {playerName}
        </span>
      </div>
    </div>
  );
};
