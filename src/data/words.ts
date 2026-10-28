/**
 * TYPE RACER SO'ZLAR BAZASI
 * Inglizcha (English) va O'zbekcha (Uzbek) so'zlar to'plami.
 * 
 * QAT'IY QOIDA: O'zbek tilidagi ro'yxatda -g', -o' va tutuq belgisi (')
 * mutlaqo qatnashmaydi! Barcha so'zlar toza lotin harflaridan tashkil topgan.
 */

export type GameLanguage = 'uz' | 'en';

// INGLIZCHA OSON VA TEZKOR SO'ZLAR (2-5 harfli)
const EASY_WORDS_EN = [
  // 2-3 harfli
  "the", "be", "to", "of", "and", "a", "in", "it", "for", "not", "on", "he", "as", "you", "do", "at",
  "by", "we", "say", "her", "she", "or", "an", "my", "one", "all", "so", "up", "out", "if", "who",
  "get", "go", "me", "can", "no", "him", "see", "now", "day", "use", "two", "how", "our", "way",
  "new", "any", "day", "us", "run", "car", "red", "big", "win", "top", "fun", "hot", "sun", "sky",
  "air", "sea", "ice", "key", "box", "dog", "cat", "bus", "cup", "pen", "boy", "men", "man", "eye",
  "arm", "leg", "bad", "bed", "fly", "far", "fit", "hit", "job", "joy", "low", "map", "oil", "old",
  "raw", "row", "tax", "tea", "yes", "yet", "fox", "hat", "cap", "bag", "bat", "bit", "cut", "dry",
  "egg", "end", "fan", "few", "gas", "gun", "guy", "kid", "lip", "mix", "net", "pan", "pay", "pet",
  "pie", "pig", "pot", "ray", "rib", "sad", "set", "six", "son", "spy", "tap", "ten", "tie", "tin",
  "tip", "toe", "toy", "war", "wet", "zoo", "bar", "cow", "cry", "dad", "dig", "dot", "ear", "eat",
  // 4 harfli
  "that", "have", "with", "this", "from", "they", "will", "would", "what", "make", "like", "time",
  "just", "know", "take", "into", "year", "your", "good", "some", "them", "than", "then", "look",
  "only", "come", "over", "also", "back", "well", "even", "want", "give", "most", "fast", "race",
  "auto", "cars", "road", "gear", "turn", "park", "jump", "ride", "fuel", "tank", "lane", "line",
  "stop", "move", "pace", "heat", "tire", "apex", "dash", "rush", "zoom", "play", "game", "team",
  "star", "fire", "city", "gold", "free", "life", "easy", "cool", "safe", "nice", "luck", "baby",
  "milk", "food", "best", "open", "walk", "song", "dark", "face", "test", "real", "keep", "help",
  "bird", "fish", "boat", "high", "rock", "head", "rich", "warm", "full", "hard", "pass", "true",
  "love", "self", "town", "word", "form", "land", "farm", "ball", "ring", "care", "card", "view",
  "hold", "rule", "plan", "fact", "past", "unit", "lead", "rest", "mind", "feet", "side", "draw",
  "hope", "drop", "step", "snow", "rain", "hall", "shop", "hill", "wind", "blue", "tree", "moon",
  "door", "room", "book", "home", "hand", "hero", "live", "kind", "feel", "talk", "soon", "body",
  "page", "wish", "mark", "hour", "five", "send", "stay", "deep", "busy", "foot", "gold", "late",
  // 5 harfli poyga va kundalik so'zlar
  "speed", "drive", "track", "shift", "drift", "turbo", "boost", "nitro", "motor", "wheel", "power",
  "sport", "rider", "steer", "racer", "spark", "start", "check", "clean", "fresh", "green", "white",
  "black", "light", "super", "ready", "sound", "smart", "quick", "focus", "clear", "point", "champ",
  "flash", "pilot", "pedal", "brake", "meter", "gauge", "score", "level", "crown", "about", "which",
  "there", "their", "could", "other", "think", "after", "first", "great", "world", "water", "house",
  "place", "right", "small", "every", "found", "still", "learn", "story", "never", "leave", "plant",
  "stand", "night", "state", "close", "under", "while", "press", "study", "since", "build", "earth",
  "happy", "money", "serve", "month", "space", "piece", "heart", "music", "color", "party", "front",
  "river", "voice", "table", "horse", "watch"
];

