import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { HighwayRaceTrack, HighwayRacer } from './HighwayRaceTrack';
import { WordsTypingArena, getTargetCharsForDistance } from './WordsTypingArena';
import { RaceResultsModal } from './RaceResultsModal';
import { FinishCelebrationOverlay } from './FinishCelebrationOverlay';
import { CarSelector } from './CarSelector';
import { generate5000Words, GameLanguage } from '../data/words';
import { RaceStats, DifficultyLevel } from '../types';
import { Users, Volume2, VolumeX, X, Edit3, Globe, Play, RotateCcw, LogOut } from 'lucide-react';
import { FAMOUS_CARS } from '../data/cars';
import { sounds, SwitchSoundType } from '../utils/soundEffects';
import { sortRacersByRank } from '../utils/raceRanking';

interface SoloRaceArenaProps {
  userName: string;
  carId: string;
  initialDifficulty?: DifficultyLevel;
  initialDistance?: number;
  initialLanguage?: GameLanguage;
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
  initialLanguage = 'uz',
  onBack,
  onOpenMultiplayer,
  onChangeCar,
  onChangeName,
  soundType,
  onToggleSound
}) => {
  const [language, setLanguage] = useState<GameLanguage>(initialLanguage);
  const [wordsList, setWordsList] = useState<string[]>(() => generate5000Words(300, initialLanguage));
  const [raceStats, setRaceStats] = useState<RaceStats | null>(null);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [showDetailedModal, setShowDetailedModal] = useState<boolean>(false);
  const [isCarModalOpen, setIsCarModalOpen] = useState<boolean>(false);
  const [isNameModalOpen, setIsNameModalOpen] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>(userName);

  const [selectedDistance, setSelectedDistance] = useState<number>(initialDistance);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(initialDifficulty);

  // initialDistance o'zgarganda yangilash
  useEffect(() => {
    if (initialDistance && initialDistance !== selectedDistance) {
      setSelectedDistance(initialDistance);
    }
  }, [initialDistance]);

  // initialDifficulty o'zgarganda yangilash
  useEffect(() => {
    if (initialDifficulty && initialDifficulty !== difficulty) {
      setDifficulty(initialDifficulty);
    }
  }, [initialDifficulty]);

  // initialLanguage o'zgarganda yangilash
  useEffect(() => {
    if (initialLanguage && initialLanguage !== language) {
      setLanguage(initialLanguage);
      setWordsList(generate5000Words(300, initialLanguage));
    }
  }, [initialLanguage, language]);

  // 3-2-1 Countdown va Pauza holati
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isRaceActive, setIsRaceActive] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const raceStartTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number | null>(null);

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

  // Yakka poygaga kirganda avtomatik 3-2-1 hisoblagich bilan boshlash
  useEffect(() => {
    startCountdown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Botlarning masofaga va qiyinlik darajasiga qarab SILIQ HARAKATLANISHI (40ms yangilanish, sakrashlarsiz)
  useEffect(() => {
    if (!isRaceActive || raceStats || isPaused) {
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

    let lastRankCheck = 0;
    botIntervalRef.current = window.setInterval(() => {
      if (!raceStartTimeRef.current || isPaused) return;
      const now = Date.now();
      const elapsedSeconds = (now - raceStartTimeRef.current) / 1000;

      setRacers((prev) => {
        const updated = prev.map((racer) => {
          if (racer.isUser || racer.finished) return racer;

          const wpm = botSpeeds[racer.id] || 45;
          const wordsTyped = elapsedSeconds * (wpm / 60);
          const rawProgress = (wordsTyped / targetWords) * 100;
          const progress = Math.min(100, Number(rawProgress.toFixed(2)));

          return {
            ...racer,
            progress,
            currentWpm: wpm,
            finished: progress >= 100,
            finishTime: progress >= 100 && !racer.finishTime ? Number(elapsedSeconds.toFixed(1)) : racer.finishTime
          };
        });

        // Reytingni har 200ms da bir yoki marraga yetganda yangilaymiz (CPU yuklamasini kamaytirib, harakatni 100% silliq qiladi)
        if (now - lastRankCheck > 200 || updated.some(r => r.finished && !prev.find(p => p.id === r.id)?.finished)) {
          lastRankCheck = now;
          const sorted = sortRacersByRank(updated);
          const rankMap = new Map(sorted.map((r, i) => [r.id, i + 1]));

          return updated.map((r) => ({
            ...r,
            rank: rankMap.get(r.id) || 1
          }));
        }

        return updated;
      });
    }, 40);

    return () => {
      if (botIntervalRef.current) {
        clearInterval(botIntervalRef.current);
      }
    };
  }, [isRaceActive, raceStats, isPaused, selectedDistance, difficulty]);

  // Foydalanuvchi klaviaturada yozganda progress yangilanishi (Tezkor va silliq)
  const lastUserProgressUpdateRef = useRef<number>(0);

  const handleProgressUpdate = useCallback((
    userProgress: number,
    wpm: number,
    accuracy: number,
    _chars: number,
    _errors: number,
    _currentMeters: number
  ) => {
    const now = Date.now();
    const isFinished = userProgress >= 100;
    // Har bir harf trassada sakramasdan tezkor va silliq siljishi uchun 25ms
    if (!isFinished && now - lastUserProgressUpdateRef.current < 25) {
      return;
    }
    lastUserProgressUpdateRef.current = now;

    setRacers((prev) => {
      const updated = prev.map((racer) => {
        if (!racer.isUser) return racer;
        const formattedProgress = Number(userProgress.toFixed(2));
        // Poyga vaqtida mashina hech qachon orqaga sakramasligi uchun monoton progress
        const safeProgress = (racer.progress > 0 && formattedProgress < racer.progress && !racer.finished)
          ? racer.progress
          : formattedProgress;
        return {
          ...racer,
          progress: safeProgress,
          currentWpm: wpm,
          accuracy,
          finished: userProgress >= 100
        };
      });

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

  const handlePauseToggle = useCallback(() => {
    setIsPaused(true);
    pausedTimeRef.current = Date.now();
  }, []);

  const handleResumeRace = useCallback(() => {
    if (pausedTimeRef.current && raceStartTimeRef.current) {
      const pauseDuration = Date.now() - pausedTimeRef.current;
      raceStartTimeRef.current += pauseDuration;
    }
    pausedTimeRef.current = null;
    setIsPaused(false);
  }, []);

  const handleRestartRace = useCallback((langToUse?: GameLanguage) => {
    const activeLang = langToUse || language;
    setIsPaused(false);
    pausedTimeRef.current = null;
    setRaceStats(null);
    setShowCelebration(false);
    setShowDetailedModal(false);
    setWordsList(generate5000Words(300, activeLang));
    startCountdown();
  }, [language, startCountdown]);

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
    setWordsList(generate5000Words(300, language));
    startCountdown();
  }, [language, startCountdown]);

  const handleDifficultyChange = useCallback((newDiff: DifficultyLevel) => {
    setDifficulty(newDiff);
    setRaceStats(null);
    setShowCelebration(false);
    setShowDetailedModal(false);
    setWordsList(generate5000Words(300, language));
    startCountdown();
  }, [language, startCountdown]);

  const handleToggleLanguage = () => {
    const nextLang: GameLanguage = language === 'uz' ? 'en' : 'uz';
    setLanguage(nextLang);
    try {
      localStorage.setItem('tg_game_lang', nextLang);
    } catch {
      // ignore
    }
    handleRestartRace(nextLang);
  };

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
        {/* Chap qism: O'yin Logosi, Nomi va Rejim */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Dumaloq O'yin Logosi */}
          <div
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full p-0.5 bg-gradient-to-tr from-cyan-400 via-blue-500 to-emerald-400 shadow-[0_0_16px_rgba(6,182,212,0.5)] shrink-0 flex items-center justify-center hover:scale-105 transition-transform"
            title="Type Groups"
          >
            <img
              src="/type-groups-logo.png"
              alt="Type Groups Logo"
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          {/* O'yin Nomi */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-emerald-950/90 to-slate-900 border border-emerald-500/40 rounded-xl shadow-sm">
            <span className="text-xs sm:text-sm font-black tracking-tight text-white font-mono">
              TYPE <span className="text-emerald-400">GROUPS</span>
            </span>
          </div>

          {/* Rejim: Yakka Poyga */}
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-slate-900/90 border border-slate-700/70 rounded-xl text-xs font-bold text-slate-300">
            <span>🏁</span>
            <span>Yakka Poyga</span>
          </div>
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

          {/* Masofa: 50m, 100m, 200m, 500m, 1000m, 1500m */}
          <div className="hidden md:flex items-center p-0.5 bg-slate-900/90 border border-slate-800 rounded-xl text-[10px] font-mono font-bold">
            {[50, 100, 200, 500, 1000, 1500].map((dist) => (
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

        {/* O'ng qism: Ovoz, Til va TUGATISH (Chiqish) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Til almashtirish (O'zbekcha / English) */}
          <button
            type="button"
            onClick={handleToggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-950/80 hover:bg-blue-900 border border-blue-500/50 rounded-xl text-blue-300 font-bold text-xs cursor-pointer transition-colors"
            title="Oʻyin tilini almashtirish (Oʻzbekcha / English)"
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>{language === 'en' ? '🇬🇧 EN' : '🇺🇿 UZ'}</span>
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

          {/* TO'XTATISH TUGMASI (STOP / PAUSE) */}
          <button
            type="button"
            onClick={handlePauseToggle}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-rose-950 to-red-950 hover:from-rose-900 hover:to-red-900 border-2 border-rose-500/80 hover:border-rose-400 text-rose-100 hover:text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-rose-950/60 cursor-pointer active:scale-95 group"
            title="Poygani toʻxtatish (Pauza / Bosh sahifaga qaytish)"
          >
            <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 group-hover:scale-110 transition-transform shadow-xs shadow-rose-400" />
            <span>Toʻxtatish</span>
          </button>
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
              language={language}
              onProgressUpdate={handleProgressUpdate}
              onFinish={handleFinish}
              isGameActive={isRaceActive && !isPaused}
              countdownActive={countdown !== null}
              selectedDistance={selectedDistance}
              onDistanceChange={handleDistanceChange}
              onRestart={() => handleRestartRace()}
              userRank={userLiveRank}
              totalRacers={racers.length}
            />
          );
        })()}
      </div>

      {/* POYGA TO'XTATILGANDA (PAUSE) MODALI */}
      {isPaused && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-backdrop-fade">
          <div className="relative w-full max-w-sm bg-[#0a0f1d] border-2 border-amber-500/50 rounded-3xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.3)] space-y-4 text-center animate-modal-pop text-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto text-2xl shadow-lg shadow-amber-500/20">
              ⏸️
            </div>
            <div>
              <h3 className="text-xl font-black text-white font-mono">Poyga Toʻxtatildi</h3>
              <p className="text-xs text-slate-400 mt-1">
                Poygani davom ettirishingiz, qayta boshlashingiz yoki bosh sahifaga chiqishingiz mumkin
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleResumeRace}
                className="w-full py-3 bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-500/30 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Davom Ettirish</span>
              </button>

              <button
                type="button"
                onClick={() => handleRestartRace()}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
              >
                <RotateCcw className="w-4 h-4 text-cyan-400" />
                <span>Qayta Boshlash</span>
              </button>

              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="w-full py-3 bg-rose-950/80 hover:bg-rose-900 border border-rose-600/70 text-rose-200 hover:text-white font-bold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Bosh Sahifaga Chiqish</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. G'alaba Animatsiyasi (FinishCelebrationOverlay) */}
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
