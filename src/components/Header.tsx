import React from 'react';
import { Volume2, VolumeX, LogOut } from 'lucide-react';
import { SwitchSoundType } from '../utils/soundEffects';

interface HeaderProps {
  soundType: SwitchSoundType;
  onToggleSound: () => void;
  activeRoomId?: string | null;
  onLeaveRoom?: () => void;
  onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  soundType,
  onToggleSound,
  activeRoomId,
  onLeaveRoom,
  onGoHome
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#070b14]/95 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Rasmiy brend logotipi - Dumaloq, yakka o'zi */}
        <button
          onClick={onGoHome}
          className="focus:outline-none group cursor-pointer"
          title="TYPING GROUPS - Bosh sahifaga qaytish"
        >
          <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-cyan-400 via-blue-500 to-emerald-400 shadow-[0_0_15px_rgba(6,182,212,0.45)] flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
            <img
              src="/type-groups-logo.png"
              alt="TYPING GROUPS Rasmiy Logotipi"
              className="w-full h-full object-cover rounded-full"
              width={40}
              height={40}
              loading="eager"
            />
          </div>
        </button>

        {/* O'ng tomon: Faol xona belgisi, Tovush o'tkazgich va Chiqish */}
        <div className="flex items-center gap-3">
          {activeRoomId && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-cyan-950/60 border border-cyan-800/60 rounded-lg text-xs font-mono text-cyan-300">
              <span className="text-slate-400">Xona:</span>
              <strong className="text-white font-bold">{activeRoomId}</strong>
            </div>
          )}

          <button
            onClick={onToggleSound}
            className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60 transition-colors"
            title={`Switch tovushi: ${soundType.toUpperCase()}`}
            aria-label="Mexanik klaviatura ovozini almashtirish"
          >
            {soundType === 'off' ? (
              <VolumeX className="w-4 h-4 text-slate-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            )}
          </button>

          {activeRoomId && onLeaveRoom && (
            <button
              onClick={onLeaveRoom}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:text-rose-200 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/60 rounded-lg transition-colors"
              title="Xonani tark etish"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chiqish</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
