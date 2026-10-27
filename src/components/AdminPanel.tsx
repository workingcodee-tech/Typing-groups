import React, { useState } from 'react';
import { Quote, TypeGroup } from '../types';
import { Plus, Trash2, Download, RotateCcw, Server, Database, Activity, FileText, Users } from 'lucide-react';

interface AdminPanelProps {
  quotes: Quote[];
  onAddQuote: (quote: Omit<Quote, 'id'>) => void;
  onDeleteQuote: (id: string) => void;
  groups: TypeGroup[];
  onResetDefaults: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  quotes,
  onAddQuote,
  onDeleteQuote,
  groups,
  onResetDefaults
}) => {
  const [activeTab, setActiveTab] = useState<'quotes' | 'groups' | 'system'>('quotes');

  // Yangi matn qo'shish formasi
  const [newText, setNewText] = useState('');
  const [newSource, setNewSource] = useState('');
  const [newCategory, setNewCategory] = useState<Quote['category']>('tech');
  const [newDifficulty, setNewDifficulty] = useState<Quote['difficulty']>('medium');
  const [isAddingQuote, setIsAddingQuote] = useState(false);

  const handleCreateQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim() || !newSource.trim()) return;

    onAddQuote({
      text: newText.trim(),
      source: newSource.trim(),
      category: newCategory,
      difficulty: newDifficulty
    });

    setNewText('');
    setNewSource('');
    setIsAddingQuote(false);
  };

  const handleExportData = () => {
    const data = {
      exportDate: new Date().toISOString(),
      platform: 'Type Groups - WORKING CODE',
      quotesCount: quotes.length,
      groupsCount: groups.length,
      quotes,
      groups
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `type-groups-zaxira-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Rasmiy logotipli Admin paneli sarlavhasi */}
      <div className="p-6 bg-[#090e1b] border border-cyan-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src="/type-groups-logo.png"
            alt="Type Groups Rasmiy Logotipi"
            className="w-12 h-12 object-contain rounded-full shadow-md"
            width={48}
            height={48}
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white">Type Groups Boshqaruv Markazi</h2>
              <span className="px-2 py-0.5 bg-cyan-950 border border-cyan-800/80 text-cyan-400 rounded text-[11px] font-mono">
                ADMIN
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Ishlab chiquvchi: <strong className="text-cyan-300">WORKING CODE</strong> · Tizim Sozlamalari va Matnlar Banki
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportData}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Zaxirani Yuklash</span>
          </button>
          <button
            onClick={() => {
              if (window.confirm('Barcha matnlar va guruhlarni WORKING CODE boshlangʻich holatiga qaytarishni xohlaysizmi?')) {
                onResetDefaults();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-300 hover:text-rose-200 bg-rose-950/40 hover:bg-rose-900/40 rounded-lg transition-colors border border-rose-800/60"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Asliga Qaytarish</span>
          </button>
        </div>
      </div>

      {/* Admin navigatsiya bo'limlari */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('quotes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'quotes'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Matnlar va Iqtiboslar ({quotes.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'groups'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Faol Guruhlar ({groups.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'system'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Tizim Holati</span>
        </button>
      </div>

      {/* 1-Bo'lim: Matnlar boshqaruvi */}
      {activeTab === 'quotes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">Matnlar Banki</h3>
            <button
              onClick={() => setIsAddingQuote((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yangi Matn Qoʻshish</span>
            </button>
          </div>

          {/* Qo'shish formasi */}
          {isAddingQuote && (
            <form onSubmit={handleCreateQuote} className="p-4 bg-slate-900/90 border border-cyan-500/40 rounded-xl space-y-3 text-xs animate-fade-in">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Matn Mazmuni</label>
                <textarea
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Yozish sinovi uchun matnni kiriting..."
                  rows={3}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Manba yoki Muallif</label>
                  <input
                    type="text"
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    placeholder="Masalan: Alisher Navoiy"
                    required
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Boʻlim / Kategoriya</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as Quote['category'])}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="tech">Texnologiya</option>
                    <option value="programming">Dasturlash</option>
                    <option value="speed_drill">Tezlik Mashqi</option>
                    <option value="literature">Adabiyot</option>
                    <option value="philosophy">Hikmatlar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Qiyinlik Darajasi</label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as Quote['difficulty'])}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="easy">Oson</option>
                    <option value="medium">Oʻrtacha</option>
                    <option value="hard">Qiyin</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingQuote(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-400 text-slate-950 font-bold rounded-lg hover:bg-cyan-300"
                >
                  Matnni Saqlash
                </button>
              </div>
            </form>
          )}

          {/* Matnlar ro'yxati */}
          <div className="space-y-2.5">
            {quotes.map((q) => (
              <div
                key={q.id}
                className="p-4 bg-[#090e1b] border border-slate-800 rounded-xl flex items-start justify-between gap-4 text-xs"
              >
                <div className="space-y-1.5">
                  <p className="font-mono text-slate-200 leading-relaxed text-sm">
                    "{q.text}"
                  </p>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-cyan-400 font-medium">{q.source}</span>
                    <span>·</span>
                    <span className="capitalize">{q.category}</span>
                    <span>·</span>
                    <span className="capitalize text-slate-500">
                      {q.difficulty === 'easy' ? 'Oson' : q.difficulty === 'medium' ? 'Oʻrtacha' : 'Qiyin'}
                    </span>
                    <span>·</span>
                    <span className="font-mono-numbers">{q.text.length} ta belgi</span>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteQuote(q.id)}
                  disabled={quotes.length <= 1}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                  title="Matnni oʻchirish"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2-Bo'lim: Guruhlar */}
      {activeTab === 'groups' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-400">
            Platformada roʻyxatdan oʻtgan va tasdiqlangan barcha guruhlarni koʻrib chiqish.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {groups.map((g) => (
              <div key={g.id} className="p-4 bg-[#090e1b] border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{g.name}</span>
                  <span className="font-mono text-cyan-400">[{g.tag}]</span>
                </div>
                <p className="text-slate-400 text-[11px]">{g.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 font-mono-numbers text-slate-400">
                  <span>{g.membersCount} ta aʼzo</span>
                  <span className="text-cyan-300 font-semibold">{g.avgWpm} oʻrtacha WPM</span>
                  <span>#{g.weeklyRank}-oʻrin</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3-Bo'lim: Tizim holati */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono-numbers">
          <div className="p-4 bg-[#090e1b] border border-slate-800 rounded-xl space-y-1">
            <div className="flex items-center gap-2 text-slate-400">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>Poyga Mexanizmi</span>
            </div>
            <div className="text-xl font-bold text-emerald-400">Barqaror · Faol</div>
            <p className="text-[11px] text-slate-500">60Hz kechikishsiz hisoblash</p>
          </div>

          <div className="p-4 bg-[#090e1b] border border-slate-800 rounded-xl space-y-1">
            <div className="flex items-center gap-2 text-slate-400">
              <Database className="w-4 h-4 text-blue-400" />
              <span>Maʼlumotlar Ombori</span>
            </div>
            <div className="text-xl font-bold text-white">LocalStorage + Zaxira</div>
            <p className="text-[11px] text-slate-500">{quotes.length} Matn · {groups.length} Guruh</p>
          </div>

          <div className="p-4 bg-[#090e1b] border border-slate-800 rounded-xl space-y-1">
            <div className="flex items-center gap-2 text-slate-400">
              <Activity className="w-4 h-4 text-sky-400" />
              <span>Rasmiy Aktivlar</span>
            </div>
            <div className="text-xl font-bold text-cyan-300">Rasmiy Logotip Faol</div>
            <p className="text-[11px] text-slate-500">/type-groups-logo.png</p>
          </div>
        </div>
      )}
    </div>
  );
};
