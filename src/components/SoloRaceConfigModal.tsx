import React, { useState, useEffect } from 'react';
import { Play, X, Globe, Gauge, Flag, Check, RotateCcw } from 'lucide-react';
import { DifficultyLevel } from '../types';
import { GameLanguage } from '../data/words';

interface SoloRaceConfigModalProps {
  isOpen: boolean;
  initialLanguage: GameLanguage;
  initialDifficulty: DifficultyLevel;
  initialDistance: number;
  onClose: () => void;
  onStart: (language: GameLanguage, difficulty: DifficultyLevel, distance: number) => void;
}

export const SoloRaceConfigModal: React.FC<SoloRaceConfigModalProps> = ({
  isOpen,
  initialLanguage,
  initialDifficulty,
  initialDistance,
  onClose,
  onStart
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<GameLanguage>(initialLanguage);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>(initialDifficulty);
  const [selectedDistance, setSelectedDistance] = useState<number>(initialDistance);

  // Modal ochilganda avvalgi o'yindagi tanlangan parametrlarni qayta tiklash
  useEffect(() => {
    if (isOpen) {
      setSelectedLanguage(initialLanguage);
      setSelectedDifficulty(initialDifficulty);
      setSelectedDistance(initialDistance);
    }
  }, [isOpen, initialLanguage, initialDifficulty, initialDistance]);

  // Enter tugmasi bosilganda darhol yangi poygani boshlash
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onStart(selectedLanguage, selectedDifficulty, selectedDistance);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedLanguage, selectedDifficulty, selectedDistance, onStart, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart(selectedLanguage, selectedDifficulty, selectedDistance);
  };

  return (
    <div data-config-modal="true" className="fixed inset-0 z-[60] flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-backdrop-fade">
      <div className="relative w-full max-w-lg bg-[#090e1c] border-2 border-cyan-500/50 rounded-3xl p-5 sm:p-6 shadow-[0_0_55px_rgba(6,182,212,0.4)] text-slate-100 flex flex-col gap-4 overflow-hidden animate-modal-pop my-auto">
        {/* Yopish tugmasi */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Modalni yopish"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. Sarlavha */}
        <div className="flex items-center gap-3 border-b border-slate-800/80 pb-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/30 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-[#0a0f1d] rounded-[14px] flex items-center justify-center text-emerald-400">
              <RotateCcw className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-black text-white font-mono tracking-tight flex items-center gap-2">
              <span>Qayta Poyga Sozlamalari</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono font-bold">
                Yakka Poyga
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Poyga tili, botlar darajasi va masofasini tanlab yangi poygani boshlang
            </p>
          </div>
        </div>

        {/* 2. O'YIN TILI TANLASH (O'ZBEKCHA / ENGLISH) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              1. Oʻyin Tili:
            </span>
            <span className="text-cyan-400 font-bold font-mono">
              {selectedLanguage === 'uz' ? '🇺🇿 Oʻzbekcha (Lotin)' : '🇬🇧 English'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSelectedLanguage('uz')}
              className={`p-2.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                selectedLanguage === 'uz'
                  ? 'border-emerald-400 bg-emerald-950/70 text-white font-black shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400/50 scale-[1.01]'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <span className="text-2xl shrink-0">🇺🇿</span>
              <div className="leading-tight">
                <span className="block text-xs font-bold">Oʻzbekcha</span>
                <span className="text-[10px] text-slate-400 font-mono">Lotin alifbosi</span>
              </div>
              {selectedLanguage === 'uz' && <Check className="w-4 h-4 text-emerald-400 ml-auto shrink-0" />}
            </button>

            <button
              type="button"
              onClick={() => setSelectedLanguage('en')}
              className={`p-2.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                selectedLanguage === 'en'
                  ? 'border-emerald-400 bg-emerald-950/70 text-white font-black shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400/50 scale-[1.01]'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <span className="text-2xl shrink-0">🇬🇧</span>
              <div className="leading-tight">
                <span className="block text-xs font-bold">English</span>
                <span className="text-[10px] text-slate-400 font-mono">Speed typing</span>
              </div>
              {selectedLanguage === 'en' && <Check className="w-4 h-4 text-emerald-400 ml-auto shrink-0" />}
            </button>
          </div>
        </div>

        {/* 3. DARAJA (QIYINLIK DARAJASI: OSON, O'RTA, QIYIN) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              2. Poyga Darajasi (Botlar tezligi):
            </span>
            <span className="font-bold text-amber-400 font-mono">
              {selectedDifficulty === 'easy' ? '🟢 Oson (~15 WPM)' : selectedDifficulty === 'medium' ? '🟡 Oʻrta (~28 WPM)' : '🔴 Qiyin (~50 WPM)'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'easy', label: 'Oson', icon: '🟢', desc: '~15 WPM', color: 'border-emerald-500 bg-emerald-950/60 text-emerald-300 shadow-emerald-500/20' },
              { id: 'medium', label: 'Oʻrta', icon: '🟡', desc: '~28 WPM', color: 'border-amber-500 bg-amber-950/60 text-amber-300 shadow-amber-500/20' },
              { id: 'hard', label: 'Qiyin', icon: '🔴', desc: '~50 WPM', color: 'border-rose-500 bg-rose-950/60 text-rose-300 shadow-rose-500/20' }
            ].map((item) => {
              const isSelected = selectedDifficulty === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedDifficulty(item.id as DifficultyLevel)}
                  className={`p-2.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    isSelected
                      ? `${item.color} shadow-lg ring-1 ring-white/20 font-bold scale-[1.02]`
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-black text-xs sm:text-sm flex items-center gap-1">
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </div>
                  <span className="text-[10px] block opacity-80 font-mono">{item.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. MASOFA (50, 100, 200, 500, 1000, 1500 METR) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Flag className="w-3.5 h-3.5 text-emerald-400" />
              3. Poyga Masofasi:
            </span>
            <span className="text-emerald-400 font-bold font-mono">
              🏁 {selectedDistance} metr
            </span>
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {[
              { dist: 50, tag: 'Tezkor' },
              { dist: 100, tag: 'Klassik' },
              { dist: 200, tag: 'Sprint' },
              { dist: 500, tag: 'Oʻrta' },
              { dist: 1000, tag: 'Uzoq' },
              { dist: 1500, tag: 'Marafon' }
            ].map(({ dist, tag }) => {
              const isSelected = selectedDistance === dist;
              return (
                <button
                  key={dist}
                  type="button"
                  onClick={() => setSelectedDistance(dist)}
                  className={`py-2 px-1 rounded-xl border-2 text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-400 bg-emerald-950 text-emerald-200 font-black shadow-md shadow-emerald-500/30 ring-1 ring-emerald-400/50 scale-[1.03]'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="block text-xs sm:text-sm font-black font-mono leading-tight">{dist}m</span>
                  <span className="text-[9px] block text-slate-500 font-sans truncate">{tag}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Xulosa qatori */}
        <div className="px-3.5 py-2 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between text-[11px] font-mono text-slate-300">
          <span className="text-slate-400">Tanlangan sozlamalar:</span>
          <span className="font-bold text-white flex items-center gap-2">
            <span>{selectedLanguage === 'uz' ? '🇺🇿 Oʻzbekcha' : '🇬🇧 English'}</span>
            <span className="text-slate-600">·</span>
            <span>
              {selectedDifficulty === 'easy' ? '🟢 Oson' : selectedDifficulty === 'medium' ? '🟡 Oʻrta' : '🔴 Qiyin'}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-400">🏁 {selectedDistance}m</span>
          </span>
        </div>

        {/* 6. Pastki tugmalar */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
          >
            Bekor qilish
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/30 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>KEYINGI OʻYINNI BOSHLASH 🚀</span>
          </button>
        </div>
      </div>
    </div>
  );
};
