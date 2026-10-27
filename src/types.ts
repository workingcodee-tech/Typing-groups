export type TypingMode = 'time' | 'words' | 'quote' | 'code' | 'custom';

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  isUser: boolean;
  progress: number; // 0 to 100
  currentWpm: number;
  rawWpm: number;
  accuracy: number;
  finished: boolean;
  finishTimeSeconds?: number;
  rank?: number;
  color: string;
  targetWpm?: number; // for bots
}

export interface TypeGroup {
  id: string;
  name: string;
  tag: string;
  description: string;
  membersCount: number;
  totalWords: number;
  avgWpm: number;
  weeklyRank: number;
  isJoined: boolean;
  themeColor: string;
  foundedBy: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  wpm: number;
  accuracy: number;
  groupTag: string;
  mode: string;
  date: string;
  isUser?: boolean;
}

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface Quote {
  id: string;
  text: string;
  source: string;
  category: 'programming' | 'literature' | 'philosophy' | 'tech' | 'speed_drill';
  difficulty: DifficultyLevel;
}

export interface RaceStats {
  wpm: number;
  rawWpm: number;
  accuracy: number; // o'rtacha samaradorlik (aniqlik %)
  efficiency: number; // kompleks samaradorlik ko'rsatkichi
  correctChars: number; // to'g'ri bosilgan belgilar soni
  incorrectChars: number; // xatolar soni
  totalChars: number; // jami bosilgan belgilar soni
  timeSeconds: number; // qancha vaqtda yozgani (soniyada)
  timeLimitSeconds?: number; // belgilangan vaqt chegarasi (agar tanlangan bo'lsa)
  distanceMeters?: number; // tanlangan poyga masofasi (100m, 500m, 1000m)
  difficulty?: DifficultyLevel; // poyga qiyinlik darajasi (oson, o'rta, qiyin)
  wpmHistory: number[];
  consistency: number; // bir maromdalik
  keystrokes: number; // jami klaviatura bosilishlari
  errorsByChar: Record<string, number>;
  userRank: number; // nechanchi o'rinda ekani
  totalRacers: number; // jami ishtirokchilar soni
}

export interface UserProfile {
  username: string;
  avatar: string;
  joinedGroups: string[];
  bestWpm: number;
  avgWpm: number;
  totalRaces: number;
  totalWordsTyped: number;
  avgAccuracy: number;
  preferredSound: 'blue' | 'brown' | 'red' | 'thock' | 'off';
  showKeyboard: boolean;
  showLiveTrack: boolean;
}
