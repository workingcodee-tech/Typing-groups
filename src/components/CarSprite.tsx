import React, { useEffect, useState } from 'react';
import { FAMOUS_CARS, RacingCar } from '../data/cars';
import { getTransparentCarImage } from '../utils/carImageProcessor';

interface CarSpriteProps {
  carId: string;
  playerName: string;
  currentWpm: number;
  isUser: boolean;
  rank?: number;
  isBraking?: boolean;
}

export const CarSprite: React.FC<CarSpriteProps> = ({
  carId,
  playerName,
  currentWpm,
  isUser,
  rank = 1,
  isBraking = false
}) => {
  const car: RacingCar = FAMOUS_CARS.find((c) => c.id === carId) || FAMOUS_CARS[0];
  const isMoving = currentWpm > 0;
  const isHighSpeed = currentWpm > 35;
  const [carImgUrl, setCarImgUrl] = useState<string>(car.realImageUrl);

  // Haqiqiy avtomobil rasmidan fonni olib tashlangan shaffof nusxasini yuklash
  useEffect(() => {
    let isMounted = true;
    getTransparentCarImage(car.realImageUrl, car.flipFacing).then((transparentUrl) => {
      if (isMounted) {
        setCarImgUrl(transparentUrl);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [car.realImageUrl, car.flipFacing]);

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

      {/* Xato qilinganda orqaga harakat va tormoz ko'rsatkichi */}
      {isUser && isBraking && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-40 whitespace-nowrap">
          <div className="px-2 py-0.5 bg-rose-600/95 text-white font-black text-[9px] font-mono rounded-full shadow-[0_0_10px_#ef4444] border border-rose-300 animate-bounce flex items-center gap-1">
            <span>⚠️</span>
            <span>Xatolik: -2 harf (Orqaga)</span>
          </div>
        </div>
      )}

      {/* 2. Haqiqiy Supercar / Sport Avtomobili (Silliq podveska va tormoz animatsiyasi bilan) */}
      <div className={`relative w-28 h-12 sm:w-34 sm:h-14 flex items-center justify-center filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.9)] ${
        isMoving && !isBraking ? 'animate-car-drive' : ''
      } ${isBraking ? 'animate-brake-jerk' : ''}`}>

        {/* Asfalt ustidagi yumshoq g'ildirak soyasi */}
        <div className="absolute bottom-1 left-2 right-2 h-2.5 bg-black/85 rounded-full blur-[2px] pointer-events-none" />

        {/* Foydalanuvchi uchun neon pastki chiroq (Underglow) */}
        {isUser && (
          <div
            className="absolute bottom-0.5 left-4 right-4 h-3 rounded-full blur-[5px] pointer-events-none opacity-80"
            style={{ backgroundColor: car.glowColor }}
          />
        )}

        {/* Tormoz / Xatolik vaqtida shina tutuni */}
        {isBraking && (
          <div className="absolute left-3 bottom-1 flex items-center pointer-events-none z-30">
            <div className="w-3.5 h-3.5 rounded-full bg-slate-300/75 blur-[1px] animate-skid-smoke" />
            <div className="w-3 h-3 rounded-full bg-slate-200/65 blur-[1px] animate-skid-smoke" style={{ animationDelay: '0.08s' }} />
          </div>
        )}

        {/* Yuqori tezlikdagi toza sport nitro alangasi */}
        {isMoving && !isBraking && (
          <div className="absolute -left-4 top-[65%] -translate-y-1/2 flex items-center pointer-events-none animate-flame-flicker">
            <span
              className={`h-1.5 bg-gradient-to-l from-cyan-400 via-blue-500 to-transparent rounded-full ${
                isHighSpeed ? 'w-6 opacity-95 shadow-[0_0_8px_#38bdf8]' : 'w-3 opacity-80'
              }`}
            />
          </div>
        )}

        {/* Old Fara Nuri (Yo'lga tushuvchi ksenon konus nur) */}
        <div
          className={`absolute -right-10 top-1/2 -translate-y-1/2 w-14 h-8 pointer-events-none transition-opacity ${
            isMoving ? 'opacity-70' : 'opacity-30'
          }`}
          style={{
            background: 'radial-gradient(ellipse at left center, rgba(224,242,254,0.6) 0%, rgba(56,189,248,0.2) 40%, transparent 80%)'
          }}
        />

        {/* HAQIQIY SUPERKAR RASMI (Real-World High-Definition Studio Image) */}
        <img
          src={carImgUrl}
          alt={car.name}
          className="w-full h-full object-contain relative z-20 pointer-events-none transition-transform will-change-transform"
          loading="eager"
        />
      </div>

      {/* 3. Mashina ostida haydovchi ismi va avtomobil modeli */}
      <div className="mt-1 flex items-center justify-center gap-1 px-1.5 py-0.5 bg-slate-950/85 border border-slate-800/80 rounded-md shadow-md max-w-[130px] truncate leading-none">
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
};
