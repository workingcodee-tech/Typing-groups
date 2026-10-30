import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, ArrowRight, Zap, Target, Clock, Award, BarChart3, Flame, Keyboard } from 'lucide-react';
import { RaceStats, Participant } from '../types';
import { sounds } from '../utils/soundEffects';
import { sortRacersByRank } from '../utils/raceRanking';

interface FinishCelebrationOverlayProps {
  stats: RaceStats;
  participants: Participant[];
  onRestart: () => void;
  onOpenDetailedStats: () => void;
  onNextDifficulty?: () => void;
  isMultiplayer?: boolean;
  isCreator?: boolean;
  onNextRound?: () => void;
}

export const FinishCelebrationOverlay: React.FC<FinishCelebrationOverlayProps> = ({
  stats,
  participants,
  onRestart,
  onOpenDetailedStats,
  onNextDifficulty,
  isMultiplayer = false,
  isCreator = false,
  onNextRound
}) => {
  const [animatedWpm, setAnimatedWpm] = useState(0);
  const [animatedSeconds, setAnimatedSeconds] = useState(0);
  const [animatedChars, setAnimatedChars] = useState(0);

  const sortedRacers = sortRacersByRank(participants);

  const userRank = stats.userRank || (sortedRacers.findIndex((p) => p.isUser) + 1);
  const isWinner = userRank === 1;

  // Ko'p bosqichli chiroyli konfetti va feyerverk animatsiyasi
  useEffect(() => {
    // 1-bosqich: Tezkor g'alaba nishonlash
    sounds.playFinish();

    try {
      // Chap va o'ng tomondan kuchli feyerverk to'plari
      confetti({
        particleCount: 70,
        angle: 60,
        spread: 75,
        origin: { x: 0.1, y: 0.7 },
        colors: ['#00e5ff', '#10b981', '#fbbf24', '#ffffff']
      });
      confetti({
        particleCount: 70,
        angle: 120,
        spread: 75,
        origin: { x: 0.9, y: 0.7 },
        colors: ['#00e5ff', '#10b981', '#fbbf24', '#ffffff']
      });

      // 2-bosqich: Oltin yulduzlar (300ms dan so'ng)
      const t1 = setTimeout(() => {
        confetti({
          particleCount: 90,
          spread: 100,
          origin: { x: 0.5, y: 0.4 },
          colors: ['#fbbf24', '#f59e0b', '#fef08a', '#10b981']
        });
      }, 350);

      // 3-bosqich: Yakuniy zarba (700ms dan so'ng)
      const t2 = setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 120,
          origin: { x: 0.5, y: 0.6 },
          colors: ['#38bdf8', '#34d399', '#f43f5e', '#a855f7']
        });
      }, 700);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } catch {
      // ignore in test environments
    }
  }, []);

  // Raqamlar sanalish animatsiyasi (Count-up animation)
  useEffect(() => {
    const targetWpm = stats.wpm || 0;
    const targetSec = stats.timeSeconds || 0;
    const targetChars = stats.totalChars || 0;

    const duration = 1000;
    const steps = 30;
    const stepDuration = duration / steps;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      setAnimatedWpm(Math.round(targetWpm * progress));
      setAnimatedSeconds(Number((targetSec * progress).toFixed(1)));
      setAnimatedChars(Math.round(targetChars * progress));

      if (step >= steps) {
        clearInterval(interval);
        setAnimatedWpm(targetWpm);
        setAnimatedSeconds(targetSec);
        setAnimatedChars(targetChars);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [stats.wpm, stats.timeSeconds, stats.totalChars]);

  // Tab va Enter bilan tezda qayta boshlash
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        onRestart();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onRestart]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      {/* Oltin/Neon G'alaba Nurlari (Aura effect) */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <div
          className={`w-[500px] h-[500px] rounded-full blur-3xl opacity-30 animate-pulse ${
            isWinner ? 'bg-amber-400' : 'bg-cyan-500'
          }`}
        />
      </div>

      <div className="relative w-full max-w-lg bg-[#08101d] border-2 border-cyan-500/50 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(6,182,212,0.35)] text-center flex flex-col items-center my-auto overflow-hidden">
        {/* Shaxmat Finish bayrog'i fon lentalari */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-[repeating-conic-gradient(#050914_0%_25%,#fbbf24_0%_50%)] bg-[length:14px_8px]" />

        {/* 1. Katta Kubok / G'alaba Emblemasi */}
        <div className="relative my-2">
          {/* Kubok atrofidagi aylanuvchi oltin nur */}
          <div className="absolute inset-0 -m-3 rounded-full bg-gradient-to-r from-amber-400/30 via-yellow-300/40 to-amber-500/30 blur-lg animate-spin" style={{ animationDuration: '6s' }} />

          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-[#1c293d] to-[#09111c] border-2 border-amber-400/80 flex items-center justify-center shadow-2xl scale-100 hover:scale-105 transition-transform">
            {isWinner ? (
              <Trophy className="w-12 h-12 sm:w-14 sm:h-14 text-amber-400 drop-shadow-[0_0_20px_#fbbf24] animate-bounce" />
            ) : userRank === 2 ? (
              <Award className="w-12 h-12 sm:w-14 sm:h-14 text-slate-200 drop-shadow-[0_0_15px_#e2e8f0]" />
            ) : userRank === 3 ? (
              <Award className="w-12 h-12 sm:w-14 sm:h-14 text-amber-600 drop-shadow-[0_0_15px_#d97706]" />
            ) : (
              <Flame className="w-12 h-12 sm:w-14 sm:h-14 text-cyan-400 drop-shadow-[0_0_15px_#38bdf8]" />
            )}
          </div>
        </div>

        {/* 2. G'alaba Sarlavhasi */}
        <div className="space-y-1 mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700/80 text-[11px] font-mono font-bold tracking-widest text-slate-300 uppercase shadow-inner">
            <span>🏁 POYGA YAKUNLANDI</span>
            <span>·</span>
            <span className="text-emerald-400">{stats.distanceMeters || 100} METR</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md">
            {isWinner ? (
              <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                GʻALABA! 1-OʻRIN! 🥇
              </span>
            ) : userRank === 2 ? (
              <span className="text-slate-100">
                2-OʻRIN! KUMUSH! 🥈
              </span>
            ) : userRank === 3 ? (
              <span className="text-amber-500">
                3-OʻRIN! BRONZA! 🥉
              </span>
            ) : (
              <span className="text-cyan-300">
                MARRAGA YETIB KELDINGIZ! 🏁
              </span>
            )}
          </h2>

          <p className="text-xs text-slate-300 font-mono">
            {isWinner
              ? "Ajoyib natija! Barcha raqiblarni ortda qoldirib, gʻolib boʻldingiz!"
              : `${userRank}-oʻrinni egalladingiz. Yana ozgina tezlik va 1-oʻrin sizniki!`}
          </p>
        </div>

        {/* 3. Jonli Animatsiyali Asosiy Ko'rsatkichlar (Tezlik, Vaqt, Harflar, Aniqlik) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 w-full mb-3">
          {/* Tezlik (WPM) */}
          <div className="p-2.5 bg-slate-950/80 border border-cyan-500/40 rounded-2xl flex flex-col items-center shadow-lg">
            <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-bold mb-0.5">
              <Zap className="w-3 h-3 text-cyan-400" />
              <span>TEZLIK</span>
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-white">
              {animatedWpm}
            </div>
            <span className="text-[9px] text-slate-400 font-mono font-semibold">WPM</span>
          </div>

          {/* Vaqt (Sekund) */}
          <div className="p-2.5 bg-slate-950/80 border border-emerald-500/40 rounded-2xl flex flex-col items-center shadow-lg">
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold mb-0.5">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>VAQT</span>
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-300">
              {animatedSeconds}s
            </div>
            <span className="text-[9px] text-slate-400 font-mono font-semibold">soniya</span>
          </div>

          {/* Yozilgan Harflar / Belgilar soni */}
          <div className="p-2.5 bg-slate-950/80 border border-blue-500/40 rounded-2xl flex flex-col items-center shadow-lg">
            <div className="flex items-center gap-1 text-[10px] text-blue-400 font-bold mb-0.5">
              <Keyboard className="w-3 h-3 text-blue-400" />
              <span>HARFLAR</span>
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-blue-300">
              {animatedChars} <span className="text-xs font-normal text-slate-400">ta</span>
            </div>
            <span className="text-[9px] text-slate-400 font-mono font-semibold">belgi</span>
          </div>

          {/* Aniqlik */}
          <div className="p-2.5 bg-slate-950/80 border border-amber-500/40 rounded-2xl flex flex-col items-center shadow-lg">
            <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold mb-0.5">
              <Target className="w-3 h-3 text-amber-400" />
              <span>ANIQLIK</span>
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-amber-300">
              {stats.accuracy}%
            </div>
            <span className="text-[9px] text-slate-400 font-mono font-semibold">toʻgʻri</span>
          </div>
        </div>

        {/* Belgilar tafsiloti paneli */}
        <div className="w-full py-1.5 px-3 mb-4 rounded-xl bg-[#091526]/90 border border-cyan-500/30 flex items-center justify-between text-xs font-mono shadow-inner">
          <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-[11px] sm:text-xs">
            <Keyboard className="w-3.5 h-3.5 text-cyan-400" />
            <span>Yozilgan Belgilar (Harflar):</span>
          </div>
          <div className="text-white font-bold text-[11px] sm:text-xs">
            <span className="text-cyan-300 font-black">{stats.totalChars} ta belgi</span>{' '}
            <span className="text-emerald-400 text-[10px] sm:text-[11px]">({stats.correctChars} toʻgʻri</span>
            <span className="text-slate-400 text-[10px] sm:text-[11px]"> · </span>
            <span className="text-rose-400 text-[10px] sm:text-[11px]">{stats.incorrectChars} xato)</span>
          </div>
        </div>

        {/* 4. Shohsupa / Poygachilar Natijasi */}
        <div className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl p-2.5 mb-5 space-y-1.5 text-left">
          <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider px-1">
            Poyga Ishtirokchilari Natijasi:
          </div>
          <div className="divide-y divide-slate-850">
            {sortedRacers.slice(0, 4).map((r, i) => (
              <div
                key={r.id}
                className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-xs font-mono ${
                  r.isUser
                    ? 'bg-cyan-950/50 border border-cyan-500/40 text-cyan-200 font-bold'
                    : 'text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[11px] ${
                    i === 0 ? 'bg-amber-400 text-slate-950' : i === 1 ? 'bg-slate-300 text-slate-950' : i === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {i + 1}
                  </span>
                  <span className="text-white font-sans">{r.name} {r.isUser && '(Siz)'}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-slate-300">{r.finishTimeSeconds ? `${r.finishTimeSeconds.toFixed(1)}s` : `${r.currentWpm} WPM`}</span>
                  <span className="text-[11px]">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🏁'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Asosiy Interaktiv Tugmalar */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
          {isMultiplayer ? (
            isCreator ? (
              <button
                type="button"
                onClick={onNextRound || onRestart}
                className="w-full sm:flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 active:scale-98 transition-all cursor-pointer animate-pulse"
              >
                <RotateCcw className="w-4 h-4" />
                <span>KEYINGI BOSQICHNI BOSHLASH (Barcha uchun) 🏁</span>
              </button>
            ) : (
              <div className="w-full sm:flex-1 py-2.5 px-3 bg-cyan-950/70 border border-cyan-500/50 rounded-xl flex items-center justify-center gap-2 text-cyan-300 text-xs font-mono font-bold shadow-inner">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
                <span>Guruh yaratuvchisi keyingi bosqichni boshlashini kuting...</span>
              </div>
            )
          ) : (
            /* Qayta poyga (Yakka o'yin) */
            <button
              type="button"
              onClick={onRestart}
              className="w-full sm:flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 active:scale-98 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>QAYTA POYGA QILISH (Tab)</span>
            </button>
          )}

          {/* Batafsil Natijalar modali */}
          <button
            type="button"
            onClick={onOpenDetailedStats}
            className="w-full sm:w-auto py-3 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>Batafsil</span>
          </button>

          {/* Keyingi daraja (yakka rejimda) */}
          {!isMultiplayer && onNextDifficulty && (
            <button
              type="button"
              onClick={onNextDifficulty}
              className="w-full sm:w-auto py-3 px-3 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
              title="Keyingi darajaga o'tish"
            >
              <ArrowRight className="w-4 h-4" />
              <span>Keyingi Daraja</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
