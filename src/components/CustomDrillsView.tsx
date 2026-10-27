import React, { useState } from 'react';
import { Quote } from '../types';
import { Code2, FileCode, Play, Sparkles } from 'lucide-react';

interface CustomDrillsViewProps {
  onSelectPassage: (quote: Quote) => void;
}

const PRESET_DRILLS: Quote[] = [
  {
    id: 'drill-react-hook',
    text: 'const [tezlik, setTezlik] = useState<number>(0); useEffect(() => { console.log("Tezlik:", tezlik); }, [tezlik]);',
    source: 'React State Hook Mashqi',
    category: 'programming',
    difficulty: 'medium'
  },
  {
    id: 'drill-arrow-funcs',
    text: 'const tozalash = (matn: string): string => matn.trim().replace(/[^a-zA-Z0-9]/g, "").toLowerCase();',
    source: 'Regex va Arrow Funksiyalar',
    category: 'programming',
    difficulty: 'hard'
  },
  {
    id: 'drill-symbols',
    text: '{ [ ( ) ] } == !== === >= <= && || !? : ; -> => $ # @ % ^ & * ~ ` / \\',
    source: 'Dasturchi Maxsus Belgilar Sinovi',
    category: 'speed_drill',
    difficulty: 'hard'
  },
  {
    id: 'drill-python',
    text: 'def tez_saralash(royxat: list) -> list: return tez_saralash([x for x in royxat[1:] if x <= royxat[0]]) + [royxat[0]] if royxat else []',
    source: 'Python Saralash Algoritmi',
    category: 'programming',
    difficulty: 'hard'
  },
  {
    id: 'drill-working-code',
    text: 'WORKING CODE — yuqori samarali texnologiyalar, chaqqon barmoqlar va sifatli dasturiy taʼminot uygʻunligi.',
    source: 'WORKING CODE Shiori',
    category: 'tech',
    difficulty: 'easy'
  }
];

export const CustomDrillsView: React.FC<CustomDrillsViewProps> = ({ onSelectPassage }) => {
  const [customText, setCustomText] = useState('');
  const [customTitle, setCustomTitle] = useState('');

  const handleLaunchCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;

    onSelectPassage({
      id: `custom-${Date.now()}`,
      text: customText.trim(),
      source: customTitle.trim() || 'Foydalanuvchi Maxsus Matni',
      category: 'speed_drill',
      difficulty: 'medium'
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Sarlavha */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Code2 className="w-6 h-6 text-cyan-400" />
            <span>Dasturchilar Kodi va Maxsus Matnlar</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Dasturlash sintaksisi, maxsus belgilar, jingalak qavslar va oʻz matningizni yuklab mashq qiling.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Saralangan kod mashqlari */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-cyan-400" />
            <span>Tayyor Dasturlash Mashqlari</span>
          </h3>

          <div className="space-y-3">
            {PRESET_DRILLS.map((drill) => (
              <div
                key={drill.id}
                className="p-4 bg-[#090e1b] border border-slate-800 hover:border-cyan-500/50 rounded-xl transition-all duration-150 flex flex-col justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-semibold text-cyan-400">{drill.source}</span>
                    <span className="capitalize">{drill.difficulty === 'easy' ? 'Oson' : drill.difficulty === 'medium' ? 'Oʻrtacha' : 'Qiyin'}</span>
                  </div>
                  <pre className="font-mono text-xs text-slate-200 bg-slate-950 p-2.5 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-900">
                    {drill.text}
                  </pre>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => onSelectPassage(drill)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 group-hover:bg-cyan-300 rounded-lg transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Mashqni Boshlash</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Maxsus matn kiritish bloki */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Oʻz Matningizni Kiriting</span>
          </h3>

          <form
            onSubmit={handleLaunchCustom}
            className="p-5 bg-[#090e1b] border border-slate-800 rounded-xl space-y-4 text-xs"
          >
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                Matn Nomi yoki Manbasi
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Masalan: Maqola parchalari / Algoritm"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                Yoziladigan Matn Tarkibi
              </label>
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Oʻzingiz mashq qilmoqchi boʻlgan istalgan oʻzbekcha matn, kod yoki xatboshini shu yerga joylang..."
                rows={8}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono leading-relaxed focus:outline-none focus:border-cyan-500"
              />
              <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1 font-mono-numbers">
                <span>{customText.length} ta belgi</span>
                <span>{customText.trim() ? customText.trim().split(/\s+/).length : 0} ta soʻz</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={!customText.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 disabled:opacity-50 text-slate-950 font-bold rounded-lg hover:from-cyan-300 hover:to-blue-400 transition-all shadow-md shadow-cyan-500/20"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Maxsus Matn Bilan Sinovni Boshlash</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
