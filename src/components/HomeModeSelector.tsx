import React, { useState, useEffect } from 'react';
import { Play, Users, PlusCircle, Car, Volume2, VolumeX, Check, Copy, X, Edit3, AlertCircle, ArrowRight, Crown, Globe } from 'lucide-react';
import { FAMOUS_CARS, RacingCar } from '../data/cars';
import { CarShowcase } from './CarShowcase';
import { DifficultyLevel } from '../types';
import { SwitchSoundType } from '../utils/soundEffects';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { GameLanguage } from '../data/words';

interface ModalParticipant {
  id: string;
  name: string;
  carId: string;
  isCreator?: boolean;
}

interface HomeModeSelectorProps {
  currentUser: {
    id: string;
    name: string;
    carId: string;
  };
  onUpdateUser: (name: string, carId: string) => void;
  onStartSolo: (userName: string, carId: string, difficulty: DifficultyLevel, distance?: number, language?: GameLanguage) => void;
  onJoinGroup: (roomId: string, userName: string, carId: string, enterImmediately?: boolean) => Promise<{ success: boolean; error?: string }>;
  onCreateGroup: (groupName: string, userName: string, carId: string, targetDistance?: number, enterImmediately?: boolean) => Promise<string | null>;
  onEnterCreatedRoom: () => void;
  soundType: SwitchSoundType;
  onToggleSound: () => void;
  initialRoomId?: string;
}

