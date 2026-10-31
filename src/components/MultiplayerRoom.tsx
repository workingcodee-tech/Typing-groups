import React, { useState, useEffect, useRef, useMemo } from 'react';
import { doc, collection, onSnapshot, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { deleteRoomCompletely, leaveAndCleanRoom } from '../utils/cleanupRooms';
import { HighwayRaceTrack, HighwayRacer } from './HighwayRaceTrack';
import { WordsTypingArena } from './WordsTypingArena';
import { RaceResultsModal } from './RaceResultsModal';
import { FinishCelebrationOverlay } from './FinishCelebrationOverlay';
import { RaceStats, DifficultyLevel } from '../types';
import { Play, LogOut, Copy, Check, Users, Trash2, AlertCircle, RotateCcw, Maximize2, Minimize2, Globe, Settings, X } from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import { sortRacersByRank } from '../utils/raceRanking';
import { generate5000Words, GameLanguage } from '../data/words';

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
  const [isSyncingPhase, setIsSyncingPhase] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);
  const [raceStats, setRaceStats] = useState<RaceStats | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showDetailedModal, setShowDetailedModal] = useState(false);
  const [roomClosed, setRoomClosed] = useState(false);
  const [isResettingRound, setIsResettingRound] = useState(false);

  // Poygani boshlashdan oldin sozlamalar (Masofa va Til) modali holati
  const [isStartModalOpen, setIsStartModalOpen] = useState<boolean>(false);
  const [modalDistance, setModalDistance] = useState<number>(100);
  const [modalLanguage, setModalLanguage] = useState<GameLanguage>('uz');
  const [isNextRoundMode, setIsNextRoundMode] = useState<boolean>(false);

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

  // Xonada kamida 1 kishi bor ekan, har 15 soniyada faollik tamg'asi (heartbeat) yangilanadi.
  // Bu xonaning o'z-o'zidan yopilib ketishining 100% oldini oladi.
  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        const roomRef = doc(db, 'rooms', roomId);
        await updateDoc(roomRef, {
          lastActiveMs: Date.now(),
          emptySince: null
        });
      } catch {
        // ignore
      }
    };

    sendHeartbeat();
    const interval = window.setInterval(sendHeartbeat, 15000);
    return () => clearInterval(interval);
  }, [roomId]);

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

      // Butun ekran rejimiga o'tish (agar o'yin boshlanayotgan bo'lsa)
      if (data.status === 'starting' && !document.fullscreenElement && document.documentElement.requestFullscreen) {
        try {
          document.documentElement.requestFullscreen().catch(() => {});
        } catch {}
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

      // Monoton progress: Poyga vaqtida mashina hech qachon orqaga qaytmaydi
      setParticipants((prev) => {
        const prevMap = new Map(prev.map(p => [p.id, p]));
        return withRank.map((r) => {
          const prevR = prevMap.get(r.id);
          let safeProgress = r.progress;
          if (prevR && prevR.progress > 0 && r.progress < prevR.progress && !r.finished) {
            safeProgress = prevR.progress;
          }
          return {
            ...r,
            progress: safeProgress
          };
        });
      });

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

  // 3. Millisekundlik Sinxron Countdown (barcha o'yinchilar bir xil lahzada boshlaydi)
  useEffect(() => {
    if (!roomData?.startTimeMs || (roomData?.status !== 'starting' && roomData?.status !== 'racing')) {
      setCountdown(null);
      setIsSyncingPhase(false);
      playedCountdownRef.current = null;
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();
      const diffMs = roomData.startTimeMs - now;

      // 1. Dastlabki 2.5 soniya: Barcha foydalanuvchilar kompyuterlari server bilan ma'lumot almashib ulgurishi uchun sinxronizatsiya
      if (diffMs > 3000) {
        setIsSyncingPhase(true);
        setCountdown(null);
        playedCountdownRef.current = null;
      } else if (diffMs > 2000) {
        setIsSyncingPhase(false);
        setCountdown(3);
        if (playedCountdownRef.current !== 3) {
          playedCountdownRef.current = 3;
          sounds.playCountdown(3);
        }
      } else if (diffMs > 1000) {
        setIsSyncingPhase(false);
        setCountdown(2);
        if (playedCountdownRef.current !== 2) {
          playedCountdownRef.current = 2;
          sounds.playCountdown(2);
        }
      } else if (diffMs > 0) {
        setIsSyncingPhase(false);
        setCountdown(1);
        if (playedCountdownRef.current !== 1) {
          playedCountdownRef.current = 1;
          sounds.playCountdown(1);
        }
      } else if (diffMs > -1200) {
        // 0 bo'lganda (GO! 🏁): Barcha qurilmalarda ayni shu millisekundda poyga start oladi
        setIsSyncingPhase(false);
        setCountdown(0);
        if (playedCountdownRef.current !== 0) {
          playedCountdownRef.current = 0;
          sounds.playCountdown(0);
        }
        // Agar men xona egasi bo'lsam, statusni 'racing' ga o'tkazish
        if (isCreator && roomData.status === 'starting') {
          updateDoc(doc(db, 'rooms', roomId), { status: 'racing' }).catch(() => {});
        }
      } else {
        // 1.2 soniyadan so'ng banner yashiriladi
        setIsSyncingPhase(false);
        setCountdown(null);
      }
    };

    updateCountdown();
    const interval = window.setInterval(updateCountdown, 40);
    return () => clearInterval(interval);
  }, [roomData?.startTimeMs, roomData?.status, isCreator, roomId]);

  const myBrakeTimerRef = useRef<number | null>(null);

  // Foydalanuvchi yozayotgan paytda progressni bazaga yuborish
  const handleProgressUpdate = React.useCallback(async (progress: number, wpm: number, accuracy: number, totalChars: number, errors: number) => {
    // 1. O'yinchi mashinasini darhol silliq yangilash (tarmoq kechikishisiz)
    setParticipants((prev) => {
      let isBackward = false;
      const updated = prev.map((p) => {
        if (!p.isUser) return p;
        // Mashina orqaga sakramasligi uchun monoton tekshirish
        const safeProgress = (p.progress > 0 && progress < p.progress && !p.finished) ? p.progress : progress;
        if (progress < p.progress) {
          isBackward = true;
        }
        return {
          ...p,
          progress: safeProgress,
          currentWpm: wpm,
          accuracy,
          finished: safeProgress >= 100,
          isBraking: false
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
    const syncStart = roomData?.startTimeMs || (finishTimestamp - stats.timeSeconds * 1000);
    const exactDurationSeconds = Number(Math.max(0.1, (finishTimestamp - syncStart) / 1000).toFixed(2));

    // Aniq o'rinni hisoblash: joriy foydalanuvchining marra natijasi bilan barcha ishtirokchilarni saralash
    const updatedParticipants = participants.map(p => {
      if (p.id === myId) {
        return {
          ...p,
          finished: true,
          finishTimeSeconds: exactDurationSeconds,
          finishTime: exactDurationSeconds,
          finishedAtMs: finishTimestamp,
          finishedAt: finishTimestamp,
          currentWpm: stats.wpm,
          accuracy: stats.accuracy
        };
      }
      return p;
    });

    const strictlySorted = sortRacersByRank(updatedParticipants);
    const myRealRank = strictlySorted.findIndex(p => p.id === myId) + 1;
    const currentDistance = roomData?.targetDistance || 100;

    setRaceStats({
      ...stats,
      timeSeconds: exactDurationSeconds,
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
        finishTime: exactDurationSeconds,
        finishTimeSeconds: exactDurationSeconds,
        finishedAtMs: finishTimestamp,
        finishedAt: finishTimestamp,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn("Marrani saqlashda xatolik:", e);
    }
  }, [roomId, myId, participants, roomData?.targetDistance, roomData?.startTimeMs]);

  // Guruh egasi poygani boshlashdan oldin sozlamalar (Masofa va Til) modalini ochishi
  const openStartModal = (isNextRound: boolean = false) => {
    setIsNextRoundMode(isNextRound);
    setModalDistance(roomData?.targetDistance || 100);
    setModalLanguage((roomData?.language as GameLanguage) || 'uz');
    setIsStartModalOpen(true);
  };

  // Guruh egasi (host) poyga boshlanishidan oldin masofani belgilashi
  const handleSetTargetDistance = async (newDistance: number) => {
    if (!isCreator || newDistance < 20) return;
    try {
      const curLang = (roomData?.language as GameLanguage) || 'uz';
      const wordsCount = Math.max(150, Math.ceil(newDistance * 1.5));
      const newWords = generate5000Words(wordsCount, curLang);
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
        targetDistance: newDistance,
        words: newWords
      });
    } catch (e) {
      console.warn("Masofani yangilashda xatolik:", e);
    }
  };

  // Sozlamalar tasdiqlangach poygani boshlash (va darhol butun ekranga o'tish)
  const handleConfirmAndStartRace = async () => {
    if (!isCreator) return;
    setIsStartModalOpen(false);

    // 1. O'yin boshlash zahoti butun ekran rejimiga o'tilsin
    try {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn("Butun ekranga oʻtishda ogohlantirish:", err);
    }

    const wordsCount = Math.max(150, Math.ceil(modalDistance * 1.5));
    const newWords = generate5000Words(wordsCount, modalLanguage);

    if (isNextRoundMode) {
      setIsResettingRound(true);
      try {
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
      } catch (e) {
        console.warn("Ishtirokchilarni tozalashda xatolik:", e);
      } finally {
        setIsResettingRound(false);
      }
    }

    try {
      const roomRef = doc(db, 'rooms', roomId);
      const nextRoundNumber = isNextRoundMode ? (roomData?.round || 1) + 1 : (roomData?.round || 1);

      // 2.5s tarmoq ma'lumotlari almashinuvi + 3.0s sanash = 5.5s (5500ms)
      // Bu 2.5 soniya barcha foydalanuvchilar kompyuterlari server bilan so'zlar va boshlanish vaqtini 100% sinxronlashiga xizmat qiladi
      const PRE_SYNC_BUFFER_MS = 2500;
      const COUNTDOWN_MS = 3000;
      const synchronousStartMs = Date.now() + PRE_SYNC_BUFFER_MS + COUNTDOWN_MS;

      await updateDoc(roomRef, {
        targetDistance: modalDistance,
        language: modalLanguage,
        words: newWords,
        round: nextRoundNumber,
        status: 'starting',
        startTimeMs: synchronousStartMs,
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn("Poygani boshlashda xatolik:", e);
    }
  };

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

  // So'zlar ro'yxatini round va birinchi so'z bo'yicha barqaror ushlab turish (heartbeat yoki snapshot yangi massiv yaratmasligi uchun)
  const wordsList = useMemo(() => {
    return roomData?.words || [];
  }, [roomData?.round, roomData?.words?.[0]]);

  // Barcha yoki g'olib marraga yetganini tekshirish
  const hasAnyoneFinished = participants.some(p => p.finished);

  return (
    <div className="w-full h-full max-w-none flex flex-col justify-between py-1.5 px-2 sm:px-4 select-none relative overflow-hidden bg-[#070b14]/70">
      {/* 1. GORIZONTAL BIR QATORLI HEADER (O'yin nomi, Guruh nomi, ID, Ishtirokchilar, Tugatish) */}
      <header className="w-full flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-5 py-2 bg-slate-950/85 border border-slate-800/80 rounded-2xl shadow-xl backdrop-blur-md shrink-0 whitespace-nowrap overflow-x-auto no-scrollbar">
        {/* Chap qism: Dumaloq Yakka Logo, Guruh nomi va ID */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Dumaloq Yakka Logo (To'rtburchak emas, yakka o'zi) */}
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

          <div className="px-2 py-1 bg-blue-950/80 border border-blue-500/50 rounded-xl font-bold text-blue-300">
            {roomData?.language === 'en' ? '🇬🇧 EN' : '🇺🇿 UZ'}
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

          {/* Yaratuvchi uchun: Birinchi poygani boshlash (Start modali ochiladi) */}
          {isCreator && !isGameUnderway && (
            <button
              onClick={() => openStartModal(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300 hover:to-green-400 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer animate-pulse active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>START RACE</span>
            </button>
          )}

          {/* Yaratuvchi uchun: Poyga tugaganda keyingi bosqichni boshlash (Start modali ochiladi) */}
          {isCreator && isGameUnderway && hasAnyoneFinished && (
            <button
              onClick={() => openStartModal(true)}
              disabled={isResettingRound}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer animate-bounce active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isResettingRound ? 'Yuklanmoqda...' : 'KEYINGI BOSQICH 🏁'}</span>
            </button>
          )}

          {/* Guruhdan chiqish yoki xonani to'xtatish */}
          {isCreator ? (
            <button
              type="button"
              onClick={handleDeleteRoom}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-rose-950 to-red-950 hover:from-rose-900 hover:to-red-900 border-2 border-rose-500/80 hover:border-rose-400 text-rose-100 hover:text-white rounded-xl text-xs font-black cursor-pointer transition-all active:scale-95 shadow-lg shadow-rose-950/60 group"
              title="Guruh poygasini butunlay toʻxtatish va asosiy sahifaga qaytish"
            >
              <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 group-hover:scale-110 transition-transform shadow-xs shadow-rose-400" />
              <span>Toʻxtatish</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleParticipantLeave}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border-2 border-rose-500/60 text-slate-200 hover:text-white rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-md"
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

        {/* Dastlabki 2-3 soniya: Qurilmalar va tarmoq ma'lumotlarini to'liq sinxronlash */}
        {isSyncingPhase && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xs z-30 rounded-2xl flex flex-col items-center justify-center animate-backdrop-fade pointer-events-none p-4 text-center">
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-cyan-950/80 border border-cyan-400/50 shadow-[0_0_30px_rgba(6,182,212,0.3)] mb-2.5">
              <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs sm:text-sm font-black font-mono tracking-wider text-cyan-200 uppercase">
                Tarmoq va qurilmalar sinxronlashtirilmoqda...
              </span>
            </div>
            <p className="text-[11px] sm:text-xs font-mono text-slate-300 max-w-md bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-700/80">
              Barcha guruhdoshlarga start bir vaqtda berilishi uchun maʼlumotlar almashinmoqda. Tayyor turing! (3 soniyada sanaladi)
            </p>
          </div>
        )}

        {/* 3... 2... 1... START! Overlay (Millisekund aniqlikda sinxron) */}
        {countdown !== null && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-xs z-30 rounded-2xl flex flex-col items-center justify-center animate-backdrop-fade pointer-events-none">
            {/* Chiroqlar (Svetofor) */}
            <div className="flex items-center gap-3 mb-2 p-2 bg-slate-950/90 border border-slate-800 rounded-full shadow-2xl">
              <span className={`w-5 h-5 rounded-full transition-all duration-300 ${
                countdown === 3 ? 'bg-rose-500 shadow-[0_0_20px_#f43f5e] scale-125' : 'bg-rose-950/40 border border-rose-900/60'
              }`} />
              <span className={`w-5 h-5 rounded-full transition-all duration-300 ${
                countdown === 2 ? 'bg-amber-400 shadow-[0_0_20px_#fbbf24] scale-125' : 'bg-amber-950/40 border border-amber-900/60'
              }`} />
              <span className={`w-5 h-5 rounded-full transition-all duration-300 ${
                countdown <= 1 ? 'bg-emerald-400 shadow-[0_0_20px_#34d399] scale-125' : 'bg-emerald-950/40 border border-emerald-900/60'
              }`} />
            </div>

            {/* Raqam yoki GO! (Portlash animatsiyasi) */}
            <div key={countdown} className="text-5xl sm:text-7xl font-black font-mono tracking-wider drop-shadow-[0_0_25px_rgba(52,211,153,0.8)] text-white animate-countdown-pop">
              {countdown === 0 ? (
                <span className="text-emerald-400">GO! 🏁</span>
              ) : (
                <span className={countdown === 3 ? 'text-rose-400' : countdown === 2 ? 'text-amber-400' : 'text-emerald-400'}>
                  {countdown}
                </span>
              )}
            </div>

            <p className="text-[11px] sm:text-xs font-mono font-bold text-slate-300 mt-2 tracking-widest uppercase bg-slate-900/90 px-3 py-0.5 rounded-md border border-slate-700 animate-pulse">
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
                language={(roomData?.language as GameLanguage) || 'uz'}
                onProgressUpdate={handleProgressUpdate}
                onFinish={handleFinish}
                isGameActive={true}
                countdownActive={isSyncingPhase || (countdown !== null && countdown > 0)}
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
                      Trassa masofasi va tilini tanlang, soʻngra barcha uchun poygani boshlang:
                    </p>
                  </div>

                  <button
                    onClick={() => openStartModal(false)}
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
          onNextRound={() => openStartModal(true)}
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
          onNextRound={() => openStartModal(true)}
          onRestart={() => {
            setShowCelebration(false);
            setShowDetailedModal(false);
          }}
          onNextQuote={() => openStartModal(true)}
          onSaveScore={() => {}}
          hasSaved={true}
        />
      )}

      {/* 6. GURUH POYGASINI BOSHLASH VA SOZLAMALAR MODALI (Har safar start berilganda chiqadi) */}
      {isStartModalOpen && isCreator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-backdrop-fade">
          <div className="relative w-full max-w-md bg-[#0b1222] border-2 border-cyan-500/50 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(6,182,212,0.35)] text-slate-100 flex flex-col gap-4 animate-modal-pop">
            {/* Modal Sarlavhasi */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-cyan-500/20 border border-cyan-500/40 rounded-xl text-xl">
                  ⚙️
                </span>
                <div>
                  <h3 className="text-base font-black text-white font-mono tracking-tight">
                    {isNextRoundMode ? 'Keyingi Bosqich Sozlamalari' : 'Poyga Sozlamalari & Boshlash'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Masofa va tilni tanlang, soʻngra start bering
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsStartModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-850 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* O'YIN TILI TANLASH (O'zbekcha / English) */}
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 uppercase font-mono">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  Oʻyin Tili (Barcha Oʻyinchilar Uchun):
                </span>
                <span className="text-[10px] font-mono text-cyan-400 font-bold">
                  {modalLanguage === 'uz' ? '🇺🇿 Oʻzbek tili' : '🇬🇧 Ingliz tili'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setModalLanguage('uz')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    modalLanguage === 'uz'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black border-cyan-300 shadow-md shadow-cyan-500/30 ring-1 ring-cyan-400'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span className="text-sm">🇺🇿</span>
                  <span>Oʻzbekcha (Lotin)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalLanguage('en')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    modalLanguage === 'en'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black border-cyan-300 shadow-md shadow-cyan-500/30 ring-1 ring-cyan-400'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span className="text-sm">🇬🇧</span>
                  <span>English (Speed)</span>
                </button>
              </div>

              <p className="text-[10px] text-slate-400 leading-tight">
                {modalLanguage === 'uz'
                  ? 'ℹ️ Oʻzbek tilida tutuq belgisi (\') va gʻ, oʻ harflari boʻlmagan qulay soʻzlar beriladi.'
                  : 'ℹ️ Ingliz tilidagi mashhur va qulay poyga soʻzlari beriladi.'}
              </p>
            </div>

            {/* MASOFA TANLASH (50m, 100m, 200m, 500m, 1000m, 1500m) */}
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono">
                  🏁 Poyga Masofasi:
                </span>
                <span className="text-xs font-mono font-black text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/40">
                  {modalDistance} METR
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {[50, 100, 200, 500, 1000, 1500].map((dist) => (
                  <button
                    key={dist}
                    type="button"
                    onClick={() => setModalDistance(dist)}
                    className={`py-2 px-1 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                      modalDistance === dist
                        ? 'bg-gradient-to-b from-cyan-500 to-blue-600 text-slate-950 border-cyan-300 font-black shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>{dist}m</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Xona holati xulosasi */}
            <div className="flex items-center justify-between px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>Ishtirokchilar:</span>
                <strong className="text-white">{participants.length}/10</strong>
              </span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Toʻliq ekran faollashadi</span>
              </span>
            </div>

            {/* Boshlash tugmasi */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsStartModalOpen(false)}
                className="flex-1 py-2.5 px-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleConfirmAndStartRace}
                className="flex-[2] py-2.5 px-4 bg-gradient-to-r from-emerald-400 via-teal-400 to-green-500 hover:from-emerald-300 hover:to-green-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/30 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Boshlash (3-2-1) 🚀</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
