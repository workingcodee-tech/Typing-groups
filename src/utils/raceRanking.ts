export interface RankableRacer {
  id: string;
  name: string;
  isUser?: boolean;
  progress: number;
  currentWpm: number;
  finished: boolean;
  finishTime?: number;
  finishTimeSeconds?: number;
  finishedAt?: number;
  finishRank?: number;
  [key: string]: any;
}

/**
 * Aniq poyga o'rinlarini aniqlash (1-o'rin, 2-o'rin, 3-o'rin...):
 * 1. Marragacha 100% yetib kelganlar (finished) doimo hali marraga yetmaganlardan ustun turadi!
 * 2. Agar ikkalasi ham marraga yetgan bo'lsa:
 *    - Avval finishRank (kim birinchi marraga borgani tartib raqami)
 *    - Keyin finishTime / finishTimeSeconds (soniya qancha kam bo'lsa, shuncha yuqori o'rin)
 *    - Keyin finishedAt (finish qayd etilgan millisoniya)
 *    - Agar teng bo'lsa, WPM tezligi
 * 3. Agar ikkalasi ham marraga yetmagan bo'lsa:
 *    - Qancha ko'p masofa/progress bosgan bo'lsa, o'sha oldinda (masalan, 75% vs 40%)
 *    - Masofa bir xil bo'lsa, joriy WPM tezligi yuqoriroq bo'lgani oldinda
 */
export function sortRacersByRank<T extends RankableRacer>(racers: T[]): T[] {
  return [...racers].sort((a, b) => {
    const aFin = !!a.finished;
    const bFin = !!b.finished;

    // 1. Marraga yetganlar yetmaganlardan doim ustun
    if (aFin !== bFin) {
      return aFin ? -1 : 1;
    }

    // 2. Ikkisi ham marraga yetgan bo'lsa:
    if (aFin && bFin) {
      // a) Eng kam sarflangan vaqt bo'yicha (soniyalarda, masalan: 18.42s vs 19.10s)
      const aTime = typeof a.finishTimeSeconds === 'number' ? a.finishTimeSeconds : (typeof a.finishTime === 'number' ? a.finishTime : 999999);
      const bTime = typeof b.finishTimeSeconds === 'number' ? b.finishTimeSeconds : (typeof b.finishTime === 'number' ? b.finishTime : 999999);
      if (Math.abs(aTime - bTime) >= 0.01) {
        return aTime - bTime;
      }

      // b) Millisekundlik marra vaqti (kim avvalroq marraga yetgan bo'lsa)
      const aMs = a.finishedAtMs ?? a.finishedAt ?? 9999999999999;
      const bMs = b.finishedAtMs ?? b.finishedAt ?? 9999999999999;
      if (aMs !== bMs) {
        return aMs - bMs;
      }

      // c) Agar vaqtlar mutlaqo teng bo'lsa: WPM yuqori bo'lgani oldinda
      if ((b.currentWpm || 0) !== (a.currentWpm || 0)) {
        return (b.currentWpm || 0) - (a.currentWpm || 0);
      }

      // d) Durangni oldini olish uchun (ID bo'yicha yagona barqaror tartib)
      return (a.id || '').localeCompare(b.id || '');
    }

    // 3. Ikkisi ham poygada davom etmoqda:
    const aProg = a.progress || 0;
    const bProg = b.progress || 0;
    if (Math.abs(bProg - aProg) >= 0.05) {
      return bProg - aProg;
    }

    return (b.currentWpm || 0) - (a.currentWpm || 0);
  });
}