// O'ZBEKCHA OSON VA TOZA SO'ZLAR (g', o' va tutuq belgisi mutlaqo yo'q)
const RAW_UZBEK_WORDS = [
  // Tabiat va olam
  "suv", "non", "choy", "stol", "kursi", "uy", "shahar", "qishloq", "daryo", "dengiz", "dala", 
  "gul", "daraxt", "osmon", "quyosh", "oy", "yulduz", "bulut", "shamol", "qor", "muz", 
  "bahor", "yoz", "kuz", "qish", "kun", "tun", "tong", "kecha", "vaqt", "soat", "daqiqa", 
  "soniya", "qum", "tosh", "tuproq", "gil", "chashma", "buloq", "quduq", "hovuz", "favvora", 
  "ariq", "kanal", "nur", "chiroq", "sham", "olov", "gulxan", "otash",
  
  // Odamlar, oila va do'stlik
  "inson", "odam", "bola", "ona", "ota", "aka", "uka", "opa", "singil", "dost", "yoldosh", 
  "mehmon", "yurak", "jon", "tana", "bosh", "peshana", "qosh", "kiprik", "til", "tish", 
  "qol", "oyoq", "barmoq", "yuz", "chehra", "ovoz", "kulgu", "tabassum", "salomatlik", 
  "mehr", "hurmat", "sadoqat", "vafo", "haqiqat", "adolat", "vijdon", "nomus", "sharaf",
  
  // Poyga, tezlik va avtomobil
  "mashina", "poyga", "tezlik", "harakat", "shiddat", "kuch", "quvvat", "trassa", "start", 
  "finish", "marra", "rekord", "chempion", "yutuq", "uchqur", "chaqqon", "epchil", "tayyor", 
  "birinchi", "peshqadam", "rul", "motor", "shina", "tormoz", "pedal", "gaz", "chiroqlar", 
  "yol", "ravon", "tekis", "burilish", "masofa", "metr", "kilometr", "qadam", "marom",
  
  // Ta'lim, fan va madaniyat
  "kitob", "qalam", "daftar", "maktab", "dars", "ustoz", "talaba", "sinf", "doska", "parta", 
  "xona", "bino", "eshik", "deraza", "xat", "kitobxona", "ilm", "bilim", "aql", "fikr", 
  "saboq", "tarix", "til", "adabiyot", "navo", "kuy", "musiqa", "dutor", "tanbur", "nay", 
  "doira", "rubob", "chang", "qonun", "teatr", "sahna", "rassom", "surat", "tasvir", 
  "ertak", "doston", "rivoyat", "afsona", "maqol", "hikmat", "ibrat",
  
  // Sifatlar va holat
  "katta", "kichik", "uzun", "qisqa", "keng", "tor", "baland", "past", "chuqur", "tez", 
  "sekin", "oson", "qulay", "yaxshi", "yangi", "eski", "qadimiy", "zamonaviy", "chiroyli", 
  "toza", "ozoda", "ochiq", "yopiq", "ravshan", "tiniq", "silliq", "issiq", "sovuq", 
  "iliq", "shirin", "achchiq", "tinch", "osuda", "orom", "xavfsiz", "mustahkam", "mustaqil", 
  "ozod", "erkin", "botir", "jasur", "mard", "saxiy", "kamtar", "samimiy", "muloyim", 
  "shodlik", "quvonch", "baxt", "omad", "orzu", "umid", "maqsad", "muhim", "zarur", "foydali",
  
  // Ranglar va moddalar
  "oq", "qora", "qizil", "yashil", "sariq", "pushti", "binafsha", "jigarrang", "kulrang", 
  "zarhal", "yaltiroq", "oltin", "kumush", "temir", "mis", "olmos", "javohir", "marjon", "ipak",
  
  // Mevalar va taomlar
  "olma", "nok", "shaftoli", "anjir", "uzum", "anor", "olcha", "gilos", "behi", "tut", 
  "tarvuz", "qovun", "bodom", "pista", "sabzi", "piyoz", "kartoshka", "pomidor", "bodring", 
  "qalampir", "sarimsoq", "shivit", "kashnich", "rayhon", "yalpiz", "sedana", "zira", 
  "taom", "osh", "manti", "somsa", "tandir", "halva", "asal", "shakar", "qand", "novvot", 
  "dasturxon", "piyola", "choynak", "samovar", "qozon", "tovoq", "kosa", "qoshiq", "pichoq", "lagan",
  
  // Kasb-hunar va shahar
  "xalq", "el", "vatan", "yurt", "millat", "bayram", "ish", "mehnat", "kasb", "hunar", 
  "ustaxona", "zavod", "sanoat", "bozor", "savdo", "narx", "pul", "som", "tanga", "hisob", 
  "raqam", "sanash", "baho", "oshpaz", "nonvoy", "duradgor", "temirchi", "haydovchi", 
  "uchuvchi", "shifokor", "hamshira", "muhandis", "quruvchi", "dehqon", "bogbon", "choapon",
  
  // Matn, yozuv va yo'nalish
  "harf", "jumla", "gap", "matn", "satr", "sahifa", "varaqa", "ruchka", "siyoh", "chizgich", 
  "xarita", "globus", "atlas", "kompas", "tomon", "shimol", "janub", "sharq", "markaz", 
  "hudud", "maydon", "park", "xiyobon", "gulzor", "yuqori", "quyi", "ichkari", "tashqari", 
  "yaqin", "uzoq"
];

// O'zbekcha so'zlarni qat'iy tekshiruvdan o'tkazamiz (har qanday g', o', tutuq belgisi chiqib ketsa darhol filtrlanadi)
export const UZBEK_WORDS: string[] = Array.from(
  new Set(
    RAW_UZBEK_WORDS
      .map(w => w.trim().toLowerCase())
      .filter(w => {
        // Faqat standart a-z lotin harflari, hech qanday tutuq belgisi yoki apostrof bo'lmasligi shart
        if (!/^[a-z]+$/.test(w)) return false;
        // Mutlaqo g' yoki o' qatnashmasin
        if (w.includes("'") || w.includes("’") || w.includes("‘") || w.includes("ʻ") || w.includes("ʼ") || w.includes("`")) {
          return false;
        }
        return true;
      })
  )
);

export const ENGLISH_WORDS: string[] = Array.from(new Set(EASY_WORDS_EN));

/**
 * Berilgan til bo'yicha tasodifiy so'zlar ro'yxatini hosil qiladi.
 * @param count - generatsiya qilinadigan so'zlar soni
 * @param lang - 'uz' (O'zbekcha) yoki 'en' (Inglizcha)
 */
export function generate5000Words(count: number = 5000, lang: GameLanguage = 'uz'): string[] {
  const dictionary = lang === 'uz' ? UZBEK_WORDS : ENGLISH_WORDS;
  const result: string[] = [];
  const len = dictionary.length;
  const targetCount = Math.max(1, count);

  for (let i = 0; i < targetCount; i++) {
    const randomIndex = Math.floor(Math.random() * len);
    result.push(dictionary[randomIndex]);
  }
  return result;
}
