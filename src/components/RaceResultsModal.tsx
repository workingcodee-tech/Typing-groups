import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Share2, Award, ArrowRight, Zap, Target, Clock, Activity, CheckCircle2, AlertTriangle, Hash, Trophy, Keyboard } from 'lucide-react';
import { RaceStats, Participant } from '../types';
import { sortRacersByRank } from '../utils/raceRanking';

interface RaceResultsModalProps {
  stats: RaceStats;
  participants: Participant[];
  onRestart: () => void;
  onNextQuote: () => void;
  onSaveScore: () => void;
  hasSaved: boolean;
  isMultiplayer?: boolean;
  isCreator?: boolean;
  onNextRound?: () => void;
}

export const RaceResultsModal: React.FC<RaceResultsModalProps> = ({
  stats,
  participants,
  onRestart,
  onNextQuote,
  onSaveScore,
  hasSaved,
  isMultiplayer = false,
  isCreator = false,
  onNextRound
}) => {
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00E5FF', '#38BDF8', '#0A84FF', '#FFFFFF']
      });
    } catch {
      // test muhitida e'tiborsiz qoldiriladi
    }
  }, []);

  const sortedRacers = sortRacersByRank(participants);

  const userRank = stats.userRank || (sortedRacers.findIndex((p) => p.isUser) + 1);
  const totalRacers = stats.totalRacers || sortedRacers.length;

  const [copied, setCopied] = React.useState(false);
  const handleShare = () => {
    const diffText = stats.difficulty ? (stats.difficulty === 'easy' ? '🟢 Oson' : stats.difficulty === 'medium' ? '🟡 Oʻrta' : '🔴 Qiyin') : '';
    const text = `🏁 Type Groups poygasida ${stats.userRank}-oʻrinni egalladim! ${diffText ? `(${diffText})` : ''}\n🏎️ Masofa: ${stats.distanceMeters || 100} metr\n⏱️ Bosib oʻtish vaqti: ${stats.timeSeconds.toFixed(1)} soniya\n⌨️ Bosilgan belgilar: ${stats.totalChars} ta (${stats.correctChars} toʻgʻri)\n❌ Xatolar: ${stats.incorrectChars} ta\n⚡ Oʻrtacha tezlik: ${stats.wpm} WPM (${stats.accuracy}% aniqlik)\nType Groups da siz ham sinab koʻring!`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Rank text & color
  const getRankBadge = (rank: number) => {
    if (rank === 1) return { label: '1-OʻRIN (Gʻolib 🥇)', color: 'text-amber-400 border-amber-500/40 bg-amber-950/40' };
    if (rank === 2) return { label: '2-OʻRIN (Kumush 🥈)', color: 'text-slate-200 border-slate-400/40 bg-slate-900/60' };
    if (rank === 3) return { label: '3-OʻRIN (Bronza 🥉)', color: 'text-amber-600 border-amber-700/40 bg-amber-950/30' };
    return { label: `${rank}-OʻRIN`, color: 'text-cyan-300 border-cyan-800/60 bg-cyan-950/40' };
  };

  const rankInfo = getRankBadge(userRank);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#090e1a] border border-cyan-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-cyan-950/50 max-h-[90vh] overflow-y-auto">
        {/* Yuqori qism: Nechanchi o'rinda ekani va sarlavha */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
              <Trophy className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xl sm:text-2xl font-black text-white">Sinov Yakunlandi!</span>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${rankInfo.color}`}>
                  {rankInfo.label}
                </span>
                {stats.difficulty && (
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold border ${
                    stats.difficulty === 'easy'
                      ? 'text-emerald-300 border-emerald-500/40 bg-emerald-950/40'
                      : stats.difficulty === 'medium'
                      ? 'text-amber-300 border-amber-500/40 bg-amber-950/40'
                      : 'text-rose-300 border-rose-500/40 bg-rose-950/40'
                  }`}>
                    {stats.difficulty === 'easy' && '🟢 Oson'}
                    {stats.difficulty === 'medium' && '🟡 Oʻrta'}
                    {stats.difficulty === 'hard' && '🔴 Qiyin'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Jami {totalRacers} ta ishtirokchi orasida <strong className="text-cyan-300">{userRank}-oʻrin</strong>
              </p>
            </div>
          </div>

          <button
            onClick={handleShare}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> : <Share2 className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Nusxalandi!' : 'Ulashish'}</span>
          </button>
        </div>

        {/* 5 TA ASOSIY METRIKALAR BLOKI (Foydalanuvchi talabiga asosan to'liq) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {/* 1. Nechanchi o'rinda ekani */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Egallagan Oʻrni</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono-numbers">
              {userRank} <span className="text-sm font-normal text-slate-400">/ {totalRacers}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {userRank === 1 ? '🥇 Gʻolib boʻldingiz' : `${userRank}-pogʻona`}
            </div>
          </div>

          {/* 2. Yozilgan belgilar va harflar soni */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
              <Keyboard className="w-3.5 h-3.5 text-cyan-400" />
              <span>Yozilgan Belgilar</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono-numbers">
              {stats.totalChars} <span className="text-xs text-slate-400 font-normal">ta</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono-numbers">
              {stats.correctChars} toʻgʻri · {stats.distanceMeters || 100}m
            </div>
          </div>

          {/* 3. Nechta xato qilgani */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Xatolar Soni</span>
            </div>
            <div className={`text-2xl sm:text-3xl font-extrabold font-mono-numbers ${
              stats.incorrectChars === 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {stats.incorrectChars} <span className="text-xs text-slate-500 font-normal">ta</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {stats.incorrectChars === 0 ? '✓ Benuqson' : `${stats.incorrectChars} ta noaniqlik`}
            </div>
          </div>

          {/* 4. Masofani qancha vaqtda bosib o'tgani */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Bosib Oʻtish Vaqti</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono-numbers">
              {stats.timeSeconds.toFixed(1)}s
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono-numbers">
              {stats.distanceMeters || 100}m masofani bosib oʻtdingiz
            </div>
          </div>
        </div>

        {/* 5. O'rtacha samaradorligi (Tezlik WPM va Aniqlik ko'rsatkichi) */}
        <div className="p-4 bg-[#0c1424] border border-cyan-500/30 rounded-xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
              <Zap className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Oʻrtacha Samaradorlik Indeksi</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-cyan-300 font-mono-numbers">
                  {stats.wpm} WPM
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-lg font-bold text-white font-mono-numbers">
                  {stats.accuracy}% Aniqlik
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono-numbers text-slate-400 border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-4 w-full sm:w-auto justify-around sm:justify-start">
            <div>
              <span className="text-slate-500 text-[10px] block">Sof Tezlik (Raw)</span>
              <span className="font-semibold text-slate-200">{stats.rawWpm} WPM</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Bir Maromdalik</span>
              <span className="font-semibold text-slate-200">{stats.consistency}%</span>
            </div>
          </div>
        </div>

        {/* Tezlik dinamikasi grafigi */}
        {stats.wpmHistory.length > 2 && (
          <div className="mb-6 p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-slate-300">Tezlik Dinamikasi Grafigi</span>
              <span className="font-mono-numbers text-cyan-400">Eng yuqori tezlik: {Math.max(...stats.wpmHistory)} WPM</span>
            </div>
            <div className="h-18 flex items-end gap-1.5 pt-2">
              {stats.wpmHistory.map((val, idx) => {
                const max = Math.max(...stats.wpmHistory, 100);
                const heightPct = Math.max(10, (val / max) * 100);
                return (
                  <div
                    key={idx}
                    className="flex-1 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t hover:bg-cyan-300 transition-all relative group"
                    style={{ height: `${heightPct}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-slate-950 border border-slate-700 text-[10px] text-cyan-300 rounded pointer-events-none whitespace-nowrap z-10 font-mono-numbers">
                      {val} WPM
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Guruh poygasi ishtirokchilari natijalari */}
        <div className="mb-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
            Poyga Ishtirokchilarining Oʻrinlari
          </div>
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800/80">
            {sortedRacers.map((racer, index) => (
              <div
                key={racer.id}
                className={`flex items-center justify-between p-2.5 text-xs ${
                  racer.isUser ? 'bg-cyan-950/40 text-cyan-200 font-semibold' : 'text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-5 text-center font-mono-numbers ${
                    index === 0 ? 'text-amber-400 font-bold' : index === 1 ? 'text-slate-300 font-semibold' : 'text-slate-500'
                  }`}>
                    #{index + 1}
                  </span>
                  <span>{racer.avatar}</span>
                  <span>{racer.isUser ? 'Siz (Foydalanuvchi)' : racer.name}</span>
                </div>
                <div className="flex items-center gap-3 font-mono-numbers">
                  <span className="text-cyan-400 font-bold">{Math.round(racer.currentWpm)} WPM</span>
                  <span className="text-slate-500">
                    {racer.finishTimeSeconds ? `${racer.finishTimeSeconds.toFixed(1)}s` : 'Yetmadi'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Boshqaruv tugmalari */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            onClick={onSaveScore}
            disabled={hasSaved}
            className={`w-full sm:w-auto px-4 py-2.5 text-xs font-semibold rounded-xl border transition-all ${
              hasSaved
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400 cursor-default'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
          >
            {hasSaved ? '✓ Guruh reytingiga saqlandi' : 'Peshqadamlar safiga yozish'}
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {isMultiplayer ? (
              isCreator ? (
                <button
                  onClick={onNextRound || onRestart}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-300 hover:to-green-400 rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer animate-pulse"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Keyingi Bosqichni Boshlash (Barcha uchun) 🏁</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 bg-cyan-950/70 border border-cyan-500/40 rounded-xl text-cyan-300 text-xs font-mono font-bold">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>Yaratuvchi keyingi bosqichni boshlashini kuting...</span>
                </div>
              )
            ) : (
              <>
                <button
                  onClick={onRestart}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Qayta Urinish</span>
                </button>
                <button
                  onClick={onNextQuote}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 rounded-xl shadow-md shadow-cyan-500/20 transition-all"
                >
                  <span>Keyingi Matn</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
            {isMultiplayer && (
              <button
                onClick={onRestart}
                className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl"
              >
                Yopish
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
