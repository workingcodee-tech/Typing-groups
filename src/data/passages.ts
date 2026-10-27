import { Quote, TypeGroup } from '../types';

export const INITIAL_QUOTES: Quote[] = [
  {
    id: 'quote-uz-1',
    text: 'Tez va aniq yozish — fikrni dasturiy taʼminotga, yorqin gʻoyalarni esa amaliy natijalarga aylantiruvchi zamonaviy mahoratdir.',
    source: 'WORKING CODE Dasturlash Manifesti',
    category: 'tech',
    difficulty: 'easy'
  },
  {
    id: 'quote-uz-2',
    text: 'Ilm izlagan kishi vaqtni qadrlaydi. Har bir bosilgan tugma ortida aniqlik, eʼtibor va yuksak intizom mujassam boʻlishi lozim.',
    source: 'Sharq Donishmandlari Hikmatlari',
    category: 'philosophy',
    difficulty: 'easy'
  },
  {
    id: 'quote-uz-3',
    text: 'Oddiylik — ishonchlilikning eng asosiy garovidir. Murakkab tizimlar doimo eng kutilmagan nuqtada pand beradi.',
    source: 'Edsger V. Deykstra',
    category: 'programming',
    difficulty: 'medium'
  },
  {
    id: 'quote-uz-4',
    text: 'Har qanday inson kompyuter tushunadigan kod yoza oladi. Haqiqiy mohir dasturchilar esa insonlar oson tushunadigan toza kod yozadilar.',
    source: 'Martin Fauler',
    category: 'programming',
    difficulty: 'medium'
  },
  {
    id: 'quote-uz-5',
    text: 'Klaviatura tugmalarining mayin ovozi ostida barmoqlar shiddat bilan harakatlanib, xayoldagi fikrlarni cheksiz satrlarga muhrlaydi.',
    source: 'Mexanik Klaviaturachilar Klubi',
    category: 'speed_drill',
    difficulty: 'medium'
  },
  {
    id: 'quote-uz-6',
    text: 'Oʻzbek tilining boy soʻz xazinasi va uning ohangdorligi yozuvda oʻzgacha bir goʻzallik hamda tezkor ifodani talab etadi.',
    source: 'Adabiyot va Maʼnaviyat',
    category: 'literature',
    difficulty: 'medium'
  },
  {
    id: 'quote-uz-7',
    text: 'const hisoblaTezlik = (belgilar: number, soniya: number): number => Math.round((belgilar / 5) / (soniya / 60));',
    source: 'Type Groups Algoritmi v1.0',
    category: 'programming',
    difficulty: 'hard'
  },
  {
    id: 'quote-uz-8',
    text: 'Jamoaviy poygalarda qatnashish shaxsiy rekordlarni yangilashga turtki beradi. Birlashgan harakat hamisha yuqori samara keltiradi.',
    source: 'Type Groups Jamoaviy Mashgʻulotlar',
    category: 'tech',
    difficulty: 'easy'
  },
  {
    id: 'quote-uz-9',
    text: 'Har bir xatodan toʻgʻri xulosa chiqarish tezlikni oshirishning yagona yoʻlidir. Sekin boshlab, benuqson yozishni odat qiling.',
    source: 'Tez Yozuv Qoʻllanmasi',
    category: 'speed_drill',
    difficulty: 'easy'
  },
  {
    id: 'quote-uz-10',
    text: 'function poygaBoshla(guruhNomi: string): boolean { return guruhNomi.length > 0 && true; }',
    source: 'TypeScript Dasturchi Mashqi',
    category: 'programming',
    difficulty: 'hard'
  }
];

