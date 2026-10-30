import React from 'react';
import { CarSprite } from './CarSprite';

export interface HighwayRacer {
  id: string;
  name: string;
  carId: string;
  progress: number;
  currentWpm: number;
  accuracy: number;
  finished: boolean;
  finishTime?: number;
  finishTimeSeconds?: number;
  finishedAt?: number;
  finishRank?: number;
  isUser: boolean;
  rank?: number;
  isBraking?: boolean;
}

interface HighwayRaceTrackProps {
  racers: HighwayRacer[];
  roomName?: string;
  roomId?: string;
}

export const HighwayRaceTrack: React.FC<HighwayRaceTrackProps> = ({
  racers
}) => {
  return (
    <div className="w-full h-full flex-1 min-h-0 relative overflow-hidden rounded-2xl border-2 border-slate-800 bg-[#07130e] shadow-2xl flex flex-col">
      {/* 1. STADIUM VA INDUSTRIAL SILUET FON (Rasmdagi yashil osmon va to'siqlar) */}
      <div className="relative h-11 sm:h-14 w-full shrink-0 bg-gradient-to-b from-[#06241a] via-[#0d3b2c] to-[#134d3a] overflow-hidden select-none">
        <svg
          viewBox="0 0 1000 80"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full opacity-60 pointer-events-none"
        >
          {/* Floodlight beams */}
          <polygon points="120,0 200,80 40,80" fill="#34d399" opacity="0.12" />
          <polygon points="500,0 600,80 400,80" fill="#34d399" opacity="0.1" />
          <polygon points="880,0 960,80 800,80" fill="#34d399" opacity="0.12" />

          {/* Stadium Floodlight Towers */}
          <g fill="#04140e">
            {/* Tower 1 */}
            <rect x="110" y="6" width="20" height="7" rx="1" />
            <line x1="120" y1="13" x2="115" y2="80" stroke="#04140e" strokeWidth="3" />
            <line x1="120" y1="13" x2="125" y2="80" stroke="#04140e" strokeWidth="3" />
            <line x1="110" y1="35" x2="130" y2="35" stroke="#04140e" strokeWidth="1.5" />
            <line x1="112" y1="58" x2="128" y2="58" stroke="#04140e" strokeWidth="1.5" />

            {/* Tower 2 */}
            <rect x="870" y="6" width="20" height="7" rx="1" />
            <line x1="880" y1="13" x2="875" y2="80" stroke="#04140e" strokeWidth="3" />
            <line x1="880" y1="13" x2="885" y2="80" stroke="#04140e" strokeWidth="3" />
            <line x1="870" y1="35" x2="890" y2="35" stroke="#04140e" strokeWidth="1.5" />
            <line x1="872" y1="58" x2="888" y2="58" stroke="#04140e" strokeWidth="1.5" />

            {/* Chain-link fence and billboard silhouettes */}
            <rect x="240" y="30" width="80" height="50" opacity="0.8" />
            <rect x="480" y="30" width="120" height="50" opacity="0.8" />
            <rect x="720" y="30" width="70" height="50" opacity="0.8" />
            <line x1="0" y1="50" x2="1000" y2="50" stroke="#04140e" strokeWidth="2" />
            <line x1="0" y1="60" x2="1000" y2="60" stroke="#04140e" strokeWidth="2" />
            <line x1="0" y1="70" x2="1000" y2="70" stroke="#04140e" strokeWidth="2" />
          </g>
        </svg>

        {/* Trassa maydoni cheti */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#0a2017]" />
      </div>

      {/* 2. YORQIN NEON YASHIL TO'SIQ (Rasmdagi yorqin yashil chiziq / curb strip) */}
      <div className="h-3 w-full shrink-0 bg-[#10b981] border-y border-[#059669] relative shadow-md overflow-hidden flex items-center">
        {/* Yashil to'siq ustidagi qora chiziqchalar (rumble marks) */}
        <div className="w-full h-full bg-[repeating-linear-gradient(90deg,#047857,#047857_16px,#10b981_16px,#10b981_32px)] opacity-90" />
      </div>

      {/* 3. ASOSIY ASFALT POYGA TRASSASI (To'liq ekranni egallaydi) */}
      <div className="relative flex-1 min-h-0 bg-[#161d27] overflow-y-auto overflow-x-hidden flex flex-col justify-around">
        {/* Start chizig'i (Chap tomonda) */}
        <div className="absolute left-6 top-0 bottom-0 w-1 bg-white/40 z-10 pointer-events-none flex items-center justify-center">
          <span className="text-[7px] text-white/50 -rotate-90 uppercase font-mono font-bold">START</span>
        </div>

        {/* Marra chizig'i (Checkered finish line - Rasmdagi shaxmat kataklari) */}
        <div className="absolute right-6 top-0 bottom-0 w-8 bg-[repeating-conic-gradient(#000000_0%_25%,#ffffff_0%_50%)] bg-[length:12px_12px] z-10 border-l-2 border-r-2 border-yellow-400 pointer-events-none shadow-2xl">
          <div className="h-full flex items-center justify-center bg-black/20">
            <span className="text-[8px] text-yellow-300 font-black rotate-90 tracking-widest font-mono">FINISH</span>
          </div>
        </div>

        {/* Har bir ishtirokchi uchun asfalt yo'lak */}
        <div className="flex-1 flex flex-col justify-around divide-y divide-dashed divide-slate-700/50 py-0.5">
          {racers.map((racer, index) => {
            const safeProgress = Math.min(100, Math.max(0, racer.progress));
            // Start chizig'idan finishgacha o'ta silliq siljish
            const leftPercent = 2 + (safeProgress * 0.81);

            return (
              <div
                key={racer.id}
                className={`relative flex-1 min-h-[52px] sm:min-h-[64px] flex items-center px-4 transition-all duration-300 ${
                  racer.isUser ? 'bg-cyan-950/35 shadow-[inset_0_0_20px_rgba(6,182,212,0.15)]' : ''
                }`}
              >
                {/* Yo'lak raqami */}
                <div className="absolute left-1.5 text-[9px] font-mono text-slate-500 font-bold select-none">
                  L{index + 1}
                </div>

                {/* Yo'lning o'rtasidagi oq chiziqchalar (dashed lane divider) */}
                <div className="absolute inset-x-8 bottom-0 h-[1px] bg-dashed border-b border-dashed border-slate-700/60" />

                {/* Yon tomondan harakatlanuvchi sport avtomobili (Ultra-silliq harakatlanish) */}
                <div
                  className="absolute z-20 pointer-events-none will-change-[left]"
                  style={{
                    left: `${leftPercent}%`,
                    transition: 'left 0.45s cubic-bezier(0.22, 1, 0.36, 1), transform 0.25s ease-out'
                  }}
                >
                  <CarSprite
                    carId={racer.carId}
                    playerName={racer.name}
                    currentWpm={racer.currentWpm}
                    isUser={racer.isUser}
                    rank={racer.rank || (index + 1)}
                    isBraking={racer.isBraking}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. PASTKI ASFALT CHEGARA CHIZIG'I */}
      <div className="h-2 w-full shrink-0 bg-[#0d121a] border-t border-slate-800" />
    </div>
  );
};
