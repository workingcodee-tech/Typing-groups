import React, { useState, useEffect } from 'react';
import { RacingBackground } from './components/RacingBackground';
import { HomeModeSelector } from './components/HomeModeSelector';
import { SoloRaceArena } from './components/SoloRaceArena';
import { MultiplayerRoom } from './components/MultiplayerRoom';
import { ModeModal, ModeType } from './components/ModeModal';
import { generate5000Words } from './data/words';
import { SwitchSoundType, sounds } from './utils/soundEffects';
import { DifficultyLevel } from './types';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { cleanStaleRooms } from './utils/cleanupRooms';

export default function App() {
  // Tovush sozlamalari
  const [soundType, setSoundType] = useState<SwitchSoundType>('thock');

  // Ilova holati: Foydalanuvchi kirganda avval REJIM TANLASH EKRANI ('home') ochiladi:
  // 1. O'zim yozishim (Yakkaxon mashq)
  // 2. Guruh yaratishim (Yangi xona ochish)
  // 3. Guruhga qo'shilishim (Kod orqali ulanish)
  const [viewState, setViewState] = useState<'home' | 'solo' | 'room'>('home');

  const [soloDifficulty, setSoloDifficulty] = useState<DifficultyLevel>(() => {
    try {
      return (localStorage.getItem('tg_user_diff') as DifficultyLevel) || 'medium';
    } catch {
      return 'medium';
    }
  });

  // Foydalanuvchi ma'lumotlari (Avtomatik saqlangan yoki standart "Poygachi")
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    carId: string;
  }>(() => {
    let savedName = 'Poygachi';
    let savedCar = 'bmw';
    try {
      savedName = localStorage.getItem('tg_user_name') || 'Poygachi';
      savedCar = localStorage.getItem('tg_user_car') || 'bmw';
    } catch {
      // ignore
    }
    return {
      id: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: savedName,
      carId: savedCar
    };
  });

  // URL orqali kelgan xona kodi (?room=123456)
  const [initialRoomParam, setInitialRoomParam] = useState<string>('');

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const room = params.get('room');
      if (room && /^\d{6}$/.test(room)) {
        setInitialRoomParam(room);
      }
    } catch {
      // ignore
    }

    // Firestore bazasini to'lib ketishdan saqlash uchun eskirgan xonalarni tozalash
    cleanStaleRooms().catch(() => {});
  }, []);

  // Guruh multiplayer modali holati ('join' | 'create' | null)
  const [multiplayerModalMode, setMultiplayerModalMode] = useState<ModeType | null>(null);

  // Faol xona ma'lumotlari
  const [activeRoom, setActiveRoom] = useState<{
    id: string;
    isCreator: boolean;
  } | null>(null);

  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Tovushni almashtirish
  const handleToggleSound = () => {
    const cycle: SwitchSoundType[] = ['thock', 'blue', 'brown', 'red', 'off'];
    const nextIdx = (cycle.indexOf(soundType) + 1) % cycle.length;
    const nextSound = cycle[nextIdx];
    setSoundType(nextSound);
    sounds.setSoundType(nextSound);
    if (nextSound !== 'off') {
      sounds.playKey('Space', true, false);
    }
  };

  const [soloDistance, setSoloDistance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('tg_user_dist');
      return saved ? Number(saved) : 100;
    } catch {
      return 100;
    }
  });

  // Yakka poyga boshlash
  const handleStartSolo = (
    userName: string,
    carId: string,
    difficulty: DifficultyLevel = 'medium',
    distance: number = 100
  ) => {
    setCurrentUser((prev) => ({
      ...prev,
      name: userName,
      carId
    }));
    setSoloDifficulty(difficulty);
    setSoloDistance(distance);
    try {
      localStorage.setItem('tg_user_name', userName);
      localStorage.setItem('tg_user_car', carId);
      localStorage.setItem('tg_user_diff', difficulty);
      localStorage.setItem('tg_user_dist', distance.toString());
    } catch {
      // ignore
    }
    setViewState('solo');
    setMultiplayerModalMode(null);
  };

  // Guruhga qo'shilish (6 raqamli ID orqali)
  const handleJoinGroup = async (
    roomId: string,
    userName: string,
    carId: string,
    enterImmediately: boolean = true
  ): Promise<{ success: boolean; error?: string }> => {
    setGlobalError(null);
    try {
      const roomRef = doc(db, 'rooms', roomId);
      const participantsRef = collection(db, 'rooms', roomId, 'participants');

      // Tezkor parallel tekshirish (kechikishni 2 barobar kamaytiradi)
      const [roomSnap, participantsSnap] = await Promise.all([
        getDoc(roomRef),
        getDocs(participantsRef)
      ]);

      if (!roomSnap.exists()) {
        const msg = `"${roomId}" raqamli xona topilmadi. 6 raqamli ID toʻgʻri kiritilganini tekshiring.`;
        setGlobalError(msg);
        return { success: false, error: msg };
      }

      if (participantsSnap.size >= 10) {
        const msg = 'Kechirasiz, ushbu guruh toʻlgan (maksimal 10 ta ishtirokchi).';
        setGlobalError(msg);
        return { success: false, error: msg };
      }

      const myId = currentUser.id;
      // Ishtirokchi sifatida ro'yxatdan o'tish
      await setDoc(doc(db, 'rooms', roomId, 'participants', myId), {
        id: myId,
        name: userName,
        carId,
        progress: 0,
        currentWpm: 0,
        accuracy: 100,
        totalChars: 0,
        errors: 0,
        finished: false,
        isCreator: false,
        joinedAt: new Date().toISOString()
      });

      setCurrentUser((prev) => ({
        ...prev,
        name: userName,
        carId
      }));

      try {
        localStorage.setItem('tg_user_name', userName);
        localStorage.setItem('tg_user_car', carId);
      } catch {
        // ignore
      }

      setActiveRoom({
        id: roomId,
        isCreator: false
      });

      if (enterImmediately) {
        setViewState('room');
      }
      setMultiplayerModalMode(null);
      return { success: true };
    } catch (e: any) {
      console.error("Guruhga qo'shilishda xatolik:", e);
      const msg = 'Guruhga qoʻshilishda xatolik yuz berdi. Iltimos, qayta urinib koʻring.';
      setGlobalError(msg);
      return { success: false, error: msg };
    } finally {
      setLoadingAction(null);
    }
  };

  // Yangi guruh yaratish (Xona Firestore bazasida to'liq tayyor bo'lgach ID qaytaradi)
  const handleCreateGroup = async (
    groupName: string,
    userName: string,
    carId: string,
    targetDistance: number = 100,
    enterImmediately: boolean = true
  ): Promise<string | null> => {
    setGlobalError(null);

    try {
      const random6DigitId = String(Math.floor(100000 + Math.random() * 900000));
      // So'zlar yetishmay qolmasligi uchun kamida 150-250 ta so'z (3-4 barobar ko'p) yaratamiz
      const wordsCount = Math.max(150, Math.ceil(targetDistance * 1.5));
      const roomWords = generate5000Words(wordsCount);
      const myId = currentUser.id;

      // Xona hujjatini yaratish
      const nowMs = Date.now();
      const roomRef = doc(db, 'rooms', random6DigitId);
      await setDoc(roomRef, {
        id: random6DigitId,
        name: groupName,
        creatorId: myId,
        creatorName: userName,
        status: 'waiting',
        createdAt: new Date().toISOString(),
        createdAtMs: nowMs,
        updatedAtMs: nowMs,
        words: roomWords,
        countdown: null,
        targetDistance: targetDistance || 100,
        round: 1
      });

      // Yaratuvchini ishtirokchi sifatida qo'shish
      await setDoc(doc(db, 'rooms', random6DigitId, 'participants', myId), {
        id: myId,
        name: userName,
        carId,
        progress: 0,
        currentWpm: 0,
        accuracy: 100,
        totalChars: 0,
        errors: 0,
        finished: false,
        isCreator: true,
        joinedAt: new Date().toISOString()
      });

      setCurrentUser((prev) => ({
        ...prev,
        name: userName,
        carId
      }));

      try {
        localStorage.setItem('tg_user_name', userName);
        localStorage.setItem('tg_user_car', carId);
      } catch {
        // ignore
      }

      setActiveRoom({
        id: random6DigitId,
        isCreator: true
      });

      if (enterImmediately) {
        setViewState('room');
      }
      setMultiplayerModalMode(null);
      return random6DigitId;
    } catch (e: any) {
      console.error("Guruh yaratishda xatolik:", e);
      setGlobalError('Guruh yaratishda xatolik yuz berdi. Iltimos, qayta urinib koʻring.');
      return null;
    }
  };

  const handleEnterCreatedRoom = () => {
    if (activeRoom) {
      setViewState('room');
    }
  };

  const handleLeaveCurrentRoom = () => {
    setActiveRoom(null);
    setViewState('home');
  };

  return (
    <RacingBackground>
      <div className="h-screen h-[100dvh] max-h-screen max-h-[100dvh] overflow-hidden flex flex-col justify-between selection:bg-emerald-500/30 selection:text-emerald-200">
        {/* Yuklanmoqda bildirishnomasi */}
        {loadingAction && (
          <div className="m-2 p-2 bg-emerald-950/90 border border-emerald-500/70 rounded-xl text-emerald-300 text-xs text-center font-bold animate-pulse flex items-center justify-center gap-2 z-40 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{loadingAction}</span>
          </div>
        )}

        {/* Global xatolik */}
        {globalError && (
          <div className="m-2 p-2 bg-rose-950/90 border border-rose-500/80 rounded-xl text-rose-300 text-xs text-center font-bold z-40 shrink-0">
            {globalError}
          </div>
        )}

        {/* Asosiy O'yin Maydoni (Poyga maydoni to'liq ekranni egallaydi) */}
        <main className={`flex-1 min-h-0 overflow-hidden flex flex-col w-full ${viewState === 'home' ? 'max-w-6xl mx-auto px-2 sm:px-4 py-1 justify-center' : 'w-full h-full max-w-none px-0 py-0 justify-between'}`}>
          {/* 1. BOSH REJIM TANLASH LOBBISI (Saytga kirganda so'raladi) */}
          {viewState === 'home' && (
            <HomeModeSelector
              currentUser={currentUser}
              onUpdateUser={(updatedName, updatedCar) => {
                setCurrentUser(prev => ({ ...prev, name: updatedName, carId: updatedCar }));
              }}
              onStartSolo={handleStartSolo}
              onJoinGroup={handleJoinGroup}
              onCreateGroup={handleCreateGroup}
              onEnterCreatedRoom={handleEnterCreatedRoom}
              soundType={soundType}
              onToggleSound={handleToggleSound}
              initialRoomId={initialRoomParam}
            />
          )}

          {/* 2. YAKKAXON POYGA (Solo Race) */}
          {viewState === 'solo' && (
            <SoloRaceArena
              userName={currentUser.name}
              carId={currentUser.carId}
              initialDifficulty={soloDifficulty}
              initialDistance={soloDistance}
              onBack={() => setViewState('home')}
              onOpenMultiplayer={() => setMultiplayerModalMode('join')}
              onChangeCar={(newCarId) => setCurrentUser(prev => ({ ...prev, carId: newCarId }))}
              onChangeName={(newName) => setCurrentUser(prev => ({ ...prev, name: newName }))}
              soundType={soundType}
              onToggleSound={handleToggleSound}
            />
          )}

          {/* 3. GURUH MULTIPLAYER XONASI */}
          {viewState === 'room' && activeRoom && (
            <MultiplayerRoom
              roomId={activeRoom.id}
              myId={currentUser.id}
              myName={currentUser.name}
              myCarId={currentUser.carId}
              isCreator={activeRoom.isCreator}
              onLeave={handleLeaveCurrentRoom}
            />
          )}
        </main>

        {/* Guruhga qo'shilish / yaratish qo'shimcha modali */}
        {multiplayerModalMode && (
          <ModeModal
            mode={multiplayerModalMode}
            onClose={() => setMultiplayerModalMode(null)}
            onStartSolo={handleStartSolo}
            onJoinGroup={handleJoinGroup}
            onCreateGroup={handleCreateGroup}
          />
        )}
      </div>
    </RacingBackground>
  );
}
