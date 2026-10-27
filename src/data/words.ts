/**
 * Oson va qulay so'zlar to'plami.
 * Barcha so'zlar qisqa (2-5 ta harf), oddiy, oson yoziladigan va mashhur so'zlardan tashkil topgan.
 * Murakkab, uzun va chalkash so'zlar olib tashlangan.
 */

const EASY_WORDS = [
  // 1. Eng ommabop va juda oson so'zlar (2-3 harfli)
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

  // 2. Oson va tez yoziladigan 4 harfli so'zlar
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

  // 3. Qulay poyga va avtomobil mavzusidagi 4-5 harfli so'zlar
  "speed", "drive", "track", "shift", "drift", "turbo", "boost", "nitro", "motor", "wheel", "power",
  "sport", "rider", "steer", "racer", "spark", "start", "check", "clean", "fresh", "green", "white",
  "black", "light", "super", "ready", "sound", "smart", "quick", "focus", "clear", "point", "champ",
  "flash", "drive", "pilot", "pedal", "clutch", "brake", "meter", "gauge", "score", "level", "crown",

  // 4. Kundalik mashhur 5 harfli oson so'zlar
  "about", "which", "there", "their", "could", "other", "think", "after", "first", "great", "world",
  "water", "house", "place", "right", "small", "every", "found", "still", "learn", "story", "never",
  "leave", "plant", "stand", "start", "night", "state", "close", "under", "story", "while", "press",
  "study", "since", "build", "earth", "stand", "happy", "money", "serve", "month", "space", "piece",
  "heart", "music", "color", "party", "front", "river", "voice", "stand", "table", "horse", "watch"
];

/**
 * Tasodifiy oson so'zlar ro'yxatini hosil qiladi
 */
export function generate5000Words(count: number = 5000): string[] {
  const result: string[] = [];
  const len = EASY_WORDS.length;
  const targetCount = Math.max(1, count);
  for (let i = 0; i < targetCount; i++) {
    const randomIndex = Math.floor(Math.random() * len);
    result.push(EASY_WORDS[randomIndex]);
  }
  return result;
}
