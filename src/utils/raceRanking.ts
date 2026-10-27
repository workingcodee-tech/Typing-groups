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
      if (a.finishRank && b.finishRank && a.finishRank !== b.finishRank) {
        return a.finishRank - b.finishRank;
      }
      const aTime = a.finishTime ?? a.finishTimeSeconds ?? (a.finishedAt ? a.finishedAt / 1000 : 999999);
      const bTime = b.finishTime ?? b.finishTimeSeconds ?? (b.finishedAt ? b.finishedAt / 1000 : 999999);
      if (Math.abs(aTime - bTime) > 0.05) {
        return aTime - bTime;
      }
      if (a.finishedAt && b.finishedAt && a.finishedAt !== b.finishedAt) {
        return a.finishedAt - b.finishedAt;
      }
      return (b.currentWpm || 0) - (a.currentWpm || 0);
    }

    // 3. Ikkisi ham poygada davom etmoqda:
    const aProg = a.progress || 0;
    const bProg = b.progress || 0;
    if (Math.abs(bProg - aProg) > 0.01) {
      return bProg - aProg;
    }

    return (b.currentWpm || 0) - (a.currentWpm || 0);
  });
}
