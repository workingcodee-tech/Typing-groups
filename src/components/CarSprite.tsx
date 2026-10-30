import React from 'react';
import { FAMOUS_CARS, RacingCar } from '../data/cars';

interface CarSpriteProps {
  carId: string;
  playerName: string;
  currentWpm: number;
  isUser: boolean;
  rank?: number;
}

export const CarSprite = React.memo<CarSpriteProps>(({
  carId,
  playerName,
  currentWpm,
  isUser,
  rank = 1
}) => {
  const car: RacingCar = FAMOUS_CARS.find((c) => c.id === carId) || FAMOUS_CARS[0];
  const isMoving = currentWpm > 0;
  const isHighSpeed = currentWpm > 35;
  const sType = car.silhouetteType || 'amg';

  return (
    <div className="relative flex flex-col items-center select-none pointer-events-none">
      {/* 1. Foydalanuvchi mashinasi ustidagi neon arcade reyting nishoni */}
      {isUser && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center z-30 animate-pulse whitespace-nowrap">
          <div className="px-2.5 py-0.5 bg-gradient-to-r from-emerald-400 to-green-500 text-slate-950 font-black text-[10px] font-mono rounded-full shadow-[0_0_12px_#10b981] flex items-center gap-1 border border-emerald-200">
            <span>{rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '🏎️'}</span>
            <span>Siz: {rank}-oʻrin</span>
          </div>
        </div>
      )}

      {/* 2. Haqiqiy Supercar / Sport Avtomobili (Realistik Side-Profile) */}
      <div className="relative w-28 h-12 sm:w-32 sm:h-14 flex items-center justify-center filter drop-shadow-[0_6px_10px_rgba(0,0,0,0.85)]">
        {/* Yuqori tezlikdagi toza sport nitro alangasi */}
        {isMoving && (
          <div className="absolute -left-5 top-[60%] -translate-y-1/2 flex items-center pointer-events-none">
            <span
              className={`h-1.5 bg-gradient-to-l from-cyan-400 via-blue-500 to-transparent rounded-full ${
                isHighSpeed ? 'w-5 opacity-90 shadow-[0_0_6px_#38bdf8]' : 'w-2.5 opacity-70'
              }`}
            />
          </div>
        )}

        <svg
          viewBox="0 0 230 75"
          className="w-full h-full overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Metallik Bo'yoq Gradiyenti */}
            <linearGradient id={`carPaint-${car.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
              <stop offset="18%" stopColor={car.bodyColor} />
              <stop offset="65%" stopColor={car.secondaryColor || car.bodyColor} />
              <stop offset="100%" stopColor="#020617" stopOpacity="0.8" />
            </linearGradient>

            {/* Qora Karbon Frit va Shisha Gradiyenti */}
            <linearGradient id={`carGlass-${car.id}`} x1="15%" y1="0%" x2="85%" y2="100%">
              <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.9" />
              <stop offset="45%" stopColor="#0284c7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#031525" stopOpacity="0.95" />
            </linearGradient>

            {/* Alyuminiy Disk Gradiyenti */}
            <radialGradient id={`rimGrad-${car.id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="60%" stopColor="#cbd5e1" />
              <stop offset="85%" stopColor="#475569" />
              <stop offset="100%" stopColor="#0f172a" />
            </radialGradient>

            {/* Tormoz Diski (Teshikli po'lat rotor) */}
            <radialGradient id={`rotorGrad-${car.id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="70%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#334155" />
            </radialGradient>

            {/* Fara Nur Gradiyenti (Yo'lga tushuvchi ksenon yorug'lik konusi) */}
            <linearGradient id={`headlightCone-${car.id}`} x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.6" />
              <stop offset="30%" stopColor="#38bdf8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* 1. Asfalt ustidagi yumshoq soya */}
          <ellipse cx="115" cy="69" rx="100" ry="4.5" fill="#000000" opacity="0.75" />
          <ellipse cx="58" cy="69" rx="18" ry="3" fill="#000000" opacity="0.9" />
          <ellipse cx="172" cy="69" rx="18" ry="3" fill="#000000" opacity="0.9" />

          {/* 2. Foydalanuvchi mashinasi uchun neon Underglow (pastki chiroq) */}
          {isUser && (
            <ellipse
              cx="115"
              cy="68"
              rx="88"
              ry="5"
              fill={car.glowColor}
              opacity="0.55"
              filter="drop-shadow(0 0 6px currentColor)"
            />
          )}

          {/* 3. Old Fara Nurlanishi (Yo'lga tushuvchi yorqin ksenon nur) */}
          <polygon
            points="218,50 255,42 260,65 212,56"
            fill={`url(#headlightCone-${car.id})`}
            opacity={isMoving ? 0.9 : 0.4}
          />

          {/* 4. Orqa Egzoz quvurlari va olov */}
          <rect x="10" y="55" width="8" height="4" rx="1.5" fill="#334155" stroke="#0f172a" strokeWidth="0.8" />
          <circle cx="10" cy="57" r="1.5" fill="#020617" />
          {isMoving && (
            <path
              d="M 10 57 Q 1 56 3 58 Q 6 60 10 58 Z"
              fill={isHighSpeed ? '#38bdf8' : '#f59e0b'}
              opacity="0.95"
            />
          )}

          {/* 5. Modelga xos Haqiqiy kuzov silueti (Aerodynamic Bodywork) */}
          {sType === 'bugatti' && (
            <g>
              {/* Bugatti Chiron kuzovi: past old burun, oqimli tom va faol orqa qanot */}
              <path
                d="M 16 58 L 16 46 Q 20 42 34 42 L 50 42 Q 62 25 96 23 L 140 24 Q 170 34 196 46 L 216 50 Q 222 53 222 59 L 218 63 L 192 63 A 19 19 0 0 0 154 63 L 78 63 A 19 19 0 0 0 40 63 L 16 63 Z"
                fill={`url(#carPaint-${car.id})`}
                stroke="#090d16"
                strokeWidth="1.2"
              />
              {/* Bugatti ramziy 'C' shaklidagi yon havo kirish kanali (Signature C-Line) */}
              <path
                d="M 148 24 Q 172 35 158 54 Q 146 62 108 62 L 95 62 Q 68 62 68 45 Q 68 25 102 24 Z"
                fill="none"
                stroke={car.secondaryColor || '#00d2ff'}
                strokeWidth="3.5"
                strokeLinecap="round"
                opacity="0.95"
              />
              {/* Orqa uglerod qanot (Active Spoiler) */}
              <path d="M 14 36 L 28 36 L 26 40 L 12 40 Z" fill="#020617" stroke="#38bdf8" strokeWidth="0.6" />
              <line x1="20" y1="40" x2="20" y2="44" stroke="#090d16" strokeWidth="2.5" />
            </g>
          )}

          {sType === 'ferrari' && (
            <g>
              {/* Ferrari F8: o'ta past ponasimon profil, agressiv havo so'rgichlar */}
              <path
                d="M 16 58 L 16 46 Q 22 41 36 41 L 52 41 Q 65 24 100 22 L 142 23 Q 175 35 198 47 L 220 51 Q 224 54 224 59 L 220 63 L 192 63 A 19 19 0 0 0 154 63 L 78 63 A 19 19 0 0 0 40 63 L 16 63 Z"
                fill={`url(#carPaint-${car.id})`}
                stroke="#090d16"
                strokeWidth="1.2"
              />
              {/* Ferrari yon qanot havo teshigi va botiqligi */}
              <path
                d="M 85 46 Q 115 45 130 52 L 115 54 Q 90 49 85 46 Z"
                fill="#450a0a"
                opacity="0.9"
              />
              {/* O'rdak dumli orqa aerodinamik qirra */}
              <path d="M 16 42 Q 24 40 32 41 L 28 44 Z" fill="#7f1d1d" />
            </g>
          )}

          {sType === 'porsche' && (
            <g>
              {/* Porsche 911: dumaloq orqa dvigatel gumbazi va afsonaviy whale-tail qanot */}
              <path
                d="M 16 58 L 16 48 Q 20 44 32 44 L 48 44 Q 56 26 95 24 L 138 25 Q 168 36 192 48 L 216 52 Q 222 55 222 60 L 218 63 L 192 63 A 19 19 0 0 0 154 63 L 78 63 A 19 19 0 0 0 40 63 L 16 63 Z"
                fill={`url(#carPaint-${car.id})`}
                stroke="#090d16"
                strokeWidth="1.2"
              />
              {/* Porsche 911 orqa faol motor qanoti */}
              <path d="M 18 42 L 34 41 L 38 45 L 20 46 Z" fill="#1e293b" stroke="#ca8a04" strokeWidth="0.8" />
              {/* Old yumaloq 911 fara qavariqligi */}
              <ellipse cx="204" cy="49" rx="5" ry="3" fill="#ffffff" opacity="0.6" />
            </g>
          )}

          {sType === 'amg' && (
            <g>
              {/* Mercedes-AMG GT: uzun kapot, ortga surilgan kabina, poyga qanoti */}
              <path
                d="M 16 58 L 16 47 Q 22 43 36 43 L 52 43 Q 66 26 96 25 L 136 26 Q 164 38 196 46 L 220 50 Q 224 53 224 59 L 220 63 L 192 63 A 19 19 0 0 0 154 63 L 78 63 A 19 19 0 0 0 40 63 L 16 63 Z"
                fill={`url(#carPaint-${car.id})`}
                stroke="#090d16"
                strokeWidth="1.2"
              />
              {/* Katta uglerod qanot (Black Series GT Wing) */}
              <path d="M 14 33 L 32 33 L 30 37 L 12 37 Z" fill="#090d16" stroke="#00e5ff" strokeWidth="0.8" />
              <line x1="20" y1="37" x2="20" y2="44" stroke="#090d16" strokeWidth="2.5" />
              <line x1="26" y1="37" x2="26" y2="44" stroke="#090d16" strokeWidth="2.5" />
              {/* Kapotdagi agressiv AMG gill teshiklari */}
              <path d="M 155 42 L 175 44 L 170 46 L 150 44 Z" fill="#0f172a" opacity="0.8" />
            </g>
          )}

          {sType === 'bmw' && (
            <g>
              {/* BMW M4 Competition: o'tkir burchakli nemis sport kupesi */}
              <path
                d="M 16 58 L 16 48 Q 22 44 36 44 L 54 44 Q 68 26 98 25 L 140 26 Q 166 37 194 48 L 218 51 Q 222 54 222 60 L 218 63 L 192 63 A 19 19 0 0 0 154 63 L 78 63 A 19 19 0 0 0 40 63 L 16 63 Z"
                fill={`url(#carPaint-${car.id})`}
                stroke="#090d16"
                strokeWidth="1.2"
              />
              {/* Karbon tom chizig'i (M-Carbon Roof) */}
              <path d="M 88 25 L 138 26 L 134 29 L 84 28 Z" fill="#090d16" opacity="0.85" />
              {/* M-quvvat aerodinamik quloq oynasi */}
              <polygon points="122,39 128,36 126,42 120,41" fill="#0f172a" />
            </g>
          )}

          {sType === 'audi' && (
            <g>
              {/* Audi R8 V10: markaziy dvigatelli superkar, ramziy Carbon Side-Blade */}
              <path
                d="M 16 58 L 16 47 Q 20 42 34 42 L 50 42 Q 64 25 96 24 L 138 25 Q 168 36 195 47 L 218 50 Q 224 53 224 59 L 220 63 L 192 63 A 19 19 0 0 0 154 63 L 78 63 A 19 19 0 0 0 40 63 L 16 63 Z"
                fill={`url(#carPaint-${car.id})`}
                stroke="#090d16"
                strokeWidth="1.2"
              />
              {/* Audi R8 mashhur 'Side-Blade' karbon paneli (eshik orqasidagi qora qoplama) */}
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
              {/* Ford Mustang Shelby: baland mushakdor kapot, agressiv tanaffus */}
              <path
                d="M 16 58 L 16 49 Q 20 45 34 45 L 56 45 Q 68 27 98 26 L 138 27 Q 164 38 190 48 L 216 50 Q 222 52 222 59 L 218 63 L 192 63 A 19 19 0 0 0 154 63 L 78 63 A 19 19 0 0 0 40 63 L 16 63 Z"
                fill={`url(#carPaint-${car.id})`}
                stroke="#090d16"
                strokeWidth="1.2"
              />
              {/* Shelby Le-Mans oq chiziqlari (Dual Racing Stripes) */}
              <path d="M 30 47 L 216 52 L 215 55 L 28 50 Z" fill="#ffffff" opacity="0.95" />
              <path d="M 28 51 L 214 56 L 213 58 L 26 53 Z" fill="#ffffff" opacity="0.9" />
              {/* Kapot tepasidagi havo olish tuynugi (Hood Scoop) */}
              <polygon points="172,43 186,43 184,46 170,46" fill="#0f172a" />
            </g>
          )}

          {sType === 'lambo' && (
            <g>
              {/* Lamborghini Huracan: qirrali qiruvchi samolyot (Stealth Fighter) dizayni */}
              <path
                d="M 16 58 L 16 46 L 36 41 L 52 41 L 96 22 L 140 23 L 198 46 L 222 50 L 224 58 L 218 63 L 192 63 A 19 19 0 0 0 154 63 L 78 63 A 19 19 0 0 0 40 63 L 16 63 Z"
                fill={`url(#carPaint-${car.id})`}
                stroke="#090d16"
                strokeWidth="1.2"
              />
              {/* Lambo STO katta orqa qanoti va tom akulasi (Shark Fin) */}
              <path d="M 12 30 L 30 30 L 26 34 L 8 34 Z" fill="#020617" stroke="#facc15" strokeWidth="0.8" />
              <line x1="18" y1="34" x2="18" y2="42" stroke="#090d16" strokeWidth="2.5" />
              <path d="M 98 23 L 132 23 L 126 27 L 94 27 Z" fill="#020617" />
            </g>
          )}

          {sType === 'sedan' && (
            <g>
              {/* Stinger / Malibu: Chiroyli sport sedani (Fastback 4-Door) */}
              <path
                d="M 16 58 L 16 49 Q 20 45 36 45 L 56 45 Q 70 27 100 26 L 144 27 Q 170 38 196 48 L 218 51 Q 222 54 222 60 L 218 63 L 192 63 A 19 19 0 0 0 154 63 L 78 63 A 19 19 0 0 0 40 63 L 16 63 Z"
                fill={`url(#carPaint-${car.id})`}
                stroke="#090d16"
                strokeWidth="1.2"
              />
              {/* 4-eshikli sedan ajratuvchi B-pillar chizig'i */}
              <line x1="108" y1="28" x2="108" y2="62" stroke="#090d16" strokeWidth="1.5" opacity="0.6" />
              <line x1="78" y1="46" x2="78" y2="62" stroke="#090d16" strokeWidth="1.2" opacity="0.5" />
            </g>
          )}

          {/* 6. Yorug'lik yaltirashi (Metallik qirra nuri - Shoulder Specular Reflection) */}
          <path
            d="M 36 44 Q 96 42 194 48"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1"
            opacity="0.65"
          />

          {/* 7. Kokpit oynalari (Aerodinamik qoraytirilgan oynalar) */}
          <path
            d="M 68 41 Q 78 28 98 27 L 134 27 Q 155 36 166 42 L 112 42 Z"
            fill={`url(#carGlass-${car.id})`}
            stroke="#090d16"
            strokeWidth="1"
          />
          {/* Orqa kichik oyna qoraytirmasi */}
          <path d="M 68 41 L 102 41 L 100 28 Q 80 28 68 41 Z" fill="#041f33" opacity="0.85" />
          {/* Oyna ustuni (A & B Pillars) */}
          <line x1="104" y1="28" x2="106" y2="42" stroke="#090d16" strokeWidth="2.5" />
          <line x1="135" y1="28" x2="160" y2="42" stroke="#090d16" strokeWidth="2" />

          {/* Qoraytirilgan sport kokpit oynasi va orqa shaffof aks */}
          <path d="M 72 40 L 98 40 L 96 30 Q 82 29 72 40 Z" fill="#021422" opacity="0.9" />

          {/* 8. Old Kristall Fara (LED Matrix Projector) */}
          <polygon
            points="206,49 220,53 214,57 202,52"
            fill="#ffffff"
            stroke="#38bdf8"
            strokeWidth="0.8"
          />
          <circle cx="212" cy="53" r="2" fill="#38bdf8" />
          <circle cx="216" cy="54" r="1.5" fill="#ffffff" />

          {/* 9. Orqa Qizil LED Chiroq (Slim Taillight) */}
          <rect x="15" y="47" width="4.5" height="6.5" rx="1.5" fill="#ef4444" stroke="#7f1d1d" strokeWidth="0.6" />
          <rect x="16" y="49" width="3" height="2" fill="#fecaca" />

          {/* 10. G'ildirak kamarlari (Wheel Arches) */}
          <path d="M 37 63 A 19 19 0 0 1 79 63 Z" fill="#090d16" />
          <path d="M 151 63 A 19 19 0 0 1 193 63 Z" fill="#090d16" />

          {/* 11. ORQA G'ILDIRAK (Shina, po'lat rotor, sport kaliperi va qotishma disk) */}
          <g transform="translate(58, 63)">
            {/* Shina (Pirelli sport kauchuk) */}
            <circle cx="0" cy="0" r="16.5" fill="#0b0f19" stroke="#1e293b" strokeWidth="1.2" />
            <circle cx="0" cy="0" r="13" fill="#1e293b" />

            {/* Tormoz rotori (Diski) */}
            <circle cx="0" cy="0" r="10.5" fill={`url(#rotorGrad-${car.id})`} />
            <circle cx="0" cy="0" r="9" fill="none" stroke="#475569" strokeWidth="0.8" strokeDasharray="1.5,1.5" />

            {/* Sport Tormoz Kaliperi (Brembo) */}
            <path
              d="M -9 -7 Q -6 -10 -2 -10 L -2 -4 Q -6 -4 -9 -1 Z"
              fill={car.caliperColor || '#ef4444'}
              stroke="#0f172a"
              strokeWidth="0.5"
            />

            {/* Qotishma sport disk (Alloy Rim) */}
            <circle cx="0" cy="0" r="10" fill="none" stroke={`url(#rimGrad-${car.id})`} strokeWidth="1.5" />
            <circle cx="0" cy="0" r="4.5" fill="#0f172a" stroke="#94a3b8" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="2" fill="#e2e8f0" />

            {/* 6 ta markaziy sport spitsa (Spokes - markazga mustahkamlangan, yulduzcha hosil qilmaydi) */}
            <g>
              <line x1="0" y1="-8.5" x2="0" y2="8.5" stroke="#cbd5e1" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="-8.5" y1="0" x2="8.5" y2="0" stroke="#cbd5e1" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="-6" y1="-6" x2="6" y2="6" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="-6" y1="6" x2="6" y2="-6" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
            </g>
          </g>

          {/* 12. OLD G'ILDIRAK (Shina, po'lat rotor, sport kaliperi va qotishma disk) */}
          <g transform="translate(172, 63)">
            {/* Shina */}
            <circle cx="0" cy="0" r="16.5" fill="#0b0f19" stroke="#1e293b" strokeWidth="1.2" />
            <circle cx="0" cy="0" r="13" fill="#1e293b" />

            {/* Tormoz rotori */}
            <circle cx="0" cy="0" r="10.5" fill={`url(#rotorGrad-${car.id})`} />
            <circle cx="0" cy="0" r="9" fill="none" stroke="#475569" strokeWidth="0.8" strokeDasharray="1.5,1.5" />

            {/* Sport Tormoz Kaliperi */}
            <path
              d="M -9 -7 Q -6 -10 -2 -10 L -2 -4 Q -6 -4 -9 -1 Z"
              fill={car.caliperColor || '#ef4444'}
              stroke="#0f172a"
              strokeWidth="0.5"
            />

            {/* Qotishma disk */}
            <circle cx="0" cy="0" r="10" fill="none" stroke={`url(#rimGrad-${car.id})`} strokeWidth="1.5" />
            <circle cx="0" cy="0" r="4.5" fill="#0f172a" stroke="#94a3b8" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="2" fill="#e2e8f0" />

            {/* 6 ta markaziy sport spitsa */}
            <g>
              <line x1="0" y1="-8.5" x2="0" y2="8.5" stroke="#cbd5e1" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="-8.5" y1="0" x2="8.5" y2="0" stroke="#cbd5e1" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="-6" y1="-6" x2="6" y2="6" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="-6" y1="6" x2="6" y2="-6" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
            </g>
          </g>
        </svg>
      </div>

      {/* 3. Mashina ostida haydovchi ismi va avtomobil modeli (Bitta qatorda, qo'shni yo'laklarga xalaqit bermaydi) */}
      <div className="mt-1 flex items-center justify-center gap-1 px-1.5 py-0.5 bg-slate-950/80 border border-slate-800/80 rounded-md shadow-md max-w-[130px] truncate leading-none">
        <span
          className={`text-[10px] sm:text-[11px] font-bold tracking-tight truncate ${
            isUser ? 'text-emerald-300 font-extrabold' : 'text-slate-200'
          }`}
        >
          {playerName}
        </span>
        <span className="text-[8px] font-mono font-semibold text-cyan-400 shrink-0">
          • {car.shortLabel}
        </span>
      </div>
    </div>
  );
});
