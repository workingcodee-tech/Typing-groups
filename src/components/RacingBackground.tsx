import React from 'react';

/**
 * RacingBackground: Haqiqiy arcade poyga atmosferasini yaratuvchi dinamik orqa fon.
 * Asfalt, neon tezlik chiziqlari, stadion projektorlari va shaxmat kataklari elementlari.
 */
export const RacingBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden bg-[#040813] text-slate-100 flex flex-col font-sans select-none">
      {/* 1. Asosiy Asfalt va Tungi Poyga Gradiyenti */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#02060e] via-[#05101a] to-[#02050b] pointer-events-none" />

      {/* 2. Perspektiv Poyga Trassasi / Neon Speed Grid */}
      <div className="absolute inset-0 opacity-25 pointer-events-none overflow-hidden">
        {/* Yuqori gorizont nurlari (Floodlight cones) */}
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-32 right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Perspektiv yo'l chiziqlari (SVG Racing Highway Lines) */}
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1000 800"
        >
          <defs>
            <linearGradient id="roadFade" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.05" />
              <stop offset="40%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="sideGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Perspektiv yo'l cheti chiziqlari */}
          <line x1="500" y1="120" x2="-100" y2="800" stroke="url(#roadFade)" strokeWidth="3" strokeDasharray="16,12" />
          <line x1="500" y1="120" x2="1100" y2="800" stroke="url(#roadFade)" strokeWidth="3" strokeDasharray="16,12" />

          {/* Ichki bo'laklar */}
          <line x1="500" y1="140" x2="200" y2="800" stroke="#00e5ff" strokeOpacity="0.12" strokeWidth="2" strokeDasharray="24,18" />
          <line x1="500" y1="140" x2="800" y2="800" stroke="#00e5ff" strokeOpacity="0.12" strokeWidth="2" strokeDasharray="24,18" />
          <line x1="500" y1="160" x2="420" y2="800" stroke="#10b981" strokeOpacity="0.15" strokeWidth="1.5" strokeDasharray="20,20" />
          <line x1="500" y1="160" x2="580" y2="800" stroke="#10b981" strokeOpacity="0.15" strokeWidth="1.5" strokeDasharray="20,20" />
        </svg>
      </div>

      {/* 3. Yon tomondagi Neon To'siqlar (Guardrails) va Tezlik Nurlari */}
      <div className="absolute top-0 bottom-0 left-0 w-2 sm:w-3 bg-gradient-to-b from-emerald-500/40 via-cyan-400/50 to-emerald-500/40 border-r border-cyan-400/30 shadow-[0_0_20px_rgba(6,182,212,0.5)] pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-2 sm:w-3 bg-gradient-to-b from-cyan-400/50 via-emerald-500/40 to-cyan-400/50 border-l border-emerald-400/30 shadow-[0_0_20px_rgba(16,185,129,0.5)] pointer-events-none" />

      {/* 4. Yuqori va Pastki Shaxmat (Checkered Flag) Yupqa Chiziqlari */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-[repeating-conic-gradient(#050914_0%_25%,#10b981_0%_50%)] bg-[length:14px_6px] opacity-60 z-30 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[repeating-conic-gradient(#050914_0%_25%,#06b6d4_0%_50%)] bg-[length:14px_6px] opacity-60 z-30 pointer-events-none" />

      {/* 5. Asosiy O'yin Kontenti */}
      <div className="relative z-10 w-full h-full flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
};
