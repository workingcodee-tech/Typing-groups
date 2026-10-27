import React from 'react';
import { Participant } from '../types';
import { Flag, Gauge } from 'lucide-react';

interface RaceTrackProps {
  participants: Participant[];
}

export const RaceTrack: React.FC<RaceTrackProps> = ({ participants }) => {
  return (
    <div className="w-full bg-[#0a0f1d] border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-lg mb-6">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Jonli Guruh Tezlik Yoʻlagi
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono-numbers">
          <span>{participants.filter(p => p.finished).length}</span>
          <span className="text-slate-600">/</span>
          <span>{participants.length} ta ishtirokchi marraga yetdi</span>
        </div>
      </div>

      <div className="space-y-3">
        {participants.map((p) => {
          const isUser = p.isUser;
          return (
            <div key={p.id} className="relative flex flex-col gap-1">
              {/* Ma'lumot qatori */}
              <div className="flex items-center justify-between text-xs px-1">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-base select-none">{p.avatar}</span>
                  <span className={`font-medium truncate ${isUser ? 'text-cyan-300 font-bold' : 'text-slate-300'}`}>
                    {isUser ? 'Siz (Foydalanuvchi)' : p.name}
                  </span>
                  {p.rank && (
                    <span className="px-1.5 py-0.2 bg-cyan-950 text-cyan-400 border border-cyan-800/60 rounded text-[10px] font-mono-numbers">
                      {p.rank}-oʻrin
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 font-mono-numbers text-[11px] text-slate-400">
                  <span className="text-cyan-400 font-semibold">{Math.round(p.currentWpm)} WPM</span>
                  <span className="text-slate-500">{Math.round(p.progress)}%</span>
                </div>
              </div>

              {/* Poyga trassasi */}
              <div className="relative h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                {/* Marra bayrog'i */}
                <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-cyan-500/30 to-transparent flex items-center justify-center">
                  <Flag className="w-2.5 h-2.5 text-cyan-400/80" />
                </div>

                {/* Progress chizig'i */}
                <div
                  className={`h-full rounded-full transition-all duration-200 ease-out ${
                    isUser
                      ? 'bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500 shadow-sm shadow-cyan-400/50'
                      : 'bg-gradient-to-r from-blue-700 to-cyan-700 opacity-80'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(2, p.progress))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
