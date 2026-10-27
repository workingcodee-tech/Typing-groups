import React, { useState, useEffect } from 'react';
import { Trophy, Users, PlusCircle, ArrowRight, Volume2, VolumeX, Car, AlertCircle } from 'lucide-react';
import { CarSelector } from './CarSelector';
import { FAMOUS_CARS } from '../data/cars';
import { DifficultyLevel } from '../types';
import { SwitchSoundType } from '../utils/soundEffects';

interface HomeModeSelectorProps {
  currentUser: {
    id: string;
    name: string;
    carId: string;
  };
  onUpdateUser: (name: string, carId: string) => void;
  onStartSolo: (userName: string, carId: string, difficulty: DifficultyLevel, distance?: number) => void;
  onJoinGroup: (roomId: string, userName: string, carId: string) => void;
  onCreateGroup: (groupName: string, userName: string, carId: string, targetDistance?: number) => void;
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
  soundType,
  onToggleSound,
  initialRoomId = ''
}) => {
  const [name, setName] = useState<string>(currentUser.name || 'Poygachi');
  const [selectedCarId, setSelectedCarId] = useState<string>(currentUser.carId || 'bmw');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [soloDistance, setSoloDistance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('tg_user_dist');
      return saved ? Number(saved) : 100;
    } catch {
      return 100;
    }
  });
  const [groupName, setGroupName] = useState<string>('Tezkor Poygachilar');
  const [targetDistance, setTargetDistance] = useState<number>(100);
  const [joinPin, setJoinPin] = useState<string>(initialRoomId);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [showCarModal, setShowCarModal] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'solo' | 'create' | 'join'>('solo');

  useEffect(() => {
    if (initialRoomId) {
      setJoinPin(initialRoomId);
      setMobileTab('join');
    }
  }, [initialRoomId]);

  const handleNameChange = (val: string) => {
    setName(val);
    try {
      localStorage.setItem('tg_user_name', val);
    } catch {
      // ignore
    }
    onUpdateUser(val, selectedCarId);
  };

  const handleCarChange = (carId: string) => {
    setSelectedCarId(carId);
    try {
      localStorage.setItem('tg_user_car', carId);
    } catch {
      // ignore
    }
    onUpdateUser(name, carId);
    setShowCarModal(false);
  };

  const getCleanName = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMsg('Iltimos, avval ismingizni kiriting!');
      return null;
    }
    setErrorMsg('');
    return trimmed;
  };

  const handleSoloClick = () => {
    const validName = getCleanName();
    if (!validName) return;
    try {
      localStorage.setItem('tg_user_dist', soloDistance.toString());
    } catch {
      // ignore
    }
    onStartSolo(validName, selectedCarId, difficulty, soloDistance);
  };

  const handleCreateClick = (e: React.FormEvent) => {
    e.preventDefault();
    const validName = getCleanName();
    if (!validName) return;

    const gName = groupName.trim() || 'Tezkor Poygachilar';
    onCreateGroup(gName, validName, selectedCarId, targetDistance);
  };

  const handleJoinClick = (e: React.FormEvent) => {
    e.preventDefault();
    const validName = getCleanName();
    if (!validName) return;

    const cleanPin = joinPin.trim().replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      setErrorMsg('Iltimos, 6 raqamli xona kodini (PIN) toʻliq kiriting!');
      return;
    }
    onJoinGroup(cleanPin, validName, selectedCarId);
  };

  const currentCar = FAMOUS_CARS.find(c => c.id === selectedCarId) || FAMOUS_CARS[0];

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col justify-between py-1 px-2 select-none animate-fade-in">
      {/* 1. Header: Logo va Ovoz sozlamasi */}
      <header className="flex items-center justify-between px-3 py-1.5 bg-slate-950/80 border border-slate-800/80 rounded-xl shadow-xl backdrop-blur-md mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-md shadow-emerald-400/50 animate-pulse" />
          <h1 className="text-xs sm:text-sm font-black tracking-tight text-white font-mono flex items-center gap-1.5">
            TYPING <span className="text-emerald-400">GROUPS</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-sans font-bold uppercase">
              POYGA
            </span>
          </h1>
        </div>

        {/* Ovoz sozlamasi */}
        <button
          type="button"
          onClick={onToggleSound}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors shadow-sm"
          title="Tovushni almashtirish"
        >
          {soundType === 'off' ? (
            <>
              <VolumeX className="w-3 h-3 text-rose-400" />
              <span className="text-[11px]">Ovoz: Off</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3 h-3 text-emerald-400" />
              <span className="text-[11px]">{soundType.toUpperCase()}</span>
            </>
          )}
        </button>
      </header>

      {/* Xatolik xabarnomasi */}
      {errorMsg && (
        <div className="mb-2 p-2 bg-rose-950/90 border border-rose-500/60 rounded-xl text-rose-300 text-xs flex items-center justify-center gap-2 animate-bounce">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-bold">{errorMsg}</span>
        </div>
      )}

      {/* 2. Haydovchi Profili (Mobil va kompyuter uchun ixcham bitta qator) */}
      <section className="mb-2.5 p-2 sm:p-2.5 bg-slate-950/80 border border-cyan-500/30 rounded-xl shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          {/* Ism kiritish */}
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs">👤</span>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ismingizni yozing..."
              maxLength={24}
              className="w-full pl-7 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-lg text-white font-bold text-xs sm:text-sm tracking-wide transition-all outline-none"
            />
          </div>

          {/* Mashina tanlash tugmasi */}
          <button
            type="button"
            onClick={() => setShowCarModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-700 hover:border-cyan-400 rounded-lg text-slate-200 cursor-pointer transition-colors shrink-0"
            title="Poyga mashinasini tanlash"
          >
            <span
              className="w-3 h-3 rounded-full border border-slate-600 shrink-0 shadow-sm"
              style={{ backgroundColor: currentCar.bodyColor }}
            />
            <span className="font-bold text-xs text-white">{currentCar.name.split(' ')[0]}</span>
            <span className="text-[10px] text-cyan-400 font-bold">▾</span>
          </button>
        </div>
      </section>

      {/* 3. MOBIL QURILMALAR UCHUN IXCHAM REJIM TANLASH TUGMALARI (Segmented Bar) */}
      <div className="md:hidden flex items-center p-1 bg-slate-950/90 border border-slate-800 rounded-xl mb-2 gap-1">
        <button
          type="button"
          onClick={() => { setMobileTab('solo'); setErrorMsg(''); }}
          className={`flex-1 py-2 px-1 text-center rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            mobileTab === 'solo'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Yakkaxon</span>
        </button>
        <button
          type="button"
          onClick={() => { setMobileTab('create'); setErrorMsg(''); }}
          className={`flex-1 py-2 px-1 text-center rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            mobileTab === 'create'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Guruh Ochish</span>
        </button>
        <button
          type="button"
          onClick={() => { setMobileTab('join'); setErrorMsg(''); }}
          className={`flex-1 py-2 px-1 text-center rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            mobileTab === 'join'
              ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Ulanish</span>
        </button>
      </div>

      {/* 4. ASOSIY REJIM KARTALARI (Mobilda faol tanlangan kartagina ko'rinadi, kompyuterda barchasi yonma-yon) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
        {/* REJIM 1: O'ZIM YOZISHIM (YAKKAXON POYGA) */}
        <div
          className={`p-3.5 sm:p-4 rounded-xl border-2 border-emerald-500/40 bg-gradient-to-b from-[#0a1e17]/95 to-[#06120e]/95 flex flex-col justify-between text-left shadow-xl shadow-black/60 relative overflow-hidden backdrop-blur-md transition-all ${
            mobileTab === 'solo' ? 'block' : 'hidden md:flex'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/60 flex items-center justify-center text-emerald-400 shadow-md">
                <Trophy className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-[10px] font-mono font-black text-emerald-300 bg-emerald-950/90 border border-emerald-600/80 px-2 py-0.5 rounded uppercase">
                1. YAKKAXON MASHQ
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-black text-white mb-1">
              Oʻzim Yozishim
            </h3>
            <p className="text-xs text-slate-300 leading-snug mb-3">
              Mustaqil mashq qiling, 5000 ta soʻz boʻyicha botlar bilan poyga oʻynang va rekord oʻrnating.
            </p>

            {/* Qiyinlik darajasini tanlash */}
            <div className="space-y-1 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Poyga Qiyinligi:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setDifficulty('easy')}
                  className={`py-1.5 px-1 text-center rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    difficulty === 'easy'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  🟢 Oson
                </button>
                <button
                  type="button"
                  onClick={() => setDifficulty('medium')}
                  className={`py-1.5 px-1 text-center rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    difficulty === 'medium'
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  🟡 Oʻrta
                </button>
                <button
                  type="button"
                  onClick={() => setDifficulty('hard')}
                  className={`py-1.5 px-1 text-center rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    difficulty === 'hard'
                      ? 'bg-rose-500 text-white border-rose-400 shadow-sm'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  🔴 Qiyin
                </button>
              </div>
            </div>

            {/* Masofani tanlash: 50m, 100m, 200m, 500m, 1000m */}
            <div className="space-y-1 mt-2.5 mb-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Poyga Masofasi:
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-400">
                  {soloDistance} metr
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {[50, 100, 200, 500, 1000].map((dist) => (
                  <button
                    key={dist}
                    type="button"
                    onClick={() => {
                      setSoloDistance(dist);
                      try {
                        localStorage.setItem('tg_user_dist', dist.toString());
                      } catch {
                        // ignore
                      }
                    }}
                    className={`py-1 text-center rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                      soloDistance === dist
                        ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-slate-950 font-black border-emerald-300 shadow-sm shadow-emerald-500/30'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {dist}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSoloClick}
            className="w-full mt-3 py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-98 transition-all cursor-pointer"
          >
            <span>POYGANI BOSHLASH 🏁</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* REJIM 2: GURUH YARATISHIM (YANGI XONA OCHISH) */}
        <form
          onSubmit={handleCreateClick}
          className={`p-3.5 sm:p-4 rounded-xl border-2 border-cyan-500/40 bg-gradient-to-b from-[#071d24]/95 to-[#041014]/95 flex flex-col justify-between text-left shadow-xl shadow-black/60 relative overflow-hidden backdrop-blur-md transition-all ${
            mobileTab === 'create' ? 'block' : 'hidden md:flex'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/60 flex items-center justify-center text-cyan-400 shadow-md">
                <PlusCircle className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="text-[10px] font-mono font-black text-cyan-300 bg-cyan-950/90 border border-cyan-600/80 px-2 py-0.5 rounded uppercase">
                2. HOST (GURUH OCHISH)
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-black text-white mb-1">
              Guruh Yaratishim
            </h3>
            <p className="text-xs text-slate-300 leading-snug mb-3">
              Doʻstlaringiz uchun xona oching, 6 raqamli PIN kodni oling va bir vaqtda start bering.
            </p>

            <div className="space-y-1 mb-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Guruh Nomi:
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Guruh nomini kiriting..."
                maxLength={30}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-lg text-white text-xs font-semibold outline-none"
              />
            </div>

            <div className="space-y-1 mb-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Trassa Masofasi:
                </label>
                <span className="text-[10px] font-mono font-bold text-cyan-400">
                  {targetDistance} metr
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {[50, 100, 200, 500, 1000].map((dist) => (
                  <button
                    key={dist}
                    type="button"
                    onClick={() => setTargetDistance(dist)}
                    className={`py-1 px-1 rounded-lg border text-[11px] font-mono font-bold transition-all cursor-pointer ${
                      targetDistance === dist
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/30'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {dist}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-3 py-2.5 px-4 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-98 transition-all cursor-pointer"
          >
            <span>GURUHNI YARATISH 👑</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* REJIM 3: GURUHGA QO'SHILISHIM (KOD BILAN ULANISH) */}
        <form
          onSubmit={handleJoinClick}
          className={`p-3.5 sm:p-4 rounded-xl border-2 border-blue-500/40 bg-gradient-to-b from-[#08192b]/95 to-[#050e18]/95 flex flex-col justify-between text-left shadow-xl shadow-black/60 relative overflow-hidden backdrop-blur-md transition-all ${
            mobileTab === 'join' ? 'block' : 'hidden md:flex'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-500/60 flex items-center justify-center text-blue-400 shadow-md">
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-[10px] font-mono font-black text-blue-300 bg-blue-950/90 border border-blue-600/80 px-2 py-0.5 rounded uppercase">
                3. GURUHGA ULANISH
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-black text-white mb-1">
              Guruhga Qoʻshilishim
            </h3>
            <p className="text-xs text-slate-300 leading-snug mb-3">
              Doʻstingiz ochgan 6 raqamli xona kodini (PIN) kiriting va poygaga ulaning.
            </p>

            <div className="space-y-1 mb-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                6 Raqamli Xona PIN Kodi:
              </label>
              <input
                type="text"
                value={joinPin}
                onChange={(e) => setJoinPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Masalan: 489201"
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 focus:border-blue-400 rounded-lg text-white font-mono text-center text-lg tracking-widest font-black outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-3 py-2.5 px-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 active:scale-98 transition-all cursor-pointer"
          >
            <span>XONAGA ULANISH 🚀</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </section>

      {/* Mashina tanlash modali */}
      {showCarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-[#090e1c] border border-cyan-500/40 rounded-2xl shadow-2xl p-4 text-slate-100 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-black text-white">Poyga Mashinasini Tanlang</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCarModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded-lg cursor-pointer"
              >
                Yopish
              </button>
            </div>

            <CarSelector
              selectedCarId={selectedCarId}
              onSelectCar={handleCarChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};
