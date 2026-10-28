import React, { useState, useEffect, useRef } from 'react';
import { doc, collection, onSnapshot, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { deleteRoomCompletely, leaveAndCleanRoom } from '../utils/cleanupRooms';
import { HighwayRaceTrack, HighwayRacer } from './HighwayRaceTrack';
import { WordsTypingArena } from './WordsTypingArena';
import { RaceResultsModal } from './RaceResultsModal';
import { FinishCelebrationOverlay } from './FinishCelebrationOverlay';
import { RaceStats, DifficultyLevel } from '../types';
import { Play, LogOut, Copy, Check, Users, Trash2, AlertCircle, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import { sortRacersByRank } from '../utils/raceRanking';
import { generate5000Words } from '../data/words';

interface MultiplayerRoomProps {
  roomId: string;
  myId: string;
  myName: string;
  myCarId: string;
  isCreator: boolean;
  onLeave: () => void;
}

export const MultiplayerRoom: React.FC<MultiplayerRoomProps> = ({
  roomId,
  myId,
  myName,
  myCarId,
  isCreator,
  onLeave
}) => {
  const [roomData, setRoomData] = useState<any>(null);
  const [participants, setParticipants] = useState<HighwayRacer[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [raceStats, setRaceStats] = useState<RaceStats | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showDetailedModal, setShowDetailedModal] = useState(false);
  const [roomClosed, setRoomClosed] = useState(false);
  const [isResettingRound, setIsResettingRound] = useState(false);

  // Butun ekran rejimi holati
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
      console.warn("Fullscreen switch error:", err);
    }
  };

  const lastUpdateRef = useRef<number>(0);
  const playedCountdownRef = useRef<number | null>(null);
  const lastRoundRef = useRef<number>(1);

  // Xonada barcha a'zolar chiqib ketsa, 1 daqiqadan (60s) so'ng avtomatik o'chirish
  useEffect(() => {
    let emptyTimer: number | null = null;
    if (roomData && participants.length === 0) {
      emptyTimer = window.setTimeout(async () => {
        try {
          const partsSnap = await getDocs(collection(db, 'rooms', roomId, 'participants'));
          if (partsSnap.empty) {
            await deleteRoomCompletely(roomId);
          }
        } catch {
          // ignore
        }
      }, 60000);
    }
    return () => {
      if (emptyTimer) clearTimeout(emptyTimer);
    };
  }, [roomId, roomData, participants.length]);

  // 1. Xona holatini kuzatish
  useEffect(() => {
    const roomRef = doc(db, 'rooms', roomId);
    const unsubRoom = onSnapshot(roomRef, (snapshot) => {
      if (!snapshot.exists()) {
        setRoomClosed(true);
        return;
      }
      const data = snapshot.data();
      setRoomData(data);

      // Server tomonidan boshqariladigan sinxron 3-2-1 START (barcha a'zolarda bir vaqtda ishlaydi)
      if (data.status === 'starting') {
        if (typeof data.countdown === 'number') {
          setCountdown(data.countdown);
          if (data.countdown !== playedCountdownRef.current) {
            playedCountdownRef.current = data.countdown;
            sounds.playCountdown(data.countdown);
          }
        }
      } else if (data.status === 'racing') {
        if (data.countdown === 0) {
          setCountdown(0);
          if (playedCountdownRef.current !== 0) {
            playedCountdownRef.current = 0;
            sounds.playCountdown(0);
          }
        } else {
          setCountdown(null);
        }
      } else {
        setCountdown(null);
        playedCountdownRef.current = null;
      }

      // Agar yangi bosqich boshlangan bo'lsa (round o'zgardi):
      if (data.round && data.round !== lastRoundRef.current) {
        lastRoundRef.current = data.round;
        // Barcha o'yinchilar uchun modallarni avtomatik yopish
        setShowCelebration(false);
        setShowDetailedModal(false);
        setRaceStats(null);
      }
    }, (error) => {
      console.warn("Xonani kuzatishda xatolik:", error);
    });

    // 2. Ishtirokchilarni kuzatish va o'rinlarni aniq hisoblash
    const participantsRef = collection(db, 'rooms', roomId, 'participants');
    const unsubParticipants = onSnapshot(participantsRef, (snapshot) => {
      const list: HighwayRacer[] = [];
      snapshot.forEach((docSnap) => {
        const p = docSnap.data();
        list.push({
          id: p.id,
          name: p.name,
          carId: p.carId || 'bmw',
          progress: p.progress || 0,
          currentWpm: p.currentWpm || 0,
          accuracy: p.accuracy || 100,
          finished: !!p.finished,
          finishTime: p.finishTime ?? p.finishTimeSeconds,
          finishTimeSeconds: p.finishTimeSeconds ?? p.finishTime,
          finishedAt: p.finishedAt,
          finishRank: p.finishRank,
          isUser: p.id === myId,
          joinedAt: p.joinedAt || p.id
        } as any);
      });

      // Aniq va adolatli saralash: Marraga yetganlar vaqt bo'yicha, yetmaganlar progress bo'yicha
      const sortedByRank = sortRacersByRank(list);

      const rankMap = new Map();
      sortedByRank.forEach((r, idx) => {
        rankMap.set(r.id, idx + 1);
      });

      // Trassada yo'laklar tartibi doimiy qoladi, lekin har bir mashinaga to'g'ri o'rin (rank) yoziladi
      const stableList = [...list].sort((a: any, b: any) => (a.joinedAt || a.id).localeCompare(b.joinedAt || b.id));
      const withRank = stableList.map((r) => ({
        ...r,
        rank: rankMap.get(r.id) || 1
      }));

      setParticipants(withRank);

      // Agar foydalanuvchi allaqachon marraga yetgan bo'lsa, uning yakuniy o'rnini sinxronlashtirish
      const myRacer = withRank.find(p => p.isUser);
      if (myRacer?.finished && myRacer.rank) {
        setRaceStats((prev) => {
          if (!prev) return null;
          if (prev.userRank !== myRacer.rank) {
            return {
              ...prev,
              userRank: myRacer.rank,
              totalRacers: withRank.length
            };
          }
          return prev;
        });
      }
    }, (error) => {
      console.warn("Ishtirokchilarni olishda xatolik:", error);
    });

    return () => {
      unsubRoom();
      unsubParticipants();
    };
  }, [roomId, myId]);

  // 3. Favqulodda xavfsizlik nazoratchisi (Watchdog):
  // Agar tarmoqda signal kechiksa ham har bir o'yinchida hisoblagich avtomatik 1.2 soniyada pasayib poyga boshlanadi
  useEffect(() => {
    if (roomData?.status === 'starting' && countdown !== null && countdown > 0) {
      const fallbackTimer = window.setTimeout(() => {
        setCountdown((prev) => (prev !== null && prev > 1 ? prev - 1 : 0));
      }, 1300);
      return () => clearTimeout(fallbackTimer);
    }
  }, [roomData?.status, countdown]);

  const myBrakeTimerRef = useRef<number | null>(null);

  // Foydalanuvchi yozayotgan paytda progressni bazaga yuborish
  const handleProgressUpdate = React.useCallback(async (progress: number, wpm: number, accuracy: number, totalChars: number, errors: number) => {
    // 1. O'yinchi mashinasini darhol silliq yangilash (tarmoq kechikishisiz)
    setParticipants((prev) => {
      let isBackward = false;
      const updated = prev.map((p) => {
        if (!p.isUser) return p;
        if (progress < p.progress) {
          isBackward = true;
        }
        return {
          ...p,
          progress,
          currentWpm: wpm,
          accuracy,
          finished: progress >= 100,
          isBraking: isBackward || p.isBraking
        };
      });

      if (isBackward) {
        if (myBrakeTimerRef.current) clearTimeout(myBrakeTimerRef.current);
        myBrakeTimerRef.current = window.setTimeout(() => {
          setParticipants((cur) => cur.map((r) => (r.isUser ? { ...r, isBraking: false } : r)));
        }, 650);
      }

      const sortedByRank = sortRacersByRank(updated);
      const rankMap = new Map();
      sortedByRank.forEach((r, idx) => {
        rankMap.set(r.id, idx + 1);
      });
      return updated.map((r) => ({
        ...r,
        rank: rankMap.get(r.id) || 1
      }));
    });

    const now = Date.now();
    if (progress < 100 && now - lastUpdateRef.current < 180) {
      return;
    }
    lastUpdateRef.current = now;

    try {
      const myRef = doc(db, 'rooms', roomId, 'participants', myId);
      await updateDoc(myRef, {
        progress,
        currentWpm: wpm,
        accuracy,
        totalChars,
        errors,
        finished: progress >= 100,
        updatedAt: new Date().toISOString()
      });
    } catch {
      // ignore
    }
  }, [roomId, myId]);

  // Marraga yetib kelganda: Aniq o'rinni hisoblash va natijalarni saqlash
  const handleFinish = React.useCallback(async (stats: RaceStats) => {
    const finishTimestamp = Date.now();
    const finishTimeSeconds = Number(stats.timeSeconds.toFixed(1));

    // Mendan oldin marraga yetganlar soni
    const alreadyFinishedRacers = participants.filter(p => !p.isUser && p.finished);
    const myRealRank = alreadyFinishedRacers.length + 1;
    const currentDistance = roomData?.targetDistance || 100;

    setRaceStats({
      ...stats,
      distanceMeters: currentDistance,
      userRank: myRealRank,
      totalRacers: participants.length
    });
    setShowCelebration(true);
    setShowDetailedModal(false);

    try {
      const myRef = doc(db, 'rooms', roomId, 'participants', myId);
      await updateDoc(myRef, {
        progress: 100,
        currentWpm: stats.wpm,
        accuracy: stats.accuracy,
        totalChars: stats.totalChars,
        errors: stats.incorrectChars,
        finished: true,
        finishTime: finishTimeSeconds,
        finishTimeSeconds: finishTimeSeconds,
        finishedAt: finishTimestamp,
        finishRank: myRealRank,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn("Marrani saqlashda xatolik:", e);
    }
  }, [roomId, myId, participants, roomData?.targetDistance]);

  // Guruh egasi (host) poyga boshlanishidan oldin masofani belgilashi
  const handleSetTargetDistance = async (newDistance: number) => {
    if (!isCreator || newDistance < 20) return;
    try {
      const wordsCount = Math.max(150, Math.ceil(newDistance * 1.5));
      const newWords = generate5000Words(wordsCount);
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
        targetDistance: newDistance,
        words: newWords
      });
    } catch (e) {
      console.warn("Masofani yangilashda xatolik:", e);
    }
  };

  // 1-bosqich: Birinchi poygani boshlash (Faqat xona yaratuvchisi boshlaydi va barcha qurilmalar bir vaqtda start oladi)
  const handleStartRace = async () => {
    if (!isCreator) return;
    try {
      const roomRef = doc(db, 'rooms', roomId);

      // 1-qadam: 3 soniya (barcha a'zolarda bir vaqtda 3 paydo bo'ladi)
      await updateDoc(roomRef, {
        status: 'starting',
        countdown: 3,
        startedAt: new Date().toISOString()
      });

      // 2-qadam: 1 soniyadan so'ng 2 raqami
      window.setTimeout(async () => {
        try {
          await updateDoc(roomRef, { countdown: 2 });
        } catch {}
      }, 1000);

      // 3-qadam: 2 soniyadan so'ng 1 raqami
      window.setTimeout(async () => {
        try {
          await updateDoc(roomRef, { countdown: 1 });
        } catch {}
      }, 2000);

      // 4-qadam: 3 soniyadan so'ng START (GO! 🏁) - barcha qurilmalarda bir xil paytda boshlanadi
      window.setTimeout(async () => {
        try {
          await updateDoc(roomRef, {
            status: 'racing',
            countdown: 0,
            racingStartedAt: Date.now()
          });
        } catch {}
      }, 3000);

      // 5-qadam: 3.8 soniyadan so'ng GO bannerini yopish
      window.setTimeout(async () => {
        try {
          await updateDoc(roomRef, { countdown: null });
        } catch {}
      }, 3800);
    } catch (e) {
      console.warn("Poygani boshlashda xatolik:", e);
    }
  };

  // 2-bosqich: KEYINGI BOSQICH / YANGI O'YIN (Faqat xona yaratuvchisi bosadi va barcha guruh a'zolari bir vaqtda boshlaydi)
  const handleNextRound = async () => {
    if (!isCreator || isResettingRound) return;
    setIsResettingRound(true);

    try {
      const targetMeters = roomData?.targetDistance || 100;
      const targetWordsCount = Math.max(150, Math.ceil(targetMeters * 1.5));
      const newWords = generate5000Words(targetWordsCount);
      const nextRoundNumber = (roomData?.round || 1) + 1;

      // Barcha ishtirokchilarning natijalarini tozalash (reset qilish)
      const participantsRef = collection(db, 'rooms', roomId, 'participants');
      const snap = await getDocs(participantsRef);
      const resetPromises = snap.docs.map((docSnap) =>
        updateDoc(docSnap.ref, {
          progress: 0,
          currentWpm: 0,
          accuracy: 100,
          totalChars: 0,
          errors: 0,
          finished: false,
          finishTime: null,
          finishTimeSeconds: null,
          finishedAt: null,
          finishRank: null,
          updatedAt: new Date().toISOString()
        })
      );
      await Promise.all(resetPromises);

      // Xonaga yangi so'zlarni yuklash va sinxron start berish
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
        words: newWords,
        round: nextRoundNumber,
        status: 'starting',
        countdown: 3,
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // 1000ms dan so'ng: 2
      window.setTimeout(async () => {
        try {
          await updateDoc(roomRef, { countdown: 2 });
        } catch {}
      }, 1000);

      // 2000ms dan so'ng: 1
      window.setTimeout(async () => {
        try {
          await updateDoc(roomRef, { countdown: 1 });
        } catch {}
      }, 2000);

      // 3000ms dan so'ng: START!
      window.setTimeout(async () => {
        try {
          await updateDoc(roomRef, {
            status: 'racing',
            countdown: 0,
            racingStartedAt: Date.now()
          });
        } catch {}
      }, 3000);

      // 3800ms dan so'ng banner yopiladi
      window.setTimeout(async () => {
        try {
          await updateDoc(roomRef, { countdown: null });
        } catch {}
      }, 3800);
    } catch (e) {
      console.warn("Keyingi bosqichga o'tishda xatolik:", e);
    } finally {
      setIsResettingRound(false);
    }
  };

  // Foydalanuvchi brauzerni yopganda yoki boshqa sahifaga o'tganda bazani avtomatik tozalash
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isCreator) {
        deleteRoomCompletely(roomId);
      } else {
        leaveAndCleanRoom(roomId, myId);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, [roomId, myId, isCreator]);

  // Guruhni tugatish (Guruh yaratuvchisi bosganda xonani yopadi va Firestore'dan barcha ma'lumotlarni o'chiradi)
  const handleDeleteRoom = async () => {
    try {
      await deleteRoomCompletely(roomId);
    } catch (e) {
      console.warn("Guruhni o'chirishda xatolik:", e);
    } finally {
      onLeave();
    }
  };

  // Guruhdan chiqish (Ishtirokchi bosganda ishtirokchilar ro'yxatidan o'chadi, xona bo'sh qolsa butunlay yo'qoladi)
  const handleParticipantLeave = async () => {
    try {
      await leaveAndCleanRoom(roomId, myId);
    } catch (e) {
      console.warn("Guruhdan chiqishda xatolik:", e);
    } finally {
      onLeave();
    }
  };

  const handleCopyId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (roomClosed) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-[#0a0f1d] border border-rose-500/40 rounded-2xl text-center space-y-3 my-auto">
        <div className="w-10 h-10 rounded-full bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
          <AlertCircle className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-white">Guruh Yakunlandi</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Ushbu xona yaratuvchi tomonidan yakunlandi va barcha maʼlumotlar toʻliq oʻchirildi.
        </p>
        <button
          onClick={onLeave}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
        >
          Bosh Sahifaga Qaytish
        </button>
      </div>
    );
  }

  // Poyga faolmi (startTimeMs bor va o'yin boshlangan yoki countdown ketmoqda)
  const isGameUnderway = roomData?.status === 'starting' || roomData?.status === 'racing';
  const wordsList = roomData?.words || [];

  // Barcha yoki g'olib marraga yetganini tekshirish
  const hasAnyoneFinished = participants.some(p => p.finished);

  return (
    <div className="w-full h-full max-w-none flex flex-col justify-between py-1.5 px-2 sm:px-4 select-none relative overflow-hidden bg-[#070b14]/70">
      {/* 1. GORIZONTAL BIR QATORLI HEADER (O'yin nomi, Guruh nomi, ID, Ishtirokchilar, Tugatish) */}
      <header className="w-full flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-5 py-2 bg-slate-950/85 border border-slate-800/80 rounded-2xl shadow-xl backdrop-blur-md shrink-0 whitespace-nowrap overflow-x-auto no-scrollbar">
        {/* Chap qism: Logo, Guruh nomi va ID */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-emerald-950/90 to-slate-900 border border-emerald-500/40 rounded-xl">
            <span className="text-sm">🏎️</span>
            <span className="text-xs sm:text-sm font-black tracking-tight text-white font-mono">
              TYPING <span className="text-emerald-400">GROUPS</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/90 border border-slate-700/70 rounded-xl text-xs font-bold text-slate-200">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span className="max-w-[120px] sm:max-w-[200px] truncate">{roomData?.name || 'Multiplayer Poyga'}</span>
          </div>

          {/* Guruh IDsi */}
          <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-950/90 border border-emerald-600/70 rounded-xl text-xs font-mono">
            <span className="text-emerald-400 font-bold">ID:</span>
            <strong className="text-white font-bold">{roomId}</strong>
            <button
              onClick={handleCopyId}
              className="ml-1 text-emerald-400 hover:text-white cursor-pointer"
              title="IDdan nusxa olish"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Markaziy qism: O'yinchi, Ishtirokchilar soni, Masofa va Bosqich */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 text-xs font-mono">
          <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-900/80 border border-slate-800 rounded-xl text-cyan-300 font-bold">
            <span>👤</span>
            <span className="max-w-[90px] sm:max-w-none truncate">{myName}</span>
          </div>

          <div className="flex items-center gap-1 px-2 py-1 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-300">
            <Users className="w-3 h-3 text-cyan-400" />
            <span>{participants.length}/10</span>
          </div>

          <div className="px-2 py-1 bg-emerald-950/80 border border-emerald-500/50 rounded-xl font-bold text-emerald-300">
            🏁 {roomData?.targetDistance || 100}m
          </div>

          {roomData?.round && roomData.round > 1 && (
            <div className="px-2 py-1 bg-cyan-950 border border-cyan-500/50 rounded-xl font-bold text-cyan-300">
              {roomData.round}-bosqich
            </div>
          )}
        </div>

        {/* O'ng qism: Host amallari, Butun ekran va TUGATISH / CHIQISH */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Butun ekran rejimi tugmasi */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-emerald-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm"
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

          {/* Yaratuvchi uchun: Birinchi poygani boshlash */}
          {isCreator && !isGameUnderway && (
            <button
              onClick={handleStartRace}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300 hover:to-green-400 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer animate-pulse active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>START RACE</span>
            </button>
          )}

          {/* Yaratuvchi uchun: Poyga tugaganda keyingi bosqichni boshlash */}
          {isCreator && isGameUnderway && hasAnyoneFinished && (
            <button
              onClick={handleNextRound}
              disabled={isResettingRound}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer animate-bounce active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isResettingRound ? 'Yuklanmoqda...' : 'KEYINGI BOSQICH 🏁'}</span>
            </button>
          )}

          {/* Guruhdan chiqish yoki xonani tugatish */}
          {isCreator ? (
            <button
              type="button"
              onClick={handleDeleteRoom}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-950/90 hover:bg-rose-900 border border-rose-600/90 text-rose-100 hover:text-white rounded-xl text-xs font-black cursor-pointer transition-all active:scale-95 shadow-md shadow-rose-950/40"
              title="Guruh poygasini butunlay tugatish va asosiy sahifaga qaytish"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Tugatish</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleParticipantLeave}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-md"
              title="Guruhdan chiqish va asosiy sahifaga qaytish"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Chiqish</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. Asosiy Asfalt Poyga Trassasi (Ekranni to'liq qamrab oladi) */}
      <div className="flex-1 min-h-0 my-1 relative flex flex-col justify-center w-full">
        <HighwayRaceTrack
          racers={participants}
          roomName={roomData?.name}
          roomId={roomId}
        />

        {/* 3... 2... 1... START! Overlay (Millisekund aniqlikda sinxron) */}
        {countdown !== null && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-xs z-30 rounded-2xl flex flex-col items-center justify-center animate-fade-in pointer-events-none">
            {/* Chiroqlar (Svetofor) */}
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
              {countdown === 0 ? 'POYGA BOSHLANDI!' : 'BARCHA OʻYINCHILAR BIR VAQTDA TAYYORLANSIN...'}
            </p>
          </div>
        )}
      </div>

      {/* 3. Spidometr va Bir Qatorlik Yozish Konsoli */}
      <div className="pt-1">
        {isGameUnderway ? (
          (() => {
            const myRacer = participants.find(p => p.isUser);
            const myLiveRank = myRacer?.rank || 1;
            return (
              <WordsTypingArena
                wordsList={wordsList}
                onProgressUpdate={handleProgressUpdate}
                onFinish={handleFinish}
                isGameActive={true}
                countdownActive={countdown !== null && countdown > 0}
                startTimeMs={roomData?.startTimeMs || null}
                selectedDistance={roomData?.targetDistance || 100}
                userRank={myLiveRank}
                totalRacers={participants.length}
              />
            );
          })()
        ) : (
          <div className="p-3 sm:p-4 bg-[#091120]/95 border border-cyan-500/40 rounded-2xl shadow-xl backdrop-blur-md">
            {isCreator ? (
              <div className="flex flex-col gap-3">
                {/* Yuqori qism: Host sarlavhasi va Start tugmasi */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-850">
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">👑</span>
                      <h4 className="text-xs sm:text-sm font-black text-white font-mono flex items-center gap-1.5">
                        Guruh Egasi Boshqaruvi
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-500/50">
                          HOST
                        </span>
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Barcha ishtirokchilar uchun trassa masofasini belgilang va poygani boshlang:
                    </p>
                  </div>

                  <button
                    onClick={handleStartRace}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300 hover:to-green-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/30 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 animate-pulse"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>START RACE (Barcha uchun)</span>
                  </button>
                </div>

                {/* Masofani tanlash bloki: 50m, 100m, 200m, 500m, 1000m */}
                <div className="text-left">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <span>🏁</span> Trassa Masofasi (Necha metr yuriladi):
                    </span>
                    <span className="text-xs font-mono font-black text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded-lg border border-cyan-500/50">
                      {roomData?.targetDistance || 100} METR
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[50, 100, 200, 500, 1000].map((dist) => {
                      const isSelected = (roomData?.targetDistance || 100) === dist;
                      return (
                        <button
                          key={dist}
                          type="button"
                          onClick={() => handleSetTargetDistance(dist)}
                          className={`py-2 px-2.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                            isSelected
                              ? 'bg-gradient-to-b from-cyan-500 to-blue-600 text-slate-950 border-cyan-300 shadow-md shadow-cyan-500/30 ring-1 ring-cyan-400 scale-[1.02]'
                              : 'bg-slate-900/90 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-600'
                          }`}
                        >
                          <span className="text-sm font-black">{dist}m</span>
                          <span className={`text-[10px] font-sans ${isSelected ? 'text-slate-950 font-bold' : 'text-slate-400'}`}>
                            {dist === 50 ? 'Tezkor (50m)' : dist === 100 ? 'Standart (100m)' : dist === 200 ? 'Oʻrta (200m)' : dist === 500 ? 'Uzoq (500m)' : 'Marafon (1km)'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-white font-mono flex items-center gap-1.5">
                      Guruh Poygasi Kutilmoqda
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Guruh egasi ({roomData?.creatorName || 'Host'}) start berishi bilan barchada bir vaqtda poyga boshlanadi.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-950/80 border border-cyan-500/50 rounded-xl text-cyan-300 text-xs font-mono font-bold shrink-0">
                  <span>🏁 Masofa:</span>
                  <span className="text-white font-black text-sm">{roomData?.targetDistance || 100} metr</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. G'alaba Animatsiyasi (FinishCelebrationOverlay) */}
      {raceStats && showCelebration && (
        <FinishCelebrationOverlay
          stats={raceStats}
          participants={participants.map(p => ({
            id: p.id,
            name: p.name,
            avatar: '🏎️',
            isUser: p.isUser,
            progress: p.progress,
            currentWpm: p.currentWpm,
            rawWpm: p.currentWpm,
            accuracy: p.accuracy,
            finished: p.finished,
            finishTimeSeconds: p.finishTimeSeconds ?? p.finishTime,
            rank: p.rank,
            color: '#00E5FF'
          }))}
          isMultiplayer={true}
          isCreator={isCreator}
          onNextRound={handleNextRound}
          onRestart={() => {
            setShowCelebration(false);
            setShowDetailedModal(false);
          }}
          onOpenDetailedStats={() => {
            setShowCelebration(false);
            setShowDetailedModal(true);
          }}
        />
      )}

      {/* 5. Batafsil Natijalar Modali */}
      {raceStats && showDetailedModal && (
        <RaceResultsModal
          stats={raceStats}
          participants={participants.map(p => ({
            id: p.id,
            name: p.name,
            avatar: '🏎️',
            isUser: p.isUser,
            progress: p.progress,
            currentWpm: p.currentWpm,
            rawWpm: p.currentWpm,
            accuracy: p.accuracy,
            finished: p.finished,
            finishTimeSeconds: p.finishTimeSeconds ?? p.finishTime,
            rank: p.rank,
            color: '#00E5FF'
          }))}
          isMultiplayer={true}
          isCreator={isCreator}
          onNextRound={handleNextRound}
          onRestart={() => {
            setShowCelebration(false);
            setShowDetailedModal(false);
          }}
          onNextQuote={handleNextRound}
          onSaveScore={() => {}}
          hasSaved={true}
        />
      )}
    </div>
  );
};
