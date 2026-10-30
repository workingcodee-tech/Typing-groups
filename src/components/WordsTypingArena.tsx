import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sounds } from '../utils/soundEffects';
import { RotateCcw, Flag } from 'lucide-react';
import { RaceStats } from '../types';
import { AnalogSpeedometer } from './AnalogSpeedometer';
import { generate5000Words } from '../data/words';

interface WordsTypingArenaProps {
  wordsList: string[]; // 5000 ta tasodifiy inglizcha so'zlar
  onProgressUpdate: (progress: number, wpm: number, accuracy: number, chars: number, errors: number, currentMeters: number) => void;
  onFinish: (stats: RaceStats) => void;
  isGameActive: boolean;
  countdownActive?: boolean;
  selectedDistance?: number;
  onDistanceChange?: (meters: number) => void;
  onRestart?: () => void;
  startTimeMs?: number | null; // Sinxron poyga start vaqti (millisoniyalarda)
  userRank?: number; // Foydalanuvchining joriy jonli o'rni (1-o'rin, 2-o'rin...)
  totalRacers?: number; // Jami poygachilar soni
}

interface WordHistoryItem {
  input: string;
  isCorrect: boolean;
}

// Masofa bo'yicha talab qilinadigan to'g'ri belgilar soni
export const DISTANCE_TARGETS: Record<number, number> = {
  50: 50,     // ~10 so'z
  100: 100,   // ~20 so'z
  200: 190,   // ~38 so'z
  500: 450,   // ~80 so'z
  1000: 850,  // ~160 so'z
  1500: 1250  // ~240 so'z
};

export const getTargetCharsForDistance = (meters: number): number => {
  if (DISTANCE_TARGETS[meters]) return DISTANCE_TARGETS[meters];
  return Math.max(25, Math.round(meters * 0.9));
};

