import React, { useState } from 'react';
import { LeaderboardEntry } from '../types';
import { Trophy, Medal, Flame, Search } from 'lucide-react';

interface LeaderboardViewProps {
  entries: LeaderboardEntry[];
  userBestWpm: number;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  entries,
  userBestWpm
}) => {
  const [filterMode, setFilterMode] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEntries = entries.filter((entry) => {
    const matchesQuery =
      entry.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.groupTag.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesQuery) return false;
    if (filterMode === 'all') return true;
    return entry.mode.toLowerCase().includes(filterMode.toLowerCase());
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Sarlavha */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            <span>Umumiy Tezlik Peshqadamlar Jadvali</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Type Groups doirasida tasdiqlangan eng yuqori klaviatura tezligi va aniqligi rekordlari.
          </p>
        </div>

        {/* Foydalanuvchining shaxsiy rekordi */}
        <div className="flex items-center gap-3 p-2.5 px-4 bg-cyan-950/40 border border-cyan-800/60 rounded-xl">
          <Flame className="w-5 h-5 text-cyan-400" />
          <div className="text-xs">
            <span className="text-slate-400 block">Sizning Shaxsiy Rekordingiz</span>
            <span className="text-base font-bold text-cyan-300 font-mono-numbers">
              {userBestWpm > 0 ? `${userBestWpm} WPM` : 'Hali sinov topshirilmagan'}
            </span>
          </div>
        </div>
      </div>

      {/* Filtrlash va qidiruv */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg w-full sm:w-auto">
          {[
            { id: 'all', label: 'Barcha Yoʻnalishlar' },
            { id: 'sprint', label: 'Sprint' },
            { id: 'matn', label: 'Matn' },
            { id: 'kod', label: 'Kod' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setFilterMode(mode.id)}
              className={`flex-1 sm:flex-initial px-3 py-1.5 font-medium rounded-md transition-colors ${
                filterMode === mode.id
                  ? 'bg-slate-800 text-cyan-300 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Typist ismi yoki klan tegi..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Peshqadamlar jadvali */}
      <div className="bg-[#090e1b] border border-slate-800/90 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-medium">
                <th className="py-3 px-4 w-16 text-center">Oʻrin</th>
                <th className="py-3 px-4">Typist (Foydalanuvchi)</th>
                <th className="py-3 px-4">Guruh Klani</th>
                <th className="py-3 px-4 text-right">Tezlik (WPM)</th>
                <th className="py-3 px-4 text-right">Aniqlik</th>
                <th className="py-3 px-4">Yoʻnalish</th>
                <th className="py-3 px-4 text-right">Sana</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono-numbers">
              {filteredEntries.map((row) => {
                const isTop1 = row.rank === 1;
                const isTop2 = row.rank === 2;
                const isTop3 = row.rank === 3;

                return (
                  <tr
                    key={row.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      row.isUser ? 'bg-cyan-950/30 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 text-center">
                      {isTop1 ? (
                        <span title="1-oʻrin"><Medal className="w-4 h-4 text-amber-400 mx-auto" /></span>
                      ) : isTop2 ? (
                        <span title="2-oʻrin"><Medal className="w-4 h-4 text-slate-300 mx-auto" /></span>
                      ) : isTop3 ? (
                        <span title="3-oʻrin"><Medal className="w-4 h-4 text-amber-600 mx-auto" /></span>
                      ) : (
                        <span className="text-slate-500">{row.rank}-oʻrin</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-sans font-medium text-white flex items-center gap-2">
                      <span>{row.username}</span>
                      {row.isUser && (
                        <span className="px-1.5 py-0.2 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded text-[10px] font-mono">
                          SIZ
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-cyan-400/90 font-mono font-medium">[{row.groupTag}]</span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-cyan-300 text-sm">
                      {row.wpm} <span className="text-xs text-slate-500 font-normal">WPM</span>
                    </td>

                    <td className="py-3.5 px-4 text-right text-slate-200">
                      {row.accuracy.toFixed(1)}%
                    </td>

                    <td className="py-3.5 px-4 font-sans text-slate-400">
                      {row.mode}
                    </td>

                    <td className="py-3.5 px-4 text-right font-sans text-slate-400">
                      {row.date}
                    </td>
                  </tr>
                );
              })}

              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                    Mos keladigan natijalar topilmadi. Oʻz natijangizni qayd etish uchun poygada qatnashing!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