export const INITIAL_GROUPS: TypeGroup[] = [
  {
    id: 'group-wc',
    name: 'WORKING CODE Asosiy Jamoa',
    tag: 'WC-UZ',
    description: 'Type Groups platformasining rasmiy muhandislar jamoasi. Yuqori samaradorlik va tezkor yozuv sanʼati.',
    membersCount: 428,
    totalWords: 384020,
    avgWpm: 94.6,
    weeklyRank: 1,
    isJoined: true,
    themeColor: '#00E5FF',
    foundedBy: 'WORKING CODE',
    createdAt: '2026-01-15'
  },
  {
    id: 'group-elite',
    name: '120+ WPM Elita Klubi',
    tag: 'SHIDDAT',
    description: 'Oʻzbekistondagi eng chaqqon typistlar va global poyga rekordchilari toʻplangan yuksak doira.',
    membersCount: 312,
    totalWords: 520410,
    avgWpm: 124.2,
    weeklyRank: 2,
    isJoined: false,
    themeColor: '#38BDF8',
    foundedBy: 'TezkorQoʻllar',
    createdAt: '2026-02-01'
  },
  {
    id: 'group-clack',
    name: 'Mexanik Klaviatura Ixlosmandlari',
    tag: 'THOCK',
    description: 'Maxsus mexanik klaviatura, qulay switchlar va tiniq akustik tovush bilan yozuvchi jamoa.',
    membersCount: 785,
    totalWords: 649100,
    avgWpm: 82.4,
    weeklyRank: 3,
    isJoined: false,
    themeColor: '#0A84FF',
    foundedBy: 'Klaviaturachi',
    createdAt: '2026-01-20'
  },
  {
    id: 'group-coders',
    name: 'Tungi Dasturchilar Ligasi',
    tag: 'DEV-UZ',
    description: 'Dasturlash sintaksisi, jingalak qavslar va kod satrlarini soniyasiga teruvchi frontendchilar.',
    membersCount: 540,
    totalWords: 412800,
    avgWpm: 88.1,
    weeklyRank: 4,
    isJoined: false,
    themeColor: '#06B6D4',
    foundedBy: 'AsyncCoder',
    createdAt: '2026-02-14'
  },
  {
    id: 'group-zen',
    name: '100% Benuqson Aniqlik Jamiyati',
    tag: 'ANIQLIK',
    description: 'Orqaga oʻchirishsiz (Backspace-siz), sokin marom va 100% aniqlik bilan yozuvchi mahorat egalari.',
    membersCount: 290,
    totalWords: 245900,
    avgWpm: 79.5,
    weeklyRank: 5,
    isJoined: false,
    themeColor: '#60A5FA',
    foundedBy: 'XatosizYoz',
    createdAt: '2026-03-01'
  }
];

export const INITIAL_LEADERBOARD = [
  { id: 'lb-1', rank: 1, username: 'Shiddatkor', wpm: 168, accuracy: 99.4, groupTag: 'SHIDDAT', mode: '60s Sprint', date: 'Bugun' },
  { id: 'lb-2', rank: 2, username: 'WorkingCoder_Uz', wpm: 154, accuracy: 98.9, groupTag: 'WC-UZ', mode: '60s Sprint', date: 'Bugun' },
  { id: 'lb-3', rank: 3, username: 'ChaqqonBarmoq', wpm: 147, accuracy: 99.1, groupTag: 'SHIDDAT', mode: '60s Sprint', date: 'Bugun' },
  { id: 'lb-4', rank: 4, username: 'MoviySwitch', wpm: 139, accuracy: 97.8, groupTag: 'THOCK', mode: 'Matn', date: 'Kecha' },
  { id: 'lb-5', rank: 5, username: 'TozaKod', wpm: 134, accuracy: 100.0, groupTag: 'DEV-UZ', mode: 'Kod', date: 'Kecha' },
  { id: 'lb-6', rank: 6, username: 'XatosizTypist', wpm: 129, accuracy: 100.0, groupTag: 'ANIQLIK', mode: '60s Sprint', date: '2 kun oldin' },
  { id: 'lb-7', rank: 7, username: 'Tezkor_99', wpm: 126, accuracy: 96.5, groupTag: 'SHIDDAT', mode: '30s Blits', date: '3 kun oldin' },
  { id: 'lb-8', rank: 8, username: 'NeonYozuvchi', wpm: 122, accuracy: 98.2, groupTag: 'WC-UZ', mode: 'Matn', date: '3 kun oldin' }
];

export const BOT_RACERS = [
  { name: 'Chaqmoq_Bot', avatar: '⚡', targetWpm: 88, color: '#00E5FF' },
  { name: 'Poygachi_Raqib', avatar: '🚀', targetWpm: 96, color: '#38BDF8' },
  { name: 'Kiber_Yozuvchi', avatar: '💻', targetWpm: 78, color: '#60A5FA' },
  { name: 'Olovli_Qoʻl', avatar: '🔥', targetWpm: 104, color: '#0A84FF' },
  { name: 'Sokin_Chertki', avatar: '🎯', targetWpm: 82, color: '#22D3EE' }
];
