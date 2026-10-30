import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { HighwayRaceTrack, HighwayRacer } from './HighwayRaceTrack';
import { WordsTypingArena, getTargetCharsForDistance } from './WordsTypingArena';
import { RaceResultsModal } from './RaceResultsModal';
import { FinishCelebrationOverlay } from './FinishCelebrationOverlay';
import { CarSelector } from './CarSelector';
import { generate5000Words } from '../data/words';
import { RaceStats, DifficultyLevel } from '../types';
import { Users, Volume2, VolumeX, X, Edit3, HelpCircle, Maximize2, Minimize2 } from 'lucide-react';
import { FAMOUS_CARS } from '../data/cars';
import { sounds, SwitchSoundType } from '../utils/soundEffects';
import { sortRacersByRank } from '../utils/raceRanking';

interface SoloRaceArenaProps {
  userName: string;
  carId: string;
  initialDifficulty?: DifficultyLevel;
  initialDistance?: number;
  onBack?: () => void;
  onOpenMultiplayer?: () => void;
  onChangeCar?: (newCarId: string) => void;
  onChangeName?: (newName: string) => void;
  soundType?: SwitchSoundType;
  onToggleSound?: () => void;
}

// 3 xil qiyinlik darajasidagi botlar parametrlari (foydalanuvchilar qulay yutishi uchun moslangan)
const BOT_CONFIGS: Record<DifficultyLevel, { id: string; name: string; carId: string; wpm: number; accuracy: number }[]> = {
  easy: [
    { id: 'bot-1', name: 'Sokin Haydovchi', carId: 'malibu', wpm: 10, accuracy: 95 },
    { id: 'bot-2', name: 'Shahar Mashinasi', carId: 'kia', wpm: 14, accuracy: 96 },
    { id: 'bot-3', name: 'Asta Poygachi', carId: 'audi', wpm: 18, accuracy: 97 },
  ],
  medium: [
    { id: 'bot-1', name: 'Kruiz Poygachi', carId: 'bmw', wpm: 22, accuracy: 96 },
    { id: 'bot-2', name: 'Nitro Mustang', carId: 'mustang', wpm: 28, accuracy: 97 },
    { id: 'bot-3', name: 'Turbo AMG', carId: 'mers', wpm: 34, accuracy: 98 },
  ],
  hard: [
    { id: 'bot-1', name: 'Shadow Ferrari', carId: 'ferrari', wpm: 42, accuracy: 98 },
    { id: 'bot-2', name: 'Hyper 911', carId: 'porsche', wpm: 50, accuracy: 98 },
    { id: 'bot-3', name: 'Bugatti Phantom', carId: 'bugatti', wpm: 58, accuracy: 99 },
  ],
};