export const HomeModeSelector: React.FC<HomeModeSelectorProps> = ({
  currentUser,
  onUpdateUser,
  onStartSolo,
  onJoinGroup,
  onCreateGroup,
  onEnterCreatedRoom,
  soundType,
  onToggleSound,
  initialRoomId = ''
}) => {
  // Foydalanuvchi ma'lumotlari
  const [name, setName] = useState<string>(currentUser.name || 'Poygachi');
  const [selectedCarId, setSelectedCarId] = useState<string>(currentUser.carId || 'bmw');

  // Modallar holati
  const [showFirstTimeModal, setShowFirstTimeModal] = useState<boolean>(false);
  const [tempFirstName, setTempFirstName] = useState<string>('');

  const [showPlaySoloModal, setShowPlaySoloModal] = useState<boolean>(false);
  const [soloDifficulty, setSoloDifficulty] = useState<DifficultyLevel>('medium');
  const [soloDistance, setSoloDistance] = useState<number>(100);
  const [soloLanguage, setSoloLanguage] = useState<GameLanguage>(() => {
    try {
      return (localStorage.getItem('tg_game_lang') as GameLanguage) || 'uz';
    } catch {
      return 'uz';
    }
  });

  const [showJoinModal, setShowJoinModal] = useState<boolean>(false);
  const [joinPin, setJoinPin] = useState<string>(initialRoomId);
  const [joinedRoomId, setJoinedRoomId] = useState<string | null>(null);
  const [isJoiningGroup, setIsJoiningGroup] = useState<boolean>(false);
  const [joinParticipants, setJoinParticipants] = useState<ModalParticipant[]>([]);

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newGroupName, setNewGroupName] = useState<string>('Tezkor Poygachilar');
  const [newGroupDistance, setNewGroupDistance] = useState<number>(100);
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
  const [modalParticipants, setModalParticipants] = useState<ModalParticipant[]>([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState<boolean>(false);
  const [createGroupError, setCreateGroupError] = useState<string>('');
  const [copiedPin, setCopiedPin] = useState<boolean>(false);

  // Xona yaratilgach, guruhga qo'shilgan ishtirokchilarni real vaqt rejimida (jonli) kuzatish
  useEffect(() => {
    if (!createdRoomId) {
      setModalParticipants([]);
      return;
    }

    const participantsRef = collection(db, 'rooms', createdRoomId, 'participants');
    const unsubscribe = onSnapshot(participantsRef, (snapshot) => {
      const list: ModalParticipant[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: data.id || docSnap.id,
          name: data.name || 'Poygachi',
          carId: data.carId || 'bmw',
          isCreator: data.isCreator || false
        });
      });
      // Guruh yaratuvchisi (Host) eng yuqorida turishi uchun
      list.sort((a, b) => (b.isCreator ? 1 : 0) - (a.isCreator ? 1 : 0));
      setModalParticipants(list);
    });

    return () => unsubscribe();
  }, [createdRoomId]);

  // Guruhga muvaffaqiyatli qo'shilgach, ishtirokchilar jadvalini real vaqt rejimida kuzatish
  useEffect(() => {
    if (!joinedRoomId) {
      setJoinParticipants([]);
      return;
    }

    const participantsRef = collection(db, 'rooms', joinedRoomId, 'participants');
    const unsubscribe = onSnapshot(participantsRef, (snapshot) => {
      const list: ModalParticipant[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: data.id || docSnap.id,
          name: data.name || 'Poygachi',
          carId: data.carId || 'bmw',
          isCreator: data.isCreator || false
        });
      });
      // Guruh yaratuvchisi (Host) eng yuqorida turishi uchun
      list.sort((a, b) => (b.isCreator ? 1 : 0) - (a.isCreator ? 1 : 0));
      setJoinParticipants(list);
    });

    return () => unsubscribe();
  }, [joinedRoomId]);

  const [showCarModal, setShowCarModal] = useState<boolean>(false);
  const [showEditNameModal, setShowEditNameModal] = useState<boolean>(false);
  const [editNameInput, setEditNameInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // 1. Ilk bor tashrif buyurganini tekshirish (localStorage da ism yo'q bo'lsa modal chiqadi)
  useEffect(() => {
    try {
      const savedName = localStorage.getItem('tg_user_name');
      if (!savedName || savedName.trim() === '' || savedName === 'Poygachi') {
        setShowFirstTimeModal(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // URL da room PIN kodi kelsa avtomatik ulanish modalini ochish
  useEffect(() => {
    if (initialRoomId) {
      setJoinPin(initialRoomId);
      setShowJoinModal(true);
    }
  }, [initialRoomId]);

  const currentCar = FAMOUS_CARS.find(c => c.id === selectedCarId) || FAMOUS_CARS[0];

  // Ilk bor ism kiritish
  const handleSaveFirstName = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = tempFirstName.trim();
    if (!clean) return;
    setName(clean);
    try {
      localStorage.setItem('tg_user_name', clean);
    } catch {
      // ignore
    }
    onUpdateUser(clean, selectedCarId);
    setShowFirstTimeModal(false);
  };

  // Ismni tahrirlash
  const handleSaveEditedName = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = editNameInput.trim();
    if (!clean) return;
    setName(clean);
    try {
      localStorage.setItem('tg_user_name', clean);
    } catch {
      // ignore
    }
    onUpdateUser(clean, selectedCarId);
    setShowEditNameModal(false);
  };

  // Mashina almashtirish
  const handleSelectCar = (carId: string) => {
    setSelectedCarId(carId);
    try {
      localStorage.setItem('tg_user_car', carId);
    } catch {
      // ignore
    }
    onUpdateUser(name, carId);
    setShowCarModal(false);
  };

  // Yakka poygani boshlash
  const handleConfirmStartSolo = () => {
    setShowPlaySoloModal(false);
    try {
      localStorage.setItem('tg_game_lang', soloLanguage);
    } catch {
      // ignore
    }
    onStartSolo(name, selectedCarId, soloDifficulty, soloDistance, soloLanguage);
  };

  // Guruhga qo'shilish (Modal yopilmasdan, avval 'Guruhga qo'shilmoqda...' ko'rsatiladi va ulanilgach a'zolar jadvali chiqadi)
  const handleConfirmJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = joinPin.trim().replace(/\D/g, '');
    if (clean.length !== 6) {
      setErrorMsg('Iltimos, 6 raqamli xona kodini (PIN) toʻliq kiriting!');
      return;
    }
    setErrorMsg('');
    setIsJoiningGroup(true);

    try {
      const res = await onJoinGroup(clean, name, selectedCarId, false);
      if (res && res.success) {
        setJoinedRoomId(clean);
      } else {
        setErrorMsg(res?.error || `"${clean}" raqamli xona topilmadi. ID toʻgʻri kiritilganini tekshiring.`);
      }
    } catch {
      setErrorMsg('Guruhga qoʻshilishda xatolik yuz berdi. Qayta urinib koʻring.');
    } finally {
      setIsJoiningGroup(false);
    }
  };

  const handleEnterJoinedRoom = () => {
    setShowJoinModal(false);
    setJoinedRoomId(null);
    onEnterCreatedRoom();
  };

  // Guruh yaratish (Faqat baza to'liq yaratilib tayyor bo'lgach ID modalga chiqadi)
  const handleConfirmCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingGroup(true);
    setCreateGroupError('');

    const gName = newGroupName.trim() || 'Tezkor Poygachilar';
    const dist = Math.max(50, Math.min(1500, newGroupDistance));

    try {
      // 1. Avval Firestore bazasida xonani to'liq yaratamiz
      const newId = await onCreateGroup(gName, name, selectedCarId, dist, false);
      if (newId) {
        // 2. FAQAT XONA BAZADA TAYYOR BO'LGACH ID CHIQARILADI
        setCreatedRoomId(newId);
      } else {
        setCreateGroupError('Xonani yaratishda xatolik yuz berdi. Qayta urinib koʻring.');
      }
    } catch (err) {
      setCreateGroupError('Baza bilan aloqa oʻrnatib boʻlmadi.');
    } finally {
      setIsCreatingGroup(false);
    }
  };

  // 2-bosqich: Katta ID ko'rsatilgach, xonaga kirish
  const handleEnterCreatedRoom = () => {
    setShowCreateModal(false);
    setCreatedRoomId(null);
    onEnterCreatedRoom();
  };

  const handleCopyCreatedPin = () => {
    if (createdRoomId && navigator.clipboard) {
      navigator.clipboard.writeText(createdRoomId);
      setCopiedPin(true);
      setTimeout(() => setCopiedPin(false), 2000);
    }
  };

  return (
    <div className="relative w-full min-h-[calc(100vh-4.5rem)] flex flex-col justify-between p-3 sm:p-6 select-none animate-fade-in overflow-hidden">
      {/* ========================================================= */}
      {/* 1. YUQORI BOSHQARUV QATORI */}
      <div className="w-full flex items-center justify-between gap-2 z-20">
        {/* CHAP YUQORI BURCHAK: Dumaloq Yakka Logo va Guruh Yaratish */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dumaloq Yakka Logo (To'rtburchak emas, yakka o'zi) */}
          <div
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full p-0.5 bg-gradient-to-tr from-cyan-400 via-blue-500 to-emerald-400 shadow-[0_0_18px_rgba(6,182,212,0.5)] shrink-0 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
            title="Type Groups"
          >
            <img
              src="/type-groups-logo.png"
              alt="Type Groups Logo"
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setCreatedRoomId(null);
              setShowCreateModal(true);
            }}
            className="interactive-btn shimmer-gleam flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-cyan-950/90 to-blue-950/90 hover:from-cyan-900 hover:to-blue-900 border border-cyan-500/50 hover:border-cyan-400 rounded-xl text-cyan-200 hover:text-white text-xs sm:text-sm font-bold shadow-lg shadow-cyan-950/50 hover:shadow-cyan-500/20 transition-all cursor-pointer group active:scale-95"
            title="Yangi guruh ochish va do'stlar bilan poygalash"
          >
            <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform">
              <PlusCircle className="w-3.5 h-3.5" />
            </div>
            <span>Guruh Yaratish</span>
          </button>
        </div>

        {/* O'RTA: Ovoz almashtirish va ism tahrirlash */}
        <div className="flex items-center gap-2">
          {/* Ismni tahrirlash */}
          <button
            type="button"
            onClick={() => {
              setEditNameInput(name);
              setShowEditNameModal(true);
            }}
            className="interactive-btn hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
            title="Ismni o'zgartirish"
          >
            <span>👤</span>
            <span className="truncate max-w-[100px]">{name}</span>
            <Edit3 className="w-3 h-3 text-cyan-400 opacity-80" />
          </button>

          {/* Ovoz sozlamasi */}
          <button
            type="button"
            onClick={onToggleSound}
            className="interactive-btn flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white rounded-xl text-xs font-mono font-bold cursor-pointer transition-all"
            title="Klaviatura ovozini almashtirish"
          >
            {soundType === 'off' ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden xs:inline text-[11px]">Ovoz: Off</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden xs:inline text-[11px] uppercase">{soundType}</span>
              </>
            )}
          </button>
        </div>

        {/* O'NG YUQORI BURCHAK: Mashinani Almashtirish Tugmasi */}
        <button
          type="button"
          onClick={() => setShowCarModal(true)}
          className="interactive-btn shimmer-gleam flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-amber-950/90 to-orange-950/90 hover:from-amber-900 hover:to-orange-900 border border-amber-500/50 hover:border-amber-400 rounded-xl text-amber-200 hover:text-white text-xs sm:text-sm font-bold shadow-lg shadow-amber-950/50 hover:shadow-amber-500/20 transition-all cursor-pointer group active:scale-95"
          title="Mashinalar garajidan yangi model tanlash"
        >
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
            <Car className="w-3.5 h-3.5" />
          </div>
          <span>Mashinani Almashtirish</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 2. MARKAZ: KATTA AVTOMOBIL GARAJI (SHOWROOM)              */}
      {/* ========================================================= */}
      <div className="my-auto py-2 flex flex-col items-center justify-center z-10">
        <CarShowcase car={currentCar} playerName={name} />
      </div>

      {/* ========================================================= */}
      {/* 3. O'NG PASTKI BURCHAK: 2 TA ASOSIY HARAKAT TUGMASI       */}
      {/* ========================================================= */}
      <div className="w-full flex items-end justify-end gap-3 z-20 pt-2">
        {/* 1-TUGMA: Guruhga qo'shilish */}
        <button
          type="button"
          onClick={() => {
            setErrorMsg('');
            setShowJoinModal(true);
          }}
          className="interactive-card flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 bg-slate-900/95 hover:bg-slate-850 border-2 border-cyan-500/60 hover:border-cyan-400 text-cyan-300 hover:text-white text-xs sm:text-sm font-black rounded-2xl shadow-xl shadow-cyan-950/60 hover:shadow-cyan-500/30 transition-all cursor-pointer active:scale-95 group"
          title="Xona ID PIN kodi orqali guruhga ulanish"
        >
          <div className="w-7 h-7 rounded-xl bg-cyan-950/90 border border-cyan-500/50 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
            <Users className="w-4 h-4" />
          </div>
          <div className="text-left leading-none">
            <span className="block text-[9px] uppercase tracking-wider text-cyan-400 font-mono">PIN KOD BILAN</span>
            <span className="text-xs sm:text-sm font-black tracking-tight">Guruhga Qoʻshilish</span>
          </div>
        </button>

        {/* 2-TUGMA: O'ynash (Yakka Poyga) */}
        <button
          type="button"
          onClick={() => setShowPlaySoloModal(true)}
          className="interactive-card shimmer-gleam animate-neon-emerald flex items-center gap-2.5 px-6 sm:px-8 py-3 sm:py-3.5 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 hover:from-emerald-300 hover:to-green-400 text-slate-950 font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-emerald-500/40 hover:shadow-emerald-500/60 transition-all cursor-pointer active:scale-95 group"
          title="Yakka poyga sozlamalarini tanlash va o'yinni boshlash"
        >
          <div className="w-8 h-8 rounded-xl bg-slate-950/20 border border-black/20 flex items-center justify-center text-slate-950 group-hover:scale-110 transition-transform">
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </div>
          <div className="text-left leading-none">
            <span className="block text-[9px] uppercase tracking-wider text-slate-900/80 font-mono font-bold">START</span>
            <span className="text-sm sm:text-base font-black tracking-tight">Oʻynash</span>
          </div>
          <ArrowRight className="w-4 h-4 stroke-[3] group-hover:translate-x-1 transition-transform ml-1 hidden xs:inline" />
        </button>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: SAYTGA ILK BOR TASHRIF BUYURGANDA ISM SO'RASH     */}
      {/* ========================================================= */}
      {showFirstTimeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-backdrop-fade">
          <div className="relative w-full max-w-md bg-[#0a0f1d] border-2 border-cyan-500/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.35)] text-center space-y-4 animate-modal-pop">
            <div className="w-18 h-18 rounded-full p-1 bg-gradient-to-tr from-cyan-400 via-blue-500 to-emerald-400 shadow-[0_0_30px_rgba(6,182,212,0.6)] flex items-center justify-center mx-auto animate-bounce overflow-hidden">
              <img
                src="/type-groups-logo.png"
                alt="Type Groups Logo"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                TYPING GROUPS ga Xush Kelibsiz!
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Poygalarda ishtirok etish va natijalaringizni saqlash uchun ismingiz yoki poygachi taxallusingizni kiriting:
              </p>
            </div>

            <form onSubmit={handleSaveFirstName} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Ismingiz:
                </label>
                <input
                  type="text"
                  value={tempFirstName}
                  onChange={(e) => setTempFirstName(e.target.value)}
                  placeholder="Masalan: Shoxrux, Azim, Champion..."
                  maxLength={20}
                  autoFocus
                  required
                  className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 rounded-xl text-white font-bold text-sm outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={!tempFirstName.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 disabled:opacity-50 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-cyan-500/30 transition-all cursor-pointer active:scale-95"
              >
                Saqlash va Boshlash 🚀
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: "YAKKA POYGA" — FAQAT TIL TANLASH (O'ZBEK / ENGLISH) */}
      {/* ========================================================= */}
      {showPlaySoloModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-backdrop-fade">
          <div className="relative w-full max-w-sm bg-[#0a0f1d] border-2 border-emerald-500/50 rounded-3xl p-6 shadow-[0_0_50px_rgba(16,185,129,0.3)] space-y-5 animate-modal-pop">
            {/* Yopish */}
            <button
              onClick={() => setShowPlaySoloModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Oʻyin Tili</h3>
                <p className="text-xs text-slate-400">Poyga uchun tilni tanlang</p>
              </div>
            </div>

            {/* Faqat Til Tanlash: O'zbekcha / English */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setSoloLanguage('uz')}
                className={`py-3.5 px-3 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                  soloLanguage === 'uz'
                    ? 'border-emerald-400 bg-emerald-950/80 text-emerald-200 font-black shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/40'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="text-2xl">🇺🇿</span>
                <span className="text-sm font-black">Oʻzbekcha</span>
                <span className="text-[10px] opacity-75 font-mono">Lotin alifbosi</span>
              </button>

              <button
                type="button"
                onClick={() => setSoloLanguage('en')}
                className={`py-3.5 px-3 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                  soloLanguage === 'en'
                    ? 'border-emerald-400 bg-emerald-950/80 text-emerald-200 font-black shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/40'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="text-2xl">🇬🇧</span>
                <span className="text-sm font-black">English</span>
                <span className="text-[10px] opacity-75 font-mono">Speed typing</span>
              </button>
            </div>

            {/* Start tugmasi */}
            <button
              type="button"
              onClick={handleConfirmStartSolo}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 hover:from-emerald-300 hover:to-green-400 text-slate-950 font-black text-base rounded-2xl shadow-xl shadow-emerald-500/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Poygani Boshlash (3-2-1) 🚀</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: "GURUHGA QO'SHILISH" (6 RAQAMLI PIN KOD) */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-backdrop-fade">
          <div className="relative w-full max-w-md bg-[#0a0f1d] border-2 border-cyan-500/50 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(6,182,212,0.3)] space-y-4 animate-modal-pop">
            <button
              onClick={() => setShowJoinModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Guruhga Qoʻshilish</h3>
                <p className="text-xs text-slate-400">Doʻstingiz bergan 6 xonali xona ID kodini kiriting</p>
              </div>
            </div>

            {!joinedRoomId ? (
              // 1-bosqich: PIN kod kiritish va "Guruhga qo'shilmoqda..." holati
              <>
                {errorMsg && (
                  <div className="p-2.5 bg-rose-950/90 border border-rose-500/60 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleConfirmJoin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 font-mono text-center">
                      6 Xonali Xona PIN Kodi:
                    </label>
                    <input
                      type="text"
                      value={joinPin}
                      onChange={(e) => setJoinPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      autoFocus
                      required
                      disabled={isJoiningGroup}
                      className="w-full text-center text-3xl font-black font-mono tracking-[0.4em] py-3.5 bg-slate-900 border-2 border-slate-700 focus:border-cyan-400 rounded-2xl text-cyan-300 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={joinPin.trim().length !== 6 || isJoiningGroup}
                    className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 disabled:opacity-50 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-cyan-500/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isJoiningGroup ? (
                      <>
                        <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Guruhga qoʻshilmoqda...</span>
                      </>
                    ) : (
                      <>
                        <span>Guruhga Kirish</span>
                        <ArrowRight className="w-4 h-4 stroke-[3]" />
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              // 2-bosqich: Guruhga qo'shilgach modal yopilmaydi va jonli a'zolar jadvali chiqadi
              <div className="text-center space-y-4 py-1">
                <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-400/50 flex items-center justify-center text-emerald-400 text-xl mx-auto shadow-lg shadow-emerald-500/20">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Guruhga Muvaffaqiyatli Qoʻshildingiz!</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Xona PIN kodi: <span className="font-mono font-bold text-cyan-300">{joinedRoomId}</span>
                  </p>
                </div>

                {/* GURUHGA QO'SHILGAN FOYDALANUVCHILAR JADVALI */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-left space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                        Guruh A'zolari ({joinParticipants.length}/10)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>Jonli</span>
                    </div>
                  </div>

                  {/* Foydalanuvchilar Jadvali */}
                  <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/70 max-h-48 overflow-y-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="text-[10px] text-slate-400 uppercase font-mono bg-slate-900/90 border-b border-slate-800">
                        <tr>
                          <th className="py-1.5 px-2.5">#</th>
                          <th className="py-1.5 px-2.5">Poygachi Ismi</th>
                          <th className="py-1.5 px-2.5">Mashina</th>
                          <th className="py-1.5 px-2.5 text-right">Rol</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        {joinParticipants.map((p, idx) => {
                          const pCar = FAMOUS_CARS.find(c => c.id === p.carId) || FAMOUS_CARS[0];
                          const isHost = p.isCreator;
                          const isMe = p.name === name;

                          return (
                            <tr
                              key={p.id}
                              className={`transition-colors ${
                                isHost
                                  ? 'bg-gradient-to-r from-amber-950/70 via-yellow-950/40 to-amber-950/70 font-semibold'
                                  : 'hover:bg-slate-900/50'
                              }`}
                            >
                              <td className="py-2 px-2.5 font-mono text-slate-500 font-bold">
                                {isHost ? '👑' : idx + 1}
                              </td>
                              <td className="py-2 px-2.5">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`truncate max-w-[120px] ${
                                      isHost
                                        ? 'text-amber-300 font-black drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                                        : 'text-white font-bold'
                                    }`}
                                  >
                                    {p.name}
                                  </span>
                                  {isHost && (
                                    <span className="px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black rounded text-[9px] font-mono flex items-center gap-0.5 shadow-sm">
                                      <Crown className="w-2.5 h-2.5 fill-current" /> Egasi
                                    </span>
                                  )}
                                  {isMe && !isHost && (
                                    <span className="px-1.5 py-0.2 bg-emerald-950 border border-emerald-500/50 text-emerald-300 rounded text-[9px] font-mono font-bold">
                                      Siz
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-2 px-2.5">
                                <div className="flex items-center gap-1.5 text-slate-300">
                                  <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: pCar.bodyColor }} />
                                  <span className="truncate max-w-[90px] font-mono text-[11px]">{pCar.shortLabel}</span>
                                </div>
                              </td>
                              <td className="py-2 px-2.5 text-right">
                                {isHost ? (
                                  <span className="text-[10px] font-mono font-bold text-amber-400">
                                    Xona Egasi
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-mono font-bold text-emerald-400">
                                    Aʼzo ✓
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <p className="text-[11px] text-amber-400/90 text-center animate-pulse pt-1 font-mono">
                    👑 Guruh egasi poygani boshlashi kutilmoqda...
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleEnterJoinedRoom}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Poyga Xonasiga Kirish</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 4: "GURUH YARATISH" (NOMI, MASOFA VA KATTA ID) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-backdrop-fade">
          <div className="relative w-full max-w-lg bg-[#0a0f1d] border-2 border-cyan-500/50 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(6,182,212,0.3)] space-y-5 animate-modal-pop">
            <button
              onClick={() => {
                setShowCreateModal(false);
                setCreatedRoomId(null);
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {!createdRoomId ? (
              // 1-bosqich: Nom va Masofani kiritish
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Yangi Guruh Yaratish</h3>
                    <p className="text-xs text-slate-400">Guruh nomi va poyga masofasini belgilang</p>
                  </div>
                </div>

                <form onSubmit={handleConfirmCreateGroup} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Guruh Nomi:
                    </label>
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="Masalan: Tezkor Poygachilar"
                      maxLength={30}
                      required
                      className="w-full px-4 py-2.5 bg-slate-900 border-2 border-slate-700 focus:border-cyan-400 rounded-xl text-white font-bold text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2 font-mono">
                      Poyga Masofasi (Metrlarda):
                    </label>
                    <div className="grid grid-cols-5 gap-1.5 mb-2">
                      {[50, 100, 500, 1000, 1500].map((dist) => (
                        <button
                          key={dist}
                          type="button"
                          onClick={() => setNewGroupDistance(dist)}
                          className={`py-2 px-1 rounded-xl border text-center text-xs font-mono font-bold transition-all cursor-pointer ${
                            newGroupDistance === dist
                              ? 'border-cyan-400 bg-cyan-950 text-cyan-200'
                              : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {dist}m
                        </button>
                      ))}
                    </div>
                  </div>

                  {createGroupError && (
                    <div className="p-2.5 bg-rose-950/90 border border-rose-500/60 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{createGroupError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isCreatingGroup}
                    className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 disabled:opacity-60 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-cyan-500/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isCreatingGroup ? (
                      <>
                        <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Bazada Yaratilmoqda...</span>
                      </>
                    ) : (
                      <span>Xonani Yaratish va ID Olish 🚀</span>
                    )}
                  </button>
                </form>
              </>
            ) : (
              // 2-bosqich: KATTA QILIB ID RAQAMINI KO'RSATISH
              <div className="text-center space-y-4 py-2">
                <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-400/50 flex items-center justify-center text-emerald-400 text-xl mx-auto shadow-lg shadow-emerald-500/20">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Guruh Muvaffaqiyatli Yaratildi!</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Doʻstlaringizga ushbu 6 xonali ID raqamini yuboring:
                  </p>
                </div>

                {/* KATTA QILIB CHIQARILGAN XONA ID RAQAMI */}
                <div className="p-4 bg-slate-950 border-2 border-cyan-400/80 rounded-2xl shadow-xl shadow-cyan-500/20 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-1 font-bold">
                    XONA PIN KODI
                  </span>
                  <span className="text-4xl sm:text-5xl font-black font-mono tracking-[0.3em] text-white">
                    {createdRoomId}
                  </span>
                </div>

                {/* GURUHGA QO'SHILGAN FOYDALANUVCHILAR JADVALI */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-left space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                        Guruh A'zolari ({modalParticipants.length}/10)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>Jonli</span>
                    </div>
                  </div>

                  {/* Foydalanuvchilar Jadvali */}
                  <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/70 max-h-40 overflow-y-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="text-[10px] text-slate-400 uppercase font-mono bg-slate-900/90 border-b border-slate-800">
                        <tr>
                          <th className="py-1.5 px-2.5">#</th>
                          <th className="py-1.5 px-2.5">Poygachi Ismi</th>
                          <th className="py-1.5 px-2.5">Mashina</th>
                          <th className="py-1.5 px-2.5 text-right">Holat</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        {modalParticipants.map((p, idx) => {
                          const pCar = FAMOUS_CARS.find(c => c.id === p.carId) || FAMOUS_CARS[0];
                          const isHost = p.isCreator;

                          return (
                            <tr
                              key={p.id}
                              className={`transition-colors ${
                                isHost
                                  ? 'bg-gradient-to-r from-amber-950/70 via-yellow-950/40 to-amber-950/70 font-semibold'
                                  : 'hover:bg-slate-900/50'
                              }`}
                            >
                              <td className="py-2 px-2.5 font-mono text-slate-500 font-bold">
                                {isHost ? '👑' : idx + 1}
                              </td>
                              <td className="py-2 px-2.5">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`truncate max-w-[120px] ${
                                      isHost
                                        ? 'text-amber-300 font-black drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                                        : 'text-white font-bold'
                                    }`}
                                  >
                                    {p.name}
                                  </span>
                                  {isHost && (
                                    <span className="px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black rounded text-[9px] font-mono flex items-center gap-0.5 shadow-sm">
                                      <Crown className="w-2.5 h-2.5 fill-current" /> Egasi
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-2 px-2.5">
                                <div className="flex items-center gap-1.5 text-slate-300">
                                  <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: pCar.bodyColor }} />
                                  <span className="truncate max-w-[100px] font-mono text-[11px]">{pCar.shortLabel}</span>
                                </div>
                              </td>
                              <td className="py-2 px-2.5 text-right">
                                {isHost ? (
                                  <span className="text-[10px] font-mono font-bold text-amber-400">
                                    Xona Egasi
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-mono font-bold text-emerald-400">
                                    Tayyor ✓
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {modalParticipants.length <= 1 && (
                    <p className="text-[11px] text-slate-400 text-center animate-pulse pt-1">
                      ⏳ Doʻstlaringiz kodni kiritib ulanishini kutilmoqda...
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCopyCreatedPin}
                    className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    {copiedPin ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
                    <span>{copiedPin ? 'Nusxalandi!' : 'Kodni Nusxalash'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleEnterCreatedRoom}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Poyga Xonasiga Kirish</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: MASHINANI ALMASHTIRISH (GARAGE) */}
      {showCarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-backdrop-fade">
          <div className="relative w-full max-w-2xl bg-[#0a0f1d] border-2 border-amber-500/50 rounded-3xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.25)] space-y-4 animate-modal-pop">
            <button
              onClick={() => setShowCarModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-400/40 flex items-center justify-center text-amber-300">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Avtomobillar Garaji</h3>
                <p className="text-xs text-slate-400">Poyga uchun oʻzingizga yoqqan superkarni tanlang</p>
              </div>
            </div>

            {/* 10 ta avtomobil ro'yxati */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-h-[60vh] overflow-y-auto p-1">
              {FAMOUS_CARS.map((car: RacingCar) => {
                const isSelected = selectedCarId === car.id;
                return (
                  <button
                    key={car.id}
                    type="button"
                    onClick={() => handleSelectCar(car.id)}
                    className={`p-3 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-amber-950/60 shadow-lg shadow-amber-500/20 ring-1 ring-amber-400'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="w-4 h-4 rounded-full border border-slate-700 shadow-sm shrink-0"
                        style={{ backgroundColor: car.bodyColor }}
                      />
                      <span className="text-[10px] font-mono font-black text-amber-400">
                        {car.powerHp} HP
                      </span>
                    </div>

                    <div className="min-w-0">
                      <span className="text-xs font-black text-white block leading-tight truncate">
                        {car.name}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate font-mono uppercase mt-0.5">
                        {car.brand}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="mt-2 text-[9px] font-mono font-bold text-amber-300 flex items-center gap-1">
                        <Check className="w-3 h-3 text-amber-400" /> Tanlangan
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: ISMNI TAHRIRLASH MODALI */}
      {showEditNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-backdrop-fade">
          <div className="relative w-full max-w-sm bg-[#0a0f1d] border-2 border-slate-700/80 rounded-2xl p-5 shadow-2xl space-y-4 animate-modal-pop">
            <button
              onClick={() => setShowEditNameModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-black text-white">Haydovchi Ismini Oʻzgartirish</h3>

            <form onSubmit={handleSaveEditedName} className="space-y-3">
              <input
                type="text"
                value={editNameInput}
                onChange={(e) => setEditNameInput(e.target.value)}
                placeholder="Yangi ism..."
                maxLength={20}
                autoFocus
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl text-white font-bold text-sm outline-none"
              />

              <button
                type="submit"
                className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Saqlash
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
