import React from 'react';
import { Play, Volume2, X, Check } from 'lucide-react';
import { SwitchSoundType, sounds } from '../utils/soundEffects';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartRace: () => void;
  currentSound: SwitchSoundType;
  onSelectSound: (sound: SwitchSoundType) => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  onStartRace,
  currentSound,
  onSelectSound
}) => {
  if (!isOpen) return null;

  const soundOptions: { id: SwitchSoundType; label: string; desc: string }[] = [
    { id: 'thock', label: 'Chuqur Thock', desc: 'Yumshoq yoqimli akustik tovush' },
    { id: 'blue', label: 'Cherry Moviy', desc: 'Aniq chertuvchi jarangdor ovoz' },
    { id: 'brown', label: 'Taktil Jigarrang', desc: 'Yengil mexanik zarba sezgisi' },
    { id: 'red', label: 'Chiziqli Qizil', desc: 'Ravon, deyarli sokin past bosim' },
    { id: 'off', label: 'Ovozsiz', desc: 'Ovoz effektlarisiz sokin rejim' }
  ];

  const handleTestSound = (type: SwitchSoundType) => {
    onSelectSound(type);
    sounds.setSoundType(type);
    sounds.playKey('Space', true, false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0b101e] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-center">
        {/* Yopish tugmasi */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
          aria-label="Oynani yopish"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Rasmiy brend logotipi */}
        <div className="flex justify-center mb-4">
          <img
            src="/type-groups-logo.png"
            alt="TYPING GROUPS Rasmiy Logotipi"
            className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-full"
            width={112}
            height={112}
          />
        </div>

        {/* Brend sarlavhasi */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
          TYPING <span className="text-cyan-400">GROUPS</span>
        </h2>
        <p className="text-xs uppercase tracking-widest text-cyan-300/90 font-semibold mb-4">
          WORKING CODE tomonidan yaratilgan
        </p>

        <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto mb-6">
          Dasturchilar, muhandislar va tez yozuv ixlosmandlari uchun raqobatbardosh klaviatura maydoni.
          Jonli guruhli poygalarda qatnashing, jamoangiz bilan peshqadamlikka erishing va aniqlikni charxlang.
        </p>

        {/* Klaviatura switch ovozi tanlagichi */}
        <div className="text-left mb-6 bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              Mexanik Klaviatura Ovoz Sintizatori
            </span>
            <span className="text-[11px] text-slate-400">Eshitib koʻrish uchun bosing</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {soundOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleTestSound(opt.id)}
                className={`px-2.5 py-2 text-xs rounded-lg text-left transition-all border ${
                  currentSound === opt.id
                    ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200'
                    : 'border-slate-800 bg-slate-950/50 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-medium flex items-center justify-between">
                  <span>{opt.label}</span>
                  {currentSound === opt.id && <Check className="w-3 h-3 text-cyan-400" />}
                </div>
                <div className="text-[10px] text-slate-400 truncate">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Harakatlar */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              onClose();
              onStartRace();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-cyan-500/20 transition-all duration-150"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Poyga Maydoniga Kirish</span>
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 rounded-xl transition-colors"
          >
            Guruhlar va Reytingni Koʻrish
          </button>
        </div>
      </div>
    </div>
  );
};