export const SoloRaceArena: React.FC<SoloRaceArenaProps> = ({
  userName,
  carId,
  initialDifficulty = 'medium',
  initialDistance = 100,
  onBack,
  onOpenMultiplayer,
  onChangeCar,
  onChangeName,
  soundType,
  onToggleSound
}) => {
  const [wordsList, setWordsList] = useState<string[]>(() => generate5000Words());
  const [raceStats, setRaceStats] = useState<RaceStats | null>(null);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [showDetailedModal, setShowDetailedModal] = useState<boolean>(false);
  const [isCarModalOpen, setIsCarModalOpen] = useState<boolean>(false);
  const [isNameModalOpen, setIsNameModalOpen] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>(userName);

  // Poyga oldidan yo'riqnoma ko'rsatish modali
  const [showInstructionModal, setShowInstructionModal] = useState<boolean>(true);
  const [enableFullscreenOnStart, setEnableFullscreenOnStart] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => {
    try {
      return !!document.fullscreenElement;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleFsChange = () => {
      try {
        setIsFullscreen(!!document.fullscreenElement);
      } catch {
        // ignore
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.warn("Butun ekranni o'zgartirishda xatolik:", err);
    }
  };

  const [selectedDistance, setSelectedDistance] = useState<number>(initialDistance);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(initialDifficulty);

  // initialDistance o'zgarganda yangilash
  useEffect(() => {
    if (initialDistance && initialDistance !== selectedDistance) {
      setSelectedDistance(initialDistance);
    }
  }, [initialDistance]);

  // 3-2-1 Countdown holati (boshida null bo'ladi, foydalanuvchi "Tushunarli" degach boshlanadi)
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isRaceActive, setIsRaceActive] = useState<boolean>(false);
  const raceStartTimeRef = useRef<number | null>(null);

  const selectedCar = FAMOUS_CARS.find(c => c.id === carId) || FAMOUS_CARS[0];

  // 4 ta poygachi (Foydalanuvchi + tanlangan darajadagi 3 ta bot raqib)
  const initialRacers = useMemo<HighwayRacer[]>(() => {
    const currentBots = BOT_CONFIGS[difficulty].map((bot, index) => ({
      id: bot.id,
      name: bot.name,
      carId: bot.carId,
      progress: 0,
      currentWpm: bot.wpm,
      accuracy: bot.accuracy,
      finished: false,
      isUser: false,
      rank: index + 2
    }));

    return [
      {
        id: 'user-player',
        name: userName || 'Siz (Oʻyinchi)',
        carId: selectedCar.id,
        progress: 0,
        currentWpm: 0,
        accuracy: 100,
        finished: false,
        isUser: true,
        rank: 1
      },
      ...currentBots
    ];
  }, [userName, selectedCar.id, difficulty]);

  const [racers, setRacers] = useState<HighwayRacer[]>(initialRacers);
  const botIntervalRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);

  // Poygani 3-2-1 hisoblagich bilan boshlash
  const startCountdown = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    if (botIntervalRef.current) {
      clearInterval(botIntervalRef.current);
      botIntervalRef.current = null;
    }

    setCountdown(3);
    setIsRaceActive(false);
    raceStartTimeRef.current = null;
    setRacers(initialRacers);

    // Ovoz effektlari: 3
    sounds.playCountdown(3);

    let count = 3;
    countdownTimerRef.current = window.setInterval(() => {
      count -= 1;
      if (count >= 0) {
        setCountdown(count);
        sounds.playCountdown(count);
      } else {
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }
        setCountdown(null);
        setIsRaceActive(true);
        raceStartTimeRef.current = Date.now();
      }
    }, 1000);
  }, [initialRacers]);

  // Yo'riqnomani tasdiqlab poygani boshlash
  const handleAcknowledgeInstructions = async () => {
    setShowInstructionModal(false);
    if (enableFullscreenOnStart && !document.fullscreenElement) {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch {
        // brauzer cheklovi bo'lsa muammosiz davom etadi
      }
    }
    startCountdown();
  };

  // Komponent o'chirilganda taymerlarni tozalash
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
      if (botIntervalRef.current) {
        clearInterval(botIntervalRef.current);
      }
    };
  }, []);

  // Botlarning masofaga va qiyinlik darajasiga qarab harakatlanishi
  useEffect(() => {
    if (!isRaceActive || raceStats) {
      if (botIntervalRef.current) {
        clearInterval(botIntervalRef.current);
        botIntervalRef.current = null;
      }
      return;
    }

    const targetWords = getTargetCharsForDistance(selectedDistance) / 5;
    const botSpeeds: Record<string, number> = {};
    BOT_CONFIGS[difficulty].forEach(b => {
      botSpeeds[b.id] = b.wpm;
    });

    botIntervalRef.current = window.setInterval(() => {
      if (!raceStartTimeRef.current) return;
      const elapsedSeconds = (Date.now() - raceStartTimeRef.current) / 1000;

      setRacers((prev) => {
        const updated = prev.map((racer) => {
          if (racer.isUser || racer.finished) return racer;

          const wpm = botSpeeds[racer.id] || 45;
          const wordsTyped = elapsedSeconds * (wpm / 60);
          // O'ta silliq harakatlanish uchun suzuvchi (float) foizdan foydalanish
          const progress = Math.min(100, Math.max(0, Number(((wordsTyped / targetWords) * 100).toFixed(2))));

          return {
            ...racer,
            progress,
            currentWpm: wpm,
            finished: progress >= 100,
            finishTime: progress >= 100 && !racer.finishTime ? Number(elapsedSeconds.toFixed(1)) : racer.finishTime
          };
        });

        const sorted = sortRacersByRank(updated);
        const rankMap = new Map(sorted.map((r, i) => [r.id, i + 1]));

        return updated.map((r) => ({
          ...r,
          rank: rankMap.get(r.id) || 1
        }));
      });
    }, 50);

    return () => {
      if (botIntervalRef.current) {
        clearInterval(botIntervalRef.current);
      }
    };
  }, [isRaceActive, raceStats, selectedDistance, difficulty]);

  // Tormoz / orqaga chekinish indikatori uchun ref
  const brakingTimerRef = useRef<number | null>(null);

  // Foydalanuvchi klaviaturada yozganda progress yangilanishi
  const handleProgressUpdate = useCallback((
    userProgress: number,
    wpm: number,
    accuracy: number,
    _chars: number,
    _errors: number,
    _currentMeters: number
  ) => {
    setRacers((prev) => {
      let isBackward = false;
      const updated = prev.map((racer) => {
        if (!racer.isUser) return racer;
        // Agar yangi progress avvalgisidan kam bo'lsa (xatolik tufayli orqaga chekindi)
        if (userProgress < racer.progress) {
          isBackward = true;
        }
        return {
          ...racer,
          progress: userProgress,
          currentWpm: wpm,
          accuracy,
          finished: userProgress >= 100,
          isBraking: isBackward || racer.isBraking
        };
      });

      if (isBackward) {
        if (brakingTimerRef.current) clearTimeout(brakingTimerRef.current);
        brakingTimerRef.current = window.setTimeout(() => {
          setRacers((current) =>
            current.map((r) => (r.isUser ? { ...r, isBraking: false } : r))
          );
        }, 650);
      }

      const sorted = sortRacersByRank(updated);
      const rankMap = new Map(sorted.map((r, i) => [r.id, i + 1]));

      return updated.map((r) => ({
        ...r,
        rank: rankMap.get(r.id) || 1
      }));
    });
  }, []);

  const handleFinish = useCallback((stats: RaceStats) => {
    setRacers((current) => {
      const userRank = current.find(r => r.isUser)?.rank || 1;
      setRaceStats({
        ...stats,
        distanceMeters: selectedDistance,
        difficulty,
        userRank,
        totalRacers: current.length
      });
      setShowCelebration(true);
      setShowDetailedModal(false);
      return current;
    });
    setIsRaceActive(false);
  }, [selectedDistance, difficulty]);

  const handleRestartRace = useCallback(() => {
    setRaceStats(null);
    setShowCelebration(false);
    setShowDetailedModal(false);
    setWordsList(generate5000Words());
    startCountdown();
  }, [startCountdown]);

  const handleDistanceChange = useCallback((dist: number) => {
    setSelectedDistance(dist);
    try {
      localStorage.setItem('tg_user_dist', dist.toString());
    } catch {
      // ignore
    }
    setRaceStats(null);
    setShowCelebration(false);
    setShowDetailedModal(false);
    setWordsList(generate5000Words());
    startCountdown();
  }, [startCountdown]);

  const handleDifficultyChange = useCallback((newDiff: DifficultyLevel) => {
    setDifficulty(newDiff);
    setRaceStats(null);
    setShowCelebration(false);
    setShowDetailedModal(false);
    setWordsList(generate5000Words());
    startCountdown();
  }, [startCountdown]);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      if (onChangeName) onChangeName(tempName.trim());
      try {
        localStorage.setItem('tg_user_name', tempName.trim());
      } catch {
        // ignore
      }
      setIsNameModalOpen(false);
    }
  };

  return (
    <div className="w-full h-full max-w-none flex flex-col justify-between py-1.5 px-2 sm:px-4 select-none relative overflow-hidden bg-[#070b14]/70">
      {/* 1. GORIZONTAL BIR QATORLI HEADER (O'yin nomi, Yakka poyga, O'yinchi nomi, Daraja, Tugatish) */}
      <header className="w-full flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-5 py-2 bg-slate-950/85 border border-slate-800/80 rounded-2xl shadow-xl backdrop-blur-md shrink-0 whitespace-nowrap overflow-x-auto no-scrollbar">
        {/* Chap qism: O'yin nomi va Rejim */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* O'yin Logosi va Nomi */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-emerald-950/90 to-slate-900 border border-emerald-500/40 rounded-xl">
            <span className="text-sm">🏎️</span>
            <span className="text-xs sm:text-sm font-black tracking-tight text-white font-mono">
              TYPING <span className="text-emerald-400">GROUPS</span>
            </span>
          </div>

          {/* Rejim: Yakka Poyga */}
          <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-900/90 border border-slate-700/70 rounded-xl text-xs font-bold text-slate-200">
            <span>🏁</span>
            <span>Yakka Poyga</span>
          </div>

          {/* Multiplayer (Guruh) ga o'tish tugmasi */}
          {onOpenMultiplayer && (
            <button
              type="button"
              onClick={onOpenMultiplayer}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-cyan-300 hover:text-white bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/50 rounded-xl transition-all shadow-md cursor-pointer active:scale-95"
            >
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>Guruhga Qoʻshilish</span>
            </button>
          )}
        </div>

        {/* Markaziy qism: O'yinchi nomi, Mashina va Daraja sozlamalari */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* O'yinchi nomi */}
          <button
            type="button"
            onClick={() => setIsNameModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded-xl text-cyan-300 font-bold text-xs cursor-pointer transition-colors"
            title="Ismni oʻzgartirish"
          >
            <span>👤</span>
            <span className="max-w-[90px] sm:max-w-none truncate">{userName}</span>
            <Edit3 className="w-3 h-3 text-slate-500" />
          </button>

          {/* Tanlangan mashina */}
          <button
            type="button"
            onClick={() => setIsCarModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-200 text-xs cursor-pointer transition-colors active:scale-95"
            title="Mashinani almashtirish"
          >
            <span
              className="w-2.5 h-2.5 rounded-full border border-slate-600 shrink-0"
              style={{ backgroundColor: selectedCar.bodyColor }}
            />
            <span className="font-bold text-white max-w-[80px] sm:max-w-none truncate">{selectedCar.name.split(' ')[0]}</span>
            <span className="text-[10px] text-slate-400">▾</span>
          </button>

          {/* Daraja: Oson / O'rta / Qiyin */}
          <div className="flex items-center p-0.5 bg-slate-900/90 border border-slate-800 rounded-xl text-[11px] font-bold">
            <button
              type="button"
              onClick={() => handleDifficultyChange('easy')}
              className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                difficulty === 'easy'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-sm shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🟢 Oson
            </button>
            <button
              type="button"
              onClick={() => handleDifficultyChange('medium')}
              className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                difficulty === 'medium'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-sm shadow-amber-400/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🟡 Oʻrta
            </button>
            <button
              type="button"
              onClick={() => handleDifficultyChange('hard')}
              className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                difficulty === 'hard'
                  ? 'bg-rose-500 text-white font-black shadow-sm shadow-rose-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🔴 Qiyin
            </button>
          </div>

          {/* Masofa: 50m, 100m, 200m, 500m, 1000m */}
          <div className="hidden md:flex items-center p-0.5 bg-slate-900/90 border border-slate-800 rounded-xl text-[10px] font-mono font-bold">
            {[50, 100, 200, 500, 1000].map((dist) => (
              <button
                key={dist}
                type="button"
                onClick={() => handleDistanceChange(dist)}
                className={`px-1.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                  selectedDistance === dist
                    ? 'bg-emerald-400 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {dist}m
              </button>
            ))}
          </div>
        </div>

        {/* O'ng qism: Butun ekran, Ovoz, Yo'riqnoma va TUGATISH (Chiqish) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Butun ekran rejimi tugmasi */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-emerald-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm"
            title={isFullscreen ? "Butun ekrandan chiqish" : "Butun ekranga oʻtish (Toʻliq ekran)"}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Kichraytirish</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Butun ekran</span>
              </>
            )}
          </button>

          {/* Yo'riqnoma tugmasi */}
          <button
            type="button"
            onClick={() => setShowInstructionModal(true)}
            className="p-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-emerald-300 rounded-xl cursor-pointer transition-colors"
            title="Qoidalar va yoʻriqnomani koʻrish"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Ovoz sozlamasi */}
          {onToggleSound && (
            <button
              type="button"
              onClick={onToggleSound}
              className="p-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl cursor-pointer transition-colors"
              title="Ovozni almashtirish"
            >
              {soundType === 'off' ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              )}
            </button>
          )}

          {/* TUGATISH (Poygani to'xtatish va bosh sahifaga qaytish) */}
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black text-rose-100 hover:text-white bg-rose-950/90 hover:bg-rose-900 border border-rose-600/90 rounded-xl transition-all shadow-md shadow-rose-950/40 cursor-pointer active:scale-95"
              title="Poygani tugatish va bosh menyuga qaytish"
            >
              <span>🛑</span>
              <span>Tugatish</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. ASOSIY ASFALT POYGA TRASSASI (Kompyuter ekranini to'liq egallaydi) */}
      <div className="flex-1 min-h-0 my-1 relative flex flex-col justify-center w-full">
        <HighwayRaceTrack
          racers={racers}
          roomName={
            difficulty === 'easy'
              ? 'Yakka Poyga (Oson Trassa · ~10-18 WPM)'
              : difficulty === 'medium'
              ? 'Yakka Poyga (Oʻrta Trassa · ~22-34 WPM)'
              : 'Yakka Poyga (Qiyin Trassa · ~42-58 WPM)'
          }
        />

        {/* 3... 2... 1... START! Overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs z-30 rounded-2xl flex flex-col items-center justify-center animate-fade-in pointer-events-none">
            {/* Chiroqlar (Traffic Light) */}
            <div className="flex items-center gap-3 mb-2 p-2 bg-slate-950/90 border border-slate-800 rounded-full shadow-2xl">
              <span className={`w-5 h-5 rounded-full transition-all duration-200 ${
                countdown === 3 ? 'bg-rose-500 shadow-[0_0_15px_#f43f5e] scale-125' : 'bg-rose-950/40 border border-rose-900/60'
              }`} />
              <span className={`w-5 h-5 rounded-full transition-all duration-200 ${
                countdown === 2 ? 'bg-amber-400 shadow-[0_0_15px_#fbbf24] scale-125' : 'bg-amber-950/40 border border-amber-900/60'
              }`} />
              <span className={`w-5 h-5 rounded-full transition-all duration-200 ${
                countdown <= 1 ? 'bg-emerald-400 shadow-[0_0_15px_#34d399] scale-125' : 'bg-emerald-950/40 border border-emerald-900/60'
              }`} />
            </div>

            {/* Raqam yoki GO! */}
            <div className="text-5xl sm:text-7xl font-black font-mono tracking-wider drop-shadow-[0_0_25px_rgba(52,211,153,0.8)] text-white scale-110 animate-bounce">
              {countdown === 0 ? (
                <span className="text-emerald-400">GO! 🏁</span>
              ) : (
                <span className={countdown === 3 ? 'text-rose-400' : countdown === 2 ? 'text-amber-400' : 'text-emerald-400'}>
                  {countdown}
                </span>
              )}
            </div>

            <p className="text-[11px] sm:text-xs font-mono font-bold text-slate-300 mt-2 tracking-widest uppercase bg-slate-900/90 px-3 py-0.5 rounded-md border border-slate-700">
              {countdown === 0 ? 'POYGA BOSHLANDI!' : 'TAYYOR BOʻLING...'}
            </p>
          </div>
        )}
      </div>

      {/* 3. SPIDOMETR VA MATN YOZISH MAYDONI (Ekranning pastki qismida joylashgan) */}
      <div className="shrink-0 w-full pt-1 pb-0.5">
        {(() => {
          const userRacer = racers.find(r => r.isUser);
          const userLiveRank = userRacer?.rank || 1;
          return (
            <WordsTypingArena
              wordsList={wordsList}
              onProgressUpdate={handleProgressUpdate}
              onFinish={handleFinish}
              isGameActive={isRaceActive}
              countdownActive={countdown !== null}
              selectedDistance={selectedDistance}
              onDistanceChange={handleDistanceChange}
              onRestart={handleRestartRace}
              userRank={userLiveRank}
              totalRacers={racers.length}
            />
          );
        })()}
      </div>

      {/* 4. POYGA BOSHLANISHDAN OLDIN KO'RSATILADIGAN YO'RIQNOMA MODALI */}
      {showInstructionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#0b1222] border-2 border-emerald-500/50 rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(16,185,129,0.25)] text-slate-100 flex flex-col gap-4">
            {/* Modal Sarlavhasi */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xl">
                  🏁
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white font-mono tracking-tight">
                    Yakka Poyga — Yoʻriqnoma
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Oʻyin boshlanishidan oldin muhim tushuntirish
                  </p>
                </div>
              </div>
              <div className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-[10px] font-mono text-emerald-400 font-bold">
                {selectedDistance}m · {difficulty === 'easy' ? 'Oson' : difficulty === 'medium' ? 'Oʻrta' : 'Qiyin'}
              </div>
            </div>

            {/* Asosiy ko'rsatma: Yozish maydoni pastda joylashganligi */}
            <div className="p-4 bg-emerald-950/40 border-2 border-emerald-500/60 rounded-2xl relative overflow-hidden space-y-2.5 shadow-inner">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-base shadow-lg shadow-emerald-500/40 animate-bounce">
                  ⬇️
                </div>
                <div>
                  <h4 className="text-sm font-black text-emerald-300 uppercase tracking-wide">
                    DIQQAT: Matn yozish maydoni sahifaning pastida!
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1">
                    Oʻyin boshlangach, <strong>sahifaning eng pastki qismidagi</strong> kiritish maydoniga eʼtibor qarating. Soʻzlarni ketma-ket yozib, har bir soʻzdan keyin <strong>Space (Probel)</strong> bosing.
                  </p>
                </div>
              </div>

              {/* Ekran anatomiyasi sxemasi */}
              <div className="mt-3 p-2.5 bg-slate-950/90 border border-slate-800 rounded-xl space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between text-slate-400 px-2 py-1 bg-slate-900/60 rounded border border-slate-800/80">
                  <span>⬆️ Yuqorida:</span>
                  <span className="text-slate-300 font-bold">Header (Natija, Daraja, Tugatish)</span>
                </div>
                <div className="flex items-center justify-between text-slate-400 px-2 py-1 bg-slate-900/60 rounded border border-slate-800/80">
                  <span>🛣️ Oʻrtada:</span>
                  <span className="text-slate-300 font-bold">Trassa va Mashinalar harakati</span>
                </div>
                <div className="flex items-center justify-between text-emerald-300 px-2 py-1.5 bg-emerald-900/40 rounded border border-emerald-500/60 animate-pulse font-bold">
                  <span className="flex items-center gap-1.5">
                    <span>⬇️</span> <span>PASTDA:</span>
                  </span>
                  <span className="text-emerald-200">YOZISH MAYDONI (Spidometr + Matn) ⌨️</span>
                </div>
              </div>
            </div>

            {/* Qoidalar kartochkalari */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center gap-2">
                <span className="text-base">🏎️</span>
                <div>
                  <div className="font-bold text-white">Tezlik</div>
                  <div className="text-[10px] text-slate-400">Tez yozsangiz, mashina tezroq yuradi</div>
                </div>
              </div>
              <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center gap-2">
                <span className="text-base">🎯</span>
                <div>
                  <div className="font-bold text-white">Aniqlik</div>
                  <div className="text-[10px] text-slate-400">Xatosiz yozish gʻalabaga olib boradi</div>
                </div>
              </div>
            </div>

            {/* Haydovchi va mashina xulosasi */}
            <div className="flex items-center justify-between px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono">
              <span className="flex items-center gap-1.5">
                <span>Haydovchi:</span>
                <strong className="text-cyan-300">{userName}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedCar.bodyColor }} />
                <strong className="text-white">{selectedCar.name}</strong>
              </span>
            </div>

            {/* Butun ekran rejimini tasdiqlash opsiyasi */}
            <label className="flex items-center gap-3 p-2.5 sm:p-3 bg-slate-900/90 border border-slate-700/80 rounded-2xl cursor-pointer hover:border-emerald-500/50 transition-colors">
              <input
                type="checkbox"
                checked={enableFullscreenOnStart}
                onChange={(e) => setEnableFullscreenOnStart(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-950 border-slate-700 cursor-pointer"
              />
              <div className="text-xs">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Qurilmada butun ekran rejimini yoqish (Tavsiya etiladi)</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Poyga maydoni butun ekranni egallaydi va chalgʻituvchi elementlarsiz qulay yozish imkonini beradi
                </div>
              </div>
            </label>

            {/* HARAKAT TUGMASI: Tushunarli! Poygani Boshlash */}
            <button
              type="button"
              onClick={handleAcknowledgeInstructions}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Tushunarli! Poygani Boshlash (3-2-1)</span>
              <span className="text-base">🚀</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. G'alaba Animatsiyasi (FinishCelebrationOverlay) */}
      {raceStats && showCelebration && (
        <FinishCelebrationOverlay
          stats={raceStats}
          participants={racers.map(r => ({
            id: r.id,
            name: r.name,
            avatar: '🏎️',
            isUser: r.isUser,
            progress: r.progress,
            currentWpm: r.currentWpm,
            rawWpm: r.currentWpm,
            accuracy: r.accuracy,
            finished: r.finished,
            finishTimeSeconds: r.finishTime,
            rank: r.rank,
            color: selectedCar.bodyColor
          }))}
          onRestart={handleRestartRace}
          onOpenDetailedStats={() => {
            setShowCelebration(false);
            setShowDetailedModal(true);
          }}
          onNextDifficulty={() => {
            const nextDiff: DifficultyLevel = difficulty === 'easy' ? 'medium' : difficulty === 'medium' ? 'hard' : 'easy';
            handleDifficultyChange(nextDiff);
          }}
        />
      )}

      {/* 6. Batafsil Natijalar Modali */}
      {raceStats && showDetailedModal && (
        <RaceResultsModal
          stats={raceStats}
          participants={racers.map(r => ({
            id: r.id,
            name: r.name,
            avatar: '🏎️',
            isUser: r.isUser,
            progress: r.progress,
            currentWpm: r.currentWpm,
            rawWpm: r.currentWpm,
            accuracy: r.accuracy,
            finished: r.finished,
            finishTimeSeconds: r.finishTime,
            rank: r.rank,
            color: selectedCar.bodyColor
          }))}
          onRestart={handleRestartRace}
          onNextQuote={handleRestartRace}
          onSaveScore={() => {}}
          hasSaved={true}
        />
      )}

      {/* 7. Mashina Tanlash Modali */}
      {isCarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-[#090e1c] border border-cyan-500/40 rounded-2xl shadow-2xl p-4 sm:p-5 text-slate-100">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <span>🏎️</span> Poyga Mashinasini Tanlang
              </h3>
              <button
                type="button"
                onClick={() => setIsCarModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <CarSelector
              selectedCarId={carId}
              onSelectCar={(newCarId) => {
                if (onChangeCar) onChangeCar(newCarId);
                try {
                  localStorage.setItem('tg_user_car', newCarId);
                } catch {
                  // ignore
                }
                setIsCarModalOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* 8. Ismni Tahrirlash Modali */}
      {isNameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm bg-[#090e1c] border border-cyan-500/40 rounded-2xl shadow-2xl p-4 text-slate-100">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <span>👤</span> Ismingizni Kiriting
              </h3>
              <button
                type="button"
                onClick={() => setIsNameModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveName} className="space-y-3">
              <div>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Ismingizni kiriting..."
                  required
                  autoFocus
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl text-white text-xs outline-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNameModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-xl cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