export const WordsTypingArena = React.memo<WordsTypingArenaProps>(({
  wordsList,
  onProgressUpdate,
  onFinish,
  isGameActive,
  countdownActive = false,
  selectedDistance: externalDistance,
  onDistanceChange,
  onRestart,
  startTimeMs = null,
  userRank,
  totalRacers = 4
}) => {
  const [distance, setDistance] = useState<number>(externalDistance || 100);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(true);

  // So'zlar tugab qolmasligi uchun aktiv so'zlar ro'yxati (har doim kamida 250-500 ta so'z)
  const [activeWords, setActiveWords] = useState<string[]>(() => {
    if (wordsList && wordsList.length >= 120) return wordsList;
    return wordsList && wordsList.length > 0
      ? [...wordsList, ...generate5000Words(300)]
      : generate5000Words(500);
  });

  useEffect(() => {
    if (wordsList && wordsList.length > 0) {
      if (wordsList.length < 150) {
        setActiveWords([...wordsList, ...generate5000Words(300)]);
      } else {
        setActiveWords(wordsList);
      }
    } else {
      setActiveWords(generate5000Words(500));
    }
  }, [wordsList]);

  // Statistika
  const [totalCorrectChars, setTotalCorrectChars] = useState<number>(0);
  const [totalIncorrectChars, setTotalIncorrectChars] = useState<number>(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState<number>(0);
  const [wpmHistory, setWpmHistory] = useState<number[]>([]);
  const [wordHistory, setWordHistory] = useState<Record<number, WordHistoryItem>>({});

  // Single-line gorizontal siljish (x-axis transform)
  const [scrollX, setScrollX] = useState<number>(0);
  const wordsContainerRef = useRef<HTMLDivElement>(null);
  const wordsRowRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);

  const onProgressUpdateRef = useRef(onProgressUpdate);
  onProgressUpdateRef.current = onProgressUpdate;

  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  // Tashqi masofa o'zgarganda yangilash
  useEffect(() => {
    if (externalDistance && externalDistance !== distance) {
      setDistance(externalDistance);
    }
  }, [externalDistance, distance]);

  const targetChars = getTargetCharsForDistance(distance);

  const countdownActiveRef = useRef(countdownActive);
  countdownActiveRef.current = countdownActive;

  // Qayta boshlash (Faqat ichki holatni tozalaydi)
  const handleReset = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCurrentWordIndex(0);
    setCurrentInput('');
    setStartTime(null);
    setElapsedTime(0);
    setIsFinished(false);
    setTotalCorrectChars(0);
    setTotalIncorrectChars(0);
    setTotalKeystrokes(0);
    setWpmHistory([]);
    setWordHistory({});
    setScrollX(0);

    setTimeout(() => {
      if (!countdownActiveRef.current) {
        inputRef.current?.focus();
      }
    }, 50);
  }, []);

  useEffect(() => {
    handleReset();
  }, [wordsList, handleReset]);

  // Countdown tugashi bilan darhol inputga fokus qilish (Mobil va kompyuter uchun birdek)
  useEffect(() => {
    if (!countdownActive && isGameActive && !isFinished) {
      inputRef.current?.focus();
    }
  }, [countdownActive, isGameActive, isFinished]);

  // Foydalanuvchi qo'lda tugma bosganda qayta boshlash
  const handleManualRestart = useCallback(() => {
    handleReset();
    if (onRestart) {
      onRestart();
    }
  }, [handleReset, onRestart]);

  // Masofa o'zgarganda qayta boshlash
  const handleSelectDistance = (newDist: number) => {
    setDistance(newDist);
    if (onDistanceChange) {
      onDistanceChange(newDist);
    }
    handleReset();
  };

  // Sinovni yakunlash (Masofani bosib o'tganda)
  const finishSession = useCallback((finalDuration: number, finalCorrectChars: number) => {
    setIsFinished(true);
    sounds.playFinish();

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const duration = startTime
      ? Math.max(0.1, (Date.now() - startTime) / 1000)
      : Math.max(0.5, finalDuration);
    const minutes = duration / 60;
    const totalChars = finalCorrectChars + totalIncorrectChars;

    const finalWpm = totalChars > 0 ? Math.max(0, Math.round((finalCorrectChars / 5) / minutes)) : 0;
    const finalRawWpm = totalChars > 0 ? Math.round((totalChars / 5) / minutes) : 0;
    const accuracy = totalChars > 0 ? Math.round((finalCorrectChars / totalChars) * 100) : 0;
    const consistency = totalChars > 0 ? Math.max(60, Math.min(100, Math.round(100 - (totalIncorrectChars * 3)))) : 0;
    const efficiency = totalChars > 0 ? Math.round((finalWpm * 0.7) + (accuracy * 0.3)) : 0;

    const finalStats: RaceStats = {
      wpm: finalWpm,
      rawWpm: finalRawWpm,
      accuracy,
      efficiency,
      correctChars: finalCorrectChars,
      incorrectChars: totalIncorrectChars,
      totalChars,
      timeSeconds: Number(duration.toFixed(1)),
      distanceMeters: distance,
      wpmHistory: wpmHistory.length > 0 ? wpmHistory : [finalWpm],
      consistency,
      keystrokes: totalKeystrokes,
      errorsByChar: {},
      userRank: 1,
      totalRacers: 1
    };

    onProgressUpdateRef.current(100, finalWpm, accuracy, totalChars, totalIncorrectChars, distance);
    onFinishRef.current(finalStats);
  }, [startTime, totalIncorrectChars, distance, wpmHistory, totalKeystrokes]);

  // Taymer hisobi: Sekundomer 0:00.0 dan yuqoriga qarab sanaydi (har 100ms da yangilanadi - 0.1s aniqlikda va CPU ni tejamkor qiladi)
  const lastRecordedSecRef = useRef<number>(-1);

  useEffect(() => {
    if (!isFinished && isGameActive && !countdownActive) {
      const activeStart = startTime || Date.now();
      if (!startTime) {
        setStartTime(activeStart);
      }

      timerRef.current = window.setInterval(() => {
        const now = Date.now();
        const seconds = Math.max(0, (now - activeStart) / 1000);
        setElapsedTime(seconds);

        // Tarixni har 50ms da emas, faqat har 1 soniyada 1 marta yozib boramiz (xotirani tejaydi va qotishni oldini oladi)
        const currentSec = Math.floor(seconds);
        if (currentSec !== lastRecordedSecRef.current) {
          lastRecordedSecRef.current = currentSec;
          const minutes = Math.max(0.01, seconds / 60);
          const liveWpm = Math.round((totalCorrectChars / 5) / minutes);
          setWpmHistory((prev) => [...prev, liveWpm].slice(-30));
        }
      }, 100);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [startTime, isFinished, isGameActive, countdownActive, totalCorrectChars]);

  // Single-line Gorizontal silliq siljish (Aktiv so'zni ekran kengligiga mos chapdan ushlab turadi)
  useEffect(() => {
    const activeEl = wordRefs.current[currentWordIndex];
    if (activeEl) {
      const activeLeft = activeEl.offsetLeft;
      const containerWidth = wordsContainerRef.current?.clientWidth || 360;
      const offset = containerWidth > 500 ? 120 : 40;
      const newScrollX = Math.max(0, activeLeft - offset);
      setScrollX(newScrollX);
    }
  }, [currentWordIndex]);

  // So'zni yakunlash (Kompyuterda Space yoki Mobil qurilmada probel/bo'sh joy bosilganda)
  const commitCurrentWord = useCallback((inputVal: string) => {
    const currentWord = activeWords[currentWordIndex] || '';
    const cleanInput = (inputVal || currentInput || '').trim();

    // Hatto hech narsa yozilmagan bo'lsa ham (masalan, so'zni o'tkazib yuborish uchun bo'sh joy bosilsa), keyingi so'zga o'tkazish
    const actualWord = cleanInput;
    const isMatch = actualWord.length > 0 && actualWord === currentWord;
    let wordCorrect = 0;
    let wordErrors = 0;

    if (actualWord.length > 0) {
      for (let i = 0; i < currentWord.length; i++) {
        if (actualWord[i] === currentWord[i]) {
          wordCorrect++;
        } else {
          wordErrors++;
        }
      }
      if (actualWord.length > currentWord.length) {
        wordErrors += (actualWord.length - currentWord.length);
      }
    } else {
      // Hech narsa yozilmasdan bo'sh joy bosilganda so'z harflari xato hisoblanadi
      wordErrors += currentWord.length;
    }

    const nextCorrect = totalCorrectChars + wordCorrect + (isMatch ? 1 : 0);
    const nextIncorrect = totalIncorrectChars + wordErrors;

    setTotalCorrectChars(nextCorrect);
    setTotalIncorrectChars(nextIncorrect);
    setTotalKeystrokes((prev) => prev + Math.max(1, actualWord.length + 1));

    setWordHistory((prev) => ({
      ...prev,
      [currentWordIndex]: {
        input: actualWord,
        isCorrect: isMatch
      }
    }));

    sounds.playKey(' ', true, !isMatch);
    const nextWordIdx = currentWordIndex + 1;

    // Agar so'zlar tugab qolish arafasida bo'lsa, avtomatik yana 150 ta yangi so'z qo'shish (hech qachon tugamaydi)
    if (nextWordIdx >= activeWords.length - 15) {
      setActiveWords((prev) => [...prev, ...generate5000Words(150)]);
    }

    setCurrentWordIndex(nextWordIdx);
    setCurrentInput('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }

    const progressPercent = Math.min(100, Math.max(0, (nextCorrect / targetChars) * 100));
    const currentMeters = Math.min(distance, Math.round((progressPercent / 100) * distance));

    const now = Date.now();
    const seconds = startTime ? Math.max(0.1, (now - startTime) / 1000) : 0.1;
    const minutes = seconds / 60;
    const liveWpm = Math.max(0, Math.round((nextCorrect / 5) / minutes));
    const totalChars = nextCorrect + nextIncorrect;
    const liveAccuracy = totalChars > 0 ? Math.round((nextCorrect / totalChars) * 100) : 100;

    onProgressUpdateRef.current(
      progressPercent,
      liveWpm,
      liveAccuracy,
      totalChars,
      nextIncorrect,
      currentMeters
    );

    // Agar belgilangan masofa to'liq bosib o'tilsa
    if (nextCorrect >= targetChars) {
      finishSession(seconds, nextCorrect);
    }
  }, [currentWordIndex, currentInput, activeWords, totalCorrectChars, totalIncorrectChars, targetChars, distance, startTime, finishSession]);

  // Mobil klaviaturalarda Space / Bo'sh joyni ushlash (beforeinput - mobil brauzerlarda eng aniq usul)
  const handleBeforeInput = (e: React.FormEvent<HTMLInputElement>) => {
    if (isFinished || !isGameActive || countdownActive) {
      e.preventDefault();
      return;
    }
    const native = (e as any).nativeEvent as InputEvent;
    if (!native) return;

    if (!startTime) {
      setStartTime(Date.now());
    }

    // Mobil klaviatura "Bo'sh joy" (Spacebar) yoki Enter yuborganda
    if (native.data === ' ' || native.data === '\u00A0' || native.inputType === 'insertLineBreak') {
      e.preventDefault();
      commitCurrentWord(currentInput);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      setCurrentInput('');
    }
  };

  // Harf kiritilganda (Mobil telefonlar va kompyuter uchun to'liq optimallashgan)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished || !isGameActive || countdownActive) {
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    const rawVal = e.target.value;

    if (!startTime && rawVal.length > 0) {
      setStartTime(Date.now());
    }

    // MOBIL QURILMALARDA PROBEL / BO'SH JOY BOSILGANDA (Gboard, Samsung, iOS):
    if (rawVal.includes(' ') || rawVal.includes('\u00A0') || rawVal.endsWith(' ')) {
      const cleanVal = rawVal.replace(/[\s\u00A0]+/g, '');
      commitCurrentWord(cleanVal || currentInput);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      setCurrentInput('');
      return;
    }

    const val = rawVal;
    setCurrentInput(val);

    const currentWord = wordsList[currentWordIndex] || '';
    let correctInCurrent = 0;
    for (let i = 0; i < Math.min(val.length, currentWord.length); i++) {
      if (val[i] === currentWord[i]) {
        correctInCurrent++;
      }
    }

    const effectiveCorrect = totalCorrectChars + correctInCurrent;
    const progressPercent = Math.min(100, Math.max(0, (effectiveCorrect / targetChars) * 100));
    const currentMeters = Math.min(distance, Math.round((progressPercent / 100) * distance));

    const now = Date.now();
    const seconds = startTime ? Math.max(0.1, (now - startTime) / 1000) : 0.1;
    const minutes = seconds / 60;
    const liveWpm = Math.max(0, Math.round((effectiveCorrect / 5) / minutes));
    const totalChars = effectiveCorrect + totalIncorrectChars;
    const liveAccuracy = totalChars > 0 ? Math.round((effectiveCorrect / totalChars) * 100) : 100;

    onProgressUpdateRef.current(
      progressPercent,
      liveWpm,
      liveAccuracy,
      totalChars,
      totalIncorrectChars,
      currentMeters
    );

    // Tovush effektlari
    if (val.length > currentInput.length) {
      setTotalKeystrokes((prev) => prev + (val.length - currentInput.length));
      const lastChar = val[val.length - 1];
      const targetChar = currentWord[val.length - 1];
      sounds.playKey(lastChar, false, lastChar !== targetChar);
    }

    // Agar belgilangan masofa to'liq bosib o'tilsa (progress 100%)
    if (effectiveCorrect >= targetChars) {
      finishSession(seconds, effectiveCorrect);
    }
  };

  // Klaviatura hodisalari (Fizik klaviatura va Enter uchun)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isFinished || !isGameActive || countdownActive) return;

    if (!startTime) {
      setStartTime(Date.now());
    }

    // Backspace: oldingi so'zga qaytish yoki harf o'chirish
    if (e.key === 'Backspace') {
      if (currentInput.length === 0 && currentWordIndex > 0) {
        e.preventDefault();
        const prevIdx = currentWordIndex - 1;
        const prevHistory = wordHistory[prevIdx];
        if (prevHistory) {
          sounds.playKey('Backspace', false, false);
          setCurrentWordIndex(prevIdx);
          setCurrentInput(prevHistory.input);
          setWordHistory((prev) => {
            const next = { ...prev };
            delete next[prevIdx];
            return next;
          });
        }
        return;
      }
      sounds.playKey('Backspace', false, false);
      return;
    }

    // Probel (Space) yoki Enter bosilganda keyingi so'zga o'tish
    if (e.key === ' ' || e.code === 'Space' || e.key === 'Enter') {
      e.preventDefault();
      commitCurrentWord(currentInput);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      setCurrentInput('');
      return;
    }

    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const targetChar = (wordsList[currentWordIndex] || '')[currentInput.length];
      const isError = e.key !== targetChar;
      sounds.playKey(e.key, false, isError);
    }
  };

  // Tab bilan qayta boshlash
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        handleReset();
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [handleReset]);

  // Jonli hisob-kitoblar
  const minutes = Math.max(0.01, elapsedTime / 60);
  const liveWpm = startTime && totalCorrectChars > 0 ? Math.round((totalCorrectChars / 5) / minutes) : 0;
  const currentProgressPercent = Math.min(100, Math.max(0, (totalCorrectChars / targetChars) * 100));
  const currentMeters = Math.min(distance, Math.round((currentProgressPercent / 100) * distance));

  // Rasmdagi format: 0:01.9 (sekundomer ko'rinishida)
  const formatArcadeTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const tenths = Math.floor((seconds * 10) % 10);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}.${tenths}`;
  };

  const displayWords = activeWords;

  return (
    <div className="w-full flex flex-col gap-1.5 shrink-0">
      {/* 1. TOP ARCADE HUD: WPM, O'RNINGIZ, MASOFA VA SEKUNDOMER */}
      <div className="flex items-center justify-between px-1 gap-1.5 flex-wrap sm:flex-nowrap">
        {/* Chapdagi WPM va O'RNINGIZ nishonlari */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Jonli WPM */}
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-[#111827]/90 border border-slate-700/80 rounded-xl shadow-lg backdrop-blur-xs">
            <span className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
              {liveWpm}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 font-mono tracking-wider">
              WPM
            </span>
          </div>

          {/* Jonli O'RNINGIZ nishoni (Faqat foydalanuvchining o'ziga katta va aniq ko'rinadi) */}
          {userRank !== undefined && (
            <div className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl border-2 shadow-lg transition-all animate-pulse ${
              userRank === 1
                ? 'bg-gradient-to-r from-amber-950/90 to-yellow-950/80 border-amber-400 text-amber-300 shadow-amber-500/20'
                : userRank === 2
                ? 'bg-gradient-to-r from-slate-900/90 to-slate-800/80 border-slate-400 text-slate-200 shadow-slate-500/20'
                : userRank === 3
                ? 'bg-gradient-to-r from-orange-950/90 to-amber-950/80 border-amber-600 text-amber-400 shadow-orange-500/20'
                : 'bg-slate-900/90 border-slate-700 text-slate-300'
            }`}>
              <span className="text-sm sm:text-base">
                {userRank === 1 ? '🥇' : userRank === 2 ? '🥈' : userRank === 3 ? '🥉' : '🏎️'}
              </span>
              <div className="flex flex-col text-left leading-none">
                <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-mono font-black text-amber-400">
                  OʻRNINGIZ
                </span>
                <span className="text-xs sm:text-sm font-black font-mono text-white">
                  {userRank}-oʻrin <span className="text-[10px] text-slate-400 font-normal">/{totalRacers || 4}</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* O'rtada Masofa tanlash tugmalari: 50m, 100m, 200m, 500m, 1000m, 1500m */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-0.5 bg-slate-950/90 border border-slate-800 rounded-lg shadow-inner">
            {[50, 100, 200, 500, 1000, 1500].map((dist) => (
              <button
                key={dist}
                type="button"
                onClick={() => handleSelectDistance(dist)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all cursor-pointer ${
                  distance === dist
                    ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.4)] font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
                title={`${dist} metr masofani tanlash`}
              >
                {dist}m
              </button>
            ))}
            <button
              onClick={handleManualRestart}
              className="p-1 text-slate-400 hover:text-white ml-0.5 cursor-pointer"
              title="Qayta boshlash (Tab)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Jonli masofa ko'rsatkichi */}
          <div className="hidden xs:flex items-center gap-1 px-2.5 py-0.5 bg-[#0e1726] border border-cyan-500/40 rounded-lg text-[11px] font-mono font-bold text-cyan-300">
            <Flag className="w-3 h-3 text-cyan-400" />
            <span>{currentMeters}m</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400">{distance}m</span>
          </div>
        </div>

        {/* O'ngdagi vaqt nishoni (Rasmdagi 0:01.9 kabi arcade sekundomer) */}
        <div className="px-3 py-1 bg-[#111827]/90 border border-slate-700/80 rounded-xl shadow-lg backdrop-blur-xs">
          <span className="text-lg sm:text-xl font-black text-white font-mono tracking-wider">
            {formatArcadeTime(elapsedTime)}
          </span>
        </div>
      </div>

      {/* 2. PASTKI QISM: SPIDOMETR VA BIR QATORLIK YOZISH KONSOLI (Mobil va Desktop) */}
      <div className="flex flex-row items-center gap-2 sm:gap-3 w-full">
        {/* Chapdagi Analog Spidometr (Mobilda 52px, kompyuterda 80px) */}
        <div className="shrink-0 flex items-center justify-center">
          <AnalogSpeedometer wpm={liveWpm} className="w-13 h-13 sm:w-20 sm:h-20 shrink-0" />
        </div>

        {/* O'ngdagi BIR QATORLIK monoxrom yozish maydoni (Bo'sh joyni bosganda to'g'ridan to'g'ri fokus oladi) */}
        <div
          ref={wordsContainerRef}
          onClick={() => {
            if (!isFinished) {
              inputRef.current?.focus();
            }
          }}
          className="relative flex-1 w-full h-14 sm:h-16 px-3 sm:px-4 bg-[#141b27]/95 border-2 border-slate-700/80 focus-within:border-emerald-400 rounded-2xl shadow-xl transition-all cursor-text overflow-hidden flex items-center"
        >
          {/* Native yashirin input: Mobil Safari/Chrome va kompyuter uchun to'liq optimallashgan */}
          <input
            id="race-active-input"
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={handleInputChange}
            onBeforeInput={handleBeforeInput}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            readOnly={isFinished}
            className="absolute inset-0 w-full h-full z-20 cursor-text bg-transparent border-0 outline-none p-0 m-0 text-transparent caret-transparent select-none opacity-100"
            style={{ fontSize: '16px', WebkitTapHighlightColor: 'transparent' }}
            autoFocus={!countdownActive}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            inputMode="text"
            enterKeyHint="next"
            aria-label="So'zlarni kiritish maydoni"
          />

          {/* Fokus yo'qolganda ko'rsatma va mobil uchun to'g'ridan to'g'ri klaviatura ochish tugmasi */}
          {!isFocused && !isFinished && !countdownActive && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.focus();
                setIsFocused(true);
              }}
              onTouchEnd={(e) => {
                e.stopPropagation();
                inputRef.current?.focus();
                setIsFocused(true);
              }}
              className="absolute inset-0 bg-[#0c121d]/85 backdrop-blur-[2px] flex items-center justify-center z-30 cursor-pointer"
            >
              <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-950/95 border border-emerald-500/60 px-4 py-1.5 rounded-xl animate-pulse shadow-lg flex items-center gap-2">
                <span>📱</span> Yozish uchun bosing (Klaviatura)
              </span>
            </button>
          )}

          {/* Countdown vaqtida ko'rsatma */}
          {countdownActive && (
            <div className="absolute inset-0 bg-[#0c121d]/90 backdrop-blur-xs flex items-center justify-center z-10 pointer-events-none">
              <span className="text-xs font-mono font-bold text-amber-400 animate-pulse tracking-wide">
                🚦 POYGA BOSHLANISHI KUTILMOQDA... (3-2-1)
              </span>
            </div>
          )}

          {/* SO'ZLAR GORIZONTAL STRIP (Faqat bitta qator, silliq chapga siljiydi) */}
          <div
            ref={wordsRowRef}
            style={{ transform: `translateX(-${scrollX}px)` }}
            className="transition-transform duration-150 ease-out whitespace-nowrap flex items-center text-xl sm:text-2xl font-mono leading-none tracking-normal"
          >
            {displayWords.map((word, actualIndex) => {
              const isCurrent = actualIndex === currentWordIndex;
              const isPast = actualIndex < currentWordIndex;
              const pastHistory = wordHistory[actualIndex];

              if (isCurrent) {
                return (
                  <span
                    key={actualIndex}
                    ref={(el) => { wordRefs.current[actualIndex] = el; }}
                    className="relative inline-flex items-center mr-3 select-none py-1"
                  >
                    {word.split('').map((char, cIdx) => {
                      const isTyped = cIdx < currentInput.length;
                      const typedChar = currentInput[cIdx];
                      const isCurrentChar = cIdx === currentInput.length;
                      const isCorrect = isTyped && typedChar === char;

                      return (
                        <span key={cIdx} className="relative inline-block leading-none">
                          {/* Aktiv harf ustida chaqnagan kursor */}
                          {isCurrentChar && (
                            <span className="absolute -left-[1.5px] top-0 bottom-0 w-[2.5px] bg-cyan-400 rounded-full shadow-[0_0_8px_#38bdf8] animate-pulse z-10" />
                          )}
                          <span
                            className={`transition-colors duration-75 ${
                              isTyped
                                ? isCorrect
                                ? 'text-white font-medium'
                                : 'text-rose-500 font-bold'
                                : isCurrentChar
                                ? 'text-slate-100 font-medium'
                                : 'text-slate-400'
                            }`}
                          >
                            {char}
                          </span>
                        </span>
                      );
                    })}

                    {currentInput.length >= word.length && (
                      <span className="relative inline-block w-0 leading-none">
                        <span className="absolute -left-[1.5px] top-0 bottom-0 w-[2.5px] bg-cyan-400 rounded-full shadow-[0_0_8px_#38bdf8] animate-pulse z-10" />
                      </span>
                    )}

                    {currentInput.length > word.length && (
                      currentInput.slice(word.length).split('').map((extraChar, eIdx) => (
                        <span key={`extra-${eIdx}`} className="text-rose-500 underline opacity-90 font-mono">
                          {extraChar}
                        </span>
                      ))
                    )}
                  </span>
                );
              }

              if (isPast) {
                const pastMatched = pastHistory?.isCorrect ?? true;

                return (
                  <span
                    key={actualIndex}
                    ref={(el) => { wordRefs.current[actualIndex] = el; }}
                    className={`relative inline-flex items-center mr-3 select-none py-1 transition-colors ${
                      pastMatched
                        ? 'text-slate-300'
                        : 'text-rose-400 font-medium border-b border-rose-500/60'
                    }`}
                  >
                    {word}
                  </span>
                );
              }

              // Uzoq kelajakdagi (ekranga umuman sig'maydigan) so'zlarni DOM ga yuklamaymiz (xotirani 90% tejaydi)
              if (actualIndex > currentWordIndex + 35) {
                return null;
              }

              return (
                <span
                  key={actualIndex}
                  ref={(el) => { wordRefs.current[actualIndex] = el; }}
                  className="relative inline-flex items-center mr-3 select-none py-1 text-slate-500"
                >
                  {word}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobilda poyga paytida qulay bo'lishi uchun tezkor "Bo'sh joy" (Spacebar) teginish tugmasi */}
      <div className="flex sm:hidden items-center justify-between gap-2 px-1 pt-1">
        <button
          type="button"
          onClick={() => {
            commitCurrentWord(currentInput);
            if (inputRef.current) inputRef.current.value = '';
            setCurrentInput('');
            inputRef.current?.focus();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            commitCurrentWord(currentInput);
            if (inputRef.current) inputRef.current.value = '';
            setCurrentInput('');
            inputRef.current?.focus();
          }}
          disabled={countdownActive || isFinished}
          className="flex-1 py-2.5 px-3 bg-gradient-to-r from-slate-900 via-cyan-950/60 to-slate-900 border border-cyan-500/40 active:border-cyan-300 rounded-xl text-white font-mono text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50 active:scale-98 transition-all cursor-pointer disabled:opacity-40"
        >
          <span className="text-cyan-400 text-sm font-black">␣</span>
          <span>BOʻSH JOY (SPACE)</span>
          <span className="text-[10px] text-cyan-300/70 font-normal">· Keyingi soʻz</span>
        </button>
      </div>
    </div>
  );
});
