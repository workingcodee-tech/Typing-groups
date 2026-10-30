import React from 'react';
import { RacingCar } from '../data/cars';
import { Zap, ShieldCheck } from 'lucide-react';

interface CarShowcaseProps {
  car: RacingCar;
  playerName: string;
}

export const CarShowcase: React.FC<CarShowcaseProps> = ({ car, playerName }) => {
  const sType = car.silhouetteType || 'amg';

  return (
    <div className="relative w-full flex flex-col items-center justify-center py-2 sm:py-4 select-none">
      {/* 1. Avtomobil nomi va xususiyatlari */}
      <div className="text-center mb-2 z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900/90 border border-slate-800 rounded-full text-xs font-mono mb-1.5 shadow-lg backdrop-blur-md">
          <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: car.bodyColor }} />
          <span className="text-slate-400 font-bold uppercase tracking-wider">{car.brand}</span>
          <span className="text-slate-600">•</span>
          <span className="text-amber-400 font-black flex items-center gap-1">
            <Zap className="w-3 h-3 fill-current" />
            {car.powerHp} HP
          </span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
          {car.name}
        </h2>
        <p className="text-xs text-cyan-400 font-mono tracking-widest uppercase mt-0.5 font-bold">
          {car.shortLabel} RACING EDITION
        </p>
      </div>

      {/* 2. Katta Garaj Maydoni va Mashina Tasviri */}
      <div className="relative w-full max-w-lg sm:max-w-xl h-44 sm:h-56 flex items-center justify-center">
        {/* Neon Zamin Platformasi (Showroom Floor Underglow) */}
        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4/5 h-10 rounded-[100%] blur-xl opacity-60 pointer-events-none transition-all duration-700 animate-underglow-breathe"
          style={{ backgroundColor: car.glowColor }}
        />
        <div
          className="absolute bottom-3 left-1/2 -translate-x-1/2 w-3/4 h-3 rounded-[100%] border pointer-events-none opacity-40 shadow-2xl transition-all duration-700"
          style={{ borderColor: car.glowColor, boxShadow: `0 0 35px ${car.glowColor}` }}
        />

        {/* Vektor Superkar SVG (Katta o'lchamda, silliq suzuvchi animatsiya bilan) */}
        <div className="relative w-72 sm:w-96 md:w-[460px] h-32 sm:h-44 md:h-48 flex items-center justify-center filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.95)] animate-float-gentle transition-all duration-500">
          <svg
            viewBox="0 0 230 75"
            className="w-full h-full overflow-visible"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Metallik Bo'yoq Gradiyenti */}
              <linearGradient id={`showcasePaint-${car.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
                <stop offset="18%" stopColor={car.bodyColor} />
                <stop offset="65%" stopColor={car.secondaryColor || car.bodyColor} />
                <stop offset="100%" stopColor="#020617" stopOpacity="0.85" />
              </linearGradient>

              {/* Shisha Gradiyenti */}
              <linearGradient id={`showcaseGlass-${car.id}`} x1="15%" y1="0%" x2="85%" y2="100%">
                <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.95" />
                <stop offset="45%" stopColor="#0284c7" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#031525" stopOpacity="0.95" />
              </linearGradient>

              {/* Alyuminiy Disk */}
              <radialGradient id={`showcaseRim-${car.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="60%" stopColor="#cbd5e1" />
                <stop offset="85%" stopColor="#475569" />
                <stop offset="100%" stopColor="#0f172a" />
              </radialGradient>

              {/* Tormoz Rotori */}
              <radialGradient id={`showcaseRotor-${car.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#94a3b8" />
                <stop offset="70%" stopColor="#64748b" />
                <stop offset="100%" stopColor="#334155" />
              </radialGradient>

              {/* Fara nuri */}
              <linearGradient id={`showcaseHeadlight-${car.id}`} x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.7" />
                <stop offset="40%" stopColor="#38bdf8" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Asfalt soyasi */}
            <ellipse cx="115" cy="69" rx="102" ry="5" fill="#000000" opacity="0.8" />
            <ellipse cx="58" cy="69" rx="18" ry="3.5" fill="#000000" opacity="0.9" />
            <ellipse cx="172" cy="69" rx="18" ry="3.5" fill="#000000" opacity="0.9" />

            {/* Neon Underglow */}
            <ellipse
              cx="115"
              cy="68"
              rx="90"
              ry="5.5"
              fill={car.glowColor}
              opacity="0.65"
            />

            {/* Fara nuri konusi */}
            <polygon
              points="218,50 260,40 265,65 212,56"
              fill={`url(#showcaseHeadlight-${car.id})`}
              opacity="0.85"
            />

            {/* Egzoz quvurlari */}
            <rect x="10" y="55" width="8" height="4" rx="1.5" fill="#334155" stroke="#0f172a" strokeWidth="0.8" />
            <circle cx="10" cy="57" r="1.5" fill="#020617" />

            {/* Kuzov siluetlari */}
            {sType === 'bugatti' && (
              <g>
                <path
                  d="M 16 58 L 16 46 Q 20 42 34 42 L 50 42 Q 62 25 96 23 L 140 24 Q 170 34 196 46 L 216 50 Q 222 53 222 59 L 218 63 L 192 63 A 19 19 0 0 0 154 63 L 78 63 A 19 19 0 0 0 40 63 L 16 63 Z"
                  fill={`url(#showcasePaint-${car.id})`}
                  stroke="#090d16"
                  strokeWidth="1.2"
                />
                <path
                  d="M 148 24 Q 172 35 158 54 Q 146 62 108 62 L 95 62 Q 68 62 68 45 Q 68 25 102 24 Z"
                  fill="none"
                  stroke={car.secondaryColor || '#00d2ff'}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  opacity="0.95"
                />
                <path d="M 14 36 L 28 36 L 26 40 L 12 40 Z" fill="#020617" stroke="#38bdf8" strokeWidth="0.6" />
                <line x1="20" y1="40" x2="20" y2="44" stroke="#090d16" strokeWidth="2.5" />
              </g>
            )}

            {sType === 'ferrari' && (
              <g>
                <path
                  d="M 16 58 L 16 46 Q 22 41 36 41 L 52 41 Q 65 24 100 22 L 142 23 Q 175 35 198 47 L 220 51 Q 224 54 224 59 L 220 63 L 192 63 A 19 19 0 0 0 154 63 L 78 63 A 19 19 0 0 0 40 63 L 16 63 Z"
                  fill={`url(#showcasePaint-${car.id})`}
                  stroke="#090d16"
                  strokeWidth="1.2"
                />
                <path
                  d="M 85 46 Q 115 45 130 52 L 115 54 Q 90 49 85 46 Z"
                  fill="#450a0a"
                  opacity="0.9"
                />
                <path d="M 16 42 Q 24 40 32 41 L 28 44 Z" fill="#7f1d1d" />
              </g>
            )}

            {sType === 'porsche' && (
              <g>
                <path
                  d="M 16 58 L 16 48 Q 20 44 32 44 L 48 44 Q 56 26 95 24 L 138 25 Q 168 36 192 48 L 216 52 Q 222 55 222 60 L 218 63 L 192 63 A 19 19 0 0 0 154 63 L 78 63 A 19 19 0 0 0 40 63 L 16 63 Z"
                  fill={`url(#showcasePaint-${car.id})`}
                  stroke="#090d16"
                  strokeWidth="1.2"
                />
                <path d="M 18 42 L 34 41 L 38 45 L 20 46 Z" fill="#1e293b" stroke="#ca8a04" strokeWidth="0.8" />
                <ellipse cx="204" cy="49" rx="5" ry="3" fill="#ffffff" opacity="0.6" />
              </g>
            )}

            {sType === 'amg' && (
              <g>
                <path
                  d="M 16 58 L 16 47 Q 22 43 36 43 L 52 43 Q 66 26 96 25 L 136 26 Q 164 38 196 46 L 220 50 Q 224 53 224 59 L 220 63 L 192 63 A 19 19 0 0 0 154 63 L 78 63 A 19 19 0 0 0 40 63 L 16 63 Z"
                  fill={`url(#showcasePaint-${car.id})`}
                  stroke="#090d16"
                  strokeWidth="1.2"
                />
                <path d="M 14 33 L 32 33 L 30 37 L 12 37 Z" fill="#090d16" stroke="#00e5ff" strokeWidth="0.8" />
                <line x1="20" y1="37" x2="20" y2="44" stroke="#090d16" strokeWidth="2.5" />
                <line x1="26" y1="37" x2="26" y2="44" stroke="#090d16" strokeWidth="2.5" />
                <path d="M 155 42 L 175 44 L 170 46 L 150 44 Z" fill="#0f172a" opacity="0.8" />
              </g>
            )}

            {sType === 'bmw' && (
              <g>
                <path
                  d="M 16 58 L 16 48 Q 22 44 36 44 L 54 44 Q 68 26 98 25 L 140 26 Q 166 37 194 48 L 218 51 Q 222 54 222 60 L 218 63 L 192 63 A 19 19 0 0 0 154 63 L 78 63 A 19 19 0 0 0 40 63 L 16 63 Z"
                  fill={`url(#showcasePaint-${car.id})`}
                  stroke="#090d16"
                  strokeWidth="1.2"
                />
                <path d="M 88 25 L 138 26 L 134 29 L 84 28 Z" fill="#090d16" opacity="0.85" />
                <polygon points="122,39 128,36 126,42 120,41" fill="#0f172a" />
              </g>
            )}

            {sType === 'audi' && (
              <g>
                <path
                  d="M 16 58 L 16 47 Q 20 42 34 42 L 50 42 Q 64 25 96 24 L 138 25 Q 168 36 195 47 L 218 50 Q 224 53 224 59 L 220 63 L 192 63 A 19 19 0 0 0 154 63 L 78 63 A 19 19 0 0 0 40 63 L 16 63 Z"
                  fill={`url(#showcasePaint-${car.id})`}
                  stroke="#090d16"
                  strokeWidth="1.2"
                />
                <path
                  d="M 76 34 L 88 34 L 84 62 L 72 62 Z"
                  fill="#020617"
                  stroke="#ef4444"
                  strokeWidth="0.8"
                  opacity="0.9"
                />
              </g>
            )}

            {sType === 'mustang' && (
              <g>
                <path
                  d="M 16 58 L 16 48 Q 22 43 36 43 L 56 43 Q 70 26 100 25 L 140 26 Q 166 38 194 47 L 218 51 Q 222 54 222 60 L 218 63 L 192 63 A 19 19 0 0 0 154 63 L 78 63 A 19 19 0 0 0 40 63 L 16 63 Z"
                  fill={`url(#showcasePaint-${car.id})`}
                  stroke="#090d16"
                  strokeWidth="1.2"
                />
                <path d="M 16 45 L 218 53 L 218 56 L 16 48 Z" fill={car.stripeColor || '#ffffff'} opacity="0.9" />
                <path d="M 14 36 L 30 36 L 28 40 L 12 40 Z" fill="#090d16" />
                <line x1="20" y1="40" x2="20" y2="44" stroke="#090d16" strokeWidth="2.5" />
              </g>
            )}

            {sType === 'lambo' && (
              <g>
                <path
                  d="M 16 58 L 16 47 Q 20 40 36 40 L 52 40 Q 64 24 96 22 L 136 24 Q 170 34 200 46 L 222 50 Q 226 53 226 59 L 220 63 L 192 63 A 19 19 0 0 0 154 63 L 78 63 A 19 19 0 0 0 40 63 L 16 63 Z"
                  fill={`url(#showcasePaint-${car.id})`}
                  stroke="#090d16"
                  strokeWidth="1.2"
                />
                <path d="M 14 28 L 36 28 L 32 34 L 10 34 Z" fill="#090d16" stroke="#facc15" strokeWidth="0.8" />
                <line x1="22" y1="34" x2="22" y2="42" stroke="#090d16" strokeWidth="2.5" />
                <line x1="28" y1="34" x2="28" y2="42" stroke="#090d16" strokeWidth="2.5" />
                <path d="M 96 22 L 80 40 L 120 40 Z" fill="#042f1a" opacity="0.5" />
              </g>
            )}

            {sType === 'sedan' && (
              <g>
                <path
                  d="M 16 58 L 16 49 Q 20 45 36 45 L 56 45 Q 70 27 100 26 L 144 27 Q 170 38 196 48 L 218 51 Q 222 54 222 60 L 218 63 L 192 63 A 19 19 0 0 0 154 63 L 78 63 A 19 19 0 0 0 40 63 L 16 63 Z"
                  fill={`url(#showcasePaint-${car.id})`}
                  stroke="#090d16"
                  strokeWidth="1.2"
                />
                <line x1="108" y1="28" x2="108" y2="62" stroke="#090d16" strokeWidth="1.5" opacity="0.6" />
                <line x1="78" y1="46" x2="78" y2="62" stroke="#090d16" strokeWidth="1.2" opacity="0.5" />
              </g>
            )}

            {/* Metallik qirra nuri */}
            <path d="M 36 44 Q 96 42 194 48" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.65" />

            {/* Kokpit oynalari */}
            <path
              d="M 68 41 Q 78 28 98 27 L 134 27 Q 155 36 166 42 L 112 42 Z"
              fill={`url(#showcaseGlass-${car.id})`}
              stroke="#090d16"
              strokeWidth="1"
            />
            <path d="M 68 41 L 102 41 L 100 28 Q 80 28 68 41 Z" fill="#041f33" opacity="0.85" />
            <line x1="104" y1="28" x2="106" y2="42" stroke="#090d16" strokeWidth="2.5" />
            <line x1="135" y1="28" x2="160" y2="42" stroke="#090d16" strokeWidth="2" />
            <path d="M 72 40 L 98 40 L 96 30 Q 82 29 72 40 Z" fill="#021422" opacity="0.9" />

            {/* Old Fara */}
            <polygon points="206,49 220,53 214,57 202,52" fill="#ffffff" stroke="#38bdf8" strokeWidth="0.8" />
            <circle cx="212" cy="53" r="2" fill="#38bdf8" />
            <circle cx="216" cy="54" r="1.5" fill="#ffffff" />

            {/* Orqa Chiroq */}
            <rect x="15" y="47" width="4.5" height="6.5" rx="1.5" fill="#ef4444" stroke="#7f1d1d" strokeWidth="0.6" />
            <rect x="16" y="49" width="3" height="2" fill="#fecaca" />

            {/* G'ildirak kamarlari */}
            <path d="M 37 63 A 19 19 0 0 1 79 63 Z" fill="#090d16" />
            <path d="M 151 63 A 19 19 0 0 1 193 63 Z" fill="#090d16" />

            {/* Orqa G'ildirak */}
            <g transform="translate(58, 63)">
              <circle cx="0" cy="0" r="16.5" fill="#0b0f19" stroke="#1e293b" strokeWidth="1.2" />
              <circle cx="0" cy="0" r="13" fill="#1e293b" />
              <circle cx="0" cy="0" r="10.5" fill={`url(#showcaseRotor-${car.id})`} />
              <circle cx="0" cy="0" r="9" fill="none" stroke="#475569" strokeWidth="0.8" strokeDasharray="1.5,1.5" />
              <path d="M -9 -7 Q -6 -10 -2 -10 L -2 -4 Q -6 -4 -9 -1 Z" fill={car.caliperColor || '#ef4444'} stroke="#0f172a" strokeWidth="0.5" />
              <circle cx="0" cy="0" r="10" fill="none" stroke={`url(#showcaseRim-${car.id})`} strokeWidth="1.5" />
              <circle cx="0" cy="0" r="4.5" fill="#0f172a" stroke="#94a3b8" strokeWidth="0.8" />
              <circle cx="0" cy="0" r="2" fill="#e2e8f0" />
              <g>
                <line x1="0" y1="-8.5" x2="0" y2="8.5" stroke="#cbd5e1" strokeWidth="1.4" strokeLinecap="round" />
                <line x1="-8.5" y1="0" x2="8.5" y2="0" stroke="#cbd5e1" strokeWidth="1.4" strokeLinecap="round" />
                <line x1="-6" y1="-6" x2="6" y2="6" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="-6" y1="6" x2="6" y2="-6" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
              </g>
            </g>

            {/* Old G'ildirak */}
            <g transform="translate(172, 63)">
              <circle cx="0" cy="0" r="16.5" fill="#0b0f19" stroke="#1e293b" strokeWidth="1.2" />
              <circle cx="0" cy="0" r="13" fill="#1e293b" />
              <circle cx="0" cy="0" r="10.5" fill={`url(#showcaseRotor-${car.id})`} />
              <circle cx="0" cy="0" r="9" fill="none" stroke="#475569" strokeWidth="0.8" strokeDasharray="1.5,1.5" />
              <path d="M -9 -7 Q -6 -10 -2 -10 L -2 -4 Q -6 -4 -9 -1 Z" fill={car.caliperColor || '#ef4444'} stroke="#0f172a" strokeWidth="0.5" />
              <circle cx="0" cy="0" r="10" fill="none" stroke={`url(#showcaseRim-${car.id})`} strokeWidth="1.5" />
              <circle cx="0" cy="0" r="4.5" fill="#0f172a" stroke="#94a3b8" strokeWidth="0.8" />
              <circle cx="0" cy="0" r="2" fill="#e2e8f0" />
              <g>
                <line x1="0" y1="-8.5" x2="0" y2="8.5" stroke="#cbd5e1" strokeWidth="1.4" strokeLinecap="round" />
                <line x1="-8.5" y1="0" x2="8.5" y2="0" stroke="#cbd5e1" strokeWidth="1.4" strokeLinecap="round" />
                <line x1="-6" y1="-6" x2="6" y2="6" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="-6" y1="6" x2="6" y2="-6" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
              </g>
            </g>
          </svg>
        </div>
      </div>

      {/* 3. Haydovchi nishoni */}
      <div className="mt-2 flex items-center gap-2 px-3 py-1 bg-slate-950/80 border border-slate-800 rounded-full text-xs text-slate-300 font-mono shadow-md">
        <span>👤 Haydovchi:</span>
        <strong className="text-white font-bold">{playerName || 'Poygachi'}</strong>
        <span className="text-emerald-400 font-bold ml-1 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> Tayyor
        </span>
      </div>
    </div>
  );
};
