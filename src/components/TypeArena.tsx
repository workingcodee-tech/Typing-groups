import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Quote, Participant, RaceStats } from '../types';
import { sounds } from '../utils/soundEffects';
import { RaceTrack } from './RaceTrack';
import { VirtualKeyboard } from './VirtualKeyboard';
import { RotateCcw, Play, Zap, Target, Clock, Keyboard, Eye, EyeOff, Timer } from 'lucide-react';

interface TypeArenaProps {
  quote: Quote;
  onFinish: (stats: RaceStats, participants: Participant[]) => void;
  botRacers: { name: string; avatar: string; targetWpm: number; color: string }[];
  isGroupRace: boolean;
  onNextQuote: () => void;
}

export const TypeArena: React.FC<TypeArenaProps> = ({
  quote,
  onFinish,
  botRacers,
  isGroupRace,
  onNextQuote
}) => {
  // Belgilangan vaqt rejimi (15s, 30s, 60s yoki 0 = to'liq matn)
  const [timeLimit, setTimeLimit] = useState<number>(30); // standart 30 soniya
  const [userInput, setUserInput] = useState<string>('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [wpmHistory, setWpmHistory] = useState<number[]>([]);
  const [keystrokes, setKeystrokes] = useState<number>(0);
  const [showKeyboard, setShowKeyboard] = useState<boolean>(true);
  const [showTrack, setShowTrack] = useState<boolean>(true);
  const [errorsByChar, setErrorsByChar] = useState<Record<string, number>>({});

  // Poyga boshlanishi oldidan ortga sanash (3, 2, 1, BOSHLANG!)
  const [countdown, setCountdown] = useState<number | null>(null);

  // Poyga ishtirokchilari
  const [participants, setParticipants] = useState<Participant[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerIntervalRef = useRef<number | null>(null);

  const targetText = quote.text;

  // Ishtirokchilarni shakllantirish
  const initParticipants = useCallback(() => {
    const list: Participant[] = [
      {
        id: 'user-self',
        name: 'Siz',
        avatar: '⚡',
        isUser: true,
        progress: 0,
        currentWpm: 0,
        rawWpm: 0,
        accuracy: 100,
        finished: false,
        color: '#00E5FF'
      }
    ];

    if (isGroupRace) {
      botRacers.forEach((bot, index) => {
        list.push({
          id: `bot-${index}`,
          name: bot.name,
          avatar: bot.avatar,
          isUser: false,
          progress: 0,
          currentWpm: 0,
          rawWpm: 0,
          accuracy: Math.floor(96 + Math.random() * 4),
          finished: false,
          color: bot.color,
          targetWpm: bot.targetWpm + Math.floor(Math.random() * 10 - 5)
        });
      });
    }

    setParticipants(list);
  }, [isGroupRace, botRacers]);

  // Sinovni qayta boshlash
  const resetSession = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setUserInput('');
    setStartTime(null);
    setElapsedTime(0);
    setIsFinished(false);
    setWpmHistory([]);
    setKeystrokes(0);
    setErrorsByChar({});
    setCountdown(null);
    initParticipants();

    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, [initParticipants]);

  // Guruh poygasini ortga hisoblash bilan boshlash
  const startGroupCountdown = useCallback(() => {
    resetSession();
    setCountdown(3);
    sounds.playCountdown(3);

    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        sounds.playCountdown(count);
      } else if (count === 0) {
        setCountdown(0);
        sounds.playCountdown(0);
      } else {
        clearInterval(interval);
        setCountdown(null);
        setStartTime(Date.now());
        inputRef.current?.focus();
      }
    }, 1000);
  }, [resetSession]);

  useEffect(() => {
    resetSession();
  }, [quote, resetSession]);

  // Natijani hisoblash va yakunlash funksiyasi
  const completeRace = useCallback((currentInput: string, currentDuration: number) => {
    setIsFinished(true);
    sounds.playFinish();

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    let correctChars = 0;
    let incorrectChars = 0;
    for (let i = 0; i < currentInput.length; i++) {
      if (currentInput[i] === targetText[i]) {
        correctChars++;
      } else {
        incorrectChars++;
      }
    }

    const totalChars = currentInput.length;
    const durationSeconds = Math.max(1, currentDuration);
    const minutes = durationSeconds / 60;
    const finalWpm = Math.max(0, Math.round((correctChars / 5) / minutes));
    const finalRawWpm = Math.round((totalChars / 5) / minutes);
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
    const consistency = Math.max(50, Math.min(100, Math.round(100 - (incorrectChars * 3))));
    const efficiency = Math.round((finalWpm * 0.7) + (accuracy * 0.3));

    // Ishtirokchilarning yakuniy o'rinlarini aniqlash
    const currentRacerList = participants.map((p) => {
      if (p.isUser) {
        return {
          ...p,
          progress: Math.min(100, (currentInput.length / targetText.length) * 100),
          currentWpm: finalWpm,
          rawWpm: finalRawWpm,
          accuracy,
          finished: true,
          finishTimeSeconds: durationSeconds
        };
      }
      return p;
    });

    const sortedRacers = [...currentRacerList].sort((a, b) => {
      if (a.finished && b.finished) {
        return (a.finishTimeSeconds || 999) - (b.finishTimeSeconds || 999);
      }
      return (b.currentWpm || 0) - (a.currentWpm || 0);
    });

    const userRank = sortedRacers.findIndex((p) => p.isUser) + 1;

    const finalStats: RaceStats = {
      wpm: finalWpm,
      rawWpm: finalRawWpm,
      accuracy,
      efficiency,
      correctChars,
      incorrectChars,
      totalChars,
      timeSeconds: durationSeconds,
      timeLimitSeconds: timeLimit > 0 ? timeLimit : undefined,
      wpmHistory: wpmHistory.length > 0 ? wpmHistory : [finalWpm],
      consistency,
      keystrokes: keystrokes + 1,
      errorsByChar,
      userRank,
      totalRacers: sortedRacers.length
    };

    onFinish(finalStats, sortedRacers);
  }, [targetText, participants, timeLimit, wpmHistory, keystrokes, errorsByChar, onFinish]);

  // Taymer va botlar harakati
  useEffect(() => {
    if (startTime && !isFinished) {
      timerIntervalRef.current = window.setInterval(() => {
        const now = Date.now();
        const seconds = (now - startTime) / 1000;
        setElapsedTime(seconds);

        // Agar belgilangan vaqt (masalan 15s, 30s, 60s) tugagan bo'lsa
        if (timeLimit > 0 && seconds >= timeLimit) {
          completeRace(userInput, timeLimit);
          return;
        }

        // Jonli statistika
        const charsTyped = userInput.length;
        let correctCount = 0;
        for (let i = 0; i < charsTyped; i++) {
          if (userInput[i] === targetText[i]) {
            correctCount++;
          }
        }

        const minutes = Math.max(0.01, seconds / 60);
        const liveWpm = Math.round((correctCount / 5) / minutes);
        const liveRaw = Math.round((charsTyped / 5) / minutes);
        const userProgress = Math.min(100, (charsTyped / targetText.length) * 100);

        setWpmHistory((prev) => [...prev, liveWpm].slice(-40));

        // Botlarning poygadagi harakati
        setParticipants((prev) =>
          prev.map((p) => {
            if (p.isUser) {
              return {
                ...p,
                progress: userProgress,
                currentWpm: liveWpm,
                rawWpm: liveRaw,
                accuracy: charsTyped > 0 ? Math.round((correctCount / charsTyped) * 100) : 100
              };
            }

            if (p.finished) return p;

            const botSpeed = p.targetWpm || 80;
            const targetCharsPerSec = (botSpeed * 5) / 60;
            const variance = 1 + (Math.sin(seconds * 1.5 + Number(p.id.replace('bot-', ''))) * 0.15);
            const botChars = targetCharsPerSec * variance * seconds;
            const botProgress = Math.min(100, (botChars / targetText.length) * 100);
            const botFinished = botProgress >= 100;

            return {
              ...p,
              progress: botProgress,
              currentWpm: Math.round(botSpeed * variance),
              finished: botFinished,
              finishTimeSeconds: botFinished ? seconds : undefined
            };
          })
        );
      }, 200);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [startTime, isFinished, userInput, targetText, timeLimit, completeRace]);

  // Klaviatura orqali yozish hodisasi
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (countdown !== null) return;

    const value = e.target.value;
    if (value.length > targetText.length) return;

    if (!startTime) {
      setStartTime(Date.now());
    }

    const currentIdx = value.length - 1;
    const lastCharTyped = value[currentIdx];
    const expectedChar = targetText[currentIdx];
    const isError = lastCharTyped !== expectedChar;

    if (value.length > userInput.length) {
      setKeystrokes((prev) => prev + 1);

      if (isError) {
        sounds.playKey(lastCharTyped, false, true);
        setErrorsByChar((prev) => ({
          ...prev,
          [expectedChar]: (prev[expectedChar] || 0) + 1
        }));
      } else {
        const isSpace = lastCharTyped === ' ';
        sounds.playKey(lastCharTyped, isSpace, false);
      }
    }

    setUserInput(value);

    // Matn to'liq yozib bo'lingan holat
    if (value.length === targetText.length) {
      const finalTime = (Date.now() - (startTime || Date.now())) / 1000;
      completeRace(value, finalTime);
    }
  };

  // Tezkor tugmalar (Tab + Enter: qayta boshlash, Esc: chiqish)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        resetSession();
      } else if (e.key === 'Escape') {
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetSession]);

  // Jonli hisob-kitoblar
  const minutes = Math.max(0.01, elapsedTime / 60);
  let correctCount = 0;
  for (let i = 0; i < userInput.length; i++) {
    if (userInput[i] === targetText[i]) correctCount++;
  }
  const currentWpm = startTime ? Math.round((correctCount / 5) / minutes) : 0;
  const currentAccuracy = userInput.length > 0 ? Math.round((correctCount / userInput.length) * 100) : 100;
  const totalCharactersTyped = userInput.length;
  const totalErrors = userInput.length - correctCount;

  // Qolgan vaqt (agar belgilangan vaqt tanlangan bo'lsa)
  const remainingTime = timeLimit > 0 ? Math.max(0, timeLimit - elapsedTime) : elapsedTime;

  const nextChar = targetText[userInput.length] || '';
  const lastCharIsError = userInput.length > 0 && userInput[userInput.length - 1] !== targetText[userInput.length - 1];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-5">
      {/* Jonli poyga yo'lagi (Guruh ko'rinishi) */}
      {showTrack && <RaceTrack participants={participants} />}

      {/* Belgilangan Soniyani Tanlash va Boshqaruv Tasmasi */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#090e1a] border border-slate-800/80 rounded-xl text-xs">
        {/* Belgilangan Soniya Rejimi (15s, 30s, 60s, Cheklovlarsiz) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-lg">
          <span className="text-slate-400 px-2 flex items-center gap-1 text-[11px] font-medium">
            <Timer className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Belgilangan vaqt:</span>
          </span>
          {[
            { label: '15 soniya', val: 15 },
            { label: '30 soniya', val: 30 },
            { label: '60 soniya', val: 60 },
            { label: 'Toʻliq matn', val: 0 }
          ].map((mode) => (
            <button
              key={mode.val}
              onClick={() => {
                setTimeLimit(mode.val);
                resetSession();
              }}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                timeLimit === mode.val
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Jonli Metrikalar */}
        <div className="flex items-center gap-4 font-mono-numbers">
          <div className="flex items-center gap-1.5" title="Daqiqasiga soʻzlar soni">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400 hidden sm:inline">Tezlik:</span>
            <span className="text-sm sm:text-base font-bold text-cyan-300">{currentWpm} WPM</span>
          </div>

          <div className="flex items-center gap-1.5" title="Samaradorlik aniqligi">
            <Target className="w-4 h-4 text-blue-400" />
            <span className="text-slate-400 hidden sm:inline">Aniqlik:</span>
            <span className="text-sm sm:text-base font-bold text-white">{currentAccuracy}%</span>
          </div>

          <div className="flex items-center gap-1.5" title="Belgilar va xatolar soni">
            <span className="text-slate-400 hidden sm:inline">Belgilar:</span>
            <span className="text-xs sm:text-sm font-semibold text-slate-200">
              {totalCharactersTyped} ta <span className="text-rose-400">({totalErrors} xato)</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-sky-400" />
            <span className="text-slate-400 hidden sm:inline">
              {timeLimit > 0 ? 'Qoldi:' : 'Vaqt:'}
            </span>
            <span className={`text-sm sm:text-base font-bold font-mono-numbers ${
              timeLimit > 0 && remainingTime <= 5 ? 'text-rose-400 animate-pulse' : 'text-white'
            }`}>
              {remainingTime.toFixed(1)}s
            </span>
          </div>
        </div>

        {/* Tugmalar va yo'riqnomalar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTrack((prev) => !prev)}
            className="flex items-center gap-1 px-2 py-1 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors"
            title="Poyga yoʻlagini yoqish/oʻchirish"
          >
            {showTrack ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">Yoʻlak</span>
          </button>

          <button
            onClick={() => setShowKeyboard((prev) => !prev)}
            className="flex items-center gap-1 px-2 py-1 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors"
            title="Klaviatura koʻrsatkichini yoqish/oʻchirish"
          >
            <Keyboard className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Klaviatura</span>
          </button>

          <button
            onClick={resetSession}
            className="flex items-center gap-1 px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            title="Qayta boshlash (Tab+Enter)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Qayta</span>
          </button>

          <button
            onClick={startGroupCountdown}
            className="flex items-center gap-1.5 px-3 py-1 font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Poygani Boshlash</span>
          </button>
        </div>
      </div>

      {/* Ortga sanash oynasi */}
      {countdown !== null && (
        <div className="p-8 bg-cyan-950/40 border border-cyan-500/50 rounded-2xl text-center animate-pulse">
          <div className="text-5xl font-black text-cyan-300 font-mono-numbers">
            {countdown === 0 ? 'YOZING!' : countdown}
          </div>
          <p className="text-xs text-cyan-400 mt-2 font-semibold tracking-wider uppercase">
            Barmoqlaringizni asosiy qatorga tayyorlang
          </p>
        </div>
      )}

      {/* Asosiy Yozish Maydoni */}
      <div
        onClick={() => inputRef.current?.focus()}
        className="relative min-h-[170px] sm:min-h-[200px] p-6 sm:p-8 bg-[#090e1c] border-2 border-slate-800 focus-within:border-cyan-500/80 rounded-2xl shadow-xl transition-all duration-200 cursor-text select-none text-lg sm:text-xl md:text-2xl font-mono leading-relaxed tracking-wide"
      >
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInputChange}
          className="absolute inset-0 opacity-0 cursor-default"
          autoFocus
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Yozish maydoni"
        />

        {/* Belgilarni bo'yash: to'g'ri = yorqin oq/tsian, noto'g'ri = qizil, yozilmagan = kulrang */}
        <div className="flex flex-wrap items-center">
          {targetText.split('').map((char, index) => {
            const isTyped = index < userInput.length;
            const isCurrent = index === userInput.length;
            const typedChar = userInput[index];
            const isCorrect = isTyped && typedChar === char;
            const isIncorrect = isTyped && typedChar !== char;

            let charClass = 'text-slate-500 transition-colors duration-75';

            if (isCorrect) {
              charClass = 'text-cyan-300 font-semibold';
            } else if (isIncorrect) {
              charClass = 'text-rose-500 underline decoration-rose-500/80 bg-rose-950/40 rounded px-0.5';
            }

            return (
              <span key={index} className="relative inline-block whitespace-pre">
                {isCurrent && (
                  <span className="typing-caret absolute -left-0.5 top-1 bottom-1 w-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#00e5ff]" />
                )}
                <span className={charClass}>{char}</span>
              </span>
            );
          })}
        </div>

        {/* Manba va keyingi matn tugmasi */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 font-sans">
          <div className="flex items-center gap-2">
            <span className="text-slate-300 italic">“{quote.source}”</span>
            <span>·</span>
            <span className="capitalize">{quote.category}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNextQuote();
            }}
            className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline transition-colors"
          >
            Boshqa Matnni Tanlash →
          </button>
        </div>
      </div>

      {/* Mobil moslama yordamchisi */}
      <div className="sm:hidden text-center text-xs text-slate-400">
        Klaviaturani chiqarish uchun yuqoridagi matn ustiga bosing
      </div>

      {/* Virtual klaviatura yo'riqnomasi */}
      {showKeyboard && (
        <VirtualKeyboard nextChar={nextChar} isError={lastCharIsError} />
      )}
    </div>
  );
};
