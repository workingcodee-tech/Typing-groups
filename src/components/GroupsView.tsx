import React, { useState } from 'react';
import { TypeGroup } from '../types';
import { Users, Plus, Hash, Zap, Flame } from 'lucide-react';

interface GroupsViewProps {
  groups: TypeGroup[];
  onToggleJoin: (groupId: string) => void;
  onCreateGroup: (group: Omit<TypeGroup, 'id' | 'weeklyRank' | 'isJoined' | 'membersCount' | 'totalWords' | 'avgWpm' | 'createdAt'>) => void;
  onSelectGroupForRace: (group: TypeGroup) => void;
}

export const GroupsView: React.FC<GroupsViewProps> = ({
  groups,
  onToggleJoin,
  onCreateGroup,
  onSelectGroupForRace
}) => {
  const [filter, setFilter] = useState<'all' | 'joined'>('all');
  const [isCreating, setIsCreating] = useState(false);

  // Yangi guruh formasi
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [description, setDescription] = useState('');
  const [themeColor, setThemeColor] = useState('#00E5FF');
  const [foundedBy, setFoundedBy] = useState('Siz');

  const filteredGroups = filter === 'joined' ? groups.filter((g) => g.isJoined) : groups;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !tag.trim()) return;

    onCreateGroup({
      name: name.trim(),
      tag: tag.trim().toUpperCase(),
      description: description.trim() || 'Tezlik va aniqlik sari intiluvchi jamoaviy klaviatura guruhi.',
      themeColor,
      foundedBy: foundedBy.trim() || 'Siz'
    });

    setName('');
    setTag('');
    setDescription('');
    setIsCreating(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Sarlavha va harakatlar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" />
            <span>Klaviatura Jamoalari va Guruhlar</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Dasturchilar va typistlar klanlariga aʼzo boʻling, umumiy yozuv statistikasini yigʻing va reytingda koʻtariling.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filtrlash tugmalari */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-slate-800 text-cyan-300 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Barcha Guruhlar ({groups.length})
            </button>
            <button
              onClick={() => setFilter('joined')}
              className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap ${
                filter === 'joined'
                  ? 'bg-slate-800 text-cyan-300 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Aʼzo Boʻlganlarim ({groups.filter((g) => g.isJoined).length})
            </button>
          </div>

          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yangi Guruh Oching</span>
          </button>
        </div>
      </div>

      {/* Guruh ochish formasi */}
      {isCreating && (
        <div className="p-6 bg-[#0a101f] border border-cyan-500/40 rounded-2xl shadow-xl animate-fade-in">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>Yangi Type Group Guruhini Roʻyxatdan Oʻtkazish</span>
            </h3>
            <button
              onClick={() => setIsCreating(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Bekor qilish
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Guruh Nomi</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masalan: Samarqand Dasturchilari"
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Klan Tegi (Qisqa kod)</label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value.slice(0, 8))}
                placeholder="Masalan: SAM-DEV"
                maxLength={8}
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono uppercase focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-300 font-medium mb-1">Guruh Haqida / Maqsad</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Guruhning asosiy maqsadi va qoidalari haqida qisqacha maʼlumot..."
                rows={2}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Guruh Rangi</label>
              <div className="flex items-center gap-3">
                {['#00E5FF', '#38BDF8', '#0A84FF', '#06B6D4', '#60A5FA'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setThemeColor(color)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      themeColor === color ? 'scale-110 border-white' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-end justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold rounded-lg hover:from-cyan-300 hover:to-blue-400 transition-all"
              >
                Guruhni Tasdiqlash
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Guruhlar ro'yxati */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGroups.map((group) => (
          <div
            key={group.id}
            className="p-5 bg-[#090e1b] border border-slate-800 hover:border-slate-700/80 rounded-2xl flex flex-col justify-between transition-all duration-150"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-slate-950 text-xs shadow-xs"
                    style={{ backgroundColor: group.themeColor }}
                  >
                    {group.tag.slice(0, 3)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm tracking-tight flex items-center gap-1.5">
                      <span>{group.name}</span>
                      {group.weeklyRank === 1 && (
                        <span title="#1 Reytingdagi Klan">
                          <Flame className="w-3.5 h-3.5 text-amber-400 inline" />
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono-numbers">
                      <span>[{group.tag}]</span>
                      <span aria-hidden="true">·</span>
                      <span>Haftalik #{group.weeklyRank}-oʻrin</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onToggleJoin(group.id)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                    group.isJoined
                      ? 'bg-cyan-950/40 text-cyan-300 border-cyan-800/80 hover:bg-rose-950/40 hover:text-rose-300 hover:border-rose-800/60'
                      : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {group.isJoined ? 'Aʼzo boʻlingan ✓' : 'Aʼzo Boʻlish'}
                </button>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                {group.description}
              </p>
            </div>

            {/* Metrikalar va guruh bilan poyga */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-4 text-slate-400 font-mono-numbers">
                <div>
                  <span className="text-slate-500 text-[11px] block">Oʻrtacha Tezlik</span>
                  <span className="font-bold text-cyan-400">{group.avgWpm} WPM</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Aʼzolar</span>
                  <span className="font-semibold text-slate-200">{group.membersCount} ta</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Jami Soʻzlar</span>
                  <span className="font-semibold text-slate-300">{(group.totalWords / 1000).toFixed(0)}k</span>
                </div>
              </div>

              <button
                onClick={() => onSelectGroupForRace(group)}
                className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Guruh Bilan Yozish</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
